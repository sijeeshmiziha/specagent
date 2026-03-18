import { describe, expect, it } from 'vitest';
import { stripCodeFence } from '../../src/lib/models/index.js';

describe('stripCodeFence', () => {
  it('returns string unchanged when no fences', () => {
    const text = 'const x = 1;';
    expect(stripCodeFence(text)).toBe(text);
  });

  it('strips ts code fence', () => {
    const wrapped = '```ts\nconst x = 1;\n```';
    expect(stripCodeFence(wrapped)).toBe('const x = 1;');
  });

  it('strips typescript code fence', () => {
    const wrapped = '```typescript\nconst x = 1;\n```';
    expect(stripCodeFence(wrapped)).toBe('const x = 1;');
  });

  it('trims leading and trailing whitespace', () => {
    expect(stripCodeFence('  \nconst x = 1;\n  ')).toBe('const x = 1;');
  });

  it('handles empty string', () => {
    expect(stripCodeFence('')).toBe('');
  });

  it('handles fence with no language tag', () => {
    const wrapped = '```\ncode\n```';
    const result = stripCodeFence(wrapped);
    expect(result).toBe('code');
  });
});
