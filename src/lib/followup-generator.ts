import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecipientData, UserProfileData } from "./ai-generator";

export interface GeneratedFollowUpResult {
  recipientId?: string;
  email: string;
  company: string;
  recipientName: string;
  subject: string;
  body: string;
}

export async function generateFollowUpEmail(
  recipient: RecipientData,
  profile: UserProfileData,
  customNotes?: string
): Promise<GeneratedFollowUpResult> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const company = recipient.company || "your team";
  const recipientName = recipient.name || "Team";
  const senderName = profile.fullName || "Your Name";

  const prompt = `You are an expert cold email specialist crafting a polite, quick, low-friction follow-up email.
Sender: ${senderName}
Recipient: ${recipientName} at ${company} (${recipient.email})
Note / Context: ${customNotes || "Friendly check-in on previous outreach regarding potential collaboration / services."}

Rules:
1. Subject line: Keep it natural and short (e.g., "Re: Following up — ${senderName} x ${company}" or "Quick check-in regarding ${company}").
2. Body: Maximum 50-80 words. Polite, friendly check-in asking if they've had a chance to review the previous email or if they have 5 minutes this week.
3. Return ONLY a JSON object with keys "subject" and "body".

{
  "subject": "string",
  "body": "string"
}`;

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
            subject: parsed.subject || `Re: Following up — ${senderName} x ${company}`,
            body: parsed.body || "",
          };
        }
      }
    } catch (e) {
      console.error("Groq follow-up generation error:", e);
    }
  }

  if (geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
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
        subject: parsed.subject || `Re: Following up — ${senderName} x ${company}`,
        body: parsed.body || "",
      };
    } catch (e) {
      console.error("Gemini follow-up generation error:", e);
    }
  }

  // Intelligent fallback template
  return {
    recipientId: recipient.id,
    email: recipient.email,
    company,
    recipientName,
    subject: `Re: Following up regarding ${company}`,
    body: `Hi ${recipientName},\n\nI hope you're having a great week!\n\nJust wanted to quickly check in on my previous email regarding ${company}. I'd love to know if you've had a chance to review it or if you might be open to a quick 5-minute chat this week?\n\nBest regards,\n${senderName}`,
  };
}
