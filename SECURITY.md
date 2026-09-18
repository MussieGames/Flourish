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

The app runs in its **own Firebase project(s)** (`flourish-app` /
`flourish-app-dev`), separate from the marketing/CTA project. App rules live in
[`mobile/firebase/firestore.rules`](./mobile/firebase/firestore.rules); the CTA
project's waitlist rules live separately in [`firestore.rules`](./firestore.rules).

- **Default deny.** Anything not explicitly allowed is rejected.
- **Private by default.** A baby document carries an `ownerId` and an explicit
  `memberIds` allow-list. Reads require `request.auth.uid in memberIds`. There
  are no public reads and no cross-account access.
- **Ownership is immutable.** Updates cannot reassign `ownerId`, and the owner
  must always remain a member. `memberIds` is capped at 11 (owner + Bloom's 10).
- **Entitlements are server-only.** `users.plan` is fixed to `seedling` at
  creation and **immutable from any client thereafter**. A client that could
  write it could grant itself Bloom or an Heirloom book for free, so real
  billing must set it with the Admin SDK from a verified store receipt.
- **The journal is owner-only.** Invited family can read memories; they cannot
  read, write, or delete journal entries. A parent's private writing about their
  own child stays theirs.
- **Shape validation on create *and* update.** Both paths validate field types,
  enum values (`kind`, `status`, event `type`), and length caps, and use a
  closed `hasOnly` allow-list of field names so a tampered client cannot inject
  unexpected fields or grow a document past its caps on a later write.
- **Authorship.** Memories/journal entries record the `authorId`; only the
  author or the baby's owner may edit or delete them, and `authorId`/`babyId`
  cannot be rewritten by an update.
- **Tested.** [`mobile/firebase/tests/`](./mobile/firebase/tests/) exercises
  both rule sets against the emulator, covering each of the above plus a
  happy-path suite asserting that every write the real client performs still
  succeeds.
- **Project isolation.** Because the app has its own Firebase project, a
  misconfiguration or abuse on the public marketing/CTA project can never reach
  family data, and vice-versa. (The CTA **waitlist** collection is locked to
  clients — only the privileged Cloud Function may write to it.)

## 3. Authorization — Cloud Storage Rules

See [`mobile/firebase/storage.rules`](./mobile/firebase/storage.rules).

- Media lives at `babies/{babyId}/memories/{uid}/{file}`. The filename is **not**
  a security boundary — it is generated client-side and must never be treated as
  a secret.
- **Writes** are restricted to the authenticated uploader and validated for
  **size** (0 < n < 15 MB) and **content type** against an explicit allow-list
  (`image/jpeg|png|heic|heif|webp`, `video/mp4|quicktime`) — mirroring
  `src/firebase/storage.ts`. The list is explicit rather than `image/*` because
  a wildcard also admits `image/svg+xml`, which can carry script.
- **Reads are restricted to the uploader.** Storage Rules cannot query Firestore,
  so they cannot check baby-membership; authorisation therefore cannot depend on
  path secrecy, and the only enforceable rule is uid equality. Today this is not
  a functional limitation, because no invite flow ships yet and every member of a
  baby is its owner.
- **Before family sharing ships**, viewing another member's upload needs either
  custom auth claims carrying the caller's `babyIds`, or short-lived signed URLs
  minted by a Cloud Function that checks Firestore. Widening `read` back to "any
  signed-in user" is not an option — that would let any account holding a path
  read another family's photos.

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
- The **CTA Cloud Function** (`functions/index.js`, part of the marketing build)
  verifies signups with the **reCAPTCHA Enterprise client library**
  (`@google-cloud/recaptcha-enterprise`), which authenticates via the function's
  runtime service account (Application Default Credentials) — so **no API key is
  committed to source**. Only the *public* reCAPTCHA site key appears in code,
  which is expected. Email confirmations are sent server-side via the Firestore
  "Trigger Email" flow (`mail` / `auto_reply` collections, locked to clients).

## 9. Waitlist signups

The `waitlist` collection is **server-only**: clients can neither read nor write
it. Signups go through `addWaitlistEmail`, which requires a reCAPTCHA Enterprise
token, asserts a minimum score, and writes with the Admin SDK.

This matters because the alternative was actively exploitable. The page
previously wrote to Firestore directly and never called the function at all, and
the rules permitted unauthenticated creates — so the reCAPTCHA check could be
skipped entirely by posting to the Firestore REST API. Since a create triggers a
confirmation email, that allowed unlimited junk signups **and** sending mail from
the Flourish domain to arbitrary addresses on demand. Both paths are now closed,
and `mobile/firebase/tests/cta-rules.test.mjs` asserts they stay closed.

Rejections deliberately return a generic error. Echoing the score, hostname, or
reason back to the caller hands an attacker a dial to tune against.

## 8. Transport & platform

- All Firebase traffic is HTTPS/TLS by default.
- `usesNonExemptEncryption: false` is declared for iOS (standard TLS only).
- Android blocks broad media permissions it does not need; the app uses the
  scoped photo picker via `expo-image-picker`.

## Reporting

To report a vulnerability, contact the Flourish team privately rather than
opening a public issue.
