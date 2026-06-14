# Flourish — Mobile App (iOS & Android)

A private, beautiful memory-keeping app for new parents, built with **React
Native + Expo (SDK 56)**, **Expo Router**, and **Firebase**. This is the native
implementation of the Flourish screen designs.

> Built for 3am. Beautiful at any hour.

## Screens

| # | Screen | Route |
|---|--------|-------|
| 1 | Welcome / Onboarding (sign up) | `app/(auth)/welcome.tsx` → `app/onboarding.tsx` |
| 2 | Home Dashboard | `app/(tabs)/index.tsx` |
| 3 | Age-adaptive Stickers | `app/stickers.tsx` |
| 4 | Memory Calendar | `app/calendar.tsx` |
| 5 | Plan / Upgrade | `app/plan.tsx` |
| 6 | Milestone Moment (celebration) | `app/milestone.tsx` |
| 7 | Memory Journal | `app/journal.tsx` + `app/journal-entry.tsx` |

Plus sign-in, password reset, capture (camera/library), scrapbook, and a
biometric **App Lock**.

## Tech stack

- **Expo SDK 56** / React Native 0.85 / React 19
- **Expo Router** (file-based, typed routes)
- **Firebase JS SDK 12** — Auth, Firestore, Storage, App Check
- **expo-secure-store** + **expo-local-authentication** for the privacy lock
- **@expo-google-fonts** — Cormorant Garamond, DM Sans, Lora

## Getting started

```bash
cd mobile
npm install

# 1. Configure Firebase
cp .env.example .env
# → fill in the EXPO_PUBLIC_FIREBASE_* values from the Firebase console
#   (Project settings → General → Your apps → Web app → SDK setup)

# 2. Run it
npm run start        # then press i (iOS), a (Android), or scan the QR in Expo Go
```

> Native modules (`expo-secure-store`, `expo-local-authentication`,
> `expo-image-picker`) require a **development build** or a production build for
> full functionality — they are not all available in the generic Expo Go app.
> Create one with `npx expo run:ios` / `npx expo run:android` or EAS Build.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the Metro dev server |
| `npm run ios` / `npm run android` | Launch on a simulator/emulator |
| `npm run typecheck` | `tsc --noEmit` |

## Security

See [`../SECURITY.md`](../SECURITY.md) for the full security model. Highlights:

- **Auth**: email/password with strong-password enforcement, email
  verification, and persistent sessions via AsyncStorage. Generic error
  messages avoid leaking whether an account exists.
- **Firestore/Storage Rules**: every record is private to its owner + an
  explicit family allow-list. Default-deny, shape-validated writes.
- **App Check**: attests requests genuinely come from the app.
- **Biometric App Lock**: optional Face ID / Touch ID / passcode gate, with the
  preference stored in the device keychain (SecureStore), not AsyncStorage.
- **No secrets in the client**: the Firebase web config is not secret; all real
  authorization is enforced server-side.
- **Input sanitization & size limits** on all user-generated content.

## Firebase config note (Metro)

Firebase JS SDK ≥ 12 ships React Native entry points that Metro's strict
`package.json#exports` resolution mishandles. `metro.config.js` disables that
and allows `.cjs`, and `tsconfig.json` maps `firebase/auth` types to the RN
build (so `getReactNativePersistence` is typed). This is the
[officially documented](https://docs.expo.dev/guides/using-firebase/#configure-metro)
workaround.
