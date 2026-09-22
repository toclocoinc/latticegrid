/*!
 * Lattice Grid 1.68.2, layout module type declarations
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
  /**
   * Whether dragging a window to another cell is currently allowed for the layout as a
   * whole. Undefined means nothing has been locked or unlocked, so each window's own flag
   * decides.
   */
  movable: boolean | undefined;
  /**
   * Whether dragging a window's edge is currently allowed for the layout as a whole, on
   * the same terms as `movable`.
   */
  resizable: boolean | undefined;
  /**
   * Whether the close control is currently allowed for the layout as a whole, on the same
   * terms as `movable`.
   */
  closable: boolean | undefined;
}

/** The plain, JSON-safe arrangement `getLayout()` returns and `setLayout()` takes. */
interface LayoutSnapshot {
  /**
   * How many cell columns the layout had when the snapshot was taken. Informational on
   * the way back in: `setLayout` reads only `windows`, and clamps each placement to the
   * layout it is restored into.
   */
  columns: number;
  /** How many cell rows the layout had when the snapshot was taken; informational too. */
  rows: number;
  /**
   * Each window's id and its cell placement. Position and size only: titles, content and
   * capabilities stay with the configuration.
   */
  windows: { id: string; xPos: number; yPos: number; xSize: number; ySize: number }[];
}

/** A cell placement, as carried on the move and resize events. */
interface LayoutPlacement {
  /** The window's left-hand column, counted from 1. */
  xPos: number;
  /** The window's top row, counted from 1. */
  yPos: number;
  /** How many columns wide the window is; at least 1, and never more than the layout has. */
  xSize: number;
  /** How many rows tall the window is; at least 1. */
  ySize: number;
}

/** The payload of `window:moved`, `beforeWindowMove`, `beforeWindowResize`. */
interface LayoutMoveEvent {
  /** Which window moved or was asked to move. */
  id: string;
  /**
   * Where the window was before the gesture. A move that would change nothing is not
   * reported at all.
   */
  from: LayoutPlacement;
  /** Where the window was asked to go. */
  to: LayoutPlacement;
  /** Where it actually ended up, which under `compact: 'vertical'` may differ. */
  landed?: LayoutPlacement;
  /**
   * Who caused it: `user` for a drag, `api` for a call, `init` for the opening
   * arrangement. Defaults to `user`.
   */
  origin?: 'api' | 'user' | 'init';
  /**
   * Why it was cancelled — whatever was passed to `preventDefault`, `prevented` when
   * nothing was, or `error` when a handler threw. Null while nothing has cancelled it.
   */
  reason?: string | null;
  /** Cancel the action (only meaningful on a `before*` event). */
  preventDefault?: (reason?: string) => void;
  /**
   * True once a handler has cancelled the action. Read it in a later handler to see that
   * an earlier one already refused.
   */
  defaultPrevented?: boolean;
}

/**
 * The payload of `window:resized` — the measured **content box** of the
 * payload container, not a cell count. Emitted when the container genuinely
 * changes size, including on the opening frame; never with a zero box.
 */
interface LayoutResizeEvent {
  /** Which window changed size. */
  id: string;
  /**
   * The id of the window's content container, so a host can find the element it mounted
   * into. Defaults to the window id plus `-body`.
   */
  payloadId: string;
  /** The payload container itself, so a host can act on it directly. */
  payload: HTMLElement;
  /**
   * The content box's width in CSS pixels, measured — not a cell count. A change under a
   * pixel is not reported.
   */
  width: number;
  /** The content box's height in CSS pixels, on the same terms as `width`. */
  height: number;
  /** The window's left-hand column at the time of the measurement. */
  xPos: number;
  /** The window's top row at the time of the measurement. */
  yPos: number;
  /** How many columns wide the window now is. */
  xSize: number;
  /** How many rows tall the window now is. */
  ySize: number;
}

/** The payload of `window:closed` and `beforeWindowClose`. */
interface LayoutCloseEvent {
  /** Which window was closed, or is about to be. */
  id: string;
  /**
   * The id of its content container — the handle for tearing down whatever was mounted
   * inside.
   */
  payloadId: string;
  /** The payload container, handed back so the host can destroy what it mounted. */
  payload?: HTMLElement;
  /** Who caused it: `user` for the close control, `api` for a call. Defaults to `user`. */
  origin?: 'api' | 'user';
  /**
   * Why the close was refused — the reason given to `preventDefault`, `prevented` when
   * none was, or `error` when a handler threw.
   */
  reason?: string | null;
  /**
   * Refuse the close, optionally saying why. Only `beforeWindowClose` is cancellable; by
   * `window:closed` the window has gone.
   */
  preventDefault?: (reason?: string) => void;
  /** True once a handler has refused the close. */
  defaultPrevented?: boolean;
}

/**
 * `window:moved`: a window finished moving.
 *
 * The past-tense event, so there is no `preventDefault` on it — the move has
 * happened, and `beforeWindowMove` ({@link LayoutMoveEvent}) is where it could
 * have been stopped.
 */
interface LayoutWindowMovedEvent {
  /** Which window moved. */
  id: string;
  /** Where it was before the gesture. */
  from: LayoutPlacement;
  /** Where it was asked to go. */
  to: LayoutPlacement;
  /** Where it actually ended up, which under `compact: 'vertical'` may differ from `to`. */
  landed: LayoutPlacement;
  /** Who caused it: `user` for a drag or a keyboard move, `api` for `setWindow`. */
  origin: 'api' | 'user';
}

/**
 * `window:closed`: a window was removed and its payload container handed back.
 *
 * The past-tense event: no `preventDefault`, because the window has gone. The
 * container is **not** destroyed — whatever the host mounted in it is the
 * host's to tear down.
 */
interface LayoutWindowClosedEvent {
  /** Which window closed. */
  id: string;
  /** The id of its content container. */
  payloadId: string;
  /** The container itself, handed back so the host can destroy what it mounted. */
  payload: HTMLElement;
  /** Who caused it: `user` for the close control, `api` for a call. */
  origin: 'api' | 'user';
}

/**
 * `windowMove:cancelled` and `windowResize:cancelled`: a `before…` handler
 * refused the gesture. A notification, so it carries no `preventDefault`.
 */
interface LayoutMoveCancelledEvent {
  /** Which window did not move. */
  id: string;
  /** Where it is, and stays. */
  from: LayoutPlacement;
  /** Where it would have gone. */
  to: LayoutPlacement;
  /** Who asked for the gesture that was refused: `user` for a drag or keyboard move, `api` for `setWindow`. */
  origin: 'api' | 'user';
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/**
 * `windowClose:cancelled`: a `beforeWindowClose` handler refused the close. A
 * notification, so it carries no `preventDefault`.
 */
interface LayoutCloseCancelledEvent {
  /** Which window stayed open. */
  id: string;
  /** The id of its content container. */
  payloadId: string;
  /** Who asked for the close that was refused. */
  origin: 'api' | 'user';
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/**
 * The events a dashboard layout raises.
 *
 * The layout's own, not a grid's: `grid.on` takes {@link EventName} and knows
 * nothing about these. Each has a matching `on…` config callback (`onWindowMoved`,
 * `onBeforeWindowClose`, …) and both routes fire.
 *
 * The three `before…` events are cancellable: call `preventDefault(reason?)` on
 * the payload, or return a Promise to hold the gesture until it settles; a veto
 * fires the matching `…:cancelled` carrying the reason. Subscribing to `'*'`
 * receives every past-tense event and never gates.
 */
type LayoutEventName =
  /** A window finished moving, with where it was asked to go and where it actually landed. */
  | 'window:moved'
  /** A window's payload container changed size, measured in CSS pixels — including on the opening frame. */
  | 'window:resized'
  /** A window was closed and its payload container handed back. */
  | 'window:closed'
  /** The arrangement settled after an add, close, move, resize, minimise, restore or `setLayout`. */
  | 'layout:changed'
  /** A window is about to move; cancellable. */
  | 'beforeWindowMove'
  /** A window is about to be resized by a drag or a call; cancellable. */
  | 'beforeWindowResize'
  /** A window is about to be closed; cancellable. */
  | 'beforeWindowClose'
  /** A `beforeWindowMove` handler refused the move. */
  | 'windowMove:cancelled'
  /** A `beforeWindowResize` handler refused the resize. */
  | 'windowResize:cancelled'
  /** A `beforeWindowClose` handler refused the close. */
  | 'windowClose:cancelled';

/** What a handler receives, per layout event. */
interface LayoutEventPayloads {
  /** Which window moved, from where, to where, and where it landed. */
  'window:moved': LayoutWindowMovedEvent;
  /** The measured content box of the window's payload container. */
  'window:resized': LayoutResizeEvent;
  /** The window that closed, and the container handed back. */
  'window:closed': LayoutWindowClosedEvent;
  /** The arrangement, and what settled it. */
  'layout:changed': LayoutChangedEvent;
  /** The move about to be applied, with `preventDefault` to stop it. */
  beforeWindowMove: LayoutMoveEvent;
  /** The resize about to be applied, with `preventDefault` to stop it. */
  beforeWindowResize: LayoutMoveEvent;
  /** The close about to happen, with `preventDefault` to refuse it. */
  beforeWindowClose: LayoutCloseEvent;
  /** The move that was refused, and why. */
  'windowMove:cancelled': LayoutMoveCancelledEvent;
  /** The resize that was refused, and why. */
  'windowResize:cancelled': LayoutMoveCancelledEvent;
  /** The close that was refused, and why. */
  'windowClose:cancelled': LayoutCloseCancelledEvent;
}

/** The payload of `layout:changed`: the whole arrangement, plus what moved it. */
interface LayoutChangedEvent extends LayoutSnapshot {
  /**
   * What moved the arrangement: `move`, `resize`, `close`, `add`, `minimise`, `restore`,
   * `setLayout` or `init`.
   */
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
  /** Called after a window has moved, alongside the `window:moved` event. */
  onWindowMoved?: (event: LayoutMoveEvent) => void;
  /**
   * Called when a window's measured content box changes, alongside `window:resized` —
   * including on the opening frame.
   */
  onWindowResized?: (event: LayoutResizeEvent) => void;
  /**
   * Called after a window has closed, with its content container handed back so the host
   * can destroy what it mounted. Alongside `window:closed`.
   */
  onWindowClosed?: (event: LayoutCloseEvent) => void;
  /**
   * Called whenever the arrangement settles, with the whole snapshot and what caused it —
   * the hook for persisting a dashboard. Alongside `layout:changed`.
   */
  onLayoutChanged?: (event: LayoutChangedEvent) => void;
  /**
   * Called before a move is applied. Return `false`, call `preventDefault(reason)`, or
   * throw, to refuse it; return a promise and the move waits for it. Alongside the
   * `beforeWindowMove` event.
   */
  onBeforeWindowMove?: (event: LayoutMoveEvent) => boolean | void | Promise<boolean>;
  /** Called before a resize is applied, on the same terms as `onBeforeWindowMove`. */
  onBeforeWindowResize?: (event: LayoutMoveEvent) => boolean | void | Promise<boolean>;
  /**
   * Called before a window closes, on the same terms as `onBeforeWindowMove`. This is
   * where an unsaved-changes prompt belongs.
   */
  onBeforeWindowClose?: (event: LayoutCloseEvent) => boolean | void | Promise<boolean>;
  /**
   * Called when a move was refused, with the reason on the payload. Alongside
   * `windowMove:cancelled`.
   */
  onWindowMoveCancelled?: (event: LayoutMoveEvent) => void;
  /** Called when a resize was refused. Alongside `windowResize:cancelled`. */
  onWindowResizeCancelled?: (event: LayoutMoveEvent) => void;
  /** Called when a close was refused. Alongside `windowClose:cancelled`. */
  onWindowCloseCancelled?: (event: LayoutCloseEvent) => void;
}

/**
 * A reconfigurable dashboard: a cell grid inside an element, and a set of
 * windows on it that a user can move, resize and close by pointer or by
 * keyboard.
 *
 * The module is **payload-agnostic**: a window body is a container with an id,
 * which this module creates and sizes and never reads. It tells a payload it
 * was resized by emitting `window:resized`; it never calls into one, because it
 * cannot know what one is.
 */
interface Layout {
  /**
   * The element the layout was mounted on. It carries the layout's host class, which is
   * also how a second `createLayout` on the same element is refused.
   */
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
  /**
   * Subscribe to a layout event, or to `'*'` for every past-tense one; returns a function
   * that unsubscribes. Only an explicit `before…` subscription can cancel an action — the
   * `'*'` stream never gates. What each event carries is {@link LayoutEventPayloads}; the
   * handler is declared with the widest of them, so narrow on the name inside it.
   */
  on(
    name: LayoutEventName | '*',
    fn: (event: LayoutEventPayloads[LayoutEventName]) => unknown,
  ): () => void;
  /** Remove a handler registered with `on`. */
  off(name: LayoutEventName | '*', fn: (event: LayoutEventPayloads[LayoutEventName]) => unknown): void;
  /** Tear the layout down; whatever the host mounted in a payload is the host's to destroy. */
  destroy(): void;
}

/** Create a reconfigurable dashboard layout over a host element. */
export function createLayout(el: HTMLElement, config?: LayoutConfig): Layout;
export default createLayout;
