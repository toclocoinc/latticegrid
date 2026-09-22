/*!
 * Lattice Grid 1.68.1, webcomponent module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Column,
  Grid,
  GridConfig,
  Row,
  createCurrencyType,
  createGrid,
  createStat,
  createUnitType,
  registerUnitSystem,
} from '../lattice-grid.js';

/**
 * Register `<lattice-grid>`.
 *
 * This module carries the grid inside it. Use it *or* `createGrid` in one
 * page, never both: two copies keep separate registries, and a renderer
 * registered through one will not appear in the other.
 *
 * The live grid is reached through the element's `grid` getter: `el.grid` is
 * the same `Grid` the vanilla `createGrid` returns, or null while the element
 * is disconnected.
 */
export function defineLatticeGrid(tag?: string): void;
/**
 * Build the `<lattice-grid>` element class. The one argument is the grid
 * factory the element creates its grid with — `createGrid`-shaped, and
 * defaulting to it — injectable for tests. Returns the class, or `null`
 * where `HTMLElement` is undefined (a Node import, a server-side pass).
 */
export function createLatticeGridElement(
  factory?: (element: Element, config: GridConfig) => Grid,
): typeof HTMLElement | null;
export const TAG_NAME: string;
export const EVENT_PREFIX: string;
export const ATTRIBUTE_CONFIG: Readonly<Record<string, unknown>>;
export function observedAttributeNames(): string[];
export function domEventName(event: string): string;
export class GridElementController {}
// Core factories re-exported from this module so they bind to the one engine
// the element already carries: a type built with these here shares the
// element's registry rather than a second copy's. Typed by
// reference to the base package.
export { createCurrencyType, createUnitType, registerUnitSystem, createStat } from '../lattice-grid.js';

/* ---------------------------------------------------------------- */
/* v2: one element per viewer                      */
/* ---------------------------------------------------------------- */

/** The `detail` of `grid-ready` and `grid-destroyed` on `<lattice-grid>`. */
export interface LatticeGridEventDetail { grid: Grid }

/** The `detail` of `ready` and `destroyed` on every viewer element. */
export interface LatticeViewerEventDetail<Instance = unknown> { instance: Instance }

/**
 * `<lattice-grid>`.
 *
 * Structures are properties, scalars are the attributes in the table above,
 * and `config` merges anything without an attribute of its own. Instance
 * events arrive as `CustomEvent`s named `lattice-` plus the event name with
 * colons hyphenated; `grid-ready` and `grid-destroyed` are this adapter's own
 * and carry {@link LatticeGridEventDetail}.
 */
export interface LatticeGridElement<Row = any> extends HTMLElement {
  /** Every attribute in the table above is also a property of the same name. */
  theme: string | undefined;
  /**
   * The row height and padding as a named step, rather than pixel by pixel. The `density`
   * attribute.
   */
  density: string | undefined;
  /** The locale the grid formats and sorts in. The `locale` attribute. */
  locale: string | undefined;
  /**
   * Which field identifies a row. As an attribute it can only be a field name; the
   * composite and function forms are properties.
   */
  rowKey: string | undefined;
  /** Row height in pixels. The `row-height` attribute, parsed as a number. */
  rowHeight: number | undefined;
  /**
   * Header height in pixels. The `header-height` attribute, parsed as a number; unset,
   * the header follows the density token.
   */
  headerHeight: number | undefined;
  /**
   * Let the grid grow to its rows rather than capping its height. The `auto-height`
   * attribute is a bare boolean — present is true.
   */
  autoHeight: boolean | undefined;
  /**
   * What the reader may select: `single`, `multiple` or `none`. The `selection`
   * attribute; the full selection config goes through `config`.
   */
  selection: string | undefined;
  /** The live grid, or null while the element is disconnected. */
  readonly grid: Grid | null;
  /** The live grid, under the name every viewer element uses. */
  readonly instance: Grid | null;
  /** The row data. */
  rows: Row[];
  /** The column definitions. */
  columns: Column[];
  /** Any configuration without an attribute of its own; merged, not replaced. */
  config: GridConfig;
  /**
   * Named row predicates, registered through `grid.filters.where` — they
   * compose with whatever filter the reader has set, unlike `filters`.
   */
  predicates: Record<string, ((row: Row) => boolean) | null> | undefined;
  /** A keyed diff applied straight to `grid.rows.apply()`. */
  rowUpdates: { add?: Row[]; update?: Row[]; remove?: unknown[] } | undefined;
}

/** What every viewer element carries. */
export interface LatticeViewerElement<Instance = unknown> extends HTMLElement {
  /**
   * The live viewer, or null before it is built.
   *
   * Every configuration key below is also a property, and an attribute of the
   * same name is the same key. A key none of these interfaces declares works
   * as a property too — the element adopts it — but is written through
   * `config` where the declarations are the contract.
   */
  readonly instance: Instance | null;
  /** The grid this viewer is built against, when it is given one directly. */
  grid: unknown;
  /** Which published grid to bind to; the `grid-name` attribute in markup. */
  gridName: string | undefined;
  /** Any configuration without a property of its own; merged, not replaced. */
  config: Record<string, unknown>;
}

/**
 * `<lattice-kpi>`.
 *
 * Grid-bound by default, and it **waits** for its grid rather than mounting
 * empty; give it `rows` for a standalone panel.
 */
export interface LatticeKPIElement<Row = any> extends LatticeViewerElement {
  /** The panel's tiles. A structure, so it is a property rather than an attribute. */
  tiles: unknown[];
  /** Rows for a standalone panel. Set them and the element stops waiting for a grid. */
  rows: Row[];
  /** How many tile columns to aim for. */
  columns: number | undefined;
  /** Which field identifies a row, for the panel's own keyed store. */
  rowKey: string | undefined;
  /** The default locale a clock tile formats in. */
  locale: string | undefined;
  /**
   * Passed to the panel as `theme`, which the panel does not read — it mirrors the
   * theme of the grid it is mounted beside, and otherwise follows the page's tokens.
   */
  theme: string | undefined;
  /**
   * Passed to the panel as `density`, which the panel does not read — density is
   * mirrored from the grid the panel belongs to.
   */
  density: string | undefined;
  /**
   * Passed to the panel as `format`, which the panel does not read — formatting is
   * per tile (`tiles: [{ format }]`).
   */
  format: unknown;
}

/** `<lattice-chart>`. Always drawn from a grid, so it waits for one. */
export interface LatticeChartElement extends LatticeViewerElement {
  /**
   * A geomap's geometry: a loaded pack, `{ pack: id }`, GeoJSON, or a map of code to path
   * data. A structure, so it is a property.
   */
  shapes: unknown;
  /** The column that splits the measure into one series per distinct value. */
  series: unknown;
  /**
   * Passed to the chart as `data`, which the chart does not read — a chart draws the
   * grid's own filtered rows. Use the grid's rows, or the chart spec's `rows`, through
   * `config`.
   */
  data: unknown;
  /**
   * Passed to the chart as `formatting`, which the chart does not read — a chart formats
   * through the grid's own formatting and each column's type.
   */
  formatting: unknown;
  /** Which chart to draw. The `type` attribute. */
  type: string | undefined;
  /** The category column. */
  x: string | undefined;
  /** The measure column, or several for a multi-measure chart. */
  y: string | string[] | undefined;
  /** The measure a markermap writes beside each dot and colours it by. */
  value: string | undefined;
  /** The row-label column, for the types that name their rows. */
  label: string | undefined;
  /** The longitude column, in degrees east, for the maps that place a row by where it is. */
  lon: string | undefined;
  /** The latitude column, in degrees north. */
  lat: string | undefined;
  /** Print the value beside each mark. The `labels` attribute is a bare boolean. */
  labels: boolean | undefined;
  /**
   * Passed to the chart as `stacked`, which the chart does not read — its own option is
   * `stack`, reachable through `config`.
   */
  stacked: boolean | undefined;
  /**
   * Passed to the chart as `horizontal`, which the chart does not read — orientation
   * follows the chart type (`horizontalBar` and the row-named types draw along y).
   */
  horizontal: boolean | undefined;
  /** The colour scheme by name. */
  scheme: string | undefined;
}

/** `<lattice-kanban>`. Grid-bound like the KPI panel; give it `rows` to stand alone. */
export interface LatticeKanbanElement<Row = any> extends LatticeViewerElement {
  /** Rows for a standalone board. Set them and the element stops waiting for a grid. */
  rows: Row[];
  /** The board's column definitions. */
  columns: unknown[];
  /** The card template's field mapping — title, subtitle, labels, assignee and the rest. */
  card: unknown;
  /**
   * Passed to the board as `facets`, which the board does not read — filter it with
   * `filter`, `quickFilter`, `setSprint` or `setEpic` instead.
   */
  facets: unknown;
  /** Which field identifies a card. */
  rowKey: string | undefined;
  /** The row property that puts a card in a column. */
  columnProperty: string | undefined;
  /**
   * Passed to the board as `titleProperty`, which the board does not read — map the
   * card's headline through `card` (`card: { title: 'name' }`).
   */
  titleProperty: string | undefined;
  /**
   * Draw the two-dimensional swimlane layout. The `swimlanes` attribute is a bare
   * boolean; name the lane property through `swimlane-property`.
   */
  swimlanes: boolean | undefined;
}

/** `<lattice-gantt>`. */
export interface LatticeGanttElement extends LatticeViewerElement {
  /** The plan's tasks. A structure, so it is a property. */
  tasks: unknown[];
  /** The links between tasks. */
  dependencies: unknown[];
  /** The resource capacities, for over-allocation and levelling. */
  resources: unknown;
  /** The working-time calendar: the `weekends` preset, or explicit workdays and holidays. */
  calendar: unknown;
  /** The table panel's columns, for the split view. */
  columns: unknown;
  /** Which field identifies a task. */
  rowKey: string | undefined;
  /**
   * Passed to the plan as `scale`, which it does not read — the timeline's zoom is a
   * render option, set through `config: { render: { zoom } }`.
   */
  scale: string | undefined;
  /**
   * Cascade an edit down the dependency chain rather than only recomputing. A bare
   * boolean attribute.
   */
  autoSchedule: boolean | undefined;
}

/** `<lattice-layout>`. */
export interface LatticeLayoutElement extends LatticeViewerElement {
  /**
   * The windows to place, each with its content and its cell. A structure, so it is a
   * property.
   */
  windows: unknown[];
  /** How many columns the grid of windows has. */
  columns: number | undefined;
  /** How many rows the grid of windows has. */
  rows: number | undefined;
  /** Which way windows collapse into the space a closed one left. */
  compact: string | undefined;
}

/**
 * `<lattice-tabs>`. A tab's content is a `<template data-tab="‹id›">` child,
 * cloned into the panel the module creates for it; a tab with no template is
 * left to the module.
 */
export interface LatticeTabsElement extends LatticeViewerElement {
  /**
   * The tab descriptors. A tab's content comes from a `<template data-tab="‹id›">` child
   * when there is one.
   */
  tabs: unknown[];
}

/**
 * `<lattice-router>`. Owns a Data Router for the life of the element, built
 * by the first `<lattice-grid route="…">` beneath it.
 */
export interface LatticeRouterElement extends HTMLElement {
  /** The live router, or null until something routes. */
  readonly router: unknown;
  /** The live router, under the name every viewer element uses. */
  readonly instance: unknown;
  /** The router configuration; read once, when the router is built. */
  config: Record<string, unknown>;
}

/** The tag each viewer is registered under, before the prefix is applied. */
export const ELEMENT_TAGS: Readonly<Record<string, string>>;

/**
 * Build the element classes for whichever Lattice factories are supplied.
 * Nothing is imported by this module, so a page that draws no charts never
 * loads the charts bundle. Returns an empty object where there is no DOM.
 */
export function createLatticeElements(deps?: {
  createGrid?: Function;
  createKPI?: Function;
  createChart?: Function;
  createKanban?: Function;
  createGantt?: Function;
  createLayout?: Function;
  createTabs?: Function;
  createDataRouter?: Function;
}): Record<string, CustomElementConstructor>;

/**
 * Register every element the supplied factories can build, under `prefix`
 * (`lattice-` by default). Safe to call twice: an already-registered tag is
 * handed back rather than re-defined. Returns tag name → class.
 */
export function defineLatticeElements(opts?: {
  prefix?: string;
  createGrid?: Function;
  createKPI?: Function;
  createChart?: Function;
  createKanban?: Function;
  createGantt?: Function;
  createLayout?: Function;
  createTabs?: Function;
  createDataRouter?: Function;
}): Record<string, CustomElementConstructor>;

/** Build the `<lattice-kpi>` class without registering it. */
export function createLatticeKPIElement(deps: { createKPI: Function }): CustomElementConstructor | null;
/** Build the `<lattice-chart>` class without registering it. */
export function createLatticeChartElement(deps: { createChart: Function }): CustomElementConstructor | null;
/** Build the `<lattice-kanban>` class without registering it. */
export function createLatticeKanbanElement(deps: { createKanban: Function }): CustomElementConstructor | null;
/** Build the `<lattice-gantt>` class without registering it. */
export function createLatticeGanttElement(deps: { createGantt: Function }): CustomElementConstructor | null;
/** Build the `<lattice-layout>` class without registering it. */
export function createLatticeLayoutElement(deps: { createLayout: Function }): CustomElementConstructor | null;
/** Build the `<lattice-tabs>` class without registering it. */
export function createLatticeTabsElement(deps: { createTabs: Function; createGrid?: Function }): CustomElementConstructor | null;
/** Build the `<lattice-router>` class without registering it. */
export function createLatticeRouterElement(deps: { createDataRouter: Function }): CustomElementConstructor | null;

/**
 * Make a shadow root see Lattice's styles, and keep it seeing them.
 *
 * The theme, each module's injected sheet and the grid's *growing* generated
 * sheet are mirrored into the root as constructable stylesheets and kept
 * level with their sources. A sheet that cannot be read as text — a
 * cross-origin `<link>`, or one carrying `@import` — is cloned into the root
 * instead. Idempotent per root; the returned function undoes exactly this
 * call. Every element here calls it for itself on connect, so this is for a
 * host that mounts Lattice inside its own shadow root by other means.
 */
export function adoptLatticeStyles(root: ShadowRoot | Document, opts?: { document?: Document }): () => void;

/**
 * Lattice's stylesheets as constructed `CSSStyleSheet`s, for a host that
 * manages its own `adoptedStyleSheets`. Shared and live — do not mutate
 * them. Empty where the platform has no constructable stylesheets.
 */
export function latticeStyleSheets(opts?: { document?: Document }): CSSStyleSheet[];

export default defineLatticeGrid;
