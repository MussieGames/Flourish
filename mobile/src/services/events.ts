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
import type { CalendarEvent, CalendarEventType } from "../types";
import { clampText, LIMITS } from "../lib/validation";

function eventsCol(childId: string) {
  return collection(db, "children", childId, "events");
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function mapEvent(
  childId: string,
  id: string,
  data: Record<string, unknown>,
): CalendarEvent {
  return {
    id,
    childId,
    ownerId: (data.ownerId as string) ?? "",
    type: (data.type as CalendarEventType) ?? "memory",
    title: (data.title as string) ?? "",
    meta: data.meta as string | undefined,
    date: (data.date as string) ?? "",
    createdAt: (data.createdAt as Timestamp) ?? null,
  };
}

export function subscribeEvents(
  childId: string,
  cb: (items: CalendarEvent[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(eventsCol(childId), orderBy("date", "asc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => mapEvent(childId, d.id, d.data()))),
    (err) => onError?.(err),
  );
}

export interface CreateEventInput {
  type: CalendarEventType;
  title: string;
  meta?: string;
  date: string; // YYYY-MM-DD
}

export async function createEvent(
  uid: string,
  childId: string,
  input: CreateEventInput,
): Promise<string> {
  if (!DATE_KEY_RE.test(input.date)) {
    throw new Error("Invalid date.");
  }
  const title = clampText(input.title, LIMITS.eventTitle.max);
  if (!title) throw new Error("Give the event a title.");
  const ref = await addDoc(eventsCol(childId), {
    ownerId: uid,
    type: input.type,
    title,
    meta: input.meta ? clampText(input.meta, LIMITS.eventMeta.max) : "",
    date: input.date,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteEvent(
  childId: string,
  eventId: string,
): Promise<void> {
  await deleteDoc(doc(db, "children", childId, "events", eventId));
}
