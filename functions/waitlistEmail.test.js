const assert = require("node:assert/strict");
const { test } = require("node:test");

const { buildConfirmationEmail } = require("./waitlistEmail");

test("builds a SendGrid dynamic template email document for Trigger Email", () => {
  const doc = buildConfirmationEmail(
    "parent@example.com",
    "d-d05b9e636230405b9b39b4362dc44174"
  );

  assert.deepEqual(doc, {
    to: "parent@example.com",
    message: {},
    sendGrid: {
      templateId: "d-d05b9e636230405b9b39b4362dc44174",
      dynamicTemplateData: {
        email: "parent@example.com",
      },
    },
  });
  assert.equal(Object.hasOwn(doc, "template"), false);
});
