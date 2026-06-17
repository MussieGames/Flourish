# Flourish Feature Compliance Review

Last updated: 17 June 2026

This review maps current Flourish app features to privacy, child-safety, and security controls. It is implementation
guidance, not legal advice.

## Feature-by-feature review

| Feature | Data involved | Primary risks | Required controls |
| --- | --- | --- | --- |
| Account sign-up/sign-in | Parent email, display name, Firebase UID | Account takeover, unauthorised access | Firebase Auth, strong passwords, reset flow, email verification before production, optional MFA/re-auth for sensitive actions |
| Child profile onboarding | Child name, birth date/age | Child data collected without authority | Parent/guardian-only accounts, clear consent, no child accounts, delete/export flow |
| Photo/video capture | User-selected media and metadata | Sensitive child images, accidental geolocation/EXIF, unauthorised sharing | Request photo permission only at upload, no microphone/location permissions, strip metadata before production, Storage rules, private paths |
| Journal entries | Parent-written text, moods, tags | Sensitive family disclosures | Firestore role rules, private by default, export/delete, support access controls |
| Age-adaptive stickers | Child age range and preferences | Profiling concerns | Use for product personalisation only, no behavioural ads, no sale/share |
| Milestones/calendar | Dates, appointments, developmental windows | Inaccurate health/development assumptions | General information disclaimer, not medical advice, parent control |
| Family sharing | Invited user IDs, roles | Unsafe access by estranged or unauthorised people | Owner/editor/viewer roles, revocation, invite expiry, audit history before production |
| Plans/gifts/printed books | Purchase status, shipping details if used | Payment/security, consumer law, disclosure | App Store/Google Play or PCI provider, no raw card storage, clear pricing/cancellation, Australian Consumer Law |
| Device lock | Local app-lock preference | False sense of cloud security | SecureStore, OS biometric prompt, explain it protects local device access only |
| Waitlist | Email, reCAPTCHA, salted hashes | Spam, credential leakage, overcollection | Secret Manager, strict CORS, rate limiting, no-store responses, salted hashing |

## Australia-origin requirements

- Privacy Act 1988 (Cth) and Australian Privacy Principles where applicable.
- APP 1 transparent privacy management and a clear privacy policy.
- APP 3 collection minimisation and lawful collection.
- APP 5 collection notice before or at collection.
- APP 6 use/disclosure limitation.
- APP 8 cross-border disclosure safeguards for overseas processors.
- APP 11 reasonable security and deletion/de-identification when no longer needed.
- APP 12 and APP 13 access and correction.
- Notifiable Data Breaches scheme for eligible data breaches likely to result in serious harm.
- Spam Act consent/unsubscribe rules for marketing.
- Australian Consumer Law for subscriptions, refunds, gifts, printed books, and non-excludable guarantees.
- Online Safety and child-protection expectations for harmful child content.

## International privacy and children-policy checklist

### United States

- Treat the app as parent-directed, not child-directed for independent child use.
- Do not permit under-13 child accounts without COPPA-compliant verifiable parental consent.
- Provide notice of child data collection, use, disclosure, retention, and deletion.
- Honour parent access/deletion requests.
- Do not sell/share child data or use behavioural advertising.
- Complete Apple/Google child-safety and data-safety declarations accurately.
- Review CCPA/CPRA, CalOPPA, and state privacy laws if serving California/US users.

### EU / EEA and United Kingdom

- Identify lawful bases for parent and child processing.
- Provide child-sensitive transparent notices.
- Honour access, correction, erasure, portability, objection, restriction, and complaint rights.
- Apply privacy by design/default and data minimisation.
- Use international transfer safeguards for non-EEA/UK processing.
- Assess whether a DPIA is needed due to child data and media storage.

### Canada, New Zealand, Singapore, and similar regimes

- Use meaningful consent and purpose limitation.
- Limit collection, use, retention, and disclosure.
- Provide access/correction rights.
- Protect data with reasonable safeguards.
- Use cross-border transfer contractual controls.
- Notify regulators/users where breach-notification thresholds are met.

## Security items to complete before production

1. Enable Firebase App Check enforcement for Firestore, Storage, and callable functions.
2. Enable email verification and re-authentication for sensitive actions.
3. Add invite expiry, family-access revocation, and access audit history.
4. Add account and child-profile export/delete workflows.
5. Add server-side media metadata stripping and malware/content-type validation.
6. Add production incident response and Notifiable Data Breach procedures.
7. Restrict Firebase API keys to app bundle IDs, package names, and authorised domains.
8. Use separate Firebase projects for development, staging, and production.
9. Complete Apple App Store privacy labels and Google Play Data Safety forms.
10. Replace legal placeholders with the final Australian legal entity, ABN/ACN, address, and privacy contact.
