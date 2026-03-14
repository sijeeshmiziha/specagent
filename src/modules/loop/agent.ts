/**
 * Core iterate loop — explore → generate → run → fix → repeat.
 *
 * Progress tracked by simple pass/fail counts.
 */

import type { ChatModel } from '../../lib/models/types.js';
import type { Workspace } from '../../lib/workspace/index.js';
import { runTestRunner } from '../test-runner/agent.js';
import { runAutofix } from '../autofix/agent.js';
import { generateMultiFile } from '../generate-suite/multi-file.js';

export interface LoopOptions {
  url: string;
  workspace: Workspace;
  model: ChatModel;
  maxIterations?: number;
  maxFixAttempts?: number;
  stagnationLimit?: number;
}

export interface LoopResult {
  passed: number;
  failed: number;
  total: number;
  iterations: number;
  stoppedReason: 'all_pass' | 'max_iterations' | 'stagnation';
}

export async function runLoop(options: LoopOptions): Promise<LoopResult> {
  const {
    url,
    workspace,
    model,
    maxIterations = 10,
    maxFixAttempts = 5,
    stagnationLimit = 3,
  } = options;

  let lastPassed = -1;
  let stagnationCount = 0;
  let iterations = 0;

  const sep = '='.repeat(60);
  console.log(`${sep}\nAgentQX — Loop`);
  console.log(`  url             : ${url}`);
  console.log(`  max_iterations  : ${maxIterations}`);
  console.log(`  max_fix_attempts: ${maxFixAttempts}`);
  console.log(`  stagnation_limit: ${stagnationLimit}`);
  console.log(`  model           : ${model.modelName} (${model.provider})`);
  console.log(`  workspace       : ${workspace.dir}`);
  console.log(sep);

  for (let i = 1; i <= maxIterations; i++) {
    iterations = i;
    console.log(`\n[Iteration ${i}/${maxIterations}]`);

    // Run tests
    const run = runTestRunner({ workspace, stdio: 'pipe', quiet: true });
    const { stats } = run;
    console.log(
      `  passed=${stats.passed}  failed=${stats.failed}  errors=${stats.errors}  total=${stats.total}`
    );

    // All pass → done
    if (stats.failed === 0 && stats.errors === 0 && stats.total > 0) {
      console.log('\nAll tests passing. Done!');
      return {
        passed: stats.passed,
        failed: 0,
        total: stats.total,
        iterations,
        stoppedReason: 'all_pass',
      };
    }

    // Fix cycle
    if (stats.failed > 0 || stats.errors > 0) {
      let fixImproved = false;
      for (let fix = 1; fix <= maxFixAttempts; fix++) {
        console.log(`  Fix attempt ${fix}/${maxFixAttempts}...`);
        const fixResult = await runAutofix({ workspace, model });
        if (!fixResult.fixed) {
          console.log('  No fixes produced, moving on.');
          break;
        }

        const rerun = runTestRunner({ workspace, stdio: 'pipe', quiet: true });
        console.log(
          `  After fix: passed=${rerun.stats.passed}  failed=${rerun.stats.failed}  errors=${rerun.stats.errors}`
        );

        if (rerun.stats.failed === 0 && rerun.stats.errors === 0 && rerun.stats.total > 0) {
          console.log('\nAll tests passing after fix. Done!');
          return {
            passed: rerun.stats.passed,
            failed: 0,
            total: rerun.stats.total,
            iterations,
            stoppedReason: 'all_pass',
          };
        }

        if (rerun.stats.passed > stats.passed) {
          fixImproved = true;
        } else {
          console.log('  No improvement from fix, stopping fix cycle.');
          break;
        }
      }

      // Check stagnation
      const currentRun = runTestRunner({ workspace, stdio: 'pipe', quiet: true });
      if (currentRun.stats.passed > lastPassed) {
        lastPassed = currentRun.stats.passed;
        stagnationCount = 0;
      } else {
        stagnationCount++;
        console.log(`  Stagnation: ${stagnationCount}/${stagnationLimit}`);
      }

      if (stagnationCount >= stagnationLimit) {
        console.log(`\nStopping: no improvement for ${stagnationLimit} rounds.`);
        return {
          passed: currentRun.stats.passed,
          failed: currentRun.stats.failed,
          total: currentRun.stats.total,
          iterations,
          stoppedReason: 'stagnation',
        };
      }

      // Check for uncovered pages and generate more tests
      if (!fixImproved) {
        const siteMap = workspace.readSiteMap() as {
          pages?: { url: string; title: string; elements: Record<string, unknown> }[];
        } | null;
        if (siteMap?.pages) {
          const existingFiles = workspace.testFiles();
          const coveredSlugs = new Set(
            existingFiles.map(f => {
              const base = f.split('/').pop() ?? '';
              return base.replace('.spec.ts', '');
            })
          );

          const uncoveredPages = siteMap.pages.filter(p => {
            const slug = pageUrlToSlug(p.url, url);
            return !coveredSlugs.has(slug) && slug !== 'fixtures';
          });

          if (uncoveredPages.length > 0) {
            console.log(`  Generating tests for ${uncoveredPages.length} uncovered page(s)...`);
            await generateMultiFile({
              workspace,
              pages: uncoveredPages,
              baseUrl: url,
              model,
            });
          }
        }
      }
    }
  }

  // Final state
  const finalRun = runTestRunner({ workspace, stdio: 'pipe', quiet: true });
  console.log(`\nMax iterations (${maxIterations}) reached.`);
  return {
    passed: finalRun.stats.passed,
    failed: finalRun.stats.failed,
    total: finalRun.stats.total,
    iterations,
    stoppedReason: 'max_iterations',
  };
}

function pageUrlToSlug(pageUrl: string, baseUrl: string): string {
  try {
    const parsed = new URL(pageUrl);
    const base = new URL(baseUrl);
    let pathname = parsed.pathname.replace(base.pathname, '');
    if (!pathname || pathname === '/') return 'homepage';
    pathname = pathname.replace(/^\//, '').replace(/\/$/, '');
    return (
      pathname
        .replace(/\//g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .slice(0, 50) || 'page'
    );
  } catch {
    return 'page';
  }
}
