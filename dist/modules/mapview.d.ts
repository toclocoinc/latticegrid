/*!
 * Lattice Grid 1.86.6, mapview module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  ChartViewportProvenance,
  Grid,
} from '../lattice-grid.js';

/**
 * Where a row's place is read from: a latitude and a
 * longitude column (`lng`, or `lon`), optionally with a `route` to join rows
 * into lines; a `from` and a `to` (each a latitude and a longitude column) for
 * a row that is one segment; a GeoJSON column (a `Geometry` or a
 * `Feature`, as an object or its JSON text, or WKT or WKB); or a path column
 * holding an array of `[lng, lat]` pairs (or its JSON text).
 */
export type MapViewGeometry =
  | { lat: string; lng: string; route?: MapViewRoute }
  | { lat: string; lon: string; route?: MapViewRoute }
  | { from: MapViewEnd; to: MapViewEnd }
  | { geojson: string }
  | { path: string };

/** One end of a segment row: the columns holding its latitude and longitude (`lng`, or `lon`). */
export type MapViewEnd = { lat: string; lng: string } | { lat: string; lon: string };

/**
 * Routes assembled from ordinary rows: with
 * `geometry: { lat, lng, route }` every row that has a place AND a non-blank
 * value in the `by` column is one vertex of the route that value names, and
 * each route is drawn as one line through its vertices in `order` (numbers
 * as numbers, anything else as text; a blank last; rows with equal values in
 * the order the grid shows them; no `order`: the grid's order). A row with a
 * blank `by` is not a vertex: it stays a point (a cabinet, a splice) and is
 * drawn as one. A vertex row is never also drawn as a point.
 *
 * A route's colour, width, dash and elevation are route-level: read from the
 * route's first vertex row (in sequence order), or from `aggregate` across
 * its rows.
 */
export interface MapViewRoute {
  /** The column holding each vertex row's route id. */
  by: string;
  /** The column holding each vertex's position in its route. */
  order?: string;
  /**
   * How a route-level style column is read across the route's rows: `first`
   * (default), `last`, or `min` / `max` (numbers as numbers, anything else
   * as text). An unknown value warns `mapview:route`.
   */
  aggregate?: 'first' | 'last' | 'min' | 'max';
}

/**
 * A line pattern as `[dash, gap]` in pixels, or a name: `solid`, `dashed`
 * (10 px dash, 6 px gap) or `dotted` (2 px dash, 5 px gap).
 */
export type MapViewDashPattern = 'solid' | 'dashed' | 'dotted' | [number, number];

/**
 * How lines are dashed: one pattern for every line, or a pattern per value
 * of a column (`map`; a value it does not name is drawn solid). The pattern
 * is in pixels and holds its length on screen while the camera zooms and
 * pitches. Needs deck.gl's `PathStyleExtension` on the page's deck (the full
 * `deck.gl` bundle has it); without it `mapview:dash` warns and lines are
 * solid. A pattern that is none of these warns `mapview:dash:spec`.
 */
export type MapViewDash = MapViewDashPattern | { field: string; map: Record<string, MapViewDashPattern> };

/**
 * An icon for a point row: the name of a glyph of the grid's icon registry
 * (`grid.icons`: `cabinet`, `splice`, `exchange`, `pole`, `chamber`,
 * `premises`, `fault` and the rest, and any you register), an SVG path (in a
 * 16 x 16 box), an icon definition (`{ viewBox, paths }`), or an image URL.
 */
export type MapViewIconRef = string | { viewBox?: string; paths?: string[]; path?: string; paint?: 'stroke' | 'fill' };

/**
 * Icon markers for point rows. A point's icon is
 * `map[value of field]`, else `default`; with a `field` and no `map` the
 * value is itself the icon. A point with no icon is drawn as a circle. A
 * name that is no glyph, path or URL warns `mapview:icon:<name>`; with no
 * canvas to draw on, `mapview:icons`.
 *
 * Registry glyphs are tinted by the `color` mapping (an image URL is drawn
 * as it is). In 3D an icon is a billboard: it always faces the camera, is
 * drawn whole at ground level over the routes and the extruded buildings
 * (it is not depth-tested, so a building never hides it), and keeps its pixel
 * size at every zoom. All the icons live in one atlas, packed once and again
 * only when a point asks for an icon it does not hold.
 */
export type MapViewIcon = MapViewIconRef | {
  /** The column whose value picks the icon. */
  field?: string;
  /** Icon per value of `field`. */
  map?: Record<string, MapViewIconRef>;
  /** The icon for a point `map` does not name (or, with no `field`, every point). */
  default?: MapViewIconRef;
  /** Size in pixels: a number or a numeric column. Default 24. */
  size?: string | number;
  /** Which point of the glyph sits on the position. Default `center`; `bottom` stands it on the position like a pin. A badge is always centred. */
  anchor?: 'center' | 'bottom' | 'top' | 'left' | 'right';
  /**
   * Put the glyph on a coloured badge (`circle`, `square`, `diamond`; `true`
   * is a circle): the badge takes the `color`, ringed in white, the glyph is
   * white on it, and the badge is what is picked.
   */
  badge?: boolean | 'circle' | 'square' | 'diamond';
};

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
  /**
   * A route's width in pixels: a numeric column or one number. Default 3.
   * A route is always drawn between 2 and 30 pixels wide whatever its width,
   * wide enough to read at street level among extruded buildings, and drawn
   * 2 m above the ground (4 m for points when routes are in view) so it does
   * not z-fight the basemap at pitch.
   */
  width?: string | number;
  /**
   * Dash lines by value or all alike; see {@link MapViewDash}. The legend
   * shows each pattern the map names.
   */
  dash?: MapViewDash;
  /** Icon markers for point rows; see {@link MapViewIcon}. */
  icon?: MapViewIcon;
  /**
   * Show a legend in the map's box: a swatch for each colour the `color`
   * rule maps and a sample line for each pattern `dash` names. Default off;
   * `legend()` returns the same entries as data.
   */
  legend?: boolean;
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
   * hold the place; `false` for no tooltip. A route's tooltip leads with its
   * route id and shows its first row's cells.
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
  /** The rows drawn (every vertex row of a drawn route counts). */
  drawn: number;
  /**
   * The rows the grid shows that have no usable place, so were not drawn;
   * with `route`, also the vertex rows of a route skipped for having fewer
   * than two usable vertices, so `drawn + skipped` is every matched row.
   */
  skipped: number;
  /** The rows the grid matched. */
  matched: number;
  /** The items drawn by each layer kind (a route is one path); `icon` counts the points drawn as icons, `point` the circles. */
  layers: Partial<Record<MapViewLayer | 'icon', number>>;
  /** With `geometry.route`: the routes drawn. */
  routes?: number;
  /** With `geometry.route`: the routes skipped for having fewer than two usable vertices. */
  routesSkipped?: number;
  /**
   * With `geometry.route`: the routes assembled from their rows on the last
   * draw. A route none of whose vertex rows (or route-level style columns)
   * changed is reused, so an edit, add, delete or filter of one vertex row
   * assembles one route, not all of them.
   */
  routesRebuilt?: number;
  /** `client` when the grid held the rows, `engine` when a paged source's engine answered for the view. */
  computed: 'client' | 'engine';
}

/** The events a map view emits. */
export type MapViewEventName = 'feature:click' | 'feature:hover' | 'draw' | 'load' | 'close';

/** What each map view event carries. */
export interface MapViewEventPayloads {
  /**
   * A feature was clicked; its row is now selected in the grid. A route
   * selects every one of its rows: `key` is its first row's key, `route` its
   * id and `keys` all its rows' keys.
   */
  'feature:click': { key: string | number; row: Record<string, unknown> | null; route?: string; keys?: Array<string | number> };
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
  /** The deck.gl layers last handed to the map, in draw order: areas, routes, columns, points, icons. */
  layers(): unknown[];
  /**
   * What the legend shows, as data. `sections` is what is drawn: one merged section when the colour and
   * dash rules key on the same field (an entry per value, `line` true for a value drawn as a line, its
   * sample in that value's colour and `dash`; false for a point-only value, a square), else one section
   * per rule titled by its field's header. `colours` and `dashes` are the two rules' own
   * entries (`null` dash is solid).
   */
  legend(): {
    colours: Array<{ label: string; colour: number[] }>;
    dashes: Array<{ label: string; dash: [number, number] | null }>;
    sections: Array<{
      field: string | null; title: string; merged: boolean;
      entries: Array<{ label: string; colour: number[] | null; dash: [number, number] | null; line: boolean }>;
    }>;
  };
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
