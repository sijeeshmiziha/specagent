/**
 * CLI Explore–Generate–Run Example — module entry point.
 * Runs explore → generate → run (no autofix).
 *
 * Standalone: npx tsx examples/cli-explore-generate-run/index.ts
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { ExampleModule } from '../lib/types.js';
import { printHeader } from '../lib/input.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '../..');

const DEMO_URL = process.env.TARGET_URL ?? 'https://example.com';

const exampleModule: ExampleModule = {
  name: 'CLI Explore–Generate–Run',
  description: 'Explore → generate suite → run (no autofix).',
  examples: [],
  async run() {
    printHeader(
      'CLI Explore–Generate–Run',
      'Runs explorer, then generate-suite, then runner. Requires LLM API key.'
    );
    console.log(`URL: ${DEMO_URL}\n`);

    console.log('Step 1: Explore...');
    execSync(`npx tsx src/scripts/explorer.ts ${DEMO_URL} --depth 1 --max-pages 5`, {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
    });

    console.log('\nStep 2: Generate test suite...');
    execSync(`npx tsx src/scripts/generate-suite.ts ${DEMO_URL} --skip-explore`, {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
    });

    console.log('\nStep 3: Run tests...');
    execSync('npx tsx src/scripts/runner.ts --description "after-generate"', {
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
