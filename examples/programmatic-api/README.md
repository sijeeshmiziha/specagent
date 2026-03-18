# Programmatic API Example

Run the Karpathy loop from code using `runKarpathyLoop`, `createModel`, and `Workspace`. Use when you want to embed AgentQX in your own script or CI.

## What It Does

Creates a workspace for a target URL, initializes it, runs the site explorer and (if needed) the generate-suite step, then runs the Karpathy loop with small limits (e.g. 2 iterations) so the demo finishes quickly.

## Run

```bash
# Via module entry point (runs 01-karpathy-loop.ts)
npm run example:programmatic

# Run the script directly (from project root)
npx tsx examples/programmatic-api/01-karpathy-loop.ts

# With custom URL
TARGET_URL=https://your-app.com npx tsx examples/programmatic-api/01-karpathy-loop.ts
```

## Inputs

| Variable                     | Description     | Default             |
| ---------------------------- | --------------- | ------------------- |
| `TARGET_URL`                 | Application URL | https://example.com |
| `ANTHROPIC_API_KEY` or other | LLM API key     | (required)          |

## Code snippet

```ts
import { runKarpathyLoop, createModel, Workspace } from 'agentqx';

const model = await createModel({ provider: 'anthropic' });
const workspace = new Workspace({ url: 'https://my-app.com' });
workspace.init();

const result = await runKarpathyLoop({
  url: 'https://my-app.com',
  model,
  workspace,
  maxIterations: 10,
  targetScore: 0.95,
  skipExplore: true, // set false and run explore first if needed
  depth: 2,
  maxPages: 25,
});
```

## Related

- [README — Programmatic API](../README.md#programmatic-api) — Full API overview.
- [CLI Loop](cli-loop/) — Same flow via CLI.
