/**
 * CLI handler for `agentqx fix` — run tests, then fix failures via LLM.
 */

import { Workspace } from '../../lib/workspace/index.js';
import { createModel } from '../../lib/models/provider-registry.js';
import { runTestRunner } from '../../modules/test-runner/agent.js';
import { runAutofix } from '../../modules/autofix/agent.js';

export async function handleFix(
  url: string | undefined,
  flags: Record<string, string | boolean | undefined>
): Promise<void> {
  const fixUrl = (flags.url as string) || url;
  if (!fixUrl) {
    console.error('Error: URL required. Usage: agentqx fix --url <url>');
    process.exit(1);
  }

  const workspace = new Workspace({ url: fixUrl });
  workspace.init();
  await workspace.installDeps();

  runTestRunner({ workspace, stdio: 'pipe', quiet: false });

  const model = await createModel({
    provider: flags.provider as 'anthropic' | 'openai' | 'gemini' | 'ollama' | undefined,
    model: flags.model as string | undefined,
  });

  const result = await runAutofix({ workspace, model });
  console.log(result.fixed ? 'Fixes applied. Run agentqx run to verify.' : 'No fixes applied.');
}
