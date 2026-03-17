/**
 * CLI handler for `agentqx explore <url>`.
 */

import { Workspace } from '../../lib/workspace/index.js';
import { runSiteExplorer, printSiteExplorerSummary } from '../../modules/site-explorer/agent.js';

export async function handleExplore(
  url: string,
  flags: Record<string, string | boolean | undefined>
): Promise<void> {
  const workspace = new Workspace({ url });
  workspace.init();
  const siteMap = await runSiteExplorer({
    url,
    depth: parseInt(flags.depth as string) || 2,
    maxPages: parseInt(flags['max-pages'] as string) || 25,
    outputDir: workspace.dir,
  });
  printSiteExplorerSummary(siteMap, {
    siteMapFile: workspace.siteMapFile,
    snapshotsDir: workspace.snapshotsDir,
  });
}
