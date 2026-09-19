/*!
 * Lattice Grid 1.65.0, svelte module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  createGrid,
} from '../lattice-grid.js';

/**
 * A Svelte action: `use:lattice={config}`.
 *
 * The action owns nothing but the node the caller already has, so the grid is
 * reached one of two ways. Pass an `onGrid` callback in the action params: `use:lattice={{ ...config, onGrid: (g) => (grid = g) }}`
 * calls it once with the live `Grid` the moment it is built — synchronously,
 * before `ready` fires — and again if you hand the action a different
 * `onGrid`. Or read it off an event: every grid event carries the grid on its
 * `detail`, so `on:ready={(e) => e.detail.grid}` hands you the same `Grid` a
 * turn after construction. Use `onGrid` when you need the instance during the
 * first render.
 */
export function createLatticeAction(deps: { createGrid: unknown }): unknown;
export const EVENT_NAMES: readonly string[];
export function dashedName(event: string): string;
export default createLatticeAction;
