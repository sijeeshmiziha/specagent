# AgentQX — Agent Rules

## Project Overview

AgentQX is an MCP server and CLI for Playwright E2E testing. **Give it a URL; get a battle-tested E2E test suite.** It explores the site, generates tests, runs them, fixes failures, and adds tests for uncovered pages until all tests pass (or safety limits). No scoring or comparison logic—only: create tests, run, fix, repeat until all pass.

## Architecture

```
MCP (AI client orchestrates):
  AI Client (Cursor / Claude Desktop / any MCP client)
    → calls 7 tools
  MCP Server (tools only, NO LLM)
    → agentqx_explore, agentqx_generate, agentqx_run, agentqx_fix,
      agentqx_write_tests, agentqx_read_tests, agentqx_status

CLI (AgentQX orchestrates):
  agentqx <url>  or  agentqx loop <url>
    → Explore → Generate → Loop: Run → Fix → add tests for uncovered pages
    → Stop when all pass | max iterations | stagnation
```

```
Consumer: CLI (src/cli/) | MCP client | import from src/index.ts
                    ↓
  src/lib/mcp/server/  → TOOL_REGISTRY (7 tools), no LLM
                    ↓
  src/modules/        → site-explorer | generate-suite | test-runner | autofix | loop
                    ↓
  src/lib/            → models/ (multi-provider, CLI only) | workspace | utils | types
```

## Core Loop

```
agentqx <url>
  1. Explore: crawl URL → site_map.json
  2. Generate: LLM creates test files from site map
  3. Run tests
  4. All pass? → Done
  5. Failures? → Autofix (LLM patches failing tests) → run again
  6. Repeat fix cycle (max attempts per iteration)
  7. If no improvement: generate more tests for uncovered pages
  8. Repeat from step 3 until all pass or max iterations / stagnation
```

## Coding Standards

- **TypeScript strict** — no `any`, no unused vars/params
- **ES modules** — use `.js` extensions in imports
- **Locators** — prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
- **No `page.waitForTimeout()`** — use `waitFor` / `expect` conditions
- **Zod** for schema validation (MCP, config)
- **No classes for modules** — plain functions and interfaces (except Workspace)
- **ESLint + Prettier** — run before committing

## File Conventions

- Module logic in `agent.ts` per module
- Each module: `index.ts` re-exports public API
- Types in `types.ts` per module; shared in `src/lib/types/`
- Unit tests: `tests/unit/*.test.ts` (Vitest); E2E: `tests/**/*.spec.ts` (Playwright)

## Key Rules

- **MCP tools must NOT import from `models/`** — the client does LLM calls
- Generated `.spec.ts` files are the only editable test surface
- **Do NOT** change explorer/runner behavior to hide test failures
- **Do NOT** use `test.skip()` to ignore failures
- **Do NOT** hardcode secrets — use env or CLI flags
- Tests must be independent and idempotent
- Loop guards: max iterations, stagnation limit

## LLM Providers (CLI only)

Auto-detect order: `--provider` → `ANTHROPIC_API_KEY` → `OPENAI_API_KEY` → `GOOGLE_API_KEY`/`GEMINI_API_KEY` → `OLLAMA_HOST`.

## Commands

| Command             | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `npm run typecheck` | TypeScript strict                                                       |
| `npm run lint`      | ESLint                                                                  |
| `npm run format`    | Prettier                                                                |
| `npm run test:unit` | Vitest                                                                  |
| Full CI             | typecheck, lint, format:check, test:unit, build (see .github/workflows) |
| `npm run mcp`       | Start MCP stdio server                                                  |
| `npm run build`     | Build to dist/                                                          |
