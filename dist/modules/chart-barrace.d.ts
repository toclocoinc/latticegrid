/*!
 * Lattice Grid 1.98.0, chart-barrace module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  FrameClock,
  Grid,
} from '../lattice-grid.js';

/**
 * The bar-chart-race extension type. Importing this module
 * registers `barRace`: the top `topN` categories (`x`) by value (`y`) at each
 * distinct `time`, animated between frames with smooth re-ordering, play /
 * pause, speed, a scrubber and a large time label. Under reduced motion it
 * steps frames without tweening.
 */
export function drawBarRace(ctx: object): object;
/** The race binding: frames, per-frame rankings (computed once, on first use) and interpolated bars. */
export function bindBarRace(grid: Grid, spec: object): object;
/** Make a clock to share between animated charts as `spec.clock`. */
export function createFrameClock(opts?: { speed?: number; frameMs?: number; loop?: boolean; reducedMotion?: boolean }): FrameClock;
export default drawBarRace;
