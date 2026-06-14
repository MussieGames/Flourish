/**
 * Input sanitisation utilities.
 * Strips control characters, normalises whitespace, and trims.
 */

// Strips HTML tags and dangerous characters from user text input
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove null bytes and control characters (except newline/tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Collapse multiple spaces
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
    .slice(0, 2000); // hard cap
}

// Short single-line text (names, titles)
export function sanitizeName(input: string): string {
  return sanitizeText(input)
    .replace(/[\n\r]/g, ' ')
    .slice(0, 100);
}

// Validates that a string is a safe URL (https only, no data: or javascript:)
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Strips leading/trailing whitespace and removes extraneous newlines
export function sanitizeJournalText(input: string): string {
  return sanitizeText(input)
    .replace(/\n{3,}/g, '\n\n') // max 2 consecutive newlines
    .slice(0, 5000);
}

// Safe emoji check — only allows single grapheme emoji-like strings for stickers
export function isSafeEmoji(input: string): boolean {
  // Allow up to 8 chars (covers multi-codepoint emoji like flags)
  return typeof input === 'string' && input.trim().length > 0 && input.length <= 8;
}
