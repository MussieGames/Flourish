import type { Timestamp } from 'firebase/firestore';

export type PlanId = 'seedling' | 'bloom' | 'heirloom';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  plan: PlanId;
  createdAt: Timestamp | null;
  /** App-level privacy lock (biometric/PIN) preference. */
  appLockEnabled?: boolean;
}

/**
 * A baby's "world". Owned by one parent, optionally shared with a small,
 * explicit list of trusted family members. All memories/milestones/journal
 * entries live as subcollections beneath this document.
 */
export interface Baby {
  id: string;
  ownerId: string;
  /** uids allowed to read this baby's data (includes the owner). */
  memberIds: string[];
  name: string;
  /** ISO date string (yyyy-mm-dd) of birth. */
  birthDate: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type MemoryKind = 'photo' | 'video' | 'note';

export interface Memory {
  id: string;
  babyId: string;
  authorId: string;
  kind: MemoryKind;
  title: string;
  caption?: string;
  /** Storage path (not a public URL) — resolved to a download URL on demand. */
  storagePath?: string;
  takenAt: Timestamp | null;
  createdAt: Timestamp | null;
}

export type MilestoneStatus = 'upcoming' | 'captured';

export interface Milestone {
  id: string;
  babyId: string;
  key: string;
  label: string;
  emoji: string;
  typicalAge: string;
  status: MilestoneStatus;
  capturedAt?: Timestamp | null;
  createdAt: Timestamp | null;
}

export type Mood = '😭' | '🥰' | '😊' | '😴' | '🤯' | '🥲';

export interface JournalEntry {
  id: string;
  babyId: string;
  authorId: string;
  body: string;
  mood?: Mood;
  tags: string[];
  storagePath?: string;
  createdAt: Timestamp | null;
}

export type EventType = 'milestone' | 'memory' | 'appointment';

export interface CalendarEvent {
  id: string;
  babyId: string;
  type: EventType;
  title: string;
  meta?: string;
  /** ISO date string yyyy-mm-dd. */
  date: string;
  createdAt: Timestamp | null;
}

export interface StickerPlacement {
  emoji: string;
  name: string;
}
