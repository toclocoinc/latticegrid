/*!
 * Lattice Grid 1.115.0, dataview module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/** An item backing one card: any object. Its identity comes from `DataViewConfig.key`. */
type DataViewItem = Record<string, unknown>;

/** A view an item can be dragged to or from: another data view, or a `listview` list. */
type DataViewPeer = DataView | import('lattice-grid/modules/listview').ListView;

/**
 * The configuration for {@link createDataView}: items laid out as cards that
 * wrap into rows, each card drawn by `template`. Cards are `itemWidth` wide
 * and as many as fit go on a row, or `columns` of them share the width.
 */
export interface DataViewConfig {
  /** The initial items. Default `[]`. */
  data?: DataViewItem[];
  /** The field each item's identity comes from. Default `'id'`. */
  key?: string;
  /** Called per item to draw its card; a returned string goes through the grid's template sanitiser, an element is used as is. */
  template: (item: DataViewItem) => string | HTMLElement;
  /** Card width in pixels; as many cards as fit go on a row. Default `200`. Ignored when `columns` is set. */
  itemWidth?: number;
  /**
   * Card height: a number of pixels, or a percentage string such as `'50%'`
   * of the view's own height, recomputed when the view resizes, or `'auto'`
   * to make each row as tall as its tallest card (nothing is clipped, and
   * the rows follow the content when it changes). Default `120`.
   */
  itemHeight?: number | `${number}%` | 'auto';
  /** A fixed number of cards per row; the cards share the width equally, so `columns: n` fills it. */
  columns?: number;
  /** The gap between cards, in pixels. Default `8`. */
  gap?: number;
  /** Class name(s) added to every card. */
  css?: string | string[];
  /** Selection mode. Default `false`. */
  selection?: false | 'single' | 'multi';
  /** This view's role in a drag: `'source'` and `'both'` reorder within the view and send to another; `'target'` and `'both'` receive. Default `false`. */
  dragMode?: false | 'source' | 'target' | 'both';
  /**
   * `true` leaves the source card in place on a drop between views (copy,
   * not move): the dropped copy gets a fresh identity, so copying the same
   * card twice lands two items, not one overwriting the other. Default `false`.
   */
  dragCopy?: boolean;
  /**
   * Called with the source item on a `dragCopy` drop to name the copy's
   * identity. Without it the source id is given a `-copy`/`-copy2`/...
   * suffix, counted up until it is not already used in the target.
   */
  copyId?: (item: DataViewItem) => unknown;
  /** The empty-state message or element; an empty string shows nothing at all. */
  emptyText?: string | HTMLElement;
  /**
   * Group the items under headings: a field name (a dotted
   * path is fine) or a function returning an item's group. Each group gets a
   * heading with its label and its count, the groups follow the view's sort,
   * filter and search (a group with no item left has no heading), and
   * `view.groups` folds them. A blank group value is headed with a dash.
   */
  groupBy?: string | ((item: DataViewItem) => unknown);
  /**
   * The order of the groups. `'asc'` (the default) and `'desc'` order them by
   * group value; an array lists group values to put first, in that order, the
   * rest following in ascending order.
   */
  groupOrder?: 'asc' | 'desc' | unknown[];
  /**
   * Draw a heading yourself. Return markup (sanitised), an element, or write
   * into `group.element` and return nothing. The default heading is the
   * group's label and its count.
   */
  groupHeading?: (group: DataViewGroupHeading) => string | Node | void;
  /**
   * Keep the heading of the group being scrolled through at the top of the
   * view until the next group's heading pushes it out. Default `true` when
   * `groupBy` is set.
   */
  stickyGroupHeadings?: boolean;
  /**
   * A click, or Enter or Space on a focused heading, folds its group down to
   * the heading; arrow keys then stop on headings too. Default `false`.
   */
  collapsibleGroups?: boolean;
  /** Start with every group folded (with `collapsibleGroups`). Default `false`. */
  groupsCollapsed?: boolean;
  /** Height of a group heading in pixels. Default 32. */
  groupHeadingHeight?: number;
}

/** What a group heading stands for; {@link DataViewConfig.groupHeading} is handed one. */
export interface DataViewGroupHeading {
  /** The group's value. */
  value: unknown;
  /** The text the default heading shows for it. */
  label: string;
  /** How many items are in the group, after any filter. */
  count: number;
  /** Whether the group is folded. */
  collapsed: boolean;
  /** Whether the group can be folded. */
  collapsible: boolean;
  /** The element being filled, for a renderer that writes into it. */
  element: HTMLElement;
}

/** `view.groups`: fold and unfold groups. A no-op on a view with no `groupBy`. */
export interface DataViewGroupsApi {
  /** Fold a group down to its heading. */
  collapse(value: unknown): void;
  /** Open a folded group. */
  expand(value: unknown): void;
  /** Fold an open group, open a folded one. */
  toggle(value: unknown): void;
  /** Fold every group. */
  collapseAll(): void;
  /** Open every group. */
  expandAll(): void;
  /** Whether a group is folded; `false` for a group that is not there. */
  isCollapsed(value: unknown): boolean;
  /** The values of the groups, in order. */
  values(): unknown[];
}

/** `view.data`: the list view's Data API, over the view's own items. `serialize()` is always the order on screen. */
export interface DataViewDataApi {
  /** Replace the whole dataset, keyed by `DataViewConfig.key`. */
  parse(items: DataViewItem[]): void;
  /** Insert an item at a display index (default: end). */
  add(item: DataViewItem, index?: number): void;
  /** Remove the item with this identity. */
  remove(id: unknown): void;
  /** Remove every item. */
  removeAll(): void;
  /** Shallow-merge `patch` into the item identified by `id`. */
  update(id: unknown, patch: Partial<DataViewItem>): void;
  /** The item stored under an identity, or undefined. */
  getItem(id: unknown): DataViewItem | undefined;
  /** The item's current display index, or -1 when not currently displayed. */
  getIndex(id: unknown): number;
  /** The total stored item count, filtered or not. */
  getLength(): number;
  /** Iterate the items, in current display order. */
  forEach(fn: (item: DataViewItem, index: number) => void): void;
  /** The items in current on-screen order. */
  serialize(): DataViewItem[];
  /** Hide items a predicate refuses, without removing them; call with no arguments to clear. */
  filter(fn?: (item: DataViewItem) => boolean): void;
  /** Change display order: a comparator, or a field name with `dir` (default `'asc'`). */
  sort(fnOrField?: ((a: DataViewItem, b: DataViewItem) => number) | string, dir?: 'asc' | 'desc'): void;
}

/** `view.selection`: the list view's selection API, over the view's own selection. */
export interface DataViewSelectionApi {
  /** Select one item, or several, alongside whatever is already selected. */
  add(id: unknown | unknown[]): void;
  /** Deselect one item, or several. */
  remove(id: unknown | unknown[]): void;
  /** In `'single'` mode: the selected id, or null. In `'multi'` mode: always an array. */
  getId(): unknown | unknown[] | null;
  /** Deselect everything. */
  clear(): void;
}

/** The payload `itemClick`/`itemDoubleClick` carry. */
export interface DataViewItemEvent {
  /** The clicked card's item identity. */
  id: unknown;
  /** The clicked item, or null. */
  item: DataViewItem | null;
  /** The card's display index. */
  index: number;
  /** The originating DOM event. */
  originalEvent: unknown;
}

/** The cancellable `beforeDrop` payload: return `false` (or a Promise of it) to veto, leaving both views unchanged. */
export interface DataViewBeforeDropEvent {
  /** The view the dragged card came from. */
  source: DataViewPeer | null;
  /** This view, the drop target. */
  target: DataViewPeer;
  /** The dragged item's identity, as a one-element array. */
  ids: unknown[];
  /** The display index the card would be inserted at. */
  index: number;
}

/** The `afterDrop` payload: a move or copy between two views, or a reorder within one, committed. */
export interface DataViewAfterDropEvent {
  /** The view the card came from. */
  source: DataViewPeer | null;
  /** The view the card landed in. */
  target: DataViewPeer | null;
  /**
   * The moved/copied item's identity, as a one-element array. For a
   * `dragCopy` drop this is the copy's fresh identity (`DataViewConfig.copyId`'s
   * return, or the generated `-copy`/`-copy2`/... id), not the source's.
   */
  ids: unknown[];
  /** The display index the card landed at in the target. */
  index: number;
}

/**
 * The cancellable `beforeDrag` payload: fires when a press on a card would
 * start a drag. Return `false` (or call `preventDefault()`) to stop that
 * card dragging — a palette heading or a blank card, say.
 */
export interface DataViewBeforeDragEvent {
  /** The card's item identity. */
  id: unknown;
  /** The card's item, or null. */
  item: DataViewItem | null;
}

/**
 * The `dragOut` payload: the pointer left this view's own bounds during a
 * drag that started on one of its cards. Fires on that crossing alone,
 * whether or not a drop ends up landing anywhere — including a drop back
 * into this same view, or into another one.
 */
export interface DataViewDragOutEvent {
  /** The dragged item's identity. */
  id: unknown;
  /** The card's display index before the drag. */
  index: number;
}

/** The `selectionChange` payload: always an array, whatever the selection mode. */
export interface DataViewSelectionChangeEvent {
  /** The selected ids. */
  ids: unknown[];
}

/** The `input`/`change` payload: an event bubbled from inside a card's template, carrying the item's identity. */
export interface DataViewTemplateEvent {
  /** The card's item identity. */
  id: unknown;
  /** The card's item, or null. */
  item: DataViewItem | null;
  /** The originating DOM event. */
  originalEvent: unknown;
}

/** The `itemContextMenu` and `itemMouseOver` payload: a right-click on a card, or the pointer entering one. */
export interface DataViewPointerEvent {
  /** The card's item identity (a generated key for an item that had none). */
  id: unknown;
  /** The card's item, or null. */
  item: DataViewItem | null;
  /** The originating DOM event. For `itemContextMenu`, call `preventDefault()` on it to suppress the browser's own menu. */
  event: Event;
}

/** The `afterAdd` payload: an item joined the view. */
export interface DataViewAfterAddEvent {
  /** The new item's identity (generated when the item had no value in the key field). */
  id: unknown;
  /** The item as stored. */
  item: DataViewItem;
}

/** The `afterRemove` payload: an item left the view. */
export interface DataViewAfterRemoveEvent {
  /** The removed item's identity. */
  id: unknown;
}

/**
 * The event names a data view emits: the list view's, plus its own
 * `beforeDrag`, `itemContextMenu`, `itemMouseOver`, `afterAdd` and `afterRemove`.
 */
export type DataViewEventName =
  | 'itemClick' | 'itemDoubleClick' | 'beforeDrag' | 'beforeDrop' | 'afterDrop' | 'dragOut'
  | 'selectionChange' | 'input' | 'change'
  | 'itemContextMenu' | 'itemMouseOver' | 'afterAdd' | 'afterRemove';

/** The payload each data view event name carries. */
export interface DataViewEventPayloads {
  /** A card was clicked. */
  itemClick: DataViewItemEvent;
  /** A card was double-clicked, or Enter was pressed on it. */
  itemDoubleClick: DataViewItemEvent;
  /** A press on a card would start a drag; return `false` (or call `preventDefault()`) to stop it. */
  beforeDrag: DataViewBeforeDragEvent;
  /** A drop between views is about to land; return `false` (or a Promise of it) to veto it. */
  beforeDrop: DataViewBeforeDropEvent;
  /** A reorder, move or copy committed. */
  afterDrop: DataViewAfterDropEvent;
  /** A drag moved out of this view. */
  dragOut: DataViewDragOutEvent;
  /** The selection changed. */
  selectionChange: DataViewSelectionChangeEvent;
  /** An `input` event bubbled from inside a card's template. */
  input: DataViewTemplateEvent;
  /** A `change` event bubbled from inside a card's template. */
  change: DataViewTemplateEvent;
  /** A card was right-clicked. */
  itemContextMenu: DataViewPointerEvent;
  /** The pointer entered a card. */
  itemMouseOver: DataViewPointerEvent;
  /** An item was added, through the data API or a drop. */
  afterAdd: DataViewAfterAddEvent;
  /** An item was removed, through the data API or a drop. */
  afterRemove: DataViewAfterRemoveEvent;
}

/** The instance {@link createDataView} returns. */
export interface DataView {
  /** The Data API. */
  data: DataViewDataApi;
  /** The selection API. */
  selection: DataViewSelectionApi;
  /** Folding the groups of a view built with `groupBy`. */
  groups: DataViewGroupsApi;
  /** Subscribe to a data view event; returns an unsubscribe function. */
  on<K extends DataViewEventName>(name: K, fn: (payload: DataViewEventPayloads[K]) => void): () => void;
  /** Remove an event handler registered with `on`. */
  off<K extends DataViewEventName>(name: K, fn: (payload: DataViewEventPayloads[K]) => void): void;
  /** Tear the view down: remove its DOM and listeners, drop handlers. The host still owns the element. */
  destroy(): void;
}

/** Create a selectable, drag-and-drop-capable card view: items wrap into rows of cards drawn by `template`. */
export function createDataView(el: HTMLElement, config: DataViewConfig): DataView;
export default createDataView;
