/*!
 * Lattice Grid 1.62.1, gantt module type declarations
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
  id: string | number;
  name?: string;
  start?: number | string | Date;
  end?: number | string | Date;
  duration?: number;
  percentComplete?: number;
  milestone?: boolean;
  parent?: string | number;
  baselineStart?: number | string | Date;
  baselineEnd?: number | string | Date;
  baseline?: { start?: number | string | Date; end?: number | string | Date };
  constraint?: GanttConstraintType;
  constraintDate?: number | string | Date;
  assignee?: string | string[];
  assignees?: string[];
  owner?: string;
  /**
   * Explicit resource assignments with fractional units (BACKLOG-0000948):
   * `units` is a multiplier where 1 is a full-time booking. Use this when a
   * task books a resource at less (or more) than 100%; a bare `assignee` is
   * `units: 1`.
   */
  assignments?: Array<{ resource?: string; name?: string; id?: string; units?: number }>;
  /**
   * The task's effort, in one of two forms (BACKLOG-0001281/1282).
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
   * The budgeted cost (BAC) for earned-value analysis (BACKLOG-0000958). When
   * omitted the task's duration is used as the budget, giving schedule-only EVM.
   */
  cost?: number;
  /**
   * The actual cost incurred (ACWP) for earned-value analysis
   * (BACKLOG-0000958). Left out, the task's cost variance/CPI are `null`.
   */
  actualCost?: number;
}

/**
 * Resource capacities for over-allocation detection and leveling
 * (BACKLOG-0000948): either a list of resources with a capacity (max
 * concurrent units, default 1) or a name→capacity map.
 */
export type GanttResourceSpec =
  | Array<{ id?: string; name?: string; resource?: string; capacity?: number; maxUnits?: number; max?: number; units?: number }>
  | Record<string, number>;

/**
 * A typed dependency between two tasks (by id), with optional lag/lead. `type`
 * defaults to `'FS'`; either endpoint may be a leaf or a summary.
 *
 * `type` also accepts the MS Project string shorthand — `'FS+2'`, `'SS-1'`
 * (BACKLOG-0001072). It is normalised to the structured form on the way in, so
 * `gantt.dependencies` always reads back `{ type, lag }` and there is no second
 * internal representation. Giving both a shorthand lag and a conflicting `lag`
 * field warns; the explicit field wins.
 */
export interface GanttDependency {
  from: string | number;
  to: string | number;
  type?: GanttLinkType | `${GanttLinkType}${'+' | '-'}${number}`;
  lag?: number;
}

/** The computed CPM values for one task (a leaf is scheduled, a summary derived). */
interface GanttScheduledTask {
  id: string;
  name: string;
  duration: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  totalFloat: number;
  critical: boolean;
  percentComplete: number | null;
  parent: string | null;
  isSummary: boolean;
  isMilestone: boolean;
  children: string[];
  /** The planned (baseline) window, present only when the task carries a baseline. */
  baselineStart?: number | null;
  baselineEnd?: number | null;
  /** Variance vs the baseline (actual − planned, day-numbers); a positive value is a slip. */
  startVariance?: number | null;
  finishVariance?: number | null;
  durationVariance?: number | null;
}

/** An unhonourable scheduling constraint, reported rather than obeyed. */
interface GanttConflict {
  id: string;
  type: string;
  at: number | null;
  earliestFeasible: number;
}

/** A CPM schedule result: per-task dates/float and the critical path, or an error. */
interface GanttSchedule {
  ok: boolean;
  error?: { code: string; message: string; cycle?: string[] };
  tasks?: Map<string, GanttScheduledTask>;
  order?: string[];
  critical?: string[];
  criticalPaths?: string[][];
  projectStart?: number;
  projectFinish?: number;
  projectDuration?: number;
  /** Constraints a predecessor made infeasible (empty when all are satisfied). */
  conflicts?: GanttConflict[];
  /** Whether a working-time calendar was applied. */
  calendar?: boolean;
  /** The resource over-allocations for this schedule (BACKLOG-0000948). */
  overAllocations?: GanttOverAllocation[];
  /** The full resource-load report for this schedule (BACKLOG-0000948). */
  resourceLoad?: GanttResourceLoad;
}

/** One contiguous load segment for a resource: how many units are booked over a span. */
interface GanttResourceSegment {
  start: number;
  end: number;
  load: number;
  taskIds: string[];
}

/** A resource booked beyond its capacity across concurrent tasks (BACKLOG-0000948). */
interface GanttOverAllocation {
  resource: string;
  capacity: number;
  start: number;
  end: number;
  load: number;
  taskIds: string[];
}

/** The per-resource load and the over-allocations across a schedule (BACKLOG-0000948). */
interface GanttResourceLoad {
  ok: boolean;
  resources: Array<{ resource: string; capacity: number; peak: number; segments: GanttResourceSegment[] }>;
  overAllocations: GanttOverAllocation[];
  byResource: Map<string, { capacity: number; peak: number; segments: GanttResourceSegment[] }>;
}

/** The result of resource leveling: the shifted tasks and what moved (BACKLOG-0000948). */
interface GanttLevelResult {
  ok: boolean;
  resolved?: boolean;
  tasks?: GanttTask[];
  schedule?: GanttSchedule;
  moves?: Array<{ id: string; from: number; to: number; delay: number }>;
  remaining?: GanttOverAllocation[];
  error?: { code: string; message: string };
}

/** A placement violation flagged by `findViolations`. */
interface GanttViolation {
  id: string;
  placedStart: number;
  earliestStart: number;
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

/** Earned-value metrics for one task or the whole project (BACKLOG-0000958). */
interface GanttEarnedValueRow {
  id: string;
  name: string;
  isSummary: boolean;
  isMilestone: boolean;
  percentComplete: number | null;
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

/** The earned-value result at a status date (BACKLOG-0000958). */
interface GanttEarnedValue {
  ok: boolean;
  error?: { code: string; message: string };
  /** The status date the metrics were evaluated at (day-number). */
  statusDate?: number;
  /** Every task keyed by id (leaf, summary and derived). */
  byTask?: Map<string, GanttEarnedValueRow>;
  /** The same rows in schedule order. */
  rows?: GanttEarnedValueRow[];
  /** The project total, rolled up as money sums of the leaves. */
  project?: GanttEarnedValueRow;
}

/**
 * Compute earned-value management (EVM) metrics for a scheduled plan at a
 * status date (BACKLOG-0000958): PV/BCWS from the baseline, EV/BCWP from
 * %complete, AC/ACWP from the per-task `actualCost`, and the derived SV/CV and
 * SPI/CPI — per leaf, rolled up to summaries and the project. The math is
 * implemented locally in the module (no core-compute dependency).
 */
export function computeEarnedValue(
  tasks: GanttTask[],
  schedule: GanttSchedule,
  options?: { statusDate?: number | string | Date; costField?: string; actualCostField?: string },
): GanttEarnedValue;

/** A headless Gantt controller: holds the model, recomputes on edits, emits changes. */
interface Gantt {
  readonly tasks: GanttTask[];
  readonly dependencies: GanttDependency[];
  readonly schedule: GanttSchedule | null;
  readonly critical: string[];
  /** Constraints the latest schedule could not honour (empty when all are satisfied). */
  readonly conflicts: GanttConflict[];
  readonly autoSchedule: boolean;
  readonly grid: unknown;
  /** The over-allocations from the latest schedule (BACKLOG-0000948). */
  readonly overAllocations: GanttOverAllocation[];
  /** The latest resource-load report, or null before a successful schedule (BACKLOG-0000948). */
  readonly resourceLoad: GanttResourceLoad | null;
  setTasks(tasks: GanttTask[]): GanttSchedule;
  setDependencies(deps: GanttDependency[]): GanttSchedule;
  /**
   * Apply one task edit and recompute — the single gated choke point every
   * drag, keypress, table cell and workload cell commits through.
   *
   * A `work` ARRAY is the task's per-day contour (BACKLOG-0001282). Given
   * without an explicit `start`/`end`/`duration` it SETS the span: the task
   * starts on the contour's first day and runs through its last, so booking
   * hours beyond the bar extends it and clearing an edge bucket pulls it
   * back. Conversely, a `start` or `duration` in the patch re-times an
   * existing contour rather than discarding it — a move keeps its shape, a
   * resize stretches it across the new span at the same daily levels.
   */
  applyEdit(patch: { id: string | number; start?: number; end?: number; duration?: number; percentComplete?: number; work?: number | Array<{ date: number | string | Date; hours: number }> }, editOpts?: { writeBack?: boolean }): GanttSchedule;
  compute(): GanttSchedule;
  findViolations(): GanttViolation[];
  /**
   * Compute the resource load and over-allocations on demand (BACKLOG-0000948),
   * optionally overriding the capacities for this call.
   */
  resources(loadOpts?: { resources?: GanttResourceSpec; defaultCapacity?: number }): GanttResourceLoad;
  /**
   * Resolve resource over-allocation by shifting tasks later — resource
   * leveling (BACKLOG-0000948). Honours the CPM dependencies and the
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
   * Export the current plan as Microsoft Project (MSPDI) XML (BACKLOG-0000950):
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
  on(event: 'schedule' | 'error', fn: (payload: unknown) => void): () => void;
  off(event: 'schedule' | 'error', fn: (payload: unknown) => void): void;
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
     * `ResizeObserver` (BACKLOG-0001079); a container with no box yet holds a
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
     * converted into plan space through `projectEpoch` (BACKLOG-0001079), so
     * "put the line on the real today" is expressible for a relative plan.
     */
    today?: number | string | Date;
    /**
     * The calendar date plan day 0 stands for (BACKLOG-0001079).
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
    label?: 'name' | 'percent' | 'dates' | 'none' | ((task: GanttScheduledTask) => string);
    /** Whether bars can be dragged to move/resize (default true). */
    editable?: boolean;
    /** Pixels from a bar's right edge that begin a resize rather than a move. */
    resizeZone?: number;
    /** Time-scale zoom: a level, or raw pixels-per-day. Omit to fit the width. */
    zoom?: 'day' | 'week' | 'month' | 'quarter' | number;
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
   * Mount the JOINED split view (BACKLOG-0000938): one continuous, row-aligned
   * surface with a left task-grid panel — by default the Task Name tree with
   * expand/collapse, start, finish, duration, assignee avatars and a circular
   * % ring (BACKLOG-0001285), plus any host columns — and the right timeline,
   * sharing a single vertical scroll so every grid row lines up exactly with
   * its bar row. The timeline scrolls horizontally on its own. Composes the
   * controller's schedule; makes no change to grid core.
   *
   * The plan is editable from BOTH panes (BACKLOG-0001280): every gesture
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
   * `workload` adds the resource band beneath the plan (BACKLOG-0001281),
   * which is display-only — it reports hours, it does not accept them.
   */
  mountSplit(container: unknown, options?: {
    height?: number;
    rowHeight?: number;
    headerHeight?: number;
    gridWidth?: number;
    indent?: number;
    zoom?: 'day' | 'week' | 'month' | 'quarter' | number;
    today?: number;
    nonWorking?: 'weekends' | ((day: number) => boolean);
    calendar?: GanttCalendar | null;
    showArrows?: boolean;
    showProgress?: boolean;
    showBaseline?: boolean;
    barLabel?: 'name' | 'percent' | 'dates' | 'none' | ((task: GanttScheduledTask) => string);
    /**
     * Surface earned-value metrics in `kind: 'evm'` columns (BACKLOG-0000958).
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
     * each of which edits the plan through the same path a bar drag takes
     * (BACKLOG-0001280). A column with no `kind` shows the raw task's `key`
     * and edits it only with `editable: true`.
     */
    columns?: Array<{ key: string; title?: string; width?: number; kind?: 'name' | 'assignee' | 'progress' | 'evm' | 'start' | 'end' | 'duration' | 'number'; metric?: 'bac' | 'pv' | 'ev' | 'ac' | 'sv' | 'cv' | 'spi' | 'cpi'; digits?: number; editable?: boolean; editField?: string; render?: (task: GanttScheduledTask, ctx: { rawTask: GanttTask; depth: number }) => unknown }>;
    /**
     * A resource workload band beneath the split view (BACKLOG-0001281):
     * one row per resource on the left and, on the right, that resource's
     * hours per time bucket — aligned column-for-column with the timeline's
     * scale header, scroll-locked to it horizontally (vertically it scrolls
     * on its own), and redrawn in the same paint as the bars whenever the
     * plan changes. `true` takes the defaults below; an object overrides
     * them; omitted, no band is drawn.
     *
     * **Editing (BACKLOG-0001282).** A resource row expands (a disclosure
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
   * Compute earned-value (EVM) metrics for the current plan at a status date
   * (BACKLOG-0000958): PV/EV/AC and the derived SV/CV/SPI/CPI per task, rolled
   * up to summaries and the project. Budget (BAC) is the task's `cost`, or its
   * duration when no cost is given; AC comes from `actualCost`.
   */
  earnedValue(evmOpts?: { statusDate?: number | string | Date; costField?: string; actualCostField?: string }): GanttEarnedValue;
  /** Detach the mounted view, if any. The host still owns the container. */
  unmount(): void;
  /** The mounted view, or null. */
  readonly view: unknown;
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
  /** Resource capacities for over-allocation detection and leveling (BACKLOG-0000948). */
  resources?: GanttResourceSpec;
  /** The capacity for a resource with none stated (default 1 = one full-time booking). */
  defaultCapacity?: number;
  autoSchedule?: boolean;
  grid?: unknown;
  /** Map task fields to grid column ids to enable drag write-back. */
  columns?: { start?: string; end?: string; duration?: string };
  /** Task identity for the live `rows.apply` surface (a field or fn); default 'id'. */
  rowKey?: string | ((row: GanttTask) => unknown);
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
   * name, so an edit on a mapped plan lands instead of springing back
   * (BACKLOG-0001280). A mapping to a READER FUNCTION has no inverse, so an
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
  tasks: GanttTask[];
  dependencies?: GanttDependency[];
  resources?: GanttResourceSpec;
  projectStart?: number | string | Date;
  calendar?: GanttCalendar | null;
  schedule?: GanttSchedule;
}

/**
 * Import a Microsoft Project (MSPDI) XML document (BACKLOG-0000950) into the
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
 * Export a Gantt model to Microsoft Project (MSPDI) XML (BACKLOG-0000950). A
 * scheduled model may be passed so start/finish dates are the computed ones.
 */
export function exportMSPDI(model: GanttMSPDIModel, opts?: { hoursPerDay?: number; projectName?: string }): string;
