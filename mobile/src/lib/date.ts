import type { Timestamp } from "firebase/firestore";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_LONG = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate();
  }
  return null;
}

/** "14 Apr 2026" */
export function formatShortDate(value: Timestamp | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Tuesday, 19 May 2026 · 6:42am" */
export function formatLongDateTime(
  value: Timestamp | Date | null | undefined,
): string {
  const d = toDate(value);
  if (!d) return "";
  const day = DAYS_LONG[d.getDay()];
  const time = formatTime(d);
  return `${day}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()} · ${time}`;
}

export function formatTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m}${ampm}`;
}

/** YYYY-MM-DD in local time. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface ChildAge {
  totalDays: number;
  weeks: number;
  days: number;
  months: number;
  years: number;
  /** Human-friendly summary, e.g. "8 weeks & 3 days old". */
  label: string;
}

export function computeAge(
  bornAt: Timestamp | Date | null | undefined,
  now: Date = new Date(),
): ChildAge | null {
  const born = toDate(bornAt);
  if (!born) return null;
  const ms = now.getTime() - born.getTime();
  const totalDays = Math.max(0, Math.floor(ms / 86_400_000));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  let months =
    (now.getFullYear() - born.getFullYear()) * 12 +
    (now.getMonth() - born.getMonth());
  if (now.getDate() < born.getDate()) months -= 1;
  months = Math.max(0, months);
  const years = Math.floor(months / 12);

  let label: string;
  if (totalDays < 7) {
    label = `${totalDays} ${totalDays === 1 ? "day" : "days"} old`;
  } else if (months < 3) {
    label = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    if (days > 0) label += ` & ${days} ${days === 1 ? "day" : "days"}`;
    label += " old";
  } else if (years < 2) {
    label = `${months} months old`;
  } else {
    label = `${years} years old`;
  }

  return { totalDays, weeks, days, months, years, label };
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
