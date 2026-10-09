/*!
 * Lattice Grid 1.95.0, data-router module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * A record routed through a data router: any object. Its partition comes from
 * the router's `key` and its identity within a grid from `rowKey`.
 */
type RouterRecord = Record<string, unknown>;

/**
 * A property name, or a function reading the value off a row, returning a
 * string or number. Composite (`string[]`) keys are
 * core-grid-only: a route (or an alert, or a group) keys its own partition
 * by one value, so there is nothing for an array to join into here.
 */
export type RouterKey = string | ((row: RouterRecord) => string | number);

/** A per-route diff summary returned by `load`. */
export interface RouteDiff { added: number; updated: number; removed: number }

/**
 * What a route matches: a partition VALUE (the record is routed when
 * `row[key] === value`), or a `fn(row)` predicate for a composite route.
 * Declared as `unknown` because any value can be a partition key; the
 * function form is the only one TypeScript can check.
 */
export type RoutePredicate = unknown;

/** A route's `sort`: a comparator, or a key and direction (`'asc'` unless `'desc'`). */
export type RouteSort = ((a: RouterRecord, b: RouterRecord) => number) | { key: string; dir?: 'asc' | 'desc' };

/**
 * One incremental change: `upsert` adds or updates the row by `rowKey`,
 * `delete` removes it. `seq` versions the delta when the row itself carries
 * no version field (the router's `seq` option names one that does).
 */
export interface RouterDelta { op: 'upsert' | 'delete'; row: RouterRecord; seq?: number }

/** The change a `subscribe` handler receives: the same keyed diff a grid gets. */
export interface RouterChange { add: RouterRecord[]; update: RouterRecord[]; remove: string[] }

/**
 * A filter-wire condition for a route's `where` (v7): `{ col, op, value }`,
 * or an `and` / `or` / `not` group of them.
 */
type RouteWhere = Record<string, unknown>;

/**
 * A rollup route's summary spec (v3): one summary row per `groupBy` group,
 * each `aggregate` a named reducer over the group's rows or a `{ op, field }`
 * shorthand (`sum`, `avg`, `min`, `max`, `count`).
 */
export interface RouteRollup {
  /**
   * What identifies a group: a property name, a `fn(row)`, or a list of either for a
   * composite. Named properties are carried onto the summary row.
   */
  groupBy: RouterKey | RouterKey[];
  /**
   * The summary fields, each a reducer over the group's rows: a function handed the rows,
   * or `{ op, field }` for `count`, `sum`, `avg`, `min` or `max` over the numeric values
   * of `field`. `avg` over no numeric values is 0; `min` and `max` are undefined.
   */
  aggregate?: Record<string, ((rows: RouterRecord[]) => unknown) | { op: string; field?: string }>;
}

/**
 * A route's backpressure policy (v13): how its viewer is refreshed under load.
 * `maxHz` or `minInterval` caps the refresh rate; `sample` repaints only once
 * N changes have accrued; `maxLag` is the backlog depth at or below which
 * changes pass straight through and the limits stay off. All optional.
 */
export interface RouteBackpressure { maxHz?: number; minInterval?: number; sample?: number; maxLag?: number }

/** A write captured off a writable route's grid, handed to `onWrite`. */
type RouterWrite = Record<string, unknown>;

/**
 * Per-route options, shared by `attach`, `attachDefault` and `subscribe`.
 * `rowKey` overrides the router default for this route. `transform` reshapes
 * each row before the viewer sees it; `filter` admits a subset; `sort`
 * orders what the viewer receives; `rollup` summarises the slice (v3). A
 * `transform` or `rollup` route is derived and cannot be `writable`. `where`
 * is read only by `query()` (v7). `writable` routes the grid's committed
 * edits to `onWrite`, reverting on reject, with `onConflict` for a last-
 * write-wins conflict (v8); both default to the router's own. `label` names
 * the route in metrics and the devtools panel; `backpressure` throttles its
 * refresh under load (v13).
 */
export interface RouteOptions {
  /**
   * What identifies a row on this route — a field name or a `fn(row)` — overriding the
   * router's own `rowKey`.
   */
  rowKey?: RouterKey;
  /**
   * Reshapes each row before the viewer sees it. The row's identity is still taken from
   * the original, so the keyed diff is unaffected; a transform route is derived and its
   * edits are always reverted.
   */
  transform?: (row: RouterRecord) => RouterRecord;
  /**
   * Admits a subset of the route's partition to the viewer. It runs on the original row,
   * before any transform and before a rollup groups them.
   */
  filter?: (row: RouterRecord) => boolean;
  /**
   * Orders the rows the viewer receives — a comparator, or `{ key, dir }`. A viewer with
   * a sort model of its own still governs the final display; for a rollup route this
   * sorts the summary rows.
   */
  sort?: RouteSort;
  /**
   * Feeds the viewer one summary row per group instead of the raw rows. A rollup route is
   * derived and its edits are always reverted.
   */
  rollup?: RouteRollup;
  /**
   * A filter-wire condition for this route's slice, read only by `query()`: the pushable
   * part goes to the engine and the rest is finished in the browser. It has no effect on
   * rows arriving through `load`, `apply` or `push`.
   */
  where?: RouteWhere;
  /**
   * Captures the viewer's committed edits and routes them to `onWrite` instead of leaving
   * them local. Defaults to false; on a derived (rollup or transform) route the edit is
   * reverted with a warning whatever this says.
   */
  writable?: boolean;
  /**
   * Receives each captured edit as `{ key, colId, value, before, row }`. Return `false`
   * or `{ ok: false }` (or reject, or throw) to revert the cell, `{ conflict, row }` to
   * fire `onConflict` and take the winning row, anything else to accept; a promise is
   * awaited with the optimistic value standing. Overrides the router-wide handler. The
   * context's `route` is the viewer, and `source` is the `addSource` handle of the feed
   * the edited row arrived on — the one to persist back to on a fan-in router — or null
   * when the rows were loaded into the router directly.
   */
  onWrite?: (change: RouterWrite, ctx: { route: unknown; source: unknown }) => unknown;
  /**
   * Called when `onWrite` returns a `conflict`, with the server's row, so the host can
   * tell the user. The router itself is last-write-wins: the returned row (or the
   * optimistic one) re-enters regardless. Overrides the router-wide handler.
   */
  onConflict?: (change: RouterWrite, ctx: { serverRow: RouterRecord }) => void;
  /**
   * Names this route in `metrics()` and the devtools panel. Defaults to null — the
   * default route reports `default`.
   */
  label?: string;
  /**
   * Throttles how often this route's viewer is refreshed under load. Omitted, every
   * change repaints the viewer at once.
   */
  backpressure?: RouteBackpressure;
}

/** Per-alert options (v5): `filter` narrows the slice; `debounce` (ms) coalesces a burst into one emit. */
export interface AlertOptions { rowKey?: RouterKey; filter?: (row: RouterRecord) => boolean; debounce?: number }

/**
 * A cross-grid selection relation (v2): a key map (target
 * rows whose `to` value is among the selected source rows' `from` values — an
 * IN set), or a function handed the selected source rows that returns a
 * target-row predicate.
 */
export type SelectionRelation =
  | { from: string; to: string }
  | ((selected: RouterRecord[]) => ((row: RouterRecord) => boolean));

/**
 * One edge of a relationship graph (v3): the source grid whose selection
 * filters the target. `on` (or `relation`) is the relation; `mutual` makes
 * the edge work in both directions.
 */
export interface RouterEdge { from: unknown; to: unknown; on?: SelectionRelation; relation?: SelectionRelation; mutual?: boolean }

/**
 * A declarative routing graph (v5): the same routes, links,
 * relationship edges and buffer the imperative calls would make, as one data
 * spec. Desugars to those calls and composes with them.
 */
export interface RouterConfig {
  /**
   * The routes to open, each `{ grid, when, ...routeOptions }`, or `{ default: grid }`,
   * or `{ subscribe: handler, when }`, or `{ alert: handler, when, condition }`. `when`
   * is the partition value or predicate `attach` takes.
   */
  routes?: Record<string, unknown>[];
  /**
   * Selection links to make, each naming the `from` and `to` grids and the relation as
   * `on` (or `relation`) — the arguments of `link()`.
   */
  links?: { from: unknown; to: unknown; on?: SelectionRelation; relation?: SelectionRelation }[];
  /**
   * Relationship-graph edges to register, as `relate()` takes them; an edge may be
   * `mutual` to work in both directions.
   */
  relate?: RouterEdge[];
  /**
   * Turns on the time-travel buffer, bounded by `window` (ms of feed time) and/or `max`
   * deltas. An empty object applies a default cap of 10,000 deltas and warns.
   */
  buffer?: { window?: number; max?: number };
}

/**
 * A fan-in source's join. `from` is the other source's id; `localKey` (alias
 * `on`) reads the joining value off this source's row; `foreignKey` (alias
 * `fromKey`) reads it off the other source's rows, defaulting to a string
 * `localKey`; `missing` says what to do while a match has not arrived: `hold`
 * the row back, `passthrough` it unjoined, or fill with `null`.
 *
 * A plain join is a LOOKUP (v11): one matched row enriches this row with the
 * declared `fields` (alias `select`). A `many: true` join is a COLLECT join
 * (v14): every matching `from` row is gathered into an array under `as`,
 * mapped by `select(fromRow, leftRow)` (default the whole row), with optional
 * `distinct` and `sort`. A `many: true` join with an `aggregate` map instead
 * of `as` is a ROLLUP-ONTO-PARENT join (v15): each named
 * reducer is computed over the matching children (optionally narrowed by
 * `where`) and written straight onto the parent row. A `join` may be one spec
 * or an ARRAY applied in order, and a join reads its `from` source's rows
 * after that source's own joins, so joins chain into a multi-level graph.
 */
/** What a fan-in join does with a row while its match has not arrived. */
export type RouterJoinMissing = 'hold' | 'passthrough' | 'null';
/**
 * What a parent's delete does to its children (v18), on a
 * COLLECT join, on an unnest, and standalone via `relateRows`. `'cascade'`
 * deletes every child whose foreign key matches the deleted parent (recursively);
 * `'orphan'` keeps them, marked `__orphan: true`, warned once; `'keep'` keeps
 * them bare. The default for a collect join and `relateRows` is `'keep'` — the
 * unchanged behaviour — while an unnest defaults to `'cascade'` (its unchanged
 * behaviour already removes its embedded children).
 */
export type RouterParentDelete = 'cascade' | 'orphan' | 'keep';
/**
 * One named reducer of a ROLLUP-ONTO-PARENT join's `aggregate` map (v15). `fn` reuses the v3 rollup vocabulary — `count`, `sum`,
 * `avg`, `min`, `max` — and adds `distinctCount`, `first` and `last`. `field`
 * is the child field reduced over (required for every `fn` except `count`);
 * `first`/`last` order the children by `orderBy` (defaulting to `field`) and
 * return the `field` value of the first/last child. An empty child set yields
 * `count` 0, `sum` 0 and the rest null.
 */
export interface RouterJoinAggregate {
  /** The reducer: count | sum | avg | min | max | distinctCount | first | last. */
  fn: string;
  /** The child field reduced over (required for every `fn` except `count`). */
  field?: string;
  /** For first/last: the field the children are ordered by (defaults to `field`). */
  orderBy?: string;
}
export interface RouterJoin {
  /** The id of the registered source holding the lookup/collected rows. */
  from: string;
  /**
   * Reads the joining value off this source's row — a field name or a `fn(row)`.
   * Required for a lookup join (or `on`); a collect join defaults it to the
   * source's rowKey. Without it the join is ignored with a warning.
   */
  localKey?: RouterKey;
  /** An alias for `localKey`, read when `localKey` is absent. */
  on?: RouterKey;
  /**
   * Reads the joining value off the other source's rows — a field name or a `fn(row)`.
   * Defaults to a string `localKey`; with a function `localKey` and no `foreignKey`, the
   * join is ignored with a warning.
   */
  foreignKey?: RouterKey;
  /** An alias for `foreignKey`, read when `foreignKey` is absent. */
  fromKey?: RouterKey;
  /** A COLLECT join (v14): gather every matching row instead of one. */
  many?: boolean;
  /**
   * A COLLECT join's destination field: the collected array is written here. Required
   * for a collect join; without it the join is ignored with a warning.
   */
  as?: string;
  /**
   * A ROLLUP-ONTO-PARENT join (v15): a `many: true` join with an
   * `aggregate` map instead of `as`. Each named result is computed over the matching
   * children and written onto the parent row. Omit `as` when `aggregate` is set.
   */
  aggregate?: Record<string, RouterJoinAggregate>;
  /**
   * Filters the children before any `aggregate` is computed: a predicate over each
   * matching child row (its enriched form, so a child's own joins are visible). Only the
   * rows it admits contribute to the result.
   */
  where?: (childRow: RouterRecord) => boolean;
  /**
   * Which lookup fields to carry onto the row: a list of names, a `{ from: to }` rename
   * map, or a `fn(lookupRow, leftRow)` returning the fields to merge. With none, rows
   * pass through unenriched and the router warns.
   */
  fields?: string[] | Record<string, string> | ((lookupRow: RouterRecord | null, leftRow: RouterRecord) => unknown);
  /**
   * An alias for `fields`, read when `fields` is absent. For a COLLECT join it is also
   * the per-row mapping: a list of names (objects with just those fields), a `{ from: to }`
   * rename map, a single field name (the bare values), or `fn(fromRow, leftRow)` returning
   * the value to collect (defaults to the whole from-row). A field the rows lack warns once.
   * A lookup join reads a list, a map or a function; a single string is not a lookup form.
   */
  select?: string[] | Record<string, string> | ((lookupRow: RouterRecord | null, leftRow: RouterRecord) => unknown);
  /** A COLLECT join: de-duplicate the collected values. Defaults to false. */
  distinct?: boolean;
  /**
   * A COLLECT join: order the collected array — `true` for the default ascending order
   * (numbers numerically, everything else by string), or a `compareFn`. Defaults to no
   * sort.
   */
  sort?: boolean | ((a: unknown, b: unknown) => number);
  /**
   * What happens while the match has not arrived: `hold` keeps the row from viewers until
   * it does, `passthrough` sends it unenriched (a collect join sets `as` to `[]`), `null`
   * fills the declared fields with null (a collect join sets `as` to null). Defaults to
   * `passthrough`, which an unrecognised value also falls back to, with a warning.
   */
  missing?: RouterJoinMissing;
  /**
   * A COLLECT join's parent-delete integrity (v18): what deleting
   * a parent (this source's row) does to the collected children. `'cascade'` deletes
   * every matching child (recursively), `'orphan'` keeps them marked `__orphan: true`
   * and warns once, and `'keep'` (the default) keeps them bare — the unchanged
   * behaviour. A rollup/spread join is not a collect join and does not read this.
   */
  onParentDelete?: RouterParentDelete;
  /**
   * A SPREAD join (v16): an EAV / custom-field source whose rows each
   * become one field on the parent. `name` reads the attribute name off the child row and
   * `value` the value (each a field name or a `fn(row)`), the pair written onto the parent
   * as `prefix + name` — so `company` + `companyAttr` rows with `prefix: 'cf_'` gain
   * `cf_industry`, `cf_tier` columns as attributes arrive. `include` narrows the names
   * (an array, or a `fn(name, row)`), and `type` coerces per-name values (`number`,
   * `date`, `boolean`, `text`). The attribute source's own joins apply first (multi-level),
   * an attribute add/change/delete re-emits its parent live (a deleted field is absent, not
   * stale), and the router reports the field names through `fieldsOf(ref)` and the
   * `fields:changed` event. Set `spread` without `many: true`; it implies a one-to-many
   * match and a `missing` policy has no meaning (a parent with no attribute simply carries
   * no spread fields). Two attributes landing on one name are last-writer-wins and warned
   * once (`router:spread-duplicate`); a spread field never overwrites a base parent field
   * and warns once (`router:spread-collision`).
   */
  spread?: RouterSpread;
}

/** The value types a SPREAD join's `type` map can coerce an attribute to. */
export type RouterSpreadType = 'number' | 'date' | 'boolean' | 'text';

/**
 * A SPREAD join's shape (v16): turn an EAV / custom-field
 * source's rows into one field per attribute on the parent row.
 */
export interface RouterSpread {
  /** Reads the attribute name off the child row — a field name or a `fn(row)`. Required. */
  name: string | ((row: RouterRecord) => unknown);
  /** Reads the attribute value off the child row — a field name or a `fn(row)`. Required. */
  value: string | ((row: RouterRecord) => unknown);
  /** Prepended to every attribute name on the parent (e.g. `'cf_'`). Defaults to `''`. */
  prefix?: string;
  /**
   * Narrows which attribute names spread: an array of names, or a
   * `fn(name, row)` returning true to keep. Omitted, every attribute spreads.
   */
  include?: string[] | ((name: string, row: RouterRecord) => boolean);
  /**
   * Coerces each attribute's value by name: `number`, `date`, `boolean` or
   * `text`. A value that fails to parse keeps its raw value rather than
   * becoming `NaN`/`Invalid Date`; `null`/`undefined` pass through untouched.
   */
  type?: Record<string, RouterSpreadType>;
}

/**
 * The field types `addSource`'s `fields` option can coerce a raw value to: text, number (decimal comma and thousands separators),
 * integer, boolean (configurable true/false sets), date (ISO, epoch s/ms or
 * a small explicit pattern set) and json (parse a string).
 */
export type RouterFieldType = 'text' | 'number' | 'integer' | 'boolean' | 'date' | 'json';

/**
 * The input format a `date` field reads: `'iso'` (the
 * default — ISO 8601, a `Date`, or an epoch number), `'epoch-s'` (seconds
 * since the epoch), `'epoch-ms'` (milliseconds), or an explicit pattern such
 * as `'dd/MM/yyyy'`, parsed with the grid's own date-pattern token vocabulary.
 */
export type RouterDateFieldFormat = 'iso' | 'epoch-s' | 'epoch-ms' | string;

/**
 * One entry of `addSource`'s `fields` option: a type name,
 * or an options object. The object form narrows a `number`'s decimal
 * separator (`decimal: ','`), gives a `boolean` its own true/false marker
 * sets, chooses a `date`'s input `format`, and lists `nulls` — strings that
 * mean null for this field, mapped before any coercion. A field with only
 * `nulls` (no `type`) maps its null markers and passes every other value
 * through untouched. A value that fails to coerce is stored as null and
 * warns once per source+field (`router:coerce-failed`).
 */
export type RouterFieldSpec =
  | RouterFieldType
  | {
      /** A field type; omit it (with only `nulls`) to just map null markers. */
      type?: RouterFieldType;
      /** A `date`'s input format: `'iso'` (default), `'epoch-s'`, `'epoch-ms'`, or a pattern. */
      format?: RouterDateFieldFormat;
      /** A `number`'s decimal separator: `','` (e.g. `1.234,56`) or `'.'` (default). */
      decimal?: ',' | '.';
      /** The strings a `boolean` field reads as true. */
      true?: string[];
      /** The strings a `boolean` field reads as false. */
      false?: string[];
      /** Strings that mean null for this field, mapped before any coercion. */
      nulls?: string[];
    };

/**
 * One `unnest` spec of `addSource` (v17): expand a nested
 * array on each of a source's rows into its OWN row type, routed through the
 * ordinary partition/route/join machinery. `path` is the dotted array field
 * (`'profile.addresses'`); `as` is the child type (and its source id, so a
 * lookup/collect join can `from` it); `key` is the child's identity — a field
 * name, or `fn(child, parent, index)`, defaulting to `` `${parentKey}:${index}` ``
 * (the index fallback, whose caveat is that reordering an array churns its
 * children); `parentKey` is the field written onto each child holding the
 * parent's key (default `${source}Id`); `keep` (default false) keeps the
 * nested array on the parent's own routed row; and `join`/`unnest` are the
 * child source's own joins and nested unnest. A parent update whose nested
 * array changed emits a keyed diff of its children (add/change/remove by
 * child key; a child moved between parents is a remove + add), a parent
 * delete removes its children, and a `load()` snapshot diffs children too.
 * Two children of one parent resolving to the same key warn once
 * (`router:unnest-duplicate-key`), last in source order winning.
 */
export interface RouterUnnest {
  /** The dotted array field on the parent row to expand. */
  path: string;
  /** The child row type (and its source id, so joins can `from` it). */
  as: string;
  /**
   * The child's identity: a field name read off the child, or
   * `fn(child, parent, index)`. Defaults to `` `${parentKey}:${index}` `` — the
   * index fallback, which churns its children when an array is reordered.
   */
  key?: string | ((child: RouterRecord, parent: RouterRecord, index: number) => string | number);
  /** The field written onto each child holding the parent's key (default `${source}Id`). */
  parentKey?: string;
  /** Keep the nested array on the parent's own routed row. Defaults to false. */
  keep?: boolean;
  /**
   * What a parent's delete does to its unnested children (v18).
   * `'cascade'` (the default, and the unchanged behaviour) removes them,
   * `'orphan'` keeps them marked `__orphan: true` and warns once, and `'keep'`
   * keeps them bare. A re-added parent re-adopts its orphans (the mark clears).
   */
  onParentDelete?: RouterParentDelete;
  /** The child source's own joins (applied after unnest, before it routes). */
  join?: RouterJoin | RouterJoin[];
  /** A nested unnest: the child rows may declare their own nested arrays. */
  unnest?: RouterUnnest | RouterUnnest[];
}

/**
 * Options for a fan-in source (v9): `map` normalises each of the feed's rows
 * before routing; `key` namespaces the feed's identities (`true` prefixes
 * the source id) so feeds with colliding ids do not clobber one another;
 * `join` enriches (lookup), collects (`many: true`) or rolls aggregates onto
 * (`many: true` + `aggregate`) rows from another registered source
 * (v11/v14/v15), as one spec or an array applied in order; `fields` coerces
 * raw values to typed values before joins; and `unnest`
 * expands a nested array on each row into its own row type (v17).
 */
export interface RouterSourceOptions { id?: string; map?: (row: RouterRecord) => RouterRecord; key?: unknown; join?: RouterJoin | RouterJoin[]; unnest?: RouterUnnest | RouterUnnest[]; fields?: Record<string, RouterFieldSpec> }

/**
 * The handle `addSource` returns for one feed (v9). Its `load` is a
 * per-source snapshot — a keyed diff over this feed's rows only, other feeds
 * untouched; `apply` and `push` take this feed's deltas through the router's
 * ordinary and batched paths; `remove` deletes exactly the rows it holds and
 * unregisters it, returning the router.
 */
export interface RouterSourceHandle {
  /** The source id. */
  readonly id: string;
  /** How many rows this source currently holds live. */
  readonly size: number;
  /** Apply a per-source snapshot: upsert its current rows, delete the ones it no longer has. */
  load(rows: RouterRecord[]): RouterSourceHandle;
  /** Apply per-source deltas through the router's ordinary apply path. */
  apply(deltas: RouterDelta[]): RouterSourceHandle;
  /** Enqueue per-source deltas through the router's stream path (batching honoured). */
  push(delta: RouterDelta | RouterDelta[]): RouterSourceHandle;
  /** Remove this source: delete exactly the rows it holds from every route, then unregister it. */
  remove(): DataRouter;
}

/** One route's figures in a `metrics()` snapshot (v10). */
export interface RouterRouteMetrics {
  /** The route's `label`, or `default` for the default route, or null when it has neither. */
  label: string | null;
  /** How many rows the route's partition holds, before its filter, links and rollup. */
  rows: number;
  /**
   * How many rows the viewer currently holds — the partition after the route's filter,
   * any cross-grid links, and a rollup's grouping.
   */
  shown: number;
  /**
   * Rows routed to this route per second since the previous metrics read. The first read
   * of a route reports 0, having no interval to measure.
   */
  throughput: number;
  /**
   * Any further counter the route's own stage publishes. The four above are the ones
   * every route reports; a stage may add to them and they arrive here.
   */
  [key: string]: unknown;
}

/** One source's figures in a `metrics()` snapshot (v10). */
export interface RouterSourceMetrics { id: string; rows: number; throughput: number; [key: string]: unknown }

/**
 * A `metrics()` snapshot (v10): per-route and per-source counts and
 * throughput (rows/sec since the previous read), and the global unrouted,
 * dropped (duplicate), buffered and lag figures.
 */
export interface RouterMetrics {
  /** One entry per route, in attach order, the default route last. */
  routes: RouterRouteMetrics[];
  /** One entry per registered fan-in source. */
  sources: RouterSourceMetrics[];
  /**
   * How many arriving records matched no route (and went to the default sink, if there is
   * one). Counted since the last `load()` or `query()`, each of which resets it.
   */
  unrouted: number;
  /**
   * How many deltas the dedupe gate discarded as stale or already seen, cumulative for
   * the router's life.
   */
  dropped: number;
  /** How many deltas the time-travel ring currently holds. Zero when not buffering. */
  buffered: number;
  /**
   * How many buffered deltas the viewers are behind the live head, in deltas. Nonzero
   * only while scrubbed into the past.
   */
  lag: number;
  /**
   * Rows routed across every route per second since the previous metrics read; 0 on the
   * first read.
   */
  throughput: number;
}

/** Narrow an `explain()` call to one source and/or one route. Omit both for the whole report. */
export interface ExplainOptions {
  /** A registered source id (v9, `addSource`'s id). */
  source?: string;
  /** A route's target (an `attach` grid, a `subscribe`/`alert`/`monitor` handler), its partition value, or its `label`. */
  route?: unknown;
}

/** `explain()` narrowed to one source and/or one route (whichever `ExplainOptions` named); the unnamed side is omitted. */
export interface ExplainNarrowed {
  /** The named source's report, or null when the id is unknown or nothing has settled yet. Present only when `{ source }` was passed. */
  source?: ExplainSourceReport | null;
  /** The named route's report, or null when it cannot be resolved. Present only when `{ route }` was passed. */
  route?: ExplainRouteReport | null;
}

/** Up to 5 sample offending values, with the total count they were drawn from (never more are retained). */
export interface ExplainSamples { count: number; samples: unknown[] }

/**
 * One `fields` coercion's figures for a source's most recent settle (v18): how many values coerced cleanly, how many turned null
 * or invalid, and up to 5 of the actual offending raw values.
 */
export interface ExplainFieldReport { coerced: number; invalid: number; samples: unknown[] }

/** One `unnest` spec's figures for a source's most recent settle (v18): parent rows read, child rows (upserts and deletes) emitted. */
export interface ExplainUnnestReport { parentRowsIn: number; childRowsOut: number }

/**
 * One `join`/`collect`/rollup-onto-parent/`relateRows` figure for a source's
 * most recent settle (v18). `unmatched.left` is this
 * source's own rows whose key found nothing on the `from` side (the actual
 * offending key values, up to 5); `unmatched.right` is `from`-side rows no
 * left row currently points at — both are how `explain()` answers "why does
 * my grid show 0 rows" when a join silently drops everything. `duplicates`
 * (lookup joins only) is how many left rows matched MORE than one `from`
 * row by key — the last one registered wins silently, so this is the
 * signal that a lookup join's assumed 1:1 key is not.
 */
export interface ExplainJoinReport {
  /** 'lookup' (one row), 'collect' (an array), 'rollup' (aggregated onto the parent), or 'relateRows' (a standalone delete rule). */
  kind: 'lookup' | 'collect' | 'rollup' | 'relateRows';
  /** The `from`/`parent` source id this join or rule reads. */
  from: string;
  /** The field a collect join wrote its array under, or null for every other kind. */
  as: string | null;
  /** How many of this source's rows found at least one matching `from` row. */
  matched: number;
  /** Keys that found nothing, on each side of the join — the actual offending values, up to 5 samples each. */
  unmatched: { left: ExplainSamples; right: ExplainSamples };
  /** Lookup joins only: left rows that matched more than one `from` row by key (the last one registered silently wins). */
  duplicates: ExplainSamples;
}

/** One source's full `explain()` report for its most recent settle (v18). */
export interface ExplainSourceReport {
  /** The source id (`addSource`'s id, or an `unnest` spec's `as`). */
  source: string;
  /** Rows this settle loaded (a `load()` snapshot), applied (an `apply()`/`push()` upsert) and removed. */
  rows: { loaded: number; applied: number; removed: number };
  /** One entry per declared `fields` coercion, keyed by field name. */
  fields: Record<string, ExplainFieldReport>;
  /** One entry per `unnest` spec, keyed by its `as`. */
  unnest: Record<string, ExplainUnnestReport>;
  /** One entry per `join`/collect/rollup-onto-parent, plus any `relateRows` rule naming this source as the child. */
  joins: ExplainJoinReport[];
  /** A `spread` join's rows touched (enriched) and re-emitted (actually changed) this settle. */
  spread: { touched: number; reemitted: number };
  /** Rows of THIS source's dependents (sources that join from it) touched and re-emitted by this settle's cascade. */
  cascade: { touched: number; reemitted: number };
  /** Wall-clock ms this settle spent ingesting/enriching this source (includes any unnest expansion it triggered). */
  timingMs: number;
}

/** One route's (or `alert`/`monitor`'s) full `explain()` report for its most recent settle (v18). */
export interface ExplainRouteReport {
  /** The route's `label` when set, else its partition value, else an opaque stable id (never a live grid/handler reference — this is JSON-safe). */
  route: unknown;
  /** The route's `label`, or null. */
  label: string | null;
  /** `alert`/`monitor` only: which kind this is. Absent for a grid/`subscribe` route. */
  kind?: 'alert' | 'monitor';
  /** Rows this settle's `when` predicate routed here, and how many matched no route at all (router-wide, duplicated on every route's report). */
  when: { routed: number; unrouted: number };
  /** Rows in (the route's partition) and out (after `filter` and any cross-grid link/graph predicate). */
  filter: { in: number; out: number };
  /** Rows transform ran over, in and out (a transform never drops a row). Null for an `alert`/`monitor` (it has none). */
  transform: { in: number; out: number } | null;
  /** How many rows this settle's `sort` ordered (0 when the route has no `sort`). Null for an `alert`/`monitor`. */
  sort: { count: number } | null;
  /** Null for a non-rollup route (or an `alert`/`monitor`); otherwise rows in, summary rows out, and the group count. */
  rollup: { in: number; out: number; groups: number } | null;
  /** Rows written to the grid this settle, by kind. Null for an `alert`/`monitor` (it renders nothing). */
  write: { add: number; update: number; remove: number } | null;
  /** Wall-clock ms this settle spent in this route's `materialize()` (0 for an `alert`/`monitor`, which never materializes). */
  timingMs: number;
}

/**
 * The whole `explain()` report for the most recent settle (v18) — one `load`/`apply`/`push` and everything it cascaded
 * into. Narrow with `{ source }`/`{ route }` for just one part; this is what
 * comes back when neither is passed. Fully JSON-serialisable (every id is a
 * string, label or number — never a live grid/handler reference) and safe
 * to `JSON.stringify`/parse and compare.
 */
export interface ExplainReport {
  /** One entry per registered source, keyed by its id. */
  sources: Record<string, ExplainSourceReport>;
  /** One entry per route (grid/`subscribe`, then `alert`/`monitor`), in attach order. */
  routes: ExplainRouteReport[];
  /** How many records this settle matched no route (same figure as `metrics()`'s `unrouted` and each route report's `when.unrouted`). */
  unrouted: number;
  /** Wall-clock ms the whole settle took, start to finish. */
  timingMs: number;
}

/**
 * One step of a traced row's path (v19): the shape varies by
 * `kind`, mirroring the pipeline stage `explain()` already counts in
 * aggregate — this is the same accounting, kept per row instead of summed.
 */
export type TraceStep =
  /** `fields`/`map` coercion: every declared field this settle touched, before and after. */
  | { kind: 'fields'; changes: { field: string; before: unknown; after: unknown }[] }
  /** `unnest`: the parent row's key this child was expanded from. */
  | { kind: 'unnest'; parentKey: unknown }
  /** A lookup or rollup-onto-parent join: the foreign key looked up, and whether it matched. */
  | { kind: 'join'; from: string; matchedKey: unknown; matched: boolean }
  /** A collect join: the foreign key looked up, and whether it matched. */
  | { kind: 'collect'; from: string; matchedKey: unknown; matched: boolean }
  /** A standalone `relateRows` rule: the parent key this child matched. */
  | { kind: 'relate'; parentKey: unknown; matchedKey: unknown }
  /** A route-level `rollup` (`groupBy`/`aggregate`): the group this row joined, and the group's size. */
  | { kind: 'rollup'; groupKey: unknown; memberCount: number }
  /** A `spread` join: the attribute source it read from. */
  | { kind: 'spread'; origin: string }
  /** A re-enrichment triggered by a change elsewhere: the source whose change triggered it. */
  | { kind: 'cascade'; origin: string }
  /** The route's `filter` (or a cross-grid link/graph predicate): whether this row passed. */
  | { kind: 'filter'; passed: boolean }
  /** The route's `sort`: ran over this row (a sort never drops a row). */
  | { kind: 'sort'; passed: true }
  /** The route's `transform`: ran over this row (a transform never drops a row). */
  | { kind: 'transform'; passed: true }
  /** The terminal write: which route, which op, and the seq it carried (when the router has one). */
  | { kind: 'route'; label: string | null; op: 'add' | 'update'; seq: number | undefined };

/** `router.trace(gridOrLabel, rowKey)`'s result for a row the store still holds (v19). */
export interface TraceResult {
  /** Always true for a row the store still holds — the `known: false` case is `TraceNotTraced`. */
  known: true;
  /** The source row(s) the path began from: the source id and the row's identity as that source knows it. */
  source: { id: string; key: unknown }[];
  /** Every step the row passed, in order. */
  steps: TraceStep[];
  /** The route that delivered it (its `label`), or null if it never reached one. */
  route: { label: string | null } | null;
  /** The write it produced and the seq it carried, or null if it never reached one. */
  write: { op: 'add' | 'update'; seq: number | undefined } | null;
}

/** The named reasons `trace.missing()` can report a row dropped for (v19). */
export type TraceMissingReason =
  | 'predicate-false' | 'filter-rejected' | 'join-no-partner' | 'deduped-stale-seq'
  | 'removed-by-cascade' | 'coerced-invalid-key' | 'not-yet-flushed' | 'unrouted';

/** `trace.missing()`'s result for a row the store still holds (v19). */
export interface TraceMissingResult {
  /** Always true for a row the store still holds — the `known: false` case is `TraceNotTraced`. */
  known: true;
  /** Whether the row is, right now, in the grid asked about (or any grid, when none was named). */
  present: boolean;
  /** A human-readable explanation. */
  message: string;
  /** The reason code, when `present` is false. */
  reason?: TraceMissingReason;
  /** `predicate-false` only: the route whose predicate rejected it. */
  label?: string | null;
  /** `join-no-partner` only: the key looked up and the source it looked in. */
  key?: unknown;
  /** `join-no-partner`/`removed-by-cascade` only: the source (or parent key) it looked in/followed. */
  source?: string;
  /** `removed-by-cascade` only: the parent row's key whose removal cascaded the delete to this row. */
  parentKey?: unknown;
  /** Present when the row IS in the grid: which route. */
  route?: { label: string | null };
}

/** What `router.trace()`/`trace.missing()` answer for a row outside the bounded store — never a guess (v19). */
export interface TraceNotTraced { known: false; reason: 'not-traced' }

/**
 * `router.trace` (v19): a callable — `trace(gridOrLabel,
 * rowKey)` — with `enable`/`disable`/`missing` attached, the same shape
 * `on`'s unsubscribe or a timer's controller takes when a capability needs
 * more than one entry point.
 */
export interface RouterTraceApi {
  /** Follow one row's path. `gridOrLabel` is reserved (see `DataRouter.trace`'s doc). */
  (gridOrLabel: unknown, rowKey: unknown): TraceResult | TraceNotTraced;
  /** Turn tracing on. */
  enable(): void;
  /** Turn tracing off. */
  disable(): void;
  /** Why `sourceKey` on source `sourceRef` is not (or is) in a grid; narrow to one route's predicate with `gridOrLabel`. */
  missing(sourceRef: unknown, sourceKey: unknown, gridOrLabel?: unknown): TraceMissingResult | TraceNotTraced;
}

/**
 * One entry of `lastQueryPlan()` (v7): a `where` route's fetch, or the single
 * `base` fetch that fed every route without a `where`. `pushedFilter` says
 * whether the filter reached the engine; `residual` is what was finished
 * client-side.
 */
export interface RouterQueryPlanEntry { route?: unknown; base?: boolean; pushedFilter: boolean; residual: unknown }

/** The controller `mountDevtools` returns: `refresh` re-renders now, `destroy` unsubscribes and removes the panel. */
export interface RouterDevtoolsPanel { refresh(): void; destroy(): void }

/**
 * A pushdown adapter `query()` can source the router from (v7): anything
 * with an `execute(query, request)` returning rows, and optional
 * `capabilities` the planner consults to decide what it may push down.
 */
export interface RouterQueryAdapter {
  /**
   * What the engine can evaluate, as the pushdown capability model reads it; the planner
   * consults it to decide how much of a filter to push down. Omitted, the conservative
   * defaults apply.
   */
  capabilities?: Record<string, unknown>;
  /**
   * Runs one planned query and resolves to its rows (`total` optional and unused by the
   * router). Called once per `where` route, plus once for the base query shared by the
   * routes without one.
   */
  execute: (query: Record<string, unknown>, request?: Record<string, unknown>) => Promise<{ rows: RouterRecord[]; total?: number }>;
}

/**
 * Durable persistence options (v12): `key` names the snapshot, `debounce`
 * (ms) coalesces writes, `storage` is a `{ get, set }` pair of your own, or
 * `indexedDB` / `dbName` / `storeName` select the browser store.
 */
export interface RouterPersistOptions {
  /** The record the snapshot is written under. Defaults to `lattice-router`. */
  key?: string;
  /**
   * How long to wait after a change before writing, in ms, so a burst costs one write.
   * Defaults to 250; zero or less writes on every change.
   */
  debounce?: number;
  /** An async key/value backend of your own. Given one, IndexedDB is never opened. */
  storage?: { get: (key: string) => Promise<unknown>; set: (key: string, value: unknown) => Promise<void> };
  /**
   * The `IDBFactory` to open the database with. Defaults to the global `indexedDB`; where
   * none is reachable the router warns once and keeps running in memory with no durable
   * resume.
   */
  indexedDB?: unknown;
  /** The IndexedDB database to open. Defaults to `lattice-router`. */
  dbName?: string;
  /** The object store inside the database. Defaults to `snapshots`. */
  storeName?: string;
}

/**
 * The events a data router raises.
 *
 * Routing itself is reported to each attached viewer through its own
 * `rows.apply`, not through an event here. `metrics` is the periodic
 * observability timer, running only while at least one listener is registered
 * so collection costs nothing until someone asks for it. `fields:changed`
 * (v16) fires when a spread join's field set for a route changes.
 */
export type RouterEventName =
  /** The metrics timer fired: a `metrics()` snapshot, every `metricsInterval` ms (default 1000; `0` disables the timer). */
  | 'metrics'
  /** A route's spread field set changed (v16): `{ route, added, removed }`, the names that appeared and disappeared. */
  | 'fields:changed';

/** What a handler receives, per router event. */
export interface RouterEventPayloads {
  /** The same snapshot `metrics()` returns, taken at the emit; the throughput baseline advances with it. */
  metrics: RouterMetrics;
  /**
   * The spread field names a route gained and lost since the last emit, keyed
   * by the route's partition value, label or target (v16). `added` are the
   * names that first appeared, `removed` those that disappeared; a host turns
   * `added` into grid columns and `removed` into dropped columns.
   */
  'fields:changed': { route: unknown; added: string[]; removed: string[] };
}

/**
 * A data router: one arriving stream, partitioned by a property (or composite
 * predicate), fanned out to a grid per partition. Each grid
 * sees only its slice, updated by keyed diff through the public
 * `grid.rows.apply` path — no grid-core change, no cross-references between
 * grids. Snapshots apply keyed diffs (unchanged rows never repaint); deltas add,
 * update or remove in place by `rowKey`, preserving selection and scroll.
 */
export interface DataRouter {
  /** Attach a grid behind a predicate; `opts` may reshape, filter, sort, summarise or throttle the route. */
  attach(grid: unknown, predicate: RoutePredicate, opts?: RouteOptions): DataRouter;
  /** Attach the "rest" sink for records no explicit route matched. A second call replaces the first. */
  attachDefault(grid: unknown, opts?: RouteOptions): DataRouter;
  /** Route a partition slice to any non-grid view (v5): the handler receives the same keyed diff a grid would. */
  subscribe(predicate: RoutePredicate, handler: (change: RouterChange) => void, opts?: RouteOptions): DataRouter;
  /** Watch a slice and emit on a rising edge of `condition` rather than render (v5). Removed only by `destroy`. */
  alert(predicate: RoutePredicate, condition: (rows: RouterRecord[]) => unknown, handler: (signal: unknown, rows: RouterRecord[]) => void, opts?: AlertOptions): DataRouter;
  /**
   * Watch a slice and report what it MEASURES on every evaluation (v14) — a levelled sibling of `alert`, sharing its partition, its
   * `rowKey`/`filter`, its seeding and its independence from a time-travel scrub, and
   * differing only in reporting a value rather than a rising edge. This is the feed
   * `lattice-grid/modules/alarms` runs its level ladder, clear edge and hold timer on.
   * Alone among the routes it returns a **stop function** rather than the router, because
   * an alarm set has to be able to release it on `destroy()`.
   */
  monitor(predicate: RoutePredicate, evaluate: (rows: RouterRecord[]) => unknown, handler: (value: unknown, rows: RouterRecord[]) => void, opts?: { rowKey?: RouterKey; filter?: (row: RouterRecord) => boolean }): () => void;
  /** Take the whole routing graph as one declarative spec (v5); desugars to the calls above and composes with them. */
  configure(spec?: RouterConfig): DataRouter;
  /**
   * Link a source grid's selection to what a target grid receives (v2): the target shows the subset of its partition the
   * `relation` admits, re-pushed through the keyed-diff path. No selection
   * shows the full partition; changes are debounced.
   */
  link(source: unknown, target: unknown, relation: SelectionRelation): DataRouter;
  /** Declare a relationship graph (v3): multi-hop, several-into-one and mutual edges — the scalable form of `link`. */
  relate(edges: RouterEdge[]): DataRouter;
  /** Apply any debounced selection refilter synchronously (for tests/determinism). */
  flush(): DataRouter;
  /** Detach a grid — or a `subscribe` handler — and drop any link it is part of; the host still owns and destroys it. */
  detach(grid: unknown): DataRouter;
  /** Apply a full snapshot as a keyed diff per grid; returns per-route counts. Resets `unrouted`. */
  load(snapshot: RouterRecord[]): RouteDiff[];
  /** Apply incremental deltas, routed and applied in place by `rowKey`; ordered and de-duplicated when `seq` is on. */
  apply(deltas: RouterDelta[]): void;
  /** Enqueue deltas for batched or coalesced application (v3); applies at once when no batching mode is on. */
  push(delta: RouterDelta | RouterDelta[]): DataRouter;
  /** Apply the buffered deltas now as a single `apply` (v3) — a deterministic point, and for tests. */
  flushStream(): DataRouter;
  /** Refresh every backpressured route to the latest state now (v13); a no-op with nothing pending. */
  flushBackpressure(): DataRouter;
  /** Register a source feed for fan-in (v9): its rows are normalised and namespaced into the one keyed store. */
  addSource(feed: string | RouterSourceOptions, opts?: RouterSourceOptions): RouterSourceHandle;
  /** Remove a source feed by id or handle (v9): delete exactly its rows from every route, then unregister it. */
  removeSource(ref: string | RouterSourceHandle): DataRouter;
  /** The registered source ids (v9). */
  sources(): string[];
  /**
   * Declare a parent→child delete rule without a join (v18):
   * deleting a `parent` row cascades (`onParentDelete: 'cascade'`) or orphans
   * (`'orphan'`) the `child` rows whose `foreignKey` matches, or does nothing
   * (`'keep'`, the default). `writeBack` (default false) routes each cascaded
   * delete through the router's `onWrite` so the host persists it.
   */
  relateRows(o: { child: string | RouterSourceHandle; parent: string | RouterSourceHandle; foreignKey: RouterKey; onParentDelete?: RouterParentDelete; writeBack?: boolean }): DataRouter;
  /**
   * The spread field names a route currently carries (v16):
   * with a `spread` join, each EAV attribute row becomes its own field on the
   * parent, and this reports the names a host can turn into grid columns. Pass
   * the route's target (an `attach` grid or a `subscribe` handler), its
   * partition value, or its `label`. Returns the names in first-seen order — an
   * empty array for an unknown route, a route with no spread fields, or a router
   * with no spread join. Pair it with the `fields:changed` event to add or drop
   * columns as attributes appear and disappear.
   */
  fieldsOf(ref: unknown): string[];
  /** A cheap point-in-time snapshot of the router's runtime (v10); throughput is measured since the previous read. */
  metrics(): RouterMetrics;
  /**
   * Explain the most recent settle (v18): what the last
   * `load`/`apply`/`push` (and every cascade it triggered) did, per source
   * and per route — rows in/out at each pipeline step, which join/unnest/
   * spread/cascade keys matched or didn't (up to 5 sample offending values),
   * the grid writes produced, and the wall-clock ms each step took. Where
   * `metrics()` answers "how much, how fast", this answers "what happened,
   * and where did my rows go". Always current (the counters it reads run
   * whether or not this is ever called); pass `{ source }` and/or `{ route }`
   * to narrow to just that part.
   */
  explain(opts?: ExplainOptions): ExplainReport | ExplainNarrowed;
  /**
   * Trace one row's path through the router (v19), and —
   * via `trace.missing()` — why an input row is NOT in a grid. Off by
   * default (`{ trace: true }` on `createDataRouter`, or `trace.enable()`;
   * `trace.disable()` turns it off); while off, each step pays one boolean
   * check. Recording is bounded (`traceLimit`, default 10,000 rows; oldest
   * dropped first) — a row outside the store answers {@link TraceNotTraced}
   * rather than a guess.
   */
  trace: RouterTraceApi;
  /**
   * Subscribe to a router event (v10): the periodic `metrics` emit — the timer runs only
   * while a listener is registered — or a `fields:changed` emit when a spread join's field
   * set for a route changes (v16). What each carries is {@link RouterEventPayloads}.
   * Returns the unsubscribe.
   */
  on(event: RouterEventName, handler: (snapshot: RouterEventPayloads[RouterEventName]) => void): () => void;
  /** Mount the live devtools panel into `el` (v10); it re-renders on each `metrics` emit. */
  mountDevtools(el: unknown): RouterDevtoolsPanel;
  /** How many records matched no route since the last `load` or `query`, running for deltas. */
  readonly unrouted: number;
  /** How many stale or duplicate deltas the dedupe gate dropped since creation (v3). */
  readonly dropped: number;
  /** The highest seq applied — the resume point to request the feed from after a dropped socket (v3). */
  lastSeq(): number | undefined;
  /** A copy of the per-record resume checkpoint: record identity → last applied seq (v3). */
  checkpoint(): Map<string, number>;
  /** Prime the resume checkpoint from a persisted one, so replayed deltas at or below those seqs are dropped (v3). */
  seenThrough(mark: Map<string, number> | Record<string, number>): DataRouter;
  /** Turn on durable persistence of the router's state (v12). */
  persist(opts?: RouterPersistOptions): DataRouter;
  /** Resume from the durable snapshot (v12); resolves true when one was found and applied. */
  restore(): Promise<boolean>;
  /** Flush any pending durable write now (v12); resolves once it has settled. */
  flushPersist(): Promise<DataRouter>;
  /** Whether durable persistence is on and not degraded to in-memory (v12). */
  readonly persisting: boolean;
  /** Record the stream into a bounded ring for time travel (v4): a time `window` in ms and/or a `max` delta count. */
  buffer(opts?: { window?: number; max?: number }): DataRouter;
  /** Scrub the attached grids to a past seq or timestamp (v4). */
  scrubTo(target: number, opts?: { by?: 'seq' | 'time' }): DataRouter;
  /** Replay a buffered range step by step (v4); resolves when it completes or is superseded. */
  replay(from: number, to: number, opts?: { speed?: number; by?: 'seq' | 'time' }): Promise<void>;
  /** Pause an in-flight replay at the current step (v4); a no-op when nothing is replaying. */
  pause(): DataRouter;
  /** Resume a paused replay from where it stopped (v4); a no-op when not paused. */
  resume(): DataRouter;
  /** Return to live (v4): rebuild the head from the base plus every buffered delta. */
  live(): DataRouter;
  /** Whether the grids are currently showing a reconstructed past (v4). */
  readonly traveling: boolean;
  /** How many deltas the bounded buffer currently holds (v4). */
  readonly buffered: number;
  /** Mirror the ordered, de-duplicated deltas to other tabs over a BroadcastChannel (v6), with no echo loop. */
  broadcast(opts: { channel: string }): DataRouter;
  /** Whether the router is mirroring to a BroadcastChannel (v6). */
  readonly broadcasting: boolean;
  /** Source the router from a pushdown adapter (v7): each `where` route is planned against the adapter's capabilities. */
  query(adapter: RouterQueryAdapter, request?: Record<string, unknown>): Promise<DataRouter>;
  /** The pushed/residual split of the last `query()` (v7), per fetch, or null before any. */
  lastQueryPlan(): RouterQueryPlanEntry[] | null;
  /** Detach every grid and drop every link (the host destroys the grids themselves). */
  destroy(): void;
}

/**
 * Options for `createDataRouter`. `key` is the partition property or
 * `fn(row)`; optional, since a router whose routes all use `fn(row)`
 * predicates never reads it. `rowKey` is the identity within a grid;
 * `overlap` fans a record to every matching route (default: first match
 * wins); `onUnrouted` receives what matched no route — the row on `load` and
 * `query`, the whole delta on `apply`; `selectionDebounce` is the ms
 * debounce for cross-grid selection refilters (default 16; `0` is
 * synchronous). `seq` names the per-record version that orders and
 * de-duplicates a feed (v3), `dedupe` (default on with `seq`) drops stale
 * and duplicate deltas; `batch` (ms, or `{ intervalMs }`) and `coalesce`
 * buffer a high-frequency feed for `push`; `time` reads a row's timestamp
 * for time-domain scrubbing and `now` overrides the clock (v4); `config` is
 * a declarative routing graph applied at construction (v5); `onWrite` and
 * `onConflict` are the defaults for every writable route (v8);
 * `metricsInterval` is the ms between `metrics` emits (default 1000; `0`
 * disables the timer) (v10).
 */
export interface DataRouterOptions {
  /**
   * How a record says which partition it belongs to: a property name, or a
   * function of the record. This is the one thing the router needs to route.
   */
  key?: RouterKey;
  /**
   * A record's identity within a route — a property name or a function. It
   * is what makes an update an update rather than a second row, and what
   * lets a record whose partition changed *move* between routes instead of
   * being duplicated. Defaults to the record's `rowKey` property.
   */
  rowKey?: RouterKey;
  /**
   * Send a record to every route whose predicate it matches, rather than to
   * the first one only. Off by default.
   */
  overlap?: boolean;
  /**
   * Called with each record that matched no route. They are never silently
   * dropped: they are counted as well, and go to the default route when one
   * is attached.
   */
  onUnrouted?: (item: RouterRecord | RouterDelta) => void;
  /**
   * How long, in milliseconds, to wait before re-filtering linked grids
   * after a selection changes. 16 by default; `0` re-filters synchronously.
   */
  selectionDebounce?: number;
  /**
   * Where a record carries its version or sequence number — a property name
   * or a function. Supplying it lets the router apply a feed in order and,
   * unless `dedupe` says otherwise, drop a delta it has already seen.
   */
  seq?: RouterKey;
  /**
   * Whether to drop a record whose sequence number is not newer than the
   * last one applied for that identity. On whenever `seq` is given;
   * meaningless without it.
   */
  dedupe?: boolean;
  /**
   * Buffer incoming records and apply them on an interval rather than one at
   * a time: a number of milliseconds, or `{ intervalMs }`. Batching also
   * turns coalescing on.
   */
  batch?: number | { intervalMs: number };
  /**
   * Settle repeated updates to the same identity inside one batch into a
   * single apply, so a fast feed costs one update per row rather than one
   * per message.
   */
  coalesce?: boolean;
  /**
   * Where a record carries its timestamp — a property name or a function. It
   * is the axis `scrubTo` and `replay` move along when time-travel is
   * buffering.
   */
  time?: RouterKey;
  /**
   * The clock the router stamps and expires by. `Date.now` unless you supply
   * one, which is how a test drives time without faking the global.
   */
  now?: () => number;
  /**
   * A whole router described as data — routes, links, buffering — applied
   * through `configure()` as soon as the router is built.
   */
  config?: RouterConfig;
  /**
   * Persist an edit committed in any route attached `{ writable: true }`
   * that names no handler of its own. Return, or resolve, falsely to revert
   * the edit; a route with neither this nor its own handler leaves the edit
   * in place unpersisted and warns. The context's `source` is the
   * `addSource` handle of the feed the edited row arrived on, or null.
   */
  onWrite?: (change: RouterWrite, ctx: { route: unknown; source: unknown }) => unknown;
  /**
   * Called when a write comes back reporting a conflict, with the server's
   * version of the row. The router itself is last-write-wins; this is where
   * a host resolves it differently.
   */
  onConflict?: (change: RouterWrite, ctx: { serverRow: RouterRecord }) => void;
  /**
   * How often, in milliseconds, to emit the `metrics` event. 1000 by
   * default; `0` stops the timer and leaves `metrics()` to be read on
   * demand.
   */
  metricsInterval?: number;
  /** Turn trace recording on from the start (v19), equivalent to calling `trace.enable()` immediately. Off by default. */
  trace?: boolean;
  /** The trace store's bound, oldest row dropped first (v19). 10,000 by default. */
  traceLimit?: number;
}

/** Create a data router that partitions one stream to many grids. */
export function createDataRouter(opts?: DataRouterOptions): DataRouter;
export default createDataRouter;
