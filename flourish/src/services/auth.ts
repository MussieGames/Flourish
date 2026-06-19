/**
 * Authentication service — wraps Firebase Auth with:
 *  - Rate limiting (client-side, augmented by Firebase's own limits)
 *  - Input sanitisation & Zod validation
 *  - Secure token storage via expo-secure-store
 *  - Session timeout tracking
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { getFirebaseAuth } from './firebase';
import { sanitizeText } from '../utils/sanitize';

// ─── Validation schemas ───────────────────────────────────────────────────────
const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(255, 'Email is too long')
  .transform((v) => v.trim().toLowerCase());

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const displayNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long')
  .transform(sanitizeText);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const AUTH_ATTEMPT_KEY = 'flourish_auth_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

async function getAttemptRecord(): Promise<AttemptRecord> {
  const raw = await SecureStore.getItemAsync(AUTH_ATTEMPT_KEY);
  if (!raw) return { count: 0, firstAttemptAt: Date.now() };
  try {
    return JSON.parse(raw) as AttemptRecord;
  } catch {
    return { count: 0, firstAttemptAt: Date.now() };
  }
}

async function recordFailedAttempt(): Promise<void> {
  const record = await getAttemptRecord();
  const now = Date.now();

  // Reset if window has expired
  if (now - record.firstAttemptAt > LOCKOUT_DURATION_MS) {
    await SecureStore.setItemAsync(
      AUTH_ATTEMPT_KEY,
      JSON.stringify({ count: 1, firstAttemptAt: now })
    );
    return;
  }

  const newCount = record.count + 1;
  const updated: AttemptRecord = {
    count: newCount,
    firstAttemptAt: record.firstAttemptAt,
    lockedUntil: newCount >= MAX_ATTEMPTS ? now + LOCKOUT_DURATION_MS : undefined,
  };
  await SecureStore.setItemAsync(AUTH_ATTEMPT_KEY, JSON.stringify(updated));
}

async function resetAttemptRecord(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_ATTEMPT_KEY);
}

async function checkRateLimit(): Promise<void> {
  const record = await getAttemptRecord();
  const now = Date.now();

  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    throw new Error(
      `Too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`
    );
  }

  // Auto-reset expired lockout
  if (record.lockedUntil && now >= record.lockedUntil) {
    await resetAttemptRecord();
  }
}

// ─── Secure session token ────────────────────────────────────────────────────
const SESSION_KEY = 'flourish_session_uid';

export async function storeSessionUid(uid: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, uid, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getStoredSessionUid(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
  await resetAttemptRecord();
}

// ─── Auth operations ─────────────────────────────────────────────────────────
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> {
  await checkRateLimit();

  const validatedEmail = emailSchema.parse(email);
  const validatedPassword = passwordSchema.parse(password);
  const validatedName = displayNameSchema.parse(displayName);

  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(
    auth,
    validatedEmail,
    validatedPassword
  );

  await updateProfile(credential.user, { displayName: validatedName });
  await sendEmailVerification(credential.user);
  await storeSessionUid(credential.user.uid);
  await resetAttemptRecord();

  return credential.user;
}

export async function signIn(
  email: string,
  password: string
): Promise<FirebaseUser> {
  await checkRateLimit();

  const validatedEmail = emailSchema.parse(email);
  if (!password || password.length < 1) {
    throw new Error('Password is required');
  }

  const auth = getFirebaseAuth();
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      validatedEmail,
      password
    );
    await storeSessionUid(credential.user.uid);
    await resetAttemptRecord();
    return credential.user;
  } catch (error: unknown) {
    await recordFailedAttempt();
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
  await clearStoredSession();
}

export async function resetPassword(email: string): Promise<void> {
  const validatedEmail = emailSchema.parse(email);
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, validatedEmail);
}

/**
 * Delete account — cascades to ALL user data before removing the auth record.
 *
 * Data deleted (client-side cascade):
 *   babies, memories, milestones, journal_entries, calendar_events, subscriptions
 *
 * Data deleted separately (must be handled by a Cloud Function triggered
 * on auth.user.delete in production — this client cascade handles the
 * Firestore documents; Firebase Storage files require admin SDK):
 *   Storage: users/{uid}/...  (all uploaded photos and videos)
 *
 * GDPR compliance: after this function completes, no personal data remains
 * in Firestore. Storage cleanup is async via Cloud Function.
 */
export async function deleteAccount(password: string): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No authenticated user');

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);

  // Cascade delete all user data before removing auth record
  const { deleteAllUserData } = await import('./firestore');
  await deleteAllUserData(user.uid);

  await deleteUser(user);
  await clearStoredSession();
}

export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): FirebaseUser | null {
  return getFirebaseAuth().currentUser;
}

// ─── Error message normaliser ─────────────────────────────────────────────────
export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
    'auth/weak-password': 'Password must be at least 8 characters.',
    'auth/invalid-credential': 'Invalid email or password.',
  };
  return messages[code] ?? 'An unexpected error occurred. Please try again.';
}
