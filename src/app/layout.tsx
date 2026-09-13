import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { checkEnvOrWarn } from "@/lib/env";
import "./globals.css";

// Validate environment variables at server startup
checkEnvOrWarn();

export const metadata: Metadata = {
  title: {
    default: "ReachOut — Smart AI-Powered Outreach Tool",
    template: "%s | ReachOut",
  },
  description:
    "Send AI-personalized outreach emails with your resume attached, individually to every person in your list. Powered by Gmail SMTP.",
  keywords: [
    "cold email",
    "outreach",
    "AI email",
    "internship outreach",
    "job applications",
    "Gmail SMTP",
    "personalized emails",
  ],
  authors: [{ name: "ReachOut" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ReachOut",
    title: "ReachOut — Smart AI-Powered Outreach Tool",
    description:
      "Send hyper-personalized cold outreach emails tailored per company domain — straight from your Gmail with your resume attached.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReachOut — Smart AI-Powered Outreach Tool",
    description:
      "Send hyper-personalized cold outreach emails tailored per company domain.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}