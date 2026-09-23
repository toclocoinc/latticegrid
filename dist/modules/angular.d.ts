/*!
 * Lattice Grid 1.71.0, angular module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  createGrid,
} from '../lattice-grid.js';

/**
 * Build the Angular standalone component and directive from one shared
 * controller.
 *
 * The Angular core namespace and `createGrid` are passed in, for the same
 * reason as every other adapter: the package ships no dependencies and cannot
 * import `@angular/core` or the grid. Pass `@angular/common`'s
 * `isPlatformBrowser` too for an explicit SSR guard; without it the adapter
 * guards on the presence of a `document`.
 *
 * The returned `LatticeGridComponent` (`<lattice-grid [config]="…">`) and
 * `LatticeGridDirective` (`<div [latticeGrid]="…">`) each expose the live grid
 * through a `grid` getter — the same `Grid` the vanilla `createGrid` returns,
 * or null before build — at parity with React's `ref.current.grid`. Grid
 * events are `@Output`s aliased to their dashed names (`(cell-changed)`).
 */
export function createLatticeGrid(
  deps: { ng: unknown; createGrid: unknown; isPlatformBrowser?: (id: unknown) => boolean },
): { LatticeGridComponent: unknown; LatticeGridDirective: unknown };
export const EVENT_NAMES: readonly string[];
export function dashedName(event: string): string;
export default createLatticeGrid;
