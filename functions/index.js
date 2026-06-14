const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize the Admin SDK to allow writing to Firestore securely
admin.initializeApp();
const db = admin.firestore();

// ─────────────────────────────────────────────────────────────────────────
// Configuration is read from environment variables (set via functions/.env or
// `firebase functions:secrets`) — never hard-coded. This keeps the reCAPTCHA
// Enterprise API key out of source control.
//
//   GCLOUD_PROJECT is provided automatically by the Functions runtime.
//   RECAPTCHA_API_KEY   → Google Cloud API key with access to the
//                         reCAPTCHA Enterprise API (KEEP SECRET).
//   RECAPTCHA_SITE_KEY  → public site key used by the web client.
// ─────────────────────────────────────────────────────────────────────────
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY;
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;

// Restrict cross-origin access to the marketing site (and local development).
const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?goflourish\.com\.au$/,
  /^https:\/\/flourish-7b8c8\.web\.app$/,
  /^https:\/\/flourish-7b8c8\.firebaseapp\.com$/,
  /^http:\/\/localhost(:\d+)?$/,
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

exports.addWaitlistEmail = onRequest(
  { cors: ALLOWED_ORIGINS, region: "us-central1", maxInstances: 10 },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed." });
      }

      if (!RECAPTCHA_API_KEY || !RECAPTCHA_SITE_KEY || !PROJECT_ID) {
        logger.error("Missing reCAPTCHA configuration env vars.");
        return res.status(500).json({ error: "Server is not configured." });
      }

      const body = req.body || {};
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const recaptchaToken =
        typeof body.recaptchaToken === "string" ? body.recaptchaToken : "";

      // Validate input before doing any work.
      if (!email || !recaptchaToken) {
        return res.status(400).json({ error: "Missing required fields." });
      }
      if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
      }

      // Verify the token with Google reCAPTCHA Enterprise API.
      const verifyUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${RECAPTCHA_API_KEY}`;

      const verificationResponse = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: {
            token: recaptchaToken,
            siteKey: RECAPTCHA_SITE_KEY,
            expectedAction: "SUBMIT",
          },
        }),
      });

      const assessment = await verificationResponse.json();

      // Require a valid token and a human-like score (0.0 bot → 1.0 human).
      const valid =
        assessment &&
        assessment.tokenProperties &&
        assessment.tokenProperties.valid &&
        assessment.riskAnalysis &&
        typeof assessment.riskAnalysis.score === "number" &&
        assessment.riskAnalysis.score >= 0.5;

      if (!valid) {
        return res.status(403).json({ error: "Security validation failed." });
      }

      // De-duplicate by using the email as the document id (idempotent).
      await db
        .collection("waitlist")
        .doc(email)
        .set(
          {
            email,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      return res.status(200).json({ message: "Successfully added to waitlist!" });
    } catch (error) {
      logger.error("addWaitlistEmail failed", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
);
