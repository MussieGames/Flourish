import type { IconName } from '@/components/Icon';

/** Default catalogue of "firsts" a parent can track. */
export interface FirstDef {
  key: string;
  label: string;
  /** Premium line icon (no emoji). */
  icon: IconName;
  typicalAge: string;
  /** Written in Flourish's voice — warm, honest — not a medical handbook. */
  description: string;
  /** Approx end of the typical window in weeks, used to surface a gentle
   *  "missed — write what you remember" state once it has clearly passed. */
  typicalWeeksMax: number;
}

export const DEFAULT_FIRSTS: FirstDef[] = [
  {
    key: 'first-day-home',
    label: 'First day home',
    icon: 'home-outline',
    typicalAge: 'Day 1–2',
    description: 'The front door closes and it’s just you three. Terrifying. Perfect.',
    typicalWeeksMax: 1,
  },
  {
    key: 'first-bath',
    label: 'First bath',
    icon: 'water-outline',
    typicalAge: 'Week 1',
    description: 'Tiny, slippery, indignant. You’ll both survive it, and laugh later.',
    typicalWeeksMax: 3,
  },
  {
    key: 'recognised-voice',
    label: 'Recognised your voice',
    icon: 'ear-outline',
    typicalAge: 'Week 3–4',
    description: 'They still and settle when you speak. They knew you before they saw you.',
    typicalWeeksMax: 6,
  },
  {
    key: 'first-eye-contact',
    label: 'First eye contact',
    icon: 'eye-outline',
    typicalAge: 'Week 4–6',
    description: 'The first time they truly look at you — and hold it. You’ll feel it.',
    typicalWeeksMax: 8,
  },
  {
    key: 'first-smile',
    label: 'First real smile',
    icon: 'happy-outline',
    typicalAge: 'Week 6–8',
    description: 'Not a reflex. Full face. Eyes crinkling. This one will stop your heart.',
    typicalWeeksMax: 10,
  },
  {
    key: 'first-giggle',
    label: 'First giggle',
    icon: 'musical-notes-outline',
    typicalAge: '~3–4 months',
    description: 'The sound you’ll spend the rest of your life trying to cause on purpose.',
    typicalWeeksMax: 20,
  },
  {
    key: 'first-roll',
    label: 'First roll over',
    icon: 'sync-outline',
    typicalAge: '~4–6 months',
    description: 'One day they’re where you left them. The next, they’re not.',
    typicalWeeksMax: 28,
  },
  {
    key: 'first-food',
    label: 'First taste of food',
    icon: 'restaurant-outline',
    typicalAge: '~6 months',
    description: 'The face they pull. Somewhere between betrayal and wonder.',
    typicalWeeksMax: 32,
  },
  {
    key: 'first-tooth',
    label: 'First tooth',
    icon: 'sparkles-outline',
    typicalAge: '~4–7 months',
    description: 'A tiny sharp surprise. The gummy smile changes forever after this.',
    typicalWeeksMax: 34,
  },
  {
    key: 'first-crawl',
    label: 'First crawl',
    icon: 'trending-up-outline',
    typicalAge: '~7–10 months',
    description: 'The moment the world stopped being a place you carried them through.',
    typicalWeeksMax: 44,
  },
  {
    key: 'first-word',
    label: 'First word',
    icon: 'chatbubble-outline',
    typicalAge: '~9–14 months',
    description: 'It might not be “mama”. It’ll be perfect anyway.',
    typicalWeeksMax: 60,
  },
  {
    key: 'first-steps',
    label: 'First steps',
    icon: 'walk-outline',
    typicalAge: '~9–15 months',
    description: 'Wobbling, arms out, aiming straight for you. Have the camera up.',
    typicalWeeksMax: 65,
  },
];

/** Icon lookup by milestone key, with a graceful fallback for custom firsts. */
export function iconForFirst(key: string | undefined): IconName {
  const found = DEFAULT_FIRSTS.find((f) => f.key === key);
  return found?.icon ?? 'star-outline';
}
