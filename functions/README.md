# Flourish Cloud Functions

Backend functions for Flourish.

## Functions

| Function | Trigger | Purpose |
| --- | --- | --- |
| `addWaitlistEmail` | HTTPS (web landing page) | Verifies a reCAPTCHA Enterprise token, then stores a validated, de-duplicated waitlist email. |
| `syncChildClaims` | Firestore `children/{childId}` write | Keeps each user's `childIds` custom claim in sync so Cloud Storage rules can enforce family-only access to media. |

## Required secrets

Secrets are stored in Google Secret Manager — **never** in source.

```bash
# reCAPTCHA Enterprise API key used to verify waitlist submissions
firebase functions:secrets:set RECAPTCHA_API_KEY
```

> ⚠️ **Rotate the old key.** A previous version of this file contained a
> hard-coded reCAPTCHA Enterprise API key. That key is in git history and must be
> revoked/rotated in the Google Cloud console, then re-added via the command
> above.

## Local development

```bash
npm install
firebase emulators:start --only functions,firestore,auth
```

## Deploy

```bash
firebase deploy --only functions
```
