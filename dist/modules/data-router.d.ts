/*!
 * Lattice Grid 1.70.0, data-router module type declarations
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
type RouterKey = string | ((row: RouterRecord) => string | number);

/** A per-route diff summary returned by `load`. */
interface RouteDiff { added: number; updated: number; removed: number }

/**
 * What a route matches: a partition VALUE (the record is routed when
 * `row[key] === value`), or a `fn(row)` predicate for a composite route.
 * Declared as `unknown` because any value can be a partition key; the
 * function form is the only one TypeScript can check.
 */
type RoutePredicate = unknown;

/** A route's `sort`: a comparator, or a key and direction (`'asc'` unless `'desc'`). */
type RouteSort = ((a: RouterRecord, b: RouterRecord) => number) | { key: string; dir?: 'asc' | 'desc' };

/**
 * One incremental change: `upsert` adds or updates the row by `rowKey`,
 * `delete` removes it. `seq` versions the delta when the row itself carries
 * no version field (the router's `seq` option names one that does).
 */
interface RouterDelta { op: 'upsert' | 'delete'; row: RouterRecord; seq?: number }

/** The change a `subscribe` handler receives: the same keyed diff a grid gets. */
interface RouterChange { add: RouterRecord[]; update: RouterRecord[]; remove: string[] }

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
interface RouteRollup {
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
interface RouteBackpressure { maxHz?: number; minInterval?: number; sample?: number; maxLag?: number }

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
interface RouteOptions {
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
interface AlertOptions { rowKey?: RouterKey; filter?: (row: RouterRecord) => boolean; debounce?: number }

/**
 * A cross-grid selection relation (v2): a key map (target
 * rows whose `to` value is among the selected source rows' `from` values — an
 * IN set), or a function handed the selected source rows that returns a
 * target-row predicate.
 */
type SelectionRelation =
  | { from: string; to: string }
  | ((selected: RouterRecord[]) => ((row: RouterRecord) => boolean));

/**
 * One edge of a relationship graph (v3): the source grid whose selection
 * filters the target. `on` (or `relation`) is the relation; `mutual` makes
 * the edge work in both directions.
 */
interface RouterEdge { from: unknown; to: unknown; on?: SelectionRelation; relation?: SelectionRelation; mutual?: boolean }

/**
 * A declarative routing graph (v5): the same routes, links,
 * relationship edges and buffer the imperative calls would make, as one data
 * spec. Desugars to those calls and composes with them.
 */
interface RouterConfig {
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
 * A fan-in source's lookup join (v11): `from` is the lookup source's id;
 * `localKey` (alias `on`) reads the joining value off this source's row;
 * `foreignKey` (alias `fromKey`) reads it off the lookup row, defaulting to a
 * string `localKey`; `fields` (alias `select`) picks the lookup fields to
 * carry — a list, a rename map, or a function of both rows; `missing` says
 * what to do while the lookup row has not arrived: `hold` the row back,
 * `passthrough` it unjoined, or fill the fields with `null`.
 */
/** What a fan-in lookup join does with a row while its lookup has not arrived. */
export type RouterJoinMissing = 'hold' | 'passthrough' | 'null';
interface RouterJoin {
  /** The id of the registered source holding the lookup rows. */
  from: string;
  /**
   * Reads the joining value off this source's row — a field name or a `fn(row)`.
   * Required: without it (or `on`) the join is ignored with a warning.
   */
  localKey?: RouterKey;
  /** An alias for `localKey`, read when `localKey` is absent. */
  on?: RouterKey;
  /**
   * Reads the joining value off the lookup row — a field name or a `fn(row)`. Defaults to
   * a string `localKey`; with a function `localKey` and no `foreignKey`, the join is
   * ignored with a warning.
   */
  foreignKey?: RouterKey;
  /** An alias for `foreignKey`, read when `foreignKey` is absent. */
  fromKey?: RouterKey;
  /**
   * Which lookup fields to carry onto the row: a list of names, a `{ from: to }` rename
   * map, or a `fn(lookupRow, leftRow)` returning the fields to merge. With none, rows
   * pass through unenriched and the router warns.
   */
  fields?: string[] | Record<string, string> | ((lookupRow: RouterRecord | null, leftRow: RouterRecord) => RouterRecord);
  /** An alias for `fields`, read when `fields` is absent. */
  select?: string[] | Record<string, string> | ((lookupRow: RouterRecord | null, leftRow: RouterRecord) => RouterRecord);
  /**
   * What happens while the lookup row has not arrived: `hold` keeps the row from viewers
   * until it does, `passthrough` sends it unenriched, `null` fills the declared fields
   * with null. Defaults to `passthrough`, which an unrecognised value also falls back to,
   * with a warning.
   */
  missing?: RouterJoinMissing;
}

/**
 * Options for a fan-in source (v9): `map` normalises each of the feed's rows
 * before routing; `key` namespaces the feed's identities (`true` prefixes
 * the source id) so feeds with colliding ids do not clobber one another;
 * `join` enriches rows from another registered source (v11).
 */
interface RouterSourceOptions { id?: string; map?: (row: RouterRecord) => RouterRecord; key?: unknown; join?: RouterJoin }

/**
 * The handle `addSource` returns for one feed (v9). Its `load` is a
 * per-source snapshot — a keyed diff over this feed's rows only, other feeds
 * untouched; `apply` and `push` take this feed's deltas through the router's
 * ordinary and batched paths; `remove` deletes exactly the rows it holds and
 * unregisters it, returning the router.
 */
interface RouterSourceHandle {
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
interface RouterRouteMetrics {
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
interface RouterSourceMetrics { id: string; rows: number; throughput: number; [key: string]: unknown }

/**
 * A `metrics()` snapshot (v10): per-route and per-source counts and
 * throughput (rows/sec since the previous read), and the global unrouted,
 * dropped (duplicate), buffered and lag figures.
 */
interface RouterMetrics {
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

/**
 * One entry of `lastQueryPlan()` (v7): a `where` route's fetch, or the single
 * `base` fetch that fed every route without a `where`. `pushedFilter` says
 * whether the filter reached the engine; `residual` is what was finished
 * client-side.
 */
interface RouterQueryPlanEntry { route?: unknown; base?: boolean; pushedFilter: boolean; residual: unknown }

/** The controller `mountDevtools` returns: `refresh` re-renders now, `destroy` unsubscribes and removes the panel. */
interface RouterDevtoolsPanel { refresh(): void; destroy(): void }

/**
 * A pushdown adapter `query()` can source the router from (v7): anything
 * with an `execute(query, request)` returning rows, and optional
 * `capabilities` the planner consults to decide what it may push down.
 */
interface RouterQueryAdapter {
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
interface RouterPersistOptions {
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
 * One event, and the router raises nothing else: routing itself is reported to
 * each attached viewer through its own `rows.apply`, not through an event here.
 * The `metrics` timer runs only while at least one `metrics` listener is
 * registered, so collection costs nothing until someone asks for it, and stops
 * when the last listener unsubscribes.
 */
type RouterEventName =
  /** The metrics timer fired: a `metrics()` snapshot, every `metricsInterval` ms (default 1000; `0` disables the timer). */
  | 'metrics';

/** What a handler receives, per router event. */
interface RouterEventPayloads {
  /** The same snapshot `metrics()` returns, taken at the emit; the throughput baseline advances with it. */
  metrics: RouterMetrics;
}

/**
 * A data router: one arriving stream, partitioned by a property (or composite
 * predicate), fanned out to a grid per partition. Each grid
 * sees only its slice, updated by keyed diff through the public
 * `grid.rows.apply` path — no grid-core change, no cross-references between
 * grids. Snapshots apply keyed diffs (unchanged rows never repaint); deltas add,
 * update or remove in place by `rowKey`, preserving selection and scroll.
 */
interface DataRouter {
  /** Attach a grid behind a predicate; `opts` may reshape, filter, sort, summarise or throttle the route. */
  attach(grid: unknown, predicate: RoutePredicate, opts?: RouteOptions): DataRouter;
  /** Attach the "rest" sink for records no explicit route matched. A second call replaces the first. */
  attachDefault(grid: unknown, opts?: RouteOptions): DataRouter;
  /** Route a partition slice to any non-grid view (v5): the handler receives the same keyed diff a grid would. */
  subscribe(predicate: RoutePredicate, handler: (change: RouterChange) => void, opts?: RouteOptions): DataRouter;
  /** Watch a slice and emit on a rising edge of `condition` rather than render (v5). Removed only by `destroy`. */
  alert(predicate: RoutePredicate, condition: (rows: RouterRecord[]) => unknown, handler: (signal: unknown, rows: RouterRecord[]) => void, opts?: AlertOptions): DataRouter;
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
  /** A cheap point-in-time snapshot of the router's runtime (v10); throughput is measured since the previous read. */
  metrics(): RouterMetrics;
  /**
   * Subscribe to the periodic `metrics` emit (v10) — the only event; the timer runs only
   * while a listener is registered. What it carries is {@link RouterEventPayloads}.
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
interface DataRouterOptions {
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
}

/** Create a data router that partitions one stream to many grids. */
export function createDataRouter(opts?: DataRouterOptions): DataRouter;
export default createDataRouter;
