import path from 'node:path';
import { fileURLToPath } from 'node:url';

const _utilsDir = path.dirname(fileURLToPath(import.meta.url));

/** Repository root (`src/lib/utils/` → three levels up). */
export const PROJECT_ROOT = path.resolve(_utilsDir, '..', '..', '..');

export function projectPath(...segments: string[]): string {
  return path.join(PROJECT_ROOT, ...segments);
}
