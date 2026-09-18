# Security Rules tests

Runs both rule sets against the Firestore emulator. Requires Java.

```bash
cd mobile/firebase/tests
npm install
npm test
```

Three suites, and the order matters:

| Suite | Asks |
|---|---|
| `happy-path.test.mjs` | Does every write the real client performs still succeed? |
| `app-rules.test.mjs` | Are the app's private things actually private? |
| `cta-rules.test.mjs` | Is the marketing project's waitlist server-only? |

`happy-path` runs first on purpose. It is easy to secure these rules by
accident-proofing them into uselessness, and that suite is what notices. Its
document shapes are copied from `mobile/src/firebase/firestore.ts` — if you
change a write there, change it here.

The other two cover the specific holes closed in this change, so they should be
treated as regression tests rather than examples:

- a client granting itself `plan: 'bloom'` or `'heirloom'` (free money)
- invited family reading the parent's journal (owner-only by design)
- rewriting `authorId` on someone else's memory
- injecting unknown fields, or oversized strings on update
- exceeding the member cap, or reassigning ownership
- creating waitlist signups directly, which skipped reCAPTCHA entirely
