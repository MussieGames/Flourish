/**
 * Firestore data service — all operations enforce:
 *  - UID scoping (users only touch their own documents)
 *  - Input sanitisation before writes
 *  - Structured error handling
 *  - Optimistic UI-ready return shapes
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { sanitizeText } from '../utils/sanitize';
import type {
  Baby,
  Memory,
  Milestone,
  JournalEntry,
  CalendarEvent,
  Subscription,
} from '../types';

// ─── Collection paths ─────────────────────────────────────────────────────────
const COLLECTIONS = {
  users: 'users',
  babies: 'babies',
  memories: 'memories',
  milestones: 'milestones',
  journalEntries: 'journal_entries',
  calendarEvents: 'calendar_events',
  subscriptions: 'subscriptions',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toDate(ts: Timestamp | Date | undefined): Date {
  if (!ts) return new Date();
  if (ts instanceof Timestamp) return ts.toDate();
  return ts;
}

function assertOwner(doc: DocumentData, uid: string): void {
  if (doc.parentId !== uid && doc.userId !== uid && doc.uid !== uid) {
    throw new Error('Access denied: you do not own this document.');
  }
}

// ─── Baby CRUD ────────────────────────────────────────────────────────────────
export async function createBaby(
  uid: string,
  data: Pick<Baby, 'name' | 'birthDate' | 'gender'>
): Promise<Baby> {
  const db = getFirebaseFirestore();
  const now = serverTimestamp();
  const docRef = await addDoc(collection(db, COLLECTIONS.babies), {
    name: sanitizeText(data.name),
    birthDate: Timestamp.fromDate(data.birthDate),
    gender: data.gender ?? null,
    photoURL: null,
    parentId: uid,
    createdAt: now,
    updatedAt: now,
  });
  const snap = await getDoc(docRef);
  const d = snap.data()!;
  return {
    id: snap.id,
    name: d.name,
    birthDate: toDate(d.birthDate),
    gender: d.gender,
    photoURL: d.photoURL,
    parentId: d.parentId,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export async function getBabiesForUser(uid: string): Promise<Baby[]> {
  const db = getFirebaseFirestore();
  const q = query(
    collection(db, COLLECTIONS.babies),
    where('parentId', '==', uid),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    birthDate: toDate(d.data().birthDate),
    gender: d.data().gender,
    photoURL: d.data().photoURL,
    parentId: d.data().parentId,
    createdAt: toDate(d.data().createdAt),
    updatedAt: toDate(d.data().updatedAt),
  }));
}

export async function updateBaby(
  uid: string,
  babyId: string,
  updates: Partial<Pick<Baby, 'name' | 'photoURL'>>
): Promise<void> {
  const db = getFirebaseFirestore();
  const ref = doc(db, COLLECTIONS.babies, babyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Baby not found');
  assertOwner(snap.data()!, uid);
  await updateDoc(ref, {
    ...updates,
    name: updates.name ? sanitizeText(updates.name) : undefined,
    updatedAt: serverTimestamp(),
  });
}

// ─── Memories ─────────────────────────────────────────────────────────────────
export async function createMemory(
  uid: string,
  data: Omit<Memory, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>
): Promise<Memory> {
  const db = getFirebaseFirestore();
  const now = serverTimestamp();
  const docRef = await addDoc(collection(db, COLLECTIONS.memories), {
    ...data,
    title: sanitizeText(data.title),
    description: data.description ? sanitizeText(data.description) : null,
    parentId: uid,
    capturedAt: Timestamp.fromDate(data.capturedAt),
    createdAt: now,
    updatedAt: now,
  });
  const snap = await getDoc(docRef);
  const d = snap.data()!;
  return { id: snap.id, ...d, capturedAt: toDate(d.capturedAt), createdAt: toDate(d.createdAt), updatedAt: toDate(d.updatedAt) } as Memory;
}

export async function getMemoriesForBaby(
  uid: string,
  babyId: string,
  limitCount = 20
): Promise<Memory[]> {
  const db = getFirebaseFirestore();
  const q = query(
    collection(db, COLLECTIONS.memories),
    where('parentId', '==', uid),
    where('babyId', '==', babyId),
    orderBy('capturedAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Memory, 'id' | 'capturedAt' | 'createdAt' | 'updatedAt'>),
    capturedAt: toDate(d.data().capturedAt),
    createdAt: toDate(d.data().createdAt),
    updatedAt: toDate(d.data().updatedAt),
  }));
}

export function subscribeToMemories(
  uid: string,
  babyId: string,
  onUpdate: (memories: Memory[]) => void
): () => void {
  const db = getFirebaseFirestore();
  const q = query(
    collection(db, COLLECTIONS.memories),
    where('parentId', '==', uid),
    where('babyId', '==', babyId),
    orderBy('capturedAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    const memories = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Memory, 'id' | 'capturedAt' | 'createdAt' | 'updatedAt'>),
      capturedAt: toDate(d.data().capturedAt),
      createdAt: toDate(d.data().createdAt),
      updatedAt: toDate(d.data().updatedAt),
    }));
    onUpdate(memories);
  });
}

// ─── Milestones ───────────────────────────────────────────────────────────────
export async function getMilestonesForBaby(
  uid: string,
  babyId: string
): Promise<Milestone[]> {
  const db = getFirebaseFirestore();
  const q = query(
    collection(db, COLLECTIONS.milestones),
    where('parentId', '==', uid),
    where('babyId', '==', babyId),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Milestone, 'id' | 'capturedAt' | 'createdAt' | 'updatedAt'>),
    capturedAt: d.data().capturedAt ? toDate(d.data().capturedAt) : undefined,
    createdAt: toDate(d.data().createdAt),
    updatedAt: toDate(d.data().updatedAt),
  }));
}

export async function captureMilestone(
  uid: string,
  milestoneId: string,
  memoryId?: string
): Promise<void> {
  const db = getFirebaseFirestore();
  const ref = doc(db, COLLECTIONS.milestones, milestoneId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Milestone not found');
  assertOwner(snap.data()!, uid);
  await updateDoc(ref, {
    isCaptured: true,
    capturedAt: serverTimestamp(),
    memoryId: memoryId ?? null,
    updatedAt: serverTimestamp(),
  });
}

export async function createMilestoneFromTemplate(
  uid: string,
  babyId: string,
  template: { id: string; emoji: string; title: string; description: string; expectedAgeWeeks: number }
): Promise<string> {
  const db = getFirebaseFirestore();
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, COLLECTIONS.milestones), {
    babyId,
    parentId: uid,
    type: template.id,
    emoji: template.emoji,
    title: template.title,
    description: template.description,
    expectedAgeWeeks: template.expectedAgeWeeks,
    isCaptured: false,
    capturedAt: null,
    memoryId: null,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

// ─── Journal ──────────────────────────────────────────────────────────────────
export async function createJournalEntry(
  uid: string,
  data: Omit<JournalEntry, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>
): Promise<JournalEntry> {
  const db = getFirebaseFirestore();
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, COLLECTIONS.journalEntries), {
    ...data,
    text: sanitizeText(data.text),
    parentId: uid,
    capturedAt: Timestamp.fromDate(data.capturedAt),
    createdAt: now,
    updatedAt: now,
  });
  const snap = await getDoc(ref);
  const d = snap.data()!;
  return { id: snap.id, ...d, capturedAt: toDate(d.capturedAt), createdAt: toDate(d.createdAt), updatedAt: toDate(d.updatedAt) } as JournalEntry;
}

export async function getJournalEntriesForBaby(
  uid: string,
  babyId: string
): Promise<JournalEntry[]> {
  const db = getFirebaseFirestore();
  const q = query(
    collection(db, COLLECTIONS.journalEntries),
    where('parentId', '==', uid),
    where('babyId', '==', babyId),
    orderBy('capturedAt', 'desc'),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<JournalEntry, 'id' | 'capturedAt' | 'createdAt' | 'updatedAt'>),
    capturedAt: toDate(d.data().capturedAt),
    createdAt: toDate(d.data().createdAt),
    updatedAt: toDate(d.data().updatedAt),
  }));
}

// ─── Calendar Events ──────────────────────────────────────────────────────────
export async function getCalendarEventsForMonth(
  uid: string,
  babyId: string,
  year: number,
  month: number
): Promise<CalendarEvent[]> {
  const db = getFirebaseFirestore();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const q = query(
    collection(db, COLLECTIONS.calendarEvents),
    where('parentId', '==', uid),
    where('babyId', '==', babyId),
    where('date', '>=', Timestamp.fromDate(start)),
    where('date', '<=', Timestamp.fromDate(end)),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<CalendarEvent, 'id' | 'date' | 'createdAt'>),
    date: toDate(d.data().date),
    createdAt: toDate(d.data().createdAt),
  }));
}

// ─── Subscription ─────────────────────────────────────────────────────────────
export async function getSubscription(uid: string): Promise<Subscription | null> {
  const db = getFirebaseFirestore();
  const ref = doc(db, COLLECTIONS.subscriptions, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    userId: uid,
    planId: d.planId,
    status: d.status,
    startedAt: toDate(d.startedAt),
    expiresAt: d.expiresAt ? toDate(d.expiresAt) : undefined,
    isLifetime: d.isLifetime ?? false,
  };
}
