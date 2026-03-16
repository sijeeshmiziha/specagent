export type { ChatMessage, ChatModel, ProviderName, ProviderConfig } from './types.js';
export { createAnthropicModel } from './anthropic.js';
export type { CreateAnthropicModelOptions } from './anthropic.js';
export { createOpenAIModel } from './openai.js';
export type { CreateOpenAIModelOptions } from './openai.js';
export { createGeminiModel } from './gemini.js';
export type { CreateGeminiModelOptions } from './gemini.js';
export { createOllamaModel } from './ollama.js';
export type { CreateOllamaModelOptions } from './ollama.js';
export {
  detectProvider,
  resolveProviderConfig,
  createModelFromConfig,
  createModel,
} from './provider-registry.js';

/** Remove optional markdown fences from LLM output. */
export function stripCodeFence(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:ts|typescript)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return cleaned;
}
