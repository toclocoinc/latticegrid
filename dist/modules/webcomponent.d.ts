/*!
 * Lattice Grid 1.62.1, webcomponent module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
  GridConfig,
  createCurrencyType,
  createStat,
  createUnitType,
  registerUnitSystem,
} from '../lattice-grid.js';

/**
 * Register `<lattice-grid>`.
 *
 * This module carries the grid inside it. Use it *or* `createGrid` in one
 * page, never both: two copies keep separate registries, and a renderer
 * registered through one will not appear in the other.
 *
 * The live grid is reached through the element's `grid` getter: `el.grid` is
 * the same `Grid` the vanilla `createGrid` returns, or null while the element
 * is disconnected.
 */
export function defineLatticeGrid(tag?: string): void;
/**
 * Build the `<lattice-grid>` element class. The one argument is the grid
 * factory the element creates its grid with — `createGrid`-shaped, and
 * defaulting to it — injectable for tests. Returns the class, or `null`
 * where `HTMLElement` is undefined (a Node import, a server-side pass).
 */
export function createLatticeGridElement(
  factory?: (element: Element, config: GridConfig) => Grid,
): typeof HTMLElement | null;
export const TAG_NAME: string;
export const EVENT_PREFIX: string;
export const ATTRIBUTE_CONFIG: Readonly<Record<string, unknown>>;
export function observedAttributeNames(): string[];
export function domEventName(event: string): string;
export class GridElementController {}
// Core factories re-exported from this module so they bind to the one engine
// the element already carries: a type built with these here shares the
// element's registry rather than a second copy's (BACKLOG-0000787). Typed by
// reference to the base package.
export { createCurrencyType, createUnitType, registerUnitSystem, createStat } from '../lattice-grid.js';
export default defineLatticeGrid;
