import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage';
import { storage } from './config';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB — mirrors Storage Rules.

/**
 * Explicit allow-list, matching Storage Rules. Deliberately not `image/*`:
 * that also admits image/svg+xml, which can carry script.
 */
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
];

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
  const normalizedType = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!ALLOWED_TYPES.includes(normalizedType)) {
    throw new Error('That file type isn’t supported — photos and videos only.');
  }

  const response = await fetch(localUri);
  const blob = await response.blob();

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error('That file is too large (max 15 MB).');
  }

  const extension = normalizedType.split('/')[1] ?? 'bin';
  const safeExt = extension.replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'bin';
  const path = `babies/${babyId}/memories/${uid}/${Date.now()}-${randomId()}.${safeExt}`;

  const objectRef = storageRef(storage, path);
  // Send the normalised type so it matches the allow-list Storage Rules check.
  await uploadBytes(objectRef, blob, {
    contentType: normalizedType,
    cacheControl: 'private, max-age=31536000',
  });
  return path;
}

export async function resolveDownloadUrl(path: string): Promise<string> {
  return getDownloadURL(storageRef(storage, path));
}

/**
 * Collision avoidance only — NOT a security boundary. Access is enforced by
 * Storage Rules (reads are locked to the uploader), never by path secrecy, so
 * this does not need a cryptographic source.
 */
function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}
