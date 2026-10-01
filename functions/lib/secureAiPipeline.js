const { genkit, z } = require("genkit");
const { vertexAI } = require("@genkit-ai/google-genai");
const { modelArmor } = require("@genkit-ai/google-cloud/model-armor");
const { onCallGenkit } = require("firebase-functions/https");
const { runSecureAiPipelineSteps } = require("./runSecureAiPipelineSteps");
const {
  getProjectId,
  getVertexLocation,
  getGeminiModel,
  getModelArmorTemplateName,
  getModelArmorApiEndpoint,
} = require("./config");

const FUNCTION_REGION = "australia-southeast1";
const MAX_PROMPT_LENGTH = 8000;

const ai = genkit({
  plugins: [vertexAI({ location: getVertexLocation() })],
});

const SecureAiPipelineInputSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "prompt is required")
    .max(MAX_PROMPT_LENGTH, `prompt must be at most ${MAX_PROMPT_LENGTH} characters`),
});

const SecureAiPipelineOutputSchema = z.object({
  output: z.string(),
});

async function generateWithModelArmor(redactedPrompt) {
  return ai.generate({
    model: vertexAI.model(getGeminiModel()),
    prompt: redactedPrompt,
    use: [
      modelArmor({
        templateName: getModelArmorTemplateName(getProjectId()),
        protectionTarget: "all",
        clientOptions: {
          apiEndpoint: getModelArmorApiEndpoint(),
        },
      }),
    ],
  });
}

const secureAiPipelineFlow = ai.defineFlow(
  {
    name: "secureAiPipeline",
    inputSchema: SecureAiPipelineInputSchema,
    outputSchema: SecureAiPipelineOutputSchema,
  },
  async ({ prompt }) =>
    runSecureAiPipelineSteps(prompt, { generate: generateWithModelArmor })
);

const secureAiPipeline = onCallGenkit(
  {
    enforceAppCheck: true,
    region: FUNCTION_REGION,
    timeoutSeconds: 120,
    memory: "1GiB",
    authPolicy: (auth) => Boolean(auth?.uid),
  },
  secureAiPipelineFlow
);

module.exports = {
  secureAiPipeline,
  secureAiPipelineFlow,
  runSecureAiPipelineSteps,
  generateWithModelArmor,
};
