/*!
 * Lattice Grid 1.86.6, chart-venn module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The Venn extension type. Importing this module registers
 * `venn`: two or three sets (boolean columns in `sets`, or a multi-value column
 * in `set`) as circles with areas proportional to set sizes and overlaps
 * fitted to the rows in common (exact for two sets, a reported best fit for
 * three), every region's count written in it. A click filters the grid to
 * exactly that region's rows. More than three sets are refused by name,
 * pointing at an UpSet-style bar chart.
 */
export function drawVenn(ctx: object): object;
/** The Venn binding: reads membership off the grid's rows and counts every region. */
export function bindVenn(grid: Grid, spec: object): object;
/** The area two circles of radii `r1` and `r2` share when their centres are `d` apart. */
export function lensArea(r1: number, r2: number, d: number): number;
/** The centre distance that gives two circles a given overlap area. */
export function distanceFor(r1: number, r2: number, overlap: number): number;
/** Lay out the circles for a binding, with the fit error. */
export function fitCircles(bound: object): { circles: { x: number; y: number; r: number }[]; error: number; regionErrors: Record<string, number>; exact: boolean };
/** The filter for exactly the rows of one region. */
export function regionFilter(bound: object, mask: number): object;
/** The most sets a Venn draws: 3. */
export const MAX_SETS: number;
export default drawVenn;
