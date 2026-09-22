/*!
 * Lattice Grid 1.68.2, kanban module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/** A row backing a card: any object. Its column comes from `columnProperty` and its identity from `rowKey`. */
type KanbanRow = Record<string, unknown>;

/**
 * A card model — one row as it appears on the board. `fields` holds the
 * resolved display text for each mapped card field; `columnId` is the column
 * the card sits in; `points` is the numeric points value (0 when absent).
 * `swimlane`/`sprint`/`epic`/`order` are read from their configured properties
 * and carried for the later cycles that render them.
 */
interface KanbanCard {
  /** The card's identity, from the board's `rowKey`. */
  key: unknown;
  /**
   * The row behind the card. On a grid-bound board this is the materialised object the
   * board read off the grid, not the grid's own row.
   */
  row: KanbanRow;
  /**
   * Which column the card sits in — the stringified group value — or null when the row's
   * group value is null or undefined, which leaves the card unplaced.
   */
  columnId: string | null;
  /**
   * The card's estimate, from `pointsProperty`. Zero when there is no points property or
   * the value is not a finite number.
   */
  points: number;
  /**
   * Whether the points value was a finite number. A card without points contributes
   * nothing to a column's sum.
   */
  hasPoints: boolean;
  /**
   * The raw value of `orderProperty`, which ranks the card inside its column. Undefined
   * when no order property is configured.
   */
  order?: unknown;
  /**
   * The raw value of `swimlaneProperty`, the lane the card belongs to. Undefined when no
   * swimlane property is configured.
   */
  swimlane?: unknown;
  /**
   * The raw value of `sprintProperty`, used by the sprint selection. Undefined when no
   * sprint property is configured.
   */
  sprint?: unknown;
  /**
   * The raw value of `epicProperty`, used by the epic selection. Undefined when no epic
   * property is configured.
   */
  epic?: unknown;
  /**
   * The card template's text, one entry per `card` mapping. A mapping that names a grid
   * column is read through that column's own formatter, so it reads exactly as the cell
   * does; anything missing is ''.
   */
  fields: Record<string, string>;
}

/** A column with its cards and aggregates. `over` is true when `count` exceeds `wipLimit`. */
interface KanbanColumn {
  /**
   * The column's identity — a configured column's `id`, or the stringified group value a
   * data-driven column came from.
   */
  id: string;
  /** The heading shown above the column. Defaults to the id, humanised. */
  title: string;
  /**
   * The accent colour drawn as a dot in the header, as configured. Null when the column
   * def set none.
   */
  color: string | null;
  /**
   * The work-in-progress limit for this column, or null when it has none. Advisory unless
   * `enforceWip` is on.
   */
  wipLimit: number | null;
  /**
   * Whether the column is currently collapsed to a strip — either configured so, or
   * collapsed by the user.
   */
  collapsed: boolean;
  /**
   * The column's cards that survive the board's filters, in arrival order, re-sorted by
   * `orderProperty` when one is configured.
   */
  cards: KanbanCard[];
  /** How many cards the column holds — the length of `cards`, after filtering. */
  count: number;
  /** The sum of the column's card points; cards without a finite points value add nothing. */
  points: number;
  /**
   * True when the column has a WIP limit and its count exceeds it. The header shows this
   * whether or not `enforceWip` refuses the move.
   */
  over: boolean;
}

/** A column definition: an id string, or an object configuring one column. */
type KanbanColumnDef = string | {
  id: string;
  title?: string;
  color?: string;
  wipLimit?: number;
  collapsed?: boolean;
  /**
   * A per-column SLA override: a lone threshold read as the
   * breach level, or a `{ warn, breach }` pair. Overrides the global `sla`
   * thresholds for cards in this column (precedence: lane → column → global).
   */
  sla?: KanbanSlaThreshold | { warn?: KanbanSlaThreshold; breach?: KanbanSlaThreshold };
  /** A per-column warn threshold — the shorthand for `sla: { warn }`. */
  slaWarn?: KanbanSlaThreshold;
  /** A per-column breach threshold — the shorthand for `sla: { breach }`. */
  slaBreach?: KanbanSlaThreshold;
};

/** A card field editor handle returned by a host editor factory. */
interface KanbanEditor {
  /** The editor's element. The board appends it to the card being edited. */
  el: HTMLElement;
  /**
   * Called straight after the editor is appended, to put the caret where it belongs.
   * Without it the board focuses `el` itself.
   */
  focus?: () => void;
  /**
   * Called when the edit commits or is cancelled, so the editor can release what it
   * holds. Optional.
   */
  destroy?: () => void;
}

/** A card field mapping: a property path, a function, or an object opting into inline edit. */
type KanbanFieldMap = string | ((row: KanbanRow) => unknown) | {
  field: string;
  edit?: boolean;
  editor?: (ctx: { card: KanbanCard; field: string; value: string; commit: (value: unknown) => void; cancel: () => void }) => KanbanEditor;
};

/** The field-to-property mapping that drives the card template. */
interface KanbanCardMap {
  /** The card's headline text. */
  title?: KanbanFieldMap;
  /** A second line under the title. */
  subtitle?: KanbanFieldMap;
  /** A comma-separated string rendered as one chip per label; blanks are skipped. */
  labels?: KanbanFieldMap;
  /** The person shown first in the card's meta row. */
  assignee?: KanbanFieldMap;
  /** The due date, shown in the meta row as whatever text the mapping produces. */
  due?: KanbanFieldMap;
  /** An image URL drawn as a cover band across the top of the card. */
  cover?: KanbanFieldMap;
  /**
   * A progress bar over the card. The value is read as a percentage (0-100); a value that
   * is not a number draws no bar.
   */
  progress?: KanbanFieldMap;
  /** A single badge chip at the end of the meta row. */
  badges?: KanbanFieldMap;
  /**
   * A colour for the card's left border. Any CSS colour; an empty value leaves the border
   * plain.
   */
  accent?: KanbanFieldMap;
  /**
   * Any other card slot the board's theme declares, mapped the same way as the named
   * ones above. `undefined` is the honest value for a slot that is left unmapped.
   */
  [field: string]: KanbanFieldMap | undefined;
}

/** Granular readonly: the whole board, or selectively by column id and card key. */
type KanbanReadonly = boolean | {
  board?: boolean;
  columns?: Record<string, boolean>;
  cards?: Record<string, boolean>;
};

/**
 * The payload of the three card pointer events — `card:click`, `card:dblclick`
 * and `card:contextmenu`. The board's other events carry their own shapes;
 * {@link KanbanEventPayloads} names one per event.
 */
interface KanbanEvent {
  /** The card the event is about. */
  card: KanbanCard;
  /** The id of the column the card is in, or null when it is unplaced. */
  column: string | null;
  /**
   * The card's element, for a host that wants to anchor a popover to it. Absent on a
   * headless board.
   */
  el?: unknown;
  /**
   * The DOM event that caused this one, so a host can read modifier keys or call
   * `preventDefault`.
   */
  originalEvent?: unknown;
}

/**
 * A card-aging / SLA threshold: a raw millisecond count, or
 * a `{ weeks, days, hours, minutes, seconds, ms }` spec whose fields are summed
 * (`{ days: 3, hours: 12 }` → 3.5 days). A negative or non-finite value means
 * "no threshold at this level".
 */
type KanbanSlaThreshold = number | {
  weeks?: number; week?: number; w?: number;
  days?: number; day?: number; d?: number;
  hours?: number; hour?: number; h?: number;
  minutes?: number; minute?: number; m?: number; min?: number;
  seconds?: number; second?: number; s?: number; sec?: number;
  ms?: number; milliseconds?: number;
};

/**
 * Card-aging / SLA configuration. A card is measured against a
 * `warn` and a `breach` threshold; the view puts an age chip on aged cards and a
 * highlight on breached ones, and a rising crossing fires the `card:sla` event
 * and the matching `onWarn`/`onBreach` callback (signature `(level, rows)`, the
 * Data Router alert handler's). Thresholds resolve most-specific-first:
 * lane → column → global. Reached at runtime as {@link Kanban#sla}.
 */
interface KanbanSlaConfig {
  /** The global warn threshold. */
  warn?: KanbanSlaThreshold;
  /** The global breach threshold. */
  breach?: KanbanSlaThreshold;
  /** Per-column overrides by column id (each a threshold or a `{ warn, breach }` pair). */
  columns?: Record<string, KanbanSlaThreshold | { warn?: KanbanSlaThreshold; breach?: KanbanSlaThreshold }>;
  /** Per-swimlane overrides by lane id (each a threshold or a `{ warn, breach }` pair). */
  lanes?: Record<string, KanbanSlaThreshold | { warn?: KanbanSlaThreshold; breach?: KanbanSlaThreshold }>;
  /**
   * Where the ageing clock starts: `'column'` (default) measures time in the
   * card's current column; `'board'` measures age since the card arrived/was
   * created.
   */
  basis?: 'column' | 'board';
  /** A row property holding the wall-clock time the card entered its column. */
  enteredProperty?: string;
  /** A row property holding the wall-clock time the card was created. */
  createdProperty?: string;
  /** Whether cards in a done column are exempt from ageing (default true). */
  ignoreDone?: boolean;
  /** Whether the flow transition log drives the ageing basis when present (default true). */
  useTransitionLog?: boolean;
  /** Show the age chip on every aged card (`'always'`), or only on warn/breach (`'threshold'`, default). */
  showAge?: 'always' | 'threshold';
  /** A wall-clock epoch clock, injectable for deterministic tests (default `Date.now`). */
  now?: () => number;
  /** A re-check interval in ms so a card breaching by sitting still still lights up (0 = off). */
  tick?: number;
  /** Called on a rising crossing to warn level, `(level, rows)` — the router alert handler's shape. */
  onWarn?: (level: 'warn' | 'breach', rows: KanbanRow[]) => void;
  /** Called on a rising crossing to breach level, `(level, rows)` — the router alert handler's shape. */
  onBreach?: (level: 'warn' | 'breach', rows: KanbanRow[]) => void;
}

/** The computed SLA state of one card. */
interface KanbanSlaState {
  /** The card this ageing state belongs to. */
  key: unknown;
  /**
   * The column the card was in when it was aged — the thresholds are looked up per
   * column.
   */
  columnId: string | null;
  /**
   * The card's swimlane value, for a per-lane threshold. Undefined on a board without
   * swimlanes.
   */
  lane?: unknown;
  /** The ageing-clock start epoch (ms), or null when no time source could be resolved. */
  start: number | null;
  /** The card's age in ms, or null when unknown. */
  ageMs: number | null;
  /** A short human age label (`2d`, `5h`, …), '' when unknown. */
  ageText: string;
  /** The resolved warn threshold in ms, or null. */
  warnMs: number | null;
  /** The resolved breach threshold in ms, or null. */
  breachMs: number | null;
  /** The classified level, or null when the card cannot be aged. */
  level: 'ok' | 'warn' | 'breach' | null;
  /** True when `level` is `'breach'`. */
  breached: boolean;
}

/**
 * The card-aging / SLA monitor, reached as {@link Kanban#sla}
 * when a `sla` config is supplied. Pure and DOM-free: it computes each card's
 * ageing state from the board's card model and the flow transition log, and the
 * view paints it.
 */
interface KanbanSla {
  /** The normalised SLA config (read-only). */
  readonly config: object;
  /** Recompute every card's SLA state without emitting anything. */
  sync(): KanbanSla;
  /** Recompute and fire `card:sla`/`onWarn`/`onBreach` on each rising crossing. */
  evaluate(opts?: { emit?: boolean }): KanbanSlaState[];
  /** Establish the baseline, notify on the current state, and start the optional tick. */
  start(): KanbanSla;
  /** The SLA state of one card (by card model or key), or null when unknown. */
  stateFor(cardOrKey: KanbanCard | unknown): KanbanSlaState | null;
  /** Every card's current SLA state. */
  states(): KanbanSlaState[];
  /** The cards currently at breach level. */
  breaches(): KanbanSlaState[];
  /** The cards currently at warn level (not yet breached). */
  warnings(): KanbanSlaState[];
  /** Stop the tick and drop the board subscriptions. */
  destroy(): void;
}

/**
 * Kanban configuration. Every structural property is named here so the same
 * board maps DemandFlow (a status field, `points`, `sprint`, `epic`, a
 * swimlane property) and any customer schema without code change.
 */
interface KanbanConfig {
  /** The source rows, one per card. Use this or `grid`, not both — `rows` wins. */
  rows?: KanbanRow[];
  /**
   * A Lattice grid to bind to instead of `rows`: the board reads the grid's displayed
   * rows through its own value pipeline and writes moves back through it. On a bound
   * board `rows.apply` and `setRows` are ignored with a warning.
   */
  grid?: unknown;
  /**
   * Card identity (a field or fn, returning a string or number); default
   * 'id'. Composite (`string[]`) keys are core-grid-only: a board keys its
   * own card identity from one value, so there is nothing for an array to
   * join into here.
   */
  rowKey?: string | ((row: KanbanRow) => string | number);
  /**
   * The row property whose value puts a card in a column. Without it (and without `grid`
   * or `columns`) the board warns and shows nothing.
   */
  columnProperty?: string;
  /**
   * The columns to show, as ids or `{ id, title, color, wipLimit, collapsed, done }`.
   * Configured columns appear even when empty; a group value outside them still gets a
   * column of its own, appended, so no card is dropped.
   */
  columns?: KanbanColumnDef[];
  /**
   * Pins the leading column order by id; anything not named keeps its natural position
   * after the pinned ones. A user reorder replaces this.
   */
  columnOrder?: string[];
  /** The row property summed into each column header's points figure. */
  pointsProperty?: string;
  /**
   * Show the points sum in each column and lane header (default false). It needs
   * `pointsProperty` too.
   */
  showPoints?: boolean;
  /**
   * The row property that ranks cards within a column. Set it to make dropping a card at
   * a position meaningful: a move then writes a new order value. Without it cards stay in
   * arrival order.
   */
  orderProperty?: string;
  /**
   * The row property that puts a card in a swimlane. Naming it does not switch on the
   * lane layout — set `swimlanes` for that — but it does let a cross-lane drop write the
   * lane back.
   */
  swimlaneProperty?: string;
  /** Render the 2D swimlane layout using `swimlaneProperty` (default false). */
  swimlanes?: boolean;
  /** Explicit lane definitions; otherwise lanes come from the distinct swimlane values. */
  lanes?: (string | { id: string; title?: string })[];
  /** An explicit lane order by id (also set by a lane-header-drag reorder). */
  laneOrder?: string[];
  /** Enforce `wipLimit` as a hard gate: a move that would exceed it is refused (default false). */
  enforceWip?: boolean;
  /** A custom card template: return an HTML string or a DOM node to own the whole card body. */
  cardRenderer?: (card: KanbanCard, ctx: { column: KanbanColumn; readonly: boolean; el: HTMLElement; doc: Document }) => string | Node | void;
  /**
   * The row property holding a card's sprint, which `setSprint` and the sprint selection
   * filter on.
   */
  sprintProperty?: string;
  /**
   * The row property holding a card's epic, which `setEpic` and the epic selection filter
   * on.
   */
  epicProperty?: string;
  /** A configurable sprint dataset: the canonical sprint list (order + titles), shown even when empty. */
  sprints?: (string | { id: unknown; title?: string })[];
  /** The initially selected sprint id, `Kanban.BACKLOG`, or undefined for all. */
  sprint?: unknown;
  /** The initially selected epic id, or undefined for all. */
  epic?: unknown;
  /** Column ids that count as "done" for a rollup's progress (also a column def's `done: true`). */
  doneColumns?: string[];
  /** Card pop-out: a nested child grid or board (master-detail by composition). */
  children?: KanbanChildren;
  /** Card virtualization for tall columns: true, or `{ rowHeight, overscan, threshold, viewport }`. */
  virtualize?: boolean | { rowHeight?: number; overscan?: number; threshold?: number; viewport?: number };
  /**
   * Card aging / SLA highlighting: warn/breach thresholds
   * (globally, per column and/or per lane) that age each card and fire
   * `card:sla` on a rising crossing. Opt-in; reached at runtime as
   * {@link Kanban#sla}. See {@link KanbanSlaConfig}.
   */
  sla?: KanbanSlaConfig;
  /** A saved board state (from `getState`) to restore on construction. */
  state?: object;
  /** Show a per-column add-card affordance. */
  addCard?: boolean;
  /** Persist a standalone inline edit; return false or a rejected promise to revert. */
  onCardEdit?: (event: { card: KanbanCard; key: unknown; field: string; fieldPath: string; value: unknown }) => boolean | void | Promise<boolean | void>;
  /**
   * Create a card for a column on add-card; return the row to create (with
   * its key), a Promise of that row, or nothing to auto-generate. A rejected
   * Promise creates no card and leaves the board unchanged.
   */
  onAddCard?: (columnId: string) => KanbanRow | Promise<KanbanRow> | void;
  /** A predicate filter over cards; only matching cards are shown. */
  filter?: (row: KanbanRow, card: KanbanCard) => boolean;
  /** Quick-filter text matched case-insensitively across card fields. */
  quickFilter?: string;
  /**
   * Maps the card template's slots — title, subtitle, labels, assignee, due, cover,
   * progress, badges, accent — to row properties, and opts a slot into inline edit. Any
   * other name is carried as an extra field on `KanbanCard.fields`.
   */
  card?: KanbanCardMap;
  /**
   * Blocks edits and moves: `true` for the whole board, or a map singling out columns and
   * cards by id and key. Default false.
   */
  readonly?: KanbanReadonly;
  /** The board's accessible name. Defaults to `Board`. */
  ariaLabel?: string;
  /**
   * The placeholder shown in a column with no cards. Empty by default, so the module
   * ships no English of its own.
   */
  emptyText?: string;
  /** Whether card selection is enabled (default true). */
  selectable?: boolean;
  /** Host-localised words for the move announcements (grabbed/moved/dropped/reverted/cancelled). */
  labels?: Record<string, string>;
  /**
   * Veto/confirm a move before any write. Return `false` (or a promise of it)
   * to refuse; `from`/`to` are column ids, `index` the target position.
   */
  onBeforeMove?: (card: KanbanCard, from: string | null, to: string, index: number | null) => boolean | Promise<boolean>;
  /**
   * Persist a move on a standalone (non-grid) board. Return `false` or a
   * rejected promise to revert the optimistic move. On a grid-bound board the
   * grid's write-back pipeline persists instead and this is not called.
   */
  onCardMove?: (event: KanbanMoveEvent) => boolean | void | Promise<boolean | void>;
  /** A per-card context menu: items, or `fn(card, selectedCards)` returning items. Suppresses `card:contextmenu`. */
  contextMenu?: KanbanMenuItem[] | ((card: KanbanCard, selected: KanbanCard[]) => KanbanMenuItem[]);
  /**
   * Called when a card is clicked, with the same payload as the `card:click` event. Both
   * fire: this does not replace a registered handler.
   */
  onCardClick?: (event: KanbanEvent) => void;
  /** Called when a card is double-clicked, alongside the `card:dblclick` event. */
  onCardDblClick?: (event: KanbanEvent) => void;
  /**
   * Called on a card's context-menu gesture, alongside the `card:contextmenu` event. A
   * configured `contextMenu` suppresses both.
   */
  onCardContextMenu?: (event: KanbanEvent) => void;
}

/**
 * Card pop-out configuration. The child view is a full composed grid (via
 * `factory`, a `createGrid`), a nested board (`asBoard`), or a custom `render`.
 * The child set is the rows whose `property` equals the card key, or the
 * `load(card)` result. Recursion falls out: a nested board can pop its own
 * children.
 */
interface KanbanChildren {
  /** Parent-id property linking child rows to a card within the same dataset. */
  property?: string;
  /** Per-card child rows, sync or async — an alternative (or addition) to `property`. */
  load?: (card: KanbanCard) => KanbanRow[] | Promise<KanbanRow[]>;
  /** Whether a card can be expanded, overriding the property/load inference. */
  hasChildren?: (card: KanbanCard) => boolean;
  /** Where the pop-out appears (default `drawer`). */
  present?: 'drawer' | 'modal' | 'inline';
  /** The grid factory (a `createGrid`) that builds the child grid. */
  factory?: (container: HTMLElement, options: object) => { destroy?: () => void };
  /** Make the child a nested board (recursive) instead of a grid. */
  asBoard?: boolean;
  /** Options for the child grid/board — an object or `fn(card)`. */
  gridOptions?: object | ((card: KanbanCard) => object);
  /** Fully custom child render; returns a cleanup function. */
  render?: (container: HTMLElement, ctx: { card: KanbanCard; rows: KanbanRow[]; board: Kanban; depth: number }) => (void | (() => void));
  /** The pop-out title (default the card title). */
  title?: (card: KanbanCard) => string;
}

/** One context-menu item. `action` receives the card, the selected cards, and the board. */
interface KanbanMenuItem {
  /** The item's text in the menu. */
  label: string;
  /**
   * Runs when the item is chosen, with the clicked card, the selected cards (the clicked
   * one when nothing is selected) and the board. Not called on a disabled item.
   */
  action?: (ctx: { card: KanbanCard; cards: KanbanCard[]; board: Kanban }) => void;
  /** Greys the item out and ignores clicks on it. */
  disabled?: boolean;
}

/** The payload of a `card:move` (and `card:reverted`) event. */
interface KanbanMoveEvent {
  /** The keys of the cards that actually moved — the ones no `beforeMove` veto refused. */
  keys: unknown[];
  /** The moved cards, in the same order as `keys`. */
  cards: KanbanCard[];
  /** Where each card came from, one column id (or null for unplaced) per moved card. */
  from: (string | null)[];
  /** The column the cards landed in. */
  to: string;
  /** The position asked for within the target column, or null for the end. */
  index: number | null;
  /**
   * The new order values written to `orderProperty`, one per moved card — computed to sit
   * between the neighbours at the drop point. Null when no order property is configured.
   */
  orders: number[] | null;
  /** Where the move came from: `'user'` for a drag or keyboard move, `'ai'` for an approved AI proposal, `'api'` for `board.move`. */
  origin: 'user' | 'api' | 'init' | 'ai';
  /** The swimlane the cards were moved to, when the gesture named one and a swimlane property is configured. */
  lane?: unknown;
}

/** The members every cancellable board before-event carries. */
interface KanbanBeforeEvent {
  /** The event's own name. */
  type: string;
  /** Where the action came from. */
  origin: 'user' | 'api' | 'init' | 'ai';
  /** Cancel the pending action; the reason is surfaced on the matching `<action>:cancelled`. */
  preventDefault(reason?: string): void;
  /** True once any handler has cancelled it. */
  readonly defaultPrevented: boolean;
  /** The first reason given to `preventDefault`, or null. */
  readonly reason: string | null;
}

/** `card:edit` and `beforeEdit`: one field of one card. */
interface KanbanCardEditEvent {
  /** The card being edited. */
  card: KanbanCard;
  /** That card's key. */
  key: unknown;
  /** The card-spec name of the field. */
  field: string;
  /** The row property the field writes to. */
  fieldPath: string;
  /** The value being written. */
  value: unknown;
  /** Where the edit came from. */
  origin: 'user' | 'api' | 'init' | 'ai';
}

/** `beforeEdit`: an inline card edit is about to be written. */
interface KanbanBeforeEditEvent extends KanbanBeforeEvent {
  /** The card being edited. */
  card: KanbanCard;
  /** That card's key. */
  key: unknown;
  /** The card-spec name of the field. */
  field: string;
  /** The row property the field writes to. */
  fieldPath: string;
  /** The value that would be written. */
  value: unknown;
}

/** `edit:cancelled`: a `beforeEdit` handler refused the write. */
interface KanbanEditCancelledEvent extends KanbanCardEditEvent {
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `card:add`: a card was appended to a column. */
interface KanbanCardAddEvent {
  /** The column it was added to. */
  column: string;
  /** The new card's key — the grid's temporary key on a grid-bound board until the server confirms it. */
  key: unknown;
}

/** `beforeAdd`: a card is about to be appended. */
interface KanbanBeforeAddEvent extends KanbanBeforeEvent {
  /** The column it would be added to. */
  column: string;
  /** The seed values the new row would be built from. */
  seed: Record<string, unknown>;
}

/** `add:cancelled`: a `beforeAdd` handler refused the append. */
interface KanbanAddCancelledEvent {
  /** The column the card was not added to. */
  column: string;
  /** The seed values that were not written. */
  seed: Record<string, unknown>;
  /** Where the append came from. */
  origin: 'user' | 'api' | 'init' | 'ai';
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `beforeMove`: one card of a move is about to be applied; raised once per card. */
interface KanbanBeforeMoveEvent extends KanbanBeforeEvent {
  /** The card being moved. */
  card: KanbanCard;
  /** That card's key. */
  key: unknown;
  /** The column it is in, or null when it is unplaced. */
  from: string | null;
  /** The column it would land in. */
  to: string;
  /** The position asked for within that column, or null for the end. */
  index: number | null;
}

/** `move:cancelled`: a `beforeMove` handler refused one card of a move. */
interface KanbanMoveCancelledEvent {
  /** The one key that did not move. */
  keys: unknown[];
  /** That one card. */
  cards: KanbanCard[];
  /** The column it is still in. */
  from: (string | null)[];
  /** The column it would have landed in. */
  to: string;
  /** The position that was asked for, or null. */
  index: number | null;
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/**
 * `card:reverted`: a move did not stick — the bound grid refused the write, an
 * `onCardMove` callback returned false, or the server reverted the cell.
 */
interface KanbanCardRevertedEvent {
  /** The keys that went back. */
  keys: unknown[];
  /** Those cards. */
  cards: KanbanCard[];
  /** Where each came from. */
  from: (string | null)[];
  /** The column they are in again, or null when it is not known. */
  to: string | null;
  /** The position that had been asked for, or null. */
  index: number | null;
  /** The order values that had been computed, or null. */
  orders: number[] | null;
  /** Where the move came from, on the two board-side reverts. */
  origin?: 'user' | 'api' | 'init' | 'ai';
  /** True on the grid-side revert, which reports it explicitly. */
  reverted?: boolean;
  /** Why the grid reverted the cell, on the grid-side revert. */
  reason?: string;
}

/** `card:confirmed`: the grid confirmed the column write behind an optimistic move. */
interface KanbanCardConfirmedEvent {
  /** The key that was confirmed. */
  keys: unknown[];
  /** That card, or an empty array when it has since gone. */
  cards: KanbanCard[];
  /** The column it is in, or null when the card has gone. */
  to: string | null;
}

/** `selection:changed`: the selected cards changed. */
interface KanbanSelectionEvent {
  /** Every selected card key, in selection order. */
  keys: unknown[];
}

/** `column:collapse`: a column was collapsed or expanded. */
interface KanbanColumnCollapseEvent {
  /** The column that moved. */
  column: string;
  /** True when it is now collapsed. */
  collapsed: boolean;
}

/** `beforeColumnChange`: a column is about to be collapsed or expanded. */
interface KanbanBeforeColumnChangeEvent extends KanbanBeforeEvent {
  /** The column that would move. */
  column: string;
  /** True when it would become collapsed. */
  collapsed: boolean;
}

/** `columnChange:cancelled`: a `beforeColumnChange` handler refused it. */
interface KanbanColumnChangeCancelledEvent extends KanbanColumnCollapseEvent {
  /** Where the change came from. */
  origin: 'user' | 'api' | 'init' | 'ai';
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `swimlane:collapse`: a swimlane was collapsed or expanded. */
interface KanbanSwimlaneCollapseEvent {
  /** The lane that moved. */
  swimlane: string;
  /** True when it is now collapsed. */
  collapsed: boolean;
}

/** `column:reorder` and `swimlane:reorder`: the order the board draws them in. */
interface KanbanOrderEvent {
  /** The ids in their new order, as the rebuilt model holds them. */
  order: string[];
}

/** `beforeColumnReorder` and `beforeLaneReorder`: an order is about to be applied. */
interface KanbanBeforeOrderEvent extends KanbanBeforeEvent {
  /** The ids in the order that was asked for. */
  order: string[];
}

/** `columnReorder:cancelled` and `laneReorder:cancelled`: a handler refused the order. */
interface KanbanOrderCancelledEvent extends KanbanOrderEvent {
  /** Where the reorder came from. */
  origin: 'user' | 'api' | 'init' | 'ai';
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `filter:changed`: the quick filter or a named predicate changed. */
interface KanbanFilterChangedEvent {
  /** The quick-filter text now in force, or undefined when there is none. */
  quickFilter?: string;
  /** True when at least one named predicate is registered. */
  hasFilter: boolean;
  /** The names of the registered predicates. */
  filters: string[];
}

/** `sprint:changed`: the shown sprint changed. */
interface KanbanSprintChangedEvent {
  /** The sprint now shown: a sprint id, `board.BACKLOG`, or undefined for all of them. */
  sprint: unknown;
}

/** `epic:changed`: the shown epic changed. */
interface KanbanEpicChangedEvent {
  /** The epic now shown, or undefined for all of them. */
  epic: unknown;
}

/** `card:expand`: a card's children were opened. */
interface KanbanCardExpandEvent {
  /** The card that was expanded. */
  card: KanbanCard;
  /** Its child rows, as the children loader returned them. */
  rows: Record<string, unknown>[];
  /** How they are being presented. */
  present: 'drawer' | 'modal' | 'inline';
}

/** `card:drill`: a card was expanded from inside an already-open detail. */
interface KanbanCardDrillEvent {
  /** The card that was expanded. */
  card: KanbanCard;
  /** Its child rows. */
  rows: Record<string, unknown>[];
  /** How many levels down this is; 1 is the first drill. */
  depth: number;
}

/** `drag:start`: a card drag began. */
interface KanbanDragStartEvent {
  /** Every key the drag carries — the selection when the dragged card is in it. */
  keys: unknown[];
  /** The card under the pointer. */
  card: KanbanCard;
  /** The DOM `dragstart` event. */
  originalEvent: unknown;
}

/** `drag:end`: a card drag ended, whether or not it dropped on a column. */
interface KanbanDragEndEvent {
  /** The keys the drag carried. */
  keys: unknown[];
  /** The DOM `drop` event; absent when the browser ended the drag without one. */
  originalEvent?: unknown;
}

/** `card:sla`: a card crossed an ageing threshold. */
interface KanbanSlaEvent {
  /** The card's key. */
  key: unknown;
  /** The card, or null when it is no longer on the board. */
  card: KanbanCard | null;
  /** The level it has just reached. */
  level: 'ok' | 'warn' | 'breach' | null;
  /** The level it was at before this crossing. */
  previous: 'ok' | 'warn' | 'breach' | null;
  /** Its age in ms, or null when unknown. */
  ageMs: number | null;
  /** A short human age label (`2d`, `5h`, …). */
  ageText: string;
  /** The column it was aged in. */
  columnId: string | null;
  /** Its swimlane value, on a board with swimlanes. */
  lane?: unknown;
  /** The resolved warn threshold in ms, or null. */
  warnMs: number | null;
  /** The resolved breach threshold in ms, or null. */
  breachMs: number | null;
  /** The epoch (ms) of the crossing. */
  at: number;
}

/**
 * The events a board raises.
 *
 * The board's own, not the grid's: `grid.on` takes {@link EventName} and knows
 * nothing about these, and a grid-bound board follows the grid's events itself
 * rather than re-publishing them. `on()` warns once on any other name, because
 * a binding to an event that can never fire is a silent no-op.
 *
 * The `before…` six are cancellable on the same contract the grid core uses: call `preventDefault(reason?)` on the payload, or return
 * a Promise to hold the action until it settles; a veto fires the matching
 * `<action>:cancelled` carrying the reason.
 */
type KanbanEventName =
  /** A card was clicked, or Enter was pressed on a focused card. */
  | 'card:click'
  /** A card was double-clicked. */
  | 'card:dblclick'
  /** A context menu was requested on a card. */
  | 'card:contextmenu'
  /** One or more cards were moved to a column, after every `beforeMove` gate passed and the write-back was applied. */
  | 'card:move'
  /** A move did not stick: the bound grid refused the write, an `onCardMove` callback returned false, or the server reverted the cell. */
  | 'card:reverted'
  /** The bound grid confirmed the column write behind an optimistic move. */
  | 'card:confirmed'
  /** The set of selected cards changed. */
  | 'selection:changed'
  /** A column was collapsed or expanded. */
  | 'column:collapse'
  /** A card was appended to a column. */
  | 'card:add'
  /** A card drag began. */
  | 'drag:start'
  /** A card drag ended, whether or not it dropped on a column. */
  | 'drag:end'
  /** A swimlane was collapsed or expanded. */
  | 'swimlane:collapse'
  /** The swimlane order changed. */
  | 'swimlane:reorder'
  /** The column order changed. */
  | 'column:reorder'
  /** The quick filter or a named card predicate changed. */
  | 'filter:changed'
  /** The shown sprint changed. */
  | 'sprint:changed'
  /** The shown epic changed. */
  | 'epic:changed'
  /** A card's children were opened. */
  | 'card:expand'
  /** A card was expanded from inside an already-open detail. */
  | 'card:drill'
  /** An inline card edit was written. */
  | 'card:edit'
  /** A card crossed an ageing threshold — ok to warn, or ok/warn to breach. */
  | 'card:sla'
  /** One card of a move is about to be applied; raised once per card, and cancellable. */
  | 'beforeMove'
  /** A card is about to be appended; cancellable. */
  | 'beforeAdd'
  /** An inline card edit is about to be written; cancellable. */
  | 'beforeEdit'
  /** A swimlane reorder is about to be applied; cancellable. */
  | 'beforeLaneReorder'
  /** A column reorder is about to be applied; cancellable. */
  | 'beforeColumnReorder'
  /** A column collapse or expand is about to be applied; cancellable. */
  | 'beforeColumnChange'
  /** A `beforeMove` handler refused one card; raised once per refused card. */
  | 'move:cancelled'
  /** A `beforeAdd` handler refused the append. */
  | 'add:cancelled'
  /** A `beforeEdit` handler refused the write. */
  | 'edit:cancelled'
  /** A `beforeLaneReorder` handler refused the order. */
  | 'laneReorder:cancelled'
  /** A `beforeColumnReorder` handler refused the order. */
  | 'columnReorder:cancelled'
  /** A `beforeColumnChange` handler refused the collapse or expand. */
  | 'columnChange:cancelled';

/** What a handler receives, per board event. */
interface KanbanEventPayloads {
  /** The card, its column, its element and the DOM event. */
  'card:click': KanbanEvent;
  /** The card, its column, its element and the DOM event. */
  'card:dblclick': KanbanEvent;
  /** The card, its column, its element and the DOM event. */
  'card:contextmenu': KanbanEvent;
  /** Which cards moved, where from and to, and the order values written. */
  'card:move': KanbanMoveEvent;
  /** Which cards went back, and why when the grid said so. */
  'card:reverted': KanbanCardRevertedEvent;
  /** The card the grid confirmed, and the column it is in. */
  'card:confirmed': KanbanCardConfirmedEvent;
  /** Every selected card key. */
  'selection:changed': KanbanSelectionEvent;
  /** The column, and whether it is now collapsed. */
  'column:collapse': KanbanColumnCollapseEvent;
  /** The column added to, and the new card's key. */
  'card:add': KanbanCardAddEvent;
  /** The keys the drag carries, the card under the pointer, and the DOM event. */
  'drag:start': KanbanDragStartEvent;
  /** The keys the drag carried, and the DOM event where there was one. */
  'drag:end': KanbanDragEndEvent;
  /** The lane, and whether it is now collapsed. */
  'swimlane:collapse': KanbanSwimlaneCollapseEvent;
  /** The lane ids in their new order. */
  'swimlane:reorder': KanbanOrderEvent;
  /** The column ids in their new order. */
  'column:reorder': KanbanOrderEvent;
  /** The quick-filter text, and the named predicates in force. */
  'filter:changed': KanbanFilterChangedEvent;
  /** The sprint now shown. */
  'sprint:changed': KanbanSprintChangedEvent;
  /** The epic now shown. */
  'epic:changed': KanbanEpicChangedEvent;
  /** The card, its child rows, and how they are presented. */
  'card:expand': KanbanCardExpandEvent;
  /** The card, its child rows, and how deep the drill is. */
  'card:drill': KanbanCardDrillEvent;
  /** The card, the field, and the value written. */
  'card:edit': KanbanCardEditEvent;
  /** The crossing: the level reached, the one before it, and the age behind it. */
  'card:sla': KanbanSlaEvent;
  /** The card about to move, with `preventDefault` to stop it. */
  beforeMove: KanbanBeforeMoveEvent;
  /** The column and seed about to be appended, with `preventDefault` to stop it. */
  beforeAdd: KanbanBeforeAddEvent;
  /** The field about to be written, with `preventDefault` to stop it. */
  beforeEdit: KanbanBeforeEditEvent;
  /** The lane order about to be applied, with `preventDefault` to stop it. */
  beforeLaneReorder: KanbanBeforeOrderEvent;
  /** The column order about to be applied, with `preventDefault` to stop it. */
  beforeColumnReorder: KanbanBeforeOrderEvent;
  /** The collapse about to be applied, with `preventDefault` to stop it. */
  beforeColumnChange: KanbanBeforeColumnChangeEvent;
  /** The one card that did not move, and why. */
  'move:cancelled': KanbanMoveCancelledEvent;
  /** The card that was not added, and why. */
  'add:cancelled': KanbanAddCancelledEvent;
  /** The write that was not made, and why. */
  'edit:cancelled': KanbanEditCancelledEvent;
  /** The lane order that was not applied, and why. */
  'laneReorder:cancelled': KanbanOrderCancelledEvent;
  /** The column order that was not applied, and why. */
  'columnReorder:cancelled': KanbanOrderCancelledEvent;
  /** The collapse that was not applied, and why. */
  'columnChange:cancelled': KanbanColumnChangeCancelledEvent;
}

/** The keyed-diff consumer surface a board shares with a grid, so a Data Router routes to it directly. */
interface KanbanRows {
  /**
   * Apply a keyed diff: `add` replaces whatever row each key names, `update` merges its
   * fields into the stored row (so a patch need only carry what changed), `remove` drops
   * the keys. The board regroups and repaints, keeping scroll, focus, selection, collapse
   * and any open pop-out. Ignored with a warning on a grid-bound board.
   */
  apply(change: { add?: KanbanRow[]; update?: KanbanRow[]; remove?: unknown[] }): void;
  /** Visit every row the board holds, with its key. */
  forEach(fn: (row: KanbanRow, key: unknown) => void): void;
  /** How many rows the board holds, before filtering. */
  readonly count: number;
}

/**
 * Named card predicates, composed with AND, following the
 * grid's `filters.where` convention. Several may be
 * registered under different names at once; each can be replaced or removed
 * without touching the others. `setFilter(fn)` is unchanged sugar for
 * `where(DEFAULT, fn)` / `where(DEFAULT, null)`.
 */
interface KanbanFilters {
  /** The reserved name `board.setFilter` registers/removes under. */
  readonly DEFAULT: string;
  /** The registered names, in registration order. */
  where(): string[];
  /** Register or replace the predicate under `name`. */
  where(name: string, predicate: (row: KanbanRow, card: KanbanCard) => boolean): Kanban;
  /** Remove whatever is registered under `name`; a no-op if nothing was. */
  where(name: string, predicate: null): Kanban;
  /** Re-run every named predicate (or one, by name) and re-render. */
  reapply(name?: string): boolean;
}

/**
 * A board instance: a kanban view of grid rows as cards grouped into columns.
 * It consumes data through the same keyed-diff `rows.apply` contract a grid
 * exposes, so `dataRouter.attach(value, board)` drives it like any other
 * viewer.
 */
interface Kanban {
  /** The element the board renders into, or null for a headless board. */
  readonly el: unknown | null;
  /** The resolved card identity; see `KanbanConfig.rowKey`. */
  readonly rowKey: string | ((row: KanbanRow) => string | number);
  /**
   * The keyed-diff consumer surface, the same shape a grid exposes — this is what makes a
   * board a Data Router target.
   */
  rows: KanbanRows;
  /** The card-aging / SLA monitor, present only when a `sla` config was supplied. */
  sla?: KanbanSla;
  /** The current columns in display order, each with its cards and aggregates. */
  columns(): KanbanColumn[];
  /** One column by id, or undefined when the board has no such column. */
  column(id: string): KanbanColumn | undefined;
  /** How many cards a column holds after filtering; 0 for an unknown column. */
  count(id: string): number;
  /** A column's points sum; 0 for an unknown column. */
  points(id: string): number;
  /** Every card on the board, unplaced ones included, in no particular column order. */
  cards(): KanbanCard[];
  /**
   * One card by key, or undefined when no card has that key (it may have been filtered
   * out).
   */
  card(key: unknown): KanbanCard | undefined;
  /**
   * Register an event handler; returns a function that removes it. An unrecognised event
   * name is warned about once, because it names a binding that could never fire. What each
   * event carries is {@link KanbanEventPayloads}; the handler is declared with the widest
   * of them, so narrow on the name inside it.
   */
  on(name: KanbanEventName, fn: (event: KanbanEventPayloads[KanbanEventName]) => void): () => void;
  /** Remove a handler registered with `on`. */
  off(name: KanbanEventName, fn: (event: KanbanEventPayloads[KanbanEventName]) => void): void;
  /**
   * Whether editing is blocked — for the whole board, or for the column or card named in
   * the scope.
   */
  readonly(scope?: { column?: string; card?: unknown }): boolean;
  /**
   * Move one or more cards to a column (and, with an order property, to a
   * position within it), through the `onBeforeMove` veto and the grid's
   * shipped write-back path. The single entry point behind drag-and-drop and
   * keyboard move.
   */
  move(keys: unknown | unknown[], toColumn: string, toIndex?: number | null, toLane?: string): Promise<{ moved: unknown[]; reverted: boolean }>;
  /** The selected card keys. */
  selection(): unknown[];
  /** Whether a card is selected. */
  isSelected(key: unknown): boolean;
  /** Change the selection: `set` (replace), `add`, `toggle` or `remove`. */
  select(keys: unknown | unknown[], mode?: 'set' | 'add' | 'toggle' | 'remove'): Kanban;
  /** Clear the selection. */
  clearSelection(): Kanban;
  /** Collapse, expand or toggle a column (emits `column:collapse`). */
  collapseColumn(id: string, collapsed?: boolean): Kanban;
  /** Collapse, expand or toggle a swimlane (emits `swimlane:collapse`). */
  collapseLane(id: string, collapsed?: boolean): Kanban;
  /** Reorder the columns to the given id order (emits `column:reorder`). */
  reorderColumns(order: string[]): Kanban;
  /** Move one column before another (or to the end); emits `column:reorder`. */
  moveColumn(id: string, beforeId: string | null): Kanban;
  /** Reorder the swimlanes to the given id order (emits `swimlane:reorder`). */
  reorderLanes(order: string[]): Kanban;
  /** Move one swimlane before another (or to the end); emits `swimlane:reorder`. */
  moveLane(id: string, beforeId: string | null): Kanban;
  /** Named card predicates, composed with AND. See {@link KanbanFilters}. */
  filters: KanbanFilters;
  /** Set a predicate filter over cards, or clear it with null. Sugar for `filters.where(filters.DEFAULT, fn)`. */
  setFilter(fn: ((row: KanbanRow, card: KanbanCard) => boolean) | null): Kanban;
  /** Set the quick-filter text matched across card fields. Independent of every `filters.where` predicate. */
  setQuickFilter(text: string): Kanban;
  /** Distinct values of a property with card counts — the raw material for a facet control. */
  facets(property: string): { value: unknown; count: number }[];
  /** The sentinel `setSprint` value that selects the backlog (cards with no sprint). */
  readonly BACKLOG: unknown;
  /** Select the shown sprint (`BACKLOG` for the backlog, undefined for all); emits `sprint:changed`. */
  setSprint(sprint: unknown): Kanban;
  /** Show only the backlog (cards with no sprint). */
  showBacklog(): Kanban;
  /** Select the shown epic (undefined for all); emits `epic:changed`. */
  setEpic(epic: unknown): Kanban;
  /** The distinct sprint values (the switcher's options); a configured `sprints` dataset pins the order. */
  sprints(): unknown[];
  /** The sprint dataset as `{ id, title }` descriptors — the configured list plus any data-only sprint. */
  sprintDefs(): { id: unknown; title: string }[];
  /** The distinct epic values. */
  epics(): unknown[];
  /** Roll rows up by a property: per-bucket count, points, done and progress. */
  rollup(property: string): { value: unknown; count: number; points: number; doneCount: number; donePoints: number; progress: number }[];
  /** The epic rollup (empty when no epic property is configured). */
  epicRollup(): { value: unknown; count: number; points: number; doneCount: number; donePoints: number; progress: number }[];
  /** Whether a card can be expanded to a child pop-out. */
  canExpand(card: KanbanCard): boolean;
  /** Open a card's children in a pop-out (drawer/modal/inline); emits `card:expand`/`card:drill`. */
  expand(key: unknown): Promise<object | null>;
  /** Close any open card pop-out. */
  closeDetail(): Kanban;
  /** Whether a mapped card field is opted into inline edit and writable. */
  isFieldEditable(name: string): boolean;
  /** Start inline editing a card's field (the grid's own field editor when bound); no-op headless. */
  editCard(key: unknown, name?: string): object | null;
  /** Commit an inline edit through the write-back path (grid.edit.setCells when bound); emits `card:edit`. */
  applyEdit(key: unknown, name: string, value: unknown): Promise<boolean>;
  /**
   * Add a card to a column and open it in inline edit; emits `card:add`.
   * Returns the new key directly, or a Promise of it when `onAddCard`
   * returns a Promise or a `beforeAdd` handler defers; a
   * rejected `onAddCard` Promise resolves this to `null` with no card added.
   */
  addCard(columnId: string, seed?: KanbanRow): unknown | Promise<unknown>;
  /** Serialise the restorable state: collapsed columns/lanes, order, filter, sprint/epic, selection. */
  getState(): object;
  /** Restore a state snapshot from {@link Kanban#getState}. */
  setState(snapshot: object): Kanban;
  /** Mark the board loading (renders a host-localised loading state). */
  setLoading(loading: boolean): Kanban;
  /** Set (or clear with null) an error state, rendered as a host-supplied message. */
  setError(message: string | null): Kanban;
  /**
   * Replace the source rows and re-render, and make that array the board's source again
   * so a later `refresh()` re-reads it. Ignored with a warning on a grid-bound board.
   */
  setRows(rows: KanbanRow[]): Kanban;
  /**
   * Replace the board's configured column set. Keeps card
   * placement and interaction state (collapsed columns, column order, quick
   * filter, selection) for every column id that survives; a dropped id is
   * not specially handled — a card whose value has nowhere configured to go
   * re-derives an ad hoc column rather than becoming `unplaced` (the same
   * "never silently drop a card" rule an unconfigured value already gets).
   */
  setColumns(defs: KanbanColumnDef[]): Kanban;
  /**
   * Re-read the source and re-render: a bound grid's rows, or the configured array. Once
   * rows have arrived through `rows.apply` nothing is re-read — the board regroups what
   * it holds, so a routed feed is never thrown away.
   */
  refresh(): Kanban;
  /**
   * Empty the element, remove only the class the board added, and stop the flow and SLA
   * monitors. A bound grid is left alone — the host owns it.
   */
  destroy(): void;
}

/**
 * Create a board (kanban) view of rows, grouped into columns by a configurable
 * property. Pass a DOM element to render into, or `null` for a headless board
 * that computes the same column/card model without a DOM.
 */
export function createKanban(el: HTMLElement | null, config?: KanbanConfig): Kanban;
export default createKanban;
