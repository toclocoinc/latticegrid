/*!
 * Lattice Grid 1.69.0, svelte module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  EventName,
  Grid,
  GridConfig,
  GridEvent,
  Row,
  createGrid,
} from '../lattice-grid.js';

/**
 * A Svelte action: `use:lattice={config}`.
 *
 * The action owns nothing but the node the caller already has, so the grid is
 * reached one of two ways. Pass an `onGrid` callback in the action params: `use:lattice={{ ...config, onGrid: (g) => (grid = g) }}`
 * calls it once with the live `Grid` the moment it is built — synchronously,
 * before `ready` fires — and again if you hand the action a different
 * `onGrid`. Or read it off an event: every grid event carries the grid on its
 * `detail`, so `on:ready={(e) => e.detail.grid}` hands you the same `Grid` a
 * turn after construction. Use `onGrid` when you need the instance during the
 * first render.
 *
 * The action is unchanged by the v2 components and stays
 * supported: a host that wants a grid on an element it already owns needs
 * nothing more, and no Svelte compiler is involved.
 */
export function createLatticeAction(deps: {
  createGrid: (el: unknown, config: GridConfig) => Grid;
  CustomEvent?: unknown;
}): (node: unknown, params?: Record<string, unknown>) => {
  update: (next: Record<string, unknown>) => void;
  destroy: () => void;
};

/**
 * An event name as the callback prop a Svelte 5 component takes:
 * `'cell:changed'` becomes `'CellChanged'`, so the prop is `onCellChanged`.
 *
 * Svelte 5 removed component events — `createEventDispatcher` is deprecated
 * and `on:` no longer applies to a component — so an instance event reaches a
 * host as a callback prop. The all-lowercase spelling (`oncellchanged`) is
 * accepted at runtime too, for hosts that prefer Svelte's DOM attribute
 * style; only the canonical one is typed, because a union of both would make
 * every misspelling type-check.
 */
export type CamelJoin<E extends string> =
  E extends `${infer Head}:${infer Tail}`
    ? `${Capitalize<Head>}${CamelJoin<Tail>}`
    : Capitalize<E>;

/** Every event of a set, as the optional callback props a caller may bind. */
export type LatticeSvelteCallbacks<Events extends string, Payload> = {
  [E in Events as `on${CamelJoin<E>}`]?: (payload: Payload) => void;
};

/** Host-element bindings every component here puts on its wrapper `div`. */
export type LatticeSvelteHostProps = {
  /** Applied to the host element rather than to the viewer. */
  class?: string;
  /** Applied to the host element rather than to the viewer. */
  style?: string;
  /** Applied to the host element rather than to the viewer. */
  id?: string;
};

/**
 * What `<LatticeGrid>` (`@toclocoinc/lattice-grid/svelte/Grid.svelte`) takes.
 *
 * Generic over the row type, so `rows`, `predicates` and the keyed-diff prop
 * are checked against the host's own record shape rather than `unknown`.
 *
 * Every **grid configuration key** is accepted and diffed with `Object.is`:
 * an inline `columns={[{ field: 'a' }]}` is a new array on every render and
 * reconfigures the grid every time, so hoist it or hold it in `$state.raw`.
 * `sort`, `filters`, `quickFilter` and `selectedKeys` are query and selection
 * state rather than configuration and go through their own setters.
 *
 * The component types themselves are not declared here: a `.svelte` file is
 * the source of its own component type, and Svelte's language tooling derives
 * the props of `Grid.svelte` from the file the package ships. These are the
 * prop *shapes*, for a host that wants to name them.
 */
export type LatticeSvelteGridProps<Row = unknown> =
  Omit<GridConfig, 'rows'> & LatticeSvelteHostProps
  & LatticeSvelteCallbacks<EventName, GridEvent> & {
    /** The rows the grid holds. A new array replaces them; the same array is a no-op. */
    rows?: Row[];
    /** The name this grid publishes itself under in the registry. Mount-time. */
    name?: string;
    /** A keyed diff applied through `rows.apply()` whenever the object's identity changes. */
    rowUpdates?: {
      add?: Row[]; update?: Row[]; remove?: Array<string | Row>;
    };
    /** Named predicates, registered through `filters.where` so they compose with the reader's own filter. */
    predicates?: Record<string, ((row: Row) => boolean) | null>;
    /** The Data Router route this grid is attached to, when a `Router.svelte` is above it. */
    route?: unknown;
    /** Per-route options passed with `route`. */
    routeOptions?: Record<string, unknown>;
    /** Called once with the live grid, as soon as it exists. */
    onGridReady?: (grid: Grid) => void;
    /** Called as the component unmounts, before the grid is destroyed. */
    onGridDestroyed?: () => void;
  };

/** What a grid-bound viewer component takes, on top of its own configuration. */
export type LatticeSvelteViewerProps<Events extends string = string> =
  LatticeSvelteHostProps & LatticeSvelteCallbacks<Events, unknown> & {
    /** The grid to build against, when the host holds one itself. */
    grid?: Grid;
    /** Which published grid to take from the registry; the default name when absent. */
    gridName?: string;
    /** Called once with the live viewer, as soon as it is built. */
    onReady?: (instance: unknown) => void;
    /** Called when the viewer is torn down, including a rebuild onto a new grid. */
    onDestroyed?: () => void;
  };

/** The registry `GridProvider.svelte` puts in context and every viewer reads. */
export type LatticeSvelteGridRegistry = {
  /** Publish a grid under a name, or withdraw it with `null`. */
  publish: (name: string, grid: Grid | null) => void;
  /** The grid published under a name, or null. */
  get: (name?: string) => Grid | null;
  /** Every published name. */
  names: () => string[];
  /** Hear about every publish and withdrawal; the return value unsubscribes. */
  subscribe: (fn: () => void) => () => void;
};

/** The router handle `Router.svelte` puts in context. */
export type LatticeSvelteRouterHandle = {
  /** The live router, built on the first grid that asks to be routed. */
  readonly router: unknown;
  /** Attach a grid to a route. */
  attach: (grid: Grid, route: unknown, routeOptions?: Record<string, unknown>) => void;
  /** Detach a grid, before it is destroyed. */
  detach: (grid: Grid) => void;
  /** Destroy the router with the component that provided it. */
  destroy: () => void;
};

/** The context key a grid registry is published under. */
export const GRID_REGISTRY_KEY: symbol;
/** The context key a Data Router handle is published under. */
export const ROUTER_KEY: symbol;
/** The name a grid publishes itself under when the host does not choose one. */
export const DEFAULT_GRID_NAME: string;

/**
 * Own one grid for the life of a component: build once, diff props into the
 * live instance, publish into the registry, attach to the router, and detach
 * before destroying.
 */
export function bindGrid(opts: {
  createGrid: (el: unknown, config: GridConfig) => Grid;
  element: unknown;
  props?: Record<string, unknown>;
  registry?: LatticeSvelteGridRegistry | null;
  router?: LatticeSvelteRouterHandle | null;
}): {
  grid: Grid;
  update: (next: Record<string, unknown>) => void;
  destroy: (props?: Record<string, unknown>) => void;
};

/**
 * Own one viewer — KPI panel, chart, board, plan or layout — for the life of
 * a component. `sync` builds it when everything it needs has arrived, pushes
 * changed props into it, and rebuilds it onto a different grid.
 */
export function bindViewer(opts: {
  viewer: 'kpi' | 'chart' | 'kanban' | 'gantt' | 'layout';
  factory: (...args: never[]) => unknown;
  element: unknown;
  registry?: LatticeSvelteGridRegistry | null;
}): {
  readonly instance: unknown;
  sync: (props: Record<string, unknown>) => void;
  destroy: () => void;
};

/**
 * Own one tab strip whose panels hold Svelte-rendered content. `place` moves
 * a tab's `display: contents` holder into the panel the module made, which is
 * how a snippet's content becomes a real child of the tab panel without a
 * portal API Svelte does not have.
 */
export function bindTabs(opts: {
  createTabs: (el: unknown, config: Record<string, unknown>) => unknown;
  element: unknown;
  createGrid?: (el: unknown, config: GridConfig) => Grid;
  onPanels?: (ids: string[]) => void;
}): {
  readonly instance: unknown;
  sync: (props: Record<string, unknown>) => void;
  place: (id: string, holder: unknown) => void;
  destroy: (props?: Record<string, unknown>) => void;
};

/** A registry of live grids, keyed by the name each publishes itself under. */
export function createGridRegistry(): LatticeSvelteGridRegistry;

/**
 * Own a Data Router for the life of the component that provides it: built on
 * the first routed grid, destroyed with the component.
 */
export function createRouterHandle(opts: {
  createDataRouter: (config: Record<string, unknown>) => unknown;
  config?: Record<string, unknown> | (() => Record<string, unknown>);
}): LatticeSvelteRouterHandle;

/**
 * Split a component's props into the configuration the instance gets and the
 * props the adapter consumes itself, normalising either callback spelling.
 */
export function adaptProps(kind: string, props: Record<string, unknown>): {
  config: Record<string, unknown>;
  own: Record<string, unknown>;
};

/** A callback prop, accepted as `onCellChanged` or as `oncellchanged`. */
export function pickCallback(
  props: Record<string, unknown>, camel: string,
): ((...args: never[]) => void) | null;

/** The `(element, config)` call each module's factory actually wants. */
export function viewerMount(
  viewer: string, factory: (...args: never[]) => unknown,
): (el: unknown, config: Record<string, unknown>) => unknown;

/**
 * Which tabs the host declared content for: the ids whose snippet prop is a
 * function, in declaration order.
 */
export function snippetTabIds(
  tabs: unknown, props: Record<string, unknown>,
): string[];

/** How each viewer is wired: its label, what it requires, and where its grid goes. */
export const VIEWER_BINDING: Readonly<Record<string, {
  label: string; requires: readonly string[]; fromContext: string | null;
}>>;

/** Every grid event name. */
export const EVENT_NAMES: readonly string[];
/** `cell:edit:start` → `cell-edit-start`, the name the action dispatches under. */
export function dashedName(event: string): string;
/** Every event each non-grid viewer emits, keyed by viewer name. */
export const VIEWER_EVENTS: Readonly<Record<string, readonly string[]>>;
/** The props each viewer can take live, and the instance call each becomes. */
export const VIEWER_APPLY: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
/** `card:move` → `onCardMove`, the handler key the shared controller dispatches on. */
export function viewerHandlerName(event: string): string;
/**
 * The framework-free viewer lifecycle every adapter drives an instance
 * through: mount once, push changed props into the live instance, destroy.
 */
export function createViewerController(opts: {
  viewer: string;
  mount: (el: unknown, config: Record<string, unknown>) => unknown;
  element: unknown;
  props?: Record<string, unknown>;
  name?: string;
}): {
  instance: unknown;
  update: (next: Record<string, unknown>) => void;
  destroy: () => void;
};
export default createLatticeAction;
