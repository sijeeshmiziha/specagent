import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/cli/index.ts',
    'src/lib/mcp/server/index.ts',
    'src/lib/mcp/server/stdio.ts',
  ],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  target: 'node20',
  external: ['playwright', 'playwright-core', '@playwright/test', 'chromium-bidi'],
  shims: true,
});
