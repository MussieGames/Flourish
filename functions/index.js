const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const RECAPTCHA_SITE_KEY = "6LcCFvgsAAAAAP705VabKOxOQO-jzNv1HUpte9c9";
const PROJECT_ID = "flourish-7b8c8";
const SENDGRID_TEMPLATE_ID = "d-d05b9e636230405b9b39b4362dc44174";
const MIN_RECAPTCHA_SCORE = 0.5;
const ALLOWED_ORIGINS = [
  "https://www.goflourish.com.au",
  "https://goflourish.com.au",
];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyRecaptcha(recaptchaToken) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY || "AIzaSyBN-XRhWhKbZ0Adh5q6Xq6PBL9ggpYztag";
  const verifyUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${apiKey}`;

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

  if (!verificationResponse.ok) {
    console.error("reCAPTCHA API error:", assessment);
    return { valid: false, score: 0 };
  }

  const valid =
    assessment.tokenProperties?.valid === true &&
    assessment.tokenProperties?.action === "SUBMIT" &&
    (assessment.riskAnalysis?.score ?? 0) >= MIN_RECAPTCHA_SCORE;

  return {
    valid,
    score: assessment.riskAnalysis?.score ?? 0,
  };
}

exports.addWaitlistEmail = onRequest(
  {
    cors: ALLOWED_ORIGINS,
    region: "australia-southeast1",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed." });
    }

    try {
      const { email, recaptchaToken, page, source, userAgent } = req.body || {};

      if (!email || !recaptchaToken) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ error: "Invalid email address." });
      }

      const recaptcha = await verifyRecaptcha(recaptchaToken);
      if (!recaptcha.valid) {
        return res.status(403).json({ error: "Security validation failed. Bot detected." });
      }

      const existing = await db
        .collection("waitlist")
        .where("email", "==", normalizedEmail)
        .limit(1)
        .get();

      if (!existing.empty) {
        return res.status(200).json({ message: "Successfully added to waitlist!" });
      }

      await db.collection("waitlist").add({
        email: normalizedEmail,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        page: page || "unknown",
        source: source || null,
        userAgent: userAgent || null,
        recaptchaScore: recaptcha.score,
      });

      await db.collection("auto_reply").add({
        to: normalizedEmail,
        template: {
          templateId: SENDGRID_TEMPLATE_ID,
          data: {
            email: normalizedEmail,
          },
        },
      });

      return res.status(200).json({ message: "Successfully added to waitlist!" });
    } catch (error) {
      console.error("addWaitlistEmail error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
);
