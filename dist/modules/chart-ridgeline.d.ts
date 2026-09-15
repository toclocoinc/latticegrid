/*!
 * Lattice Grid 1.61.0, chart-ridgeline module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * The ridgeline (joy plot) extension chart type (BACKLOG-0000886). Importing
 * this module registers `ridgeline` with the base charts module; the base
 * bundle does not include it unless a caller imports it. Draws one
 * kernel-density ridge per category (`x`), stacked and overlapping, over the
 * distribution of a measure (`y`); `spec.overlap` sets the vertical overlap.
 */
export function drawRidgeline(ctx: object): object;
export default drawRidgeline;
