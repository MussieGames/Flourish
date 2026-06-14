# Flourish — Mobile App

A private, beautiful memory keeper for new parents — built for iOS and Android
with **React Native (Expo)** and **Firebase**.

This app is the production implementation of the seven approved screen designs:
Welcome/Onboarding, Dashboard, Age-adaptive Stickers, Calendar, Plans,
Milestone Moment, and Memory Journal.

## Tech stack

- **Expo SDK 56** + **expo-router** (file-based navigation, typed routes)
- **TypeScript** (strict)
- **Firebase JS SDK** — Auth, Firestore, Storage, App Check
- **Reanimated / Gesture Handler** for animation & gestures
- **expo-image-picker**, **expo-secure-store**, **expo-haptics**
- Google Fonts: Cormorant Garamond, DM Sans, Lora

## Getting started

```bash
cd mobile
npm install
cp .env.example .env     # then fill in your Firebase project values
npm run start            # open in Expo Go or a dev build
```

> The app uses a few native modules (image picker, reanimated, secure store,
> datetime picker). They work in Expo Go for development. For App Check and
> store builds, create a **development build** (`npx expo run:ios` /
> `npx expo run:android`) or use EAS.

### Scripts

| Command | Description |
| --- | --- |
| `npm run start` | Start the Expo dev server |
| `npm run ios` / `npm run android` | Open on a simulator/device |
| `npm run typecheck` | `tsc --noEmit` |

## Project structure

```
mobile/
├─ app/                     # expo-router routes
│  ├─ _layout.tsx           # providers, fonts, auth gating
│  ├─ (auth)/               # welcome (sign-up), sign-in
│  ├─ (onboarding)/         # create first child
│  ├─ (tabs)/               # Home, Calendar, Firsts, Journal, Profile
│  ├─ capture.tsx           # photo/video capture flow (modal)
│  ├─ stickers.tsx          # age-adaptive stickers (modal)
│  ├─ plan.tsx              # plans & pricing (modal)
│  └─ milestone.tsx         # milestone celebration (full-screen)
└─ src/
   ├─ components/           # UI primitives + feature components
   ├─ config/               # env + Firebase initialisation
   ├─ context/              # Auth & active-child providers
   ├─ data/                 # milestone + sticker static data
   ├─ hooks/                # data subscriptions
   ├─ lib/                  # validation, dates, haptics
   ├─ services/             # auth + Firestore + Storage access
   └─ theme/                # design tokens & fonts
```

## Configuration

All Firebase config is read from environment variables (prefixed
`EXPO_PUBLIC_…`) via `app.config.ts` → `expo-constants`. Copy `.env.example` to
`.env` and fill in the values from the Firebase console.

> **Is the Firebase API key a secret?** No. Web/mobile Firebase API keys are
> project identifiers, safe to embed in a client. Your data is protected by
> Firebase Auth, App Check, and the Firestore/Storage **security rules** in the
> repository root — not by hiding the key.

## Security highlights

See [`../SECURITY.md`](../SECURITY.md) for the full overview. In short:

- Email/password auth with a **strong password policy** and email verification.
- Every screen of data is **scoped to the authenticated user** and the child's
  `members` list — enforced by Firestore rules, not just the client.
- All user input is **validated & sanitised** client-side _and_ re-validated by
  the security rules (length caps, allowed values, date formats).
- Media uploads are **size- and type-limited**; reads are restricted to family
  members via a custom auth claim.
- Plan/billing can never be changed by the client.
- Secrets stay in `.env` (git-ignored) and Google Secret Manager.
