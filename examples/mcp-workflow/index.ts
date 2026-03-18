/**
 * MCP Workflow Example — module entry point.
 * Prints the recommended MCP tool sequence and config (no MCP client in repo).
 *
 * Standalone: npx tsx examples/mcp-workflow/index.ts
 */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { ExampleModule } from '../lib/types.js';
import { printHeader } from '../lib/input.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '../..');

const exampleModule: ExampleModule = {
  name: 'MCP Workflow',
  description: 'Recommended MCP tool sequence for AI in Cursor / Claude Desktop.',
  examples: [],
  async run() {
    printHeader(
      'MCP Workflow',
      'Use these tools from your MCP-enabled AI client (Cursor, Claude Desktop).'
    );

    console.log('Recommended tool sequence:\n');
    console.log('  1. agentqx_explore   — Crawl URL, produce site_map.json');
    console.log('  2. agentqx_read_tests — Get current test file(s)');
    console.log('  3. agentqx_write_tests — Write or overwrite tests');
    console.log('  4. agentqx_run      — Run Playwright suite');
    console.log('  5. agentqx_fix      — Get pass/fail and failure details\n');

    console.log('MCP config (add to your client; use absolute cwd):\n');
    console.log(
      JSON.stringify(
        {
          mcpServers: {
            agentqx: {
              command: 'npx',
              args: ['tsx', 'src/lib/mcp/server/stdio.ts'],
              cwd: projectRoot,
            },
          },
        },
        null,
        2
      )
    );
    console.log(
      '\nSee examples/mcp-workflow/README.md and README.md#mcp-server for full tool list.'
    );
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
