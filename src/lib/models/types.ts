export interface ChatMessage {
  role: string;
  content: string;
}

/** Minimal chat completion surface — provider-agnostic. */
export interface ChatModel {
  readonly modelName: string;
  readonly provider: ProviderName;
  invoke(messages: ChatMessage[]): Promise<string>;
}

export type ProviderName = 'anthropic' | 'openai' | 'gemini' | 'ollama';

export interface ProviderConfig {
  provider: ProviderName;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}
