import { describe, expect, it } from 'vitest';
import {
  urlToPageSlug,
  slugToCamelCase,
  slugToClassName,
} from '../../src/modules/generate-suite/slug-utils.js';

describe('urlToPageSlug', () => {
  it('returns "home" when path is same as base', () => {
    expect(urlToPageSlug('https://example.com/', 'https://example.com')).toBe('home');
    expect(urlToPageSlug('https://example.com', 'https://example.com/')).toBe('home');
  });

  it('returns hyphenated alphanumeric slug for path segments', () => {
    expect(urlToPageSlug('https://example.com/about-us', 'https://example.com')).toBe('about-us');
    expect(urlToPageSlug('https://example.com/dashboard/settings', 'https://example.com')).toBe(
      'dashboard-settings'
    );
  });

  it('strips non-alphanumeric and lowercases', () => {
    const slug = urlToPageSlug('https://example.com/Recover-Initiate', 'https://example.com');
    expect(slug).toBe('recover-initiate');
  });

  it('limits to 50 characters', () => {
    const long = 'a'.repeat(60);
    const slug = urlToPageSlug(`https://example.com/${long}`, 'https://example.com');
    expect(slug.length).toBeLessThanOrEqual(50);
  });

  it('returns "page" for invalid URL', () => {
    expect(urlToPageSlug('not-a-url', 'https://example.com')).toBe('page');
  });
});

describe('slugToCamelCase', () => {
  it('converts hyphenated to camelCase', () => {
    expect(slugToCamelCase('recover-initiate')).toBe('recoverInitiate');
  });

  it('handles single segment', () => {
    expect(slugToCamelCase('home')).toBe('home');
  });

  it('handles multiple hyphens', () => {
    expect(slugToCamelCase('about-us-page')).toBe('aboutUsPage');
  });
});

describe('slugToClassName', () => {
  it('converts slug to PascalCase with Page suffix', () => {
    expect(slugToClassName('about-us')).toBe('AboutUsPage');
  });

  it('handles single word', () => {
    expect(slugToClassName('home')).toBe('HomePage');
  });
});
