/*!
 * Lattice Grid 1.5.4 — type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * Lattice Grid — public type declarations.
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 *
 * These declarations describe the public API of the vanilla-JavaScript
 * implementation. They are shipped for consumer tooling only; nothing in the
 * build pipeline reads them.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type TypeName =
  | 'text' | 'number' | 'boolean' | 'date' | 'dateString' | 'object' | 'lookup'
  | 'image'
  | (string & {});

/**
 * Cell and header alignment.
 *
 * `left` and `right` are accepted and normalised to `start` and `end`. The grid
 * has no RTL handling today, so the two pairs are exact synonyms; if direction
 * support lands, `start`/`end` will follow the text direction while
 * `left`/`right` stay physical. `centre` is accepted alongside `center`.
 */
export type Align = 'start' | 'center' | 'end' | 'left' | 'right' | 'centre';
/**
 * A named preset, or a raw scale where 1 is `standard`. Row heights are
 * 23.8 / 28 / 42 / 56px for the four presets; a number scales 28px.
 */
export type Density = 'compact' | 'standard' | 'comfortable' | 'spacious' | number;
/**
 * A shipped theme, or your own name — the value is written to `data-theme` on
 * the grid's root, so `.lattice[data-theme="mine"]` is all a custom one needs.
 * Unset follows the viewer's `prefers-color-scheme`.
 */
export type Theme = 'light' | 'dark' | 'high-contrast' | 'terminal' | (string & {});
export type ColumnRef = string;
export type Comparator = (
  a: unknown, b: unknown, rowA?: Row, rowB?: Row, descending?: boolean,
) => number;

export interface CellStyle { [cssProperty: string]: string | number | null | undefined }

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

export interface Row {
  key: string;
  data: unknown | null;
  level: number;
  parent: Row | null;
  children?: Row[];
  filteredChildren?: Row[];
  sortedChildren?: Row[];
  group: boolean;
  expanded: boolean;
  leafCount: number;
  totals?: Record<string, unknown>;
  detail?: boolean;
  master?: boolean;
  height: number;
  index: number | null;
  selected: boolean | 'partial';
  /** Physical index into the ColumnStore. Null for synthetic rows. */
  physical?: number | null;
  /** Group rows only: the column id this level groups on, and the group value. */
  groupColumn?: string;
  groupValue?: unknown;
  /** Stable path of group keys from root to this row. */
  groupPath?: string[];
  hasChildren?: boolean;
}

export interface RowChange {
  add?: unknown[];
  at?: number;
  update?: unknown[];
  remove?: unknown[] | string[];
}

/** A row a change could not apply, and why. Reported, never thrown. */
export interface RejectedRow {
  operation: 'add' | 'update' | 'remove';
  id: string;
  /**
   * `unknown-id` — no row with that key. `duplicate-id` — a row with that key
   * already exists; admitting a second would corrupt every structure that
   * resolves one key to one row.
   */
  reason: 'unknown-id' | 'duplicate-id';
}

export interface ChangeResult {
  added: Row[];
  updated: Row[];
  removed: string[];
  /**
   * Rows that could not be applied. A batch of a thousand containing three bad
   * ones applies the other 997 and lists the three here.
   */
  rejected?: RejectedRow[];
}

// ---------------------------------------------------------------------------
// Parameter bags handed to user callbacks
// ---------------------------------------------------------------------------

export interface ValueParams {
  value: unknown;
  data: unknown;
  row: Row;
  column: Column;
  colId: string;
  grid: Grid;
  context: unknown;
}

export interface CellParams extends ValueParams {
  text: string;
  index: number;
  props?: Record<string, unknown>;
}

export interface FormatParams extends ValueParams { locale: string }
export interface ParseParams { text: string; value: unknown; data: unknown; row: Row; column: Column; grid: Grid; context: unknown }
export interface ApplyParams { value: unknown; oldValue: unknown; data: unknown; row: Row; column: Column; grid: Grid; context: unknown }
export interface KeyParams extends ValueParams {}
export interface ValidateParams extends ApplyParams {}
export interface SpanParams extends CellParams {}
export interface ValueContext { data: unknown; row: Row; column: Column; grid: Grid; context: unknown }
export type DepValues = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Formatting (spec 8.5)
// ---------------------------------------------------------------------------

export interface NumberFormat {
  type?: 'number';
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name' | 'narrowSymbol';
  decimals?: number;
  minDecimals?: number;
  maxDecimals?: number;
  thousandsSeparator?: boolean | string;
  decimalSeparator?: string;
  notation?: 'standard' | 'compact' | 'scientific';
  negative?: 'minus' | 'parentheses' | 'suffix';
  negativeClass?: string;
  prefix?: string;
  suffix?: string;
  zeroDisplay?: string;
  nullDisplay?: string;
  locale?: string;
  scale?: number;
}

export interface DateFormat {
  type: 'date';
  pattern?: string;
  dateStyle?: 'short' | 'medium' | 'long' | 'full';
  timeStyle?: 'short' | 'medium' | 'long';
  timeZone?: string;
  relative?: boolean | { threshold?: number };
  nullDisplay?: string;
  locale?: string;
}

export interface BooleanFormat {
  type: 'boolean';
  display?: 'checkbox' | 'switch' | 'text' | 'icon';
  trueLabel?: string;
  falseLabel?: string;
  nullLabel?: string;
  trueIcon?: string;
  falseIcon?: string;
}

export interface TextFormat {
  type: 'text';
  transform?: 'none' | 'upper' | 'lower' | 'title';
  truncate?: number | { chars: number; ellipsis?: string };
  nullDisplay?: string;
  emptyDisplay?: string;
}

export type FormatSpec = NumberFormat | DateFormat | BooleanFormat | TextFormat;

// ---------------------------------------------------------------------------
// Data types (spec 8.2)
// ---------------------------------------------------------------------------

export interface DataType {
  base: 'text' | 'number' | 'boolean' | 'date' | 'dateString' | 'object';
  extends?: TypeName;
  matches?: (value: unknown) => boolean;
  format?: (p: FormatParams) => string;
  parse?: (p: ParseParams) => unknown;
  compare?: Comparator;
  defaults?: {
    filter?: FilterName;
    editor?: EditorName;
    total?: TotalName;
    align?: Align;
    /** The cell renderer this type's values are drawn with by default. */
    render?: RendererName;
  };
  storage?: 'float64' | 'int32' | 'bitset' | 'dictionary' | 'object';
  excel?: string;
  toClipboard?: (v: unknown) => string;
  fromClipboard?: (s: string) => unknown;
}

// ---------------------------------------------------------------------------
// Lookups (spec 8.3)
// ---------------------------------------------------------------------------

export interface Option {
  id: unknown;
  label: string;
  disabled?: boolean;
  variant?: VariantName;
  icon?: string;
  group?: string;
}

export interface LookupSpec {
  options?: Option[] | (() => Option[] | Promise<Option[]>);
  valueKey?: string;
  labelKey?: string;
  groupKey?: string;
  multiple?: boolean;
  allowCustom?: boolean;
  unknownLabel?: string | ((v: unknown) => string);
  search?: (query: string, signal: AbortSignal) => Promise<Option[]>;
  sortBy?: 'label' | 'value' | 'optionOrder' | 'count';
  separator?: string;
}

// ---------------------------------------------------------------------------
// Decoration and variants (spec 8.7)
// ---------------------------------------------------------------------------

export type DecorationName = 'plain' | 'fill' | 'pill' | 'dot' | 'bar' | 'heat' | 'icon';
export type VariantName = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent' | 'none' | (string & {});

export interface DecorationSpec {
  type: DecorationName;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'pill' | 'rounded' | 'square';
  outline?: boolean;
  edge?: boolean;
  position?: 'start' | 'end';
  name?: string | Record<string, string>;
  min?: number;
  max?: number;
  origin?: number;
  showValue?: boolean;
  track?: boolean;
  ramp?: string;
  midpoint?: number;
}

export interface VariantWhen { op: Operator; value?: unknown; use: VariantName }

export type VariantSpec =
  | VariantName
  | { map: Record<string, VariantName>; default?: VariantName }
  | { when: VariantWhen[]; default?: VariantName }
  | ((p: CellParams) => VariantName);

export interface VariantDefinition {
  light: { fill: string; text: string; border: string };
  dark: { fill: string; text: string; border: string };
}

// ---------------------------------------------------------------------------
// Renderers, editors, filters
// ---------------------------------------------------------------------------

export interface Renderer {
  init(p: CellParams): void;
  element(): HTMLElement;
  refresh?(p: CellParams): boolean;
  attached?(): void;
  destroy?(): void;
}
export type RendererCtor = new () => Renderer;
export type RenderFn = (p: CellParams) => string | HTMLElement;

export interface Editor {
  init(p: EditorParams): void;
  element(): HTMLElement;
  value(): unknown;
  attached?(): void;
  cancelBeforeStart?(): boolean;
  cancelOnClose?(): boolean;
  popup?: boolean;
  destroy?(): void;
}
export type EditorCtor = new () => Editor;
/** The built-in tool panels, addressable by name from configuration. */
export type ToolPanelName = 'columns' | 'filters' | 'views' | 'quick' | 'formatting' | (string & {});

/**
 * The built-in cell renderers, addressable by name through `cell.render`.
 * Anything registered through `components` is also valid here.
 */
export type RendererName =
  | 'area' | 'bullet' | 'checkbox' | 'colour' | 'column' | 'delta' | 'detailExpander'
  | 'donut' | 'gauge' | 'group' | 'icon' | 'image' | 'line' | 'link' | 'pie' | 'pill'
  | 'progress' | 'qrcode' | 'range' | 'rating' | 'skeleton' | 'stacked' | 'twoline'
  | 'winloss' | (string & {});

export type EditorName =
  | 'checkbox' | 'code' | 'colour' | 'date' | 'datetime' | 'duration' | 'iconPicker'
  | 'ipaddress' | 'multiSelect' | 'number' | 'objectPicker' | 'password' | 'radix'
  | 'rating' | 'segmented' | 'select' | 'slider' | 'text' | 'textarea' | 'time'
  | 'treeSelect' | 'unit' | (string & {});

export interface EditorParams extends CellParams {
  stop(cancel?: boolean): void;
  key?: string;
  charPress?: string;
}

export interface Filter {
  init(p: FilterParams): void;
  active(): boolean;
  passes(p: { row: Row; data: unknown }): boolean;
  get(): unknown;
  set(state: unknown): void;
  element(): HTMLElement;
  onRowsChanged?(): void;
}
export type FilterCtor = new () => Filter;
export type FilterName = 'text' | 'number' | 'date' | 'boolean' | 'set' | 'multi' | 'none' | (string & {});

export interface FilterParams {
  column: Column;
  colId: string;
  grid: Grid;
  context: unknown;
  props?: Record<string, unknown>;
  changed(): void;
}

// ---------------------------------------------------------------------------
// Totals
// ---------------------------------------------------------------------------

export type TotalName = 'sum' | 'min' | 'max' | 'avg' | 'count' | 'first' | 'last' | 'countValues' | (string & {});
export type TotalFn = (values: unknown[], ctx: { row: Row; column: Column; grid: Grid; context: unknown }) => unknown;

// ---------------------------------------------------------------------------
// Columns (spec 8.1)
// ---------------------------------------------------------------------------

export interface ColumnValueSpec {
  compute?: (deps: DepValues, ctx: ValueContext) => unknown;
  deps?: string[] | '*';
  pure?: boolean;
  format?: (p: FormatParams) => string;
  apply?: (p: ApplyParams) => boolean;
  parse?: (p: ParseParams) => unknown;
  key?: (p: KeyParams) => string;
  compare?: Comparator;
  quickFilterText?: (p: ValueParams) => string;
}

export interface ColumnCellSpec {
  decoration?: DecorationName | DecorationSpec;
  variant?: VariantSpec;
  template?: string;
  render?: string | RenderFn | RendererCtor;
  props?: Record<string, unknown>;
  css?: (p: CellParams) => CellStyle;
  class?: string | string[] | ((p: CellParams) => string | string[]);
  classWhen?: Record<string, string | ((p: CellParams) => boolean)>;
  style?: CellStyle | ((p: CellParams) => CellStyle);
  tooltip?: string | ((p: CellParams) => string);
  align?: Align;
  wrap?: boolean;
  autoHeight?: boolean;
  flash?: boolean;
  spanColumns?: (p: SpanParams) => number;
  spanRows?: (p: SpanParams) => number;
}

export interface ColumnEditSpec {
  enabled?: boolean | ((p: CellParams) => boolean);
  editor?: string | EditorCtor;
  props?: Record<string, unknown>;
  popup?: boolean;
  validate?: (p: ValidateParams) => true | string;
}

export interface ColumnSortSpec {
  enabled?: boolean;
  direction?: 'asc' | 'desc' | null;
  order?: number;
  nullsFirst?: boolean;
}

export interface ColumnFilterSpec {
  enabled?: boolean;
  type?: FilterName | FilterCtor;
  props?: Record<string, unknown>;
}

export interface ColumnLayoutSpec {
  width?: number;
  min?: number;
  max?: number;
  flex?: number;
  pin?: 'start' | 'end' | null;
  hidden?: boolean;
  resizable?: boolean;
  movable?: boolean;
  lockVisible?: boolean;
  lockPosition?: boolean | 'start' | 'end';
}

export interface ColumnHeaderSpec {
  template?: string;
  render?: string | RendererCtor;
  props?: Record<string, unknown>;
  class?: string | string[];
  tooltip?: string;
  align?: Align;
}

export interface ColumnExportSpec {
  lookup?: 'label' | 'value' | 'columns';
  csv?: boolean;
  excel?: boolean;
}

export interface Column {
  id?: string;
  field?: string;
  title?: string;
  type?: TypeName | false;
  preset?: string | string[];
  format?: FormatSpec | string;
  lookup?: LookupSpec;
  value?: ColumnValueSpec;
  cell?: ColumnCellSpec | string;
  edit?: ColumnEditSpec | boolean | string;
  sort?: ColumnSortSpec | boolean;
  filter?: ColumnFilterSpec | boolean | FilterName;
  group?: { enabled?: boolean; index?: number; explode?: boolean } | boolean;
  pivot?: { enabled?: boolean; index?: number } | boolean;
  total?: TotalName | TotalFn;
  layout?: ColumnLayoutSpec | number;
  header?: ColumnHeaderSpec | string;
  export?: ColumnExportSpec;
  allowGroup?: boolean;
  allowPivot?: boolean;
  allowTotal?: boolean;
  nullable?: boolean;
}

export interface ColumnGroup {
  id?: string;
  title: string;
  columns: (Column | ColumnGroup)[];
  collapsible?: boolean;
  openByDefault?: boolean;
  showWhen?: 'open' | 'closed' | 'always';
  marryChildren?: boolean;
  header?: { render?: string | RendererCtor; props?: Record<string, unknown>; class?: string | string[] };
  /** This column's histogram. `true` turns it on with the grid's settings. */
  facet?: ColumnFacetConfig | boolean;
}

/** A column after presets, type defaults and grid defaults are folded in. */
export interface ResolvedColumn {
  id: string;
  field: string | null;
  title: string;
  type: TypeName;
  dataType: DataType;
  nullable: boolean;
  align: Align;
  value: Required<Pick<ColumnValueSpec, 'pure'>> & ColumnValueSpec;
  cell: ColumnCellSpec;
  edit: ColumnEditSpec;
  sort: ColumnSortSpec;
  filter: ColumnFilterSpec;
  group: { enabled: boolean; index: number; explode: boolean };
  pivot: { enabled: boolean; index: number };
  total: TotalName | TotalFn | null;
  layout: ColumnLayoutSpec;
  header: ColumnHeaderSpec;
  export: ColumnExportSpec;
  lookup: LookupSpec | null;
  allowGroup: boolean;
  allowPivot: boolean;
  allowTotal: boolean;
  /** Compiled display-text producer. */
  formatValue(value: unknown, row?: Row, data?: unknown): string;
  /** Resolve the value for a row, through the computed-value graph. */
  getValue(data: unknown, row?: Row): unknown;
  def: Column;
}

// ---------------------------------------------------------------------------
// Filter wire format (spec 9.3)
// ---------------------------------------------------------------------------

export type Operator =
  | 'eq' | 'ne'
  | 'lt' | 'lte' | 'gt' | 'gte'
  | 'between' | 'notBetween'
  | 'in' | 'notIn'
  | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'matches'
  | 'blank' | 'notBlank'
  | 'containsAny' | 'containsAll' | 'containsNone';

export interface Condition {
  col: string;
  type?: TypeName;
  op: Operator;
  value?: unknown;
  bounds?: '[]' | '[)' | '(]' | '()';
  caseSensitive?: boolean;
  meta?: Record<string, unknown>;
}

export interface FilterGroup {
  op: 'and' | 'or' | 'not';
  conditions: FilterSet[];
}

export type FilterSet = FilterGroup | Condition | null;

export interface SortEntry {
  col: string;
  dir: 'asc' | 'desc';
  nullsFirst?: boolean;
}

// ---------------------------------------------------------------------------
// Sources (spec 4)
// ---------------------------------------------------------------------------

export interface ReloadOptions { keepExpanded?: boolean; keepSelection?: boolean }

export interface Source {
  readonly mode: 'memory' | 'paged' | 'remote' | 'stream';
  count(): number;
  at(index: number): Row | undefined;
  byKey(key: string): Row | undefined;
  loaded(index: number): boolean;
  hint(start: number, end: number): void;
  apply(change: RowChange): ChangeResult;
  reload(opts?: ReloadOptions): void;
  destroy?(): void;
}

export interface MemorySourceConfig { mode: 'memory'; columnarBelow?: number }

export interface PagedSourceConfig {
  mode: 'paged';
  pageSize?: number;
  maxCachedPages?: number;
  fetch(req: {
    range: { start: number; end: number };
    sort: SortEntry[];
    filters: FilterSet;
    quick?: string;
    context: unknown;
    signal: AbortSignal;
  }): Promise<{ rows: unknown[]; total?: number }>;
}

export interface RemoteRequest {
  protocol: 1;
  range: { start: number; end: number };
  groupPath: string[];
  groupBy: ColumnRef[];
  totals: ColumnRef[];
  pivotBy: ColumnRef[];
  pivotMode: boolean;
  filters: FilterSet;
  quick?: string;
  sort: SortEntry[];
  context: unknown;
  signal: AbortSignal;
}

export interface RemoteResult {
  rows: unknown[];
  count?: number;
  pivotFields?: string[];
}

export interface RemoteSourceConfig {
  mode: 'remote';
  pageSize?: number;
  maxCachedPages?: number;
  fetch(req: RemoteRequest): Promise<RemoteResult>;
}

export interface Chunk {
  rows: unknown[];
  progress?: { loaded: number; estimated?: number };
  done?: boolean;
}

export interface StreamSourceConfig {
  mode: 'stream';
  open(req: {
    sort: SortEntry[];
    filters: FilterSet;
    quick?: string;
    context: unknown;
    signal: AbortSignal;
  }): AsyncIterable<Chunk>;
  /**
   * The most rows to keep. A stream has no end, so an unbounded grid dies
   * overnight; this makes it a sliding window and the oldest rows are dropped.
   * Omit for no limit.
   *
   * Set on the source, not passed to `open` — it bounds what the grid retains
   * rather than what the producer sends.
   */
  maxRows?: number;
  promoteToMemoryBelow?: number;
  coalesceMs?: number;
}

export type SourceConfig =
  | MemorySourceConfig | PagedSourceConfig | RemoteSourceConfig | StreamSourceConfig;

// ---------------------------------------------------------------------------
// Grid configuration (spec 18.1)
// ---------------------------------------------------------------------------

export interface TreeConfig {
  path?: (row: unknown) => string[];
  parentKey?: string | ((row: unknown) => unknown);
  orphans?: 'root' | string;
  hasChildren?: (row: unknown) => boolean;
  loadChildren?: (row: Row, signal: AbortSignal) => Promise<unknown[]>;
  /** Where the generated tree column takes its text from: a field or a function. */
  label?: string | ((data: unknown, row: Row) => unknown);
  /** The tree column's heading. Defaults to the label column's own title. */
  title?: string;
}

export interface DetailConfig {
  enabled?: boolean;
  render?: string | RendererCtor;
  config?: GridConfig;
  rows?: (row: Row) => unknown[] | Promise<unknown[]>;
  height?: number | 'auto' | ((row: Row) => number);
  cacheLimit?: number;
  isMaster?: (data: unknown, row: Row) => boolean;
  /**
   * Render the detail into this element instead of into a row beneath its
   * master. A selector or an element. Exactly one detail is open at a time in
   * this placement (§13).
   */
  target?: string | HTMLElement;
  /** Handed the nested grid as it is created, for whatever the forwarded events do not cover. */
  onCreate?: (grid: Grid, masterRow: Row) => void;
  /**
   * The property of the master's record the detail rows live on, so an edit in
   * the detail is reported as a path on the master — `ports.1.vlan`. Inferred
   * by identity when `rows(row)` returns an array already on the record, which
   * is the usual shape; set this when it does not (§13).
   */
  path?: string;
}

export interface SelectionConfig {
  mode?: 'none' | 'single' | 'multiple';
  checkbox?: boolean;
  headerCheckbox?: boolean;
  groupSelectsChildren?: boolean;
  groupSelectsFiltered?: boolean;
  ranges?: boolean;
  fillHandle?: boolean;
  fill?: (p: { source: unknown[]; target: { row: Row; column: ResolvedColumn }[]; direction: string }) => unknown[];
}

export interface EditConfig {
  enabled?: boolean;
  mode?: 'cell' | 'row';
  start?: 'single' | 'double' | 'key';
  enterMovesDown?: boolean;
  undoDepth?: number;
  commit?: (write: PendingWrite) => unknown;
  confirm?: 'auto' | 'manual';
  pendingTimeout?: number;
}

export interface PendingWrite {
  id: string;
  key: string;
  colId: string;
  value: unknown;
  before: unknown;
  row?: Row;
}

export interface OpenWrite {
  id: string;
  key: string;
  colId: string;
  value: unknown;
  before: unknown;
  state: 'pending' | 'superseded';
  age: number;
}

export interface PaginationConfig {
  enabled?: boolean;
  pageSize?: number;
  pageSizes?: number[];
}

export interface GridConfig {
  columns?: (Column | ColumnGroup)[];
  columnGroups?: ColumnGroup[];
  rows?: unknown[];
  rowKey?: string | ((row: unknown) => string);
  source?: SourceConfig;
  columnDefaults?: Column;
  columnPresets?: Record<string, Column>;
  dataTypes?: Record<string, DataType>;
  /** Values sampled per undeclared column when inferring its type. Default 100. */
  sampleSize?: number;
  /**
   * Raise every interactive target to a comfortable size for touch, without
   * changing the type. `'large'` asks for it; `'default'` opts out of the
   * coarse-pointer rule that would otherwise apply it.
   */
  targetSize?: 'default' | 'large';
  components?: Record<string, RendererCtor | EditorCtor | FilterCtor>;
  pipes?: Record<string, (value: unknown, ...args: string[]) => string>;
  totalFns?: Record<string, TotalFn>;
  variants?: Record<string, VariantDefinition>;
  tree?: TreeConfig;
  detail?: DetailConfig;
  selection?: SelectionConfig | 'single' | 'multiple' | 'none';
  edit?: EditConfig | boolean;
  pagination?: PaginationConfig | boolean;
  locale?: string;
  /**
   * IANA zone every date column formats in, e.g. 'Europe/London' or 'UTC'.
   * Omit to use each viewer's own zone. A column's own `format.timeZone` wins.
   */
  timeZone?: string;
  theme?: Theme;
  density?: Density;
  rowHeight?: number | ((row: Row) => number);
  headerHeight?: number;
  overscan?: number;
  /**
   * Size rows to their content rather than to the density token.
   *
   * Only rows that are actually rendered are ever measured, in both settings —
   * the grid does not lay out rows you cannot see. The difference is what
   * happens on a large grid: `true` gives up above ten thousand rows and falls
   * back to fixed heights, because a cumulative offset array being patched as
   * you scroll a million rows is not worth the result. `'visible'` keeps
   * measuring at any size, accepting that the scrollbar shifts as rows are
   * measured on the way past.
   *
   * The name is historical and reads as though it were about which rows are
   * measured; it is about whether the ceiling applies.
   */
  autoHeight?: boolean | 'visible';
  state?: GridState;
  licence?: string;
  maximise?: boolean;
  /** Extra functions a formula may call, on top of the built-in library. */
  formulaFunctions?: Record<string, (args: unknown[]) => unknown>;
  allowUnsafeTemplates?: boolean;
  /**
   * Caps on the change log behind `grid.updates` and `grid.timeline`.
   *
   * Two caps, because an entry is not a fixed size: `logLimit` bounds how many
   * changes are kept (default 2000) and `logRows` bounds the rows they account
   * for between them (default 100,000). A feed delivering large batches reaches
   * the second long before the first, and without it the log is unbounded in
   * bytes while looking bounded in entries.
   */
  updates?: {
    logLimit?: number;
    logRows?: number;
    /**
     * When a queued batch applies. `frame` (default) lands on a paint
     * boundary, which is what makes one repaint per batch reliable;
     * `microtask` at the end of the current task; `interval` on the coalescing
     * window; `manual` only when you call `grid.updates.flush()`.
     */
    flush?: 'frame' | 'microtask' | 'interval' | 'manual';
    /** Queued rows that force an early flush regardless of strategy. */
    maxQueued?: number;
    /** Milliseconds one flush may spend before deferring the rest. */
    budgetMs?: number;
  };
  /**
   * Threaded comments on individual cells (§16). Requires a stable
   * `rowKey`: comments outlive the values they annotate, and index
   * identity would reattach every thread on the next sort.
   */
  comments?: CommentConfig;
  /**
   * Collaborative presence (§18). A display feature over a transport the
   * grid does not own; without a provider it is inert.
   */
  presence?: PresenceConfig;
  /**
   * Host environment for a support bundle. Supplied by the DOM layer;
   * core cannot read `navigator` or `window` itself (§3.1).
   */
  environment?: () => Record<string, unknown>;
  /**
   * Column header histograms and the filters clicking them creates (§9.6).
   *
   * Off by default: the band roughly doubles header height, which is a cost
   * no grid should pay without asking. Per-column settings layer over these.
   */
  facets?: FacetConfig | boolean;
  hostFilter?: { active(): boolean; passes(row: Row): boolean };
  context?: unknown;
  /** Row count above which a column distribution is computed in a Worker. */
  workerThreshold?: number;
  /**
   * Compute column distributions off the main thread. Sorting, filtering and
   * grouping run on the main thread; see §5.13 for why.
   */
  useWorker?: boolean;
  workerUrl?: string;
  sharedMemory?: boolean;
  groupFooter?: boolean;
  /**
   * Where the grand total goes.
   *
   * `true` adds it as the last display row, counted by `rows.count()` like any
   * other. `'bottom'` pins it beneath the viewport instead, so it stays in
   * view while the rows scroll and is *not* part of `rows.count()`. Omitted or
   * `false` means no grand total row.
   */
  grandTotalRow?: boolean | 'bottom';
  totalFilteredOnly?: boolean;
  totalOnlyChangedColumns?: boolean;
  showTotalInHeader?: boolean;
  columnVirtualisationAbove?: number;
  statusBar?: boolean | { panels?: string[] };
  /**
   * The cell right-click menu. A function supplies custom items; `false`
   * suppresses it entirely, which is what a read-only grid wants — the default
   * menu offers Paste, Clear and Fill down.
   */
  contextMenu?: boolean | ((p: CellMenuParams, defaults: MenuItem[]) => MenuItem[] | void);
  /** The header's 3-dot menu. `false` suppresses it. Default true. */
  columnMenu?: boolean;
  /**
   * Flash a cell when its value changes. `true` takes the defaults; an object
   * names a colour, a duration in milliseconds, or both.
   */
  highlightOnChange?: boolean | string | {
    colour?: string;
    color?: string;
    /** Milliseconds. `0` leaves the highlight until it is cleared. */
    duration?: number;
    enabled?: boolean;
  };
  /**
   * Conditional formatting rules the grid holds as runtime state, keyed by
   * column id or `'*'` for every column (spec 8.12). Seeds `grid.formatting`,
   * which an end user can then change; the rules travel in saved views and
   * undo like any other change. Config-time `cell.style` is unaffected.
   */
  formatting?: Record<string, FormattingRule[]>;
  /** A class, or classes, for every row. Re-evaluated on each repaint. */
  rowClass?: string | string[] | ((p: RowStyleParams) => string | string[]);
  /** Inline styles for every row. Camel-case or hyphenated property names. */
  rowStyle?: CellStyle | ((p: RowStyleParams) => CellStyle);
  toolPanel?: boolean | {
    /** Built-in names: `columns`, `filters`, `views`, `quick`, `formatting`. */
    panels?: ToolPanelName[];
    openPanel?: string;
    /** Which edge to dock against. `left` is the icon rail; default `right`. */
    side?: 'left' | 'right';
    /** Icon-only tabs. Defaults to true for `side: 'left'`, false otherwise. */
    icons?: boolean;
    /**
     * Rail action buttons: `undo`, `redo`, `export`, `restore`. Defaults to all
     * four on the left rail and none on the right; `false` drops them.
     */
    /**
     * Which action buttons the rail offers, in order. `false` drops them.
     *
     * The built-in names are `undo`, `redo`, `pause`, `restore`, `maximise`,
     * `export`, `excel`, `clipboard` and `print`, plus `'-'` for a divider.
     * A {@link RailAction} object places one of your own among them.
     */
    actions?: false | (RailActionName | '-' | RailAction)[];
    /** File name for the export action, without the extension. */
    exportName?: string;
  };
  quickFilterText?: string;
  /**
   * Per-column read/write/hidden policy (§8.1). A usability control, not a
   * security boundary — hidden data is still resident in the store. Enforce the
   * same policy server-side with `permittedColumns` / `permittedExport`.
   */
  permissions?: PermissionPolicy;
  /** Prior state for diff and audit mode (§12). */
  diff?: {
    snapshot?: unknown[] | Map<string, unknown>;
    strictNull?: boolean;
    addedColumns?: 'unchanged' | 'changed';
    /**
     * Whether a row present in the snapshot but gone from the data is shown,
     * and whether it counts as data when it is.
     *
     * `false` — the default — leaves it out entirely. `'pinned'` shows it
     * beneath the rows, struck through: visible history that is not part of the
     * row set, so it is excluded from `rows.count()`, from exports and from
     * selection. `'data'` appends it to the row set instead, so it *is*
     * counted and exported.
     *
     * Neither is sorted or filtered among the live rows: a removed row's values
     * are the snapshot's, and ordering yesterday's numbers among today's would
     * present two data sets as one. Neither can be edited — there is nothing
     * left to write to.
     */
    removedRows?: false | 'pinned' | 'data';
  };
  /** Saved views (§15): a storage adapter and any pre-loaded views. */
  views?: { storage?: { read(): unknown[]; write(views: unknown[]): void }; saved?: unknown[] };
  /** The undo toolbar. `element` mounts it into the host's own chrome. */
  historyBar?: boolean | { element?: HTMLElement; timeline?: boolean };
  /**
   * The AI skill layer. The grid makes no network call of its own: `ask` is the
   * host's, and owns the model, the key and the privacy decision.
   */
  ai?: {
    ask(p: {
    /** The full text to send: the schema description and the question together. */
    prompt: string;
    /** The grid's schema as data — columns, types and operators. No row values. */
    schema: unknown;
    /** The same schema rendered as text, which is what `prompt` embeds. */
    schemaText: string;
    /** What the user typed. */
    message: string;
    context?: unknown;
  }): Promise<unknown>;
    schemaOptions?: object;
    context?: unknown;
    element?: HTMLElement;
    placeholder?: string;
  };
  pivot?: {
    enabled?: boolean;
    /**
     * Add a column group totalling every value column across all pivot values —
     * the grand total beside the pivoted ones. `'before'` places it at the near
     * edge, `'after'` at the far edge. Omitted or `false` adds none.
     */
    groupTotals?: 'before' | 'after' | false;
    /** Heading for that group. Defaults to `Total`. */
    totalsLabel?: string;
    maxColumns?: number;
    separator?: string;
  };
}

/**
 * The four corners of read × write. `writeOnly` is a secret: the column is
 * present and editable, its value never shown, exported, copied or searched.
 */
export type PermissionLevel = 'hidden' | 'read' | 'writeOnly' | 'write';

export type PermissionPolicy =
  | PermissionLevel
  | Record<string, PermissionLevel>
  | { field?: string; id?: string; permission: PermissionLevel }[]
  | ((column: ResolvedColumn, params: { colId: string; context?: unknown; grid?: unknown }) => PermissionLevel | undefined)
  | {
      default?: PermissionLevel;
      columns?: Record<string, PermissionLevel>;
      resolve?(column: ResolvedColumn, params: { colId: string; context?: unknown }): PermissionLevel | undefined;
    };

export interface MenuItem {
  name?: string;
  icon?: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
  children?: MenuItem[];
}

// ---------------------------------------------------------------------------
// State (spec 15)
// ---------------------------------------------------------------------------

export interface ColumnState {
  id: string;
  width?: number;
  flex?: number;
  hidden?: boolean;
  pin?: 'start' | 'end' | null;
  sort?: 'asc' | 'desc' | null;
  sortIndex?: number | null;
  groupIndex?: number | null;
  pivotIndex?: number | null;
  total?: TotalName | null;
}

export interface GridState {
  version: number;
  columns?: ColumnState[];
  columnOrder?: string[];
  filters?: FilterSet;
  quick?: string;
  sort?: SortEntry[];
  group?: string[];
  pivot?: { enabled: boolean; columns: string[] };
  formatting?: Record<string, FormattingRule[]>;
  expanded?: string[];
  selection?: string[];
  scroll?: { top: number; left: number };
  pagination?: { page: number; pageSize: number };
}

export interface StateApplyReport {
  applied: string[];
  skipped: { key: string; reason: string }[];
}

// ---------------------------------------------------------------------------
// Conditional formatting (spec 8.12)
// ---------------------------------------------------------------------------

export interface FormattingCondition {
  op: Operator;
  value?: unknown;
  value2?: unknown;
}

export interface FormattingScale {
  min: number;
  max: number;
  mid?: number;
  colours?: string[];
}

/**
 * One rule. Either a condition and the styling it produces, or a colour scale.
 * A rule held as runtime state must be JSON, so `style` may not be a function
 * there — config-time `cell.style` still accepts one.
 */
export interface FormattingRule {
  id?: string;
  when?: FormattingCondition;
  style?: CellStyle | ((p: CellParams) => CellStyle | null);
  scale?: FormattingScale;
  stopIfTrue?: boolean;
  enabled?: boolean;
  icon?: string;
  bar?: boolean;
  label?: string;
}

/** A column id, or `'*'` for every column. */
export type FormattingScope = string;

export interface FormattingApi {
  list(scope?: FormattingScope): FormattingRule[];
  all(): Record<FormattingScope, FormattingRule[]>;
  scopes(): FormattingScope[];
  add(scope: FormattingScope, rule: FormattingRule, opts?: { at?: number }): FormattingRule | null;
  remove(scope: FormattingScope, which: string | number): boolean;
  update(scope: FormattingScope, which: string | number, patch: FormattingRule): FormattingRule | null;
  move(scope: FormattingScope, which: string | number, to: number): boolean;
  set(scope: FormattingScope, rules: FormattingRule[]): FormattingRule[];
  replaceAll(rules: Record<FormattingScope, FormattingRule[]>): void;
  clear(scope?: FormattingScope): void;
  styleFor(colId: string, value: unknown): CellStyle | null;
}

// ---------------------------------------------------------------------------
// Events (spec 18.4)
// ---------------------------------------------------------------------------

export type EventName =
  | 'ready' | 'destroy' | 'render:first' | 'model:changed' | 'rows:changed' | 'rows:queued'
  | 'cell:changed' | 'cell:pending' | 'cell:confirmed' | 'cell:reverted'
  | 'cell:clicked' | 'cell:dblclicked' | 'cell:contextmenu'
  | 'cell:edit:start' | 'cell:edit:end' | 'row:edit:start' | 'row:edit:end'
  | 'row:clicked' | 'row:dblclicked' | 'group:toggled'
  | 'sort:changed' | 'filter:changed'
  | 'column:moved' | 'column:resized' | 'column:visible' | 'column:pinned'
  | 'column:grouped' | 'column:pivoted'
  | 'selection:changed' | 'range:changed'
  | 'page:changed' | 'scroll' | 'scroll:end' | 'size:changed'
  | 'state:changed' | 'stream:chunk' | 'stream:end' | 'source:error'
  | '*';

export interface GridEvent {
  type: string;
  origin: 'api' | 'user' | 'init';
  grid: Grid;
  [key: string]: unknown;
}

export type EventHandler = (e: GridEvent) => void;
export type Unsubscribe = () => void;

// ---------------------------------------------------------------------------
// Modules and licensing (spec 2, 3.3)
// ---------------------------------------------------------------------------

export interface GridModule {
  name: string;
  version?: string;
  install(ctx: ModuleContext): void;
  uninstall?(ctx: ModuleContext): void;
}

export interface ModuleContext {
  registry: Registry;
  grid?: Grid;
}

export interface Registry {
  modules(): GridModule[];
  has(name: string): boolean;
  renderer(name: string): RendererCtor | RenderFn | undefined;
  editor(name: string): EditorCtor | undefined;
  filter(name: string): FilterCtor | undefined;
  dataType(name: string): DataType | undefined;
  totalFn(name: string): TotalFn | undefined;
  pipe(name: string): ((v: unknown, ...a: string[]) => string) | undefined;
  register(kind: string, name: string, impl: unknown): void;
}

export interface LicenceInfo {
  valid: boolean;
  product?: string;
  issuedTo?: string;
  expires?: string;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Export options (spec 14)
// ---------------------------------------------------------------------------

export interface CsvExportOptions {
  delimiter?: string;
  quote?: string;
  lineEnding?: string;
  headers?: boolean;
  columns?: string[];
  rows?: 'visible' | 'all' | 'selected';
  fileName?: string;
  processCell?: (p: CellParams) => string;
  download?: boolean;
}

export interface ExcelExportOptions extends Omit<CsvExportOptions, 'delimiter' | 'quote' | 'lineEnding'> {
  sheetName?: string;
  freezePanes?: boolean;
  variantFills?: boolean;
  onProgress?: (p: { written: number; total: number }) => void;
}

export interface ClipboardOptions {
  headers?: boolean;
  rows?: 'visible' | 'all' | 'selected' | 'range';
}

// ---------------------------------------------------------------------------
// Grid API (spec 18.3)
// ---------------------------------------------------------------------------

export interface RowsApi {
  /** Replace the data. Sort, filters, grouping and column layout are kept. */
  load(rows: unknown[]): void;
  apply(change: RowChange): ChangeResult;
  queue(change: RowChange): Promise<ChangeResult>;
  get(index: number): Row | undefined;
  byKey(key: string): Row | undefined;
  count(): number;
  /** Rows in the source before filtering; under pagination, across every page. */
  totalCount(): number;
  /** Data rows matching the filters, excluding group, footer and total rows. */
  matchCount(): number;
  data(): unknown[];
  forEach(fn: (row: Row, index: number) => void): void;
  /** Every row in the data, before any filter. Leaf rows, in physical order. */
  forEachAll(fn: (row: Row, index: number) => void): void;
  value(key: string, colId: string): unknown;
  text(key: string, colId: string): string;
  values(key: string): Record<string, unknown>;
  refresh(opts?: { rows?: string[]; columns?: string[]; force?: boolean }): void;
  expand(key: string, deep?: boolean): void;
  collapse(key: string): void;
  expandAll(): void;
  collapseAll(): void;
}

export interface ColumnsApi {
  get(id: string): ResolvedColumn | undefined;
  all(): ResolvedColumn[];
  visible(): ResolvedColumn[];
  state(): ColumnState[];
  apply(state: ColumnState[]): void;
  show(ids: string | string[]): void;
  hide(ids: string | string[]): void;
  move(id: string, to: number): void;
  pin(id: string, side: 'start' | 'end' | null): void;
  resize(id: string, px: number): void;
  autoSize(ids?: string | string[]): void;
  fit(): void;
  group(ids: string | string[]): void;
  pivot(ids: string | string[]): void;
  totals(ids: string | string[]): void;
}

export interface DetailApi {
  enabled(): boolean;
  isMaster(target: string | Row): boolean;
  isOpen(key: string): boolean;
  open(key: string): void;
  close(key: string): void;
  toggle(key: string): boolean;
  closeAll(): void;
  keys(): string[];
  active(): string | null;
  placement(): 'inline' | 'target' | null;
  config(): DetailConfig | null;
}

export interface SelectionApi {
  rows(): Row[];
  keys(): string[];
  set(keys: string[]): void;
  all(): void;
  clear(): void;
  headerState(): boolean | 'partial';
  cells(): { key: string; colId: string }[];
  ranges(): CellRange[];
  setRange(range: CellRange): void;
  addRange(range: CellRange): void;
  startRange(rowIndex: number, colId: string, opts?: { additive?: boolean }): void;
  extendRange(rowIndex: number, colId: string): void;
  corner(): { row: number; colId: string } | null;
  inRange(rowIndex: number, colId: string): boolean;
}

export interface CellRange {
  startRow: number;
  endRow: number;
  columns: string[];
}

export interface FiltersApi {
  get(): FilterSet;
  set(filters: FilterSet): void;
  clear(): void;
  quick(text: string): void;
}

export interface SortApi {
  get(): SortEntry[];
  set(entries: SortEntry[]): void;
  clear(): void;
}

export interface EditApi {
  start(key: string, colId: string): boolean;
  stop(cancel?: boolean): void;
  undo(): void;
  redo(): void;
  setCells(writes: { key: string; colId: string; value: unknown }[], type?: 'cell' | 'fill' | 'paste'): number;
  pasteInto(anchor: { key: string; colId: string }, text: string, extent?: { rows?: number; columns?: number }): number;
  settle(id: string, ok: boolean, reason?: string): boolean;
  pending(): OpenWrite[];
  status(key: string, colId: string): 'pending' | null;
}

export interface ScrollApi {
  toRow(index: number, align?: 'start' | 'center' | 'end' | 'auto'): void;
  toColumn(id: string): void;
  position(): { top: number; left: number };
}

export interface ExportApi {
  csv(opts?: CsvExportOptions): string | Promise<Blob>;
  excel(opts?: ExcelExportOptions): Promise<Blob>;
  clipboard(opts?: ClipboardOptions): Promise<void>;
  print(): void;
}

export interface SavedView {
  id: string;
  name: string;
  description: string;
  shared: boolean;
  isDefault: boolean;
  /** Supplied in `config.views.saved`: listed apart, and not renamable or deletable. */
  builtin: boolean;
  createdAt: number;
  updatedAt: number;
  /** A partial `GridState`; only the sections it names are applied. */
  state: GridState;
}

export interface ViewStorage {
  /** Load the user's views. Called at construction and by `views.reload()`. */
  read(): SavedView[];
  /**
   * Mirror the views somewhere synchronous — `localStorage`, an in-memory
   * cache. For a server, listen for `view:saved` / `view:removed` and do the
   * write yourself: the grid does not make network calls and does not want to
   * know whether yours succeeded.
   */
  write(views: SavedView[], change: ViewChange): void;
}

export interface ViewChange {
  reason: 'save' | 'update' | 'rename' | 'remove' | 'default' | 'import' | 'seed' | 'replace';
  /** The view the change concerns; null for a bulk replace. */
  view: SavedView | null;
}

export interface RowStyleParams {
  row: Row;
  key: string;
  index: number;
  data: unknown;
  grid: Grid;
  context: unknown;
}

/**
 * Presentation mode renders the grid for a room: full-screen, application
 * chrome hidden, and everything enlarged by a scale that multiplies the
 * configured density rather than replacing it. The data stays live and
 * interactive throughout.
 */
/**
 * Rendering the grid to a still image. `scale` multiplies the pixel dimensions
 * — 2 for a retina still, 3 or 4 for a slide. `background` fills behind the
 * grid so a PNG dropped into a deck does not show it through.
 */
export interface CaptureOptions {
  scale?: number;
  background?: string;
  download?: boolean;
  fileName?: string;
}

/**
 * The presenter's drawing layer. Pixels over the grid — it never reads or
 * writes data, and it is inert until a tool is chosen, so scrolling and
 * selection pass straight through. Marks are held in content coordinates, so
 * they stay with the cells they annotate when the grid scrolls, and are
 * cleared when a presentation ends.
 */
export interface AnnotationApi {
  readonly tool: 'pen' | 'arrow' | 'rect' | 'highlight' | null;
  readonly count: number;
  use(tool: 'pen' | 'arrow' | 'rect' | 'highlight' | null, opts?: { colour?: string }): string | null;
  undo(): number;
  clear(): void;
  redraw(): void;
}

/**
 * Holding incoming updates, and the counters describing what they cost.
 * Pausing is explicit — a button, not a guess at whether the user is busy.
 */
/** One thing the grid has flagged as probably a mistake. */
export interface DiagnosticWarning {
  /** Stable identifier, nameable in a support conversation. */
  id: string;
  message: string;
  /** The specific values involved, so the warning is actionable. */
  values: Record<string, unknown>;
  count: number;
  first: number;
  last: number;
  /** `'check'` raised by a diagnostic check, `'reported'` from `warnOnce`. */
  source: 'check' | 'reported' | 'info';
}

export interface DiagnosticsApi {
  snapshot(): Record<string, unknown>;
  /** `dom.cellWrites` is the figure a DOM-write assertion reads. */
  renders(): Record<string, unknown>;
  store(): Record<string, unknown>;
  operations(): Record<string, unknown>;
  providers(): Record<string, unknown>;
  events(): Record<string, number>;
  config(): { effective: Record<string, unknown>; supplied: string[]; defaulted: string[] };
  warnings(): DiagnosticWarning[];
  dismiss(id: string): void;
  /** Contains no row data, cell values or column values. */
  bundle(): Record<string, unknown>;
  checkOptions(options: unknown): boolean;
  record(kind: string, detail: { rows?: number; ms?: number; worker?: boolean }): void;
  render(cause: string, phases?: Record<string, number>): void;
  /** Off by default; recording times every emit. */
  recordEvents(on: boolean, limit?: number): void;
  eventLog(): Array<{ type: string; origin: string; listeners: number;
                      payload: Record<string, string>; at: number; ms: number }>;
  clearEventLog(): void;
  /** Keep current store statistics so growth can be measured against them. */
  mark(): Record<string, unknown>;
  since(): Record<string, unknown> | null;
  reset(): void;
}

/** One peer, as the grid holds them. */
export interface Peer {
  id: string;
  name: string;
  /** Assigned deterministically from the id when the provider supplies none. */
  colour: string;
  avatarUrl?: string | null;
  initials?: string | null;
  /** Row key and column, never an index. */
  cursor: { rowId: string; colId: string } | null;
  ranges: Array<{ rowIds: string[]; columns: string[] }>;
  editing: { rowId: string; colId: string } | null;
  /** Local receipt time, not the sender's clock. */
  at: number;
  /** The sender's own timestamp, for inspection only. Nothing decides on it. */
  sentAt?: number | null;
  idle?: boolean;
  silentMs?: number;
  /** True when the peer's cursor is on a row this view is not showing. */
  hidden?: boolean;
}

/**
 * Transport for presence. The grid never opens a connection: it subscribes to
 * what the provider delivers and hands it what changed locally.
 */
export interface PresenceProvider {
  /** Returns an unsubscribe function, if it has one. */
  subscribe(onMessage: (message: Peer | Peer[]) => void): (() => void) | void;
  publish(state: Record<string, unknown>): void;
}

export interface PresenceConfig {
  /** Without one the feature is inert and raises nothing. */
  provider?: PresenceProvider;
  /** The local identity, echoed in everything published. */
  me?: { id: string; name?: string; colour?: string; avatarUrl?: string; initials?: string };
  /** Milliseconds between published updates. Throttled, not debounced. */
  throttleMs?: number;
  /** Silence after which a peer is shown idle. */
  idleMs?: number;
  /** Silence after which a peer is dropped. */
  removeMs?: number;
  /** Silence after which a peer's edit claim is disregarded. */
  lockMs?: number;
  /**
   * Refuse local editing of a cell a peer is editing. Advisory only: the
   * authoritative resolution is the conditional write in `edit.commit`.
   */
  lock?: boolean;
  /** Override the peer colour palette. */
  palette?: string[];
  /** Suppress the roster, or place it. */
  roster?: boolean | { side?: 'start' | 'end' };
  /** Suppress join and leave announcements to assistive technology. */
  announce?: boolean;
}

export interface PresenceApi {
  readonly enabled: boolean;
  readonly me: Record<string, unknown> | null;
  readonly publishing: boolean;
  peers(): Peer[];
  hiddenCount(): number;
  editorOf(rowId: string, colId: string): Peer | null;
  /** Advisory. Reduces collisions; does not eliminate them. */
  lockedBy(rowId: string, colId: string): Peer | null;
  jumpTo(peerId: string): boolean;
  publish(): void;
  setPublishing(on: boolean): void;
  setPaused(paused: boolean): void;
  connect(provider: PresenceProvider | null): void;
  stats(): Record<string, number>;
}

/** One comment in a thread, as the provider returns it. */
export interface Comment {
  id: string;
  body: string;
  /** Rendered as supplied. The grid does not know who the user is. */
  author?: { name?: string; avatarUrl?: string; initials?: string };
  at?: number;
  edited?: boolean;
  resolved?: boolean;
  parentId?: string | null;
  /** The cell's value when this was written, so a later reader is told it moved. */
  value?: unknown;
  /**
   * What the current user may do. Absent means the grid shows every affordance
   * and relies on the provider to refuse. Hiding a button is a convenience,
   * never a security control.
   */
  can?: { edit?: boolean; delete?: boolean; resolve?: boolean };
}

/** Counts for one cell. Never bodies — this is consulted on every repaint. */
export interface CommentDescriptor {
  count: number;
  unresolved: number;
  updated: number;
}

/** What `loadIndex` returns per commented cell. */
export interface CommentIndexEntry extends CommentDescriptor {
  cellKey?: string;
  rowId?: string;
  field?: string;
}

/**
 * Storage for comments. Every method returns a promise; a rejection surfaces in
 * the panel without disturbing grid state.
 */
export interface CommentProvider {
  loadIndex(rowIds: string[], fields: string[]): Promise<CommentIndexEntry[]>;
  loadThread(cellKey: string): Promise<Comment[]>;
  addComment(cellKey: string, body: string, parentId: string | null,
             context?: { value?: unknown }): Promise<Comment>;
  editComment(commentId: string, body: string): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  resolveThread(cellKey: string): Promise<void>;
  unresolveThread(cellKey: string): Promise<void>;
}

export interface CommentConfig {
  /** Without one the feature is inert and no error is raised. */
  provider?: CommentProvider;
  /** Milliseconds a viewport change waits before the index is fetched. */
  debounce?: number;
  /** Cell descriptors held before the oldest are dropped. */
  indexLimit?: number;
  /** `'anchored'` floats beside the cell; `'docked'` uses a side panel. */
  mode?: 'anchored' | 'docked';
  /** Restricted markdown in bodies: emphasis, code and links only. */
  markdown?: boolean;
  /** Label for the row, so the panel says what is being commented on. */
  rowLabel?: (row: Row) => string;
}

export interface CommentsApi {
  readonly enabled: boolean;
  readonly openKey: string | null;
  readonly thread: Comment[] | null;
  readonly loading: boolean;
  readonly complete: boolean;
  /** `'no-provider'`, `'no-row-identity'`, or null when available. */
  unavailable(): string | null;
  at(rowId: string, colId: string): CommentDescriptor | null;
  request(rowIds: string[], fields?: string[]): void;
  open(rowId: string, colId: string): Promise<Comment[] | null>;
  close(opts?: { reason?: string }): void;
  add(body: string, opts?: { parentId?: string; author?: object }): Promise<Comment | null>;
  edit(commentId: string, body: string): Promise<Comment | null>;
  remove(commentId: string): Promise<boolean>;
  resolve(): Promise<boolean>;
  unresolve(): Promise<boolean>;
  refresh(): void;
  loadAll(): Promise<boolean>;
  hiddenUnresolved(): number;
  filterToCommented(opts?: { unresolvedOnly?: boolean }): boolean;
}

/** One bucket of a column's distribution. */
export interface FacetBucket {
  /** Lower edge, for ordered columns. Half-open `[from, to)` except the last. */
  from?: number;
  /** Upper edge, for ordered columns. Inclusive on the last bucket only. */
  to?: number;
  /** The value, for categorical and boolean columns. */
  value?: unknown;
  /** True on the terminal bucket holding nulls, NaN and empty values. */
  null?: boolean;
  /** True on the aggregated tail bucket under `aboveLimit: 'topN'`. */
  remainder?: boolean;
  /** A ready-made label, where one is more useful than the raw value. */
  label?: string;
}

/** Where a column's buckets are, and how they were chosen. */
export interface FacetBounds {
  kind: 'numeric' | 'date' | 'category' | 'boolean' | 'none';
  buckets: FacetBucket[];
  /** Set when no histogram was drawn, naming why. */
  suppressed?: 'type' | 'cardinality' | 'rows' | 'streaming' | 'no-provider' | 'disabled';
  /** Distinct values, on categorical columns. */
  cardinality?: number;
  /** The time unit chosen, on date columns. */
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  /** The numeric strategy actually applied, which may differ from the request. */
  strategy?: 'equal' | 'quantile' | 'log';
  min?: number;
  max?: number;
}

/** A column's computed distribution. */
export interface FacetState {
  bounds: FacetBounds | null;
  /** Counts under every filter except this column's own. Aligned to `buckets`. */
  counts: Uint32Array | null;
  /** Counts with no filter applied, for the "40 of 200" reading. */
  unfiltered: Uint32Array | null;
  /** True while a recount is outstanding; draw the previous counts faded. */
  stale: boolean;
  suppressed: string | null;
}

/** Per-column histogram settings, layered over the grid's. */
export interface ColumnFacetConfig {
  enabled?: boolean;
  buckets?: number;
  strategy?: 'equal' | 'quantile' | 'log';
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  order?: 'count' | 'alpha';
  cardinalityLimit?: number;
  aboveLimit?: 'suppress' | 'topN';
  /** Replace the built-in bucketing entirely. */
  bucketFn?: (handle: unknown, indices: Uint32Array | null, count: number) => FacetBounds;
  /** Label a bucket for its tooltip and accessible name. */
  format?: (bucket: FacetBucket, count: number, unfiltered: number) => string;
}

/** Grid-level histogram settings. */
export interface FacetConfig extends ColumnFacetConfig {
  /** Off unless asked for: header space is tight and this doubles its height. */
  enabled?: boolean;
  /** Start as a one-line density strip that opens on hover or click. */
  collapsed?: boolean;
  /** Band height in pixels. */
  height?: number;
  /** Rows above which histograms are suppressed. */
  rowCeiling?: number;
  /** Milliseconds a filter change waits before charts recount. */
  debounce?: number;
  /** Whether a paused stream re-enables histograms. Defaults to true. */
  whilePaused?: boolean;
  /** Bucket counts for a source the client cannot compute over. */
  provider?: (request: {
    colId: string;
    column: unknown;
    filters: unknown;
    quick: string;
    bounds: FacetBounds | null;
    buckets: number;
    strategy: string;
    granularity?: string;
  }) => Promise<{ bounds?: FacetBounds; buckets?: FacetBucket[]; counts: ArrayLike<number>;
                  unfiltered?: ArrayLike<number>; kind?: string }>;
}

export interface FacetsApi {
  get(colId: string): FacetState | null;
  suppression(colId: string): string | null;
  config(colId?: string): FacetConfig;
  refresh(opts?: { immediate?: boolean }): void;
  isExpanded(colId: string): boolean;
  toggle(colId: string, open?: boolean): boolean;
  select(colId: string, from: number, to?: number,
         opts?: { additive?: boolean; gesture?: string }): boolean;
  clear(colId: string): boolean;
  selected(colId: string): number[];
  expanded(): string[];
}

export interface UpdatesApi {
  readonly paused: boolean;
  pause(): boolean;
  resume(): ChangeResult;
  flush(): ChangeResult;
  stats(): {
    paused: boolean;
    pending: number;
    queued: number;
    coalesced: number;
    coalescedTotal: number;
    rows: number;
    dropped: number;
    held: number;
    heldLimit: number;
    flushes: number;
    strategy: string;
    deferrals: number;
    maxQueued: number;
    budgetMs: number;
    span: { from: number; to: number } | null;
  };
  log(opts?: { since?: number }): { at: number; change: RowChange; rows: number }[];
}

/**
 * Moving the grid through recent data changes. Reads the change log rather
 * than the undo history: history records what the *user* did, and the question
 * on a live grid is what the *data* did. Nothing is scrubbable until
 * `attach()` — what a value used to be is not recoverable after the fact.
 */
export interface TimelineApi {
  readonly attached: boolean;
  readonly live: boolean;
  readonly position: number;
  readonly depth: number;
  attach(): void;
  detach(): void;
  seek(steps: number): number;
  step(by: number): number;
  toLive(): number;
  at(): number | null;
  span(): { from: number; to: number } | null;
}

export interface PresentationApi {
  readonly active: boolean;
  readonly scale: number;
  readonly options: { scale?: number; chrome?: string[]; views?: string[]; from?: number; autoAdvance?: number };
  readonly views: string[];
  readonly index: number;
  readonly viewId: string | null;
  start(options?: {
    scale?: number;
    chrome?: string[];
    /** Saved view ids to step through. Views are the slides. */
    views?: string[];
    /** Where in that sequence to begin. */
    from?: number;
    /** Milliseconds between automatic advances, for an unattended display. */
    autoAdvance?: number;
  }): boolean;
  stop(): boolean;
  setScale(value: number): number;
  nudge(steps?: number): number;
  step(by?: number): number;
  goTo(index: number): number;
  reset(): boolean;
  readonly spotlight: { keys: string[]; colIds: string[] } | null;
  setSpotlight(target?: { keys?: string[]; colIds?: string[] } | null): boolean;
}

/**
 * Redaction obscures a column's values on screen. It is presentational: the
 * values stay in the model, the DOM, the clipboard and every export. Use
 * `permissions` with `writeOnly` for a value that must not be readable.
 */
export interface RedactionApi {
  has(colId: string): boolean;
  list(): string[];
  toggle(colId: string): boolean;
  add(colId: string): void;
  remove(colId: string): void;
  set(ids: string[]): void;
  clear(): void;
  readonly active: boolean;
}

export interface HighlightApi {
  /** Highlight a cell (`{key, colId}`), a row (`{key}`) or a column (`{colId}`). */
  (target: { key?: string; colId?: string } | string,
    opts?: { colour?: string; color?: string; duration?: number }): boolean;
  /** Clear one target, or every highlight when called with nothing. */
  clear(target?: { key?: string; colId?: string } | string): boolean;
  list(): { scope: string; key: string | null; colId: string | null; colour: string; duration: number }[];
  colourFor(key: string, colId: string): string | null;
}

export interface StateApi {
  get(): GridState;
  apply(state: GridState, opts?: { skip?: (keyof GridState)[] }): StateApplyReport;
  /** The state the grid started in, captured once after `config.state`. */
  baseline(): GridState | null;
  /** Put the grid back the way it started, as one undoable step. */
  reset(): StateApplyReport | null;
  /** Whether anything has changed since construction. */
  modified(): boolean;
}

export interface OverlayApi {
  show(kind: 'loading' | 'empty' | (string & {}), message?: string): void;
  hide(): void;
}

export interface HistoryEntry {
  /** Monotonic sequence number, in the order actions were recorded. */
  seq: number;
  /** What kind of action it was, e.g. `'sort'`, `'column:pin'`, `'edit'`. */
  type: string;
  /** Human text for a button, e.g. `'sort by Region'`. */
  label: string;
  /** The column or row the action was aimed at, where there was one. */
  target: string | null;
  /** When it was recorded, on the high-resolution clock. */
  at: number;
  /** True when the edit model owns the undo rather than the history stack. */
  delegated: boolean;
  /** Set once the entry has been undone. */
  undone?: boolean;
  [key: string]: unknown;
}

export interface HistoryApi {
  undo(): HistoryEntry | null;
  redo(): HistoryEntry | null;
  canUndo(): boolean;
  canRedo(): boolean;
  /** What undo or redo would apply next, for labelling a button. */
  peek(direction?: 'undo' | 'redo'): HistoryEntry | null;
  list(): HistoryEntry[];
  /** Group everything `fn` does into one undoable step. */
  transaction(label: string, fn: () => void): HistoryEntry | null;
  clear(): void;
}

export interface ViewsApi {
  list(): SavedView[];
  get(id: string): SavedView | undefined;
  readonly activeId: string | null;
  save(name: string, opts?: { id?: string; overwrite?: boolean }): SavedView;
  apply(id: string): SavedView | null;
  rename(id: string, name: string): SavedView | null;
  duplicate(id: string, name?: string): SavedView | null;
  remove(id: string): boolean;
  /** Mark the view applied on load; null clears it. */
  setDefault(id: string | null): SavedView | null;
  defaultView(): SavedView | null;
  /** What applying the view would change, without applying it. */
  diff(id: string): Record<string, unknown> | null;
  export(id: string): string;
  import(json: string): SavedView;
  /** Re-read from storage, after another tab or the server changed it. */
  reload(): void;
}

export interface DiffApi {
  readonly enabled: boolean;
  /** Set the baseline every row is compared against. */
  setSnapshot(rows: unknown[] | null): void;
  clear(): void;
  summary(): { added: number; removed: number; changed: number; unchanged: number };
  statusOf(key: string): 'added' | 'removed' | 'changed' | 'unchanged';
  cellStatus(key: string, colId: string): 'changed' | 'unchanged';
  isChanged(key: string, colId?: string): boolean;
  changedColumns(key: string): string[];
  /** The value a cell held in the baseline. */
  before(key: string, colId: string): unknown;
  beforeRow(key: string): unknown;
  removedKeys(): string[];
  removedRows(): unknown[];
  report(): Record<string, unknown>;
}

export type PermissionLevel = 'hidden' | 'read' | 'write' | 'writeOnly';

export interface PermissionsApi {
  levelOf(column: string | ResolvedColumn): PermissionLevel;
  isHidden(column: string | ResolvedColumn): boolean;
  isReadable(column: string | ResolvedColumn): boolean;
  isEditable(column: string | ResolvedColumn): boolean;
  /** True only at `writeOnly`: writable, never shown or exported. */
  isSecret(column: string | ResolvedColumn): boolean;
  isExportable(column: string | ResolvedColumn): boolean;
  levels(): Record<string, PermissionLevel>;
  /** Change the context permissions are evaluated against, and re-evaluate. */
  setContext(context: unknown): void;
  invalidate(): void;
}

export interface AiApi {
  /** A machine-readable description of the grid, for a model's context. */
  schema(opts?: { maxColumns?: number; maxRows?: number }): Record<string, unknown>;
  /** The same schema as a tool definition. */
  tool(opts?: { maxColumns?: number; maxRows?: number }): Record<string, unknown>;
  /**
   * The prompt describing this grid — its columns, types and operators — for
   * sending to a model. It carries no row values.
   *
   * It does not take the user's question: compose that yourself alongside the
   * text this returns, which is what `ask` receives as `schemaText`.
   */
  prompt(opts?: Record<string, unknown>): string;
  buildPrompt(text: string, opts?: Record<string, unknown>): string;
  /** Parse what the model returned into a plan. */
  plan(reply: string | Record<string, unknown>, opts?: Record<string, unknown>): Record<string, unknown>;
  /** Run a plan as one undoable step. */
  apply(plan: Record<string, unknown>): Record<string, unknown>;
}

export interface LicenceApi {
  set(key: string): LicenceInfo;
  info(): LicenceInfo;
  state(): 'licensed' | 'localhost' | 'trial';
  watermark(): boolean;
  /** Settles when the licence check finishes. */
  readonly ready: Promise<LicenceInfo>;
}

export interface PaginationApi {
  get(): { page: number; pageSize: number; total: number; pageCount: number };
  set(next: { page?: number; pageSize?: number }): void;
  applyPage(next: { page?: number; pageSize?: number }): void;
}

/**
 * Fills the browser window with the grid and puts it back. Present on grids
 * created with `createGrid` unless `maximise: false`; never on a headless grid,
 * which has no window to fill.
 */
/** What a cell-menu builder and a host item's `action` are handed. */
export interface CellMenuParams {
  key: string;
  colId: string;
  value: unknown;
  /** The row wrapper. */
  row: Row;
  /** Your original row object. */
  data: unknown;
  column: ResolvedColumn;
  index: number;
  grid: Grid;
}

/** What a host rail action's `run` is handed. */
/** The rail's built-in action names, plus `'-'` for a divider. */
export type RailActionName =
  | 'undo' | 'redo' | 'pause' | 'restore' | 'maximise'
  | 'export' | 'excel' | 'clipboard' | 'print';

export interface RailActionParams {
  grid: Grid;
  keys: string[];
  cells: { key: string; colId: string }[];
}

export interface RailAction {
  name: string;
  title: string | (() => string);
  icon?: string | (() => string);
  run(params: RailActionParams): void;
  enabled?(): boolean;
}

/** The result of evaluating a formula a user typed into a cell (spec 8.11). */
export type FormulaResult =
  | { ok: true; value: unknown; references: string[] }
  | { ok: false; error: string; at?: number };

export function evaluateFormula(text: string, params?: ParseParams): FormulaResult;
export function looksLikeFormula(text: unknown): boolean;

export interface MaximiseApi {
  enter(): boolean;
  exit(): boolean;
  toggle(): boolean;
  active(): boolean;
}

export interface Grid {
  readonly rows: RowsApi;
  readonly columns: ColumnsApi;
  readonly selection: SelectionApi;
  readonly filters: FiltersApi;
  readonly sort: SortApi;
  readonly edit: EditApi;
  readonly scroll: ScrollApi;
  readonly export: ExportApi;
  readonly state: StateApi;
  readonly overlay: OverlayApi;
  readonly history: HistoryApi;
  readonly views: ViewsApi;
  readonly diff: DiffApi;
  readonly permissions: PermissionsApi;
  readonly ai: AiApi;
  readonly licence: LicenceApi;
  readonly pagination: PaginationApi;
  readonly highlight: HighlightApi;
  readonly redaction: RedactionApi;
  capture?(opts?: CaptureOptions): Promise<Blob>;
  annotate?: AnnotationApi;
  readonly presentation: PresentationApi;
  readonly updates: UpdatesApi;
  readonly timeline: TimelineApi;
  readonly facets: FacetsApi;
  readonly detail: DetailApi;
  readonly comments: CommentsApi;
  readonly presence: PresenceApi;
  readonly diagnostics: DiagnosticsApi;
  readonly formatting: FormattingApi;
  readonly maximise?: MaximiseApi;
  /**
   * The element you passed to `createGrid`, not the grid's own root.
   *
   * The grid builds its `.lattice` root *inside* that element, so
   * `el.closest('.lattice')` never matches this, and a theme attribute set on
   * it has no effect — the theme is read from the root within. Use
   * `element.querySelector('.lattice')` for the grid's own root.
   */
  readonly element: HTMLElement | null;
  readonly destroyed: boolean;
  /** False until the first render has been laid out. */
  readonly ready: boolean;

  /** The resolved configuration, as one object. */
  config(): GridConfig;
  get<K extends keyof GridConfig>(key: K): GridConfig[K];
  set<K extends keyof GridConfig>(key: K, value: GridConfig[K]): void;
  setAll(values: Partial<GridConfig>): void;

  on(event: EventName, handler: EventHandler): Unsubscribe;
  once(event: EventName, handler: EventHandler): Unsubscribe;
  off(event: EventName, handler: EventHandler): void;
  emit(event: string, payload?: Record<string, unknown>): void;

  getVersion(): string;
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

export function createGrid(element: HTMLElement, config?: GridConfig): Grid;
export function createHeadlessGrid(config?: GridConfig): Grid;
export function registerModules(modules: GridModule[], opts?: { licence?: string }): void;
export function setLicence(licence: string): LicenceInfo;
export function version(): string;

export const LatticeGrid: {
  createGrid: typeof createGrid;
  createHeadlessGrid: typeof createHeadlessGrid;
  registerModules: typeof registerModules;
  setLicence: typeof setLicence;
  version: typeof version;
};

export default LatticeGrid;
