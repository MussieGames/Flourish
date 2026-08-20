import type { Timestamp } from 'firebase/firestore';
import { monthShort } from './age';

export function tsToDate(ts: Timestamp | null | undefined): Date | null {
  if (!ts) return null;
  try {
    return ts.toDate();
  } catch {
    return null;
  }
}

export function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${hours}:${minutes}${ampm}`;
}

/** "Today, 7:14pm" · "Yesterday" · "3 days ago" · "14 Apr". */
export function formatRelative(date: Date | null, now = new Date()): string {
  if (!date) return '';
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (dayDiff === 0) return `Today, ${formatTime(date)}`;
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} days ago`;
  return `${date.getDate()} ${monthShort(date.getMonth())}`;
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * A warm, time-aware greeting. At the small hours it acknowledges the parent
 * who's up feeding — the line people quote as "Flourish says the nicest things
 * at 3am." Returns the full sentence (not uppercased).
 */
export function warmGreeting(now = new Date()): string {
  const h = now.getHours();
  if (h >= 0 && h < 5) return 'Still up? You’re doing something extraordinary right now.';
  if (h < 12) return 'Good morning. A new day with them.';
  if (h < 18) return 'Good afternoon.';
  if (h < 22) return 'Good evening.';
  return 'A quiet night together.';
}

/** True in the small hours — lets screens choose a gentler, nighttime tone. */
export function isSmallHours(now = new Date()): boolean {
  const h = now.getHours();
  return h >= 0 && h < 5;
}
