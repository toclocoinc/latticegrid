/*!
 * Lattice Grid 1.88.1, chart-spiral module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The spiral timeline extension type. Importing this module
 * registers `spiral`: time on an Archimedean spiral, one turn per period, so
 * the same phase of every period lands on one angle. See
 * {@link ChartSpiralOptions}.
 */
export function drawSpiral(ctx: object): object;
/** The spiral binding: dated events (points or spans) in time order, with a value where `y` names one. */
export function bindSpiral(grid: Grid, spec: object): object;
export default drawSpiral;
