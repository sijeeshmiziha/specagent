/**
 * agentqx_generate — Generate tests from site map (AI client provides the model).
 *
 * In MCP mode this is a "dumb" tool: it reads the site map, returns page data
 * so the AI client can generate tests and write them via agentqx_write_tests.
 */

import { existsSync, readFileSync } from 'node:fs';
import { z } from 'zod';
import { Workspace } from '../../../workspace/index.js';
import type { ToolRegistryEntry } from '../types.js';

export const generateTool: ToolRegistryEntry = {
  name: 'agentqx_generate',
  description:
    'Read the site map and return page data so you can generate Playwright tests. Use agentqx_write_tests to save the generated test files.',
  inputSchema: {
    url: z.string().describe('URL of the explored site (to locate the workspace)'),
  },
  handler: async raw => {
    const { url } = z.object({ url: z.string() }).parse(raw);
    const ws = new Workspace({ url });

    if (!existsSync(ws.siteMapFile)) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'No site map found. Run agentqx_explore first.' }),
          },
        ],
      };
    }

    const siteMap = JSON.parse(readFileSync(ws.siteMapFile, 'utf8')) as {
      start_url: string;
      pages: { url: string; title: string; elements: unknown }[];
    };

    const testFiles = ws.testFiles();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              status: 'ok',
              start_url: siteMap.start_url,
              total_pages: siteMap.pages.length,
              existing_test_files: testFiles.length,
              pages: siteMap.pages.map(p => ({
                url: p.url,
                title: p.title,
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
