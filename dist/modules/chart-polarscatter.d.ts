/*!
 * Lattice Grid 1.97.0, chart-polarscatter module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The polar scatter extension type. Importing this module
 * registers `polarScatter`: each row a point at the angle of the `x` column
 * (see `ChartPolarOptions.angle`) and the radius of the `y` measure, with an
 * optional `size`, a `series` or `polar.colour`, and `brush: 'select'` /
 * `selection: true` back to the grid.
 */
export function drawPolarScatter(ctx: object): object;
/** The polar scatter binding: reads the angle, radius, size and colour columns off the grid's rows. */
export function bindPolarScatter(grid: Grid, spec: object): object;
/**
 * Where a value sits round the circle, in degrees from the start (0 up to
 * 360), for one of the angle forms `'degrees'`, `'category'`, `'hourOfDay'`,
 * `'dayOfWeek'` or `'month'`; null when the value does not read as that angle.
 * `opts.timeZone` is the zone a time is read in (UTC when absent); for
 * `'category'`, `opts.slot` and `opts.slots` are the value's place and the
 * number of values.
 */
export function angleOf(
  value: unknown,
  kind: string,
  opts?: { timeZone?: string; slot?: number; slots?: number },
): number | null;
export default drawPolarScatter;
