export const featurePrivacyReview = [
  {
    feature: "Account sign-up and sign-in",
    data: "Parent/guardian email, display name, authentication identifiers, and password handled by Firebase Auth.",
    safeguards:
      "No anonymous cloud writes, strong password guidance, reset flow, Firebase security rules, and no passwords stored by Flourish.",
  },
  {
    feature: "Child profile onboarding",
    data: "Child name and optional date of birth so the scrapbook can show age-appropriate milestones and stickers.",
    safeguards:
      "Parent/guardian consent required; child profiles are scoped to authenticated family members and ownership is immutable in Firestore rules.",
  },
  {
    feature: "Photo, video, journal, and milestone memories",
    data: "User-selected media, captions, tags, sticker choices, dates, and memory metadata.",
    safeguards:
      "Photo access is requested only at upload time; location and microphone permissions are blocked; Storage accepts only image/video files under private child/user paths.",
  },
  {
    feature: "Age-adaptive stickers and milestone calendar",
    data: "Child age range and interaction metadata needed to present relevant content.",
    safeguards:
      "Designed for parent use, not child profiling for ads; no sale of child data and no behavioural advertising.",
  },
  {
    feature: "Family sharing",
    data: "Family member roles such as owner, editor, or viewer.",
    safeguards:
      "Least-privilege roles are enforced in Firestore and Storage; family members only see children they are invited to access.",
  },
  {
    feature: "Plans, gifts, and billing",
    data: "Plan choice and purchase status. Payment details should be processed by App Store, Google Play, or a PCI-compliant payment provider.",
    safeguards:
      "Flourish should not store raw card details; cancellation and consumer guarantee rights must remain available under Australian Consumer Law.",
  },
  {
    feature: "Device lock",
    data: "Local preference indicating whether device unlock is enabled.",
    safeguards:
      "Stored in Expo SecureStore with device-only accessibility. Biometrics are handled by the device OS and are not sent to Flourish.",
  },
  {
    feature: "Waitlist and website contact",
    data: "Email address, reCAPTCHA result, salted email hash, and salted IP-rate-limit hash.",
    safeguards:
      "Function uses Secret Manager, strict CORS, JSON-only POSTs, reCAPTCHA Enterprise, no-store responses, and salted de-duplication/rate limiting.",
  },
] as const;

export const jurisdictionCoverage = [
  {
    region: "Australia",
    policy:
      "Privacy Act 1988 (Cth), Australian Privacy Principles, Notifiable Data Breaches scheme, Spam Act consent rules, Online Safety expectations, and Australian Consumer Law.",
  },
  {
    region: "United States",
    policy:
      "COPPA parental consent for children under 13, state privacy laws including CCPA/CPRA where applicable, CalOPPA disclosure expectations, and app-store child safety rules.",
  },
  {
    region: "European Union / EEA and United Kingdom",
    policy:
      "GDPR/UK GDPR transparency, lawful basis, child consent rules, data subject rights, international transfer safeguards, and privacy-by-design obligations.",
  },
  {
    region: "Canada and New Zealand",
    policy:
      "PIPEDA/provincial privacy requirements, New Zealand Privacy Act cross-border and breach-notification expectations, and child-sensitive handling.",
  },
  {
    region: "Singapore and other international users",
    policy:
      "PDPA-style consent, access/correction, protection, retention, and transfer safeguards where local law applies.",
  },
] as const;

export const termsHighlights = [
  "Flourish is for parents and legal guardians who are at least 18 years old.",
  "Children do not create accounts or use the app independently.",
  "Parents must have authority to upload a child's memories and invite family members.",
  "Users keep ownership of their photos, videos, journals, and scrapbook content.",
  "No illegal, exploitative, abusive, or privacy-invasive content is allowed.",
  "Paid plans and gifts must be transparent and respect App Store, Google Play, and Australian Consumer Law rights.",
] as const;

export const privacyHighlights = [
  "We collect the minimum data needed to operate a private family scrapbook.",
  "We do not sell child data, run behavioural ads, or make public child profiles.",
  "Child data is handled as sensitive family information even when a law does not classify it as sensitive information.",
  "Parents can request access, correction, export, deletion, consent withdrawal, or account closure.",
  "We use Firebase security rules, Storage limits, device-only SecureStore settings, and recommended App Check enforcement.",
  "Cross-border processing may occur through cloud and app-store providers, with contractual and technical safeguards required.",
] as const;
