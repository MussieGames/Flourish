/**
 * The default set of "firsts" seeded for every new child. Parents can mark each
 * one captured, which triggers the celebratory Milestone Moment screen.
 */
export interface MilestoneTemplate {
  key: string;
  title: string;
  emoji: string;
  typicalAge: string;
  /** Copy shown on the celebration screen once captured. */
  celebration: string;
}

export const MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  {
    key: "first_day_home",
    title: "First day home",
    emoji: "🏥",
    typicalAge: "Day 1–2",
    celebration:
      "The very first day in their forever home. The start of every story.",
  },
  {
    key: "first_bath",
    title: "First bath",
    emoji: "🛁",
    typicalAge: "Week 1",
    celebration: "Tiny, slippery, and utterly perfect. The first of many splashes.",
  },
  {
    key: "first_smile",
    title: "First smile",
    emoji: "😊",
    typicalAge: "6–8 weeks",
    celebration:
      "You caught it. That first real, full-face, eyes-crinkling smile — and it was meant just for you.",
  },
  {
    key: "first_giggle",
    title: "First giggle",
    emoji: "😂",
    typicalAge: "3–4 months",
    celebration: "The sound you'll replay in your head forever. Pure joy.",
  },
  {
    key: "first_roll",
    title: "First roll over",
    emoji: "🤸",
    typicalAge: "4–6 months",
    celebration: "Look at them go. The world just got a little bigger.",
  },
  {
    key: "first_food",
    title: "First taste of food",
    emoji: "🥄",
    typicalAge: "~6 months",
    celebration: "That face! A whole new world of flavours begins today.",
  },
  {
    key: "first_tooth",
    title: "First tooth",
    emoji: "🦷",
    typicalAge: "6–10 months",
    celebration: "A tiny pearl appears. Worth every restless night.",
  },
  {
    key: "first_crawl",
    title: "First crawl",
    emoji: "🐛",
    typicalAge: "7–10 months",
    celebration: "On the move at last. Time to baby-proof everything.",
  },
  {
    key: "first_word",
    title: "First word",
    emoji: "🗣️",
    typicalAge: "~12 months",
    celebration: "Their very first word. The beginning of a lifetime of stories.",
  },
  {
    key: "first_steps",
    title: "First steps",
    emoji: "👣",
    typicalAge: "9–15 months",
    celebration: "One wobbly step, then another. They're walking into the world.",
  },
];
