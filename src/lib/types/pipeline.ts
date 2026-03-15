import { z } from 'zod';

export const pipelineInputSchema = {
  url: z
    .string()
    .url()
    .optional()
    .describe('Target site URL (required unless skipExplore is true)'),
  skipExplore: z
    .boolean()
    .optional()
    .default(false)
    .describe('Use existing site_map.json; skip crawl'),
  depth: z.number().int().min(0).optional().default(2),
  maxPages: z.number().int().min(1).optional().default(20),
  maxIterations: z.number().int().min(1).optional().default(10),
  model: z.string().optional().default('gpt-4o'),
};

export type PipelineInput = z.infer<z.ZodObject<typeof pipelineInputSchema>>;
