/**
 * Ollama local model provider — uses OpenAI-compatible API.
 */

import OpenAI from 'openai';
import type { ChatMessage, ChatModel } from './types.js';

export interface CreateOllamaModelOptions {
  model?: string;
  baseUrl?: string;
}

export async function createOllamaModel(options: CreateOllamaModelOptions): Promise<ChatModel> {
  const model = options.model ?? 'llama3.1';
  const baseUrl = options.baseUrl ?? process.env.OLLAMA_HOST ?? 'http://localhost:11434';

  const client = new OpenAI({
    apiKey: 'ollama',
    baseURL: `${baseUrl}/v1`,
  });

  return {
    modelName: model,
    provider: 'ollama',
    async invoke(messages: ChatMessage[]): Promise<string> {
      const response = await client.chat.completions.create({
        model,
        temperature: 0.2,
        messages: messages.map(m => ({
          role: m.role as 'system' | 'user' | 'assistant',
          content: m.content,
        })),
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Ollama returned empty response');
      }
      return content;
    },
  };
}
