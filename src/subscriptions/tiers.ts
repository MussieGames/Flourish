import { SubscriptionTierId, UserSubscription } from "@/types";

export type SubscriptionTierDefinition = {
  id: SubscriptionTierId;
  name: string;
  priceLabel: string;
  billingLabel: string;
  ctaLabel: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export const CTA_BLOOM_TRIAL_MONTHS = 3;
export const HEIRLOOM_BLOOM_INCLUDED_MONTHS = 12;

// Clear subscription area:
// Add future tiers here, then wire the matching backend entitlement in functions/index.js.
export const subscriptionTiers: Record<SubscriptionTierId, SubscriptionTierDefinition> = {
  seedling: {
    id: "seedling",
    name: "Seedling",
    priceLabel: "Free forever",
    billingLabel: "included",
    ctaLabel: "Current plan",
    description: "A private starter scrapbook for new families.",
    features: ["500 photos & videos", "25 milestones tracked", "Basic scrapbook layouts", "Share with 2 family members"],
  },
  bloom: {
    id: "bloom",
    name: "Bloom",
    priceLabel: "$8",
    billingLabel: "per month · first 3 months free from CTA sign-up",
    ctaLabel: "Start Bloom",
    description: "Unlimited memory keeping for the first year and beyond.",
    highlighted: true,
    features: [
      "Unlimited photos & videos",
      "All 200+ milestones",
      "Premium scrapbook layouts",
      "Share with 10 family members",
      "Yearly video montage",
      "Printed book discounts",
    ],
  },
  heirloom: {
    id: "heirloom",
    name: "Heirloom",
    priceLabel: "$79",
    billingLabel: "one-time · includes 12 months of Bloom",
    ctaLabel: "Subscribe to Heirloom",
    description: "A gift-ready printed book plus a full year of Bloom access.",
    features: [
      "1 printed hardcover scrapbook",
      "12 months of Bloom included",
      "Shipped to your door",
      "No subscription started",
      "Perfect baby shower gift",
    ],
  },
};

export function addMonthsIso(date: Date, months: number): string {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next.toISOString();
}

export function createSeedlingEntitlement(): UserSubscription {
  return {
    tier: "seedling",
    status: "free",
    source: "seedling_default",
    provider: "manual",
  };
}

export function createCtaSignupBloomTrialEntitlement(now = new Date()): UserSubscription {
  const bloomAccessUntilIso = addMonthsIso(now, CTA_BLOOM_TRIAL_MONTHS);

  return {
    tier: "bloom",
    status: "trialing",
    source: "cta_signup",
    provider: "manual",
    expiresAtIso: bloomAccessUntilIso,
    bloomAccessUntilIso,
  };
}

export function getEffectiveTier(subscription?: UserSubscription): SubscriptionTierId {
  if (!subscription || subscription.status === "expired" || subscription.status === "cancelled") {
    return "seedling";
  }

  return subscription.tier;
}

export function getBloomAccessLabel(subscription?: UserSubscription): string {
  if (!subscription?.bloomAccessUntilIso) {
    return "Bloom access not active";
  }

  return `Bloom access until ${new Date(subscription.bloomAccessUntilIso).toLocaleDateString()}`;
}
