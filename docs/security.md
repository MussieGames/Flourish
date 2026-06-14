# Flourish security notes

This app treats the mobile client as untrusted. Privacy is enforced by Firebase
Auth identities, Firestore rules, Storage rules, Cloud Functions, and production
Firebase project settings.

## Client app

- Expo only receives public Firebase client identifiers through
  `EXPO_PUBLIC_FIREBASE_*` values. Never add Admin SDK credentials, service
  account JSON, reCAPTCHA secrets, Stripe secrets, or private API tokens to Expo
  config.
- Firebase Auth is required before writing user, child, memory, or milestone
  documents. Anonymous Auth is used for the first private session; production
  should offer account linking so families can recover data after replacing a
  device.
- Private memories are not cached in plain local storage. `expo-secure-store`
  only stores the device-lock preference.
- The optional device privacy lock uses Face ID, Touch ID, or passcode via
  `expo-local-authentication`. This protects local viewing only; server-side
  Firebase rules remain the source of truth.
- The UI does not log names, emails, journal text, download URLs, or other PII.

## Firebase project settings

Enable these before production release:

1. Firebase Authentication
   - Enable Anonymous Auth for onboarding.
   - Add a durable sign-in method such as email link, Sign in with Apple, or
     Google, then link anonymous users to durable accounts.
   - Enable MFA for admin/operator accounts.
2. App Check
   - Register iOS with App Attest plus DeviceCheck fallback.
   - Register Android with Play Integrity.
   - Enforce App Check for Firestore, Storage, and Cloud Functions once all
     release builds are registered.
3. API key restrictions
   - Restrict the Firebase Web API key to the expected bundle identifiers,
     Android package name/SHA certificates, and web domains.
   - Do not use unrestricted API keys for server-to-server calls.
4. Firestore and Storage
   - Deploy `firestore.rules` and `storage.rules`.
   - Keep default deny-all fallbacks.
   - Use the Firebase Emulator Suite for rules tests before changing schemas.
5. Cloud Functions
   - Store the reCAPTCHA Enterprise API key in Secret Manager:
     `firebase functions:secrets:set RECAPTCHA_ENTERPRISE_API_KEY`
   - Keep `addMobileWaitlistEmail` App Check enforced.
   - Do not log raw emails, names, journal entries, tokens, or media URLs.
6. Data lifecycle
   - Define retention policies for deleted children and media.
   - Add a user data export/delete workflow before public launch.
   - Back up Firestore and Storage with access limited to operators.

## Rules model

- `children/{childId}` documents are readable only by the owner or invited
  caregiver UIDs.
- Child ownership cannot be changed by client updates.
- Memory and milestone subcollections inherit access from their child document.
- Waitlist writes are denied to clients and must go through Cloud Functions.
- Storage media lives under
  `users/{uploaderUid}/children/{childId}/memories/{memoryId}/...` and can be
  read only by members of the child document.

## Remaining production work

- Add Firebase Emulator Suite tests for every allow/deny path.
- Add a durable account linking flow and invitation acceptance flow.
- Add encrypted media processing if thumbnails or AI features are introduced.
- Add monitoring alerts for denied-rule spikes, function error rates, and App
  Check failures.
