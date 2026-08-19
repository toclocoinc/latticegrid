# Lattice Grid

**A high-performance data grid for the browser.** Vanilla JavaScript, no runtime
dependencies, no framework wrapper, no build step required.

Version 1.4.0 · [latticegrid.dev](https://www.latticegrid.dev) · TOCLOCO Inc

---

## What's here

This repository is the distribution: the built library, its type declarations
and the documentation. Everything is self-contained — nothing is fetched at
runtime, not a CDN, not a font, not an icon sprite.

| File | What it is |
|---|---|
| `lattice-grid.min.js` | The library, minified. UMD — works with a `<script>` tag. |
| `lattice-grid.esm.min.js` | The same, as an ES module. |
| `lattice-grid.min.css` | The theme. Required. |
| `lattice-grid.d.ts` | TypeScript declarations. |
| `lattice-grid.umd.js`, `lattice-grid.esm.js` | Unminified, for debugging. |
| `docs/API.html` | The complete API reference. |
| `docs/api-detail.html` | The developer guide — what each part does, and why. |

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

```js
import { createGrid } from 'lattice-grid';
import 'lattice-grid/css';

const grid = createGrid(element, { columns, rows, rowKey: 'id' });
```

### TypeScript

Declarations ship in the box and are wired up in `package.json`, so editors find
them without configuration — autocomplete, inline documentation and type
checking against the real API.

```ts
import type { Grid, GridConfig, ColumnDef } from 'lattice-grid';
```

The declarations are checked against the running product on every build, so what
your editor tells you and what the grid does cannot drift apart.

---

## Full-screen mode

A grid usually lives in whatever box the page layout gave it, and that box is
usually too small for the job. The left rail's last button fills the browser
window with the grid; clicking it again — or pressing <kbd>Esc</kbd> — puts it
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

Seven built-in types — `text`, `number`, `boolean`, `date`, `dateString`,
`object` and `lookup` — cover ordinary business data and are inferred from your
rows automatically.

Beyond those, Lattice Grid ships **20 technical field types** for the data that
usually ends up in a text column because the grid had nowhere to put it. Each is
a complete type, not a display format: it brings its own parser, comparator,
editor, filter, alignment, clipboard behaviour and Excel mapping.

| Group | Types | Notes |
|---|---|---|
| **Network** | `ipv4`, `ipv6`, `cidr` | Sort in address order, not lexically — `10.0.0.9` before `10.0.0.10`. |
| **Time** | `time`, `datetime`, `duration` | Three things a single `date` type keeps being asked to be. |
| **Radix** | `hex`, `hex8`, `hex16`, `hex32`, `binary`, `binary8`, `octal` | The stored value stays a plain number; the base is presentation and input only. |
| **Units** | `bytes`, `megabytes`, `gigabytes`, `bitrate`, `gigabits` | Shows `10 GB`, accepts `10,000M` typed in, stores `10`. |
| **Structured** | `json`, `secret` | `secret` is write-only: editable, never displayed, never exported. |

Custom types are first-class too — `createRadixType` and `createUnitType` build
new ones, and any type can `extend` another.

---

## Documentation

- **[API reference](docs/API.html)** — every namespace, method, config key and event.
- **[Developer guide](docs/api-detail.html)** — what each part does and why, with worked examples.

---

## Licensing

**There is one Lattice Grid and every copy is feature-identical.** No community
edition, no pro tier, no feature held back behind a key.

- **Free to develop against.** On `localhost` and other loopback hosts, no key
  is needed and no watermark is shown.
- **Licensed to deploy.** On any other host, an unlicensed grid renders
  everything and carries a small trial watermark.

Nothing is ever disabled, degraded or withheld — the failure to avoid is a
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
Lattice Grid and the Lattice Grid logo are trademarks of TOCLOCO Inc.
