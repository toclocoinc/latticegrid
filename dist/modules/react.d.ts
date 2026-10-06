/*!
 * Lattice Grid 1.88.2, react module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  EventName,
  FilterSet,
  Grid,
  GridConfig,
  GridEvent,
  Row,
  RowChange,
  SortEntry,
  SourceConfig,
  ViewerKind,
  createGrid,
} from '../lattice-grid.js';

// The Material 3 preset's return shape, imported
// type-only so this bundle imports no code from `modules/presets` — the
// re-export below is the pure function itself, and needs no help from a
// second copy of its types.
import type { MuiTheme as PresetsMuiTheme, MuiThemeResult as PresetsMuiThemeResult } from './presets.js';

/**
 * The handler prop name one event maps to, as a type: `'cell:changed'`
 * becomes `'onCellChanged'`.
 *
 * Recursive over the `:` segments, so a three-part name like
 * `'cell:edit:start'` becomes `'onCellEditStart'` — the same rule
 * `handlerName` applies at runtime, stated once so the props type and the
 * implementation cannot disagree.
 */
export type PascalJoin<E extends string> =
  E extends `${infer Head}:${infer Tail}`
    ? `${Capitalize<Head>}${PascalJoin<Tail>}`
    : Capitalize<E>;
/**
 * The React prop name for one grid event: `'rows:changed'` is
 * `onRowsChanged`. The pair with {@link PascalJoin} is what lets an editor
 * complete the props of `<LatticeGrid>` from the event union itself.
 */
export type HandlerProp<E extends string> = `on${PascalJoin<E>}`;

/** Every grid event as a React callback prop, each receiving the `GridEvent`. */
export type LatticeGridEventProps = {
  [E in EventName as HandlerProp<E>]?: (event: GridEvent) => void;
};

/** The live instance a `<LatticeGrid>` ref exposes; `null` before mount. */
export interface LatticeGridHandle {
  /**
   * The live grid the component built, or null before the mount effect has run and after
   * it has been destroyed.
   */
  readonly grid: Grid | null;
}

/**
 * What `<LatticeGrid>` takes.
 *
 * Generic over the row type so `rows`, `predicates` and the keyed-diff prop
 * are checked against the host's own record shape rather than `unknown`.
 *
 * Every **grid configuration key** is accepted as a prop and diffed with
 * `Object.is` — an inline `columns={[…]}` is a new array on every render and
 * reconfigures the grid on every render, so hoist it or `useMemo` it. `sort`,
 * `filters`, `quickFilter` and `selectedKeys` are query/selection state rather
 * than configuration and go through their own setters.
 */
export type LatticeGridProps<Row = unknown> =
  Omit<GridConfig, 'rows'> & LatticeGridEventProps & {
    /** The rows, copied on ingest so two grids may share one array. */
    rows?: Row[];
    /** Applied through `grid.sort.set`, not as configuration. */
    sort?: SortEntry[];
    /** Applied through `grid.filters.set` — replaces the whole tree; see `predicates`. */
    filters?: FilterSet | null;
    /** Applied through `grid.filters.quick`. */
    quickFilter?: string | { text: string; mode?: string };
    /** Applied through `grid.selection.set`. */
    selectedKeys?: string[];
    /**
     * Named row predicates through `grid.filters.where(name, fn)`, diffed by
     * name and removed when a name goes. These **compose** with whatever
     * filter the reader set in the tool panel; `filters` does not.
     */
    predicates?: Record<string, ((row: Row) => boolean) | null>;
    /**
     * A keyed diff handed to `grid.rows.apply()`, applied when the object's
     * identity changes — a feed produces a new change object per batch.
     */
    rowUpdates?: RowChange;
    /** Told when the grid exists, for a parent that cannot use a ref. */
    onGridReady?: (grid: Grid) => void;
    /** Told just before the grid is destroyed. */
    onGridDestroy?: () => void;
    /** The name this grid publishes itself under in a `LatticeGridProvider`. */
    name?: string;
    /** The route value to `attach` to the router in context, if any. */
    route?: unknown;
    /** Per-route options for that `attach`. */
    routeOptions?: Record<string, unknown>;
    /** Applied to the host element rather than to the grid. */
    className?: string;
    /** Applied to the host element rather than to the grid. */
    style?: Record<string, unknown>;
    /** Applied to the host element rather than to the grid. */
    id?: string;
  };

/**
 * Build the React grid component.
 *
 * A factory rather than a component, because the adapter imports neither
 * React nor the grid: you pass both in. That is what keeps the package's
 * promise of no runtime dependencies, and what stops an adapter disagreeing
 * with the grid version already loaded.
 *
 * The live grid is reached through a forwarded ref: `ref.current.grid` is the
 * same `Grid` the vanilla `createGrid` returns, or null before mount.
 *
 * React 18's StrictMode double mount creates exactly **one** grid: the
 * component builds it in an effect with an empty dependency list and destroys
 * it in that effect's cleanup.
 */
export function createLatticeGrid<Row = unknown>(deps: {
  React: unknown;
  createGrid: (el: unknown, config: GridConfig) => Grid;
}): (props: LatticeGridProps<Row> & { ref?: unknown }) => unknown;

/** The live instance a viewer component's ref exposes; `null` before mount. */
export interface LatticeViewerHandle<Instance = unknown> {
  /**
   * The live viewer the component built — the board, panel, chart, plan, layout or strip
   * — or null before mount.
   */
  readonly instance: Instance | null;
}

/**
 * What every viewer component takes beyond its own configuration: the grid it binds to, which published grid to take when
 * that is left off, the lifecycle callbacks, and the host-element props.
 */
export interface LatticeViewerCommonProps<Instance = unknown> {
  /** The grid this viewer is built against; taken from context when absent. */
  grid?: Grid | null;
  /** Which published grid to take from context; `'default'` when absent. */
  gridName?: string;
  /** Told when the viewer exists. */
  onReady?: (instance: Instance) => void;
  /** Told just before it is destroyed. */
  onDestroy?: () => void;
  /** Applied to the host element rather than to the viewer. */
  className?: string;
  /** Applied to the host element rather than to the viewer. */
  style?: Record<string, unknown>;
  /** Applied to the host element rather than to the viewer. */
  id?: string;
}

/** The KPI panel's React props: its own config, plus the common ones and its events. */
export type LatticeKPIProps<Row = unknown> =
  Record<string, unknown> & LatticeViewerCommonProps & {
  rows?: Row[];
  onTileClick?: (payload: unknown) => void;
  onTileDblclick?: (payload: unknown) => void;
  onTileContextmenu?: (payload: unknown) => void;
  onNodeToggle?: (payload: unknown) => void;
  onChange?: (payload: unknown) => void;
};

/** A chart's React props: the spec, the common ones, and its five events. */
export type LatticeChartProps = Record<string, unknown> & LatticeViewerCommonProps & {
  /** Required: a chart is always built against a grid. */
  grid?: Grid | null;
  onClick?: (payload: unknown) => void;
  onHover?: (payload: unknown) => void;
  onLeave?: (payload: unknown) => void;
  onDraw?: (payload: unknown) => void;
  onLegend?: (payload: unknown) => void;
};

/** The board's React props. */
export type LatticeKanbanProps<Row = unknown> =
  Record<string, unknown> & LatticeViewerCommonProps & {
    rows?: Row[];
    quickFilter?: string;
    sprint?: unknown;
    epic?: unknown;
    loading?: boolean;
    error?: string | null;
  };

/** The calendar's React props. */
export type LatticeCalendarProps<Row = unknown> =
  Record<string, unknown> & LatticeViewerCommonProps & {
    rows?: Row[];
    view?: 'week' | 'month';
    date?: Date | string | number;
    onCardClick?: (payload: unknown) => void;
    onCardDblClick?: (payload: unknown) => void;
    onCardContextmenu?: (payload: unknown) => void;
    onCardMount?: (payload: unknown) => void;
    onRangeChange?: (payload: unknown) => void;
    /** A card is about to be rescheduled; call `payload.preventDefault(reason?)` to veto. */
    onBeforeMove?: (payload: unknown) => void;
    /** A card was rescheduled; `payload` carries the old and new start/end. */
    onCardMove?: (payload: unknown) => void;
  };

/** The Gantt's React props. */
export type LatticeGanttProps = Record<string, unknown> & LatticeViewerCommonProps & {
  tasks?: unknown[];
  dependencies?: unknown[];
  onSchedule?: (payload: unknown) => void;
  onError?: (payload: unknown) => void;
};

/** The layout's React props. */
export type LatticeLayoutProps = Record<string, unknown> & LatticeViewerCommonProps;

/** One tab of a `<LatticeTabs>`; `content` makes it React's rather than the module's. */
export interface LatticeTabSpec {
  /**
   * The tab's identity, used to select it, to name its slot and to derive another tab
   * from it. Required, non-empty and unique; a duplicate or missing id is refused.
   */
  id: string;
  /** The text on the tab button. Defaults to the id. */
  label?: string;
  /** A React element, or a function returning one, rendered through a portal. */
  content?: unknown | (() => unknown);
  /**
   * Any other prop the host wants to carry on the tab. Passed through untouched, so a
   * React host can key its own state off the same object the grid holds.
   */
  [key: string]: unknown;
}

/** The tab strip's React props. */
export type LatticeTabsProps = Record<string, unknown> & {
  tabs: LatticeTabSpec[];
  /** The open tab; changing it calls `activate`. */
  active?: string;
  onBeforeTabChange?: (payload: unknown) => void;
  onTabChanged?: (payload: unknown) => void;
  onTabChangeCancelled?: (payload: unknown) => void;
  className?: string;
  style?: Record<string, unknown>;
  id?: string;
};

/**
 * Build a React component around any Lattice viewer factory.
 *
 * `viewer` selects the event and live-prop tables; `requires` names the props
 * the viewer cannot be built without (and which rebuild it when their identity
 * changes); `fromContext` names the prop filled from the grid context.
 */
export function createLatticeViewer(options: {
  React: unknown;
  viewer: ViewerKind;
  mount: (el: unknown, config: Record<string, unknown>) => unknown;
  name?: string;
  requires?: string[];
  fromContext?: string;
}): (props: Record<string, unknown> & { ref?: unknown }) => unknown;

/** The KPI panel as a React component. Grid-bound through context by default. */
export function createLatticeKPI<Row = unknown>(deps: {
  React: unknown; createKPI: (el: unknown, config: Record<string, unknown>) => unknown;
}): (props: LatticeKPIProps<Row> & { ref?: unknown }) => unknown;

/** A chart as a React component. Requires a grid; a new grid rebuilds the chart. */
export function createLatticeChart(deps: {
  React: unknown; createChart: (opts: Record<string, unknown>) => unknown;
}): (props: LatticeChartProps & { ref?: unknown }) => unknown;

/** The kanban board as a React component. */
export function createLatticeKanban<Row = unknown>(deps: {
  React: unknown; createKanban: (el: unknown, config: Record<string, unknown>) => unknown;
}): (props: LatticeKanbanProps<Row> & { ref?: unknown }) => unknown;

/** The calendar as a React component. Grid-bound through context by default. */
export function createLatticeCalendar<Row = unknown>(deps: {
  React: unknown; createCalendar: (el: unknown, config: Record<string, unknown>) => unknown;
}): (props: LatticeCalendarProps<Row> & { ref?: unknown }) => unknown;

/** The Gantt as a React component. */
export function createLatticeGantt(deps: {
  React: unknown; createGantt: (opts: Record<string, unknown>) => unknown;
}): (props: LatticeGanttProps & { ref?: unknown }) => unknown;

/** The layout as a React component. */
export function createLatticeLayout(deps: {
  React: unknown; createLayout: (el: unknown, config: Record<string, unknown>) => unknown;
}): (props: LatticeLayoutProps & { ref?: unknown }) => unknown;

/**
 * The tab strip, with React-rendered tab content.
 *
 * `react-dom` is needed for `createPortal`: a tab's content is rendered into
 * the panel element the module created, so it stays a genuine child of the
 * React tree that declared it — props, refs and context all reach it.
 */
export function createLatticeTabs(deps: {
  React: unknown;
  ReactDOM: unknown;
  createTabs: (el: unknown, config: Record<string, unknown>) => unknown;
  createGrid?: (el: unknown, config: GridConfig) => Grid;
}): (props: LatticeTabsProps & { ref?: unknown }) => unknown;

/**
 * The provider and hook that let a grid-bound viewer find its grid.
 *
 * A ref cannot help here: writing to a ref re-renders nobody, so a sibling
 * that needs the instance never learns it arrived.
 */
export function createLatticeGridContext(deps: { React: unknown }): {
  LatticeGridProvider: (props: { children?: unknown }) => unknown;
  useLatticeGrid: (name?: string) => Grid | null;
};

/**
 * The Data Router hook and its provider.
 *
 * `useLatticeRouter` creates the router in an effect and destroys it in that
 * effect's cleanup, so it returns `null` on the first render. The config is
 * read once: rebuilding would drop every attached grid and every row held.
 */
export function createLatticeRouter(deps: {
  React: unknown; createDataRouter: (opts: Record<string, unknown>) => unknown;
}): {
  useLatticeRouter: (config?: Record<string, unknown>) => unknown | null;
  LatticeRouterProvider: (props: { router?: unknown; children?: unknown }) => unknown;
  useRouter: () => unknown | null;
};

/** Every React binding this package ships, from one call. */
export function createLatticeReact(deps: {
  React: unknown;
  ReactDOM?: unknown;
  createGrid?: (el: unknown, config: GridConfig) => Grid;
  createKPI?: (el: unknown, config: Record<string, unknown>) => unknown;
  createChart?: (opts: Record<string, unknown>) => unknown;
  createKanban?: (el: unknown, config: Record<string, unknown>) => unknown;
  createCalendar?: (el: unknown, config: Record<string, unknown>) => unknown;
  createGantt?: (opts: Record<string, unknown>) => unknown;
  createLayout?: (el: unknown, config: Record<string, unknown>) => unknown;
  createTabs?: (el: unknown, config: Record<string, unknown>) => unknown;
  createDataRouter?: (opts: Record<string, unknown>) => unknown;
}): Record<string, unknown>;

/**
 * One MUI X-shaped column definition, as `<LatticeDataGrid>` takes it. These eleven keys are mapped onto a grid column; any
 * other key is refused once, by name, as `columns.<key>`.
 */
export interface LatticeDataGridColDef {
  /** The row property the column shows; also the column's id. Required. */
  field: string;
  /** The heading text. Defaults to the field. */
  headerName?: string;
  /** The width in pixels; 100 by default, as in MUI. Ignored when `flex` is set. */
  width?: number;
  /** A share of the spare width, instead of a fixed `width`. */
  flex?: number;
  /**
   * The value type: `'string'`, `'number'`, `'date'`, `'dateTime'` or
   * `'boolean'`, each mapped to the grid's own type. Any other type is
   * refused by name and the type is inferred from the data.
   */
  type?: 'string' | 'number' | 'date' | 'dateTime' | 'boolean';
  /**
   * Derive the cell value, MUI's four-argument form: the row's value for
   * `field`, the row, this definition, and the `apiRef`.
   */
  valueGetter?: (value: any, row: any, column: LatticeDataGridColDef,
    apiRef: { current: LatticeDataGridApi | null }) => unknown;
  /** Turn the cell value into the text the cell shows, with the same four arguments. */
  valueFormatter?: (value: any, row: any, column: LatticeDataGridColDef,
    apiRef: { current: LatticeDataGridApi | null }) => unknown;
  /**
   * Render the cell: a string or number is shown as text, a React element is
   * mounted into the cell through its own root (which needs `ReactDOM`
   * passed to `createLatticeDataGrid`).
   */
  renderCell?: (params: LatticeDataGridCellParams) => unknown;
  /** Let the reader edit this column's cells. */
  editable?: boolean;
  /** `false` stops the column being sorted. */
  sortable?: boolean;
  /** `false` stops the column being filtered. */
  filterable?: boolean;
}

/** What `onCellClick`, `onCellDoubleClick`, `onCellEditStop` and `renderCell` receive, MUI's shape. */
export interface LatticeDataGridCellParams {
  /** The row's MUI id: `getRowId(row)`, or `row.id`. */
  id: unknown;
  /** The column's field. */
  field: string;
  /** The cell's value. */
  value: unknown;
  /** The cell's display text. */
  formattedValue: unknown;
  /** The row object. */
  row: any;
  /** The column's definition, or undefined for a column the grid generated. */
  colDef: LatticeDataGridColDef | undefined;
  /** Always `'view'`: the callbacks fire outside an edit. */
  cellMode: 'view';
  /** Always false; focus is not reported. */
  hasFocus: boolean;
  /** Always -1. */
  tabIndex: number;
  /** The `apiRef` methods, on `renderCell` only. */
  api?: LatticeDataGridApi;
}

/** What `onRowClick` and `onRowEditStop` receive, MUI's shape. */
export interface LatticeDataGridRowParams {
  /** The row's MUI id. */
  id: unknown;
  /** The row object. */
  row: any;
  /** Every column definition. */
  columns: LatticeDataGridColDef[];
  /** The field the edit stopped on, on `onRowEditStop` only. */
  field?: string;
}

/** The second argument MUI's `on*Change` callbacks receive. */
export interface LatticeDataGridCallbackDetails {
  /** The `apiRef` methods. */
  api: LatticeDataGridApi;
}

/** One sort item, MUI's shape. */
export interface LatticeDataGridSortItem {
  /** The column field. */
  field: string;
  /** The direction; an item with no direction is dropped. */
  sort: 'asc' | 'desc' | null | undefined;
}

/** One filter item, MUI's shape. */
export interface LatticeDataGridFilterItem {
  /** An id for the item; kept for the host, not read. */
  id?: number | string;
  /** The column field. */
  field: string;
  /**
   * The MUI operator. Every free-tier operator translates; an operator that
   * does not makes the whole model refused, never partly applied.
   */
  operator: string;
  /** The operand. An item with no operand is skipped, except `isEmpty`/`isNotEmpty`. */
  value?: unknown;
}

/** The filter model, MUI's shape. */
export interface LatticeDataGridFilterModel {
  /** The conditions. */
  items: LatticeDataGridFilterItem[];
  /** How the items combine; `'and'` by default. */
  logicOperator?: 'and' | 'or';
  /** Quick-filter words: every word must match somewhere in the row. */
  quickFilterValues?: unknown[];
  /** `'and'` only: `'or'` has no quick-filter equivalent and refuses the model. */
  quickFilterLogicOperator?: 'and' | 'or';
}

/** The row-selection model, MUI's shape. `'exclude'` is refused by name. */
export interface LatticeDataGridRowSelectionModel {
  /** `'include'`: exactly these rows are selected. */
  type: 'include' | 'exclude';
  /** The selected rows' MUI ids. */
  ids: Set<unknown>;
}

/** The page model, MUI's shape; the page is zero-based. */
export interface LatticeDataGridPaginationModel {
  /** The zero-based page. */
  page: number;
  /** Rows per page. */
  pageSize: number;
}

/**
 * The methods the `apiRef` exposes: the commonly used six, with MUI's
 * signatures. `apiRef.current` is set when the grid is built and cleared
 * when it is destroyed.
 */
export interface LatticeDataGridApi {
  /** The selected rows, keyed by MUI row id. */
  getSelectedRows(): Map<unknown, any>;
  /** Replace the sort model. `onSortModelChange` fires, as in MUI. */
  setSortModel(model: LatticeDataGridSortItem[]): void;
  /** Replace the filter model. `onFilterModelChange` fires once, as in MUI. */
  setFilterModel(model: LatticeDataGridFilterModel): void;
  /**
   * Scroll a row, a column, or a cell into view. The column index counts the
   * checkbox column as 0 when there is one, as MUI's does. Returns false when
   * neither index names anything.
   */
  scrollToIndexes(params: { rowIndex?: number; colIndex?: number }): boolean;
  /**
   * Download the rows as CSV: the selected rows when there are any, otherwise
   * every row the filters pass. `fileName`, `delimiter`, `includeHeaders`,
   * `utf8WithBom`, `fields`, `allColumns` and `escapeFormulas` are mapped;
   * any other option is refused by name.
   */
  exportDataAsCsv(options?: Record<string, unknown>): void;
  /**
   * Merge a partial row into the row with its id, add a row with a new id,
   * or delete one with `_action: 'delete'`. `_action: 'replace'` is refused
   * by name.
   */
  updateRows(updates: Array<Record<string, unknown>>): void;
}

/**
 * What `<LatticeDataGrid>` takes: the MUI X DataGrid props
 * it maps, and nothing else. Every other prop is refused once, by name, as
 * `react:mui-prop-unsupported:<prop>`, and ignored.
 */
export interface LatticeDataGridProps {
  /** The rows, for a memory source. Each needs an `id`, unless `getRowId` says otherwise. */
  rows?: readonly any[];
  /** The column definitions. Hoist or memoise them: a new array rebuilds the columns. */
  columns: readonly LatticeDataGridColDef[];
  /** Read a row's id, when it is not `row.id`. Read at call time, so an inline arrow is fine. */
  getRowId?: (row: any) => string | number;
  /** Show the loading overlay while true. */
  loading?: boolean;
  /** Row density: `'compact'`, `'standard'` or `'comfortable'`. */
  density?: 'compact' | 'standard' | 'comfortable';
  /** A checkbox column, with a select-all box in its heading, and multiple selection. */
  checkboxSelection?: boolean;
  /** A click on a row does not select it; only the checkbox does. */
  disableRowSelectionOnClick?: boolean;
  /** `'cell'` or `'row'` editing; `'row'` is what makes `onRowEditStop` fire. */
  editMode?: 'cell' | 'row';
  /** The sort, applied when its identity changes. */
  sortModel?: LatticeDataGridSortItem[];
  /** Told when the reader or `apiRef` changes the sort; never for the prop's own change. */
  onSortModelChange?: (model: LatticeDataGridSortItem[], details: LatticeDataGridCallbackDetails) => void;
  /** The filter, applied when its identity changes. */
  filterModel?: LatticeDataGridFilterModel;
  /** Told when the reader or `apiRef` changes the filter. */
  onFilterModelChange?: (model: LatticeDataGridFilterModel, details: LatticeDataGridCallbackDetails) => void;
  /** The selected rows, applied when its identity changes. An array of ids is taken too. */
  rowSelectionModel?: LatticeDataGridRowSelectionModel | readonly unknown[];
  /** Told when the selection changes, always with an `'include'` model. */
  onRowSelectionModelChange?: (model: LatticeDataGridRowSelectionModel,
    details: LatticeDataGridCallbackDetails) => void;
  /** `{ [field]: false }` hides a column; applied when its identity changes. */
  columnVisibilityModel?: Record<string, boolean>;
  /** Told when a column is shown or hidden, with every column's visibility. */
  onColumnVisibilityModelChange?: (model: Record<string, boolean>,
    details: LatticeDataGridCallbackDetails) => void;
  /**
   * The page and page size, client-side over a memory source only. Over any
   * other source it is refused by name and the rows are left untouched.
   */
  paginationModel?: LatticeDataGridPaginationModel;
  /** Told when the page or page size changes; memory source only. */
  onPaginationModelChange?: (model: LatticeDataGridPaginationModel,
    details: LatticeDataGridCallbackDetails) => void;
  /** The page sizes the pager offers; `[25, 50, 100]` by default. Memory source only. */
  pageSizeOptions?: ReadonlyArray<number | { value: number; label: string }>;
  /** Told when a row is clicked. */
  onRowClick?: (params: LatticeDataGridRowParams, event: unknown,
    details: LatticeDataGridCallbackDetails) => void;
  /** Told when a cell is clicked. */
  onCellClick?: (params: LatticeDataGridCellParams, event: unknown,
    details: LatticeDataGridCallbackDetails) => void;
  /** Told when a cell is double-clicked. */
  onCellDoubleClick?: (params: LatticeDataGridCellParams, event: unknown,
    details: LatticeDataGridCallbackDetails) => void;
  /** Told when a cell edit ends. The edit has ended; `defaultMuiPrevented` is not read. */
  onCellEditStop?: (params: LatticeDataGridCellParams, event: { defaultMuiPrevented: boolean },
    details: LatticeDataGridCallbackDetails) => void;
  /** Told when a row edit ends, in `editMode="row"`. */
  onRowEditStop?: (params: LatticeDataGridRowParams, event: { defaultMuiPrevented: boolean },
    details: LatticeDataGridCallbackDetails) => void;
  /** Told when a column is resized. */
  onColumnResize?: (params: { colDef: LatticeDataGridColDef | undefined; width: number; element: null },
    event: unknown, details: LatticeDataGridCallbackDetails) => void;
  /** Told when a column is moved. */
  onColumnOrderChange?: (params: { column: LatticeDataGridColDef | undefined; targetIndex: number;
    oldIndex: number }, event: unknown, details: LatticeDataGridCallbackDetails) => void;
  /** Told when a cell enters or leaves edit mode: `{ [id]: { [field]: { mode: 'edit' } } }`. */
  onCellModesModelChange?: (model: Record<string, Record<string, { mode: 'edit' }>>,
    details: LatticeDataGridCallbackDetails) => void;
  /** Told when a row enters or leaves edit mode: `{ [id]: { mode: 'edit' } }`. */
  onRowModesModelChange?: (model: Record<string, { mode: 'edit' }>,
    details: LatticeDataGridCallbackDetails) => void;
  /** Told when the grid's `source` reports an error. */
  onDataSourceError?: (error: unknown) => void;
  /** An object whose `current` is set to the {@link LatticeDataGridApi} while the grid exists. */
  apiRef?: { current: LatticeDataGridApi | null };
  /** Component slots; only `toolbar` is mapped, and it renders when `showToolbar` is true. */
  slots?: { toolbar?: unknown };
  /** Render `slots.toolbar` above the grid. */
  showToolbar?: boolean;
  /**
   * Not an MUI prop: a Lattice `source` for rows that are not in memory. Over
   * one, the three paging props are refused by name.
   */
  source?: SourceConfig | Record<string, unknown>;
  /** Applied to the host element. */
  className?: string;
  /** Applied to the host element, over its flex-column default. */
  style?: Record<string, unknown>;
}

/**
 * Build the MUI X DataGrid-shaped `<LatticeDataGrid>` component. A React-only compatibility layer, by design: it exists
 * for pages migrating off `@mui/x-data-grid`.
 *
 * `ReactDOM` is react-dom's client (anything with `createRoot`), needed only
 * when a `renderCell` returns a React element. The ref is the host element,
 * as MUI's is.
 */
export function createLatticeDataGrid(deps: {
  React: unknown;
  ReactDOM?: unknown;
  createGrid: (el: unknown, config: GridConfig) => Grid;
}): (props: LatticeDataGridProps & { ref?: unknown }) => unknown;

/**
 * The framework-free half of `<LatticeDataGrid>`: builds the grid from
 * MUI-shaped props, routes grid events to the MUI callbacks, and holds the
 * `apiRef` methods. `update` pushes changed props into the live grid.
 */
export function createDataGridController(opts: {
  createGrid: (el: unknown, config: GridConfig) => Grid;
  element: unknown;
  props?: LatticeDataGridProps;
  mountCell?: ((el: unknown, node: unknown) => { render(node: unknown): void; unmount(): void }) | null;
  isElement?: (value: unknown) => boolean;
}): {
  grid: Grid;
  api: LatticeDataGridApi;
  update: (next: LatticeDataGridProps) => void;
  destroy: () => void;
};

/** Every grid event, as the prop name a React caller writes. */
export const EVENT_NAMES: readonly string[];
export function handlerName(event: string): string;
/**
 * The Material 3 preset's live route, re-exported: takes
 * no React dependency at all, a pure function over a plain theme-shaped
 * object. See `lattice-grid/modules/presets` for the full declaration.
 */
export function themeFromMui(theme: PresetsMuiTheme): PresetsMuiThemeResult;
/** Every event each non-grid viewer emits, keyed by viewer name. */
export const VIEWER_EVENTS: Readonly<Record<string, readonly string[]>>;
/** The props each viewer can take live, and the instance call each becomes. */
export const VIEWER_APPLY: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
/** `card:move` → `onCardMove`, for a viewer event. */
export function viewerHandlerName(event: string): string;
/**
 * The framework-free viewer lifecycle every adapter drives an instance
 * through: mount once, push changed props into the live instance, destroy.
 */
export function createViewerController(opts: {
  viewer: string;
  mount: (el: unknown, config: Record<string, unknown>) => unknown;
  element: unknown;
  props?: Record<string, unknown>;
  name?: string;
}): {
  instance: unknown;
  update: (next: Record<string, unknown>) => void;
  destroy: () => void;
};
/** The name a grid publishes itself under when the host does not choose one. */
export const DEFAULT_GRID_NAME: string;
export default createLatticeGrid;
