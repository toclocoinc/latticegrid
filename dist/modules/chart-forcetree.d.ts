/*!
 * Lattice Grid 1.86.3, chart-forcetree module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * The force-directed tree extension type. Importing this module registers
 * `forceTree`. A hierarchy — a `parentId` column, a `path` column or the grid's grouping — as a
 * graph whose only links are parent to child: the root pinned at the centre, the rest settled by
 * the network chart's force layout in a bounded number of ticks (`iterations`, reported on the
 * drawing) and then left alone. Dot area follows `y` (or a row count), colour follows depth or
 * `colourBy`; a click folds or opens a branch and, with `selection: true`, selects the rows at or
 * beneath the node; a node can be dragged and stays where it is dropped.
 */
export function drawForceTree(ctx: object): object;
export default drawForceTree;
