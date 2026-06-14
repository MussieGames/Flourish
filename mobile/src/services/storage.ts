import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";

import { storage } from "../config/firebase";

/** Max upload size enforced client-side AND in storage.rules (15 MB). */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

function randomId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface UploadResult {
  storagePath: string;
  downloadUrl: string;
}

/**
 * Uploads a local asset (from expo-image-picker) into the child's private
 * Storage folder. Throws if the file exceeds the size cap or has an
 * unsupported type.
 */
export async function uploadChildAsset(
  childId: string,
  uid: string,
  localUri: string,
  mimeType: string,
): Promise<UploadResult> {
  const ext = EXT_BY_MIME[mimeType];
  if (!ext) {
    throw new Error("Unsupported file type.");
  }

  const response = await fetch(localUri);
  const blob = await response.blob();
  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("That file is too large (max 15 MB).");
  }

  const storagePath = `children/${childId}/${uid}/${randomId()}.${ext}`;
  const objectRef = ref(storage, storagePath);
  await uploadBytes(objectRef, blob, { contentType: mimeType });
  const downloadUrl = await getDownloadURL(objectRef);
  return { storagePath, downloadUrl };
}

export async function getAssetUrl(storagePath: string): Promise<string> {
  return getDownloadURL(ref(storage, storagePath));
}

export async function deleteAsset(storagePath: string): Promise<void> {
  await deleteObject(ref(storage, storagePath)).catch(() => {});
}
