import { existsSync, readFileSync } from 'node:fs';

export interface TestStats {
  passed: number;
  failed: number;
  errors: number;
  total: number;
}

export interface PlaywrightJsonReport {
  suites?: PlaywrightSuite[];
  errors?: ({ message?: string } | string)[];
  stats?: {
    expected?: number;
    unexpected?: number;
    flaky?: number;
    skipped?: number;
  };
}

export interface PlaywrightSuite {
  title?: string;
  file?: string;
  suites?: PlaywrightSuite[];
  specs?: PlaywrightSpec[];
}

export interface PlaywrightSpec {
  title?: string;
  file?: string;
  line?: number;
  tests?: PlaywrightTest[];
}

export interface PlaywrightTest {
  projectName?: string;
  status?: string;
  results?: {
    status?: string;
    errors?: { message?: string; stack?: string }[];
  }[];
}

function countGlobalErrors(report: PlaywrightJsonReport): number {
  const e = report.errors;
  if (!Array.isArray(e)) return 0;
  return e.length;
}

export function statsFromReport(report: PlaywrightJsonReport): TestStats {
  const s = report.stats ?? {};
  const expected = s.expected ?? 0;
  const unexpected = s.unexpected ?? 0;
  const flaky = s.flaky ?? 0;
  const skipped = s.skipped ?? 0;
  const globalErrs = countGlobalErrors(report);
  const passed = expected + flaky;
  const failed = unexpected;
  const errors = globalErrs;
  const total = expected + unexpected + flaky + skipped;
  return { passed, failed, errors, total };
}

export function loadTestStats(reportFile: string): TestStats {
  if (!existsSync(reportFile)) {
    return { passed: 0, failed: 0, errors: 0, total: 0 };
  }
  try {
    const report = JSON.parse(readFileSync(reportFile, 'utf8')) as PlaywrightJsonReport;
    return statsFromReport(report);
  } catch {
    return { passed: 0, failed: 0, errors: 0, total: 0 };
  }
}

export function computeCoverageScore(stats: TestStats): number {
  if (stats.total === 0) return 0;
  return Math.round((stats.passed / stats.total) * 10000) / 10000;
}

export function loadStatsAndScore(reportFile: string): {
  stats: TestStats;
  score: number;
} {
  const stats = loadTestStats(reportFile);
  const score = computeCoverageScore(stats);
  return { stats, score };
}

function walkSuites(
  suites: PlaywrightSuite[] | undefined,
  parentTitle: string,
  chunks: string[]
): void {
  for (const suite of suites ?? []) {
    const suiteTitle = [parentTitle, suite.title].filter(Boolean).join(' › ');
    if (suite.suites?.length) walkSuites(suite.suites, suiteTitle, chunks);
    for (const spec of suite.specs ?? []) {
      const file = spec.file ?? suite.file ?? 'unknown';
      for (const test of spec.tests ?? []) {
        const results = test.results ?? [];
        const last = results[results.length - 1];
        const bad =
          test.status === 'unexpected' ||
          last?.status === 'failed' ||
          last?.status === 'timedOut' ||
          last?.status === 'interrupted';
        if (!bad) continue;
        const nodeId = `${file}:${spec.line ?? '?'} › ${spec.title}${test.projectName ? ` [${test.projectName}]` : ''}`;
        const errParts: string[] = [];
        if (last?.errors?.length) {
          for (const e of last.errors) {
            errParts.push(e.message || '');
            if (e.stack) errParts.push(e.stack);
          }
        } else {
          errParts.push(`(status: ${last?.status ?? test.status ?? 'unknown'})`);
        }
        chunks.push(`TEST: ${nodeId}\n${errParts.join('\n')}`);
      }
    }
  }
}

/** Human-readable failure summary for LLM / debugging. */
export function formatFailuresFromReportFile(reportFile: string): string {
  if (!existsSync(reportFile)) {
    return 'No report file found — runner may have crashed.';
  }
  let report: PlaywrightJsonReport;
  try {
    report = JSON.parse(readFileSync(reportFile, 'utf8')) as PlaywrightJsonReport;
  } catch {
    return 'Could not parse report file.';
  }

  const chunks: string[] = [];

  if (Array.isArray(report.errors) && report.errors.length) {
    for (const e of report.errors) {
      const msg = typeof e === 'string' ? e : (e.message ?? JSON.stringify(e));
      chunks.push(`GLOBAL ERROR:\n${msg}`);
    }
  }

  walkSuites(report.suites, '', chunks);

  if (chunks.length === 0) {
    return 'No failure details found in the report.';
  }
  return chunks.join('\n\n---\n\n');
}
