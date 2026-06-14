import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  type User,
  type UserCredential,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../config/firebase";
import { isValidEmail, checkPassword } from "../lib/validation";

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "AuthError";
  }
}

/** Map Firebase's terse error codes to gentle, parent-friendly copy. */
function friendly(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/weak-password":
      return "Please choose a stronger password.";
    default:
      return "Something went wrong. Please try again.";
  }
}

async function ensureUserProfile(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      plan: "seedling",
      createdAt: serverTimestamp(),
    });
  }
}

export async function signUp(
  email: string,
  password: string,
): Promise<UserCredential> {
  const trimmed = email.trim().toLowerCase();
  if (!isValidEmail(trimmed)) {
    throw new AuthError("auth/invalid-email", friendly("auth/invalid-email"));
  }
  const strength = checkPassword(password);
  if (!strength.valid) {
    throw new AuthError(
      "auth/weak-password",
      strength.reasons[0] ?? friendly("auth/weak-password"),
    );
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, trimmed, password);
    await ensureUserProfile(cred.user);
    // Verify ownership of the email; gates sensitive actions later.
    await sendEmailVerification(cred.user).catch(() => {});
    return cred;
  } catch (err) {
    const code = (err as { code?: string }).code ?? "unknown";
    throw new AuthError(code, friendly(code));
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<UserCredential> {
  const trimmed = email.trim().toLowerCase();
  if (!isValidEmail(trimmed)) {
    throw new AuthError("auth/invalid-email", friendly("auth/invalid-email"));
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, trimmed, password);
    await ensureUserProfile(cred.user);
    return cred;
  } catch (err) {
    const code = (err as { code?: string }).code ?? "unknown";
    throw new AuthError(code, friendly(code));
  }
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  if (!isValidEmail(trimmed)) {
    throw new AuthError("auth/invalid-email", friendly("auth/invalid-email"));
  }
  try {
    await sendPasswordResetEmail(auth, trimmed);
  } catch (err) {
    const code = (err as { code?: string }).code ?? "unknown";
    throw new AuthError(code, friendly(code));
  }
}

export async function resendVerification(): Promise<void> {
  if (auth.currentUser && !auth.currentUser.emailVerified) {
    await sendEmailVerification(auth.currentUser);
  }
}

export async function setDisplayName(name: string): Promise<void> {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
}
