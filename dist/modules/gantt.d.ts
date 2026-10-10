/*!
 * Lattice Grid 1.98.1, gantt module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Align,
  Column,
  ColumnValueSpec,
  Grid,
  GridConfig,
  GridState,
  MenuItem,
  Option,
  createGrid,
  defaults,
} from '../lattice-grid.js';

/** One of the four dependency link types (finish-to-start, start-to-start, finish-to-finish, start-to-finish). */
export type GanttLinkType = 'FS' | 'SS' | 'FF' | 'SF';

/** A scheduling constraint: pin a date, floor/ceiling a start or finish, or schedule as late as possible. */
export type GanttConstraintType =
  | 'as-soon-as-possible' | 'must-start-on' | 'must-finish-on' | 'as-late-as-possible'
  | 'start-no-earlier-than' | 'start-no-later-than' | 'finish-no-earlier-than' | 'finish-no-later-than'
  | 'ASAP' | 'MSO' | 'MFO' | 'ALAP' | 'SNET' | 'SNLT' | 'FNET' | 'FNLT';

/**
 * A task's scheduling mode: which quantity of
 * `effort = duration × Σ units × hours per day` is held when another changes.
 * `fixedDuration` (the default) holds the duration; `fixedEffort` holds the
 * effort so more units shorten the duration; `fixedUnits` holds the units so a
 * bigger effort lengthens the duration.
 */
export type GanttSchedulingMode = 'fixedDuration' | 'fixedEffort' | 'fixedUnits';

/** A working-time calendar: a Monday–Friday preset, or explicit working weekdays and holidays. */
export type GanttCalendar =
  | 'weekends'
  | { workdays?: number[]; holidays?: Array<string | number | Date> };

/**
 * A named working calendar, the value of an entry in the
 * `calendars` option: the plan calendar's shape, with the resource-calendar and
 * exception spellings accepted. A member left out is inherited from the plan calendar.
 */
export interface GanttNamedCalendar {
  /** The working weekdays, 0=Sunday … 6=Saturday; defaults to the plan's. */
  workdays?: number[];
  /** The same as `workdays`, in the resource-calendar spelling. */
  workingDays?: number[];
  /** Days off: ISO dates, `Date`s, day-numbers or inclusive `{ from, to }` ranges; defaults to the plan's. */
  holidays?: Array<string | number | Date | { from: string | number | Date; to: string | number | Date }>;
  /** The same as `holidays`, named as exceptions to the working week. */
  exceptions?: Array<string | number | Date | { from: string | number | Date; to: string | number | Date }>;
  /** The working hours in a day: a flat number or a per-weekday map; defaults to the plan's `hoursPerDay`. */
  hoursPerDay?: number | Record<number, number>;
}

/**
 * What a task's or resource's `calendar` may be: a calendar spec
 * stated inline, the `'weekends'` preset, or the id of an entry in the `calendars` option.
 * An id that names none refuses the schedule with an `unknown-calendar` error.
 */
export type GanttCalendarRef = 'weekends' | string | GanttNamedCalendar;

/** The named calendars a plan offers its tasks and resources, keyed by calendar id. */
export type GanttCalendars = Record<string, GanttNamedCalendar>;

/** One resolved calendar in a schedule: the working time a task was scheduled under. */
export interface GanttResolvedCalendar {
  /** The calendar id the tasks report in `calendar`. */
  id: string;
  /** The working weekdays, 0=Sunday … 6=Saturday. */
  workdays: number[];
  /** The days off, as day-numbers. */
  holidays: number[];
  /** Whether a calendar day-number is a working day under this calendar. */
  isWorking(day: number): boolean;
}

/** What a Gantt bar's own label shows: the task name, its percent, its dates, or nothing. */
export type GanttBarLabel = 'name' | 'percent' | 'dates' | 'none';
/** The Gantt timeline's zoom: a named level, or raw pixels-per-day. */
export type GanttZoom = 'day' | 'week' | 'month' | 'quarter';
/** One level of the split view's built-in zoom control: a preset, or `fit`, which zooms to show the whole plan. */
export type GanttZoomLevel = GanttZoom | 'fit';
/** The level a `zoomChange` moved from or to: a preset, `fit` (the control's fit-to-plan), or `custom` for a raw pixels-per-day. */
export type GanttZoomValue = GanttZoom | 'fit' | 'custom';
/** What changed the split view's zoom: a host `setZoom`/`fitZoom` (`'api'`), the view's own zoom control (`'control'`), or a future pinch/wheel gesture (`'gesture'`). */
export type GanttZoomCause = 'api' | 'control' | 'gesture';
/**
 * The split view's built-in zoom control: a row of
 * day / week / month / quarter / fit-to-plan buttons drawn in the view's
 * own header. `position` picks where they go; `levels` subsets or reorders
 * them.
 */
export interface GanttZoomControlOptions {
  /** `'header'` (default) draws the buttons in the split view's own header; `'toolbar'` builds them detached and exposes them as `view.zoomControl` for a host toolbar to place. */
  position?: 'header' | 'toolbar';
  /** Which levels to draw, in order; defaults to all five (`day`, `week`, `month`, `quarter`, `fit`). Unknown names are ignored. */
  levels?: GanttZoomLevel[];
}
/** Where a Gantt bar's own label sits: `inside` centres it on the bar when it fits, `right` keeps it just past the bar's right edge, and `auto` chooses — inside when it fits, right when it does not. */
export type GanttBarLabelPosition = 'inside' | 'right' | 'auto';
/** How a critical bar is marked: recoloured, or outlined over its own fill. */
export type GanttCriticalStyle = 'fill' | 'outline';

/** A row the task tooltip card can show; `tooltip.fields` picks and orders them. */
export type GanttTooltipField = 'start' | 'end' | 'duration' | 'percentComplete' | 'effort' | 'resources' | 'cost' | 'slack' | 'deadline';

/**
 * What a host's own `tooltip` render function is given: the same scheduled
 * task `label`'s own function gets, plus a `{ t, formatDate, dateAxis,
 * rawTask }` context — `t` the resolved translator, `formatDate` the SAME
 * locale-formatted-date helper the default card's Start/End/Date rows use,
 * `dateAxis` the view's own option, and `rawTask` the host's original task
 * object (for a custom field the scheduled shape does not carry).
 */
export interface GanttTooltipContext {
  /** The Gantt's message function: resolves a catalogue key (such as `gantt.tip.start`) in the active locale, with `{name}` parameters filled in. */
  t: (key: string, params?: Record<string, unknown>) => string;
  /** Formats a schedule day number as a date in the grid/plan locale, the way the built-in card shows Start and End (e.g. "May 1, 2026"). */
  formatDate: (day: number) => string;
  /** Whether the view draws a date axis (the view's own `dateAxis` option); when false, days are plain numbers. */
  dateAxis: boolean;
  /** The host's original task object for this bar, for custom fields the scheduled shape does not carry; null if it cannot be found. */
  rawTask: GanttTask | null;
}

/**
 * The task tooltip: a positioned card on hover and
 * keyboard focus, anchored to the bar, in both `mount` and `mountSplit`.
 *
 * `true` (the default) draws the built-in card: the task name as a title,
 * then labelled Start/End/Duration/Complete rows (dates in the grid/plan
 * locale, e.g. "May 1, 2026"; "Duration: 152 days"), plus Effort, Assigned,
 * Cost and Slack when the task has them. A milestone shows a single Date
 * row instead. `{ fields }` picks and orders the rows (ignored for a
 * milestone, which always shows just its Date). `false` turns the tooltip
 * off. A function renders the host's own content — a `string` (always text)
 * or a `Node`/`HTMLElement` (the host's own DOM, attached as it is; task
 * data put into it should still be set as text, never `innerHTML`).
 */
export type GanttTooltip =
  | boolean
  | { fields?: GanttTooltipField[] }
  | ((task: GanttScheduledTask, ctx: GanttTooltipContext) => string | HTMLElement | null | undefined);

/**
 * The split view's context menu: the host supplies the
 * items for a task's row or bar, and the view shows them in the grid's own
 * menu component. Return `null`/`undefined` (or an empty array) to suppress
 * the menu for that task.
 *
 * The function receives the host's ORIGINAL task object (the same shape
 * `createGantt` took, not the scheduled shape) and the DOM event that asked
 * for the menu — a pointer `contextmenu` event on the row/bar, or `null`
 * when the request came from the keyboard (the Menu key / Shift+F10), where
 * there is no pointer position. `event.preventDefault()` is already called
 * for you; the native menu does not open. Each item's `action` is called
 * with the item (as the grid does) and a `ctx` of `{ task, event, view }` —
 * `task` the same original task, `event` the same DOM event, and `view` the
 * `GanttSplitView` instance the menu belongs to.
 *
 * The third argument, `defaults`, is the built-in task
 * menu: add task above / below, add subtask, add successor, add
 * predecessor, convert to milestone (or back to a task) and delete, labelled
 * from the message catalogue, with the actions on a read-only task disabled.
 * Return it as is to keep it, filter it to hide items, reorder it, or spread
 * it among your own. Pass `contextMenu: true` to install exactly the
 * defaults.
 */
export type GanttContextMenu =
  | true
  | ((task: GanttTask, event: Event | null, defaults: MenuItem[]) => MenuItem[] | null | undefined)
  | null;

/**
 * A vertical date marker: a labelled line drawn through the
 * whole plot at a date, or — given `from`/`to` — a shaded range between two
 * dates. Display-only: it annotates the timeline and never changes the
 * schedule. Pass the `markers` option to `mount` or `mountSplit`.
 */
export interface GanttMarker {
  /**
   * Where the line is drawn: a day-number (plan space), an ISO date string or
   * a `Date`. In the plain view a string/`Date` is rebased through
   * `projectEpoch`. Ignored when `from`/`to` are given.
   */
  date?: number | string | Date;
  /** The range's start, in the same forms as `date`; with `to`, shades from here to there. */
  from?: number | string | Date;
  /** The range's end, in the same forms as `date`; with `from`, shades from there to here. */
  to?: number | string | Date;
  /** The label drawn in the time header at the marker's line (centred over a range). */
  label?: string;
  /** The marker's colour (any CSS colour); defaults to the theme's muted foreground token. */
  colour?: string;
  /** Draw the line(s) dashed rather than solid. */
  dashed?: boolean;
}

/**
 * One load-only booking from another project, named on
 * the `workload.external` option rather than as a task: its hours count in
 * the resource workload band, the histogram and the band's own
 * over-allocation highlight, and it is listed as an "other project"
 * sub-row under its resource, but it is never scheduled, never drawn as a
 * row or a bar, and never touches the critical path, the project finish or
 * a summary — there is no task for any of those to see. The equivalent
 * per-task spelling is a task's own `loadOnly: true` flag.
 */
export interface GanttWorkloadExternal {
  /** The resource the booking is against, matching a name on `resources` or a task's `assignee`. */
  resource: string;
  /** The booking's start, in the same forms as a task's `start`. */
  start: number | string | Date;
  /** The booking's end (exclusive), in the same forms as a task's `end`. */
  end: number | string | Date;
  /** The booking's load as a units multiplier (1 = full-time), spread over its working days at `hoursPerDay`; ignored when `hours` is given. */
  units?: number;
  /** The booking's total hours, spread evenly over its working days; takes precedence over `units`. */
  hours?: number;
  /** The sub-row's label; defaults to a generic "other project" name. */
  label?: string;
  /** An arbitrary tag carried through to the sub-row, for the host's own display or sorting. */
  group?: string;
}

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
   * The task's own bar colour, drawn on its bar, summary
   * bar or milestone with a matching darker progress fill. A CSS colour —
   * `#rrggbb`, `rgb()`/`rgba()`, or a named colour; `barColour` on
   * `mount`/`mountSplit` wins over this field. `color` is accepted as the
   * American spelling.
   */
  colour?: string;
  /**
   * The task's own working calendar: a spec in the plan calendar's
   * shape, or the id of an entry in the `calendars` option. Its duration and lags count
   * that calendar's working days, its bar is shaded by it, and the workload band and
   * `level()` book the days it works. A task without one follows the plan calendar.
   */
  calendar?: GanttCalendarRef;
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
   * schedule with `bad-duration`; a leaf with no duration and no start/end pair is
   * unscheduled (but given no dates or bar until it has one),
   * while a summary's is ignored because its window comes from its children.
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
   * Marks a load-only booking from another project: its
   * own `start`/`end`/`duration` and assignments still count in the
   * resource workload band, the histogram and the band's own
   * over-allocation highlight, listed as an "other project" sub-row under
   * its resource, but the task is kept out of the CPM engine entirely —
   * never scheduled, never drawn as a row or a bar, and never part of a
   * summary, the critical path or the project finish. Not editable; the
   * equivalent non-task spelling is the `workload.external` option.
   */
  loadOnly?: boolean;
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
   * Pins, floors or ceilings the task. `must-start-on`/`must-finish-on` place it on
   * `constraintDate`; `start-no-earlier-than`/`finish-no-earlier-than` only delay it;
   * `start-no-later-than`/`finish-no-later-than` are a ceiling the schedule reports in
   * `schedule.conflicts` rather than obeying; `as-late-as-possible` pulls it into its
   * late window; `as-soon-as-possible` is the explicit spelling of the default. Each
   * code (`MSO`, `SNET`, …) is accepted too.
   */
  constraint?: GanttConstraintType;
  /**
   * The date the constraint applies to — a day-number, ISO date or `Date`. Unused by
   * `as-late-as-possible` and `as-soon-as-possible`.
   */
  constraintDate?: number | string | Date;
  /**
   * A per-task deadline — a day-number, ISO date or `Date`. It
   * is NOT a constraint: the scheduler never moves the task because of it. A
   * finish after the deadline sets the record's `late` flag and drives the
   * task's total float negative (the at-risk signal), and the view draws a
   * deadline marker on the task's row at that date.
   */
  deadline?: number | string | Date;
  /**
   * Hard-locks the task: the scheduler never moves it, no matter what a
   * predecessor does. The task is pinned at its own `start`, or — when it has none — at
   * the date of an `MSO`/`MFO` constraint, if it carries one; a locked task with neither
   * has nothing to lock to and keeps floating with its dependencies. A dependency that
   * would otherwise push it later is left unhonoured and reported in `schedule.conflicts`
   * (as a `'LOCKED'` conflict naming the violated link) instead, and the drawn dependency
   * arrow is marked a conflict. A drag on the task itself is refused by default. See also
   * the plan-level `lockWhen` (on `createGantt` and `computeSchedule`), which locks a task
   * by rule — e.g. 100% complete — without setting this on every task.
   */
  locked?: boolean;
  /** An alternative spelling of `locked: true`, read the same way; any other value is ignored. */
  constraintMode?: 'hard';
  /**
   * Takes the task out of the schedule's arithmetic while keeping it listed and drawn,
   * muted: it is skipped by the CPM passes, the project finish, the
   * critical path, summary rollups, the workload band, cost and earned value. A link
   * through it is bridged rather than broken — `A -> B(inactive) -> C` schedules `C`
   * from `A` directly — and it keeps its OWN dates/duration rather than losing them, so
   * its bar still draws where it was last placed. Round-trips through MSPDI as `<Active>`
   * (`0` is inactive). Never drawn with the unscheduled marker at once —
   * inactive wins when a task is both.
   */
  inactive?: boolean;
  /**
   * Refuses every user-driven edit on the task: pointer and keyboard
   * drag, resize, progress drag, a dependency create/delete touching it, and a
   * task-table cell edit on it — each refused before its own `before*` event fires,
   * with the paired `:cancelled` event carrying reason `'readOnly'`. Unlike `locked`,
   * this says nothing about the scheduler (a predecessor still pushes the task, unless
   * it is also locked) and nothing about the host's own code — `applyEdit`,
   * `setDependencies` and `deleteDependency` called directly still work. See also the
   * plan-level `readOnlyWhen` (on `createGantt`), which refuses by rule without setting
   * this on every task. The row and bar carry a `--readonly` class and an
   * accessible description.
   */
  readOnly?: boolean;
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
   * How the split view's assignment picker behaves for this task. `max: 1` limits the roster to one resource — choosing
   * a second replaces the first — and `units: true` shows the units (percent)
   * field per assignment. Both are read when the picker opens; the roster is
   * still committed as one `applyEdit({ assignments })`.
   */
  assignmentPicker?: GanttAssignmentPicker;
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
  /**
   * The task's scheduling mode; defaults to the plan's
   * `schedulingMode`, then `'fixedDuration'`. Under `fixedEffort` the duration
   * is derived from the effort and the assigned resources' hours; under
   * `fixedUnits`/`fixedDuration` the stated duration is kept.
   */
  schedulingMode?: GanttSchedulingMode;
  /**
   * Whether adding a resource keeps the effort by splitting the units. Only meaningful on a `fixedDuration` task; defaults to
   * the plan's `effortDriven`.
   */
  effortDriven?: boolean;
  /**
   * The task's total effort (work) in hours, the `W` in
   * `effort = duration × Σ units × hours per day`. A scalar `work`/`hours` is
   * read as the same value; a `work` CONTOUR array contributes its summed hours.
   * Required for a `fixedEffort` task to drive its duration.
   */
  effort?: number;
  /** Leveling priority: a higher value is delayed last (default 0). */
  priority?: number;
  /** An explicit row height (px) for the split view; applied to both panels. */
  height?: number;
  /**
   * The budgeted cost (BAC) for earned-value analysis and
   * the task's own fixed cost for `gantt.cost()`. When
   * omitted, `earnedValue()`'s BAC falls back to the rate-derived cost from
   * the task's resource assignments when any resolved to a rate, else to
   * the task's duration, giving schedule-only EVM.
   */
  cost?: number;
  /**
   * The actual cost incurred (ACWP) for earned-value analysis. Left out, the task's cost variance/CPI are `null`.
   */
  actualCost?: number;
  /**
   * A WBS outline code to honour verbatim, rather than
   * deriving one from the task's position in the tree — what `importMSPDI`
   * sets from a source plan's own `<WBS>` so a non-standard code
   * round-trips through `exportMSPDI` unchanged. Prefixed onto this task's
   * own children exactly as a derived code would be. Omit it (the normal
   * case) to have the task's code derived fresh on every compute from `1`,
   * `1.1`, `1.2`, `2`, … — see `GanttScheduledTask.wbs`.
   */
  wbs?: string;
}

/**
 * The assignment picker's per-task behaviour. A task states
 * this to shape the picker the split view's assignee cell opens for it; the
 * roster it produces is committed as one `applyEdit({ assignments })`.
 */
export interface GanttAssignmentPicker {
  /** The most resources the picker holds; `1` makes it single-assignee. */
  max?: number;
  /** Whether each assignment shows its units (percent) field (default true). */
  units?: boolean;
}

/**
 * A single resource's working calendar. Anything it leaves
 * out is inherited from the plan calendar, so a resource that states only
 * `holidays` keeps the plan's working week.
 */
export interface GanttResourceCalendar {
  /** The resource's working weekdays, 0=Sunday … 6=Saturday; defaults to the plan's. */
  workingDays?: number[];
  /**
   * The resource's working hours in a day: a flat number, or a per-weekday map
   * (`{ 1: 7.5, 5: 4 }`). Defaults to the plan's `hoursPerDay`. This sizes the
   * resource's own capacity, not the task's effort (which stays in plan days).
   */
  hoursPerDay?: number | Record<number, number>;
  /**
   * Leave and holidays: ISO date strings, `Date`s, plan day-numbers, or
   * inclusive `{ from, to }` ranges. A day here is non-working for the resource.
   */
  holidays?: Array<string | number | Date | { from: string | number | Date; to: string | number | Date }>;
}

/**
 * A resource's dated rate change: from `from` onward the
 * rate in force is `rate`, replacing whatever was in force before it. `from`
 * is a day-number, ISO date or `Date`.
 */
export interface GanttResourceRateChange {
  /** The day the new rate takes effect, inclusive — a day-number, ISO date or `Date`. */
  from: number | string | Date;
  /** The rate in force from `from` onward, replacing whatever was in force before it. */
  rate: number;
}

/**
 * Resource capacities for over-allocation detection and leveling: either a list of resources or a name→capacity map.
 *
 * A resource may carry its own working `calendar`, in which
 * case load, workload, over-allocation and `level()` measure it against THAT:
 * zero capacity on a day it does not work, and `capacity` is read **in hours
 * per day** (defaulting to that weekday's `hoursPerDay`). A resource with no
 * calendar keeps the historical unitless `capacity` (max concurrent units,
 * default 1), treated as a fraction of the plan `hoursPerDay`.
 *
 * A resource may also carry cost data: `rate` (per hour,
 * for the default `type: 'work'`, or per unit of an assignment's `units`
 * for `type: 'material'`), dated `rates` changes, and `type` — `'cost'`
 * charges its flat `cost` once per assignment, independent of hours or
 * units. `gantt.cost()`/`earnedValue()`/the histogram's `unit: 'cost'` read
 * this; a resource with none of `rate`/`rates`/`cost` costs nothing, so a
 * plan with no rate data is unaffected.
 *
 * A resource may also carry an `avatar` image URL, drawn
 * as a round picture in the split view's assignee column, workload band
 * resource rows and assignment picker — `alt` text is the resource's name,
 * and a resource without one, or whose image fails to load, keeps its
 * initials glyph.
 */
export type GanttResourceSpec =
  | Array<{
    id?: string; name?: string; resource?: string; avatar?: string; capacity?: number; maxUnits?: number; max?: number; units?: number;
    calendar?: GanttResourceCalendar | GanttCalendarRef;
    rate?: number; rates?: GanttResourceRateChange[]; type?: 'work' | 'material' | 'cost'; cost?: number;
  }>
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
export interface GanttScheduledTask {
  /** The task's id, as a string. */
  id: string;
  /** The task's name, defaulting to its id. */
  name: string;
  /** The task's own bar colour, or null when it states none. */
  colour: string | null;
  /**
   * The task's length in working days. A summary's is its derived window, `ef − es`.
   * Null on an unscheduled task.
   */
  duration: number | null;
  /**
   * Early start: the earliest day the task can begin once every predecessor and its own
   * placement floor are honoured. Null on an unscheduled task.
   */
  es: number | null;
  /**
   * Early finish, `es + duration` (mapped back to calendar days when a working-time
   * calendar is in use). Null on an unscheduled task.
   */
  ef: number | null;
  /**
   * The id of the calendar the task was scheduled under: its own
   * calendar's id, `'plan'` when it follows the plan calendar. Present only on a plan
   * that uses the `calendars` option or a task `calendar`.
   */
  calendar?: string;
  /**
   * Late start: the latest the task can begin without pushing the project finish (or the
   * deadline) out. Null on an unscheduled task.
   */
  ls: number | null;
  /**
   * Late finish, `ls + duration`. A task pinned by a constraint has `lf` equal to its
   * `ef`, so it has no float. Null on an unscheduled task.
   */
  lf: number | null;
  /**
   * Slack in working days, `ls − es`. Zero means critical; a deadline earlier than the
   * natural finish drives it negative, which is the at-risk signal. Null on an
   * unscheduled task.
   */
  totalFloat: number | null;
  /**
   * True when the task is unscheduled: a leaf with no duration and no
   * start/end pair to derive one from, or a summary whose leaves are all such. It is kept
   * and listed, with null dates, duration and float, but draws no bar and is left out of
   * the critical path, the project finish, summaries, workload, cost and earned value;
   * its links stay dormant until a duration or date is given. Absent on a scheduled task.
   */
  unscheduled?: true;
  /**
   * True when the task is inactive: kept and listed, drawn muted, with
   * its OWN `es`/`ef`/`duration` (not computed by the CPM passes), null `ls`/`lf`/
   * `totalFloat` (it has no float — it is not part of the network) and never critical. Out
   * of the project finish, the critical path, summary rollups, the workload band, cost and
   * earned value; a link through it is bridged so a predecessor still reaches its
   * successor. Absent on an active task.
   */
  inactive?: true;
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
  /**
   * The task's WBS outline code — `1`, `1.1`, `1.2`, `2`,
   * … — derived from its position among its plan siblings and recomputed
   * fresh every time the schedule recomputes, so a reorder, an indent /
   * outdent, an add or a delete always reads the current number rather
   * than a stale one. A task whose own `wbs` field supplied a code (an
   * MSPDI import that carried one) reads that verbatim instead, and its
   * own children are still numbered under it. Look a task up by its code
   * with `gantt.taskByWbs(code)`.
   */
  wbs: string;
  /**
   * The scheduling mode the task was computed under, present
   * only when the task takes part in effort-driven scheduling. A plain
   * fixed-duration plan carries no such field.
   */
  schedulingMode?: GanttSchedulingMode;
  /** Whether the task is effort-driven; present only on effort-scheduled tasks. */
  effortDriven?: boolean;
  /**
   * The task's effort in hours, `duration × Σ units × hours
   * per day`. Present only on effort-scheduled tasks.
   */
  effort?: number | null;
  /** The task's total assigned units; present only on effort-scheduled tasks. */
  units?: number;
  /** True when the task has children, and so was derived from them rather than scheduled. */
  isSummary: boolean;
  /** True when the task's duration is zero — a point in the plan. */
  isMilestone: boolean;
  /**
   * True when the task is hard-locked — by its own `locked`,
   * `constraintMode: 'hard'`, or the plan's `lockWhen` — so the engine fixed it at its own
   * placement regardless of any predecessor. Always false on a summary.
   */
  locked: boolean;
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
  /**
   * The task's deadline as a calendar day-number, present only when
   * the task states one. It anchors only the late dates — never the early ones — so a
   * deadline never moves the bar.
   */
  deadline?: number;
  /**
   * True when the task's early finish runs past its deadline. Its
   * total float is then negative by construction. Present only on a task that has a
   * deadline, so a plain plan's records are unchanged.
   */
  late?: boolean;
}

/** An unhonourable scheduling constraint, reported rather than obeyed. */
export interface GanttConflict {
  /** The task whose constraint could not be honoured (the locked task itself, for `'LOCKED'`). */
  id: string;
  /**
   * The constraint that was refused, as its normalised code (`MSO`, `MFO`, `SNLT` or
   * `FNLT`), or `'LOCKED'` when a hard-locked task's predecessor would
   * have pushed it later.
   */
  type: string;
  /** The date the constraint asked for, as a day-number, snapped to a working day. For `'LOCKED'`, the task's own fixed start. */
  date: number;
  /**
   * The start (for `MSO`/`SNLT`) or finish (for `MFO`/`FNLT`) the engine actually
   * scheduled instead. It never places a task before its predecessors, and never
   * silently moves it to satisfy a start/finish-no-later-than ceiling. For `'LOCKED'`, the
   * start the violating predecessor would have forced, had the task not been locked.
   */
  scheduled: number;
  /** The same date as `date`; kept so hosts written before 1.88 keep working. */
  at: number;
  /** The earliest START the predecessors allow (for every constraint type); kept from before 1.88. */
  earliestFeasible: number;
  /** The predecessor whose link forced the push; present only on a `'LOCKED'` conflict. */
  from?: string;
  /** The locked task itself (same as `id`); present only on a `'LOCKED'` conflict. */
  to?: string;
}

/** A CPM schedule result: per-task dates/float and the critical path, or an error. */
export interface GanttSchedule {
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
   * working day when one is set. When no explicit `projectStart` is given, it is derived
   * from the earliest task start so the timeline opens on the tasks.
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
  /**
   * Every reason the schedule was refused; `error` is the first. An
   * unknown calendar id on a task or resource is listed here by name, one entry each.
   */
  errors?: GanttScheduleError[];
  /**
   * The calendars the plan's tasks were scheduled under, keyed by calendar id. Present only when a task follows a calendar other than the plan's.
   */
  calendars?: Map<string, GanttResolvedCalendar>;
  /**
   * The ids of the unscheduled tasks, in input order: leaves with no
   * duration or dates, and summaries of only such leaves. Empty when every task is scheduled.
   */
  unscheduled?: string[];
  /**
   * The dependencies with their lags derived from the stored task dates, present only when
   * the schedule was computed with `honourDates`.
   */
  dependencies?: GanttDependency[];
  /** The resource over-allocations for this schedule. */
  overAllocations?: GanttOverAllocation[];
  /** The full resource-load report for this schedule. */
  resourceLoad?: GanttResourceLoad;
}

/** One contiguous load segment for a resource: how many units are booked over a span. */
export interface GanttResourceSegment {
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
export interface GanttOverAllocation {
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
export interface GanttResourceLoad {
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
export interface GanttLevelResult {
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
export interface GanttViolation {
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
/**
 * Every scheduling constraint type the Gantt understands, in MS Project order: ASAP, MSO, MFO, ALAP and the four bounds SNET, SNLT, FNET, FNLT.
 */
export const CONSTRAINT_TYPES: readonly GanttConstraintType[];

/** The three scheduling modes, in documented order. */
export const SCHEDULING_MODES: readonly GanttSchedulingMode[];

/** Error codes the scheduler reports (rather than throwing) on bad input. */
export const SCHEDULE_ERROR: Record<string, string>;

/**
 * Resolve any spelling of a scheduling mode (a host phrase like `'fixed-effort'`
 * or a canonical name) to its canonical {@link GanttSchedulingMode}, or `null`
 * when the value names none.
 */
export function resolveSchedulingMode(value: unknown): GanttSchedulingMode | null;

/**
 * Reconcile one effort edit into the task's duration, units and effort under its
 * scheduling mode — the one rule the API, the split editor and
 * the workload band funnel effort edits through, holding
 * `effort = duration × units × hours per day`. `edit.field` names what changed
 * (`'duration'`, `'effort'`, `'units'`, `'addResource'` or `'removeResource'`),
 * `edit.value` the new value and `edit.units` the booking added or removed.
 */
export function reconcileEffort(
  state: { mode: GanttSchedulingMode; effortDriven?: boolean; duration: number; units: number; hoursPerDay: number },
  edit: { field: 'duration' | 'effort' | 'units' | 'addResource' | 'removeResource'; value?: number; units?: number },
): { duration: number; units: number; effort: number };

/**
 * Whether a task is hard-locked: the scheduler never moves
 * it, whatever a predecessor does. A task locks by an explicit `locked: true`,
 * by the equivalent spelling `constraintMode: 'hard'`, or by the plan's
 * `lockWhen` predicate, which is read off the RAW task; a predicate that
 * throws locks nothing rather than failing the whole schedule.
 */
export function isTaskLocked(raw: object, lockWhen?: (task: object) => boolean): boolean;

/**
 * Compute the CPM schedule for a set of tasks and dependencies: forward and
 * backward passes over the leaf tasks honouring FS/SS/FF/SF + lag, slack/float
 * and the zero-float critical path, with summaries derived from their children,
 * milestones scheduled as points, and dependency cycles refused (never looped).
 */
export function computeSchedule(tasks: GanttTask[], deps?: GanttDependency[], options?: { projectStart?: number | string | Date; deadline?: number | string | Date; calendar?: GanttCalendar | null; calendars?: GanttCalendars; resources?: GanttResourceSpec; schedulingMode?: GanttSchedulingMode; effortDriven?: boolean; hoursPerDay?: number; resourceHours?: Map<string, number>; lockWhen?: (task: GanttTask) => boolean; honourDates?: boolean }): GanttSchedule;

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
export interface GanttEarnedValueTotals {
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
export interface GanttEarnedValueRow extends GanttEarnedValueTotals {
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
export interface GanttEarnedValue {
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
  options?: {
    statusDate?: number | string | Date; costField?: string; actualCostField?: string;
    /**
     * `cost.js`'s per-task rate-derived cost, keyed by id,
     * read as the BAC for a leaf with no explicit `cost`. `createGantt`'s own
     * `earnedValue()` computes and supplies this; a direct caller may pass
     * its own `computeCost` result the same way.
     */
    rateCosts?: Map<string, { cost: number; hasRate: boolean }>;
  },
): GanttEarnedValue;

/** One task's resource-rate cost figures. */
export interface GanttCostRow {
  /** The task the row is for. */
  id: string;
  /** The task's name. */
  name: string;
  /** True for a summary row, whose figures are the sums of its descendant leaves. */
  isSummary: boolean;
  /** True for a zero-duration task. */
  isMilestone: boolean;
  /** The task's total cost: `rateCost + fixedCost`. */
  cost: number;
  /**
   * The rate-derived component: `Σ` a `'work'` resource's assignment effort
   * times the rate in force each day, a `'material'` resource's units times
   * its rate, and a `'cost'` resource's flat amount per assignment.
   */
  rateCost: number;
  /** The task's own explicit `cost` field (0 when it states none). */
  fixedCost: number;
  /**
   * Whether any assignment anywhere under this task resolved to a rate at
   * all. `false` on a plan with no resource rate data, which is what keeps
   * `earnedValue()`'s BAC fallback from ever substituting for a genuinely
   * unrated task.
   */
  hasRate: boolean;
}

/** The resource-rate cost result for a scheduled plan. */
export interface GanttCostResult {
  /** Whether the cost could be computed. False when there is no successful schedule. */
  ok: boolean;
  /** Why the cost was refused — `NO_SCHEDULE` when the plan has not scheduled. */
  error?: { code: string; message: string };
  /** Every task keyed by id (leaf, summary and derived). */
  byTask?: Map<string, GanttCostRow>;
  /** The same rows in schedule order. */
  rows?: GanttCostRow[];
  /** The project total, rolled up as a money sum of the leaves. */
  project?: { cost: number; rateCost: number; fixedCost: number; hasRate: boolean };
}

/**
 * Compute resource-rate cost for a scheduled plan: a
 * resource's hourly `rate` (its dated `rates` changes honoured day by day),
 * a `'material'` resource's cost per unit, or a `'cost'` resource's flat
 * amount per assignment, plus each task's own fixed `cost` field — per
 * task, rolled up to summaries and the project.
 */
export function computeCost(
  tasks: GanttTask[],
  schedule: GanttSchedule,
  options?: {
    resources?: GanttResourceSpec;
    resourceRates?: Map<string, { type: 'work' | 'material' | 'cost'; rate: number | null; rates: { from: number; rate: number }[]; cost: number | null }>;
    hoursPerDay?: number;
    isWorking?: ((day: number) => boolean) | null;
    costField?: string;
    fields?: object;
  },
): GanttCostResult;

/** One cumulative S-curve point: the value of each curve as of a bucket date. */
export interface GanttSCurvePoint {
  /**
   * The bucket END as a day-number — the cumulative value "as of" this date. The final
   * point is the project finish, where `pv` equals the total budget.
   */
  date: number;
  /** Planned Value: the budget planned to be done by this date (linear spread). */
  pv: number;
  /** Earned Value: the budget actually earned by this date (from %complete). */
  ev: number;
  /** Actual Cost: what the work performed cost, all recognised at the status date. */
  ac: number;
}

/**
 * Compute the cumulative S-curve — one `{ date, pv, ev, ac }`
 * point per time bucket from the project start to the project finish. Built from
 * the same per-task inputs {@link computeEarnedValue} reads: PV spreads each leaf's
 * budget linearly over its planned (baseline, else scheduled) window; EV places
 * completed work at the task's finish and in-progress work at the status date; AC is
 * taken at the status date. Returns an empty array without a successful schedule.
 */
export function computeSCurve(
  tasks: GanttTask[],
  schedule: GanttSchedule,
  options?: {
    statusDate?: number | string | Date;
    bucket?: 'day' | 'week' | 'month';
    costField?: string;
    actualCostField?: string;
  },
): GanttSCurvePoint[];

/**
 * The options for {@link createResourceView}.
 *
 * The display options (`unit`, `thresholds`, `columns`, `labelWidth`,
 * `showUnassigned`, `decimals`, `totals`, `hoursPerDay`) mean exactly what
 * they do on `mountSplit`'s `workload` option — the standalone band reuses it.
 */
export interface GanttResourceViewInit {
  /** The resources (`{ id, name, capacity, calendar, avatar, rate }`), the same shape `createGantt`'s `resources` takes. */
  resources?: GanttResourceSpec;
  /** The bookings to draw — a load with no task and no CPM behind it. See {@link GanttWorkloadExternal}. */
  bookings?: GanttWorkloadExternal[];
  /** The band's display unit: hours (default), percent of available, or cost. */
  unit?: 'hours' | 'percent' | 'cost';
  /** Utilisation thresholds colouring each bucket by how full it is; `{ at, className | colour }`, ascending. */
  thresholds?: Array<{ at: number; className?: string; colour?: string; color?: string }>;
  /** The band's own resource-table columns; needs `createGrid`. */
  columns?: Array<string | GanttGridColumn | GanttBandColumn>;
  /** The resource-name column width in pixels; defaults to the band's own label width. */
  labelWidth?: number;
  /** Draw the Unassigned row (bookings naming no resource); default true. */
  showUnassigned?: boolean;
  /**
   * Group the resources by one of their fields (e.g. `'department'`, `'bu'`)
   * or by a function of the resource spec: each group is a collapsible header
   * row carrying the group's summed load and available hours (so thresholds
   * and the percent unit read the group's utilisation), with its resources
   * beneath it. Resources naming no group, and Unassigned, collect last.
   */
  groupBy?: string | ((resource: Record<string, unknown>) => unknown);
  /** Maximum decimal places in a cell, trailing zeros dropped; default 1. */
  decimals?: number;
  /** Draw the totals row and totals column; default true. */
  totals?: boolean;
  /** Hours a full-time (`units: 1`) resource works in a working day; default 8. */
  hoursPerDay?: number;
  /** The bucket zoom: `'day'`/`'week'`/`'month'`/`'quarter'`, or a pixels-per-day number. */
  zoom?: 'day' | 'week' | 'month' | 'quarter' | number;
  /** A today marker on the scale. */
  today?: number | string | Date;
  /** The week's first weekday (0=Sunday…6=Saturday), driving week buckets and the header. */
  weekStartDay?: number;
  /** The working-time calendar the buckets' available hours are measured against. */
  calendar?: GanttCalendar | null;
  /** The host grid factory that backs the band's grid-mode table; without it the band draws as plain DOM rows. */
  createGrid?: (container: unknown, options: unknown) => Grid;
  /** Extra grid config for the band's resource table, exactly `mountSplit`'s `gridConfig`; the time-bucket columns are grid columns too but inert to it, so it can never give them header controls. */
  gridConfig?: Record<string, unknown>;
  /** The band's left (resource) panel width in pixels. */
  gridWidth?: number;
  /** A band row's height in pixels. */
  rowHeight?: number;
  /** The view's height in pixels. */
  height?: number;
  /** A resource histogram band drawn below the workload band. */
  histogram?: boolean | object;
  /** A message-catalogue override for the band's own strings. */
  messages?: Record<string, unknown>;
  /** The resource/booking field-name mapping. */
  fields?: Record<string, string>;
}

/**
 * A standalone resource-load band ({@link createResourceView}), the handle it
 * returns.
 */
export interface GanttResourceView {
  /** The underlying Gantt controller, for events and advanced access. */
  gantt: Gantt;
  /** The underlying split view in its resource-only mode. */
  view: GanttSplitView;
  /** The band's grid-mode table, or `null` without a grid factory. */
  grid: Grid | null;
  /** Apply a new set of bookings and redraw — the live add / update / remove. */
  setBookings(bookings: GanttWorkloadExternal[]): void;
  /** Switch the bucket zoom (`'day'`/`'week'`/`'month'`/`'quarter'` or pixels-per-day). */
  setZoom(level: 'day' | 'week' | 'month' | 'quarter' | number): void;
  /** Switch the display unit (hours, percent of available, or cost). */
  setUnit(unit: 'hours' | 'percent' | 'cost'): void;
  /** The current display unit. */
  getUnit(): 'hours' | 'percent' | 'cost';
  /** Expand or collapse a resource into its bookings (`''` for Unassigned). */
  toggleResource(resource: string, opts?: { event?: unknown }): void;
  /** Collapse or expand a `groupBy` group (`null` or `''` for the "no group" group). */
  toggleGroup(group: string | null): void;
  /** Every band column's current width, by key (`band:resource` etc). */
  getColumnWidths(): Record<string, number>;
  /** Restore band column widths from {@link getColumnWidths}. */
  setColumnWidths(widths: Record<string, number>): void;
  /** Export the band as an SVG string. */
  toSVG(opts?: object): string;
  /** Subscribe to a controller event — `workload:click` is the bucket-click event. */
  on(event: string, fn: (payload: unknown) => void): void;
  /** Unsubscribe a handler added with {@link on}. */
  off(event: string, fn: (payload: unknown) => void): void;
  /** Tear the view down and release the controller. */
  destroy(): void;
}

/**
 * Mount a standalone resource-load band — the workload band on its own, with
 * resources and bookings and no task Gantt.
 *
 * DemandFlow's resource scheduler shows availability by department, BU,
 * division and company, across portfolios and scenarios, with no plan behind
 * it. `createResourceView` is that view: it builds a Gantt controller with no
 * tasks and mounts the SAME workload band `mountSplit` draws, in a
 * resource-only mode where the task table and the timeline bars are hidden and
 * the band fills the view. Every band feature — day/week/month/quarter buckets
 * with the split view's scale header and zoom, hours/percent/cost units with
 * utilisation thresholds, expand-to-bookings, the `workload:click` bucket
 * event, its own grid-backed column definitions and width round-trip, and the
 * SVG export — is reached here unchanged; the band is reused, not forked.
 *
 * `bookings` are the band's load: `{ resource, start, end, units | hours,
 * label, group }` with no task and no CPM, one resource per row, expandable
 * into its own bookings grouped by `group` (one sub-row per group, summed).
 * `groupBy` groups the resources by a field such as
 * `department`, each group a collapsible row of the group's summed load.
 * `setBookings` applies a changed set live.
 *
 * @param container the mount element (needs an `ownerDocument`)
 * @param opts the view's options
 * @returns the view handle, or `null` when the container is unusable
 */
export function createResourceView(container: unknown, opts?: GanttResourceViewInit): GanttResourceView | null;

/**
 * Why a schedule was refused.
 *
 * The payload of the `error` event — the very object the failed
 * {@link GanttSchedule} carries, handed straight to the handler.
 */
export interface GanttScheduleError {
  /**
   * What was wrong: `cycle`, `duplicate-id`, `bad-duration`, `unknown-task`,
   * `unknown-parent`, `parent-cycle`, `self-dependency`, `bad-link-type`,
   * `dep-across-hierarchy` or `unknown-calendar`.
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
  /** The calendar id nothing defines, on `unknown-calendar`. */
  calendar?: string;
  /** Whether the `task` or the `resource` named that calendar, on `unknown-calendar`. */
  owner?: 'task' | 'resource';
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
export interface GanttBeforeEvent {
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
export interface GanttTaskEditEvent extends GanttBeforeEvent {
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
export interface GanttTaskEditCancelledEvent {
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
  /** On a resize gesture's own cancellation: `'start'` when `beforeTaskResizeStart` refused it, `'drag'` when Escape abandoned it; absent for a refused commit. */
  phase?: 'start' | 'drag';
}

/**
 * Links about to be created: the payload of `beforeDependencyCreate`. A pure
 * removal or reorder adds no link and is not gated at all.
 */
export interface GanttDependencyCreateEvent extends GanttBeforeEvent {
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
export interface GanttDependencyCreateCancelledEvent {
  /** The links that were not added. */
  added: GanttDependency[];
  /** The list that was not adopted; the controller kept the one it had. */
  dependencies: GanttDependency[];
  /** Always `user`. */
  origin: string;
  /** The reason given to `preventDefault`, or `'prevented'` when none was. */
  reason: string;
}

/**
 * One link about to be removed: the payload of `beforeDependencyDelete`
 * — the selected-link Delete key and the link editor's own
 * delete action both gate on this.
 */
export interface GanttDependencyDeleteEvent extends GanttBeforeEvent {
  /** The link(s) that match the removal — ordinarily one. */
  removed: GanttDependency[];
  /** The whole list the call would leave behind. */
  dependencies: GanttDependency[];
  /** Always `user`. */
  origin: string;
}

/**
 * A link that was not removed: the payload of `dependencyDelete:cancelled`. A
 * notification, so it carries no `preventDefault`.
 */
export interface GanttDependencyDeleteCancelledEvent {
  /** The link(s) that stayed. */
  removed: GanttDependency[];
  /** The list that was not adopted; the controller kept the one it had. */
  dependencies: GanttDependency[];
  /** Always `user`. */
  origin: string;
  /** The reason given to `preventDefault`, `'prevented'` when none was, or `'stale'` when the link had already gone. */
  reason: string;
}

/**
 * Links that changed: the payload of `dependencies`, fired once a
 * `setDependencies` call or a `deleteDependency` call actually changes the
 * list — after `beforeDependencyCreate`/`beforeDependencyDelete`
 * have already let it through, so a host that only wants to know what changed
 * does not have to diff the whole list on every `schedule` event. A lag-only
 * edit of an existing link (same `from`/`to`/`type`) is neither an add nor a
 * remove and does not fire this.
 */
export interface GanttDependenciesChangedEvent {
  /** The links that are new in this call. */
  added: GanttDependency[];
  /** The links that dropped out in this call. */
  removed: GanttDependency[];
  /** The whole list, as it now stands. */
  dependencies: GanttDependency[];
  /** Always `user`. */
  origin: string;
}

/** A task about to be deleted, with its incident links: the payload of `beforeTaskDelete`. */
export interface GanttTaskDeleteEvent extends GanttBeforeEvent {
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
export interface GanttTaskDeleteCancelledEvent {
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
 * A task about to be added: the payload of `beforeTaskAdd`. Raised by `addTask`, Insert / Shift+Insert and the
 * default menu's add items.
 */
export interface GanttTaskAddEvent extends GanttBeforeEvent {
  /** The id the new task will take. */
  id: string;
  /** The task as it will be inserted, defaults filled in; a copy a handler may read but not change. */
  task: GanttTask;
  /** Where it goes: the one key given, with the anchor task's id; empty when appending. */
  target: { above?: string; below?: string; child?: string; successorOf?: string; predecessorOf?: string };
  /** The finish-to-start link created with it (a successor or predecessor), else `null`. */
  dependency: GanttDependency | null;
  /** Always `user`. */
  origin: string;
}

/**
 * A task that was not added: the payload of `taskAdd:cancelled`. A
 * notification, so it carries no `preventDefault`.
 */
export interface GanttTaskAddCancelledEvent {
  /** The id the task would have taken. */
  id: string;
  /** The task that was not inserted. */
  task: GanttTask;
  /** Where it would have gone. */
  target: { above?: string; below?: string; child?: string; successorOf?: string; predecessorOf?: string };
  /** The link that was not created, else `null`. */
  dependency: GanttDependency | null;
  /** Always `user`. */
  origin: string;
  /** The reason given to `preventDefault`, `'prevented'` when none was, `'readOnly'` for a read-only anchor, or `'stale'`. */
  reason: string;
}

/**
 * A task about to become a milestone or an ordinary task again: the payload
 * of `beforeMilestoneConvert`.
 */
export interface GanttMilestoneConvertEvent extends GanttBeforeEvent {
  /** The task being converted. */
  id: string;
  /** The task as it stands before, as a shallow copy. */
  task: GanttTask;
  /** The kind it becomes. */
  to: 'milestone' | 'task';
  /** Always `user`. */
  origin: string;
}

/**
 * A conversion that did not happen: the payload of
 * `milestoneConvert:cancelled`. A notification, so it carries no
 * `preventDefault`.
 */
export interface GanttMilestoneConvertCancelledEvent {
  /** The task that stayed as it was. */
  id: string;
  /** The task itself. */
  task: GanttTask;
  /** The kind it would have become. */
  to: 'milestone' | 'task';
  /** Always `user`. */
  origin: string;
  /** The reason given to `preventDefault`, `'prevented'` when none was, `'summary'` for a summary, `'readOnly'` for a read-only task, or `'stale'`. */
  reason: string;
}

/**
 * Tasks about to be pasted: the payload of `beforeTaskPaste`. Raised by `pasteTasks` and the Ctrl/Cmd+V key.
 */
export interface GanttTaskPasteEvent extends GanttBeforeEvent {
  /** The new tasks about to be inserted, with their new ids, in plan order; copies a handler may read but not change. */
  tasks: GanttTask[];
  /** The links about to be re-created between the new tasks. */
  dependencies: GanttDependency[];
  /** Where they land: below a task, or as the children of one (`below` is `null` when appending at the end). */
  target: { below: string | null } | { childOf: string };
  /** Whether the tasks came from the Gantt clipboard (`tasks`) or from tab-separated text (`text`). */
  source: 'tasks' | 'text';
  /** Always `user`. */
  origin: string;
}

/**
 * Tasks that were not pasted: the payload of `taskPaste:cancelled`. A
 * notification, so it carries no `preventDefault`.
 */
export interface GanttTaskPasteCancelledEvent {
  /** The new tasks that were not inserted. */
  tasks: GanttTask[];
  /** The links that were not re-created. */
  dependencies: GanttDependency[];
  /** Where they would have landed. */
  target: { below: string | null } | { childOf: string };
  /** Whether the tasks came from the Gantt clipboard or from text. */
  source: 'tasks' | 'text';
  /** Always `user`. */
  origin: string;
  /** The reason given to `preventDefault`, `'prevented'` when none was, or `'stale'`. */
  reason: string;
}

/**
 * A row about to move or re-parent: the payload of `beforeRowMove`. A name-column drag handle, a drop onto another row,
 * Alt+Up/Down (reorder among siblings) and Tab/Shift+Tab (indent/outdent)
 * all gate on this.
 */
export interface GanttRowMoveEvent extends GanttBeforeEvent {
  /** The row being moved, by id. */
  id: string;
  /** The task's parent before the move, or `null` at the root. */
  oldParent: string | null;
  /** The parent it would land under once the move applies, or `null` for the root. */
  newParent: string | null;
  /** Its 0-based index among its old parent's children, before the move. */
  oldIndex: number;
  /** Its 0-based index among its new parent's children, once the move applies. */
  newIndex: number;
  /** Always `user`. */
  origin: string;
  /** The originating DOM event (a drop or a keypress), or `null`. */
  event: unknown;
}

/**
 * A row that moved or was re-parented: the payload of `rowMove`. A notification — it carries no `preventDefault`; the
 * veto was `beforeRowMove`'s job. Fired once per gesture: a drag, a single
 * Alt+Up/Down step or a single Tab/Shift+Tab is one `rowMove` and one undo
 * step, by the live re-parent path.
 */
export interface GanttRowMovedEvent {
  /** The row that moved, by id. */
  id: string;
  /** Its parent before the move, or `null` at the root. */
  oldParent: string | null;
  /** Its parent now, or `null` at the root. */
  newParent: string | null;
  /** Its 0-based index among its old parent's children, before the move. */
  oldIndex: number;
  /** Its 0-based index among its new parent's children, now. */
  newIndex: number;
  /** Always `user`. */
  origin: string;
  /** The originating DOM event (a drop or a keypress), or `null`. */
  event: unknown;
}

/**
 * A row that was not moved: the payload of `rowMove:cancelled`. A notification, so it carries no `preventDefault`.
 */
export interface GanttRowMoveCancelledEvent {
  /** The row that stayed put, by id. */
  id: string;
  /** Its parent, unchanged. */
  oldParent: string | null;
  /** The parent it would have moved under. */
  newParent: string | null;
  /** Its index, unchanged. */
  oldIndex: number;
  /** The index it would have landed at. */
  newIndex: number;
  /** Always `user`. */
  origin: string;
  /** The originating DOM event, or `null`. */
  event: unknown;
  /** The reason given to `preventDefault`, `'prevented'` when none was, or `'stale'`. */
  reason: string;
}

/** One point of a data band series: a dated value at any granularity. */
export interface GanttDataBandPoint {
  /** The point's date: an ISO date string, a `Date` or a day number. */
  date: string | Date | number;
  /** The value at that date. */
  value: number;
  /** An explicit exclusive end for `interpolate: 'spread'`; omitted, a point spreads to the next point's date. */
  end?: string | Date | number;
}

/** The context a data band's `value` function, `format` function and `cellStyle` receive. */
export interface GanttDataBandContext {
  /** The band's id. */
  band: string;
  /** The task id (`value` only). */
  id?: string;
  /** The host task (`value` and `cellStyle` on a task row). */
  task?: Record<string, unknown> | null;
  /** The scheduled record (`value` only). */
  rec?: GanttTask;
  /** The bucket's first day as a day number (`value` only). */
  start?: number;
  /** The bucket's exclusive end as a day number (`value` only). */
  end?: number;
  /** The zoom level the buckets were cut at (`value` only). */
  zoom?: string | null;
  /** The bucket's start as an ISO date (`cellStyle` only). */
  bucketStart?: string;
  /** The bucket's exclusive end as an ISO date (`cellStyle` only). */
  bucketEnd?: string;
  /** Whether the cell is on the totals row (`cellStyle` only). */
  isTotal?: boolean;
  /** Whether the cell is on a summary row (`cellStyle` only). */
  isSummary?: boolean;
}

/** One threshold of a data band: the highest `at` a cell's value reaches styles it. */
export interface GanttDataBandThreshold {
  /** The value from which this threshold applies. */
  at: number;
  /** A theme-token tone: `'ok'`, `'info'`, `'warn'` or `'danger'` (dark-mode safe). */
  tone?: 'ok' | 'info' | 'warn' | 'danger';
  /** A class added to the cell. */
  className?: string;
  /** A background colour of the host's own. */
  colour?: string;
}

/**
 * One linked data band under the split view: a measure per
 * row per timeline bucket — forecast cost per task per week, say — laid out
 * like the workload band and scroll- and zoom-locked to the timeline. The
 * bucket cells carry no header controls under any configuration; the
 * left-hand columns are a real grid when `createGrid` is injected.
 */
export interface GanttDataBand {
  /** The band's id: names it in events, state and `getDataBandTable`. */
  id: string;
  /** The band's title, shown in its header strip. */
  title?: string;
  /** Which rows: the task tree (`'tasks'`, default, collapsing in step with the gantt), `'summaries'` only, `'resources'`, or a host grouping `fn(tasks) => [{ key, label, tasks: ids }]`. */
  rows?: 'tasks' | 'summaries' | 'resources' | ((tasks: Array<Record<string, unknown>>, ctx: { band: string }) => Array<{ key: string; label?: string; tasks: string[] }>);
  /** A leaf task's value for one bucket: `(task, bucketStart, bucketEnd, ctx)`, dates as ISO strings, end exclusive. */
  value?: (task: Record<string, unknown>, bucketStart: string, bucketEnd: string, ctx: GanttDataBandContext) => number | null | undefined;
  /** The task field carrying a `[{ date, value }]` series, re-bucketed to the zoom; used instead of `value`. */
  series?: string;
  /** How a series fills the days between its points: `'none'` (default) or `'spread'` (spread over its days, re-summed per bucket). */
  interpolate?: 'none' | 'spread';
  /** How children roll up to summaries, the totals row and column: `'sum'` (default), `'avg'`, `'last'`, `'min'`, `'max'` or a function. */
  aggregate?: 'sum' | 'avg' | 'last' | 'min' | 'max' | ((values: number[], ctx: object) => number | null);
  /** How a value displays: `'number'` (default), `'currency'`, `'percent'`, `{ type, currency, decimals }` or a function. */
  format?: 'number' | 'currency' | 'percent' | { type: 'number' | 'currency' | 'percent'; currency?: string; decimals?: number } | ((value: number, ctx: object) => string);
  /** The ISO currency code for `format: 'currency'`; default `'USD'`. */
  currency?: string;
  /** Fraction digits; defaults by format. */
  decimals?: number;
  /** The totals row and column: `true` (default) both, `false` neither, or `{ row, column }`. */
  totals?: boolean | { row?: boolean; column?: boolean };
  /** The band's height in pixels; default 160. */
  height?: number;
  /** A band row's height in pixels; default 26. */
  rowHeight?: number;
  /** The left-hand columns: `'name'`, `'total'`, overrides of them, grid columns and {@link GanttBandColumn}-style `{ value(row, ctx), render(row, ctx) }` columns. */
  columns?: Array<string | GanttGridColumn | GanttBandColumn>;
  /** Ascending thresholds that style a bucket cell by its value. */
  thresholds?: GanttDataBandThreshold[];
  /** A cell's own style: a class name, or `{ className, ...css }`. */
  cellStyle?: (value: number | null, ctx: GanttDataBandContext) => string | Record<string, string | number> | null | undefined;
  /** Double-click (or Enter/F2) a task cell to type its value into the `series`, through `beforeDataBandEdit`; series bands only. */
  editable?: boolean;
  /** What a moved or resized task does to its series: `'shift'` (default), `'stretch'` or `'keep'`. */
  onReschedule?: 'shift' | 'stretch' | 'keep';
  /** Start collapsed to the header strip. */
  collapsed?: boolean;
}

/** The payload of `dataBand:change`: a task's series was rewritten for the host to save. */
export interface GanttDataBandChangeEvent {
  /** The band's id. */
  band: string;
  /** The task id. */
  id: string;
  /** The task, carrying the new series. */
  task: Record<string, unknown>;
  /** The series field. */
  field: string;
  /** The new series. */
  series: GanttDataBandPoint[];
  /** The series before the change. */
  previous: GanttDataBandPoint[];
  /** Why: `'shift'` or `'stretch'` after a reschedule, `'edit'` after a cell edit. */
  reason: 'shift' | 'stretch' | 'edit';
  /** The split view. */
  view: GanttSplitView;
  /** The originating DOM event, or `null`. */
  event: unknown;
}

/** The payload of `beforeDataBandEdit`: a typed value about to be written into one bucket. */
export interface GanttDataBandEditEvent extends GanttBeforeEvent {
  /** The band's id. */
  band: string;
  /** The task id. */
  id: string;
  /** The task before the edit. */
  task: Record<string, unknown>;
  /** The series field. */
  field: string;
  /** The bucket's start, as an ISO date. */
  bucketStart: string;
  /** The bucket's exclusive end, as an ISO date. */
  bucketEnd: string;
  /** The typed value, or `null` to clear the bucket. */
  value: number | null;
  /** The bucket's value before the edit, or `null`. */
  oldValue: number | null;
  /** The series once the edit applies. */
  series: GanttDataBandPoint[];
  /** The series now. */
  previous: GanttDataBandPoint[];
  /** The split view. */
  view: GanttSplitView;
  /** The originating DOM event, or `null`. */
  event: unknown;
}

/** The payload of `dataBandEdit:cancelled`: the refused edit and why. */
export interface GanttDataBandEditCancelledEvent {
  /** The band's id. */
  band: string;
  /** The task id. */
  id: string;
  /** The task, unchanged. */
  task: Record<string, unknown>;
  /** The series field. */
  field: string;
  /** The bucket's start, as an ISO date. */
  bucketStart: string;
  /** The bucket's exclusive end, as an ISO date. */
  bucketEnd: string;
  /** The value that was refused. */
  value: number | null;
  /** The bucket's value, unchanged. */
  oldValue: number | null;
  /** The series the edit would have written. */
  series: GanttDataBandPoint[];
  /** The series, unchanged. */
  previous: GanttDataBandPoint[];
  /** The split view. */
  view: GanttSplitView;
  /** The originating DOM event, or `null`. */
  event: unknown;
  /** The reason given to `preventDefault`, `'prevented'` when none was, or `'stale'`. */
  reason: string;
}

/**
 * The context a dropped row carries: the shared shape of
 * `beforeRowDrop`, `rowDrop` and `rowDrop:cancelled`. It is `rowMove`'s
 * payload plus where the row landed — `position` against `target` — the two
 * fields that make `rowDrop` the Lattice name for Bryntum's `gridRowDrop`.
 */
export interface GanttRowDropContext {
  /** The row being dropped, by id. */
  id: string;
  /** The task as the host supplied it (a shallow copy), or `null` when it is not a host task. */
  rawTask: GanttTask | null;
  /** The task as the scheduler placed it before the drop, or `null` without a schedule. */
  task: GanttScheduledTask | null;
  /** The view the drop happened in, or `null` for a headless `moveRow`. */
  view: unknown;
  /** Its parent before the drop, or `null` at the root. */
  oldParent: string | null;
  /** The parent it lands under once the drop applies, or `null` for the root. */
  newParent: string | null;
  /** Its 0-based index among its old parent's children, before the drop. */
  oldIndex: number;
  /** Its 0-based index among its new parent's children, once the drop applies. */
  newIndex: number;
  /** Where it lands relative to `target`: before or after it as a sibling, or inside it as a child. */
  position: 'before' | 'after' | 'inside';
  /** The row the drop anchors to — the row under the pointer, or the keyboard sibling/parent — or `null`. */
  target: string | null;
  /** Always `user`. */
  origin: string;
  /** The originating DOM event (a drop or a keypress), or `null`. */
  event: unknown;
}

/**
 * A table row about to be dropped in a new position: the payload of
 * `beforeRowDrop`. The same gated, undoable drop as
 * `beforeRowMove`, plus `position`/`target`. A name-column drag, Alt+Up/Down
 * and Tab/Shift+Tab all gate on it; it is the vetoable gate of Bryntum's
 * `gridRowDrop`.
 */
export interface GanttRowDropEvent extends GanttRowDropContext, GanttBeforeEvent {}

/**
 * A row that dropped into a new position: the payload of `rowDrop`. A notification — it carries no `preventDefault`; the
 * veto was `beforeRowDrop`'s (or `beforeRowMove`'s) job. Fired once per drop
 * alongside `rowMove`, with the same `id`/`oldParent`/`newParent`/`oldIndex`/
 * `newIndex` plus `position`/`target`. It is the Lattice name for Bryntum's
 * `gridRowDrop`.
 */
export interface GanttRowDroppedEvent extends GanttRowDropContext {}

/**
 * A row that was not dropped: the payload of `rowDrop:cancelled`. A notification, so it carries no `preventDefault`.
 */
export interface GanttRowDropCancelledEvent extends GanttRowDropContext {
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
 * The fourteen `before…` events are cancellable ({@link GanttBeforeEvent}); each
 * has a matching `<action>:cancelled` that fires when a handler refuses,
 * carrying the same context plus the reason. `schedule` and `error` are the
 * recompute's own pair and are raised on every recompute, whatever caused it.
 */
export type GanttEventName =
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
  /** One link is about to be removed — the selected-link Delete key or the link editor's own delete action; cancellable. */
  | 'beforeDependencyDelete'
  /** A row is about to move or re-parent — a drag handle, a drop onto another row, Alt+Up/Down or Tab/Shift+Tab; cancellable. */
  | 'beforeRowMove'
  /** A table row is about to be dropped in a new position — the drop-specific gate of `rowDrop`, carrying `position`/`target`; cancellable (Bryntum `gridRowDrop`). */
  | 'beforeRowDrop'
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
  | 'taskDelete:cancelled'
  /** Tasks are about to be pasted — Ctrl/Cmd+V or `pasteTasks`; cancellable. */
  | 'beforeTaskPaste'
  /** A `beforeTaskPaste` handler refused the paste. */
  | 'taskPaste:cancelled'
  /** A task is about to be added — `addTask`, Insert or the default menu; cancellable. */
  | 'beforeTaskAdd'
  /** A `beforeTaskAdd` handler (or a read-only anchor) refused the add. */
  | 'taskAdd:cancelled'
  /** A task is about to become a milestone or a task again; cancellable. */
  | 'beforeMilestoneConvert'
  /** A `beforeMilestoneConvert` handler (or a summary, or a read-only task) refused the conversion. */
  | 'milestoneConvert:cancelled'
  /** A `beforeDependencyDelete` handler refused the removal. */
  | 'dependencyDelete:cancelled'
  /** A `beforeRowMove` handler refused the move. */
  | 'rowMove:cancelled'
  /** A `beforeRowDrop` handler refused the drop. */
  | 'rowDrop:cancelled'
  /** The dependency list changed — links were added, removed, or both, already allowed through whichever gate applied. */
  | 'dependencies'
  /** The undo/redo timeline changed — an edit was recorded, undone, redone or cleared. */
  | 'history'
  /** A split-view column border or the table/timeline divider finished a drag or keyboard resize. Fired once per gesture, never mid-drag. */
  | 'columnResize'
  /** A workload band bucket cell was clicked, with that bucket's resource, span and bookings. */
  | 'workload:click'
  /** A workload-band bucket cell or histogram bar was clicked, with the resource, the half-open bucket span and its bookings (Bryntum `cellClick`). */
  | 'workloadCellClick'
  /** A workload-band bucket cell or histogram bar was double-clicked; `preventDefault` claims it so a host opens its own editor (Bryntum `cellDblClick`). */
  | 'workloadCellDblClick'
  /** A workload-band bucket cell or histogram bar was right-clicked; `preventDefault` suppresses the browser's own menu (Bryntum `cellContextMenu`). */
  | 'workloadCellContextMenu'
  /** The pointer or keyboard focus reached a workload-band bucket cell or histogram bar (Bryntum `cellMouseOver`). */
  | 'workloadCellHover'
  /** The pointer or keyboard focus left a workload-band bucket cell or histogram bar (Bryntum `cellMouseOut`). */
  | 'workloadCellHoverEnd'
  /** A workload-band resource-name cell was clicked (Bryntum `resourceClick`). */
  | 'workloadResourceClick'
  /** A data band rewrote a task's series — a reschedule shifted or stretched it, or an allowed cell edit wrote a bucket. */
  | 'dataBand:change'
  /** A data band cell edit is about to be written into the task's series; cancellable. */
  | 'beforeDataBandEdit'
  /** A `beforeDataBandEdit` handler refused the edit. */
  | 'dataBandEdit:cancelled'
  /** A task-table cell was clicked, carrying the task, the column's key and the cell element. */
  | 'cell:click'
  /** A task-table cell was clicked, with `id`/`rawTask`/`task` and the column/value/element (Bryntum `cellClick`). */
  | 'cellClick'
  /** A task-table cell was double-clicked (Bryntum `cellDblClick`). */
  | 'cellDblClick'
  /** A task-table cell's context menu was requested, by a right-click or the keyboard (Bryntum `cellContextMenu`). */
  | 'cellContextMenu'
  /** An editable task-table cell is about to open its editor — a double-click, Enter, F2 or a printable key; cancellable (Bryntum `beforeCellEditStart`). */
  | 'beforeCellEditStart'
  /** A task-table cell's editor opened, once allowed through `beforeCellEditStart` (Bryntum `cellEditStart`). */
  | 'cellEditStart'
  /** A `beforeCellEditStart` handler refused the open, or a key reached it while deferring. */
  | 'cellEditStart:cancelled'
  /** A task-table cell's edit committed, with the old and new value. */
  | 'cellEditCommit'
  /** A task-table cell's edit was abandoned — Escape, or a vetoed commit (Bryntum `cellEditCancel`). */
  | 'cellEditCancel'
  /** A task-table row was clicked, alongside `cellClick` for the cell under the pointer. */
  | 'rowClick'
  /** A task-table row was double-clicked, alongside `cellDblClick` for the cell under the pointer. */
  | 'rowDblClick'
  /** `scrollToTask` named a task the task table's filter hides, so it did not scroll. */
  | 'task:filtered'
  /** A completed paint of the timeline and bands, fired once per paint with the drawn range and zoom (Bryntum `render`). */
  | 'draw'
  /** A summary row is about to expand its children; cancellable. */
  | 'beforeTaskExpand'
  /** A summary row is about to collapse its children; cancellable. */
  | 'beforeTaskCollapse'
  /** A summary row expanded — pointer, keyboard or the `view.toggle` API. */
  | 'taskExpand'
  /** A summary row collapsed — pointer, keyboard or the `view.toggle` API. */
  | 'taskCollapse'
  /** A `beforeTaskExpand` handler refused the expand. */
  | 'taskExpand:cancelled'
  /** A `beforeTaskCollapse` handler refused the collapse. */
  | 'taskCollapse:cancelled'
  /** A workload-band resource row expanded its per-task sub-rows. */
  | 'resourceExpand'
  /** A workload-band resource row collapsed its per-task sub-rows. */
  | 'resourceCollapse'
  /** The task selection changed — a click, a Ctrl/Shift click, an arrow key or the select/deselect API. */
  | 'selectionChange'
  /** A row moved or was re-parented — a drag, Alt+Up/Down or Tab/Shift+Tab, once allowed through `beforeRowMove`. */
  | 'rowMove'
  /** A row dropped into a new position — `rowMove` plus `position`/`target`, once allowed through `beforeRowDrop` (Bryntum `gridRowDrop`). */
  | 'rowDrop'
  /** The scheduling-conflict set changed after a recompute — a cycle, constraint, lock or deadline was added or resolved. */
  | 'schedulingConflict'
  /** A task was added by a committed change, with its raw row, scheduled record and cause. */
  | 'taskAdd'
  /** A task was removed by a committed change, with the row and record it had and its cause. */
  | 'taskRemove'
  /** A task was changed by a committed change — a field-level diff, its scheduled record and cause. */
  | 'taskUpdate'
  /** A dependency link was added by a committed change, with the link and its cause. */
  | 'dependencyAdd'
  /** A dependency link was removed by a committed change, with the link and its cause. */
  | 'dependencyRemove'
  /** A dependency link was changed in place — a lag or other non-identity edit — with a field-level diff. */
  | 'dependencyUpdate'
  /** A task's resource roster changed by a committed change, with the old and new assignments. */
  | 'assignmentChange'
  /** The date-only projection of a committed change: every task whose scheduled dates moved. */
  | 'datesChanged'
  /** One batch per committed action, carrying every individual data-change event it produced as an array. */
  | 'change'
  /** The controller finished its first successful schedule and every API on it is ready to call; fires once. */
  | 'ready'
  /** A move drag of a bar or milestone passed the drag threshold, or a keyboard move is about to apply; cancellable (Bryntum `beforeTaskDrag`). */
  | 'beforeTaskDrag'
  /** A move drag started — after `beforeTaskDrag` allowed it, before any position changed (Bryntum `taskDragStart`). */
  | 'taskDragStart'
  /** A move drag frame, at most once per animation frame, with the snapped landing position (Bryntum `taskDrag`). */
  | 'taskDrag'
  /** A move drag was refused at its start or abandoned with Escape (Bryntum `taskDragAbort`). */
  | 'taskDrag:cancelled'
  /** A resize drag passed the drag threshold, or a keyboard resize is about to apply; cancellable (Bryntum `beforeTaskResize`). */
  | 'beforeTaskResizeStart'
  /** A resize started (Bryntum `taskResizeStart`). */
  | 'taskResizeStart'
  /** A resize drag frame, at most once per animation frame (Bryntum `taskPartialResize`). */
  | 'taskPartialResize'
  /** A resize was released (or a keyboard resize applied), before the commit's own `beforeTaskResize` (Bryntum `taskResizeEnd`). */
  | 'taskResizeEnd'
  /** A progress-handle drag passed the drag threshold, or a keyboard progress edit is about to apply; cancellable. */
  | 'beforePercentBarDrag'
  /** A progress-handle drag started (Bryntum `percentBarDragStart`). */
  | 'percentBarDragStart'
  /** A progress-handle drag frame, at most once per animation frame (Bryntum `percentBarDrag`). */
  | 'percentBarDrag'
  /** A progress-handle drag was released (or a keyboard progress edit applied), before the commit's own `beforeProgressChange` (Bryntum `percentBarDrop`). */
  | 'percentBarDrop'
  /** A progress-handle drag was refused at its start or abandoned with Escape (Bryntum `percentBarDragAbort`). */
  | 'percentBarDrag:cancelled'
  /** A single click (not a drag release) on a bar, milestone or summary bar, or Enter/Space on a focused one (Bryntum `taskClick`). */
  | 'taskClick'
  /** A double click on a bar, milestone or summary bar; `preventDefault` claims it so a host opens its own editor (Bryntum `taskDblClick`). */
  | 'taskDblClick'
  /** The pointer entered a bar, milestone or summary bar, or keyboard focus reached one (Bryntum `taskMouseOver`). */
  | 'taskMouseOver'
  /** The pointer left a bar, milestone or summary bar, or keyboard focus left one (Bryntum `taskMouseOut`). */
  | 'taskMouseOut'
  /** A context-menu request on a bar, milestone or summary bar — a right-click or the Menu key / Shift+F10 on a focused row; cancellable (Bryntum `taskContextMenu`). */
  | 'taskContextMenu'
  /** A single click on a dependency link's arrow (Bryntum `dependencyClick`). */
  | 'linkClick'
  /** A double click on a dependency link's arrow, or Enter/Space on a focused one; cancellable, claiming it stops the link editor from opening (Bryntum `dependencyDblClick`). */
  | 'linkDblClick'
  /** A context-menu request on a dependency link's arrow; cancellable (Bryntum `dependencyContextMenu`). */
  | 'linkContextMenu'
  /** The pointer entered a dependency link's arrow (Bryntum `dependencyMouseOver`). */
  | 'linkHover'
  /** A tooltip is about to be shown for a task; cancellable, a veto keeps the built-in card from showing (Bryntum `taskTooltipShow`). */
  | 'tooltipShow'
  /** A shown tooltip was hidden (Bryntum `taskTooltipHide`). */
  | 'tooltipHide'
  /** The split view's time scale changed, with the level before and after and what drove it (Bryntum `zoomChange`). */
  | 'zoomChange'
  /** The dates under the split view's timeline edges changed, coalesced to once per animation frame (Bryntum `visibleRangeChange`). */
  | 'visibleRangeChange'
  /** The split view's viewport scrolled, with the settled offsets, coalesced to once per animation frame (Bryntum `scroll`). */
  | 'scroll'
  /** A view — the plain `mount` view or the `mountSplit` split view — mounted and painted its first frame (Bryntum `viewMount`). */
  | 'viewMount'
  /** A mounted view was torn down — a remount, `unmount()` or `destroy()` (Bryntum `viewDestroy`). */
  | 'viewDestroy'
  /** Whether the plan differs from the committed baseline flipped: fires once on the transition, never on a second edit made while already dirty or a partial undo. */
  | 'dirtyChange';

/** What a handler receives, per Gantt event. */
export interface GanttEventPayloads {
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
  /** The link about to be removed, with `preventDefault` to stop it. */
  beforeDependencyDelete: GanttDependencyDeleteEvent;
  /** The row about to move or re-parent, with `preventDefault` to stop it. */
  beforeRowMove: GanttRowMoveEvent;
  /** The row about to drop in a new position, with `preventDefault` to stop it. */
  beforeRowDrop: GanttRowDropEvent;
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
  /** The tasks about to be pasted, with `preventDefault` to stop them. */
  beforeTaskPaste: GanttTaskPasteEvent;
  /** The paste that was not applied, and why. */
  'taskPaste:cancelled': GanttTaskPasteCancelledEvent;
  /** The task about to be added, with `preventDefault` to stop it. */
  beforeTaskAdd: GanttTaskAddEvent;
  /** The add that was not applied, and why. */
  'taskAdd:cancelled': GanttTaskAddCancelledEvent;
  /** The conversion about to happen, with `preventDefault` to stop it. */
  beforeMilestoneConvert: GanttMilestoneConvertEvent;
  /** The conversion that was not applied, and why. */
  'milestoneConvert:cancelled': GanttMilestoneConvertCancelledEvent;
  /** The link that was not removed, and why. */
  'dependencyDelete:cancelled': GanttDependencyDeleteCancelledEvent;
  /** The move that was not applied, and why. */
  'rowMove:cancelled': GanttRowMoveCancelledEvent;
  /** The drop that was not applied, and why. */
  'rowDrop:cancelled': GanttRowDropCancelledEvent;
  /** The links that were added and/or removed by the change that just applied. */
  dependencies: GanttDependenciesChangedEvent;
  /** The undo/redo timeline's new state. */
  history: GanttHistoryEvent;
  /** The settled column/divider width, and a snapshot of every width. */
  columnResize: GanttColumnResizeEvent;
  /** The clicked workload bucket's resource, span and bookings. */
  'workload:click': GanttWorkloadClickEvent;
  /** The clicked workload cell or histogram bar's resource, span and bookings. */
  workloadCellClick: GanttWorkloadCellEvent;
  /** The double-clicked workload cell or histogram bar, with `preventDefault` to claim it. */
  workloadCellDblClick: GanttWorkloadCellDblClickEvent;
  /** The right-clicked workload cell or histogram bar, with `preventDefault` to suppress the menu. */
  workloadCellContextMenu: GanttWorkloadCellContextMenuEvent;
  /** The workload cell or histogram bar the pointer or focus entered. */
  workloadCellHover: GanttWorkloadCellEvent;
  /** The workload cell or histogram bar the pointer or focus left. */
  workloadCellHoverEnd: GanttWorkloadCellEvent;
  /** The clicked workload-band resource-name cell's resource. */
  workloadResourceClick: GanttWorkloadResourceClickEvent;
  /** The task, band, field and the rewritten series, with why it was rewritten. */
  'dataBand:change': GanttDataBandChangeEvent;
  /** The data band cell edit about to apply, with `preventDefault` to stop it. */
  beforeDataBandEdit: GanttDataBandEditEvent;
  /** The data band cell edit that was refused, with the reason. */
  'dataBandEdit:cancelled': GanttDataBandEditCancelledEvent;
  /** The clicked task-table cell's task, column key and cell element. */
  'cell:click': GanttCellClickEvent;
  /** The clicked task-table cell's id, task, column key, value and element. */
  cellClick: GanttCellPointerEvent;
  /** The double-clicked task-table cell. */
  cellDblClick: GanttCellDblClickEvent;
  /** The task-table cell whose context menu was requested. */
  cellContextMenu: GanttCellContextMenuEvent;
  /** The task-table cell about to open its editor, with `preventDefault` to keep it closed. */
  beforeCellEditStart: GanttBeforeCellEditStartEvent;
  /** The task-table cell whose editor opened. */
  cellEditStart: GanttCellEditStartEvent;
  /** The open attempt that was refused, and why. */
  'cellEditStart:cancelled': GanttCellEditStartCancelledEvent;
  /** The task-table cell edit that committed, with the old and new value. */
  cellEditCommit: GanttCellEditCommitEvent;
  /** The task-table cell edit that was abandoned. */
  cellEditCancel: GanttCellEditCancelEvent;
  /** The clicked task-table row. */
  rowClick: GanttRowClickEvent;
  /** The double-clicked task-table row. */
  rowDblClick: GanttRowDblClickEvent;
  /** The id of the filtered-out task `scrollToTask` was asked for. */
  'task:filtered': GanttTaskFilteredEvent;
  /** The completed paint's view, root element, drawn axis range and resolved zoom. */
  draw: GanttDrawEvent;
  /** The summary row about to expand, with `preventDefault` to stop it. */
  beforeTaskExpand: GanttTaskToggleEvent;
  /** The summary row about to collapse, with `preventDefault` to stop it. */
  beforeTaskCollapse: GanttTaskToggleEvent;
  /** The summary row that expanded, and the expanded set that resulted. */
  taskExpand: GanttTaskToggledEvent;
  /** The summary row that collapsed, and the expanded set that resulted. */
  taskCollapse: GanttTaskToggledEvent;
  /** The expand that was refused, and why. */
  'taskExpand:cancelled': GanttTaskToggleCancelledEvent;
  /** The collapse that was refused, and why. */
  'taskCollapse:cancelled': GanttTaskToggleCancelledEvent;
  /** The workload-band resource that expanded, and the expanded resource set. */
  resourceExpand: GanttResourceToggleEvent;
  /** The workload-band resource that collapsed, and the expanded resource set. */
  resourceCollapse: GanttResourceToggleEvent;
  /** The selection now, what it gained and lost, and what caused the change. */
  selectionChange: GanttSelectionChangeEvent;
  /** The row that moved or was re-parented, and where it landed. */
  rowMove: GanttRowMovedEvent;
  /** The row that dropped into a new position, and where it landed. */
  rowDrop: GanttRowDroppedEvent;
  /** The whole scheduling-conflict set, plus what this recompute added and resolved. */
  schedulingConflict: GanttSchedulingConflictEvent;
  /** The task that was added, its scheduled record and cause. */
  taskAdd: GanttTaskChangeEvent;
  /** The task that was removed, the record it had and its cause. */
  taskRemove: GanttTaskChangeEvent;
  /** The task that changed, a field-level diff, its record and cause. */
  taskUpdate: GanttTaskChangeEvent;
  /** The dependency link that was added and its cause. */
  dependencyAdd: GanttDependencyChangeEvent;
  /** The dependency link that was removed and its cause. */
  dependencyRemove: GanttDependencyChangeEvent;
  /** The dependency link that changed in place, with a field-level diff. */
  dependencyUpdate: GanttDependencyUpdateEvent;
  /** The task whose roster changed, with the old and new assignments. */
  assignmentChange: GanttAssignmentChangeEvent;
  /** The date-only projection of a committed change. */
  datesChanged: GanttDatesChangedEvent;
  /** Every individual data-change event one committed action produced. */
  change: GanttChangeBatchEvent;
  /** The first successful schedule's result and the mounted view, if any. */
  ready: GanttReadyEvent;
  /** The move drag about to start, with `preventDefault` to stop it. */
  beforeTaskDrag: GanttBeforeTaskDragEvent;
  /** The move drag that started, from where. */
  taskDragStart: GanttTaskDragStartEvent;
  /** One move drag frame: from, to, validity and the successors it would push. */
  taskDrag: GanttTaskDragEvent;
  /** The move drag that was refused or abandoned, and why. */
  'taskDrag:cancelled': GanttTaskDragCancelledEvent;
  /** The resize about to start, with `preventDefault` to stop it. */
  beforeTaskResizeStart: GanttBeforeTaskResizeStartEvent;
  /** The resize that started, from which edge and span. */
  taskResizeStart: GanttTaskResizeStartEvent;
  /** One resize frame: from, to and validity. */
  taskPartialResize: GanttTaskResizeEvent;
  /** The released resize: from, to and validity. */
  taskResizeEnd: GanttTaskResizeEvent;
  /** The progress drag about to start, with `preventDefault` to stop it. */
  beforePercentBarDrag: GanttBeforePercentBarDragEvent;
  /** The progress drag that started, from which percentage. */
  percentBarDragStart: GanttPercentBarDragStartEvent;
  /** One progress drag frame, in snapped percent. */
  percentBarDrag: GanttPercentBarDragEvent;
  /** The released progress drag, in snapped percent. */
  percentBarDrop: GanttPercentBarDragEvent;
  /** The progress drag that was refused or abandoned, and why. */
  'percentBarDrag:cancelled': GanttPercentBarDragCancelledEvent;
  /** The clicked task, part and day. */
  taskClick: GanttTaskClickEvent;
  /** The double-clicked task, part and day, with `preventDefault` to claim it. */
  taskDblClick: GanttTaskDblClickEvent;
  /** The task the pointer or focus entered, and which part. */
  taskMouseOver: GanttTaskMouseEvent;
  /** The task the pointer or focus left, and which part. */
  taskMouseOut: GanttTaskMouseEvent;
  /** The task context-menu request, with `preventDefault` to claim it. */
  taskContextMenu: GanttTaskContextMenuEvent;
  /** The clicked link's identity. */
  linkClick: GanttLinkClickEvent;
  /** The double-clicked (or Enter/Space-activated) link's identity, with `preventDefault` to claim it. */
  linkDblClick: GanttLinkDblClickEvent;
  /** The link context-menu request, with `preventDefault` to claim it. */
  linkContextMenu: GanttLinkContextMenuEvent;
  /** The hovered link's identity. */
  linkHover: GanttLinkHoverEvent;
  /** The tooltip about to be shown, with `preventDefault` to veto it. */
  tooltipShow: GanttTooltipShowEvent;
  /** The task whose tooltip was hidden. */
  tooltipHide: GanttTooltipHideEvent;
  /** The split view's zoom before and after, and what drove the change. */
  zoomChange: GanttZoomChangeEvent;
  /** The dates now under the split view's timeline edges, and the resolved zoom. */
  visibleRangeChange: GanttVisibleRangeChangeEvent;
  /** The split view's settled scroll offsets. */
  scroll: GanttScrollEvent;
  /** The view that mounted and painted its first frame. */
  viewMount: GanttViewMountEvent;
  /** The view that was torn down. */
  viewDestroy: GanttViewDestroyEvent;
  /** Whether the plan now differs from the committed baseline. */
  dirtyChange: GanttDirtyChangeEvent;
}

/** The payload of `dirtyChange`: fires only when `hasChanges` flips. */
export interface GanttDirtyChangeEvent {
  /** Whether the plan now differs from the committed baseline. */
  hasChanges: boolean;
}

/** One task's changed fields against the committed baseline, inside a {@link GanttChanges} diff. */
export interface GanttDirtyTaskUpdate {
  /** The task's id, the schedule's key. */
  id: string;
  /** Each changed field, keyed by name, old and new. */
  fields: Record<string, GanttFieldChange>;
}

/** The task side of a {@link GanttChanges} diff. */
export interface GanttDirtyTasks {
  /** Tasks present now that were absent from the committed baseline. */
  added: GanttTask[];
  /** Tasks present in both, with at least one changed field. */
  updated: GanttDirtyTaskUpdate[];
  /** Ids in the committed baseline no longer in the plan. */
  removed: string[];
}

/** One dependency's changed fields against the committed baseline, inside a {@link GanttChanges} diff. */
export interface GanttDirtyDependencyUpdate {
  /** The link's identity key (its `from`/`to`/`type`). */
  id: string;
  /** Each changed field, keyed by name, old and new. */
  fields: Record<string, GanttFieldChange>;
}

/** The dependency side of a {@link GanttChanges} diff. */
export interface GanttDirtyDependencies {
  /** Links present now that were absent from the committed baseline. */
  added: GanttDependency[];
  /** Links present in both, with at least one changed field (a lag edit). */
  updated: GanttDirtyDependencyUpdate[];
  /** Identity keys in the committed baseline no longer in the plan. */
  removed: string[];
}

/** One task's resource roster change against the committed baseline, inside a {@link GanttChanges} diff. */
export interface GanttDirtyAssignmentUpdate {
  /** The task's id. */
  id: string;
  /** The roster at the committed baseline. */
  from: unknown;
  /** The roster now. */
  to: unknown;
}

/**
 * The plan changes accumulated since the last `commit()` or load, as `gantt.changes()` returns it: diffed fresh against
 * the committed baseline on every call, so an add immediately removed, or
 * an edit undone back to the baseline, nets to nothing rather than being
 * read off a running total.
 */
export interface GanttChanges {
  /** The task-level diff. */
  tasks: GanttDirtyTasks;
  /** The dependency-level diff. */
  dependencies: GanttDirtyDependencies;
  /** The tasks whose resource roster changed, mirroring `assignmentChange`. */
  assignments: { updated: GanttDirtyAssignmentUpdate[] };
}

/** The cause of one committed data-change: who or what moved it. */
export type GanttChangeCause = 'user' | 'pushed' | 'api' | 'undo' | 'redo';

/** The kind of one entry inside a {@link GanttChangeBatchEvent}. */
export type GanttChangeKind = 'taskAdd' | 'taskRemove' | 'taskUpdate' | 'dependencyAdd' | 'dependencyRemove' | 'dependencyUpdate' | 'assignmentChange';

/** One field's before and after value in a committed-change diff. */
export interface GanttFieldChange {
  /** The value before the change (`undefined` on an add). */
  from: unknown;
  /** The value after the change (`undefined` on a remove). */
  to: unknown;
}

/**
 * The payload of `taskAdd`, `taskRemove` and `taskUpdate`,
 * raised once per task a committed change added, removed or altered. The
 * scheduled-date fields of `changes` come from the schedule, so a successor
 * the scheduler moved reports its date change even though its raw row did not.
 */
export interface GanttTaskChangeEvent {
  /** The task's id, the schedule's key. */
  id: string;
  /** The task exactly as the host supplied it (a shallow copy). */
  rawTask: GanttTask;
  /** The scheduled task record, or `null` for a removed task. */
  task: GanttScheduledTask | null;
  /** Each changed field, keyed by name, old and new. */
  changes: Record<string, GanttFieldChange>;
  /** What caused the change: `'user'`/`'api'` for the edited task, `'pushed'` for a successor the scheduler moved, `'undo'`/`'redo'` on a history replay. */
  cause: GanttChangeCause;
  /** The originating DOM event, when a gesture drove the change; else `null`. */
  event: unknown;
  /** The mounted view the change is reachable from, or `null` when none is mounted. */
  view: unknown;
}

/**
 * The payload of `assignmentChange`, raised when a committed
 * change altered a task's resource roster.
 */
export interface GanttAssignmentChangeEvent {
  /** The task whose roster changed. */
  id: string;
  /** The roster before the change. */
  from: unknown[];
  /** The roster after the change. */
  to: unknown[];
  /** What caused the change. */
  cause: GanttChangeCause;
  /** The originating DOM event, when a gesture drove the change; else `null`. */
  event: unknown;
  /** The mounted view the change is reachable from, or `null` when none is mounted. */
  view: unknown;
}

/**
 * The payload of `dependencyAdd` and `dependencyRemove`,
 * raised once per link a committed change added or removed.
 */
export interface GanttDependencyChangeEvent {
  /** The link's identity key (`from``to``type`). */
  id: string;
  /** The link itself, normalised. */
  dependency: GanttDependency;
  /** What caused the change. */
  cause: GanttChangeCause;
  /** The originating DOM event, when a gesture drove the change; else `null`. */
  event: unknown;
  /** The mounted view the change is reachable from, or `null` when none is mounted. */
  view: unknown;
}

/**
 * The payload of `dependencyUpdate`, raised when a committed
 * change altered a link in place (a lag or other non-identity edit; a change
 * to `from`/`to`/`type` is a remove plus an add, not an update).
 */
export interface GanttDependencyUpdateEvent {
  /** The link's identity key. */
  id: string;
  /** The link as it now stands. */
  dependency: GanttDependency;
  /** Each changed field, keyed by name, old and new. */
  changes: Record<string, GanttFieldChange>;
  /** What caused the change. */
  cause: GanttChangeCause;
  /** The originating DOM event, when a gesture drove the change; else `null`. */
  event: unknown;
  /** The mounted view the change is reachable from, or `null` when none is mounted. */
  view: unknown;
}

/** One task's scheduled dates in a {@link GanttDatesChangedEvent}. */
export interface GanttDateChange {
  /** The task's id. */
  id: string;
  /** The scheduled early start, as a calendar day-number. */
  start: number;
  /** The scheduled early finish, as a calendar day-number. */
  end: number;
  /** The scheduled duration, in working days. */
  duration: number;
  /** What caused the date to move: `'user'`/`'api'` for the edited task, `'pushed'` for a successor, `'undo'`/`'redo'` on a history replay. */
  cause: GanttChangeCause;
}

/**
 * The payload of `datesChanged`: the date-only projection of
 * one committed change. `changes` lists every task whose scheduled dates
 * moved — the Bryntum `datesChanged` array of `{ id, start, end, duration }`,
 * carried under `changes` so the event shape stays an object like its
 * siblings. Not fired for the host's own `setTasks`/`rows.apply` loads.
 */
export interface GanttDatesChangedEvent {
  /** The date move for every task whose scheduled dates changed. */
  changes: GanttDateChange[];
  /** The action's own cause. */
  cause: GanttChangeCause;
  /** The originating DOM event, when a gesture drove the change; else `null`. */
  event: unknown;
  /** The mounted view the change is reachable from, or `null` when none is mounted. */
  view: unknown;
}

/** One entry inside a {@link GanttChangeBatchEvent}: a typed data-change event with a `type` discriminant. */
export interface GanttChangeEntry {
  /** Which event this entry is. */
  type: GanttChangeKind;
  /** The task id, or a link's identity key. */
  id: string;
  /** The entry's cause. */
  cause: GanttChangeCause;
  /** The raw task, on a task entry. */
  rawTask?: GanttTask;
  /** The scheduled record, on a task entry (`null` for a remove). */
  task?: GanttScheduledTask | null;
  /** The link, on a dependency entry. */
  dependency?: GanttDependency;
  /** The field-level diff, on a task/dependency update. */
  changes?: Record<string, GanttFieldChange>;
  /** The roster before, on an `assignmentChange` entry. */
  from?: unknown[];
  /** The roster after, on an `assignmentChange` entry. */
  to?: unknown[];
}

/**
 * The payload of `change`: the ONE batch per committed
 * action, carrying every individual data-change event it produced as an
 * array, so a host that wants the whole action at once has it without
 * stitching the individual events back together.
 */
export interface GanttChangeBatchEvent {
  /** Every individual data-change event this action produced. */
  changes: GanttChangeEntry[];
  /** The action's own cause. */
  cause: GanttChangeCause;
  /** The originating DOM event, when a gesture drove the action; else `null`. */
  event: unknown;
  /** The mounted view the change is reachable from, or `null` when none is mounted. */
  view: unknown;
}

/** The kind of one entry in a `lattice:gantt-commit` / `lattice:gantt-change` detail. */
export type GanttCommitChangeKind = 'add' | 'delete' | 'move' | 'resize' | 'progress' | 'cell-edit' | 'link' | 'row-move';

/** The task a gesture acted on, named at the head of a `lattice:gantt-commit` detail. */
export interface GanttCommitPrimary {
  /** The primary task's id. */
  id: string;
  /** The kind of the primary task's change. */
  kind: GanttCommitChangeKind;
}

/**
 * One entry of a `lattice:gantt-commit` `changes` array: the same shape a
 * `lattice:gantt-change` carries, gathered into the one commit.
 */
export interface GanttCommitChange {
  /** The task id, or a link's identity key. */
  id: string;
  /** What kind of change it is. */
  kind: GanttCommitChangeKind;
  /** The raw task, or `null` for a link change. */
  task: GanttTask | null;
  /** The field-level diff (dates already ISO) or, for a link, the link itself. */
  changes: Record<string, GanttFieldChange> | GanttDependency;
}

/**
 * The `detail` of a `lattice:gantt-commit` DOM event: ONE
 * per user gesture or API transaction, carrying the whole edit at once —
 * `changes` lists every task the action changed (the primary task, the
 * successors it pushed, and the summaries whose dates moved), so
 * `hx-trigger="lattice:gantt-commit"` posts it in one request instead of a
 * burst of `lattice:gantt-change` events.
 */
export interface GanttCommitDetail {
  /** What caused the action: `'user'`/`'api'` for a gesture/transaction, `'undo'`/`'redo'` on a history replay. */
  cause: GanttChangeCause;
  /** The task the gesture acted on. */
  primary: GanttCommitPrimary;
  /** Every change the action produced, in the per-task `lattice:gantt-change` shape. */
  changes: GanttCommitChange[];
}

/** The payload of `ready`: the first successful schedule. */
export interface GanttReadyEvent {
  /** The first schedule the controller computed. */
  schedule: GanttSchedule;
  /** The mounted view, or `null` when none is mounted yet. */
  view: unknown;
}

/**
 * What every task-bar pointer event carries:
 * the task by id, as the host supplied it and as the scheduler placed it,
 * the view it happened in, and the DOM event that caused it. Dates in these
 * payloads are ISO dates (`YYYY-MM-DD`) on a calendar axis and plan day
 * numbers under `dateAxis: false`; `end` is the scheduled finish boundary,
 * the same `ef` the schedule carries. None of these fire for a host's own
 * `setTasks` or `rows.apply` loads.
 */
export interface GanttTaskPointerContext {
  /** The task, by id. */
  id: string;
  /** The task as the host supplied it (a shallow copy), or `null` when it is not a host task. */
  rawTask: GanttTask | null;
  /** The task as the scheduler placed it before this gesture, or `null` without a schedule. */
  task: GanttScheduledTask | null;
  /** The view the gesture happened in. */
  view: unknown;
  /** The originating DOM event (pointer, mouse, focus or key), or `null` where there is none. */
  event: unknown;
}

/**
 * The context a task-table cell event carries: the
 * shared shape of `cellClick`, `cellDblClick`, `cellContextMenu` and
 * `beforeCellEditStart`. The table became a real Lattice grid; this maps its own cell events onto the controller
 * with the task-centric payload every Gantt event carries, plus the
 * column and value under the cell.
 */
export interface GanttCellPointerContext extends GanttTaskPointerContext {
  /** The column's key: the host column's `key`/`id`, or a built-in column's id, or `null` for a row's empty tail. */
  columnKey: string | null;
  /** The cell's current value. */
  value: unknown;
  /** The cell element, or `null` for a keyboard context-menu with no element to anchor to. */
  element: unknown;
}

/** A task-table cell was clicked: the payload of `cellClick`. */
export interface GanttCellPointerEvent extends GanttCellPointerContext {}

/**
 * A task-table cell was double-clicked: the payload of
 * `cellDblClick`. Fires alongside `beforeCellEditStart`/`cellEditStart`
 * when the cell is editable.
 */
export interface GanttCellDblClickEvent extends GanttCellPointerContext {}

/**
 * A task-table cell's context menu was requested: the
 * payload of `cellContextMenu`, by a right-click or the keyboard
 * (Menu key / Shift+F10), in which case `event`/`element` are `null`.
 */
export interface GanttCellContextMenuEvent extends GanttCellPointerContext {}

/**
 * A task-table cell is about to open its editor: the
 * payload of `beforeCellEditStart`, raised by a double-click, Enter, F2 or
 * a printable key on an editable, non-read-only cell, before the grid's
 * own editor opens. `preventDefault(reason)` keeps the cell closed for
 * this gesture and fires the paired `cellEditStart:cancelled` with that
 * reason, the same before-gate + `:cancelled` contract every other gated Gantt
 * event follows. A programmatic `grid.edit.start()` raises no `before` gate.
 */
export interface GanttBeforeCellEditStartEvent extends GanttCellPointerContext, GanttBeforeEvent {}

/**
 * A task-table cell's editor opened: the payload of
 * `cellEditStart`, once `beforeCellEditStart` allowed it (or for a
 * programmatic `grid.edit.start`/the auto-advance to the next cell after a
 * commit, neither of which raises the `before` gate).
 */
export interface GanttCellEditStartEvent extends GanttTaskPointerContext {
  /** The column being edited. */
  columnKey: string;
}

/**
 * An open attempt that did not open an editor: the
 * payload of `cellEditStart:cancelled`, fired when a `beforeCellEditStart`
 * handler calls `preventDefault(reason)` or defers (a reason of
 * `'deferred'`). The same context the gate carried, plus why.
 */
export interface GanttCellEditStartCancelledEvent extends GanttCellPointerContext {
  /** Why the cell's editor did not open. */
  reason: string;
}

/**
 * A task-table cell's edit committed: the payload of
 * `cellEditCommit`.
 */
export interface GanttCellEditCommitEvent extends GanttTaskPointerContext {
  /** The column that was edited. */
  columnKey: string | null;
  /** The value before the commit. */
  oldValue: unknown;
  /** The value after the commit. */
  newValue: unknown;
}

/**
 * A task-table cell's edit was abandoned: the payload of
 * `cellEditCancel` — Escape, or a commit a `beforeEdit` handler vetoed.
 */
export interface GanttCellEditCancelEvent extends GanttTaskPointerContext {
  /** The column that was being edited, or `null`. */
  columnKey: string | null;
}

/** A task-table row was clicked: the payload of `rowClick`, alongside the `cellClick` for the cell under the pointer. */
export interface GanttRowClickEvent extends GanttTaskPointerContext {}

/** A task-table row was double-clicked: the payload of `rowDblClick`, alongside the `cellDblClick` for the cell under the pointer. */
export interface GanttRowDblClickEvent extends GanttTaskPointerContext {}

/** A pointer position in client (viewport) pixels; `null` on a keyboard path. */
export interface GanttPointerPosition {
  /** The client x. */
  x: number;
  /** The client y. */
  y: number;
}

/**
 * A move drag that started: the payload of
 * `taskDragStart`, raised once when the pointer passes the drag threshold
 * (never on a click), or when a keyboard move starts, before anything moved.
 */
export interface GanttTaskDragStartEvent extends GanttTaskPointerContext {
  /** Where the task starts now. */
  start: number | string;
  /** Where the task finishes now. */
  end: number | string;
  /** The pointer position, or `null` for a keyboard move. */
  pointer: GanttPointerPosition | null;
}

/**
 * A move drag about to start: the payload of
 * `beforeTaskDrag`. `preventDefault(reason)` cancels the drag before
 * anything moves and fires `taskDrag:cancelled`. A gesture cannot wait, so
 * a handler that defers (returns a Promise) cancels it as `'deferred'`.
 */
export interface GanttBeforeTaskDragEvent extends GanttTaskDragStartEvent, GanttBeforeEvent {
  /** Always `'start'`: this gate is the drag's start, not its commit (that is `beforeTaskMove`). */
  phase: 'start';
}

/**
 * A move drag that was refused or abandoned: the payload
 * of `taskDrag:cancelled` — the start context plus why: the veto's reason,
 * `'prevented'`, `'deferred'`, or `'escape'` when Escape abandoned it.
 */
export interface GanttTaskDragCancelledEvent extends GanttTaskDragStartEvent {
  /** Why the drag did not happen. */
  reason: string;
}

/** A `{ start, end }` position in payload date form. */
export interface GanttTaskSpan {
  /** The start. */
  start: number | string;
  /** The finish. */
  end: number | string;
}

/** A `{ start, end, duration }` span in payload date form. */
export interface GanttTaskSpanWithDuration extends GanttTaskSpan {
  /** The duration in days. */
  duration: number;
}

/**
 * One frame of a move drag: the payload of `taskDrag`,
 * at most once per animation frame. `to` is where the scheduler would land
 * the task (snapped to whole days, constraints applied); `valid` is false
 * when the commit would be refused — a hard lock, or a constraint that
 * would put the task somewhere other than where it was dropped.
 */
export interface GanttTaskDragEvent extends GanttTaskPointerContext {
  /** Where the task was when the drag started. */
  from: GanttTaskSpan;
  /** Where it would land if released now. */
  to: GanttTaskSpan;
  /** The whole days dragged. */
  deltaDays: number;
  /** Whether the commit would be accepted. */
  valid: boolean;
  /** The pointer position. */
  pointer: GanttPointerPosition | null;
  /** The successors the scheduler would move, and where to. */
  pushed: Array<{ id: string; to: GanttTaskSpan }>;
}

/**
 * A resize that started: the payload of
 * `taskResizeStart`, once per drag past the threshold or keyboard resize.
 */
export interface GanttTaskResizeStartEvent extends GanttTaskPointerContext {
  /** Which edge is being dragged: always `'end'` today, a bar resizes from its finish. */
  edge: 'end' | 'start';
  /** The task's span when the resize started. */
  from: GanttTaskSpanWithDuration;
  /** The pointer position, or `null` for a keyboard resize. */
  pointer: GanttPointerPosition | null;
}

/**
 * A resize about to start: the payload of
 * `beforeTaskResizeStart`. `preventDefault(reason)` cancels it and fires
 * `taskResize:cancelled` with `phase: 'start'`.
 */
export interface GanttBeforeTaskResizeStartEvent extends GanttTaskResizeStartEvent, GanttBeforeEvent {
  /** Always `'start'`: this gate is the resize's start, not its commit (that is `beforeTaskResize`). */
  phase: 'start';
}

/**
 * A resize frame or its release: the payload of
 * `taskPartialResize` (at most once per animation frame) and
 * `taskResizeEnd` (once, on release, before the commit's own gate).
 */
export interface GanttTaskResizeEvent extends GanttTaskPointerContext {
  /** Which edge is being dragged. */
  edge: 'end' | 'start';
  /** The span when the resize started. */
  from: GanttTaskSpanWithDuration;
  /** The span the scheduler would give it now. */
  to: GanttTaskSpanWithDuration;
  /** Whether the commit would be accepted (not locked, not moved by a constraint). */
  valid: boolean;
  /** The pointer position, or `null` for a keyboard resize. */
  pointer: GanttPointerPosition | null;
}

/**
 * A progress-handle drag that started: the payload of
 * `percentBarDragStart`.
 */
export interface GanttPercentBarDragStartEvent extends GanttTaskPointerContext {
  /** The percent complete when the drag started. */
  from: number;
  /** The pointer position, or `null` for a keyboard edit. */
  pointer: GanttPointerPosition | null;
}

/**
 * A progress-handle drag about to start: the payload of
 * `beforePercentBarDrag`. `preventDefault(reason)` cancels it and fires
 * `percentBarDrag:cancelled`.
 */
export interface GanttBeforePercentBarDragEvent extends GanttPercentBarDragStartEvent, GanttBeforeEvent {
  /** The percentage the gesture starts from (the same as `from`). */
  to: number;
}

/**
 * A progress-handle frame or its release: the payload of
 * `percentBarDrag` and `percentBarDrop`. Percentages are snapped to the
 * view's `progressStep` and clamped to 0–100. The drop is raised before the
 * commit, which still goes through `beforeProgressChange`.
 */
export interface GanttPercentBarDragEvent extends GanttTaskPointerContext {
  /** The percent complete when the drag started. */
  from: number;
  /** The snapped percent complete under the pointer now. */
  to: number;
  /** The pointer position, or `null` for a keyboard edit. */
  pointer: GanttPointerPosition | null;
}

/**
 * A progress-handle drag that was refused or abandoned:
 * the payload of `percentBarDrag:cancelled`.
 */
export interface GanttPercentBarDragCancelledEvent extends GanttPercentBarDragEvent {
  /** The veto's reason, `'prevented'`, `'deferred'`, or `'escape'`. */
  reason: string;
}

/**
 * A click on a task: the payload of `taskClick`. Not
 * raised for the release of a drag. Enter or Space on a focused bar raise it
 * too, with the task's own start as `date`.
 */
export interface GanttTaskClickEvent extends GanttTaskPointerContext {
  /** Which part of the task's drawing was clicked. */
  part: 'bar' | 'progress' | 'label' | 'baseline' | 'milestone' | 'summary';
  /** The day under the pointer, in payload date form. */
  date: number | string | null;
}

/**
 * A double click on a task: the payload of
 * `taskDblClick`. Two `taskClick` events precede it (one per click of the
 * pair). `preventDefault()` claims it — the view runs no default of its own
 * and the browser's default (selecting text) is prevented — so a host opens
 * its own editor instead.
 */
export interface GanttTaskDblClickEvent extends GanttTaskPointerContext, GanttBeforeEvent {
  /** Which part of the task's drawing was double-clicked. */
  part: 'bar' | 'progress' | 'label' | 'baseline' | 'milestone' | 'summary';
  /** The day under the pointer, in payload date form. */
  date: number | string | null;
}

/**
 * The pointer entered or left a task: the payload of
 * `taskMouseOver` and `taskMouseOut`, once per entry and exit of a bar,
 * milestone or summary bar — moving between parts of the same task is not a
 * re-entry, and empty row space is not a task. Keyboard focus reaching or
 * leaving a bar raises the same pair, with the focus event as `event`.
 */
export interface GanttTaskMouseEvent extends GanttTaskPointerContext {
  /** The part entered (on a focus, the task's own kind). */
  part: 'bar' | 'progress' | 'label' | 'baseline' | 'milestone' | 'summary';
}

/**
 * A context-menu request on a task: the payload of
 * `taskContextMenu`, raised on a right-click or the Menu key / Shift+F10 on
 * a focused row. `preventDefault()` claims it — the split view's built-in
 * menu (when `contextMenu` is configured) is not opened, and the browser's
 * own is suppressed either way — so a host shows its own instead.
 */
export interface GanttTaskContextMenuEvent extends GanttTaskPointerContext, GanttBeforeEvent {
  /** Which part of the task's drawing the request landed on. */
  part: 'bar' | 'progress' | 'label' | 'baseline' | 'milestone' | 'summary';
}

/**
 * What every dependency-link pointer event carries: the
 * link's identity — predecessor id, successor id, the normalised type and
 * the lag in working days (0 when none, read back from
 * `gantt.dependencies` since it is not drawn on the link itself) — the view
 * it happened in, and the originating DOM event.
 */
export interface GanttLinkPointerContext {
  /** The predecessor task's id. */
  from: string;
  /** The successor task's id. */
  to: string;
  /**
   * The link's type, normalised to `'FS'`/`'SS'`/`'FF'`/`'SF'`. Named
   * `linkType`, not `type`: every Gantt event payload's `type` is the
   * EVENT's own name (`'linkClick'`, `'linkHover'`, …), so the link's own
   * type is carried under a different key to avoid colliding with it.
   */
  linkType: string;
  /** The link's lag in working days; 0 when none. */
  lag: number;
  /** The view the gesture happened in. */
  view: unknown;
  /** The originating DOM event (pointer or key), or `null` where there is none. */
  event: unknown;
}

/** A single click on a dependency link: the payload of `linkClick`. */
export interface GanttLinkClickEvent extends GanttLinkPointerContext {
}

/**
 * A double click on a dependency link, or Enter/Space on a focused one
 * about to open its type/lag editor: the payload of
 * `linkDblClick`. `preventDefault()` claims it — on the keyboard route the
 * editor is not opened at all; on either route the browser's own default
 * (text selection) is suppressed — the same shape `taskDblClick` already
 * established.
 */
export interface GanttLinkDblClickEvent extends GanttLinkPointerContext, GanttBeforeEvent {
}

/**
 * A context-menu request on a dependency link: the
 * payload of `linkContextMenu`. Neither view draws a menu of its own for a
 * link, so `preventDefault()` only suppresses the browser's own, freeing a
 * host to show its own instead.
 */
export interface GanttLinkContextMenuEvent extends GanttLinkPointerContext, GanttBeforeEvent {
}

/**
 * The pointer entered a dependency link's drawing: the
 * payload of `linkHover`, once per link — moving between the arrow's path
 * and its arrowhead is not a re-entry.
 */
export interface GanttLinkHoverEvent extends GanttLinkPointerContext {
}

/**
 * A tooltip about to be shown for a task: the payload of
 * `tooltipShow`, raised once per distinct task shown (not on every pointer
 * frame a view re-resolves the same hovered task's card on).
 * `preventDefault()` vetoes it — the built-in card is not shown — so a
 * host's own tooltip replaces it.
 */
export interface GanttTooltipShowEvent extends GanttTaskPointerContext, GanttBeforeEvent {
  /** The tooltip's plain-text content, the same text an `aria-describedby` reader gets. */
  text: string;
}

/**
 * A shown tooltip was hidden: the payload of
 * `tooltipHide`, raised only when a tooltip was actually showing — hiding
 * an already-hidden tooltip raises nothing.
 */
export interface GanttTooltipHideEvent extends GanttTaskPointerContext {
}

/**
 * One normalised scheduling conflict: a single problem with
 * the current plan, named in host terms rather than the engine's. It is the
 * shape `gantt.schedulingConflicts` reports and each `schedulingConflict`
 * event carries, distinct from {@link GanttConflict}, which is the engine's
 * raw per-edge constraint breach.
 */
export interface GanttSchedulingConflict {
  /** The kind of problem: `'cycle'`, `'constraint'`, `'lock'` or `'deadline'`. */
  kind: string;
  /** The task ids the conflict involves — the cycle's members, or the single task for a constraint, lock or deadline. */
  tasks: string[];
  /** The dependency links the conflict involves — the edges that close a cycle, or the one offending predecessor of a lock; empty for a constraint or deadline. */
  links: Array<{ from: string; to: string }>;
  /** A ready-to-show message from the catalogue, already localised. */
  message: string;
}

/**
 * The payload of `schedulingConflict`, fired after a
 * recompute only when the conflict set changed (compared by a stable key). It
 * carries the whole current set plus the delta, so a host never has to diff
 * the set itself. A host load (`setTasks`, `rows.apply`) seeds the set
 * silently and fires nothing.
 */
export interface GanttSchedulingConflictEvent {
  /** Every conflict in the plan now, cycle-first then constraint, lock and deadline. */
  conflicts: GanttSchedulingConflict[];
  /** The conflicts new in this recompute. */
  added: GanttSchedulingConflict[];
  /** The conflicts that cleared in this recompute. */
  resolved: GanttSchedulingConflict[];
}

/**
 * A summary row about to expand or collapse: the payload of
 * `beforeTaskExpand` and `beforeTaskCollapse`. A chevron
 * click, a keyboard activation and the `view.toggle` API all gate on this;
 * `preventDefault(reason)` leaves the tree as it was and fires the matching
 * `taskExpand:cancelled`/`taskCollapse:cancelled`.
 */
export interface GanttTaskToggleEvent extends GanttBeforeEvent {
  /** The summary task being expanded or collapsed, by id. */
  id: string;
  /** The summary task ids that would be expanded once this toggle applies. */
  expandedIds: string[];
  /** The task as the host supplied it, or `null` when it is not a host task. */
  rawTask: GanttTask | null;
  /** The scheduled task, or `null` when there is no successful schedule. */
  task: GanttTask | null;
  /** The split view the row belongs to. */
  view: GanttSplitView;
  /** The originating DOM event, or `null` for the `view.toggle` API path. */
  event: unknown;
}

/**
 * A summary row that expanded or collapsed: the payload of `taskExpand` and
 * `taskCollapse`. A notification — it carries no
 * `preventDefault`; the veto was the before-event's job.
 */
export interface GanttTaskToggledEvent {
  /** The summary task that was expanded or collapsed, by id. */
  id: string;
  /** The summary task ids now expanded. */
  expandedIds: string[];
  /** The task as the host supplied it, or `null` when it is not a host task. */
  rawTask: GanttTask | null;
  /** The scheduled task, or `null` when there is no successful schedule. */
  task: GanttTask | null;
  /** The split view the row belongs to. */
  view: GanttSplitView;
  /** The originating DOM event, or `null` for the `view.toggle` API path. */
  event: unknown;
}

/**
 * A task tree toggle that was refused: the payload of `taskExpand:cancelled`
 * and `taskCollapse:cancelled`. The context the before-event
 * carried, plus the reason.
 */
export interface GanttTaskToggleCancelledEvent {
  /** The summary task that was not toggled, by id. */
  id: string;
  /** The expanded set that would have resulted, had it not been refused. */
  expandedIds: string[];
  /** The task as the host supplied it, or `null`. */
  rawTask: GanttTask | null;
  /** The scheduled task, or `null`. */
  task: GanttTask | null;
  /** The split view the row belongs to. */
  view: GanttSplitView;
  /** The originating DOM event, or `null` for the `view.toggle` API path. */
  event: unknown;
  /** The reason given to `preventDefault`, or `'prevented'` when none was. */
  reason: string;
}

/**
 * A workload-band resource row whose per-task sub-rows were shown or hidden:
 * the payload of `resourceExpand` and `resourceCollapse`. A
 * notification — a display-only band toggle, not a gate.
 */
export interface GanttResourceToggleEvent {
  /** The resource whose sub-rows were toggled (`''` for the Unassigned row). */
  resource: string;
  /** The resource keys now expanded in the band. */
  expandedResources: string[];
  /** The split view the band belongs to. */
  view: GanttSplitView;
  /** The originating DOM event, or `null` for the `view.toggleResource` API path. */
  event: unknown;
}

/**
 * The task selection after a change: the payload of `selectionChange`, fired once per change — a click, a Ctrl/Cmd or Shift
 * click, an arrow key, or `select`/`deselect`. A selected task that is
 * collapsed away or filtered out stays in `selectedIds`; `gantt.selectedHidden()`
 * reports which are off-screen.
 */
export interface GanttSelectionChangeEvent {
  /** Every selected task id, in selection order. */
  selectedIds: string[];
  /** The ids this change added. */
  added: string[];
  /** The ids this change removed. */
  removed: string[];
  /** What drove the change: a pointer gesture, a keyboard one, or the API. */
  cause: 'pointer' | 'keyboard' | 'api';
  /** The originating DOM event, or `null` for the API and grid-folded paths. */
  event: unknown;
}

/**
 * The payload of the `task:filtered` event, fired when
 * `scrollToTask` is asked for a task the task table's filter is hiding.
 * The filter is the user's, so it is left exactly as it was.
 */
export interface GanttTaskFilteredEvent {
  /** The id of the task that is hidden by the filter. */
  id: string;
}

/**
 * The payload of the `columnResize` event, fired once a
 * split-view column-border or table/timeline-divider drag or keyboard
 * resize settles — never mid-drag, so one gesture is exactly one event.
 */
export interface GanttColumnResizeEvent {
  /** The column `key` that was resized, or `'grid'` for the table/timeline divider. */
  key: string;
  /** The settled width, in pixels, after the column's/divider's own `minWidth`/`maxWidth` clamp. */
  width: number;
  /**
   * Every left-panel column's current rendered width, keyed by its own
   * `key`, plus the divider's own width under `'grid'` — a full snapshot a
   * host can persist directly, e.g. alongside `gantt.getState()`'s own
   * `columnWidths` (which carries the same shape, minus `grid`).
   */
  widths: Record<string, number>;
}

/**
 * The payload of the `workload:click` event, fired when a
 * workload-band bucket cell is clicked: the resource, the half-open bucket
 * span, the hours booked and available in it, and the tasks that booked
 * there. `booked`/`available` are always HOURS — whatever unit the band is
 * drawing in.
 */
export interface GanttWorkloadClickEvent {
  /** The resource the cell belongs to, or `null` for the Unassigned row. */
  resource: string | null;
  /** The bucket's start, as an ISO date (`YYYY-MM-DD`). */
  bucketStart: string;
  /** The bucket's end (exclusive), as an ISO date (`YYYY-MM-DD`). */
  bucketEnd: string;
  /** The hours booked in this bucket (0 when empty). */
  booked: number;
  /** The resource's available hours in this bucket, or `null` when no capacity is known. */
  available: number | null;
  /** The tasks that booked in this bucket, with the hours each contributed. */
  tasks: Array<{ id: string; name: string; hours: number }>;
}

/**
 * The payload of the workload-band cell events: fired on a
 * click, double-click, context menu, hover or hover-end of a workload-band
 * bucket cell or a histogram bar. It carries the resource and its display
 * name, the half-open bucket span, the hours booked and available, the
 * percent-of-capacity (when a capacity is known), the over-allocation flag,
 * the unit the band is drawing in, and the tasks that booked there.
 * `booked`/`available`/`task.hours` are always HOURS — whatever the unit.
 * A per-task sub-row cell adds the task's `id`/`rawTask`/`task`; an aggregate
 * resource cell leaves those `null`. None of these fire for the host's own
 * `setTasks`/`rows.apply` loads.
 */
export interface GanttWorkloadCellEvent {
  /** The resource the cell belongs to, or `null` for the Unassigned row. */
  resource: string | null;
  /** The resource's display name, or "Unassigned" for `resource: null`. */
  resourceName: string;
  /** The bucket's start, as an ISO date (`YYYY-MM-DD`). */
  bucketStart: string;
  /** The bucket's end (exclusive), as an ISO date (`YYYY-MM-DD`). */
  bucketEnd: string;
  /** The hours booked in this bucket (0 when empty). */
  booked: number;
  /** The resource's available hours in this bucket, or `null` when no capacity is known. */
  available: number | null;
  /** The booking as a percentage of capacity, or `null` when no capacity is known. */
  percent: number | null;
  /** Whether the booking exceeds the resource's available hours in this bucket. */
  over: boolean;
  /** The unit the band is drawing in: `'hours'`, `'percent'` or `'cost'`. */
  unit: 'hours' | 'percent' | 'cost';
  /** The tasks that booked in this bucket, with the hours and this assignment's units each contributed. */
  tasks: Array<{ id: string; name: string; hours: number; units: number | null }>;
  /** The task this sub-row belongs to, or `null` on an aggregate resource cell. */
  id: string | null;
  /** The task as the host supplied it (a shallow copy), or `null` when the cell names no task or the booking is load-only. */
  rawTask: GanttTask | null;
  /** The task as the scheduler placed it, or `null` without a schedule or a task. */
  task: GanttScheduledTask | null;
  /** The view the cell belongs to. */
  view: unknown;
  /** The originating DOM event (pointer, mouse, focus or key), or `null` where there is none. */
  event: unknown;
}

/**
 * A double click on a workload-band cell or histogram bar:
 * the payload of `workloadCellDblClick`. Two `workloadCellClick` events
 * precede it (one per click of the pair). `preventDefault()` claims it — the
 * view runs no default of its own (the inline hours editor) and the
 * browser's default is prevented — so a host opens its own editor instead.
 */
export interface GanttWorkloadCellDblClickEvent extends GanttWorkloadCellEvent, GanttBeforeEvent {}

/**
 * A context menu on a workload-band cell or histogram bar:
 * the payload of `workloadCellContextMenu`. `preventDefault()` suppresses the
 * browser's own menu so a host shows its own.
 */
export interface GanttWorkloadCellContextMenuEvent extends GanttWorkloadCellEvent, GanttBeforeEvent {}

/**
 * A click on a workload-band resource-name cell: the
 * payload of `workloadResourceClick`, fired for an aggregate resource row
 * (never a per-task sub-row or the totals row).
 */
export interface GanttWorkloadResourceClickEvent {
  /** The resource, or `null` for the Unassigned row. */
  resource: string | null;
  /** The resource's display name, or "Unassigned" for `resource: null`. */
  resourceName: string;
  /** The view the cell belongs to. */
  view: unknown;
  /** The originating DOM event, or `null` where there is none. */
  event: unknown;
}

/**
 * The payload of the `cell:click` event, fired when a cell
 * of the split view's task table is clicked: the task the row belongs to,
 * the column's key, and the cell element that was clicked. The key is the
 * grid column id — for a host column that is the `key`/`id` it was given,
 * and for a built-in column its own id (`name`, `start`, …).
 */
export interface GanttCellClickEvent {
  /** The raw task the row belongs to, as a shallow copy; null when no task carries the row's id. */
  task: GanttTask | null;
  /** The column's key: the host column's `key`/`id`, or a built-in column's id. */
  columnKey: string;
  /** The cell element that was clicked. */
  element: unknown;
}

/**
 * The payload of the `history` event, fired whenever the
 * session undo/redo timeline changes — an edit recorded, an undo, a redo, or
 * a clear. A host wires its undo and redo controls off `canUndo`/`canRedo`
 * and can show `label` in a toast ("Undone: move").
 */
export interface GanttHistoryEvent {
  /** Whether there is now an edit that `undo()` would reverse. */
  canUndo: boolean;
  /** Whether there is now an edit that `redo()` would re-apply. */
  canRedo: boolean;
  /**
   * A short label for the action that triggered this event — e.g. `'move'`,
   * `'resize'`, `'link'`, `'delete'`, `'level'`, `'add'` — or `null` after a
   * clear. English and stable (host-facing data, not an announced string).
   */
  label: string | null;
}

/**
 * The payload of the `draw` event, fired once after every
 * completed paint of the timeline and bands — the initial paint, a data
 * change, a zoom change, a band toggle, or a column resize. Several
 * synchronous invalidations in one turn are
 * coalesced into a single event, and it never fires before the DOM has been
 * updated. This is the supported replacement for wrapping `view.draw`.
 */
export interface GanttDrawEvent {
  /** The view that just painted — the plain `mount` view, or the `mountSplit` split view. */
  view: unknown;
  /** The view's root element, already reflecting the completed paint. */
  element: unknown;
  /** The axis range the paint drew, in plan-day numbers — `start` and `end` are the same numbers the scale maps onto the timeline. */
  range: { start: number; end: number };
  /** The resolved zoom level (`'day'`, `'week'`, `'month'`, `'quarter'`, or `'custom'` for a numeric pixels-per-day), or `null` for a fit-to-width plain view. */
  zoom: string | null;
}

/**
 * The payload of the `zoomChange` event, fired once each
 * time the split view's time scale changes — a host `view.setZoom`/
 * `view.fitZoom` (`cause: 'api'`) or a click on the view's own zoom control
 * (`cause: 'control'`) — carrying the level before and after and the resolved
 * pixels-per-day. A report, not a gate.
 */
export interface GanttZoomChangeEvent {
  /** The view whose zoom changed — the `mountSplit` split view. */
  view: unknown;
  /** The zoom level before the change. */
  from: GanttZoomValue;
  /** The zoom level after the change. */
  to: GanttZoomValue;
  /** What drove the change: a host call (`'api'`), the built-in zoom control (`'control'`), or a future pinch/wheel gesture (`'gesture'`). */
  cause: GanttZoomCause;
  /** The pixels-per-day the view resolved for the new level, exactly what the repaint drew with. */
  pxPerDay: number;
}

/**
 * The payload of the `visibleRangeChange` event, fired with
 * the ISO dates now under the split view's timeline left and right edges and
 * the resolved zoom, coalesced to at most one per animation frame across a
 * burst of horizontal scroll, resize and zoom work, and once after the view
 * first mounts. A report, not a gate.
 */
export interface GanttVisibleRangeChangeEvent {
  /** The view whose visible range changed — the `mountSplit` split view. */
  view: unknown;
  /** The ISO date (`YYYY-MM-DD`) under the timeline's left edge. */
  start: string;
  /** The ISO date (`YYYY-MM-DD`) under the timeline's right edge. */
  end: string;
  /** The resolved zoom level (`'day'`, `'week'`, `'month'`, `'quarter'`, or `'custom'` for a numeric pixels-per-day). */
  zoom: string;
}

/**
 * The payload of the `scroll` event, fired by the split
 * view at most once per animation frame while its viewport scrolls, with the
 * offsets read from the settled position. A scroll that settles where it
 * already was is silent. A report, not a gate.
 */
export interface GanttScrollEvent {
  /** The view whose viewport scrolled — the `mountSplit` split view. */
  view: unknown;
  /** The viewport's vertical offset, in content pixels. */
  top: number;
  /** The viewport's horizontal offset, in content pixels. */
  left: number;
}

/**
 * The payload of the `viewMount` event, fired once by the
 * plain `mount` view or the `mountSplit` split view after its first paint. A
 * report, not a gate.
 */
export interface GanttViewMountEvent {
  /** The view that mounted — the plain `mount` view or the `mountSplit` split view. */
  view: unknown;
  /** The view's root element, already attached and painted. */
  element: unknown;
}

/**
 * The payload of the `viewDestroy` event, fired once by a
 * mounted view as it is torn down — a remount, `unmount()` or `destroy()` —
 * before its root is removed, so `element` is still readable. A report, not
 * a gate.
 */
export interface GanttViewDestroyEvent {
  /** The view being torn down — the plain `mount` view or the `mountSplit` split view. */
  view: unknown;
  /** The view's root element, still attached at the moment the event fires. */
  element: unknown;
}

/**
 * The `editor` shorthand on a split-view grid column: ask
 * for one of the grid's own editors with the split view's plain keys, rather
 * than spelling out the full `edit`/`lookup` spec. `{ type: 'select',
 * options }` is the select editor — a dropdown of the options in the order
 * given, committing the chosen option's value — and `{ type: 'number', min,
 * max, step }` is the number editor, which clamps to the bounds and steps
 * up/down by `step` (a spinner is added, so the step is keyboard-operable).
 * An `editor` makes the column editable unless `editable`/`edit` says
 * otherwise. It needs the view's `createGrid`: the lightweight tables have
 * no editors.
 */
export interface GanttColumnEditor {
  /** The grid editor to use: `'select'` for a dropdown of options, `'number'` for a bounded number. */
  type: 'select' | 'number';
  /**
   * The select editor's options, in the order the dropdown shows them: an
   * array of `{ id, label }` options, of bare strings or numbers (each
   * becomes its own value and label), or a function returning either
   * (synchronously or as a promise).
   */
  options?: Option[] | ReadonlyArray<string | number> | (() => Option[] | Promise<Option[]>);
  /** The lowest value the number editor accepts; lower typed values clamp to it. */
  min?: number;
  /** The highest value the number editor accepts; higher typed values clamp to it. */
  max?: number;
  /** The increment the number editor steps by; a spinner is added for it. */
  step?: number;
}

/**
 * A split-view table column when the tables are real grids:
 * the full grid column spec. An `id` naming a built-in column (`name`,
 * `start`, `end`, `duration`, `progress`, `assignee`, `effort`, `units`; a
 * band's `resource`/`total`) overrides that column, merged over it one level
 * deep so the built-in behaviour it does not replace is kept.
 */
export interface GanttGridColumn extends Column {
  /** The pre-grid column key, read as `id`. */
  key?: string;
  /** The task field an edit in this column writes, when it is not `field`. */
  editField?: string;
  /** The grid editor shorthand for this column (select or bounded number). */
  editor?: GanttColumnEditor;
  /**
   * How this column's date is formatted, overriding the
   * view's `dateFormat`: a token pattern (`'dd/MM/yyyy'`) or a function, as
   * on the view's `dateFormat`. The column's `format` still wins when both
   * are given.
   */
  dateFormat?: string | ((p: { value: unknown; locale?: string }) => string);
}

/** The resource a {@link GanttBandColumn} function is handed: its own spec from `resources`, with its key and display name. */
export interface GanttBandResource {
  /** The resource key (`''` for the Unassigned row). */
  key: string;
  /** The resource's display name. */
  name: string;
  /** Anything else the host wrote against the resource in `resources`. */
  [field: string]: unknown;
}

/** What a {@link GanttBandColumn} function is handed besides the resource: the band's figures for the row. */
export interface GanttBandColumnContext {
  /** Which band the column is in. */
  band: 'workload' | 'histogram';
  /** The band's current unit. */
  unit: 'hours' | 'percent' | 'cost';
  /** The resource's capacity in units, or `null` when unknown. */
  capacity: number | null;
  /** The resource's booked hours over the whole range. */
  total: number;
  /** The resource's cost over the whole range, or `null` when it has no rate. */
  cost: number | null;
  /** The resource's available hours over the whole range, or `null` when unknown. */
  available: number | null;
  /** The resource's booked hours per bucket. */
  cells: Array<number | null>;
  /** Whether each bucket is over the resource's capacity. */
  over: boolean[];
  /** How many buckets are over capacity. */
  overCount: number;
  /** The resource's task sub-rows. */
  tasks: object[];
  /** The task sub-row being drawn, or `null` on a resource row. */
  task: object | null;
}

/**
 * A band's own column, independent of the task table. Its
 * width is namespaced in `getColumnWidths`/`columnResize` as `band:<key>`
 * (workload) or `histogram:<key>` (histogram).
 */
export interface GanttBandColumn extends GanttGridColumn {
  /** The column's key, which names it in the width snapshot. */
  key: string;
  /** The column's width in pixels. */
  width?: number;
  /** The cell's horizontal alignment. */
  align?: Align;
  /** The column's value for a resource row: what the column sorts and filters on, and shows when it has no `render`. */
  value?: ((resource: GanttBandResource, ctx: GanttBandColumnContext) => unknown) | ColumnValueSpec;
  /** Draw the cell for a resource row: a string is set as text, a node is mounted. */
  render?: (resource: GanttBandResource, ctx: GanttBandColumnContext) => string | number | null | unknown;
  /** What a task sub-row shows: `'blank'` (default), `'inherit'` (the resource's value) or a function giving its own. */
  subRows?: 'blank' | 'inherit' | ((task: object, resource: GanttBandResource, ctx: GanttBandColumnContext) => unknown);
}

/**
 * The view `mountSplit` returns: the task grid, timeline and (when asked
 * for) the resource workload/histogram bands, joined in one scroll surface.
 * Only the methods a host drives directly off the handle are typed here —
 * everything else (what it draws) is reached through the controller.
 */
export interface GanttSplitView {
  /** The view's root element. */
  readonly element: unknown;
  /** The resolved split-view options this view was (re)built with. */
  readonly options: object;
  /** The single vertical scroller (grid + timeline). */
  readonly scroller: unknown;
  /** The last computed row geometry: one `{ id, top, height }` per visible row. */
  rowGeometry(): Array<{ id: string; top: number; height: number }>;
  /**
   * Align the timeline's horizontal scroll on a date,
   * centering it in the timeline's own viewport, with no remount. A
   * no-op before anything has drawn, or for a date that fails to parse.
   */
  scrollToDate(date: number | string | Date): void;
  /**
   * Change the time-scale zoom with no remount: the
   * collapsed summaries, every column width and the date centred in the
   * timeline before the call are all unchanged by it — only the
   * pixels-per-day scale moves. Takes the same preset or raw
   * pixels-per-day `mountSplit`'s own `zoom` option does; an unrecognised
   * value falls back to `'day'`, silently, the same as that option does.
   */
  setZoom(level: GanttZoom | number): void;
  /**
   * Zoom so the whole plan fits the timeline's own width:
   * the pixels-per-day that maps the plan's full domain onto the time body's
   * viewport, applied through the same in-place repaint `setZoom` uses —
   * collapsed summaries, column widths and the date are all unchanged, and
   * the horizontal scroll resets to the start, since a plan that fits has
   * nothing to scroll to.
   */
  fitZoom(): void;
  /**
   * The dates currently under the timeline's viewport edges: `{ start, end }` ISO dates (`YYYY-MM-DD`) under the
   * left and right edges, agreeing with the last `visibleRangeChange` event;
   * `null` before the view has drawn.
   */
  visibleRange(): { start: string; end: string } | null;
  /**
   * The built-in zoom control's button group, for a host
   * that mounted it with `zoomControl: { position: 'toolbar' }` to place in
   * a toolbar of its own; `null` when the option is off. The control keeps
   * tracking the view's zoom while detached.
   */
  readonly zoomControl: unknown;
  /** A copy of the collapsed summary task ids. */
  readonly collapsed: Set<string>;
  /** Toggle a summary row's collapsed state and redraw. */
  toggle(id: string): void;
  /**
   * Turn the critical-path highlight on or off and redraw in place, without a
   * remount. The same switch `showCritical` sets at
   * `mountSplit` time.
   */
  setShowCritical(show: boolean): void;
  /**
   * Bring a task's row and bar into view,
   * expanding any collapsed summary that hides it and scrolling the least
   * each axis needs — vertically to the row, horizontally to its bar's
   * start/finish — with no remount. An axis already showing the row/bar is
   * left alone. A task the task table's filter hides is not revealed and
   * the filter is not changed: it returns `false` and fires `task:filtered`
   * with `{ id }`. Also `false` for an unknown id.
   */
  scrollToTask(id: string | number): boolean;
  /** A copy of the workload band's expanded resource keys. */
  readonly expandedResources: Set<string>;
  /** Expand or collapse a resource's per-task sub-rows in the workload band, and redraw. */
  toggleResource(resource: string): void;
  /**
   * Collapse or expand one `workload.groupBy` group of the workload band, and redraw. `null` or `''` names the "no group" group.
   */
  toggleWorkloadGroup(group: string | null): void;
  /** The `workload.groupBy` group values currently collapsed. */
  readonly collapsedWorkloadGroups: string[];
  /**
   * Replace the workload band's `external` bookings and redraw,
   * the live add / update / remove the standalone resource view applies.
   */
  setWorkloadBookings(bookings: GanttWorkloadExternal[]): void;
  /**
   * The unit the workload band (and, when mounted, the histogram band) is
   * currently drawing in.
   */
  getWorkloadUnit(): 'hours' | 'percent' | 'cost';
  /**
   * Switch the workload and histogram bands to hours, percent-of-capacity or
   * cost, redraw, and announce the change
   * in the live region. Round-trips through the controller's
   * `getState`/`setState`. A no-op when neither band is mounted.
   */
  setWorkloadUnit(unit: 'hours' | 'percent' | 'cost'): void;
  /**
   * Every left-panel column's current rendered width, keyed by column
   * `key` — every column, not merely a resized one, so
   * restoring this exact snapshot reproduces the layout on screen.
   * Round-trips through the controller's `getState`/`setState`.
   */
  getColumnWidths(): Record<string, number>;
  /**
   * Restore column widths from {@link getColumnWidths}.
   * Each is clamped to that column's own `minWidth`/`maxWidth` and skipped
   * for an unknown key or a `resizable: false` column, then the view
   * redraws.
   */
  setColumnWidths(widths: Record<string, number>): void;
  /**
   * Each real-grid table's own view state — column order, widths,
   * visibility, pin, sort and filters — when `createGrid`
   * was injected; `null` otherwise. Round-trips through the controller's
   * `getState`/`setState` under `tables`.
   */
  getTableStates(): { task: GridState | null; workload: GridState | null; histogram: GridState | null } | null;
  /** Restore table states from {@link getTableStates} and redraw. */
  setTableStates(states: { task?: GridState | null; workload?: GridState | null; histogram?: GridState | null }): void;
  /**
   * The issues panel's open/collapsed flag, or `null` when
   * no panel is mounted. Round-trips through the controller's
   * `getState`/`setState` under `issuesPanel`.
   */
  getIssuesPanelState(): { open: boolean } | null;
  /** Restore the issues panel's open/collapsed flag from {@link getIssuesPanelState}. */
  setIssuesPanelState(state: { open?: boolean }): void;
  /**
   * Each data band's collapsed flag and grid state, by band id, or `null` when no data band is mounted. Round-trips
   * through the controller's `getState`/`setState` under `dataBands`.
   */
  getDataBandState(): Record<string, { collapsed: boolean; table: GridState | null }> | null;
  /** Restore {@link getDataBandState}'s output and redraw. */
  setDataBandState(state: Record<string, { collapsed?: boolean; table?: GridState | null }>): void;
  /** Collapse a data band to its header strip or open it; omit `collapsed` to toggle. Returns whether it is now collapsed. */
  toggleDataBand(id: string, collapsed?: boolean): boolean;
  /** A data band as a plain table — left-hand texts then one column per bucket with the raw values — for an Excel/CSV writer; `null` for an unknown id. */
  getDataBandTable(id: string): { id: string; title: string; columns: Array<{ id: string; title: string }>; rows: Array<Array<string | number | null>> } | null;
  /** The real grids the tables are mounted as; each `null` when that table is not a grid. */
  readonly grids: { tasks: Grid | null; workload: Grid | null; histogram: Grid | null };
  /**
   * Serialise this split view — the left panel, the timeline and whichever
   * bands are mounted — to a standalone SVG string, drawn
   * with a fixed palette independent of the mounted theme. `''` before
   * anything has been drawn.
   */
  toSVG(svgOpts?: { range?: { from?: number | string | Date; to?: number | string | Date } }): string;
  /**
   * This split view as a PNG: `toSVG` rasterised through a
   * canvas. Makes no network request. `null` when nothing is drawn or there
   * is no canvas to rasterise with.
   */
  toPNG(pngOpts?: {
    range?: { from?: number | string | Date; to?: number | string | Date };
    scale?: number;
    background?: string;
  }): Promise<Blob | null>;
  /**
   * Print this split view — the table, the timeline, and the workload and
   * histogram bands when mounted — paged and scaled: the
   * table header and timeline header repeat on every page and no row is
   * split across a page boundary. Opens the browser's own print path over a
   * standalone document; "PDF" is whatever the browser's print dialog
   * offers ("Save as PDF") — no server, no dependency. Always prints in a
   * fixed, print-safe light palette, independent of the mounted theme.
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
  /** Detach the view. The host still owns the container. */
  destroy(): void;
}

/** A headless Gantt controller: holds the model, recomputes on edits, emits changes. */
export interface Gantt {
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
   * The normalised scheduling-conflict set: one entry per
   * cycle, unhonoured constraint, blocked lock or missed deadline, the shape
   * the `schedulingConflict` event and the issues panel consume. A copy;
   * empty when the plan is clean.
   */
  readonly schedulingConflicts: GanttSchedulingConflict[];
  /**
   * Whether the controller was asked to cascade an edit down the dependency chain rather
   * than only recomputing.
   */
  readonly autoSchedule: boolean;
  /** The grid this controller is bound to, or null for a standalone plan. */
  readonly grid: unknown;
  /**
   * The resolved week-start weekday (0-6): the
   * plan's own `weekStartDay` option, else the bound grid's locale default
   * (Monday for en-GB and most locales, Sunday for en-US), else Sunday.
   */
  readonly weekStartDay: number;
  /** The over-allocations from the latest schedule. */
  readonly overAllocations: GanttOverAllocation[];
  /** The latest resource-load report, or null before a successful schedule. */
  readonly resourceLoad: GanttResourceLoad | null;
  /**
   * The display name for each resource key: a `resources` entry `{ id, name }` is keyed by its `id` — what assignments refer to — but labelled by its `name`, so the views show the human name while every lookup stays keyed on the id. A resource with no distinct `name` maps its key to itself.
   */
  readonly resourceNames: Map<string, string>;
  /**
   * Replace the whole task list (copied in) and recompute, returning the new schedule.
   * Ignored with a warning after `destroy()`. A load resets `changes()`/`hasChanges`
   * to this plan unless `{ keepChanges: true }` keeps accumulating
   * against the baseline already held.
   */
  setTasks(tasks: GanttTask[], setOpts?: { keepChanges?: boolean }): GanttSchedule;
  /**
   * Replace the link list and recompute. Adding a link is gated on
   * `beforeDependencyCreate`, so this returns undefined on a veto, or a promise when a
   * handler defers; a pure removal or reorder applies straight away. `editOpts.event`
   * is the originating DOM event when a gesture drove the change; it rides on the
   * change events.
   */
  setDependencies(deps: GanttDependency[], editOpts?: { event?: unknown }): GanttSchedule;
  /**
   * Remove one dependency link, by its `from`/`to`/`type` identity
   * — the selected-link Delete key and the link editor's own delete action both
   * call this. Gated on `beforeDependencyDelete`, so this returns undefined on a
   * veto or when no link matches, or a promise when a handler defers.
   * `editOpts.event` is the originating DOM event, carried on the change events.
   */
  deleteDependency(link: { from: string | number; to: string | number; type?: string }, editOpts?: { event?: unknown }): GanttSchedule | undefined;
  /**
   * Dry-run a start or duration edit and return the schedule it would produce, without changing the model, emitting `schedule` or writing back. Views call it on every drag frame so dependency arrows follow the bar; returns `null` when the edit cannot be scheduled.
   */
  previewEdit(patch: { id: string | number; start?: number; duration?: number }): GanttSchedule | null;
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
   *
   * `assignments` replaces the task's whole roster in ONE edit
   * — what the split view's assignment picker commits — so several adds,
   * removes and units changes are a single change event. It reschedules as a
   * `units` edit to the roster's total under the task's `schedulingMode`
   * (`units` is 1 for 100%); on a fixed-duration, effort-driven task a changed
   * set of resources splits the held total as `addResource` does. An empty
   * roster clears the assignments and leaves the duration alone.
   */
  applyEdit(patch: { id: string | number; start?: number; end?: number; duration?: number; percentComplete?: number; work?: number | Array<{ date: number | string | Date; hours: number }>; effort?: number; units?: number; addResource?: string | { resource?: string; name?: string; id?: string; units?: number }; removeResource?: string | { resource?: string; name?: string; id?: string }; assignments?: Array<{ resource: string; units?: number }> }, editOpts?: { writeBack?: boolean; event?: unknown }): GanttSchedule;
  /**
   * Move or re-parent one row: the choke point a
   * name-column drag handle, a drop onto another row, Alt+Up/Down and
   * Tab/Shift+Tab all funnel through. Gated on the cancellable
   * `beforeRowMove` event; once allowed, the task's parent and position
   * among its new siblings are written through the live re-parent path
   * as one undo step, and `rowMove` fires.
   */
  moveRow(taskId: string | number, target?: { parent?: string | number | null; index?: number; position?: 'before' | 'after' | 'inside'; target?: string | number | null; event?: unknown }): GanttSchedule | undefined | Promise<GanttSchedule | undefined>;
  /**
   * Recompute the schedule now and return it. On success it emits `schedule` and
   * refreshes the resource load; on a cycle or bad input it emits `error` and leaves the
   * previous schedule in place.
   */
  compute(): GanttSchedule;
  /**
   * The raw task carrying a given WBS outline code, or
   * `null` when none does, or before any successful schedule. Reads the
   * latest schedule's derived codes, so it reflects the plan's current
   * order rather than a code a since-moved task used to carry.
   */
  taskByWbs(code: string): GanttTask | null;
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
   * The resource load as it WOULD be if a task carried the given roster: the same load calculation over the current schedule with
   * that one task's assignments swapped, so a picker can warn of an
   * over-allocation before anything is committed. The model is not touched and
   * nothing is emitted.
   */
  previewAssignments(taskId: string | number, roster: Array<{ resource: string; units?: number }>): GanttResourceLoad;
  /**
   * Compute resource-rate cost for the current plan: a
   * resource's hourly `rate` (its dated `rates` changes honoured day by
   * day), a `'material'` resource's cost per unit, or a `'cost'`
   * resource's flat amount per assignment, plus each task's own fixed
   * `cost` field — per task, rolled up to summaries and the project.
   */
  cost(costOpts?: { costField?: string }): GanttCostResult;
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
  /** The plan's own title, from `createGantt({ title })`; `null` when none was given. */
  readonly title: string | null;
  /**
   * Serialise the mounted view to a standalone SVG string:
   * the plain view's chart, or the split view's table, timeline and
   * whichever bands are mounted. `''` when nothing is mounted or drawn.
   */
  toSVG(svgOpts?: { range?: { from?: number | string | Date; to?: number | string | Date } }): string;
  /**
   * The mounted view as a PNG. `null` when nothing is
   * mounted or drawn, or there is no canvas to rasterise with.
   */
  toPNG(pngOpts?: {
    range?: { from?: number | string | Date; to?: number | string | Date };
    scale?: number;
    background?: string;
  }): Promise<Blob | null>;
  /**
   * Print the mounted SPLIT view — paged and scaled, with the table header
   * and timeline header repeating on every page — through the browser's
   * own print path; "PDF" is the browser's own print-to-
   * PDF, no server and no dependency. Needs a split view (`mountSplit`):
   * the plain view has no table or bands to print, and this warns once and
   * returns `false` without one.
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
   * The live consumer surface, mirroring `grid.rows.apply`, so a Data Router
   * can drive the Gantt like any other view. Keyed by the controller's rowKey.
   */
  readonly rows: {
    /**
     * A load resets `changes()`/`hasChanges` to this plan
     * unless `{ keepChanges: true }` keeps accumulating against the
     * baseline already held.
     */
    apply(change: { add?: GanttTask[]; update?: GanttTask[]; remove?: Array<string | GanttTask> }, loadOpts?: { keepChanges?: boolean }): {
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
   * Undo the most recent plan edit, restoring the exact
   * prior plan — tasks, dependencies, assignments and work contours — and
   * re-running scheduling to the identical result. A coalesced drag and a
   * whole `level()` run each undo as one step. Emits `schedule` (views
   * redraw) and `history`. Returns `false` when there is nothing to undo.
   * History is session only: it is cleared by `setTasks`/`setState` and lost
   * on reload, and is NOT part of `getState`/`setState`.
   */
  undo(): boolean;
  /**
   * Redo the most recently undone edit. Returns `false`
   * when there is nothing to redo; the redo branch is discarded the moment a
   * new edit is made.
   */
  redo(): boolean;
  /** Whether there is an edit to undo. */
  canUndo(): boolean;
  /** Whether there is an edit to redo. */
  canRedo(): boolean;
  /**
   * Forget the whole undo/redo timeline and emit `history`.
   * History is also cleared by `setTasks`/`setState` and lost on reload; this
   * is the explicit reset after loading a fresh plan through `rows.apply`.
   */
  clearHistory(): void;
  /**
   * The plan changes accumulated since the last `commit()` or load: diffed fresh against the committed baseline on
   * every call, so an add immediately removed, or an edit undone back to
   * the baseline, nets to nothing.
   */
  changes(): GanttChanges;
  /**
   * Whether the plan differs from the committed baseline
   * — the last `commit()`, or the last `setTasks`/`rows.apply` load that
   * did not pass `{ keepChanges: true }`.
   */
  readonly hasChanges: boolean;
  /**
   * Mark the plan clean: the tasks, dependencies and
   * assignments as they stand now become the new baseline `changes()`
   * diffs against, and `hasChanges` drops to `false`, firing `dirtyChange`
   * when it was `true`. Leaves the undo/redo timeline untouched.
   */
  commit(): void;
  /**
   * Select one or more tasks by id. Adds to the current
   * selection rather than replacing it (the inverse of {@link deselect}), with
   * the last id becoming the range anchor a later Shift gesture grows from.
   * Fires one `selectionChange` with `cause: 'api'` when the selection
   * actually changes, and the mounted view reflects it onto the grid rows and
   * the timeline bars. Unknown or already-selected ids are harmless.
   * @param ids one task id or several
   * @returns the selection now, in selection order
   */
  select(ids: string | string[]): string[];
  /**
   * Deselect one or more tasks by id: removes them, leaving
   * the rest — call `gantt.deselect(gantt.selected())` to clear. Fires one
   * `selectionChange` with `cause: 'api'` when the selection changes.
   * @param ids one task id or several
   * @returns the selection now, in selection order
   */
  deselect(ids: string | string[]): string[];
  /**
   * The selected task ids, in selection order. The whole
   * selection, including tasks the current view has collapsed away or filtered
   * out — they stay selected (see {@link selectedHidden}).
   */
  selected(): string[];
  /**
   * The selected task ids that are not currently visible:
   * still selected, but collapsed under a summary row or hidden by a filter.
   * Empty when no view has drawn yet.
   */
  selectedHidden(): string[];
  /**
   * Copy tasks and their subtrees to the Gantt clipboard:
   * every field with assignments, and the links between two copied tasks (a
   * link to an outside task is dropped on paste). The tab-separated text form
   * (name, start, end, duration, percent) is also written to the system
   * clipboard where the browser allows it. Ctrl/Cmd+C does the same on the
   * selection.
   * @param ids the task ids to copy
   * @returns the text form, or `null` when nothing was copied
   */
  copyTasks(ids: Array<string | number>): string | null;
  /**
   * Cut tasks and their subtrees: copy, then remove them and their links as
   * one undo step. Refused when `beforeTaskDelete` is
   * vetoed. Ctrl/Cmd+X does the same on the selection.
   * @param ids the task ids to cut
   * @returns the text form, or `null` when nothing was cut
   */
  cutTasks(ids: Array<string | number>): string | null;
  /**
   * Paste the Gantt clipboard as new tasks with new ids, below a task or as
   * its children, as one undo step, gated on `beforeTaskPaste`. With no target it pastes below the last selected task,
   * else at the end of the plan. `text` pastes tab-separated rows (name,
   * start, end, duration, percent) instead. Ctrl/Cmd+V pastes below the
   * focused row, Ctrl/Cmd+Shift+V as its children.
   * @param target where to paste, and optionally the text to paste
   * @returns the new ids (empty on a veto), `null` when there is nothing to paste, or a Promise of either when a handler deferred
   */
  pasteTasks(target?: { below?: string | number; childOf?: string | number; text?: string }): string[] | null | Promise<string[] | null>;
  /**
   * Add a task above, below, as a child of, as a successor of or as a
   * predecessor of another, as one undo step, gated on the vetoable
   * `beforeTaskAdd`. A successor or predecessor is linked
   * finish-to-start. Omitted fields default: a catalogue name, a duration of
   * 1, and the anchor's start (a successor is placed by its link). The new
   * task is selected. Insert adds below the focused row, Shift+Insert as its
   * child. An interface-driven call (`event` or `interactive`) on a read-only
   * anchor is refused for child, successor and predecessor.
   * @param task the new task's fields (canonical names); omit it for all defaults
   * @param target where it goes; give one of the five keys, none appends
   * @returns the new id, `null` on a veto or an unknown anchor, or a Promise of either when a handler deferred
   */
  addTask(task?: Partial<GanttTask>, target?: { above?: string | number; below?: string | number; child?: string | number; successorOf?: string | number; predecessorOf?: string | number; event?: unknown; interactive?: boolean }): string | null | Promise<string | null>;
  /**
   * Convert a task to a milestone — duration 0, drawn as a diamond — as one
   * undo step, gated on the vetoable `beforeMilestoneConvert`. A summary is refused (`reason: 'summary'`).
   * @param id the task id
   * @param opts `interactive: true` marks a user-driven call, which a read-only task refuses
   * @returns the recomputed schedule, `undefined` on a veto, or a Promise of either when a handler deferred
   */
  convertToMilestone(id: string | number, opts?: { event?: unknown; interactive?: boolean }): GanttSchedule | undefined | Promise<GanttSchedule | undefined>;
  /**
   * Convert a milestone back to an ordinary task of `duration` days (default
   * 1) as one undo step, gated on `beforeMilestoneConvert`.
   * @param id the task id
   * @param opts the length it takes, and `interactive: true` for a user-driven call
   * @returns the recomputed schedule, `undefined` on a veto, or a Promise of either when a handler deferred
   */
  convertToTask(id: string | number, opts?: { duration?: number; event?: unknown; interactive?: boolean }): GanttSchedule | undefined | Promise<GanttSchedule | undefined>;
  /**
   * Delete one task and every link touching it, as one undo step, gated on
   * the vetoable `beforeTaskDelete`; the Delete key and the default menu's
   * "Delete task" call it. A read-only task refuses an interface-driven call
   * (`event` or `interactive`) with `reason: 'readOnly'`.
   * @param id the task id
   * @param opts `event`: the originating DOM event; `interactive: true` marks a user-driven call
   * @returns the recomputed schedule, `undefined` on a veto, or a Promise of either when a handler deferred
   */
  deleteTask(id: string | number, opts?: { event?: unknown; interactive?: boolean }): GanttSchedule | undefined | Promise<GanttSchedule | undefined>;
  /**
   * Scroll a task's row into view in the mounted split view;
   * the same as `scrollToTask` on the view `mountSplit` returned. A task the
   * task table's filter hides is not revealed: it returns `false` and fires
   * `task:filtered` with `{ id }`.
   */
  scrollToTask(id: string | number): boolean;
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
    /**
     * Whether hovering a row or bar highlights that task's whole dependency
     * chain — itself, every predecessor and every successor — across the rows,
     * bars and links (default true). `false` turns the highlight off. The
     * split view's `mountSplit` version also tells the three roles apart with
     * theme-token colours and names the chain in the hovered bar's accessible
     * description.
     */
    hoverChain?: boolean;
    dateAxis?: boolean;
    /**
     * The today line, as a plan day-number or a calendar date. A date is
     * converted into plan space through `projectEpoch`, so
     * "put the line on the real today" is expressible for a relative plan.
     */
    today?: number | string | Date;
    /**
     * Vertical date markers: one labelled full-height line
     * per entry at its `date`, or a shaded range for a `{ from, to }` entry.
     * Drawn in both the plain and split views, redrawn at every zoom. See
     * {@link GanttMarker}.
     */
    markers?: GanttMarker[];
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
    /**
     * A per-task bar colour, drawn on a task's bar, summary
     * bar or milestone with a matching darker progress fill. Return a CSS
     * colour for a task, or null/undefined to fall back to that task's own
     * `colour` field, then to the theme token. It is a data colour, written
     * literally rather than through a `--lattice-*` token, so it reads the
     * same in light and dark themes.
     */
    barColour?: (task: GanttScheduledTask) => string | null | undefined;
    /** Whether bars can be dragged to move/resize (default true). */
    editable?: boolean;
    /** Pixels from a bar's right edge that begin a resize rather than a move. */
    resizeZone?: number;
    /** Time-scale zoom: a level, or raw pixels-per-day. Omit to fit the width. */
    zoom?: GanttZoom | number;
    /** Scroll so the today line is in view after drawing. */
    scrollToToday?: boolean;
    /**
     * The task tooltip: a positioned card on hover and
     * keyboard focus, anchored to the bar. Default true. See {@link GanttTooltip}.
     */
    tooltip?: GanttTooltip;
    /** Group tasks into swimlanes by a task property name or `fn(task)`. */
    groupBy?: string | ((task: GanttTask) => unknown);
    /** Keyboard editing + focusable bars + ARIA announcements (default true). */
    keyboard?: boolean;
    /** Days a keyboard arrow moves/resizes a task (default 1). */
    moveStep?: number;
    /** The percent a progress-handle drag snaps to, and an Alt+Shift+arrow progress edit steps by; clamped results stay within 0–100. Default `5`. */
    progressStep?: number;
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
    /**
     * The view's height in pixels. A number sets the root
     * to exactly that many pixels and the rows scroll inside. Omitted (or
     * `null`), the view fills its host container when the container has a
     * definite height — the rows scroll inside and the view follows the
     * container as it resizes — and otherwise sizes to its rows up to a
     * sensible maximum.
     */
    height?: number | null;
    rowHeight?: number;
    headerHeight?: number;
    gridWidth?: number;
    indent?: number;
    /**
     * Whether a task name in the plain (no `createGrid`) table wraps onto
     * further lines, growing its row to fit, instead of staying on one line
     * with a trailing ellipsis. Off by default — the full
     * name is still available on hover (native `title`) and to a screen
     * reader (accessible name).
     */
    wrapNames?: boolean;
    zoom?: GanttZoom | number;
    /**
     * The built-in zoom control: a row of day / week /
     * month / quarter / fit-to-plan buttons, each a real keyboard-operable
     * `<button aria-pressed>` labelled from the gantt catalogue, drawn in
     * the view's own header. `true` takes the defaults; an object sets
     * `position` and `levels`. See {@link GanttZoomControlOptions}. Falsy
     * draws none.
     */
    zoomControl?: boolean | GanttZoomControlOptions;
    today?: number;
    /**
     * Vertical date markers: one labelled full-height line
     * per entry at its `date`, or a shaded range for a `{ from, to }` entry,
     * drawn over the timeline and labelled in the time header at every zoom.
     * See {@link GanttMarker}.
     */
    markers?: GanttMarker[];
    nonWorking?: 'weekends' | ((day: number) => boolean);
    calendar?: GanttCalendar | null;
    showArrows?: boolean;
    showProgress?: boolean;
    showBaseline?: boolean;
    /**
     * Whether hovering a row or bar highlights that task's whole dependency
     * chain: itself, every predecessor and every successor,
     * across the left panel's rows, the timeline's bars and the links between
     * them (default true). The highlight distinguishes the three roles with
     * theme tokens — the hovered task in the accent colour, predecessors in
     * the success colour, successors in the info colour — and the hovered
     * bar's accessible description names the chain (`N predecessors, M
     * successors`), so the highlight explains itself. `false` turns the
     * highlight off entirely.
     */
    hoverChain?: boolean;
    /**
     * Whether to mark the zero-float critical path: critical
     * bars and links drawn in the critical colour. Default true; `false` marks
     * nothing. Toggle it live with {@link GanttSplitView.setShowCritical}.
     */
    showCritical?: boolean;
    /**
     * How a critical bar is marked. `'fill'` (the default)
     * redraws it in the critical fill; `'outline'` keeps the bar’s own fill
     * colour and only adds the critical outline, so the marking sits over
     * per-task colours.
     */
    criticalStyle?: GanttCriticalStyle;
    barLabel?: GanttBarLabel | ((task: GanttScheduledTask) => string);
    /** Where a bar’s own label is drawn: `inside` centres it on the bar, `right` just past its edge, `auto` inside only when it fits; a label too wide for its bar falls back to the right under `inside` or `auto`. */
    barLabelPosition?: GanttBarLabelPosition;
    /** The percent a progress-handle drag snaps to, and an Alt+Shift+arrow progress edit steps by; clamped results stay within 0–100. Default `5`. */
    progressStep?: number;
    /**
     * A per-task bar colour, drawn on a task’s bar, summary
     * bar or milestone with a matching darker progress fill. Return a CSS
     * colour for a task, or null/undefined to fall back to that task’s own
     * `colour` field, then to the theme token. It is a data colour, written
     * literally rather than through a `--lattice-*` token, so it reads the
     * same in light and dark themes.
     */
    barColour?: (task: GanttScheduledTask) => string | null | undefined;
    /**
     * The locale the built-in `start` and `end` columns format their dates in. Falls back to `gridConfig.locale`, then the bound
     * grid’s own locale, then the page’s. `en-GB` makes the columns read
     * `dd/mm/yyyy`. Overridden by `dateFormat`.
     */
    locale?: string;
    /**
     * The weekday the week starts on (0-6):
     * drives the header's week band, the week zoom level's column starts
     * and the workload/histogram week buckets, all through one resolver so
     * they can't disagree. Left unset, it falls back to `locale`'s own
     * default (Monday for en-GB and most locales, Sunday for en-US) via
     * `Intl.Locale`'s `weekInfo`, else a small table, else Sunday.
     */
    weekStartDay?: number;
    /**
     * How the built-in `start` and `end` columns format their dates: a token pattern (`'dd/MM/yyyy'`) or a function. The
     * function receives the grid’s format params — `value` is the stored ISO
     * date, with the grid’s `locale` alongside. Overrides the
     * locale-derived default; a per-column `dateFormat` overrides this.
     */
    dateFormat?: string | ((p: { value: unknown; locale?: string }) => string);
    /**
     * Surface earned-value metrics in `kind: 'evm'` columns.
     * `true` computes EVM at the today line (or the project finish); an object
     * overrides the status date and the cost field names.
     */
    evm?: boolean | { statusDate?: number | string | Date; costField?: string; actualCostField?: string };
    /**
     * The S-curve status-date progress line: a vertical line
     * at the status date that jogs, at each task row, to that task’s actual
     * progress point (start + %complete × duration). `true` uses the today line
     * (or the project finish); an object sets the status date explicitly. The
     * same status date drives the `plannedPercentComplete` column.
     */
    progressLine?: boolean | { statusDate?: number | string | Date };
    /**
     * Whether the plan can be edited: pointer drags on the timeline and the
     * left panel’s inline cell editors (default true). Same meaning and
     * default as `mount`'s.
     */
    editable?: boolean;
    /**
     * Keyboard editing + focusable bars + ARIA announcements on the timeline
     * (default true). Same meaning and default as `mount`'s.
     */
    keyboard?: boolean;
    /**
     * Pixels from a bar’s right edge that begin a resize rather than a move
     * (default 6). Same meaning and default as `mount`'s.
     */
    resizeZone?: number;
    /**
     * The task tooltip: the SAME positioned card `mount`
     * draws, anchored to the hovered or keyboard-focused bar. Default true.
     * See {@link GanttTooltip}.
     */
    tooltip?: GanttTooltip;
    /**
     * A `{ t(key, params) }` resolver for the view’s own text — the live
     * region’s edit announcements. Omit it and a gantt bound to a grid borrows
     * that grid’s catalogue; a standalone plan falls back to English.
     */
    messages?: { t: (key: string, params?: Record<string, unknown>) => string };
    /**
     * The columns of the left panel. `kind` decides what the cell shows and what a
     * double-click edits: `'name'` the WBS tree (edits the name), `'assignee'`
     * the avatars, `'progress'` the % ring (edits `percentComplete`), `'evm'`
     * an earned-value `metric`, and `'start'`/`'end'`/`'duration'` the
     * scheduled window — an ISO date, an ISO date, and a whole number of days,
     * each of which edits the plan through the same path a bar drag takes. `'effort'` (hours) and `'units'` (a percentage, 100 =
     * one full-time resource) are the optional effort-driven columns; each edits through `applyEdit`, so the task
     * reschedules per its `schedulingMode`. `'slack'` shows
     * the task’s total float in whole working days, read-only. `'unscheduled'`
     * is a read-only boolean column that marks the tasks with
     * no dates or duration yet; on a real grid table it filters like any
     * boolean column. `'wbs'` is a read-only column
     * showing each task's derived outline code (`1`, `1.1`, `1.2`, `2`, …),
     * sortable on a real grid table under the same tree-aware sort
     * as every other column. A bare string names a built-in
     * column, so `['name', 'duration', 'effort', 'units']` is enough. On an
     * editable plan the assignee cell opens the assignment picker. A column
     * with no `kind` shows the raw task’s `key` and edits it only with
     * `editable: true`.
     *
     * Every column header carries a draggable right border with a
     * col-resize cursor: a pointer drag, or arrow keys
     * once the border itself is focused (8px a press, 32px with Shift).
     * `minWidth`/`maxWidth` clamp how far it goes; `resizable: false` omits
     * the border entirely. The table/timeline divider (`gridWidth`) is the
     * same gesture; a settled drag or keystroke on either fires exactly one
     * `columnResize`, and every width — the divider’s included, under the
     * key `'grid'` — round-trips through `getState`/`setState`.
     */
    columns?: Array<'name' | 'start' | 'end' | 'duration' | 'assignee' | 'progress' | 'effort' | 'units' | 'slack' | 'deadline' | 'unscheduled' | 'earlyStart' | 'lateStart' | 'lateFinish' | 'baselineStart' | 'baselineEnd' | 'variance' | 'note' | 'sequence' | 'constraint' | 'constraintDate' | 'wbs' | 'predecessors' | 'successors' | {
      key: string; title?: string; width?: number; kind?: 'name' | 'assignee' | 'progress' | 'evm' | 'plannedPercentComplete' | 'start' | 'end' | 'duration' | 'effort' | 'units' | 'slack' | 'deadline' | 'unscheduled' | 'earlyStart' | 'lateStart' | 'lateFinish' | 'baselineStart' | 'baselineEnd' | 'variance' | 'note' | 'sequence' | 'constraint' | 'constraintDate' | 'wbs' | 'predecessors' | 'successors' | 'number'; metric?: 'bac' | 'pv' | 'ev' | 'ac' | 'sv' | 'cv' | 'spi' | 'cpi'; digits?: number; editable?: boolean; editField?: string; dateFormat?: string | ((p: { value: unknown; locale?: string }) => string);
      /** The narrowest this column can be dragged/keyed to; default 160 for `kind: 'name'`, 40 otherwise. */
      minWidth?: number;
      /** The widest this column can be dragged/keyed to; default unbounded. */
      maxWidth?: number;
      /** `false` omits the resize border on this column’s header; default true. */
      resizable?: boolean;
      render?: (task: GanttScheduledTask, ctx: { rawTask: GanttTask; depth: number }) => unknown;
    } | GanttGridColumn>;
    /**
     * The host’s grid factory, injected rather than
     * imported: with it, the task table and the bands' resource tables are
     * real Lattice grids configured with the normal column API (`columns`,
     * `workload.columns`, `histogram.columns`), row heights and vertical
     * scroll locked to the timeline.
     */
    createGrid?: (element: unknown, config: GridConfig) => Grid;
    /**
     * Further grid configuration every table grid is created with, e.g. `{ theme, locale }`.
     * The split view builds its tables with no cell ranges and no fill handle (the task table keeps row
     * selection and editing); this is laid over those defaults, so `{ selection: { ranges: true, fillHandle: true } }`
     * restores both. `band` is laid over it again for the workload and histogram band tables only.
     */
    gridConfig?: Partial<GridConfig> & { band?: Partial<GridConfig> };
    /**
     * Draw a small corner mark (theme token
     * `--lattice-dirty-mark`) on every built-in task-table cell whose field
     * differs from the committed baseline — cleared the instant `commit()`
     * runs or the plan loads clean. Default false; needs `createGrid`, since
     * the mark is a cell `classWhen` rule on the real grid's built-in
     * columns.
     */
    dirtyMarks?: boolean;
    /**
     * A resource workload band beneath the split view:
     * one row per resource on the left and, on the right, that resource’s
     * hours per time bucket — aligned column-for-column with the timeline’s
     * scale header, scroll-locked to it horizontally (vertically it scrolls
     * on its own), and redrawn in the same paint as the bars whenever the
     * plan changes. `true` takes the defaults below; an object overrides
     * them; omitted, no band is drawn.
     *
     * **Editing.** A resource row expands (a disclosure
     * button, `aria-expanded`) into one sub-row per task it carries. The
     * resource’s own cell is the read-only aggregate; a SUB-ROW cell accepts
     * a typed number of hours on a double-click whenever the view’s
     * `editable` is on. What is typed is written to that task’s `work`
     * contour through the same `applyEdit` choke point (and the same
     * `beforeTaskEdit` veto) a bar drag uses, so the bar, the table row and
     * the band all move in one paint — including the span, which follows the
     * contour: type into a column beyond the bar and the bar grows to reach
     * it. A bucket containing no working day declines the edit and says so.
     *
     * **Where the hours come from.** They are DERIVED from the tasks, never
     * supplied: a task’s own `work` (or `hours`) field when it carries a
     * finite one, otherwise `working days × hoursPerDay × units`, divided
     * between the task’s assignments in proportion to their units and spread
     * evenly over the working days the task spans. Working days are the days
     * this view already shades — pass the `calendar`/`nonWorking` option the
     * plan is scheduled with. Resources, units and capacities are the gantt’s
     * existing vocabulary (`assignee`/`assignees`/`owner`/`assignments` on a
     * task; `resources`/`defaultCapacity` on `createGantt`); a task naming no
     * resource is carried on an "Unassigned" row rather than dropped. An
     * empty bucket is blank, not `0`, and a bucket over
     * `capacity × hoursPerDay × the bucket’s working days` is marked with a
     * class and an accessible label.
     */
    workload?: boolean | {
      /** The band's resource-table columns when `createGrid` is injected: built-in ids `'resource'` (required) and `'total'`, overrides of them, and host columns, including {@link GanttBandColumn} ones with their own `value`/`render`. */
      columns?: Array<string | GanttGridColumn | GanttBandColumn>;
      /** Hours a full-time (`units: 1`) resource works in a working day; default 8. */
      hoursPerDay?: number;
      /** The band’s height in pixels, taken from the view’s own `height`; default 160. */
      height?: number;
      /**
       * The band's maximum height in pixels: the band sizes
       * to its rows (the header, one row per resource and sub-row, and the
       * totals row) and caps at this many pixels, scrolling on its own past
       * it instead of squeezing the plan — which always keeps at least half
       * the view. Omitted, the band keeps its fixed `height`.
       */
      maxHeight?: number;
      /** A band row’s height in pixels; default 28. */
      rowHeight?: number;
      /** Maximum decimal places in a cell, trailing zeros dropped; default 1. */
      decimals?: number;
      /** Draw the totals row and totals column; default true. */
      totals?: boolean;
      /**
       * `'hours'` (default; an existing page is unchanged) draws booked
       * hours; `'percent'` draws hours as a share of the resource’s own
       * available hours that bucket — `booked ÷ available × 100`, the SAME
       * available-hours figure the over-capacity highlight already uses
       * (the per-resource calendar included), falling back to hours for a
       * resource with no known capacity; a bucket with a KNOWN zero (a
       * part-timer’s non-working day, a week wholly on leave) reads "–",
       * never `Infinity`/`NaN`. An `<button
       * aria-pressed>` switch in the band’s header toggles it (and the
       * histogram band’s, when one is mounted) live; the same switch is
       * reachable off the view as `setWorkloadUnit`/`getWorkloadUnit`.
       * Editing in percent mode writes HOURS: typing `50` books half the
       * resource’s available hours in that bucket, through the identical
       * `applyEdit` path an hours edit uses. `'cost'` draws hours × the
       * resource’s rate in force each day, read off the
       * SAME `computeWorkload` pass, falling back to hours for a resource
       * with no rate data; cost has no capacity concept, so there is no
       * over-highlight or capacity line in this unit.
       */
      unit?: 'hours' | 'percent' | 'cost';
      /**
       * Utilisation thresholds colouring each cell (and the histogram
       * band’s bars, when one is mounted) by how full the bucket is: each entry is `{ at, className | colour }`,
       * `at` a fraction of the bucket’s available hours (0.8 = 80%
       * booked), and either a `className` added to the cell/bar or a
       * `colour` applied inline (spelled `colour` or `color`). The highest
       * threshold a bucket reaches wins. Applies in every unit — hours,
       * percent and cost — because the fraction is always read off the
       * hours figures. Omitted, no threshold colouring.
       */
      thresholds?: Array<{ at: number; className?: string; colour?: string; color?: string }>;
      /** Draw the Unassigned row (default true); `false` hides it. */
      showUnassigned?: boolean;
      /**
       * Group the resource rows by a resource field (e.g. `'department'`) or
       * a function of the resource spec: one collapsible
       * header row per group, carrying the group's summed load and available
       * hours, with that group's resources beneath it. Unset, no grouping.
       */
      groupBy?: string | ((resource: Record<string, unknown>) => unknown);
      /**
       * Load-only bookings from other projects: hours
       * that count in this band, the histogram and the band’s own
       * over-allocation highlight, and are listed as "other project"
       * sub-rows under their resource, but that name no task — never drawn
       * as a row or a bar, and never touching the critical path, the
       * project finish or a summary. See {@link GanttWorkloadExternal}.
       * The equivalent per-task spelling is a task’s own `loadOnly: true`
       * flag.
       */
      external?: GanttWorkloadExternal[];
      /**
       * The resource-name column’s width in pixels,
       * sized independently of the task table’s first column (which is what
       * it followed before, so a narrow WBS column truncated every name).
       * Defaults to the band’s own label width; the full name is always
       * carried as a title.
       */
      labelWidth?: number;
      /**
       * The hover/focus tooltip on a bucket cell: `false`
       * hides it, and a function supplies the host's own content, receiving
       * the cell payload ({@link GanttWorkloadCellEvent}) and returning a
       * `string`, a DOM node, or `null` to show nothing. Omitted, the
       * built-in card lists the contributing tasks.
       */
      tooltip?: boolean | ((payload: GanttWorkloadCellEvent) => string | Node | null | undefined);
    };
    /**
     * A resource histogram band beneath the split view, below the workload
     * band when both are mounted: one row per resource,
     * drawn as bars per time bucket rather than a table of numbers, with a
     * capacity line and a hover/focus tooltip. `true` takes the defaults
     * below; an object overrides them; omitted, no band is drawn.
     *
     * The bars come from the SAME derivation the workload band uses
     * (`computeWorkload`, driven off `work`/`hours`/`assignments` exactly as
     * documented on `workload` above) — this is a second PICTURE of the same
     * numbers, not a second source of them. The non-stacked bar for a bucket
     * over capacity carries both the normal fill up to capacity and the
     * over-allocation fill above it; `stacked: 'task'` additionally splits
     * the within-capacity portion into one coloured segment per contributing
     * task, still capped by the one over-allocation segment on top. An
     * accessible table (resource, period, hours/percent, capacity,
     * over-allocated) is rebuilt alongside the bars on every redraw.
     *
     * Mounted alongside `workload` at a fixed `height`, the two bands share
     * it rather than squeezing the timeline: the timeline keeps at least
     * half the view, the bands shrink in proportion when both do not
     * otherwise fit, and — rather than ever reading as an unreadably thin
     * sliver of bars — the histogram collapses to its header strip (with a
     * console warning naming the height it needs) when even its
     * proportional share would leave too little room for the plot.
     */
    histogram?: boolean | {
      /** The band's resource-table columns when `createGrid` is injected: the built-in id `'resource'` (required), an override of it, and host columns, including {@link GanttBandColumn} ones with their own `value`/`render`. */
      columns?: Array<string | GanttGridColumn | GanttBandColumn>;
      /** Which resources to draw, and in what order; omitted draws every resource `computeWorkload` finds, Unassigned last. */
      resources?: string[];
      /** `'hours'` (default) draws raw hours; `'percent'` draws hours as a percentage of capacity, falling back to `'hours'` for a resource with no capacity; `'cost'` draws hours × rate, falling back to `'hours'` for a resource with no rate data, with no capacity line in this unit. */
      unit?: 'hours' | 'percent' | 'cost';
      /** `'task'` stacks one segment per contributing task; `false` (default) draws one solid bar per bucket. */
      stacked?: 'task' | false;
      /** The band’s total height in pixels; default 160. */
      height?: number;
      /**
       * The band's maximum height in pixels, exactly as the
       * workload band's `maxHeight`: the band sizes to its rows and caps at
       * this many pixels, scrolling on its own past it instead of squeezing
       * the plan. Omitted, the band keeps its fixed `height`.
       */
      maxHeight?: number;
      /** A band row’s height in pixels; default 48. */
      rowHeight?: number;
      /**
       * The resource-name column’s width in pixels,
       * sized independently of the task table’s first column, exactly as
       * the workload band’s `labelWidth`; the full name is always carried
       * as a title.
       */
      labelWidth?: number;
    };
    /**
     * The row/bar context menu: a function returning the
     * menu items for a task, shown in the grid’s own menu component on a
     * right-click (or Menu key / Shift+F10) over that task’s table row or
     * timeline bar. Omit it and no context menu is installed — the grid’s
     * own cell menu is left alone. See {@link GanttContextMenu}.
     */
    contextMenu?: GanttContextMenu;
    /**
     * A collapsible scheduling-conflicts issues panel inside the view chrome: lists each conflict with a count badge, keyboard
     * operable, a click that scrolls to and highlights the tasks, and the fix
     * actions safe for each kind (remove the offending link, set the
     * constraint to as-soon-as-possible, unlock the task, clear the deadline),
     * each one undo step. `false` (the default) draws no panel.
     */
    issuesPanel?: boolean;
    /**
     * Linked data bands under the gantt and the resource bands: each a measure per task (or summary, resource or
     * host group) per timeline bucket, with totals, formats, thresholds,
     * optional editing and a series that follows its task when it moves.
     * See {@link GanttDataBand}.
     */
    dataBands?: GanttDataBand[];
  }): GanttSplitView;
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
  /**
   * Compute the cumulative S-curve for the current plan — one
   * `{ date, pv, ev, ac }` point per time bucket from the project start to the
   * project finish. The same arithmetic `earnedValue` performs, evaluated over
   * time: PV climbs to the total budget at the finish, EV and AC stop at the
   * status date.
   */
  sCurve(scurveOpts?: { statusDate?: number | string | Date; bucket?: 'day' | 'week' | 'month'; costField?: string; actualCostField?: string }): GanttSCurvePoint[];
  /**
   * Mount a cumulative PV/EV/AC S-curve chart: three lines, a
   * vertical status-date marker, a legend with the project SPI and CPI, and a
   * visually hidden table of the points. Redraws on every schedule recompute;
   * the returned view's `refresh()` redraws it now and `destroy()` detaches it.
   */
  mountSCurve(container: unknown, scurveOpts?: { width?: number; height?: number; bucket?: 'day' | 'week' | 'month'; statusDate?: number | string | Date; costField?: string; actualCostField?: string }): { refresh(): void; destroy(): void };
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
 *
 * Theme: no `theme` of its own — it inherits. Its colours are the
 * grid's `--lattice-*` tokens, so `data-theme="dark"` on any ancestor (a layout's
 * `theme: 'dark'`, or `<html>`) darkens it with everything else, and the nearest
 * `data-theme` wins. Load the grid stylesheet, which carries the tokens.
 */
export function createGantt(opts?: {
  tasks?: GanttTask[];
  dependencies?: GanttDependency[];
  /** The schedule anchor: a day-number, ISO date string or Date. It only sets the floor a task with no predecessor starts on; it does not change how the schedule is computed. When omitted, the project start is derived from the earliest task start. */
  projectStart?: number | string | Date;
  /** A project deadline (a day-number, ISO string or Date); tasks that cannot meet it get negative float. */
  deadline?: number | string | Date;
  /** A working-time calendar: skip weekends/holidays, durations in working days. */
  calendar?: GanttCalendar | null;
  /**
   * The weekday the week starts on (0-6), read by
   * `toMSPDI` and exposed back as `gantt.weekStartDay`. Left unset, it falls
   * back to the bound `grid`'s locale default (Monday for en-GB and most
   * locales, Sunday for en-US) via `Intl.Locale`'s `weekInfo`, else a small
   * table, else Sunday.
   */
  weekStartDay?: number;
  /**
   * Named working calendars, `{ id: spec }`, which a task's or resource's
   * `calendar` can name instead of stating a spec. An id that is not here refuses the
   * schedule with an `unknown-calendar` error.
   */
  calendars?: GanttCalendars;
  /** Resource capacities for over-allocation detection and leveling. */
  resources?: GanttResourceSpec;
  /** The capacity for a resource with none stated (default 1 = one full-time booking). */
  defaultCapacity?: number;
  /**
   * The plan's hours in a full working day. It
   * sizes a resource calendar's hours capacity against a full-time day and is
   * the default the workload band assumes, so the over-allocation marks and the
   * band agree on what "full" means.
   */
  hoursPerDay?: number;
  /**
   * The plan's default scheduling mode, inherited by any task
   * that names none. The default is `'fixedDuration'`, so a plan that sets
   * neither this nor a per-task `schedulingMode` schedules exactly as before.
   */
  schedulingMode?: GanttSchedulingMode;
  /**
   * The plan's default effort-driven flag: on a fixed-duration
   * task, adding a resource then splits the units and keeps the effort rather
   * than adding units. Inherited by any task that sets no `effortDriven`.
   */
  effortDriven?: boolean;
  /**
   * Hard-locks every task this returns true for — the plan-wide
   * counterpart to a per-task `locked: true` or `constraintMode: 'hard'` (a task locks if
   * EITHER says so). A common rule is `(task) => task.percentComplete === 100`, locking
   * finished work so a predecessor pushed later never drags it along; the violated link is
   * reported in `schedule.conflicts` (type `'LOCKED'`) instead, and a drag on the task is
   * refused.
   */
  lockWhen?: (task: GanttTask) => boolean;
  /**
   * Refuses every user-driven edit on every task this returns true for
   * — the plan-wide counterpart to a per-task `readOnly: true`. A common rule is
   * `(task) => task.percentComplete === 100`. Unlike `lockWhen`, this never touches the
   * schedule — a predecessor still pushes a read-only task — and never touches
   * `applyEdit`/`setDependencies`/`deleteDependency` called directly from code; it only
   * refuses pointer/keyboard drag, resize, progress drag, a dependency create/delete
   * touching the task, and a task-table cell edit on it.
   */
  readOnlyWhen?: (task: GanttTask) => boolean;
  autoSchedule?: boolean;
  /**
   * Honour the host's stored task dates: on `setTasks` and
   * `setDependencies` each link's lag is derived from its two endpoints'
   * dates, so a plan loaded with dates and links recomputes to those same
   * dates and nothing moves. The derived lags are reflected in
   * `gantt.dependencies`.
   */
  honourDates?: boolean;
  /** The plan's own title: `print()`'s default header when a call names no title of its own. */
  title?: string;
  grid?: unknown;
  /**
   * How many session undo steps to keep; default 100. Each
   * user or API edit is one step (a drag coalesces into one, a whole
   * `level()` run is one); older steps fall off the bottom. History is
   * session only — cleared by `setTasks`/`setState`, lost on reload, and not
   * part of `getState`/`setState`.
   */
  historyDepth?: number;
  /** Map task fields to grid column ids to enable drag write-back. */
  columns?: { start?: string; end?: string; duration?: string; percentComplete?: string; name?: string; assignments?: string; effort?: string; units?: string };
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
  /**
   * Opt into the committed-change events for the host's own loads. By default the typed data-change events (`taskAdd`,
   * `taskUpdate`, `datesChanged`, `change`, …) fire only for user and API
   * edits, never for a `setTasks` or `rows.apply` load; `{ loads: true }`
   * makes a load raise them too, with cause `'api'`.
   */
  events?: { loads?: boolean };
  /** Auto-mount into this element at construction. */
  element?: unknown;
}): Gantt;
export default createGantt;

/** The model {@link importMSPDI} returns and {@link exportMSPDI} takes. */
export interface GanttMSPDIModel {
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
  /** The named calendars tasks and resources may reference; each is written as its own calendar. */
  calendars?: GanttCalendars;
  /**
   * The project's week start (0-6), written as
   * MSPDI's own `<WeekStartDay>`. Omitted writes no element.
   */
  weekStartDay?: number;
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
  /** The project's week-start weekday (0-6), read from MSPDI's `WeekStartDay`. */
  weekStartDay?: number;
  /** The calendars tasks reference, keyed by calendar name; each task names its own in `calendar`. */
  calendars?: GanttCalendars;
};

/**
 * Export a Gantt model to Microsoft Project (MSPDI) XML. A
 * scheduled model may be passed so start/finish dates are the computed ones.
 */
export function exportMSPDI(model: GanttMSPDIModel, opts?: { hoursPerDay?: number; projectName?: string }): string;
