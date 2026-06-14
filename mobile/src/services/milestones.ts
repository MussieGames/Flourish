import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Milestone, MilestoneStatus } from "../types";
import { clampText, LIMITS } from "../lib/validation";

function milestonesCol(childId: string) {
  return collection(db, "children", childId, "milestones");
}

function mapMilestone(
  childId: string,
  id: string,
  data: Record<string, unknown>,
): Milestone {
  return {
    id,
    childId,
    ownerId: (data.ownerId as string) ?? "",
    key: (data.key as string) ?? "",
    title: (data.title as string) ?? "",
    emoji: (data.emoji as string) ?? "⭐",
    typicalAge: (data.typicalAge as string) ?? "",
    status: (data.status as MilestoneStatus) ?? "upcoming",
    capturedAt: (data.capturedAt as Timestamp) ?? null,
    note: data.note as string | undefined,
    createdAt: (data.createdAt as Timestamp) ?? null,
  };
}

export function subscribeMilestones(
  childId: string,
  cb: (items: Milestone[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(milestonesCol(childId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => mapMilestone(childId, d.id, d.data()))),
    (err) => onError?.(err),
  );
}

export async function captureMilestone(
  childId: string,
  milestoneId: string,
  note?: string,
): Promise<void> {
  await updateDoc(doc(db, "children", childId, "milestones", milestoneId), {
    status: "captured",
    capturedAt: serverTimestamp(),
    note: note ? clampText(note, LIMITS.caption.max) : "",
  });
}

export async function resetMilestone(
  childId: string,
  milestoneId: string,
): Promise<void> {
  await updateDoc(doc(db, "children", childId, "milestones", milestoneId), {
    status: "upcoming",
    capturedAt: null,
  });
}
