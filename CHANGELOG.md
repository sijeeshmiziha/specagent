# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Nothing yet

### Changed

- Nothing yet

### Deprecated

- Nothing yet

### Removed

- Nothing yet

### Fixed

- Nothing yet

### Security

- Nothing yet

---

## [1.0.0] - 2026-03-19

### Added

- **Karpathy Loop** — Autonomous experiment engine: classify failures, apply fix strategies, git commit/revert, track in workspace ledger
- **CLI** — `agentqx explore`, `generate`, `run`, `fix`, `loop`, `status`, `mcp` with multi-provider LLM support
- **MCP server** — 12 tools: `agentqx_explore`, `agentqx_run`, `agentqx_report`, `agentqx_site_map`, `agentqx_screenshot`, `agentqx_write_tests`, `agentqx_read_tests`, `agentqx_status`, `agentqx_diff`, `agentqx_rollback`, `agentqx_config`, `agentqx_commit`
- **Multi-provider LLM** — Anthropic, OpenAI, Gemini, Ollama; auto-detect from env or `--provider`
- **Workspace isolation** — `.agentqx/<url-slug>/` per target URL with experiments ledger
- **Programmatic API** — `runKarpathyLoop`, `runSiteExplorer`, `runGenerateSuite`, `runAutofix`, `runTestRunner`, `createModel`, `Workspace`, `Ledger`, `classifyFailures`, etc.
- **Site explorer** — Crawl URLs → `site_map.json`, accessibility tree, screenshots
- **Generate suite** — LLM-generated `tests/test_suite.spec.ts` from site map
- **Test runner** — Playwright with `results.tsv`, `.report.json`, `snapshots/`
- **Autofix** — Single-pass or loop: LLM patches failing specs with guards (max iterations, stagnation, min improvement)
- **Full pipeline** — `npm run agent`: generate-suite → runner → autofix
- TypeScript strict, ESLint, Prettier, Husky, Vitest unit tests

---

## [0.1.0] - 2026-03-18

### Added

- Initial release: site explorer, generate-suite, test runner, autofix, full pipeline, MCP server, programmatic API, and tooling.

---

## Links

- [GitHub repository](https://github.com/sijeeshmiziha/agentqx)
- [Contributing](CONTRIBUTING.md)

[Unreleased]: https://github.com/sijeeshmiziha/agentqx/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sijeeshmiziha/agentqx/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/sijeeshmiziha/agentqx/releases/tag/v0.1.0
