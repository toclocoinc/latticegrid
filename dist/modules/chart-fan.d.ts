/*!
 * Lattice Grid 1.63.0, chart-fan module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The fan / forecast extension chart type (BACKLOG-0000886). Importing this
 * module registers `fan`. Draws `y` (history) as a solid line, `forecast` as a
 * dashed continuation, and the `lower`/`upper` interval as a widening band.
 */
export function drawFan(ctx: object): object;
/** The fan binding: reads the history, forecast and interval columns in row order. */
export function bindFan(grid: Grid, spec: object): object;
export default drawFan;
