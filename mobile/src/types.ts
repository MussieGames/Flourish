import type { Timestamp } from "firebase/firestore";

export type MemoryKind = "photo" | "video" | "journal";

export interface ChildProfile {
  id: string;
  name: string;
  bornAt: Timestamp | null;
  /** UID of the creating parent. */
  ownerId: string;
  /** UIDs allowed to read/write this child's data (includes the owner). */
  members: string[];
  avatarEmoji?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface Memory {
  id: string;
  childId: string;
  ownerId: string;
  kind: MemoryKind;
  title: string;
  caption?: string;
  /** Storage path (not a public URL) for the asset, if any. */
  storagePath?: string;
  tags: string[];
  takenAt: Timestamp | null;
  createdAt: Timestamp | null;
}

export interface JournalEntry {
  id: string;
  childId: string;
  ownerId: string;
  text: string;
  mood?: string;
  tags: string[];
  storagePath?: string;
  createdAt: Timestamp | null;
}

export type MilestoneStatus = "upcoming" | "captured";

export interface Milestone {
  id: string;
  childId: string;
  ownerId: string;
  /** Template key, e.g. "first_smile". */
  key: string;
  title: string;
  emoji: string;
  typicalAge: string;
  status: MilestoneStatus;
  capturedAt: Timestamp | null;
  note?: string;
  createdAt: Timestamp | null;
}

export type CalendarEventType = "milestone" | "memory" | "appointment";

export interface CalendarEvent {
  id: string;
  childId: string;
  ownerId: string;
  type: CalendarEventType;
  title: string;
  meta?: string;
  /** Stored as YYYY-MM-DD for easy month querying. */
  date: string;
  createdAt: Timestamp | null;
}

export type PlanTier = "seedling" | "bloom" | "heirloom";

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  plan: PlanTier;
  activeChildId?: string;
  createdAt: Timestamp | null;
}
