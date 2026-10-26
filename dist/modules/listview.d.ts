/*!
 * Lattice Grid 1.114.2, listview module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  createGrid,
} from '../lattice-grid.js';

/** An item backing one row: any object. Its identity comes from `ListViewConfig.key`. */
type ListViewItem = Record<string, unknown>;

/**
 * The configuration for {@link createList}. `createGrid` is the page's own
 * grid factory, injected so the list shares the page's one licensed core —
 * `createList` wraps it as a one-column, headerless, borderless grid, one
 * row per item, the cell drawn by `template`.
 */
export interface ListViewConfig {
  /** The grid factory the list mounts through (required). */
  createGrid: (el: HTMLElement, config: unknown) => unknown;
  /** The initial items. Default `[]`. */
  data?: ListViewItem[];
  /** The field each item's identity comes from. Default `'id'`. */
  key?: string;
  /** Called per item to draw its row; a returned string goes through the grid's own sanitiser (see `allowUnsafeTemplates`). */
  template: (item: ListViewItem) => string | HTMLElement;
  /**
   * Row height in pixels, or `'auto'` to size every row to its template:
   * multi-line content is shown in full (the grid's own auto row height,
   * measured at any list length), and a row whose item changes through
   * `list.data.update` is measured again. Default: the grid's row height.
   */
  itemHeight?: number | 'auto';
  /**
   * `true` lets an HTML-string `template` keep form controls: `input`,
   * `select` (with `option`), `textarea`, `button` and `label` elements and
   * their attributes. `script`, `iframe`, `object`, `embed`, `form` and
   * similar elements, event-handler attributes and `javascript:`, `data:` or
   * `vbscript:` URLs are still removed. Default `false`, where the grid's own
   * sanitiser also drops the controls. Typing into or clicking a control
   * reaches `list.on('input' | 'change')` with the item's id; a click on a
   * link, button, input, select, textarea or label does not also select the
   * row, unless the control or an ancestor carries `data-row-select`.
   */
  allowUnsafeTemplates?: boolean;
  /**
   * Where a drag starts. `'grip'` (default) is the drawn handle. `'row'`
   * starts it from anywhere on the row except a link, button, input, select,
   * textarea, label or an element marked `data-no-drag`; a double-click still
   * selects a word, and the grip is still drawn. `false` is the same
   * whole-row drag with no drawn grip at all, so the template fills the
   * full width. Applies to the lists that can start a drag (`dragMode`
   * `'source'` or `'both'`).
   */
  dragHandle?: 'grip' | 'row' | false;
  /** Class name(s) added to every row. */
  css?: string | string[];
  /** Selection mode. Default `false`. */
  selection?: false | 'single' | 'multi';
  /** This list's role in a cross-list drag. Default `false`. */
  dragMode?: false | 'source' | 'target' | 'both';
  /** `true` leaves the source row in place on a drop (copy, not move). Default `false`. */
  dragCopy?: boolean;
  /** The empty-state message or element; an empty string shows nothing at all. */
  emptyText?: string | HTMLElement;
  /**
   * The grid's own cell right-click menu (Paste, Clear, Fill down). Default
   * `false` — a right-click on a row is `itemContextMenu`, not a menu meant
   * for spreadsheet cells.
   */
  contextMenu?: boolean;
  /**
   * `true` draws the grid's own 1px frame round the list. Default `false`:
   * borderless.
   */
  bordered?: boolean;
  /**
   * Group the items under headings: a field name (a dotted
   * path is fine) or a function returning an item's group. Each group gets a
   * heading with its label and its count, the groups follow the view's sort,
   * filter and search (a group with no item left has no heading), and
   * `list.groups` folds them. A blank group value is headed with a dash.
   */
  groupBy?: string | ((item: ListViewItem) => unknown);
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
  groupHeading?: (group: ListViewGroupHeading) => string | Node | void;
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
  /**
   * Touch pull-to-refresh: pull the list down while it is
   * scrolled to the top and release past `threshold` to call `onRefresh`
   * once. Mouse and pen pointers are ignored. Off unless `enabled` is `true`;
   * change it later with `list.setPullToRefresh`.
   */
  pullToRefresh?: ListViewPullToRefresh;
}

/** The options of {@link ListViewConfig.pullToRefresh} and `list.setPullToRefresh`. */
export interface ListViewPullToRefresh {
  /** Whether the gesture is on. Default `false` in the config; an object passed to `list.setPullToRefresh` is on unless it says `false`. */
  enabled?: boolean;
  /** Called once per pull past the threshold; the indicator clears when the returned promise settles (resolved or rejected). */
  onRefresh: () => Promise<void> | void;
  /** Pull distance in pixels that counts as a refresh. Default `56`. */
  threshold?: number;
  /** Text shown in place of the catalogue's "Pull to refresh" / "Refreshing…". */
  label?: string;
}

/** What a group heading stands for; {@link ListViewConfig.groupHeading} is handed one. */
export interface ListViewGroupHeading {
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

/** `list.groups`: fold and unfold groups. A no-op on a list with no `groupBy`. */
export interface ListViewGroupsApi {
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
  /** The values of the groups on screen, in order. */
  values(): unknown[];
}

/**
 * `list.data`: the Data API. Every method runs through the inner grid's own
 * keyed-diff/sort/filter surface, so {@link serialize} never drifts from
 * what is on screen.
 */
export interface ListViewDataApi {
  /** Replace the whole dataset, keyed by `ListViewConfig.key`. */
  parse(items: ListViewItem[]): void;
  /** Insert an item at a display index (default: end). */
  add(item: ListViewItem, index?: number): void;
  /** Remove the item with this identity. */
  remove(id: unknown): void;
  /** Remove every item. */
  removeAll(): void;
  /** Shallow-merge `patch` into the item identified by `id`. */
  update(id: unknown, patch: Partial<ListViewItem>): void;
  /** The item stored under an identity, or undefined. */
  getItem(id: unknown): ListViewItem | undefined;
  /** The item's current display index, or -1 when not currently displayed. */
  getIndex(id: unknown): number;
  /** The total stored item count, filtered or not. */
  getLength(): number;
  /** Iterate the items, in current display order. */
  forEach(fn: (item: ListViewItem, index: number) => void): void;
  /** The items in current on-screen order. */
  serialize(): ListViewItem[];
  /** Hide items a predicate refuses, without removing them; call with no arguments to clear. */
  filter(fn?: (item: ListViewItem) => boolean): void;
  /** Change display order: a comparator, or a field name with `dir` (default `'asc'`). */
  sort(fnOrField?: ((a: ListViewItem, b: ListViewItem) => number) | string, dir?: 'asc' | 'desc'): void;
}

/** `list.selection`: the selection API, driven through the inner grid's own selection model. */
export interface ListViewSelectionApi {
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
export interface ListViewItemEvent {
  /** The clicked item's identity. */
  id: unknown;
  /** The clicked item, or null. */
  item: ListViewItem | null;
  /** The item's display index. */
  index: number;
  /** The originating DOM event. */
  originalEvent: unknown;
}

/** The cancellable `beforeDrop` payload: return `false` (or a Promise of it) to veto, leaving both lists unchanged. */
export interface ListViewBeforeDropEvent {
  /** The list or data view the dragged item(s) came from, or null when it did not come from one. */
  source: ListView | import('lattice-grid/modules/dataview').DataView | null;
  /** This list, the drop target. */
  target: ListView;
  /** The dragged item's identity (identities), as a one-element array. */
  ids: unknown[];
  /** The candidate display index of the drop. */
  index: number;
}

/** The `afterDrop` payload: a move or copy between two lists (or a reorder within one) committed. */
export interface ListViewAfterDropEvent {
  /** The list or data view the item(s) came from. */
  source: ListView | import('lattice-grid/modules/dataview').DataView | null;
  /** The list or data view the item(s) landed in. */
  target: ListView | import('lattice-grid/modules/dataview').DataView | null;
  /**
   * The moved/copied item's identity (identities), as a one-element array.
   * For a `dragCopy` drop crossing into another list or data view, this is
   * the copy's fresh identity, not the source's.
   */
  ids: unknown[];
  /** The index the item(s) landed at in the target. */
  index: number;
}

/**
 * The `dragOut` payload: the pointer left this list's own bounds during a
 * drag that started on one of its rows. Fires on that crossing alone,
 * whether or not a drop ends up landing anywhere — including a drop back
 * into this same list, or into another one — so a host using it to clear
 * a hint cannot rely on it to mean "the row left for good".
 */
export interface ListViewDragOutEvent {
  /** The dragged item's identity. */
  id: unknown;
  /** The item's display index before the drag. */
  index: number;
}

/** The `selectionChange` payload: always an array, regardless of `ListViewConfig.selection` mode. */
export interface ListViewSelectionChangeEvent {
  /** The selected ids. */
  ids: unknown[];
}

/** The `input`/`change` payload: an event bubbled from inside a row's template, carrying the item's identity. */
export interface ListViewTemplateEvent {
  /** The row's item identity. */
  id: unknown;
  /** The row's item, or null. */
  item: ListViewItem | null;
  /** The originating DOM event. */
  originalEvent: unknown;
}

/** The event names a list emits. */
export type ListViewEventName =
  | 'itemClick' | 'itemDoubleClick' | 'beforeDrop' | 'afterDrop' | 'dragOut'
  | 'selectionChange' | 'input' | 'change' | 'itemContextMenu';

/** The `itemContextMenu` payload: a right-click on a row (and the context-menu key on a focused one). */
export interface ListViewItemContextMenuEvent {
  /** The row's item identity. */
  id: unknown;
  /** The row's item, or null. */
  item: ListViewItem | null;
  /**
   * The originating DOM event, when the right-click came from the pointer
   * (absent from the keyboard route). Call `preventDefault()` on it to
   * suppress the browser's own menu; left alone otherwise.
   */
  event: Event | undefined;
}

/** The payload each list event name carries. */
export interface ListViewEventPayloads {
  /** A row was clicked. */
  itemClick: ListViewItemEvent;
  /** A row was double-clicked. */
  itemDoubleClick: ListViewItemEvent;
  /** A cross-list drop is about to land; return `false` (or a Promise of it) to veto it. */
  beforeDrop: ListViewBeforeDropEvent;
  /** A reorder, move or copy committed. */
  afterDrop: ListViewAfterDropEvent;
  /** A drag left this list without a cross-list drop landing. */
  dragOut: ListViewDragOutEvent;
  /** The selection changed. */
  selectionChange: ListViewSelectionChangeEvent;
  /** An `input` event bubbled from inside a row's template. */
  input: ListViewTemplateEvent;
  /** A `change` event bubbled from inside a row's template. */
  change: ListViewTemplateEvent;
  /** A row was right-clicked, or its context-menu key pressed while focused. */
  itemContextMenu: ListViewItemContextMenuEvent;
}

/** The list instance {@link createList} returns. */
export interface ListView {
  /** The Data API. */
  data: ListViewDataApi;
  /** The selection API. */
  selection: ListViewSelectionApi;
  /** Folding the groups of a list built with `groupBy`. */
  groups: ListViewGroupsApi;
  /** Subscribe to a list event; returns an unsubscribe function. */
  on<K extends ListViewEventName>(name: K, fn: (payload: ListViewEventPayloads[K]) => void): () => void;
  /** Remove an event handler registered with `on`. */
  off<K extends ListViewEventName>(name: K, fn: (payload: ListViewEventPayloads[K]) => void): void;
  /** Turn touch pull-to-refresh off (`false`), on with the options already given (`true`), or on with new options, without recreating the list. */
  setPullToRefresh(value: boolean | ListViewPullToRefresh): void;
  /** Tear the list down: destroy the inner grid, remove listeners, drop handlers. The host still owns the element. */
  destroy(): void;
}

/** Create a selectable, drag-and-drop-capable list over a real Lattice grid. */
export function createList(el: HTMLElement, config: ListViewConfig): ListView;
export default createList;
