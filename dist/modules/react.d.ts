/*!
 * Lattice Grid 1.62.1, react module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  createGrid,
} from '../lattice-grid.js';

/**
 * Build the React component.
 *
 * A factory rather than a component, because the adapter imports neither
 * React nor the grid: you pass both in. That is what keeps the package's
 * promise of no runtime dependencies, and what stops an adapter disagreeing
 * with the grid version already loaded.
 *
 * The live grid is reached through a forwarded ref: `ref.current.grid` is the
 * same `Grid` the vanilla `createGrid` returns, or null before mount.
 */
export function createLatticeGrid(deps: { React: unknown; createGrid: unknown }): unknown;
/** Every grid event, as the prop name a React caller writes. */
export const EVENT_NAMES: readonly string[];
export function handlerName(event: string): string;
export default createLatticeGrid;
