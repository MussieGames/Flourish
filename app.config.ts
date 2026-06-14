import type { ExpoConfig } from "expo/config";

const bundleIdentifier = "com.goflourish.app";

const config: ExpoConfig = {
  name: "Flourish",
  slug: "flourish",
  scheme: "flourish",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier,
    infoPlist: {
      NSCameraUsageDescription:
        "Flourish uses your camera only when you choose to capture a private family memory.",
      NSPhotoLibraryUsageDescription:
        "Flourish lets you choose photos and videos to save into your child's private scrapbook.",
      NSFaceIDUsageDescription:
        "Flourish can use Face ID to lock private memories on this device."
    }
  },
  android: {
    package: bundleIdentifier,
    permissions: [
      "android.permission.CAMERA",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_MEDIA_VIDEO"
    ]
  },
  plugins: [
    "expo-font",
    "expo-secure-store",
    [
      "expo-status-bar",
      {
        style: "dark"
      }
    ]
  ],
  extra: {
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    firebaseMeasurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    functionsRegion: process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? "us-central1",
    useFirebaseEmulator:
      process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === "true"
  }
};

export default config;
