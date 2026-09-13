import Link from "next/link";
import { SignInButton } from "@/components/sign-in-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sparkles,
  Shield,
  Zap,
  Send,
  Users,
  Calendar,
  ArrowRight,
  Mail,
  FileText,
  Bot,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-chalkboard-grid text-slate-100 antialiased selection:bg-amber-300 selection:text-black">
      {/* ── Top Floating Pill Navigation Bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 flex justify-center backdrop-blur-md">
        <div className="mx-auto max-w-6xl w-full flex items-center justify-between bg-[#0a1e17]/90 border border-emerald-500/20 rounded-full px-5 py-2.5 shadow-2xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center text-black font-black text-xs shadow-md">
              AI
            </div>
            <span className="font-extrabold tracking-tight text-white text-sm sm:text-base">
              AI LEADS GENERATOR
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
            <a
              href="#"
              className="bg-white text-black px-4 py-1.5 rounded-full font-bold shadow-sm"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-emerald-100/80 hover:text-white px-3.5 py-1.5 rounded-full transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-emerald-100/80 hover:text-white px-3.5 py-1.5 rounded-full transition-colors"
            >
              How It Works
            </a>
            <a
              href="#preview"
              className="text-emerald-100/80 hover:text-white px-3.5 py-1.5 rounded-full transition-colors"
            >
              Live Demo
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignInButton variant="nav" />
          </div>
        </div>
      </header>

      {/* ── Hero Section with Serif Title & Yellow Highlights ── */}
      <section className="relative pt-36 pb-20 px-6 max-w-5xl mx-auto text-center overflow-hidden">
        {/* Floating tech badges matching reference image icons */}
        <div className="hidden lg:block pointer-events-none">
          {/* Top Left - Groq LLaMA */}
          <div className="absolute top-28 left-0 bg-[#0c271e] border border-emerald-500/30 p-3 rounded-2xl shadow-xl flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-white">Groq LLaMA 3.3</div>
              <div className="text-[10px] text-amber-300 font-mono">Domain Context</div>
            </div>
          </div>

          {/* Top Right - Gemini */}
          <div className="absolute top-24 right-0 bg-[#0c271e] border border-emerald-500/30 p-3 rounded-2xl shadow-xl flex items-center gap-2.5">
            <Bot className="h-7 w-7 text-cyan-400" />
            <div className="text-left text-xs">
              <div className="font-bold text-white">Google Gemini</div>
              <div className="text-[10px] text-cyan-300 font-mono">Dual AI Engine</div>
            </div>
          </div>

          {/* Bottom Left - Gmail SMTP */}
          <div className="absolute bottom-16 left-4 bg-[#0c271e] border border-emerald-500/30 p-3 rounded-2xl shadow-xl flex items-center gap-2.5">
            <Mail className="h-7 w-7 text-emerald-400" />
            <div className="text-left text-xs">
              <div className="font-bold text-white">Gmail SMTP</div>
              <div className="text-[10px] text-emerald-400 font-mono">Direct Sending</div>
            </div>
          </div>

          {/* Bottom Right - AES-256 */}
          <div className="absolute bottom-16 right-4 bg-[#0c271e] border border-emerald-500/30 p-3 rounded-2xl shadow-xl flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-amber-400" />
            <div className="text-left text-xs">
              <div className="font-bold text-white">AES-256</div>
              <div className="text-[10px] text-amber-400 font-mono">Encrypted Keys</div>
            </div>
          </div>
        </div>

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-[#0e2c21] text-xs font-semibold text-emerald-200">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Powered by Groq LLaMA 3.3 70B &amp; Gemini AI</span>
        </div>

        {/* Main Title in Serif */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-white mb-8 leading-[1.05]" style={{ fontFamily: 'Georgia, serif' }}>
          AI Leads Generator
        </h1>

        {/* Subtitle with Yellow Highlights */}
        <p className="max-w-2xl mx-auto text-emerald-100/80 text-lg sm:text-xl font-normal leading-relaxed mb-10">
          Send <span className="highlight-yellow">hyper-personalized</span> cold emails tailored per company domain straight from your Gmail with your <span className="highlight-yellow">resume attached</span> to make real <span className="highlight-yellow">career impact</span>.
        </p>

        {/* Rounded Pill Buttons matching reference image style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <SignInButton variant="primary" label="GET STARTED FREE" />
          <a
            href="#preview"
            className="px-8 py-3.5 rounded-full border border-emerald-400/30 hover:border-emerald-300 hover:bg-emerald-500/10 text-emerald-100 font-mono text-xs tracking-widest uppercase transition-all duration-200 flex items-center gap-2"
          >
            <span>EXPLORE DEMO</span>
            <ArrowRight className="h-4 w-4 text-amber-400" />
          </a>
        </div>

        {/* Micro Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-emerald-200/60">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Gmail SMTP Integration
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> AES-256 Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Anti-Spam Throttling
          </span>
        </div>
      </section>

      {/* ── Visual App Preview Mockup ── */}
      <section id="preview" className="relative z-10 pb-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-emerald-500/25 bg-[#091a13]/90 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-emerald-950/60">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-900/40">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-emerald-200/50">app.aileadsgenerator.com/dashboard</span>
              </div>
              <div className="text-[11px] font-mono text-black bg-amber-400 px-3 py-1 rounded-full font-bold shadow-sm">
                SYSTEM READY
              </div>
            </div>

            {/* Content mockup inside */}
            <div className="mt-5 grid lg:grid-cols-3 gap-5">
              {/* Stats overview column */}
              <div className="lg:col-span-1 space-y-3.5">
                <div className="p-4 rounded-2xl bg-[#0e271f] border border-emerald-500/20">
                  <div className="text-xs text-emerald-200/60 font-mono mb-1">TODAY'S VOLUME</div>
                  <div className="text-2xl font-bold text-white flex items-baseline justify-between">
                    <span>142 <span className="text-xs font-normal text-emerald-200/40">/ 450 max</span></span>
                    <span className="text-xs text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded">+32%</span>
                  </div>
                  <div className="mt-3 w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '31%' }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e271f] border border-emerald-500/20">
                  <div className="text-xs text-emerald-200/60 font-mono mb-1">ACTIVE AI ENGINE</div>
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Groq LLaMA 3.3 70B</span>
                    <span className="text-amber-300 font-mono">Ultra-Fast</span>
                  </div>
                  <div className="text-[11px] text-emerald-200/40 mt-1">Extracts company domain context</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e271f] border border-emerald-500/20">
                  <div className="text-xs text-emerald-200/60 font-mono mb-1">ANTI-SPAM DELAY</div>
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Safe Throttle Mode</span>
                    <span className="text-cyan-300 font-mono">15s - 45s</span>
                  </div>
                </div>
              </div>

              {/* Table / outreach list column */}
              <div className="lg:col-span-2 rounded-2xl bg-[#0e271f] border border-emerald-500/20 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40 mb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-amber-400" />
                      Live Cold Email Stream
                    </span>
                    <span className="text-[10px] text-emerald-200/40 font-mono">UPDATED REAL-TIME</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { email: "hr@stripe.com", company: "Stripe", status: "SENT", time: "Just now", tone: "Enthusiastic" },
                      { email: "founders@linear.app", company: "Linear", status: "SENT", time: "2m ago", tone: "Concise" },
                      { email: "careers@vercel.com", company: "Vercel", status: "QUEUED", time: "In 15s", tone: "Technical" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b1f17] border border-emerald-500/15 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-lg bg-amber-400 text-black font-bold flex items-center justify-center text-[11px]">
                            {row.company[0]}
                          </div>
                          <div>
                            <div className="text-white font-medium">{row.email}</div>
                            <div className="text-[10px] text-emerald-200/50">Domain: {row.company} • {row.tone}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${row.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'}`}>
                            {row.status}
                          </span>
                          <div className="text-[10px] text-emerald-200/40 mt-1 font-mono">{row.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs text-emerald-200/50">
                  <span>Resume PDF Attached: <strong className="text-white">Software_Engineer_Resume.pdf</strong></span>
                  <span className="text-amber-300 hover:underline cursor-pointer">View full log</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Grid Section ── */}
      <section id="stats" className="relative z-10 py-16 px-6 border-y border-emerald-900/40 bg-[#091a13]/50">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: "450+", label: "Emails / Day Limit", icon: Send },
              { value: "2 AI", label: "Groq + Gemini Engine", icon: Sparkles },
              { value: "15-60s", label: "Anti-Spam Throttling", icon: Zap },
              { value: "AES-256", label: "Encrypted Passwords", icon: Shield },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group relative rounded-2xl border border-emerald-500/20 bg-[#0b2119] p-6 text-center hover:border-amber-400/40 transition-all duration-300"
              >
                <stat.icon className="h-5 w-5 mx-auto mb-3 text-amber-400" />
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-emerald-200/50 font-mono">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-6xl text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Everything for high-conversion outreach
          </h2>
          <p className="text-emerald-200/60 text-base max-w-md mx-auto">
            Designed for students and developers sending personalized emails at scale.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Sparkles,
              title: "Domain AI Personalization",
              desc: "Extracts recipient company context from email domains and writes bespoke cold pitches via Groq & Gemini.",
            },
            {
              icon: Zap,
              title: "Anti-Penalty Engine",
              desc: "Fast, Safe, and Stealth throttling modes keep your Gmail authority clean and avoid spam filters.",
            },
            {
              icon: Shield,
              title: "AES-256 Encrypted",
              desc: "Gmail App Passwords encrypted at rest using AES-256-GCM cipher.",
            },
            {
              icon: Users,
              title: "CSV Bulk Import",
              desc: "Upload target lead lists in CSV format with automatic domain and recipient parsing.",
            },
            {
              icon: Calendar,
              title: "Activity Heatmap",
              desc: "Visual interactive calendar monitors daily send velocity, delivery status, and campaign history.",
            },
            {
              icon: FileText,
              title: "Auto Resume Attachment",
              desc: "Attach your resume PDF once - it is automatically included in every personalized email.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-[#0b2119] border border-emerald-500/20 hover:border-amber-400/40 transition-all duration-200"
            >
              <f.icon className="h-6 w-6 text-amber-400 mb-3" />
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-emerald-100/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3-Step Setup ── */}
      <section id="how-it-works" className="relative z-10 py-20 px-6 border-t border-emerald-900/40 bg-[#091a13]/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl text-white mb-14" style={{ fontFamily: 'Georgia, serif' }}>
            Get Started in 3 Steps
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Connect Gmail", desc: "Add App Password with AES-256 encryption." },
              { step: "02", title: "Upload Leads", desc: "Import CSV or recipient emails." },
              { step: "03", title: "AI Launch", desc: "Generate domain-tailored emails & send." },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-2xl bg-[#0b2119] border border-emerald-500/20 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-black font-extrabold text-lg mb-4 shadow-md">
                  {s.step}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-emerald-100/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 py-28 px-6 text-center max-w-3xl mx-auto">
        <h2 className="text-5xl sm:text-6xl text-white mb-6" style={{ fontFamily: 'Georgia, serif' }}>
          Ready to land your next response?
        </h2>
        <p className="text-emerald-200/60 text-base mb-10">
          Free to use. No credit card needed. Sign in with Google and start your first outreach campaign in minutes.
        </p>
        <SignInButton variant="primary" label="GET STARTED FREE" />
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-emerald-900/40 py-8 px-6 text-center text-xs text-emerald-200/40">
        <p>© 2025 AI LEADS GENERATOR · Deep Forest Chalkboard Aesthetic</p>
      </footer>
    </main>
  );
}
