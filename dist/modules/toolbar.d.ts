/*!
 * Lattice Grid 1.115.1, toolbar module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/** An icon spec: a built-in name, an SVG string, a URL, an icon-font class list, or an object like `{ className }`. */
type ToolbarIcon = string | { className?: string; svg?: string; url?: string; name?: string } | null | undefined;

/** One toolbar item. Any other property is carried through and returned from `getItem` and `serialize`. */
export type ToolbarItem = {
  /** The item id, unique within the toolbar. */
  id?: string | number;
  /** The item type: button (default), selectButton, title, separator, spacer, input, customHTML. */
  type?: string;
  /** The label, or the value of an input/select. */
  value?: string;
  /** Read as the label when there is no `value`. */
  text?: string;
  /** HTML content for `customHTML`, titles and button text. */
  html?: string;
  /** An icon spec drawn on the control. */
  icon?: ToolbarIcon;
  /** Image button source. */
  src?: string;
  /** Hover tooltip (when tooltips are enabled). */
  tooltip?: string;
  /** Classes on the item. */
  css?: string;
  /** Hidden items are not shown. */
  hidden?: boolean;
  /** Disabled items are shown but not activatable. */
  disabled?: boolean;
  /** A badge count; counts over 99 render as `99+`. */
  count?: number;
  /** The badge colour role (default `danger`). */
  countColor?: string;
  /** Two-state toggle. */
  twoState?: boolean;
  /** The active state of a two-state button or group member. */
  active?: boolean;
  /** A group name; the active item is exclusive within a group. */
  group?: string;
  /** A dropdown (or the options of a `selectButton`). */
  items?: ToolbarItem[];
  /** The placeholder of an input item. */
  placeholder?: string;
  /** An input or custom-HTML item's width. */
  width?: number | string;
  /** `'never'` keeps the item out of the overflow menu. */
  overflow?: string;
  /** An input's accessible name. */
  label?: string;
  /** Parent id for `data.add`; carried, not stored on the item. */
  parent?: string | number;
  /** A bound view action this item drives when the toolbar is bound (see `Toolbar.bind`). */
  action?: ToolbarAction;
  /** Any other property a host carries through. */
  [key: string]: unknown;
};

/** A built-in view action a bound toolbar item can drive. */
export type ToolbarAction = 'export' | 'undo' | 'redo' | 'addRow' | 'removeRow' | 'expandAll' | 'collapseAll' | 'submit' | 'refresh';

/** The options passed to `createToolbar`. */
export type ToolbarConfig = {
  /** The items; `data` is accepted as another name for it. */
  items?: ToolbarItem[] | null;
  /** Bar height (number of pixels or any CSS length). */
  height?: number | string | null;
  /** Extra classes for the bar. */
  css?: string;
  /** `'menu'` (default) moves overflow into a "more" menu; `'scroll'` scrolls; `'none'` clips. */
  overflow?: 'menu' | 'scroll' | 'none';
  /** The overflow button's icon. Default `'ellipsis-vertical'`. */
  moreIcon?: ToolbarIcon;
  /** The overflow button's accessible name. Default `'More'`. */
  moreLabel?: string;
  /** Show item tooltips. Default `true`. */
  tooltips?: boolean;
  /** Tooltip delay in ms. Default `350`. */
  tooltipDelay?: number;
  /** Accessible name of the toolbar. */
  ariaLabel?: string;
  /** The host's message catalogue (anything with a `.t(key)`), for translating the toolbar's own chrome. */
  messages?: { t(key: string, params?: Record<string, unknown>): string };
  /** A grid, tree, list view or form whose actions the bound items drive. */
  bind?: object;
};

/** The item-store API at `toolbar.data`. */
export type ToolbarDataApi = {
  /** Replace every item. */
  parse(items: ToolbarItem[]): ToolbarDataApi;
  /** Add an item (or items) at an index, to the root or a parent's dropdown. */
  add(item: ToolbarItem | ToolbarItem[], index?: number): string | number | Array<string | number> | undefined;
  /** Merge a patch into an item; `items` replaces its dropdown. */
  update(id: string | number, patch: Partial<ToolbarItem>): void;
  /** Remove items (and their sub-items) by id. */
  remove(ids: string | number | Array<string | number>): void;
  /** Remove every item. */
  removeAll(): void;
  /** The live item, or undefined. */
  getItem(id: string | number): ToolbarItem | undefined;
  /** Whether an item with this id exists. */
  exists(id: string | number): boolean;
  /** The position of an item among its siblings, or -1. */
  getIndex(id: string | number): number;
  /** The id of the item at an index among the root items (or a parent's sub-items). */
  getId(index: number, parentId?: string | number): string | number | undefined;
  /** The live sub-items of a parent, or the root items. */
  getItems(parentId?: string | number): ToolbarItem[];
  /** The id of an item's parent, or undefined. */
  getParent(id: string | number): string | number | undefined;
  /** How many items a parent (or the root) holds. */
  getLength(parentId?: string | number): number;
  /** Call `fn` for each item of a parent (or the root). */
  forEach(fn: (item: ToolbarItem, index: number) => void, parentId?: string | number): void;
  /** Map a parent's (or the root's) items. */
  map<T>(fn: (item: ToolbarItem, index: number) => T, parentId?: string | number): T[];
  /** The first item (any depth) matching a predicate. */
  find(fn: (item: ToolbarItem) => boolean): ToolbarItem | undefined;
  /** A deep copy of the items, with sub-items under `items`. */
  serialize(): ToolbarItem[];
};

/** A data-driven toolbar mounted inside an element. */
export class Toolbar {
  constructor(container: HTMLElement | string | null, options?: ToolbarConfig);
  /** The item-store API. */
  data: ToolbarDataApi;
  show(ids?: string | number | Array<string | number>): this;
  hide(ids?: string | number | Array<string | number>): this;
  enable(ids?: string | number | Array<string | number>): this;
  disable(ids?: string | number | Array<string | number>): this;
  isDisabled(id: string | number): boolean | undefined;
  /** Mark an item active; in a group, the other members go inactive. */
  select(id: string | number): this;
  /** Mark an item inactive, or every item when no id is given. */
  unselect(id?: string | number): this;
  isSelected(id: string | number): boolean | undefined;
  /** The state of the stateful items (inputs, selects, two-state buttons, groups). */
  getState(id?: string | number): Record<string, unknown> | unknown;
  /** Set state in the shape `getState` returns. */
  setState(state: Record<string, unknown>): this;
  /** Focus an item's control. */
  setFocus(id: string | number): this;
  /** The element of a top-level item (its wrapper), or null. */
  itemElement(id: string | number): HTMLElement | null;
  /** Merge options and re-render. */
  update(partial?: Partial<ToolbarConfig>): this;
  /** Bind the toolbar to a view whose actions the `action` items drive (also the `bind` option). */
  bind(view: object): this;
  /** The bound view, or null when the toolbar is not bound. */
  readonly bound: object | null;
  /** Re-read every bound item's `disabled`/`active` from the view. */
  refresh(): this;
  /** Subscribe to an event; returns an unsubscribe function. */
  on(name: string, fn: (payload: unknown) => void): () => void;
  /** Remove an event handler. */
  off(name: string, fn: (payload: unknown) => void): void;
  /** Tear the toolbar down: remove DOM, listeners and any open menu. The host still owns the element. */
  destroy(): void;
  /** Resolved once the toolbar is mounted and drawn. */
  ready: Promise<void>;
}

/** Create a toolbar inside an element. */
export function createToolbar(el: HTMLElement | string, config?: ToolbarConfig): Toolbar & { ready: Promise<void> };
/** The English strings the toolbar uses when no locale catalogue supplies a message, keyed by message key. */
export const FALLBACK_EN: Readonly<Record<string, string>>;
export default createToolbar;
