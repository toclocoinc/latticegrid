/*!
 * Lattice Grid 1.88.2, chart-pyramid module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The funnel-family pyramid extension type. Importing this
 * module registers `pyramid`: ordered stages (`x`) and a value (`y`) as stacked
 * slices of one triangle, slice height (or, with `stages.area`, area)
 * proportional to the value; see {@link ChartStagesOptions}.
 */
export function drawPyramid(ctx: object): object;
/** The pyramid binding: ordered stages with their summed value and the rows behind each. */
export function bindPyramid(grid: Grid, spec: object): object;
export default drawPyramid;
