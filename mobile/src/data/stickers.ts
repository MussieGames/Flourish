import { colors } from '@/theme';

export type EraId = 'baby' | 'little' | 'growing' | 'teen';

export interface Sticker {
  emoji: string;
  name: string;
}

export interface Era {
  id: EraId;
  tab: string;
  label: string;
  note: string;
  minAgeYears: number;
  maxAgeYears: number;
  preview: string;
  caption: string;
  categories: string[];
  stickers: Sticker[];
  gradient: [string, string];
  accent: string;
}

export const ERAS: Era[] = [
  {
    id: 'baby',
    tab: '🍼 Baby',
    label: '🍼 Baby Era · 0–2 years',
    note: 'Auto-selected',
    minAgeYears: 0,
    maxAgeYears: 2,
    preview: '🍼',
    caption: '"The morning everything changed..."',
    categories: ['Nursery', 'Nature', 'Firsts', 'Love', 'Seasonal'],
    gradient: ['#E8C4B0', '#C4907A'],
    accent: colors.sienna,
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
  },
  {
    id: 'little',
    tab: '🎒 Little One',
    label: '🎒 Little One Era · 3–7 years',
    note: 'Playful & bright',
    minAgeYears: 3,
    maxAgeYears: 7,
    preview: '🐻',
    caption: '"Adventures every single day."',
    categories: ['Animals', 'Adventure', 'School', 'Friends', 'Colour'],
    gradient: ['#C5D9C0', '#88BF88'],
    accent: colors.sageDark,
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
  },
  {
    id: 'growing',
    tab: '⚽ Growing Up',
    label: '⚽ Growing Up Era · 8–12 years',
    note: 'Interests & personality',
    minAgeYears: 8,
    maxAgeYears: 12,
    preview: '⚽',
    caption: '"Finding who they are."',
    categories: ['Sport', 'Music', 'Nature', 'Create', 'Travel'],
    gradient: ['#C4C0D8', '#A090C0'],
    accent: '#8E7BB0',
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
  },
  {
    id: 'teen',
    tab: '🎵 Teen',
    label: '🎵 Teen Era · 13–18 years',
    note: 'Minimal & personal',
    minAgeYears: 13,
    maxAgeYears: 18,
    preview: '🎵',
    caption: '"Growing into themselves."',
    categories: ['Minimal', 'Music', 'Travel', 'Mood', 'Icons'],
    gradient: ['#2C2420', '#4A3830'],
    accent: colors.gold,
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
  },
];

export function eraForAgeYears(ageYears: number): Era {
  return (
    ERAS.find((era) => ageYears >= era.minAgeYears && ageYears <= era.maxAgeYears) ??
    ERAS[0]
  );
}
