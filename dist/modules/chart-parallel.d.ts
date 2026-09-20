/*!
 * Lattice Grid 1.66.0, chart-parallel module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The parallel-coordinates extension type. Importing this
 * module registers `parallel`. One polyline per row across the numeric
 * `columns`, each a vertical axis with its own scale; `spec.colourBy` colours
 * by a category.
 */
export function drawParallel(ctx: object): object;
/** The parallel-coordinates binding: reads the dimension columns off the rows. */
export function bindParallel(grid: Grid, spec: object): object;
export default drawParallel;
