# Flourish — Baby Memory App

A beautiful, secure React Native (Expo) app for preserving precious baby memories. Built for iOS and Android.

## Features

- **Welcome / Onboarding** — warm first-open experience, single-question entry
- **Dashboard** — real-time milestones, quick photo/video capture, memory grid
- **Age-Adaptive Stickers** — automatically surfaces stickers appropriate for the child's age era (Baby, Little One, Growing Up, Teen)
- **Memory Calendar** — month-at-a-glance with colour-coded memory/milestone/appointment dots
- **Plan Page** — transparent pricing (Seedling / Bloom / Heirloom) with no dark patterns
- **Milestone Moment** — full-screen celebration screen with confetti when a "first" is captured
- **Memory Journal** — handwritten-feel private journal entries with mood tags

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 56) |
| Navigation | Expo Router 56 (file-based) |
| Backend | Firebase (Auth, Firestore, Storage) |
| Fonts | Cormorant Garamond, DM Sans, Lora |
| State | React hooks + Firebase real-time listeners |
| Validation | Zod |
| Secure storage | expo-secure-store |

## Security Architecture

### Authentication
- Firebase Auth with email/password
- Auth tokens persisted in `expo-secure-store` (hardware-backed, never plain AsyncStorage)
- Client-side rate limiting: 5 failed attempts → 15-minute lockout (on top of Firebase's server-side limits)
- Input validation with Zod before any Firebase call
- Password requirements enforced: min 8 chars, uppercase, number

### Firestore Rules (`firebase/firestore.rules`)
- Every document is scoped to `parentId == request.auth.uid` — no cross-user reads
- Required fields validated on every write
- Field type checking on every write
- `noNewFields()` guard on updates prevents injection of extra data
- Subscriptions collection is read-only for clients (write-only via Cloud Functions admin SDK)
- Catch-all deny rule for any path not explicitly allowed

### Storage Rules (`firebase/storage.rules`)
- Files stored under `/users/{uid}/...` — path enforced by rules
- Content-type validation: only `image/*` and `video/*` accepted
- Size caps per file type (5MB photos, 50MB videos)
- Memory files are immutable after upload
- No public reads — all access requires authentication

### Data Sanitisation
- All user text input sanitised via `src/utils/sanitize.ts` before writes
- HTML tags stripped, control characters removed, hard length caps
- EXIF data stripped from image uploads (privacy)

### Additional Hardening
- No Firebase credentials hardcoded — all via `EXPO_PUBLIC_*` env vars
- Firebase emulator support for local dev without touching production
- Firestore compound indexes defined (`firebase/firestore.indexes.json`)

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Firebase project with Auth, Firestore, and Storage enabled

### Setup

```bash
# Install dependencies
cd flourish
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Start development server
npx expo start
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Enable **Firestore** → Start in production mode
4. Enable **Storage** → Start in production mode
5. Deploy security rules:

```bash
cd firebase
firebase deploy --only firestore:rules,storage
firebase deploy --only firestore:indexes
```

### Running on Device

```bash
# iOS (requires macOS + Xcode)
npx expo run:ios

# Android (requires Android Studio)
npx expo run:android

# Expo Go (quick preview, some native features limited)
npx expo start
```

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Environment Variables (EAS Secrets)
For production builds, set secrets in EAS:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your-key"
# Repeat for all EXPO_PUBLIC_FIREBASE_* variables
```

## Project Structure

```
flourish/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx         # Root layout (fonts, navigation)
│   ├── index.tsx           # Auth guard / redirect
│   ├── (auth)/             # Auth screens (welcome, signin, signup)
│   ├── (tabs)/             # Main app tabs (home, capture, scrapbook, firsts, profile)
│   ├── milestone/[id].tsx  # Milestone celebration modal
│   └── journal/            # Journal screens (list + new entry)
├── src/
│   ├── components/         # Reusable UI components
│   ├── constants/          # Theme, sticker data, milestone templates
│   ├── hooks/              # React hooks (useAuth, useBaby)
│   ├── services/           # Firebase wrappers (auth, firestore, storage)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Sanitisation, age calculation
├── firebase/               # Firebase rules + indexes
│   ├── firestore.rules     # Firestore security rules
│   ├── storage.rules       # Storage security rules
│   ├── firebase.json       # Firebase project config
│   └── firestore.indexes.json
├── assets/                 # App icons, splash screen
├── app.json                # Expo configuration
├── .env.example            # Environment variable template
└── README.md
```

## Privacy

Flourish is built with privacy as a core value:
- Zero ads, zero data selling
- All data encrypted in transit (TLS) and at rest (Firebase default encryption)
- User data is never shared with third parties
- Users can delete their account and all data at any time
