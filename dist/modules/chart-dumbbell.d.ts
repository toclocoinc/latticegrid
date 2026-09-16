/*!
 * Lattice Grid 1.62.1, chart-dumbbell module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The dumbbell / connected-dot extension type (BACKLOG-0000886). Importing
 * this module registers `dumbbell`. Two dots (`start`, `end`) joined by a bar
 * per `x` category — the gap is the bar's length.
 */
export function drawDumbbell(ctx: object): object;
/** The dumbbell binding: reads the category and its two numeric columns. */
export function bindDumbbell(grid: Grid, spec: object): object;
export default drawDumbbell;
