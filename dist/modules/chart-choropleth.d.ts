/*!
 * Lattice Grid 1.84.0, chart-choropleth module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The choropleth extension type (GEO-3). Importing this module registers
 * `choropleth`. Each row's own Polygon/MultiPolygon, read from a `geometry`
 * column, filled by `y` through the chart's ramp — no geometry pack needed;
 * `shapes` is an optional backdrop. A Point row draws as a marker, filled
 * the same way. Shapes with many vertices are simplified for drawing at the
 * projection's pixel tolerance; the data itself is never modified.
 */
export function drawChoropleth(ctx: object): object;
/**
 * The choropleth binding: reads each display row's geometry, label and
 * measure off the grid, and counts the rows a geometry column could not
 * place as `unplaced`.
 */
export function bindChoropleth(grid: Grid, spec: object): object;
export default drawChoropleth;
