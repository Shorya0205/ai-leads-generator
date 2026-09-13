"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Briefcase,
  Globe,
  Link2,
  Code2,
  Server,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProviderType = "hostinger" | "gmail" | "custom";

function Section({
  title,
  icon,
  description,
  children,
  onSave,
  saving,
}: {
  title: string;
  icon: ReactNode;
  description: string;
  children: ReactNode;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <section className="surface p-8 space-y-6">
      <div className="flex min-w-0 items-center justify-between border-b border-border pb-5">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">{children}</div>

      {onSave && (
        <div className="flex justify-end pt-3">
          <Button
            onClick={onSave}
            disabled={saving}
            className="gradient-accent text-primary-foreground h-12 px-6 text-sm font-bold rounded-2xl hover:opacity-90 shadow-md"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      )}
    </section>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  // SMTP state
  const [provider, setProvider] = useState<ProviderType>("hostinger");
  const [smtpEmail, setSmtpEmail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.hostinger.com");
  const [smtpPort, setSmtpPort] = useState<number>(465);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [hasExistingSmtp, setHasExistingSmtp] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile state
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    currentRole: "",
    skills: "",
    bio: "",
    targetRoles: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    defaultGoal: "internship",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, smtpRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/smtp"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile({
            fullName: data.fullName || "",
            currentRole: data.currentRole || "",
            skills: data.skills || "",
            bio: data.bio || "",
            targetRoles: data.targetRoles || "",
            portfolioUrl: data.portfolioUrl || "",
            linkedinUrl: data.linkedinUrl || "",
            githubUrl: data.githubUrl || "",
            defaultGoal: data.defaultGoal || "internship",
          });
        }

        if (smtpRes.ok) {
          const sData = await smtpRes.json();
          if (sData.smtpEmail) {
            setSmtpEmail(sData.smtpEmail);
            setHasExistingSmtp(sData.hasPassword);
            const savedProvider = (sData.smtpProvider as ProviderType) || "hostinger";
            setProvider(savedProvider);
            setSmtpHost(
              sData.smtpHost || (savedProvider === "hostinger" ? "smtp.hostinger.com" : "smtp.gmail.com")
            );
            setSmtpPort(sData.smtpPort || 465);
          }
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProviderSelect = (p: ProviderType) => {
    setProvider(p);
    if (p === "hostinger") {
      setSmtpHost("smtp.hostinger.com");
      setSmtpPort(465);
    } else if (p === "gmail") {
      setSmtpHost("smtp.gmail.com");
      setSmtpPort(465);
    }
  };

  const handleTestSmtp = async () => {
    if (!smtpEmail) {
      toast.error("Enter your Email address to test");
      return;
    }
    if (!smtpPassword && !hasExistingSmtp) {
      toast.error("Enter your password to test connection");
      return;
    }

    setTestingSmtp(true);
    try {
      const res = await fetch("/api/smtp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: smtpEmail,
          password: smtpPassword,
          provider,
          host: smtpHost,
          port: smtpPort,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`✅ ${provider === "hostinger" ? "Hostinger" : provider === "gmail" ? "Gmail" : "SMTP"} connection successful!`);
      } else {
        toast.error(data.error || "Connection failed — check your email credentials");
      }
    } catch {
      toast.error("Failed to test connection");
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSaveSmtp = async () => {
    if (!smtpEmail) {
      toast.error("Enter your Email address");
      return;
    }
    if (!smtpPassword && !hasExistingSmtp) {
      toast.error("Enter your Password");
      return;
    }

    setSavingSmtp(true);
    try {
      const res = await fetch("/api/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: smtpEmail,
          password: smtpPassword,
          provider,
          host: smtpHost,
          port: smtpPort,
        }),
      });

      if (res.ok) {
        setHasExistingSmtp(true);
        setSmtpPassword("");
        toast.success(`${provider === "hostinger" ? "Hostinger Mail" : provider === "gmail" ? "Gmail" : "SMTP"} credentials encrypted and saved! 🔒`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save SMTP config");
      }
    } catch {
      toast.error("Failed to save SMTP config");
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        toast.success("Profile saved! AI will use this to draft emails.");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save profile");
      }
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-5xl">
      <PageHeader
        title="Settings"
        description="Configure Hostinger Email, Gmail, or Custom SMTP sending and your AI personalization profile."
      />

      <div className="grid gap-8">
        {/* Email Provider & SMTP Configuration */}
        <Section
          title="Email Connection &amp; SMTP Setup"
          description="Connect your Hostinger Webmail, Gmail, or Custom SMTP to send cold outreach emails."
          icon={<Server className="h-5 w-5" />}
        >
          {hasExistingSmtp && (
            <div className="flex items-center gap-3 rounded-2xl bg-success/10 border border-success/20 p-4 text-sm text-success font-bold">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>
                {provider === "hostinger"
                  ? "Hostinger Mail"
                  : provider === "gmail"
                  ? "Gmail SMTP"
                  : "Custom SMTP"}{" "}
                is connected and ready to send.
              </span>
            </div>
          )}

          {/* Provider Selection Tabs */}
          <div className="space-y-3">
            <Label className="text-sm font-bold">Select Email Provider</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Hostinger Card */}
              <button
                type="button"
                onClick={() => handleProviderSelect("hostinger")}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${
                  provider === "hostinger"
                    ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                    : "border-border bg-card/50 hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-base flex items-center gap-2">
                    <Server className="h-5 w-5 text-violet" /> Hostinger Mail
                  </span>
                  {provider === "hostinger" && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect using your Hostinger domain email &amp; password.
                </p>
              </button>

              {/* Gmail Card */}
              <button
                type="button"
                onClick={() => handleProviderSelect("gmail")}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${
                  provider === "gmail"
                    ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                    : "border-border bg-card/50 hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-base flex items-center gap-2">
                    <Mail className="h-5 w-5 text-rose-500" /> Gmail
                  </span>
                  {provider === "gmail" && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect via Google 16-character App Password.
                </p>
              </button>

              {/* Custom SMTP Card */}
              <button
                type="button"
                onClick={() => handleProviderSelect("custom")}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${
                  provider === "custom"
                    ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                    : "border-border bg-card/50 hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-base flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" /> Custom SMTP
                  </span>
                  {provider === "custom" && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Zoho, Mailgun, Outlook, or private SMTP server.
                </p>
              </button>
            </div>
          </div>

          {/* Form Fields depending on selected provider */}
          <div className="grid gap-5 sm:grid-cols-2 pt-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-email" className="text-sm font-bold">
                {provider === "hostinger"
                  ? "Hostinger Email Address"
                  : provider === "gmail"
                  ? "Gmail Address"
                  : "SMTP Email / Username"}
              </Label>
              <Input
                id="smtp-email"
                type="email"
                placeholder={
                  provider === "hostinger"
                    ? "info@yourdomain.com"
                    : provider === "gmail"
                    ? "your.email@gmail.com"
                    : "user@domain.com"
                }
                value={smtpEmail}
                onChange={(e) => setSmtpEmail(e.target.value)}
                className="h-12 text-base rounded-2xl font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-pass" className="text-sm font-bold">
                {provider === "gmail" ? "16-Character App Password" : "Email Password"}
                {hasExistingSmtp && (
                  <span className="text-xs text-muted-foreground ml-2 font-normal">
                    (leave blank to keep current)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="smtp-pass"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    hasExistingSmtp
                      ? "••••••••••••••••"
                      : provider === "gmail"
                      ? "abcd efgh ijkl mnop"
                      : "Hostinger Email Password"
                  }
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  className="pr-12 h-12 text-base rounded-2xl font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Host & Port Options */}
          <div className="border-t border-border/60 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAdvanced ? "Hide Advanced Host &amp; Port Settings" : "Show Advanced Host &amp; Port Settings"}
            </button>

            {showAdvanced && (
              <div className="grid gap-5 sm:grid-cols-2 mt-4 p-4 rounded-2xl bg-secondary/20 border border-border">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host" className="text-xs font-bold">
                    SMTP Host / Server
                  </Label>
                  <Input
                    id="smtp-host"
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.hostinger.com"
                    className="h-10 text-sm rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port" className="text-xs font-bold">
                    SMTP Port (SSL: 465, TLS: 587)
                  </Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    placeholder="465"
                    className="h-10 text-sm rounded-xl font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test & Save Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestSmtp}
              disabled={testingSmtp || !smtpEmail}
              className="h-11 px-5 text-sm font-bold rounded-2xl border-border"
            >
              {testingSmtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Test Connection
            </Button>
            <Button
              type="button"
              onClick={handleSaveSmtp}
              disabled={savingSmtp || !smtpEmail}
              className="gradient-accent text-primary-foreground h-11 px-6 text-sm font-bold rounded-2xl hover:opacity-90 shadow-md"
            >
              {savingSmtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Save Connection Credentials
            </Button>
          </div>

          {/* Setup Instructions Card */}
          <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            {provider === "hostinger" && (
              <>
                <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-violet" /> How to connect Hostinger Email:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Enter your full Hostinger email address (e.g., <code>info@yourdomain.com</code>).</li>
                  <li>Enter the password you created for this email in Hostinger <strong>hPanel → Emails</strong>.</li>
                  <li>Hostinger SMTP Host is pre-configured to <code>smtp.hostinger.com</code> (Port 465 SSL / 587 TLS).</li>
                  <li>Click <strong>Test Connection</strong> to verify, then click <strong>Save Connection Credentials</strong>.</li>
                </ol>
              </>
            )}

            {provider === "gmail" && (
              <>
                <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-rose-500" /> How to get a Gmail App Password:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Turn ON <strong>2-Step Verification</strong> on your Google Account.</li>
                  <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-violet underline font-semibold">myaccount.google.com/apppasswords</a>.</li>
                  <li>Generate an App Password (name it &quot;ReachOut&quot;) and paste the 16 characters above.</li>
                </ol>
              </>
            )}

            {provider === "custom" && (
              <>
                <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-blue-500" /> Custom SMTP Configuration:
                </p>
                <p>
                  Specify your SMTP Host, Port (typically 465 for SSL or 587 for TLS), email username, and authentication password provided by your mail provider.
                </p>
              </>
            )}
          </div>
        </Section>

        {/* Sender Profile */}
        <Section
          title="Sender Profile &amp; Brand Identity"
          description="The AI uses your profile details to personalize cold emails per target company and goal."
          icon={<User className="h-5 w-5" />}
          onSave={handleSaveProfile}
          saving={savingProfile}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-name" className="text-sm font-bold">Full Name / Brand / Agency Name</Label>
              <Input
                id="p-name"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="e.g. Aditya Gupta / Novix Media"
                className="h-12 text-base rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-role" className="text-sm font-bold">Role / Business / Niche</Label>
              <Input
                id="p-role"
                value={profile.currentRole}
                onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })}
                placeholder="e.g. Content Creator (Tech &amp; Lifestyle) / Marketing Agency Owner / Developer"
                className="h-12 text-base rounded-2xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-target" className="text-sm font-bold">Primary Offering / Target Goal</Label>
            <Input
              id="p-target"
              value={profile.targetRoles}
              onChange={(e) => setProfile({ ...profile, targetRoles: e.target.value })}
              placeholder="e.g. Brand Sponsorships &amp; UGC / Web Development Services / SDE Role"
              className="h-12 text-base rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-skills" className="text-sm font-bold">Key Skills, Niche &amp; Strengths</Label>
            <Input
              id="p-skills"
              value={profile.skills}
              onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
              placeholder="e.g. Instagram Reels, Tech Reviews, B2B Lead Gen, React, Node.js, Video Editing"
              className="h-12 text-base rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-bio" className="text-sm font-bold">Brief Bio / Brand Pitch / Key Achievements</Label>
            <Textarea
              id="p-bio"
              rows={4}
              className="resize-none text-base p-4 rounded-2xl leading-relaxed"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="e.g. Reached 500k+ monthly impressions in tech niche, partnered with top brands, or built high-traffic products."
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3 pt-2">
            <div className="space-y-2">
              <Label htmlFor="p-portfolio" className="text-sm font-bold flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-muted-foreground" /> Website / Media Kit
              </Label>
              <Input
                id="p-portfolio"
                value={profile.portfolioUrl}
                onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="h-12 text-base rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-linkedin" className="text-sm font-bold flex items-center gap-1.5">
                <Link2 className="h-4 w-4 text-muted-foreground" /> LinkedIn / Instagram
              </Label>
              <Input
                id="p-linkedin"
                value={profile.linkedinUrl}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="h-12 text-base rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-github" className="text-sm font-bold flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-muted-foreground" /> YouTube / GitHub / Social
              </Label>
              <Input
                id="p-github"
                value={profile.githubUrl}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                placeholder="https://youtube.com/@..."
                className="h-12 text-base rounded-2xl"
              />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
