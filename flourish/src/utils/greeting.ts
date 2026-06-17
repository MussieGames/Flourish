/**
 * Age-aware greeting — the app's voice changes as the baby grows.
 * A parent at day 3 and a parent at month 8 are in completely different
 * places. These words cost nothing to show; they mean everything to feel.
 */
export function getAgeAwareGreeting(
  firstName: string,
  ageInWeeks: number | null
): { timeGreeting: string; warmth: string | null } {
  const h = new Date().getHours();
  const time = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  const timeGreeting = firstName ? `Good ${time}, ${firstName}` : `Good ${time}`;

  if (ageInWeeks === null) return { timeGreeting, warmth: null };

  if (ageInWeeks < 1)  return { timeGreeting, warmth: 'These first hours are everything.' };
  if (ageInWeeks < 2)  return { timeGreeting, warmth: 'These first days are everything.' };
  if (ageInWeeks < 6)  return { timeGreeting, warmth: "You're doing so well." };
  if (ageInWeeks < 12) return { timeGreeting, warmth: 'Every week is a new person.' };
  if (ageInWeeks < 26) return { timeGreeting, warmth: "They're changing so fast now." };
  if (ageInWeeks < 52) return { timeGreeting, warmth: 'Half a year. You made it.' };
  if (ageInWeeks < 78) return { timeGreeting, warmth: 'A whole year of memories.' };
  return { timeGreeting, warmth: null };
}
