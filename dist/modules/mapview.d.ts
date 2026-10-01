/*!
 * Lattice Grid 1.84.0, mapview module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  ChartViewportProvenance,
  Grid,
} from '../lattice-grid.js';

/**
 * Where a row's place is read from: a latitude and a
 * longitude column (`lng`, or `lon`); a GeoJSON column (a `Geometry` or a
 * `Feature`, as an object or its JSON text, or WKT or WKB); or a path column
 * holding an array of `[lng, lat]` pairs (or its JSON text).
 */
export type MapViewGeometry =
  | { lat: string; lng: string }
  | { lat: string; lon: string }
  | { geojson: string }
  | { path: string };

/** The layer kinds a map view draws a row with. */
export type MapViewLayer = 'point' | 'column' | 'polygon' | 'path';

/**
 * How rows are coloured: one colour (a CSS hex or `rgb()` colour, or
 * `[r, g, b, a?]`); a category per value of a column (`map` names the
 * colour of each value, and any other value takes the next colour of the
 * charts palette); or a number placed along a ramp by the charts module's
 * own scale code, between the `colours` stops (default the default scheme's
 * sequential ramp), over `domain` (default the drawn values' range), on a
 * `rampScale` (`linear`, `log` or `quantile`; chosen from the values when
 * unset, as a heat map's is).
 */
export type MapViewColour =
  | string
  | number[]
  | { field: string; map?: Record<string, string | number[]> }
  | {
    field: string;
    scale: 'ramp';
    domain?: [number, number];
    colours?: string[];
    rampScale?: 'linear' | 'log' | 'quantile';
  };

/**
 * An animated flow along routes: `speed` is traversals of a route per second
 * (default 0.25), `trail` the share of a route the moving trail lights
 * (default 0.3).
 */
export type MapViewFlow = boolean | { speed?: number; trail?: number };

/** A camera: centre `[lng, lat]`, zoom, pitch and bearing in degrees. */
export type MapViewCamera = { center?: [number, number]; zoom?: number; pitch?: number; bearing?: number };

/** What {@link createMapView} takes. */
export interface MapViewOptions {
  /**
   * Where each row is placed. A row whose place is blank or cannot be read
   * is skipped and counted in `provenance().skipped`. A name that is not a
   * column of the grid: nothing is drawn and `mapview:geometry` warns.
   */
  geometry: MapViewGeometry;
  /**
   * The element (or a selector for it) the map fills. Given without a
   * `mode`, the mode is `container`.
   */
  container?: HTMLElement | string;
  /**
   * Where the map goes: `container` (the `container` element); `split` (the
   * default without a container: the map beside the grid in the grid's own
   * host, with a divider a pointer drags and the arrow keys move); `tab` (the
   * grid and the map as two tabs); `popout` (a separate browser window on
   * this page's libraries, or a floating panel when the popup is blocked).
   * `split`, `tab` and `popout` need a grid made by `createGrid`.
   */
  mode?: 'container' | 'split' | 'tab' | 'popout';
  /**
   * The layer for the rows of one geometry: `point` (markers) or `column`
   * (extruded columns) for points, `polygon` (areas, extruded with an
   * `elevation`) for polygons, `path` (routes) for lines. Rows of another
   * geometry keep their default: a point is a marker, or a column when an
   * `elevation` is given; a polygon an area; a line a route.
   */
  layer?: MapViewLayer;
  /** A numeric column (or one number) for the height of columns and extruded areas, in metres. */
  elevation?: string | number;
  /** A multiplier on `elevation`. Default 1. */
  elevationScale?: number;
  /** How rows are coloured. Default the grid theme's accent. */
  color?: MapViewColour;
  /**
   * A marker's radius in metres: a numeric column or one number (default
   * 30). A `column` layer draws every column at one radius, so only a number
   * applies to it.
   */
  radius?: string | number;
  /** A route's width in pixels: a numeric column or one number. Default 3. */
  width?: string | number;
  /**
   * Animate a flow along the routes. Stops while the page is hidden, and is
   * drawn still when the reader prefers reduced motion.
   */
  flow?: MapViewFlow;
  /**
   * Add 3D buildings from the basemap's OpenMapTiles `building` layer
   * (`render_height`, `render_min_height`), coloured for the light or dark
   * theme. Off by default. A style with no vector source warns
   * `mapview:buildings`.
   */
  buildings?: boolean;
  /**
   * A MapLibre style URL or style object. Default OpenFreeMap's keyless
   * positron, or its dark style for a dark theme.
   */
  basemap?: string | Record<string, unknown>;
  /** The initial camera. Default: fitted to the drawn rows. */
  view?: MapViewCamera;
  /**
   * `light` or `dark`; default the grid's own (`data-theme` above it, `auto`
   * read from the reader's colour-scheme preference).
   */
  theme?: 'light' | 'dark' | 'auto';
  /**
   * The columns the hover tooltip shows, each as the grid's own formatted
   * cell text. Default the grid's first three visible columns that do not
   * hold the place; `false` for no tooltip.
   */
  tooltip?: string[] | false;
  /**
   * The page's deck.gl and MapLibre GL. Default the globals `deck` and
   * `maplibregl` their UMD builds set. Either missing: the map is left empty
   * and `mapview:libs` warns, naming which.
   */
  libs?: { deck?: unknown; maplibregl?: unknown };
  /**
   * On a paged pushdown grid, the most rows fetched for the map's view;
   * as {@link ChartSpec.viewportCap}, default 20,000.
   */
  viewportCap?: number;
}

/** What a map view drew. */
export interface MapViewProvenance extends Partial<ChartViewportProvenance> {
  /** The rows drawn. */
  drawn: number;
  /** The rows the grid shows that have no usable place, so were not drawn. */
  skipped: number;
  /** The rows the grid matched. */
  matched: number;
  /** The rows drawn by each layer kind. */
  layers: Partial<Record<MapViewLayer, number>>;
  /** `client` when the grid held the rows, `engine` when a paged source's engine answered for the view. */
  computed: 'client' | 'engine';
}

/** The events a map view emits. */
export type MapViewEventName = 'feature:click' | 'feature:hover' | 'draw' | 'load' | 'close';

/** What each map view event carries. */
export interface MapViewEventPayloads {
  /** A feature was clicked; its row is now selected in the grid. */
  'feature:click': { key: string | number; row: Record<string, unknown> | null };
  /** The pointer moved onto a feature (`key` null when it left one); `lines` are the tooltip's. */
  'feature:hover': { key: string | number | null; row: Record<string, unknown> | null; lines: Array<{ column: string; title: string; text: string }> };
  /** The layers were redrawn. */
  'draw': { provenance: MapViewProvenance };
  /** The basemap style loaded (at first, and after a basemap or theme change). */
  'load': { map: unknown };
  /** The reader closed a popped-out map. */
  'close': Record<string, never>;
}

/** A live map view of a grid. */
export interface MapView {
  /** The map view's own element. */
  readonly element: HTMLElement | null;
  /** The MapLibre map; null when the map could not be built. */
  readonly map: unknown;
  /** deck.gl's `MapboxOverlay` on it; null when the map could not be built. */
  readonly overlay: unknown;
  /**
   * Change options and redraw now: `basemap` and `theme` restyle the map,
   * `buildings` adds or removes them, `view` moves the camera, and
   * `geometry` re-reads every row's place.
   */
  update(options?: Partial<MapViewOptions>): void;
  /** Fly to one row, or fit the map to several. */
  flyTo(keys: string | number | Array<string | number>): void;
  /** Draw the rows of one geometry with this layer kind. */
  setLayer(layer: MapViewLayer): void;
  /** What the map drew last: rows drawn, skipped and matched, and per layer. */
  provenance(): MapViewProvenance;
  /** The deck.gl layers last handed to the map. */
  layers(): unknown[];
  /** Listen for an event; returns the unsubscribe. An unknown name warns `mapview:event:<name>`. */
  on(name: MapViewEventName, fn: (event: MapViewEventPayloads[MapViewEventName]) => void): () => void;
  /** Stop listening for an event. */
  off(name: MapViewEventName, fn: (event: MapViewEventPayloads[MapViewEventName]) => void): void;
  /** Remove the map, its layers and every listener, and put the grid back where it was. */
  destroy(): void;
}

/**
 * A 3D map of the grid's rows, linked both ways: the rows the grid shows
 * after its filters, quick search and grouping (every leaf row, collapsed
 * groups included) are drawn, redrawn one frame after the grid changes; a
 * grid selection flies the map to its rows; a click on a feature selects its
 * row and scrolls the grid to it; hover shows the grid's own cell text.
 * deck.gl and MapLibre GL are the page's.
 */
export function createMapView(grid: Grid, options: MapViewOptions): MapView;
export default createMapView;
