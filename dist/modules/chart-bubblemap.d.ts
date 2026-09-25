/*!
 * Lattice Grid 1.71.3, chart-bubblemap module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The symbol / bubble-map extension type. Importing this
 * module registers `bubblemap`. Points placed by `lon`/`lat`, each a bubble
 * with a square-root radius from `size`; needs no outlines and fetches nothing.
 */
export function drawBubbleMap(ctx: object): object;
/** The bubble-map binding: reads the coordinate and size columns off the rows. */
export function bindBubbleMap(grid: Grid, spec: object): object;
export default drawBubbleMap;
