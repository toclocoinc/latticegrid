/*!
 * Lattice Grid 1.83.1, calendar module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/** A row backing a calendar card: any object. Its date comes from `startProperty` and its identity from `rowKey`. */
type CalendarRow = Record<string, unknown>;

/** A calendar view name: a week day-grid, a month grid, a week time-grid, or a single-day time-grid. */
type CalendarView = 'week' | 'month' | 'week-time' | 'day';

/**
 * The built-in header toolbar. Each section is shown unless its flag is
 * `false`; `header: false` (the whole object) renders no header at all and
 * the host draws its own.
 */
export interface CalendarHeader {
  /** The prev / next / today buttons. */
  navigation?: boolean;
  /** The `SEP 28 – OCT 4, 2026` / `SEPTEMBER 2026` title. */
  title?: boolean;
  /** The week/month toggle. */
  views?: boolean;
}

/** A card field mapping: a property path, or a function reading the row. */
export type CalendarFieldMap = string | ((row: CalendarRow) => unknown);

/** The field-to-property mapping that drives the default card template. */
export interface CalendarCardMap {
  /** The card's headline text (the default renderer shows time + this). */
  title?: CalendarFieldMap;
  /** A second line under the title. */
  subtitle?: CalendarFieldMap;
  /** Any other card slot, mapped the same way as the named ones above. */
  [field: string]: CalendarFieldMap | undefined;
}

/** Granular readonly: the whole calendar, or selectively by day key and card key. */
export type CalendarReadonly = boolean | {
  board?: boolean;
  days?: Record<string, boolean>;
  cards?: Record<string | number, boolean>;
};

/** The payload of the three card pointer events — `card:click`, `card:dblclick` and `card:contextmenu`. */
export interface CalendarPointerEvent {
  /** The data row the card was placed from. */
  row: CalendarRow;
  /** The card's key, from `rowKey`. */
  key: unknown;
  /** The pointer's X position, where the host wants to anchor a popover. */
  clientX: number;
  /** The pointer's Y position. */
  clientY: number;
  /** The DOM event that caused this one, so a host can call `preventDefault`. */
  nativeEvent: unknown;
}

/** The payload of `card:mount` — the card's element was created and attached. */
export interface CalendarMountEvent {
  /** The data row the card was placed from. */
  row: CalendarRow;
  /** The card's key, from `rowKey`. */
  key: unknown;
  /** The card's element, kept mounted for the host's async updates. */
  el: unknown;
}

/** The payload of `range:change` — the visible range moved. */
export interface CalendarRangeEvent {
  /** The first visible day, a local midnight. */
  start: Date;
  /** The last visible day, a local midnight (inclusive). */
  end: Date;
  /** The view now shown: `'week'`, `'month'`, `'week-time'` or `'day'`. */
  view: CalendarView;
}

/** A card's start/end before or after a reschedule; either may be null. */
export interface CalendarMoveSpan {
  /** The card's start, or null when it has none. */
  start: Date | null;
  /** The card's end, or null when it has none. */
  end: Date | null;
}

/** The payload of `beforeMove` and `card:move` — a card was (or may be) rescheduled. */
export interface CalendarMoveEvent {
  /** The data row the card was placed from. */
  row: CalendarRow;
  /** The card's key, from `rowKey`. */
  key: unknown;
  /** The card's position before the reschedule. */
  from: CalendarMoveSpan;
  /** The card's position after the reschedule. */
  to: CalendarMoveSpan;
  /** Who initiated the move: `'user'` or `'ai'`. */
  origin?: 'user' | 'ai';
  /** When cancelled, the reason given to `preventDefault(reason?)`. */
  reason?: string;
}

/**
 * The configuration for {@link createCalendar}. The data source is `rows` (an
 * array) or `grid` (a live grid to bind). The date field is `startProperty`;
 * an `endProperty` turns point events into multi-day spans.
 */
export interface CalendarConfig {
  /** The source rows (one card per row). One of `rows`/`grid`. */
  rows?: CalendarRow[];
  /** A Lattice grid to bind to instead of `rows`; the calendar follows its filtered/sorted rows live. */
  grid?: unknown;
  /** The row identity: a property path or a function returning a string or number. Default `'id'`. */
  rowKey?: string | ((row: CalendarRow) => string | number);
  /** The field naming a point event's start. Default `'start'`. */
  startProperty?: string;
  /** The optional field naming a span's end; omitted means point events. */
  endProperty?: string;
  /** An optional boolean field marking an all-day event, stacked in the time-grid all-day row. */
  allDayProperty?: string;
  /** The view to show: `'week'`, `'month'`, `'week-time'` or `'day'`. Default `'month'`. */
  view?: CalendarView;
  /** The anchor date the visible range centres on. Default today. */
  date?: Date | string | number;
  /** Week-start weekday, 0=Sun…6=Sat. Default 1 (Monday). */
  firstDay?: number;
  /** BCP-47 locale for weekday/month names, the title and the card time. */
  locale?: string;
  /** IANA time-zone name, honoured on the hour axis and the now line. */
  timeZone?: string;
  /** The time-grid slot step in minutes, or an `'H:MM(:SS)'` duration. Default 30. */
  slotDuration?: number | string;
  /** The hour axis's first time, a clock or minutes. Default `'00:00'`. */
  slotMinTime?: number | string;
  /** The hour axis's last time, a clock or minutes. Default `'24:00'`. */
  slotMaxTime?: number | string;
  /** The hour axis's initial scroll, a clock or minutes. Default `slotMinTime`. */
  scrollTime?: number | string;
  /** A timed block's length when it has no end. Default 60 minutes. */
  defaultDuration?: number | string;
  /** The working span the time grid shades: `true`, or `{ startTime, endTime, daysOfWeek }`. Default off. */
  businessHours?: boolean | { startTime?: string; endTime?: string; daysOfWeek?: number[] };
  /** Show the ISO week number in the time-grid header. Default false. */
  weekNumbers?: boolean;
  /** The header toolbar sections, or `false` to render none. */
  header?: CalendarHeader | false;
  /** The default card template's field mapping (title/subtitle/…). */
  card?: CalendarCardMap;
  /** A host card renderer `(row, el)`; `el` stays mounted for its async updates. */
  renderCard?: (row: CalendarRow, el: unknown) => unknown;
  /** The property whose value picks the card's edge colour. */
  colorProperty?: string;
  /** An optional value→colour map applied to `colorProperty`'s value. */
  colorMap?: Record<string, string>;
  /** Card stacking order within a day: a property path, or a comparator. */
  eventOrder?: string | ((a: CalendarRow, b: CalendarRow) => number);
  /** The `+N more` overflow threshold per day. Default `false` (off). */
  dayMaxEvents?: number | false;
  /** Granular readonly (whole calendar, per day, per card). */
  readonly?: CalendarReadonly;
  /** The calendar's accessible name. Defaults to `Calendar`. */
  ariaLabel?: string;
  /** Host-localised labels: `today`, `week`, `month`, `more`, `event`, `eventSingular`, `calendar`. */
  labels?: Record<string, string>;
  /** A message catalogue with `t(key, params)`, or a bound grid's is borrowed. */
  messages?: unknown;
  /** Card click handler — the config route to the `card:click` event. */
  onCardClick?: (event: CalendarPointerEvent) => void;
  /** Card double-click handler — the config route to the `card:dblclick` event. */
  onCardDblClick?: (event: CalendarPointerEvent) => void;
  /** Card right-click handler — the config route to the `card:contextmenu` event. */
  onCardContextMenu?: (event: CalendarPointerEvent) => void;
  /** Range-changed handler — the config route to the `range:change` event. */
  onRangeChange?: (event: CalendarRangeEvent) => void;
  /** Reschedule handler — the config route to `card:move`. On a standalone
   * calendar, returning `false` (or rejecting) reverts the move. */
  onCardMove?: (event: CalendarMoveEvent) => unknown;
}

/** The keyed-diff consumer surface a calendar shares with a grid, so a Data Router routes to it directly. */
export interface CalendarRows {
  /**
   * Apply a keyed diff: `add` sets each row outright, `update` merges each patch into
   * the stored row, `remove` drops keys uncoerced — exactly as the calendar keys its own
   * rows. Recomputes and re-renders without firing `range:change`. Ignored on a grid-bound
   * calendar.
   */
  apply(change: { add?: CalendarRow[]; update?: CalendarRow[]; remove?: unknown[] }): void;
  /** Visit every row the calendar holds, with its key. */
  forEach(fn: (row: CalendarRow, key: unknown) => void): void;
  /** The row stored under a key, uncoerced. */
  get(key: unknown): CalendarRow | undefined;
  /** How many rows the calendar holds. */
  readonly count: number;
}

/**
 * A calendar instance: a view of grid rows as cards on a month grid or a week
 * day-grid. It consumes data through the same keyed-diff `rows.apply` contract
 * a grid exposes, so `dataRouter.attach(value, calendar)` drives it like any
 * other viewer.
 */
export interface Calendar {
  /** The element the calendar renders into, or null for a headless calendar. */
  readonly el: unknown | null;
  /** The resolved row identity; see `CalendarConfig.rowKey`. */
  readonly rowKey: string | ((row: CalendarRow) => string | number);
  /** The keyed-diff consumer surface — what makes the calendar a Data Router target. */
  rows: CalendarRows;
  /** The rows whose start could not be read, in arrival order. */
  readonly unscheduled: CalendarRow[];
  /** Move to the previous week or month, firing `range:change`. */
  prev(): Calendar;
  /** Move to the next week or month, firing `range:change`. */
  next(): Calendar;
  /** Move back to today, firing `range:change`. */
  today(): Calendar;
  /** Jump to an anchor date, firing `range:change`. */
  goTo(date: Date | string | number): Calendar;
  /** Switch the view (`'week'` | `'month'` | `'week-time'` | `'day'`), firing `range:change`. */
  setView(view: CalendarView): Calendar;
  /** The visible range `{ start, end, view }`, both local midnights, `end` inclusive. */
  getRange(): CalendarRangeEvent;
  /**
   * Recompute and re-render. A grid-bound calendar re-reads its grid; one still on
   * `config.rows` re-reads that array; a routed calendar re-reads nothing.
   */
  refresh(): Calendar;
  /** Serialise the arrangement state: `{ version: 2, view, date, firstDay, slotDuration, scrollTime }`. */
  /**
   * Point this calendar at a replacement grid, the one call a
   * page framework makes after its swap destroyed the grid the calendar was bound
   * to. No-op on a calendar not built over a grid, and on binding to the grid it
   * already follows.
   */
  rebind(grid: unknown): Calendar;
  /** Serialise the arrangement state: `{ version: 1, view, date, firstDay }`. */
  getState(): object;
  /** Restore a state snapshot from {@link Calendar#getState}, then re-render. */
  setState(snapshot: object): Calendar;
  /** Register an event handler; returns a function that removes it. */
  on(name: CalendarEventName, fn: (event: CalendarEventPayloads[CalendarEventName]) => void): () => void;
  /** Remove a handler registered with `on`. */
  off(name: CalendarEventName, fn: (event: CalendarEventPayloads[CalendarEventName]) => void): void;
  /** Whether a scope (the whole calendar, a day, or a card) is readonly. */
  readonly(scope?: { day?: string; card?: unknown }): boolean;
  /**
   * Reschedule a card: move it to a new start (shifting the end by the same
   * delta so the duration is kept) or resize it to a new end. Grid-bound, the
   * start/end cells are written through the grid's `edit.setCells`; standalone,
   * the calendar's own row is updated and a host `onCardMove` persists it.
   * Gated by the cancellable `beforeMove` event. Returns a Promise of whether
   * the reschedule stuck.
   */
  move(key: unknown, to: { start?: Date | null; end?: Date | null }, opts?: { origin?: 'user' | 'ai' }): Promise<boolean>;
  /** Empty the element, remove only what the module added, and drop handlers and caches. */
  destroy(): void;
}

/** The events a calendar emits. */
export type CalendarEventName =
  /** A card was clicked, or Enter/Space was pressed on a focused card. */
  | 'card:click'
  /** A card was double-clicked. */
  | 'card:dblclick'
  /** A context menu was requested on a card. */
  | 'card:contextmenu'
  /** A card's element was created and attached; fires once per mount. */
  | 'card:mount'
  /** The visible range moved via prev/next/today/goTo/setView (not on a data update). */
  | 'range:change'
  /** A card is about to be rescheduled; cancel with `preventDefault(reason?)` or a returned/rejected `false`. */
  | 'beforeMove'
  /** A card was rescheduled; carries the old and new start/end. */
  | 'card:move';

/** What a handler receives, per calendar event. */
export interface CalendarEventPayloads {
  /** The row, key, pointer position and the DOM event. */
  'card:click': CalendarPointerEvent;
  /** The row, key, pointer position and the DOM event. */
  'card:dblclick': CalendarPointerEvent;
  /** The row, key, pointer position and the DOM event. */
  'card:contextmenu': CalendarPointerEvent;
  /** The row, key and the mounted element. */
  'card:mount': CalendarMountEvent;
  /** The new range's start, end and view. */
  'range:change': CalendarRangeEvent;
  /** The row, key and the from/to positions; veto with `preventDefault(reason?)`. */
  'beforeMove': CalendarMoveEvent;
  /** The row, key and the old/new start/end after a successful reschedule. */
  'card:move': CalendarMoveEvent;
}

/**
 * Create a calendar viewer of rows as cards on a month grid or a week
 * day-grid. Pass a DOM element to render into, or `null` for a headless
 * calendar that computes the same range and card model without a DOM.
 */
export function createCalendar(el: HTMLElement | null, config?: CalendarConfig): Calendar;
export default createCalendar;
