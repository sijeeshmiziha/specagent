import { describe, expect, it } from 'vitest';
import { createAgentqxServer } from '../../src/lib/mcp/server/index.js';
import { TOOL_REGISTRY } from '../../src/lib/mcp/server/index.js';

describe('MCP server integration', () => {
  it('createAgentqxServer returns a server', () => {
    const server = createAgentqxServer();
    expect(server).toBeDefined();
    expect(typeof server).toBe('object');
  });

  it('TOOL_REGISTRY has 7 tools with expected names', () => {
    const names = TOOL_REGISTRY.map(t => t.name);
    expect(names).toHaveLength(7);
    expect(names).toContain('agentqx_explore');
    expect(names).toContain('agentqx_generate');
    expect(names).toContain('agentqx_run');
    expect(names).toContain('agentqx_fix');
    expect(names).toContain('agentqx_write_tests');
    expect(names).toContain('agentqx_read_tests');
    expect(names).toContain('agentqx_status');
  });
});
