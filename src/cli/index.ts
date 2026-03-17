#!/usr/bin/env node

// AgentQX CLI — agentic Playwright test generation & auto-fixing.

import { parseArgs } from 'node:util';

const USAGE = `
AgentQX — Give it a URL, wake up with a battle-tested E2E test suite.

Usage:
  agentqx <url>              Full loop: explore → generate → run → fix until all pass
  agentqx loop <url>          Same as above
  agentqx explore <url>       Crawl URL and produce site map
  agentqx generate <url>      Generate test suite from site map (LLM)
  agentqx run [--url <url>]   Run the test suite
  agentqx fix [--url <url>]   Run tests and fix failures via LLM
  agentqx status [--url <url>] Pass/fail counts and test files
  agentqx mcp                 Start MCP stdio server
  agentqx help                Show this help

Options:
  --depth N              Crawl depth (default: 2)
  --max-pages N          Max pages to crawl (default: 25)
  --skip-explore         Use existing site_map.json
  --provider P           LLM provider: anthropic, openai, gemini, ollama
  --model M              Model name override
  --max-iterations N     Max loop iterations (default: 10)
  --max-time N           Max wall-clock minutes (default: 120)
  --url U                Workspace URL for run/fix/status
`.trim();

function parseCliArgs(): {
  command: string;
  url?: string;
  flags: Record<string, string | boolean | undefined>;
} {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(USAGE);
    process.exit(0);
  }

  let command = args[0];
  let url: string | undefined;

  // If the first arg looks like a URL, it's the default loop command
  if (/^https?:\/\//i.test(command)) {
    url = command;
    command = 'loop';
  } else if (args[1] && !args[1].startsWith('--')) {
    url = args[1];
  }

  const flagArgs =
    url && command !== 'loop'
      ? args.slice(2)
      : command === 'loop' && url === args[0]
        ? args.slice(1)
        : args.slice(url ? 2 : 1);

  const { values } = parseArgs({
    args: flagArgs,
    options: {
      depth: { type: 'string', default: '2' },
      'max-pages': { type: 'string', default: '25' },
      'skip-explore': { type: 'boolean', default: false },
      provider: { type: 'string' },
      model: { type: 'string' },
      'max-iterations': { type: 'string', default: '10' },
      'max-time': { type: 'string', default: '120' },
      url: { type: 'string' },
      help: { type: 'boolean', default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  return { command, url: url ?? (values.url as string | undefined), flags: values };
}

async function main(): Promise<void> {
  const { command, url, flags } = parseCliArgs();

  if (command === 'help' || flags.help) {
    console.log(USAGE);
    return;
  }

  switch (command) {
    case 'explore': {
      if (!url) {
        console.error('Error: URL required. Usage: agentqx explore <url>');
        process.exit(1);
      }
      const { handleExplore } = await import('./commands/explore.js');
      await handleExplore(url, flags);
      break;
    }

    case 'run': {
      const { handleRun } = await import('./commands/run.js');
      await handleRun(url, flags);
      break;
    }

    case 'generate': {
      if (!url) {
        console.error('Error: URL required. Usage: agentqx generate <url>');
        process.exit(1);
      }
      const { handleGenerate } = await import('./commands/generate.js');
      await handleGenerate(url, flags);
      break;
    }

    case 'fix': {
      const { handleFix } = await import('./commands/fix.js');
      await handleFix(url, flags);
      break;
    }

    case 'status': {
      const { handleStatus } = await import('./commands/status.js');
      await handleStatus(url, flags);
      break;
    }

    case 'loop': {
      if (!url) {
        console.error('Error: URL required. Usage: agentqx <url>');
        process.exit(1);
      }
      const { handleLoop } = await import('./commands/loop.js');
      await handleLoop(url, flags);
      break;
    }

    case 'mcp': {
      const { createAgentqxServer } = await import('../lib/mcp/server/index.js');
      const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
      const server = createAgentqxServer();
      const transport = new StdioServerTransport();
      await server.connect(transport);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      console.log(USAGE);
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
