# CLI Explore–Generate–Run Example

Three-step flow without autofix: explore the site, generate a test suite with the LLM, then run the tests. Use when you want to generate once and inspect or edit tests manually.

## What It Does

1. **Explore** — Crawl the target URL and write `site_map.json` and screenshots.
2. **Generate** — Read the site map and use the LLM to produce `tests/test_suite.spec.ts` (or workspace test files).
3. **Run** — Execute the Playwright test suite and report pass/fail and coverage_score.

## Run

```bash
# Via module entry point
npm run example:cli-explore-generate-run

# Manual steps from project root
npm run explorer -- https://your-app.com --depth 2 --max-pages 25
npm run generate-suite   # uses existing site_map.json; set TARGET_URL or pass URL in script
npm run runner -- --description "after generate"
```

## Inputs

| Variable / flag    | Description        | Default    |
| ------------------ | ------------------ | ---------- |
| `url` / TARGET_URL | Application URL    | (required) |
| `--depth`          | Crawl depth        | 2          |
| `--max-pages`      | Max pages to crawl | 25         |
| LLM env var        | For generate step  | (required) |

## Output

- **Explore**: `site_map.json`, `snapshots/explore_*.png` in the workspace.
- **Generate**: `tests/test_suite.spec.ts` (or POM files in workspace) with Playwright tests.
- **Run**: `results.tsv`, console summary with coverage_score.

## Related

- [Quick Start](quick-start/) — Explore → run → fix (with one autofix pass).
- [CLI Loop](cli-loop/) — Full autonomous loop with autofix and experiments.
