# Angular components

**Standalone Angular components for [Lattice Grid](https://www.latticegrid.dev), compiled ahead of time.** One component per viewer — the grid, KPI panel, charts, kanban board, Gantt plan, dashboard layout and tab strip — plus the data router as a service. No JIT compiler in your bundle: this is a partial-Ivy library your build's Angular Linker handles exactly like any other Angular package you install.

They ship **inside** the grid package, at `@toclocoinc/lattice-grid/angular` — which is the directory you are reading this in. There is nothing else to install and no second version number to keep in step. `@angular/core` and `@angular/common` are optional peer dependencies of the package, so a project that is not an Angular one installs nothing extra and is not warned about them.

Requires Angular 17 or later.

```sh
npm install @toclocoinc/lattice-grid
```

## A dashboard in one component

```ts
import { Component, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { createGrid } from '@toclocoinc/lattice-grid';
import { createKPI } from '@toclocoinc/lattice-grid/modules/kpi';
import { createChart } from '@toclocoinc/lattice-grid/modules/charts';
import {
  LatticeGridComponent, LatticeKpiComponent, LatticeChartComponent, provideLattice,
} from '@toclocoinc/lattice-grid/angular';

@Component({
  selector: 'app-dashboard',
  imports: [LatticeGridComponent, LatticeKpiComponent, LatticeChartComponent],
  template: `
    <lattice-grid #grid name="quakes" [config]="config" [quickFilter]="search()"
                  (cell-changed)="save($event)" />
    <lattice-kpi  gridName="quakes" [config]="{ tiles }" />
    <lattice-chart gridName="quakes" [config]="{ type: 'bar', x: 'region', y: 'count' }" />
  `,
})
export class Dashboard {
  // The live grid — the same object createGrid returns.
  grid = viewChild<LatticeGridComponent>('grid');
}

// Each factory is injected, not imported by the library: an application that
// shows a grid downloads the grid, and never the board or the charts.
bootstrapApplication(Dashboard, {
  providers: [provideLattice({ createGrid, createKPI, createChart })],
});
```

Give the grid element a height; the grid fills it.

## What is in the package

| Export | Element | What it is |
|---|---|---|
| `LatticeGridComponent` | `<lattice-grid>` | The grid. `[config]` is every configuration key; `[sort]`, `[filters]`, `[quickFilter]` and `[selectedKeys]` are applied through the matching API; `[rowUpdates]` and `[predicates]` drive a live feed. Every grid event is an output under its kebab-case name, and `(grid-ready)` hands you the instance. |
| `LatticeGridDirective` | `[latticeGrid]` | The same component on an element your template already owns: `<div [latticeGrid]="config" class="tall"></div>`. |
| `LatticeKpiComponent` | `<lattice-kpi>` | The KPI panel. Grid-bound by default — `[gridName]` picks the published grid — or give it `[rows]` for a panel with no grid. |
| `LatticeChartComponent` | `<lattice-chart>` | A chart over a grid. A changed spec key goes to `chart.update()`; the chart redraws rather than being rebuilt. `(click)`, `(hover)` and `(leave)` carry the datum under the pointer. |
| `LatticeKanbanComponent` | `<lattice-kanban>` | The board. `[rows]`, `[quickFilter]`, `[sprint]`, `[epic]`, `[loading]` and `[error]` are live inputs. |
| `LatticeGanttComponent` | `<lattice-gantt>` | The plan. `[tasks]` and `[dependencies]` are live inputs. |
| `LatticeLayoutComponent` | `<lattice-layout>` | The dashboard layout; its events arrive as `(layout-changed)`, `(window-moved)` and the rest. |
| `LatticeTabsComponent`, `LatticeTabDirective` | `<lattice-tabs>`, `<ng-template latticeTab="id">` | The tab strip with Angular-rendered tab content, so a tab's grid is a real `<lattice-grid>` with inputs, a reference and your injectors above it. |
| `LatticeGridRegistry` | `inject(LatticeGridRegistry)` | Where `<lattice-grid name="…">` publishes itself and grid-bound viewers find it, as a signal per name. |
| `provideLattice` | `provideLattice({ …factories })` | The factories the components build through. |
| `provideLatticeRouter`, `LatticeRouter` | `providers: [provideLatticeRouter(cfg)]` | The data router as a service, created with the first routed grid under it and destroyed with the component that provides it. |

## How it behaves inside Angular

- **Created once, updated in place, destroyed with the component.** An input change is applied through the instance's own API; nothing is rebuilt. `ngOnDestroy` destroys the instance and leaves no listeners or timers behind.
- **Zone or zoneless, unconfigured.** The grid is created outside `NgZone`, because it installs its own scroll, wheel and pointer listeners. An event that reaches an output you have bound re-enters the zone; an output nobody bound costs nothing. The grid paints on its own schedule, so measure a cell in a grid event rather than in `ngAfterViewInit`.
- **`OnPush` is safe everywhere.** No component asks its parent to re-render.
- **Browser only.** The grid is a DOM object; under server-side rendering the components render their empty host and the grid is created on hydration.

The full reference — every input, output and configuration key — is in this package's `docs/API.html`, under *Frameworks › Angular*, and at [latticegrid.dev/docs](https://www.latticegrid.dev/docs/).

## Licence

Lattice Grid is commercial software; these components are covered by the grid's own licence (`LICENSE`, beside this file and at the package root — the same document). The grid renders in full with no key on localhost, and carries a trial watermark on any other host until a domain licence is installed.

Copyright © 2026 TOCLOCO Inc. All rights reserved.
