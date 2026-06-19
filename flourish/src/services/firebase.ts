/**
 * Firebase initialisation.
 *
 * Required env vars (set in EAS Secrets or .env.local):
 *   EXPO_PUBLIC_FIREBASE_API_KEY
 *   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   EXPO_PUBLIC_FIREBASE_PROJECT_ID
 *   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *   EXPO_PUBLIC_FIREBASE_APP_ID
 *   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID  (optional)
 *   EXPO_PUBLIC_RECAPTCHA_SITE_KEY       (for App Check web)
 *   EXPO_PUBLIC_USE_FIREBASE_EMULATOR    (set "true" for local dev)
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  initializeAuth,
  // @ts-expect-error: getReactNativePersistence exists in the RN bundle but
  // is absent from the web TypeScript definitions. Metro resolves it correctly.
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from 'firebase/app-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const USE_EMULATOR = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  initializeAppCheckIfConfigured(_app);
  return _app;
}

/**
 * Firebase App Check — prevents API abuse from non-app clients.
 *
 * Provider selection:
 *  - Web:    ReCaptchaV3Provider  (requires EXPO_PUBLIC_RECAPTCHA_SITE_KEY)
 *  - Native: CustomProvider with a debug token in development, or
 *            DeviceCheck (iOS) / Play Integrity (Android) in production.
 *            Native attestation requires react-native-firebase/app-check
 *            and a custom dev build — not available in Expo Go.
 *
 * To enable in production:
 *  1. Register your app in Firebase Console → App Check
 *  2. For iOS: enable DeviceCheck
 *  3. For Android: enable Play Integrity
 *  4. Add EXPO_PUBLIC_RECAPTCHA_SITE_KEY for web builds
 *  5. Enforce App Check in Firebase Console (start in monitoring mode first)
 */
function initializeAppCheckIfConfigured(app: FirebaseApp): void {
  // Skip in emulator mode
  if (USE_EMULATOR) return;

  if (Platform.OS === 'web') {
    const siteKey = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } else {
    // Native: use debug provider in development, swap for DeviceCheck/PlayIntegrity in production
    // For production: replace CustomProvider with react-native-firebase/app-check provider
    const debugToken = process.env.EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN;
    if (!debugToken) return; // skip if not configured
    initializeAppCheck(app, {
      provider: new CustomProvider({
        getToken: async () => ({ token: debugToken, expireTimeMillis: Date.now() + 3_600_000 }),
      }),
      isTokenAutoRefreshEnabled: true,
    });
  }
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  const fbApp = getFirebaseApp();
  try {
    _auth = initializeAuth(fbApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    _auth = getAuth(fbApp);
  }
  return _auth;
}

export function getFirebaseFirestore(): Firestore {
  if (_db) return _db;
  const fbApp = getFirebaseApp();
  _db = getFirestore(fbApp);
  if (USE_EMULATOR) connectFirestoreEmulator(_db, 'localhost', 8080);
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (_storage) return _storage;
  const fbApp = getFirebaseApp();
  _storage = getStorage(fbApp);
  if (USE_EMULATOR) connectStorageEmulator(_storage, 'localhost', 9199);
  return _storage;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}
