const assert = require("node:assert/strict");
const test = require("node:test");
const {
  EXPECTED_RECAPTCHA_ACTION,
  MIN_RECAPTCHA_SCORE,
  evaluateRecaptchaAssessment,
} = require("./recaptcha");

function assessment({
  valid = true,
  action = EXPECTED_RECAPTCHA_ACTION,
  score = MIN_RECAPTCHA_SCORE,
  invalidReason,
  hostname = "www.goflourish.com.au",
} = {}) {
  return {
    tokenProperties: {
      valid,
      action,
      invalidReason,
      hostname,
    },
    riskAnalysis: {
      score,
    },
  };
}

test("accepts a valid token for the expected action at the minimum score", () => {
  const result = evaluateRecaptchaAssessment(assessment());

  assert.equal(result.valid, true);
  assert.equal(result.reason, "ok");
});

test("rejects a valid token when the action is missing", () => {
  const missingActionAssessment = assessment();
  delete missingActionAssessment.tokenProperties.action;

  const result = evaluateRecaptchaAssessment(missingActionAssessment);

  assert.equal(result.valid, false);
  assert.equal(result.reason, "action_mismatch");
});

test("rejects a valid token for the wrong action", () => {
  const result = evaluateRecaptchaAssessment(assessment({ action: "LOGIN" }));

  assert.equal(result.valid, false);
  assert.equal(result.reason, "action_mismatch");
});

test("rejects a valid token below the score threshold", () => {
  const result = evaluateRecaptchaAssessment(
    assessment({ score: MIN_RECAPTCHA_SCORE - 0.01 })
  );

  assert.equal(result.valid, false);
  assert.equal(result.reason, "low_score");
});

test("rejects invalid tokens before action and score checks", () => {
  const result = evaluateRecaptchaAssessment(
    assessment({ valid: false, action: "LOGIN", score: 1, invalidReason: "EXPIRED" })
  );

  assert.equal(result.valid, false);
  assert.equal(result.reason, "EXPIRED");
});
