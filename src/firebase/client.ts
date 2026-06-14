import Constants from "expo-constants";
import { FirebaseApp, FirebaseOptions, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  signInAnonymously,
  User
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  Functions,
  getFunctions
} from "firebase/functions";
import {
  connectStorageEmulator,
  FirebaseStorage,
  getStorage
} from "firebase/storage";

type ExpoExtra = {
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
  firebaseMeasurementId?: string;
  functionsRegion?: string;
  useFirebaseEmulator?: boolean;
};

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

function getFirebaseOptions(): FirebaseOptions | null {
  const required = [
    extra.firebaseApiKey,
    extra.firebaseAuthDomain,
    extra.firebaseProjectId,
    extra.firebaseStorageBucket,
    extra.firebaseMessagingSenderId,
    extra.firebaseAppId
  ];

  if (required.some((value) => !value)) {
    return null;
  }

  return {
    apiKey: extra.firebaseApiKey,
    authDomain: extra.firebaseAuthDomain,
    projectId: extra.firebaseProjectId,
    storageBucket: extra.firebaseStorageBucket,
    messagingSenderId: extra.firebaseMessagingSenderId,
    appId: extra.firebaseAppId,
    measurementId: extra.firebaseMeasurementId
  };
}

let cachedServices: FirebaseServices | null = null;
let emulatorsConnected = false;

export function isFirebaseConfigured(): boolean {
  return getFirebaseOptions() !== null;
}

export function getFirebaseServices(): FirebaseServices {
  if (cachedServices) {
    return cachedServices;
  }

  const firebaseOptions = getFirebaseOptions();

  if (!firebaseOptions) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env and set EXPO_PUBLIC_FIREBASE_* values."
    );
  }

  const existingApps = getApps();
  const app: FirebaseApp = existingApps.length
    ? existingApps[0]!
    : initializeApp(firebaseOptions);

  // React Native does not need browser local persistence for this app. Keeping
  // Auth in memory avoids persisting anonymous credentials outside Firebase.
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: inMemoryPersistence });
  } catch {
    auth = getAuth(app);
  }

  const db = getFirestore(app);
  const storage = getStorage(app);
  const functions = getFunctions(app, extra.functionsRegion ?? "us-central1");

  if (extra.useFirebaseEmulator && !emulatorsConnected) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    emulatorsConnected = true;
  }

  const services = { app, auth, db, storage, functions };
  cachedServices = services;
  return services;
}

export async function ensureSignedIn(): Promise<User> {
  const { auth } = getFirebaseServices();
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const credential = await signInAnonymously(auth);
  return credential.user;
}
