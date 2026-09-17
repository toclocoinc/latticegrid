/*!
 * Lattice Grid 1.63.0, type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * Lattice Grid: public type declarations.
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
  // Extended catalogue. Never inferred, a column asks for these by name.
  | 'time' | 'datetime' | 'duration' | 'timestamp'
  | 'ipv4' | 'ipv6' | 'cidr'
  | 'json' | 'secret'
  | 'hex' | 'hex8' | 'hex16' | 'hex32' | 'binary' | 'binary8' | 'octal'
  | 'decibel' | 'decibelAmplitude' | 'ratio' | 'percentRate'
  // Units: computing
  | 'bytes' | 'megabytes' | 'gigabytes' | 'bitrate' | 'gigabits'
  // Units: physical
  | 'metres' | 'millimetres' | 'kilometres'
  | 'grams' | 'kilograms' | 'tonnes'
  | 'seconds' | 'milliseconds' | 'hours'
  // Units: engineering
  | 'speed' | 'kph' | 'mph' | 'knots' | 'acceleration'
  | 'area' | 'hectares' | 'volume' | 'cubicMetres'
  | 'energy' | 'kilowattHours' | 'power' | 'kilowatts' | 'force'
  | 'pressure' | 'bar' | 'psi' | 'torque' | 'density'
  | 'flow' | 'litresPerMinute' | 'radians' | 'degrees'
  // Units: electrical and scientific
  | 'voltage' | 'current' | 'resistance' | 'capacitance' | 'inductance'
  | 'charge' | 'conductance' | 'fluxDensity' | 'luminousFlux' | 'illuminance'
  | 'substance' | 'absorbedDose' | 'equivalentDose' | 'radioactivity' | 'frequency'
  | 'luminousIntensity' | 'doseRate'
  // Units: rate, ratio and process
  | 'rpm' | 'angularVelocity' | 'ppm' | 'ppb' | 'basisPoints'
  | 'molarity' | 'massFlow' | 'tonnesPerHour'
  | 'viscosity' | 'kinematicViscosity' | 'thermalConductivity' | 'specificHeat'
  // Temperature, which is affine rather than multiplicative
  | 'celsius' | 'fahrenheit' | 'kelvin'
  // Currency, whose "factor" is a moving exchange rate, so it carries an amount
  // and a code rather than joining the fixed-factor unit factory.
  | 'currency' | 'usd' | 'eur' | 'gbp' | 'jpy'
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
 * Vertical alignment of a cell's content within its row (BACKLOG-0000989).
 *
 * The vertical counterpart to {@link Align}. `top` sits the content at the top
 * of the row, `middle` centres it and `bottom` drops it to the bottom. It is
 * most visible on tall or `autoHeight` rows, where a wrapped-text column can be
 * `top` while its single-line neighbours are `middle`.
 */
export type VAlign = 'top' | 'middle' | 'bottom';
/**
 * How the grid's scroll viewport draws its scrollbars (BACKLOG-0000990,
 * BACKLOG-0001288).
 *
 * `auto` is the platform's native behaviour — overlay scrollbars fade away when
 * idle. `always` keeps that native bar shown whether or not the pointer is over
 * the grid, so the affordance never disappears on a touchpad or an overlay OS.
 * `custom` replaces it with a bar the grid draws itself: the same size, colour
 * and hit area in every browser, sized by the `--lattice-scrollbar-*` tokens,
 * for a target bigger than the platform's own thin overlay ribbon.
 */
export type ScrollbarMode = 'auto' | 'always' | 'custom';
/**
 * A named preset, or a raw scale where 1 is `standard`. Row heights are
 * 23.8 / 28 / 42 / 56px for the four presets; a number scales 28px.
 */
export type Density = 'compact' | 'standard' | 'comfortable' | 'spacious' | number;
/**
 * A shipped theme, or your own name, the value is written to `data-theme` on
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
  /** What identifies the row. Selection, expansion and edits are all keyed on it. */
  key: string;
  /** The object you supplied. Null on a group heading, which is a product of the grouping rather than a record. */
  data: unknown | null;
  /** Depth in a tree or a grouping. Zero at the top. */
  level: number;
  /** The row above it in a tree or grouping, or null at the top. */
  parent: Row | null;
  /** Every child, before filtering. */
  children?: Row[];
  /** The children the filters left. */
  filteredChildren?: Row[];
  /** The children in display order. */
  sortedChildren?: Row[];
  /** Whether this is a group heading rather than a record. A heading carries no data and must be skipped when totalling. */
  group: boolean;
  /** Whether its children are showing. */
  expanded: boolean;
  /** How many records sit beneath it, at any depth. */
  leafCount: number;
  /** The group's own reductions, by column id. */
  totals?: Record<string, unknown>;
  /** Whether this row is the expanded detail panel of the one above. */
  detail?: boolean;
  /** Whether this row has a detail panel. */
  master?: boolean;
  /** The row's height in pixels, as measured or configured. */
  height: number;
  /** Position in the display order, or null when off screen. */
  index: number | null;
  /** Selection state. `partial` is a group some but not all of whose children are selected. */
  selected: boolean | 'partial';
  /** Physical index into the ColumnStore. Null for synthetic rows. */
  physical?: number | null;
  /** Group rows only: the column id this level groups on, and the group value. */
  groupColumn?: string;
  /** The value this group heading stands for. */
  groupValue?: unknown;
  /** Stable path of group keys from root to this row. */
  groupPath?: string[];
  /** Whether children exist, which a lazily loaded tree knows before it has them. */
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
   * `unknown-id`, no row with that key. `duplicate-id`, a row with that key
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
  /**
   * Format a message from the grid's catalogue, for a renderer that wants its
   * own accessible names and labels localised rather than hard-coded (§17,
   * WCAG 4.1.2). The built-in renderers use this; a custom renderer may too.
   * Optional: absent when a renderer is exercised without a grid to ask.
   */
  t?: (key: string, vars?: Record<string, unknown>) => string;
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
  /**
   * Show a leading `+` on a positive value (`+5`, `+£5.00`, `+12%`). A
   * negative value keeps whatever `negative` says regardless of this flag,
   * and zero shows no sign either way (BACKLOG-0001095). Off by default.
   */
  signed?: boolean;
  prefix?: string;
  suffix?: string;
  zeroDisplay?: string;
  nullDisplay?: string;
  /** The locale for number, date and text formatting. The page's by default. */
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
  /** A glyph name from the icon registry (see {@link IconName}), shown before the label. */
  icon?: IconName;
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

/**
 * A glyph name from the icon sprite registry (`packages/dom/src/cell/icons.js`).
 *
 * The union below is every built-in name, generated from `iconNames()` so an
 * editor can autocomplete and typo-check them — see
 * `test/icon-name-type-drift.test.js`, which fails if this list and the
 * registry ever disagree. It is deliberately **not closed**: the registry is
 * extensible at runtime via `registerIcon`, `registerIcons`, `config.icons` and
 * `grid.icons`, and `(string & {})` widens the type so a custom registered name
 * still typechecks without losing autocomplete on the built-ins. A name the
 * registry has never heard of — built-in or custom — draws a blank glyph and
 * warns once at runtime; it is not a type error.
 */
export type IconName =
  | 'chevronRight' | 'chevronDown' | 'chevronUp' | 'chevronLeft'
  | 'check' | 'dash' | 'close' | 'plus' | 'minus'
  | 'info' | 'success' | 'warning' | 'danger' | 'clock' | 'lock'
  | 'link' | 'external' | 'filter' | 'pause' | 'play' | 'chart' | 'palette'
  | 'undo' | 'redo' | 'columns' | 'download' | 'restore' | 'spreadsheet' | 'print'
  | 'maximise' | 'minimise' | 'views' | 'search' | 'pencil' | 'trash' | 'share'
  | 'pin' | 'sortAsc' | 'sortDesc' | 'menu' | 'drag'
  | 'star' | 'heart' | 'circleFilled' | 'square' | 'bolt' | 'flag'
  | 'arrow' | 'highlight' | 'thumbUp' | 'eye' | 'eyeOff' | 'copy' | 'present'
  | 'blank'
  | (string & {});

/** A built-in threshold icon set, mapping value bands to built-in glyphs. */
export type IconSetName = 'trafficLights' | 'arrows' | 'trafficArrows' | 'ratings' | (string & {});

/**
 * One band of a threshold icon set. A value clears a band when it is at least
 * `min`; the highest band it clears wins. Omit `min` on the last band to make
 * it the catch-all. `label` is what assistive technology announces for the
 * glyph, so a screen-reader user hears the band's meaning, not only the value.
 */
export interface IconBand {
  min?: number;
  /** A glyph name from the icon registry (see {@link IconName}). */
  icon: IconName;
  label?: string;
  variant?: VariantName;
}

export interface DecorationSpec {
  type: DecorationName;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'pill' | 'rounded' | 'square';
  outline?: boolean;
  edge?: boolean;
  position?: 'start' | 'end';
  /**
   * `icon` decoration only: either a single glyph name (see {@link IconName})
   * used for every value, or a value -> glyph name map for exact-value icons.
   * Omit both `name` and `bands` to use `iconSet`/its default instead.
   */
  name?: IconName | Record<string, IconName>;
  /** icon only: a built-in threshold icon set, expanded to `bands`. */
  iconSet?: IconSetName;
  /** icon only: value bands mapped to glyphs, first match by descending `min`. */
  bands?: IconBand[];
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
  | 'checkbox' | 'code' | 'colour' | 'currency' | 'date' | 'datetime' | 'duration'
  | 'iconPicker' | 'ipaddress' | 'multiSelect' | 'number' | 'objectPicker' | 'password'
  | 'radix' | 'rating' | 'segmented' | 'select' | 'slider' | 'temperature' | 'text'
  | 'textarea' | 'time' | 'treeSelect' | 'unit' | (string & {});

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

/**
 * One label/value line in a {@link TooltipSpec}.
 *
 * Both halves are written as text by the grid, whatever they contain.
 */
export interface TooltipRow {
  /** The line's label, drawn on the leading edge. */
  label?: unknown;
  /** The line's value, drawn on the trailing edge. */
  value?: unknown;
}

/**
 * Structured tooltip content the grid renders for you (BACKLOG-0001204): a
 * heading, a list of label/value lines, and a closing note.
 *
 * Every field is written as **text**, never as markup, so a spec built out of
 * row values needs no escaping and cannot become HTML by accident. Return
 * `{ html }` from `render` when markup is genuinely wanted.
 */
export interface TooltipSpec {
  /** A heading for the tooltip. */
  title?: unknown;
  /** Label/value lines, in order. */
  rows?: TooltipRow[];
  /** A closing note under the lines, drawn quieter than them. */
  note?: unknown;
}

/**
 * What a tooltip's `render` and `mount` are given: the same identification
 * `cell:clicked` carries, plus the cell element itself and the grid.
 *
 * Resolved from the DOM at the moment the tooltip opens rather than when the
 * pointer arrived, so a pooled row re-used in between names the row it is
 * showing now.
 */
export interface TooltipParams {
  /** The row under the pointer or the keyboard cursor. */
  row: Row;
  /** That row's key. */
  key: string;
  /** Its display index. */
  index: number;
  /** The column the cell belongs to. */
  colId: string;
  /** The resolved column. */
  column: Column;
  /** The cell's value. */
  value: unknown;
  /** The cell's formatted text. */
  text: string;
  /** The cell element the tooltip is anchored to. */
  cell: HTMLElement;
  /** The grid. */
  grid: Grid;
}

/**
 * A rich, keyboard-accessible tooltip for a column's cells (BACKLOG-0001204) —
 * the object form of `cell.tooltip`, drawn by the grid rather than handed to
 * the browser as a native `title`.
 *
 * Shown after a delay (`tooltip.delay`, 400ms by default) on hover *and* on
 * keyboard focus; the cell points at it with `aria-describedby`; it can be
 * hovered without closing and Escape dismisses it (WCAG 2.2 AA, 1.4.13). It
 * closes on scroll, because rows are pooled and a bubble left open would be
 * anchored to a node that is now showing a different row.
 */
export interface ColumnTooltipSpec {
  /**
   * Produce the content. Four shapes, and the difference between the last two
   * is a security property rather than a style choice:
   *
   * - an **element** — your own DOM, attached as it is;
   * - a **{@link TooltipSpec}** — `{ title, rows, note }`, rendered as text;
   * - **`{ html }`** — the only wrapper that inserts markup, scrubbed of script
   *   the same way `allowUnsafeTemplates` output is;
   * - a **string** — *always* text, never markup.
   *
   * The last rule is what makes `render: (p) => p.value` safe: a value comes
   * from row data, and data must not be able to promote itself to HTML.
   */
  render?: (params: TooltipParams) => HTMLElement | TooltipSpec | { html: string } | string | null | undefined;
  /**
   * Put live content in the tooltip — a sparkline, a KPI tile — by calling into
   * a module bundle your application loaded. The grid core never imports a
   * module, so anything live is mounted here by you.
   */
  mount?: (el: HTMLElement, params: TooltipParams) => void;
  /**
   * Tear down whatever `mount` built. Called every time the tooltip closes, so
   * nothing keeps running behind a hidden box.
   */
  unmount?: (el: HTMLElement) => void;
}

/**
 * Grid-level defaults for the rich cell tooltip (BACKLOG-0001204), set once for
 * every column rather than repeated on each.
 *
 * Defaults only: it switches nothing on. A tooltip exists because a column
 * declares `cell.tooltip`, and a grid whose columns declare none has no
 * tooltips whatever is set here.
 */
export interface TooltipConfig {
  /**
   * How long the pointer or the keyboard cursor must rest on a cell before the
   * tooltip is built, in milliseconds. 400 by default.
   *
   * The delay is why a pointer sweeping across the grid mounts nothing: a
   * tooltip that built a chart on every cell it crossed would be unusable, and
   * `0` asks for exactly that.
   */
  delay?: number;
  /** How wide the tooltip may grow. A number is pixels; a string is used as written. */
  maxWidth?: number | string;
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
  /**
   * A tooltip for this column's cells.
   *
   * A string or a function is the plain-text case and becomes the browser's own
   * `title`. An object is a {@link ColumnTooltipSpec}: a tooltip the grid draws,
   * which can carry structure, markup or live content and which a keyboard user
   * can reach (BACKLOG-0001204).
   */
  tooltip?: string | ((p: CellParams) => string) | ColumnTooltipSpec;
  align?: Align;
  /**
   * Vertical alignment of this column's cell content, overriding the grid-level
   * `verticalAlign` for this column alone (BACKLOG-0000989). Accepted at the
   * top level of the column too, as `align` is.
   */
  verticalAlign?: VAlign;
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

/**
 * Declarative edit-validation rules for a column (BACKLOG-0000956).
 *
 * Rules are checked in a fixed order — `required` first, then the value-shape
 * rules, then the functions — and the first failure wins. A blank but optional
 * value passes everything after `required`: an empty cell is empty, not "below
 * the minimum". A failure vetoes the commit through `beforeEdit` and marks the
 * cell; the cancellation carries `reason: 'validation:<code>'`.
 */
export interface ColumnValidation {
  /** The value may not be blank. A string is used as the message. */
  required?: boolean | string;
  /** Minimum, for a number or a date. */
  min?: number;
  /** Maximum, for a number or a date. */
  max?: number;
  /** Minimum text length. */
  minLength?: number;
  /** Maximum text length. */
  maxLength?: number;
  /** A pattern the whole value must match. A string is a RegExp source. */
  pattern?: string | RegExp;
  /** The value must be one of these. */
  oneOf?: unknown[];
  /**
   * A cross-field rule: return `true` to pass, or a message string to fail. The
   * row is passed so a rule can compare against its siblings.
   */
  crossField?: (value: unknown, row: unknown, ctx: { key: string; colId: string; changes: unknown[] }) => true | string | void;
  /** A free-form check, the same contract as `crossField`. */
  validate?: (value: unknown, row: unknown, ctx: { key: string; colId: string; changes: unknown[] }) => true | string | void;
  /** A default message for any rule without its own. */
  message?: string;
  /** Per-rule messages, keyed by rule name (`required`, `min`, `pattern`, …). */
  messages?: Record<string, string>;
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
   * A pixel width, or a percentage of the grid's inner width as a string,
   * `'25%'`.
   *
   * A percentage is a share of the *whole* grid. `flex` divides only the space
   * left over after fixed columns, so the two are not interchangeable: `flex:
   * 25` on four columns is a quarter of the remainder, which is a quarter of
   * the grid only when nothing else is fixed.
   */
  width?: number | string;
  /**
   * `'content'` sizes the column to what it is actually showing, the way
   * `columns.autoSize()` does, and keeps doing it: on the first paint, and
   * again whenever the rows change, the columns are shown, hidden, reordered
   * or pinned, or the grid is resized. It is the declarative form of the
   * imperative call, so a host no longer has to re-issue `autoSize()` after
   * every data change.
   *
   * Sized to the *visible* content, not to the widest value in the dataset:
   * the measurement reads the rows the renderer has mounted, because measuring
   * a million rows is not a plan. It measures the heading too, so a column
   * whose title is longer than its values widens to show the title.
   *
   * **Anything the caller states outranks it.** A declared `width` wins, and
   * so does a width the user drags to — a resize is recorded as a `width`, so
   * from that moment the column is that wide and the fit no longer touches it.
   * `min` and `max` clamp the fitted width as they clamp any other. `flex` is
   * resolved before this and wins, the two being contradictory instructions:
   * `flex` fits the column to the *grid*, this fits it to the *content*.
   *
   * Not re-measured on scroll, deliberately: different rows mount as the grid
   * scrolls, and re-fitting against them would make the columns jitter under
   * the reader.
   */
  fit?: 'content';
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
  /** Not read by the header renderer; use `render` to draw a custom heading. */
  template?: string;
  /**
   * A custom heading renderer: a function, or a component (a class with a
   * `render` method). A string names a registered renderer. Either form draws
   * the same two ways and they are interchangeable — it may append to the passed
   * label element itself and return nothing, or return an `Element` (attached
   * for you) or a `string` (used as the heading text).
   */
  render?: string | RendererCtor;
  /** Props passed to `render` as `params.props`. */
  props?: Record<string, unknown>;
  /**
   * A class, or classes, added to the heading cell. A string may hold several
   * space-separated tokens (`'a b'`), each applied individually.
   */
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
   * Used by the column tag bar to show and hide sets of columns: tag sixty
   * monthly columns with their year, and a user can switch to one year.
   */
  tags?: string | string[];
  /** The column's own identity. Defaults to `field`; needed explicitly when two
   * columns read the same field, as a value and its running total do. */
  id?: string;
  /** The property to read from each row. Dotted paths reach into nested data. */
  field?: string;
  /** The heading. Defaults to a readable form of `field`. */
  title?: string;
  /**
   * The data type, which decides parsing, formatting, sorting, the default
   * editor and the default filter together. `false` turns inference off and
   * treats the values as opaque.
   */
  type?: TypeName | false;
  /** Named column presets to merge in first, so a house style is declared once. */
  preset?: string | string[];
  /** How a value is rendered as text. A string is a shorthand mask. */
  format?: FormatSpec | string;
  /** Display a stored code as a label, and edit it as a list. */
  lookup?: LookupSpec;
  /** A computed value, with the columns it depends on, in place of a stored one. */
  value?: ColumnValueSpec;
  /** The renderer, and what it is given. A string names a registered renderer. */
  cell?: ColumnCellSpec | string;
  /** Whether and how the cell can be edited. A string names an editor. */
  edit?: ColumnEditSpec | boolean | string;
  /**
   * Declarative edit-validation rules (BACKLOG-0000956). Each is checked against
   * a value before it is written, through the `beforeEdit` before-event: a
   * failing value cancels the commit and marks the cell. Distinct from and
   * complementary to `edit.validate`, which is an imperative function.
   */
  validation?: ColumnValidation;
  /** Whether the column sorts, and by what comparison. `false` refuses it. */
  sort?: ColumnSortSpec | boolean;
  /** Whether the column filters, and with which filter. A string names one. */
  filter?: ColumnFilterSpec | boolean | FilterName;
  /**
   * Row grouping by this column. `index` fixes its place among several;
   * `explode` gives a multi-value cell one group per value rather than one
   * group for the combination.
   *
   * `granularity` and `weekStart` apply to a `timestamp` column: it buckets by
   * civil `day` (the default), `week` or `month` in the display zone, or
   * `instant` for one group per exact moment. `weekStart` is the first weekday,
   * 1=Monday (default) to 7=Sunday.
   */
  group?: {
    enabled?: boolean; index?: number; explode?: boolean;
    granularity?: 'day' | 'week' | 'month' | 'instant';
    weekStart?: number;
  } | boolean;
  /** Use this column as a pivot dimension, and where it sits among several. */
  pivot?: { enabled?: boolean; index?: number } | boolean;
  /** The reduction shown in the totals row and in group footers. */
  total?: TotalName | TotalFn;
  /**
   * The reduction for group subtotals — group footers, tree-node rollups and
   * pivot cells — where it should differ from the grand total. Overrides
   * `total` for those scopes only; when omitted the column's `total` applies to
   * both. Lets a column average within each group while the grand total sums,
   * for example (BACKLOG-0000726).
   */
  groupTotal?: TotalName | TotalFn;
  /**
   * The reduction for the pinned grand-total row, where it should differ from
   * the group subtotals. Overrides `total` for the grand total only; when
   * omitted the column's `total` applies (BACKLOG-0000726).
   */
  grandTotal?: TotalName | TotalFn;
  /**
   * A value the grid maintains about this column's own history, rather than a
   * field in the data. `{of: 'price', kind: 'delta'}`, or the bare kind to
   * shadow the column it sits beside.
   */
  shadow?: ShadowKind | {
    of?: string;
    kind: ShadowKind;
    /**
     * For `kind: 'history'`, how many past readings to keep (20 by default). With
     * a time `window` (BACKLOG-0001043) this is instead how many buckets the span
     * divides into — `window: {kind: 'time', span: 60_000}, depth: 20` is sixty
     * one-second buckets. Ignored by every other kind.
     */
    depth?: number;
    /**
     * For a positional kind, what to rank against. `'all'` (the default) uses
     * every tracked row, so a rank does not move when the grid is filtered;
     * `'filtered'` ranks within what the filters left.
     */
    scope?: 'all' | 'filtered';
    /**
     * For `kind: 'anomalyFlag'`, the modified-z score a row must clear to be
     * flagged an anomaly. Default 3.5 (Iglewicz & Hoaglin). Ignored by
     * `anomalyScore`, which reports the raw score, and by the other kinds.
     */
    threshold?: number;
    /**
     * For `kind: 'specStatus'`, the hard specification the row is judged
     * against. `lower`/`upper` are the pass limits (a value beyond either
     * fails); the optional `warnLower`/`warnUpper` are inner thresholds that
     * mark a still-in-spec reading `'WARN'`. Centred-target ± tolerance is a
     * deliberate follow-up and is not read here.
     */
    lower?: number;
    upper?: number;
    warnLower?: number;
    warnUpper?: number;
    /**
     * For a rolling time-series kind (`rollingSum`/`rollingAvg`/`rollingMin`/
     * `rollingMax`/`windowCoverage`/`cumulativeToDate`/`periodOverPeriod`,
     * BACKLOG-0000748), the column whose order defines the series — dates,
     * sequence numbers, timestamps. **Required**: the screen sort is never used,
     * because a rolling figure would then change on every header click, so a
     * rolling column with no `orderBy` reports null and warns.
     */
    orderBy?: string;
    /**
     * For the rolling window kinds, the window to aggregate over: the last `span`
     * rows (`count`), the last `span` ms — or `minutes` — of the `orderBy` axis
     * (`time`), or everything so far (`session`). The first rows of a series
     * carry a partial window, stamped by a `windowCoverage` companion rather than
     * dressed as full.
     *
     * For `kind: 'history'` (BACKLOG-0001043), only `{kind: 'time', span}` (or
     * `minutes`) applies, and it changes what `history` means rather than what it
     * aggregates: the `depth` buckets that span divides into are read once each,
     * carrying the row's last known value forward into any bucket in which it did
     * not change, so a static row still draws a flat, advancing line instead of
     * freezing — the plain count-based history (no `window`) is a count of
     * *changes* and stays exactly as it was. `count` and `session` are refused
     * here: a plain count is already what `depth` means, and a session has no
     * fixed span to divide into buckets.
     */
    window?: {
      kind: 'count' | 'time' | 'session';
      span?: number;
      minutes?: number;
    };
    /**
     * For a rolling kind, whether the series is computed per group (`'group'`,
     * the default — partitioned by the grid's active grouping) or across the
     * whole dataset (`'all'`).
     */
    within?: 'group' | 'all';
    /**
     * For `kind: 'rollingQuantile'` (and its `windowApproximate` companion), the
     * quantile in `[0, 1]`, defaulting to the median (`0.5`). Exact while the
     * window is small; past an internal span cap, and for a session window, the
     * value comes from a sketch and is stamped by a `windowApproximate` column.
     */
    q?: number;
    /**
     * For a seasonal-decomposition kind (`tsTrend`/`tsSeasonal`/`tsResidual`/
     * `tsCoverage`, BACKLOG-0000873), the season length — **required**, since
     * there is no auto-detection in v1: 7 for a weekly cycle in daily data, 12
     * for a monthly cycle in monthly data. An integer of at least 2.
     */
    period?: number;
    /**
     * For a decomposition kind, the classical model: additive by default, or
     * `multiplicative` (which is undefined on a non-positive series, so those
     * rows report null and the caller is warned).
     */
    decomposition?: 'additive' | 'multiplicative';
    /**
     * For an exponential-smoothing kind (`tsSmoothed`/`tsSmoothingAlpha`/
     * `tsSmoothingBeta`, BACKLOG-0000873), the model: single exponential
     * smoothing (`ses`, the default) or Holt's level+trend (`holt`).
     */
    smoothing?: 'ses' | 'holt';
    /**
     * For a smoothing kind, the level factor in `[0, 1]`. Omit to fit it by
     * minimising in-sample SSE; the chosen value is reported by a
     * `tsSmoothingAlpha` column.
     */
    alpha?: number;
    /**
     * For `smoothing: 'holt'`, the trend factor in `[0, 1]`. Omit to fit it;
     * reported by a `tsSmoothingBeta` column.
     */
    beta?: number;
    /**
     * For a `fit*` kind (BACKLOG-0000812), the regression model the shadow reads
     * — predictors, response, method and confidence. Its predictors/response may
     * also be given directly on this object.
     */
    model?: RegressionSpec;
    predictors?: string[];
    response?: string;
    method?: 'ols' | 'wls' | 'robust' | 'quantile';
  };
  /**
   * A running total down the grid **as it is currently ordered**.
   *
   * The one derived value that depends on the display order: sort differently
   * and every value changes. That is why it is not a shadow kind: every shadow
   * reads the same however the rows are arranged.
   */
  running?: 'total' | 'percent' | 'delta'
    | { of?: string; kind?: 'total' | 'percent' | 'delta' };
  /**
   * The customer's tolerance, for process capability and control charts.
   * Declared here rather than passed to each call so the capability figures,
   * a control chart and any rule marking an out-of-tolerance cell cannot
   * disagree about what the tolerance is.
   */
  spec?: { lower?: number; upper?: number; target?: number };
  /** Width, pinning and flex. A bare number is the width in pixels. */
  layout?: ColumnLayoutSpec | number;
  /** The header cell: its text, tooltip, menu and any header chart. */
  header?: ColumnHeaderSpec | string;
  /**
   * The cell right-click menu for this column alone (BACKLOG-0001068), in the
   * same shapes the grid-level `contextMenu` takes plus a bare array for the
   * common "just these items here" case.
   *
   * Declared where the column is declared rather than as another branch inside
   * one grid-level callback: the menu logic for a column belongs beside the
   * column it belongs to. It does not replace the grid-level menu — the three
   * levels compose as a chain, built-in defaults then grid-level then this one,
   * each handed the previous result as its `defaults`, so a column adding one
   * item does not have to restate Paste, Clear and Fill down.
   *
   * `false` suppresses the menu on this column and leaves every other column
   * alone: what a sensitive or read-only column wants. The more specific level
   * wins, so a column may also declare a menu on a grid whose `contextMenu` is
   * `false`.
   */
  contextMenu?: boolean | MenuItem[] | ((p: CellMenuParams, defaults: MenuItem[]) => MenuItem[] | void);
  /**
   * When this column's header controls — its sort arrow, filter funnel and menu
   * button — are shown, overriding the grid-level `headerControls` default for
   * this column alone (BACKLOG-0000982). `'hover'` reveals them on hover or
   * focus, `'always'` keeps them visible, `'hidden'` draws none of them and
   * leaves them out of the tab order. Omitted, the column follows the grid
   * default, which is itself `'hover'`.
   */
  headerControls?: 'hover' | 'always' | 'hidden';
  /**
   * Vertical alignment of this column's cell content within the row
   * (BACKLOG-0000989). Overrides the grid-level `verticalAlign` for this column
   * alone; `top`, `middle` or `bottom`. Also accepted as `cell.verticalAlign`,
   * the way `align` is. Omitted, the column follows the grid default.
   */
  verticalAlign?: VAlign;
  /**
   * When this leaf column is shown, the same union `ColumnGroup` declares
   * (BACKLOG-0001279). A leaf reads its own `showWhen` exactly as a group
   * reads its own — `open`/`closed` tie the leaf to an ancestor group's
   * collapsed state, `always` (the default) shows it regardless — so tying a
   * leaf's visibility to a group's open/closed state does not require
   * wrapping it in a `ColumnGroup` of its own just to hold this setting; a
   * wrapper is for grouping columns, not for this.
   */
  showWhen?: 'open' | 'closed' | 'always';
  /** How the column leaves the grid, where that differs from how it is shown. */
  export?: ColumnExportSpec;
  /** Whether the user may group by this column from the interface. */
  allowGroup?: boolean;
  /** Whether the user may pivot on it. */
  allowPivot?: boolean;
  /** Whether the user may put a total on it. */
  allowTotal?: boolean;
  /** Whether an empty value is a legitimate value rather than a gap. */
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
  /**
   * The resolved vertical alignment (BACKLOG-0000989), or `undefined` when
   * neither the column nor the grid set one — in which case the cell keeps the
   * grid's historical vertical placement (centred, or top for `autoHeight`).
   */
  verticalAlign?: VAlign;
  value: Required<Pick<ColumnValueSpec, 'pure'>> & ColumnValueSpec;
  cell: ColumnCellSpec;
  edit: ColumnEditSpec;
  sort: ColumnSortSpec;
  filter: ColumnFilterSpec;
  group: { enabled: boolean; index: number; explode: boolean; granularity?: 'day' | 'week' | 'month' | 'instant'; weekStart?: number };
  pivot: { enabled: boolean; index: number };
  total: TotalName | TotalFn | null;
  /**
   * The group-subtotal override, or null when group subtotals follow `total`
   * (BACKLOG-0000726).
   */
  groupTotal: TotalName | TotalFn | null;
  /**
   * The grand-total override, or null when the grand total follows `total`
   * (BACKLOG-0000726).
   */
  grandTotal: TotalName | TotalFn | null;
  layout: ColumnLayoutSpec;
  header: ColumnHeaderSpec;
  /**
   * This column's own cell-menu declaration (BACKLOG-0001068), or null when it
   * makes none and the grid-level menu stands alone. Carried onto the resolved
   * column so a column preset or `columnDefaults` can supply one.
   */
  contextMenu: boolean | MenuItem[] | ((p: CellMenuParams, defaults: MenuItem[]) => MenuItem[] | void) | null;
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

export interface MemorySourceConfig {
  mode: 'memory';
  columnarBelow?: number;
  /** The rows a memory source opens with; equivalent to top-level `rows`, which wins if both are given. */
  rows?: unknown[];
}

/**
 * How rows are ingested into the column store.
 */
export interface IngestConfig {
  /**
   * Retain the caller's row objects by reference so identity round-trips.
   * Default `true`, the historical behaviour: `rows.data()` returns the exact
   * objects you supplied, `row === sourceObject` holds, and a custom renderer
   * reading `row.sourceObject` works.
   *
   * Set `false` to keep only the packed columns and reconstruct a plain row
   * object from them on demand. This drops roughly half the resident footprint,
   * but changes three behaviours: `rows.data()` returns freshly reconstructed
   * objects (new object each call, so `row === sourceObject` no longer holds),
   * a custom renderer that reaches for `row.sourceObject` gets a reconstruction
   * rather than the original, and equality against a row becomes value-based.
   * The stored values are unchanged, so `get()`, `byKey()`, `value()` and
   * `values()` are unaffected.
   */
  retainSource?: boolean;

  /**
   * Release the caller's row objects from the *source layer* once the column
   * store has been built, so the columns become the sole resident copy of the
   * data. Default `false`, which keeps today's behaviour.
   *
   * `retainSource:false` stops the {@link https://en.wikipedia.org/wiki/Column-oriented_DBMS column store}
   * from holding the caller's objects, but the memory source and the grid config
   * still retain the supplied array by reference — so the objects stay alive and
   * the resident footprint does not actually fall. This flag closes that gap: it
   * clears `MemorySource`'s retained array and drops the array from the grid
   * config, leaving nothing on the heap but the packed columns. That is where
   * the large reduction comes from (roughly an order of magnitude at a million
   * rows), not from `retainSource` on its own.
   *
   * Implies `retainSource:false`: dropping the caller's objects while the store
   * still expects to read through them would leave the source with no data at
   * all, so setting this on forces the store to reconstruct rows from columns.
   * Every read is therefore served from the columns — `at()`, `byKey()`,
   * `get()`, `value()`, `values()`, filtering, sorting, grouping, totals and
   * export are all unaffected in their values. What changes is the same three
   * identity behaviours `retainSource:false` documents: `rows.data()` returns
   * freshly reconstructed objects (so `row === sourceObject` no longer holds), a
   * custom renderer reaching for `row.sourceObject` gets a reconstruction, and
   * equality against a row becomes value-based.
   *
   * One consumer cannot be served from the columns: an *impure computed column*
   * (a shadow, or a rank/positional column) is deliberately never materialised
   * into the store, so its handle is built by reading the source objects. Under
   * `dropSourceRows` those objects are gone, so such a column reduces over
   * nothing and warns once rather than returning a silently wrong figure. Do not
   * enable `dropSourceRows` on a grid that sorts, filters, groups or totals on a
   * shadow or a positional column.
   */
  dropSourceRows?: boolean;

  /**
   * Columnize `stream`-source ingest on a Worker so a large load does not block
   * the main thread. Default `false`. When on, an arriving chunk that clears
   * {@link IngestConfig.workerThreshold} is packed into typed column buffers on
   * the Worker; the main thread merges the finished buffers into the store and
   * renders, without running the per-field extraction pass that otherwise
   * dominates ingest.
   *
   * This makes **stream** ingest non-blocking (remote sources already are).
   * Memory and paged sources cannot be made non-blocking this way — the main
   * thread must read the caller's own row objects — and are unaffected. The
   * effect composes with `retainSource: false`: with it off the source keeps no
   * caller-object array on the main thread at all, so the load is both
   * non-blocking and lighter on memory.
   *
   * A column that reads through a closure — a `date` column's storage
   * conversion, or a computed column — cannot cross the Worker boundary, so a
   * grid with any such column columnizes on the main thread and says so once.
   * Falls back silently to the main thread wherever a Worker cannot be created.
   */
  useWorker?: boolean;

  /**
   * Row count in a single stream chunk at or above which columnization is
   * offloaded to the Worker when {@link IngestConfig.useWorker} is on. Default
   * `10000`. A smaller first chunk is packed on the main thread, where the
   * cost is trivial and the postMessage round trip would only add latency to
   * time-to-first-row.
   */
  workerThreshold?: number;
}

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
  /**
   * The same ancestry as `groupPath`, but as the values the server returned
   * rather than their display strings (BACKLOG-0001325). Always present, empty
   * at the root, so a source can tell "no ancestors" from "a host that does not
   * send this".
   *
   * `groupPath` is stringified because it is a stable *identity* for expansion
   * state, and that is what it must stay: a numeric key `3` is `'3'` there and
   * an absent key is `''`, indistinguishable from a group whose key really is
   * the empty string. Useless for narrowing a query, then — which is what a
   * grouping engine needs it for — so the typed values travel beside it.
   */
  groupValues: unknown[];
  groupBy: ColumnRef[];
  totals: ColumnRef[];
  /**
   * The named statistic each totalled column reduces with — `{ amount: 'sum' }`
   * (BACKLOG-0001325). `totals` has always said *which* columns want a subtotal
   * and never *what*, because the client reads the reduction off the column
   * model and a server had no way to.
   *
   * Only string reductions appear: a column totalling with a host function has
   * no name to send, and naming one that merely resembles it would put a
   * plausible wrong number on every group row. `groupTotal` wins over `total`,
   * the same precedence the client applies for the group scope.
   */
  totalFns: Record<string, string>;
  pivotBy: ColumnRef[];
  pivotMode: boolean;
  filters: FilterSet;
  quick?: string;
  sort: SortEntry[];
  context: unknown;
  signal: AbortSignal;
  /**
   * The `where` predicates in force, as a runtime the source can evaluate but
   * not mutate (BACKLOG-0001268). Present **only when at least one predicate is
   * registered**, so a grid that does not use `where` sends the request it
   * always sent, field for field.
   *
   * A host `fetch` may ignore it, and every existing one does: it is a host
   * function, so there is nothing to serialise and no engine can evaluate it —
   * `passes` is dropped by `JSON.stringify` the way `signal` already is. It is
   * carried for the one reader that can act on it, `createPushdownSource`,
   * which runs it as the residual over the matching set when that set is under
   * `whereRowLimit`. The `{ condition }` twin remains the route that narrows
   * the fetch itself, at any size.
   */
  where?: WhereRuntime;
}

/**
 * The `where` predicates in force, as a source sees them (BACKLOG-0001268).
 *
 * A snapshot rather than the model, so a source can evaluate the predicates but
 * cannot register or remove one through it.
 */
export interface WhereRuntime {
  /** Whether any predicate is registered at all. */
  active: boolean;
  /** The registered names, in registration order — for diagnostics. */
  names: string[];
  /** Bumped on every registration or removal, so a cache key can track it. */
  version: number;
  /** Does this row survive every registered predicate? */
  passes(row: unknown, key?: string): boolean;
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
   * Set on the source, not passed to `open`, it bounds what the grid retains
   * rather than what the producer sends.
   */
  maxRows?: number;
  /**
   * The longest a row is kept, in milliseconds — a rolling *time* window, sitting
   * beside `maxRows` as a second, independent bound (BACKLOG-0001036). Rows older
   * than the span are evicted through the same path, the same `evicted` counters
   * and the same `stream:evicted` event as the count bound, so an existing
   * readout keeps working. Set both and whichever bites first applies. Eviction
   * continues on a low-frequency timer while the feed is idle, so "the last five
   * minutes" keeps shrinking through a silent period rather than freezing —
   * which is the thing `maxRows` cannot do.
   *
   * Retention is a *bound, not a guillotine*: rows live a little past the span
   * before a block is dropped. Two things add to it. First the eviction slack,
   * ten per cent of the span, exactly as `maxRows` overshoots its count, so the
   * row permutation is rebuilt once per block rather than once per row. Second,
   * when the feed is idle, up to one tick of the eviction timer, which runs at a
   * quarter of the span clamped to between 50 ms and one second. So the real
   * ceiling is roughly `span * 1.1 + tick`, and because the tick has a floor it
   * is proportionally larger the shorter the window: negligible at a five-minute
   * window (about 10%), around 1.25x at ten seconds, and as much as ~1.35x at
   * three. That is the deliberate trade for an idle grid that costs no CPU.
   *
   * Omit for no age limit.
   */
  maxAge?: number;
  /**
   * Which clock `maxAge` reads: a column id (or dotted path), or a function of
   * the row returning a `Date`, epoch milliseconds, or an ISO string
   * (BACKLOG-0001036). Given, the window follows the **data's own** clock, so it
   * means what the producer means — and inherits the producer's clock skew.
   * Omitted, `maxAge` falls back to **arrival time**: when the row reached this
   * source. Arrival time needs no timestamp column and cannot be skewed, but it
   * is not event time — a row delayed in transit counts as young. A row whose
   * time value cannot be read is never aged out.
   */
  ageBy?: string | ((row: unknown) => unknown);
  promoteToMemoryBelow?: number;
  coalesceMs?: number;
}

/** One reduced column of a derived grid. */
export interface DerivedSelect {
  /** The column to reduce, as a field name or a dotted path. Omit for `count`. */
  of?: string;
  /** A key of `TOTAL_FNS`: `sum`, `avg`, `median`, `p95`, `distinct` and the rest. */
  fn?: TotalName;
}

/**
 * A grid whose rows are derived from another grid: aggregated, unnested,
 * filtered, ranked or profiled. Read-only: write to the source instead.
 */
export interface DerivedSourceConfig {
  mode: 'derived';
  /**
   * A derived grid keys on `__key`, which the source writes onto every row it
   * produces, the group value, the profiled column, or the source row's own
   * key when nothing is grouped. `config.rowKey` defaults to it, so it need not
   * be set; an explicit `rowKey` still wins.
   */
  /**
   * The grid to read, or several to combine into one row set before the rest
   * of the pipeline runs (BACKLOG-0001045). A bare `Grid` is shorthand for a
   * `UnionSourceOptions` with no `label`/`follow`/`map` override, so an
   * existing `from: <grid>` keeps meaning exactly what it always has.
   *
   * Given an array, every source is read (each narrowed by its own `follow`,
   * defaulting to `'filtered'` as a lone `from` does today), concatenated in
   * **declaration order** — deterministic, not interleaved — and only then
   * does `unnest`/`join`/`where`/`bucket`/`groupBy`/`select`/`sort`/`limit`/
   * `limitPer`/`cumulative` run, over the combined set, so "the worst
   * performers across both" is one derivation rather than a hand-merge.
   *
   * The output carries the **union of the sources' fields**: a field present
   * on only one source is `undefined` on rows from the others. Sources are
   * **not** type-reconciled — if two disagree on what a field means or holds,
   * that is not resolved for you; give each source a `map` to project it into
   * a common shape first. Every row also carries `__source` (the entry's
   * `label`, or its declaration index when unlabelled), which is required —
   * not optional — because without it a combined list cannot be read, filtered
   * or grouped by where it came from; it is an ordinary field to `where`,
   * `groupBy` and `select`. And because the derived key (`__key`) would
   * otherwise collide across sources sharing the same identifiers, it is
   * namespaced by the same source tag when nothing is grouped (a grouped
   * union's `__key` is the group value, exactly as today, and rows from
   * different sources correctly land in the *same* group when their group
   * values agree — that merging is the point of grouping a union, not a
   * collision to guard against).
   *
   * This is **not** a join: there is no dedup or merge-on-key, and it draws no
   * UNION/UNION ALL distinction — overlapping rows from two sources simply
   * both appear. Reach for `join` when two sides share a key and you want them
   * matched rather than stacked.
   *
   * An empty source contributes nothing and the rest still combine; a source
   * that fails to read is named in a `warnOnce` and skipped for that pass
   * rather than silently dropped, because a silently missing source would
   * make "worst across both" quietly wrong. A source list that includes the
   * grid being derived, directly or through a chain, is refused when the
   * source is built (naming the offender) rather than recursed into.
   *
   * `crossFilter` has no single target once there is more than one parent, so
   * it is not supported alongside a union `from` (ignored, with a `warnOnce`,
   * rather than guessing which parent to push onto).
   */
  from: Grid | UnionSourceOptions[];
  /**
   * Which of its rows to read. `filtered` by default. Ignored — with a
   * `warnOnce` — when `from` is a union array: each entry there carries its
   * own `follow` instead (BACKLOG-0001045).
   */
  follow?: 'filtered' | 'all' | 'selected' | 'grouped';

  /** An array property to expand, one row per element, before anything else. */
  unnest?: string;
  /**
   * Match each row against a second grid on a shared key, and bring some of its
   * fields across. Runs after `unnest` and before `where`, so a condition: and
   * a grouping, and a total: can read a field the join produced.
   */
  join?: DerivedJoin;
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

  /**
   * Project a **relational** statistic into rows (BACKLOG-0001046): the figures
   * that need two or more columns, or a second grid, and so cannot be reached
   * through `select`.
   *
   * Every *single-column* statistic already has a route and this is not it —
   * the derived `select` reduces a group by any kernel the totals row uses, and
   * that table is a superset of the statistics one, so
   * `select: { p95: { of: 'amount', fn: 'p95' } }` (or `gini`, `stddev`,
   * `median`, `trimmedMean`, …) works today. Reach for `statistics` only when
   * the answer is a correlation, a series summary or a comparison against
   * another dataset.
   *
   * **A terminal producer, like `profile`, not a pipeline stage.** A
   * correlation is one row per column *pair*, a series summary one row per
   * *metric*, a comparison one row per compared *column* — none of which is one
   * row per group, so there is no position in
   * `unnest → where → bucket → groupBy → select → sort → limit` for it to
   * occupy. It replaces the pipeline, and those keys are ignored with a warning
   * naming them (BACKLOG-0001092) rather than silently discarded. Sort, filter
   * or limit the derived grid itself instead, or chain a second derived grid
   * whose `from` is this one.
   *
   * **`profile` and `statistics` are mutually exclusive** and declaring both is
   * refused, by name, when the source is built. **Not supported alongside a
   * union `from`** — a relational statistic reduces one grid's own columns and a
   * union has no single set of them; also refused by name.
   *
   * **Cost.** Like every terminal producer this never patches incrementally: a
   * change on the parent re-derives the whole thing. `correlation` additionally
   * scans the rows once *per pair*, so N columns cost N·(N−1)/2 passes. Use
   * `refresh` (`'idle'` is the default; `'manual'` or a debounce in ms for an
   * expensive analysis over a live feed; under `'manual'` the host re-derives
   * by calling `rows.load()` on the derived grid) — see `docs/api-detail.html`
   * for the measured figures.
   *
   * Every row carries `n`, the rows the figure covered, because a derived
   * statistic travels into an export or a chart without its grid and "r = 0.98
   * over eleven rows" is a different claim from the same number over eleven
   * thousand. It does NOT carry a windowed/approximate flag: whether a source
   * held fewer rows than matched its filters is decided from the source's own
   * counters, which a derived source cannot reach, so that signal stays where
   * it already works - the `stat.windowed:*` console warning the parent grid
   * emits.
   */
  statistics?: DerivedStatistics;

  /**
   * When to re-derive. `idle` by default: coalesced to a frame. A number
   * debounces by that many milliseconds; `live` re-derives on every change.
   * `manual` never re-derives on its own: the host triggers it by calling
   * `rows.load()`, with no argument, on the derived grid - from a Refresh
   * button, say. Each call re-reads `from` there and then and replaces the
   * rows; a derived grid takes its rows from `from`, so anything passed to
   * `load` is not used. Executed example: `docs/api-detail.html#derived-manual-refresh`.
   */
  refresh?: 'live' | 'idle' | 'manual' | number;

  /**
   * Let this grid filter the grid it derives from. `true` cross-filters through
   * whatever it groups by; a string names a different source column.
   */
  crossFilter?: boolean | string | { col?: string };
}

/**
 * Which relational statistic a derived source projects into rows, and how
 * (BACKLOG-0001046). See `DerivedSourceConfig.statistics`.
 *
 * A discriminated union on `fn`, so the relational statistics still deferred —
 * `regression`, `regressionModel`, `forecast`, `anomalies`, `adf`, `acf`,
 * `spearman`, `kendall`, `covariance`, `subsetVsPopulation`, `compareGroups`,
 * `capability`, `interval`, `windowed`, `weightedQuantile`, `weightedAverage` —
 * arrive as further arms of this one key rather than as a second mechanism.
 */
export type DerivedStatistics =
  | DerivedCorrelation
  | DerivedSeries
  | DerivedDatasetComparison;

/**
 * Pearson's correlation across N columns, pairwise.
 *
 * Rows, `orient: 'pairs'` (the default): one per unordered pair,
 * `{ a, b, coefficient, n }` — the long form, because that is what
 * a grid sorts, filters and charts well, and "the three most correlated pairs"
 * is then a sort and a `limit` on the derived grid. Only the upper triangle is
 * emitted: r is symmetric, so `(a,b)` and `(b,a)` are one finding, and a column
 * against itself is 1 by definition.
 *
 * Rows, `orient: 'matrix'`: one per column, carrying a field per other column
 * plus `column` and `n` — the classic square, for a heat map.
 * The diagonal is 1 and both triangles are filled.
 */
export interface DerivedCorrelation {
  fn: 'correlation';
  /** The columns to correlate pairwise. At least two, or the source is refused. */
  columns: string[];
  /** `pairs` (default) for one row per pair; `matrix` for the square. */
  orient?: 'pairs' | 'matrix';
}

/**
 * A `grid.statistics.series` summary, as one row per metric:
 * `{ metric, value, n }`.
 *
 * One row per *metric*, not per point: `series` returns a `SeriesStats` summary
 * object — `n`, `first`, `last`, `change`, `changePercent`, `volatility`,
 * `annualisedVolatility`, `growth`, `maxDrawdown`, `maxDrawdownFrom`,
 * `maxDrawdownTo`, `autocorrelation`, `upDays`, `downDays` — and not a value
 * per row. The shape is deliberately the one `profile`'s `orient: 'metrics'`
 * already emits rather than a third convention for the same idea.
 */
export interface DerivedSeries {
  fn: 'series';
  /** The column to summarise. */
  of: string;
  /** The column that orders it. Required and never guessed. */
  by: string;
  /** Annualise volatility and growth against this many periods per year. */
  periodsPerYear?: number;
}

/**
 * How this grid differs from another, ranked by effect size, as rows:
 * `{ column, measure, magnitude, distance, direction, nA, nB, reliable,
 * unmatched }`, largest difference first.
 *
 * The two-grid shape: one grid is the data, a second *is* the analysis of it.
 * Both sides are read over their filtered rows, and the peer is watched — an
 * edit or a filter on it re-derives the comparison, because a comparison whose
 * other side has moved is wrong rather than merely late.
 *
 * A column present on only one side cannot be compared. It is still reported,
 * as a row with a null `magnitude` and `unmatched` set to `'A'` or `'B'`, so a
 * reader sees that it was skipped and why rather than finding it absent.
 */
export interface DerivedDatasetComparison {
  fn: 'datasetVsDataset';
  /** The second grid to compare this one against. */
  with: Grid;
  /** Restrict the comparison to these columns. All shared columns by default. */
  columns?: string[];
}

/**
 * One member of a union `from` (BACKLOG-0001045): a grid to combine with the
 * others, plus how to read it and reshape it before it joins the rest. A bare
 * `Grid` in the `from` array is shorthand for `{ grid }` with every other
 * field defaulted.
 */
export interface UnionSourceOptions {
  /** The grid this source reads. */
  grid: Grid;
  /**
   * Identifies this source: it is what `__source` carries on every row this
   * source contributes, and what namespaces that row's `__key` so two sources
   * sharing the same identifiers do not collide. Defaults to the source's
   * position in the `from` array (`'0'`, `'1'`, …), as a string.
   */
  label?: string;
  /**
   * Which of this source's rows to read. `filtered` by default, exactly as a
   * lone `from` follows its grid today — set independently per source, so
   * filtering one narrows only its own contribution.
   */
  follow?: 'filtered' | 'all' | 'selected' | 'grouped';
  /**
   * Reshape this source's rows into the common shape before they join the
   * rest — typically a rename or a projection, for a field this source calls
   * something else. Not a type coercion: if a field means something different
   * on two sources, `map` is where you make them agree, because the union
   * itself does not guess.
   */
  map?: (row: unknown) => unknown;
}

export interface DerivedJoin {
  /** The grid holding the other side. */
  with: Grid;
  /** The shared key: one field name when both sides use it, or one each. */
  on: string | { left?: string; right?: string };
  /** `inner` keeps only rows that matched; `left` keeps them all. */
  type?: 'inner' | 'left';
  /** Which of the partner's fields to bring across. All of them by default. */
  select?: string[];
  /** Rename the brought-across fields, when both sides have one worth keeping. */
  prefix?: string;
  /** Which of the partner's rows to read. `all` by default. */
  follow?: 'all' | 'filtered';
}

export interface CrossFilter {
  /** Whether this grid can cross-filter a source. */
  enabled(): boolean;
  /** The source column the filter is pushed onto. */
  column(): string | null;
  /** The keys currently filtering the source. */
  get(): string[];
  /** Filter the source to these derived rows. */
  set(keys: string | string[] | null): void;
  /** Add or remove one key, for click-to-filter. */
  toggle(key: string): void;
  /** Take this grid's filter off its source. */
  clear(): void;
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
   * the detail is reported as a path on the master: `ports.1.vlan`. Inferred
   * by identity when `rows(row)` returns an array already on the record, which
   * is the usual shape; set this when it does not.
   */
  path?: string;
}

export interface SelectionConfig {
  /** `'none'` also turns off `ranges` and `fillHandle` unless either is set explicitly alongside it. */
  mode?: 'none' | 'single' | 'multiple';
  checkbox?: boolean;
  headerCheckbox?: boolean;
  /**
   * Only the `checkbox` column may change row selection — a click anywhere
   * else in the row, and Space with focus anywhere but the checkbox, leave
   * selection untouched. Range and cell selection are unaffected either way.
   * For a host whose row click is bound to its own action (opening a record):
   * without this, that click also selects the row, so a later bulk action can
   * reach rows nobody chose. Off by default. `mode: 'none'` already refuses
   * every selection path regardless of this flag.
   */
  checkboxOnly?: boolean;
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
  /**
   * Show a preview of what a bulk paste will change before it commits (§12),
   * with confirm/cancel. Off by default: a paste commits straight away, exactly
   * as it always has. When on, a paste into more than one cell first opens a
   * dialog listing every cell that changes (old → new) and every cell that would
   * be rejected (permission, data-type, read-only); confirm commits precisely
   * that set through the ordinary edit path, cancel commits nothing.
   */
  pastePreview?: boolean;
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

/** A structural op (append or delete) still awaiting an outcome (§5.3). */
export interface OpenRowOp {
  id: string;
  kind: 'append' | 'delete';
  key: string;
  state: 'pending' | 'superseded';
  age: number;
}

/**
 * What an adapter can persist back to its source — the write-back capability
 * (§4.1), declared on `AdapterCapabilities.mutate`. `false` (the default) is
 * read-only by declaration; a resolved block turns every kind off unless the
 * adapter opts in.
 */
export interface MutateCapability {
  /** The adapter can insert new rows, bridged by the structural engine (`edit.addRow`, §5.3). */
  append?: boolean;
  /** The adapter can patch existing rows, bridged by the cell edit path (§4.3 Option A). */
  update?: boolean;
  /** The adapter can remove rows, bridged by the structural engine (`edit.deleteRow`, §5.3). */
  delete?: boolean;
  /**
   * The reconcile contract — what the server hands back after a successful
   * mutation (§5.1). `'row'`: the authoritative row (id, computed columns,
   * timestamps), reconciled before confirm. `'key'`: only the assigned key.
   * `'none'` (the default): nothing — the optimistic value stands
   * (last-write-wins).
   */
  returning?: 'row' | 'key' | 'none';
}

/**
 * One mutation handed to `adapter.mutate(op, request)` (§4.2). Cell-scoped
 * `update` is the only kind wave 1 synthesises; `append`/`delete` are part of
 * the shape so it survives into a later structural build (card 770).
 */
export interface MutationOp {
  kind: 'append' | 'update' | 'delete';
  /** append: the new rows (may lack a server-assigned key). */
  rows?: unknown[];
  /** update: the row key. */
  key?: string;
  /** update: the changed columns only, matching `PendingWrite` semantics. */
  patch?: Record<string, unknown>;
  /** delete: the row key(s). */
  keys?: string[];
  /** Provenance, carried through for auth / audit. */
  origin?: string;
  /** Stable id for idempotent retry / dedupe. Reserved; retry is a non-goal in wave 1. */
  requestId?: string;
}

/**
 * The result of a mutation (§4.2) — the reconcile payload. A cell-update commit
 * flows this back through `PendingWrites`: `ok: false` reverts and surfaces
 * `reason`; `rows` (`returning: 'row'`) reconciles server truth before confirm;
 * `conflict` surfaces a last-write-wins divergence via `cell:conflict`.
 */
export interface MutationResult {
  ok: boolean;
  /** `returning: 'row'` — the authoritative row(s) to reconcile to. */
  rows?: unknown[];
  /** `returning: 'key'` — server-assigned key(s) for appended rows, in order. */
  keys?: string[];
  /** On rejection — surfaced on `cell:reverted`, never swallowed. */
  reason?: string;
  /** The server's current value, for a surfaced last-write-wins conflict. */
  conflict?: { key: string; serverRow?: unknown };
}

export interface PaginationConfig {
  enabled?: boolean;
  pageSize?: number;
  pageSizes?: number[];
}

export interface GridConfig {
  /** The columns, in order. A group nests columns under one heading. */
  columns?: (Column | ColumnGroup)[];
  /** Header groups declared separately from the columns they contain. */
  columnGroups?: ColumnGroup[];
  /** The data, for a memory grid. Use `source` for anything fetched. */
  rows?: unknown[];
  /**
   * What identifies a row. Everything that survives a refresh (selection,
   * expansion, and edits in flight) is keyed on it, so it must be stable and
   * unique. A derived grid defaults to its own derived key.
   *
   * Three shapes: a field name (`'id'`, dot paths allowed); an array of field
   * names, joined into one composite key (`['tenantId', 'circuitId']`); or a
   * function of the row (`row => \`${row.tenantId}#${row.circuitId}\``),
   * itself allowed to return an array to the same effect.
   */
  rowKey?: string | string[] | ((row: unknown) => string | string[]);
  /** Where rows come from: memory, paged, remote, stream or derived. */
  source?: SourceConfig;
  /** How rows are ingested into the column store. */
  ingest?: IngestConfig;
  /** Applied to every column before its own settings. */
  columnDefaults?: Column;
  /** Named bundles of column settings, referenced by a column's `preset`. */
  columnPresets?: Record<string, Column>;
  /** Your own data types, alongside the built-in catalogue. */
  dataTypes?: Record<string, DataType>;
  /** Values sampled per undeclared column when inferring its type. Default 100. */
  sampleSize?: number;
  /**
   * Raise every interactive target to a comfortable size for touch, without
   * changing the type. `'large'` asks for it; `'default'` opts out of the
   * coarse-pointer rule that would otherwise apply it.
   */
  targetSize?: 'default' | 'large';
  /** Your own renderers, editors and filters, registered by name. */
  components?: Record<string, RendererCtor | EditorCtor | FilterCtor>;
  /** Named text transforms usable from a format mask or a template. */
  pipes?: Record<string, (value: unknown, ...args: string[]) => string>;
  /** Your own reductions, alongside the built-in ones. */
  totalFns?: Record<string, TotalFn>;
  /** Named appearance variants a row or cell can be switched into by a rule. */
  variants?: Record<string, VariantDefinition>;
  /** Hierarchical rows: where the parent link or the path lives. */
  tree?: TreeConfig;
  /** The expandable panel beneath a row. */
  detail?: DetailConfig;
  /**
   * What the user may select, and how selection behaves across groups.
   * The `'none'` shorthand is `{ mode: 'none' }` and behaves identically: no
   * row selection, and no cell ranges or fill handle either.
   */
  selection?: SelectionConfig | 'single' | 'multiple' | 'none';
  /** Editing, and how a change is committed and validated. */
  edit?: EditConfig | boolean;
  /** Page the rows rather than scrolling them. */
  pagination?: PaginationConfig | boolean;
  locale?: string;
  /**
   * Writing direction. Omit it, or say `'auto'`, to settle it from the
   * element's own computed `dir` and then from `locale`: `ar`, `he`, `fa` and
   * the rest resolve to `rtl`. In a right-to-left grid the logical alignments
   * `start`/`end` mirror while the physical `left`/`right` do not (see
   * {@link Align}).
   */
  direction?: 'ltr' | 'rtl' | 'auto';
  /**
   * IANA zone every date column formats in, e.g. 'Europe/London' or 'UTC'.
   * Omit to use each viewer's own zone. A column's own `format.timeZone` wins.
   */
  timeZone?: string;
  /** The visual theme. */
  theme?: Theme;
  /** Row height and padding as a named step, rather than pixel by pixel. */
  density?: Density;

  /**
   * Which rules are drawn between cells.
   *
   * `'both'` by default. The two axes are separate decisions: horizontal rules
   * help the eye track along a row, vertical ones stop adjacent values running
   * together. `false` or `'none'` draws neither.
   *
   * Only the rules *between data* are affected, the header's underline, the
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
   * Shade alternate data rows (zebra striping).
   *
   * Off by default, and strictly opt-in: an existing grid must look exactly the
   * same on upgrade. When `true`, every other data row takes the theme's
   * `--lattice-surface-alt` background, which every palette already defines, so
   * dark, high-contrast and terminal stripe correctly without extra work.
   *
   * Parity follows the row's *logical* index, not its position in the DOM, so a
   * row keeps its stripe across a scroll even though the rows are recycled.
   * Structural rows — group headings, group footers and the grand total — are
   * never striped, and both selection and hover still win over the stripe.
   */
  stripedRows?: boolean;

  /**
   * Vertical alignment of cell content within a row, as a default for every
   * column (BACKLOG-0000989). `top`, `middle` or `bottom`; a column's own
   * `verticalAlign` overrides it for that column.
   *
   * The horizontal counterpart is the per-column `align`. Omitted, the grid
   * keeps its historical placement — content centred in a fixed-height row and
   * top-aligned in an `autoHeight` row — so an existing grid is unchanged on
   * upgrade. Setting a value aligns every column uniformly, including
   * `autoHeight` rows, unless a column opts out.
   */
  verticalAlign?: VAlign;

  /**
   * Defaults for the rich cell tooltip (BACKLOG-0001204).
   *
   * The tooltip itself is declared per column, on `cell.tooltip`; this only
   * carries the settings that are a house style rather than a per-column
   * decision. It switches nothing on: a column with no `cell.tooltip` has no
   * tooltip whatever is set here.
   */
  tooltip?: TooltipConfig;

  /**
   * How the scroll viewport's scrollbars are drawn (BACKLOG-0000990,
   * BACKLOG-0001288).
   *
   * `'auto'` (the default) is the platform's native behaviour, where overlay
   * scrollbars fade when idle. `'always'` keeps that native bar shown whether
   * or not the pointer is over the grid. `'custom'` makes the grid draw its
   * own bar on each axis instead — always visible, the same in every browser,
   * and sized by `--lattice-scrollbar-size` / `--lattice-scrollbar-thumb-min`
   * rather than by the platform. Scrolling itself is unchanged in every mode.
   *
   * The object form controls each axis on its own — `{ y: 'always' }` pins the
   * vertical bar while the horizontal one stays native. Note that `'custom'` on
   * one axis hides the native bar on both, because no browser offers per-axis
   * control of that; the grid warns once if the two axes disagree. Omitted, the
   * grid is unchanged on upgrade.
   */
  scrollbars?: ScrollbarMode | { x?: ScrollbarMode; y?: ScrollbarMode };

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
   * Show a small chip in the grid chrome that reads how many rows an anomaly
   * shadow column has flagged, and filters the grid to exactly those when it is
   * clicked (BACKLOG-0000799).
   *
   * Off by default, and it draws nothing unless a column declares a
   * `shadow: { kind: 'anomalyFlag' }`. The count and the filter both read that
   * one shadow column, so the number on the chip is the number of rows the
   * click reveals. `column` names the base column to summarise when more than
   * one anomaly-flag shadow is present; `label` overrides the chip's wording.
   */
  anomalySummary?: boolean | { column?: string; label?: string };

  /**
   * Open a row on a form when it is double-clicked.
   *
   * `mode` is a right-hand `'drawer'` (the default) or a centred `'dialog'`.
   *
   * Without `load` the form shows the grid's own columns, edited with the same
   * editors the cells use. With `load` it shows whatever that returns: the
   * grid rarely displays everything a record has, and then `fields` is
   * required, because nothing here knows the shape of a record it has not seen.
   *
   * The panel opens immediately and fills in when the record arrives; a failure
   * offers a retry inside the panel. Save collects the changed fields, writes
   * the ones that map to columns, and emits `form:saved` with the lot,
   * persisting is yours.
   *
   * `trigger: false` leaves opening to `grid.form.open(key)`.
   */
  /**
   * Draw each row with a template instead of dividing it into columns.
   *
   * A card list, a feed, a search-result list. The template is the same
   * declarative string a cell template is, and compiles once at configuration
   * time: there is deliberately no per-row callback, because one would be used
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
   * Present rows as a gallery of tiles (§7.12).
   *
   * The tiled card layout with a size-driven column count: tiles as wide as
   * `tileWidth` allows, as many across as the container holds, laid out by the
   * same 2-D virtualisation the grid already runs. `true` draws a tile per row
   * generated from the columns; an object sizes them or supplies a template.
   * Presentation only — sort, filter, group and the data pipeline are unchanged.
   */
  gallery?: boolean | {
    /** The tile layout. Generated from the columns when omitted. */
    template?: string;
    /** How wide a tile aims to be; the count across follows the container. 240 by default. */
    tileWidth?: number;
    /** How tall a tile is. 180 by default. */
    tileHeight?: number;
    /** A fixed number of tiles on a line, instead of `tileWidth`. Does not reflow. */
    cardsPerRow?: number;
    /** Space between tiles, in pixels. 8 by default. */
    gap?: number;
    /** A class of your own on every tile, alongside the grid's. */
    className?: string;
    /** The layer's role. `list` by default; `listbox` for a selectable set. */
    role?: string;
    /** Each tile's role. `listitem` by default. */
    itemRole?: string;
  };

  /**
   * Present each row as a record card — a form of label/value pairs (§7.11).
   *
   * For a screen where reading one record matters more than comparing many.
   * `true` draws a card per row generated from the columns, each column a
   * labelled line in display order, showing the same text the table shows. An
   * object supplies a template or sizes the card. A card list underneath, so it
   * inherits the virtualisation and every interaction a card carries.
   * Presentation only — sort, filter, group and the data pipeline are unchanged.
   */
  recordCard?: boolean | {
    /** The card layout. Generated from the columns as label/value pairs when omitted. */
    template?: string;
    /** How tall a card is. 200 by default; a form needs room per field. */
    cardHeight?: number;
    /** A class of your own on every card, alongside the grid's. */
    className?: string;
    /** The layer's role. `list` by default. */
    role?: string;
    /** Each card's role. `listitem` by default. */
    itemRole?: string;
  };

  /**
   * Present rows as a board — a kanban of grouped lanes of cards (§7.14).
   *
   * The top-level group becomes a lane and every leaf under it becomes a card
   * stacked in that lane: a pipeline by stage, a task list by status, a backlog
   * by owner. `true` draws a card per row generated from the columns; an object
   * sizes the lanes and cards or supplies a template. Group the grid to give the
   * board its lanes; an ungrouped board is a single lane of every card.
   *
   * A card is drawn through the same code the other card presentations use, so a
   * board card is still a row: it clicks, selects and drags through the grid's
   * own handlers, masks protected columns, and shows the same text the table
   * shows. Both axes are virtualised — the lanes across and the cards down each —
   * so a board of many long lanes renders only what is on screen. Presentation
   * only: sort, filter, group and the data pipeline are unchanged.
   */
  board?: boolean | {
    /** The card layout. Generated from the columns as a tile when omitted. */
    template?: string;
    /** How wide a lane is, in pixels. 280 by default. */
    laneWidth?: number;
    /** How tall a card is, in pixels. 120 by default. */
    cardHeight?: number;
    /** Space between lanes, in pixels. 16 by default. */
    laneGap?: number;
    /** Space around a card within its lane, in pixels. 8 by default. */
    gap?: number;
    /** A class of your own on every card, alongside the grid's. */
    className?: string;
    /** The board's role. `list` by default; `listbox` for a selectable set. */
    role?: string;
    /** Each card's role. `listitem` by default. */
    itemRole?: string;
  };

  /**
   * Present the grid as a pivot — a cross-tab drawn as a matrix (§10,
   * BACKLOG-0000738).
   *
   * The row dimensions (the grid's `group`) go down the left gutter, the column
   * dimensions (the grid's `pivot`) go across the top, and each totalled column
   * fills a cell with its reduction. `true` draws the matrix with the default
   * geometry; an object sizes the cells and gutter or names the breakpoint below
   * which it degrades to cards.
   *
   * **The numbers are the grid's own.** Every cell — body, subtotal, grand total
   * — is the same aggregate kernel the totals row uses, run over the rows that
   * feed the cell, so a pivot subtotal equals the grid's group total for that
   * set by construction rather than being re-derived. Both axes expand and
   * collapse, both are virtualised, and a cell click emits `pivot:drill` with the
   * keys of the contributing rows.
   *
   * **Narrow-screen fallback.** A matrix cannot be read on a phone, so at or
   * below `maxWidth` (the container width, not the viewport) the pivot degrades
   * to a card list — the record card by default — exactly as the table does under
   * `responsive`. Presentation only: sort, filter, group, pivot and the data
   * pipeline are unchanged.
   */
  pivotView?: boolean | {
    /** How wide one value column is, in pixels. 120 by default. */
    cellWidth?: number;
    /** How tall one body row is, in pixels. 32 by default. */
    cellHeight?: number;
    /** How wide the row-label gutter is, in pixels. 200 by default. */
    headerWidth?: number;
    /** Degrade to cards at or below this container width. 640 by default. */
    maxWidth?: number;
    /** The card layout the narrow fallback uses. The record card when omitted. */
    fallbackTemplate?: string | object;
    /** A class of your own on the pivot root, alongside the grid's. */
    className?: string;
    /** The pivot's role. `grid` by default — a pivot is a grid of cells. */
    role?: string;
  };

  /**
   * Present rows as cards when the grid's container is too narrow to be a
   * table honestly, a phone, or a narrow panel on a wide screen.
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
    /** How tall a collapsed card is. 64 by default, a table row is too short. */
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
  /**
   * When the per-column header controls — the sort arrow, the filter funnel and
   * the menu button — are shown, as a default for every column (BACKLOG-0000982).
   *
   * - `'hover'` (the default) reveals them when the heading is hovered or a
   *   keyboard user focuses into it, which is the historical behaviour: a wide
   *   header does not read as a row of identical icons.
   * - `'always'` keeps them visible unconditionally, for a grid where the
   *   controls are the point and the discoverability of hover is not wanted.
   * - `'hidden'` draws none of them, for a clean read-only heading; they leave
   *   the tab order with the elements that carried them. An active filter and a
   *   live sort are still reflected by the heading's state attributes, but no
   *   control furniture is built.
   *
   * A column's own `headerControls` overrides this default for that column.
   * Distinct from `showColumnFunctions: false`, which also drops the furniture
   * but keeps sorting, filtering and the menu reachable from the keyboard;
   * `'hidden'` is the read-only choice that removes them outright.
   */
  headerControls?: 'hover' | 'always' | 'hidden';
  /**
   * Row height in pixels, or a function of the row. A function makes the
   * grid measure rather than assume, which costs a pass over what is on
   * screen: worth it for wrapped text, wasteful for a uniform grid.
   */
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
   * accessibility tree rather than only from view, a heading a screen reader
   * still announces is invisible, not hidden. What a small dashboard tile
   * wants when its `title` already says what the panel is.
   *
   * Distinct from `showColumnFunctions`, which keeps the headings and drops
   * only the sort, filter and menu controls inside them.
   */
  showHeader?: boolean;
  /**
   * Header height in pixels. Omitted, the header takes its height from the
   * density-scaled `--lattice-header-height` token, so `density` sizes the
   * header as it sizes the rows. A number names one explicitly and outranks the
   * token.
   */
  headerHeight?: number;
  /** How many rows to render beyond the viewport. More costs memory and
   * smooths fast scrolling; fewer is lighter and can show a gap. */
  overscan?: number;
  /**
   * Size rows to their content rather than to the density token.
   *
   * Only rows that are actually rendered are ever measured, in both settings:
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
  /**
   * Sort, filters, grouping, widths and the rest, restored at construction.
   * Takes precedence over a saved view flagged `isDefault`: when both are
   * present, this wins outright and the default view is never applied — the
   * active view id stays `null`.
   */
  state?: GridState;
  /** Your licence key. Without one the grid renders in full and watermarks off localhost. */
  licence?: string;
  /** Offer a full-screen control. */
  maximise?: boolean;
  /** Extra functions a formula may call, on top of the built-in library. */
  formulaFunctions?: Record<string, (args: unknown[]) => unknown>;
  /**
   * Permit raw HTML from a template without sanitising it. Off, and worth
   * leaving off: a template usually interpolates data, and data is where
   * injected markup arrives from.
   */
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
  /** A filter your application owns, applied alongside the grid's own and
   * invisible to its filter UI. */
  hostFilter?: { active(): boolean; passes(row: Row): boolean };
  /** Anything of yours, passed untouched to renderers, editors and sources. */
  context?: unknown;
  /**
   * Row count above which eligible work is computed in a Worker: column
   * distributions, and a portable sort (a built-in collation with no custom
   * comparator). Below it, everything runs on the main thread.
   */
  workerThreshold?: number;
  /**
   * Compute eligible work off the main thread: column distributions, and a
   * portable sort above {@link GridConfig.workerThreshold} (a re-sort recomputes
   * off-thread while the grid keeps showing the prior order, then swaps to the
   * new one when it lands). Filtering and grouping still run on the main thread.
   */
  useWorker?: boolean;
  /** Where to load the worker kernel from, when hosting it yourself. */
  workerUrl?: string;
  /** Use a shared buffer for the worker, where the page's headers allow it. */
  sharedMemory?: boolean;
  /** A totals line at the foot of each group as well as the grid. */
  groupFooter?: boolean;
  /**
   * Draw the group row yourself.
   *
   * The grid's own group row is an expander, a label and a count. A host that
   * needs more — a section header with a points rollup, a done/total count and
   * a progress bar — supplies this instead, and owns the whole row: it is drawn
   * as one band across every column, and no ordinary cells are mounted for it.
   *
   * Return an HTML string, or a node, or write into `params.element` and return
   * nothing. Unlike `fullWidth.render`, a string here **is** inserted as markup,
   * on the same footing as the board's `cardRenderer`: this is your own template
   * for a row the grid synthesised, not a value out of your data.
   *
   * The chevron is yours to draw and yours to wire: give any element in your
   * markup `data-lat-group-toggle` and a click on it expands or collapses the
   * group, or call `params.toggle()` from a node you built yourself.
   */
  groupRenderer?: (params: GroupRowParams) => string | Node | void;
  /**
   * Which groups start expanded, before anyone has opened or closed one.
   *
   * `true` (the default) opens every group, `false` closes every group, a
   * number opens the first N levels (`0` closes everything, a negative opens
   * every level), and a predicate answers per group — the current sprint's
   * section open while the rest start closed.
   *
   * Only ever consulted for a group nobody has touched: once the user or your
   * code expands or collapses one, that decision stands.
   */
  groupDefaultExpanded?: boolean | number | ((group: GroupInfo) => boolean);
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
   * into them, a section banner, a note, a "load more" affordance.
   *
   * `when` picks the rows; `render` fills them. A full-width row is still one
   * of your data rows: counted by `rows.count()`, sorted, filtered and
   * exported like any other. Only its presentation changes. For a row that
   * should *not* be part of the data, use `pinnedTopRows`.
   */
  fullWidth?: {
    when: (row: Row) => boolean;
    /**
     * Return a string for text, or a node for content. Return nothing and
     * write into `params.element` yourself. An HTML string is deliberately not
     * accepted: see `allowUnsafeTemplates` for that decision elsewhere.
     */
    render: (params: FullWidthParams) => string | Node | void;
  };
  /** Total what the filters left rather than the whole set. */
  totalFilteredOnly?: boolean;
  /** On a change, recompute only the totals whose column moved. */
  totalOnlyChangedColumns?: boolean;
  /** Put the total in the header rather than a footer row. */
  showTotalInHeader?: boolean;
  /**
   * Let the user pick a column's reduction from the column menu. On, the
   * totalling entry becomes an "Aggregate" submenu offering the aggregates the
   * column's type says are meaningful (§9.4); off, the menu keeps its plain
   * "Total this column" toggle. Off by default, so an existing grid is
   * unchanged.
   */
  aggregateChooser?: boolean;
  /** Render only the visible columns once there are more than this many. */
  columnVirtualisationAbove?: number;
  /** The bar beneath the grid, and which panels it carries. */
  statusBar?: boolean | { panels?: string[] };
  /**
   * The cell right-click menu. A function supplies custom items; `false`
   * suppresses it entirely, which is what a read-only grid wants, the default
   * menu offers Paste, Clear and Fill down.
   */
  contextMenu?: boolean | ((p: CellMenuParams, defaults: MenuItem[]) => MenuItem[] | void);
  /**
   * Bringing rows in from a file, the clipboard or a drop (§14, the mirror of
   * export). `true` adds a "Import rows from CSV…" item to the cell menu, makes
   * the grid a drop target for `.csv`/`.tsv` files, and reads a pasted
   * spreadsheet block, each opening a preview the user confirms. An object tunes
   * the affordances. Off by default; the `grid.import` API is always present.
   * Import is a client-side data operation, so it applies to a memory grid.
   */
  import?: boolean | ImportSettings;
  /**
   * Enable the built-in row-delete gesture (§18.4, BACKLOG-0000968) — the
   * Delete/Backspace key on selected rows and a "Delete row" cell-menu item —
   * and the `grid.edit.deleteRows` API. Off by default, because deleting data
   * on a keystroke is destructive and opt-in. Every deletion flows through the
   * cancellable `beforeDelete` event, so a handler can confirm or veto it, on a
   * memory-source grid as well as a remote one.
   */
  rowDelete?: boolean;
  /**
   * The header's 3-dot menu, and the right-click menu on a column heading.
   * `false` suppresses both. A function supplies custom items, receiving the
   * grid's own so it can add to them rather than reproduce them. Default true.
   */
  columnMenu?: boolean | ((p: ColumnMenuParams, defaults: MenuItem[]) => MenuItem[] | void);

  /**
   * Chart a selected cell range — the spreadsheet "chart this selection"
   * gesture. Off by default, so a grid opts in.
   *
   * The DOM layer draws no charts itself — the charts module is optional and
   * loaded by the host — so this is where the host wires the two together: a
   * function, or an object carrying `onChart`, is called with the grid and the
   * selected range when the reader chooses "Chart selection" from the cell
   * menu. The handler typically calls `chartRange` from
   * `lattice-grid/modules/charts`. `true` offers the item and emits nothing
   * extra; supply a handler to have it actually draw.
   */
  rangeChart?:
    | boolean
    | ((grid: Grid, range: CellRange) => void)
    | { onChart?: (grid: Grid, range: CellRange) => void };

  /**
   * The `?` keyboard shortcut overlay. `false` suppresses it, for a host
   * that wants `?` for itself. Default true.
   */
  shortcuts?: boolean;

  /**
   * The in-grid find bar (BACKLOG-0001018): Ctrl+F / Cmd+F with focus in the
   * grid opens it; typing highlights every matching cell in place without
   * filtering a row away; Enter and Shift+Enter step through the matches.
   * `false` removes the bar and its shortcut; the `grid.find` API still works.
   * Default true.
   */
  find?: boolean | FindConfig;

  /**
   * Let a user reorder rows by dragging a handle, or with
   * Alt+Shift+Up/Down.
   *
   * `true` puts the handle in the first visible column; `{ column }` names a
   * different one. The move reorders your data and emits `row:moved`;
   * persisting it is yours, and `rows.data()` afterwards is the new order.
   *
   * Refused, with a reason announced, while a sort, filter or grouping is
   * active, the position a row is dropped at has no single meaning in the
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
   * expressed by turning off the direction you do not want, a source grid is
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
   * rows themselves stay independent: sharing those would make one grid with
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
   * Off by default — a deliberate product default; sticky group headers are
   * opt-in. `true` turns it on, stacking at most two; a number, or `{ depth }`,
   * sets how many may stack: each costs a row of viewport, so a deep grouping
   * would otherwise spend the screen describing itself. `false` is off, the
   * same as leaving it unset.
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
    /**
     * Put the native annotation tools — pen, arrow, rectangle, highlighter — on
     * the rail. Each is a real toggle button that shows pressed while it is the
     * tool in use and turns off when pressed again. Three states, not two:
     * `true` opts in and keeps the tools on the rail always, presentation or
     * not; `false` opts OUT and the tools are never added, not even for a
     * presentation; omitted keeps the default, where the tools are off until a
     * presentation starts, appear for its duration, and leave when it ends.
     */
    annotate?: boolean;
  };
  /**
   * A drag-and-drop group-by strip above the column header — the pattern AG
   * Grid calls the row-group panel. Drag a column heading into it to group by
   * that column; the active groups show as removable, reorderable chips, and
   * reordering the chips changes the nesting order. It is keyboard-operable
   * (arrows navigate, Shift+arrow reorders, Delete ungroups, and an add control
   * groups any column), and every change is announced through the live region,
   * which is why it also addresses the drag-only complaint of BACKLOG-0000429.
   *
   * Off by default and non-breaking, matching `toolPanel`. It drives the same
   * grouping model as `grid.columns.group()`; it reimplements nothing.
   */
  groupPanel?: boolean | {
    /** Placeholder shown while nothing is grouped. */
    hint?: string;
  };
  /**
   * A built-in KPI/stat strip: a labelled band of {@link createStat} tiles the
   * grid places for you, above the column header. Each entry is a stat spec —
   * the same fields {@link StatConfig} takes, minus `grid` and `container`,
   * which the grid supplies — so a strip tile and a hand-placed one are the same
   * object. The tiles follow the grid's filters, recomputing on every change
   * exactly as a stand-alone stat does.
   *
   * Off by default and non-breaking, matching `groupPanel`: no `kpis` means no
   * band and no cost. It reuses `createStat` and reimplements no compute.
   */
  kpis?: Array<Omit<StatConfig, 'grid' | 'container'>>;
  /** The quick filter's initial text. */
  quickFilterText?: string;
  /**
   * Per-column read/write/hidden policy. A usability control, not a
   * security boundary: hidden data is still resident in the store. Enforce the
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
     * `false` (the default) leaves it out entirely. `'pinned'` shows it
     * beneath the rows, struck through: visible history that is not part of the
     * row set, so it is excluded from `rows.count()`, from exports and from
     * selection. `'data'` appends it to the row set instead, so it *is*
     * counted and exported.
     *
     * Neither is sorted or filtered among the live rows: a removed row's values
     * are the snapshot's, and ordering yesterday's numbers among today's would
     * present two data sets as one. Neither can be edited: there is nothing
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
    ask: (p: {
    /** The full text to send: the schema description and the question together. */
    prompt: string;
    /** The grid's schema as data: columns, types and operators. No row values. */
    schema: unknown;
    /** The same schema rendered as text, which is what `prompt` embeds. */
    schemaText: string;
    /** What the user typed. */
    message: string;
    context?: unknown;
  }) => Promise<unknown>;
    schemaOptions?: object;
    context?: unknown;
    element?: HTMLElement;
    placeholder?: string;
  };
  pivot?: {
    enabled?: boolean;
    /**
     * Add a column group totalling every value column across all pivot values,
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
  /**
   * An icon shown in the slot before the label. Three forms, told apart without
   * a second option so existing definitions keep working: a registered sprite
   * name (`'download'`), a single character or emoji (`'↑'`), or author-trusted
   * element markup (`'<i class="fa-light fa-download"></i>'`), which is rendered
   * as an element rather than shown as text. Markup is inserted into the icon
   * slot only — never the label — at the same trust as `action`.
   */
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
  /** The group-subtotal override, when one differs from `total`. */
  groupTotal?: TotalName | null;
  /** The grand-total override, when one differs from `total`. */
  grandTotal?: TotalName | null;
  /**
   * The column's runtime decoration (BACKLOG-0000723), present only when the
   * column carries one, so a `columns.decorate()` survives a saved view and
   * participates in undo/redo. Absent means "not recorded"; an explicit `null`
   * on an undo patch clears a decoration back to plain text.
   */
  decoration?: DecorationName | DecorationSpec | null;
  /** The variant set alongside the decoration, when one is present. */
  variant?: VariantSpec | null;
}

/**
 * A persisted banded-header node (§15, BACKLOG-0000739): a band with a `columns`
 * list whose members are leaf ids or nested bands. This is what round-trips a
 * drag-created group through a saved view.
 */
export interface ColumnGroupState {
  id: string;
  title: string;
  collapsible: boolean;
  openByDefault: boolean;
  columns: Array<string | ColumnGroupState>;
}

export interface GridState {
  version: number;
  columns?: ColumnState[];
  columnOrder?: string[];
  /** The banded-header tree, when the grid has one (BACKLOG-0000739). */
  columnGroups?: ColumnGroupState[];
  filters?: FilterSet;
  /**
   * The `where` predicates that were in force, as names only (BACKLOG-0001202).
   * A predicate is host code: it cannot be serialised into a view or restored
   * from one. `apply` reconciles these against what the host has registered and
   * reports every name it cannot honour rather than restoring a view that
   * silently shows more rows than the one that was saved. Absent when none is
   * registered.
   */
  where?: string[];
  quick?: string;
  sort?: SortEntry[];
  group?: string[];
  pivot?: { enabled: boolean; columns: string[] };
  /**
   * The pivot presentation's collapse state (§10, BACKLOG-0000738): which
   * row-axis and column-axis nodes are collapsed. Absent when the matrix is
   * fully expanded, and tolerated as "expand all" when applied.
   */
  pivotView?: { rowsCollapsed: string[]; columnsCollapsed: string[] };
  formatting?: Record<string, FormattingRule[]>;
  /**
   * Durable annotation marks (BACKLOG-0000813): seeded from here on first paint,
   * and written back by `getState` so a host can persist and restore them. In
   * content coordinates, so they track scroll and resize.
   */
  annotations?: AnnotationMark[];
  expanded?: string[];
  selection?: string[];
  scroll?: { top: number; left: number };
  pagination?: { page: number; pageSize: number };
}

export interface StateApplyReport {
  applied: string[];
  skipped: { key: string; reason: string }[];
}

/**
 * Every top-level section of a {@link GridState} bar `version` — the
 * vocabulary `state.apply`'s `skip` list, `StateApplyReport.applied` and
 * `StateChangedEvent.sections` all speak, derived from `GridState` itself so a
 * new section cannot appear in one and be missing from the others.
 */
export type StateSection = Exclude<keyof GridState, 'version'>;

/**
 * What caused a `state:changed` (BACKLOG-0001182).
 *
 * `'user'` is a change to one part of the view — a sort, a filter, a column
 * moved, resized, pinned or hidden, a grouping, a page — whether it arrived as
 * a gesture or as the equivalent API call. `'apply'` is `state.apply()`,
 * including the restore an undo performs and a `config.state` seed at
 * construction. `'reset'` is `state.reset()`, and is the one a persistence
 * layer skips: saving the reset arrangement writes the default straight back
 * over the view the user had just abandoned.
 */
export type StateChangeCause = 'user' | 'apply' | 'reset';

// ---------------------------------------------------------------------------
// Conditional formatting (spec 8.12)
// ---------------------------------------------------------------------------

export interface FormattingCondition {
  /**
   * A filter operator compared against `value`, or a distribution operator
   * whose threshold comes from the column itself: `{op: 'topPercent', value: 10}`,
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
 * An in-cell proportional bar (BACKLOG-0000955). Drawn as a CSS gradient on the
 * cell background — no extra element, and it composes with the cell's text.
 *
 * The bar's length is the value's position between `min` and `max`. Give both to
 * pin the scale (0 to 100 for a percentage); otherwise `from` derives them from
 * the column — `'minmax'` (the default) spans the data, `'quantile'` the 5th–95th
 * percentile, `'stddev'` a number of deviations either side of the mean. When the
 * range straddles zero, bars grow from a shared axis: positive right, negative
 * left, each in its own colour.
 */
export interface DataBarSpec {
  min?: number;
  max?: number;
  from?: 'minmax' | 'quantile' | 'stddev';
  low?: number;
  high?: number;
  deviations?: number;
  /** The fill for non-negative values. */
  colour?: string;
  /** American spelling of `colour`. */
  color?: string;
  /** The fill for negative values. */
  negativeColour?: string;
  /** American spelling of `negativeColour`. */
  negativeColor?: string;
  /** Which way the bar grows. `'ltr'` (the default) or `'rtl'`. */
  direction?: 'ltr' | 'rtl';
}

/**
 * An icon set (BACKLOG-0000955): a glyph placed beside the value by the band it
 * falls in. Drawn as a `background-image` with padding, so it too needs no extra
 * element and stays a plain style value.
 *
 * `set` names a built-in — `'arrows'`, `'trafficLights'` or `'ratings'` (see
 * {@link ICON_SETS}) — or supply your own ordered `icons` (SVG documents, data
 * URIs or `url(...)` values). Bands are split at `thresholds` (ascending, one
 * fewer than the icons); without them the column's distribution is cut into
 * equal-count bands. `reverse` flips the order so a high value can read as red.
 */
export interface IconSetSpec {
  set?: 'arrows' | 'trafficLights' | 'ratings' | string;
  /** Your own glyphs, low value first: SVG documents, data URIs or `url(...)`. */
  icons?: string[];
  /** How many bands, where the set's size is not fixed (e.g. `'ratings'`). */
  count?: number;
  /** Band edges, ascending; one fewer than the number of icons. */
  thresholds?: number[];
  /** Reverse the glyph order, so the highest band takes the first icon. */
  reverse?: boolean;
  /** Glyph height in pixels. Default 16. */
  size?: number;
}

/**
 * One rule. A condition and the styling it produces, a colour scale, a data bar
 * or an icon set. A rule held as runtime state must be JSON, so `style` may not
 * be a function there (config-time `cell.style` still accepts one) and a data
 * bar / icon set / scale is the JSON way to say the same visual intent.
 */
export interface FormattingRule {
  id?: string;
  when?: FormattingCondition;
  style?: CellStyle | ((p: CellParams) => CellStyle | null);
  scale?: FormattingScale;
  /** An in-cell proportional bar (BACKLOG-0000955). */
  dataBar?: DataBarSpec;
  /** A per-band glyph beside the value (BACKLOG-0000955). */
  iconSet?: IconSetSpec;
  stopIfTrue?: boolean;
  enabled?: boolean;
  label?: string;
}

/** The built-in icon set names, id to label, for a panel to offer. */
export const ICON_SETS: Readonly<Record<string, string>>;

/** A column id, or `'*'` for every column. */
export type FormattingScope = string;

/** An interval for an estimated figure, at a stated level. */
export interface ConfidenceInterval {
  mean: number;
  lower: number;
  upper: number;
  margin: number;
  n: number;
  /** The level the bounds were computed at, 0 to 1. */
  confidence: number;
}

/** A Wilson score interval for a rate. Stays inside 0 to 1 at the extremes. */
export interface ProportionInterval {
  proportion: number;
  lower: number;
  upper: number;
  n: number;
  confidence: number;
}

/** An interval for a capability index, by Bissell's approximation. */
export interface CapabilityInterval {
  index: number;
  lower: number;
  upper: number;
  margin: number;
  n: number;
  confidence: number;
}

/** What a pushdown adapter can answer. Everything is off unless declared. */
export interface PushdownCapabilities {
  /** `false`, a single field and term, a flat conjunction, or a full tree. */
  filter?: false | 'term' | 'flat' | 'tree';
  /** Which comparison operators the engine understands. */
  operators?: string[];
  /** `false`, one column only, or many. */
  sort?: false | 'single' | 'multi';
  /** Whether a free-text search across columns can be pushed. */
  quick?: boolean;
  /** Whether the engine can return a window rather than the whole result. */
  range?: boolean;
  /** Whether it can report the count of matching rows. */
  total?: boolean;
  /**
   * Whether it can answer the grid's grouped view — group rows, their counts,
   * their subtotals and their order — one level at a time, instead of returning
   * the leaves for the grid to group in the browser (BACKLOG-0001325).
   *
   * All or nothing, unlike `filter`. A filter splits because the engine
   * narrowing a superset and the grid narrowing what is left reach the same set;
   * a grouping cannot, because group rows counted over the wrong set are wrong
   * rows, not slow ones. So the push router refuses the whole grouped level —
   * and says why in `PushdownPlan.groupReason` — whenever anything else in the
   * query failed to push.
   *
   * An adapter declaring this must implement `executeGroupLevel`; one that
   * declares it without the method is re-planned without grouping and warned
   * about, rather than half-pushed.
   */
  group?: boolean;
  /**
   * What the adapter can persist back — the write-back contract (§4.1). `false`
   * (the default) is read-only by declaration. A declared block opts kinds in;
   * `capabilitiesOf` resolves it to a full `MutateCapability` (or `false`).
   */
  mutate?: false | MutateCapability;
}

/** An engine the grid can query, and what it is able to answer. */
export interface PushdownAdapter {
  /** Used in diagnostics and in the message when work cannot be pushed. */
  name?: string;
  capabilities?: PushdownCapabilities;
  /** Run the part of the query the adapter declared it could handle. */
  execute(query: RemoteRequest, request?: RemoteRequest):
    Promise<{ rows: unknown[]; total?: number }>;
  /**
   * Answer one level of a grouped grid (BACKLOG-0001325). Present only when
   * `capabilities.group` opts in.
   *
   * The level is `query.groupValues.length`: the root asks for the outermost
   * grouping column's distinct values, expanding a group asks for the next
   * column's values within it, and past the last grouping column the children
   * are the leaves (`leaves: true`).
   *
   * A group row comes back in the shape the remote source already reads from a
   * grouping server: the grouping column's own id carries the key, `leafCount`
   * the group's row count, `totals` the subtotals keyed by column id. `total` is
   * how many group rows the level holds. At the root, `matchCount` and `grand`
   * carry the whole-set figures a grouped window cannot derive — the rows the
   * filter matched, and the grand total over them.
   *
   * `aggregates` is the subtotal list the source routed to the engine; anything
   * it could not route is named in `PushdownPlan.aggregates.client` and left
   * absent from the group row rather than computed over the wrong set.
   */
  executeGroupLevel?(
    query: RemoteRequest,
    aggregates: Array<{ id: string; col: string; fn: string; weight?: string }>,
    request?: RemoteRequest,
  ): Promise<{
    rows: unknown[];
    total?: number;
    leaves?: boolean;
    matchCount?: number;
    grand?: Record<string, unknown>;
  }>;
  /**
   * The row count before any filter (BACKLOG-0001325) — the denominator of
   * "1,204 of 100,000" under grouping, where the display count is group headers
   * rather than rows. Optional; a source falls back to the display count.
   */
  unfilteredCount?(): Promise<number | null>;
  /**
   * Persist one mutation (§4.2). Present only when `capabilities.mutate` opts
   * in. `createPushdownSource` synthesises an `edit.commit` that calls this for
   * cell updates (§4.3 Option A); `request` threads the abort signal through the
   * way `execute` receives it, and auth already lives on the adapter.
   */
  mutate?(op: MutationOp, request?: RemoteRequest): Promise<MutationResult>;
}

/** How one request was divided between the engine and the grid. */
export interface PushdownPlan {
  /** The query the adapter was given. */
  pushed: RemoteRequest;
  /**
   * What the grid applied afterwards. `where` is the host predicate runtime
   * when one survived the `whereRowLimit` gate, and `null` when none was
   * registered or the gate refused it (BACKLOG-0001268).
   */
  residual: {
    filters: object | null;
    sort: SortEntry[] | null;
    quick: string;
    where: WhereRuntime | null;
    /**
     * Whether the rows the residual runs over are the whole matching set rather
     * than a fetched fraction (BACKLOG-0001268). Set by the source when it hands
     * the residual to `applyResidual`; absent on the plan `lastPlan()` reports,
     * because it is a property of one fetch's result, not of the plan.
     *
     * When true the counts the residual produces are whole-dataset counts, so
     * the page-relative `where` warning is suppressed. Absent counts as not
     * whole: silence has to be earned.
     */
    whole?: boolean;
  };
  /** Whether the whole result had to be fetched rather than a window. */
  needsAll: boolean;
  /**
   * Which parts could not be pushed: `filter`, `sort`, `quick`, `where`,
   * `group`.
   */
  unpushed: string[];
  /**
   * Whether the engine answered the grid's grouped view for this request
   * (BACKLOG-0001325). False for an ungrouped query and for a grouped one the
   * engine was refused — `groupReason` says which.
   */
  grouped: boolean;
  /**
   * Which grouping level a pushed grouped request asked for: 0 at the root, 1
   * inside a group, and so on. Zero when nothing was grouped.
   */
  groupLevel: number;
  /**
   * Why a grouped request was *not* pushed, in a sentence, or `''` when it was
   * pushed or when nothing was grouped. Grouping is all or nothing, so this is
   * the whole story rather than a residual.
   */
  groupReason: string;
  /**
   * Whether the whole result was fetched because `fullDataset` is on, rather
   * than only because residual work forced it. When true, totals and statistics
   * reduce over the whole matching set and the windowed-stat warning is silent.
   */
  full: boolean;
  /**
   * Per-aggregate provenance, present only when the last request computed
   * aggregates (BACKLOG-0000730 Part B): which statistics the engine computed
   * and which the client did, with the class the pushdown map assigned each.
   * Under grouping it also carries the `groupBy` the subtotals were computed
   * over. Build-time inspection, not a runtime per-figure marker.
   */
  aggregates?: {
    engine: AggregateProvenance[];
    client: AggregateProvenance[];
    groupBy?: string[];
  };
}

/**
 * Opt-in, sticky full-dataset pull for a pushdown/remote source
 * (BACKLOG-0000730). Off by default. When enabled, the source materialises the
 * entire matching set client-side once per query signature and serves every
 * window, total and statistic from it, so those figures are computed over the
 * whole set rather than the loaded window. A set past either limit is refused
 * with a visible `source:error` — never silently truncated.
 */
export interface PushdownFullDatasetConfig {
  /** Sticky: hold the whole matching set client-side. Default `false`. */
  enabled?: boolean;
  /** Refuse (visible error) past this many rows. Default `1_000_000`. */
  maxRows?: number;
  /** Refuse past this estimated heap cost, in bytes. Default `512 * 1024 * 1024`. */
  maxBytesEstimate?: number;
}

/** How one requested aggregate should be computed. */
export type AggregateMode = 'engine' | 'client' | 'engine-if-identical';

/**
 * Design-time aggregate-pushdown policy for a pushdown source
 * (BACKLOG-0000730 Part B). The developer chooses, at grid setup
 * before render, whether each statistic is computed by the engine (fast, over
 * the matching set) or client-side (the grid's exact definition, needs a
 * full-dataset pull). It is fixed for the life of the grid, never a runtime
 * toggle, and never surfaced to an end user.
 *
 * Absent, every aggregate is computed client-side — today's behaviour, so no
 * existing caller regresses. `engine-if-identical` is the recommended setting
 * for a windowed DuckDB source: it pushes only the statistics whose engine
 * result is verified identical to the grid kernel, keeping the documented
 * MAY-DIFFER stats (e.g. `mode`) client-side. The engine is used only when the
 * filter is fully pushed; a residual filter forces every aggregate client-side,
 * so an engine figure and a client figure never mix in one result set.
 */
export interface PushdownAggregatesConfig {
  /**
   * The default policy for stats the engine can express. `'engine'` pushes
   * everything expressible (using the engine's method for MAY-DIFFER stats);
   * `'engine-if-identical'` pushes only the verified-identical ones; `'client'`
   * computes everything client-side. Default `'client'`.
   */
  default?: AggregateMode;
  /** Per-stat overrides, winning over `default`. A stat the engine cannot
   *  express (`weightedQuantile`) is always client-side regardless. */
  overrides?: Record<string, 'engine' | 'client'>;
}

/**
 * One aggregate the grid asks the source to compute over the matching set.
 * `params` carries e.g. `{ share: 0.1 }` so an adapter emits the matching SQL;
 * `weight` names the second column for a two-column stat like `correlation`.
 */
export interface AggregateRequest {
  /** Keys the result back to the request. */
  id: string;
  /** The column to reduce. */
  col: string;
  /** The statistic name, as used in `total: '<name>'`. */
  fn: string;
  /** The second column, for a two-column statistic. */
  weight?: string;
  /** Parameters the statistic takes, e.g. a trim share. */
  params?: Record<string, unknown>;
}

/** How one aggregate was routed, for `lastPlan()` provenance. */
export interface AggregateProvenance {
  id: string;
  col: string;
  fn: string;
  /** How the engine result relates to the grid kernel. */
  class: 'identical' | 'may-differ' | 'fallback';
  /** Why it is client-side, when it is (config, fallback, or the guard). */
  reason?: string;
  weight?: string;
  /** Parameters the statistic takes, carried through so an adapter emits the
   *  matching SQL (e.g. a trim share). */
  params?: Record<string, unknown>;
}

export interface PushdownSourceConfig {
  adapter: PushdownAdapter;
  /** The compute barrel, for applying whatever the engine could not. */
  compute?: object;
  pageSize?: number;
  /**
   * Opt-in full-dataset pull. Off unless `fullDataset.enabled` is set. See
   * {@link PushdownFullDatasetConfig}.
   */
  fullDataset?: PushdownFullDatasetConfig;
  /**
   * Design-time aggregate-pushdown policy. Absent = client-side (today's
   * behaviour). See {@link PushdownAggregatesConfig}.
   */
  aggregates?: PushdownAggregatesConfig;
  /**
   * Accept a partial/paged result to a whole-set request when residual work
   * (a filter, sort or quick search) will run over it client-side. Off by
   * default: such a shortfall is refused with a thrown error, because filtering
   * or sorting a fraction of the result presents the wrong rows as the whole
   * filtered set — a wrong answer, not a slow one. Set `true` only when you
   * knowingly accept that risk (e.g. an adapter that cannot page and a result
   * small enough not to matter); the old warn-once-and-proceed behaviour is
   * then kept. It never changes the fullDataset memory-guard or the
   * no-residual short-return warning.
   */
  allowPartialResults?: boolean;
  /**
   * The most rows the source will fetch and hold in order to run a twinless
   * `where` predicate as the residual (BACKLOG-0001268). Defaults to `50_000`,
   * the same anchor as the grid's `workerThreshold` — the size at which this
   * codebase already judges a dataset big enough to need different handling.
   *
   * A `where` predicate is a host function no engine can evaluate, so the only
   * way to honour one is to fetch every matching row and filter here. That
   * silently turns a windowed grid into a whole-dataset download, which is the
   * thing a pushdown source exists to avoid. So it is a gate, not a free
   * upgrade: at or past this many matching rows the predicate is **refused and
   * warned about** — the rows it would exclude stay on screen — rather than the
   * download being taken on the host's behalf. An adapter that reports no row
   * total counts as over the limit, because guessing the other way is guessing
   * your way into the download.
   *
   * Raise it when you want that download; the `{ condition }` twin is the route
   * that narrows the fetch itself and works at any size.
   */
  whereRowLimit?: number;
}

export interface StatisticsApi {
  /**
   * One shadow value for one row, by the column it shadows and the kind. For
   * `kind: 'specStatus'`, `spec` carries the `{lower, upper, warnLower,
   * warnUpper}` limits to judge the row's value against; other kinds ignore it.
   */
  shadow(colId: string, kind: ShadowKind, rowKey: string,
    scope?: 'all' | 'filtered', spec?: object): unknown;
  /**
   * One regression shadow value for a row, by key (BACKLOG-0000812): the
   * predicted value, residual, or Cook's-distance influence flag from the fitted
   * model, over the filtered rows. Null for a row outside the fit.
   */
  fitShadow(kind: 'fitPredicted' | 'fitResidual' | 'fitInfluence'
    | 'fitStdResidual' | 'fitLeverage' | 'fitCooksD',
  rowKey: string, spec: RegressionSpec): number | boolean | null;
  /** A running total at one row, down the grid as it is currently ordered. */
  running(colId: string, kind: 'total' | 'percent', rowKey: string): number | null;
  /** Make the current values the new baseline: "mark all". */
  rebase(colId?: string): void;
  /** What the shadow histories are costing. */
  tracking(): { columns: string[]; rows: number; forgotten: number };
  /** Reduce a column by a named kernel over the filtered rows. */
  reduce(colId: string, fn: string): unknown;
  /** Everything worth knowing about one column, in one pass each. */
  profile(colId: string): ColumnProfile | null;
  /**
   * The rows that do not belong (BACKLOG-0000749): anomaly detection over the
   * filtered rows by the robust modified z-score (`modifiedZScore`, the
   * default), Tukey's IQR fences (`iqr`), or multivariate Mahalanobis distance
   * over the chosen columns (`mahalanobis`). Every flagged row carries the score
   * behind it and the reason for it, so a flag is explainable rather than a
   * verdict from nowhere. Non-numeric columns are returned under `skipped`.
   */
  anomalies(opts?: { columns?: string[];
    method?: 'modifiedZScore' | 'iqr' | 'mahalanobis' | 'rollingModifiedZScore' | 'rollingIqr';
    threshold?: number; k?: number; p?: number; windowLen?: number; minPeriods?: number }): AnomalyReport;
  /**
   * Which columns differ most between the filtered subset and the whole
   * population it was drawn from, ranked by effect size — never by a p-value.
   * The measure is stated per column; a numeric and a categorical column are put
   * on one bounded scale so they rank against each other.
   */
  subsetVsPopulation(opts?: { columns?: string[] }): SubsetComparison;
  /**
   * Which columns differ most between this grid and another, ranked by effect
   * size — never by a p-value (BACKLOG-0000735). The generalisation of
   * {@link subsetVsPopulation} from subset-vs-population to dataset-vs-dataset:
   * two independent grids, yoked by passing one in, no shared store. A numeric
   * column reports a pooled standardised mean difference (Cohen's d, symmetric
   * in the two peers where Glass's delta is not); a categorical column the total
   * variation of its category mix; both land on one bounded scale. Both sides
   * are read over their filtered rows. Only shared columns are ranked; a column
   * on one side alone is returned under `unmatched`.
   */
  datasetVsDataset(other: Grid, opts?: { columns?: string[] }): DatasetComparison;
  /**
   * Is the difference between two groups real? A two-sample test returned as
   * data to interpret — never a verdict (BACKLOG-0000750). The significance
   * boundary the comparison story (653, 735) stopped short of: those rank by how
   * *much* columns differ and return no p-value; this answers *how sure* for one
   * chosen pair of groups and hands the p-value back as data. There is no
   * `significant` flag, no badge, and no multiple-comparison correction. The
   * rows are split by `opts.by`, the test is chosen by the column's family and
   * named in the result (overridable with `opts.test`): Welch's t or
   * Mann-Whitney U for a numeric column, chi-square for a categorical one. Every
   * result pairs a confidence interval on the difference with the effect size,
   * so it is always "how big and how sure".
   */
  compareGroups(colId: string, opts: TwoSampleSpec): GroupComparison | null;
  /** Pearson's correlation between two columns. */
  correlation(a: string, b: string): number | null;
  /** Covariance, a correlation before the scales are divided out. */
  covariance(a: string, b: string, opts?: { population?: boolean }): number | null;
  /** Least-squares fit of `b` on `a`: in finance, beta and alpha. */
  regression(a: string, b: string): RegressionFit | null;
  /**
   * Fit a multi-predictor linear model over the filtered rows and return the
   * full diagnostic set — coefficients with standard errors, t and p; R² and
   * adjusted R²; per-row fitted values, residuals, leverage and Cook's D; VIF
   * per predictor; a Breusch–Pagan heteroscedasticity flag; and, for a single
   * predictor, a pointwise confidence band. `method` is `ols`, `wls` (needs a
   * `weights` column) or `robust`; `quantile` is reserved and the regularised
   * families refuse. Null on degenerate input (BACKLOG-0000792).
   */
  regressionModel(spec: RegressionSpec): RegressionModel | null;
  /**
   * The Augmented Dickey-Fuller stationarity test over the `of` series in
   * `orderBy` order (BACKLOG-0000873), constant+trend form with the lag order
   * chosen by AIC up to an optional cap. Returns the statistic, the lag used,
   * MacKinnon's critical values, an approximate (interpolated) p-value and a
   * plain-language verdict at the 5% level — a scalar readout, not a column.
   */
  adf(spec: { of: string; orderBy: string; maxlag?: number }): AdfResult | null;
  /**
   * The autocorrelation (ACF) and partial autocorrelation (PACF) of the `of`
   * series in `orderBy` order out to `maxlag` (BACKLOG-0000873), with the
   * approximate ±1.96/√n band. A short-series readout; feed the arrays to a bar
   * chart over explicit points with the band as reference lines. The lag-1
   * autocorrelation matches `series(...).autocorrelation`.
   */
  acf(spec: { of: string; orderBy: string; maxlag?: number }): AcfResult | null;
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
    /** Which rule set the violations are judged against. Western Electric by default. */
    rules?: 'westernElectric' | 'nelson';
    /** The level for the capability interval. 0.95 by default. */
    confidence?: number;
  }): ProcessCapability | null;
  /**
   * A confidence interval for what a column measures, the range the estimate
   * pins the figure down to, not a verdict about it.
   *
   * Reads the rows the filters left, so an interval narrows as the grid does:
   * it describes the filtered population, not the whole table.
   */
  interval(colId: string, opts?: {
    kind?: 'mean' | 'proportion';
    confidence?: number;
    /** Which rows count as successes, for a proportion. Truthiness by default. */
    where?: (value: unknown, row: Row) => boolean;
  }): ConfidenceInterval | ProportionInterval | null;
  /**
   * How a column varies along an ordering. `by` is required and never guessed:
   * kernels see rows in the order they arrived, which is not the grid's sort.
   */
  series(colId: string, opts: { by: string; periodsPerYear?: number }): SeriesStats | null;
  /**
   * Forecast one column forward (BACKLOG-0000963): the stats-surface face of the
   * {@link forecast} kernel. The column is read over the filtered rows in arrival
   * order, or ordered by `opts.by` (a date or numeric column, as {@link series}
   * orders) when the time axis matters, then projected `opts.horizon` steps ahead
   * by `opts.method` (default `linear`) with a prediction band where one applies.
   * Every kernel option passes through; returns the same {@link ForecastResult},
   * or null when the column is unknown or too short.
   */
  forecast(colId: string, opts?: {
    method?: 'movingAverage' | 'ses' | 'holt' | 'holtWinters' | 'linear';
    horizon?: number; confidence?: number; windowLen?: number;
    alpha?: number; beta?: number; gamma?: number; period?: number;
    /** The column to order by before forecasting — a date or numeric axis. */
    by?: string;
  }): ForecastResult | null;
  /** A weighted average of one column by another. */
  weightedAverage(colId: string, weightId: string): number | null;
  /** The key a row's data resolves to. */
  keyOf(data: unknown): string | null;
  /** Which reductions can be maintained against a change, and which rescan. */
  readonly maintenance: Readonly<Record<string, 'maintained' | 'rescan'>>;
  /**
   * The approximate tier: kernels a sketch maintains in constant time per tick,
   * keyed by kernel name, each carrying the sketch that backs it and the error
   * bound that sketch is verified to meet.
   */
  readonly approximate: Readonly<Record<string, ApproximateEntry>>;
  /**
   * The honest tier for one kernel across both the exact and approximate maps:
   * its exact tier and, when one exists, the approximate alternative and bound.
   */
  maintenanceTier(fn: string): MaintenanceTier;
  /**
   * A windowed aggregate — "the average lately" (BACKLOG-0000654) — over one
   * column, stamped with the window it covers (`over`), so a windowed figure is
   * never read without its window. Exact over the values inside the window.
   *
   * `kind: 'count'` takes the last `span` values in arrival order. `kind:
   * 'time'` takes the values within the last `span` ms (or `minutes`) and `kind:
   * 'session'` takes every value; both need a timestamp column, so `by` is
   * required for them and never guessed. Returns null when the column, or the
   * `by` column, is unknown.
   */
  windowed(colId: string, fn: WindowedFn, opts: {
    kind: 'count' | 'time' | 'session';
    /** N ticks for a count window, or N ms for a time window. */
    span?: number;
    /** N minutes for a time window, converted to ms. */
    minutes?: number;
    /** A timestamp column; required for a time or session window. */
    by?: string;
  }): WindowedResult | null;
}

/** A named aggregate a windowed reduction can return. */
export type WindowedFn =
  | 'sum' | 'avg' | 'mean' | 'min' | 'max' | 'count' | 'variance' | 'stddev';

/** One windowed figure and the window it covers. */
export interface WindowedResult {
  /** The reduction, or null when the window held no usable values. */
  value: number | null;
  /** The window the figure was computed over — always stated. */
  over: WindowSpec;
}

/** How an approximate reduction's error bound holds, and what it measures. */
export interface ErrorBound {
  /** `deterministic` every run, `probabilistic` in expectation, `exact` to float rounding. */
  kind: 'deterministic' | 'probabilistic' | 'exact';
  /** What the number measures. `rank` is a fraction of the rank, for quantiles. */
  metric: 'absolute' | 'relative' | 'rank' | 'none';
  /** The bound itself, in the unit `metric` names. */
  value: number;
  /** A one-line human reading of the guarantee. */
  statement: string;
}

/** One entry of the approximate maintenance tier. */
export interface ApproximateEntry {
  /** The sketch that backs this kernel: `HyperLogLog`, `KLL`, `SpaceSaving`. */
  sketch: string;
  /** The error bound the sketch is verified to meet. */
  bound: ErrorBound;
}

/** The maintenance label for one kernel across both tiers. */
export interface MaintenanceTier {
  /** The kernel name. */
  stat: string;
  /** Its exact tier, or null when it is not an exact kernel. */
  exact: 'maintained' | 'rescan' | null;
  /** The approximate alternative and bound, or null when none exists. */
  approximate: ApproximateEntry | null;
}

/** The window a windowed aggregate was computed over. */
export interface WindowSpec {
  /** Which window: last N ticks, last N ms, or the session. */
  kind: 'count' | 'time' | 'session';
  /** The size: N ticks, N ms, or the session duration in ms. */
  span: number;
  /** How many values actually fell inside the window. */
  size: number;
}

/** The three window kinds a caller may ask for. */
export const WINDOW_KINDS: readonly ('count' | 'time' | 'session')[];

/**
 * A sliding window over a stream of timestamped values (BACKLOG-0000654). Holds
 * the values currently in the window and re-reduces them on demand; the reduction
 * is exact over the values in the window. `grid.statistics.windowed(...)` drives
 * one of these over a column; a host can also drive one live, tick by tick.
 */
export class Window {
  constructor(kind: 'count' | 'time' | 'session', span?: number, now?: () => number);
  /** How many values are in the window right now. */
  readonly size: number;
  /** Add one value at an explicit or current timestamp. */
  push(v: number, t?: number): void;
  /** The window descriptor as it stands now. */
  spec(): WindowSpec;
  /** The values currently in the window, oldest first. */
  values(): number[];
  /** Every windowed aggregate at once, each stamped with the window. */
  aggregate(): {
    over: WindowSpec; count: number; sum: number | null; mean: number | null;
    min: number | null; max: number | null; variance: number | null; stddev: number | null;
  };
  /** One named aggregate over the window, stamped with the window it covers. */
  reduce(fn: WindowedFn): WindowedResult;
}

/** Build a window from a caller's spec: last N ticks, last N minutes/ms, or the session. */
export function openWindow(
  opts: { kind: 'count' | 'time' | 'session'; span?: number; minutes?: number },
  now?: () => number,
): Window;

/**
 * The anomaly-detection methods (BACKLOG-0000749): the robust univariate
 * modified z-score, Tukey's IQR fences, and multivariate Mahalanobis distance.
 * Interpretable statistics with written-down cuts, never a black box.
 */
export const ANOMALY_METHODS: readonly ('modifiedZScore' | 'iqr' | 'mahalanobis')[];

/**
 * Per-row modified z-scores and flags for one column of readings — the robust
 * outlier score on the median and MAD (`0.6745·(x − median)/MAD`), flagged past
 * `threshold` (default 3.5). Robust to the outliers themselves: one wild reading
 * cannot inflate the spread and hide. A non-finite reading and a zero-MAD column
 * yield a null score and no flag rather than an invented one.
 */
export function modifiedZScores(
  values: ArrayLike<number>,
  opts?: { threshold?: number },
): { median: number | null; mad: number | null; threshold: number;
  scores: (number | null)[]; flags: boolean[]; flagged: number };

/**
 * Tukey's fences for one column: `[Q1 − k·IQR, Q3 + k·IQR]` (default `k = 1.5`),
 * the same fence the box plot draws, with R type 7 quartiles. Null when there
 * are no readings.
 */
export function iqrFences(
  values: ArrayLike<number>,
  opts?: { k?: number },
): { q1: number; q3: number; iqr: number; lower: number; upper: number; k: number } | null;

/**
 * Mahalanobis distance of every row from the joint centre, in the metric of the
 * data's own sample covariance, cut at a χ² quantile (default the 0.975 point).
 * Catches a row impossible only in combination, which a per-column scan misses.
 * A row with any missing coordinate gets a null distance; a singular covariance
 * is ridge-regularised and reported as `singular` rather than throwing.
 */
export function mahalanobis(
  matrix: number[][],
  opts?: { p?: number; ridge?: number },
): { center: number[]; df: number; cutoff: number; singular: boolean; used: number;
  distances: (number | null)[]; squared: (number | null)[]; flags: boolean[];
  flagged: number } | null;

/**
 * The rolling (windowed) anomaly methods (BACKLOG-0000954): the robust modified
 * z-score and Tukey's IQR fences, each computed over a trailing window rather
 * than the whole series, for live monitoring where a drift or a shifted regime
 * must not poison a global baseline.
 */
export const ROLLING_ANOMALY_METHODS: readonly ('rollingModifiedZScore' | 'rollingIqr')[];

/**
 * Rolling (windowed) anomaly detection (BACKLOG-0000954): judge every reading
 * against a causal trailing window ending at it — the current point and the
 * `window − 1` before it — so a spike is caught against its recent neighbours and
 * a slow drift does not permanently poison the baseline. With a window at least
 * as long as the series (and `minPeriods` of 1) the last point's score equals the
 * static {@link modifiedZScores} score. A non-finite reading, a too-short window
 * (`minPeriods`) or a zero-MAD window yields a null score and no flag.
 */
export function rollingAnomalies(
  values: ArrayLike<number>,
  opts?: {
    method?: 'rollingModifiedZScore' | 'rollingIqr';
    windowLen?: number; threshold?: number; k?: number; minPeriods?: number;
  },
): { method: string; windowLen: number; minPeriods: number; threshold: number; k: number;
  scores: (number | null)[]; flags: boolean[]; flagged: number };

/**
 * Build a Data Router alert condition from an anomaly detector (BACKLOG-0000954):
 * a `(rows) => signal` for the router's existing `router.alert(value, condition,
 * handler)` (BACKLOG-0000909), so live monitoring reuses the router's
 * partitioning, debounce and rising-edge re-arm rather than duplicating any of
 * it. Reads one numeric `field` off each row, runs the chosen detector, and
 * returns the flagged rows and scores when anything is anomalous or `false` when
 * nothing is. `orderBy` names the axis rolling methods window on; `latest` signals
 * only when the newest reading is the anomaly.
 */
export function anomalyCondition(
  opts: {
    field: string;
    method?: 'modifiedZScore' | 'iqr' | 'rollingModifiedZScore' | 'rollingIqr';
    orderBy?: string; latest?: boolean;
    windowLen?: number; threshold?: number; k?: number; minPeriods?: number;
  },
): (rows: Iterable<Record<string, unknown>>) =>
  false | { method: string; field: string; flagged: { row: Record<string, unknown>; score: number | null }[] };

/**
 * The forecasting methods a caller may ask for (BACKLOG-0000963), named so a
 * result says which produced it: a trailing moving average, single / double
 * (Holt) / triple (Holt-Winters) exponential smoothing, and a linear least-squares
 * fit of the time axis.
 */
export const FORECAST_METHODS: readonly ('movingAverage' | 'ses' | 'holt' | 'holtWinters' | 'linear')[];

/** One forecast step: the point estimate and, where a band applies, its interval. */
export interface ForecastPoint {
  /** The step ahead, `1 … horizon`. */
  step: number;
  /** The time-axis position the step is stamped at, extrapolated at the mean spacing. */
  at: number;
  /** The point forecast. */
  mean: number;
  /** The prediction-interval lower bound (a future observation), or null when none applies. */
  lower: number | null;
  /** The prediction-interval upper bound, or null when none applies. */
  upper: number | null;
  /** The mean-response (confidence) lower bound — `linear` only, the band a trendline draws. */
  lowerMean?: number | null;
  /** The mean-response (confidence) upper bound — `linear` only. */
  upperMean?: number | null;
  /** The prediction standard error the band was built from, or null when none applies. */
  se: number | null;
}

/** A forecast: the chosen model, its parameters, and the projected points. */
export interface ForecastResult {
  /** Which method produced it. */
  method: 'movingAverage' | 'ses' | 'holt' | 'holtWinters' | 'linear';
  /** How many steps ahead were projected. */
  horizon: number;
  /** The band level, e.g. 0.95. */
  confidence: number;
  /** How many finite readings the fit used. */
  n: number;
  /** The residual standard deviation the bands were built from, or null when there was none. */
  sigma: number | null;
  /** The fit's coefficient of determination — `linear` only. */
  r2?: number;
  /** The model parameters: `slope`/`intercept` (linear), `alpha`/`beta`/`gamma`/`period`, or `windowLen`. */
  params: {
    slope?: number; intercept?: number;
    alpha?: number; beta?: number; gamma?: number; period?: number; windowLen?: number;
  };
  /** The forecast, one entry per step. */
  points: ForecastPoint[];
}

/**
 * Forecast an ordered series `horizon` steps into the future (BACKLOG-0000963).
 *
 * `movingAverage` and `ses` are flat forecasts (the trailing-window mean, the
 * final smoothed level); `holt` adds a projected trend, `holtWinters` a projected
 * trend and an additive seasonal of period `opts.period`; `linear` extrapolates
 * an ordinary least-squares fit of the time axis. A prediction band is carried
 * where a defensible closed form exists — the exponential-smoothing bands are the
 * innovations state-space forecast variances at the normal quantile; the linear
 * and moving-average bands are the exact Student-t intervals, and `linear` also
 * reports the narrower mean-response (confidence) band. A smoothing factor absent
 * from `opts` is fit by minimising the in-sample one-step SSE. Returns null when
 * the series is too short for the chosen method.
 */
export function forecast(
  seq: ArrayLike<number | null> | { at?: number; value: number | null }[],
  opts?: {
    method?: 'movingAverage' | 'ses' | 'holt' | 'holtWinters' | 'linear';
    horizon?: number; confidence?: number; windowLen?: number;
    alpha?: number; beta?: number; gamma?: number; period?: number;
  },
): ForecastResult | null;

export type ShadowKind =
  | 'updates' | 'updatedAt' | 'sinceUpdate' | 'delta' | 'deltaPercent'
  | 'rate' | 'history' | 'firstValue' | 'streak'
  /** Where the row sits among the others, over every tracked row. */
  | 'rank' | 'rankAsc' | 'rankChange' | 'percentile' | 'quartile'
  | 'zScore' | 'shareOfTotal'
  /**
   * A robust outlier score and flag per row (BACKLOG-0000749): the modified
   * z-score on the median and MAD, and the boolean of whether it clears
   * `threshold` (default 3.5, read off the shadow declaration). Sortable,
   * filterable, groupable and exportable like any cell. Null where there is no
   * robust spread to score against.
   */
  | 'anomalyScore' | 'anomalyFlag'
  /**
   * The row's pass/fail verdict against a hard-limit spec, as a value:
   * `'PASS'`, `'WARN'` or `'FAIL'`. Sortable, filterable, groupable and
   * exportable, and rolled up by the `passRate`/`failureCount` totals. Reads
   * `{lower, upper}` (and optional inner `{warnLower, warnUpper}`) off the
   * shadow declaration; centred-target ± tolerance is a deliberate follow-up.
   */
  | 'specStatus'
  /**
   * Rolling time-series aggregates over a stated `orderBy` (BACKLOG-0000748,
   * Phase 1), computed in one ordered pass the grid caches by row key and never
   * over the screen sort. `rollingSum`/`rollingAvg`/`rollingMin`/`rollingMax`
   * reduce the `window`; `windowCoverage` reports how much of the requested
   * window a row actually covers (so a partial window is never dressed as full);
   * `cumulativeToDate` is the running total to the row; `periodOverPeriod` is the
   * change on the previous period (lag-1 in Phase 1). Sortable, filterable,
   * groupable and exportable like any cell.
   */
  | 'rollingSum' | 'rollingAvg' | 'rollingMin' | 'rollingMax'
  | 'windowCoverage' | 'cumulativeToDate' | 'periodOverPeriod'
  /**
   * A rolling quantile over the `orderBy` window (BACKLOG-0000748) — a trailing
   * median or p95, the quantile set by `q`. Exact while the window is small;
   * past an internal span cap, and for a session window, it comes from a KLL
   * sketch and `windowApproximate` reports which rows are approximate, so a
   * sketched quantile is never presented as exact.
   */
  | 'rollingQuantile' | 'windowApproximate'
  /**
   * Classical seasonal decomposition over a declared `period` (BACKLOG-0000873),
   * matching `statsmodels.seasonal_decompose`: `tsTrend` is the centred
   * moving-average trend, `tsSeasonal` the repeating seasonal index, `tsResidual`
   * what the two leave behind, and `tsCoverage` the stamp (1 for an interior row,
   * 0 for a partial edge where the centred window runs off the end, so an edge is
   * never emitted as full). Additive by default; `decomposition: 'multiplicative'`
   * is a declared option, undefined on a non-positive series.
   */
  | 'tsTrend' | 'tsSeasonal' | 'tsResidual' | 'tsCoverage'
  /**
   * Exponential smoothing over the `orderBy` series (BACKLOG-0000873):
   * `tsSmoothed` is the fitted level from single exponential smoothing (`ses`) or
   * Holt's level+trend (`holt`) — the signal with the noise removed, not a
   * forecast. The smoothing factor(s) are caller-set or fit by minimising
   * in-sample SSE, and reported by the `tsSmoothingAlpha` / `tsSmoothingBeta`
   * companion columns. Holt-Winters (seasonal) smoothing is deferred; seasonality
   * is covered by decomposition.
   */
  | 'tsSmoothed' | 'tsSmoothingAlpha' | 'tsSmoothingBeta'
  /**
   * Model-backed regression shadows (BACKLOG-0000812): the predicted value, the
   * residual, and a Cook's-distance influence flag for the row, read from the
   * fitted model named on the shadow declaration (`shadow: { kind:
   * 'fitResidual', model: { predictors, response, method } }`). They follow the
   * grid's filters — the model refits over the filtered rows — and are
   * sortable, filterable, groupable and exportable like any cell. Null for a row
   * outside the fit. `fitInfluence` flags Cook's D > 4/n by default (overridable
   * via `threshold`); "not influential" (`false`) and "cannot tell" (`null`)
   * stay distinct.
   *
   * `fitStdResidual`, `fitLeverage` and `fitCooksD` (BACKLOG-0000872) surface
   * the diagnostics the engine already computes — the internally studentised
   * residual `eᵢ/(s·√(1−hᵢ))`, the hat-matrix leverage `hᵢ`, and Cook's distance
   * — as their own numeric columns, so the scale-location and
   * residuals-vs-leverage plots bind to real columns. Null where there is no
   * spread to standardise against.
   */
  | 'fitPredicted' | 'fitResidual' | 'fitInfluence'
  | 'fitStdResidual' | 'fitLeverage' | 'fitCooksD';

/** The three verdicts a `specStatus` shadow can report. */
export type SpecStatus = 'PASS' | 'WARN' | 'FAIL';

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

/** The specification of a multi-predictor model (BACKLOG-0000792). */
export interface RegressionSpec {
  /** The predictor column ids. */
  predictors: string[];
  /** The response column id. */
  response: string;
  /** `ols` (default), `wls` or `robust`. `quantile` is reserved (coming next). */
  method?: 'ols' | 'wls' | 'robust' | 'quantile';
  /** A weights column id, required for `wls`. */
  weights?: string;
  /** The confidence level for the band; 0.95 by default. */
  confidence?: number;
}

/** One fitted coefficient, with the uncertainty around it. */
export interface RegressionCoefficient {
  /** `(intercept)` or the predictor's column id. */
  name: string;
  estimate: number;
  stdError: number;
  /** estimate ÷ standard error. */
  t: number;
  /** Two-sided Student-t p-value; a number with a documented method, not a verdict. */
  p: number;
  /**
   * The Wald confidence interval at the model's confidence level
   * (BACKLOG-0000872) — the whiskers a coefficient forest plot draws. Null when
   * there is no residual degree of freedom to form a critical value.
   */
  lower: number | null;
  upper: number | null;
}

/** A pointwise confidence band for the mean response of a single-predictor fit. */
export interface RegressionBand {
  confidence: number;
  points: { x: number; yhat: number; lower: number; upper: number }[];
}

/** The Breusch–Pagan heteroscedasticity test result. */
export interface Heteroscedasticity {
  statistic: number;
  df: number;
  p: number;
  /** True when the test rejects homoscedasticity at the 0.05 level. */
  heteroscedastic: boolean;
}

/** The Augmented Dickey-Fuller stationarity test result (BACKLOG-0000873). */
export interface AdfResult {
  /** The ADF t-statistic on the lagged level. */
  statistic: number;
  /** The number of augmenting lags chosen by AIC. */
  usedLag: number;
  /** The observations the final regression used. */
  nobs: number;
  /** MacKinnon's constant+trend critical values at the 1%, 5% and 10% levels. */
  criticalValues: { '1%': number; '5%': number; '10%': number };
  /** An approximate p-value, interpolated across the critical-value ladder. */
  pValue: number;
  /** Always true: the p-value is an interpolation, not the MacKinnon surface. */
  pApproximate: boolean;
  /** Whether the series is stationary at the 5% level. */
  stationary: boolean;
  /** The plain-language verdict: `'stationary'` or `'non-stationary'`. */
  verdict: string;
  /** The regression form used — always `'ct'` (constant + trend) in v1. */
  regression: 'ct';
}

/** Autocorrelation (ACF) and partial autocorrelation (PACF) arrays (BACKLOG-0000873). */
export interface AcfResult {
  /** The autocorrelation at each lag; index 0 is lag 0 and is always 1. */
  acf: number[];
  /** The partial autocorrelation at each lag; index 0 is 1, and `pacf[1] === acf[1]`. */
  pacf: number[];
  /** The approximate ±1.96/√n white-noise confidence band. */
  bounds: { upper: number; lower: number };
  /** The series length the ACF/PACF were computed over. */
  n: number;
  /** The maximum lag. */
  nlags: number;
  /** Always true: the ±1.96/√n band is an approximation. */
  approximate: boolean;
}

/** A fitted multi-predictor linear model and its diagnostics (BACKLOG-0000792). */
export interface RegressionModel {
  method: string;
  coefficients: RegressionCoefficient[];
  r2: number;
  adjR2: number;
  n: number;
  /** Residual degrees of freedom, n − p. */
  df: number;
  /** Residual variance, RSS ÷ df. */
  sigma2: number;
  fitted: number[];
  residuals: number[];
  /** Hat-diagonal leverage per row. */
  leverage: number[];
  /** Cook's distance per row; null where it cannot be computed. */
  cooksD: (number | null)[];
  /** Variance-inflation factor per predictor; Infinity when exactly collinear. */
  vif: number[];
  heteroscedasticity: Heteroscedasticity | null;
  band: RegressionBand | null;
  /** Per-row weights actually used (robust/WLS), or null for OLS. */
  weights: number[] | null;
  predictors: string[];
  response: string;
  /** The physical rows the diagnostics are aligned to, in order. */
  rows: number[];
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
  /** Cp over the overall spread: what the process actually delivered. */
  pp: number | null;
  /** Cpk over the overall spread. Well below Cpk means the process drifted. */
  ppk: number | null;
  outOfSpec: number;
  defectRate: number | null;
  /** Three sigma either side of the process mean, from the moving range. */
  limits: { centre: number; upper: number; lower: number; sigma: number } | null;
  /** How many leading readings set the limits. */
  baseline?: number;
  /** Which rule set `violations` were judged against, they number differently. */
  ruleSet?: 'westernElectric' | 'nelson';
  violations: { index: number; rule: number; description: string }[];
  /**
   * A confidence interval for `cpk`. A study that reports the point estimate
   * alone overstates itself: 1.35 from thirty parts has a lower bound below 1.
   */
  interval?: CapabilityInterval | null;
  /** The same, for `ppk`. */
  intervalPp?: CapabilityInterval | null;
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
  /**
   * For a categorical (non-numeric) column, the commonest values, largest
   * first (BACKLOG-0000959). Absent for a numeric column, whose shape the
   * numeric figures and the histogram already carry.
   */
  topValues?: TopValue[];
}

export interface HistogramBin {
  from: number;
  to: number;
  count: number;
}

/** One row of a categorical column's top-values table (BACKLOG-0000959). */
export interface TopValue {
  /** The value itself, as it is stored. */
  value: unknown;
  /** How many present rows carry it. */
  count: number;
  /** Its share of the present values, 0 to 1. */
  share: number;
}

/** How one column differs between the filtered subset and its population. */
export interface ColumnDifference {
  /** The column id. */
  column: string;
  /** The column's display name, or its id. */
  name: string;
  /**
   * The effect size reported for this column's family: the standardized mean
   * difference for a numeric column, the total variation of the category mix for
   * a categorical one. Never a p-value.
   */
  measure: 'standardizedMeanDifference' | 'categoricalTotalVariation';
  /** The effect size in its own terms, or null when it has no scale here. */
  magnitude: number | null;
  /**
   * The total variation distance between subset and population, 0 to 1 — the
   * common scale both families reduce to, and what the ranking sorts by.
   */
  distance: number;
  /** +1 when the subset sits above the population, −1 below, 0 for a mix. */
  direction: number;
  /** How many rows the subset comparison stood on. */
  subsetN: number;
  /** How many rows the population comparison stood on. */
  populationN: number;
  /** False when the subset is too small to read the difference from. */
  reliable: boolean;
}

/** The subset-vs-population ranking (BACKLOG-0000653). */
export interface SubsetComparison {
  /** Every compared column, largest difference first. */
  ranked: ColumnDifference[];
  /** How many rows the filtered subset holds. */
  subsetN: number;
  /** How many rows the whole population holds. */
  populationN: number;
  /** Whether a filter is actually narrowing the set. */
  filtered: boolean;
  /** The measure each family reports, and the common scale, named for a legend. */
  measures: { numeric: string; categorical: string; common: string };
}

export interface AnomalyReason {
  /** The column that put this row over the line. */
  column: string;
  /** The column's display name, or its id. */
  name: string;
  /** The row's value in that column. */
  value: number;
  /** The modified z-score, for the `modifiedZScore` method. */
  score?: number;
  /** The lower fence, for the `iqr` method. */
  lower?: number;
  /** The upper fence, for the `iqr` method. */
  upper?: number;
  /** Which rule flagged it. */
  method?: 'modifiedZScore' | 'iqr';
}

export interface AnomalyRow {
  /** The row key — stable across a sort or a feed, where the index is not. */
  rowKey: string | null;
  /** The physical row index at the time of the call. */
  index: number;
  /**
   * The row's headline score: its most extreme modified z-score across the
   * flagging columns (univariate), the Mahalanobis distance (multivariate), or
   * null for the IQR method, which has no single score.
   */
  score: number | null;
  /** The squared Mahalanobis distance, for the `mahalanobis` method. */
  squared?: number | null;
  /** Why this row was flagged: the columns and how far, so it is explainable. */
  why: AnomalyReason[];
}

export interface AnomalyReport {
  /** Which rule produced the report. */
  method: 'modifiedZScore' | 'iqr' | 'mahalanobis';
  /** The IQR fence multiplier, for the `iqr` method. */
  k?: number;
  /** How many rows the scan ran over. */
  n: number;
  /** The flagged rows, worst first. */
  rows: AnomalyRow[];
  /** How many rows were flagged. */
  flagged: number;
  /** The column ids that were not numeric and so could not be scored. */
  skipped: string[];
  /** How many numeric columns were scored (univariate). */
  scored?: number;
  /** Per-column summaries (univariate): the centre, spread and fence per column. */
  columns?: unknown;
  /** The degrees of freedom of the χ² cut (multivariate). */
  df?: number;
  /** The χ² cut the squared distance is compared against (multivariate). */
  cutoff?: number | null;
  /** The joint centre the distances are measured from (multivariate). */
  center?: number[];
  /** How many complete rows defined the metric (multivariate). */
  used?: number;
  /** Whether the covariance was singular and had to be regularised (multivariate). */
  singular?: boolean;
}

export interface DatasetColumnDifference {
  /** The column id, present on both grids. */
  column: string;
  /** The column's display name, or its id. */
  name: string;
  /**
   * The effect size reported for this column's family: the pooled standardised
   * mean difference (Cohen's d) for a numeric column, the total variation of the
   * category mix for a categorical one. Never a p-value.
   */
  measure: 'pooledStandardMeanDifference' | 'categoricalTotalVariation';
  /** The effect size in its own terms, or null when it has no scale here. */
  magnitude: number | null;
  /**
   * The total variation distance between the two datasets, 0 to 1 — the common
   * scale both families reduce to, and what the ranking sorts by.
   */
  distance: number;
  /** +1 when dataset A sits above dataset B, −1 below, 0 for a mix. */
  direction: number;
  /** How many rows the first grid's side stood on. */
  nA: number;
  /** How many rows the second grid's side stood on. */
  nB: number;
  /** False when either side is too small to read the difference from. */
  reliable: boolean;
}

export interface DatasetComparison {
  /** Every shared column, largest difference first. */
  ranked: DatasetColumnDifference[];
  /** How many rows the first grid contributed (its filtered set). */
  nA: number;
  /** How many rows the second grid contributed (its filtered set). */
  nB: number;
  /** Columns present on only one side, which cannot be compared. */
  unmatched: { onlyA: string[]; onlyB: string[] };
  /** The measure each family reports, and the common scale, named for a legend. */
  measures: { numeric: string; categorical: string; common: string };
}

/** How {@link StatisticsApi.compareGroups} splits the rows and picks a test. */
export interface TwoSampleSpec {
  /** The column whose values split the rows into groups. Required. */
  by: string;
  /** The two group values to compare. The two most frequent when omitted. */
  groups?: [unknown, unknown];
  /**
   * Force a test rather than choosing by column family. `auto` (the default)
   * picks Welch or Mann-Whitney for a numeric column and chi-square for a
   * categorical one; the choice is always named in the result.
   */
  test?: 'auto' | 'welch' | 'mannWhitney' | 'chiSquare';
  /** The confidence level for the interval, 0 to 1. 0.95 by default. */
  confidence?: number;
  /**
   * The focal category for a chi-square difference interval, when the column has
   * more than two categories. Without it, a multi-category comparison reports no
   * scalar interval, only the effect size.
   */
  category?: unknown;
}

/** The effect size paired with a two-sample test — the "how big" half. */
export interface GroupEffectSize {
  /**
   * The named measure: `pooledStandardMeanDifference` (Cohen's d) for the
   * numeric tests, `categoricalTotalVariation` for chi-square.
   */
  name: string;
  /** The effect size in its own terms, or null when it has no scale here. */
  value: number | null;
}

/** A confidence interval on the difference a two-sample test measured. */
export interface GroupDifferenceInterval {
  /** The point estimate of the difference the interval is around. */
  estimate: number;
  lower: number;
  upper: number;
  /** The level the bounds were computed at, 0 to 1. */
  confidence: number;
  /** The method, named for honesty: `welch-t`, `hodges-lehmann`, `newcombe`. */
  method: string;
  /** For a chi-square interval, which category's share the difference is of. */
  category?: unknown;
}

/**
 * The result of {@link StatisticsApi.compareGroups}: how big *and* how sure, as
 * data to interpret. Carries no significance verdict — the p-value is a number,
 * never a flag or a badge.
 */
export interface GroupComparison {
  /** The test used, named so it is never hidden. */
  test: 'welch' | 'mannWhitney' | 'chiSquare';
  /** Whether the test was chosen automatically or forced by the caller. */
  chosenBy: 'auto' | 'override';
  /** Why this test — the column family, a normality screen, or the override. */
  reason: string;
  /** The test statistic. */
  statistic: number;
  /** What the statistic is: `t`, `U`, or `chiSquare`. */
  statisticName: string;
  /** The degrees of freedom, where the test has them; null for Mann-Whitney. */
  df: number | null;
  /**
   * The two-sided p-value, returned as data for the caller to interpret. Never
   * thresholded into a verdict here.
   */
  pValue: number;
  /** The confidence interval on the difference, or null when there is none. */
  interval: GroupDifferenceInterval | null;
  /** The paired effect size, so the p-value is never read on its own. */
  effectSize: GroupEffectSize;
  /** How many rows the first group stood on. */
  nA: number;
  /** How many rows the second group stood on. */
  nB: number;
  /** The two group values compared, as keys. */
  groups: [unknown, unknown];
  /** False when either group is under the reliability floor. */
  reliable: boolean;
  /** The test's method, named per the reference-suite honesty rule. */
  method: string;
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

/** One recorded validation error (BACKLOG-0000956). */
export interface ValidationError {
  key: string;
  colId: string;
  code: string;
  message: string;
}

/** The runtime face of declarative column validation (BACKLOG-0000956). */
export interface ValidationApi {
  /** Run a column's rules against a value, returning the first failure or null. */
  check(colId: string, value: unknown, row?: unknown): { code: string; message: string } | null;
  /** The recorded error for one cell, or null when it is valid. */
  errorFor(key: string, colId: string): ValidationError | null;
  /** Every cell that currently holds a validation error. */
  errors(): ValidationError[];
  /** Clear errors: one cell, a whole row, or all of them. */
  clear(key?: string, colId?: string): boolean;
  /** Set or replace a column's rules at runtime; null removes them. */
  define(colId: string, spec: ColumnValidation | null): void;
  /** Whether at least one column declares a rule. */
  readonly active: boolean;
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
 * Complete, and checked against the runtime by `tools/check.js`, an `emit()`
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
  | 'licence:changed'
  /* Data */
  | 'model:changed' | 'rows:changed' | 'rows:queued' | 'rows:deferred'
  | 'rows:paused' | 'rows:resumed' | 'row:received' | 'row:sent' | 'row:copied'
  | 'row:moved' | 'source:error' | 'stream:chunk' | 'stream:end' | 'stream:evicted'
  /* The row-drag gesture as it happens (BACKLOG-0001224). Notifications only:
   * the drop is already vetoable by `beforeRowMove` and `beforeRowReceive`, and
   * a third veto on the same gesture would be a fourth place to look. All four
   * fire on the grid the drag started in and carry a {@link RowDragEvent}. */
  | 'rowDrag:started' | 'rowDrag:moved' | 'rowDrag:left' | 'rowDrag:ended'
  /* Cells and editing */
  | 'cell:changed' | 'cell:pending' | 'cell:confirmed' | 'cell:reverted' | 'cell:conflict'
  | 'cell:clicked' | 'cell:dblclicked' | 'cell:contextmenu'
  /* The pointer entering and leaving a cell (BACKLOG-0001203). Announcements
   * only, carrying what `cell:clicked` carries plus the cell element as
   * `target`. A host cannot wire these itself: rows and cells are pooled and
   * re-used as the grid scrolls, so a listener bound to a cell node fires for
   * whichever row occupies it next. Nothing in the grid is gated on hover, so
   * a keyboard user reaches everything a pointer does. */
  | 'cell:mouseover' | 'cell:mouseout'
  /* A pointer press and release on a cell (BACKLOG-0001272), the same
   * convention as the hover pair above: announcements only, carrying what
   * `cell:clicked` carries plus the cell element as `target`. A host cannot
   * wire these itself for the same reason it cannot wire the hover pair —
   * rows and cells are pooled and re-used as the grid scrolls, so a listener
   * bound to a cell node fires for whichever row occupies it next. */
  | 'cell:mousedown' | 'cell:mouseup'
  | 'cell:edit:start' | 'cell:edit:end' | 'row:edit:start' | 'row:edit:end'
  | 'row:clicked' | 'row:dblclicked'
  | 'row:pending' | 'row:confirmed' | 'row:reverted' | 'row:conflict'
  | 'form:opened' | 'form:closed' | 'form:saved' | 'form:error'
  /* Query */
  | 'sort:changed' | 'filter:changed' | 'group:toggled'
  | 'facet:computed' | 'facet:filtered' | 'facet:expanded' | 'facet:failed'
  /* Columns */
  | 'column:moved' | 'column:resized' | 'column:visible' | 'column:pinned'
  | 'column:grouped' | 'column:pivoted' | 'column:filter:open' | 'column:profile:open'
  | 'column:menu:open'
  | 'pivot:drill'
  | 'columns:changed' | 'columns:tagged' | 'columngroup:changed' | 'header:contextmenu'
  /* Selection and view */
  | 'selection:changed' | 'range:changed' | 'clipboard:copy'
  | 'page:changed' | 'scroll' | 'scroll:end' | 'size:changed'
  | 'detail:toggled' | 'toolpanel:focus' | 'highlight:changed' | 'find:changed'
  /* Tree data */
  | 'tree:loading' | 'tree:loaded' | 'tree:loadFailed' | 'tree:loadAborted'
  /* State, history and views */
  | 'state:changed' | 'state:reset' | 'history:changed' | 'history:applied'
  | 'views:changed' | 'view:applied' | 'view:saved' | 'view:removed'
  | 'view:renamed' | 'view:default'
  /* Validation (BACKLOG-0000956): a declared column rule vetoed an edit, or a
   * recorded error was cleared. The veto itself rides the cancellable `beforeEdit`. */
  | 'validation:failed' | 'validation:cleared'
  /* Formatting and presentation */
  | 'formatting:changed' | 'redaction:changed' | 'permissions:changed'
  | 'presentation:changed' | 'presentation:started' | 'presentation:ended'
  | 'presentation:view'
  | 'presentation:scale' | 'presentation:spotlight' | 'presentation:captured'
  /* Collaboration */
  | 'comment:added' | 'comment:edited' | 'comment:deleted' | 'comment:failed'
  | 'comment:resolved' | 'comment:unresolved'
  | 'comment:threadOpened' | 'comment:threadClosed' | 'comment:indexLoaded'
  | 'presence:published' | 'presence:joined' | 'presence:updated' | 'presence:left'
  | 'presence:failed' | 'presence:lockRefused'
  /* Comparison and time */
  | 'diff:changed' | 'diff:swapped'
  | 'timeline:attached' | 'timeline:detached' | 'timeline:seek' | 'timeline:seeking'
  /* Annotations */
  | 'annotation:changed'
  /* Export */
  | 'export:progress' | 'export:request' | 'export:done'
  /* Keyboard help overlay (past-tense notifications) */
  | 'shortcuts:opened' | 'shortcuts:closed'
  /* Print (past-tense notifications, BACKLOG-0000941) */
  | 'print:before' | 'print:after'
  /* Cancellable before-events (BACKLOG-0000943). Delivered through the async
   * before-dispatch path with a {@link BeforeEvent} carrying preventDefault. */
  | 'beforeEdit' | 'beforeSort' | 'beforeFilter'
  | 'beforeColumnMove' | 'beforeColumnResize' | 'beforeColumnHide'
  | 'beforeSelect' | 'beforeRowAdd' | 'beforeDelete' | 'beforeRowMove' | 'beforeGroup'
  /* A row dropped in from another grid, on the receiving grid (BACKLOG-0001225):
   * a {@link BeforeRowReceiveEvent}. */
  | 'beforeRowReceive'
  /* Their cancellation notifications (past-tense, non-cancellable). */
  | 'edit:cancelled' | 'sort:cancelled' | 'filter:cancelled'
  | 'columnMove:cancelled' | 'columnResize:cancelled' | 'columnHide:cancelled'
  | 'selection:cancelled' | 'rowAdd:cancelled' | 'delete:cancelled'
  | 'rowMove:cancelled' | 'group:cancelled' | 'rowReceive:cancelled'
  /* Every event at once, for logging and debugging. */
  | '*';

export interface GridEvent {
  type: string;
  /**
   * Who caused the action. `'ai'` (BACKLOG-0000967) tags a write an AI proposed
   * and a human approved, applied through `grid.edit.setCells(writes, type,
   * { origin: 'ai' })`; it fires the same cancellable `beforeEdit` gate a
   * `'user'` edit does, so a host can policy-gate AI writes distinctly.
   */
  origin: 'api' | 'user' | 'init' | 'ai';
  grid: Grid;
  [key: string]: unknown;
}

/**
 * A cancellable *before*-event (BACKLOG-0000943), delivered to `on('beforeX')`
 * handlers before a user-initiated mutation is applied.
 *
 * A handler cancels the pending action by calling `preventDefault(reason?)`; the
 * mutation is then abandoned and a past-tense `<action>:cancelled` event carries
 * the reason. A handler may be `async` (or return a Promise): the grid awaits
 * every before-handler before deciding, so a confirm dialog or a server check
 * can gate the write. Any one handler preventing cancels the action.
 *
 * The action-specific fields (the edited cells, the target index, the affected
 * rows) are spread alongside these, so a handler decides without reaching into
 * grid internals. `origin` distinguishes a genuine user gesture from a
 * host/module-driven or remote write, which is how a module whose move re-enters
 * core is deduplicated by the host.
 */
export interface BeforeEvent extends GridEvent {
  /** Cancel the pending action; the optional reason is surfaced on the cancellation event. */
  preventDefault(reason?: string): void;
  /** True once any handler has called `preventDefault` or returned false. */
  defaultPrevented: boolean;
  /** The reason given to `preventDefault`, or null; `'stale'` when re-validation failed. */
  reason: string | null;
}

/**
 * The `beforeRowReceive` event (BACKLOG-0001225): a row dragged from another
 * grid is about to be inserted into this one. Fires on the **receiving** grid,
 * before the insert, with the row under the pointer named — so a drop that
 * means "assign this to that" can be recorded by the host and the insert
 * stopped with `preventDefault(reason)`.
 *
 * A veto leaves the source grid untouched: the row stays where it was, and
 * neither `row:sent` nor `row:copied` fires there. The source removes its row
 * only after the target has admitted it, and a veto is a refusal to admit.
 * The paired `rowReceive:cancelled` carries the same context plus the reason.
 *
 * Like every {@link BeforeEvent}, the handler may be `async`; the insert is
 * held until it settles, and is cancelled as `'stale'` (BACKLOG-0001242) if
 * the source row is gone by then, or if the row under the pointer is gone or
 * has moved to a different index — `at` names a slot as "before `overKey`",
 * and once that is no longer where `overKey`'s row sits, `at` is a stale index
 * into a list that changed while the handler was thinking, not the slot the
 * drop meant. `overKey: null` (the drop landed on no row) has no row to drift
 * against and is never stale on that account.
 */
export interface BeforeRowReceiveEvent extends BeforeEvent {
  /**
   * The row about to be inserted: a shallow copy of the source row's data,
   * and the very object that is inserted if no handler vetoes, so a change
   * made to it here lands with the row.
   */
  data: Record<string, unknown>;
  /**
   * The display index the row would be inserted at: the index of the row
   * under the pointer, or `rows.count()` when the drop landed on no row. When
   * `overKey` names a row, this is guaranteed to still be that row's index at
   * the moment the insert actually runs — an async handler that leaves the
   * named row at a different index causes the drop to be cancelled as
   * `'stale'` (BACKLOG-0001242) rather than inserted at this index regardless.
   */
  at: number;
  /**
   * The key of the row under the pointer when the drop happened — the row the
   * user meant. Null when the drop landed past the last row, on empty space,
   * on the header, or on a pinned row: there is no row to name, and a nearest
   * guess would be wrong in a way that looks right.
   */
  overKey: string | null;
  /** The grid the row is being dragged from. */
  source: Grid;
}

/**
 * The `rowReceive:cancelled` event (BACKLOG-0001225): a `beforeRowReceive`
 * was vetoed, or went stale during an async handler. Nothing was inserted and
 * the source grid is untouched.
 */
export interface RowReceiveCancelledEvent extends GridEvent {
  /** The row that was not inserted, as the handler saw it. */
  data: Record<string, unknown>;
  /** The display index it would have taken. */
  at: number;
  /** The key of the row under the pointer, or null. */
  overKey: string | null;
  /** The grid the row would have come from; it still holds the row. */
  source: Grid;
  /**
   * The reason given to `preventDefault`, `'prevented'` when none was given,
   * or `'stale'` when the row under the pointer or the source row was gone by
   * the time an async handler settled.
   */
  reason: string;
}

/**
 * The row-drag lifecycle events (BACKLOG-0001224): `rowDrag:started`,
 * `rowDrag:moved`, `rowDrag:left` and `rowDrag:ended`, which report a row drag
 * *as it happens* rather than once it has settled. Before them a host got the
 * handle the grid draws and then one settled event, with nothing in between to
 * highlight a candidate target, drive a custom drop indicator, or react when
 * the pointer left the grid.
 *
 * **All four fire on the grid the drag started in**, whether the row is being
 * reordered within that grid or dragged into another one. A drag is one gesture
 * with one owner, and the source grid is the only grid present for the whole of
 * it — the pointer may cross several others, or none. `over` names whichever
 * grid the event is about, so a single subscription can drive decoration on any
 * of them.
 *
 * **Notifications, not gates.** None of these is cancellable and none carries
 * `preventDefault`. The drop is already vetoable twice over — `beforeRowMove`
 * for a reorder, `beforeRowReceive` for a drop into another grid — and a third
 * veto on the same gesture would be a third place to look when a drop does not
 * happen.
 *
 * **What is safe to do in a handler.** Read, measure and draw: highlight a
 * candidate row, move an indicator, update a side panel. Do not mutate rows,
 * columns, sort, filters or grouping from one of these. The drag resolves where
 * it would land against the display order, so changing that order mid-gesture
 * moves the ground under the drop; and `data` is the source row's own object
 * rather than a copy, so writing to it edits the row that is still in the grid
 * without announcing it. Work that changes the grid belongs in
 * `beforeRowReceive`, which is asked before the insert, or in the settled
 * events afterwards.
 *
 * **`rowDrag:moved` is coalesced to one event per animation frame**, carrying
 * the latest pointer position of that frame, so a handler runs at the display's
 * rate rather than the pointer's several hundred events a second. The other
 * three fire on the transition itself.
 *
 * The sequence for any gesture is `rowDrag:started`, then `rowDrag:moved` and
 * `rowDrag:left` as the pointer travels, then exactly one `rowDrag:ended` —
 * including when the pointer is released outside every grid. No `rowDrag:moved`
 * is delivered after `rowDrag:ended`. A press that never passes the drag
 * threshold is a click and raises none of them; a grid destroyed mid-drag
 * raises no `rowDrag:ended`.
 */
export interface RowDragEvent extends GridEvent {
  /** The key of the row being dragged. */
  key: string;
  /**
   * The dragged row's data as it stands in the source grid — that row's own
   * object, not a copy. Null if the row has left the source during the drag.
   */
  data: Record<string, unknown> | null;
  /**
   * The grid the event is about: the grid under the pointer for
   * `rowDrag:started`, `rowDrag:moved` and `rowDrag:ended`, and the grid just
   * left for `rowDrag:left`. Null when the pointer is over no grid at all.
   */
  over: Grid | null;
  /**
   * Where the row would land in `over`: the display index it would take. Null
   * when there is no candidate to report — the pointer is over no grid, over a
   * grid that will refuse the row, or over a header; and on `rowDrag:left`,
   * which is about a grid the pointer has already gone from.
   */
  at: number | null;
  /**
   * The key of the row under the pointer in `over`, or null where there is no
   * row to name: past the last row, on empty space, on a header, on a pinned
   * row, on a grid that will refuse the drop, or on `rowDrag:left`.
   */
  overKey: string | null;
  /**
   * `rowDrag:ended` only: whether the release is being acted on — a transfer
   * the target accepts, or a same-grid reorder that is a real move and is not
   * refused by a sort, filter or grouping. False when the row was released over
   * no grid, over a grid that refuses it, or back where it started. What became
   * of an acted-on drop is reported by `row:moved`, `row:sent`, `row:received`
   * and `rowReceive:cancelled`.
   */
  dropped?: boolean;
}

/**
 * The `state:changed` event (BACKLOG-0001182).
 *
 * Fires once per logical state change, whether it began as a user gesture or
 * as a programmatic call, so view persistence is built on this one event
 * rather than on the ten individual ones — `reset()` raises those too, which
 * made a debounced save write the reset arrangement back.
 *
 * **Exactly one event per change.** A change that internally routes through
 * `state.apply()` — applying a saved view, an undo, a reset — announces itself
 * once, carrying the outermost cause rather than the inner mechanism's.
 *
 * A host predicate registered, replaced or removed through
 * `filters.where(name, fn)`, and a `filters.reapply()` that re-runs one, go
 * through the same tracked door as `sort` and `filters`: each fires this
 * event once, `cause: 'user'`, with `'where'` in `sections` (BACKLOG-0001235).
 */
export interface StateChangedEvent extends GridEvent {
  /** Why the state changed. `'reset'` is the one a save should ignore. */
  cause: StateChangeCause;
  /**
   * Which sections moved, sorted and de-duplicated. For `'apply'` and
   * `'reset'` these are the sections the report applied; for `'user'`, the
   * sections the change touches.
   */
  sections: StateSection[];
  /**
   * The state that was applied — present for `'apply'` and `'reset'`, null for
   * `'user'`. A full capture on every gesture would put an unsanitised copy of
   * the state, hidden column ids and widths included, on the bus for every
   * listener; a host calls `grid.state.get()` when it decides to write, which
   * is permission-sanitised.
   */
  state: GridState | null;
  /** What an apply could not restore; null for `'user'`. */
  report: StateApplyReport | null;
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

/** A conditional-formatting rule's rendering, returned by `cellStyle`. */
export interface ExcelCellStyle {
  bold?: boolean;
  italic?: boolean;
  /** Font colour as 6- or 8-digit hex/ARGB, e.g. 'FFFF0000'. `color` is an alias. */
  colour?: string;
  color?: string;
  /** Solid fill colour as 6- or 8-digit hex/ARGB. */
  fill?: string;
}

/** A cell border, per edge. `true` means a thin line; a string names the style. */
export interface ExcelBorderSpec {
  left?: boolean | string;
  right?: boolean | string;
  top?: boolean | string;
  bottom?: boolean | string;
}

export interface ExcelExportOptions extends Omit<CsvExportOptions, 'delimiter' | 'quote' | 'lineEnding'> {
  sheetName?: string;
  freezePanes?: boolean;
  variantFills?: boolean;
  /**
   * Draw cell borders on the data grid. `false` (default) is borderless; `true`
   * draws a thin box; a string names the line style; an object picks edges.
   */
  borders?: boolean | string | ExcelBorderSpec;
  /**
   * What to do with grid-hidden columns. `'omit'` (default) drops them;
   * `'hidden'` keeps them as Excel-hidden columns for round-trip fidelity.
   */
  hiddenColumns?: 'omit' | 'hidden';
  /** Explicit merged body ranges in A1 form, e.g. ['A3:A4']. */
  merges?: string[];
  onProgress?: (p: { written: number; total: number }) => void;
}

export interface ClipboardOptions {
  headers?: boolean;
  rows?: 'visible' | 'all' | 'selected' | 'range';
  /**
   * Apply the CSV/Excel formula-injection guard to copied cells: prefix a field
   * beginning with `=`, `+`, `-`, `@`, a tab or a CR with an apostrophe so a
   * spreadsheet treats it as text. **Off by default** (unlike CSV/Excel export,
   * which default it on), because the clipboard most often round-trips back into
   * a grid or cell range where the apostrophe would corrupt the value. Turn it
   * on when your users paste the clipboard into Excel or Google Sheets.
   */
  sanitise?: boolean;
}

// ---------------------------------------------------------------------------
// Grid API (spec 18.3)
// ---------------------------------------------------------------------------

/**
 * How much of the data a computed figure actually covers.
 *
 * `covered < total`, or `total === null`, means the figure is approximate.
 */
export interface StatCoverage {
  /** Rows the figure was computed over. */
  covered: number;
  /** Rows the source knows about, or `null` when it cannot know — never a guess. */
  total: number | null;
  /** True when a window bounded the computation, so the figure covers part of the data. */
  windowed: boolean;
}

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
  /**
   * How much of the data a figure computed from this grid covers, so a
   * statistic over a windowed source can say it is approximate.
   */
  coverage(): StatCoverage;
  data(): unknown[];
  forEach(fn: (row: Row, index: number) => void): void;
  /** Every row in the data, before any filter. Leaf rows, in physical order. */
  forEachAll(fn: (row: Row, index: number) => void): void;
  /**
   * Visit the rows surviving every filter except one column's own: the
   * faceting question, asked of the rows.
   */
  forEachExcept(colId: string, fn: (row: Row, index: number) => void): void;
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
  /**
   * The leaf rows beneath a group heading: the members it counts in
   * `leafCount`, as rows, so you can roll up a field the grid was never told
   * to total. Filtered members in display order. Computed per call, so call it
   * when you draw a group row rather than in a loop over every row.
   */
  leavesOf(key: string): Row[];
  expand(key: string, deep?: boolean): void;
  collapse(key: string): void;
  expandAll(): void;
  collapseAll(): void;
}

export interface ColumnsApi {
  /**
   * Set or clear a column's totals-row reduction.
   *
   * With no `scope`, `fn` becomes the column's single `total`, applied to both
   * group subtotals and the grand total, and any independent group/grand
   * overrides are cleared — the same one-property behaviour as before
   * (BACKLOG-0000726). Pass `scope: 'group'` or `scope: 'grand'` to set just
   * that scope's reduction independently, leaving the other and the base
   * `total` untouched; the scope that has no override falls back to `total`.
   */
  setTotal(
    id: string,
    fn: TotalName | TotalFn | null,
    opts?: { scope?: 'group' | 'grand' },
  ): void;
  /**
   * The aggregate names meaningful for a column, honouring its type's
   * `totals.supported` declaration (§9.4). What the aggregate chooser offers.
   */
  aggregates(id: string): TotalName[];
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
  /**
   * Wrap leaf columns in a banded header, or add them to an existing band
   * (BACKLOG-0000739). Header banding, not row grouping (see {@link group}); the
   * band is a {@link ColumnGroup} node so a drag-, keyboard- or config-built band
   * is the same tree, and it round-trips through a saved view. Emits
   * `columngroup:changed`. Pass `groupId` to add to the band already carrying
   * that id, or `id` (BACKLOG-0000985) to create a new band with a caller-chosen
   * stable id you can reference later; `groupId` wins if both are given and an
   * `id` already in use warns and no-ops.
   */
  groupColumns(ids: string | string[], opts?: { title?: string; at?: number; groupId?: string; id?: string }): string | null;
  /** Take a leaf out of its band; a band emptied by the move is dissolved. */
  ungroupColumn(id: string): void;
  /** Rename a banded header. */
  renameGroup(groupId: string, title: string): void;
  /** Dissolve a band, returning its columns to the enclosing level in place. */
  dissolveGroup(groupId: string): void;
  /** Move a whole band among its siblings, its columns travelling as a block. */
  moveGroup(groupId: string, to: number): void;
  pin(id: string, side: 'start' | 'end' | null): void;
  resize(id: string, px: number): void;
  /**
   * Set, change or clear a column's decoration at runtime (§8.7). Pass `null` to
   * clear it back to plain text. Presentation config: it is not on the undo
   * timeline and is not carried in a saved view — use `grid.formatting` for
   * durable, view-persisted conditional styling.
   */
  decorate(id: string, decoration: DecorationName | DecorationSpec | null, opts?: { variant?: VariantSpec }): void;
  autoSize(ids?: string | string[]): void;
  /**
   * Size the visible resizable columns so that every column the grid draws,
   * together, exactly fills the width the cells occupy: the body viewport's
   * client width at the moment of the call, which excludes the vertical
   * scrollbar when the grid draws one and is the full inner width when it does
   * not. Columns it does not size keep their width and are taken out of that
   * width first: `resizable: false` columns and the grid's own selection
   * checkbox, detail expander, group and tree columns. The rest share what is
   * left in proportion to their current widths, within each `min`/`max`. If
   * that leaves less than their minimums, each is set to its minimum (never
   * below), the grid scrolls horizontally, and a `[lattice]` warning says so.
   * Rows given to `createGrid` or `rows.load()` before the call are counted.
   * One-shot: it sets fixed widths once (a `flex` column included) and does not
   * follow later changes; after a resize, or after rows arriving later bring a
   * vertical scrollbar in, call it again.
   */
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
   * Everything worth knowing about the selected cells: what `summary()`
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

/**
 * How a `where` predicate is re-evaluated, whether `filters.clear()` may remove
 * it, and what the source may be told about it (BACKLOG-0001202).
 */
export interface WhereOptions {
  /**
   * The columns the predicate reads, in the same spirit as `value.deps` on a
   * computed column (§8.4.2). Declared, the verdict is cached per row and
   * re-run only when one of these columns changes on that row. Omitted, the
   * predicate is treated as reading the whole row and is called on every pass —
   * never stale, and never skipped either.
   */
  deps?: string[];
  /**
   * Survive `filters.clear()`. For a predicate that is not the user's filter —
   * row-level permissions, tenant scoping — where a "clear filters" button must
   * never widen what the user can see.
   */
  pinned?: boolean;
  /**
   * A declarative twin of the predicate, pushed to the source while the function
   * stays as the residual. On a pushdown engine this narrows the fetch instead
   * of filtering a page client-side. It must be implied by the predicate: the
   * grid ANDs both, so a twin wider than the function costs only time, while one
   * narrower than it hides rows the function would have kept.
   *
   * **The twin is what works at any size.** Without one, a pushdown source can
   * still run the function — but only as the residual over the whole matching
   * set, so it does so only while that set is under `whereRowLimit` (default
   * `50_000`) and refuses loudly past it (BACKLOG-0001268). A paged or remote
   * source cannot run it at all and warns at registration. The twin is pushed
   * to the engine, so it narrows the fetch itself and none of that applies.
   */
  condition?: FilterSet;
}

export interface FiltersApi {
  /** The quick filter's text and match mode, for restoring a control. */
  quickState(): { text: string; mode: string };
  get(): FilterSet;
  set(filters: FilterSet): void;
  /**
   * Drop the condition tree, the quick filter, and every `where` predicate that
   * was not registered `{ pinned: true }`.
   */
  clear(): void;
  quick(text: string): void;
  /** The names of the `where` predicates in force, in registration order. */
  where(): string[];
  /**
   * Register, replace or remove a named row predicate composed with the filter
   * set (BACKLOG-0001202).
   *
   * Registering *is* activating: there is no companion "a predicate is present"
   * flag to keep in sync, which is the failure mode this replaces. Several may
   * be in force at once under their own names, ANDed with each other and with
   * the declarative set, and removing one leaves the rest alone. The predicate
   * is handed the **data row**.
   *
   *     grid.filters.where('visibleToMe', row => row.owner === me);
   *     grid.filters.where('rateKnown', row => rates.has(row.ccy),
   *       { deps: ['ccy'], pinned: true });
   *     grid.filters.where('visibleToMe', null);   // remove
   *
   * Only the names reach `filters.get()` and `state.get()`; the functions never
   * do.
   * @param name the name to register under
   * @param predicate the predicate, or null to remove it
   * @param opts re-evaluation, pinning, and the pushed-down twin
   */
  where(name: string, predicate: ((row: any) => boolean) | null, opts?: WhereOptions): void;
  /**
   * Re-run `where` predicates whose inputs changed where the grid could not see
   * it — a rate table that arrived late, a permission set that refreshed. The
   * out-of-band half of re-evaluation; `deps` is the half the grid observes for
   * itself. Together they replace the manual "filter again" call.
   * @param name the predicate to re-run; every one when omitted
   * @returns whether anything was re-run
   */
  reapply(name?: string): boolean;
}

export interface SortApi {
  get(): SortEntry[];
  /** Replace the sort model; an entry naming no known column is dropped with a warning. */
  set(entries: SortEntry[]): void;
  clear(): void;
}

export interface EditApi {
  start(key: string, colId: string): boolean;
  stop(cancel?: boolean): void;
  undo(): void;
  redo(): void;
  /**
   * Write several cells as one undoable step (§12). `opts.origin` defaults to
   * `'api'` — the ungated seam every existing caller uses (a fill, a paste, a
   * kanban move), unchanged. Pass `{ origin: 'ai' }` (or `'user'`) to route the
   * write through the cancellable `beforeEdit` gate, exactly as an interactive
   * edit is (BACKLOG-0000967): the AI writes through this so a host `beforeEdit`
   * handler can veto it and nothing persists when it does. With a gated origin
   * and an async (deferring) before-handler, the return is a `Promise<number>`.
   */
  setCells(
    writes: { key: string; colId: string; value: unknown }[],
    type?: 'cell' | 'fill' | 'paste',
    opts?: { origin?: 'api' | 'ai' | 'user' },
  ): number | Promise<number>;
  /**
   * Set one value across a block of cells as a single undoable step (§12, card
   * 740). Defaults to the selected range; read-only and non-editable cells are
   * skipped and every write runs the normal parse/validate path.
   */
  bulkSet(value: unknown, opts?: { cells?: { key: string; colId: string }[] }): number;
  /**
   * Fill a selected range from its leading edge as one undoable step (§12, card
   * 740). The default copies the anchor across the range (Excel's Ctrl+D and its
   * natural siblings); `series: true` extrapolates a numeric or date series from
   * the first one or two cells of each line, falling back to a copy for types
   * with no series. `direction` defaults to `'down'`.
   */
  fill(opts?: { direction?: 'down' | 'up' | 'left' | 'right'; series?: boolean; range?: CellRange }): number;
  pasteInto(anchor: { key: string; colId: string }, text: string, extent?: { rows?: number; columns?: number }): number;
  /** Whether a bulk paste is previewed before it commits (`edit.pastePreview`, §12). */
  readonly pastePreview: boolean;
  /**
   * Compute what a paste would change, without committing (§12). The engine
   * behind `edit.pastePreview`: `changes` are the accepted writes with their old
   * and new values (and whether each actually differs), `rejected` are the cells
   * a commit would refuse, each with a reason.
   */
  previewPaste(anchor: { key: string; colId: string }, text: string, extent?: { rows?: number; columns?: number }): {
    changes: { key: string; colId: string; oldValue: unknown; newValue: unknown; changed: boolean }[];
    rejected: { key: string; colId: string; value: unknown; reason: 'permission' | 'readOnly' | 'validation' | 'locked' | 'missing' }[];
  };
  /**
   * Report the outcome of an in-flight write (§18.3; §5.1-5.2 reconcile).
   *
   * `reconcile` carries server truth on a successful settle: `value` is a
   * server-authoritative value written back before `cell:confirmed`
   * (`returning: 'row'`); `conflict.serverRow` surfaces a last-write-wins
   * conflict via `cell:conflict`. Omit both to keep the optimistic value.
   */
  settle(
    id: string,
    ok: boolean,
    reason?: string,
    reconcile?: { value?: unknown; conflict?: { serverRow?: unknown } },
  ): boolean;
  pending(): OpenWrite[];
  status(key: string, colId: string): 'pending' | null;
  /**
   * Append a row to a remote source optimistically and persist it (§5.3), the
   * structural analog of the cell edit path. The row shows immediately under a
   * client temp key, and `adapter.mutate({ kind: 'append', rows: [row] })` is
   * asked to persist it; when the server returns the real key the row is rekeyed
   * everywhere the grid tracks it and `row:confirmed` fires, while a refused
   * append is removed and fires `row:reverted`. Only wired when the source
   * declares `mutate.append`; otherwise it warns once and returns null.
   * @param row the new row (it need not carry a key yet)
   * @returns the client temp key the row is tracked under, or null when append
   *   is not available on this source
   */
  addRow(row: object): string | null;
  /**
   * Delete a row from a remote source optimistically and persist it (§5.3). The
   * row is tombstoned immediately and `adapter.mutate({ kind: 'delete', keys: [key] })`
   * is asked to remove it; on confirmation the row is purged and `row:confirmed`
   * fires, on refusal it is restored and `row:reverted` fires. Only wired when
   * the source declares `mutate.delete`; otherwise it warns once and returns null.
   * @param key the row key to remove
   * @returns the id the op is tracked under, or null when delete is not available
   */
  deleteRow(key: string): string | null;
  /**
   * Delete rows on a user gesture, through the cancellable `beforeDelete` event
   * (§18.4, BACKLOG-0000968) — what the built-in Delete-key and "Delete row"
   * gestures call. Unlike {@link deleteRow}, `beforeDelete` fires on a
   * memory-source grid too, so the row can be confirmed or vetoed there. Off
   * until `config.rowDelete` opts in; the keys default to the row selection.
   * Returns the keys removed (empty on a veto or when disabled), or a Promise of
   * them when a `beforeDelete` handler deferred.
   * @param keys the row keys; defaults to the current selection
   * @param opts `origin` names the provenance carried onto the events
   * @returns the removed keys, or a Promise of them on the async path
   */
  deleteRows(keys?: string | string[], opts?: { origin?: string }): string[] | Promise<string[]>;
  /**
   * Report the outcome of an optimistic structural write (§5.3), the counterpart
   * to {@link settle} for `edit.confirm: 'manual'` over a backend that
   * acknowledges an append/delete on a separate channel. The id arrives on
   * `row:pending`.
   * @param id the op id from `row:pending`
   * @param ok true when the op reached the server
   * @param reason why it failed, carried on `row:reverted`
   * @param reconcile server key / row / conflict for a successful append settle
   * @returns true when the id named an op still awaiting an outcome
   */
  settleRow(id: string, ok: boolean, reason?: string, reconcile?: { key?: string; row?: unknown; conflict?: { serverRow?: unknown } }): boolean;
  /**
   * Whether a row has a structural op in flight (§5.3).
   * @param key the row key
   * @returns `'pending'`, or null when the row is settled
   */
  rowStatus(key: string): 'pending' | null;
  /**
   * Every structural op still awaiting an outcome (§5.3), oldest first; always
   * empty when the source cannot append or delete.
   */
  pendingRows(): OpenRowOp[];
}

export interface ScrollApi {
  /**
   * A row key, or a display index. A key survives a sort and is usually what a
   * caller holds; resolving one scans the display order, so prefer an index
   * when scrolling a very large grid repeatedly. The row lands fully visible in
   * the part of the body the pinned strips (pinned rows, sticky group
   * headings, a bottom grand total) do not cover: `end` puts it just above the
   * bottom strip, `start` just below the top one.
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

/** How `config.import` tunes the DOM import affordances (§14). */
export interface ImportSettings {
  /** Add the cell-menu item and open a file picker for CSV/TSV. Default true. */
  file?: boolean;
  /** Make the grid a drop target for `.csv`/`.tsv` files. Default true. */
  drop?: boolean;
  /** Read a pasted spreadsheet block into a preview. Default true. */
  paste?: boolean;
  /** How a confirmed import lands: append (default) or replace the dataset. */
  mode?: 'append' | 'replace';
}

/** One source column as understood by the importer, after type inference (§14). */
export interface ImportColumn {
  /** The heading as written in the file. */
  source: string;
  /** The column's position in each row. */
  index: number;
  /** The grid field this column maps onto; empty to exclude it from the import. */
  field: string;
  /** The inferred (or grid-dictated) type used to coerce the column's values. */
  type: string;
  /** A few non-blank sample values, for the preview. */
  samples: string[];
  /** Whether the heading matched one of the grid's own columns. */
  matched: boolean;
}

/** What a preview carries — everything a confirm dialog needs (§14). */
export interface ImportPreview {
  /** The delimiter that was used, detected or supplied. */
  delimiter: string;
  /** The source column headings. */
  header: string[];
  /** The per-column mapping and inference the user may edit before confirming. */
  columns: ImportColumn[];
  /** Every mapped, coerced record the import would add. */
  records: Record<string, unknown>[];
  /** The leading records, for a preview table. */
  sample: Record<string, unknown>[];
  /** How many data rows the file holds. */
  rowCount: number;
  /** Anything worth flagging before confirming — a ragged file, a bad quote. */
  warnings: string[];
}

/** What an `.xlsx` preview carries — an {@link ImportPreview} plus the sheet read (§14). */
export interface ImportXlsxPreview {
  /** The archive path of the worksheet that was read, e.g. `xl/worksheets/sheet1.xml`. */
  sheet: string | null;
  /** The source column headings. */
  header: string[];
  /** The per-column mapping and inference the user may edit before confirming. */
  columns: ImportColumn[];
  /** Every mapped, coerced record the import would add. */
  records: Record<string, unknown>[];
  /** The leading records, for a preview table. */
  sample: Record<string, unknown>[];
  /** How many data rows the sheet holds. */
  rowCount: number;
  /** Anything worth flagging before confirming. */
  warnings: string[];
}

/** Bringing rows in — the mirror of {@link ExportApi} (§14, BACKLOG-0000949). */
export interface ImportApi {
  /** Parse delimited text into a preview, changing nothing. */
  preview(text: string, opts?: object): ImportPreview;
  /** Parse delimited text into coerced records — the inverse of `export.csv`. */
  csv(text: string, opts?: object): Record<string, unknown>[];
  /**
   * Parse an `.xlsx` file's bytes into a preview, changing nothing (§14,
   * BACKLOG-0000970). Async: the archive is inflated with `DecompressionStream`.
   */
  previewXlsx(bytes: Uint8Array | ArrayBuffer, opts?: object): Promise<ImportXlsxPreview>;
  /** Parse an `.xlsx` file's bytes into coerced records — the inverse of `export.excel`. */
  xlsx(bytes: Uint8Array | ArrayBuffer, opts?: object): Promise<Record<string, unknown>[]>;
  /** Add or replace the grid's rows from text, a preview or records. */
  apply(
    input: string | ImportPreview | Record<string, unknown>[],
    opts?: { mode?: 'append' | 'replace' },
  ): ChangeResult | null;
}

export interface SavedView {
  id: string;
  name: string;
  description: string;
  shared: boolean;
  /**
   * Applied on load when no `config.state` is given. `config.state` wins
   * outright over this flag: with both present, the default view is never
   * applied and the active view id stays `null`.
   */
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
   * Mirror the views somewhere synchronous: `localStorage`, an in-memory
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
 *: 2 for a retina still, 3 or 4 for a slide. `background` fills behind the
 * grid so a PNG dropped into a deck does not show it through.
 */
export interface CaptureOptions {
  scale?: number;
  background?: string;
  download?: boolean;
  fileName?: string;
}

/**
 * The presenter's drawing layer. Pixels over the grid, it never reads or
 * writes data, and it is inert until a tool is chosen, so scrolling and
 * selection pass straight through. Marks are held in content coordinates, so
 * they stay with the cells they annotate when the grid scrolls, and are
 * cleared when a presentation ends.
 */
/**
 * A durable annotation mark descriptor (BACKLOG-0000813) — the shape a host
 * seeds through `state.annotations`, adds through {@link AnnotationApi.add}, and
 * reads back through {@link AnnotationApi.list} and `getState`.
 *
 * `points` are in **content coordinates** (the same space user-drawn marks are
 * stored in), so a mark tracks scroll and resize rather than hanging over the
 * viewport. A `freehand` mark is a trail of points; `arrow` and `rect` are their
 * two endpoints. A `text` mark is a label anchored at a single content point,
 * carrying its `text` string and an optional basic style (BACKLOG-0000875).
 * `pen` is accepted as an alias for `freehand` on input; `list()` reports
 * `freehand`.
 */
export interface AnnotationMark {
  type: 'freehand' | 'arrow' | 'rect' | 'highlight' | 'text';
  /**
   * Content coordinates. A `text` mark carries a single anchor point; `arrow`
   * and `rect` carry their two corners, and `freehand` a trail.
   */
  points: { x: number; y: number }[];
  colour?: string;
  /** The label of a `text` mark. Required for `text`, ignored for other types. */
  text?: string;
  /** A `text` mark's font size in content pixels (before presentation scale). Defaults to 14. */
  fontSize?: number;
  /** An optional backing colour drawn behind a `text` mark's label. */
  background?: string;
}

export interface AnnotationApi {
  readonly tool: 'pen' | 'arrow' | 'rect' | 'highlight' | null;
  readonly count: number;
  use(tool: 'pen' | 'arrow' | 'rect' | 'highlight' | null, opts?: { colour?: string }): string | null;
  /**
   * Add a durable mark from a descriptor, without synthesising pointer input
   * (BACKLOG-0000813). The mark is painted, survives a presentation ending, and
   * round-trips through `getState`. Returns the mark count.
   */
  add(mark: AnnotationMark): number;
  /** Every mark on the layer, as descriptors — the shape `getState` persists. */
  list(): AnnotationMark[];
  undo(): number;
  clear(): void;
  redraw(): void;
}

/**
 * Holding incoming updates, and the counters describing what they cost.
 * Pausing is explicit, a button, not a guess at whether the user is busy.
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

/** Counts for one cell. Never bodies: this is consulted on every repaint. */
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
 * `attach()`: what a value used to be is not recoverable after the fact.
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
 * Controls for the pivot presentation (§10, BACKLOG-0000738): expand or collapse
 * an axis node, and read the collapse state a saved view carries. Every method
 * is a no-op on a headless grid, which has no matrix to collapse.
 */
export interface PivotViewApi {
  /** Expand a collapsed node on the row or column axis. */
  expand(axis: 'row' | 'column', path: string): void;
  /** Collapse a node on the row or column axis, hiding its descendants. */
  collapse(axis: 'row' | 'column', path: string): void;
  /** Toggle a node's collapse on the row or column axis. */
  toggle(axis: 'row' | 'column', path: string): void;
  /** The collapsed row-axis and column-axis paths, as a saved view carries them. */
  state(): { rowsCollapsed: string[]; columnsCollapsed: string[] };
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

/**
 * The in-grid find bar's settings (BACKLOG-0001018). `find: true` or an
 * omitted key mounts the bar with these defaults; `find: false` removes the
 * bar and its shortcut while `grid.find` keeps working programmatically.
 */
export interface FindConfig {
  /**
   * Bind Ctrl+F (Cmd+F on a Mac) while focus is in the grid. The browser's
   * own find is untouched while focus is anywhere else on the page. Default
   * true.
   */
  shortcut?: boolean;
  /** Milliseconds of typing quiet before the bar searches. Default 120. */
  debounce?: number;
}

/**
 * How `grid.find(text, opts)` matches. Defaults: case-insensitive, substring,
 * every visible column, starting from the first row. Find matches the
 * **formatted display text** — what the cell shows, a column `format`
 * included — never a raw value; there is no regular-expression mode.
 */
export interface FindQuery {
  /** Match letter case exactly. Default false. */
  caseSensitive?: boolean;
  /** The whole cell text must equal the search text rather than contain it. Default false. */
  wholeCell?: boolean;
  /** Search only these column ids. Omitted searches every visible column. */
  columns?: string[] | string | null;
  /** The display index to start from: the first match at or after it becomes current. Default 0. */
  from?: number;
}

/** One matching cell. */
export interface FindMatch {
  key: string;
  colId: string;
  /** The display index, or -1 for a row pinned to an edge. */
  index: number;
  /** Which sticky strip a pinned row is in; null for a body row. */
  pinned: 'top' | 'bottom' | null;
}

/**
 * How many matches there are and which is current. `windowed` is the honest
 * scope flag: over a paged pushdown source only the loaded rows are searched,
 * so `total` counts matches in `loaded` rows out of the `rows` the source
 * reports for the whole matching set.
 */
export interface FindCount {
  /** 1-based position of the current match; 0 when there is none. */
  current: number;
  total: number;
  /** False while the bar's sliced scan is still running, so a partial count is never read as final. */
  complete: boolean;
  windowed: boolean;
  /** Rows the search actually read; a windowed source's not-yet-fetched placeholders are not counted. */
  loaded: number;
  /** The rows the source reports for the whole matching set, when it can say. */
  rows: number;
}

/** The current query and whether the bar is showing. */
export interface FindState {
  text: string;
  caseSensitive: boolean;
  wholeCell: boolean;
  columns: string[] | null;
  open: boolean;
}

/**
 * In-grid find (BACKLOG-0001018): locate text and step through where it
 * occurs without filtering anything away. Matches are a visual overlay — no
 * row is reordered, removed or edited — and coexist with the quick filter.
 */
export interface FindApi {
  /** Search now, scanning every loaded row before returning; an empty text clears. */
  (text: string, opts?: FindQuery): FindCount;
  /** Show the bar with focus in its input, optionally seeding the text. */
  open(text?: string): void;
  /** Hide the bar and clear every match. */
  close(): void;
  /** Clear the query and the highlights, leaving the bar as it is. */
  clear(): void;
  /** The next match, wrapping from the last to the first, scrolled into view and made the active cell unless an edit is open. */
  next(): FindMatch | null;
  /** The previous match, wrapping from the first to the last. */
  prev(): FindMatch | null;
  /** Make the match at a position in `matches()` current. */
  goTo(index: number): FindMatch | null;
  /** Every match, in display order: pinned-top rows, then the body, then pinned-bottom rows. */
  matches(): FindMatch[];
  count(): FindCount;
  current(): FindMatch | null;
  state(): FindState;
  /** How a cell is painted: the current match, another match, or nothing. */
  stateFor(key: string, colId: string): 'current' | 'match' | null;
}

export interface StateApi {
  get(): GridState;
  apply(state: GridState, opts?: { skip?: (keyof GridState)[] }): StateApplyReport;
  /**
   * The grid as configured, without `config.state` — captured once, before
   * that seed is applied, so a view opened through `config.state` is never
   * itself mistaken for the default `reset()` returns to.
   */
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
   * The prompt describing this grid (its columns, types and operators) for
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
  /**
   * The column under the pointer, or `null` when the row belongs to no column:
   * a right-click in the empty tail of a row beyond the last column
   * (BACKLOG-0001153), or on a group row, pivot group row or full-width row.
   * The grid-level menu stands in that case (BACKLOG-0001068).
   */
  colId: string | null;
  /** The cell's value; `undefined` when there is no column. */
  value: unknown;
  /** The row wrapper. */
  row: Row;
  /** Your original row object. */
  data: unknown;
  /** The resolved column; `undefined` when `colId` is `null`. */
  column: ResolvedColumn | undefined;
  index: number;
  grid: Grid;
}

/** Which group `groupDefaultExpanded` is being asked about. */
export interface GroupInfo {
  /** The group's key, the same string `Row.key` carries and `rows.expand` takes. */
  key: string;
  /** The id of the column this level groups on. */
  column?: string;
  /** The value this group stands for. */
  value?: unknown;
  /** Depth of the group. Zero is the outermost level. */
  level?: number;
  /** The group path from the root down to this group. */
  path?: string[];
}

/** What `groupRenderer` is handed. */
export interface GroupRowParams {
  /** The group row itself. */
  row: Row;
  /** The group's key, as `rows.expand`/`rows.collapse` take it. */
  key: string;
  /** The id of the column this level groups on. */
  column?: string;
  /** The value this group stands for. */
  value: unknown;
  /** Depth of the group. Zero is the outermost level. */
  level: number;
  /** Whether the group is currently open. */
  expanded: boolean;
  /** How many records sit beneath it, at any depth. */
  leafCount: number;
  /** The group's own reductions, by column id — whatever `total` asked for. */
  totals?: Record<string, unknown>;
  /**
   * The rows beneath this group, computed when you call it.
   *
   * A function rather than an array because a group is unbounded and this runs
   * per paint: a host that only needs the count should read `leafCount` and
   * never call this.
   */
  leaves(): Row[];
  /** Expand the group if it is closed, collapse it if it is open. */
  toggle(): void;
  grid: Grid;
  /** The element to fill. Write into it directly, or return content instead. */
  element: HTMLElement;
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
  | 'export' | 'excel' | 'clipboard' | 'print'
  // The native annotation tools, on the rail when `toolPanel.annotate` is set
  // or while a presentation runs. Each is toggleable (see `RailAction.active`).
  | 'pen' | 'arrow' | 'rect' | 'highlight';

/** What a host rail action's `run` is handed. */
export interface RailActionParams {
  grid: Grid;
  keys: string[];
  cells: { key: string; colId: string }[];
}

export interface RailAction {
  name: string;
  title: string | (() => string);
  /**
   * A glyph name from the icon registry (see {@link IconName}) — a built-in
   * name, or one registered with `registerIcon`/`registerIcons`,
   * `config.icons` or `grid.icons`. A function form is re-read on every
   * repaint, the same as `title`, so a toggle can swap its glyph with its
   * state. When omitted, the rail tries `name` as the icon name instead (so an
   * action named after a built-in, e.g. `'undo'`, needs no separate `icon`);
   * an unrecognised name — from either `icon` or the `name` fallback — draws a
   * blank glyph, and only an explicitly-given unrecognised `icon` warns once
   * in the console.
   */
  icon?: IconName | (() => IconName);
  run(params: RailActionParams): void;
  enabled?(): boolean;
  /**
   * Marks the action as a toggle and reports whether it is currently on. When
   * present the rail renders `aria-pressed` and a pressed style, re-read on
   * every repaint; a one-shot action omits it and is unchanged. This is the
   * hook the native annotation tools use, and it is available to a host button
   * that is itself a toggle.
   */
  active?(): boolean;
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
  /** The data: reading it, changing it, walking it. */
  readonly rows: RowsApi;
  /** The columns: order, width, visibility, grouping and pivoting. */
  readonly columns: ColumnsApi;
  /** What is selected, and the range the user has marked. */
  readonly selection: SelectionApi;
  /** The filter tree, however it was set. */
  readonly filters: FiltersApi;
  /** The sort, in priority order. */
  readonly sort: SortApi;
  /** Editing sessions: starting, committing and cancelling them. */
  readonly edit: EditApi;
  /** Where the viewport is, and moving it. */
  readonly scroll: ScrollApi;
  /** CSV, Excel and clipboard. */
  readonly export: ExportApi;
  /** Bringing rows in from CSV/TSV text, a file, the clipboard or a drop. */
  readonly import: ImportApi;
  /** Everything the user arranged, as a serialisable object. */
  readonly state: StateApi;
  /** The loading, empty and error surfaces drawn over the grid. */
  readonly overlay: OverlayApi;
  /** Undo and redo over edits and structural changes. */
  readonly history: HistoryApi;
  /** Saved arrangements the user can switch between. */
  readonly views: ViewsApi;
  /** What changed against a baseline, cell by cell. */
  readonly diff: DiffApi;
  /** Who may see, edit and export what. */
  readonly permissions: PermissionsApi;
  /** A machine-readable description of the grid, for a model to read. */
  readonly ai: AiApi;
  /** Translation: the catalogue and the active locale. */
  readonly messages: MessagesApi;
  /** Licence state, and setting a key after construction. */
  readonly licence: LicenceApi;
  /** Pages, where the grid is paged rather than scrolled. */
  readonly pagination: PaginationApi;
  /** Transient emphasis on a row, column or cell. */
  readonly highlight: HighlightApi;
  /** In-grid find: locate text without filtering, and step through the matches. */
  readonly find: FindApi;
  /** Values hidden from view and from export. */
  readonly redaction: RedactionApi;
  /** An image of the grid as drawn, where the module is installed. */
  capture?(opts?: CaptureOptions): Promise<Blob>;
  /** Drawing over the grid, where the module is installed. */
  annotate?: AnnotationApi;
  /** Full screen, scaling and chrome suppression. */
  readonly presentation: PresentationApi;
  /** Expand and collapse the pivot presentation's axes; the state a view carries. */
  readonly pivotView: PivotViewApi;
  /** The live feed: pausing it, flushing it, and what it has done. */
  readonly updates: UpdatesApi;
  /** Replaying the changes the grid has seen. */
  readonly timeline: TimelineApi;
  /** Cross-filtering, a derived grid filtering the grid it derives from. */
  readonly crossFilter: CrossFilter;
  /** Header distributions, and the filters clicking one creates. */
  readonly facets: FacetsApi;
  /** The expandable panel beneath a row. */
  readonly detail: DetailApi;
  /** Threads attached to rows and cells. */
  readonly comments: CommentsApi;
  /** Who else is looking, and where. */
  readonly presence: PresenceApi;
  /** What the grid is doing, for when it is doing it slowly. */
  readonly diagnostics: DiagnosticsApi;
  /** Reductions, profiles, correlations, capability and intervals. */
  readonly statistics: StatisticsApi;
  /** Formatting a value as the grid would, outside a cell. */
  readonly formatting: FormattingApi;
  /** Declarative column validation: why a write was refused, and clearing marks. */
  readonly validation: ValidationApi;
  /** Full-screen control, where it is enabled. */
  readonly maximise?: MaximiseApi;
  /**
   * The element you passed to `createGrid`, not the grid's own root.
   *
   * The grid builds its `.lattice` root *inside* that element, so
   * `el.closest('.lattice')` never matches this, and a theme attribute set on
   * it has no effect, the theme is read from the root within. Use
   * `element.querySelector('.lattice')` for the grid's own root.
   */
  readonly element: HTMLElement | null;
  /** Whether `destroy` has run. Every other member is inert afterwards. */
  readonly destroyed: boolean;
  /** False until the first render has been laid out. */
  readonly ready: boolean;

  /** The resolved configuration, as one object. */
  config(): GridConfig;
  get<K extends keyof GridConfig>(key: K): GridConfig[K];
  set<K extends keyof GridConfig>(key: K, value: GridConfig[K]): void;
  /** Apply several configuration changes as one update rather than several. */
  setAll(values: Partial<GridConfig>): void;

  /** Listen. Returns the function that stops listening. */
  on(event: EventName, handler: EventHandler): Unsubscribe;
  /** Listen until it fires once. */
  once(event: EventName, handler: EventHandler): Unsubscribe;
  /** Stop listening. */
  off(event: EventName, handler: EventHandler): void;
  /** Raise an event of your own on the grid's bus. */
  emit(event: string, payload?: Record<string, unknown>): void;

  /**
   * Pin rows above or below the scrolling body.
   *
   * The rows render through the ordinary column pipeline but are not part of
   * the data: not counted, sorted, filtered, grouped, selectable or exported.
   *
   * Pass a new array rather than mutating the one you passed before: array
   * identity is how the grid knows the pinned rows have changed.
   */
  setPinnedRows(rows: unknown[], opts?: { edge?: 'top' | 'bottom' }): void;

  /** The objects currently pinned at one edge, as a copy. */
  getPinnedRows(opts?: { edge?: 'top' | 'bottom' }): unknown[];

  /** The row form. Declines when `rowForm` is not configured. */
  readonly form: RowFormApi;

  /** The library version. */
  getVersion(): string;
  /** Release everything: listeners, timers, workers and the DOM the grid made. */
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
  /** Render one stored number across an ordered subset of the system's units,
   *  e.g. `['ft', 'in']` for `5 ft 11 in`. Display and parse only: the stored
   *  value stays a single base-unit number, so sort, filter and total are
   *  unchanged. Parsing sums the parts. */
  compound?: string[];
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

/**
 * A stored currency value: an amount in a named currency. `{amount:10,code:'USD'}`
 * is a different value from `{amount:10,code:'EUR'}` — currency is a real type,
 * not a display format, so the code rides on every cell.
 */
export interface Money {
  amount: number;
  code: string;
}

/**
 * A caller-supplied exchange-rate source. The grid ships and fetches no rates.
 * Either a function `(from, to) => rate|null`, or a table of rates per unit of a
 * common base (the base being whichever code maps to 1, or `rateBase`). A source
 * that cannot answer returns `null`, which is surfaced loudly, never as zero.
 */
export type RateSource =
  | ((from: string, to: string) => number | null)
  | Record<string, number>;

export interface CurrencyConfig {
  /** The default currency code for bare numeric input, e.g. `'USD'`. */
  code?: string;
  /** The currency to render and aggregate in. Omit to keep each cell's own. */
  display?: string;
  /** The caller's rate source: a `(from,to)=>rate|null` fn or a rate table. */
  rates?: RateSource;
  /** The code a rate *table* is denominated in, when not the one mapping to 1. */
  rateBase?: string;
  /** Fixed fraction digits; omit for the code's own convention. */
  decimals?: number;
  /** The locale for number formatting. */
  locale?: string;
  /** Text for a null cell. */
  nullDisplay?: string;
  /** The loud marker rendered when a needed rate is missing. */
  missingRate?: string;
  /** An Excel number-format override. */
  excel?: string;
  /** The code list a currency editor's picker offers. */
  codes?: string[];
}

/** Build a currency `DataType` (amount + code), aggregate-safe across currencies. */
export function createCurrencyType(config?: CurrencyConfig): DataType;
/** Parse edited/pasted text into a `Money`, taking the config's `code` for bare numbers. */
export function parseMoney(text: string | number, cfg?: CurrencyConfig): Money | null;
/** Render a `Money`, in the display currency when set; loud marker when a rate is missing. */
export function formatMoney(value: unknown, cfg?: CurrencyConfig): string;
/** Convert a `Money` into a target code via the resolved rate fn; `null` when no rate. */
export function convertMoney(
  money: Money,
  to: string,
  rate: (from: string, to: string) => number | null,
): number | null;
/** Resolve a caller's rate source into a `(from,to)=>rate|null` function. */
export function rateFunction(rates?: RateSource, base?: string): (from: string, to: string) => number | null;
/** The loud marker text a missing rate renders as. */
export const MISSING_RATE: string;

/** How a statistic block finds the number it reports. */
export interface StatValueSpec {
  /** The column to reduce, as a field name or a dotted path. Omit for `count`. */
  of?: string;
  /** A key of `TOTAL_FNS`: `sum`, `avg`, `median`, `p95`, `gini` and the rest. */
  fn?: TotalName;
  /**
   * Report this column from the row holding the extreme, rather than the
   * extreme itself: `{ of: 'sales', fn: 'max', show: 'rep' }` is the *name* of
   * the best rep. Needs `min` or `max`, no single row holds an average.
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
  /**
   * An optional leading icon beside the title and value, using the same value
   * contract as a menu item: a registered sprite name, a single character or
   * emoji, or author-trusted element markup (`'<i class="fa-light fa-bolt">
   * </i>'`, an `<img>`). It lays out to the side without disturbing the change
   * indicator, threshold bands or confidence interval; omit it for the plain
   * tile layout.
   */
  icon?: string;
  /** A literal value, a spec to reduce, or a function of the grid. */
  value?: unknown | StatValueSpec | ((grid: Grid) => unknown);
  /** Text under the value, or a function of it. */
  footer?: string | ((value: unknown, grid: Grid) => string);
  /** What the value is compared against, for the change indicator. */
  baseline?: number | ((grid: Grid) => number);
  /** Whether a rise is good news. `up` by default. */
  goodWhen?: 'up' | 'down' | 'neither';
  /**
   * Thresholds the value itself is judged against, setting `data-tone` on the
   * tile. Separate from `goodWhen`, which judges the *change*: a Cpk of 0.9 is
   * bad news whether it rose or fell to get there.
   */
  bands?: { good?: number; warn?: number; direction?: 'up' | 'down' }
    | ((value: unknown, grid: Grid) => 'good' | 'warn' | 'bad' | null);
  /**
   * An interval to show under the value: how much to trust it. Return
   * whichever of the grid's intervals belongs to this tile.
   */
  interval?: (value: unknown, grid: Grid) =>
    { lower: number; upper: number; confidence?: number } | null;
  /** Which rows feed the value. `filtered` by default. */
  scope?: 'filtered' | 'all' | 'selected';
  /** `false` stops the tile following the grid; `refresh()` still works. */
  live?: boolean;
  /** Override the formatting the column's type would apply. */
  format?: (value: unknown, grid: Grid) => string;
  /** Shown when there is no value. `, ` by default. */
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

/**
 * Build a source configuration from a pushdown adapter. The result is an
 * ordinary remote source, so block caching, abort on supersede and group-level
 * fetching all apply unchanged.
 */
export function createPushdownSource(
  config: PushdownSourceConfig,
): SourceConfig & {
  lastPlan(): PushdownPlan | null;
  /**
   * Compute a set of aggregates over the matching set, splitting them between
   * the engine and the client by the design-time `aggregates` config
   * (BACKLOG-0000730 Part B). Ungrouped, returns the engine-computed `values`
   * keyed by id. When the request carries a `groupBy`, returns `groups` instead:
   * one entry per subtotal level and the grand total (`level: 0`, produced by a
   * single `GROUP BY ROLLUP`), each with its key values and its aggregate values
   * keyed by id. The client list is what the caller computes itself over the
   * full set. Aggregates are pushed only when the filter is fully pushed and —
   * under grouping — every grouping key is a plain column the engine can group
   * by; a residual filter or an unpushable group key forces every aggregate
   * client-side (no mixed provenance).
   */
  aggregate(
    request: RemoteRequest,
    requested: AggregateRequest[],
  ): Promise<{
    values: Record<string, unknown>;
    groups?: Array<{
      keys: unknown[];
      grouping?: number[];
      level: number;
      values: Record<string, unknown>;
    }>;
    engine: AggregateProvenance[];
    client: AggregateProvenance[];
  }>;
};

/**
 * Load a JSON or NDJSON file from a URL (BACKLOG-0000944).
 *
 * Returns a `StreamSourceConfig` for `createGrid(el, { source: createUrlSource(url, opts) })`.
 * A JSON file (a top-level array, or a nested array selected by `rowsPath`/`map`)
 * is read whole and handed over as rows; an NDJSON/JSONL file (one JSON value per
 * line) is streamed in incrementally in batches. Format is resolved from an
 * explicit `format`, else the URL extension, else the `Content-Type`, else a
 * sniff of the first bytes or a clear error. Errors — a non-2xx status, a network
 * failure, a bad body, a malformed line — surface as `source:error`, never as an
 * uncaught throw. Zero new dependencies: `fetch`, `response.body.getReader()` and
 * `TextDecoder`.
 *
 * @param url the file URL
 * @param opts loading options
 * @returns a stream source config
 */
export function createUrlSource(
  url: string,
  opts?: {
    /** Explicit format; wins over inference. */
    format?: 'json' | 'ndjson';
    /** Dot path to the array inside a wrapped JSON body (JSON only). */
    rowsPath?: string;
    /** Extract the array from the parsed JSON (JSON only); runs after `rowsPath`. */
    map?: (parsed: unknown) => unknown[];
    /** Transport override for auth, headers or a proxy; default `globalThis.fetch`. */
    fetch?: typeof fetch;
    /** Headers merged into the request. */
    headers?: Record<string, string>;
    /** Re-fetch on this interval in milliseconds; each pass replaces the rows. */
    poll?: number;
    /** NDJSON rows per emitted chunk, to avoid render thrash; default 500. */
    batchSize?: number;
    /** NDJSON: skip a malformed line with a warning rather than failing the stream. */
    lenient?: boolean;
    /** Start fetching on construction; default true. */
    autoStart?: boolean;
    /** Sliding-window bound passed through to the stream. */
    maxRows?: number;
    /** Render-coalescing window in ms, passed through to the stream. */
    coalesceMs?: number;
    /** Promote to a memory source below this row count, passed through to the stream. */
    promoteToMemoryBelow?: number;
  },
): StreamSourceConfig;

/**
 * The pushdown map (BACKLOG-0000730 Part B): one published record per statistic
 * giving whether the engine can express it, the DuckDB aggregate SQL it emits,
 * and whether that result is IDENTICAL to the grid's own kernel or MAY-DIFFER.
 * The single source of truth the push router, the docs and `lastPlan()` all read.
 */
export const STAT_PUSHDOWN: Readonly<Record<string, {
  pushable: boolean;
  class: 'identical' | 'may-differ' | 'fallback';
  sql?: string;
  note?: string;
  twoColumn?: boolean;
  blankAware?: boolean;
}>>;

/**
 * The capability set an adapter that declares nothing is treated as having:
 * everything off. Such an adapter still works, and the grid does all the work.
 */
export const NO_CAPABILITIES: Readonly<Required<PushdownCapabilities>>;

/**
 * Resolve what an adapter says it can do against the defaults, giving a
 * complete capability set with no absent keys to test for.
 */
/**
 * A capability set with every key present, as `capabilitiesOf` returns it.
 *
 * `operators` becomes a `Set` rather than staying an array: it is tested once
 * per condition per query, and membership on an array is a scan. The declared
 * form and the resolved form differ, which is why this is its own type.
 */
export type ResolvedCapabilities = Omit<Required<PushdownCapabilities>, 'operators' | 'mutate'> & {
  operators: ReadonlySet<string>;
  /** Resolved by `resolveMutate`: `false`, or every kind and `returning` present. */
  mutate: false | Required<MutateCapability>;
};

/**
 * Resolve an adapter's declared `mutate` block against the defaults (§4.1).
 * `false` (or anything falsy) stays `false` — read-only by declaration.
 */
export function resolveMutate(declared?: boolean | MutateCapability): false | Required<MutateCapability>;

export function capabilitiesOf(declared?: PushdownCapabilities): ResolvedCapabilities;

/**
 * Split a filter tree into the half the engine takes and the half left over.
 *
 * The two halves are not symmetric. An `and` group narrows with each condition,
 * so the supported conjuncts can be pushed and the rest kept back: the engine
 * returns a superset and the grid narrows it. An `or` group widens with each
 * branch, so pushing only the supported branches would return fewer rows than
 * the filter allows and the grid could not recover what was never fetched. A
 * disjunction that is not fully supported therefore stays whole on the client.
 */
export function splitFilters(
  filters: object | null,
  caps: ResolvedCapabilities,
): { pushed: object | null; residual: object | null };

/**
 * Plan one request against what the adapter can do, giving the query to send
 * and the work to finish afterwards.
 *
 * When anything is left over, `needsAll` is set and the source asks for the
 * whole result rather than a window. Filtering a window on the client is not a
 * slower route to the right answer, it is a fast route to a wrong one: the rows
 * that belong on page one may sit on page nine, and the total is whatever the
 * engine happened to count.
 */
export function planQuery(
  request: RemoteRequest,
  caps: ResolvedCapabilities,
): PushdownPlan;

/**
 * Apply whatever the engine could not, over the rows it returned. This runs
 * through the grid's own filter and sort kernels rather than a second
 * implementation, so a residual predicate means exactly what the same predicate
 * means anywhere else in the grid.
 */
export function applyResidual(
  rows: unknown[],
  residual: PushdownPlan['residual'],
  compute: object,
): unknown[];

/** An adapter for any OData v4 endpoint. */
export function odataAdapter(options: {
  url: string; fetch?: typeof fetch; headers?: Record<string, string>;
  count?: boolean; search?: boolean;
  /**
   * The key property every write addresses a row by in its entity-key URL
   * segment (`/Orders(<key>)`), and that an add-row is rekeyed to from the
   * created entity. Write-back only (§7 OData).
   */
  key?: string;
  /**
   * Opt the adapter into write-back. `false` (the default) declares the source
   * read-only; `true` advertises `mutate: { update: true, delete: true, append:
   * true, returning: 'row' }` so a committed cell edit is persisted with
   * `PATCH`, a row delete with `DELETE /EntitySet(key)`, and an add-row with
   * `POST /EntitySet` reading the created entity back (§7 OData,
   * BACKLOG-0000766, BACKLOG-0000795).
   */
  edit?: boolean;
}): PushdownAdapter & { urlFor(query: RemoteRequest): string };

/**
 * An adapter for an ordinary REST endpoint. Parameter names are yours; declare
 * `operators` only for comparisons the endpoint genuinely applies.
 */
export function restAdapter(options: {
  url: string; fetch?: typeof fetch; headers?: Record<string, string>;
  params?: Partial<Record<'offset' | 'limit' | 'sort' | 'order' | 'filter' | 'search', string>>;
  capabilities?: PushdownCapabilities; operators?: string[];
  encodeFilter?: (filters: object) => string;
  rows?: (body: unknown) => unknown[]; total?: (body: unknown, rows: unknown[]) => number;
  /**
   * Opt the adapter into write-back. `false` (the default) declares the source
   * read-only; `true` advertises `mutate: { update: true, delete: true, append:
   * true, returning }` so a committed cell edit is persisted with `PATCH`, a row
   * delete with `DELETE`, and an add-row with `POST` to the collection URL
   * (§7 REST, BACKLOG-0000769, BACKLOG-0000795).
   */
  edit?: boolean;
  /**
   * The reconcile contract for a successful write (§5.1). `'none'` (the default)
   * is last-write-wins — the optimistic value stands; `'row'` reads the server's
   * authoritative row (via {@link writeRow}) back before confirm; `'key'` reads
   * only the server-assigned key. An add-row needs `'row'` or `'key'` so the
   * temp row can be rekeyed to its server key.
   */
  returning?: 'row' | 'key' | 'none';
  /**
   * The property an add-row response carries the server-assigned key in, read
   * back (through {@link writeRow}) to rekey the optimistic row. Defaults to
   * `id`. Write-back only.
   */
  keyField?: string;
  /**
   * Full control of a mutation's HTTP shape, overriding the default verb map and
   * URL. Given the {@link MutationOp}, return the method, url and optional
   * headers/body actually sent. Overriding this supersedes {@link writeUrlFor}.
   */
  encodeMutation?: (op: MutationOp) => { method: string, url: string, headers?: Record<string, string>, body?: unknown };
  /**
   * The endpoint a single mutation targets, when the default `${url}/${key}` is
   * not what the service uses. Ignored when {@link encodeMutation} is supplied.
   * Addresses an existing row; an add-row POSTs to the collection `url` instead.
   */
  writeUrlFor?: (op: MutationOp) => string;
  /**
   * Pull the authoritative row out of a write response when `returning: 'row'`,
   * and the created row an add-row reads its key from. Tolerates the plain
   * entity, a `{ row }` or a `{ data }` envelope by default.
   */
  writeRow?: (body: unknown) => unknown;
}): PushdownAdapter & { urlFor(query: RemoteRequest): string };

/**
 * An adapter over a DuckDB connection, in the browser through
 * `@duckdb/duckdb-wasm` or on a server through any DuckDB client.
 *
 * The engine is the caller's: this takes a live connection and imports nothing,
 * so a grid can drive a full analytical engine without the package carrying
 * one. `from` is any FROM expression, so `read_parquet('s3://bucket/*.parquet')`
 * is as valid as a table name.
 *
 * Values are bound through prepared statements. A connection without `prepare`
 * is used only for unfiltered queries, because interpolating a user's filter
 * into SQL is the one thing worse than not filtering.
 */
export function duckdbAdapter(options: {
  /** A live connection exposing `query`, and ideally `prepare`. */
  connection: object;
  /** A table, a view, or any FROM expression. */
  from: string;
  /** Columns to select. Everything by default. */
  fields?: string[];
  /**
   * Whether to count the matching set at all. `true` by default: the total is a
   * separate `count(*)` statement carrying the same `WHERE`, dispatched in the
   * same tick as the page query rather than serialised behind it
   * (BACKLOG-0001065). `false` issues no count statement, declares
   * `capabilities.total: false`, and leaves the result's `total` **absent** — so
   * the grid scrolls open-ended instead of being told the page length is the
   * whole set. Turn it off for a grid that never shows a count: an unfiltered
   * count is answered from Parquet metadata and a filtered one still has to
   * evaluate the predicate, so it is cheap rather than free.
   */
  count?: boolean;
  /**
   * The key column an update and a delete target in their `WHERE`, and that an
   * add-row is rekeyed by. Write-back is refused unless this names a real column,
   * because an `UPDATE`/`DELETE` without a unique key could touch more than one
   * row (§7 DuckDB). Defaults to `id`.
   */
  keyField?: string;
  /**
   * Allow write-back against a plain writable table. `false` (the default) keeps
   * the source read-only, so a `from` that is a view or an expression can never
   * be mutated by accident. Enables `update`, `delete` and `append`
   * (BACKLOG-0000765, BACKLOG-0000795).
   */
  writable?: boolean;
  /**
   * The reconcile contract for a successful write (§5.1). `'row'` (the default)
   * appends `RETURNING *` and reconciles server truth (computed columns,
   * triggers); `'none'` keeps the optimistic value (last-write-wins). An add-row
   * always `RETURNING`s at least the key column regardless, since it needs that
   * key to rekey the temp row.
   */
  returning?: 'row' | 'none';
}): PushdownAdapter & {
  sqlFor(query: RemoteRequest): { sql: string; params: unknown[] };
  /**
   * The separate `count(*)` statement that reports the matching set's size, with
   * the same `WHERE` as {@link sqlFor} and no `ORDER BY` or `LIMIT`
   * (BACKLOG-0001065). `null` when the adapter was built with `count: false`.
   */
  countSqlFor(query: RemoteRequest): { sql: string; params: unknown[] } | null;
  /**
   * The `GROUP BY` statement one level of a grouped grid becomes
   * (BACKLOG-0001325), exposed like {@link sqlFor} so a test can read it without
   * an engine. `keyCol` is the grouping column at the request's depth and
   * `keyAlias` the name its value comes back under.
   */
  groupLevelSqlFor(
    query: RemoteRequest,
    aggregates?: Array<{ id: string; col: string; fn: string; weight?: string }>,
  ): { sql: string; params: unknown[]; keyCol: string; keyAlias: string };
  /**
   * The statement that counts the *groups* at one level — a `count(*)` over the
   * grouped sub-select, which is not the matching row count (BACKLOG-0001325).
   * `null` when the adapter was built with `count: false`.
   */
  groupCountSqlFor(query: RemoteRequest): { sql: string; params: unknown[] } | null;
  /**
   * The row query for the leaves of a group: the page statement with the parent
   * group path ANDed onto its `WHERE` (BACKLOG-0001325).
   */
  groupLeafSqlFor(query: RemoteRequest): { sql: string; params: unknown[] };
  /**
   * The count of leaves inside one group (BACKLOG-0001325). `null` when the
   * adapter was built with `count: false`.
   */
  groupLeafCountSqlFor(query: RemoteRequest): { sql: string; params: unknown[] } | null;
  /**
   * The whole-matching-set summary that rides alongside a root-level grouped
   * fetch: the matching row count and the grand total in one statement
   * (BACKLOG-0001325).
   */
  groupSummarySqlFor(
    query: RemoteRequest,
    aggregates?: Array<{ id: string; col: string; fn: string; weight?: string }>,
  ): { sql: string; params: unknown[] };
};

/**
 * An adapter for a DemandFlow entity, speaking `POST /v1/query`.
 *
 * `comboKey` is the *name* of the key attribute to match on, which is
 * `'comboKey'` for a standard hierarchy; `query` is the prefix matched against
 * it, where `'SUB'` alone means every record of the entity in the tenant.
 *
 * Every request also sends a `countOnly` line, because `limit` caps rows
 * scanned rather than matched: a filtered query returns an arbitrary subset and
 * the count is the only thing that reveals it.
 */
export function dfqlAdapter(options: {
  entity: string;
  /** A personal access token. Never commit one. */
  token: string;
  /** The API base. `https://rest.demandflow.com` by default. */
  url?: string;
  /** The key attribute to match on: `comboKey`, `comboKey2` or `comboKey3`. */
  comboKey?: string;
  /** The prefix to match against it. `SUB` by default. */
  query?: string;
  /** Fields to project, which saves bandwidth but not query cost. */
  load?: string[];
  limit?: number;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
  /**
   * Where record mutations are POSTed, when the default write endpoint is not
   * what the deployment uses. Write-back persists update, delete and add-row
   * (§7 DFQL, card 771).
   */
  writeUrl?: string;
  /**
   * Map a new grid row to the DemandFlow `fields` an append needs — its required
   * `entity`/`level`/`comboKey` — since the grid's structural append only knows
   * the row's own fields. Called once per appended row.
   */
  encodeCreate?: (row: unknown) => Record<string, unknown>;
}): PushdownAdapter & { linesFor(query: RemoteRequest): object[] };

/**
 * An adapter for a GraphQL endpoint (BACKLOG-0000741).
 *
 * GraphQL has no fixed query semantics — a filter, a sort and pagination are
 * whatever the schema defines — so this adapter is configured, not zero-config.
 * The caller supplies `buildQuery`, which turns the pushed plan into the
 * `{ query, variables }` body a GraphQL endpoint is POSTed, and `parseResponse`,
 * which reads the operation's `data` back into `{ rows, total }`. Sensible
 * defaults cover an offset/limit list with a `totalCount` and a Relay cursor
 * connection (`first`/`after` with `pageInfo`); either is replaced by passing
 * the hook.
 *
 * The default `buildQuery` pushes only the window and asks for the total, so the
 * default capabilities are `range` and `total` and nothing else: filter, sort
 * and quick are left absent and the grid finishes them over the window. Declare
 * `operators`/`capabilities` only alongside a `buildQuery` that genuinely emits
 * them, or the grid returns the wrong rows silently.
 *
 * A Relay cursor connection is forward-only: a deep window is reached by paging
 * forward to it, which costs round trips proportional to its offset. Offset
 * pagination jumps straight to the window. `buildMutation` opts the write path
 * in and is a declared follow-up (the write-back wave); `capabilities.mutate` is
 * `false` by declaration until it is wired.
 */
export function graphqlAdapter(options: {
  /** The GraphQL endpoint, POSTed a `{ query, variables }` body. Required. */
  url: string;
  fetch?: typeof fetch; headers?: Record<string, string>;
  /** The root query field the default query selects from. `items` by default. */
  field?: string;
  /** Field names for the default query's selection set. */
  fields?: string[];
  /** A raw selection set (for nested fields), overriding `fields`. */
  selection?: string;
  /** `offset` (offset/limit list) or `cursor` (Relay connection). `offset` by default. */
  pagination?: 'offset' | 'cursor';
  /** The page size for the whole-result and forward-cursor walks. */
  pageSize?: number;
  /**
   * Whether the default query asks for `totalCount`. `true` by default.
   * `false` drops it from the selection set and declares
   * `capabilities.total: false`, so a grid that never shows a count does not
   * make the server compute one (BACKLOG-0001065). Unlike the DuckDB adapter the
   * count is not split into a second operation — that would cost an extra HTTP
   * round trip rather than saving one — so suppression is the only lever here.
   */
  count?: boolean;
  /** Rename the pagination variables the adapter drives per page. */
  vars?: Partial<Record<'offset' | 'limit' | 'first' | 'after', string>>;
  capabilities?: PushdownCapabilities; operators?: string[];
  /** Turn the pushed plan into a GraphQL operation `{ query, variables }`, replacing the default. */
  buildQuery?: (request: RemoteRequest) => object;
  /** Read the operation's `data` into `{ rows, total, pageInfo? }`, replacing the default. */
  parseResponse?: (data: object) => object;
  /** Turn a mutation into a GraphQL operation (write-back follow-up). */
  buildMutation?: (op: object) => object;
}): PushdownAdapter & {
  buildQuery(query: RemoteRequest): { query: string; variables: object };
  parseResponse(data: object): { rows: unknown[]; total: number };
};

export function createGrid(element: HTMLElement, config?: GridConfig): Grid;
export function createHeadlessGrid(config?: GridConfig): Grid;

/**
 * House-wide defaults, merged beneath every grid built afterwards.
 *
 * For an application with many grids that should agree on theme, density or
 * row key. The exported factories cannot be wrapped in place — `createGrid` is
 * exported through a getter with no setter, so assigning over it is discarded
 * in a plain script and throws in a module — so this is the supported route.
 *
 * - **The per-grid config always wins.** Defaults sit *beneath* what
 *   `createGrid`/`createHeadlessGrid` is passed; a key the grid names keeps the
 *   grid's value, a key it omits takes the house value.
 * - **Plain objects deep-merge; arrays and everything else replace.** A house
 *   `views: { storage }` and a grid's `views: { local: true }` both survive;
 *   a grid's `columns` array replaces the house one rather than extending it.
 * - **Calling it again replaces the set, it does not accumulate.** Extend
 *   explicitly with `defaults({ ...defaults(), density: 'compact' })`.
 * - **Never retroactive.** Grids already built are untouched.
 *
 * `defaults()` reads the current set; `defaults(null)` clears it.
 */
export function defaults(config?: Partial<GridConfig> | null): Partial<GridConfig>;

/**
 * The library version, e.g. `'1.13.1'`.
 *
 * The same value `grid.getVersion()` returns, available without a grid. The
 * method was declared and the module-level function was not, though the
 * reference documents both.
 */
export function getVersion(): string;
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
 * `stats` supplies the column summary the distribution operators need: the
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
 * Returns null where no usable storage exists, a private window, or a browser
 * with site data blocked, so a caller can fall back rather than throw.
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
  defaults: typeof defaults;
  registerModules: typeof registerModules;
  setLicence: typeof setLicence;
  version: typeof version;
  createUnitType: typeof createUnitType;
  registerUnitSystem: typeof registerUnitSystem;
  defineUnit: typeof defineUnit;
  parseUnit: typeof parseUnit;
  formatUnit: typeof formatUnit;
  UNIT_SYSTEMS: typeof UNIT_SYSTEMS;
  createCurrencyType: typeof createCurrencyType;
  parseMoney: typeof parseMoney;
  formatMoney: typeof formatMoney;
  convertMoney: typeof convertMoney;
  rateFunction: typeof rateFunction;
  MISSING_RATE: typeof MISSING_RATE;
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
 * TypeScript caller importing the React adapter (or any other module) got an
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
  | 'scatter' | 'bubble' | 'forest'
  | 'combo' | 'pareto'
  | 'histogram' | 'boxplot' | 'heatmap'
  | 'qq' | 'ecdf' | 'lorenz' | 'correlogram' | 'control' | 'capability' | 'movingRange'
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

/** One axis's configuration. A bare string is the title. */
export interface ChartAxis {
  title?: string;
  /** Fix the axis rather than taking its extent from the data. */
  min?: number;
  max?: number;
  /** A tick count, or the exact values to tick. */
  ticks?: number | unknown[];
  /** A format mask, or a function of the value. */
  format?: string | ((value: unknown) => string);
  /** Draw the gridlines this axis owns. Default true for the measure axis. */
  grid?: boolean;
  /** Draw the tick labels. */
  labels?: boolean;
  /**
   * Pin the x axis's scale rather than taking it from the column's type
   * (BACKLOG-0001344). The default, `'auto'`, is the rule stated in the charts
   * section: a temporal column type (`date`, `datetime`, `timestamp`,
   * `dateString`) draws a time axis, a numeric one draws a linear axis whatever
   * its distinct count, and everything else draws bands. `'band'` is how a
   * numeric code column — a quarter, a rating, a star count — asks for its
   * bands back; `'linear'` and `'time'` put a column the grid types as text
   * onto a continuous axis. Only the x axis reads it.
   */
  scale?: 'auto' | 'linear' | 'time' | 'band' | 'category';
  /** Show every nth category label, on a crowded category axis. */
  every?: number;
  /** Force the category labels' rotation rather than deciding it. */
  rotate?: boolean | 'auto';
  /**
   * A rolling window for the axis domain (BACKLOG-0001036), in the shipped
   * `WindowSpec` vocabulary that rolling statistics already use. Only
   * `{ kind: 'time', span }` applies to an axis: the domain becomes the last
   * `span` milliseconds ending **now**, so the chart keeps scrolling left while
   * the feed is silent — the thing a count window cannot do, because with no
   * rows arriving nothing changes. Advanced on a low-frequency clock (a quarter
   * of the window, between 50 ms and 1 s), never per frame, and stopped when the
   * chart is destroyed or its document is hidden. Needs a continuous x axis
   * carrying wall-clock times; `{ kind: 'count' }` is the source's `maxRows` and
   * is refused here rather than given a second meaning.
   */
  window?: Pick<WindowSpec, 'kind' | 'span'>;
}

/**
 * One declarative annotation (BACKLOG-0000744).
 *
 * A reference or target line, a shaded band, or a callout. Its value is a
 * constant `value` (or `from`/`to` for a band), or a `compute` reduction of the
 * data it annotates — `mean`, `median`, `min`, `max`, or `p95` for a
 * percentile — so it follows the data as the grid is filtered. Every annotation
 * names the axis it reads, which on a dual-axis chart is what stops it being
 * placed against the wrong scale, and is written into the accessible table as a
 * sentence.
 */
/**
 * A trend or forecast overlay method (BACKLOG-0000952). Each name has aliases:
 * `linear` (also `lr`, `ols`, `regression`); `movingAverage` (also `ma`, `sma`,
 * `rolling`); `exponential` (also `ewma`, `ses`, `holt`, `smoothing`).
 */
export type ChartTrendMethod = 'linear' | 'movingAverage' | 'exponential'
  | 'lr' | 'ols' | 'regression' | 'ma' | 'sma' | 'rolling'
  | 'ewma' | 'ses' | 'holt' | 'smoothing';

/** One trend or forecast overlay (BACKLOG-0000952). */
export interface ChartTrend {
  /** The overlay method; `linear` by default. */
  method?: ChartTrendMethod;
  /**
   * For the linear method, how many steps to project the line past the data as a
   * dashed forecast. Ignored by the moving-average and exponential methods,
   * which have no slope to extrapolate.
   */
  forecast?: number;
  /** For the moving-average method, the trailing window in points; 3 by default. */
  window?: number;
  /** An alias for `window`. */
  period?: number;
  /** For the exponential method, single smoothing (`ses`) or Holt's level+trend (`holt`). */
  kind?: 'ses' | 'holt';
  /** For the exponential method, the level factor in `[0, 1]`; omit to fit it. */
  alpha?: number;
  /** For Holt's exponential smoothing, the trend factor in `[0, 1]`; omit to fit it. */
  beta?: number;
  /**
   * The uncertainty band shaded around a linear `forecast` (BACKLOG-0000975).
   * The Student-t `prediction` band (a future observation) by default;
   * `confidence` shades the narrower mean-response band; `false` opts out and
   * leaves the bare dashed line. Ignored where there is no linear forecast to
   * put a band on.
   */
  band?: boolean | 'prediction' | 'confidence';
  /** The forecast band's confidence level in `(0, 1)`; 0.95 by default. */
  confidence?: number;
  /** `false` suppresses the R² label on a linear trend. */
  label?: boolean;
}

/**
 * One declarative annotation (BACKLOG-0000744, extended by BACKLOG-0000953). A
 * reference or target line, a shaded band, a callout, or an `event` marker. Its
 * value is a constant `value` (or `from`/`to` for a band), or a `compute`
 * reduction of the data it annotates — `mean`, `median`, `min`, `max`, or `p95`
 * for a percentile — so it follows the data as the grid is filtered. A band with
 * `orient: 'vertical'` shades an x-range instead — an event window, a
 * maintenance period — and an `event` marker is a labelled vertical rule with a
 * flag at a position on the x axis. Every annotation names the axis it reads,
 * which on a dual-axis chart is what stops it being placed against the wrong
 * scale, and is written into the accessible table as a sentence — a vertical
 * marker and an event stating the position they sit at, because a screen-reader
 * user needs where and when, not only that a marker exists.
 */
export interface ChartAnnotation {
  /**
   * The default is a reference line. `event` is a labelled vertical marker with
   * a flag at a position on the x axis, described into the accessible table with
   * that position stated (BACKLOG-0000953).
   */
  kind?: 'line' | 'target' | 'band' | 'callout' | 'event';
  /** A constant value, for a line, target or callout's measure position. */
  value?: number;
  /** A reduction of the annotated data instead of a constant. */
  compute?: 'mean' | 'avg' | 'median' | 'min' | 'max' | string;
  /**
   * A band's two edges. On a horizontal band each is a measure value, a constant
   * or (with `fromCompute`/`toCompute`) computed. On a vertical band (`orient:
   * 'vertical'`, BACKLOG-0000953) each is an x position — a category or a number
   * — and the band shades the x-range between them: an event window, a
   * maintenance period, a recession.
   */
  from?: number | string;
  to?: number | string;
  fromCompute?: string;
  toCompute?: string;
  /** A vertical line's, event marker's or callout's x position: a category or a number. */
  x?: unknown;
  at?: unknown;
  /**
   * Force a line vertical rather than horizontal, or shade a `band` across an
   * x-range rather than a measure range (BACKLOG-0000953).
   */
  orient?: 'horizontal' | 'vertical';
  /** Which measure axis the annotation reads. */
  axis?: 'left' | 'right' | 'y2';
  /** Restrict a `compute` to one series, by its key. */
  series?: string;
  label?: string;
  colour?: string;
  /** A band's fill opacity; the default is 0.12. */
  opacity?: number;
  className?: string;
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
 * An optional geometry pack for a geomap, as one of the `modules/geo-*`
 * packages exports (BACKLOG-0001321). Generated at build time from a named
 * public source; `source`, `licence` and `attribution` record where the
 * geometry came from and what its licence requires. A single-layer pack
 * carries `topology` directly; a multi-layer pack (the UK) carries `layers`
 * instead, keyed by layer name, each with its own `topology`.
 */
export interface GeoPack {
  id: string;
  title: string;
  kind: string;
  projection?: ChartSpec['projection'];
  projectionOptions?: ChartSpec['projectionOptions'];
  source: { name: string; url: string; version: string; retrieved: string };
  licence: { name: string; url: string };
  /** The attribution line the licence requires, verbatim, or `''` when it asks for none. */
  attribution: string;
  topology?: object;
  layers?: Record<string, { name: string; topology: object }>;
  defaultLayer?: string;
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
  /**
   * The exact rows to chart, overriding the grid's own walk — an array, or a
   * function returning one at draw time. `chartRange` uses it to bind a chart
   * to the band of rows a selected range covers rather than the whole grid.
   */
  rows?: object[] | ((grid: Grid) => object[]);
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
  /**
   * Per-axis configuration. Each side is a title string or an object of
   * `{ title, min, max, ticks, format, grid, labels }`. `y2` (or `right`)
   * configures the second measure axis of a dual-axis or combo chart
   * (BACKLOG-0000743); a dual-axis chart labels both axes by default so it
   * cannot silently mislead.
   */
  axis?: {
    x?: string | ChartAxis;
    y?: string | ChartAxis;
    y2?: string | ChartAxis;
    right?: string | ChartAxis;
  };
  /**
   * Dragging across the plot. `true` or `'filter'` writes a range condition into
   * the grid; `'zoom'` changes only this chart's own domain; `'select'` selects
   * the rows under the drag. The object form names which axis the drag acts on —
   * `axis: 'y'` or `'y2'` brushes a value axis, which on a dual-axis chart must
   * say which one it means (BACKLOG-0000743).
   */
  brush?: boolean | 'filter' | 'zoom' | 'select'
    | { mode: 'filter' | 'zoom' | 'select'; axis?: 'x' | 'y' | 'y2' };
  font?: object;
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
  /** Horizontal reference lines. */
  /**
   * A least-squares line through a scatter or bubble chart, one per series.
   * `true` draws the line and its R²; `'line'` draws the line alone.
   *
   * Only where the x axis is numeric: on a band scale the positions are
   * categories in an arbitrary order, and a slope through them would be a slope
   * through the order they happened to be listed in.
   */
  fit?: boolean | 'line';
  /**
   * Trend and forecast overlays (BACKLOG-0000952): a least-squares line, a
   * trailing moving average, or exponential smoothing, drawn over a line, area
   * or scatter chart. `true` draws a single linear trend; a method name or a
   * {@link ChartTrend} object configures one; an array draws several.
   *
   * The maths matches the core stats engine to the last digit — the same
   * least-squares fit, rolling window and exponential recursions — but is
   * computed locally in the charts module rather than imported, because the
   * in-tree bundler does not tree-shake and the import would inline the whole
   * statistics closure; a test asserts the parity. A `forecast` count projects
   * the linear line that many steps past the data, drawn dashed so it never
   * reads as a reading; a moving average and a smoothed level have no slope to
   * project, so `forecast` is ignored for them and the fact is stated in the
   * accessible description rather than faked.
   */
  trend?: boolean | ChartTrendMethod | ChartTrend | Array<ChartTrendMethod | ChartTrend>;
  /**
   * A pointwise confidence band, drawn as a varying-width ribbon beneath the fit
   * line (BACKLOG-0000812). Fed by a fitted model's own interval — the `band`
   * from {@link StatisticsApi.regressionModel}, or as produced by
   * {@link regressionPlots} — so the ribbon and the diagnostics report the one
   * computation rather than a slope redrawn here. `line: false` suppresses the
   * band's own centre line, for a chart that already draws the fit with `fit`.
   *
   * Only where the x axis is numeric, for the same reason `fit` is.
   */
  band?: (RegressionBand & { line?: boolean }) | null;
  /**
   * An explicit point set, bypassing the by-column binder (BACKLOG-0000872): a
   * cartesian chart whose values are not a grid column — a scale-location plot's
   * √|standardised residual|, a coefficient forest's per-coefficient estimate —
   * hands its points in directly. Each is `{x, y}` with an optional `label`,
   * `size` (a bubble's third channel) and `lower`/`upper` (interval bounds the
   * error-bar primitive reads). Numeric `x` throughout gives a continuous axis.
   */
  points?: {
    x: number | string; y?: number; label?: string;
    size?: number; lower?: number; upper?: number; key?: string;
  }[];
  /**
   * Whiskers showing the uncertainty in each mark. `true` computes a confidence
   * interval from the readings behind the mark; `of` takes a symmetric margin
   * from another column instead.
   */
  error?: boolean | { of?: string; confidence?: number };
  /**
   * Horizontal reference lines. On a dual-axis bar or line chart (see
   * {@link ChartMeasure.axis}) a line naming `axis: 'right'` is placed on the
   * right-hand scale, so it means what the right axis says rather than landing
   * at the same number on the scale it does not belong to.
   */
  reference?: { value: number; label?: string; axis?: 'left' | 'right' }[];
  /**
   * The declarative annotation layer: reference and target lines, shaded bands
   * and callouts, each naming the axis it reads and each described into the
   * accessible table as a sentence. A value may be a constant or `compute`d from
   * the data it annotates, so it follows the chart as the grid is filtered.
   */
  annotations?: ChartAnnotation[];
  /** Bins for a histogram; the default is twelve. */
  buckets?: number;
  /** A diverging colour ramp, for heatmap and geomap. */
  diverging?: boolean;
  /**
   * Country outlines, for a geomap drawing countries rather than continents.
   * Either GeoJSON, an object of code to SVG path data, or a geometry
   * {@link GeoPack} imported from an optional `modules/geo-*` package
   * (BACKLOG-0001321) — as the pack itself, or as `{ pack: id }` once its
   * module has been imported and registered.
   */
  shapes?: unknown;
  codeProperty?: string;
  /**
   * Which layer of a multi-layer geometry pack to draw — the UK pack, for
   * instance, ships `regions`, `local-authorities` and `constituencies`
   * together (BACKLOG-0001321). Ignored for a single-layer pack.
   */
  layer?: string;
  /**
   * The map projection a geomap draws through (BACKLOG-0001321): `'equalEarth'`
   * (the default for a world), `'robinson'`, `'mercator'`, `'equirectangular'`,
   * `'albers'`, `'transverseMercator'`, or a projection function of the
   * caller's own `(lon: number, lat: number) => [number, number]`. Left unset,
   * a geometry pack draws through the projection it declares.
   */
  projection?: 'equalEarth' | 'robinson' | 'mercator' | 'equirectangular' | 'albers'
    | 'transverseMercator' | 'britishNationalGrid'
    | ((lon: number, lat: number) => [number, number]);
  /**
   * Parameters for the projections that take them: `parallels` and `centre`
   * for `albers`, `centre` for `transverseMercator` (BACKLOG-0001321).
   */
  projectionOptions?: { parallels?: [number, number]; centre?: [number, number] };
  /**
   * A lon/lat reference grid under a geomap's regions, off by default
   * (BACKLOG-0001321 part 2). Only drawn over a geometry pack's fitted
   * projection — the schematic continents have no fitted projection to draw
   * one against. `step` is the spacing between lines in degrees (default 30).
   */
  graticule?: boolean | { step?: number };
  /** One chart per distinct value of this column. */
  multiples?: string;
  /** Draw to canvas past this many points. */
  canvas?: boolean | number;
  downsample?: number;
  emptyText?: string;

  /** A second line under the title. */
  subtitle?: string;
  /** A note under the plot, a source, a caveat, a unit. */
  footnote?: string;
  /** `false` turns the hover tooltip off. */
  tooltip?: boolean;
  /** Draw the grid's selected rows emphasised, and follow the selection. */
  selection?: boolean;
  /** Clicking a group drills into it. */
  drill?: boolean;
  /** Clicking a mark filters the grid to it. */
  filterOnClick?: boolean;
  /** Stack the series rather than drawing them side by side. */
  stack?: boolean;
  /** Overlay a kernel density curve on a histogram. */
  curve?: boolean;
  /** An alias for `y`, where "the measure" reads better than "the y axis". */
  measure?: string;
  /** Bubble charts: the column driving the radius, and the largest it may be. */
  size?: string;
  maxRadius?: number;
  /** Fix the measure axis rather than taking it from the data. */
  min?: number;
  max?: number;
  /** A geomap's ISO code column. An alias for `x`. */
  code?: string;
  /** Correlogram: which columns to correlate, how, and whether to print them. */
  columns?: string[];
  method?: 'pearson' | 'spearman' | 'kendall';
  values?: boolean;
  /** Network layouts: how many relaxation passes to run. */
  iterations?: number;

  /**
   * Control and capability charts: a tolerance overriding the column's own
   * `spec`, how many leading readings fix the control limits, which rule set
   * the violations are judged against, and the level for the capability
   * interval.
   */
  spec?: { lower?: number; upper?: number; target?: number };
  baseline?: number;
  rules?: 'westernElectric' | 'nelson';
  confidence?: number;
}

/**
 * The events a chart raises.
 *
 * A chart's own, not the grid's: `grid.on` takes {@link EventName} and knows
 * nothing about these. There is no `point:click`, `point:hover` or
 * `series:toggle`; the events are the flat names below and `click` is the one
 * most callers want, it is how a click on a mark becomes a filter on the grid.
 *
 * `click` and `hover` carry a **flat** payload — there is no `point` wrapper:
 * `{ label, category, column, value, series, rowKeys, native, preventDefault }`.
 * `column` is the grid column the mark filters on and `category` the value to
 * filter it to; `value` is the measure when a single series sits under the mark,
 * otherwise null with the per-series numbers in `series`; `rowKeys` are the
 * source rows behind the mark; `native` is the DOM event.
 *
 * `click` fires whether or not the spec sets `filterOnClick`, and it fires
 * *before* any filter is applied: call `preventDefault()` on the payload to stop
 * the chart filtering the grid and take the click over yourself. With
 * `filterOnClick: true` in the spec the chart filters the grid itself on the
 * clicked mark's `column`/`category` unless a handler prevented it.
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
