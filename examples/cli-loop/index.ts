/**
 * CLI Loop Example — module entry point.
 * Runs the full autonomous Karpathy loop with small limits for demo.
 *
 * Standalone: npx tsx examples/cli-loop/index.ts
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
  name: 'CLI Loop',
  description: 'Full autonomous Karpathy loop (explore → generate → experiment loop).',
  examples: [],
  async run() {
    printHeader(
      'CLI Loop',
      'Runs the Karpathy loop with small limits (--max-pages 5, --max-iterations 3).'
    );
    console.log(`URL: ${DEMO_URL}\n`);
    execSync(
      `npx tsx src/scripts/loop.ts ${DEMO_URL} --max-pages 5 --max-iterations 3 --target-score 0.9`,
      {
        cwd: projectRoot,
        env: process.env,
        stdio: 'inherit',
      }
    );
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
