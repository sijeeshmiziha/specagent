import type { PageEl } from './types.js';

const MAX_PAGES_IN_PROMPT = 25;
const MAX_LINKS_PER_PAGE = 25;

export function summarizeSiteMapForPrompt(
  siteMap: {
    start_url: string;
    pages: {
      url: string;
      title: string;
      status_code: number | null;
      elements: PageEl;
      error: string | null;
    }[];
  },
  startUrl: string
): string {
  let origin: string;
  try {
    origin = new URL(startUrl).origin;
  } catch {
    origin = '';
  }

  const slice = siteMap.pages.slice(0, MAX_PAGES_IN_PROMPT);
  const pages = slice.map(
    (p: {
      url: string;
      title: string;
      status_code: number | null;
      elements: PageEl;
      accessibility_tree?: unknown;
      error: string | null;
    }) => {
      const el = p.elements || {};
      const links = (el.links || []).slice(0, MAX_LINKS_PER_PAGE).map(l => {
        let full = l.href;
        try {
          full = new URL(l.href, p.url).href.split('#')[0];
        } catch {
          /* keep href */
        }
        const sameOrigin =
          Boolean(origin) &&
          (() => {
            try {
              return new URL(full).origin === origin;
            } catch {
              return false;
            }
          })();
        return {
          text: (l.text || '').slice(0, 80),
          href: full.slice(0, 500),
          same_origin: sameOrigin,
        };
      });
      return {
        url: p.url,
        title: p.title,
        status_code: p.status_code,
        error: p.error,
        headings: (el.headings || []).slice(0, 10),
        buttons: (el.buttons || []).slice(0, 15),
        links,
        inputs: (el.inputs || []).slice(0, 12),
        forms: (el.forms || []).slice(0, 5),
        landmarks: (el.landmarks || []).slice(0, 8),
        ...(p.accessibility_tree ? { accessibility_tree: p.accessibility_tree } : {}),
      };
    }
  );

  const payload = {
    start_url: startUrl,
    total_pages_in_map: siteMap.pages.length,
    pages_in_prompt: pages.length,
    pages,
    instructions:
      'Build tests using same-origin navigation where links.same_origin is true. ' +
      'For each page with no error, add at least one test (e.g. title or main heading). ' +
      'Use the accessibility_tree when available to derive precise getByRole() locators with ARIA names. ' +
      'Do not submit external forms or rely on third-party pages.',
  };

  let text = JSON.stringify(payload, null, 2);
  if (siteMap.pages.length > MAX_PAGES_IN_PROMPT) {
    text += `\n\n... ${siteMap.pages.length - MAX_PAGES_IN_PROMPT} additional pages exist; focus on listed pages.`;
  }
  return text;
}

export function buildGenerateSuiteSystemPrompt(startUrl: string): string {
  return (
    'You are an expert Playwright Test engineer (TypeScript).\n\n' +
    'Generate a complete tests/test_suite.spec.ts file from the site map JSON below.\n\n' +
    'Requirements:\n' +
    '- Start with the standard header comment block (file is THE agent-edited suite).\n' +
    '- export const TARGET_URL = ' +
    JSON.stringify(startUrl) +
    ' (exact string).\n' +
    '- import { expect, test } from "@playwright/test";\n' +
    '- Use test() and expect(); never page.waitForTimeout() or sleep.\n' +
    '- ALWAYS prefer getByRole, getByLabel, getByText over CSS selectors. Use the accessibility_tree to find correct ARIA roles and names.\n' +
    '- Each test independent; descriptive test titles.\n' +
    '- Include baseline: homepage loads (goto TARGET_URL), page has visible heading or content.\n' +
    '- Add tests per discovered page URL: goto that URL, assert title or visible heading/text from the map.\n' +
    '- For same-origin links: optional tests that click a link and expect URL or content (keep tests stable).\n' +
    '- Skip pages with errors in the map unless testing error resilience.\n' +
    '- Do not test external domains.\n' +
    '- Return ONLY the full TypeScript source — no markdown fences, no explanation.\n'
  );
}

export function buildGenerateSuiteUserPrompt(summaryJson: string): string {
  return (
    'Site map (JSON):\n\n```json\n' +
    summaryJson.slice(0, 120_000) +
    '\n```\n\nReturn the complete test_suite.spec.ts.'
  );
}
