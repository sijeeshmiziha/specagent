/**
 * Programmatic API Example — module entry point.
 * Runs 01-karpathy-loop.ts (loop from code).
 *
 * Standalone: npx tsx examples/programmatic-api/index.ts
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { ExampleModule } from '../lib/types.js';
import { printHeader } from '../lib/input.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '../..');

const exampleModule: ExampleModule = {
  name: 'Programmatic API',
  description: 'Run runLoop from code (Workspace + createModel).',
  examples: [
    {
      name: '01 - Loop',
      script: '01-karpathy-loop.ts',
      description: 'runLoop with small limits',
    },
  ],
  async run() {
    printHeader(
      'Programmatic API',
      'Runs 01-karpathy-loop.ts: explore → generate (if needed) → runLoop (2 iterations).'
    );
    execSync('npx tsx examples/programmatic-api/01-karpathy-loop.ts', {
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
