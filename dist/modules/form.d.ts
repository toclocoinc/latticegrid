/*!
 * Lattice Grid 1.115.2, form module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
  IconName,
  NumberFormat,
  createGrid,
} from '../lattice-grid.js';

/** The density levels a form accepts — the grid's own presets. */
export type FormDensity = 'compact' | 'standard' | 'comfortable';

/** Where an item's label sits: above the control, to its left, or visually hidden (the accessible name stays, but the label and its asterisk take no space). */
export type FormLabelPosition = 'top' | 'left' | 'hidden';

/** The native subtype of an `input` item. */
export type FormInputSubtype = 'text' | 'email' | 'password' | 'url';

/** The control types a form item may name. */
export type FormControlType = 'input' | 'number' | 'textarea' | 'checkbox' | 'button' | 'text' | 'combo' | 'select' | 'radiogroup' | 'checkboxgroup' | 'toggle' | 'datepicker' | 'daterange' | 'file' | 'richtext' | 'rating' | 'stage' | 'chips' | 'otp' | 'color' | 'barcode' | 'listbox' | 'togglegroup' | 'time' | 'grid' | 'slider';

/** The opening view of a `color` item's popover: the preset palette (default) or the custom picker. */
export type FormColorMode = 'palette' | 'picker';

/** One selectable option of a `chips` item. */
export interface FormChipOption {
  /** The option's value, returned by `getValue()` when selected. */
  value: unknown;
  /** The text shown on the chip. */
  label: string;
  /** An SVG path `d` string drawn as the chip's inline icon. */
  icon?: string;
  /** Start disabled: not clickable, skipped by the keyboard. */
  disabled?: boolean;
}

/** One option of a `togglegroup` item. The group's committed value is a `{ [id]: boolean }` map keyed by each visible option's `id`. */
export interface FormToggleGroupOption {
  /** The option's key in the committed `{ [id]: boolean }` value; falls back to `value`, then the option's position. */
  id: string | number;
  /** The option's fallback key when `id` is omitted. */
  value?: string | number;
  /** The pressed state's text; falls back to `id`. */
  text?: string;
  /** The unpressed state's text; falls back to `text`. */
  offText?: string;
  /** The pressed state's icon (an SVG path `d` string, a URL/data URI, or an element); hidden when omitted. */
  icon?: string | Node;
  /** The unpressed state's icon; falls back to `icon`. */
  offIcon?: string | Node;
  /** Start pressed. In single mode only the first selected option wins. */
  selected?: boolean;
  /** Start disabled: not clickable, skipped by the arrow keys. */
  disabled?: boolean;
  /** Not rendered and excluded from the value map. */
  hidden?: boolean;
  /** Stretch this one button to fill the group. */
  full?: boolean;
}

/** The picker modes of a `datepicker` item. */
export type FormPickerMode = 'date' | 'date-time' | 'time';

/** The granularity of a `daterange` item: a day range or a year-month range. */
export type FormDateRangeGranularity = 'day' | 'month';

/** The committed value of a `daterange` item. */
export interface FormDateRangeValue {
  /** The range start, an ISO `YYYY-MM-DD` day (or `YYYY-MM` month in month mode) or null. */
  start: string | null;
  /** The range end, an ISO `YYYY-MM-DD` day (or `YYYY-MM` month in month mode) or null. */
  end: string | null;
}

/** The `object` form of a `time` item's committed value when `valueFormat: 'object'`. */
export interface FormTimeValue {
  /** The hour: 0-23 in 24-hour form, or the display hour 1-12 with `AM` carrying the half of the day in 12-hour form. */
  hour: number;
  /** The minute, 0-59. */
  minute: number;
  /** True for the morning half of a 12-hour value; absent in 24-hour form. */
  AM?: boolean;
}

/** One preset of a `daterange` item's left-hand list. */
export interface FormDateRangePreset {
  /** The preset's label. */
  label: string;
  /** The range as a literal `[start, end]` pair, or a function of the current `today` Date returning one. */
  range: [string, string] | ((today: Date) => [string, string]);
}

/** One choice of a `select`, `radiogroup` or `checkboxgroup` item. A `select` option may also carry an icon, an avatar, a second line, a colour, a status dot and a disabled flag. */
export interface FormOption {
  /** The option's committed value. */
  value: string | number;
  /** The option's display label; the value itself when omitted. */
  label?: string;
  /** The option's icon, drawn on the left in a `select`; `color` tints it. */
  icon?: string;
  /** An image URL (drawn round, falling back to the label's initials), or initials text (drawn round on a colour from `color` or a hash of the label). */
  avatar?: string;
  /** The background colour for the initials avatar (a stable colour derived from the label when omitted) and the tint of the option's icon. */
  color?: string;
  /** A colour that draws a small filled circle before the label instead of an icon or avatar, with no letter. */
  dot?: string;
  /** The option's second line, shown under the label in a `select`. */
  description?: string;
  /** Whether the option is shown but not selectable. */
  disabled?: boolean;
  /** The sticky group header a `listbox` item's `groupBy` buckets this option under. */
  group?: string;
}

/** A group of `select` options under one heading. */
export interface FormOptionGroup {
  /** The group heading. */
  label: string;
  /** The group's options, nested groups allowed. */
  options: (string | FormOption | FormOptionGroup)[];
}

/** When an item re-checks itself: on a committed edit, on blur, or only on `validate()`. */
export type FormValidationMode = 'change' | 'blur' | 'submit';

/**
 * A validation rule: a built-in rule name (`email`, `number`, `integer`,
 * `url`), a whole-value RegExp, or a function `(value, item)` returning
 * `true`/`undefined`/`null` for pass, `false` for a fail, or a string that
 * is the failure message.
 */
export type FormValidationRule =
  | 'email' | 'number' | 'integer' | 'url'
  | RegExp
  | ((value: unknown, item: FormItemConfig) => boolean | string | void);

/**
 * A declarative field rule: a constant, a function of the
 * whole `{ name: value }` snapshot, or a condition on one named item's value.
 * In a form group a condition may read a field of another
 * member: `name` resolves against the member that owns it, or `form` pins the
 * member by its `group.add(form, { id })` id.
 */
export type FormRule =
  | boolean
  | ((values: Record<string, unknown>) => boolean)
  | {
      /** The id of the group member whose item `name` is read from; omitted, `name` resolves to whichever member owns it. */
      form?: string;
      /** The name of the item whose value the condition tests. */
      name?: string;
      /** True when the named item's value `===` this value. */
      equals?: unknown;
      /** True when the named item's value is one of these. */
      in?: unknown[];
      /** True when the named item's value is (or is not) empty. */
      empty?: boolean;
      /** A custom predicate over the named value and the whole snapshot. */
      fn?: (value: unknown, values: Record<string, unknown>) => boolean;
    };

/** The orientation of a wizard's step indicator. */
export type FormStepOrientation = 'horizontal' | 'vertical';

/** One wizard step: a labelled group of rows, shown one at a time. */
export interface FormStep {
  /** The step id, for the indicator's accessible label; defaults to `step-<n>`. */
  id?: string;
  /** The step label shown in the indicator. */
  label?: string;
  /** The step's blocks, stacked vertically. */
  rows: FormBlock[];
  /** Extra CSS on the step body. */
  css?: Record<string, string | number> | string;
}

/** The object a custom control's `create` receives to talk back to the form. */
export interface FormControlApi {
  /** The item's name, or `null` for an unnamed item. */
  readonly name: string | null;
  /** The item's config. */
  readonly item: FormItemConfig;
  /** Read the committed value. */
  getValue(): unknown;
  /** Write a committed value, silently (no event fires). */
  setValue(value: unknown): void;
  /** Commit the current value through `beforeChange`/validation/`change`. */
  onChange(value?: unknown): void;
  /** Report a live (uncommitted) value. */
  onInput(value?: unknown): void;
}

/** A custom control type's definition. */
export interface FormControlDefinition {
  /** Build the control's DOM into `el` and capture what the other hooks need. */
  create(el: HTMLElement, item: FormItemConfig, api: FormControlApi): void;
  /** Read the control's current value from the DOM it built. */
  getValue(el: HTMLElement): unknown;
  /** Write a committed value into the control's DOM. */
  setValue(el: HTMLElement, value: unknown): void;
  /** Refuse a commit: `true` accepts, `false`/a message refuses, a Promise is awaited. */
  validate?(value: unknown, item: FormItemConfig, el: HTMLElement): boolean | string | Promise<boolean | string>;
  /** Tear the control down on `form.destroy()`. */
  destroy?(el: HTMLElement): void;
}

/**
 * A button's visual weight: theme-token colours, light and dark.
 */
export type FormButtonVariant = 'primary' | 'secondary' | 'tonal' | 'outline' | 'text' | 'danger';

/**
 * How a `buttons` row lays its children out along the form's width.
 */
export type FormButtonsAlign = 'start' | 'end' | 'center' | 'stretch' | 'space-between';

/** A round icon button (or a value-following avatar) attached to the right of a field. */
export interface FormFieldAddon {
  /** A glyph name from the grid's icon set, or a DOM node, drawn inside the button. */
  icon?: string | Node;
  /** The button's accessible name (required for an icon-only addon). */
  ariaLabel?: string;
  /** The button's hover title; the `ariaLabel` when omitted. */
  tooltip?: string;
  /** Fired with the field's committed value and its item when the addon is clicked. */
  onClick?: (value: unknown, item: FormItemConfig) => void;
  /** A URL that turns the addon into a link instead of a button. */
  href?: string;
  /** Draw a round avatar beside the field (instead of an icon button): an image URL, initials text, `true` to derive it from the selected option's `avatar`/`label`, or `(value, item) => string`. It follows the field's value. */
  avatar?: boolean | string | ((value: unknown, item: FormItemConfig) => string);
}

/** A round icon button in a panel section's header. */
export interface FormPanelAction {
  /** A glyph name from the grid's icon set, or a DOM node, drawn inside the button. */
  icon?: string | Node;
  /** The button's accessible name (required for an icon-only action). */
  ariaLabel?: string;
  /** Fired when the action is clicked. */
  onClick?: () => void;
}

/** A panel section: its own surface holding child blocks, with a title, subtitle, divider and header actions. */
export interface FormPanelConfig {
  /** The panel's heading, drawn with heading semantics. */
  title?: string;
  /** A muted line under the title. */
  subtitle?: string;
  /** Round icon buttons in the panel's header. */
  actions?: FormPanelAction[];
  /** Draw a collapse/expand toggle in the header that hides and shows the panel body (default false). */
  collapsible?: boolean;
}

/**
 * One form item: a control (`input`, `number`, `textarea`, `checkbox`,
 * `button`, `combo`, `select`, `radiogroup`, `checkboxgroup`, `toggle`,
 * `datepicker`, `daterange`, `file`, `richtext`, `rating`, `stage`, `chips`, `otp`, `color`,
 * `listbox`, `speeddial`, `avatar`) or the read-only `text` display, with the per-item options.
 */
export interface FormItemConfig extends ComboConfig {
  /**
   * A control's own settings bag. A custom control registered with
   * `registerControl` reads its settings from `item.props` in `create()`;
   * any top-level key the form does not recognise joins the same bag. A `toggle` item's `labelPosition` — `'inside'`
   * (default), `'before'` or `'after'` — lives here, because the top-level
   * `labelPosition` already means the item label's side.
   */
  props?: Record<string, unknown>;
  /** The control type — a built-in or a type registered with `registerControl`. Defaults to `input`. */
  type?: string;
  /** The item's name, for `getItem(name)` and `getValue()`/`setValue()`. */
  name?: string;
  /** The label text, associated to the control for screen readers. */
  label?: string;
  /** Where the label sits: `top` (default), `left`, or `hidden` (visually hidden but still the accessible name). */
  labelPosition?: FormLabelPosition;
  /** Keep the label as the control's accessible name without drawing it — a visually hidden `<label>` linked to the control — so the field takes the full row, whatever `labelPosition` says. */
  hiddenLabel?: boolean;
  /** The label column width when `labelPosition` is `left`. */
  labelWidth?: number | string;
  /**
   * When `labelPosition` is `left`: the width, in pixels or a CSS length,
   * below which the control is too narrow and the label switches to the
   * top instead — measured as this item's own width
   * minus the label column (`labelWidth`, or the label's natural width
   * when unset) minus the gap between them. Inherited like `labelPosition`
   * and `labelWidth` from a fieldset, a container or the form; an item's
   * own value wins. Re-measured per item with a `ResizeObserver` (a shell
   * splitter or a drawer resizing the host counts, not only the window),
   * with a few pixels of hysteresis so a width sitting on the threshold
   * never flickers. Unset, nothing switches. A checkbox or toggle item
   * ignores this — its label sits beside it by design.
   */
  controlMinWidth?: number | string;
  /**
   * The item's width: a pixel number, a CSS length string such as `'12em'`,
   * a percentage string such as `'33.3%'`, or `'content'` to size the item to
   * its control's own content (the default for buttons and toggles) rather
   * than filling its row. In a `cols` row a percentage is
   * a share of the row's width *after* the gaps between its items, so items
   * totalling 100% lay out on one line with the gaps intact and an unsized
   * neighbour takes the remaining space; a px/rem width is a fixed flex basis.
   */
  width?: number | string;
  /**
   * The item's height, for every item type: a pixel number,
   * a CSS length string, or `'content'` to size the control to its own content.
   * A `listbox` item's `height` instead sets its viewport height in pixels,
   * overriding `rows`; on a vertical `slider` item it sets
   * the track's length (default 160).
   */
  height?: number | string;
  /** The space between the item's cell and its control — a pixel number or a CSS length — on items and on `rows`/`cols`/`items`/`fieldset`/`panel` containers. */
  padding?: number | string;
  /** Placeholder text for a text-like control. */
  placeholder?: string;
  /** Help text shown under the control. */
  helpMessage?: string;
  /** Start hidden. */
  hidden?: boolean;
  /** Start disabled. */
  disabled?: boolean;
  /** Start read-only. */
  readOnly?: boolean;
  /** Help text a "?" trigger after the label reveals on hover, focus, Enter and tap, linked to the control by `aria-describedby` — or, for a `slider` item, whether it shows the thumb's live value while dragging or focused. The two never collide: the "?" trigger only ever draws for a string value, so a slider's boolean never raises it. */
  tooltip?: string | boolean;
  /** Show the read-only lock inside a read-only field's right edge (default true); `false` hides it. */
  lockIcon?: boolean;
  /** Round icon buttons (and avatar addons) attached to the right of the field, disabled with it. */
  addons?: FormFieldAddon[];
  /** The initial value. */
  value?: unknown;
  /** An empty value fails validation. */
  required?: boolean;
  /** The marker a required field with no visible label shows on its placeholder: `true` (the default) appends `" *"`, a string resolves through the message catalogue, and `false` shows nothing. */
  requiredHint?: boolean | string;
  /** A further rule: a built-in name, a RegExp, or a function `(value, item) => boolean | string | void`. */
  validation?: FormValidationRule;
  /** The text shown when the item fails, overriding the rule's default. */
  errorMessage?: string;
  /** The text shown when the item passes validation (after it has been validated). */
  successMessage?: string;
  /** The hint shown before the first validation verdict. */
  preMessage?: string;
  /** When the item re-checks itself: `change`, `blur`, or `submit` (default, on `validate()` only). */
  validationMode?: FormValidationMode;
  /** The native input subtype for an `input` item. */
  subtype?: FormInputSubtype;
  /** Show the reveal button inside a `password` input (default true); `false` turns it off. */
  reveal?: boolean;
  /** The box count of an `otp` item (default 6). */
  length?: number;
  /** The `otp` characters — `numeric` (default) or `alphanumeric` — the `datepicker` mode: `date`, `date-time` or `time` — the `color` item's opening popover view — the `speeddial` item's menu shape: `linear` (default) or `radial` — or a `slider` item's track direction: `horizontal` (default) or `vertical`. */
  mode?: 'numeric' | 'alphanumeric' | FormPickerMode | FormColorMode | 'linear' | 'radial' | 'horizontal' | 'vertical';
  /** Hide each `otp` box's glyph with the password disc. */
  mask?: boolean;
  /** The number step, for a `number` item. */
  step?: number;
  /** The number format a `number` item displays when blurred, the same shape a grid number column takes — a `NumberFormat` spec (which may name `pattern`) or a bare pattern string like `'#,##0.00'`. The value stays a number; only the display is formatted. */
  format?: NumberFormat | string;
  /** Draw two step buttons beside a `number` item's field (default false); the native spinner never appears either way. */
  spinner?: boolean;
  /** Makes a `number` item a unit-aware field: which unit system it measures in — `'data'`, `'length'`, `'mass'`, `'pressure'` and the rest, plus anything registered with `registerUnitSystem`. */
  system?: string;
  /** The unit the `number` item's stored values are in, e.g. `'bar'`; defaults to the system's base unit. */
  unit?: string;
  /** Use the power-of-two ladder for a `data` unit field. */
  binary?: boolean;
  /** Fixed decimal places for the unit display, setting both the minimum and maximum. */
  decimals?: number;
  /** The fewest decimal places in a unit display. */
  minDecimals?: number;
  /** The most decimal places in a unit display. */
  maxDecimals?: number;
  /** Which unit the field renders in: a symbol from the system, or `'auto'` to pick the most readable rung. */
  display?: string;
  /** Whether to group thousands in a unit display. */
  group?: boolean;
  /** What sits between the number and the unit symbol. */
  space?: string;
  /** Whether the unit symbol goes after the number or before it. */
  placement?: 'suffix' | 'prefix';
  /** Render one stored number across an ordered subset of the system's units, e.g. `['ft', 'in']`. */
  compound?: string[];
  /** Round the unit display to this many significant figures before the rung is chosen. */
  significantFigures?: number;
  /** Text for a null or non-finite unit value, empty by default. */
  nullDisplay?: string;
  /** Makes a `number` item a temperature field, in this scale (`'C'`, `'F'`, `'K'` or `'R'`); conversion is affine, so `212 °F` into a Celsius field stores `100`. */
  scale?: string;
  /** Show a compact unit selector inside the field that changes only the display unit, never the committed value. */
  unitPicker?: boolean;
  /** The minimum — a number for `number`, a multi `chips`/`listbox` selection count, an ISO string for `datepicker` and `daterange`. */
  min?: number | string;
  /** The maximum — a number for `number`, a multi `chips`/`listbox` selection count, an ISO string for `datepicker` and `daterange`. */
  max?: number | string;
  /** The visible rows, for a `textarea` item, or a `listbox` item's viewport height in option rows (default 8). */
  rows?: number;
  /** The choices of a `select`, `radiogroup`, `checkboxgroup` or `listbox` item: strings, `{ value, label }` objects, or `{ label, options }` groups; or the selectable options of a `chips` item (`{ value, label, icon?, disabled? }` entries). */
  options?: (string | FormOption | FormOptionGroup | FormChipOption | FormToggleGroupOption)[];
  /** A `listbox` item's selection mode: `'single'` (default), `'multiple'` (Ctrl/Shift and touch-tap selection) or `'checkbox'` (a box per row plus a select-all row). */
  selection?: 'single' | 'multiple' | 'checkbox';
  /** Add a search box to a `listbox` item that narrows its rows by label and description, without dropping an already-selected option it hides. */
  filter?: boolean;
  /** Bucket a `listbox` item's options by their `group` field under sticky headers. */
  groupBy?: boolean;
  /** Order a `listbox` item's options by label: `'asc'`, `'desc'`, or `false` (default) to keep the configured order. */
  sort?: 'asc' | 'desc' | false;
  /** A custom row renderer for a `listbox`/`select`/`combo` option, returning a DOM node or an HTML string (sanitised before insertion). */
  render?: (option: FormOption) => Node | string;
  /** Let a `listbox` item's rows be moved by drag, by Move up/down toolbar buttons and by Alt+Arrow; the committed value becomes the full, reordered item array. */
  reorder?: boolean;
  /** With `reorder: true`, `'order'` makes a `listbox` item's committed value the ordered array of option values in every selection mode — the shape an editable ordered list wants even while `selection` is `'single'`, where the value would otherwise be just the one selected item. */
  valueAs?: 'order';
  /** The name of another `listbox` item this one exchanges items with via drag and the Move selected/Move all toolbar buttons; each side's value is the items it currently holds. */
  connect?: string;
  /** Draw a drag grip on a `listbox` item's rows and drag only from it (a plain pointer drag, not native HTML5 drag-and-drop), and size rows to their content instead of a fixed height. */
  dragHandle?: boolean;
  /** Lay a `radiogroup` or `checkboxgroup`'s options out vertically (the default) or on one wrapping horizontal line. */
  orientation?: 'vertical' | 'horizontal';
  /** Lay a `radiogroup` or `checkboxgroup`'s options out in this many columns, read across then down. */
  columns?: number;
  /** Keep the native `<select>` element rather than the rendered trigger and listbox. */
  native?: boolean;
  /** The locale the `datepicker` formats month/weekday names in, and the `number` item's format and typed-input separators resolve against; the viewer's when omitted. */
  locale?: string;
  /** The timeZone the `datepicker` reads a Date/epoch value in, like the grid's date columns. */
  timeZone?: string;
  /** The `daterange` granularity: `day` (default) or `month` — a year-month range picker of two years of twelve month cells. */
  granularity?: FormDateRangeGranularity;
  /** The `daterange` presets drawn on the left of the popup: an explicit list, `false` to hide, or omitted for the defaults (today, yesterday, last 7 days, last 30 days, this month, last month). */
  presets?: false | FormDateRangePreset[];
  /** The `daterange` fewest days (or months in month mode) a range may span. */
  minSpan?: number;
  /** The `daterange` most days (or months in month mode) a range may span. */
  maxSpan?: number;
  /** The `datepicker`/`daterange` days (or `daterange` months) that may not be picked: an ISO string list or a function `(iso) => boolean`. */
  disabledDates?: string[] | ((iso: string) => boolean);
  /** Add an ISO week-number column to the `daterange` grid (default false). */
  weekNumbers?: boolean;
  /** The `daterange` first weekday column (0 = Sunday); the locale's week info when omitted. */
  firstDay?: number;
  /** Show Apply/Cancel on the `daterange` popup so nothing commits until Apply (default true); `false` commits on the second pick. */
  applyButton?: boolean;
  /** Shorthand for a read-only `text` display. */
  text?: string;
  /** A rule that hides the item when it evaluates false. */
  visibleWhen?: FormRule;
  /** A rule that makes the item read-only when it evaluates true. */
  readOnlyWhen?: FormRule;
  /** A rule that makes the item required when it evaluates true. */
  requiredWhen?: FormRule;
  /** Extra CSS on the item wrapper. */
  css?: Record<string, string | number> | string;
  /** Extensions or MIME patterns a `file` item accepts (empty = anything), or the MIME patterns an `avatar` item's chooser accepts (default `['image/*']`). */
  accept?: string[];
  /** The maximum file size in bytes a `file` item admits, or an `avatar` item's chosen picture refuses. */
  maxSize?: number;
  /** The maximum number of files a `file` item admits. */
  maxFiles?: number;
  /** Allow picking several files at once for a `file` item (default true), toggling several options for a `chips` item (default false, single-select), or a multi-select `select` whose committed value is an array. */
  multiple?: boolean;
  /** Toggle each `togglegroup` option independently; the default false keeps exactly one option pressed. */
  multiselect?: boolean;
  /** The pixel space between `togglegroup` buttons (default 0). */
  gap?: number;
  /** Stretch a `togglegroup` to its item's full width. */
  full?: boolean;
  /** Drop-zone text for a `file` item. */
  dropText?: string;
  /** A hint line under the drop zone of a `file` item. */
  hint?: string;
  /** Replaces the browse link's word in a `file` item's drop area and its aria-label. */
  browseText?: string;
  /** The host upload callback for a `file` item (`(file, { onProgress, signal }) => void | Promise<void>`), or an `avatar` item's own upload config, posted as multipart form data. */
  upload?: ((file: File, opts: { onProgress: (pct: number) => void; signal?: AbortSignal }) => void | Promise<void>) | FormAvatarUploadConfig;
  /** Round an `avatar` item's picture into a circle; otherwise it keeps the control's own rounded-square radius. */
  circle?: boolean;
  /** The accessible `alt` text on an `avatar` item's picture. */
  alt?: string;
  /** An image URL an `avatar` item shows while it has no value, ahead of `icon` and the `placeholder` text. */
  preview?: string;
  /** Show an `avatar` item's clear control once it has a value, setting it back to `null` (default true). */
  removeIcon?: boolean;
  /** The toolbar for a `richtext` item: a preset (`basic`/`html`/`rich`) or an item-name array. */
  toolbar?: string | string[];
  /** The minimum editor height in pixels for a `richtext` item. */
  minHeight?: number;
  /** The maximum editor height in pixels for a `richtext` item. */
  maxHeight?: number;
  /** The link target for links created in a `richtext` item. */
  linkTarget?: string;
  /** The colour swatches for a `richtext` item's text-colour popover. */
  colors?: string[];
  /** The `[tag, label]` heading options for a `richtext` item. */
  headings?: Array<[string, string]>;
  /** An override whitelist of tags/attributes for a `richtext` item. It can only narrow the default whitelist: event handlers, `srcdoc`, `id`/`name`, the forbidden tags and `javascript:`/`vbscript:`/`data:` URLs are always stripped. */
  allowedTags?: Record<string, string[]>;
  /** The maximum image size in bytes a `richtext` item inserts. */
  maxImageSize?: number;
  /** A host callback returning a source URL for an inserted image. */
  onImage?: (file: File) => Promise<string> | string;
  /** Sanitise pasted HTML in a `richtext` item (default true). */
  sanitizePaste?: boolean;
  /** Allow half steps for a `rating` item. */
  allowHalf?: boolean;
  /** Allow a second click to clear a `rating` item back to zero. */
  allowClear?: boolean;
  /** The icon of a `button` — a name from the grid's icon set, an image URL or data: URI, or an element — the glyph name of a `rating` item (`star` or `heart`), the drop-area icon of a `file` item — a glyph name from the file module's sprite set, an SVG markup string, an element, or `false` for none — the glyph name a `color` item's trailing toggle draws instead of its default chevron — a `time` item's toggle glyph, default the grid's clock — or an `avatar` item's fallback image URL (or element), shown with no value and no `preview`. */
  icon?: string | Element | false;
  /** The filled and empty glyph names for a `rating` item. */
  icons?: { filled?: string; empty?: string };
  /** One label per rating icon, for the `title` and the announced value. */
  labels?: string[];
  /** Show the numeric value beside a `rating` item. */
  showValue?: boolean;
  /** The size of a `rating` item or `button`: `sm`, `md` (default) or `lg` — a `toggle` item's `small`, `default` or `large` — or an `avatar` item's picture: `small`, `medium` (default, 64px), `large`, or a pixel number. */
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'default' | 'large' | number;
  /** Where a `button`'s icon sits: `start` (default) or `end`. */
  iconPosition?: 'start' | 'end';
  /** A `button`'s visual weight: theme-token colours, light and dark. Defaults to `secondary` — or a `toggle` item's track shape: `round` (default), `square` or `slim`. */
  variant?: FormButtonVariant | 'round' | 'square' | 'slim';
  /** A `toggle` item's ON-state label text, drawn inside the track or beside it per `props.labelPosition`. */
  onLabel?: string;
  /** A `toggle` item's OFF-state label text. */
  offLabel?: string;
  /** Make a `button` span the full form width. */
  fullWidth?: boolean;
  /** A `button`'s text case: `none` (default) or `uppercase`. */
  textTransform?: 'none' | 'uppercase';
  /** A `button`'s native type: `button`, `submit` (validates first, then fires `submit` with the values only when valid) or `reset` (clears the form). */
  buttonType?: 'button' | 'submit' | 'reset';
  /** A `button`'s loading state: swaps its icon for a spinner, keeps the width, sets `aria-busy` and ignores clicks. Toggle live with `item.setLoading(bool)`. */
  loading?: boolean;
  /** A URL that turns a `button` into a link styled as a button. */
  href?: string;
  /** The accessible name of an icon-only `button` (icon with no label, required). */
  ariaLabel?: string;
  /** Make a `button` a two-state toggle: it flips `aria-pressed` and fires `change` with the new boolean state, and reads as pressed. Starts pressed when `value` is `true`. */
  toggle?: boolean;
  /** Keep a disabled `button` focusable and in the tab order: it reads `aria-disabled` instead of being natively disabled, and still ignores clicks. */
  focusableWhenDisabled?: boolean;
  /** How a `buttons` row lays its children out along the width: `start` (default), `end`, `center`, `stretch` or `space-between`. */
  align?: FormButtonsAlign;
  /** The buttons of a `buttons` row; each child takes the same options as a `button` item. */
  items?: FormItemConfig[];
  /** The step labels of a `stage` item, in order. */
  stages?: string[];
  /** The initial selection of a `stage` item: an index or a label. */
  current?: number | string;
  /** The last done step of a `stage` item: an index or a label. */
  completed?: number | string;
  /** Whether clicking a `stage` step selects it (default true). */
  clickable?: boolean;
  /** Whether a `stage` item shows its check glyphs (default true). */
  showIcons?: boolean;
  /** Allow a single-mode `chips` item to be left with nothing selected. */
  allowEmpty?: boolean;
  /** Wrap a `chips` item's pills onto several lines (default), or keep them on one scrolling row when false. */
  wrap?: boolean;
  /** The rows of preset swatches a `color` item's palette view shows, replacing the shared default (ten hues in five shades). */
  palette?: string[][];
  /** Show a `color` item's grey row under its palette (default true); `false` drops it. */
  grayShades?: boolean;
  /** A `color` item's custom-colours row to start with — extended, newest first and deduplicated to at most ten, by every colour picked in the picker view. */
  customColors?: string[];
  /** Remove a `color` item's palette view, leaving only the picker. */
  pickerOnly?: boolean;
  /** Let a `color` item's text part be typed into (default true); `false` makes it read-only, so only the popover sets the value — or a `time` item's field text (default false there, the popup sets it; `true` accepts typed `HH:MM`/`hh:MM AM`, committed on blur or Enter). */
  editable?: boolean;
  /** Show a clear control: on a `color` item it sets the value to `null`; on a `daterange` item a null/null pair; on a single-select `combo` it empties the value to `null`, and on a `select` item to its empty value `''`, with one `change`; on a `datepicker` item it empties the value to `null`, shown only while a value is held and not read only. An optional single-select combo is also emptied when its text is cleared and Enter is pressed or focus leaves. */
  clearable?: boolean;
  /** The clock format of a `time` item: `24` (default, `HH:MM`) or `12` (`hh:MM` with an AM/PM segment in the popup and display). */
  timeFormat?: 12 | 24;
  /** How a `time` item stores its value: `'string'` (default, `'HH:MM'` or `'hh:MM AM'` in 12-hour) or `'object'` (`{ hour, minute, AM? }`). */
  valueFormat?: 'string' | 'object';
  /** Add Close and Save buttons to a `time` item's popup so nothing commits until Save and Close discards (default false: the popup commits as the clock changes). */
  controls?: boolean;
  /** Make a `slider` item a two-thumb range: the committed value is then `[low, high]` and the thumbs cannot cross. */
  range?: boolean;
  /** Draw a `slider` tick mark every this many units; omitted, no tick marks are drawn. */
  tick?: number;
  /** Draw a labelled, taller `slider` tick every this many units, formatted by `tickTemplate`; omitted, no major ticks are drawn. */
  majorTick?: number;
  /** Format a `slider` tick's label and a thumb's `aria-valuetext`; the plain number when omitted. */
  tickTemplate?: (value: number) => string;
  /** Reverse which end of a `slider` track holds the minimum. */
  inverse?: boolean;
  /** Extra per-control options, kept for later controls. */
  [key: string]: unknown;
}

/**
 * The committed value of an `avatar` item: the picture, and — while a
 * freshly chosen file is pending or uploading — its own file and progress.
 */
export interface FormAvatarValue {
  /** The picture's source: a URL, or (before any upload completes) the data URL of a freshly chosen file. */
  src?: string;
  /** The chosen file, present only while `status` is `'pending'`, `'uploading'` or `'failed'` (not yet, or not successfully, uploaded). */
  file?: File;
  /** The chosen file's name. */
  name?: string;
  /** The chosen file's size in bytes. */
  size?: number;
  /** The upload progress, 0 to 100, present while `status` is `'uploading'`. */
  progress?: number;
  /** The upload status, present only when the item has an `upload` config. */
  status?: 'pending' | 'uploading' | 'done' | 'failed';
  /** The failure message, present only while `status` is `'failed'`. */
  message?: string;
  /** The response id, when `upload.updateFromResponse` read one back. */
  id?: string | number;
}

/**
 * An `avatar` item's own upload config: posts the chosen file as multipart
 * form data the moment it is admitted.
 */
export interface FormAvatarUploadConfig {
  /** The URL the file is POSTed to. */
  target: string;
  /** The multipart field name the file is sent under. Default `'file'`. */
  fieldName?: string;
  /** Extra form fields sent alongside the file. */
  params?: Record<string, string | number | boolean>;
  /** Extra request headers. */
  headers?: Record<string, string>;
  /** Upload the moment the file is admitted (default true); `false` leaves the picture `'pending'` and posts nothing. */
  autosend?: boolean;
  /** Read `src`/`id` back from the JSON response once the upload completes (default true). */
  updateFromResponse?: boolean;
}

/**
 * The `type: 'avatar'` item options, documented here as their own shape: a profile picture with a preview, sizes, a placeholder,
 * a remove control and an optional upload. Used inside a form the same way
 * as every other item — `{ type: 'avatar', name, ...these options }` — with
 * these fields typed on {@link FormItemConfig} itself (`value`, `size`,
 * `icon`, `accept`, `maxSize`, `upload` are shared with other control types
 * there; see each one's own doc for the `avatar` reading).
 */
export interface AvatarItemConfig {
  /** The committed picture, or `null`/absent for none. */
  value?: FormAvatarValue | null;
  /** The accessible `alt` text on the picture. */
  alt?: string;
  /** The display size: `small`, `medium` (default, 64px), `large`, or a pixel number. */
  size?: 'small' | 'medium' | 'large' | number;
  /** Round the picture into a circle (default false, a rounded square). */
  circle?: boolean;
  /** An image URL shown while there is no value, ahead of `icon` and `placeholder`. */
  preview?: string;
  /** A fallback image URL (or element) shown while there is no value and no `preview`. */
  icon?: string | Element | false;
  /** Text shown while there is no value, no `preview` and no `icon`; defaults to the catalogue's "Add a photo". */
  placeholder?: string;
  /** MIME patterns the file chooser accepts. Default `['image/*']`. */
  accept?: string[];
  /** The largest file size accepted, in bytes; a larger pick is refused with a message `validate()` surfaces. */
  maxSize?: number;
  /** Show the clear control once a picture is set (default true). */
  removeIcon?: boolean;
  /** Upload the chosen file as multipart form data. */
  upload?: FormAvatarUploadConfig;
  /** An empty picture fails validation. */
  required?: boolean;
}

/**
 * One block of a form layout: a container (`rows`/`cols`/`items`/`container`),
 * a `fieldset`, a `spacer`, a `separator`, a panel section, or an item.
 */
export interface FormBlock {
  /** A vertical stack of child blocks. */
  rows?: FormBlock[];
  /** A horizontal stack of child blocks. */
  cols?: FormBlock[];
  /** A side-by-side run of form items. */
  items?: FormItemConfig[];
  /** The vertical gap between this container's or fieldset's own items — a px number or a CSS length, overriding the form's `spacing` for those items only. */
  spacing?: number | string;
  /** On a `cols` block, resolve each item's percentage `width` against its own rendered line's gaps instead of the whole row's: a `100%` item fills its line alone, and a `50%`/`50%` pair shares one gap and sits side by side filling it exactly, instead of the pair's widths being shrunk by every gap in the row. Items that do not fit on a line wrap to the next one, as they already do; hiding an item frees its line slot (later items shift up and may join an earlier line), and showing it again restores the layout. The per-line pass measures a nested block's own `width` the same as an item's. Ignored on any other axis. Default `false`. */
  wrap?: boolean;
  /** On a `cols` block, the gap between items — a px number or a CSS length, both the rendered gap and the `wrap` per-line width maths. Sets both `columnGap` and `rowGap` unless one of them overrides it. Ignored on any other axis. Default `--lattice-space` (the theme's own gap). */
  gap?: number | string;
  /** On a `cols` block, the gap between items on the same line — a px number or a CSS length, overriding `gap` for this axis only. Ignored on any other axis. */
  columnGap?: number | string;
  /** On a `cols` block, the gap between wrapped lines — a px number or a CSS length, overriding `gap` for this axis only. Ignored on any other axis. */
  rowGap?: number | string;
  /** The control type, or `spacer`/`separator`. Defaults to `input`. */
  type?: string;
  /** A fieldset: `'Legend'` or `{ legend, rows, cols, items }`. */
  fieldset?: string | FormBlock;
  /** An explicit container, `{ rows | cols | items }`. */
  container?: FormBlock;
  /** A panel section: its own surface holding this block's `rows`/`cols`/`items` children, with a title, subtitle, divider and header actions. */
  panel?: FormPanelConfig;
  /** A flexible spacer. */
  spacer?: boolean;
  /** A horizontal rule; with `label`, the rule is split around the centred label. */
  separator?: boolean;
  /** The fieldset legend, when written as a sibling of `fieldset`. */
  legend?: string;
  /** The item's name, or a fieldset's name — either way, what `getItem(name)` reads. */
  name?: string;
  /** The item's label text, or a `separator`'s centred label (a literal or a catalogue key). */
  label?: string;
  /** Where the label sits: `top` (default), `left`, or `hidden`. On a container or fieldset this is the default its items inherit. */
  labelPosition?: FormLabelPosition;
  /** The label column width when `labelPosition` is `left`; on a container or fieldset this is the default its items inherit. */
  labelWidth?: number | string;
  /** The width below which a `left` label switches to the top instead; on a container or fieldset this is the default its items inherit. See {@link FormItemConfig.controlMinWidth}. */
  controlMinWidth?: number | string;
  /** The item's width; on a spacer, container, fieldset or panel block nested in a `cols` row, its own share of that row, applied exactly as an item's `width` is, with and without `wrap`. */
  width?: number | string;
  /** Placeholder text. */
  placeholder?: string;
  /** Help text shown under the control. */
  helpMessage?: string;
  /** Start hidden. */
  hidden?: boolean;
  /** Start disabled. */
  disabled?: boolean;
  /** Start read-only. */
  readOnly?: boolean;
  /** The initial value. */
  value?: unknown;
  /** The native input subtype. */
  subtype?: FormInputSubtype;
  /** A rule that hides the item when it evaluates false. */
  visibleWhen?: FormRule;
  /** A rule that makes the item read-only when it evaluates true. */
  readOnlyWhen?: FormRule;
  /** A rule that makes the item required when it evaluates true. */
  requiredWhen?: FormRule;
  /** Extra CSS on the block. */
  css?: Record<string, string | number> | string;
  /** Extra options. */
  [key: string]: unknown;
}

/**
 * The `type: 'container'` item: a content item, not a layout block — a place
 * in the form that shows host HTML or hosts another Lattice view (a grid,
 * chart, kanban, calendar, gantt or nested form), attached after creation
 * through `form.getItem(name).attach()`. Carries no
 * `value`: it is excluded from `getValue()`, `setValue()` and validation. A
 * block that also names `rows`/`cols`/`items` stays the layout container
 * regardless of `type`.
 */
export interface FormContainerItemConfig {
  /** The item's name, for `getItem(name)`. */
  name?: string;
  /** Host content rendered inside the region: a string has every `<script>` element, `on*` attribute and `javascript:`-scheme value stripped — everything else, inline styles included, is kept; an `HTMLElement` is appended as is, with no sanitising. */
  html?: string | HTMLElement;
  /** The label text, set as the region's `aria-label` (and, like any item, drawn as an associated `<label>` beside it). */
  label?: string;
  /** Where the label sits: `top` (default), `left`, or `hidden`. */
  labelPosition?: FormLabelPosition;
  /** The label column width when `labelPosition` is `left`. */
  labelWidth?: number | string;
  /** The item's width, applied once to its wrapper slot like any other item's: a pixel number, a CSS length, or a percentage such as `'40%'`, a share of the row's width after the gaps between its items. The region itself always fills that slot — unset (the default) gives it its default share of the row, the same as any other item. */
  width?: number | string;
  /** The region's own height: a pixel number, a CSS length, or `'content'` to size to its own content (the default). Unlike `width`, this sizes the region directly, not the wrapper slot; a container with an explicit height still shrinks like its siblings when its column runs out of room. */
  height?: number | string;
  /** Inner padding: a pixel number or a CSS length. */
  padding?: number | string;
  /** Extra CSS on the item wrapper. */
  css?: Record<string, string | number> | string;
  /** Start hidden. */
  hidden?: boolean;
  /** Start disabled: the region carries `aria-disabled` and `inert`. */
  disabled?: boolean;
  /** A rule that hides the item when it evaluates false. */
  visibleWhen?: FormRule;
}

/** A totals function: a built-in name, or your own reducer over the cells' values. */
export type GridItemTotalFn = 'sum' | 'avg' | 'count' | ((values: unknown[], ctx: { field?: string; rows?: object[]; row?: object }) => unknown);

/**
 * One mapped cell of a `grid` item: the row (by its `rowKey` value) and the
 * column (by its field) whose value becomes a top-level property of the form
 * value.
 */
export interface GridItemField {
  /** The `rowKey` value of the mapped row. */
  row: string | number;
  /** The field of the mapped column. */
  col: string;
}

/**
 * The display-only totals of a `grid` item. A totals row is
 * pinned beneath the body and a totals column is computed from each row; the
 * grid does not store either, and neither is ever part of the form value.
 */
export interface GridItemTotals {
  /**
   * A totals row. `true` sums the number columns; a name or function applies
   * to them; an object picks the columns (an array of fields, or a map of
   * field to function) and the label.
   */
  row?: boolean | GridItemTotalFn | {
    /** The function for every listed column (default `'sum'`). */
    fn?: GridItemTotalFn;
    /** The columns to total: an array of fields, or a map of field to its function. Defaults to every number-typed column. */
    columns?: string[] | Record<string, GridItemTotalFn>;
    /** The label shown on the row (default: the catalogue's "Total", localised). */
    label?: string;
    /** The field that carries the label (default: the first column that is not totalled). */
    labelColumn?: string;
  };
  /**
   * A totals column, computed per row. `true` sums the number columns; a name
   * or function applies to them; an object picks the columns, the heading and
   * any extra column options (a `type`, a `format`, a `width`).
   */
  column?: boolean | GridItemTotalFn | {
    /** The function over the row's values (default `'sum'`). */
    fn?: GridItemTotalFn;
    /** The fields to total across. Defaults to every number-typed column. */
    columns?: string[];
    /** The column heading (default: the catalogue's "Total", localised). */
    title?: string;
    /** Extra column options for the totals column (`type`, `format`, `layout`, …). */
    column?: object;
  };
}

/**
 * The `type: 'grid'` item: a live, editable Lattice grid as a form field. Its rows are the item's value, `fields` maps single cells
 * to further top-level form properties, and cell edits, row additions and row
 * removals go through the form's `beforeChange`, `change`, `validate()`, reset
 * and dirty tracking like any field. The grid factory is injected —
 * `createGrid` on the item, or on the form config — so the form bundles no
 * grid core.
 */
export interface GridItemConfig {
  /** The item's name, the key of its rows in `getValue()`. */
  name?: string;
  /** The grid factory (`createGrid`); defaults to the form config's `createGrid`. */
  createGrid?: (el: HTMLElement, config: object) => Grid;
  /** The grid's columns — every column option the grid accepts (`field`, `title`, `type`, `edit`, `validation`, …). The editable ones need `edit: true`. */
  columns: Array<string | object>;
  /** The field whose value identifies a row (default `'id'`). It is also how `fields` names a row. */
  rowKey?: string;
  /** The initial rows: objects, or arrays in column order. */
  value?: Array<object | unknown[]>;
  /** The shape of the rows in the form value: `'rows'` (objects, default) or `'arrays'` (arrays in column order). */
  valueAs?: 'rows' | 'arrays';
  /** `false` drops the rows array from `getValue()` and keeps only the mapped cells. Default `true`. */
  valueRows?: boolean;
  /** Cells mapped to top-level form properties, by property name. Each is read and written like any field, fires its own `change`, and takes part in dirty tracking and data binding. */
  fields?: Record<string, GridItemField>;
  /** Adds keyboard-operable add-row and delete-row buttons (off by default). Delete acts on the selected rows, else the row holding the focused cell. */
  rowControls?: boolean;
  /** A new row's defaults, or a function `(rows) => row`, for the add-row control and `addRow()`. The `rowKey` is filled in when absent or taken. */
  newRow?: object | ((rows: object[]) => object);
  /** The display-only totals row and/or column. */
  totals?: GridItemTotals;
  /** Extra grid options laid under the item's own (`rowKey`, `columns`, `rows` and `density` always win). */
  gridOptions?: object;
  /** The grid's height: a pixel number or a CSS length (default 240). */
  height?: number | string;
  /** The item's width: a pixel number, a CSS length or a percentage. */
  width?: number | string;
  /** The label text, set as the group's `aria-label` and drawn as the item's label. */
  label?: string;
  /** Where the label sits: `top` (default), `left`, or `hidden`. */
  labelPosition?: FormLabelPosition;
  /** The label column width when `labelPosition` is `left`. */
  labelWidth?: number | string;
  /** Help text shown under the grid. */
  helpMessage?: string;
  /** At least one row is required. */
  required?: boolean;
  /** A rule that makes the item required when it evaluates true. */
  requiredWhen?: FormRule;
  /** When the item is validated: `change`, `blur` or `submit` (default). */
  validationMode?: FormValidationMode;
  /** Start hidden. */
  hidden?: boolean;
  /** Start disabled: the grid is inert and excluded from validation. */
  disabled?: boolean;
  /** Start read-only: cells cannot be edited and the row controls are off. */
  readOnly?: boolean;
  /** A rule that hides the item when it evaluates false. */
  visibleWhen?: FormRule;
  /** A rule that makes the item read-only when it evaluates true. */
  readOnlyWhen?: FormRule;
  /** Extra CSS on the item wrapper. */
  css?: Record<string, string | number> | string;
}

/** A binding to a grid row: `{ grid, rowKey }`. */
export interface FormBindGridConfig {
  /** The grid whose row provides the record. */
  grid: Grid;
  /** The row key of the bound row. */
  rowKey: string | number;
}

/** A binding to a data-router record: `{ router, route, key, onSave? }`. */
export interface FormBindRouterConfig {
  /** The data router whose route's keyed diffs carry the record. */
  router: import('lattice-grid/modules/data-router').DataRouter;
  /** The route (predicate, partition value or label) to subscribe to. */
  route: import('lattice-grid/modules/data-router').RoutePredicate;
  /** The row key of the bound record. */
  key: string | number;
  /** Called after `save()` writes the record to the router, with the dirty changes and the full updated record. May be async: a rejection (or a thrown error) reverts the router record to its previous values and keeps the form dirty. */
  onSave?: (changes: Record<string, unknown>, record: import('lattice-grid/modules/data-router').RouterRecord) => void | Promise<void>;
}

/**
 * The `bind` option: a grid row (`{ grid, rowKey }`), a routed record
 * (`{ router, route, key }`), or a plain object of values.
 */
export type FormBind = FormBindGridConfig | FormBindRouterConfig | Record<string, unknown>;

/** The form config: the layout, the density, the binding, and the message catalogue. */
export interface FormConfig {
  /** The top-level blocks, stacked vertically (the form reads top to bottom). */
  rows?: FormBlock[];
  /** The top-level blocks, stacked horizontally (used when `rows` is absent). */
  cols?: FormBlock[];
  /** The density level, `compact`/`standard`/`comfortable`. Default `standard`. */
  density?: FormDensity;
  /** The vertical gap between items — a px number or a CSS length. Defaults to the density's own gap; a CSS theme may set `--lattice-form-item-gap` instead. */
  spacing?: number | string;
  /** The gap between an item's label and its field — a px number or a CSS length. Defaults to half the density's space; a CSS theme may set `--lattice-form-label-gap` instead. */
  labelGap?: number | string;
  /** The default label position every item inherits: `top`, `left` or `hidden`. An item's own `labelPosition` wins. */
  labelPosition?: FormLabelPosition;
  /** The default label column width every item inherits when its label is `left`; an item's own `labelWidth` wins. */
  labelWidth?: number | string;
  /** The default width below which a `left` label switches to the top instead, every item inherits; an item's own `controlMinWidth` wins. See {@link FormItemConfig.controlMinWidth}. */
  controlMinWidth?: number | string;
  /** The default marker a required field with no visible label shows on its placeholder: `true` appends `" *"`, a string resolves through the message catalogue, `false` shows nothing. An item's own `requiredHint` wins. */
  requiredHint?: boolean | string;
  /** The width, in pixels, below which a `cols` container stacks its children into one column, or `false` (or `0`) to never stack. A positive number is used as-is. Default 480. */
  colsBreakpoint?: number | false;
  /** When the root axis is `cols` (no `rows`), resolve each item's percentage `width` against its own rendered line's gaps instead of the whole row's. See {@link FormBlock.wrap}. Default `false`. */
  wrap?: boolean;
  /** When the root axis is `cols` (no `rows`), the gap between items. See {@link FormBlock.gap}. */
  gap?: number | string;
  /** When the root axis is `cols` (no `rows`), the gap between items on the same line, overriding `gap`. See {@link FormBlock.columnGap}. */
  columnGap?: number | string;
  /** When the root axis is `cols` (no `rows`), the gap between wrapped lines, overriding `gap`. See {@link FormBlock.rowGap}. */
  rowGap?: number | string;
  /**
   * Bind the form to a record. A grid row generates one item per column and
   * saves through the grid's edit path; a routed record follows the route's
   * keyed diffs; a plain object is initialised from and written back to.
   */
  bind?: FormBind;
  /** Extra CSS on the form root. */
  css?: Record<string, string | number> | string;
  /** Wizard steps: one labelled group of rows shown at a time. */
  steps?: FormStep[];
  /** The step indicator's orientation: `horizontal` (default) or `vertical`. */
  stepOrientation?: FormStepOrientation;
  /** Whether a forward step move validates the current step first (`true`, the default). Set `false` to run `validate()` yourself and navigate unchecked. */
  validateSteps?: boolean;
  /** A `t(key, params)` catalogue for the separator's accessible label. */
  messages?: { t(key: string, params?: object): string };
  /** The grid factory (`createGrid`) every `grid` item uses unless it names its own. */
  createGrid?: (el: HTMLElement, config: object) => Grid;
}

/** A combo option written as an object: `{ value, label, description, icon, avatar, color, dot, disabled }`. */
export interface ComboOptionObject {
  /** The option's value. */
  value?: unknown;
  /** The display label. */
  label?: string;
  /** The second line of a multi-line option. */
  description?: string;
  /** An image URL (drawn round, falling back to the label's initials), or initials text (drawn round on a colour from `color` or a hash of the label). */
  avatar?: string;
  /** A glyph name from the icon registry (see {@link IconName}), or a DOM node, drawn on the left when there is no avatar or dot; `color` tints it. */
  icon?: IconName | Node;
  /** The background colour for the initials avatar (a stable colour derived from the label when omitted) and the tint of the option's icon. */
  color?: string;
  /** A colour that draws a small filled circle before the label instead of an icon or avatar, with no letter. */
  dot?: string;
  /** Whether the option is shown but not selectable. */
  disabled?: boolean;
}

/** A combo option: a bare value, or the object form. */
export type ComboOption = string | number | ComboOptionObject;

/** What a combo `load` is handed: the search, the page, and an abort signal. */
export interface ComboLoadQuery {
  /** The current search text (empty for the first page). */
  search: string;
  /** The zero-based page to fetch. */
  page: number;
  /** Abort this load when a newer search supersedes it. */
  signal: AbortSignal;
  /** The page size handed to `load`. */
  pageSize: number;
}

/** A combo `load` result: a page, or a bare array (a single non-paging page). */
export type ComboLoadResult = { items: ComboOption[]; total?: number; hasMore?: boolean } | ComboOption[];

/** The `type: 'combo'` item options, and the standalone `createCombo` options. */
/** The options `createSelect` takes: the form's `type: 'select'` item as a standalone control. */
export interface SelectConfig {
  /** The option list: strings, `{ value, label }` objects, or groups. */
  options?: unknown[];
  /** Multi-select mode; the value is then an array. */
  multiple?: boolean;
  /** The initial value (an array when `multiple`). */
  value?: unknown;
  /** The text the trigger shows while nothing is chosen. */
  placeholder?: string;
  /** The accessible name of the trigger. */
  ariaLabel?: string;
  /** A custom renderer for one option in the list. */
  optionTemplate?: (option: object) => unknown;
  /** A custom renderer for the chosen value a single select shows on its trigger. */
  selectedTemplate?: (option: object) => unknown;
  /** Start disabled. */
  disabled?: boolean;
  /** Start read-only. */
  readOnly?: boolean;
  /** A message resolver for the control's own strings. */
  t?: (key: string, params?: object) => string;
  /** The owner document, for a select mounted outside the main document. */
  doc?: Document;
}

/** The select instance {@link createSelect} returns. Picking an option dispatches a DOM `change` event on the host element. */
export interface Select {
  /** The host element the select mounted into. */
  el: HTMLElement;
  /** The select's root element. */
  root: HTMLElement;
  /** The trigger button. */
  trigger: HTMLElement;
  /** The committed value (an array when `multiple`). */
  getValue(): unknown;
  /** Write a committed value silently; no `change` fires. */
  setValue(value: unknown): Select;
  /** Replace the option list, keeping a value still present. */
  setOptions(options: unknown[]): Select;
  /** Replace the empty-trigger placeholder. */
  setPlaceholder(text: string | null | undefined): Select;
  /** Re-render the list. */
  reload(): Select;
  /** Open the listbox. */
  open(): Select;
  /** Close the listbox. */
  close(): Select;
  /** Focus the trigger. */
  focus(): Select;
  /** Blur the trigger. */
  blur(): Select;
  /** Enable or disable the control. */
  setDisabled(disabled: boolean): void;
  /** Mark the control read-only. */
  setReadOnly(readOnly: boolean): void;
  /** Remove the control and its listeners. */
  destroy(): void;
}

export interface ComboConfig {
  /** The paging loader. Absent when `options` is used. */
  load?: (query: ComboLoadQuery) => ComboLoadResult | Promise<ComboLoadResult>;
  /** A static option list, used when `load` is absent. */
  options?: ComboOption[];
  /** Multi-select mode: the value is an array and choices become chips. */
  multiple?: boolean;
  /** The initial value (an array when `multiple`). */
  value?: unknown;
  /** Labels for selected values that sit outside the loaded pages. */
  resolveLabels?: (values: unknown[]) => ComboOption[] | Promise<ComboOption[]>;
  /** Free entry: `true`, or `{ create(text) }` to build the new option. */
  newOptions?: boolean | { create(text: string): unknown };
  /** A custom option renderer, returning a string or a DOM node. A string is treated as HTML and sanitised before it is inserted. */
  optionTemplate?: (option: ComboOption) => unknown;
  /** A custom renderer for the selected option — the multi-select chips and the single-select shown value — returning a string or a DOM node; a string is treated as HTML and sanitised. */
  selectedTemplate?: (option: ComboOption) => unknown;
  /** Show a select-all action over the loaded set (multi-select). */
  selectAll?: boolean;
  /** The search debounce, in milliseconds. Default 250. */
  debounce?: number;
  /** The page size handed to `load`. Default 20. */
  pageSize?: number;
  /** The chip area max height, in pixels. */
  maxHeight?: number;
  /** Where multi-select chips sit: 'inside' (default), 'above' or 'below' the control. */
  chipPlacement?: 'inside' | 'above' | 'below';
  /** Show a clear control on a single-select combo while it holds a value; it empties the value to `null` with one `change`. */
  clearable?: boolean;
  /** Parent item names that clear and reload this combo when they change. */
  dependsOn?: string[];
}

/** One action a `speeddial` menu shows. */
export type SpeedDialItem = {
  /** A stable id for the action. */
  id?: string;
  /** The action's icon — a glyph name from the icon registry (see {@link IconName}), an image URL, or a DOM node. */
  icon?: IconName | string | Node;
  /** The action's label; omitted for an icon-only action. */
  text?: string;
  /** Whether the action is shown but not activatable. */
  disabled?: boolean;
  /** A custom renderer replacing the icon and text, returning a DOM node or plain text. */
  render?: (item: SpeedDialItem, index: number) => unknown;
};

/** The `type: 'speeddial'` item options, and the standalone `createSpeedDial` options. */
export interface SpeedDialConfig {
  /** The actions the menu shows. */
  items?: SpeedDialItem[];
  /** The corner or edge the FAB anchors to: `top-left`, `top-center`, `top-right`, `middle-left`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`. Default `bottom-right`. */
  position?: FormSpeedDialPosition;
  /** Anchor the FAB to the viewport instead of its container. */
  fixed?: boolean;
  /** Open the menu on pointer hover and close it on leave. */
  openOnHover?: boolean;
  /** The way the strip opens: `up`, `down`, `left`, `right`, or `auto` (default — into the container's room side). */
  direction?: FormSpeedDialDirection;
  /** The menu shape: `linear` (default) or `radial`. */
  mode?: 'linear' | 'radial';
  /** The radial fan — its start and end angles (degrees, defaulting from `position`) and its radius `offset` in pixels. */
  radial?: { startAngle?: number; endAngle?: number; offset?: number };
  /** Paint a backdrop behind the open menu that swallows page clicks. */
  modal?: boolean;
  /** The FAB's closed-state icon (default `plus`). */
  openIcon?: IconName | string | Node;
  /** The FAB's open-state icon (default `close`). */
  closeIcon?: IconName | string | Node;
  /** An optional label on the FAB. */
  text?: string;
  /** The FAB's colour: `primary` (default), `secondary`, `outline`, `info`, `success`, `warning` or `danger`. */
  variant?: FormSpeedDialVariant;
  /** Start disabled. */
  disabled?: boolean;
}

/** The corner or edge a `speeddial` FAB anchors to. */
export type FormSpeedDialPosition = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/** The direction a `speeddial` strip opens in. */
export type FormSpeedDialDirection = 'up' | 'down' | 'left' | 'right' | 'auto';

/** The colour a `speeddial` FAB paints. */
export type FormSpeedDialVariant = 'primary' | 'secondary' | 'outline' | 'info' | 'success' | 'warning' | 'danger';

/**
 * The events a form raises, on `form.on()`.
 *
 * The form's own, not a grid's. `on()` warns once on any other name. The
 * cancellable `beforeChange` runs before a committed edit is stored, on the
 * same contract the grid core uses: call `preventDefault(reason?)` on the
 * payload, or return `false`; a veto reverts the control to its committed
 * value. The past-tense events — `change`, `input`, `click`, `focus` and
 * `blur` — report an edit already made and carry no `preventDefault`.
 */
export type FormEventName =
  /** An edit is about to be committed; cancellable. */
  | 'beforeChange'
  /** An edit was committed. */
  | 'change'
  /** The user typed (the value is live, not yet committed). */
  | 'input'
  /** A button was clicked. */
  | 'click'
  /** An item's control took focus. */
  | 'focus'
  /** An item's control lost focus. */
  | 'blur'
  /** One or more items were validated, with the failures. */
  | 'validated'
  /** Every box of an `otp` item is now filled. */
  | 'complete'
  /** A `color` item's custom-colours row gained a newly picked colour. */
  | 'customColorsChange'
  /** A `speeddial` FAB's menu opened. */
  | 'open'
  /** A `speeddial` FAB's menu closed. */
  | 'close'
  /** A `speeddial` menu action was activated, or a `listbox` row was clicked, selected row included. */
  | 'itemClick'
  /** A `listbox` row's Enter-key equivalent of a click. */
  | 'activate';

/** What a handler receives, per form event. */
export interface FormEventPayloads {
  /** The commit about to happen, with `preventDefault` to refuse it. */
  beforeChange: FormBeforeChangeEvent;
  /** The edit that was committed. */
  change: FormValueEvent;
  /** The live, uncommitted value. */
  input: FormValueEvent;
  /** The button click. */
  click: FormClickEvent;
  /** The item that took focus. */
  focus: FormFocusEvent;
  /** The item that lost focus. */
  blur: FormFocusEvent;
  /** A validation run, item or whole form, with its failures. */
  validated: FormValidatedEvent;
  /** Every box of an `otp` item is now filled. */
  complete: FormCompleteEvent;
  /** A `color` item's custom-colours row, extended. */
  customColorsChange: FormColorCustomColorsEvent;
  /** A `speeddial` FAB's menu opened. */
  open: FormSpeedDialOpenEvent;
  /** A `speeddial` FAB's menu closed. */
  close: FormSpeedDialCloseEvent;
  /** A `speeddial` menu action was activated, or a `listbox` row was clicked. */
  itemClick: FormSpeedDialItemClickEvent | FormListboxItemClickEvent;
  /** A `listbox` row was activated with Enter. */
  activate: FormListboxItemClickEvent;
}

/** The fields every form event carries. */
export interface FormEvent {
  /** Which event this is: one of the `FormEventName` names. */
  type: string;
  /** The item's name, or `null` for an unnamed item. */
  name: string | null;
  /** The item's config. */
  item: FormItemConfig;
}

/** A value event (`change`/`input`): the item and the value involved. */
export interface FormValueEvent extends FormEvent {
  /** The value being reported (or committed). */
  value: unknown;
  /** The previously committed value, on a `change` event. */
  previousValue?: unknown;
}

/** A `complete` payload: every box of an `otp` item is now filled. */
export interface FormCompleteEvent extends FormValueEvent {
}

/** A `customColorsChange` payload: a `color` item's custom-colours row gained a newly picked colour. */
export interface FormColorCustomColorsEvent extends FormEvent {
  /** The custom-colours list after the addition — newest first, deduplicated, at most ten entries. */
  colors: string[];
}

/** An `open` payload: a `speeddial` FAB's menu opened. */
export interface FormSpeedDialOpenEvent extends FormEvent {}

/** A `close` payload: a `speeddial` FAB's menu closed. */
export interface FormSpeedDialCloseEvent extends FormEvent {}

/** An `itemClick` payload: a `speeddial` menu action was activated. */
export interface FormSpeedDialItemClickEvent extends FormEvent {
  /** The action that was activated. */
  item: SpeedDialItem;
  /** The action's index in the `items` list. */
  index: number;
}

/** An `itemClick`/`activate` payload: a `listbox` row was clicked (selected row included) or activated with Enter. */
export interface FormListboxItemClickEvent extends FormEvent {
  /** The option exactly as given — the same object `render(opt)` receives. */
  option: unknown;
  /** The triggering event: a `MouseEvent` for `itemClick`, a `KeyboardEvent` for `activate`. */
  event: MouseEvent | KeyboardEvent;
}

/**
 * A `beforeChange` payload. A handler refuses the commit by calling
 * `preventDefault(reason?)` or returning `false` (or a Promise of either).
 */
export interface FormBeforeChangeEvent extends FormValueEvent {
  /** Who asked for the change: `user` for an edit, `api` for a programmatic commit. */
  origin: 'user' | 'api';
  /** True once any handler cancelled the commit. */
  readonly defaultPrevented: boolean;
  /** The reason given to `preventDefault`, or `null`. */
  readonly reason: string | null;
  /** Cancel the commit. */
  preventDefault(reason?: string): void;
}

/** A `click` event payload: a button holds no value. */
export interface FormClickEvent extends FormEvent {
  /** Always `null` — a button holds no value. */
  value: null;
}

/** A `focus`/`blur` event payload. */
export interface FormFocusEvent extends FormEvent {}

/** One failed item in a `validated` event's `failures` list. */
export interface FormValidationFailure {
  /** The item's name. */
  name: string | null;
  /** The rule that failed: `required`, a built-in name, `pattern` or `custom`. */
  rule: string;
  /** The failure message shown on the item. */
  message: string;
}

/**
 * A `validated` payload: the outcome of `form.validate()` or
 * `item.validate()`. `name`/`item` name the one item for an item run, or are
 * `null` when the whole form was validated; `failures` lists every invalid
 * item in document order.
 */
export interface FormValidatedEvent extends FormEvent {
  /** The value validated (an item run), or `undefined` for a whole-form run. */
  value: unknown;
  /** True when nothing failed. */
  valid: boolean;
  /** Every item that failed, in document order. */
  failures: FormValidationFailure[];
}

/** The item handle `getItem(name)` returns. */
export interface FormItem {
  /** The item's wrapper element. */
  readonly el: HTMLElement;
  /** The item's name, or `null` for an unnamed item. */
  readonly name: string | null;
  /**
   * The label's current rendered position: `labelPosition` normally, or
   * `top` when a `left` label with `controlMinWidth` has switched because
   * its own width left the control too narrow. Mirrors
   * the item's `data-label-effective` attribute.
   */
  readonly labelEffectivePosition: FormLabelPosition;
  /** The committed value. */
  getValue(): unknown;
  /** Write a committed value, silently (no event fires). */
  setValue(value: unknown): FormItem;
  /** Show a hidden item. */
  show(): FormItem;
  /** Hide the item. */
  hide(): FormItem;
  /** Whether the item is currently visible (not hidden). */
  isVisible(): boolean;
  /** Disable the item's control. */
  disable(): FormItem;
  /** Enable a disabled item. */
  enable(): FormItem;
  /** Focus the item's control. */
  focus(): FormItem;
  /** Blur the item's control. */
  blur(): FormItem;
  /** Validate this one item, paint its verdict and report it through `validated`. */
  validate(): boolean;
  /** A `container` item only: append an element, or a Lattice view's own element (`.el`, `.root` or `.element` — whichever it exposes), sized to the region (width 100%; height forced to the region's own configured height only when it set one). Replaces (and, unless kept, destroys) whatever was attached before; the attached view is destroyed by `form.destroy()` too, unless `keep: true`. */
  attach?(viewOrElement: Element | { el?: HTMLElement; root?: HTMLElement; element?: HTMLElement; destroy?(): void }, opts?: { keep?: boolean }): FormItem;
  /** A `container` item only: replace the region's content with sanitised host HTML, destroying whatever was attached before (unless it was kept). */
  attachHTML?(html: string): FormItem;
  /** A `container` item only: the attached view or element, or `null`. */
  getWidget?(): unknown;
  /** A `grid` item only: add a row (a blank one when none is given) through `beforeChange` and one `change`. Returns the new row's key, or `null` when it was refused. */
  addRow?(row?: object): string | null | Promise<string | null>;
  /** A `grid` item only: remove rows by key, each through `beforeChange` and one `change`. Returns the keys removed. */
  removeRows?(keys: string | string[]): string[];
  /** A `grid` item only: the embedded Lattice grid, or `null` when no `createGrid` was supplied. */
  getGrid?(): Grid | null;
  /** Replace a combo or select item's static options, re-rendering the list in place; a value still present is kept, one gone is cleared with one `change` event, and a changed label refreshes the shown value. */
  setOptions(options: unknown[]): FormItem;
  /** Reload a `load`-backed combo — clear its cache and fetch the first page again; on a static combo or select this only re-renders. */
  reload(): FormItem;
  /** The item's current label — a field's label, a button's caption, or a fieldset's legend — or `null` when it carries none. */
  getLabel(): string | null;
  /**
   * Change the item's visible label and its accessible name: a field's label, a button's caption, or (on a handle for a named fieldset) its legend; on a registered custom control, the frame's own label and the `label` the control's `item` object carries. A hidden label (`labelPosition: 'hidden'`) stays visually hidden but its accessible name still updates. The change survives `setDensity`, `setReadOnly`, `show()`/`hide()` and any re-render, and is what a later `getItem` reports.
   * @returns the item, for chaining.
   */
  setLabel(text: string): FormItem;
  /** Change the help line under the control; `null` removes it. Survives `setDensity`, `setReadOnly`, `show()`/`hide()` and any re-render, the same as `setLabel`. A thin wrapper over `set({ helpMessage: text })`. */
  setHelp(text: string | null): FormItem;
  /** A `listbox` item's options in their current order, exactly as given, independent of selection. */
  getOptions?(): unknown[];
  /** Insert one option into a `listbox` item, keeping selection and order consistent, and firing one `change`. Appended when `index` is omitted. */
  addOption?(opt: unknown, index?: number): FormItem;
  /** Remove a `listbox` item's option keyed by `value`, keeping selection and order consistent, and firing one `change`. */
  removeOption?(value: unknown): FormItem;
  /** Merge `patch` over a `listbox` item's option keyed by `value`, in place, keeping selection and order consistent, and firing one `change`. */
  updateOption?(value: unknown, patch: Record<string, unknown>): FormItem;
  /** Show only the options of a `listbox` item that `fn` accepts, without touching its canonical order, selection or value; `null` clears the predicate. */
  filter?(fn: ((opt: unknown) => boolean) | null): FormItem;
  /** A `listbox` item only: drop every cached row height and lay the list out again from live measurements, keeping scroll position and selection. The first paint already measures and corrects itself once the form's root is attached; call this when a host changes the item's `render()` or its CSS after build. */
  remeasure?(): FormItem;
  /**
   * Apply a subset of the item's own config after build — see {@link FormItemLiveProps} for the props every item shares and which a control additionally documents as live. Re-renders only what changed; the control's own value is never touched, so a `min`/`max`/`options` change that makes the current value invalid is left for the next {@link FormItem#validate} to report. Keeps focus and the caret throughout. An unknown or non-live prop warns once (developer console) and is ignored.
   * @returns the item, for chaining.
   */
  set(props: FormItemLiveProps): FormItem;
  /** The effective value of one prop {@link FormItem#set} accepts, read from the item's own config rather than re-derived from the DOM. An unknown prop warns once and returns `undefined`. */
  get(prop: string): unknown;
  /** The item's current placeholder, or `null` when it carries none — a shortcut for `get('placeholder')`. */
  getPlaceholder(): string | null;
  /**
   * Change the item's placeholder live — a shortcut for `set({ placeholder: text })`.
   * @returns the item, for chaining.
   */
  setPlaceholder(text: string | null): FormItem;
}

/**
 * The props {@link FormItem#set} may change after build.
 * Every item shares `label`, `labelPosition`, `labelWidth`, `helpMessage`,
 * `required`, `readOnly`, `disabled`, `hidden`, `width`, `validation`,
 * `errorMessage` and `css`. `placeholder` is live on `input`, `textarea`,
 * `number`, `select`, `combo` and `datepicker`; `options` on `select` and
 * `combo` (the same contract as `setOptions`); `min`/`max`/`step`/`format`
 * on `number` and `slider`; `tick`/`majorTick` are additionally live on
 * `slider`; `disabledDates` on `datepicker` and `daterange` (the open
 * calendar's days are redrawn and a held value the new rule disables is
 * reported by validation). Any other key is a control's own documented
 * live option (`item.props` at build); one that is neither common nor
 * declared live warns once and is ignored.
 */
export interface FormItemLiveProps {
  /** The item's visible label and accessible name. */
  label?: string;
  /** Where the label sits: above, to the left, or visually hidden. */
  labelPosition?: 'top' | 'left' | 'hidden';
  /** The label column's width, in a `labelPosition: 'left'` item. */
  labelWidth?: number | string;
  /** The help line under the control; `null` removes it. */
  helpMessage?: string | null;
  /** Whether the item must hold a value to pass `validate()`. */
  required?: boolean;
  /** Whether the item is read-only (focusable, but not editable). */
  readOnly?: boolean;
  /** Whether the item is disabled (out of the tab order, excluded from validation). */
  disabled?: boolean;
  /** Whether the item is hidden, giving its space to its neighbours. */
  hidden?: boolean;
  /** The item's width (a px number or a CSS length). */
  width?: number | string;
  /** The placeholder shown while the control is empty. */
  placeholder?: string | null;
  /** A `number` field's lower bound. */
  min?: number;
  /** A `number` field's upper bound. */
  max?: number;
  /** A `number` field's step. */
  step?: number;
  /** A `number` field's `NumberFormat` spec. */
  format?: unknown;
  /** A `select`/`combo` item's static options, the same as `setOptions`. */
  options?: unknown[];
  /** A `datepicker` or `daterange` item's disabled dates. */
  disabledDates?: unknown;
  /** The item's validation rule. */
  validation?: FormItemConfig['validation'];
  /** The message shown when `validation` fails. */
  errorMessage?: string;
  /** Extra inline CSS, merged onto the item's wrapper. */
  css?: string | Record<string, string>;
  /** Any other control-specific option the control itself documents as live. */
  [prop: string]: unknown;
}

/** The form instance {@link createForm} returns. */
export interface Form {
  /** The host element. */
  readonly el: HTMLElement | null;
  /** The normalised config. */
  readonly config: FormConfig;
  /** The item handle for a name, or `undefined` when no item has that name. */
  getItem(name: string): FormItem | undefined;
  /** Snapshot every named, value-holding item as `{ name: value }`. */
  getValue(): Record<string, unknown>;
  /** Write values into the matching named items, silently. */
  setValue(values: Record<string, unknown>): Form;
  /** Reset every user-editable item to its empty value. */
  clear(): Form;
  /** Validate every rule-bearing item, paint each verdict and report all failures through `validated`. */
  validate(): boolean;
  /** Walk every item in document order, handing each handle to `fn`. */
  forEach(fn: (item: FormItem) => void): void;
  /** Subscribe to a form event or to `'*'` for every past-tense event; returns an unsubscribe. */
  on(name: FormEventName | '*', fn: (event: FormEventPayloads[FormEventName]) => void): () => void;
  /** Remove a handler registered with {@link Form#on}. */
  off(name: FormEventName | '*', fn: (event: FormEventPayloads[FormEventName]) => void): void;
  /** Change the form's density live, re-theming control heights without a re-render. */
  setDensity(density: FormDensity): Form;
  /** Change the vertical gap between items live — a px number or a CSS length — re-theming every stacked container with one property write and no re-render. `null` removes the override so the gap returns to the density default. */
  setSpacing(spacing: number | string | null): Form;
  /** Set every item read-only (or back to editable) in one call. A read-only item stays focusable, selectable and validated. */
  setReadOnly(readOnly: boolean): Form;
  /** Set every item disabled (or back to enabled) in one call. A disabled item leaves the tab order and is excluded from validation. */
  setDisabled(disabled: boolean): Form;
  /** Whether an item (or, with no name, the whole form) holds an unsaved user edit. */
  isDirty(name?: string): boolean;
  /** Whether an item (or the whole form) has an unsaved edit an external change also touched. */
  isConflicted(name?: string): boolean;
  /** Save the dirty items through the binding; true when saved (or nothing to save). */
  save(): boolean | Promise<boolean>;
  /** Restore every dirty item to its bound/committed value and clear the dirty flags. */
  revert(): Form;
  /** The wizard's normalised steps, or an empty array when the form is not a wizard. */
  readonly steps: FormStep[];
  /** The index of the active step (0-based), or 0 when the form is not a wizard. */
  readonly activeStep: number;
  /** Advance one step, validating the current step's items first. */
  next(): Promise<boolean>;
  /** Go back one step — always allowed, never validated. */
  back(): Promise<boolean>;
  /** Move to a step by index, validating the steps passed over on the way forward. */
  goToStep(index: number): Promise<boolean>;
  /** Empty the element and drop every item record, listener and handler. */
  destroy(): void;
}

/** The group's events — the two names its `on()` accepts. */
export type FormGroupEventName =
  /** A member form committed an edit. */
  | 'change'
  /** A member form was validated. */
  | 'validated';

/** What a handler receives, per group event. */
export interface FormGroupEventPayloads {
  /** The edit a member form committed. */
  change: FormGroupChangeEvent;
  /** A member form's validation verdict. */
  validated: FormGroupValidatedEvent;
}

/** The fields every form-group event carries. */
export interface FormGroupEvent {
  /** Which event this is: one of the `FormGroupEventName` names. */
  type: string;
  /** The member form the event came from. */
  form: Form;
}

/** A group `change` payload: the member form and the item/value it committed. */
export interface FormGroupChangeEvent extends FormGroupEvent {
  /** The item's name. */
  name: string | null;
  /** The value being reported. */
  value: unknown;
}

/** A group `validated` payload: the member form and its verdict. */
export interface FormGroupValidatedEvent extends FormGroupEvent {
  /** True when nothing failed. */
  valid: boolean;
}

/**
 * The value transform a group applies on read and write. `get` receives the
 * merged member values and returns what `getValue()` returns; `set` receives
 * whatever `setValue()` was handed and does the routing itself.
 */
export interface FormGroupTransform {
  /** Shape the merged values into the group's output. */
  get(values: Record<string, unknown>): unknown;
  /** Route the written values into the members. */
  set(values: unknown): void;
}

/** The options `createFormGroup` takes. */
export interface FormGroupOptions {
  /** Join or split values on read and write. */
  transform?: FormGroupTransform;
  /** Bind the whole group to one data-router record: every member fills with its own fields, and `save()` writes ONE router update and calls `onSave` once. */
  bind?: FormBind;
}

/** The form group instance {@link createFormGroup} returns. */
export interface FormGroup {
  /** The member forms, in add order. */
  readonly forms: Form[];
  /** Add a form; `id` names the member for a pinned cross-form rule and router binding. */
  add(form: Form, opts?: { id?: unknown }): FormGroup;
  /** Remove a form; the group ignores a form that is not a member. */
  remove(form: Form): FormGroup;
  /** Merge every member's values in add order, through `transform.get` when set. */
  getValue(): unknown;
  /** Route each key to the member that owns it, through `transform.set` when set. */
  setValue(values: Record<string, unknown>): FormGroup;
  /** The owning member's item handle for a name, or `undefined`. */
  getItem(name: string): FormItem | undefined;
  /** Validate every member and focus the first invalid field in add order. */
  validate(): boolean;
  /** Set every member read-only (or back to editable) in one call. */
  setReadOnly(readOnly: boolean): FormGroup;
  /** Set every member disabled (or back to enabled) in one call. */
  setDisabled(disabled: boolean): FormGroup;
  /** Clear every member to its empty values. */
  clear(): FormGroup;
  /** Restore every member's dirty items to their bound/committed value. */
  reset(): FormGroup;
  /** Save every member's dirty items as ONE router update and call the group's `bind.onSave` once; `false` when unbound, true when saved or nothing dirty. */
  save(): boolean | Promise<boolean>;
  /** Whether any member holds an unsaved user edit. */
  isDirty(): boolean;
  /** Subscribe to `change` or `validated` (or `'*'` for both); returns an unsubscribe. */
  on(name: FormGroupEventName | '*', fn: (event: FormGroupEventPayloads[FormGroupEventName]) => void): () => void;
  /** Remove a handler registered with {@link FormGroup#on}. */
  off(name: FormGroupEventName | '*', fn: (event: FormGroupEventPayloads[FormGroupEventName]) => void): void;
  /** Detach the group's listeners without destroying the forms. */
  destroy(): void;
}

/** The combo instance {@link createCombo} returns. */
export interface Combo {
  /** The host element. */
  readonly el: HTMLElement;
  /** The combo root element. */
  readonly root: HTMLElement;
  /** The search input (the combobox). */
  readonly input: HTMLInputElement;
  /** The committed value: a single value (or null), or an array when multi. */
  getValue(): unknown;
  /** Write a committed value silently (no event fires). */
  setValue(value: unknown): Combo;
  /** Reload page 0 for the current search, dropping the cache. */
  reload(): Combo;
  /** Clear the selection, firing `change`. */
  clear(): Combo;
  /** Open the popup. */
  open(): Combo;
  /** Close the popup. */
  close(): Combo;
  /** Focus the search input. */
  focus(): Combo;
  /** Blur the search input. */
  blur(): Combo;
  /** Enable or disable the control. */
  setDisabled(disabled: boolean): void;
  /** Mark the control read-only. */
  setReadOnly(readOnly: boolean): void;
  /** Tear the combo down: abort loads, clear timers, detach listeners. */
  destroy(): void;
}

/** The speed-dial instance {@link createSpeedDial} returns. */
export interface SpeedDial {
  /** The host element. */
  readonly el: HTMLElement;
  /** The FAB button. */
  readonly fab: HTMLButtonElement;
  /** The menu element. */
  readonly menu: HTMLElement;
  /** Open the menu. */
  open(): void;
  /** Close the menu and return focus to the FAB. */
  close(): void;
  /** Toggle the menu open/closed. */
  toggle(): void;
  /** Replace the action items and rebuild the menu. */
  setItems(items: SpeedDialItem[]): void;
  /** Tear the speed dial down: close, detach listeners and empty the host. */
  destroy(): void;
}

/** Register a custom control type: a first-class item with the
 * same wrapper, label, item API, events and density as a built-in. */
export function registerControl(type: string, definition: FormControlDefinition): void;

/** Create a form inside an element: named items laid out in nested rows and columns. */
export function createForm(el: HTMLElement, config?: FormConfig): Form;

/** Join several forms into one logical form that never renders anything. */
export function createFormGroup(forms?: Form | Form[], options?: FormGroupOptions): FormGroup;

/** Create a standalone searchable combobox inside an element. */
export function createCombo(el: HTMLElement, config?: ComboConfig): Combo;

/** Create a standalone themed select inside an element: the form's `type: 'select'` control, also the piece a kanban board takes as `form: { createSelect }`. */
export function createSelect(el: HTMLElement, opts?: SelectConfig): Select;

/** Create a standalone floating speed dial inside an element. */
export function createSpeedDial(el: HTMLElement, config?: SpeedDialConfig): SpeedDial;

/**
 * Enhance a server-rendered `<form>` in place: each named
 * field becomes a Lattice control that keeps its `name`, value, label and
 * validation, the form's own submit controls are preserved (so `hx-post`
 * still posts), and the submit path validates first. Idempotent — a form
 * already carrying `.__latticeForm` is returned as-is. With JavaScript off
 * this never runs and the plain form submits exactly as the server sent it.
 */
export function enhanceForm(formEl: HTMLElement, config?: FormConfig): Form | null;
export default createForm;
