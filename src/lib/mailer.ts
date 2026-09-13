/**
 * Nodemailer SMTP transport for sending emails via Hostinger, Gmail, or Custom SMTP.
 * Each user stores their email credentials (encrypted at rest).
 */

import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import fs from "fs";
import path from "path";
import dns from "dns";

// Force IPv4 lookup by default to prevent ENETUNREACH on IPv6-unrouted networks
try {
  dns.setDefaultResultOrder?.("ipv4first");
} catch {
  // Ignore in older Node environments
}

export interface MailCredentials {
  email: string;
  pass: string;
  provider?: string;
  host?: string;
  port?: number;
}

/**
 * Fetch and decrypt the SMTP credentials for a given user.
 */
export async function getMailCredentials(userId: string): Promise<MailCredentials> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      smtpEmail: true,
      smtpPassword: true,
      smtpProvider: true,
      smtpHost: true,
      smtpPort: true,
    },
  });

  if (!user.smtpEmail || !user.smtpPassword) {
    throw new Error(
      "Email SMTP not configured — please go to Settings and add your Hostinger or Gmail SMTP credentials"
    );
  }

  const decryptedPassword = decrypt(user.smtpPassword).trim().replace(/\s+/g, "");
  const provider = user.smtpProvider || "gmail";
  let host = user.smtpHost?.trim();
  let port = user.smtpPort || 465;

  if (!host) {
    if (provider === "hostinger") {
      host = "smtp.hostinger.com";
    } else {
      host = "smtp.gmail.com";
    }
  }

  return {
    email: user.smtpEmail.trim().toLowerCase(),
    pass: decryptedPassword,
    provider,
    host,
    port,
  };
}

/**
 * Create a Nodemailer transporter for any SMTP server (Hostinger, Gmail, Custom).
 * Supports port 465 (SSL direct) or port 587 (STARTTLS).
 */
export function createSmtpTransporter(
  email: string,
  pass: string,
  host: string = "smtp.gmail.com",
  port: number = 465
): nodemailer.Transporter {
  const isDirectSsl = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isDirectSsl, // true for 465, false for 587
    auth: {
      user: email,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed or proxy TLS verification rejections
      minVersion: "TLSv1.2",
    },
    connectionTimeout: 10000, // 10s timeout
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Create a Nodemailer transporter specifically for Gmail (backward compatibility).
 */
export function createGmailTransporter(
  email: string,
  pass: string,
  port: 465 | 587 = 465
): nodemailer.Transporter {
  return createSmtpTransporter(email, pass, "smtp.gmail.com", port);
}

/**
 * Get an authenticated Nodemailer transport for a given user.
 */
export async function getMailTransport(userId: string): Promise<nodemailer.Transporter> {
  const creds = await getMailCredentials(userId);
  return createSmtpTransporter(creds.email, creds.pass, creds.host || "smtp.gmail.com", creds.port || 465);
}

/**
 * Get the sender email for a given user.
 */
export async function getSenderEmail(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { smtpEmail: true, email: true },
  });

  return user.smtpEmail || user.email;
}

interface SendMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachmentPath?: string | null;
  attachmentName?: string | null;
}

/**
 * Send a single email using Nodemailer with automatic port fallback if initial port is blocked.
 */
export async function sendEmail(
  transporter: nodemailer.Transporter,
  options: SendMailOptions,
  credentials?: MailCredentials
) {
  const mailOptions: Mail.Options = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // Add attachment if provided
  if (options.attachmentPath) {
    if (options.attachmentPath.startsWith("data:")) {
      const commaIdx = options.attachmentPath.indexOf(",");
      if (commaIdx !== -1) {
        const meta = options.attachmentPath.slice(0, commaIdx);
        const base64Data = options.attachmentPath.slice(commaIdx + 1);
        const match = meta.match(/^data:([^;]+)/);
        const contentType = match ? match[1] : "application/pdf";
        const fileName = options.attachmentName || "resume.pdf";
        mailOptions.attachments = [
          {
            filename: fileName,
            content: Buffer.from(base64Data, "base64"),
            contentType,
          },
        ];
      }
    } else {
      let resolvedPath = options.attachmentPath;

      if (!fs.existsSync(resolvedPath)) {
        const cleanPath = options.attachmentPath.startsWith("/")
          ? options.attachmentPath.slice(1)
          : options.attachmentPath;

        const candidates = [
          path.join(process.cwd(), options.attachmentPath),
          path.join(process.cwd(), "public", cleanPath),
          path.join(process.cwd(), cleanPath),
          path.join("/tmp", cleanPath),
          path.join("/tmp", "uploads", path.basename(options.attachmentPath)),
        ];

        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            resolvedPath = candidate;
            break;
          }
        }
      }

      if (fs.existsSync(resolvedPath)) {
        const fileName =
          options.attachmentName || path.basename(resolvedPath);
        mailOptions.attachments = [
          {
            filename: fileName,
            path: resolvedPath,
          },
        ];
      } else {
        console.warn(
          `[SMTP] Attachment path not found on disk: "${options.attachmentPath}"`
        );
      }
    }
  }

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    // If primary port failed and credentials exist, attempt port fallback (e.g. 587 STARTTLS)
    if (credentials) {
      const primaryHost = credentials.host || "smtp.gmail.com";
      const fallbackPort = credentials.port === 465 ? 587 : 465;
      console.warn(
        `[SMTP] Primary send failed (${err instanceof Error ? err.message : String(err)}). Retrying on ${primaryHost}:${fallbackPort}...`
      );
      const fallbackTransporter = createSmtpTransporter(
        credentials.email,
        credentials.pass,
        primaryHost,
        fallbackPort
      );
      return await fallbackTransporter.sendMail(mailOptions);
    }
    throw err;
  }
}

/**
 * Test SMTP connection for a given email, password, host, and port.
 * Tests primary port first, and falls back to secondary port if needed.
 */
export async function testSmtpConnection(
  email: string,
  password: string,
  host?: string,
  port?: number,
  provider?: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim().replace(/\s+/g, "");

  let targetHost = host?.trim();
  if (!targetHost) {
    if (provider === "hostinger") {
      targetHost = "smtp.hostinger.com";
    } else {
      targetHost = "smtp.gmail.com";
    }
  }

  const primaryPort = port || 465;
  const secondaryPort = primaryPort === 465 ? 587 : 465;

  // 1. Try Primary Port (e.g., Port 465 SSL)
  try {
    const transporterPrimary = createSmtpTransporter(cleanEmail, cleanPassword, targetHost, primaryPort);
    await transporterPrimary.verify();
    return { success: true };
  } catch (errPrimary) {
    console.warn(`[SMTP Test] ${targetHost}:${primaryPort} verify failed, trying Port ${secondaryPort}:`, errPrimary);
    
    // 2. Try Secondary Port (e.g., Port 587 STARTTLS)
    try {
      const transporterSecondary = createSmtpTransporter(cleanEmail, cleanPassword, targetHost, secondaryPort);
      await transporterSecondary.verify();
      return { success: true };
    } catch (errSecondary) {
      const errorMsg =
        errSecondary instanceof Error
          ? errSecondary.message
          : `Failed to connect to ${targetHost} SMTP. Please check your credentials.`;
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}
