import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { DEFAULT_FIRSTS, type FirstDef } from '@/data/firsts';
import { sanitizeName, sanitizeText } from '@/lib/validation';
import type {
  Baby,
  CalendarEvent,
  FamilyInvite,
  InviteStatus,
  JournalEntry,
  Memory,
  Milestone,
  PlanId,
  UserProfile,
} from '@/types/models';
import type { User } from 'firebase/auth';

const usersCol = collection(db, 'users');
const babiesCol = collection(db, 'babies');
const invitesCol = collection(db, 'invites');

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

// ── Babies ─────────────────────────────────────────────────────────
function mapBaby(snap: QueryDocumentSnapshot<DocumentData>): Baby {
  const data = snap.data();
  return {
    id: snap.id,
    ownerId: data.ownerId,
    memberIds: data.memberIds ?? [],
    name: data.name ?? '',
    birthDate: data.birthDate ?? null,
    pendingInvites: data.pendingInvites ?? [],
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

export async function createFamilyInvite(babyId: string, invitedBy: string, email: string): Promise<string> {
  const clean = email.trim().toLowerCase();
  const ref = doc(invitesCol);
  await setDoc(ref, {
    babyId,
    email: clean,
    invitedBy,
    status: 'pending' satisfies InviteStatus,
    claimedByUid: null,
    expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function revokeFamilyInvite(inviteId: string): Promise<void> {
  await updateDoc(doc(invitesCol, inviteId), { status: 'revoked' satisfies InviteStatus });
}

export async function claimFamilyInvite(inviteId: string, uid: string): Promise<void> {
  await updateDoc(doc(invitesCol, inviteId), {
    status: 'claimed' satisfies InviteStatus,
    claimedByUid: uid,
  });
}

export async function confirmFamilyInvite(babyId: string, invite: FamilyInvite): Promise<void> {
  if (!invite.claimedByUid) throw new Error('That invite has not been claimed yet.');
  await updateDoc(doc(babiesCol, babyId), {
    memberIds: arrayUnion(invite.claimedByUid),
    lastInviteId: invite.id,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(invitesCol, invite.id), { status: 'confirmed' satisfies InviteStatus });
}

export async function revokeFamilyMember(babyId: string, uid: string, inviteId?: string): Promise<void> {
  await updateDoc(doc(babiesCol, babyId), {
    memberIds: arrayRemove(uid),
    updatedAt: serverTimestamp(),
  });
  if (inviteId) {
    await updateDoc(doc(invitesCol, inviteId), { status: 'revoked' satisfies InviteStatus });
  }
}

function mapInvite(snap: QueryDocumentSnapshot<DocumentData>): FamilyInvite {
  const data = snap.data();
  return {
    id: snap.id,
    babyId: data.babyId,
    email: data.email,
    invitedBy: data.invitedBy,
    status: data.status,
    claimedByUid: data.claimedByUid ?? null,
    expiresAt: data.expiresAt ?? null,
    createdAt: data.createdAt ?? null,
  };
}

export function subscribeBabyInvites(
  babyId: string,
  cb: (invites: FamilyInvite[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(invitesCol, where('babyId', '==', babyId));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map(mapInvite)),
    (err) => onError?.(err),
  );
}

export function subscribeIncomingInvites(
  email: string,
  cb: (invites: FamilyInvite[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(invitesCol, where('email', '==', email.trim().toLowerCase()));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map(mapInvite).filter((i) => i.status === 'pending' || i.status === 'claimed')),
    (err) => onError?.(err),
  );
}

// ── Milestones ─────────────────────────────────────────────────────
function catalogueFields(first: FirstDef) {
  return {
    key: first.key,
    label: first.label,
    icon: first.icon,
    typicalAge: first.typicalAge,
    description: first.description,
    typicalWeeksMin: first.typicalWeeksMin,
    typicalWeeksMax: first.typicalWeeksMax,
    source: first.source,
    sourceNote: first.sourceNote,
  };
}

async function seedMilestones(babyId: string, authorId: string): Promise<void> {
  const col = babySub(babyId, 'milestones');
  const existing = await getDocs(query(col, fbLimit(1)));
  if (!existing.empty) return;

  const batch = writeBatch(db);
  for (const first of DEFAULT_FIRSTS) {
    const ref = doc(col);
    batch.set(ref, {
      babyId,
      ...catalogueFields(first),
      status: 'upcoming',
      custom: false,
      authorId,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

/**
 * Add any new catalogue firsts that this baby is missing, and refresh copy on
 * uncaptured catalogue items so existing families pick up accurate windows.
 */
export async function syncCatalogueMilestones(babyId: string, authorId: string): Promise<void> {
  const col = babySub(babyId, 'milestones');
  const snap = await getDocs(col);
  const byKey = new Map(snap.docs.map((d) => [String(d.data().key ?? ''), d]));

  const batch = writeBatch(db);
  let writes = 0;

  for (const first of DEFAULT_FIRSTS) {
    const existing = byKey.get(first.key);
    if (!existing) {
      batch.set(doc(col), {
        babyId,
        ...catalogueFields(first),
        status: 'upcoming',
        custom: false,
        authorId,
        createdAt: serverTimestamp(),
      });
      writes += 1;
      continue;
    }
    const data = existing.data();
    if (data.status === 'captured' || data.custom) continue;
    const fields = catalogueFields(first);
    const changed =
      data.label !== fields.label ||
      data.typicalAge !== fields.typicalAge ||
      data.description !== fields.description ||
      data.icon !== fields.icon ||
      data.typicalWeeksMin !== fields.typicalWeeksMin ||
      data.typicalWeeksMax !== fields.typicalWeeksMax ||
      data.source !== fields.source ||
      data.sourceNote !== fields.sourceNote;
    if (!changed) continue;
    batch.update(existing.ref, fields);
    writes += 1;
  }

  if (writes > 0) await batch.commit();
}

export async function addCustomMilestone(
  babyId: string,
  authorId: string,
  label: string,
): Promise<string> {
  const clean = sanitizeText(label, 80) || 'A little first';
  const ref = await addDoc(babySub(babyId, 'milestones'), {
    babyId,
    key: `custom-${Date.now()}`,
    label: clean,
    icon: 'star-outline',
    typicalAge: 'Whenever it happens',
    description: 'One of your own — a moment only your family would think to keep.',
    status: 'upcoming',
    custom: true,
    authorId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
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
    (err) => {
      // Members are not allowed to read the journal — treat as empty, not a crash.
      const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
      if (code.includes('permission-denied')) {
        cb([]);
        return;
      }
      onError?.(err);
    },
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
