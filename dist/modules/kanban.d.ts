/*!
 * Lattice Grid 1.68.0, kanban module type declarations
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
  key: unknown;
  row: KanbanRow;
  columnId: string | null;
  points: number;
  hasPoints: boolean;
  order?: unknown;
  swimlane?: unknown;
  sprint?: unknown;
  epic?: unknown;
  fields: Record<string, string>;
}

/** A column with its cards and aggregates. `over` is true when `count` exceeds `wipLimit`. */
interface KanbanColumn {
  id: string;
  title: string;
  color: string | null;
  wipLimit: number | null;
  collapsed: boolean;
  cards: KanbanCard[];
  count: number;
  points: number;
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
  el: HTMLElement;
  focus?: () => void;
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
  title?: KanbanFieldMap;
  subtitle?: KanbanFieldMap;
  labels?: KanbanFieldMap;
  assignee?: KanbanFieldMap;
  due?: KanbanFieldMap;
  cover?: KanbanFieldMap;
  progress?: KanbanFieldMap;
  badges?: KanbanFieldMap;
  accent?: KanbanFieldMap;
  [field: string]: KanbanFieldMap | undefined;
}

/** Granular readonly: the whole board, or selectively by column id and card key. */
type KanbanReadonly = boolean | {
  board?: boolean;
  columns?: Record<string, boolean>;
  cards?: Record<string, boolean>;
};

/** The payload every board event carries. */
interface KanbanEvent {
  card: KanbanCard;
  column: string | null;
  el?: unknown;
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
  key: unknown;
  columnId: string | null;
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
  rows?: KanbanRow[];
  grid?: unknown;
  /**
   * Card identity (a field or fn, returning a string or number); default
   * 'id'. Composite (`string[]`) keys are core-grid-only: a board keys its
   * own card identity from one value, so there is nothing for an array to
   * join into here.
   */
  rowKey?: string | ((row: KanbanRow) => string | number);
  columnProperty?: string;
  columns?: KanbanColumnDef[];
  columnOrder?: string[];
  pointsProperty?: string;
  showPoints?: boolean;
  orderProperty?: string;
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
  sprintProperty?: string;
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
  card?: KanbanCardMap;
  readonly?: KanbanReadonly;
  ariaLabel?: string;
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
  onCardClick?: (event: KanbanEvent) => void;
  onCardDblClick?: (event: KanbanEvent) => void;
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
  label: string;
  action?: (ctx: { card: KanbanCard; cards: KanbanCard[]; board: Kanban }) => void;
  disabled?: boolean;
}

/** The payload of a `card:move` (and `card:reverted`) event. */
interface KanbanMoveEvent {
  keys: unknown[];
  cards: KanbanCard[];
  from: (string | null)[];
  to: string;
  index: number | null;
  orders: number[] | null;
}

/** The keyed-diff consumer surface a board shares with a grid, so a Data Router routes to it directly. */
interface KanbanRows {
  apply(change: { add?: KanbanRow[]; update?: KanbanRow[]; remove?: unknown[] }): void;
  forEach(fn: (row: KanbanRow, key: unknown) => void): void;
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
  readonly el: unknown | null;
  /** The resolved card identity; see `KanbanConfig.rowKey`. */
  readonly rowKey: string | ((row: KanbanRow) => string | number);
  rows: KanbanRows;
  /** The card-aging / SLA monitor, present only when a `sla` config was supplied. */
  sla?: KanbanSla;
  columns(): KanbanColumn[];
  column(id: string): KanbanColumn | undefined;
  count(id: string): number;
  points(id: string): number;
  cards(): KanbanCard[];
  card(key: unknown): KanbanCard | undefined;
  on(name: string, fn: (event: KanbanEvent) => void): () => void;
  off(name: string, fn: (event: KanbanEvent) => void): void;
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
  refresh(): Kanban;
  destroy(): void;
}

/**
 * Create a board (kanban) view of rows, grouped into columns by a configurable
 * property. Pass a DOM element to render into, or `null` for a headless board
 * that computes the same column/card model without a DOM.
 */
export function createKanban(el: HTMLElement | null, config?: KanbanConfig): Kanban;
export default createKanban;
