/**
 * Simple CSV parser for recipient imports.
 * Handles both CSV format (email,name,company) and plain email lists.
 */

export interface ParsedRecipient {
  email: string;
  name?: string;
  company?: string;
}

/**
 * Parse CSV text into an array of recipients.
 * Accepts:
 *   - CSV with headers: brand, email, name / company, email, name
 *   - Plain list: one email per line
 *   - Mixed: "brand, email" or "name, brand, email" per line
 */
export function parseCSV(text: string): ParsedRecipient[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  // Check if first line is a header row
  const firstLineParts = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const headerKeywords = [
    "email",
    "mail",
    "to",
    "brand",
    "company",
    "org",
    "organization",
    "name",
    "contact",
    "person",
  ];

  const hasHeader = firstLineParts.some((h) =>
    headerKeywords.some((k) => h.includes(k))
  );

  const dataLines = hasHeader ? lines.slice(1) : lines;

  // Detect columns from header
  let emailIdx = -1;
  let nameIdx = -1;
  let companyIdx = -1;

  if (hasHeader) {
    firstLineParts.forEach((h, idx) => {
      if (emailIdx === -1 && (h.includes("email") || h.includes("mail") || h === "to")) {
        emailIdx = idx;
      } else if (
        companyIdx === -1 &&
        (h.includes("brand") ||
          h.includes("company") ||
          h.includes("org") ||
          h.includes("organization") ||
          h.includes("business"))
      ) {
        companyIdx = idx;
      } else if (
        nameIdx === -1 &&
        (h.includes("name") || h.includes("contact") || h.includes("person"))
      ) {
        nameIdx = idx;
      }
    });

    if (emailIdx === -1) emailIdx = 0;
  }

  const recipients: ParsedRecipient[] = [];
  const seen = new Set<string>();

  for (const line of dataLines) {
    const parts = parseCSVLine(line).map((p) => p.trim());
    if (parts.length === 0 || parts.every((p) => !p)) continue;

    let email = "";
    let name: string | undefined;
    let company: string | undefined;

    if (hasHeader) {
      email = (parts[emailIdx] ?? "").toLowerCase();
      name = nameIdx >= 0 ? parts[nameIdx] || undefined : undefined;
      company = companyIdx >= 0 ? parts[companyIdx] || undefined : undefined;
    } else {
      // Headerless line: find email column automatically
      const foundEmailIdx = parts.findIndex((p) => isValidEmail(p.toLowerCase()));

      if (foundEmailIdx !== -1) {
        email = parts[foundEmailIdx].toLowerCase();

        // Remaining non-email parts
        const otherParts = parts.filter((_, idx) => idx !== foundEmailIdx && Boolean(_));

        if (otherParts.length === 1) {
          // If only 1 other column (e.g. Nike, hr@nike.com), assume it's brand/company
          company = otherParts[0];
        } else if (otherParts.length >= 2) {
          // 2+ other columns (e.g. John Doe, Nike, hr@nike.com)
          name = otherParts[0];
          company = otherParts[1];
        }
      }
    }

    if (isValidEmail(email) && !seen.has(email)) {
      seen.add(email);
      recipients.push({
        email,
        name: name || undefined,
        company: company || undefined,
      });
    }
  }

  return recipients;
}

/**
 * Parse a single CSV line, respecting quoted fields.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }

  result.push(current);
  return result;
}

/**
 * Basic email validation.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
