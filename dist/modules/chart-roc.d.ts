/*!
 * Lattice Grid 1.62.0, chart-roc module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The ROC / PR / calibration extension chart type (BACKLOG-0000886). Importing
 * this module registers `roc`. `spec.curve` chooses `'roc'` (default, with the
 * chance diagonal and AUC), `'pr'`, or `'calibration'`; `label` is the outcome
 * column (positive when truthy or equal to `spec.positive`), `score` the model
 * score.
 */
export function drawRoc(ctx: object): object;
/** The ROC binding: reads the outcome and score off the grid's rows. */
export function bindRoc(grid: Grid, spec: object): object;
export default drawRoc;
