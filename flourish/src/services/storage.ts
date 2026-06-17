/**
 * Firebase Storage service — file upload helpers.
 *
 * uploadMemoryPhoto: converts a local Expo file URI to a blob, uploads to
 * the correct scoped path, and returns the public download URL.
 *
 * Storage path: users/{uid}/babies/{babyId}/memories/{timestamp}_{random}.jpg
 * This matches the Firebase Storage security rules exactly.
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from './firebase';

export async function uploadMemoryPhoto(
  uid: string,
  babyId: string,
  localUri: string
): Promise<string> {
  const storage = getFirebaseStorage();

  // Unique filename — timestamp + 6-char random suffix
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storageRef = ref(storage, `users/${uid}/babies/${babyId}/memories/${filename}`);

  // fetch() works in React Native / Expo to convert a local file:// URI to a Blob
  const response = await fetch(localUri);
  const blob = await response.blob();

  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export async function uploadJournalPhoto(
  uid: string,
  entryId: string,
  localUri: string
): Promise<string> {
  const storage = getFirebaseStorage();
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storageRef = ref(storage, `users/${uid}/journals/${entryId}/${filename}`);

  const response = await fetch(localUri);
  const blob = await response.blob();

  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}
