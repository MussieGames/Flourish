/**
 * Plan limits — single source of truth.
 *
 * Change the numbers here and they propagate everywhere:
 *  - Plan page (what's shown in the tier cards)
 *  - Dashboard (soft-wall nudges at 75% and 90%)
 *  - Firestore rules validation (enforced server-side)
 *
 * Seedling photo limit rationale:
 *   200 photos ≈ 4–6 weeks of active use for a new parent.
 *   This reaches the limit during the emotional peak (weeks 4–8,
 *   first smile territory) — the best possible moment for a natural
 *   upgrade. High enough to prove value, not so high it delays the
 *   conversion until the parent is settled into routine.
 */
import type { PlanId, BillingCycle } from '../types';

export const PLAN_LIMITS = {
  seedling: {
    photos: 200,
    milestones: 10,
    familyMembers: 1,
    videoMontage: false,
    premiumLayouts: false,
  },
  bloom: {
    photos: null,        // unlimited
    milestones: null,    // all 200+
    familyMembers: 10,
    videoMontage: true,
    premiumLayouts: true,
  },
  heirloom: {
    photos: null,
    milestones: null,
    familyMembers: 10,
    videoMontage: true,
    premiumLayouts: true,
    printedBook: true,
  },
} as const;

export const BLOOM_PRICING: Record<BillingCycle, { amount: number; label: string; perMonthLabel: string }> = {
  monthly: {
    amount: 8,
    label: '$8 / month',
    perMonthLabel: '$8/month',
  },
  annual: {
    amount: 69,
    label: '$69 / year',
    perMonthLabel: '$5.75/month',
  },
};

export const BLOOM_ANNUAL_SAVING = 27; // $96 monthly - $69 annual

export const HEIRLOOM_PRICE = 79;
export const HEIRLOOM_BLOOM_MONTHS = 12;

// What % of the Seedling limit triggers the soft nudge (no hard block)
export const SEEDLING_NUDGE_THRESHOLD = 0.75;  // 150 photos
export const SEEDLING_SOFT_WALL_THRESHOLD = 0.9; // 180 photos
