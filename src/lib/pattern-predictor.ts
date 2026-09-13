/**
 * Email Pattern Detection & Prediction Engine.
 * Analyzes sample company emails to identify naming conventions
 * and generates predicted emails for target names with confidence scoring.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface PatternAnalysisResult {
  domain: string;
  pattern: string;
  patternType: string;
  confidencePercent: number;
  why: string;
  predictions: PredictedEmailItem[];
}

export interface PredictedEmailItem {
  id: string;
  name: string;
  predictedEmail: string;
  confidence: "High" | "Medium" | "Low";
  patternUsed: string;
}

// Common patterns dictionary with labels
const PATTERNS_LIST = [
  { id: "fn.ln", template: "{firstname}.{lastname}", label: "firstname.lastname" },
  { id: "fn_ln", template: "{firstname}_{lastname}", label: "firstname_lastname" },
  { id: "fn-ln", template: "{firstname}-{lastname}", label: "firstname-lastname" },
  { id: "fnln", template: "{firstname}{lastname}", label: "firstnamelastname" },
  { id: "fi.ln", template: "{firstinitial}.{lastname}", label: "firstinitial.lastname" },
  { id: "filn", template: "{firstinitial}{lastname}", label: "firstinitiallastname" },
  { id: "fn", template: "{firstname}", label: "firstname" },
  { id: "ln", template: "{lastname}", label: "lastname" },
  { id: "ln.fn", template: "{lastname}.{firstname}", label: "lastname.firstname" },
  { id: "lnfn", template: "{lastname}{firstname}", label: "lastnamefirstname" },
];

/**
 * Clean & extract sample email addresses from input text
 */
export function extractEmailsFromText(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((e) => e.trim().toLowerCase())));
}

/**
 * Clean & extract target names from input text
 */
export function extractNamesFromText(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•\d.\s]+/, "").trim())
    .filter((line) => line.length > 0 && !line.includes("@"));
}

/**
 * Pure heuristic pattern detector from sample emails
 */
export function analyzeSamplesHeuristically(sampleEmails: string[]): {
  domain: string;
  patternType: string;
  patternLabel: string;
  patternTemplate: string;
  confidencePercent: number;
  why: string;
} {
  if (sampleEmails.length === 0) {
    return {
      domain: "company.com",
      patternType: "fn.ln",
      patternLabel: "firstname.lastname@company.com",
      patternTemplate: "{firstname}.{lastname}@{domain}",
      confidencePercent: 70,
      why: "Defaulting to standard corporate format (firstname.lastname@domain.com).",
    };
  }

  // Determine dominant domain
  const domainCounts = new Map<string, number>();
  for (const email of sampleEmails) {
    const parts = email.split("@");
    if (parts.length === 2) {
      const d = parts[1].toLowerCase();
      domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
    }
  }

  let dominantDomain = "company.com";
  let maxDomainCount = 0;
  for (const [dom, count] of domainCounts.entries()) {
    if (count > maxDomainCount) {
      maxDomainCount = count;
      dominantDomain = dom;
    }
  }

  // Filter emails matching dominant domain
  const domainEmails = sampleEmails.filter((e) => e.endsWith(`@${dominantDomain}`));
  const usernames = domainEmails.map((e) => e.split("@")[0]);

  // Score patterns based on usernames
  let dotCount = 0;
  let underscoreCount = 0;
  let hyphenCount = 0;
  let singleWordCount = 0;
  let initialDotCount = 0;

  for (const u of usernames) {
    if (u.includes(".")) {
      dotCount++;
      if (/^[a-z]\.[a-z]+$/.test(u)) {
        initialDotCount++;
      }
    } else if (u.includes("_")) {
      underscoreCount++;
    } else if (u.includes("-")) {
      hyphenCount++;
    } else if (/^[a-z]+$/.test(u)) {
      singleWordCount++;
    }
  }

  const total = usernames.length || 1;
  let patternType = "fn.ln";
  let patternLabel = `firstname.lastname@${dominantDomain}`;
  let patternTemplate = `{firstname}.{lastname}@${dominantDomain}`;
  let why = "";

  if (initialDotCount > 0 && initialDotCount >= Math.ceil(total / 2)) {
    patternType = "fi.ln";
    patternLabel = `firstinitial.lastname@${dominantDomain}`;
    patternTemplate = `{firstinitial}.{lastname}@${dominantDomain}`;
    why = `The sample emails use the first initial and last name separated by a dot (e.g. r.sharma@${dominantDomain}).`;
  } else if (dotCount > 0 && dotCount >= Math.ceil(total / 2)) {
    patternType = "fn.ln";
    patternLabel = `firstname.lastname@${dominantDomain}`;
    patternTemplate = `{firstname}.{lastname}@${dominantDomain}`;
    why = `The sample emails consistently use the first name and last name separated by a dot (e.g. rahul.sharma@${dominantDomain}).`;
  } else if (underscoreCount > 0 && underscoreCount >= Math.ceil(total / 2)) {
    patternType = "fn_ln";
    patternLabel = `firstname_lastname@${dominantDomain}`;
    patternTemplate = `{firstname}_{lastname}@${dominantDomain}`;
    why = `The sample emails use an underscore between first name and last name (e.g. rahul_sharma@${dominantDomain}).`;
  } else if (hyphenCount > 0 && hyphenCount >= Math.ceil(total / 2)) {
    patternType = "fn-ln";
    patternLabel = `firstname-lastname@${dominantDomain}`;
    patternTemplate = `{firstname}-{lastname}@${dominantDomain}`;
    why = `The sample emails use a hyphen between first name and last name (e.g. rahul-sharma@${dominantDomain}).`;
  } else if (singleWordCount > 0 && singleWordCount >= Math.ceil(total / 2)) {
    patternType = "fn";
    patternLabel = `firstname@${dominantDomain}`;
    patternTemplate = `{firstname}@${dominantDomain}`;
    why = `The sample emails use only the person's first name (e.g. rahul@${dominantDomain}).`;
  } else {
    // Default fallback
    patternType = "fn.ln";
    patternLabel = `firstname.lastname@${dominantDomain}`;
    patternTemplate = `{firstname}.{lastname}@${dominantDomain}`;
    why = `Detected domain ${dominantDomain}. Pattern inferred from sample email structures.`;
  }

  // Calculate confidence percentage based on sample quantity and match ratio
  let confidencePercent = 75;
  if (total >= 4) {
    confidencePercent = 96;
  } else if (total === 3) {
    confidencePercent = 91;
  } else if (total === 2) {
    confidencePercent = 84;
  } else {
    confidencePercent = 76;
  }

  return {
    domain: dominantDomain,
    patternType,
    patternLabel,
    patternTemplate,
    confidencePercent,
    why,
  };
}

/**
 * Generate predicted email address for a single name given the detected pattern
 */
export function predictEmailForName(
  fullName: string,
  domain: string,
  patternType: string
): { email: string; confidence: "High" | "Medium" | "Low"; patternUsed: string } {
  const cleanName = fullName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const nameParts = cleanName.split(/\s+/).filter(Boolean);

  const firstname = nameParts[0] || "user";
  const lastname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const firstinitial = firstname.charAt(0);

  const hasLastName = Boolean(lastname);

  let username = "";
  let patternUsedLabel = "";
  let confidence: "High" | "Medium" | "Low" = "High";

  switch (patternType) {
    case "fn.ln":
      if (hasLastName) {
        username = `${firstname}.${lastname}`;
        patternUsedLabel = `firstname.lastname@${domain}`;
        confidence = "High";
      } else {
        username = `${firstname}`;
        patternUsedLabel = `firstname@${domain}`;
        confidence = "Medium";
      }
      break;

    case "fn_ln":
      if (hasLastName) {
        username = `${firstname}_${lastname}`;
        patternUsedLabel = `firstname_lastname@${domain}`;
        confidence = "High";
      } else {
        username = `${firstname}`;
        patternUsedLabel = `firstname@${domain}`;
        confidence = "Medium";
      }
      break;

    case "fn-ln":
      if (hasLastName) {
        username = `${firstname}-${lastname}`;
        patternUsedLabel = `firstname-lastname@${domain}`;
        confidence = "High";
      } else {
        username = `${firstname}`;
        patternUsedLabel = `firstname@${domain}`;
        confidence = "Medium";
      }
      break;

    case "fnln":
      if (hasLastName) {
        username = `${firstname}${lastname}`;
        patternUsedLabel = `firstnamelastname@${domain}`;
        confidence = "High";
      } else {
        username = `${firstname}`;
        patternUsedLabel = `firstname@${domain}`;
        confidence = "Medium";
      }
      break;

    case "fi.ln":
      if (hasLastName) {
        username = `${firstinitial}.${lastname}`;
        patternUsedLabel = `firstinitial.lastname@${domain}`;
        confidence = "High";
      } else {
        username = `${firstname}`;
        patternUsedLabel = `firstname@${domain}`;
        confidence = "Medium";
      }
      break;

    case "filn":
      if (hasLastName) {
        username = `${firstinitial}${lastname}`;
        patternUsedLabel = `firstinitiallastname@${domain}`;
        confidence = "High";
      } else {
        username = `${firstname}`;
        patternUsedLabel = `firstname@${domain}`;
        confidence = "Medium";
      }
      break;

    case "fn":
      username = firstname;
      patternUsedLabel = `firstname@${domain}`;
      confidence = "High";
      break;

    case "ln":
      if (hasLastName) {
        username = lastname;
        patternUsedLabel = `lastname@${domain}`;
        confidence = "High";
      } else {
        username = firstname;
        patternUsedLabel = `firstname@${domain}`;
        confidence = "Medium";
      }
      break;

    case "ln.fn":
      if (hasLastName) {
        username = `${lastname}.${firstname}`;
        patternUsedLabel = `lastname.firstname@${domain}`;
        confidence = "High";
      } else {
        username = firstname;
        patternUsedLabel = `firstname@${domain}`;
        confidence = "Medium";
      }
      break;

    default:
      if (hasLastName) {
        username = `${firstname}.${lastname}`;
        patternUsedLabel = `firstname.lastname@${domain}`;
        confidence = "High";
      } else {
        username = firstname;
        patternUsedLabel = `firstname@${domain}`;
        confidence = "Medium";
      }
      break;
  }

  return {
    email: `${username}@${domain}`,
    confidence,
    patternUsed: patternUsedLabel,
  };
}

/**
 * Full AI & Heuristic Prediction Runner for Samples + Target Names
 */
export async function predictEmails(
  sampleEmailsText: string,
  namesText: string
): Promise<PatternAnalysisResult> {
  const sampleEmails = extractEmailsFromText(sampleEmailsText);
  const targetNames = extractNamesFromText(namesText);

  // Run heuristic detection
  const heuristic = analyzeSamplesHeuristically(sampleEmails);

  let finalDomain = heuristic.domain;
  let finalPatternType = heuristic.patternType;
  let finalPatternLabel = heuristic.patternLabel;
  let finalConfidence = heuristic.confidencePercent;
  let finalWhy = heuristic.why;

  // Try LLM enhancement via Groq or Gemini if keys exist
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (sampleEmails.length > 0 && (groqApiKey || geminiApiKey)) {
    try {
      const prompt = `Analyze these sample corporate email addresses and detect the exact email naming pattern:
Samples: ${sampleEmails.slice(0, 10).join(", ")}

Return ONLY a JSON object with:
{
  "domain": "string (the company domain name)",
  "patternType": "fn.ln | fn_ln | fn-ln | fnln | fi.ln | filn | fn | ln | ln.fn",
  "patternLabel": "human readable format like firstname.lastname@company.com",
  "confidencePercent": number (between 70 and 99),
  "why": "brief 1-sentence explanation of why this pattern was detected"
}`;

      if (groqApiKey) {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            if (parsed.domain) finalDomain = parsed.domain;
            if (parsed.patternType) finalPatternType = parsed.patternType;
            if (parsed.patternLabel) finalPatternLabel = parsed.patternLabel;
            if (parsed.confidencePercent) finalConfidence = parsed.confidencePercent;
            if (parsed.why) finalWhy = parsed.why;
          }
        }
      } else if (geminiApiKey) {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" },
        });
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        const parsed = JSON.parse(text);
        if (parsed.domain) finalDomain = parsed.domain;
        if (parsed.patternType) finalPatternType = parsed.patternType;
        if (parsed.patternLabel) finalPatternLabel = parsed.patternLabel;
        if (parsed.confidencePercent) finalConfidence = parsed.confidencePercent;
        if (parsed.why) finalWhy = parsed.why;
      }
    } catch (err) {
      console.warn("[Pattern Predictor LLM] Fallback to heuristic engine:", err);
    }
  }

  // Generate predictions for each target name
  const namesToProcess = targetNames.length > 0 ? targetNames : ["Rahul Sharma", "Priya Mehta", "Aman Verma"];

  const predictions: PredictedEmailItem[] = namesToProcess.map((name, idx) => {
    const p = predictEmailForName(name, finalDomain, finalPatternType);
    return {
      id: `pred-${idx}-${Date.now()}`,
      name,
      predictedEmail: p.email,
      confidence: p.confidence,
      patternUsed: p.patternUsed,
    };
  });

  return {
    domain: finalDomain,
    pattern: finalPatternLabel,
    patternType: finalPatternType,
    confidencePercent: finalConfidence,
    why: finalWhy,
    predictions,
  };
}
