import type { IconName } from '@/components/Icon';
import {
  ERA_ORDER,
  MISSED_GRACE_WEEKS,
  NEAR_AHEAD_WEEKS,
  type MilestoneDomain,
  type MilestoneEra,
  type MilestoneSource,
} from './growth';

/**
 * Curated "firsts" a parent can photograph and keep.
 *
 * This is not a health checklist. We only include moments that belong in a
 * family scrapbook, then attach a typical window in plain language:
 *
 * - Early years: ages when many children do something (from WHO and national
 *   child-health guidance). Never stamped as a deadline.
 * - Flourish family firsts: bath, birthdays, first day of school, sleepover.
 *   No “most children by…” language. School start is whatever year is theirs.
 *
 * Reminders fire at `remindWeeks` ("camera ready") and, when the two dates
 * are far enough apart, again at `windowWeeks` ("most babies by now").
 * Missing a window is never treated as delay.
 */

export interface FirstDef {
  key: string;
  label: string;
  icon: IconName;
  typicalAge: string;
  description: string;
  typicalWeeksMin: number;
  typicalWeeksMax: number;
  /** Week of age for the "camera ready" reminder. Omit to skip notifications. */
  remindWeeks?: number;
  /** Week of age for the quieter "most babies by now" ping. */
  windowWeeks?: number;
  source: MilestoneSource;
  domain: MilestoneDomain;
  era: MilestoneEra;
  /** Honest line for the learn-more screen. */
  sourceNote: string;
  /** Used only in the passed-but-not-lost state. */
  graceNote?: string;
  readyTitle?: string;
  readyBody?: string;
  windowTitle?: string;
  windowBody?: string;
}

function fillName(template: string, name: string): string {
  return template.split('{name}').join(name);
}

export function reminderCopy(
  def: FirstDef,
  kind: 'ready' | 'window',
  babyName: string,
): { title: string; body: string } {
  const name = babyName.trim() || 'your baby';
  if (kind === 'ready') {
    return {
      title: fillName(def.readyTitle ?? `Camera ready · ${def.label.toLowerCase()}`, name),
      body: fillName(
        def.readyBody ??
          `{name} is around the age when this often appears. Keep the camera close — not because it has to happen today.`,
        name,
      ),
    };
  }
  return {
    title: fillName(def.windowTitle ?? `Most babies · ${def.label.toLowerCase()}`, name),
    body: fillName(
      def.windowBody ??
        `Most children can do this by around ${def.typicalAge}. If you’ve already caught it, mark it. If not, there’s still time.`,
      name,
    ),
  };
}

export const DEFAULT_FIRSTS: FirstDef[] = [
  {
    key: 'first-day-home',
    label: 'First day home',
    icon: 'home-outline',
    typicalAge: 'Day 1–2',
    typicalWeeksMin: 0,
    typicalWeeksMax: 1,
    source: 'flourish',
    domain: 'memory',
    era: 'newborn',
    description: 'The front door closes and it’s just you. Terrifying. Perfect.',
    sourceNote: 'A family first — not a developmental milestone.',
    graceNote: 'Write what you remember. Even the smell of the hallway counts.',
  },
  {
    key: 'first-bath',
    label: 'First bath',
    icon: 'water-outline',
    typicalAge: 'Week 1',
    typicalWeeksMin: 0,
    typicalWeeksMax: 3,
    source: 'flourish',
    domain: 'memory',
    era: 'newborn',
    description: 'Tiny, slippery, indignant. You’ll both survive it, and laugh later.',
    sourceNote: 'A family first — timing is whatever felt right for you.',
    graceNote: 'Sponge baths count. Write the face they pulled.',
  },
  {
    key: 'recognised-voice',
    label: 'Recognised your voice',
    icon: 'ear-outline',
    typicalAge: 'From the start',
    typicalWeeksMin: 0,
    typicalWeeksMax: 6,
    remindWeeks: 2,
    source: 'flourish',
    domain: 'memory',
    era: 'newborn',
    description: 'They still and settle when you speak. They knew you before they saw you.',
    sourceNote: 'A family first — they knew your voice before they saw you.',
    readyTitle: 'Listen for this one',
    readyBody:
      '{name} may already still when you speak. It’s a quiet first — easy to miss, worth keeping.',
  },
  {
    key: 'first-eye-contact',
    label: 'First eye contact',
    icon: 'eye-outline',
    typicalAge: 'Most by 2 months',
    typicalWeeksMin: 4,
    typicalWeeksMax: 10,
    remindWeeks: 4,
    windowWeeks: 8,
    source: 'cdc',
    domain: 'social',
    era: '2mo',
    description: 'The first time they truly look at you — and hold it. You’ll feel it.',
    sourceNote: 'Most babies look at your face by around 2 months.',
    readyTitle: 'Camera ready · first look',
    readyBody:
      '{name} is around the age when held eye contact often appears. Keep the camera close.',
    windowTitle: 'Most babies look at your face by now',
    windowBody:
      'Most babies look at your face by around 2 months. If you’ve caught it, mark it. If not, there’s still time.',
  },
  {
    key: 'first-smile',
    label: 'First real smile',
    icon: 'happy-outline',
    typicalAge: 'Most by 2 months',
    typicalWeeksMin: 6,
    typicalWeeksMax: 10,
    remindWeeks: 5,
    windowWeeks: 8,
    source: 'cdc',
    domain: 'social',
    era: '2mo',
    description: 'Not a reflex. Full face. Eyes crinkling. This one will stop your heart.',
    sourceNote: 'Most babies smile at you by around 2 months.',
    readyTitle: 'Camera ready · first real smile',
    readyBody:
      '{name} is around 6 weeks — when real smiles often appear. Not a reflex. Have the camera up.',
    windowTitle: 'Most babies can smile at you by now',
    windowBody:
      'Most babies smile at you by around 2 months. If you’ve already caught it, mark it.',
  },
  {
    key: 'tummy-head-up',
    label: 'Head up on tummy',
    icon: 'fitness-outline',
    typicalAge: 'Most by 2 months',
    typicalWeeksMin: 4,
    typicalWeeksMax: 10,
    remindWeeks: 4,
    windowWeeks: 8,
    source: 'cdc',
    domain: 'motor',
    era: '2mo',
    description: 'A small lift, a lot of effort. The first time they hold the world a little higher.',
    sourceNote: 'Most babies hold their head up on tummy by around 2 months.',
    readyTitle: 'Camera ready · tummy time',
    readyBody: '{name} may start lifting their head during tummy time. A small lift is a whole first.',
  },
  {
    key: 'first-chuckle',
    label: 'First chuckle',
    icon: 'musical-notes-outline',
    typicalAge: 'Most by 4 months',
    typicalWeeksMin: 10,
    typicalWeeksMax: 18,
    remindWeeks: 10,
    windowWeeks: 16,
    source: 'cdc',
    domain: 'social',
    era: '4mo',
    description: 'Not yet a full laugh — a little catch in the chest that means they’re in on it.',
    sourceNote: 'Most babies chuckle — not yet a full laugh — by around 4 months.',
    readyTitle: 'Camera ready · first chuckle',
    readyBody:
      '{name} is around the age of the first chuckle — not a full laugh yet. You’ll know it when you hear it.',
  },
  {
    key: 'turns-to-voice',
    label: 'Turned toward your voice',
    icon: 'mic-outline',
    typicalAge: 'Most by 4 months',
    typicalWeeksMin: 10,
    typicalWeeksMax: 18,
    remindWeeks: 12,
    windowWeeks: 16,
    source: 'cdc',
    domain: 'language',
    era: '4mo',
    description: 'You speak from across the room. They find you.',
    sourceNote: 'Most babies turn toward your voice by around 4 months.',
    readyTitle: 'Listen for this one',
    readyBody: 'Call {name} from the side. The first time they turn to find you is worth keeping.',
  },
  {
    key: 'first-giggle',
    label: 'First laugh',
    icon: 'happy-outline',
    typicalAge: 'Most by 6 months',
    typicalWeeksMin: 14,
    typicalWeeksMax: 28,
    remindWeeks: 14,
    windowWeeks: 22,
    source: 'cdc',
    domain: 'social',
    era: '6mo',
    description: 'The sound you’ll spend the rest of your life trying to cause on purpose.',
    sourceNote: 'Most babies laugh by around 6 months. Many start a little earlier, after the first chuckle.',
    readyTitle: 'Camera ready · first laugh',
    readyBody:
      '{name} is around the age of a first real laugh. The sound you’ll try to cause on purpose forever.',
    windowTitle: 'Most babies laugh by now',
    windowBody:
      'Most babies laugh by around 6 months. If you’ve caught it, mark it. If not, keep being ridiculous.',
  },
  {
    key: 'first-roll',
    label: 'First roll over',
    icon: 'sync-outline',
    typicalAge: 'Most by 6 months',
    typicalWeeksMin: 16,
    typicalWeeksMax: 28,
    remindWeeks: 16,
    windowWeeks: 24,
    source: 'cdc',
    domain: 'motor',
    era: '6mo',
    description: 'One day they’re where you left them. The next, they’re not.',
    sourceNote: 'Most babies roll from tummy to back by around 6 months. Back-to-tummy often comes later.',
    readyTitle: 'Camera ready · first roll',
    readyBody:
      '{name} may start rolling tummy to back. Don’t leave the room. Do keep the camera nearby.',
  },
  {
    key: 'first-food',
    label: 'First taste of food',
    icon: 'restaurant-outline',
    typicalAge: 'Around 6 months',
    typicalWeeksMin: 17,
    typicalWeeksMax: 32,
    remindWeeks: 22,
    windowWeeks: 26,
    source: 'aap',
    domain: 'memory',
    era: '6mo',
    description: 'The face they pull. Somewhere between betrayal and wonder.',
    sourceNote:
      'Most families start solids around 6 months, and not before 4. Follow your GP or child-health nurse.',
    readyTitle: 'Camera ready · first taste',
    readyBody:
      'If you’re starting solids with {name}, have the camera up. The face they pull is the whole story.',
  },
  {
    key: 'first-tooth',
    label: 'First tooth',
    icon: 'sparkles-outline',
    typicalAge: 'Usually 6–10 months',
    typicalWeeksMin: 17,
    typicalWeeksMax: 65,
    remindWeeks: 22,
    source: 'aap',
    domain: 'memory',
    era: '6mo',
    description: 'A tiny sharp surprise. The gummy smile changes forever after this.',
    sourceNote:
      'The first tooth often appears around 6–10 months. Some babies are born with a tooth; others wait past the first birthday. Wide is normal.',
    graceNote: 'Late teeth are common. Write the day you felt it — even if the photo came later.',
    readyTitle: 'Camera ready · first tooth',
    readyBody:
      '{name} is in the typical window for a first tooth (often 6–10 months). A tiny white edge counts.',
  },
  {
    key: 'sits-unsupported',
    label: 'Sat without support',
    icon: 'body-outline',
    typicalAge: 'Usually 4–9 months',
    typicalWeeksMin: 17,
    typicalWeeksMax: 40,
    remindWeeks: 16,
    windowWeeks: 26,
    source: 'who',
    domain: 'motor',
    era: '9mo',
    description: 'Hands free. The room looks different from here.',
    sourceNote:
      'Sitting without support typically happens sometime between about 4 and 9 months. Wide is normal.',
    readyTitle: 'Camera ready · sitting',
    readyBody:
      '{name} is entering the typical window for sitting without support (about 4–9 months). Hands-free is the shot.',
    windowTitle: 'Sitting often happens around now',
    windowBody:
      'On average, babies sit without support around 6 months. Most can by 9. Wide is normal.',
  },
  {
    key: 'peekaboo',
    label: 'First peek-a-boo laugh',
    icon: 'eye-off-outline',
    typicalAge: 'Most by 9 months',
    typicalWeeksMin: 26,
    typicalWeeksMax: 42,
    remindWeeks: 28,
    windowWeeks: 38,
    source: 'cdc',
    domain: 'social',
    era: '9mo',
    description: 'You disappear. You come back. They think you’re a genius.',
    sourceNote: 'Most babies smile or laugh at peek-a-boo by around 9 months.',
    readyTitle: 'Camera ready · peek-a-boo',
    readyBody: 'Hands over your face, then “boo.” {name} may be ready to be in on the joke.',
  },
  {
    key: 'first-crawl',
    label: 'First crawl',
    icon: 'trending-up-outline',
    typicalAge: 'Usually 5–13 months',
    typicalWeeksMin: 23,
    typicalWeeksMax: 59,
    remindWeeks: 22,
    windowWeeks: 37,
    source: 'who',
    domain: 'motor',
    era: '9mo',
    description: 'The moment the world stopped being a place you carried them through.',
    sourceNote:
      'Hands-and-knees crawling typically happens sometime between about 5 and 13 months. Some babies never crawl this way — they shuffle, roll, or go straight to walking.',
    graceNote:
      'Some babies skip crawling altogether — that’s a known variation, not a missed first. Bottom-shuffling and rolling count. Write what you remember.',
    readyTitle: 'Camera ready · on the move',
    readyBody:
      '{name} is entering the typical crawling window (about 5–13 months). Scooting and shuffling count too.',
    windowTitle: 'Crawling often happens around now',
    windowBody:
      'Average crawling is around 8½ months. Some babies never crawl on hands and knees — that’s a known variation.',
  },
  {
    key: 'waves-bye',
    label: 'Waved bye-bye',
    icon: 'hand-left-outline',
    typicalAge: 'Most by 12 months',
    typicalWeeksMin: 36,
    typicalWeeksMax: 54,
    remindWeeks: 40,
    windowWeeks: 50,
    source: 'cdc',
    domain: 'language',
    era: '12mo',
    description: 'A little open-and-close of the hand that means they know you’re leaving — and coming back.',
    sourceNote: 'Most babies wave bye-bye by around 12 months.',
    readyTitle: 'Camera ready · bye-bye',
    readyBody: '{name} may start waving. It’s a tiny gesture and a whole sentence.',
  },
  {
    key: 'first-word',
    label: 'Called you mama or dada',
    icon: 'chatbubble-outline',
    typicalAge: 'Most by 12 months',
    typicalWeeksMin: 36,
    typicalWeeksMax: 54,
    remindWeeks: 36,
    windowWeeks: 50,
    source: 'cdc',
    domain: 'language',
    era: '12mo',
    description: 'It might not be the name you hoped for first. It’ll be perfect anyway.',
    sourceNote:
      'Most babies call a parent mama or dada — or another special name — by around 12 months. True first words besides that often come a little later.',
    readyTitle: 'Listen for this one',
    readyBody:
      '{name} is around the age of “mama” or “dada” used for you. Keep an ear out — and maybe a video rolling.',
    windowTitle: 'Most babies name a parent by now',
    windowBody:
      'Most babies call a parent mama or dada — or another special name — by around 12 months.',
  },
  {
    key: 'pulls-to-stand',
    label: 'Pulled up to stand',
    icon: 'arrow-up-outline',
    typicalAge: 'Most by 12 months',
    typicalWeeksMin: 30,
    typicalWeeksMax: 54,
    remindWeeks: 30,
    windowWeeks: 48,
    source: 'cdc',
    domain: 'motor',
    era: '12mo',
    description: 'Furniture is no longer furniture. It’s a ladder.',
    sourceNote:
      'Most babies pull up to stand by around 12 months. Standing alone often comes later, and the window is wide.',
    readyTitle: 'Camera ready · pulling up',
    readyBody:
      '{name} may start using the sofa as a ladder. Stay close — and get the shot of those knees.',
  },
  {
    key: 'cruising',
    label: 'Walked holding on',
    icon: 'git-commit-outline',
    typicalAge: 'Most by 12 months',
    typicalWeeksMin: 26,
    typicalWeeksMax: 60,
    remindWeeks: 32,
    windowWeeks: 50,
    source: 'who',
    domain: 'motor',
    era: '12mo',
    description: 'Sideways along the sofa. A rehearsal for the real thing.',
    sourceNote:
      'Walking while holding on typically happens sometime between about 6 and 14 months. Most babies cruise by around 12 months.',
    readyTitle: 'Camera ready · cruising',
    readyBody:
      '{name} may start walking while holding furniture. Sideways along the sofa counts.',
  },
  {
    key: 'first-birthday',
    label: 'First birthday',
    icon: 'gift-outline',
    typicalAge: '12 months',
    typicalWeeksMin: 52,
    typicalWeeksMax: 54,
    remindWeeks: 50,
    source: 'flourish',
    domain: 'memory',
    era: '12mo',
    description: 'One whole year. The cake is optional. The photo is not.',
    sourceNote: 'A family first — the day itself.',
    readyTitle: 'One year is almost here',
    readyBody:
      '{name}’s first birthday is in about two weeks. Set aside one quiet photo that isn’t of the cake.',
  },
  {
    key: 'first-steps',
    label: 'First steps',
    icon: 'walk-outline',
    typicalAge: 'Usually 8–18 months',
    typicalWeeksMin: 36,
    typicalWeeksMax: 78,
    remindWeeks: 36,
    windowWeeks: 53,
    source: 'who',
    domain: 'motor',
    era: '15mo',
    description: 'Wobbling, arms out, aiming straight for you. Have the camera up.',
    sourceNote:
      'Walking alone typically happens sometime between about 8 and 18 months (average around 12). Most take a few steps by 15 months.',
    graceNote:
      'Walking has one of the widest healthy windows. Write what you remember — even if the first steps happened at grandma’s.',
    readyTitle: 'Camera ready · first steps',
    readyBody:
      '{name} is entering the typical window for first steps (about 8–18 months). Wobbling counts. Have the camera up.',
    windowTitle: 'First steps often happen around now',
    windowBody:
      'Average independent walking is around 12 months. Most take a few steps by 15 months. Wide is normal.',
  },
  {
    key: 'first-other-word',
    label: 'A word besides mama or dada',
    icon: 'chatbubbles-outline',
    typicalAge: 'Most by 15 months',
    typicalWeeksMin: 48,
    typicalWeeksMax: 68,
    remindWeeks: 52,
    windowWeeks: 64,
    source: 'cdc',
    domain: 'language',
    era: '15mo',
    description: '“Ba” for ball. “Da” for dog. You’ll never forget which one it was.',
    sourceNote:
      'Most children try one or two words besides mama or dada by around 15 months, and three or more by 18 months.',
    readyTitle: 'Listen for this one',
    readyBody:
      '{name} may try a word besides mama or dada — “ba” for ball counts. Keep an ear out.',
  },
  {
    key: 'points-to-show',
    label: 'Pointed to show you something',
    icon: 'navigate-outline',
    typicalAge: 'Most by 18 months',
    typicalWeeksMin: 56,
    typicalWeeksMax: 82,
    remindWeeks: 60,
    windowWeeks: 76,
    source: 'cdc',
    domain: 'social',
    era: '18mo',
    description: 'Not asking. Sharing. Look. This. With you.',
    sourceNote:
      'Most children point to show you something interesting by around 18 months. Pointing to ask for help often comes a little earlier.',
    readyTitle: 'Camera ready · look at this',
    readyBody:
      '{name} may start pointing to share something — not to ask, just to say “look.” That’s a first.',
  },
  {
    key: 'first-run',
    label: 'First run',
    icon: 'flash-outline',
    typicalAge: 'Most by 2 years',
    typicalWeeksMin: 78,
    typicalWeeksMax: 108,
    remindWeeks: 90,
    windowWeeks: 102,
    source: 'cdc',
    domain: 'motor',
    era: '24mo',
    description: 'Walking, but with joy in it. You’ll have to pick up the pace.',
    sourceNote: 'Most children run by around 2 years.',
    readyTitle: 'Camera ready · first run',
    readyBody: '{name} may start running — walking, but with joy in it. Have the camera up.',
  },
  {
    key: 'two-word-phrase',
    label: 'Two words together',
    icon: 'text-outline',
    typicalAge: 'Most by 2 years',
    typicalWeeksMin: 78,
    typicalWeeksMax: 108,
    remindWeeks: 90,
    windowWeeks: 102,
    source: 'cdc',
    domain: 'language',
    era: '24mo',
    description: '“More milk.” A whole sentence, as far as you’re concerned.',
    sourceNote:
      'Most children say at least two words together by around 2 years, like “more milk.” By 2½ many combine an action word (“doggie run”).',
    readyTitle: 'Listen for this one',
    readyBody:
      '{name} may start putting two words together. “More milk” is a whole sentence. Write it down.',
  },
  {
    key: 'first-lost-tooth',
    label: 'First lost tooth',
    icon: 'sparkles-outline',
    typicalAge: 'Around 5–7 years',
    typicalWeeksMin: 260,
    typicalWeeksMax: 416,
    remindWeeks: 250,
    source: 'flourish',
    domain: 'memory',
    era: 'school',
    description: 'A wobbly goodbye, a pillow, and a story you’ll both tell forever.',
    sourceNote: 'A family first — not a developmental milestone. Capture the gap-toothed grin.',
    graceNote: 'Whenever it happened, write what you remember — even if the tooth fairy got there first.',
    readyTitle: 'The tooth years are coming',
    readyBody:
      '{name} may be heading into the wobbly-tooth years. A gap-toothed grin is worth keeping.',
  },
  {
    key: 'first-day-school',
    label: 'First day of school',
    icon: 'school-outline',
    typicalAge: 'You set the year',
    typicalWeeksMin: 208,
    typicalWeeksMax: 364,
    source: 'flourish',
    domain: 'memory',
    era: 'school',
    description: 'The bag is too big. The photo on the steps is the one you’ll keep.',
    sourceNote:
      'A family first — school starts at different times around the world. Capture the day that is theirs.',
    graceNote: 'Whenever it happened, write what you remember — the bag, the steps, the face.',
  },
  {
    key: 'first-sleepover',
    label: 'First sleepover',
    icon: 'moon-outline',
    typicalAge: 'When they’re ready',
    typicalWeeksMin: 260,
    typicalWeeksMax: 624,
    source: 'flourish',
    domain: 'memory',
    era: 'school',
    description: 'Someone else’s house. Your phone nearby. A morning-after story.',
    sourceNote: 'A family first — whenever they (and you) were ready.',
    graceNote: 'A night at grandma’s counts. Write the bit you remember.',
  },
];

export function defForKey(key: string | undefined | null): FirstDef | undefined {
  if (!key) return undefined;
  return DEFAULT_FIRSTS.find((f) => f.key === key);
}

/** Icon lookup by milestone key, with a graceful fallback for custom firsts. */
export function iconForFirst(key: string | undefined): IconName {
  return defForKey(key)?.icon ?? 'star-outline';
}

export function eraForFirst(key: string | undefined): MilestoneEra | null {
  return defForKey(key)?.era ?? null;
}

export function compareFirsts(aKey: string, bKey: string): number {
  const a = defForKey(aKey);
  const b = defForKey(bKey);
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const era = ERA_ORDER.indexOf(a.era) - ERA_ORDER.indexOf(b.era);
  if (era !== 0) return era;
  return a.typicalWeeksMin - b.typicalWeeksMin;
}

export function windowFor(
  key: string | undefined,
  fallbackMax?: number,
): { min: number; max: number } | null {
  const def = defForKey(key);
  if (def) return { min: def.typicalWeeksMin, max: def.typicalWeeksMax };
  if (typeof fallbackMax === 'number') return { min: 0, max: fallbackMax };
  return null;
}

export function isMissedFirst(
  key: string | undefined,
  ageWeeks: number,
  fallbackMax?: number,
): boolean {
  const w = windowFor(key, fallbackMax);
  if (!w) return false;
  return ageWeeks > w.max + MISSED_GRACE_WEEKS;
}

export function isNearFirst(
  key: string | undefined,
  ageWeeks: number,
  fallbackMax?: number,
): boolean {
  const w = windowFor(key, fallbackMax);
  if (!w) return false;
  return ageWeeks >= w.min - NEAR_AHEAD_WEEKS && ageWeeks <= w.max + MISSED_GRACE_WEEKS;
}

export interface MilestoneLike {
  id: string;
  key: string;
  status: string;
  typicalWeeksMax?: number;
}

export function sortMilestones<T extends MilestoneLike>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'captured' ? 1 : -1;
    return compareFirsts(a.key, b.key);
  });
}

export function featuredUpcoming<T extends MilestoneLike>(items: T[], ageWeeks: number): T | undefined {
  const upcoming = items.filter((m) => m.status === 'upcoming' && !isMissedFirst(m.key, ageWeeks, m.typicalWeeksMax));
  const near = upcoming.filter((m) => isNearFirst(m.key, ageWeeks, m.typicalWeeksMax));
  const pool = near.length ? near : upcoming;
  return sortMilestones(pool)[0];
}
