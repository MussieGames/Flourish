const crypto = require("crypto");

function waitlistDocumentId(normalizedEmail) {
  return crypto.createHash("sha256").update(normalizedEmail).digest("hex");
}

function buildWaitlistRecord({
  admin,
  normalizedEmail,
  page,
  source,
  userAgent,
  recaptchaScore,
}) {
  return {
    email: normalizedEmail,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    page: page || "unknown",
    source: source || null,
    userAgent: userAgent || null,
    recaptchaScore,
  };
}

function buildConfirmationEmailRecord(normalizedEmail, templateId) {
  return {
    to: normalizedEmail,
    template: {
      templateId,
      data: {
        email: normalizedEmail,
      },
    },
  };
}

async function persistWaitlistSignup({
  db,
  admin,
  normalizedEmail,
  page,
  source,
  userAgent,
  recaptchaScore,
  sendgridTemplateId,
}) {
  const waitlistCollection = db.collection("waitlist");
  const autoReplyCollection = db.collection("auto_reply");

  const [existingWaitlist, existingConfirmation] = await Promise.all([
    waitlistCollection.where("email", "==", normalizedEmail).limit(1).get(),
    autoReplyCollection.where("to", "==", normalizedEmail).limit(1).get(),
  ]);

  const needsWaitlist = existingWaitlist.empty;
  const needsConfirmation = existingConfirmation.empty;

  if (!needsWaitlist && !needsConfirmation) {
    return {
      waitlistCreated: false,
      confirmationEnqueued: false,
    };
  }

  const docId = waitlistDocumentId(normalizedEmail);
  const batch = db.batch();

  if (needsWaitlist) {
    batch.set(
      waitlistCollection.doc(docId),
      buildWaitlistRecord({
        admin,
        normalizedEmail,
        page,
        source,
        userAgent,
        recaptchaScore,
      }),
      { merge: true }
    );
  }

  if (needsConfirmation) {
    batch.set(
      autoReplyCollection.doc(docId),
      buildConfirmationEmailRecord(normalizedEmail, sendgridTemplateId),
      { merge: true }
    );
  }

  await batch.commit();

  return {
    waitlistCreated: needsWaitlist,
    confirmationEnqueued: needsConfirmation,
  };
}

module.exports = {
  buildConfirmationEmailRecord,
  buildWaitlistRecord,
  persistWaitlistSignup,
  waitlistDocumentId,
};
