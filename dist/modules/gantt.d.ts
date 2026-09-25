/*!
 * Lattice Grid 1.71.3, gantt module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/** One of the four dependency link types (finish-to-start, start-to-start, finish-to-finish, start-to-finish). */
export type GanttLinkType = 'FS' | 'SS' | 'FF' | 'SF';

/** A scheduling constraint: pin the start, pin the finish, or schedule as late as possible. */
export type GanttConstraintType =
  | 'must-start-on' | 'must-finish-on' | 'as-late-as-possible' | 'MSO' | 'MFO' | 'ALAP';

/** A working-time calendar: a Monday–Friday preset, or explicit working weekdays and holidays. */
export type GanttCalendar =
  | 'weekends'
  | { workdays?: number[]; holidays?: Array<string | number | Date> };

/** What a Gantt bar's own label shows: the task name, its percent, its dates, or nothing. */
export type GanttBarLabel = 'name' | 'percent' | 'dates' | 'none';
/** The Gantt timeline's zoom: a named level, or raw pixels-per-day. */
export type GanttZoom = 'day' | 'week' | 'month' | 'quarter';

/**
 * A task in a Gantt plan. Give a `duration` or a `start`+`end` (a day-number,
 * ISO date string or `Date`; one is derived from the other). `milestone: true`
 * (or `duration: 0`) is a zero-duration point. `parent` nests a task under a
 * summary, whose window and progress are DERIVED from its children.
 * `baselineStart`/`baselineEnd` (host-stored) drive planned-vs-actual variance;
 * `constraint` pins or pulls the task; `assignee` and `height` feed the split
 * view's grid panel.
 */
export interface GanttTask {
  /**
   * The task's identity, used by dependencies, edits and `rows.apply`. Stringified; a
   * duplicate id fails the schedule with `duplicate-id`.
   */
  id: string | number;
  /** The task's label in the table and on its bar. Defaults to the id. */
  name?: string;
  /**
   * Where the task is placed — a day-number, an ISO date or a `Date`. It is a floor, not
   * a pin: the forward pass never starts the task earlier, but a predecessor may push it
   * later. Use a `constraint` to pin it.
   */
  start?: number | string | Date;
  /**
   * The task's finish, in the same forms as `start`. Given with `start` and no
   * `duration`, the duration becomes `end − start`.
   */
  end?: number | string | Date;
  /**
   * How long the task takes, in working days (the plan's time unit). Negative fails the
   * schedule with `bad-duration`; a leaf with no duration and no start/end pair is an
   * error, while a summary's is ignored because its window comes from its children.
   */
  duration?: number;
  /**
   * Progress, 0-100, drawn as the filled part of the bar and used as the earned-value
   * multiplier. A summary's is the duration-weighted mean of its descendant leaves;
   * anything unparseable reads as null.
   */
  percentComplete?: number;
  /**
   * Marks a zero-duration point: the task is scheduled as an instant (start equals
   * finish) and drawn as a diamond. `duration: 0` does the same.
   */
  milestone?: boolean;
  /**
   * The id of the summary task this one sits under. A summary is never scheduled in its
   * own right — its window, progress and criticality are derived from its children — and
   * a parent chain that loops fails with `parent-cycle`.
   */
  parent?: string | number;
  /**
   * The planned start the task is measured against, in the same forms as `start`. With a
   * baseline the schedule reports `startVariance` (actual − planned; positive is a slip).
   */
  baselineStart?: number | string | Date;
  /**
   * The planned finish. With both baseline dates the schedule reports `finishVariance`
   * and `durationVariance` too.
   */
  baselineEnd?: number | string | Date;
  /** The planned window as one object, read when `baselineStart`/`baselineEnd` are absent. */
  baseline?: { start?: number | string | Date; end?: number | string | Date };
  /**
   * Pins or pulls the task: must-start-on and must-finish-on place it on
   * `constraintDate`, as-late-as-possible pulls it into its late window, consuming its
   * float. A constraint date earlier than the predecessors allow is reported in
   * `schedule.conflicts` and the feasible date is used instead.
   */
  constraint?: GanttConstraintType;
  /**
   * The date the constraint pins to — a day-number, ISO date or `Date`. Unused by
   * as-late-as-possible.
   */
  constraintDate?: number | string | Date;
  /**
   * Who is booked on the task: one name or a list. Each name is a full-time booking
   * (units 1) for resource load, over-allocation and the split view's avatars. Ignored
   * when `assignments` is present.
   */
  assignee?: string | string[];
  /** An alternative spelling of `assignee`, read when that is absent. */
  assignees?: string[];
  /**
   * A third spelling of `assignee`, read when neither `assignee` nor `assignees` is
   * present.
   */
  owner?: string;
  /**
   * Explicit resource assignments with fractional units:
   * `units` is a multiplier where 1 is a full-time booking. Use this when a
   * task books a resource at less (or more) than 100%; a bare `assignee` is
   * `units: 1`.
   */
  assignments?: Array<{ resource?: string; name?: string; id?: string; units?: number }>;
  /**
   * The task's effort, in one of two forms.
   *
   * A **number** is the task's TOTAL hours; the workload band divides it
   * between the assignments in proportion to their units and spreads each
   * share evenly over the working days the task spans. (`hours` is accepted
   * as the same field under its other common name.)
   *
   * An **array** is an explicit per-day contour — what a planner types into a
   * workload cell — and states each day's hours itself: the task's total is
   * the sum of the entries, nothing is spread, and the contour is
   * authoritative for the span, so `applyEdit` derives the task's `start` and
   * `duration` from its first and last day. An EMPTY array means "no hours
   * booked", which is how clearing every bucket is expressed without reviving
   * the even spread. A bar move re-times the contour onto the new days
   * unchanged; a resize stretches it across the new span at the same daily
   * levels. `date` is an ISO date, a `Date` or a plan day-number; the module
   * writes ISO dates back.
   */
  work?: number | Array<{ date: number | string | Date; hours: number }>;
  /** Leveling priority: a higher value is delayed last (default 0). */
  priority?: number;
  /** An explicit row height (px) for the split view; applied to both panels. */
  height?: number;
  /**
   * The budgeted cost (BAC) for earned-value analysis. When
   * omitted the task's duration is used as the budget, giving schedule-only EVM.
   */
  cost?: number;
  /**
   * The actual cost incurred (ACWP) for earned-value analysis. Left out, the task's cost variance/CPI are `null`.
   */
  actualCost?: number;
}

/**
 * Resource capacities for over-allocation detection and leveling: either a list of resources with a capacity (max
 * concurrent units, default 1) or a name→capacity map.
 */
export type GanttResourceSpec =
  | Array<{ id?: string; name?: string; resource?: string; capacity?: number; maxUnits?: number; max?: number; units?: number }>
  | Record<string, number>;

/**
 * A typed dependency between two tasks (by id), with optional lag/lead. `type`
 * defaults to `'FS'`; either endpoint may be a leaf or a summary.
 *
 * `type` also accepts the MS Project string shorthand — `'FS+2'`, `'SS-1'`. It is normalised to the structured form on the way in, so
 * `gantt.dependencies` always reads back `{ type, lag }` and there is no second
 * internal representation. Giving both a shorthand lag and a conflicting `lag`
 * field warns; the explicit field wins.
 */
export interface GanttDependency {
  /**
   * The predecessor task's id. A link naming a summary is expanded to its descendant
   * leaves before scheduling.
   */
  from: string | number;
  /** The successor task's id. */
  to: string | number;
  /**
   * Which ends the link ties together — finish-to-start (the default), start-to-start,
   * finish-to-finish or start-to-finish — optionally with the MS Project lag shorthand,
   * `'FS+2'` or `'SS-1'`. It is normalised on the way in, so `gantt.dependencies` always
   * reads back as `{ type, lag }`.
   */
  type?: GanttLinkType | `${GanttLinkType}${'+' | '-'}${number}`;
  /**
   * A signed offset on the link in working days; a negative value is a lead. Given
   * alongside a shorthand lag in `type`, this field wins and the mismatch is warned
   * about.
   */
  lag?: number;
}

/** The computed CPM values for one task (a leaf is scheduled, a summary derived). */
interface GanttScheduledTask {
  /** The task's id, as a string. */
  id: string;
  /** The task's name, defaulting to its id. */
  name: string;
  /** The task's length in working days. A summary's is its derived window, `ef − es`. */
  duration: number;
  /**
   * Early start: the earliest day the task can begin once every predecessor and its own
   * placement floor are honoured.
   */
  es: number;
  /**
   * Early finish, `es + duration` (mapped back to calendar days when a working-time
   * calendar is in use).
   */
  ef: number;
  /**
   * Late start: the latest the task can begin without pushing the project finish (or the
   * deadline) out.
   */
  ls: number;
  /**
   * Late finish, `ls + duration`. A task pinned by a constraint has `lf` equal to its
   * `ef`, so it has no float.
   */
  lf: number;
  /**
   * Slack in working days, `ls − es`. Zero means critical; a deadline earlier than the
   * natural finish drives it negative, which is the at-risk signal.
   */
  totalFloat: number;
  /**
   * True when the total float is zero or negative. A summary is critical when any child
   * is; an as-late-as-possible task is always marked critical.
   */
  critical: boolean;
  /**
   * The task's progress, or null when it states none. A summary's is the
   * duration-weighted mean of its descendant leaves, and null when every one of them is a
   * milestone.
   */
  percentComplete: number | null;
  /** The id of this task's summary, or null at the top level. */
  parent: string | null;
  /** True when the task has children, and so was derived from them rather than scheduled. */
  isSummary: boolean;
  /** True when the task's duration is zero — a point in the plan. */
  isMilestone: boolean;
  /** A summary's direct children, by id, in input order. Empty for a leaf. */
  children: string[];
  /** The planned (baseline) window, present only when the task carries a baseline. */
  baselineStart?: number | null;
  /** The planned finish day-number, or null when only a baseline start was given. */
  baselineEnd?: number | null;
  /** Variance vs the baseline (actual − planned, day-numbers); a positive value is a slip. */
  startVariance?: number | null;
  /**
   * `ef − baselineEnd` in days; positive means finishing later than planned. Null without
   * a baseline finish.
   */
  finishVariance?: number | null;
  /**
   * How much longer the task runs than its baseline window, in days. Null unless both
   * baseline dates were given.
   */
  durationVariance?: number | null;
}

/** An unhonourable scheduling constraint, reported rather than obeyed. */
interface GanttConflict {
  /** The task whose constraint could not be honoured. */
  id: string;
  /** The constraint that was refused, as its normalised code (`MSO` or `MFO`). */
  type: string;
  /** The date the constraint asked for, as a day-number, or null when it named none. */
  at: number | null;
  /**
   * The earliest start the predecessors actually allow — the day the engine used instead.
   * It never places a task before its predecessors.
   */
  earliestFeasible: number;
}

/** A CPM schedule result: per-task dates/float and the critical path, or an error. */
interface GanttSchedule {
  /**
   * Whether the schedule computed. False leaves every other field absent except `error`,
   * and the controller keeps its previous schedule.
   */
  ok: boolean;
  /** Why the schedule was refused — the same object the `error` event carries. */
  error?: GanttScheduleError;
  /** Every task's computed values, keyed by id — leaves scheduled, summaries derived. */
  tasks?: Map<string, GanttScheduledTask>;
  /** Every task id in input order, which is the order a table or WBS tree walks. */
  order?: string[];
  /** The ids of the leaf tasks with no float, in input order. */
  critical?: string[];
  /**
   * Each zero-float chain through the network as its own list of ids, so a plan with
   * several critical routes shows all of them.
   */
  criticalPaths?: string[][];
  /**
   * The day the plan is anchored to — the `projectStart` option, or the calendar's first
   * working day when one is set.
   */
  projectStart?: number;
  /** The latest early finish across every task, as a calendar day-number. */
  projectFinish?: number;
  /**
   * `projectFinish − projectStart` in days — calendar days when a working-time calendar
   * stretched the plan, not the sum of the durations.
   */
  projectDuration?: number;
  /** Constraints a predecessor made infeasible (empty when all are satisfied). */
  conflicts?: GanttConflict[];
  /** Whether a working-time calendar was applied. */
  calendar?: boolean;
  /** The resource over-allocations for this schedule. */
  overAllocations?: GanttOverAllocation[];
  /** The full resource-load report for this schedule. */
  resourceLoad?: GanttResourceLoad;
}

/** One contiguous load segment for a resource: how many units are booked over a span. */
interface GanttResourceSegment {
  /** The day the segment begins (inclusive), as a calendar day-number. */
  start: number;
  /**
   * The day the segment ends (exclusive). A task that finishes as another starts does not
   * double-count the boundary.
   */
  end: number;
  /**
   * The units booked across the whole segment — the sum of the covering tasks' assignment
   * units, where 1 is one full-time booking.
   */
  load: number;
  /** The tasks active during the segment, which is what makes a heavy stretch explainable. */
  taskIds: string[];
}

/** A resource booked beyond its capacity across concurrent tasks. */
interface GanttOverAllocation {
  /** The over-booked resource's name. */
  resource: string;
  /**
   * The resource's capacity in units — from the `resources` option, or `defaultCapacity`
   * (1) when it names none.
   */
  capacity: number;
  /** The day the over-allocation begins, as a calendar day-number. */
  start: number;
  /** The day it ends (exclusive). */
  end: number;
  /**
   * The units booked over that stretch — strictly greater than `capacity`, which is what
   * makes it an over-allocation.
   */
  load: number;
  /** The tasks competing for the resource over that stretch. */
  taskIds: string[];
}

/** The per-resource load and the over-allocations across a schedule. */
interface GanttResourceLoad {
  /**
   * Whether the load could be computed. False — with empty lists — when there is no
   * successful schedule to read.
   */
  ok: boolean;
  /**
   * One entry per resource that anything is booked on, sorted by name, each with its
   * capacity, peak load and load segments. A resource named only in the capacities, with
   * no booking, does not appear.
   */
  resources: Array<{ resource: string; capacity: number; peak: number; segments: GanttResourceSegment[] }>;
  /**
   * Every stretch where a resource is booked beyond its capacity, earliest first. Empty
   * when the plan fits.
   */
  overAllocations: GanttOverAllocation[];
  /** The same entries as `resources`, keyed by resource name for a direct lookup. */
  byResource: Map<string, { capacity: number; peak: number; segments: GanttResourceSegment[] }>;
}

/** The result of resource leveling: the shifted tasks and what moved. */
interface GanttLevelResult {
  /**
   * Whether leveling ran. False only when the plan would not schedule, in which case
   * `error` says why.
   */
  ok: boolean;
  /**
   * Whether every over-allocation was cleared. False when only pinned tasks were left to
   * move, or the iteration cap was hit — the partial result is still returned.
   */
  resolved?: boolean;
  /**
   * The tasks with their new starts. These are copies; the controller adopts them unless
   * the call was a dry run.
   */
  tasks?: GanttTask[];
  /** The schedule computed from the levelled tasks. */
  schedule?: GanttSchedule;
  /**
   * What actually moved: the task, its start before leveling, its start after, and the
   * delay in days. Unmoved tasks are not listed.
   */
  moves?: Array<{ id: string; from: number; to: number; delay: number }>;
  /** The over-allocations leveling could not clear. Absent when it resolved everything. */
  remaining?: GanttOverAllocation[];
  /** Why the plan would not schedule — the same codes `GanttSchedule.error` uses. */
  error?: { code: string; message: string };
}

/** A placement violation flagged by `findViolations`. */
interface GanttViolation {
  /** The task placed earlier than its predecessors allow. */
  id: string;
  /** Where the plan puts the task — the `start` on the raw task, as a day-number. */
  placedStart: number;
  /** The earliest start CPM allows, given the dependencies and the calendar. */
  earliestStart: number;
  /** How many days early the placement is, `earliestStart − placedStart`. */
  by: number;
}

/** The four link types, in documented order. */
export const LINK_TYPES: readonly GanttLinkType[];

/** Error codes the scheduler reports (rather than throwing) on bad input. */
export const SCHEDULE_ERROR: Record<string, string>;

/**
 * Compute the CPM schedule for a set of tasks and dependencies: forward and
 * backward passes over the leaf tasks honouring FS/SS/FF/SF + lag, slack/float
 * and the zero-float critical path, with summaries derived from their children,
 * milestones scheduled as points, and dependency cycles refused (never looped).
 */
export function computeSchedule(tasks: GanttTask[], deps?: GanttDependency[], options?: { projectStart?: number | string | Date; deadline?: number | string | Date; calendar?: GanttCalendar | null }): GanttSchedule;

/** The tasks placed earlier than their earliest feasible start (manual validation). */
export function findViolations(tasks: GanttTask[], schedule: GanttSchedule): GanttViolation[];

/** Format an engine day-number as an ISO calendar date (`YYYY-MM-DD`, UTC). */
export function toISODate(day: number): string | null;

/** Earned-value metrics for one task or the whole project. */
/**
 * The earned-value figures themselves, without the task they belong to.
 *
 * The project total is exactly this and no more, so it has its own type
 * rather than claiming to be a row with five fields it has never carried.
 */
interface GanttEarnedValueTotals {
  /** Whether a baseline (not the fallback scheduled window) drove PV. */
  hasBaseline: boolean;
  /** Whether any actual cost fed AC (else AC/CV/CPI are null). */
  hasActualCost: boolean;
  /** Budget at completion (the task's cost, or its duration when no cost). */
  bac: number;
  /** Planned Value (BCWS): budgeted cost of the work scheduled by the status date. */
  pv: number;
  /** Earned Value (BCWP): budgeted cost of the work performed (BAC × %complete). */
  ev: number;
  /** Actual Cost (ACWP): what the work performed actually cost, or null. */
  ac: number | null;
  /** Schedule Variance (EV − PV); positive is ahead of schedule. */
  sv: number;
  /** Cost Variance (EV − AC); positive is under budget; null without AC. */
  cv: number | null;
  /** Schedule Performance Index (EV / PV); null when PV is zero. */
  spi: number | null;
  /** Cost Performance Index (EV / AC); null without AC or when AC is zero. */
  cpi: number | null;
}

/** One task's earned-value figures. */
interface GanttEarnedValueRow extends GanttEarnedValueTotals {
  /** The task the row is for. */
  id: string;
  /** The task's name. */
  name: string;
  /** True for a summary row, whose figures are the sums of its descendant leaves. */
  isSummary: boolean;
  /** True for a zero-duration task. */
  isMilestone: boolean;
  /**
   * The task's progress, reported exactly as the task states it, or null when it states
   * none — which earns nothing. The earned-value multiplier clamps it to 0-100 first.
   */
  percentComplete: number | null;
}

/** The earned-value result at a status date. */
interface GanttEarnedValue {
  /**
   * Whether the metrics could be computed. False when there is no successful schedule to
   * measure against.
   */
  ok: boolean;
  /** Why the metrics were refused — `NO_SCHEDULE` when the plan has not scheduled. */
  error?: { code: string; message: string };
  /** The status date the metrics were evaluated at (day-number). */
  statusDate?: number;
  /** Every task keyed by id (leaf, summary and derived). */
  byTask?: Map<string, GanttEarnedValueRow>;
  /** The same rows in schedule order. */
  rows?: GanttEarnedValueRow[];
  /**
   * The project total, rolled up as money sums of the leaves. The figures only:
   * a total belongs to no task, so it carries no id, name or progress.
   */
  project?: GanttEarnedValueTotals;
}

/**
 * Compute earned-value management (EVM) metrics for a scheduled plan at a
 * status date: PV/BCWS from the baseline, EV/BCWP from
 * %complete, AC/ACWP from the per-task `actualCost`, and the derived SV/CV and
 * SPI/CPI — per leaf, rolled up to summaries and the project. The math is
 * implemented locally in the module (no core-compute dependency).
 */
export function computeEarnedValue(
  tasks: GanttTask[],
  schedule: GanttSchedule,
  options?: { statusDate?: number | string | Date; costField?: string; actualCostField?: string },
): GanttEarnedValue;

/**
 * Why a schedule was refused.
 *
 * The payload of the `error` event — the very object the failed
 * {@link GanttSchedule} carries, handed straight to the handler.
 */
interface GanttScheduleError {
  /**
   * What was wrong: `cycle`, `duplicate-id`, `bad-duration`, `unknown-task`,
   * `unknown-parent`, `parent-cycle`, `self-dependency`, `bad-link-type` or
   * `dep-across-hierarchy`.
   */
  code: string;
  /** The failure in one English sentence, naming the task or link it is about. */
  message: string;
  /** The ids that form the cycle, on a `cycle`. */
  cycle?: string[];
  /** The task the failure is about, where one task is to blame. */
  id?: string;
  /** A rejected dependency's predecessor, on `dep-across-hierarchy`. */
  from?: string;
  /** A rejected dependency's successor, on `dep-across-hierarchy`. */
  to?: string;
}

/**
 * What every cancellable Gantt event carries on top of its own context.
 *
 * The controller's bus mirrors the grid core's `emitBefore` contract exactly,
 * so a host writes the same handler shape against a Gantt as against a grid: a
 * handler refuses the action by calling `preventDefault(reason?)`, by returning
 * `false`, or by throwing, and may be `async` — every thenable return is
 * awaited before the decision, so a confirm dialog or a server check can hold
 * the write. Veto wins. On a veto the matching `<action>:cancelled` fires with
 * the reason and the model is untouched; an action re-validated after an await
 * and no longer applicable is cancelled as `'stale'`.
 *
 * Only the user-initiated paths are gated. The live/router `rows.apply` path is
 * remote truth and raises none of these.
 */
interface GanttBeforeEvent {
  /** Which event this is — `beforeTaskMove`, `beforeTaskDelete` and the rest. */
  type: string;
  /** True once a handler has refused the action. */
  defaultPrevented: boolean;
  /** The reason given to `preventDefault`, or null while nothing has refused it. */
  reason: string | null;
  /** Refuse the action; the optional reason is carried on the `<action>:cancelled` event. */
  preventDefault(reason?: string): void;
}

/**
 * An edit about to be applied to one task: the payload of `beforeTaskEdit`,
 * `beforeTaskMove`, `beforeTaskResize`, `beforeProgressChange` and
 * `beforeMilestoneMove`.
 *
 * One payload for the five, because they are one choke point — `applyEdit`
 * classifies the patch and names the event, so which of the five fires says
 * what kind of edit it is and the context below says what the edit is.
 */
interface GanttTaskEditEvent extends GanttBeforeEvent {
  /** The task being edited, by id. */
  id: string;
  /** The task as it stands before the edit, as a shallow copy. */
  task: GanttTask;
  /** The edit itself: only the fields it changes. */
  patch: { id: string | number; start?: number; end?: number; duration?: number; percentComplete?: number; work?: unknown };
  /** Always `user`: only the user-initiated path is gated. */
  origin: string;
  /** Where the task starts now, from the plan, or its computed early start when it holds no start. */
  from?: number | string | Date;
  /** Where the patch would move it to; absent unless the patch sets `start`. */
  to?: number | string | Date;
  /** The duration the patch asks for; absent unless the patch sets one. */
  duration?: number;
  /** The progress the patch asks for; present only on a `beforeProgressChange`. */
  value?: number;
  /** The progress before it; present only on a `beforeProgressChange`. */
  oldValue?: number;
}

/**
 * An edit that was refused: the payload of `taskEdit:cancelled`,
 * `taskMove:cancelled`, `taskResize:cancelled`, `progressChange:cancelled` and
 * `milestoneMove:cancelled`. The same context the before-event carried, plus
 * the reason; a notification, so it carries no `preventDefault`.
 */
interface GanttTaskEditCancelledEvent {
  /** The task that was not edited. */
  id: string;
  /** The task, unchanged. */
  task: GanttTask;
  /** The edit that was not applied. */
  patch: { id: string | number; start?: number; end?: number; duration?: number; percentComplete?: number; work?: unknown };
  /** Always `user`. */
  origin: string;
  /** Where the task starts, still. */
  from?: number | string | Date;
  /** Where it would have gone. */
  to?: number | string | Date;
  /** The duration that was asked for. */
  duration?: number;
  /** The progress that was asked for. */
  value?: number;
  /** The progress before it. */
  oldValue?: number;
  /** The reason given to `preventDefault`, `'prevented'` when none was, or `'stale'` when the task had gone by the time a handler settled. */
  reason: string;
}

/**
 * Links about to be created: the payload of `beforeDependencyCreate`. A pure
 * removal or reorder adds no link and is not gated at all.
 */
interface GanttDependencyCreateEvent extends GanttBeforeEvent {
  /** Only the links this call adds, normalised. */
  added: GanttDependency[];
  /** The whole list the call would leave behind. */
  dependencies: GanttDependency[];
  /** Always `user`. */
  origin: string;
}

/**
 * Links that were not created: the payload of `dependencyCreate:cancelled`. A
 * notification, so it carries no `preventDefault`.
 */
interface GanttDependencyCreateCancelledEvent {
  /** The links that were not added. */
  added: GanttDependency[];
  /** The list that was not adopted; the controller kept the one it had. */
  dependencies: GanttDependency[];
  /** Always `user`. */
  origin: string;
  /** The reason given to `preventDefault`, or `'prevented'` when none was. */
  reason: string;
}

/** A task about to be deleted, with its incident links: the payload of `beforeTaskDelete`. */
interface GanttTaskDeleteEvent extends GanttBeforeEvent {
  /** The task being deleted, by id. */
  id: string;
  /** The task itself, as a shallow copy — the only chance a handler has to read it. */
  task: GanttTask;
  /** Always `user`: the live/router `rows.apply` remove is never gated. */
  origin: string;
}

/**
 * A task that was not deleted: the payload of `taskDelete:cancelled`. A
 * notification, so it carries no `preventDefault`.
 */
interface GanttTaskDeleteCancelledEvent {
  /** The task that stayed. */
  id: string;
  /** The task itself. */
  task: GanttTask;
  /** Always `user`. */
  origin: string;
  /** The reason given to `preventDefault`, `'prevented'` when none was, or `'stale'`. */
  reason: string;
}

/**
 * The events a Gantt controller raises.
 *
 * The controller's own, not a grid's: `grid.on` takes {@link EventName} and
 * knows nothing about these, and a grid-bound Gantt follows the grid's events
 * itself rather than re-publishing them. `on()` takes a name and a listener and
 * warns about nothing, so a misspelt name is a subscription that never fires.
 *
 * The seven `before…` events are cancellable ({@link GanttBeforeEvent}); each
 * has a matching `<action>:cancelled` that fires when a handler refuses,
 * carrying the same context plus the reason. `schedule` and `error` are the
 * recompute's own pair and are raised on every recompute, whatever caused it.
 */
type GanttEventName =
  /** A recompute succeeded; the payload is the new schedule, resource load and over-allocations included. */
  | 'schedule'
  /** A recompute failed; the previous schedule is kept and the payload says what was wrong. */
  | 'error'
  /** A task edit that is not a move, a resize or a progress change is about to be applied; cancellable. */
  | 'beforeTaskEdit'
  /** A task is about to be moved — the patch sets `start` or `end`; cancellable. */
  | 'beforeTaskMove'
  /** A task is about to be resized — the patch sets `duration`; cancellable. */
  | 'beforeTaskResize'
  /** A task's progress is about to change — the patch sets `percentComplete`; cancellable. */
  | 'beforeProgressChange'
  /** A milestone is about to be moved — a move patch on a zero-length task; cancellable. */
  | 'beforeMilestoneMove'
  /** One or more dependency links are about to be created; cancellable. */
  | 'beforeDependencyCreate'
  /** A task is about to be deleted, along with every link touching it; cancellable. */
  | 'beforeTaskDelete'
  /** A `beforeTaskEdit` handler refused the edit. */
  | 'taskEdit:cancelled'
  /** A `beforeTaskMove` handler refused the move. */
  | 'taskMove:cancelled'
  /** A `beforeTaskResize` handler refused the resize. */
  | 'taskResize:cancelled'
  /** A `beforeProgressChange` handler refused the progress change. */
  | 'progressChange:cancelled'
  /** A `beforeMilestoneMove` handler refused the milestone move. */
  | 'milestoneMove:cancelled'
  /** A `beforeDependencyCreate` handler refused the links. */
  | 'dependencyCreate:cancelled'
  /** A `beforeTaskDelete` handler refused the delete. */
  | 'taskDelete:cancelled';

/** What a handler receives, per Gantt event. */
interface GanttEventPayloads {
  /** The recomputed schedule, exactly as `gantt.schedule` now reads. */
  schedule: GanttSchedule;
  /** Why the recompute failed. */
  error: GanttScheduleError;
  /** The edit about to be applied, with `preventDefault` to stop it. */
  beforeTaskEdit: GanttTaskEditEvent;
  /** The move about to be applied, with `preventDefault` to stop it. */
  beforeTaskMove: GanttTaskEditEvent;
  /** The resize about to be applied, with `preventDefault` to stop it. */
  beforeTaskResize: GanttTaskEditEvent;
  /** The progress about to be written, with `preventDefault` to stop it. */
  beforeProgressChange: GanttTaskEditEvent;
  /** The milestone move about to be applied, with `preventDefault` to stop it. */
  beforeMilestoneMove: GanttTaskEditEvent;
  /** The links about to be created, with `preventDefault` to stop them. */
  beforeDependencyCreate: GanttDependencyCreateEvent;
  /** The task about to be deleted, with `preventDefault` to stop it. */
  beforeTaskDelete: GanttTaskDeleteEvent;
  /** The edit that was not applied, and why. */
  'taskEdit:cancelled': GanttTaskEditCancelledEvent;
  /** The move that was not applied, and why. */
  'taskMove:cancelled': GanttTaskEditCancelledEvent;
  /** The resize that was not applied, and why. */
  'taskResize:cancelled': GanttTaskEditCancelledEvent;
  /** The progress change that was not written, and why. */
  'progressChange:cancelled': GanttTaskEditCancelledEvent;
  /** The milestone move that was not applied, and why. */
  'milestoneMove:cancelled': GanttTaskEditCancelledEvent;
  /** The links that were not created, and why. */
  'dependencyCreate:cancelled': GanttDependencyCreateCancelledEvent;
  /** The task that was not deleted, and why. */
  'taskDelete:cancelled': GanttTaskDeleteCancelledEvent;
}

/** A headless Gantt controller: holds the model, recomputes on edits, emits changes. */
interface Gantt {
  /**
   * The current tasks, as fresh shallow copies — mutating them changes nothing; call
   * `applyEdit` or `setTasks`.
   */
  readonly tasks: GanttTask[];
  /**
   * The current links, as fresh copies, always in the normalised `{ from, to, type, lag
   * }` form.
   */
  readonly dependencies: GanttDependency[];
  /**
   * The latest schedule result. It keeps the last successful one when a recompute fails,
   * so a cycle does not blank the view.
   */
  readonly schedule: GanttSchedule | null;
  /** The critical task ids from the latest schedule; empty when the last compute failed. */
  readonly critical: string[];
  /** Constraints the latest schedule could not honour (empty when all are satisfied). */
  readonly conflicts: GanttConflict[];
  /**
   * Whether the controller was asked to cascade an edit down the dependency chain rather
   * than only recomputing.
   */
  readonly autoSchedule: boolean;
  /** The grid this controller is bound to, or null for a standalone plan. */
  readonly grid: unknown;
  /** The over-allocations from the latest schedule. */
  readonly overAllocations: GanttOverAllocation[];
  /** The latest resource-load report, or null before a successful schedule. */
  readonly resourceLoad: GanttResourceLoad | null;
  /**
   * Replace the whole task list (copied in) and recompute, returning the new schedule.
   * Ignored with a warning after `destroy()`.
   */
  setTasks(tasks: GanttTask[]): GanttSchedule;
  /**
   * Replace the link list and recompute. Adding a link is gated on
   * `beforeDependencyCreate`, so this returns undefined on a veto, or a promise when a
   * handler defers; a pure removal or reorder applies straight away.
   */
  setDependencies(deps: GanttDependency[]): GanttSchedule;
  /**
   * Apply one task edit and recompute — the single gated choke point every
   * drag, keypress, table cell and workload cell commits through.
   *
   * A `work` ARRAY is the task's per-day contour. Given
   * without an explicit `start`/`end`/`duration` it SETS the span: the task
   * starts on the contour's first day and runs through its last, so booking
   * hours beyond the bar extends it and clearing an edge bucket pulls it
   * back. Conversely, a `start` or `duration` in the patch re-times an
   * existing contour rather than discarding it — a move keeps its shape, a
   * resize stretches it across the new span at the same daily levels.
   */
  applyEdit(patch: { id: string | number; start?: number; end?: number; duration?: number; percentComplete?: number; work?: number | Array<{ date: number | string | Date; hours: number }> }, editOpts?: { writeBack?: boolean }): GanttSchedule;
  /**
   * Recompute the schedule now and return it. On success it emits `schedule` and
   * refreshes the resource load; on a cycle or bad input it emits `error` and leaves the
   * previous schedule in place.
   */
  compute(): GanttSchedule;
  /**
   * The tasks placed earlier than CPM allows — the "manual with validation" flag. Empty
   * when every placement is feasible, and when there is no successful schedule.
   */
  findViolations(): GanttViolation[];
  /**
   * Compute the resource load and over-allocations on demand,
   * optionally overriding the capacities for this call.
   */
  resources(loadOpts?: { resources?: GanttResourceSpec; defaultCapacity?: number }): GanttResourceLoad;
  /**
   * Resolve resource over-allocation by shifting tasks later — resource
   * leveling. Honours the CPM dependencies and the
   * working-time calendar. Mutates the model unless `{ dryRun: true }`; with
   * `{ writeBack: true }` and a bound grid the moved tasks are pushed through
   * the grid's edit surface.
   */
  level(levelOpts?: {
    dryRun?: boolean;
    writeBack?: boolean;
    priorityField?: string;
    maxIterations?: number;
    resources?: GanttResourceSpec;
    defaultCapacity?: number;
  }): GanttLevelResult;
  /** Export the scheduled tasks as CSV; `{ dates: true }` writes ISO dates. */
  toCSV(csvOpts?: { dates?: boolean }): string;
  /**
   * Export the current plan as Microsoft Project (MSPDI) XML:
   * tasks, dependencies, constraints, baseline, resources and assignments, plus
   * the working-time calendar, serialised with the computed schedule.
   */
  toMSPDI(xmlOpts?: { hoursPerDay?: number; projectName?: string }): string;
  /**
   * The live consumer surface, mirroring `grid.rows.apply`, so a Data Router
   * can drive the Gantt like any other view. Keyed by the controller's rowKey.
   */
  readonly rows: {
    apply(change: { add?: GanttTask[]; update?: GanttTask[]; remove?: Array<string | GanttTask> }): {
      added: GanttTask[]; updated: GanttTask[]; removed: string[];
    };
  };
  /**
   * Register an event listener; returns a function that unsubscribes. What each event
   * carries is {@link GanttEventPayloads}; the listener is declared with the widest of
   * them, so narrow on the name inside it.
   */
  on(event: GanttEventName, fn: (payload: GanttEventPayloads[GanttEventName]) => void): () => void;
  /** Remove a listener registered with `on`. */
  off(event: GanttEventName, fn: (payload: GanttEventPayloads[GanttEventName]) => void): void;
  /**
   * Render the plan into a container as an SVG timeline (bars, dependency
   * arrows, critical-path highlight, today line, non-working shading,
   * milestones, progress). The view redraws when the schedule recomputes.
   */
  mount(container: unknown, options?: {
    /**
     * The plot width. `'container'` (the default) measures the element it was
     * mounted into and keeps following it, so a plan in a tab, drawer,
     * accordion or split pane fits without the host writing a
     * `ResizeObserver`; a container with no box yet holds a
     * 720px fallback rather than drawing at zero. A number is honoured
     * exactly and installs no observer. Ignored under `zoom`, which warns.
     */
    width?: number | 'container';
    rowHeight?: number;
    labelWidth?: number;
    rowLabels?: boolean;
    showArrows?: boolean;
    showCritical?: boolean;
    showProgress?: boolean;
    dateAxis?: boolean;
    /**
     * The today line, as a plan day-number or a calendar date. A date is
     * converted into plan space through `projectEpoch`, so
     * "put the line on the real today" is expressible for a relative plan.
     */
    today?: number | string | Date;
    /**
     * The calendar date plan day 0 stands for.
     *
     * Display-only: axis ticks, bar labels, tooltips, screen-reader text and
     * the built-in `'weekends'` shading move with it; the schedule, `getState`
     * and the CSV/MSPDI exports do not. Without it, the engine's contract makes
     * day 0 the Unix epoch, which is why a plan written as day offsets renders
     * as January 1970. A host-supplied `nonWorking` function still receives raw
     * plan days.
     */
    projectEpoch?: number | string | Date | null;
    nonWorking?: 'weekends' | ((day: number) => boolean);
    label?: GanttBarLabel | ((task: GanttScheduledTask) => string);
    /** Whether bars can be dragged to move/resize (default true). */
    editable?: boolean;
    /** Pixels from a bar's right edge that begin a resize rather than a move. */
    resizeZone?: number;
    /** Time-scale zoom: a level, or raw pixels-per-day. Omit to fit the width. */
    zoom?: GanttZoom | number;
    /** Scroll so the today line is in view after drawing. */
    scrollToToday?: boolean;
    /** Show a hover tooltip (dates/duration/%/slack); default true. */
    tooltip?: boolean;
    /** Group tasks into swimlanes by a task property name or `fn(task)`. */
    groupBy?: string | ((task: GanttTask) => unknown);
    /** Keyboard editing + focusable bars + ARIA announcements (default true). */
    keyboard?: boolean;
    /** Days a keyboard arrow moves/resizes a task (default 1). */
    moveStep?: number;
  }): unknown;
  /**
   * Mount the JOINED split view: one continuous, row-aligned
   * surface with a left task-grid panel — by default the Task Name tree with
   * expand/collapse, start, finish, duration, assignee avatars and a circular
   * % ring, plus any host columns — and the right timeline,
   * sharing a single vertical scroll so every grid row lines up exactly with
   * its bar row. The timeline scrolls horizontally on its own. Composes the
   * controller's schedule; makes no change to grid core.
   *
   * The plan is editable from BOTH panes: every gesture
   * `mount` has — pointer drag to move, drag on the right edge to resize,
   * arrow-key move, Shift+arrow resize, `l` to link, Delete — works on the
   * timeline here, and a `start`/`end`/`duration`/`progress`/`name` column in
   * the left panel is inline-editable on a double-click. Both routes commit
   * through the same `applyEdit` choke point, so `beforeTaskMove`,
   * `beforeTaskResize`, `beforeProgressChange` and `beforeTaskEdit` stay the
   * single veto whichever pane the edit came from.
   *
   * The three switches that govern it carry the same meaning and the same
   * defaults as `mount`'s: `editable` (default true) turns every edit on or
   * off, both panes at once; `keyboard` (default true) turns off the
   * focusable bars, the arrow-key gestures and the ARIA announcements while
   * leaving pointer editing alone; and `resizeZone` (default 6) is how many
   * pixels in from a bar's right edge begin a resize rather than a move.
   * `workload` adds the resource band beneath the plan,
   * which is display-only — it reports hours, it does not accept them.
   */
  mountSplit(container: unknown, options?: {
    height?: number;
    rowHeight?: number;
    headerHeight?: number;
    gridWidth?: number;
    indent?: number;
    zoom?: GanttZoom | number;
    today?: number;
    nonWorking?: 'weekends' | ((day: number) => boolean);
    calendar?: GanttCalendar | null;
    showArrows?: boolean;
    showProgress?: boolean;
    showBaseline?: boolean;
    barLabel?: GanttBarLabel | ((task: GanttScheduledTask) => string);
    /**
     * Surface earned-value metrics in `kind: 'evm'` columns.
     * `true` computes EVM at the today line (or the project finish); an object
     * overrides the status date and the cost field names.
     */
    evm?: boolean | { statusDate?: number | string | Date; costField?: string; actualCostField?: string };
    /**
     * Whether the plan can be edited: pointer drags on the timeline and the
     * left panel's inline cell editors (default true). Same meaning and
     * default as `mount`'s.
     */
    editable?: boolean;
    /**
     * Keyboard editing + focusable bars + ARIA announcements on the timeline
     * (default true). Same meaning and default as `mount`'s.
     */
    keyboard?: boolean;
    /**
     * Pixels from a bar's right edge that begin a resize rather than a move
     * (default 6). Same meaning and default as `mount`'s.
     */
    resizeZone?: number;
    /**
     * A `{ t(key, params) }` resolver for the view's own text — the live
     * region's edit announcements. Omit it and a gantt bound to a grid borrows
     * that grid's catalogue; a standalone plan falls back to English.
     */
    messages?: { t: (key: string, params?: Record<string, unknown>) => string };
    /**
     * The left panel's columns. `kind` decides what the cell shows and what a
     * double-click edits: `'name'` the WBS tree (edits the name), `'assignee'`
     * the avatars, `'progress'` the % ring (edits `percentComplete`), `'evm'`
     * an earned-value `metric`, and `'start'`/`'end'`/`'duration'` the
     * scheduled window — an ISO date, an ISO date, and a whole number of days,
     * each of which edits the plan through the same path a bar drag takes. A column with no `kind` shows the raw task's `key`
     * and edits it only with `editable: true`.
     */
    columns?: Array<{ key: string; title?: string; width?: number; kind?: 'name' | 'assignee' | 'progress' | 'evm' | 'start' | 'end' | 'duration' | 'number'; metric?: 'bac' | 'pv' | 'ev' | 'ac' | 'sv' | 'cv' | 'spi' | 'cpi'; digits?: number; editable?: boolean; editField?: string; render?: (task: GanttScheduledTask, ctx: { rawTask: GanttTask; depth: number }) => unknown }>;
    /**
     * A resource workload band beneath the split view:
     * one row per resource on the left and, on the right, that resource's
     * hours per time bucket — aligned column-for-column with the timeline's
     * scale header, scroll-locked to it horizontally (vertically it scrolls
     * on its own), and redrawn in the same paint as the bars whenever the
     * plan changes. `true` takes the defaults below; an object overrides
     * them; omitted, no band is drawn.
     *
     * **Editing.** A resource row expands (a disclosure
     * button, `aria-expanded`) into one sub-row per task it carries. The
     * resource's own cell is the read-only aggregate; a SUB-ROW cell accepts
     * a typed number of hours on a double-click whenever the view's
     * `editable` is on. What is typed is written to that task's `work`
     * contour through the same `applyEdit` choke point (and the same
     * `beforeTaskEdit` veto) a bar drag uses, so the bar, the table row and
     * the band all move in one paint — including the span, which follows the
     * contour: type into a column beyond the bar and the bar grows to reach
     * it. A bucket containing no working day declines the edit and says so.
     *
     * **Where the hours come from.** They are DERIVED from the tasks, never
     * supplied: a task's own `work` (or `hours`) field when it carries a
     * finite one, otherwise `working days × hoursPerDay × units`, divided
     * between the task's assignments in proportion to their units and spread
     * evenly over the working days the task spans. Working days are the days
     * this view already shades — pass the `calendar`/`nonWorking` option the
     * plan is scheduled with. Resources, units and capacities are the gantt's
     * existing vocabulary (`assignee`/`assignees`/`owner`/`assignments` on a
     * task; `resources`/`defaultCapacity` on `createGantt`); a task naming no
     * resource is carried on an "Unassigned" row rather than dropped. An
     * empty bucket is blank, not `0`, and a bucket over
     * `capacity × hoursPerDay × the bucket's working days` is marked with a
     * class and an accessible label.
     */
    workload?: boolean | {
      /** Hours a full-time (`units: 1`) resource works in a working day; default 8. */
      hoursPerDay?: number;
      /** The band's height in pixels, taken from the view's own `height`; default 160. */
      height?: number;
      /** A band row's height in pixels; default 28. */
      rowHeight?: number;
      /** Maximum decimal places in a cell, trailing zeros dropped; default 1. */
      decimals?: number;
      /** Draw the totals row and totals column; default true. */
      totals?: boolean;
    };
  }): unknown;
  /**
   * Capture a baseline (planned) snapshot of the current schedule as HOST data
   * (this does not mutate the tasks). Store it and feed it back as
   * `baselineStart`/`baselineEnd` task fields to get variance and ghost bars.
   */
  captureBaseline(): Array<{ id: string; baselineStart: number; baselineEnd: number; baselineDuration: number }>;
  /**
   * Compute earned-value (EVM) metrics for the current plan at a status date: PV/EV/AC and the derived SV/CV/SPI/CPI per task, rolled
   * up to summaries and the project. Budget (BAC) is the task's `cost`, or its
   * duration when no cost is given; AC comes from `actualCost`.
   */
  earnedValue(evmOpts?: { statusDate?: number | string | Date; costField?: string; actualCostField?: string }): GanttEarnedValue;
  /** Detach the mounted view, if any. The host still owns the container. */
  unmount(): void;
  /** The mounted view, or null. */
  readonly view: unknown;
  /**
   * Destroy the mounted view, drop the grid subscriptions and clear the listeners. The
   * controller then refuses further edits with a warning; the host still owns the grid
   * and the container.
   */
  destroy(): void;
}

/**
 * Create a Gantt controller over a task list and a dependency list. Computes
 * the CPM schedule immediately and again on every `setTasks`/`setDependencies`/
 * `applyEdit`, emitting `schedule` on success and `error` on a cycle or bad
 * input. `grid` is stored for the write-back binding; `autoSchedule` requests
 * dependent cascading.
 */
export function createGantt(opts?: {
  tasks?: GanttTask[];
  dependencies?: GanttDependency[];
  /** The schedule anchor: a day-number, ISO date string or Date. It only sets the floor a task with no predecessor starts on; it does not change how the schedule is computed. */
  projectStart?: number | string | Date;
  /** A project deadline (a day-number, ISO string or Date); tasks that cannot meet it get negative float. */
  deadline?: number | string | Date;
  /** A working-time calendar: skip weekends/holidays, durations in working days. */
  calendar?: GanttCalendar | null;
  /** Resource capacities for over-allocation detection and leveling. */
  resources?: GanttResourceSpec;
  /** The capacity for a resource with none stated (default 1 = one full-time booking). */
  defaultCapacity?: number;
  autoSchedule?: boolean;
  grid?: unknown;
  /** Map task fields to grid column ids to enable drag write-back. */
  columns?: { start?: string; end?: string; duration?: string };
  /**
   * Task identity for the live `rows.apply` surface (a field or fn, returning
   * a string or number); default 'id'. Composite (`string[]`) keys are
   * core-grid-only: the Gantt keys its own task/board identity from one
   * value, so there is nothing for an array to join into here.
   */
  rowKey?: string | ((row: GanttTask) => string | number);
  /**
   * The host's own names for the task properties the scheduler reads, so a
   * plan can be fed as it already exists rather than renamed for the Gantt:
   * `{ id: 'taskId', start: 'startDate', name: 'jobName' }`. Each value is a
   * field name or a reader `(row) => value`; anything unmapped reads its
   * canonical name. The vocabulary is `id`, `name`, `start`, `end`,
   * `duration`, `milestone`, `percentComplete`, `parent`, `baselineStart`,
   * `baselineEnd`, `constraint`, `constraintDate`.
   *
   * `rowKey` also reaches the scheduler now: a task with no `id` of its own
   * is identified by whatever `rowKey` names, which it previously was not —
   * such a plan was keyed correctly by `rows.apply` and then refused to
   * schedule.
   *
   * A mapping to a field NAME is two-way: `applyEdit` writes back to that
   * name, so an edit on a mapped plan lands instead of springing back. A mapping to a READER FUNCTION has no inverse, so an
   * edit to such a field writes the canonical property and says so once, and
   * `level()` refuses a mapped `start` outright rather than writing where
   * nothing reads. `assignee`, `cost` and `actualCost` belong to the resource
   * and earned-value layers and are not mapped.
   */
  fields?: Record<string, string | ((row: GanttTask) => unknown)>;
  /** Auto-mount into this element at construction. */
  element?: unknown;
}): Gantt;
export default createGantt;

/** The model {@link importMSPDI} returns and {@link exportMSPDI} takes. */
interface GanttMSPDIModel {
  /**
   * The plan's tasks, written out with their outline level, summary and milestone flags,
   * constraints, baseline and progress.
   */
  tasks: GanttTask[];
  /** The typed links, written as predecessor links with their lag on the successor task. */
  dependencies?: GanttDependency[];
  /**
   * The resource list, written with each resource's capacity as `MaxUnits`. Only the
   * array form is read here: a name-to-capacity map is ignored, and its resources then
   * appear only through the tasks' assignments, at capacity 1.
   */
  resources?: GanttResourceSpec;
  /**
   * The project's start date. Defaults to the schedule's own start when a schedule is
   * supplied.
   */
  projectStart?: number | string | Date;
  /**
   * The working-time calendar written as the project's base calendar — a `weekends`
   * preset or explicit workdays and holidays. Null writes no calendar.
   */
  calendar?: GanttCalendar | null;
  /**
   * A computed schedule, so the written start and finish dates are the scheduled ones.
   * Without it (or with a failed one) the tasks' own placements are used.
   */
  schedule?: GanttSchedule;
}

/**
 * Import a Microsoft Project (MSPDI) XML document into the
 * module's model: the task tree, typed dependencies with lag, constraints,
 * baseline, %complete, resources with capacity, the resource assignments, and
 * the working-time calendar. The result is ready to pass to {@link createGantt}.
 */
export function importMSPDI(xml: string, opts?: { hoursPerDay?: number }): {
  ok: boolean;
  error?: string;
  tasks: GanttTask[];
  dependencies: GanttDependency[];
  resources: Array<{ id: string; name: string; capacity: number }>;
  projectStart?: number;
  calendar?: null | { workdays: number[]; holidays: number[] };
};

/**
 * Export a Gantt model to Microsoft Project (MSPDI) XML. A
 * scheduled model may be passed so start/finish dates are the computed ones.
 */
export function exportMSPDI(model: GanttMSPDIModel, opts?: { hoursPerDay?: number; projectName?: string }): string;
