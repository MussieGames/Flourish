# Flourish

## Cursor Cloud specific instructions

### What this is
- Single static marketing/waitlist site: `index.html` at the repo root (self-contained HTML/CSS/JS, no build step, no framework, no root `package.json`).
- `functions/` holds one Firebase Cloud Function (`addWaitlistEmail`, server-side reCAPTCHA + Firestore write). It is **not** wired into the current frontend — the page writes to Firestore directly. Treat it as optional/legacy.
- Custom domain in `CNAME` is `www.goflourish.com.au` (served via static hosting).

### Running the app (dev)
- Serve the site from the repo root: `python3 -m http.server 8000`, then open `http://localhost:8000/`. There is no build/bundle step.
- The page loads Firebase Web SDK, reCAPTCHA Enterprise, and Google Fonts from CDNs, so it needs outbound internet to render/function fully.

### Important gotcha (real side effects)
- The waitlist form writes signups **directly to the LIVE production Firestore** (project `flourish-7b8c8`, collection `waitlist`). reCAPTCHA is not domain-locked, so submitting the form on `localhost` succeeds and writes a real row to production. When testing the form, use a clearly-marked throwaway email (e.g. `cursor-cloud-test@example.com`) and submit sparingly.

### functions/
- Dependencies install with `npm install` in `functions/` (the only dependency target in the repo).
- `package.json` declares Node 20; Node 22 runs it fine (only an `EBADENGINE` warning). `node --check functions/index.js` is a quick syntax sanity check.
- There is no test/lint framework configured and no `firebase.json`/emulator config committed.
