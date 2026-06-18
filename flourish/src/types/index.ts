// ─── User & Auth ────────────────────────────────────────────────────────────
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
}

// ─── Baby / Child Profile ───────────────────────────────────────────────────
export interface Baby {
  id: string;
  name: string;
  birthDate: Date;
  gender?: 'male' | 'female' | 'other';
  photoURL?: string;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BabyEra = 'baby' | 'little' | 'growing' | 'teen';

export interface BabyAgeInfo {
  ageInDays: number;
  ageInWeeks: number;
  ageInMonths: number;
  ageInYears: number;
  era: BabyEra;
  displayAge: string;
}

// ─── Memories ───────────────────────────────────────────────────────────────
export type MemoryType = 'photo' | 'video' | 'journal';

export interface Memory {
  id: string;
  babyId: string;
  parentId: string;
  type: MemoryType;
  title: string;
  description?: string;
  mediaURL?: string;
  thumbnailURL?: string;
  stickers?: PlacedSticker[];
  tags?: string[];
  mood?: string;
  capturedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlacedSticker {
  id: string;
  emoji: string;
  name: string;
  x: number;
  y: number;
  era: BabyEra;
}

// ─── Milestones ─────────────────────────────────────────────────────────────
export interface Milestone {
  id: string;
  babyId: string;
  parentId: string;
  type: string;
  emoji: string;
  title: string;
  description?: string;
  capturedAt?: Date;
  expectedAgeWeeks?: number;
  isCaptured: boolean;
  memoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MilestoneTemplate {
  id: string;
  emoji: string;
  title: string;
  description: string;
  expectedAgeWeeks: number;
  expectedAgeLabel: string;
  era: BabyEra;
}

// ─── Calendar Events ────────────────────────────────────────────────────────
export type CalendarEventType = 'milestone' | 'memory' | 'appointment';

export interface CalendarEvent {
  id: string;
  babyId: string;
  parentId: string;
  type: CalendarEventType;
  title: string;
  description?: string;
  date: Date;
  linkedId?: string;
  createdAt: Date;
}

// ─── Plans ──────────────────────────────────────────────────────────────────
export type PlanId = 'seedling' | 'bloom' | 'heirloom';
export type BillingCycle = 'monthly' | 'annual';

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  features: string[];
  isRecommended?: boolean;
  isCurrent?: boolean;
}

/**
 * Subscription — tracks Bloom access from all possible sources.
 *
 * Bloom access can come from three sources, and they stack:
 *   1. Active monthly billing (no fixed end date — runs while paying)
 *   2. Annual billing (fixed end date = startedAt + 365 days)
 *   3. Heirloom purchase (fixed 12-month Bloom entitlement)
 *
 * Stacking rule: bloomActiveUntil always moves FORWARD, never back.
 *   new bloomActiveUntil = max(now, current bloomActiveUntil) + newPeriodDays
 *
 * bloomBillingType tracks the CURRENT ACTIVE billing relationship:
 *   - 'monthly'  → user is on a recurring monthly charge, no fixed end date
 *   - 'annual'   → user pre-paid for a year; bloomActiveUntil is set
 *   - 'heirloom' → Bloom came from an Heirloom purchase, no ongoing billing
 *   - null       → user is on Seedling, no Bloom
 *
 * When bloomBillingType is 'monthly', bloomActiveUntil is null (no expiry
 * date — Bloom continues while billing is active).
 */
export interface Subscription {
  userId: string;
  planId: PlanId;
  bloomBillingType: BillingCycle | 'heirloom' | null;
  status: 'active' | 'cancelled' | 'expired';
  startedAt: Date;
  // null = monthly (runs indefinitely while billing is active)
  bloomActiveUntil: Date | null;
  // Heirloom-specific fields
  heirloomPurchasedAt?: Date;
  heirloomBookStatus?: 'pending' | 'printing' | 'shipped' | 'delivered';
}

// ─── Stickers ───────────────────────────────────────────────────────────────
export interface StickerItem {
  emoji: string;
  name: string;
}

export interface StickerEraData {
  label: string;
  note: string;
  preview: string;
  s1: string;
  s2: string;
  caption: string;
  cats: string[];
  stickers: StickerItem[];
  bgGrad: string;
  borderColor: string;
}

// ─── Journal ─────────────────────────────────────────────────────────────────
export interface JournalEntry {
  id: string;
  babyId: string;
  parentId: string;
  text: string;
  mood?: string;
  photoURL?: string;
  tags?: string[];
  capturedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Navigation ─────────────────────────────────────────────────────────────
export type RootStackParamList = {
  '(auth)/welcome': undefined;
  '(auth)/signin': undefined;
  '(auth)/signup': undefined;
  '(tabs)': undefined;
  'milestone/[id]': { id: string };
  'journal/new': undefined;
  'journal/[id]': { id: string };
};

// ─── API Responses ───────────────────────────────────────────────────────────
export interface ApiResult<T> {
  data?: T;
  error?: string;
  code?: string;
}

// ─── Input Validation ────────────────────────────────────────────────────────
export interface ValidationError {
  field: string;
  message: string;
}
