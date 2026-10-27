/*!
 * Lattice Grid 1.114.3, tree module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/** A node's own data: any object. Its identity comes from `TreeModuleConfig.key`. */
type TreeNode = Record<string, unknown>;

/**
 * The configuration for {@link createTree}. Built on the grid's own tree
 * mode (one generated column, no header, no grid lines) rather than a
 * hierarchy of its own — `data`/`items`, `key`, `parentKey` and
 * `childrenField` describe the same two row shapes `GridConfig.tree`
 * reads from a plain grid.
 */
export interface TreeModuleConfig {
  /** Flat rows, each naming its parent by `parentKey` (or none, for a root). */
  data?: TreeNode[];
  /** Nested nodes, each with a `childrenField` array, instead of `data`. Takes priority over `data` when both are given. */
  items?: TreeNode[];
  /** The field holding a node's own identity. Default `'id'`. */
  key?: string;
  /** The field a flat row names its parent in. Default `'parentKey'`. */
  parentKey?: string;
  /** The array property nesting a node's children, for `items`. Default `'children'`. */
  childrenField?: string;
  /** The field a node's label comes from, when `template` is not given. Default `'label'`. */
  labelField?: string;
  /**
   * Draw a node's label yourself; wins over `labelField`. A string is HTML
   * sanitised by the shared sanitiser (`modules/shared/sanitise-html.js`):
   * script elements, `on*` attributes and `javascript:` URLs removed,
   * everything else — including an icon-font element's classes — kept. An
   * element is mounted as is.
   */
  template?: (node: TreeNode) => string | HTMLElement;
  /** An icon name per node, or none. */
  icon?: (node: TreeNode) => string | null | undefined;
  /**
   * An icon-font class (or classes) per node, drawn as an `<i>` in the icon
   * slot alongside the registered-SVG icon from `icon`. A string applies to
   * every node; a function reads it per node.
   */
  iconClass?: string | ((node: TreeNode) => string | null | undefined);
  /** The ids open at start. Default none — every other branch starts closed, however many children it already has. */
  open?: Array<string | number>;
  /** Selection mode. Default `false`. */
  selection?: false | 'single' | 'multi';
  /** Draw a tri-state checkbox per node, checked/unchecked/mixed rolled up from its children. Default `false`. */
  checkboxes?: boolean;
  /** The ids checked at start. Default none. */
  checked?: Array<string | number>;
  /** This tree's role in a drag: reorder and reparent within itself either way; the split is the host's own declaration of intent, since a standalone tree has nothing else to send to or receive from. Default `false`. */
  dragMode?: false | 'source' | 'target' | 'both';
  /**
   * Where a drag starts, once `dragMode` turns dragging on:
   * the drawn grip (`'grip'`, the default), anywhere on the row (`'row'`,
   * matching the list view's own `dragHandle` — a press on the expander or
   * the checkbox still expands or checks, since the drag only begins once
   * the pointer has moved), or `false` to draw no handle and start no drag
   * at all, whatever `dragMode` says.
   */
  dragHandle?: 'grip' | 'row' | false;
  /** Say that a node has children not yet in `data`/`items`, so it draws an expander before anything is fetched. */
  hasChildren?: (node: TreeNode) => boolean;
  /** Fetch a branch's children when it is first opened. Fetched once; a rejection leaves the branch unloaded. */
  loadChildren?: (node: TreeNode, signal: AbortSignal) => Promise<TreeNode[]>;
  /** Where a drop "inside" a node lands among its new children: `'last'` (the default, today's documented behaviour) or `'first'`. */
  insidePosition?: 'last' | 'first';
  /**
   * The grid's own cell right-click menu (Paste, Clear, Fill down). Default
   * `false` — a right-click on a node is `itemContextMenu`, not a menu meant
   * for spreadsheet cells.
   */
  contextMenu?: boolean;
}

/** `tree.data`: add, remove, change and read nodes, and read the hierarchy back out. */
export interface TreeDataApi {
  /** Add a node. `parentId` omitted (or null) makes it a root; `index` omitted appends among its new siblings. */
  add(item: TreeNode, parentId?: unknown, index?: number): void;
  /** Remove a node and its whole subtree. */
  remove(id: unknown): void;
  /** Shallow-merge `changes` into a node's own fields, leaving its place in the hierarchy alone. */
  update(id: unknown, changes: Partial<TreeNode>): void;
  /** A node's own data, or null when not found. */
  getItem(id: unknown): TreeNode | null;
  /** A node's parent id, or null for a root. */
  getParentId(id: unknown): string | null;
  /** A node's direct children's ids; the roots when `id` is omitted. */
  getChildren(id?: unknown): string[];
  /** The whole tree (or, with `id`, one subtree), nested under `childrenField`. */
  serialize(id?: unknown): TreeNode[];
}

/** The payload `itemClick`, `itemDoubleClick`, `expand` and `collapse` all carry. */
export interface TreeItemEvent {
  /** The node's id. */
  id: string;
}

/** The `check` payload: a node's own checkbox was explicitly set, independently of what its rolled-up state then reads as. */
export interface TreeCheckEvent {
  /** The node's id. */
  id: string;
  /** The state it was set to. */
  checked: boolean;
}

/** The `selectionChange` payload. */
export interface TreeSelectionChangeEvent {
  /** The selected ids. Always an array, regardless of `TreeModuleConfig.selection` mode. */
  ids: string[];
}

/**
 * The cancellable `beforeDrop` payload: a node is about to be dropped
 * before, after or inside another. Call `preventDefault(reason?)` (or
 * return `false`) to veto, leaving the node exactly where it was.
 */
export interface TreeBeforeDropEvent {
  /** The id of the node being dropped. */
  id: string;
  /** The parent id the node will have after the drop. */
  parent: unknown;
  /** The node's final 0-based position among its new siblings — not a physical row index. */
  index: number;
  /** Which band of the target node the drop landed in. */
  position: 'before' | 'after' | 'inside';
  /** The id of the node the drag was dropped onto. */
  target: string;
  /** Veto the drop, with an optional reason. */
  preventDefault(reason?: string): void;
}

/** The `afterDrop` payload: a drop that was not vetoed has committed. */
export interface TreeAfterDropEvent {
  /** The id of the node that was dropped. */
  id: string;
  /** The parent id the node now has. */
  parent: unknown;
  /** The node's final 0-based position among its new siblings — not a physical row index. */
  index: number;
  /** Which band of the target node the drop landed in. */
  position: 'before' | 'after' | 'inside';
  /** The id of the node the drag was dropped onto. */
  target: string;
}

/** The `itemContextMenu` payload: a right-click on a node (and the context-menu key on a focused one). */
export interface TreeItemContextMenuEvent {
  /** The node's id. */
  id: string;
  /** The node's own data, or null. */
  node: TreeNode | null;
  /**
   * The originating DOM event, when the right-click came from the pointer
   * (absent from the keyboard route). Call `preventDefault()` on it to
   * suppress the browser's own menu; left alone otherwise.
   */
  event: Event | undefined;
}

/** The event names a tree emits through `tree.on`. */
export type TreeEventName =
  | 'itemClick' | 'itemDoubleClick' | 'expand' | 'collapse' | 'selectionChange'
  | 'check' | 'beforeDrop' | 'afterDrop' | 'itemContextMenu';

/** The payload each tree event name carries. */
export interface TreeEventPayloads {
  /** A node was clicked. */
  itemClick: TreeItemEvent;
  /** A node was double-clicked. */
  itemDoubleClick: TreeItemEvent;
  /** A node was opened. */
  expand: TreeItemEvent;
  /** A node was closed. */
  collapse: TreeItemEvent;
  /** The selection changed. */
  selectionChange: TreeSelectionChangeEvent;
  /** A checkbox was explicitly checked or unchecked. */
  check: TreeCheckEvent;
  /** A drop is about to land; veto it with `preventDefault(reason?)`. */
  beforeDrop: TreeBeforeDropEvent;
  /** A drop committed. */
  afterDrop: TreeAfterDropEvent;
  /** A node was right-clicked, or its context-menu key pressed while focused. */
  itemContextMenu: TreeItemContextMenuEvent;
}

/** The tree instance {@link createTree} returns. */
export interface Tree {
  /** The grid the tree is built on, for anything this API does not cover. */
  grid: unknown;
  /** The Data API. */
  data: TreeDataApi;
  /** Open a node. */
  expand(id: unknown): void;
  /** Close a node. */
  collapse(id: unknown): void;
  /** Open every node. */
  expandAll(): void;
  /** Close every node. */
  collapseAll(): void;
  /** Open a closed node, or close an open one. */
  toggle(id: unknown): void;
  /** Select a node (or, under `selection: 'multi'`, add it to the selection). */
  select(id: unknown): void;
  /** The selected ids. */
  getSelected(): string[];
  /** Check a node, and by the usual tree-checkbox convention every node under it. */
  check(id: unknown): void;
  /** Uncheck a node and every node under it. */
  uncheck(id: unknown): void;
  /** The ids whose rolled-up state is fully checked — never a mixed branch. */
  getChecked(): string[];
  /** Move keyboard focus to a node. */
  focusItem(id: unknown): void;
  /** Subscribe to a tree event; returns an unsubscribe function. */
  on<K extends TreeEventName>(name: K, fn: (payload: TreeEventPayloads[K]) => void): () => void;
  /** Tear the tree down: destroy the inner grid, release every listener. The host still owns the element. */
  destroy(): void;
}

/**
 * Create a standalone tree — expand, select, checkboxes and drag to
 * reparent — over a real Lattice grid.
 */
export function createTree(el: HTMLElement, config?: TreeModuleConfig): Tree;
export default createTree;
