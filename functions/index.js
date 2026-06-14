/**
 * Flourish — Cloud Functions
 *
 * Security notes
 * • No secrets are hard-coded. The reCAPTCHA Enterprise API key is provided via
 *   a Secret Manager secret (`RECAPTCHA_API_KEY`) — see functions/README.md.
 * • Inputs are validated and normalized before any external call or DB write.
 * • CORS is restricted to the Flourish web origins.
 * • `syncChildClaims` keeps a per-user `childIds` custom claim in sync with
 *   Firestore so Cloud Storage rules can enforce family-only access to media.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Secret Manager — set with: firebase functions:secrets:set RECAPTCHA_API_KEY
const RECAPTCHA_API_KEY = defineSecret("RECAPTCHA_API_KEY");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "flourish-7b8c8";
const RECAPTCHA_SITE_KEY = "6LcCFvgsAAAAAP705VabKOxOQO-jzNv1HUpte9c9";

const ALLOWED_ORIGINS = [
  "https://www.goflourish.com.au",
  "https://goflourish.com.au",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length === 0 || email.length > 254) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

exports.addWaitlistEmail = onRequest(
  { cors: ALLOWED_ORIGINS, secrets: [RECAPTCHA_API_KEY], maxInstances: 10 },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed." });
      }

      const body = req.body || {};
      const email = normalizeEmail(body.email);
      const recaptchaToken = body.recaptchaToken;

      if (!email) {
        return res.status(400).json({ error: "A valid email is required." });
      }
      if (typeof recaptchaToken !== "string" || recaptchaToken.length === 0) {
        return res.status(400).json({ error: "Missing security token." });
      }

      // Verify the token with Google reCAPTCHA Enterprise.
      const verifyUrl =
        `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}` +
        `/assessments?key=${RECAPTCHA_API_KEY.value()}`;

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

      const tokenValid =
        assessment &&
        assessment.tokenProperties &&
        assessment.tokenProperties.valid === true;
      const score =
        assessment &&
        assessment.riskAnalysis &&
        typeof assessment.riskAnalysis.score === "number"
          ? assessment.riskAnalysis.score
          : 0;

      if (!tokenValid || score < 0.5) {
        return res
          .status(403)
          .json({ error: "Security validation failed." });
      }

      // De-duplicate by email id so repeat submissions don't pile up.
      await db
        .collection("waitlist")
        .doc(Buffer.from(email).toString("base64url"))
        .set(
          {
            email,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

      return res.status(200).json({ message: "Successfully added to waitlist!" });
    } catch (error) {
      logger.error("addWaitlistEmail failed", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

/**
 * Keeps each user's `childIds` custom claim in sync with the children they are a
 * member of. Cloud Storage rules use this claim to grant family-only read access
 * to uploaded photos & videos.
 */
exports.syncChildClaims = onDocumentWritten(
  { document: "children/{childId}", maxInstances: 10 },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    const beforeMembers = Array.isArray(before?.members) ? before.members : [];
    const afterMembers = Array.isArray(after?.members) ? after.members : [];

    // Every user whose membership might have changed.
    const affected = new Set([...beforeMembers, ...afterMembers]);

    await Promise.all(
      [...affected].map(async (uid) => {
        if (typeof uid !== "string" || uid.length === 0) return;
        try {
          const snap = await db
            .collection("children")
            .where("members", "array-contains", uid)
            .get();
          const childIds = snap.docs.map((d) => d.id).slice(0, 100);

          const user = await admin.auth().getUser(uid);
          const existing = user.customClaims || {};
          await admin.auth().setCustomUserClaims(uid, {
            ...existing,
            childIds,
          });
        } catch (err) {
          logger.warn(`Failed to sync claims for ${uid}`, err);
        }
      }),
    );
  },
);
