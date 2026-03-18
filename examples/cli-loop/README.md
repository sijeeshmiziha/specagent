# CLI Loop Example

Full autonomous Karpathy loop: explore → generate initial suite → run experiments, classify failures, apply fix strategies, and keep or revert by coverage. Best for overnight or CI runs.

## What It Does

Runs `agentqx loop <url>` (or `npm run loop -- <url>`): explores the site, generates an initial test suite with the LLM, then repeatedly runs tests, classifies failures, applies a strategy (e.g. fix-selectors, fix-timing), and commits only when coverage improves. Stops at target score, stagnation, or max iterations.

## Run

```bash
# Full loop (use small limits for a quick demo)
npm run example:cli-loop

# Or run the loop script directly with options
npm run loop -- https://example.com --max-pages 5 --max-iterations 3 --target-score 0.9
```

## Inputs

| Flag / env           | Description                | Default    |
| -------------------- | -------------------------- | ---------- |
| `url`                | Application URL to test    | (required) |
| `--max-pages`        | Max pages to crawl         | 25         |
| `--max-iterations`   | Max experiment iterations  | 50         |
| `--target-score`     | Stop when coverage ≥ this  | 0.95       |
| `--stagnation-limit` | Stop after N stale runs    | 5          |
| `--skip-explore`     | Use existing site_map.json | false      |
| LLM env var          | e.g. ANTHROPIC_API_KEY     | (required) |

## Output

- Workspace under `.agentqx/<url-slug>/`: `site_map.json`, `tests/`, `experiments.json`, `results.tsv`.
- Console: iteration progress, pass/fail, coverage_score, and whether the run was kept or reverted.

## Related

- [AGENTS.md](../AGENTS.md) — Experimentation workflow and strategy list.
- [README — How The Karpathy Loop Works](../README.md#how-the-karpathy-loop-works) — Loop steps.
- [Programmatic API](programmatic-api/) — Run the loop from code.
