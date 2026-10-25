/*!
 * Lattice Grid 1.114.0, sidebar module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/** An icon spec: a built-in name, an SVG string, a URL, an icon-font class list, or an object like `{ className }`. */
type SidebarIcon = string | { className?: string; svg?: string; url?: string; name?: string } | null | undefined;

/** One navigation node. `value` is read as `text`, `css` as `class`, and `data` as `nodes`. */
export type SidebarNode = {
  /** The node id, unique within the tree. */
  id?: string | number;
  /** The label shown on the row. */
  text?: string;
  /** Read as `text` when there is no `text`. */
  value?: string;
  /** An icon spec drawn before the label. */
  icon?: SidebarIcon;
  /** Hover tooltip (when tooltips are enabled). */
  tooltip?: string;
  /** A group header is a label, not a destination. */
  group?: boolean;
  /** Whether a branch starts open. */
  expanded?: boolean;
  /** Hidden nodes are not shown. */
  hidden?: boolean;
  /** Disabled nodes are shown but not activatable. */
  disabled?: boolean;
  /** Extra classes on the row. */
  class?: string;
  /** Read as `class`. */
  css?: string;
  /** A badge count; counts over 99 render as `99+`. */
  count?: number;
  /** The badge colour role (default `danger`). */
  countColor?: string;
  /** The row's accent colour. */
  color?: string;
  /** `separator` renders a divider row. */
  type?: string;
  /** Child nodes. */
  nodes?: SidebarNode[];
  /** Read as `nodes`. */
  data?: SidebarNode[];
  /** Any other property a host carries on the node. */
  [key: string]: unknown;
};

/** The options passed to `createSidebar`. */
export type SidebarConfig = {
  /** The node tree. Default `[]`. */
  nodes?: SidebarNode[];
  /** The node tree under its other name (an alias for `nodes`). */
  items?: SidebarNode[];
  /** The active node's id, the page the host is showing; painted with `aria-current="page"`. */
  active?: string | number | null;
  /** Called with `{ id, node, originalEvent }` when a leaf is activated, before it is selected. */
  onNavigate?: (payload: { id: string | number; node: SidebarNode; originalEvent?: unknown }) => void;
  /** Draw the filter box at the top of the sidebar. Default `false`. */
  search?: boolean;
  /** Draw the rail toggle button that collapses to icons only and back. Default `false`. */
  railToggle?: boolean;
  /** The accessible name of the navigation landmark; defaults to the translated `sidebar.nav`. */
  ariaLabel?: string;
  /** The host's message catalogue (anything with a `.t(key)`), for translating the sidebar's own chrome. */
  messages?: { t(key: string, params?: Record<string, unknown>): string };
  /** Icons-only rail; `collapsed` is accepted as another name for it. Default `false`. */
  flat?: boolean;
  /** Arrow-key navigation and Enter/Space to activate. Default `true`. */
  keyboard?: boolean;
  /** Hover delay in ms before a `mouseEnter` is reported. Default `500`. */
  hoverDelay?: number;
  /** Prefix for each row's DOM id. Default `'node_'`. */
  idPrefix?: string;
  /** Show a node's `tooltip` on hover. Default `true`. */
  tooltips?: boolean;
  /** A name carried for hosts that key state off it. Default `'sidebar'`. */
  name?: string;
  /** Extra classes on the rail. */
  css?: string;
  /** Any other option a host passes through. */
  [key: string]: unknown;
};

/** The node-store API at `sidebar.data` (a flat, id-keyed view of the tree). */
export type SidebarDataApi = {
  /** Replace every node; the selection stays when its id is still there. */
  parse(nodes: SidebarNode[]): SidebarDataApi;
  /** Add a node (or nodes) at an index among the root nodes, or a parent's children. */
  add(node: SidebarNode | SidebarNode[], index?: number): string | number | Array<string | number> | undefined;
  /** Merge a patch into a node. */
  update(id: string | number, patch: Partial<SidebarNode>): void;
  /** Remove one node, or an array of them. */
  remove(ids: string | number | Array<string | number>): void;
  /** Remove every node. */
  removeAll(): void;
  /** The live node, or undefined. */
  getItem(id: string | number): SidebarNode | undefined;
  /** Whether a node with this id exists. */
  exists(id: string | number): boolean;
  /** The position of a node among its siblings, or -1. */
  getIndex(id: string | number): number;
  /** The id of the root node at an index. */
  getId(index: number): string | number | undefined;
  /** How many root nodes there are. */
  getLength(): number;
  /** Call `fn` for each root node. */
  forEach(fn: (node: SidebarNode, index: number) => void): void;
  /** A copy of the nodes without the links the sidebar keeps. */
  serialize(): SidebarNode[];
};

/** A navigation tree, mounted inside an element. */
export class Sidebar {
  constructor(container: HTMLElement | string | null, options?: SidebarConfig);
  /** The node-store API. */
  data: SidebarDataApi;
  /** The selected node's id, or null. */
  readonly selected: string | number | null;
  /** The live node for an id, or null. Carries `.parent`. */
  get(id: string | number): SidebarNode | null;
  /** The row element for an id. */
  nodeElement(id: string | number): HTMLElement | null;
  /** Every ancestor id of a node, nearest first. */
  parentsOf(id: string | number): Array<string | number>;
  /** Select a node, revealing it by expanding its ancestors. */
  select(id: string | number): this;
  /** Clear the selection. */
  unselect(): this;
  /** Mark a node the page the host is showing (`aria-current="page"`) and select it. */
  setActive(id: string | number | null): this;
  expand(id: string | number): this;
  collapse(id: string | number): this;
  toggle(id: string | number): this;
  expandAll(): this;
  collapseAll(): this;
  /** The ids of every open branch. */
  expandedIds(): Array<string | number>;
  show(id: string | number): this;
  hide(id: string | number): this;
  /** Filter the tree by text; an empty term restores it. Returns the number of matches. */
  filter(term: string, restore?: Array<string | number> | null): number;
  add(parentId: string | number | SidebarNode[] | null, nodes?: SidebarNode[]): this;
  insert(parentId: string | number | null, before: string | number | null, nodes: SidebarNode[]): this;
  remove(...ids: Array<string | number>): this;
  /** Replace the whole tree. */
  setNodes(nodes: SidebarNode[]): this;
  /** Narrow to an icons-only rail, or back; omit `on` to toggle. Returns whether it is now flat. */
  goFlat(on?: boolean): boolean;
  /** Patch one node (by id), or merge options and re-render. */
  update(idOrOptions: string | number | object, patch?: Partial<SidebarNode>): this;
  /** Subscribe to an event; returns an unsubscribe function. */
  on(name: string, fn: (payload: unknown) => void): () => void;
  /** Remove an event handler. */
  off(name: string, fn: (payload: unknown) => void): void;
  /** Tear the sidebar down: remove DOM and listeners. The host still owns the element. */
  destroy(): void;
  /** Resolved once the sidebar is mounted and drawn. */
  ready: Promise<void>;
}

/** Create a sidebar inside an element. */
export function createSidebar(el: HTMLElement | string, config?: SidebarConfig): Sidebar & { ready: Promise<void> };
/** The English strings the sidebar uses when no locale catalogue supplies a message, keyed by message key. */
export const FALLBACK_EN: Readonly<Record<string, string>>;
export default createSidebar;
