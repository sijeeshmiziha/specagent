/**
 * OpenAI chat model provider.
 */

import OpenAI from 'openai';
import type { ChatMessage, ChatModel } from './types.js';

export interface CreateOpenAIModelOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export async function createOpenAIModel(options: CreateOpenAIModelOptions): Promise<ChatModel> {
  const model = options.model ?? 'gpt-4o';
  const client = new OpenAI({
    apiKey: options.apiKey,
    ...(options.baseUrl ? { baseURL: options.baseUrl } : {}),
  });

  return {
    modelName: model,
    provider: 'openai',
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
        throw new Error('OpenAI returned empty response');
      }
      return content;
    },
  };
}
