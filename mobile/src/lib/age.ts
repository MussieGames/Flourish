/** Parse an ISO yyyy-mm-dd string into a Date at local midnight. */
export function parseISODate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface AgeBreakdown {
  totalDays: number;
  weeks: number;
  days: number;
  months: number;
  years: number;
  label: string;
}

/** Human-friendly age description (e.g. "8 weeks & 3 days old"). */
export function computeAge(birthISO: string | null | undefined, now = new Date()): AgeBreakdown | null {
  const birth = parseISODate(birthISO);
  if (!birth) return null;

  const ms = now.getTime() - birth.getTime();
  const totalDays = Math.max(0, Math.floor(ms / 86_400_000));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  months = Math.max(0, months);
  const years = Math.floor(months / 12);

  let label: string;
  if (totalDays < 14) {
    label = `${totalDays} ${totalDays === 1 ? 'day' : 'days'} old`;
  } else if (months < 4) {
    label = `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    if (days > 0) label += ` & ${days} ${days === 1 ? 'day' : 'days'}`;
    label += ' old';
  } else if (years < 2) {
    label = `${months} months old`;
  } else {
    const remMonths = months % 12;
    label = `${years} ${years === 1 ? 'year' : 'years'}`;
    if (remMonths > 0) label += ` & ${remMonths} mo`;
    label += ' old';
  }

  return { totalDays, weeks, days, months, years, label };
}

export function ageInYears(birthISO: string | null | undefined, now = new Date()): number {
  const age = computeAge(birthISO, now);
  return age ? age.years : 0;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

export function formatLongDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function monthName(monthIndex: number): string {
  return MONTHS[((monthIndex % 12) + 12) % 12];
}

export function monthShort(monthIndex: number): string {
  return MONTHS_SHORT[((monthIndex % 12) + 12) % 12];
}
