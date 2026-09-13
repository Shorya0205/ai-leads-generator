/**
 * Environment variable validation.
 * Import this at the top of your app to fail fast if required vars are missing.
 */

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  // Clerk Auth
  {
    key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    required: true,
    description: "Clerk publishable key (https://clerk.com → Dashboard → API Keys)",
  },
  {
    key: "CLERK_SECRET_KEY",
    required: true,
    description: "Clerk secret key (https://clerk.com → Dashboard → API Keys)",
  },

  // Database
  {
    key: "DATABASE_URL",
    required: true,
    description: "Neon Postgres connection URL (https://neon.tech)",
  },

  // Encryption
  {
    key: "ENCRYPTION_KEY",
    required: true,
    description:
      'AES-256-GCM key — 64 hex chars. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
  },

  // AI (at least one should be set)
  {
    key: "GROQ_API_KEY",
    required: false,
    description: "Groq API key for fast LLaMA inference (https://console.groq.com)",
  },
  {
    key: "GEMINI_API_KEY",
    required: false,
    description: "Google Gemini API key (https://aistudio.google.com/app/apikey)",
  },
];

export function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.key];

    if (envVar.required && !value) {
      errors.push(`❌ Missing required: ${envVar.key}\n   → ${envVar.description}`);
    }
  }

  // Validate ENCRYPTION_KEY format if present
  const encKey = process.env.ENCRYPTION_KEY;
  if (encKey && encKey.length !== 64) {
    errors.push(
      `❌ ENCRYPTION_KEY must be exactly 64 hex characters (got ${encKey.length})\n   → Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    );
  }

  // Warn if neither AI key is set
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    warnings.push(
      "⚠️  No AI API key set (GROQ_API_KEY or GEMINI_API_KEY). AI-generated emails will use template fallback."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Run validation and log results.
 * Call this during app initialization to fail fast.
 */
export function checkEnvOrWarn(): void {
  // Only run server-side
  if (typeof window !== "undefined") return;

  const { valid, errors, warnings } = validateEnv();

  if (warnings.length > 0) {
    console.warn("\n╔══════════════════════════════════════╗");
    console.warn("║   ReachOut — Environment Warnings    ║");
    console.warn("╚══════════════════════════════════════╝");
    warnings.forEach((w) => console.warn(w));
    console.warn("");
  }

  if (!valid) {
    console.error("\n╔══════════════════════════════════════╗");
    console.error("║  ReachOut — Missing Environment Vars ║");
    console.error("╚══════════════════════════════════════╝");
    errors.forEach((e) => console.error(e));
    console.error("\n→ Copy .env.example to .env and fill in the values.\n");
  }
}
