# Flourish

Flourish is a private family scrapbook app for iOS and Android, built with
React Native through Expo and backed by Firebase.

## Mobile app

```bash
npm install
cp .env.example .env
npm run start
```

Set the `EXPO_PUBLIC_FIREBASE_*` values in `.env` from your Firebase project.
These identifiers are public client configuration. Do not put service account
keys or private secrets in Expo environment variables.

Useful scripts:

- `npm run ios` - launch in the iOS simulator.
- `npm run android` - launch in an Android emulator.
- `npm run web` - preview the same Expo app on web.
- `npm run typecheck` - run TypeScript checks.

## Firebase

Firebase configuration lives in:

- `firebase.json`
- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- `functions/index.js`

Before deploying functions, store the reCAPTCHA Enterprise API key as a secret:

```bash
firebase functions:secrets:set RECAPTCHA_ENTERPRISE_API_KEY
```

See `docs/security.md` for the required production hardening checklist,
including App Check, API key restrictions, Auth settings, and data lifecycle
requirements.
