/**
 * Provider registry — auto-detects available LLM providers from env vars.
 */

import type { ChatModel, ProviderConfig, ProviderName } from './types.js';
import { createAnthropicModel } from './anthropic.js';
import { createOpenAIModel } from './openai.js';
import { createGeminiModel } from './gemini.js';
import { createOllamaModel } from './ollama.js';

const DEFAULT_MODELS: Record<ProviderName, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o',
  gemini: 'gemini-2.5-flash',
  ollama: 'llama3.1',
};

/** Detect the best available provider from environment. */
export function detectProvider(): ProviderName | null {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OLLAMA_HOST) return 'ollama';

  return null;
}

/** Resolve a provider config from explicit options + environment. */
export function resolveProviderConfig(options?: {
  provider?: ProviderName;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}): ProviderConfig {
  const provider = options?.provider ?? detectProvider();
  if (!provider) {
    throw new Error(
      'No LLM provider detected. Set one of:\n' +
        '  ANTHROPIC_API_KEY      → Claude\n' +
        '  OPENAI_API_KEY         → OpenAI\n' +
        '  GOOGLE_API_KEY / GEMINI_API_KEY → Gemini\n' +
        '  OLLAMA_HOST            → Ollama (local)\n' +
        'Or pass --provider explicitly.'
    );
  }

  const model = options?.model ?? DEFAULT_MODELS[provider];

  let apiKey = options?.apiKey;
  if (!apiKey) {
    switch (provider) {
      case 'anthropic':
        apiKey = process.env.ANTHROPIC_API_KEY;
        break;
      case 'openai':
        apiKey = process.env.OPENAI_API_KEY;
        break;
      case 'gemini':
        apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
        break;
      case 'ollama':
        apiKey = 'ollama';
        break;
    }
  }

  return {
    provider,
    model,
    apiKey,
    baseUrl: options?.baseUrl,
  };
}

/** Create a ChatModel from a ProviderConfig. */
export async function createModelFromConfig(config: ProviderConfig): Promise<ChatModel> {
  const apiKey = config.apiKey ?? '';
  switch (config.provider) {
    case 'anthropic':
      return createAnthropicModel({
        apiKey,
        model: config.model,
      });
    case 'openai':
      return createOpenAIModel({
        apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
      });
    case 'gemini':
      return createGeminiModel({
        apiKey,
        model: config.model,
      });
    case 'ollama':
      return createOllamaModel({
        model: config.model,
        baseUrl: config.baseUrl,
      });
  }
}

/** One-shot: detect provider, create model. */
export async function createModel(options?: {
  provider?: ProviderName;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}): Promise<ChatModel> {
  const config = resolveProviderConfig(options);
  console.log(`Using ${config.provider} provider (model: ${config.model})`);
  return createModelFromConfig(config);
}
