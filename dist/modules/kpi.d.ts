/*!
 * Lattice Grid 1.70.0, kpi module type declarations
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
/** Which way is good for a KPI threshold: a higher value, or a lower one. */
export type KpiThresholdDirection = 'higherIsBetter' | 'lowerIsBetter';
interface KPIThresholds {
  /**
   * The cut point between good and warning. With the default `higherIsBetter`, a value at
   * or above it is good.
   */
  warn: number;
  /**
   * The cut point between warning and critical. With `higherIsBetter`, a value at or
   * above it (but below `warn`) is a warning and anything below it is critical.
   */
  critical: number;
  /**
   * Which way is good. `higherIsBetter` (the default) grades upwards from the cut points;
   * `lowerIsBetter` mirrors them, so a small value is the healthy one.
   */
  direction?: KpiThresholdDirection;
}

/** A KPI tile or node's status: good, a warning, or critical — never `unknown`. */
export type KpiStatus = 'good' | 'warn' | 'critical';
/** An explicit band: the `status` of the first band whose half-open `[min, max)` contains the value. */
interface KPIBand {
  /** The lower bound, inclusive. Omitted, the band reaches down without limit. */
  min?: number;
  /** The upper bound, exclusive. Omitted, the band reaches up without limit. */
  max?: number;
  /**
   * The status a value inside this band reports. The first matching band in the list
   * wins, so order them from the narrowest.
   */
  status: KpiStatus;
}

/** An optional sparkline series: the `y` field plotted in order of the `x` field (or insertion). */
interface KPISparkline {
  /**
   * The field the points are ordered by. Omitted, the rows are plotted in the order the
   * panel holds them.
   */
  x?: string;
  /**
   * The value plotted — a field name or a function of the row. Anything that is not a
   * finite number is dropped, and a series with no finite points renders no sparkline.
   */
  y: string | ((row: KPIRow) => unknown);
}

/** An aggregate stat tile: the routed rows reduced to one number, with optional filter, format, threshold and trend. */
/** What a movement line prints: the difference alone, the percentage alone, or both. */
export type DeltaMode = 'absolute' | 'relative' | 'both';
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
  /**
   * What the movement line prints against `baseline` (F-FRED-G): `'absolute'` the difference alone, `'relative'` the
   * percentage alone, `'both'` (the default, unchanged) both together. A
   * rate series (4.10 vs 4.30) makes the percentage a percent-of-a-percent
   * and meaningless, so `'absolute'` is how a host keeps the line without
   * it. The arrow and its colour follow the sign of the difference either
   * way.
   */
  delta?: DeltaMode;
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
 * `tree` is an opt-in: omitted or `false`, the panel is
 * flat whatever its tile ids look like, and a dotted id seen with `tree`
 * unset is reported once rather than silently turned into a hierarchy. Given
 * any object (`{}` included), the shape is declared with `path` or
 * `parentKey` — the same two shapes the grid's tree data and the tree-select
 * editor take — over the **tile specs**, not the rows. With neither declared,
 * one is derived by splitting the tile ids on `separator`, so
 * `system.compute.cpu` files itself under Compute under System. A panel
 * whose ids carry no separator stays flat even with `tree` set.
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
/** A KPI tile or node's status including the "measured nothing" state. */
export type KpiRollupStatus = 'good' | 'warn' | 'critical' | 'unknown';
interface KPINodeModel {
  /** The node's stable identity: the tile id, or the path of a synthesised level. */
  key: string;
  /** The tile id, or null on a synthesised level. */
  id: string | null;
  /**
   * What the node is called: the tile's own label, or the path segment a synthesised
   * level came from.
   */
  label: string;
  /** Depth, 0 at the top level. */
  level: number;
  /** Its place among its siblings, from 1, and how many there are. */
  posinset: number;
  /**
   * How many siblings the node sits among — the other half of the screen-reader's "3 of
   * 7".
   */
  setsize: number;
  /** Whether the node has anything beneath it. A leaf is never expandable. */
  hasChildren: boolean;
  /**
   * Whether the branch is currently open. Always false for a leaf; a collapsed branch's
   * children are not rendered, because its worst status is already on the node that is.
   */
  expanded: boolean;
  /** The node's children, in order, each a full node model. */
  children: KPINodeModel[];
  /** The node's own tile, or null on a synthesised level. */
  tile: KPITileModel | null;
  /**
   * The node's own reading, from its tile. Null on a synthesised level — no value is
   * invented for a branch from its children.
   */
  value: unknown;
  /** The node's reading as text, formatted by its tile. Null on a synthesised level. */
  formatted: string | null;
  /** The node's own status. */
  status: KpiRollupStatus | null;
  /** The worst status at or below the node. Never `unknown`. */
  rollup: KpiStatus | null;
  /** How many tiles at or below the node measured nothing. */
  unknown: number;
  /** How many tiles are at or below the node. */
  items: number;
}

/** Which kind of tile a computed KPI tile is: an aggregate stat, or a clock. */
export type KpiTileKind = 'stat' | 'clock';
/** A computed tile, as it appears in the model. */
interface KPITileModel {
  /** The tile's identity — its configured `id`, else its label, else its index. */
  id: string;
  /** The tile's accessible name, as configured. */
  label: string;
  /** `'stat'` for an aggregate tile, `'clock'` for a clock tile. */
  kind: KpiTileKind;
  /**
   * How the value was reduced: `sum`, `avg`, `min`, `max`, `count`, `countDistinct` or
   * `custom`.
   */
  aggregation: string;
  /**
   * The row field the aggregation read. Undefined for a `count` or custom tile that names
   * none, and on a clock tile.
   */
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
   * Three things make a tile `unknown`: the panel holds no rows at all; the
   * tile's `field` names no column on the bound grid, so it never read a cell
   * to reduce over; or the panel declares a `maxAge` and its feed has been
   * silent for longer than that, so every row it could reduce over is older
   * than the panel was told to trust (`stale` says which of the last two
   * this is). A tile whose `filter` matches none of the rows the panel *does*
   * hold, while its feed is fresh, is none of them — it has measured a real
   * zero and is banded normally. `null` means the tile has no thresholds or
   * bands configured.
   */
  status: KpiRollupStatus | null;
  /**
   * Whether this tile's `unknown` is a **silence** rather than an emptiness:
   * the panel holds rows, and none of them is inside the `maxAge` window it
   * declared. False on every tile of a panel that declares no `maxAge`, on an
   * empty panel (where "nothing has arrived" is the truthful reading), and
   * always on a clock tile.
   */
  stale: boolean;
  /**
   * The tile's target, as configured. It also extends the meter's scale when it falls
   * outside the bands. Undefined on a clock tile.
   */
  target?: number;
  /** The comparison value the movement line is measured from, as configured. */
  baseline?: number;
  /** `value − baseline`. Null when the tile has no baseline or measured no number. */
  delta: number | null;
  /**
   * The delta as a fraction of the baseline. Null when there is no delta, and when the
   * baseline is zero — a percentage of nothing is not reported as infinity.
   */
  deltaPercent: number | null;
  /**
   * The delta rendered with the tile's own number format. Undefined when there is no
   * delta.
   */
  deltaFormatted?: string;
  /** What the movement line prints; see `KPIStatTile.delta`. Always present once `baseline` is. */
  deltaMode?: DeltaMode;
  /**
   * How many of the panel's rows this tile's filter admitted — its own membership, which
   * may be 0 while the panel holds rows. Always 0 on a clock tile.
   */
  count: number;
  /**
   * The tile's trend series, as the finite numbers it plots, in `x` order. Null when the
   * tile declares no sparkline and when no row yielded a finite value.
   */
  sparkline: number[] | null;
}

/** The payload every tile event carries. */
interface KPIEvent {
  /** The tile model the event is about. */
  tile: KPITileModel;
  /** That tile's id, for a host that only needs to switch on it. */
  id: string;
  /**
   * The tree node the tile sits in, on a hierarchical panel; absent on a flat one and on
   * the keyboard route.
   */
  node?: KPINodeModel;
  /**
   * The DOM event behind this one — a click, double-click, context-menu gesture or the
   * Enter/Space keypress that stands in for a click.
   */
  originalEvent?: unknown;
}

/** The whole panel model, as `change` hands it over. */
interface KPIModel {
  /** Every tile model, in configured order. */
  tiles: KPITileModel[];
  /** The decorated tree, on a hierarchical panel only. */
  nodes?: KPINodeModel[];
}

/** `node:toggle`: a branch of a hierarchical panel was expanded or collapsed. */
interface KPINodeToggleEvent {
  /** The key of the node that moved. */
  key: string;
  /** True when it was opened, false when it was closed. */
  expanded: boolean;
  /** The node, as the panel now holds it; undefined when the key names none. */
  node?: KPINodeModel;
}

/** `change`: the panel rebuilt its model. */
interface KPIChangeEvent {
  /** The model the panel now holds. */
  model: KPIModel;
}

/**
 * The events a KPI panel raises.
 *
 * The panel's own, not the grid's: `grid.on` takes {@link EventName} and knows
 * nothing about these, and a grid-bound panel follows the grid's events itself
 * rather than re-publishing them. `on()` warns once on any other name, because
 * a binding to an event that can never fire is a silent no-op.
 */
type KPIEventName =
  /** A tile was clicked, or Enter or Space was pressed on a focused one. */
  | 'tile:click'
  /** A tile was double-clicked. */
  | 'tile:dblclick'
  /** A context menu was requested on a tile. */
  | 'tile:contextmenu'
  /** A branch of a hierarchical panel was expanded or collapsed, by the host or by a click on its twisty. */
  | 'node:toggle'
  /** The panel rebuilt its model — new rows, a changed configuration, or a followed grid event. */
  | 'change';

/** What a handler receives, per KPI event. */
interface KPIEventPayloads {
  /** The tile clicked, its id, its node on a tree panel, and the DOM event. */
  'tile:click': KPIEvent;
  /** The tile double-clicked, its id, its node on a tree panel, and the DOM event. */
  'tile:dblclick': KPIEvent;
  /** The tile the menu was asked for, its id, its node on a tree panel, and the DOM event. */
  'tile:contextmenu': KPIEvent;
  /** Which branch moved and which way. */
  'node:toggle': KPINodeToggleEvent;
  /** The rebuilt model. */
  change: KPIChangeEvent;
}

/** KPI panel configuration. */
interface KPIConfig {
  /**
   * The rows the tiles reduce over. Use this or `grid`; passing both leaves the panel on
   * the array.
   */
  rows?: KPIRow[];
  /**
   * A Lattice grid to follow instead of `rows`: the panel reads the grid's displayed rows
   * and re-reads them whenever the grid settles, so it never disagrees with the table
   * beneath it. On a bound panel `rows.apply` and `setRows` are ignored with a warning.
   */
  grid?: unknown;
  /**
   * Row identity (a field or fn, returning a string or number); default
   * 'id'. Composite (`string[]`) keys are core-grid-only: a panel keys its
   * own tile identity from one value, so there is nothing for an array to
   * join into here.
   */
  rowKey?: string | ((row: KPIRow) => string | number);
  /**
   * Extra columns of the bound `grid` to project onto the rows a tile `filter`
   * sees, beyond the fields the tiles themselves declare. A grid-bound panel
   * hands a filter a projection, not a whole grid row, so a filter over a
   * column no tile names would otherwise read `undefined` and report a
   * confident zero. Ignored on a panel over a plain `rows` array.
   */
  fields?: string[];
  /** The tiles to show, in display order: aggregate stat tiles, or clock tiles. */
  tiles?: KPITile[];
  /**
   * How many tile columns to aim for. Tiles shrink to fit rather than overflow the host,
   * so a narrow panel settles on fewer. Unset, the layout fits as many as the width
   * allows.
   */
  columns?: number;
  /** The panel's accessible name. Unset, the panel carries none. */
  ariaLabel?: string;
  /**
   * The placeholder printed where a tile has no number — an unknown tile, or one whose
   * aggregation returned nothing. Defaults to an em dash.
   */
  nullText?: string;
  /**
   * How long, in milliseconds, the panel keeps grading what it holds after
   * its feed last spoke. Past it, with nothing recent, every stat tile
   * reports `unknown` with a null value whatever its own membership, so a
   * silent feed cannot read as a healthy zero under `lowerIsBetter` cut
   * points (or as an alarm under `higherIsBetter` ones); each tile carries
   * `stale: true` and the panel captions it "No recent data". Grading
   * resumes the moment the feed speaks again.
   *
   * The same word, and the same meaning, `SourceConfig.maxAge` carries for a
   * rolling window. Unset, the panel judges no freshness at all: an empty
   * panel still reports `unknown`, and everything else is graded however old
   * it is.
   */
  maxAge?: number;
  /**
   * Which clock `maxAge` reads: a column id (or dotted path), or a function
   * of the row, naming the data's own time — on a grid-bound panel it is
   * projected onto the rows for you. Omitted, `maxAge` measures **arrival**
   * instead: when rows last reached this panel, through `rows.apply`,
   * `setRows`, or the bound grid announcing that its own rows changed. A
   * filter, a sort, an expansion and a `refresh()` are not arrivals, so a
   * live feed whose rows are all filtered out of view reports the empty
   * panel's `unknown` rather than a silence.
   *
   * The same option, with the same two meanings, `SourceConfig.ageBy` has.
   * Without `maxAge` it reads nothing and says so once.
   */
  ageBy?: string | ((row: KPIRow) => unknown);
  /**
   * The default locale a clock tile formats in when the tile itself declares
   * none; falls back to the browser's default. No effect
   * on a stat tile, which takes its own `format.locale`.
   */
  locale?: string;
  /**
   * Arrange the tiles as a hierarchy; unset or `false` keeps the panel flat.
   * Opt-in: a dotted tile id is not a hierarchy until
   * `tree` is set, and warns once while it is not.
   */
  tree?: KPITreeConfig | false;
  /**
   * The catalogue the panel's own text is read from. A panel routinely has no
   * grid to borrow one off — two of its three input modes have none — so this
   * is the first-class way to translate it. A grid's own `messages` satisfies
   * the shape; a key it does not carry falls back to English.
   */
  messages?: { t(key: string, params?: Record<string, unknown>): string };
  /**
   * Called when a tile is clicked (or activated from the keyboard), with the same payload
   * as the `tile:click` event. Both fire.
   */
  onTileClick?: (event: KPIEvent) => void;
  /** Called when a tile is double-clicked, alongside the `tile:dblclick` event. */
  onTileDblClick?: (event: KPIEvent) => void;
  /** Called on a tile's context-menu gesture, alongside the `tile:contextmenu` event. */
  onTileContextMenu?: (event: KPIEvent) => void;
  /**
   * Called when a branch of a hierarchical panel opens or closes, with the node's key,
   * its new state and the node model. Alongside the `node:toggle` event.
   */
  onNodeToggle?: (event: { key: string; expanded: boolean; node?: KPINodeModel }) => void;
  /**
   * Called after every recompute, with the freshly built model — the hook for mirroring
   * the panel's numbers somewhere else. Alongside the `change` event.
   */
  onChange?: (event: { model: { tiles: KPITileModel[]; nodes?: KPINodeModel[] } }) => void;
}

/** The keyed-diff consumer surface a KPI panel shares with a grid, so a Data Router routes to it directly. */
interface KPIRows {
  /**
   * Apply a keyed diff: `add` and `update` upsert a row by its key, `remove` drops one.
   * Only the rows in the diff touch each tile's running total, so a live feed costs
   * nothing per unchanged row. Ignored with a warning on a grid-bound panel.
   */
  apply(change: { add?: KPIRow[]; update?: KPIRow[]; remove?: unknown[] }): void;
  /** Visit every row the panel holds, with its key. */
  forEach(fn: (row: KPIRow, key: unknown) => void): void;
  /**
   * How many rows the panel holds. This is the panel's emptiness test: with none, every
   * stat tile reports `unknown` rather than a healthy zero.
   */
  readonly count: number;
}

/**
 * A KPI / stat-tile panel: a grid of aggregate tiles over a dataset. It
 * consumes data through the same keyed-diff `rows.apply` contract a grid
 * exposes, so `dataRouter.attach(value, kpi)` drives it like any other viewer,
 * updating each tile incrementally from the routed delta.
 */
interface KPI {
  /** The element the panel renders into, or null for a headless panel. */
  readonly el: unknown | null;
  /** The resolved row identity; see `KPIConfig.rowKey`. */
  readonly rowKey: string | ((row: KPIRow) => string | number);
  /** Whether the panel renders as a hierarchy rather than a flat tile grid. */
  readonly tree: boolean;
  /**
   * The keyed-diff consumer surface, the same shape a grid exposes — this is what makes a
   * panel a Data Router target.
   */
  rows: KPIRows;
  /** Every tile model, in configured order. */
  tiles(): KPITileModel[];
  /** One tile model by id, or undefined when no tile has that id. */
  tile(id: string): KPITileModel | undefined;
  /**
   * A tile's computed value. Null for an unknown id, and for a tile that measured
   * nothing.
   */
  value(id: string): unknown;
  /** The top-level nodes of the hierarchy. Empty on a flat panel. */
  nodes(): KPINodeModel[];
  /** One node by its key, at any depth. */
  node(key: string): KPINodeModel | undefined;
  /** The nodes on screen: the roots, plus the children of every open branch. */
  visibleNodes(): KPINodeModel[];
  /**
   * Open a branch of a hierarchical panel by node key, re-render, and fire `node:toggle`.
   * A key that is already open changes nothing.
   */
  expand(key: string): KPI;
  /** Close a branch by node key, re-render, and fire `node:toggle`. */
  collapse(key: string): KPI;
  /** Flip a branch between open and closed, firing `node:toggle` on the change. */
  toggle(key: string): KPI;
  /**
   * Replace the source rows and recompute, and make that array the source again so a
   * later `refresh()` re-reads it. Ignored with a warning on a grid-bound panel.
   */
  setRows(rows: KPIRow[]): KPI;
  /**
   * Recompute every tile and re-render. A bound panel re-reads the grid now rather than
   * at the end of the turn; a configured panel re-reads its array; once rows have arrived
   * through `rows.apply` nothing is re-read, so a routed feed is never thrown away.
   */
  refresh(): KPI;
  /**
   * The restorable state: the rows the panel holds, and — on a hierarchical panel only —
   * which branches are open.
   */
  getState(): object;
  /**
   * Restore a snapshot from `getState`. A snapshot without `expanded` leaves the
   * expansion alone rather than collapsing the rail.
   */
  setState(snapshot: object): KPI;
  /**
   * Register an event handler; returns a function that removes it. An unrecognised event
   * name is warned about once. What each event carries is {@link KPIEventPayloads}; the
   * handler is declared with the widest of them, so narrow on the name inside it.
   */
  on(name: KPIEventName, fn: (event: KPIEventPayloads[KPIEventName]) => void): () => void;
  /** Remove a handler registered with `on`. */
  off(name: KPIEventName, fn: (event: KPIEventPayloads[KPIEventName]) => void): void;
  /**
   * Drop every listener, stop following the bound grid, stop any clock tile ticking, and
   * empty the element (removing only the class the panel added).
   */
  destroy(): void;
}

/**
 * Create a KPI / stat-tile panel over rows or a bound grid. Pass a DOM element
 * to render into, or `null` for a headless panel that computes the same tile
 * model without a DOM.
 */
export function createKPI(el: HTMLElement | null, config?: KPIConfig): KPI;
export default createKPI;
