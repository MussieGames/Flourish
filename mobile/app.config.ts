import type { ExpoConfig, ConfigContext } from "expo/config";

/**
 * Expo app configuration.
 *
 * Firebase configuration values are read from environment variables at build
 * time and surfaced to the app through `expo-constants` (`extra`). They are NOT
 * committed to the repository. See `.env.example` and `README.md`.
 *
 * Note: Firebase Web API keys are not secrets — they only identify the project.
 * All real protection comes from Firebase Auth, App Check, and the Firestore /
 * Storage security rules in the repo root.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Flourish",
  slug: "flourish",
  scheme: "flourish",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.goflourish.app",
    buildNumber: "1",
    infoPlist: {
      // Privacy-friendly, honest usage strings shown in the OS permission prompts.
      NSCameraUsageDescription:
        "Flourish uses your camera so you can capture photos and videos of your little one's moments.",
      NSPhotoLibraryUsageDescription:
        "Flourish needs access to your photos so you can add existing pictures to your baby's private scrapbook.",
      NSPhotoLibraryAddUsageDescription:
        "Flourish can save your favourite memories back to your photo library.",
      NSMicrophoneUsageDescription:
        "Flourish uses the microphone when you record videos of special moments.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.goflourish.app",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundColor: "#2C2420",
    },
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
    ],
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-font",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#2C2420",
        image: "./assets/splash-icon.png",
        imageWidth: 160,
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Flourish needs access to your photos so you can add existing pictures to your baby's private scrapbook.",
        cameraPermission:
          "Flourish uses your camera so you can capture photos and videos of your little one's moments.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
      messagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
    },
    appCheck: {
      // reCAPTCHA v3 site key used by App Check on the web build.
      recaptchaV3SiteKey:
        process.env.EXPO_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_V3 ?? "",
      // Optional debug token for local development against App Check.
      debugToken: process.env.EXPO_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN ?? "",
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? "",
    },
  },
});
