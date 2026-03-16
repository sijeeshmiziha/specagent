import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TOOL_REGISTRY } from './tool-registry.js';

export function createAgentqxServer(): McpServer {
  const server = new McpServer({
    name: 'agentqx',
    version: '1.0.0',
  });

  for (const tool of TOOL_REGISTRY) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      tool.handler
    );
  }

  return server;
}
