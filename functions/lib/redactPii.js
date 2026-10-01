const { DlpServiceClient } = require("@google-cloud/dlp");
const { getProjectId } = require("./config");

/**
 * InfoTypes inspected before any prompt is sent to the LLM.
 * Keep this list to official DLP names only — an unknown type fails the request.
 * @see https://cloud.google.com/sensitive-data-protection/docs/infotypes-reference
 */
const PII_INFO_TYPES = [
  { name: "EMAIL_ADDRESS" },
  { name: "PHONE_NUMBER" },
  { name: "PERSON_NAME" },
  { name: "STREET_ADDRESS" },
  { name: "DATE_OF_BIRTH" },
  { name: "CREDIT_CARD_NUMBER" },
  { name: "IBAN_CODE" },
  { name: "IP_ADDRESS" },
  { name: "PASSPORT" },
  { name: "MEDICAL_RECORD_NUMBER" },
  { name: "AUSTRALIA_MEDICARE_NUMBER" },
  { name: "AUSTRALIA_TAX_FILE_NUMBER" },
];

let defaultClient;

function getClient(client) {
  if (client) {
    return client;
  }
  if (!defaultClient) {
    defaultClient = new DlpServiceClient();
  }
  return defaultClient;
}

/**
 * Redact PII from text with Google Cloud DLP / Sensitive Data Protection.
 * Fail closed: if DLP does not return redacted text, the caller must not
 * send the original string to an LLM.
 *
 * @param {string} text
 * @param {{ client?: DlpServiceClient, projectId?: string }} [options]
 * @returns {Promise<string>}
 */
async function redactPii(text, options = {}) {
  if (typeof text !== "string") {
    throw new Error("DLP redaction requires a string.");
  }

  const projectId = options.projectId || getProjectId();
  const dlp = getClient(options.client);

  const [response] = await dlp.deidentifyContent({
    parent: `projects/${projectId}/locations/global`,
    item: { value: text },
    inspectConfig: {
      infoTypes: PII_INFO_TYPES,
      minLikelihood: "POSSIBLE",
      includeQuote: false,
    },
    deidentifyConfig: {
      infoTypeTransformations: {
        transformations: [
          {
            primitiveTransformation: {
              replaceWithInfoTypeConfig: {},
            },
          },
        ],
      },
    },
  });

  const redacted = response?.item?.value;
  if (typeof redacted !== "string") {
    throw new Error("DLP redaction failed: empty response.");
  }

  return redacted;
}

module.exports = {
  redactPii,
  PII_INFO_TYPES,
};
