/*!
 * Lattice Grid 1.70.0, type declarations
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

/**
 * What kind of value a column holds, which is what decides how it is parsed,
 * sorted, filtered, aligned and formatted before you configure anything else.
 *
 * The first few are inferred from the data. Everything after them is asked for
 * by name on the column, because a number is a number until you say it is a
 * bitrate, a decibel, an IPv4 address or a duration.
 */
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
 * Vertical alignment of a cell's content within its row.
 *
 * The vertical counterpart to {@link Align}. `top` sits the content at the top
 * of the row, `middle` centres it and `bottom` drops it to the bottom. It is
 * most visible on tall or `autoHeight` rows, where a wrapped-text column can be
 * `top` while its single-line neighbours are `middle`.
 */
export type VAlign = 'top' | 'middle' | 'bottom';
/**
 * How the grid's scroll viewport draws its scrollbars.
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
/** A column, named by its `id`: what every API that asks "which column" takes. */
export type ColumnRef = string;
/**
 * Your own sort order for a column, in place of the built-in one for its type.
 *
 * Return a negative number when `a` sorts first, a positive number when `b`
 * does, and zero when they tie. The two rows are passed as well, so an order
 * can depend on a second field, and `descending` says which way the grid is
 * about to apply the result — which is how blanks are kept last either way.
 */
export type Comparator = (
  a: unknown, b: unknown, rowA?: Row, rowB?: Row, descending?: boolean,
) => number;

export interface CellStyle { [cssProperty: string]: string | number | null | undefined }

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

/** Which sticky strip a row is pinned in, top or bottom. */
export type RowPin = 'top' | 'bottom';

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
  pinned?: RowPin;
}

export interface RowChange {
  /**
   * Rows to add. A row whose key the grid already holds is rejected rather
   * than admitted twice.
   */
  add?: unknown[];
  /**
   * Where to insert the added rows, as a physical index. They go on the end
   * when it is left out or is past the end.
   */
  at?: number;
  /**
   * Rows to update, matched to existing rows by key. A key the grid does not
   * hold is rejected.
   */
  update?: unknown[];
  /**
   * Rows to remove, given either as keys or as row objects the grid reads the
   * key from.
   */
  remove?: unknown[] | string[];
}

/** Which part of a rejected change a row was in. */
export type RejectedRowOperation = 'add' | 'update' | 'remove';
/** Why a row in a change was rejected: an unknown key, or one already taken. */
export type RejectedRowReason = 'unknown-id' | 'duplicate-id';
/** A row a change could not apply, and why. Reported, never thrown. */
export interface RejectedRow {
  /**
   * Which part of the change the row was in: `'add'`, `'update'` or
   * `'remove'`.
   */
  operation: RejectedRowOperation;
  /** The key of the row that could not be applied. */
  id: string;
  /**
   * `unknown-id`, no row with that key. `duplicate-id`, a row with that key
   * already exists; admitting a second would corrupt every structure that
   * resolves one key to one row.
   */
  reason: RejectedRowReason;
}

export interface ChangeResult {
  /** The rows that were added. */
  added: Row[];
  /** The rows that were updated. */
  updated: Row[];
  /** The keys of the rows that were removed. */
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
  /** The cell's resolved value, after any `compute` and before formatting. */
  value: unknown;
  /** Your own row object, exactly as you supplied it. */
  data: unknown;
  /**
   * The grid's wrapper round that object, carrying the key, the display index
   * and whether the row is a group, a footer or a total.
   */
  row: Row;
  /** The resolved column, including anything you declared on it. */
  column: Column;
  /** The column's id, for the common case where that is all the callback needs. */
  colId: string;
  /**
   * The grid instance, so a callback can read the rest of the grid — another
   * cell, the selection, the filters.
   */
  grid: Grid;
  /**
   * Whatever `config.context` holds: the application state a callback needs
   * and the grid knows nothing about.
   */
  context: unknown;
}

export interface CellParams extends ValueParams {
  /**
   * The display text: the value after the column's format and any lookup label
   * — exactly what the cell shows.
   */
  text: string;
  /**
   * The row's display index, counting the grid's own rows: group headings,
   * footers and totals included.
   */
  index: number;
  /**
   * Whatever the column's `cell.props` holds, passed through so one renderer
   * can be configured per column.
   */
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
/**
 * The values a computed column's dependencies hold for the row being
 * computed, keyed by column id, so a formula reads what it declared it needs
 * rather than reaching into the raw row.
 */
export type DepValues = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Formatting (spec 8.5)
// ---------------------------------------------------------------------------

/** A number format's family: plain decimal, currency, or a percentage. */
export type NumberFormatStyle = 'decimal' | 'currency' | 'percent';
/** How a currency figure names its unit, mirroring `Intl.NumberFormatOptions.currencyDisplay`. */
export type CurrencyDisplay = 'symbol' | 'code' | 'name' | 'narrowSymbol';
/** A number format's magnitude notation, mirroring `Intl.NumberFormatOptions.notation`. */
export type NumberFormatNotation = 'standard' | 'compact' | 'scientific';
/** Which compact form `notation: 'compact'` renders, short (`1.2M`) or long (`1.2 million`). */
export type CompactDisplay = 'short' | 'long';
/** How a negative number is marked: a leading minus, parentheses, or a trailing suffix. */
export type NumberFormatNegative = 'minus' | 'parentheses' | 'suffix';
export interface NumberFormat {
  /**
   * Marks this as the number format, so the grid compiles it with the number
   * formatter.
   */
  type?: 'number';
  /**
   * `'decimal'` (the default), `'currency'` or `'percent'`. `'percent'`
   * multiplies by 100 and appends the locale's percent sign, so store 0.12 for
   * 12%.
   */
  style?: NumberFormatStyle;
  /**
   * The ISO currency code for `style: 'currency'` — `'GBP'`, `'EUR'`. Defaults
   * to `'USD'`.
   */
  currency?: string;
  /**
   * How the currency is shown: `'symbol'` (£1.00), `'narrowSymbol'`, `'code'`
   * (GBP 1.00) or `'name'` (1.00 British pounds). The locale's own default
   * when unset.
   */
  currencyDisplay?: CurrencyDisplay;
  /**
   * Shorthand for a fixed number of decimal places: it sets the minimum and
   * the maximum to the same figure, so 2 always shows two.
   */
  decimals?: number;
  /**
   * The fewest decimal places to show, padding with zeros. Ignored when
   * `decimals` is given.
   */
  minDecimals?: number;
  /**
   * The most decimal places to show, rounding beyond it. Raised to
   * `minDecimals` if it would fall below.
   */
  maxDecimals?: number;
  /**
   * `false` turns grouping off entirely; a string replaces the locale's group
   * separator with your own. Grouping is on by default.
   */
  thousandsSeparator?: boolean | string;
  /**
   * Replaces the locale's decimal separator with your own. The locale's is
   * used when unset.
   */
  decimalSeparator?: string;
  /**
   * `'standard'` (the default), `'compact'` — 1,234,567 as `1.2M` — or
   * `'scientific'`.
   */
  notation?: NumberFormatNotation;
  /**
   * Which compact form `notation: 'compact'` uses — `'short'` (the default)
   * gives `1.2M`, `'long'` gives `1.2 million`. Ignored under any other
   * notation.
   */
  compactDisplay?: CompactDisplay;
  /**
   * How a negative number reads: `'minus'`, the default, gives `-1,234`;
   * `'parentheses'` gives `(1,234)`, the accounting form; `'suffix'` gives
   * `1,234-`.
   */
  negative?: NumberFormatNegative;
  /**
   * A class name put on the cell when the value is negative, so the stylesheet
   * can colour it. Nothing is added when unset.
   */
  negativeClass?: string;
  /**
   * Show a leading `+` on a positive value (`+5`, `+£5.00`, `+12%`). A
   * negative value keeps whatever `negative` says regardless of this flag,
   * and zero shows no sign either way. Off by default.
   */
  signed?: boolean;
  /**
   * Free text placed before the number — and after the currency symbol when
   * there is one, so `£~1,234` rather than `~£1,234`.
   */
  prefix?: string;
  /**
   * Free text placed after the number, after any percent sign or currency
   * code.
   */
  suffix?: string;
  /**
   * The text shown instead of a formatted zero — `'—'`, `'free'`. Zero is
   * formatted normally when unset. Tested after `scale` is applied.
   */
  zeroDisplay?: string;
  /**
   * The text shown for null, undefined, an empty string, and anything that is
   * not a number. Empty by default.
   */
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
  /**
   * A multiplier applied before formatting, for showing stored units in
   * another magnitude — `0.001` to read a column of pounds as thousands. 1 by
   * default. It changes only the display: sort, filter and totals still use
   * the stored number.
   */
  scale?: number;
}

/** A locale-chosen date form, mirroring `Intl.DateTimeFormatOptions.dateStyle`. */
export type DateStyle = 'short' | 'medium' | 'long' | 'full';
/** A locale-chosen time form, mirroring `Intl.DateTimeFormatOptions.timeStyle`. */
export type TimeStyle = 'short' | 'medium' | 'long';
export interface DateFormat {
  /**
   * Marks this as the date format, so the grid compiles it with the date
   * formatter.
   */
  type: 'date';
  /**
   * A token pattern — `'dd/MM/yyyy HH:mm'`, `'dd MMM yyyy'`. Numeric fields
   * are assembled by hand so the output is stable across browsers; only month
   * and weekday names come from the locale. An unsupported letter is rendered
   * as text and warns; quote it to silence that.
   */
  pattern?: string;
  /**
   * A locale-chosen date form — `'short'`, `'medium'`, `'long'`, `'full'` —
   * used when no `pattern` is given. Medium is the default when neither is
   * set.
   */
  dateStyle?: DateStyle;
  /**
   * A locale-chosen time form — `'short'`, `'medium'`, `'long'` — shown
   * alongside `dateStyle`. No time is shown when unset.
   */
  timeStyle?: TimeStyle;
  /**
   * The IANA zone the instant is rendered in — `'Europe/London'`, `'UTC'`. The
   * browser's own zone when unset. It changes only the display; the stored
   * instant is untouched.
   */
  timeZone?: string;
  /**
   * Render as `yesterday`, `in 3 hours` while the date is within the
   * threshold, falling back to the absolute form beyond it. The threshold is 7
   * days unless `{ threshold: n }` names another number of days.
   */
  relative?: boolean | { threshold?: number };
  /**
   * The text shown for null, undefined and anything that will not read as a
   * date. Empty by default.
   */
  nullDisplay?: string;
  /**
   * The BCP-47 locale this column formats in, overriding the grid's. The
   * page's locale by default.
   */
  locale?: string;
}

/** How a boolean format renders its two states: as text, a glyph pair, or an icon pair. */
export type BooleanDisplay = 'checkbox' | 'switch' | 'text' | 'icon';
export interface BooleanFormat {
  /**
   * Marks this as the boolean format, so the grid compiles it with the boolean
   * formatter.
   */
  type: 'boolean';
  /**
   * Which text stands in for each state: `'text'` (the default) uses the
   * labels below; `'checkbox'` and `'switch'` both render the glyph pair ☑ / ☐
   * as text; `'icon'` uses `trueIcon` and `falseIcon`. An interactive tick box
   * is the `checkbox` cell renderer, which is a separate setting.
   */
  display?: BooleanDisplay;
  /** The text for true. `'Yes'` by default. */
  trueLabel?: string;
  /** The text for false. `'No'` by default. */
  falseLabel?: string;
  /**
   * The text for a value that is neither — null, undefined or empty, which the
   * grid keeps distinct from false. Empty by default.
   */
  nullLabel?: string;
  /**
   * The text used for true under `display: 'icon'` — a character or emoji,
   * placed in the cell as written. Falls back to `trueLabel`.
   */
  trueIcon?: string;
  /**
   * The text used for false under `display: 'icon'`. Falls back to
   * `falseLabel`.
   */
  falseIcon?: string;
}

/** A locale-aware case change for text display: upper, lower, title, or none. */
export type TextTransform = 'none' | 'upper' | 'lower' | 'title';
export interface TextFormat {
  /**
   * Marks this as the text format, so the grid compiles it with the text
   * formatter.
   */
  type: 'text';
  /**
   * Change the case for display: `'upper'`, `'lower'`, `'title'`, or `'none'`
   * (the default). Casing is locale-aware, which matters for Turkish `i`.
   */
  transform?: TextTransform;
  /**
   * Cut the text to a number of characters and append an ellipsis. Give a
   * number for the character count, or `{ chars, ellipsis }` to choose the
   * trailing mark; `…` by default.
   */
  truncate?: number | { chars: number; ellipsis?: string };
  /** The text shown for null and undefined. Empty by default. */
  nullDisplay?: string;
  /**
   * The text shown for an empty string, which the grid keeps distinct from
   * null. Empty by default.
   */
  emptyDisplay?: string;
}

/**
 * How a value is turned into the text you see. One of the four formatters,
 * picked by the `type` on the spec; the rest of the object is that
 * formatter's own options.
 */
export type FormatSpec = NumberFormat | DateFormat | BooleanFormat | TextFormat;

// ---------------------------------------------------------------------------
// Data types (spec 8.2)
// ---------------------------------------------------------------------------

/** The storage family a data type belongs to. */
export type DataTypeBase = 'text' | 'number' | 'boolean' | 'date' | 'dateString' | 'object';
/** How the column store holds a type's values in bulk. */
export type DataTypeStorage = 'float64' | 'int32' | 'bitset' | 'dictionary' | 'object';
export interface DataType {
  /**
   * The storage family the type belongs to, which decides how a value is held,
   * compared and exported. Inherited through `extends`, and `'text'` when
   * neither says.
   */
  base: DataTypeBase;
  /**
   * The type this one inherits from. `defaults` are merged rather than
   * replaced, so a derived type can override one default and keep the rest. A
   * circular chain fails at construction.
   */
  extends?: TypeName;
  /**
   * Recognise a value as belonging to this type, for type inference from a
   * sample. A type is inferred only when every sampled value matches.
   */
  matches?: (value: unknown) => boolean;
  /**
   * Turn a value of this type into display text. Last in the display chain,
   * behind the column's `value.format` and its `format` spec.
   */
  format?: (p: FormatParams) => string;
  /**
   * Read the formatted form back into a value — what a paste and a text editor
   * go through. It is a *text* parser: the grid does not put an already-typed
   * editor value through it.
   */
  parse?: (p: ParseParams) => unknown;
  /**
   * Order two values of this type. Used for sorting unless the column supplies
   * `value.compare` or is lookup-backed.
   */
  compare?: Comparator;
  /**
   * What a column of this type gets for free — its filter kind, editor, footer
   * total, alignment and cell renderer — unless the column, a preset or
   * `columnDefaults` says otherwise. `type: false` on a column turns this
   * layer off.
   */
  defaults?: {
    filter?: FilterName;
    editor?: EditorName;
    total?: TotalName;
    align?: Align;
    /** The cell renderer this type's values are drawn with by default. */
    render?: RendererName;
  };
  /**
   * How the column store holds these values in bulk: a typed array, a bitset,
   * a dictionary of codes, or plain objects. `'object'` when unset.
   */
  storage?: DataTypeStorage;

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
  /**
   * The Excel number format an export writes for this type, when the column's
   * own formatter supplies none. `'General'` when neither does.
   */
  excel?: string;
  /**
   * Turn a value of this type into the text a copy puts on the clipboard.
   * First in that chain, ahead of the grid-wide hook and the plain display
   * text.
   */
  toClipboard?: (v: unknown) => string;
  /**
   * Read pasted text back into a value of this type. First in that chain,
   * ahead of the grid-wide hook and taking the text unchanged.
   */
  fromClipboard?: (s: string) => unknown;
}

// ---------------------------------------------------------------------------
// Lookups (spec 8.3)
// ---------------------------------------------------------------------------

export interface Option {
  /**
   * The stored value — what the cell holds, sorts by and exports when
   * `export.lookup` asks for the value. A bare string or number as the whole
   * option becomes both its id and its label.
   */
  id: unknown;
  /**
   * What the reader sees. Falls back to the id stringified when the option
   * carries none.
   */
  label: string;
  /**
   * Show the option in the editor but refuse to let it be chosen — for a value
   * that exists historically and should not be used again.
   */
  disabled?: boolean;
  /**
   * A semantic token for this option, so a pill or a dot takes its colour from
   * the value rather than from a rule.
   */
  variant?: VariantName;
  /** A glyph name from the icon registry (see {@link IconName}), shown before the label. */
  icon?: IconName;
  /**
   * The heading this option sits under in an editor that groups its list. Read
   * from `groupKey` when the column names one.
   */
  group?: string;
}

/** How a lookup's option list is ordered for display. */
export type LookupSortBy = 'label' | 'value' | 'optionOrder' | 'count';
export interface LookupSpec {
  /**
   * The dictionary: a list of options, or a function returning one,
   * synchronously or as a promise. Loaded once per column, not per cell, and
   * cached against a version so a refresh invalidates every dependent cell in
   * one pass. Options may nest through `children` for the tree editor; every
   * other consumer sees the flattened list.
   */
  options?: Option[] | (() => Option[] | Promise<Option[]>);
  /**
   * Which property of an option holds the stored value. `'id'` by default. A
   * bare string or number is accepted as an option and becomes its own value
   * and label.
   */
  valueKey?: string;
  /**
   * Which property of an option holds the displayed text. `'label'` by
   * default; an option with no label falls back to its value.
   */
  labelKey?: string;
  /**
   * Which property of an option names the option group it belongs to, for an
   * editor that shows headings. `'group'` when unset.
   */
  groupKey?: string;
  /**
   * The cell holds a list of values rather than one. The display joins their
   * labels with `separator`, and grouping keys on the whole combination.
   */
  multiple?: boolean;
  /**
   * Accept a value that is not in the option list, without complaint. Off by
   * default, in which case an unknown value still renders — never blanked —
   * but is reported once per column, since a blank cell hides a data problem.
   */
  allowCustom?: boolean;
  /**
   * What to show for a value the option list does not contain: fixed text, or
   * a function of the value. The raw value itself when unset.
   */
  unknownLabel?: string | ((v: unknown) => string);
  /**
   * Ask the server for matching options as the user types, with an abort
   * signal for the request this one supersedes. Results are shown in the
   * editor but never merged into the cached dictionary. Without it the editor
   * filters the loaded options by label, case-insensitively.
   */
  search?: (query: string, signal: AbortSignal) => Promise<Option[]>;
  /**
   * How the editor and the set filter order the options: `'label'` (the
   * default, collated for the locale), `'value'`, `'optionOrder'` to keep them
   * exactly as declared, or `'count'` to put the commonest first.
   */
  sortBy?: LookupSortBy;
  /**
   * What joins the labels of a multi-value cell, in the display and in an
   * export. `', '` by default.
   */
  separator?: string;
}

// ---------------------------------------------------------------------------
// Decoration and variants (spec 8.7)
// ---------------------------------------------------------------------------

/**
 * How a cell is drawn around its value: plain text, a filled background, a
 * rounded pill, a coloured dot, an inline bar, a heat shade, or an icon. The
 * shape only — which colour it takes is the variant's job.
 */
export type DecorationName = 'plain' | 'fill' | 'pill' | 'dot' | 'bar' | 'heat' | 'icon';
/**
 * The colour role a decoration takes, named by meaning rather than by hue so
 * that a theme restyles every grid at once. `none` draws no decoration at all,
 * and your own name is accepted for a variant you have defined through
 * `variants`.
 */
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

/** How an SVG shape's paths are painted: a stroked outline, or a solid fill. */
export type Paint = 'stroke' | 'fill';
/**
 * One sprite as a registration route accepts it: `config.icons`, `registerIcon`
 * and `registerIcons` all take this shape.
 *
 * The long form is the glyph itself — a view box, one or more SVG path `d`
 * strings, and whether they are stroked or filled. The two short forms exist
 * because most glyphs are one filled path on the house 16x16 box: a bare path
 * string, or an array of them, is read as exactly that, so a host registering
 * its own mark writes the path and nothing else. `path` is accepted as a
 * singular spelling of `paths`. What comes back out of {@link IconRegistryApi}
 * is always the normalised {@link IconGlyph}, never the short form.
 *
 * A name already in the registry is overridden, which is how the expander
 * chevron or the sort arrow is swapped for a host's own.
 */
export type IconDefinition =
  | string
  | string[]
  | {
    /** The SVG view box the paths are drawn in. Default `'0 0 16 16'`. */
    viewBox?: string;
    /** One or more SVG path `d` strings, drawn in order. */
    paths?: string[];
    /** A single path `d` string, as an alternative to a one-element `paths`. */
    path?: string;
    /** How the paths are painted. Default `'fill'`. */
    paint?: Paint;
  };

/** A built-in threshold icon set, mapping value bands to built-in glyphs. */
export type IconSetName = 'trafficLights' | 'arrows' | 'trafficArrows' | 'ratings' | (string & {});

/**
 * One band of a threshold icon set. A value clears a band when it is at least
 * `min`; the highest band it clears wins. Omit `min` on the last band to make
 * it the catch-all. `label` is what assistive technology announces for the
 * glyph, so a screen-reader user hears the band's meaning, not only the value.
 */
export interface IconBand {
  /**
   * The lowest value in this band. Bands are tested from the highest `min`
   * down, so the first one a value reaches wins; leave it out on the fallback
   * band.
   */
  min?: number;
  /** A glyph name from the icon registry (see {@link IconName}). */
  icon: IconName;
  /**
   * Accessible text for the glyph, so the band means something to a screen
   * reader and in a tooltip.
   */
  label?: string;
  /** The semantic token this band's glyph is coloured with. */
  variant?: VariantName;
}

/** A decoration's size token, following the grid's density unless set. */
export type DecorationSize = 'sm' | 'md' | 'lg';
/** A decoration's container outline shape. */
export type DecorationShape = 'pill' | 'rounded' | 'square';
/** The leading or trailing side of a value, layout or column pin. */
export type Edge = 'start' | 'end';
export interface DecorationSpec {
  /**
   * Which shape the cell draws as: `plain`, `fill`, `pill`, `dot`, `bar`,
   * `heat` or `icon`. Colour, padding and radius follow from the shape, the
   * size token and the theme, so every pill in an application matches without
   * being configured.
   */
  type: DecorationName;
  /**
   * The size token — `'sm'`, `'md'` or `'lg'`. Unset follows the grid's
   * density.
   */
  size?: DecorationSize;
  /**
   * The container's outline shape: `'pill'`, `'rounded'` or `'square'`. Unset
   * follows the decoration's own default.
   */
  shape?: DecorationShape;
  /**
   * Pill only: draw it as a coloured border round transparent fill rather than
   * a solid tint. Off by default.
   */
  outline?: boolean;
  /**
   * Fill only: draw a leading colour bar at the cell's edge instead of tinting
   * the whole cell. Off by default.
   */
  edge?: boolean;
  /**
   * Dot and icon only: which side of the value the mark sits on. `'start'` by
   * default.
   */
  position?: Edge;
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
  /**
   * Bar and heat only: the value at which the bar is empty or the heat is
   * coldest. 0 by default. A function of the cell is accepted, for a scale
   * that follows the data.
   */
  min?: number;
  /**
   * Bar and heat only: the value at which the bar is full or the heat is
   * hottest. 100 by default — or 1 on a percent-formatted column, whose values
   * are stored as fractions, since otherwise every bar would be a sliver
   * disagreeing with the `87%` printed beside it.
   */
  max?: number;
  /**
   * Bar only: the value the bar grows out from, so a bar for a signed column
   * can run left for negatives and right for positives. Unset grows from
   * `min`.
   */
  origin?: number;
  /**
   * Bar only: whether the number is printed as well as drawn. `true` by
   * default; `'inside'` puts it within the bar and `false` leaves the bar
   * alone.
   */
  showValue?: boolean;
  /**
   * Bar only: paint the unfilled remainder as a track, so the full scale is
   * visible. On by default.
   */
  track?: boolean;
  /**
   * Heat only: the colour token used below the midpoint, which is what makes a
   * diverging scale — one colour for the low arm, the decoration's own for the
   * high.
   */
  ramp?: string;
  /**
   * Heat only: the value the scale diverges about. Unset makes a single-ended
   * ramp from `min` to `max`; set, the intensity is the distance from this
   * point, normalised by the longer arm.
   */
  midpoint?: number;
}

export interface VariantWhen { op: Operator; value?: unknown; use: VariantName }

/**
 * Which variant a cell takes, from the simplest answer to the most
 * conditional: one name for the whole column, a lookup keyed on the cell's
 * value, a list of rules tried in order, or a function of the cell.
 */
export type VariantSpec =
  | VariantName
  | { map: Record<string, VariantName>; default?: VariantName }
  | { when: VariantWhen[]; default?: VariantName }
  | ((p: CellParams) => VariantName);

export interface VariantDefinition {
  /**
   * The three colours the token uses in a light theme: the `fill` behind it,
   * the `text` on it, and the `border` round it. The border doubles as the
   * strong marker colour a dot or a bar takes.
   */
  light: { fill: string; text: string; border: string };
  /**
   * The same three colours for a dark theme. Applied both when the grid is
   * explicitly dark and when the reader's own system preference is.
   */
  dark: { fill: string; text: string; border: string };
}

// ---------------------------------------------------------------------------
// Renderers, editors, filters
// ---------------------------------------------------------------------------

export interface Renderer {
  /**
   * Prepare the renderer for a cell, before `element()` is asked for. Called
   * once per mounted cell.
   */
  init(p: CellParams): void;
  /**
   * The DOM the grid should put in the cell. Called once, straight after
   * `init`.
   */
  element(): HTMLElement;
  /**
   * Update the existing DOM for a new value and return `true`. Returning
   * anything else — or not implementing it — makes the grid tear the cell down
   * and build it again, which is the single biggest cost on an update-heavy
   * screen.
   */
  refresh?(p: CellParams): boolean;
  /**
   * Called once the element is in the document, for anything that needs real
   * layout — a measurement, a chart draw, focus.
   */
  attached?(): void;
  /**
   * Release whatever the renderer holds — timers, observers, listeners — as
   * the cell is recycled. A throw here is reported once per column and does
   * not stop the recycle.
   */
  destroy?(): void;
}
/**
 * A renderer class. The grid instantiates one per cell element and reuses it
 * as that element is recycled down the viewport.
 */
export type RendererCtor = new () => Renderer;
/**
 * The short form of a renderer: a function handed the cell and returning the
 * HTML string or the element to show. Reach for a `Renderer` class instead
 * when the cell has to hold state or release something as it is recycled.
 */
export type RenderFn = (p: CellParams) => string | HTMLElement;

export interface Editor {
  /**
   * Prepare the editor for one edit session, before `element()` is asked for.
   * It receives the cell, the current value, the column and the merged
   * `edit.props`.
   */
  init(p: EditorParams): void;
  /**
   * The DOM the grid mounts for the session — inside the cell, or in the
   * overlay layer when `popup` is set.
   */
  element(): HTMLElement;
  /**
   * The value to commit, in the column's stored form. Read when the session
   * ends without a cancel.
   */
  value(): unknown;
  /**
   * Called once the element is in the document. Where a popup is shown and
   * focus is placed, rather than in `init`, so nothing is mounted for an
   * editor that refuses to open.
   */
  attached?(): void;
  /**
   * Return `true` to refuse to open on this cell, so keyboard navigation moves
   * on instead of opening an editor the user cannot use. The built-in editors
   * refuse a read-only cell this way.
   */
  cancelBeforeStart?(): boolean;
  /**
   * Return `true` when the session ends to discard the edit instead of
   * committing it — the counterpart of `cancelBeforeStart`, asked once, on the
   * commit path every route ends at (Enter, Tab, and clicking away). The
   * built-in editors answer `true` after their own `cancel()`; an editor may
   * also discard at any moment by calling `params.stop(true)`.
   */
  cancelOnClose?(): boolean;
  /**
   * Mount the editor in the grid's overlay layer, positioned over the cell, so
   * it escapes the cell's clipping. Otherwise it is mounted inside the cell.
   */
  popup?: boolean;
  /** Release whatever the editor holds as the session ends, however it ended. */
  destroy?(): void;
}
/**
 * An editor class. The grid instantiates one when an edit session opens on a
 * cell and destroys it when the session ends, however it ended.
 */
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

/**
 * The built-in cell editors, addressable by name through `cell.edit`.
 * Anything registered through `components` is also valid here.
 */
export type EditorName =
  | 'checkbox' | 'code' | 'colour' | 'currency' | 'date' | 'datetime' | 'duration'
  | 'iconPicker' | 'ipaddress' | 'multiSelect' | 'number' | 'objectPicker' | 'password'
  | 'radix' | 'rating' | 'segmented' | 'select' | 'slider' | 'temperature' | 'text'
  | 'textarea' | 'time' | 'treeSelect' | 'unit' | (string & {});

export interface EditorParams extends CellParams {
  /**
   * End the session from inside the editor: with no argument it commits, and
   * `stop(true)` discards. This is how an editor cancels; the grid does not
   * poll for it.
   */
  stop(cancel?: boolean): void;
  /**
   * The name of the key that opened the editor, when a keystroke did. Absent
   * when it was opened by a click or by the API.
   */
  key?: string;
  /**
   * The printable character that opened the editor, so typing straight into a
   * cell seeds the first character instead of losing it.
   */
  charPress?: string;
}

export interface Filter {
  /**
   * Set the filter up for a column, once, before its element is asked for. The
   * params carry the column, the grid, a value getter and the filter's own
   * `props`.
   */
  init(p: FilterParams): void;
  /**
   * Whether the filter is actually excluding anything. A set filter with
   * everything ticked is not filtering, and says so.
   */
  active(): boolean;
  /**
   * Whether a row survives. Evaluated through the same condition the server
   * would be sent, so local and remote agree on what the filter means.
   */
  passes(p: { row: Row; data: unknown }): boolean;
  /**
   * Serialise the filter to a condition node for the filter set — what travels
   * to a server and into a saved view. `null` when the filter is not active.
   */
  get(): unknown;
  /**
   * Restore the filter from a condition node, so a saved view puts the control
   * back where it was. A null node resets it.
   */
  set(state: unknown): void;
  /** The filter's own UI, which the grid mounts in the column's filter popup. */
  element(): HTMLElement;
  /**
   * Called when the rows changed, for a filter whose control is built from the
   * data — a set filter's value list. A list that came from a lookup or the
   * host is left alone.
   */
  onRowsChanged?(): void;
}
/**
 * A filter class. The grid instantiates one per column that uses it, and asks
 * it to rebuild its control when the rows change.
 */
export type FilterCtor = new () => Filter;
/**
 * The built-in column filters, addressable by name through `column.filter`.
 * `none` turns filtering off for a column; anything registered through
 * `components` is also valid here.
 */
export type FilterName = 'text' | 'number' | 'date' | 'boolean' | 'set' | 'multi' | 'none' | (string & {});

export interface FilterParams {
  /** The resolved column this filter belongs to. */
  column: Column;
  /** The column's id, which the conditions the filter produces are keyed by. */
  colId: string;
  /**
   * The grid instance, for a filter that needs to read the rows or another
   * column.
   */
  grid: Grid;
  /**
   * Whatever `config.context` holds — the tenant, the user, whatever the
   * filter's own logic needs.
   */
  context: unknown;
  /**
   * Whatever the column's `filter.props` holds: the option list for a set
   * filter, the step for a number range.
   */
  props?: Record<string, unknown>;
  /**
   * Tell the grid the filter's state moved. It reads `get()` back and applies
   * the result; nothing happens until this is called.
   */
  changed(): void;
}

// ---------------------------------------------------------------------------
// Totals
// ---------------------------------------------------------------------------

/**
 * The built-in aggregations, used for group totals, the footer row and pivot
 * values. `countValues` counts the non-blank ones; `first` and `last` take the
 * value at the ends of the group in its current order. Anything registered as
 * a custom total is also valid here.
 */
export type TotalName = 'sum' | 'min' | 'max' | 'avg' | 'count' | 'first' | 'last' | 'countValues' | (string & {});
/**
 * Your own aggregation: handed every value in the group, plus the row the
 * total is being computed for and the grid it belongs to, and returning the
 * value to show.
 */
export type TotalFn = (values: unknown[], ctx: { row: Row; column: Column; grid: Grid; context: unknown }) => unknown;

// ---------------------------------------------------------------------------
// Columns (spec 8.1)
// ---------------------------------------------------------------------------

export interface ColumnValueSpec {
  /**
   * Produce this column's value from its declared dependencies rather than
   * from a field. Called with the dependency values and a context carrying the
   * row, the grid and your own context.
   */
  compute?: (deps: DepValues, ctx: ValueContext) => unknown;
  /**
   * Which columns `compute` reads, so an edit to one of them invalidates just
   * this column. `'*'` means the whole row. Leaving it out is treated as `'*'`
   * and warns, because the grid then has to recompute on every change.
   */
  deps?: string[] | '*';
  /**
   * Whether `compute` is a function of its dependencies alone. True by
   * default, which lets the value be materialised and read back cheaply. Set
   * it `false` for a value that depends on anything else — history, sort
   * position — or the first answer is frozen for good.
   */
  pure?: boolean;
  /**
   * Turn this column's value into the text a cell shows. First in the display
   * chain: it wins over the column's `format` and over the data type's own
   * formatter.
   */
  format?: (p: FormatParams) => string;
  /**
   * Write an edited value back into the row's data yourself, instead of the
   * grid writing through `field`. Return `false` to decline the write; a throw
   * is reported once and the edit discarded.
   */
  apply?: (p: ApplyParams) => boolean;
  /**
   * Turn an editor's output into the stored value. Always honoured — the data
   * type's own text parser is used only when the editor emitted a string and
   * you supplied no `parse`.
   */
  parse?: (p: ParseParams) => unknown;
  /**
   * The identity a value groups and set-filters by, when the stringified value
   * is the wrong answer (an object, a pair of coordinates). Wins over a
   * lookup's own group key.
   */
  key?: (p: KeyParams) => string;
  /**
   * Order two of this column's values. Wins over the lookup's comparator and
   * over the data type's, for sorting and for the diff view.
   */
  compare?: Comparator;
  /**
   * The text the quick filter searches for this cell. By default it matches
   * the display text, which is what the reader can see; supply this to search
   * something else.
   */
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
 * Structured tooltip content the grid renders for you: a
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
 * A rich, keyboard-accessible tooltip for a column's cells —
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
 * Grid-level defaults for the rich cell tooltip, set once for
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
  /**
   * Draw the formatted text as something richer — a pill, a proportional bar,
   * an icon — by name or as a full spec. Ignored, with a warning, on a column
   * that also sets `template` or `render`, since those own the cell's content.
   */
  decoration?: DecorationName | DecorationSpec;
  /**
   * Which semantic token a cell's decoration takes its colour from: `neutral`,
   * `info`, `success`, `warning`, `danger`, `accent`, or `none` to suppress
   * it. Give a fixed token, a value-to-token map, ordered `when` clauses, or a
   * function of the row — it always resolves to a token, never to a colour.
   */
  variant?: VariantSpec;
  /**
   * A declarative cell template compiled once per column: `{{ value }}`, `{{
   * text }}`, `{{ index }}`, `{{ data.field }}` and anything in `cell.props`.
   * Only a safe subset of tags survives; a binding that resolves to nothing
   * renders empty and warns.
   */
  template?: string;
  /**
   * A custom cell renderer: a function, a component class with a `render`
   * method, or the name of a registered renderer. It owns the cell's content,
   * so a decoration set alongside it is ignored.
   */
  render?: string | RenderFn | RendererCtor;
  /**
   * Values passed on to the renderer as `params.props`, and reachable from a
   * template as `{{ name }}`.
   */
  props?: Record<string, unknown>;
  /**
   * An escape hatch that computes style properties for every cell. It leaves
   * the class fast path and warns once per column; unsuitable for large
   * datasets, where a decoration and a variant do the same job from the
   * stylesheet.
   */
  css?: (p: CellParams) => CellStyle;
  /**
   * Class names put on every cell of the column, or a function asked per cell.
   * Composed with the decoration and `classWhen` classes rather than replacing
   * them.
   */
  class?: string | string[] | ((p: CellParams) => string | string[]);
  /**
   * Conditional classes: each class name is mapped to a condition — a
   * comparison written as text (`'>= 100'`, `"= 'Open'"`) or a predicate on
   * the cell — and every class whose condition holds is added.
   */
  classWhen?: Record<string, string | ((p: CellParams) => boolean)>;
  /**
   * Inline style properties for every cell of the column, as an object or a
   * function of the cell. Merged with any runtime formatting rule in one
   * write, the rule winning on the properties it names.
   */
  style?: CellStyle | ((p: CellParams) => CellStyle);
  /**
   * A tooltip for this column's cells.
   *
   * A string or a function is the plain-text case and becomes the browser's own
   * `title`. An object is a {@link ColumnTooltipSpec}: a tooltip the grid draws,
   * which can carry structure, markup or live content and which a keyboard user
   * can reach.
   */
  tooltip?: string | ((p: CellParams) => string) | ColumnTooltipSpec;
  /**
   * Horizontal alignment of this column's cell content. Accepted at the top
   * level of the column too; falls back to the data type's default and finally
   * to `'start'`.
   */
  align?: Align;
  /**
   * Vertical alignment of this column's cell content, overriding the grid-level
   * `verticalAlign` for this column alone. Accepted at the
   * top level of the column too, as `align` is.
   */
  verticalAlign?: VAlign;
  /**
   * Let a cell's text wrap onto further lines instead of being clipped to one.
   * Off by default. Pair it with `autoHeight` on the grid for rows that grow
   * to fit.
   */
  wrap?: boolean;
  /**
   * Flash this column's cells when their value changes — the per-column half
   * of the grid-level `highlightOnChange`, for a grid where one column is the
   * one worth watching. `true` takes the default colour and duration; an
   * object takes the same `{ colour, duration }` the grid-level key accepts.
   * Grid-level `highlightOnChange` covers every column and wins where both are
   * set.
   */
  flash?: boolean | string | {
    colour?: string;
    color?: string;
    /** Milliseconds. `0` leaves the highlight until it is cleared. */
    duration?: number;
    enabled?: boolean;
  };
  /**
   * Make this column's cell span several columns, as a function of the cell.
   * Return 1 or less for no span; the span is floored and clamped to the
   * columns remaining to its right, and a spanned cell is drawn in its own
   * layer so row recycling cannot clip it.
   */
  spanColumns?: (p: SpanParams) => number;
  /**
   * Make this column's cell span several rows, as a function of the cell.
   * Return 1 or less for no span. The renderer looks back 50 rows above the
   * viewport for a span's origin: a span taller than that is reported once and
   * drawn from the first row in range, and one whose origin sits further above
   * the viewport than that is not found, so its cells draw individually.
   */
  spanRows?: (p: SpanParams) => number;
}

export interface ColumnEditSpec {
  /**
   * Whether this column's cells can be edited. `false` by default; a function
   * is asked per cell, and a throw is reported once and the cell treated as
   * read-only.
   */
  enabled?: boolean | ((p: CellParams) => boolean);
  /**
   * Which editor opens on this column: the name of a registered editor, or a
   * class of your own. The data type's default editor is used when this is
   * absent. Naming one without enabling editing leaves the column read-only,
   * and says so.
   */
  editor?: string | EditorCtor;
  /**
   * Values handed to the editor as `params.props` — the option list for a
   * select, the step for a number.
   */
  props?: Record<string, unknown>;
  /**
   * Open the editor in a popup over the cell rather than inside it. Defaults
   * to whatever the editor class declares.
   */
  popup?: boolean;
  /**
   * Check an edited value before it is written. Return `true` to accept, or a
   * message to reject and show. A throw is reported once and the edit
   * rejected.
   */
  validate?: (p: ValidateParams) => true | string;
}

/**
 * Declarative edit-validation rules for a column.
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

/** A sort direction: ascending or descending. */
export type SortDirection = 'asc' | 'desc';
export interface ColumnSortSpec {
  /**
   * Whether this column can be sorted. True by default, and forced off on a
   * running-total column, whose value is defined by the display order.
   */
  enabled?: boolean;
  /**
   * The sort direction this column starts in — `'asc'`, `'desc'`, or `null`
   * for unsorted, which is the default.
   */
  direction?: SortDirection | null;
  /** This column's place in a multi-column sort, lowest first. 0 by default. */
  order?: number;
  /**
   * Put empty values before the rest instead of after them. Off by default, so
   * nulls sort last whichever direction is in force.
   */
  nullsFirst?: boolean;
}

export interface ColumnFilterSpec {
  /** Whether this column offers a filter. True by default. */
  enabled?: boolean;
  /**
   * Which filter the column uses: a built-in name, or a filter class of your
   * own. Defaults to the kind the data type asks for, and to `'text'` when it
   * names none.
   */
  type?: FilterName | FilterCtor;
  /**
   * Values handed to the filter as `params.props` — the option list for a set
   * filter, the step for a number range.
   */
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
  /**
   * The narrowest this column may be, in pixels; 40 by default. It clamps a
   * drag, a flex share and a content fit alike.
   */
  min?: number;
  /** The widest this column may be, in pixels. No maximum by default. */
  max?: number;
  /**
   * A share of the space left over once the fixed-width columns are laid out;
   * 0 (no share) by default. Resizing the column by hand sets it back to 0, so
   * the drag is not immediately undone.
   */
  flex?: number;
  /**
   * Freeze the column against the start or the end edge, so it stays put while
   * the rest scroll sideways. `null`, the default, leaves it in the scrolling
   * body. Start and end rather than left and right, so a right-to-left grid
   * needs no change.
   */
  pin?: Edge | null;
  /**
   * Keep the column out of the grid without removing it. Off by default;
   * `columns.show()` and `columns.hide()` move it.
   */
  hidden?: boolean;
  /**
   * Whether the user may drag this column's width. True by default; a resize
   * of a column that says `false` is ignored and warns once.
   */
  resizable?: boolean;
  /**
   * Whether the user may drag this column to another position. True by
   * default; a move of a column that says `false` is ignored and warns once.
   */
  movable?: boolean;
  /**
   * Refuse to hide this column: a hide is ignored and warns once, and the AI
   * layer is told the column cannot be hidden. Off by default.
   */
  lockVisible?: boolean;
  /**
   * Hold this column where it is: it cannot be dragged, it cannot be moved by
   * the keyboard, and it cannot be pulled into a header band. Off by default.
   *
   * This locks a column; it does not place one. `'start'` and `'end'` were
   * declared and never implemented — every reader tested truthiness, so either
   * one pinned the column wherever it already sat — and the union was narrowed
   * to the boolean the grid actually honours. Put a column
   * at an edge by ordering `columns`, or pin it with `layout.pinned`.
   */
  lockPosition?: boolean;
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
  /**
   * Declared, but not drawn: the header renderer never reads it, so a
   * heading's only hover text is the drag hint. Put the text in the heading
   * itself with `header.render`, or on the cells with `cell.tooltip`.
   */
  tooltip?: string;
  /**
   * Horizontal alignment of the heading text. Follows the cell alignment when
   * it is not set, so a right-aligned number column gets a right-aligned
   * heading.
   */
  align?: Align;
}

/** How a lookup column leaves in an export: its label, its stored value, or both. */
export type ColumnExportLookup = 'label' | 'value' | 'columns';
export interface ColumnExportSpec {
  /**
   * How a lookup column leaves in an export: `'label'` (the default) writes
   * what the reader sees, `'value'` writes the stored code, `'columns'` writes
   * both in a pair of columns.
   */
  lookup?: ColumnExportLookup;
  /** Include this column in a CSV export. True by default. */
  csv?: boolean;
  /** Include this column in an Excel export. True by default. */
  excel?: boolean;
}

/** The calendar unit a column's row-grouping buckets a timestamp by. */
export type ColumnGroupGranularity = 'day' | 'week' | 'month' | 'instant';
/** When a leaf column or a column group is shown, relative to an ancestor band's open state. */
export type ShowWhen = 'open' | 'closed' | 'always';
/** Which rows a column's positional shadow (a rank or similar) is computed against. */
export type RowScope = 'all' | 'filtered';
/** How a rolling shadow's window is measured: a row count, a time span, or the whole session. */
export type WindowKind = 'count' | 'time' | 'session';
/** Whether a rolling shadow is computed per group, or across the whole dataset. */
export type ShadowWithin = 'group' | 'all';
/** A seasonal decomposition's model: additive, or multiplicative. */
export type ShadowDecomposition = 'additive' | 'multiplicative';
/** An exponential-smoothing shadow's model: single smoothing, or Holt's level+trend. */
export type SmoothingMethod = 'ses' | 'holt';
/** A regression shadow's fitting method. */
export type RegressionMethod = 'ols' | 'wls' | 'robust' | 'quantile';
/** A running total's shape: a running sum, a running percentage, or a period-over-period delta. */
export type RunningTotalMode = 'total' | 'percent' | 'delta';
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
   * Declarative edit-validation rules. Each is checked against
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
   * Whether the column takes part in the quick filter (the single search box
   * across every column). Defaults to `true`, independently of `filter`:
   * `filter.enabled` turns off the column's own funnel/menu control and has
   * never governed quick search, which reads across columns rather than
   * filtering one. Set this `false` to drop a column from quick search while
   * leaving its funnel alone, or leave both alone for the common case.
   *
   * **Behaviour change:** before this, `filter: { enabled:
   * false }` also removed the column from quick search as a side effect. A
   * host that relied on that coupling to keep a column out of quick search
   * must now set `quickFilter: false` explicitly; `filter.enabled` no longer
   * touches quick search at all.
   */
  quickFilter?: boolean;
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
    granularity?: ColumnGroupGranularity;
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
   * for example.
   */
  groupTotal?: TotalName | TotalFn;
  /**
   * The reduction for the pinned grand-total row, where it should differ from
   * the group subtotals. Overrides `total` for the grand total only; when
   * omitted the column's `total` applies.
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
     * a time `window` this is instead how many buckets the span
     * divides into — `window: {kind: 'time', span: 60_000}, depth: 20` is sixty
     * one-second buckets. Ignored by every other kind.
     */
    depth?: number;
    /**
     * For a positional kind, what to rank against. `'all'` (the default) uses
     * every tracked row, so a rank does not move when the grid is filtered;
     * `'filtered'` ranks within what the filters left.
     */
    scope?: RowScope;
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
     * `rollingMax`/`windowCoverage`/`cumulativeToDate`/`periodOverPeriod`), the column whose order defines the series — dates,
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
     * For `kind: 'history'`, only `{kind: 'time', span}` (or
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
      kind: WindowKind;
      span?: number;
      minutes?: number;
    };
    /**
     * For a rolling kind, whether the series is computed per group (`'group'`,
     * the default — partitioned by the grid's active grouping) or across the
     * whole dataset (`'all'`).
     */
    within?: ShadowWithin;
    /**
     * For `kind: 'rollingQuantile'` (and its `windowApproximate` companion), the
     * quantile in `[0, 1]`, defaulting to the median (`0.5`). Exact while the
     * window is small; past an internal span cap, and for a session window, the
     * value comes from a sketch and is stamped by a `windowApproximate` column.
     */
    q?: number;
    /**
     * For a seasonal-decomposition kind (`tsTrend`/`tsSeasonal`/`tsResidual`/
     * `tsCoverage`), the season length — **required**, since
     * there is no auto-detection in v1: 7 for a weekly cycle in daily data, 12
     * for a monthly cycle in monthly data. An integer of at least 2.
     */
    period?: number;
    /**
     * For a decomposition kind, the classical model: additive by default, or
     * `multiplicative` (which is undefined on a non-positive series, so those
     * rows report null and the caller is warned).
     */
    decomposition?: ShadowDecomposition;
    /**
     * For an exponential-smoothing kind (`tsSmoothed`/`tsSmoothingAlpha`/
     * `tsSmoothingBeta`), the model: single exponential
     * smoothing (`ses`, the default) or Holt's level+trend (`holt`).
     */
    smoothing?: SmoothingMethod;
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
     * For a `fit*` kind, the regression model the shadow reads
     * — predictors, response, method and confidence. Its predictors/response may
     * also be given directly on this object.
     */
    model?: RegressionSpec;
    predictors?: string[];
    response?: string;
    method?: RegressionMethod;
  };
  /**
   * A running total down the grid **as it is currently ordered**.
   *
   * The one derived value that depends on the display order: sort differently
   * and every value changes. That is why it is not a shadow kind: every shadow
   * reads the same however the rows are arranged.
   */
  running?: RunningTotalMode
    | { of?: string; kind?: RunningTotalMode };
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
   * The cell right-click menu for this column alone, in the
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
   * this column alone. `'hover'` reveals them on hover or
   * focus, `'always'` keeps them visible, `'hidden'` draws none of them and
   * leaves them out of the tab order, but still shows a read-only sort badge
   * when the column actually is sorted. `'none'` goes
   * further: the heading shows its title and nothing else whatever the grid's
   * state — no controls, and not even `'hidden'`'s read-only sort badge; the
   * column's `aria-sort` still reports the truth, only the visual is gone.
   * Omitted, the column follows the grid default, which is itself `'hover'`.
   */
  headerControls?: HeaderControlsVisibility;
  /**
   * Vertical alignment of this column's cell content within the row. Overrides the grid-level `verticalAlign` for this column
   * alone; `top`, `middle` or `bottom`. Also accepted as `cell.verticalAlign`,
   * the way `align` is. Omitted, the column follows the grid default.
   */
  verticalAlign?: VAlign;
  /**
   * When this leaf column is shown, the same union `ColumnGroup` declares. A leaf reads its own `showWhen` exactly as a group
   * reads its own — `open`/`closed` tie the leaf to an ancestor group's
   * collapsed state, `always` (the default) shows it regardless — so tying a
   * leaf's visibility to a group's open/closed state does not require
   * wrapping it in a `ColumnGroup` of its own just to hold this setting; a
   * wrapper is for grouping columns, not for this.
   */
  showWhen?: ShowWhen;
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
  /**
   * A stable identity for the band, which `renameGroup`, `dissolveGroup` and
   * `moveGroup` take and which a saved view keys the band's open state by. The
   * grid generates one when you do not.
   */
  id?: string;
  /**
   * The heading drawn across the band. Also the fallback identity when the
   * band has no `id`.
   */
  title: string;
  /**
   * The band's children, in order: leaf columns, further bands, or a mix — the
   * header nests as deeply as the tree does.
   */
  columns: (Column | ColumnGroup)[];
  /**
   * Give the band a control that opens and closes it. Off by default; a band
   * that is not collapsible passes its ancestor's open state straight down.
   */
  collapsible?: boolean;
  /**
   * Whether a collapsible band starts open. Open unless set to `false`; once
   * the user has toggled it, their choice stands.
   */
  openByDefault?: boolean;
  /**
   * When this node is shown relative to the enclosing collapsible band:
   * `'open'`, `'closed'`, or `'always'` (the default). This is how a band
   * shows a detailed set of columns when open and a single summary column when
   * closed. A leaf column may declare it too.
   */
  showWhen?: ShowWhen;
  /**
   * Keep this band's columns together: a move that would take one of them out
   * of the band's run, or drop a column from outside into it, is refused with
   * a warning. Off by default, in which case a drag, a keyboard move or the
   * column menu may separate them.
   */
  marryChildren?: boolean;
  /**
   * Presentation for the band's own heading cell: a custom renderer, the props
   * handed to it, and classes to add.
   */
  header?: { render?: string | RendererCtor; props?: Record<string, unknown>; class?: string | string[] };
  /** This column's histogram. `true` turns it on with the grid's settings. */
  facet?: ColumnFacetConfig | boolean;
}

/** A column after presets, type defaults and grid defaults are folded in. */
export interface ResolvedColumn {
  /**
   * This column's identity, which every API that names a column uses. The
   * definition's `id`, or its `field` when no `id` was given, or a generated
   * `col…` name when it has neither.
   */
  id: string;
  /**
   * The path into a row's data this column reads and writes, dotted for a
   * nested value. `null` on a column whose value is computed rather than read.
   */
  field: string | null;
  /**
   * The heading text. Defaults to the field (or the id) made human: `unitPrice`
   * becomes `Unit Price`, and a dotted path uses only its last segment.
   */
  title: string;
  /**
   * The data type actually in force. Not always the name that was asked for:
   * an unknown `type` falls back to `text` for every behaviour, and reads back
   * here as `text`.
   */
  type: TypeName;
  /**
   * The resolved data type itself — the object supplying the parser,
   * comparator, editor, Excel format and defaults this column behaves by.
   */
  dataType: DataType;
  /**
   * Whether an empty value is allowed in this column. True unless the
   * definition said `nullable: false`.
   */
  nullable: boolean;
  /**
   * The horizontal alignment in force, after the column's own `align` or
   * `cell.align`, the grid's column defaults and the data type's default have
   * been weighed in that order. `'start'` when nothing sets one.
   */
  align: Align;
  /**
   * The resolved vertical alignment, or `undefined` when
   * neither the column nor the grid set one — in which case the cell keeps the
   * grid's historical vertical placement (centred, or top for `autoHeight`).
   */
  verticalAlign?: VAlign;
  /**
   * The value hooks with defaults filled in. `pure` is always present and is
   * `true` unless the column said otherwise — the grid forces it `false` on a
   * shadow or running-total column, whose answer does not depend on the row
   * alone.
   */
  value: Required<Pick<ColumnValueSpec, 'pure'>> & ColumnValueSpec;
  /**
   * The resolved cell spec — renderer or template, decoration, variant,
   * classes, tooltip. `cell.align` is always filled in, from the column's own
   * `cell.align` or from `align`.
   */
  cell: ColumnCellSpec;
  /**
   * The resolved editing spec. `enabled` is `false` unless the column turned
   * editing on, so a column is read-only until it says otherwise.
   */
  edit: ColumnEditSpec;
  /**
   * The resolved sort spec. Sorting is enabled, with no direction, order 0 and
   * nulls last, unless the column or a preset says otherwise.
   */
  sort: ColumnSortSpec;
  /**
   * The resolved filter spec. Filtering is enabled by default, with the filter
   * kind the data type asks for — `'text'` when it names none, and disabled
   * entirely when the type declares `filter: 'none'`.
   */
  filter: ColumnFilterSpec;
  /** Whether this column takes part in the quick filter. */
  quickFilter: boolean;
  /**
   * The resolved grouping spec: whether this column is a grouping key, its
   * place in the group order (`-1` when it is not one), whether a multi-value
   * cell explodes into one group per value, and the date granularity to group
   * by.
   */
  group: { enabled: boolean; index: number; explode: boolean; granularity?: ColumnGroupGranularity; weekStart?: number };
  /**
   * The resolved pivot spec: whether this column is a pivot key and its place
   * in the pivot order (`-1` when it is not one).
   */
  pivot: { enabled: boolean; index: number };
  /**
   * The footer aggregate: a built-in name, or the function a custom or
   * type-specific total resolved to, or `null` for none. A total the data type
   * declares meaningless for the column (the mean of a bearing, the sum of
   * decibels) is refused at configuration time rather than shown as a wrong
   * number.
   */
  total: TotalName | TotalFn | null;
  /**
   * The group-subtotal override, or null when group subtotals follow `total`.
   */
  groupTotal: TotalName | TotalFn | null;
  /**
   * The grand-total override, or null when the grand total follows `total`.
   */
  grandTotal: TotalName | TotalFn | null;
  /**
   * The resolved layout: width, min and max, flex, pin, hidden, and the
   * resize, move and lock flags. Width defaults to 150 px and min to 40 px;
   * `fit: 'content'` drops the default width so the measurement can supply
   * one.
   */
  layout: ColumnLayoutSpec;
  /**
   * The resolved header spec. `header.align` is always filled in and follows
   * the cell alignment, so a right-aligned number column gets a right-aligned
   * heading.
   */
  header: ColumnHeaderSpec;
  /**
   * This column's own cell-menu declaration, or null when it
   * makes none and the grid-level menu stands alone. Carried onto the resolved
   * column so a column preset or `columnDefaults` can supply one.
   */
  contextMenu: boolean | MenuItem[] | ((p: CellMenuParams, defaults: MenuItem[]) => MenuItem[] | void) | null;
  /**
   * The resolved export spec: by default a lookup column exports its label,
   * and the column appears in both the CSV and the Excel export.
   */
  export: ColumnExportSpec;
  /**
   * The compiled lookup for a dictionary column — value-to-label mapping, its
   * comparator and group keys, and its loading state for an asynchronous
   * dictionary — or `null` when the column has none.
   */
  lookup: LookupSpec | null;
  /**
   * Whether the user may group by this column from the menu or the tool panel.
   * True unless the definition said `allowGroup: false`.
   */
  allowGroup: boolean;
  /**
   * Whether the user may pivot on this column from the menu or the tool panel.
   * True unless the definition said `allowPivot: false`.
   */
  allowPivot: boolean;
  /**
   * Whether the user may put a footer total on this column from the menu. True
   * unless the definition said `allowTotal: false`.
   */
  allowTotal: boolean;
  /** Compiled display-text producer. */
  formatValue(value: unknown, row?: Row, data?: unknown): string;
  /** Resolve the value for a row, through the computed-value graph. */
  getValue(data: unknown, row?: Row): unknown;
  /**
   * The column definition exactly as it was given, before presets,
   * `columnDefaults`, data-type defaults and the grid's own defaults were
   * folded in.
   */
  def: Column;
}

// ---------------------------------------------------------------------------
// Filter wire format (spec 9.3)
// ---------------------------------------------------------------------------

/**
 * The comparison a filter condition makes.
 *
 * Every operator has an exact negation — `eq`/`ne`, `contains`/`notContains`,
 * `between`/`notBetween`, `in`/`notIn`, `blank`/`notBlank` — so a rule and its
 * inverse are always both expressible. Which of them a column offers depends
 * on its type, and a source that pushes filtering down to a query engine may
 * accept a narrower set again.
 */
export type Operator =
  | 'eq' | 'ne'
  | 'lt' | 'lte' | 'gt' | 'gte'
  | 'between' | 'notBetween'
  | 'in' | 'notIn'
  | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'matches'
  | 'blank' | 'notBlank'
  | 'containsAny' | 'containsAll' | 'containsNone';

/** Which ends of a `between` range are inclusive, in interval notation. */
export type IntervalBounds = '[]' | '[)' | '(]' | '()';
export interface Condition {
  /** The id of the column this condition reads. */
  col: string;
  /**
   * The column's type, which decides how both sides are normalised before
   * comparison — a `date` or `dateString` condition brings the value and the
   * operand to the same calendar day first, so a `Date`, an epoch number and
   * an ISO string all line up.
   */
  type?: TypeName;
  /**
   * The comparison to make: `eq`, `contains`, `between`, `in`, `blank` and the
   * rest, each with an exact negation (`ne`, `notContains`, `notBetween`,
   * `notIn`, `notBlank`).
   */
  op: Operator;
  /**
   * The operand: a single value, a pair for `between`, or a list for `in`.
   * Left out by the operators that need none.
   */
  value?: unknown;
  /**
   * Which ends of a `between` range are inclusive, written in interval
   * notation. `'[]'` — both ends — by default; `'[)'` is the half-open form a
   * date range usually wants.
   */
  bounds?: IntervalBounds;
  /**
   * Compare text exactly as written. Off by default, so text matching, set
   * membership and regular expressions all ignore case.
   */
  caseSensitive?: boolean;
  /**
   * Extra information carried alongside the condition for whoever executes it
   * — the relative date token a range was built from, so a saved `last 7 days`
   * filter is re-derived rather than frozen to the day it was written.
   */
  meta?: Record<string, unknown>;
}

/** How a filter group's children combine: conjunction, disjunction, or negation. */
export type FilterOp = 'and' | 'or' | 'not';
export interface FilterGroup {
  /** How the children combine: `'and'`, `'or'`, or `'not'` to negate them. */
  op: FilterOp;
  /**
   * The children — conditions, or further groups, so a filter set is a tree of
   * any depth.
   */
  conditions: FilterSet[];
}

/**
 * A filter, as data: one condition, a group nesting conditions and further
 * groups to any depth, or `null` for no filter at all.
 *
 * This is the shape the filter APIs hand back and accept, so a filter can be
 * saved with a view, sent to a server and restored without going through the
 * user interface that built it.
 */
export type FilterSet = FilterGroup | Condition | null;

export interface SortEntry {
  /**
   * The id of the column to sort by. An entry naming a column the grid does
   * not have is dropped with a warning rather than stored.
   */
  col: string;
  /** `'asc'` or `'desc'`. */
  dir: SortDirection;
  /**
   * Put empty values before the rest instead of after them. Off by default, so
   * nulls sort last in either direction.
   */
  nullsFirst?: boolean;
}

// ---------------------------------------------------------------------------
// Sources (spec 4)
// ---------------------------------------------------------------------------

export interface ReloadOptions { keepExpanded?: boolean; keepSelection?: boolean }

/** Which kind of data source a grid is bound to. */
export type SourceMode = 'memory' | 'paged' | 'remote' | 'stream';
export interface Source {
  /**
   * Which kind of source this is — `'memory'`, `'paged'`, `'remote'` or
   * `'stream'`. Several features read it: histograms are refused over an open
   * stream, and cross-filtering needs a memory source.
   */
  readonly mode: SourceMode;
  /**
   * How many display rows the source is offering, group rows included. A paged
   * source with an unknown total reports what it has discovered plus one page,
   * so the scrollbar keeps growing as the rows arrive.
   */
  count(): number;
  /**
   * The row at a display index. A row that has not arrived yet comes back as a
   * skeleton placeholder rather than `undefined`, so the renderer always has
   * something to lay out.
   */
  at(index: number): Row | undefined;
  /** The row with this key, or `undefined` when the source does not hold it. */
  byKey(key: string): Row | undefined;
  /**
   * Whether the row at an index has actually arrived. `false` for a skeleton,
   * which is how the renderer knows to draw a placeholder.
   */
  loaded(index: number): boolean;
  /**
   * Tell the source which rows are about to be needed — the viewport, plus
   * whatever overscan the renderer wants — so it can fetch ahead. Advisory: a
   * source may ignore it.
   */
  hint(start: number, end: number): void;
  /**
   * Apply an incremental change to the rows the source holds, returning what
   * it added, updated and removed.
   */
  apply(change: RowChange): ChangeResult;
  /**
   * Throw away what is cached and fetch again. What a host calls when the data
   * changed behind the grid's back.
   */
  reload(opts?: ReloadOptions): void;
  /**
   * Release whatever the source holds — sockets, timers, in-flight requests —
   * when the grid is torn down.
   */
  destroy?(): void;
}

export interface MemorySourceConfig {
  /**
   * Selects the in-memory source: the grid holds every row and answers sort,
   * filter, group, pivot and totals itself.
   */
  mode: 'memory';
  /**
   * The row count below which the grid skips columnar storage and keeps plain
   * row objects. 5,000 by default — columnarising a small grid costs more than
   * it saves.
   */
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
  /**
   * Selects the paged source: block-based lazy loading over a flat list, with
   * sorting and filtering delegated to the server.
   */
  mode: 'paged';
  /** How many rows are fetched per block. 100 by default. */
  pageSize?: number;
  /**
   * How many blocks are kept before the least recently used ones outside the
   * viewport are evicted. 32 by default.
   */
  maxCachedPages?: number;
  /**
   * Answer one block: the rows for the requested range, and the total when
   * known. Changing the sort or the filters invalidates every block, since the
   * server may return an entirely different window for the same range.
   */
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
  /**
   * The wire protocol version, always 1. A server implementation targets the
   * documented version rather than reverse-engineering what this release
   * happens to send.
   */
  protocol: 1;
  /**
   * The half-open row range being asked for at this level, `start` inclusive
   * and `end` exclusive.
   */
  range: { start: number; end: number };
  /**
   * The group ancestry of the level being fetched, outermost first, as display
   * strings. It is a stable identity for expansion state — use `groupValues`
   * to narrow a query.
   */
  groupPath: string[];
  /**
   * The same ancestry as `groupPath`, but as the values the server returned
   * rather than their display strings. Always present, empty
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
  /**
   * The columns the grid is grouping by, outermost first. Empty when the rows
   * are flat.
   */
  groupBy: ColumnRef[];
  /**
   * The columns that want a subtotal on each group row. The grid does not
   * recompute what a remote source returns.
   */
  totals: ColumnRef[];
  /**
   * The named statistic each totalled column reduces with — `{ amount: 'sum' }`. `totals` has always said *which* columns want a subtotal
   * and never *what*, because the client reads the reduction off the column
   * model and a server had no way to.
   *
   * Only string reductions appear: a column totalling with a host function has
   * no name to send, and naming one that merely resembles it would put a
   * plausible wrong number on every group row. `groupTotal` wins over `total`,
   * the same precedence the client applies for the group scope.
   */
  totalFns: Record<string, string>;
  /** The columns the grid is pivoting on. */
  pivotBy: ColumnRef[];
  /**
   * Whether the grid is in pivot mode — true exactly when `pivotBy` is not
   * empty.
   */
  pivotMode: boolean;
  /**
   * The filter tree, wired for the wire: relative date tokens resolved to
   * absolute ranges, so the server is never asked to interpret `last 7 days`.
   */
  filters: FilterSet;
  /**
   * The quick-filter text, present only when there is some. It is not
   * column-scoped, which is why it sits beside the tree rather than in it.
   */
  quick?: string;
  /** The sort entries in force, outermost first. */
  sort: SortEntry[];
  /**
   * Whatever the grid's `context` holds — a tenant id, an auth token, a locale
   * — passed through untouched for the fetch to use.
   */
  context: unknown;
  /**
   * Aborts when the grid no longer needs this block: the user scrolled past
   * it, changed the query, or destroyed the grid. Pass it to `fetch` and the
   * superseded request is cancelled rather than paid for.
   */
  signal: AbortSignal;
  /**
   * The `where` predicates in force, as a runtime the source can evaluate but
   * not mutate. Present **only when at least one predicate is
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
 * The `where` predicates in force, as a source sees them.
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
  /**
   * The rows for the requested range, at the requested group level. Group rows
   * carry their own subtotals; the grid does not recompute them.
   */
  rows: unknown[];
  /**
   * How many rows exist at this level in total, so the scrollbar is the right
   * size. Omit it while the total is unknown and the grid keeps discovering.
   */
  count?: number;
  /**
   * The exact count, still being worked out.
   *
   * A source whose count has to read data delivers the rows as soon as the page
   * settles and resolves this when the count finishes; the grid keeps
   * discovering until it does, then adopts the number and fires `source:total`.
   * Ignored when `count` is present. Resolving with anything other than the
   * exact count — an estimate, a page length — puts a wrong number in the place
   * a right one goes.
   */
  pendingTotal?: Promise<number | null>;
  /**
   * The value-column names this level's pivot produced, so the grid can build
   * the headings it has never seen before.
   */
  pivotFields?: string[];
}

export interface RemoteSourceConfig {
  /**
   * Selects the remote source: the grid holds a window of rows and asks the
   * server to sort, filter, group, pivot and total.
   */
  mode: 'remote';
  /** How many rows are fetched per block. 100 by default. */
  pageSize?: number;
  /**
   * How many blocks are kept before the least recently used ones outside the
   * viewport are evicted. 32 by default.
   */
  maxCachedPages?: number;
  /**
   * Answer one block. The request is a published protocol — version, range,
   * group path, sort, filters, pivot, totals and the abort signal — so a
   * server implementation targets the documented shape rather than guessing.
   */
  fetch(req: RemoteRequest): Promise<RemoteResult>;
}

export interface Chunk {
  /**
   * The rows in this chunk. They are appended to whatever has already arrived,
   * merged into the current sort rather than re-sorting the whole set.
   */
  rows: unknown[];
  /**
   * How far the stream has come: `loaded` is how many rows have arrived,
   * `estimated` the total when the producer knows it. It drives the progress
   * readout instead of skeletons.
   */
  progress?: { loaded: number; estimated?: number };
  /**
   * The last chunk. It closes the stream, and a final count under
   * `promoteToMemoryBelow` promotes the source to an in-memory one so later
   * sorts and filters are local.
   */
  done?: boolean;
}

export interface StreamSourceConfig {
  /**
   * Selects the streaming source: rows arrive over time and the grid keeps rendering as
   * they land.
   */
  mode: 'stream';
  /**
   * Opens the feed and returns an async iterable of chunks. It is called with the grid's
   * current sort, filters, quick-filter text and context, and an `AbortSignal` that fires
   * when the query changes or the grid is destroyed — stop producing when it does.
   * Backpressure is the iterator protocol's: the grid awaits the next chunk.
   */
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
   * beside `maxRows` as a second, independent bound. Rows older
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
   * the row returning a `Date`, epoch milliseconds, or an ISO string. Given, the window follows the **data's own** clock, so it
   * means what the producer means — and inherits the producer's clock skew.
   * Omitted, `maxAge` falls back to **arrival time**: when the row reached this
   * source. Arrival time needs no timestamp column and cannot be skewed, but it
   * is not event time — a row delayed in transit counts as young. A row whose
   * time value cannot be read is never aged out.
   */
  ageBy?: string | ((row: unknown) => unknown);
  /**
   * When the feed ends with fewer rows than this, the grid adopts them as an ordinary
   * in-memory source, so later sorts and filters are local. Defaults to 250,000. A
   * store-backed stream is never promoted.
   */
  promoteToMemoryBelow?: number;
  /**
   * How long, in milliseconds, the grid may spend applying arriving chunks per frame.
   * Defaults to 8 — roughly one frame's budget. Raise it to take more rows per frame at the
   * cost of responsiveness.
   */
  coalesceMs?: number;
}

/** One reduced column of a derived grid. */
export interface DerivedSelect {
  /** The column to reduce, as a field name or a dotted path. Omit for `count`. */
  of?: string;
  /** A key of `TOTAL_FNS`: `sum`, `avg`, `median`, `p95`, `distinct` and the rest. */
  fn?: TotalName;
}

/** Which of a derived source's rows to read. */
export type DerivedFollow = 'filtered' | 'all' | 'selected' | 'grouped';
/** With `profile`, whether a derived source emits one row per column or one per statistic. */
export type DerivedOrient = 'columns' | 'metrics';
/** When a derived source re-derives: on every change, coalesced to a frame, or only on demand. */
export type DerivedRefresh = 'live' | 'idle' | 'manual';
/**
 * A grid whose rows are derived from another grid: aggregated, unnested,
 * filtered, ranked or profiled. Read-only: write to the source instead.
 */
export interface DerivedSourceConfig {
  /**
   * Selects the derived source: this grid's rows are computed from another
   * grid's, and re-derived when that one changes.
   */
  mode: 'derived';
  /**
   * A derived grid keys on `__key`, which the source writes onto every row it
   * produces, the group value, the profiled column, or the source row's own
   * key when nothing is grouped. `config.rowKey` defaults to it, so it need not
   * be set; an explicit `rowKey` still wins.
   */
  /**
   * The grid to read, or several to combine into one row set before the rest
   * of the pipeline runs. A bare `Grid` is shorthand for a
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
   * own `follow` instead.
   */
  follow?: DerivedFollow;

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
  orient?: DerivedOrient;

  /**
   * Project a **relational** statistic into rows: the figures
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
   * naming them rather than silently discarded. Sort, filter
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
  refresh?: DerivedRefresh | number;

  /**
   * Let this grid filter the grid it derives from. `true` cross-filters through
   * whatever it groups by; a string names a different source column.
   */
  crossFilter?: boolean | string | { col?: string };
}

/**
 * Which relational statistic a derived source projects into rows, and how. See `DerivedSourceConfig.statistics`.
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
/** Whether a pairwise correlation is shaped as one row per pair, or the square matrix. */
export type CorrelationOrient = 'pairs' | 'matrix';
export interface DerivedCorrelation {
  /**
   * Selects the pairwise-correlation producer. It replaces the pipeline: one
   * row per column pair rather than one per group.
   */
  fn: 'correlation';
  /** The columns to correlate pairwise. At least two, or the source is refused. */
  columns: string[];
  /** `pairs` (default) for one row per pair; `matrix` for the square. */
  orient?: CorrelationOrient;
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
  /**
   * Selects the series-summary producer — volatility, growth, drawdown,
   * autocorrelation — one row per metric. It replaces the pipeline.
   */
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
  /**
   * Selects the dataset-comparison producer: one row per compared column,
   * against a second grid. It replaces the pipeline.
   */
  fn: 'datasetVsDataset';
  /** The second grid to compare this one against. */
  with: Grid;
  /** Restrict the comparison to these columns. All shared columns by default. */
  columns?: string[];
}

/**
 * One member of a union `from`: a grid to combine with the
 * others, plus how to read it and reshape it before it joins the rest. A bare
 * `Grid` in the `from` array is shorthand for `{ grid }` with every other
 * field defaulted.
 */
/** Which slice of a source's rows a shared multi-site "follow" setting reads. */
export type FollowScope = 'filtered' | 'all' | 'selected' | 'grouped';
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
  follow?: FollowScope;
  /**
   * Reshape this source's rows into the common shape before they join the
   * rest — typically a rename or a projection, for a field this source calls
   * something else. Not a type coercion: if a field means something different
   * on two sources, `map` is where you make them agree, because the union
   * itself does not guess.
   */
  map?: (row: unknown) => unknown;
}

/** Whether a join keeps only matched rows, or keeps every row on this side. */
export type JoinType = 'inner' | 'left';
export interface DerivedJoin {
  /** The grid holding the other side. */
  with: Grid;
  /** The shared key: one field name when both sides use it, or one each. */
  on: string | { left?: string; right?: string };
  /** `inner` keeps only rows that matched; `left` keeps them all. */
  type?: JoinType;
  /** Which of the partner's fields to bring across. All of them by default. */
  select?: string[];
  /** Rename the brought-across fields, when both sides have one worth keeping. */
  prefix?: string;
  /** Which of the partner's rows to read. `all` by default. */
  follow?: RowScope;
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

/**
 * Where a grid's rows come from: an array held in memory, a paged endpoint, a
 * remote query, a live stream, or rows derived from another grid. The `type`
 * field picks which, and the rest of the object is that source's own options.
 */
export type SourceConfig =
  | MemorySourceConfig | PagedSourceConfig | RemoteSourceConfig | StreamSourceConfig
  | DerivedSourceConfig;

// ---------------------------------------------------------------------------
// Grid configuration (spec 18.1)
// ---------------------------------------------------------------------------

export interface TreeConfig {
  /**
   * Read a row's own ancestry — `['EMEA', 'UK', 'Colchester']`. Levels with no
   * row of their own are synthesised, so a row can sit several levels deep
   * without its parents existing in the data.
   */
  path?: (row: unknown) => string[];
  /**
   * Name each row's parent by key, which is the shape a join or a document
   * store produces. Every node is then a real row; a parent that is not in the
   * data makes an orphan, and a cycle is broken rather than followed forever.
   */
  parentKey?: string | ((row: unknown) => unknown);
  /**
   * Where a row whose parent is missing goes. `'root'` (the default) leaves it
   * at the top level; any other string is the title of a synthesised bucket
   * that gathers them, so they are visibly gathered rather than silently
   * promoted. Rows caught in a parent cycle go the same way, and are reported.
   */
  orphans?: 'root' | string;
  /**
   * Say that a row has children the grid has not seen yet, so it draws an
   * expander for a branch that is still to be fetched. Without it, only rows
   * with children already in the data can be opened.
   */
  hasChildren?: (row: unknown) => boolean;
  /**
   * Fetch a branch's children when it is first opened, with an abort signal
   * for a branch closed before they arrive. Fetched once: a branch reopened
   * shows what it already has. The rows are added to the grid like any others,
   * so they sort, filter and export normally. A failure is announced and the
   * branch is left unmarked, so the user can retry by opening it again.
   */
  loadChildren?: (row: Row, signal: AbortSignal) => Promise<unknown[]>;
  /** Where the generated tree column takes its text from: a field or a function. */
  label?: string | ((data: unknown, row: Row) => unknown);
  /** The tree column's heading. Defaults to the label column's own title. */
  title?: string;
}

export interface DetailConfig {
  /**
   * Turn master-detail on. `detail: true` is the shorthand; `enabled: false`
   * turns it off without removing the rest of the block.
   */
  enabled?: boolean;
  /**
   * Draw the detail region yourself — a renderer, or the name of a registered
   * one. One of `render` or `rows` is required, or the feature stays off and
   * says so.
   */
  render?: string | RendererCtor;
  /**
   * The grid configuration for the nested grid the detail region builds from
   * `rows`. Columns, formatting, everything a grid takes.
   */
  config?: GridConfig;
  /**
   * Produce the detail rows for a master, synchronously or as a promise. The
   * grid puts them in a nested grid built from `config`.
   */
  rows?: (row: Row) => unknown[] | Promise<unknown[]>;
  /**
   * How tall the detail region is, in pixels: a number, a function of the
   * master row, or `'auto'` to measure it once it has content. 240 px by
   * default.
   */
  height?: number | 'auto' | ((row: Row) => number);
  /**
   * How many nested grids stay alive after their master is closed, so
   * collapsing and reopening does not refetch. 10 by default; beyond it the
   * least recently opened are destroyed, because one grid per row is a memory
   * leak with a friendly name.
   */
  cacheLimit?: number;
  /**
   * Decide which rows can be expanded. Every data row can when this is absent;
   * group rows and detail rows never can.
   */
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

/** What a grid's rows and cells may have selected, and whether it is one thing or several. */
export type SelectionMode = 'none' | 'single' | 'multiple';
export interface SelectionConfig {
  /** `'none'` also turns off `ranges` and `fillHandle` unless either is set explicitly alongside it. */
  mode?: SelectionMode;
  /**
   * Add a column of checkboxes down the start of the grid. The grid generates
   * it: it is not one of your columns, so it is never exported, never in the
   * tool panel, and it disappears when the option is turned off.
   */
  checkbox?: boolean;
  /**
   * Put a select-all checkbox in that column's heading, showing the tri-state
   * over the displayed rows.
   */
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
  /**
   * Selecting a group row selects every row beneath it, and a group shows as
   * partially selected when only some of its children are. Off by default.
   */
  groupSelectsChildren?: boolean;
  /**
   * Extend that cascade to children the filters have excluded. Off by default,
   * so selecting a group selects what the user can see.
   */
  groupSelectsFiltered?: boolean;
  /**
   * Allow rectangular cell-range selection by drag and by Shift+Arrow. On
   * unless `mode: 'none'` turns it off, which an explicit `true` overrides.
   */
  ranges?: boolean;
  /**
   * Show the drag handle at a range's corner that fills from it. On unless
   * `mode: 'none'` turns it off; it needs ranges to be usable at all.
   */
  fillHandle?: boolean;
  /**
   * Produce the values a fill writes, given the source cells, the target cells
   * and the direction. Without it the grid copies the anchor and extrapolates
   * numeric and date series.
   */
  fill?: (p: { source: unknown[]; target: { row: Row; column: ResolvedColumn }[]; direction: string }) => unknown[];
}

/**
 * How an edit session is scoped: one cell committing on move-away, or one row
 * held open until the whole row commits as a step.
 */
export type EditMode = 'cell' | 'row';
/** Which gesture opens a cell editor. */
export type EditStartGesture = 'single' | 'double' | 'key';
/** How an optimistic write settles: on what `commit` returns, or only when you call `edit.settle` yourself. */
export type EditConfirmMode = 'auto' | 'manual';
export interface EditConfig {
  /**
   * Turn editing on for the grid. `edit: true` is the shorthand; over a remote
   * source with nothing to persist the write, it warns loudly rather than
   * letting cells change on screen and never save.
   */
  enabled?: boolean;
  /**
   * `'cell'` (the default) edits one cell at a time — moving to another
   * commits the first. `'row'` keeps one session open across the row, so the
   * whole row commits as one step.
   */
  mode?: EditMode;
  /**
   * Which mouse gesture opens an editor: `'double'` click, the default, or
   * `'single'`. `'key'` binds no mouse gesture at all, for a grid that is read
   * with the mouse and written with the keyboard. The keyboard path (Enter,
   * F2, typing over a cell) is live under all three.
   */
  start?: EditStartGesture;
  /**
   * Whether Enter commits and moves to the cell below, as a spreadsheet does.
   * On by default; Shift+Enter moves up.
   */
  enterMovesDown?: boolean;
  /** How many steps the undo timeline keeps. 10 by default. */
  undoDepth?: number;
  /**
   * Send a committed edit to your backend. Supplying it turns on optimistic
   * write-back: the cell changes at once, `cell:pending` fires, and the
   * promise's outcome confirms or reverts it.
   */
  commit?: (write: PendingWrite) => unknown;
  /**
   * How an optimistic write settles: `'auto'` (the default) on what `commit`
   * returns, or `'manual'` when the acknowledgement arrives on another channel
   * and you will call `edit.settle` yourself. `'manual'` without a `commit`
   * hook warns and turns tracking off; an unrecognised value warns and is
   * treated as `'auto'`.
   */
  confirm?: EditConfirmMode;
  /**
   * How long, in milliseconds, a write may stay unsettled before the grid
   * warns that it is stuck. 15,000 by default.
   */
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
  /**
   * The write's identity, which `cell:pending` carries and `edit.settle`
   * takes.
   */
  id: string;
  /** The key of the row being written to. */
  key: string;
  /** The column being written to. */
  colId: string;
  /** The new value to persist. */
  value: unknown;
  /**
   * The value the cell held before the edit — what a rejected write is rolled
   * back to, and what a conditional write can check the server against.
   */
  before: unknown;
  /**
   * The row the cell belongs to, so the commit hook can send whatever else it
   * needs to identify the record.
   */
  row?: Row;
}

/** Whether an outstanding write or row op is still the live one, or was superseded. */
export type UpdateState = 'pending' | 'superseded';
export interface OpenWrite {
  /**
   * The write's identity, as it arrived on `cell:pending`. This is what
   * `edit.settle` takes.
   */
  id: string;
  /** The key of the row being written to. */
  key: string;
  /** The column being written to. */
  colId: string;
  /**
   * The optimistic value — what the cell is showing while the write is in
   * flight.
   */
  value: unknown;
  /** The value the cell held before the write, which a revert puts back. */
  before: unknown;
  /**
   * `'pending'` while this is the newest write for the cell, `'superseded'`
   * once a later edit replaced it. A superseded write never writes its value
   * back, however it settles.
   */
  state: UpdateState;
  /**
   * How long the write has been outstanding, in milliseconds. Past
   * `edit.pendingTimeout` the grid warns that it is stuck.
   */
  age: number;
}

/** Whether a structural row op is an append or a delete. */
export type RowChangeKind = 'append' | 'delete';
/** A structural op (append or delete) still awaiting an outcome (§5.3). */
export interface OpenRowOp {
  /**
   * The op's identity, as it arrived on `row:pending`. This is what
   * `edit.settleRow` takes.
   */
  id: string;
  /** Whether the row is being appended or deleted. */
  kind: RowChangeKind;
  /**
   * The row key the op is tracked under — for an append, the client temporary
   * key until the server returns a real one.
   */
  key: string;
  /**
   * `'pending'` while this is the live op for the row, `'superseded'` once a
   * later one replaced it.
   */
  state: UpdateState;
  /** How long the op has been outstanding, in milliseconds. */
  age: number;
}

/**
 * What an adapter can persist back to its source — the write-back capability
 * (§4.1), declared on `AdapterCapabilities.mutate`. `false` (the default) is
 * read-only by declaration; a resolved block turns every kind off unless the
 * adapter opts in.
 */
/** What a server hands back after a successful mutation: the full row, just the key, or nothing. */
export type Returning = 'row' | 'key' | 'none';
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
  returning?: Returning;
}

/**
 * One mutation handed to `adapter.mutate(op, request)` (§4.2). Cell-scoped
 * `update` is the only kind wave 1 synthesises; `append`/`delete` are part of
 * the shape so it survives into a later structural build (card 770).
 */
/** Which mutation a `MutationOp` carries: an insert, a patch, or a delete. */
export type UpdateKind = 'append' | 'update' | 'delete';
export interface MutationOp {
  /**
   * Which mutation this is: `'append'`, `'update'` or `'delete'`. It decides
   * which of the fields below carry the payload.
   */
  kind: UpdateKind;
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
  /**
   * Whether the mutation reached the server. Only an explicit `false` rejects
   * — it reverts the optimistic change and surfaces `reason`; anything else is
   * taken as success.
   */
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
  /** Show the grid a page at a time rather than as one scrolling list. */
  enabled?: boolean;
  /** How many rows a page holds. 0 turns paging off and shows everything. */
  pageSize?: number;
  /** The sizes the page-size control offers the user. */
  pageSizes?: number[];
}

/** Whether interactive targets are sized for a fine pointer or raised for touch. */
export type TargetSize = 'default' | 'large';
/**
 * Writing direction. See {@link GridConfig.direction}.
 */
export type Direction = 'ltr' | 'rtl' | 'auto';
/** Whether `GridConfig.rowForm` opens as a side drawer or a centred dialog. */
export type RowFormMode = 'drawer' | 'dialog';
/**
 * When the per-column header controls — the sort arrow, the filter funnel and
 * the menu button — are shown, as a grid-level default. See
 * {@link GridConfig.headerControls}.
 */
export type HeaderControlsVisibility = 'hover' | 'always' | 'hidden' | 'none';
/** When a queued update batch applies: on a paint boundary, at end of task, on the coalescing window, or only when asked. */
export type UpdatesFlushMode = 'frame' | 'microtask' | 'interval' | 'manual';
/** Whether a row dragged out of the grid via `rowTransfer` is moved or left in place. */
export type RowTransferMode = 'move' | 'copy';
/** Which edge a docked tool panel sits against. */
export type ToolPanelSide = 'left' | 'right';
/** In diff/audit mode, whether a column absent from the snapshot counts as changed or is left alone. */
export type DiffAddedColumns = 'unchanged' | 'changed';
/** Where a pivot's grand-total column group sits relative to the pivoted columns. */
export type PivotGroupTotalsPlacement = 'before' | 'after';

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
  targetSize?: TargetSize;
  /** Your own renderers, editors and filters, registered by name. */
  components?: Record<string, RendererCtor | EditorCtor | FilterCtor>;
  /** Named text transforms usable from a format mask or a template. */
  pipes?: Record<string, (value: unknown, ...args: string[]) => string>;
  /** Your own reductions, alongside the built-in ones. */
  totalFns?: Record<string, TotalFn>;
  /** Named appearance variants a row or cell can be switched into by a rule. */
  variants?: Record<string, VariantDefinition>;
  /**
   * Your own SVG glyphs, registered by name before the first paint.
   *
   * The same registry `registerIcon` writes to and every cell, header control,
   * rail button and chart glyph is painted from, so a name given here is usable
   * anywhere a glyph name is: a column's `icon` decoration, a rail action's
   * `icon`, a network node's `icon`. Registering a built-in name overrides it.
   * Read the result back through {@link Grid.icons}.
   */
  icons?: Record<string, IconDefinition>;
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
  /**
   * The BCP-47 locale everything the grid formats and collates uses — numbers,
   * dates, text ordering, and the message catalogue. Falls back to the page's
   * own `<html lang>` and then to `en-GB`.
   */
  locale?: string;
  /**
   * A partial message catalogue laid over the one `locale` resolves — every
   * string the grid renders or announces. Supply a bundled catalogue (`FR_FR`,
   * `AR`, …) or your own object; overrides merge over the default rather than
   * replacing it, so translating part of the interface leaves the remainder in
   * English rather than showing raw keys. Every valid key is listed in
   * `MESSAGE_KEYS`; a key that is not is ignored with a warning.
   */
  messages?: Record<string, string | Record<string, string>>;
  /**
   * Writing direction. An explicit `'ltr'` or `'rtl'` always wins. Omit it, or
   * say `'auto'`, to settle it from the mount or the nearest ancestor
   * carrying a `dir="ltr"`/`dir="rtl"` attribute, and only then from
   * `locale`: `ar`, `he`, `fa` and the rest resolve to `rtl`. A page-level
   * `dir="ltr"` therefore wins over an RTL locale — a host that wants RTL
   * inside an LTR page sets `direction: 'rtl'` explicitly. In a right-to-left
   * grid the logical alignments `start`/`end` mirror while the physical
   * `left`/`right` do not (see {@link Align}).
   */
  direction?: Direction;
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
   * column. `top`, `middle` or `bottom`; a column's own
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
   * Defaults for the rich cell tooltip.
   *
   * The tooltip itself is declared per column, on `cell.tooltip`; this only
   * carries the settings that are a house style rather than a per-column
   * decision. It switches nothing on: a column with no `cell.tooltip` has no
   * tooltip whatever is set here.
   */
  tooltip?: TooltipConfig;

  /**
   * How the scroll viewport's scrollbars are drawn.
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
   * clicked.
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

  /**
   * Draw each row as a card built from a declarative template instead of as a
   * row of cells. The template compiles once into static and dynamic segments,
   * so scrolling a thousand rows through a hundred pooled cards allocates
   * nothing. A card is still a row — selection, the context menu, focus and
   * drag reorder all work unchanged — but it has no columns, so the layer
   * declares itself a list rather than a grid.
   */
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
   * Present the grid as a pivot — a cross-tab drawn as a matrix (§10).
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

  /**
   * Open a row on a form — a drawer or a centred dialog with one control per
   * field, a Save and a Cancel — on a double-click or through
   * `grid.form.open()`. By default the fields are the grid's own columns,
   * edited with the same editors the cells use; supply `load` to show a fuller
   * record than the grid displays, in which case you must also say which
   * fields and in what order. The panel opens immediately with a loading state
   * and offers a retry on failure or on a load that never answers, rather than
   * closing. Save applies the changed fields that map to columns and announces
   * the rest — persisting the record is yours.
   */
  rowForm?: boolean | {
    mode?: RowFormMode;
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
   * the menu button — are shown, as a default for every column.
   *
   * - `'hover'` (the default) reveals them when the heading is hovered or a
   *   keyboard user focuses into it, which is the historical behaviour: a wide
   *   header does not read as a row of identical icons.
   * - `'always'` keeps them visible unconditionally, for a grid where the
   *   controls are the point and the discoverability of hover is not wanted.
   * - `'hidden'` draws none of them, for a clean read-only heading; they leave
   *   the tab order with the elements that carried them. An active filter and a
   *   live sort are still reflected by the heading's state attributes, but no
   *   control furniture is built. A column that is actually sorted still shows
   *   a read-only sort arrow and multi-sort order number.
   * - `'none'` is `'hidden'` with that last exception
   *   removed: the heading shows only its title, whatever the grid's state —
   *   no controls, no hover affordance, and no sort/filter/group badge even
   *   when the column is sorted, filtered or grouped programmatically or via a
   *   saved view. The column's own `aria-sort` still reports the truth; only
   *   the visual badge is gone. For a dashboard heading that must never change
   *   its own appearance, however the grid around it is driven.
   *
   * A column's own `headerControls` overrides this default for that column.
   * Distinct from `showColumnFunctions: false`, which also drops the furniture
   * but keeps sorting, filtering and the menu reachable from the keyboard;
   * `'hidden'` and `'none'` are the read-only choices that remove them
   * outright.
   */
  headerControls?: HeaderControlsVisibility;
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
    flush?: UpdatesFlushMode;
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
   * Enable the built-in row-delete gesture (§18.4) — the
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
   * The in-grid find bar: Ctrl+F / Cmd+F with focus in the
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
    mode?: RowTransferMode;
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
  /**
   * Dock the side panels against the grid: columns, filters, views, quick
   * search and formatting. The columns panel is where row grouping, values and
   * pivot are assembled by drag, which is why it carries three drop zones as
   * well as the visibility list — a column opts out of each with `allowGroup`,
   * `allowPivot` and `allowTotal`.
   */
  toolPanel?: boolean | {
    /** Built-in names: `columns`, `filters`, `views`, `quick`, `formatting`. */
    panels?: ToolPanelName[];
    openPanel?: string;
    /** Which edge to dock against. `left` is the icon rail; default `right`. */
    side?: ToolPanelSide;
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
   * which is why it also addresses the drag-only complaint.
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
    addedColumns?: DiffAddedColumns;
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
  /**
   * Pivot-mode settings: whether the grid starts pivoted, whether to add a
   * group of grand-total columns beside the pivoted ones and what to call it,
   * the separator joining a group's values in a generated column, and
   * `maxColumns` — the ceiling on generated columns, 500 by default. Past it no
   * pivot columns are produced at all and a clear error is reported, rather
   * than a high-cardinality pivot locking the browser.
   */
  pivot?: {
    enabled?: boolean;
    /**
     * Add a column group totalling every value column across all pivot values,
     * the grand total beside the pivoted ones. `'before'` places it at the near
     * edge, `'after'` at the far edge. Omitted or `false` adds none.
     */
    groupTotals?: PivotGroupTotalsPlacement | false;
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

/**
 * Who may read and write which columns, from the blunt answer to the precise
 * one: one level for every column, a level per column id, a list of rules, a
 * function asked once per column, or an object pairing a default with
 * per-column overrides.
 */
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
  /** The item's label. Omit it on a separator. */
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
  /**
   * Keyboard hint shown right-aligned in the item. Display only — the grid
   * does not bind the key for you.
   */
  shortcut?: string;
  /**
   * What choosing the item does. An item with children opens the submenu
   * instead.
   */
  action?: () => void;
  /**
   * Show the item greyed out and unusable, rather than hiding it, so the menu
   * keeps its shape.
   */
  disabled?: boolean;
  /**
   * Draw a divider instead of an item. Everything else on the entry is
   * ignored.
   */
  separator?: boolean;
  /** Nested items, turning this entry into a submenu. */
  children?: MenuItem[];
}

// ---------------------------------------------------------------------------
// State (spec 15)
// ---------------------------------------------------------------------------

export interface ColumnState {
  /**
   * Which column this entry restores. An entry naming a column the grid no
   * longer has is reported and skipped, not thrown.
   */
  id: string;
  /** The column's width in pixels at the time the state was taken. */
  width?: number;
  /**
   * The column's flex weight, present only when it has one — a fixed-width
   * column leaves it out.
   */
  flex?: number;
  /** Whether the column was hidden. */
  hidden?: boolean;
  /**
   * Which edge the column was frozen against, or `null` when it was in the
   * scrolling body.
   */
  pin?: Edge | null;
  /** The column's sort direction, or `null` when it was not sorted. */
  sort?: SortDirection | null;
  /**
   * The column's place in a multi-column sort, or `null` when it was not
   * sorted.
   */
  sortIndex?: number | null;
  /**
   * The column's place in the grouping order, or `null` when it was not a
   * grouping key.
   */
  groupIndex?: number | null;
  /**
   * The column's place in the pivot order, or `null` when it was not a pivot
   * key.
   */
  pivotIndex?: number | null;
  /**
   * The named footer aggregate the column carried, or `null`. A total given as
   * a function has no name to save and is not recorded.
   */
  total?: TotalName | null;
  /** The group-subtotal override, when one differs from `total`. */
  groupTotal?: TotalName | null;
  /** The grand-total override, when one differs from `total`. */
  grandTotal?: TotalName | null;
  /**
   * The column's runtime decoration, present only when the
   * column carries one, so a `columns.decorate()` survives a saved view and
   * participates in undo/redo. Absent means "not recorded"; an explicit `null`
   * on an undo patch clears a decoration back to plain text.
   */
  decoration?: DecorationName | DecorationSpec | null;
  /** The variant set alongside the decoration, when one is present. */
  variant?: VariantSpec | null;
}

/**
 * A persisted banded-header node (§15): a band with a `columns`
 * list whose members are leaf ids or nested bands. This is what round-trips a
 * drag-created group through a saved view.
 */
export interface ColumnGroupState {
  /**
   * The band's identity, matching the `id` on the live band, so a restore
   * reattaches to the right one.
   */
  id: string;
  /** The band's heading at the time the state was taken. */
  title: string;
  /** Whether the band carried an open/close control. */
  collapsible: boolean;
  /** Whether the band opened by default. */
  openByDefault: boolean;
  /**
   * The band's children in order — a leaf column's id, or a nested band's own
   * state.
   */
  columns: Array<string | ColumnGroupState>;
}

/** How the quick filter's text is matched against a cell. */
export type QuickFilterMode = 'contains' | 'words' | 'fuzzy' | 'regex';
export interface GridState {
  /**
   * The state format this snapshot was written in. A snapshot from a newer
   * build is applied field by field with the unknown ones reported and
   * skipped, rather than refused.
   */
  version: number;
  /**
   * Each leaf column's width, visibility, pin, sort, grouping and total, in
   * display order.
   */
  columns?: ColumnState[];
  /**
   * The column ids in display order — the same order `columns` is in, held
   * separately so a restore can reorder without reading every entry.
   */
  columnOrder?: string[];
  /** The banded-header tree, when the grid has one. */
  columnGroups?: ColumnGroupState[];
  /**
   * The structured filter tree that was in force, or `null` when nothing was
   * filtered.
   */
  filters?: FilterSet;
  /**
   * The `where` predicates that were in force, as names only.
   * A predicate is host code: it cannot be serialised into a view or restored
   * from one. `apply` reconciles these against what the host has registered and
   * reports every name it cannot honour rather than restoring a view that
   * silently shows more rows than the one that was saved. Absent when none is
   * registered.
   */
  where?: string[];
  /** The quick-filter text. Absent when there was none. */
  quick?: string;
  /**
   * How the quick filter matched. Saved with the text and only when it is not
   * the default, because a view restored as `contains` when it was saved as
   * `words` or `regex` shows a different set of rows than the one it captured.
   */
  quickMode?: QuickFilterMode;
  /** The sort entries that were in force, outermost first. */
  sort?: SortEntry[];
  /** The ids of the columns the rows were grouped by, outermost first. */
  group?: string[];
  /** Whether the grid was in pivot mode, and the columns it pivoted on. */
  pivot?: { enabled: boolean; columns: string[] };
  /**
   * The pivot presentation's collapse state (§10): which
   * row-axis and column-axis nodes are collapsed. Absent when the matrix is
   * fully expanded, and tolerated as "expand all" when applied.
   */
  pivotView?: { rowsCollapsed: string[]; columnsCollapsed: string[] };
  /**
   * Every conditional-formatting rule, keyed by scope. Always present when the
   * grid has a formatting model — even empty — so that clearing every rule is
   * an action redo can reproduce.
   */
  formatting?: Record<string, FormattingRule[]>;
  /**
   * Durable annotation marks: seeded from here on first paint,
   * and written back by `getState` so a host can persist and restore them. In
   * content coordinates, so they track scroll and resize.
   */
  annotations?: AnnotationMark[];
  /**
   * The ids of the redacted columns. Always present when the grid has a
   * redaction model — even empty — so that "stop redacting" is an action redo
   * can reproduce.
   */
  redaction?: string[];
  /**
   * The ids of the columns whose histogram is open. Always present when the
   * grid has a facet model, for the same reason `redaction` is.
   */
  facets?: string[];
  /** The keys of the group and tree rows that were open. */
  expanded?: string[];
  /** The keys of the selected rows. */
  selection?: string[];
  /**
   * Where the body was scrolled to. Absent on a headless grid, which has no
   * scroll position worth saving.
   */
  scroll?: { top: number; left: number };
  /** The page being shown and its size. Absent when the grid does not page. */
  pagination?: { page: number; pageSize: number };
}

export interface StateApplyReport {
  /** The state keys that were restored, in application order. */
  applied: string[];
  /**
   * The keys that were not restored, each with a reason in words a host can show — `not an
   * array`, `unknown column`, `skipped by caller`, and so on. A partial restore is
   * reported, never thrown.
   */
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
 * What caused a `state:changed`.
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
  /**
   * What the operator compares against — the number, text, date or list the
   * rule tests for. Left out by operators that need no operand, such as
   * `blank`.
   */
  value?: unknown;
  /** The upper operand of a two-sided operator such as `between`. */
  value2?: unknown;
}

/** Where a colour or bar scale's bounds are derived from, when `min`/`max` are not given. */
export type ScaleFrom = 'minmax' | 'quantile' | 'stddev';
export interface FormattingScale {
  /**
   * Where the bounds come from when `min` and `max` are not given.
   * `'minmax'` spans the data, `'quantile'` spans `low` to `high`
   * (5th to 95th percentile by default), `'stddev'` spans `deviations`
   * either side of the mean.
   */
  from?: ScaleFrom;
  /** The value that takes the first colour. Required unless `from` derives it. */
  min?: number;
  /** The value that takes the last colour. Required unless `from` derives it. */
  max?: number;
  /**
   * The value the middle colour is reached at. Needs an odd number of
   * `colours` (a middle stop to pin) and a value inside `min`..`max`; each
   * half of the scale is then spaced evenly within itself, so only the pivot
   * moves. Without it the middle stop sits at the midpoint of the range.
   */
  mid?: number;
  /**
   * The lower percentile for `from: 'quantile'`, as a number from 0 to 100. 5
   * by default.
   */
  low?: number;
  /**
   * The upper percentile for `from: 'quantile'`, as a number from 0 to 100. 95
   * by default.
   */
  high?: number;
  /**
   * How many standard deviations either side of the mean `from: 'stddev'`
   * spans. 2 by default.
   */
  deviations?: number;
  /**
   * The colour stops, low to high; at least two are needed or the scale falls
   * back to a pale-to-blue pair. Three or more give a piecewise scale rather
   * than an averaged blend.
   */
  colours?: string[];
}

/**
 * An in-cell proportional bar. Drawn as a CSS gradient on the
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
  /** The value at which the bar is empty. Derived from the data when omitted. */
  min?: number;
  /** The value at which the bar is full. Derived from the data when omitted. */
  max?: number;
  /**
   * Where the bounds come from when `min` and `max` are not given: `'minmax'`
   * (the default) spans the data, `'quantile'` spans `low` to `high`,
   * `'stddev'` spans `deviations` either side of the mean. Derived once when
   * the rules compile and then held, so a bar does not move without its value
   * changing; `formatting.restat()` re-derives it.
   */
  from?: ScaleFrom;
  /** The lower percentile for `from: 'quantile'`, 0 to 100. 5 by default. */
  low?: number;
  /** The upper percentile for `from: 'quantile'`, 0 to 100. 95 by default. */
  high?: number;
  /**
   * How many standard deviations either side of the mean `from: 'stddev'`
   * spans. 2 by default.
   */
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
  direction?: Extract<Direction, 'ltr' | 'rtl'>;
}

/**
 * An icon set: a glyph placed beside the value by the band it
 * falls in. Drawn as a `background-image` with padding, so it too needs no extra
 * element and stays a plain style value.
 *
 * `set` names a built-in — `'arrows'`, `'trafficLights'` or `'ratings'` (see
 * {@link ICON_SETS}) — or supply your own ordered `icons` (SVG documents, data
 * URIs or `url(...)` values). Bands are split at `thresholds` (ascending, one
 * fewer than the icons); without them the column's distribution is cut into
 * equal-count bands. `reverse` flips the order so a high value can read as red.
 */
/** A built-in glyph set for an icon-set formatting rule. */
export type IconSetKind = 'arrows' | 'trafficLights' | 'ratings';
export interface IconSetSpec {
  /**
   * A built-in glyph set: `'arrows'`, `'trafficLights'` or `'ratings'`.
   * `'arrows'` when nothing else is given, and ignored when you supply your
   * own `icons`.
   */
  set?: IconSetKind | string;
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
  /**
   * The rule's identity, which `remove`, `update` and `move` accept in place
   * of an index. The grid fills one in (`rule-1`, `rule-2`) when you do not.
   */
  id?: string;
  /**
   * The condition the cell must meet for the rule's `style` to apply. A rule
   * with none of `when`, `scale`, `dataBar` or `iconSet` is refused, since it
   * could never match.
   */
  when?: FormattingCondition;
  /**
   * The style to apply when `when` holds — the same shape `cell.style` takes.
   * A function is allowed but cannot be saved: only plain objects survive a
   * saved view.
   */
  style?: CellStyle | ((p: CellParams) => CellStyle | null);
  /**
   * Colour the cell by where its value sits between two bounds. Two colours
   * give a gradient, three or more give a piecewise scale so a mid colour is
   * actually reached at the middle. Values outside the bounds clamp to the end
   * colours.
   */
  scale?: FormattingScale;
  /** An in-cell proportional bar. */
  dataBar?: DataBarSpec;
  /** A per-band glyph beside the value. */
  iconSet?: IconSetSpec;
  /**
   * Whether a match ends the evaluation. True by default, so an ordered list
   * reads top to bottom like a sentence; set it `false` to let a later rule
   * add to this one — bold from one, colour from another.
   */
  stopIfTrue?: boolean;
  /**
   * Turn the rule off without deleting it. On by default. The grid also
   * disables a distribution rule it could not resolve, rather than colouring
   * by a guess.
   */
  enabled?: boolean;
  /**
   * A human name for the rule, for your own panel to show. The grid stores it
   * and hands it back but never acts on it.
   */
  label?: string;
}

/** The built-in icon set names, id to label, for a panel to offer. */
export const ICON_SETS: Readonly<Record<string, string>>;

/** A column id, or `'*'` for every column. */
export type FormattingScope = string;

/** An interval for an estimated figure, at a stated level. */
export interface ConfidenceInterval {
  /** The sample mean the interval is centred on. */
  mean: number;
  /** The lower bound: the mean less the margin. */
  lower: number;
  /** The upper bound: the mean plus the margin. */
  upper: number;
  /**
   * Half the interval's width — the ± figure. Computed from the t distribution
   * rather than the normal one, which is materially too narrow below about
   * thirty readings.
   */
  margin: number;
  /**
   * How many readings it was computed from. Fewer than two gives no interval
   * at all: one reading is a number with no idea how wrong it is.
   */
  n: number;
  /** The level the bounds were computed at, 0 to 1. */
  confidence: number;
}

/** A Wilson score interval for a rate. Stays inside 0 to 1 at the extremes. */
export interface ProportionInterval {
  /** The observed share, successes over n. */
  proportion: number;
  /**
   * The lower bound, by the Wilson score method and never below 0 — the
   * textbook interval reaches below zero at a rate near zero.
   */
  lower: number;
  /**
   * The upper bound, never above 1. This is what "0 of 40 failed, so the rate
   * is under 9%" comes from: at zero successes the textbook interval collapses
   * to a point and claims certainty.
   */
  upper: number;
  /** The sample size. */
  n: number;
  /** The level the bounds were computed at, 0 to 1. 0.95 by default. */
  confidence: number;
}

/** An interval for a capability index, by Bissell's approximation. */
export interface CapabilityInterval {
  /**
   * The point estimate the interval is around — the Cpk or Ppk it was computed
   * for.
   */
  index: number;
  /**
   * The lower bound. This is the figure that matters: a Cpk of 1.35 from
   * thirty parts has a lower bound below 1, so "we passed 1.33" has not been
   * shown.
   */
  lower: number;
  /** The upper bound. */
  upper: number;
  /** Half the interval's width — the ± figure. */
  margin: number;
  /**
   * How many readings the index was computed from. Two or more, or there is no
   * interval.
   */
  n: number;
  /** The level the bounds were computed at, 0 to 1. 0.95 by default. */
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
   * the leaves for the grid to group in the browser.
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
  /**
   * What the engine behind this adapter can do — which filters, sorts,
   * aggregates and grouping it will take. The planner pushes only what is
   * declared here and runs the rest client-side.
   */
  capabilities?: PushdownCapabilities;
  /**
   * Run the part of the query the adapter declared it could handle.
   *
   * An adapter whose count is expensive may answer with `pendingTotal` instead
   * of `total`: the rows are delivered now and the promise
   * resolves with the same exact number when the count finishes. The source
   * publishes it then and fires `source:total`; until it does the grid reports
   * no total and `grid.rows.totalPending()` is `true`. It is opt-in per
   * adapter — one that returns `total` behaves exactly as it always has — and
   * `pendingTotal` is ignored when `total` is present, because a total that is
   * already here has nothing to wait for. The promise must resolve with the
   * exact count or `null`; it must never resolve with an estimate.
   */
  execute(query: RemoteRequest, request?: RemoteRequest):
    Promise<{ rows: unknown[]; total?: number; pendingTotal?: Promise<number | null> }>;
  /**
   * Answer one level of a grouped grid. Present only when
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
   * The row count before any filter — the denominator of
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
   * registered or the gate refused it.
   */
  residual: {
    filters: object | null;
    sort: SortEntry[] | null;
    quick: string;
    where: WhereRuntime | null;
    /**
     * Whether the rows the residual runs over are the whole matching set rather
     * than a fetched fraction. Set by the source when it hands
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
   * Whether the engine answered the grid's grouped view for this request. False for an ungrouped query and for a grouped one the
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
   * aggregates: which statistics the engine computed
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
 * Opt-in, sticky full-dataset pull for a pushdown/remote source. Off by default. When enabled, the source materialises the
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
 * Design-time aggregate-pushdown policy for a pushdown source. The developer chooses, at grid setup
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

/** How a pushed-down aggregate's engine result relates to the grid's own kernel. */
export type PushdownClass = 'identical' | 'may-differ' | 'fallback';
/** How one aggregate was routed, for `lastPlan()` provenance. */
export interface AggregateProvenance {
  /** The output column the aggregate fills. */
  id: string;
  /** The column being reduced. */
  col: string;
  /** The reduction asked for — `sum`, `avg`, `p95` and the rest. */
  fn: string;
  /** How the engine result relates to the grid kernel. */
  class: PushdownClass;
  /** Why it is client-side, when it is (config, fallback, or the guard). */
  reason?: string;
  /** The column supplying the weights, for a weighted reduction. */
  weight?: string;
  /** Parameters the statistic takes, carried through so an adapter emits the
   *  matching SQL (e.g. a trim share). */
  params?: Record<string, unknown>;
}

export interface PushdownSourceConfig {
  /**
   * The engine the query is pushed to — DuckDB, a SQL endpoint, anything that
   * declares what it can do and executes it.
   */
  adapter: PushdownAdapter;
  /** The compute barrel, for applying whatever the engine could not. */
  compute?: object;
  /** How many rows are fetched per block. 100 by default. */
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
   * `where` predicate as the residual. Defaults to `50_000`,
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

/**
 * Every anomaly-detection method the statistics surface offers, widest set:
 * the robust modified z-score and Tukey's IQR fences (static or rolling), and
 * multivariate Mahalanobis distance. A narrower site accepts a subset via
 * `Extract<OutlierMethod, …>` rather than minting a fourth named alias.
 */
export type OutlierMethod =
  'modifiedZScore' | 'iqr' | 'mahalanobis' | 'rollingModifiedZScore' | 'rollingIqr';
/** The rolling (windowed) anomaly methods alone, without the static ones. */
export type RollingOutlierMethod = 'rollingModifiedZScore' | 'rollingIqr';
/** Which control-chart rule family flags an out-of-control point. */
export type ControlChartRuleSet = 'westernElectric' | 'nelson';
/** Which statistic a confidence interval reads: a mean, or a proportion. */
export type SpcStatistic = 'mean' | 'proportion';
/** A forecasting kernel's method. */
export type ForecastMethod = 'movingAverage' | 'ses' | 'holt' | 'holtWinters' | 'linear';
export interface StatisticsApi {
  /**
   * One shadow value for one row, by the column it shadows and the kind. For
   * `kind: 'specStatus'`, `spec` carries the `{lower, upper, warnLower,
   * warnUpper}` limits to judge the row's value against; other kinds ignore it.
   */
  shadow(colId: string, kind: ShadowKind, rowKey: string,
    scope?: RowScope, spec?: object): unknown;
  /**
   * One regression shadow value for a row, by key: the
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
   * The rows that do not belong: anomaly detection over the
   * filtered rows by the robust modified z-score (`modifiedZScore`, the
   * default), Tukey's IQR fences (`iqr`), or multivariate Mahalanobis distance
   * over the chosen columns (`mahalanobis`). Every flagged row carries the score
   * behind it and the reason for it, so a flag is explainable rather than a
   * verdict from nowhere. Non-numeric columns are returned under `skipped`.
   */
  anomalies(opts?: { columns?: string[];
    method?: OutlierMethod;
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
   * size — never by a p-value. The generalisation of
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
   * data to interpret — never a verdict. The significance
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
   * families refuse. Null on degenerate input.
   */
  regressionModel(spec: RegressionSpec): RegressionModel | null;
  /**
   * The Augmented Dickey-Fuller stationarity test over the `of` series in
   * `orderBy` order, constant+trend form with the lag order
   * chosen by AIC up to an optional cap. Returns the statistic, the lag used,
   * MacKinnon's critical values, an approximate (interpolated) p-value and a
   * plain-language verdict at the 5% level — a scalar readout, not a column.
   */
  adf(spec: { of: string; orderBy: string; maxlag?: number }): AdfResult | null;
  /**
   * The autocorrelation (ACF) and partial autocorrelation (PACF) of the `of`
   * series in `orderBy` order out to `maxlag`, with the
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
    rules?: ControlChartRuleSet;
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
    kind?: SpcStatistic;
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
   * Forecast one column forward: the stats-surface face of the
   * {@link forecast} kernel. The column is read over the filtered rows in arrival
   * order, or ordered by `opts.by` (a date or numeric column, as {@link series}
   * orders) when the time axis matters, then projected `opts.horizon` steps ahead
   * by `opts.method` (default `linear`) with a prediction band where one applies.
   * Every kernel option passes through; returns the same {@link ForecastResult},
   * or null when the column is unknown or too short.
   */
  forecast(colId: string, opts?: {
    method?: ForecastMethod;
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
   * A windowed aggregate — "the average lately" — over one
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
    kind: WindowKind;
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

/** How an approximate reduction's error bound holds: every run, in expectation, or to rounding. */
export type ErrorBoundKind = 'deterministic' | 'probabilistic' | 'exact';
/** What an error bound's value measures. */
export type ErrorBoundMetric = 'absolute' | 'relative' | 'rank' | 'none';
/** How an approximate reduction's error bound holds, and what it measures. */
export interface ErrorBound {
  /** `deterministic` every run, `probabilistic` in expectation, `exact` to float rounding. */
  kind: ErrorBoundKind;
  /** What the number measures. `rank` is a fraction of the rank, for quantiles. */
  metric: ErrorBoundMetric;
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

/** Whether a kernel's exact tier is maintained incrementally, or rescans. */
export type MaintenanceExactness = 'maintained' | 'rescan';
/** The maintenance label for one kernel across both tiers. */
export interface MaintenanceTier {
  /** The kernel name. */
  stat: string;
  /** Its exact tier, or null when it is not an exact kernel. */
  exact: MaintenanceExactness | null;
  /** The approximate alternative and bound, or null when none exists. */
  approximate: ApproximateEntry | null;
}

/** The window a windowed aggregate was computed over. */
export interface WindowSpec {
  /** Which window: last N ticks, last N ms, or the session. */
  kind: WindowKind;
  /** The size: N ticks, N ms, or the session duration in ms. */
  span: number;
  /** How many values actually fell inside the window. */
  size: number;
}

/** The three window kinds a caller may ask for. */
export const WINDOW_KINDS: readonly ('count' | 'time' | 'session')[];

/**
 * A sliding window over a stream of timestamped values. Holds
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
 * The anomaly-detection methods: the robust univariate
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
 * The rolling (windowed) anomaly methods: the robust modified
 * z-score and Tukey's IQR fences, each computed over a trailing window rather
 * than the whole series, for live monitoring where a drift or a shifted regime
 * must not poison a global baseline.
 */
export const ROLLING_ANOMALY_METHODS: readonly ('rollingModifiedZScore' | 'rollingIqr')[];

/**
 * Rolling (windowed) anomaly detection: judge every reading
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
    method?: RollingOutlierMethod;
    windowLen?: number; threshold?: number; k?: number; minPeriods?: number;
  },
): { method: string; windowLen: number; minPeriods: number; threshold: number; k: number;
  scores: (number | null)[]; flags: boolean[]; flagged: number };

/**
 * Build a Data Router alert condition from an anomaly detector:
 * a `(rows) => signal` for the router's existing `router.alert(value, condition,
 * handler)`, so live monitoring reuses the router's
 * partitioning, debounce and rising-edge re-arm rather than duplicating any of
 * it. Reads one numeric `field` off each row, runs the chosen detector, and
 * returns the flagged rows and scores when anything is anomalous or `false` when
 * nothing is. `orderBy` names the axis rolling methods window on; `latest` signals
 * only when the newest reading is the anomaly.
 */
export function anomalyCondition(
  opts: {
    field: string;
    method?: Extract<OutlierMethod, 'modifiedZScore' | 'iqr' | 'rollingModifiedZScore' | 'rollingIqr'>;
    orderBy?: string; latest?: boolean;
    windowLen?: number; threshold?: number; k?: number; minPeriods?: number;
  },
): (rows: Iterable<Record<string, unknown>>) =>
  false | { method: string; field: string; flagged: { row: Record<string, unknown>; score: number | null }[] };

/**
 * The forecasting methods a caller may ask for, named so a
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
  method: ForecastMethod;
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
 * Forecast an ordered series `horizon` steps into the future.
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
    method?: ForecastMethod;
    horizon?: number; confidence?: number; windowLen?: number;
    alpha?: number; beta?: number; gamma?: number; period?: number;
  },
): ForecastResult | null;

/**
 * What a shadow column computes about a value the grid is tracking: how it has
 * changed (updates, delta, rate, streak), when it last changed, where it sits
 * among the other rows (rank, percentile, share of total), or how unusual it
 * is. A shadow column sorts, filters, groups and exports like any other.
 */
export type ShadowKind =
  | 'updates' | 'updatedAt' | 'sinceUpdate' | 'delta' | 'deltaPercent'
  | 'rate' | 'history' | 'firstValue' | 'streak'
  /** Where the row sits among the others, over every tracked row. */
  | 'rank' | 'rankAsc' | 'rankChange' | 'percentile' | 'quartile'
  | 'zScore' | 'shareOfTotal'
  /**
   * A robust outlier score and flag per row: the modified
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
   * Rolling time-series aggregates over a stated `orderBy` (Phase 1), computed in one ordered pass the grid caches by row key and never
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
   * A rolling quantile over the `orderBy` window — a trailing
   * median or p95, the quantile set by `q`. Exact while the window is small;
   * past an internal span cap, and for a session window, it comes from a KLL
   * sketch and `windowApproximate` reports which rows are approximate, so a
   * sketched quantile is never presented as exact.
   */
  | 'rollingQuantile' | 'windowApproximate'
  /**
   * Classical seasonal decomposition over a declared `period`,
   * matching `statsmodels.seasonal_decompose`: `tsTrend` is the centred
   * moving-average trend, `tsSeasonal` the repeating seasonal index, `tsResidual`
   * what the two leave behind, and `tsCoverage` the stamp (1 for an interior row,
   * 0 for a partial edge where the centred window runs off the end, so an edge is
   * never emitted as full). Additive by default; `decomposition: 'multiplicative'`
   * is a declared option, undefined on a non-positive series.
   */
  | 'tsTrend' | 'tsSeasonal' | 'tsResidual' | 'tsCoverage'
  /**
   * Exponential smoothing over the `orderBy` series:
   * `tsSmoothed` is the fitted level from single exponential smoothing (`ses`) or
   * Holt's level+trend (`holt`) — the signal with the noise removed, not a
   * forecast. The smoothing factor(s) are caller-set or fit by minimising
   * in-sample SSE, and reported by the `tsSmoothingAlpha` / `tsSmoothingBeta`
   * companion columns. Holt-Winters (seasonal) smoothing is deferred; seasonality
   * is covered by decomposition.
   */
  | 'tsSmoothed' | 'tsSmoothingAlpha' | 'tsSmoothingBeta'
  /**
   * Model-backed regression shadows: the predicted value, the
   * residual, and a Cook's-distance influence flag for the row, read from the
   * fitted model named on the shadow declaration (`shadow: { kind:
   * 'fitResidual', model: { predictors, response, method } }`). They follow the
   * grid's filters — the model refits over the filtered rows — and are
   * sortable, filterable, groupable and exportable like any cell. Null for a row
   * outside the fit. `fitInfluence` flags Cook's D > 4/n by default (overridable
   * via `threshold`); "not influential" (`false`) and "cannot tell" (`null`)
   * stay distinct.
   *
   * `fitStdResidual`, `fitLeverage` and `fitCooksD` surface
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
  /** The fitted slope: how much the response moves per unit of the predictor. */
  slope: number;
  /** The fitted response where the predictor is zero. */
  intercept: number;
  /** The square of Pearson's r: how much of the response the fit accounts for. */
  r2: number;
  /** Standard error of the slope, which is what says it differs from zero. */
  stdError: number;
  /** Pairs that survived pairwise deletion, not rows scanned. */
  n: number;
}

/** The specification of a multi-predictor model. */
export interface RegressionSpec {
  /** The predictor column ids. */
  predictors: string[];
  /** The response column id. */
  response: string;
  /** `ols` (default), `wls` or `robust`. `quantile` is reserved (coming next). */
  method?: RegressionMethod;
  /** A weights column id, required for `wls`. */
  weights?: string;
  /** The confidence level for the band; 0.95 by default. */
  confidence?: number;
}

/** One fitted coefficient, with the uncertainty around it. */
export interface RegressionCoefficient {
  /** `(intercept)` or the predictor's column id. */
  name: string;
  /** The fitted coefficient itself. */
  estimate: number;
  /**
   * The standard error of the estimate — the square root of the coefficient's variance,
   * from the residual variance and the design matrix.
   */
  stdError: number;
  /** estimate ÷ standard error. */
  t: number;
  /** Two-sided Student-t p-value; a number with a documented method, not a verdict. */
  p: number;
  /**
   * The Wald confidence interval at the model's confidence level
   * — the whiskers a coefficient forest plot draws. Null when
   * there is no residual degree of freedom to form a critical value.
   */
  lower: number | null;
  /** The top of the Wald interval, null on the same terms as `lower`. */
  upper: number | null;
}

/** A pointwise confidence band for the mean response of a single-predictor fit. */
export interface RegressionBand {
  /** The level the band was computed at — the model's `confidence`, 0.95 by default. */
  confidence: number;
  /**
   * One point per fitted row, in ascending predictor order: the predictor value, the fitted
   * response, and the band's lower and upper edges at that point.
   */
  points: { x: number; yhat: number; lower: number; upper: number }[];
}

/** The Breusch–Pagan heteroscedasticity test result. */
export interface Heteroscedasticity {
  /**
   * The test statistic, distributed as chi-square under the null of constant
   * variance.
   */
  statistic: number;
  /**
   * The degrees of freedom the statistic is judged against — one per
   * predictor.
   */
  df: number;
  /**
   * The probability of a statistic this large if the residual variance really
   * were constant. Small means it is not, so the model's standard errors
   * understate the uncertainty.
   */
  p: number;
  /** True when the test rejects homoscedasticity at the 0.05 level. */
  heteroscedastic: boolean;
}

/** The Augmented Dickey-Fuller stationarity test result. */
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

/** Autocorrelation (ACF) and partial autocorrelation (PACF) arrays. */
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

/** A fitted multi-predictor linear model and its diagnostics. */
export interface RegressionModel {
  /** Which fit produced the model: `ols`, `wls` or `robust`. */
  method: string;
  /**
   * The fitted coefficients, the intercept first, then one per predictor in the order
   * given.
   */
  coefficients: RegressionCoefficient[];
  /**
   * The share of the response's variance the model accounts for, clamped to 0..1 — weighted
   * for a weighted fit. 1 when the response has no variance at all.
   */
  r2: number;
  /**
   * R² penalised for the number of predictors, so adding a predictor that earns nothing
   * lowers it.
   */
  adjR2: number;
  /**
   * How many rows the fit used. A row missing the response, any predictor, or (for a
   * weighted fit) a positive weight is left out of the fit. Fewer rows than coefficients
   * gives no model at all rather than a fitted one.
   */
  n: number;
  /** Residual degrees of freedom, n − p. */
  df: number;
  /** Residual variance, RSS ÷ df. */
  sigma2: number;
  /** The model's prediction for each row used, in the order of `rows`. */
  fitted: number[];
  /** Observed minus fitted for each row used — what the model did not explain. */
  residuals: number[];
  /** Hat-diagonal leverage per row. */
  leverage: number[];
  /** Cook's distance per row; null where it cannot be computed. */
  cooksD: (number | null)[];
  /** Variance-inflation factor per predictor; Infinity when exactly collinear. */
  vif: number[];
  /**
   * The Breusch-Pagan test of whether the residual spread depends on the predictors. Null
   * when the auxiliary regression could not be fitted.
   */
  heteroscedasticity: Heteroscedasticity | null;
  /**
   * The pointwise confidence band for the mean response. Present only for a
   * single-predictor fit — the charted fit-line case — and null otherwise.
   */
  band: RegressionBand | null;
  /** Per-row weights actually used (robust/WLS), or null for OLS. */
  weights: number[] | null;
  /** The predictor column ids the model was fitted on, in the order the coefficients follow. */
  predictors: string[];
  /** The column id the model predicts. */
  response: string;
  /** The physical rows the diagnostics are aligned to, in order. */
  rows: number[];
}

export interface ProcessCapability {
  /**
   * How many readings the study covers. At least two are needed, and a study
   * this small should be read with the confidence interval beside it.
   */
  n: number;
  /**
   * Where the process is actually centred, which is what separates Cp from
   * Cpk.
   */
  mean: number;
  /**
   * The lower specification limit in force, or `null` for a one-sided
   * specification. It is the customer's requirement, not the process's
   * behaviour.
   */
  lower: number | null;
  /**
   * The upper specification limit in force, or `null` for a one-sided
   * specification.
   */
  upper: number | null;
  /**
   * The nominal value the process aims at, when one was declared. `null`
   * otherwise.
   */
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
  /**
   * How many readings fell outside the specification — the count the indices
   * only imply.
   */
  outOfSpec: number;
  /**
   * The share of readings outside the specification, as a fraction. The figure
   * a customer asks for.
   */
  defectRate: number | null;
  /** Three sigma either side of the process mean, from the moving range. */
  limits: { centre: number; upper: number; lower: number; sigma: number } | null;
  /** How many leading readings set the limits. */
  baseline?: number;
  /** Which rule set `violations` were judged against, they number differently. */
  ruleSet?: ControlChartRuleSet;
  /**
   * Each point the control rules flagged, with its index, the rule number and
   * what the rule says. Judged against limits from the baseline period, so a
   * step change shows as a run rather than flagging everything. Read `ruleSet`
   * alongside — the two rule sets number their rules differently.
   */
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
  /**
   * How many readings the summary was computed over. At least two are needed
   * or there is no sequence to describe and `null` comes back instead.
   */
  n: number;
  /** The reading the series opens with, in the ordering `by` imposed. */
  first: number;
  /** The reading the series ends with, in the same ordering. */
  last: number;
  /** Last minus first, in the column's own units. */
  change: number;
  /**
   * The same change as a percentage of the first reading's magnitude. `null`
   * when the series starts at zero, which has no percentage.
   */
  changePercent: number | null;
  /** Standard deviation of period-on-period returns. */
  volatility: number | null;
  /** The same, times the root of `periodsPerYear`; null unless one was given. */
  annualisedVolatility: number | null;
  /** Compound growth per period, annualised when `periodsPerYear` is given. */
  growth: number | null;
  /** The largest peak-to-trough fall, as a fraction. */
  maxDrawdown: number | null;
  /** The index of the peak the largest fall started from. */
  maxDrawdownFrom: number;
  /** The index of the trough the largest fall ended at. */
  maxDrawdownTo: number;
  /** Lag-1: positive is momentum, negative is mean reversion. */
  autocorrelation: number | null;
  /**
   * How many period-on-period moves were upward. A period whose previous
   * reading was zero has no return and counts in neither.
   */
  upDays: number;
  /** How many period-on-period moves were downward. */
  downDays: number;
}

export interface ColumnProfile {
  /** The id of the column this profile describes. */
  column: string;
  /**
   * How many rows the profile was computed over — the rows the filters leave,
   * or the window the source is holding.
   */
  rows: number;
  /**
   * How many of those rows carry a value. Counted as values, not as numbers,
   * so a text column is not reported as entirely missing.
   */
  present: number;
  /**
   * How many of those rows are null, undefined or empty — the first question a
   * profile is opened to answer.
   */
  missing: number;
  /**
   * How many of those rows carry a value the statistics could use — a number.
   * `present` counts values of any kind, so the two differ on a text column
   * and on one with unparseable entries.
   */
  numeric: number;
  /**
   * What the figures were computed over, when that is a window rather than
   * every matching row (a source that holds everything omits it, so
   * `if (profile.coverage)` is the "is this windowed" test).
   */
  coverage?: { covered: number; total: number };
  /** How many different values the column holds over those rows. */
  distinct: number;
  /** The smallest numeric value, or null on a column with no numbers in it. */
  min: number | null;
  /** The largest numeric value, or null on a column with no numbers in it. */
  max: number | null;
  /** The arithmetic mean of the numeric values, or null when there are none. */
  mean: number | null;
  /**
   * The middle value, which says whether the mean is representative. Null when
   * there are no numbers.
   */
  median: number | null;
  /**
   * The first quartile — a quarter of the values fall below it. Null when
   * there are no numbers.
   */
  q1: number | null;
  /**
   * The third quartile — three quarters of the values fall below it. Null when
   * there are no numbers.
   */
  q3: number | null;
  /**
   * The interquartile range, `q3 - q1`: the spread of the middle half, which
   * outliers cannot inflate. Null when there are no numbers.
   */
  iqr: number | null;
  /**
   * The sample standard deviation, needing at least two numbers; null
   * otherwise.
   */
  stddev: number | null;
  /**
   * How many values fall outside Tukey's fence, 1.5 interquartile ranges
   * beyond the quartiles — an outlier here means what it means on a box plot.
   */
  outliers: number;
  /**
   * The shape rather than the summary: the value counts per bucket. Two
   * columns can share a mean, a median and a deviation and still be a bell and
   * a barbell. Empty on a column with no numbers.
   */
  histogram: HistogramBin[];
  /**
   * For a categorical (non-numeric) column, the commonest values, largest
   * first. Absent for a numeric column, whose shape the
   * numeric figures and the histogram already carry.
   */
  topValues?: TopValue[];
}

export interface HistogramBin {
  /**
   * The bin's lower edge. The first bin reports the column's true minimum, which may be
   * below where the bins were laid, because values beyond the fences are clamped into the
   * end bins.
   */
  from: number;
  /**
   * The bin's upper edge, exclusive except in the last bin, which reports the column's true
   * maximum for the same reason.
   */
  to: number;
  /**
   * How many values fell in the bin. The end bins include everything clamped in from beyond
   * the fences, which is why an outlier shows as a bump rather than a hundred empty bars.
   */
  count: number;
}

/** One row of a categorical column's top-values table. */
export interface TopValue {
  /** The value itself, as it is stored. */
  value: unknown;
  /** How many present rows carry it. */
  count: number;
  /** Its share of the present values, 0 to 1. */
  share: number;
}

/**
 * Every effect-size measure the difference surface reports, widest set: the two
 * families' numeric measures (subset-vs-population, and dataset-vs-dataset) plus
 * the categorical one both share. A single comparison site reports only the
 * member(s) its own family can produce, via `Extract<DriftMeasure, …>`.
 */
export type DriftMeasure =
  'standardizedMeanDifference' | 'pooledStandardMeanDifference' | 'categoricalTotalVariation';
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
  measure: Extract<DriftMeasure, 'standardizedMeanDifference' | 'categoricalTotalVariation'>;
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

/** The subset-vs-population ranking. */
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
  method?: Extract<OutlierMethod, 'modifiedZScore' | 'iqr'>;
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
  method: Extract<OutlierMethod, 'modifiedZScore' | 'iqr' | 'mahalanobis'>;
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
  measure: Extract<DriftMeasure, 'pooledStandardMeanDifference' | 'categoricalTotalVariation'>;
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

/** Which two-sample significance test is used, or `auto` to pick by column family. */
export type SignificanceTest = 'auto' | 'welch' | 'mannWhitney' | 'chiSquare';
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
  test?: SignificanceTest;
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
  /**
   * The lower bound of the difference. An interval spanning zero is the honest
   * way to say the two groups may not differ at all.
   */
  lower: number;
  /** The upper bound of the difference. */
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
/** Whether a two-sample test was chosen automatically, or forced by the caller. */
export type TestSelection = 'auto' | 'override';
export interface GroupComparison {
  /** The test used, named so it is never hidden. */
  test: Extract<SignificanceTest, 'welch' | 'mannWhitney' | 'chiSquare'>;
  /** Whether the test was chosen automatically or forced by the caller. */
  chosenBy: TestSelection;
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
  /**
   * The rules for one scope in evaluation order — a column id, or `'*'` for
   * the rules that apply to every column. Copies, so editing them changes
   * nothing.
   */
  list(scope?: FormattingScope): FormattingRule[];
  /**
   * Every rule keyed by scope: the shape a saved view carries and undo
   * restores. Plain JSON, which is why a rule whose `style` is a function
   * cannot live here.
   */
  all(): Record<FormattingScope, FormattingRule[]>;
  /** Every scope that currently holds at least one rule. */
  scopes(): FormattingScope[];
  /**
   * Add a rule to a scope and repaint. Returns the stored rule with its id
   * filled in, or `null` when the rule has no `when`, `scale`, `dataBar` or
   * `iconSet` and so could never match. `at` inserts at a position instead of
   * appending; order is meaning, since the first match wins.
   */
  add(scope: FormattingScope, rule: FormattingRule, opts?: { at?: number }): FormattingRule | null;
  /** Remove a rule by its id or its index. `false` when there is no such rule. */
  remove(scope: FormattingScope, which: string | number): boolean;
  /**
   * Change a rule's fields in place, leaving its identity and its position
   * alone — an `id` in the patch is ignored. Returns the updated rule, or
   * `null` when there is no such rule.
   */
  update(scope: FormattingScope, which: string | number, patch: FormattingRule): FormattingRule | null;
  /**
   * Reorder a rule within its scope. Order is meaning — the first matching
   * rule wins — so a move can change which colour a cell takes. `false` when
   * it did not move.
   */
  move(scope: FormattingScope, which: string | number, to: number): boolean;
  /**
   * Replace every rule in one scope at once, dropping any that could never
   * match. Returns the stored rules.
   */
  set(scope: FormattingScope, rules: FormattingRule[]): FormattingRule[];
  /**
   * Replace the whole store, scope by scope, as `all()` produced it. What a
   * state restore and undo use.
   */
  replaceAll(rules: Record<FormattingScope, FormattingRule[]>): void;
  /** Remove every rule in one scope, or in all of them when no scope is named. */
  clear(scope?: FormattingScope): void;
  /**
   * The style one value would take from the runtime rules alone, for painting
   * outside the grid — a server-side export, a preview. `null` when nothing
   * matches.
   */
  styleFor(colId: string, value: unknown): CellStyle | null;
  /** Re-derive the thresholds of distribution rules from the data as it stands. */
  restat(): void;
  /** The five numbers a distribution rule resolves against for one column. */
  distribution(colId: string): ColumnDistribution | null;
}

/** One recorded validation error. */
export interface ValidationError {
  /** The key of the row holding the invalid cell. */
  key: string;
  /** The column holding the invalid cell. */
  colId: string;
  /**
   * Which rule failed — `required`, `min`, `pattern` and so on — so a host can
   * react to the kind of failure rather than parsing its wording.
   */
  code: string;
  /**
   * The message shown against the cell: the rule's own `messages` entry, the
   * spec-wide `message`, or the built-in English default for that rule.
   */
  message: string;
}

/** The runtime face of declarative column validation. */
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
  /**
   * How many usable numbers the column yielded. Dates count, as their epoch
   * milliseconds; nulls and unparseable values do not.
   */
  n: number;
  /** The smallest usable value in the column. */
  min: number;
  /** The largest usable value in the column. */
  max: number;
  /**
   * The arithmetic mean, accumulated by Welford's method so a column of large
   * values with a small spread keeps its precision.
   */
  mean: number;
  /**
   * The sample standard deviation, which `from: 'stddev'` scales against. Zero
   * when there is only one value.
   */
  stddev: number;
  /**
   * The middle value, by the same quantile definition the totals row and the
   * formula engine use.
   */
  median: number;
  /**
   * The first quartile, which `bottomPercent` and outlier rules resolve
   * against.
   */
  q1: number;
  /** The third quartile, which `topPercent` and outlier rules resolve against. */
  q3: number;
  /** The interquartile range, `q3 - q1`. */
  iqr: number;
  /** Every usable value, ascending — what a percentile threshold is read from. */
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
  /** The grid has finished building and every API on it is ready to call; fires once, on the frame after `createGrid` returns. */
  | 'ready'
  /** `grid.destroy()` was called and is about to release everything, so a handler can still read the grid one last time. */
  | 'destroy'
  /** The renderer has written its first frame into the host element. */
  | 'render:first'
  /** A render pass has finished writing cells: the row window it drew, what caused the pass, and how long each phase took. */
  | 'render:done'
  /** A configuration key was written at run time through `grid.set(key, value)` or `grid.setAll(values)`, after the grid rebuilt. */
  | 'config:changed'
  /** A licence key was installed through `grid.licence.set(key)`, and again when its asynchronous verification settles. */
  | 'licence:changed'
  /* Data */
  /** The display model was rebuilt — rows reloaded, the tree re-flattened, a page fetched, a query re-run — with `reason` naming which. */
  | 'model:changed'
  /** Rows were added, updated, removed or moved. `identified: true` means the payload names exactly which rows moved. */
  | 'rows:changed'
  /** A change arrived while the feed was being batched and was put on the queue instead of applied. */
  | 'rows:queued'
  /** A flush ran out of its frame budget and carried the rest of the change into the next one. */
  | 'rows:deferred'
  /** `grid.changes.pause()` held the feed: changes keep arriving and stop being applied. */
  | 'rows:paused'
  /** `grid.changes.resume()` released the feed and applied what had been held. */
  | 'rows:resumed'
  /** A row dragged from another grid was accepted into this one, on the receiving grid. */
  | 'row:received'
  /** A row was dragged out of this grid into another one and removed from here (a move, not a copy). */
  | 'row:sent'
  /** A row was dragged out of this grid into another one and kept here as well (a copy). */
  | 'row:copied'
  /** A row was reordered within this grid, from one display index to another. */
  | 'row:moved'
  /** A source could not fetch what was asked of it: a page, a group's children, a tree branch, or the stream itself. */
  | 'source:error'
  /** A source that delivered its rows before counting them has finished counting; the exact total is in the payload. */
  | 'source:total'
  /** A streaming source applied a chunk of arriving rows. */
  | 'stream:chunk'
  /** A streaming source reached the end of its feed; `promoted` says whether it handed over to an in-memory source. */
  | 'stream:end'
  /** A rolling-window stream dropped rows off the back of its window to stay inside its limit. */
  | 'stream:evicted'
  /* The row-drag gesture as it happens. Notifications only:
   * the drop is already vetoable by `beforeRowMove` and `beforeRowReceive`, and
   * a third veto on the same gesture would be a fourth place to look. All four
   * fire on the grid the drag started in and carry a {@link RowDragEvent}. */
  /** A row drag passed the drag threshold and began, on the grid the row was picked up in. */
  | 'rowDrag:started'
  /** The pointer moved during a row drag, coalesced to one event per animation frame. */
  | 'rowDrag:moved'
  /** The pointer left a grid it had been dragging over; `over` names the grid just left. */
  | 'rowDrag:left'
  /** The row drag ended — released anywhere, inside a grid or outside every one; `dropped` says whether it is being acted on. */
  | 'rowDrag:ended'
  /* Cells and editing */
  /** A cell's value was written: by an edit commit, by a revert, or by an undo/redo step. */
  | 'cell:changed'
  /** An optimistic cell edit was sent to the transport and is awaiting the server's answer. */
  | 'cell:pending'
  /** The server accepted a pending cell edit; `value` is what it confirmed, which may not be what was sent. */
  | 'cell:confirmed'
  /** A pending cell edit was refused and the previous value put back. */
  | 'cell:reverted'
  /** The server accepted a pending cell edit but returned a row that disagrees with what the grid holds. */
  | 'cell:conflict'
  /** A cell was clicked (primary button, single click). */
  | 'cell:clicked'
  /** A cell was double-clicked. */
  | 'cell:dblclicked'
  /** A context menu was requested on a cell, by the pointer or by the keyboard's menu key. */
  | 'cell:contextmenu'
  /* The pointer entering and leaving a cell. Announcements
   * only, carrying what `cell:clicked` carries plus the cell element as
   * `target`. A host cannot wire these itself: rows and cells are pooled and
   * re-used as the grid scrolls, so a listener bound to a cell node fires for
   * whichever row occupies it next. Nothing in the grid is gated on hover, so
   * a keyboard user reaches everything a pointer does. */
  /** The pointer entered a cell; crossing between two children of one cell is not a re-entry. */
  | 'cell:mouseover'
  /** The pointer left a cell; crossing between two children of one cell is not a departure. */
  | 'cell:mouseout'
  /* A pointer press and release on a cell, the same
   * convention as the hover pair above: announcements only, carrying what
   * `cell:clicked` carries plus the cell element as `target`. A host cannot
   * wire these itself for the same reason it cannot wire the hover pair —
   * rows and cells are pooled and re-used as the grid scrolls, so a listener
   * bound to a cell node fires for whichever row occupies it next. */
  /** A pointer button was pressed on a cell, before any click is resolved. */
  | 'cell:mousedown'
  /** A pointer button was released on a cell. */
  | 'cell:mouseup'
  /** A cell editor opened, by double-click, by Enter, or by typing into the cell. */
  | 'cell:edit:start'
  /** A cell editor closed: committed, cancelled, or refused by validation — `valid` and `cancelled` say which. */
  | 'cell:edit:end'
  /** A whole-row editor opened, the row-edit counterpart of `cell:edit:start`. */
  | 'row:edit:start'
  /** A whole-row editor closed, the row-edit counterpart of `cell:edit:end`. */
  | 'row:edit:end'
  /** A row was clicked, alongside the `cell:clicked` for the cell under the pointer. */
  | 'row:clicked'
  /** A row was double-clicked, alongside the `cell:dblclicked` for the cell under the pointer. */
  | 'row:dblclicked'
  /** An optimistic row append or delete was sent to the transport and is awaiting the server's answer. */
  | 'row:pending'
  /** The server accepted a pending row append or delete; an append is rekeyed from its temporary key first. */
  | 'row:confirmed'
  /** A pending row append or delete was refused: the optimistic append is discarded, the tombstoned row restored. */
  | 'row:reverted'
  /** The server accepted a pending row append or delete but returned a row that disagrees with what the grid holds. */
  | 'row:conflict'
  /** The row form opened over a row. */
  | 'form:opened'
  /** The row form was closed without saving. */
  | 'form:closed'
  /** The row form's values were saved back to the row. */
  | 'form:saved'
  /** The row form could not load or save a row; `timedOut` distinguishes a slow backend from a refusal. */
  | 'form:error'
  /* Query */
  /** The sort order changed, through `grid.sort.set()` or a header click. */
  | 'sort:changed'
  /** The filters changed: a structured condition, the quick filter's text, or a named host predicate. */
  | 'filter:changed'
  /** A group row was expanded or collapsed — one group, one branch, or all of them at once. */
  | 'group:toggled'
  /** A column's facet buckets finished computing, with how long it took and whether a worker did it. */
  | 'facet:computed'
  /** A facet histogram was used to filter its column, or that filter was cleared. */
  | 'facet:filtered'
  /** A facet panel section was opened or closed. */
  | 'facet:expanded'
  /** A column's facet buckets could not be computed. */
  | 'facet:failed'
  /* Columns */
  /** A column was moved to a different display position. */
  | 'column:moved'
  /** A column's width changed, by a header drag or by `grid.columns.resize()`. */
  | 'column:resized'
  /** Columns were shown or hidden. */
  | 'column:visible'
  /** A column was pinned to a side, or unpinned. */
  | 'column:pinned'
  /** The row grouping changed: which columns the rows are grouped by. */
  | 'column:grouped'
  /** The pivot changed: which columns the rows are pivoted by, locally or pushed down to the backend. */
  | 'column:pivoted'
  /** The header's filter affordance was activated and the column's filter popup should open. */
  | 'column:filter:open'
  /** The column menu's profile item was activated and the column's profile should open. */
  | 'column:profile:open'
  /** The header's menu affordance was activated and the column menu should open. */
  | 'column:menu:open'
  /** A pivot measure cell was drilled into; the payload names the row and column paths behind it. */
  | 'pivot:drill'
  /** The column set changed other than by moving, resizing, hiding or pinning — a type inference pass rewrote it. */
  | 'columns:changed'
  /** `grid.columns.showTagged()` chose which columns to show from their tags. */
  | 'columns:tagged'
  /** A banded header group was formed, renamed, moved, dissolved, removed or restored from state. */
  | 'columngroup:changed'
  /** A context menu was requested on a column header. */
  | 'header:contextmenu'
  /* Selection and view */
  /** The row selection changed and was accepted (a `beforeSelect` veto raises `selection:cancelled` instead). */
  | 'selection:changed'
  /** The selected cell ranges changed. */
  | 'range:changed'
  /** A copy to the clipboard was attempted; `ok` says whether it reached the clipboard. */
  | 'clipboard:copy'
  /** The page or the page size changed. */
  | 'page:changed'
  /** The viewport scrolled to a new offset; fires only when the offset actually moved, not on a refresh. */
  | 'scroll'
  /** Scrolling settled: the last of a scroll gesture's frames has been drawn. */
  | 'scroll:end'
  /** The host element's box changed size, as reported by the `ResizeObserver` the grid watches it with. */
  | 'size:changed'
  /** A master-detail region was opened or closed. */
  | 'detail:toggled'
  /** The keyboard asked for focus to move to the tool panel (Ctrl+Alt+P). */
  | 'toolpanel:focus'
  /** The set of host-declared highlights changed. */
  | 'highlight:changed'
  /** The find bar's query, open state or match count changed. */
  | 'find:changed'
  /* Tree data */
  /** A tree branch was expanded and `tree.loadChildren` was called for it. */
  | 'tree:loading'
  /** A tree branch's children arrived and were added. */
  | 'tree:loaded'
  /** A tree branch's `loadChildren` rejected; the branch is left unloaded so it can be retried. */
  | 'tree:loadFailed'
  /** A tree branch was collapsed before its children arrived, so the fetch was abandoned. */
  | 'tree:loadAborted'
  /* State, history and views */
  /** One logical state change — a gesture, an apply, an undo or a reset — announced once, whatever routed it. */
  | 'state:changed'
  /** `grid.state.reset()` restored the arrangement the grid was built with. */
  | 'state:reset'
  /** The undo/redo stacks moved: what can now be undone or redone. */
  | 'history:changed'
  /** An undo or redo step was applied. */
  | 'history:applied'
  /** The saved-view list changed, for any reason; the named `view:*` events say which view moved. */
  | 'views:changed'
  /** A saved view was applied to the grid. */
  | 'view:applied'
  /** A saved view was created, updated or imported. */
  | 'view:saved'
  /** A saved view was deleted. */
  | 'view:removed'
  /** A saved view was renamed. */
  | 'view:renamed'
  /** A saved view was made the default one. */
  | 'view:default'
  /* Validation: a declared column rule vetoed an edit, or a
   * recorded error was cleared. The veto itself rides the cancellable `beforeEdit`. */
  /** A declared column rule refused an edit; the failures name the column and the message for each. */
  | 'validation:failed'
  /** Recorded validation errors were cleared — for one cell, one row, or the whole grid. */
  | 'validation:cleared'
  /* Formatting and presentation */
  /** A conditional-formatting rule was added, changed, removed or replaced. */
  | 'formatting:changed'
  /** The set of redacted columns changed. */
  | 'redaction:changed'
  /** The per-column permission levels changed. */
  | 'permissions:changed'
  /** Either the responsive presentation switched between the table and the card layout, or `presentation.start()` was called again while already running. */
  | 'presentation:changed'
  /** `grid.presentation.start()` began presenting. */
  | 'presentation:started'
  /** `grid.presentation.stop()` stopped presenting. */
  | 'presentation:ended'
  /** The presentation stepped to a view in its deck, including the first one. */
  | 'presentation:view'
  /** The presentation's enlargement changed. */
  | 'presentation:scale'
  /** The presentation's spotlight was armed over some rows and columns, or cleared. */
  | 'presentation:spotlight'
  /** A screenshot of the grid was captured (`grid.capture()`), with the image's size and type. */
  | 'presentation:captured'
  /* Collaboration */
  /** A comment was added to a cell, or a reply added to a thread. */
  | 'comment:added'
  /** A comment's text was edited. */
  | 'comment:edited'
  /** A comment was deleted. */
  | 'comment:deleted'
  /** A comment operation could not reach the backend; `operation` names which one. */
  | 'comment:failed'
  /** A comment thread was marked resolved. */
  | 'comment:resolved'
  /** A resolved comment thread was reopened. */
  | 'comment:unresolved'
  /** A cell's comment thread was opened. */
  | 'comment:threadOpened'
  /** A cell's comment thread was closed or dismissed. */
  | 'comment:threadClosed'
  /** The comment index for the visible rows finished loading, with how many entries it carried. */
  | 'comment:indexLoaded'
  /** This grid published its own presence — the cell it is on, its selection — to the presence transport. */
  | 'presence:published'
  /** A peer appeared in the presence channel for the first time. */
  | 'presence:joined'
  /** A peer already present moved or changed what it is doing. */
  | 'presence:updated'
  /** A peer left the presence channel or timed out. */
  | 'presence:left'
  /** A presence subscribe or publish could not reach the transport. */
  | 'presence:failed'
  /** An edit was refused because a peer holds the cell's lock. */
  | 'presence:lockRefused'
  /* Comparison and time */
  /** Diff mode was turned on against a snapshot, or turned off. */
  | 'diff:changed'
  /** The two sides of a diff were swapped. */
  | 'diff:swapped'
  /** The timeline scrubber began recording what each change replaces. */
  | 'timeline:attached'
  /** The timeline scrubber stopped recording and the grid returned to the present. */
  | 'timeline:detached'
  /** The timeline finished moving and the grid now stands at that position. */
  | 'timeline:seek'
  /** The timeline is about to move, with where it is coming from and going to. */
  | 'timeline:seeking'
  /* Annotations */
  /** The annotation overlay's marks changed: one was drawn, moved or erased, or the tool changed. */
  | 'annotation:changed'
  /* Export */
  /** A streaming export wrote another chunk, with rows written, rows expected and bytes so far. */
  | 'export:progress'
  /** A remote export request is about to be handed to the host's `export.remote.fetch` hook. */
  | 'export:request'
  /** A remote export came back and the file was handed over (or downloaded). */
  | 'export:done'
  /* Keyboard help overlay (past-tense notifications) */
  /** The keyboard-shortcuts overlay was opened. */
  | 'shortcuts:opened'
  /** The keyboard-shortcuts overlay was closed. */
  | 'shortcuts:closed'
  /* Print (past-tense notifications) */
  /** Print mode has been applied and the grid laid out un-virtualised, just before the print dialog. */
  | 'print:before'
  /** The print dialog has returned and print mode has been undone. */
  | 'print:after'
  /* Cancellable before-events. Delivered through the async
   * before-dispatch path with a {@link BeforeEvent} carrying preventDefault. */
  /** A user or AI edit is about to be committed; call `preventDefault(reason?)` to stop it. */
  | 'beforeEdit'
  /** A user sort is about to be applied; call `preventDefault(reason?)` to stop it. */
  | 'beforeSort'
  /** A user filter — structured or quick — is about to be applied; call `preventDefault(reason?)` to stop it. */
  | 'beforeFilter'
  /** A user column move is about to be applied; call `preventDefault(reason?)` to stop it. */
  | 'beforeColumnMove'
  /** A user column resize is about to be applied; call `preventDefault(reason?)` to stop it. */
  | 'beforeColumnResize'
  /** A user column hide is about to be applied; call `preventDefault(reason?)` to stop it. */
  | 'beforeColumnHide'
  /** A user selection change is about to be announced; call `preventDefault(reason?)` to snap it back. */
  | 'beforeSelect'
  /** A user row append is about to be sent; call `preventDefault(reason?)` to stop it. */
  | 'beforeRowAdd'
  /** A user row delete is about to be applied; call `preventDefault(reason?)` to stop it. */
  | 'beforeDelete'
  /** A user row reorder is about to be applied; call `preventDefault(reason?)` to stop it. */
  | 'beforeRowMove'
  /** A user group expand or collapse is about to be applied; call `preventDefault(reason?)` to stop it. */
  | 'beforeGroup'
  /* Row transfer between grids */
  /* A row dropped in from another grid, on the receiving grid:
   * a {@link BeforeRowReceiveEvent}. */
  /** A row dragged from another grid is about to be inserted here; call `preventDefault(reason?)` to refuse it. */
  | 'beforeRowReceive'
  /* Their cancellation notifications (past-tense, non-cancellable). */
  /** A `beforeEdit` handler vetoed the commit, or it went stale while an async handler was thinking. */
  | 'edit:cancelled'
  /** A `beforeSort` handler vetoed the sort. */
  | 'sort:cancelled'
  /** A `beforeFilter` handler vetoed the filter. */
  | 'filter:cancelled'
  /** A `beforeColumnMove` handler vetoed the move. */
  | 'columnMove:cancelled'
  /** A `beforeColumnResize` handler vetoed the resize. */
  | 'columnResize:cancelled'
  /** A `beforeColumnHide` handler vetoed the hide. */
  | 'columnHide:cancelled'
  /** A `beforeSelect` handler vetoed the selection change, which has been snapped back. */
  | 'selection:cancelled'
  /** A `beforeRowAdd` handler vetoed the append. */
  | 'rowAdd:cancelled'
  /** A `beforeDelete` handler vetoed the delete, or the rows were gone by the time an async handler settled. */
  | 'delete:cancelled'
  /** A `beforeRowMove` handler vetoed the reorder. */
  | 'rowMove:cancelled'
  /** A `beforeGroup` handler vetoed the expand or collapse. */
  | 'group:cancelled'
  /** A `beforeRowReceive` handler refused the drop, or the drop went stale while an async handler was thinking. */
  | 'rowReceive:cancelled'
  /* Every event at once, for logging and debugging. */
  /** Every event above, delivered to one handler; the payload is whichever event fired. */
  | '*';

/**
 * Who caused a grid change: `'user'` interaction, an `'api'` call, `'init'`
 * (the grid's own startup), or an approved `'ai'` write.
 */
export type EventOrigin = 'api' | 'user' | 'init' | 'ai';
/**
 * Who asked for a viewer-chrome change — a tab switch, a layout window moved
 * or closed — narrower than {@link EventOrigin} because these are always
 * either a direct interaction or an API call, never the grid's own startup
 * or an AI write.
 */
export type ViewerOrigin = 'api' | 'user';
/**
 * Every viewer a framework adapter's generic `createLatticeViewer`/`bindViewer`
 * helper can bind to. The widest set across React, Vue and Svelte; a helper
 * that supports fewer of them still takes this type; the ones it cannot
 * actually build fail at the call, not at the type.
 */
export type ViewerKind = 'kpi' | 'kanban' | 'tabs' | 'chart' | 'gantt' | 'layout' | 'router';
export interface GridEvent {
  /**
   * Which event this is — `rows:changed`, `sort:changed`, `cell:edit:end` and
   * the rest.
   */
  type: string;
  /**
   * Who caused the action. `'ai'` tags a write an AI proposed
   * and a human approved, applied through `grid.edit.setCells(writes, type,
   * { origin: 'ai' })`; it fires the same cancellable `beforeEdit` gate a
   * `'user'` edit does, so a host can policy-gate AI writes distinctly.
   */
  origin: EventOrigin;
  /** The grid that emitted it, so one handler can serve several grids. */
  grid: Grid;
  /**
   * The event's own fields, spread alongside the three above: which cell, which
   * column, which rows. What arrives depends on the event — {@link EventPayloads}
   * names the specialisation each one carries.
   */
  [key: string]: unknown;
}

/**
 * A cancellable *before*-event, delivered to `on('beforeX')`
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
 * The `beforeRowReceive` event: a row dragged from another
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
 * held until it settles, and is cancelled as `'stale'` if
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
   * `'stale'` rather than inserted at this index regardless.
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
 * The `rowReceive:cancelled` event: a `beforeRowReceive`
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
 * The row-drag lifecycle events: `rowDrag:started`,
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
 * The `state:changed` event.
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
 * event once, `cause: 'user'`, with `'where'` in `sections`.
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

/** A function subscribed to a grid event, handed the event that fired. */
export type EventHandler = (e: GridEvent) => void;
/**
 * What a subscription hands back: call it to stop listening, without having to
 * keep hold of the handler for an `off()`.
 */
export type Unsubscribe = () => void;

// ---------------------------------------------------------------------------
// Modules and licensing (spec 2, 3.3)
// ---------------------------------------------------------------------------

export interface GridModule {
  /**
   * The module's name, which `registry.has()` answers on. Registration is
   * idempotent by it: the first one wins and a repeat is ignored, so a lazy
   * loader may register the same module twice.
   */
  name: string;
  /**
   * The module's version. Part of what makes two registrations of the same name
   * equivalent, so a repeat that declares a different version is reported as a
   * dropped reconfiguration rather than passing as an idle repeat.
   */
  version?: string;
  /**
   * Register everything the module contributes — renderers, editors, filters,
   * data types, totals, pipes — on the registry it is handed. A module without
   * one is ignored and says so, and a throw here leaves it unregistered.
   */
  install(ctx: ModuleContext): void;
  /**
   * Undo what `install` did. The capability set is rebuilt from the modules
   * that remain, and subscribers are told which regions need repainting.
   */
  uninstall?(ctx: ModuleContext): void;
}

export interface ModuleContext {
  /**
   * The registry to add to, or remove from. It is the shared one, so anything
   * registered is visible to every grid using it.
   */
  registry: Registry;
  /**
   * The grid the module is being installed into, when it is being installed
   * per grid rather than globally.
   */
  grid?: Grid;
}

export interface Registry {
  /** The installed modules, in the order they were registered. */
  modules(): GridModule[];
  /** Whether a module of this name is installed. */
  has(name: string): boolean;
  /**
   * A registered cell renderer by name, or `undefined`. Falls back to the
   * shared `component` namespace, so one entry in `config.components` can
   * serve as renderer, editor and filter alike.
   */
  renderer(name: string): RendererCtor | RenderFn | undefined;
  /**
   * A registered editor by name, or `undefined`. Falls back to the shared
   * `component` namespace.
   */
  editor(name: string): EditorCtor | undefined;
  /**
   * A registered filter by name, or `undefined`. Falls back to the shared
   * `component` namespace.
   */
  filter(name: string): FilterCtor | undefined;
  /** A registered data type by name, or `undefined`. */
  dataType(name: string): DataType | undefined;
  /** A registered total function by name, or `undefined`. */
  totalFn(name: string): TotalFn | undefined;
  /**
   * A registered template pipe by name — the functions a cell template calls
   * with `{{ value | pipe }}` — or `undefined`.
   */
  pipe(name: string): ((v: unknown, ...a: string[]) => string) | undefined;
  /**
   * Add an implementation under a name, for one of `renderer`, `editor`,
   * `filter`, `dataType`, `totalFn`, `pipe` or `component`. An unknown kind or
   * a missing name warns and does nothing; registering over an existing name
   * replaces it and warns.
   */
  register(kind: string, name: string, impl: unknown): void;
}

export interface LicenceInfo {
  /**
   * Whether the licence passed: the right product, in date, for this domain,
   * with a signature that checks out. What `licence.set` returns straight away
   * is provisional — the signature check is asynchronous — and
   * `licence:changed` fires again once it settles.
   */
  valid: boolean;
  /** The product the key was issued for. */
  product?: string;
  /** Who the key was issued to. */
  issuedTo?: string;
  /**
   * The ISO date the licence lapses on, judged in UTC so a licence expiring
   * `2027-01-01` is good throughout that day. A perpetual key has none.
   */
  expires?: string;
  /**
   * Why the verdict came out as it did: `missing`, `malformed`, `prefix`,
   * `product`, `expired`, `domain` or `signature` for a refusal, and
   * `unverified` alongside a pass on a host with no Ed25519 to check with,
   * where only the signature's shape could be examined.
   */
  reason?: string;
}

// ---------------------------------------------------------------------------
// Export options (spec 14)
// ---------------------------------------------------------------------------

/**
 * Which rows an export or a copy includes, widest set (the clipboard's, which
 * alone offers `'range'`); a file export accepts the narrower
 * `Extract<ExportRowsScope, …>` that excludes it.
 */
export type ExportRowsScope = 'visible' | 'all' | 'selected' | 'range';
export interface CsvExportOptions {
  /**
   * What separates fields. A comma by default; a field containing it is
   * quoted.
   */
  delimiter?: string;
  /**
   * The quote character. A double quote by default, doubled inside a quoted
   * field as RFC 4180 requires. Set it to an empty string to quote nothing.
   */
  quote?: string;
  /**
   * What separates rows. `\r\n` by default, which is what RFC 4180 and Excel
   * expect.
   */
  lineEnding?: string;
  /** Write a header row of column titles. On by default. */
  headers?: boolean;
  /**
   * Which columns to export, by id and in this order. Columns the grid hides,
   * or that opted out with `export.csv: false`, are still excluded.
   */
  columns?: string[];
  /**
   * Include the columns the grid hides, rather than only the visible ones.
   * Off by default. Columns that opted out with `export.csv: false` are still
   * excluded.
   */
  hidden?: boolean;
  /**
   * Which rows to export: `'visible'` (the default — what the filters and sort
   * leave), `'all'`, or `'selected'`.
   */
  rows?: Extract<ExportRowsScope, 'visible' | 'all' | 'selected'>;
  /**
   * The formula-injection guard, **on by default**: a field beginning with
   * `=`, `+`, `-`, `@`, a tab or a CR is prefixed with an apostrophe, because
   * a spreadsheet would otherwise execute it when the file is opened. `false`
   * turns it off; an object tunes it — `characters` to widen or narrow the
   * set, `prefix` to change the escape, `keepNumbers: true` to leave a field
   * that is entirely a number alone (so a negative currency stays numeric).
   */
  sanitise?: boolean | {
    enabled?: boolean;
    prefix?: string;
    characters?: string;
    keepNumbers?: boolean;
  };
  /**
   * Emit a UTF-8 byte-order mark, so Excel detects the encoding instead of
   * guessing at it. Off by default.
   */
  bom?: boolean;
  /**
   * The name for the downloaded file. A `.csv` extension is added when it has
   * none, and a name is generated when you give none.
   */
  fileName?: string;
  /**
   * Rewrite each cell's text as it is written out. It receives the same
   * parameter bag a renderer gets, so one implementation serves rendering,
   * tooltips and export alike.
   */
  processCell?: (p: CellParams) => string;
  /**
   * Trigger a browser download instead of returning the text. The call then
   * returns the blob, so a headless caller still gets something usable.
   */
  download?: boolean;
}

/** A conditional-formatting rule's rendering, returned by `cellStyle`. */
export interface ExcelCellStyle {
  /** Draw the cell's text bold. */
  bold?: boolean;
  /** Draw the cell's text italic. */
  italic?: boolean;
  /** Font colour as 6- or 8-digit hex/ARGB, e.g. 'FFFF0000'. `color` is an alias. */
  colour?: string;
  /** American spelling of `colour`; either is accepted. */
  color?: string;
  /** Solid fill colour as 6- or 8-digit hex/ARGB. */
  fill?: string;
}

/** A cell border, per edge. `true` means a thin line; a string names the style. */
export interface ExcelBorderSpec {
  /**
   * The line on the cell's left edge: `true` for a thin line, or a named style
   * (`'thin'`, `'medium'`, `'hair'`, …). Omit for no line.
   */
  left?: boolean | string;
  /** The line on the cell's right edge, in the same forms. */
  right?: boolean | string;
  /** The line on the cell's top edge, in the same forms. */
  top?: boolean | string;
  /** The line on the cell's bottom edge, in the same forms. */
  bottom?: boolean | string;
}

/** What an Excel export does with grid-hidden columns: drop them, or keep them Excel-hidden. */
export type ExcelHiddenColumns = 'omit' | 'hidden';
export interface ExcelExportOptions extends Omit<CsvExportOptions, 'delimiter' | 'quote' | 'lineEnding'> {
  /**
   * The worksheet's name. `'Sheet1'` by default, and made unique and legal for
   * Excel if it is neither.
   */
  sheetName?: string;
  /**
   * Freeze the header rows and the pinned columns, so they stay in view as the
   * sheet scrolls. On by default.
   */
  freezePanes?: boolean;
  /**
   * Carry the grid's cell variants across as solid fills. Off by default: a
   * printed spreadsheet is usually wanted plain.
   */
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
  hiddenColumns?: ExcelHiddenColumns;
  /**
   * Put Excel's filter dropdowns on the header row, so the sheet opens ready
   * to filter. On by default; `false` writes a plain header.
   */
  autoFilter?: boolean;
  /** Explicit merged body ranges in A1 form, e.g. ['A3:A4']. */
  merges?: string[];
  /**
   * Called as the workbook streams out, with how many rows have been written
   * and how many there are, so a large export can show progress.
   */
  onProgress?: (p: { written: number; total: number }) => void;
}

export interface ClipboardOptions {
  /** Put a row of column titles above the copied cells. */
  headers?: boolean;
  /**
   * What to copy: `'visible'`, `'all'`, `'selected'` rows, or `'range'` for
   * the selected cell rectangle.
   */
  rows?: ExportRowsScope;
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
  /**
   * Apply an incremental change — `add`, `update`, `remove` — against the rows
   * already loaded, synchronously, and return what it touched. Rows the grid
   * could not place come back under `rejected` rather than throwing. Needs a
   * `rowKey`: without one, updates and removals cannot be matched to a row,
   * and it says so.
   */
  apply(change: RowChange): ChangeResult;
  /**
   * The same change, coalesced with everything else arriving inside the batch
   * window (50 ms by default) into one pipeline run and one repaint. The
   * promise resolves with the flushed result. This is the call for a live
   * feed; an over-deep queue flushes early rather than growing.
   */
  queue(change: RowChange): Promise<ChangeResult>;
  /**
   * The row at a display index — the index the grid draws at, so group
   * headings, footers and the grand total are counted. `undefined` past the
   * end.
   */
  get(index: number): Row | undefined;
  /**
   * The row with this key, wherever it sits, or `undefined` when the grid does
   * not hold it.
   */
  byKey(key: string): Row | undefined;
  /**
   * How many rows the grid is displaying, including group headings, footers
   * and the grand total, and including optimistic rows an in-flight write has
   * added.
   */
  count(): number;
  /**
   * Rows in the source before filtering; under pagination, across every page.
   *
   * `null` while a source is still counting — see
   * {@link RowsApi.totalPending}. Reporting the rows fetched so far in that gap
   * would show a page length as a dataset size.
   */
  totalCount(): number | null;
  /**
   * Whether an exact total is still being counted for the current query.
   *
   * True only between the rows arriving and the total landing, on a source that
   * defers the count because counting reads data. It is what separates "not
   * counted yet" from "never going to be counted": `totalCount()` is `null` for
   * both, and only one of them is going to become a number.
   */
  totalPending(): boolean;
  /** Data rows matching the filters, excluding group, footer and total rows. */
  matchCount(): number;
  /**
   * How much of the data a figure computed from this grid covers, so a
   * statistic over a windowed source can say it is approximate.
   */
  coverage(): StatCoverage;
  /**
   * Your own row objects, in source order, with the grid's furniture left out
   * — group and total rows are not in the data and never appear here.
   */
  data(): unknown[];
  /**
   * Visit every display row in order: filtered, sorted and grouped as drawn,
   * with collapsed rows left out.
   */
  forEach(fn: (row: Row, index: number) => void): void;
  /** Every row in the data, before any filter. Leaf rows, in physical order. */
  forEachAll(fn: (row: Row, index: number) => void): void;
  /**
   * Visit the rows surviving every filter except one column's own: the
   * faceting question, asked of the rows.
   */
  forEachExcept(colId: string, fn: (row: Row, index: number) => void): void;
  /**
   * A cell's resolved value, stored or computed, read through the same path
   * the renderer uses so the API and the cell beside it can never disagree.
   */
  value(key: string, colId: string): unknown;
  /**
   * A cell's display text — the value after the column's format and any lookup
   * label, exactly as the cell shows it.
   */
  text(key: string, colId: string): string;
  /**
   * Every column's resolved value for one row, keyed by column id. Columns the
   * current permissions hide from reading are left out.
   */
  values(key: string): Record<string, unknown>;
  /**
   * Repaint without re-running the sort, filter and group stages, discarding
   * the memoised `compute` results for the named rows and columns (all of them
   * when none are named). `force: true` also recomputes and rewrites pure
   * computed values already materialised into the store — the call to make
   * when an answer the grid cannot see has changed, such as a lookup table
   * that has just arrived.
   */
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
  /**
   * Open a group or tree row. Note that `deep` expands *every* group in the
   * grid, not only this row's descendants.
   */
  expand(key: string, deep?: boolean): void;
  /** Close a group or tree row, hiding everything beneath it. */
  collapse(key: string): void;
  /**
   * Open every group and tree row. An explicit call outranks
   * `groupDefaultExpanded`, so the next rebuild does not re-close them.
   */
  expandAll(): void;
  /**
   * Close every group and tree row, leaving only the outermost headings on
   * screen.
   */
  collapseAll(): void;
}

export interface ColumnsApi {
  /**
   * Set or clear a column's totals-row reduction.
   *
   * With no `scope`, `fn` becomes the column's single `total`, applied to both
   * group subtotals and the grand total, and any independent group/grand
   * overrides are cleared — the same one-property behaviour as before. Pass `scope: 'group'` or `scope: 'grand'` to set just
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
  /**
   * A resolved column by id, including the generated auto-group column — which
   * `all()` and `state()` deliberately leave out, since it is the grid's and
   * not yours. `undefined` when there is no such column.
   */
  get(id: string): ResolvedColumn | undefined;
  /**
   * Every leaf column in display order, hidden ones included, minus any the
   * current permissions withhold.
   */
  all(): ResolvedColumn[];
  /**
   * The leaf columns actually on screen, in display order — `all()` without
   * the hidden ones.
   */
  visible(): ResolvedColumn[];
  /**
   * The serialisable column state — order, width, pin, visibility, sort,
   * grouping, totals, decoration — ready to store and hand back to `apply()`.
   * The generated auto-group column is excluded.
   */
  state(): ColumnState[];
  /**
   * Restore column state produced by `state()`: order, widths, pins,
   * visibility and the rest, applied in one pass.
   */
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
  /** Show columns by id. Recorded on the undo timeline. */
  show(ids: string | string[]): void;
  /**
   * Hide columns by id. `beforeColumnHide` can cancel it, and a column marked
   * `layout.lockVisible` refuses and warns.
   */
  hide(ids: string | string[]): void;
  /**
   * Move a column to a display position. `beforeColumnMove` can cancel it; a
   * column that is not movable or is position-locked refuses and warns.
   */
  move(id: string, to: number): void;
  /**
   * Wrap leaf columns in a banded header, or add them to an existing band. Header banding, not row grouping (see {@link group}); the
   * band is a {@link ColumnGroup} node so a drag-, keyboard- or config-built band
   * is the same tree, and it round-trips through a saved view. Emits
   * `columngroup:changed`. Pass `groupId` to add to the band already carrying
   * that id, or `id` to create a new band with a caller-chosen
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
  /**
   * Freeze a column against the start or the end edge, or pass `null` to
   * return it to the scrolling body. Recorded on the undo timeline.
   */
  pin(id: string, side: Edge | null): void;
  /**
   * Set a column's width in pixels, clamped to its `min` and `max`. A column
   * marked `resizable: false` refuses and warns. An explicit width clears the
   * column's `flex`, so the next layout pass does not undo it.
   */
  resize(id: string, px: number): void;
  /**
   * Set, change or clear a column's decoration at runtime (§8.7). Pass `null` to
   * clear it back to plain text. Presentation config: it is not on the undo
   * timeline and is not carried in a saved view — use `grid.formatting` for
   * durable, view-persisted conditional styling.
   */
  decorate(id: string, decoration: DecorationName | DecorationSpec | null, opts?: { variant?: VariantSpec }): void;
  /**
   * Size the named columns (or all of them) to the content they are actually
   * showing, heading included. It measures the rows the renderer has mounted
   * rather than the whole dataset, and settles any pending frame first so a
   * call made straight after `rows.load()` sees the rows and not just the
   * header.
   */
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
   * that leaves less than their minimums, each is set to its minimum — the
   * 40px floor when a column's own `min` does not set one of its own, an
   * explicit `min: 0` included — never below, the grid scrolls horizontally,
   * and a `[lattice]` warning says so. Rows given to `createGrid` or
   * `rows.load()` before the call are counted. One-shot: it sets fixed widths
   * once (a `flex` column included) and does not follow later changes; after a
   * resize, rows arriving later bring a vertical scrollbar in, or a column
   * group is expanded or un-grouped, call it again.
   */
  fit(): void;
  /**
   * Set the row-grouping columns, outermost first; pass an empty list to
   * ungroup. Columns the current permissions withhold are dropped. Emits
   * `column:grouped` and rebuilds the header, since grouping adds or removes
   * the generated group column.
   */
  group(ids: string | string[]): void;
  /**
   * Set the pivot columns, turning each distinct value into a column heading;
   * pass an empty list to leave pivot mode. Columns the current permissions
   * withhold are dropped. Emits `column:pivoted`.
   */
  pivot(ids: string | string[]): void;
  /**
   * Choose which columns carry a footer total. A column named here that has
   * none is given `sum`; a column not named falls back to whatever its own
   * definition asked for.
   */
  totals(ids: string | string[]): void;
}

/** One sprite: its view box, its path data, and how it is painted. */
export interface IconGlyph {
  /** The SVG view box the paths are drawn in, normally `'0 0 16 16'`. */
  viewBox: string;
  /** One or more SVG path `d` strings making up the glyph. */
  paths: string[];
  /** Whether the paths are stroked or filled. Filled unless it says otherwise. */
  paint: Paint;
}

/** Read access to the grid's icon sprite set (see {@link Grid.icons}). */
export interface IconRegistryApi {
  /** One glyph, as a copy, or null when the name is not registered. */
  get(name: string): IconGlyph | null;
  /** Every registered name, in registration order. */
  names(): string[];
}

export interface RowFormApi {
  /** Open the form for a row. False when the form is not configured. */
  open(key: string): boolean;
  /** Close the form without saving, returning focus to wherever it came from. */
  close(): void;
  /**
   * Collect the fields, write the ones that map to columns as one undoable
   * step, announce them all on `form:saved`, and close. `false` when a field
   * failed validation — the offending field is scrolled into view and marked —
   * or when there is nothing to save.
   */
  save(): boolean;
  /** Whether the form panel is showing. */
  isOpen(): boolean;
}

export interface DetailApi {
  /** Whether master-detail is configured on this grid. */
  enabled(): boolean;
  /**
   * Whether a row — by key or as a row object — can be expanded into a detail
   * region.
   */
  isMaster(target: string | Row): boolean;
  /** Whether this master's detail region is open. */
  isOpen(key: string): boolean;
  /**
   * Open a master's detail region. Does nothing for a key that is not a
   * master.
   */
  open(key: string): void;
  /** Close a master's detail region. */
  close(key: string): void;
  /**
   * Open a master's detail if it is closed and close it if it is open; returns
   * the state it is now in. `false` for a key that is not a master.
   */
  toggle(key: string): boolean;
  /** Close every open detail region. */
  closeAll(): void;
  /**
   * The keys of every master whose detail is open, in the order they were
   * opened.
   */
  keys(): string[];
  /**
   * The one open master when the detail is drawn into a host element outside
   * the grid, where only one can be open. `null` when nothing is open.
   */
  active(): string | null;
  /**
   * Where the detail is drawn: `'inline'` as a row beneath the master, or
   * `'target'` in a host element elsewhere on the page. `null` when
   * master-detail is off.
   */
  placement(): 'inline' | 'target' | null;
  /**
   * The resolved master-detail settings, for a renderer building the region.
   * `null` when master-detail is off.
   */
  config(): DetailConfig | null;
}

export interface SelectionApi {
  /** Drop every range, leaving the row and cell selection alone. */
  clearRange(): void;
  /**
   * The selected cells as a status bar states them: how many carry a value,
   * how many of those are numbers, and the sum, extremes and mean of the
   * numbers. Every figure but the two counts is null when nothing selected is
   * numeric. {@link SelectionApi.statistics} is the fuller answer.
   */
  summary(): {
    count: number;
    numeric: number;
    sum: number | null;
    min: number | null;
    max: number | null;
    avg: number | null;
  };
  /**
   * Everything worth knowing about the selected cells: what `summary()`
   * reports plus median, quartiles, deviation, distinct and outliers. Over the
   * cells rather than a column, so a rectangle spanning three columns is one
   * set of numbers. Null with nothing selected.
   */
  statistics(): object | null;
  /** The selected rows, as row objects. */
  rows(): Row[];
  /** The keys of the selected rows. */
  keys(): string[];
  /** Replace the row selection with exactly these keys and repaint. */
  set(keys: string[]): void;
  /**
   * Select every row currently on display — what the filters leave, detail rows
   * excepted. Does nothing unless the selection mode is `'multiple'`.
   */
  all(): void;
  /** Drop the row selection, leaving any cell ranges alone. */
  clear(): void;
  /**
   * The select-all checkbox's tri-state over the displayed rows: `true` when
   * every one is selected, `'partial'` when some are, `false` when none are.
   * Group and detail rows are furniture and do not count.
   */
  headerState(): boolean | 'partial';
  /** Every cell inside the selected ranges, as row key and column id pairs. */
  cells(): { key: string; colId: string }[];
  /** The selected cell ranges, in the order they were added. */
  ranges(): CellRange[];
  /** Replace the range selection with this one range. */
  setRange(range: CellRange): void;
  /**
   * Add a range without discarding the ones already selected — the API form of
   * ctrl-clicking a second block. The added range becomes the anchor a
   * following `extendRange` grows from.
   */
  addRange(range: CellRange): void;
  /**
   * Anchor a new range at a cell, which a drag or Shift+Arrow then extends.
   * `additive: true` keeps the ranges already selected.
   */
  startRange(rowIndex: number, colId: string, opts?: { additive?: boolean }): void;
  /** Grow the live range out to a cell, leaving its anchor where it was. */
  extendRange(rowIndex: number, colId: string): void;
  /**
   * The bottom-right corner of the last range — where the fill handle sits —
   * or `null` when nothing is selected.
   */
  corner(): { row: number; colId: string } | null;
  /** Whether a cell falls inside any selected range. */
  inRange(rowIndex: number, colId: string): boolean;
}

export interface CellRange {
  /**
   * The display index the range starts at. It is an index, not a key: a range
   * is a rectangle on screen, so sorting or filtering changes what it covers.
   */
  startRow: number;
  /** The display index the range ends at, inclusive. */
  endRow: number;
  /** The ids of the columns the range spans, in display order. */
  columns: string[];
}

/**
 * How a `where` predicate is re-evaluated, whether `filters.clear()` may remove
 * it, and what the source may be told about it.
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
   * `50_000`) and refuses loudly past it. A paged or remote
   * source cannot run it at all and warns at registration. The twin is pushed
   * to the engine, so it narrows the fetch itself and none of that applies.
   */
  condition?: FilterSet;
}

export interface FiltersApi {
  /** The quick filter's text and match mode, for restoring a control. */
  quickState(): { text: string; mode: string };
  /**
   * The filter tree in force — the structured conditions, not the quick filter
   * or the `where` predicates.
   */
  get(): FilterSet;
  /**
   * Replace the filter tree. `beforeFilter` may cancel it. A condition on a
   * column the user may not read is dropped, since the row count alone would
   * leak the value; a condition naming an operator the grid does not have is
   * dropped too, and if that leaves nothing at all the call is a no-op rather
   * than a clear — a typo must not quietly widen a row set someone had
   * narrowed.
   */
  set(filters: FilterSet): void;
  /**
   * Drop the condition tree, the quick filter, and every `where` predicate that
   * was not registered `{ pinned: true }`.
   */
  clear(): void;
  /**
   * Set the quick filter text, which matches against what the cells display.
   * `mode` chooses how — `'contains'` (the default), `'words'`, `'fuzzy'` or
   * `'regex'` — and persists until changed, so a host can set it once and pass
   * text alone afterwards. `beforeFilter` may cancel it, and keystrokes
   * coalesce into one undo entry.
   */
  quick(text: string): void;
  /** The names of the `where` predicates in force, in registration order. */
  where(): string[];
  /**
   * Register, replace or remove a named row predicate composed with the filter
   * set.
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
  /**
   * The sort entries in force, outermost first. A copy — changing it sorts
   * nothing.
   */
  get(): SortEntry[];
  /** Replace the sort model; an entry naming no known column is dropped with a warning. */
  set(entries: SortEntry[]): void;
  /** Remove every sort entry and return the rows to their source order. */
  clear(): void;
}

export interface EditApi {
  /**
   * Open an editor on a cell. `false` when the cell is not editable, or is
   * held by another peer under an advisory lock.
   */
  start(key: string, colId: string): boolean;
  /**
   * End the edit session, committing by default or discarding with `cancel:
   * true`. A commit runs the full write path — parse, validate, apply — and
   * records the change on the undo timeline.
   */
  stop(cancel?: boolean): void;
  /**
   * Undo the last action. Routed through the grid-wide timeline rather than an
   * edit-only stack: with two stacks the first press after a sort would undo
   * an edit made before it, which is not what the user did last.
   */
  undo(): void;
  /** Redo the last undone action, through the same grid-wide timeline. */
  redo(): void;
  /**
   * Write several cells as one undoable step (§12). `opts.origin` defaults to
   * `'api'` — the ungated seam every existing caller uses (a fill, a paste, a
   * kanban move), unchanged. Pass `{ origin: 'ai' }` (or `'user'`) to route the
   * write through the cancellable `beforeEdit` gate, exactly as an interactive
   * edit is: the AI writes through this so a host `beforeEdit`
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
  /**
   * Paste tab-separated text anchored at a cell, as one undoable step. Excel's
   * shape rules apply: a single value fills the whole target, a smaller block
   * tiles to fill it, and a block taller than the rows available is clipped
   * rather than creating rows. Returns how many cells were written.
   */
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
  /**
   * Every optimistic cell write still awaiting an outcome, oldest first.
   * Always empty when `edit.commit` is not configured.
   */
  pending(): OpenWrite[];
  /**
   * Whether a cell has a write in flight: `'pending'`, or `null` when it is
   * settled.
   */
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
   * (§18.4) — what the built-in Delete-key and "Delete row"
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
  /**
   * Scroll sideways until a column is in view. Pinned columns need no
   * scrolling and are already there.
   */
  toColumn(id: string): void;
  /** Scroll a cell into view, both axes in one call. */
  toCell(row: string | number, colId: string, align?: 'start' | 'center' | 'end' | 'auto'): void;
  /**
   * The body's current scroll offsets in pixels. Zeroes before the grid has
   * been rendered.
   */
  position(): { top: number; left: number };
  /** `left` is the logical offset, zero at the content's start in either direction. */
  to(at: { top?: number; left?: number }): void;
}

export interface ExportApi {
  /** The selected range as tab-separated text, the shape a spreadsheet pastes. */
  rangeText(opts?: object): string;
  /**
   * Export to CSV. Returns the text, or downloads a blob when the options ask
   * for a file.
   */
  csv(opts?: CsvExportOptions): string | Promise<Blob>;
  /**
   * Export to a real `.xlsx` workbook, with the column formats, widths and any
   * styling the options ask for. Large exports stream.
   */
  excel(opts?: ExcelExportOptions): Promise<Blob>;
  /**
   * Copy to the clipboard as tab-separated text, which is what Excel, Numbers
   * and Sheets paste as cells. With `rows: 'range'` it copies the selected
   * rectangle.
   */
  clipboard(opts?: ClipboardOptions): Promise<void>;
  /**
   * Switch the grid into print layout — every row in the document, no
   * virtualisation, no paging, pinned columns released — let the layout settle,
   * call the browser's print dialog, and put the grid back as it was.
   *
   * Refused above `maxRows` (5,000 by default, roughly a hundred printed
   * pages), with a message pointing at the CSV and Excel exports. `unpin`
   * keeps the pinned columns in place; `print: false` lays the grid out and
   * restores it without calling the dialog, which is how a host paginates or
   * photographs it. Resolves with what happened, so a caller can show the
   * reason instead of guessing.
   */
  print(opts?: {
    maxRows?: number;
    unpin?: boolean;
    print?: boolean;
  }): Promise<{ printed: boolean; rows: number; reason?: string }>;
}

/** How `config.import` tunes the DOM import affordances (§14). */
/** How a confirmed import lands: added to the dataset, or replacing it. */
export type ImportMode = 'append' | 'replace';
export interface ImportSettings {
  /** Add the cell-menu item and open a file picker for CSV/TSV. Default true. */
  file?: boolean;
  /** Make the grid a drop target for `.csv`/`.tsv` files. Default true. */
  drop?: boolean;
  /** Read a pasted spreadsheet block into a preview. Default true. */
  paste?: boolean;
  /** How a confirmed import lands: append (default) or replace the dataset. */
  mode?: ImportMode;
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

/** Bringing rows in — the mirror of {@link ExportApi} (§14). */
export interface ImportApi {
  /** Parse delimited text into a preview, changing nothing. */
  preview(text: string, opts?: object): ImportPreview;
  /** Parse delimited text into coerced records — the inverse of `export.csv`. */
  csv(text: string, opts?: object): Record<string, unknown>[];
  /**
   * Parse an `.xlsx` file's bytes into a preview, changing nothing (§14). Async: the archive is inflated with `DecompressionStream`.
   */
  previewXlsx(bytes: Uint8Array | ArrayBuffer, opts?: object): Promise<ImportXlsxPreview>;
  /** Parse an `.xlsx` file's bytes into coerced records — the inverse of `export.excel`. */
  xlsx(bytes: Uint8Array | ArrayBuffer, opts?: object): Promise<Record<string, unknown>[]>;
  /** Add or replace the grid's rows from text, a preview or records. */
  apply(
    input: string | ImportPreview | Record<string, unknown>[],
    opts?: { mode?: ImportMode },
  ): ChangeResult | null;
}

export interface SavedView {
  /**
   * The view's identity, which `apply`, `rename`, `remove` and `setDefault`
   * take.
   */
  id: string;
  /** What the view is called. Renaming refuses a blank or duplicate name. */
  name: string;
  /** Longer text about the view, for a picker that has room for it. */
  description: string;
  /**
   * Whether the view was stored for everyone rather than for this user alone.
   * The storage adapter decides what that means.
   */
  shared: boolean;
  /**
   * Applied on load when no `config.state` is given. `config.state` wins
   * outright over this flag: with both present, the default view is never
   * applied and the active view id stays `null`.
   */
  isDefault: boolean;
  /** Supplied in `config.views.saved`: listed apart, and not renamable or deletable. */
  builtin: boolean;
  /**
   * When the view was first saved, as epoch milliseconds. It survives an
   * overwrite; `updatedAt` does not.
   */
  createdAt: number;
  /** When it was last changed, as epoch milliseconds. */
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

/** What happened to a saved view, or the whole set. */
export type ViewChangeReason =
  'save' | 'update' | 'rename' | 'remove' | 'default' | 'import' | 'seed' | 'replace';
export interface ViewChange {
  /**
   * What happened to the views: a view was saved, updated, renamed, removed,
   * made default, imported, seeded from configuration, or the whole set
   * replaced.
   */
  reason: ViewChangeReason;
  /** The view the change concerns; null for a bulk replace. */
  view: SavedView | null;
}

export interface RowStyleParams {
  /**
   * The grid's row wrapper, carrying whether this is a group heading, a
   * footer, a grand total or a detail row.
   */
  row: Row;
  /** The key of the row being styled. */
  key: string;
  /** Where the row sits on screen, counting the grid's own rows. */
  index: number;
  /**
   * Your own row object. `null` on a row the grid produced itself, such as a
   * group heading.
   */
  data: unknown;
  /** The grid instance. */
  grid: Grid;
  /** Whatever `config.context` holds. */
  context: unknown;
}

/**
 * Presentation mode renders the grid for a room: full-screen, application
 * chrome hidden, and everything enlarged by a scale that multiplies the
 * configured density rather than replacing it. The data stays live and
 * interactive throughout.
 */
/**
 * Rendering the grid to a still image. `scale` multiplies the pixel dimensions: 2 for a retina still, 3 or 4 for a slide. `background` fills behind the
 * grid so a PNG dropped into a deck does not show it through.
 */
export interface CaptureOptions {
  /**
   * Multiply the image's pixel dimensions — 2 for a retina-quality still, 3 or
   * 4 for a slide. 2 by default.
   */
  scale?: number;
  /**
   * The colour painted behind the grid, since a grid whose own background is
   * transparent would otherwise photograph onto nothing.
   */
  background?: string;
  /**
   * Save the image as a file as well as returning it. A file name is generated
   * when you give none, rather than the save being refused.
   */
  download?: boolean;
  /**
   * The name to save under. Supplying one also triggers the download unless
   * `download: false` says otherwise.
   */
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
 * A durable annotation mark descriptor — the shape a host
 * seeds through `state.annotations`, adds through {@link AnnotationApi.add}, and
 * reads back through {@link AnnotationApi.list} and `getState`.
 *
 * `points` are in **content coordinates** (the same space user-drawn marks are
 * stored in), so a mark tracks scroll and resize rather than hanging over the
 * viewport. A `freehand` mark is a trail of points; `arrow` and `rect` are their
 * two endpoints. A `text` mark is a label anchored at a single content point,
 * carrying its `text` string and an optional basic style.
 * `pen` is accepted as an alias for `freehand` on input; `list()` reports
 * `freehand`.
 */
/** What an annotation mark is: a freehand trail, an arrow, a rectangle, a highlight, or text. */
export type AnnotationKind = 'freehand' | 'arrow' | 'rect' | 'highlight' | 'text';
/** Which columns an annotation mark belongs to: the pinned start, the centre, or the pinned end. */
export type AnnotationRegion = 'start' | 'centre' | 'end';
export interface AnnotationMark {
  /**
   * What the mark is: a freehand trail, an arrow, a rectangle, a highlighter stroke, or a
   * text label. `pen` is accepted on input as another name for `freehand`, and `list()`
   * reports `freehand`.
   */
  type: AnnotationKind;
  /**
   * Content coordinates. A `text` mark carries a single anchor point; `arrow`
   * and `rect` carry their two corners, and `freehand` a trail.
   */
  points: { x: number; y: number }[];
  /** The mark's colour, any CSS colour. Omitted, it takes the layer's current colour. */
  colour?: string;
  /** The label of a `text` mark. Required for `text`, ignored for other types. */
  text?: string;
  /** A `text` mark's font size in content pixels (before presentation scale). Defaults to 14. */
  fontSize?: number;
  /** An optional backing colour drawn behind a `text` mark's label. */
  background?: string;
  /**
   * Which columns the mark belongs to: a pinned region holds still while the
   * grid scrolls sideways, the centre moves with it. Set from where a stroke
   * began; omitted (the centre) for every mark that is not over a pinned
   * column, so a mark saved before this existed reads unchanged.
   */
  region?: AnnotationRegion;
}

/** The annotation drawing tool: a pen, an arrow, a rectangle, or a highlighter. */
export type AnnotationTool = 'pen' | 'arrow' | 'rect' | 'highlight';
export interface AnnotationApi {
  /**
   * The drawing tool in use, or null when the layer is inert — which it is until a tool is
   * chosen, so the grid takes the pointer as usual.
   */
  readonly tool: AnnotationTool | null;
  /** How many marks the layer is holding, durable and drawn alike. */
  readonly count: number;
  /**
   * Choose a tool, or pass null to hand the pointer back to the grid. Asking for the tool
   * already in use turns it off, so one button can toggle; `opts.colour` sets the colour to
   * draw in, and changing only the colour keeps the current tool. Returns the tool now in
   * use.
   */
  use(tool: AnnotationTool | null, opts?: { colour?: string }): string | null;
  /**
   * Add a durable mark from a descriptor, without synthesising pointer input. The mark is painted, survives a presentation ending, and
   * round-trips through `getState`. Returns the mark count.
   */
  add(mark: AnnotationMark): number;
  /** Every mark on the layer, as descriptors — the shape `getState` persists. */
  list(): AnnotationMark[];
  /**
   * Remove the most recent mark and repaint. Returns how many are left; on an empty layer
   * it does nothing and returns 0.
   */
  undo(): number;
  /**
   * Remove every mark, seeded and drawn alike — the explicit "clear all". Ending a
   * presentation drops only the drawn ones.
   */
  clear(): void;
  /**
   * Repaint every mark at the current scroll offset. Called for you on scroll and after
   * each render; a host needs it only after moving the layer itself.
   */
  redraw(): void;
}

/**
 * Holding incoming updates, and the counters describing what they cost.
 * Pausing is explicit, a button, not a guess at whether the user is busy.
 */
/** Where a diagnostic warning came from: a scheduled check, or a `warnOnce` report. */
export type DiagnosticSource = 'check' | 'reported' | 'info';
/** One thing the grid has flagged as probably a mistake. */
export interface DiagnosticWarning {
  /** Stable identifier, nameable in a support conversation. */
  id: string;
  /** A plain description of what was found. */
  message: string;
  /** The specific values involved, so the warning is actionable. */
  values: Record<string, unknown>;
  /**
   * How many times a diagnostic check has raised this warning. Always 1 for a
   * warning that came from a `[lattice]` console message, which is reported
   * once and not counted.
   */
  count: number;
  /** When it was first raised, as epoch milliseconds. */
  first: number;
  /**
   * When it was last raised, as epoch milliseconds — which, with `count`, says
   * whether it is still happening.
   */
  last: number;
  /** `'check'` raised by a diagnostic check, `'reported'` from `warnOnce`. */
  source: DiagnosticSource;
}

export interface DiagnosticsApi {
  /**
   * Everything below as one structure — the whole diagnostic picture in a
   * single read.
   */
  snapshot(): Record<string, unknown>;
  /** `dom.cellWrites` is the figure a DOM-write assertion reads. */
  renders(): Record<string, unknown>;
  /**
   * How the column store is laid out and what it costs: encoding per column,
   * dictionary sizes, bytes held.
   */
  store(): Record<string, unknown>;
  /**
   * Timing history per kind of operation — sort, filter, group, ingest —
   * sampled over recent calls.
   */
  operations(): Record<string, unknown>;
  /**
   * Call counts, errors, latency and recent calls for each provider the host
   * supplied.
   */
  providers(): Record<string, unknown>;
  /**
   * How many listeners are attached per event type. A count that grows without
   * bound is almost always a subscription leak in the host application.
   */
  events(): Record<string, number>;
  /**
   * The configuration actually in force, and which keys you supplied as
   * against which the grid defaulted.
   */
  config(): { effective: Record<string, unknown>; supplied: string[]; defaulted: string[] };
  /**
   * Everything the grid has flagged this session, newest first — its own
   * checks and every `[lattice]` warning — each with the stable identifier a
   * support conversation can name.
   */
  warnings(): DiagnosticWarning[];
  /**
   * Hide one warning for the rest of this session, by its identifier. Nothing
   * is persisted.
   */
  dismiss(id: string): void;
  /** Contains no row data, cell values or column values. */
  bundle(): Record<string, unknown>;
  /**
   * Ask whether an options object keeps changing identity without its contents
   * changing — the framework-wrapper mistake that rebuilds the grid on every
   * parent render. True means the identity churned.
   */
  checkOptions(options: unknown): boolean;
  /**
   * Record an operation your own code performed — its name, the rows it
   * touched, how long it took — so it appears alongside the grid's in
   * `operations()`.
   */
  record(kind: string, detail: { rows?: number; ms?: number; worker?: boolean }): void;
  /**
   * Record a repaint and what caused it, with optional per-phase timings. The
   * DOM layer calls this; a custom renderer can too.
   */
  render(cause: string, phases?: Record<string, number>): void;
  /** Off by default; recording times every emit. */
  recordEvents(on: boolean, limit?: number): void;
  /**
   * The recorded events, oldest first, once `recordEvents(true)` has been
   * called. Empty otherwise.
   */
  eventLog(): Array<{ type: string; origin: string; listeners: number;
                      payload: Record<string, string>; at: number; ms: number }>;
  /** Forget the recorded events while leaving recording switched on. */
  clearEventLog(): void;
  /** Keep current store statistics so growth can be measured against them. */
  mark(): Record<string, unknown>;
  /**
   * What has changed since `mark()` — the growth that shows a leak, which no
   * single reading can. `null` when nothing is marked.
   */
  since(): Record<string, unknown> | null;
  /**
   * Zero the counters, leaving the warnings and the configuration report
   * alone.
   */
  reset(): void;
}

/** One peer, as the grid holds them. */
export interface Peer {
  /**
   * The peer's stable identity, as the provider supplies it. Everything else
   * keys off it — the colour, the cursor, the lock.
   */
  id: string;
  /** The display name. Falls back to the id when the provider sends none. */
  name: string;
  /** Assigned deterministically from the id when the provider supplies none. */
  colour: string;
  /** A picture for the peer, or `null` when the provider sends none. */
  avatarUrl?: string | null;
  /** Initials to draw when there is no avatar, or `null`. */
  initials?: string | null;
  /** Row key and column, never an index. */
  cursor: { rowId: string; colId: string } | null;
  /**
   * The cell ranges the peer has selected, as row keys and column ids — never
   * indices, since peers sort and filter independently.
   */
  ranges: Array<{ rowIds: string[]; columns: string[] }>;
  /**
   * The cell the peer has an editor open on, or `null`. This is what
   * `editorOf` and the advisory lock read.
   */
  editing: { rowId: string; colId: string } | null;
  /** Local receipt time, not the sender's clock. */
  at: number;
  /** The sender's own timestamp, for inspection only. Nothing decides on it. */
  sentAt?: number | null;
  /**
   * Whether nothing has been heard from this peer for the idle window (30
   * seconds by default). Derived when the peers are read, so a peer goes idle
   * without any timer having to fire.
   */
  idle?: boolean;
  /**
   * How long it has been, in milliseconds, since anything was heard from this
   * peer.
   */
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
  /**
   * Send this client's cursor, ranges and open editor to the other clients.
   * The grid throttles the calls and drops them while publishing is paused, so
   * a transport does no rate limiting of its own.
   */
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
  /**
   * Whether a presence provider is attached. Without one the whole namespace
   * is inert.
   */
  readonly enabled: boolean;
  /**
   * This client's own identity as the provider gave it, or `null` when there
   * is none.
   */
  readonly me: Record<string, unknown> | null;
  /**
   * Whether this client is sending its own presence, as against only receiving
   * others'.
   */
  readonly publishing: boolean;
  /**
   * Every peer, most recently active first, each carrying its cursor, idle
   * state and a `hidden` flag. `hidden` means their row is not in this view —
   * filtered out, on another page, or evicted from a window — not that they
   * have gone.
   */
  peers(): Peer[];
  /** How many peers have their cursor on a row this view is not showing. */
  hiddenCount(): number;
  /**
   * The peer editing a cell, when one is and their claim is still fresh.
   * `null` otherwise.
   */
  editorOf(rowId: string, colId: string): Peer | null;
  /** Advisory. Reduces collisions; does not eliminate them. */
  lockedBy(rowId: string, colId: string): Peer | null;
  /**
   * Scroll this view to a peer's cursor, centring the row. `false` when the
   * peer is unknown or their row is not in this view.
   */
  jumpTo(peerId: string): boolean;
  /** Send local presence now, without waiting for the throttle. */
  publish(): void;
  /**
   * Stop or resume sending this client's own presence — an observer role that
   * still receives everyone else's.
   */
  setPublishing(on: boolean): void;
  /** Suspend publishing entirely, as the DOM layer does when the tab is hidden. */
  setPaused(paused: boolean): void;
  /** Attach a presence provider after construction, or pass `null` to detach. */
  connect(provider: PresenceProvider | null): void;
  /** Publish, receive, drop and error counters for the presence channel. */
  stats(): Record<string, number>;
}

/** One comment in a thread, as the provider returns it. */
export interface Comment {
  /**
   * The comment's identity, as the provider assigns it. A comment awaiting the provider
   * carries a temporary id and is replaced when the write returns.
   */
  id: string;
  /** The text of the comment. */
  body: string;
  /** Rendered as supplied. The grid does not know who the user is. */
  author?: { name?: string; avatarUrl?: string; initials?: string };
  /** When it was written, as epoch milliseconds. */
  at?: number;
  /** Whether the body has been changed since it was posted, so a reader can be told. */
  edited?: boolean;
  /** Whether the thread this comment belongs to has been resolved. */
  resolved?: boolean;
  /** The comment this one replies to, or null at the top of the thread. */
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
  /**
   * How many comments the cell carries. A cell whose count reaches zero is dropped from the
   * index rather than kept at 0.
   */
  count: number;
  /**
   * How many of them are unresolved — what the marker colours itself by, and what the
   * hidden-comment count sums.
   */
  unresolved: number;
  /**
   * When the cell's thread last changed, as epoch milliseconds, so a recently touched cell
   * can be distinguished from an old one.
   */
  updated: number;
}

/** What `loadIndex` returns per commented cell. */
export interface CommentIndexEntry extends CommentDescriptor {
  /**
   * The cell this entry describes, as the grid's own composite key. Give this, or `rowId`
   * and `field`, and the grid builds it.
   */
  cellKey?: string;
  /** The row key, when the entry is identified by row and column rather than by `cellKey`. */
  rowId?: string;
  /** The column id, beside `rowId`. */
  field?: string;
}

/**
 * Storage for comments. Every method returns a promise; a rejection surfaces in
 * the panel without disturbing grid state.
 */
export interface CommentProvider {
  /**
   * Return the counts for these rows and columns — counts and timestamps only, never
   * bodies, because this is consulted on every repaint. Called as the viewport moves,
   * debounced.
   */
  loadIndex(rowIds: string[], fields: string[]): Promise<CommentIndexEntry[]>;
  /**
   * Return the bodies for one cell, in display order. Called when a thread is opened and
   * dropped when it closes, so a grid never holds every thread.
   */
  loadThread(cellKey: string): Promise<Comment[]>;
  /**
   * Store a new comment on a cell, optionally as a reply, with the cell's value at the time
   * as context. Return the stored comment; the grid shows it optimistically and rolls it
   * back if this rejects.
   */
  addComment(cellKey: string, body: string, parentId: string | null,
             context?: { value?: unknown }): Promise<Comment>;
  /** Store a new body for an existing comment and return it. */
  editComment(commentId: string, body: string): Promise<Comment>;
  /** Remove a comment. The grid shows it gone at once and puts it back if this rejects. */
  deleteComment(commentId: string): Promise<void>;
  /** Mark a cell's thread resolved. */
  resolveThread(cellKey: string): Promise<void>;
  /** Reopen a cell's thread. */
  unresolveThread(cellKey: string): Promise<void>;
}

/** Whether a comment thread floats beside its cell or opens in a side panel. */
export type CommentDisplayMode = 'anchored' | 'docked';
export interface CommentConfig {
  /** Without one the feature is inert and no error is raised. */
  provider?: CommentProvider;
  /** Milliseconds a viewport change waits before the index is fetched. */
  debounce?: number;
  /** Cell descriptors held before the oldest are dropped. */
  indexLimit?: number;
  /** `'anchored'` floats beside the cell; `'docked'` uses a side panel. */
  mode?: CommentDisplayMode;
  /** Restricted markdown in bodies: emphasis, code and links only. */
  markdown?: boolean;
  /** Label for the row, so the panel says what is being commented on. */
  rowLabel?: (row: Row) => string;
}

export interface CommentsApi {
  /**
   * Whether comments can be used at all: there is a provider, and the grid's row identity
   * is stable enough to file a comment against.
   */
  readonly enabled: boolean;
  /** The cell whose thread is open, as a composite key, or null when none is. */
  readonly openKey: string | null;
  /**
   * The open thread's comments, or null when no thread is open. A comment still awaiting
   * the provider is in the list, flagged as pending.
   */
  readonly thread: Comment[] | null;
  /** Whether the open thread's bodies are still being fetched. */
  readonly loading: boolean;
  /**
   * Whether the index covers every row rather than only the ones that have been on screen.
   * The comments-only filter needs this first.
   */
  readonly complete: boolean;
  /** `'no-provider'`, `'no-row-identity'`, or null when available. */
  unavailable(): string | null;
  /**
   * The counts for one cell, or null when it carries no comments. This is what the marker
   * is drawn from.
   */
  at(rowId: string, colId: string): CommentDescriptor | null;
  /**
   * Ask the provider for index entries covering these rows — the visible columns unless
   * others are named. Debounced, so scrolling costs one fetch rather than one per frame.
   */
  request(rowIds: string[], fields?: string[]): void;
  /**
   * Open a cell's thread and resolve to its comments. The cell's current value is recorded
   * with anything written next, so a later reader can be told the number moved.
   */
  open(rowId: string, colId: string): Promise<Comment[] | null>;
  /** Close the open thread and drop its bodies. The optional reason is carried on the event. */
  close(opts?: { reason?: string }): void;
  /**
   * Add a comment to the open thread, optionally as a reply. It appears at once and is
   * rolled back if the provider rejects it; resolves to the stored comment, or null when
   * there is no open thread or no provider.
   */
  add(body: string, opts?: { parentId?: string; author?: object }): Promise<Comment | null>;
  /**
   * Change a comment's body in the open thread. Resolves to the stored comment, or null
   * when it could not be edited.
   */
  edit(commentId: string, body: string): Promise<Comment | null>;
  /** Delete a comment from the open thread. Resolves to whether it went. */
  remove(commentId: string): Promise<boolean>;
  /**
   * Resolve the open thread, so its cells stop counting as outstanding. Resolves to whether
   * it stuck.
   */
  resolve(): Promise<boolean>;
  /** Reopen the open thread. */
  unresolve(): Promise<boolean>;
  /**
   * Re-fetch the index for the rows already known, for when the application learns of a
   * change from elsewhere. The grid opens no transport of its own, so nothing tells it
   * otherwise.
   */
  refresh(): void;
  /**
   * Fetch the index for every row in the grid, not just the ones seen. Resolves to whether
   * the index is now complete.
   */
  loadAll(): Promise<boolean>;
  /**
   * How many unresolved threads sit on rows the current filter is hiding — so a reader who
   * filters and sees no markers is not left thinking there is nothing outstanding. 0 while
   * the index is incomplete, because then it cannot be known.
   */
  hiddenUnresolved(): number;
  /**
   * Narrow the grid to rows carrying comments, or with `unresolvedOnly` to those carrying
   * unresolved ones. Returns whether the filter could be applied — it needs a complete
   * index.
   */
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
/** Which family of buckets a column's facet histogram draws, or `none` for no histogram. */
export type FacetBoundsKind = 'numeric' | 'date' | 'category' | 'boolean' | 'none';
/** Why a facet histogram was not drawn. */
export type FacetSuppressedReason = 'type' | 'cardinality' | 'rows' | 'streaming' | 'no-provider' | 'disabled';
export interface FacetBounds {
  /**
   * Which family of buckets these are: `'numeric'`, `'date'`, `'category'`,
   * `'boolean'`, or `'none'` when the column has no histogram at all.
   */
  kind: FacetBoundsKind;
  /**
   * Where the bars are — a range per bar for an ordered column, a value per
   * bar for a categorical one. A column with absent values carries a final
   * `Empty` bucket, and a capped categorical one carries an `Other` bucket.
   */
  buckets: FacetBucket[];
  /** Set when no histogram was drawn, naming why. */
  suppressed?: FacetSuppressedReason;
  /** Distinct values, on categorical columns. */
  cardinality?: number;
  /** The time unit chosen, on date columns. */
  granularity?: FacetDateGranularity;
  /** The numeric strategy actually applied, which may differ from the request. */
  strategy?: FacetBucketStrategy;
  /** The smallest value the buckets span, on an ordered column. */
  min?: number;
  /**
   * The largest value the buckets span. The last bucket's top edge is
   * inclusive so the maximum has somewhere to land; every other bucket is
   * half-open.
   */
  max?: number;
}

/** A column's computed distribution. */
export interface FacetState {
  /**
   * Where the bars are. `null` until the column has been counted, or when it
   * has no histogram.
   */
  bounds: FacetBounds | null;
  /** Counts under every filter except this column's own. Aligned to `buckets`. */
  counts: Uint32Array | null;
  /** Counts with no filter applied, for the "40 of 200" reading. */
  unfiltered: Uint32Array | null;
  /** True while a recount is outstanding; draw the previous counts faded. */
  stale: boolean;
  /**
   * Why there is no histogram — `'disabled'`, `'type'`, `'rows'`,
   * `'streaming'`, `'cardinality'`, `'no-provider'` — or `null` when there is
   * one.
   */
  suppressed: string | null;
}

/** Per-column histogram settings, layered over the grid's. */
/** How a facet histogram's numeric buckets are placed across a column's values. */
export type FacetBucketStrategy = 'equal' | 'quantile' | 'log';
/** The calendar unit a date column's facet histogram buckets by. */
export type FacetDateGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
/** How a categorical facet histogram's bars are ordered. */
export type FacetBarOrder = 'count' | 'alpha';
/** What a facet histogram does with a categorical column past its cardinality limit. */
export type FacetOverflowMode = 'suppress' | 'topN';
export interface ColumnFacetConfig {
  /**
   * Whether this column draws a histogram under its heading. It layers over
   * the grid's `facets` settings rather than replacing them, and `facet: true`
   * on the column is the shorthand for turning it on without restating
   * anything else.
   */
  enabled?: boolean;
  /**
   * How many buckets to cut the values into. 20 by default. On a date column
   * it is a target rather than an exact count, since the granularity has to
   * land on real calendar units.
   */
  buckets?: number;
  /**
   * How numeric buckets are placed: `'equal'` width (the default),
   * `'quantile'` so each holds roughly the same number of rows, or `'log'`. A
   * log scale over values reaching zero or below falls back to equal width
   * rather than drawing nothing.
   */
  strategy?: FacetBucketStrategy;
  /**
   * The calendar unit a date column buckets by — hour through year. Chosen
   * automatically from the span and the wanted bucket count when unset.
   */
  granularity?: FacetDateGranularity;
  /**
   * How a categorical column's bars are ordered: `'count'`, commonest first
   * (the default), or `'alpha'`. Fixed against the unfiltered column so bars
   * do not reorder themselves under the pointer.
   */
  order?: FacetBarOrder;
  /**
   * How many distinct values a categorical column may have before `aboveLimit`
   * applies. 50 by default — beyond that a bar chart stops telling anyone
   * anything.
   */
  cardinalityLimit?: number;
  /**
   * What to do with a categorical column past the cardinality limit:
   * `'suppress'` (the default) draws no chart, `'topN'` draws the commonest
   * values and gathers the rest into one `Other` bar.
   */
  aboveLimit?: FacetOverflowMode;
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
  /**
   * The distribution behind a column's header histogram — its buckets, counts
   * and whether they are stale — scheduling the count if it has not run.
   * `null` when the column has no histogram.
   */
  get(colId: string): FacetState | null;
  /**
   * Why a column has no histogram — `'disabled'`, `'type'`, `'rows'`,
   * `'streaming'`, `'cardinality'`, `'no-provider'` — or `null` when it has
   * one.
   */
  suppression(colId: string): string | null;
  /**
   * The facet settings in force for a column, with the grid's defaults folded
   * in; the grid's own defaults when no column is named.
   */
  config(colId?: string): FacetConfig;
  /**
   * Recount every column whose distribution has been asked for. `immediate:
   * true` skips the debounce.
   */
  refresh(opts?: { immediate?: boolean }): void;
  /**
   * Whether a column's chart is drawn full height rather than as a collapsed
   * strip.
   */
  isExpanded(colId: string): boolean;
  /**
   * Expand or collapse a column's chart, toggling when no state is given.
   * Returns the state it is now in.
   */
  toggle(colId: string, open?: boolean): boolean;
  /**
   * Filter by one bucket, or by a range across several. It sets an ordinary
   * filter, so it undoes, saves and shows in the filter UI like any other. A
   * range is written as a `between` condition rather than a set of buckets, so
   * it stays meaningful when the bucketing changes. `additive` adds to a
   * categorical set instead of replacing it.
   */
  select(colId: string, from: number, to?: number,
         opts?: { additive?: boolean; gesture?: string }): boolean;
  /**
   * Remove this column's own facet filter and leave every other filter in
   * place.
   */
  clear(colId: string): boolean;
  /** Which of a column's buckets its current filter selects, as bucket indices. */
  selected(colId: string): number[];
  /** Every column whose chart is expanded, for a saved view. */
  expanded(): string[];
}

export interface UpdatesApi {
  /** Whether incoming updates are being held rather than applied. */
  readonly paused: boolean;
  /**
   * Hold incoming updates so the rows stop moving. They keep merging while
   * held, so a long pause costs one entry per changed row rather than one per
   * update. `false` when they were already held.
   */
  pause(): boolean;
  /**
   * Apply everything held and go back to applying as changes arrive. Returns
   * the rows added, updated and removed.
   */
  resume(): ChangeResult;
  /**
   * Apply what is waiting without leaving the paused state — one step forward,
   * which is what a scrubber wants. Returns the rows added, updated and
   * removed.
   */
  flush(): ChangeResult;
  /**
   * Counters for the feed and the buffer: what arrived, what is still waiting,
   * how much coalescing saved, and what was dropped or held.
   */
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
  /**
   * The timestamped changes still held, oldest first. `since` narrows it to a
   * time window.
   */
  log(opts?: { since?: number }): { at: number; change: RowChange; rows: number }[];
}

/**
 * Moving the grid through recent data changes. Reads the change log rather
 * than the undo history: history records what the *user* did, and the question
 * on a live grid is what the *data* did. Nothing is scrubbable until
 * `attach()`: what a value used to be is not recoverable after the fact.
 */
export interface TimelineApi {
  /**
   * Whether the scrubber is recording. Nothing is scrubbable until it is: what
   * a value used to be cannot be recovered after the fact.
   */
  readonly attached: boolean;
  /**
   * Whether the grid is showing the present rather than standing somewhere in
   * the past.
   */
  readonly live: boolean;
  /** How many steps back from the present the grid is standing; 0 is live. */
  readonly position: number;
  /**
   * How many steps back it is currently possible to go — the length of the
   * recorded window.
   */
  readonly depth: number;
  /**
   * Start recording what each change replaces. The scrubbable window fills
   * from this moment on; nothing before it is recoverable.
   */
  attach(): void;
  /** Stop recording and return the grid to the present. */
  detach(): void;
  /**
   * Stand a given number of steps back from the present, 0 being live. Returns
   * where it now stands, which may be short of what was asked for.
   */
  seek(steps: number): number;
  /**
   * Move by a relative number of steps, negative going back in time. Returns
   * where it now stands.
   */
  step(by: number): number;
  /**
   * Return to the present, applying everything that was stepped over. Returns
   * 0.
   */
  toLive(): number;
  /** The timestamp of the moment being shown, or `null` when the grid is live. */
  at(): number | null;
  /**
   * The range of time the scrubber can move over, or `null` when nothing is
   * recorded.
   */
  span(): { from: number; to: number } | null;
}

export interface PresentationApi {
  /** Whether a presentation is running. The grid only dims for a spotlight while it is. */
  readonly active: boolean;
  /** The enlargement in force, 1 being normal. Clamped to between 0.5 and 4. */
  readonly scale: number;
  /** The options the running presentation was started with. Empty once it stops. */
  readonly options: { scale?: number; chrome?: string[]; views?: string[]; from?: number; autoAdvance?: number };
  /**
   * The saved view ids being stepped through — the slides. Empty when the presentation is
   * just an enlargement.
   */
  readonly views: string[];
  /** Where in the sequence the presentation is, from 0, or -1 when there is no sequence. */
  readonly index: number;
  /** The view currently shown, or null when there is no sequence. */
  readonly viewId: string | null;
  /**
   * Begin presenting: enlarge the grid, keep only the named chrome, and step through
   * `views` from `from`. Returns true only when this call started it — calling it again
   * while presenting reconfigures the running presentation and returns false.
   */
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
  /**
   * Stop presenting and put the grid back: the scale, the chrome, the sequence and any
   * spotlight. Returns whether one was running.
   */
  stop(): boolean;
  /** Set the enlargement, clamped to 0.5-4, and return the scale now in force. */
  setScale(value: number): number;
  /**
   * Move the enlargement by steps of 0.1 — the live adjustment between a laptop and a
   * projector. Negative shrinks. Returns the scale now in force.
   */
  nudge(steps?: number): number;
  /**
   * Move through the sequence by this many views (1 by default, negative to go back).
   * Clamped at both ends rather than wrapping, so pressing forward on the last slide stays
   * there. Returns the position now shown, or -1 without a sequence.
   */
  step(by?: number): number;
  /**
   * Show a numbered position in the sequence, clamped into range. Returns the position now
   * shown, or -1 without a sequence. Stepping to a view clears the spotlight.
   */
  goTo(index: number): number;
  /**
   * Put the current view back exactly as it was saved, discarding the sorting and filtering
   * done while answering a question. Returns whether a view was restored.
   */
  reset(): boolean;
  /**
   * What is currently lit — rows by key, columns by id, or their intersection — or null
   * when nothing is. Cleared on every step, because a spotlight belongs to the point being
   * made.
   */
  readonly spotlight: { keys: string[]; colIds: string[] } | null;
  /**
   * Light rows, columns or their intersection and let the rest recede; call it with nothing
   * to clear. Returns whether anything is lit now. Calling it while no presentation is
   * running warns, because nothing dims outside one.
   */
  setSpotlight(target?: { keys?: string[]; colIds?: string[] } | null): boolean;
}

/**
 * Controls for the pivot presentation (§10): expand or collapse
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
  /** Whether a column's values are being obscured. */
  has(colId: string): boolean;
  /** Every redacted column id. */
  list(): string[];
  /**
   * Redact a column, or stop redacting it; returns the state it is now in.
   * Recorded on the undo timeline.
   */
  toggle(colId: string): boolean;
  /**
   * Obscure a column's values while leaving its heading, its width and the
   * shape of the data visible. This defeats a camera and a screen recorder,
   * not a reader: the values remain in the DOM, the clipboard and every
   * export. Use column permissions for anything that must not be read.
   */
  add(colId: string): void;
  /** Stop obscuring a column's values. */
  remove(colId: string): void;
  /** Replace the whole redacted set with these column ids. */
  set(ids: string[]): void;
  /** Stop obscuring every column. */
  clear(): void;
  /** Whether at least one column is being obscured. */
  readonly active: boolean;
}

export interface HighlightApi {
  /** Highlight a cell (`{key, colId}`), a row (`{key}`) or a column (`{colId}`). */
  (target: { key?: string; colId?: string } | string,
    opts?: { colour?: string; color?: string; duration?: number }): boolean;
  /** Clear one target, or every highlight when called with nothing. */
  clear(target?: { key?: string; colId?: string } | string): boolean;
  /**
   * Every highlight currently in force, with its scope, target, colour and
   * duration.
   */
  list(): { scope: string; key: string | null; colId: string | null; colour: string; duration: number }[];
  /**
   * The colour a cell is painted by the highlights in force, or `null` when it
   * is not highlighted.
   */
  colourFor(key: string, colId: string): string | null;
}

/**
 * The in-grid find bar's settings. `find: true` or an
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
  /** The key of the row the match is in. */
  key: string;
  /** The column the match is in. */
  colId: string;
  /** The display index, or -1 for a row pinned to an edge. */
  index: number;
  /** Which sticky strip a pinned row is in; null for a body row. */
  pinned: RowPin | null;
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
  /** How many matches were found in the rows that were actually searched. */
  total: number;
  /** False while the bar's sliced scan is still running, so a partial count is never read as final. */
  complete: boolean;
  /**
   * True when the search covered a window rather than the whole set — a paged
   * or streaming source. It is the flag that keeps `total` honest.
   */
  windowed: boolean;
  /** Rows the search actually read; a windowed source's not-yet-fetched placeholders are not counted. */
  loaded: number;
  /** The rows the source reports for the whole matching set, when it can say. */
  rows: number;
}

/** The current query and whether the bar is showing. */
export interface FindState {
  /** What is being searched for. Empty when nothing is. */
  text: string;
  /** Whether the search distinguishes case. Off by default. */
  caseSensitive: boolean;
  /**
   * Whether a cell must match the text entirely rather than contain it. Off by
   * default.
   */
  wholeCell: boolean;
  /** The columns being searched, or `null` for every visible column. */
  columns: string[] | null;
  /**
   * Whether the find bar is showing. It flips on a headless grid too, so a
   * host driving its own control can follow it.
   */
  open: boolean;
}

/**
 * In-grid find: locate text and step through where it
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
  /**
   * How many matches there are, which one is current, and how much of the data
   * was actually searched. `windowed` is the honest-scope flag: over a source
   * that pages, `loaded` is the rows the scan really read out of the `rows`
   * the source reports, never a first-page count dressed as the whole.
   */
  count(): FindCount;
  /** The match the grid is standing on, or `null` when there is none. */
  current(): FindMatch | null;
  /**
   * The query as it stands — the text, the options — together with whether the
   * find bar is open.
   */
  state(): FindState;
  /** How a cell is painted: the current match, another match, or nothing. */
  stateFor(key: string, colId: string): 'current' | 'match' | null;
}

export interface StateApi {
  /**
   * Capture the grid's current view — sort, filters, column order, widths, visibility,
   * grouping and the rest — as a plain, JSON-safe object. Columns the reader is not
   * permitted to see are stripped, because the presence of a column is itself information.
   */
  get(): GridState;
  /**
   * Restore a captured state, skipping the sections named in `skip`. Nothing throws: a
   * section that cannot be applied is listed in the report with a reason. The whole restore
   * is one logical change, so it makes one undo entry and one state event.
   */
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
  /**
   * Cover the grid body with an overlay: `'loading'`, `'empty'`, or a name of
   * your own, with an optional message.
   */
  show(kind: 'loading' | 'empty' | (string & {}), message?: string): void;
  /** Take the overlay away. */
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
  /**
   * Whatever else the action that was recorded needed to replay itself — the
   * writes behind an edit, the widths behind a resize. Private to the history
   * model's own apply path, and not a shape to depend on.
   */
  [key: string]: unknown;
}

export interface HistoryApi {
  /**
   * Undo the last action, whatever kind it was — an edit, a sort, a filter, a
   * column move — and repaint. Returns the step that was undone, or `null`
   * when there was nothing to undo.
   */
  undo(): HistoryEntry | null;
  /** Redo the last undone action. Returns the step that was redone, or `null`. */
  redo(): HistoryEntry | null;
  /** Whether there is anything on the timeline to undo. */
  canUndo(): boolean;
  /** Whether anything has been undone that could be redone. */
  canRedo(): boolean;
  /** What undo or redo would apply next, for labelling a button. */
  peek(direction?: 'undo' | 'redo'): HistoryEntry | null;
  /** The whole timeline, newest first. */
  list(): HistoryEntry[];
  /** Group everything `fn` does into one undoable step. */
  transaction(label: string, fn: () => void): HistoryEntry | null;
  /**
   * Drop the timeline. It announces the change like any other move, so an undo
   * button does not keep offering a step that no longer exists.
   */
  clear(): void;
}

/** What an imported view named the same as an existing one does: keep both, overwrite, or skip. */
export type ViewConflictPolicy = 'rename' | 'overwrite' | 'skip';
export interface ViewsApi {
  /**
   * Every saved view with its metadata — name, description, whether it is
   * shared — but not its stored state.
   */
  list(): SavedView[];
  /** One view in full, state included. `undefined` when there is no such view. */
  get(id: string): SavedView | undefined;
  /**
   * The id of the view currently applied, or `null` when the grid is not on a
   * named view.
   */
  readonly activeId: string | null;
  /**
   * Save the grid's current state as a named view and make it the active one.
   *
   * `id` naming an existing view overwrites it; `id` naming none creates a
   * view with that id, which is how a host with server-issued ids seeds the
   * store; with no `id`, a name already taken is overwritten rather than
   * duplicated.
   */
  save(name: string, opts?: {
    id?: string;
    shared?: boolean;
    description?: string;
    isDefault?: boolean;
  }): SavedView;
  /**
   * Apply a view and make it active. It is a destination, not a patch: the
   * grid returns to its baseline first, so the same view gives the same grid
   * whatever was applied before it. The whole restore is one undo entry.
   * Returns the state report, or `null` when there is no such view.
   */
  apply(id: string): SavedView | null;
  /**
   * Give a view a new name. `null` when the name was refused — blank, or
   * already taken.
   */
  rename(id: string, name: string): SavedView | null;
  /**
   * Copy a view, optionally under a new name. `null` when there is no such
   * view.
   */
  duplicate(id: string, name?: string): SavedView | null;
  /**
   * Delete a view. `false` when there was no such view; deleting the active
   * one leaves the grid as it is, with no active view.
   */
  remove(id: string): boolean;
  /** Mark the view applied on load; null clears it. */
  setDefault(id: string | null): SavedView | null;
  /** The view marked as the one to apply on load, or `null` when none is. */
  defaultView(): SavedView | null;
  /** What applying the view would change, without applying it. */
  diff(id: string): Record<string, unknown> | null;
  /**
   * A shareable payload for one view, or for every view when no id is given —
   * an object, not JSON text, so a host can add to it before sending it.
   * `null` when the id names no view. The default marker never travels: it
   * belongs to this user's store, not to the view.
   */
  export(id?: string): ViewPayload | null;
  /**
   * Take a shared payload — the object, its JSON text, a bare view or a bare
   * array — and report what was imported, skipped and repaired. It reports
   * rather than throwing: an import that fails silently is worse than one that
   * says so, and one bad entry never rejects the rest of the file.
   */
  import(json: ViewPayload | SavedView | SavedView[] | string, opts?: {
    /** What a name already in the store does. `'rename'` (the default) keeps both. */
    onConflict?: ViewConflictPolicy;
    /** Overrides the shared flag on every incoming view. */
    shared?: boolean;
  }): ViewImportReport;
  /** Re-read from storage, after another tab or the server changed it. */
  reload(): void;
}

/** What {@link ViewsApi.export} produces and {@link ViewsApi.import} accepts. */
export interface ViewPayload {
  /** Marks the object as a Lattice view payload. */
  kind: string;
  /** The payload format version, so an older file can be read or refused. */
  version: number;
  /** When it was exported, in epoch milliseconds. */
  exportedAt: number;
  /** The views themselves, each with `isDefault` cleared. */
  views: SavedView[];
}

/** What {@link ViewsApi.import} reports. */
export interface ViewImportReport {
  /** The views that were stored, as metadata — the state is not repeated. */
  imported: Omit<SavedView, 'state'>[];
  /** Each view that was not stored, with a reason in words a host can show. */
  skipped: { name: string; reason: string }[];
  /** Each state section that was dropped from an otherwise valid view. */
  repaired: { name: string; key: string; reason: string }[];
}

export interface DiffApi {
  /** Exchange the baseline and the current rows. Returns false with nothing to swap. */
  swap(): boolean;
  /** Whether a baseline is loaded and the grid is diffing against it. */
  readonly enabled: boolean;
  /** Set the baseline every row is compared against. */
  setSnapshot(rows: unknown[] | null): void;
  /** Drop the baseline and stop diffing. */
  clear(): void;
  /**
   * How many rows are added, removed, changed and unchanged against the
   * baseline.
   */
  summary(): { added: number; removed: number; changed: number; unchanged: number };
  /**
   * How one row stands against the baseline: `'added'`, `'removed'`,
   * `'changed'` or `'unchanged'`.
   */
  statusOf(key: string): 'added' | 'removed' | 'changed' | 'unchanged';
  /** Whether one cell differs from the baseline. */
  cellStatus(key: string, colId: string): 'changed' | 'unchanged';
  /**
   * Whether a cell differs from the baseline — or, with no column given,
   * whether the row does.
   */
  isChanged(key: string, colId?: string): boolean;
  /** Which of a row's columns differ from the baseline. */
  changedColumns(key: string): string[];
  /** The value a cell held in the baseline. */
  before(key: string, colId: string): unknown;
  /** The whole row as the baseline holds it. */
  beforeRow(key: string): unknown;
  /** The keys present in the baseline and gone from the current rows. */
  removedKeys(): string[];
  /**
   * The rows present in the baseline and gone from the current rows, as their
   * original objects.
   */
  removedRows(): unknown[];
  /**
   * A full record of one row's changes — old value and new, per column — for
   * an audit log.
   */
  report(): Record<string, unknown>;
}

export interface PermissionsApi {
  /**
   * The permission level resolved for a column against the current context:
   * `'hidden'`, `'read'`, `'write'` or `'writeOnly'`.
   */
  levelOf(column: string | ResolvedColumn): PermissionLevel;
  /**
   * Whether a column is withheld from this user entirely — it is not in
   * `columns.all()` and its values never reach the row.
   */
  isHidden(column: string | ResolvedColumn): boolean;
  /**
   * Whether this user may see the column's values. Not the same question as
   * `isHidden`: a write-only column is on screen and editable and still fails
   * this.
   */
  isReadable(column: string | ResolvedColumn): boolean;
  /** Whether this user may edit the column. */
  isEditable(column: string | ResolvedColumn): boolean;
  /** True only at `writeOnly`: writable, never shown or exported. */
  isSecret(column: string | ResolvedColumn): boolean;
  /** Whether the column may leave through an export or the clipboard. */
  isExportable(column: string | ResolvedColumn): boolean;
  /** Every column's resolved level, keyed by column id. */
  levels(): Record<string, PermissionLevel>;
  /** Change the context permissions are evaluated against, and re-evaluate. */
  setContext(context: unknown): void;
  /**
   * Re-resolve every column against the context as it stands — for a policy
   * whose inputs changed without the context object being replaced.
   */
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
  /**
   * The complete prompt for a question: the schema, the rules the plan validator enforces,
   * and the user's text. Use it when you want the shipped prompting; use `prompt()` and
   * compose your own when you do not.
   */
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
  /**
   * Install a licence key for this page. Returns the provisional verdict at
   * once; verification is asynchronous, and `licence:changed` fires again when
   * it settles, so an optimistic watermark can come down.
   */
  set(key: string): LicenceInfo;
  /**
   * The current verdict: who the licence is for, which domains it covers, when
   * it expires, and whether it verified.
   */
  info(): LicenceInfo;
  /**
   * What this deployment is running as: `'licensed'`, `'localhost'` (free,
   * never watermarked) or `'trial'`.
   */
  state(): 'licensed' | 'localhost' | 'trial';
  /**
   * Whether the trial watermark should be drawn. The DOM layer reads this; a
   * headless grid can too.
   */
  watermark(): boolean;
  /** Settles when the licence check finishes. */
  readonly ready: Promise<LicenceInfo>;
}

export interface PaginationApi {
  /**
   * The current page, its size, the total rows and how many pages they make.
   * Zeroes with one page on a source that does not page.
   *
   * `total` is `null` and `counting` is `true` while a source is still working
   * out its exact total. A pager reading a total in that gap
   * would offer a last page that is nowhere near the end; with none it degrades
   * to "there is a next page", which is what it already does for a source that
   * cannot count at all.
   */
  get(): {
    page: number; pageSize: number; total: number | null; pageCount: number; counting: boolean;
  };
  /**
   * Move to a page, change the page size, or both, recording one undo entry. A
   * page size of 0 turns paging off and shows everything.
   */
  set(next: { page?: number; pageSize?: number }): void;
  /**
   * The same move without a separate undo entry — for a control that is
   * already inside a transaction of its own. Does nothing when neither value
   * changes; emits `page:changed` when one does.
   */
  applyPage(next: { page?: number; pageSize?: number }): void;
}

/**
 * Fills the browser window with the grid and puts it back. Present on grids
 * created with `createGrid` unless `maximise: false`; never on a headless grid,
 * which has no window to fill.
 */
/** What a cell-menu builder and a host item's `action` are handed. */
export interface CellMenuParams {
  /** The key of the row the menu opened on. */
  key: string;
  /**
   * The column under the pointer, or `null` when the row belongs to no column:
   * a right-click in the empty tail of a row beyond the last column, or on a group row, pivot group row or full-width row.
   * The grid-level menu stands in that case.
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
  /** The row's display index. */
  index: number;
  /** The grid instance, so an item's action can do whatever it needs to. */
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
  /** The grid instance, for anything the parameters above do not carry. */
  grid: Grid;
  /** The element to fill. Write into it directly, or return content instead. */
  element: HTMLElement;
}

/** What `fullWidth.render` is handed. */
export interface FullWidthParams {
  /** The grid's row wrapper for this row. */
  row: Row;
  /** Your original row object. */
  data: unknown;
  /** Display index of the row. */
  index: number;
  /** The grid instance. */
  grid: Grid;
  /** The element to fill. Write into it directly, or return content instead. */
  element: HTMLElement;
}

/** What a column menu's item builder and its actions are handed. */
export interface ColumnMenuParams {
  /** The id of the column whose menu opened. */
  colId: string;
  /** The resolved column, including any properties you defined on it. */
  column: ResolvedColumn;
  /** The grid instance, so an item's action can reach the rest of it. */
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
  /** The grid instance the rail belongs to. */
  grid: Grid;
  /** The keys of the selected rows at the moment the action ran. */
  keys: string[];
  /**
   * The cells inside the selected ranges at the moment the action ran, as row
   * key and column id pairs.
   */
  cells: { key: string; colId: string }[];
}

export interface RailAction {
  /**
   * The action's identity, used to place it in the rail's order and, when
   * `icon` is absent, tried as the icon name — so an action named after a
   * built-in glyph needs no separate icon.
   */
  name: string;
  /**
   * The hover and accessible label. A function form is re-read on every
   * repaint, so a toggle can change what it says with its state.
   */
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
  /**
   * What pressing the button does. It receives the grid and the selection as
   * it stood when the button was pressed.
   */
  run(params: RailActionParams): void;
  /**
   * Whether the button is usable. Re-read on every repaint, so a button greys
   * out as the selection changes. Always enabled when absent.
   */
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
  /**
   * Fill the window with the grid, remembering where it came from and its
   * scroll position. `true` once it is maximised, including when it already
   * was.
   */
  enter(): boolean;
  /**
   * Put the grid back where it came from, scroll position included. `false`
   * when it was not maximised.
   */
  exit(): boolean;
  /**
   * Maximise, or restore when already maximised. Returns whether the grid is
   * maximised afterwards.
   */
  toggle(): boolean;
  /** Whether the grid is currently filling the window. */
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
  /**
   * One configuration value, as it stands after defaults and validation — not
   * what was passed in. Typed by the key, so `get('rowHeight')` is a number
   * without a cast.
   */
  get<K extends keyof GridConfig>(key: K): GridConfig[K];
  /**
   * Write one configuration value, doing only the work that key implies. Every
   * key is settable at runtime — there is no "initial options" versus "live
   * options" distinction to learn — and `config:changed` follows, after the
   * grid has rebuilt.
   */
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

  /**
   * The grid's icon registry, read-only.
   *
   * The same sprite set `registerIcon` writes to and every cell paints from,
   * reachable from the grid instance so that code outside the grid bundle — an
   * optional module drawing its own glyph, a network chart putting a `router`
   * on a node — draws from the one registry rather than a second, empty copy of
   * it. Register with `registerIcon` or `config.icons`, as before.
   */
  readonly icons: IconRegistryApi;

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
  /**
   * The symbol shown beside the number, and the name this unit is referred to
   * by — `'kB'`, `'ft'`, `'°C'`.
   */
  symbol: string;
  /**
   * How many of the system's base quantity one of this unit is worth — 1,000
   * for a kilobyte in a system based on bytes. Conversion is this ratio, which
   * is why the base unit's factor is 1.
   */
  factor: number;
  /**
   * Lowercase spellings that unambiguously mean this unit, so typed input
   * reads `kilobytes` and `kilobyte` as `kB`.
   */
  aliases: readonly string[];
  /**
   * Whether this is a power-of-two unit (KiB, MiB), which puts it on the
   * binary ladder rather than the decimal one.
   */
  binary: boolean;
  /**
   * The bare SI-style prefix this unit carries — `m`, `G` — or `null` for a
   * unit that has none.
   */
  prefix: string | null;
  /**
   * Whether `display: 'auto'` may choose this unit. On by default; turn it off
   * for a unit that would break the ladder's coherence, as inches and feet do
   * among metres.
   */
  auto: boolean;
}

/** How a column stores, parses and renders a quantity. */
/** Whether a unit's symbol is written before the number or after it. */
export type UnitSymbolPlacement = 'suffix' | 'prefix';
export interface UnitConfig {
  /**
   * Which unit system the column measures in — `'data'`, `'length'`, `'mass'`
   * and the rest, plus anything registered with `registerUnitSystem`. `'data'`
   * by default; an unknown name warns and names the systems that exist.
   */
  system?: string;
  /**
   * The unit the stored numbers are in. Everything else — conversion, the
   * display ladder, parsing — is relative to this. Defaults to the system's
   * base unit, and an unknown symbol warns and falls back to it.
   */
  unit?: string;
  /**
   * Use the power-of-two ladder — KiB, MiB, GiB — instead of the power-of-ten
   * one. Off by default.
   */
  binary?: boolean;
  /**
   * A fixed number of decimal places: it sets the minimum and the maximum to
   * the same figure.
   */
  decimals?: number;
  /** The fewest decimal places to show, padding with zeros. 0 by default. */
  minDecimals?: number;
  /**
   * The most decimal places to show. Two by default, or the minimum when that
   * is higher.
   */
  maxDecimals?: number;
  /**
   * Which unit to render in: a symbol from the system, or `'auto'` to pick the
   * largest rung the value fills — 1,500,000 bytes as `1.5 MB`. Unset renders
   * in the stored unit. Display only: the stored number never changes, so
   * sort, filter and totals are unaffected.
   */
  display?: string;
  /** The BCP-47 locale the number is formatted in. The grid's by default. */
  locale?: string;
  /** Whether to group thousands. On by default. */
  group?: boolean;
  /**
   * What sits between the number and the symbol. A single space by default when
   * the symbol trails (`1,200 kg`) and nothing when it leads, which is how a
   * leading symbol is written. An explicit value wins either way.
   */
  space?: string;
  /** Whether the symbol goes after the number (the default) or before it. */
  placement?: UnitSymbolPlacement;
  /** Render one stored number across an ordered subset of the system's units,
   *  e.g. `['ft', 'in']` for `5 ft 11 in`. Display and parse only: the stored
   *  value stays a single base-unit number, so sort, filter and total are
   *  unchanged. Parsing sums the parts. */
  compound?: string[];
  /**
   * Round to this many significant figures before the rung is chosen, so
   * 999,999 B at three figures reads `1 MB` rather than `1,000 kB`. Off when
   * unset or not a positive number; ignored by a `compound` column, which
   * renders across units instead.
   */
  significantFigures?: number;
  /**
   * What to show for a value that is not a finite number — null, undefined,
   * empty, or unparseable text. Empty by default.
   */
  nullDisplay?: string;
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
  /**
   * How much, as a plain number. It must be finite for the value to be
   * accepted.
   */
  amount: number;
  /**
   * The ISO currency code the amount is in, normalised to upper case. It is
   * part of the value, not a display setting: 10 USD and 10 EUR are different
   * values and never compare as equal.
   */
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
/** Whether a rise in a KPI stat's value counts as good news. */
export type StatGoodDirection = 'up' | 'down' | 'neither';
/** Which of a grid's rows feed a KPI stat's value. */
export type StatFollowScope = 'filtered' | 'all' | 'selected';
export interface StatConfig extends StatValueSpec {
  /**
   * The grid the tile reads from, follows and resolves its container selector against. A
   * tile with a literal `value` needs none.
   */
  grid?: Grid;
  /** An element, or a CSS selector resolved against the grid's document. */
  container: HTMLElement | string;
  /** The label above the value. Omitted, the label element is hidden rather than left empty. */
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
  goodWhen?: StatGoodDirection;
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
  scope?: StatFollowScope;
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
  /**
   * The tile's root element. Null when the tile was misconfigured — a missing container or
   * document returns an inert handle rather than throwing, so one bad tile does not take
   * the dashboard with it.
   */
  element(): HTMLElement | null;
  /**
   * The value currently shown, as computed rather than as formatted. Null on an inert
   * handle.
   */
  value(): unknown;
  /**
   * Recompute and repaint now. Works even on a tile with `live: false`, which is the point
   * of it.
   */
  refresh(): void;
  /** Stop following the grid and remove the tile from the document. */
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
   * the engine and the client by the design-time `aggregates` config. Ungrouped, returns the engine-computed `values`
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
 * Load a JSON or NDJSON file from a URL.
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
/** A URL source's file format: a whole JSON document, or newline-delimited JSON. */
export type UrlSourceFormat = 'json' | 'ndjson';
export function createUrlSource(
  url: string,
  opts?: {
    /** Explicit format; wins over inference. */
    format?: UrlSourceFormat;
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
 * The pushdown map: one published record per statistic
 * giving whether the engine can express it, the DuckDB aggregate SQL it emits,
 * and whether that result is IDENTICAL to the grid's own kernel or MAY-DIFFER.
 * The single source of truth the push router, the docs and `lastPlan()` all read.
 */
export const STAT_PUSHDOWN: Readonly<Record<string, {
  pushable: boolean;
  class: PushdownClass;
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
   * `POST /EntitySet` reading the created entity back (§7 OData).
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
   * (§7 REST).
   */
  edit?: boolean;
  /**
   * The reconcile contract for a successful write (§5.1). `'none'` (the default)
   * is last-write-wins — the optimistic value stands; `'row'` reads the server's
   * authoritative row (via {@link writeRow}) back before confirm; `'key'` reads
   * only the server-assigned key. An add-row needs `'row'` or `'key'` so the
   * temp row can be rekeyed to its server key.
   */
  returning?: Returning;
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
   * same tick as the page query rather than serialised behind it. `false` issues no count statement, declares
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
   * be mutated by accident. Enables `update`, `delete` and `append`.
   */
  writable?: boolean;
  /**
   * The reconcile contract for a successful write (§5.1). `'row'` (the default)
   * appends `RETURNING *` and reconciles server truth (computed columns,
   * triggers); `'none'` keeps the optimistic value (last-write-wins). An add-row
   * always `RETURNING`s at least the key column regardless, since it needs that
   * key to rekey the temp row.
   */
  returning?: Extract<Returning, 'row' | 'none'>;
}): PushdownAdapter & {
  sqlFor(query: RemoteRequest): { sql: string; params: unknown[] };
  /**
   * The separate `count(*)` statement that reports the matching set's size, with
   * the same `WHERE` as {@link sqlFor} and no `ORDER BY` or `LIMIT`. `null` when the adapter was built with `count: false`.
   */
  countSqlFor(query: RemoteRequest): { sql: string; params: unknown[] } | null;
  /**
   * The `GROUP BY` statement one level of a grouped grid becomes, exposed like {@link sqlFor} so a test can read it without
   * an engine. `keyCol` is the grouping column at the request's depth and
   * `keyAlias` the name its value comes back under.
   */
  groupLevelSqlFor(
    query: RemoteRequest,
    aggregates?: Array<{ id: string; col: string; fn: string; weight?: string }>,
  ): { sql: string; params: unknown[]; keyCol: string; keyAlias: string };
  /**
   * The statement that counts the *groups* at one level — a `count(*)` over the
   * grouped sub-select, which is not the matching row count.
   * `null` when the adapter was built with `count: false`.
   */
  groupCountSqlFor(query: RemoteRequest): { sql: string; params: unknown[] } | null;
  /**
   * The row query for the leaves of a group: the page statement with the parent
   * group path ANDed onto its `WHERE`.
   */
  groupLeafSqlFor(query: RemoteRequest): { sql: string; params: unknown[] };
  /**
   * The count of leaves inside one group. `null` when the
   * adapter was built with `count: false`.
   */
  groupLeafCountSqlFor(query: RemoteRequest): { sql: string; params: unknown[] } | null;
  /**
   * The whole-matching-set summary that rides alongside a root-level grouped
   * fetch: the matching row count and the grand total in one statement.
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
 * An adapter for a GraphQL endpoint.
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
/** How a GraphQL adapter pages: an offset/limit list, or a Relay cursor connection. */
export type GraphqlPagination = 'offset' | 'cursor';
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
  pagination?: GraphqlPagination;
  /** The page size for the whole-result and forward-cursor walks. */
  pageSize?: number;
  /**
   * Whether the default query asks for `totalCount`. `true` by default.
   * `false` drops it from the selection set and declares
   * `capabilities.total: false`, so a grid that never shows a count does not
   * make the server compute one. Unlike the DuckDB adapter the
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

/**
 * The namespace object the script-tag build publishes, as a type.
 *
 * Named so that the ambient global below can refer to it: inside a
 * `declare global` block the identifier `LatticeGrid` is the global being
 * declared, so `typeof LatticeGrid` there would describe itself.
 */
export type LatticeGridGlobal = typeof LatticeGrid;

declare global {
  /**
   * The grid, as a `<script src>` page reaches it.
   *
   * The UMD bundle assigns its exports to `window.LatticeGrid`, and every
   * optional module bundle merges its own onto the same object. Declaring it
   * here is what gives a page that loads the grid from a CDN the same
   * completion and type-checking an `import` gets: without it the global is
   * untyped and every `LatticeGrid.createGrid(...)` is an error under
   * `noImplicitAny`.
   *
   * `var`, not `const` or `let`: only a `var` declaration in an ambient
   * global block becomes a property of the global object, which is what
   * `window.LatticeGrid` has to resolve against.
   */
  // eslint-disable-next-line no-var -- an ambient global is only a global as a var
  var LatticeGrid: LatticeGridGlobal;
}

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
/** The mark a combo chart's measure draws with. */
export type ChartMeasureType = 'bar' | 'line' | 'area';
/** The left or right side of a chart: a measure axis, or a combo measure's side. */
export type Side = 'left' | 'right';
export interface ChartMeasure {
  /** The column reduced for this measure. */
  col: string;
  /** A reduction name, as the totals row uses. */
  fn?: TotalName;
  /** The mark this measure draws with, on a combo chart. */
  type?: ChartMeasureType;
  /** Which axis it belongs to, on a combo chart. */
  axis?: Side;
  /**
   * The series label a combo's legend and axis titles use.
   * `label` is read too, as an undeclared alias, for a caller already using
   * it; `title` wins when both are given. Falls back to the measure column's
   * own `title`, then to `col`, when neither is set.
   */
  title?: string;
}

/** How a chart axis's scale is chosen, rather than taken from the column's type. */
export type ChartScale = 'auto' | 'linear' | 'time' | 'band' | 'category';
/** One axis's configuration. A bare string is the title. */
export interface ChartAxis {
  /**
   * The axis title. A bare string in place of this whole object is taken as
   * the title. `axis.y.title` names whatever the y values are and `axis.x.title`
   * whatever the x values are; each is drawn beside the axis that actually
   * carries those values, so on a type that swaps sides (`horizontalBar`) the
   * two titles swap with it.
   */
  title?: string;
  /** Fix the axis rather than taking its extent from the data. */
  min?: number;
  /** Fix the top of the axis rather than taking it from the data. */
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
   * Pin the x axis's scale rather than taking it from the column's type. The default, `'auto'`, is the rule stated in the charts
   * section: a temporal column type (`date`, `datetime`, `timestamp`,
   * `dateString`) draws a time axis, a numeric one draws a linear axis whatever
   * its distinct count, and everything else draws bands. `'band'` is how a
   * numeric code column — a quarter, a rating, a star count — asks for its
   * bands back; `'linear'` and `'time'` put a column the grid types as text
   * onto a continuous axis. Only the x axis reads it.
   */
  scale?: ChartScale;
  /** Show every nth category label, on a crowded category axis. */
  every?: number;
  /** Force the category labels' rotation rather than deciding it. */
  rotate?: boolean | 'auto';
  /**
   * A rolling window for the axis domain, in the shipped
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
 * One declarative annotation.
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
 * A trend or forecast overlay method. Each name has aliases:
 * `linear` (also `lr`, `ols`, `regression`); `movingAverage` (also `ma`, `sma`,
 * `rolling`); `exponential` (also `ewma`, `ses`, `holt`, `smoothing`).
 */
export type ChartTrendMethod = 'linear' | 'movingAverage' | 'exponential'
  | 'lr' | 'ols' | 'regression' | 'ma' | 'sma' | 'rolling'
  | 'ewma' | 'ses' | 'holt' | 'smoothing';

/** One trend or forecast overlay. */
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
  kind?: SmoothingMethod;
  /** For the exponential method, the level factor in `[0, 1]`; omit to fit it. */
  alpha?: number;
  /** For Holt's exponential smoothing, the trend factor in `[0, 1]`; omit to fit it. */
  beta?: number;
  /**
   * The uncertainty band shaded around a linear `forecast`.
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
 * One declarative annotation. A
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
 * user needs where and when, not only that a marker exists. An annotation the
 * chart cannot place — an x value it cannot resolve on the axis, or a band
 * whose edges are off-scale — is dropped with one console warning naming the
 * annotation's kind, the axis and the reason, rather than vanishing without a
 * trace.
 */
/** What kind of chart annotation this is. */
export type ChartAnnotationKind = 'line' | 'target' | 'band' | 'callout' | 'event';
/** A named reduction a chart annotation's `compute` derives its position from. */
export type ChartAnnotationCompute = 'mean' | 'avg' | 'median' | 'min' | 'max';
/** Whether a chart annotation is forced horizontal or vertical. */
export type ChartAnnotationOrient = 'horizontal' | 'vertical';
/** Which measure axis a chart annotation reads: left, right, or the secondary y2. */
export type ChartAxisSide = 'left' | 'right' | 'y2';
export interface ChartAnnotation {
  /**
   * The default is a reference line. `event` is a labelled vertical marker with
   * a flag at a position on the x axis, described into the accessible table with
   * that position stated.
   */
  kind?: ChartAnnotationKind;
  /** A constant value, for a line, target or callout's measure position. */
  value?: number;
  /** A reduction of the annotated data instead of a constant. */
  compute?: ChartAnnotationCompute | string;
  /**
   * A band's two edges. On a horizontal band each is a measure value, a constant
   * or (with `fromCompute`/`toCompute`) computed. On a vertical band (`orient:
   * 'vertical'`) each is an x position — a category or a number
   * — and the band shades the x-range between them: an event window, a
   * maintenance period, a recession.
   */
  from?: number | string;
  /**
   * A band's far edge — a measure value on a horizontal band, an x position on a vertical
   * one.
   */
  to?: number | string;
  /** Compute a band's near edge from the data instead of stating it, by reduction name. */
  fromCompute?: string;
  /** Compute a band's far edge from the data instead of stating it. */
  toCompute?: string;
  /** A vertical line's, event marker's or callout's x position: a category or a number. */
  x?: unknown;
  /** An alias for `x`, read when `x` is absent. */
  at?: unknown;
  /**
   * Force a line vertical rather than horizontal, or shade a `band` across an
   * x-range rather than a measure range.
   */
  orient?: ChartAnnotationOrient;
  /** Which measure axis the annotation reads. */
  axis?: ChartAxisSide;
  /** Restrict a `compute` to one series, by its key. */
  series?: string;
  /**
   * The text drawn beside the annotation, and the sentence it contributes to the accessible
   * table. Omitted, the annotation is drawn unlabelled.
   */
  label?: string;
  /** The annotation's stroke, and a band's fill. Defaults to `currentColor`. */
  colour?: string;
  /** A band's fill opacity; the default is 0.12. */
  opacity?: number;
  /**
   * Extra class names on the annotation's element, so a stylesheet can reach one annotation
   * in particular.
   */
  className?: string;
}

/** Where a chart data label sits relative to its mark. */
export type ChartLabelPosition = 'outside' | 'inside' | 'auto';
/** Data labels beside each mark. */
export interface ChartLabels {
  /**
   * Where a label sits relative to its mark. `outside` (the default) puts it past the
   * mark, away from the baseline; `inside` and `auto` prefer within the mark and fall
   * back outside when it will not fit. An outside label with no room above it falls
   * inside whatever this says, rather than being dropped from the tallest bar.
   */
  position?: ChartLabelPosition;
  /** A format mask, or a function of the value. */
  format?: string | ((value: unknown, point?: unknown) => string);
  /** Pixels two labels must leave between them before both are kept. */
  minGap?: number;
}

/**
 * An optional geometry pack for a geomap, as one of the `modules/geo-*`
 * packages exports. Generated at build time from a named
 * public source; `source`, `licence` and `attribution` record where the
 * geometry came from and what its licence requires. A single-layer pack
 * carries `topology` directly; a multi-layer pack (the UK) carries `layers`
 * instead, keyed by layer name, each with its own `topology`.
 */
export interface GeoPack {
  /**
   * The pack's identity, which `shapes: { pack: id }` names once the module has been
   * imported.
   */
  id: string;
  /** What the pack covers, in words — for a picker or a caption. */
  title: string;
  /**
   * The family of geometry the pack holds (`world`, `uk`, `us-states`, …), so a host can
   * tell two packs apart without parsing the id.
   */
  kind: string;
  /**
   * The projection this geometry is meant to be drawn in; the chart uses it unless the spec
   * names its own.
   */
  projection?: ChartSpec['projection'];
  /**
   * The settings that projection needs — a centre or standard parallels — chosen for the
   * region the pack covers.
   */
  projectionOptions?: ChartSpec['projectionOptions'];
  /**
   * Where the geometry came from: the publisher, the URL, the edition, and the date it was
   * retrieved.
   */
  source: { name: string; url: string; version: string; retrieved: string };
  /** The licence the geometry is published under, by name and URL. */
  licence: { name: string; url: string };
  /** The attribution line the licence requires, verbatim, or `''` when it asks for none. */
  attribution: string;
  /**
   * The pack's geometry, as TopoJSON. Single-layer packs carry it here; a multi-layer pack
   * carries `layers` instead.
   */
  topology?: object;
  /**
   * A multi-layer pack's geometries, keyed by layer name, each with its own title and
   * topology — regions, local authorities and constituencies share a coastline, so they
   * ship together.
   */
  layers?: Record<string, { name: string; topology: object }>;
  /**
   * Which layer is drawn when the spec names none. Unset, the first layer in the object is
   * used.
   */
  defaultLayer?: string;
}

/**
 * What a chart draws and how.
 *
 * `grid` and `container` are required; everything else describes the chart.
 * A chart reads the grid's *filtered* rows, so it follows the grid without
 * being told to.
 */
/** Which correlation a correlogram computes. */
export type CorrelationMethod = 'pearson' | 'spearman' | 'kendall';
/** A geomap's named projection; a caller may also supply a projection function directly. */
export type MapProjection =
  'equalEarth' | 'robinson' | 'mercator' | 'equirectangular' | 'albers'
  | 'transverseMercator' | 'britishNationalGrid';
export interface ChartSpec {
  /**
   * The grid the chart draws. It reads the grid's filtered rows and redraws when they
   * change, so the chart follows the table without being told to.
   */
  grid: Grid;
  /**
   * Where to draw: an element, or a CSS selector resolved against the grid's document. The
   * chart builds its own root inside it.
   */
  container: Element | string;
  /**
   * Which chart to draw. A name the base bundle does not know is looked up in the extension
   * registry, so an opt-in chart module's type works here once imported.
   */
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
  /** The column naming the link's destination, beside `source`. */
  target?: string;
  /** Row label and dates, for gantt. */
  label?: string;
  /** The start-date column, for a gantt chart. */
  start?: string;
  /** The end-date column, for a gantt chart. */
  end?: string;
  /** A heading above the plot, drawn in the figure's caption alongside any `subtitle`. */
  title?: string;
  /** A named scheme, or an array of colours. */
  scheme?: string | string[];
  /**
   * Show the series legend. The object form places it, and `isolate` lets a click on a
   * legend entry show that series alone.
   */
  legend?: boolean | { position?: 'top' | 'bottom' | 'left' | 'right'; isolate?: boolean };
  /**
   * Print the value beside each mark. `true` takes the defaults; the object form sets the
   * position, the format and the minimum gap. Only the chart types that support labels
   * honour it.
   */
  labels?: boolean | ChartLabels;
  /**
   * Per-axis configuration. Each side is a title string or an object of
   * `{ title, min, max, ticks, format, grid, labels }`. `y2` (or `right`)
   * configures the second measure axis of a dual-axis or combo chart; a dual-axis chart labels both axes by default so it
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
   * say which one it means.
   */
  brush?: boolean | 'filter' | 'zoom' | 'select'
    | { mode: 'filter' | 'zoom' | 'select'; axis?: 'x' | 'y' | 'y2' };
  /**
   * The type scale, as a base size in pixels or an object naming any of the roles (`size`,
   * `small`, `title`, `axisTitle`, `family`, `weight`). Anything left out is derived from
   * the base, so setting one size rescales the chart rather than leaving one label out of
   * step. The base defaults to 12.
   */
  font?: object;
  /**
   * Space in pixels around the plot: a number for every side, or an object for the ones it
   * names. It is the floor the axis-label gutters are added to, so widening the left margin
   * buys room beyond what the labels already needed. Defaults to 8.
   */
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
   * Trend and forecast overlays: a least-squares line, a
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
   * line. Fed by a fitted model's own interval — the `band`
   * from {@link StatisticsApi.regressionModel}, or as produced by
   * {@link regressionPlots} — so the ribbon and the diagnostics report the one
   * computation rather than a slope redrawn here. `line: false` suppresses the
   * band's own centre line, for a chart that already draws the fit with `fit`.
   *
   * Only where the x axis is numeric, for the same reason `fit` is.
   */
  band?: (RegressionBand & { line?: boolean }) | null;
  /**
   * An explicit point set, bypassing the by-column binder: a
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
   * — as the pack itself, or as `{ pack: id }` once its
   * module has been imported and registered.
   */
  shapes?: unknown;
  /**
   * Which GeoJSON feature property carries the region code that the rows are matched
   * against. Defaults to `iso_a2`. Unused when `shapes` is a map of code to path data.
   */
  codeProperty?: string;
  /**
   * The longitude column, for the types that place a row by where it is rather
   * than by a code: `markermap`, `bubblemap` and `hexmap`. Degrees east, -180
   * to 180; a row outside that, or with no reading, is left off the map and
   * counted.
   */
  lon?: string;
  /**
   * The latitude column, beside {@link ChartSpec.lon}. Degrees north, -90 to
   * 90, on the same terms.
   */
  lat?: string;
  /**
   * The measure a `markermap` writes beside each dot and colours it by. Its
   * text is the column's own formatted cell text and its colour is whatever
   * the column's conditional-formatting rules give that value, so a map and the
   * table beside it say the same thing about the same number.
   */
  value?: string;
  /**
   * Which layer of a multi-layer geometry pack to draw — the UK pack, for
   * instance, ships `regions`, `local-authorities` and `constituencies`
   * together. Ignored for a single-layer pack.
   */
  layer?: string;
  /**
   * The map projection a geomap draws through: `'equalEarth'`
   * (the default for a world), `'robinson'`, `'mercator'`, `'equirectangular'`,
   * `'albers'`, `'transverseMercator'`, or a projection function of the
   * caller's own `(lon: number, lat: number) => [number, number]`. Left unset,
   * a geometry pack draws through the projection it declares.
   */
  projection?: MapProjection | ((lon: number, lat: number) => [number, number]);
  /**
   * Parameters for the projections that take them: `parallels` and `centre`
   * for `albers`, `centre` for `transverseMercator`.
   */
  projectionOptions?: { parallels?: [number, number]; centre?: [number, number] };
  /**
   * A lon/lat reference grid under a geomap's regions, off by default. Only drawn over a geometry pack's fitted
   * projection — the schematic continents have no fitted projection to draw
   * one against. `step` is the spacing between lines in degrees (default 30).
   */
  graticule?: boolean | { step?: number };
  /** One chart per distinct value of this column. */
  multiples?: string;
  /** Draw to canvas past this many points. */
  canvas?: boolean | number;
  /**
   * How many points to reduce a dense line or scatter series to before drawing. Reduction
   * keeps the first point, the last, and the ones that carry the outline. Unset, the target
   * is the plot's width in pixels; a series is only reduced once it exceeds half again that
   * target.
   */
  downsample?: number;
  /**
   * What to show when there is nothing to draw. Defaults to the grid's own translated
   * empty-chart message.
   */
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
  /**
   * The largest bubble radius in pixels. Clamped to between 6 and 28, and 22 when unset;
   * the smallest bubble is always 3.
   */
  maxRadius?: number;
  /** Fix the measure axis rather than taking it from the data. */
  min?: number;
  /** Fix the top of the measure axis rather than taking it from the data. */
  max?: number;
  /** A geomap's ISO code column. An alias for `x`. */
  code?: string;
  /** Correlogram: which columns to correlate, how, and whether to print them. */
  columns?: string[];
  /**
   * Which correlation a correlogram computes. `spearman` uses the rank coefficient;
   * anything else — including `kendall`, which is not implemented — uses Pearson. The
   * figures come from the grid's own statistics, so the matrix cannot disagree with them.
   */
  method?: CorrelationMethod;
  /**
   * Print each coefficient inside its correlogram cell. On by default, and dropped anyway
   * where the cells are too small for the text to fit; set `false` to leave the matrix as
   * colour alone.
   */
  values?: boolean;
  /** Network layouts: how many relaxation passes to run. */
  iterations?: number;
  /**
   * The nodes of a `network`, named by the host rather than inferred from the
   * rows: an icon per device, a label, and a position the layout must honour.
   * A node listed here that appears in no row is still drawn. A node in the
   * rows that is not listed here takes the chart's `icon` default and its own
   * id as its label.
   */
  nodes?: ChartNode[];
  /**
   * The default glyph for a `network` node that names none of its own: any name
   * in the grid's icon registry (see {@link Grid.icons}). Unset, a node with no
   * icon is a plain disc.
   */
  icon?: string;
  /**
   * A `network` link's stroke width in pixels, fixed. Unset, width follows the
   * link's value as a share of the heaviest link, as it always has.
   */
  linkWidth?: number;

  /**
   * Control and capability charts: a tolerance overriding the column's own
   * `spec`, how many leading readings fix the control limits, which rule set
   * the violations are judged against, and the level for the capability
   * interval.
   */
  spec?: { lower?: number; upper?: number; target?: number };
  /**
   * How many leading readings fix a control chart's limits. The rest of the series is then
   * judged against them, which is how a step change shows up as a run of violations instead
   * of dragging the centre line to the middle. Unset, the whole series sets the limits.
   */
  baseline?: number;
  /**
   * Which run-rule set a control chart's violations are judged against. Defaults to
   * `westernElectric`.
   */
  rules?: ControlChartRuleSet;
  /**
   * The level of the capability interval printed with a capability chart, as a fraction
   * (0.95 for 95%).
   */
  confidence?: number;
}

/**
 * One node of a `network` chart, as the host declares it.
 *
 * `x` and `y` are fractions of the plot, 0 to 1, measured from its top-left. A
 * node giving both is **pinned** there and takes no part in the force
 * simulation; the rest are laid out around it, deterministically. Giving only
 * one of the two is not a position and the node is laid out.
 */
export interface ChartNode {
  /** Matches a value in the `source` or `target` column. */
  id: string;
  /** Drawn beneath the node. The id is used when this is absent. */
  label?: string;
  /** A name in the grid's icon registry, drawn inside the node's disc. */
  icon?: string;
  /** Where to pin it, as a fraction of the plot's width. */
  x?: number;
  /** Where to pin it, as a fraction of the plot's height. */
  y?: number;
}

/**
 * What every chart event carries, whatever it is about.
 *
 * The three members the chart's own dispatcher adds to each payload before it
 * reaches a handler, so one handler bound to several charts can tell which chart
 * and which grid it is being told about.
 */
export interface ChartEvent {
  /** Which event this is: `click`, `hover`, `leave`, `focus`, `draw`, `drill`, `brush` or `legend`. */
  type: ChartEventName;
  /** The chart that raised it. */
  chart: Chart;
  /** The grid the chart draws, as given in the spec. */
  grid: Grid;
}

/**
 * One series' reading under a mark, on a chart with several series.
 *
 * `value` is that series' own number at the mark, and `rows` how many source
 * rows were aggregated into it — a count, not the rows themselves.
 */
export interface ChartDatumSeries {
  /** The series key, as bound. */
  key: string;
  /** The series' display label. */
  label: string;
  /** This series' value at the mark. */
  value: number | null;
  /** How many source rows were aggregated into that value. */
  rows: number;
}

/**
 * A mark, in the terms a host thinks in: `hover`'s payload, and the shape
 * `click` adds its `preventDefault` to.
 *
 * One shape for every chart type, so a host need not know whether it attached to
 * a pie, a bar chart, a treemap, a map, a matrix or a network to read what the
 * pointer is on: a type with no third channel leaves the field null. There is no
 * `point` wrapper — the fields are flat.
 */
export interface ChartDatumEvent extends ChartEvent {
  /** The mark's label: the category, the slice, the tile, the region or the node. */
  label: string;
  /**
   * The measure under the mark when a single series sits there, otherwise null —
   * in which case the per-series numbers are in `series`.
   */
  value: number | null;
  /** The value to filter `column` to: the stored category behind the label, or null where the geometry has none. */
  category: unknown;
  /** The grid column the mark filters on, or null (a network node is a source in some rows and a target in others). */
  column: string | null;
  /** The per-series readings under the mark, or null on a geometry that has one value per mark. */
  series: ChartDatumSeries[] | null;
  /** The keys of the source rows behind the mark; empty where the geometry keeps none. */
  rowKeys: unknown[];
  /** The mark's path from the drawn root, on a hierarchy — a treemap tile, a sunburst arc, a flow end. */
  path?: unknown[];
  /** How deep the mark sits below the drawn root, on a hierarchy. */
  depth?: number;
  /** A histogram bin's lower bound, present only on a bin. */
  from?: number;
  /** A histogram bin's upper bound, present only on a bin. */
  to?: number;
  /** The DOM pointer event behind it. */
  native: object;
}

/**
 * `click`: a mark was clicked, **before** the chart does anything about it.
 *
 * The one event most callers want: it is how a click on a mark becomes a filter
 * on the grid. It fires whether or not the spec sets `filterOnClick`, and it
 * fires before the filter, the drill or the selection the chart would otherwise
 * apply — so a host that wants to do something else entirely (open a drawer,
 * cross-filter a second grid) calls `preventDefault()` and takes the click over.
 */
export interface ChartClickEvent extends ChartDatumEvent {
  /**
   * Stop the chart acting on this click — no filter, no drill, no selection
   * change. It takes no reason, and there is no `<action>:cancelled` event: this
   * is a default a host takes over, not a mutation a host vetoes.
   */
  preventDefault(): void;
  /**
   * True once a handler has called `preventDefault`. Absent until then — a
   * handler may also set it directly, which the chart honours the same way.
   */
  defaultPrevented?: boolean;
}

/**
 * `focus`: the keyboard moved onto a mark, which has just been given the
 * `aria-label` a screen reader announces.
 */
export interface ChartFocusEvent extends ChartEvent {
  /** The focused mark's label. */
  label: string;
  /** The focused mark's value. */
  value: number | null;
  /** The mark's position in the drawn order. */
  index: number;
}

/**
 * `draw`: the chart finished a draw, at its settled size.
 *
 * Raised once per `draw()`, after the second pass a legend or heading that
 * changed the plot box forces — so a handler never sees the in-between,
 * wrongly-sized pass. A draw that showed the empty state instead raises nothing.
 */
export interface ChartDrawEvent extends ChartEvent {
  /** The type drawn, which for an extension type is its registered name. */
  chartType: string;
  /** The categories drawn, in plot order. */
  categories: unknown[];
  /** Whether the binding had nothing to draw. */
  empty: boolean;
}

/**
 * `drill`: the chart descended into a hierarchy, or `ascend()` came back up.
 * Raised after the new level is set and before it is drawn.
 */
export interface ChartDrillEvent extends ChartEvent {
  /** The drill path from the top, a label per level. */
  path: unknown[];
  /** The label just descended into, or the level now shown after an `ascend()`. */
  label: string | null;
}

/**
 * `brush`: a range was dragged out on an axis, **before** the chart zooms or
 * filters on it.
 *
 * A handler that wants to take the brush over calls `preventDefault()` on the
 * payload, which stops the chart zooming its own domain or filtering the grid
 * for this drag; writing `defaultPrevented` directly still works, the same way.
 */
export interface ChartBrushEvent extends ChartEvent {
  /** What the spec asked a brush to do: `zoom` the chart's own domain, or `filter` the grid. */
  mode: string;
  /** What the dragged range resolved to: a continuous `range`, or the discrete `values` of a category axis. */
  kind: string;
  /** The category values the drag covered, on a category axis. */
  values: unknown[];
  /** The numeric or time bounds the drag covered, on a continuous axis, or null. */
  range: { from: unknown; to: unknown } | null;
  /** Which axis was dragged: `x`, `y` or `y2`. */
  axis: string;
  /** The grid column the range names — the measure's on a value axis, the dimension's on `x`. */
  column: string | null;
  /**
   * Stop the chart acting on this brush — no zoom, no filter. It takes no
   * reason, and there is no `<action>:cancelled` event: this is a default a
   * host takes over, not a mutation a host vetoes.
   */
  preventDefault(): void;
  /**
   * True once a handler has called `preventDefault`. Absent until then — a
   * handler may also set it directly, which the chart honours the same way.
   */
  defaultPrevented?: boolean;
}

/** `legend`: a legend entry was clicked and the hidden set already changed; the redraw follows. */
export interface ChartLegendEvent extends ChartEvent {
  /** The clicked entry's label. */
  label: string;
  /** The clicked entry's series key. */
  key: string;
  /** Whether that series is now hidden. */
  hidden: boolean;
  /** Every hidden series key after the click. */
  hiddenKeys: string[];
}

/**
 * The events a chart raises.
 *
 * A chart's own, not the grid's: `grid.on` takes {@link EventName} and knows
 * nothing about these. There is no `point:click`, `point:hover` or
 * `series:toggle`; the events are the flat names below, and `click` is the one
 * most callers want — it is how a click on a mark becomes a filter on the grid.
 *
 * Every payload carries `type`, `chart` and `grid` ({@link ChartEvent}); what
 * else arrives is {@link ChartEventPayloads}. A handler that throws is reported
 * to the console and the rest still run. Each event also fires the matching
 * `on<Event>` in the spec (`onClick`, `onDraw`, …) before the subscribers.
 *
 * `click` and `brush` are the two events the chart acts on, and both carry a
 * `preventDefault` a handler can call to take the action over; the rest are
 * notifications.
 */
export type ChartEventName =
  /** A mark was clicked, before the chart filters, drills or selects on it; cancellable. */
  | 'click'
  /** The pointer moved onto a mark and its tooltip was shown. */
  | 'hover'
  /** The pointer left every mark and the tooltip was hidden. */
  | 'leave'
  /** The keyboard moved onto a mark, which has just been described for a screen reader. */
  | 'focus'
  /** A draw finished, at the settled plot size; a draw that showed the empty state raises nothing. */
  | 'draw'
  /** The chart descended into a hierarchy, or `ascend()` came back up. */
  | 'drill'
  /** A range was dragged out on an axis, before the chart zooms or filters on it; cancellable. */
  | 'brush'
  /** A legend entry was clicked and the hidden set changed. */
  | 'legend';

/** What a handler receives, per chart event. */
export interface ChartEventPayloads {
  /** The mark clicked, with `preventDefault` to take the click over. */
  click: ChartClickEvent;
  /** The mark under the pointer, the same shape a click reports. */
  hover: ChartDatumEvent;
  /** Nothing but the chart and its grid: the pointer is over no mark. */
  leave: ChartEvent;
  /** The mark the keyboard is on. */
  focus: ChartFocusEvent;
  /** What was drawn, and whether there was anything to draw. */
  draw: ChartDrawEvent;
  /** The new drill path. */
  drill: ChartDrillEvent;
  /** The range dragged out, and the column it names, with `preventDefault` to take the brush over. */
  brush: ChartBrushEvent;
  /** The legend entry clicked, and every hidden series after it. */
  legend: ChartLegendEvent;
}

/** A live chart. */
export interface Chart {
  /**
   * The chart's root element — the wrapper the chart built inside the container, which
   * holds the heading, the SVG, the legend and the accessible table. The `<svg>` is a
   * descendant of it, not this element.
   */
  readonly element: HTMLElement;
  /** Redraw now. */
  draw(): void;
  /** Change the spec and redraw; unnamed keys keep their values. */
  update(spec: Partial<ChartSpec>): void;
  /** The data the chart last bound. */
  data(): object | null;
  /** Go up one level, on a drillable hierarchy. */
  ascend(levels?: number): void;
  /**
   * Register an event handler; returns a function that unsubscribes. A handler that throws
   * is reported to the console and the rest still run. What each event carries is
   * {@link ChartEventPayloads}; the handler is declared with the widest of them, so narrow
   * on the name inside it.
   */
  on(event: ChartEventName, handler: (payload: ChartEventPayloads[ChartEventName]) => void): () => void;
  /**
   * Fire an event at the subscribers and at the matching `on<Event>` in the spec, and
   * return the payload the handlers saw — which is how a caller reads back what a handler
   * changed.
   */
  emit(event: ChartEventName, payload?: object): object;
  /**
   * The chart as standalone SVG markup, empty string before the first draw. Pass `{
   * inlineStyles: true }` to copy the computed styles onto a clone, which is what an SVG
   * loaded as an image needs to look like the chart on screen.
   */
  toSVG(opts?: object): string;
  /**
   * Rasterise the chart through the browser, so the picture is the one it drew. Styles are
   * inlined first, and a white background is painted unless `background` says otherwise;
   * `scale` defaults to the device pixel ratio. Resolves to null where there is no canvas
   * or `Image`.
   */
  toPNG(opts?: { scale?: number; background?: string }): Promise<Blob | null>;
  /**
   * The numbers the chart is drawing, as CSV: one column per series, one row per category
   * (or label and total, for a hierarchy). Empty string before the first draw.
   */
  toCSV(): string;
  /**
   * Stop following the grid, disconnect the resize observer, stop any rolling-window timer,
   * remove the chart's element and drop every listener. Calling it twice is harmless.
   */
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Event payloads
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Event payloads, per event
// ---------------------------------------------------------------------------

/**
 * `render:done`: one render pass has finished writing cells.
 *
 * The pass is over and the cells are stable, which is why anything that
 * decorates them from outside — a highlight painter, a diff painter — hangs
 * off this rather than guessing at a frame delay.
 */
export interface RenderDoneEvent extends GridEvent {
  /** The first display index the pass drew, including the overscan either side. */
  first: number;
  /** The last display index the pass drew, inclusive; `-1` when there were no rows. */
  last: number;
  /** What asked for the pass — `'scroll'` unless something else invalidated first. */
  cause: string;
  /**
   * Milliseconds per phase. `layoutMs` is deciding what to draw, `hintMs` is
   * telling the source about it, `writeMs` is the DOM itself. The wait for
   * paint is the browser's and is not measurable here.
   */
  phases: { layoutMs: number; hintMs: number; writeMs: number; totalMs: number };
}

/**
 * `config:changed`: a configuration key was written at run time.
 *
 * `grid.set(key, value)` fills the single form; `grid.setAll(values)` fills the
 * batch form and fires once for the whole batch rather than once per key, so a
 * host restoring a saved arrangement hears one event describing a settled
 * grid instead of a dozen describing half-applied ones.
 */
export interface ConfigChangedEvent extends GridEvent {
  /** The key that was written, on a `grid.set` change. */
  key?: string;
  /** Its new value, on a `grid.set` change. */
  value?: unknown;
  /** What it held before, on a `grid.set` change. */
  oldValue?: unknown;
  /** The keys that were written, on a `grid.setAll` change. */
  keys?: string[];
  /** Their new values, by key, on a `grid.setAll` change. */
  values?: Record<string, unknown>;
  /** What each of them held before, by key, on a `grid.setAll` change. */
  oldValues?: Record<string, unknown>;
}

/** What a deployment is treated as, for licensing purposes. */
export type LicenceState = 'licensed' | 'localhost' | 'trial';
/** `licence:changed`: a key was installed, and again when its check settles. */
export interface LicenceChangedEvent extends GridEvent {
  /** The verdict as it stands — provisional on the first firing, settled on the second. */
  info: LicenceInfo;
  /** What this deployment is now treated as. */
  state: LicenceState;
}

/**
 * `model:changed`: the display model was rebuilt.
 *
 * The one event every viewer of the grid follows. `reason` is what actually
 * happened, and the rest of the payload is whatever that reason has to say —
 * a page's block and range, a tree branch's row, a stream's anchor.
 */
export interface ModelChangedEvent extends GridEvent {
  /**
   * Why it was rebuilt: `'rows'`, `'tree'`, `'expanded'`, `'children'`,
   * `'children:loading'`, `'reload'`, `'page'`, `'expand'`, `'collapse'`,
   * `'query'`, `'stream'`, or one of the pipeline's settle reasons.
   */
  reason: string;
  /** How many display rows there now are, or how many children arrived. */
  count?: number;
  /** The branch row a `'children'` or `'children:loading'` rebuild is about. */
  row?: Row;
  /** The row key an `'expand'` or `'collapse'` is about. */
  key?: string;
  /** The block id a `'page'` rebuild filled. */
  block?: string | number;
  /** The first display index a `'page'` rebuild filled. */
  from?: number;
  /** One past the last display index a `'page'` rebuild filled. */
  to?: number;
  /** The group path a remote source's `'page'` rebuild filled under. */
  groupPath?: unknown[];
  /** How far a stream's arrivals pushed the rows above the viewport down. */
  shiftAboveViewport?: number;
  /** The row the stream is holding the viewport against. */
  anchor?: unknown;
}

/**
 * `rows:changed`: rows were added, updated, removed or moved.
 *
 * **Read `identified` first.** When it is `true` the three arrays name exactly
 * the rows that moved and a derived viewer can patch rather than rescan. Every
 * other firing omits it, and a consumer that does not see it re-reads in full
 * (§5.8.1) — the default is deliberately the safe one.
 *
 * The `companion: true` firings carry **counts** in `added`/`updated`/
 * `removed`, not rows: they come from the source's own companion channel,
 * which has the numbers and not the records. Anything reading `.length` has to
 * check `identified` rather than assume an array (F-1688-B).
 */
export interface RowsChangedEvent extends GridEvent {
  /** True when `added`, `updated` and `removed` name exactly the rows that moved. */
  identified?: boolean;
  /** The rows added — records when `identified`, a count on a companion firing. */
  added?: Row[] | number;
  /** The rows updated — records when `identified`, a count on a companion firing. */
  updated?: Row[] | number;
  /** The keys removed — keys when `identified`, a count on a companion firing. */
  removed?: string[] | number;
  /** Rows the host could not apply; the rest of the batch still applied. */
  rejected?: RejectedRow[];
  /** How the change was planned and applied, for diagnostics. */
  plan?: unknown;
  /** True on the firings that echo a change the source has already applied. */
  companion?: boolean;
  /** The change as it was handed in, on a companion firing that carries one. */
  change?: RowChange;
  /** `'import'` on a CSV/Excel import; `'edit'`-side reasons name the write. */
  reason?: string;
  /** True when the change came from an edit commit rather than a data feed. */
  edit?: boolean;
  /** The column ids an edit wrote to. */
  columns?: string[];
  /** `1` when the change was a single row reorder. */
  moved?: number;
  /** The key of the row that moved. */
  key?: string;
  /** The display index it moved from. */
  from?: number;
  /** The display index it moved to. */
  to?: number;
}

/** `rows:queued`: a change arrived while the feed was batching and was queued. */
export interface RowsQueuedEvent extends GridEvent {
  /** How many changes are waiting to be applied. */
  pending: number;
  /** How many rows those changes carry. */
  queued: number;
  /** How many rows coalescing has saved on this queue. */
  coalesced: number;
  /** Whether the feed is currently paused. */
  paused: boolean;
}

/** `rows:deferred`: a flush ran out of frame budget and carried work over. */
export interface RowsDeferredEvent extends GridEvent {
  /** How many rows were carried into the next frame. */
  deferred: number;
  /** How many rows this flush did apply. */
  applied: number;
  /** The per-flush budget, in milliseconds, that ran out. */
  budgetMs: number;
}

/**
 * `rows:paused` and `rows:resumed`: the whole counter set the feed keeps,
 * which is what a host watching a live feed wants at the moment it stops or
 * starts. Identical to what `grid.changes.stats()` returns.
 */
export interface RowsFlowEvent extends GridEvent {
  /** Whether the feed is held. */
  paused: boolean;
  /** Changes waiting to be applied. */
  pending: number;
  /** Rows those changes carry. */
  queued: number;
  /** Rows coalescing saved on the current queue. */
  coalesced: number;
  /** Rows coalescing has saved over the grid's life. */
  coalescedTotal: number;
  /** Rows that have arrived over the grid's life. */
  rows: number;
  /** Rows dropped because the buffer was full. */
  dropped: number;
  /** Rows the change log is holding right now. */
  held: number;
  /** The most it will hold before trimming. */
  heldLimit: number;
  /** How many flushes have run. */
  flushes: number;
  /** The batching strategy in force. */
  strategy: string;
  /** Flushes that ran out of budget and carried work over; a rising number means the feed outpaces the grid. */
  deferrals: number;
  /** The largest queue seen. */
  maxQueued: number;
  /** The per-flush budget, in milliseconds. */
  budgetMs: number;
  /** The time span the held log covers, or null when it holds nothing. */
  span: { from: number; to: number } | null;
}

/** `row:received`: a row dragged from another grid was inserted here. */
export interface RowReceivedEvent extends GridEvent {
  /** The row's data, as it was inserted. */
  data: Record<string, unknown>;
  /** The display index it took. */
  at: number;
  /** The key of the row it was dropped on, or null when it landed on no row. */
  overKey: string | null;
  /** Rows the insert could not apply; empty on a clean insert. */
  rejected: RejectedRow[];
}

/**
 * `row:sent` and `row:copied`: a row left this grid for another one. `row:sent`
 * means it was removed from here, `row:copied` means it was kept.
 */
export interface RowTransferEvent extends GridEvent {
  /** The key of the row that was transferred. */
  key: string;
  /** That row's data, as the target received it. */
  data: Record<string, unknown>;
  /** Which gesture it was. */
  mode: RowTransferMode;
}

/** `row:moved`: a row was reordered within this grid. */
export interface RowMovedEvent extends GridEvent {
  /** The key of the row that moved. */
  key: string;
  /** The display index it came from. */
  from: number;
  /** The display index it went to. */
  to: number;
  /** That row's data. */
  data: Record<string, unknown>;
}

/**
 * `source:error`: a source could not fetch what was asked of it. Which of the
 * optional fields is present says what was being fetched.
 */
export interface SourceErrorEvent extends GridEvent {
  /** What the source threw or rejected with. */
  error: unknown;
  /** The branch row whose children could not be loaded. */
  row?: Row;
  /** `'loadChildren'` on a tree fetch; absent on a page or stream failure. */
  reason?: string;
  /** The block id that failed, on a paged or remote source. */
  block?: string | number;
  /** The display range that block covers. */
  range?: { start: number; end: number };
  /** The group path the failed block sits under, on a remote grouped source. */
  groupPath?: unknown[];
}

/**
 * `source:total`: a deferred exact total landed.
 *
 * A pushdown source whose count has to read data — a filtered query against a
 * remote Parquet file, where counting costs a second and a page costs a tenth
 * of one — delivers the rows as soon as the page settles and counts afterwards.
 * This is the count arriving: the number is exact, it fires once per query, and
 * until it does `grid.rows.totalCount()` is `null` and `grid.rows.totalPending()`
 * is `true`. A query whose total arrives with its rows never fires it.
 */
export interface SourceTotalEvent extends GridEvent {
  /** The exact number of rows the query matches. Never an estimate. */
  total: number;
  /** The group path the total counts, empty at the root of an ungrouped grid. */
  groupPath?: unknown[];
}

/** `stream:chunk`: a streaming source applied a chunk of arriving rows. */
export interface StreamChunkEvent extends GridEvent {
  /** Bytes or rows read so far, as the transport reports them. */
  loaded: number;
  /** What the transport expects in total, or 0 when it does not say. */
  estimated: number;
  /** How many rows the source now holds. */
  count: number;
  /** How many times the grid has been asked to repaint for this stream. */
  renders: number;
}

/** `stream:end`: a streaming source reached the end of its feed. */
export interface StreamEndEvent extends GridEvent {
  /** How many rows arrived in all. */
  loaded: number;
  /** True when the stream handed over to an in-memory source at the end. */
  promoted: boolean;
  /** The row count above which it would have promoted. */
  threshold: number;
}

/** `stream:evicted`: a rolling-window stream dropped rows off the back. */
export interface StreamEvictedEvent extends GridEvent {
  /** How many rows this eviction dropped. */
  evicted: number;
  /** How many rows have been evicted over the stream's life. */
  total: number;
  /** How many rows are still live in the window. */
  live: number;
}

/**
 * `cell:changed`: a cell's value was written.
 *
 * Fired by an edit commit, by a revert, and by each cell an undo or redo step
 * moves — `revert` and `undo` say which, and both are absent on a plain edit.
 */
export interface CellChangedEvent extends GridEvent {
  /** The row the cell belongs to. */
  row: Row;
  /** That row's key. */
  key: string;
  /** The column id that was written. */
  colId: string;
  /** The value the cell now holds. */
  value: unknown;
  /** The value it held before. */
  oldValue: unknown;
  /** True when the write put back a value the server refused. */
  revert?: boolean;
  /** Why it was reverted, or null. */
  reason?: string | null;
  /** True when the write came from an undo step rather than a redo. */
  undo?: boolean;
}

/** `cell:pending`: an optimistic cell edit was sent and is awaiting an answer. */
export interface CellPendingEvent extends GridEvent {
  /** The row the cell belongs to. */
  row: Row;
  /** That row's key. */
  key: string;
  /** The column id that was written. */
  colId: string;
  /** The value that was sent. */
  value: unknown;
  /** The value it is holding in reserve to put back if the write is refused. */
  before: unknown;
  /** The id the op is tracked under; `grid.edit.settle(id, …)` answers it. */
  id: string;
}

/** `cell:confirmed`: the server accepted a pending cell edit. */
export interface CellConfirmedEvent extends GridEvent {
  /** The row the cell belongs to. */
  row: Row;
  /** That row's key. */
  key: string;
  /** The column id that was written. */
  colId: string;
  /** What the server confirmed, which need not be what was sent. */
  value: unknown;
  /** The id the op was tracked under. */
  id: string;
  /** True when a newer write on the same cell had already replaced this one. */
  superseded: boolean;
}

/** `cell:reverted`: a pending cell edit was refused and rolled back. */
export interface CellRevertedEvent extends GridEvent {
  /** The row the cell belongs to. */
  row: Row;
  /** That row's key. */
  key: string;
  /** The column id that was written. */
  colId: string;
  /** The value the server refused. */
  rejected: unknown;
  /** The value put back, or `undefined` when a newer write owns the cell. */
  restored: unknown;
  /** Why it was refused, or null when the transport gave no reason. */
  reason: string | null;
  /** The id the op was tracked under. */
  id: string;
  /** True when a newer write on the same cell had already replaced this one. */
  superseded: boolean;
  /** True when the rollback was actually applied; false when it was superseded. */
  applied: boolean;
}

/** `cell:conflict`: the server confirmed, but returned a row that disagrees. */
export interface CellConflictEvent extends GridEvent {
  /** The row the cell belongs to. */
  row: Row;
  /** That row's key. */
  key: string;
  /** The column id that was written. */
  colId: string;
  /** What the server confirmed for the cell. */
  value: unknown;
  /** The row the server sent back, which the grid applied over its own. */
  serverRow: Record<string, unknown>;
  /** The id the op was tracked under. */
  id: string;
}

/**
 * The pointer events a cell raises: `cell:clicked`, `cell:dblclicked`,
 * `cell:mouseover`, `cell:mouseout`, `cell:mousedown` and `cell:mouseup`.
 *
 * All six carry the cell, its value and the DOM event behind them.
 * `target` — the cell element — is carried by the hover and press pairs,
 * which exist precisely so a host does not have to find that node itself:
 * rows and cells are pooled and re-used as the grid scrolls, so a listener a
 * host bound to a cell node would fire for whichever row occupies it next.
 */
export interface CellPointerEvent extends GridEvent {
  /** The row under the pointer. */
  row: Row;
  /** That row's key. */
  key: string;
  /** Its display index. */
  index: number;
  /** The column id under the pointer. */
  colId: string;
  /** The resolved column. */
  column: Column;
  /** The cell's value, before formatting. */
  value: unknown;
  /** The cell's text, as it is drawn. */
  text: string;
  /** The DOM event behind this one, for modifier keys and `preventDefault`. */
  event: unknown;
  /** The cell element, on the hover and press pairs; absent on click and double-click. */
  target?: unknown;
}

/**
 * `cell:contextmenu`: a context menu was requested on a cell.
 *
 * Raised twice over, by two routes with different payloads: the keyboard's
 * menu key goes through the grid's action table and carries `rowIndex` and
 * `colId`; the pointer goes through the renderer and carries the full cell
 * with the pointer position. A handler that wants the position must read it
 * defensively (F-1688-E).
 */
export interface CellContextMenuEvent extends GridEvent {
  /** The row the menu was requested on. */
  row: Row;
  /** That row's key; absent on the keyboard route. */
  key?: string;
  /** Its display index; absent on the keyboard route. */
  index?: number;
  /** Its display index, on the keyboard route. */
  rowIndex?: number;
  /** The column id the menu was requested on. */
  colId: string;
  /** The resolved column; absent on the keyboard route. */
  column?: Column;
  /** The cell's value; absent on the keyboard route. */
  value?: unknown;
  /** The pointer's viewport x, on the pointer route. */
  x?: number;
  /** The pointer's viewport y, on the pointer route. */
  y?: number;
  /** The DOM event behind this one, on the pointer route. */
  event?: unknown;
}

/** `cell:edit:start` and `row:edit:start`: an editor opened. */
export interface EditStartEvent extends GridEvent {
  /** The row being edited. */
  row: Row;
  /** That row's key. */
  key: string;
  /** The column the caret is in; null on a row editor with no focused column. */
  colId: string | null;
  /** The resolved column the caret is in. */
  column: Column;
  /** The key that opened the editor, when a keypress did. */
  keyName?: string;
  /** The character typed into the cell to open it, when typing did. */
  charPress?: string;
}

/**
 * `cell:edit:end` and `row:edit:end`: an editor closed.
 *
 * `valid: false` means a column rule refused the commit and the editor stayed
 * the user's problem; `cancelled: true` means nothing was written, either
 * because the user pressed Escape or because a `beforeEdit` handler vetoed.
 */
export interface EditEndEvent extends GridEvent {
  /** The row that was being edited. */
  row: Row;
  /** That row's key. */
  key: string;
  /** The column the caret was in; null on a row editor with none. */
  colId: string | null;
  /** True when the commit passed validation, false when a rule refused it. */
  valid: boolean;
  /** True when nothing was written — Escape, or a vetoed commit. */
  cancelled?: boolean;
  /** The validation failures, when `valid` is false. */
  errors?: ValidationError[];
  /** The cells that were written; empty on a cancel. */
  writes?: { key: string; colId: string; before: unknown; after: unknown }[];
}

/** `row:clicked` and `row:dblclicked`: a row was clicked or double-clicked. */
export interface RowPointerEvent extends GridEvent {
  /** The row under the pointer. */
  row: Row;
  /** That row's key. */
  key: string;
  /** Its display index. */
  index: number;
  /** The DOM event behind this one. */
  event: unknown;
}

/** `row:pending`: an optimistic row append or delete was sent to the transport. */
export interface RowPendingEvent extends GridEvent {
  /** The id the op is tracked under; `grid.edit.settleRow(id, …)` answers it. */
  id: string;
  /** Which structural write it is. */
  kind: RowChangeKind;
  /** The row key — a temporary one for an append until the server rekeys it. */
  key: string;
  /** True while the key is the grid's own temporary one. */
  temp: boolean;
  /** The row as it stands in the grid, or undefined when there is none. */
  row?: Row;
}

/** `row:confirmed`: the server accepted a pending row append or delete. */
export interface RowConfirmedEvent extends GridEvent {
  /** The id the op was tracked under. */
  id: string;
  /** Which structural write it was. */
  kind: RowChangeKind;
  /** The row key, already rekeyed from the temporary one on an append. */
  key: string;
  /** The temporary key an append was rekeyed from. */
  tempKey?: string;
  /** The row as it now stands; undefined for a confirmed delete. */
  row?: Row;
  /** True when a newer op on the same key had already replaced this one. */
  superseded: boolean;
}

/** `row:reverted`: a pending row append or delete was refused and rolled back. */
export interface RowRevertedEvent extends GridEvent {
  /** The id the op was tracked under. */
  id: string;
  /** Which structural write it was. */
  kind: RowChangeKind;
  /** The row key. */
  key: string;
  /** The temporary key the append had been given. */
  tempKey?: string;
  /** Why it was refused, or null when the transport gave no reason. */
  reason: string | null;
  /** True when a newer op on the same key had already replaced this one. */
  superseded: boolean;
  /** True when the rollback was applied; false when it was superseded. */
  applied: boolean;
  /** The row as it stands after the rollback, where there is one. */
  row?: Row;
}

/** `row:conflict`: the server confirmed a structural write but sent back a row that disagrees. */
export interface RowConflictEvent extends GridEvent {
  /** The id the op was tracked under. */
  id: string;
  /** Which structural write it was. */
  kind: RowChangeKind;
  /** The row key. */
  key: string;
  /** The row the server sent back. */
  serverRow: Record<string, unknown>;
  /** The row as the grid holds it; undefined for a delete. */
  row?: Row;
}

/** `form:opened`: the row form opened over a row. */
export interface FormOpenedEvent extends GridEvent {
  /** The key of the row the form is editing. */
  key: string;
  /** That row. */
  row: Row;
}

/** `form:closed`: the row form was closed without saving. */
export interface FormClosedEvent extends GridEvent {
  /** The key of the row the form was editing. */
  key: string;
}

/** `form:saved`: the row form's values were written back to the row. */
export interface FormSavedEvent extends GridEvent {
  /** The key of the row that was saved. */
  key: string;
  /** Every value the form held, by field name. */
  values: Record<string, unknown>;
  /** Only the values that differ from what the row held. */
  changed: Record<string, unknown>;
  /** Fields the form held that no column maps, so nothing was written for them. */
  unmapped: string[];
}

/** `form:error`: the row form could not load or save a row. */
export interface FormErrorEvent extends GridEvent {
  /** The key of the row the form was working on. */
  key: string;
  /** What went wrong. */
  error: unknown;
  /** True when the load timed out rather than being refused. */
  timedOut: boolean;
}

/** `sort:changed`: the sort order changed. */
export interface SortChangedEvent extends GridEvent {
  /** The sort now in force, in precedence order; empty when nothing is sorted. */
  sort: SortEntry[];
}

/**
 * `filter:changed`: the filters changed.
 *
 * Four routes reach it — a structured condition, the quick filter, a named
 * host predicate, and the comments filter — and each fills its own fields,
 * so every one of them is optional.
 */
export interface FilterChangedEvent extends GridEvent {
  /** The structured filter now in force, or null when it was cleared. */
  filters?: FilterSet;
  /** The quick-filter text now in force. */
  quick?: string;
  /** How the quick filter matches. */
  quickMode?: string;
  /** The named host predicates now in force. */
  where?: string[];
  /** `'where'` when a host predicate was registered, replaced, removed or re-run. */
  cause?: string;
  /** `'unresolved'` or `'any'` when the change was the comments filter. */
  comments?: string;
}

/**
 * `group:toggled`: a group row was expanded or collapsed.
 *
 * One group carries `key` or `row`; "expand all" / "collapse all" carries
 * `all: true` and no target; a deep expand carries `deep: true`.
 */
export interface GroupToggledEvent extends GridEvent {
  /** The key of the group row that was toggled. */
  key?: string;
  /** That group row, where the caller had it. */
  row?: Row;
  /** True when it is now open. */
  expanded: boolean;
  /** True when the whole branch beneath it was opened. */
  deep?: boolean;
  /** True when every group was toggled at once. */
  all?: boolean;
}

/** `facet:computed`: a column's facet buckets finished computing. */
export interface FacetComputedEvent extends GridEvent {
  /** The column the facets are for. */
  colId: string;
  /** How many buckets the distribution was cut into. */
  buckets: number;
  /** How long it took, in milliseconds. */
  ms: number;
  /** True when a worker computed it rather than the main thread. */
  worker: boolean;
}

/** `facet:filtered`: a facet histogram was used to filter its column, or cleared. */
export interface FacetFilteredEvent extends GridEvent {
  /** The column that was filtered. */
  colId: string;
  /** The condition that was installed, or null when the filter was cleared. */
  filter: FilterSet;
  /** The gesture behind it: `'click'`, `'drag'`, `'clear'`, or whatever the caller named. */
  gesture: string;
  /** The inclusive bucket range that was selected. */
  buckets?: [number, number];
}

/** `facet:expanded`: a facet panel section was opened or closed. */
export interface FacetExpandedEvent extends GridEvent {
  /** The column whose section moved. */
  colId: string;
  /** True when it is now open. */
  expanded: boolean;
}

/** `facet:failed`: a column's facet buckets could not be computed. */
export interface FacetFailedEvent extends GridEvent {
  /** The column the facets were for. */
  colId: string;
  /** What went wrong. */
  error: unknown;
}

/**
 * `column:moved`: a column was moved to a different display position.
 *
 * Two routes, two spellings of the same thing: the column model names it
 * `id`, and the header drag names it `colId` (F-1688-C). Read whichever is
 * present.
 */
export interface ColumnMovedEvent extends GridEvent {
  /** The column that moved, on the model route. */
  id?: string;
  /** The column that moved, on the header-drag route. */
  colId?: string;
  /** The display index it moved to. */
  to: number;
}

/** `column:resized`: a column's width changed. Named `id` by the model and `colId` by the header drag (F-1688-C). */
export interface ColumnResizedEvent extends GridEvent {
  /** The column that was resized, on the model route. */
  id?: string;
  /** The column that was resized, on the header-drag route. */
  colId?: string;
  /** Its new width, in pixels. */
  width: number;
}

/** `column:visible`: columns were shown or hidden. */
export interface ColumnVisibleEvent extends GridEvent {
  /** The columns whose visibility actually changed. */
  ids: string[];
  /** True when they were hidden, false when they were shown. */
  hidden: boolean;
}

/** `column:pinned`: a column was pinned to a side, or unpinned. */
export interface ColumnPinnedEvent extends GridEvent {
  /** The column that was pinned. */
  id: string;
  /**
   * Which side it is pinned to now, or null when it was unpinned. The sides are
   * the writing-direction ones {@link ColumnApi#pin} takes — `'start'` and
   * `'end'` — not left and right, so a right-to-left grid reports the same value
   * for the same gesture.
   */
  side: Edge | null;
}

/** `column:grouped`: the row grouping changed. */
export interface ColumnGroupedEvent extends GridEvent {
  /** The column ids the rows are grouped by, outermost first; empty when grouping was cleared. */
  columns: string[];
}

/** `column:pivoted`: the pivot changed, locally or pushed down to the backend. */
export interface ColumnPivotedEvent extends GridEvent {
  /** The column ids the rows are pivoted by, on a local pivot. */
  columns?: string[];
  /** The fields the backend was asked to pivot by, on a pushed-down pivot. */
  pivotFields?: string[];
  /** True when the backend did the pivot. */
  remote?: boolean;
}

/**
 * `column:filter:open`, `column:profile:open` and `column:menu:open`: the
 * header asked for a popup to be opened over a column. The grid raises these
 * rather than opening anything itself, so a host can put its own control
 * where the built-in one would go.
 */
export interface ColumnMenuEvent extends GridEvent {
  /** The column the popup belongs to. */
  colId: string;
  /** The header element to anchor it to, where the caller had one. */
  element?: unknown;
}

/** `pivot:drill`: a pivot measure cell was drilled into. */
export interface PivotDrillEvent extends GridEvent {
  /** The keys of the source rows behind the measure. */
  keys: string[];
  /** The row path of the cell, as the header wrote it. */
  rowPath: string | null;
  /** The column path of the cell. */
  colPath: string | null;
  /** Which measure the cell shows. */
  measure: string | null;
  /** The DOM event behind the drill. */
  event: unknown;
}

/** `columns:changed`: the column set was rewritten other than by moving, resizing, hiding or pinning. */
export interface ColumnsChangedEvent extends GridEvent {
  /** Why it was rewritten; `'inferred'` when a type-inference pass did it. */
  reason: string;
  /** The type inferred for each column, by column id. */
  types: Record<string, string>;
}

/** `columns:tagged`: `grid.columns.showTagged()` chose the visible set from the columns' tags. */
export interface ColumnsTaggedEvent extends GridEvent {
  /** The tags that were asked for. */
  tags: string[];
  /** The columns hidden because they carry none of them. */
  hidden: string[];
}

/** What happened to a banded header group. */
export type ColumnGroupAction = 'formed' | 'removed' | 'renamed' | 'dissolved' | 'moved' | 'applied';
/** `columngroup:changed`: a banded header group was formed, renamed, moved, dissolved, removed or restored. */
export interface ColumnGroupChangedEvent extends GridEvent {
  /** What happened to it. */
  action: ColumnGroupAction;
  /** The band the action was on, where it has an id. */
  groupId?: string;
  /** The leaf column removed from a band, on `'removed'`. */
  id?: string;
  /** The leaves a band was formed over, on `'formed'`. */
  ids?: string[];
  /** The display position a band moved to, on `'moved'`. */
  to?: number;
  /** The band's new title, on `'renamed'`. */
  title?: string;
  /** True when removing the last leaf dissolved the band with it. */
  dissolved?: boolean;
}

/** `header:contextmenu`: a context menu was requested on a column header. */
export interface HeaderContextMenuEvent extends GridEvent {
  /** The column the menu was requested on. */
  colId: string;
  /** The resolved column. */
  column: Column;
  /** The header element, to anchor a menu to. */
  element: unknown;
  /** The pointer's viewport x. */
  x: number;
  /** The pointer's viewport y. */
  y: number;
  /** The DOM event behind this one. */
  event: unknown;
}

/** `selection:changed`: the row selection changed and was accepted. */
export interface SelectionChangedEvent extends GridEvent {
  /** The keys of every selected row. */
  keys: string[];
  /** Those rows. */
  rows: Row[];
}

/** `range:changed`: the selected cell ranges changed. */
export interface RangeChangedEvent extends GridEvent {
  /** Every range now selected. */
  ranges: CellRange[];
}

/** `clipboard:copy`: a copy to the clipboard was attempted. */
export interface ClipboardCopyEvent extends GridEvent {
  /** The text that was put on the clipboard; empty when the copy was refused. */
  text: string;
  /** Whether it reached the clipboard. */
  ok: boolean;
  /** What was copied: `'range'`, or whichever row scope the options asked for. */
  rows: string;
  /** Why a refused copy was refused — `'discontiguous'` for a non-rectangular range. */
  reason?: string;
}

/** `page:changed`: the page or the page size changed. */
export interface PageChangedEvent extends GridEvent {
  /** The page now showing, zero-based. */
  page: number;
  /** Rows per page; 0 means paging is off. */
  pageSize: number;
  /** How many rows the current query produces, or null while the source is still counting. */
  total: number | null;
  /** How many pages that makes. */
  pageCount: number;
  /** Whether a deferred exact total is still being counted. */
  counting?: boolean;
}

/**
 * `scroll` and `scroll:end`: the viewport's offset. `scroll` fires only when
 * the offset actually moved, so a refresh is never mistaken for a scroll;
 * `scroll:end` fires once the gesture has settled.
 */
export interface ScrollEvent extends GridEvent {
  /** The vertical offset, in content space rather than spacer space, so it survives a row-count change. */
  top: number;
  /** The logical horizontal offset: zero at the content's start in either writing direction. */
  left: number;
}

/** `detail:toggled`: a master-detail region was opened or closed. */
export interface DetailToggledEvent extends GridEvent {
  /** The keys of every row with an open detail region. */
  keys: string[];
  /** The key of the region that is mounted, or null when none is. */
  active: string | null;
}

/** `highlight:changed`: the set of host-declared highlights changed. */
export interface HighlightChangedEvent extends GridEvent {
  /** Every highlight in force, with its scope, target, colour and duration. */
  highlights: { scope: string; key: string | null; colId: string | null; colour: string; duration: number }[];
}

/**
 * `find:changed`: the find bar's query, open state or match count changed.
 *
 * The count here is the model's narrower one — `current`, `total` and
 * `complete`. `grid.find.count()` adds the windowed-scope fields on top; this
 * event does not carry them (F-1688-D).
 */
export interface FindChangedEvent extends GridEvent {
  /** What is being searched for. */
  text: string;
  /** Whether the search distinguishes case. */
  caseSensitive: boolean;
  /** Whether the whole cell must match rather than contain. */
  wholeCell: boolean;
  /** The columns being searched, or null for every visible column. */
  columns: string[] | null;
  /** Whether the find bar is showing. */
  open: boolean;
  /** Which match is current, how many there are, and whether the scan finished. */
  count: { current: number; total: number; complete: boolean };
}

/** `tree:loading`: a branch was expanded and `tree.loadChildren` was called for it. */
export interface TreeLoadingEvent extends GridEvent {
  /** The branch's row key. */
  key: string;
  /** That branch row. */
  row: Row;
}

/** `tree:loaded`: a branch's children arrived and were added. */
export interface TreeLoadedEvent extends GridEvent {
  /** The branch's row key. */
  key: string;
  /** How many children arrived. */
  count: number;
}

/** `tree:loadFailed`: a branch's `loadChildren` rejected; the branch stays unloaded so it can be retried. */
export interface TreeLoadFailedEvent extends GridEvent {
  /** The branch's row key. */
  key: string;
  /** What the loader rejected with. */
  error: unknown;
}

/** `tree:loadAborted`: a branch was collapsed before its children arrived, so the fetch was abandoned. */
export interface TreeLoadAbortedEvent extends GridEvent {
  /** The branch's row key. */
  key: string;
}

/** `state:reset`: `grid.state.reset()` restored the arrangement the grid was built with. */
export interface StateResetEvent extends GridEvent {
  /** The baseline that was restored. */
  state: GridState;
}

/** `history:changed`: the undo and redo stacks moved. */
export interface HistoryChangedEvent extends GridEvent {
  /** Whether there is anything to undo. */
  canUndo: boolean;
  /** Whether there is anything to redo. */
  canRedo: boolean;
  /** The entry an undo would apply, or null. */
  undo: HistoryEntry | null;
  /** The entry a redo would apply, or null. */
  redo: HistoryEntry | null;
}

/** Which way the undo/redo stack moved. */
export type HistoryDirection = 'undo' | 'redo';
/** `history:applied`: an undo or redo step was applied. */
export interface HistoryAppliedEvent extends GridEvent {
  /** Which way the stack moved. */
  direction: HistoryDirection;
  /** The entry that was applied, or null when there was nothing to apply. */
  step: HistoryEntry | null;
}

/**
 * `views:changed`: the saved-view list changed, for any reason.
 *
 * Paired with a named `view:*` event that carries the one view that moved:
 * this one is what a picker or a `localStorage` mirror wants, the named one is
 * what a host persisting to a server wants.
 */
export interface ViewsChangedEvent extends GridEvent {
  /** Every view after the change. */
  views: SavedView[];
  /** What happened: `'save'`, `'update'`, `'import'`, `'remove'`, `'rename'`, `'default'`, `'seed'`, `'replace'` or `'apply'`. */
  reason: string;
  /** The view that moved, or null when the change was not about one view. */
  view: SavedView | null;
  /** The view now applied, on the `'apply'` firing. */
  activeId?: string;
}

/** `view:applied`: a saved view was applied to the grid. */
export interface ViewAppliedEvent extends GridEvent {
  /** The view that was applied. */
  view: SavedView;
  /** Every view, unchanged by the apply. */
  views: SavedView[];
  /** The id of the view now active. */
  activeId: string;
}

/**
 * `view:saved`, `view:removed`, `view:renamed` and `view:default`: the one
 * view that moved, so a host can POST that record instead of diffing two
 * full lists to work out what the user just did.
 */
export interface ViewChangedEvent extends GridEvent {
  /** The view that moved. */
  view: SavedView | null;
  /** Every view after the change. */
  views: SavedView[];
  /** The underlying reason: `'save'`, `'update'`, `'import'`, `'remove'`, `'rename'` or `'default'`. */
  reason: string;
}

/** `validation:failed`: a declared column rule refused an edit. */
export interface ValidationFailedEvent extends GridEvent {
  /** The key of the row whose commit was refused. */
  key: string;
  /** One entry per failing cell, with its column, code and message. */
  failures: ValidationError[];
  /** How many cells failed. */
  count: number;
}

/** `validation:cleared`: recorded validation errors were cleared. */
export interface ValidationClearedEvent extends GridEvent {
  /** The row that was cleared, or null when every row was. */
  key: string | null;
  /** The column that was cleared, or null when every column was. */
  colId: string | null;
}

/** `formatting:changed`: a conditional-formatting rule was added, changed, removed or replaced. */
export interface FormattingChangedEvent extends GridEvent {
  /** What happened to it. */
  reason: string;
  /** The scope that changed: a column id, or the grid scope. */
  scope: FormattingScope;
  /** Every rule now in force, by scope. */
  rules: Record<FormattingScope, FormattingRule[]>;
}

/** `redaction:changed`: the set of redacted columns changed. */
export interface RedactionChangedEvent extends GridEvent {
  /** Every column id now redacted. */
  columns: string[];
}

/** `permissions:changed`: the per-column permission levels changed. */
export interface PermissionsChangedEvent extends GridEvent {
  /** The level now in force for each column that has one. */
  levels: Record<string, PermissionLevel>;
}

/**
 * `presentation:changed`: raised by two unrelated things under one name
 * (F-1688-A). The renderer raises it with `presentation` when the responsive
 * layout switches between the table and the card view; the presentation model
 * raises it with the deck's settings when `start()` is called again on an
 * already-running presentation. A handler has to check which fields arrived.
 */
/** Which responsive layout the grid's body is rendered as: cards, or a table. */
export type ViewPresentation = 'cards' | 'table';
export interface PresentationChangedEvent extends GridEvent {
  /** `'cards'` or `'table'`, on the responsive-layout firing. */
  presentation?: ViewPresentation;
  /** The enlargement now in force, on the presentation-model firing. */
  scale?: number;
  /** The options the presentation is running with. */
  options?: Record<string, unknown>;
  /** The view ids in the deck. */
  views?: string[];
  /** Which of them is showing, or -1 when the deck is empty. */
  index?: number;
}

/** `presentation:started`: `grid.presentation.start()` began presenting. */
export interface PresentationStartedEvent extends GridEvent {
  /** The enlargement it started at. */
  scale: number;
  /** The options it was started with. */
  options: Record<string, unknown>;
  /** The view ids in the deck; empty when it is presenting the grid as it stands. */
  views: string[];
  /** Which view is showing, or -1 when there is no deck. */
  index: number;
}

/** `presentation:view`: the presentation stepped to a view, including the first. */
export interface PresentationViewEvent extends GridEvent {
  /** The view now showing, or null when the deck is empty. */
  viewId: string | null;
  /** Its position in the deck. */
  index: number;
  /** How many views the deck holds. */
  count: number;
}

/** `presentation:scale`: the presentation's enlargement changed. */
export interface PresentationScaleEvent extends GridEvent {
  /** The enlargement now in force, already clamped to the allowed range. */
  scale: number;
}

/** `presentation:spotlight`: the spotlight was armed over some rows and columns, or cleared. */
export interface PresentationSpotlightEvent extends GridEvent {
  /** What is lit, or null when the spotlight was cleared. */
  spotlight: { keys: string[]; colIds: string[] } | null;
}

/** `presentation:captured`: a screenshot of the grid was taken. */
export interface PresentationCapturedEvent extends GridEvent {
  /** The image's width in pixels. */
  width: number;
  /** Its height in pixels. */
  height: number;
  /** Its size in bytes. */
  bytes: number;
  /** Its MIME type. */
  mimeType: string;
  /** The file name it was downloaded under, or null when it was not downloaded. */
  fileName: string | null;
}

/** `comment:added`: a comment was added to a cell, or a reply added to a thread. */
export interface CommentAddedEvent extends GridEvent {
  /** The cell the comment is on, as the provider keys it. */
  cellKey: string;
  /** The stored comment's id, where the provider returned one. */
  commentId?: string;
  /** The comment this one replies to, or null when it starts a thread. */
  parentId: string | null;
}

/** `comment:edited` and `comment:deleted`: one comment changed. */
export interface CommentEvent extends GridEvent {
  /** The cell the comment is on. */
  cellKey: string;
  /** The comment that changed. */
  commentId: string;
}

/** `comment:resolved` and `comment:unresolved`: a thread was marked resolved or reopened. */
export interface CommentResolvedEvent extends GridEvent {
  /** The cell whose thread changed. */
  cellKey: string;
}

/** `comment:threadOpened`: a cell's comment thread was opened. */
export interface CommentThreadOpenedEvent extends GridEvent {
  /** The cell whose thread was opened. */
  cellKey: string;
  /** The row it sits on. */
  rowId: string;
  /** The column it sits on. */
  field: string;
  /** The cell's value, so a thread header can quote what is being discussed. */
  value: unknown;
}

/** `comment:threadClosed`: a cell's comment thread was closed. */
export interface CommentThreadClosedEvent extends GridEvent {
  /** The cell whose thread was closed. */
  cellKey: string;
  /** Why it closed; `'dismissed'` when the caller gave no reason. */
  reason: string;
}

/** `comment:indexLoaded`: the comment index for the visible rows finished loading. */
export interface CommentIndexLoadedEvent extends GridEvent {
  /** How many rows the index was asked for. */
  rows: number;
  /** How many entries came back. */
  entries: number;
  /** How long it took, in milliseconds. */
  ms: number;
}

/** Which comment-provider call failed. */
export type CommentOperation =
  'loadIndex' | 'loadThread' | 'addComment' | 'editComment' | 'deleteComment' | 'resolveThread'
  | 'unresolveThread';
/** `comment:failed`: a comment operation could not reach the backend. */
export interface CommentFailedEvent extends GridEvent {
  /** Which provider call failed. */
  operation: CommentOperation;
  /** The cell it was for, where the call named one. */
  cellKey?: string;
  /** The comment it was for, where the call named one. */
  commentId?: string;
  /** What the provider threw or rejected with. */
  error: unknown;
}

/** `presence:published`: this grid published its own presence to the transport. */
export interface PresencePublishedEvent extends GridEvent {
  /** What was published: this peer's cursor, selection and identity. */
  state: Record<string, unknown>;
}

/** `presence:joined` and `presence:updated`: a peer appeared, or one already present moved. */
export interface PresencePeerEvent extends GridEvent {
  /** The peer, as the grid now holds it. */
  peer: Peer;
}

/** `presence:left`: a peer left the presence channel or timed out. */
export interface PresenceLeftEvent extends GridEvent {
  /** The peer that left. */
  peer: Peer;
  /** Why it left — the transport's reason, or the grid's own timeout. */
  reason: string;
}

/** Which presence-transport call failed. */
export type PresenceOperation = 'subscribe' | 'publish';
/** `presence:failed`: a presence subscribe or publish could not reach the transport. */
export interface PresenceFailedEvent extends GridEvent {
  /** Which call failed. */
  operation: PresenceOperation;
  /** What the transport threw or rejected with. */
  error: unknown;
}

/** `presence:lockRefused`: an edit was refused because a peer holds the cell's lock. */
export interface PresenceLockRefusedEvent extends GridEvent {
  /** The row key of the locked cell. */
  key: string;
  /** Its column. */
  colId: string;
  /** The peer holding the lock. */
  peer: Peer;
}

/** `diff:changed`: diff mode was turned on against a snapshot, or turned off. */
export interface DiffChangedEvent extends GridEvent {
  /** Whether the grid is now diffing. */
  enabled: boolean;
}

/** `diff:swapped`: the two sides of a diff were swapped. */
export interface DiffSwappedEvent extends GridEvent {
  /** True when the grid is now showing the snapshot as the "after" side. */
  swapped: boolean;
  /** How many rows are on the side now being shown. */
  rows: number;
  /** How many rows are on the side it came from. */
  snapshot: number;
}

/** `timeline:attached`: the scrubber began recording what each change replaces. */
export interface TimelineAttachedEvent extends GridEvent {
  /** How many steps back it is currently possible to go. */
  depth: number;
}

/** `timeline:seek`: the timeline finished moving. */
export interface TimelineSeekEvent extends GridEvent {
  /** How many steps back from the present the grid now stands; 0 is live. */
  position: number;
  /** How many steps back it is possible to go. */
  depth: number;
  /** Whether it is standing in the present. */
  live: boolean;
  /** The timestamp of the recorded state it is standing at, or null when live. */
  at: number | null;
}

/** `timeline:seeking`: the timeline is about to move. */
export interface TimelineSeekingEvent extends GridEvent {
  /** How many steps back it is coming from. */
  from: number;
  /** How many steps back it is going to. */
  to: number;
}

/** `annotation:changed`: the annotation overlay's marks or tool changed. */
export interface AnnotationChangedEvent extends GridEvent {
  /** The tool now in use, or null when none is. */
  tool: AnnotationTool | null;
  /** How many marks the layer now holds. */
  count: number;
}

/** `export:progress`: a streaming export wrote another chunk. */
export interface ExportProgressEvent extends GridEvent {
  /** Rows written so far. */
  written: number;
  /** Rows expected in all. */
  total: number;
  /** Bytes written so far. */
  bytes: number;
}

/** `export:request`: a remote export request is about to go to the host's `export.remote.fetch` hook. */
export interface ExportRequestEvent extends GridEvent {
  /** The request, as the hook will receive it: the query, the columns and the format. */
  request: Record<string, unknown>;
}

/** `export:done`: a remote export came back and the file was handed over. */
export interface ExportDoneEvent extends GridEvent {
  /** The request that produced it. */
  request: Record<string, unknown>;
  /** True — this firing is the remote path's; a local export does not raise it. */
  remote: boolean;
}

/** `print:before` and `print:after`: print mode was applied, and undone. */
export interface PrintEvent extends GridEvent {
  /** How many rows the print covers. */
  rows: number;
}

/**
 * `beforeEdit`: a cell or row edit is about to be committed.
 *
 * Raised only for a person's or the AI's write — origin `'user'` or `'ai'`. An
 * `'api'` write (`grid.edit.setCells` with no origin, and the paste, fill and
 * clear that funnel through it) is not gated and raises nothing, so nothing
 * that worked before the gate existed changed shape.
 */
export interface BeforeEditEvent extends BeforeEvent {
  /** The row about to be committed. */
  row: Row;
  /** That row's key. */
  key: string;
  /** Whether it is a cell edit or a row edit. */
  mode: EditMode;
  /** The writes that are about to be made. */
  changes: { colId: string; oldValue: unknown; newValue: unknown }[];
}

/** `beforeSort`: the user asked for a sort, which has not been applied yet. */
export interface BeforeSortEvent extends BeforeEvent {
  /** The sort that is about to be applied. */
  sort: SortEntry[];
}

/**
 * `beforeFilter`: the user asked for a filter, which has not been applied yet.
 *
 * The quick filter rides the same gate as the condition tree, marked `kind:
 * 'quick'` so a handler can tell them apart; each firing carries one of
 * `filters` and `quick`, never both.
 */
/** Which kind of filter fired: the structured condition tree, or the quick filter. */
export type FilterKind = 'structured' | 'quick';
export interface BeforeFilterEvent extends BeforeEvent {
  /** The structured filter about to be applied, on a `kind: 'structured'` firing. */
  filters?: FilterSet;
  /** The quick-filter text about to be applied, on a `kind: 'quick'` firing. */
  quick?: string;
  /** Which filter this is. */
  kind: FilterKind;
}

/** `beforeSelect`: the user changed the selection, which has not been announced yet. */
export interface BeforeSelectEvent extends BeforeEvent {
  /** The keys the user has just selected. */
  keys: string[];
  /** The keys the selection would snap back to on a veto. */
  previous: string[];
}

/** `beforeColumnMove`: a column is about to be moved. */
export interface BeforeColumnMoveEvent extends BeforeEvent {
  /** The column being moved. */
  column: string;
  /** The display index it would take. */
  to: number;
}

/** `beforeColumnResize`: a column is about to be resized. */
export interface BeforeColumnResizeEvent extends BeforeEvent {
  /** The column being resized. */
  column: string;
  /** The width it would take, in pixels. */
  width: number;
}

/** `beforeColumnHide`: one or more columns are about to be hidden. */
export interface BeforeColumnHideEvent extends BeforeEvent {
  /** The columns about to be hidden. */
  columns: string[];
}

/** `beforeRowAdd`: a record is about to be appended through the pending-row path. */
export interface BeforeRowAddEvent extends BeforeEvent {
  /** The record about to be appended. */
  row: Record<string, unknown>;
}

/** `beforeDelete`: one or more rows are about to be deleted. */
export interface BeforeDeleteEvent extends BeforeEvent {
  /** The first key about to be deleted. */
  key: string;
  /** Every key about to be deleted, on the multi-row gesture. */
  keys?: string[];
  /** Every key about to be deleted. */
  rows: string[];
}

/** `beforeRowMove`: a row is about to be reordered within this grid. */
export interface BeforeRowMoveEvent extends BeforeEvent {
  /** The key of the row being moved. */
  key: string;
  /** The display index it is at. */
  from: number;
  /** The display index it would take. */
  to: number;
}

/** `beforeGroup`: a group row is about to be expanded or collapsed. */
export interface BeforeGroupEvent extends BeforeEvent {
  /** The key of the group row. */
  key: string;
  /** True when it is being opened, false when it is being closed. */
  expanded: boolean;
}

/** `edit:cancelled`: a `beforeEdit` handler vetoed the commit, or it went stale. */
export interface EditCancelledEvent extends GridEvent {
  /** The row whose commit was abandoned. */
  row: Row;
  /** That row's key. */
  key: string;
  /** Whether it was a cell edit or a row edit. */
  mode: EditMode;
  /** The writes that would have been made. */
  changes: { colId: string; oldValue: unknown; newValue: unknown }[];
  /** The reason given to `preventDefault`, `'prevented'` when none was, or `'stale'`. */
  reason: string;
}

/** `sort:cancelled`: a `beforeSort` handler vetoed the sort. */
export interface SortCancelledEvent extends GridEvent {
  /** The sort that was not applied. */
  sort: SortEntry[];
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `filter:cancelled`: a `beforeFilter` handler vetoed the filter. */
export interface FilterCancelledEvent extends GridEvent {
  /** The structured filter that was not applied, on a `kind: 'structured'` veto. */
  filters?: FilterSet;
  /** The quick-filter text that was not applied, on a `kind: 'quick'` veto. */
  quick?: string;
  /** Which filter was refused. */
  kind: FilterKind;
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `columnMove:cancelled`: a `beforeColumnMove` handler vetoed the move. */
export interface ColumnMoveCancelledEvent extends GridEvent {
  /** The column that was not moved. */
  column: string;
  /** The display index it would have taken. */
  to: number;
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `columnResize:cancelled`: a `beforeColumnResize` handler vetoed the resize. */
export interface ColumnResizeCancelledEvent extends GridEvent {
  /** The column that was not resized. */
  column: string;
  /** The width it would have taken, in pixels. */
  width: number;
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `columnHide:cancelled`: a `beforeColumnHide` handler vetoed the hide. */
export interface ColumnHideCancelledEvent extends GridEvent {
  /** The columns that were not hidden. */
  columns: string[];
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `selection:cancelled`: a `beforeSelect` handler vetoed the change, which has been snapped back. */
export interface SelectionCancelledEvent extends GridEvent {
  /** The keys the user had selected, which are no longer selected. */
  keys: string[];
  /** The keys the selection was snapped back to. */
  previous: string[];
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `rowAdd:cancelled`: a `beforeRowAdd` handler vetoed the append. */
export interface RowAddCancelledEvent extends GridEvent {
  /** The record that was not appended. */
  row: Record<string, unknown>;
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}

/** `delete:cancelled`: a `beforeDelete` handler vetoed the delete, or the rows were gone by the time it settled. */
export interface DeleteCancelledEvent extends GridEvent {
  /** The first key that was not deleted. */
  key: string;
  /** Every key that was not deleted, on the multi-row gesture. */
  keys?: string[];
  /** Every key that was not deleted. */
  rows: string[];
  /** The reason given to `preventDefault`, `'prevented'` when none was, or `'stale'`. */
  reason: string;
}

/** `rowMove:cancelled`: a `beforeRowMove` handler vetoed the reorder. */
export interface RowMoveCancelledEvent extends GridEvent {
  /** The key of the row that did not move. */
  key: string;
  /** The display index it is still at. */
  from: number;
  /** The display index it would have taken. */
  to: number;
  /** The reason given to `preventDefault`, `'prevented'`, or `'unchanged'` when the move was a no-op. */
  reason: string;
}

/** `group:cancelled`: a `beforeGroup` handler vetoed the expand or collapse. */
export interface GroupCancelledEvent extends GridEvent {
  /** The key of the group row that did not move. */
  key: string;
  /** Whether it was being opened (true) or closed (false). */
  expanded: boolean;
  /** The reason given to `preventDefault`, or `'prevented'`. */
  reason: string;
}


/**
 * What a handler receives, per event.
 *
 * `on()` is declared as `on(event: EventName, handler: EventHandler)`, so the
 * declarations named every event and typed none of their payloads. The
 * published reference could list the names and nothing else, which is half an
 * event reference: a reader still has to run the grid to find out what arrives.
 *
 * This map is the other half. It is populated from the payload interfaces that
 * already exist and from the comments in {@link EventName} that name them — an
 * event with no entry here publishes `unknown` in the reference and is counted
 * by the undescribed-member ratchet in `tools/check.js`, so the gaps are
 * visible and shrink rather than being papered over with a generic type. Every
 * payload extends {@link GridEvent}; an entry says which specialisation.
 *
 * An entry of `void` means the event carries nothing of its own: the bus
 * still hands the handler the {@link GridEvent} envelope — `type`, `origin`
 * and `grid` — and the reference prints "no payload" rather than a type.
 */
export interface EventPayloads {
  /** Nothing: the grid being ready is the whole message. */
  ready: void;
  /** Nothing: the grid is still readable from the handler, and that is the point. */
  destroy: void;
  /** Nothing: the first frame's window is reported by `render:done`, which follows it. */
  'render:first': void;
  /** The window that was drawn and the milliseconds each phase took. */
  'render:done': RenderDoneEvent;
  /** The key (or keys) that were written, with their old values. */
  'config:changed': ConfigChangedEvent;
  /** The verdict and what this deployment is now treated as. */
  'licence:changed': LicenceChangedEvent;
  /** Why the model was rebuilt, and whatever that reason has to say. */
  'model:changed': ModelChangedEvent;
  /** Which rows moved — records when `identified`, counts on a companion firing. */
  'rows:changed': RowsChangedEvent;
  /** How much is waiting on the batch queue. */
  'rows:queued': RowsQueuedEvent;
  /** How much a flush carried into the next frame, and the budget it ran out of. */
  'rows:deferred': RowsDeferredEvent;
  /** The whole feed counter set, as `grid.changes.stats()` returns it. */
  'rows:paused': RowsFlowEvent;
  /** The whole feed counter set, as `grid.changes.stats()` returns it. */
  'rows:resumed': RowsFlowEvent;
  /** The row that arrived, where it landed, and anything the insert refused. */
  'row:received': RowReceivedEvent;
  /** The row that left and whether it was moved or copied. */
  'row:sent': RowTransferEvent;
  /** The row that was copied out and left here as well. */
  'row:copied': RowTransferEvent;
  /** The row that was reordered, and the indices it moved between. */
  'row:moved': RowMovedEvent;
  /** What the source threw, and what it was fetching. */
  'source:error': SourceErrorEvent;
  /** The exact total a deferred count settled on, and the level it counts. */
  'source:total': SourceTotalEvent;
  /** How much of the stream has arrived and how much is expected. */
  'stream:chunk': StreamChunkEvent;
  /** The final row count and whether the stream promoted to memory. */
  'stream:end': StreamEndEvent;
  /** How many rows the window dropped, and how many are still live. */
  'stream:evicted': StreamEvictedEvent;
  /** The row-drag gesture; all four carry the same payload. */
  'rowDrag:started': RowDragEvent;
  /** The row being dragged, the grid under the pointer, and where it would land. */
  'rowDrag:moved': RowDragEvent;
  /** The grid the pointer has just left, with no candidate index to report. */
  'rowDrag:left': RowDragEvent;
  /** Where the drag ended and whether the release is being acted on. */
  'rowDrag:ended': RowDragEvent;
  /** The cell that was written, with its old and new values. */
  'cell:changed': CellChangedEvent;
  /** The cell that was sent, the value held in reserve, and the op id. */
  'cell:pending': CellPendingEvent;
  /** What the server confirmed, which need not be what was sent. */
  'cell:confirmed': CellConfirmedEvent;
  /** The value that was refused, the value put back, and why. */
  'cell:reverted': CellRevertedEvent;
  /** The row the server sent back, which disagrees with what the grid holds. */
  'cell:conflict': CellConflictEvent;
  /** The cell that was clicked, with its value and the DOM event. */
  'cell:clicked': CellPointerEvent;
  /** The cell that was double-clicked, with its value and the DOM event. */
  'cell:dblclicked': CellPointerEvent;
  /** The cell the menu was requested on; the two routes fill different fields (F-1688-E). */
  'cell:contextmenu': CellContextMenuEvent;
  /** The cell entered, plus its element as `target`. */
  'cell:mouseover': CellPointerEvent;
  /** The cell left, plus its element as `target`. */
  'cell:mouseout': CellPointerEvent;
  /** The cell pressed, plus its element as `target`. */
  'cell:mousedown': CellPointerEvent;
  /** The cell released over, plus its element as `target`. */
  'cell:mouseup': CellPointerEvent;
  /** The cell being edited, and the keypress that opened the editor. */
  'cell:edit:start': EditStartEvent;
  /** Whether the commit was valid, whether it was cancelled, and what was written. */
  'cell:edit:end': EditEndEvent;
  /** The row being edited, and the keypress that opened the editor. */
  'row:edit:start': EditStartEvent;
  /** Whether the commit was valid, whether it was cancelled, and what was written. */
  'row:edit:end': EditEndEvent;
  /** The row that was clicked and the DOM event. */
  'row:clicked': RowPointerEvent;
  /** The row that was double-clicked and the DOM event. */
  'row:dblclicked': RowPointerEvent;
  /** Which structural write was sent, under which id and key. */
  'row:pending': RowPendingEvent;
  /** The confirmed write, already rekeyed when it was an append. */
  'row:confirmed': RowConfirmedEvent;
  /** The refused write, why, and whether the rollback was applied. */
  'row:reverted': RowRevertedEvent;
  /** The row the server sent back, which disagrees with what the grid holds. */
  'row:conflict': RowConflictEvent;
  /** The row the form is editing. */
  'form:opened': FormOpenedEvent;
  /** The row the form was editing. */
  'form:closed': FormClosedEvent;
  /** Every value the form held, which of them changed, and which mapped to no column. */
  'form:saved': FormSavedEvent;
  /** What went wrong, and whether it was a timeout rather than a refusal. */
  'form:error': FormErrorEvent;
  /** The sort now in force, in precedence order. */
  'sort:changed': SortChangedEvent;
  /** Whichever of the four filter routes changed, and to what. */
  'filter:changed': FilterChangedEvent;
  /** Which group moved, whether it is now open, and whether it was a deep or an all-groups toggle. */
  'group:toggled': GroupToggledEvent;
  /** How many buckets, how long it took, and whether a worker did it. */
  'facet:computed': FacetComputedEvent;
  /** The condition the facet installed, or null when it was cleared. */
  'facet:filtered': FacetFilteredEvent;
  /** The facet section that opened or closed. */
  'facet:expanded': FacetExpandedEvent;
  /** The column the facets were for, and what went wrong. */
  'facet:failed': FacetFailedEvent;
  /** The column that moved and where to; spelled `id` or `colId` by route (F-1688-C). */
  'column:moved': ColumnMovedEvent;
  /** The column that was resized and its new width. */
  'column:resized': ColumnResizedEvent;
  /** The columns whose visibility changed, and which way. */
  'column:visible': ColumnVisibleEvent;
  /** The column and the side it is pinned to now, or null. */
  'column:pinned': ColumnPinnedEvent;
  /** The columns the rows are grouped by now. */
  'column:grouped': ColumnGroupedEvent;
  /** The columns the rows are pivoted by now, locally or on the backend. */
  'column:pivoted': ColumnPivotedEvent;
  /** The column whose filter popup should open, and the element to anchor it to. */
  'column:filter:open': ColumnMenuEvent;
  /** The column whose profile should open. */
  'column:profile:open': ColumnMenuEvent;
  /** The column whose menu should open, and the element to anchor it to. */
  'column:menu:open': ColumnMenuEvent;
  /** The source rows behind the measure, and the paths that identify the cell. */
  'pivot:drill': PivotDrillEvent;
  /** Why the column set was rewritten, and what was inferred. */
  'columns:changed': ColumnsChangedEvent;
  /** The tags that were asked for and the columns hidden for carrying none. */
  'columns:tagged': ColumnsTaggedEvent;
  /** What happened to the band, and to which one. */
  'columngroup:changed': ColumnGroupChangedEvent;
  /** The header the menu was requested on, and where the pointer was. */
  'header:contextmenu': HeaderContextMenuEvent;
  /** The keys and rows now selected. */
  'selection:changed': SelectionChangedEvent;
  /** Every cell range now selected. */
  'range:changed': RangeChangedEvent;
  /** The text, whether it reached the clipboard, and why not when it did not. */
  'clipboard:copy': ClipboardCopyEvent;
  /** The page, the page size, and how many pages the data makes. */
  'page:changed': PageChangedEvent;
  /** The viewport's new offset. */
  scroll: ScrollEvent;
  /** The viewport's offset once the gesture settled. */
  'scroll:end': ScrollEvent;
  /** Nothing: the new size is read off the element, which the handler already has. */
  'size:changed': void;
  /** Which detail regions are open, and which one is mounted. */
  'detail:toggled': DetailToggledEvent;
  /** Nothing: it is a request to move focus, not a report about state. */
  'toolpanel:focus': void;
  /** Every highlight now in force. */
  'highlight:changed': HighlightChangedEvent;
  /** The query, whether the bar is open, and the match count. */
  'find:changed': FindChangedEvent;
  /** The branch whose children are being fetched. */
  'tree:loading': TreeLoadingEvent;
  /** The branch and how many children arrived. */
  'tree:loaded': TreeLoadedEvent;
  /** The branch and what the loader rejected with. */
  'tree:loadFailed': TreeLoadFailedEvent;
  /** The branch whose fetch was abandoned. */
  'tree:loadAborted': TreeLoadAbortedEvent;
  /** One event per logical state change. */
  'state:changed': StateChangedEvent;
  /** The baseline that was restored. */
  'state:reset': StateResetEvent;
  /** What can now be undone and redone. */
  'history:changed': HistoryChangedEvent;
  /** Which way the stack moved, and the entry that was applied. */
  'history:applied': HistoryAppliedEvent;
  /** Every view after the change, and which one moved. */
  'views:changed': ViewsChangedEvent;
  /** The view that was applied, and the id now active. */
  'view:applied': ViewAppliedEvent;
  /** The one view that was created, updated or imported. */
  'view:saved': ViewChangedEvent;
  /** The one view that was deleted. */
  'view:removed': ViewChangedEvent;
  /** The one view that was renamed. */
  'view:renamed': ViewChangedEvent;
  /** The one view that was made the default. */
  'view:default': ViewChangedEvent;
  /** Every cell a column rule refused, with its code and message. */
  'validation:failed': ValidationFailedEvent;
  /** The row and column that were cleared, or null for all of them. */
  'validation:cleared': ValidationClearedEvent;
  /** What changed, in which scope, and every rule now in force. */
  'formatting:changed': FormattingChangedEvent;
  /** Every column id now redacted. */
  'redaction:changed': RedactionChangedEvent;
  /** The permission level now in force for each column that has one. */
  'permissions:changed': PermissionsChangedEvent;
  /** Either the responsive layout's new presentation, or the deck's settings (F-1688-A). */
  'presentation:changed': PresentationChangedEvent;
  /** The scale, options and deck the presentation started with. */
  'presentation:started': PresentationStartedEvent;
  /** Nothing: the presentation is over and there is no state left to report. */
  'presentation:ended': void;
  /** The view now showing and its position in the deck. */
  'presentation:view': PresentationViewEvent;
  /** The enlargement now in force. */
  'presentation:scale': PresentationScaleEvent;
  /** What is lit, or null when the spotlight was cleared. */
  'presentation:spotlight': PresentationSpotlightEvent;
  /** The captured image's size, type and file name. */
  'presentation:captured': PresentationCapturedEvent;
  /** The cell, the stored comment, and the thread it replies to. */
  'comment:added': CommentAddedEvent;
  /** The comment whose text changed. */
  'comment:edited': CommentEvent;
  /** The comment that was deleted. */
  'comment:deleted': CommentEvent;
  /** Which provider call failed, on what, and with what. */
  'comment:failed': CommentFailedEvent;
  /** The cell whose thread was marked resolved. */
  'comment:resolved': CommentResolvedEvent;
  /** The cell whose thread was reopened. */
  'comment:unresolved': CommentResolvedEvent;
  /** The cell whose thread was opened, and the value being discussed. */
  'comment:threadOpened': CommentThreadOpenedEvent;
  /** The cell whose thread was closed, and why. */
  'comment:threadClosed': CommentThreadClosedEvent;
  /** How many rows were indexed, how many entries came back, and how long it took. */
  'comment:indexLoaded': CommentIndexLoadedEvent;
  /** This grid's own presence, as it was published. */
  'presence:published': PresencePublishedEvent;
  /** The peer that appeared. */
  'presence:joined': PresencePeerEvent;
  /** The peer that moved or changed what it is doing. */
  'presence:updated': PresencePeerEvent;
  /** The peer that left, and why. */
  'presence:left': PresenceLeftEvent;
  /** Which presence call failed, and with what. */
  'presence:failed': PresenceFailedEvent;
  /** The locked cell and the peer holding it. */
  'presence:lockRefused': PresenceLockRefusedEvent;
  /** Whether the grid is now diffing. */
  'diff:changed': DiffChangedEvent;
  /** Which way round the diff now is, and how many rows are on each side. */
  'diff:swapped': DiffSwappedEvent;
  /** How far back the recorded window now reaches. */
  'timeline:attached': TimelineAttachedEvent;
  /** Nothing: the grid is back in the present and nothing is recorded. */
  'timeline:detached': void;
  /** Where the grid now stands, and whether that is live. */
  'timeline:seek': TimelineSeekEvent;
  /** Where the move is coming from and going to. */
  'timeline:seeking': TimelineSeekingEvent;
  /** The tool in use and how many marks the layer holds. */
  'annotation:changed': AnnotationChangedEvent;
  /** Rows written, rows expected, bytes so far. */
  'export:progress': ExportProgressEvent;
  /** The request about to go to the host's export hook. */
  'export:request': ExportRequestEvent;
  /** The request that produced the file that came back. */
  'export:done': ExportDoneEvent;
  /** Nothing: the overlay is open and there is nothing else to say about it. */
  'shortcuts:opened': void;
  /** Nothing: the overlay is closed and focus has gone back where it was. */
  'shortcuts:closed': void;
  /** How many rows the print covers. */
  'print:before': PrintEvent;
  /** How many rows the print covered. */
  'print:after': PrintEvent;
  /** The row, the mode and the writes about to be committed, with `preventDefault` to stop them. */
  beforeEdit: BeforeEditEvent;
  /** The sort about to be applied, with `preventDefault` to stop it. */
  beforeSort: BeforeSortEvent;
  /** The filter about to be applied, with `preventDefault` to stop it. */
  beforeFilter: BeforeFilterEvent;
  /** The column move about to be applied, with `preventDefault` to stop it. */
  beforeColumnMove: BeforeColumnMoveEvent;
  /** The column resize about to be applied, with `preventDefault` to stop it. */
  beforeColumnResize: BeforeColumnResizeEvent;
  /** The column hide about to be applied, with `preventDefault` to stop it. */
  beforeColumnHide: BeforeColumnHideEvent;
  /** The selection about to be announced, with `preventDefault` to snap it back. */
  beforeSelect: BeforeSelectEvent;
  /** The row append about to be sent, with `preventDefault` to stop it. */
  beforeRowAdd: BeforeRowAddEvent;
  /** The row delete about to be applied, with `preventDefault` to stop it. */
  beforeDelete: BeforeDeleteEvent;
  /** The row reorder about to be applied, with `preventDefault` to stop it. */
  beforeRowMove: BeforeRowMoveEvent;
  /** The group toggle about to be applied, with `preventDefault` to stop it. */
  beforeGroup: BeforeGroupEvent;
  /** A row dropped in from another grid, on the receiving grid. */
  beforeRowReceive: BeforeRowReceiveEvent;
  /** The commit that was abandoned, and why. */
  'edit:cancelled': EditCancelledEvent;
  /** The sort that was not applied, and why. */
  'sort:cancelled': SortCancelledEvent;
  /** The filter that was not applied, and why. */
  'filter:cancelled': FilterCancelledEvent;
  /** The column move that was not applied, and why. */
  'columnMove:cancelled': ColumnMoveCancelledEvent;
  /** The column resize that was not applied, and why. */
  'columnResize:cancelled': ColumnResizeCancelledEvent;
  /** The column hide that was not applied, and why. */
  'columnHide:cancelled': ColumnHideCancelledEvent;
  /** The selection that was snapped back, and why. */
  'selection:cancelled': SelectionCancelledEvent;
  /** The append that was not sent, and why. */
  'rowAdd:cancelled': RowAddCancelledEvent;
  /** The delete that was not applied, and why. */
  'delete:cancelled': DeleteCancelledEvent;
  /** The reorder that was not applied, and why. */
  'rowMove:cancelled': RowMoveCancelledEvent;
  /** The group toggle that was not applied, and why. */
  'group:cancelled': GroupCancelledEvent;
  /** That veto's notification, with the reason. */
  'rowReceive:cancelled': RowReceiveCancelledEvent;
  /** Whichever past-tense event fired; the wildcard is never given a before-event. */
  '*': GridEvent;
}
