import Constants from "expo-constants";

type FirebaseEnv = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

type AppCheckEnv = {
  recaptchaV3SiteKey: string;
  debugToken: string;
};

type Extra = {
  firebase?: Partial<FirebaseEnv>;
  appCheck?: Partial<AppCheckEnv>;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

function requireKeys<T extends Record<string, string>>(
  obj: Partial<T>,
  keys: (keyof T)[],
  scope: string,
): T {
  const missing = keys.filter((k) => !obj[k]);
  if (missing.length > 0) {
    // Fail loudly during development instead of producing confusing runtime
    // errors deep inside the Firebase SDK.
    const list = missing.join(", ");
    console.warn(
      `[Flourish] Missing ${scope} config: ${list}. ` +
        `Copy mobile/.env.example to mobile/.env and fill in the values.`,
    );
  }
  return obj as T;
}

export const firebaseEnv = requireKeys<FirebaseEnv>(
  extra.firebase ?? {},
  ["apiKey", "authDomain", "projectId", "storageBucket", "appId"],
  "Firebase",
);

export const appCheckEnv: AppCheckEnv = {
  recaptchaV3SiteKey: extra.appCheck?.recaptchaV3SiteKey ?? "",
  debugToken: extra.appCheck?.debugToken ?? "",
};

export const isFirebaseConfigured = Boolean(
  firebaseEnv.apiKey && firebaseEnv.projectId && firebaseEnv.appId,
);
