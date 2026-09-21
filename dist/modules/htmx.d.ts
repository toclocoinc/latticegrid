/*!
 * Lattice Grid 1.68.0, htmx module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  AR,
  AR_SA,
  CS_CZ,
  Column,
  DA_DK,
  DEFAULT_LOCALE,
  DE_DE,
  EL_GR,
  EN_GB,
  EN_US,
  ES_ES,
  FI_FI,
  FR_CA,
  FR_FR,
  Grid,
  GridConfig,
  HU_HU,
  IT_IT,
  JA_JP,
  LOCALES,
  MESSAGE_KEYS,
  MISSING_RATE,
  Messages,
  NB_NO,
  NL_NL,
  NO_CAPABILITIES,
  PL_PL,
  PT_BR,
  RO_RO,
  Registry,
  SV_SE,
  UK_UA,
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
  registerModules,
  registerUnitSystem,
  resolveCatalogue,
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
export function serialiseState(grid: Grid): string;
export function restoreState(grid: Grid, state: string): void;
export function saveStateWithin(root: ParentNode): void;
export function restoreStateWithin(root: ParentNode): void;
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
  Messages, createMessages, auditCatalogue,
  EN_GB, MESSAGE_KEYS, DEFAULT_LOCALE, formatList, resolveLocale, LOCALES, resolveCatalogue,
  EN_US, FR_FR, FR_CA, IT_IT, ES_ES, PT_BR, DE_DE, NL_NL, SV_SE, DA_DK, NB_NO, FI_FI,
  PL_PL, CS_CZ, HU_HU, RO_RO, UK_UA, EL_GR, JA_JP, AR, AR_SA,
  Window, openWindow, WINDOW_KINDS,
  evaluateFormula, referencesOf, looksLikeFormula, compileRules, ingest, ingestSync,
  createPushdownSource, planQuery, splitFilters, applyResidual, capabilitiesOf, resolveMutate, NO_CAPABILITIES,
  odataAdapter, restAdapter, dfqlAdapter, duckdbAdapter,
  createStat, deltaOf, toneOf,
} from '../lattice-grid.js';
// American licence aliases mirror the base package (dom/index.js).
export { setLicence as setLicense, licenceInfo as licenseInfo, licenceState as licenseState } from '../lattice-grid.js';
