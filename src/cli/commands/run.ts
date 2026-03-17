/**
 * CLI handler for `agentqx run`.
 */

import { Workspace } from '../../lib/workspace/index.js';
import { runTestRunner } from '../../modules/test-runner/agent.js';

export async function handleRun(
  url: string | undefined,
  flags: Record<string, string | boolean | undefined>
): Promise<void> {
  const runUrl = (flags.url as string) || url;

  if (!runUrl) {
    console.error('Error: URL required. Usage: agentqx run --url <url>');
    process.exit(1);
  }

  const workspace = new Workspace({ url: runUrl });
  workspace.init();
  await workspace.installDeps();

  runTestRunner({ workspace });
}
