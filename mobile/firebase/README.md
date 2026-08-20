# Flourish App — Firebase backend infra

Security rules & indexes for the **mobile app's own Firebase project(s)**,
kept completely separate from the marketing/CTA project (`flourish-7b8c8`).

| File | Purpose |
|------|---------|
| `firestore.rules` | App Firestore rules (users, babies, memories, …) |
| `storage.rules` | App Cloud Storage rules (photos/videos) |
| `firestore.indexes.json` | Composite indexes for family invites (`email+status`, `babyId+status`) |
| `firebase.json` | Deploy config for the above |
| `.firebaserc` | Project aliases: `development` (default) and `production` |

## One-time setup

1. Create two Firebase projects in the console (see the repo root `README.md`
   → "Creating the app Firebase projects").
2. Copy each project's **Project ID** (Console → Project settings → General).
   It may include a random suffix, e.g. `flourish-app-dev-1a2b3`.
3. Paste them into [`.firebaserc`](.firebaserc), replacing the
   `REPLACE_WITH_…` placeholders.

## Deploying rules

Run these from **inside this folder** (`mobile/firebase/`):

```bash
cd mobile/firebase

# Deploy to the DEV project (the default alias)
firebase deploy --only firestore:rules,firestore:indexes,storage:rules

# Deploy to PRODUCTION
firebase deploy -P production --only firestore:rules,firestore:indexes,storage:rules
```

> These commands never touch the marketing/CTA project — that project's rules
> live in the repo root and deploy via the GitHub Actions workflow.
