/**
 * Interactive example launcher.
 * Select a module, then run it.
 *
 * Run: npm run example:interactive
 *
 * Each module can also be run standalone, e.g.:
 *   npx tsx examples/quick-start/index.ts
 */

import * as readline from 'node:readline';
import { modules } from './lib/registry.js';

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main(): Promise<void> {
  console.log('');
  console.log('  AgentQX — Example Launcher');
  console.log('  ─────────────────────────────');
  console.log('  Select a module to run. Set TARGET_URL and LLM API key as needed.');
  console.log('');
  modules.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.name} — ${m.description}`);
  });
  console.log(`  ${modules.length + 1}. Exit`);
  console.log('');

  const raw = await ask(`Choice (1–${modules.length + 1}): `);
  const n = parseInt(raw, 10);
  if (n >= 1 && n <= modules.length) {
    const mod = modules[n - 1];
    console.log('');
    await mod.run();
  } else if (n !== modules.length + 1) {
    console.log('Invalid choice.');
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
