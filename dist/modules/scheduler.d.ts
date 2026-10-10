/*!
 * Lattice Grid 1.98.0, scheduler module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  createGrid,
  version,
} from '../lattice-grid.js';

/** A row backing a scheduler resource or event: any object. Its identity comes from `resourceKey`/`eventKey`. */
type SchedulerRow = Record<string, unknown>;

/** A scheduler zoom level name, or a bare pixels-per-day number. */
type SchedulerZoom = 'hour' | 'day' | 'week' | 'month' | 'quarter' | number;

/** The field-to-property mapping naming the data each event and resource reads. */
export interface SchedulerFields {
  /** The field on an event naming its resource (the resource key). Default `'resourceId'`. */
  resourceId?: string;
  /** The field on an event naming its start. Default `'startDate'`. */
  startDate?: string;
  /** The field on an event naming its end; omitted falls back to `defaultDuration`. */
  endDate?: string;
  /** The field naming an event's display text. Default `'name'`. */
  name?: string;
  /** The field on a resource naming its calendar (a spec, or an id into `calendars`). */
  calendar?: string;
}

/** A non-working calendar spec: the `'weekends'` shorthand, or workdays plus holidays. */
export interface SchedulerCalendar {
  /** Working weekdays, 0=Sun…6=Sat. Default Mon–Fri. */
  workdays?: number[];
  /** Non-working dates, as `Date`, `'YYYY-MM-DD'` or day numbers. */
  holidays?: unknown[];
}

/**
 * The `workload` band option: a per-resource utilisation
 * strip drawn at the bottom of each row, computed with the Gantt's own
 * `computeWorkload` against each resource's calendar and capacity.
 */
export interface SchedulerWorkload {
  /** Hours per working day, the demand unit a calendar-less capacity is measured against. Default 8. */
  hoursPerDay?: number;
  /** The unitless capacity a calendar-less resource with none stated reads as. Default 1. */
  defaultCapacity?: number;
  /** Decimal places in the over-allocation percentage. Default 1. */
  decimals?: number;
}

/** A keyed-diff consumer surface, the same contract a grid's `rows` exposes. */
export interface SchedulerKeyedRows {
  /** Set `add` rows, merge `update` patches, drop `remove` keys. */
  apply(change: { add?: SchedulerRow[]; update?: SchedulerRow[]; remove?: unknown[] }): void;
  /** Iterate the stored rows. */
  forEach(fn: (row: SchedulerRow, key: unknown) => void): void;
  /** The row stored under a key. */
  get(key: unknown): SchedulerRow | undefined;
  /** The number of stored rows. */
  readonly count: number;
}

/** The scheduler's computed model, for tests and headless callers. */
export interface SchedulerModel {
  /** The first day of the axis span, a whole day-number. */
  startDay: number | null;
  /** The exclusive end of the axis span, a whole day-number. */
  endDay: number | null;
  /** The pixels-per-day the axis is drawn at. */
  pxPerDay: number;
  /** The header ticks, `{ day, label }`. */
  ticks: { day: number; label: string }[];
  /** Events whose start could not be read. */
  unscheduled: { key: unknown; row: SchedulerRow }[];
}

/** The event placement, for tests and headless callers. */
export interface SchedulerPlacement {
  /** Resource key → placed event models. */
  byResource: Map<unknown, unknown[]>;
  /** Events whose start could not be read. */
  unscheduled: unknown[];
  /** Event key → placed event model. */
  keys: Map<unknown, unknown>;
}

/**
 * The configuration for {@link createScheduler}. `resources` are the left
 * grid's rows; `events` draw as bars. `createGrid` is the page's own grid
 * factory, injected so the scheduler shares the page's one core.
 */
export interface SchedulerConfig {
  /** The resources (one row each), or seed through `rows.apply`. */
  resources?: SchedulerRow[];
  /** The events (one bar each), or seed through `events.apply`. */
  events?: SchedulerRow[];
  /** The field-to-property mapping naming the data each event and resource reads. */
  fields?: SchedulerFields;
  /** The grid factory the left resource table mounts through (required for a DOM mount). */
  createGrid?: unknown;
  /** The resource identity field. Default `'id'`. */
  resourceKey?: string;
  /** The event identity field. Default `'id'`. */
  eventKey?: string;
  /** The left table's columns; defaults to name/role/capacity. */
  columns?: unknown[];
  /** The zoom: a preset name or px-per-day. Default `'day'`. */
  zoom?: SchedulerZoom;
  /** The anchor date the axis centres on. Default the earliest event start, else today. */
  date?: Date | string | number;
  /** The minutes an event without an end runs. Default 60. */
  defaultDuration?: number;
  /** The row height in px. Default 34. */
  rowHeight?: number;
  /** BCP-47 locale for tick labels. */
  locale?: string;
  /** IANA time-zone name for tick labels. Default UTC. */
  timeZone?: string;
  /** Week-start weekday, 0=Sun…6=Sat. */
  weekStartDay?: number;
  /** Draw the today line. Default true. */
  todayLine?: boolean;
  /** Shade each resource's non-working days from its calendar. Default true. */
  nonWorking?: boolean;
  /** Named calendars referenced by a resource's `calendar` field. */
  calendars?: Record<string, SchedulerCalendar | 'weekends'>;
  /** Draw the per-resource utilisation band; `true` takes the defaults. */
  workload?: boolean | SchedulerWorkload;
  /** The root's accessible label. */
  ariaLabel?: string;
  /** A message catalogue with a `t(key, params)` formatter. */
  messages?: unknown;
  /** Raw label overrides for the built-in English. */
  labels?: Record<string, string>;
  /** Extra rows rendered above/below the viewport. Default 5. */
  overscan?: number;
  /** A field whose value colours the bar edge. */
  colorProperty?: string;
  /** Value → CSS colour for `colorProperty`. */
  colorMap?: Record<string, string>;
  /** Group the resources by a field name or a per-resource function; `null` is flat. */
  groupBy?: string | ((resource: SchedulerRow) => unknown) | null;
  /** A case-insensitive query that narrows both the resource rows and the event bars. */
  search?: string;
  /** A predicate a resource must pass to stay visible; `null` clears it. */
  resourceFilter?: ((resource: SchedulerRow) => unknown) | null;
  /** A predicate an event must pass to keep its bar; `null` clears it. */
  eventFilter?: ((event: SchedulerRow) => unknown) | null;
  /** Enable pointer/keyboard editing of events. Default true. */
  editable?: boolean;
  /** A predicate naming events that refuse edits (a read-only event). */
  readOnlyWhen?: (event: SchedulerRow) => boolean;
  /** A predicate naming resources that refuse edits (a read-only row). */
  resourceReadOnlyWhen?: (resource: SchedulerRow) => boolean;
}

/** The field-level edit an event edit reports: each changed field's old and new value. */
export type SchedulerEventFieldChanges = Record<string, { from: unknown; to: unknown }>;

/** The payload every scheduler edit event carries: the event id, the changed fields and the before/after snapshots. */
export interface SchedulerEventChange {
  /** The event's key. */
  id: unknown;
  /** What changed: `'move' | 'reassign' | 'resize' | 'create' | 'delete'`. */
  action: 'move' | 'reassign' | 'resize' | 'create' | 'delete';
  /** Each changed field's old and new values (empty for create/delete). */
  changes: SchedulerEventFieldChanges;
  /** The editable fields before the edit, or null for a create. */
  oldValues: Record<string, unknown> | null;
  /** The editable fields after the edit, or null for a delete. */
  newValues: Record<string, unknown> | null;
  /** The originating DOM event, or null for an API call. */
  event: unknown;
}

/** The cancellable `beforeEventChange` payload: cancelling it refuses the edit, data untouched. */
export interface SchedulerEventChangeEvent extends SchedulerEventChange {
  /** Cancel the edit before it is written. */
  preventDefault(reason?: string): void;
}

/** The `eventChange:cancelled` payload: a `beforeEventChange` was vetoed. */
export interface SchedulerEventChangeCancelled extends SchedulerEventChange {
  /** Why the edit was cancelled. */
  reason: string;
}

/** The `zoom:change` payload: the new zoom level and px-per-day. */
export interface SchedulerZoomChangeEvent {
  /** The zoom level name. */
  level: string;
  /** The pixels-per-day. */
  px: number;
}

/** The `change` payload: a reassign moved an event to another resource row. */
export interface SchedulerReassignEvent {
  /** The event's key. */
  id: unknown;
  /** Always `'reassign'`. */
  kind: 'reassign';
  /** The old and new resource keys. */
  resource: { from: unknown; to: unknown };
  /** The event row after the reassign. */
  row: SchedulerRow;
}

/** The event names a scheduler emits. */
export type SchedulerEventName =
  /** Fires after the zoom changed. */
  | 'zoom:change'
  /** Fires after a reassign moved an event to another resource row. */
  | 'change'
  /** Fires before a move/reassign/resize/create/delete commits; cancellable. */
  | 'beforeEventChange'
  /** Fires when a `beforeEventChange` handler vetoed the edit. */
  | 'eventChange:cancelled'
  /** Fires after an edit (or an undo/redo) committed, carrying the id and old/new values. */
  | 'event:change';

/** The payload each scheduler event name carries. */
export interface SchedulerEventPayloads {
  /** The new zoom level and px-per-day, after `setZoom` re-rendered. */
  'zoom:change': SchedulerZoomChangeEvent;
  /** A reassign wrote a new resource onto the event, carrying the old and new keys. */
  'change': SchedulerReassignEvent;
  /** The edit about to be written, with `preventDefault` to refuse it. */
  'beforeEventChange': SchedulerEventChangeEvent;
  /** The edit a `beforeEventChange` handler vetoed, with the reason. */
  'eventChange:cancelled': SchedulerEventChangeCancelled;
  /** The committed edit (or undo/redo), carrying the id and old/new values. */
  'event:change': SchedulerEventChange;
}

/** The scheduler instance {@link createScheduler} returns. */
export interface Scheduler {
  /** The keyed-diff surface over the resources (the left grid's rows). */
  rows: SchedulerKeyedRows;
  /** The keyed-diff surface over the events. */
  events: SchedulerKeyedRows;
  /** The live resource array. */
  resources: SchedulerRow[];
  /** The resource identity field. */
  rowKey: string;
  /** The event identity field. */
  eventKey: string;
  /** The last computed model. */
  model: SchedulerModel;
  /** The last event placement. */
  placement: SchedulerPlacement;
  /** Re-seed from the config arrays (unless a diff landed) and re-render. */
  refresh(): Scheduler;
  /** Replace every event and re-render, keyed by `eventKey`. */
  setEvents(events: SchedulerRow[]): Scheduler;
  /** Change the zoom and re-render, firing `zoom:change`. */
  setZoom(zoom: SchedulerZoom): Scheduler;
  /** The current zoom `{ level, px }`. */
  getZoom(): { level: string; px: number };
  /** Group the resources by a field or function, re-mounting the left grid. */
  setGroupBy(groupBy: string | ((resource: SchedulerRow) => unknown) | null): Scheduler;
  /** Set the search query that narrows rows and bars; `''` clears it. */
  setSearch(query: string): Scheduler;
  /** Set the resource filter; `null` clears it. */
  setResourceFilter(fn: ((resource: SchedulerRow) => unknown) | null): Scheduler;
  /** Set the event filter; `null` clears it. */
  setEventFilter(fn: ((event: SchedulerRow) => unknown) | null): Scheduler;
  /** Expand or collapse one group by its value. */
  toggleGroup(value: unknown): Scheduler;
  /** The editing controller: `move`, `reassign`, `resize`, `create`, `remove`, `undo`, `redo`. */
  edit: unknown;
  /** Undo the most recent edit. */
  undo(opts?: { origin?: string }): boolean;
  /** Redo the most recently undone edit. */
  redo(opts?: { origin?: string }): boolean;
  /** Whether there is an edit to undo. */
  canUndo(): boolean;
  /** Whether there is an edit to redo. */
  canRedo(): boolean;
  /** Subscribe to a scheduler event; returns an unsubscribe function. */
  on(name: SchedulerEventName, fn: (payload: SchedulerEventPayloads[SchedulerEventName]) => void): () => void;
  /** Remove an event handler. */
  off(name: SchedulerEventName, fn: (payload: SchedulerEventPayloads[SchedulerEventName]) => void): void;
  /**
   * Serialise the scheduler — the resource table, the time axis and the
   * placed bars — to a standalone SVG string, drawn with a
   * print-safe palette independent of the mounted theme. `''` before anything
   * has been laid out.
   */
  toSVG(svgOpts?: { range?: { from?: number | string | Date; to?: number | string | Date } }): string;
  /**
   * This scheduler as a PNG: `toSVG` rasterised through a
   * canvas. Makes no network request. `null` when nothing is laid out or there
   * is no canvas to rasterise with.
   */
  toPNG(pngOpts?: {
    range?: { from?: number | string | Date; to?: number | string | Date };
    scale?: number;
    background?: string;
  }): Promise<Blob | null>;
  /**
   * Print this scheduler — the resource table, the time axis and the bars —
   * paged and scaled: the table header and time header
   * repeat on every page and no row is split across a page boundary. Opens the
   * browser's own print path over a standalone document; "PDF" is whatever the
   * browser's print dialog offers ("Save as PDF") — no server, no dependency.
   * Always prints in a fixed, print-safe light palette, independent of the
   * mounted theme.
   */
  print(printOpts?: {
    paper?: 'A4' | 'Letter' | 'A3';
    orientation?: 'landscape' | 'portrait';
    fitToWidth?: boolean;
    scale?: number;
    title?: string | false;
    header?: string | ((page: number, pages: number) => string) | false;
    footer?: string | ((page: number, pages: number) => string) | false;
  }): boolean;
  /**
   * Move an event to another resource row and fire `change`
   * (`{ id, kind: 'reassign', resource: { from, to }, row }`). Returns false
   * when the event key is unknown or the resource is unchanged.
   */
  reassign(key: unknown, resourceId: unknown): boolean;
  /** Serialise the restorable view state: `{ version, zoom, scroll }`. */
  getState(): { version: number; zoom: string; scroll: { left: number; top: number } };
  /** Reapply a state snapshot from {@link Scheduler.getState}. */
  setState(state: object): Scheduler;
  /** Tear the scheduler down. */
  destroy(): void;
}

/**
 * Create a resource scheduler: resources as rows in a left Lattice grid and
 * each event as a bar in its resource's row. Pass a DOM element to render
 * into, or `null` for a headless scheduler that computes the same model.
 */
export function createScheduler(el: HTMLElement | null, config?: SchedulerConfig): Scheduler;

/**
 * Build a scheduler over a Gantt controller's assignments — one event per
 * `(task, resource)`, the same plan viewed by resource — wired so a reassign
 * in the scheduler writes the task's assignments back through `gantt.applyEdit`.
 */
export function schedulerFromGantt(el: HTMLElement | null, gantt: unknown, opts?: SchedulerConfig): Scheduler;
/** Build a scheduler over arbitrary dataset rows with a `fields` mapping. */
export function schedulerFromRows(el: HTMLElement | null, rows: SchedulerRow[], opts?: SchedulerConfig): Scheduler;
/** Build a scheduler over a calendar controller's events. */
export function schedulerFromCalendar(el: HTMLElement | null, calendar: unknown, opts?: SchedulerConfig): Scheduler;
export default createScheduler;
