/*!
 * Lattice Grid 1.63.1, dhtmlx-compat module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * A dhtmlx Grid-shaped API over Lattice, for migrating a piece at a time.
 *
 * The module shares the page's one core rather than bundling its own: the
 * grid it builds comes from the `lattice-grid` package the app already loads
 * (or the `LatticeGrid` global a script tag publishes), so a licence set on
 * that core applies to these grids too. Load the core alongside this module —
 * a bundler wires the peer import for you; a `<script src>` page loads the
 * global build first.
 */
export class Grid {
  constructor(container: Element | string, config?: object);
}
export default Grid;
