import * as i0 from '@angular/core';
import { InjectionToken, EnvironmentProviders, Signal, OnChanges, OnDestroy, ElementRef, EventEmitter, NgZone, TemplateRef, QueryList, Provider } from '@angular/core';
import { createGrid, Grid, GridConfig, SortEntry, FilterSet, RowChange, GridEvent } from '@toclocoinc/lattice-grid';
import { createChart } from '@toclocoinc/lattice-grid/modules/charts';
import { createDataRouter } from '@toclocoinc/lattice-grid/modules/data-router';
import { createGantt } from '@toclocoinc/lattice-grid/modules/gantt';
import { createKanban } from '@toclocoinc/lattice-grid/modules/kanban';
import { createKPI } from '@toclocoinc/lattice-grid/modules/kpi';
import { createLayout } from '@toclocoinc/lattice-grid/modules/layout';
import { createTabs } from '@toclocoinc/lattice-grid/modules/tabs';

/**
 * The Lattice factories, handed to Angular through dependency injection.
 *
 * Every component in this package is built against a factory it does not
 * import: `createGrid`, `createKPI`, `createChart` and the rest arrive in one
 * provider call at bootstrap. That is not ceremony, it is the module rule this
 * product ships under — each optional viewer is its own bundle, and a page that
 * only shows a grid must not download the board, the plan and eighteen chart
 * types because one component in a library mentioned them. An `import` inside
 * `<lattice-kpi>` would do exactly that, since this package is one fesm bundle.
 *
 * So the host imports what it uses, once:
 *
 *     import { createGrid } from '@toclocoinc/lattice-grid';
 *     import { createKPI } from '@toclocoinc/lattice-grid/modules/kpi';
 *     import { provideLattice } from '@toclocoinc/lattice-grid/angular';
 *
 *     bootstrapApplication(App, {
 *       providers: [provideLattice({ createGrid, createKPI })],
 *     });
 *
 * It is the same injection the React, Vue and Svelte adapters make; Angular
 * simply has a place to put it.
 */

/** The grid factory, exactly as `@toclocoinc/lattice-grid` exports it. */
type GridFactory = typeof createGrid;
/** The KPI panel factory, from `@toclocoinc/lattice-grid/modules/kpi`. */
type KPIFactory = typeof createKPI;
/** The chart factory, from `@toclocoinc/lattice-grid/modules/charts`. */
type ChartFactory = typeof createChart;
/** The board factory, from `@toclocoinc/lattice-grid/modules/kanban`. */
type KanbanFactory = typeof createKanban;
/** The plan factory, from `@toclocoinc/lattice-grid/modules/gantt`. */
type GanttFactory = typeof createGantt;
/** The layout factory, from `@toclocoinc/lattice-grid/modules/layout`. */
type LayoutFactory = typeof createLayout;
/** The tab-strip factory, from `@toclocoinc/lattice-grid/modules/tabs`. */
type TabsFactory = typeof createTabs;
/** The Data Router factory, from `@toclocoinc/lattice-grid/modules/data-router`. */
type DataRouterFactory = typeof createDataRouter;
/**
 * The live viewers and their configuration objects.
 *
 * Each is an interface that *extends* the type the grid's own declarations give
 * the factory, rather than an alias for it. The two say the same thing, but an
 * alias cannot be written into this package's `.d.ts`: the module declarations
 * do not export the interfaces behind `createKPI` and friends, so TypeScript
 * has no name to emit for them. Extending gives the shape a name of its own,
 * here, without restating a single member.
 */
/** The live KPI panel. */
interface KPI extends ReturnType<KPIFactory> {
}
/** The live chart. */
interface Chart extends ReturnType<ChartFactory> {
}
/** The live board. */
interface Kanban extends ReturnType<KanbanFactory> {
}
/** The live plan. */
interface Gantt extends ReturnType<GanttFactory> {
}
/** The live layout. */
interface Layout extends ReturnType<LayoutFactory> {
}
/** The live tab strip. */
interface Tabs extends ReturnType<TabsFactory> {
}
/** The live Data Router. */
interface DataRouter extends ReturnType<DataRouterFactory> {
}
/** The KPI panel's configuration object. */
interface KPIConfig extends NonNullable<Parameters<KPIFactory>[1]> {
}
/** What `createChart` takes, less the two keys this package supplies. */
type ChartFactorySpec = Omit<Parameters<ChartFactory>[0], 'container' | 'grid'>;
/**
 * A chart specification, less `container` and `grid`: the component supplies
 * the first from its own element and the second from `[grid]` or the registry.
 */
interface ChartConfig extends ChartFactorySpec {
}
/** The board's configuration object. */
interface KanbanConfig extends NonNullable<Parameters<KanbanFactory>[1]> {
}
/** What `createGantt` takes, less the keys this package supplies. */
type GanttFactoryOptions = Omit<NonNullable<Parameters<GanttFactory>[0]>, 'element' | 'grid'>;
/** The plan's options, less the `element` this package supplies. */
interface GanttConfig extends GanttFactoryOptions {
}
/** The layout's configuration object. */
interface LayoutConfig extends NonNullable<Parameters<LayoutFactory>[1]> {
}
/** What `createTabs` takes, named so an interface can extend it. */
type TabsFactoryConfig = Parameters<TabsFactory>[1];
/** The tab strip's configuration object. */
interface TabsConfig extends TabsFactoryConfig {
}
/** The Data Router's options object. */
interface DataRouterOptions extends NonNullable<Parameters<DataRouterFactory>[0]> {
}
/**
 * Every factory this package can build a component from.
 *
 * All optional: provide the ones the application uses. A component whose
 * factory was not provided throws a `[lattice]` message naming the import and
 * the provider call that fixes it, rather than failing somewhere inside
 * Angular.
 */
interface LatticeFactories {
    /** `createGrid`, for `<lattice-grid>` and `[latticeGrid]`. */
    createGrid?: GridFactory;
    /** `createKPI`, for `<lattice-kpi>`. */
    createKPI?: KPIFactory;
    /** `createChart`, for `<lattice-chart>`. */
    createChart?: ChartFactory;
    /** `createKanban`, for `<lattice-kanban>`. */
    createKanban?: KanbanFactory;
    /** `createGantt`, for `<lattice-gantt>`. */
    createGantt?: GanttFactory;
    /** `createLayout`, for `<lattice-layout>`. */
    createLayout?: LayoutFactory;
    /** `createTabs`, for `<lattice-tabs>`. */
    createTabs?: TabsFactory;
    /** `createDataRouter`, for `provideLatticeRouter()`. */
    createDataRouter?: DataRouterFactory;
}
/** The factories every Lattice component resolves through. */
declare const LATTICE_FACTORIES: InjectionToken<LatticeFactories>;
/**
 * Provide the Lattice factories to an application or a route.
 *
 * @param factories the factories this application uses
 * @returns providers for `bootstrapApplication` or a route's `providers`
 */
declare function provideLattice(factories: LatticeFactories): EnvironmentProviders;
/**
 * The factory a component needs, or a message naming the two lines that fix it.
 *
 * @param factories whatever was provided, possibly nothing at all
 * @param key which factory this component needs
 * @param specifier the import path that factory comes from
 * @param element the element the message should name
 * @returns the factory
 * @throws TypeError when the factory was not provided
 */
declare function requireFactory<K extends keyof LatticeFactories>(factories: LatticeFactories | null, key: K, specifier: string, element: string): NonNullable<LatticeFactories[K]>;

/**
 * Where a grid publishes itself so the viewers around it can find it.
 *
 * A KPI panel and a chart are built *against a grid instance*, and that
 * instance does not exist until the grid component has rendered. A template
 * reference cannot bridge that: `#grid` is resolved after the view that uses it
 * is created, so a sibling `<lattice-kpi [grid]="grid.grid">` reads `null` on
 * the pass that matters and nothing tells it when the grid arrives.
 *
 * So the grid publishes itself into this service, which holds a signal per
 * name. A viewer reads the signal, and the moment the grid appears the viewer
 * mounts itself against it. This is the Angular equivalent of React's
 * `<LatticeGridProvider>` and Vue's `provide`/`inject` — the same registry, by
 * the framework's own means.
 *
 * It is `providedIn: 'root'`, so a page with one grid configures nothing. Put
 * `LatticeGridRegistry` in a component's own `providers` to scope a registry to
 * that component's subtree, which is what a page that shows the same grid name
 * twice (a dialog over a page, a split view) needs.
 */

/** The name a grid publishes itself under when the host does not choose one. */
declare const DEFAULT_GRID_NAME = "default";
declare class LatticeGridRegistry {
    /** Every published grid, by name. Replaced rather than mutated, so readers see one change. */
    private readonly published;
    /** One memoised signal per name, so two readers of `'default'` share a computation. */
    private readonly byName;
    /** Every grid published into this registry, by name. */
    readonly grids: Signal<Readonly<Record<string, Grid | null>>>;
    /**
     * Publish a grid, or withdraw it.
     *
     * Called by `<lattice-grid>` when it mounts and again — with `null` — when it
     * is destroyed, so a viewer bound to a grid that has gone is told rather than
     * left holding a destroyed instance.
     *
     * @param name the name the grid is published under
     * @param grid the live grid, or null to withdraw
     * @returns nothing
     */
    publish(name: string, grid: Grid | null): void;
    /**
     * The grid published under a name, as a signal that updates when it arrives
     * or goes.
     *
     * @param name which grid; the default name when omitted
     * @returns a signal of the grid, or of null while there is none
     */
    grid(name?: string): Signal<Grid | null>;
    /**
     * The grid published under a name, read once without subscribing.
     * @param name which grid; the default name when omitted
     * @returns the grid, or null
     */
    snapshot(name?: string): Grid | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeGridRegistry, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}

/**
 * The grid's configuration, with the row type carried through.
 *
 * The grid's own `GridConfig` predates this package and types its rows as
 * `any[]`; this narrows that one key so an application's row interface reaches
 * the template, the predicates and the keyed diff.
 */
type LatticeGridConfig<TRow> = Omit<GridConfig, 'rows'> & {
    /** The rows the grid holds. */
    rows?: readonly TRow[];
};
/** A keyed change handed to `grid.rows.apply()`. */
type LatticeRowChange<TRow> = Omit<RowChange, 'add' | 'update'> & {
    /** Rows to add. */
    add?: readonly TRow[];
    /** Rows to update, matched by the grid's `rowKey`. */
    update?: readonly TRow[];
};
/** Named predicates, composed with whatever filter the reader has set. */
type LatticePredicates<TRow> = Record<string, ((row: TRow) => boolean) | null>;
/** The quick filter: the text, or the text with a matching mode. */
type LatticeQuickFilter = string | {
    text: string;
    mode?: string;
};
/**
 * Everything both the component and the directive do; neither adds behaviour
 * of its own, only a selector.
 */
declare abstract class LatticeGridBase<TRow = unknown> implements OnChanges, OnDestroy {
    /** The host element the grid is built into. */
    protected readonly elementRef: ElementRef<HTMLElement>;
    /** Angular's zone, or its no-op under zoneless change detection. */
    private readonly zone;
    /** Whether this is a browser; nothing is built on the server. */
    private readonly isBrowser;
    /** The factories the application provided. */
    private readonly factories;
    /** Where this grid publishes itself for the viewers around it. */
    private readonly registry;
    /** The Data Router this grid attaches to, when the host provided one. */
    private readonly router;
    /** The injector, so `afterNextRender` can be re-armed after a destroy. */
    private readonly injector;
    /** The live controller, or null before the first render and after destroy. */
    private controller;
    /** Set in `ngOnDestroy`, so a pending render callback does not build a grid. */
    private torn;
    /** The name this grid published itself under, so it withdraws under the same one. */
    private publishedAs;
    /** The `rowUpdates` object already applied, compared by identity. */
    private appliedRowUpdates;
    /** The `predicates` object already applied, compared by identity. */
    private appliedPredicates;
    /** One forwarder per grid event, built once and read by the controller. */
    private readonly handlers;
    /** The grid's configuration. Every key the vanilla `createGrid` takes. */
    config?: LatticeGridConfig<TRow>;
    /** The sort model. Applied through `grid.sort.set`. */
    sort?: SortEntry[];
    /** The filter tree. Applied through `grid.filters.set`, replacing what is there. */
    filters?: FilterSet | null;
    /** The quick filter text, or `{ text, mode }`. */
    quickFilter?: LatticeQuickFilter;
    /** The selected row keys. Applied through `grid.selection.set`. */
    selectedKeys?: string[];
    /**
     * A keyed diff, applied through `grid.rows.apply()` when the *object* changes.
     *
     * A feed hands over a new change object per batch, so identity is the right
     * trigger; re-applying the same object would re-land rows the grid has.
     */
    rowUpdates?: LatticeRowChange<TRow>;
    /**
     * Named predicates, applied through `grid.filters.where()` and diffed by name.
     *
     * These *compose* with whatever filter the reader set in the tool panel,
     * which is exactly what `filters` cannot do. A name that has gone from the
     * object is removed rather than left registered, so a "notable only" toggle
     * turns off.
     */
    predicates?: LatticePredicates<TRow>;
    /** The name this grid publishes itself under for grid-bound viewers. */
    name?: string;
    /** The Data Router route to attach to, when a router is provided. */
    route?: string;
    /** Options for `router.attach()`. */
    routeOptions?: Record<string, unknown>;
    /** The live grid, the moment it exists. The instance, not a copy. */
    readonly gridReady: EventEmitter<Grid>;
    /** Fired as the grid is torn down, before it is destroyed. */
    readonly gridDestroyed: EventEmitter<void>;
    /** The grid's `ready` event. */
    readonly ready: EventEmitter<GridEvent>;
    /** The grid's `destroy` event. */
    readonly destroy: EventEmitter<GridEvent>;
    /** The grid's `render:first` event. */
    readonly renderFirst: EventEmitter<GridEvent>;
    /** The grid's `render:done` event. */
    readonly renderDone: EventEmitter<GridEvent>;
    /** The grid's `config:changed` event. */
    readonly configChanged: EventEmitter<GridEvent>;
    /** The grid's `licence:changed` event. */
    readonly licenceChanged: EventEmitter<GridEvent>;
    /** The grid's `model:changed` event. */
    readonly modelChanged: EventEmitter<GridEvent>;
    /** The grid's `rows:changed` event. */
    readonly rowsChanged: EventEmitter<GridEvent>;
    /** The grid's `rows:queued` event. */
    readonly rowsQueued: EventEmitter<GridEvent>;
    /** The grid's `rows:deferred` event. */
    readonly rowsDeferred: EventEmitter<GridEvent>;
    /** The grid's `rows:paused` event. */
    readonly rowsPaused: EventEmitter<GridEvent>;
    /** The grid's `rows:resumed` event. */
    readonly rowsResumed: EventEmitter<GridEvent>;
    /** The grid's `row:received` event. */
    readonly rowReceived: EventEmitter<GridEvent>;
    /** The grid's `row:sent` event. */
    readonly rowSent: EventEmitter<GridEvent>;
    /** The grid's `row:copied` event. */
    readonly rowCopied: EventEmitter<GridEvent>;
    /** The grid's `row:moved` event. */
    readonly rowMoved: EventEmitter<GridEvent>;
    /** The grid's `source:error` event. */
    readonly sourceError: EventEmitter<GridEvent>;
    /** The grid's `source:total` event. */
    readonly sourceTotal: EventEmitter<GridEvent>;
    /** The grid's `stream:chunk` event. */
    readonly streamChunk: EventEmitter<GridEvent>;
    /** The grid's `stream:end` event. */
    readonly streamEnd: EventEmitter<GridEvent>;
    /** The grid's `stream:evicted` event. */
    readonly streamEvicted: EventEmitter<GridEvent>;
    /** The grid's `rowDrag:started` event. */
    readonly rowDragStarted: EventEmitter<GridEvent>;
    /** The grid's `rowDrag:moved` event. */
    readonly rowDragMoved: EventEmitter<GridEvent>;
    /** The grid's `rowDrag:left` event. */
    readonly rowDragLeft: EventEmitter<GridEvent>;
    /** The grid's `rowDrag:ended` event. */
    readonly rowDragEnded: EventEmitter<GridEvent>;
    /** The grid's `cell:changed` event. */
    readonly cellChanged: EventEmitter<GridEvent>;
    /** The grid's `cell:pending` event. */
    readonly cellPending: EventEmitter<GridEvent>;
    /** The grid's `cell:confirmed` event. */
    readonly cellConfirmed: EventEmitter<GridEvent>;
    /** The grid's `cell:reverted` event. */
    readonly cellReverted: EventEmitter<GridEvent>;
    /** The grid's `cell:conflict` event. */
    readonly cellConflict: EventEmitter<GridEvent>;
    /** The grid's `cell:clicked` event. */
    readonly cellClicked: EventEmitter<GridEvent>;
    /** The grid's `cell:dblclicked` event. */
    readonly cellDblclicked: EventEmitter<GridEvent>;
    /** The grid's `cell:contextmenu` event. */
    readonly cellContextmenu: EventEmitter<GridEvent>;
    /** The grid's `cell:mouseover` event. */
    readonly cellMouseover: EventEmitter<GridEvent>;
    /** The grid's `cell:mouseout` event. */
    readonly cellMouseout: EventEmitter<GridEvent>;
    /** The grid's `cell:mousedown` event. */
    readonly cellMousedown: EventEmitter<GridEvent>;
    /** The grid's `cell:mouseup` event. */
    readonly cellMouseup: EventEmitter<GridEvent>;
    /** The grid's `cell:edit:start` event. */
    readonly cellEditStart: EventEmitter<GridEvent>;
    /** The grid's `cell:edit:end` event. */
    readonly cellEditEnd: EventEmitter<GridEvent>;
    /** The grid's `row:edit:start` event. */
    readonly rowEditStart: EventEmitter<GridEvent>;
    /** The grid's `row:edit:end` event. */
    readonly rowEditEnd: EventEmitter<GridEvent>;
    /** The grid's `row:clicked` event. */
    readonly rowClicked: EventEmitter<GridEvent>;
    /** The grid's `row:dblclicked` event. */
    readonly rowDblclicked: EventEmitter<GridEvent>;
    /** The grid's `row:pending` event. */
    readonly rowPending: EventEmitter<GridEvent>;
    /** The grid's `row:confirmed` event. */
    readonly rowConfirmed: EventEmitter<GridEvent>;
    /** The grid's `row:reverted` event. */
    readonly rowReverted: EventEmitter<GridEvent>;
    /** The grid's `row:conflict` event. */
    readonly rowConflict: EventEmitter<GridEvent>;
    /** The grid's `form:opened` event. */
    readonly formOpened: EventEmitter<GridEvent>;
    /** The grid's `form:closed` event. */
    readonly formClosed: EventEmitter<GridEvent>;
    /** The grid's `form:saved` event. */
    readonly formSaved: EventEmitter<GridEvent>;
    /** The grid's `form:error` event. */
    readonly formError: EventEmitter<GridEvent>;
    /** The grid's `sort:changed` event. */
    readonly sortChanged: EventEmitter<GridEvent>;
    /** The grid's `filter:changed` event. */
    readonly filterChanged: EventEmitter<GridEvent>;
    /** The grid's `group:toggled` event. */
    readonly groupToggled: EventEmitter<GridEvent>;
    /** The grid's `facet:computed` event. */
    readonly facetComputed: EventEmitter<GridEvent>;
    /** The grid's `facet:filtered` event. */
    readonly facetFiltered: EventEmitter<GridEvent>;
    /** The grid's `facet:expanded` event. */
    readonly facetExpanded: EventEmitter<GridEvent>;
    /** The grid's `facet:failed` event. */
    readonly facetFailed: EventEmitter<GridEvent>;
    /** The grid's `column:moved` event. */
    readonly columnMoved: EventEmitter<GridEvent>;
    /** The grid's `column:resized` event. */
    readonly columnResized: EventEmitter<GridEvent>;
    /** The grid's `column:visible` event. */
    readonly columnVisible: EventEmitter<GridEvent>;
    /** The grid's `column:pinned` event. */
    readonly columnPinned: EventEmitter<GridEvent>;
    /** The grid's `column:grouped` event. */
    readonly columnGrouped: EventEmitter<GridEvent>;
    /** The grid's `column:pivoted` event. */
    readonly columnPivoted: EventEmitter<GridEvent>;
    /** The grid's `column:filter:open` event. */
    readonly columnFilterOpen: EventEmitter<GridEvent>;
    /** The grid's `column:profile:open` event. */
    readonly columnProfileOpen: EventEmitter<GridEvent>;
    /** The grid's `column:menu:open` event. */
    readonly columnMenuOpen: EventEmitter<GridEvent>;
    /** The grid's `columns:changed` event. */
    readonly columnsChanged: EventEmitter<GridEvent>;
    /** The grid's `columns:tagged` event. */
    readonly columnsTagged: EventEmitter<GridEvent>;
    /** The grid's `columngroup:changed` event. */
    readonly columngroupChanged: EventEmitter<GridEvent>;
    /** The grid's `header:contextmenu` event. */
    readonly headerContextmenu: EventEmitter<GridEvent>;
    /** The grid's `pivot:drill` event. */
    readonly pivotDrill: EventEmitter<GridEvent>;
    /** The grid's `selection:changed` event. */
    readonly selectionChanged: EventEmitter<GridEvent>;
    /** The grid's `range:changed` event. */
    readonly rangeChanged: EventEmitter<GridEvent>;
    /** The grid's `clipboard:copy` event. */
    readonly clipboardCopy: EventEmitter<GridEvent>;
    /** The grid's `page:changed` event. */
    readonly pageChanged: EventEmitter<GridEvent>;
    /** The grid's `scroll` event. */
    readonly scroll: EventEmitter<GridEvent>;
    /** The grid's `scroll:end` event. */
    readonly scrollEnd: EventEmitter<GridEvent>;
    /** The grid's `size:changed` event. */
    readonly sizeChanged: EventEmitter<GridEvent>;
    /** The grid's `detail:toggled` event. */
    readonly detailToggled: EventEmitter<GridEvent>;
    /** The grid's `toolpanel:focus` event. */
    readonly toolpanelFocus: EventEmitter<GridEvent>;
    /** The grid's `highlight:changed` event. */
    readonly highlightChanged: EventEmitter<GridEvent>;
    /** The grid's `find:changed` event. */
    readonly findChanged: EventEmitter<GridEvent>;
    /** The grid's `tree:loading` event. */
    readonly treeLoading: EventEmitter<GridEvent>;
    /** The grid's `tree:loaded` event. */
    readonly treeLoaded: EventEmitter<GridEvent>;
    /** The grid's `tree:loadFailed` event. */
    readonly treeLoadFailed: EventEmitter<GridEvent>;
    /** The grid's `tree:loadAborted` event. */
    readonly treeLoadAborted: EventEmitter<GridEvent>;
    /** The grid's `state:changed` event. */
    readonly stateChanged: EventEmitter<GridEvent>;
    /** The grid's `state:reset` event. */
    readonly stateReset: EventEmitter<GridEvent>;
    /** The grid's `history:changed` event. */
    readonly historyChanged: EventEmitter<GridEvent>;
    /** The grid's `history:applied` event. */
    readonly historyApplied: EventEmitter<GridEvent>;
    /** The grid's `views:changed` event. */
    readonly viewsChanged: EventEmitter<GridEvent>;
    /** The grid's `view:applied` event. */
    readonly viewApplied: EventEmitter<GridEvent>;
    /** The grid's `view:saved` event. */
    readonly viewSaved: EventEmitter<GridEvent>;
    /** The grid's `view:removed` event. */
    readonly viewRemoved: EventEmitter<GridEvent>;
    /** The grid's `view:renamed` event. */
    readonly viewRenamed: EventEmitter<GridEvent>;
    /** The grid's `view:default` event. */
    readonly viewDefault: EventEmitter<GridEvent>;
    /** The grid's `formatting:changed` event. */
    readonly formattingChanged: EventEmitter<GridEvent>;
    /** The grid's `redaction:changed` event. */
    readonly redactionChanged: EventEmitter<GridEvent>;
    /** The grid's `permissions:changed` event. */
    readonly permissionsChanged: EventEmitter<GridEvent>;
    /** The grid's `presentation:changed` event. */
    readonly presentationChanged: EventEmitter<GridEvent>;
    /** The grid's `presentation:started` event. */
    readonly presentationStarted: EventEmitter<GridEvent>;
    /** The grid's `presentation:ended` event. */
    readonly presentationEnded: EventEmitter<GridEvent>;
    /** The grid's `presentation:view` event. */
    readonly presentationView: EventEmitter<GridEvent>;
    /** The grid's `presentation:scale` event. */
    readonly presentationScale: EventEmitter<GridEvent>;
    /** The grid's `presentation:spotlight` event. */
    readonly presentationSpotlight: EventEmitter<GridEvent>;
    /** The grid's `presentation:captured` event. */
    readonly presentationCaptured: EventEmitter<GridEvent>;
    /** The grid's `comment:added` event. */
    readonly commentAdded: EventEmitter<GridEvent>;
    /** The grid's `comment:edited` event. */
    readonly commentEdited: EventEmitter<GridEvent>;
    /** The grid's `comment:deleted` event. */
    readonly commentDeleted: EventEmitter<GridEvent>;
    /** The grid's `comment:failed` event. */
    readonly commentFailed: EventEmitter<GridEvent>;
    /** The grid's `comment:resolved` event. */
    readonly commentResolved: EventEmitter<GridEvent>;
    /** The grid's `comment:unresolved` event. */
    readonly commentUnresolved: EventEmitter<GridEvent>;
    /** The grid's `comment:threadOpened` event. */
    readonly commentThreadOpened: EventEmitter<GridEvent>;
    /** The grid's `comment:threadClosed` event. */
    readonly commentThreadClosed: EventEmitter<GridEvent>;
    /** The grid's `comment:indexLoaded` event. */
    readonly commentIndexLoaded: EventEmitter<GridEvent>;
    /** The grid's `presence:published` event. */
    readonly presencePublished: EventEmitter<GridEvent>;
    /** The grid's `presence:joined` event. */
    readonly presenceJoined: EventEmitter<GridEvent>;
    /** The grid's `presence:updated` event. */
    readonly presenceUpdated: EventEmitter<GridEvent>;
    /** The grid's `presence:left` event. */
    readonly presenceLeft: EventEmitter<GridEvent>;
    /** The grid's `presence:failed` event. */
    readonly presenceFailed: EventEmitter<GridEvent>;
    /** The grid's `presence:lockRefused` event. */
    readonly presenceLockRefused: EventEmitter<GridEvent>;
    /** The grid's `diff:changed` event. */
    readonly diffChanged: EventEmitter<GridEvent>;
    /** The grid's `diff:swapped` event. */
    readonly diffSwapped: EventEmitter<GridEvent>;
    /** The grid's `timeline:attached` event. */
    readonly timelineAttached: EventEmitter<GridEvent>;
    /** The grid's `timeline:detached` event. */
    readonly timelineDetached: EventEmitter<GridEvent>;
    /** The grid's `timeline:seek` event. */
    readonly timelineSeek: EventEmitter<GridEvent>;
    /** The grid's `timeline:seeking` event. */
    readonly timelineSeeking: EventEmitter<GridEvent>;
    /** The grid's `annotation:changed` event. */
    readonly annotationChanged: EventEmitter<GridEvent>;
    /** The grid's `validation:failed` event. */
    readonly validationFailed: EventEmitter<GridEvent>;
    /** The grid's `validation:cleared` event. */
    readonly validationCleared: EventEmitter<GridEvent>;
    /** The grid's `export:progress` event. */
    readonly exportProgress: EventEmitter<GridEvent>;
    /** The grid's `export:request` event. */
    readonly exportRequest: EventEmitter<GridEvent>;
    /** The grid's `export:done` event. */
    readonly exportDone: EventEmitter<GridEvent>;
    /** The grid's `shortcuts:opened` event. */
    readonly shortcutsOpened: EventEmitter<GridEvent>;
    /** The grid's `shortcuts:closed` event. */
    readonly shortcutsClosed: EventEmitter<GridEvent>;
    /** The grid's `print:before` event. */
    readonly printBefore: EventEmitter<GridEvent>;
    /** The grid's `print:after` event. */
    readonly printAfter: EventEmitter<GridEvent>;
    /** The grid's `beforeEdit` event. */
    readonly beforeEdit: EventEmitter<GridEvent>;
    /** The grid's `beforeSort` event. */
    readonly beforeSort: EventEmitter<GridEvent>;
    /** The grid's `beforeFilter` event. */
    readonly beforeFilter: EventEmitter<GridEvent>;
    /** The grid's `beforeColumnMove` event. */
    readonly beforeColumnMove: EventEmitter<GridEvent>;
    /** The grid's `beforeColumnResize` event. */
    readonly beforeColumnResize: EventEmitter<GridEvent>;
    /** The grid's `beforeColumnHide` event. */
    readonly beforeColumnHide: EventEmitter<GridEvent>;
    /** The grid's `beforeSelect` event. */
    readonly beforeSelect: EventEmitter<GridEvent>;
    /** The grid's `beforeRowAdd` event. */
    readonly beforeRowAdd: EventEmitter<GridEvent>;
    /** The grid's `beforeDelete` event. */
    readonly beforeDelete: EventEmitter<GridEvent>;
    /** The grid's `beforeRowMove` event. */
    readonly beforeRowMove: EventEmitter<GridEvent>;
    /** The grid's `beforeGroup` event. */
    readonly beforeGroup: EventEmitter<GridEvent>;
    /** The grid's `beforeRowReceive` event. */
    readonly beforeRowReceive: EventEmitter<GridEvent>;
    /** The grid's `edit:cancelled` event. */
    readonly editCancelled: EventEmitter<GridEvent>;
    /** The grid's `sort:cancelled` event. */
    readonly sortCancelled: EventEmitter<GridEvent>;
    /** The grid's `filter:cancelled` event. */
    readonly filterCancelled: EventEmitter<GridEvent>;
    /** The grid's `columnMove:cancelled` event. */
    readonly columnMoveCancelled: EventEmitter<GridEvent>;
    /** The grid's `columnResize:cancelled` event. */
    readonly columnResizeCancelled: EventEmitter<GridEvent>;
    /** The grid's `columnHide:cancelled` event. */
    readonly columnHideCancelled: EventEmitter<GridEvent>;
    /** The grid's `selection:cancelled` event. */
    readonly selectionCancelled: EventEmitter<GridEvent>;
    /** The grid's `rowAdd:cancelled` event. */
    readonly rowAddCancelled: EventEmitter<GridEvent>;
    /** The grid's `delete:cancelled` event. */
    readonly deleteCancelled: EventEmitter<GridEvent>;
    /** The grid's `rowMove:cancelled` event. */
    readonly rowMoveCancelled: EventEmitter<GridEvent>;
    /** The grid's `group:cancelled` event. */
    readonly groupCancelled: EventEmitter<GridEvent>;
    /** The grid's `rowReceive:cancelled` event. */
    readonly rowReceiveCancelled: EventEmitter<GridEvent>;
    /** Wire one forwarder per grid event and arm the build for the next render. */
    constructor();
    /** The live grid, or null before the first render and after destroy. */
    get grid(): Grid | null;
    /**
     * The props the shared controller is driven with: the configuration object,
     * whichever imperative inputs are set, and the event forwarders.
     * @returns the props bag
     */
    private props;
    /**
     * Build the grid, publish it, attach it to the router and announce it.
     *
     * Runs once, after the first render, and never again: the guard is the
     * controller itself rather than a module-level flag, so a genuine remount
     * (an `@if` that closes and opens again builds a *new component*) still
     * builds a new grid.
     *
     * @returns nothing
     */
    private build;
    /**
     * Push changed inputs into the live grid.
     *
     * Fires before the first render too, when there is no grid yet; the initial
     * values are read by {@link build} instead, so nothing is applied twice and
     * nothing is lost.
     *
     * @returns nothing
     */
    ngOnChanges(): void;
    /**
     * Register what is new, and remove by name whatever has gone.
     * @param grid the grid to apply them to
     * @param next the predicates now
     * @param previous the predicates before
     * @returns nothing
     */
    private applyPredicates;
    /**
     * Withdraw the grid, detach it from the router and destroy it — in that
     * order, so the router never holds a dead grid.
     * @returns nothing
     */
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeGridBase<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LatticeGridBase<any>, never, never, { "config": { "alias": "config"; "required": false; }; "sort": { "alias": "sort"; "required": false; }; "filters": { "alias": "filters"; "required": false; }; "quickFilter": { "alias": "quickFilter"; "required": false; }; "selectedKeys": { "alias": "selectedKeys"; "required": false; }; "rowUpdates": { "alias": "rowUpdates"; "required": false; }; "predicates": { "alias": "predicates"; "required": false; }; "name": { "alias": "name"; "required": false; }; "route": { "alias": "route"; "required": false; }; "routeOptions": { "alias": "routeOptions"; "required": false; }; }, { "gridReady": "grid-ready"; "gridDestroyed": "grid-destroyed"; "ready": "ready"; "destroy": "destroy"; "renderFirst": "render-first"; "renderDone": "render-done"; "configChanged": "config-changed"; "licenceChanged": "licence-changed"; "modelChanged": "model-changed"; "rowsChanged": "rows-changed"; "rowsQueued": "rows-queued"; "rowsDeferred": "rows-deferred"; "rowsPaused": "rows-paused"; "rowsResumed": "rows-resumed"; "rowReceived": "row-received"; "rowSent": "row-sent"; "rowCopied": "row-copied"; "rowMoved": "row-moved"; "sourceError": "source-error"; "sourceTotal": "source-total"; "streamChunk": "stream-chunk"; "streamEnd": "stream-end"; "streamEvicted": "stream-evicted"; "rowDragStarted": "rowDrag-started"; "rowDragMoved": "rowDrag-moved"; "rowDragLeft": "rowDrag-left"; "rowDragEnded": "rowDrag-ended"; "cellChanged": "cell-changed"; "cellPending": "cell-pending"; "cellConfirmed": "cell-confirmed"; "cellReverted": "cell-reverted"; "cellConflict": "cell-conflict"; "cellClicked": "cell-clicked"; "cellDblclicked": "cell-dblclicked"; "cellContextmenu": "cell-contextmenu"; "cellMouseover": "cell-mouseover"; "cellMouseout": "cell-mouseout"; "cellMousedown": "cell-mousedown"; "cellMouseup": "cell-mouseup"; "cellEditStart": "cell-edit-start"; "cellEditEnd": "cell-edit-end"; "rowEditStart": "row-edit-start"; "rowEditEnd": "row-edit-end"; "rowClicked": "row-clicked"; "rowDblclicked": "row-dblclicked"; "rowPending": "row-pending"; "rowConfirmed": "row-confirmed"; "rowReverted": "row-reverted"; "rowConflict": "row-conflict"; "formOpened": "form-opened"; "formClosed": "form-closed"; "formSaved": "form-saved"; "formError": "form-error"; "sortChanged": "sort-changed"; "filterChanged": "filter-changed"; "groupToggled": "group-toggled"; "facetComputed": "facet-computed"; "facetFiltered": "facet-filtered"; "facetExpanded": "facet-expanded"; "facetFailed": "facet-failed"; "columnMoved": "column-moved"; "columnResized": "column-resized"; "columnVisible": "column-visible"; "columnPinned": "column-pinned"; "columnGrouped": "column-grouped"; "columnPivoted": "column-pivoted"; "columnFilterOpen": "column-filter-open"; "columnProfileOpen": "column-profile-open"; "columnMenuOpen": "column-menu-open"; "columnsChanged": "columns-changed"; "columnsTagged": "columns-tagged"; "columngroupChanged": "columngroup-changed"; "headerContextmenu": "header-contextmenu"; "pivotDrill": "pivot-drill"; "selectionChanged": "selection-changed"; "rangeChanged": "range-changed"; "clipboardCopy": "clipboard-copy"; "pageChanged": "page-changed"; "scroll": "scroll"; "scrollEnd": "scroll-end"; "sizeChanged": "size-changed"; "detailToggled": "detail-toggled"; "toolpanelFocus": "toolpanel-focus"; "highlightChanged": "highlight-changed"; "findChanged": "find-changed"; "treeLoading": "tree-loading"; "treeLoaded": "tree-loaded"; "treeLoadFailed": "tree-loadFailed"; "treeLoadAborted": "tree-loadAborted"; "stateChanged": "state-changed"; "stateReset": "state-reset"; "historyChanged": "history-changed"; "historyApplied": "history-applied"; "viewsChanged": "views-changed"; "viewApplied": "view-applied"; "viewSaved": "view-saved"; "viewRemoved": "view-removed"; "viewRenamed": "view-renamed"; "viewDefault": "view-default"; "formattingChanged": "formatting-changed"; "redactionChanged": "redaction-changed"; "permissionsChanged": "permissions-changed"; "presentationChanged": "presentation-changed"; "presentationStarted": "presentation-started"; "presentationEnded": "presentation-ended"; "presentationView": "presentation-view"; "presentationScale": "presentation-scale"; "presentationSpotlight": "presentation-spotlight"; "presentationCaptured": "presentation-captured"; "commentAdded": "comment-added"; "commentEdited": "comment-edited"; "commentDeleted": "comment-deleted"; "commentFailed": "comment-failed"; "commentResolved": "comment-resolved"; "commentUnresolved": "comment-unresolved"; "commentThreadOpened": "comment-threadOpened"; "commentThreadClosed": "comment-threadClosed"; "commentIndexLoaded": "comment-indexLoaded"; "presencePublished": "presence-published"; "presenceJoined": "presence-joined"; "presenceUpdated": "presence-updated"; "presenceLeft": "presence-left"; "presenceFailed": "presence-failed"; "presenceLockRefused": "presence-lockRefused"; "diffChanged": "diff-changed"; "diffSwapped": "diff-swapped"; "timelineAttached": "timeline-attached"; "timelineDetached": "timeline-detached"; "timelineSeek": "timeline-seek"; "timelineSeeking": "timeline-seeking"; "annotationChanged": "annotation-changed"; "validationFailed": "validation-failed"; "validationCleared": "validation-cleared"; "exportProgress": "export-progress"; "exportRequest": "export-request"; "exportDone": "export-done"; "shortcutsOpened": "shortcuts-opened"; "shortcutsClosed": "shortcuts-closed"; "printBefore": "print-before"; "printAfter": "print-after"; "beforeEdit": "beforeEdit"; "beforeSort": "beforeSort"; "beforeFilter": "beforeFilter"; "beforeColumnMove": "beforeColumnMove"; "beforeColumnResize": "beforeColumnResize"; "beforeColumnHide": "beforeColumnHide"; "beforeSelect": "beforeSelect"; "beforeRowAdd": "beforeRowAdd"; "beforeDelete": "beforeDelete"; "beforeRowMove": "beforeRowMove"; "beforeGroup": "beforeGroup"; "beforeRowReceive": "beforeRowReceive"; "editCancelled": "edit-cancelled"; "sortCancelled": "sort-cancelled"; "filterCancelled": "filter-cancelled"; "columnMoveCancelled": "columnMove-cancelled"; "columnResizeCancelled": "columnResize-cancelled"; "columnHideCancelled": "columnHide-cancelled"; "selectionCancelled": "selection-cancelled"; "rowAddCancelled": "rowAdd-cancelled"; "deleteCancelled": "delete-cancelled"; "rowMoveCancelled": "rowMove-cancelled"; "groupCancelled": "group-cancelled"; "rowReceiveCancelled": "rowReceive-cancelled"; }, never, never, true, never>;
}
/**
 * The grid as a standalone component: `<lattice-grid [config]="config" />`.
 *
 * The host element *is* the grid's container, so give it a height — a grid in
 * a box with no height renders no rows, in every framework.
 */
declare class LatticeGridComponent<TRow = unknown> extends LatticeGridBase<TRow> {
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeGridComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LatticeGridComponent<any>, "lattice-grid", never, {}, {}, never, never, true, never>;
}
/**
 * The grid as a directive on an element the template already owns:
 * `<div [latticeGrid]="config" class="tall"></div>`.
 *
 * The configuration binds through the selector itself, which is what a reader
 * writing that line expects; `[config]` works too, and every other input,
 * output and the `grid` reference are the component's.
 */
declare class LatticeGridDirective<TRow = unknown> extends LatticeGridBase<TRow> {
    /**
     * The grid configuration, bound through the directive's own selector.
     * @param config the configuration
     */
    set latticeGrid(config: LatticeGridConfig<TRow> | '');
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeGridDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LatticeGridDirective<any>, "[latticeGrid]", never, { "latticeGrid": { "alias": "latticeGrid"; "required": false; }; }, {}, never, never, true, never>;
}

/**
 * The typed seam over the framework-free adapter sources.
 *
 * `packages/modules/shared/adapter.js` (the grid lifecycle) and
 * `packages/modules/react/viewers.js` (the viewer lifecycle and its tables) are
 * the contract every Lattice adapter implements, and `DESIGN.md` beside the
 * second one says each new adapter consumes them **unchanged** rather than
 * transcribing them. `scripts/prepare-vendor.mjs` copies both — byte for byte —
 * into `src/vendor/` at build time, because ng-packagr compiles this package
 * from its own `src/` tree and cannot reach out of it.
 *
 * They are JavaScript with JSDoc, so everything they export arrives here
 * loosely typed. This file is the one place that asserts a shape onto them, so
 * the components above it are ordinary strict TypeScript and no `any` from a
 * `.js` file ever reaches the public declarations.
 */

/** Every event the grid declares, in declaration order. */
declare const EVENT_NAMES: readonly string[];
/** Every event each viewer emits, keyed by the viewer name this adapter uses. */
declare const VIEWER_EVENTS: Readonly<Record<string, readonly string[]>>;
/**
 * The kebab-case name a template binds: `cell:edit:start` → `cell-edit-start`.
 * @param event the grid or viewer event name
 * @returns the dashed name an Angular template listens for
 */
declare function dashedName(event: string): string;
/** A bag of bound values on their way into a viewer or the grid. */
type Props = Record<string, unknown>;

/**
 * The payload of a viewer event.
 *
 * The grid declares `GridEvent`; the viewer modules do not declare their event
 * payloads at all yet, so this is the honest type rather than a shape invented
 * here that a template would then be type-checked against. One alias, so there
 * is one place to narrow when the modules declare theirs.
 */
type LatticeViewerEvent = any;
declare abstract class LatticeViewerBase<TInstance> implements OnChanges, OnDestroy {
    /** Which viewer's tables in `viewers.js` drive this component. */
    protected abstract readonly viewer: string;
    /** The element name, for warnings and errors that name what to fix. */
    protected abstract readonly label: string;
    /** Whether this viewer cannot exist without a grid (a chart cannot). */
    protected readonly requiresGrid: boolean;
    /** Whether this viewer takes a grid at all (the layout does not). */
    protected readonly takesGrid: boolean;
    /**
     * Whether this viewer adopts a grid published into the registry when the
     * host binds none. The panel, the chart and the board do; the plan takes an
     * explicit grid only, because a plan and a grid on one page are usually two
     * different datasets.
     */
    protected readonly fromRegistry: boolean;
    /** The host element the viewer is built into. */
    protected readonly elementRef: ElementRef<HTMLElement>;
    /** Angular's zone, or its no-op under zoneless change detection. */
    protected readonly zone: NgZone;
    /** Whether this is a browser; nothing is built on the server. */
    private readonly isBrowser;
    /** Where `<lattice-grid>` publishes itself. */
    private readonly registry;
    /** This component's injector, for the render hook. */
    private readonly injector;
    /** The explicit `[grid]` input, as a signal so the resolution is reactive. */
    private readonly explicitGrid;
    /** The `[gridName]` input, as a signal for the same reason. */
    private readonly gridNameInput;
    /** The live controller, or null while there is nothing mounted. */
    private controller;
    /** The grid the live viewer was built against, so a new one rebuilds it. */
    private builtAgainst;
    /** True once the first render has happened and the host element is in the page. */
    private rendered;
    /** Set by `ngOnDestroy`; nothing mounts after it. */
    private torn;
    /** One forwarder per viewer event, built at mount. */
    private handlers;
    /**
     * The viewer's configuration object: every key its factory takes.
     *
     * Declared as `unknown` here and narrowed by each component to that module's
     * own configuration type, which is what a template is checked against.
     */
    config?: unknown;
    /** The grid this viewer reads, when it is not taken from the registry. */
    grid?: Grid | null;
    /** Which published grid to read, on a page with more than one. */
    gridName?: string;
    /** The live viewer, the moment it exists. */
    readonly ready: EventEmitter<TInstance>;
    /** Fired as the viewer is torn down, before it is destroyed. */
    readonly destroyed: EventEmitter<void>;
    /**
     * The grid this viewer is bound to: the explicit input first, then whatever
     * the registry has published under `gridName`.
     */
    protected readonly boundGrid: Signal<Grid | null>;
    /** Watch the bound grid, and build once the host element is in the page. */
    constructor();
    /** The live viewer, or null before it is built and after it is destroyed. */
    get instance(): TInstance | null;
    /**
     * Build the viewer. Each subclass resolves its own factory from the
     * provided {@link LatticeFactories} and adapts the factory's call shape.
     *
     * @param element the host element
     * @param config the configuration the controller assembled
     * @returns the viewer instance
     */
    protected abstract mount(element: HTMLElement, config: Props): TInstance;
    /**
     * The inputs this viewer can take *live*, by the names `VIEWER_APPLY` uses.
     * Everything else a subclass declares belongs in `config`.
     * @returns the live props that are set
     */
    protected liveProps(): Props;
    /**
     * The whole props bag: configuration, live inputs, the bound grid and the
     * event forwarders.
     * @returns the props the controller is driven with
     */
    private props;
    /**
     * Build, rebuild or leave alone, whichever the current bindings call for.
     * @returns nothing
     */
    private reconcile;
    /**
     * Push changed inputs into the live viewer, and re-resolve the bound grid.
     * @returns nothing
     */
    ngOnChanges(): void;
    /** Destroy the viewer with the component. */
    ngOnDestroy(): void;
    /**
     * Announce and destroy whatever is mounted.
     * @returns nothing
     */
    private teardown;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeViewerBase<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LatticeViewerBase<any>, never, never, { "config": { "alias": "config"; "required": false; }; "grid": { "alias": "grid"; "required": false; }; "gridName": { "alias": "gridName"; "required": false; }; }, { "ready": "ready"; "destroyed": "destroyed"; }, never, never, true, never>;
}

/**
 * The KPI panel, as an Angular component.
 *
 * Grid-bound by default: leave `[grid]` off and the panel takes whichever grid
 * a `<lattice-grid>` published (`[gridName]` picks one on a page with several),
 * the moment it appears. A panel with no grid holds rows instead — `[rows]` is
 * a live input and the panel re-reads it on every change.
 *
 *     <lattice-grid name="quakes" [config]="config" />
 *     <lattice-kpi gridName="quakes" [config]="{ tiles: TILES }" />
 */

declare class LatticeKpiComponent<TRow = unknown> extends LatticeViewerBase<KPI> {
    /** Which viewer's tables drive this component. */
    protected readonly viewer = "kpi";
    /** The element name, for anything this component has to report. */
    protected readonly label = "lattice-kpi";
    /** The factories the application provided. */
    private readonly factories;
    /** The panel's configuration: its tiles, formats and options. */
    config?: KPIConfig;
    /** The rows a panel that is not grid-bound aggregates. A live input. */
    rows?: readonly TRow[];
    /** The viewer's `tile:click` event. */
    readonly tileClick: EventEmitter<any>;
    /** The viewer's `tile:dblclick` event. */
    readonly tileDblclick: EventEmitter<any>;
    /** The viewer's `tile:contextmenu` event. */
    readonly tileContextmenu: EventEmitter<any>;
    /** The viewer's `node:toggle` event. */
    readonly nodeToggle: EventEmitter<any>;
    /** The viewer's `change` event. */
    readonly change: EventEmitter<any>;
    /**
     * The live inputs, by the names the viewer tables use.
     * @returns the live props that are set
     */
    protected liveProps(): Props;
    /**
     * Build the panel.
     * @param element the host element
     * @param config the assembled configuration
     * @returns the panel
     */
    protected mount(element: HTMLElement, config: Props): KPI;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeKpiComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LatticeKpiComponent<any>, "lattice-kpi", never, { "config": { "alias": "config"; "required": false; }; "rows": { "alias": "rows"; "required": false; }; }, { "tileClick": "tile-click"; "tileDblclick": "tile-dblclick"; "tileContextmenu": "tile-contextmenu"; "nodeToggle": "node-toggle"; "change": "change"; }, never, never, true, never>;
}

/**
 * A chart, as an Angular component.
 *
 * A chart is always built against a grid — it reads the grid's *current* rows,
 * filtered and sorted as the reader left them — so nothing is mounted until a
 * grid exists, and a different grid builds a new chart. Every other input is
 * the chart spec, and a changed spec key goes straight into `chart.update()`:
 * the chart redraws, it is not rebuilt.
 *
 *     <lattice-grid name="quakes" [config]="config" />
 *     <lattice-chart gridName="quakes" [config]="{ type: 'bar', x: 'region', y: 'count' }" />
 *
 * `(click)`, `(hover)` and `(leave)` on this element are the *chart's* events,
 * carrying the datum under the pointer — not the DOM events of the same name.
 */

declare class LatticeChartComponent extends LatticeViewerBase<Chart> {
    /** Which viewer's tables drive this component. */
    protected readonly viewer = "chart";
    /** The element name, for anything this component has to report. */
    protected readonly label = "lattice-chart";
    /** A chart cannot exist without a grid. */
    protected readonly requiresGrid = true;
    /** The factories the application provided. */
    private readonly factories;
    /** The chart specification, less the container this component supplies. */
    config?: ChartConfig;
    /** The viewer's `click` event. */
    readonly click: EventEmitter<any>;
    /** The viewer's `hover` event. */
    readonly hover: EventEmitter<any>;
    /** The viewer's `leave` event. */
    readonly leave: EventEmitter<any>;
    /** The viewer's `draw` event. */
    readonly draw: EventEmitter<any>;
    /** The viewer's `legend` event. */
    readonly legend: EventEmitter<any>;
    /**
     * Build the chart. `createChart` takes one options bag with the container in
     * it rather than `(element, config)`, so it is adapted here.
     * @param element the host element
     * @param config the assembled specification
     * @returns the chart
     */
    protected mount(element: HTMLElement, config: Props): Chart;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeChartComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LatticeChartComponent, "lattice-chart", never, { "config": { "alias": "config"; "required": false; }; }, { "click": "click"; "hover": "hover"; "leave": "leave"; "draw": "draw"; "legend": "legend"; }, never, never, true, never>;
}

/**
 * The board, as an Angular component.
 *
 * Grid-bound like the KPI panel: with no `[grid]` it takes the published one.
 * Its rows, quick filter, sprint, epic, loading placeholder and error message
 * are all live inputs — a changed value reaches the board that is already on
 * screen, with its scroll position and its open cards intact.
 */

declare class LatticeKanbanComponent<TRow = unknown> extends LatticeViewerBase<Kanban> {
    /** Which viewer's tables drive this component. */
    protected readonly viewer = "kanban";
    /** The element name, for anything this component has to report. */
    protected readonly label = "lattice-kanban";
    /** The factories the application provided. */
    private readonly factories;
    /** The board's configuration: its columns, swimlanes, card renderer and rules. */
    config?: KanbanConfig;
    /** The cards. A live input. */
    rows?: readonly TRow[];
    /** The quick-filter text. A live input. */
    quickFilter?: string;
    /** The sprint in view; `undefined` clears the restriction. A live input. */
    sprint?: unknown;
    /** The epic in view. A live input. */
    epic?: unknown;
    /** Whether the board shows its loading placeholder. A live input. */
    loading?: boolean;
    /** An error message shown in place of the cards. A live input. */
    error?: string | null;
    /** The viewer's `card:click` event. */
    readonly cardClick: EventEmitter<any>;
    /** The viewer's `card:dblclick` event. */
    readonly cardDblclick: EventEmitter<any>;
    /** The viewer's `card:contextmenu` event. */
    readonly cardContextmenu: EventEmitter<any>;
    /** The viewer's `card:move` event. */
    readonly cardMove: EventEmitter<any>;
    /** The viewer's `card:reverted` event. */
    readonly cardReverted: EventEmitter<any>;
    /** The viewer's `card:confirmed` event. */
    readonly cardConfirmed: EventEmitter<any>;
    /** The viewer's `selection:changed` event. */
    readonly selectionChanged: EventEmitter<any>;
    /** The viewer's `column:collapse` event. */
    readonly columnCollapse: EventEmitter<any>;
    /** The viewer's `card:add` event. */
    readonly cardAdd: EventEmitter<any>;
    /** The viewer's `drag:start` event. */
    readonly dragStart: EventEmitter<any>;
    /** The viewer's `drag:end` event. */
    readonly dragEnd: EventEmitter<any>;
    /** The viewer's `swimlane:collapse` event. */
    readonly swimlaneCollapse: EventEmitter<any>;
    /** The viewer's `swimlane:reorder` event. */
    readonly swimlaneReorder: EventEmitter<any>;
    /** The viewer's `column:reorder` event. */
    readonly columnReorder: EventEmitter<any>;
    /** The viewer's `filter:changed` event. */
    readonly filterChanged: EventEmitter<any>;
    /** The viewer's `sprint:changed` event. */
    readonly sprintChanged: EventEmitter<any>;
    /** The viewer's `epic:changed` event. */
    readonly epicChanged: EventEmitter<any>;
    /** The viewer's `card:expand` event. */
    readonly cardExpand: EventEmitter<any>;
    /** The viewer's `card:drill` event. */
    readonly cardDrill: EventEmitter<any>;
    /** The viewer's `card:edit` event. */
    readonly cardEdit: EventEmitter<any>;
    /** The viewer's `card:sla` event. */
    readonly cardSla: EventEmitter<any>;
    /** The viewer's `beforeMove` event. */
    readonly beforeMove: EventEmitter<any>;
    /** The viewer's `beforeAdd` event. */
    readonly beforeAdd: EventEmitter<any>;
    /** The viewer's `beforeEdit` event. */
    readonly beforeEdit: EventEmitter<any>;
    /** The viewer's `beforeLaneReorder` event. */
    readonly beforeLaneReorder: EventEmitter<any>;
    /** The viewer's `beforeColumnReorder` event. */
    readonly beforeColumnReorder: EventEmitter<any>;
    /** The viewer's `beforeColumnChange` event. */
    readonly beforeColumnChange: EventEmitter<any>;
    /** The viewer's `move:cancelled` event. */
    readonly moveCancelled: EventEmitter<any>;
    /** The viewer's `add:cancelled` event. */
    readonly addCancelled: EventEmitter<any>;
    /** The viewer's `edit:cancelled` event. */
    readonly editCancelled: EventEmitter<any>;
    /** The viewer's `laneReorder:cancelled` event. */
    readonly laneReorderCancelled: EventEmitter<any>;
    /** The viewer's `columnReorder:cancelled` event. */
    readonly columnReorderCancelled: EventEmitter<any>;
    /** The viewer's `columnChange:cancelled` event. */
    readonly columnChangeCancelled: EventEmitter<any>;
    /**
     * The live inputs, by the names the viewer tables use.
     * @returns the live props that are set
     */
    protected liveProps(): Props;
    /**
     * Build the board.
     * @param element the host element
     * @param config the assembled configuration
     * @returns the board
     */
    protected mount(element: HTMLElement, config: Props): Kanban;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeKanbanComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LatticeKanbanComponent<any>, "lattice-kanban", never, { "config": { "alias": "config"; "required": false; }; "rows": { "alias": "rows"; "required": false; }; "quickFilter": { "alias": "quickFilter"; "required": false; }; "sprint": { "alias": "sprint"; "required": false; }; "epic": { "alias": "epic"; "required": false; }; "loading": { "alias": "loading"; "required": false; }; "error": { "alias": "error"; "required": false; }; }, { "cardClick": "card-click"; "cardDblclick": "card-dblclick"; "cardContextmenu": "card-contextmenu"; "cardMove": "card-move"; "cardReverted": "card-reverted"; "cardConfirmed": "card-confirmed"; "selectionChanged": "selection-changed"; "columnCollapse": "column-collapse"; "cardAdd": "card-add"; "dragStart": "drag-start"; "dragEnd": "drag-end"; "swimlaneCollapse": "swimlane-collapse"; "swimlaneReorder": "swimlane-reorder"; "columnReorder": "column-reorder"; "filterChanged": "filter-changed"; "sprintChanged": "sprint-changed"; "epicChanged": "epic-changed"; "cardExpand": "card-expand"; "cardDrill": "card-drill"; "cardEdit": "card-edit"; "cardSla": "card-sla"; "beforeMove": "beforeMove"; "beforeAdd": "beforeAdd"; "beforeEdit": "beforeEdit"; "beforeLaneReorder": "beforeLaneReorder"; "beforeColumnReorder": "beforeColumnReorder"; "beforeColumnChange": "beforeColumnChange"; "moveCancelled": "move-cancelled"; "addCancelled": "add-cancelled"; "editCancelled": "edit-cancelled"; "laneReorderCancelled": "laneReorder-cancelled"; "columnReorderCancelled": "columnReorder-cancelled"; "columnChangeCancelled": "columnChange-cancelled"; }, never, never, true, never>;
}

/**
 * The plan, as an Angular component.
 *
 * `[tasks]` and `[dependencies]` are live inputs: a new array reaches the plan
 * on screen and it re-schedules, rather than being rebuilt. A plan that writes
 * back into a grid takes that grid through `[grid]` (or `config.grid`); unlike
 * the KPI panel and the board it does **not** adopt a published grid on its
 * own, because a plan and a grid on one page are usually two different datasets.
 */

declare class LatticeGanttComponent extends LatticeViewerBase<Gantt> {
    /** Which viewer's tables drive this component. */
    protected readonly viewer = "gantt";
    /** The element name, for anything this component has to report. */
    protected readonly label = "lattice-gantt";
    /** A plan takes an explicit grid, but never adopts a published one. */
    protected readonly fromRegistry = false;
    /** The factories the application provided. */
    private readonly factories;
    /** The plan's options: its calendar, resources, scheduling and columns. */
    config?: GanttConfig;
    /** The tasks. A live input. */
    tasks?: readonly unknown[];
    /** The dependencies between tasks. A live input. */
    dependencies?: readonly unknown[];
    /** The viewer's `schedule` event. */
    readonly schedule: EventEmitter<any>;
    /** The viewer's `error` event. */
    readonly error: EventEmitter<any>;
    /**
     * The live inputs, by the names the viewer tables use.
     * @returns the live props that are set
     */
    protected liveProps(): Props;
    /**
     * Build the plan. `createGantt` takes one options bag and mounts itself when
     * handed an `element`, so the host element is folded into the options.
     * @param element the host element
     * @param config the assembled options
     * @returns the plan
     */
    protected mount(element: HTMLElement, config: Props): Gantt;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeGanttComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LatticeGanttComponent, "lattice-gantt", never, { "config": { "alias": "config"; "required": false; }; "tasks": { "alias": "tasks"; "required": false; }; "dependencies": { "alias": "dependencies"; "required": false; }; }, { "schedule": "schedule"; "error": "error"; }, never, never, true, never>;
}

/**
 * The layout, as an Angular component.
 *
 * The layout owns the windows inside it — it is the thing a grid, a chart and a
 * board are arranged *in* — so it takes no grid of its own, and everything but
 * its events is mount-time configuration.
 */

declare class LatticeLayoutComponent extends LatticeViewerBase<Layout> {
    /** Which viewer's tables drive this component. */
    protected readonly viewer = "layout";
    /** The element name, for anything this component has to report. */
    protected readonly label = "lattice-layout";
    /** The layout arranges viewers; it is not built against a grid. */
    protected readonly takesGrid = false;
    /** The factories the application provided. */
    private readonly factories;
    /** The layout's configuration: its windows and their arrangement. */
    config?: LayoutConfig;
    /** The viewer's `layout:changed` event. */
    readonly layoutChanged: EventEmitter<any>;
    /** The viewer's `window:moved` event. */
    readonly windowMoved: EventEmitter<any>;
    /** The viewer's `window:resized` event. */
    readonly windowResized: EventEmitter<any>;
    /** The viewer's `window:closed` event. */
    readonly windowClosed: EventEmitter<any>;
    /** The viewer's `beforeWindowClose` event. */
    readonly beforeWindowClose: EventEmitter<any>;
    /** The viewer's `windowClose:cancelled` event. */
    readonly windowCloseCancelled: EventEmitter<any>;
    /**
     * Build the layout.
     * @param element the host element
     * @param config the assembled configuration
     * @returns the layout
     */
    protected mount(element: HTMLElement, config: Props): Layout;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeLayoutComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LatticeLayoutComponent, "lattice-layout", never, { "config": { "alias": "config"; "required": false; }; }, { "layoutChanged": "layout-changed"; "windowMoved": "window-moved"; "windowResized": "window-resized"; "windowClosed": "window-closed"; "beforeWindowClose": "beforeWindowClose"; "windowCloseCancelled": "windowClose-cancelled"; }, never, never, true, never>;
}

/**
 * One tab's content: `<ng-template latticeTab="all">…</ng-template>`.
 *
 * The id matches the `id` of a descriptor in the strip's `[tabs]` array.
 */
declare class LatticeTabDirective {
    /** The template this directive is on. */
    readonly template: TemplateRef<unknown>;
    /** The id of the tab this template fills. */
    tabId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeTabDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LatticeTabDirective, "ng-template[latticeTab]", never, { "tabId": { "alias": "latticeTab"; "required": false; }; }, {}, never, never, true, never>;
}
declare class LatticeTabsComponent implements OnChanges, OnDestroy {
    /** The host element; the strip is built into the div inside it. */
    private readonly elementRef;
    /** Angular's zone, or its no-op under zoneless change detection. */
    private readonly zone;
    /** Whether this is a browser; nothing is built on the server. */
    private readonly isBrowser;
    /** The factories the application provided. */
    private readonly factories;
    /** Where the tab content's views are created, so they stay in the Angular tree. */
    private readonly viewContainer;
    /** This component's injector, for the render hook. */
    private readonly injector;
    /** The live strip, or null before the first render and after destroy. */
    private strip;
    /** Set by `ngOnDestroy`; nothing mounts after it. */
    private torn;
    /** The `tabs` array the strip was built from, compared by identity. */
    private builtFrom;
    /** The unsubscribe functions for the strip's events. */
    private off;
    /** The view rendered for each content tab, by tab id. */
    private readonly views;
    /** The content templates the host declared, one per tab id. */
    templates?: QueryList<LatticeTabDirective>;
    /** The strip's configuration, less its tabs. */
    config?: TabsConfig;
    /** The tab descriptors: id, label, badge and whatever else the module takes. */
    tabs?: readonly Record<string, unknown>[];
    /** The open tab. The one live input. */
    active?: string;
    /** The live strip, the moment it exists. */
    readonly ready: EventEmitter<Tabs>;
    /** Fired as the strip is torn down, before it is destroyed. */
    readonly destroyed: EventEmitter<void>;
    /** The strip's `beforeTabChange` event, which a host may cancel. */
    readonly beforeTabChange: EventEmitter<any>;
    /** The strip's `tab:changed` event. */
    readonly tabChanged: EventEmitter<any>;
    /** The strip's `tabChange:cancelled` event. */
    readonly tabChangeCancelled: EventEmitter<any>;
    /** Build the strip once the host element is in the page. */
    constructor();
    /** The live strip, or null before it is built and after it is destroyed. */
    get instance(): Tabs | null;
    /**
     * The template a tab's content comes from, if the host declared one.
     * @param id the tab id
     * @returns the directive, or undefined
     */
    private templateFor;
    /**
     * Render one tab's content into the panel element the module created.
     *
     * The view is created in this component's view container — so it belongs to
     * the Angular tree, with this component's injector above it — and its root
     * nodes are then moved into the module's element.
     *
     * @param id the tab id
     * @param template the content template
     * @param body the element the module made for this tab's content
     * @returns the module's handle for what lives in that element
     */
    private renderInto;
    /**
     * Build the strip: the descriptors, the module, its events.
     * @returns nothing
     */
    private build;
    /**
     * Apply the open tab, and name a `tabs` array the module cannot take.
     * @returns nothing
     */
    ngOnChanges(): void;
    /** Destroy the strip, and every view rendered into it, with the component. */
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeTabsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LatticeTabsComponent, "lattice-tabs", never, { "config": { "alias": "config"; "required": false; }; "tabs": { "alias": "tabs"; "required": false; }; "active": { "alias": "active"; "required": false; }; }, { "ready": "ready"; "destroyed": "destroyed"; "beforeTabChange": "beforeTabChange"; "tabChanged": "tab-changed"; "tabChangeCancelled": "tabChange-cancelled"; }, ["templates"], never, true, never>;
}

/**
 * The Data Router, as an Angular service scoped to whatever provides it.
 *
 * One stream in, many decoupled viewers out: the router holds the rows, and
 * each grid attached to a route sees the slice that route selects. In Angular
 * that is a service, and the two things a host must get right are both the
 * injector's job rather than the host's:
 *
 * - **Created once.** A router rebuilt on a re-render would drop every attached
 *   grid and every row it holds, so the configuration is read once, when the
 *   first grid asks for it.
 * - **Destroyed with its scope.** `ngOnDestroy` on a service runs when the
 *   injector that provided it is destroyed — the application at shutdown, or
 *   the component whose `providers` array carried it, which is why
 *   {@link provideLatticeRouter} returns plain providers rather than
 *   environment ones.
 *
 *     @Component({
 *       selector: 'live-page',
 *       providers: [provideLatticeRouter({ key: (row) => row.venue })],
 *       template: `
 *         <lattice-grid route="LSE" [config]="config" />
 *         <lattice-grid route="NYSE" [config]="config" />
 *       `,
 *     })
 *     export class LivePage {}
 *
 * Both grids attach on mount and detach before they are destroyed, so the
 * router never holds a dead grid.
 */

/** The value a grid's `route` input carries: whatever the router's `key` produces. */
type LatticeRoute = Parameters<DataRouter['attach']>[1];
/** Per-route options, as `router.attach()` takes them. */
type LatticeRouteOptions = NonNullable<Parameters<DataRouter['attach']>[2]>;
/** The configuration {@link LatticeRouter} builds its router from, read once. */
declare const LATTICE_ROUTER_OPTIONS: InjectionToken<DataRouterOptions>;
declare class LatticeRouter implements OnDestroy {
    /** The live router, built on first use. */
    private instance;
    /** Set by `ngOnDestroy`, so nothing rebuilds a router on the way out. */
    private torn;
    /** The provided Lattice factories, for `createDataRouter`. */
    private readonly factories;
    /** The router configuration, read once when the router is built. */
    private readonly options;
    /**
     * The live router, built the first time anything asks for it.
     * @returns the router
     * @throws TypeError when `createDataRouter` was not provided
     */
    get router(): DataRouter;
    /**
     * Attach a grid to a route.
     * @param grid the grid
     * @param route the route value
     * @param opts per-route options
     * @returns nothing
     */
    attach(grid: Grid, route: LatticeRoute, opts?: LatticeRouteOptions): void;
    /**
     * Detach a grid, before it is destroyed.
     * @param grid the grid
     * @returns nothing
     */
    detach(grid: Grid): void;
    /** Destroy the router with the injector that provided it. */
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LatticeRouter, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
/**
 * Provide a Data Router to an application, a route or one component's subtree.
 *
 * @param options the router configuration, read once when the router is built
 * @returns providers for `bootstrapApplication`, a route, or a component's
 *   `providers` array — the last of which is what scopes a router to a page
 *   and destroys it with that page
 */
declare function provideLatticeRouter(options?: DataRouterOptions): Provider[];

/**
 * Turning Lattice's event names into Angular outputs, and dispatching them
 * without waking change detection for an event nobody listens to.
 *
 * ## The names
 *
 * A Lattice event is colon-separated (`cell:edit:start`). A colon is not legal
 * in an Angular binding, so each output is aliased to the same kebab-case name
 * the Vue and Svelte adapters use — `(cell-edit-start)` — while the class
 * property stays camelCase (`cellEditStart`) for anyone holding a component
 * reference. `dashedName` in the shared adapter owns the first half of that
 * mapping; `eventProp` here owns the second, and the package's test re-derives
 * both from `EVENT_NAMES` so neither can drift.
 *
 * ## The zone
 *
 * The grid is created outside Angular's zone (see `LatticeGridBase`), because
 * it installs its own scroll, wheel and pointer listeners and running change
 * detection on every scroll frame of a million-row grid is the difference
 * between smooth and unusable. An event that reaches a *bound* output has to
 * re-enter, or a host writing `(cell-changed)="count = count + 1"` would update
 * a field the view never re-reads. An event with no listener re-enters nothing,
 * which is what keeps `scroll` free.
 *
 * Under zoneless change detection `NgZone` is Angular's own no-op, `run` calls
 * the function directly, and a host that reacts to an output by setting a
 * signal is repainted by the signal. Both modes work; neither is configured.
 */

/**
 * The camelCase property name an event becomes: `cell:edit:start` →
 * `cellEditStart`.
 * @param event the Lattice event name
 * @returns the class property name its emitter is declared under
 */
declare function eventProp(event: string): string;

export { DEFAULT_GRID_NAME, EVENT_NAMES, LATTICE_FACTORIES, LATTICE_ROUTER_OPTIONS, LatticeChartComponent, LatticeGanttComponent, LatticeGridBase, LatticeGridComponent, LatticeGridDirective, LatticeGridRegistry, LatticeKanbanComponent, LatticeKpiComponent, LatticeLayoutComponent, LatticeRouter, LatticeTabDirective, LatticeTabsComponent, LatticeViewerBase, VIEWER_EVENTS, dashedName, eventProp, provideLattice, provideLatticeRouter, requireFactory };
export type { Chart, ChartConfig, ChartFactory, DataRouter, DataRouterFactory, DataRouterOptions, Gantt, GanttConfig, GanttFactory, GridFactory, KPI, KPIConfig, KPIFactory, Kanban, KanbanConfig, KanbanFactory, LatticeFactories, LatticeGridConfig, LatticePredicates, LatticeQuickFilter, LatticeRoute, LatticeRouteOptions, LatticeRowChange, LatticeViewerEvent, Layout, LayoutConfig, LayoutFactory, Tabs, TabsConfig, TabsFactory };
