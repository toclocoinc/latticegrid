/*!
 * Lattice Grid 1.68.0, react module type declarations
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
 * The handler prop name one event maps to, as a type: `'cell:changed'`
 * becomes `'onCellChanged'`.
 *
 * Recursive over the `:` segments, so a three-part name like
 * `'cell:edit:start'` becomes `'onCellEditStart'` — the same rule
 * `handlerName` applies at runtime, stated once so the props type and the
 * implementation cannot disagree.
 */
export type PascalJoin<E extends string> =
  E extends `${infer Head}:${infer Tail}`
    ? `${Capitalize<Head>}${PascalJoin<Tail>}`
    : Capitalize<E>;
export type HandlerProp<E extends string> = `on${PascalJoin<E>}`;

/** Every grid event as a React callback prop, each receiving the `GridEvent`. */
export type LatticeGridEventProps = {
  [E in EventName as HandlerProp<E>]?: (event: GridEvent) => void;
};

/** The live instance a `<LatticeGrid>` ref exposes; `null` before mount. */
export interface LatticeGridHandle {
  readonly grid: Grid | null;
}

/**
 * What `<LatticeGrid>` takes.
 *
 * Generic over the row type so `rows`, `predicates` and the keyed-diff prop
 * are checked against the host's own record shape rather than `unknown`.
 *
 * Every **grid configuration key** is accepted as a prop and diffed with
 * `Object.is` — an inline `columns={[…]}` is a new array on every render and
 * reconfigures the grid on every render, so hoist it or `useMemo` it. `sort`,
 * `filters`, `quickFilter` and `selectedKeys` are query/selection state rather
 * than configuration and go through their own setters.
 */
export type LatticeGridProps<Row = unknown> =
  Omit<GridConfig, 'rows'> & LatticeGridEventProps & {
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
    /** Told when the grid exists, for a parent that cannot use a ref. */
    onGridReady?: (grid: Grid) => void;
    /** Told just before the grid is destroyed. */
    onGridDestroy?: () => void;
    /** The name this grid publishes itself under in a `LatticeGridProvider`. */
    name?: string;
    /** The route value to `attach` to the router in context, if any. */
    route?: unknown;
    /** Per-route options for that `attach`. */
    routeOptions?: Record<string, unknown>;
    /** Applied to the host element rather than to the grid. */
    className?: string;
    /** Applied to the host element rather than to the grid. */
    style?: Record<string, unknown>;
    /** Applied to the host element rather than to the grid. */
    id?: string;
  };

/**
 * Build the React grid component.
 *
 * A factory rather than a component, because the adapter imports neither
 * React nor the grid: you pass both in. That is what keeps the package's
 * promise of no runtime dependencies, and what stops an adapter disagreeing
 * with the grid version already loaded.
 *
 * The live grid is reached through a forwarded ref: `ref.current.grid` is the
 * same `Grid` the vanilla `createGrid` returns, or null before mount.
 *
 * React 18's StrictMode double mount creates exactly **one** grid: the
 * component builds it in an effect with an empty dependency list and destroys
 * it in that effect's cleanup.
 */
export function createLatticeGrid<Row = unknown>(deps: {
  React: unknown;
  createGrid: (el: unknown, config: GridConfig) => Grid;
}): (props: LatticeGridProps<Row> & { ref?: unknown }) => unknown;

/** The live instance a viewer component's ref exposes; `null` before mount. */
export interface LatticeViewerHandle<Instance = unknown> {
  readonly instance: Instance | null;
}

/**
 * What every viewer component takes beyond its own configuration: the grid it binds to, which published grid to take when
 * that is left off, the lifecycle callbacks, and the host-element props.
 */
export interface LatticeViewerCommonProps<Instance = unknown> {
  /** The grid this viewer is built against; taken from context when absent. */
  grid?: Grid | null;
  /** Which published grid to take from context; `'default'` when absent. */
  gridName?: string;
  /** Told when the viewer exists. */
  onReady?: (instance: Instance) => void;
  /** Told just before it is destroyed. */
  onDestroy?: () => void;
  /** Applied to the host element rather than to the viewer. */
  className?: string;
  /** Applied to the host element rather than to the viewer. */
  style?: Record<string, unknown>;
  /** Applied to the host element rather than to the viewer. */
  id?: string;
}

/** The KPI panel's React props: its own config, plus the common ones and its events. */
export type LatticeKPIProps<Row = unknown> =
  Record<string, unknown> & LatticeViewerCommonProps & {
  rows?: Row[];
  onTileClick?: (payload: unknown) => void;
  onTileDblclick?: (payload: unknown) => void;
  onTileContextmenu?: (payload: unknown) => void;
  onNodeToggle?: (payload: unknown) => void;
  onChange?: (payload: unknown) => void;
};

/** A chart's React props: the spec, the common ones, and its five events. */
export type LatticeChartProps = Record<string, unknown> & LatticeViewerCommonProps & {
  /** Required: a chart is always built against a grid. */
  grid?: Grid | null;
  onClick?: (payload: unknown) => void;
  onHover?: (payload: unknown) => void;
  onLeave?: (payload: unknown) => void;
  onDraw?: (payload: unknown) => void;
  onLegend?: (payload: unknown) => void;
};

/** The board's React props. */
export type LatticeKanbanProps<Row = unknown> =
  Record<string, unknown> & LatticeViewerCommonProps & {
    rows?: Row[];
    quickFilter?: string;
    sprint?: unknown;
    epic?: unknown;
    loading?: boolean;
    error?: string | null;
  };

/** The Gantt's React props. */
export type LatticeGanttProps = Record<string, unknown> & LatticeViewerCommonProps & {
  tasks?: unknown[];
  dependencies?: unknown[];
  onSchedule?: (payload: unknown) => void;
  onError?: (payload: unknown) => void;
};

/** The layout's React props. */
export type LatticeLayoutProps = Record<string, unknown> & LatticeViewerCommonProps;

/** One tab of a `<LatticeTabs>`; `content` makes it React's rather than the module's. */
export interface LatticeTabSpec {
  id: string;
  label?: string;
  /** A React element, or a function returning one, rendered through a portal. */
  content?: unknown | (() => unknown);
  [key: string]: unknown;
}

/** The tab strip's React props. */
export type LatticeTabsProps = Record<string, unknown> & {
  tabs: LatticeTabSpec[];
  /** The open tab; changing it calls `activate`. */
  active?: string;
  onBeforeTabChange?: (payload: unknown) => void;
  onTabChanged?: (payload: unknown) => void;
  onTabChangeCancelled?: (payload: unknown) => void;
  className?: string;
  style?: Record<string, unknown>;
  id?: string;
};

/**
 * Build a React component around any Lattice viewer factory.
 *
 * `viewer` selects the event and live-prop tables; `requires` names the props
 * the viewer cannot be built without (and which rebuild it when their identity
 * changes); `fromContext` names the prop filled from the grid context.
 */
export function createLatticeViewer(options: {
  React: unknown;
  viewer: 'kpi' | 'kanban' | 'tabs' | 'chart' | 'gantt' | 'layout' | 'router';
  mount: (el: unknown, config: Record<string, unknown>) => unknown;
  name?: string;
  requires?: string[];
  fromContext?: string;
}): (props: Record<string, unknown> & { ref?: unknown }) => unknown;

/** The KPI panel as a React component. Grid-bound through context by default. */
export function createLatticeKPI<Row = unknown>(deps: {
  React: unknown; createKPI: (el: unknown, config: Record<string, unknown>) => unknown;
}): (props: LatticeKPIProps<Row> & { ref?: unknown }) => unknown;

/** A chart as a React component. Requires a grid; a new grid rebuilds the chart. */
export function createLatticeChart(deps: {
  React: unknown; createChart: (opts: Record<string, unknown>) => unknown;
}): (props: LatticeChartProps & { ref?: unknown }) => unknown;

/** The kanban board as a React component. */
export function createLatticeKanban<Row = unknown>(deps: {
  React: unknown; createKanban: (el: unknown, config: Record<string, unknown>) => unknown;
}): (props: LatticeKanbanProps<Row> & { ref?: unknown }) => unknown;

/** The Gantt as a React component. */
export function createLatticeGantt(deps: {
  React: unknown; createGantt: (opts: Record<string, unknown>) => unknown;
}): (props: LatticeGanttProps & { ref?: unknown }) => unknown;

/** The layout as a React component. */
export function createLatticeLayout(deps: {
  React: unknown; createLayout: (el: unknown, config: Record<string, unknown>) => unknown;
}): (props: LatticeLayoutProps & { ref?: unknown }) => unknown;

/**
 * The tab strip, with React-rendered tab content.
 *
 * `react-dom` is needed for `createPortal`: a tab's content is rendered into
 * the panel element the module created, so it stays a genuine child of the
 * React tree that declared it — props, refs and context all reach it.
 */
export function createLatticeTabs(deps: {
  React: unknown;
  ReactDOM: unknown;
  createTabs: (el: unknown, config: Record<string, unknown>) => unknown;
  createGrid?: (el: unknown, config: GridConfig) => Grid;
}): (props: LatticeTabsProps & { ref?: unknown }) => unknown;

/**
 * The provider and hook that let a grid-bound viewer find its grid.
 *
 * A ref cannot help here: writing to a ref re-renders nobody, so a sibling
 * that needs the instance never learns it arrived.
 */
export function createLatticeGridContext(deps: { React: unknown }): {
  LatticeGridProvider: (props: { children?: unknown }) => unknown;
  useLatticeGrid: (name?: string) => Grid | null;
};

/**
 * The Data Router hook and its provider.
 *
 * `useLatticeRouter` creates the router in an effect and destroys it in that
 * effect's cleanup, so it returns `null` on the first render. The config is
 * read once: rebuilding would drop every attached grid and every row held.
 */
export function createLatticeRouter(deps: {
  React: unknown; createDataRouter: (opts: Record<string, unknown>) => unknown;
}): {
  useLatticeRouter: (config?: Record<string, unknown>) => unknown | null;
  LatticeRouterProvider: (props: { router?: unknown; children?: unknown }) => unknown;
  useRouter: () => unknown | null;
};

/** Every React binding this package ships, from one call. */
export function createLatticeReact(deps: {
  React: unknown;
  ReactDOM?: unknown;
  createGrid?: (el: unknown, config: GridConfig) => Grid;
  createKPI?: (el: unknown, config: Record<string, unknown>) => unknown;
  createChart?: (opts: Record<string, unknown>) => unknown;
  createKanban?: (el: unknown, config: Record<string, unknown>) => unknown;
  createGantt?: (opts: Record<string, unknown>) => unknown;
  createLayout?: (el: unknown, config: Record<string, unknown>) => unknown;
  createTabs?: (el: unknown, config: Record<string, unknown>) => unknown;
  createDataRouter?: (opts: Record<string, unknown>) => unknown;
}): Record<string, unknown>;

/** Every grid event, as the prop name a React caller writes. */
export const EVENT_NAMES: readonly string[];
export function handlerName(event: string): string;
/** Every event each non-grid viewer emits, keyed by viewer name. */
export const VIEWER_EVENTS: Readonly<Record<string, readonly string[]>>;
/** The props each viewer can take live, and the instance call each becomes. */
export const VIEWER_APPLY: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
/** `card:move` → `onCardMove`, for a viewer event. */
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
