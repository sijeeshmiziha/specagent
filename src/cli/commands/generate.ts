/**
 * CLI handler for `agentqx generate <url>`.
 */

import { Workspace } from '../../lib/workspace/index.js';
import { createModel } from '../../lib/models/provider-registry.js';
import { runGenerateSuite } from '../../modules/generate-suite/agent.js';

export async function handleGenerate(
  url: string,
  flags: Record<string, string | boolean | undefined>
): Promise<void> {
  const depth = parseInt(flags.depth as string) || 2;
  const maxPages = parseInt(flags['max-pages'] as string) || 25;
  const skipExplore = flags['skip-explore'] === true;

  const workspace = new Workspace({ url });
  workspace.init();

  const model = await createModel({
    provider: flags.provider as 'anthropic' | 'openai' | 'gemini' | 'ollama' | undefined,
    model: flags.model as string | undefined,
  });

  await runGenerateSuite({
    url,
    skipExplore,
    depth,
    maxPages,
    model: model.modelName,
    chatModel: model,
    workspace,
  });
}
