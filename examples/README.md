# AgentQX Examples

Runnable examples for the CLI loop, step-by-step CLI, MCP workflow, and programmatic API. Copy-paste these scripts or adapt them for your own project.

- [Main README](../README.md) • [AGENTS.md](../AGENTS.md) • [MCP Tools](../README.md#mcp-tools)

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [How to Run](#how-to-run)
- [Module Index](#module-index)
- [Architecture](#architecture)
- [Using AgentQX with MCP](#using-agentqx-with-mcp)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Notes                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| Node.js     | >= 20 (see `.nvmrc`)                                                                                 |
| Playwright  | `npx playwright install chromium`                                                                    |
| LLM API key | One of: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY` / `GEMINI_API_KEY`, or `OLLAMA_HOST` |

---

## Quick Start

From the project root:

```bash
npm install
npx playwright install chromium
# Set one LLM env var, e.g. export ANTHROPIC_API_KEY="sk-..."
npm run example:interactive
```

Or run a specific module: `npm run example:quick-start`, `npm run example:cli-loop`, etc.

---

## How to Run

**Interactive launcher (pick a module from the menu):**

```bash
npm run example:interactive
```

**Run a specific module:**

```bash
npm run example:quick-start
npm run example:cli-loop
npm run example:cli-explore-generate-run
npm run example:mcp-workflow
npm run example:programmatic
```

**Run a single example script:**

```bash
npm run example -- examples/programmatic-api/01-karpathy-loop.ts
```

Always run from the **project root** so paths and env (e.g. `.agentqx/`, workspace) resolve correctly.

---

## Module Index

| Module                   | Command                                    | Description                                 | README                                       |
| ------------------------ | ------------------------------------------ | ------------------------------------------- | -------------------------------------------- |
| Quick Start              | `npm run example:quick-start`              | Explore → run → fix (minimal path)          | [README](quick-start/README.md)              |
| CLI Loop                 | `npm run example:cli-loop`                 | Full autonomous Karpathy loop               | [README](cli-loop/README.md)                 |
| CLI Explore–Generate–Run | `npm run example:cli-explore-generate-run` | Explore → generate suite → run (no autofix) | [README](cli-explore-generate-run/README.md) |
| MCP Workflow             | `npm run example:mcp-workflow`             | MCP tool sequence for AI in Cursor          | [README](mcp-workflow/README.md)             |
| Programmatic API         | `npm run example:programmatic`             | runKarpathyLoop from code                   | [README](programmatic-api/README.md)         |

---

## Architecture

Each module folder has the same structure:

```
examples/{module}/
  index.ts       # Entry point — metadata + run()
  01-*.ts        # Optional runnable script(s)
  README.md      # Module-specific docs
```

The interactive launcher (`run.ts`) uses `lib/registry.ts`, which imports all module `index.ts` files. You can also run any module’s `index.ts` directly: `npx tsx examples/quick-start/index.ts`.

---

## Using AgentQX with MCP

Use the MCP server from Cursor (or another MCP client) so an AI assistant can drive AgentQX via tools:

1. Add the AgentQX MCP server to your client config (see [README — MCP Server](../README.md#mcp-server-cursor--claude-desktop)).
2. Typical flow: **agentqx_explore** → **agentqx_generate** → **agentqx_read_tests** / **agentqx_write_tests** → **agentqx_run** → **agentqx_fix** / **agentqx_status**.
3. Run `npm run example:mcp-workflow` to print the recommended tool sequence and a config snippet.

---

## Troubleshooting

**Missing API key** — Set one of `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`/`GEMINI_API_KEY`, or `OLLAMA_HOST`. Required for generate, fix, and loop.

**Wrong cwd** — Run from the **project root** (where `package.json` and `src/` live). The runner and workspace use paths relative to cwd.

**MCP server not starting** — In your MCP config, set `cwd` to the **absolute path** to the AgentQX repo. Test with `npm run mcp` from the repo.

**No tests generated** — Run explore first (`npm run explorer -- <url>` or use **agentqx_explore**). Generate reads from `site_map.json`.
