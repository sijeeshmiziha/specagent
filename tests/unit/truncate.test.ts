import { describe, expect, it } from 'vitest';
import { truncateTail } from '../../src/lib/utils/truncate.js';

describe('truncateTail', () => {
  it('returns string as-is when shorter than maxLen', () => {
    const text = 'short';
    expect(truncateTail(text, 10)).toBe(text);
  });

  it('returns string as-is when exactly maxLen', () => {
    const text = 'exact5';
    expect(truncateTail(text, 6)).toBe(text);
  });

  it('returns suffix with omitted message when longer than maxLen', () => {
    const text = '0123456789';
    const result = truncateTail(text, 4);
    expect(result).toContain('[...6 characters omitted from start...]');
    expect(result).toContain('6789');
    expect(result).not.toContain('0123');
  });

  it('handles empty string', () => {
    expect(truncateTail('', 5)).toBe('');
  });
});
