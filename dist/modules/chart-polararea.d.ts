/*!
 * Lattice Grid 1.87.0, chart-polararea module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * The polar area / Nightingale rose extension type.
 * Importing this module registers `polarArea` and its aliases `nightingale`
 * and `rose`. Each `x` category gets an equal angle and the measure `y` sets
 * the wedge's radius (area-true by default, see `ChartSpec.polar`); `stack`
 * stacks the series of a `series` column or of `measures` within a wedge.
 */
export function drawPolarArea(ctx: object): object;
export default drawPolarArea;
