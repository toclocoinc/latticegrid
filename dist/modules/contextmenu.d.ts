/*!
 * Lattice Grid 1.109.0, contextmenu module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/** An icon spec: a built-in name, an SVG string, a URL, an icon-font class list, or an object like `{ className }`. */
type ContextMenuIcon = string | { className?: string; svg?: string; url?: string; name?: string } | null | undefined;

/** One context-menu entry. */
export type ContextMenuItem = {
  /** The label. */
  name?: string;
  /** An icon drawn before the label. */
  icon?: ContextMenuIcon;
  /** A shortcut hint shown on the right. */
  shortcut?: string;
  /** Disabled entries are shown but not invokable. */
  disabled?: boolean;
  /** A checkable entry's state; presence makes it a checkbox item. */
  checked?: boolean;
  /** A nested submenu (also read as `children`). */
  subMenu?: Array<ContextMenuItem | string | ((ctx: unknown) => ContextMenuItem | string | false | null | undefined)>;
  /** Alias for `subMenu`. */
  children?: Array<ContextMenuItem | string | ((ctx: unknown) => ContextMenuItem | string | false | null | undefined)>;
  /** Runs when the entry is invoked, with the context and (for swatches) the chosen colour. */
  action?: (ctx: unknown, colour?: string) => void;
  /** Marks a separator entry. */
  separator?: boolean;
  /** Extra classes on the entry. */
  cssClass?: string;
  /** A colour-swatch row; invoking one runs `action` with that colour. */
  swatches?: string[];
  /** The selected swatch colour. */
  selected?: string;
};

/** The options passed to `ContextMenu.show`. */
export type ContextMenuShowOptions = {
  /** The entries, in order; functions are resolved against `ctx`, strings become named entries. */
  items: Array<ContextMenuItem | string | ((ctx: unknown) => ContextMenuItem | string | false | null | undefined)>;
  /** The point to open at (fixed to the viewport when the host is the body). */
  x?: number;
  /** The point to open at. */
  y?: number;
  /** An element to anchor to instead of a point. */
  anchor?: HTMLElement;
  /** Placement relative to the anchor. Default `'below'`. */
  placement?: 'below' | 'right';
  /** The element to focus when the menu closes. */
  returnFocus?: HTMLElement | null;
  /** The element that opened the menu; presses on it are left alone so it can toggle the menu shut. */
  trigger?: HTMLElement | null;
  /** Extra context merged over the constructor's. */
  ctx?: Record<string, unknown>;
};

/** The options passed to `createContextMenu` and `openContextMenu`. */
export type ContextMenuConfig = {
  /** The entries; when given to `createContextMenu` they are the default for a later `show()`. */
  items?: Array<ContextMenuItem | string | ((ctx: unknown) => ContextMenuItem | string | false | null | undefined)>;
  /** The context passed to item actions and functions. */
  ctx?: Record<string, unknown>;
  /** Called when the menu closes. */
  onClose?: (() => void) | null;
  /** The parent menu, for a submenu. */
  parent?: ContextMenu | null;
  /** The element the menu is appended to (default the document body). */
  host?: HTMLElement | null;
  /** The element to focus when the menu closes. */
  returnFocus?: HTMLElement | null;
  /** The element that opened the menu; presses on it are left alone so it can toggle the menu shut. */
  trigger?: HTMLElement | null;
  /** The document to render into (default the host's own document). */
  document?: Document;
};

/** A keyboard-accessible popup menu, opened at a point or anchored to an element. */
export class ContextMenu {
  constructor(opts?: ContextMenuConfig & { host?: HTMLElement });
  /** Builds and opens the menu. Returns the menu root element. */
  show(opts: ContextMenuShowOptions): HTMLElement;
  /** Closes this menu and any open submenu. */
  hide(): void;
  /** Closes the whole menu tree from any level. */
  hideAll(): void;
  /** Hides and releases the menu. */
  destroy(): void;
}

/** Resolve a raw item list against a context: functions are called, strings become named entries, submenus recurse. */
export function resolveMenuItems(items: unknown, ctx: unknown): ContextMenuItem[];

/** Create a context menu; `show({ x, y })` opens it (at a point, or with `anchor`/`placement`) and `hide()` closes it. */
export function createContextMenu(el: HTMLElement | string, config?: ContextMenuConfig): ContextMenu & { ready: Promise<void> };
/** Create a context menu declared with its items: `createContextMenu({ items, ... })`. */
export function createContextMenu(config: ContextMenuConfig): ContextMenu & { ready: Promise<void> };

/** Open a context menu anchored to an event, a `{ clientX, clientY }` point, or an element, kept inside the viewport. */
export function openContextMenu(trigger: Event | { clientX?: number; clientY?: number; x?: number; y?: number } | HTMLElement, config?: ContextMenuConfig): ContextMenu;
export default createContextMenu;
