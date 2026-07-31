/**
 * Shared validation. The same rules run in the browser (instant feedback)
 * and again on the server (authoritative). No third-party dependency.
 */

export type FieldError = { field: string; code: string };

const SAUDI_MOBILE = /^(?:\+?966|00966|0)?5\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export type Rule = {
  required?: boolean;
  min?: number;
  max?: number;
  type?: "email" | "phone" | "text";
  oneOf?: readonly string[];
};

export type Schema = Record<string, Rule>;

export function normalisePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+966")) return digits;
  if (digits.startsWith("00966")) return `+${digits.slice(2)}`;
  if (digits.startsWith("966")) return `+${digits}`;
  if (digits.startsWith("0")) return `+966${digits.slice(1)}`;
  if (/^5\d{8}$/.test(digits)) return `+966${digits}`;
  return digits;
}

export function validateField(value: unknown, rule: Rule): string | null {
  const s = typeof value === "string" ? value.trim() : value == null ? "" : String(value);
  if (rule.required && !s) return "required";
  if (!s) return null;
  if (rule.min && s.length < rule.min) return "tooShort";
  if (rule.max && s.length > rule.max) return "tooLong";
  if (rule.type === "email" && !EMAIL.test(s)) return "email";
  if (rule.type === "phone" && !SAUDI_MOBILE.test(s.replace(/[\s-]/g, ""))) return "phone";
  if (rule.oneOf && !rule.oneOf.includes(s)) return "required";
  return null;
}

export function validate(data: Record<string, unknown>, schema: Schema): FieldError[] {
  const errors: FieldError[] = [];
  for (const [field, rule] of Object.entries(schema)) {
    const code = validateField(data[field], rule);
    if (code) errors.push({ field, code });
  }
  return errors;
}

export const PROJECT_TYPES = ["buildings", "restoration", "roads", "power", "telecom", "structural", "other"] as const;
export const DURATIONS = ["lt3", "m3_6", "m6_12", "gt12", "unknown"] as const;
export const START_WINDOWS = ["immediate", "within1m", "within3m", "later", "unknown"] as const;
export const CONTACT_METHODS = ["phone", "whatsapp", "email"] as const;

export const quoteSchema: Schema = {
  name: { required: true, min: 2, max: 120 },
  company: { required: true, min: 2, max: 160 },
  jobTitle: { max: 120 },
  phone: { required: true, type: "phone" },
  email: { required: true, type: "email", max: 160 },
  projectType: { required: true, oneOf: PROJECT_TYPES },
  projectLocation: { required: true, min: 2, max: 160 },
  scopeOfWork: { required: true, min: 3, max: 400 },
  description: { required: true, min: 20, max: 4000 },
  startDate: { oneOf: START_WINDOWS },
  duration: { oneOf: DURATIONS },
  preferredContact: { required: true, oneOf: CONTACT_METHODS },
};

export const profileSchema: Schema = {
  name: { required: true, min: 2, max: 120 },
  company: { required: true, min: 2, max: 160 },
  jobTitle: { max: 120 },
  email: { required: true, type: "email", max: 160 },
  phone: { required: true, type: "phone" },
  reason: { required: true, min: 10, max: 1000 },
  relatedOpportunity: { max: 240 },
};

export const contactSchema: Schema = {
  name: { required: true, min: 2, max: 120 },
  company: { max: 160 },
  email: { required: true, type: "email", max: 160 },
  phone: { type: "phone" },
  subject: { required: true, min: 3, max: 160 },
  message: { required: true, min: 10, max: 3000 },
};
