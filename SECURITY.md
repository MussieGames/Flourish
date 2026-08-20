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
- **Authenticator-app MFA (TOTP)** is optional and enrolled from Profile.
  Sign-in then asks for a 6-digit code from Google Authenticator, 1Password, or
  Authy. **SMS 2FA is not used and will not be added.** Enable TOTP in the
  Firebase console (Identity Platform → Multi-factor authentication → TOTP)
  before enrolment will succeed.
- **Account-enumeration resistance**: sign-in and password-reset flows return
  identical, generic messaging regardless of whether the email exists
  (`src/lib/errors.ts`, `forgot-password.tsx`).
- **Session persistence** uses the officially supported AsyncStorage
  persistence for the Firebase JS SDK on React Native. Firebase ID tokens are
  short-lived and automatically refreshed/rotated.

## 2. Authorization — Firestore Security Rules

The app runs in its **own Firebase project(s)** (`flourish-app` /
`flourish-app-dev`), separate from the marketing/CTA project. App rules live in
[`mobile/firebase/firestore.rules`](./mobile/firebase/firestore.rules); the CTA
project's waitlist rules live separately in [`firestore.rules`](./firestore.rules).

- **Default deny.** Anything not explicitly allowed is rejected.
- **Private by default.** A baby document carries an `ownerId` and an explicit
  `memberIds` allow-list. Reads require `request.auth.uid in memberIds`. There
  are no public reads and no cross-account access.
- **Journal is owner-only.** Invited family cannot read, create, update, or
  delete journal entries. The Journal tab and write prompts are hidden for
  view-only members.
- **View-only sharing.** Confirmed members may read memories, firsts, and
  calendar events. Only the owner may write them. Capture and “Caught” actions
  are hidden for members.
- **Invites, not arbitrary `memberIds`.** `memberIds` may grow only by the
  owner confirming a claimed, unexpired invite for the exact invited email
  (`invites/{id}`). Members can be revoked in one tap. Invites expire after 7
  days. Creating an invite requires a verified owner on Bloom or Heirloom.
- **Plan is server-owned.** New user docs are created as `seedling`. Clients
  cannot change `plan`. Billing (App Store / Play) will write the plan from a
  trusted function later; until then, set Bloom/Heirloom in the Firebase
  console if you need to test sharing.
- **Ownership is immutable.** Updates cannot reassign `ownerId`, and the owner
  must always remain a member.
- **Shape validation.** Every `create`/`update` validates field types, allowed
  enum values (`plan`, `kind`, `status`, event `type`), and length caps so a
  tampered client cannot inject unexpected or oversized fields.
- **Authorship.** Memories/journal entries record the `authorId`.
- **Project isolation.** Because the app has its own Firebase project, a
  misconfiguration or abuse on the public marketing/CTA project can never reach
  family data, and vice-versa. (The CTA **waitlist** collection is locked to
  clients — only the privileged Cloud Function may write to it.)

## 3. Authorization — Cloud Storage Rules

See [`mobile/firebase/storage.rules`](./mobile/firebase/storage.rules).

- Media lives at an owner-scoped, unguessable path
  `babies/{babyId}/memories/{uid}/{file}`.
- **Writes** are restricted to the authenticated uploader and validated for
  **content type** (image/video only) and **size** (< 15 MB) — mirroring the
  client checks in `src/firebase/storage.ts`.
- **Reads** require authentication plus knowledge of the full unguessable path.
  Storage Rules cannot query Firestore for membership; for stricter per-member
  enforcement, serve media via signed URLs from a Cloud Function or adopt a
  custom-claims membership model. Signed download URLs are the next hardening
  step after this work. (Documented trade-off.)

## 4. App Check

`initAppCheck()` (`src/firebase/config.ts`) wires up Firebase App Check to
attest that traffic genuinely originates from the app, mitigating abuse and
bots.

- **Web:** reCAPTCHA v3 via `EXPO_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_KEY`.
- **Native debug:** a console-registered debug token via
  `EXPO_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN` (CustomProvider). This lets
  enforcement be turned on without a native rebuild.
- **Native production:** Play Integrity (Android) / App Attest (iOS) needs
  `@react-native-firebase/app-check` and a development build. That is the next
  App Check step; it is not wired yet because it would break Expo Go.

## 5. Device-level privacy — App Lock

An optional **biometric App Lock** (`src/lib/appLock.ts`,
`src/context/AppLockContext.tsx`) requires Face ID / Touch ID / device passcode
to open the app, and re-locks after the app has been backgrounded for 30s. The
enabled flag is stored in the OS keychain/keystore via **expo-secure-store**
(`WHEN_UNLOCKED_THIS_DEVICE_ONLY`), not in AsyncStorage. Sharing invites,
password reset, and authenticator enrolment also confirm identity with App Lock
when it is enabled.

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
- The **CTA Cloud Function** (`functions/index.js`, part of the marketing build)
  verifies signups with the **reCAPTCHA Enterprise client library**
  (`@google-cloud/recaptcha-enterprise`), which authenticates via the function's
  runtime service account (Application Default Credentials) — so **no API key is
  committed to source**. Only the *public* reCAPTCHA site key appears in code,
  which is expected. Email confirmations are sent server-side via the Firestore
  "Trigger Email" flow (`mail` / `auto_reply` collections, locked to clients).

## 8. Transport & platform

- All Firebase traffic is HTTPS/TLS by default.
- `usesNonExemptEncryption: false` is declared for iOS (standard TLS only).
- Android blocks broad media permissions it does not need; the app uses the
  scoped photo picker via `expo-image-picker`.

## Deploying app rules

From `mobile/firebase/`:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

Also enable **Identity Platform TOTP** in the Firebase console before
authenticator enrolment will succeed.

## Reporting

To report a vulnerability, contact the Flourish team privately rather than
opening a public issue.
