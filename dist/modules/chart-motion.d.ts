/*!
 * Lattice Grid 1.86.0, chart-motion module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  FrameClock,
  Grid,
} from '../lattice-grid.js';

/**
 * The motion-chart extension type. Importing this module
 * registers `motion`: one bubble per `entity`, placed by `x` and `y`, sized
 * by `size` and coloured by `colour`, gliding between the frames of `time`;
 * optional trails for selected entities, log or linear axes, a shared clock
 * with the bar race, and stepped frames under reduced motion.
 */
export function drawMotion(ctx: object): object;
/** The motion binding: per-entity readings by frame, with interpolation. */
export function bindMotion(grid: Grid, spec: object): object;
/** The ticks a log axis labels: 1, 2 and 5 of each power of ten in range. */
export function logTicks(lo: number, hi: number): number[];
/** Make a clock to share between animated charts as `spec.clock`. */
export function createFrameClock(opts?: { speed?: number; frameMs?: number; loop?: boolean; reducedMotion?: boolean }): FrameClock;
export default drawMotion;
