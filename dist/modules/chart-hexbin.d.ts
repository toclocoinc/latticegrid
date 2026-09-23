/*!
 * Lattice Grid 1.71.0, chart-hexbin module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The hexbin / 2D-density extension chart type. Importing
 * this module registers `hexbin`. Bins `x`/`y` points into hexagons shaded by
 * count, so a large scatter reads as a density field rather than overplotting.
 */
export function drawHexbin(ctx: object): object;
/** The hexbin binding: reads the numeric `x` and `y` columns off the grid's rows. */
export function bindHexbin(grid: Grid, spec: object): object;
export default drawHexbin;
