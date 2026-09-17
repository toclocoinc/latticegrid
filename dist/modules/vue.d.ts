/*!
 * Lattice Grid 1.63.1, vue module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  createGrid,
} from '../lattice-grid.js';

/**
 * Build the Vue 3 component.
 *
 * The Vue runtime and `createGrid` are passed in, for the same reason as the
 * React adapter: the package ships no dependencies and cannot import either.
 * The dependency key is lowercase `vue` — `createLatticeGrid({ vue, createGrid })`.
 *
 * The live grid is reached through the component's exposed `grid()` method:
 * with `ref="grid"` on the element, `this.$refs.grid.grid()` returns the same
 * `Grid` the vanilla `createGrid` returns, or null before mount.
 */
export function createLatticeGrid(deps: { vue: unknown; createGrid: unknown }): unknown;
export const EVENT_NAMES: readonly string[];
export function dashedName(event: string): string;
export default createLatticeGrid;
