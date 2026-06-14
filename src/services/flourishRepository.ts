import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ensureSignedIn, getFirebaseServices } from "../firebase/client";

export type ChildProfileInput = {
  name: string;
  birthDateIso?: string;
};

export type MemoryInput = {
  childId: string;
  title: string;
  note?: string;
  kind: "photo" | "video" | "journal";
};

const MAX_NAME_LENGTH = 80;
const MAX_TITLE_LENGTH = 120;
const MAX_NOTE_LENGTH = 5000;

function normalizeText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function assertValidChildName(name: string): string {
  const normalized = normalizeText(name, MAX_NAME_LENGTH);
  if (normalized.length < 1) {
    throw new Error("Please add a name before continuing.");
  }
  return normalized;
}

export async function createChildProfile(input: ChildProfileInput): Promise<string> {
  const user = await ensureSignedIn();
  const { db } = getFirebaseServices();
  const name = assertValidChildName(input.name);

  const childRef = await addDoc(collection(db, "children"), {
    ownerUid: user.uid,
    caregiverUids: {},
    displayName: name,
    birthDateIso: input.birthDateIso ?? null,
    schemaVersion: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return childRef.id;
}

export async function saveJournalMemory(input: MemoryInput): Promise<string> {
  const user = await ensureSignedIn();
  const { db } = getFirebaseServices();
  const title = normalizeText(input.title, MAX_TITLE_LENGTH);
  const note = normalizeText(input.note ?? "", MAX_NOTE_LENGTH);

  if (!title) {
    throw new Error("A memory title is required.");
  }

  const memoryRef = await addDoc(
    collection(db, "children", input.childId, "memories"),
    {
      ownerUid: user.uid,
      childId: input.childId,
      title,
      note,
      kind: input.kind,
      isSharedWithFamily: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  );

  return memoryRef.id;
}

export async function uploadPrivateMemoryAsset(params: {
  childId: string;
  memoryId: string;
  bytes: Blob;
  contentType: "image/jpeg" | "image/png" | "video/mp4";
}): Promise<string> {
  const user = await ensureSignedIn();
  const { storage } = getFirebaseServices();
  const assetRef = ref(
    storage,
    `users/${user.uid}/children/${params.childId}/memories/${params.memoryId}/${Date.now()}`
  );

  await uploadBytes(assetRef, params.bytes, {
    contentType: params.contentType,
    customMetadata: {
      ownerUid: user.uid,
      childId: params.childId,
      memoryId: params.memoryId
    }
  });

  return getDownloadURL(assetRef);
}
