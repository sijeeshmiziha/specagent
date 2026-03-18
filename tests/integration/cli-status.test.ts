import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';

describe('CLI status integration', () => {
  it('agentqx status --url <url> exits 0 and prints workspace info', () => {
    const cliPath = path.join(process.cwd(), 'src', 'cli', 'index.ts');
    const result = execSync(`npx tsx "${cliPath}" status --url https://example.com`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024,
      timeout: 30_000,
    });
    expect(result).toContain('Workspace:');
    expect(result).toMatch(/Site map:/);
    expect(result).toMatch(/Test files:/);
  }, 35_000);
});
