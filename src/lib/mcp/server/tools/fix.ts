/**
 * agentqx_fix — Return failure details + test file contents for AI client to fix.
 *
 * In MCP mode the AI client reads failures and uses agentqx_write_tests to apply fixes.
 */

import { existsSync, readFileSync } from 'node:fs';
import { z } from 'zod';
import { Workspace } from '../../../workspace/index.js';
import { formatFailuresFromReportFile } from '../../../utils/playwright-report.js';
import type { ToolRegistryEntry } from '../types.js';

export const fixTool: ToolRegistryEntry = {
  name: 'agentqx_fix',
  description:
    'Return failure details and test file contents so you can fix failing tests. After fixing, use agentqx_write_tests to save the corrected files.',
  inputSchema: {
    url: z.string().describe('URL of the site (to locate the workspace)'),
  },
  handler: async raw => {
    const { url } = z.object({ url: z.string() }).parse(raw);
    const ws = new Workspace({ url });

    if (!existsSync(ws.reportFile)) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'No test report found. Run agentqx_run first.' }),
          },
        ],
      };
    }

    const failures = formatFailuresFromReportFile(ws.reportFile);
    const testFiles = ws.testFiles();
    const fileContents: Record<string, string> = {};
    for (const f of testFiles) {
      const name = f.split('/').pop() ?? f;
      fileContents[name] = readFileSync(f, 'utf8');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              status: 'ok',
              failures,
              test_files: fileContents,
            },
            null,
            2
          ),
        },
      ],
    };
  },
};
