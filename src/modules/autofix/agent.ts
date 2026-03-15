/**
 * Autofix — single-pass fix function.
 *
 * Reads failures from the report, calls the LLM to fix them, writes the fixed files.
 * No iteration loop — that lives in modules/loop/agent.ts.
 */

import type { Workspace } from '../../lib/workspace/index.js';
import type { ChatModel } from '../../lib/models/types.js';
import { formatFailuresFromReportFile } from '../../lib/utils/playwright-report.js';
import { applyMultiFileFixes } from './prompts.js';

export interface RunAutofixOptions {
  workspace: Workspace;
  model: ChatModel;
}

export interface RunAutofixResult {
  fixed: boolean;
  filesChanged: number;
}

export async function runAutofix(options: RunAutofixOptions): Promise<RunAutofixResult> {
  const { workspace, model } = options;
  const reportFile = workspace.reportFile;

  const failures = formatFailuresFromReportFile(reportFile);
  if (
    failures === 'No failure details found in the report.' ||
    failures === 'No report file found — runner may have crashed.'
  ) {
    return { fixed: false, filesChanged: 0 };
  }

  console.log(`  Calling ${model.modelName} to fix failing test(s)...`);
  const filesChanged = await applyMultiFileFixes({ model, failures, workspace });

  if (filesChanged === 0) {
    console.log('  No fixes produced.');
    return { fixed: false, filesChanged: 0 };
  }

  console.log(`  Applied fixes to ${filesChanged} file(s).`);
  return { fixed: true, filesChanged };
}
