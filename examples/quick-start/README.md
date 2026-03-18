# Quick Start Example

Minimal path: explore a site, run tests, then fix failures. Use this when you want to run each step yourself without the full autonomous loop.

## What It Does

Runs the three core steps in sequence: **explore** (crawl and produce `site_map.json`), **run** (execute the Playwright test suite), and **fix** (single-pass autofix of failing tests). Good for learning the pipeline or debugging.

## Run

```bash
# Via module entry point (interactive)
npm run example:quick-start

# Manual step-by-step from project root
npm run explorer -- https://example.com --depth 2 --max-pages 10
npm run runner -- --description "after explore"
npm run autofix
```

## Inputs

| Variable / flag              | Description                    | Default            |
| ---------------------------- | ------------------------------ | ------------------ |
| `TARGET_URL` / url           | Application URL to test        | (required)         |
| `ANTHROPIC_API_KEY` or other | LLM API key (for generate/fix) | (required for fix) |
| `--depth`                    | Crawl depth                    | 2                  |
| `--max-pages`                | Max pages to crawl             | 25                 |

## Output

- **Explore**: `site_map.json` and `snapshots/explore_*.png` in the workspace (`.agentqx/<url-slug>/`).
- **Run**: `results.tsv`, `snapshots/`, and console summary with `coverage_score`, pass/fail counts.
- **Fix**: Updated `tests/test_suite.spec.ts` (or workspace test files) after one autofix pass.

## Related

- [CLI Loop](cli-loop/) — Full autonomous Karpathy loop (overnight).
- [CLI Explore–Generate–Run](cli-explore-generate-run/) — Explore, generate suite, then run (no autofix).
- [AGENTS.md](../AGENTS.md) — Step-by-step agent instructions.
