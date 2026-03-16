/**
 * Multi-file test generation — one spec file per page/feature.
 *
 * Generates:
 *   tests/fixtures.ts       — shared base URL, helpers
 *   tests/homepage.spec.ts  — homepage tests
 *   tests/<slug>.spec.ts    — per-page tests
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { ChatModel } from '../../lib/models/types.js';
import { stripCodeFence } from '../../lib/models/index.js';
import type { Workspace } from '../../lib/workspace/index.js';

interface PageData {
  url: string;
  title: string;
  elements: Record<string, unknown>;
  accessibility_tree?: unknown;
}

function urlToFileName(url: string, baseUrl: string): string {
  try {
    const parsed = new URL(url);
    const base = new URL(baseUrl);
    let pathname = parsed.pathname.replace(base.pathname, '');
    if (!pathname || pathname === '/') return 'homepage';
    pathname = pathname.replace(/^\//, '').replace(/\/$/, '');
    return (
      pathname
        .replace(/\//g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .slice(0, 50) || 'page'
    );
  } catch {
    return 'page';
  }
}

function buildFixturesFile(baseUrl: string): string {
  return `import { test as base } from '@playwright/test';

export const TARGET_URL = ${JSON.stringify(baseUrl)};

export const test = base.extend<{ targetUrl: string }>({
  targetUrl: async ({}, use) => {
    await use(TARGET_URL);
  },
});

export { expect } from '@playwright/test';
`;
}

function buildPageTestPrompt(page: PageData, baseUrl: string): string {
  const accessibilityInfo = page.accessibility_tree
    ? `\nAccessibility tree:\n${JSON.stringify(page.accessibility_tree, null, 2).slice(0, 10_000)}`
    : '';

  return (
    `Generate a Playwright test file for this page:\n` +
    `URL: ${page.url}\n` +
    `Title: ${page.title}\n` +
    `Elements: ${JSON.stringify(page.elements, null, 2).slice(0, 10_000)}\n` +
    accessibilityInfo +
    `\n\nBase URL: ${baseUrl}\n\n` +
    `Rules:\n` +
    `- import { test, expect } from './fixtures.js'\n` +
    `- import { TARGET_URL } from './fixtures.js'\n` +
    `- Use getByRole, getByLabel, getByText — NEVER CSS class selectors\n` +
    `- Each test must be independent\n` +
    `- Include: page loads, title/heading visible, key elements present\n` +
    `- If the page has forms, add a test verifying form fields exist\n` +
    `- If the page has navigation links, add a test clicking one same-origin link\n` +
    `- Return ONLY TypeScript code — no markdown fences, no explanation\n`
  );
}

const SYSTEM_PROMPT =
  'You are an expert Playwright Test engineer (TypeScript). ' +
  'Generate a focused test file for a single page. ' +
  'Use accessibility-first locators (getByRole, getByLabel, getByText). ' +
  'Return ONLY the complete TypeScript file — no markdown, no explanation.';

export interface GenerateMultiFileOptions {
  workspace: Workspace;
  pages: PageData[];
  baseUrl: string;
  model: ChatModel;
  maxConcurrent?: number;
}

export async function generateMultiFile(options: GenerateMultiFileOptions): Promise<string[]> {
  const { workspace, pages, baseUrl, model } = options;
  const testsDir = workspace.testsDir;
  mkdirSync(testsDir, { recursive: true });

  // Write shared fixtures
  const fixturesPath = path.join(testsDir, 'fixtures.ts');
  writeFileSync(fixturesPath, buildFixturesFile(baseUrl), 'utf8');
  console.log(`  Wrote ${fixturesPath}`);

  const writtenFiles: string[] = [fixturesPath];

  // Generate one file per page
  for (const page of pages) {
    const fileName = urlToFileName(page.url, baseUrl);
    const filePath = path.join(testsDir, `${fileName}.spec.ts`);

    console.log(`  Generating tests for ${page.url} → ${fileName}.spec.ts`);

    try {
      const prompt = buildPageTestPrompt(page, baseUrl);
      const result = await model.invoke([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]);

      const cleaned = stripCodeFence(result);
      if (cleaned.includes('test(') || cleaned.includes('test.describe(')) {
        writeFileSync(filePath, cleaned, 'utf8');
        writtenFiles.push(filePath);
        console.log(`  Wrote ${filePath}`);
      } else {
        console.log(`  Skipped ${fileName} — output didn't look like a test file`);
      }
    } catch (e) {
      console.log(`  Failed to generate ${fileName}: ${e instanceof Error ? e.message : e}`);
    }
  }

  return writtenFiles;
}
