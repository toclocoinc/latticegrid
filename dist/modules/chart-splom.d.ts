/*!
 * Lattice Grid 1.66.0, chart-splom module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The scatter-plot-matrix (SPLOM) extension chart type.
 * Importing this module registers `splom`. Crosses every pair of the numeric
 * `columns` (2–6) as a matrix of scatters, naming each variable on the
 * diagonal.
 */
export function drawSplom(ctx: object): object;
/** The SPLOM binding: reads the numeric `columns` off the grid's visible rows. */
export function bindSplom(grid: Grid, spec: object): object;
export default drawSplom;
