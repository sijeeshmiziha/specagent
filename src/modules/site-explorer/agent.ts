/**
 * Site explorer entry points: run exploration and print summary.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { projectPath } from '../../lib/utils/paths.js';
import { crawlSite } from './crawler.js';
import type { SiteMap } from './types.js';

export interface RunSiteExplorerOptions {
  url: string;
  depth: number;
  maxPages: number;
  /** If true (default), write site_map.json to project root or outputDir when set */
  writeSiteMap?: boolean;
  /** When set, write site_map.json and snapshots under this dir (e.g. workspace.dir) */
  outputDir?: string;
  onProgress?: (line: string) => void;
}

export async function runSiteExplorer(options: RunSiteExplorerOptions): Promise<SiteMap> {
  const siteMap = await crawlSite(options.url, options.depth, options.maxPages, {
    onProgress: options.onProgress,
    outputDir: options.outputDir,
  });
  if (options.writeSiteMap !== false) {
    const file = options.outputDir
      ? path.join(options.outputDir, 'site_map.json')
      : projectPath('site_map.json');
    if (options.outputDir) mkdirSync(options.outputDir, { recursive: true });
    writeFileSync(file, JSON.stringify(siteMap, null, 2), 'utf8');
  }
  return siteMap;
}

export interface PrintSiteExplorerSummaryOptions {
  /** When set (e.g. workspace paths), summary shows these instead of project root */
  siteMapFile?: string;
  snapshotsDir?: string;
}

export function printSiteExplorerSummary(
  siteMap: SiteMap,
  options?: PrintSiteExplorerSummaryOptions
): void {
  const siteMapFile = options?.siteMapFile ?? projectPath('site_map.json');
  const snapshotsDir = options?.snapshotsDir ?? projectPath('snapshots');
  console.log();
  console.log('---');
  console.log(`total_pages:  ${siteMap.total_pages}`);
  console.log(`site_map:     ${siteMapFile}`);
  console.log(`screenshots:  ${snapshotsDir}/explore_*.png`);
  console.log('---');
  console.log();
  console.log('Page inventory:');
  for (const page of siteMap.pages) {
    const el = page.elements;
    const status = page.status_code != null ? `[${page.status_code}] ` : '';
    console.log(`  ${status}${page.url}`);
    if (page.title) console.log(`    title:     "${page.title}"`);
    if (Array.isArray(el.headings) && el.headings.length)
      console.log(`    headings:  ${JSON.stringify(el.headings)}`);
    if (Array.isArray(el.buttons) && el.buttons.length)
      console.log(`    buttons:   ${JSON.stringify(el.buttons)}`);
    if (Array.isArray(el.inputs) && el.inputs.length) {
      const inputsSummary = (el.inputs as object[]).map(i => {
        const o = i as Record<string, string>;
        return `${o.type}(${o.name || o.id || o.placeholder || '?'})`;
      });
      console.log(`    inputs:    ${inputsSummary}`);
    }
    if (Array.isArray(el.forms)) console.log(`    forms:     ${el.forms.length} form(s)`);
    console.log(`    links:     ${Array.isArray(el.links) ? el.links.length : 0} link(s)`);
    if (page.error) console.log(`    ERROR:     ${page.error}`);
    console.log();
  }
}
