import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';
import { BabyAgeInfo, BabyEra } from '../types';
import { getEraForAge } from '../constants/stickers';

export function calculateBabyAge(birthDate: Date, now = new Date()): BabyAgeInfo {
  const ageInDays = differenceInDays(now, birthDate);
  const ageInWeeks = differenceInWeeks(now, birthDate);
  const ageInMonths = differenceInMonths(now, birthDate);
  const ageInYears = differenceInYears(now, birthDate);
  const era = getEraForAge(ageInYears);

  let displayAge: string;
  if (ageInDays === 0) {
    displayAge = 'Born today';
  } else if (ageInDays < 7) {
    displayAge = `${ageInDays} day${ageInDays === 1 ? '' : 's'} old`;
  } else if (ageInWeeks < 8) {
    const days = ageInDays - ageInWeeks * 7;
    displayAge = `${ageInWeeks} week${ageInWeeks === 1 ? '' : 's'}${days > 0 ? ` & ${days} day${days === 1 ? '' : 's'}` : ''} old`;
  } else if (ageInMonths < 24) {
    displayAge = `${ageInMonths} month${ageInMonths === 1 ? '' : 's'} old`;
  } else {
    const months = ageInMonths - ageInYears * 12;
    displayAge = `${ageInYears} year${ageInYears === 1 ? '' : 's'}${months > 0 ? ` & ${months} month${months === 1 ? '' : 's'}` : ''} old`;
  }

  return { ageInDays, ageInWeeks, ageInMonths, ageInYears, era, displayAge };
}

export function formatBirthDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
