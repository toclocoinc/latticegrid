/*!
 * Lattice Grid 1.94.0, htmx module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Column,
  DEFAULT_LOCALE,
  EN_GB,
  Grid,
  GridConfig,
  MESSAGE_KEYS,
  MISSING_RATE,
  Messages,
  NO_CAPABILITIES,
  Registry,
  StateApplyReport,
  StateSection,
  UNIT_SYSTEMS,
  WINDOW_KINDS,
  Window,
  applyResidual,
  auditCatalogue,
  capabilitiesOf,
  compileRules,
  convertMoney,
  createCurrencyType,
  createHeadlessGrid,
  createMessages,
  createPushdownSource,
  createRadixType,
  createStat,
  createUnitType,
  defineUnit,
  deltaOf,
  dfqlAdapter,
  duckdbAdapter,
  evaluateFormula,
  formatList,
  formatMoney,
  formatUnit,
  getVersion,
  ingest,
  ingestSync,
  licenceInfo,
  licenceState,
  licenseInfo,
  licenseState,
  looksLikeFormula,
  odataAdapter,
  openWindow,
  parseMoney,
  parseUnit,
  planQuery,
  rateFunction,
  referencesOf,
  registerLocale,
  registerModules,
  registerUnitSystem,
  resolveLocale,
  resolveMutate,
  restAdapter,
  setLicence,
  setLicense,
  splitFilters,
  toneOf,
  version,
} from '../lattice-grid.js';

/**
 * The htmx integration, which re-exports the base API alongside its own,
 * a page using it imports this and never the base package as well.
 */
export function createGrid(element: Element, config: GridConfig): Grid;
export function autoInit(root?: ParentNode): Grid[];
/**
 * The bubbling DOM event re-raised on a declarative grid's host for each
 * committed edit — `lattice:grid-change`, with
 * `{ key, field, oldValue, newValue }` in `detail` — so
 * `hx-trigger="lattice:grid-change"` can POST it. Nothing fires for a
 * programmatic `setRows`/`rows.apply` (those announce `rows:changed`).
 */
export const GRID_CHANGE_EVENT: string;
/**
 * Build a calendar on every uninitialised `[data-lattice-calendar]` element
 * under `root`, bound to the grid named by its
 * `data-lattice-bind` attribute or a `grid: "<id>"` config string — the
 * calendar twin of {@link autoInit}. Row source precedence is bind, then a
 * server-rendered `<table>` inside the element, then the
 * config's own JSON rows. Idempotent: an element already carrying
 * `.__latticeCalendar` is skipped. The calendar engine ships in the htmx
 * bundle; {@link registerCalendar} may override the factory.
 */
export function autoInitCalendar(root?: ParentNode): unknown[];
/** The marker attribute `autoInitCalendar` scans for: `data-lattice-calendar`. */
export const CALENDAR_ATTR: string;
/**
 * Register a calendar factory that overrides the bundled default. Optional:
 * when not called, the adapter builds with the `createCalendar` inlined into
 * the htmx bundle; when called, the registered factory wins.
 */
export function registerCalendar(factory: Function): void;
/**
 * The bubbling DOM event re-raised on a declarative calendar's host for each
 * move or resize — `lattice:calendar-change`, with `{ id, start, end }` in
 * `detail` (the event id and the new start/end as ISO strings) — so
 * `hx-trigger="lattice:calendar-change"` can POST it.
 */
export const CALENDAR_CHANGE_EVENT: string;
/**
 * Destroy every calendar within an element htmx is about to detach, so the
 * calendar releases its subscriptions to any bound grid before the grid
 * cleanup pass destroys it.
 */
export function destroyCalendarWithin(root: ParentNode): number;
/** Write every live calendar's view state into `data-lattice-calendar-state` and swap its original table back in. */
export function saveCalendarStateWithin(root: ParentNode): number;
/** Rebuild calendars onto a restored subtree and reapply their saved view state. */
export function restoreCalendarStateWithin(root: ParentNode, scan?: Function): number;
/** Undo the table swaps `saveCalendarStateWithin` queued (called a microtask after history save). */
export function restoreSwappedCalendars(): void;
/** Wire document-level `data-lattice-row` out-of-band event updates for calendars. */
export function driveCalendarOobUpdates(opts?: { doc?: Document }): () => void;
/**
 * Build a Gantt on every uninitialised `[data-lattice-gantt]` element under
 * `root`, mounted over the server-rendered `<table>` that
 * element wraps — one `<tr>` per task, one `<th data-field>` per task field.
 * The Gantt twin of {@link autoInit} and {@link autoInitCalendar}: idempotent
 * (an element already carrying `.__latticeGantt` is skipped), and the factory
 * is resolved from {@link registerGantt} / the script-tag global rather than
 * inlined into the htmx bundle, so a page with htmx and no Gantt pays nothing.
 */
export function autoInitGantt(root?: ParentNode): unknown[];
/** The marker attribute `autoInitGantt` scans for: `data-lattice-gantt`. */
export const GANTT_ATTR: string;
/**
 * The bubbling DOM event re-raised on the host for every committed change —
 * `lattice:gantt-change`, with `{ kind, id, task, changes }` in `detail`.
 */
export const GANTT_CHANGE_EVENT: string;
/**
 * The bubbling DOM event re-raised on the host once per user gesture or API
 * transaction — `lattice:gantt-commit`, with
 * `{ cause, primary: { id, kind }, changes: [{ id, kind, task, changes }] }`
 * in `detail` (`primary` the task the gesture acted on) — so
 * `hx-trigger="lattice:gantt-commit"` posts the whole edit in one request
 * instead of a burst of `lattice:gantt-change` events.
 */
export const GANTT_COMMIT_EVENT: string;
/**
 * Register the Gantt factory the adapter builds with. The page's own Gantt
 * module calls this once on load; a page loading both may instead rely on the
 * script-tag global (`globalThis.LatticeGridGantt.createGantt`).
 */
export function registerGantt(factory: Function): void;
/**
 * Destroy every Gantt within an element htmx is about to detach. Runs before
 * the grid cleanup pass so a Gantt's inner task-table grid is released by the
 * Gantt itself, never left half-alive.
 */
export function destroyGanttWithin(root: ParentNode): number;
/** Write every live Gantt's view state into `data-lattice-gantt-state` and swap its original table back in. */
export function saveGanttStateWithin(root: ParentNode): number;
/** Rebuild Gantts onto a restored subtree and reapply their saved view state. */
export function restoreGanttStateWithin(root: ParentNode, scan?: Function): number;
/** Undo the table swaps `saveGanttStateWithin` queued (called a microtask after history save). */
export function restoreSwappedGantts(): void;
/** Wire document-level `data-lattice-row` out-of-band task updates for Gantts. */
export function driveGanttOobUpdates(opts?: { doc?: Document }): () => void;
/**
 * Build a Designer on every uninitialised `[data-lattice-designer]` element
 * under `root`, from its config — the mode, saved state and
 * guardrails — with live data read from the grid named by its
 * `data-lattice-bind` attribute or a `grid: "<id>"` config string (renamed by
 * `source: "<id>"`). Idempotent: an element already carrying
 * `.__latticeDesigner` is skipped. The factory is resolved from
 * {@link registerDesigner} / the script-tag global rather than inlined into
 * the htmx bundle, so a page with htmx and no Designer pays nothing.
 */
export function autoInitDesigner(root?: ParentNode): unknown[];
/** The marker attribute `autoInitDesigner` scans for: `data-lattice-designer`. */
export const DESIGNER_ATTR: string;
/**
 * The bubbling DOM event re-raised on the host for every author change —
 * `lattice:designer-change`, with `{ state, cause }` in `detail`.
 */
export const DESIGNER_CHANGE_EVENT: string;
/**
 * Register the Designer factory the adapter builds with. The page's own
 * Designer module calls this once on load; a page loading both may instead
 * rely on the script-tag global (`globalThis.LatticeGridDesigner.createDesigner`).
 */
export function registerDesigner(factory: Function): void;
/**
 * Destroy every Designer within an element htmx is about to detach. Runs
 * before the grid cleanup pass so a Designer's inner widget grids are
 * released by the Designer itself, never left half-alive.
 */
export function destroyDesignerWithin(root: ParentNode): number;
/** Write every live Designer's state into `data-lattice-designer-state` and swap its rendered DOM out. */
export function saveDesignerStateWithin(root: ParentNode): number;
/** Rebuild Designers onto a restored subtree and reapply their saved state. */
export function restoreDesignerStateWithin(root: ParentNode, scan?: Function): number;
/** Undo the DOM swaps `saveDesignerStateWithin` queued (called a microtask after history save). */
export function restoreSwappedDesigners(): void;
/**
 * Build a map on every uninitialised `[data-lattice-map]` element under
 * `root`, bound to the grid named by its
 * `data-lattice-bind` attribute or a `grid: "<id>"` config string. The
 * config's `type` selects the viewer — `"mapview"` (the default), a chart
 * type such as `"markermap"`/`"bubblemap"`/`"choropleth"`, or `"leaflet"` /
 * `"deck"` for the matching adapter when the page has loaded it. Idempotent:
 * an element already carrying `.__latticeMap` is skipped, and the built
 * viewer is published there, wrapped with `rebind(grid)` where it lacks one.
 */
export function autoInitMap(root?: ParentNode): unknown[];
/** The marker attribute `autoInitMap` scans for: `data-lattice-map`. */
export const MAP_ATTR: string;
/**
 * Register the map factories the adapter builds with, by viewer kind
 * (`mapview`, `chart`, `leaflet`, `deck`). The page's own modules call this
 * once on load; a page loading them as script tags may instead rely on the
 * globals (`globalThis.LatticeGridMapView.createMapView`, and so on).
 */
export function registerMapFactories(factories: {
  mapview?: Function; chart?: Function; leaflet?: Function; deck?: Function;
}): void;
/**
 * Destroy every map within an element htmx is about to detach, releasing tile
 * layers, observers and listeners. Runs before the grid cleanup pass so a
 * map's own grid subscriptions are released by the viewer itself.
 */
export function destroyMapWithin(root: ParentNode): number;
/** Write every live map's view state (centre, zoom, selected layer) into `data-lattice-map-state`. */
export function saveMapStateWithin(root: ParentNode): number;
/** Rebuild maps onto a restored subtree and reapply their saved view state. */
export function restoreMapStateWithin(root: ParentNode, scan?: Function): number;
/**
 * Build a Kanban board on every uninitialised `[data-lattice-kanban]` element
 * under `root`, bound to the grid named by its
 * `data-lattice-bind` attribute or a `grid: "<id>"` config string — the board
 * twin of {@link autoInitCalendar}. Idempotent: an element already carrying
 * `.__latticeKanban` is skipped, and the factory is resolved from
 * {@link registerKanban} / the script-tag global rather than inlined into the
 * htmx bundle, so a page with htmx and no board pays nothing.
 */
export function autoInitKanban(root?: ParentNode): unknown[];
/** The marker attribute `autoInitKanban` scans for: `data-lattice-kanban`. */
export const KANBAN_ATTR: string;
/**
 * Register the board factory the adapter builds with. The page's own Kanban
 * module calls this once on load; a page loading both may instead rely on the
 * script-tag global (`globalThis.LatticeGridKanban.createKanban`).
 */
export function registerKanban(factory: Function): void;
/**
 * Destroy every board within an element htmx is about to detach, so the board
 * releases its subscriptions to any bound grid before the grid cleanup pass
 * destroys it.
 */
export function destroyKanbanWithin(root: ParentNode): number;
/** Write every live board's view state into `data-lattice-kanban-state` for htmx's history snapshot. */
export function saveKanbanStateWithin(root: ParentNode): number;
/** Rebuild boards onto a restored subtree and reapply their saved view state. */
export function restoreKanbanStateWithin(root: ParentNode, scan?: Function): number;
/** Undo the table swaps `saveKanbanStateWithin` queued (called a microtask after history save). */
export function restoreSwappedKanbans(): void;
/** Wire document-level `data-lattice-row` out-of-band card updates for boards. */
export function driveKanbanOobUpdates(opts?: { doc?: Document }): () => void;
/**
 * Wire the htmx lifecycle events on a document: grids are built in each
 * swapped-in fragment, released before htmx detaches one, and their view
 * state carried across history navigation. Called once on import against
 * the global `document`; call it again only for another document. Returns
 * the function that removes every listener it installed.
 */
export function attach(doc?: Document): () => void;
export function initWithin(root: ParentNode): Grid[];
export function destroyWithin(root: ParentNode): void;
export function gridElementsWithin(root: ParentNode): Element[];
export function hydrateTable(table: Element, config?: GridConfig): Grid;
export function readTable(table: Element): { columns: Column[]; rows: unknown[] };
export function rowsFromFragment(fragment: ParentNode): unknown[];
export function rowsFromJson(text: string): unknown[];
/**
 * Parse a response into rows by its content type: JSON through
 * `rowsFromJson`, anything else through `rowsFromFragment` against the
 * columns given. The fragment arrives already parsed; this never touches
 * `DOMParser` or `innerHTML`. Returns the rows and, when the body carried
 * one, the total.
 */
export function ingestResponse(
  response: { contentType: string; text?: string; fragment?: ParentNode },
  columns: { field: string }[],
): { rows: unknown[]; total: number | undefined };
/**
 * Drive server-side sort and filter through htmx. `trigger` is the element
 * carrying the htmx request attributes (`hx-get`, `hx-target`,
 * `hx-trigger="lattice:query-changed"`); the grid's query parameters are
 * merged into that element's request and its response ingested. Returns the
 * function that detaches everything this attached.
 */
export function driveServerMode(
  grid: Grid,
  trigger: Element,
  opts?: { columns?: { field: string }[] },
): () => void;
/**
 * Load rows in chunks as the user nears the end of what is loaded.
 * `sentinelEl` is the element carrying `hx-get` and
 * `hx-trigger="revealed, lattice:scroll-near-end"`; `threshold` is how many
 * rows from the end counts as near (default 20). Returns the function that
 * detaches everything this attached.
 */
export function driveInfiniteScroll(
  grid: Grid,
  sentinelEl: Element,
  opts?: { columns?: { field: string }[]; threshold?: number },
): () => void;
export function driveOobUpdates(grid: Grid, opts?: object): () => void;
/** Re-exports the base package's {@link serialiseState} unchanged. */
export function serialiseState(grid: Grid): string;
/** Re-exports the base package's {@link restoreState} unchanged. */
export function restoreState(
  grid: Grid,
  encoded: string,
  opts?: { skip?: StateSection[] },
): StateApplyReport;
export function saveStateWithin(root: ParentNode): void;
export function restoreStateWithin(root: ParentNode): void;
/**
 * Re-point every viewer declared with `data-lattice-bind="<grid id>"` at the
 * live grid whose host element now carries that id, and
 * return how many it re-bound. Runs automatically on `htmx:load` after the
 * new grids are built; a page keeps one chart and one panel across a swap
 * instead of re-creating them.
 */
export function rebindViewersWithin(root: ParentNode): number;
export function queryParams(grid: Grid): Record<string, string>;
export function warnIfLargeHtmlPayload(rows: number): void;
export const QUERY_CHANGED_EVENT: string;
export const SCROLL_NEAR_END_EVENT: string;
export const HTML_ROW_WARNING_THRESHOLD: number;
// The core factory surface this module re-exports, so an htmx page builds its
// configured columns (a currency type, a unit type, a stat) from the one
// engine it already carries rather than a second copy.
// Typed by reference to the base package; names the base package leaves
// untyped stay untyped here too.
export {
  createHeadlessGrid, version, getVersion, Grid, Registry, registerModules,
  createRadixType, createUnitType, registerUnitSystem, defineUnit, UNIT_SYSTEMS, parseUnit, formatUnit,
  createCurrencyType, parseMoney, formatMoney, convertMoney, rateFunction, MISSING_RATE,
  Messages, createMessages, auditCatalogue, registerLocale,
  EN_GB, MESSAGE_KEYS, DEFAULT_LOCALE, formatList, resolveLocale,
  Window, openWindow, WINDOW_KINDS,
  evaluateFormula, referencesOf, looksLikeFormula, compileRules, ingest, ingestSync,
  createPushdownSource, planQuery, splitFilters, applyResidual, capabilitiesOf, resolveMutate, NO_CAPABILITIES,
  odataAdapter, restAdapter, dfqlAdapter, duckdbAdapter,
  createStat, deltaOf, toneOf,
} from '../lattice-grid.js';
// American licence aliases mirror the base package (dom/index.js).
export { setLicence as setLicense, licenceInfo as licenseInfo, licenceState as licenseState } from '../lattice-grid.js';
