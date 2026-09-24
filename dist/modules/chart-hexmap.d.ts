/*!
 * Lattice Grid 1.71.1, chart-hexmap module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The hexbin-map extension type. Importing this module
 * registers `hexmap`. `lon`/`lat` points binned into hexagons shaded by count,
 * so a geographic density reads without overplotting or outlines.
 */
export function drawHexMap(ctx: object): object;
/** The hexbin-map binding: reads the coordinate columns off the grid's rows. */
export function bindHexMap(grid: Grid, spec: object): object;
export default drawHexMap;
