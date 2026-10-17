/*!
 * Lattice Grid 1.104.0, dataview module type declarations
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
  /** Card height in pixels. Default `120`. */
  itemHeight?: number;
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
  /** `true` leaves the source card in place on a drop between views (copy, not move). Default `false`. */
  dragCopy?: boolean;
  /** The empty-state message or element. */
  emptyText?: string | HTMLElement;
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
  /** The moved/copied item's identity, as a one-element array. */
  ids: unknown[];
  /** The display index the card landed at in the target. */
  index: number;
}

/** The `dragOut` payload: a drag moved out of this view. */
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

/** The event names a data view emits: the list view's. */
export type DataViewEventName =
  | 'itemClick' | 'itemDoubleClick' | 'beforeDrop' | 'afterDrop' | 'dragOut'
  | 'selectionChange' | 'input' | 'change';

/** The payload each data view event name carries. */
export interface DataViewEventPayloads {
  /** A card was clicked. */
  itemClick: DataViewItemEvent;
  /** A card was double-clicked, or Enter was pressed on it. */
  itemDoubleClick: DataViewItemEvent;
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
}

/** The instance {@link createDataView} returns. */
export interface DataView {
  /** The Data API. */
  data: DataViewDataApi;
  /** The selection API. */
  selection: DataViewSelectionApi;
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
