/**
 * Subscription utilities — all Bloom access and stacking logic lives here.
 *
 * ─── STACKING RULE ───────────────────────────────────────────────────────────
 * Bloom access from any source always stacks forward. A user never loses
 * time they have already paid for.
 *
 *   new bloomActiveUntil = max(today, existing bloomActiveUntil) + newPeriodDays
 *
 * ─── SCENARIOS ───────────────────────────────────────────────────────────────
 *
 * A  Seedling → buys Heirloom
 *    bloomActiveUntil = today + 365 days
 *    billingType      = 'heirloom'
 *
 * B  Monthly Bloom → buys Heirloom
 *    Monthly billing cancelled.
 *    bloomActiveUntil = today + 365 days
 *    billingType      = 'heirloom'
 *
 * C  Annual Bloom (8 months remaining) → buys Heirloom
 *    bloomActiveUntil = existing expiry + 365 days  ← never loses the 8 months
 *    billingType      = 'heirloom'
 *
 * D  Any Bloom → purchases Annual Bloom upgrade
 *    bloomActiveUntil = max(today, existing expiry) + 365 days
 *    billingType      = 'annual'
 *
 * E  Monthly Bloom → switches to Annual
 *    Monthly billing cancelled.
 *    bloomActiveUntil = today + 365 days
 *    billingType      = 'annual'
 *
 * ─── WHY THIS RULE ───────────────────────────────────────────────────────────
 * The alternative — starting a new period from scratch — would silently erase
 * time the user already paid for. That is never acceptable.
 * Always extending forward is mathematically simple, legally clean, and
 * brand-consistent with Flourish's honesty positioning.
 */
import { addDays, differenceInDays, max } from 'date-fns';
import type { Subscription, BillingCycle } from '../types';

const BLOOM_ANNUAL_DAYS = 365;
const BLOOM_HEIRLOOM_DAYS = 365; // 12 months included in Heirloom

// ─── Does the user have active Bloom right now? ───────────────────────────────
export function hasActiveBloom(sub: Subscription | null, now = new Date()): boolean {
  if (!sub || sub.status !== 'active') return false;
  if (sub.planId === 'seedling') return false;
  // Monthly Bloom has no expiry — active while billing is active
  if (sub.bloomBillingType === 'monthly' && !sub.bloomActiveUntil) return true;
  // Annual or Heirloom — check the date
  if (sub.bloomActiveUntil) return sub.bloomActiveUntil > now;
  return false;
}

// ─── How many days of Bloom remain? ──────────────────────────────────────────
export function bloomDaysRemaining(sub: Subscription | null, now = new Date()): number | null {
  if (!sub || !hasActiveBloom(sub, now)) return null;
  if (sub.bloomBillingType === 'monthly' && !sub.bloomActiveUntil) return null; // unlimited while billing
  if (sub.bloomActiveUntil) return Math.max(0, differenceInDays(sub.bloomActiveUntil, now));
  return null;
}

// ─── Calculate the new bloomActiveUntil after adding a Heirloom ──────────────
export function calculateHeirloomBloomExpiry(
  existingSub: Subscription | null,
  purchaseDate = new Date()
): Date {
  if (!existingSub || !hasActiveBloom(existingSub, purchaseDate)) {
    // No existing Bloom — start from today
    return addDays(purchaseDate, BLOOM_HEIRLOOM_DAYS);
  }

  if (existingSub.bloomBillingType === 'monthly') {
    // Monthly subscriber buys Heirloom → cancel monthly, give 12 months from today
    return addDays(purchaseDate, BLOOM_HEIRLOOM_DAYS);
  }

  if (existingSub.bloomActiveUntil) {
    // Annual or existing Heirloom — extend from the LATER of today or existing expiry
    const base = max([purchaseDate, existingSub.bloomActiveUntil]);
    return addDays(base, BLOOM_HEIRLOOM_DAYS);
  }

  return addDays(purchaseDate, BLOOM_HEIRLOOM_DAYS);
}

// ─── Calculate the new bloomActiveUntil after an annual purchase ──────────────
export function calculateAnnualBloomExpiry(
  existingSub: Subscription | null,
  purchaseDate = new Date()
): Date {
  if (!existingSub || !hasActiveBloom(existingSub, purchaseDate)) {
    return addDays(purchaseDate, BLOOM_ANNUAL_DAYS);
  }
  if (existingSub.bloomActiveUntil) {
    const base = max([purchaseDate, existingSub.bloomActiveUntil]);
    return addDays(base, BLOOM_ANNUAL_DAYS);
  }
  // Was on monthly — start fresh from today
  return addDays(purchaseDate, BLOOM_ANNUAL_DAYS);
}

// ─── Human-readable Bloom status line ────────────────────────────────────────
export function bloomStatusLabel(sub: Subscription | null, now = new Date()): string {
  if (!sub || !hasActiveBloom(sub, now)) return 'Not active';

  if (sub.bloomBillingType === 'monthly' && !sub.bloomActiveUntil) {
    return 'Active — renews monthly';
  }

  const days = bloomDaysRemaining(sub, now);
  if (days === null) return 'Active';
  if (days === 0) return 'Expires today';
  if (days < 30) return `${days} days remaining`;

  const months = Math.floor(days / 30);
  const remainder = days % 30;
  if (remainder === 0) return `${months} month${months === 1 ? '' : 's'} remaining`;
  return `~${months} month${months === 1 ? '' : 's'} remaining`;
}

// ─── Heirloom overlap explanation (for UI display) ───────────────────────────
/**
 * Returns a plain-language explanation of exactly how a Heirloom purchase
 * will interact with an existing subscription. Used in the plan page UI
 * to make the transaction transparent before the user commits.
 */
export function heirloomOverlapExplanation(
  existingSub: Subscription | null,
  now = new Date()
): string {
  if (!existingSub || !hasActiveBloom(existingSub, now)) {
    return 'Your 12 months of Bloom starts on the day your book is ordered.';
  }

  if (existingSub.bloomBillingType === 'monthly') {
    return (
      'Your monthly Bloom billing will stop immediately. ' +
      "You'll receive 12 months of Bloom from today — no overlap, no loss."
    );
  }

  const days = bloomDaysRemaining(existingSub, now);
  if (days !== null && days > 0) {
    const months = Math.round(days / 30);
    const newExpiry = calculateHeirloomBloomExpiry(existingSub, now);
    return (
      `You have ~${months} month${months === 1 ? '' : 's'} remaining on your current plan. ` +
      `The Heirloom's 12 months stacks on top — ` +
      `your Bloom access extends to ${newExpiry.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}.`
    );
  }

  return 'Your 12 months of Bloom starts on the day your book is ordered.';
}
