export type AppScreen =
  | "welcome"
  | "dashboard"
  | "stickers"
  | "calendar"
  | "plan"
  | "milestone"
  | "journal"
  | "legal";

export type StickerEra = "baby" | "little" | "growing" | "teen";

export type SubscriptionTierId = "seedling" | "bloom" | "heirloom";

export type SubscriptionStatus = "free" | "trialing" | "active" | "expired" | "cancelled";

export type SubscriptionSource =
  | "seedling_default"
  | "cta_signup"
  | "in_app_bloom"
  | "in_app_heirloom"
  | "app_store"
  | "google_play"
  | "admin";

export type UserSubscription = {
  tier: SubscriptionTierId;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  startedAt?: unknown;
  updatedAt?: unknown;
  expiresAtIso?: string;
  bloomAccessUntilIso?: string;
  provider?: "app_store" | "google_play" | "manual" | "demo";
  providerTransactionId?: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  acceptedPrivacyVersion: string;
  acceptedTermsVersion: string;
  acceptedLegalAt?: unknown;
  subscription?: UserSubscription;
};

export type ChildProfile = {
  id: string;
  ownerId: string;
  name: string;
  birthDate?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type MemoryKind = "photo" | "video" | "journal" | "milestone";

export type MemoryInput = {
  childId: string;
  kind: MemoryKind;
  title: string;
  caption?: string;
  mediaPath?: string;
  occurredAtIso: string;
  tags?: string[];
  stickers?: string[];
};

export type EraSticker = readonly [emoji: string, label: string];

export type StickerEraData = {
  label: string;
  note: string;
  preview: string;
  s1: string;
  s2: string;
  caption: string;
  categories: string[];
  stickers: EraSticker[];
  gradient: readonly [string, string];
  accent: string;
};
