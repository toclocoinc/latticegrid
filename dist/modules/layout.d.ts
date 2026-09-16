/*!
 * Lattice Grid 1.62.0, layout module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  version,
} from '../lattice-grid.js';

/**
 * One window on the cell grid.
 *
 * Deliberately **not** named `WindowSpec`: that name is already taken by the
 * rolling-statistics window (`{ kind: 'count'|'time'|'session', span, size }`)
 * and reusing it would put `kind: 'session'` next to a dashboard pane.
 */
interface LayoutWindow {
  /** A stable, unique id. Required. */
  id: string;
  /** The 1-based column the window starts in. Auto-placed when omitted. */
  xPos?: number;
  /** The 1-based row the window starts in. Auto-placed when omitted. */
  yPos?: number;
  /** How many columns it spans (default 1). */
  xSize?: number;
  /** How many rows it spans (default 1). */
  ySize?: number;
  /** The title shown in the chrome bar, and the name every control takes. */
  title?: string;
  /** Whether to draw the title bar (default `true`). */
  chrome?: boolean;
  /** Whether to offer a close button (default `false`). */
  closable?: boolean;
  /** Whether the window can be moved by drag or keyboard (default `false`). */
  movable?: boolean;
  /** Whether the window can be resized by drag or keyboard (default `false`). */
  resizable?: boolean;
  /**
   * Whether to offer a maximise control in the chrome (default `false`).
   *
   * Maximising fills the **layout host**, not the browser window, and hides
   * every other window for the duration. Escape restores it, unless a payload
   * has already claimed the key.
   */
  maximisable?: boolean;
  /**
   * Whether to offer a minimise control in the chrome (default `false`).
   *
   * A window with `chrome: false` cannot be minimised whatever this says:
   * there would be nothing left on screen to restore it with.
   */
  minimisable?: boolean;
  /** Padding inside the window; the layout's `padding` (default `'5px'`) otherwise. */
  padding?: number | string;
  /** The `id` given to the payload container (default `` `${id}-body` ``). */
  payloadId?: string;
  /** The window's accessible name, when the title alone is not enough context. */
  ariaLabel?: string;
}

/**
 * The three capabilities a layout-level default and `setInteractive()` cover.
 *
 * These are the layout **defaults**, not the per-window resolution: a window
 * that declared `movable: false` stays pinned whatever these say.
 *
 * Three values, not two. `undefined` means no layout-level default is in force
 * and each window's own flag decides; `true` unlocks everything that did not
 * opt out; `false` is an active lock. Reporting `undefined` as `false` would
 * read correctly and round-trip wrongly, so it is reported as it is.
 */
interface LayoutInteractive {
  movable: boolean | undefined;
  resizable: boolean | undefined;
  closable: boolean | undefined;
}

/** The plain, JSON-safe arrangement `getLayout()` returns and `setLayout()` takes. */
interface LayoutSnapshot {
  columns: number;
  rows: number;
  windows: { id: string; xPos: number; yPos: number; xSize: number; ySize: number }[];
}

/** A cell placement, as carried on the move and resize events. */
interface LayoutPlacement {
  xPos: number;
  yPos: number;
  xSize: number;
  ySize: number;
}

/** The payload of `window:moved`, `beforeWindowMove`, `beforeWindowResize`. */
interface LayoutMoveEvent {
  id: string;
  from: LayoutPlacement;
  /** Where the window was asked to go. */
  to: LayoutPlacement;
  /** Where it actually ended up, which under `compact: 'vertical'` may differ. */
  landed?: LayoutPlacement;
  origin?: 'api' | 'user' | 'init';
  reason?: string | null;
  /** Cancel the action (only meaningful on a `before*` event). */
  preventDefault?: (reason?: string) => void;
  defaultPrevented?: boolean;
}

/**
 * The payload of `window:resized` — the measured **content box** of the
 * payload container, not a cell count. Emitted when the container genuinely
 * changes size, including on the opening frame; never with a zero box.
 */
interface LayoutResizeEvent {
  id: string;
  payloadId: string;
  /** The payload container itself, so a host can act on it directly. */
  payload: HTMLElement;
  width: number;
  height: number;
  xPos: number;
  yPos: number;
  xSize: number;
  ySize: number;
}

/** The payload of `window:closed` and `beforeWindowClose`. */
interface LayoutCloseEvent {
  id: string;
  payloadId: string;
  /** The payload container, handed back so the host can destroy what it mounted. */
  payload?: HTMLElement;
  origin?: 'api' | 'user';
  reason?: string | null;
  preventDefault?: (reason?: string) => void;
  defaultPrevented?: boolean;
}

/** The payload of `layout:changed`: the whole arrangement, plus what moved it. */
interface LayoutChangedEvent extends LayoutSnapshot {
  cause: string;
}

/** Dashboard layout configuration. */
interface LayoutConfig {
  /** Cell columns across the mounted element (default 12). */
  columns?: number;
  /** Cell rows down the mounted element (default 6). */
  rows?: number;
  /** Horizontal overflow (default `'static'`). */
  overflowX?: 'static' | 'scroll';
  /** Vertical overflow (default `'static'`). */
  overflowY?: 'static' | 'scroll';
  /** Fixed column track size, used only when `overflowX` is `'scroll'` (default `'240px'`). */
  columnWidth?: number | string;
  /** Fixed row track size, used only when `overflowY` is `'scroll'` (default `'160px'`). */
  rowHeight?: number | string;
  /** The gap between cells (default `'8px'`). */
  gap?: number | string;
  /** The default padding inside a window (default `'5px'`). */
  padding?: number | string;
  /**
   * Rearrangement (default `'vertical'`). One gravity direction, never two:
   * `'vertical'` pushes displaced windows down and then floats everything up,
   * `'horizontal'` pushes them right and then floats everything left — so
   * dragging a window out of a row closes the hole sideways — and `'none'`
   * leaves every placement exactly where it was put. An unrecognised value
   * warns once, naming what it got, and falls back to `'vertical'`.
   */
  compact?: 'vertical' | 'horizontal' | 'none';
  /**
   * The default `movable` for every window that does not declare its own
   * (default `false`). This states a default, so `false` takes nothing away
   * from a window that declared `movable: true`; `setInteractive(false)` is
   * the active lock that does.
   */
  movable?: boolean;
  /** The default `resizable` for windows that declare none (default `false`); see `movable`. */
  resizable?: boolean;
  /** The default `closable` for windows that declare none (default `false`); see `movable`. */
  closable?: boolean;
  /**
   * The default `maximisable` for windows that declare none (default `false`).
   *
   * Not touched by `setInteractive()`: a display mode neither moves nor resizes
   * a window in the arrangement, so a locked dashboard can still be blown up
   * to read.
   */
  maximisable?: boolean;
  /** The default `minimisable` for windows that declare none (default `false`); see `maximisable`. */
  minimisable?: boolean;
  /** The windows, in mount order. */
  windows?: LayoutWindow[];
  /** An arrangement to apply at mount, as produced by `getLayout()`. */
  layout?: LayoutSnapshot;
  /** The layout region's accessible name. */
  ariaLabel?: string;
  /** A message catalogue, e.g. `grid.messages`; built-in English seeds otherwise. */
  messages?: { t(key: string, params?: Record<string, unknown>): string };
  onWindowMoved?: (event: LayoutMoveEvent) => void;
  onWindowResized?: (event: LayoutResizeEvent) => void;
  onWindowClosed?: (event: LayoutCloseEvent) => void;
  onLayoutChanged?: (event: LayoutChangedEvent) => void;
  onBeforeWindowMove?: (event: LayoutMoveEvent) => boolean | void | Promise<boolean>;
  onBeforeWindowResize?: (event: LayoutMoveEvent) => boolean | void | Promise<boolean>;
  onBeforeWindowClose?: (event: LayoutCloseEvent) => boolean | void | Promise<boolean>;
  onWindowMoveCancelled?: (event: LayoutMoveEvent) => void;
  onWindowResizeCancelled?: (event: LayoutMoveEvent) => void;
  onWindowCloseCancelled?: (event: LayoutCloseEvent) => void;
}

/**
 * A reconfigurable dashboard: a cell grid inside an element, and a set of
 * windows on it that a user can move, resize and close by pointer or by
 * keyboard (BACKLOG-0001108).
 *
 * The module is **payload-agnostic**: a window body is a container with an id,
 * which this module creates and sizes and never reads. It tells a payload it
 * was resized by emitting `window:resized`; it never calls into one, because it
 * cannot know what one is.
 */
interface Layout {
  readonly el: HTMLElement;
  /** The window ids, in mount order. */
  windows(): string[];
  /** The payload container for a window, or `null`. */
  payload(id: string): HTMLElement | null;
  /** A copy of one window's current descriptor, or `null`. */
  window(id: string): LayoutWindow | null;
  /** Add a window after mount; returns its payload container. */
  add(spec: LayoutWindow): HTMLElement;
  /** Move or resize a window, through the same before-events the drag uses. */
  move(id: string, to: Partial<LayoutPlacement>): boolean | Promise<boolean>;
  /** Close a window through `beforeWindowClose`; the payload is not destroyed. */
  close(id: string): boolean | Promise<boolean>;
  /**
   * Blow one window up to fill the layout host, hiding the rest.
   *
   * It fills the **host element**, not the browser window, so there is no
   * `position: fixed` (whose containing block is the nearest ancestor carrying
   * a `transform` or a `contain`, which is why the same rule fills the screen
   * on one page and lands in a 300px box on the next), no reparenting and
   * nothing that can disturb the page around the dashboard.
   *
   * **Nothing moves**: no compaction runs, no placement changes, and the
   * payload container is the same DOM node throughout. **Escape restores it**,
   * from anywhere inside the layout — a focused grid body cell or column
   * heading included — unless a payload has already claimed the key: an open
   * cell editor, filter menu or column menu closes first, and the next Escape
   * restores the window. Afterwards focus lands on the window's maximise
   * control. A minimised window is expanded first, and maximising a second
   * window restores the first.
   */
  maximise(id: string): boolean;
  /**
   * Collapse one window to a single row: its payload is hidden and its chrome
   * stays, carrying the control that brings it back.
   *
   * On screen it becomes one row and the windows below pull up into the space
   * under `compact: 'vertical'`. In the arrangement nothing moves at all — the
   * collapse is a projection of it — so `restore()` gives back exactly the
   * arrangement that was there, in **any** order and with any number of other
   * windows still collapsed.
   *
   * A window with `chrome: false` is refused, with a warning naming it.
   */
  minimise(id: string): boolean;
  /** Leave whichever display mode a window is in; `false` when it was in none. */
  restore(id: string): boolean;
  /** The id of the window filling the host, or `null`. At most one. */
  maximised(): string | null;
  /** The ids of every currently minimised window, in mount order. */
  minimised(): string[];
  /**
   * The full current arrangement.
   *
   * **A mode is not an arrangement**: this reports the *underlying* placement
   * of a maximised or minimised window — where it will be when restored — never
   * the geometry it is drawn at.
   */
  getLayout(): LayoutSnapshot;
  /** Restore an arrangement; never throws on garbage. */
  setLayout(incoming: LayoutSnapshot | LayoutWindow[]): number;
  /** A versioned snapshot, following core's and gantt's shape. */
  getState(): { version: number; layout: LayoutSnapshot };
  /** Restore a `getState()` snapshot; never throws on garbage. */
  setState(snapshot: unknown): number;
  /**
   * Lock or unlock the dashboard at runtime — the "Edit layout" button. A
   * boolean sets all three capabilities; an object sets only the keys it
   * carries. Nothing is destroyed, so every payload survives the toggle.
   *
   * The asymmetry is deliberate: **you can always take a capability away; you
   * can never grant one where the developer said no.** `setInteractive(false)`
   * locks every window, including one whose own spec says `movable: true`;
   * `setInteractive(true)` unlocks only the windows that never opted out.
   *
   * `config.movable: false` and `setInteractive(false)` are deliberately not
   * the same thing: the config states the *default* for windows that declare
   * nothing (and `false` is already that default, so it takes nothing away from
   * a window that opted in), while this is an *active lock*.
   *
   * A key carrying `undefined` is treated as absent, so
   * `setInteractive(getInteractive())` is a no-op in every state.
   *
   * A locked layout is not a read-only dashboard: this module never reads or
   * writes a payload, so a grid inside a window is made read-only with the
   * grid's own settings.
   */
  setInteractive(value: boolean | Partial<LayoutInteractive>): LayoutInteractive;
  /**
   * The layout-level interactivity now in force, as a copy — `undefined` where
   * no layout-level default is set, so the result round-trips through
   * `setInteractive`.
   */
  getInteractive(): LayoutInteractive;
  /** Re-measure every window and emit `window:resized` for those that changed. */
  refresh(): number;
  on(
    name: 'window:moved' | 'window:resized' | 'window:closed' | 'layout:changed'
      | 'beforeWindowMove' | 'beforeWindowResize' | 'beforeWindowClose'
      | 'windowMove:cancelled' | 'windowResize:cancelled' | 'windowClose:cancelled'
      | '*' | string,
    fn: (event: any) => unknown,
  ): () => void;
  off(name: string, fn: (event: any) => unknown): void;
  /** Tear the layout down; whatever the host mounted in a payload is the host's to destroy. */
  destroy(): void;
}

/** Create a reconfigurable dashboard layout over a host element. */
export function createLayout(el: HTMLElement, config?: LayoutConfig): Layout;
export default createLayout;
