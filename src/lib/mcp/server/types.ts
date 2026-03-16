import type { ZodTypeAny } from 'zod';

export type ToolHandler = (args: unknown) => Promise<{
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}>;

export interface ToolRegistryEntry {
  name: string;
  description: string;
  inputSchema: Record<string, ZodTypeAny>;
  handler: ToolHandler;
}
