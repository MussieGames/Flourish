# Flourish

A private, beautiful memory-keeping app for new parents — *built for 3am,
beautiful at any hour.*

This repository holds **two separate products**, each with its **own Firebase
project(s)** so they can be developed, deployed, and secured independently.

```
Flourish/
├─ index.html, assets/, CNAME        ← 1) MARKETING SITE (the CTA / waitlist)
├─ functions/                        ← 1) CTA backend (waitlist signup + email)
├─ .github/workflows/                ←    CTA auto-deploy (GitHub Actions)
├─ firebase.json, firestore.rules    ←    CTA Firebase config  → project flourish-7b8c8
├─ .firebaserc                       ←    (CTA project alias)
│
├─ mobile/                           ← 2) MOBILE APP (iOS & Android, Expo)
│  ├─ app/, src/, eas.json …            app client code + build profiles
│  └─ firebase/                      ←    APP Firebase config → projects flourish-app(-dev)
│     ├─ firestore.rules, storage.rules
│     └─ firebase.json, .firebaserc
│
└─ SECURITY.md                       ← full security & privacy model
```

| Product | Firebase project(s) | Rules live in |
|---------|--------------------|----------------|
| Marketing site / CTA | `flourish-7b8c8` | repo root (`/firestore.rules`) |
| Mobile app | `flourish-app` (prod), `flourish-app-dev` (dev) | [`mobile/firebase/`](mobile/firebase/) |

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

## Creating the app Firebase projects

The mobile app uses its **own** Firebase projects (isolated from the CTA site).
Create them once:

1. Go to the [Firebase console](https://console.firebase.google.com/) →
   **Add project**.
2. Create **`flourish-app-dev`** (for development/testing).
   - Give it a name; you can skip/disable Google Analytics for dev.
3. Create **`flourish-app`** (for production) the same way.
4. In **each** project, enable the services the app uses:
   - **Build → Authentication → Get started → Email/Password → Enable.**
   - **Build → Firestore Database → Create database** (start in *production
     mode*; the app's rules will be deployed over the top).
   - **Build → Storage → Get started.**
5. In **each** project, register a **Web app**
   (Project settings → General → *Your apps* → **Web** `</>`), then copy the
   config values (`apiKey`, `appId`, `messagingSenderId`, `projectId`, …).
6. Note each project's **Project ID** — it may have a random suffix
   (e.g. `flourish-app-dev-1a2b3`).

Then wire it up:
- Put the **dev** web config into `mobile/.env` (from `mobile/.env.example`).
- Put the **prod** web config into `mobile/eas.json` (production profile).
- Put both **Project IDs** into `mobile/firebase/.firebaserc`.

## Deploying the app's security rules

```bash
cd mobile/firebase
firebase deploy --only firestore:rules,storage:rules              # → dev (default)
firebase deploy -P production --only firestore:rules,storage:rules # → production
```

The CTA rules deploy separately (root `firebase.json`, via GitHub Actions).

See [`mobile/firebase/README.md`](mobile/firebase/README.md) for details, and
[`SECURITY.md`](SECURITY.md) for the complete security model.
