/**
 * agentqx_explore — Crawl a URL and produce a site map.
 */

import { z } from 'zod';
import { Workspace } from '../../../workspace/index.js';
import { runSiteExplorer } from '../../../../modules/site-explorer/agent.js';
import type { ToolRegistryEntry } from '../types.js';

export const exploreTool: ToolRegistryEntry = {
  name: 'agentqx_explore',
  description:
    'Crawl a URL and produce a site map with page structure, elements, and accessibility info. Returns the full site map data.',
  inputSchema: {
    url: z.string().describe('URL to crawl (must be http/https)'),
    depth: z.number().int().min(0).max(10).optional().default(2).describe('Max link-follow depth'),
    maxPages: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .default(25)
      .describe('Max pages to crawl'),
  },
  handler: async raw => {
    const { url, depth, maxPages } = z
      .object({
        url: z.string(),
        depth: z.number().int().optional().default(2),
        maxPages: z.number().int().optional().default(25),
      })
      .parse(raw);

    const ws = new Workspace({ url });
    ws.init();

    const siteMap = await runSiteExplorer({ url, depth, maxPages, outputDir: ws.dir });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              status: 'ok',
              total_pages: siteMap.total_pages,
              start_url: siteMap.start_url,
              pages: siteMap.pages.map(p => ({
                url: p.url,
                title: p.title,
                status_code: p.status_code,
                elements: p.elements,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  },
};
