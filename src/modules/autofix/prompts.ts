import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import type { Workspace } from '../../lib/workspace/index.js';
import type { ChatModel } from '../../lib/models/types.js';
import { stripCodeFence } from '../../lib/models/index.js';

const FIX_SYSTEM =
  'You are an expert Playwright Test engineer (TypeScript).\n\n' +
  'You will be given multiple test files and their failures.\n' +
  'Your task: fix the failing tests so they pass.\n\n' +
  'Rules:\n' +
  '- Use getByRole, getByLabel, getByText — NEVER CSS class selectors.\n' +
  '- If a test cannot be fixed (element missing), remove that test block only.\n' +
  '- Do NOT add new tests — only fix or remove failing ones.\n' +
  '- Preserve all passing tests exactly.\n' +
  '- Return ALL files that need changes, each prefixed with a `// FILE: <filename>` marker.\n' +
  '- Return ONLY the corrected TypeScript files — no explanation, no markdown fences.\n';

/** Parse multi-file LLM response split by `// FILE:` markers. */
export function parseMultiFileResponse(response: string): Map<string, string> {
  const files = new Map<string, string>();
  const parts = response.split(/^\/\/ FILE:\s*/m);

  for (const part of parts) {
    if (!part.trim()) continue;
    const newlineIdx = part.indexOf('\n');
    if (newlineIdx < 0) continue;
    const filePath = part.slice(0, newlineIdx).trim();
    const content = part.slice(newlineIdx + 1);
    if (filePath && content.trim()) {
      files.set(filePath, content);
    }
  }

  return files;
}

/** Read all test files, call LLM to fix failures, write fixed files. Returns number of files changed. */
export async function applyMultiFileFixes(opts: {
  model: ChatModel;
  failures: string;
  workspace: Workspace;
}): Promise<number> {
  const { model, failures, workspace } = opts;
  const testFiles = workspace.testFiles();

  let filesContext = '';
  for (const testFile of testFiles) {
    const relPath = path.relative(workspace.dir, testFile);
    const content = readFileSync(testFile, 'utf8');
    filesContext += `// FILE: ${relPath}\n${content}\n\n`;
  }

  const user =
    `Current test files:\n\n${filesContext}\n\n` +
    `Failing tests:\n\n${failures}\n\n` +
    'Fix the failing tests. For each file that needs changes, prefix it with `// FILE: <relative-path>`.\n' +
    'Return ONLY the files that need changes, each prefixed with their path marker.';

  const result = await model.invoke([
    { role: 'system', content: FIX_SYSTEM },
    { role: 'user', content: user },
  ]);

  const fixedFiles = parseMultiFileResponse(stripCodeFence(result));
  if (fixedFiles.size === 0) return 0;

  for (const [relPath, content] of fixedFiles) {
    const fullPath = path.join(workspace.dir, relPath);
    writeFileSync(fullPath, content, 'utf8');
  }

  return fixedFiles.size;
}
