/**
 * CLI handler for `agentqx status` — show pass/fail counts and test files.
 */

import { existsSync } from 'node:fs';
import { Workspace } from '../../lib/workspace/index.js';
import { loadTestStats } from '../../lib/utils/playwright-report.js';

export async function handleStatus(
  url: string | undefined,
  flags: Record<string, string | boolean | undefined>
): Promise<void> {
  const statusUrl = (flags.url as string) || url;
  if (!statusUrl) {
    console.error('Error: URL required. Usage: agentqx status --url <url>');
    process.exit(1);
  }

  const workspace = new Workspace({ url: statusUrl });
  const testFiles = workspace.testFiles().map(f => f.split('/').pop());
  const hasSiteMap = existsSync(workspace.siteMapFile);

  let stats = null;
  if (existsSync(workspace.reportFile)) {
    try {
      stats = loadTestStats(workspace.reportFile);
    } catch {
      /* ignore */
    }
  }

  console.log('Workspace:', workspace.dir);
  console.log('Site map:', hasSiteMap ? 'yes' : 'no');
  console.log('Test files:', testFiles.length ? testFiles.join(', ') : '(none)');
  if (stats) {
    console.log(
      `Latest run: passed=${stats.passed} failed=${stats.failed} errors=${stats.errors} total=${stats.total}`
    );
  } else {
    console.log('Latest run: (no report — run "agentqx run" first)');
  }
}
