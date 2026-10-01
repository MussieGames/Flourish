const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

describe("runSecureAiPipelineSteps", () => {
  it("redacts PII before calling the model and returns sanitized output", async () => {
    const events = [];
    const { runSecureAiPipelineSteps } = require("./runSecureAiPipelineSteps");

    const result = await runSecureAiPipelineSteps("Hi jane@example.com", {
      async redact(prompt) {
        events.push(`redact:${prompt}`);
        return "Hi [EMAIL_ADDRESS]";
      },
      async generate(redactedPrompt) {
        events.push(`generate:${redactedPrompt}`);
        return { text: "Sanitized reply" };
      },
    });

    assert.deepEqual(events, [
      "redact:Hi jane@example.com",
      "generate:Hi [EMAIL_ADDRESS]",
    ]);
    assert.deepEqual(result, { output: "Sanitized reply" });
  });

  it("does not call the model when DLP fails", async () => {
    const { runSecureAiPipelineSteps } = require("./runSecureAiPipelineSteps");
    let generateCalled = false;

    await assert.rejects(
      () =>
        runSecureAiPipelineSteps("secret", {
          async redact() {
            throw new Error("DLP redaction failed: empty response.");
          },
          async generate() {
            generateCalled = true;
            return { text: "should not run" };
          },
        }),
      /DLP redaction failed/
    );
    assert.equal(generateCalled, false);
  });
});
