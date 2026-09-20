/*!
 * Lattice Grid 1.66.0, kpi module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/** A row backing a KPI aggregate: any object. Its identity comes from `rowKey`. */
type KPIRow = Record<string, unknown>;

/** The aggregation kinds a tile can compute. `custom` is a host reducer over the rows. */
type KPIAggregation = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'countDistinct' | 'custom';

/** Number formatting for a tile value. `percent` treats the value as a ratio (0.42 → 42%). */
type KPIFormat =
  | 'number' | 'currency' | 'percent' | 'compact'
  | { type?: 'number' | 'currency' | 'percent' | 'compact'; decimals?: number; currency?: string; locale?: string };

/**
 * A semantic threshold: two cut points and a direction. `higherIsBetter` (the
 * default) makes a value at/above `warn` good, at/above `critical` a warning,
 * below it critical; `lowerIsBetter` mirrors it. Colour is a host concern.
 */
interface KPIThresholds {
  warn: number;
  critical: number;
  direction?: 'higherIsBetter' | 'lowerIsBetter';
}

/** An explicit band: the `status` of the first band whose half-open `[min, max)` contains the value. */
interface KPIBand {
  min?: number;
  max?: number;
  status: 'good' | 'warn' | 'critical';
}

/** An optional sparkline series: the `y` field plotted in order of the `x` field (or insertion). */
interface KPISparkline {
  x?: string;
  y: string | ((row: KPIRow) => unknown);
}

/** An aggregate stat tile: the routed rows reduced to one number, with optional filter, format, threshold and trend. */
interface KPIStatTile {
  /** Absent, or `'stat'`: the default tile kind. */
  kind?: 'stat';
  /** A stable identity for the tile (defaults to the label, then the index). */
  id?: string;
  /** The tile's accessible label. */
  label?: string;
  /** The aggregation kind, or a reducer `(rows, tile) => value` for a custom tile. */
  aggregation?: KPIAggregation | ((rows: KPIRow[], tile: object) => unknown);
  /** The reducer for a `custom` aggregation, when `aggregation` is the string `'custom'`. */
  compute?: (rows: KPIRow[], tile: object) => unknown;
  /** The field the aggregation reads (a path or accessor). Ignored by `count`. */
  field?: string | ((row: KPIRow) => unknown);
  /** A predicate limiting the rows this tile aggregates. */
  filter?: (row: KPIRow) => boolean;
  /** Value formatting. */
  format?: KPIFormat;
  /** A comparison target rendered alongside the value. */
  target?: number;
  /** A baseline the tile's delta is measured against. */
  baseline?: number;
  /** Threshold bands, either two cut points or an explicit band list. */
  thresholds?: KPIThresholds;
  /** Explicit status bands (an alternative to `thresholds`). */
  bands?: KPIBand[];
  /** A trend sparkline series. */
  sparkline?: KPISparkline | string;
}

/**
 * A clock tile: the device clock, not an aggregate — the
 * date on one line and the time on the next, ticking once a second from one
 * shared panel timer. It takes none of a stat tile's measurement options
 * (`aggregation`, `field`, `format`, `thresholds`, `bands`, `target`,
 * `baseline`, `sparkline`): supplying any of them is reported as a
 * configuration warning by name and ignored, because a tile that measures
 * nothing has nothing for them to apply to.
 */
interface KPIClockTile {
  /** Discriminates a clock tile from an aggregate stat tile. */
  kind: 'clock';
  /** A stable identity for the tile (defaults to the label, then the index). */
  id?: string;
  /** The tile's accessible label (e.g. the city or zone it names). */
  label?: string;
  /**
   * Any IANA zone name (`'Europe/London'`). Omitted, the tile shows the
   * viewer's local time. A name `Intl.DateTimeFormat` does not recognise is
   * reported through the usual diagnostics warning and the tile falls back
   * to local time rather than rendering nothing.
   */
  timeZone?: string;
  /**
   * The locale the date and time are formatted in — the tile's own, else the
   * panel's `KPIConfig.locale`, else the browser's default. A 24-hour clock
   * or a 12-hour one with an AM/PM marker follows from the locale itself
   * (`Intl.DateTimeFormat`'s own convention), never a separate option.
   */
  locale?: string;
  /** Show the seconds on the time line. Default `true`. */
  seconds?: boolean;
  /** Show the date line at all. Default `true`. */
  date?: boolean;
}

/** One tile: a `kind`-discriminated aggregate stat tile (the default) or a clock tile. */
type KPITile = KPIStatTile | KPIClockTile;

/**
 * The hierarchy a KPI panel arranges its tiles into: a rail
 * of top-level items that expand to the indicators beneath them, each parent
 * highlighted with the worst status below it.
 *
 * The shape is declared with `path` or `parentKey` — the same two shapes the
 * grid's tree data and the tree-select editor take — over the **tile specs**,
 * not the rows. With neither declared, one is derived by splitting the tile
 * ids on `separator`, so `system.compute.cpu` files itself under Compute
 * under System. A panel whose ids carry no separator stays flat, and `false`
 * keeps it flat whatever they look like.
 *
 * A tile's `field` is never a source: a dot there already means a nested
 * object property.
 */
interface KPITreeConfig {
  /** The tile's own place in the hierarchy, its own segment last. */
  path?: (tile: KPITile) => (string | number)[];
  /** The id of the tile this one sits under, or a reader for it. */
  parentKey?: string | ((tile: KPITile) => unknown);
  /** The heading tiles whose parent is not in the panel are gathered under. */
  orphans?: 'root' | string;
  /** The separator a derived hierarchy splits a tile id on. Defaults to `.`. */
  separator?: string;
  /** Which branches start open: every one (`true`), or these node keys. */
  expanded?: true | string[];
}

/**
 * One node of the rail.
 *
 * **No value rolls up.** `value` and `formatted` are the node's own tile's
 * reading, and are `null` on a level the hierarchy synthesised, because the
 * running accumulators cannot be composed without a rescan.
 *
 * **Severity does.** `rollup` is the worst status at or below the node, which
 * is what a collapsed branch reports. `unknown` is excluded from it on
 * purpose — ranking "nothing was measured" as the worst would hide a real
 * warning underneath it — and is surfaced as `unknown`, a count of the
 * descendants that measured nothing, so neither can pass unnoticed.
 */
interface KPINodeModel {
  /** The node's stable identity: the tile id, or the path of a synthesised level. */
  key: string;
  /** The tile id, or null on a synthesised level. */
  id: string | null;
  label: string;
  /** Depth, 0 at the top level. */
  level: number;
  /** Its place among its siblings, from 1, and how many there are. */
  posinset: number;
  setsize: number;
  hasChildren: boolean;
  expanded: boolean;
  children: KPINodeModel[];
  /** The node's own tile, or null on a synthesised level. */
  tile: KPITileModel | null;
  value: unknown;
  formatted: string | null;
  /** The node's own status. */
  status: 'good' | 'warn' | 'critical' | 'unknown' | null;
  /** The worst status at or below the node. Never `unknown`. */
  rollup: 'good' | 'warn' | 'critical' | null;
  /** How many tiles at or below the node measured nothing. */
  unknown: number;
  /** How many tiles are at or below the node. */
  items: number;
}

/** A computed tile, as it appears in the model. */
interface KPITileModel {
  id: string;
  label: string;
  /** `'stat'` for an aggregate tile, `'clock'` for a clock tile. */
  kind: 'stat' | 'clock';
  aggregation: string;
  field?: string;
  /** For a clock tile, the read instant as epoch milliseconds. */
  value: unknown;
  /** For a clock tile, the date and time text joined by a space (the same text `clock.date` and `clock.time` carry separately). */
  formatted: string;
  /** Present only on a clock tile: the date and time lines rendered separately. `date` is `null` when the tile was given `date: false`. */
  clock?: { date: string | null; time: string };
  /**
   * The tile's semantic band, or `unknown` when the tile measured nothing.
   * `unknown` is decided from data presence before any threshold is
   * consulted: an aggregation over nothing returns the identity of its
   * operation (`sum` and `count` return 0), and 0 is a number a threshold
   * grades, so without it an empty panel would report as a healthy one.
   *
   * Two things make a tile `unknown`: the panel holds no rows at all, or the
   * tile's `field` names no column on the bound grid, so it never read a cell
   * to reduce over. A tile whose `filter` matches none of the rows the panel
   * *does* hold is neither — it has measured a real zero and is banded
   * normally. `null` means the tile has no thresholds or bands configured.
   */
  status: 'good' | 'warn' | 'critical' | 'unknown' | null;
  target?: number;
  baseline?: number;
  delta: number | null;
  deltaPercent: number | null;
  deltaFormatted?: string;
  count: number;
  sparkline: number[] | null;
}

/** The payload every tile event carries. */
interface KPIEvent {
  tile: KPITileModel;
  id: string;
  originalEvent?: unknown;
}

/** KPI panel configuration. */
interface KPIConfig {
  rows?: KPIRow[];
  grid?: unknown;
  rowKey?: string | ((row: KPIRow) => unknown);
  /**
   * Extra columns of the bound `grid` to project onto the rows a tile `filter`
   * sees, beyond the fields the tiles themselves declare. A grid-bound panel
   * hands a filter a projection, not a whole grid row, so a filter over a
   * column no tile names would otherwise read `undefined` and report a
   * confident zero. Ignored on a panel over a plain `rows` array.
   */
  fields?: string[];
  tiles?: KPITile[];
  columns?: number;
  ariaLabel?: string;
  nullText?: string;
  /**
   * The default locale a clock tile formats in when the tile itself declares
   * none; falls back to the browser's default. No effect
   * on a stat tile, which takes its own `format.locale`.
   */
  locale?: string;
  /** Arrange the tiles as a hierarchy; `false` keeps the panel flat. */
  tree?: KPITreeConfig | false;
  /**
   * The catalogue the panel's own text is read from. A panel routinely has no
   * grid to borrow one off — two of its three input modes have none — so this
   * is the first-class way to translate it. A grid's own `messages` satisfies
   * the shape; a key it does not carry falls back to English.
   */
  messages?: { t(key: string, params?: Record<string, unknown>): string };
  onTileClick?: (event: KPIEvent) => void;
  onTileDblClick?: (event: KPIEvent) => void;
  onTileContextMenu?: (event: KPIEvent) => void;
  onNodeToggle?: (event: { key: string; expanded: boolean; node?: KPINodeModel }) => void;
  onChange?: (event: { model: { tiles: KPITileModel[]; nodes?: KPINodeModel[] } }) => void;
}

/** The keyed-diff consumer surface a KPI panel shares with a grid, so a Data Router routes to it directly. */
interface KPIRows {
  apply(change: { add?: KPIRow[]; update?: KPIRow[]; remove?: unknown[] }): void;
  forEach(fn: (row: KPIRow, key: unknown) => void): void;
  readonly count: number;
}

/**
 * A KPI / stat-tile panel: a grid of aggregate tiles over a dataset. It
 * consumes data through the same keyed-diff `rows.apply` contract a grid
 * exposes, so `dataRouter.attach(value, kpi)` drives it like any other viewer,
 * updating each tile incrementally from the routed delta.
 */
interface KPI {
  readonly el: unknown | null;
  readonly rowKey: string | ((row: KPIRow) => unknown);
  /** Whether the panel renders as a hierarchy rather than a flat tile grid. */
  readonly tree: boolean;
  rows: KPIRows;
  tiles(): KPITileModel[];
  tile(id: string): KPITileModel | undefined;
  value(id: string): unknown;
  /** The top-level nodes of the hierarchy. Empty on a flat panel. */
  nodes(): KPINodeModel[];
  /** One node by its key, at any depth. */
  node(key: string): KPINodeModel | undefined;
  /** The nodes on screen: the roots, plus the children of every open branch. */
  visibleNodes(): KPINodeModel[];
  expand(key: string): KPI;
  collapse(key: string): KPI;
  toggle(key: string): KPI;
  setRows(rows: KPIRow[]): KPI;
  refresh(): KPI;
  getState(): object;
  setState(snapshot: object): KPI;
  on(name: string, fn: (event: KPIEvent) => void): () => void;
  off(name: string, fn: (event: KPIEvent) => void): void;
  destroy(): void;
}

/**
 * Create a KPI / stat-tile panel over rows or a bound grid. Pass a DOM element
 * to render into, or `null` for a headless panel that computes the same tile
 * model without a DOM.
 */
export function createKPI(el: HTMLElement | null, config?: KPIConfig): KPI;
export default createKPI;
