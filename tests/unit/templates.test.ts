import { describe, expect, it } from 'vitest';
import {
  generateBasePage,
  generateFixtures,
  generateTestData,
} from '../../src/modules/generate-suite/templates.js';

describe('generateBasePage', () => {
  it('output includes BasePage and key methods', () => {
    const out = generateBasePage('https://example.com');
    expect(out).toContain('BasePage');
    expect(out).toContain('goto');
    expect(out).toContain('waitForLoad');
    expect(out).toContain('getByRole');
    expect(out).toContain('getByText');
    expect(out).toContain('getByLabel');
  });
});

describe('generateFixtures', () => {
  it('output includes TARGET_URL and test.extend', () => {
    const baseUrl = 'https://example.com';
    const pageImports = [
      {
        slug: 'about-us',
        url: 'https://example.com/about-us',
        title: 'About',
        filePath: '',
        className: 'AboutUsPage',
      },
    ];
    const out = generateFixtures(baseUrl, pageImports);
    expect(out).toContain('TARGET_URL');
    expect(out).toContain(baseUrl);
    expect(out).toContain('base.extend');
    expect(out).toContain('AboutUsPage');
    expect(out).toContain('aboutUsPage');
    expect(out).toContain("from './pages/about-us.page.js'");
  });
});

describe('generateTestData', () => {
  it('output includes TARGET_URL, PAGES, PAGE_URLS', () => {
    const siteMap = {
      start_url: 'https://example.com',
      pages: [
        { url: 'https://example.com/', title: 'Home' },
        { url: 'https://example.com/about', title: 'About' },
      ],
    };
    const out = generateTestData(siteMap);
    expect(out).toContain('TARGET_URL');
    expect(out).toContain('https://example.com');
    expect(out).toContain('PAGES');
    expect(out).toContain('PAGE_URLS');
  });

  it('handles empty pages array', () => {
    const siteMap = { start_url: 'https://example.com', pages: [] };
    const out = generateTestData(siteMap);
    expect(out).toContain('PAGES: Record<string, { url: string; title: string }> = {');
    expect(out).toContain('PAGE_URLS = Object.values(PAGES)');
  });
});
