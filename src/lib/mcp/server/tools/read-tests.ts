/**
 * agentqx_read_tests — Read current test file(s) from the workspace.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { Workspace } from '../../../workspace/index.js';
import type { ToolRegistryEntry } from '../types.js';

export const readTestsTool: ToolRegistryEntry = {
  name: 'agentqx_read_tests',
  description: 'Read current test file(s) from the workspace.',
  inputSchema: {
    filename: z
      .string()
      .optional()
      .describe('Specific test file name. If omitted, lists all test files.'),
    url: z.string().describe('URL for workspace isolation.'),
  },
  handler: async raw => {
    const { filename, url } = z
      .object({
        filename: z.string().optional(),
        url: z.string(),
      })
      .parse(raw);

    const ws = new Workspace({ url });
    const targetDir = ws.testsDir;

    if (!existsSync(targetDir)) {
      return {
        isError: true,
        content: [{ type: 'text', text: JSON.stringify({ error: 'No tests directory found.' }) }],
      };
    }

    if (filename) {
      const filePath = path.join(targetDir, filename);
      if (!existsSync(filePath)) {
        return {
          isError: true,
          content: [
            { type: 'text', text: JSON.stringify({ error: `File not found: ${filename}` }) },
          ],
        };
      }
      const content = readFileSync(filePath, 'utf8');
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ path: path.resolve(filePath), content, bytes: content.length }),
          },
        ],
      };
    }

    const files = readdirSync(targetDir).filter(f => f.endsWith('.ts'));
    const result = files.map(f => ({
      name: f,
      path: path.resolve(path.join(targetDir, f)),
      bytes: readFileSync(path.join(targetDir, f), 'utf8').length,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ files: result, total: result.length }, null, 2),
        },
      ],
    };
  },
};
