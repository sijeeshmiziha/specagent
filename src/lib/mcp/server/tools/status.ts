/**
 * agentqx_status — Get current status: pass/fail counts and list of test files.
 */

import { existsSync } from 'node:fs';
import { z } from 'zod';
import { loadTestStats } from '../../../utils/playwright-report.js';
import { Workspace } from '../../../workspace/index.js';
import type { ToolRegistryEntry } from '../types.js';

export const statusTool: ToolRegistryEntry = {
  name: 'agentqx_status',
  description: 'Get current status: pass/fail counts and list of test files.',
  inputSchema: {
    url: z.string().describe('URL to check workspace for'),
  },
  handler: async raw => {
    const { url } = z.object({ url: z.string() }).parse(raw);
    const ws = new Workspace({ url });

    let stats = null;
    if (existsSync(ws.reportFile)) {
      try {
        stats = loadTestStats(ws.reportFile);
      } catch {
        /* ignore */
      }
    }

    const testFiles = ws.testFiles().map(f => f.split('/').pop());
    const hasSiteMap = existsSync(ws.siteMapFile);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              workspace_dir: ws.dir,
              has_site_map: hasSiteMap,
              test_files: testFiles,
              latest_results: stats,
            },
            null,
            2
          ),
        },
      ],
    };
  },
};
