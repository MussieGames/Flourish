# Flourish

Pre-launch marketing/waitlist landing page for the "Flourish" baby-keepsake app.

## Cursor Cloud specific instructions

### Layout & services
- **Frontend** — a single static `index.html` at the repo root (vanilla HTML/CSS/JS, Firebase Web SDK + reCAPTCHA Enterprise loaded via CDN). There is **no build step and no frontend dependencies**. Serve it with any static server from the repo root, e.g. `python3 -m http.server 8080`, then open `/index.html`.
- **Functions** (`functions/`) — Firebase Cloud Functions (`addWaitlistEmail`, Gen 2, Node 20 runtime). Deps install with `npm install` in `functions/` (handled by the startup update script).

### Non-obvious caveats
- The deployed frontend does **not** call the Cloud Function. On submit, `index.html` writes the waitlist entry **directly to Firestore** (live project `flourish-7b8c8`, `waitlist` collection) via the Firebase Web SDK; the reCAPTCHA token is generated client-side but is **not** server-verified in this path. The `addWaitlistEmail` function is currently legacy/unused.
- Submitting the form therefore requires **network access to the live Firebase/Firestore + reCAPTCHA Enterprise** project. There is no local emulator wired up.
- There is **no `firebase.json` / `.firebaserc`** in the repo and the Firebase CLI is **not installed**. Emulating or deploying functions would require adding those config files, credentials, and the CLI yourself.
- There are **no automated tests and no lint config** in this repo. Firebase web config, project ID, and reCAPTCHA keys are hardcoded in `index.html` (and a reCAPTCHA Enterprise API key in `functions/index.js`).
