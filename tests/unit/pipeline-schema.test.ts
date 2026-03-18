import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { pipelineInputSchema } from '../../src/lib/types/pipeline.js';

const schema = z.object(pipelineInputSchema);

describe('pipelineInputSchema', () => {
  it('accepts minimal valid input and applies defaults', () => {
    const result = schema.parse({ url: 'https://example.com' });
    expect(result.url).toBe('https://example.com');
    expect(result.skipExplore).toBe(false);
    expect(result.depth).toBe(2);
    expect(result.maxPages).toBe(20);
    expect(result.maxIterations).toBe(10);
    expect(result.model).toBe('gpt-4o');
  });

  it('accepts full valid input', () => {
    const input = {
      url: 'https://test.com',
      skipExplore: true,
      depth: 1,
      maxPages: 5,
      maxIterations: 3,
      model: 'gpt-4-turbo',
    };
    const result = schema.parse(input);
    expect(result).toEqual(input);
  });

  it('allows omit url when skipExplore is true', () => {
    const result = schema.parse({ skipExplore: true });
    expect(result.skipExplore).toBe(true);
    expect(result.url).toBeUndefined();
  });

  it('rejects invalid url', () => {
    expect(() => schema.parse({ url: 'not-a-url' })).toThrow();
  });

  it('rejects invalid types', () => {
    expect(() => schema.parse({ depth: 'two' })).toThrow();
    expect(() => schema.parse({ maxPages: -1 })).toThrow();
  });
});
