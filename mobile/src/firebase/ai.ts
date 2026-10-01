import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './config';

const FUNCTIONS_REGION = 'australia-southeast1';

export type SecureAiPipelineInput = {
  prompt: string;
};

export type SecureAiPipelineOutput = {
  output: string;
};

/**
 * The only client entry point for AI / LLM features.
 * Routes every prompt through the centralized `secureAiPipeline` Genkit flow
 * (DLP PII redaction → Vertex AI Gemini with Model Armor). Never call a
 * model SDK from the app and never send API keys to the client.
 */
export async function runSecureAiPipeline(prompt: string): Promise<string> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new Error('A prompt is required.');
  }

  const functions = getFunctions(app, FUNCTIONS_REGION);
  const callPipeline = httpsCallable<
    SecureAiPipelineInput,
    SecureAiPipelineOutput
  >(functions, 'secureAiPipeline');

  const { data } = await callPipeline({ prompt: trimmed });
  return data.output;
}
