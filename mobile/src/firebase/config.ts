import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';

type FirebaseEnv = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

/**
 * Reads the Firebase web config from EXPO_PUBLIC_* env vars. These values
 * identify the project and are safe to ship in the client bundle — real
 * security is enforced by Security Rules + App Check, never by hiding the key.
 */
function readFirebaseEnv(): FirebaseEnv {
  const env: FirebaseEnv = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const missing = (Object.entries(env) as [keyof FirebaseEnv, string][])
    .filter(([key, value]) => key !== 'measurementId' && !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    // Surface a clear, actionable error rather than a cryptic Firebase crash.
    console.warn(
      `[Flourish] Missing Firebase config: ${missing.join(
        ', ',
      )}. Copy .env.example to .env and fill in the values from the Firebase console.`,
    );
  }

  return env;
}

const firebaseConfig = readFirebaseEnv();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Auth with persistent sessions. Firebase manages its own (frequently
 * rotated, short-lived) ID tokens; AsyncStorage is the officially supported
 * persistence layer for the JS SDK on React Native. We use SecureStore for the
 * app-level privacy lock (see lib/appLock) rather than for raw auth tokens.
 */
function createAuth(): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // initializeAuth throws if called twice (e.g. fast refresh); reuse instance.
    const { getAuth } = require('firebase/auth') as typeof import('firebase/auth');
    return getAuth(app);
  }
}

export const auth: Auth = createAuth();
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export { app };

/**
 * Initialises Firebase App Check. App Check attests that traffic genuinely
 * comes from your app, blocking abuse/bots before requests reach Firestore,
 * Storage, or Functions.
 *
 * The JS SDK ships a web reCAPTCHA provider. For fully native attestation
 * (Play Integrity / App Attest) a production app should migrate to the
 * `@react-native-firebase/app-check` native module. This guarded init keeps
 * web working and is a no-op (with a note) on native.
 */
export async function initAppCheck(): Promise<void> {
  if (Platform.OS !== 'web') {
    return;
  }
  const recaptchaKey = process.env.EXPO_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_KEY;
  if (!recaptchaKey) {
    return;
  }
  try {
    const { initializeAppCheck, ReCaptchaV3Provider } = await import(
      'firebase/app-check'
    );
    if (process.env.EXPO_PUBLIC_FIREBASE_APPCHECK_DEBUG === '1') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    console.warn('[Flourish] App Check init skipped:', error);
  }
}
