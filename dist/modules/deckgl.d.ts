/*!
 * Lattice Grid 1.83.0, deckgl module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  ChartViewportProvenance,
  Grid,
} from '../lattice-grid.js';

/**
 * What {@link bindDeck} takes. deck.gl is the page's: the
 * module imports none of it, and is handed the page's `Deck` and a function
 * that builds layers with the page's own deck.gl classes.
 */
export interface DeckBindingOptions {
  /**
   * The page's deck.gl `Deck` instance (or a React `DeckGL`'s `deck`). The
   * binding calls its `setProps({ layers })`, wraps its `onViewStateChange`,
   * and reads its view from `getViewports()[0]` (`getBounds()`,
   * `fitBounds()`). Without `setProps` nothing is bound and
   * `deckgl:deck` warns.
   */
  deck: {
    setProps(props: Record<string, unknown>): void;
    props?: Record<string, unknown>;
    getViewports?(): unknown[];
  };
  /**
   * Builds the layers from the rows the grid shows: every leaf row after its
   * filter and sort for a grid that holds them all; for a paged pushdown grid,
   * the rows inside deck's view fetched from the engine, or — past
   * {@link DeckBindingOptions.viewportCap} — the engine's density cells, with
   * `ctx.binned` true. Not a function: nothing is bound and `deckgl:layers`
   * warns.
   */
  layers: (rows: Array<Record<string, unknown>>, ctx: DeckLayerContext) => unknown[];
  /**
   * The column(s) rows are placed by: a `lon`/`lat` pair, or a `geometry`
   * column. A name that is not a column of the grid: nothing is bound and
   * `deckgl:position` warns.
   */
  position: { lon: string; lat: string } | { geometry: string };
  /**
   * deck's view as a filter on the grid, exactly as a map chart's
   * {@link ChartSpec.viewportFilter}: written at bind time from deck's
   * initial viewport, so the grid and the layers agree
   * from the first paint, and again after a pan or zoom settles (debounced,
   * default 150 ms) the binding writes ONE condition — a `withinBbox` on a
   * geometry column, or a `between` pair on `lon`/`lat` — and a matching
   * condition set from elsewhere moves deck's view to its box. Off by default.
   */
  viewportFilter?: boolean | { debounce?: number };
  /**
   * The most rows fetched for one view of a paged pushdown grid before the
   * engine's density cells are handed over instead; as
   * {@link ChartSpec.viewportCap}, default 20,000.
   */
  viewportCap?: number;
}

/** The second argument of {@link DeckBindingOptions.layers}. */
export interface DeckLayerContext {
  /** The bound grid. */
  grid: Grid;
  /** The position, as given. */
  position: { lon?: string; lat?: string; geometry?: string };
  /** True when `rows` are density cells (`{ west, south, east, north, count }`), not rows. */
  binned: boolean;
  /** True while an engine request for the view is in flight; `rows` is the last answer. */
  pending: boolean;
  /** One GeoJSON `Feature` per placed row, the row as its `properties`; empty when binned. */
  features: Array<{ type: 'Feature'; geometry: Record<string, unknown>; properties: Record<string, unknown> }>;
  /**
   * What was handed over — the shape of `chart.provenance().viewport`, where
   * `rows` is the rows drawn and always equals `features.length`, plus
   * `skipped`: the rows handed over whose position is blank or could not be
   * read by the geometry type's own reader (WKT, WKB or GeoJSON, as an object
   * or as text), counted here and never as drawn; 0 when binned.
   */
  provenance: ChartViewportProvenance & { skipped: number };
}

/** A live binding between a grid and a deck. */
export interface DeckBinding {
  /** Rebuild the layers and hand them to deck now, rather than on the next frame. */
  update(): void;
  /** The layers last handed to deck. */
  layers(): unknown[];
  /** Remove the binding's viewport condition, its grid listeners and its `onViewStateChange` wrapper. */
  destroy(): void;
}

/**
 * Bind a deck.gl `Deck` to a grid: the grid's rows become the page's layers,
 * redrawn once per frame on `model:changed` / `rows:changed`, and — with
 * `viewportFilter` — deck's view becomes the grid's viewport filter.
 */
export function bindDeck(grid: Grid, options: DeckBindingOptions): DeckBinding;
export default bindDeck;
