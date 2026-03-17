/**
 * CLI handler for `agentqx <url>` — the full loop.
 */

import { Workspace } from '../../lib/workspace/index.js';
import { createModel } from '../../lib/models/provider-registry.js';
import { runSiteExplorer, printSiteExplorerSummary } from '../../modules/site-explorer/agent.js';
import { runGenerateSuite } from '../../modules/generate-suite/agent.js';
import { runLoop } from '../../modules/loop/agent.js';

export async function handleLoop(
  url: string,
  flags: Record<string, string | boolean | undefined>
): Promise<void> {
  const depth = parseInt(flags.depth as string) || 2;
  const maxPages = parseInt(flags['max-pages'] as string) || 25;
  const skipExplore = flags['skip-explore'] === true;
  const maxIterations = parseInt(flags['max-iterations'] as string) || 10;
  const maxTimeMinutes = parseInt(flags['max-time'] as string) || 120;

  const workspace = new Workspace({ url });
  workspace.init();

  const model = await createModel({
    provider: flags.provider as 'anthropic' | 'openai' | 'gemini' | 'ollama' | undefined,
    model: flags.model as string | undefined,
  });

  // Step 1: Explore
  if (!skipExplore) {
    console.log('\n[Step 1] Exploring site...');
    const siteMap = await runSiteExplorer({ url, depth, maxPages, outputDir: workspace.dir });
    printSiteExplorerSummary(siteMap, {
      siteMapFile: workspace.siteMapFile,
      snapshotsDir: workspace.snapshotsDir,
    });
  } else {
    console.log('\n[Step 1] Skipping explore (using existing site map)');
  }

  // Step 2: Generate initial tests
  console.log('\n[Step 2] Generating initial test suite...');
  await runGenerateSuite({
    url,
    skipExplore: true,
    depth,
    maxPages,
    model: model.modelName,
    chatModel: model,
    workspace,
  });

  // Step 3: Install deps
  await workspace.installDeps();

  // Step 4: Run loop
  console.log('\n[Step 3] Running fix loop...');

  const timeout = setTimeout(
    () => {
      console.log(`\nMax time (${maxTimeMinutes} minutes) reached. Stopping.`);
      process.exit(0);
    },
    maxTimeMinutes * 60 * 1000
  );

  const result = await runLoop({
    url,
    workspace,
    model,
    maxIterations,
  });

  clearTimeout(timeout);

  console.log('\n' + '='.repeat(60));
  console.log('Loop complete:');
  console.log(`  passed:  ${result.passed}`);
  console.log(`  failed:  ${result.failed}`);
  console.log(`  total:   ${result.total}`);
  console.log(`  iterations: ${result.iterations}`);
  console.log(`  stopped: ${result.stoppedReason}`);
  console.log('='.repeat(60));
}
