import { describe, expect, it, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  statsFromReport,
  loadTestStats,
  computeCoverageScore,
  loadStatsAndScore,
  formatFailuresFromReportFile,
} from '../../src/lib/utils/playwright-report.js';

const FIXTURE_DIR = path.join(process.cwd(), '.agentqx-report-test');

afterEach(() => {
  try {
    rmSync(FIXTURE_DIR, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});

describe('statsFromReport', () => {
  it('computes TestStats from valid report', () => {
    const report = {
      stats: { expected: 5, unexpected: 1, flaky: 0, skipped: 2 },
    };
    const stats = statsFromReport(report);
    expect(stats.passed).toBe(5);
    expect(stats.failed).toBe(1);
    expect(stats.total).toBe(8);
    expect(stats.errors).toBe(0);
  });

  it('includes flaky in passed', () => {
    const report = { stats: { expected: 3, unexpected: 0, flaky: 2, skipped: 0 } };
    const stats = statsFromReport(report);
    expect(stats.passed).toBe(5);
    expect(stats.total).toBe(5);
  });

  it('counts errors array length', () => {
    const report = { stats: {}, errors: [{ message: 'err1' }, 'err2'] };
    const stats = statsFromReport(report);
    expect(stats.errors).toBe(2);
  });

  it('uses defaults when stats missing', () => {
    const stats = statsFromReport({});
    expect(stats.passed).toBe(0);
    expect(stats.failed).toBe(0);
    expect(stats.total).toBe(0);
  });
});

describe('loadTestStats', () => {
  it('returns zeros for missing file', () => {
    const stats = loadTestStats(path.join(FIXTURE_DIR, 'missing.json'));
    expect(stats).toEqual({ passed: 0, failed: 0, errors: 0, total: 0 });
  });

  it('returns zeros for invalid JSON', () => {
    mkdirSync(FIXTURE_DIR, { recursive: true });
    const file = path.join(FIXTURE_DIR, 'bad.json');
    writeFileSync(file, 'not json', 'utf8');
    const stats = loadTestStats(file);
    expect(stats).toEqual({ passed: 0, failed: 0, errors: 0, total: 0 });
  });

  it('parses valid report file', () => {
    mkdirSync(FIXTURE_DIR, { recursive: true });
    const file = path.join(FIXTURE_DIR, 'report.json');
    writeFileSync(
      file,
      JSON.stringify({ stats: { expected: 2, unexpected: 0, flaky: 0, skipped: 0 } }),
      'utf8'
    );
    const stats = loadTestStats(file);
    expect(stats.passed).toBe(2);
    expect(stats.total).toBe(2);
  });
});

describe('computeCoverageScore', () => {
  it('returns 0 when total is 0', () => {
    expect(computeCoverageScore({ passed: 0, failed: 0, errors: 0, total: 0 })).toBe(0);
  });

  it('returns correct score', () => {
    expect(computeCoverageScore({ passed: 3, failed: 1, errors: 0, total: 4 })).toBe(0.75);
  });
});

describe('loadStatsAndScore', () => {
  it('returns stats and score', () => {
    mkdirSync(FIXTURE_DIR, { recursive: true });
    const file = path.join(FIXTURE_DIR, 'report.json');
    writeFileSync(
      file,
      JSON.stringify({ stats: { expected: 1, unexpected: 1, flaky: 0, skipped: 0 } }),
      'utf8'
    );
    const { stats, score } = loadStatsAndScore(file);
    expect(stats.passed).toBe(1);
    expect(stats.total).toBe(2);
    expect(score).toBe(0.5);
  });
});

describe('formatFailuresFromReportFile', () => {
  it('returns message when file missing', () => {
    const out = formatFailuresFromReportFile(path.join(FIXTURE_DIR, 'nope.json'));
    expect(out).toContain('No report file found');
  });

  it('returns message when JSON invalid', () => {
    mkdirSync(FIXTURE_DIR, { recursive: true });
    writeFileSync(path.join(FIXTURE_DIR, 'bad.json'), 'x', 'utf8');
    const out = formatFailuresFromReportFile(path.join(FIXTURE_DIR, 'bad.json'));
    expect(out).toContain('Could not parse');
  });

  it('returns failure details for report with failures', () => {
    mkdirSync(FIXTURE_DIR, { recursive: true });
    const file = path.join(FIXTURE_DIR, 'report.json');
    writeFileSync(
      file,
      JSON.stringify({
        suites: [
          {
            specs: [
              {
                file: 'a.spec.ts',
                line: 10,
                title: 'fails',
                tests: [
                  {
                    status: 'unexpected',
                    results: [{ status: 'failed', errors: [{ message: 'Assertion failed' }] }],
                  },
                ],
              },
            ],
          },
        ],
      }),
      'utf8'
    );
    const out = formatFailuresFromReportFile(file);
    expect(out).toContain('TEST:');
    expect(out).toContain('Assertion failed');
  });

  it('returns no failure message when no failures', () => {
    mkdirSync(FIXTURE_DIR, { recursive: true });
    const file = path.join(FIXTURE_DIR, 'report.json');
    writeFileSync(file, JSON.stringify({ suites: [] }), 'utf8');
    const out = formatFailuresFromReportFile(file);
    expect(out).toContain('No failure details found');
  });
});
