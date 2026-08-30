/*!
 * Lattice Grid 1.10.0 — type declarations
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
  // Extended catalogue. Never inferred — a column asks for these by name.
  | 'time' | 'datetime' | 'duration'
  | 'ipv4' | 'ipv6' | 'cidr'
  | 'json' | 'secret'
  | 'hex' | 'hex8' | 'hex16' | 'hex32' | 'binary' | 'binary8' | 'octal'
  | 'decibel' | 'decibelAmplitude' | 'ratio' | 'percentRate'
  // Units — computing
  | 'bytes' | 'megabytes' | 'gigabytes' | 'bitrate' | 'gigabits'
  // Units — physical
  | 'metres' | 'millimetres' | 'kilometres'
  | 'grams' | 'kilograms' | 'tonnes'
  | 'seconds' | 'milliseconds' | 'hours'
  // Units — engineering
  | 'speed' | 'kph' | 'mph' | 'knots' | 'acceleration'
  | 'area' | 'hectares' | 'volume' | 'cubicMetres'
  | 'energy' | 'kilowattHours' | 'power' | 'kilowatts' | 'force'
  | 'pressure' | 'bar' | 'psi' | 'torque' | 'density'
  | 'flow' | 'litresPerMinute' | 'radians' | 'degrees'
  // Units — electrical and scientific
  | 'voltage' | 'current' | 'resistance' | 'capacitance' | 'inductance'
  | 'charge' | 'conductance' | 'fluxDensity' | 'luminousFlux' | 'illuminance'
  | 'substance' | 'absorbedDose' | 'equivalentDose' | 'radioactivity' | 'frequency'
  | 'luminousIntensity' | 'doseRate'
  // Units — rate, ratio and process
  | 'rpm' | 'angularVelocity' | 'ppm' | 'ppb' | 'basisPoints'
  | 'molarity' | 'massFlow' | 'tonnesPerHour'
  | 'viscosity' | 'kinematicViscosity' | 'thermalConductivity' | 'specificHeat'
  // Temperature, which is affine rather than multiplicative
  | 'celsius' | 'fahrenheit' | 'kelvin'
  | (string & {});

/**
 * Cell and header alignment.
 *
 * `left` and `right` are accepted and normalised to `start` and `end`.
 * `start`/`end` follow the writing direction, so they mirror in a right-to-left
 * grid while `left`/`right` stay physical. `centre` is accepted alongside
 * `center`.
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
  /**
   * Which sticky strip this row is pinned in, when it is one the host pinned
   * through `setPinnedRows`. Absent on every row that is part of the data.
   */
  pinned?: 'top' | 'bottom';
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
export interface ParseParams { text: string; value: unknown; data: unknown; row: Row; column: Column; grid: Grid; context: unknown; locale?: string }
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
  /**
   * A partial message catalogue laid over the built-in British English one.
   *
   * Every valid key is listed in `MESSAGE_KEYS`; a key that is not is ignored
   * with a warning. Import a bundled locale (`FR_FR`, `AR`, …) or supply your
   * own object. Merged rather than replacing, so an incomplete translation
   * leaves the remainder in English rather than showing raw keys.
   */
  messages?: Record<string, string | Record<string, string>>;
  /**
   * Writing direction. Omit to settle it from the element's own `dir` and then
   * from `locale` — `ar`, `he`, `fa` and the rest resolve to `rtl`.
   */
  direction?: 'ltr' | 'rtl';
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

  /**
   * Which aggregates are meaningful for this type, and how.
   *
   * Omit it and every aggregate is allowed, which is what every type that
   * shipped before this does.
   */
  totals?: {
    /**
     * The aggregates that mean something. A column of this type configured
     * with any other fails at construction rather than rendering a confident
     * wrong number.
     */
    supported?: TotalName[];
    /**
     * The type's own reduction for an aggregate, replacing the built-in
     * arithmetic. Receives the values index-aligned with their rows, and a
     * context carrying `column` and `valueAt(colId, i)` for reading another
     * column of the same row.
     */
    implement?: Record<string, TotalFn>;
  };
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
  | 'rating' | 'segmented' | 'select' | 'slider' | 'temperature' | 'text' | 'textarea'
  | 'time' | 'treeSelect' | 'unit' | (string & {});

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
  /**
   * A pixel width, or a percentage of the grid's inner width as a string —
   * `'25%'`.
   *
   * A percentage is a share of the *whole* grid. `flex` divides only the space
   * left over after fixed columns, so the two are not interchangeable: `flex:
   * 25` on four columns is a quarter of the remainder, which is a quarter of
   * the grid only when nothing else is fixed.
   */
  width?: number | string;
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
  /**
   * Free-form labels for grouping columns together. A bare string is
   * accepted for a single tag.
   *
   * Used by the column tag bar to show and hide sets of columns — tag sixty
   * monthly columns with their year, and a user can switch to one year.
   */
  tags?: string | string[];
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
  /**
   * A value the grid maintains about this column's own history, rather than a
   * field in the data. `{of: 'price', kind: 'delta'}`, or the bare kind to
   * shadow the column it sits beside.
   */
  shadow?: ShadowKind | {
    of?: string;
    kind: ShadowKind;
    depth?: number;
    /**
     * For a positional kind, what to rank against. `'all'` (the default) uses
     * every tracked row, so a rank does not move when the grid is filtered;
     * `'filtered'` ranks within what the filters left.
     */
    scope?: 'all' | 'filtered';
  };
  /**
   * A running total down the grid **as it is currently ordered**.
   *
   * The one derived value that depends on the display order: sort differently
   * and every value changes. That is why it is not a shadow kind — every shadow
   * reads the same however the rows are arranged.
   */
  running?: 'total' | 'percent' | { of?: string; kind?: 'total' | 'percent' };
  /**
   * The customer's tolerance, for process capability and control charts.
   * Declared here rather than passed to each call so the capability figures,
   * a control chart and any rule marking an out-of-tolerance cell cannot
   * disagree about what the tolerance is.
   */
  spec?: { lower?: number; upper?: number; target?: number };
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

/** One reduced column of a derived grid. */
export interface DerivedSelect {
  /** The column to reduce, as a field name or a dotted path. Omit for `count`. */
  of?: string;
  /** A key of `TOTAL_FNS` — `sum`, `avg`, `median`, `p95`, `distinct` and the rest. */
  fn?: TotalName;
}

/**
 * A grid whose rows are derived from another grid: aggregated, unnested,
 * filtered, ranked or profiled. Read-only — write to the source instead.
 */
export interface DerivedSourceConfig {
  mode: 'derived';
  /**
   * A derived grid keys on `__key`, which the source writes onto every row it
   * produces — the group value, the profiled column, or the source row's own
   * key when nothing is grouped. `config.rowKey` defaults to it, so it need not
   * be set; an explicit `rowKey` still wins.
   */
  /** The grid to read. */
  from: Grid;
  /** Which of its rows to read. `filtered` by default. */
  follow?: 'filtered' | 'all' | 'selected' | 'grouped';

  /** An array property to expand, one row per element, before anything else. */
  unnest?: string;
  /** A row predicate, applied before grouping. */
  where?: (row: unknown) => boolean;
  /** Round a date column down to a period, and group on that. */
  bucket?: { of: string; by: 'day' | 'week' | 'month' | 'quarter' | 'year' };
  /** The dimension, or dimensions, to group by. Omit to pass rows through. */
  groupBy?: string | string[];
  /** The reduced columns, by output id. */
  select?: Record<string, DerivedSelect>;
  /** How to order the derived rows before limiting them. */
  sort?: { col: string; dir?: 'asc' | 'desc' }[];
  /** Keep at most this many rows. */
  limit?: number;
  /** Apply `limit` within each distinct value of this column, not overall. */
  limitPer?: string;
  /** Keep rows until their running share of the total reaches `upTo`, 0 to 1. */
  cumulative?: { of: string; upTo: number };

  /** One row per column, with the statistics as columns. Replaces the pipeline. */
  profile?: string | string[];
  /** With `profile`, emit one row per statistic instead of one per column. */
  orient?: 'columns' | 'metrics';

  /** When to re-derive. `idle` by default — coalesced to a frame. */
  refresh?: 'live' | 'idle' | 'manual' | number;
}

export type SourceConfig =
  | MemorySourceConfig | PagedSourceConfig | RemoteSourceConfig | StreamSourceConfig
  | DerivedSourceConfig;

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
   * this placement.
   */
  target?: string | HTMLElement;
  /** Handed the nested grid as it is created, for whatever the forwarded events do not cover. */
  onCreate?: (grid: Grid, masterRow: Row) => void;
  /**
   * The property of the master's record the detail rows live on, so an edit in
   * the detail is reported as a path on the master — `ports.1.vlan`. Inferred
   * by identity when `rows(row)` returns an array already on the record, which
   * is the usual shape; set this when it does not.
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

  /**
   * Which rules are drawn between cells.
   *
   * `'both'` by default. The two axes are separate decisions: horizontal rules
   * help the eye track along a row, vertical ones stop adjacent values running
   * together. `false` or `'none'` draws neither.
   *
   * Only the rules *between data* are affected — the header's underline, the
   * pinned seams and the totals separator are structure, not grid lines.
   */
  gridLines?: boolean | 'both' | 'horizontal' | 'vertical' | 'none' | 'rows' | 'columns';

  /**
   * Round the grid's outer corners.
   *
   * Square by default. `true` adopts the theme's own radius; a number is
   * pixels; a string is used as written, so a host can pass its own token or a
   * relative unit.
   */
  cornerRadius?: boolean | number | string;

  /**
   * Show a bar above the column headings for filtering columns by tag.
   *
   * Off by default, and it draws nothing unless some column carries a `tags`
   * entry. `multiple: true` lets more than one tag be chosen at once.
   *
   * Only tagged columns are ever hidden, so an untagged account or total column
   * stays visible whatever is selected.
   */
  columnTagFilter?: boolean | { multiple?: boolean; label?: string };

  /**
   * Open a row on a form when it is double-clicked.
   *
   * `mode` is a right-hand `'drawer'` (the default) or a centred `'dialog'`.
   *
   * Without `load` the form shows the grid's own columns, edited with the same
   * editors the cells use. With `load` it shows whatever that returns — the
   * grid rarely displays everything a record has — and then `fields` is
   * required, because nothing here knows the shape of a record it has not seen.
   *
   * The panel opens immediately and fills in when the record arrives; a failure
   * offers a retry inside the panel. Save collects the changed fields, writes
   * the ones that map to columns, and emits `form:saved` with the lot —
   * persisting is yours.
   *
   * `trigger: false` leaves opening to `grid.form.open(key)`.
   */
  /**
   * Draw each row with a template instead of dividing it into columns.
   *
   * A card list, a feed, a search-result list. The template is the same
   * declarative string a cell template is, and compiles once at configuration
   * time — there is deliberately no per-row callback, because one would be used
   * to allocate DOM per row and the virtualisation would stop paying for
   * itself. Bind with `{{data.field}}`.
   *
   * Everything underneath is unchanged: sorting, filtering, grouping,
   * selection, permissions, redaction, saved views, undo and the remote source
   * all apply, and a card emits the same `row:clicked` and `row:dblclicked`
   * events a table row does.
   */
  /**
   * Per-column options a data type reads.
   *
   * `ratio` and `percentRate` use `{ weight }` to name the column their average
   * is weighted by. A unit type reads `{ significantFigures }` to render to a
   * fixed precision rather than a fixed number of decimals.
   */
  typeOptions?: Record<string, {
    weight?: string;
    significantFigures?: number;
    [option: string]: unknown;
  }>;

  rowTemplate?: string | {
    template: string;
    /** A class of your own on every card, alongside the grid's. */
    className?: string;
    /** The layer's role. `list` by default; `listbox` for a selectable set. */
    role?: string;
    /** Each card's role. `listitem` by default. */
    itemRole?: string;
    /** A fixed number of cards on a line. Does not reflow. */
    cardsPerRow?: number;
    /** A ceiling on card width; the number on a line follows the container. */
    maxCardWidth?: number;
    /** Space between tiles, in pixels. 8 by default. */
    gap?: number;
  };

  /**
   * Present rows as cards when the grid's container is too narrow to be a
   * table honestly — a phone, or a narrow panel on a wide screen.
   *
   * Measured on the container, not the viewport, so a grid in a sidebar
   * collapses and a grid filling a small tablet does not. Sorting, filtering
   * and export continue to work; the tool panel is where they live when there
   * are no column headings to click. Emits `presentation:changed`.
   */
  responsive?: {
    /** Collapse at or below this container width. 640 by default. */
    maxWidth?: number;
    /** The card layout, as `rowTemplate` takes it. */
    template: string | object;
    /** How tall a collapsed card is. 64 by default — a table row is too short. */
    rowHeight?: number;
  };

  rowForm?: boolean | {
    mode?: 'drawer' | 'dialog';
    load?: (p: { row: Row; data: unknown; key: string; grid: Grid }) => unknown | Promise<unknown>;
    fields?: (string | {
      field: string;
      label?: string;
      /** Which editor to build, by registry name or constructor. Defaults to the column's, then the type's. */
      editor?: string | (new () => object);
      type?: TypeName;
      props?: object;
      lookup?: LookupSpec;
    })[];
    title?: string | ((p: { row: Row; data: unknown }) => string);
    width?: string;
    trigger?: false;
    /** How long to wait for `load`, in milliseconds. 2000 by default; `false` waits indefinitely. */
    timeout?: number | false;
    /**
     * An element of your own to build the form in, instead of over the grid.
     * An element, a CSS selector or a function returning either; a selector is
     * resolved when the form opens, not when the grid is configured. A form in
     * your own container fills it, is a region rather than a modal dialog, and
     * does not trap Tab.
     */
    container?: HTMLElement | string | (() => HTMLElement | string | null);
  };

  /**
   * Draw the sort, filter and menu controls in the column headings.
   *
   * `true` by default. `false` leaves each heading as its label alone, which is
   * what a dense grid wants: three affordances take roughly fifty pixels, and
   * on an eighty-pixel column that leaves the heading nothing and the label
   * disappears entirely.
   *
   * Only the furniture goes. Sorting, filtering and the column menu are still
   * reachable through the API, the keyboard and the tool panel.
   */
  showColumnFunctions?: boolean;
  rowHeight?: number | ((row: Row) => number);
  /**
   * A caption for the grid, drawn above the column headings.
   *
   * Inside the grid rather than an element the host places above it: a title
   * outside does not scroll with the grid, is not in the region a screen reader
   * announces, and is left behind by image capture and print.
   */
  title?: string;
  /**
   * Draw the column headings at all.
   *
   * `true` by default. `false` removes the row, and removes it from the
   * accessibility tree rather than only from view — a heading a screen reader
   * still announces is invisible, not hidden. What a small dashboard tile
   * wants when its `title` already says what the panel is.
   *
   * Distinct from `showColumnFunctions`, which keeps the headings and drops
   * only the sort, filter and menu controls inside them.
   */
  showHeader?: boolean;
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
   * Threaded comments on individual cells. Requires a stable
   * `rowKey`: comments outlive the values they annotate, and index
   * identity would reattach every thread on the next sort.
   */
  comments?: CommentConfig;
  /**
   * Collaborative presence. A display feature over a transport the
   * grid does not own; without a provider it is inert.
   */
  presence?: PresenceConfig;
  /**
   * Host environment for a support bundle. Supplied by the DOM layer;
   * core cannot read `navigator` or `window` itself.
   */
  environment?: () => Record<string, unknown>;
  /**
   * Column header histograms and the filters clicking them creates.
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
   * grouping run on the main thread; see the reference for why.
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

  /**
   * Rows pinned above the scrolling body.
   *
   * The objects are rendered through the ordinary column pipeline but are not
   * part of the data: not counted by `rows.count()`, not sorted, filtered,
   * grouped, selectable or exported. Use it for a totals line or a units row
   * that must stay against the header.
   */
  pinnedTopRows?: unknown[];

  /** Rows pinned below the scrolling body. As `pinnedTopRows`, at the other edge. */
  pinnedBottomRows?: unknown[];

  /**
   * Rows drawn as a single band across every column instead of being divided
   * into them — a section banner, a note, a "load more" affordance.
   *
   * `when` picks the rows; `render` fills them. A full-width row is still one
   * of your data rows: counted by `rows.count()`, sorted, filtered and
   * exported like any other. Only its presentation changes. For a row that
   * should *not* be part of the data, use `pinnedTopRows`.
   */
  fullWidth?: {
    when(row: Row): boolean;
    /**
     * Return a string for text, or a node for content. Return nothing and
     * write into `params.element` yourself. An HTML string is deliberately not
     * accepted — see `allowUnsafeTemplates` for that decision elsewhere.
     */
    render(params: FullWidthParams): string | Node | void;
  };
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
  /**
   * The header's 3-dot menu, and the right-click menu on a column heading.
   * `false` suppresses both. A function supplies custom items, receiving the
   * grid's own so it can add to them rather than reproduce them. Default true.
   */
  columnMenu?: boolean | ((p: ColumnMenuParams, defaults: MenuItem[]) => MenuItem[] | void);

  /**
   * The `?` keyboard shortcut overlay. `false` suppresses it, for a host
   * that wants `?` for itself. Default true.
   */
  shortcuts?: boolean;

  /**
   * Let a user reorder rows by dragging a handle, or with
   * Alt+Shift+Up/Down.
   *
   * `true` puts the handle in the first visible column; `{ column }` names a
   * different one. The move reorders your data and emits `row:moved`;
   * persisting it is yours, and `rows.data()` afterwards is the new order.
   *
   * Refused, with a reason announced, while a sort, filter or grouping is
   * active — the position a row is dropped at has no single meaning in the
   * underlying order then.
   */
  rowReorder?: boolean | { column?: string };

  /**
   * Let rows be dragged out of this grid, into it, or both.
   *
   * Off by default: rows leaving a grid is a data change a host has to want,
   * and a mis-drag that silently removed one has no gesture a user would think
   * to undo.
   *
   * `send` and `receive` are both on when the option is present, so one-way is
   * expressed by turning off the direction you do not want — a source grid is
   * `{ receive: false }` and a target is `{ send: false }`.
   *
   * `mode: 'copy'` leaves the row where it was. `group` restricts exchange to
   * grids sharing the same name, so two unrelated grids on a page do not accept
   * each other's rows.
   *
   * The source needs `rowReorder` as well, since that is what draws the handle
   * a drag starts from.
   */
  rowTransfer?: boolean | {
    send?: boolean;
    receive?: boolean;
    mode?: 'move' | 'copy';
    group?: string;
  };

  /**
   * Other grids to stay column-aligned with.
   *
   * Column widths, order, visibility and pinning are shared, and horizontal
   * scrolling moves them together. Sort, filters, selection, grouping and the
   * rows themselves stay independent — sharing those would make one grid with
   * extra steps rather than two aligned ones.
   *
   * Declared on the grid created last, since it is the only one that can name
   * the others; the link is peer-based once made.
   */
  alignedGrids?: unknown[];

  /**
   * Keep the enclosing group headings pinned above the viewport while
   * scrolling inside a group.
   *
   * On by default, stacking at most two. `false` turns it off; a number, or
   * `{ depth }`, sets how many may stack — each costs a row of viewport, so a
   * deep grouping would otherwise spend the screen describing itself.
   */
  stickyGroupHeaders?: boolean | number | { depth?: number };
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
   * Per-column read/write/hidden policy. A usability control, not a
   * security boundary — hidden data is still resident in the store. Enforce the
   * same policy server-side with `permittedColumns` / `permittedExport`.
   */
  permissions?: PermissionPolicy;
  /** Prior state for diff and audit mode. */
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
  /** Saved views: a storage adapter and any pre-loaded views. */
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
  /**
   * A filter operator compared against `value`, or a distribution operator
   * whose threshold comes from the column itself — `{op: 'topPercent', value: 10}`,
   * `{op: 'outlier'}`. Distribution thresholds are pinned when the rules
   * compile; `grid.formatting.restat()` moves them.
   */
  op: Operator | DistributionOp;
  value?: unknown;
  value2?: unknown;
}

export interface FormattingScale {
  /**
   * Where the bounds come from when `min` and `max` are not given.
   * `'minmax'` spans the data, `'quantile'` spans `low` to `high`
   * (5th to 95th percentile by default), `'stddev'` spans `deviations`
   * either side of the mean.
   */
  from?: 'minmax' | 'quantile' | 'stddev';
  min?: number;
  max?: number;
  mid?: number;
  low?: number;
  high?: number;
  deviations?: number;
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

export interface StatisticsApi {
  /** One shadow value for one row, by the column it shadows and the kind. */
  shadow(colId: string, kind: ShadowKind, rowKey: string, scope?: 'all' | 'filtered'): unknown;
  /** A running total at one row, down the grid as it is currently ordered. */
  running(colId: string, kind: 'total' | 'percent', rowKey: string): number | null;
  /** Make the current values the new baseline — "mark all". */
  rebase(colId?: string): void;
  /** What the shadow histories are costing. */
  tracking(): { columns: string[]; rows: number; forgotten: number };
  /** Reduce a column by a named kernel over the filtered rows. */
  reduce(colId: string, fn: string): unknown;
  /** Everything worth knowing about one column, in one pass each. */
  profile(colId: string): ColumnProfile | null;
  /** Pearson's correlation between two columns. */
  correlation(a: string, b: string): number | null;
  /** Covariance — a correlation before the scales are divided out. */
  covariance(a: string, b: string, opts?: { population?: boolean }): number | null;
  /** Least-squares fit of `b` on `a`: in finance, beta and alpha. */
  regression(a: string, b: string): RegressionFit | null;
  /** Spearman's rank correlation, which one outlier cannot drag. */
  spearman(a: string, b: string): number | null;
  /** Kendall's tau-b. Null past 5,000 rows: it is quadratic. */
  kendall(a: string, b: string): number | null;
  /** A quantile of one column weighted by another; the median by default. */
  weightedQuantile(colId: string, weightId: string, p?: number): number | null;
  /**
   * Process capability against the column's `spec`, with control limits and the
   * Western Electric rule breaks. `baseline` fixes the limits over the first N
   * readings, which is how a shift is found rather than hidden by the limits it
   * widened.
   */
  capability(colId: string, opts?: {
    lower?: number; upper?: number; target?: number; by?: string; baseline?: number;
  }): ProcessCapability | null;
  /**
   * How a column varies along an ordering. `by` is required and never guessed —
   * kernels see rows in the order they arrived, which is not the grid's sort.
   */
  series(colId: string, opts: { by: string; periodsPerYear?: number }): SeriesStats | null;
  /** A weighted average of one column by another. */
  weightedAverage(colId: string, weightId: string): number | null;
  /** The key a row's data resolves to. */
  keyOf(data: unknown): string | null;
  /** Which reductions can be maintained against a change, and which rescan. */
  readonly maintenance: Readonly<Record<string, 'maintained' | 'rescan'>>;
}

export type ShadowKind =
  | 'updates' | 'updatedAt' | 'sinceUpdate' | 'delta' | 'deltaPercent'
  | 'rate' | 'history' | 'firstValue' | 'streak'
  /** Where the row sits among the others, over every tracked row. */
  | 'rank' | 'rankAsc' | 'rankChange' | 'percentile' | 'quartile'
  | 'zScore' | 'shareOfTotal';

export interface RegressionFit {
  slope: number;
  intercept: number;
  /** The square of Pearson's r: how much of the response the fit accounts for. */
  r2: number;
  /** Standard error of the slope, which is what says it differs from zero. */
  stdError: number;
  /** Pairs that survived pairwise deletion, not rows scanned. */
  n: number;
}

export interface ProcessCapability {
  n: number;
  mean: number;
  lower: number | null;
  upper: number | null;
  target: number | null;
  /** Short-term variation, from the moving range: what Cp and Cpk use. */
  sigmaWithin: number | null;
  /** Overall variation: what Pp and Ppk use. */
  sigmaOverall: number | null;
  /** Potential capability. Null for a one-sided specification. */
  cp: number | null;
  /** Capability allowing for where the process is centred. */
  cpk: number | null;
  /** Cp over the overall spread — what the process actually delivered. */
  pp: number | null;
  /** Cpk over the overall spread. Well below Cpk means the process drifted. */
  ppk: number | null;
  outOfSpec: number;
  defectRate: number | null;
  /** Three sigma either side of the process mean, from the moving range. */
  limits: { centre: number; upper: number; lower: number; sigma: number } | null;
  /** How many leading readings set the limits. */
  baseline?: number;
  violations: { index: number; rule: number; description: string }[];
}

export interface SeriesStats {
  n: number;
  first: number;
  last: number;
  change: number;
  changePercent: number | null;
  /** Standard deviation of period-on-period returns. */
  volatility: number | null;
  /** The same, times the root of `periodsPerYear`; null unless one was given. */
  annualisedVolatility: number | null;
  /** Compound growth per period, annualised when `periodsPerYear` is given. */
  growth: number | null;
  /** The largest peak-to-trough fall, as a fraction. */
  maxDrawdown: number | null;
  maxDrawdownFrom: number;
  maxDrawdownTo: number;
  /** Lag-1: positive is momentum, negative is mean reversion. */
  autocorrelation: number | null;
  upDays: number;
  downDays: number;
}

export interface ColumnProfile {
  column: string;
  rows: number;
  present: number;
  missing: number;
  distinct: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
  q1: number | null;
  q3: number | null;
  iqr: number | null;
  stddev: number | null;
  outliers: number;
  histogram: HistogramBin[];
}

export interface HistogramBin {
  from: number;
  to: number;
  count: number;
}

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
  /** Re-derive the thresholds of distribution rules from the data as it stands. */
  restat(): void;
  /** The five numbers a distribution rule resolves against for one column. */
  distribution(colId: string): ColumnDistribution | null;
}

/** Operators that resolve against the column's own distribution (spec 8.12). */
export type DistributionOp =
  | 'topPercent' | 'bottomPercent' | 'topN' | 'bottomN'
  | 'aboveMean' | 'belowMean' | 'aboveMedian' | 'belowMedian'
  | 'zAbove' | 'zBelow' | 'outlier';

export interface ColumnDistribution {
  n: number;
  min: number;
  max: number;
  mean: number;
  stddev: number;
  median: number;
  q1: number;
  q3: number;
  iqr: number;
  sorted: number[];
}

// ---------------------------------------------------------------------------
// Events (spec 18.4)
// ---------------------------------------------------------------------------

/**
 * Every event the grid emits.
 *
 * Complete, and checked against the runtime by `tools/check.js` — an `emit()`
 * call with no entry here fails the build. It was not complete before: fifty-one
 * events were emitted and undeclared, so subscribing to any of them from
 * TypeScript was a compile error on an event the grid genuinely raises.
 *
 * Grouped by the subsystem that raises them, which is also how the reference
 * lists them.
 */
export type EventName =
  /* Lifecycle */
  | 'ready' | 'destroy' | 'render:first' | 'render:done' | 'config:changed'
  | 'licence:changed' | 'environment:changed'
  /* Data */
  | 'model:changed' | 'rows:changed' | 'rows:queued' | 'rows:deferred'
  | 'rows:paused' | 'rows:resumed' | 'row:received' | 'row:sent' | 'row:copied'
  | 'row:moved' | 'source:error' | 'stream:chunk' | 'stream:end' | 'stream:evicted'
  /* Cells and editing */
  | 'cell:changed' | 'cell:pending' | 'cell:confirmed' | 'cell:reverted'
  | 'cell:clicked' | 'cell:dblclicked' | 'cell:contextmenu'
  | 'cell:edit:start' | 'cell:edit:end' | 'row:edit:start' | 'row:edit:end'
  | 'row:clicked' | 'row:dblclicked'
  | 'form:opened' | 'form:closed' | 'form:saved' | 'form:error'
  /* Query */
  | 'sort:changed' | 'filter:changed' | 'group:toggled'
  | 'facet:computed' | 'facet:filtered' | 'facet:expanded' | 'facet:failed'
  /* Columns */
  | 'column:moved' | 'column:resized' | 'column:visible' | 'column:pinned'
  | 'column:grouped' | 'column:pivoted' | 'column:filter:open' | 'column:menu:open'
  | 'columns:changed' | 'columns:tagged' | 'header:contextmenu'
  /* Selection and view */
  | 'selection:changed' | 'range:changed' | 'clipboard:copy'
  | 'page:changed' | 'scroll' | 'scroll:end' | 'size:changed'
  | 'detail:toggled' | 'toolpanel:focus' | 'highlight:changed'
  /* Tree data */
  | 'tree:loading' | 'tree:loaded' | 'tree:loadFailed' | 'tree:loadAborted'
  /* State, history and views */
  | 'state:changed' | 'state:reset' | 'history:changed' | 'history:applied'
  | 'views:changed' | 'view:applied' | 'view:saved' | 'view:removed'
  | 'view:renamed' | 'view:default'
  /* Formatting and presentation */
  | 'formatting:changed' | 'redaction:changed' | 'permissions:changed'
  | 'presentation:changed' | 'presentation:ended' | 'presentation:view'
  | 'presentation:scale' | 'presentation:spotlight' | 'presentation:captured'
  /* Collaboration */
  | 'comment:added' | 'comment:edited' | 'comment:deleted' | 'comment:failed'
  | 'comment:threadOpened' | 'comment:threadClosed' | 'comment:indexLoaded'
  | 'presence:published' | 'presence:left' | 'presence:failed' | 'presence:lockRefused'
  /* Comparison and time */
  | 'diff:changed' | 'diff:swapped'
  | 'timeline:attached' | 'timeline:detached' | 'timeline:seek' | 'timeline:seeking'
  /* Export */
  | 'export:progress'
  /* Every event at once, for logging and debugging. */
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
  /**
   * Move a row to another position in the data. Refuses, with a
   * reason, while a sort, filter or grouping is active.
   */
  move(key: string, to: number): { moved: boolean; from: number; to: number; reason?: string };
  /**
   * The group headings enclosing a display row, outermost first. Empty when the
   * grid is not grouped.
   */
  groupHeadings(index: number): Row[];
  expand(key: string, deep?: boolean): void;
  collapse(key: string): void;
  expandAll(): void;
  collapseAll(): void;
}

export interface ColumnsApi {
  /** Set or clear a column's totals-row reduction. */
  setTotal(id: string, fn: TotalName | TotalFn | null): void;
  /** Every distinct value in a column, from the dictionary where there is one. */
  distinct(id: string): unknown[];
  get(id: string): ResolvedColumn | undefined;
  all(): ResolvedColumn[];
  visible(): ResolvedColumn[];
  state(): ColumnState[];
  apply(state: ColumnState[]): void;
  /** Every distinct column tag, in the order first declared. */
  tags(): string[];
  /**
   * Show only the columns carrying one of these tags. **Columns with no tags
   * are never hidden.** Pass nothing to show every tagged column again.
   * Returns the ids that were hidden.
   */
  showTagged(tags?: string | string[] | null): string[];
  /** The tags currently being shown, empty when all are. */
  activeTags(): string[];
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

export interface RowFormApi {
  /** Open the form for a row. False when the form is not configured. */
  open(key: string): boolean;
  close(): void;
  save(): boolean;
  isOpen(): boolean;
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
  /** Drop every range, leaving the row and cell selection alone. */
  clearRange(): void;
  /**
   * Everything worth knowing about the selected cells — what `summary()`
   * reports plus median, quartiles, deviation, distinct and outliers. Over the
   * cells rather than a column, so a rectangle spanning three columns is one
   * set of numbers. Null with nothing selected.
   */
  statistics(): object | null;
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
  /** The quick filter's text and match mode, for restoring a control. */
  quickState(): { text: string; mode: string };
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
  /**
   * A row key, or a display index. A key survives a sort and is usually what a
   * caller holds; resolving one scans the display order, so prefer an index
   * when scrolling a very large grid repeatedly.
   */
  toRow(row: string | number, align?: 'start' | 'center' | 'end' | 'auto'): void;
  toColumn(id: string): void;
  /** Scroll a cell into view, both axes in one call. */
  toCell(row: string | number, colId: string, align?: 'start' | 'center' | 'end' | 'auto'): void;
  position(): { top: number; left: number };
  /** `left` is the logical offset, zero at the content's start in either direction. */
  to(at: { top?: number; left?: number }): void;
}

export interface ExportApi {
  /** The selected range as tab-separated text, the shape a spreadsheet pastes. */
  rangeText(opts?: object): string;
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
  /** Exchange the baseline and the current rows. Returns false with nothing to swap. */
  swap(): boolean;
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

/**
 * The resolved message set for a grid: every user-visible string, in the
 * grid's locale.
 */
export interface MessagesApi {
  /**
   * Format a message.
   * @param key a key from `keys`
   * @param params interpolation parameters; `count` selects the plural form
   */
  t(key: string, params?: Record<string, unknown>): string;
  /** Join parts the way this locale joins lists. */
  list(items: string[], type?: 'conjunction' | 'disjunction'): string;
  /** Format a number for this locale. */
  number(value: number, opts?: Intl.NumberFormatOptions): string;
  /** The resolved BCP 47 tag. */
  readonly locale: string;
  /** Every key the catalogue defines. */
  readonly keys: ReadonlyArray<string>;
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

/** What `fullWidth.render` is handed. */
export interface FullWidthParams {
  row: Row;
  /** Your original row object. */
  data: unknown;
  /** Display index of the row. */
  index: number;
  grid: Grid;
  /** The element to fill. Write into it directly, or return content instead. */
  element: HTMLElement;
}

/** What a column menu's item builder and its actions are handed. */
export interface ColumnMenuParams {
  colId: string;
  /** The resolved column, including any properties you defined on it. */
  column: ResolvedColumn;
  grid: Grid;
}

/** The rail's built-in action names, plus `'-'` for a divider. */
export type RailActionName =
  | 'undo' | 'redo' | 'pause' | 'restore' | 'maximise'
  | 'export' | 'excel' | 'clipboard' | 'print';

/** What a host rail action's `run` is handed. */
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
  readonly messages: MessagesApi;
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
  readonly statistics: StatisticsApi;
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

  /**
   * Pin rows above or below the scrolling body.
   *
   * The rows render through the ordinary column pipeline but are not part of
   * the data: not counted, sorted, filtered, grouped, selectable or exported.
   *
   * Pass a new array rather than mutating the one you passed before — array
   * identity is how the grid knows the pinned rows have changed.
   */
  setPinnedRows(rows: unknown[], opts?: { edge?: 'top' | 'bottom' }): void;

  /** The objects currently pinned at one edge, as a copy. */
  getPinnedRows(opts?: { edge?: 'top' | 'bottom' }): unknown[];

  /** The row form. Declines when `rowForm` is not configured. */
  readonly form: RowFormApi;

  getVersion(): string;
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

/** One unit descriptor: a symbol and how many base quantities it is worth. */
export interface UnitDescriptor {
  symbol: string;
  factor: number;
  aliases: readonly string[];
  binary: boolean;
  prefix: string | null;
  auto: boolean;
}

/** How a column stores, parses and renders a quantity. */
export interface UnitConfig {
  system?: string;
  unit?: string;
  binary?: boolean;
  decimals?: number;
  minDecimals?: number;
  maxDecimals?: number;
  display?: string;
  locale?: string;
  group?: boolean;
  space?: string;
  placement?: 'suffix' | 'prefix';
}

export function defineUnit(
  symbol: string,
  factor: number,
  aliases?: readonly string[],
  opts?: { binary?: boolean; prefix?: string; auto?: boolean },
): UnitDescriptor;
/** Registers a system of your own. Throws rather than shadowing an existing name. */
export function registerUnitSystem(name: string, units: readonly UnitDescriptor[]): string;
export function createUnitType(config?: UnitConfig): DataType;
export function parseUnit(text: string | number, opts?: UnitConfig): number | null;
export function formatUnit(value: number | null | undefined, opts?: UnitConfig): string;
export const UNIT_SYSTEMS: Record<string, readonly UnitDescriptor[]>;

/** How a statistic block finds the number it reports. */
export interface StatValueSpec {
  /** The column to reduce, as a field name or a dotted path. Omit for `count`. */
  of?: string;
  /** A key of `TOTAL_FNS` — `sum`, `avg`, `median`, `p95`, `gini` and the rest. */
  fn?: TotalName;
  /**
   * Report this column from the row holding the extreme, rather than the
   * extreme itself: `{ of: 'sales', fn: 'max', show: 'rep' }` is the *name* of
   * the best rep. Needs `min` or `max` — no single row holds an average.
   */
  show?: string;
}

/**
 * A statistic block: a label, a value, its change, and what it is compared with.
 *
 * Reads the grid, so it cannot disagree with the table beneath it, and formats
 * through the column's own type, so the tile and the table cannot drift.
 */
export interface StatConfig extends StatValueSpec {
  grid?: Grid;
  /** An element, or a CSS selector resolved against the grid's document. */
  container: HTMLElement | string;
  title?: string;
  /** A literal value, a spec to reduce, or a function of the grid. */
  value?: unknown | StatValueSpec | ((grid: Grid) => unknown);
  /** Text under the value, or a function of it. */
  footer?: string | ((value: unknown, grid: Grid) => string);
  /** What the value is compared against, for the change indicator. */
  baseline?: number | ((grid: Grid) => number);
  /** Whether a rise is good news. `up` by default. */
  goodWhen?: 'up' | 'down' | 'neither';
  /** Which rows feed the value. `filtered` by default. */
  scope?: 'filtered' | 'all' | 'selected';
  /** `false` stops the tile following the grid; `refresh()` still works. */
  live?: boolean;
  /** Override the formatting the column's type would apply. */
  format?: (value: unknown, grid: Grid) => string;
  /** Shown when there is no value. `—` by default. */
  empty?: string;
  /** Fraction digits for a value whose reduction changed the unit. 2 by default. */
  decimals?: number;
  /** Extra class names for the tile's root. */
  class?: string;
}

/** The handle `createStat` returns. */
export interface Stat {
  element(): HTMLElement | null;
  value(): unknown;
  refresh(): void;
  destroy(): void;
}

export function createStat(config: StatConfig): Stat;
export function deltaOf(value: number | null, baseline: number | null):
  { direction: 'up' | 'down' | 'flat'; change: number | null; percent: number | null };
export function toneOf(direction: string, goodWhen: string): 'good' | 'bad' | 'flat';

export function createGrid(element: HTMLElement, config?: GridConfig): Grid;
export function createHeadlessGrid(config?: GridConfig): Grid;
export function registerModules(modules: GridModule[], opts?: { licence?: string }): void;
export function setLicence(licence: string): LicenceInfo;

/**
 * American spellings of the licence functions, exported alongside the British
 * ones because a host that writes `license` everywhere else should not have to
 * remember which spelling this one API uses.
 */
export const setLicense: typeof setLicence;
export function licenceInfo(): LicenceInfo;
export const licenseInfo: typeof licenceInfo;
export function licenceState(): LicenceInfo;
export const licenseState: typeof licenceState;

/**
 * Compile a formatting rule list into a style function.
 *
 * `stats` supplies the column summary the distribution operators need — the
 * top decile, the outliers, two deviations from the mean. Without it those
 * rules cannot be answered and are skipped.
 */
export function compileRules(
  rules: FormattingRule[],
  stats?: object | null,
): (p: CellParams) => CellStyle | null;

/**
 * Browser-storage backing for saved views.
 *
 * Returns null where no usable storage exists — a private window, or a browser
 * with site data blocked — so a caller can fall back rather than throw.
 */
export function createLocalViewStorage(opts?: {
  key?: string;
  storage?: { getItem: Function; setItem: Function };
}): { read(): object[] | null; write(views: object[]): void } | null;

/** Build a data type for hexadecimal, binary or octal values. */
export function createRadixType(config?: object | string): DataType;

/** Build a column store from row objects, off the main thread where available. */
export function ingest(
  rows: unknown[],
  plan?: object,
  opts?: object,
): Promise<{ store: object; schema: object[]; decisions: object[] }>;
/** The synchronous form of {@link ingest}. */
export function ingestSync(
  rows: unknown[],
  plan?: object,
  opts?: object,
): { store: object; schema: object[]; decisions: object[] };

/** Mount one tool panel into an element of your own, outside the grid's rail. */
export function mountPanel(opts: {
  grid: Grid;
  panel: string | Function;
  container: Element;
}): { element: HTMLElement; refresh(): void; destroy(): void };

/** The column names a compiled formula reads, deduplicated. */
export function referencesOf(node: object): string[];

/** The right-click menu, for a host that drives it directly. */
export class ContextMenu {
  constructor(opts?: object);
  open(p: object): void;
  close(): void;
  destroy(): void;
}
export function version(): string;

export const LatticeGrid: {
  createGrid: typeof createGrid;
  createHeadlessGrid: typeof createHeadlessGrid;
  registerModules: typeof registerModules;
  setLicence: typeof setLicence;
  version: typeof version;
  createUnitType: typeof createUnitType;
  registerUnitSystem: typeof registerUnitSystem;
  defineUnit: typeof defineUnit;
  parseUnit: typeof parseUnit;
  formatUnit: typeof formatUnit;
  UNIT_SYSTEMS: typeof UNIT_SYSTEMS;
};

export default LatticeGrid;

/** The default British English catalogue. */
export const EN_GB: Record<string, string | Record<string, string>>;
/** Every key the default catalogue defines. */
export const MESSAGE_KEYS: ReadonlyArray<string>;
/** The locale the default catalogue is written in: 'en-GB'. */
export const DEFAULT_LOCALE: string;
/** Bundled catalogues, keyed by lower-cased BCP 47 tag. */
export const LOCALES: Record<string, Record<string, string | Record<string, string>>>;
export const EN_US: Record<string, string | Record<string, string>>;
export const FR_FR: Record<string, string | Record<string, string>>;
export const FR_CA: Record<string, string | Record<string, string>>;
export const IT_IT: Record<string, string | Record<string, string>>;
export const ES_ES: Record<string, string | Record<string, string>>;
export const PT_BR: Record<string, string | Record<string, string>>;
export const DE_DE: Record<string, string | Record<string, string>>;
export const NL_NL: Record<string, string | Record<string, string>>;
export const SV_SE: Record<string, string | Record<string, string>>;
export const DA_DK: Record<string, string | Record<string, string>>;
export const NB_NO: Record<string, string | Record<string, string>>;
export const FI_FI: Record<string, string | Record<string, string>>;
export const PL_PL: Record<string, string | Record<string, string>>;
export const CS_CZ: Record<string, string | Record<string, string>>;
export const HU_HU: Record<string, string | Record<string, string>>;
export const RO_RO: Record<string, string | Record<string, string>>;
export const UK_UA: Record<string, string | Record<string, string>>;
export const EL_GR: Record<string, string | Record<string, string>>;
export const JA_JP: Record<string, string | Record<string, string>>;
export const AR: Record<string, string | Record<string, string>>;
/**
 * Alias for {@link AR}. The Arabic catalogue is pan-Arabic rather than
 * Saudi-specific; the alias exists because the region-qualified name is the
 * common first guess, every other catalogue carrying one.
 */
export const AR_SA: Record<string, string | Record<string, string>>;

/** A resolved message set. */
export class Messages implements MessagesApi {
  constructor(opts?: { locale?: string; messages?: Record<string, unknown>; declared?: string });
  configure(opts?: { locale?: string; messages?: Record<string, unknown>; declared?: string }): void;
  t(key: string, params?: Record<string, unknown>): string;
  list(items: string[], type?: 'conjunction' | 'disjunction'): string;
  number(value: number, opts?: Intl.NumberFormatOptions): string;
  readonly locale: string;
  readonly keys: ReadonlyArray<string>;
}

/** Build a message set, passing an existing instance straight through. */
export function createMessages(opts?: object | Messages): Messages;
/** Report which keys a catalogue is missing and which it invents. */
export function auditCatalogue(catalogue: Record<string, unknown>): { missing: string[]; unknown: string[] };
/** Join parts the way a locale joins lists. */
export function formatList(items: string[], locale?: string, type?: 'conjunction' | 'disjunction'): string;
/** Resolve the locale: what was configured, then the document's `lang`, then the default. */
export function resolveLocale(configured: string | undefined, declared?: string, fallback?: string): string;
/** Find the catalogue for a tag, falling back to the base language. */
export function resolveCatalogue(tag?: string): Record<string, unknown> | null;

// ---------------------------------------------------------------------------
// The optional modules (spec 20)
// ---------------------------------------------------------------------------

/**
 * Declarations for everything under `lattice-grid/modules/`.
 *
 * The package exports these subpaths at runtime but declared none of them, so a
 * TypeScript caller importing the React adapter — or any other module — got an
 * implicit `any` and, under `strict`, an error. The grid advertises complete
 * declarations; these are the rest of them.
 *
 * Each module is declared where its subpath resolves. The `./modules/*` export
 * carries a `types` condition pointing back at this file, which is what lets
 * these blocks be found at all.
 */

/** One of the thirty chart types `createChart` accepts. */
export type ChartType =
  | 'line' | 'step' | 'area' | 'rangeArea'
  | 'bar' | 'horizontalBar' | 'waterfall'
  | 'scatter' | 'bubble'
  | 'combo' | 'pareto'
  | 'histogram' | 'boxplot' | 'heatmap'
  | 'pie' | 'donut' | 'sunburst' | 'treemap'
  | 'radar' | 'gauge' | 'funnel' | 'candlestick' | 'geomap'
  | 'sankey' | 'chord' | 'network' | 'stream' | 'marimekko' | 'violin' | 'gantt';

/** A measure a chart reduces, when the chart is not given a bare `y`. */
export interface ChartMeasure {
  col: string;
  /** A reduction name, as the totals row uses. */
  fn?: TotalName;
  /** The mark this measure draws with, on a combo chart. */
  type?: 'bar' | 'line' | 'area';
  /** Which axis it belongs to, on a combo chart. */
  axis?: 'left' | 'right';
  title?: string;
}

/** Data labels beside each mark. */
export interface ChartLabels {
  position?: 'outside' | 'inside' | 'auto';
  /** A format mask, or a function of the value. */
  format?: string | ((value: unknown, point?: unknown) => string);
  /** Pixels two labels must leave between them before both are kept. */
  minGap?: number;
}

/**
 * What a chart draws and how.
 *
 * `grid` and `container` are required; everything else describes the chart.
 * A chart reads the grid's *filtered* rows, so it follows the grid without
 * being told to.
 */
export interface ChartSpec {
  grid: Grid;
  container: Element | string;
  type: ChartType;
  /** The category column. */
  x?: string;
  /** The measure column, for the types that take one. */
  y?: string;
  /** Splits the measure into one series per distinct value. */
  series?: string;
  /** Several measures at once, for combo and candlestick. */
  measures?: ChartMeasure[];
  /** Endpoints, for sankey, chord and network. */
  source?: string;
  target?: string;
  /** Row label and dates, for gantt. */
  label?: string;
  start?: string;
  end?: string;
  title?: string;
  /** A named scheme, or an array of colours. */
  scheme?: string | string[];
  legend?: boolean | { position?: 'top' | 'bottom' | 'left' | 'right'; isolate?: boolean };
  labels?: boolean | ChartLabels;
  axis?: object;
  font?: object;
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
  /** Horizontal reference lines. */
  reference?: { value: number; label?: string }[];
  /** Bins for a histogram; the default is twelve. */
  buckets?: number;
  /** A diverging colour ramp, for heatmap and geomap. */
  diverging?: boolean;
  /** Country outlines, for a geomap drawing countries rather than continents. */
  shapes?: unknown;
  codeProperty?: string;
  /** One chart per distinct value of this column. */
  multiples?: string;
  /** Draw to canvas past this many points. */
  canvas?: boolean | number;
  downsample?: number;
  emptyText?: string;
}

/**
 * The events a chart raises.
 *
 * A chart's own, not the grid's: `grid.on` takes {@link EventName} and knows
 * nothing about these. `point:click` is the one most callers want — it is how a
 * click on a mark becomes a filter on the grid.
 */
export type ChartEventName =
  | 'click' | 'hover' | 'leave' | 'focus'
  | 'draw' | 'drill' | 'brush' | 'legend';

/** A live chart. */
export interface Chart {
  readonly element: SVGElement;
  /** Redraw now. */
  draw(): void;
  /** Change the spec and redraw; unnamed keys keep their values. */
  update(spec: Partial<ChartSpec>): void;
  /** The data the chart last bound. */
  data(): object | null;
  /** Go up one level, on a drillable hierarchy. */
  ascend(levels?: number): void;
  on(event: ChartEventName, handler: (payload: unknown) => void): () => void;
  emit(event: ChartEventName, payload?: unknown): void;
  toSVG(opts?: object): string;
  toPNG(opts?: { scale?: number; background?: string }): Promise<Blob>;
  toCSV(): string;
  destroy(): void;
}

declare module 'lattice-grid/modules/charts' {
  /** Every type name `createChart` accepts. */
  export const TYPES: readonly ChartType[];
  /** The built-in colour schemes, by name. */
  export const SCHEMES: Readonly<Record<string, readonly string[]>>;
  export const PALETTE: readonly string[];
  export function createChart(spec: ChartSpec): Chart;
  export function registerScheme(name: string, colours: readonly string[]): void;
  export function resolveScheme(spec?: object): object;
  export function schemeNames(): string[];
  export function setDefaultScheme(name: string): void;
  export { Chart };
}

declare module 'lattice-grid/modules/react' {
  /**
   * Build the React component.
   *
   * A factory rather than a component, because the adapter imports neither
   * React nor the grid — you pass both in. That is what keeps the package's
   * promise of no runtime dependencies, and what stops an adapter disagreeing
   * with the grid version already loaded.
   */
  export function createLatticeGrid(deps: { React: unknown; createGrid: unknown }): unknown;
  /** Every grid event, as the prop name a React caller writes. */
  export const EVENT_NAMES: readonly string[];
  export function handlerName(event: string): string;
  export default createLatticeGrid;
}

declare module 'lattice-grid/modules/vue' {
  export function createLatticeGrid(deps: { Vue?: unknown; createGrid: unknown }): unknown;
  export const EVENT_NAMES: readonly string[];
  export function dashedName(event: string): string;
  export default createLatticeGrid;
}

declare module 'lattice-grid/modules/svelte' {
  /** A Svelte action: `use:lattice={config}`. */
  export function createLatticeAction(deps: { createGrid: unknown }): unknown;
  export const EVENT_NAMES: readonly string[];
  export function dashedName(event: string): string;
  export default createLatticeAction;
}

declare module 'lattice-grid/modules/webcomponent' {
  /**
   * Register `<lattice-grid>`.
   *
   * This module carries the grid inside it. Use it *or* `createGrid` in one
   * page, never both: two copies keep separate registries, and a renderer
   * registered through one will not appear in the other.
   */
  export function defineLatticeGrid(tag?: string): void;
  export function createLatticeGridElement(deps?: object): unknown;
  export const TAG_NAME: string;
  export const EVENT_PREFIX: string;
  export const ATTRIBUTE_CONFIG: Readonly<Record<string, unknown>>;
  export function observedAttributeNames(): string[];
  export function domEventName(event: string): string;
  export class GridElementController {}
  export default defineLatticeGrid;
}

declare module 'lattice-grid/modules/htmx' {
  /**
   * The htmx integration, which re-exports the base API alongside its own —
   * a page using it imports this and never the base package as well.
   */
  export function createGrid(element: Element, config: GridConfig): Grid;
  export function autoInit(root?: ParentNode): Grid[];
  export function attach(element: Element, config?: GridConfig): Grid;
  export function initWithin(root: ParentNode): Grid[];
  export function destroyWithin(root: ParentNode): void;
  export function gridElementsWithin(root: ParentNode): Element[];
  export function hydrateTable(table: Element, config?: GridConfig): Grid;
  export function readTable(table: Element): { columns: Column[]; rows: unknown[] };
  export function rowsFromFragment(fragment: ParentNode): unknown[];
  export function rowsFromJson(text: string): unknown[];
  export function ingestResponse(grid: Grid, response: unknown): void;
  export function driveServerMode(grid: Grid, opts?: object): () => void;
  export function driveInfiniteScroll(grid: Grid, opts?: object): () => void;
  export function driveOobUpdates(grid: Grid, opts?: object): () => void;
  export function serialiseState(grid: Grid): string;
  export function restoreState(grid: Grid, state: string): void;
  export function saveStateWithin(root: ParentNode): void;
  export function restoreStateWithin(root: ParentNode): void;
  export function queryParams(grid: Grid): Record<string, string>;
  export function warnIfLargeHtmlPayload(rows: number): void;
  export const QUERY_CHANGED_EVENT: string;
  export const SCROLL_NEAR_END_EVENT: string;
  export const HTML_ROW_WARNING_THRESHOLD: number;
}

declare module 'lattice-grid/modules/dhtmlx-compat' {
  /** A dhtmlx Grid-shaped API over Lattice, for migrating a piece at a time. */
  export class Grid {
    constructor(container: Element | string, config?: object);
  }
  export default Grid;
}

declare module 'lattice-grid/modules/devtools' {
  /**
   * The devtools panel, including the accessibility checks.
   *
   * The grid is handed in rather than imported: a module may depend on nothing
   * in core, or the bundler inlines the whole grid into it.
   */
  export function createDevtools(opts: { grid: Grid; container?: Element }): {
    element: Element;
    refresh(): void;
    destroy(): void;
  };
  export function expose(grid: Grid, name?: string): void;
  export const CONSOLE_ACTIVATION: string;
  export default createDevtools;
}
