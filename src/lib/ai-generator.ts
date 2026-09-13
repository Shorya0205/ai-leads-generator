/**
 * AI Cold Email Generation Engine supporting Groq (LLaMA 3.3 70B) & Google Gemini.
 * Generates unique, highly personalized cold outreach emails per company and recipient
 * across all outreach use cases: Influencer Marketing, B2B Sales, Partnerships, Agency Services, & Careers.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface RecipientData {
  id?: string;
  email: string;
  name?: string | null;
  company?: string | null;
}

export interface UserProfileData {
  fullName?: string | null;
  currentRole?: string | null; // e.g. Content Creator, Digital Agency Founder, Software Engineer
  skills?: string | null; // e.g. Instagram Reels, B2B Sales, React/Node, SEO
  bio?: string | null; // Background or company/niche summary
  targetRoles?: string | null; // Target offerings, e.g. Brand Sponsorships, Web Dev Services, SDE Role
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
}

export type OutreachGoal =
  | "influencer_marketing"
  | "sales"
  | "partnership"
  | "services"
  | "internship"
  | "fulltime"
  | "networking"
  | "custom"
  | string;

export interface GenerateOptions {
  goal?: OutreachGoal;
  customInstructions?: string;
  tone?: "professional" | "enthusiastic" | "concise" | "casual" | string;
}

export interface GeneratedEmailResult {
  recipientId?: string;
  email: string;
  company: string;
  recipientName: string;
  subject: string;
  body: string;
}

function getGoalContextDescription(goal: OutreachGoal, company: string): string {
  switch (goal) {
    case "influencer_marketing":
      return `Influencer Marketing & Brand Collaboration — pitching a creator partnership, sponsored content, UGC creation, or brand ambassadorship to ${company}.`;
    case "sales":
      return `B2B Sales & Lead Generation — pitching high-value solutions, product demo, or services to help ${company} increase revenue and efficiency.`;
    case "partnership":
      return `Strategic Partnership & Co-Marketing — proposing a mutually beneficial collaboration, integration, or joint marketing campaign with ${company}.`;
    case "services":
      return `Agency & Freelance Services — offering specialized professional services (digital marketing, web design, software development, content production) tailored for ${company}.`;
    case "networking":
      return `Professional Networking — seeking a 10-minute advice/coffee chat with an industry leader at ${company}.`;
    case "internship":
    case "fulltime":
      return `Career Inquiry — applying or expressing strong interest in job/internship opportunities at ${company}.`;
    default:
      return `Cold Outreach — connecting with ${company} to present a compelling value proposal.`;
  }
}

/**
 * Generate a personalized cold email for a single recipient using Groq or Gemini.
 */
export async function generateSingleEmail(
  recipient: RecipientData,
  profile: UserProfileData,
  options: GenerateOptions = {}
): Promise<GeneratedEmailResult> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const company = recipient.company || "your team";
  const recipientName = recipient.name || "Team";
  const senderName = profile.fullName || "Your Name";
  const role = profile.currentRole || "Outreach Specialist";
  const skills = profile.skills || "Content Strategy, Digital Marketing, Growth & Development";
  const targetRoles = profile.targetRoles || "Brand Partnerships & Services";
  const goal = options.goal || "influencer_marketing";
  const tone = options.tone || "concise and confident";

  const goalContext = getGoalContextDescription(goal, company);

  const prompt = `You are a world-class cold email copywriter who writes high-converting, non-spammy cold outreach emails that get real replies from founders, brand managers, CMOs, and decision makers.

Task: Write a personalized, highly authentic, and compelling cold outreach email from the sender to the recipient.

--- OUTREACH GOAL & CONTEXT ---
- Primary Goal: ${goal.toUpperCase()}
- Description: ${goalContext}
- Desired Tone: ${tone}
- Custom Instructions: ${options.customInstructions || "Highlight clear mutual value and why " + company + " is a great fit."}

--- SENDER PROFILE ---
- Name: ${senderName}
- Current Role/Niche: ${role}
- Key Offerings/Skills/Niche: ${skills}
- Background / Bio: ${profile.bio || "Passionate about delivering high-impact results and creating valuable partnerships."}
- Primary Offering / Target: ${targetRoles}
${profile.portfolioUrl ? `- Website/Portfolio: ${profile.portfolioUrl}` : ""}
${profile.linkedinUrl ? `- LinkedIn: ${profile.linkedinUrl}` : ""}
${profile.githubUrl ? `- Social / GitHub: ${profile.githubUrl}` : ""}

--- RECIPIENT PROFILE ---
- Name: ${recipientName}
- Email: ${recipient.email}
- Company / Brand: ${company}

--- STRICT COPYWRITING RULES ---
1. Subject line: MUST be punchy, relevant to the goal (${goal}), professional, personalized, and under 50 characters. Absolutely NO clickbait, NO spam trigger words.
   Examples by goal:
   - For Influencer Marketing: "Collaboration Inquiry: ${senderName} x ${company}", "Creator Partnership for ${company} — ${senderName}"
   - For B2B Sales / Services: "Quick idea for ${company}'s growth — ${senderName}", "Partnership / Solution for ${company}"
   - For Career: "${senderName} — ${targetRoles} Inquiry | ${company}"
2. Email Body:
   - Warm, direct opening addressing ${recipientName} and referencing ${company}.
   - Clear, 2-3 sentence value proposition showing why ${senderName} is uniquely positioned to help ${company}.
   - If Influencer Marketing: highlight audience engagement, content quality, or brand fit.
   - If Sales/Services: highlight ROI, solving pain points, or past results.
   - Low-friction Call to Action (e.g., "Would you be open to a quick 5-minute chat or brief media kit review this week?").
   - Professional closing signature.
3. Length: Keep total length concise (100 to 150 words max).
4. Output format: Return ONLY a valid JSON object with exact keys "subject" and "body".

{
  "subject": "string",
  "body": "string (with \\n for line breaks)"
}`;

  // Strategy 1: Use Groq if available
  if (groqApiKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            recipientId: recipient.id,
            email: recipient.email,
            company,
            recipientName,
            subject: parsed.subject || `Outreach Inquiry for ${company} — ${senderName}`,
            body: parsed.body || "",
          };
        }
      }
    } catch (error) {
      console.error(`[Groq API] Error generating email for ${recipient.email}:`, error);
    }
  }

  // Strategy 2: Use Gemini if available
  if (geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 800,
          responseMimeType: "application/json",
        },
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const parsed = JSON.parse(text);

      return {
        recipientId: recipient.id,
        email: recipient.email,
        company,
        recipientName,
        subject: parsed.subject || `Outreach Inquiry for ${company} — ${senderName}`,
        body: parsed.body || "",
      };
    } catch (error) {
      console.error(`[Gemini API] Error generating email for ${recipient.email}:`, error);
    }
  }

  // Strategy 3: Intelligent multi-purpose fallback template
  return generateFallbackEmail(recipient, profile, options);
}

/**
 * Batch generate personalized emails for multiple recipients with concurrency control.
 */
export async function generateBatchEmails(
  recipients: RecipientData[],
  profile: UserProfileData,
  options: GenerateOptions = {}
): Promise<GeneratedEmailResult[]> {
  const results: GeneratedEmailResult[] = [];
  const chunkSize = 10;

  for (let i = 0; i < recipients.length; i += chunkSize) {
    const chunk = recipients.slice(i, i + chunkSize);
    const chunkPromises = chunk.map((r) => generateSingleEmail(r, profile, options));
    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  return results;
}

/**
 * Multi-purpose fallback template generator covering Influencer Marketing, Sales, Partnerships, & Careers.
 */
function generateFallbackEmail(
  recipient: RecipientData,
  profile: UserProfileData,
  options: GenerateOptions = {}
): GeneratedEmailResult {
  const company = recipient.company || "your team";
  const recipientName = recipient.name || "Team";
  const senderName = profile.fullName || "Your Name";
  const role = profile.currentRole || "Creator & Specialist";
  const skills = profile.skills || "Digital Marketing, Content Strategy, & Growth";
  const targetRoles = profile.targetRoles || "Brand Collaboration";
  const goal = options.goal || "influencer_marketing";

  const links = [];
  if (profile.portfolioUrl) links.push(`Portfolio/Website: ${profile.portfolioUrl}`);
  if (profile.linkedinUrl) links.push(`LinkedIn: ${profile.linkedinUrl}`);
  if (profile.githubUrl) links.push(`Socials: ${profile.githubUrl}`);
  const linksText = links.length > 0 ? `\n\n${links.join(" | ")}` : "";

  let subject = "";
  let body = "";

  if (goal === "influencer_marketing") {
    subject = `Brand Collaboration Inquiry: ${senderName} x ${company}`;
    body = `Hi ${recipientName},

I hope you're having a great week!

I've been following ${company} and really love the products and brand vision your team is building. As a ${role} specializing in ${skills}, I create highly engaging content that resonates with an active audience.

I would love to explore a potential brand collaboration or sponsored campaign with ${company} to showcase your offerings to our community.

Would you be open to a quick 5-minute chat or reviewing a brief media kit this week?

Best regards,
${senderName}${linksText}`;
  } else if (goal === "sales" || goal === "services") {
    subject = `Quick idea for ${company}'s growth — ${senderName}`;
    body = `Hi ${recipientName},

I hope this email finds you well.

I came across ${company} and noticed the great work you're doing in your space. I'm a ${role} with expertise in ${skills}, helping businesses accelerate their growth and optimize operations.

We recently helped similar brands achieve significant improvements in client engagement and performance, and I'd love to share a few tailored ideas for ${company}.

Would you be open to a brief 10-minute discovery call later this week?

Best regards,
${senderName}${linksText}`;
  } else if (goal === "partnership") {
    subject = `Strategic Partnership Proposal: ${senderName} & ${company}`;
    body = `Hi ${recipientName},

I hope you're doing well.

I am reaching out from ${role} because I see a natural alignment between what we're doing in ${skills} and ${company}'s current trajectory.

A strategic partnership or co-marketing initiative between us could create great value for both our audiences.

Would you have 10 minutes for a brief call to brainstorm potential synergies?

Best regards,
${senderName}${linksText}`;
  } else {
    subject = `${senderName} — ${targetRoles} Inquiry | ${company}`;
    body = `Hi ${recipientName},

I hope you're having a great week.

I've been following ${company}'s work and really admire what your team is building. I am a ${role} with strong hands-on experience in ${skills}.

I am actively exploring ${targetRoles} opportunities where I can contribute to shipping high-impact results at ${company}.

Would you be open to a quick 10-minute conversation this week, or could you point me toward the right lead to speak with?

Best regards,
${senderName}${linksText}`;
  }

  return {
    recipientId: recipient.id,
    email: recipient.email,
    company,
    recipientName,
    subject,
    body,
  };
}
