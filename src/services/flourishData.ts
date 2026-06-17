import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { z } from "zod";

import { requireFirebaseClient } from "@/config/firebase";
import { ChildProfile, MemoryInput } from "@/types";

const legalPolicyVersion = "2026-06-17";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128, "Use fewer than 128 characters.")
  .regex(/[a-z]/, "Add a lowercase letter.")
  .regex(/[A-Z]/, "Add an uppercase letter.")
  .regex(/[0-9]/, "Add a number.");

const childSchema = z.object({
  name: z.string().trim().min(1).max(80),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const memorySchema = z.object({
  childId: z.string().min(8).max(128),
  kind: z.enum(["photo", "video", "journal", "milestone"]),
  title: z.string().trim().min(1).max(120),
  caption: z.string().trim().max(2000).optional(),
  mediaPath: z.string().max(512).optional(),
  occurredAtIso: z.string().datetime(),
  tags: z.array(z.string().trim().min(1).max(32)).max(12).optional(),
  stickers: z.array(z.string().trim().min(1).max(32)).max(30).optional(),
});

export async function registerWithEmail(params: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<User> {
  const { auth, db } = requireFirebaseClient();
  const email = emailSchema.parse(params.email);
  const password = passwordSchema.parse(params.password);

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (params.displayName) {
    await updateProfile(credential.user, {
      displayName: params.displayName.trim().slice(0, 80),
    });
  }

  await setDoc(doc(db, "users", credential.user.uid), {
    uid: credential.user.uid,
    email,
    displayName: params.displayName?.trim().slice(0, 80) ?? null,
    acceptedPrivacyVersion: legalPolicyVersion,
    acceptedTermsVersion: legalPolicyVersion,
    acceptedLegalAt: serverTimestamp(),
    marketingOptIn: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return credential.user;
}

export async function loginWithEmail(emailInput: string, passwordInput: string): Promise<User> {
  const { auth } = requireFirebaseClient();
  const email = emailSchema.parse(emailInput);
  const password = z.string().min(1).parse(passwordInput);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function requestPasswordReset(emailInput: string): Promise<void> {
  const { auth } = requireFirebaseClient();
  await sendPasswordResetEmail(auth, emailSchema.parse(emailInput));
}

export async function logout(): Promise<void> {
  const { auth } = requireFirebaseClient();
  await signOut(auth);
}

export async function createChildProfile(input: {
  name: string;
  birthDate?: string;
}): Promise<ChildProfile> {
  const { auth, db } = requireFirebaseClient();
  if (!auth.currentUser) {
    throw new Error("You need to be signed in to create a child profile.");
  }

  const data = childSchema.parse(input);
  const childRef = doc(collection(db, "children"));

  const child: ChildProfile = {
    id: childRef.id,
    ownerId: auth.currentUser.uid,
    name: data.name,
    ...(data.birthDate ? { birthDate: data.birthDate } : {}),
  };

  await setDoc(childRef, {
    ...child,
    members: {
      [auth.currentUser.uid]: "owner",
    },
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return child;
}

export async function saveMemory(input: MemoryInput): Promise<string> {
  const { auth, db } = requireFirebaseClient();
  if (!auth.currentUser) {
    throw new Error("You need to be signed in to save a memory.");
  }

  const data = memorySchema.parse(input);
  const memoryRef = await addDoc(collection(db, "children", data.childId, "memories"), {
    ...data,
    ownerId: auth.currentUser.uid,
    visibility: "family",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "children", data.childId), {
    updatedAt: serverTimestamp(),
  });

  return memoryRef.id;
}

export async function uploadMemoryAsset(params: {
  childId: string;
  asset: ImagePicker.ImagePickerAsset;
}): Promise<{ storagePath: string; downloadUrl: string }> {
  const { auth, storage } = requireFirebaseClient();
  if (!auth.currentUser) {
    throw new Error("You need to be signed in to upload a memory.");
  }

  if (!params.asset.mimeType?.startsWith("image/") && !params.asset.mimeType?.startsWith("video/")) {
    throw new Error("Only image and video memories are supported.");
  }

  const response = await fetch(params.asset.uri);
  const blob = await response.blob();
  const extension = params.asset.fileName?.split(".").pop()?.toLowerCase() ?? "upload";
  const randomId = await Crypto.randomUUID();
  const storagePath = `children/${params.childId}/users/${auth.currentUser.uid}/${randomId}.${extension}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, blob, {
    contentType: params.asset.mimeType,
    customMetadata: {
      ownerId: auth.currentUser.uid,
      childId: params.childId,
    },
  });

  return {
    storagePath,
    downloadUrl: await getDownloadURL(storageRef),
  };
}
