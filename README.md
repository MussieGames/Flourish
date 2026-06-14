# Flourish

A private, beautiful memory-keeping app for new parents — *built for 3am,
beautiful at any hour.*

This repository contains:

| Path | What it is |
|------|------------|
| [`mobile/`](mobile/) | The **iOS & Android app** — React Native + Expo (SDK 56) + Firebase. See [`mobile/README.md`](mobile/README.md). |
| `index.html` | The marketing / waitlist landing page (served via GitHub Pages → `goflourish.com.au`). |
| [`functions/`](functions/) | Firebase Cloud Functions (reCAPTCHA-gated waitlist signup). |
| [`firestore.rules`](firestore.rules), [`storage.rules`](storage.rules) | Hardened Firebase Security Rules. |
| [`SECURITY.md`](SECURITY.md) | The full security & privacy model. |

## Quick start (mobile app)

```bash
cd mobile
npm install
cp .env.example .env   # fill in your Firebase web config
npm run start
```

## Deploying Firebase rules & functions

```bash
# from the repo root
firebase deploy --only firestore:rules,storage:rules,functions
```

> Cloud Function configuration (reCAPTCHA keys) is read from `functions/.env`
> — see [`functions/.env.example`](functions/.env.example). Never commit real
> secrets; rotate any key that was previously committed.
