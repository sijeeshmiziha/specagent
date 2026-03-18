/**
 * Quick Start Example — module entry point.
 * Minimal path: explore → run → fix.
 *
 * Standalone: npx tsx examples/quick-start/index.ts
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { ExampleModule } from '../lib/types.js';
import { printHeader } from '../lib/input.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '../..');

const DEMO_URL = 'https://example.com';

const exampleModule: ExampleModule = {
  name: 'Quick Start',
  description: 'Minimal path: explore → run → fix (step-by-step).',
  examples: [
    {
      name: '01 - Explore then run',
      script: '01-explore-run.ts',
      description: 'Run explorer then runner with a demo URL',
    },
  ],
  async run() {
    printHeader(
      'Quick Start',
      'Runs explore → run. Use a real URL via TARGET_URL or edit the script.'
    );
    const url = process.env.TARGET_URL ?? DEMO_URL;
    console.log(`URL: ${url}\n`);
    console.log('Step 1: Explore (crawl site)...');
    execSync(`npx tsx src/scripts/explorer.ts ${url} --depth 1 --max-pages 5`, {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
    });
    console.log('\nStep 2: Run tests...');
    execSync('npx tsx src/scripts/runner.ts --description "quick-start-demo"', {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
    });
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
