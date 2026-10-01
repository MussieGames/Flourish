const { redactPii } = require("./redactPii");

/**
 * Sequential pipeline body (extracted so tests can inject fakes).
 * 1) DLP redacts PII
 * 2) Caller-supplied generate() sends the redacted prompt to Vertex + Model Armor
 * 3) Sanitized model text is returned
 */
async function runSecureAiPipelineSteps(prompt, deps = {}) {
  const redact = deps.redact || redactPii;
  const generate = deps.generate;

  if (typeof generate !== "function") {
    throw new Error("A generate function is required.");
  }

  const redactedPrompt = await redact(prompt);
  const response = await generate(redactedPrompt);
  const output = typeof response?.text === "string" ? response.text : "";
  return { output };
}

module.exports = { runSecureAiPipelineSteps };
