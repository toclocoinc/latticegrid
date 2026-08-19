/*!
 * Lattice Grid 1.4.0 — devtools module
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */

var __mods = Object.create(null);
var __cache = Object.create(null);
/** Register a module factory under its id. */
function __def(id, fn) { __mods[id] = fn; }
/** Instantiate a module once and return its export object. */
function __req(id) {
  var hit = __cache[id];
  if (hit) return hit;
  var exports = Object.create(null);
  __cache[id] = exports;
  var fn = __mods[id];
  if (!fn) throw new Error('[lattice] missing module: ' + id);
  fn(exports, __req);
  return exports;
}

__def("packages/modules/devtools/checks.js", function (__exports, __req) {
  'use strict';
  Object.defineProperty(__exports, "parseColour", { enumerable: true, get: function () { return parseColour; } });
  Object.defineProperty(__exports, "luminance", { enumerable: true, get: function () { return luminance; } });
  Object.defineProperty(__exports, "contrast", { enumerable: true, get: function () { return contrast; } });
  Object.defineProperty(__exports, "backgroundOf", { enumerable: true, get: function () { return backgroundOf; } });
  Object.defineProperty(__exports, "runAccessibilityChecks", { enumerable: true, get: function () { return runAccessibilityChecks; } });
  Object.defineProperty(__exports, "default", { enumerable: true, get: function () { return __default; } });
/**
 * Live accessibility checks against a rendered grid (§17).
 *
 * Nothing is imported here either — this file is part of the devtools module
 * and inherits the same rule: the grid arrives as an argument.
 *
 * These run against the DOM as it currently stands rather than against the
 * configuration, because that is where accessibility actually breaks.
 * Applications supply custom cell renderers, and a renderer that produces a
 * `<div>` with a background colour and no text passes every configuration
 * check and leaves a screen-reader user with an unnamed cell. The grid can
 * only find that by looking at what was drawn.
 *
 * Reported, never fixed. A checker that quietly patched the DOM would hide the
 * problem from the developer while leaving it in their own renderer.
 */

/** WCAG AA contrast for normal text. */
const AA_NORMAL = 4.5;

/** WCAG AA contrast for large text — 18.66px bold, or 24px. */
const AA_LARGE = 3;

/**
 * Parse a CSS colour into RGB.
 *
 * Handles the forms `getComputedStyle` actually returns — `rgb()` and
 * `rgba()` — rather than every form CSS permits, because that is the only
 * source these values come from.
 *
 * @param {string} value the computed colour
 * @returns {{r: number, g: number, b: number, a: number}|null} the channels
 */
 function parseColour(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(/[,/\s]+/).filter(Boolean).map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
}

/**
 * Relative luminance, per WCAG.
 * @param {{r: number, g: number, b: number}} c the colour
 * @returns {number} luminance between 0 and 1
 */
 function luminance(c) {
  /**
   * Linearise one 0-255 channel, per the WCAG formula.
   * @param {number} v the channel value
   * @returns {number} the linear value
   */
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

/**
 * Contrast ratio between two colours.
 * @param {object} fg the foreground
 * @param {object} bg the background
 * @returns {number} the ratio, 1 to 21
 */
 function contrast(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

/**
 * The effective background behind an element.
 *
 * Walks up until it finds something opaque. A cell almost always has a
 * transparent background and inherits the row's or the grid's, so comparing
 * text against the cell's own `background-color` would compare it against
 * `rgba(0,0,0,0)` and report every pair as failing.
 *
 * @param {object} el the element
 * @param {object} view the window
 * @returns {object|null} the opaque background colour
 */
 function backgroundOf(el, view) {
  let node = el;
  while (node && node.nodeType === 1) {
    const colour = parseColour(view.getComputedStyle(node).backgroundColor);
    if (colour && colour.a === 1) return colour;
    node = node.parentElement;
  }
  return { r: 255, g: 255, b: 255, a: 1 };
}

/**
 * Run the checks against a grid.
 *
 * @param {object} grid the grid to inspect
 * @returns {{passes: object[], failures: object[]}} what was checked and what failed
 */
 function runAccessibilityChecks(grid) {
  const root = grid.element;
  const failures = [];
  const passes = [];
  if (!root || !root.querySelectorAll) return { passes, failures };
  const view = root.ownerDocument.defaultView;

  /**
   * Record a check outcome.
   * @param {string} id the check
   * @param {boolean} ok whether it passed
   * @param {string} detail what was found
   * @returns {void}
   */
  const record = (id, ok, detail) => {
    (ok ? passes : failures).push({ id, detail });
  };

  // --- roles and counts -------------------------------------------------
  const gridRole = root.getAttribute('role') || root.querySelector('[role=grid],[role=treegrid]')
    ? 'present' : null;
  record('role-grid', !!gridRole, gridRole ? 'grid role present' : 'no grid or treegrid role');

  const announced = Number(root.getAttribute('aria-rowcount')
    || root.querySelector('[aria-rowcount]')?.getAttribute('aria-rowcount'));
  // ARIA counts header rows in `aria-rowcount`, so the expected figure is the
  // data rows plus the header levels — not the row count on its own. The first
  // version of this check compared against the data rows and reported the grid
  // as wrong by exactly one, which is the kind of false positive that teaches
  // developers to ignore a checker.
  // Distinct row indices, not element count: the header is built once per
  // pinned region, so a single-level header has three `.lat-header-row`
  // elements and counting them reported the expectation as three too high.
  // Overcorrecting a false positive into a different false positive is the
  // same failure twice.
  const headerRows = new Set(
    [...root.querySelectorAll('.lat-header-row')].map((r) => r.getAttribute('aria-rowindex')),
  ).size || 1;
  const expected = grid.rows.count() + headerRows;
  // The announced count must describe the *dataset*, not the rendered window —
  // that is the whole point of aria-rowcount on a virtualised grid, and getting
  // it wrong tells a screen-reader user the grid holds seventeen rows.
  record('aria-rowcount', announced === expected,
    `announced ${announced || 'none'}, expected ${expected} (${grid.rows.count()} rows + ${headerRows} header)`);

  // --- cells without an accessible name ----------------------------------
  let unnamed = 0;
  let sampled = 0;
  for (const cell of root.querySelectorAll('.lat-cell[data-col]')) {
    sampled++;
    const text = (cell.textContent || '').trim();
    const label = cell.getAttribute('aria-label') || cell.getAttribute('title');
    if (!text && !label) unnamed++;
  }
  record('cell-accessible-name', unnamed === 0,
    unnamed ? `${unnamed} of ${sampled} rendered cells have no text or label`
      : `all ${sampled} rendered cells are named`);

  // --- contrast against the live theme ------------------------------------
  const seen = new Set();
  for (const el of root.querySelectorAll('.lat-cell, .lat-header-cell')) {
    const text = (el.textContent || '').trim();
    if (!text) continue;
    const style = view.getComputedStyle(el);
    const fg = parseColour(style.color);
    if (!fg) continue;
    const bg = backgroundOf(el, view);
    // De-duplicated by colour pair, not by element: a thousand cells sharing
    // one pair is one finding, and reporting it a thousand times would bury
    // every other check.
    const key = `${style.color}|${bg.r},${bg.g},${bg.b}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const px = parseFloat(style.fontSize) || 13;
    const bold = Number(style.fontWeight) >= 700;
    const threshold = (px >= 24 || (bold && px >= 18.66)) ? AA_LARGE : AA_NORMAL;
    const ratio = contrast(fg, bg);
    record('contrast', ratio >= threshold,
      `${style.color} on rgb(${bg.r}, ${bg.g}, ${bg.b}) — ${ratio.toFixed(2)}:1, needs ${threshold}:1`);
  }

  // --- presence overlays -------------------------------------------------
  // A cursor or edit overlay sits over a cell whose text still has to be read.
  // Checked against the text it covers rather than against the page
  // background, because that is the pair a user actually has to resolve.
  for (const el of root.querySelectorAll('.lat-cell[data-presence]')) {
    const style = view.getComputedStyle(el);
    const fg = parseColour(style.color);
    if (!fg || !(el.textContent || '').trim()) continue;
    const bg = backgroundOf(el, view);
    const ratio = contrast(fg, bg);
    record('presence-overlay-contrast', ratio >= AA_NORMAL,
      `${el.getAttribute('data-presence')} overlay on ${el.getAttribute('data-col')} `
      + `— ${ratio.toFixed(2)}:1, needs ${AA_NORMAL}:1`);
    // Only the first is reported: every overlay of one kind shares a tint, so
    // repeating it per cell would bury the other checks.
    break;
  }

  return { passes, failures };
}

const __default = runAccessibilityChecks;

});

__def("packages/modules/devtools/index.js", function (__exports, __req) {
  'use strict';
  Object.defineProperty(__exports, "createDevtools", { enumerable: true, get: function () { return createDevtools; } });
  Object.defineProperty(__exports, "CONSOLE_ACTIVATION", { enumerable: true, get: function () { return CONSOLE_ACTIVATION; } });
  Object.defineProperty(__exports, "expose", { enumerable: true, get: function () { return expose; } });
  Object.defineProperty(__exports, "default", { enumerable: true, get: function () { return __default; } });
  const __m0 = __req("packages/modules/devtools/checks.js");
  const runAccessibilityChecks = __m0["runAccessibilityChecks"];
/**
 * `lattice-grid/modules/devtools` — the in-page diagnostic panel (§17).
 *
 * **Nothing is imported here.** Not the grid, not a helper, not a shared
 * utility. The grid instance is handed in, exactly as the framework adapters
 * take `createGrid` rather than importing it, and for the same measured reason:
 * the bundler inlines whatever a module imports, so the adapters are 6.8KB
 * while the web component — which does import the grid — is 1.4MB. A devtools
 * module that imported anything from core would put the entire grid into a
 * bundle whose whole promise is that deployments not using it pay nothing.
 *
 *     import { createGrid } from 'lattice-grid';
 *     import { createDevtools } from 'lattice-grid/modules/devtools';
 *
 *     const grid = createGrid(el, config);
 *     createDevtools({ grid });
 *
 * The panel is a *consumer* of `grid.diagnostics`. It reads; it never writes.
 * Everything it shows is available programmatically without it, which is what
 * lets the same figures be asserted in a test.
 */



/** Prefix for every class this module creates. */
const NS = 'lat-devtools';

/** Where panel position and tab selection are remembered. */
const STORE_KEY = 'lattice.devtools';

/** Tabs, in the order they appear. */
const TABS = ['Overview', 'Rendering', 'Store', 'Data', 'Streaming', 'Providers',
  'Presence', 'Events', 'Config', 'A11y'];

/** Every panel on the page, so an instance selector can list them. */
const PANELS = new Set();

/**
 * The panel's stylesheet.
 *
 * Inlined rather than shipped as a file: a diagnostic tool that needs a second
 * asset wired up is one a developer gives up on before reaching the thing they
 * were trying to diagnose.
 *
 * @returns {string} the CSS
 */
function styles() {
  return `
.${NS}{position:fixed;z-index:2147483000;display:flex;flex-direction:column;
  background:#0f1216;color:#e8ecf1;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
  border:1px solid #2a323c;box-shadow:0 -2px 16px rgb(0 0 0/40%)}
.${NS}[data-dock=bottom]{left:0;right:0;bottom:0;height:300px;border-width:1px 0 0}
.${NS}[data-dock=right]{top:0;right:0;bottom:0;width:380px;border-width:0 0 0 1px}
.${NS}[data-collapsed]{height:auto!important;width:auto!important;left:auto;top:auto;
  right:12px;bottom:12px;border-radius:4px;border-width:1px}
.${NS}[data-collapsed] .${NS}__body,.${NS}[data-collapsed] .${NS}__tabs{display:none}
.${NS}__bar{display:flex;align-items:center;gap:4px 10px;padding:5px 8px;background:#171b21;
  border-bottom:1px solid #2a323c;flex-wrap:wrap}
.${NS}__title{font-weight:600;color:#6aa9f0}
.${NS}__vital{color:#a3aeba;flex:1 1 auto;min-width:0}
.${NS}__vital b{color:#e8ecf1;font-weight:600}
.${NS}__warn{color:#e0a94e}
.${NS}__spacer{flex:0 1 auto}
.${NS}__btn{padding:1px 6px;border:1px solid #2a323c;border-radius:3px;background:#0f1216;
  color:#a3aeba;cursor:pointer;font:inherit}
.${NS}__btn:hover{color:#e8ecf1;border-color:#46525f}
.${NS}__btn[data-on]{color:#0f1216;background:#6aa9f0;border-color:#6aa9f0}
/* Wrapped, not scrolled. Docked to the side the strip is 380px wide and nine
   tabs need 595px, so overflow scrolling hid four of them behind an edge with
   no affordance — and a tab nobody can see is a tab nobody opens. Two short
   rows cost less than a hidden half of the panel. */
.${NS}__tabs{display:flex;flex-wrap:wrap;gap:2px;padding:4px 6px 0;background:#131820;
  border-bottom:1px solid #2a323c}
.${NS}__tab{padding:3px 9px;border:1px solid transparent;border-bottom:0;border-radius:3px 3px 0 0;
  background:none;color:#78828d;cursor:pointer;font:inherit;white-space:nowrap}
.${NS}__tab[data-active]{background:#0f1216;border-color:#2a323c;color:#e8ecf1}
.${NS}__body{flex:1 1 auto;overflow:auto;padding:8px 10px}
.${NS} table{width:100%;border-collapse:collapse}
.${NS} th{text-align:left;font-weight:600;color:#78828d;padding:2px 8px 2px 0;font-size:11px;
  text-transform:uppercase;letter-spacing:.05em}
.${NS} td{padding:2px 8px 2px 0;vertical-align:top;border-top:1px solid #1c232b}
.${NS} td.n{text-align:right;font-variant-numeric:tabular-nums}
.${NS}__h{margin:10px 0 4px;color:#6aa9f0;font-weight:600}
.${NS}__h:first-child{margin-top:0}
.${NS}__item{padding:4px 6px;margin-bottom:3px;border-left:2px solid #e0a94e;background:#1c1a14}
.${NS}__item[data-src=check]{border-left-color:#f08b83;background:#1f1614}
.${NS}__id{color:#78828d}
.${NS}__none{color:#5b6570;font-style:italic}
.${NS}__grip{position:absolute;z-index:1;background:transparent}
.${NS}[data-dock=bottom] .${NS}__grip{top:-3px;left:0;right:0;height:6px;cursor:ns-resize}
.${NS}[data-dock=right] .${NS}__grip{left:-3px;top:0;bottom:0;width:6px;cursor:ew-resize}
.${NS}[data-collapsed] .${NS}__grip{display:none}
.${NS}__graph{display:block;width:100%;height:44px;background:#131820;border:1px solid #1c232b}
.${NS}__log{width:100%;border-collapse:collapse;font-size:11px}
.${NS}__log td{padding:1px 6px 1px 0;border-top:1px solid #1c232b;vertical-align:top}
.${NS}__log tr[data-slow] td{color:#e0a94e}
.${NS}__pick{background:#0f1216;color:#a3aeba;border:1px solid #2a323c;border-radius:3px;
  font:inherit;padding:1px 4px}
.${NS}__docs{color:#6aa9f0;text-decoration:none}
.${NS}__docs:hover{text-decoration:underline}
/* The heat overlay. Two colours, because "rewrote the same value" and "wrote a
   new value" are different findings and only one of them is waste. */
.lat-heat-changed{box-shadow:inset 0 0 0 9999px rgb(106 169 240 / 28%)!important}
.lat-heat-same{box-shadow:inset 0 0 0 9999px rgb(240 139 131 / 24%)!important}
`;
}

/**
 * Render a number for display.
 * @param {unknown} v the value
 * @param {number} [dp] decimal places
 * @returns {string} the text
 */
function num(v, dp = 0) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  return v.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

/**
 * Bytes at a human scale.
 * @param {number} bytes the count
 * @returns {string} the text
 */
function size(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Build a two-column table from pairs.
 * @param {object} doc the document
 * @param {Array<[string, unknown]>} rows label and value
 * @returns {HTMLElement} the table
 */
function table(doc, rows) {
  const el = doc.createElement('table');
  for (const [label, value] of rows) {
    const tr = doc.createElement('tr');
    const th = doc.createElement('td');
    th.textContent = label;
    const td = doc.createElement('td');
    td.className = 'n';
    td.textContent = value === undefined || value === null ? '—' : String(value);
    tr.appendChild(th);
    tr.appendChild(td);
    el.appendChild(tr);
  }
  return el;
}

/**
 * The panel.
 */
class Devtools {
  /** @type {object} the grid being observed */
  #grid;

  /** @type {any} the document */
  #doc;

  /** @type {HTMLElement} */
  #root;

  /** @type {HTMLElement} */
  #body;

  /** @type {HTMLElement} */
  #barVitals;

  /** @type {string} */
  #tab = 'Overview';

  /** @type {string} */
  #dock = 'bottom';

  /** @type {boolean} */
  #collapsed = false;

  /** @type {boolean} whether the heat overlay is painting */
  #heat = false;

  /** @type {WeakMap<object, string>} last text seen per cell, for the heat overlay */
  #seen = new WeakMap();

  /** @type {number} cells rewritten with a value they already held */
  #redundant = 0;

  /** @type {(() => void)[]} */
  #off = [];

  /** @type {any} */
  #timer = null;

  /** @type {any} the instance selector */
  #picker = null;

  /** @type {boolean} whether the event log is recording */
  #recording = false;

  /** @type {string} the event-log type filter */
  #eventFilter = '';

  /** @type {string} the storage key for this instance */
  #key;

  /** @type {string} how this instance is named in the selector */
  #label = '';

  /** @type {number|null} the panel's size along its docked axis */
  #size = null;

  /** @type {object|null} a detached window, when the panel has been popped out */
  #popped = null;

  /**
   * @param {{grid: object, id?: string, dock?: string, collapsed?: boolean}} opts
   *   the grid to observe and how to present the panel
   */
  constructor(opts) {
    this.#grid = opts.grid;
    this.#doc = opts.grid.element ? opts.grid.element.ownerDocument : document;
    // Keyed per instance, because a page with several grids that shared one
    // key would have each of them fighting over the other's panel position.
    this.#key = `${STORE_KEY}.${opts.id || opts.grid.element?.id || 'default'}`;
    this.#restore();
    if (opts.dock) this.#dock = opts.dock;
    if (opts.collapsed !== undefined) this.#collapsed = !!opts.collapsed;
    this.#label = opts.id || opts.grid.element?.id || `grid ${PANELS.size + 1}`;
    PANELS.add(this);
    this.#build();
    this.#wire();
    this.refresh();
  }

  /** @returns {HTMLElement} the panel element */
  get element() { return this.#root; }

  /**
   * Read the remembered position and tab.
   * @returns {void}
   */
  #restore() {
    try {
      const saved = JSON.parse(this.#doc.defaultView.localStorage.getItem(this.#key) || '{}');
      if (saved.tab && TABS.includes(saved.tab)) this.#tab = saved.tab;
      if (saved.dock === 'bottom' || saved.dock === 'right') this.#dock = saved.dock;
      if (typeof saved.collapsed === 'boolean') this.#collapsed = saved.collapsed;
      if (Number.isFinite(saved.size) && saved.size > 80) this.#size = saved.size;
    } catch {
      // A panel that refused to open because its own preferences would not
      // parse would be a poor diagnostic tool.
    }
  }

  /**
   * Remember the position and tab.
   * @returns {void}
   */
  #save() {
    try {
      this.#doc.defaultView.localStorage.setItem(this.#key, JSON.stringify({
        tab: this.#tab, dock: this.#dock, collapsed: this.#collapsed, size: this.#size,
      }));
    } catch { /* private browsing, or storage disabled */ }
  }

  /**
   * Build the shell.
   * @returns {void}
   */
  #build() {
    const doc = this.#doc;
    if (!doc.getElementById(`${NS}-style`)) {
      const style = doc.createElement('style');
      style.id = `${NS}-style`;
      style.textContent = styles();
      doc.head.appendChild(style);
    }

    const root = doc.createElement('div');
    root.className = NS;
    root.setAttribute('data-dock', this.#dock);
    if (this.#collapsed) root.setAttribute('data-collapsed', 'true');

    // Dragging the panel's leading edge. Absolutely positioned rather than a
    // flex child so it overlays the border and does not shift the layout.
    const grip = doc.createElement('div');
    grip.className = `${NS}__grip`;
    root.appendChild(grip);

    const bar = doc.createElement('div');
    bar.className = `${NS}__bar`;
    const title = doc.createElement('span');
    title.className = `${NS}__title`;
    title.textContent = 'Lattice';
    bar.appendChild(title);

    // Only shown once a second grid exists. Attributing a problem to the wrong
    // instance is a common waste of time, but a selector with one entry is
    // chrome that explains nothing.
    const picker = doc.createElement('select');
    picker.className = `${NS}__pick`;
    picker.style.display = 'none';
    picker.addEventListener('change', () => {
      for (const panel of PANELS) {
        if (panel.label === picker.value) panel.focusPanel();
      }
    });
    bar.appendChild(picker);
    this.#picker = picker;

    // The compact strip: the line a developer leaves open while working.
    const vitals = doc.createElement('span');
    vitals.className = `${NS}__vital`;
    bar.appendChild(vitals);

    const spacer = doc.createElement('span');
    spacer.className = `${NS}__spacer`;
    bar.appendChild(spacer);

    const heat = this.#button(bar, 'heat', () => {
      this.#heat = !this.#heat;
      heat.toggleAttribute('data-on', this.#heat);
      if (this.#heat) this.#seedHeat(); else this.#clearHeat();
    });
    this.#button(bar, 'copy', () => this.#copyBundle());
    this.#button(bar, 'pop', () => this.#detach());
    this.#button(bar, 'dock', () => {
      this.#dock = this.#dock === 'bottom' ? 'right' : 'bottom';
      root.setAttribute('data-dock', this.#dock);
      this.#save();
    });
    const toggle = this.#button(bar, this.#collapsed ? '▲' : '▼', () => {
      this.#collapsed = !this.#collapsed;
      root.toggleAttribute('data-collapsed', this.#collapsed);
      toggle.textContent = this.#collapsed ? '▲' : '▼';
      this.#save();
    });

    const tabs = doc.createElement('div');
    tabs.className = `${NS}__tabs`;
    for (const name of TABS) {
      const tab = doc.createElement('button');
      tab.className = `${NS}__tab`;
      tab.type = 'button';
      tab.textContent = name;
      tab.toggleAttribute('data-active', name === this.#tab);
      tab.addEventListener('click', () => {
        this.#tab = name;
        for (const other of tabs.children) other.toggleAttribute('data-active', other === tab);
        this.#save();
        this.refresh();
      });
      tabs.appendChild(tab);
    }

    const body = doc.createElement('div');
    body.className = `${NS}__body`;

    root.appendChild(bar);
    root.appendChild(tabs);
    root.appendChild(body);
    doc.body.appendChild(root);

    this.#root = root;
    this.#body = body;
    this.#barVitals = vitals;
    this.#applySize();
    this.#wireGrip(grip);
  }

  /** @returns {string} how this panel is named in the instance selector */
  get label() { return this.#label; }

  /**
   * Bring attention to this panel's grid.
   *
   * Scrolls it into view and flashes its outline rather than doing anything to
   * the panel: the point of the selector is to answer "which grid is this",
   * and moving the panel would not.
   *
   * @returns {void}
   */
  focusPanel() {
    const el = this.#grid.element;
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' });
    if (!el) return;
    const previous = el.style.outline;
    el.style.outline = '2px solid #6aa9f0';
    setTimeout(() => { el.style.outline = previous; }, 900);
  }

  /**
   * Apply the remembered size along the docked axis.
   * @returns {void}
   */
  #applySize() {
    if (!this.#root) return;
    this.#root.style.height = '';
    this.#root.style.width = '';
    if (this.#size === null) return;
    if (this.#dock === 'bottom') this.#root.style.height = `${this.#size}px`;
    else this.#root.style.width = `${this.#size}px`;
  }

  /**
   * Let the panel be resized by dragging its leading edge.
   * @param {HTMLElement} grip the drag handle
   * @returns {void}
   */
  #wireGrip(grip) {
    const doc = this.#doc;
    let dragging = false;

    /**
     * Begin a resize.
     * @param {object} e a pointerdown event
     * @returns {void}
     */
    const down = (e) => {
      dragging = true;
      if (grip.setPointerCapture && e.pointerId !== undefined) {
        try { grip.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
      }
      e.preventDefault();
    };
    /**
     * Resize to follow the pointer.
     * @param {object} e a pointermove event
     * @returns {void}
     */
    const move = (e) => {
      if (!dragging) return;
      const view = doc.defaultView;
      // Floored well above zero: a panel dragged to nothing is one the user
      // cannot get hold of again.
      const next = this.#dock === 'bottom'
        ? view.innerHeight - e.clientY
        : view.innerWidth - e.clientX;
      this.#size = Math.max(120, Math.min(next, this.#dock === 'bottom'
        ? view.innerHeight - 60 : view.innerWidth - 60));
      this.#applySize();
    };
    /**
     * Finish and remember the size.
     * @returns {void}
     */
    const up = () => {
      if (!dragging) return;
      dragging = false;
      this.#save();
    };

    grip.addEventListener('pointerdown', down);
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
    this.#off.push(() => {
      grip.removeEventListener('pointerdown', down);
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
      grip.removeEventListener('pointercancel', up);
    });
  }

  /**
   * Move the panel into its own window, for a second monitor.
   *
   * The panel element is adopted by the new document rather than rebuilt, so
   * its listeners, tab state and heat baseline all survive the move. Closing
   * the window puts it back.
   *
   * @returns {void}
   */
  #detach() {
    if (this.#popped) { this.#popped.focus(); return; }
    const view = this.#doc.defaultView;
    const popped = view.open('', `lattice-devtools-${this.#label}`,
      'width=460,height=640,menubar=no,toolbar=no');
    if (!popped) return;   // blocked by the popup blocker; the panel stays put

    popped.document.title = `Lattice devtools — ${this.#label}`;
    const style = popped.document.createElement('style');
    style.textContent = `${styles()}\n.${NS}{position:static;height:100vh;width:auto;border:0}`;
    popped.document.head.appendChild(style);
    popped.document.body.style.margin = '0';
    popped.document.body.appendChild(this.#root);
    this.#popped = popped;

    /**
     * Put the panel back when the window goes.
     * @returns {void}
     */
    const back = () => {
      this.#popped = null;
      if (this.#root) this.#doc.body.appendChild(this.#root);
    };
    popped.addEventListener('beforeunload', back);
    // A detached panel outliving the page it describes would be a window full
    // of numbers about a grid that no longer exists.
    view.addEventListener('beforeunload', () => popped.close());
  }

  /**
   * Show the instance selector once the page holds more than one grid.
   * @returns {void}
   */
  #syncPicker() {
    if (!this.#picker) return;
    if (PANELS.size < 2) { this.#picker.style.display = 'none'; return; }
    this.#picker.style.display = '';
    const wanted = [...PANELS].map((p) => p.label);
    const current = [...this.#picker.options].map((o) => o.value);
    if (wanted.join('|') === current.join('|')) return;
    this.#picker.textContent = '';
    for (const label of wanted) {
      const option = this.#doc.createElement('option');
      option.value = label;
      option.textContent = label;
      if (label === this.#label) option.selected = true;
      this.#picker.appendChild(option);
    }
  }

  /**
   * Add a button to the bar.
   * @param {HTMLElement} bar the bar
   * @param {string} label the text
   * @param {() => void} onClick the handler
   * @returns {HTMLElement} the button
   */
  #button(bar, label, onClick) {
    const button = this.#doc.createElement('button');
    button.className = `${NS}__btn`;
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', onClick);
    bar.appendChild(button);
    return button;
  }

  /**
   * Follow the grid.
   * @returns {void}
   */
  #wire() {
    /**
     * Subscribe and remember how to unsubscribe.
     * @param {string} event the event name
     * @param {Function} fn the handler
     * @returns {void}
     */
    const on = (event, fn) => { this.#off.push(this.#grid.on(event, fn)); };
    on('render:done', () => { this.#paintHeat(); this.#schedule(); });
    on('filter:changed', () => this.#schedule());
    on('rows:changed', () => this.#schedule());
    on('comment:indexLoaded', () => this.#schedule());
    on('facet:computed', () => this.#schedule());
  }

  /**
   * Redraw soon, coalescing a burst of events into one repaint.
   *
   * The panel observing the grid must not become a reason the grid is slow,
   * and a diagnostic that repainted per event would be exactly that.
   *
   * @returns {void}
   */
  #schedule() {
    if (this.#timer !== null) return;
    this.#timer = setTimeout(() => { this.#timer = null; this.refresh(); }, 120);
  }

  /**
   * Tint cells the grid has just written.
   *
   * Two colours, because they are different findings: a cell written with a
   * value it did not previously hold is work the grid had to do, and a cell
   * rewritten with the value already in it is work it did not. The second is
   * the one worth chasing, and no counter alone will tell you where it is.
   *
   * @returns {void}
   */
  #paintHeat() {
    if (!this.#heat) return;
    const root = this.#grid.element;
    if (!root || !root.querySelectorAll) return;
    let redundant = 0;
    for (const cell of root.querySelectorAll('.lat-cell[data-col]')) {
      const text = cell.textContent;
      const previous = this.#seen.get(cell);
      this.#seen.set(cell, text);
      cell.classList.remove('lat-heat-changed', 'lat-heat-same');
      if (previous === undefined) continue;
      if (previous === text) { cell.classList.add('lat-heat-same'); redundant++; }
      else cell.classList.add('lat-heat-changed');
    }
    this.#redundant = redundant;
    setTimeout(() => this.#clearHeat(), 260);
  }

  /**
   * Record what every visible cell holds right now, without tinting anything.
   *
   * Without this the first paint after switching the overlay on has nothing to
   * compare against, so it tints nothing — and "turn on heat, do a thing, see
   * no heat" reads as a broken feature rather than as an empty baseline.
   *
   * @returns {void}
   */
  #seedHeat() {
    const root = this.#grid.element;
    if (!root || !root.querySelectorAll) return;
    for (const cell of root.querySelectorAll('.lat-cell[data-col]')) {
      this.#seen.set(cell, cell.textContent);
    }
  }

  /**
   * Take the tint off.
   * @returns {void}
   */
  #clearHeat() {
    const root = this.#grid.element;
    if (!root || !root.querySelectorAll) return;
    for (const cell of root.querySelectorAll('.lat-heat-changed, .lat-heat-same')) {
      cell.classList.remove('lat-heat-changed', 'lat-heat-same');
    }
  }

  /**
   * Put the diagnostic bundle on the clipboard.
   * @returns {void}
   */
  #copyBundle() {
    const text = JSON.stringify(this.#grid.diagnostics.bundle(), null, 2);
    const nav = this.#doc.defaultView.navigator;
    // Pasting into an issue is the common case, so the clipboard comes first
    // and the download is the fallback rather than the other way round.
    if (nav && nav.clipboard && nav.clipboard.writeText) {
      nav.clipboard.writeText(text).catch(() => this.#download(text));
      return;
    }
    this.#download(text);
  }

  /**
   * Save the bundle as a file.
   * @param {string} text the bundle JSON
   * @returns {void}
   */
  #download(text) {
    const doc = this.#doc;
    const url = doc.defaultView.URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = doc.createElement('a');
    a.href = url;
    a.download = 'lattice-diagnostics.json';
    a.click();
    doc.defaultView.URL.revokeObjectURL(url);
  }

  /**
   * Redraw the strip and the active tab.
   * @returns {void}
   */
  refresh() {
    const d = this.#grid.diagnostics;
    const renders = d.renders();
    const warnings = d.warnings();
    this.#syncPicker();

    const vp = renders.viewport || {};
    this.#barVitals.innerHTML = '';
    const parts = [
      `rows <b>${num(vp.totalRows)}</b>`,
      `dom <b>${num(vp.renderedRows)}</b>`,
      `renders <b>${num(renders.total)}</b>`,
      `writes <b>${num(renders.dom && renders.dom.cellWrites)}</b>`,
      renders.last ? `last <b>${num(renders.last.totalMs, 1)}ms</b>` : '',
    ].filter(Boolean);
    this.#barVitals.innerHTML = parts.join(' · ');
    if (warnings.length) {
      const warn = this.#doc.createElement('span');
      warn.className = `${NS}__warn`;
      warn.textContent = ` ⚠ ${warnings.length}`;
      this.#barVitals.appendChild(warn);
    }

    if (this.#collapsed) return;
    this.#body.textContent = '';
    const draw = this[`_${this.#tab}`];
    if (draw) draw.call(this, this.#body, d);
  }

  /**
   * How many elements the grid currently has in the document.
   *
   * The figure that makes virtualisation concrete: a grid over a million rows
   * should hold roughly the same node count as one over a hundred.
   *
   * @returns {number} the element count
   */
  #domNodes() {
    const el = this.#grid.element;
    return el && el.querySelectorAll ? el.querySelectorAll('*').length : 0;
  }

  /**
   * A rolling graph of the interval between paints.
   *
   * Drawn as bars against the frame budget, with anything over it marked —
   * the shape is the point, and a column of numbers does not have one.
   *
   * @param {object} frames the frame sample
   * @returns {HTMLElement} the canvas
   */
  #graph(frames) {
    const doc = this.#doc;
    const canvas = doc.createElement('canvas');
    canvas.className = `${NS}__graph`;
    const width = 300;
    const height = 44;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) return canvas;

    const samples = frames.recent.slice(-width);
    // Scaled to the worst sample or to twice the budget, whichever is larger,
    // so a well-behaved grid does not draw a wall of full-height bars.
    const peak = Math.max(frames.budgetMs * 2, ...samples, 1);
    const barWidth = Math.max(1, Math.floor(width / Math.max(samples.length, 1)));

    ctx.fillStyle = '#131820';
    ctx.fillRect(0, 0, width, height);
    // The budget line, so the bars have something to be measured against.
    const budgetY = height - (frames.budgetMs / peak) * height;
    ctx.strokeStyle = '#46525f';
    ctx.beginPath();
    ctx.moveTo(0, budgetY);
    ctx.lineTo(width, budgetY);
    ctx.stroke();

    samples.forEach((ms, i) => {
      const h = Math.max(1, (ms / peak) * height);
      ctx.fillStyle = ms > frames.budgetMs * 1.5 ? '#f08b83' : '#6aa9f0';
      ctx.fillRect(i * barWidth, height - h, Math.max(1, barWidth - 1), h);
    });
    return canvas;
  }

  /**
   * A section heading.
   * @param {HTMLElement} into the body
   * @param {string} text the heading
   * @returns {void}
   */
  #heading(into, text) {
    const h = this.#doc.createElement('div');
    h.className = `${NS}__h`;
    h.textContent = text;
    into.appendChild(h);
  }

  /**
   * The Overview tab.
   * @param {HTMLElement} into the body
   * @param {object} d the diagnostics API
   * @returns {void}
   */
  _Overview(into, d) {
    const snap = d.snapshot();
    this.#heading(into, 'Instance');
    into.appendChild(table(this.#doc, [
      ['version', snap.version],
      ['rows', num(snap.rows)],
      ['columns', `${snap.columns.visible} of ${snap.columns.total} visible`],
      ['listeners', num(Object.values(snap.events || {}).reduce((a, b) => a + b, 0))],
      ['store', size(snap.store && snap.store.bytes)],
    ]));

    const frames = snap.render && snap.render.frames;
    if (frames) {
      this.#heading(into, 'Frames');
      into.appendChild(table(this.#doc, [
        ['mean interval', `${num(frames.meanMs, 1)} ms`],
        ['dropped', num(frames.dropped)],
        ['since last render', frames.sinceLastMs === null ? '—' : `${num(frames.sinceLastMs, 0)} ms`],
        ['dom nodes', num(this.#domNodes())],
      ]));
      into.appendChild(this.#graph(frames));
    }

    this.#heading(into, `Warnings (${snap.warnings.length})`);
    if (!snap.warnings.length) {
      const none = this.#doc.createElement('div');
      none.className = `${NS}__none`;
      none.textContent = 'Nothing flagged.';
      into.appendChild(none);
      return;
    }
    for (const w of snap.warnings) {
      const item = this.#doc.createElement('div');
      item.className = `${NS}__item`;
      item.setAttribute('data-src', w.source);
      const id = this.#doc.createElement('div');
      id.className = `${NS}__id`;
      // The id is shown, not hidden: it is the thing a support conversation
      // names, and a warning nobody can refer to is harder to report.
      id.textContent = w.id + (w.count > 1 ? ` ×${w.count}` : '');
      const msg = this.#doc.createElement('div');
      msg.textContent = w.message;
      item.appendChild(id);
      item.appendChild(msg);
      if (w.docs) {
        const link = this.#doc.createElement('a');
        link.className = `${NS}__docs`;
        link.href = `../docs/${w.docs}`;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'documentation →';
        item.appendChild(link);
      }
      if (Object.keys(w.values || {}).length) {
        const values = this.#doc.createElement('div');
        values.className = `${NS}__id`;
        values.textContent = JSON.stringify(w.values);
        item.appendChild(values);
      }
      into.appendChild(item);
    }
  }

  /**
   * The Rendering tab.
   * @param {HTMLElement} into the body
   * @param {object} d the diagnostics API
   * @returns {void}
   */
  _Rendering(into, d) {
    const r = d.renders();
    const vp = r.viewport || {};
    const dom = r.dom || {};

    this.#heading(into, 'Viewport');
    into.appendChild(table(this.#doc, [
      ['rendered / total', `${num(vp.renderedRows)} / ${num(vp.totalRows)}`],
      ['row window', `${vp.firstRow} – ${vp.lastRow}`],
      ['overscan', vp.overscan],
      ['row height', num(vp.rowHeight, 1)],
      ['by region', vp.byRegion
        ? `${vp.byRegion.start} / ${vp.byRegion.centre} / ${vp.byRegion.end}` : '—'],
    ]));

    this.#heading(into, `Renders (${num(r.total)})`);
    into.appendChild(table(this.#doc,
      Object.entries(r.byCause || {}).map(([k, v]) => [k, num(v)])));

    this.#heading(into, 'DOM');
    into.appendChild(table(this.#doc, [
      ['cell writes', num(dom.cellWrites)],
      ['row updates', num(dom.rowUpdates)],
      ['paints', num(dom.paints)],
      ['row pool', `${num(dom.rowReuses)} reused / ${num(dom.rowAllocations)} allocated`],
      ['cell pool', `${num(dom.cellReuses)} reused / ${num(dom.cellAllocations)} allocated`],
      ['redundant writes (heat)', this.#heat ? num(this.#redundant) : 'heat off'],
    ]));

    if (r.last) {
      this.#heading(into, 'Last render');
      into.appendChild(table(this.#doc, [
        ['cause', r.last.cause],
        ['layout', `${num(r.last.layoutMs, 2)} ms`],
        ['source hint', `${num(r.last.hintMs, 2)} ms`],
        ['dom write', `${num(r.last.writeMs, 2)} ms`],
        ['total', `${num(r.last.totalMs, 2)} ms`],
      ]));
    }
  }

  /**
   * The Store tab.
   * @param {HTMLElement} into the body
   * @param {object} d the diagnostics API
   * @returns {void}
   */
  _Store(into, d) {
    const s = d.store();
    this.#heading(into, 'Footprint');
    into.appendChild(table(this.#doc, [
      ['total', size(s.bytes)],
      ['rows', num(s.rows)],
      ['physical', num(s.physical)],
      ['tombstoned', num(s.tombstoned)],
      ['columnar', String(s.columnar)],
    ]));
    if (s.note) {
      const note = this.#doc.createElement('div');
      note.className = `${NS}__none`;
      note.textContent = s.note;
      into.appendChild(note);
    }
    this.#heading(into, 'Columns');
    into.appendChild(table(this.#doc,
      (s.columns || []).map((c) => [`${c.id} (${c.kind})`, size(c.bytes)])));

    this.#heading(into, 'Pipeline');
    const stages = d.renders().stages || [];
    into.appendChild(stages.length ? table(this.#doc, stages.map((st) => [
      st.stage,
      `${st.materialised ? 'held' : 'empty'} · ${st.rows === null ? '—' : num(st.rows)} rows · `
      + `${st.bytes === null ? '—' : size(st.bytes)} · ${num(st.rebuilds)} rebuilds`,
    ])) : this.#empty('No pipeline on this source.'));

    // Growth over time, not absolute size: that is the shape a leak has.
    this.#heading(into, 'Growth');
    const markBtn = this.#doc.createElement('button');
    markBtn.className = `${NS}__btn`;
    markBtn.type = 'button';
    markBtn.textContent = 'mark';
    markBtn.addEventListener('click', () => { d.mark(); this.refresh(); });
    into.appendChild(markBtn);

    const diff = d.since();
    if (!diff) {
      into.appendChild(this.#empty('Mark the store, then come back to see what changed.'));
      return;
    }
    into.appendChild(table(this.#doc, [
      ['since', `${num(diff.seconds)}s ago`],
      ['rows', (diff.rows >= 0 ? '+' : '') + num(diff.rows)],
      ['bytes', (diff.bytes >= 0 ? '+' : '') + size(Math.abs(diff.bytes))],
      ['renders', `+${num(diff.renders)}`],
    ]));
    if (diff.columns.length) {
      into.appendChild(table(this.#doc,
        diff.columns.map((c) => [c.id, (c.bytes >= 0 ? '+' : '-') + size(Math.abs(c.bytes))])));
    }
  }

  /**
   * The Data tab.
   * @param {HTMLElement} into the body
   * @param {object} d the diagnostics API
   * @returns {void}
   */
  _Data(into, d) {
    const ops = d.operations();
    this.#heading(into, `Operations (sample of ${ops.sampleSize})`);
    const rows = Object.entries(ops.kinds || {}).map(([kind, o]) => [
      kind, `${num(o.count)} × · mean ${num(o.meanMs, 2)}ms · worst ${num(o.worstMs, 2)}ms`,
    ]);
    into.appendChild(rows.length ? table(this.#doc, rows) : this.#empty('Nothing recorded yet.'));

    this.#heading(into, 'Query');
    const q = d.snapshot().config ? this.#grid.diagnostics.bundle().query : null;
    const pre = this.#doc.createElement('pre');
    pre.textContent = JSON.stringify(q, null, 2);
    into.appendChild(pre);
  }

  /**
   * The Presence tab.
   *
   * Provider errors get their own line rather than being folded into a count,
   * because a transport failure makes presence look broken while the grid is
   * perfectly fine — and that is the first thing a developer needs to rule out.
   *
   * @param {HTMLElement} into the body
   * @returns {void}
   */
  _Presence(into) {
    const presence = this.#grid.presence;
    if (!presence || !presence.enabled) {
      into.appendChild(this.#empty('No presence provider configured.'));
      return;
    }
    const stats = presence.stats();
    const peers = presence.peers();

    this.#heading(into, 'Transport');
    into.appendChild(table(this.#doc, [
      ['publishing', String(presence.publishing)],
      ['published', num(stats.published)],
      ['received', num(stats.received)],
      // Throttle drops are expected and healthy: they are the messages the
      // throttle collapsed, not messages lost.
      ['throttle drops', num(stats.dropped)],
      ['provider errors', num(stats.errors)],
    ]));

    this.#heading(into, `Peers (${peers.length}, ${presence.hiddenCount()} not in view)`);
    into.appendChild(peers.length ? table(this.#doc, peers.map((p) => [
      p.name,
      `${p.idle ? 'idle' : 'active'}${p.hidden ? ' · not in view' : ''}`
      + `${p.cursor ? ` · ${p.cursor.rowId}/${p.cursor.colId}` : ''}`
      + `${p.editing ? ' · editing' : ''}`,
    ])) : this.#empty('Nobody else is here.'));
  }

  /**
   * The Providers tab.
   * @param {HTMLElement} into the body
   * @param {object} d the diagnostics API
   * @returns {void}
   */
  _Providers(into, d) {
    const p = d.providers();
    this.#heading(into, 'Configured');
    into.appendChild(p.configured.length
      ? table(this.#doc, p.configured.map((n) => [n, p.stats[n] ? 'active' : 'no calls yet']))
      : this.#empty('No providers configured.'));

    for (const [name, s] of Object.entries(p.stats || {})) {
      this.#heading(into, name);
      into.appendChild(table(this.#doc, [
        ['calls', num(s.calls)],
        ['errors', num(s.errors)],
        ['in flight', num(s.inFlight)],
        ['mean', `${num(s.meanMs, 2)} ms`],
        ['worst', `${num(s.worstMs, 2)} ms`],
      ]));
      const failed = (s.recent || []).filter((c) => !c.ok);
      for (const call of failed) {
        const item = this.#doc.createElement('div');
        item.className = `${NS}__item`;
        item.setAttribute('data-src', 'check');
        item.textContent = `${call.detail || 'call'}: ${call.error}`;
        into.appendChild(item);
      }
    }
  }

  /**
   * The Events tab.
   * @param {HTMLElement} into the body
   * @param {object} d the diagnostics API
   * @returns {void}
   */
  _Events(into, d) {
    const doc = this.#doc;
    const counts = d.events();
    const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    this.#heading(into, `Listeners (${rows.reduce((n, r) => n + r[1], 0)})`);
    into.appendChild(rows.length ? table(doc, rows.map(([k, v]) => [k, num(v)]))
      : this.#empty('No listeners.'));

    this.#heading(into, 'Live log');
    const controls = doc.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '6px';
    controls.style.marginBottom = '4px';

    const record = doc.createElement('button');
    record.className = `${NS}__btn`;
    record.type = 'button';
    record.textContent = this.#recording ? 'recording' : 'record';
    record.toggleAttribute('data-on', this.#recording);
    record.addEventListener('click', () => {
      this.#recording = !this.#recording;
      // Recording is switched on here rather than at construction because it
      // times every emit, and the emit path runs per changed cell on a
      // streaming feed. A panel left open must not make the grid slower.
      d.recordEvents(this.#recording);
      this.refresh();
    });
    controls.appendChild(record);

    const filter = doc.createElement('input');
    filter.className = `${NS}__pick`;
    filter.placeholder = 'filter by type';
    filter.value = this.#eventFilter;
    filter.addEventListener('input', () => {
      this.#eventFilter = filter.value;
      this.#drawLog(logBody, d);
    });
    controls.appendChild(filter);

    const clear = doc.createElement('button');
    clear.className = `${NS}__btn`;
    clear.type = 'button';
    clear.textContent = 'clear';
    clear.addEventListener('click', () => { d.clearEventLog(); this.#drawLog(logBody, d); });
    controls.appendChild(clear);
    into.appendChild(controls);

    const logBody = doc.createElement('table');
    logBody.className = `${NS}__log`;
    into.appendChild(logBody);
    this.#drawLog(logBody, d);
  }

  /**
   * Draw the event log, newest first.
   * @param {HTMLElement} into the table
   * @param {object} d the diagnostics API
   * @returns {void}
   */
  #drawLog(into, d) {
    into.textContent = '';
    if (!this.#recording) {
      const row = into.insertRow();
      row.insertCell().textContent = 'Not recording.';
      return;
    }
    const needle = this.#eventFilter.trim().toLowerCase();
    const entries = d.eventLog()
      .filter((e) => !needle || e.type.toLowerCase().includes(needle))
      .slice(-100)
      .reverse();
    if (!entries.length) {
      const row = into.insertRow();
      row.insertCell().textContent = needle ? 'Nothing matching.' : 'No events yet.';
      return;
    }
    for (const e of entries) {
      const row = into.insertRow();
      // A handler taking longer than a frame is the thing worth finding here,
      // so it is marked rather than left to be spotted in a column of numbers.
      if (e.ms > 16) row.setAttribute('data-slow', 'true');
      row.insertCell().textContent = e.type;
      row.insertCell().textContent = `${e.listeners}L`;
      row.insertCell().textContent = `${e.ms.toFixed(2)}ms`;
      row.insertCell().textContent = Object.entries(e.payload)
        .map(([k, v]) => `${k}=${v}`).join(' ').slice(0, 80);
    }
  }

  /**
   * The Config tab.
   * @param {HTMLElement} into the body
   * @param {object} d the diagnostics API
   * @returns {void}
   */
  _Config(into, d) {
    const c = d.config();
    this.#heading(into, `Supplied (${c.supplied.length})`);
    into.appendChild(table(this.#doc, c.supplied.map((k) => [k, format(c.effective[k])])));
    this.#heading(into, `Defaulted (${c.defaulted.length})`);
    into.appendChild(table(this.#doc, c.defaulted.map((k) => [k, format(c.effective[k])])));

    this.#heading(into, `Changed this session (${(c.changes || []).length})`);
    into.appendChild((c.changes || []).length
      ? table(this.#doc, c.changes.map((ch) => [ch.key, `${format(ch.from)} → ${format(ch.to)}`]))
      : this.#empty('Nothing has changed since load.'));
  }


  /**
   * The Streaming tab.
   *
   * Only meaningful when a stream is attached; a grid loaded from an array has
   * nothing to report and says so rather than showing a wall of zeros.
   *
   * @param {HTMLElement} into the body
   * @returns {void}
   */
  _Streaming(into) {
    const updates = this.#grid.updates;
    if (!updates) { into.appendChild(this.#empty('No streaming API on this grid.')); return; }
    const stats = updates.stats();
    const mode = (this.#grid.get('source') || {}).mode;
    if (mode !== 'stream') {
      into.appendChild(this.#empty(`No stream attached (source mode: ${mode || 'memory'}).`));
    }

    this.#heading(into, 'Throughput');
    into.appendChild(table(this.#doc, [
      ['rows arrived', num(stats.rows)],
      ['queued', num(stats.queued)],
      ['pending', num(stats.pending)],
      // The number that makes the batching claim concrete: rows that arrived
      // more than once in a window and were written once.
      ['coalesced', num(stats.coalesced)],
      ['coalesced total', num(stats.coalescedTotal)],
      ['flushes', num(stats.flushes)],
    ]));

    this.#heading(into, 'Buffer');
    into.appendChild(table(this.#doc, [
      ['paused', String(stats.paused)],
      ['held rows', `${num(stats.held)} of ${num(stats.heldLimit)}`],
      ['dropped to stay in cap', num(stats.dropped)],
      ['span', stats.span ? `${new Date(stats.span.from).toLocaleTimeString()} – ${new Date(stats.span.to).toLocaleTimeString()}` : '—'],
    ]));
  }

  /**
   * The accessibility tab.
   *
   * Run on demand rather than continuously: it reads computed styles for every
   * distinct colour pair on screen, which is far too much work to repeat on
   * every repaint of a panel that is meant to be left open.
   *
   * @param {HTMLElement} into the body
   * @returns {void}
   */
  _A11y(into) {
    const run = this.#doc.createElement('button');
    run.className = `${NS}__btn`;
    run.type = 'button';
    run.textContent = 'Run checks';
    into.appendChild(run);

    const results = this.#doc.createElement('div');
    into.appendChild(results);

    /**
     * Run the checks and draw them.
     * @returns {void}
     */
    const go = () => {
      results.textContent = '';
      const { passes, failures } = runAccessibilityChecks(this.#grid);
      this.#heading(results, `Failures (${failures.length})`);
      if (!failures.length) results.appendChild(this.#empty('Nothing failing.'));
      for (const f of failures) {
        const item = this.#doc.createElement('div');
        item.className = `${NS}__item`;
        item.setAttribute('data-src', 'check');
        const id = this.#doc.createElement('div');
        id.className = `${NS}__id`;
        id.textContent = f.id;
        const detail = this.#doc.createElement('div');
        detail.textContent = f.detail;
        item.appendChild(id);
        item.appendChild(detail);
        results.appendChild(item);
      }
      this.#heading(results, `Passing (${passes.length})`);
      results.appendChild(table(this.#doc, passes.map((c) => [c.id, c.detail])));
    };
    run.addEventListener('click', go);
    go();
  }

  /**
   * A placeholder for an empty section.
   * @param {string} text the message
   * @returns {HTMLElement} the element
   */
  #empty(text) {
    const el = this.#doc.createElement('div');
    el.className = `${NS}__none`;
    el.textContent = text;
    return el;
  }

  /**
   * Take the panel away.
   * @returns {void}
   */
  destroy() {
    PANELS.delete(this);
    if (this.#popped) { this.#popped.close(); this.#popped = null; }
    for (const off of this.#off) off();
    this.#off = [];
    if (this.#timer !== null) clearTimeout(this.#timer);
    this.#clearHeat();
    if (this.#root && this.#root.remove) this.#root.remove();
  }
}

/**
 * Render a configuration value compactly.
 * @param {unknown} v the value
 * @returns {string} the text
 */
function format(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/**
 * Attach a diagnostic panel to a grid.
 *
 * @param {{grid: object, id?: string, dock?: 'bottom'|'right',
 *          collapsed?: boolean, hotkey?: boolean}} opts the grid and layout
 * @returns {object} the panel, with `destroy()`
 */
 function createDevtools(opts) {
  if (!opts || !opts.grid) throw new Error('[lattice] createDevtools needs a grid');
  if (!opts.grid.diagnostics) {
    throw new Error('[lattice] this grid has no diagnostics; the version is too old');
  }
  const panel = new Devtools(opts);

  if (opts.hotkey !== false) {
    const doc = panel.element.ownerDocument;
    /**
     * Toggle the panel on the chord.
     * @param {object} e a keydown event
     * @returns {void}
     */
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        panel.element.toggleAttribute('data-collapsed');
      }
    };
    doc.addEventListener('keydown', onKey);
    const inner = panel.destroy.bind(panel);
    panel.destroy = () => { doc.removeEventListener('keydown', onKey); inner(); };
  }
  return panel;
}

/**
 * The token a build replaces to compile console activation out.
 *
 * Some deployments consider a console-reachable diagnostic panel an
 * information-disclosure surface — it exposes configuration and query state to
 * anyone who opens devtools. Replacing this token with `false` at build time
 * removes the global entirely rather than merely hiding it, which is the only
 * version of "off" worth offering.
 */
 const CONSOLE_ACTIVATION = '__LATTICE_DEVTOOLS_CONSOLE__' !== 'false';

/**
 * Publish a console entry point, so a panel can be opened in a deployed
 * environment without a rebuild.
 *
 *     __latticeDevtools()          // attach to every grid on the page
 *
 * Grids register themselves through `expose`; nothing is discovered by
 * scanning the document, because a global that reached into arbitrary pages
 * would be a worse thing than the problem it solves.
 *
 * @param {object} grid a grid to make reachable
 * @returns {void}
 */
 function expose(grid) {
  if (!CONSOLE_ACTIVATION) return;
  const scope = typeof globalThis === 'object' ? globalThis : null;
  if (!scope) return;
  const known = scope.__latticeGrids || (scope.__latticeGrids = new Set());
  known.add(grid);
  if (typeof scope.__latticeDevtools === 'function') return;
  /**
   * Attach a panel to every registered grid.
   * @returns {object[]} the panels
   */
  scope.__latticeDevtools = () => [...known].map((g) => createDevtools({ grid: g }));
}

const __default = createDevtools;

});

try {
  __req("packages/worker/src/inline.js").setWorkerSource("(function (root) {\n\n'use strict';\n\nvar __mods = Object.create(null);\nvar __cache = Object.create(null);\n/** Register a module factory under its id. */\nfunction __def(id, fn) { __mods[id] = fn; }\n/** Instantiate a module once and return its export object. */\nfunction __req(id) {\n  var hit = __cache[id];\n  if (hit) return hit;\n  var exports = Object.create(null);\n  __cache[id] = exports;\n  var fn = __mods[id];\n  if (!fn) throw new Error('[lattice] missing module: ' + id);\n  fn(exports, __req);\n  return exports;\n}\n\n__def(\"packages/core/src/internal/util.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"VERSION\", { enumerable: true, get: function () { return VERSION; } });\n  Object.defineProperty(__exports, \"reportedWarnings\", { enumerable: true, get: function () { return reportedWarnings; } });\n  Object.defineProperty(__exports, \"warnOnce\", { enumerable: true, get: function () { return warnOnce; } });\n  Object.defineProperty(__exports, \"infoOnce\", { enumerable: true, get: function () { return infoOnce; } });\n  Object.defineProperty(__exports, \"resetWarnings\", { enumerable: true, get: function () { return resetWarnings; } });\n  Object.defineProperty(__exports, \"fail\", { enumerable: true, get: function () { return fail; } });\n  Object.defineProperty(__exports, \"invariant\", { enumerable: true, get: function () { return invariant; } });\n  Object.defineProperty(__exports, \"DEV\", { enumerable: true, get: function () { return DEV; } });\n  Object.defineProperty(__exports, \"isObject\", { enumerable: true, get: function () { return isObject; } });\n  Object.defineProperty(__exports, \"isFunction\", { enumerable: true, get: function () { return isFunction; } });\n  Object.defineProperty(__exports, \"isNil\", { enumerable: true, get: function () { return isNil; } });\n  Object.defineProperty(__exports, \"isBlank\", { enumerable: true, get: function () { return isBlank; } });\n  Object.defineProperty(__exports, \"isCtor\", { enumerable: true, get: function () { return isCtor; } });\n  Object.defineProperty(__exports, \"pathGetter\", { enumerable: true, get: function () { return pathGetter; } });\n  Object.defineProperty(__exports, \"pathSetter\", { enumerable: true, get: function () { return pathSetter; } });\n  Object.defineProperty(__exports, \"getPath\", { enumerable: true, get: function () { return getPath; } });\n  Object.defineProperty(__exports, \"setPath\", { enumerable: true, get: function () { return setPath; } });\n  Object.defineProperty(__exports, \"humanise\", { enumerable: true, get: function () { return humanise; } });\n  Object.defineProperty(__exports, \"escapeHtml\", { enumerable: true, get: function () { return escapeHtml; } });\n  Object.defineProperty(__exports, \"titleCase\", { enumerable: true, get: function () { return titleCase; } });\n  Object.defineProperty(__exports, \"expand\", { enumerable: true, get: function () { return expand; } });\n  Object.defineProperty(__exports, \"toArray\", { enumerable: true, get: function () { return toArray; } });\n  Object.defineProperty(__exports, \"merge\", { enumerable: true, get: function () { return merge; } });\n  Object.defineProperty(__exports, \"mergeRow\", { enumerable: true, get: function () { return mergeRow; } });\n  Object.defineProperty(__exports, \"Lru\", { enumerable: true, get: function () { return Lru; } });\n  Object.defineProperty(__exports, \"collator\", { enumerable: true, get: function () { return collator; } });\n  Object.defineProperty(__exports, \"defaultCompare\", { enumerable: true, get: function () { return defaultCompare; } });\n  Object.defineProperty(__exports, \"now\", { enumerable: true, get: function () { return now; } });\n  Object.defineProperty(__exports, \"nextFrame\", { enumerable: true, get: function () { return nextFrame; } });\n  Object.defineProperty(__exports, \"cancelFrame\", { enumerable: true, get: function () { return cancelFrame; } });\n  Object.defineProperty(__exports, \"frameBatched\", { enumerable: true, get: function () { return frameBatched; } });\n  Object.defineProperty(__exports, \"whenIdle\", { enumerable: true, get: function () { return whenIdle; } });\n  Object.defineProperty(__exports, \"uid\", { enumerable: true, get: function () { return uid; } });\n/**\n * Shared internal utilities. No DOM, no dependencies.\n * Every package may import from here; nothing here imports from anywhere else.\n */\n\n/** @typedef {import('../types.js').Row} Row */\n\n/** Product version, stamped into builds and reported by `version()`. */\n const VERSION = '1.4.0';\n\n/* ------------------------------------------------------------------ */\n/* Diagnostics                                                        */\n/* ------------------------------------------------------------------ */\n\n/** Keys already reported, so a warning fires once per cause, never per cell. */\nconst warned = new Set();\n\n/**\n * Everything reported this session, newest last, for the diagnostics panel.\n *\n * The console is where a warning goes to be noticed and is a poor place for it\n * to stay: it interleaves with the host application's own logging, it is gone\n * after a reload, and a developer arriving at a misbehaving grid cannot ask it\n * what it has already complained about. Keeping the same records here costs one\n * array push per *cause* — the de-duplication above means this can never grow\n * per cell — and turns 160 existing call sites into a queryable list.\n *\n * Each entry keeps the `key` it was de-duplicated on, which is a stable\n * identifier a support conversation can name.\n *\n * @type {{key: string, level: string, message: string, at: number}[]}\n */\nconst reported = [];\n\n/** How many records are kept. Far above the number of distinct causes. */\nconst REPORT_LIMIT = 500;\n\n/**\n * Record a report alongside logging it.\n * @param {string} key the de-duplication key\n * @param {string} level `'warn'` or `'info'`\n * @param {unknown[]} message the console arguments\n * @returns {void}\n */\nfunction record(key, level, message) {\n  reported.push({\n    key,\n    level,\n    // Joined to a string here rather than at read time: the arguments may\n    // include objects the caller goes on to mutate, and a diagnostics list\n    // that changed retroactively would be worse than none.\n    message: message.map((m) => (typeof m === 'string' ? m : safeString(m))).join(' '),\n    at: Date.now(),\n  });\n  if (reported.length > REPORT_LIMIT) reported.shift();\n}\n\n/**\n * Describe a value without throwing on a circular structure.\n * @param {unknown} value the value\n * @returns {string} a short description\n */\nfunction safeString(value) {\n  if (value instanceof Error) return value.message;\n  try { return JSON.stringify(value); } catch { return String(value); }\n}\n\n/**\n * Everything the grid has reported this session.\n * @returns {{key: string, level: string, message: string, at: number}[]} the records\n */\n function reportedWarnings() { return reported.map((r) => ({ ...r })); }\n\n/**\n * Warn exactly once for a given key.\n *\n * The spec repeatedly calls for per-column or per-cause warnings rather than\n * per-cell ones (§8.2, §8.3, §4.5): a million-row grid with a misconfigured\n * column must not produce a million console lines.\n *\n * @param {string} key de-duplication key, typically `${colId}:${reason}`\n * @param {...unknown} message arguments forwarded to `console.warn`\n * @returns {void}\n */\n function warnOnce(key, ...message) {\n  if (warned.has(key)) return;\n  warned.add(key);\n  record(key, 'warn', message);\n  console.warn('[lattice]', ...message);\n}\n\n/**\n * Log an informational message exactly once for a given key.\n * @param {string} key de-duplication key\n * @param {...unknown} message arguments forwarded to `console.info`\n * @returns {void}\n */\n function infoOnce(key, ...message) {\n  if (warned.has(key)) return;\n  warned.add(key);\n  record(key, 'info', message);\n  console.info('[lattice]', ...message);\n}\n\n/**\n * Forget every recorded warning key. Tests use this to assert on warnings.\n * @returns {void}\n */\n function resetWarnings() {\n  warned.clear();\n  // The records go with the keys. A test that resets so it can assert a warning\n  // fires again would otherwise find the previous run's record still listed.\n  reported.length = 0;\n}\n\n/**\n * Throw a prefixed error.\n * @param {string} message the failure description\n * @param {unknown} [extra] attached as the error's `cause`\n * @returns {never}\n * @throws {Error} always\n */\n function fail(message, extra) {\n  const err = new Error(`[lattice] ${message}`);\n  if (extra !== undefined) err.cause = extra;\n  throw err;\n}\n\n/**\n * Throw when a condition does not hold.\n * @param {unknown} condition the assertion\n * @param {string} message the failure description\n * @returns {void}\n * @throws {Error} when `condition` is falsy\n */\n function invariant(condition, message) {\n  if (!condition) fail(message);\n}\n\n/**\n * Development-mode flag. Guards the purity Proxy of §8.4.3 and other checks\n * that cost too much to run in production.\n * @type {boolean}\n */\n const DEV = (() => {\n  try {\n    return !(typeof process !== 'undefined' && process.env\n      && process.env.NODE_ENV === 'production');\n  } catch {\n    return true;\n  }\n})();\n\n/* ------------------------------------------------------------------ */\n/* Types and coercion                                                 */\n/* ------------------------------------------------------------------ */\n\n/**\n * Is this a plain object rather than null, an array or a primitive?\n * @param {unknown} v the value to test\n * @returns {boolean} true for a non-array object\n */\n function isObject(v) {\n  return v !== null && typeof v === 'object' && !Array.isArray(v);\n}\n\n/**\n * Is this a function?\n * @param {unknown} v the value to test\n * @returns {boolean} true for any callable\n */\n function isFunction(v) {\n  return typeof v === 'function';\n}\n\n/**\n * Is this null or undefined?\n * @param {unknown} v the value to test\n * @returns {boolean} true for null or undefined\n */\n function isNil(v) {\n  return v === null || v === undefined;\n}\n\n/**\n * Is this blank in the sense the `blank` filter operator means (§9.3)?\n *\n * Null, undefined and the empty string are blank. `NaN` is deliberately not:\n * §8.6 requires null, undefined, empty string and `NaN` to stay distinct.\n *\n * @param {unknown} v the value to test\n * @returns {boolean} true when the value counts as blank\n */\n function isBlank(v) {\n  return v === null || v === undefined || v === '';\n}\n\n/**\n * Is this a class constructor rather than a plain function?\n *\n * Used to tell a component-path renderer (a class with `init`/`refresh`) from\n * a function renderer (§8.8). Best effort, since the distinction is not\n * reliably observable.\n *\n * @param {unknown} v the value to test\n * @returns {boolean} true when the value looks like a constructor\n */\n function isCtor(v) {\n  if (typeof v !== 'function') return false;\n  if (/^class[\\s{]/.test(Function.prototype.toString.call(v))) return true;\n  return !!(v.prototype && Object.getOwnPropertyNames(v.prototype).length > 1);\n}\n\n/* ------------------------------------------------------------------ */\n/* Property paths                                                     */\n/* ------------------------------------------------------------------ */\n\n/** Compiled getters, keyed by path, so a path compiles once per grid. */\nconst pathCache = new Map();\n\n/**\n * Compile a dot path such as `'site.address.postcode'` into a getter (§8.1).\n *\n * The compiled closure is cached, because a field getter runs once per visible\n * cell per frame and must not re-split its path each time.\n *\n * @param {string} path a field name, optionally dotted\n * @returns {(obj: unknown) => unknown} the getter\n */\n function pathGetter(path) {\n  let fn = pathCache.get(path);\n  if (fn) return fn;\n\n  if (!path.includes('.')) {\n    fn = (o) => (o == null ? undefined : o[path]);\n  } else {\n    const parts = path.split('.');\n    const n = parts.length;\n    fn = (o) => {\n      let cur = o;\n      for (let i = 0; i < n; i++) {\n        if (cur == null) return undefined;\n        cur = cur[parts[i]];\n      }\n      return cur;\n    };\n  }\n\n  pathCache.set(path, fn);\n  return fn;\n}\n\n/** Compiled setters, keyed by path. */\nconst setterCache = new Map();\n\n/**\n * Compile a dot path into a setter that creates missing intermediate objects.\n * @param {string} path a field name, optionally dotted\n * @returns {(obj: unknown, value: unknown) => void} the setter\n */\n function pathSetter(path) {\n  let fn = setterCache.get(path);\n  if (fn) return fn;\n\n  if (!path.includes('.')) {\n    fn = (o, v) => { if (o != null) o[path] = v; };\n  } else {\n    const parts = path.split('.');\n    const last = parts.length - 1;\n    fn = (o, v) => {\n      let cur = o;\n      for (let i = 0; i < last; i++) {\n        if (cur == null) return;\n        const k = parts[i];\n        if (cur[k] == null) cur[k] = {};\n        cur = cur[k];\n      }\n      if (cur != null) cur[parts[last]] = v;\n    };\n  }\n\n  setterCache.set(path, fn);\n  return fn;\n}\n\n/**\n * Read a dotted path from an object.\n * @param {unknown} obj the source object\n * @param {string} path a field name, optionally dotted\n * @returns {unknown} the value, or undefined where the path breaks\n */\n function getPath(obj, path) {\n  return pathGetter(path)(obj);\n}\n\n/**\n * Write a dotted path into an object, creating intermediates.\n * @param {unknown} obj the target object\n * @param {string} path a field name, optionally dotted\n * @param {unknown} value the value to write\n * @returns {void}\n */\n function setPath(obj, path, value) {\n  pathSetter(path)(obj, value);\n}\n\n/* ------------------------------------------------------------------ */\n/* Strings                                                            */\n/* ------------------------------------------------------------------ */\n\n/**\n * Derive a default header title from a field name (§8.1).\n *\n * `'monthlyCharge'` becomes `'Monthly Charge'`; `'site.postcode'` becomes\n * `'Postcode'`, since the leading path is structure rather than a label.\n *\n * @param {string} field the field name\n * @returns {string} a humanised title\n */\n function humanise(field) {\n  if (!field) return '';\n  const leaf = field.includes('.') ? field.slice(field.lastIndexOf('.') + 1) : field;\n  return leaf\n    .replace(/[_-]+/g, ' ')\n    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')\n    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')\n    .replace(/\\s+/g, ' ')\n    .trim()\n    .replace(/^./, (c) => c.toUpperCase());\n}\n\n/** Character to entity map used by {@link escapeHtml}. */\nconst ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' };\n\n/**\n * Escape HTML special characters. This is what `{{value}}` does in a template\n * and what `{{{value}}}` deliberately does not (§8.8).\n * @param {unknown} s the value to escape\n * @returns {string} the escaped text\n */\n function escapeHtml(s) {\n  const str = s == null ? '' : String(s);\n  return /[&<>\"']/.test(str) ? str.replace(/[&<>\"']/g, (c) => ESCAPES[c]) : str;\n}\n\n/**\n * Title-case a string, for the `title` text transform and template pipe (§8.5).\n * @param {unknown} s the value to transform\n * @returns {string} the title-cased text\n */\n function titleCase(s) {\n  return String(s).replace(/\\w\\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());\n}\n\n/* ------------------------------------------------------------------ */\n/* Shorthand expansion                                                */\n/* ------------------------------------------------------------------ */\n\n/**\n * Expand a shorthand property value into its options object (§8.1).\n *\n * The rule the spec states is that a boolean or a bare value is accepted\n * wherever an object of options is: `sort: true` means `sort: { enabled: true }`\n * and `filter: 'set'` means `filter: { type: 'set', enabled: true }`.\n *\n * @param {unknown} value the raw property value\n * @param {string} key the property name a bare scalar maps onto\n * @param {object} [whenTrue] extra properties applied when the value is `true`\n * @returns {object|undefined} the expanded options, or undefined when unset\n */\n function expand(value, key, whenTrue) {\n  if (value === undefined) return undefined;\n  if (value === true) return { enabled: true, ...whenTrue };\n  if (value === false) return { enabled: false };\n  if (isObject(value)) return value;\n  return { [key]: value, enabled: true };\n}\n\n/* ------------------------------------------------------------------ */\n/* Collections                                                        */\n/* ------------------------------------------------------------------ */\n\n/**\n * Coerce a value, an array or nothing into an array.\n * @param {unknown} v the value\n * @returns {unknown[]} an array, empty when the value was null or undefined\n */\n function toArray(v) {\n  if (v === undefined || v === null) return [];\n  return Array.isArray(v) ? v : [v];\n}\n\n/**\n * Merge `b` over `a`, recursing into plain objects only.\n *\n * Arrays replace rather than concatenate, which is what column resolution\n * needs: a preset supplying `classWhen` should be overridden wholesale by a\n * column supplying its own, not merged into an ambiguous union (§8.1).\n *\n * @param {unknown} a the base value\n * @param {unknown} b the overriding value\n * @returns {unknown} the merged result\n */\n function merge(a, b) {\n  if (!isObject(a)) return isObject(b) ? { ...b } : b;\n  if (!isObject(b)) return b === undefined ? a : b;\n\n  const out = { ...a };\n  for (const k of Object.keys(b)) {\n    const bv = b[k];\n    if (bv === undefined) continue;\n    out[k] = isObject(bv) && isObject(out[k]) ? merge(out[k], bv) : bv;\n  }\n  return out;\n}\n\n/**\n * Merge an update patch over an existing row (§11.3).\n *\n * `rows.apply({ update })` is documented as the way to apply a delta — a\n * websocket message, a save that returned the changed record — and a delta\n * names the fields that moved and no others. Assigning the patch over the row\n * therefore silently destroyed every field it did not mention, which is the\n * worst possible failure for the API whose whole purpose is partial updates.\n *\n * The result is a new object rather than a mutation of the old one, so a caller\n * holding a reference to the previous row still sees the previous values. The\n * prototype is carried across, because a row may be a class instance and\n * spreading one into a plain object silently strips its methods.\n *\n * @param {unknown} previous the row as it stands\n * @param {unknown} patch the fields to change\n * @returns {unknown} the merged row\n */\n function mergeRow(previous, patch) {\n  if (!isObject(previous) || !isObject(patch) || previous === patch) return patch;\n  const out = Object.create(Object.getPrototypeOf(previous));\n  Object.assign(out, previous, patch);\n  return out;\n}\n\n/**\n * A bounded least-recently-used map.\n *\n * Used for the materialisation cache of §5.9, the block caches of §4.2 and\n * §4.3, and the nested grid cache of §13 — everywhere the grid holds derived\n * objects whose memory must stay bounded.\n */\n class Lru {\n  /** Maximum number of entries retained. */\n  #max;\n\n  /** Insertion-ordered backing map; the first key is the least recent. */\n  #map = new Map();\n\n  /** Optional callback invoked with each evicted value, for teardown. */\n  #onEvict;\n\n  /**\n   * @param {number} [max] maximum entries before eviction begins\n   * @param {((value: unknown, key: unknown) => void)|null} [onEvict] called for\n   *   each evicted entry, so callers can destroy what they cached\n   */\n  constructor(max = 256, onEvict = null) {\n    this.#max = max;\n    this.#onEvict = onEvict;\n  }\n\n  /**\n   * Current number of entries.\n   * @returns {number} the entry count\n   */\n  get size() {\n    return this.#map.size;\n  }\n\n  /**\n   * The eviction threshold.\n   * @returns {number} the maximum entry count\n   */\n  get max() {\n    return this.#max;\n  }\n\n  /**\n   * Change the eviction threshold, trimming immediately if it shrank.\n   * @param {number} v the new maximum\n   */\n  set max(v) {\n    this.#max = v;\n    this.#trim();\n  }\n\n  /**\n   * Is a key present? Does not promote it.\n   * @param {unknown} k the key\n   * @returns {boolean} true when present\n   */\n  has(k) {\n    return this.#map.has(k);\n  }\n\n  /**\n   * Read a value and promote it to most recently used.\n   * @param {unknown} k the key\n   * @returns {unknown} the value, or undefined\n   */\n  get(k) {\n    const m = this.#map;\n    if (!m.has(k)) return undefined;\n    const v = m.get(k);\n    m.delete(k);\n    m.set(k, v);\n    return v;\n  }\n\n  /**\n   * Read a value without promoting it.\n   * @param {unknown} k the key\n   * @returns {unknown} the value, or undefined\n   */\n  peek(k) {\n    return this.#map.get(k);\n  }\n\n  /**\n   * Insert or replace a value, evicting the least recent entries if needed.\n   * @param {unknown} k the key\n   * @param {unknown} v the value\n   * @returns {unknown} the value, for chaining\n   */\n  set(k, v) {\n    const m = this.#map;\n    if (m.has(k)) m.delete(k);\n    m.set(k, v);\n    this.#trim();\n    return v;\n  }\n\n  /**\n   * Remove one entry, running the eviction callback.\n   * @param {unknown} k the key\n   * @returns {unknown} the removed value, or undefined\n   */\n  delete(k) {\n    const v = this.#map.get(k);\n    if (this.#map.delete(k) && this.#onEvict) this.#onEvict(v, k);\n    return v;\n  }\n\n  /**\n   * Remove every entry, running the eviction callback for each.\n   * @returns {void}\n   */\n  clear() {\n    if (this.#onEvict) for (const [k, v] of this.#map) this.#onEvict(v, k);\n    this.#map.clear();\n  }\n\n  /**\n   * Iterate keys, least recently used first.\n   * @returns {IterableIterator<unknown>} the key iterator\n   */\n  keys() {\n    return this.#map.keys();\n  }\n\n  /**\n   * Iterate values, least recently used first.\n   * @returns {IterableIterator<unknown>} the value iterator\n   */\n  values() {\n    return this.#map.values();\n  }\n\n  /**\n   * Evict from the least recently used end until within the threshold.\n   * @returns {void}\n   */\n  #trim() {\n    const m = this.#map;\n    while (m.size > this.#max) {\n      const oldest = m.keys().next().value;\n      const v = m.get(oldest);\n      m.delete(oldest);\n      if (this.#onEvict) this.#onEvict(v, oldest);\n    }\n  }\n}\n\n/* ------------------------------------------------------------------ */\n/* Comparison                                                         */\n/* ------------------------------------------------------------------ */\n\n/** Collators cached by locale and options. */\nconst collators = new Map();\n\n/**\n * Get a shared `Intl.Collator`.\n *\n * §5.6 and §9.1 are blunt about this: constructing a collator inside a\n * comparator is roughly an order of magnitude slower and is the most common\n * performance mistake in this area. One instance per locale, created at column\n * compile time, is the rule.\n *\n * @param {string} [locale] a BCP 47 locale tag\n * @param {Intl.CollatorOptions} [opts] collator options\n * @returns {Intl.Collator} the shared collator\n */\n function collator(locale, opts) {\n  const key = `${locale || ''}|${opts ? JSON.stringify(opts) : ''}`;\n  let c = collators.get(key);\n  if (!c) {\n    c = new Intl.Collator(locale || undefined, {\n      numeric: true, sensitivity: 'variant', ...opts,\n    });\n    collators.set(key, c);\n  }\n  return c;\n}\n\n/**\n * Natural ordering used when no type-specific comparator applies.\n *\n * Nulls and undefined sort last regardless of direction, matching the\n * `sort.nullsFirst` default of §8.6, and `NaN` sorts after real numbers.\n *\n * @param {unknown} a the first value\n * @param {unknown} b the second value\n * @returns {number} negative, zero or positive\n */\n function defaultCompare(a, b) {\n  if (a === b) return 0;\n  if (a === null || a === undefined) return 1;\n  if (b === null || b === undefined) return -1;\n\n  if (typeof a === 'number' && typeof b === 'number') {\n    if (Number.isNaN(a)) return Number.isNaN(b) ? 0 : 1;\n    if (Number.isNaN(b)) return -1;\n    return a < b ? -1 : a > b ? 1 : 0;\n  }\n\n  const sa = String(a);\n  const sb = String(b);\n  return sa < sb ? -1 : sa > sb ? 1 : 0;\n}\n\n/* ------------------------------------------------------------------ */\n/* Scheduling                                                         */\n/* ------------------------------------------------------------------ */\n\n/**\n * A monotonic timestamp in milliseconds.\n * @returns {number} the current time\n */\n function now() {\n  return typeof performance !== 'undefined' && performance.now\n    ? performance.now()\n    : Date.now();\n}\n\n/** Whether the host provides `requestAnimationFrame`. Node does not. */\nconst hasRaf = typeof requestAnimationFrame === 'function';\n\n/**\n * Schedule a callback for the next animation frame, falling back to a timer so\n * the core stays importable in Node (§20).\n * @param {(time: number) => void} fn the callback\n * @returns {number} a handle for {@link cancelFrame}\n */\n function nextFrame(fn) {\n  if (hasRaf) return requestAnimationFrame(fn);\n  return setTimeout(() => fn(now()), 16);\n}\n\n/**\n * Cancel a callback scheduled by {@link nextFrame}.\n * @param {number|null|undefined} handle the handle to cancel\n * @returns {void}\n */\n function cancelFrame(handle) {\n  if (handle == null) return;\n  if (hasRaf) cancelAnimationFrame(handle);\n  else clearTimeout(handle);\n}\n\n/**\n * Coalesce repeated calls into one per animation frame.\n *\n * This is the mechanism behind several spec requirements at once: streamed\n * chunks coalescing into a single re-render per frame (§4.4), and all DOM\n * writes happening in a single `requestAnimationFrame` callback (§7.3).\n *\n * @param {(...args: unknown[]) => void} fn the callback to coalesce\n * @returns {((...args: unknown[]) => void) & { cancel(): void, flush(): void }}\n *   the batched function, with `cancel` and `flush` attached\n */\n function frameBatched(fn) {\n  let handle = null;\n  let lastArgs = null;\n\n  /**\n   * Run the pending call and clear the scheduled handle.\n   * @returns {void}\n   */\n  const run = () => {\n    handle = null;\n    const a = lastArgs;\n    lastArgs = null;\n    fn(...(a || []));\n  };\n\n  /**\n   * Record the arguments and schedule a frame if one is not pending.\n   * @param {...unknown} args arguments for the eventual call\n   * @returns {void}\n   */\n  const wrapped = (...args) => {\n    lastArgs = args;\n    if (handle === null) handle = nextFrame(run);\n  };\n\n  /**\n   * Drop any pending call.\n   * @returns {void}\n   */\n  wrapped.cancel = () => {\n    cancelFrame(handle);\n    handle = null;\n    lastArgs = null;\n  };\n\n  /**\n   * Run any pending call immediately.\n   * @returns {void}\n   */\n  wrapped.flush = () => {\n    if (handle !== null) {\n      cancelFrame(handle);\n      run();\n    }\n  };\n\n  return wrapped;\n}\n\n/**\n * Run a callback when the host is idle, with a timeout fallback. Used by\n * chunked ingest (§5.11) and stream backpressure (§4.4).\n * @param {(deadline: { timeRemaining(): number, didTimeout: boolean }) => void} fn the callback\n * @param {number} [timeout] milliseconds after which to run regardless\n * @returns {number} a handle\n */\n function whenIdle(fn, timeout = 50) {\n  if (typeof requestIdleCallback === 'function') {\n    return requestIdleCallback(fn, { timeout });\n  }\n  return setTimeout(() => fn({ timeRemaining: () => 0, didTimeout: true }), 1);\n}\n\n/* ------------------------------------------------------------------ */\n/* Ids                                                                */\n/* ------------------------------------------------------------------ */\n\n/** Monotonic counter behind {@link uid}. */\nlet idSeq = 0;\n\n/**\n * Generate a short unique id, for columns without a `field` and for internal\n * bookkeeping.\n * @param {string} [prefix] a short prefix\n * @returns {string} the generated id\n */\n function uid(prefix = 'l') {\n  return `${prefix}${(++idSeq).toString(36)}`;\n}\n\n});\n\n__def(\"packages/worker/src/transport.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"PROTOCOL\", { enumerable: true, get: function () { return PROTOCOL; } });\n  Object.defineProperty(__exports, \"OPS\", { enumerable: true, get: function () { return OPS; } });\n  Object.defineProperty(__exports, \"CONTROL\", { enumerable: true, get: function () { return CONTROL; } });\n  Object.defineProperty(__exports, \"ERRORS\", { enumerable: true, get: function () { return ERRORS; } });\n  Object.defineProperty(__exports, \"packHandle\", { enumerable: true, get: function () { return packHandle; } });\n  Object.defineProperty(__exports, \"packHandles\", { enumerable: true, get: function () { return packHandles; } });\n  Object.defineProperty(__exports, \"TransportedDictionary\", { enumerable: true, get: function () { return TransportedDictionary; } });\n  Object.defineProperty(__exports, \"unpackHandle\", { enumerable: true, get: function () { return unpackHandle; } });\n  Object.defineProperty(__exports, \"unpackHandles\", { enumerable: true, get: function () { return unpackHandles; } });\n  Object.defineProperty(__exports, \"createMaskPool\", { enumerable: true, get: function () { return createMaskPool; } });\n  Object.defineProperty(__exports, \"isTransferable\", { enumerable: true, get: function () { return isTransferable; } });\n  Object.defineProperty(__exports, \"collectTransfers\", { enumerable: true, get: function () { return collectTransfers; } });\n  Object.defineProperty(__exports, \"isPortable\", { enumerable: true, get: function () { return isPortable; } });\n  Object.defineProperty(__exports, \"filterColumnIds\", { enumerable: true, get: function () { return filterColumnIds; } });\n  const __m0 = __req(\"packages/core/src/internal/util.js\");\n  const collator = __m0[\"collator\"];\n  const isFunction = __m0[\"isFunction\"];\n/**\n * Worker transport — what crosses the thread boundary, and how (§5.13).\n *\n * The default transport copies **only the columns an operation touches** into\n * the Worker, runs the kernel there, and **transfers** the resulting\n * `Uint32Array` permutation or `Uint8Array` mask back rather than copying it,\n * because ownership of a result buffer genuinely moves.\n *\n * Copying an 8MB `Float64Array` costs a few milliseconds against a 350ms sort\n * budget (§19), so the copy is not the bottleneck and nothing here contorts to\n * avoid it. The opt-in zero-copy path lives in `shared.js`.\n *\n * No DOM, no dependencies. Imports cleanly in Node.\n */\n\n\n\n/** Wire protocol version. Bumped only on a breaking message-shape change. */\n const PROTOCOL = 1;\n\n/** Every operation the Worker can be asked to perform (CONTRACTS §3). */\n const OPS = Object.freeze({\n  SORT_COLUMN: 'sortColumn',\n  SORT_MULTI: 'sortMulti',\n  EVALUATE_FILTERS: 'evaluateFilters',\n  COMPACT: 'compact',\n  GROUP_BY_COLUMNS: 'groupByColumns',\n  TOTAL: 'total',\n  PIVOT: 'pivot',\n  FACET: 'facet',\n});\n\n/** Control messages that are not kernel calls. */\n const CONTROL = Object.freeze({\n  READY: 'ready',\n  CANCEL: 'cancel',\n  PING: 'ping',\n});\n\n/** Error codes a Worker can report back. Stable, part of the protocol. */\n const ERRORS = Object.freeze({\n  /** The compute module could not be imported inside the Worker. */\n  NO_COMPUTE: 'E_NO_COMPUTE',\n  /** The compute module exists but does not export the requested kernel. */\n  NO_KERNEL: 'E_NO_KERNEL',\n  /** The request was superseded or explicitly aborted. */\n  ABORTED: 'E_ABORTED',\n  /** The kernel threw. */\n  KERNEL: 'E_KERNEL',\n  /** The message was not understood. */\n  PROTOCOL: 'E_PROTOCOL',\n});\n\n/* ------------------------------------------------------------------ */\n/* Handle packing                                                     */\n/* ------------------------------------------------------------------ */\n\n/**\n * Flatten a `ColumnHandle` (CONTRACTS §2) into a structured-cloneable record.\n *\n * Only the fields a kernel reads are included; the `get()` closure and the\n * owning store are deliberately left behind. Typed arrays are cloned by\n * `postMessage` — that clone *is* the copy the spec describes.\n *\n * @param {object|null|undefined} handle a ColumnHandle, or nullish\n * @returns {object|null} a plain record safe for structured clone, or null\n */\n function packHandle(handle) {\n  if (handle == null) return null;\n  const presence = handle.presence;\n  return {\n    id: handle.id,\n    kind: handle.kind,\n    nullable: !!handle.nullable,\n    values: handle.values ?? null,\n    // A Bitset exposes its bytes as `words`; a bare Uint8Array is passed through.\n    presence: presence ? (presence.words ?? presence) : null,\n    presenceBits: presence ? (presence.size ?? (presence.words ?? presence).length * 8) : 0,\n    // Only the value table crosses; codes are already in `values`.\n    dict: handle.dict ? sliceDictionary(handle.dict) : null,\n    offsets: handle.offsets ?? null,\n    version: handle.version ?? 0,\n  };\n}\n\n/**\n * Read a `Dictionary`'s value table without assuming which accessor it offers.\n * @param {object} dict a Dictionary (CONTRACTS §2) or an array of values\n * @returns {unknown[]} the value table\n */\nfunction sliceDictionary(dict) {\n  if (Array.isArray(dict)) return dict;\n  if (isFunction(dict.values)) return dict.values();\n  return [];\n}\n\n/**\n * Pack an array of handles, preserving order and nulls.\n * @param {Array<object|null>} handles the handles an operation touches\n * @returns {Array<object|null>} packed records\n */\n function packHandles(handles) {\n  const out = new Array(handles.length);\n  for (let i = 0; i < handles.length; i++) out[i] = packHandle(handles[i]);\n  return out;\n}\n\n/* ------------------------------------------------------------------ */\n/* Handle unpacking (Worker side)                                     */\n/* ------------------------------------------------------------------ */\n\n/**\n * A presence bitset reconstructed from transported bytes.\n *\n * Only the read surface kernels use is provided; the Worker never writes\n * presence, so `set`/`clear` would be dead weight.\n */\nclass TransportedBitset {\n  /** @type {Uint8Array} */\n  #words;\n  /** @type {number} */\n  #bits;\n\n  /**\n   * @param {Uint8Array} words packed bits, 1 = value present\n   * @param {number} bits bit capacity\n   */\n  constructor(words, bits) {\n    this.#words = words;\n    this.#bits = bits;\n  }\n\n  /** @returns {Uint8Array} the backing bytes */\n  get words() { return this.#words; }\n\n  /** @returns {number} bit capacity */\n  get size() { return this.#bits; }\n\n  /**\n   * Read one bit.\n   * @param {number} i bit index\n   * @returns {boolean} true when the bit is set\n   */\n  get(i) { return (this.#words[i >>> 3] & (1 << (i & 7))) !== 0; }\n\n  /**\n   * Population count over the whole bitset.\n   * @returns {number} number of set bits\n   */\n  count() {\n    const w = this.#words;\n    let n = 0;\n    for (let i = 0; i < w.length; i++) {\n      let v = w[i];\n      while (v) { v &= v - 1; n++; }\n    }\n    return n;\n  }\n}\n\n/**\n * A `Dictionary` reconstructed inside the Worker from a transported value\n * table.\n *\n * Codes are never reassigned (CONTRACTS §2), so rebuilding the reverse map from\n * the table alone is exact. Collation ranks are cached against `version` and\n * computed with one shared collator (§5.6) — never one per comparison.\n */\n class TransportedDictionary {\n  /** @type {unknown[]} */\n  #values;\n  /** @type {Map<unknown, number>|null} */\n  #index = null;\n  /** @type {number} */\n  #version = 0;\n  /** @type {Map<string, {version:number, ranks:Uint32Array}>} */\n  #ranks = new Map();\n\n  /** @param {unknown[]} values the value table, indexed by code */\n  constructor(values) {\n    this.#values = values || [];\n  }\n\n  /** @returns {number} number of distinct values */\n  get size() { return this.#values.length; }\n\n  /** @returns {number} bumped when a value is appended (§5.4) */\n  get version() { return this.#version; }\n\n  /**\n   * Code for a value, appending if new.\n   * @param {unknown} value the logical value\n   * @returns {number} its stable code\n   */\n  codeOf(value) {\n    if (this.#index === null) {\n      this.#index = new Map();\n      for (let i = 0; i < this.#values.length; i++) this.#index.set(this.#values[i], i);\n    }\n    const found = this.#index.get(value);\n    if (found !== undefined) return found;\n    const code = this.#values.length;\n    this.#values.push(value);\n    this.#index.set(value, code);\n    this.#version++;\n    return code;\n  }\n\n  /**\n   * Value for a code.\n   * @param {number} code a dictionary code\n   * @returns {unknown} the logical value\n   */\n  valueOf(code) { return this.#values[code]; }\n\n  /** @returns {unknown[]} the value table */\n  values() { return this.#values; }\n\n  /**\n   * Collation ranks cached against `version`, computed with one shared\n   * collator (§5.6). `ranks[code]` is the sort rank of that code.\n   * @param {string} [locale] BCP-47 locale tag\n   * @returns {Uint32Array} rank per code\n   */\n  ranks(locale) {\n    const key = locale || '';\n    const cached = this.#ranks.get(key);\n    if (cached && cached.version === this.#version) return cached.ranks;\n    const n = this.#values.length;\n    const order = new Uint32Array(n);\n    for (let i = 0; i < n; i++) order[i] = i;\n    const cmp = collator(locale).compare;\n    const vals = this.#values;\n    const sorted = Array.from(order).sort((a, b) => {\n      const av = vals[a];\n      const bv = vals[b];\n      if (av === bv) return 0;\n      if (av === null || av === undefined) return 1;\n      if (bv === null || bv === undefined) return -1;\n      return cmp(String(av), String(bv));\n    });\n    const ranks = new Uint32Array(n);\n    for (let r = 0; r < sorted.length; r++) ranks[sorted[r]] = r;\n    this.#ranks.set(key, { version: this.#version, ranks });\n    return ranks;\n  }\n}\n\n/**\n * Rebuild a usable `ColumnHandle` from a packed record.\n *\n * The returned object satisfies CONTRACTS §2 including a working `get()`, so a\n * kernel's fallback path behaves identically inside the Worker.\n *\n * @param {object|null} packed a record produced by {@link packHandle}\n * @returns {object|null} a ColumnHandle-shaped object, or null\n */\n function unpackHandle(packed) {\n  if (packed == null) return null;\n  const presence = packed.presence\n    ? new TransportedBitset(packed.presence, packed.presenceBits || packed.presence.length * 8)\n    : null;\n  const dict = packed.dict ? new TransportedDictionary(packed.dict) : null;\n  const values = packed.values;\n  const offsets = packed.offsets ?? null;\n  const kind = packed.kind;\n\n  /**\n   * Logical read of one cell, matching the store's semantics.\n   * @param {number} physical physical row index\n   * @returns {unknown} the logical value, or null when absent\n   */\n  const get = (physical) => {\n    if (presence && !presence.get(physical)) return null;\n    switch (kind) {\n      case 'dictionary':\n        return dict ? dict.valueOf(values[physical]) : values[physical];\n      case 'bitset':\n        return (values[physical >>> 3] & (1 << (physical & 7))) !== 0;\n      case 'multi': {\n        if (!offsets) return null;\n        const from = offsets[physical];\n        const to = offsets[physical + 1];\n        const out = new Array(to - from);\n        for (let i = from; i < to; i++) out[i - from] = dict ? dict.valueOf(values[i]) : values[i];\n        return out;\n      }\n      default:\n        return values[physical];\n    }\n  };\n\n  return {\n    id: packed.id,\n    kind,\n    nullable: packed.nullable,\n    values,\n    presence,\n    dict,\n    offsets,\n    get,\n    version: packed.version,\n  };\n}\n\n/**\n * Unpack an array of handles.\n * @param {Array<object|null>} packed packed records\n * @returns {Array<object|null>} ColumnHandle-shaped objects\n */\n function unpackHandles(packed) {\n  const out = new Array(packed.length);\n  for (let i = 0; i < packed.length; i++) out[i] = unpackHandle(packed[i]);\n  return out;\n}\n\n/* ------------------------------------------------------------------ */\n/* Mask pool                                                          */\n/* ------------------------------------------------------------------ */\n\n/**\n * A minimal pooled allocator for filter masks and index buffers (§5.7).\n *\n * Area A owns the production `store/pool.js`; the Worker cannot rely on that\n * module existing, so it carries this small equivalent. It implements the same\n * three calls the filter kernel's `ctx.pool` needs.\n *\n * @returns {{mask(n:number):Uint8Array, indices(n:number):Uint32Array,\n *            release(buf:ArrayBufferView):void, clear():void}} a pool\n */\n function createMaskPool() {\n  /** @type {Uint8Array[]} */\n  const masks = [];\n  /** @type {Uint32Array[]} */\n  const indices = [];\n\n  return {\n    /**\n     * Borrow a zeroed mask of at least `n` bytes.\n     * @param {number} n row count\n     * @returns {Uint8Array} a mask view of exactly `n` bytes\n     */\n    mask(n) {\n      for (let i = 0; i < masks.length; i++) {\n        if (masks[i].length >= n) {\n          const buf = masks.splice(i, 1)[0].subarray(0, n);\n          buf.fill(0);\n          return buf;\n        }\n      }\n      return new Uint8Array(n);\n    },\n    /**\n     * Borrow an index buffer of at least `n` entries.\n     * @param {number} n capacity in entries\n     * @returns {Uint32Array} an index buffer of exactly `n` entries\n     */\n    indices(n) {\n      for (let i = 0; i < indices.length; i++) {\n        if (indices[i].length >= n) return indices.splice(i, 1)[0].subarray(0, n);\n      }\n      return new Uint32Array(n);\n    },\n    /**\n     * Return a buffer to the pool.\n     * @param {ArrayBufferView} buf a buffer previously borrowed\n     * @returns {void}\n     */\n    release(buf) {\n      if (!buf) return;\n      if (buf instanceof Uint8Array) masks.push(buf);\n      else if (buf instanceof Uint32Array) indices.push(buf);\n    },\n    /**\n     * Drop every pooled buffer.\n     * @returns {void}\n     */\n    clear() { masks.length = 0; indices.length = 0; },\n  };\n}\n\n/* ------------------------------------------------------------------ */\n/* Transfer detection                                                 */\n/* ------------------------------------------------------------------ */\n\n/**\n * Is this value a typed array whose buffer can be transferred?\n *\n * `SharedArrayBuffer`-backed views must never be transferred: the whole point\n * of the shared path is that both sides keep looking at the same memory.\n *\n * @param {unknown} v any value\n * @returns {boolean} true when the value's buffer is transferable\n */\n function isTransferable(v) {\n  if (!ArrayBuffer.isView(v)) return false;\n  const buf = /** @type {ArrayBufferView} */ (v).buffer;\n  if (!buf) return false;\n  return typeof SharedArrayBuffer === 'undefined' || !(buf instanceof SharedArrayBuffer);\n}\n\n/**\n * Collect the transferable buffers in a kernel result.\n *\n * Kernels return either a bare typed array (a permutation or a mask) or a small\n * record of them (`groupByColumns` returns `{ keys, buckets, packed }`), so one\n * level of walking is enough and avoids paying for a deep traversal on the hot\n * path.\n *\n * @param {unknown} value a kernel result\n * @param {ArrayBuffer[]} [out] accumulator\n * @returns {ArrayBuffer[]} distinct buffers to hand to `postMessage`\n */\n function collectTransfers(value, out = []) {\n  /**\n   * Add one candidate, de-duplicating buffers shared by several views.\n   * @param {unknown} v candidate value\n   * @returns {void}\n   */\n  const add = (v) => {\n    if (!isTransferable(v)) return;\n    const buf = /** @type {ArrayBufferView} */ (v).buffer;\n    if (!out.includes(buf)) out.push(buf);\n  };\n\n  if (value == null) return out;\n  if (ArrayBuffer.isView(value)) { add(value); return out; }\n  if (Array.isArray(value)) {\n    for (const item of value) add(item);\n    return out;\n  }\n  if (typeof value === 'object') {\n    for (const key of Object.keys(value)) {\n      const item = /** @type {Record<string, unknown>} */ (value)[key];\n      if (Array.isArray(item)) for (const sub of item) add(sub);\n      else add(item);\n    }\n  }\n  return out;\n}\n\n/* ------------------------------------------------------------------ */\n/* Serialisability                                                    */\n/* ------------------------------------------------------------------ */\n\n/**\n * Can this options bag cross a thread boundary?\n *\n * A custom `compare`, a `custom` filter predicate or a `TotalFn` is a closure\n * over main-thread state; structured clone cannot carry it. Rather than fail,\n * the host runs those requests locally, which is the honest outcome — the\n * caller asked for main-thread code.\n *\n * @param {unknown} value any argument destined for the Worker\n * @param {number} [depth] recursion guard\n * @returns {boolean} true when nothing in the value is a function\n */\n function isPortable(value, depth = 0) {\n  if (value == null) return true;\n  const t = typeof value;\n  if (t === 'function' || t === 'symbol') return false;\n  if (t !== 'object') return true;\n  if (depth > 4) return true;\n  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer || value instanceof Date) return true;\n  if (Array.isArray(value)) {\n    for (const item of value) if (!isPortable(item, depth + 1)) return false;\n    return true;\n  }\n  for (const key of Object.keys(value)) {\n    if (!isPortable(/** @type {Record<string, unknown>} */ (value)[key], depth + 1)) return false;\n  }\n  return true;\n}\n\n/**\n * Collect every column id referenced by a filter tree, so the transport copies\n * only the columns the operation touches (§5.13).\n *\n * @param {unknown} filters a `FilterSet`: a condition, a group, or null\n * @param {Set<string>} [out] accumulator\n * @returns {Set<string>} referenced column ids\n */\n function filterColumnIds(filters, out = new Set()) {\n  if (!filters || typeof filters !== 'object') return out;\n  const node = /** @type {Record<string, unknown>} */ (filters);\n  if (typeof node.col === 'string') out.add(node.col);\n  const conditions = node.conditions;\n  if (Array.isArray(conditions)) for (const child of conditions) filterColumnIds(child, out);\n  return out;\n}\n\n});\n\n__def(\"packages/core/src/compute/handle.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"identity\", { enumerable: true, get: function () { return identity; } });\n  Object.defineProperty(__exports, \"rowCount\", { enumerable: true, get: function () { return rowCount; } });\n  Object.defineProperty(__exports, \"bitReader\", { enumerable: true, get: function () { return bitReader; } });\n  Object.defineProperty(__exports, \"presenceReader\", { enumerable: true, get: function () { return presenceReader; } });\n  Object.defineProperty(__exports, \"dictSize\", { enumerable: true, get: function () { return dictSize; } });\n  Object.defineProperty(__exports, \"dictValue\", { enumerable: true, get: function () { return dictValue; } });\n  Object.defineProperty(__exports, \"multiValue\", { enumerable: true, get: function () { return multiValue; } });\n  Object.defineProperty(__exports, \"valueReader\", { enumerable: true, get: function () { return valueReader; } });\n  Object.defineProperty(__exports, \"numericTotalOrder\", { enumerable: true, get: function () { return numericTotalOrder; } });\n  Object.defineProperty(__exports, \"valueComparator\", { enumerable: true, get: function () { return valueComparator; } });\n  Object.defineProperty(__exports, \"dictRanks\", { enumerable: true, get: function () { return dictRanks; } });\n  Object.defineProperty(__exports, \"isMissing\", { enumerable: true, get: function () { return isMissing; } });\n  const __m0 = __req(\"packages/core/src/internal/util.js\");\n  const collator = __m0[\"collator\"];\n  const defaultCompare = __m0[\"defaultCompare\"];\n  const warnOnce = __m0[\"warnOnce\"];\n/**\n * Shared `ColumnHandle` access helpers for the compute kernels (§5.2–5.4).\n *\n * Everything here is deliberately allocation-free per row: the exported\n * factories build one closure per column per operation, and that closure is\n * hoisted out of the hot loop by the caller. Nothing in this file touches the\n * DOM, so the kernels run unchanged inside a Worker (§5.13).\n *\n * The `ColumnHandle` shape is the hot contract in `docs/CONTRACTS.md` §2:\n * `{ id, kind, nullable, values, presence, dict, offsets, get(physical), version }`.\n */\n\n\n\n/**\n * A `Uint32Array` holding `0..n-1`, the identity permutation (§5.5).\n * @param {number} n row count\n * @returns {Uint32Array} the identity permutation\n */\n function identity(n) {\n  const out = new Uint32Array(n);\n  for (let i = 0; i < n; i++) out[i] = i;\n  return out;\n}\n\n/**\n * Number of rows a handle covers.\n *\n * Bitset-backed columns carry no length of their own — a `Uint8Array` of `k`\n * bytes could be `8k` rows or fewer — so callers either pass an explicit index\n * list or supply `opts.count`. This is documented as a contract gap rather than\n * guessed at silently.\n *\n * @param {object|null|undefined} handle the column handle\n * @param {{count?: number}} [opts] optional explicit row count\n * @returns {number} the row count\n */\n function rowCount(handle, opts) {\n  if (opts && typeof opts.count === 'number') return opts.count;\n  if (!handle) return 0;\n  if (typeof handle.count === 'number') return handle.count;\n  if (typeof handle.length === 'number') return handle.length;\n  const values = handle.values;\n  if (handle.kind === 'multi' && handle.offsets) return Math.max(0, handle.offsets.length - 1);\n  if (!values) return handle.presence && typeof handle.presence.size === 'number' ? handle.presence.size : 0;\n  if (handle.kind === 'bitset') {\n    if (typeof values.size === 'number') return values.size;\n    if (handle.presence && typeof handle.presence.size === 'number') return handle.presence.size;\n    warnOnce(`count:${handle.id}`, `column \"${handle.id}\" is bitset-backed with no declared row count; assuming ${values.length * 8}`);\n    return values.length * 8;\n  }\n  return values.length;\n}\n\n/* ------------------------------------------------------------------ */\n/* Bit access                                                         */\n/* ------------------------------------------------------------------ */\n\n/** Cache of bit order per `Bitset` constructor, probed once (see `bitOrderOf`). */\nconst bitOrders = new WeakMap();\n\n/**\n * Determine whether a `Bitset` packs bit `i` into the low or the high end of\n * its byte. Area A's `Bitset` does not declare this, so it is probed once per\n * constructor with `Bitset.from([false, true])`: `words[0] === 2` means bit 1\n * is at position 1 from the least significant end.\n *\n * @param {object} bitset an instance whose constructor is probed\n * @returns {'lsb'|'msb'|'unknown'} bit order within each byte\n */\nfunction bitOrderOf(bitset) {\n  const ctor = bitset.constructor;\n  if (!ctor) return 'unknown';\n  const cached = bitOrders.get(ctor);\n  if (cached) return cached;\n  let order = 'unknown';\n  try {\n    let probe = null;\n    if (typeof ctor.from === 'function') probe = ctor.from([false, true]);\n    else {\n      probe = new ctor(8);\n      probe.set(1);\n    }\n    const words = probe && probe.words;\n    if (words && words.length) {\n      if (words[0] === 0x02) order = 'lsb';\n      else if (words[0] === 0x40) order = 'msb';\n    }\n  } catch {\n    // An unprobeable Bitset falls back to `get()` in `bitReader`, which is\n    // correct whatever the packing.\n    order = 'unknown';\n  }\n  bitOrders.set(ctor, order);\n  return order;\n}\n\n/**\n * A reader returning bit `i` of a bitset as 0 or 1. Accepts either a raw\n * `Uint8Array` (a boolean column's `values`) or area A's `Bitset` (a presence\n * bitset), and falls back to `get()` when the packing cannot be determined.\n *\n * @param {Uint8Array|{words?: Uint8Array, get?(i: number): boolean}} bits the bitset\n * @returns {(i: number) => number} 1 when the bit is set, 0 otherwise\n */\n function bitReader(bits) {\n  if (!bits) return () => 0;\n  const raw = bits instanceof Uint8Array ? bits : bits.words;\n  if (raw instanceof Uint8Array) {\n    const order = bits instanceof Uint8Array ? 'lsb' : bitOrderOf(bits);\n    if (order === 'lsb') return (i) => (raw[i >>> 3] >>> (i & 7)) & 1;\n    if (order === 'msb') return (i) => (raw[i >>> 3] >>> (7 - (i & 7))) & 1;\n  }\n  if (typeof bits.get === 'function') return (i) => (bits.get(i) ? 1 : 0);\n  return () => 0;\n}\n\n/**\n * A reader for a column's presence bitset, or `null` when the column is not\n * nullable. A null return is the signal to omit the null check from the inner\n * loop entirely (§5.3).\n *\n * @param {object|null|undefined} handle the column handle\n * @returns {((i: number) => number)|null} presence reader, or null when every row is present\n */\n function presenceReader(handle) {\n  if (!handle || !handle.presence) return null;\n  return bitReader(handle.presence);\n}\n\n/* ------------------------------------------------------------------ */\n/* Value access                                                       */\n/* ------------------------------------------------------------------ */\n\n/**\n * Number of entries in a dictionary, tolerating either a `size` accessor or a\n * `values()` table.\n * @param {{size?: number, values?(): unknown[]}} dict the dictionary\n * @returns {number} the entry count\n */\n function dictSize(dict) {\n  if (!dict) return 0;\n  if (typeof dict.size === 'number') return dict.size;\n  if (typeof dict.values === 'function') return dict.values().length;\n  return 0;\n}\n\n/**\n * Decode a dictionary code to its value.\n * @param {{valueOf?(code: number): unknown, values?(): unknown[]}} dict the dictionary\n * @param {number} code the code to decode\n * @returns {unknown} the stored value\n */\n function dictValue(dict, code) {\n  if (!dict) return null;\n  if (typeof dict.valueOf === 'function') return dict.valueOf(code);\n  if (typeof dict.values === 'function') return dict.values()[code];\n  return null;\n}\n\n/**\n * The values of one row of a multi-value column (§8.3). `offsets` holds `n + 1`\n * entries so row `i` spans `[offsets[i], offsets[i + 1])` of the flat buffer.\n *\n * @param {object} handle a handle with `kind === 'multi'`\n * @param {number} i the physical row index\n * @returns {unknown[]} the row's values, empty when the row holds none\n */\n function multiValue(handle, i) {\n  const offsets = handle.offsets;\n  const values = handle.values;\n  if (!offsets || !values) return [];\n  const from = offsets[i];\n  const to = offsets[i + 1];\n  if (!(to > from)) return [];\n  // Decoded through the dictionary, exactly as the single-valued dictionary\n  // reader does. A `multi` column stores dictionary *codes*, and returning\n  // them raw meant every kernel that reads logical values compared integers\n  // against the caller's strings: `containsAll(['pci','gdpr'])` matched\n  // nothing at all, and only above the columnarisation threshold, because\n  // below it the object path returns the real array.\n  const dict = handle.dict;\n  const out = new Array(to - from);\n  for (let k = from; k < to; k++) out[k - from] = dict ? dictValue(dict, values[k]) : values[k];\n  return out;\n}\n\n/**\n * Build a reader returning the *logical* value of a row: dictionary-decoded,\n * bit-expanded, and `null` where the presence bitset says the value is absent.\n * This is the fallback path; the fast kernels read `handle.values` directly.\n *\n * @param {object|null|undefined} handle the column handle\n * @returns {(i: number) => unknown} logical value reader\n */\n function valueReader(handle) {\n  if (!handle) return () => undefined;\n  const values = handle.values;\n  const present = presenceReader(handle);\n  const kind = handle.kind;\n\n  if (kind === 'dictionary') {\n    const dict = handle.dict;\n    if (present) return (i) => (present(i) ? dictValue(dict, values[i]) : null);\n    return (i) => dictValue(dict, values[i]);\n  }\n  if (kind === 'bitset') {\n    const bit = bitReader(values);\n    if (present) return (i) => (present(i) ? bit(i) === 1 : null);\n    return (i) => bit(i) === 1;\n  }\n  if (kind === 'multi') {\n    if (present) return (i) => (present(i) ? multiValue(handle, i) : null);\n    return (i) => multiValue(handle, i);\n  }\n  if (!values && typeof handle.get === 'function') {\n    const get = handle.get.bind(handle);\n    return (i) => {\n      const v = get(i);\n      return v === undefined ? null : v;\n    };\n  }\n  if (present) {\n    return (i) => {\n      if (!present(i)) return null;\n      const v = values[i];\n      return v === undefined ? null : v;\n    };\n  }\n  return (i) => {\n    const v = values[i];\n    return v === undefined ? null : v;\n  };\n}\n\n/* ------------------------------------------------------------------ */\n/* Comparison                                                         */\n/* ------------------------------------------------------------------ */\n\n/**\n * Total order over doubles, refining IEEE comparison so that `-0` sorts before\n * `+0` and `NaN` sorts after every number. The radix sort orders by bit pattern\n * and therefore separates `-0` from `+0`; the comparator used as its oracle\n * must agree, which is exactly the §5.14 acceptance criterion.\n *\n * @param {number} a left value\n * @param {number} b right value\n * @returns {number} negative, zero or positive\n */\n function numericTotalOrder(a, b) {\n  if (a < b) return -1;\n  if (a > b) return 1;\n  if (a === b) {\n    const na = Object.is(a, -0);\n    const nb = Object.is(b, -0);\n    if (na === nb) return 0;\n    return na ? -1 : 1;\n  }\n  const an = Number.isNaN(a);\n  const bn = Number.isNaN(b);\n  if (an && bn) return 0;\n  return an ? 1 : -1;\n}\n\n/**\n * Build the generic value comparator used by the merge-sort path. The\n * `Intl.Collator` is created once here and captured, never inside the returned\n * function — creating one per comparison is roughly ten times slower and is the\n * classic mistake this design exists to avoid (§5.6).\n *\n * @param {string} [locale] BCP-47 locale for text collation\n * @returns {(a: unknown, b: unknown) => number} a comparator over logical values\n */\n function valueComparator(locale) {\n  const coll = collator(locale);\n  return (a, b) => {\n    if (a === b) return 0;\n    const ta = typeof a;\n    const tb = typeof b;\n    if (ta === 'string' && tb === 'string') return coll.compare(a, b);\n    if (ta === 'number' && tb === 'number') return numericTotalOrder(a, b);\n    if (ta === 'boolean' && tb === 'boolean') return a === b ? 0 : a ? 1 : -1;\n    if (a instanceof Date || b instanceof Date) {\n      const na = a instanceof Date ? a.getTime() : Number(a);\n      const nb = b instanceof Date ? b.getTime() : Number(b);\n      return numericTotalOrder(na, nb);\n    }\n    return defaultCompare(a, b);\n  };\n}\n\n/**\n * Collation ranks for a dictionary, `ranks[code] = sort rank` (§5.6). Area A\n * caches these against the dictionary version; the local fallback exists so the\n * kernels also work against a plain value table.\n *\n * @param {object} dict the dictionary\n * @param {string} [locale] BCP-47 locale for collation\n * @returns {Uint32Array} rank per code\n */\n function dictRanks(dict, locale) {\n  if (dict && typeof dict.ranks === 'function') return dict.ranks(locale);\n  const table = dict && typeof dict.values === 'function' ? dict.values() : [];\n  const n = table.length;\n  const cmp = valueComparator(locale);\n  const order = new Array(n);\n  for (let i = 0; i < n; i++) order[i] = i;\n  order.sort((a, b) => cmp(table[a], table[b]) || a - b);\n  const ranks = new Uint32Array(n);\n  for (let r = 0; r < n; r++) ranks[order[r]] = r;\n  return ranks;\n}\n\n/**\n * Is this value absent for ordering purposes? Null, undefined and `NaN` are all\n * placed by `sort.nullsFirst` rather than compared (§5.3), so they are\n * partitioned out before the value sort runs.\n *\n * @param {unknown} v the value\n * @returns {boolean} true when the value is absent for ordering\n */\n function isMissing(v) {\n  return v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));\n}\n\n});\n\n__def(\"packages/core/src/compute/sort.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"radixSortFloat64\", { enumerable: true, get: function () { return radixSortFloat64; } });\n  Object.defineProperty(__exports, \"radixSortInt32\", { enumerable: true, get: function () { return radixSortInt32; } });\n  Object.defineProperty(__exports, \"rankSortDictionary\", { enumerable: true, get: function () { return rankSortDictionary; } });\n  Object.defineProperty(__exports, \"mergeSortComparator\", { enumerable: true, get: function () { return mergeSortComparator; } });\n  Object.defineProperty(__exports, \"sortColumn\", { enumerable: true, get: function () { return sortColumn; } });\n  Object.defineProperty(__exports, \"sortMulti\", { enumerable: true, get: function () { return sortMulti; } });\n  const __m0 = __req(\"packages/core/src/compute/handle.js\");\n  const bitReader = __m0[\"bitReader\"];\n  const dictRanks = __m0[\"dictRanks\"];\n  const dictSize = __m0[\"dictSize\"];\n  const identity = __m0[\"identity\"];\n  const isMissing = __m0[\"isMissing\"];\n  const presenceReader = __m0[\"presenceReader\"];\n  const rowCount = __m0[\"rowCount\"];\n  const valueComparator = __m0[\"valueComparator\"];\n  const valueReader = __m0[\"valueReader\"];\n/**\n * Sort kernels (§5.6, §9.1).\n *\n * Three paths, selected by backing:\n *\n * - **Numeric and date** (`float64`, `int32`): LSD radix sort over the raw bit\n *   pattern. No comparison callbacks, linear in the row count.\n * - **Dictionary**: collate the dictionary once into ranks, then sort the ranks\n *   with a counting pass. Six collator calls instead of twenty million (§5.4).\n * - **Everything else**: stable bottom-up merge sort with one shared collator,\n *   or the column's own `compare`.\n *\n * Every path is stable, because multi-column sort is performed\n * least-significant column first and relies on that stability rather than on a\n * composed comparator (§5.6).\n *\n * Null placement is a partition on the presence bitset performed *before* the\n * value sort, never a branch inside a comparator (§5.3). `NaN` is partitioned\n * with the absent values: it has no meaningful position in an ordering, and\n * grouping it with nulls keeps ascending and descending symmetrical.\n */\n\n\n\n/** Shared empty index list, so the common no-nulls case allocates nothing. */\nconst EMPTY_INDICES = new Uint32Array(0);\n\n/* ------------------------------------------------------------------ */\n/* IEEE-754 bit access                                                */\n/* ------------------------------------------------------------------ */\n\n/** Scratch union used to read the two 32-bit halves of a double. */\nconst SCRATCH = new ArrayBuffer(8);\n/** Float view over {@link SCRATCH}. */\nconst SCRATCH_F64 = new Float64Array(SCRATCH);\n/** Word view over {@link SCRATCH}. */\nconst SCRATCH_U32 = new Uint32Array(SCRATCH);\n\n/**\n * Word index of the half holding the sign bit and exponent, resolved once at\n * module load. Typed array views are platform-endian, so this cannot be\n * assumed; `-1` has its sign bit set, so whichever half shows it is the high\n * half.\n */\nconst HI = (() => {\n  SCRATCH_F64[0] = -1;\n  return (SCRATCH_U32[1] & 0x80000000) !== 0 ? 1 : 0;\n})();\n/** Word index of the low half of the mantissa. */\nconst LO = HI === 1 ? 0 : 1;\n\n/**\n * Apply the standard IEEE-754 order-preserving transform to one double so that\n * the result orders correctly when compared as an unsigned 64-bit integer\n * (§5.6): if the sign bit is set invert all 64 bits, otherwise invert only the\n * sign bit. Doubles do not order correctly reinterpreted as unsigned because\n * negatives run backwards and the sign bit dominates the magnitude.\n *\n * The transform is never reversed — sorting needs the order, not the values.\n *\n * @param {number} value the double to transform\n * @param {Uint32Array} out two-element buffer receiving `[lo, hi]`\n * @returns {void}\n */\nfunction transformDouble(value, out) {\n  SCRATCH_F64[0] = value;\n  let hi = SCRATCH_U32[HI];\n  let lo = SCRATCH_U32[LO];\n  if ((hi & 0x80000000) !== 0) {\n    hi = ~hi >>> 0;\n    lo = ~lo >>> 0;\n  } else {\n    hi = (hi ^ 0x80000000) >>> 0;\n  }\n  out[0] = lo;\n  out[1] = hi;\n}\n\n/* ------------------------------------------------------------------ */\n/* Radix primitives                                                   */\n/* ------------------------------------------------------------------ */\n\n/**\n * Stable LSD radix sort over 64-bit keys held as two 32-bit halves: eight\n * passes of eight bits. All eight histograms are built in a single pass, and a\n * pass whose digit is uniform is skipped, which for real data removes most of\n * the high-order passes.\n *\n * @param {Uint32Array} idx indices to permute; the buffer is reused\n * @param {Uint32Array} lo low halves of the transformed keys, parallel to `idx`\n * @param {Uint32Array} hi high halves of the transformed keys, parallel to `idx`\n * @param {number} n number of entries\n * @returns {Uint32Array} the sorted indices, in `idx` or in an internal buffer\n */\nfunction radixLsd64(idx, lo, hi, n) {\n  if (n < 2) return idx;\n  const hist = new Uint32Array(256 * 8);\n  for (let i = 0; i < n; i++) {\n    const l = lo[i];\n    const h = hi[i];\n    hist[l & 0xff]++;\n    hist[256 + ((l >>> 8) & 0xff)]++;\n    hist[512 + ((l >>> 16) & 0xff)]++;\n    hist[768 + ((l >>> 24) & 0xff)]++;\n    hist[1024 + (h & 0xff)]++;\n    hist[1280 + ((h >>> 8) & 0xff)]++;\n    hist[1536 + ((h >>> 16) & 0xff)]++;\n    hist[1792 + ((h >>> 24) & 0xff)]++;\n  }\n\n  let srcIdx = idx;\n  let srcLo = lo;\n  let srcHi = hi;\n  let dstIdx = new Uint32Array(n);\n  let dstLo = new Uint32Array(n);\n  let dstHi = new Uint32Array(n);\n  const offset = new Uint32Array(256);\n\n  for (let pass = 0; pass < 8; pass++) {\n    const base = pass << 8;\n    const shift = (pass & 3) << 3;\n    const useHi = pass >= 4;\n\n    let skip = false;\n    for (let b = 0; b < 256; b++) {\n      if (hist[base + b] === n) { skip = true; break; }\n    }\n    if (skip) continue;\n\n    let sum = 0;\n    for (let b = 0; b < 256; b++) {\n      offset[b] = sum;\n      sum += hist[base + b];\n    }\n\n    for (let i = 0; i < n; i++) {\n      const l = srcLo[i];\n      const h = srcHi[i];\n      const digit = ((useHi ? h : l) >>> shift) & 0xff;\n      const p = offset[digit]++;\n      dstIdx[p] = srcIdx[i];\n      dstLo[p] = l;\n      dstHi[p] = h;\n    }\n\n    let t = srcIdx; srcIdx = dstIdx; dstIdx = t;\n    t = srcLo; srcLo = dstLo; dstLo = t;\n    t = srcHi; srcHi = dstHi; dstHi = t;\n  }\n  return srcIdx;\n}\n\n/**\n * Stable LSD radix sort over 32-bit keys: four passes of eight bits, skipping\n * uniform passes.\n *\n * @param {Uint32Array} idx indices to permute; the buffer is reused\n * @param {Uint32Array} keys transformed keys, parallel to `idx`\n * @param {number} n number of entries\n * @returns {Uint32Array} the sorted indices, in `idx` or in an internal buffer\n */\nfunction radixLsd32(idx, keys, n) {\n  if (n < 2) return idx;\n  const hist = new Uint32Array(256 * 4);\n  for (let i = 0; i < n; i++) {\n    const k = keys[i];\n    hist[k & 0xff]++;\n    hist[256 + ((k >>> 8) & 0xff)]++;\n    hist[512 + ((k >>> 16) & 0xff)]++;\n    hist[768 + ((k >>> 24) & 0xff)]++;\n  }\n  let srcIdx = idx;\n  let srcKeys = keys;\n  let dstIdx = new Uint32Array(n);\n  let dstKeys = new Uint32Array(n);\n  const offset = new Uint32Array(256);\n\n  for (let pass = 0; pass < 4; pass++) {\n    const base = pass << 8;\n    const shift = pass << 3;\n    let skip = false;\n    for (let b = 0; b < 256; b++) {\n      if (hist[base + b] === n) { skip = true; break; }\n    }\n    if (skip) continue;\n    let sum = 0;\n    for (let b = 0; b < 256; b++) {\n      offset[b] = sum;\n      sum += hist[base + b];\n    }\n    for (let i = 0; i < n; i++) {\n      const k = srcKeys[i];\n      const p = offset[(k >>> shift) & 0xff]++;\n      dstIdx[p] = srcIdx[i];\n      dstKeys[p] = k;\n    }\n    let t = srcIdx; srcIdx = dstIdx; dstIdx = t;\n    t = srcKeys; srcKeys = dstKeys; dstKeys = t;\n  }\n  return srcIdx;\n}\n\n/**\n * Stable counting sort over small non-negative integer keys — a single-digit\n * radix pass, which is what a dictionary rank sort reduces to (§5.6): one\n * counting pass, a prefix sum for the bucket offsets, one scatter pass.\n *\n * @param {Uint32Array} idx indices to permute\n * @param {Uint32Array} keys key per entry, parallel to `idx`\n * @param {number} n number of entries\n * @param {number} radix exclusive upper bound on key values\n * @returns {Uint32Array} a new sorted index array\n */\nfunction countingSort(idx, keys, n, radix) {\n  const counts = new Uint32Array(radix + 1);\n  for (let i = 0; i < n; i++) counts[keys[i]]++;\n  let sum = 0;\n  for (let k = 0; k <= radix; k++) {\n    const c = counts[k];\n    counts[k] = sum;\n    sum += c;\n  }\n  const out = new Uint32Array(n);\n  for (let i = 0; i < n; i++) out[counts[keys[i]]++] = idx[i];\n  return out;\n}\n\n/**\n * Choose between a counting sort and a four-pass radix sort for unsigned keys.\n * Below the threshold one counting pass beats four radix passes; above it the\n * counting array itself becomes the dominant cost.\n *\n * @param {Uint32Array} idx indices to permute\n * @param {Uint32Array} keys keys parallel to `idx`\n * @param {number} n number of entries\n * @param {number} radix exclusive upper bound on key values\n * @returns {Uint32Array} the sorted indices\n */\nfunction sortUint32Keys(idx, keys, n, radix) {\n  if (n < 2) return idx;\n  if (radix <= 65536 || radix <= n * 2) return countingSort(idx, keys, n, radix);\n  return radixLsd32(idx, keys, n);\n}\n\n/**\n * Copy a possibly-internal buffer into a standalone `Uint32Array` of exactly\n * `n` entries, so kernels never hand back a view onto a scratch buffer.\n *\n * @param {Uint32Array} buffer the buffer to normalise\n * @param {number} n the expected length\n * @returns {Uint32Array} an exact-length array\n */\nfunction exact(buffer, n) {\n  if (buffer.length === n && buffer.byteOffset === 0) return buffer;\n  return Uint32Array.prototype.slice.call(buffer, 0, n);\n}\n\n/* ------------------------------------------------------------------ */\n/* Exported kernels                                                   */\n/* ------------------------------------------------------------------ */\n\n/**\n * Radix sort a `Float64Array` column, producing a display->physical\n * permutation (§5.5). Applies the IEEE-754 transform of {@link transformDouble}\n * and, for a descending sort, complements the transformed key rather than\n * reversing the result — reversal would destroy the stability the multi-column\n * passes depend on (§5.6).\n *\n * `NaN` has no position in an ordering, so it is partitioned to the tail in\n * both directions, preserving input order among the `NaN`s.\n *\n * @param {Float64Array|ArrayLike<number>} values the column's backing buffer\n * @param {Uint32Array|null} order indices to sort; null means all rows\n * @param {boolean} [descending] sort high to low\n * @returns {Uint32Array} the sorted indices\n */\n function radixSortFloat64(values, order, descending = false) {\n  const src = order || identity(values.length);\n  const n = src.length;\n  if (n < 2) return Uint32Array.from(src);\n\n  const idx = new Uint32Array(n);\n  const lo = new Uint32Array(n);\n  const hi = new Uint32Array(n);\n  const nans = new Uint32Array(n);\n  const pair = new Uint32Array(2);\n  let m = 0;\n  let nanCount = 0;\n\n  for (let i = 0; i < n; i++) {\n    const row = src[i];\n    const v = values[row];\n    if (Number.isNaN(v)) { nans[nanCount++] = row; continue; }\n    transformDouble(v, pair);\n    if (descending) {\n      lo[m] = ~pair[0] >>> 0;\n      hi[m] = ~pair[1] >>> 0;\n    } else {\n      lo[m] = pair[0];\n      hi[m] = pair[1];\n    }\n    idx[m++] = row;\n  }\n\n  const sorted = radixLsd64(idx.subarray(0, m), lo.subarray(0, m), hi.subarray(0, m), m);\n  if (nanCount === 0) return exact(sorted, m);\n  const out = new Uint32Array(n);\n  out.set(sorted.subarray(0, m), 0);\n  out.set(nans.subarray(0, nanCount), m);\n  return out;\n}\n\n/**\n * Radix sort an `Int32Array` column. Signed 32-bit integers order correctly as\n * unsigned once the sign bit is flipped — the 32-bit analogue of the double\n * transform (§5.6).\n *\n * @param {Int32Array|ArrayLike<number>} values the column's backing buffer\n * @param {Uint32Array|null} order indices to sort; null means all rows\n * @param {boolean} [descending] sort high to low\n * @returns {Uint32Array} the sorted indices\n */\n function radixSortInt32(values, order, descending = false) {\n  const src = order || identity(values.length);\n  const n = src.length;\n  if (n < 2) return Uint32Array.from(src);\n  const idx = Uint32Array.from(src);\n  const keys = new Uint32Array(n);\n  for (let i = 0; i < n; i++) {\n    const k = (values[idx[i]] ^ 0x80000000) >>> 0;\n    keys[i] = descending ? (~k >>> 0) : k;\n  }\n  return exact(radixLsd32(idx, keys, n), n);\n}\n\n/**\n * Sort a dictionary column by collation rank (§5.6). The dictionary is collated\n * once — `ranks[code] = rank`, cached by area A against the dictionary version\n * — and the ranks are then sorted with a single counting pass. Absent rows take\n * the highest rank so they trail; in practice `sortColumn` has already\n * partitioned them out.\n *\n * @param {object} handle a `kind === 'dictionary'` column handle\n * @param {Uint32Array|null} order indices to sort; null means all rows\n * @param {{descending?: boolean, locale?: string, count?: number}} [opts] sort options\n * @returns {Uint32Array} the sorted indices\n */\n function rankSortDictionary(handle, order, opts = {}) {\n  const src = order || identity(rowCount(handle, opts));\n  const n = src.length;\n  if (n < 2) return Uint32Array.from(src);\n  const ranks = dictRanks(handle.dict, opts.locale);\n  const codes = handle.values;\n  const present = presenceReader(handle);\n  const size = Math.max(dictSize(handle.dict), ranks.length);\n  const absentRank = size; // one past the last real rank\n  const idx = Uint32Array.from(src);\n  const keys = new Uint32Array(n);\n  const descending = !!opts.descending;\n\n  for (let i = 0; i < n; i++) {\n    const row = idx[i];\n    let rank = present && present(row) === 0 ? absentRank : ranks[codes[row]];\n    if (rank === undefined) rank = absentRank;\n    // Complementing rather than reversing keeps the pass stable for descending.\n    keys[i] = descending ? absentRank - rank : rank;\n  }\n  return exact(sortUint32Keys(idx, keys, n, size + 1), n);\n}\n\n/**\n * Stable bottom-up merge sort of an index array, comparing the values those\n * indices address. Used for text, object and custom-comparator columns.\n *\n * @param {ArrayLike<unknown>} values buffer addressed by the indices\n * @param {Uint32Array|ArrayLike<number>} order the indices to sort\n * @param {(a: unknown, b: unknown) => number} compare comparator over logical values\n * @returns {Uint32Array} the sorted indices\n */\n function mergeSortComparator(values, order, compare) {\n  const n = order.length;\n  let src = Uint32Array.from(order);\n  if (n < 2) return src;\n  let dst = new Uint32Array(n);\n  for (let width = 1; width < n; width <<= 1) {\n    for (let start = 0; start < n; start += width << 1) {\n      const mid = Math.min(start + width, n);\n      const end = Math.min(start + (width << 1), n);\n      let i = start;\n      let j = mid;\n      let k = start;\n      while (i < mid && j < end) {\n        // `<= 0` takes from the left run first, which is what makes this stable.\n        dst[k++] = compare(values[src[i]], values[src[j]]) <= 0 ? src[i++] : src[j++];\n      }\n      while (i < mid) dst[k++] = src[i++];\n      while (j < end) dst[k++] = src[j++];\n    }\n    const t = src; src = dst; dst = t;\n  }\n  return src;\n}\n\n/**\n * Stable counting sort of a boolean (bitset-backed) column: two predictable\n * passes, false then true, reversed for a descending sort.\n *\n * @param {object} handle a `kind === 'bitset'` column handle\n * @param {Uint32Array} idx the indices to sort\n * @param {boolean} descending place true before false\n * @returns {Uint32Array} the sorted indices\n */\nfunction sortBitsetColumn(handle, idx, descending) {\n  const bit = bitReader(handle.values);\n  const n = idx.length;\n  const out = new Uint32Array(n);\n  const first = descending ? 1 : 0;\n  let k = 0;\n  for (let i = 0; i < n; i++) if (bit(idx[i]) === first) out[k++] = idx[i];\n  for (let i = 0; i < n; i++) if (bit(idx[i]) !== first) out[k++] = idx[i];\n  return out;\n}\n\n/**\n * A buffer addressable by physical row index, for the merge-sort path. Object\n * columns are already an `Array` and are used directly; dictionary, bitset and\n * multi columns are materialised for the rows being sorted only, which keeps\n * the fallback path off the decode-per-comparison route.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array} idx the rows that will be compared\n * @returns {ArrayLike<unknown>} a buffer where `[physical]` is the logical value\n */\nfunction indexableValues(handle, idx) {\n  const values = handle.values;\n  const kind = handle.kind;\n  const direct = (kind === 'object' || kind === undefined) && (Array.isArray(values) || ArrayBuffer.isView(values));\n  if (direct && !handle.presence) return values;\n  const reader = valueReader(handle);\n  const materialised = new Array(rowCount(handle) || 0);\n  for (let i = 0; i < idx.length; i++) {\n    const row = idx[i];\n    materialised[row] = reader(row);\n  }\n  return materialised;\n}\n\n/**\n * Merge-sort path using the shared generic comparator: collator for text, total\n * order for numbers, `defaultCompare` otherwise. The collator is built once,\n * outside the comparator (§5.6).\n *\n * @param {object} handle the column handle\n * @param {Uint32Array} idx the present indices to sort\n * @param {{descending?: boolean, locale?: string}} opts sort options\n * @returns {Uint32Array} the sorted indices\n */\nfunction sortByComparator(handle, idx, opts) {\n  const values = indexableValues(handle, idx);\n  const base = valueComparator(opts.locale);\n  const compare = opts.descending ? (a, b) => base(b, a) : base;\n  return mergeSortComparator(values, idx, compare);\n}\n\n/**\n * Merge-sort path using the column's own `value.compare` (§9.1). The comparator\n * receives `(a, b, undefined, undefined, descending)` — kernels have no row\n * objects — and the grid inverts the result for a descending sort, so a custom\n * comparator only ever has to describe ascending order.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array} idx the present indices to sort\n * @param {{descending?: boolean, compare: Function}} opts sort options\n * @returns {Uint32Array} the sorted indices\n */\nfunction sortByCompare(handle, idx, opts) {\n  const values = indexableValues(handle, idx);\n  const user = opts.compare;\n  const descending = !!opts.descending;\n  const compare = descending\n    ? (a, b) => -user(a, b, undefined, undefined, true)\n    : (a, b) => user(a, b, undefined, undefined, false);\n  return mergeSortComparator(values, idx, compare);\n}\n\n/**\n * Split an index list into present and absent rows, stably, so null placement\n * happens before the value sort rather than inside a comparator (§5.3). `NaN`\n * in a float column counts as absent for ordering.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array} idx the indices to partition\n * @returns {{present: Uint32Array, absent: Uint32Array}} the two runs, order preserved\n */\nfunction partitionPresent(handle, idx) {\n  const n = idx.length;\n  const present = presenceReader(handle);\n  const values = handle.values;\n  const checkNaN = handle.kind === 'float64' && !!values;\n  const looseKind = handle.kind === 'object' || handle.kind === 'multi' || handle.kind === undefined;\n\n  if (!present && !checkNaN && !looseKind) return { present: idx, absent: EMPTY_INDICES };\n\n  const keep = new Uint32Array(n);\n  const drop = new Uint32Array(n);\n  let p = 0;\n  let a = 0;\n\n  if (present && checkNaN) {\n    for (let i = 0; i < n; i++) {\n      const row = idx[i];\n      if (present(row) === 1 && !Number.isNaN(values[row])) keep[p++] = row; else drop[a++] = row;\n    }\n  } else if (checkNaN && !present) {\n    for (let i = 0; i < n; i++) {\n      const row = idx[i];\n      if (!Number.isNaN(values[row])) keep[p++] = row; else drop[a++] = row;\n    }\n  } else if (present && !looseKind) {\n    for (let i = 0; i < n; i++) {\n      const row = idx[i];\n      if (present(row) === 1) keep[p++] = row; else drop[a++] = row;\n    }\n  } else {\n    // Object and multi backings can hold `undefined` holes whether or not the\n    // column declares itself nullable.\n    const reader = valueReader(handle);\n    for (let i = 0; i < n; i++) {\n      const row = idx[i];\n      if (!isMissing(reader(row))) keep[p++] = row; else drop[a++] = row;\n    }\n  }\n  if (a === 0) return { present: idx, absent: EMPTY_INDICES };\n  return { present: keep.subarray(0, p), absent: drop.subarray(0, a) };\n}\n\n/**\n * Join the sorted present run and the absent run according to null placement.\n *\n * @param {Uint32Array} sorted the sorted present rows\n * @param {Uint32Array} absent the absent rows, in input order\n * @param {boolean} nullsFirst place absent rows at the head\n * @returns {Uint32Array} the complete permutation\n */\nfunction joinRuns(sorted, absent, nullsFirst) {\n  if (absent.length === 0) return sorted;\n  const out = new Uint32Array(sorted.length + absent.length);\n  if (nullsFirst) {\n    out.set(absent, 0);\n    out.set(sorted, absent.length);\n  } else {\n    out.set(sorted, 0);\n    out.set(absent, sorted.length);\n  }\n  return out;\n}\n\n/**\n * Sort one column, producing a display->physical permutation (§5.5, §5.6).\n *\n * Absent values (and `NaN`) are partitioned out first and placed by\n * `nullsFirst` in both directions; the sort direction never moves them, which\n * is what a grid user expects.\n *\n * @param {object} handle the column handle to sort by\n * @param {Uint32Array|null} order indices to sort; null means all rows `0..n-1`\n * @param {{descending?: boolean, nullsFirst?: boolean, locale?: string,\n *          compare?: Function, stable?: boolean, count?: number}} [opts] sort options\n * @returns {Uint32Array} the sorted indices\n */\n function sortColumn(handle, order, opts = {}) {\n  const src = order || identity(rowCount(handle, opts));\n  if (!handle || src.length < 2) return Uint32Array.from(src);\n\n  const { present, absent } = partitionPresent(handle, src);\n  if (present.length === 0) return Uint32Array.from(src);\n  const descending = !!opts.descending;\n\n  let sorted;\n  if (typeof opts.compare === 'function') {\n    sorted = sortByCompare(handle, present, opts);\n  } else {\n    switch (handle.kind) {\n      case 'float64':\n        sorted = radixSortFloat64(handle.values, present, descending);\n        break;\n      case 'int32':\n        sorted = radixSortInt32(handle.values, present, descending);\n        break;\n      case 'dictionary':\n        sorted = rankSortDictionary(handle, present, opts);\n        break;\n      case 'bitset':\n        sorted = sortBitsetColumn(handle, present, descending);\n        break;\n      default:\n        sorted = sortByComparator(handle, present, opts);\n        break;\n    }\n  }\n  return joinRuns(sorted, absent, !!opts.nullsFirst);\n}\n\n/**\n * Least-significant-column-first multi-pass sort (§5.6). Each pass is a\n * single-column fast path and each pass is stable, so running the entries in\n * reverse leaves the most significant column dominant. No composed comparator\n * is built, which is the whole point: a composed comparator would drag every\n * column onto the slow path.\n *\n * @param {object[]} handles the available column handles, used to resolve `entry.col`\n * @param {{handle?: object, col?: string, descending?: boolean, dir?: 'asc'|'desc',\n *          nullsFirst?: boolean, compare?: Function, locale?: string}[]} entries\n *        sort entries in significance order, most significant first\n * @param {Uint32Array|null} order indices to sort; null means all rows\n * @param {{locale?: string, count?: number}} [opts] shared options, notably the locale\n * @returns {Uint32Array} the sorted indices\n */\n function sortMulti(handles, entries, order, opts = {}) {\n  const list = entries || [];\n  const first = (list.length && (list[0].handle || byId(handles, list[0].col))) || (handles && handles[0]);\n  let current = order || identity(rowCount(first, opts));\n  for (let i = list.length - 1; i >= 0; i--) {\n    const entry = list[i];\n    const handle = entry.handle || byId(handles, entry.col) || (handles && handles[i]);\n    if (!handle) continue;\n    current = sortColumn(handle, current, {\n      descending: entry.descending !== undefined ? !!entry.descending : entry.dir === 'desc',\n      nullsFirst: !!entry.nullsFirst,\n      locale: entry.locale !== undefined ? entry.locale : opts.locale,\n      compare: entry.compare,\n    });\n  }\n  return current instanceof Uint32Array ? current : Uint32Array.from(current);\n}\n\n/**\n * Find a handle by column id.\n * @param {object[]|null|undefined} handles the available handles\n * @param {string|undefined} id the column id to find\n * @returns {object|undefined} the matching handle\n */\nfunction byId(handles, id) {\n  if (!handles || id === undefined) return undefined;\n  for (let i = 0; i < handles.length; i++) if (handles[i] && handles[i].id === id) return handles[i];\n  return undefined;\n}\n\n});\n\n__def(\"packages/core/src/format/date.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"scanPattern\", { enumerable: true, get: function () { return scanPattern; } });\n  Object.defineProperty(__exports, \"toDate\", { enumerable: true, get: function () { return toDate; } });\n  Object.defineProperty(__exports, \"compilePattern\", { enumerable: true, get: function () { return compilePattern; } });\n  Object.defineProperty(__exports, \"compileDate\", { enumerable: true, get: function () { return compileDate; } });\n  Object.defineProperty(__exports, \"toIsoDate\", { enumerable: true, get: function () { return toIsoDate; } });\n  Object.defineProperty(__exports, \"toIsoDateTime\", { enumerable: true, get: function () { return toIsoDateTime; } });\n  Object.defineProperty(__exports, \"compareIso\", { enumerable: true, get: function () { return compareIso; } });\n  const __m0 = __req(\"packages/core/src/internal/util.js\");\n  const isNil = __m0[\"isNil\"];\n  const warnOnce = __m0[\"warnOnce\"];\n/**\n * Date formatter compiler (spec §8.5 `DateFormat`).\n *\n * Three modes, all compiled once per column:\n *\n *  - `pattern`  — a token pattern (`'dd/MM/yyyy HH:mm'`, `'dd MMM yyyy'`).\n *    Numeric fields are assembled by hand so output is stable across ICU\n *    versions; only month and weekday *names* come from `Intl`.\n *  - `dateStyle` / `timeStyle` — straight `Intl.DateTimeFormat`.\n *  - `relative` — `Intl.RelativeTimeFormat` under a threshold, falling back to\n *    the absolute formatter beyond it.\n *\n * Every `Intl` instance below is constructed at compile time (§8.5, §8.11).\n */\n\n\n\n/** Ordered longest-first so `MMMM` is matched before `MMM` before `MM`. */\nconst TOKENS = [\n  'yyyy', 'yy', 'MMMM', 'MMM', 'MM', 'M', 'dd', 'd',\n  'EEEE', 'EEE', 'HH', 'H', 'hh', 'h', 'mm', 'm', 'ss', 's', 'SSS', 'a',\n];\n\n/**\n * Split a pattern into literal and token segments. Text inside single quotes\n * is a literal, and `''` is an escaped quote.\n * @param {string} pattern the date pattern\n * @returns {{ token: string|null, text: string }[]} the scanned segments\n */\n function scanPattern(pattern) {\n  const out = [];\n  let i = 0;\n  let literal = '';\n  /**\n   * Flush any pending literal text into the segment list.\n   * @returns {void}\n   */\n  const flush = () => { if (literal) { out.push({ token: null, text: literal }); literal = ''; } };\n\n  while (i < pattern.length) {\n    const ch = pattern[i];\n    if (ch === \"'\") {\n      if (pattern[i + 1] === \"'\") { literal += \"'\"; i += 2; continue; }\n      const end = pattern.indexOf(\"'\", i + 1);\n      if (end === -1) { literal += pattern.slice(i + 1); i = pattern.length; continue; }\n      literal += pattern.slice(i + 1, end);\n      i = end + 1;\n      continue;\n    }\n    const token = TOKENS.find((t) => pattern.startsWith(t, i));\n    if (token) { flush(); out.push({ token, text: token }); i += token.length; continue; }\n    // An unmatched letter is almost always a token this compiler does not\n    // implement — `zzz` for the zone, `QQ` for the quarter — and emitting it\n    // as literal text put the letters themselves in the cell. Punctuation and\n    // spaces are legitimately literal and say nothing.\n    if (/[A-Za-z]/.test(ch)) {\n      warnOnce(\n        `date.pattern.token:${ch}`,\n        `the date pattern \"${pattern}\" contains '${ch}', which is not a supported token, `\n        + 'so it is rendered as text. Quote it as a literal to silence this. '\n        + `Supported: ${TOKENS.join(' ')}.`,\n      );\n    }\n    literal += ch;\n    i += 1;\n  }\n  flush();\n  return out;\n}\n\n/**\n * A date or date-time string with no zone designator: `2020-08-20`,\n * `2020-08-20T22:03`, `2020-08-20 22:03:45`. Anything carrying a `Z` or an\n * offset is a real instant and is left to `Date` to parse.\n */\nconst WALL_CLOCK = /^(\\d{4})-(\\d{2})-(\\d{2})(?:[T ](\\d{2}):(\\d{2})(?::(\\d{2}))?(?:\\.\\d+)?)?$/;\n/**\n * Coerce whatever the row holds into a `Date` (§8.2: date columns accept\n * `Date`, epoch millis and ISO strings on ingest).\n * @param {unknown} value the resolved cell value\n * @returns {Date|null} a valid Date, or null when the value is not a date\n */\n function toDate(value) {\n  if (isNil(value) || value === '') return null;\n  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;\n  if (typeof value === 'number') return Number.isNaN(value) ? null : new Date(value);\n  if (typeof value === 'string') {\n    // A bare ISO string carries no zone, so it is a *wall* date — the day and\n    // clock somebody wrote down, not an instant. `new Date('2020-08-20')` reads\n    // it as UTC midnight, which renders as the 19th anywhere west of Greenwich:\n    // the stored string said the 20th and the grid showed the 19th. Building it\n    // from local components keeps the fields the string actually contains.\n    const wall = WALL_CLOCK.exec(value.trim());\n    if (wall) {\n      const [, y, mo, d, h = '0', mi = '0', sec = '0'] = wall;\n      return new Date(+y, +mo - 1, +d, +h, +mi, +sec);\n    }\n    const d = new Date(value);\n    return Number.isNaN(d.getTime()) ? null : d;\n  }\n  return null;\n}\n\n/** Zero-pad a number to a width. @param {number} n value @param {number} w width @returns {string} padded */\nfunction pad(n, w) { return String(n).padStart(w, '0'); }\n\n/**\n * Build a field reader for a date. With no `timeZone` this reads the local\n * fields directly, which is both faster and immune to ICU differences; with a\n * `timeZone` it goes through one compile-time `Intl.DateTimeFormat`.\n * @param {string|undefined} timeZone IANA zone name, or undefined for local\n * @returns {(d: Date) => {year:number,month:number,day:number,hour:number,minute:number,second:number,ms:number,weekday:number}}\n */\nfunction fieldReader(timeZone) {\n  if (!timeZone) {\n    /**\n     * Local-time field reader.\n     * @param {Date} d the date\n     * @returns {object} the date's fields\n     */\n    return (d) => ({\n      year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(),\n      hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds(),\n      ms: d.getMilliseconds(), weekday: d.getDay(),\n    });\n  }\n  // 'en-US' with explicit numeric fields gives a parts list we can read by type.\n  const zoned = new Intl.DateTimeFormat('en-US', {\n    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',\n    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, weekday: 'short',\n  });\n  const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };\n  /**\n   * Zoned field reader, driven by the compile-time formatter above.\n   * @param {Date} d the date\n   * @returns {object} the date's fields in the target zone\n   */\n  return (d) => {\n    const f = { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0, ms: d.getMilliseconds(), weekday: 0 };\n    for (const part of zoned.formatToParts(d)) {\n      switch (part.type) {\n        case 'year': f.year = Number(part.value); break;\n        case 'month': f.month = Number(part.value); break;\n        case 'day': f.day = Number(part.value); break;\n        // Some ICU builds render midnight as hour 24 under hour12:false.\n        case 'hour': f.hour = Number(part.value) % 24; break;\n        case 'minute': f.minute = Number(part.value); break;\n        case 'second': f.second = Number(part.value); break;\n        case 'weekday': f.weekday = days[part.value] ?? 0; break;\n        default: break;\n      }\n    }\n    return f;\n  };\n}\n\n/**\n * Compile a token pattern into a formatting closure. Month and weekday name\n * formatters are created here, once, only when the pattern needs them.\n * @param {string} pattern the token pattern\n * @param {string|undefined} locale the locale for month and weekday names\n * @param {string|undefined} timeZone optional IANA time zone\n * @returns {(d: Date) => string} a pattern formatter\n */\n function compilePattern(pattern, locale, timeZone) {\n  const segments = scanPattern(pattern);\n  const read = fieldReader(timeZone);\n  const used = new Set(segments.filter((s) => s.token).map((s) => s.token));\n\n  const monthShort = used.has('MMM') ? new Intl.DateTimeFormat(locale, { month: 'short', timeZone }) : null;\n  const monthLong = used.has('MMMM') ? new Intl.DateTimeFormat(locale, { month: 'long', timeZone }) : null;\n  const dayShort = used.has('EEE') ? new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone }) : null;\n  const dayLong = used.has('EEEE') ? new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone }) : null;\n\n  /**\n   * Assemble the pattern for one date.\n   * @param {Date} d the date\n   * @returns {string} the formatted text\n   */\n  return (d) => {\n    const f = read(d);\n    let out = '';\n    for (const seg of segments) {\n      if (!seg.token) { out += seg.text; continue; }\n      switch (seg.token) {\n        case 'yyyy': out += pad(f.year, 4); break;\n        case 'yy': out += pad(f.year % 100, 2); break;\n        case 'MMMM': out += monthLong.format(d); break;\n        case 'MMM': out += monthShort.format(d); break;\n        case 'MM': out += pad(f.month, 2); break;\n        case 'M': out += String(f.month); break;\n        case 'dd': out += pad(f.day, 2); break;\n        case 'd': out += String(f.day); break;\n        case 'EEEE': out += dayLong.format(d); break;\n        case 'EEE': out += dayShort.format(d); break;\n        case 'HH': out += pad(f.hour, 2); break;\n        case 'H': out += String(f.hour); break;\n        case 'hh': out += pad(f.hour % 12 === 0 ? 12 : f.hour % 12, 2); break;\n        case 'h': out += String(f.hour % 12 === 0 ? 12 : f.hour % 12); break;\n        case 'mm': out += pad(f.minute, 2); break;\n        case 'm': out += String(f.minute); break;\n        case 'ss': out += pad(f.second, 2); break;\n        case 's': out += String(f.second); break;\n        case 'SSS': out += pad(f.ms, 3); break;\n        case 'a': out += f.hour < 12 ? 'AM' : 'PM'; break;\n        default: out += seg.text; break;\n      }\n    }\n    return out;\n  };\n}\n\n/** Relative-time units in descending size, with their length in milliseconds. */\nconst UNITS = [\n  ['year', 365 * 24 * 3600e3],\n  ['month', 30 * 24 * 3600e3],\n  ['week', 7 * 24 * 3600e3],\n  ['day', 24 * 3600e3],\n  ['hour', 3600e3],\n  ['minute', 60e3],\n  ['second', 1e3],\n];\n\n/**\n * Compile a `DateFormat` spec into a display function (§8.5).\n *\n * @param {object} spec the DateFormat spec\n * @param {string|undefined} locale grid locale; `spec.locale` overrides it\n * @returns {(value: unknown, params?: object) => string} the compiled formatter\n */\n function compileDate(spec, locale) {\n  const s = spec || {};\n  const loc = s.locale || locale || undefined;\n  const nullDisplay = s.nullDisplay ?? '';\n  const timeZone = s.timeZone;\n\n  /** Absolute formatter: pattern first, then styles, then a sensible default. */\n  let absolute;\n  if (s.pattern) {\n    absolute = compilePattern(s.pattern, loc, timeZone);\n  } else if (s.dateStyle || s.timeStyle) {\n    const opts = { timeZone };\n    if (s.dateStyle) opts.dateStyle = s.dateStyle;\n    if (s.timeStyle) opts.timeStyle = s.timeStyle;\n    const dtf = new Intl.DateTimeFormat(loc, opts);\n    /** @param {Date} d the date @returns {string} the styled text */\n    absolute = (d) => dtf.format(d);\n  } else {\n    const dtf = new Intl.DateTimeFormat(loc, { dateStyle: 'medium', timeZone });\n    /** @param {Date} d the date @returns {string} the default medium-style text */\n    absolute = (d) => dtf.format(d);\n  }\n\n  // Relative formatting: one instance, created here (§8.11).\n  const relative = s.relative ? new Intl.RelativeTimeFormat(loc, { numeric: 'auto' }) : null;\n  const thresholdDays = typeof s.relative === 'object' && s.relative\n    ? (s.relative.threshold ?? 7)\n    : 7;\n  const thresholdMs = thresholdDays * 24 * 3600e3;\n\n  /**\n   * The compiled formatter.\n   * @param {unknown} value the resolved cell value\n   * @param {object} [params] optional bag; `params.now` overrides the clock so\n   *   relative output is testable without faking global time\n   * @returns {string} display text\n   */\n  const format = (value, params) => {\n    const d = toDate(value);\n    if (!d) return nullDisplay;\n    if (relative) {\n      const now = params && typeof params.now === 'number' ? params.now : Date.now();\n      const delta = d.getTime() - now;\n      if (Math.abs(delta) < thresholdMs) {\n        for (const [unit, ms] of UNITS) {\n          if (Math.abs(delta) >= ms || unit === 'second') {\n            return relative.format(Math.round(delta / ms), unit);\n          }\n        }\n      }\n    }\n    return absolute(d);\n  };\n\n  format.spec = s;\n  return format;\n}\n\n/**\n * The calendar date of a value, as `YYYY-MM-DD`.\n *\n * This is the storage form of the `date` type. A string has no time zone to\n * reinterpret, so the day a user in London types is the day a user in Mumbai\n * reads — which a stored instant cannot promise, because 22:03 in London is\n * already tomorrow in Mumbai and formatting has to pick one.\n *\n * A `Date` or an epoch number is read in **local** wall-clock fields, because\n * `new Date(2020, 7, 20)` means \"the twentieth\" to whoever wrote it, and\n * reading it as UTC would move it to the nineteenth west of Greenwich. Ingest\n * is therefore machine-dependent for those two input forms and completely\n * deterministic for strings — which is the argument for sending strings.\n *\n * @param {unknown} value a Date, an epoch, or a date-ish string\n * @returns {string|null} the ISO date, or null when there is no date\n */\n function toIsoDate(value) {\n  if (isNil(value) || value === '') return null;\n  if (typeof value === 'string') {\n    const match = /^(\\d{4}-\\d{2}-\\d{2})/.exec(value.trim());\n    if (match) return match[1];\n    const parsed = toDate(value);\n    return parsed ? toIsoDate(parsed) : null;\n  }\n  const date = toDate(value);\n  if (!date) return null;\n  /**\n   * Zero-pad a field to two digits.\n   * @param {number} n the field\n   * @returns {string} the padded text\n   */\n  const pad = (n) => String(n).padStart(2, '0');\n  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;\n}\n\n/**\n * The calendar date and wall-clock time of a value, as `YYYY-MM-DDTHH:mm`.\n *\n * Seconds are appended only when they are non-zero, so a value entered to the\n * minute round-trips as the minute it was entered rather than gaining a `:00`\n * nobody typed.\n *\n * @param {unknown} value a Date, an epoch, or a date-time string\n * @returns {string|null} the ISO date-time, or null\n */\n function toIsoDateTime(value, timeZone) {\n  if (isNil(value) || value === '') return null;\n  if (typeof value === 'string') {\n    const text = value.trim();\n    // A trailing `Z` or offset makes this an absolute instant, and the digits\n    // in front of it are *that zone's* wall clock, not the reader's. Matching\n    // them literally silently relabelled the moment: 12:00Z became 12:00\n    // local, so a row an hour old read as two hours old under BST, and every\n    // comparison against `now` was out by the offset. Converted instead.\n    if (ZONE_SUFFIX.test(text)) {\n      const instant = toDate(text);\n      return instant ? wallClockIn(instant, timeZone) : null;\n    }\n    // Match hours, minutes and seconds separately: stripping a trailing ':00'\n    // from the whole clock would turn 12:00 into 12, eating the minutes.\n    const match = /^(\\d{4}-\\d{2}-\\d{2})[T ](\\d{2}):(\\d{2})(?::(\\d{2}))?/.exec(text);\n    if (match) {\n      const [, day, hour, minute, second] = match;\n      return `${day}T${hour}:${minute}${second && second !== '00' ? `:${second}` : ''}`;\n    }\n    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(text)) return `${text}T00:00`;\n    const parsed = toDate(text);\n    return parsed ? toIsoDateTime(parsed) : null;\n  }\n  const date = toDate(value);\n  if (!date) return null;\n  return wallClockIn(date, timeZone);\n}\n\n/** A trailing `Z` or numeric offset: the mark of an absolute instant. */\nconst ZONE_SUFFIX = /(?:Z|[+-]\\d{2}:?\\d{2})$/i;\n\n/**\n * The wall clock an instant reads as, in a named zone or the viewer's own.\n *\n * @param {Date} date the instant\n * @param {string} [timeZone] an IANA zone; the viewer's zone when omitted\n * @returns {string} `YYYY-MM-DDTHH:mm`, with seconds only when non-zero\n */\nfunction wallClockIn(date, timeZone) {\n  /**\n   * Zero-pad a field to two digits.\n   * @param {number} n the field\n   * @returns {string} the padded text\n   */\n  const pad = (n) => String(n).padStart(2, '0');\n\n  if (timeZone) {\n    try {\n      const parts = new Intl.DateTimeFormat('en-CA', {\n        timeZone,\n        year: 'numeric', month: '2-digit', day: '2-digit',\n        hour: '2-digit', minute: '2-digit', second: '2-digit',\n        hour12: false,\n      }).formatToParts(date).reduce((out, part) => {\n        if (part.type !== 'literal') out[part.type] = part.value;\n        return out;\n      }, {});\n      const hour = parts.hour === '24' ? '00' : parts.hour;\n      const seconds = Number(parts.second);\n      return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`\n        + (seconds ? `:${parts.second}` : '');\n    } catch {\n      // An unknown zone is the caller's mistake, not a reason to lose the\n      // value; the viewer's own zone is the honest fallback.\n    }\n  }\n\n  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;\n  const seconds = date.getSeconds();\n  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}${seconds ? `:${pad(seconds)}` : ''}`;\n  return `${day}T${clock}`;\n}\n\n/**\n * Compare two ISO date or date-time strings.\n *\n * Lexicographic order *is* chronological order for ISO 8601, which is the\n * property the format was designed for and the reason this needs no parsing —\n * it also lets a dictionary-encoded column sort on codes (§5.4).\n *\n * @param {unknown} a left value\n * @param {unknown} b right value\n * @returns {number} negative, zero or positive; nulls sort last\n */\n function compareIso(a, b) {\n  const left = isNil(a) || a === '' ? null : String(a);\n  const right = isNil(b) || b === '' ? null : String(b);\n  if (left === null) return right === null ? 0 : 1;\n  if (right === null) return -1;\n  return left < right ? -1 : left > right ? 1 : 0;\n}\n\n});\n\n__def(\"packages/core/src/compute/filter.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"releaseMask\", { enumerable: true, get: function () { return releaseMask; } });\n  Object.defineProperty(__exports, \"compilePredicate\", { enumerable: true, get: function () { return compilePredicate; } });\n  Object.defineProperty(__exports, \"testValue\", { enumerable: true, get: function () { return testValue; } });\n  Object.defineProperty(__exports, \"evaluateCondition\", { enumerable: true, get: function () { return evaluateCondition; } });\n  Object.defineProperty(__exports, \"evaluateFilters\", { enumerable: true, get: function () { return evaluateFilters; } });\n  Object.defineProperty(__exports, \"pruneColumn\", { enumerable: true, get: function () { return pruneColumn; } });\n  Object.defineProperty(__exports, \"mentionsColumn\", { enumerable: true, get: function () { return mentionsColumn; } });\n  Object.defineProperty(__exports, \"compact\", { enumerable: true, get: function () { return compact; } });\n  const __m0 = __req(\"packages/core/src/internal/util.js\");\n  const isBlank = __m0[\"isBlank\"];\n  const toArray = __m0[\"toArray\"];\n  const warnOnce = __m0[\"warnOnce\"];\n  const __m1 = __req(\"packages/core/src/format/date.js\");\n  const toIsoDate = __m1[\"toIsoDate\"];\n  const __m2 = __req(\"packages/core/src/compute/handle.js\");\n  const bitReader = __m2[\"bitReader\"];\n  const dictSize = __m2[\"dictSize\"];\n  const dictValue = __m2[\"dictValue\"];\n  const presenceReader = __m2[\"presenceReader\"];\n  const valueComparator = __m2[\"valueComparator\"];\n  const valueReader = __m2[\"valueReader\"];\n/**\n * Filter kernels (§5.7, §9.2, §9.3).\n *\n * Two linear passes with predictable branching: every condition in the tree\n * evaluates into a `Uint8Array` mask, groups combine child masks with bitwise\n * `&`, `|` or negation, and the surviving rows are compacted into a\n * `Uint32Array` index list. No per-row closure call is made for a built-in\n * operator on a typed column.\n *\n * Two rules shape the design:\n *\n * - **Dictionary columns evaluate over the dictionary, not the rows.** Any\n *   operator becomes a lookup table of one byte per code, so the inner loop is\n *   a single array index (§5.4).\n * - **Nulls are answered once, not per row.** The value loop runs over the raw\n *   buffer, then absent rows are overwritten with the operator's constant\n *   answer for `null`. `blank` and `notBlank` on a nullable column never touch\n *   a value at all (§5.3).\n *\n * Negated operators are exact negations of their positive counterparts —\n * `ne = !eq`, `notIn = !in`, `notBetween = !between`, `notContains =\n * !contains`, `containsNone = !containsAny`, `notBlank = !blank`. That makes\n * their behaviour on nulls derivable rather than a table of special cases.\n */\n\n\n\n\n/** A value already in `YYYY-MM-DD` form needs no conversion. */\nconst ISO_DAY = /^\\d{4}-\\d{2}-\\d{2}$/;\n\n\n/** Sentinel standing in for null and undefined inside set lookups. */\nconst NULL_KEY = '\\u0000null\\u0000';\n\n/* ------------------------------------------------------------------ */\n/* Mask pool                                                          */\n/* ------------------------------------------------------------------ */\n\n/**\n * Take a mask of at least `n` bytes from the injected pool (§5.7 \"masks are\n * pooled\"). The returned buffer may be longer than `n` and its contents are\n * undefined; only `[0, n)` is ever read or written. Falls back to a fresh\n * allocation when no pool is injected, which is the path unit tests and\n * one-shot callers take.\n *\n * @param {{pool?: object}} ctx the evaluation context\n * @param {number} n number of rows the mask must cover\n * @returns {Uint8Array} a mask buffer\n */\nfunction acquireMask(ctx, n) {\n  const pool = ctx && ctx.pool;\n  if (pool) {\n    const take = pool.mask || pool.acquireMask || pool.acquire || pool.take;\n    if (typeof take === 'function') {\n      const mask = take.call(pool, n);\n      if (mask && mask.length >= n) return mask;\n    }\n  }\n  return new Uint8Array(n);\n}\n\n/**\n * Return a mask to the pool. Callers that own the result of\n * {@link evaluateFilters} should call this once the surviving indices have been\n * compacted out of it.\n *\n * @param {{pool?: object}} ctx the evaluation context\n * @param {Uint8Array|null} mask the mask to release\n * @returns {void}\n */\n function releaseMask(ctx, mask) {\n  const pool = ctx && ctx.pool;\n  if (!pool || !mask) return;\n  const give = pool.release || pool.releaseMask || pool.free || pool.recycle;\n  if (typeof give === 'function') give.call(pool, mask);\n}\n\n/**\n * Fill the used region of a mask with a constant.\n * @param {Uint8Array} mask the mask\n * @param {number} n rows covered\n * @param {number} value 0 or 1\n * @returns {Uint8Array} the mask\n */\nfunction fillMask(mask, n, value) {\n  mask.fill(value, 0, n);\n  return mask;\n}\n\n/* ------------------------------------------------------------------ */\n/* Value coercion                                                     */\n/* ------------------------------------------------------------------ */\n\n/**\n * Is this value missing, for the purposes of an ordering comparison? `NaN` is\n * unorderable rather than absent, so ordering operators reject it, matching the\n * IEEE result of the typed fast path.\n *\n * @param {unknown} v the value\n * @returns {boolean} true when no ordering answer exists\n */\nfunction unorderable(v) {\n  return v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));\n}\n\n/**\n * Convert a wire value to the shape the column stores, using the condition's\n * optional `type` hint (§9.3). Dates arrive as ISO instants (§9.3.2) and the\n * store holds epoch milliseconds, so a date hint parses; a number hint numbers.\n *\n * @param {unknown} value the raw condition value\n * @param {string|undefined} type the declared data type hint\n * @returns {unknown} the coerced value\n */\nfunction coerceTarget(value, type) {\n  if (value === null || value === undefined) return value;\n  if (type === 'number') return typeof value === 'number' ? value : Number(value);\n  if (type === 'date' || type === 'dateString') {\n    // To the same representation the column stores, not to epoch milliseconds.\n    // A date column holds the wall-clock day as `YYYY-MM-DD`; coercing the\n    // condition to a number left the two sides incomparable, so every date\n    // condition carrying an instant matched nothing at all. ISO dates order\n    // chronologically under a plain string comparison, which is what the\n    // predicates below already do.\n    const iso = toIsoDate(value);\n    return iso === null ? toMillis(value) : iso;\n  }\n  if (type === 'boolean') {\n    if (typeof value === 'boolean') return value;\n    if (value === 'true' || value === 1) return true;\n    if (value === 'false' || value === 0) return false;\n    return !!value;\n  }\n  return value;\n}\n\n/**\n * Epoch milliseconds for a date-ish value.\n * @param {unknown} value a Date, epoch number or parseable string\n * @returns {number} milliseconds since the epoch, `NaN` when unparseable\n */\nfunction toMillis(value) {\n  if (value instanceof Date) return value.getTime();\n  if (typeof value === 'number') return value;\n  return Date.parse(String(value));\n}\n\n/**\n * Numeric form of a condition target for the typed fast paths.\n * @param {unknown} value the coerced condition value\n * @returns {number} the numeric target, `NaN` when there is none\n */\nfunction toNumber(value) {\n  if (typeof value === 'number') return value;\n  if (value instanceof Date) return value.getTime();\n  if (value === null || value === undefined || value === '') return NaN;\n  return Number(value);\n}\n\n/**\n * Text form of a value for text operators, case-folded unless the condition\n * asks for case sensitivity (§9.3 \"text operators are case-insensitive unless\n * `caseSensitive`\").\n *\n * @param {unknown} v the value\n * @param {boolean} caseSensitive keep case\n * @returns {string} the comparable text\n */\nfunction textOf(v, caseSensitive) {\n  const s = typeof v === 'string' ? v : String(v);\n  return caseSensitive ? s : s.toLowerCase();\n}\n\n/**\n * The key a value takes inside a set lookup, folding case and collapsing\n * null and undefined onto one sentinel.\n *\n * @param {unknown} v the value\n * @param {boolean} caseSensitive keep case\n * @returns {unknown} the lookup key\n */\nfunction setKey(v, caseSensitive) {\n  if (v === null || v === undefined) return NULL_KEY;\n  if (typeof v === 'string') return caseSensitive ? v : v.toLowerCase();\n  if (v instanceof Date) return v.getTime();\n  return v;\n}\n\n/**\n * Build the lookup for a set operator. Numeric and textual spellings of the\n * same entry are both inserted, so `in: ['5']` still matches the number 5 in a\n * `Float64Array` column whose condition carried no `type` hint.\n *\n * @param {unknown} value the condition value, normally an array\n * @param {boolean} caseSensitive keep case\n * @param {string|undefined} type the data type hint\n * @returns {Set<unknown>} the membership set\n */\nfunction buildSet(value, caseSensitive, type) {\n  const set = new Set();\n  for (const raw of toArray(value)) {\n    const entry = coerceTarget(raw, type);\n    set.add(setKey(entry, caseSensitive));\n    if (typeof entry === 'string' && entry !== '' && Number.isFinite(Number(entry))) set.add(Number(entry));\n    else if (typeof entry === 'number' && Number.isFinite(entry)) set.add(setKey(String(entry), caseSensitive));\n  }\n  return set;\n}\n\n/**\n * Loose equality used by `eq`/`ne`: case-folded for text, `NaN`-aware for\n * numbers, time-based for dates, and cross-coercing between a number and its\n * decimal string so an untyped condition from a text input still matches.\n *\n * @param {unknown} a the row value\n * @param {unknown} b the condition value\n * @param {boolean} caseSensitive keep case\n * @returns {boolean} true when the values are considered equal\n */\nfunction valueEquals(a, b, caseSensitive) {\n  if (a === null || a === undefined || b === null || b === undefined) {\n    return (a === null || a === undefined) && (b === null || b === undefined);\n  }\n  const ta = typeof a;\n  const tb = typeof b;\n  if (ta === 'string' && tb === 'string') return caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase();\n  if (a instanceof Date || b instanceof Date) return toMillis(a) === toMillis(b);\n  if (ta === 'number' && tb === 'number') return a === b || (Number.isNaN(a) && Number.isNaN(b));\n  if (ta === 'number' && tb === 'string') return a === Number(b);\n  if (ta === 'string' && tb === 'number') return Number(a) === b;\n  if (ta === 'boolean' || tb === 'boolean') return a === b;\n  if (Array.isArray(a) && Array.isArray(b)) {\n    return a.length === b.length && a.every((x, i) => valueEquals(x, b[i], caseSensitive));\n  }\n  return a === b;\n}\n\n/**\n * Compile the pattern of a `matches` condition. `g` and `y` are stripped\n * because a sticky or global regular expression carries `lastIndex` state\n * across rows and would silently skip matches.\n *\n * @param {unknown} value a RegExp or pattern string\n * @param {boolean} caseSensitive keep case\n * @returns {RegExp|null} the compiled expression, or null when it does not compile\n */\nfunction compileRegExp(value, caseSensitive) {\n  try {\n    if (value instanceof RegExp) {\n      const flags = value.flags.replace(/[gy]/g, '');\n      return new RegExp(value.source, caseSensitive ? flags : flags.includes('i') ? flags : `${flags}i`);\n    }\n    return new RegExp(String(value), caseSensitive ? '' : 'i');\n  } catch (err) {\n    warnOnce(`regex:${String(value)}`, `filter operator \"matches\" received an invalid pattern: ${String(value)}`, err);\n    return null;\n  }\n}\n\n/* ------------------------------------------------------------------ */\n/* Predicate compilation                                              */\n/* ------------------------------------------------------------------ */\n\n/**\n * Compile a condition into a predicate over a single logical value. Everything\n * expensive — collator, regular expression, membership set, case folding of the\n * needle — happens once, here, and never inside the returned closure (§8.11).\n *\n * @param {object} condition a §9.3 `Condition`\n * @param {string} [locale] BCP-47 locale for ordering comparisons on text\n * @returns {(value: unknown) => boolean} the predicate\n */\n function compilePredicate(condition, locale) {\n  const predicate = compileValuePredicate(condition, locale);\n  const type = condition && condition.type;\n  // A date column stores its wall-clock day as `YYYY-MM-DD`, but a host may\n  // hold a `Date` or an epoch number just as legitimately, and a condition may\n  // carry a full instant. Both sides are brought to the ISO day before\n  // anything is compared, so every combination lines up — ISO dates order\n  // chronologically as plain strings. Wrapped here rather than inside each\n  // branch, so it costs one call per row and nothing is recompiled.\n  if (type !== 'date' && type !== 'dateString') return predicate;\n  return (v) => predicate(typeof v === 'string' && ISO_DAY.test(v) ? v : (toIsoDate(v) ?? v));\n}\n\n/**\n * Compile a condition into a predicate, before any type normalisation.\n * @param {object} condition a §9.3 `Condition`\n * @param {string} [locale] BCP-47 locale for ordering comparisons on text\n * @returns {(value: unknown) => boolean} the predicate\n */\nfunction compileValuePredicate(condition, locale) {\n  const op = condition && condition.op;\n  const caseSensitive = !!(condition && condition.caseSensitive);\n  const type = condition && condition.type;\n  const cmp = valueComparator(locale);\n\n  /**\n   * Negate a predicate.\n   * @param {(v: unknown) => boolean} p the predicate to invert\n   * @returns {(v: unknown) => boolean} the inverted predicate\n   */\n  const not = (p) => (v) => !p(v);\n\n  switch (op) {\n    case 'eq': {\n      const target = coerceTarget(condition.value, type);\n      return (v) => valueEquals(v, target, caseSensitive);\n    }\n    case 'ne': {\n      const target = coerceTarget(condition.value, type);\n      return (v) => !valueEquals(v, target, caseSensitive);\n    }\n    case 'lt': case 'lte': case 'gt': case 'gte': {\n      const target = coerceTarget(condition.value, type);\n      if (unorderable(target)) return () => false;\n      const want = op === 'lt' ? -1 : op === 'lte' ? 0 : op === 'gt' ? 1 : 2;\n      return (v) => {\n        if (unorderable(v)) return false;\n        const c = cmp(v, target);\n        return want === -1 ? c < 0 : want === 0 ? c <= 0 : want === 1 ? c > 0 : c >= 0;\n      };\n    }\n    case 'between': case 'notBetween': {\n      const pair = toArray(condition.value);\n      const lo = coerceTarget(pair[0], type);\n      const hi = coerceTarget(pair[1], type);\n      const bounds = condition.bounds || '[]';\n      const loInclusive = bounds.charAt(0) !== '(';\n      const hiInclusive = bounds.charAt(1) !== ')';\n      if (unorderable(lo) || unorderable(hi)) return op === 'between' ? () => false : () => true;\n      /**\n       * Is the value inside the range, under the condition's `bounds`?\n       * @param {unknown} v the row value\n       * @returns {boolean} true when it falls inside\n       */\n      const inRange = (v) => {\n        if (unorderable(v)) return false;\n        const a = cmp(v, lo);\n        const b = cmp(v, hi);\n        return (loInclusive ? a >= 0 : a > 0) && (hiInclusive ? b <= 0 : b < 0);\n      };\n      return op === 'between' ? inRange : not(inRange);\n    }\n    case 'in': case 'notIn': {\n      const set = buildSet(condition.value, caseSensitive, type);\n      /**\n       * Is the value one of the set entries?\n       * @param {unknown} v the row value\n       * @returns {boolean} true when the value is a member\n       */\n      const member = (v) => set.has(setKey(v, caseSensitive));\n      return op === 'in' ? member : not(member);\n    }\n    case 'contains': case 'notContains': {\n      const needle = textOf(coerceTarget(condition.value, type), caseSensitive);\n      /**\n       * Does the value's text contain the needle?\n       * @param {unknown} v the row value\n       * @returns {boolean} true when the needle is present\n       */\n      const has = (v) => (v === null || v === undefined ? false : textOf(v, caseSensitive).includes(needle));\n      return op === 'contains' ? has : not(has);\n    }\n    case 'startsWith': {\n      const needle = textOf(coerceTarget(condition.value, type), caseSensitive);\n      return (v) => (v === null || v === undefined ? false : textOf(v, caseSensitive).startsWith(needle));\n    }\n    case 'endsWith': {\n      const needle = textOf(coerceTarget(condition.value, type), caseSensitive);\n      return (v) => (v === null || v === undefined ? false : textOf(v, caseSensitive).endsWith(needle));\n    }\n    case 'matches': {\n      const re = compileRegExp(condition.value, caseSensitive);\n      if (!re) return () => false;\n      return (v) => (v === null || v === undefined ? false : re.test(String(v)));\n    }\n    case 'blank':\n      return (v) => isBlank(v) || (Array.isArray(v) && v.length === 0);\n    case 'notBlank':\n      return (v) => !(isBlank(v) || (Array.isArray(v) && v.length === 0));\n    case 'containsAny': case 'containsNone': {\n      const set = buildSet(condition.value, caseSensitive, type);\n      /**\n       * Does the multi-value cell hold any of the wanted entries?\n       * @param {unknown} v the row value, normally an array (§8.3)\n       * @returns {boolean} true when at least one entry matches\n       */\n      const any = (v) => {\n        const list = v === null || v === undefined ? [] : toArray(v);\n        for (let i = 0; i < list.length; i++) if (set.has(setKey(list[i], caseSensitive))) return true;\n        return false;\n      };\n      return op === 'containsAny' ? any : not(any);\n    }\n    case 'containsAll': {\n      const wanted = toArray(condition.value).map((x) => setKey(coerceTarget(x, type), caseSensitive));\n      return (v) => {\n        const list = v === null || v === undefined ? [] : toArray(v);\n        if (wanted.length === 0) return true;\n        const have = new Set(list.map((x) => setKey(x, caseSensitive)));\n        for (let i = 0; i < wanted.length; i++) if (!have.has(wanted[i])) return false;\n        return true;\n      };\n    }\n    default:\n      warnOnce(`op:${String(op)}`, `unknown filter operator \"${String(op)}\"; the condition passes every row`);\n      return () => true;\n  }\n}\n\n/**\n * Does a single logical value satisfy a condition? The reference path, used for\n * non-columnar sources and for fuzz-testing the kernels against\n * `reference.js`.\n *\n * @param {unknown} value the logical value\n * @param {object} condition a §9.3 `Condition`\n * @param {string} [locale] BCP-47 locale for ordering comparisons on text\n * @returns {boolean} true when the value passes\n */\n function testValue(value, condition, locale) {\n  return compilePredicate(condition, locale)(value);\n}\n\n/* ------------------------------------------------------------------ */\n/* Columnar condition evaluation                                      */\n/* ------------------------------------------------------------------ */\n\n/**\n * `blank` / `notBlank` over a nullable column: a pure presence scan that never\n * reads a value (§5.3). Non-nullable columns fall back to a value scan, because\n * an empty string is blank while a stored number never is.\n *\n * @param {object} handle the column handle\n * @param {boolean} wantPresent true for `notBlank`\n * @param {Uint8Array} mask the mask to fill\n * @param {number} count row count\n * @returns {Uint8Array} the mask\n */\nfunction presenceCondition(handle, wantPresent, mask, count) {\n  const present = presenceReader(handle);\n  if (present) {\n    const target = wantPresent ? 1 : 0;\n    for (let i = 0; i < count; i++) mask[i] = present(i) === target ? 1 : 0;\n    return mask;\n  }\n  const kind = handle.kind;\n  if (kind === 'float64' || kind === 'int32' || kind === 'bitset') {\n    // A non-nullable numeric or boolean column has no blank rows at all.\n    return fillMask(mask, count, wantPresent ? 1 : 0);\n  }\n  const read = valueReader(handle);\n  for (let i = 0; i < count; i++) {\n    const v = read(i);\n    const blank = isBlank(v) || (Array.isArray(v) && v.length === 0);\n    mask[i] = blank === wantPresent ? 0 : 1;\n  }\n  return mask;\n}\n\n/**\n * Evaluate a condition over a dictionary column by testing the *dictionary*,\n * once per distinct value, into an allowed-code lookup. The row loop is then a\n * single array index, which is the whole point of dictionary encoding (§5.4,\n * §5.7).\n *\n * @param {object} handle a `kind === 'dictionary'` column handle\n * @param {(v: unknown) => boolean} pred the compiled predicate\n * @param {Uint8Array} mask the mask to fill\n * @param {number} count row count\n * @returns {Uint8Array} the mask\n */\nfunction dictionaryCondition(handle, pred, mask, count) {\n  const dict = handle.dict;\n  const size = dictSize(dict);\n  const allowed = new Uint8Array(size);\n  for (let code = 0; code < size; code++) allowed[code] = pred(dictValue(dict, code)) ? 1 : 0;\n\n  const codes = handle.values;\n  const present = presenceReader(handle);\n  if (!present) {\n    for (let i = 0; i < count; i++) mask[i] = allowed[codes[i]];\n    return mask;\n  }\n  const absentAnswer = pred(null) ? 1 : 0;\n  for (let i = 0; i < count; i++) mask[i] = present(i) === 1 ? allowed[codes[i]] : absentAnswer;\n  return mask;\n}\n\n/**\n * Evaluate a condition over a boolean column. Only two answers exist, so both\n * are computed up front and the row loop reads one bit.\n *\n * @param {object} handle a `kind === 'bitset'` column handle\n * @param {(v: unknown) => boolean} pred the compiled predicate\n * @param {Uint8Array} mask the mask to fill\n * @param {number} count row count\n * @returns {Uint8Array} the mask\n */\nfunction booleanCondition(handle, pred, mask, count) {\n  const bit = bitReader(handle.values);\n  const whenTrue = pred(true) ? 1 : 0;\n  const whenFalse = pred(false) ? 1 : 0;\n  const present = presenceReader(handle);\n  if (!present) {\n    for (let i = 0; i < count; i++) mask[i] = bit(i) === 1 ? whenTrue : whenFalse;\n    return mask;\n  }\n  const absentAnswer = pred(null) ? 1 : 0;\n  for (let i = 0; i < count; i++) {\n    mask[i] = present(i) === 0 ? absentAnswer : (bit(i) === 1 ? whenTrue : whenFalse);\n  }\n  return mask;\n}\n\n/**\n * Evaluate an ordering, equality or set condition directly over a numeric\n * buffer. Each operator is its own loop so the comparison is a machine\n * comparison against a hoisted constant rather than a callback (§5.7).\n *\n * Absent rows are fixed up in a second pass with the operator's constant answer\n * for `null`, which keeps the value loop free of null checks (§5.3).\n *\n * @param {object} handle a `float64` or `int32` column handle\n * @param {object} condition the §9.3 condition\n * @param {(v: unknown) => boolean} pred the compiled predicate, for the null answer\n * @param {Uint8Array} mask the mask to fill\n * @param {number} count row count\n * @returns {boolean} true when the operator was handled here\n */\nfunction numericCondition(handle, condition, pred, mask, count) {\n  const values = handle.values;\n  const type = condition.type;\n  const op = condition.op;\n  let handled = true;\n\n  switch (op) {\n    case 'eq': case 'ne': {\n      const target = toNumber(coerceTarget(condition.value, type));\n      const wantNaN = typeof condition.value === 'number' && Number.isNaN(condition.value);\n      const invert = op === 'ne' ? 1 : 0;\n      if (wantNaN) {\n        for (let i = 0; i < count; i++) mask[i] = (Number.isNaN(values[i]) ? 1 : 0) ^ invert;\n      } else {\n        for (let i = 0; i < count; i++) mask[i] = ((values[i] === target) ? 1 : 0) ^ invert;\n      }\n      break;\n    }\n    case 'lt': {\n      const t = toNumber(coerceTarget(condition.value, type));\n      for (let i = 0; i < count; i++) mask[i] = values[i] < t ? 1 : 0;\n      break;\n    }\n    case 'lte': {\n      const t = toNumber(coerceTarget(condition.value, type));\n      for (let i = 0; i < count; i++) mask[i] = values[i] <= t ? 1 : 0;\n      break;\n    }\n    case 'gt': {\n      const t = toNumber(coerceTarget(condition.value, type));\n      for (let i = 0; i < count; i++) mask[i] = values[i] > t ? 1 : 0;\n      break;\n    }\n    case 'gte': {\n      const t = toNumber(coerceTarget(condition.value, type));\n      for (let i = 0; i < count; i++) mask[i] = values[i] >= t ? 1 : 0;\n      break;\n    }\n    case 'between': case 'notBetween': {\n      const pair = toArray(condition.value);\n      const lo = toNumber(coerceTarget(pair[0], type));\n      const hi = toNumber(coerceTarget(pair[1], type));\n      const bounds = condition.bounds || '[]';\n      const loInclusive = bounds.charAt(0) !== '(';\n      const hiInclusive = bounds.charAt(1) !== ')';\n      const invert = op === 'notBetween' ? 1 : 0;\n      // The four bound combinations are separate loops so the comparison\n      // operators are constant inside each one (§5.7 predictable branching).\n      if (loInclusive && hiInclusive) {\n        for (let i = 0; i < count; i++) mask[i] = (((values[i] >= lo) & (values[i] <= hi)) ? 1 : 0) ^ invert;\n      } else if (loInclusive) {\n        for (let i = 0; i < count; i++) mask[i] = (((values[i] >= lo) & (values[i] < hi)) ? 1 : 0) ^ invert;\n      } else if (hiInclusive) {\n        for (let i = 0; i < count; i++) mask[i] = (((values[i] > lo) & (values[i] <= hi)) ? 1 : 0) ^ invert;\n      } else {\n        for (let i = 0; i < count; i++) mask[i] = (((values[i] > lo) & (values[i] < hi)) ? 1 : 0) ^ invert;\n      }\n      break;\n    }\n    case 'in': case 'notIn': {\n      const set = new Set();\n      for (const raw of toArray(condition.value)) {\n        const n = toNumber(coerceTarget(raw, type));\n        if (!Number.isNaN(n)) set.add(n);\n      }\n      const invert = op === 'notIn' ? 1 : 0;\n      for (let i = 0; i < count; i++) mask[i] = (set.has(values[i]) ? 1 : 0) ^ invert;\n      break;\n    }\n    default:\n      handled = false;\n      break;\n  }\n\n  if (!handled) return false;\n  const present = presenceReader(handle);\n  if (present) {\n    const absentAnswer = pred(null) ? 1 : 0;\n    for (let i = 0; i < count; i++) if (present(i) === 0) mask[i] = absentAnswer;\n  }\n  return true;\n}\n\n/**\n * Fallback evaluation: one predicate call per row over logical values. Correct\n * for every backing, and roughly an order of magnitude slower than the typed\n * paths, which is exactly the cost the spec attributes to custom filters\n * (§5.7).\n *\n * @param {object} handle the column handle\n * @param {(v: unknown) => boolean} pred the compiled predicate\n * @param {Uint8Array} mask the mask to fill\n * @param {number} count row count\n * @returns {Uint8Array} the mask\n */\nfunction genericCondition(handle, pred, mask, count) {\n  const read = valueReader(handle);\n  for (let i = 0; i < count; i++) mask[i] = pred(read(i)) ? 1 : 0;\n  return mask;\n}\n\n/**\n * Evaluate one condition into a mask. Exported so each operator can be tested\n * on its own against {@link testValue}.\n *\n * @param {object} condition a §9.3 `Condition`\n * @param {{handle(colId: string): object|undefined, count: number, pool?: object,\n *          locale?: string, custom?(condition: object, i: number): boolean}} ctx\n *        the evaluation context\n * @param {Uint8Array} [out] mask to write into; taken from the pool when omitted\n * @returns {Uint8Array} the mask, 1 = row passes\n */\n function evaluateCondition(condition, ctx, out) {\n  const count = ctx.count | 0;\n  const mask = out || acquireMask(ctx, count);\n  if (!condition) return fillMask(mask, count, 1);\n\n  const handle = typeof ctx.handle === 'function' ? ctx.handle(condition.col) : undefined;\n  const custom = typeof ctx.custom === 'function' ? ctx.custom : null;\n\n  if (!handle) {\n    if (custom) {\n      for (let i = 0; i < count; i++) mask[i] = custom(condition, i) ? 1 : 0;\n      return mask;\n    }\n    warnOnce(`filter:col:${String(condition.col)}`,\n      `filter references unknown column \"${String(condition.col)}\"; the condition passes every row`);\n    return fillMask(mask, count, 1);\n  }\n\n  const op = condition.op;\n  if (op === 'blank' || op === 'notBlank') return presenceCondition(handle, op === 'notBlank', mask, count);\n\n  const pred = compilePredicate(condition, ctx.locale);\n\n  switch (handle.kind) {\n    case 'dictionary':\n      return dictionaryCondition(handle, pred, mask, count);\n    case 'bitset':\n      return booleanCondition(handle, pred, mask, count);\n    case 'float64': case 'int32':\n      if (numericCondition(handle, condition, pred, mask, count)) return mask;\n      return genericCondition(handle, pred, mask, count);\n    default:\n      return genericCondition(handle, pred, mask, count);\n  }\n}\n\n/* ------------------------------------------------------------------ */\n/* Tree evaluation                                                    */\n/* ------------------------------------------------------------------ */\n\n/**\n * Evaluate one node of the condition tree bottom-up into a mask (§9.3).\n * Children are combined with bitwise operators and released back to the pool as\n * soon as they have been folded in.\n *\n * @param {object|null} node a `Group`, a `Condition`, or null\n * @param {object} ctx the evaluation context\n * @param {number} count row count\n * @returns {Uint8Array} a mask owned by the caller\n */\nfunction evaluateNode(node, ctx, count) {\n  if (!node) return fillMask(acquireMask(ctx, count), count, 1);\n\n  if (Array.isArray(node.conditions)) {\n    const children = node.conditions.filter((c) => c != null);\n    const op = node.op === 'or' ? 'or' : node.op === 'not' ? 'not' : 'and';\n    if (children.length === 0) return fillMask(acquireMask(ctx, count), count, 1);\n\n    const acc = evaluateNode(children[0], ctx, count);\n    for (let k = 1; k < children.length; k++) {\n      const rhs = evaluateNode(children[k], ctx, count);\n      if (op === 'or') for (let i = 0; i < count; i++) acc[i] |= rhs[i];\n      else for (let i = 0; i < count; i++) acc[i] &= rhs[i];\n      releaseMask(ctx, rhs);\n    }\n    // `not` negates the conjunction of its children, so a single child is a\n    // plain negation and several children read as \"not (a and b)\".\n    if (op === 'not') for (let i = 0; i < count; i++) acc[i] ^= 1;\n    return acc;\n  }\n\n  return evaluateCondition(node, ctx, acquireMask(ctx, count));\n}\n\n/**\n * Evaluate a condition tree into a mask (§9.3). The root of an active filter\n * set is always an `and` group; `null` means no filter and passes every row.\n *\n * The returned mask belongs to the caller and may be longer than `ctx.count`:\n * read only `[0, ctx.count)`, and hand it back with {@link releaseMask} once\n * the survivors have been compacted out of it.\n *\n * @param {object|null} filters the §9.3 `FilterSet`\n * @param {{handle(colId: string): object|undefined, count: number, pool?: object,\n *          locale?: string, custom?(condition: object, i: number): boolean}} ctx\n *        the evaluation context\n * @returns {Uint8Array} the mask, 1 = row passes\n */\n function evaluateFilters(filters, ctx) {\n  return evaluateNode(filters, ctx, ctx.count | 0);\n}\n\n/**\n * Remove one column's conditions from a filter tree (§9.6).\n *\n * This is what makes a faceted histogram readable. A column's own chart must be\n * counted against every *other* active filter but not its own, or clicking a\n * bucket collapses the chart to that single bar and there is no way to see what\n * was excluded or to widen the selection. Getting this wrong does not degrade\n * the feature, it removes it.\n *\n * Pruning is not symmetric across group operators:\n *\n * - An `and` group narrows with each condition, so dropping one widens the\n *   result, which is the direction faceting wants. An emptied group becomes\n *   null and passes every row.\n * - An `or` group widens with each condition, so dropping one branch would\n *   narrow the result and show *fewer* rows than the user's actual filter.\n *   There is no partial answer that is correct, so a disjunction mentioning the\n *   column is dropped whole.\n * - `not` inverts, so the same reasoning applies and it is dropped whole.\n *\n * @param {object|null} filters the filter tree\n * @param {string} colId the column whose conditions come out\n * @returns {object|null} a new tree, or null when nothing is left to apply\n */\n function pruneColumn(filters, colId) {\n  if (!filters || !colId) return filters || null;\n\n  const node = /** @type {Record<string, any>} */ (filters);\n\n  if (Array.isArray(node.conditions)) {\n    const op = node.op === 'or' ? 'or' : node.op === 'not' ? 'not' : 'and';\n    if (op !== 'and') {\n      return mentionsColumn(node, colId) ? null : filters;\n    }\n    const kept = [];\n    for (const child of node.conditions) {\n      const pruned = pruneColumn(child, colId);\n      if (pruned) kept.push(pruned);\n    }\n    if (!kept.length) return null;\n    return { ...node, op: 'and', conditions: kept };\n  }\n\n  return node.col === colId ? null : filters;\n}\n\n/**\n * Whether a filter subtree references a column at all.\n * @param {object|null} filters the tree\n * @param {string} colId the column\n * @returns {boolean} true when the column appears anywhere in it\n */\n function mentionsColumn(filters, colId) {\n  if (!filters || typeof filters !== 'object') return false;\n  const node = /** @type {Record<string, any>} */ (filters);\n  if (node.col === colId) return true;\n  if (Array.isArray(node.conditions)) {\n    for (const child of node.conditions) if (mentionsColumn(child, colId)) return true;\n  }\n  return false;\n}\n\n/**\n * Compact a mask into an index list (§5.7). With no output buffer the result is\n * allocated at exactly the surviving row count, which costs one extra counting\n * pass; with a pooled buffer the survivors are written straight in and a view\n * over the used prefix is returned.\n *\n * @param {Uint8Array} mask the mask, 1 = row survives\n * @param {number} count row count covered by the mask\n * @param {Uint32Array} [out] optional pooled output buffer of at least `count` entries\n * @returns {Uint32Array} the surviving physical indices, ascending\n */\n function compact(mask, count, out) {\n  if (out && out.length >= count) {\n    let k = 0;\n    for (let i = 0; i < count; i++) if (mask[i]) out[k++] = i;\n    return out.subarray(0, k);\n  }\n  let survivors = 0;\n  for (let i = 0; i < count; i++) survivors += mask[i] ? 1 : 0;\n  const result = new Uint32Array(survivors);\n  let k = 0;\n  for (let i = 0; i < count; i++) if (mask[i]) result[k++] = i;\n  return result;\n}\n\n});\n\n__def(\"packages/core/src/compute/group.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"packKeys\", { enumerable: true, get: function () { return packKeys; } });\n  Object.defineProperty(__exports, \"groupByColumns\", { enumerable: true, get: function () { return groupByColumns; } });\n  const __m0 = __req(\"packages/core/src/compute/handle.js\");\n  const dictSize = __m0[\"dictSize\"];\n  const identity = __m0[\"identity\"];\n  const presenceReader = __m0[\"presenceReader\"];\n  const rowCount = __m0[\"rowCount\"];\n  const valueReader = __m0[\"valueReader\"];\n/**\n * Grouping kernel (§5.8).\n *\n * Grouping over dictionary columns is a counting sort on codes: one pass to\n * count occurrences per key, a prefix sum to compute bucket offsets, and one\n * pass to scatter indices into buckets. Linear, allocation-bounded, and no\n * hashing.\n *\n * Composite keys over several dictionary columns pack into a single integer\n * where the product of cardinalities fits in 53 bits, falling back to a `Map`\n * keyed on a packed string otherwise.\n *\n * Group ordering follows from the algorithm and is deliberately not\n * re-sorted here — the row model sorts group rows itself:\n *\n * - packed-integer path with a direct counting array: ascending packed key,\n *   which is dictionary-code order with absent values last;\n * - dense-id paths (large packed space, or the string fallback): order of first\n *   appearance in `order`.\n */\n\n\n\n/** Separator for the string fallback key. Never appears in normal text. */\nconst KEY_SEPARATOR = '\\u001F';\n/** Marker distinguishing an absent value from the literal text \"null\". */\nconst NULL_MARKER = '\\u0000';\n/** Largest direct counting array the packed path will allocate, in entries. */\nconst MAX_DIRECT_COUNTS = 1 << 20;\n\n/**\n * Build a per-row key for a composite group or pivot key.\n *\n * When every column is dictionary-backed and the product of cardinalities fits\n * in 53 bits, keys are integers built by positional multiplication — integer\n * concatenation rather than a string join (§5.8, §10). Each column reserves one\n * extra code for the absent value, so nulls form their own group without a\n * branch in the consuming loop.\n *\n * @param {object[]} handles the columns forming the key\n * @param {Uint32Array} idx the rows to key, in evaluation order\n * @param {number} n number of rows in `idx`\n * @returns {{packed: Float64Array|null, strings: string[]|null, product: number,\n *            readers: ((i: number) => unknown)[], keyOf: (row: number) => number|string}}\n *          the per-position keys plus a per-row key function and value readers\n */\n function packKeys(handles, idx, n) {\n  const k = handles.length;\n  const readers = handles.map((h) => valueReader(h));\n  const allDictionary = k > 0 && handles.every((h) => h && h.kind === 'dictionary' && h.dict);\n\n  if (allDictionary) {\n    const cards = handles.map((h) => dictSize(h.dict) + 1);\n    let product = 1;\n    for (let j = 0; j < k; j++) product *= cards[j];\n    if (product <= Number.MAX_SAFE_INTEGER) {\n      const codes = handles.map((h) => h.values);\n      const presence = handles.map((h) => presenceReader(h));\n      /**\n       * Pack one row's codes into a single integer.\n       * @param {number} row the physical row index\n       * @returns {number} the packed key\n       */\n      const keyOf = (row) => {\n        let key = 0;\n        for (let j = 0; j < k; j++) {\n          const present = presence[j];\n          const code = present && present(row) === 0 ? cards[j] - 1 : codes[j][row];\n          key = key * cards[j] + code;\n        }\n        return key;\n      };\n      const packed = new Float64Array(n);\n      for (let i = 0; i < n; i++) packed[i] = keyOf(idx[i]);\n      return { packed, strings: null, product, readers, keyOf };\n    }\n  }\n\n  /**\n   * Pack one row's values into a delimited string.\n   * @param {number} row the physical row index\n   * @returns {string} the packed key\n   */\n  const keyOf = (row) => {\n    let key = '';\n    for (let j = 0; j < k; j++) {\n      const v = readers[j](row);\n      key += (j === 0 ? '' : KEY_SEPARATOR) + (v === null || v === undefined ? NULL_MARKER : String(v));\n    }\n    return key;\n  };\n  const strings = new Array(n);\n  for (let i = 0; i < n; i++) strings[i] = keyOf(idx[i]);\n  return { packed: null, strings, product: Infinity, readers, keyOf };\n}\n\n/**\n * Counting sort of `idx` by a dense group id, the core of §5.8: one counting\n * pass, a prefix sum, one scatter pass. Buckets are returned as views onto a\n * single scatter buffer, so grouping a million rows allocates one 4MB array.\n *\n * @param {Uint32Array} idx the rows being grouped\n * @param {Uint32Array} ids dense group id per position in `idx`\n * @param {number} n number of rows\n * @param {number} groups number of distinct groups\n * @returns {Uint32Array[]} one index list per group, in group-id order\n */\nfunction scatterBuckets(idx, ids, n, groups) {\n  const offsets = new Uint32Array(groups + 1);\n  for (let i = 0; i < n; i++) offsets[ids[i] + 1]++;\n  for (let g = 0; g < groups; g++) offsets[g + 1] += offsets[g];\n  const scattered = new Uint32Array(n);\n  const cursor = offsets.slice(0, groups);\n  for (let i = 0; i < n; i++) scattered[cursor[ids[i]]++] = idx[i];\n  const buckets = new Array(groups);\n  for (let g = 0; g < groups; g++) buckets[g] = scattered.subarray(offsets[g], offsets[g + 1]);\n  return buckets;\n}\n\n/**\n * Group rows by one or more columns (§5.8).\n *\n * @param {object[]} handles the columns to group by, most significant first\n * @param {Uint32Array|null} order the rows to group; null means all rows\n * @param {{count?: number}} [opts] options; `count` supplies the row count when\n *        `order` is null and the backing carries no length\n * @returns {{keys: unknown[][], buckets: Uint32Array[], packed?: Float64Array}}\n *          the group key tuples, the per-group index lists, and the packed\n *          integer key per group when the integer path was taken\n */\n function groupByColumns(handles, order, opts = {}) {\n  const list = handles || [];\n  const idx = order || identity(rowCount(list[0], opts));\n  const n = idx.length;\n  if (list.length === 0 || n === 0) return { keys: [], buckets: [] };\n\n  const { packed, strings, product, readers } = packKeys(list, idx, n);\n  const ids = new Uint32Array(n);\n  let groups = 0;\n  let packedKeys = null;\n\n  if (packed && product <= Math.max(1024, Math.min(MAX_DIRECT_COUNTS, n * 4))) {\n    // Direct counting over the whole key space: no hashing at all, groups fall\n    // out in ascending key order.\n    const size = product;\n    const seen = new Int32Array(size).fill(-1);\n    for (let i = 0; i < n; i++) seen[packed[i]] = 0;\n    for (let key = 0; key < size; key++) if (seen[key] === 0) seen[key] = groups++;\n    for (let i = 0; i < n; i++) ids[i] = seen[packed[i]];\n    packedKeys = new Float64Array(groups);\n    for (let key = 0; key < size; key++) if (seen[key] >= 0) packedKeys[seen[key]] = key;\n  } else if (packed) {\n    // The key space is too large to index directly, so dense ids are assigned\n    // on first appearance; the counting sort below is unchanged.\n    const seen = new Map();\n    for (let i = 0; i < n; i++) {\n      const key = packed[i];\n      let id = seen.get(key);\n      if (id === undefined) { id = groups++; seen.set(key, id); }\n      ids[i] = id;\n    }\n    packedKeys = new Float64Array(groups);\n    for (const [key, id] of seen) packedKeys[id] = key;\n  } else {\n    const seen = new Map();\n    for (let i = 0; i < n; i++) {\n      const key = strings[i];\n      let id = seen.get(key);\n      if (id === undefined) { id = groups++; seen.set(key, id); }\n      ids[i] = id;\n    }\n  }\n\n  const buckets = scatterBuckets(idx, ids, n, groups);\n  const keys = new Array(groups);\n  for (let g = 0; g < groups; g++) {\n    // The scatter is stable, so element 0 of a bucket is the first row of that\n    // group and can supply the key tuple without a second decode table.\n    const row = buckets[g][0];\n    const tuple = new Array(readers.length);\n    for (let j = 0; j < readers.length; j++) tuple[j] = readers[j](row);\n    keys[g] = tuple;\n  }\n\n  const result = { keys, buckets };\n  if (packedKeys) result.packed = packedKeys;\n  return result;\n}\n\n});\n\n__def(\"packages/core/src/compute/facet.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"STRATEGIES\", { enumerable: true, get: function () { return STRATEGIES; } });\n  Object.defineProperty(__exports, \"GRANULARITIES\", { enumerable: true, get: function () { return GRANULARITIES; } });\n  Object.defineProperty(__exports, \"DEFAULT_BUCKETS\", { enumerable: true, get: function () { return DEFAULT_BUCKETS; } });\n  Object.defineProperty(__exports, \"DEFAULT_CARDINALITY_LIMIT\", { enumerable: true, get: function () { return DEFAULT_CARDINALITY_LIMIT; } });\n  Object.defineProperty(__exports, \"QUANTILE_SAMPLE\", { enumerable: true, get: function () { return QUANTILE_SAMPLE; } });\n  Object.defineProperty(__exports, \"facetKind\", { enumerable: true, get: function () { return facetKind; } });\n  Object.defineProperty(__exports, \"orderedReader\", { enumerable: true, get: function () { return orderedReader; } });\n  Object.defineProperty(__exports, \"toNumeric\", { enumerable: true, get: function () { return toNumeric; } });\n  Object.defineProperty(__exports, \"cardinalityOf\", { enumerable: true, get: function () { return cardinalityOf; } });\n  Object.defineProperty(__exports, \"pickGranularity\", { enumerable: true, get: function () { return pickGranularity; } });\n  Object.defineProperty(__exports, \"floorTo\", { enumerable: true, get: function () { return floorTo; } });\n  Object.defineProperty(__exports, \"advance\", { enumerable: true, get: function () { return advance; } });\n  Object.defineProperty(__exports, \"computeBounds\", { enumerable: true, get: function () { return computeBounds; } });\n  Object.defineProperty(__exports, \"countInto\", { enumerable: true, get: function () { return countInto; } });\n  Object.defineProperty(__exports, \"bucketOf\", { enumerable: true, get: function () { return bucketOf; } });\n  Object.defineProperty(__exports, \"facet\", { enumerable: true, get: function () { return facet; } });\n  Object.defineProperty(__exports, \"default\", { enumerable: true, get: function () { return __default; } });\n  const __m0 = __req(\"packages/core/src/compute/handle.js\");\n  const presenceReader = __m0[\"presenceReader\"];\n  const valueReader = __m0[\"valueReader\"];\n  const dictSize = __m0[\"dictSize\"];\n  const dictValue = __m0[\"dictValue\"];\n/**\n * Column distribution kernels — the counts behind a header histogram (§9.6).\n *\n * Two phases, deliberately separate, because they have very different costs and\n * very different lifetimes:\n *\n * 1. {@link computeBounds} decides where the buckets *are*. It runs against the\n *    unfiltered column and its answer is retained until the data set is\n *    replaced. Quantile and logarithmic strategies need a sort or a scan to\n *    place boundaries, so this is the expensive half.\n * 2. {@link countInto} counts rows into boundaries that already exist. This is\n *    one pass over contiguous memory with a comparison per row, and it is what\n *    re-runs on every filter change.\n *\n * Splitting them is the whole reason cross-filtering is affordable. If\n * boundaries moved on every recount the chart would also be unreadable —\n * buckets would resize under the pointer as the user filtered, which is exactly\n * the behaviour that makes a facet control feel broken.\n *\n * Nulls are never silently dropped. A column of ten thousand rows where nine\n * thousand are empty is a fact about the data, and a histogram that quietly\n * showed the thousand would be lying about the shape. They land in a terminal\n * bucket flagged `null`, always last, and the caller draws it apart from the\n * ordered ones.\n *\n * Every function here is pure and reads only `handle.values`, `handle.presence`\n * and `handle.dict`, which is precisely what the Worker transport packs. The\n * same code runs on the main thread and inside a Worker with no branch.\n *\n * No DOM.\n */\n\n\n\n/** Bucketing strategies for numeric columns. */\n const STRATEGIES = Object.freeze(['equal', 'quantile', 'log']);\n\n/** Time granularities, coarsest last. */\n const GRANULARITIES = Object.freeze(['hour', 'day', 'week', 'month', 'quarter', 'year']);\n\n/** Buckets a numeric or date column is cut into unless told otherwise. */\n const DEFAULT_BUCKETS = 20;\n\n/**\n * Distinct values above which a text column has no readable histogram.\n *\n * Twenty bars is a distribution; two thousand is a texture. The default is\n * deliberately low because the first column anyone points this at is a name or\n * an id, and drawing one hairline per customer looks like a rendering fault.\n */\n const DEFAULT_CARDINALITY_LIMIT = 50;\n\n/**\n * Values sampled when placing quantile boundaries.\n *\n * Quantiles need sorted data and sorting a million-row column to draw twenty\n * bars is not a trade worth making. An evenly-spaced sample puts boundaries\n * within a bar's width of the true quantiles long before this many rows, and\n * the error is invisible at the size the chart is drawn.\n */\n const QUANTILE_SAMPLE = 10_000;\n\n/* ------------------------------------------------------------------ */\n/* Shape detection                                                    */\n/* ------------------------------------------------------------------ */\n\n/**\n * Which histogram a column can support, from its storage kind and data type.\n *\n * Storage kind is the better signal than the declared type: a column stored as\n * a dictionary has a known, bounded value table whatever it calls itself, and\n * one stored as float64 is orderable whether it is a price or a temperature.\n *\n * @param {object|null|undefined} handle the column handle\n * @param {{ base?: string }} [type] the resolved data type, when known\n * @returns {'numeric'|'date'|'category'|'boolean'|'none'} the histogram shape\n */\n function facetKind(handle, type) {\n  if (!handle) return 'none';\n  const base = type && type.base;\n  if (base === 'date' || base === 'datetime' || base === 'time' || base === 'dateString') return 'date';\n  switch (handle.kind) {\n    case 'bitset': return 'boolean';\n    case 'float64': case 'int32': return 'numeric';\n    case 'dictionary': return 'category';\n    // Multi-value columns count each member separately, which is a category\n    // histogram over an exploded column.\n    case 'multi': return 'category';\n    default:\n      // `object` is not only the untyped case. Below the columnarisation\n      // threshold (§5.12) *every* column reports it, because the store is still\n      // holding logical values in a plain array — so refusing on storage kind\n      // alone would mean no histogram on any grid under five thousand rows,\n      // which is most of them. The declared type is the better answer here.\n      if (base === 'number') return 'numeric';\n      if (base === 'boolean') return 'boolean';\n      if (base === 'text') return 'category';\n      return 'none';\n  }\n}\n\n/**\n * A reader returning each row's value as a number, whichever way it is stored.\n *\n * Typed columns are read straight out of the buffer. A column the store has not\n * columnarised holds logical values — including `Date` objects — in a plain\n * array, and those have to be coerced or every row reads as absent.\n *\n * @param {object} handle the column handle\n * @returns {(i: number) => number} the reader\n */\n function orderedReader(handle) {\n  const values = handle.values;\n  const kind = handle.kind;\n  if ((kind === 'float64' || kind === 'int32') && values) return (i) => values[i];\n  const read = valueReader(handle);\n  return (i) => toNumeric(read(i));\n}\n\n/**\n * Coerce a logical value to the number a histogram can bucket.\n * @param {unknown} v the value\n * @returns {number} the number, or NaN when there is none\n */\n function toNumeric(v) {\n  if (typeof v === 'number') return v;\n  if (v instanceof Date) return v.getTime();\n  if (v === null || v === undefined || v === '') return NaN;\n  if (typeof v === 'boolean') return v ? 1 : 0;\n  if (typeof v === 'string') {\n    const n = Number(v);\n    if (Number.isFinite(n)) return n;\n    const t = Date.parse(v);\n    return Number.isFinite(t) ? t : NaN;\n  }\n  return NaN;\n}\n\n/**\n * Distinct values in a column, without a pass where the store already knows.\n *\n * A dictionary-encoded column carries its value table, so cardinality is a\n * property read rather than a scan — which is what makes suppressing a\n * high-cardinality column free rather than something you pay for once and\n * regret. Everything else is counted, bounded by `limit` so an id column stops\n * early instead of building a set of every row.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array|null} indices rows to consider; null means all rows\n * @param {number} count total rows when `indices` is null\n * @param {number} [limit] stop once this many distinct values are seen\n * @returns {{ cardinality: number, exact: boolean }} the count, and whether it\n *   is the true total or a floor because `limit` cut the scan short\n */\n function cardinalityOf(handle, indices, count, limit = DEFAULT_CARDINALITY_LIMIT) {\n  if (!handle) return { cardinality: 0, exact: true };\n  if (handle.dict) return { cardinality: dictSize(handle.dict), exact: true };\n  if (handle.kind === 'bitset') return { cardinality: 2, exact: true };\n\n  const read = valueReader(handle);\n  const n = indices ? indices.length : count;\n  const seen = new Set();\n  for (let k = 0; k < n; k++) {\n    const v = read(indices ? indices[k] : k);\n    if (v === null || v === undefined) continue;\n    seen.add(v);\n    if (seen.size > limit) return { cardinality: seen.size, exact: false };\n  }\n  return { cardinality: seen.size, exact: true };\n}\n\n/* ------------------------------------------------------------------ */\n/* Time flooring                                                      */\n/* ------------------------------------------------------------------ */\n\n/** Milliseconds in the fixed-length units, for span arithmetic. */\nconst HOUR_MS = 3600_000;\nconst DAY_MS = 86_400_000;\n\n/**\n * Pick a time granularity that cuts a span into roughly the wanted number of\n * buckets.\n *\n * Chosen by how many buckets each unit would produce rather than by fixed span\n * thresholds, so a column spanning three days and one spanning three years both\n * arrive at a readable chart without the caller thinking about it.\n *\n * @param {number} span milliseconds from the earliest value to the latest\n * @param {number} [target] buckets wanted\n * @returns {'hour'|'day'|'week'|'month'|'quarter'|'year'} the granularity\n */\n function pickGranularity(span, target = DEFAULT_BUCKETS) {\n  const ms = Number.isFinite(span) && span > 0 ? span : 0;\n  // Twice the target is the ceiling, not two and a half: at 2.5 an eleven-year\n  // span picks quarters and draws forty-four bars into a band a few pixels\n  // high, which is a texture rather than a distribution. Overshooting the\n  // target a little beats jumping to the next unit too eagerly; overshooting it\n  // by more costs readability, which is the only thing this chart sells.\n  const wide = Math.max(1, target) * 2;\n  if (ms / HOUR_MS <= wide) return 'hour';\n  if (ms / DAY_MS <= wide) return 'day';\n  if (ms / (7 * DAY_MS) <= wide) return 'week';\n  if (ms / (30 * DAY_MS) <= wide) return 'month';\n  if (ms / (91 * DAY_MS) <= wide) return 'quarter';\n  return 'year';\n}\n\n/**\n * Round a timestamp down to the start of its bucket.\n *\n * Local time, not UTC: a \"day\" bucket has to agree with the day the cell\n * displays, and a chart whose boundaries sit at midnight UTC would cut the\n * user's days in half everywhere except one timezone.\n *\n * Weeks start Monday.\n *\n * @param {number} ms epoch milliseconds\n * @param {'hour'|'day'|'week'|'month'|'quarter'|'year'} granularity the unit\n * @returns {number} the start of the containing bucket, epoch milliseconds\n */\n function floorTo(ms, granularity) {\n  if (!Number.isFinite(ms)) return NaN;\n  const d = new Date(ms);\n  switch (granularity) {\n    case 'hour': d.setMinutes(0, 0, 0); return d.getTime();\n    case 'day': d.setHours(0, 0, 0, 0); return d.getTime();\n    case 'week': {\n      d.setHours(0, 0, 0, 0);\n      // getDay() is 0 for Sunday, which is six days into a Monday-based week.\n      const back = (d.getDay() + 6) % 7;\n      d.setDate(d.getDate() - back);\n      return d.getTime();\n    }\n    case 'month': d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime();\n    case 'quarter':\n      d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1);\n      d.setHours(0, 0, 0, 0);\n      return d.getTime();\n    default: d.setMonth(0, 1); d.setHours(0, 0, 0, 0); return d.getTime();\n  }\n}\n\n/**\n * The start of the bucket after this one.\n * @param {number} ms the start of a bucket\n * @param {'hour'|'day'|'week'|'month'|'quarter'|'year'} granularity the unit\n * @returns {number} the next boundary\n */\n function advance(ms, granularity) {\n  const d = new Date(ms);\n  switch (granularity) {\n    case 'hour': d.setHours(d.getHours() + 1); break;\n    case 'day': d.setDate(d.getDate() + 1); break;\n    case 'week': d.setDate(d.getDate() + 7); break;\n    case 'month': d.setMonth(d.getMonth() + 1); break;\n    case 'quarter': d.setMonth(d.getMonth() + 3); break;\n    default: d.setFullYear(d.getFullYear() + 1); break;\n  }\n  return d.getTime();\n}\n\n/* ------------------------------------------------------------------ */\n/* Boundaries                                                         */\n/* ------------------------------------------------------------------ */\n\n/**\n * Scan a numeric column for its range, ignoring absent and non-finite values.\n * @param {object} handle the column handle\n * @param {Uint32Array|null} indices rows to consider; null means all rows\n * @param {number} count total rows when `indices` is null\n * @returns {{ min: number, max: number, nulls: number, finite: number }} the extent\n */\nfunction numericExtent(handle, indices, count) {\n  const read = orderedReader(handle);\n  const present = presenceReader(handle);\n  const n = indices ? indices.length : count;\n  let min = Infinity;\n  let max = -Infinity;\n  let nulls = 0;\n  let finite = 0;\n  for (let k = 0; k < n; k++) {\n    const i = indices ? indices[k] : k;\n    if (present && !present(i)) { nulls++; continue; }\n    const v = read(i);\n    // NaN joins the null bucket rather than forming its own. It is the same\n    // answer to the same question — this row has no usable number — and a\n    // second terminal bar for it would be noise on every float column.\n    if (!Number.isFinite(v)) { nulls++; continue; }\n    if (v < min) min = v;\n    if (v > max) max = v;\n    finite++;\n  }\n  return { min, max, nulls, finite };\n}\n\n/**\n * Evenly-spaced sample of a column's finite values, sorted ascending.\n * @param {object} handle the column handle\n * @param {Uint32Array|null} indices rows to consider\n * @param {number} count total rows when `indices` is null\n * @param {number} cap how many values to take\n * @returns {Float64Array} the sorted sample\n */\nfunction sortedSample(handle, indices, count, cap) {\n  const read = orderedReader(handle);\n  const present = presenceReader(handle);\n  const n = indices ? indices.length : count;\n  const step = n > cap ? n / cap : 1;\n  const out = [];\n  for (let s = 0; s < n; s += step) {\n    const i = indices ? indices[Math.floor(s)] : Math.floor(s);\n    if (present && !present(i)) continue;\n    const v = read(i);\n    if (Number.isFinite(v)) out.push(v);\n  }\n  const arr = Float64Array.from(out);\n  arr.sort();\n  return arr;\n}\n\n/**\n * Place bucket boundaries for a column.\n *\n * Run once against the unfiltered column and retained. The result is small —\n * an array of edges — and is what {@link countInto} counts into.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array|null} indices rows to consider; null means all rows\n * @param {number} count total rows when `indices` is null\n * @param {{ kind?: string, buckets?: number, strategy?: string,\n *           granularity?: string, order?: 'count'|'alpha',\n *           cardinalityLimit?: number, aboveLimit?: 'suppress'|'topN',\n *           type?: object }} [opts] how to bucket\n * @returns {object} the bounds: `{ kind, buckets, suppressed?, cardinality? }`\n */\n function computeBounds(handle, indices, count, opts = {}) {\n  const kind = opts.kind || facetKind(handle, opts.type);\n  if (kind === 'none' || !handle) return { kind: 'none', buckets: [], suppressed: 'type' };\n\n  if (kind === 'boolean') return boundsForBoolean(handle, indices, count);\n  if (kind === 'category') return boundsForCategory(handle, indices, count, opts);\n  return boundsForOrdered(handle, indices, count, kind, opts);\n}\n\n/**\n * Two bars and a null bar.\n * @param {object} handle the column handle\n * @param {Uint32Array|null} indices rows to consider\n * @param {number} count total rows when `indices` is null\n * @returns {object} the bounds\n */\nfunction boundsForBoolean(handle, indices, count) {\n  const present = presenceReader(handle);\n  let nulls = 0;\n  if (present) {\n    const n = indices ? indices.length : count;\n    for (let k = 0; k < n; k++) if (!present(indices ? indices[k] : k)) nulls++;\n  }\n  const buckets = [{ value: false, label: 'false' }, { value: true, label: 'true' }];\n  if (nulls > 0) buckets.push({ null: true, label: 'Empty' });\n  return { kind: 'boolean', buckets };\n}\n\n/**\n * One bar per distinct value, ordered by count or alphabetically.\n *\n * Ordering by count is the default because the question a categorical facet\n * answers is \"what is this mostly made of\", and alphabetical ordering buries\n * the answer in the middle of the chart.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array|null} indices rows to consider\n * @param {number} count total rows when `indices` is null\n * @param {object} opts bucketing options\n * @returns {object} the bounds\n */\nfunction boundsForCategory(handle, indices, count, opts) {\n  const limit = opts.cardinalityLimit ?? DEFAULT_CARDINALITY_LIMIT;\n  const { cardinality } = cardinalityOf(handle, indices, count, limit);\n\n  if (cardinality > limit && (opts.aboveLimit || 'suppress') === 'suppress') {\n    return { kind: 'category', buckets: [], suppressed: 'cardinality', cardinality };\n  }\n\n  // Counted here rather than in `countInto` because the *order* of a\n  // categorical chart is part of its boundaries: it has to be fixed against the\n  // unfiltered column, or bars would reorder themselves under the pointer every\n  // time the user filtered.\n  const read = valueReader(handle);\n  const n = indices ? indices.length : count;\n  const tally = new Map();\n  let nulls = 0;\n  for (let k = 0; k < n; k++) {\n    const v = read(indices ? indices[k] : k);\n    if (v === null || v === undefined || v === '') { nulls++; continue; }\n    if (Array.isArray(v)) {\n      if (!v.length) { nulls++; continue; }\n      for (const m of v) tally.set(m, (tally.get(m) || 0) + 1);\n      continue;\n    }\n    tally.set(v, (tally.get(v) || 0) + 1);\n  }\n\n  let entries = [...tally.entries()];\n  if (opts.order === 'alpha') {\n    entries.sort((a, b) => String(a[0]).localeCompare(String(b[0])));\n  } else {\n    entries.sort((a, b) => b[1] - a[1]);\n  }\n\n  let remainder = 0;\n  let dropped = 0;\n  if (entries.length > limit) {\n    // topN: everything past the cut becomes one honest bucket rather than\n    // vanishing. A chart that silently omitted the tail would misrepresent the\n    // proportions of the bars it did draw.\n    dropped = entries.length - limit;\n    for (let i = limit; i < entries.length; i++) remainder += entries[i][1];\n    entries = entries.slice(0, limit);\n  }\n\n  const buckets = entries.map(([value]) => ({ value, label: String(value) }));\n  if (remainder > 0) buckets.push({ remainder: true, label: `Other (${dropped} values)` });\n  if (nulls > 0) buckets.push({ null: true, label: 'Empty' });\n  return { kind: 'category', buckets, cardinality };\n}\n\n/**\n * Ordered edges for a numeric or date column.\n * @param {object} handle the column handle\n * @param {Uint32Array|null} indices rows to consider\n * @param {number} count total rows when `indices` is null\n * @param {'numeric'|'date'} kind the shape\n * @param {object} opts bucketing options\n * @returns {object} the bounds\n */\nfunction boundsForOrdered(handle, indices, count, kind, opts) {\n  const { min, max, nulls, finite } = numericExtent(handle, indices, count);\n  if (!finite) {\n    return { kind, buckets: nulls ? [{ null: true, label: 'Empty' }] : [], empty: true };\n  }\n\n  const wanted = Math.max(1, Math.floor(opts.buckets || DEFAULT_BUCKETS));\n  /** @type {{from:number,to:number,label?:string}[]} */\n  let buckets = [];\n\n  if (kind === 'date') {\n    const granularity = GRANULARITIES.includes(opts.granularity)\n      ? opts.granularity : pickGranularity(max - min, wanted);\n    let edge = floorTo(min, granularity);\n    // Guarded rather than trusted: a granularity that failed to advance would\n    // spin here, and the cost of the check is nothing against that.\n    while (edge <= max && buckets.length < 4096) {\n      const next = advance(edge, granularity);\n      if (!(next > edge)) break;\n      buckets.push({ from: edge, to: next });\n      edge = next;\n    }\n    return { kind, buckets: withNull(buckets, nulls), granularity };\n  }\n\n  const strategy = STRATEGIES.includes(opts.strategy) ? opts.strategy : 'equal';\n\n  if (strategy === 'quantile') {\n    const sample = sortedSample(handle, indices, count, QUANTILE_SAMPLE);\n    if (sample.length) {\n      const edges = [sample[0]];\n      for (let b = 1; b < wanted; b++) {\n        const v = sample[Math.min(sample.length - 1, Math.floor((b / wanted) * sample.length))];\n        // Equal values collapse quantiles onto each other. Skipping the\n        // duplicate yields fewer, wider buckets, which is the honest answer for\n        // a column where half the rows share one value.\n        if (v > edges[edges.length - 1]) edges.push(v);\n      }\n      edges.push(max);\n      for (let b = 0; b < edges.length - 1; b++) buckets.push({ from: edges[b], to: edges[b + 1] });\n    }\n  } else if (strategy === 'log' && min > 0) {\n    const lo = Math.log10(min);\n    const hi = Math.log10(max);\n    const step = (hi - lo) / wanted || 1;\n    for (let b = 0; b < wanted; b++) {\n      buckets.push({ from: 10 ** (lo + b * step), to: 10 ** (lo + (b + 1) * step) });\n    }\n  }\n\n  if (!buckets.length) {\n    // Equal width, and the fallback whenever a strategy could not apply — a log\n    // scale over values reaching zero or below has no meaning, and silently\n    // drawing nothing would read as a broken chart rather than a refused one.\n    const width = (max - min) / wanted || 1;\n    for (let b = 0; b < wanted; b++) buckets.push({ from: min + b * width, to: min + (b + 1) * width });\n  }\n\n  // The top edge is inclusive on the last bucket only, so the maximum value has\n  // somewhere to land. Every other bucket is half-open.\n  buckets[buckets.length - 1].to = max;\n  return { kind, buckets: withNull(buckets, nulls), strategy, min, max };\n}\n\n/**\n * Append the terminal null bucket when the column has absent values.\n * @param {object[]} buckets the ordered buckets\n * @param {number} nulls how many absent values were seen\n * @returns {object[]} the buckets, with a null bucket last where needed\n */\nfunction withNull(buckets, nulls) {\n  return nulls > 0 ? [...buckets, { null: true, label: 'Empty' }] : buckets;\n}\n\n/* ------------------------------------------------------------------ */\n/* Counting                                                           */\n/* ------------------------------------------------------------------ */\n\n/**\n * Count rows into boundaries that already exist.\n *\n * The hot half. One pass, a binary search per row on ordered columns and a map\n * lookup on categorical ones, into a counts array the caller may reuse.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array|null} indices rows to count; null means all rows\n * @param {number} count total rows when `indices` is null\n * @param {object} bounds the result of {@link computeBounds}\n * @param {Uint32Array} [out] a counts buffer to fill instead of allocating\n * @returns {Uint32Array} counts, aligned one-to-one with `bounds.buckets`\n */\n function countInto(handle, indices, count, bounds, out) {\n  const buckets = (bounds && bounds.buckets) || [];\n  const counts = out && out.length >= buckets.length ? out.subarray(0, buckets.length)\n    : new Uint32Array(buckets.length);\n  counts.fill(0);\n  if (!handle || !buckets.length) return counts;\n\n  const nullBucket = buckets.length - 1;\n  const hasNull = !!buckets[nullBucket] && buckets[nullBucket].null === true;\n  const n = indices ? indices.length : count;\n\n  if (bounds.kind === 'boolean') {\n    const read = valueReader(handle);\n    for (let k = 0; k < n; k++) {\n      const v = read(indices ? indices[k] : k);\n      if (v === null || v === undefined) { if (hasNull) counts[nullBucket]++; continue; }\n      counts[v ? 1 : 0]++;\n    }\n    return counts;\n  }\n\n  if (bounds.kind === 'category') {\n    const slot = new Map();\n    for (let b = 0; b < buckets.length; b++) {\n      if (!buckets[b].null && !buckets[b].remainder) slot.set(buckets[b].value, b);\n    }\n    const remainderAt = buckets.findIndex((b) => b.remainder);\n    const read = valueReader(handle);\n    for (let k = 0; k < n; k++) {\n      const v = read(indices ? indices[k] : k);\n      if (v === null || v === undefined || v === '') { if (hasNull) counts[nullBucket]++; continue; }\n      if (Array.isArray(v)) {\n        if (!v.length) { if (hasNull) counts[nullBucket]++; continue; }\n        for (const m of v) {\n          const at = slot.get(m);\n          if (at !== undefined) counts[at]++;\n          else if (remainderAt >= 0) counts[remainderAt]++;\n        }\n        continue;\n      }\n      const at = slot.get(v);\n      if (at !== undefined) counts[at]++;\n      else if (remainderAt >= 0) counts[remainderAt]++;\n    }\n    return counts;\n  }\n\n  // Ordered. Edges are ascending, so a binary search finds the bucket in\n  // log(b) rather than scanning — which matters at twenty buckets far less\n  // than it does at the few hundred a fine date granularity can produce.\n  const ordered = hasNull ? buckets.length - 1 : buckets.length;\n  const edges = new Float64Array(ordered + 1);\n  for (let b = 0; b < ordered; b++) edges[b] = buckets[b].from;\n  edges[ordered] = ordered ? buckets[ordered - 1].to : 0;\n\n  const read = orderedReader(handle);\n  const present = presenceReader(handle);\n  for (let k = 0; k < n; k++) {\n    const i = indices ? indices[k] : k;\n    if (present && !present(i)) { if (hasNull) counts[nullBucket]++; continue; }\n    const v = read(i);\n    if (!Number.isFinite(v)) { if (hasNull) counts[nullBucket]++; continue; }\n    const at = bucketOf(edges, ordered, v);\n    if (at >= 0) counts[at]++;\n  }\n  return counts;\n}\n\n/**\n * The bucket a value falls in, by binary search over ascending edges.\n *\n * Half-open `[from, to)` everywhere except the last bucket, whose top edge is\n * inclusive so the column's maximum has somewhere to land.\n *\n * @param {Float64Array} edges `ordered + 1` ascending boundaries\n * @param {number} ordered how many buckets\n * @param {number} v the value\n * @returns {number} the bucket index, or -1 when the value is outside the range\n */\n function bucketOf(edges, ordered, v) {\n  if (!ordered) return -1;\n  if (v < edges[0]) return -1;\n  if (v >= edges[ordered]) return v === edges[ordered] ? ordered - 1 : -1;\n  let lo = 0;\n  let hi = ordered - 1;\n  while (lo < hi) {\n    const mid = (lo + hi + 1) >>> 1;\n    if (v >= edges[mid]) lo = mid; else hi = mid - 1;\n  }\n  return lo;\n}\n\n/**\n * Bounds and counts in one call, for a caller that wants both and has no cached\n * boundaries — the first computation for a column, and the whole job inside a\n * Worker where a round trip per phase would cost more than the work.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array|null} indices rows to count; null means all rows\n * @param {number} count total rows when `indices` is null\n * @param {object} [opts] bucketing options, as {@link computeBounds}\n * @returns {{ bounds: object, counts: Uint32Array }} the distribution\n */\n function facet(handle, indices, count, opts = {}) {\n  const bounds = opts.bounds || computeBounds(handle, opts.boundsIndices ?? indices, count, opts);\n  return { bounds, counts: countInto(handle, indices, count, bounds) };\n}\n\nconst __default = facet;\n\n});\n\n__def(\"packages/core/src/compute/total.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"TOTAL_FNS\", { enumerable: true, get: function () { return TOTAL_FNS; } });\n  Object.defineProperty(__exports, \"TOTAL_LABELS\", { enumerable: true, get: function () { return TOTAL_LABELS; } });\n  Object.defineProperty(__exports, \"totalLabel\", { enumerable: true, get: function () { return totalLabel; } });\n  Object.defineProperty(__exports, \"collectValues\", { enumerable: true, get: function () { return collectValues; } });\n  Object.defineProperty(__exports, \"total\", { enumerable: true, get: function () { return total; } });\n  const __m0 = __req(\"packages/core/src/internal/util.js\");\n  const isFunction = __m0[\"isFunction\"];\n  const warnOnce = __m0[\"warnOnce\"];\n  const __m1 = __req(\"packages/core/src/compute/handle.js\");\n  const presenceReader = __m1[\"presenceReader\"];\n  const valueComparator = __m1[\"valueComparator\"];\n  const valueReader = __m1[\"valueReader\"];\n/**\n * Total kernels (§5.8, §9.4).\n *\n * Totals run over the index list of a group, a tree node's descendants, a pivot\n * cell or the whole filtered set, reading straight from the typed column. A sum\n * over a group's leaves is therefore a tight loop over a `Float64Array` with one\n * indirection per element.\n *\n * The presence bitset removes the null check from the inner loop (§5.3): a\n * non-nullable column runs a loop with no check at all, and a nullable one\n * tests a bit rather than a boxed value.\n *\n * `NaN` is skipped by the numeric reductions. A single unparsed cell should not\n * turn a column of totals into `NaN`.\n */\n\n\n\n\n/**\n * Can this column be reduced by reading its backing buffer as numbers?\n * @param {object} handle the column handle\n * @returns {boolean} true for `float64` and `int32` backings\n */\nfunction isNumericBacking(handle) {\n  return !!handle && (handle.kind === 'float64' || handle.kind === 'int32');\n}\n\n/**\n * Sum of the present numeric values, `0` over an empty or entirely absent set,\n * which is what a spreadsheet returns and what a footer should show.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array|ArrayLike<number>} indices the rows to reduce\n * @returns {number} the sum\n */\nfunction sum(handle, indices) {\n  const n = indices.length;\n  let acc = 0;\n  if (isNumericBacking(handle)) {\n    const values = handle.values;\n    const present = presenceReader(handle);\n    if (!present) {\n      for (let i = 0; i < n; i++) {\n        const v = values[indices[i]];\n        if (!Number.isNaN(v)) acc += v;\n      }\n      return acc;\n    }\n    for (let i = 0; i < n; i++) {\n      const row = indices[i];\n      if (present(row) === 1) {\n        const v = values[row];\n        if (!Number.isNaN(v)) acc += v;\n      }\n    }\n    return acc;\n  }\n  const read = valueReader(handle);\n  for (let i = 0; i < n; i++) {\n    const v = numberOf(read(indices[i]));\n    if (v !== null) acc += v;\n  }\n  return acc;\n}\nsum.kernel = true;\n\n/**\n * Count of present, non-`NaN` values.\n * @param {object} handle the column handle\n * @param {Uint32Array|ArrayLike<number>} indices the rows to reduce\n * @returns {number} the number of values\n */\nfunction countValues(handle, indices) {\n  const n = indices.length;\n  let count = 0;\n  if (isNumericBacking(handle)) {\n    const values = handle.values;\n    const present = presenceReader(handle);\n    if (!present) {\n      for (let i = 0; i < n; i++) if (!Number.isNaN(values[indices[i]])) count++;\n      return count;\n    }\n    for (let i = 0; i < n; i++) {\n      const row = indices[i];\n      if (present(row) === 1 && !Number.isNaN(values[row])) count++;\n    }\n    return count;\n  }\n  const read = valueReader(handle);\n  for (let i = 0; i < n; i++) {\n    const v = read(indices[i]);\n    if (v !== null && v !== undefined && !(typeof v === 'number' && Number.isNaN(v))) count++;\n  }\n  return count;\n}\ncountValues.kernel = true;\n\n/**\n * Row count, including rows whose value is absent. `count` answers \"how many\n * rows\", `countValues` answers \"how many values\" (§9.4).\n *\n * @param {object} handle the column handle, unused\n * @param {Uint32Array|ArrayLike<number>} indices the rows to reduce\n * @returns {number} the row count\n */\nfunction count(handle, indices) {\n  return indices.length;\n}\ncount.kernel = true;\n\n/**\n * Mean of the present numeric values, `null` when there are none — an average\n * of nothing is not zero.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array|ArrayLike<number>} indices the rows to reduce\n * @returns {number|null} the mean\n */\nfunction avg(handle, indices) {\n  const values = countValues(handle, indices);\n  if (values === 0) return null;\n  return sum(handle, indices) / values;\n}\navg.kernel = true;\n\n/**\n * Extreme of the present values. Numeric backings compare as numbers; anything\n * else uses the shared comparator, so `max` over a date or text column is\n * meaningful too (§9.4 shows `total: 'max'` on a date column).\n *\n * @param {object} handle the column handle\n * @param {Uint32Array|ArrayLike<number>} indices the rows to reduce\n * @param {number} direction -1 for the minimum, 1 for the maximum\n * @param {string} [locale] BCP-47 locale for text collation\n * @returns {unknown} the extreme value, or null when there is none\n */\nfunction extreme(handle, indices, direction, locale) {\n  const n = indices.length;\n  if (isNumericBacking(handle)) {\n    const values = handle.values;\n    const present = presenceReader(handle);\n    let best = null;\n    if (!present) {\n      for (let i = 0; i < n; i++) {\n        const v = values[indices[i]];\n        if (Number.isNaN(v)) continue;\n        if (best === null || (direction < 0 ? v < best : v > best)) best = v;\n      }\n      return best;\n    }\n    for (let i = 0; i < n; i++) {\n      const row = indices[i];\n      if (present(row) === 0) continue;\n      const v = values[row];\n      if (Number.isNaN(v)) continue;\n      if (best === null || (direction < 0 ? v < best : v > best)) best = v;\n    }\n    return best;\n  }\n  const read = valueReader(handle);\n  const cmp = valueComparator(locale);\n  let best = null;\n  for (let i = 0; i < n; i++) {\n    const v = read(indices[i]);\n    if (v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v))) continue;\n    if (best === null || (direction < 0 ? cmp(v, best) < 0 : cmp(v, best) > 0)) best = v;\n  }\n  return best;\n}\n\n/**\n * Smallest present value.\n * @param {object} handle the column handle\n * @param {Uint32Array|ArrayLike<number>} indices the rows to reduce\n * @param {{locale?: string}} [ctx] reduction context\n * @returns {unknown} the minimum, or null when there is none\n */\nfunction min(handle, indices, ctx) {\n  return extreme(handle, indices, -1, ctx && ctx.locale);\n}\nmin.kernel = true;\n\n/**\n * Largest present value.\n * @param {object} handle the column handle\n * @param {Uint32Array|ArrayLike<number>} indices the rows to reduce\n * @param {{locale?: string}} [ctx] reduction context\n * @returns {unknown} the maximum, or null when there is none\n */\nfunction max(handle, indices, ctx) {\n  return extreme(handle, indices, 1, ctx && ctx.locale);\n}\nmax.kernel = true;\n\n/**\n * Value of the first row in the list, absent or not — \"first\" is positional,\n * so it stays aligned with the row the user can see at the top of the group.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array|ArrayLike<number>} indices the rows to reduce\n * @returns {unknown} the first value, or null when the list is empty\n */\nfunction first(handle, indices) {\n  if (indices.length === 0) return null;\n  return valueReader(handle)(indices[0]);\n}\nfirst.kernel = true;\n\n/**\n * Value of the last row in the list.\n * @param {object} handle the column handle\n * @param {Uint32Array|ArrayLike<number>} indices the rows to reduce\n * @returns {unknown} the last value, or null when the list is empty\n */\nfunction last(handle, indices) {\n  if (indices.length === 0) return null;\n  return valueReader(handle)(indices[indices.length - 1]);\n}\nlast.kernel = true;\n\n/**\n * Numeric view of a logical value, or null when it has none.\n * @param {unknown} v the logical value\n * @returns {number|null} the number, or null\n */\nfunction numberOf(v) {\n  if (typeof v === 'number') return Number.isNaN(v) ? null : v;\n  if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null;\n  if (v instanceof Date) return v.getTime();\n  const n = Number(v);\n  return Number.isNaN(n) ? null : n;\n}\n\n/**\n * The built-in reductions of §9.4, each reading the typed column directly.\n * Every entry has the signature `(handle, indices, ctx) => unknown` and carries\n * `kernel = true` so {@link total} can tell it apart from a user total function,\n * which takes `(values, ctx)`.\n *\n * @type {Record<string, Function>}\n */\n const TOTAL_FNS = { sum, min, max, avg, count, first, last, countValues };\n\n/**\n * Display names for the built-in reductions.\n *\n * Here rather than beside a panel, because two places show them — the values\n * zone of the tool panel and the column header under `showTotalInHeader` — and\n * a second table would be a second place for \"Average\" to become \"Mean\". It is\n * a string table, not a UI: area A stays DOM-free.\n *\n * @type {Readonly<Record<string, string>>}\n */\n const TOTAL_LABELS = Object.freeze({\n  sum: 'Sum',\n  avg: 'Average',\n  min: 'Min',\n  max: 'Max',\n  count: 'Count',\n  countValues: 'Count of values',\n  first: 'First',\n  last: 'Last',\n});\n\n/**\n * A human name for a column's reduction.\n *\n * A caller's own function has no name to show — `fn.name` would leak whatever\n * the variable happened to be called, including `anonymous` — so it reports as\n * the generic word rather than as something that looks deliberate.\n *\n * @param {string|Function|null|undefined} fn the total, a built-in name or a function\n * @returns {string} the label, or an empty string when there is no total\n */\n function totalLabel(fn) {\n  if (!fn) return '';\n  if (typeof fn === 'string') return TOTAL_LABELS[fn] || fn;\n  return 'Total';\n}\n\n/**\n * Materialise the present values of a column for a user-supplied total\n * function. Absent values are excluded, so a custom reduction never has to\n * repeat the null handling the built-ins already do.\n *\n * @param {object} handle the column handle\n * @param {Uint32Array|ArrayLike<number>} indices the rows to read\n * @returns {unknown[]} the present logical values, in row order\n */\n function collectValues(handle, indices) {\n  const read = valueReader(handle);\n  const out = [];\n  for (let i = 0; i < indices.length; i++) {\n    const v = read(indices[i]);\n    if (v === null || v === undefined) continue;\n    out.push(v);\n  }\n  return out;\n}\n\n/**\n * Reduce over an index list, reading the typed column directly (§9.4).\n *\n * @param {object} handle the column handle to reduce\n * @param {Uint32Array|ArrayLike<number>} indices the rows in the group\n * @param {string|Function} fn a built-in name, a kernel reduction from\n *        {@link TOTAL_FNS}, or a user `TotalFn` of the form `(values, ctx)`\n * @param {{locale?: string, row?: unknown, column?: unknown, grid?: unknown,\n *          context?: unknown}} [ctx] passed through to user total functions\n * @returns {unknown} the reduced value, or null when the reduction is unknown\n */\n function total(handle, indices, fn, ctx) {\n  const list = indices || [];\n  if (typeof fn === 'string') {\n    const kernel = TOTAL_FNS[fn];\n    if (!kernel) {\n      warnOnce(`total:${fn}`, `unknown total function \"${fn}\"; register it in config.totalFns`);\n      return null;\n    }\n    return kernel(handle, list, ctx);\n  }\n  if (isFunction(fn)) {\n    if (fn.kernel === true) return fn(handle, list, ctx);\n    return fn(collectValues(handle, list), ctx || {});\n  }\n  return null;\n}\n\n});\n\n__def(\"packages/core/src/compute/pivot.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"KEY_DELIMITER\", { enumerable: true, get: function () { return KEY_DELIMITER; } });\n  Object.defineProperty(__exports, \"DEFAULT_PATH_SEPARATOR\", { enumerable: true, get: function () { return DEFAULT_PATH_SEPARATOR; } });\n  Object.defineProperty(__exports, \"DEFAULT_MAX_COLUMNS\", { enumerable: true, get: function () { return DEFAULT_MAX_COLUMNS; } });\n  Object.defineProperty(__exports, \"pivotKey\", { enumerable: true, get: function () { return pivotKey; } });\n  Object.defineProperty(__exports, \"joinPath\", { enumerable: true, get: function () { return joinPath; } });\n  Object.defineProperty(__exports, \"resolvePivotKeys\", { enumerable: true, get: function () { return resolvePivotKeys; } });\n  Object.defineProperty(__exports, \"pivot\", { enumerable: true, get: function () { return pivot; } });\n  const __m0 = __req(\"packages/core/src/internal/util.js\");\n  const warnOnce = __m0[\"warnOnce\"];\n  const __m1 = __req(\"packages/core/src/compute/handle.js\");\n  const valueComparator = __m1[\"valueComparator\"];\n  const __m2 = __req(\"packages/core/src/compute/group.js\");\n  const packKeys = __m2[\"packKeys\"];\n  const __m3 = __req(\"packages/core/src/compute/total.js\");\n  const total = __m3[\"total\"];\n/**\n * Pivot kernel (§10).\n *\n * Pivot transposes value columns across the distinct value combinations of one\n * or more pivot columns. Two properties of the local pivot matter here:\n *\n * - **Key resolution uses dictionary codes**, so building a pivot key is\n *   integer concatenation rather than a string join (§10 performance note).\n *   `packKeys` in `group.js` supplies exactly that, falling back to a delimited\n *   string only when the columns are not dictionary-backed.\n * - **The result is sparse**, a map keyed by `groupPath|pivotPath|colId`. A\n *   pivot over a hundred groups and fifty pivot keys where only a tenth of the\n *   cells exist stores a tenth of the cells.\n *\n * `maxColumns` is a guard, not an optimisation: exceeding it returns an error\n * state and no values, rather than generating a column tree that locks up the\n * browser (§10).\n */\n\n\n\n\n\n\n/** Field delimiter of the result map key: `groupPath|pivotPath|colId` (§10). */\n const KEY_DELIMITER = '|';\n/** Default separator between the segments of a group or pivot path. */\n const DEFAULT_PATH_SEPARATOR = '/';\n/** Default `pivot.maxColumns` guard. */\n const DEFAULT_MAX_COLUMNS = 2000;\n\n/**\n * Build the sparse result key for one cell. Exported so callers construct the\n * same key the kernel wrote rather than reimplementing the format (§10).\n *\n * @param {string} groupPath the row group path, empty for the grand total row\n * @param {string} pivotPath the pivot key path\n * @param {string} colId the value column id\n * @returns {string} the map key\n */\n function pivotKey(groupPath, pivotPath, colId) {\n  return `${groupPath}${KEY_DELIMITER}${pivotPath}${KEY_DELIMITER}${colId}`;\n}\n\n/**\n * Join key segments into a path string.\n *\n * @param {unknown[]} parts the key tuple\n * @param {string} separator the segment separator\n * @returns {string} the joined path\n */\n function joinPath(parts, separator) {\n  let out = '';\n  for (let i = 0; i < parts.length; i++) {\n    const v = parts[i];\n    out += (i === 0 ? '' : separator) + (v === null || v === undefined ? '' : String(v));\n  }\n  return out;\n}\n\n/**\n * Resolve the distinct pivot key combinations over a set of rows (§10).\n *\n * Keys are built through `packKeys`, so for dictionary-backed pivot columns the\n * per-row key is an integer and the distinct set is a `Map` of numbers. The\n * resulting keys are ordered with the shared collator so pivot columns appear\n * in a natural order for the user; that sort runs over the distinct count, not\n * the row count.\n *\n * @param {object[]} handles the pivot columns, most significant first\n * @param {Uint32Array} order the rows in scope\n * @param {{locale?: string, separator?: string}} [opts] resolution options\n * @returns {{keys: unknown[][], paths: string[], idOf: (row: number) => number}}\n *          the distinct key tuples, their path strings, and a row-to-key-id map\n */\n function resolvePivotKeys(handles, order, opts = {}) {\n  const separator = opts.separator || DEFAULT_PATH_SEPARATOR;\n  const n = order.length;\n  // Zero rows asked for by position: `keyOf` and the value readers are what\n  // matter here, and building a parallel key array would duplicate the pass\n  // this function already makes.\n  const { keyOf, readers } = packKeys(handles, order, 0);\n\n  const seen = new Map();\n  const tuples = [];\n  const rawKeys = [];\n  for (let i = 0; i < n; i++) {\n    const row = order[i];\n    const key = keyOf(row);\n    if (seen.has(key)) continue;\n    seen.set(key, tuples.length);\n    rawKeys.push(key);\n    const tuple = new Array(readers.length);\n    for (let j = 0; j < readers.length; j++) tuple[j] = readers[j](row);\n    tuples.push(tuple);\n  }\n\n  // Order the pivot columns for display. Distinct count is small by\n  // construction — a pivot with thousands of columns is refused below.\n  const cmp = valueComparator(opts.locale);\n  const rank = tuples.map((_, i) => i);\n  rank.sort((a, b) => {\n    const ta = tuples[a];\n    const tb = tuples[b];\n    for (let j = 0; j < ta.length; j++) {\n      const c = compareNullable(ta[j], tb[j], cmp);\n      if (c !== 0) return c;\n    }\n    return a - b;\n  });\n\n  const keys = new Array(rank.length);\n  const paths = new Array(rank.length);\n  const idByKey = new Map();\n  for (let position = 0; position < rank.length; position++) {\n    const from = rank[position];\n    keys[position] = tuples[from];\n    paths[position] = joinPath(tuples[from], separator);\n    idByKey.set(rawKeys[from], position);\n  }\n\n  /**\n   * Pivot key id for one row.\n   * @param {number} row the physical row index\n   * @returns {number} the key id, or -1 when the row was not in scope\n   */\n  const idOf = (row) => {\n    const id = idByKey.get(keyOf(row));\n    return id === undefined ? -1 : id;\n  };\n\n  return { keys, paths, idOf };\n}\n\n/**\n * Compare two key segments, placing absent values last regardless of direction\n * (§5.3 applies to pivot headings as much as to rows).\n *\n * @param {unknown} a left value\n * @param {unknown} b right value\n * @param {(x: unknown, y: unknown) => number} cmp the shared comparator\n * @returns {number} negative, zero or positive\n */\nfunction compareNullable(a, b, cmp) {\n  const na = a === null || a === undefined;\n  const nb = b === null || b === undefined;\n  if (na || nb) return na && nb ? 0 : na ? 1 : -1;\n  return cmp(a, b);\n}\n\n/**\n * Resolve the value columns a pivot reduces, accepting either fully described\n * entries or the column ids a source holds plus a resolver.\n *\n * @param {object} opts the pivot options\n * @returns {{colId: string, handle: object, fn: string|Function}[]} the value columns\n */\nfunction resolveValueColumns(opts) {\n  const declared = opts.values || opts.totals || [];\n  if (declared.length && typeof declared[0] === 'object' && declared[0] !== null) {\n    return declared.filter((entry) => entry && entry.handle);\n  }\n  const resolve = typeof opts.handle === 'function' ? opts.handle : null;\n  if (!resolve) {\n    if (declared.length) {\n      warnOnce('pivot:handles',\n        'pivot was given total column ids but no handle(colId) resolver, so no cell values were reduced. Pass values: [{ colId, handle, fn }] or opts.handle.');\n    }\n    return [];\n  }\n  const totalOf = typeof opts.totalOf === 'function' ? opts.totalOf : null;\n  const out = [];\n  for (const colId of declared) {\n    const handle = resolve(colId);\n    if (!handle) continue;\n    out.push({ colId, handle, fn: totalOf ? totalOf(colId) : 'sum' });\n  }\n  return out;\n}\n\n/**\n * Normalise the two call shapes of {@link pivot}: a single options object, or\n * the positional `(pivotHandles, order, opts)` form the memory source uses.\n *\n * @param {object|object[]} a options, or the pivot handles\n * @param {Uint32Array|object} [b] the rows in scope, in the positional form\n * @param {object} [c] options, in the positional form\n * @returns {object} the normalised options\n */\nfunction normaliseArgs(a, b, c) {\n  if (Array.isArray(a)) {\n    const opts = c || {};\n    return { ...opts, pivotHandles: a, order: b || null, groups: opts.groups || null };\n  }\n  return a || {};\n}\n\n/**\n * Compute a local pivot (§10): distinct pivot keys, then one reduction per\n * occupied `(group, pivot key, value column)` cell.\n *\n * Each group's rows are partitioned by pivot key id with a counting pass — the\n * same shape as the grouping kernel — so no cell is visited twice and empty\n * cells are never materialised.\n *\n * Two call shapes are accepted: a single options object, or\n * `pivot(pivotHandles, order, opts)`.\n *\n * @param {{groups?: {keys: unknown[][], buckets: Uint32Array[]}|null,\n *          groupPaths?: string[], order?: Uint32Array|null,\n *          pivotHandles?: object[],\n *          values?: {colId: string, handle: object, fn: string|Function}[]|string[],\n *          totals?: string[], handle?: (colId: string) => object|undefined,\n *          totalOf?: (colId: string) => string|Function,\n *          maxColumns?: number, separator?: string, locale?: string,\n *          totalContext?: object}|object[]} input pivot inputs, or the pivot handles\n * @param {Uint32Array} [orderArg] the rows in scope, in the positional form\n * @param {object} [optsArg] options, in the positional form\n * @returns {{keys: unknown[][], paths: string[], fields: string[], groupPaths: string[],\n *            columns: number, values: Map<string, unknown>, cells: Map<string, unknown>,\n *            error: {code: string, message: string, columns: number, maxColumns: number}|null}}\n *          the pivot key axis, the derived field names, the sparse cell map,\n *          and the guard's error state\n */\n function pivot(input, orderArg, optsArg) {\n  const opts = normaliseArgs(input, orderArg, optsArg);\n  const separator = opts.separator || DEFAULT_PATH_SEPARATOR;\n  const valueColumns = resolveValueColumns(opts);\n  const maxColumns = opts.maxColumns === undefined ? DEFAULT_MAX_COLUMNS : opts.maxColumns;\n\n  const groups = opts.groups && opts.groups.buckets ? opts.groups : null;\n  const buckets = groups ? groups.buckets : [opts.order || new Uint32Array(0)];\n  const groupPaths = opts.groupPaths\n    || (groups ? groups.keys.map((tuple) => joinPath(tuple, separator)) : ['']);\n\n  const scope = concatIndices(buckets);\n  const { keys, paths, idOf } = resolvePivotKeys(opts.pivotHandles || [], scope, opts);\n\n  const columns = paths.length * Math.max(1, valueColumns.length);\n  const fields = derivedFields(paths, valueColumns, separator);\n  if (maxColumns && columns > maxColumns) {\n    // Refuse before generating the column tree or reducing a single cell (§10).\n    const empty = new Map();\n    return {\n      keys,\n      paths,\n      fields,\n      groupPaths,\n      columns,\n      values: empty,\n      cells: empty,\n      error: {\n        code: 'pivot-max-columns',\n        message: `[lattice] pivot would generate ${columns} columns, above pivot.maxColumns of ${maxColumns}. Narrow the pivot columns or raise the limit.`,\n        columns,\n        maxColumns,\n      },\n    };\n  }\n\n  const cells = new Map();\n  const keyCount = paths.length;\n\n  for (let g = 0; g < buckets.length; g++) {\n    const bucket = buckets[g];\n    const groupPath = groupPaths[g] === undefined ? '' : groupPaths[g];\n    const n = bucket.length;\n    if (n === 0) continue;\n\n    // Counting sort of the group's rows by pivot key id: count, prefix sum,\n    // scatter — the same three passes as §5.8, reused per group.\n    const ids = new Int32Array(n);\n    const counts = new Uint32Array(keyCount + 1);\n    for (let i = 0; i < n; i++) {\n      const id = idOf(bucket[i]);\n      ids[i] = id;\n      if (id >= 0) counts[id + 1]++;\n    }\n    for (let k = 0; k < keyCount; k++) counts[k + 1] += counts[k];\n    const scattered = new Uint32Array(n);\n    const cursor = counts.slice(0, keyCount);\n    for (let i = 0; i < n; i++) {\n      const id = ids[i];\n      if (id >= 0) scattered[cursor[id]++] = bucket[i];\n    }\n\n    for (let k = 0; k < keyCount; k++) {\n      const from = counts[k];\n      const to = counts[k + 1];\n      if (to === from) continue; // sparse: an empty cell is simply absent\n      const slice = scattered.subarray(from, to);\n      for (let c = 0; c < valueColumns.length; c++) {\n        const column = valueColumns[c];\n        const result = total(column.handle, slice, column.fn, opts.totalContext || { locale: opts.locale });\n        cells.set(pivotKey(groupPath, paths[k], column.colId), result);\n      }\n    }\n  }\n\n  return { keys, paths, fields, groupPaths, columns, values: cells, cells, error: null };\n}\n\n/**\n * The derived leaf column names of a pivot: one per pivot path per value\n * column, joined with the same separator the paths use. A remote pivot returns\n * these directly as `pivotFields`, so a local pivot must produce the same\n * spelling for the column tree to be built by one code path (§10).\n *\n * @param {string[]} paths the pivot key paths\n * @param {{colId: string}[]} valueColumns the totalled columns\n * @param {string} separator the segment separator\n * @returns {string[]} the derived field names\n */\nfunction derivedFields(paths, valueColumns, separator) {\n  if (valueColumns.length === 0) return paths.slice();\n  const out = [];\n  for (const path of paths) {\n    for (const column of valueColumns) out.push(`${path}${separator}${column.colId}`);\n  }\n  return out;\n}\n\n/**\n * Concatenate bucket index lists into a single scope array.\n * @param {Uint32Array[]} buckets the per-group index lists\n * @returns {Uint32Array} every row in scope, group by group\n */\nfunction concatIndices(buckets) {\n  if (buckets.length === 1) return buckets[0] || new Uint32Array(0);\n  let n = 0;\n  for (const b of buckets) n += b ? b.length : 0;\n  const out = new Uint32Array(n);\n  let at = 0;\n  for (const b of buckets) {\n    if (!b || b.length === 0) continue;\n    out.set(b, at);\n    at += b.length;\n  }\n  return out;\n}\n\n});\n\n__def(\"packages/core/src/compute/reference.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"referenceValue\", { enumerable: true, get: function () { return referenceValue; } });\n  Object.defineProperty(__exports, \"referenceSort\", { enumerable: true, get: function () { return referenceSort; } });\n  Object.defineProperty(__exports, \"referenceFilter\", { enumerable: true, get: function () { return referenceFilter; } });\n  Object.defineProperty(__exports, \"referencePasses\", { enumerable: true, get: function () { return referencePasses; } });\n  Object.defineProperty(__exports, \"referenceGroup\", { enumerable: true, get: function () { return referenceGroup; } });\n  Object.defineProperty(__exports, \"referenceTotal\", { enumerable: true, get: function () { return referenceTotal; } });\n  const __m0 = __req(\"packages/core/src/internal/util.js\");\n  const getPath = __m0[\"getPath\"];\n  const __m1 = __req(\"packages/core/src/compute/handle.js\");\n  const isMissing = __m1[\"isMissing\"];\n  const valueComparator = __m1[\"valueComparator\"];\n  const __m2 = __req(\"packages/core/src/compute/filter.js\");\n  const testValue = __m2[\"testValue\"];\n/**\n * Naive reference implementations of sort, filter, group and total over plain\n * row objects.\n *\n * This is the oracle the fuzz tests compare the kernels against, and it is\n * required by the §5.14 acceptance criteria: \"sort, filter, group and total\n * kernels produce output identical to a naive reference implementation under\n * randomised fuzzing, including nulls, `NaN`, mixed-case text and\n * locale-sensitive collation\".\n *\n * It is deliberately the obvious implementation — `Array.prototype.sort` with a\n * composed comparator, a `Map` for grouping, a `for` loop for totals. Nothing\n * here is clever and nothing here should become clever. It is also useful in\n * production for non-columnar sources, which have row objects and no buffers.\n *\n * The three behaviours the kernels define, mirrored here so the two agree:\n *\n * - null, undefined and `NaN` are placed by `nullsFirst` in both directions\n *   rather than compared (§5.3);\n * - `-0` sorts before `+0`, because the radix path orders by bit pattern\n *   (§5.14);\n * - negated filter operators are exact negations of their positive form.\n */\n\n\n\n\n\n/** Separator for the reference group key; a unit separator, never in real text. */\nconst KEY_SEPARATOR = String.fromCharCode(0x1f);\n/** Marker for an absent group key segment. */\nconst NULL_MARKER = String.fromCharCode(0x00);\n\n/**\n * Read one column's value from a plain row object, honouring dot paths.\n *\n * @param {object} row the row object\n * @param {string} col the column id or dot path\n * @returns {unknown} the value, normalised so undefined reads as null\n */\n function referenceValue(row, col) {\n  const v = col.includes('.') ? getPath(row, col) : (row == null ? undefined : row[col]);\n  return v === undefined ? null : v;\n}\n\n/**\n * Naive stable sort producing a display->physical permutation.\n *\n * Missing values are partitioned out first, exactly as the kernels do, then the\n * present rows are sorted with a comparator composed over every entry and tied\n * on the original index to force stability.\n *\n * @param {object[]} rows the row objects\n * @param {{col: string, descending?: boolean, nullsFirst?: boolean,\n *          compare?: Function, locale?: string}[]} entries sort entries, most significant first\n * @param {{locale?: string}} [opts] shared options\n * @returns {number[]} the sorted row indices\n */\n function referenceSort(rows, entries, opts = {}) {\n  const list = entries || [];\n  let order = rows.map((_, i) => i);\n  if (list.length === 0) return order;\n\n  // Applying the entries least significant first mirrors the kernel's\n  // multi-pass structure; each pass here is a full stable sort on one column.\n  for (let e = list.length - 1; e >= 0; e--) {\n    order = referenceSortOne(rows, order, list[e], opts);\n  }\n  return order;\n}\n\n/**\n * One stable pass of the reference sort over a single column.\n *\n * @param {object[]} rows the row objects\n * @param {number[]} order the current order\n * @param {{col: string, descending?: boolean, nullsFirst?: boolean,\n *          compare?: Function, locale?: string}} entry the sort entry\n * @param {{locale?: string}} opts shared options\n * @returns {number[]} the reordered indices\n */\nfunction referenceSortOne(rows, order, entry, opts) {\n  const locale = entry.locale !== undefined ? entry.locale : opts.locale;\n  const base = valueComparator(locale);\n  const descending = entry.descending !== undefined ? !!entry.descending : entry.dir === 'desc';\n  const present = [];\n  const absent = [];\n\n  for (const i of order) {\n    const v = referenceValue(rows[i], entry.col);\n    if (isMissing(v)) absent.push(i); else present.push(i);\n  }\n\n  const position = new Map();\n  for (let p = 0; p < present.length; p++) position.set(present[p], p);\n\n  /**\n   * Compare two row indices, tied on their position before the sort so the\n   * pass is stable.\n   * @param {number} a left row index\n   * @param {number} b right row index\n   * @returns {number} negative, zero or positive\n   */\n  const compare = (a, b) => {\n    const va = referenceValue(rows[a], entry.col);\n    const vb = referenceValue(rows[b], entry.col);\n    let c;\n    if (typeof entry.compare === 'function') {\n      c = entry.compare(va, vb, rows[a], rows[b], descending);\n      if (descending) c = -c;\n    } else {\n      c = descending ? base(vb, va) : base(va, vb);\n    }\n    return c !== 0 ? c : position.get(a) - position.get(b);\n  };\n\n  present.sort(compare);\n  return entry.nullsFirst ? absent.concat(present) : present.concat(absent);\n}\n\n/**\n * Naive filter: walk the condition tree once per row (§9.3).\n *\n * @param {object[]} rows the row objects\n * @param {object|null} filters the `FilterSet`\n * @param {{locale?: string, custom?(condition: object, row: object, i: number): boolean}} [opts]\n *        evaluation options\n * @returns {number[]} the surviving row indices, ascending\n */\n function referenceFilter(rows, filters, opts = {}) {\n  const out = [];\n  for (let i = 0; i < rows.length; i++) {\n    if (referencePasses(rows[i], filters, opts, i)) out.push(i);\n  }\n  return out;\n}\n\n/**\n * Does one row satisfy a condition tree?\n *\n * @param {object} row the row object\n * @param {object|null} node a `Group`, a `Condition`, or null\n * @param {{locale?: string, custom?(condition: object, row: object, i: number): boolean}} opts\n *        evaluation options\n * @param {number} index the row's index, passed to a custom evaluator\n * @returns {boolean} true when the row passes\n */\n function referencePasses(row, node, opts, index) {\n  if (!node) return true;\n  if (Array.isArray(node.conditions)) {\n    const children = node.conditions.filter((c) => c != null);\n    if (children.length === 0) return true;\n    if (node.op === 'or') return children.some((c) => referencePasses(row, c, opts, index));\n    const all = children.every((c) => referencePasses(row, c, opts, index));\n    return node.op === 'not' ? !all : all;\n  }\n  if (node.col === undefined && typeof opts.custom === 'function') return !!opts.custom(node, row, index);\n  return testValue(referenceValue(row, node.col), node, opts.locale);\n}\n\n/**\n * Naive grouping: a `Map` keyed on the joined key values, in first-appearance\n * order.\n *\n * @param {object[]} rows the row objects\n * @param {string[]} cols the column ids to group by, most significant first\n * @param {number[]|Uint32Array} [order] the rows to group; all rows by default\n * @returns {{keys: unknown[][], buckets: number[][]}} the group keys and index lists\n */\n function referenceGroup(rows, cols, order) {\n  const source = order || rows.map((_, i) => i);\n  const seen = new Map();\n  const keys = [];\n  const buckets = [];\n  for (const i of source) {\n    const tuple = cols.map((col) => referenceValue(rows[i], col));\n    const key = tuple\n      .map((v) => (v === null || v === undefined ? NULL_MARKER : String(v)))\n      .join(KEY_SEPARATOR);\n    let at = seen.get(key);\n    if (at === undefined) {\n      at = keys.length;\n      seen.set(key, at);\n      keys.push(tuple);\n      buckets.push([]);\n    }\n    buckets[at].push(i);\n  }\n  return { keys, buckets };\n}\n\n/**\n * Naive totals over an array of logical values (§9.4). Absent values and `NaN`\n * are skipped by the numeric reductions, matching the kernels.\n *\n * @param {unknown[]} values the group's values, including absent ones\n * @param {string} fn the built-in reduction name\n * @param {{locale?: string}} [opts] options, notably the collation locale\n * @returns {unknown} the reduced value\n */\n function referenceTotal(values, fn, opts = {}) {\n  const cmp = valueComparator(opts.locale);\n  const live = values.filter((v) => !isMissing(v));\n  const numbers = live.map(toNumberOrNull).filter((v) => v !== null);\n\n  switch (fn) {\n    case 'count': return values.length;\n    case 'countValues': return live.length;\n    case 'sum': return numbers.reduce((a, b) => a + b, 0);\n    case 'avg': return live.length === 0 ? null : numbers.reduce((a, b) => a + b, 0) / live.length;\n    case 'min': return live.length === 0 ? null : live.reduce((a, b) => (cmp(b, a) < 0 ? b : a));\n    case 'max': return live.length === 0 ? null : live.reduce((a, b) => (cmp(b, a) > 0 ? b : a));\n    case 'first': return values.length === 0 ? null : normaliseNull(values[0]);\n    case 'last': return values.length === 0 ? null : normaliseNull(values[values.length - 1]);\n    default: return null;\n  }\n}\n\n/**\n * Numeric view of a value, or null when it has none.\n * @param {unknown} v the value\n * @returns {number|null} the number\n */\nfunction toNumberOrNull(v) {\n  if (typeof v === 'number') return Number.isNaN(v) ? null : v;\n  if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null;\n  if (v instanceof Date) return v.getTime();\n  const n = Number(v);\n  return Number.isNaN(n) ? null : n;\n}\n\n/**\n * Normalise undefined to null so reference output compares equal to kernel\n * output, where an absent value is always null.\n * @param {unknown} v the value\n * @returns {unknown} the value, with undefined replaced by null\n */\nfunction normaliseNull(v) {\n  return v === undefined ? null : v;\n}\n\n});\n\n__def(\"packages/core/src/compute/index.js\", function (__exports, __req) {\n  'use strict';\n  const __m0 = __req(\"packages/core/src/compute/sort.js\");\n  Object.defineProperty(__exports, \"sortColumn\", { enumerable: true, get: function () { return __m0[\"sortColumn\"]; } });\n  Object.defineProperty(__exports, \"sortMulti\", { enumerable: true, get: function () { return __m0[\"sortMulti\"]; } });\n  Object.defineProperty(__exports, \"radixSortFloat64\", { enumerable: true, get: function () { return __m0[\"radixSortFloat64\"]; } });\n  Object.defineProperty(__exports, \"radixSortInt32\", { enumerable: true, get: function () { return __m0[\"radixSortInt32\"]; } });\n  Object.defineProperty(__exports, \"rankSortDictionary\", { enumerable: true, get: function () { return __m0[\"rankSortDictionary\"]; } });\n  Object.defineProperty(__exports, \"mergeSortComparator\", { enumerable: true, get: function () { return __m0[\"mergeSortComparator\"]; } });\n  const __m1 = __req(\"packages/core/src/compute/filter.js\");\n  Object.defineProperty(__exports, \"evaluateFilters\", { enumerable: true, get: function () { return __m1[\"evaluateFilters\"]; } });\n  Object.defineProperty(__exports, \"evaluateCondition\", { enumerable: true, get: function () { return __m1[\"evaluateCondition\"]; } });\n  Object.defineProperty(__exports, \"compact\", { enumerable: true, get: function () { return __m1[\"compact\"]; } });\n  Object.defineProperty(__exports, \"testValue\", { enumerable: true, get: function () { return __m1[\"testValue\"]; } });\n  Object.defineProperty(__exports, \"compilePredicate\", { enumerable: true, get: function () { return __m1[\"compilePredicate\"]; } });\n  Object.defineProperty(__exports, \"releaseMask\", { enumerable: true, get: function () { return __m1[\"releaseMask\"]; } });\n  Object.defineProperty(__exports, \"pruneColumn\", { enumerable: true, get: function () { return __m1[\"pruneColumn\"]; } });\n  Object.defineProperty(__exports, \"mentionsColumn\", { enumerable: true, get: function () { return __m1[\"mentionsColumn\"]; } });\n  const __m2 = __req(\"packages/core/src/compute/group.js\");\n  Object.defineProperty(__exports, \"groupByColumns\", { enumerable: true, get: function () { return __m2[\"groupByColumns\"]; } });\n  Object.defineProperty(__exports, \"packKeys\", { enumerable: true, get: function () { return __m2[\"packKeys\"]; } });\n  const __m3 = __req(\"packages/core/src/compute/facet.js\");\n  Object.defineProperty(__exports, \"facet\", { enumerable: true, get: function () { return __m3[\"facet\"]; } });\n  Object.defineProperty(__exports, \"computeBounds\", { enumerable: true, get: function () { return __m3[\"computeBounds\"]; } });\n  Object.defineProperty(__exports, \"countInto\", { enumerable: true, get: function () { return __m3[\"countInto\"]; } });\n  Object.defineProperty(__exports, \"bucketOf\", { enumerable: true, get: function () { return __m3[\"bucketOf\"]; } });\n  Object.defineProperty(__exports, \"facetKind\", { enumerable: true, get: function () { return __m3[\"facetKind\"]; } });\n  Object.defineProperty(__exports, \"cardinalityOf\", { enumerable: true, get: function () { return __m3[\"cardinalityOf\"]; } });\n  Object.defineProperty(__exports, \"pickGranularity\", { enumerable: true, get: function () { return __m3[\"pickGranularity\"]; } });\n  Object.defineProperty(__exports, \"floorTo\", { enumerable: true, get: function () { return __m3[\"floorTo\"]; } });\n  Object.defineProperty(__exports, \"advance\", { enumerable: true, get: function () { return __m3[\"advance\"]; } });\n  Object.defineProperty(__exports, \"STRATEGIES\", { enumerable: true, get: function () { return __m3[\"STRATEGIES\"]; } });\n  Object.defineProperty(__exports, \"GRANULARITIES\", { enumerable: true, get: function () { return __m3[\"GRANULARITIES\"]; } });\n  Object.defineProperty(__exports, \"DEFAULT_BUCKETS\", { enumerable: true, get: function () { return __m3[\"DEFAULT_BUCKETS\"]; } });\n  Object.defineProperty(__exports, \"DEFAULT_CARDINALITY_LIMIT\", { enumerable: true, get: function () { return __m3[\"DEFAULT_CARDINALITY_LIMIT\"]; } });\n  Object.defineProperty(__exports, \"QUANTILE_SAMPLE\", { enumerable: true, get: function () { return __m3[\"QUANTILE_SAMPLE\"]; } });\n  const __m4 = __req(\"packages/core/src/compute/total.js\");\n  Object.defineProperty(__exports, \"TOTAL_FNS\", { enumerable: true, get: function () { return __m4[\"TOTAL_FNS\"]; } });\n  Object.defineProperty(__exports, \"TOTAL_LABELS\", { enumerable: true, get: function () { return __m4[\"TOTAL_LABELS\"]; } });\n  Object.defineProperty(__exports, \"totalLabel\", { enumerable: true, get: function () { return __m4[\"totalLabel\"]; } });\n  Object.defineProperty(__exports, \"total\", { enumerable: true, get: function () { return __m4[\"total\"]; } });\n  Object.defineProperty(__exports, \"collectValues\", { enumerable: true, get: function () { return __m4[\"collectValues\"]; } });\n  const __m5 = __req(\"packages/core/src/compute/pivot.js\");\n  Object.defineProperty(__exports, \"pivot\", { enumerable: true, get: function () { return __m5[\"pivot\"]; } });\n  Object.defineProperty(__exports, \"resolvePivotKeys\", { enumerable: true, get: function () { return __m5[\"resolvePivotKeys\"]; } });\n  Object.defineProperty(__exports, \"pivotKey\", { enumerable: true, get: function () { return __m5[\"pivotKey\"]; } });\n  Object.defineProperty(__exports, \"joinPath\", { enumerable: true, get: function () { return __m5[\"joinPath\"]; } });\n  Object.defineProperty(__exports, \"KEY_DELIMITER\", { enumerable: true, get: function () { return __m5[\"KEY_DELIMITER\"]; } });\n  Object.defineProperty(__exports, \"DEFAULT_PATH_SEPARATOR\", { enumerable: true, get: function () { return __m5[\"DEFAULT_PATH_SEPARATOR\"]; } });\n  Object.defineProperty(__exports, \"DEFAULT_MAX_COLUMNS\", { enumerable: true, get: function () { return __m5[\"DEFAULT_MAX_COLUMNS\"]; } });\n  const __m6 = __req(\"packages/core/src/compute/reference.js\");\n  Object.defineProperty(__exports, \"referenceSort\", { enumerable: true, get: function () { return __m6[\"referenceSort\"]; } });\n  Object.defineProperty(__exports, \"referenceFilter\", { enumerable: true, get: function () { return __m6[\"referenceFilter\"]; } });\n  Object.defineProperty(__exports, \"referenceGroup\", { enumerable: true, get: function () { return __m6[\"referenceGroup\"]; } });\n  Object.defineProperty(__exports, \"referenceTotal\", { enumerable: true, get: function () { return __m6[\"referenceTotal\"]; } });\n  Object.defineProperty(__exports, \"referencePasses\", { enumerable: true, get: function () { return __m6[\"referencePasses\"]; } });\n  Object.defineProperty(__exports, \"referenceValue\", { enumerable: true, get: function () { return __m6[\"referenceValue\"]; } });\n  const __m7 = __req(\"packages/core/src/compute/handle.js\");\n  Object.defineProperty(__exports, \"identity\", { enumerable: true, get: function () { return __m7[\"identity\"]; } });\n  Object.defineProperty(__exports, \"rowCount\", { enumerable: true, get: function () { return __m7[\"rowCount\"]; } });\n  Object.defineProperty(__exports, \"presenceReader\", { enumerable: true, get: function () { return __m7[\"presenceReader\"]; } });\n  Object.defineProperty(__exports, \"bitReader\", { enumerable: true, get: function () { return __m7[\"bitReader\"]; } });\n  Object.defineProperty(__exports, \"valueReader\", { enumerable: true, get: function () { return __m7[\"valueReader\"]; } });\n  Object.defineProperty(__exports, \"valueComparator\", { enumerable: true, get: function () { return __m7[\"valueComparator\"]; } });\n  Object.defineProperty(__exports, \"numericTotalOrder\", { enumerable: true, get: function () { return __m7[\"numericTotalOrder\"]; } });\n  Object.defineProperty(__exports, \"dictRanks\", { enumerable: true, get: function () { return __m7[\"dictRanks\"]; } });\n  Object.defineProperty(__exports, \"dictSize\", { enumerable: true, get: function () { return __m7[\"dictSize\"]; } });\n  Object.defineProperty(__exports, \"dictValue\", { enumerable: true, get: function () { return __m7[\"dictValue\"]; } });\n  Object.defineProperty(__exports, \"multiValue\", { enumerable: true, get: function () { return __m7[\"multiValue\"]; } });\n  Object.defineProperty(__exports, \"isMissing\", { enumerable: true, get: function () { return __m7[\"isMissing\"]; } });\n/**\n * Compute kernels barrel (§5.6–5.8, §9, §10).\n *\n * Every export is a pure function over `ColumnHandle`s and index arrays: no\n * grid, no config object, no DOM. That is what lets the Worker path (§5.13) run\n * exactly the same code as the main thread — the surface below is also the\n * surface the Worker exposes, and the object a `SourceContext.compute` is built\n * from.\n */\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n});\n\n__def(\"packages/worker/src/kernel.js\", function (__exports, __req) {\n  'use strict';\n  Object.defineProperty(__exports, \"loadCompute\", { enumerable: true, get: function () { return loadCompute; } });\n  Object.defineProperty(__exports, \"setCompute\", { enumerable: true, get: function () { return setCompute; } });\n  Object.defineProperty(__exports, \"dispatch\", { enumerable: true, get: function () { return dispatch; } });\n  Object.defineProperty(__exports, \"handleMessage\", { enumerable: true, get: function () { return handleMessage; } });\n  Object.defineProperty(__exports, \"installKernel\", { enumerable: true, get: function () { return installKernel; } });\n  const __m0 = __req(\"packages/worker/src/transport.js\");\n  const PROTOCOL = __m0[\"PROTOCOL\"];\n  const OPS = __m0[\"OPS\"];\n  const CONTROL = __m0[\"CONTROL\"];\n  const ERRORS = __m0[\"ERRORS\"];\n  const unpackHandle = __m0[\"unpackHandle\"];\n  const unpackHandles = __m0[\"unpackHandles\"];\n  const createMaskPool = __m0[\"createMaskPool\"];\n  const collectTransfers = __m0[\"collectTransfers\"];\n/**\n * Worker-side message loop (§5.13).\n *\n * This module *hosts* the compute kernels; it does not reimplement them. There\n * is one implementation of sort, filter, group and total, and it runs either on\n * the main thread or here — that is the whole design rule of §5.13.\n *\n * The compute module is imported dynamically so that a Worker booted before\n * `packages/core/src/compute/**` exists still starts, answers `ready` with\n * `compute: false`, and reports `E_NO_COMPUTE` per request. The host then falls\n * back to local execution instead of hanging.\n *\n * Nothing here touches the DOM or `self` at module scope, so the module imports\n * cleanly in Node and the dispatcher is unit-testable without a Worker.\n */\n\n\n\n/** Resolved compute module, or null when it could not be imported. */\nlet computeModule = null;\n/** In-flight import promise, so concurrent messages share one import. */\nlet computePromise = null;\n/** Why the import failed, kept for the error message. */\nlet computeError = null;\n\n/**\n * Import the compute kernels, once, tolerating their absence.\n *\n * @param {(() => Promise<object>)} [loader] override used by tests to inject a\n *   stub compute module instead of the real one\n * @returns {Promise<object|null>} the compute module, or null when unavailable\n */\n async function loadCompute(loader) {\n  if (computeModule) return computeModule;\n  if (!computePromise) {\n    const load = loader || (() => Promise.resolve(__req(\"packages/core/src/compute/index.js\")));\n    computePromise = Promise.resolve()\n      .then(load)\n      .then((mod) => { computeModule = mod; return mod; })\n      .catch((err) => {\n        computeError = err;\n        computeModule = null;\n        return null;\n      });\n  }\n  return computePromise;\n}\n\n/**\n * Replace the cached compute module. Tests use this to inject a stub; the\n * production path never calls it.\n *\n * @param {object|null} mod a module exposing the CONTRACTS §3 kernels\n * @returns {void}\n */\n function setCompute(mod) {\n  computeModule = mod;\n  computePromise = mod ? Promise.resolve(mod) : null;\n  computeError = mod ? null : computeError;\n}\n\n/**\n * Build the `ctx` object the filter kernel expects (CONTRACTS §3), from the\n * columns that were transported for this request.\n *\n * @param {Array<object|null>} handles unpacked handles, in request order\n * @param {number} count row count\n * @param {string|undefined} locale BCP-47 locale tag\n * @returns {{handle(colId:string):object|undefined, count:number,\n *            pool:object, locale:string|undefined}} a filter context\n */\nfunction filterContext(handles, count, locale) {\n  const byId = new Map();\n  for (const h of handles) if (h) byId.set(h.id, h);\n  return {\n    /**\n     * Look a column up by id.\n     * @param {string} colId the column id\n     * @returns {object|undefined} the handle, or undefined when not transported\n     */\n    handle(colId) { return byId.get(colId); },\n    count,\n    pool: createMaskPool(),\n    locale,\n  };\n}\n\n/**\n * Dispatch one kernel call.\n *\n * Split out from the message loop so it can be exercised directly in Node,\n * without a Worker and without `postMessage`.\n *\n * @param {{op:string, args:object}} request the decoded request\n * @param {object} compute the compute module (CONTRACTS §3)\n * @returns {unknown} whatever the kernel returned\n */\n function dispatch(request, compute) {\n  const { op, args } = request;\n  const fn = compute[op];\n  if (typeof fn !== 'function') {\n    const err = new Error(`[lattice] compute kernel '${op}' is not exported`);\n    /** @type {Error & {code?:string}} */ (err).code = ERRORS.NO_KERNEL;\n    throw err;\n  }\n\n  switch (op) {\n    case OPS.SORT_COLUMN:\n      return fn(unpackHandle(args.handle), args.order ?? null, args.opts || {});\n\n    case OPS.SORT_MULTI: {\n      const handles = unpackHandles(args.handles || []);\n      // Entries reference handles by index over the wire; a handle object\n      // cannot be cloned twice and stay identical, so identity is restored here.\n      const entries = (args.entries || []).map((e) => ({\n        ...e,\n        handle: handles[e.index],\n      }));\n      return fn(handles, entries, args.order ?? null);\n    }\n\n    case OPS.EVALUATE_FILTERS:\n      return fn(args.filters, filterContext(unpackHandles(args.handles || []), args.count, args.locale));\n\n    case OPS.COMPACT:\n      // `out` is a caller-owned buffer on the main thread and cannot be written\n      // through from here, so the Worker always allocates and transfers back.\n      return fn(args.mask, args.count, undefined);\n\n    case OPS.GROUP_BY_COLUMNS:\n      return fn(unpackHandles(args.handles || []), args.order ?? null, args.opts || {});\n\n    case OPS.TOTAL:\n      return fn(unpackHandle(args.handle), args.indices ?? null, args.fn);\n\n    case OPS.PIVOT:\n      return fn(unpackHandles(args.handles || []), args.order ?? null, args.opts || {});\n\n    case OPS.FACET:\n      // Both phases run here in one call. Boundaries are usually cached on the\n      // main thread and sent back down in `opts.bounds`, so the common case is\n      // a recount; the first computation for a column does both rather than\n      // paying a second round trip to place edges.\n      return fn(unpackHandle(args.handle), args.indices ?? null, args.count, args.opts || {});\n\n    default: {\n      const err = new Error(`[lattice] unknown worker op '${op}'`);\n      /** @type {Error & {code?:string}} */ (err).code = ERRORS.PROTOCOL;\n      throw err;\n    }\n  }\n}\n\n/**\n * Handle one decoded message and produce the reply.\n *\n * @param {object} message the message payload as received\n * @param {{loader?:() => Promise<object>, cancelled?:Set<number>}} [opts]\n *   `loader` overrides the compute import; `cancelled` lets the caller mark a\n *   request as superseded while it is in flight\n * @returns {Promise<{reply:object, transfer:ArrayBuffer[]}|null>} the reply and\n *   its transfer list, or null when the message needs no reply\n */\n async function handleMessage(message, opts = {}) {\n  if (!message || message.lattice !== PROTOCOL) return null;\n  const { id, op } = message;\n\n  if (op === CONTROL.CANCEL) {\n    opts.cancelled?.add(message.target);\n    return null;\n  }\n  if (op === CONTROL.PING) {\n    return { reply: { lattice: PROTOCOL, id, ok: true, result: 'pong' }, transfer: [] };\n  }\n\n  const compute = await loadCompute(opts.loader);\n  if (!compute) {\n    return {\n      reply: {\n        lattice: PROTOCOL,\n        id,\n        ok: false,\n        error: {\n          code: ERRORS.NO_COMPUTE,\n          message: `[lattice] compute kernels unavailable in worker: ${computeError ? computeError.message : 'module not found'}`,\n        },\n      },\n      transfer: [],\n    };\n  }\n\n  // A request superseded before the kernel starts is not worth running: the\n  // caller has already abandoned the round trip (§5.13).\n  if (opts.cancelled?.has(id)) {\n    opts.cancelled.delete(id);\n    return { reply: { lattice: PROTOCOL, id, ok: false, error: { code: ERRORS.ABORTED, message: '[lattice] request superseded' } }, transfer: [] };\n  }\n\n  try {\n    const result = dispatch(message, compute);\n    if (opts.cancelled?.has(id)) {\n      opts.cancelled.delete(id);\n      return { reply: { lattice: PROTOCOL, id, ok: false, error: { code: ERRORS.ABORTED, message: '[lattice] request superseded' } }, transfer: [] };\n    }\n    return { reply: { lattice: PROTOCOL, id, ok: true, result }, transfer: collectTransfers(result) };\n  } catch (err) {\n    const e = /** @type {Error & {code?:string}} */ (err);\n    return {\n      reply: {\n        lattice: PROTOCOL,\n        id,\n        ok: false,\n        error: { code: e.code || ERRORS.KERNEL, message: e.message || String(err), stack: e.stack },\n      },\n      transfer: [],\n    };\n  }\n}\n\n/**\n * Install the message loop on a Worker global scope.\n *\n * Called from the Worker bootstrap (see `inline.js`). `scope` is a parameter\n * rather than a module-level `self` read so that this file imports in Node.\n *\n * @param {{addEventListener:Function, postMessage:Function}} scope the Worker\n *   global scope, normally `self`\n * @param {{loader?:() => Promise<object>}} [opts] compute loader override\n * @returns {() => void} a function that removes the listener\n */\n function installKernel(scope, opts = {}) {\n  /** @type {Set<number>} */\n  const cancelled = new Set();\n\n  /**\n   * Receive one message from the host and post the reply.\n   * @param {{data:object}} event the message event\n   * @returns {Promise<void>} resolves once the reply has been posted\n   */\n  const onMessage = async (event) => {\n    const outcome = await handleMessage(event.data, { loader: opts.loader, cancelled });\n    if (!outcome) return;\n    scope.postMessage(outcome.reply, outcome.transfer);\n  };\n\n  scope.addEventListener('message', onMessage);\n\n  // Announce readiness so the host knows whether kernels are available before\n  // it commits a large request to the boundary.\n  loadCompute(opts.loader).then((mod) => {\n    scope.postMessage({ lattice: PROTOCOL, id: 0, op: CONTROL.READY, compute: !!mod });\n  });\n\n  return () => scope.removeEventListener('message', onMessage);\n}\n\n});\n\nvar __entry = __req(\"packages/worker/src/kernel.js\");\n\n  root[\"__latticeKernel\"] = __entry;\n\n})(typeof globalThis !== 'undefined' ? globalThis : this);\n__latticeKernel.installKernel(self);\n", { type: 'classic' });
} catch (err) { /* no worker in this bundle */ }

const __entry = __req("packages/modules/devtools/index.js");

export const
  createDevtools = __entry.createDevtools,
  CONSOLE_ACTIVATION = __entry.CONSOLE_ACTIVATION,
  expose = __entry.expose;

export default __entry.default;