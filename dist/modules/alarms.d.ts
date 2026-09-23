/*!
 * Lattice Grid 1.71.0, alarms module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  FormattingCondition,
} from '../lattice-grid.js';

// The KPI tile's own threshold vocabulary, imported rather than re-declared.
// Four spellings of red/amber/green already exist in this product and a fifth
// is exactly what this module was told not to add.
// Type-only, so the alarms bundle still imports no KPI code at runtime — a
// page alarming on a grid alone does not load the panel.
import type { KPIBand, KPIThresholds, KpiRollupStatus, KpiStatus } from './kpi.js';

/**
 * An alarm's level. The KPI panel's own vocabulary, deliberately — `good |
 * warn | critical` — rather than a fifth spelling of red/amber/green beside
 * the four that already exist. Only `warn` and `critical` ARE alarms: `good`
 * is the healthy level and clears whatever was raised.
 */
type AlarmLevel = KpiStatus;

/** Which of the three kinds of source an alarm came from. */
type AlarmSource = 'kpi' | 'grid' | 'router';

/** The events an alarm set emits. */
type AlarmsEventName =
  /** A level became true and stayed true for its `holdMs` — the alarm is now open. Within a transition between two alarm levels this fires after the clear of the level being left. */
  | 'alarm:raised'
  /** An open alarm is no longer true: the level moved, the source went silent, or the row it was measured on left the grid. Within a transition between two alarm levels this fires before the raise of the level being entered. */
  | 'alarm:cleared';

/** What a handler receives, per alarm event. */
interface AlarmsEventPayloads {
  /** The alarm that opened. */
  'alarm:raised': AlarmEvent;
  /** The alarm that closed. */
  'alarm:cleared': AlarmEvent;
}

/**
 * One alarm, as `alarm:raised` and `alarm:cleared` carry it and as
 * {@link Alarms.active} lists it.
 */
interface AlarmEvent {
  /**
   * The alarm's stable identity, `<source>:<sourceId>:<key>:<level>` — for example
   * `grid:grid#1:row-7/cpu:critical`. **This format is public API**: a host keys its own
   * ticket or incident records by it, so it is documented rather than left to change.
   */
  id: string;
  /** Which kind of source raised it. */
  source: AlarmSource;
  /** Which source of that kind: the `sourceId` given at attach, else `kpi#1`, `grid#2`, … */
  sourceId: string;
  /**
   * What inside the source is alarming: a KPI tile's id, a grid cell as
   * `<rowKey>/<column>` (the row key JSON-encoded when it is not a string), or a router
   * route's `label`.
   */
  key: string;
  /** The level this event is about — the one raised, or the one cleared. */
  level: AlarmLevel;
  /**
   * The level the source held before this transition, or null when it held none — the
   * first reading of a source. On a clear it is the level being cleared, because that is
   * what the source held.
   */
  previous: KpiRollupStatus | null;
  /** The reading at the transition. */
  value: unknown;
  /** The cut points it was graded against, or null when it was graded by `bands`. */
  threshold: KPIThresholds | null;
  /** The bands it was graded against, or null when it was graded by `thresholds`. */
  band: KPIBand[] | null;
  /** When the transition was emitted, as a millisecond timestamp from the set's clock. */
  at: number;
  /** The hold this transition had to survive before it was believed. */
  holdMs: number;
}

/** A transition that has been observed but not yet held long enough to be believed. */
interface PendingAlarm {
  /** The id the alarm will carry if the level survives its hold. */
  id: string;
  /** Which kind of source is holding it. */
  source: AlarmSource;
  /** Which source of that kind. */
  sourceId: string;
  /** What inside the source is holding. */
  key: string;
  /** The level being held. */
  level: KpiRollupStatus | null;
  /** The level still in force until the hold elapses. */
  previous: KpiRollupStatus | null;
  /** The reading that started the hold. */
  value: unknown;
  /** When the hold started, as a millisecond timestamp. */
  at: number;
  /** How long the level must persist. */
  holdMs: number;
}

/**
 * The clock the hold timer runs on, injected so a test can drive a thousand
 * crossings through a `holdMs` window without sleeping for it.
 */
interface AlarmsClock {
  /** The current time, in milliseconds. */
  now(): number;
  /** Schedule a hold; returns whatever handle `clearTimeout` will be given. */
  setTimeout(fn: () => void, ms: number): unknown;
  /** Cancel a hold. */
  clearTimeout(handle: unknown): void;
}

/** An alarm set's configuration. */
interface AlarmsConfig {
  /**
   * The default hold, in milliseconds, for every source attached to this set. A new level
   * must persist this long before its transition is emitted, and a crossing back inside
   * the window discards the pending transition entirely. `0` (the default) emits on every
   * settled crossing. A hold-down, not a rate limit: a sustained breach emits once.
   */
  holdMs?: number;
  /** The clock the hold timer runs on; the real one unless a test supplies its own. */
  clock?: AlarmsClock;
}

/** One watched column of an attached grid. */
interface AlarmsColumnOptions {
  /** The cut points the cell is graded against — the KPI tile's own shape. */
  thresholds?: KPIThresholds;
  /** Explicit bands, as an alternative to `thresholds`; the first matching band wins. */
  bands?: KPIBand[];
  /**
   * An extra condition the cell must satisfy before it is graded at all, in the same
   * shape a conditional-formatting rule takes and evaluated by the same code. A cell that
   * fails it raises nothing and clears whatever it had.
   */
  when?: FormattingCondition;
  /** This column's own hold, overriding the attach's and the set's. */
  holdMs?: number;
}

/** What one `attach` call takes. Which keys apply depends on the kind of source. */
interface AlarmsAttachOptions {
  /**
   * This source's id, as it appears in every alarm's `sourceId` and `id`. Defaults to
   * `kpi#1`, `grid#2`, … in attach order; give it a name and the ids stay stable across
   * a reordering.
   */
  sourceId?: string;
  /** This source's hold, overriding the set's `holdMs`. */
  holdMs?: number;
  /** **Grids only.** The columns to watch, keyed by column id; an undeclared column raises nothing. */
  columns?: Record<string, AlarmsColumnOptions>;
  /** **Routers only.** The cut points the route's value is graded against. */
  thresholds?: KPIThresholds;
  /** **Routers only.** Explicit bands, as an alternative to `thresholds`. */
  bands?: KPIBand[];
  /** **Routers only.** What the slice measures; defaults to the number of rows in it. */
  value?: (rows: unknown[]) => unknown;
  /** **Routers only.** The route's name, used as the alarm `key`; defaults to the partition value. */
  label?: string;
}

/**
 * A set of levelled alarms over data that is already graded.
 *
 * It owns no UI and touches no DOM: it observes KPI tiles, grid cells and
 * router routes, holds a changed level for `holdMs` before believing it, and
 * emits `alarm:raised` / `alarm:cleared`. An alarm's identity is
 * `(source, key, level)`, so moving between two alarm levels CLEARS the level
 * being left before it RAISES the level being entered.
 */
interface Alarms {
  /**
   * Attach a source. A KPI panel grades every tile that declares thresholds or bands; a
   * grid grades the cells of the columns named in `columns`; a router grades what its
   * route measures. A router takes the partition value or predicate as the second
   * argument, exactly as `router.attach` does.
   */
  attach(source: unknown, whenOrOpts?: unknown, opts?: AlarmsAttachOptions): Alarms;
  /** Subscribe to `alarm:raised` or `alarm:cleared`; any other name is warned about once. */
  on(name: AlarmsEventName, fn: (event: AlarmsEventPayloads[AlarmsEventName]) => void): () => void;
  /** Every alarm currently open, as the payloads that raised them. Truthful from attach. */
  active(): AlarmEvent[];
  /** Every transition being held — observed, but not yet believed. */
  pending(): PendingAlarm[];
  /**
   * Publish raised and cleared alarms into a router feed as keyed rows, so a NOC alarm
   * grid shows them live. Each emission is its own row — a raise and its later clear are
   * two rows, not one overwritten — and every row carries `kind`, `state`
   * (`'raised'`/`'cleared'`) and `alarmId` beside the alarm's own fields. Route them with
   * a router keyed on `kind`, or with a predicate on it.
   */
  publish(router: unknown, kind?: string): Alarms;
  /** Release every listener, every hold timer and every source. */
  destroy(): void;
}

/** Create a set of levelled alarms over KPI panels, grids and router routes. */
export function createAlarms(config?: AlarmsConfig): Alarms;
export default createAlarms;
