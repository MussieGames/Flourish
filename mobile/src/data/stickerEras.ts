/**
 * Age-adaptive sticker library. Ported from the original mockup. Flourish picks
 * the era that matches the child's current age, while keeping every past
 * sticker preserved on its original scrapbook page.
 */
export type EraKey = "baby" | "little" | "growing" | "teen";

export interface Sticker {
  emoji: string;
  name: string;
}

export interface StickerEra {
  key: EraKey;
  tab: string;
  label: string;
  note: string;
  /** Inclusive age range in years used for auto-selection. */
  ageRange: [number, number];
  preview: string;
  previewStickers: [string, string];
  caption: string;
  categories: string[];
  stickers: Sticker[];
  /** Two-stop gradient for the preview background. */
  gradient: [string, string];
  accent: string;
}

const mk = (pairs: [string, string][]): Sticker[] =>
  pairs.map(([emoji, name]) => ({ emoji, name }));

export const STICKER_ERAS: Record<EraKey, StickerEra> = {
  baby: {
    key: "baby",
    tab: "🍼 Baby",
    label: "🍼 Baby Era · 0–2 years",
    note: "Auto-selected ✓",
    ageRange: [0, 2],
    preview: "🍼",
    previewStickers: ["⭐", "🌙"],
    caption: "“The morning everything changed…”",
    categories: ["Nursery", "Nature", "Firsts", "Love", "Seasonal"],
    stickers: mk([
      ["⭐", "Star"],
      ["🌙", "Moon"],
      ["🍼", "Bottle"],
      ["🧸", "Teddy"],
      ["🌿", "Leaf"],
      ["💛", "Heart"],
      ["🎀", "Bow"],
      ["🌸", "Blossom"],
      ["🦋", "Flutter"],
      ["🌈", "Rainbow"],
      ["👣", "Footprint"],
      ["🎈", "Balloon"],
      ["🍭", "Sweet"],
      ["🌻", "Sunflower"],
      ["🦄", "Magic"],
    ]),
    gradient: ["#E8C4B0", "#C4907A"],
    accent: "#C17B5C",
  },
  little: {
    key: "little",
    tab: "🎒 Little One",
    label: "🎒 Little One Era · 3–7 years",
    note: "Playful & bright",
    ageRange: [3, 7],
    preview: "🐻",
    previewStickers: ["🌈", "🦁"],
    caption: "“Adventures every single day.”",
    categories: ["Animals", "Adventure", "School", "Friends", "Colour"],
    stickers: mk([
      ["🦁", "Lion"],
      ["🐘", "Elephant"],
      ["🌈", "Rainbow"],
      ["🎨", "Paint"],
      ["🚂", "Train"],
      ["🦕", "Dino"],
      ["🎪", "Circus"],
      ["🌟", "Star"],
      ["🎭", "Drama"],
      ["🏖️", "Beach"],
      ["🦜", "Parrot"],
      ["🌺", "Flower"],
      ["🎠", "Carousel"],
      ["🧩", "Puzzle"],
      ["🐠", "Fish"],
    ]),
    gradient: ["#C5D9C0", "#88BF88"],
    accent: "#7A9E7E",
  },
  growing: {
    key: "growing",
    tab: "⚽ Growing Up",
    label: "⚽ Growing Up Era · 8–12 years",
    note: "Interests & personality",
    ageRange: [8, 12],
    preview: "⚽",
    previewStickers: ["🏆", "🎮"],
    caption: "“Finding who they are.”",
    categories: ["Sport", "Music", "Nature", "Create", "Travel"],
    stickers: mk([
      ["🏆", "Trophy"],
      ["⚽", "Football"],
      ["🎵", "Music"],
      ["🎸", "Guitar"],
      ["🌍", "World"],
      ["🏄", "Surf"],
      ["🎯", "Target"],
      ["📚", "Books"],
      ["🌲", "Tree"],
      ["🏕️", "Camp"],
      ["🎮", "Gaming"],
      ["🔭", "Explore"],
      ["✏️", "Draw"],
      ["🐾", "Pets"],
      ["🚴", "Cycle"],
    ]),
    gradient: ["#C4C0D8", "#A090C0"],
    accent: "#A090C0",
  },
  teen: {
    key: "teen",
    tab: "🎵 Teen",
    label: "🎵 Teen Era · 13–18 years",
    note: "Minimal & personal",
    ageRange: [13, 18],
    preview: "🎵",
    previewStickers: ["◈", "∞"],
    caption: "“Growing into themselves.”",
    categories: ["Minimal", "Music", "Travel", "Mood", "Icons"],
    stickers: mk([
      ["◈", "Geo"],
      ["∞", "Infinite"],
      ["◯", "Circle"],
      ["△", "Triangle"],
      ["✦", "Spark"],
      ["🎵", "Music"],
      ["🎧", "Listen"],
      ["🌙", "Night"],
      ["✈️", "Travel"],
      ["📷", "Capture"],
      ["🌊", "Wave"],
      ["🌿", "Minimal"],
      ["⚡", "Energy"],
      ["🖤", "Dark"],
      ["🤍", "Light"],
    ]),
    gradient: ["#2C2420", "#4A3830"],
    accent: "#C9A96E",
  },
};

export const ERA_ORDER: EraKey[] = ["baby", "little", "growing", "teen"];

/** Pick the era that matches a child's age in years. */
export function eraForAgeYears(years: number): EraKey {
  for (const key of ERA_ORDER) {
    const [min, max] = STICKER_ERAS[key].ageRange;
    if (years >= min && years <= max) return key;
  }
  return years < 0 ? "baby" : "teen";
}
