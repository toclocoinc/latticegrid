/*!
 * Lattice Grid 1.97.0, chart-tree module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * The node-link tree extension type. Importing this module registers `tree`. A
 * tidy (Reingold-Tilford) tree: top-down, `orientation: 'left-right'` or `'radial'`, with
 * straight, elbow or curved links; `cluster: true` draws a dendrogram. No two nodes at a level
 * overlap; a click folds or opens a branch and the layout is recomputed; the drag and the wheel
 * pan and zoom a large tree.
 */
export function drawTree(ctx: object): object;
export default drawTree;
