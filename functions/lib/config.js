/**
 * Shared runtime config for the secure AI pipeline.
 * Credentials come from Application Default Credentials — never from the client.
 */

function parseFirebaseConfig() {
  if (!process.env.FIREBASE_CONFIG) {
    return null;
  }
  try {
    return JSON.parse(process.env.FIREBASE_CONFIG);
  } catch {
    return null;
  }
}

function getProjectId() {
  return (
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    parseFirebaseConfig()?.projectId ||
    "flourish-7b8c8"
  );
}

function getVertexLocation() {
  return process.env.VERTEX_LOCATION || "australia-southeast1";
}

function getModelArmorLocation() {
  return process.env.MODEL_ARMOR_LOCATION || "us-central1";
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

function getModelArmorTemplateName(projectId = getProjectId()) {
  if (process.env.MODEL_ARMOR_TEMPLATE) {
    return process.env.MODEL_ARMOR_TEMPLATE;
  }
  const location = getModelArmorLocation();
  const templateId = process.env.MODEL_ARMOR_TEMPLATE_ID || "flourish-secure-ai";
  return `projects/${projectId}/locations/${location}/templates/${templateId}`;
}

function getModelArmorApiEndpoint() {
  return (
    process.env.MODEL_ARMOR_API_ENDPOINT ||
    `modelarmor.${getModelArmorLocation()}.rep.googleapis.com`
  );
}

module.exports = {
  getProjectId,
  getVertexLocation,
  getModelArmorLocation,
  getGeminiModel,
  getModelArmorTemplateName,
  getModelArmorApiEndpoint,
};
