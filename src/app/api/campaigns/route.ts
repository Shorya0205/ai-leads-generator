import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/campaigns — list all campaigns for the authenticated user.
 */
export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      emails: {
        include: { recipient: true },
        orderBy: { recipient: { email: "asc" } },
      },
    },
  });

  return NextResponse.json(campaigns);
}

/**
 * POST /api/campaigns — create a new campaign.
 * Body: {
 *   subject: string,
 *   body: string,
 *   recipientIds: string[],
 *   attachmentPath?: string,
 *   attachmentName?: string,
 *   customEmails?: { recipientId: string; subject: string; body: string }[]
 * }
 */
export async function POST(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { subject, body, recipientIds: inputRecipientIds, emails: inputEmails, attachmentPath, attachmentName, customEmails, fromName } = data;

  if (!subject || !body) {
    return NextResponse.json(
      { error: "subject and body are required" },
      { status: 400 }
    );
  }

  const recipientIds: string[] = Array.isArray(inputRecipientIds) ? [...inputRecipientIds] : [];

  // If raw emails array was provided, upsert them into Recipient DB
  if (Array.isArray(inputEmails) && inputEmails.length > 0) {
    for (const raw of inputEmails) {
      const emailStr = typeof raw === "string" ? raw.trim().toLowerCase() : raw?.email?.trim().toLowerCase();
      if (emailStr) {
        const name = typeof raw === "object" ? raw.name : null;
        const company = typeof raw === "object" ? raw.company : null;

        const rec = await prisma.recipient.upsert({
          where: {
            userId_email: {
              userId: user.id,
              email: emailStr,
            },
          },
          update: {
            ...(name ? { name } : {}),
            ...(company ? { company } : {}),
          },
          create: {
            email: emailStr,
            name: name || null,
            company: company || null,
            userId: user.id,
          },
        });
        if (!recipientIds.includes(rec.id)) {
          recipientIds.push(rec.id);
        }
      }
    }
  }

  if (recipientIds.length === 0) {
    return NextResponse.json(
      { error: "No valid recipientIds or emails provided" },
      { status: 400 }
    );
  }

  // Map custom emails if provided
  const customMap = new Map<string, { subject: string; body: string }>();
  if (Array.isArray(customEmails)) {
    for (const item of customEmails) {
      if (item.recipientId) {
        customMap.set(item.recipientId, {
          subject: item.subject,
          body: item.body,
        });
      }
    }
  }

  // Verify all recipients belong to this user
  const recipients = await prisma.recipient.findMany({
    where: {
      id: { in: recipientIds },
      userId: user.id,
    },
  });

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No valid recipients found" },
      { status: 400 }
    );
  }

  // Create campaign with campaign emails
  const campaign = await prisma.campaign.create({
    data: {
      subject,
      body,
      fromName: fromName ? String(fromName).trim() : null,
      attachmentPath: attachmentPath || null,
      attachmentName: attachmentName || null,
      status: "draft",
      totalCount: recipients.length,
      userId: user.id,
      emails: {
        create: recipients.map((r) => {
          const custom = customMap.get(r.id);
          return {
            recipientId: r.id,
            status: "pending",
            customSubject: custom?.subject || null,
            customBody: custom?.body || null,
          };
        }),
      },
    },
    include: {
      emails: {
        include: { recipient: true },
      },
    },
  });

  return NextResponse.json(campaign);
}
