/*!
 * Lattice Grid 1.66.0, vue module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  EventName,
  FilterSet,
  Grid,
  GridConfig,
  GridEvent,
  Row,
  RowChange,
  SortEntry,
  createGrid,
} from '../lattice-grid.js';

/**
 * The event name a Vue template binds, as a type: `'cell:changed'` becomes
 * `'cell-changed'`.
 *
 * Recursive over the `:` segments, so a three-part name like
 * `'cell:edit:start'` becomes `'cell-edit-start'` — the same rule
 * `dashedName` applies at runtime, stated once so the props type and the
 * implementation cannot disagree. A colon cannot appear in a Vue binding,
 * which is why the adapter renames at all.
 */
export type DashJoin<E extends string> =
  E extends `${infer Head}:${infer Tail}` ? `${Head}-${DashJoin<Tail>}` : E;

/**
 * One dashed event, as the listener prop Vue's template compiler produces:
 * `'cell-changed'` becomes `'onCell-changed'`.
 *
 * Vue resolves `@cell-changed` to that prop name, so listing them is what
 * makes a template binding type-check.
 */
export type ListenerProp<E extends string> = `on${Capitalize<E>}`;

/** Every event of a set, as the optional listener props a caller may bind. */
export type LatticeVueListeners<Events extends string, Payload> = {
  [E in Events as ListenerProp<E>]?: (payload: Payload) => void;
};

/**
 * A Vue component, in the shape `defineComponent` produces.
 *
 * Declared here rather than imported from `vue` because the package ships no
 * dependencies: `import type { DefineComponent } from 'vue'` in these
 * declarations would fail to resolve for anyone who has not installed Vue,
 * and every other adapter's types make the same trade. The construct
 * signature is the same convenient fiction Vue's own `DefineComponent` uses —
 * the runtime value is an options object, and the `new ()` is what lets a
 * type checker read `$props` off a component used in a template.
 */
export type LatticeVueComponent<
  Props = Record<string, unknown>,
  Emit = (event: string, ...args: unknown[]) => void,
  Exposed = unknown,
> = {
  new (): { $props: Props; $emit: Emit; $slots: Record<string, unknown> } & Exposed;
  readonly name: string;
  readonly emits: readonly string[];
  readonly inheritAttrs: boolean;
};

/** Host-element bindings every component here forwards to its wrapper `div`. */
export type LatticeVueHostProps = {
  /** Applied to the host element rather than to the viewer. */
  class?: unknown;
  /** Applied to the host element rather than to the viewer. */
  style?: unknown;
  /** Applied to the host element rather than to the viewer. */
  id?: string;
};

/**
 * What `<LatticeGrid>` takes.
 *
 * Generic over the row type so `rows`, `predicates` and the keyed-diff prop
 * are checked against the host's own record shape rather than `unknown`.
 *
 * Every **grid configuration key** is accepted as a binding and diffed with
 * `Object.is` — an inline `:columns="[{ field: 'a' }]"` is a new array on
 * every render and reconfigures the grid on every render, so hoist it or put
 * it behind a `computed`. `sort`, `filters`, `quickFilter` and `selectedKeys`
 * are query/selection state rather than configuration and go through their
 * own setters.
 */
export type LatticeVueGridProps<Row = unknown> =
  Omit<GridConfig, 'rows'> & LatticeVueHostProps
  & LatticeVueListeners<DashJoin<EventName>, GridEvent> & {
    /** The rows, copied on ingest so two grids may share one array. */
    rows?: Row[];
    /** Applied through `grid.sort.set`, not as configuration. */
    sort?: SortEntry[];
    /** Applied through `grid.filters.set` — replaces the whole tree; see `predicates`. */
    filters?: FilterSet | null;
    /** Applied through `grid.filters.quick`. */
    quickFilter?: string | { text: string; mode?: string };
    /** Applied through `grid.selection.set`. */
    selectedKeys?: string[];
    /**
     * Named row predicates through `grid.filters.where(name, fn)`, diffed by
     * name and removed when a name goes. These **compose** with whatever
     * filter the reader set in the tool panel; `filters` does not.
     */
    predicates?: Record<string, ((row: Row) => boolean) | null>;
    /**
     * A keyed diff handed to `grid.rows.apply()`, applied when the object's
     * identity changes — a feed produces a new change object per batch.
     */
    rowUpdates?: RowChange;
    /** The name this grid publishes itself under in the provided registry. */
    name?: string;
    /** The route value to `attach` to the router in scope, if any. */
    route?: unknown;
    /** Per-route options for that `attach`. */
    routeOptions?: Record<string, unknown>;
    /**
     * Told when the grid exists, for a parent that cannot use a template
     * ref. A template binds it as `@grid-ready`; Vue resolves that to this
     * prop name. It is not one of `EventName`, so the mapped listener type
     * above does not produce it.
     */
    'onGrid-ready'?: (grid: Grid) => void;
    /** Told just before the grid is destroyed; bound as `@grid-destroyed`. */
    'onGrid-destroyed'?: () => void;
  };

/**
 * What `<LatticeGrid>` emits.
 *
 * `grid-ready` and `grid-destroyed` are named that way because `ready` and
 * `destroy` are **grid event names** already re-emitted here, and React and
 * Angular name their lifecycle pair the same.
 */
export type LatticeVueGridEmit = {
  (event: DashJoin<EventName>, payload: GridEvent): void;
  (event: 'grid-ready', grid: Grid): void;
  (event: 'grid-destroyed'): void;
};

/** What a `<LatticeGrid>` template ref exposes; `grid()` is null before mount. */
export interface LatticeVueGridExposed {
  grid(): Grid | null;
}

/** The Vue grid component, as the factory returns it. */
export type LatticeGridComponent<Row = unknown> =
  LatticeVueComponent<LatticeVueGridProps<Row>, LatticeVueGridEmit, LatticeVueGridExposed>;

/**
 * Build the Vue 3 grid component.
 *
 * A factory rather than a component, because the adapter imports neither Vue
 * nor the grid: you pass both in. That is what keeps the package's promise of
 * no runtime dependencies, and what stops an adapter disagreeing with the
 * grid version already loaded. The dependency key is lowercase `vue` —
 * `createLatticeGrid({ vue, createGrid })`.
 *
 * The component is built with `defineComponent` and a render function, so it
 * needs no template compiler in your build and runs on `vue.runtime.*`.
 *
 * One grid is created in `onMounted` and destroyed in `onBeforeUnmount`; a
 * prop change is pushed into the live grid and never rebuilds it, so a `v-if`
 * toggled twice leaves exactly one grid alive.
 *
 * The live grid is reached through the exposed `grid()` method on a template
 * ref — `gridRef.value.grid()`, or `this.$refs.grid.grid()` in an options
 * component — which returns the same `Grid` the vanilla `createGrid` returns,
 * or null before mount.
 */
export function createLatticeGrid<Row = unknown>(deps: {
  vue: unknown;
  createGrid: (el: unknown, config: GridConfig) => Grid;
}): LatticeGridComponent<Row>;

/** What every viewer component takes beyond its own configuration. */
export type LatticeVueViewerCommonProps = LatticeVueHostProps & {
  /** The grid this viewer is built against; taken from the registry when absent. */
  grid?: Grid | null;
  /** Which published grid to take from the registry; `'default'` when absent. */
  gridName?: string;
  /** Told when the viewer exists, with the instance. */
  onReady?: (instance: unknown) => void;
  /** Told just before it is destroyed. */
  onDestroyed?: () => void;
};

/** What a viewer's template ref exposes; `instance()` is null before mount. */
export interface LatticeVueViewerExposed<Instance = unknown> {
  instance(): Instance | null;
}

/** A viewer's emitter: its own events under dashed names, plus the lifecycle pair. */
export type LatticeVueViewerEmit<Events extends string> = {
  (event: Events, payload: unknown): void;
  (event: 'ready', instance: unknown): void;
  (event: 'destroyed'): void;
};

/** The KPI panel's Vue props: its own config, the common ones, and its events. */
export type LatticeVueKPIProps<Row = unknown> =
  Record<string, unknown> & LatticeVueViewerCommonProps & {
    rows?: Row[];
  } & LatticeVueListeners<
    'tile-click' | 'tile-dblclick' | 'tile-contextmenu' | 'node-toggle' | 'change', unknown>;

/** A chart's Vue props: the spec, the common ones, and its five events. */
export type LatticeVueChartProps = Record<string, unknown> & LatticeVueViewerCommonProps
  & LatticeVueListeners<'click' | 'hover' | 'leave' | 'draw' | 'legend', unknown>;

/** The board's Vue props. */
export type LatticeVueKanbanProps<Row = unknown> =
  Record<string, unknown> & LatticeVueViewerCommonProps & {
    rows?: Row[];
    quickFilter?: string;
    sprint?: unknown;
    epic?: unknown;
    loading?: boolean;
    error?: string | null;
  };

/** The Gantt's Vue props. */
export type LatticeVueGanttProps = Record<string, unknown> & LatticeVueViewerCommonProps & {
  tasks?: unknown[];
  dependencies?: unknown[];
} & LatticeVueListeners<'schedule' | 'error', unknown>;

/** The layout's Vue props. */
export type LatticeVueLayoutProps = Record<string, unknown> & LatticeVueViewerCommonProps;

/** One tab of a `<LatticeTabs>`; a slot named for its `id` makes it Vue's. */
export interface LatticeVueTabSpec {
  id: string;
  label?: string;
  [key: string]: unknown;
}

/** The tab strip's Vue props. */
export type LatticeVueTabsProps = Record<string, unknown> & LatticeVueHostProps & {
  tabs: LatticeVueTabSpec[];
  /** The open tab; changing it calls `activate`. Everything else in `tabs` is mount-time. */
  active?: string;
  /** Told when the strip exists, with it; bound as `@ready`. */
  onReady?: (strip: unknown) => void;
  /** Told just before the strip is destroyed; bound as `@destroyed`. */
  onDestroyed?: () => void;
} & LatticeVueListeners<'before-tab-change' | 'tab-changed' | 'tab-change-cancelled', unknown>;

/**
 * Build a Vue component around any Lattice viewer factory.
 *
 * `viewer` selects the event and live-prop tables; `requires` names the props
 * the viewer cannot be built without (and which rebuild it when their
 * identity changes); `fromContext` names the prop filled from the provided
 * grid registry.
 */
export function createLatticeViewer(options: {
  vue: unknown;
  viewer: 'kpi' | 'kanban' | 'tabs' | 'chart' | 'gantt' | 'layout' | 'router';
  mount: (el: unknown, config: Record<string, unknown>) => unknown;
  name?: string;
  requires?: string[];
  fromContext?: string;
}): LatticeVueComponent<Record<string, unknown>, LatticeVueViewerEmit<string>,
  LatticeVueViewerExposed>;

/** The KPI panel as a Vue component. Grid-bound through the registry by default. */
export function createLatticeKPI<Row = unknown>(deps: {
  vue: unknown; createKPI: (el: unknown, config: Record<string, unknown>) => unknown;
}): LatticeVueComponent<LatticeVueKPIProps<Row>, LatticeVueViewerEmit<string>,
  LatticeVueViewerExposed>;

/** A chart as a Vue component. Requires a grid; a new grid rebuilds the chart. */
export function createLatticeChart(deps: {
  vue: unknown; createChart: (opts: Record<string, unknown>) => unknown;
}): LatticeVueComponent<LatticeVueChartProps, LatticeVueViewerEmit<string>,
  LatticeVueViewerExposed>;

/** The kanban board as a Vue component. */
export function createLatticeKanban<Row = unknown>(deps: {
  vue: unknown; createKanban: (el: unknown, config: Record<string, unknown>) => unknown;
}): LatticeVueComponent<LatticeVueKanbanProps<Row>, LatticeVueViewerEmit<string>,
  LatticeVueViewerExposed>;

/** The Gantt as a Vue component. */
export function createLatticeGantt(deps: {
  vue: unknown; createGantt: (opts: Record<string, unknown>) => unknown;
}): LatticeVueComponent<LatticeVueGanttProps, LatticeVueViewerEmit<string>,
  LatticeVueViewerExposed>;

/** The layout as a Vue component. */
export function createLatticeLayout(deps: {
  vue: unknown; createLayout: (el: unknown, config: Record<string, unknown>) => unknown;
}): LatticeVueComponent<LatticeVueLayoutProps, LatticeVueViewerEmit<string>,
  LatticeVueViewerExposed>;

/**
 * The tab strip, with Vue-rendered tab content.
 *
 * A tab declares its content as a **named slot** — `<template #overview>` for
 * a tab with `id: 'overview'`, or `<template #tab-overview>` — and the slot is
 * rendered into the panel element the module created through a `<Teleport>`,
 * so a tab's grid is a real `<LatticeGrid>` with props, a ref and the
 * surrounding `provide`s. A tab with no slot is left to the module, so
 * configuration-driven grid tabs still work and the two kinds mix on one strip.
 */
export function createLatticeTabs(deps: {
  vue: unknown;
  createTabs: (el: unknown, config: Record<string, unknown>) => unknown;
  createGrid?: (el: unknown, config: GridConfig) => Grid;
}): LatticeVueComponent<LatticeVueTabsProps, LatticeVueViewerEmit<string>,
  LatticeVueViewerExposed>;

/** Where grids publish themselves so the viewers around them can find one. */
export interface LatticeVueGridRegistry {
  /** A shallow ref of name → grid; replaced, never mutated, on each change. */
  grids: { value: Readonly<Record<string, Grid>> };
  /** Publish a grid under a name, or withdraw it with `null`. */
  publish(name: string, grid: Grid | null): void;
}

/**
 * The provider component and the composables that write and read the grid
 * registry.
 *
 * A grid-bound viewer needs the grid *instance*, which appears after the
 * first render; a template ref cannot help, because assigning to one
 * re-renders nobody. `provide`/`inject` over a `shallowRef` can.
 */
export function createLatticeGridContext(deps: { vue: unknown }): {
  LatticeGridProvider: LatticeVueComponent<Record<string, never>>;
  provideLatticeGrids: () => LatticeVueGridRegistry;
  useLatticeGrid: (name?: string) => { value: Grid | null };
};

/** The Data Router handle a `provideLatticeRouter` puts in scope. */
export interface LatticeVueRouterHandle {
  /** The live router, built the first time anything asks for it. */
  readonly router: unknown;
  /** Attach a grid to a route. */
  attach(grid: Grid, route: unknown, opts?: Record<string, unknown>): void;
  /** Detach a grid, before it is destroyed. */
  detach(grid: Grid): void;
  /** Destroy the router; called for you when the providing scope is disposed. */
  destroy(): void;
}

/**
 * The Data Router composables and the provider component.
 *
 * `provideLatticeRouter(config)` is called in a component's `setup`. The
 * router is built by the first routed grid beneath it and destroyed when that
 * component's scope is, and the config is read **once** — rebuilding would
 * drop every attached grid and every row the router holds.
 */
export function createLatticeRouter(deps: {
  vue: unknown; createDataRouter: (opts: Record<string, unknown>) => unknown;
}): {
  provideLatticeRouter: (config?: Record<string, unknown>) => LatticeVueRouterHandle;
  useLatticeRouter: () => LatticeVueRouterHandle | null;
  LatticeRouterProvider: LatticeVueComponent<{ config?: Record<string, unknown> }>;
};

/**
 * Every Vue binding this package ships, from one call.
 *
 * Pass the factories the application uses and it builds those components,
 * leaving the rest undefined. Nothing is imported, so an application that
 * never uses the board never loads the board.
 */
export function createLatticeVue(deps: {
  vue: unknown;
  createGrid?: (el: unknown, config: GridConfig) => Grid;
  createKPI?: (el: unknown, config: Record<string, unknown>) => unknown;
  createChart?: (opts: Record<string, unknown>) => unknown;
  createKanban?: (el: unknown, config: Record<string, unknown>) => unknown;
  createGantt?: (opts: Record<string, unknown>) => unknown;
  createLayout?: (el: unknown, config: Record<string, unknown>) => unknown;
  createTabs?: (el: unknown, config: Record<string, unknown>) => unknown;
  createDataRouter?: (opts: Record<string, unknown>) => unknown;
}): Record<string, unknown>;

/** Every grid event, as the name a Vue caller binds after `dashedName`. */
export const EVENT_NAMES: readonly string[];
/** `cell:changed` → `cell-changed`: a colon cannot appear in a Vue binding. */
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
/** The name a grid publishes itself under when the host does not choose one. */
export const DEFAULT_GRID_NAME: string;
export default createLatticeGrid;
