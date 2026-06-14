import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Memory, MemoryKind } from "../types";
import { clampText, LIMITS, sanitizeTags } from "../lib/validation";

function memoriesCol(childId: string) {
  return collection(db, "children", childId, "memories");
}

function mapMemory(
  childId: string,
  id: string,
  data: Record<string, unknown>,
): Memory {
  return {
    id,
    childId,
    ownerId: (data.ownerId as string) ?? "",
    kind: (data.kind as MemoryKind) ?? "photo",
    title: (data.title as string) ?? "",
    caption: data.caption as string | undefined,
    storagePath: data.storagePath as string | undefined,
    tags: (data.tags as string[]) ?? [],
    takenAt: (data.takenAt as Timestamp) ?? null,
    createdAt: (data.createdAt as Timestamp) ?? null,
  };
}

export function subscribeMemories(
  childId: string,
  cb: (items: Memory[]) => void,
  options?: { limit?: number; onError?: (e: Error) => void },
): () => void {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (options?.limit) constraints.push(fbLimit(options.limit));
  const q = query(memoriesCol(childId), ...constraints);
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => mapMemory(childId, d.id, d.data()))),
    (err) => options?.onError?.(err),
  );
}

export interface CreateMemoryInput {
  kind: MemoryKind;
  title: string;
  caption?: string;
  storagePath?: string;
  tags?: string[];
  takenAt?: Date | null;
}

export async function createMemory(
  uid: string,
  childId: string,
  input: CreateMemoryInput,
): Promise<string> {
  const title = clampText(input.title, LIMITS.memoryTitle.max) || "Untitled memory";
  const ref = await addDoc(memoriesCol(childId), {
    ownerId: uid,
    kind: input.kind,
    title,
    caption: input.caption ? clampText(input.caption, LIMITS.caption.max) : "",
    storagePath: input.storagePath ?? "",
    tags: sanitizeTags(input.tags ?? []),
    takenAt: input.takenAt ? Timestamp.fromDate(input.takenAt) : serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteMemory(
  childId: string,
  memoryId: string,
): Promise<void> {
  await deleteDoc(doc(db, "children", childId, "memories", memoryId));
}
