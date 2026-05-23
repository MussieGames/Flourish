const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// Initialize the Admin SDK to allow writing to Firestore securely
admin.initializeApp();
const db = admin.firestore();

exports.addWaitlistEmail = onRequest({ cors: true }, async (req, res) => {
  try {
    const { email, recaptchaToken } = req.body;

    if (!email || !recaptchaToken) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Verify the token with Google reCAPTCHA Enterprise API
    const projectID = "flourish-7b8c8"; 
    const apiKey = "AIzaSyBN-XRhWhKbZ0Adh5q6Xq6PBL9ggpYztag"; 
    const verifyUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;

    const verificationResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: {
          token: recaptchaToken,
          siteKey: "6LcCFvgsAAAAAP705VabKOxOQO-jzNv1HUpte9c9",
          expectedAction: "SUBMIT"
        }
      })
    });

    const assessment = await verificationResponse.json();

    // Check if the token is valid and score is acceptable (0.0 is a bot, 1.0 is a human)
    if (!assessment.tokenProperties || !assessment.tokenProperties.valid || assessment.riskAnalysis.score < 0.5) {
      return res.status(403).json({ error: "Security validation failed. Bot detected." });
    }

    // Google verified it's a human. Write to database.
    await db.collection("waitlist").add({
      email: email,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ message: "Successfully added to waitlist!" });

  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
});
