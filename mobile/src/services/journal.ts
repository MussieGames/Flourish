import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { JournalEntry } from "../types";
import { clampText, LIMITS, sanitizeTags } from "../lib/validation";

function journalCol(childId: string) {
  return collection(db, "children", childId, "journal");
}

function mapEntry(
  childId: string,
  id: string,
  data: Record<string, unknown>,
): JournalEntry {
  return {
    id,
    childId,
    ownerId: (data.ownerId as string) ?? "",
    text: (data.text as string) ?? "",
    mood: data.mood as string | undefined,
    tags: (data.tags as string[]) ?? [],
    storagePath: data.storagePath as string | undefined,
    createdAt: (data.createdAt as Timestamp) ?? null,
  };
}

export function subscribeJournal(
  childId: string,
  cb: (items: JournalEntry[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(journalCol(childId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => mapEntry(childId, d.id, d.data()))),
    (err) => onError?.(err),
  );
}

export interface CreateJournalInput {
  text: string;
  mood?: string;
  tags?: string[];
  storagePath?: string;
}

export async function createJournalEntry(
  uid: string,
  childId: string,
  input: CreateJournalInput,
): Promise<string> {
  const text = clampText(input.text, LIMITS.journalText.max);
  if (!text) throw new Error("Write a little something first.");
  const ref = await addDoc(journalCol(childId), {
    ownerId: uid,
    text,
    mood: input.mood ?? "",
    tags: sanitizeTags(input.tags ?? []),
    storagePath: input.storagePath ?? "",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteJournalEntry(
  childId: string,
  entryId: string,
): Promise<void> {
  await deleteDoc(doc(db, "children", childId, "journal", entryId));
}
