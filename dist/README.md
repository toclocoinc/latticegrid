# Lattice Grid

**A high-performance data grid for the browser.** Vanilla JavaScript, no runtime
dependencies, no build step required. Optional adapters for React, Vue, Svelte
and Web Components ship alongside it.

Version 1.19.0 · [latticegrid.dev](https://www.latticegrid.dev) · TOCLOCO Inc

---

## What's here

This repository is the distribution: the built library, its type declarations
and the documentation. Everything is self-contained: nothing is fetched at
runtime, not a CDN, not a font, not an icon sprite.

| File | What it is |
|---|---|
| `lattice-grid.min.js` | The library. UMD: works with a `<script>` tag. |
| `lattice-grid.esm.min.js` | The same, as an ES module. |
| `lattice-grid.min.css` | The theme. Required. |
| `lattice-grid.d.ts` | TypeScript declarations. |
| `docs/API.html` | The complete API reference. |
| `docs/api-detail.html` | The developer guide: what each part does, and why. |

Every module is optional and none of them is loaded unless you import it.

| Module | What it is |
|---|---|
| `modules/charts.esm.min.js` | Thirty-seven chart types drawn from the grid's data, including control and capability charts. |
| `modules/react.esm.min.js` | React adapter. |
| `modules/vue.esm.min.js` | Vue adapter. |
| `modules/svelte.esm.min.js` | Svelte adapter. |
| `modules/webcomponent.esm.min.js` | `<lattice-grid>` as a custom element. |
| `modules/htmx.esm.min.js` | htmx integration: survives htmx's DOM swaps, hydrates from a server-rendered `<table>`, and drives sort, filter and infinite scroll over plain htmx requests. UMD and CJS builds sit beside it. |
| `modules/dhtmlx-compat.esm.min.js` | A compatibility wrapper for dhtmlx Grid, for moving an existing integration across without rewriting it. |
| `modules/devtools.esm.min.js` | The devtools panel, including the accessibility checks. |

---

## What it does

A short tour. The [API reference](docs/API.html) has the whole of it; this is
enough to know whether the grid covers what you need.

### Data and scale

- **Virtualised rows and columns.** Hundreds of thousands of rows on a typed-array
  column store, with dictionary encoding and presence bitsets. Row height can be
  fixed, per-row, or measured from content.
- **Sort, filter, group, pivot and aggregate**, each as an independent stage
  over the same data. Multi-column sort, a filter grammar with typed operators,
  row grouping to any depth, full pivoting, and a totals row that reduces by any
  of the built-in kernels or one of your own.
- **Live data.** `rows.apply({add, update, remove})` patches in place: the grid
  re-queries the stages a change actually touched and repaints the cells that
  moved. A feed can be paused and resumed with the queue held.
- **Any source.** Rows in memory, server-side paging, infinite scroll,
  streaming, or a grid derived from another grid. Sorting and filtering can be
  handed to the server or left to the grid.
- **Pushdown adapters.** One portable query, translated to whatever an engine
  speaks. An adapter declares what it can answer, the grid works out what to
  send and finishes the rest itself, and reports the split so a slow query can
  be diagnosed. Adapters ship for OData, an ordinary REST endpoint, DemandFlow
  and DuckDB.
- **A full analytical engine, without carrying one.** `duckdbAdapter` takes a
  DuckDB connection you created and imports nothing, so a grid can query a
  Parquet file of millions of rows in the browser while this package stays at
  zero dependencies. `demo/duckdb.html` does exactly that with no server at
  all.

### Grids that read from other grids

- **Derived grids.** A grid whose rows are produced from another grid rather
  than loaded: grouped and aggregated, unnested, filtered, ranked or profiled,
  in its own element with its own columns. It follows the source live, and a
  change is patched into the last grouping rather than re-derived, so five
  hundred updates against a 200,000-row source cost under 300 ms in total.
- **Cross-filtering.** A derived panel can filter the grid it summarises.
  Clicking one row narrows the source without collapsing the panel that was
  clicked, so there is always something else to click, and several panels
  compose.
- **Joins.** Two grids holding their own data and a third showing where they
  meet. `inner` keeps what matched; `left` keeps everything and leaves the
  unmatched rows visible, which is the shape you want when the unmatched rows
  are the finding. Both sides stay live.
- **Statistic tiles.** `createStat` renders a headline figure over a grid, with
  a change indicator, threshold bands and its confidence interval.

### Working with the data

- **Editing.** Cell, row and form editing, with twenty-three editors: text,
  number, date, time, select, multi-select, colour, rating, slider, segmented,
  code, password, icon picker and more. Validation, async commits, optimistic
  updates with rollback, and a full undo history.
- **Selection and ranges.** Cell, row, column and rectangular range selection,
  with clipboard behaviour that round-trips through Excel.
- **Fill, copy and paste** across a range, including formulas.
- **Formulas.** A closed, safe expression language, no `eval`, no host access,
  with maths, text, logic, date and statistical functions, evaluated against
  other columns.
- **Export.** CSV with fields sanitised against formula injection, real `.xlsx`
  written without a ZIP dependency, the clipboard as TSV with a matching paste
  parser, and print. All of them take the filters, sort and grouping the user is
  looking at, or the whole set.

### Seeing the data

- **Charts.** `modules/charts` draws thirty-seven chart types from the grid's
  own data: line, bar, area, scatter, pie, donut, sunburst, treemap, radar, gauge,
  funnel, heatmap, histogram, box plot, candlestick, combo, geomap, sankey,
  chord, network, stream, violin, gantt, Q-Q, ECDF, Lorenz, correlogram,
  control and capability. They follow the grid's filters, and clicking a mark
  can filter it in turn. A scatter can carry its own least-squares fit, and any
  mark can carry a whisker for the uncertainty behind it.
- **Statistics.** `grid.statistics` profiles a column in one pass: count,
  missing, distinct, five-number summary, standard deviation, outliers and a
  histogram, and answers correlations, regressions and weighted averages.
  Thirty-eight reduction kernels are available to the totals row, and you can
  register your own. A profile also says what is worth looking at: a constant
  column, a key that is not unique, a fifth of the rows missing.
- **Statistical process control.** Cp and Cpk against short-term variation from
  the moving range, Pp and Ppk against overall, and the share of parts outside
  the customer's tolerance, which is declared once on the column so the indices,
  the charts and any cell rule cannot disagree about it. Control charts name
  their lines and number every rule break, under Western Electric's four rules
  or Nelson's eight. A capability report draws the readings against the
  tolerance with a curve for each of the two spreads, and a moving range chart
  completes the pair.
- **Confidence intervals.** On a mean using the *t* distribution, on a rate
  using the Wilson score, on a regression slope, and on a capability index. The
  line the product draws is that it quantifies uncertainty and does not
  adjudicate hypotheses: there are no p-values and no significance tests.
- **Shadow columns.** Values the grid maintains about itself: how many times a
  row has changed, what a value was when the page loaded, how fast it is moving,
  its rank, percentile or share of the total. Real columns: sortable,
  filterable, exportable, saved into a view.
- **Conditional formatting** as runtime state a user can change, with rules that
  either name a threshold or describe the data: the top decile, the outliers,
  two deviations above the mean.
- **In-cell charts**, sparklines, data bars, progress, ratings and pills.
- **Header histograms** that double as a filter.

### The interface

- **Tool panels** for columns, filters, views, quick filter, formatting and
  statistics, docked or as an icon rail.
- **Saved views**, the whole grid state as a named, shareable object, stored
  on your server or in the browser.
- **Column menu, context menu and status bar**, each extensible with your own
  items.
- **Pinned columns and rows**, column groups, resize, reorder, autosize, and a
  density control.
- **Master–detail rows**, tree data, and full-width rows.
- **Presence**: live cursors, selections and edit locks for collaborative use,
  carrying intent and never values.
- **Comments** threaded on cells, and an annotation layer for presenting.
- **Full-screen mode**, print, and image capture.

### Built in, not bolted on

- **Accessible.** Keyboard operable throughout, ARIA grid semantics, a live
  region for announcements, honours reduced motion, forced colours and large
  target sizes. The devtools module runs the accessibility checks in place.
- **Internationalised.** Twenty-two complete locale catalogues across nineteen
  languages, right-to-left layout, and
  locale-aware number, date and currency formatting throughout.
- **Themeable** through CSS custom properties, with light and dark built in and
  a reset that keeps a host page's stylesheet out.
- **Typed.** Complete TypeScript declarations, checked against the runtime on
  every build.
- **Zero runtime dependencies.** Nothing is fetched at runtime, not a CDN, not
  a font, not an icon sprite.

---

## Quick start

### No build step

The script-tag path is a first-class target, not an afterthought. Two files:

```html
<link rel="stylesheet" href="lattice-grid.min.css">
<script src="lattice-grid.min.js"></script>

<div id="grid" style="height: 600px"></div>

<script>
  const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
    columns: [
      { field: 'circuitId', title: 'Circuit' },
      { field: 'monthlyCharge', type: 'number', format: 'currency:GBP:2', total: 'sum' },
      { field: 'installedOn', type: 'date', format: 'date:dd MMM yyyy' },
    ],
    rows,
    rowKey: 'id',
  });
</script>
```

### With a bundler

```sh
npm install @toclocoinc/lattice-grid
```

```js
import { createGrid } from '@toclocoinc/lattice-grid';
import '@toclocoinc/lattice-grid/css';

const grid = createGrid(element, { columns, rows, rowKey: 'id' });
```

### React, Vue, Svelte and Web Components

Optional adapters, thin by design: the grid is created once
against a host element, prop changes are pushed through the same public API you
would call by hand, and it is destroyed on unmount.

You pass the framework in. Each adapter is a factory taking the framework and
`createGrid` rather than importing either, so the package keeps its promise of
no runtime dependencies, and an adapter can never disagree with the version of
the grid you already loaded.

```js
import React from 'react';
import { createGrid } from '@toclocoinc/lattice-grid';
import { createLatticeGrid } from '@toclocoinc/lattice-grid/modules/react';

const LatticeGrid = createLatticeGrid({ React, createGrid });
```

The web component is the exception: it carries the grid inside it, so use it *or*
`createGrid` in a page, not both, two copies keep separate registries, and a
renderer registered through one will not appear in the other.

The full setup for each framework is in the developer guide.

### htmx and dhtmlx

Two integrations that are not framework adapters.

**htmx.** `modules/htmx` lets a grid survive htmx's own DOM swaps, hydrate from
a server-rendered `<table>`, and drive sort, filter and infinite scroll over
plain htmx requests. It is a complete package rather than an add-on,
`createGrid`, `autoInit`, `hydrateTable`, `readTable`, `serialiseState` and
`restoreState` are re-exported alongside its own functions, so a page using it
imports this and never the base package as well.

**dhtmlx.** `modules/dhtmlx-compat` exposes a dhtmlx Grid-shaped API over
Lattice, for moving an existing integration across a piece at a time rather
than rewriting it in one go. It shares the core the page already loads rather
than carrying its own, so load `lattice-grid` alongside it — a bundler wires
the shared import for you, and a `<script src>` page loads the global build
first — and a licence set on that core applies to these grids too.

### TypeScript

Declarations ship in the box and are wired up in `package.json`, so editors find
them without configuration: autocomplete, inline documentation and type
checking against the real API.

```ts
import type { Grid, GridConfig, ColumnDef } from '@toclocoinc/lattice-grid';
```

The declarations are checked against the running product on every build, so what
your editor tells you and what the grid does cannot drift apart.

---

## Full-screen mode

A grid usually lives in whatever box the page layout gave it, and that box is
usually too small for the job. The left rail's last button fills the browser
window with the grid; clicking it again, or pressing <kbd>Esc</kbd>: puts it
back exactly where it was.

```js
grid.maximise.toggle();
grid.maximise.active();          // true while it fills the window

createGrid(el, { maximise: false });   // remove the button entirely
```

It is a real escape, not a restyle: the element is moved out to `<body>` so no
ancestor's `transform`, `overflow: hidden` or stacking context can clip or
shrink it, and a placeholder holds its place so the page behind neither reflows
nor loses its scroll position. Every displaced style is handed back exactly as
it was found.

---

## Data types

Seven built-in types: `text`, `number`, `boolean`, `date`, `dateString`,
`object` and `lookup`: cover ordinary business data and are inferred from your
rows automatically.

Beyond those, Lattice Grid ships **88 technical field types** for the data that
usually ends up in a text column because the grid had nowhere to put it. Each is
a complete type, not a display format: it brings its own parser, comparator,
editor, filter, alignment, clipboard behaviour and Excel mapping.

| Group | Types |
|---|---|
| **Network** | `ipv4`, `ipv6`, `cidr`: sort in address order, not lexically, so `10.0.0.9` comes before `10.0.0.10`. |
| **Time** | `time`, `datetime`, `duration`: three things a single `date` type keeps being asked to be. |
| **Radix** | `hex`, `hex8`, `hex16`, `hex32`, `binary`, `binary8`, `octal`, the stored value stays a plain number; the base is presentation and input only. |
| **Data** | `bytes`, `megabytes`, `gigabytes`, `bitrate`, `gigabits`: shows `10 GB`, accepts `10,000M` typed in, stores `10`. Decimal and binary ladders are both first class, because `MB` and `MiB` are different quantities. |
| **Mechanical** | length, mass, duration, speed, acceleration, area, volume, force, pressure, torque, density, energy, power, angle, `rpm` and angular velocity. |
| **Fluid and thermal** | volumetric flow, mass flow, dynamic and kinematic viscosity, thermal conductivity, specific heat, and temperature in `celsius`, `fahrenheit` and `kelvin`. |
| **Electrical and SI** | voltage, current, resistance, capacitance, inductance, charge, conductance, frequency, flux density, luminous flux, luminous intensity, illuminance and substance: all auto-prefixed across the SI range. |
| **Chemistry and radiation** | `molarity`, `ppm`, `ppb`, absorbed dose, equivalent dose, radioactivity and dose rate. |
| **Finance and ratios** | `basisPoints`, `ratio`, `percentRate`, and decibels, which are reduced logarithmically, not averaged. |
| **Structured** | `json`, `secret`: `secret` is write-only: editable, never displayed, never exported. |

### Units of your own

Three things define a unit family, and all three are yours to set: the symbols,
where the symbol sits relative to the number, and how the rungs relate to each
other.

```js
import { registerUnitSystem, defineUnit, createUnitType } from '@toclocoinc/lattice-grid';

// The ladder. `factor` is how many base quantities one of this unit is, so the
// relationship between the rungs is simply their arithmetic.
registerUnitSystem('yarn', [
  defineUnit('tex', 1, ['tx']),
  defineUnit('ktex', 1e3, [], { prefix: 'k' }),
  defineUnit('den', 1 / 9, ['denier']),
]);

createGrid(el, {
  dataTypes: {
    linearDensity: createUnitType({ system: 'yarn', unit: 'tex', display: 'auto' }),
  },
  columns: [{ field: 'count', type: 'linearDensity' }],
});
```

`display: 'auto'` walks the ladder and picks the most readable rung, so 1,500
tex renders as `1.5 ktex`. A unit given `{ auto: false }` stays off that ladder
while remaining accepted on input and available as an explicit `display`: which
is how imperial units sit beside metric ones without an auto readout jumping
between the two.

`placement: 'prefix'` puts the symbol in front of the number, for currency and
the few notations that want it. It applies to input as well as display, and the
trailing form is still accepted, because a column that renders `$1,200` will be
pasted into from somewhere that writes it the other way round.

```js
createUnitType({ system: 'money', unit: '$', placement: 'prefix', decimals: 2 })
// renders  $1,200.00
// accepts  $1,200 · 1200 $ · k$1.2 · 1.2 k$
```

Whatever the display, **the stored value is always a plain number in the
column's base unit**, so sorting, filtering, grouping, totals and the pivot all
work on the number and never on the text.

---

## Documentation

- **[API reference](docs/API.html)**: every namespace, method, config key and event.
- **[Developer guide](docs/api-detail.html)**: what each part does and why, with worked examples.

---

## Licensing

**There is one Lattice Grid and every copy is feature-identical.** No community
edition, no pro tier, no feature held back behind a key.

- **Free to develop against.** On `localhost` and other loopback hosts, no key
  is needed and no watermark is shown.
- **Licensed to deploy.** On any other host, an unlicensed grid renders
  everything and carries a small trial watermark.

Nothing is ever disabled, degraded or withheld, the failure to avoid is a
production screen breaking because a licence lapsed over a weekend. A key
removes the watermark; that is the whole of what it does.

Keys are issued per deployment rather than per developer or per seat, cover the
domains you name including wildcards, and are checked locally with no licence
server and no call home.

Get a key at **[latticegrid.dev](https://www.latticegrid.dev)**. See
[LICENSE](LICENSE) for terms.

---

## Requirements

A current browser. Lattice Grid targets ES2022 and uses `ResizeObserver`; there
is no IE11 build and no polyfill bundle.

---

Copyright © 2026 TOCLOCO Inc. All rights reserved.
