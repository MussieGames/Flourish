# Flourish

A private, beautiful memory keeper for new parents — capture the firsts, the
3am feelings, and the milestones before they slip by.

This repository contains everything for Flourish:

| Path | What it is |
| --- | --- |
| [`mobile/`](mobile/) | The **iOS & Android app** — React Native (Expo) + Firebase. |
| [`functions/`](functions/) | **Firebase Cloud Functions** (waitlist + auth-claim sync). |
| [`index.html`](index.html) | The marketing landing page (deployed to GitHub Pages / Firebase Hosting). |
| `firestore.rules`, `storage.rules` | Hardened security rules enforcing data isolation. |
| `firebase.json`, `firestore.indexes.json` | Firebase project configuration. |
| [`SECURITY.md`](SECURITY.md) | Full security & privacy overview. |

## The app

The mobile app implements the seven approved screen designs:

1. **Welcome / Onboarding** — warm, single-question account creation
2. **Dashboard** — one-handed, 3am-friendly home with quick capture
3. **Age-adaptive Stickers** — a sticker library that grows up with the child
4. **Calendar** — colour-coded memories, milestones & appointments
5. **Plans** — honest, no-dark-patterns pricing
6. **Milestone Moment** — a full-screen celebration of each "first"
7. **Memory Journal** — a handwritten-feeling private journal

See [`mobile/README.md`](mobile/README.md) to run it.

## Security first

Flourish handles sensitive data about children, so security is foundational:

- All data is **scoped to the authenticated user / invited family** and enforced
  by server-side Firestore & Storage rules.
- Input is **validated on the client and re-validated by the rules**.
- **App Check**, a **strong password policy**, **email verification**, and
  **tamper-proof billing** round out the model.

Read the details in [`SECURITY.md`](SECURITY.md).

## Quick start

```bash
# Mobile app
cd mobile && npm install && cp .env.example .env && npm run start

# Cloud Functions
cd functions && npm install

# Deploy rules / functions (requires firebase-tools + auth)
firebase deploy --only firestore:rules,storage,functions
```
