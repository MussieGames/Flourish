# Security Overview — Flourish

Flourish stores deeply personal data: photos, videos, and journals about
families' children. Security and privacy are treated as core product features.
This document explains the controls in this repository.

## 1. Authentication

- Email/password authentication via **Firebase Auth**.
- **Strong password policy** enforced in `mobile/src/lib/validation.ts`
  (length + character variety + common-password rejection). Enable the matching
  server-side password policy in the Firebase console for defence-in-depth.
- **Email verification** is sent on sign-up and surfaced in the app until
  completed.
- Auth sessions persist via `AsyncStorage` (native) using
  `initializeAuth` + `getReactNativePersistence`. Sensitive flags can use
  `expo-secure-store` (Keychain / Keystore).
- Password reset uses Firebase's email flow and the UI **does not reveal whether
  an email exists** (no account enumeration).

## 2. Authorization (data isolation)

All access control is enforced **server-side** by security rules — the client is
never trusted.

- **`firestore.rules`**
  - Users can only read/write their own `users/{uid}` document.
  - A child has an `ownerId` and a `members` array. Only members can access that
    child and its subcollections (`memories`, `journal`, `milestones`,
    `events`).
  - Only the **owner** can change the `members` list (invite/remove family).
  - `ownerId` and `createdAt` are immutable.
  - **Billing is tamper-proof:** `users.plan` cannot be changed by the client;
    only the Admin SDK (verified purchases / Cloud Functions) may change it.
  - A global default-deny rule rejects everything not explicitly allowed.
- **`storage.rules`**
  - Uploads are restricted to the authenticated uploader's own folder.
  - Reads are limited to family members via the `childIds` custom auth claim,
    maintained by the `syncChildClaims` Cloud Function.

## 3. Input validation & sanitisation

- Client-side validation/sanitisation in `mobile/src/lib/validation.ts`
  (trimming, control-character stripping, length caps, tag de-duplication).
- The **same limits are re-enforced in `firestore.rules`** (string lengths,
  allowed enum values, `YYYY-MM-DD` date format, list sizes) so a modified
  client cannot bypass them.
- Uploads validate **content type** (`image/*` or `video/*`) and a **15 MB size
  cap** both in the app and in `storage.rules`.

## 4. Abuse protection — App Check

- **App Check** is initialised for the web build (reCAPTCHA v3) in
  `mobile/src/config/firebase.ts`.
- For native store builds, enable **Play Integrity** (Android) and **App
  Attest** (iOS) providers in the Firebase console and turn on **enforcement**
  for Firestore, Storage, and Functions. (App Check is enforced at the API
  layer, so it is configured in the console rather than in the rules files.)
- The web waitlist endpoint additionally verifies a **reCAPTCHA Enterprise**
  token server-side before any write.

## 5. Secrets management

- Firebase Web API keys are project identifiers (not secrets) and are injected
  via `EXPO_PUBLIC_*` env vars; `.env` is git-ignored.
- True secrets (e.g. the reCAPTCHA Enterprise API key) live in **Google Secret
  Manager** and are referenced with `defineSecret` in Cloud Functions.
- `google-services.json` / `GoogleService-Info.plist` are git-ignored.

> ⚠️ **Action required:** an earlier commit of `functions/index.js` contained a
> hard-coded reCAPTCHA Enterprise API key. It exists in git history and **must be
> rotated** in Google Cloud, then re-added via
> `firebase functions:secrets:set RECAPTCHA_API_KEY`.

## 6. Transport & platform

- All Firebase traffic is HTTPS/TLS by default.
- iOS permission usage strings and Android permissions are declared explicitly
  and honestly in `app.config.ts`.
- CORS for the waitlist function is restricted to the Flourish web origins.

## 7. Privacy commitments (reflected in the UI)

- No ads, no data selling/sharing.
- Memories are visible only to invited family members.
- Account deletion / data export should be handled by a server-side GDPR flow
  (the rules intentionally forbid client-side deletion of the `users` doc).

## Reporting

Found a vulnerability? Please email **security@goflourish.com.au** with details.
Do not open a public issue.
