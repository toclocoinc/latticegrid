/*!
 * Lattice Grid 1.69.0, devtools module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The devtools panel, including the accessibility checks.
 *
 * The grid is handed in rather than imported: a module may depend on nothing
 * in core, or the bundler inlines the whole grid into it.
 */
export function createDevtools(opts: { grid: Grid; container?: Element }): {
  element: Element;
  refresh(): void;
  destroy(): void;
};
export function expose(grid: Grid, name?: string): void;
/**
 * Whether the console entry point is compiled in. A build that replaces the
 * activation token with `false` removes the global entirely; in every other
 * build this is `true`.
 */
export const CONSOLE_ACTIVATION: boolean;
export default createDevtools;
