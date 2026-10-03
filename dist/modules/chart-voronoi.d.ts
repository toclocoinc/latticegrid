/*!
 * Lattice Grid 1.86.4, chart-voronoi module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * The Voronoi treemap extension type. Importing this module registers
 * `voronoiTreemap`. A hierarchy — a `parentId` column, a `path` column or the grid's grouping —
 * as nested cells of a weighted (power) Voronoi diagram filling a circle or a convex `clip`
 * polygon: every leaf's area is fitted to within `tolerance` (1% by default) of its value's share
 * of the whole, deterministically for the same values and `seed`. Borders are thicker between
 * higher branches, a leaf is named at its centre where the name fits, colour follows the
 * top-level branch or `colourBy`, and with `selection: true` a click selects the rows at or
 * beneath the cell. The fitting runs once per change of the data, on the main thread; the
 * drawing reports it as `fit`.
 */
export function drawVoronoiTreemap(ctx: object): object;
export default drawVoronoiTreemap;
