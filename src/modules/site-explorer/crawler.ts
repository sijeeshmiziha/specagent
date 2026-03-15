/**
 * Site crawling: visit pages breadth-first, collect elements and screenshots.
 */

import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { projectPath } from '../../lib/utils/paths.js';
import { collectAccessibilityTree, collectPageElements } from './scraper.js';
import type { CrawlOptions, PageInfo, SiteMap } from './types.js';

const PAGE_LOAD_TIMEOUT = 15_000;
const NAV_TIMEOUT = 10_000;

function sameOrigin(url: string, base: string): boolean {
  try {
    return new URL(url).origin === new URL(base).origin;
  } catch {
    return false;
  }
}

function urlToSlug(url: string, maxLen = 60): string {
  let slug = url.replace('://', '_').replace(/\//g, '_').replace(/\?/g, '_').replace(/=/g, '_');
  slug = slug.split('_').filter(Boolean).join('_');
  return slug.slice(0, maxLen);
}

export async function crawlSite(
  startUrl: string,
  maxDepth: number,
  maxPages: number,
  options: CrawlOptions
): Promise<SiteMap> {
  const snapshotsDir = options.outputDir
    ? path.join(options.outputDir, 'snapshots')
    : projectPath('snapshots');
  mkdirSync(snapshotsDir, { recursive: true });

  const visited = new Map<string, PageInfo>();
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
  const seen = new Set<string>([startUrl]);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });
  context.setDefaultNavigationTimeout(NAV_TIMEOUT);

  const log = options.onProgress ?? console.log;

  try {
    while (queue.length > 0 && visited.size < maxPages) {
      const next = queue.shift();
      if (!next) break;
      const { url, depth } = next;
      const pageInfo: PageInfo = {
        url,
        depth,
        title: '',
        status_code: null,
        elements: {},
        accessibility_tree: null,
        child_urls: [],
        screenshot: '',
        error: null,
      };

      const page = await context.newPage();
      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: PAGE_LOAD_TIMEOUT,
        });
        if (response) pageInfo.status_code = response.status();
        pageInfo.title = await page.title();

        const slug = urlToSlug(url);
        const screenshotPath = path.join(snapshotsDir, `explore_${slug}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        pageInfo.screenshot = screenshotPath;

        pageInfo.elements = await collectPageElements(page);
        pageInfo.accessibility_tree = await collectAccessibilityTree(page);

        const childUrls: string[] = [];
        const linkList = (pageInfo.elements.links as { href: string }[]) || [];
        for (const link of linkList) {
          let fullUrl: string;
          try {
            fullUrl = new URL(link.href, url).href.split('#')[0];
          } catch {
            continue;
          }
          if (fullUrl && sameOrigin(fullUrl, startUrl) && !seen.has(fullUrl) && depth < maxDepth) {
            seen.add(fullUrl);
            queue.push({ url: fullUrl, depth: depth + 1 });
            childUrls.push(fullUrl);
          }
        }
        pageInfo.child_urls = childUrls.slice(0, 10);
      } catch (exc) {
        pageInfo.error = exc instanceof Error ? exc.message : String(exc);
      } finally {
        await page.close();
      }

      visited.set(url, pageInfo);
      const statusStr = pageInfo.status_code != null ? `[${pageInfo.status_code}]` : '';
      const errorStr = pageInfo.error ? ` ERROR: ${pageInfo.error}` : '';
      log(
        `  [${String(visited.size).padStart(3)}/${maxPages}] depth=${depth} ` +
          `${statusStr} ${url} — "${pageInfo.title}"${errorStr}`
      );
    }
  } finally {
    await browser.close();
  }

  return {
    start_url: startUrl,
    total_pages: visited.size,
    pages: [...visited.values()],
  };
}
