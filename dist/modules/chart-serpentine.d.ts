/*!
 * Lattice Grid 1.86.5, chart-serpentine module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The serpentine timeline extension type. Importing this
 * module registers `serpentine`: the time axis folded into rows joined by
 * half-circle turns, events as markers or spans at the position their time
 * says, turns included. See {@link ChartSerpentineOptions}.
 */
export function drawSerpentine(ctx: object): object;
/** The serpentine binding: dated events (points or spans) in time order. */
export function bindSerpentine(grid: Grid, spec: object): object;
export default drawSerpentine;
