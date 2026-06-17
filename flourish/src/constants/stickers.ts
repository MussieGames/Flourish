import { BabyEra, StickerEraData } from '../types';

export const STICKER_ERAS: Record<BabyEra, StickerEraData> = {
  baby: {
    label: '🍼 Baby Era · 0–2 years',
    note: 'Auto-selected ✓',
    preview: '🍼',
    s1: '⭐',
    s2: '🌙',
    caption: '"The morning everything changed..."',
    cats: ['Nursery', 'Nature', 'Firsts', 'Love', 'Seasonal'],
    stickers: [
      { emoji: '⭐', name: 'Star' },
      { emoji: '🌙', name: 'Moon' },
      { emoji: '🍼', name: 'Bottle' },
      { emoji: '🧸', name: 'Teddy' },
      { emoji: '🌿', name: 'Leaf' },
      { emoji: '💛', name: 'Heart' },
      { emoji: '🎀', name: 'Bow' },
      { emoji: '🌸', name: 'Blossom' },
      { emoji: '🦋', name: 'Flutter' },
      { emoji: '🌈', name: 'Rainbow' },
      { emoji: '👣', name: 'Footprint' },
      { emoji: '🎈', name: 'Balloon' },
      { emoji: '🍭', name: 'Sweet' },
      { emoji: '🌻', name: 'Sunflower' },
      { emoji: '🦄', name: 'Magic' },
    ],
    bgGrad: 'linear-gradient(135deg,#E8C4B0,#C4907A)',
    borderColor: 'rgba(193,123,92,.5)',
  },
  little: {
    label: '🎒 Little One Era · 3–7 years',
    note: 'Playful & bright',
    preview: '🐻',
    s1: '🌈',
    s2: '🦁',
    caption: '"Adventures every single day."',
    cats: ['Animals', 'Adventure', 'School', 'Friends', 'Colour'],
    stickers: [
      { emoji: '🦁', name: 'Lion' },
      { emoji: '🐘', name: 'Elephant' },
      { emoji: '🌈', name: 'Rainbow' },
      { emoji: '🎨', name: 'Paint' },
      { emoji: '🚂', name: 'Train' },
      { emoji: '🦕', name: 'Dino' },
      { emoji: '🎪', name: 'Circus' },
      { emoji: '🌟', name: 'Star' },
      { emoji: '🎭', name: 'Drama' },
      { emoji: '🏖️', name: 'Beach' },
      { emoji: '🦜', name: 'Parrot' },
      { emoji: '🌺', name: 'Flower' },
      { emoji: '🎠', name: 'Carousel' },
      { emoji: '🧩', name: 'Puzzle' },
      { emoji: '🐠', name: 'Fish' },
    ],
    bgGrad: 'linear-gradient(135deg,#C5D9C0,#88BF88)',
    borderColor: 'rgba(122,158,126,.5)',
  },
  growing: {
    label: '⚽ Growing Up Era · 8–12 years',
    note: 'Interests & personality',
    preview: '⚽',
    s1: '🏆',
    s2: '🎮',
    caption: '"Finding who they are."',
    cats: ['Sport', 'Music', 'Nature', 'Create', 'Travel'],
    stickers: [
      { emoji: '🏆', name: 'Trophy' },
      { emoji: '⚽', name: 'Football' },
      { emoji: '🎵', name: 'Music' },
      { emoji: '🎸', name: 'Guitar' },
      { emoji: '🌍', name: 'World' },
      { emoji: '🏄', name: 'Surf' },
      { emoji: '🎯', name: 'Target' },
      { emoji: '📚', name: 'Books' },
      { emoji: '🌲', name: 'Tree' },
      { emoji: '🏕️', name: 'Camp' },
      { emoji: '🎮', name: 'Gaming' },
      { emoji: '🔭', name: 'Explore' },
      { emoji: '✏️', name: 'Draw' },
      { emoji: '🐾', name: 'Pets' },
      { emoji: '🚴', name: 'Cycle' },
    ],
    bgGrad: 'linear-gradient(135deg,#C4C0D8,#A090C0)',
    borderColor: 'rgba(160,144,192,.5)',
  },
  teen: {
    label: '🎵 Teen Era · 13–18 years',
    note: 'Minimal & personal',
    preview: '🎵',
    s1: '◈',
    s2: '∞',
    caption: '"Growing into themselves."',
    cats: ['Minimal', 'Music', 'Travel', 'Mood', 'Icons'],
    stickers: [
      { emoji: '◈', name: 'Geo' },
      { emoji: '∞', name: 'Infinite' },
      { emoji: '◯', name: 'Circle' },
      { emoji: '△', name: 'Triangle' },
      { emoji: '✦', name: 'Spark' },
      { emoji: '🎵', name: 'Music' },
      { emoji: '🎧', name: 'Listen' },
      { emoji: '🌙', name: 'Night' },
      { emoji: '✈️', name: 'Travel' },
      { emoji: '📷', name: 'Capture' },
      { emoji: '🌊', name: 'Wave' },
      { emoji: '🌿', name: 'Minimal' },
      { emoji: '⚡', name: 'Energy' },
      { emoji: '🖤', name: 'Dark' },
      { emoji: '🤍', name: 'Light' },
    ],
    bgGrad: 'linear-gradient(135deg,#2C2420,#4A3830)',
    borderColor: 'rgba(201,169,110,.5)',
  },
};

// Each milestone has unique celebration copy that's specific to THAT first.
// A parent reading "first bath" copy should feel seen — not like they got
// the same paragraph as every other milestone.
export const MILESTONE_TEMPLATES = [
  {
    id: 'first-day-home',
    emoji: '🏥',
    title: 'First day home',
    expectedAgeWeeks: 0,
    expectedAgeLabel: 'Day 2',
    era: 'baby' as const,
    celebrationText:
      'Your whole world walked through that door today. The car seat, the blanket, the tiny hands — everything is different now. The house is the same house. You are not the same people.',
  },
  {
    id: 'first-bath',
    emoji: '🛁',
    title: 'First bath',
    expectedAgeWeeks: 1,
    expectedAgeLabel: 'Week 1',
    era: 'baby' as const,
    celebrationText:
      'That look of total surprise. The squirming, the tiny splashing fists, the way they eventually went still and warm in the water. You survived it. So did they. Consider yourselves a team.',
  },
  {
    id: 'first-smile',
    emoji: '😊',
    title: 'First smile',
    expectedAgeWeeks: 7,
    expectedAgeLabel: '~6–8 wks',
    era: 'baby' as const,
    celebrationText:
      'You caught it. The one that changes everything. That first real, full-face, eyes-crinkling smile — and it was meant just for you. Every sleepless night led exactly here.',
  },
  {
    id: 'first-giggle',
    emoji: '😂',
    title: 'First giggle',
    expectedAgeWeeks: 14,
    expectedAgeLabel: '~3–4 mo',
    era: 'baby' as const,
    celebrationText:
      "There is no sound on earth like it. That tiny, surprised, delighted laugh — like they just discovered that joy is a thing that exists, and can\'t quite believe it. You\'ll hear it in your sleep tonight.",
  },
  {
    id: 'first-roll',
    emoji: '🔄',
    title: 'First roll over',
    expectedAgeWeeks: 18,
    expectedAgeLabel: '~4–5 mo',
    era: 'baby' as const,
    celebrationText:
      "They looked as shocked as you did. One moment on their back, the next — staring up at the ceiling with an expression that said: wait, I can do things. Everything changes from here.",
  },
  {
    id: 'first-solid-food',
    emoji: '🥄',
    title: 'First solid food',
    expectedAgeWeeks: 26,
    expectedAgeLabel: '~6 mo',
    era: 'baby' as const,
    celebrationText:
      'That face. Whatever they thought food was going to taste like, it was not this. The curiosity, the scrunch, the tentative second bite — the beginning of a lifetime of meals together.',
  },
  {
    id: 'first-sit',
    emoji: '🪑',
    title: 'Sitting up',
    expectedAgeWeeks: 26,
    expectedAgeLabel: '~6–7 mo',
    era: 'baby' as const,
    celebrationText:
      'They can see the whole room now. Their world just doubled in size — and from the look on their face, they are extremely pleased about it.',
  },
  {
    id: 'first-word',
    emoji: '💬',
    title: 'First word',
    expectedAgeWeeks: 52,
    expectedAgeLabel: '~12 mo',
    era: 'baby' as const,
    celebrationText:
      "It happened. The first real, deliberate, meant-for-you word. Simple and perfect and yours. Write it down exactly as they said it — you\'ll want that detail forever.",
  },
  {
    id: 'first-steps',
    emoji: '👶',
    title: 'First steps',
    expectedAgeWeeks: 52,
    expectedAgeLabel: '~9–12 mo',
    era: 'baby' as const,
    celebrationText:
      "Two steps. Maybe three. Then down. But for one moment they were upright, independent, moving through the world under their own power. You\'ll spend the rest of your life watching them walk away — and that\'s exactly what you wanted.",
  },
  {
    id: 'first-birthday',
    emoji: '🎂',
    title: 'First birthday',
    expectedAgeWeeks: 52,
    expectedAgeLabel: '12 mo',
    era: 'baby' as const,
    celebrationText:
      "A whole year. You made it. They made it. You learned more in twelve months than in the years before it. The cake is for them — but this day belongs to you too. You did something extraordinary.",
  },
];

export const getEraForAge = (ageInYears: number): BabyEra => {
  if (ageInYears < 3) return 'baby';
  if (ageInYears < 8) return 'little';
  if (ageInYears < 13) return 'growing';
  return 'teen';
};
