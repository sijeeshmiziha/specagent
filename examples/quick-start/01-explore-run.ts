/**
 * Quick Start: Explore then run.
 * Runs site explorer then test runner with a demo URL.
 *
 * Run from project root: npx tsx examples/quick-start/01-explore-run.ts
 */

import { execSync } from 'node:child_process';

const url = process.env.TARGET_URL ?? 'https://example.com';

console.log('=== Quick Start: Explore then Run ===\n');
console.log('URL:', url, '\n');

console.log('Step 1: Explore...');
execSync(`npx tsx src/scripts/explorer.ts ${url} --depth 1 --max-pages 5`, {
  stdio: 'inherit',
});

console.log('\nStep 2: Run tests...');
execSync('npx tsx src/scripts/runner.ts --description "quick-start"', {
  stdio: 'inherit',
});

console.log('\nDone. Check results.tsv and snapshots/ for output.');
