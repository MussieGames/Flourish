const crypto = require("crypto");
const { logger } = require("firebase-functions");
const { defineSecret, defineString } = require("firebase-functions/params");
const { HttpsError, onCall, onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const recaptchaApiKey = defineSecret("RECAPTCHA_ENTERPRISE_API_KEY");
const rateLimitSalt = defineSecret("WAITLIST_RATE_LIMIT_SALT");
const recaptchaProjectId = defineString("RECAPTCHA_PROJECT_ID");
const recaptchaSiteKey = defineString("RECAPTCHA_SITE_KEY");

const allowedOrigins = [
  "https://www.goflourish.com.au",
  "https://goflourish.com.au",
  "http://localhost:19006",
  "http://localhost:8081",
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rateLimitWindowMs = 60 * 60 * 1000;
const maxSubmissionsPerWindow = 5;

const ctaBloomTrialMonths = 3;
const heirloomBloomIncludedMonths = 12;

function addMonthsIso(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next.toISOString();
}

function buildSubscriptionEntitlement(tier, provider = "demo") {
  const now = new Date();

  if (tier === "bloom") {
    const bloomAccessUntilIso = addMonthsIso(now, ctaBloomTrialMonths);
    return {
      tier: "bloom",
      status: "trialing",
      source: "in_app_bloom",
      provider,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAtIso: bloomAccessUntilIso,
      bloomAccessUntilIso,
    };
  }

  if (tier === "heirloom") {
    const bloomAccessUntilIso = addMonthsIso(now, heirloomBloomIncludedMonths);
    return {
      tier: "heirloom",
      status: "active",
      source: "in_app_heirloom",
      provider,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAtIso: bloomAccessUntilIso,
      bloomAccessUntilIso,
    };
  }

  throw new HttpsError("invalid-argument", "Unsupported subscription tier.");
}

async function verifyPurchaseWithProvider({ tier, provider }) {
  // Production hook:
  // Validate App Store / Google Play receipts here, then return the verified
  // provider transaction id. Keeping this function isolated makes future tier
  // automation simple without allowing direct client entitlement writes.
  if (!["bloom", "heirloom"].includes(tier)) {
    throw new HttpsError("invalid-argument", "Unsupported subscription tier.");
  }

  if (provider !== "demo") {
    throw new HttpsError("failed-precondition", "Payment provider verification is not configured.");
  }

  return `demo-${tier}-${Date.now()}`;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function getClientIp(req) {
  const forwardedFor = req.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || "unknown";
}

function normalizeEmail(email) {
  if (typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !emailPattern.test(normalized)) {
    return null;
  }

  return normalized;
}

async function enforceRateLimit(req) {
  const ipHash = sha256(`${getClientIp(req)}:${rateLimitSalt.value()}`);
  const rateLimitRef = db.collection("waitlistRateLimits").doc(ipHash);
  const now = Date.now();

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(rateLimitRef);
    const data = snapshot.exists ? snapshot.data() : {};
    const resetAtMillis = data.resetAt?.toMillis?.() ?? 0;
    const currentCount = resetAtMillis > now ? data.count || 0 : 0;

    if (currentCount >= maxSubmissionsPerWindow) {
      const error = new Error("Too many submissions. Please try again later.");
      error.code = "rate-limit";
      throw error;
    }

    transaction.set(
      rateLimitRef,
      {
        count: currentCount + 1,
        resetAt: admin.firestore.Timestamp.fromMillis(now + rateLimitWindowMs),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
}

async function verifyRecaptcha(recaptchaToken) {
  const projectId = recaptchaProjectId.value();
  const siteKey = recaptchaSiteKey.value();
  const apiKey = recaptchaApiKey.value();

  if (!projectId || !siteKey || !apiKey) {
    logger.error("reCAPTCHA Enterprise configuration is incomplete.");
    throw new Error("Security validation is not configured.");
  }

  const verifyUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;
  const verificationResponse = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: {
        token: recaptchaToken,
        siteKey,
        expectedAction: "SUBMIT",
      },
    }),
  });

  if (!verificationResponse.ok) {
    logger.warn("reCAPTCHA Enterprise returned a non-OK response.", {
      status: verificationResponse.status,
    });
    return false;
  }

  const assessment = await verificationResponse.json();
  const tokenProperties = assessment.tokenProperties;
  const score = assessment.riskAnalysis?.score ?? 0;

  return Boolean(
    tokenProperties?.valid &&
      tokenProperties.action === "SUBMIT" &&
      score >= 0.7,
  );
}

exports.addWaitlistEmail = onRequest(
  {
    cors: allowedOrigins,
    maxInstances: 10,
    secrets: [recaptchaApiKey, rateLimitSalt],
    timeoutSeconds: 15,
  },
  async (req, res) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Content-Type-Options", "nosniff");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      res.set("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed." });
    }

    if (!req.is("application/json")) {
      return res.status(415).json({ error: "Use application/json." });
    }

  try {
    const { email, recaptchaToken } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof recaptchaToken !== "string" || recaptchaToken.length < 20) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    await enforceRateLimit(req);
    if (!(await verifyRecaptcha(recaptchaToken))) {
      return res.status(403).json({ error: "Security validation failed." });
    }

    const emailHash = sha256(`${normalizedEmail}:${rateLimitSalt.value()}`);
    await db.collection("waitlist").doc(emailHash).set(
      {
        email: normalizedEmail,
        emailHash,
        lastSubmittedAt: admin.firestore.FieldValue.serverTimestamp(),
        source: "website",
      },
      { merge: true },
    );

    return res.status(200).json({ message: "Successfully added to waitlist!" });

  } catch (error) {
    if (error.code === "rate-limit") {
      return res.status(429).json({ error: error.message });
    }

    logger.error("Failed to add waitlist email.", { error: error.message });
    return res.status(500).json({ error: "Internal server error." });
  }
});

exports.confirmSubscription = onCall(
  {
    maxInstances: 10,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in before subscribing.");
    }

    const tier = request.data?.tier;
    const provider = request.data?.provider || "demo";
    const providerTransactionId = await verifyPurchaseWithProvider({ tier, provider });
    const subscription = {
      ...buildSubscriptionEntitlement(tier, provider),
      providerTransactionId,
    };

    await db.collection("users").doc(request.auth.uid).set(
      {
        subscription,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await db.collection("subscriptionEvents").add({
      uid: request.auth.uid,
      tier,
      provider,
      providerTransactionId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      subscription: {
        ...subscription,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  },
);
