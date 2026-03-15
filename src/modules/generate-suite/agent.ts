import { existsSync, readFileSync } from 'node:fs';
import type { ChatModel } from '../../lib/models/types.js';
import { createModel } from '../../lib/models/provider-registry.js';
import type { Workspace } from '../../lib/workspace/index.js';
import { runSiteExplorer } from '../site-explorer/agent.js';
import type { PageEl } from './types.js';
import { generateMultiFile } from './multi-file.js';

export interface RunGenerateSuiteOptions {
  url?: string;
  skipExplore: boolean;
  depth: number;
  maxPages: number;
  model: string;
  chatModel?: ChatModel;
  workspace: Workspace;
}

export async function runGenerateSuite(options: RunGenerateSuiteOptions): Promise<void> {
  const { workspace } = options;
  const siteMapPath = workspace.siteMapFile;

  let startUrl = options.url;
  if (!options.skipExplore) {
    if (!startUrl || !/^https?:\/\//i.test(startUrl)) {
      throw new Error('URL required unless skipExplore (http(s) URL for crawl).');
    }
    console.log('Generate suite — running explorer...');
    await runSiteExplorer({
      url: startUrl,
      depth: options.depth,
      maxPages: options.maxPages,
      outputDir: workspace.dir,
    });
  } else {
    startUrl = startUrl || loadStartUrlFromSiteMap(siteMapPath);
    console.log(`Generate suite — skip explore, TARGET_URL will be ${startUrl}`);
  }

  if (!existsSync(siteMapPath)) {
    throw new Error(`Missing ${siteMapPath}`);
  }

  const siteMap = JSON.parse(readFileSync(siteMapPath, 'utf8')) as {
    start_url: string;
    pages: {
      url: string;
      title: string;
      status_code: number | null;
      elements: PageEl;
      error: string | null;
    }[];
  };

  if (!siteMap.pages?.length) {
    throw new Error('site_map.json has no pages.');
  }

  const effectiveStart = siteMap.start_url || startUrl;
  const model = options.chatModel ?? (await createModel({ model: options.model }));

  console.log('  Generating multi-file test suite...');
  await generateMultiFile({
    workspace,
    pages: siteMap.pages.map(p => ({
      url: p.url,
      title: p.title,
      elements: p.elements as unknown as Record<string, unknown>,
    })),
    baseUrl: effectiveStart,
    model,
  });
  console.log('  Test suite generation complete.');
}

function loadStartUrlFromSiteMap(siteMapPath: string): string {
  if (!existsSync(siteMapPath)) {
    throw new Error(`Missing ${siteMapPath}. Run with a URL first or run explorer manually.`);
  }
  const raw = JSON.parse(readFileSync(siteMapPath, 'utf8')) as { start_url?: string };
  if (!raw.start_url) {
    throw new Error('site_map.json has no start_url.');
  }
  return raw.start_url;
}
