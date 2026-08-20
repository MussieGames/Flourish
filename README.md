# Flourish

A private, beautiful memory-keeping app for new parents — *built for 3am,
beautiful at any hour.*

This repository holds **two separate products** that happen to share one
Firebase project (`flourish-7b8c8`). They are intentionally kept apart so each
can be worked on and deployed independently.

```
Flourish/
├─ index.html, assets/, CNAME        ← 1) MARKETING SITE (the CTA / waitlist)
├─ functions/                        ← 1) CTA backend (waitlist signup + email)
├─ .github/workflows/                ←    CTA auto-deploy (GitHub Actions)
│
├─ mobile/                           ← 2) MOBILE APP (iOS & Android, Expo)
│
├─ firestore.rules, storage.rules    ← shared Firebase rules (clearly sectioned:
├─ firestore.indexes.json               "MARKETING / CTA" vs "MOBILE APP")
├─ firebase.json, .firebaserc        ← shared Firebase project config
└─ SECURITY.md                       ← full security & privacy model
```

---

## 1) Marketing site + CTA (the website)

The public landing page and its reCAPTCHA-gated waitlist signup.

- **Front-end:** [`index.html`](index.html) + [`assets/`](assets/), served at
  `goflourish.com.au`.
- **Back-end:** [`functions/`](functions/) — a Cloud Function that verifies
  signups with reCAPTCHA Enterprise and triggers a confirmation email.
- **Deploy:** handled automatically by
  [`.github/workflows/firebase-deploy.yml`](.github/workflows/firebase-deploy.yml)
  (and manually via `firebase deploy --only functions`).

You generally **do not need Node/Expo** to work on this — it's plain HTML/CSS/JS
plus the Cloud Function.

## 2) Mobile app (iOS & Android)

The private memory-keeping app — React Native + **Expo (SDK 56)** + Firebase.
Fully self-contained in [`mobile/`](mobile/) with its own `package.json`,
Firebase client config, and README.

```bash
cd mobile
npm install
cp .env.example .env   # fill in your Firebase web config
npm run start          # then press i (iOS) / a (Android)
```

See [`mobile/README.md`](mobile/README.md) for the full guide.

---

## Shared Firebase backend

Because both products live in the same Firebase project, the security rules are
single files with **clearly labelled sections** so the two never get confused:

- [`firestore.rules`](firestore.rules) → *Section 1: Marketing/CTA* (waitlist,
  email) and *Section 2: Mobile app* (users, babies, memories, …).
- [`storage.rules`](storage.rules) → mobile app media only.

Deploy the shared rules from the repo root:

```bash
firebase deploy --only firestore:rules,storage:rules
```

> Prefer separate Firebase projects for the two products? You can point a
> `staging`/`app` project alias in [`.firebaserc`](.firebaserc) and split the
> rules later — the code is already namespaced to make that painless.

See [`SECURITY.md`](SECURITY.md) for the complete security model.
