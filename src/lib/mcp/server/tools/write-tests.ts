/**
 * agentqx_write_tests — Write test file(s) to the workspace.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { Workspace } from '../../../workspace/index.js';
import type { ToolRegistryEntry } from '../types.js';

export const writeTestsTool: ToolRegistryEntry = {
  name: 'agentqx_write_tests',
  description: 'Write test file(s) to the workspace. Creates or overwrites test files in tests/.',
  inputSchema: {
    filename: z
      .string()
      .optional()
      .default('test_suite.spec.ts')
      .describe('Test file name (in tests/ directory)'),
    content: z.string().describe('Full TypeScript test file content'),
    url: z.string().describe('URL for workspace isolation.'),
  },
  handler: async raw => {
    const { filename, content, url } = z
      .object({
        filename: z.string().optional().default('test_suite.spec.ts'),
        content: z.string(),
        url: z.string(),
      })
      .parse(raw);

    const ws = new Workspace({ url });
    ws.init();
    const targetDir = ws.testsDir;
    mkdirSync(targetDir, { recursive: true });

    const filePath = path.join(targetDir, filename);

    // Back up existing file
    if (existsSync(filePath)) {
      const backupName = filename.replace('.spec.ts', '.bak.spec.ts');
      const backupPath = path.join(targetDir, backupName);
      writeFileSync(backupPath, readFileSync(filePath, 'utf8'), 'utf8');
    }

    writeFileSync(filePath, content, 'utf8');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'ok',
            path: path.resolve(filePath),
            bytes: content.length,
          }),
        },
      ],
    };
  },
};
