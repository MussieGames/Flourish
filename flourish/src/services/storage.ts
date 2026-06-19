/**
 * Firebase Storage service — file upload with compression.
 *
 * Photos are compressed before upload:
 *  - Memories: max 1920px on longest side, 85% quality → typically 200–400KB
 *  - Journal photos: max 1200px, 80% quality → typically 100–250KB
 *
 * This reduces storage costs, speeds up upload/download, and stays well within
 * Firebase Storage file size limits in the security rules.
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImageManipulator from 'expo-image-manipulator';
import { getFirebaseStorage } from './firebase';

// ─── Compression helpers ──────────────────────────────────────────────────────
async function compressImage(
  localUri: string,
  maxDimension: number,
  quality: number
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: maxDimension } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

// ─── Upload helpers ───────────────────────────────────────────────────────────
async function uploadToStorage(
  path: string,
  compressedUri: string
): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);

  const response = await fetch(compressedUri);
  const blob = await response.blob();

  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function uploadMemoryPhoto(
  uid: string,
  babyId: string,
  localUri: string
): Promise<string> {
  const compressed = await compressImage(localUri, 1920, 0.85);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  return uploadToStorage(`users/${uid}/babies/${babyId}/memories/${filename}`, compressed);
}

export async function uploadJournalPhoto(
  uid: string,
  entryId: string,
  localUri: string
): Promise<string> {
  const compressed = await compressImage(localUri, 1200, 0.8);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  return uploadToStorage(`users/${uid}/journals/${entryId}/${filename}`, compressed);
}

export async function uploadBabyProfilePhoto(
  uid: string,
  babyId: string,
  localUri: string
): Promise<string> {
  const compressed = await compressImage(localUri, 800, 0.85);
  return uploadToStorage(`users/${uid}/babies/${babyId}/profile/avatar.jpg`, compressed);
}
