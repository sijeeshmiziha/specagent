/**
 * agentqx_run — Run the Playwright test suite and return results.
 */

import { z } from 'zod';
import { Workspace } from '../../../workspace/index.js';
import { runTestRunner } from '../../../../modules/test-runner/agent.js';
import { formatFailuresFromReportFile } from '../../../utils/playwright-report.js';
import type { ToolRegistryEntry } from '../types.js';

export const runTool: ToolRegistryEntry = {
  name: 'agentqx_run',
  description:
    'Run the Playwright test suite and return pass/fail counts. Includes failure details when tests fail.',
  inputSchema: {
    url: z.string().describe('URL of the site (to locate the workspace)'),
  },
  handler: async raw => {
    const { url } = z.object({ url: z.string() }).parse(raw);
    const ws = new Workspace({ url });
    ws.init();
    await ws.installDeps();

    const result = runTestRunner({ workspace: ws, stdio: 'pipe', quiet: true });

    const response: Record<string, unknown> = {
      status: result.stats.failed === 0 && result.stats.errors === 0 ? 'all_pass' : 'has_failures',
      passed: result.stats.passed,
      failed: result.stats.failed,
      errors: result.stats.errors,
      total: result.stats.total,
      duration_s: result.duration.toFixed(1),
    };

    if (result.stats.failed > 0 || result.stats.errors > 0) {
      response.failures = formatFailuresFromReportFile(ws.reportFile);
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
    };
  },
};
