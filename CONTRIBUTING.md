# Contributing to AgentQX

Thank you for your interest in contributing. This guide covers setup, style, and the PR process.

## Table of contents

- [Code of Conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Development setup](#development-setup)
- [Making changes](#making-changes)
- [Code style](#code-style)
- [Testing](#testing)
- [Pull request process](#pull-request-process)
- [Commit messages](#commit-messages)
- [Documentation](#documentation)
- [Infra constraints](#infra-constraints)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it. Report unacceptable behavior to [sijeeshmonbalan@gmail.com](mailto:sijeeshmonbalan@gmail.com).

For security issues, see [SECURITY.md](SECURITY.md).

---

## Getting started

### Types of contributions

| Type          | Examples                                             |
| ------------- | ---------------------------------------------------- |
| Bug fixes     | Runner, MCP, LLM provider integration edge cases     |
| Features      | New CLI flags, MCP tools (with maintainer agreement) |
| Documentation | README, AGENTS.md, examples                          |
| Tests         | Unit tests, clearer Playwright specs                 |

### Where to discuss

- **Bugs / features:** [GitHub Issues](https://github.com/sijeeshmiziha/agentqx/issues)

---

## Development setup

### Prerequisites

| Requirement  | Version / notes                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| Node.js      | >= 20 (see `.nvmrc`)                                                                                                  |
| npm / Git    | Recent                                                                                                                |
| LLM provider | Set one of ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY/GEMINI_API_KEY, or OLLAMA_HOST (see [README](README.md)) |

### Fork and clone

```bash
git clone https://github.com/YOUR_USERNAME/agentqx.git
cd agentqx
git remote add upstream https://github.com/sijeeshmiziha/agentqx.git
```

### Install

```bash
npm install
npx playwright install chromium
```

Optional: copy [`.env.example`](.env.example) to `.env` for any local overrides (see [README](README.md) for LLM env vars).

### Verify

```bash
npm run typecheck && npm run lint && npm run format:check && npm run test:unit && npm run build
```

Same checks as CI (see [.github/workflows/ci.yml](.github/workflows/ci.yml)). Playwright E2E (`npm test`) needs a configured `TARGET_URL` and network; see [AGENTS.md](AGENTS.md).

---

## Making changes

### Branch naming

```bash
git checkout -b feature/my-feature
git checkout -b fix/runner-edge-case
git checkout -b docs/readme-tweak
```

### Workflow

```bash
git checkout -b feature/my-feature
# ... edit ...
npm run typecheck && npm run lint && npm run format:check && npm run test:unit && npm run build
npm test          # optional, when changing Playwright specs
git commit -m "feat: describe change"
git push origin feature/my-feature
# Open a PR on github.com/sijeeshmiziha/agentqx
```

---

## Code style

- **TypeScript:** explicit types for public APIs; follow existing patterns in `src/`.
- **Lint / format:** `npm run lint`, `npm run lint:fix`, `npm run format`.
- **Pre-commit:** Husky + lint-staged run ESLint/Prettier on staged files.

---

## Testing

| Area            | Command             | Location                        |
| --------------- | ------------------- | ------------------------------- |
| Unit / registry | `npm run test:unit` | `tests/unit/`                   |
| E2E             | `npm test`          | `tests/test_suite.spec.ts`      |
| Full runner log | `npm run runner`    | Writes `results.tsv`, snapshots |

Prefer stable selectors (`getByRole`, `getByLabel`) and `expect()`; avoid `page.waitForTimeout()`. See [AGENTS.md](AGENTS.md) for the autonomous testing workflow.

---

## Pull request process

### Before submitting

- [ ] CI checks pass (typecheck, lint, format:check, test:unit, build)
- [ ] Documentation updated if behavior or CLI changed
- [ ] No skips added to hide failing E2E tests

### PR title

Use [Conventional Commits](https://www.conventionalcommits.org/) style, e.g. `fix: handle empty site map`, `docs: clarify MCP cwd`.

### Description

Summarize changes, how you tested, and any breaking or env changes.

---

## Commit messages

Format: `<type>(optional-scope): <description>`

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

---

## Documentation

| File           | Role                           |
| -------------- | ------------------------------ |
| `README.md`    | User-facing overview, CLI, MCP |
| `AGENTS.md`    | Agent/autonomous loop rules    |
| `CHANGELOG.md` | Release notes                  |

High-level architecture and data flow are in [README.md#architecture](README.md#architecture).

---

## Infra constraints

Per [AGENTS.md](AGENTS.md):

- **Do not** change `site-explorer` or `test-runner` **behavior** to paper over bad tests.
- **Do not** use long sleeps instead of assertions; **do not** skip tests to hide failures.

Improve tests in `tests/test_suite.spec.ts` or fix real bugs in modules instead.

---

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).

Thank you for contributing to AgentQX.
