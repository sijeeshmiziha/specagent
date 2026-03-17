<p align="center">
  <h1 align="center">agentqx</h1>
  <p align="center">
    <strong>Give it a URL. Go to sleep. Wake up with a battle-tested E2E test suite.</strong>
  </p>
  <p align="center">
    A CLI and MCP server that builds full Playwright E2E test suites for any web app. You provide a URL; it explores the site, generates tests, runs them, fixes failures, and adds tests for uncovered pages—until every test passes or it hits safety limits.
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/agentqx"><img src="https://img.shields.io/npm/v/agentqx.svg?style=flat-square&color=0ea5e9&labelColor=0c4a6e" alt="npm version"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://github.com/sijeeshmiziha/agentqx/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-8b5cf6?style=flat-square" alt="License"></a>
    <a href="https://github.com/sijeeshmiziha/agentqx/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-10b981?style=flat-square&labelColor=064e3b" alt="PRs Welcome"></a>
  </p>
</p>

---

## What it does

1. **Explore** — Crawls the URL and builds a site map (pages, structure, screenshots).
2. **Generate** — Uses an LLM to create Playwright tests from the site map.
3. **Run** — Executes the test suite.
4. **Fix** — If any test fails, sends failures + code to the LLM and applies fixes.
5. **Repeat** — Re-runs tests, fixes again, and adds tests for pages that aren’t covered yet. Stops when **all tests pass** or when max iterations / stagnation limits are reached.

No extra complexity: no coverage scores to hit, no “keep vs discard” decisions—only **pass** or **fail**, and the loop keeps going until everything passes.

---

## Requirements

- **Node.js** ≥ 20
- **Playwright** — `npx playwright install chromium`
- **One LLM provider** — set the matching env var or use `--provider` (see [Providers](#llm-providers))

---

## Quick start

```bash
git clone https://github.com/sijeeshmiziha/agentqx.git
cd agentqx
npm install
npx playwright install chromium
npm run build
```

Set one LLM provider:

```bash
export ANTHROPIC_API_KEY="sk-..."   # Claude
# export OPENAI_API_KEY="sk-..."    # OpenAI
# export GOOGLE_API_KEY="..."       # Gemini
# OLLAMA_HOST=http://localhost:11434  # Ollama (local)
```

Run the full loop (explore → generate → run → fix until all pass):

```bash
agentqx https://your-app.com
# or: agentqx loop https://your-app.com
```

Optional flags:

- `--skip-explore` — Use an existing `site_map.json` (no crawl).
- `--max-iterations N` — Max loop iterations (default: 10).
- `--provider anthropic|openai|gemini|ollama` — Force LLM provider.
- `--depth N` — Crawl depth (default: 2).
- `--max-pages N` — Max pages to crawl (default: 25).

---

## CLI commands

| Command                    | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| `agentqx <url>`            | Full loop: explore → generate → run → fix → repeat until all pass |
| `agentqx loop <url>`       | Same as above                                                     |
| `agentqx explore <url>`    | Crawl URL and write `site_map.json`                               |
| `agentqx generate <url>`   | Generate test suite from site map (uses LLM)                      |
| `agentqx run`              | Run the test suite (from workspace)                               |
| `agentqx fix`              | One-shot: run tests and fix failures via LLM                      |
| `agentqx status [--url U]` | Show pass/fail counts and test files for a URL                    |
| `agentqx mcp`              | Start MCP stdio server for AI clients                             |

---

## MCP server (any MCP client)

Use AgentQX from Cursor, Claude Desktop, or any MCP client. The server exposes **tools only** (no LLM calls); the client does the thinking and calls the tools.

Add to your MCP config (use the path to your AgentQX repo):

```json
{
  "mcpServers": {
    "agentqx": {
      "command": "npx",
      "args": ["tsx", "src/lib/mcp/server/stdio.ts"],
      "cwd": "/absolute/path/to/agentqx"
    }
  }
}
```

After `npm run build`, you can use the built server:

```json
"args": ["node", "dist/lib/mcp/server/stdio.js"]
```

### MCP tools (7)

| Tool                  | Purpose                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| `agentqx_explore`     | Crawl a URL; produce site map (structure, elements, screenshots)               |
| `agentqx_generate`    | Generate test suite from site map (LLM runs in client or you run CLI generate) |
| `agentqx_run`         | Run Playwright tests; return pass/fail counts and failure details              |
| `agentqx_fix`         | Run tests and apply LLM-generated fixes to failing tests                       |
| `agentqx_write_tests` | Write test file(s) into the workspace                                          |
| `agentqx_read_tests`  | Read current test file(s) from the workspace                                   |
| `agentqx_status`      | Get pass/fail counts and list of test files for a URL                          |

Your AI client can orchestrate the same flow as the CLI: explore → generate (or write_tests) → run → fix (or read_tests + edit + write_tests) until status shows all pass.

---

## LLM providers

AgentQX uses one LLM for generating and fixing tests. Auto-detection order:

1. `--provider` flag
2. `ANTHROPIC_API_KEY` → Claude
3. `OPENAI_API_KEY` → OpenAI
4. `GOOGLE_API_KEY` or `GEMINI_API_KEY` → Gemini
5. `OLLAMA_HOST` → Ollama (local)

---

## Architecture

```
CLI: agentqx <url>
  → Explore (crawl) → Generate (LLM) → Loop: Run → Fix failures → Add tests for uncovered pages
  → Stop when: all pass | max iterations | stagnation

MCP: Any MCP client
  → Calls tools: explore, generate, run, fix, write_tests, read_tests, status
  → Same goal: build and fix E2E tests until all pass

Code layout:
  src/cli/           CLI entrypoints (loop, explore, generate, run, fix, status, mcp)
  src/lib/mcp/       MCP server + 7 tools (no LLM in server)
  src/modules/       site-explorer | generate-suite | test-runner | autofix | loop
  src/lib/           models (multi-provider) | workspace | utils | types
```

---

## Development

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run format      # Prettier
npm run test:unit   # Vitest
npm run build       # Production build to dist/
npm run mcp:dev     # Run MCP server with tsx (for development)
```

---

## Troubleshooting

- **No tests generated** — Run explore first: `agentqx explore <url>`. Generate reads from `site_map.json`.
- **Tests hit the wrong site** — Each URL has its own workspace under `.agentqx/<url-slug>/`. Ensure the workspace URL matches the app you’re testing.
- **LLM not found** — Set one of the API key env vars or pass `--provider anthropic|openai|gemini|ollama`.
- **MCP server not starting** — Use the absolute path for `cwd` in your MCP config. From the repo, `npx tsx src/lib/mcp/server/stdio.ts` should run without errors.

---

## Support

### Get Help

- [GitHub Issues](https://github.com/sijeeshmiziha/agentqx/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/sijeeshmiziha/agentqx/discussions) - Questions and community help

### Stay Updated

- [Star the repo](https://github.com/sijeeshmiziha/agentqx) to get notified of releases
- [Star History](https://star-history.com/#sijeeshmiziha/agentqx&Date) – view star growth over time
- Watch the repo for updates on new features

### Sponsorship

If AgentQX helps your business, consider supporting development:

- [GitHub Sponsors](https://github.com/sponsors/sijeeshmiziha)

---

## Sponsors

Support AgentQX by becoming a [sponsor](https://github.com/sponsors/sijeeshmiziha). Your logo will appear here with a link to your site.

---

## License

[MIT](LICENSE).

---

<p align="center">
  Made with ❤️ by the CompilersLab team!
</p>
