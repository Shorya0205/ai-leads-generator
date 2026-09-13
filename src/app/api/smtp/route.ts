import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

/**
 * GET /api/smtp — get current SMTP configuration status
 */
export async function GET() {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      smtpEmail: user.smtpEmail || null,
      hasPassword: !!user.smtpPassword,
      smtpProvider: user.smtpProvider || "gmail",
      smtpHost: user.smtpHost || null,
      smtpPort: user.smtpPort || null,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/**
 * POST /api/smtp — save SMTP credentials (provider, email, app password, host, port)
 * Body: { email: string, password?: string, provider?: string, host?: string, port?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, password, provider = "gmail", host, port } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { smtpPassword: true },
    });

    if (!password && !dbUser?.smtpPassword) {
      return NextResponse.json(
        { error: "Password is required for SMTP connection" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const defaultHost = provider === "hostinger" ? "smtp.hostinger.com" : provider === "gmail" ? "smtp.gmail.com" : "";

    const updateData: {
      smtpEmail: string;
      smtpProvider: string;
      smtpHost: string;
      smtpPort: number;
      smtpPassword?: string;
    } = {
      smtpEmail: cleanEmail,
      smtpProvider: provider,
      smtpHost: host && host.trim() !== "" ? host.trim() : defaultHost,
      smtpPort: port ? Number(port) : 465,
    };

    if (password && password.trim() !== "") {
      const cleanPassword = password.trim().replace(/\s+/g, "");
      updateData.smtpPassword = encrypt(cleanPassword);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SMTP API] Error saving config:", error);
    return NextResponse.json(
      { error: "Failed to save SMTP configuration" },
      { status: 500 }
    );
  }
}
