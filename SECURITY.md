# Flourish — Security Model

Flourish stores a family's most precious and private data: photos, videos, and
journal entries about their children. Security and privacy are therefore
treated as first-class product features, not an afterthought. This document
describes the controls implemented across the mobile app, Firestore/Storage
rules, and Cloud Functions.

## 1. Authentication

- **Firebase Authentication** (email/password).
- **Strong passwords** enforced client-side (`src/lib/validation.ts`): minimum
  10 characters with upper/lower/number/symbol, surfaced with a live strength
  meter.
- **Email verification** is requested on sign-up; the app shows a persistent,
  non-blocking prompt until the address is verified.
- **Account-enumeration resistance**: sign-in and password-reset flows return
  identical, generic messaging regardless of whether the email exists
  (`src/lib/errors.ts`, `forgot-password.tsx`).
- **Session persistence** uses the officially supported AsyncStorage
  persistence for the Firebase JS SDK on React Native. Firebase ID tokens are
  short-lived and automatically refreshed/rotated.

## 2. Authorization — Firestore Security Rules

See [`firestore.rules`](./firestore.rules).

- **Default deny.** Anything not explicitly allowed is rejected.
- **Private by default.** A baby document carries an `ownerId` and an explicit
  `memberIds` allow-list. Reads require `request.auth.uid in memberIds`. There
  are no public reads and no cross-account access.
- **Ownership is immutable.** Updates cannot reassign `ownerId`, and the owner
  must always remain a member.
- **Shape validation.** Every `create`/`update` validates field types, allowed
  enum values (`plan`, `kind`, `status`, event `type`), and length caps so a
  tampered client cannot inject unexpected or oversized fields.
- **Authorship.** Memories/journal entries record the `authorId`; only the
  author or the baby's owner may edit or delete them.
- **Waitlist** collection is fully locked to clients — only the privileged
  Cloud Function may write to it.

## 3. Authorization — Cloud Storage Rules

See [`storage.rules`](./storage.rules).

- Media lives at an owner-scoped, unguessable path
  `babies/{babyId}/memories/{uid}/{file}`.
- **Writes** are restricted to the authenticated uploader and validated for
  **content type** (image/video only) and **size** (< 15 MB) — mirroring the
  client checks in `src/firebase/storage.ts`.
- **Reads** require authentication plus knowledge of the full unguessable path.
  Storage Rules cannot query Firestore for membership; for stricter per-member
  enforcement, serve media via signed URLs from a Cloud Function or adopt a
  custom-claims membership model. (Documented trade-off.)

## 4. App Check

`initAppCheck()` (`src/firebase/config.ts`) wires up Firebase App Check to
attest that traffic genuinely originates from the app, mitigating abuse and
bots. The JS SDK ships a web reCAPTCHA provider; production native builds should
adopt `@react-native-firebase/app-check` for Play Integrity (Android) / App
Attest (iOS).

## 5. Device-level privacy — App Lock

An optional **biometric App Lock** (`src/lib/appLock.ts`,
`src/context/AppLockContext.tsx`) requires Face ID / Touch ID / device passcode
to open the app, and re-locks after the app has been backgrounded for 30s. The
enabled flag is stored in the OS keychain/keystore via **expo-secure-store**
(`WHEN_UNLOCKED_THIS_DEVICE_ONLY`), not in AsyncStorage.

## 6. Input handling

All free-text input is sanitized (`sanitizeText`/`sanitizeName`): control
characters stripped, whitespace collapsed, and hard length limits applied before
data is sent to Firestore. The same limits are enforced again by Security Rules.

## 7. Secrets management

- The **Firebase web config** (`apiKey`, etc.) is *not secret* — it only
  identifies the project. It is provided via `EXPO_PUBLIC_*` env vars and is
  safe to ship in the client. Authorization is enforced entirely server-side.
- **No service-account keys or private API secrets** are ever placed in the
  client bundle.
- The **Cloud Function** (`functions/index.js`) now reads its reCAPTCHA
  Enterprise **API key from environment variables** instead of hard-coding it
  (`functions/.env`, git-ignored). Input is validated, CORS is restricted to the
  Flourish origins, only `POST` is accepted, and writes are idempotent.

  > ⚠️ The reCAPTCHA API key was previously committed in source. It exists in
  > git history and should be **rotated** in the Google Cloud console.

## 8. Transport & platform

- All Firebase traffic is HTTPS/TLS by default.
- `usesNonExemptEncryption: false` is declared for iOS (standard TLS only).
- Android blocks broad media permissions it does not need; the app uses the
  scoped photo picker via `expo-image-picker`.

## Reporting

To report a vulnerability, contact the Flourish team privately rather than
opening a public issue.
