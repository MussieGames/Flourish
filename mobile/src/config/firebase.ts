import { Platform } from "react-native";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  // `getReactNativePersistence` ships in the react-native entry point of
  // firebase/auth. Depending on how TS resolves conditional exports the type
  // may not be visible, so we import it defensively below.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type Auth,
} from "firebase/auth";
// @ts-ignore — provided by the react-native build of `firebase/auth`.
import { getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";

import { firebaseEnv, appCheckEnv, isFirebaseConfigured } from "./env";

const firebaseConfig = {
  apiKey: firebaseEnv.apiKey,
  authDomain: firebaseEnv.authDomain,
  projectId: firebaseEnv.projectId,
  storageBucket: firebaseEnv.storageBucket,
  messagingSenderId: firebaseEnv.messagingSenderId,
  appId: firebaseEnv.appId,
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

/**
 * Auth must use a persistent store so users stay signed in across launches.
 * On native we wire AsyncStorage; on web the SDK uses its own default.
 */
let auth: Auth;
try {
  if (Platform.OS === "web") {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  }
} catch {
  // initializeAuth throws if called twice (e.g. Fast Refresh). Fall back.
  auth = getAuth(app);
}

const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

/**
 * App Check protects the backend from abuse (bots / scraping / quota theft).
 * The JS SDK supports the reCAPTCHA provider on web. Native builds should use
 * Play Integrity (Android) / App Attest (iOS) — see README "Security".
 */
let appCheck: AppCheck | null = null;
if (isFirebaseConfigured && Platform.OS === "web" && appCheckEnv.recaptchaV3SiteKey) {
  try {
    if (__DEV__ && appCheckEnv.debugToken) {
      // Allows the web dev build to obtain valid App Check tokens.
      (globalThis as unknown as Record<string, unknown>)[
        "FIREBASE_APPCHECK_DEBUG_TOKEN"
      ] = appCheckEnv.debugToken;
    }
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckEnv.recaptchaV3SiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn("[Flourish] App Check init failed", err);
  }
}

export { app, auth, db, storage, appCheck, isFirebaseConfigured };
