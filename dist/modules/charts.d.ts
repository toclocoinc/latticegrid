/*!
 * Lattice Grid 1.60.0, charts module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  CellRange,
  Chart,
  ChartSpec,
  ChartType,
  Grid,
  RegressionCoefficient,
  RegressionModel,
  RegressionSpec,
} from '../lattice-grid.js';

/** Every type name `createChart` accepts. */
export const TYPES: readonly ChartType[];
/** The built-in colour schemes, by name. */
export const SCHEMES: Readonly<Record<string, readonly string[]>>;
export const PALETTE: readonly string[];
export function createChart(spec: ChartSpec): Chart;
/**
 * Chart a selected cell range. Derives the chart from the range's shape — a
 * leading text column becomes the categories, the numeric columns become the
 * measures — and returns the live chart, or null when the range has nothing
 * to measure. Respects hidden and unreadable columns. The type is a sensible
 * default the caller can change with `chart.update({ type })`.
 */
export function chartRange(
  grid: Grid,
  opts: {
    container: Element | string;
    range?: CellRange;
    type?: ChartType;
  } & Partial<ChartSpec>,
): Chart | null;
/** Would {@link chartRange} draw something for the grid's current selection? */
export function canChartRange(grid: Grid, opts?: { range?: CellRange }): boolean;
/**
 * Decide what a chart of a range should be, without drawing it: the type, the
 * category column, the measure columns, and a `spec` ready for `createChart`
 * — or a `reason` naming why the range cannot be charted.
 */
export function deriveRangeSpec(
  grid: Grid,
  opts?: { range?: CellRange; type?: ChartType },
): {
  spec: ChartSpec | null;
  type: ChartType | null;
  x: string | null;
  measures: string[];
  columns: string[];
  reason: string | null;
};
/**
 * Turn a fitted regression model into diagnostic chart specs ready for
 * `createChart` (BACKLOG-0000812). Pass a precomputed `model`, or a `spec` to
 * fit one over the grid, and the `fitted` and `residual` fit-shadow column ids
 * the residual and QQ plots draw over.
 *
 * The presets that map onto grid columns come back as drawable specs: `fit`
 * (the fit line with its confidence band), `residualsFitted`, `qq`, and
 * `multicollinearity` (a correlogram over the predictors, with the model's
 * `vif` alongside). The three that need a per-row or per-coefficient quantity
 * the grid has no column for — `scaleLocation`, `residualsLeverage`,
 * `coefficientForest` — come back with a null `spec` and a stable `reason`,
 * rather than silently dropped.
 */
export function regressionPlots(
  grid: Grid,
  opts?: {
    model?: RegressionModel;
    spec?: RegressionSpec;
    fitted?: string;
    residual?: string;
    rows?: object[] | ((grid: Grid) => object[]);
    confidence?: number;
  },
): {
  model: RegressionModel | null;
  plots: Record<
    'fit' | 'residualsFitted' | 'qq' | 'multicollinearity'
      | 'scaleLocation' | 'residualsLeverage' | 'coefficientForest',
    {
      spec: ChartSpec | null;
      reason: string | null;
      vif?: number[] | null;
      coefficients?: RegressionCoefficient[] | null;
    }
  >;
};
export function registerScheme(name: string, colours: readonly string[]): void;
export function resolveScheme(spec?: object): object;
export function schemeNames(): string[];
export function setDefaultScheme(name: string): void;
/**
 * The definition an extension chart type registers (BACKLOG-0000886). `draw`
 * receives the base drawing context — `plot`, `bound`, `groups`, `scheme`,
 * `typography`, `fontSize`, `labels`, `grid`, `spec`, `doc` — plus
 * `ctx.helpers`, the base's own toolkit of primitives (element factory, scales,
 * axes, mark pool, distribution kernels), and appends its marks to the layer
 * groups. `bind` optionally supplies the bound data (default: the by-series
 * binder); `freeform` lays the chart out without axis gutters; `labelled`
 * declares that `labels` applies.
 */
interface ChartTypeDefinition {
  draw: (ctx: object) => object;
  bind?: (grid: Grid, spec: ChartSpec) => object;
  freeform?: boolean;
  labelled?: boolean;
}
/**
 * Register an extension chart type so `createChart({ type })` can draw it
 * (BACKLOG-0000886). Extension types ship as their own opt-in modules, so the
 * base charts bundle does not grow for a type a caller never imports — you pay
 * only for the charts you use.
 */
export function registerChartType(name: string, def: ChartTypeDefinition): void;
/** Every registered extension chart-type name, in registration order. */
export function registeredChartTypes(): string[];
export { Chart };
