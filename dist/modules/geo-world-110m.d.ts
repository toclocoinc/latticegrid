/*!
 * Lattice Grid 1.63.1, geo-world-110m module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  GeoPack,
} from '../lattice-grid.js';

/**
 * World countries at 1:110m — an optional geometry pack (BACKLOG-0001321).
 * Generated from Natural Earth (public domain) by `tools/build-geo-packs.mjs`;
 * 177 countries. Pass as `shapes` on a `geomap` chart, or register it and name
 * it by id: `shapes: { pack: 'world-110m' }`.
 */
export const pack: GeoPack;
export default pack;
