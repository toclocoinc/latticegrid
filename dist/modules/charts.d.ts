/*!
 * Lattice Grid 1.89.1, charts module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  CellRange,
  Chart,
  ChartExtensionType,
  ChartScheme,
  ChartSchemeName,
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
export const SCHEMES: Readonly<Record<ChartSchemeName, ChartScheme>>;
export const PALETTE: readonly string[];
/**
 * Draw a chart over a grid's rows.
 *
 * Theme: no `theme` of its own — it inherits. Its colours are the
 * grid's `--lattice-*` tokens, so `data-theme="dark"` on any ancestor (a layout's
 * `theme: 'dark'`, or `<html>`) darkens it with everything else, and the nearest
 * `data-theme` wins. Load the grid stylesheet, which carries the tokens.
 */
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
    type?: ChartType | ChartExtensionType | (string & {});
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
  opts?: { range?: CellRange; type?: ChartType | ChartExtensionType | (string & {}) },
): {
  spec: ChartSpec | null;
  type: ChartType | ChartExtensionType | (string & {}) | null;
  x: string | null;
  measures: string[];
  columns: string[];
  reason: string | null;
};
/**
 * Turn a fitted regression model into diagnostic chart specs ready for
 * `createChart`. Pass a precomputed `model`, or a `spec` to
 * fit one over the grid, and the `fitted` and `residual` fit-shadow column ids
 * the residual and QQ plots draw over.
 *
 * The presets that map onto grid columns come back as drawable specs: `fit`
 * (the fit line with its confidence band), `residualsFitted`, `qq`,
 * `multicollinearity` (a correlogram over the predictors, with the model's
 * `vif` alongside), and `residualsLeverage` — a bubble sized by Cook's
 * distance over the `stdResidual`, `leverage` and `cooksD` fit-shadow
 * columns, once those are named (a plain scatter without `cooksD`; a null
 * `spec` and `'needs-leverage-and-standardised-residual-columns'` without
 * both of the other two). `scaleLocation` and `coefficientForest` need a
 * per-row or per-coefficient quantity no grid column holds — √|standardised
 * residual| is a transform, and a coefficient is not a row at all — so both
 * are drawn from explicit points computed off the model itself and are
 * drawable whenever the model has them, with a null `spec` and a stable
 * `reason` only when it does not.
 */
export function regressionPlots(
  grid: Grid,
  opts?: {
    model?: RegressionModel;
    spec?: RegressionSpec;
    fitted?: string;
    residual?: string;
    /**
     * The fit-shadow column `residualsLeverage` plots on `y`.
     * Needed alongside `leverage`; without both, `residualsLeverage` comes back
     * `absent('needs-leverage-and-standardised-residual-columns')`.
     */
    stdResidual?: string;
    /** The fit-shadow column `residualsLeverage` plots on `x`. See `stdResidual`. */
    leverage?: string;
    /**
     * Sizes `residualsLeverage`'s points by Cook's distance when named; the
     * preset draws a plain scatter without it.
     */
    cooksD?: string;
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
/**
 * Register a scheme under a name — an ordered palette, or a full
 * {@link ChartScheme} object naming any of `series`, `sequential`,
 * `diverging`, `positive`, `negative`. Partial: whatever a
 * `ChartScheme` leaves out falls back to the default scheme.
 */
export function registerScheme(name: string, scheme: readonly string[] | ChartScheme): void;
export function resolveScheme(spec?: object): object;
export function schemeNames(): string[];
/**
 * Choose the scheme charts use when they name none: a registered name, or a
 * scheme given directly.
 */
export function setDefaultScheme(scheme: string | ChartScheme): void;
/**
 * The definition an extension chart type registers. `draw`
 * receives the base drawing context — `plot`, `bound`, `groups`, `scheme`,
 * `typography`, `fontSize`, `labels`, `grid`, `spec`, `doc` — plus
 * `ctx.helpers`, the base's own toolkit of primitives (element factory, scales,
 * axes, mark pool, distribution kernels), and appends its marks to the layer
 * groups. `bind` optionally supplies the bound data (default: the by-series
 * binder); `freeform` lays the chart out without axis gutters; `labelled`
 * declares that `labels` applies.
 */
export interface ChartTypeDefinition {
  /**
   * Draws the type. It is handed the same context a built-in drawer gets — the plot
   * rectangle, the bound data, the SVG groups, the scheme, the typography and the spec —
   * plus `helpers`, the base's own element, scale, axis and pool primitives, and returns
   * what it drew.
   */
  draw: (ctx: object) => object;
  /**
   * Turns the grid and spec into the bound data `draw` receives. Omitted, the base's
   * by-series binder is used. The bound data may carry `notices` — `{ id, message }`
   * each — which the chart says once, by name, as a developer-facing warning.
   */
  bind?: (grid: Grid, spec: ChartSpec) => object;
  /**
   * Set it when the type lays itself out across the whole frame instead of drawing inside
   * the axis gutters.
   */
  freeform?: boolean;
  /** Whether the spec's `labels` option applies to this type. Default false. */
  labelled?: boolean;
  /**
   * Set it when the type draws a hierarchy: the base binds the grid's grouping, a `parentId`
   * column or a `path` column into one tree and hands it to `draw` as `bound.root`
   * (0001652).
   */
  hierarchical?: boolean;
  /**
   * With `hierarchical`: a row counts one when the spec names no `y`, so a hierarchy with no
   * measure still has a size.
   */
  count?: boolean;
  /**
   * Set it when the type plays its own motion (a race, a fold): the base's animator then
   * leaves its marks alone. A type that leaves it unset is animated by
   * the base — its keyed `rect`, `circle`, `line`, `path` and `text` marks move, grow in
   * and shrink out like a built-in type's. `ctx.helpers.frameLoop` and `ctx.helpers.tween`
   * are the engine's own frame loop and interpolation, for a type that plays its own.
   */
  animates?: boolean;
}
/**
 * Register an extension chart type so `createChart({ type })` can draw it. Extension types ship as their own opt-in modules, so the
 * base charts bundle does not grow for a type a caller never imports — you pay
 * only for the charts you use.
 */
export function registerChartType(name: string, def: ChartTypeDefinition): void;
/** Every registered extension chart-type name, in registration order. */
export function registeredChartTypes(): string[];

/**
 * One data channel a chart type binds, for a generated editor:
 * the stable channel name, the kind of field it takes, and the flags an editor
 * reads. Carries no human label — that is the consuming UI's own i18n.
 */
export interface ChartRole {
  /** The channel name (`x`, `y`, `series`, `measures`, `size`, …). */
  role: string;
  /** The kind of field it binds. */
  accepts: 'dimension' | 'measure' | 'field';
  /** The spec-options path the field is written to, when it differs from `role`. */
  path?: string;
  /** Whether the type cannot draw without it. */
  required?: boolean;
  /** Whether more than one field may be bound. */
  repeatable?: boolean;
  /** Whether it carries an aggregation (a measure). */
  aggregated?: boolean;
  /** Whether a date in it may be bucketed by period. */
  bucketable?: boolean;
  /** The sibling path an aggregation is written to, when it is not stored with the field (a KPI tile's `aggregation`). */
  aggPath?: string;
  /** For a repeatable role whose entries are objects, the key the field is written to (a grid column's `field`). */
  entryKey?: string;
  /** The options each entry carries, named by their path inside the entry (a grid column's `layout.width`). */
  entryOptions?: ChartOption[];
  /** Whether the entries' order is meaningful, so an editor offers to move one earlier or later. */
  orderable?: boolean;
}

/**
 * One formatting option a chart type honours, for a generated editor: the dotted spec path and the control's machine-readable
 * type, enum or range.
 */
export interface ChartOption {
  /** The dotted path into the chart spec (`title`, `axis.x.title`). */
  name: string;
  /** The control kind; `list` is an ordered list of strings, such as a palette's colours. */
  type: 'string' | 'boolean' | 'number' | 'enum' | 'list';
  /** The choices, for an enum (a choice may be `true`, as `stack: true` is). */
  values?: Array<string | boolean>;
  /** What the chart does when the option is unset, so a control shows the effective value. */
  default?: string | boolean | number;
  /** What a string or list holds, when it is a format mask or a colour rather than free text. */
  format?: 'number' | 'date' | 'colour';
  /** The least a number may be. */
  min?: number;
  /** The most a number may be. */
  max?: number;
  /** The number's step. */
  step?: number;
}

/** The full generated-editor model for a chart type. */
export interface ChartEditorModel {
  /** The chart type. */
  type: string;
  /** Its data channels, in editor order. */
  roles: ChartRole[];
  /** Its formatting options, in editor order. */
  options: ChartOption[];
  /** The aggregations a measure role offers. */
  aggregations: ReadonlyArray<string>;
}

/**
 * The editor model for a chart type: its roles, its options and the
 * aggregations a measure role offers. One call is everything
 * a properties panel needs to generate a type's editor from the registry,
 * never from the panel. An unknown type takes the by-series default, so every
 * registered type has a non-empty editor.
 */
export function chartEditorModel(type: string): ChartEditorModel;
export { Chart };
