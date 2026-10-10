/*!
 * Lattice Grid 1.98.0, chart-scatter3d module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The 3D scatter extension chart type. Importing this
 * module registers `scatter3d`. Draws `x`/`y`/`z` (each a numeric column or a
 * number) as markers coloured by `color` (a fixed colour or
 * `{ field, stops, domain? }`), with orbit/zoom/pan and a colour legend.
 */
export function drawScatter3d(ctx: object): object;
/** The scatter3d binding: reads the numeric `x`, `y` and `z` off the grid's rows. */
export function bindScatter3d(grid: Grid, spec: object): object;
export default drawScatter3d;
