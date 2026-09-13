import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMailCredentials, createGmailTransporter, getSenderEmail, sendEmail } from "@/lib/mailer";
import { applyMergeTags } from "@/lib/mime";
import { checkSendLimits } from "@/lib/send-limits";
import { generateFollowUpEmail } from "@/lib/followup-generator";
import { humanizeEmail } from "@/lib/humanizer";

export const maxDuration = 300;

export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let bodyData: any = {};
  try {
    bodyData = await req.json();
  } catch {
    // defaults
  }

  const limit = bodyData.limit ? Math.max(1, Math.min(500, Number(bodyData.limit))) : 100;
  const recipientIdsInput: string[] = Array.isArray(bodyData.recipientIds) ? bodyData.recipientIds : [];
  const templateSubject = bodyData.subject || "Re: Following up regarding {brand}";
  const templateBody = bodyData.body || "Hi {name},\n\nI hope you're having a great week!\n\nJust wanted to check in on my previous email regarding {brand}. Please let me know if you'd be open to a quick chat.\n\nBest regards";
  const customFromName = bodyData.fromName ? String(bodyData.fromName).trim() : null;
  const delaySeconds = bodyData.delaySeconds != null ? Math.max(0, Math.min(300, Number(bodyData.delaySeconds))) : 3;
  const useAI = Boolean(bodyData.useAI);
  const customNotes = bodyData.customNotes || "";

  // 1. Identify target recipients
  let targetRecipients = [];
  if (recipientIdsInput.length > 0) {
    targetRecipients = await prisma.recipient.findMany({
      where: {
        id: { in: recipientIdsInput },
        userId: user.id,
      },
    });
  } else {
    // Take top N candidates with oldest lastContactedAt
    targetRecipients = await prisma.recipient.findMany({
      where: { userId: user.id },
      orderBy: [
        { lastContactedAt: "asc" },
        { createdAt: "asc" },
      ],
      take: limit,
    });
  }

  if (targetRecipients.length === 0) {
    return NextResponse.json(
      { error: "No recipients available for follow-up" },
      { status: 400 }
    );
  }

  // 2. Check daily send limit
  const limitCheck = await checkSendLimits(user.id, targetRecipients.length);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: limitCheck.warning,
        sentToday: limitCheck.sentToday,
        remaining: limitCheck.remaining,
      },
      { status: 429 }
    );
  }

  // 3. Prepare SMTP credentials
  let mailCredentials;
  let transporter;
  try {
    mailCredentials = await getMailCredentials(user.id);
    transporter = createGmailTransporter(mailCredentials.email, mailCredentials.pass, 465);
  } catch (error) {
    return NextResponse.json(
      { error: `SMTP Configuration Error: ${error instanceof Error ? error.message : "Please configure your SMTP email and App Password in Settings."}` },
      { status: 400 }
    );
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });

  const senderEmail = mailCredentials.email || (await getSenderEmail(user.id));
  const rawSenderName = customFromName || userProfile?.fullName || user.name || "";
  const senderDisplayName = rawSenderName.trim().replace(/["\r\n]/g, "");
  const fromAddress = senderDisplayName ? `"${senderDisplayName}" <${senderEmail}>` : senderEmail;

  // 4. Create Follow-Up Campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId: user.id,
      subject: templateSubject,
      body: templateBody,
      fromName: customFromName,
      status: "sending",
      totalCount: targetRecipients.length,
      sentCount: 0,
      failedCount: 0,
    },
  });

  let sentCount = 0;
  let failedCount = 0;
  const errors: Array<{ email: string; error: string }> = [];

  // 5. Iterate and send follow-up emails
  for (let i = 0; i < targetRecipients.length; i++) {
    const recipient = targetRecipients[i];
    let finalSubject = templateSubject;
    let finalBody = templateBody;

    if (useAI) {
      try {
        const aiResult = await generateFollowUpEmail(
          {
            id: recipient.id,
            email: recipient.email,
            name: recipient.name,
            company: recipient.company,
          },
          {
            fullName: userProfile?.fullName || user.name || "",
            currentRole: userProfile?.currentRole || "",
            skills: userProfile?.skills || "",
            bio: userProfile?.bio || "",
          },
          customNotes
        );
        finalSubject = aiResult.subject;
        finalBody = aiResult.body;
      } catch {
        // fallback to template merge
      }
    }

    finalSubject = applyMergeTags(finalSubject, {
      email: recipient.email,
      name: recipient.name,
      company: recipient.company,
    });

    finalBody = applyMergeTags(finalBody, {
      email: recipient.email,
      name: recipient.name,
      company: recipient.company,
    });

    if (!finalBody.includes("<p>") && !finalBody.includes("<br>")) {
      finalBody = finalBody.replace(/\n/g, "<br>");
    }

    finalBody = humanizeEmail(finalBody, {
      varyGreetings: !useAI,
      varySignoffs: !useAI,
      insertInvisibleChars: true,
      varyWhitespace: true,
    });

    // Create CampaignEmail record
    const campaignEmail = await prisma.campaignEmail.create({
      data: {
        campaignId: campaign.id,
        recipientId: recipient.id,
        status: "pending",
        customSubject: finalSubject,
        customBody: finalBody,
      },
    });

    try {
      await sendEmail(
        transporter,
        {
          from: fromAddress,
          to: recipient.email,
          subject: finalSubject,
          html: finalBody,
        },
        mailCredentials
      );

      const now = new Date();
      // Mark CampaignEmail sent with exact timestamp
      await prisma.campaignEmail.update({
        where: { id: campaignEmail.id },
        data: { status: "sent", sentAt: now, error: null },
      });

      // Update Recipient's lastContactedAt & increment followUpCount
      await prisma.recipient.update({
        where: { id: recipient.id },
        data: {
          lastContactedAt: now,
          followUpCount: { increment: 1 },
        },
      });

      sentCount++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to send email";
      await prisma.campaignEmail.update({
        where: { id: campaignEmail.id },
        data: { status: "failed", error: errMsg },
      });
      failedCount++;
      errors.push({ email: recipient.email, error: errMsg });
    }

    // Update campaign progress
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { sentCount, failedCount },
    });

    // Delay between sends
    if (i < targetRecipients.length - 1 && delaySeconds > 0) {
      await new Promise((res) => setTimeout(res, delaySeconds * 1000));
    }
  }

  // Finalize campaign
  const finalStatus = failedCount === targetRecipients.length ? "failed" : "completed";
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: finalStatus, sentCount, failedCount },
  });

  return NextResponse.json({
    success: true,
    campaignId: campaign.id,
    totalCount: targetRecipients.length,
    sentCount,
    failedCount,
    errors,
  });
}
