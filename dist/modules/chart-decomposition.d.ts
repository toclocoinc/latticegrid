/*!
 * Lattice Grid 1.71.1, chart-decomposition module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The seasonal-decomposition panel extension chart type,
 * companion to the `tsTrend`/`tsSeasonal`/`tsResidual` shadow columns.
 * Importing this module registers `decomposition`. Draws a stacked panel per
 * named component column (`observed`/`trend`/`seasonal`/`residual`) sharing one
 * x axis.
 */
export function drawDecomposition(ctx: object): object;
/** The decomposition binding: reads the named component columns in row order. */
export function bindDecomposition(grid: Grid, spec: object): object;
export default drawDecomposition;
