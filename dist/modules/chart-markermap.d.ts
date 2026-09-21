/*!
 * Lattice Grid 1.67.0, chart-markermap module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The marker-map extension type. Importing this module registers
 * `markermap`. One marker per row, placed by `lon`/`lat` over a geometry
 * pack's outlines, carrying the row's `label` and its `value` in the value
 * column's own format, and filled from that column's conditional-formatting
 * rules through `grid.formatting.styleFor` — so a red / amber / green
 * availability wall is one rule set and one chart configuration, with no
 * chart-level thresholds and no colour column. `labels: false` leaves the
 * tooltip alone on a dense map; without `shapes` the markers draw on the
 * projection alone.
 */
export function drawMarkerMap(ctx: object): object;
/**
 * The marker-map binding: reads the coordinate, label and value columns off
 * the grid's display rows, asks the grid for each value's formatted text and
 * its rule style, and counts the rows whose coordinates cannot be placed as
 * `unplaced`.
 */
export function bindMarkerMap(grid: Grid, spec: object): object;
export default drawMarkerMap;
