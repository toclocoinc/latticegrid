/*!
 * Lattice Grid 1.89.0, designer module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  FilterSet,
  defaults,
} from '../lattice-grid.js';

// The dashboard's own spec vocabulary, imported rather than re-declared: a
// designer page's spec IS a dashboard spec. Type-only.
import type { Dashboard, DashboardOptions, DashboardSource, DashboardSpec, DashboardPanel } from './dashboard.js';
// The Data Router config routing runs through. Type-only.
import type { DataRouter } from './data-router.js';
// A widget's placement IS a layout window's. Type-only.
import type { LayoutPlacement } from './layout.js';
// The role descriptor a generated editor reads, from the charts registry's
// capability metadata. Type-only.
import type { ChartRole, ChartEditorModel } from './charts.js';

/**
 * One filter: a global one lives on `DesignerState.filters`
 * (every page), a page one on `DesignerPage.filters` (that page only). The
 * same shape a palette-added filter widget writes (`id`, `type`, `source`,
 * `field`), with `operator` and a `value` added once it is set: a `list`
 * filter's is `string[]`, a `range`'s `[number|'', number|'']`, a
 * `dateRange`'s `{ preset, from, to }` (ISO calendar days; `preset` one of
 * `last7`, `last30`, `last90`, `thisMonth`, `thisQuarter`, `thisYear`,
 * `custom`), a `search`'s a plain string. No value means the filter is
 * defined but inactive — not filtering anything.
 */
export interface DesignerFilter {
  /** A unique id, scoped to the list it is in. */
  id: string;
  /** The filter widget kind, which also decides `operator`'s shape and `value`'s. */
  type: 'list' | 'range' | 'dateRange' | 'search';
  /** The source it reads. */
  source: string;
  /** The field it filters on. */
  field: string;
  /** The operator the type implies (`in`, `between`, `between`, `contains`). */
  operator?: string;
  /** The active value, type-shaped as above; absent means not filtering. */
  value?: unknown;
  /** Any other key is carried through `getState()` unchanged. */
  [key: string]: unknown;
}

/**
 * One widget's cross-filter setting: "clicking this
 * filters…". Kept at `DesignerState.panels[panelId].clickFilter`, not on the
 * panel itself — the dashboard spec's own keys are closed — and compiled to
 * `DesignerPage.spec.links` whenever any widget's setting on that page
 * changes.
 */
export interface DesignerClickFilter {
  /** Every other widget on the page, or the chosen ones' ids. */
  targets: 'all' | string[];
  /** The field a click's row(s) are read by, and the target widgets are filtered on (same name both sides). */
  on: string;
}

/** One page of a designed dashboard. */
export interface DesignerPage {
  /** A unique id. */
  id: string;
  /** The page's title. */
  title?: string;
  /** The page's dashboard spec; its sources are added to the designer's own. */
  spec: DashboardSpec;
  /** This page's own filters, on top of `DesignerState.filters`. */
  filters?: DesignerFilter[];
  /** Any other key is carried through `getState()` unchanged. */
  [key: string]: unknown;
}

/**
 * The designer's state: the dashboard spec extended with pages. Plain JSON,
 * and every key the designer does not know is carried, so
 * `setState(getState())` is the identity.
 */
export interface DesignerState {
  /** The schema version, `1`. */
  schemaVersion: number;
  /** The pages, in order. */
  pages: DesignerPage[];
  /** The page on the canvas, or null when there is none. */
  selectedPageId: string | null;
  /** Filters that apply on every page, on top of each page's own. */
  filters?: DesignerFilter[];
  /** The designer chrome's own state (later cards keep theirs here); may be empty. The editing screen keeps each rail's collapse as `{ left: { collapsed }, right: { collapsed } }`; a widget's cross-filter setting is `panels[panelId].clickFilter`. */
  panels: Record<string, unknown>;
  /** Any other key is carried through `getState()` unchanged. */
  [key: string]: unknown;
}

/** `'edit'` builds the canvas interactive; `'view'` is `createDashboard` and nothing else. */
export type DesignerMode = 'edit' | 'view';

/**
 * One keyed config row: the unit the Data Router adds,
 * updates and removes. The designer state normalises to these — one per
 * widget, page, filter and relationship — and `configRowsToState` is their
 * exact inverse. A widget row's `kind` is its panel kind (`grid`, `chart`,
 * …); a page/filter/relationship row's `kind` names its sort.
 */
export interface DesignerConfigRow {
  /** The row's id (a widget's is its panel id); the Data Router's `rowKey`. */
  id: string;
  /** The page (or dashboard) the row belongs to; the partition key. */
  page: unknown;
  /** A panel kind for a widget, else `'page'`, `'filter'` or `'relationship'`. */
  kind: string;
  /** The widget's source, or null. */
  source: unknown;
  /** A widget's viewer options (its data mapping), or null. */
  mapping: unknown;
  /** The rest of the entity's config — a panel's title and so on, or a page's spec. */
  format: unknown;
  /** A widget's window placement, or null. */
  placement: unknown;
  /** A version/sequence the router orders and de-duplicates on. */
  seq: number;
}

/**
 * The write path an author's own edits leave through,
 * mirroring the `onWrite` a grid's write-back uses.
 */
export interface DesignerConfigWrite {
  /** `'upsert'` for an add or change, `'delete'` for a removal. */
  op: 'upsert' | 'delete';
  /** The config row the edit produced. */
  row: DesignerConfigRow;
  /** The row as it was before, or null for a new one. */
  before: DesignerConfigRow | null;
}

/**
 * Config routing: route dashboard config to a designer the
 * way the Data Router routes rows to a grid. The designer subscribes to its
 * slice of a router and applies the keyed diff per widget — add creates,
 * update re-renders only that widget, remove deletes — and an author's own
 * edits leave as config rows through the write path. Inert until `connect`.
 */
export interface DesignerConfigRouter {
  /** The whole state as config rows, one per widget, page, filter and relationship. */
  rows(): DesignerConfigRow[];
  /** Decompose any designer state into config rows. */
  toRows(state: Partial<DesignerState> | DashboardSpec): DesignerConfigRow[];
  /** Recompose a designer state from config rows (the inverse of `toRows`, by `sameSpec`). */
  fromRows(rows: DesignerConfigRow[]): DesignerState;
  /**
   * Subscribe to a slice of a Data Router and apply its keyed config diff per
   * widget. `page` names the slice (default: the selected page); `filter` and
   * `transform` are the router's own per-route options, so one dashboard can
   * vary per role or tenant; `onWrite` receives an author's own edits as
   * config rows. Replaces any current connection; returns a disconnect.
   */
  connect(router: DataRouter, options?: {
    page?: unknown;
    filter?: (row: DesignerConfigRow) => boolean;
    transform?: (row: DesignerConfigRow) => DesignerConfigRow;
    label?: string;
    onWrite?: (change: DesignerConfigWrite, context: { route: unknown; page: unknown; source: 'author' }) => void;
  }): () => void;
  /** Disconnect the current router, if any. */
  disconnect(): void;
  /** The connected router, or null. */
  readonly router: DataRouter | null;
  /** The connected slice (page or dashboard id), or null. */
  readonly page: unknown;
  /** The connected router's `explain()`, or null when nothing is connected. */
  explain(options?: unknown): unknown;
  /** The connected router's `trace`, or null when nothing is connected. */
  readonly trace: unknown;
  /** Disconnect and tear the handle down. */
  destroy(): void;
}

/**
 * One widget's compiled data route: the fields its roles
 * use, its aggregations, its page and global filters, and the joins its
 * fields need across the declared relationships. Compiled from the widget's
 * own config row alone — unaffected by any other widget's.
 */
export interface DesignerDataRoute {
  /** The widget's own id (its panel id). */
  widgetId: string;
  /** The page the widget is on. */
  page: unknown;
  /** The widget's panel kind (`grid`, `kpi`, `chart`, …). */
  kind: string;
  /** The widget's own source id, or null. */
  sourceId: string | null;
  /** Every field the widget's roles read — its own source's fields bare, a joined source's as `'otherSource.field'`. Never wider than the roles bound. */
  fields: string[];
  /** The subset of `fields` a role marked as a grouping dimension. */
  groupBy: string[];
  /** One entry per aggregated role: the engine's own `{id, col, fn}` shape, ready for `executeGroupedAggregates`. */
  aggregates: { id: string; col: string; fn: string; role: string }[];
  /** The `compileRelationships` edges the route's cross-source fields need, one per related source actually reached. */
  joins: unknown[];
  /** The route's filters: `page` are this page's filters naming this widget's own source; `global` name no source and apply to every widget on the page. */
  filters: { page: unknown[]; global: unknown[] };
  /** One message per role field a declared relationship could not reach; that field is left out of `fields`. */
  refusals: string[];
}

/**
 * Data routes from config: a route per widget, compiled
 * from its own config row and its page's filters, re-planned — and, for a
 * `rows`-kind source, its data re-read in memory — only when that widget's
 * row or its page's filters change; an untouched widget on an untouched
 * page keeps its exact route object. A `pushdown`-kind source's route is
 * compiled the same way but not live-fetched here: that source's own
 * widget rendering is the one path that asks its adapter,
 * debounced — `issueQuery` stays available for a host or a test to call on
 * such a route directly. The handle the designer exposes as
 * `designer.dataRoutes`.
 */
export interface DesignerDataRoutes {
  /** Every live route. */
  routes(): DesignerDataRoute[];
  /** One widget's route, or null when it has none (removed, or never a widget row). */
  route(id: string): DesignerDataRoute | null;
  /** The last data a widget's `rows`-kind route asked for, or null before its first request, after it is detached, or for a `pushdown`-kind route. */
  result(id: string): unknown;
  /** Every data request issued, in order, by widget id — a role edit on one widget adds one entry naming it, and no entry for any other. */
  requests(): { widgetId: string; seq: number }[];
  /** Every live route, by widget id — `explain()[widgetId]` reads the way the Data Router's own report reads. */
  explain(): Record<string, DesignerDataRoute>;
  /** Re-plan every widget's route from the current state, whether or not its row changed, and re-read every `rows`-kind widget's data. */
  refresh(): void;
  /** Tear the handle down. */
  destroy(): void;
}

/**
 * The guardrails a developer sets to limit what an author can use. Everything omitted is allowed, so `{}` restricts
 * nothing. A value a guardrail does not recognise is ignored rather than
 * guessed. Changeable at run time with `setProperty('guardrails', value)`.
 */
export interface DesignerGuardrails {
  /** Only these source ids may be used; omitted = every source. */
  sources?: string[];
  /** Per-source field allow/deny, e.g. `{ sales: { allow: ['region'], deny: ['cost'] } }`; a deny wins over an allow. */
  fields?: Record<string, { allow?: string[]; deny?: string[] }>;
  /** Only these panel kinds (`grid`, `chart`, `kpi`, `calendar`, `map`, `html`) may be added. */
  widgets?: string[];
  /** The chart types allowed: concrete names (`['bar', 'line']`), or families (`{ families: ['bar'] }`). */
  chartTypes?: string[] | { families?: string[] };
  /** Formatting allowed: `'full'`, `'basic'` (everyday options), `'none'`, or the names of the options allowed. */
  formatting?: 'full' | 'basic' | 'none' | string[];
  /** Which page operations an author may do; each defaults to allowed. */
  pages?: { add?: boolean; remove?: boolean; rename?: boolean; reorder?: boolean };
  /** Whether authors may add calculated fields; defaults to true. */
  calculatedFields?: boolean;
  /** Whether authors may derive grids; defaults to true. */
  derivedGrids?: boolean;
  /** Whether authors may use the AI assistant; defaults to true. */
  ai?: boolean;
  /** The most widgets a page may hold; omitted = no limit. */
  maxWidgetsPerPage?: number;
}

/**
 * A field's data type, shown with its own icon and grouped in the data
 * panel.
 */
export type DesignerFieldType = 'number' | 'currency' | 'percent' | 'date' | 'datetime' | 'boolean' | 'text' | 'list' | 'geometry';

/**
 * One field of a source, declared by the developer or inferred from the
 * source's own data or adapter schema when not declared.
 */
export interface DesignerSourceField {
  /** The field's id: a key of a `rows` row, or a `columns` entry's `field`. */
  id: string;
  /** The label shown in the data panel; a human form of `id` by default. */
  label?: string;
  /** The field's type, which decides its icon and the type group it sits in. */
  type: DesignerFieldType;
  /** How a value is formatted, as a `Column.format` mask. */
  format?: string;
  /** Shown in the data panel beneath the field's label. */
  description?: string;
}

/**
 * A relationship from one source's field to another's,
 * which {@link createDesigner}'s data panel compiles to a data-router join
 * edge: a LOOKUP join (`many-to-one`/`one-to-one`) on `from`'s source,
 * pulling `fields` from `to`'s source; a COLLECT join (`one-to-many`) on
 * `from`'s source (the "one" side), gathering `to`'s matching rows under
 * `as`.
 */
export interface DesignerRelationship {
  /** `'sourceId.fieldId'`, the "many" side of a `many-to-one`, the "one" side of a `one-to-many`. */
  from: string;
  /** `'sourceId.fieldId'`, the other side. */
  to: string;
  /** The cardinality; `'many-to-one'` by default. */
  type?: 'many-to-one' | 'one-to-many' | 'one-to-one';
  /** A `many-to-one`/`one-to-one` join's fields to pull: an array, a `{ src: dest }` rename map, or a `select` function, as a data-router join's own `fields`. */
  fields?: string[] | Record<string, string> | ((lookupRow: object | null, leftRow: object) => object);
  /** A `one-to-many` join's collected-array field name; the `to` source's id by default. */
  as?: string;
}

/** One {@link DesignerRelationship} compiled to the data-router join edge that realises it. */
export interface DesignerRelationshipEdge {
  /** The source the join attaches to (`router.addSource(sourceId, { join })`). */
  sourceId: string;
  /** The source it joins against. */
  relatedSourceId: string;
  /** The field on `sourceId` the join reads. */
  field: string;
  /** The field on `relatedSourceId` the join matches. */
  relatedField: string;
  /** The relationship's cardinality. */
  type: 'many-to-one' | 'one-to-many' | 'one-to-one';
  /** The `join` option: `router.addSource(sourceId, { join })`. */
  join: Record<string, unknown>;
}

/** One source and its fields, as the data panel shows it. */
export interface DesignerSourceInfo {
  /** The source's id. */
  id: string;
  /** The source's `kind` (`rows`, `pushdown`, `router` or `grid`). */
  kind: string | undefined;
  /** The source's fields, guardrails already applied. */
  fields: DesignerSourceField[];
}

/**
 * The data panel: the host's sources, fields, types and
 * relationships, browsable and draggable onto widgets. Mounted in
 * `designer.chrome`.
 */
export interface DesignerDataPanel {
  /** The panel's own element, inside `designer.chrome`. */
  readonly el: HTMLElement;
  /** Every visible source and its visible fields, guardrails applied. */
  sources(): DesignerSourceInfo[];
  /** Every source reachable from `sourceId` through `relationships`, both directions, multi-hop. */
  reachable(sourceId: string): string[];
  /** `relationships` compiled to data-router join edges. */
  compiledRelationships(): DesignerRelationshipEdge[];
  /** Filter the field list by free text, against each field's id, label and description. */
  setQuery(text: string): void;
  /** Set which widget's source drives the "reachable from" list, by panel id. */
  selectSource(panelId: string | null): void;
  /**
   * Register a drop target inside the designer (a properties panel's role
   * slot): dropping a field there calls `onDrop({ sourceId, fieldId })`
   * instead of adding it to the canvas. Returns a function that unregisters it.
   */
  registerRoleTarget(el: HTMLElement, onDrop: (payload: { sourceId: string; fieldId: string }) => void): () => void;
  /** Tear down the panel and its listeners. */
  destroy(): void;
}

/** One measure of a derived grid's group, roll-up or top-N step. */
export interface DesignerDerivedMeasure {
  /** The output column id; derived from `of` and `fn` when omitted. */
  id?: string;
  /** The column to reduce; omitted for a count. */
  of?: string;
  /** The aggregation: `sum`, `avg`, `min`, `max`, `count`, `countDistinct`, `median`, `p95`, `stddev`, `first` or `last`. */
  fn?: string;
}

/** A filter step: conditions compiled to the grid's own filter state, applied before grouping. */
export interface DesignerDerivedFilterStep {
  /** The step kind. */
  kind: 'filter';
  /** The filter condition tree: a single `{ col, op, value }`, or `{ op: 'and' | 'or', conditions }`. */
  where: FilterSet;
}

/** A group-and-roll-up step: group-by fields, each with its measures. */
export interface DesignerDerivedGroupStep {
  /** The step kind. */
  kind: 'group';
  /** The group-by field, or fields (outermost first). */
  by: string | string[];
  /** The measures rolled up within each group. */
  measures?: DesignerDerivedMeasure[];
}

/** A pivot step: the row fields, a column field and a measure. */
export interface DesignerDerivedPivotStep {
  /** The step kind. */
  kind: 'pivot';
  /** The row group field, or fields. */
  rows: string | string[];
  /** The field whose distinct values become the pivot columns. */
  column: string;
  /** The measure at each row/column cell. */
  measure?: DesignerDerivedMeasure;
  /** Several measures at each cell, when more than one. */
  measures?: DesignerDerivedMeasure[];
}

/** A join step: a related source by a declared relationship, choosing fields. */
export interface DesignerDerivedJoinStep {
  /** The step kind. */
  kind: 'join';
  /** The related source id. */
  to: string;
  /** The join keys; taken from the declared relationship when omitted. */
  on?: { left: string; right: string };
  /** The relationship's cardinality; `many-to-one` by default. A `one-to-many` join collects into a list column. */
  cardinality?: 'many-to-one' | 'one-to-one' | 'one-to-many';
  /** The related fields to bring across (all by default). */
  fields?: string[];
  /** The list column a `one-to-many` collect gathers into; the related source id by default. */
  as?: string;
}

/** A sort step: order the derived rows. */
export interface DesignerDerivedSortStep {
  /** The step kind. */
  kind: 'sort';
  /** The sort keys, applied in order. */
  by: Array<{ col: string; dir?: 'asc' | 'desc' }>;
}

/** A top-N step: the best rows by a measure, limited. */
export interface DesignerDerivedTopNStep {
  /** The step kind. */
  kind: 'topN';
  /** Keep at most this many rows. */
  limit: number;
  /** When ranking aggregated groups, the group-by field(s). */
  by?: string | string[];
  /** The measures the ranking aggregates. */
  measures?: DesignerDerivedMeasure[];
  /** How to order before limiting. */
  sort?: Array<{ col: string; dir?: 'asc' | 'desc' }>;
  /** Apply the limit within each distinct value of this column. */
  per?: string;
}

/** One step of a derived grid's ordered step list. */
export type DesignerDerivedStep =
  | DesignerDerivedFilterStep
  | DesignerDerivedGroupStep
  | DesignerDerivedPivotStep
  | DesignerDerivedJoinStep
  | DesignerDerivedSortStep
  | DesignerDerivedTopNStep;

/** The specification of a derived grid to add (the `addDerivedGrid` command's argument). */
export interface DesignerDerivedSpec {
  /** The parent source or panel id the grid is built from. */
  from: string;
  /** The new panel's id; derived from `from` when omitted. */
  id?: string;
  /** The widget title. */
  title?: string;
  /** The parent's display label, for the lineage sentence. */
  fromLabel?: string;
  /** The initial steps. */
  steps?: DesignerDerivedStep[];
  /** Whether the grid is hidden (a source other widgets read, not shown). */
  hidden?: boolean;
}

/** Which steps of a derived grid a pushdown parent answered. */
export interface DesignerDerivedProvenance {
  /** The pushdown adapter's name (`adapter.name`), or null when the parent is in memory. */
  engine: string | null;
  /** The steps the adapter pushed down. */
  pushed: string[];
  /** The steps computed client-side. */
  client: string[];
}

/** Derived grids. */
export interface DesignerDerived {
  /** Compile a step list to a panel's `source` and `options`, without committing. */
  compile(steps: DesignerDerivedStep[], context: { fromId: string; fromLabel?: string; columns?: Array<{ id?: string; field?: string; type?: string }>; relationships?: DesignerRelationship[] }): {
    source: string | undefined;
    options: Record<string, unknown>;
    collect: Record<string, unknown> | null;
    lineage: { from: string; related: string[] };
    refusals: Array<{ index: number; name: string; reason: string }>;
  };
  /** The steps of a derived grid, or null when there is no such derived grid. */
  steps(id: string): DesignerDerivedStep[] | null;
  /** The lineage sentence for a derived grid (`"Top reps ← Orders"`), or null. */
  lineage(id: string): string | null;
  /** Which steps of a derived grid a pushdown parent answered, read from the built grid's `lastPlan()`. */
  provenance(id: string): DesignerDerivedProvenance;
  /** Which steps of a derived grid cannot run, by name and index: a pushdown engine's refusal (group/pivot), or a join with no declared relationship and no explicit `on`. */
  refusals(id: string): Array<{ index: number; name: string; reason: string }>;
}

/**
 * The payload handed to {@link DesignerLlm}: what the model may see. `schema`
 * carries the chosen source's columns and the panel kinds the page can draw,
 * plus the designer's allowed sources, their fields, the relationships, the
 * current page's spec and the guardrails. No rows unless `sendSampleRows`.
 */
export interface DesignerProposalRequest {
  /** The standing instruction the model is given. */
  system: string;
  /** The prompt and the SCHEMA (and ROWS, when opted in) as one message. */
  message: string;
  /** The system instruction followed by `message`. */
  prompt: string;
  /** The same content as `system` and `message`, as a chat transcript. */
  messages: Array<{ role: string; content: string }>;
  /** `{ source, columns, kinds, sources, fields, relationships, page, guardrails }`. */
  schema: Record<string, unknown>;
  /** A bounded sample of the chosen source's rows; only when `sendSampleRows` opted in. */
  rows?: object[];
  /** An abort signal a host may pass through. */
  signal?: AbortSignal;
}

/**
 * The host's model callback for the AI assistant. A function
 * is `ask` itself; an object wraps `ask` and may opt into sending a bounded
 * sample of the chosen source's rows with `sendSampleRows`.
 */
export type DesignerLlm =
  | ((request: DesignerProposalRequest) => Promise<unknown> | unknown)
  | {
      /** The callback the designer asks, exactly as `createAI`'s `ask()`. */
      ask: (request: DesignerProposalRequest) => Promise<unknown> | unknown;
      /** The most rows of the chosen source to send with the request; none by default. */
      sendSampleRows?: number;
    };

/** The change a proposal makes to the current page, by panel id. */
export interface DesignerAssistDiff {
  /** Panels the proposal adds. */
  added: string[];
  /** Panels the proposal keeps but changes. */
  changed: string[];
  /** Panels the proposal removes. */
  removed: string[];
}

/**
 * What `assist.propose(prompt)` resolves to: the checked proposal and
 * everything refused, by name. `ok` is true only when a preview is showing
 * and `accept()` can apply it.
 */
export interface DesignerAssistResult {
  /** Whether a preview is showing (and `accept()` would apply it). */
  ok: boolean;
  /** The checked proposal (`panels`, and `layout`/`links` when the model sent them); null when not `ok`. */
  spec: DashboardSpec | null;
  /** Every part refused or reported, by name and reason. */
  warnings: string[];
  /** What the proposal changes, by panel id; empty when not `ok`. */
  diff: DesignerAssistDiff;
}

/**
 * The AI assistant: an assist box in the left rail that
 * asks the host's model for a page, checks the reply against the spec schema
 * and the guardrails, and shows what survives as a highlighted preview on the
 * canvas for the author to accept (one undo step) or reject. Mounted on
 * `designer.assist`.
 */
export interface DesignerAssist {
  /** The assist box's element, in the left rail's `assist` section. */
  readonly el: HTMLElement;
  /**
   * Ask the model for a page and show what survives as a preview. Never
   * throws: a reply that is not a proposal, or a part the checks or
   * guardrails refuse, is a warning in the result. No rows are sent unless
   * `llm.sendSampleRows` is set.
   */
  propose(prompt: string): Promise<DesignerAssistResult>;
  /** Apply the pending proposal as one undoable state change and clear the preview. False when there is no pending proposal. */
  accept(): boolean;
  /** Clear the pending preview without applying it. */
  reject(): void;
  /** The pending proposal, or null when none is showing. */
  readonly pending: DesignerAssistResult | null;
  /** Tear down the assist box, the preview and their listeners. */
  destroy(): void;
}

/** The options of {@link createDesigner}. */
export interface DesignerOptions {
  /** The mode it opens in; `'view'` by default. */
  mode?: DesignerMode;
  /** The state it opens with (or a plain dashboard spec, migrated on load); one empty page by default. */
  state?: Partial<DesignerState> | DashboardSpec;
  /** How many undo steps to keep; `100` by default. */
  historyDepth?: number;
  /**
   * Keep every page built after it is left, so switching back to it does not
   * rebuild it. By default a page is built when selected
   * and disposed when left, so only the selected page's widgets are alive.
   */
  keepPagesAlive?: boolean;
  /**
   * The named sources every page's panels may read, by id: the host's live
   * data, so not state. `fields` declares each source's fields; absent that, the data panel infers them from the
   * source's own rows/columns or adapter schema.
   */
  sources?: Record<string, DashboardSource & { fields?: DesignerSourceField[] }>;
  /** The relationships between sources' fields, which the data panel compiles to data-router join edges. */
  relationships?: DesignerRelationship[];
  /** The guardrails limiting what an author may use; the data panel hides the sources and fields they do not allow. Also live on {@link Designer.guardrails}. */
  guardrails?: DesignerGuardrails;
  /**
   * How long, in milliseconds, the engine questions of a pushdown source are
   * held after the last edit; `150` by default. A burst of
   * edits, each its own commit, asks the engine once, for the final state.
   */
  pushdownDebounceMs?: number;
  /**
   * The factories, exactly as `createDashboard`'s third argument takes them,
   * plus the charts module's `chartEditorModel` and `registeredChartTypes`,
   * which the properties panel generates chart editors from (else found on
   * the `LatticeGrid` global, else the built-in types only).
   */
  factories?: DashboardOptions & {
    /** The charts module's editor model, so the panel reads the host's chart registry. */
    chartEditorModel?: (type: string) => ChartEditorModel;
    /** The charts module's registered extension types, offered in the type switch. */
    registeredChartTypes?: () => string[];
  };
  /** The host's model callback for the AI assistant: the same `ask()` `createAI` takes, or `{ ask, sendSampleRows }` to opt into sending a bounded sample of rows. Kept on `context`. */
  llm?: DesignerLlm;
  /** A message catalogue (`{ t }`, e.g. `grid.messages`); the designer's own English is used for a key it does not know. */
  messages?: { t(key: string, params?: Record<string, unknown>): string };
  /** The theme written to the designer root's `data-theme`: `'light'`, `'dark'`, `'auto'` (follows the system live), `'high-contrast'` or any theme the host styles. Unset follows the page. */
  theme?: string;
}

/** One key in the designer's documented shortcut map. */
export interface DesignerShortcut {
  /** A stable id; registering the same id replaces the entry. */
  id: string;
  /** The key combination as documented, e.g. `'Alt+Shift+M'` (a letter is read from `event.code`, so Option on a Mac does not change it). */
  keys: string;
  /** What it does, as the shortcuts dialog shows it. */
  description: string;
  /** What it runs; an entry without one only documents a key another module already handles. */
  run?: (event: KeyboardEvent) => void;
}

/** The designer's documented keyboard shortcut map. */
export interface DesignerShortcuts {
  /** Add a key to the map; a malformed entry is refused by name. Returns a function that removes it. */
  register(entry: DesignerShortcut): () => void;
  /** The documented map, in registration order. */
  list(): Array<Pick<DesignerShortcut, 'id' | 'keys' | 'description'>>;
}

/** The focus regions F6 and Shift+F6 cycle. */
export interface DesignerRegions {
  /** Put a panel in the focus order (`order`: toolbar 0, palette 10, canvas 20, properties 30, data 40, filters 50). Returns a function that removes it. */
  register(name: string, el: HTMLElement, options?: { order?: number; label?: string }): () => void;
  /** The region names in focus order, whether or not they are showing. */
  list(): string[];
  /** Move focus into a region and say which; false when it is unknown, hidden or has nothing to focus. */
  focus(name: string): boolean;
}

/** One rail of the editing screen: the left (palette and data) or the right (properties). */
export interface DesignerRail {
  /** Whether the rail is collapsed to its 48 px strip (or, as an overlay drawer, closed). */
  readonly collapsed: boolean;
  /** The rail's element. */
  readonly el: HTMLElement;
  /** Collapse the rail. */
  collapse(): boolean;
  /** Expand the rail. */
  expand(): boolean;
  /** Collapse an expanded rail, or expand a collapsed one. */
  toggle(): boolean;
  /** The element a panel mounts in: for the left rail the body of the section `name` (`'palette'`, `'data'`, or a new one a card adds); the right rail has one body and ignores the name. */
  slot(name?: string): HTMLElement;
}

/** One thing the palette can add: a widget kind, a filter, or a chart type. */
export interface DesignerPaletteEntry {
  /** `kind:type`, such as `chart:bar`, `grid:grid` or `filter:range`. */
  id: string;
  /** `grid`, `chart`, `map`, `kpi`, `filter` or `text`. */
  kind: 'grid' | 'chart' | 'map' | 'kpi' | 'filter' | 'text';
  /** The chart type (`bar`), the filter type (`dateRange`), or the kind again. */
  type: string;
  /** The name shown, such as `Horizontal bar`. */
  label: string;
  /** `widgets`, `filters`, or a chart family: `comparison`, `trend`, `composition`, `distribution`, `flow`, `hierarchy`, `geo`, `specialist` or `statistics`. */
  family: string;
  /** Why the chosen source cannot fill it (`needs a date field`), or null when it can be added. */
  disabled: string | null;
}

/** The widget palette, in the left rail's `palette` section. */
export interface DesignerPalette {
  /** The palette's element, in the left rail. */
  readonly el: HTMLElement;
  /** Whether the palette, and with it the left rail, is collapsed to its 48 px icon strip. */
  readonly collapsed: boolean;
  /** Every entry the guardrails allow: the widgets, the filters, and each chart type from the base list and the registry, read at call time. */
  entries(): DesignerPaletteEntry[];
  /** Add a widget as a click on its entry does: the `paletteAdd` command. Returns the new id, or null when it is disabled, hidden or over the page's widget limit. */
  add(kind: 'grid' | 'chart' | 'map' | 'kpi' | 'filter' | 'text', type?: string): string | null;
  /** Narrow the entries by free text, as the search box does. */
  setQuery(text: string): void;
  /** Read the registry, the guardrails and the sources again. */
  refresh(): void;
  /** Collapse to the icon strip. */
  collapse(): boolean;
  /** Expand from the icon strip. */
  expand(): boolean;
  /** Collapse an expanded palette, or expand a collapsed one. */
  toggle(): boolean;
  /** Remove the palette from the DOM. */
  destroy(): void;
}

/** The editing screen's rails. */
export interface DesignerRails {
  /** The left rail, about 260 px, a 48 px icon strip when collapsed: a `palette` and a `data` section, each scrolling inside itself. */
  readonly left: DesignerRail;
  /** The right rail, about 300 px: the properties panel, shown while a widget is selected. */
  readonly right: DesignerRail;
  /** `'wide'` (1100 px and up: both rails inline), `'narrow'` (900 to 1099 px: the right rail is an overlay drawer) or `'compact'` (below 900 px: both are). */
  readonly layout: 'wide' | 'narrow' | 'compact';
  /** The filter bar's element: a row above the canvas, visible and interactive in edit and view mode alike, unlike the rest of the editing screen. */
  readonly filterBar: HTMLElement;
}

/** One problem the chrome audit found. */
export interface DesignerAuditProblem {
  /** The rule: `name`, `dialog`, `tab`, `roving`, `id` or `live`. */
  rule: string;
  /** A short description of the element at fault. */
  element: string;
  /** What is wrong. */
  message: string;
}

/** The report {@link Designer.migrate} returns: what a migration did, or refused to do. */
export interface DesignerMigrationReport {
  /** False only when the state was from a newer version and was refused. */
  ok: boolean;
  /** `'newer'` when the state was refused for that reason; otherwise `null`. */
  reason: 'newer' | null;
  /** The schema version this designer writes. */
  schemaVersion: number;
  /** The version the state claimed before migration (`0` when it had none). */
  from: number;
  /** The version it now has — `schemaVersion`. */
  to: number;
  /** Whether any migration changed the state. */
  applied: boolean;
  /** What each applied migration did, in order. */
  changes: string[];
  /** The migrated state (a copy), or `null` when it was refused. */
  state: DesignerState | null;
}

/** The options of {@link Designer.migrate}. */
export interface DesignerMigrateOptions {
  /** Report the migration without applying it to the designer. */
  dryRun?: boolean;
}

/** One spec problem on one page. */
export interface DesignerProblem {
  /** The page's id. */
  page: string | undefined;
  /** Where in the page's spec, e.g. `panels[2].kind`. */
  path: string;
  /** What is wrong there. */
  message: string;
}

/** What a `state` event carries. */
export interface DesignerStateEvent {
  /** A copy of the new state. */
  state: DesignerState;
  /** What changed it: `setState`, `selectPage`, `move`, `resize`, `removeWidget`, `addWidget`, `undo`, `redo`, or a command's own cause. */
  cause: string;
  /** The event name. */
  type: 'state';
}

/** What a `select` event carries. */
export interface DesignerSelectEvent {
  /** The widget now selected, or null when the selection was cleared. */
  id: string | null;
  /** The selected widget's panel, or null. */
  panel: DashboardPanel | null;
  /** The event name. */
  type: 'select';
}

/** What a `page` event carries: a page became selected. */
export interface DesignerPageEvent {
  /** The page now selected, or null when there are no pages. */
  page: { id: string; title: string | undefined } | null;
  /** The selected page's id, or null when there are no pages. */
  id: string | null;
  /** The previously selected page's id, or null. */
  previousId: string | null;
  /** The event name. */
  type: 'page';
}

/** What a command is handed. */
export interface DesignerCommandContext {
  /** The designer. */
  designer: Designer;
  /** A copy of the state. */
  getState(): DesignerState;
  /** Replace the state: the one path to a `state` event. Returns whether it changed. A `coalesce` token merges consecutive commits sharing it (a drag or slider scrub) into one undo step. */
  commit(state: DesignerState, cause: string, options?: { coalesce?: unknown }): boolean;
}

/** The command registry: the extension point the palette, properties and undo cards build on. */
export interface DesignerCommands {
  /** Register a command, replacing one of the same name; returns its unregister. */
  register(name: string, run: (ctx: DesignerCommandContext, ...args: any[]) => unknown): () => void;
  /** Run a command by name; undefined when there is none. */
  run(name: string, ...args: unknown[]): unknown;
  /** Whether a command is registered. */
  has(name: string): boolean;
  /** The registered command names. */
  list(): string[];
}

/**
 * The guardrails handle on {@link Designer.guardrails}: the normalised value
 * plus the predicates every panel reads to hide (not disable) a restricted
 * choice, and the canvas reads to lock a panel already in the state.
 */
export interface DesignerGuardrailsHandle {
  /** The guardrails, normalised and frozen. */
  readonly value: Readonly<{
    sources: string[] | null;
    fields: Readonly<Record<string, Readonly<{ allow: string[] | null; deny: string[] | null }>>> | null;
    widgets: string[] | null;
    chartTypes: string[] | null;
    formatting: Readonly<{ level: 'full' | 'basic' | 'none' | null; options: string[] | null }>;
    pages: Readonly<{ add: boolean; remove: boolean; rename: boolean; reorder: boolean }>;
    calculatedFields: boolean;
    derivedGrids: boolean;
    ai: boolean;
    maxWidgetsPerPage: number | null;
  }>;
  /** Whether the source id is allowed. */
  allowsSource(id: string): boolean;
  /** Whether a field of a source is allowed. */
  allowsField(source: string, field: string): boolean;
  /** Whether a panel kind is allowed. */
  allowsWidget(kind: string): boolean;
  /** Whether a chart type is allowed. */
  allowsChartType(type: string): boolean;
  /** Whether a formatting option is allowed. */
  allowsFormatting(option: string): boolean;
  /** Whether a page operation (`add`, `remove`, `rename`, `reorder`) is allowed. */
  allowsPage(action: string): boolean;
  /** Whether calculated fields are allowed. */
  allowsCalculatedFields(): boolean;
  /** Whether derived grids are allowed. */
  allowsDerivedGrids(): boolean;
  /** Whether the AI assistant is allowed. */
  allowsAi(): boolean;
  /** The most widgets a page may hold, or null for no limit. */
  widgetLimit(): number | null;
  /** The name of the guardrail that refuses `kind`, or null. */
  refuse(kind: string, ...args: unknown[]): string | null;
  /** The name of the guardrail a panel already in the state violates, or null. */
  restrictPanel(panel: unknown): string | null;
}

/**
 * The properties panel: the editor for the selected widget,
 * generated from capability metadata. Its controls commit through the
 * designer's one commit path, so each edit is a single `state` event and undo
 * wraps it; an invalid value is committed and refused inline by the viewer's
 * own message, not blocked at the control.
 */
export interface DesignerProperties {
  /** The panel's root element, mounted in the chrome. */
  readonly el: HTMLElement;
  /** The selected widget's id, or null. */
  selectedPanelId(): string | null;
  /** Select a widget to edit; false when there is no such widget. */
  selectPanel(id: string): boolean;
  /** Set the selected widget's title. Returns whether the state changed. */
  setTitle(value: string): boolean;
  /** Set the selected widget's source. Returns whether the state changed. */
  setSource(value: string): boolean;
  /**
   * Set a formatting option. The selected widget's own descriptor for `name`
   * types the value and knows its default (a default is stored as unset);
   * `type` is used only when the widget has no such option.
   */
  setOption(name: string, type: 'string' | 'boolean' | 'number' | 'enum' | 'list', value: unknown): boolean;
  /** Set one option of one entry of a repeatable role, such as a grid column's `layout.width`. */
  setEntryOption(role: ChartRole, index: number, name: string, value: unknown): boolean;
  /** Move one entry of an orderable role earlier (`-1`) or later (`+1`), such as a grid column. */
  moveEntry(role: ChartRole, index: number, delta: number): boolean;
  /** Bind (or clear, with `''`) a field to a role, carrying its aggregation. */
  editRole(role: ChartRole, index: number, col: string, fn: string): boolean;
  /** The fields the selected widget's source offers: the field list a role is dragged from. */
  fields(): string[];
  /** Switch a chart or map type, keeping compatible roles and reporting the dropped ones. */
  switchType(type: string): { type: string; dropped: string[] };
  /** What the last type switch kept and dropped, or null. */
  readonly lastSwitch: { type: string; dropped: string[] } | null;
  /** Rebuild the panel body for the current selection. */
  refresh(): void;
  /** Remove the panel and its subscriptions. */
  destroy(): void;
}

/**
 * Filters and cross-filtering: the filter bar
 * (`designer.rails.filterBar`), its global and page filters, the filter
 * widgets the palette adds, the filter-context chips and the clear-all
 * button, and a widget's cross-filter targets. Every grid-backed widget
 * reading a filter's source follows it — the viewer contract — and a
 * cross-filter setting compiles to the page's `links`.
 */
export interface DesignerFilters {
  /** The filter bar's element, in `designer.rails.filterBar`. */
  readonly el: HTMLElement;
  /** Every filter active on the current page — global ones first, each tagged `{ scope: 'global' | 'page' }` — with its live value. */
  active(): Array<DesignerFilter & { scope: 'global' | 'page' }>;
  /** Add a filter (`scope` is `'page'` by default), with one undoable commit. Returns its id, or null when refused. */
  addFilter(options: { scope?: 'page' | 'global'; type: DesignerFilter['type']; source: string; field: string }): string | null;
  /** Remove a filter by id, from whichever list holds it, with one undoable commit. */
  removeFilter(id: string): boolean;
  /** Set a filter's value (shaped by its type); `undefined` clears it alone. Guardrail-free in view mode — only the filter *set* is edit-mode-only. */
  setValue(id: string, value: unknown): boolean;
  /** Clear every active filter's value, keeping the filters themselves (the clear-all button). */
  clearAll(): boolean;
  /** Set (or clear, with `null`) a widget's cross-filter targets, recompiling the page's `links` from every widget's current setting. */
  setClickFilter(panelId: string, next: DesignerClickFilter | null): boolean;
  /** Redraw the bar and re-apply every active filter to the current page's grids. */
  refresh(): void;
  /** Unsubscribe from designer events; the element is removed with the designer root. */
  destroy(): void;
}

/** One calculated field: an expression column added to a source. */
export interface CalculatedField {
  /** The field's id: its column id, and the name other expressions and widgets use. */
  id: string;
  /** The heading shown for it; the id when absent. */
  label?: string;
  /** The expression, in the formula language, without a leading `=`. */
  expression: string;
}

/** One thing wrong with an expression, named by token and position. */
export interface CalculatedError {
  /** The message, such as `unknown field "revnue" at 9`. */
  message: string;
  /** The zero-based offset of the token in the expression as typed. */
  at: number;
  /** The offending token's text. */
  token: string;
  /** The nearest known field or function name, when one is close enough to be meant. */
  suggestion?: string;
}

/** The outcome of adding, changing or checking a calculated field. */
export interface CalculatedResult {
  /** Whether the expression checks and compiles. */
  ok: boolean;
  /** The inferred result type: `'number'`, `'text'`, `'boolean'`, `'date'` or `'datetime'`. */
  type?: string;
  /** Where it is computed: `'browser'` row by row, or `'pushdown'` by the source's adapter. */
  via?: 'browser' | 'pushdown';
  /** For a pushed expression, what the adapter reports about the translation. */
  provenance?: string;
  /** What is wrong with the expression, when it does not check. */
  errors?: CalculatedError[];
  /** Why the source cannot take it, when the expression is fine but the source refuses it. */
  refused?: string;
}

/** One autocomplete choice. */
export interface CalculatedSuggestion {
  /** The text shown. */
  label: string;
  /** The text inserted: a function name includes its opening parenthesis. */
  insert: string;
  /** A field of the source, a field reached through a relationship (`source.field`), or a function. */
  kind: 'field' | 'related' | 'function';
  /** The field's type, or a function's result type. */
  type?: string;
  /** A function's family: arithmetic, condition, null, date or text. */
  family?: string;
  /** A function's one-line description. */
  doc?: string;
}

/**
 * Calculated fields: expression columns an author adds to a
 * source, kept in the designer state under `panels.calculated[sourceId]` and
 * compiled to the grid's computed-column engine (sandboxed; never `eval`).
 * Every change commits once, so it is one `state` event and one undo step.
 */
export interface DesignerCalculated {
  /** The editor's root element, mounted in the chrome. */
  readonly el: HTMLElement;
  /** The calculated fields of every source, keyed by source id. */
  list(): Record<string, CalculatedField[]>;
  /** The calculated fields of one source, in the order they were added. */
  list(source: string): CalculatedField[];
  /** Add a field. Refused, changing nothing, with its errors when it does not check or the source cannot take it. */
  add(source: string, field: CalculatedField): CalculatedResult;
  /** Change a field's expression or label. */
  update(source: string, id: string, patch: { label?: string; expression?: string }): CalculatedResult;
  /** Remove a field; false when there is no such field. */
  remove(source: string, id: string): boolean;
  /** Check an expression against a source without storing it: its type, or its errors by token and position. */
  analyse(source: string, expression: string): CalculatedResult;
  /** The live preview: the result type and the first five rows' values (or per-row errors). */
  preview(source: string, expression: string): CalculatedResult & { rows: Array<{ value: unknown; error?: string }> };
  /** Autocomplete at a caret (default: the end): the range to replace and the choices. */
  suggest(source: string, text: string, caret?: number): { from: number; to: number; items: CalculatedSuggestion[] };
  /** How a stored field compiled (in the browser, pushed, or refused and why), or null when there is none. */
  status(source: string, id: string): CalculatedResult | null;
  /** Choose the source the editor adds to. */
  setSource(id: string): void;
  /** Set the editor's expression text, and optionally its field name. */
  setExpression(text: string, id?: string): void;
  /** Load a stored field into the editor for changing. False when there is no such field. */
  edit(source: string, id: string): boolean;
  /** Insert an autocomplete choice at the caret. */
  accept(item: CalculatedSuggestion): void;
  /** Commit the editor's draft as an add (or a save of the field being edited). */
  submit(): CalculatedResult;
  /** Redraw the editor. */
  refresh(): void;
  /** Remove the editor and restore the host's sources as they were. */
  destroy(): void;
}

/** A designer. */
export interface Designer {
  /** The element it is mounted on. */
  readonly el: HTMLElement;
  /** The current mode. */
  readonly mode: DesignerMode;
  /** The chrome region, shown in edit mode: a `display: contents` wrapper of the top bar (toolbar, page tabs, undo and redo) and the two rails. */
  readonly chrome: HTMLElement;
  /** The editing screen's rails: the left holds the palette and data sections, the right the properties panel. */
  readonly rails: DesignerRails;
  /** The widget palette: every widget, filter and chart type, added by click, drag or keyboard with a default configuration. */
  readonly palette: DesignerPalette;
  /** The labelled canvas region the selected page is built in. */
  readonly canvas: HTMLElement;
  /** The dashboard on the canvas, or null. */
  readonly dashboard: Dashboard | null;
  /** The command registry. */
  readonly commands: DesignerCommands;
  /** The data panel: the host's sources, fields, types and relationships. */
  readonly dataPanel: DesignerDataPanel;
  /** The properties panel: the generated editor for the selected widget. */
  readonly properties: DesignerProperties;
  /** The calculated-fields editor: expression columns with live preview and errors by name. */
  readonly calculated: DesignerCalculated;
  /** Config routing: route dashboard config to this designer through a Data Router, the way rows are routed to a grid. */
  readonly configRouter: DesignerConfigRouter;
  /** Derived grids: build a grid from another with a step list, chart or analyse it like any source. */
  readonly derived: DesignerDerived;
  /** Data routes from config: a route per widget, compiled from its own config row and re-planned only when that row changes. */
  readonly dataRoutes: DesignerDataRoutes;
  /** The AI assistant: propose a page, preview the checked result, and accept (one undo step) or reject it. */
  readonly assist: DesignerAssist;
  /** The sources, relationships, guardrails and llm it was given. */
  readonly context: Readonly<{
    sources: Record<string, DashboardSource & { fields?: DesignerSourceField[] }>;
    relationships: DesignerRelationship[] | undefined;
    guardrails: DesignerGuardrails | undefined;
    llm: DesignerLlm | undefined;
  }>;
  /** The live guardrails handle: the normalised value plus the `allows*` predicates. */
  readonly guardrails: DesignerGuardrailsHandle;
  /** The documented keyboard shortcut map. */
  readonly shortcuts: DesignerShortcuts;
  /** The focus regions F6 cycles. */
  readonly regions: DesignerRegions;
  /** The theme name on the designer root, or null when it follows the page. */
  readonly theme: string | null;
  /** Set the theme live (`'light'`, `'dark'`, `'auto'`, `'high-contrast'`, or null to follow the page); a name that is not a string is refused and the theme kept. Returns the theme now in force. */
  setTheme(name: string | null): string | null;
  /** Say a message in the polite live region; the same text twice is still said. */
  announce(message: string): void;
  /** Check the chrome against the designer's accessibility rules (names, roles, one tab stop per roving group, unique ids, the live region); an empty list passes. */
  audit(): DesignerAuditProblem[];
  /** A copy of the state. */
  getState(): DesignerState;
  /** Replace the state, migrating an older one first; an equal state changes nothing and sends no event. Returns whether it changed. Clears the undo history unless `options.keepHistory` is set. */
  setState(state: Partial<DesignerState> | DashboardSpec, options?: { keepHistory?: boolean }): boolean;
  /** Migrate a state to this version and report what changed; with `dryRun`, report without applying. A newer state is refused. */
  migrate(state: Partial<DesignerState> | DashboardSpec, options?: DesignerMigrateOptions): DesignerMigrationReport;
  /** Replace the guardrails at run time and rebuild the canvas; a non-object is refused. Returns whether they now apply. */
  setGuardrails(guardrails: DesignerGuardrails | undefined): boolean;
  /** Switch mode, rebuilding the canvas and announcing it; returns the mode in force. */
  setMode(mode: DesignerMode): DesignerMode;
  /** The pages' ids and titles, in order. */
  pages(): Array<{ id: string; title: string | undefined }>;
  /** Select a page and build it on the canvas; false when there is no such page. */
  selectPage(id: string): boolean;
  /**
   * Add a page — blank by default, or a copy of the page `options.duplicate`
   * names — and select it, with one undoable state change.
   * Refused by name when `guardrails.pages.add` is false. Returns the new
   * page's id, or null when it could not be added.
   */
  addPage(options?: { id?: string; title?: string; duplicate?: string }): string | null;
  /**
   * Rename a page with one undoable state change. Refused
   * by name when `guardrails.pages.rename` is false. An empty title is
   * refused.
   */
  renamePage(id: string, title: string): boolean;
  /**
   * Move a page earlier (`delta` negative) or later (`delta` positive) by
   * positions, clamped to the ends, with one undoable state change. Refused by name when `guardrails.pages.reorder` is
   * false.
   */
  movePage(id: string, delta: number): boolean;
  /**
   * Remove a page with one undoable state change. Removing
   * the selected page selects its neighbour. Refused by name when
   * `guardrails.pages.remove` is false.
   */
  removePage(id: string): boolean;
  /** Undo the most recent committed change, restoring the exact previous state and firing `state` with cause `undo`. */
  undo(): boolean;
  /** Redo the most recently undone change, firing `state` with cause `redo`. */
  redo(): boolean;
  /** Whether `undo()` would change the state. */
  canUndo(): boolean;
  /** Whether `redo()` would change the state. */
  canRedo(): boolean;
  /**
   * Select a widget on the canvas by id, or clear the selection with `null`.
   * The selected widget is ringed, focused and given the accessible name
   * `'Chart: Revenue by region, selected'`, and a `select` event fires. Returns
   * the id now selected, or null — including in view mode, where there is no
   * canvas to select on.
   */
  selectWidget(id: string | null): string | null;
  /** The selected widget and its panel, or null — what the properties panel binds to. */
  selectedWidget(): { id: string; panel: DashboardPanel | null } | null;
  /** Remove a widget — its panel and its window — with one undoable state change. False when there is no such widget. */
  removeWidget(id: string): boolean;
  /** Add a widget — a panel, and its window when a placement is given — with one undoable state change. False when the panel is invalid or a duplicate. */
  addWidget(panel: DashboardPanel, placement?: Partial<LayoutPlacement>): boolean;
  /** Read a property by name; undefined for a name that is not one. */
  getProperty(name: 'mode'): DesignerMode;
  /** The current state (as `getState()`). */
  getProperty(name: 'state'): DesignerState;
  /** The selected page's id, or null when there are no pages. */
  getProperty(name: 'selectedPageId'): string | null;
  /** The guardrails, normalised. */
  getProperty(name: 'guardrails'): DesignerGuardrails;
  /** Any other property by name; undefined for a name that is not one. */
  getProperty(name: string): unknown;
  /** Write a property by name, live (`setProperty('mode', 'view')` is `setMode('view')`); whether it now has that value. */
  setProperty(name: 'mode', value: DesignerMode): boolean;
  /** Replace the state (as `setState()`); whether it was accepted. */
  setProperty(name: 'state', value: Partial<DesignerState> | DashboardSpec): boolean;
  /** Select a page by id (as `selectPage()`); false when there is no such page. */
  setProperty(name: 'selectedPageId', value: string): boolean;
  /** Replace the guardrails (as `setGuardrails()`); whether they now apply. */
  setProperty(name: 'guardrails', value: DesignerGuardrails | undefined): boolean;
  /** Any other property by name; false for a name that is not one. */
  setProperty(name: string, value: unknown): boolean;
  /** Every page's spec problems. Never throws. */
  problems(): DesignerProblem[];
  /** Every state change, once each. */
  on(name: 'state', fn: (event: DesignerStateEvent) => void): () => void;
  /** A mode change. */
  on(name: 'mode', fn: (event: { mode: DesignerMode; type: 'mode' }) => void): () => void;
  /** A canvas selection change. */
  on(name: 'select', fn: (event: DesignerSelectEvent) => void): () => void;
  /** A page became selected. */
  on(name: 'page', fn: (event: DesignerPageEvent) => void): () => void;
  /** The same as `on('state', fn)`. */
  onStateUpdated(fn: (event: DesignerStateEvent) => void): () => void;
  /** Tear down the canvas and the designer's elements. */
  destroy(): void;
  /** The statistics widgets: column profile, distribution, correlation, group comparison, forecast and model error. */
  readonly statisticsWidgets: DesignerStatisticsWidgets;
  /** Filters and cross-filtering: the filter bar, global and page filters, and a widget's cross-filter targets. */
  readonly filters: DesignerFilters;
  /** Designing over pushdown sources: schema fields, provenance, refusals and the debounce. */
  readonly pushdown: DesignerPushdown;
}

/** One field of a pushdown source, read from its adapter's schema or `describe()`. */
export interface DesignerPushdownField {
  /** The column name. */
  id: string;
  /** A readable heading derived from the name. */
  label: string;
  /** The data panel's field type, mapped from the engine's type. */
  type: 'number' | 'currency' | 'percent' | 'date' | 'datetime' | 'boolean' | 'text' | 'list' | 'geometry';
  /** The engine's own type name (`BIGINT`, `Nullable(UInt64)`, `keyword`, `Edm.Int32`, …), when it reported one. */
  engineType?: string;
  /** Always `false`: read from the adapter, not declared by the host. */
  declared: false;
}

/** What a pushdown source's adapter cannot do, named, with the reason. */
export interface DesignerPushdownRefusal {
  /** Whether a derived step or an aggregation is refused. */
  kind: 'step' | 'aggregation';
  /** The step (`filter`, `sort`, `group`, `pivot`, `total`) or aggregation (`median`, …). */
  name: string;
  /** Why, naming the adapter. */
  reason: string;
}

/** Where a widget's figures were computed, as its info tooltip says. */
export interface DesignerPushdownProvenance {
  /** `'engine'`, `'client'` (with a `reason`), or `'pending'` while the engine is asked. */
  computed: 'engine' | 'client' | 'pending';
  /** Why the client computed it, when it did. */
  reason: string | null;
  /** Per-measure provenance, where the widget reports it. */
  measures: Array<Record<string, unknown>>;
  /** The pushdown source the widget reads. */
  source: string;
  /** The sentence the info badge shows as its tooltip. */
  text: string;
}

/**
 * Designing over `kind: 'pushdown'` sources. Fields come
 * from the adapter, never from a sampled page; widgets compute in the engine
 * and show where; what the adapter cannot do is refused by name; and edits
 * stay interactive because the engine is asked once for a burst.
 */
export interface DesignerPushdown {
  /** The fields of a pushdown source from its adapter's `describe()`/schema, or null until it has answered (or when the id is not a pushdown source). */
  fields(sourceId: string): DesignerPushdownField[] | null;
  /** Resolves with a pushdown source's fields once its adapter has described them. */
  describe(sourceId: string): Promise<DesignerPushdownField[]>;
  /** Whether a source id, or a `grid:<panel>` reference, ends at a pushdown source. */
  isPushdown(sourceId: string): boolean;
  /** Everything the source's adapter refuses: each step and each aggregation, with the reason. */
  refusals(sourceId: string, aggregations?: string[]): DesignerPushdownRefusal[];
  /** Why an aggregation or a step is refused for a source, or an empty string when it is not. */
  refusal(sourceId: string, what: { aggregation: string } | { step: string }): string;
  /** Where a panel's figures were computed, with the sentence its info badge shows; null for a panel that does not read a pushdown source. */
  provenance(panelId: string): DesignerPushdownProvenance | null;
  /** Redraw the info badges now. */
  refreshInfo(): void;
  /** How many engine questions ran and were superseded, and how many are held. */
  stats(): { queries: number; superseded: number; held: number };
  /** Be told when a source's fields arrive. Returns the unsubscribe. */
  onChange(fn: () => void): () => void;
  /** The debounce in milliseconds (`pushdownDebounceMs`); assignable at run time. */
  debounceMs: number;
  /** Put the host's factories back and stop holding questions. */
  destroy(): void;
}

/**
 * The statistics widget kinds an author adds and configures in the
 * properties panel. Each is a `kind: 'chart'` panel of
 * its own `type`, so the properties panel's existing generated editor
 * configures all six from `capabilities.js`'s roles and
 * options for that `type` — nothing here renders a control of its own.
 */
export interface DesignerStatisticsWidgets {
  /** The six kind names: `columnProfile`, `distribution`, `correlation`, `groupComparison`, `forecast`, `modelError`. */
  readonly kinds: readonly string[];
  /** The default panel `{type, options}` for a kind, or null for an unknown one. */
  defaults(kind: string): { type: string; options?: Record<string, unknown> } | null;
  /** Add one of the six kinds as a new chart panel, with one undoable commit (`designer.addWidget`). */
  add(kind: string, id: string, extra?: Partial<DashboardPanel> & { placement?: Partial<LayoutPlacement> }): boolean;
  /** Nothing to tear down: the chart types stay registered, like any import. */
  destroy(): void;
}

/** Build a designer into an element. */
export function createDesigner(el: HTMLElement, options?: DesignerOptions): Designer;
export default createDesigner;
