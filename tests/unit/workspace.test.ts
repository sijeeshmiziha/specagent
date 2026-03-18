import { describe, expect, it, afterEach } from 'vitest';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Workspace } from '../../src/lib/workspace/index.js';

const TEST_ROOT = path.join(process.cwd(), '.agentqx-test');

afterEach(() => {
  if (existsSync(TEST_ROOT)) {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  }
});

describe('Workspace', () => {
  it('creates correct directory structure', () => {
    const ws = new Workspace({ rootDir: TEST_ROOT, url: 'https://example.com' });
    ws.init();
    expect(existsSync(ws.testsDir)).toBe(true);
    expect(existsSync(ws.reportsDir)).toBe(true);
    expect(existsSync(ws.snapshotsDir)).toBe(true);
    expect(existsSync(ws.configFile)).toBe(true);
  });

  it('generates correct slug from URL', () => {
    const ws = new Workspace({ rootDir: TEST_ROOT, url: 'https://my-app.example.com/dashboard' });
    expect(ws.slug).toBe('my-app-example-com-dashboard');
  });

  it('writes and reads site map', () => {
    const ws = new Workspace({ rootDir: TEST_ROOT, url: 'https://example.com' });
    ws.init();
    ws.writeSiteMap({ start_url: 'https://example.com', pages: [] });
    const data = ws.readSiteMap() as { start_url: string } | null;
    expect(data?.start_url).toBe('https://example.com');
  });

  it('returns null for missing site map', () => {
    const ws = new Workspace({ rootDir: TEST_ROOT, url: 'https://example.com' });
    expect(ws.readSiteMap()).toBeNull();
  });

  it('testFiles returns [] when tests dir does not exist', () => {
    const ws = new Workspace({ rootDir: TEST_ROOT, url: 'https://example.com' });
    expect(ws.testFiles()).toEqual([]);
  });

  it('testFiles returns only .spec.ts full paths', () => {
    const ws = new Workspace({ rootDir: TEST_ROOT, url: 'https://example.com' });
    ws.init();
    writeFileSync(path.join(ws.testsDir, 'foo.spec.ts'), 'test("x", () => {});', 'utf8');
    writeFileSync(path.join(ws.testsDir, 'other.ts'), 'export {};', 'utf8');
    const files = ws.testFiles();
    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/\.spec\.ts$/);
  });

  it('path() joins segments to dir', () => {
    const ws = new Workspace({ rootDir: TEST_ROOT, url: 'https://example.com' });
    const p = ws.path('a', 'b');
    expect(p).toMatch(/[/]a[/]b$/);
  });

  it('reportFile getter returns path ending with reports/report.json', () => {
    const ws = new Workspace({ rootDir: TEST_ROOT, url: 'https://example.com' });
    expect(ws.reportFile).toMatch(/[/]reports[/]report\.json$/);
  });
});
