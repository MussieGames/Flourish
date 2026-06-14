import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage';
import { storage } from './config';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB — mirrors Storage Rules.
const ALLOWED_PREFIXES = ['image/', 'video/'];

/**
 * Uploads a local file (from expo-image-picker) to a per-baby, owner-scoped
 * Storage path. We validate size & content type client-side; Storage Rules
 * enforce the same limits server-side so a tampered client cannot bypass them.
 */
export async function uploadMemoryAsset(
  babyId: string,
  uid: string,
  localUri: string,
  contentType: string,
): Promise<string> {
  if (!ALLOWED_PREFIXES.some((p) => contentType.startsWith(p))) {
    throw new Error('Only photos and videos can be uploaded.');
  }

  const response = await fetch(localUri);
  const blob = await response.blob();

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error('That file is too large (max 15 MB).');
  }

  const extension = contentType.split('/')[1]?.split(';')[0] ?? 'bin';
  const safeExt = extension.replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'bin';
  const path = `babies/${babyId}/memories/${uid}/${Date.now()}-${randomId()}.${safeExt}`;

  const objectRef = storageRef(storage, path);
  await uploadBytes(objectRef, blob, {
    contentType,
    cacheControl: 'private, max-age=31536000',
  });
  return path;
}

export async function resolveDownloadUrl(path: string): Promise<string> {
  return getDownloadURL(storageRef(storage, path));
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}
