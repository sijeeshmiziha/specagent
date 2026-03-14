/**
 * AgentQX public API (programmatic use + MCP embedding).
 */

// ─── MCP Server ───
export { createAgentqxServer, TOOL_REGISTRY } from './lib/mcp/server/index.js';
export type { ToolRegistryEntry, ToolHandler } from './lib/mcp/server/types.js';

// ─── Loop ───
export { runLoop } from './modules/loop/index.js';
export type { LoopOptions, LoopResult } from './modules/loop/index.js';

// ─── Modules ───
export { runGenerateSuite } from './modules/generate-suite/index.js';
export type { RunGenerateSuiteOptions } from './modules/generate-suite/index.js';

export { runAutofix } from './modules/autofix/index.js';
export type { RunAutofixOptions, RunAutofixResult } from './modules/autofix/index.js';

export { runSiteExplorer, printSiteExplorerSummary } from './modules/site-explorer/index.js';
export type { RunSiteExplorerOptions, SiteMap } from './modules/site-explorer/index.js';

export { runTestRunner } from './modules/test-runner/index.js';
export type {
  RunTestRunnerOptions,
  RunTestRunnerResult,
  TestStats,
} from './modules/test-runner/index.js';

// ─── Multi-file Generation ───
export { generateMultiFile } from './modules/generate-suite/multi-file.js';
export type { GenerateMultiFileOptions } from './modules/generate-suite/multi-file.js';

// ─── Workspace ───
export { Workspace } from './lib/workspace/index.js';

// ─── Types ───
export type { PipelineInput } from './lib/types/pipeline.js';
export { pipelineInputSchema } from './lib/types/pipeline.js';

// ─── Models (Multi-Provider) ───
export type { ChatModel, ChatMessage, ProviderName, ProviderConfig } from './lib/models/types.js';
export {
  createModel,
  createModelFromConfig,
  resolveProviderConfig,
  detectProvider,
} from './lib/models/provider-registry.js';
export { stripCodeFence } from './lib/models/index.js';
export { createAnthropicModel } from './lib/models/anthropic.js';
export { createOpenAIModel } from './lib/models/openai.js';
export { createGeminiModel } from './lib/models/gemini.js';
export { createOllamaModel } from './lib/models/ollama.js';
