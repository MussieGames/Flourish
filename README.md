# Flourish

Flourish is a private baby-memory scrapbook app for iOS and Android, built with Expo, React Native, and Firebase.

The existing static landing page remains in `index.html`. The mobile app entrypoint is `App.tsx`.

## Mobile app

```bash
npm install
cp .env.example .env
npm run start
```

Set the `EXPO_PUBLIC_FIREBASE_*` values in `.env` from your Firebase web app configuration. These values are public
client identifiers, not server secrets. Without them, the app opens a no-upload design preview.

### Scripts

- `npm run start` - start Expo.
- `npm run ios` - open the iOS simulator.
- `npm run android` - open the Android emulator.
- `npm run web` - open a web preview.
- `npm run typecheck` - run TypeScript in strict mode.
- `npm run audit` - audit production dependencies.

## Firebase security setup

Deploy the included rules before enabling real users:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

Security choices included in this repo:

- Firebase Auth is required for cloud writes; there are no anonymous cloud-write flows.
- Client inputs are validated with Zod before Auth, Firestore, and Storage calls.
- Firestore rules deny by default, keep user profiles self-only, enforce immutable ownership, validate document shapes,
  and restrict child/memory access to `owner`, `editor`, or `viewer` family members.
- Storage rules deny by default, only allow authenticated family editors to upload image/video files below 25 MB, and
  scope uploads to `children/{childId}/users/{uid}/...`.
- Local convenience data uses Expo SecureStore with device-only accessibility; users can enable Face ID/Touch ID/device
  passcode unlock from the Plan screen.
- The app requests photo-library access only when the user chooses a memory to upload. Location and microphone
  permissions are blocked in Expo config.

Recommended Firebase console hardening:

1. Enable Email/Password Auth and enforce email verification for production policies/workflows.
2. Enable Firebase App Check with DeviceCheck/App Attest for iOS and Play Integrity for Android. App Check enforcement is
   configured in the Firebase console for supported products such as Firestore, Storage, and callable functions.
3. Turn on Firestore/Storage alerting and budget alerts.
4. Keep Firebase API keys restricted to the app bundle IDs/package names and authorized domains.
5. Use separate Firebase projects for development, staging, and production.

## Functions

The waitlist endpoint in `functions/index.js` uses reCAPTCHA Enterprise, strict CORS, JSON-only POST requests, no-store
responses, salted IP hash rate limiting, and salted email hash de-duplication.

Install functions dependencies and set secrets/params:

```bash
cd functions
npm install
firebase functions:secrets:set RECAPTCHA_ENTERPRISE_API_KEY
firebase functions:secrets:set WAITLIST_RATE_LIMIT_SALT
firebase deploy --only functions
```

Set non-secret function params in a Functions dotenv file such as `functions/.env.<project-id>`:

```bash
RECAPTCHA_PROJECT_ID=your-firebase-project-id
RECAPTCHA_SITE_KEY=your-recaptcha-enterprise-site-key
```

Never commit `.env`, Firebase service-account JSON, reCAPTCHA secrets, or production signing credentials.
