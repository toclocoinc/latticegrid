/*!
 * Lattice Grid 1.60.0, tabs module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  createGrid,
  createHeadlessGrid,
} from '../lattice-grid.js';

/**
 * One tab: an id, a display label, a grid config, and — for a derived tab —
 * the parent tab id plus the narrowing forwarded onto the derived source
 * built for it (`source: { mode: 'derived', from: <parent's grid>, ... }`).
 * The derivation keys are the ones `packages/core/src/source/derive.js`
 * already understands; this module invents none of its own.
 */
interface TabDescriptor {
  /** A stable, unique id. Required. */
  id: string;
  /** The tab button's text. Defaults to `id`. */
  label?: string;
  /** The config for this tab's body: the grid config passed to `createGrid` (merged with the derived `source`, when `from` is set), or — with `view` — that viewer's own config. */
  config?: object;
  /**
   * Mount something other than a grid in this tab: the factory that builds
   * it, called as `(el, config) => instance`. `createKanban` and `createKPI`
   * have that signature already; a Gantt is adapted in a line
   * (`(el, config) => createGantt({ ...config, element: el })`). The factory
   * is injected rather than imported, exactly as `createGrid` is.
   *
   * A `view` tab derives from `from` exactly as a grid tab does: a headless
   * grid carries the derived source and its rows are piped into the viewer
   * through `rows.apply`, so deriving into one needs `createHeadlessGrid`
   * injected too.
   */
  view?: (el: HTMLElement, config: object) => unknown;
  /** The parent tab id to derive from. When set, `config.source` is built for you and any of your own is replaced (with a warning). */
  from?: string;
  /** Row predicate forwarded to the derived source. */
  where?: (row: unknown) => boolean;
  /** Group-by forwarded to the derived source. */
  group?: unknown;
  groupBy?: unknown;
  /** Time-bucketing forwarded to the derived source. */
  bucket?: unknown;
  /** Join spec forwarded to the derived source. */
  join?: unknown;
  /** Array-field unnesting forwarded to the derived source. */
  unnest?: unknown;
  /** `'live' | 'idle' | 'manual' | number` forwarded to the derived source. */
  refresh?: 'live' | 'idle' | 'manual' | number;
  /** Cross-filter wiring forwarded to the derived source. */
  crossFilter?: unknown;
  /** Which slice of the parent's rows to derive from: `'filtered' | 'all' | 'selected' | 'grouped'`. */
  follow?: 'filtered' | 'all' | 'selected' | 'grouped';
  /** Row limit forwarded to the derived source. */
  limit?: number;
  /** Sort forwarded to the derived source. */
  sort?: unknown;
  /** Statistical-profile derivation, forwarded to the derived source. */
  profile?: unknown;
  /** This tab's panel's own `aria-label`, when the label alone is not enough context. */
  ariaLabel?: string;
  /** A leading icon: a single character or emoji, or an element you built. Never a markup string — nothing here parses HTML. Decorative, so it is hidden from assistive technology. */
  icon?: string | HTMLElement;
  /** A count badge. `true` shows this tab's own live row count and follows it; a number or string is static; a function is given the live count and returns what to show (`null` hides it). Off when absent. */
  badge?: true | number | string | ((count: number | null, tab: { id: string; label: string; from: string | null }) => unknown);
  /** The badge's tone, declared by the host rather than derived from a threshold: `'good' | 'warn' | 'bad' | 'unknown'`, or a function of the live count returning one. */
  badgeTone?: 'good' | 'warn' | 'bad' | 'unknown' | ((count: number | null, tab: { id: string; label: string; from: string | null }) => 'good' | 'warn' | 'bad' | 'unknown' | null);
}

/** The payload every tab-change event carries. */
interface TabChangeEvent {
  id: string;
  previousId: string | null;
  origin?: 'api' | 'user' | 'init';
  reason?: string | null;
  /** Cancel the switch (only meaningful on `beforeTabChange`). */
  preventDefault?: (reason?: string) => void;
  defaultPrevented?: boolean;
}

/** Tabbed-grid configuration. */
interface TabsConfig {
  /** The grid factory to mount each tab with, e.g. `import { createGrid } from '../lattice-grid.js'`. Required. */
  createGrid: (el: HTMLElement, config: object) => unknown;
  /** The headless grid factory, injected the same way and for the same reason. Optional, and only needed for badges: with it, a tab that has never been activated still carries a live count, computed with no DOM. Without it, such a tab shows no badge until its first activation. */
  createHeadlessGrid?: (config: object) => unknown;
  /** The tabs, in display order. Required, at least one. */
  tabs: TabDescriptor[];
  /** The initially active tab id. Defaults to the first tab. */
  active?: string;
  /** The tablist landmark's accessible name. */
  ariaLabel?: string;
  /** An explicit message-catalogue override; otherwise a mounted tab's own `grid.messages` is used. */
  messages?: { t(key: string, params?: Record<string, unknown>): string };
  onTabChange?: (event: TabChangeEvent) => void;
  onBeforeTabChange?: (event: TabChangeEvent) => boolean | void | Promise<boolean>;
  onTabChangeCancelled?: (event: TabChangeEvent) => void;
}

/**
 * A tabbed grid: a `role="tablist"` strip above a stack of `role="tabpanel"`
 * regions, each hosting its own, independently-configured grid instance
 * (BACKLOG-0001039). A tab's grid mounts on first activation and is kept
 * alive, hidden, until `destroy()`.
 */
interface Tabs {
  readonly el: HTMLElement;
  /** The currently active tab id. */
  readonly activeId: string;
  /** The configured tab ids, in order. */
  tabs(): string[];
  /** The live grid instance for a tab, or `null` before it has been materialised. */
  tab(id: string): unknown | null;
  /** Whether a tab's grid has been created yet. */
  isMounted(id: string): boolean;
  /** Switch the active tab, gated by `beforeTabChange`. */
  activate(id: string, opts?: { origin?: 'api' | 'user' }): boolean | Promise<boolean>;
  on(name: 'beforeTabChange' | 'tab:changed' | 'tabChange:cancelled' | string, fn: (event: TabChangeEvent) => void): () => void;
  off(name: string, fn: (event: TabChangeEvent) => void): void;
  /** Tear the whole strip down; destroys every mounted tab's grid. */
  destroy(): void;
}

/**
 * Create a tabbed grid over a host element. Each tab is a full,
 * independently-configured grid instance; a tab may derive from another via
 * `from`, reusing the shipped `source: { mode: 'derived' }` mechanism.
 */
export function createTabs(el: HTMLElement, config: TabsConfig): Tabs;
export default createTabs;
