const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

describe("AI pipeline config", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GCLOUD_PROJECT;
    delete process.env.GCP_PROJECT;
    delete process.env.FIREBASE_CONFIG;
    delete process.env.VERTEX_LOCATION;
    delete process.env.MODEL_ARMOR_LOCATION;
    delete process.env.MODEL_ARMOR_TEMPLATE;
    delete process.env.MODEL_ARMOR_TEMPLATE_ID;
    delete process.env.MODEL_ARMOR_API_ENDPOINT;
    delete process.env.GEMINI_MODEL;
    delete require.cache[require.resolve("./config")];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    delete require.cache[require.resolve("./config")];
  });

  it("builds a Model Armor template path and regional endpoint", () => {
    process.env.GCLOUD_PROJECT = "flourish-test";
    const {
      getModelArmorTemplateName,
      getModelArmorApiEndpoint,
      getGeminiModel,
      getVertexLocation,
    } = require("./config");

    assert.equal(
      getModelArmorTemplateName(),
      "projects/flourish-test/locations/us-central1/templates/flourish-secure-ai"
    );
    assert.equal(
      getModelArmorApiEndpoint(),
      "modelarmor.us-central1.rep.googleapis.com"
    );
    assert.equal(getGeminiModel(), "gemini-2.5-flash");
    assert.equal(getVertexLocation(), "australia-southeast1");
  });

  it("honors an explicit Model Armor template resource name", () => {
    process.env.MODEL_ARMOR_TEMPLATE =
      "projects/x/locations/europe-west1/templates/custom";
    const { getModelArmorTemplateName } = require("./config");

    assert.equal(
      getModelArmorTemplateName(),
      "projects/x/locations/europe-west1/templates/custom"
    );
  });
});
