const { onRequest } = require("firebase-functions/v2/https");
const { RecaptchaEnterpriseServiceClient } = require("@google-cloud/recaptcha-enterprise");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const recaptchaClient = new RecaptchaEnterpriseServiceClient();

const RECAPTCHA_SITE_KEY = "6Lfef0UtAAAAAIJMlp0Ls7nGKcZfninytqC9gDBC";
const PROJECT_ID = "flourish-7b8c8";
const SERVICE_ACCOUNT = "firebase-adminsdk-fbsvc@flourish-7b8c8.iam.gserviceaccount.com";
const SENDGRID_TEMPLATE_ID = "d-d05b9e636230405b9b39b4362dc44174";
const MIN_RECAPTCHA_SCORE = 0.1;
const MAX_WAITLIST_FUNCTION_INSTANCES = 10;
const ALLOWED_ORIGINS = [
  "https://www.goflourish.com.au",
  "https://goflourish.com.au",
];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyRecaptcha(recaptchaToken, userAgent, userIpAddress) {
  const projectPath = recaptchaClient.projectPath(PROJECT_ID);

  const [assessment] = await recaptchaClient.createAssessment({
    parent: projectPath,
    assessment: {
      event: {
        token: recaptchaToken,
        siteKey: RECAPTCHA_SITE_KEY,
        userAgent: userAgent || undefined,
        userIpAddress: userIpAddress || undefined,
      },
    },
  });

  const score = assessment.riskAnalysis?.score ?? 0;
  const tokenValid = assessment.tokenProperties?.valid === true;
  const action = assessment.tokenProperties?.action;
  const invalidReason = assessment.tokenProperties?.invalidReason || null;
  const actionMatch = !action || action === "SUBMIT";

  console.log("reCAPTCHA assessment:", {
    valid: tokenValid,
    action,
    score,
    invalidReason,
    hostname: assessment.tokenProperties?.hostname,
  });

  const valid = tokenValid && actionMatch && score >= MIN_RECAPTCHA_SCORE;

  return {
    valid,
    score,
    hostname: assessment.tokenProperties?.hostname || null,
    reason: !tokenValid
      ? invalidReason || "invalid_token"
      : !actionMatch
        ? "action_mismatch"
        : score < MIN_RECAPTCHA_SCORE
          ? "low_score"
          : "ok",
  };
}

exports.addWaitlistEmail = onRequest(
  {
    cors: ALLOWED_ORIGINS,
    region: "australia-southeast1",
    serviceAccount: SERVICE_ACCOUNT,
    maxInstances: MAX_WAITLIST_FUNCTION_INSTANCES,
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

      const userIpAddress =
        req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
        req.ip ||
        undefined;

      let recaptcha;
      try {
        recaptcha = await verifyRecaptcha(recaptchaToken, userAgent, userIpAddress);
      } catch (verifyError) {
        console.error("reCAPTCHA verify exception:", verifyError);
        return res.status(403).json({
          error: "Security validation failed. Bot detected.",
          reason: "api_error",
        });
      }

      if (!recaptcha.valid) {
        console.warn("reCAPTCHA rejected:", recaptcha.reason, "score:", recaptcha.score);
        return res.status(403).json({
          error: "Security validation failed.",
        });
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
