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
 * This is not the full CDC checklist. We only include moments that belong in
 * a family scrapbook, then attach the most accurate public window we have:
 *
 * - CDC (Feb 2022, with AAP): age by which ≥75% of children can do it.
 * - WHO Motor Development Study: 1st–99th percentile window (healthy children).
 * - AAP: typical range for teething and starting solids.
 * - Flourish: family memories that are not developmental milestones.
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
    sourceNote:
      'Newborns already prefer a parent’s voice. CDC separately notes that most babies turn toward your voice by 4 months.',
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
    sourceNote: 'CDC: most babies look at your face by 2 months.',
    readyTitle: 'Camera ready · first look',
    readyBody:
      '{name} is around the age when held eye contact often appears. Keep the camera close.',
    windowTitle: 'Most babies look at your face by now',
    windowBody:
      'By around 2 months, most babies look at your face (CDC). If you’ve caught it, mark it. If not, there’s still time.',
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
    sourceNote:
      'CDC: most babies smile when you talk to or smile at them by 2 months. A social smile to get your attention is listed by 4 months.',
    readyTitle: 'Camera ready · first real smile',
    readyBody:
      '{name} is around 6 weeks — when real smiles often appear. Not a reflex. Have the camera up.',
    windowTitle: 'Most babies can smile at you by now',
    windowBody:
      'By around 2 months, most babies smile when you talk or smile at them (CDC). If you’ve already caught it, mark it.',
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
    sourceNote: 'CDC: most babies hold their head up when on their tummy by 2 months.',
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
    sourceNote: 'CDC: most babies chuckle (not yet a full laugh) by 4 months when you try to make them laugh.',
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
    sourceNote: 'CDC: most babies turn their head toward the sound of your voice by 4 months.',
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
    sourceNote: 'CDC: most babies laugh by 6 months. Many start a little earlier, after the first chuckle.',
    readyTitle: 'Camera ready · first laugh',
    readyBody:
      '{name} is around the age of a first real laugh. The sound you’ll try to cause on purpose forever.',
    windowTitle: 'Most babies laugh by now',
    windowBody:
      'By around 6 months, most babies laugh (CDC). If you’ve caught it, mark it. If not, keep being ridiculous.',
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
    sourceNote: 'CDC: most babies roll from tummy to back by 6 months. Back-to-tummy often comes later.',
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
      'AAP: start complementary foods around 6 months, and not before 4 months. Follow your child’s doctor.',
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
      'AAP: the first tooth often appears around 6–10 months. Some babies are born with a tooth; others wait past the first birthday. Wide is normal.',
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
      'WHO: sitting without support typically between 3.8 and 9.2 months (average about 6). CDC: most babies sit without support by 9 months.',
    readyTitle: 'Camera ready · sitting',
    readyBody:
      '{name} is entering the typical window for sitting without support (WHO: about 4–9 months). Hands-free is the shot.',
    windowTitle: 'Sitting often happens around now',
    windowBody:
      'On average, babies sit without support around 6 months (WHO). Most can by 9 months (CDC). Wide is normal.',
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
    sourceNote: 'CDC: most babies smile or laugh when you play peek-a-boo by 9 months.',
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
      'WHO: hands-and-knees crawling typically between 5.2 and 13.5 months. About 4% of children never crawl this way — they shuffle, roll, or go straight to walking.',
    graceNote:
      'Some babies skip crawling altogether — that’s a known variation, not a missed first. Bottom-shuffling and rolling count. Write what you remember.',
    readyTitle: 'Camera ready · on the move',
    readyBody:
      '{name} is entering the typical crawling window (WHO: about 5–13 months). Scooting and shuffling count too.',
    windowTitle: 'Crawling often happens around now',
    windowBody:
      'Average crawling is around 8½ months (WHO). Some babies never crawl on hands and knees — that’s a known variation.',
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
    sourceNote: 'CDC: most babies wave “bye-bye” by 12 months.',
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
      'CDC: most babies call a parent “mama” or “dada” (or another special name) by 12 months. True first words besides that often come a little later.',
    readyTitle: 'Listen for this one',
    readyBody:
      '{name} is around the age of “mama” or “dada” used for you. Keep an ear out — and maybe a video rolling.',
    windowTitle: 'Most babies name a parent by now',
    windowBody:
      'By around 12 months, most babies call a parent mama or dada or another special name (CDC).',
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
      'CDC: most babies pull up to stand by 12 months. WHO: standing with assistance typically 4.8–11.4 months; standing alone 6.9–16.9 months.',
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
      'WHO: walking with assistance typically 5.9–13.7 months. CDC: most babies walk holding on to furniture by 12 months.',
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
      'WHO: walking alone typically 8.2–17.6 months (average about 12). CDC: most children take a few steps on their own by 15 months, and walk without holding on by 18 months.',
    graceNote:
      'Walking has one of the widest healthy windows. Write what you remember — even if the first steps happened at grandma’s.',
    readyTitle: 'Camera ready · first steps',
    readyBody:
      '{name} is entering the typical window for first steps (WHO: about 8–18 months). Wobbling counts. Have the camera up.',
    windowTitle: 'First steps often happen around now',
    windowBody:
      'Average independent walking is around 12 months (WHO). Most take a few steps by 15 months (CDC). Wide is normal.',
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
      'CDC: most children try to say one or two words besides “mama” or “dada” by 15 months, and three or more by 18 months.',
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
      'CDC: most children point to show you something interesting by 18 months. Pointing to ask for help is listed by 15 months.',
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
    sourceNote: 'CDC: most children run by 2 years.',
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
      'CDC: most children say at least two words together by 2 years, like “more milk.” By 30 months many combine an action word (“doggie run”).',
    readyTitle: 'Listen for this one',
    readyBody:
      '{name} may start putting two words together. “More milk” is a whole sentence. Write it down.',
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
