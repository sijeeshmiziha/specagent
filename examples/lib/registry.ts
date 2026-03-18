/**
 * Module registry — imports all example modules and exports them in order.
 * Used by the interactive launcher (run.ts).
 */

import type { ExampleModule } from './types.js';

import quickStart from '../quick-start/index.js';
import cliLoop from '../cli-loop/index.js';
import cliExploreGenerateRun from '../cli-explore-generate-run/index.js';
import mcpWorkflow from '../mcp-workflow/index.js';
import programmaticApi from '../programmatic-api/index.js';

/** All example modules in recommended order. */
export const modules: ExampleModule[] = [
  quickStart,
  cliLoop,
  cliExploreGenerateRun,
  mcpWorkflow,
  programmaticApi,
];
