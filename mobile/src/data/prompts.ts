/**
 * Context-sensitive journal prompts. Specific, sensory questions produce
 * specific memories — blank fields produce "he was cute today". Some prompts
 * are surfaced by time of day (a 3am question lands differently to a noon one).
 */

export interface Prompt {
  text: string;
  /** Optional time window (24h hours, inclusive start, exclusive end). */
  night?: boolean;
}

const PROMPTS: Prompt[] = [
  { text: 'What does {name} smell like right now?' },
  { text: 'What surprised you most about this week?' },
  { text: 'What are you afraid of tonight?', night: true },
  { text: 'What would you tell yourself from six months ago?' },
  { text: 'What sound did {name} make today that you want to remember?' },
  { text: 'What did their hands do today?' },
  { text: 'What is the hardest part of right now — honestly?', night: true },
  { text: 'What do you never want to forget about this exact age?' },
  { text: 'Who does {name} look like today?' },
  { text: 'What tiny thing made you cry happy tears this week?' },
  { text: 'What are you grateful for at this hour?', night: true },
  { text: 'What will you miss about this phase once it passes?' },
];

function isNight(date: Date): boolean {
  const h = date.getHours();
  return h >= 0 && h < 5;
}

/** Deterministic-ish daily prompt so it feels stable across a session. */
export function dailyPrompt(name: string | null | undefined, now = new Date()): string {
  const pool = isNight(now) ? PROMPTS.filter((p) => p.night) : PROMPTS.filter((p) => !p.night);
  const list = pool.length ? pool : PROMPTS;
  const daySeed = Math.floor(now.getTime() / 86_400_000);
  const prompt = list[daySeed % list.length];
  return prompt.text.replace('{name}', name?.trim() || 'your baby');
}
