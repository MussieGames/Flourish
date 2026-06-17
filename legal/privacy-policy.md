# Flourish Privacy Policy

Last updated: 17 June 2026

Flourish is a private family scrapbook app originating from Australia. This Privacy Policy explains how Flourish
("Flourish", "we", "us", or "our") collects, uses, discloses, protects, transfers, retains, and deletes personal
information, including information about children.

This document is drafted for an Australian service and includes additional privacy and children-policy obligations that
may apply in other countries. It is a product/legal draft and must be reviewed by qualified counsel before publication.

## 1. Our privacy position

Flourish is designed around these commitments:

- parent-controlled child memories, not child accounts;
- no sale of personal information or child data;
- no behavioural advertising or third-party ad networks;
- no public child profiles;
- no location or microphone permission by default;
- photo/video access only when a parent chooses a memory to upload;
- family access controlled by roles and invitations;
- Firebase rules that deny access by default;
- secure local device preferences using device-only secure storage; and
- deletion, correction, export, and access rights for parents and guardians.

## 2. Who this policy covers

This policy covers:

- parents and legal guardians who create or manage accounts;
- invited adult family members;
- children whose memories are added by a parent or guardian;
- waitlist users and website visitors; and
- people who contact us for support.

Children must not create accounts or use Flourish independently. If we learn that a child has directly created an
account or provided personal information without required consent, we will take appropriate steps to delete, isolate, or
obtain verified parental consent as required by law.

## 3. Personal information we collect

### Account and authentication information

- email address;
- display name;
- Firebase authentication identifiers;
- account creation and update timestamps;
- password reset events handled by Firebase Auth; and
- optional device-lock preference stored locally on your device.

We do not store your password in our app database.

### Child profile information

- child name;
- optional date of birth or age-related milestone information;
- family member roles and permissions; and
- scrapbook configuration such as sticker era or milestone preferences.

### Memory and scrapbook information

- photos and videos selected by a parent or guardian;
- journal entries, captions, tags, dates, milestones, stickers, and layout choices;
- media storage paths and metadata needed to display memories; and
- printed book or gift selections if enabled.

### Device, security, and operational information

- app version, platform, crash/security logs, Firebase security metadata, and request timestamps;
- reCAPTCHA assessment data for waitlist or anti-abuse flows;
- salted email hash and salted IP hash for waitlist de-duplication and rate limiting; and
- support communications.

### Payment and purchase information

If paid plans, gifts, or printed books are enabled, payment details should be processed by Apple, Google Play, or a
PCI-compliant payment provider. Flourish should receive only the purchase status, plan, receipt/subscription identifier,
shipping details for printed goods if needed, and support metadata. Flourish should not store raw card numbers.

## 4. Information we do not intentionally collect

Flourish does not intentionally collect:

- child accounts or child login credentials;
- precise geolocation;
- microphone recordings unless a future feature asks for explicit permission;
- health records, medical diagnoses, or clinical developmental assessments;
- advertising IDs for behavioural ads;
- biometric templates such as Face ID or fingerprints; or
- raw payment-card details.

The app requests media without EXIF data where supported and does not intentionally use location metadata. Before
production, server-side media processing should strip unnecessary metadata from uploaded files where feasible.

## 5. How we use personal information

We use personal information to:

- create and secure accounts;
- create child profiles and private family scrapbooks;
- upload, store, display, back up, and sync memories;
- show age-appropriate sticker eras and milestone reminders;
- manage family sharing roles;
- provide plans, gifts, printed books, support, and service notices;
- prevent abuse, spam, unauthorised access, fraud, and child-safety risks;
- comply with legal, app-store, tax, accounting, consumer, and privacy obligations;
- respond to access, correction, deletion, export, and consent requests; and
- improve reliability, accessibility, and security.

We do not use child information for behavioural advertising, sale, public profiling, or unrelated third-party marketing.

## 6. Legal bases and consent

Depending on your location, we rely on one or more legal bases:

- your consent and parental/guardian consent for child information;
- performance of a contract to provide Flourish;
- legitimate interests such as security, fraud prevention, service improvement, and family sharing, balanced against
  privacy interests;
- compliance with legal obligations; and
- protection of vital interests where child safety or emergency disclosure is legally necessary.

For Australia, we handle personal information under the Privacy Act 1988 (Cth), the Australian Privacy Principles
(APPs), and the Notifiable Data Breaches scheme where they apply. We treat children's information as highly sensitive
family information even when it is not legally classified as "sensitive information".

## 7. Children's privacy and international requirements

Flourish is for adult parents/guardians. Because the app stores child memories, extra protections may apply:

- **Australia:** parental authority, APP transparency, collection minimisation, cross-border disclosure safeguards, and
  notifiable data breach obligations.
- **United States:** COPPA may require verifiable parental consent for personal information from children under 13. The
  product should not allow children to submit data directly. State privacy laws, CCPA/CPRA, and CalOPPA may also apply.
- **European Union / EEA and United Kingdom:** GDPR/UK GDPR rights, child transparency, age-of-consent rules,
  data-protection-by-design, transfer safeguards, and lawful-basis requirements may apply.
- **Canada:** PIPEDA and provincial privacy laws require meaningful consent, limiting collection, safeguards, access,
  correction, and retention controls.
- **New Zealand:** the Privacy Act requires purpose limitation, access/correction rights, cross-border care, and breach
  notification.
- **Singapore and similar PDPA jurisdictions:** consent, notification, protection, retention limitation, access,
  correction, and transfer controls may apply.
- **Other countries:** local child privacy, online safety, consumer, and data-protection laws may apply based on where
  users, children, providers, or regulators are located.

If a jurisdiction requires a higher protection for child data than this policy provides, Flourish should apply the higher
standard where legally required.

## 8. Disclosure and service providers

We may disclose personal information to:

- Firebase/Google Cloud for authentication, database, storage, security, and cloud functions;
- Expo and mobile platform services needed to build and run the app;
- Apple App Store and Google Play for app distribution, purchases, subscriptions, and device safety controls;
- payment processors for billing if paid features are enabled;
- printing and shipping providers for printed books or gifts;
- email/support providers for account and support communications;
- professional advisers, insurers, auditors, and legal representatives;
- law enforcement, regulators, courts, or child-safety authorities where legally required or necessary to protect a
  child or person from harm; and
- another entity in a merger, acquisition, restructure, or asset transfer, subject to privacy safeguards.

We require service providers to use personal information only for authorised purposes and to apply reasonable security
and confidentiality protections.

## 9. Cross-border transfers

Flourish originates from Australia, but cloud, app-store, payment, support, printing, and security providers may process
information in Australia, the United States, the European Union, the United Kingdom, Singapore, New Zealand, or other
locations where they or their subprocessors operate.

For Australian users, we take reasonable steps under APP 8 before disclosing personal information overseas. For GDPR/UK
GDPR users, appropriate safeguards may include standard contractual clauses, adequacy decisions, transfer impact
assessments, encryption, access controls, and minimisation.

## 10. Security

Flourish uses and recommends layered security controls:

- Firebase Authentication for account identity;
- Firestore and Storage rules that deny by default and restrict data to authorised family roles;
- image/video-only Storage uploads with size limits and private paths;
- secure transport using HTTPS/TLS;
- encryption at rest provided by Firebase/Google Cloud infrastructure;
- Expo SecureStore with device-only accessibility for local app-lock preferences and convenience state;
- optional biometric/device unlock handled by the device OS;
- no committed server secrets or service-account files;
- Secret Manager for reCAPTCHA and rate-limit salts;
- salted hashes for waitlist de-duplication and IP rate limiting;
- App Check with DeviceCheck/App Attest for iOS and Play Integrity for Android before production;
- restricted Firebase API keys, separate environments, audit logging, and budget/security alerts; and
- least-privilege internal access for support and operations.

No system is perfectly secure. If we identify a breach likely to cause serious harm, we will follow the Australian
Notifiable Data Breaches scheme and any other applicable breach-notification requirements.

## 11. Retention

We keep personal information only as long as reasonably needed for the purposes in this policy, including providing the
Service, maintaining backups, resolving disputes, preventing abuse, complying with law, and enforcing rights.

Suggested default retention rules before launch:

- active scrapbook data: retained until deleted by the account owner or account closure;
- deleted media: removed from active systems promptly and from backups on the normal backup cycle;
- waitlist rate-limit records: short retention, such as 30 to 90 days;
- support messages: retained only as long as needed for support, legal, and audit purposes;
- billing/tax records: retained as required by law; and
- suspended safety records: retained where necessary to protect children, users, or legal rights.

## 12. Your rights and choices

Depending on where you live, you may have rights to:

- access your personal information;
- correct inaccurate information;
- request deletion;
- request export or portability;
- withdraw consent where processing is based on consent;
- object to or restrict certain processing;
- opt out of sale/share or targeted advertising, if applicable;
- complain to a privacy regulator; and
- appeal certain privacy decisions.

Parents and guardians may exercise these rights for child information they are authorised to manage. We may need to
verify your identity and authority before responding.

## 13. Deletion and export

Flourish should provide a practical way to request:

- account export;
- child scrapbook export;
- deletion of a child profile;
- deletion of individual memories;
- revocation of family-member access; and
- account closure.

Deletion may be delayed or limited where retention is required for legal, safety, fraud-prevention, dispute, tax,
backup, or child-protection reasons.

## 14. Communications

We may send service, security, privacy, billing, and support messages. Marketing messages require consent where required
by laws such as Australia's Spam Act. You can unsubscribe from marketing messages, but you may still receive essential
service and security notices.

## 15. App-store disclosures

Before production release, Flourish must complete accurate Apple App Store privacy nutrition labels and Google Play Data
Safety disclosures. These disclosures should state, at minimum, the categories of account, user-generated content,
photos/videos, purchase, diagnostics, and app activity data actually collected by the production build.

## 16. Changes to this policy

We may update this Privacy Policy for product, legal, security, or operational changes. We will update the "Last
updated" date and provide additional notice or consent where required by law.

## 17. Contact and complaints

Replace these placeholders before publication:

- Legal entity: Flourish [legal entity name]
- ABN/ACN: [insert]
- Address: [insert Australian business address]
- Email: hello@goflourish.com.au
- Privacy contact: privacy@goflourish.com.au

If you are in Australia and are not satisfied with our response, you may contact the Office of the Australian
Information Commissioner (OAIC). Users in other countries may contact their local privacy or data-protection regulator.
