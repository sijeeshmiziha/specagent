import { describe, expect, it } from 'vitest';
import { TOOL_REGISTRY } from '../../src/lib/mcp/server/tool-registry.js';

describe('TOOL_REGISTRY', () => {
  it('has unique tool names', () => {
    const names = TOOL_REGISTRY.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('registers all 7 tools', () => {
    expect(TOOL_REGISTRY.length).toBe(7);
  });

  it('has core tools', () => {
    const names = new Set(TOOL_REGISTRY.map(t => t.name));
    expect(names.has('agentqx_explore')).toBe(true);
    expect(names.has('agentqx_generate')).toBe(true);
    expect(names.has('agentqx_run')).toBe(true);
    expect(names.has('agentqx_fix')).toBe(true);
    expect(names.has('agentqx_write_tests')).toBe(true);
    expect(names.has('agentqx_read_tests')).toBe(true);
    expect(names.has('agentqx_status')).toBe(true);
  });

  it('does NOT have removed tools', () => {
    const names = new Set(TOOL_REGISTRY.map(t => t.name));
    expect(names.has('agentqx_report')).toBe(false);
    expect(names.has('agentqx_site_map')).toBe(false);
    expect(names.has('agentqx_screenshot')).toBe(false);
    expect(names.has('agentqx_diff')).toBe(false);
    expect(names.has('agentqx_rollback')).toBe(false);
    expect(names.has('agentqx_config')).toBe(false);
    expect(names.has('agentqx_commit')).toBe(false);
  });

  it('all tools have description and handler', () => {
    for (const tool of TOOL_REGISTRY) {
      expect(tool.description).toBeTruthy();
      expect(typeof tool.handler).toBe('function');
    }
  });
});
