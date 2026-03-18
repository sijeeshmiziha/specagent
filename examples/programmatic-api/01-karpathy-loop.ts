/**
 * Programmatic API: Run the loop from code.
 *
 * Uses runLoop, createModel, and Workspace with small limits for a quick demo.
 * Run from project root: npx tsx examples/programmatic-api/01-karpathy-loop.ts
 */

import {
  runLoop,
  createModel,
  Workspace,
  runSiteExplorer,
  runGenerateSuite,
} from '../../src/index.js';

const url = process.env.TARGET_URL ?? 'https://example.com';

async function main() {
  console.log('=== Programmatic API: Loop ===\n');
  console.log('URL:', url);
  console.log('Limits: maxIterations=2, maxPages=5\n');

  const model = await createModel({});
  const workspace = new Workspace({ url });
  workspace.init();

  console.log('Exploring site...');
  await runSiteExplorer({
    url,
    depth: 1,
    maxPages: 5,
    outputDir: workspace.dir,
  });

  const hasTests = workspace.testFiles().length > 0;
  if (!hasTests) {
    console.log('Generating initial test suite...');
    await runGenerateSuite({
      url,
      skipExplore: true,
      depth: 1,
      maxPages: 5,
      model: model.modelName,
      chatModel: model,
      workspace,
    });
  }

  await workspace.installDeps();

  console.log('Running loop (2 iterations)...\n');
  const result = await runLoop({
    url,
    model,
    workspace,
    maxIterations: 2,
    stagnationLimit: 2,
  });

  console.log('\n--- Result ---');
  console.log('Iterations:', result.iterations);
  console.log('Passed:', result.passed);
  console.log('Failed:', result.failed);
  console.log('Total:', result.total);
  console.log('Stopped reason:', result.stoppedReason);
}

main().catch(console.error);
