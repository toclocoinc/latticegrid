/*!
 * Lattice Grid 1.61.0, data-router module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * A record routed through a data router: any object. Its partition comes from
 * the router's `key` and its identity within a grid from `rowKey`.
 */
type RouterRecord = Record<string, unknown>;

/** A per-route diff summary returned by `load`. */
interface RouteDiff { added: number; updated: number; removed: number }

/** A predicate: a property value (`row[key] === value`) or a `fn(row)`. */
type RoutePredicate = unknown | ((row: RouterRecord) => boolean);

/**
 * Per-route reshaping options (v3, BACKLOG-0000887): `transform` maps/renames/
 * derives each row before the grid sees it; `filter` gives the grid only the
 * rows it admits; `sort` (a comparator or `{ key, dir }`) orders what the grid
 * receives. `rowKey` overrides the router default. All optional.
 */
interface RouteOptions {
  rowKey?: (string | ((row: RouterRecord) => unknown));
  transform?: (row: RouterRecord) => RouterRecord;
  filter?: (row: RouterRecord) => boolean;
  sort?: (((a: RouterRecord, b: RouterRecord) => number) | { key: string; dir?: 'asc' | 'desc' });
}

/**
 * A cross-grid selection relation (v2, BACKLOG-0000880): a key map (target
 * rows whose `to` value is among the selected source rows' `from` values — an
 * IN set), or a function handed the selected source rows that returns a
 * target-row predicate.
 */
type SelectionRelation =
  | { from: string; to: string }
  | ((selected: RouterRecord[]) => ((row: RouterRecord) => boolean));

/**
 * A data router: one arriving stream, partitioned by a property (or composite
 * predicate), fanned out to a grid per partition (BACKLOG-0000879). Each grid
 * sees only its slice, updated by keyed diff through the public
 * `grid.rows.apply` path — no grid-core change, no cross-references between
 * grids. Snapshots apply keyed diffs (unchanged rows never repaint); deltas add,
 * update or remove in place by `rowKey`, preserving selection and scroll.
 */
interface DataRouter {
  /** Attach a grid behind a predicate; `opts` may reshape/filter/sort the route (v3). */
  attach(grid: unknown, predicate: RoutePredicate, opts?: RouteOptions): DataRouter;
  /** Attach the "rest" sink for records no explicit route matched. */
  attachDefault(grid: unknown, opts?: RouteOptions): DataRouter;
  /** Detach a grid; the host still owns and destroys it. */
  detach(grid: unknown): DataRouter;
  /** Apply a full snapshot as a keyed diff per grid; returns per-route counts. */
  load(snapshot: RouterRecord[]): RouteDiff[];
  /** Apply incremental deltas, routed and applied in place by `rowKey`. */
  apply(deltas: { op: 'upsert' | 'delete'; row: RouterRecord }[]): void;
  /**
   * Link a source grid's selection to what a target grid receives (v2,
   * BACKLOG-0000880): the target shows the subset of its partition the
   * `relation` admits, re-pushed through the keyed-diff path. No selection
   * shows the full partition; changes are debounced.
   */
  link(source: unknown, target: unknown, relation: SelectionRelation): DataRouter;
  /** Apply any debounced selection refilter synchronously (for tests/determinism). */
  flush(): DataRouter;
  /** How many records matched no route. */
  readonly unrouted: number;
  /** Detach every grid and drop every link (the host destroys the grids themselves). */
  destroy(): void;
}

/**
 * Create a data router that partitions one stream to many grids.
 *
 * `key` is the partition property or `fn(row)`; `rowKey` is the identity within
 * a grid; `overlap` fans a record to every matching route (default: first match
 * wins); `onUnrouted` receives records that match none; `selectionDebounce` is
 * the debounce in ms for cross-grid selection refilters (default 16; `0` is
 * synchronous).
 */
export function createDataRouter(opts: {
  key: (string | ((row: RouterRecord) => unknown));
  rowKey?: (string | ((row: RouterRecord) => unknown));
  overlap?: boolean;
  onUnrouted?: (item: unknown) => void;
  selectionDebounce?: number;
}): DataRouter;
export default createDataRouter;
