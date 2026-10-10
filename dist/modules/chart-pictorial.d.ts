/*!
 * Lattice Grid 1.97.0, chart-pictorial module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The pictorial extension type. Importing this module
 * registers `pictorial`: one silhouette split into bands sized by value
 * (`fill`), or an isotype row of icons per category (`repeat`); the shape is an
 * icon name or an SVG path string, sanitised to path data only. See
 * {@link ChartPictorialOptions}.
 */
export function drawPictorial(ctx: object): object;
/** The pictorial binding: ordered categories and values, and the resolved shape. */
export function bindPictorial(grid: Grid, spec: object): object;
export default drawPictorial;
