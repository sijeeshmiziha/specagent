/**
 * Playwright test execution — simplified, no TSV logging or coverage score.
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, unlinkSync } from 'node:fs';
import type { Workspace } from '../../lib/workspace/index.js';
import { loadTestStats, type TestStats } from '../../lib/utils/playwright-report.js';

export type { TestStats };

export interface RunTestRunnerOptions {
  stdio?: 'inherit' | 'pipe';
  quiet?: boolean;
  workspace?: Workspace;
}

export interface RunTestRunnerResult {
  code: number;
  duration: number;
  stats: TestStats;
  output: string;
}

export function runTestRunner(options: RunTestRunnerOptions): RunTestRunnerResult {
  const { workspace } = options;
  const stdio = options.stdio ?? 'inherit';
  const quiet = options.quiet ?? false;

  if (!workspace) {
    throw new Error('Workspace is required to run tests.');
  }

  const reportFile = workspace.reportFile;
  const cwd = workspace.dir;

  mkdirSync(workspace.reportsDir, { recursive: true });
  mkdirSync(workspace.path('test-results'), { recursive: true });
  try {
    unlinkSync(reportFile);
  } catch {
    /* missing ok */
  }

  if (!quiet) {
    console.log('Running Playwright tests...\n');
  }

  const start = performance.now();
  const r = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['playwright', 'test', '--config', 'playwright.config.ts'],
    {
      cwd,
      stdio: stdio === 'pipe' ? 'pipe' : 'inherit',
      shell: process.platform === 'win32',
      encoding: stdio === 'pipe' ? 'utf8' : undefined,
      maxBuffer: stdio === 'pipe' ? 50 * 1024 * 1024 : undefined,
    }
  );
  const duration = (performance.now() - start) / 1000;
  const code = r.status ?? 1;
  const output =
    stdio === 'pipe'
      ? `${(r as { stdout?: string }).stdout ?? ''}${(r as { stderr?: string }).stderr ?? ''}`
      : '';

  const stats = loadTestStats(reportFile);

  if (!quiet) {
    console.log('\n---');
    console.log(`total:   ${stats.total}`);
    console.log(`passed:  ${stats.passed}`);
    console.log(`failed:  ${stats.failed}`);
    console.log(`errors:  ${stats.errors}`);
    console.log(`duration: ${duration.toFixed(1)}s`);
    console.log('---');
  }

  return { code, duration, stats, output };
}
