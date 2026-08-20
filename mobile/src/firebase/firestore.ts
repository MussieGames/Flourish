import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { DEFAULT_FIRSTS } from '@/data/firsts';
import { sanitizeName, sanitizeText } from '@/lib/validation';
import type {
  Baby,
  CalendarEvent,
  JournalEntry,
  Memory,
  Milestone,
  PlanId,
  UserProfile,
} from '@/types/models';
import type { User } from 'firebase/auth';

const usersCol = collection(db, 'users');
const babiesCol = collection(db, 'babies');

const babySub = (babyId: string, name: string) =>
  collection(db, 'babies', babyId, name);

// ── Users ──────────────────────────────────────────────────────────
export async function ensureUserProfile(user: User): Promise<void> {
  const ref = doc(usersCol, user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? null,
      plan: 'seedling' satisfies PlanId,
      appLockEnabled: false,
      createdAt: serverTimestamp(),
    });
  }
}

export function subscribeUserProfile(
  uid: string,
  cb: (profile: UserProfile | null) => void,
  onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    doc(usersCol, uid),
    (snap) => cb(snap.exists() ? ({ uid, ...snap.data() } as UserProfile) : null),
    (err) => onError?.(err),
  );
}

export async function updateUserPlan(uid: string, plan: PlanId): Promise<void> {
  await updateDoc(doc(usersCol, uid), { plan });
}

// ── Babies ─────────────────────────────────────────────────────────
function mapBaby(snap: QueryDocumentSnapshot<DocumentData>): Baby {
  const data = snap.data();
  return {
    id: snap.id,
    ownerId: data.ownerId,
    memberIds: data.memberIds ?? [],
    name: data.name ?? '',
    birthDate: data.birthDate ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export async function createBaby(
  ownerId: string,
  name: string,
  birthDate: string | null,
): Promise<string> {
  const cleanName = sanitizeName(name) || 'Little one';
  const ref = await addDoc(babiesCol, {
    ownerId,
    memberIds: [ownerId],
    name: cleanName,
    birthDate,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await seedMilestones(ref.id, ownerId);
  return ref.id;
}

export function subscribeBabies(
  uid: string,
  cb: (babies: Baby[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(babiesCol, where('memberIds', 'array-contains', uid));
  return onSnapshot(
    q,
    (snap) => {
      const babies = snap.docs.map(mapBaby);
      babies.sort((a, b) => (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0));
      cb(babies);
    },
    (err) => onError?.(err),
  );
}

export async function updateBaby(
  babyId: string,
  patch: Partial<Pick<Baby, 'name' | 'birthDate'>>,
): Promise<void> {
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.name !== undefined) data.name = sanitizeName(patch.name);
  if (patch.birthDate !== undefined) data.birthDate = patch.birthDate;
  await updateDoc(doc(babiesCol, babyId), data);
}

// ── Milestones ─────────────────────────────────────────────────────
async function seedMilestones(babyId: string, authorId: string): Promise<void> {
  const col = babySub(babyId, 'milestones');
  const existing = await getDocs(query(col, fbLimit(1)));
  if (!existing.empty) return;

  const batch = writeBatch(db);
  for (const first of DEFAULT_FIRSTS) {
    const ref = doc(col);
    batch.set(ref, {
      babyId,
      key: first.key,
      label: first.label,
      emoji: first.emoji,
      typicalAge: first.typicalAge,
      status: 'upcoming',
      authorId,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export function subscribeMilestones(
  babyId: string,
  cb: (milestones: Milestone[]) => void,
  onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    babySub(babyId, 'milestones'),
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Milestone);
      cb(items);
    },
    (err) => onError?.(err),
  );
}

export async function captureMilestone(babyId: string, milestoneId: string): Promise<void> {
  await updateDoc(doc(db, 'babies', babyId, 'milestones', milestoneId), {
    status: 'captured',
    capturedAt: serverTimestamp(),
  });
}

// ── Memories ───────────────────────────────────────────────────────
export async function addMemory(
  babyId: string,
  authorId: string,
  input: Pick<Memory, 'kind' | 'title' | 'caption' | 'storagePath'>,
): Promise<string> {
  const ref = await addDoc(babySub(babyId, 'memories'), {
    babyId,
    authorId,
    kind: input.kind,
    title: sanitizeText(input.title, 80) || 'Untitled memory',
    caption: input.caption ? sanitizeText(input.caption, 500) : '',
    storagePath: input.storagePath ?? null,
    takenAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeMemories(
  babyId: string,
  cb: (memories: Memory[]) => void,
  onError?: (e: Error) => void,
  max = 50,
): () => void {
  const q = query(babySub(babyId, 'memories'), orderBy('createdAt', 'desc'), fbLimit(max));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Memory)),
    (err) => onError?.(err),
  );
}

// ── Journal ────────────────────────────────────────────────────────
export async function addJournalEntry(
  babyId: string,
  authorId: string,
  input: Pick<JournalEntry, 'body' | 'mood' | 'tags' | 'storagePath'>,
): Promise<string> {
  const ref = await addDoc(babySub(babyId, 'journal'), {
    babyId,
    authorId,
    body: sanitizeText(input.body, 4000),
    mood: input.mood ?? null,
    tags: (input.tags ?? []).slice(0, 8).map((t) => sanitizeText(t, 24)),
    storagePath: input.storagePath ?? null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeJournal(
  babyId: string,
  cb: (entries: JournalEntry[]) => void,
  onError?: (e: Error) => void,
  max = 50,
): () => void {
  const q = query(babySub(babyId, 'journal'), orderBy('createdAt', 'desc'), fbLimit(max));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as JournalEntry)),
    (err) => onError?.(err),
  );
}

// ── Calendar events ────────────────────────────────────────────────
export async function addEvent(
  babyId: string,
  input: Pick<CalendarEvent, 'type' | 'title' | 'meta' | 'date'>,
): Promise<string> {
  const ref = await addDoc(babySub(babyId, 'events'), {
    babyId,
    type: input.type,
    title: sanitizeText(input.title, 80),
    meta: input.meta ? sanitizeText(input.meta, 120) : '',
    date: input.date,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeEvents(
  babyId: string,
  cb: (events: CalendarEvent[]) => void,
  onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    babySub(babyId, 'events'),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CalendarEvent)),
    (err) => onError?.(err),
  );
}
