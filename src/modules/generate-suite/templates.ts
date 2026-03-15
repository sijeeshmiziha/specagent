/**
 * Deterministic POM templates — no LLM calls.
 *
 * These generate the scaffolding files (BasePage, fixtures, test-data)
 * that don't need AI to produce.
 */

import { urlToPageSlug, slugToCamelCase } from './slug-utils.js';

/** Info about a generated page object (used only by templates). */
interface PageObjectInfo {
  slug: string;
  url: string;
  title: string;
  filePath: string;
  className: string;
}

/** Generate the BasePage class that all page objects extend. */
export function generateBasePage(_baseUrl: string): string {
  return `import { type Locator, type Page } from '@playwright/test';

/**
 * BasePage — shared base for all page objects.
 * Every page object extends this and adds page-specific locators and actions.
 */
export abstract class BasePage {
  readonly page: Page;
  abstract readonly url: string;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to this page's URL. */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** Wait for the page to be in a loaded state. */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Navigate and wait for load. */
  async gotoAndWait(): Promise<void> {
    await this.goto();
    await this.waitForLoad();
  }

  /** Get the page title. */
  async title(): Promise<string> {
    return this.page.title();
  }

  /** Get a locator by role. */
  getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.page.getByRole(role, options);
  }

  /** Get a locator by text. */
  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  /** Get a locator by label. */
  getByLabel(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByLabel(text, options);
  }
}
`;
}

/** Generate the fixtures.ts file with test.extend() wiring page objects. */
export function generateFixtures(baseUrl: string, pageImports: PageObjectInfo[]): string {
  const imports = pageImports
    .map(p => `import { ${p.className} } from './pages/${p.slug}.page.js';`)
    .join('\n');

  const fixtureTypes = pageImports
    .map(p => `  ${slugToCamelCase(p.slug)}Page: ${p.className};`)
    .join('\n');

  const fixtureDefinitions = pageImports
    .map(
      p =>
        `  ${slugToCamelCase(p.slug)}Page: async ({ page }, use) => {\n` +
        `    await use(new ${p.className}(page));\n` +
        `  },`
    )
    .join('\n');

  return `import { test as base } from '@playwright/test';
${imports}

export const TARGET_URL = ${JSON.stringify(baseUrl)};

interface PageFixtures {
${fixtureTypes}
}

export const test = base.extend<PageFixtures>({
${fixtureDefinitions}
});

export { expect } from '@playwright/test';
`;
}

/** Generate the test-data.ts file with shared constants from the site map. */
export function generateTestData(siteMap: {
  start_url: string;
  pages: { url: string; title: string }[];
}): string {
  const pageEntries = siteMap.pages
    .map(p => {
      const slug = urlToPageSlug(p.url, siteMap.start_url);
      return `  ${JSON.stringify(slug)}: {\n    url: ${JSON.stringify(p.url)},\n    title: ${JSON.stringify(p.title)},\n  },`;
    })
    .join('\n');

  return `/**
 * Shared test data extracted from site map.
 * Auto-generated — do not edit manually.
 */

export const TARGET_URL = ${JSON.stringify(siteMap.start_url)};

export const PAGES: Record<string, { url: string; title: string }> = {
${pageEntries}
};

export const PAGE_URLS = Object.values(PAGES).map(p => p.url);
`;
}

export { urlToPageSlug } from './slug-utils.js';
export { slugToClassName } from './slug-utils.js';
