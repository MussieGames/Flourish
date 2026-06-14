import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { ChildProfile } from "../types";
import { MILESTONE_TEMPLATES } from "../data/milestoneTemplates";
import { isValidChildName, sanitizeText } from "../lib/validation";

const childrenCol = collection(db, "children");

function mapChild(id: string, data: Record<string, unknown>): ChildProfile {
  return {
    id,
    name: (data.name as string) ?? "",
    bornAt: (data.bornAt as Timestamp) ?? null,
    ownerId: (data.ownerId as string) ?? "",
    members: (data.members as string[]) ?? [],
    avatarEmoji: data.avatarEmoji as string | undefined,
    createdAt: (data.createdAt as Timestamp) ?? null,
    updatedAt: (data.updatedAt as Timestamp) ?? null,
  };
}

/** Live list of children the signed-in user can access. */
export function subscribeChildren(
  uid: string,
  cb: (children: ChildProfile[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    childrenCol,
    where("members", "array-contains", uid),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => mapChild(d.id, d.data()))),
    (err) => onError?.(err),
  );
}

export interface CreateChildInput {
  name: string;
  bornAt?: Date | null;
  avatarEmoji?: string;
}

/**
 * Creates a child owned by `uid`, then seeds the default milestones in a single
 * atomic batch so the dashboard is populated immediately.
 */
export async function createChild(
  uid: string,
  input: CreateChildInput,
): Promise<string> {
  const name = sanitizeText(input.name);
  if (!isValidChildName(name)) {
    throw new Error("Please enter a valid name.");
  }

  const childRef = await addDoc(childrenCol, {
    name,
    bornAt: input.bornAt ? Timestamp.fromDate(input.bornAt) : null,
    ownerId: uid,
    members: [uid],
    avatarEmoji: input.avatarEmoji ?? "🌿",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const batch = writeBatch(db);
  const milestonesCol = collection(db, "children", childRef.id, "milestones");
  for (const t of MILESTONE_TEMPLATES) {
    const ref = doc(milestonesCol);
    batch.set(ref, {
      key: t.key,
      title: t.title,
      emoji: t.emoji,
      typicalAge: t.typicalAge,
      status: "upcoming",
      capturedAt: null,
      ownerId: uid,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();

  // Remember the active child on the user profile.
  await setDoc(
    doc(db, "users", uid),
    { activeChildId: childRef.id },
    { merge: true },
  );

  return childRef.id;
}

export async function setActiveChild(
  uid: string,
  childId: string,
): Promise<void> {
  await setDoc(doc(db, "users", uid), { activeChildId: childId }, { merge: true });
}
