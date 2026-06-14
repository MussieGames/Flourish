import Constants from "expo-constants";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";

const firebaseConfigSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  storageBucket: z.string().min(1),
  messagingSenderId: z.string().min(1),
  appId: z.string().min(1),
  measurementId: z.string().optional(),
});

type FirebaseConfig = z.infer<typeof firebaseConfigSchema>;

type FirebaseClient = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  projectId: string;
};

const rawConfig = Constants.expoConfig?.extra?.firebase;
const parsedConfig = firebaseConfigSchema.safeParse(rawConfig);

let cachedClient: FirebaseClient | null = null;

function createClient(config: FirebaseConfig): FirebaseClient {
  const app = getApps().length ? getApp() : initializeApp(config);

  let auth: Auth;
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }

  return {
    app,
    auth,
    db: getFirestore(app),
    storage: getStorage(app),
    projectId: config.projectId,
  };
}

export function getFirebaseClient(): FirebaseClient | null {
  if (!parsedConfig.success) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(parsedConfig.data);
  }

  return cachedClient;
}

export function requireFirebaseClient(): FirebaseClient {
  const client = getFirebaseClient();
  if (!client) {
    throw new Error(
      "Firebase is not configured. Set the EXPO_PUBLIC_FIREBASE_* values from .env.example.",
    );
  }
  return client;
}

export const firebaseConfigStatus = {
  configured: parsedConfig.success,
  missingKeys: parsedConfig.success
    ? []
    : parsedConfig.error.issues.map((issue) => issue.path.join(".")),
};
