/** Default catalogue of "firsts" a parent can track. */
export interface FirstDef {
  key: string;
  label: string;
  emoji: string;
  typicalAge: string;
}

export const DEFAULT_FIRSTS: FirstDef[] = [
  { key: 'first-day-home', label: 'First day home', emoji: '🏥', typicalAge: 'Day 1–2' },
  { key: 'first-bath', label: 'First bath', emoji: '🛁', typicalAge: 'Week 1' },
  { key: 'first-smile', label: 'First smile', emoji: '😊', typicalAge: '~6–8 wks' },
  { key: 'first-giggle', label: 'First giggle', emoji: '😂', typicalAge: '~3–4 mo' },
  { key: 'first-roll', label: 'First roll over', emoji: '🤸', typicalAge: '~4–6 mo' },
  { key: 'first-food', label: 'First solid food', emoji: '🥄', typicalAge: '~6 mo' },
  { key: 'first-crawl', label: 'First crawl', emoji: '🐛', typicalAge: '~7–10 mo' },
  { key: 'first-word', label: 'First word', emoji: '💬', typicalAge: '~9–14 mo' },
  { key: 'first-steps', label: 'First steps', emoji: '👣', typicalAge: '~9–15 mo' },
  { key: 'first-tooth', label: 'First tooth', emoji: '🦷', typicalAge: '~4–7 mo' },
];
