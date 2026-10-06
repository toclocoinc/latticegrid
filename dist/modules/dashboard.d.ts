/*!
 * Lattice Grid 1.88.0, dashboard module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
  GridState,
  createGrid,
  createHeadlessGrid,
  createPushdownSource,
} from '../lattice-grid.js';

/**
 * A dashboard described as data: a layout, the panels in
 * it, the sources they read and the links between them. `createDashboard`
 * builds it and `dashboard.spec()` hands it back, placements included, so a
 * host can store and version it.
 */
export interface DashboardSpec {
  /**
   * The layout the panels sit in: any `createLayout` option, with `windows`
   * placing panels by id (`{ id, xPos, yPos, xSize, ySize, … }`). A panel with
   * no window entry is auto-placed.
   */
  layout?: DashboardLayoutSpec;
  /** The panels, one viewer each, in the order their windows are mounted. */
  panels: DashboardPanel[];
  /** The named sources panels read, by id. */
  sources?: Record<string, DashboardSource>;
  /** Selection-to-filter links between panels. */
  links?: DashboardLink[];
}

/** The layout part of a spec: the layout module's own options, windows placed by panel id. */
export interface DashboardLayoutSpec {
  /** Cell columns across the dashboard (the layout's default otherwise). */
  columns?: number;
  /** Cell rows down the dashboard (the layout's default otherwise). */
  rows?: number;
  /** The gap between cells. */
  gap?: number | string;
  /** Each panel's window, by panel id: its placement and any window option (title, chrome, movable, …). */
  windows?: Array<{ id: string; xPos?: number; yPos?: number; xSize?: number; ySize?: number; [option: string]: unknown }>;
  /** Every other key is handed to `createLayout` unchanged. */
  [option: string]: unknown;
}

/** What a panel shows. */
export type DashboardPanelKind = 'grid' | 'chart' | 'kpi' | 'calendar' | 'map' | 'html';

/** One panel: a viewer in a window. */
export interface DashboardPanel {
  /** A unique id; its window has the same id. */
  id: string;
  /** Which viewer: a grid, a chart, a KPI panel, a map, or static html. */
  kind: DashboardPanelKind;
  /** The window's title, when its window entry declares none. */
  title?: string;
  /**
   * The source it reads: a key of `sources`, or `grid:<panel id>` to view that
   * grid panel's grid (it narrows when that grid is filtered). Required for
   * `chart` and `map`; an `html` panel reads none.
   */
  source?: string;
  /**
   * For a `map` panel, what draws it: `'chart'` (a map chart such as
   * `markermap` or `choropleth`, the default), `'leaflet'` (`bindLeaflet`) or
   * `'deckgl'` (`bindDeck`), each needing its module on the page.
   */
  binding?: 'chart' | 'leaflet' | 'deckgl';
  /**
   * The viewer's own options, passed to `createGrid`, `createChart`,
   * `createKPI`, `bindLeaflet` or `bindDeck` unchanged — the dashboard adds
   * only the element and the grid. A Leaflet panel's `map` and a deck.gl
   * panel's `deck` may be a function of the panel's element that makes one.
   * An `html` panel takes `{ html }` (the host's own markup) or `{ text }`.
   */
  options?: Record<string, unknown>;
}

/** Rows held in the page. */
export interface DashboardRowsSource {
  /** Rows held in the page. */
  kind: 'rows';
  /** The rows. */
  rows: unknown[];
  /** The grid columns; one per key of the first rows when omitted. */
  columns?: unknown[];
  /** The row identity every grid over this source is given. */
  rowKey?: unknown;
}

/** A pushdown adapter: the rows stay in the engine. */
export interface DashboardPushdownSource {
  /** A pushdown adapter: the rows stay in the engine. */
  kind: 'pushdown';
  /** The adapter, handed to `createPushdownSource` with every key but `kind`, `columns` and `rowKey`. */
  adapter: { execute: (...args: unknown[]) => unknown; [key: string]: unknown };
  /** The grid columns. */
  columns?: unknown[];
  /** The row identity every grid over this source is given. */
  rowKey?: unknown;
  /** Any other `createPushdownSource` option (`pageSize`, `aggregates`, …). */
  [option: string]: unknown;
}

/** A Data Router route: each grid reading it is attached with `router.attach(grid, predicate, route)`. */
export interface DashboardRouterSource {
  /** A Data Router route. */
  kind: 'router';
  /** The router. Load it after the dashboard is built: a route sees what arrives after it is attached. */
  router: { attach: (...args: unknown[]) => unknown; [key: string]: unknown };
  /** The partition value or predicate the route matches. */
  predicate: unknown;
  /** The route's options (`transform`, `rollup`, …). */
  route?: Record<string, unknown>;
  /** The grid columns. */
  columns?: unknown[];
  /** The row identity every grid over this source is given. */
  rowKey?: unknown;
}

/** Another panel's grid, as `grid:<panel id>` does inline. */
export interface DashboardGridSource {
  /** Another panel's grid. */
  kind: 'grid';
  /** The grid panel whose grid is viewed. */
  of: string;
}

/** A named source. */
export type DashboardSource = DashboardRowsSource | DashboardPushdownSource | DashboardRouterSource | DashboardGridSource;

/**
 * A link: the rows selected in the `from` grid panel filter the `to` panel.
 * Over one Data Router it is a `router.relate()` edge; otherwise a named
 * `filters.where()` predicate on the target's grid. Two pushdown sources with
 * no router between them, or two routers, are refused by name.
 */
export interface DashboardLink {
  /** The grid panel whose selection drives the link. */
  from: string;
  /** The panel it filters. */
  to: string;
  /**
   * The relation: a column both sides share, `{ from, to }` naming each side's
   * column, or (over one router) the router's own relation function.
   */
  on: string | { from: string; to: string } | ((selected: Array<Record<string, unknown>>) => (row: Record<string, unknown>) => boolean);
}

/** Something the dashboard refused or reported, by catalogued id. */
export interface DashboardProblem {
  /** The catalogued warning id: `dashboard:panel:<id>`, `dashboard:link:<from>-><to>`, `dashboard:spec:<path>`, … */
  id: string;
  /** Where in the spec, e.g. `panels[2].kind`. */
  path: string;
  /** What happened. */
  message: string;
}

/**
 * The third argument of {@link createDashboard}: the factories the dashboard
 * builds with, and the AI callback. A factory not given here is looked up on
 * its script-tag global (`LatticeGrid`, `LatticeGridLayout`,
 * `LatticeGridKPI`, `LatticeGridLeaflet`, `LatticeGridDeck`); a panel whose
 * factory is on neither is refused by name.
 */
export interface DashboardOptions {
  /** The grid's `createGrid`, for `grid` panels. */
  createGrid?: (el: HTMLElement, config: Record<string, unknown>) => Grid;
  /** The grid's `createHeadlessGrid`, which holds a chart's, KPI panel's or map's source. */
  createHeadlessGrid?: (config: Record<string, unknown>) => Grid;
  /** The grid's `createPushdownSource`, for `pushdown` sources. */
  createPushdownSource?: (config: Record<string, unknown>) => unknown;
  /** The charts module's `createChart`, for `chart` panels and map charts. */
  createChart?: (spec: Record<string, unknown>) => unknown;
  /** The layout module's `createLayout`. Without it nothing is built. */
  createLayout?: (el: HTMLElement, config: Record<string, unknown>) => unknown;
  /** The KPI module's `createKPI`, for `kpi` panels. */
  createKPI?: (el: HTMLElement, config: Record<string, unknown>) => unknown;
  /** The calendar module's `createCalendar`, for `calendar` panels. */
  createCalendar?: (el: HTMLElement, config: Record<string, unknown>) => unknown;
  /** The Leaflet module's `bindLeaflet`, for `map` panels with `binding: 'leaflet'`. */
  bindLeaflet?: (grid: Grid, options: Record<string, unknown>) => unknown;
  /** The deck.gl module's `bindDeck`, for `map` panels with `binding: 'deckgl'`. */
  bindDeck?: (grid: Grid, options: Record<string, unknown>) => unknown;
  /**
   * The AI callback `propose()` asks: the same `ask(payload)` `createAI` takes
   * (or `{ ask }`). Without it `propose()` declines by name.
   */
  ai?: ((payload: Record<string, unknown>) => Promise<unknown>) | { ask: (payload: Record<string, unknown>) => Promise<unknown> };
}

/** One built panel. */
export interface DashboardPanelHandle {
  /** The panel id. */
  id: string;
  /** Its kind. */
  kind: DashboardPanelKind;
  /** The element its viewer was mounted in, inside its window. */
  el: HTMLElement;
  /** The grid it reads (a grid panel's own), or null. */
  grid: Grid | null;
  /** What its factory returned: the grid, chart, KPI panel or binding; null for html. */
  viewer: unknown;
}

/** What {@link Dashboard.propose} resolves to. */
export interface DashboardProposal {
  /** The checked spec to accept with `apply(spec)`, or null when nothing usable came back. */
  spec: DashboardSpec | null;
  /** Everything dropped or refused, one line each. */
  warnings: string[];
}

/** A saved dashboard view: the spec, each grid panel's state and each calendar's. */
export interface DashboardView {
  /** The view's id. */
  id: string;
  /** Its name. */
  name: string;
  /** The dashboard spec, placements included. */
  spec: DashboardSpec;
  /** Each grid panel's `grid.state.get()`, by panel id. */
  grids: Record<string, GridState>;
  /** Each calendar panel's `viewer.getState()`, by panel id — a separate slot, per CONTRACTS §10.5. */
  calendars: Record<string, object>;
}

/** A built dashboard. */
export interface Dashboard {
  /** The element it is mounted on. */
  readonly el: HTMLElement;
  /** The layout the panels sit in, or null when nothing was built. */
  readonly layout: unknown;
  /** The panel a presentation shows, or null. */
  readonly presenting: string | null;
  /**
   * The dashboard as built — its panels, the sources by id, the links that
   * were made and each window's live placement — as a spec that rebuilds it.
   */
  spec(): DashboardSpec;
  /**
   * Tear down and build this spec in its place: how a host accepts a
   * proposal or restores a stored spec. Returns what was refused.
   */
  apply(spec: DashboardSpec): DashboardProblem[];
  /** The built panels' ids, in spec order. */
  panels(): string[];
  /** One built panel, or null. */
  panel(id: string): DashboardPanelHandle | null;
  /** Everything the last build refused or reported. */
  problems(): DashboardProblem[];
  /**
   * Ask the AI callback for a spec over one source's columns. The model sees
   * the column names and types and the panel kinds this page can draw — rows
   * only with `rows: true` (at most `maxRows`, default 50). A panel naming a
   * column the source lacks, a kind the page cannot draw or another source is
   * dropped with a warning. Nothing is built: accept with `apply(spec)`.
   * Without an AI callback it declines by name.
   */
  propose(prompt: string, request: { source: string; rows?: boolean; maxRows?: number; signal?: AbortSignal }): Promise<DashboardProposal>;
  /** Save the spec and every grid panel's state as one named view; a name already saved is replaced. */
  saveView(name: string): DashboardView | null;
  /** The saved views, in the order first saved. */
  views(): DashboardView[];
  /** Restore a view by id, or one the host stored: the layout and every grid's state. */
  applyView(view: string | DashboardView): boolean;
  /** Present the panels one at a time, each filling the dashboard (the layout's maximise). */
  present(options?: { panels?: string[]; from?: number }): boolean;
  /** Move the presentation by this many panels, clamped; the position shown, or -1. */
  step(by?: number): number;
  /** End the presentation and put the dashboard back. */
  stopPresenting(): boolean;
  /** Tear everything down: links, viewers, grids, router attachments and the layout. */
  destroy(): void;
}

/**
 * Build a dashboard from a spec. Everything the spec's problems do not touch
 * is built; each refusal is reported by name (`dashboard.problems()`).
 */
export function createDashboard(el: HTMLElement, spec: DashboardSpec, options?: DashboardOptions): Dashboard;
/** Check a spec without building it: every problem, by path. */
export function validateDashboardSpec(spec: unknown): { ok: boolean; problems: Array<{ path: string; message: string }> };
export default createDashboard;
