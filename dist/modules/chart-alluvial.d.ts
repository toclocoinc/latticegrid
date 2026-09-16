/*!
 * Lattice Grid 1.62.0, chart-alluvial module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The alluvial extension type (BACKLOG-0000886). Importing this module
 * registers `alluvial`. Ribbons from `source` categories to `target`
 * categories sized by `value` — categorical flow between two dimensions.
 */
export function drawAlluvial(ctx: object): object;
/** The alluvial binding: aggregates source→target flows off the grid's rows. */
export function bindAlluvial(grid: Grid, spec: object): object;
export default drawAlluvial;
