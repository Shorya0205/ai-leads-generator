import { getCompanyFromEmail, inferNameFromEmail } from "./company-lookup";

interface MergeData {
  email: string;
  name?: string | null;
  company?: string | null;
}

/**
 * Replace merge tags in text with recipient data.
 * Supported tags:
 *   - Brand / Company: {brand}, {company}, {brand_name}, {{brand}}, {{company}}, etc.
 *   - Name: {name}, {contact}, {person}, {{name}}, etc.
 *   - Email: {email}, {mail}, {{email}}, etc.
 * Missing values fall back to domain/username inferences or empty string.
 */
export function applyMergeTags(template: string, data: MergeData): string {
  if (!template) return "";

  const brandVal = data.company?.trim() || getCompanyFromEmail(data.email) || "";
  const nameVal = data.name?.trim() || inferNameFromEmail(data.email) || "";
  const emailVal = data.email || "";

  let result = template;

  // Replace {brand}, {{brand}}, {company}, {{company}}, {brand_name}, {company_name}, etc.
  result = result.replace(
    /\{\{?\s*(brand|brand_name|brandname|company|company_name|org|organization)\s*\}\}?/gi,
    brandVal
  );

  // Replace {name}, {{name}}, {contact}, {person}, etc.
  result = result.replace(
    /\{\{?\s*(name|full_name|fullname|first_name|contact|person)\s*\}\}?/gi,
    nameVal
  );

  // Replace {email}, {{email}}, {mail}, etc.
  result = result.replace(
    /\{\{?\s*(email|mail|email_address)\s*\}\}?/gi,
    emailVal
  );

  return result;
}

