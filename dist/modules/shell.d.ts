/*!
 * Lattice Grid 1.114.0, shell module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  EventOrigin,
  ViewerOrigin,
  version,
} from '../lattice-grid.js';

/** A cell size: pixels as a number, or any CSS length string such as `'30%'`. */
type ShellSize = number | string;

/** The separator between cells: thin lines, wide lines, an even gap, or none. */
export type ShellType = 'line' | 'wide' | 'space' | 'none';

/** A Lattice view as `attach()` sees it: an object exposing its root element and, optionally, a resize/refresh method the shell nudges on show. */
export interface ShellWidget {
  /** The view's root element (`createGrid` exposes `.element`). */
  element?: HTMLElement;
  /** The view's root element (the scheduler and layout expose `.el`). */
  el?: HTMLElement;
  /** Re-measure after a container change; preferred over `refresh` when both exist. */
  resize?(): void;
  /** Re-measure after a container change (the layout's method). Never a `paint()`. */
  refresh?(): void;
}

/** Anything `attach()` mounts: a Lattice view, a DOM element, or an HTML string (converted once and reused). */
export type ShellContent = HTMLElement | string | ShellWidget;

/** The optional hooks `attach(content, opts)` takes, fired when the content hides or shows. */
export interface ShellAttachHooks {
  /** Called when the content hides (a tab switch away, a collapse, a hide). */
  onHidden?(content: ShellContent): void;
  /** Called when the content becomes visible again. */
  onVisible?(content: ShellContent): void;
}

/** One header action on a cell: a button drawn beside (never replacing) the collapse control. */
export interface ShellHeaderAction {
  /** The button's glyph or icon node. */
  icon?: string | Node;
  /** The accessible name on the button (`aria-label`). */
  ariaLabel: string;
  /** Runs on a click, and on Enter/Space through the button's native activation. */
  onClick(): void;
  /** An optional id, exposed as `data-action-id` so a host can find the button. */
  id?: string;
}

/** One tab of a tabbed cell: its identity, its strip label, and the content it holds across switches. */
export interface ShellTab {
  /** The tab's identity for `getTab(id)`. */
  id: string;
  /** The text on the tab. Defaults to `id`. */
  label?: string;
  /** The content the tab holds, attached the same way `attach()` attaches it. */
  content?: ShellContent;
  /** Called when this tab's content hides on a switch away. */
  onHidden?(content: ShellContent): void;
  /** Called when this tab's content becomes visible on a switch to it. */
  onVisible?(content: ShellContent): void;
  /** Make this tab active on first render, instead of the first tab. When more than one tab in the array is `selected: true`, the last one wins and a warning is logged once. Switching tabs after mount is still `getTab(id).activate()`. */
  selected?: boolean;
}

/** One cell of a shell. A cell either mounts content or nests `rows`/`cols`. */
export interface ShellCell {
  /** The cell's identity for `getCell(id)`. Auto-generated when omitted. */
  id?: string;
  /** The cell's width: the main-axis size among `cols` (px or %), or the cross-axis size among `rows`. `'content'` takes the natural width of what the cell holds and re-flows when it changes; sibling gravity cells share the remainder. */
  width?: ShellSize | 'content';
  /** The cell's height: the main-axis size among `rows` (px or %), or the cross-axis size among `cols`. `'content'` takes the natural height of what the cell holds (a KPI strip, a form, a grid with `autoHeight`) and re-flows when it changes; sibling gravity cells share the remainder. `minHeight`/`maxHeight` bound it. */
  height?: ShellSize | 'content';
  /** Share of the spare space when the cell has no fixed size. Default 1. */
  gravity?: number;
  /** Start a gravity cell at its content's size and grow into the spare space from there, instead of the default zero basis. */
  basis?: 'content';
  /** The cell's minimum width, on either axis. */
  minWidth?: ShellSize;
  /** The cell's maximum width, on either axis. */
  maxWidth?: ShellSize;
  /** The cell's minimum height, on either axis. */
  minHeight?: ShellSize;
  /** The cell's maximum height, on either axis. */
  maxHeight?: ShellSize;
  /** When true, a fixed-size cell shrinks below its `width`/`height` when the shell runs short, never below `minWidth`/`minHeight`. By default a fixed-size cell holds its size and the shell's own box scrolls. */
  shrink?: boolean;
  /** When true, a splitter on the trailing border resizes this cell and its next sibling. */
  resizable?: boolean;
  /** The cell's inner padding: a CSS padding value. */
  padding?: number | string;
  /** Extra CSS: an object of camelCase properties, or a string of declarations. A `display` set here wins over the shell's default, so a leaf cell can be flex-centred. */
  css?: Record<string, string | number> | string;
  /** Host class names on the cell's element, separate from the inline `css`. */
  className?: string;
  /** The cell's `align-self` across the parent's axis. */
  align?: string;
  /** The header strip's content: text, or a custom element to mount. */
  header?: string | Node;
  /** An icon in the header strip: a URL (rendered as an image) or a glyph/emoji. */
  headerIcon?: string;
  /** An image in the header strip, rendered as an `<img>` with this `src`. */
  headerImage?: string;
  /** The header strip's height on the cell's main axis (px or a CSS length). Default 32. */
  headerHeight?: ShellSize;
  /** Extra CSS on the header strip only, merged over the shell's `headerCss`. */
  headerCss?: Record<string, string | number> | string;
  /** Extra buttons in the header strip, beside the collapse control. */
  headerActions?: ShellHeaderAction[];
  /** Show a collapse control in the header and let `collapse()`/`expand()` fold the cell. */
  collapsable?: boolean;
  /** Start the cell folded to its header strip (implies `collapsable`); also the cell's current collapsed state. */
  collapsed?: boolean;
  /** Mutable state: whether the cell is hidden from the layout; `hidden: true` also starts it hidden until `show()`. */
  hidden?: boolean;
  /** Mutable state: the id of the selected tab inside the cell, when it hosts tabs. */
  selected?: string;
  /** Nested cells, laid out top-to-bottom. */
  rows?: ShellCell[];
  /** Nested cells, laid out left-to-right. */
  cols?: ShellCell[];
  /** Tabbed content: a strip with one attached content per tab, each preserved across switches. */
  tabs?: ShellTab[];
  /** Markup mounted as the cell's content, sanitised like the string path of `attach()` — script, `on*` and `javascript:` URLs removed, form controls and `<style>` kept. */
  html?: string;
  /** Start the cell with its loading indicator already overlaid. Default false. */
  progressDefault?: boolean;
}

/** The configuration for {@link createShell}. */
export interface ShellConfig {
  /** The top-level cells, laid out top-to-bottom. */
  rows?: ShellCell[];
  /** The top-level cells, laid out left-to-right (used when `rows` is absent). */
  cols?: ShellCell[];
  /** The separator between cells. Default `'none'`. */
  type?: ShellType;
  /** The shell root's inner padding: a CSS padding value. */
  padding?: number | string;
  /** Extra CSS on the shell root. */
  css?: Record<string, string | number> | string;
  /** The default header strip CSS every cell inherits; a cell's own `headerCss` is merged over it. */
  headerCss?: Record<string, string | number> | string;
  /** A message catalogue with a `t(key, params)` formatter, for the collapse control's labels. */
  messages?: { t(key: string, params?: Record<string, string | number>): string };
  /** When true, emit a `data-cell-id` attribute on every cell's element. */
  cellIds?: boolean;
}

/** The cell handle `getCell(id)` and `forEach` hand back. */
export interface ShellCellInstance {
  /** The cell's content element — mount a widget into it directly. */
  readonly el: HTMLElement;
  /** The cell's normalised config. */
  readonly config: ShellCell;
  /** The parent cell's handle, or `null` for a top-level cell. */
  getParent(): ShellCellInstance | null;
  /** Whether the cell is currently folded to its header strip. */
  readonly collapsed: boolean;
  /** Fold the cell to its header strip. No-op on a non-collapsable cell. */
  collapse(): boolean | Promise<boolean>;
  /** Open the cell back to its exact previous size. No-op when already open. */
  expand(): boolean | Promise<boolean>;
  /** Collapse the cell when open, expand it when folded. */
  toggle(): boolean | Promise<boolean>;
  /**
   * Attach a Lattice view, a DOM element or an HTML string to this cell. The
   * cell keeps the same element for its life — hide/show, collapse/expand, tab
   * switches, resizes and moves never re-render it — and only `detach()` or
   * `destroy()` releases it. On a tabbed cell this attaches to the active tab.
   * An HTML string is sanitised once, like `attachHTML()`: `<script>` elements,
   * `on*` attributes and `javascript:` URLs are removed; everything else, form
   * controls and `<style>` included, is kept.
   */
  attach(content: ShellContent, opts?: ShellAttachHooks): ShellCellInstance;
  /**
   * Attach a string of markup, sanitised exactly like the string path of
   * `attach()` — `<script>` elements, `on*` attributes and `javascript:`
   * URLs are removed; everything else, form controls and `<style>` included,
   * is kept.
   */
  attachHTML(html: string): ShellCellInstance;
  /**
   * Change the cell's size live, synchronously. `{ width |
   * height }`: the main-axis key moves a resizable cell's neighbour through
   * the splitter so the two stay consistent and clamped; a number is pixels, a
   * string passes through as a CSS length.
   */
  setSize(size: { width?: ShellSize; height?: ShellSize }): ShellCellInstance;
  /** Change the cell's header live: replace the title, or give a headerless cell a strip. */
  setHeader(value: string | Node): ShellCellInstance;
  /** Replace the cell's header actions live, keeping the collapse control and title. */
  setHeaderActions(list: ShellHeaderAction[]): ShellCellInstance;
  /** Detach this cell's content (the active tab's, when tabbed) and hand it back intact. */
  detach(): ShellContent | null;
  /** The content this cell (or its active tab) holds, or `null`. */
  getWidget(): ShellContent | null;
  /** The handle for one of a tabbed cell's tabs, or `undefined` for a non-tabbed cell or an unknown id. */
  getTab(id: string): ShellTabInstance | undefined;
  /** Whether the cell is currently visible (not hidden). */
  isVisible(): boolean;
  /**
   * Hide the cell, giving its space to its neighbours by CSS reflow. The
   * cancellable `beforeHide` runs first; a veto leaves the cell as it was.
   * Content stays mounted and its `onHidden` hook fires.
   */
  hide(): ShellCellInstance;
  /**
   * Show a hidden cell, restoring its space. The cancellable `beforeShow` runs
   * first; a veto leaves the cell hidden. An attached Lattice view is nudged
   * to re-measure and its `onVisible` hook fires.
   */
  show(): ShellCellInstance;
  /** Overlay a loading indicator on the cell, without touching its size or content. */
  progressShow(): ShellCellInstance;
  /** Clear the cell's loading indicator. */
  progressHide(): ShellCellInstance;
}

/** The tab handle `getTab(id)` hands back for one tab of a tabbed cell. */
export interface ShellTabInstance {
  /** The tab's id. */
  readonly id: string;
  /** The tab's strip label. */
  readonly label: string;
  /** The tab's panel element — its content mounts here. */
  readonly el: HTMLElement;
  /** Whether this is the active tab. */
  active(): boolean;
  /** Make this tab active, firing `tabChange` and the content visibility hooks. */
  activate(): ShellTabInstance;
  /** Attach content to this tab, replacing what it held. */
  attach(content: ShellContent, opts?: ShellAttachHooks): ShellTabInstance;
  /** Detach this tab's content and hand it back. */
  detach(): ShellContent | null;
  /** This tab's content, or `null`. */
  getWidget(): ShellContent | null;
}

/**
 * The events a shell raises, on `shell.on()`.
 *
 * The shell's own, not a grid's: `grid.on` takes {@link EventName} and knows
 * nothing about these. `on()` warns once on any other name, because a
 * binding to an event that can never fire is a silent no-op.
 *
 * The cancellable `before*` events — `beforeCollapse`, `beforeExpand`,
 * `beforeAddCell`, `beforeRemoveCell`, `beforeHide`, `beforeShow` and
 * `beforeResizeStart` — run before the cell moves, on the same contract the
 * grid core uses: call `preventDefault(reason?)` on the payload, or return
 * `false`; a veto keeps the cell (or the two cells' sizes) unchanged. The
 * past-tense events — `afterCollapse`, `afterExpand`, `afterAddCell`,
 * `afterRemoveCell`, `afterHide`, `afterShow`, `resize`, `afterResizeEnd`,
 * `tabChange` and `stateChange` — report a change already applied and carry
 * no `preventDefault`.
 */
export type ShellEventName =
  /** A cell is about to fold to its header strip; cancellable. */
  | 'beforeCollapse'
  /** A cell is about to open back to its previous size; cancellable. */
  | 'beforeExpand'
  /** A cell folded to its header strip. */
  | 'afterCollapse'
  /** A cell opened back to its previous size. */
  | 'afterExpand'
  /** A cell is about to be added; cancellable. */
  | 'beforeAddCell'
  /** A cell was added, already in the document and sized. */
  | 'afterAddCell'
  /** A cell is about to be removed; cancellable. */
  | 'beforeRemoveCell'
  /** A cell (and its subtree) was removed, its content released. */
  | 'afterRemoveCell'
  /** A cell is about to be hidden; cancellable. */
  | 'beforeHide'
  /** A cell hid, giving its space to its neighbours. */
  | 'afterHide'
  /** A cell is about to be shown; cancellable. */
  | 'beforeShow'
  /** A cell showed, restoring its space. */
  | 'afterShow'
  /** A tabbed cell's active tab changed. */
  | 'tabChange'
  /** `stateChange`: `setState()` applied a snapshot and the arrangement now matches it. */
  | 'stateChange'
  /** A pointer or keyboard resize gesture is about to begin; cancel it to keep the two cells' sizes. */
  | 'beforeResizeStart'
  /** The two cells' sizes changed during a drag, or after an arrow/Home/End key. */
  | 'resize'
  /** A resize gesture ended; the two cells hold their final sizes. */
  | 'afterResizeEnd';

/** What a handler receives, per shell event. */
export interface ShellEventPayloads {
  /** The fold about to happen, with `preventDefault` to refuse it. */
  beforeCollapse: ShellBeforeToggleEvent;
  /** The unfold about to happen, with `preventDefault` to refuse it. */
  beforeExpand: ShellBeforeToggleEvent;
  /** The fold that happened. */
  afterCollapse: ShellAfterToggleEvent;
  /** The unfold that happened. */
  afterExpand: ShellAfterToggleEvent;
  /** The cell about to be added, with `preventDefault` to refuse it. */
  beforeAddCell: ShellBeforeAddCellEvent;
  /** The cell that was just added. */
  afterAddCell: ShellAfterAddCellEvent;
  /** The cell about to be removed, with `preventDefault` to refuse it. */
  beforeRemoveCell: ShellBeforeRemoveCellEvent;
  /** The cell that was just removed. */
  afterRemoveCell: ShellAfterRemoveCellEvent;
  /** The cell about to be hidden, with `preventDefault` to refuse it. */
  beforeHide: ShellBeforeHideEvent;
  /** The cell that just hid. */
  afterHide: ShellAfterHideEvent;
  /** The cell about to be shown, with `preventDefault` to refuse it. */
  beforeShow: ShellBeforeShowEvent;
  /** The cell that just showed. */
  afterShow: ShellAfterShowEvent;
  /** Which tab became active, and which it replaced. */
  tabChange: ShellTabChangeEvent;
  /** The `stateChange` payload: the state now live, the shape `getState()` returns. */
  stateChange: ShellStateChangeEvent;
  /** The two cells about to resize, and their current sizes. */
  'beforeResizeStart': ShellResizeStartEvent;
  /** The two cells, and their new sizes. */
  'resize': ShellResizeEvent;
  /** The two cells, and their final sizes. */
  'afterResizeEnd': ShellResizeEvent;
}

/** The fields every shell event carries. */
export interface ShellCellEvent {
  /** Which event this is: one of the `ShellEventName` names. */
  type: string;
  /** The id of the cell the event is about. */
  id: string;
  /** Who asked for the change: `user` for the header control, `api` for `collapse()`/`expand()`/`toggle()`. */
  origin: ViewerOrigin;
}

/**
 * A `beforeCollapse` or `beforeExpand` payload. A handler refuses the change
 * by calling `preventDefault(reason?)` or returning `false` (or a Promise
 * that resolves `false`); the cell then does not move.
 */
export interface ShellBeforeToggleEvent extends ShellCellEvent {
  /** Refuse the change; the optional reason is surfaced to the caller. */
  preventDefault(reason?: string): void;
  /** True once a handler has refused the change. */
  defaultPrevented: boolean;
  /** The reason given to `preventDefault`, or null while nothing has refused. */
  reason: string | null;
}

/** An `afterCollapse` or `afterExpand` payload — a notification, not a gate. */
export interface ShellAfterToggleEvent extends ShellCellEvent {
  /** The cell is now collapsed (`afterCollapse`) or expanded (`afterExpand`). */
  collapsed: boolean;
}

/** The payload of a `beforeAddCell` event. */
export interface ShellBeforeAddCellEvent {
  /** Which event this is: `beforeAddCell`. */
  type: string;
  /** The id the new cell will have. */
  id: string;
  /** The id of the cell it will be added into, or `null` for the shell root. */
  parentId: string | null;
  /** The index the new cell will take among its siblings. */
  index: number;
  /** The reason given to `preventDefault`, or `null` while nothing has refused the add. */
  reason: string | null;
  /** True once a handler has refused the add. */
  defaultPrevented: boolean;
  /** Refuse the add; the cell is then not created. */
  preventDefault(reason?: string): void;
}

/** The payload of an `afterAddCell` event. */
export interface ShellAfterAddCellEvent {
  /** Which event this is: `afterAddCell`. */
  type: string;
  /** The id of the cell that was added. */
  id: string;
  /** The id of the cell it was added into, or `null` for the shell root. */
  parentId: string | null;
  /** The index the cell took among its siblings. */
  index: number;
}

/** The payload of a `beforeRemoveCell` event. */
export interface ShellBeforeRemoveCellEvent {
  /** Which event this is: `beforeRemoveCell`. */
  type: string;
  /** The id of the cell about to be removed. */
  id: string;
  /** The id of the cell that owns it, or `null` for a top-level cell. */
  parentId: string | null;
  /** The reason given to `preventDefault`, or `null` while nothing has refused the remove. */
  reason: string | null;
  /** True once a handler has refused the remove. */
  defaultPrevented: boolean;
  /** Refuse the remove; the cell then stays mounted. */
  preventDefault(reason?: string): void;
}

/** The payload of an `afterRemoveCell` event. */
export interface ShellAfterRemoveCellEvent {
  /** Which event this is: `afterRemoveCell`. */
  type: string;
  /** The id of the cell that was removed. */
  id: string;
  /** The id of the cell that owned it, or `null` for a top-level cell. */
  parentId: string | null;
}

/** The payload of a `beforeHide` event. */
export interface ShellBeforeHideEvent {
  /** Which event this is: `beforeHide`. */
  type: string;
  /** The id of the cell about to be hidden. */
  cellId: string;
  /** The reason given to `preventDefault`, or `null` while nothing has refused the hide. */
  reason: string | null;
  /** True once a handler has refused the hide. */
  defaultPrevented: boolean;
  /** Refuse the hide; the cell then stays visible. */
  preventDefault(reason?: string): void;
}

/** The payload of an `afterHide` event. */
export interface ShellAfterHideEvent {
  /** Which event this is: `afterHide`. */
  type: string;
  /** The id of the cell that just hid. */
  cellId: string;
}

/** The payload of a `beforeShow` event. */
export interface ShellBeforeShowEvent {
  /** Which event this is: `beforeShow`. */
  type: string;
  /** The id of the cell about to be shown. */
  cellId: string;
  /** The reason given to `preventDefault`, or `null` while nothing has refused the show. */
  reason: string | null;
  /** True once a handler has refused the show. */
  defaultPrevented: boolean;
  /** Refuse the show; the cell then stays hidden. */
  preventDefault(reason?: string): void;
}

/** The payload of an `afterShow` event. */
export interface ShellAfterShowEvent {
  /** Which event this is: `afterShow`. */
  type: string;
  /** The id of the cell that just showed. */
  cellId: string;
}

/** The payload of a `tabChange` event. */
export interface ShellTabChangeEvent {
  /** The id of the cell whose tab changed. */
  cellId: string;
  /** The id of the now-active tab. */
  tabId: string;
  /** The id of the previously-active tab, or `null` on the first switch. */
  previousTabId: string | null;
}

/** The JSON-able snapshot `getState()` returns and `setState()` accepts. */
export interface ShellState {
  /** The state-format version; currently `1`. */
  version: number;
  /** The separator between cells. */
  type: ShellType;
  /** The shell root's inner padding. */
  padding?: number | string;
  /** Extra CSS on the shell root. */
  css?: Record<string, string | number> | string;
  /** The top-level cells laid out top-to-bottom, each carrying its sizes, gravity and mutable state. */
  rows?: ShellCell[];
  /** The top-level cells laid out left-to-right (used when `rows` is absent). */
  cols?: ShellCell[];
}

/**
 * `stateChange`: `setState()` applied a snapshot and the arrangement now
 * matches it. A notification, so it carries no `preventDefault`.
 */
export interface ShellStateChangeEvent {
  /** Which event this is: `stateChange`. */
  type: string;
  /** The state now live — the same shape `getState()` returns. */
  state: ShellState;
}

/** The members every cancellable shell before-event carries. */
export interface ShellBeforeEvent {
  /** The event's own name. */
  type: string;
  /** Where the action came from. */
  origin: EventOrigin;
  /** Cancel the pending resize; the reason is surfaced on the event's `reason`. */
  preventDefault(reason?: string): void;
  /** True once any handler has cancelled the resize. */
  readonly defaultPrevented: boolean;
  /** The first reason given to `preventDefault`, or null. */
  readonly reason: string | null;
}

/** The two neighbouring cells a splitter resize affects, plus their sizes. */
export interface ShellResizeEvent {
  /** The layout axis being resized: `'rows'` resizes heights, `'cols'` resizes widths. */
  axis: 'rows' | 'cols';
  /** The two cells' ids, in axis order (the `resizable` cell first). */
  cells: [string, string];
  /** Each cell's main-axis size in pixels, in the same order as `cells`. */
  sizes: [number, number];
}

/** `beforeResizeStart`: a resize gesture is about to begin; cancel it to keep the sizes. */
export interface ShellResizeStartEvent extends ShellResizeEvent, ShellBeforeEvent {}

/** The shell instance {@link createShell} returns. */
export interface Shell {
  /** The host element. */
  readonly el: HTMLElement | null;
  /** The normalised config. */
  readonly config: ShellConfig;
  /** The cell handle for an id, or `undefined` when no cell has that id. */
  getCell(id: string): ShellCellInstance | undefined;
  /** Walk every cell in tree order, handing each handle to `fn`. */
  forEach(fn: (cell: ShellCellInstance) => void): void;
  /** Snapshot the arrangement as JSON: sizes, gravity, and every cell's mutable state. */
  getState(): ShellState;
  /** Apply a snapshot, preserving the content mounted into each cell; fires `stateChange`. */
  setState(state: ShellState): void;
  /**
   * Add a cell to the tree live, synchronously — its element is in the
   * document and sized when this returns. `parentId` is the cell to add into
   * (or `null`/`undefined` for the shell root; a leaf or tabbed cell is
   * refused), and `index` is where among the parent's children (the end when
   * omitted). The cancellable `beforeAddCell` runs first, then `afterAddCell`.
   */
  addCell(parentId: string | null | undefined, config?: ShellCell, index?: number): ShellCellInstance | undefined;
  /**
   * Remove a cell and its subtree from the tree live, releasing every piece of
   * content inside it (detached, never destroyed). The cancellable
   * `beforeRemoveCell` runs first, then `afterRemoveCell`.
   */
  removeCell(id: string): ShellCellInstance | undefined;
  /** Subscribe to a shell event or to `'*'` for every event; returns an unsubscribe. */
  on(name: ShellEventName | '*', fn: (event: ShellEventPayloads[ShellEventName]) => void): () => void;
  /** Remove a handler registered with {@link Shell#on}. */
  off(name: ShellEventName | '*', fn: (event: ShellEventPayloads[ShellEventName]) => void): void;
  /** Empty the element and drop every cell record, splitter listener and handler. */
  destroy(): void;
}

/** The edge a drawer slides in from. */
export type ShellOverlaySide = 'right' | 'left' | 'top' | 'bottom';

/** One dialog action button: its label and the value a click resolves `closed` with. */
export interface ShellDialogAction {
  /** The button's text. */
  label: string;
  /** The value `closed` resolves with when this button is clicked. */
  value?: unknown;
}

/** The options `createDrawer(config)` takes. */
export interface ShellDrawerConfig {
  /** The edge the drawer slides from. Default `'right'`. */
  side?: ShellOverlaySide;
  /** The panel's width (left/right) or height (top/bottom): px, %, or `'content'` to fit the content with a max. */
  size?: ShellSize;
  /** The drawer's content: a Lattice view, a DOM element, or an HTML string. */
  content?: ShellContent;
  /** The header title; names the overlay for `aria-labelledby`. */
  title?: string | Node;
  /** Extra buttons in the header strip, beside the title. */
  headerActions?: ShellHeaderAction[];
  /** Extra CSS on the header strip only. */
  headerCss?: Record<string, string | number> | string;
  /** Trap focus inside and lock body scroll while open. */
  modal?: boolean;
  /** Close on Escape when this drawer is the top overlay. Default true. */
  closeOnEscape?: boolean;
  /** Close on a backdrop click when this drawer is the top overlay. Default true. */
  closeOnBackdrop?: boolean;
}

/** The options `createDialog(config)` takes. */
export interface ShellDialogConfig {
  /** The title shown above the content; names the overlay for `aria-labelledby`. */
  title?: string | Node;
  /** The dialog's content: a Lattice view, a DOM element, or an HTML string. */
  content?: ShellContent;
  /** Footer buttons; a click closes the dialog and resolves `closed` with the action's `value`. */
  actions?: ShellDialogAction[];
  /** The panel width: px, %, or `'content'` to fit the content with a max. */
  size?: ShellSize;
  /** Trap focus inside and lock body scroll while open. */
  modal?: boolean;
}

/** The handle `createDrawer`/`createDialog` return: the overlay element, the body cell, and the open/close/result surface. */
export interface ShellOverlay {
  /** The overlay's root element (`role="dialog"`). */
  el: HTMLElement;
  /** The single shell cell the overlay's content mounts into. */
  cell: ShellCellInstance;
  /** Resolves once the shell is laid out (at once, like `createShell`); rejects if the overlay closes first. */
  ready: Promise<void>;
  /** Append the overlay to the page and reveal it. */
  open(): ShellOverlay;
  /** Close the overlay; `closed` resolves with `result` once it is gone. */
  close(result?: unknown): ShellOverlay;
  /** Resolves when the overlay finishes closing, with the value passed to `close` (or the action's `value`). */
  closed: Promise<unknown>;
}

/** Create a shell inside an element: cells nested as rows and columns, sized by flexbox. */
export function createShell(el: HTMLElement, config?: ShellConfig): Shell;
/** Create a drawer overlay: a shell cell sliding in from one edge. */
export function createDrawer(config?: ShellDrawerConfig): ShellOverlay;
/** Create a dialog overlay: a centred shell cell with a title and action buttons. */
export function createDialog(config?: ShellDialogConfig): ShellOverlay;
export default createShell;
