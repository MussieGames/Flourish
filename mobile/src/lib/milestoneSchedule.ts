import { DEFAULT_FIRSTS, reminderCopy, type FirstDef } from '@/data/firsts';
import { parseISODate } from './age';

export type ReminderKind = 'ready' | 'window';

export interface ReminderJob {
  identifier: string;
  key: string;
  kind: ReminderKind;
  date: Date;
  title: string;
  body: string;
}

export const REMINDER_ID_PREFIX = 'flourish.ms.';
export const REMINDER_HOUR = 10;
/** iOS allows 64 pending local notifications — keep a conservative slice. */
export const MAX_SCHEDULED_REMINDERS = 16;

export function reminderIdentifier(key: string, kind: ReminderKind): string {
  return `${REMINDER_ID_PREFIX}${key}.${kind}`;
}

export function isFlourishReminderId(id: string): boolean {
  return id.startsWith(REMINDER_ID_PREFIX);
}

export function dateAtAgeWeeks(birth: Date, weeks: number, hour = REMINDER_HOUR): Date {
  const d = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate(), hour, 0, 0, 0);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function jobsForFirst(def: FirstDef, birth: Date, babyName: string, now: Date): ReminderJob[] {
  const jobs: ReminderJob[] = [];
  const push = (kind: ReminderKind, weeks: number) => {
    const date = dateAtAgeWeeks(birth, weeks);
    if (date.getTime() <= now.getTime()) return;
    const copy = reminderCopy(def, kind, babyName);
    jobs.push({
      identifier: reminderIdentifier(def.key, kind),
      key: def.key,
      kind,
      date,
      title: copy.title,
      body: copy.body,
    });
  };

  if (typeof def.remindWeeks === 'number') push('ready', def.remindWeeks);

  // Skip a second ping when it would land within three weeks of the first.
  if (
    typeof def.windowWeeks === 'number' &&
    (typeof def.remindWeeks !== 'number' || def.windowWeeks - def.remindWeeks >= 3)
  ) {
    push('window', def.windowWeeks);
  }

  return jobs;
}

/**
 * Build the next local-notification jobs for uncaptured catalogue firsts.
 * Pure — no native APIs — so it can be reasoned about without a device.
 */
export function upcomingReminderJobs(input: {
  birthDate: string | null | undefined;
  babyName: string;
  capturedKeys: Iterable<string>;
  now?: Date;
  limit?: number;
}): ReminderJob[] {
  const birth = parseISODate(input.birthDate);
  if (!birth) return [];

  const captured = new Set(input.capturedKeys);
  const now = input.now ?? new Date();
  const limit = input.limit ?? MAX_SCHEDULED_REMINDERS;

  const jobs: ReminderJob[] = [];
  for (const def of DEFAULT_FIRSTS) {
    if (captured.has(def.key)) continue;
    jobs.push(...jobsForFirst(def, birth, input.babyName, now));
  }

  jobs.sort((a, b) => a.date.getTime() - b.date.getTime());
  return jobs.slice(0, limit);
}
