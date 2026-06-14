/**
 * Client-side validation & sanitization. This is a usability layer — the
 * authoritative checks live in Firestore Security Rules. We still validate
 * here to give immediate feedback and to avoid sending obviously bad data.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export interface PasswordStrength {
  ok: boolean;
  score: number; // 0–4
  problems: string[];
}

/** Enforce a reasonably strong password before hitting Firebase. */
export function checkPassword(password: string): PasswordStrength {
  const problems: string[] = [];
  if (password.length < 10) problems.push('Use at least 10 characters');
  if (!/[a-z]/.test(password)) problems.push('Add a lowercase letter');
  if (!/[A-Z]/.test(password)) problems.push('Add an uppercase letter');
  if (!/[0-9]/.test(password)) problems.push('Add a number');
  if (!/[^A-Za-z0-9]/.test(password)) problems.push('Add a symbol');

  let score = 0;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return { ok: problems.length === 0, score, problems };
}

/**
 * Trims, collapses whitespace and strips control characters from free text.
 * Limits length defensively to avoid oversized documents.
 */
export function sanitizeText(input: string, maxLength = 2000): string {
  return input
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/** A baby name: letters, spaces, hyphens, apostrophes; 1–40 chars. */
export function sanitizeName(input: string): string {
  return sanitizeText(input, 40).replace(/[^\p{L}\p{M} '\-.]/gu, '');
}

export function isValidName(input: string): boolean {
  const cleaned = sanitizeName(input);
  return cleaned.length >= 1 && cleaned.length <= 40;
}
