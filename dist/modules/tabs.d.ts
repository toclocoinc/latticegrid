/*!
 * Lattice Grid 1.68.2, tabs module type declarations
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
  /** An alias for `group`, forwarded verbatim to the derived source. */
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

/**
 * `beforeTabChange`: a switch is about to be applied, and may be refused.
 *
 * Delivered through `packages/modules/shared/emitter.js`'s `emitBefore`, which
 * builds the event from the module's action context plus `type`, the resolved
 * `origin` and the veto surface — so every member below is always present on
 * this event. A handler refuses the switch by calling `preventDefault(reason?)`
 * or by returning a Promise that resolves `false`; the active tab then does not
 * change and `tabChange:cancelled` fires carrying the reason.
 */
interface TabChangeEvent {
  /** Which event this is: `beforeTabChange`. */
  type: string;
  /** The tab being switched to. */
  id: string;
  /** The tab being left, or null when no tab was active. */
  previousId: string | null;
  /**
   * Who asked for the switch: `user` for a click or a keypress, `api` for
   * `activate()`. The opening tab is activated silently, so it raises no
   * `beforeTabChange` at all.
   */
  origin: 'api' | 'user';
  /** The reason given to `preventDefault`, or null while nothing has refused the switch. */
  reason: string | null;
  /** True once a handler has refused the switch. */
  defaultPrevented: boolean;
  /** Refuse the switch; the optional reason is carried on `tabChange:cancelled`. */
  preventDefault(reason?: string): void;
}

/**
 * `tab:changed`: the switch happened — the target panel is revealed, its grid
 * materialised on first activation, the badges refreshed and `aria-selected`
 * moved. A notification, so it carries no `preventDefault`.
 */
interface TabChangedEvent {
  /** Which event this is: `tab:changed`. */
  type: string;
  /** The tab now active. */
  id: string;
  /**
   * The tab that was left, or null for the mount-time activation — which
   * happens while the strip is being built, before a handler can subscribe.
   */
  previousId: string | null;
}

/**
 * `tabChange:cancelled`: a `beforeTabChange` handler refused the switch, so the
 * active tab did not change. A notification, so it carries no `preventDefault`.
 */
interface TabChangeCancelledEvent {
  /** Which event this is: `tabChange:cancelled`. */
  type: string;
  /** The tab that was not switched to. */
  id: string;
  /** The tab that is still active, or null when none was. */
  previousId: string | null;
  /** Who asked for the switch that was refused. */
  origin: 'api' | 'user';
  /** The reason given to `preventDefault`, or `'prevented'` when none was. */
  reason: string;
}

/**
 * The events a tabbed grid raises.
 *
 * The strip's own, not a grid's: `grid.on` takes {@link EventName} and knows
 * nothing about these, and each tab's grid keeps raising its own events itself.
 * `on()` warns once on any other name, because a binding to an event that can
 * never fire is a silent no-op. Each event also has a config callback
 * (`onBeforeTabChange`, `onTabChange`, `onTabChangeCancelled`); both routes
 * fire.
 *
 * Only `beforeTabChange` is cancellable — it is the one that runs before
 * anything moves. `tab:changed` and `tabChange:cancelled` report a decision
 * already taken and carry no `preventDefault`.
 */
type TabsEventName =
  /** A switch is about to be applied; cancellable. */
  | 'beforeTabChange'
  /** The active tab changed: its panel is showing and its grid is mounted. */
  | 'tab:changed'
  /** A `beforeTabChange` handler refused the switch; the active tab did not change. */
  | 'tabChange:cancelled';

/** What a handler receives, per tabs event. */
interface TabsEventPayloads {
  /** The switch about to happen, with `preventDefault` to refuse it. */
  beforeTabChange: TabChangeEvent;
  /** The tab now active, and the one it replaced. */
  'tab:changed': TabChangedEvent;
  /** The switch that was refused, and why. */
  'tabChange:cancelled': TabChangeCancelledEvent;
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
  /** Called after the active tab has changed, alongside the `tab:changed` event. */
  onTabChange?: (event: TabChangedEvent) => void;
  /**
   * Called before the switch. Return `false`, call `preventDefault(reason)`, or throw, to
   * stay where you are; return a promise and the switch waits for it. Alongside the
   * `beforeTabChange` event.
   */
  onBeforeTabChange?: (event: TabChangeEvent) => boolean | void | Promise<boolean>;
  /**
   * Called when a switch was refused, with the reason on the payload. Alongside
   * `tabChange:cancelled`.
   */
  onTabChangeCancelled?: (event: TabChangeCancelledEvent) => void;
}

/**
 * A tabbed grid: a `role="tablist"` strip above a stack of `role="tabpanel"`
 * regions, each hosting its own, independently-configured grid instance. A tab's grid mounts on first activation and is kept
 * alive, hidden, until `destroy()`.
 */
interface Tabs {
  /** The element the strip was mounted on. */
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
  /**
   * Register an event handler; returns a function that removes it. Any other name is
   * warned about once, because it names a binding that could never fire. What each event
   * carries is {@link TabsEventPayloads}; the handler is declared with the widest of
   * them, so narrow on the name inside it.
   */
  on(name: TabsEventName, fn: (event: TabsEventPayloads[TabsEventName]) => void): () => void;
  /** Remove a handler registered with `on`. */
  off(name: TabsEventName, fn: (event: TabsEventPayloads[TabsEventName]) => void): void;
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
