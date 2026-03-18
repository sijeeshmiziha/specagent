# MCP Workflow Example

Recommended tool sequence when using AgentQX from an AI client (Cursor, Claude Desktop, VS Code): explore → read site map → write or edit tests → run → report. The MCP server exposes 7 tools; this module documents the flow and prints the sequence (no MCP client runs inside the repo).

## What It Does

Shows the **recommended MCP tool order** and a minimal MCP config snippet so you can drive AgentQX from your AI editor. The example runner prints the steps and config; the actual tool calls happen in your MCP-enabled client.

## Run

```bash
npm run example:mcp-workflow
```

This prints the tool sequence and MCP config. Then in Cursor (or another MCP client), add the AgentQX server to your MCP config and ask the AI to run the workflow for a given URL.

## MCP config (add to your client)

In your MCP settings (e.g. Cursor → Settings → MCP), add:

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

Use the **absolute path** to your AgentQX repo for `cwd`.

## Recommended tool sequence (for the AI client)

1. **agentqx_explore** — `{ "url": "https://your-app.com", "depth": 2, "maxPages": 25 }`
2. **agentqx_generate** — Read site map and return page data for test generation.
3. **agentqx_read_tests** — Get current test file content.
4. **agentqx_write_tests** — Create or overwrite tests (AI sends content).
5. **agentqx_run** — Run Playwright suite.
6. **agentqx_fix** — Get failure details and test file contents for fixing.
7. **agentqx_status** — Get pass/fail counts and test files.

## Inputs

| Input     | Description                                       |
| --------- | ------------------------------------------------- |
| `url`     | Application URL to test                           |
| workspace | Implied by URL (per-URL workspace in `.agentqx/`) |

## Related

- [README — MCP Server](../README.md#mcp-server-cursor--claude-desktop) — Full tool list and config.
- [CLI Loop](cli-loop/) — Same workflow as a single headless command.
