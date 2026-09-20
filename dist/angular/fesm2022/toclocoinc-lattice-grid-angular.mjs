import * as i0 from '@angular/core';
import { InjectionToken, makeEnvironmentProviders, signal, computed, Injectable, inject, ElementRef, NgZone, PLATFORM_ID, Injector, EventEmitter, afterNextRender, Output, Input, Directive, ViewEncapsulation, Component, effect, TemplateRef, ViewContainerRef, ContentChildren } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const LATTICE_FACTORIES = new InjectionToken('lattice.factories');

function provideLattice(factories) {
    return makeEnvironmentProviders([
        { provide: LATTICE_FACTORIES, useValue: factories ?? {} },
    ]);
}

function requireFactory(factories, key, specifier, element) {
    const factory = factories ? factories[key] : undefined;
    if (typeof factory !== 'function') {
        throw new TypeError(`[lattice] <${element}> needs ${String(key)}. Add it to the provider: `
            + `import { ${String(key)} } from '${specifier}'; `
            + `provideLattice({ ${String(key)} }).`);
    }
    return factory;
}

const DEFAULT_GRID_NAME = 'default';
class LatticeGridRegistry {
    constructor() {

        this.published = signal({}, 
        ...(ngDevMode ? [{ debugName: "published" }] :  []));

        this.byName = new Map();

        this.grids = this.published.asReadonly();
    }

    publish(name, grid) {
        const key = name || DEFAULT_GRID_NAME;
        this.published.update((held) => {
            if (held[key] === grid)
                return held;
            const next = { ...held };
            if (grid)
                next[key] = grid;
            else
                delete next[key];
            return next;
        });
    }

    grid(name = DEFAULT_GRID_NAME) {
        const key = name || DEFAULT_GRID_NAME;
        let held = this.byName.get(key);
        if (!held) {
            held = computed(() => this.published()[key] ?? null);
            this.byName.set(key, held);
        }
        return held;
    }

    snapshot(name = DEFAULT_GRID_NAME) {
        return this.published()[name || DEFAULT_GRID_NAME] ?? null;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGridRegistry, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGridRegistry, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGridRegistry, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

const EVENT_NAMES$1 = Object.freeze([
    'ready', 'destroy', 'render:first', 'render:done', 'config:changed', 'licence:changed',
    'model:changed', 'rows:changed', 'rows:queued', 'rows:deferred', 'rows:paused',
    'rows:resumed', 'row:received', 'row:sent', 'row:copied', 'row:moved', 'source:error',
    'stream:chunk', 'stream:end', 'stream:evicted',
    'rowDrag:started', 'rowDrag:moved', 'rowDrag:left', 'rowDrag:ended',
    'cell:changed', 'cell:pending',
    'cell:confirmed', 'cell:reverted', 'cell:conflict', 'cell:clicked', 'cell:dblclicked', 'cell:contextmenu',
    'cell:mouseover', 'cell:mouseout', 'cell:mousedown', 'cell:mouseup',
    'cell:edit:start', 'cell:edit:end', 'row:edit:start', 'row:edit:end', 'row:clicked',
    'row:dblclicked', 'row:pending', 'row:confirmed', 'row:reverted', 'row:conflict',
    'form:opened', 'form:closed', 'form:saved', 'form:error',
    'sort:changed', 'filter:changed', 'group:toggled', 'facet:computed', 'facet:filtered',
    'facet:expanded', 'facet:failed', 'column:moved', 'column:resized', 'column:visible',
    'column:pinned', 'column:grouped', 'column:pivoted', 'column:filter:open',
    'column:profile:open',
    'column:menu:open', 'columns:changed', 'columns:tagged', 'columngroup:changed',
    'header:contextmenu', 'pivot:drill',
    'selection:changed', 'range:changed', 'clipboard:copy', 'page:changed', 'scroll',
    'scroll:end', 'size:changed', 'detail:toggled', 'toolpanel:focus', 'highlight:changed', 'find:changed',
    'tree:loading', 'tree:loaded', 'tree:loadFailed', 'tree:loadAborted', 'state:changed',
    'state:reset', 'history:changed', 'history:applied', 'views:changed', 'view:applied',
    'view:saved', 'view:removed', 'view:renamed', 'view:default', 'formatting:changed',
    'redaction:changed', 'permissions:changed', 'presentation:changed',
    'presentation:started', 'presentation:ended', 'presentation:view', 'presentation:scale',
    'presentation:spotlight', 'presentation:captured', 'comment:added', 'comment:edited',
    'comment:deleted', 'comment:failed', 'comment:resolved', 'comment:unresolved',
    'comment:threadOpened', 'comment:threadClosed', 'comment:indexLoaded',
    'presence:published', 'presence:joined', 'presence:updated', 'presence:left',
    'presence:failed', 'presence:lockRefused', 'diff:changed', 'diff:swapped',
    'timeline:attached', 'timeline:detached', 'timeline:seek', 'timeline:seeking',
    'annotation:changed',

    'validation:failed', 'validation:cleared',
    'export:progress', 'export:request', 'export:done',

    'shortcuts:opened', 'shortcuts:closed',

    'print:before', 'print:after',

    'beforeEdit', 'beforeSort', 'beforeFilter',
    'beforeColumnMove', 'beforeColumnResize', 'beforeColumnHide',
    'beforeSelect', 'beforeRowAdd', 'beforeDelete', 'beforeRowMove', 'beforeGroup',
    'beforeRowReceive',
    'edit:cancelled', 'sort:cancelled', 'filter:cancelled',
    'columnMove:cancelled', 'columnResize:cancelled', 'columnHide:cancelled',
    'selection:cancelled', 'rowAdd:cancelled', 'delete:cancelled',
    'rowMove:cancelled', 'group:cancelled', 'rowReceive:cancelled',
]);

const IMPERATIVE = Object.freeze({

    sort: (grid, value) => grid.sort.set(value || []),

    filters: (grid, value) => grid.filters.set(value || null),

    quickFilter: (grid, value) => {
        if (value && typeof value === 'object') {
            grid.filters.quick( (value).text || '', { mode:  (value).mode });
            return;
        }
        grid.filters.quick(typeof value === 'string' ? value : '');
    },

    selectedKeys: (grid, value) => grid.selection.set(Array.isArray(value) ? value : []),
});

function handlerName$1(event) {
    const parts = String(event).split(':');
    return `on${parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')}`;
}

function dashedName$1(event) {
    return String(event).replace(/:/g, '-');
}

const CONFIG_KEY_ALIASES = Object.freeze({
    'row-key': 'rowKey',
    'row-height': 'rowHeight',
    'header-height': 'headerHeight',
    'auto-height': 'autoHeight',
});

function aliasConfigKey(key) {
    return Object.hasOwn(CONFIG_KEY_ALIASES, key) ? CONFIG_KEY_ALIASES[key] : key;
}

const BY_HANDLER$1 = Object.freeze(Object.fromEntries(EVENT_NAMES$1.map((name) => [handlerName$1(name), name])));

function isHandlerProp(key) {
    return Object.hasOwn(BY_HANDLER$1, key);
}

function partition(props) {

    const config = {};

    const imperative = {};

    const handlers = {};
    for (const [key, value] of Object.entries(props || {})) {
        if (isHandlerProp(key)) {
            handlers[key] = value;
            continue;
        }
        if (Object.hasOwn(IMPERATIVE, key)) {
            imperative[key] = value;
            continue;
        }
        config[key] = value;
    }
    return { config, imperative, handlers };
}

function createGridController$1(opts) {
    const create = opts.createGrid;
    if (typeof create !== 'function') {
        throw new TypeError('createGridController needs createGrid; pass it in from the grid package.');
    }
    const initial = partition(opts.props || {});
    const grid = create(opts.element, { ...initial.config });

    let handlers = initial.handlers;
    let config = initial.config;
    let imperative = {};

    const dispatch = (event) => {
        if (!event || typeof event.type !== 'string')
            return;
        const fn = handlers[handlerName$1(event.type)];
        if (typeof fn === 'function')
            fn(event);
    };
    const unsubscribe = grid.on('*', dispatch);

    for (const [key, value] of Object.entries(initial.imperative)) {
        if (value === undefined)
            continue;
        IMPERATIVE[key](grid, value);
        imperative[key] = value;
    }
    let destroyed = false;
    return {
        grid,

        update(next) {
            if (destroyed)
                return;
            const parts = partition(next || {});
            handlers = parts.handlers;

            const changed = {};
            for (const [key, value] of Object.entries(parts.config)) {

                if (!Object.is(config[key], value))
                    changed[key] = value;
            }

            for (const key of Object.keys(config)) {
                if (!Object.hasOwn(parts.config, key))
                    changed[key] = undefined;
            }
            if (Object.keys(changed).length)
                grid.setAll(changed);
            config = parts.config;
            for (const [key, apply] of Object.entries(IMPERATIVE)) {
                const value = parts.imperative[key];
                if (Object.is(imperative[key], value))
                    continue;
                if (value === undefined && !Object.hasOwn(imperative, key))
                    continue;
                apply(grid, value);
                imperative[key] = value;
            }
        },

        destroy() {
            if (destroyed)
                return;
            destroyed = true;
            unsubscribe();
            grid.destroy();
        },
    };
}

const STAMPED_VERSION = '0.0.0-source';

async function resolveVersion() {
    if (STAMPED_VERSION !== '0.0.0-source')
        return STAMPED_VERSION;

    try {
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            const mod = await import('node:' + 'module');
            const req = mod.createRequire(import.meta.url);
            const fs = req('node:' + 'fs');
            const url = new URL('../../../../package.json', import.meta.url);
            const text = fs.readFileSync(url, 'utf8');
            return JSON.parse(text).version || STAMPED_VERSION;
        }
    }
    catch {  }

    return STAMPED_VERSION;
}

const VERSION = await resolveVersion();

const warned = new Set();

const WARNED_LIMIT = 2000;

function rememberWarned(key) {
    warned.add(key);
    if (warned.size > WARNED_LIMIT) {

        const oldest = warned.values().next().value;
        if (oldest !== undefined)
            warned.delete(oldest);
    }
}

const reported = [];

const REPORT_LIMIT = 500;

function record(key, level, message) {
    reported.push({
        key,
        level,

        message: message.map((m) => (typeof m === 'string' ? m : safeString(m))).join(' '),
        at: Date.now(),
    });
    if (reported.length > REPORT_LIMIT)
        reported.shift();
}

function safeString(value) {
    if (value instanceof Error)
        return value.message;
    try {
        return JSON.stringify(value);
    }
    catch {
        return String(value);
    }
}

function reportedWarnings() { return reported.map((r) => ({ ...r })); }

function warnOnce$1(key, ...message) {
    if (warned.has(key))
        return;
    rememberWarned(key);
    record(key, 'warn', message);
    console.warn('[lattice]', ...message);
}

function infoOnce(key, ...message) {
    if (warned.has(key))
        return;
    rememberWarned(key);
    record(key, 'info', message);
    console.info('[lattice]', ...message);
}

function resetWarnings() {
    warned.clear();

    reported.length = 0;
}

function fail(message, extra) {
    const err = new Error(`[lattice] ${message}`);
    if (extra !== undefined)
        err.cause = extra;
    throw err;
}

function invariant(condition, message) {
    if (!condition)
        fail(message);
}

const DEV = (() => {
    try {
        return !(typeof process !== 'undefined' && process.env
            && process.env.NODE_ENV === 'production');
    }
    catch {
        return true;
    }
})();

function isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isFunction(v) {
    return typeof v === 'function';
}

function isNil(v) {
    return v === null || v === undefined;
}

function isBlank(v) {
    return v === null || v === undefined || v === '';
}

function isCtor(v) {
    if (typeof v !== 'function')
        return false;
    if (/^class[\s{]/.test(Function.prototype.toString.call(v)))
        return true;
    return !!(v.prototype && Object.getOwnPropertyNames(v.prototype).length > 1);
}

const pathCache = new Map();

function pathGetter(path) {
    let fn = pathCache.get(path);
    if (fn)
        return fn;
    if (!path.includes('.')) {
        fn = (o) => (o == null ? undefined : o[path]);
    }
    else {
        const parts = path.split('.');
        const n = parts.length;
        fn = (o) => {
            let cur = o;
            for (let i = 0; i < n; i++) {
                if (cur == null)
                    return undefined;
                cur = cur[parts[i]];
            }
            return cur;
        };
    }
    pathCache.set(path, fn);
    return fn;
}

const setterCache = new Map();

function pathSetter(path) {
    let fn = setterCache.get(path);
    if (fn)
        return fn;
    if (!path.includes('.')) {
        fn = (o, v) => { if (o != null)
            o[path] = v; };
    }
    else {
        const parts = path.split('.');
        const last = parts.length - 1;
        fn = (o, v) => {
            let cur = o;
            for (let i = 0; i < last; i++) {
                if (cur == null)
                    return;
                const k = parts[i];
                if (cur[k] == null)
                    cur[k] = {};
                cur = cur[k];
            }
            if (cur != null)
                cur[parts[last]] = v;
        };
    }
    setterCache.set(path, fn);
    return fn;
}

function getPath(obj, path) {
    return pathGetter(path)(obj);
}

function setPath(obj, path, value) {
    pathSetter(path)(obj, value);
}

function humanise(field) {
    if (!field)
        return '';
    const leaf = field.includes('.') ? field.slice(field.lastIndexOf('.') + 1) : field;
    return leaf
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (c) => c.toUpperCase());
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(s) {
    const str = s == null ? '' : String(s);
    return /[&<>"']/.test(str) ? str.replace(/[&<>"']/g, (c) => ESCAPES[c]) : str;
}

function titleCase(s) {
    return String(s).replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());
}

function expand(value, key, whenTrue) {
    if (value === undefined)
        return undefined;
    if (value === true)
        return { enabled: true, ...whenTrue };
    if (value === false)
        return { enabled: false };
    if (isObject(value))
        return value;
    return { [key]: value, enabled: true };
}

function toArray(v) {
    if (v === undefined || v === null)
        return [];
    return Array.isArray(v) ? v : [v];
}

const MERGE_FORBIDDEN_KEYS = Object.freeze(new Set(['__proto__', 'constructor', 'prototype']));

function merge(a, b) {
    if (!isObject(a))
        return isObject(b) ? { ...b } : b;
    if (!isObject(b))
        return b === undefined ? a : b;
    const out = { ...a };
    for (const k of Object.keys(b)) {
        if (MERGE_FORBIDDEN_KEYS.has(k))
            continue;
        const bv = b[k];
        if (bv === undefined)
            continue;
        out[k] = isObject(bv) && isObject(out[k]) ? merge(out[k], bv) : bv;
    }
    return out;
}

function mergeRow(previous, patch) {
    if (!isObject(previous) || !isObject(patch) || previous === patch)
        return patch;
    const out = Object.create(Object.getPrototypeOf(previous));
    Object.assign(out, previous, patch);
    return out;
}

class Lru {

    #max;

    #map = new Map();

    #onEvict;

    constructor(max = 256, onEvict = null) {
        this.#max = max;
        this.#onEvict = onEvict;
    }

    get size() {
        return this.#map.size;
    }

    get max() {
        return this.#max;
    }

    set max(v) {
        this.#max = v;
        this.#trim();
    }

    has(k) {
        return this.#map.has(k);
    }

    get(k) {
        const m = this.#map;
        if (!m.has(k))
            return undefined;
        const v = m.get(k);
        m.delete(k);
        m.set(k, v);
        return v;
    }

    peek(k) {
        return this.#map.get(k);
    }

    set(k, v) {
        const m = this.#map;
        if (m.has(k))
            m.delete(k);
        m.set(k, v);
        this.#trim();
        return v;
    }

    delete(k) {
        const v = this.#map.get(k);
        if (this.#map.delete(k) && this.#onEvict)
            this.#onEvict(v, k);
        return v;
    }

    clear() {
        if (this.#onEvict)
            for (const [k, v] of this.#map)
                this.#onEvict(v, k);
        this.#map.clear();
    }

    keys() {
        return this.#map.keys();
    }

    values() {
        return this.#map.values();
    }

    #trim() {
        const m = this.#map;
        while (m.size > this.#max) {
            const oldest = m.keys().next().value;
            const v = m.get(oldest);
            m.delete(oldest);
            if (this.#onEvict)
                this.#onEvict(v, oldest);
        }
    }
}

const collators = new Map();

function collator(locale, opts) {
    const key = `${locale || ''}|${opts ? JSON.stringify(opts) : ''}`;
    let c = collators.get(key);
    if (!c) {
        c = new Intl.Collator(locale || undefined, {
            numeric: true, sensitivity: 'variant', ...opts,
        });
        collators.set(key, c);
    }
    return c;
}

function defaultCompare(a, b) {
    if (a === b)
        return 0;
    if (a === null || a === undefined)
        return 1;
    if (b === null || b === undefined)
        return -1;
    if (typeof a === 'number' && typeof b === 'number') {
        if (Number.isNaN(a))
            return Number.isNaN(b) ? 0 : 1;
        if (Number.isNaN(b))
            return -1;
        return a < b ? -1 : a > b ? 1 : 0;
    }
    const sa = String(a);
    const sb = String(b);
    return sa < sb ? -1 : sa > sb ? 1 : 0;
}

function now() {
    return typeof performance !== 'undefined' && performance.now
        ? performance.now()
        : Date.now();
}

const hasRaf = typeof requestAnimationFrame === 'function';

function nextFrame(fn) {
    if (hasRaf)
        return requestAnimationFrame(fn);
    return setTimeout(() => fn(now()), 16);
}

function cancelFrame(handle) {
    if (handle == null)
        return;
    if (hasRaf)
        cancelAnimationFrame(handle);
    else
        clearTimeout(handle);
}

function frameBatched(fn) {
    let handle = null;
    let lastArgs = null;

    const run = () => {
        handle = null;
        const a = lastArgs;
        lastArgs = null;
        fn(...(a || []));
    };

    const wrapped = (...args) => {
        lastArgs = args;
        if (handle === null)
            handle = nextFrame(run);
    };

    wrapped.cancel = () => {
        cancelFrame(handle);
        handle = null;
        lastArgs = null;
    };

    wrapped.flush = () => {
        if (handle !== null) {
            cancelFrame(handle);
            run();
        }
    };
    return wrapped;
}

function settleDebounce(fn, waitMs) {

    let timer = null;

    let held = null;

    const trailing = () => {
        timer = null;
        if (held === null)
            return;
        const args = held;
        held = null;
        fn(...args);

        arm();
    };

    const arm = () => {
        timer = setTimeout(trailing, waitMs);

        if (typeof timer?.unref === 'function')
            timer.unref();
    };

    const wrapped = (...args) => {
        if (timer === null) {

            fn(...args);
            arm();
        }
        else {

            held = args;
            clearTimeout(timer);
            arm();
        }
    };

    wrapped.flush = () => {
        if (timer !== null)
            clearTimeout(timer);
        timer = null;
        if (held === null)
            return;
        const args = held;
        held = null;
        fn(...args);
    };

    wrapped.cancel = () => {
        if (timer !== null)
            clearTimeout(timer);
        timer = null;
        held = null;
    };

    wrapped.pending = () => timer !== null || held !== null;
    return wrapped;
}

function whenIdle(fn, timeout = 50) {
    if (typeof requestIdleCallback === 'function') {
        return requestIdleCallback(fn, { timeout });
    }
    return setTimeout(() => fn({ timeRemaining: () => 0, didTimeout: true }), 1);
}

let idSeq = 0;

function uid(prefix = 'l') {
    return `${prefix}${(++idSeq).toString(36)}`;
}

const VIEWER_EVENTS$1 = Object.freeze({
    kpi: Object.freeze([
        'tile:click', 'tile:dblclick', 'tile:contextmenu', 'node:toggle', 'change',
    ]),
    kanban: Object.freeze([
        'card:click', 'card:dblclick', 'card:contextmenu',
        'card:move', 'card:reverted', 'card:confirmed', 'selection:changed', 'column:collapse', 'card:add',
        'drag:start', 'drag:end', 'swimlane:collapse', 'swimlane:reorder', 'column:reorder',
        'filter:changed', 'sprint:changed', 'epic:changed', 'card:expand', 'card:drill', 'card:edit',
        'card:sla',
        'beforeMove', 'beforeAdd', 'beforeEdit',
        'beforeLaneReorder', 'beforeColumnReorder', 'beforeColumnChange',
        'move:cancelled', 'add:cancelled', 'edit:cancelled',
        'laneReorder:cancelled', 'columnReorder:cancelled', 'columnChange:cancelled',
    ]),
    tabs: Object.freeze(['beforeTabChange', 'tab:changed', 'tabChange:cancelled']),

    chart: Object.freeze(['click', 'hover', 'leave', 'draw', 'legend']),

    gantt: Object.freeze(['schedule', 'error']),
    layout: Object.freeze([
        'layout:changed', 'window:moved', 'window:resized', 'window:closed',
        'beforeWindowClose', 'windowClose:cancelled',
    ]),

    router: Object.freeze(['metrics']),
});

const VIEWER_APPLY$1 = Object.freeze({
    kpi: Object.freeze({

        rows: (kpi, value) => kpi.setRows(Array.isArray(value) ? value : []),
    }),
    kanban: Object.freeze({

        rows: (board, value) => board.setRows(Array.isArray(value) ? value : []),

        quickFilter: (board, value) => board.setQuickFilter(typeof value === 'string' ? value : ''),

        sprint: (board, value) => board.setSprint(value),

        epic: (board, value) => board.setEpic(value),

        loading: (board, value) => board.setLoading(!!value),

        error: (board, value) => board.setError(value ?? null),
    }),
    gantt: Object.freeze({

        tasks: (gantt, value) => gantt.setTasks(Array.isArray(value) ? value : []),

        dependencies: (gantt, value) => gantt.setDependencies(Array.isArray(value) ? value : []),
    }),
    tabs: Object.freeze({

        active: (tabs, value) => { if (typeof value === 'string')
            tabs.activate(value); },
    }),

    chart: Object.freeze({}),
    layout: Object.freeze({}),
});

const VIEWER_BULK_UPDATE = Object.freeze({ chart: 'update' });

function viewerHandlerName$1(event) {
    const parts = String(event).split(':');
    return `on${parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')}`;
}

const BY_HANDLER = Object.freeze(Object.fromEntries(Object.entries(VIEWER_EVENTS$1).map(([viewer, events]) => [
    viewer,
    Object.freeze(Object.fromEntries(events.map((e) => [viewerHandlerName$1(e), e]))),
])));

function partitionViewerProps(viewer, props) {
    const byHandler = BY_HANDLER[viewer] || {};
    const applies = VIEWER_APPLY$1[viewer] || {};

    const config = {};

    const live = {};

    const handlers = {};
    for (const [key, value] of Object.entries(props || {})) {
        if (Object.hasOwn(byHandler, key)) {
            handlers[key] = value;
            continue;
        }
        if (Object.hasOwn(applies, key)) {
            live[key] = value;
            config[key] = value;
            continue;
        }
        config[key] = value;
    }
    return { config, live, handlers };
}

function createViewerController$1(opts) {
    const viewer = String(opts.viewer);
    const mount = opts.mount;
    const label = opts.name || viewer;
    if (typeof mount !== 'function') {
        throw new TypeError(`createViewerController needs a mount factory for "${viewer}"; pass the module's own `
            + 'factory in, e.g. { createKPI } from lattice-grid/modules/kpi.');
    }
    const initial = partitionViewerProps(viewer, opts.props || {});
    const instance = mount(opts.element, { ...initial.config });
    if (!instance || typeof instance !== 'object') {
        throw new TypeError(`the ${label} factory returned no instance; nothing can be driven.`);
    }
    let handlers = initial.handlers;
    let config = initial.config;

    const live = { ...initial.live };

    const off = [];
    if (typeof instance.on === 'function') {
        for (const event of VIEWER_EVENTS$1[viewer] || []) {
            const prop = viewerHandlerName$1(event);

            const stop = instance.on(event, (payload) => {
                const fn = handlers[prop];
                if (typeof fn === 'function')
                    fn(payload);
            });
            if (typeof stop === 'function')
                off.push(stop);
        }
    }
    const bulk = VIEWER_BULK_UPDATE[viewer];
    const applies = VIEWER_APPLY$1[viewer] || {};
    let destroyed = false;
    return {
        instance,

        update(next) {
            if (destroyed)
                return;
            const parts = partitionViewerProps(viewer, next || {});
            handlers = parts.handlers;

            const changed = {};
            for (const [key, value] of Object.entries(parts.config)) {

                if (!Object.is(config[key], value))
                    changed[key] = value;
            }
            config = parts.config;
            if (!Object.keys(changed).length)
                return;

            const unapplied = [];
            for (const key of Object.keys(changed)) {
                const apply = applies[key];
                if (apply) {

                    apply(instance, changed[key]);
                    live[key] = changed[key];
                    continue;
                }
                if (bulk && typeof instance[bulk] === 'function')
                    continue;
                unapplied.push(key);
            }
            if (bulk && typeof instance[bulk] === 'function') {

                const spec = {};
                for (const key of Object.keys(changed))
                    if (!applies[key])
                        spec[key] = changed[key];
                if (Object.keys(spec).length)
                    instance[bulk](spec);
            }
            if (unapplied.length) {
                warnOnce$1(`react.viewer.${viewer}.mountOnly.${unapplied.join('.')}`, `${label}: ${unapplied.map((k) => `\`${k}\``).join(', ')} changed, but `
                    + `${label} takes ${unapplied.length === 1 ? 'it' : 'them'} only when the viewer is `
                    + 'created. Nothing was applied and the viewer was NOT rebuilt — rebuilding it silently '
                    + 'would throw away scroll position, selection and expansion. Give the component a '
                    + '`key` that changes when this must take effect, so the rebuild is yours and visible, '
                    + 'or drive the instance through the ref.');
            }
        },

        destroy() {
            if (destroyed)
                return;
            destroyed = true;
            for (const stop of off) {
                try {
                    stop();
                }
                catch {  }
            }
            off.length = 0;
            if (typeof instance.destroy === 'function')
                instance.destroy();
        },
    };
}

const EVENT_NAMES = EVENT_NAMES$1;

const VIEWER_EVENTS = VIEWER_EVENTS$1;

const VIEWER_APPLY = VIEWER_APPLY$1;

function dashedName(event) {
    return dashedName$1(event);
}

function handlerName(event) {
    return handlerName$1(event);
}

function viewerHandlerName(event) {
    return viewerHandlerName$1(event);
}

function warnOnce(key, message) {
    warnOnce$1(key, message);
}

function createGridController(opts) {
    return createGridController$1(opts);
}

function createViewerController(opts) {
    return createViewerController$1(opts);
}

function eventProp(event) {
    const parts = String(event).split(':');
    return parts[0] + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function hasObservers(emitter) {
    const subject = emitter;
    if (typeof subject.observed === 'boolean')
        return subject.observed;
    return Array.isArray(subject.observers) && subject.observers.length > 0;
}

function emitInZone(zone, emitter, payload) {
    if (!hasObservers(emitter))
        return;
    zone.run(() => emitter.emit(payload));
}

const LATTICE_ROUTER_OPTIONS = new InjectionToken('lattice.router.options');
class LatticeRouter {
    constructor() {

        this.instance = null;

        this.torn = false;

        this.factories = inject(LATTICE_FACTORIES, { optional: true });

        this.options = inject(LATTICE_ROUTER_OPTIONS, { optional: true });
    }

    get router() {
        if (!this.instance) {
            const createDataRouter = requireFactory(this.factories, 'createDataRouter', '@toclocoinc/lattice-grid/modules/data-router', 'lattice-grid route="…"');
            this.instance = createDataRouter(this.options ?? {});
        }
        return this.instance;
    }

    attach(grid, route, opts = {}) {
        if (this.torn)
            return;
        this.router.attach(grid, route, opts);
    }

    detach(grid) {
        if (this.torn || !this.instance)
            return;
        this.instance.detach(grid);
    }

    ngOnDestroy() {
        this.torn = true;
        const router = this.instance;
        this.instance = null;
        router?.destroy();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeRouter, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeRouter }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeRouter, decorators: [{
            type: Injectable
        }] });

function provideLatticeRouter(options = {}) {
    return [
        { provide: LATTICE_ROUTER_OPTIONS, useValue: options },
        LatticeRouter,
    ];
}

class LatticeGridBase {

    constructor() {

        this.elementRef = inject(ElementRef);

        this.zone = inject(NgZone);

        this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

        this.factories = inject(LATTICE_FACTORIES, { optional: true });

        this.registry = inject(LatticeGridRegistry, { optional: true });

        this.router = inject(LatticeRouter, { optional: true });

        this.injector = inject(Injector);

        this.controller = null;

        this.torn = false;

        this.publishedAs = DEFAULT_GRID_NAME;

        this.handlers = {};

        this.gridReady = new EventEmitter();

        this.gridDestroyed = new EventEmitter();

        this.ready = new EventEmitter();

        this.destroy = new EventEmitter();

        this.renderFirst = new EventEmitter();

        this.renderDone = new EventEmitter();

        this.configChanged = new EventEmitter();

        this.licenceChanged = new EventEmitter();

        this.modelChanged = new EventEmitter();

        this.rowsChanged = new EventEmitter();

        this.rowsQueued = new EventEmitter();

        this.rowsDeferred = new EventEmitter();

        this.rowsPaused = new EventEmitter();

        this.rowsResumed = new EventEmitter();

        this.rowReceived = new EventEmitter();

        this.rowSent = new EventEmitter();

        this.rowCopied = new EventEmitter();

        this.rowMoved = new EventEmitter();

        this.sourceError = new EventEmitter();

        this.streamChunk = new EventEmitter();

        this.streamEnd = new EventEmitter();

        this.streamEvicted = new EventEmitter();

        this.rowDragStarted = new EventEmitter();

        this.rowDragMoved = new EventEmitter();

        this.rowDragLeft = new EventEmitter();

        this.rowDragEnded = new EventEmitter();

        this.cellChanged = new EventEmitter();

        this.cellPending = new EventEmitter();

        this.cellConfirmed = new EventEmitter();

        this.cellReverted = new EventEmitter();

        this.cellConflict = new EventEmitter();

        this.cellClicked = new EventEmitter();

        this.cellDblclicked = new EventEmitter();

        this.cellContextmenu = new EventEmitter();

        this.cellMouseover = new EventEmitter();

        this.cellMouseout = new EventEmitter();

        this.cellMousedown = new EventEmitter();

        this.cellMouseup = new EventEmitter();

        this.cellEditStart = new EventEmitter();

        this.cellEditEnd = new EventEmitter();

        this.rowEditStart = new EventEmitter();

        this.rowEditEnd = new EventEmitter();

        this.rowClicked = new EventEmitter();

        this.rowDblclicked = new EventEmitter();

        this.rowPending = new EventEmitter();

        this.rowConfirmed = new EventEmitter();

        this.rowReverted = new EventEmitter();

        this.rowConflict = new EventEmitter();

        this.formOpened = new EventEmitter();

        this.formClosed = new EventEmitter();

        this.formSaved = new EventEmitter();

        this.formError = new EventEmitter();

        this.sortChanged = new EventEmitter();

        this.filterChanged = new EventEmitter();

        this.groupToggled = new EventEmitter();

        this.facetComputed = new EventEmitter();

        this.facetFiltered = new EventEmitter();

        this.facetExpanded = new EventEmitter();

        this.facetFailed = new EventEmitter();

        this.columnMoved = new EventEmitter();

        this.columnResized = new EventEmitter();

        this.columnVisible = new EventEmitter();

        this.columnPinned = new EventEmitter();

        this.columnGrouped = new EventEmitter();

        this.columnPivoted = new EventEmitter();

        this.columnFilterOpen = new EventEmitter();

        this.columnProfileOpen = new EventEmitter();

        this.columnMenuOpen = new EventEmitter();

        this.columnsChanged = new EventEmitter();

        this.columnsTagged = new EventEmitter();

        this.columngroupChanged = new EventEmitter();

        this.headerContextmenu = new EventEmitter();

        this.pivotDrill = new EventEmitter();

        this.selectionChanged = new EventEmitter();

        this.rangeChanged = new EventEmitter();

        this.clipboardCopy = new EventEmitter();

        this.pageChanged = new EventEmitter();

        this.scroll = new EventEmitter();

        this.scrollEnd = new EventEmitter();

        this.sizeChanged = new EventEmitter();

        this.detailToggled = new EventEmitter();

        this.toolpanelFocus = new EventEmitter();

        this.highlightChanged = new EventEmitter();

        this.findChanged = new EventEmitter();

        this.treeLoading = new EventEmitter();

        this.treeLoaded = new EventEmitter();

        this.treeLoadFailed = new EventEmitter();

        this.treeLoadAborted = new EventEmitter();

        this.stateChanged = new EventEmitter();

        this.stateReset = new EventEmitter();

        this.historyChanged = new EventEmitter();

        this.historyApplied = new EventEmitter();

        this.viewsChanged = new EventEmitter();

        this.viewApplied = new EventEmitter();

        this.viewSaved = new EventEmitter();

        this.viewRemoved = new EventEmitter();

        this.viewRenamed = new EventEmitter();

        this.viewDefault = new EventEmitter();

        this.formattingChanged = new EventEmitter();

        this.redactionChanged = new EventEmitter();

        this.permissionsChanged = new EventEmitter();

        this.presentationChanged = new EventEmitter();

        this.presentationStarted = new EventEmitter();

        this.presentationEnded = new EventEmitter();

        this.presentationView = new EventEmitter();

        this.presentationScale = new EventEmitter();

        this.presentationSpotlight = new EventEmitter();

        this.presentationCaptured = new EventEmitter();

        this.commentAdded = new EventEmitter();

        this.commentEdited = new EventEmitter();

        this.commentDeleted = new EventEmitter();

        this.commentFailed = new EventEmitter();

        this.commentResolved = new EventEmitter();

        this.commentUnresolved = new EventEmitter();

        this.commentThreadOpened = new EventEmitter();

        this.commentThreadClosed = new EventEmitter();

        this.commentIndexLoaded = new EventEmitter();

        this.presencePublished = new EventEmitter();

        this.presenceJoined = new EventEmitter();

        this.presenceUpdated = new EventEmitter();

        this.presenceLeft = new EventEmitter();

        this.presenceFailed = new EventEmitter();

        this.presenceLockRefused = new EventEmitter();

        this.diffChanged = new EventEmitter();

        this.diffSwapped = new EventEmitter();

        this.timelineAttached = new EventEmitter();

        this.timelineDetached = new EventEmitter();

        this.timelineSeek = new EventEmitter();

        this.timelineSeeking = new EventEmitter();

        this.annotationChanged = new EventEmitter();

        this.validationFailed = new EventEmitter();

        this.validationCleared = new EventEmitter();

        this.exportProgress = new EventEmitter();

        this.exportRequest = new EventEmitter();

        this.exportDone = new EventEmitter();

        this.shortcutsOpened = new EventEmitter();

        this.shortcutsClosed = new EventEmitter();

        this.printBefore = new EventEmitter();

        this.printAfter = new EventEmitter();

        this.beforeEdit = new EventEmitter();

        this.beforeSort = new EventEmitter();

        this.beforeFilter = new EventEmitter();

        this.beforeColumnMove = new EventEmitter();

        this.beforeColumnResize = new EventEmitter();

        this.beforeColumnHide = new EventEmitter();

        this.beforeSelect = new EventEmitter();

        this.beforeRowAdd = new EventEmitter();

        this.beforeDelete = new EventEmitter();

        this.beforeRowMove = new EventEmitter();

        this.beforeGroup = new EventEmitter();

        this.beforeRowReceive = new EventEmitter();

        this.editCancelled = new EventEmitter();

        this.sortCancelled = new EventEmitter();

        this.filterCancelled = new EventEmitter();

        this.columnMoveCancelled = new EventEmitter();

        this.columnResizeCancelled = new EventEmitter();

        this.columnHideCancelled = new EventEmitter();

        this.selectionCancelled = new EventEmitter();

        this.rowAddCancelled = new EventEmitter();

        this.deleteCancelled = new EventEmitter();

        this.rowMoveCancelled = new EventEmitter();

        this.groupCancelled = new EventEmitter();

        this.rowReceiveCancelled = new EventEmitter();
        for (const event of EVENT_NAMES) {
            const emitter = this[eventProp(event)];
            this.handlers[handlerName(event)] = (payload) => {
                emitInZone(this.zone, emitter, payload);
            };
        }
        afterNextRender(() => this.build(), { injector: this.injector });
    }

    get grid() {
        return this.controller ? this.controller.grid : null;
    }

    props() {
        const out = { ...this.handlers };
        const config = this.config;
        if (config && typeof config === 'object')
            Object.assign(out, config);
        if (this.sort !== undefined)
            out['sort'] = this.sort;
        if (this.filters !== undefined)
            out['filters'] = this.filters;
        if (this.quickFilter !== undefined)
            out['quickFilter'] = this.quickFilter;
        if (this.selectedKeys !== undefined)
            out['selectedKeys'] = this.selectedKeys;
        return out;
    }

    build() {
        if (this.controller || this.torn || !this.isBrowser)
            return;
        const element = this.elementRef.nativeElement;
        if (!element)
            return;
        const createGrid = requireFactory(this.factories, 'createGrid', '@toclocoinc/lattice-grid', 'lattice-grid');
        const controller = this.zone.runOutsideAngular(() => createGridController({
            createGrid,
            element,
            props: this.props(),
        }));
        this.controller = controller;
        const { grid } = controller;

        if (this.predicates) {
            this.applyPredicates(grid, this.predicates, undefined);
            this.appliedPredicates = this.predicates;
        }
        if (this.rowUpdates) {
            this.appliedRowUpdates = this.rowUpdates;
            grid.rows.apply(this.rowUpdates);
        }
        this.publishedAs = this.name || DEFAULT_GRID_NAME;
        this.registry?.publish(this.publishedAs, grid);
        if (this.route !== undefined) {
            this.router?.attach(grid, this.route, this.routeOptions ?? {});
        }
        emitInZone(this.zone, this.gridReady, grid);
    }

    ngOnChanges() {
        const controller = this.controller;
        if (!controller)
            return;
        controller.update(this.props());
        const { grid } = controller;
        if (!Object.is(this.appliedPredicates, this.predicates)) {
            this.applyPredicates(grid, this.predicates, this.appliedPredicates);
            this.appliedPredicates = this.predicates;
        }
        const updates = this.rowUpdates;
        if (updates && !Object.is(this.appliedRowUpdates, updates)) {
            this.appliedRowUpdates = updates;
            grid.rows.apply(updates);
        }
    }

    applyPredicates(grid, next, previous) {
        const now = next && typeof next === 'object' ? next : {};
        const before = previous && typeof previous === 'object' ? previous : {};
        for (const [name, fn] of Object.entries(now)) {
            if (Object.is(before[name], fn))
                continue;
            grid.filters.where(name, typeof fn === 'function' ? fn : null);
        }
        for (const name of Object.keys(before)) {
            if (!Object.hasOwn(now, name))
                grid.filters.where(name, null);
        }
    }

    ngOnDestroy() {
        this.torn = true;
        const controller = this.controller;
        this.controller = null;
        if (!controller)
            return;
        emitInZone(this.zone, this.gridDestroyed, undefined);
        const { grid } = controller;
        if (this.route !== undefined) {
            try {
                this.router?.detach(grid);
            }
            catch {  }
        }
        this.registry?.publish(this.publishedAs, null);
        this.appliedPredicates = undefined;
        this.appliedRowUpdates = undefined;
        controller.destroy();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGridBase, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.7", type: LatticeGridBase, isStandalone: true, inputs: { config: "config", sort: "sort", filters: "filters", quickFilter: "quickFilter", selectedKeys: "selectedKeys", rowUpdates: "rowUpdates", predicates: "predicates", name: "name", route: "route", routeOptions: "routeOptions" }, outputs: { gridReady: "grid-ready", gridDestroyed: "grid-destroyed", ready: "ready", destroy: "destroy", renderFirst: "render-first", renderDone: "render-done", configChanged: "config-changed", licenceChanged: "licence-changed", modelChanged: "model-changed", rowsChanged: "rows-changed", rowsQueued: "rows-queued", rowsDeferred: "rows-deferred", rowsPaused: "rows-paused", rowsResumed: "rows-resumed", rowReceived: "row-received", rowSent: "row-sent", rowCopied: "row-copied", rowMoved: "row-moved", sourceError: "source-error", streamChunk: "stream-chunk", streamEnd: "stream-end", streamEvicted: "stream-evicted", rowDragStarted: "rowDrag-started", rowDragMoved: "rowDrag-moved", rowDragLeft: "rowDrag-left", rowDragEnded: "rowDrag-ended", cellChanged: "cell-changed", cellPending: "cell-pending", cellConfirmed: "cell-confirmed", cellReverted: "cell-reverted", cellConflict: "cell-conflict", cellClicked: "cell-clicked", cellDblclicked: "cell-dblclicked", cellContextmenu: "cell-contextmenu", cellMouseover: "cell-mouseover", cellMouseout: "cell-mouseout", cellMousedown: "cell-mousedown", cellMouseup: "cell-mouseup", cellEditStart: "cell-edit-start", cellEditEnd: "cell-edit-end", rowEditStart: "row-edit-start", rowEditEnd: "row-edit-end", rowClicked: "row-clicked", rowDblclicked: "row-dblclicked", rowPending: "row-pending", rowConfirmed: "row-confirmed", rowReverted: "row-reverted", rowConflict: "row-conflict", formOpened: "form-opened", formClosed: "form-closed", formSaved: "form-saved", formError: "form-error", sortChanged: "sort-changed", filterChanged: "filter-changed", groupToggled: "group-toggled", facetComputed: "facet-computed", facetFiltered: "facet-filtered", facetExpanded: "facet-expanded", facetFailed: "facet-failed", columnMoved: "column-moved", columnResized: "column-resized", columnVisible: "column-visible", columnPinned: "column-pinned", columnGrouped: "column-grouped", columnPivoted: "column-pivoted", columnFilterOpen: "column-filter-open", columnProfileOpen: "column-profile-open", columnMenuOpen: "column-menu-open", columnsChanged: "columns-changed", columnsTagged: "columns-tagged", columngroupChanged: "columngroup-changed", headerContextmenu: "header-contextmenu", pivotDrill: "pivot-drill", selectionChanged: "selection-changed", rangeChanged: "range-changed", clipboardCopy: "clipboard-copy", pageChanged: "page-changed", scroll: "scroll", scrollEnd: "scroll-end", sizeChanged: "size-changed", detailToggled: "detail-toggled", toolpanelFocus: "toolpanel-focus", highlightChanged: "highlight-changed", findChanged: "find-changed", treeLoading: "tree-loading", treeLoaded: "tree-loaded", treeLoadFailed: "tree-loadFailed", treeLoadAborted: "tree-loadAborted", stateChanged: "state-changed", stateReset: "state-reset", historyChanged: "history-changed", historyApplied: "history-applied", viewsChanged: "views-changed", viewApplied: "view-applied", viewSaved: "view-saved", viewRemoved: "view-removed", viewRenamed: "view-renamed", viewDefault: "view-default", formattingChanged: "formatting-changed", redactionChanged: "redaction-changed", permissionsChanged: "permissions-changed", presentationChanged: "presentation-changed", presentationStarted: "presentation-started", presentationEnded: "presentation-ended", presentationView: "presentation-view", presentationScale: "presentation-scale", presentationSpotlight: "presentation-spotlight", presentationCaptured: "presentation-captured", commentAdded: "comment-added", commentEdited: "comment-edited", commentDeleted: "comment-deleted", commentFailed: "comment-failed", commentResolved: "comment-resolved", commentUnresolved: "comment-unresolved", commentThreadOpened: "comment-threadOpened", commentThreadClosed: "comment-threadClosed", commentIndexLoaded: "comment-indexLoaded", presencePublished: "presence-published", presenceJoined: "presence-joined", presenceUpdated: "presence-updated", presenceLeft: "presence-left", presenceFailed: "presence-failed", presenceLockRefused: "presence-lockRefused", diffChanged: "diff-changed", diffSwapped: "diff-swapped", timelineAttached: "timeline-attached", timelineDetached: "timeline-detached", timelineSeek: "timeline-seek", timelineSeeking: "timeline-seeking", annotationChanged: "annotation-changed", validationFailed: "validation-failed", validationCleared: "validation-cleared", exportProgress: "export-progress", exportRequest: "export-request", exportDone: "export-done", shortcutsOpened: "shortcuts-opened", shortcutsClosed: "shortcuts-closed", printBefore: "print-before", printAfter: "print-after", beforeEdit: "beforeEdit", beforeSort: "beforeSort", beforeFilter: "beforeFilter", beforeColumnMove: "beforeColumnMove", beforeColumnResize: "beforeColumnResize", beforeColumnHide: "beforeColumnHide", beforeSelect: "beforeSelect", beforeRowAdd: "beforeRowAdd", beforeDelete: "beforeDelete", beforeRowMove: "beforeRowMove", beforeGroup: "beforeGroup", beforeRowReceive: "beforeRowReceive", editCancelled: "edit-cancelled", sortCancelled: "sort-cancelled", filterCancelled: "filter-cancelled", columnMoveCancelled: "columnMove-cancelled", columnResizeCancelled: "columnResize-cancelled", columnHideCancelled: "columnHide-cancelled", selectionCancelled: "selection-cancelled", rowAddCancelled: "rowAdd-cancelled", deleteCancelled: "delete-cancelled", rowMoveCancelled: "rowMove-cancelled", groupCancelled: "group-cancelled", rowReceiveCancelled: "rowReceive-cancelled" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGridBase, decorators: [{
            type: Directive
        }], ctorParameters: () => [], propDecorators: { config: [{
                type: Input
            }], sort: [{
                type: Input
            }], filters: [{
                type: Input
            }], quickFilter: [{
                type: Input
            }], selectedKeys: [{
                type: Input
            }], rowUpdates: [{
                type: Input
            }], predicates: [{
                type: Input
            }], name: [{
                type: Input
            }], route: [{
                type: Input
            }], routeOptions: [{
                type: Input
            }], gridReady: [{
                type: Output,
                args: ['grid-ready']
            }], gridDestroyed: [{
                type: Output,
                args: ['grid-destroyed']
            }], ready: [{
                type: Output,
                args: ['ready']
            }], destroy: [{
                type: Output,
                args: ['destroy']
            }], renderFirst: [{
                type: Output,
                args: ['render-first']
            }], renderDone: [{
                type: Output,
                args: ['render-done']
            }], configChanged: [{
                type: Output,
                args: ['config-changed']
            }], licenceChanged: [{
                type: Output,
                args: ['licence-changed']
            }], modelChanged: [{
                type: Output,
                args: ['model-changed']
            }], rowsChanged: [{
                type: Output,
                args: ['rows-changed']
            }], rowsQueued: [{
                type: Output,
                args: ['rows-queued']
            }], rowsDeferred: [{
                type: Output,
                args: ['rows-deferred']
            }], rowsPaused: [{
                type: Output,
                args: ['rows-paused']
            }], rowsResumed: [{
                type: Output,
                args: ['rows-resumed']
            }], rowReceived: [{
                type: Output,
                args: ['row-received']
            }], rowSent: [{
                type: Output,
                args: ['row-sent']
            }], rowCopied: [{
                type: Output,
                args: ['row-copied']
            }], rowMoved: [{
                type: Output,
                args: ['row-moved']
            }], sourceError: [{
                type: Output,
                args: ['source-error']
            }], streamChunk: [{
                type: Output,
                args: ['stream-chunk']
            }], streamEnd: [{
                type: Output,
                args: ['stream-end']
            }], streamEvicted: [{
                type: Output,
                args: ['stream-evicted']
            }], rowDragStarted: [{
                type: Output,
                args: ['rowDrag-started']
            }], rowDragMoved: [{
                type: Output,
                args: ['rowDrag-moved']
            }], rowDragLeft: [{
                type: Output,
                args: ['rowDrag-left']
            }], rowDragEnded: [{
                type: Output,
                args: ['rowDrag-ended']
            }], cellChanged: [{
                type: Output,
                args: ['cell-changed']
            }], cellPending: [{
                type: Output,
                args: ['cell-pending']
            }], cellConfirmed: [{
                type: Output,
                args: ['cell-confirmed']
            }], cellReverted: [{
                type: Output,
                args: ['cell-reverted']
            }], cellConflict: [{
                type: Output,
                args: ['cell-conflict']
            }], cellClicked: [{
                type: Output,
                args: ['cell-clicked']
            }], cellDblclicked: [{
                type: Output,
                args: ['cell-dblclicked']
            }], cellContextmenu: [{
                type: Output,
                args: ['cell-contextmenu']
            }], cellMouseover: [{
                type: Output,
                args: ['cell-mouseover']
            }], cellMouseout: [{
                type: Output,
                args: ['cell-mouseout']
            }], cellMousedown: [{
                type: Output,
                args: ['cell-mousedown']
            }], cellMouseup: [{
                type: Output,
                args: ['cell-mouseup']
            }], cellEditStart: [{
                type: Output,
                args: ['cell-edit-start']
            }], cellEditEnd: [{
                type: Output,
                args: ['cell-edit-end']
            }], rowEditStart: [{
                type: Output,
                args: ['row-edit-start']
            }], rowEditEnd: [{
                type: Output,
                args: ['row-edit-end']
            }], rowClicked: [{
                type: Output,
                args: ['row-clicked']
            }], rowDblclicked: [{
                type: Output,
                args: ['row-dblclicked']
            }], rowPending: [{
                type: Output,
                args: ['row-pending']
            }], rowConfirmed: [{
                type: Output,
                args: ['row-confirmed']
            }], rowReverted: [{
                type: Output,
                args: ['row-reverted']
            }], rowConflict: [{
                type: Output,
                args: ['row-conflict']
            }], formOpened: [{
                type: Output,
                args: ['form-opened']
            }], formClosed: [{
                type: Output,
                args: ['form-closed']
            }], formSaved: [{
                type: Output,
                args: ['form-saved']
            }], formError: [{
                type: Output,
                args: ['form-error']
            }], sortChanged: [{
                type: Output,
                args: ['sort-changed']
            }], filterChanged: [{
                type: Output,
                args: ['filter-changed']
            }], groupToggled: [{
                type: Output,
                args: ['group-toggled']
            }], facetComputed: [{
                type: Output,
                args: ['facet-computed']
            }], facetFiltered: [{
                type: Output,
                args: ['facet-filtered']
            }], facetExpanded: [{
                type: Output,
                args: ['facet-expanded']
            }], facetFailed: [{
                type: Output,
                args: ['facet-failed']
            }], columnMoved: [{
                type: Output,
                args: ['column-moved']
            }], columnResized: [{
                type: Output,
                args: ['column-resized']
            }], columnVisible: [{
                type: Output,
                args: ['column-visible']
            }], columnPinned: [{
                type: Output,
                args: ['column-pinned']
            }], columnGrouped: [{
                type: Output,
                args: ['column-grouped']
            }], columnPivoted: [{
                type: Output,
                args: ['column-pivoted']
            }], columnFilterOpen: [{
                type: Output,
                args: ['column-filter-open']
            }], columnProfileOpen: [{
                type: Output,
                args: ['column-profile-open']
            }], columnMenuOpen: [{
                type: Output,
                args: ['column-menu-open']
            }], columnsChanged: [{
                type: Output,
                args: ['columns-changed']
            }], columnsTagged: [{
                type: Output,
                args: ['columns-tagged']
            }], columngroupChanged: [{
                type: Output,
                args: ['columngroup-changed']
            }], headerContextmenu: [{
                type: Output,
                args: ['header-contextmenu']
            }], pivotDrill: [{
                type: Output,
                args: ['pivot-drill']
            }], selectionChanged: [{
                type: Output,
                args: ['selection-changed']
            }], rangeChanged: [{
                type: Output,
                args: ['range-changed']
            }], clipboardCopy: [{
                type: Output,
                args: ['clipboard-copy']
            }], pageChanged: [{
                type: Output,
                args: ['page-changed']
            }], scroll: [{
                type: Output,
                args: ['scroll']
            }], scrollEnd: [{
                type: Output,
                args: ['scroll-end']
            }], sizeChanged: [{
                type: Output,
                args: ['size-changed']
            }], detailToggled: [{
                type: Output,
                args: ['detail-toggled']
            }], toolpanelFocus: [{
                type: Output,
                args: ['toolpanel-focus']
            }], highlightChanged: [{
                type: Output,
                args: ['highlight-changed']
            }], findChanged: [{
                type: Output,
                args: ['find-changed']
            }], treeLoading: [{
                type: Output,
                args: ['tree-loading']
            }], treeLoaded: [{
                type: Output,
                args: ['tree-loaded']
            }], treeLoadFailed: [{
                type: Output,
                args: ['tree-loadFailed']
            }], treeLoadAborted: [{
                type: Output,
                args: ['tree-loadAborted']
            }], stateChanged: [{
                type: Output,
                args: ['state-changed']
            }], stateReset: [{
                type: Output,
                args: ['state-reset']
            }], historyChanged: [{
                type: Output,
                args: ['history-changed']
            }], historyApplied: [{
                type: Output,
                args: ['history-applied']
            }], viewsChanged: [{
                type: Output,
                args: ['views-changed']
            }], viewApplied: [{
                type: Output,
                args: ['view-applied']
            }], viewSaved: [{
                type: Output,
                args: ['view-saved']
            }], viewRemoved: [{
                type: Output,
                args: ['view-removed']
            }], viewRenamed: [{
                type: Output,
                args: ['view-renamed']
            }], viewDefault: [{
                type: Output,
                args: ['view-default']
            }], formattingChanged: [{
                type: Output,
                args: ['formatting-changed']
            }], redactionChanged: [{
                type: Output,
                args: ['redaction-changed']
            }], permissionsChanged: [{
                type: Output,
                args: ['permissions-changed']
            }], presentationChanged: [{
                type: Output,
                args: ['presentation-changed']
            }], presentationStarted: [{
                type: Output,
                args: ['presentation-started']
            }], presentationEnded: [{
                type: Output,
                args: ['presentation-ended']
            }], presentationView: [{
                type: Output,
                args: ['presentation-view']
            }], presentationScale: [{
                type: Output,
                args: ['presentation-scale']
            }], presentationSpotlight: [{
                type: Output,
                args: ['presentation-spotlight']
            }], presentationCaptured: [{
                type: Output,
                args: ['presentation-captured']
            }], commentAdded: [{
                type: Output,
                args: ['comment-added']
            }], commentEdited: [{
                type: Output,
                args: ['comment-edited']
            }], commentDeleted: [{
                type: Output,
                args: ['comment-deleted']
            }], commentFailed: [{
                type: Output,
                args: ['comment-failed']
            }], commentResolved: [{
                type: Output,
                args: ['comment-resolved']
            }], commentUnresolved: [{
                type: Output,
                args: ['comment-unresolved']
            }], commentThreadOpened: [{
                type: Output,
                args: ['comment-threadOpened']
            }], commentThreadClosed: [{
                type: Output,
                args: ['comment-threadClosed']
            }], commentIndexLoaded: [{
                type: Output,
                args: ['comment-indexLoaded']
            }], presencePublished: [{
                type: Output,
                args: ['presence-published']
            }], presenceJoined: [{
                type: Output,
                args: ['presence-joined']
            }], presenceUpdated: [{
                type: Output,
                args: ['presence-updated']
            }], presenceLeft: [{
                type: Output,
                args: ['presence-left']
            }], presenceFailed: [{
                type: Output,
                args: ['presence-failed']
            }], presenceLockRefused: [{
                type: Output,
                args: ['presence-lockRefused']
            }], diffChanged: [{
                type: Output,
                args: ['diff-changed']
            }], diffSwapped: [{
                type: Output,
                args: ['diff-swapped']
            }], timelineAttached: [{
                type: Output,
                args: ['timeline-attached']
            }], timelineDetached: [{
                type: Output,
                args: ['timeline-detached']
            }], timelineSeek: [{
                type: Output,
                args: ['timeline-seek']
            }], timelineSeeking: [{
                type: Output,
                args: ['timeline-seeking']
            }], annotationChanged: [{
                type: Output,
                args: ['annotation-changed']
            }], validationFailed: [{
                type: Output,
                args: ['validation-failed']
            }], validationCleared: [{
                type: Output,
                args: ['validation-cleared']
            }], exportProgress: [{
                type: Output,
                args: ['export-progress']
            }], exportRequest: [{
                type: Output,
                args: ['export-request']
            }], exportDone: [{
                type: Output,
                args: ['export-done']
            }], shortcutsOpened: [{
                type: Output,
                args: ['shortcuts-opened']
            }], shortcutsClosed: [{
                type: Output,
                args: ['shortcuts-closed']
            }], printBefore: [{
                type: Output,
                args: ['print-before']
            }], printAfter: [{
                type: Output,
                args: ['print-after']
            }], beforeEdit: [{
                type: Output,
                args: ['beforeEdit']
            }], beforeSort: [{
                type: Output,
                args: ['beforeSort']
            }], beforeFilter: [{
                type: Output,
                args: ['beforeFilter']
            }], beforeColumnMove: [{
                type: Output,
                args: ['beforeColumnMove']
            }], beforeColumnResize: [{
                type: Output,
                args: ['beforeColumnResize']
            }], beforeColumnHide: [{
                type: Output,
                args: ['beforeColumnHide']
            }], beforeSelect: [{
                type: Output,
                args: ['beforeSelect']
            }], beforeRowAdd: [{
                type: Output,
                args: ['beforeRowAdd']
            }], beforeDelete: [{
                type: Output,
                args: ['beforeDelete']
            }], beforeRowMove: [{
                type: Output,
                args: ['beforeRowMove']
            }], beforeGroup: [{
                type: Output,
                args: ['beforeGroup']
            }], beforeRowReceive: [{
                type: Output,
                args: ['beforeRowReceive']
            }], editCancelled: [{
                type: Output,
                args: ['edit-cancelled']
            }], sortCancelled: [{
                type: Output,
                args: ['sort-cancelled']
            }], filterCancelled: [{
                type: Output,
                args: ['filter-cancelled']
            }], columnMoveCancelled: [{
                type: Output,
                args: ['columnMove-cancelled']
            }], columnResizeCancelled: [{
                type: Output,
                args: ['columnResize-cancelled']
            }], columnHideCancelled: [{
                type: Output,
                args: ['columnHide-cancelled']
            }], selectionCancelled: [{
                type: Output,
                args: ['selection-cancelled']
            }], rowAddCancelled: [{
                type: Output,
                args: ['rowAdd-cancelled']
            }], deleteCancelled: [{
                type: Output,
                args: ['delete-cancelled']
            }], rowMoveCancelled: [{
                type: Output,
                args: ['rowMove-cancelled']
            }], groupCancelled: [{
                type: Output,
                args: ['group-cancelled']
            }], rowReceiveCancelled: [{
                type: Output,
                args: ['rowReceive-cancelled']
            }] } });

class LatticeGridComponent extends LatticeGridBase {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGridComponent, deps: null, target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.1.7", type: LatticeGridComponent, isStandalone: true, selector: "lattice-grid", usesInheritance: true, ngImport: i0, template: '', isInline: true, styles: [":host{display:block}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGridComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lattice-grid', template: '', encapsulation: ViewEncapsulation.Emulated, styles: [":host{display:block}\n"] }]
        }] });

class LatticeGridDirective extends LatticeGridBase {

    set latticeGrid(config) {
        if (config !== '')
            this.config = config;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGridDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.7", type: LatticeGridDirective, isStandalone: true, selector: "[latticeGrid]", inputs: { latticeGrid: "latticeGrid" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGridDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[latticeGrid]' }]
        }], propDecorators: { latticeGrid: [{
                type: Input,
                args: ['latticeGrid']
            }] } });

class LatticeViewerBase {

    constructor() {

        this.requiresGrid = false;

        this.takesGrid = true;

        this.fromRegistry = true;

        this.elementRef = inject(ElementRef);

        this.zone = inject(NgZone);

        this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

        this.registry = inject(LatticeGridRegistry, { optional: true });

        this.injector = inject(Injector);

        this.explicitGrid = signal(undefined, 
        ...(ngDevMode ? [{ debugName: "explicitGrid" }] :  []));

        this.gridNameInput = signal(DEFAULT_GRID_NAME, 
        ...(ngDevMode ? [{ debugName: "gridNameInput" }] :  []));

        this.controller = null;

        this.builtAgainst = null;

        this.rendered = false;

        this.torn = false;

        this.handlers = {};

        this.ready = new EventEmitter();

        this.destroyed = new EventEmitter();

        this.boundGrid = computed(() => {
            if (!this.takesGrid)
                return null;
            const explicit = this.explicitGrid();
            if (explicit !== undefined)
                return explicit;
            if (!this.fromRegistry)
                return null;
            const registry = this.registry;
            return registry ? registry.grid(this.gridNameInput())() : null;
        }, 
        ...(ngDevMode ? [{ debugName: "boundGrid" }] :  []));
        afterNextRender(() => {
            this.rendered = true;
            this.reconcile();
        }, { injector: this.injector });
        effect(() => {

            this.boundGrid();
            if (this.rendered)
                this.reconcile();
        }, { injector: this.injector });
    }

    get instance() {
        return this.controller ? this.controller.instance : null;
    }

    liveProps() {
        return {};
    }

    props() {
        const out = { ...this.handlers };
        if (this.config && typeof this.config === 'object')
            Object.assign(out, this.config);
        Object.assign(out, this.liveProps());

        const grid = this.boundGrid();
        if (grid)
            out['grid'] = grid;
        return out;
    }

    reconcile() {
        if (this.torn || !this.rendered || !this.isBrowser)
            return;
        const grid = this.boundGrid();
        if (this.controller) {
            if (Object.is(this.builtAgainst, grid))
                return;

            this.teardown();
        }
        if (this.requiresGrid && !grid)
            return;
        const element = this.elementRef.nativeElement;
        if (!element)
            return;
        this.handlers = {};
        for (const event of VIEWER_EVENTS[this.viewer] ?? []) {
            const emitter = this[eventProp(event)];
            if (!emitter)
                continue;
            this.handlers[viewerHandlerName(event)] = (payload) => {
                emitInZone(this.zone, emitter, payload);
            };
        }
        const controller = this.zone.runOutsideAngular(() => createViewerController({
            viewer: this.viewer,
            mount: (el, config) => this.mount(el, config),
            element,
            props: this.props(),
            name: this.label,
        }));
        this.controller = controller;
        this.builtAgainst = grid;
        emitInZone(this.zone, this.ready, controller.instance);
    }

    ngOnChanges() {
        this.explicitGrid.set(this.takesGrid ? this.grid ?? undefined : undefined);
        this.gridNameInput.set(this.gridName || DEFAULT_GRID_NAME);
        if (this.controller)
            this.controller.update(this.props());
    }

    ngOnDestroy() {
        this.torn = true;
        this.teardown();
    }

    teardown() {
        const controller = this.controller;
        this.controller = null;
        this.builtAgainst = null;
        if (!controller)
            return;
        emitInZone(this.zone, this.destroyed, undefined);
        controller.destroy();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeViewerBase, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.7", type: LatticeViewerBase, isStandalone: true, inputs: { config: "config", grid: "grid", gridName: "gridName" }, outputs: { ready: "ready", destroyed: "destroyed" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeViewerBase, decorators: [{
            type: Directive
        }], ctorParameters: () => [], propDecorators: { config: [{
                type: Input
            }], grid: [{
                type: Input
            }], gridName: [{
                type: Input
            }], ready: [{
                type: Output
            }], destroyed: [{
                type: Output
            }] } });

class LatticeKpiComponent extends LatticeViewerBase {
    constructor() {
        super(...arguments);

        this.viewer = 'kpi';

        this.label = 'lattice-kpi';

        this.factories = inject(LATTICE_FACTORIES, { optional: true });

        this.tileClick = new EventEmitter();

        this.tileDblclick = new EventEmitter();

        this.tileContextmenu = new EventEmitter();

        this.nodeToggle = new EventEmitter();

        this.change = new EventEmitter();
    }

    liveProps() {
        return this.rows === undefined ? {} : { rows: this.rows };
    }

    mount(element, config) {
        const createKPI = requireFactory(this.factories, 'createKPI', '@toclocoinc/lattice-grid/modules/kpi', this.label);
        return createKPI(element, config);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeKpiComponent, deps: null, target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.1.7", type: LatticeKpiComponent, isStandalone: true, selector: "lattice-kpi", inputs: { config: "config", rows: "rows" }, outputs: { tileClick: "tile-click", tileDblclick: "tile-dblclick", tileContextmenu: "tile-contextmenu", nodeToggle: "node-toggle", change: "change" }, usesInheritance: true, ngImport: i0, template: '', isInline: true, styles: [":host{display:block}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeKpiComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lattice-kpi', template: '', encapsulation: ViewEncapsulation.Emulated, styles: [":host{display:block}\n"] }]
        }], propDecorators: { config: [{
                type: Input
            }], rows: [{
                type: Input
            }], tileClick: [{
                type: Output,
                args: ['tile-click']
            }], tileDblclick: [{
                type: Output,
                args: ['tile-dblclick']
            }], tileContextmenu: [{
                type: Output,
                args: ['tile-contextmenu']
            }], nodeToggle: [{
                type: Output,
                args: ['node-toggle']
            }], change: [{
                type: Output
            }] } });

class LatticeChartComponent extends LatticeViewerBase {
    constructor() {
        super(...arguments);

        this.viewer = 'chart';

        this.label = 'lattice-chart';

        this.requiresGrid = true;

        this.factories = inject(LATTICE_FACTORIES, { optional: true });

        this.click = new EventEmitter();

        this.hover = new EventEmitter();

        this.leave = new EventEmitter();

        this.draw = new EventEmitter();

        this.legend = new EventEmitter();
    }

    mount(element, config) {
        const createChart = requireFactory(this.factories, 'createChart', '@toclocoinc/lattice-grid/modules/charts', this.label);
        return createChart({ ...config, container: element });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeChartComponent, deps: null, target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.1.7", type: LatticeChartComponent, isStandalone: true, selector: "lattice-chart", inputs: { config: "config" }, outputs: { click: "click", hover: "hover", leave: "leave", draw: "draw", legend: "legend" }, usesInheritance: true, ngImport: i0, template: '', isInline: true, styles: [":host{display:block}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeChartComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lattice-chart', template: '', encapsulation: ViewEncapsulation.Emulated, styles: [":host{display:block}\n"] }]
        }], propDecorators: { config: [{
                type: Input
            }], click: [{
                type: Output
            }], hover: [{
                type: Output
            }], leave: [{
                type: Output
            }], draw: [{
                type: Output
            }], legend: [{
                type: Output
            }] } });

class LatticeKanbanComponent extends LatticeViewerBase {
    constructor() {
        super(...arguments);

        this.viewer = 'kanban';

        this.label = 'lattice-kanban';

        this.factories = inject(LATTICE_FACTORIES, { optional: true });

        this.cardClick = new EventEmitter();

        this.cardDblclick = new EventEmitter();

        this.cardContextmenu = new EventEmitter();

        this.cardMove = new EventEmitter();

        this.cardReverted = new EventEmitter();

        this.cardConfirmed = new EventEmitter();

        this.selectionChanged = new EventEmitter();

        this.columnCollapse = new EventEmitter();

        this.cardAdd = new EventEmitter();

        this.dragStart = new EventEmitter();

        this.dragEnd = new EventEmitter();

        this.swimlaneCollapse = new EventEmitter();

        this.swimlaneReorder = new EventEmitter();

        this.columnReorder = new EventEmitter();

        this.filterChanged = new EventEmitter();

        this.sprintChanged = new EventEmitter();

        this.epicChanged = new EventEmitter();

        this.cardExpand = new EventEmitter();

        this.cardDrill = new EventEmitter();

        this.cardEdit = new EventEmitter();

        this.cardSla = new EventEmitter();

        this.beforeMove = new EventEmitter();

        this.beforeAdd = new EventEmitter();

        this.beforeEdit = new EventEmitter();

        this.beforeLaneReorder = new EventEmitter();

        this.beforeColumnReorder = new EventEmitter();

        this.beforeColumnChange = new EventEmitter();

        this.moveCancelled = new EventEmitter();

        this.addCancelled = new EventEmitter();

        this.editCancelled = new EventEmitter();

        this.laneReorderCancelled = new EventEmitter();

        this.columnReorderCancelled = new EventEmitter();

        this.columnChangeCancelled = new EventEmitter();
    }

    liveProps() {
        const out = {};
        if (this.rows !== undefined)
            out['rows'] = this.rows;
        if (this.quickFilter !== undefined)
            out['quickFilter'] = this.quickFilter;
        if (this.sprint !== undefined)
            out['sprint'] = this.sprint;
        if (this.epic !== undefined)
            out['epic'] = this.epic;
        if (this.loading !== undefined)
            out['loading'] = this.loading;
        if (this.error !== undefined)
            out['error'] = this.error;
        return out;
    }

    mount(element, config) {
        const createKanban = requireFactory(this.factories, 'createKanban', '@toclocoinc/lattice-grid/modules/kanban', this.label);
        return createKanban(element, config);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeKanbanComponent, deps: null, target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.1.7", type: LatticeKanbanComponent, isStandalone: true, selector: "lattice-kanban", inputs: { config: "config", rows: "rows", quickFilter: "quickFilter", sprint: "sprint", epic: "epic", loading: "loading", error: "error" }, outputs: { cardClick: "card-click", cardDblclick: "card-dblclick", cardContextmenu: "card-contextmenu", cardMove: "card-move", cardReverted: "card-reverted", cardConfirmed: "card-confirmed", selectionChanged: "selection-changed", columnCollapse: "column-collapse", cardAdd: "card-add", dragStart: "drag-start", dragEnd: "drag-end", swimlaneCollapse: "swimlane-collapse", swimlaneReorder: "swimlane-reorder", columnReorder: "column-reorder", filterChanged: "filter-changed", sprintChanged: "sprint-changed", epicChanged: "epic-changed", cardExpand: "card-expand", cardDrill: "card-drill", cardEdit: "card-edit", cardSla: "card-sla", beforeMove: "beforeMove", beforeAdd: "beforeAdd", beforeEdit: "beforeEdit", beforeLaneReorder: "beforeLaneReorder", beforeColumnReorder: "beforeColumnReorder", beforeColumnChange: "beforeColumnChange", moveCancelled: "move-cancelled", addCancelled: "add-cancelled", editCancelled: "edit-cancelled", laneReorderCancelled: "laneReorder-cancelled", columnReorderCancelled: "columnReorder-cancelled", columnChangeCancelled: "columnChange-cancelled" }, usesInheritance: true, ngImport: i0, template: '', isInline: true, styles: [":host{display:block}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeKanbanComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lattice-kanban', template: '', encapsulation: ViewEncapsulation.Emulated, styles: [":host{display:block}\n"] }]
        }], propDecorators: { config: [{
                type: Input
            }], rows: [{
                type: Input
            }], quickFilter: [{
                type: Input
            }], sprint: [{
                type: Input
            }], epic: [{
                type: Input
            }], loading: [{
                type: Input
            }], error: [{
                type: Input
            }], cardClick: [{
                type: Output,
                args: ['card-click']
            }], cardDblclick: [{
                type: Output,
                args: ['card-dblclick']
            }], cardContextmenu: [{
                type: Output,
                args: ['card-contextmenu']
            }], cardMove: [{
                type: Output,
                args: ['card-move']
            }], cardReverted: [{
                type: Output,
                args: ['card-reverted']
            }], cardConfirmed: [{
                type: Output,
                args: ['card-confirmed']
            }], selectionChanged: [{
                type: Output,
                args: ['selection-changed']
            }], columnCollapse: [{
                type: Output,
                args: ['column-collapse']
            }], cardAdd: [{
                type: Output,
                args: ['card-add']
            }], dragStart: [{
                type: Output,
                args: ['drag-start']
            }], dragEnd: [{
                type: Output,
                args: ['drag-end']
            }], swimlaneCollapse: [{
                type: Output,
                args: ['swimlane-collapse']
            }], swimlaneReorder: [{
                type: Output,
                args: ['swimlane-reorder']
            }], columnReorder: [{
                type: Output,
                args: ['column-reorder']
            }], filterChanged: [{
                type: Output,
                args: ['filter-changed']
            }], sprintChanged: [{
                type: Output,
                args: ['sprint-changed']
            }], epicChanged: [{
                type: Output,
                args: ['epic-changed']
            }], cardExpand: [{
                type: Output,
                args: ['card-expand']
            }], cardDrill: [{
                type: Output,
                args: ['card-drill']
            }], cardEdit: [{
                type: Output,
                args: ['card-edit']
            }], cardSla: [{
                type: Output,
                args: ['card-sla']
            }], beforeMove: [{
                type: Output
            }], beforeAdd: [{
                type: Output
            }], beforeEdit: [{
                type: Output
            }], beforeLaneReorder: [{
                type: Output
            }], beforeColumnReorder: [{
                type: Output
            }], beforeColumnChange: [{
                type: Output
            }], moveCancelled: [{
                type: Output,
                args: ['move-cancelled']
            }], addCancelled: [{
                type: Output,
                args: ['add-cancelled']
            }], editCancelled: [{
                type: Output,
                args: ['edit-cancelled']
            }], laneReorderCancelled: [{
                type: Output,
                args: ['laneReorder-cancelled']
            }], columnReorderCancelled: [{
                type: Output,
                args: ['columnReorder-cancelled']
            }], columnChangeCancelled: [{
                type: Output,
                args: ['columnChange-cancelled']
            }] } });

class LatticeGanttComponent extends LatticeViewerBase {
    constructor() {
        super(...arguments);

        this.viewer = 'gantt';

        this.label = 'lattice-gantt';

        this.fromRegistry = false;

        this.factories = inject(LATTICE_FACTORIES, { optional: true });

        this.schedule = new EventEmitter();

        this.error = new EventEmitter();
    }

    liveProps() {
        const out = {};
        if (this.tasks !== undefined)
            out['tasks'] = this.tasks;
        if (this.dependencies !== undefined)
            out['dependencies'] = this.dependencies;
        return out;
    }

    mount(element, config) {
        const createGantt = requireFactory(this.factories, 'createGantt', '@toclocoinc/lattice-grid/modules/gantt', this.label);
        return createGantt({ ...config, element });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGanttComponent, deps: null, target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.1.7", type: LatticeGanttComponent, isStandalone: true, selector: "lattice-gantt", inputs: { config: "config", tasks: "tasks", dependencies: "dependencies" }, outputs: { schedule: "schedule", error: "error" }, usesInheritance: true, ngImport: i0, template: '', isInline: true, styles: [":host{display:block}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeGanttComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lattice-gantt', template: '', encapsulation: ViewEncapsulation.Emulated, styles: [":host{display:block}\n"] }]
        }], propDecorators: { config: [{
                type: Input
            }], tasks: [{
                type: Input
            }], dependencies: [{
                type: Input
            }], schedule: [{
                type: Output
            }], error: [{
                type: Output
            }] } });

class LatticeLayoutComponent extends LatticeViewerBase {
    constructor() {
        super(...arguments);

        this.viewer = 'layout';

        this.label = 'lattice-layout';

        this.takesGrid = false;

        this.factories = inject(LATTICE_FACTORIES, { optional: true });

        this.layoutChanged = new EventEmitter();

        this.windowMoved = new EventEmitter();

        this.windowResized = new EventEmitter();

        this.windowClosed = new EventEmitter();

        this.beforeWindowClose = new EventEmitter();

        this.windowCloseCancelled = new EventEmitter();
    }

    mount(element, config) {
        const createLayout = requireFactory(this.factories, 'createLayout', '@toclocoinc/lattice-grid/modules/layout', this.label);
        return createLayout(element, config);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeLayoutComponent, deps: null, target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.1.7", type: LatticeLayoutComponent, isStandalone: true, selector: "lattice-layout", inputs: { config: "config" }, outputs: { layoutChanged: "layout-changed", windowMoved: "window-moved", windowResized: "window-resized", windowClosed: "window-closed", beforeWindowClose: "beforeWindowClose", windowCloseCancelled: "windowClose-cancelled" }, usesInheritance: true, ngImport: i0, template: '', isInline: true, styles: [":host{display:block}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeLayoutComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lattice-layout', template: '', encapsulation: ViewEncapsulation.Emulated, styles: [":host{display:block}\n"] }]
        }], propDecorators: { config: [{
                type: Input
            }], layoutChanged: [{
                type: Output,
                args: ['layout-changed']
            }], windowMoved: [{
                type: Output,
                args: ['window-moved']
            }], windowResized: [{
                type: Output,
                args: ['window-resized']
            }], windowClosed: [{
                type: Output,
                args: ['window-closed']
            }], beforeWindowClose: [{
                type: Output
            }], windowCloseCancelled: [{
                type: Output,
                args: ['windowClose-cancelled']
            }] } });

class LatticeTabDirective {
    constructor() {

        this.template = inject(TemplateRef);

        this.tabId = '';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeTabDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.7", type: LatticeTabDirective, isStandalone: true, selector: "ng-template[latticeTab]", inputs: { tabId: ["latticeTab", "tabId"] }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeTabDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'ng-template[latticeTab]' }]
        }], propDecorators: { tabId: [{
                type: Input,
                args: ['latticeTab']
            }] } });
class LatticeTabsComponent {

    constructor() {

        this.elementRef = inject(ElementRef);

        this.zone = inject(NgZone);

        this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

        this.factories = inject(LATTICE_FACTORIES, { optional: true });

        this.viewContainer = inject(ViewContainerRef);

        this.injector = inject(Injector);

        this.strip = null;

        this.torn = false;

        this.off = [];

        this.views = new Map();

        this.ready = new EventEmitter();

        this.destroyed = new EventEmitter();

        this.beforeTabChange = new EventEmitter();

        this.tabChanged = new EventEmitter();

        this.tabChangeCancelled = new EventEmitter();
        afterNextRender(() => this.build(), { injector: this.injector });
    }

    get instance() {
        return this.strip;
    }

    templateFor(id) {
        return this.templates?.find((entry) => entry.tabId === id);
    }

    renderInto(id, template, body) {
        const view = this.zone.run(() => this.viewContainer.createEmbeddedView(template));
        for (const node of view.rootNodes)
            body.append(node);
        view.detectChanges();
        this.views.set(id, view);
        return {

            destroy: () => {
                this.views.delete(id);
                view.destroy();
            },
        };
    }

    build() {
        if (this.strip || this.torn || !this.isBrowser)
            return;
        const host = this.elementRef.nativeElement.firstElementChild;
        if (!host)
            return;
        const createTabs = requireFactory(this.factories, 'createTabs', '@toclocoinc/lattice-grid/modules/tabs', 'lattice-tabs');
        const declared = Array.isArray(this.tabs) ? this.tabs : [];
        const descriptors = declared.map((tab) => {
            const id = String(tab['id'] ?? '');
            const content = this.templateFor(id);
            if (!content)
                return tab;
            return {
                ...tab,

                view: (body) => this.renderInto(id, content.template, body),
            };
        });
        const config = { ...this.config };
        config['tabs'] = descriptors;

        config['createGrid'] = this.factories?.createGrid ?? (() => {
            throw new Error('[lattice] <lattice-tabs>: a tab has neither an <ng-template latticeTab="…"> nor a '
                + 'provided createGrid, so there is nothing to build it with. Give the tab a template, '
                + 'or add createGrid to provideLattice({ … }).');
        });
        if (typeof this.active === 'string')
            config['active'] = this.active;
        const strip = this.zone.runOutsideAngular(() => createTabs(host, config));
        this.strip = strip;
        this.builtFrom = this.tabs;
        for (const event of VIEWER_EVENTS['tabs'] ?? []) {
            const emitter = this[eventProp(event)];
            if (!emitter)
                continue;
            const stop = strip.on(event, (payload) => {
                emitInZone(this.zone, emitter, payload);
            });
            if (typeof stop === 'function')
                this.off.push(stop);
        }
        emitInZone(this.zone, this.ready, strip);
    }

    ngOnChanges() {
        const strip = this.strip;
        if (!strip)
            return;
        if (typeof this.active === 'string' && strip.activeId !== this.active) {
            strip.activate(this.active);
        }
        if (!Object.is(this.builtFrom, this.tabs)) {
            this.builtFrom = this.tabs;
            warnOnce('angular.tabs.mountOnly.tabs', '<lattice-tabs>: `tabs` changed (a label, a badge or a descriptor), but the strip takes '
                + 'it only when created — the module has no way to repaint an existing tab. Nothing was '
                + 'applied and the strip was NOT rebuilt, because rebuilding it would lose whichever tab '
                + 'is open and any state its content holds. Put the strip inside an `@if` keyed on what '
                + 'changed if a genuine rebuild is wanted; a live badge otherwise belongs in your own '
                + 'template.');
        }
    }

    ngOnDestroy() {
        this.torn = true;
        const strip = this.strip;
        this.strip = null;
        if (!strip)
            return;
        emitInZone(this.zone, this.destroyed, undefined);
        for (const stop of this.off) {
            try {
                stop();
            }
            catch {  }
        }
        this.off = [];
        strip.destroy();
        for (const view of this.views.values())
            view.destroy();
        this.views.clear();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeTabsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.1.7", type: LatticeTabsComponent, isStandalone: true, selector: "lattice-tabs", inputs: { config: "config", tabs: "tabs", active: "active" }, outputs: { ready: "ready", destroyed: "destroyed", beforeTabChange: "beforeTabChange", tabChanged: "tab-changed", tabChangeCancelled: "tabChange-cancelled" }, queries: [{ propertyName: "templates", predicate: LatticeTabDirective, descendants: true }], usesOnChanges: true, ngImport: i0, template: '<div #strip class="lattice-tabs-host"></div>', isInline: true, styles: [":host{display:block}.lattice-tabs-host{height:100%}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.7", ngImport: i0, type: LatticeTabsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lattice-tabs', template: '<div #strip class="lattice-tabs-host"></div>', encapsulation: ViewEncapsulation.Emulated, styles: [":host{display:block}.lattice-tabs-host{height:100%}\n"] }]
        }], ctorParameters: () => [], propDecorators: { templates: [{
                type: ContentChildren,
                args: [LatticeTabDirective, { descendants: true }]
            }], config: [{
                type: Input
            }], tabs: [{
                type: Input
            }], active: [{
                type: Input
            }], ready: [{
                type: Output
            }], destroyed: [{
                type: Output
            }], beforeTabChange: [{
                type: Output,
                args: ['beforeTabChange']
            }], tabChanged: [{
                type: Output,
                args: ['tab-changed']
            }], tabChangeCancelled: [{
                type: Output,
                args: ['tabChange-cancelled']
            }] } });

export { DEFAULT_GRID_NAME, EVENT_NAMES, LATTICE_FACTORIES, LATTICE_ROUTER_OPTIONS, LatticeChartComponent, LatticeGanttComponent, LatticeGridBase, LatticeGridComponent, LatticeGridDirective, LatticeGridRegistry, LatticeKanbanComponent, LatticeKpiComponent, LatticeLayoutComponent, LatticeRouter, LatticeTabDirective, LatticeTabsComponent, LatticeViewerBase, VIEWER_EVENTS, dashedName, eventProp, provideLattice, provideLatticeRouter, requireFactory };
