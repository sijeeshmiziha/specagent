import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { projectPath, PROJECT_ROOT } from '../../src/lib/utils/paths.js';

describe('paths', () => {
  it('projectPath returns absolute path', () => {
    const result = projectPath();
    expect(path.isAbsolute(result)).toBe(true);
  });

  it('projectPath with segments joins them', () => {
    const result = projectPath('a', 'b');
    expect(result).toMatch(/[/]a[/]b$/);
  });

  it('PROJECT_ROOT is absolute', () => {
    expect(path.isAbsolute(PROJECT_ROOT)).toBe(true);
  });
});
