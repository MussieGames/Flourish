const appName = "Flourish";

const firebaseExtra = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

module.exports = {
  expo: {
    name: appName,
    slug: "flourish",
    scheme: "flourish",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.goflourish.app",
      supportsTablet: false,
      usesAppleSignIn: false,
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "Flourish needs photo library access only when you choose a memory to add to your private scrapbook.",
        NSFaceIDUsageDescription:
          "Flourish can use Face ID to protect your private family memories on this device.",
      },
    },
    android: {
      package: "com.goflourish.app",
      adaptiveIcon: {
        backgroundColor: "#FBF7F2",
      },
      permissions: ["READ_MEDIA_IMAGES", "READ_MEDIA_VIDEO"],
      blockedPermissions: [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.RECORD_AUDIO",
      ],
    },
    web: {
      bundler: "metro",
    },
    plugins: [
      "expo-font",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#FBF7F2",
          imageWidth: 160,
        },
      ],
      [
        "expo-secure-store",
        {
          faceIDPermission:
            "Allow Flourish to use Face ID to protect your private family memories.",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Flourish needs photo library access only when you choose a memory to add to your private scrapbook.",
        },
      ],
    ],
    extra: {
      firebase: firebaseExtra,
      privacyUrl: "https://www.goflourish.com.au/privacy",
      supportEmail: "hello@goflourish.com.au",
    },
  },
};
