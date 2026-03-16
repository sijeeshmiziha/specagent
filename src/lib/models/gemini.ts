/**
 * Google Gemini chat model provider.
 */

import { GoogleGenAI } from '@google/genai';
import type { ChatMessage, ChatModel } from './types.js';

export interface CreateGeminiModelOptions {
  apiKey: string;
  model?: string;
}

export async function createGeminiModel(options: CreateGeminiModelOptions): Promise<ChatModel> {
  const model = options.model ?? 'gemini-2.5-flash';
  const client = new GoogleGenAI({ apiKey: options.apiKey });

  return {
    modelName: model,
    provider: 'gemini',
    async invoke(messages: ChatMessage[]): Promise<string> {
      const systemMessages = messages.filter(m => m.role === 'system');
      const nonSystemMessages = messages.filter(m => m.role !== 'system');

      const contents = nonSystemMessages.map(m => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.content }],
      }));

      const response = await client.models.generateContent({
        model,
        contents,
        config: {
          ...(systemMessages.length > 0
            ? { systemInstruction: systemMessages.map(m => m.content).join('\n\n') }
            : {}),
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini returned empty response');
      }
      return text;
    },
  };
}
