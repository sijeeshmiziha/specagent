/**
 * MCP stdio entry — do not write to stdout (reserved for MCP JSON-RPC).
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createAgentqxServer } from './server.js';

async function main(): Promise<void> {
  const server = createAgentqxServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e: unknown) => {
  process.stderr.write(
    `agentqx MCP server failed: ${e instanceof Error ? e.message : String(e)}\n`
  );
  process.exit(1);
});
