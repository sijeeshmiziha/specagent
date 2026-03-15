/**
 * Page element scraping and accessibility tree capture.
 */

import type { Page } from 'playwright';
import type { AccessibilityNode } from './types.js';

export async function collectPageElements(page: Page): Promise<Record<string, unknown>> {
  const elements: Record<string, unknown> = {};

  const buttons = await page
    .locator(
      "button, [role='button'], input[type='submit'], input[type='button'], input[type='reset']"
    )
    .all();
  elements.buttons = [];
  for (const b of buttons) {
    if (await b.isVisible()) {
      const t = ((await b.innerText()) || '').slice(0, 100).trim();
      (elements.buttons as string[]).push(t);
    }
  }

  const linkEls = await page.locator('a[href]').all();
  const links: { text: string; href: string }[] = [];
  for (const a of linkEls.slice(0, 50)) {
    const href = (await a.getAttribute('href')) || '';
    if (
      href.startsWith('javascript:') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    )
      continue;
    links.push({
      text: ((await a.innerText()) || '').slice(0, 80).trim(),
      href,
    });
  }
  elements.links = links;

  const inputEls = await page.locator("input:not([type='hidden']), textarea, select").all();
  elements.inputs = [];
  for (const i of inputEls) {
    if (!(await i.isVisible())) continue;
    (elements.inputs as object[]).push({
      type: (await i.getAttribute('type')) || 'text',
      name: (await i.getAttribute('name')) || '',
      id: (await i.getAttribute('id')) || '',
      placeholder: (await i.getAttribute('placeholder')) || '',
      aria_label: (await i.getAttribute('aria-label')) || '',
    });
  }

  const formEls = await page.locator('form').all();
  elements.forms = [];
  for (const f of formEls) {
    (elements.forms as object[]).push({
      action: (await f.getAttribute('action')) || '',
      method: ((await f.getAttribute('method')) || 'get').toUpperCase(),
      id: (await f.getAttribute('id')) || '',
    });
  }

  const headingEls = await page.locator('h1, h2, h3').all();
  const headings: string[] = [];
  for (const h of headingEls) {
    if (headings.length >= 10) break;
    if (await h.isVisible()) headings.push(((await h.innerText()) || '').slice(0, 100).trim());
  }
  elements.headings = headings;

  const landmarkEls = await page
    .locator(
      "[role='navigation'], [role='main'], [role='banner'], [role='dialog'], nav, main, header, footer"
    )
    .all();
  const landmarkSet = new Set<string>();
  for (const el of landmarkEls) {
    if (!(await el.isVisible())) continue;
    const role = await el.getAttribute('role');
    const tag = await el.evaluate<string, { tagName: string }>(e => e.tagName.toLowerCase());
    landmarkSet.add(role || tag);
  }
  elements.landmarks = [...landmarkSet];

  return elements;
}

export async function collectAccessibilityTree(page: Page): Promise<AccessibilityNode | null> {
  try {
    const ariaSnapshot = await page.locator('body').ariaSnapshot({ timeout: 5000 });
    if (!ariaSnapshot) return null;
    return parseAriaSnapshot(ariaSnapshot);
  } catch {
    return null;
  }
}

/** Parse Playwright's ARIA snapshot format into structured nodes. */
function parseAriaSnapshot(snapshot: string): AccessibilityNode {
  const lines = snapshot.split('\n').filter(l => l.trim());
  const root: AccessibilityNode = { role: 'document', name: 'body', children: [] };

  for (const line of lines.slice(0, 100)) {
    const trimmed = line.trimStart();
    const match = /^- (\w+)(?:\s+"([^"]*)")?/.exec(trimmed);
    if (match) {
      const [, role, name] = match;
      root.children?.push({ role, name: name ?? '' });
    }
  }

  return root;
}
