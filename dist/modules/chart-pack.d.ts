/*!
 * Lattice Grid 1.98.1, chart-pack module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * The packed-circles extension type. Importing this module registers `pack`. A
 * hierarchy as circles inside circles by front-chain packing, deterministic for the same rows: a
 * leaf's area is proportional to its `y` (or a row count), a branch is the circle that holds its
 * children, labels are written where they fit. A click zooms into a branch (animated unless the
 * reader prefers reduced motion) and a click on the circle filling the view zooms back out; with
 * `selection: true` it also selects the rows at or beneath the circle.
 */
export function drawPack(ctx: object): object;
export default drawPack;
