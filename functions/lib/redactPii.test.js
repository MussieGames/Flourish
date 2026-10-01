const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { redactPii, PII_INFO_TYPES } = require("./redactPii");

describe("redactPii", () => {
  it("calls DLP deidentifyContent and returns the redacted string", async () => {
    const calls = [];
    const client = {
      async deidentifyContent(request) {
        calls.push(request);
        return [{ item: { value: "Hello [EMAIL_ADDRESS]" } }];
      },
    };

    const result = await redactPii("Hello jane@example.com", {
      client,
      projectId: "flourish-test",
    });

    assert.equal(result, "Hello [EMAIL_ADDRESS]");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].parent, "projects/flourish-test/locations/global");
    assert.equal(calls[0].item.value, "Hello jane@example.com");
    assert.equal(calls[0].inspectConfig.minLikelihood, "POSSIBLE");
    assert.deepEqual(calls[0].inspectConfig.infoTypes, PII_INFO_TYPES);
    assert.deepEqual(
      calls[0].deidentifyConfig.infoTypeTransformations.transformations[0]
        .primitiveTransformation,
      { replaceWithInfoTypeConfig: {} }
    );
  });

  it("fails closed when DLP returns no redacted text", async () => {
    const client = {
      async deidentifyContent() {
        return [{}];
      },
    };

    await assert.rejects(
      () => redactPii("secret", { client, projectId: "flourish-test" }),
      /empty response/
    );
  });

  it("rejects non-string input before calling DLP", async () => {
    const client = {
      async deidentifyContent() {
        throw new Error("DLP should not be called");
      },
    };

    await assert.rejects(
      () => redactPii(null, { client }),
      /requires a string/
    );
  });
});
