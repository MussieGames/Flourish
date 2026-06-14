const crypto = require("crypto");
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const RECAPTCHA_ENTERPRISE_API_KEY = defineSecret("RECAPTCHA_ENTERPRISE_API_KEY");
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "flourish-7b8c8";
const RECAPTCHA_SITE_KEY = "6LcCFvgsAAAAAP705VabKOxOQO-jzNv1HUpte9c9";
const ALLOWED_ORIGINS = [
  "https://www.goflourish.com.au",
  "https://goflourish.com.au",
  "https://flourish-7b8c8.web.app",
  "https://flourish-7b8c8.firebaseapp.com"
];

function addSecurityHeaders(res) {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.set("Cache-Control", "no-store");
}

function normalizeEmail(email) {
  if (typeof email !== "string") {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }

  const normalized = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

  if (!valid || normalized.length > 254) {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }

  return normalized;
}

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function getClientIp(req) {
  const forwardedFor = req.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.ip || "unknown";
}

function statusForHttpsError(error) {
  if (error.code === "resource-exhausted") {
    return 429;
  }
  if (error.code === "permission-denied" || error.code === "unauthenticated") {
    return 403;
  }
  return 400;
}

async function assertRateLimit(identifier, maxPerHour) {
  const docId = hashValue(identifier);
  const docRef = db.collection("rateLimits").doc(docId);
  const now = admin.firestore.Timestamp.now();
  const windowMs = 60 * 60 * 1000;

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);
    const data = snapshot.exists ? snapshot.data() : null;
    const windowStart = data?.windowStart;
    const count = typeof data?.count === "number" ? data.count : 0;
    const insideWindow =
      windowStart &&
      now.toMillis() - windowStart.toMillis() < windowMs;

    if (insideWindow && count >= maxPerHour) {
      throw new HttpsError("resource-exhausted", "Too many attempts. Please try again later.");
    }

    transaction.set(docRef, {
      count: insideWindow ? count + 1 : 1,
      windowStart: insideWindow ? windowStart : now,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });
}

async function verifyRecaptchaEnterprise(token, expectedAction) {
  if (!token || typeof token !== "string") {
    return false;
  }

  const apiKey = RECAPTCHA_ENTERPRISE_API_KEY.value();
  const verifyUrl =
    `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${apiKey}`;

  const verificationResponse = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: {
        token,
        siteKey: RECAPTCHA_SITE_KEY,
        expectedAction
      }
    })
  });

  if (!verificationResponse.ok) {
    logger.warn("reCAPTCHA Enterprise request failed", {
      status: verificationResponse.status
    });
    return false;
  }

  const assessment = await verificationResponse.json();
  const validToken = assessment.tokenProperties?.valid === true;
  const score = assessment.riskAnalysis?.score ?? 0;
  return validToken && score >= 0.7;
}

async function writeWaitlistEmail(email, source, uid) {
  const emailHash = hashValue(email);
  const docRef = db.collection("waitlist").doc(emailHash);
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);
    const payload = {
      email,
      emailHash,
      source,
      uid: uid || null,
      updatedAt: now
    };

    if (!snapshot.exists) {
      payload.createdAt = now;
    }

    transaction.set(docRef, payload, { merge: true });
  });

  logger.info("Waitlist email recorded", { emailHash, source });
}

exports.addWaitlistEmail = onRequest({
  cors: ALLOWED_ORIGINS,
  maxInstances: 10,
  secrets: [RECAPTCHA_ENTERPRISE_API_KEY]
}, async (req, res) => {
  addSecurityHeaders(res);

  try {
    if (req.method !== "POST") {
      res.set("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed." });
    }

    const { email, recaptchaToken } = req.body;

    const normalizedEmail = normalizeEmail(email);
    await assertRateLimit(`web:${getClientIp(req)}`, 20);
    const recaptchaOk = await verifyRecaptchaEnterprise(recaptchaToken, "SUBMIT");
    if (!recaptchaOk) {
      return res.status(403).json({ error: "Security validation failed." });
    }

    await writeWaitlistEmail(normalizedEmail, "web", null);

    return res.status(200).json({ message: "Successfully added to waitlist." });
  } catch (error) {
    if (error instanceof HttpsError) {
      return res.status(statusForHttpsError(error)).json({ error: error.message });
    }

    logger.error("addWaitlistEmail failed", {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ error: "Internal server error." });
  }
});

exports.addMobileWaitlistEmail = onCall({
  consumeAppCheckToken: true,
  enforceAppCheck: true,
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in before joining the waitlist.");
  }

  const normalizedEmail = normalizeEmail(request.data?.email);
  await assertRateLimit(`mobile:${request.auth.uid}`, 20);
  await writeWaitlistEmail(normalizedEmail, "mobile", request.auth.uid);

  return { ok: true };
});
