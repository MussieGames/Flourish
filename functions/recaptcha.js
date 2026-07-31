const EXPECTED_RECAPTCHA_ACTION = "SUBMIT";
const MIN_RECAPTCHA_SCORE = 0.3;

function evaluateRecaptchaAssessment(assessment) {
  const tokenProperties = assessment?.tokenProperties || {};
  const score = assessment?.riskAnalysis?.score ?? 0;
  const tokenValid = tokenProperties.valid === true;
  const action = tokenProperties.action;
  const invalidReason = tokenProperties.invalidReason || null;
  const actionMatch = action === EXPECTED_RECAPTCHA_ACTION;

  return {
    valid: tokenValid && actionMatch && score >= MIN_RECAPTCHA_SCORE,
    score,
    action,
    hostname: tokenProperties.hostname || null,
    reason: !tokenValid
      ? invalidReason || "invalid_token"
      : !actionMatch
        ? "action_mismatch"
        : score < MIN_RECAPTCHA_SCORE
          ? "low_score"
          : "ok",
  };
}

module.exports = {
  EXPECTED_RECAPTCHA_ACTION,
  MIN_RECAPTCHA_SCORE,
  evaluateRecaptchaAssessment,
};
