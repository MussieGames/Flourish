/**
 * Client-side validation & sanitization helpers.
 *
 * These are a first line of defence for UX. They are intentionally mirrored by
 * the Firestore security rules (see `firestore.rules`) so that a malicious or
 * modified client can never bypass them — the server enforces the same limits.
 */

export const LIMITS = {
  childName: { min: 1, max: 40 },
  email: { max: 254 },
  password: { min: 8, max: 128 },
  journalText: { max: 4000 },
  memoryTitle: { max: 120 },
  caption: { max: 280 },
  tag: { max: 24 },
  tagsCount: 8,
  eventTitle: { max: 120 },
  eventMeta: { max: 200 },
} as const;

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Collapse whitespace and trim. Strips control characters. */
export function sanitizeText(value: string): string {
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Trim + clamp to a maximum length without throwing. */
export function clampText(value: string, max: number): string {
  const clean = sanitizeText(value);
  return clean.length > max ? clean.slice(0, max) : clean;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length <= LIMITS.email.max && EMAIL_RE.test(trimmed);
}

export type PasswordStrength = {
  valid: boolean;
  score: 0 | 1 | 2 | 3 | 4;
  reasons: string[];
};

/**
 * Enforce a strong-but-humane password policy. We require length plus variety,
 * and reject the most common weak patterns. (Firebase Auth also has its own
 * server-side password policy that should be enabled in the console.)
 */
export function checkPassword(password: string): PasswordStrength {
  const reasons: string[] = [];
  if (password.length < LIMITS.password.min) {
    reasons.push(`Use at least ${LIMITS.password.min} characters.`);
  }
  if (password.length > LIMITS.password.max) {
    reasons.push("That password is too long.");
  }

  let variety = 0;
  if (/[a-z]/.test(password)) variety++;
  if (/[A-Z]/.test(password)) variety++;
  if (/[0-9]/.test(password)) variety++;
  if (/[^A-Za-z0-9]/.test(password)) variety++;
  if (variety < 3) {
    reasons.push("Mix upper, lower case, numbers or symbols.");
  }

  if (/^(.)\1+$/.test(password)) {
    reasons.push("Avoid repeating a single character.");
  }
  const COMMON = ["password", "12345678", "qwerty", "letmein", "flourish"];
  if (COMMON.some((c) => password.toLowerCase().includes(c))) {
    reasons.push("Avoid common words.");
  }

  const lengthScore = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0;
  const rawScore = Math.min(4, lengthScore + Math.max(0, variety - 1));
  const score = (reasons.length === 0 ? rawScore : Math.min(rawScore, 2)) as
    | 0
    | 1
    | 2
    | 3
    | 4;

  return { valid: reasons.length === 0, score, reasons };
}

export function isValidChildName(name: string): boolean {
  const clean = sanitizeText(name);
  return (
    clean.length >= LIMITS.childName.min && clean.length <= LIMITS.childName.max
  );
}

/** Normalize a user-entered tag list into a safe, de-duplicated array. */
export function sanitizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const clean = clampText(raw, LIMITS.tag.max);
    const key = clean.toLowerCase();
    if (clean && !seen.has(key)) {
      seen.add(key);
      out.push(clean);
      if (out.length >= LIMITS.tagsCount) break;
    }
  }
  return out;
}
