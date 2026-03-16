/**
 * MCP tool registry — pure tools with NO LLM calls.
 *
 * The AI client (Claude, Gemini, GPT in Cursor/Claude Desktop) does the thinking.
 * These tools just provide capabilities: crawl, run tests, read/write files, etc.
 */

import type { ToolRegistryEntry } from './types.js';
import {
  exploreTool,
  generateTool,
  runTool,
  fixTool,
  writeTestsTool,
  readTestsTool,
  statusTool,
} from './tools/index.js';

export const TOOL_REGISTRY: ToolRegistryEntry[] = [
  exploreTool,
  generateTool,
  runTool,
  fixTool,
  writeTestsTool,
  readTestsTool,
  statusTool,
];
