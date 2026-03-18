import { describe, expect, it, afterEach } from 'vitest';
import path from 'node:path';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { readTestsTool } from '../../src/lib/mcp/server/tools/read-tests.js';
import { writeTestsTool } from '../../src/lib/mcp/server/tools/write-tests.js';
import { statusTool } from '../../src/lib/mcp/server/tools/status.js';

const CWD = process.cwd();
const WORKSPACE_SLUG = 'mcp-test-example-com';
const WORKSPACE_DIR = path.join(CWD, '.agentqx', WORKSPACE_SLUG);
const MCP_URL = 'https://mcp-test.example.com';

function rmWorkspace(): void {
  if (existsSync(WORKSPACE_DIR)) rmSync(WORKSPACE_DIR, { recursive: true, force: true });
}

afterEach(rmWorkspace);

describe('agentqx_read_tests', () => {
  it('returns error when tests dir does not exist', async () => {
    const res = await readTestsTool.handler({ url: MCP_URL });
    expect(res.isError).toBe(true);
    const text = (res as { content: { text: string }[] }).content[0].text;
    expect(JSON.parse(text).error).toContain('No tests directory');
  });

  it('returns file content when filename given and file exists', async () => {
    mkdirSync(path.join(WORKSPACE_DIR, 'tests'), { recursive: true });
    const specPath = path.join(WORKSPACE_DIR, 'tests', 'foo.spec.ts');
    writeFileSync(specPath, 'test("x", () => {});', 'utf8');
    const res = await readTestsTool.handler({ url: MCP_URL, filename: 'foo.spec.ts' });
    expect(res.isError).toBeFalsy();
    const text = (res as { content: { text: string }[] }).content[0].text;
    const data = JSON.parse(text);
    expect(data.content).toBe('test("x", () => {});');
    expect(data.bytes).toBe(20);
  });

  it('returns error when filename given but file missing', async () => {
    mkdirSync(path.join(WORKSPACE_DIR, 'tests'), { recursive: true });
    const res = await readTestsTool.handler({ url: MCP_URL, filename: 'missing.spec.ts' });
    expect(res.isError).toBe(true);
    const text = (res as { content: { text: string }[] }).content[0].text;
    expect(JSON.parse(text).error).toContain('File not found');
  });

  it('returns list of .ts files when filename omitted', async () => {
    mkdirSync(path.join(WORKSPACE_DIR, 'tests'), { recursive: true });
    writeFileSync(path.join(WORKSPACE_DIR, 'tests', 'a.spec.ts'), 'a', 'utf8');
    writeFileSync(path.join(WORKSPACE_DIR, 'tests', 'b.ts'), 'b', 'utf8');
    const res = await readTestsTool.handler({ url: MCP_URL });
    expect(res.isError).toBeFalsy();
    const text = (res as { content: { text: string }[] }).content[0].text;
    const data = JSON.parse(text);
    expect(data.files).toHaveLength(2);
    expect(data.total).toBe(2);
  });
});

describe('agentqx_write_tests', () => {
  it('writes file and returns status', async () => {
    const content = 'test("hello", () => {});';
    const res = await writeTestsTool.handler({
      url: MCP_URL,
      content,
      filename: 'test_suite.spec.ts',
    });
    expect(res.isError).toBeFalsy();
    const text = (res as { content: { text: string }[] }).content[0].text;
    const data = JSON.parse(text);
    expect(data.status).toBe('ok');
    expect(data.bytes).toBe(content.length);
    expect(existsSync(path.join(WORKSPACE_DIR, 'tests', 'test_suite.spec.ts'))).toBe(true);
    expect(readFileSync(path.join(WORKSPACE_DIR, 'tests', 'test_suite.spec.ts'), 'utf8')).toBe(
      content
    );
  });

  it('backs up existing file when overwriting', async () => {
    mkdirSync(path.join(WORKSPACE_DIR, 'tests'), { recursive: true });
    const specPath = path.join(WORKSPACE_DIR, 'tests', 'test_suite.spec.ts');
    writeFileSync(specPath, 'old content', 'utf8');
    await writeTestsTool.handler({
      url: MCP_URL,
      content: 'new content',
      filename: 'test_suite.spec.ts',
    });
    const backupPath = path.join(WORKSPACE_DIR, 'tests', 'test_suite.bak.spec.ts');
    expect(existsSync(backupPath)).toBe(true);
    expect(readFileSync(backupPath, 'utf8')).toBe('old content');
    expect(readFileSync(specPath, 'utf8')).toBe('new content');
  });
});

describe('agentqx_status', () => {
  it('returns workspace_dir, test_files, has_site_map, latest_results null when no report', async () => {
    mkdirSync(path.join(WORKSPACE_DIR, 'tests'), { recursive: true });
    const res = await statusTool.handler({ url: MCP_URL });
    expect(res.isError).toBeFalsy();
    const text = (res as { content: { text: string }[] }).content[0].text;
    const data = JSON.parse(text);
    expect(data.workspace_dir).toBe(WORKSPACE_DIR);
    expect(data.has_site_map).toBe(false);
    expect(data.latest_results).toBeNull();
    expect(Array.isArray(data.test_files)).toBe(true);
  });

  it('returns latest_results when report exists', async () => {
    mkdirSync(path.join(WORKSPACE_DIR, 'reports'), { recursive: true });
    const reportPath = path.join(WORKSPACE_DIR, 'reports', 'report.json');
    writeFileSync(
      reportPath,
      JSON.stringify({ stats: { expected: 2, unexpected: 0, flaky: 0, skipped: 0 } }),
      'utf8'
    );
    const res = await statusTool.handler({ url: MCP_URL });
    const text = (res as { content: { text: string }[] }).content[0].text;
    const data = JSON.parse(text);
    expect(data.latest_results).not.toBeNull();
    expect(data.latest_results.passed).toBe(2);
    expect(data.latest_results.total).toBe(2);
  });
});
