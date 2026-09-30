/*!
 * Lattice Grid 1.80.0, leaflet module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  ChartViewportProvenance,
  Grid,
} from '../lattice-grid.js';

/**
 * What {@link bindLeaflet} takes: the same contract as
 * `bindDeck`. Leaflet is the page's: the module imports none of it, and is
 * handed the page's `L.Map` and a function that builds layers with the
 * page's own `L`.
 */
export interface LeafletBindingOptions {
  /**
   * The page's Leaflet map (`L.map(...)`). The binding calls its
   * `addLayer`/`removeLayer`, listens for `moveend`/`zoomend` with `on`/`off`,
   * reads its view from `getBounds()` and moves it with `fitBounds()`.
   * Missing any of the first five: nothing is bound and `leaflet:map` warns.
   */
  map: {
    addLayer(layer: unknown): unknown;
    removeLayer(layer: unknown): unknown;
    on(type: string, fn: (e: unknown) => void): unknown;
    off(type: string, fn: (e: unknown) => void): unknown;
    getBounds(): { getWest(): number; getSouth(): number; getEast(): number; getNorth(): number };
    fitBounds?(bounds: [[number, number], [number, number]], options?: Record<string, unknown>): unknown;
  };
  /**
   * Builds the layers from the rows the grid shows, called on every change of
   * the rows or the selection (one call per frame): every leaf row after its
   * filter and sort for a grid that holds them all; for a paged pushdown grid,
   * the rows inside the map's view fetched from the engine, or — past
   * {@link LeafletBindingOptions.viewportCap} — the engine's density cells,
   * with `ctx.binned` true. The layers it returned last time are removed from
   * the map and these added. A layer built from `ctx.features` (an
   * `L.geoJSON(ctx.features)`) selects a row when one of its features is
   * clicked. Not a function: nothing is bound and `leaflet:layers` warns.
   */
  layers: (rows: Array<Record<string, unknown>>, ctx: LeafletLayerContext) => unknown[];
  /**
   * The column(s) rows are placed by: a `lon`/`lat` pair, or a `geometry`
   * column, whose cells may hold GeoJSON, a parsed geometry, or WKT, WKB or
   * GeoJSON text. A name that is not a column of the grid: nothing is bound
   * and `leaflet:position` warns.
   */
  position: { lon: string; lat: string } | { geometry: string };
  /**
   * The map's view as a filter on the grid, exactly as a map chart's
   * {@link ChartSpec.viewportFilter}: written at bind time from the map's
   * own bounds once it has a size, so the grid and the
   * layers agree from the first paint, and again after every
   * `moveend`/`zoomend` — a drag or zoom by the reader, or the page's own
   * `setView`, `fitBounds` or `flyTo` — debounced (default 150 ms), the
   * binding writes the map's `getBounds()` as ONE condition: a `withinBbox`
   * on a geometry column, or a `between` pair on `lon`/`lat`. A matching
   * condition set from elsewhere moves the map to its box. Off by default.
   */
  viewportFilter?: boolean | { debounce?: number };
  /**
   * The most rows fetched for one view of a paged pushdown grid before the
   * engine's density cells are handed over instead; as
   * {@link ChartSpec.viewportCap}, default 20,000.
   */
  viewportCap?: number;
}

/** The second argument of {@link LeafletBindingOptions.layers}. */
export interface LeafletLayerContext {
  /** The bound grid. */
  grid: Grid;
  /** The page's map. */
  map: LeafletBindingOptions['map'];
  /** The position, as given. */
  position: { lon?: string; lat?: string; geometry?: string };
  /** True when `rows` are density cells (`{ west, south, east, north, count }`), not rows. */
  binned: boolean;
  /** True while an engine request for the view is in flight; `rows` is the last answer. */
  pending: boolean;
  /**
   * One GeoJSON `Feature` per placed row: its `id` the row key, the row its
   * `properties`; empty when binned.
   */
  features: Array<{ type: 'Feature'; id: string | number; geometry: Record<string, unknown>; properties: Record<string, unknown> }>;
  /**
   * What was handed over — the shape of `chart.provenance().viewport`, where
   * `rows` is the rows drawn and always equals `features.length`, plus
   * `skipped`: the rows handed over whose position is blank or could not be
   * read, counted here and never as drawn; 0 when binned.
   */
  provenance: ChartViewportProvenance & { skipped: number };
  /** The keys of the grid's selected rows, for the layers to mark. */
  selected: Array<string | number>;
}

/** A live binding between a grid and a Leaflet map. */
export interface LeafletBinding {
  /** Rebuild the layers and swap them onto the map now, rather than on the next frame. */
  update(): void;
  /** The layers the binding last put on the map. */
  layers(): unknown[];
  /**
   * Select a row by key, for a layer the page made that carries no feature
   * (a click on a feature of an `L.geoJSON(ctx.features)` selects on its own);
   * `null` clears the selection. The grid must be created with
   * `selection: 'single'` or `'multiple'`; a row it does not take warns
   * `leaflet:selection`.
   */
  select(key: string | number | null): void;
  /** Remove the binding's layers, its viewport condition, and its map and grid listeners. */
  destroy(): void;
}

/**
 * Bind a Leaflet map to a grid: the grid's rows become the page's layers,
 * redrawn once per frame on `model:changed` / `rows:changed` /
 * `selection:changed`; a click on a feature selects its row; and — with
 * `viewportFilter` — the map's view becomes the grid's viewport filter.
 */
export function bindLeaflet(grid: Grid, options: LeafletBindingOptions): LeafletBinding;
export default bindLeaflet;
