# Agent instructions — AgentQX

**Goal:** Give it a URL; produce a battle-tested E2E test suite. Iterate: create tests → run → fix failures → add tests for uncovered pages until **all tests pass**.

For project overview and CLI, see [README.md](README.md). For MCP tools, see [README.md#mcp-tools](README.md#mcp-tools).

---

## How it works

- **LLM** — Anthropic (Claude), OpenAI, Gemini, or Ollama. Set the matching env var or use `--provider`; see [README.md#llm-providers](README.md#llm-providers).
- **`agentqx <url>`** / **`agentqx loop <url>`** — Main flow: explore → generate → loop (run tests → fix failures → add tests for uncovered pages) until all pass or limits.
- **`src/modules/loop/`** — Run tests, fix failing ones, generate more tests for uncovered pages; stop when all pass, max iterations, or stagnation.
- **`src/modules/generate-suite/`** — Reads `site_map.json`, uses LLM to generate `tests/test_suite.spec.ts` (or multi-file). CLI: `agentqx generate <url>`.
- **`src/modules/site-explorer/`** — Crawl URL → `site_map.json` + snapshots. Do not change explorer behavior to work around bad tests.
- **`src/modules/test-runner/`** — Playwright run; pass/fail counts. Do not change runner behavior to paper over failures.
- **`src/modules/autofix/`** — Run tests, read failures, LLM patches test files.
- **`src/lib/mcp/server/`** — MCP server with 7 tools (explore, generate, run, fix, write_tests, read_tests, status). No LLM in server.
- **`tests/test_suite.spec.ts`** (or generated specs) — **Editable surface**. Prefer `getByRole` / `getByLabel` / `getByText`; no `page.waitForTimeout()`; no `test.skip()` to hide failures.

---

## Steps (in order)

1. **Read context** — This file, [README.md](README.md), `tests/test_suite.spec.ts`, `site_map.json` if present, and runner/explorer behavior (do not alter them to avoid failures).
2. **Target URL** — In tests, `export const TARGET_URL = 'https://your-app.com';` must match the app under test.
3. **Explore** — `agentqx explore <TARGET_URL> --depth 2 --max-pages 25` → `site_map.json` and snapshots.
4. **Baseline run** — `agentqx run` to see current pass/fail.
5. **Plan tests** — Use `site_map.json` to cover pages and flows.
6. **Write tests** — Edit `tests/test_suite.spec.ts` (or use generate). Prefer role/label/text locators; use `expect()`; no arbitrary timeouts.
7. **Run** — `agentqx run`.
8. **Fix failures** — Use snapshots and errors; adjust selectors/flows in the spec. Or run `agentqx fix` for LLM-assisted fixes.
9. **Loop** — Repeat edit → run → fix until **all tests pass**. Revert bad changes if needed (`git checkout tests/test_suite.spec.ts`).

---

## CLI quick reference

| Flow      | Command                                             |
| --------- | --------------------------------------------------- |
| Full loop | `agentqx <url>` or `agentqx loop <url>`             |
| Explore   | `agentqx explore <url> [--depth N] [--max-pages N]` |
| Generate  | `agentqx generate <url>`                            |
| Run       | `agentqx run`                                       |
| Fix       | `agentqx fix`                                       |
| Status    | `agentqx status [--url U]`                          |
| MCP       | `agentqx mcp`                                       |

---

## Allowed vs not allowed

- **You may:** Edit `tests/test_suite.spec.ts`, adjust `playwright.config.ts`, add stable E2E tests.
- **You may not:** Change site-explorer or test-runner **behavior** to paper over bad tests; use `page.waitForTimeout()` instead of proper waits; use `test.skip()` to hide failures.

---

## Tips

- `page.getByRole("button", { name: "Submit" })` over CSS selectors.
- Clear test titles: `test("login shows error on empty submit", ...)`.
- Autonomy: keep iterating until all pass or limits; no need to ask the user to continue.
