/*!
 * Lattice Grid 1.62.0, chart-arc module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The arc-diagram extension type (BACKLOG-0000886). Importing this module
 * registers `arc`. Nodes on a baseline with `source`→`target` relationships as
 * semicircular arcs, thickness by `value`.
 */
export function drawArc(ctx: object): object;
/** The arc-diagram binding: collects nodes and edges off the grid's rows. */
export function bindArc(grid: Grid, spec: object): object;
export default drawArc;
