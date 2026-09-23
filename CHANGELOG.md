# Changelog

Every notable change to Lattice Grid. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

Entries are written for the person deciding whether to upgrade: what changed,
and what it means for a grid already in production.

## [Unreleased]

## [1.71.0] - 2026-09-23

### Added

- The package now ships a warnings reference: every `[lattice]` line the grid can print to the console, by the identifier it de-duplicates on, with the message it prints, what happened and what the grid did about it, and what to change. It is data rather than a page — `docs/warnings.json` inside `@toclocoinc/lattice-grid` and in the public repository, importable as `@toclocoinc/lattice-grid/docs/warnings.json` — so a console line can be looked up in a support conversation, in a script, or by eye (BACKLOG-0001192).
  - 470 identifiers across the grid and every module, 219 of them fixed strings and 251 patterns such as `icon:*`, where a `*` stands for a value filled in at run time.
  - `grid.diagnostics` in the reference gains a section pointing at it; `grid.diagnostics.warnings()` already hands back the same identifiers.
  - A build gate keeps the two in step: a warning added without an entry, an entry whose warning has been removed, and an entry whose wording has drifted from the code that prints it each fail the build by name.

- A grid could show a breach but could not tell anyone one had started: a KPI tile painted itself critical, a formatting rule coloured the cell, and the on-call rota, the ticketing system and the alarm grid on the same wall heard nothing. The new opt-in `modules/alarms` bundle (`createAlarms`, UMD `LatticeGridAlarms`) turns data that is already graded into `alarm:raised` and `alarm:cleared` events. Attach a KPI panel, a grid's columns or a Data Router route; an alarm's identity is `(source, key, level)`, so moving from critical to warn clears the critical alarm before it raises the warn one, and a source that goes silent clears what was open rather than raising anything. `holdMs` is a hold-down, not a rate limit: a level must persist before its transition is emitted and a crossing back inside the window discards it, so a value flapping across a threshold a thousand times in two seconds emits nothing while a breach that settles emits once. `active()` and `pending()` report the state, and `publish(router, kind)` feeds an alarm grid with the raise and the clear as separate rows.

- A KPI panel now announces each tile's threshold crossing on its own: the new `tile:status` event (`{ id, status, previous, value, at }`) fires once per transition, including to and from `unknown`, so a host can drive an alarm from the transition itself instead of diffing the whole model out of `onChange` on every refresh. It fires before `change`, and is exposed by the React and Angular adapters like every other panel event.

- The Data Router gained `monitor(when, evaluate, handler)`, a levelled sibling of `alert()` that reports what a partition slice currently measures instead of firing once on a rising edge. It shares the alert route's partition, row key, seeding and independence from a time-travel scrub — so it keeps watching the live stream while the grids are parked in the past — and returns a stop function.

- Users who want to "just type in the column" now have a row to type into: `filterRow: true` draws a filter row directly under the column headings — below the column groups, above the pinned rows, in every pinned region — with one inline filter cell per column (BACKLOG-0001436).
  - Each cell is the inline form of that column's own filter: a box with the operator implied (`contains` for text, `equals` for a number, and for a date equality meaning "on that day") plus a small picker for the other single-operand operators; a tri-state box for a boolean; and a chip that opens the column's own filter popup for a set or multi column, and for a condition too wide to draw inline such as a range or a relative date.
  - It writes the one filter model the column menu writes, so the menu shows what was typed in the row, the row shows what was set in the menu, a saved view restores it, and a pushdown source receives exactly the condition the menu would have sent. Clearing a cell clears that column's filter and leaves the others alone.
  - A column opts out with its own `filterRow: false`. `headerControls: 'none'` and `showColumnFunctions: false` do not take the row away: those govern the chrome a heading carries, and the filter row is data entry.
  - The row is one tab stop, arrows move between cells (and inside a text box only once the caret is already at that end), Escape puts a cell back to the committed value, and every control names the column it filters. It respects density, RTL, column width, resize, reorder and pinning, and rides the header's own horizontal scroll path: on a 1,000,000-row grid a scrolled frame cost 16.55 ms with the row and 16.41 ms without it, with no measurable gap between a heading and its filter cell.
  - Available as a config key through React, Vue, Svelte, Angular, and as `<lattice-grid filter-row>` on the custom element.

- A grid could not show a running row count without a host computing it themselves — a computed column that followed the row rather than its position under sort or filter, cost a real column in export, and could not be pinned. `rowNumbers: true` adds a built-in row-number column, pinned left ahead of the selection checkbox: the same generated-column mechanism the checkbox uses, so it is never in `columns.state()`, a saved view or the tool panel's visibility list, and is excluded from CSV/Excel/clipboard export unless the export call opts in with `{ rowNumbers: true }`. The number is the row's 1-based position among the visible rows after sort, filter and grouping — a group heading is not numbered and its leaves continue the count across it, and pinned-top rows are numbered first — resolved from the row's own display position rather than a value cached on it, so it stays correct through a resort, a refilter or a jump to any virtual-scroll offset. `rowNumbers: { width, start, title }` fixes the width (auto-fit by default), moves where numbering starts, or gives the header a title.

- Reporting grids that repeated a category down every row of its run can now merge it into one cell: a column's `rowSpan(p)` merges its cell down over the rows beneath it and `colSpan(p)` merges it across the columns to its right, both as a function of the cell (BACKLOG-0001438). Return `1` — or nothing — for no merge, which is the default and costs nothing: a grid where no column declares either callback never runs the merge pass.
  - The cell is painted once, at its origin, sized across the area it covers, and the cells it covers are not painted at all. A merge is clipped where it cannot honestly reach: at a pinned-region boundary (the three regions scroll independently), at a group heading, at an expanded detail panel, and at the last row or column.
  - A merge whose origin has scrolled above the viewport still paints from that origin — the renderer looks back 50 rows for it — so scrolling into the middle of a ten-row merge shows the merged cell, not ten blanks. A merge taller than the look-back is named once and drawn from the first row in range.
  - The merge is one cell everywhere else too: the origin carries `aria-rowspan`/`aria-colspan`, an arrow key into it lands on the origin and an arrow out leaves from the far edge, a range drawn on it takes the whole of it, editing edits the origin, and the fill handle refuses to start on one.
  - CSV, the clipboard and Excel write the value at the origin and blanks in the cells it covers, so a column still totals correctly — and Excel writes a real `<mergeCells>` range, so the workbook opens with the cells merged.
  - The callbacks are evaluated on every render against the rows as they are then ordered, so a sort or a filter that separates the rows changes the merge with them; keeping merges meaningful is the host's part of the bargain, and the guide gives the two-line recipe for merging equal adjacent values.
  - Available as column-definition keys through React, Vue, Svelte, Angular and the `<lattice-grid>` custom element. The older `cell.spanRows` / `cell.spanColumns` spelling still works and means the same thing.

### Fixed

- A grid configured with `resizePreview`, `selectionColumnWidth` or `selectionColumnPin` was told `'…' is not a configuration key this grid recognises, so it had no effect` — a false warning: all three took effect, they were just undeclared. The three now join the configuration reference and the console stays quiet for them (BACKLOG-0001440).

- `grid.set('selectionColumnWidth', …)` and `grid.set('selectionColumnPin', …)` reached the configuration but not the generated checkbox column, which kept its original width and pin edge until the grid was rebuilt some other way. Both now resize or re-pin the column immediately.
  - Also newly documented in this release: `board.flow.cycleTime()`/`leadTime()`/`cfd()` (Kanban flow analytics) are declared on the board's type; the built-in chart colour scheme names (`'default'`, `'bright'`, `'earth'`, `'mono'`) are a named type (`ChartSchemeName`); loading the KPI, Data Router, mock socket, Gantt, Kanban and alarms modules from a plain `<script src>` tag is now typed and listed in a reference table; and the `format` shorthand grammar (`'currency:GBP:2'`, `'percent:1'`, `'date:dd MMM yyyy'`, `'relative'`, `'boolean:Yes/No'`, `'text:upper:20'`) is documented on the formatting guide page.

## [1.70.0] - 2026-09-23

### Breaking

- **`LatticeGrid.default.createGrid` (and every other member of the default export) was writable while the top-level `LatticeGrid.createGrid` was not, and the assignment actually worked** (BACKLOG-0001250). The top-level export has always refused `LatticeGrid.createGrid = wrapper` — silently discarded in a plain script, thrown in a module (BACKLOG-0001187) — but `LatticeGrid` the object, reached as `default` from every build, was a plain object literal: `default.createGrid`, `default.createHeadlessGrid`, `default.defaults` and the rest were ordinary writable, configurable properties. `LatticeGrid.default.createGrid = wrapper` silently replaced what a later `LatticeGrid.default.createGrid(...)` call ran — a second, undocumented route to exactly the monkey-patch `defaults()` exists to replace, open on every UMD, ESM and CJS build. `LatticeGrid` is now `Object.freeze`d, so `default`'s members are as immutable as the top-level export they duplicate: a host that was reaching `LatticeGrid.default.createGrid = wrapper` (never a documented pattern, and no consumer in this repository or its adapters does) now gets the same refusal the top-level export always gave — silently discarded outside strict mode, `TypeError` inside it — instead of the wrapper running.

### Added

- **A fourth `headerControls` value, `'none'`, for a heading that shows only its column title, whatever the grid's state** (BACKLOG-0001423). `'hidden'` already removed the interactive sort/filter/menu furniture, but it still drew a read-only sort arrow and multi-sort order number on a column that was actually sorted — the right choice for a read-only grid, the wrong one for a dashboard heading (a NOC panel, say) that must never change its own appearance no matter how the grid underneath it is driven. `'none'` removes that badge too: no controls, no hover affordance, and no sort, filter or group badge, even when the column is sorted, filtered or grouped programmatically or from a saved view. `aria-sort` still reports the true state to assistive tech; only the visual badge is gone. Set as a grid-level default or per column, exactly like `'hover'`, `'always'` and `'hidden'`.

### Changed

- **A filtered pushdown query now shows its rows as soon as the page settles, and the exact total arrives a moment later** (BACKLOG-0001078). Measured on a 10M-row Parquet file served over HTTP range requests, a page of 100 rows costs about 0.1 s and the filtered `count(*)` beside it costs about 1.3 s and 28 MB — and duckdb-wasm runs one connection's statements through one worker, so the count ran *after* the page rather than beside it and the caller waited for the sum. The rows sat finished on the wire for over a second while a number nobody had scrolled to yet was worked out. `duckdbAdapter` now answers a filtered query with the rows and `pendingTotal`, a promise of the same exact number: the grid renders the page immediately, the status bar's row-count panel and the pager say they are counting (`status.counting`, `pagination.counting`, seeded in British English) rather than offering the rows fetched so far as the size of the dataset, and the new `source:total` event fires once with the exact figure when the count lands. While it is pending, `grid.rows.totalPending()` is `true`, `grid.rows.totalCount()` is `null`, `grid.pagination.get()` reports `counting: true` with no total to divide into pages, and `source.counts().pending` / `source.lastPlan().total` report the same state to a host. Nothing is ever estimated and nothing is skipped: the count statement still runs and still reads the same bytes. An **unfiltered** count is answered from the Parquet footer in about 25 ms, so it is still awaited and still arrives with the rows; `count: false` still means never count; the whole-result paths (`fullDataset`, the `whereRowLimit` probe) still wait for the number, because there are no early rows to win there and a memory guard decided against a total that had not arrived would admit or refuse a set on the strength of nothing. Any pushdown adapter can opt into the same treatment by returning `pendingTotal` instead of `total`. The developer guide gains the measured layout advice this came out of: clustering (sorting) the Parquet on the columns you filter most pruned 87× more of the read on the same query, 1M-row row groups roughly halved the cost of a filtered count that could not be pruned, and a filtered count is cheaper than fetching the rows to count them yourself but is never *cheap*.

- **The npm package now ships its `CHANGELOG.md`** (BACKLOG-0001083): a consumer reading the installed package previously had no release history at all. `CHANGELOG.md` is staged into `dist/` and from there into `public_npm/CHANGELOG.md` (what `npm install` hands a consumer) and `public_repo/CHANGELOG.md` (the public repository's root, alongside `README.md` and `LICENSE`), byte-identical to the repository's own copy and covered by the freshness gate like every other published artefact.

- **A grid release now tells the Python wrappers about itself, so a notebook stops installing a grid twenty-nine releases old** (BACKLOG-0001110). `@toclocoinc/lattice-grid-pandas`, `-jupyter` and `-dash` do not resolve the grid at install time — they *vendor* this package's browser bundle into their own wheels — so every grid release since 1.41 shipped to npm and reached no `pip install` at all: the wheels on PyPI still carried grid 1.40.0. `publish-npm.yml` gains a `notify-python` job that runs after npm has accepted the version and sends `toclocoinc/lattice-grid-python` a `repository_dispatch` of type `grid-released` carrying `{ version }`; that repository downloads that exact tarball, vendors it, runs its wrapper tests against it and publishes the three wheels as `<grid>.0` (grid 1.69.0 becomes wheels 1.69.0.0, so a reader can tell which grid a wheel carries from its number alone). Nothing in the grid's own publish changes: the job is a new leaf with `needs: [publish]`, it runs after the package exists rather than beside it (the wrappers' first act is to download the tarball), and the public-repository job is untouched.
  - **The credential, and what happens without it.** A cross-repository dispatch cannot use `GITHUB_TOKEN`, so the job reads `PYTHON_DISPATCH_TOKEN` — a fine-grained PAT issued by `toclocoinc`, scoped to `toclocoinc/lattice-grid-python` alone, carrying **Contents: read and write**. When the secret is absent the step prints a notice naming the version that was not forwarded and exits 0: the grid publishes as it always did, and the wrappers can be bumped by hand from their own Actions tab. A token that is present but wrong is not silent — the step asks for the HTTP status and fails on anything but `204`. `.github/workflows/README.md` documents the scope.

- **Every published bundle is now genuinely minified, and the core bundle is a quarter smaller: 3,203 KB down to 2,363 KB, 745 KB down to 655 KB gzipped** (BACKLOG-0001306). `*.min.js` used to mean "comments and whitespace removed" and nothing else — the in-tree compactor is a lexer, so every local identifier shipped at full length, unreachable branches shipped, and nothing was folded. A page loading the grid was downloading and *parsing* 840 KB of names nobody reads. The bundles are now minified by esbuild: locals renamed, dead code dropped, constants folded. Across all 117 published files that is 35.1 MB down to 26.4 MB raw (−25.0%), 8.5 MB down to 7.5 MB gzipped (−11.3%) and 6.5 MB down to 6.0 MB Brotli (−7.5%) — the gzipped saving is smaller than the raw one because long repeated identifiers were always cheap to compress, so the real win is in bytes parsed rather than bytes moved. Examples: `modules/kpi.min.js` 192.9 KB → 128.1 KB, `modules/charts.min.js` 355.4 KB → 249.9 KB, `modules/gantt.min.js` 192.1 KB → 135.5 KB, `modules/webcomponent.min.js` 3,249.9 KB → 2,395.3 KB. The inline worker kernel, which rides inside every bundle that can compute off the main thread, is minified on the way in too.

- **Property names are never mangled, deliberately.** The public API, every config key, every `data-*` attribute, the editor and filter catalogue keys, the event names and the CSS class names are contracts with your page, so only local identifiers are renamed. Nothing you write against the grid changes.

- **A source map now ships beside every minified bundle**, referenced by `//# sourceMappingURL=`, so a stack trace from minified code maps back to a position and to the original identifier names. `*.min.cjs` shares its `*.min.js` sibling's map — the two files are the same bytes. The maps add about 5 MB to the published tarball (8.4 MB without them, 13.5 MB with, against 9.4 MB before this change); they are never fetched unless devtools is open.

- **The build refuses to run without the minifier rather than quietly producing different bytes.** The repository now installs exactly one build tool — `esbuild`, pinned exactly — so `npm ci` is a prerequisite for `node tools/build.js` and `npm run check`. Nothing changes for anyone installing the grid: the published package still declares no dependency of any kind, and `tools/deps.js` fails the build by name if a second devDependency ever appears.

- **Published bundle sizes are now ratcheted, so this saving cannot leak back one release at a time** (BACKLOG-0001306). `tools/bundle-sizes.json` records the gzipped size of every file under `public_npm/` that a customer downloads and runs, and `tools/check.js` fails when one grows more than 5% over its recorded number, naming the file and printing both. Deliberate growth is absorbed by `node tools/sizes.js --update` **in the same commit**, so the number changes in a diff somebody reads. A newly published bundle with no recorded size, and a recorded bundle that stopped being published, both fail too.

- **The build's own loadability check now parses with a real parser.** It was `new Function(source)` behind a line-anchored `export`-stripping regular expression — the classic-script grammar in disguise. A minified ESM bundle is one line, so the stripper matched nothing and twenty-six valid bundles were reported as "Unexpected token 'export'". It now parses each artefact for the goal it is actually loaded with, which also catches faults the old check never could.

### Fixed

- **`kpi.destroy()` left a routed dashboard, a tab or an SPA route that mounts and unmounts KPI panels growing a listener and a row store per cycle instead of releasing them.** The four delegated pointer/keyboard listeners `wire`/`wireTree` attach to a panel's element on first render (click, dblclick, contextmenu, keydown) had no matching `removeEventListener`, and the panel's own keyed row store — which can hold a stream's whole rolling window — was simply abandoned rather than cleared. `destroy()` now detaches both wiring paths' listeners and releases the store, on every mount/destroy cycle, whether the panel is flat or hierarchical. A KPI tile's `format` also silently dropped `suffix` (and `prefix`): a host configuring `{ type: 'number', suffix: ' km' }` got a bare number with no error. Both are now applied, wrapped around the formatted number.

- **`grid.columns.setTotal()` fired `column:grouped` — the row-grouping-changed event — on every totals-row aggregation change**, so a host listening for the grouping columns to change was woken on an unrelated total edit, with a `columns` payload naming a `groupBy` that had not moved. The emission was a stray copy from `columns.group()`; `setTotal` never touches `#query.groupBy` and does not raise the event now. `column:grouped` still fires, and still names the grouping columns, from `group()` itself. <!-- not-breaking: `column:grouped` firing from `setTotal` was never documented (the event's own docs describe only a row-grouping change) and contradicted the event's documented meaning; a grep of `demo/` and `docs/` found nothing that depended on it -->

- **`createStat`'s delta tone (good/bad/flat) was painted only as `data-tone`, a colour a theme applies — nothing put it into the tile's accessible name, so a screen-reader user heard a label, a number and a bare arrow-and-percentage, with no way to tell whether the move was good news or bad (WCAG 1.4.1).** The tone now reaches the accessible name through the message catalogue — `stat.tone.good`/`bad`/`flat`, seeded in English and awaiting translation the same way `stat.noData` was — the same route BACKLOG-0001114's `stale` caption already takes on a KPI tile.

- **A chart bound to a column the grid does not have drew a complete, empty frame and said nothing; it now shows its empty state and names the column** (BACKLOG-0001098). `y: { col: 'nosuchcolumn' }` produced three category bands, a measure axis labelled 0.0 to 1.0, a legend and an accessible table around no data at all — a picture that reads as "this metric is zero" rather than "this chart is misconfigured". The same is now true of five other inputs a chart cannot honestly draw, because all six answer **one drawability pass** asked before any mark is emitted, instead of the three ad-hoc conditions that had grown one per incident. Every refusal produces the same two outputs: the shipped empty state for the viewer, and one `warnOnce` for the integrator naming the cause and the way out.
  - The refusals, by name: a binding that produced nothing from rows that are there (a Sankey with no `target`); a candlestick without its four measures; a rolling window that no longer reaches any reading; <!-- not-breaking: describes the data window, not a change in behaviour --> a column the grid does not have; a continuous x axis whose values yield no extent, so its domain would be invented (`axis: { x: { scale: 'linear' } }` on a column of words drew a line against an axis labelled 0.0 to 1.0); and sub-day readings already collapsed onto a calendar-day column, which was warned about and then drawn anyway as one point whose value totalled readings that were never meant to be totalled.
  - What still draws, unchanged: a single reading (its axis is an interval around the instant, not an invented span), a flat series, a bar of one calendar day's total, a chart of a hidden column, and a chart whose grid simply has no rows yet — the last of these shows its empty state without a word, because every asynchronous load starts there and there is nothing for an integrator to act on.
  - **A bar taller than its axis is no longer emitted above the plot.** After a value-axis zoom or under a pinned `axis.y.max`, bars were drawn at y = −63.74 and saved from the page only by the clip rectangle; they are now confined to the range of the scale that placed them and run off the edge of the plot instead. The value behind the bar is untouched — the tooltip and the accessible table report what the row holds.
  - A new chart type or binding option is not done until it answers the pass; the rule is written where a type is added, in `packages/modules/charts/drawable.js` and at `registerChartType`.

- **Twenty-six phrases that reached the screen in English whatever the locale now come from the message catalogue, and the build check can finally see the kind of code that shipped them** (BACKLOG-0001103). The rule that keeps user-visible text out of the source matched the *shape* of a sink — a literal beside `.textContent =`, inside `setAttribute('aria-label', …)`, or as `text:` in an `el()` call — so every module that writes the DOM through a helper of its own was invisible to it: `setText(node, EMPTY_TEXT)` matches none of those patterns, which is how `'No data'` shipped untranslated in 1.51.0 with a green build. The check no longer looks for a wider pattern, which would only move the hole to the next helper somebody writes; it finds the helpers, by the sinks they write, and judges what is handed to them as if it had been written at the sink — to a fixed point, so a helper wrapped in a helper is caught too, through imports, so a helper shared between files is caught at the call site, and through both named constants and the static parts of a template. A function that reaches the catalogue, or that hands one of its arguments straight back, is recognised as such rather than listed by name. What it found and what is now translatable: the group expander's **Expand** and **Collapse**, the delta renderer's tooltip and announcement (**up**, **down**, **unchanged**, `{label}, {direction} by {magnitude}`), the QR renderer's **QR code for …** and **No QR code**, the rating renderer's **{rating} of {max}** and **Not rated**, the chart trend line's **R²** label, and the AI module's **Insights**, **Explain this view**, **Explain**, **Ask**, **Apply**, **Discard**, **Propose** and **Approve** — the AI panel now reads the grid's own catalogue, which it always had to hand and never used. The KPI panel's eight keys (`kpi.status.good`/`warn`/`critical`/`unknown`, `kpi.node.item`/`items`/`worst`/`unknown`) are seeded into the core catalogue as well, so a grid-bound panel is translated by the twenty shipped locales instead of falling back to the module's own English; a panel over plain rows or a router still carries that English, because it has no grid to borrow a catalogue from. Every new key ships in British English and is listed as awaiting human translation, so no language claims a translation it does not have. There is deliberately no `emptyText` option for a KPI tile: `nullText` is the placeholder a null *value* renders as, the `unknown` caption is a translatable phrase, and a per-string option beside a catalogue is how an interface ends up half translated. <!-- not-breaking: describes the fix; nothing a host relied on changes -->

- **A KPI tile can now tell a feed that stopped from a genuine zero — say how fresh the data has to be, with `maxAge` and `ageBy`** (BACKLOG-0001114). *Recognise your own case: a rail of `count`/`sum` tiles over a live feed, graded with `thresholds`, where the feed can go quiet without the rows going away.* A tile's `filter` matching none of the rows a populated panel holds reduces to 0, and 0 is a number a threshold grades: under `lowerIsBetter` cut points it is `good`, under `higherIsBetter` ones it is `critical`. That is the right reading of "no Sev-1 incidents out of 200 healthy hosts" and the wrong one for "this feed died six hours ago and its 200 rows are all still here" — from the count alone the two are the same zero, so a dead feed painted a wall of green (or a wall of red alarms nobody should act on). Silence is a property of **time**, not of a count: `createKPI(el, { maxAge: 60000, ageBy: 'observedAt', … })` says how long the panel keeps grading what it holds after its feed last spoke, and which clock that is measured on — the same two options, with the same two meanings, `SourceConfig` gives a rolling window. Past the window with nothing recent, every stat tile reports `unknown` with a null value whatever its own membership, so neither threshold direction grades it; each tile carries `stale: true`; and the tile captions itself "No recent data" (message key `kpi.status.stale`) with the same dashed edge and accessible-name treatment an empty panel's "No data" already had. Grading resumes the moment the feed speaks.
  - **Opt-in, so nothing already written changes.** A panel that declares no `maxAge` judges no freshness at all and behaves exactly as it did: nobody has said what recent means, and a default window would invent silences on every dashboard in production.
  - **A measured zero is still graded** — the rule BACKLOG-0001061 settled is unchanged and is what the regression guard pins: while the feed is fresh, a tile whose filter matches none of the panel's rows reads `0`, `good`, and is not a silence.
  - **A filtered view is not a dead feed.** Omit `ageBy` and the window measures **arrival** — rows reaching the panel through `rows.apply`, `setRows`, or the bound grid announcing that its own rows changed. A filter, a sort, an expansion, a `refresh()` and a rolling window's eviction are not arrivals, so a live feed whose rows are all filtered out of the grid beneath the panel reports the empty panel's `unknown` (`stale: false`), and an empty panel never goes stale. A panel with a window checks itself on a low-frequency timer, because a silence is the absence of events and nothing else on the panel would notice one. An `ageBy` no row answers to grades as usual and names itself once rather than blanking the panel, and a blank timestamp cell reads as a missing time rather than as 1970.

- **A KPI heading now counts a leaf that measured nothing, not only one that says `unknown`** (BACKLOG-0001114). An `avg` over an empty member set reports a null value with a null status — correct at the leaf, because the mean of nothing is not a number and no band contains a non-value — but the parent counted neither, so a heading could announce "3 items, worst status good" while one of the three had measured nothing at all. `node.unknown` now counts any leaf with no reading; a leaf that has a number and simply declares no thresholds is not one, and a clock tile never is. **Read this if you render `node.unknown` yourself**: a rail with such a leaf under it will report one more unknown than it did, which is the number it should always have reported. The developer guide's own executed example moved with it: the heading over an unmeasured `disk` tile now announces `1 unknown` beside its worst status.

- **A disclosed correction to a tagged section.** The 1.52.0 entry for the KPI hierarchy carried a paragraph headed "Known limitation, stated plainly", which said per-leaf presence was a separate question and was not answered there. It is answered now, by the two entries above, so that paragraph has been removed from the 1.52.0 section rather than left to be read as an open defect.

- **`columns.fit()`'s overflow warning could silence a second grid's real overflow, and could be spent on a host that was not really too narrow** (BACKLOG-0001164). The warning was keyed process-wide (`columns.fit-overflow`, no grid identity in it — the same defect BACKLOG-0001100 fixed for charts), so the first grid on a page to overflow claimed the key and a second, independently overflowing grid printed nothing; and a detached or `display: none` host falls back to a cached width for its "how much room is there" reading, so a host with nothing live to measure could still trip the warning with a misleading "the columns don't fit" message. The warning is no longer shared across every grid on the page — it is keyed per grid instead — and is no longer spent while the body viewport measures 0 width. <!-- not-breaking: corrects when and how often a console diagnostic prints, not a value or state a host's working code reads -->
  - Fixed a pre-existing 15px band where `fit()` did not converge within its own call: when a horizontal scrollbar's own height was the only reason a vertical scrollbar was drawn, removing the horizontal one could take the vertical one with it, growing the box the cells have after the widths above were already written and leaving a gap the width of the scrollbar. `fit()` now re-measures once after writing and fits again if the width moved.
  - Hardened test coverage: an explicit `min: 0` column still floors to its 40px minimum under too little room, not to 0 (which the renderer would have drawn at its own 150px default, disagreeing with the model); a pinned-right column is counted in the width `fit()` shares out, not only a pinned-left one.
  - Documented that the 40px floor applies to an explicit `min: 0` the same as declaring none, and that expanding or un-grouping a column group after `fit()` is another reason to call it again.

- **The live region swallowed a repeated identical announcement, so a refused action told a screen-reader user "no" once and then nothing** (BACKLOG-0001243). `Accessibility#announce()` (`packages/dom/src/renderer/a11y.js`) kept the last text it spoke and dropped an exact repeat — right for a status readout ("12 rows" heard twice would say the count changed when it did not) and wrong for the outcome of a discrete action: a user who tried the same refused header move, vetoed row drop, rejected edit, resize-at-minimum, ungrouping, paste, import or undo/redo twice in a row heard the refusal or confirmation only the first time, and the second attempt announced nothing at all — indistinguishable, to a screen-reader user, from the grid not having heard the key. `announce()` now takes an explicit `{ repeat: true }` at the call site, threaded down from every layer that carries a message to it, and is set at every call site that reports the outcome of a discrete user gesture (the header's keyboard resize/move/group, the group-by strip and tool panel's chip and row moves, row drag-reorder and cross-grid transfer including the BACKLOG-0001225 veto text, range paste, the CSV importer, and the grid-level edit-refused/undo-redo/pause-resume announcements). The grid's own structural summaries — sort, filter, selection count, group expand/collapse, column grouping, page position — are unaffected and continue to de-duplicate, because they describe current state rather than confirm one gesture. The rule for adding a new announcement is now written up in `docs/CONTRACTS.md` §7.3.

- **The three follow-ups the BACKLOG-0001098 plot-rect invariant found, closed** (BACKLOG-0001424).
  - **A panned or wheel-zoomed geomap painted its region paths past its own box.** A fitted geometry pack's regions are unclipped by the projection itself, so a pan or a wheel-zoom moved a region's vertices well past the chart's own edge — measured at x = 733 in a 700px viewBox — with nothing to stop them reaching the page beside the chart. `drawGeomap` now clips its marks group to the plot, the same way the cartesian family does, and holds every emitted coordinate inside the box, the same way a bar's is: a clip alone hides what is painted, but the coordinate is still in the exported SVG and still what the hit test is anchored to.
  - **`chart-waffle`'s cells ran past the bottom of its box.** The gap between cells was spent past the grid rather than carved out of it — a 10×10 grid landed at y = 433 in a 400px plot. The cell size is now solved for so the grid and its own gaps together never exceed the plot.
  - **`drawWaterfall` and `drawHorizontalBars` had the same unclamped geometry a plain bar had before BACKLOG-0001098.** A running total or a value outside a pinned axis placed a step or a bar's edge above or past the plot with nothing to hold it. Both now clamp through the same `withinRange` a bar already uses.

- **Thirty-odd more strings reached every locale in English, among them the reveal toggle on every password cell and everything the AI panel says while it works** (BACKLOG-0001427). BACKLOG-0001103 closed the *helper* path (`setText(node, 'No data')`) and deliberately left the direct sinks as they were — and those patterns need a quote immediately after the sink. `button.setAttribute('title', 'Show value')` is caught; `button.setAttribute('title', next ? 'Hide value' : 'Show value')`, which is what the password editor actually ran, is not, because the character after the comma is an `n`. `tools/messages.js` now reads the **whole expression** assigned at a direct sink (`.textContent`, `.innerText`, `.title`, `.placeholder`, `.ariaLabel`, `setAttribute` of an announced attribute) with the same analysis it already applied one call further out, and `tools/check.js` runs it. It found 43 places outside developer tooling on 2026-09-23, and each now resolves through the catalogue: the password toggle's tooltip and accessible name (`editor.password.show`/`hide`/`showField`/`hideField`); the rating *editor*'s readout, which had its own English beside the renderer's catalogue keys; the distribution band's suppression reasons and per-bucket count (`facets.computing`, `facets.suppressed.*`, `facets.bucketOf`); the set filter's summary (`filter.all`, `status.shownOfTotal`, both of which already existed); the undo bar's verbs and, as whole sentences rather than the button's own word lower-cased, its disabled states (`history.undo`, `history.redo`, `history.described`, `history.nothingToUndo`/`Redo`, `history.undoDisabled`/`redoDisabled`); the presence live region (`a11y.presence.joined`/`left`); the prompt bar's busy label and its overflow note (`prompt.asking`, `prompt.moreNotes`); the Mac modifier in the shortcut overlay (`shortcuts.key.cmd`); the timeline bar's two states (`timeline.live`, `timeline.recording`); the column panel's empty drop zones and the tool panel's row count (`panel.zoneHint.*`, `panel.rowsOf`, `count.rows`); the saved-views panel's empty state, diff readings and delete confirmation (`views.empty`, `views.applied`, `views.matchesGrid`, `views.delete`, `views.confirmDelete`, `views.confirmDeleteLabel`); the built-in loading and empty overlay components, which had English defaults beside the `overlay.*` keys the renderer's own overlays have always used; the gantt split view's row disclosure and over-allocated resource (`gantt.row.expand`/`collapse`, `gantt.resource.over`); and the kanban board's accessible name (`kanban.board`). The English is unchanged everywhere; the new keys are seeded in British English and listed as awaiting translation, as 1103's and 1172's were.
  - **A painter's state object is a sink too.** `paintActorBar(regions, { busy: true, status: 'Thinking…' })` writes English no rule could see: the literal sits in an object literal, and the `.textContent =` that renders it is a file away, reading `state.status`. The rule now records the *field* a function writes into a sink as part of what makes that function a sink, and reads the matching property of an object literal at the call site — which also catches a wrapper that takes the text itself (`fail(message)` painting `{ error: message }`). Everything the AI module says while it works now comes from the catalogue: `ai.thinking`, `ai.applying`, `ai.applied`, `ai.couldNotApply`, `ai.applyFailed`, `ai.discarded`, `ai.discardedNothingWritten`, `ai.nothingWritten`, `ai.nothingWrittenVetoed`, `ai.scope`, `ai.unsafeQuery`, `ai.nothingToDo`, `ai.insightsFailed`, `ai.modelUnreachable`, the ungrounded-figure note as a plural (`ai.flagged`), and the ask and actor bars' placeholders (`ai.askPlaceholder`, `ai.askLabel`, `ai.actorPlaceholder`, `ai.actorLabel`).
  - **Injected CSS uses the identical sink**, so the rule tells a stylesheet from a sentence before it reports anything: an expression with a selector and a declaration block in it, or an `@`-rule, carries no language — including a template broken into fragments by `${}`, which is judged whole rather than piece by piece. An escape sequence is resolved before the question is asked, so the pager's `` `${page} ` `` is a non-breaking space rather than a `u` and an `a`. And core is DOM-free (`CONTRACTS.md` §3.1), so a property assignment there is to a plain object — `pivotcolumns.js` naming a totals column — and is not judged as an element's tooltip.

- **The R² beside a trend line wrote its decimal separator as a full stop in every language**, so a French reader saw `R² 0.85` next to `0,85` everywhere else on the same chart (BACKLOG-0001427, F-1103-D). `toFixed(2)` formatted the digits; the grid's own locale number formatter does now, still to two places, in both `charts/cartesian.js` and `charts/trendline.js`.

- **The Gantt's own live region swallowed the second of two identical, back-to-back announcements — a resize refused twice, a link cancelled and re-started on the same task, a workload edit refused twice — because `#announce()` (`packages/modules/gantt/render.js`, `packages/modules/gantt/split.js`) reassigned the region's `textContent` to the same string it already held.** Reassigning identical text is still a DOM mutation, but a screen reader hearing the same string twice does not treat it as a new announcement, so the second refusal went unheard even though the sighted user watched the row or the bucket snap back a second time. `#announce()` now takes `{ repeat: true }`, threaded from every gesture the Gantt itself announces (there is no public `grid.announce()` to route through), and clears the live region before re-setting it, so the second announcement is a genuine value change rather than a same-value reassignment — the same principle `Accessibility#announce()` settled for the grid in BACKLOG-0001243, carried on the Gantt's own live region since it has no shared announcer to route through (`docs/CONTRACTS.md` §7.3).

- **Loading a `chart-*` extension (or `dhtmlx-compat`) before the module it shares its core or type registry with threw `TypeError: j is not a function` — a minifier-renamed local name, not a sentence a reader could act on** (BACKLOG-0001430, F-1306-A): the bundler's `__ext` helper returned the host's global as soon as it existed, even when the specific property a module needed from it had not been published yet, so the resulting `undefined` local surfaced only when it was later called. Every externalised named import now carries an explicit guard, emitted once at bind time right after the binding, that throws `[lattice] <module> needs <export> from the <source module> module. Load <source module> before <module>.` — a string literal, so the message is unchanged by minification. The bare-page case (no Lattice loaded at all) is unaffected and still reads `[lattice] … Load lattice-grid …`.

### Documentation

- **`CHANGELOG.md` gains a `### Breaking` section for 1.50.0 and 1.51.0, backfilling four disclosed behaviour changes that had shipped inside `### Changed` prose with no `### Breaking` heading to flag them** (BACKLOG-0001090): the OData adapter's zone-less date/time refusal (1.50.0), `result.total` becoming `undefined` from an OData source with `count: false` and from a GraphQL source with no `totalCount` (both 1.51.0), and an empty KPI panel's `tile.value` becoming `null` (1.51.0). This is a deliberate, disclosed correction of already-tagged sections, added retroactively — nothing about the shipped behaviour changes, only the record of it.
  - **Policy, written once in `changelog.d/README.md` and linked from `docs/CONTRACTS.md` §0:** a behaviour change a host's working code can observe — including a wrong answer being corrected — is breaking, whatever release it ships in; a correction MAY still ship in a minor, but MUST appear under `### Breaking`, at the top of the release notes. `### Breaking` is now an allowed fragment section in `tools/changelog.js` (`SECTIONS`), first in fold order.
  - **New gate:** `node tools/changelog.js check` (which `tools/check.js` runs) now also scans every fragment's bullets, and every bullet already under `## [Unreleased]` in `CHANGELOG.md`, for wording that names a behaviour change in any section other than `### Breaking`, failing by name — the file or heading, the bullet's position, the phrase found. The phrase list is `BREAKING_PHRASES` in `tools/changelog.js`. A flagged bullet that genuinely is not breaking can be marked with an HTML comment naming why, which this one carries deliberately since it names the phrase list rather than any behaviour change. <!-- not-breaking: this bullet documents the gate's phrase list itself, not a breaking change -->

- **The API reference printed type names it never defined and never linked: `density  Density  Row height and padding as a named step` was a word with nowhere to go** (BACKLOG-0001420). The reference published 529 interfaces and 3,744 members, and named a declared type 2,196 times across its Type, Signature, Returns, Parameters and Payload cells — not one of those names was a link, and the 104 exported type aliases had no entry on the page at all, so `Density`, `Operator`, `SourceConfig`, `FilterSet` and `ShadowKind` were words a reader had to already know. `docs/API.html` now ends with a **Types** section, alphabetical and in the rail, giving every exported alias its own `#type-<Name>` anchor, its description, and its definition in full with each type inside that definition linked in turn — so `SourceConfig` leads to the five source configs rather than stopping at a word. Every declared name in every cell is now a link to its entry, whether it stands alone or sits inside a union, an array, a generic or a function signature; a name inside a string literal stays text, because `SpecStatus` is `'PASS' | 'WARN' | 'FAIL'` and `PASS` is a value. A short union alias is additionally spelled out beside the link, so the cell the owner was reading now says `Density` *and* `'compact' | 'standard' | 'comfortable' | 'spacious' | number` and needs no click at all; a long one (`EventName` is 162 entries, `IconName` 55) keeps the link, which is what a link is for. All of it is generated from the declarations by `tools/apiref.js`, so a type added to `types.d.ts` gets its entry and its inbound links with no second list to maintain.
  - **The hand-written tables link too.** The generated appendix begins 9,100 lines into the page; everything before it — the configuration table, the column table, the module tables, the ones a reader meets first — is written by hand, and its 835 Type cells named 109 declared types as plain text. A post-pass in the generator now links those cells on exactly the same rule, and recognises a type that a hand-written cell *spells out* rather than names: the configuration table's `density` row reads `'compact' | 'standard' | 'comfortable' | 'spacious' | number` and now carries a link to `Density` beside it, and `theme` the same. Prose is untouched, `<td class="sig">` cells are untouched (they hold call expressions, not types), and a hand-written link already in a cell keeps its own destination.
  - **`#ai` pointed at two different sections.** `id="ai"` was on both `grid.ai` and "The AI narrative / insights layer", so the browser resolved it to the first and the AI module's section could not be linked to at all. The module section is now `#ai-narrative`. No existing link changed meaning: the one `href="#ai"` on the page meant `grid.ai` and still reaches it.
  - **24 of the 104 aliases had no description**, among them `Operator`, `SourceConfig`, `PermissionPolicy`, `ShadowKind`, `TypeName`, `Comparator`, `FilterSet` and `TotalFn`. Each now says what its values mean to somebody choosing one. `tools/check.js` counts an undescribed alias exactly as it counts an undescribed member — in the same ratchet, which stays at zero — and names it, so a new type added without a sentence fails the gate by name rather than as a number that went up by one.
  - **Unchanged.** No anchor on the page moved or disappeared, apart from the duplicate above: the 883 existing `id`s are all still there, with 105 added. The site vendors `docs/API.html` as it stands, so every rail link it already publishes still resolves.

- **The API reference was one 2.4 MB page with 989 anchors in it, which is a document you scroll rather than one you read** (BACKLOG-0001421). It is now also published a page per module under `docs/api/`: an index, `grid.html`, `charts.html`, `data-router.html`, `kpi.html`, `kanban.html`, `gantt.html`, `tabs.html`, `layout.html`, `ai.html`, `mock-socket.html`, `adapters.html` and `types.html`. Each one is self-contained — its own title, rail and copy of the shared stylesheet, nothing fetched at runtime — and carries the narrative sections for that module, its generated interface tables, and links that reach the page owning whatever they name: a type named on the kanban page goes to `types.html`, an event goes to `grid.html`. `docs/API.html` is unchanged and still carries the whole reference on one page, which is what to open when you would rather search than navigate, and the index links to it as exactly that. Both layouts are rendered from the same model by the same renderers, so the two cannot drift apart, and the build gate regenerates all thirteen pages and compares them byte for byte, fails naming any anchor of the single page that is on no page or on two, and resolves every link — including the ones out to the guide — so a reference with a hole in it cannot ship. The pages ship in the npm package and the public repository beside `API.html`. One link was already broken and is fixed with them: the KPI section's "tree data" pointed at an anchor that only ever existed in the developer guide.

- **A `Type` cell for a config property read the values out in place instead of naming them: `direction  'ltr' | 'rtl' | 'auto'` had nowhere to link to** (BACKLOG-0001422). Every inline literal-string union on `GridConfig`, the other `*Config`-suffixed interfaces (core and module-scoped), and the `origin` field the grid's own events and Kanban's share — 30 properties, plus the 14 further `origin` sites across `GridEvent`, the Kanban event payloads and the Tabs/Layout viewer events — now names a documented `export type` alias instead: `Direction`, `TargetSize`, `HeaderControlsVisibility`, `EventOrigin`, `ViewerOrigin`, `SelectionMode`, `EditMode`, `FacetBucketStrategy` and 24 others. Each alias carries its own entry in the API reference's **Types** section (BACKLOG-0001420) and is reachable by name: `import type { Direction } from '@toclocoinc/lattice-grid'`, `import type { SlaAgeingBasis } from '@toclocoinc/lattice-grid/modules/kanban'`. Declaration-only: no runtime behaviour changed, and `CONFIG_SHAPES` in `grid.js` is unchanged — `checkConfigShapes` in `tools/check.js` now resolves a property's type through a single-line alias before comparing it against the shape table, so a key CONFIG_SHAPES already lists does not go stale just because its type was renamed.
  - **The remaining ~168 inline unions are a separate card.** Event payloads, the statistics/ADF surface, the router protocol and Gantt's scheduling internals were established but intentionally left alone here — a `*Config` interface is a bounded, reviewable surface; the rest needs its own naming pass.

- **The remaining inline literal unions outside the config interfaces — event payloads, the statistics/ADF surface, the router protocol, Gantt internals, chart annotations, and the KPI/AI/tabs/kanban module surfaces — now name a documented `export type` alias too** (BACKLOG-0001429, following BACKLOG-0001422's `*Config` pass). 101 new aliases, taking the API reference's **Types** section from 135 to 236, every one described and reachable by name: `RowChangeKind`, `Edge`, `SortDirection`, `WindowKind`, `OutlierMethod`, `KpiStatus`, `ThresholdLevel`, `ChartScale`, `AnnotationKind`, `MapProjection` and 91 others, at the package root or from the module subpath a property's `declare module` block resolves to. A handful of pre-existing aliases from the earlier pass (`EditMode`, `HeaderControlsVisibility`, `DerivedRefresh`, `RowTransferMode`, `FacetBucketStrategy`, `FacetDateGranularity`) are reused rather than duplicated at the sites that share their exact member set; where a site's set is a genuine subset of an already-named one (`OutlierMethod`, `Returning`, `SignificanceTest`, `DriftMeasure`, `EventOrigin`, `Direction`), it is typed as `Extract<Wider, …>` instead of minting a fourth near-identical name. Declaration-only: no runtime behaviour changed, and `CONFIG_SHAPES` in `grid.js`/`checkConfigShapes` in `tools/check.js` are unaffected — every touched site sits outside `GridConfig`'s own top-level members.
  - **Method-parameter unions (as opposed to property declarations) are a separate card**: `StatisticsApi.running`'s `kind` parameter, `expand`/`collapse`/`toggle`'s `axis` parameter, `RouterDelta.op` and the rest of the ~29 inline unions a broader sweep of the file turns up in function/method signatures and un-exported router/router-adjacent internals rather than at a property; the established scan (and this card) covers property positions.

### Internal

- **The capability registry counted a config key once however many interfaces declared it, so a key reused on a second surface was invisible to the completeness gate** (BACKLOG-0001426). `collectConfig` deduped by bare name across every `*Config`/`*Options` interface, so the first interface to declare a name owned it: adding `maxAge` and `ageBy` to `KPIConfig` moved the capability count 927 to 927, because `StreamSourceConfig` had declared both already, and `config:maxAge` went on reporting "documented, demonstrated and tested" off the stream source's coverage. Delete the KPI freshness implementation whole and no number would have moved. The same blind spot hid a second `messages` surface (BACKLOG-0001418). A config capability is now one `(interface, key)` pair — `config:KPIConfig.maxAge` — with its own coverage, and the gate names the surface when one is short. **The honest count is 1,170 capabilities, up from 1,070**: 100 config surfaces existed all along and were being credited by another interface's tag. Every one of the 100 shared its name with an earlier, tagged surface, and not one had a tag of its own.
  - **What a bare tag still credits.** A `// @covers config:maxAge` tag credits the first-declared surface only — core interfaces are declared before module ones, so the first surface is the one whoever wrote the tag meant — and a later surface has to name itself. A `data-covers` block credits every surface of the key it names: an example is a documentation artefact keyed by the symbol a reader searches for, and the claim that leaked was never the prose, it was "this was executed against this surface".
  - **The debt is frozen once, by name, and only shrinks.** `tools/capability-baseline.json` lists the 98 surfaces that were uncovered the moment they became visible, with the reason. Anything not on that list carries its own `@covers` test or the gate is red, and an entry that has since been covered fails the gate until it is deleted.

## [1.69.0] - 2026-09-22

### Fixed

- **Sixteen more strings reached every locale in English, among them a screen-reader user's only way to tell one entry in the presence roster from another** (BACKLOG-0001172). `tools/check.js` refuses a literal *assigned* to a text sink, so a ternary (`unresolved ? 'Resolve' : 'Reopen'`), a call argument (`#note('Loading…')`), a concatenation (`+ ' (edited)'`) and a template literal (`` `${peer.name}, idle: jump to their cursor` ``) all walked past it. Each now resolves through the message catalogue: the presence roster's entries (`presence.peer`, `presence.peerIdle`, `presence.peerHidden` — three sentences, not a name with clauses appended, because a peer this view cannot scroll to says something different rather than something longer); the comment panel's resolve button, loading and empty notes, unnamed author, edited marker and heading (`comments.resolve`, `comments.reopen`, `comments.loading`, `comments.empty`, `comments.unknownAuthor`, `comments.edited`, `comments.cellTitle`); and the gantt's pointer tooltip (`gantt.tip.range`, `gantt.tip.duration`, `gantt.tip.slack` — plain strings like `gantt.lag`, since the day unit is an abbreviation that does not inflect). A column heading's reduction prefix now reads the catalogue's `total.*` keys, the same ones the tool panel already used, instead of the English string table in `packages/core/src/compute/total.js`: BACKLOG-0001106 translated the tooltip around the word and left the word itself, so a French grid read "Sum de Qty". A reduction supplied as a function takes the new `total.custom`, and the two capability reductions gained the keys they never had (`total.passRate`, `total.failureCount`) — without them the tool panel's chooser rendered the raw key. The English is unchanged everywhere; the new keys are seeded in British English and listed as awaiting translation, as the 1106 keys were.

- **The presentation rail could stay hidden with the annotation tools registered but invisible, depending only on which of two handlers heard `presentation:started` first** (BACKLOG-0001222). `packages/dom/src/toolpanelmount.js`'s `ToolPanelDock` decided whether to keep the rail visible (`presentOnly()`) purely from the rail's contents at the moment it was asked, and only the presentation controller (`packages/dom/src/presentation.js`) ever asked. If the controller's `presentation:started` handler ran before the dock's own (which adds the four annotation tools), it found nothing to keep, hid the rail as ordinary chrome, and nothing ever asked again — the tools then arrived registered, in the DOM, inside a `display: none` subtree. The dock now learns `presentation:started` / `presentation:ended` directly (`#presentationActive`, independent of the takeover record) and starts the takeover itself — reopening the rail if the controller already hid it — the moment an annotation tool is added while a presentation is running and no takeover is yet in force. Order no longer matters; the five points BACKLOG-0001213 established are unchanged.

- **An end-pinned column's heading sat flush with the grid's right edge while its cells stopped short by the vertical scrollbar's gutter, overhanging its own column** (BACKLOG-0001395). The end-pinned body region is `position: sticky` inside the scroll container, so the browser already insets it by whatever the vertical scrollbar takes — a transparent border under `scrollbars: 'custom'`, the platform bar under `'auto'`/`'always'`, nothing where there are too few rows to scroll. The header sits outside the scroll container as a plain flex row with no such inset, so it never moved. The renderer now measures the body's actual inset each frame and reserves the same width on the header, in every mode, with and without a visible scrollbar, and after a resize that brings one in or takes one away. The pinned-row strip (the grand total row) was already correctly aligned and is unchanged.

- **Every grid configured with `messages` was told the key was unknown, though it worked** (BACKLOG-0001418, F-1172-A). `messages` is a documented, working localisation option (`createGrid(element, { locale: 'fr-FR', messages: FR_FR })`) with a `CONFIG_DEFAULTS` entry, but `KNOWN_CONFIG_KEYS` never named it, so every host using it got `'messages' is not a configuration key this grid recognises, so it had no effect.` `GridConfig` in `types.d.ts` didn't declare it either — the two "source of truth" lists agreed with each other only because both silently omitted it, which is why the gate's declared-vs-known check didn't catch it. Both are fixed: `KNOWN_CONFIG_KEYS` now names `messages`, and `GridConfig` now declares it, so the runtime and the type agree because both are complete.

### Internal

- **The scroll-sync release test failed on a grid that was correct on screen** (BACKLOG-0001396). `test/header-scroll-sync-browser.test.js` sampled the header's computed `transform` inside the `scroll` event, which on Linux 7.0.0-31 reads exactly one scroll event stale on every sample — 21-39px of reported lag on the unchanged product, and the reason 1.68.2 was tagged with a red test. It now measures the frames the compositor painted: `Page.startScreencast` records the gesture, a colour-coded marker at the leading edge of every centre cell locates the header's, the body's and the pinned strip's paint in each frame, and every frame must agree to within a pixel. Both arms are kept: on the unchanged product the header is painted at the body's own offset on 123 of 123 frames of an ordinary gesture and 63 of 63 of the expensive-frame arm, and the strip within a pixel of it.
  - **`tools/browser.js` publishes protocol events.** `browser.on(method, handler)` delivers the events the driver used to parse and drop, which is what makes a screencast readable; replies to commands are routed exactly as before.
  - **`docs/CONTRACTS.md` §7.2** records the rule the failure taught: a main-thread read is not evidence of what the compositor painted, so a visible defect is asserted on frames.

- **Every browser test file idled up to 30s after its last assertion ran** (BACKLOG-0001417, F-1396-A). `tools/browser.js`'s `Browser#send` armed a 30s `setTimeout` per DevTools Protocol command and never cleared it once the reply arrived, so each answered command left a live timer in Node's event loop for the rest of its 30s span — about 100 `*-browser.test.js` files paid that tax on every run (`test/header-scroll-sync-browser.test.js` alone: 7.2s of real test work, 37.2s file exit). The reply handler now clears each command's timer the moment it resolves, `close()` clears and rejects any command still genuinely awaiting a reply instead of leaving its timer armed, and the 5s process-exit fallback inside `close()` is cleared on the early-exit path too. A command that never gets a reply still rejects with exactly the same `<method> timed out` error after the timeout, which is now overridable per instance (`new Browser({ commandTimeoutMs })`) so a test can prove that without waiting out the real 30s.

## [1.68.2] - 2026-09-22

### Changed

- **Eleven declared options did nothing, or something other than what they said** (BACKLOG-0001388). *Recognise your own case: you read an option in the reference, set it, and nothing happened — with no warning, because the grid had no code to warn from.* A declared key is now either implemented as declared or not declared, and `tools/check.js` fails the build when a declared config, column or element key is read by no file under `packages/`.
  - **Implemented.** A column's `cell.flash` flashes that column's changed cells, with its own colour and duration, instead of needing `highlightOnChange` over the whole grid. A colour scale's `mid` pins the value the middle colour is reached at — it was ignored, so a three-colour scale over -100..900 put its neutral colour at 400 however plainly `mid: 0` was written. A band's `marryChildren` keeps its columns together: a drag, keyboard move or menu move that would take one out, or drop an outsider in, is refused with a warning. A custom editor's `cancelOnClose()` is asked on the commit path every edit ends at, so an editor that returns `true` has its value discarded instead of written.
  - **Made true.** `rows.expand(key, true)` opens that row's own subtree and leaves the rest of the grid as it was; it called `expandAll()` and opened every group in the grid. `edit.start: 'key'` binds no mouse gesture, for a grid read with the mouse and written with the keyboard; it behaved exactly as `'double'`. A correlogram's `method: 'kendall'` computes Kendall's tau-b — which `grid.statistics` already carried — instead of drawing Pearson's r under the name tau. `display: 'switch'` on a boolean format renders its own glyph pair, distinct from `'checkbox'`. `exportMSPDI` reads the `{ name: capacity }` form of `resources` that `createGantt` schedules with; the map was dropped and every resource exported at capacity 1. `csv({ hidden: true })` and Excel's `hiddenColumns: 'hidden'` carry the grid's hidden columns into the file — neither could, because the export context named no `allColumns`. A Data Router write context's `source` names the `addSource` feed the edited row arrived on, the one to persist back to on a fan-in router, instead of always being `null`.
  - **Shorthands that reached nothing.** `<lattice-chart stacked|horizontal|data>`, `<lattice-kanban titleProperty>` and `<lattice-gantt scale>` are now the shorthands their names promise (`stack`, the `horizontalBar` type, `rows`, `card.title`, and the timeline zoom). An explicit viewer key still wins where both are given.
  - **Narrowed or removed** — a `CONTRACTS.md §0` controlled-surface change, so read this one if you compile against the types. `lockPosition` loses `'start' | 'end'`: every reader tested truthiness, so neither ever placed a column, and a column still locks wherever it sits. `ColumnCellSpec.autoHeight` goes — rows that grow to fit are the grid-level `autoHeight`, and `cell.wrap` is the per-column half that works. `<lattice-kpi theme|density|format>`, `<lattice-kanban facets>`, `<lattice-chart formatting>` and `<lattice-gantt hoursPerDay>` go: a panel mirrors the theme and density of the grid it belongs to, KPI formatting is per tile, a board is filtered through `filter`/`quickFilter`, a chart formats through the grid, and `hoursPerDay` is an `exportMSPDI` option. `Chart.element` is an `HTMLElement` (it is the wrapper; the `<svg>` is inside it) and `Chart.toPNG` resolves `Blob | null` (it resolves `null` where there is no canvas). The Gantt's project earned-value total has its own type rather than claiming five task fields it has never carried. `ViewsApi.export`, `import` and `save`, and `ExportApi.print`, state the signatures they have; `save`'s `overwrite` was read nowhere.
  - **Declared at last.** Members the code has always produced: `GridState.quickMode`, `redaction` and `facets`; `SelectionApi.summary()`; `ColumnProfile.numeric` and `coverage`; `NumberFormat.compactDisplay`; `UnitConfig.significantFigures` and `nullDisplay`; `CsvExportOptions.sanitise`, `bom` and `hidden`; `ExcelExportOptions.autoFilter`.
  - **Counted at last.** `tools/capabilities.js` reads a KPI tile's options, which its `*Config`/`*Options` name rule could not see, so the registry and the completeness gate cover them: 913 capabilities before, 926 after.
  - **Unchanged.** Every other declared key behaves exactly as it did; nothing here changes a default.

### Fixed

- Pressing Enter or Space on a column heading that had nothing to do with the key — a heading whose controls are hidden, or one whose column cannot be sorted — opened an editor on a body cell the user could not see, and Space typed a space into it (BACKLOG-0001170). The heading now consumes the press and does nothing; keys it declines (Escape, Ctrl+Alt+H) still reach the page, and ArrowDown still leaves the header for the data.

- **A `beforeColumnResize` or `beforeColumnMove` veto did not stop a header drag or key chord** (BACKLOG-0001392). *Recognise your own case: you refuse a resize, and the column still looks resized on screen — but `columns.get()`, a saved view, an export and autosize all say it never changed; a refused move still reached your `column:moved` handler, and the keyboard announced "resized"/"moved" for a change that had not happened.* Both gates only ever guarded `grid.columns.resize()` and `grid.columns.move()`: the header is handed the column model directly, so a drag, a drop, Alt+Arrow or Shift+Arrow went straight past them. A vetoed header gesture is now a no-op end to end — no `column:resized` / `column:moved`, no width override, no repaint, nothing announced, and only `columnResize:cancelled` / `columnMove:cancelled` fires, carrying the same `{ column, width | to, reason }` the API path carries. An accepted gesture is unchanged. A handler that returns a promise holds the gesture: nothing is applied while it thinks, and a drag that is refused hands its live preview back.

- **A chart's `brush` event could only be vetoed by writing `defaultPrevented` onto the payload; `click`'s `preventDefault()` had no counterpart** (BACKLOG-0001393). A handler that wanted to stop a drag zooming the chart's own domain or filtering the grid had to know the low-level flag, and the generated reference printed `brush` as not cancellable even though the chart honoured a veto — a host reading the docs alone would never find the way out. `ChartBrushEvent` now carries `preventDefault()`, built and checked exactly as `click`'s; writing `defaultPrevented` directly still works. The reference's Cancellable column now reads yes for `brush`.

### Documentation

- **The events table listed 162 grid events and could only say what 18 of them carry: the other 144 printed `unknown` as their payload and `—` for cancellable** (BACKLOG-0001389). *Recognise your own case: you bind `grid.on('cell:mouseover', …)`, and the reference tells you the event exists but not what arrives, so you log the payload to find out.* Every event now publishes three things read off the declarations: **when it fires**, written from the code that emits it rather than from its name; **what a handler receives**, as a named payload interface whose every member is described; and **whether it can be cancelled**. 158 payload interfaces were written for the events that had none, and an event that carries nothing of its own says "no payload" rather than `unknown`.
  - **The cancellable before-events say what they carry.** `beforeSort`, `beforeFilter`, `beforeSelect`, `beforeEdit`, `beforeColumnMove`, `beforeColumnResize`, `beforeColumnHide`, `beforeRowAdd`, `beforeDelete`, `beforeRowMove` and `beforeGroup` were all typed as the bare `BeforeEvent` — `preventDefault` and nothing else — while the emitter hands each of them the action's own context. Each now has its own payload (`BeforeSortEvent` carries the `sort`, `BeforeDeleteEvent` the keys, `BeforeColumnResizeEvent` the width, and so on), matching the `<action>:cancelled` event that follows a veto.
  - **`column:pinned` said the wrong thing.** Its `side` was declared as `'left' | 'right' | null`; the value a handler actually receives is the writing-direction side `grid.columns.pin` takes — `'start' | 'end' | null` — so a right-to-left grid reports the same value for the same gesture.
  - **The kanban board, the KPI panel and the dashboard layout now publish their own events.** Their `on()` was declared as `on(name: string, …)` (and the layout's handler as `any`), so the reference could only say "this surface raises events, but the names are not declared". Each declares a `KanbanEventName` / `KPIEventName` / `LayoutEventName` union and a payload map beside it, and the reference prints their tables: 33 board events, 5 panel events and 10 layout events, each with when it fires, its payload type and whether it is cancellable. A mistyped name is now a type error rather than a handler that never fires, and a test pins each union to the list its emitter checks against at run time.
  - **Unchanged behaviour.** Declarations and generated documentation only: no runtime code changed, and every existing handler keeps working.

- **Five module surfaces published their events as `unknown`, as `object`, or as cancellable when they are not** (BACKLOG-0001390). *Recognise your own case: you write `chart.on('click', p => p.category)` and TypeScript says `p` is `unknown`, so you log the payload to find out what is in it; or you read in the reference that `tabChange:cancelled` is cancellable, write a handler that calls `preventDefault()` on it, and nothing happens — the switch was already refused when it fired.* The tabbed grid, charts, the AI controller, the Gantt and the Data Router now declare their own `<X>EventName` union and `<X>EventPayloads` map, written from the emit sites, so the reference prints when each event fires, what a handler receives and whether it can be cancelled: 32 events across the five, every one with a described payload, and cancellable exactly where the emitter offers a veto.
  - **Tabs.** One payload typed all three events, and it carried `preventDefault` — so the table said `beforeTabChange`, `tab:changed` and `tabChange:cancelled` were all cancellable. Only `beforeTabChange` is: `tab:changed` (`TabChangedEvent`) and `tabChange:cancelled` (`TabChangeCancelledEvent`) report a decision already taken, and the cancellation carries the resolved `reason`. The gate's `origin` is `'api' | 'user'` — the opening tab is activated silently and raises no `beforeTabChange` at all.
  - **Charts.** Eight events printed `unknown` and "—"; the mark's shape lived in the union's prose. `hover` and `click` now declare that flat shape (`label`, `value`, `category`, `column`, `series`, `rowKeys`, `path`, a histogram bin's `from`/`to`, `native`), and `draw`, `drill`, `brush`, `focus`, `legend` and `leave` each declare their own. Every payload carries the `type`, `chart` and `grid` the chart's dispatcher adds. `click` is the one that carries `preventDefault` — it is how a host takes the filter over — and `Chart.emit()` is declared as returning the payload the handlers saw, which it always did.
  - **AI.** `on()` took `'narrative' | 'query' | 'proposal' | 'error' | string` and typed every handler as `object`; the `| string` is gone and each event names its result type. `error` fires for a missing `ask()` as well as a thrown one, and carries exactly one of `target`, `question` or `instruction` — whichever run failed — rather than the `target` it was declared with.
  - **Gantt.** `on()` declared two names, `schedule` and `error`, with `unknown` payloads. The controller also raises the seven cancellable gates a host writes confirm-before-write against (`beforeTaskMove`, `beforeTaskResize`, `beforeProgressChange`, `beforeMilestoneMove`, `beforeTaskEdit`, `beforeDependencyCreate`, `beforeTaskDelete`) and their seven `…:cancelled` notifications; all sixteen are declared, with the edit context each carries and the `reason` a refusal reports (`'stale'` when the task moved while a handler was thinking).
  - **Data Router.** `metrics` is still the only event; it now says when it fires — the `metricsInterval` timer, which runs only while a listener is registered.
  - **Unchanged behaviour.** Declarations and generated documentation only: no runtime code changed, no event was added or removed, and every existing handler keeps working. A TypeScript host that read arbitrary members off an `unknown` or `object` payload now narrows on the event name instead, and a misspelt event name is a type error rather than a subscription that never fires.

- **The API reference described the grid's events twice, and the two disagreed** (BACKLOG-0001391). *Recognise your own case: you look up `beforeRowReceive`, find a hand-written row saying one thing and a generated row saying another, and have no way to know which is the release you installed.* The hand-written Events section — a 130-row table maintained by hand — is cut to a short lead-in: what a handler receives (the `GridEvent` envelope, and what `origin` is for), how a `before…` veto works with `preventDefault(reason?)`, and a link to the generated table, which carries when it fires, the payload and cancellable for all 162 events and is regenerated from the declarations on every build. The two executed examples (a declared event is bindable without a warning; guarded editing and confirm-before-delete) stay where they are, and every anchor the site and the guide link to — `#events`, `#event-known-example`, `#before-events-example` — still resolves.

- **`beforeRowReceive` was filed under "Print" in the event table.** It sits after the print pair in the declared union and its run comment was a paragraph rather than a label, so the generated "Raised by" column inherited the previous heading. It now reads "Row transfer between grids (BACKLOG-0001225)".

- The npm README carried no path from the package page to the demos: a reader saw the API and the licensing section but no evidence any of it ran (BACKLOG-0001394). A new **Live demos** section, ahead of Documentation, names five demos by URL (earthquakes through the Data Router, a TfL real-time stream, flights over DuckDB, FRED vintages rewound, earthquakes in React) and links the full gallery and every demo repository.

## [1.68.1] - 2026-09-22

### Fixed

- **A `horizontalBar`'s axis titles named the axis they were not drawn on** (BACKLOG-0001680). `axis.y.title` (the measure) drew rotated on the left, beside the category tick labels, and `axis.x.title` (the category) drew along the bottom, beside the measure's numbers — exactly as a vertical `bar` draws them, even though a horizontal bar swaps which side carries which. Both titles now swap sides with the axes they belong to on `horizontalBar`; a vertical `bar` and every other cartesian type are unchanged.

- **`filter: { enabled: false }` also dropped a column out of the quick filter, with no way to keep it searchable short of hiding every header control** (BACKLOG-0001681). `filter.enabled` is a column's own funnel/menu control; quick search reads across every column rather than filtering one, and the two were never meant to be coupled. `filter: { enabled: false }` now removes only the funnel — the column stays quick-searchable and still accepts a declarative filter. A new `quickFilter: false` column key is the way to exclude a column from quick search while leaving its funnel alone.
  - **Behaviour change.** A host that relied on `filter: { enabled: false }` to keep a column out of quick search must now set `quickFilter: false` explicitly; `filter.enabled` no longer touches quick search at all.

### Documentation

- **The API reference listed interfaces alphabetically by type name, printed events only as a list of names, and let 1,369 members ship with no description** (BACKLOG-0001682). *Recognise your own case: you wanted to know how to remove a row and had to already know the interface is `RowsApi`; you wanted to know what arrives with `rows:changed` and the page could only tell you the event exists.* The generated appendix in `docs/API.html` is now organised by surface, and within each surface it prints the three lists a reader asks for — **Properties**, **Methods** (full signature, parameters, return type) and **Events** (name, when, payload type, cancellable) — as three separate tables with their own headings and sidebar entries. A surface with no events says "No events." rather than dropping the table.
  - **The structure is derived, not maintained.** A member declared with a call signature or typed as a function is a method and everything else is a property; the groups come from reachability (the grid instance and its sub-APIs, configuration and everything reachable from `GridConfig`, each module's own `declare module` block and what its exported signatures name, the framework adapters) with the remaining value types in an alphabetical glossary the generator names on stdout. A new interface lands in the right group with no list to update.
  - **Every event is published with its payload.** The table is generated from the `EventName` union — whose subsystem comments become the "raised by" column — and from a new `EventPayloads` map in the declarations, so 18 events now name a typed payload (`RowDragEvent`, `BeforeEvent`, `BeforeRowReceiveEvent`, `RowReceiveCancelledEvent`, `StateChangedEvent`) and the rest print `unknown` rather than nothing. Cancellable is read off the payload type: a payload carrying `preventDefault` is cancellable, an undeclared payload prints `—` rather than claiming the event cannot be cancelled.
  - **An undescribed member can no longer ship unnoticed.** `tools/check.js` holds the count of undescribed members and undeclared event payloads against `tools/apiref-baseline.json`, fails when it climbs, names the interfaces with the most gaps, and says what the baseline can be lowered to. The baseline starts at the 1,533 measured today and only goes down.
  - **The declaration reader was losing members and inventing one.** Generic methods (`grid.get<K>`, `grid.set<K>`) and index signatures were silently absent from the page (8 members), a member whose name is a quoted string was unreadable, and the continuation line of a signature that wraps across lines was published as a member of its own — `StatisticsApi.fitShadow` wrapped, so the reference carried a phantom `rowKey` member with a nonsense type and a truncated signature (F-1687-11). Wrapped signatures now publish whole, the phantom is gone, and the published member count is 2,847 rather than 2,834. No runtime change.

- **802 members of the core API reference had a name and a type and no description** (BACKLOG-0001683). *Recognise your own case: you open the type reference in `docs/API.html`, find `ResolvedColumn` or `RowsApi`, and every row tells you the member exists and nothing about what it does — so you read the source, or guess.* Every one of those members now carries a sentence written from the implementation, not from the name: what a method does, what it returns and what it refuses; what a property holds, its default and when it changes; what an option controls and its unit. The same text is on the declarations, so an editor shows it on hover as well. Across the whole reference, members with a description went from 1,453 of 2,822 to 2,255 of 2,822; the 140 core interfaces on this pass are complete.
  - **Five declarations are described by what they actually do rather than by what their name suggests, because nothing reads them.** `ColumnHeaderSpec.tooltip` is never drawn (use `header.render`, or `cell.tooltip` on the cells); `ColumnCellSpec.flash` and `ColumnCellSpec.autoHeight` reach nothing (the working settings are the grid-level `highlightOnChange` and `autoHeight`); `ColumnLayoutSpec.lockPosition` reads only truthiness, so `'start'` and `'end'` lock a column where it already sits rather than moving it; `FormattingScale.mid` is not read, and a three-colour scale comes from giving three `colours`. `Editor.cancelOnClose` is likewise never consulted — an editor cancels through `params.stop(true)`.
  - **Unchanged behaviour.** Declarations, names, types and ordering are exactly as they were; this is comment text and the generated type appendix it produces.

- **567 members of the module APIs (charts, boards, Gantt, KPI, data router, tabs, layout, adapters) had no description in the reference; every one now says what it does** (BACKLOG-0001684). *Recognise your own case: you opened the type reference, found the member you wanted, and the Description column was empty — so the only way to learn what an option controlled, what a method returned, or what a figure was measured in was to read the source or guess from the name.* Every member of the 103 module interfaces now carries a sentence written from the implementation: what a method does and returns, what a property holds and when it changes, what an option controls, what its default is, and the one non-obvious rule where there is one. Units are named, and so are the places a value is null rather than zero.
  - **Written from the code, not the name.** Where an option is declared but never read, the description says what actually happens instead of what the name implies — `<lattice-chart>`'s `stacked`, `horizontal`, `data` and `formatting`, `<lattice-kanban>`'s `titleProperty` and `facets`, `<lattice-kpi>`'s `theme`, `density` and `format`, and `<lattice-gantt>`'s `scale` all reach a viewer that does not read them, and each now says so and points at the option that works.
  - **Unchanged.** Declarations, names, types and behaviour: this release adds documentation comments only. `docs/API.html`'s type appendix is regenerated from them.

## [1.68.0] - 2026-09-21

### Added

- **A KPI tile's movement line always printed `Δ (Δ%)`, with no way to print the difference alone** (BACKLOG-0001676). *Recognise your own case: a rate series (unemployment 4.10 vs a 4.30 baseline) where the percentage is a percent-of-a-percent and meaningless, so the baseline had to be dropped and the movement line lost with it.* A new tile option `delta: 'absolute' | 'relative' | 'both'` (default `'both'`, unchanged) chooses what the line prints against `baseline`: the difference alone, the percentage alone, or both together. The arrow and its colour are unchanged.

### Fixed

- **A `combo` or `pareto` chart drawn over a date or number column drew its bars and lines in grid row order, one axis label per row, ignoring both the column's type and `axis: { x: { scale } }`** (BACKLOG-0001672). `drawCombo` always built a band scale regardless of what the binder had already worked out, and `bindMeasures` dropped `spec.axis` before handing each measure to the binder, so the override could never reach it either. A combo or Pareto over a temporal or numeric x now draws the same continuous time/linear axis a `line` over that column draws, sorted by value, with `axis.x.scale` honoured exactly as it is everywhere else; a bar measure on that continuous axis takes its width from the median gap between neighbouring x values. A dated combo that used to draw newest-first with one label per row now reads left to right in time, calendar-spaced.
  - A vertical annotation band or line placed on a combo's now-continuous x scale, rather than silently vanishing against the band scale it used to build.
  - An annotation the chart genuinely cannot place — an x value that will not resolve, or a band whose edge cannot be placed — now warns once, naming the annotation's kind, the axis it reads and the reason, instead of disappearing with no trace.

- **A time axis spanning more than about fifty years drew a single tick, labelled with the epoch**, because `TIME_STEPS` jumped straight from ten years to a hundred with nothing in between (BACKLOG-0001672). Gained 20-, 25- and 50-year rungs, and every year-scale tick — the existing decade and century rungs included — now lands on a real calendar year rather than a multiple of 365 days, which used to drift a decade tick two days earlier on every step (1970, 1974, 1979, 1984…). A 1970-to-2026 axis now draws six ticks at 1970, 1980, 1990, 2000, 2010 and 2020, not one at "1970".

- **A combo measure's `title` was declared and accepted and never drawn** — the legend and axis title read the measure column's own title instead (BACKLOG-0001672). `title` is read now, with the previously-undocumented `label` kept as a working alias when `title` is absent.

- **A KPI tile `id` containing a dot silently turned the whole panel into a collapsed tree rail, with no `tree` config and no warning** (BACKLOG-0001673). *Recognise your own case: a tile named `UNRATE.latest` for reasons that have nothing to do with a hierarchy, rendered as a collapsed node beside your other flat tiles.* `tree` is now the opt-in the docs already described: a dotted id builds a hierarchy only once `tree` is set to an object; unset (or `false`), the panel renders every tile flat exactly as before, and a dotted id seen with `tree` unset warns once — "kpi: tile ids contain dots; set `tree` to render them as a hierarchy" — so the opt-in is discoverable rather than a silent trap. Existing configs that already pass `tree: {}` (or a declared `path`/`parentKey`) are unaffected.

- **`createTabs` set `height: 100%` on the host element it was handed, and injected its stylesheet after the page's own styles, so an equal-specificity host rule sizing that same element lost and the strip collapsed to its tab bar** (BACKLOG-0001673). *Recognise your own case: a page rule like `.tabs-host { height: 300px }` had no effect because `createTabs`'s own `.lat-tabs { height: 100% }` won the cascade tie, and against an auto-height ancestor that resolved to nothing usable.* The module's own class — and the height it carries — now goes only on the shell it builds *inside* the host, never on the host element itself, so a host's own sizing of that element is never contended for. The handful of injected rules that set no property the grid's own `.lattice div, .lattice button` reset touches (background/border/padding/margin/box-shadow/colour) now carry zero specificity (`:where(...)`) as well, so a host rule targeting the strip's own chrome wins there too; the rules that protect the strip's band, border, tab and badge colouring from that grid reset keep their existing specificity.

- **A grid painted its pinned rows once and never again: `setPinnedRows` moved the model and left the strip showing the first set for ever, and `set('pinnedTopRows'|'pinnedBottomRows')` moved neither** (BACKLOG-0001674). *Recognise your own case: a totals, subtotal or status line pinned above or below the body that is rewritten as the data refreshes — `grid.getPinnedRows()` returns the new objects, the strip on screen still shows the values it was first given, and there is no warning. It redraws only when something unrelated forces a full render, such as a theme change or a column resize; a source swap, a `rows.refresh({ force: true })` and a pinned write made in the same tick as either of them all left it stale.* The sticky strip's repaint signature was built from each row's key, leaf count and totals, and for a row the host pinned all three are constants — the key is positional, the leaf count is zero by design, and a host pinned row has no totals — so any two pinned sets of the same length produced the identical signature and the repaint was skipped. The signature now also carries the identity of the row objects the pinned-row cache built, which changes exactly when a new pinned array is supplied, so a repaint follows every call, whether you pass a fresh array or mutate the one you passed before and hand it back. Separately, the `pinnedTopRows` and `pinnedBottomRows` configuration keys were read only at construction; writing either at runtime now updates the pinned model and repaints, as §18.2 has always promised for every key. Strips whose contents have not changed are still not rebuilt, so the cost of a sideways scroll is unchanged.

- **A Data Router `rollup` route never dropped a group: its grid kept every group it had ever shown, through a time-travel scrub, a narrowing filter or a delete, while a plain route over the same partition shed its rows correctly** (BACKLOG-0001675). *Recognise your own case: a route declared with `rollup: { groupBy, aggregate }` whose `groupBy` reads a `Date`, a `null`/`undefined`, an object, or is an array of fields — after `scrubTo(t, { by: 'time' })` the router's `metrics()` reports the partition rewound and the plain routes' grids follow it, but the rollup route's grid still lists every group, including groups whose every member was published after `t`, and a `rows.refresh({ force: true })` does not clear them. Group totals stayed correct; only the disappearance of a group was lost. A rollup grouped by a string, a number or a boolean was never affected, which is why it went unnoticed.* A group's key is what the router puts in the `remove` list of the keyed diff, and the target grid looks that string up among the keys it derived itself through `rowKey` — but the router encoded it with `String(value)` and the grid with its own key encoding, which differ for exactly those value shapes (a `Date` is `'Sat May 15 2021 01:00:00 GMT+0100 (British Summer Time)'` one side and `'\u0000d1621036800000'` the other, and a composite is joined on `\u0001` against `\u001f`). Adds and updates carry the row, so the grid keyed those itself and they were always right; a removal carries only the string, and `rows.apply` rejects an unrecognised key without a word. The router now uses the grid's own key encoding for a group's identity, so a rollup route's grid holds exactly the groups its partition produces, and `live()` restores them. Group keys for string, number and boolean `groupBy` values are byte for byte what they were.

- **A grid with its status bar on kept showing rows that had been removed: after a `rows.apply({ remove })` the display stayed at the old row set for ever, and no refresh, frame or forced redraw brought it back** (BACKLOG-0001677). *Recognise your own case: `rows.forEach` lists rows that `rows.byKey()` cannot find; `rows.count()` is larger than `rows.totalCount()`; a `rows.apply({ remove })` naming a key `rows.forEach` has just listed comes back `rejected: [{ reason: 'unknown-id' }]`; `rows.refresh({ force: true })` and any number of further frames change nothing. Most visible behind a Data Router route on a backward scrub — a diff carrying removes and updates and no adds — where the grid went on displaying groups the route had dropped while a chart on the same data was correct. A headless grid was never affected.* The store integrator mirrors a change into the columnar store and then delegates to the source, and it did so in that order for adds and for updates; removals alone were applied to the source first and tombstoned in the store afterwards. The source ends its own apply by announcing `rows:changed`, so any listener that reads the row model on that event — the status bar's row-count panel is one, and a host listener that calls `rows.count()` is another — ran in the gap between the two: it re-ran the pipeline while the store still held every removed row, and cached that pre-removal row set under the post-removal stage key. The tombstones then landed with nothing left to invalidate. Removals are now tombstoned in the store before the source applies them, so the row set is settled before the change is announced and every reader, on the event or after it, sees the rows the store actually holds.

- **Rows fetched after the grid's source was swapped never appeared: after `grid.set('source', …)` a windowed source painted the previous source's values where the two overlapped and blank cells everywhere else** (BACKLOG-0001678). *Recognise your own case: a grid that opens on a saved copy, a cache or a first page and hands the live source in once an endpoint answers. The new rows arrive, the model holds them — `grid.rows.get(i).data` is right for every one — and the cells are empty from the first row past the end of the copy. `grid.rows.value(key, colId)` answers with the replaced source's value, `rows.refresh({ force: true })` and a one-pixel scroll change nothing, and scrolling back to the top only partly recovers.* A columnar store is built for a source that does not hold its own rows — memory and stream — and a grid built with a remote, paged, pushdown, URL or derived source has none, reading every cell straight off the row. `set('source', …)` runs the same build, but with nothing to release the store the grid already had: values went on being read back through a store holding the data of the source that had just been replaced. The store is now released when the incoming source holds its own rows, so a swap leaves the grid exactly as building it with that source would have. A memory or stream source still gets its fresh store, as before. The same applies to `setAll({ source })` and `setAll({ columns, source })`, both of which were affected.

- **A live feed keyed by a date never dropped rows when rewound: a Data Router route whose `rowKey` resolved to anything but a string or a number could add and update rows in its grid but never remove one** (BACKLOG-0001679). *Recognise your own case: a plain (non-rollup) route over rows keyed by a `Date` — or by a value that is sometimes `null` or `undefined`, or by an array — behind `buffer()`. Scrub back behind a delta, narrow a filter or delete a record and the row stays on screen; the router's `metrics()` reports the rewound partition while the grid shows what it had before, and nothing warns.* The route keyed the rows it is showing with `String(value)` while the grid keys the same row through its own typed encoding, so a `Date` read as `"Sat May 15 2021 01:00:00 GMT+0100 (British Summer Time)"` in the route and as an epoch-stamped key in the grid, `null` read as `"null"` against the grid's null marker, and an array read as `"a,b"` against a JSON form. Adds and updates carry the whole row, so the grid keys those itself and they were never affected — only a removal carries a bare string, and the grid rejected it as an unknown id. A route now encodes its diff keys exactly as the grid does; string and number keys are byte-identical to before. This completes the correction BACKLOG-0001675 made to rollup routes.

- **And a route now says so when its target refuses a removal.** `rows.apply` reports what it could not do in `rejected`, and the router threw that answer away — which is why this defect and the rollup one before it were both completely silent. A route whose removal is rejected now warns once, naming the route, how many rows were refused and one example key, and saying what it means: the key the route derives for a row is not the key the grid derives for it. Once per route, because a key mismatch refuses every removal on that route and a warning per frame on a live feed would be its own defect.

## [1.67.0] - 2026-09-21

### Fixed

- **Passing a composite `rowKey` (or a key function returning an object) to a board, KPI set, Gantt or router route silently merged rows onto one key; it is now refused with a message naming the module and the accepted shapes.** *Recognise your own case: a Kanban board, KPI panel, Gantt or Data Router route configured with `rowKey: ['tenantId', 'circuitId']` — the composite form the core grid supports — that quietly keyed every card, tile, task or route entry the same way instead (a router route fell back to the row's own `rowKey` property, a Gantt read `row[array]` and keyed every task `"undefined"`, and a board or KPI panel fell back to `'id'`); or a `rowKey` function that returns an object, which the router and Gantt stringified to the literal `"[object Object]"` for every row, and a board or KPI panel used as-is, silently orphaning each row's previous entry on the next update.* Each of the four modules now throws at construction (or attach, for a per-route/per-alert router override) when `rowKey` is not a non-empty property name or a function, and throws on first use when a `rowKey` function's return is not a string or a finite number — a numeric return is still accepted and stringified exactly as before. Composite keys remain core-grid-only, since each of these modules keys its own identity from a single value; this is a behaviour change for a host that was relying on the previous silent fallback, which now gets a loud, named error instead.

- **A page that set `dir="ltr"` on the grid's mount or an ancestor still rendered right-to-left under an RTL locale** (BACKLOG-0001670). `resolveDirection()` trusted only a *computed* `rtl`, so an explicit `dir="ltr"` attribute — indistinguishable from the browser default in computed style — was invisible to it, and `locale: 'ar'` always won. It now walks the mount and its ancestors for an explicit `dir="ltr"`/`dir="rtl"` attribute before ever asking computed style, so a page that has already decided its direction is respected. A page that sets `dir="ltr"` on the grid's mount or an ancestor with an RTL locale used to render right-to-left; it now renders left-to-right, as the docs promised. To keep RTL inside an LTR page, set `direction: 'rtl'`.

### Documentation

- **The icon gallery in the API reference listed 34 of the 55 built-in glyph names, so hosts drew their own `download`, `search`, `trash`…** It is now generated from the icon registry (`tools/gen-icon-gallery.mjs`, gated by `tools/check.js` on the same pattern as the keyboard-map generator) and shows every registered name with its rendered glyph, in registry order.

## [1.66.0] - 2026-09-20

### Added

- **A Vue 3 application can now mount every Lattice viewer as a component, not only the grid** (BACKLOG-0001660). *Recognise your own case: `createLatticeGrid({ vue, createGrid })` gave you a `<LatticeGrid>` and nothing else, so the KPI panel, each chart, the board, the plan, the layout, the tab strip and the data router each needed their own `onMounted`/`onBeforeUnmount` pair — and your tab strip could not use the tabs module at all, because a grid the module builds from a configuration object is not a component and cannot take props, a ref or a `provide`.* `lattice-grid/modules/vue` now builds one component per viewer from the same entry point. Vue 3.3 and up, browser only; the old `createLatticeGrid` is unchanged for anyone already on it.
  - **One component per viewer**: `createLatticeKPI`, `createLatticeChart`, `createLatticeKanban`, `createLatticeGantt`, `createLatticeLayout` and `createLatticeTabs`, plus `createLatticeViewer` for anything not yet named and `createLatticeVue` to build the lot from one call. Each is created in `onMounted` and never rebuilt by a prop change, so scroll position, selection, expansion and any open editor survive a re-render; `onBeforeUnmount` destroys it, stops its watchers and unsubscribes its listeners, so a `v-if` toggled twice leaves exactly one instance alive. A prop a viewer cannot take while it is running is named once in a warning rather than dropped in silence.
  - **Every event is an emit** under its dashed name — `@cell-changed`, `@cell-edit-start`, `@card-move` — declared in `emits`, so none of them falls through onto the host element. `@grid-ready` hands you the live grid; the instance is also reachable through a template ref, as `gridRef.value.grid()` on the grid and `instance()` on every other component.
  - **A grid-bound viewer finds its grid through `provide`/`inject`.** `provideLatticeGrids()` in a parent's `setup` (or `<LatticeGridProvider>`) holds a registry; `<LatticeGrid name="quakes">` publishes itself into it and `<LatticeKPI grid-name="quakes">` takes it — so a panel declared before its grid exists mounts itself the moment the grid arrives, which is the problem a template ref cannot solve.
  - **Tabs host Vue content**: a tab's content is a named slot — `<template #overview>` for a tab with `id: 'overview'`, or `<template #tab-overview>` — rendered into the strip's own panel through a `<Teleport>`, so a tab's grid is a real component with props, a ref and the `provide`s above it. A tab with no slot is left to the module, and the two kinds mix on one strip.
  - **The data router belongs to a scope.** `provideLatticeRouter(config)` in a component's `setup` builds the router lazily, when the first grid beneath it names a `route`, and destroys it when that component's scope is disposed. A grid detaches before it is destroyed, so the router never holds a dead grid.
  - **A live feed needs no ref**: `:row-updates` is a keyed diff handed to `grid.rows.apply()` when the object's identity changes, and `:predicates` maps `{ name: fn }` to `grid.filters.where(name, fn)`, which composes with whatever filter the reader has set.
  - **`class`, `style` and `id` are applied to the component's host element** instead of being passed on as grid configuration, which is where a template author means them to go.
  - **No template compiler needed.** Every component is `defineComponent` plus a render function, so the adapter runs on the compiler-free `vue.runtime.*` build. Props are diffed with `Object.is` by one watcher per prop — never a `{ deep: true }` watcher, which over a `rows` array would walk every row object on every tick — so hold large row arrays in a `shallowRef` and assign a new array when they change.
  - **Typed.** `lattice-grid/modules/vue` ships real declarations: props, emits and the exposed instance per component, generic over your row type where the React types are. Documented under "Vue 3" in the API reference, and the suite now runs the built bundle against a real Vue 3.5 in a browser.

- **The Angular components are part of the grid package: `@toclocoinc/lattice-grid/angular`** (BACKLOG-0001662). *Recognise your own case: you read 1.65.0's notes, went looking for `@toclocoinc/lattice-grid-angular` on npm and found nothing.* That separately-named package was never published, so nothing is being moved and no install has to change — the components ship inside the grid package instead, at a subpath. `npm install @toclocoinc/lattice-grid` is the whole install, and `import { LatticeGridComponent, provideLattice } from '@toclocoinc/lattice-grid/angular'` resolves to the same ahead-of-time compiled library: one standalone component per viewer, no JIT compiler in the page, one version number for the product.
  - **Nothing extra is installed if you are not on Angular.** `@angular/core` and `@angular/common` are declared as *optional* peer dependencies, so a non-Angular install pulls in nothing and prints no unmet-peer warning. The package still declares zero runtime dependencies.
  - **Unchanged.** Every component, input, output, provider and the Data Router service are what 1.65.0 described; only the specifier is shorter. `modules/angular`, the old run-time adapter for the grid alone, is still present and still deprecated, and its message now names the new subpath.

- **Svelte 5 components, one per viewer** (BACKLOG-0001664). *Recognise your own case: your Svelte application wraps the grid in `use:lattice` and hand-writes an `onMount`/`onDestroy` pair for every chart, KPI panel or board beside it.* Until now that was the only route: the adapter was a single action over a grid, and an action takes a node and a value — no children, no snippets, no context — so there was no component for any other viewer, no way to put Svelte-rendered content in a tab, and no way for a chart to find the grid next to it. The package now ships `Grid.svelte`, `KPI.svelte`, `Chart.svelte`, `Kanban.svelte`, `Gantt.svelte`, `Layout.svelte`, `Tabs.svelte`, `GridProvider.svelte` and `Router.svelte` under `@toclocoinc/lattice-grid/svelte/`, as `.svelte` source your own toolchain compiles — the way Svelte packages ship. `svelte` is an **optional** peer dependency; the package still installs nothing.
  - **One instance, kept.** Each component builds its viewer once and pushes changed props into it, so a prop change or an `{#if}` toggled twice never throws away scroll position, selection, expansion or an open editor. `bind:this` plus `grid()` / `instance()` hands you the live instance, the same object the vanilla factory returns.
  - **Tabs hold real components.** A tab's content is a `{#snippet}` named after the tab's id, rendered inside the strip's own panel with the parent's context intact — so a tab's grid publishes itself to the registry a `GridProvider` put in context, and a chart in another tab can find it.
  - **The data props you already use elsewhere.** `rowUpdates` is a keyed diff straight to `rows.apply()`, `predicates` are named filters registered through `filters.where` so they compose with whatever the reader has set, and grid events arrive as callback props (`onCellChanged`, or `oncellchanged` if you prefer Svelte's DOM style) because Svelte 5 removed component events.
  - **Svelte 5 only**, and browser only: the components are written in runes and snippets, neither of which exists in Svelte 4, and nothing is built during server rendering. The existing `use:lattice` action is unchanged and still supported.
  - **What ships readable ships without our notes.** These components and the Angular bundle are the two artefacts in the package that ship as source rather than as a minified bundle. The build now strips comments from both on the way out — 1 885 comment lines left the Angular bundle, which is 46% smaller for it and still parses, links and runs — and every rule the components follow lives in the minified `modules/svelte` bundle they call, so what you read in a `.svelte` file is the shape of a component and nothing more.

- **A page without a bundler can now use every Lattice viewer as a custom element, not only the grid** (BACKLOG-0001665). *Recognise your own case: you added one `<script type="module">` and got `<lattice-grid>` working in a Rails, Django or Laravel page — and then wanted a KPI strip beside it, or a chart under it, and there was no tag for either, so you were back to writing the mount/destroy plumbing by hand.* `lattice-grid/modules/webcomponent` now registers one element per viewer: `<lattice-kpi>`, `<lattice-chart>`, `<lattice-kanban>`, `<lattice-gantt>`, `<lattice-layout>`, `<lattice-tabs>` and `<lattice-router>`, alongside the `<lattice-grid>` it already had.
  - **You register the ones you use**, with the module factories your page imported: `defineLatticeElements({ createKPI, createChart })`. Nothing is imported by the web component module itself, so a page that draws no charts still downloads no chart code — and `<lattice-grid>` is registered on import exactly as before. `prefix` renames every tag at once if `lattice-*` clashes with your own.
  - **A viewer finds its grid by name**: `<lattice-grid name="quakes">` beside `<lattice-kpi grid-name="quakes">`. A viewer written *above* its grid in the markup is fine — it mounts the moment the grid arrives — and names are scoped to the nearest `<lattice-router>` or to the element's own root node, so two components each holding a grid called `main` do not collide.
  - **Attributes for scalars, properties for structures.** `columns`, `rows`, `tiles`, `tasks`, `windows` and a geometry pack are properties; everything scalar works as an attribute too, and a hyphenated one reaches the camelCase key. A property you assign before the tag upgrades is honoured, so the script that configures the element does not have to wait for the one that defines it.
  - **Changes are pushed into the live viewer, never a new one.** Replace `rows` fifty times, or move the element in the DOM, and it is still the same instance with your scroll position, selection and expansion intact. Disconnect destroys it and disarms its timers; reconnect builds one, and only one.
  - **Tabs hold real markup.** A tab's content is a `<template data-tab="overview">` child, cloned into the panel the tabs module creates for it — so a tab can hold a genuine `<lattice-grid>` with its own attributes, findable by `querySelector` and bindable by name. A tab with no template is still built by the module from its configuration, and the two kinds mix on one strip.
  - **`<lattice-router>` groups a feed.** It owns one Data Router, built by the first `<lattice-grid route="LSE">` beneath it and destroyed with the element; each grid detaches before it is destroyed, so the router never holds a dead grid. `row-updates` and `predicates` are properties on the grid element for a live feed and for named filters that compose with whatever the reader has set.
  - **Events** arrive as `CustomEvent`s named `lattice-` plus the event name with colons hyphenated (`lattice-cell-changed`, `lattice-card-move`), with `grid-ready` / `grid-destroyed` on the grid and `ready` / `destroyed` on every viewer carrying the instance in `detail`. The instance is also on `el.grid` / `el.instance`.
  - **Typed**: real declarations per element — the properties, the instance, and the `detail` each lifecycle event carries. Documented under "Web Components" in the API reference, and the suite drives every element in a real browser against the built bundle.

- **Lattice can now live inside your own shadow root** (BACKLOG-0001665). *Recognise your own case: you put a grid or a chart inside a component that uses `attachShadow` — a Lit or Stencil component, a micro-frontend container, Angular's `ViewEncapsulation.ShadowDom` — and it rendered structurally perfect and completely unstyled.* The grid's generated CSS and each module's stylesheet live in `document.head` and do not cross a shadow boundary, and the `--lattice-*` tokens do, which is what made the failure look like a theming problem rather than a missing stylesheet. `adoptLatticeStyles(root)` mirrors the theme, every module's sheet and the grid's *growing* generated sheet into a shadow root as constructable stylesheets and keeps them level, so a class compiled when you add a heat column later still arrives. Every Lattice element calls it for its own root automatically; `latticeStyleSheets()` hands you the sheets if you manage `adoptedStyleSheets` yourself, and `lattice-styles="off"` opts an element out. A stylesheet that cannot be read as text — one served cross-origin, or carrying `@import` — is cloned into the root as a `<link>` instead of being dropped in silence.

### Fixed

- **A chart's tooltip was cut off by the card or window around it, instead of showing in full** (BACKLOG-0001663). *Recognise your own case: a treemap inside a dashboard card, hover a tile near the card's edge, and the tooltip reads "Departme…" instead of "Department".* The tooltip was positioned `absolute`, from coordinates local to the plot, so any ancestor that clips — a card with `overflow: hidden`, a layout window, a tabs panel — cut it off, and near the edge of the screen it could run off entirely even unclipped. It is now `position: fixed`, placed from the pointer's own screen position, and flips to the other side of the pointer when the default placement would run past the edge of the screen — the same approach the grid's own cell tooltip already uses.
  - **Unchanged.** The tooltip's content, `pointer-events: none`, hiding on leave, `spec.tooltip === false` still disables it, and a geomap pan still suppresses it while dragging.

- **Changing a grid's columns after it was created did nothing you could see** (BACKLOG-0001666). *Recognise your own case: `grid.set('columns', next)` — or a changed `columns` prop in the React, Vue, Svelte, Angular or web-component adapter, which becomes the same call — left the header and the cells showing the columns the grid was built with, while `grid.columns.all()` reported the new set. Worse, a grid created empty and filled in afterwards, which is how every adapter mounts, painted no header and no cells at all: `aria-colcount` stayed at 0.* The renderer was handed the column model once, when the grid was built, and a columns change replaces that model — so the re-layout the change asked for re-laid-out the old columns. The renderer now reads the live column set, and a columns change re-plans the widths, pins and order, rebuilds the header and repaints the cells. Removing a column removes its cells, adding one adds them, reordering re-orders; the selection and the scroll position survive.

- **`grid.set('formatting', rules)` put the rules in the configuration and on no cell** (BACKLOG-0001666). The conditional-formatting store was seeded from `formatting` at construction and never heard about a later write, so rules set at runtime through the configuration key styled nothing — while the same rules through `grid.formatting.replaceAll(…)` worked. A write to the key now reaches the store and the cells restyle on the next frame.

- **Six chart defects the public demos exposed: a dense line chart with no tooltip at all, a histogram that named its bars by number and printed float noise under them, and axis labels drawn on top of each other in a short panel** (BACKLOG-0001667).
  - **A line or area chart of thousands of points now answers the pointer anywhere in its plot.** *Recognise your own case: a `line` chart over a date column with several thousand daily readings in a panel a few hundred pixels wide — hover it and nothing happens, while the same chart over a few hundred points shows a tooltip.* Past about one point per pixel the chart reduces a series to the points it can actually draw, and the tooltip was still looking the reading up by its *category* position, which after the reduction names a different point — or, for any pointer past the first few per cent of the plot, none at all. The pointer now resolves to the nearest point actually drawn, whatever the density, and `hover` and `click` carry that reading. A chart small enough not to be reduced answers exactly as before.
  - **A histogram's bin edges no longer carry floating-point residue, and its labels are formatted.** *Recognise your own case: a histogram over a range that crosses zero, with a bar labelled `-1.38777878078e-17` where you expected `0`; or a price histogram whose axis reads `100000 200000` beside charts reading `£100k`.* The edges are computed by multiplication rather than by adding a step up to each one, and snapped to zero within a millionth of a step — the same two rules the axis ticks have always followed. The labels go through the column's own format where the column declares one, and otherwise through the axis formatter at the bin width's precision.
  - **A histogram's tooltip, `hover` datum and accessible table name a bar by the range it counts.** *Recognise your own case: the bar whose axis label reads `0.2` is announced as `9`.* The hit test was resolving against the chart's *bound* categories — whatever the rows happened to be grouped by — rather than against the bins that were drawn. All three now read `0 – 0.2`, in the axis's format, and the datum carries `from` and `to` so a host can act on the range.
  - **A histogram honours `axis.y.min` and `axis.y.max`, as the box plot beside it already did.** *Recognise your own case: you set a ceiling to keep a long tail from flattening the chart, the box plot redrew and the histogram did not, so you had to hand the chart its own `rows` instead.* A declared bound now settles the bins as well as the scale: readings outside it are neither binned nor squeezed into the end bucket, and how many there were is reported on `chart.data().outside`.
  - **The value axis draws no more tick labels than fit.** *Recognise your own case: a chart in a short dashboard tile whose y-axis numbers are written through one another.* The category axis has thinned its labels since 1.62; the value axis never did, and in a 110px tile drew all five of its labels at a ten-pixel pitch. It now steps its labels to the room it has. Every gridline is still drawn: only the text thins.
  - **A rotated axis title is kept inside the plot it runs along.** *Recognise your own case: at around 210px tall, the turned `Average rate (%)` down the left side runs into the chart's own heading.* The title is clamped to the plot band, keeps its whole text in `aria-label`, and is dropped where not even an ellipsis fits.
  - **A declared `axis.x.every` now buys the labels that remain the room it freed.** *Recognise your own case: 24 months across a narrow chart with `every: 3`, and the eight drawn labels still read `Aug 20…`.* The decision to turn the labels was made against a single band, so labels with three bands to themselves were turned and then cut to the depth the gutter could spare. Thinning is counted first, so an axis whose drawn labels fit upright keeps them upright and whole.
  - **Unchanged.** No new configuration; every existing tooltip, axis and histogram test is green, and a chart whose points were never reduced resolves its tooltip by category exactly as before.

- **The KPI stat tile drew no card of its own — no border, no background — on the default theme** (BACKLOG-0001668). *Recognise your own case: you dropped a stat tile onto a page and it rendered as bare text with nothing behind it, so every demo wrapped it in its own box to compensate.* `packages/dom/src/theme/lattice.css` read `var(--lattice-border)` and `var(--lattice-bg)` for the tile's edge and fill, and `var(--lattice-text)` and `var(--lattice-header-bg)` elsewhere in the same block — names the theme never published (`--lattice-border-color`, `--lattice-background`, `--lattice-foreground` and `--lattice-surface` are the real ones). None of the four reads carried a fallback, so each was silently invalid at computed-value time: no error anywhere, just the property's initial or inherited value. The tile's muted text (title, footer, interval, the "no data" note) had the same defect one layer down — `var(--lattice-text-muted, var(--lattice-header-text))` carried a fallback, but neither name was ever defined, so the fallback itself always fell through too. All six token names are fixed to the ones the theme actually defines. `tools/check.js` now diffs every `var(--lattice-*)` read in `packages/**/*.css` and the module `styles.js` files against the set of names the theme (or the module itself) defines, and fails by name on a stray read — the class of defect that shipped invisibly here.

## [1.65.0] - 2026-09-19

> **Note (2026-09-20):** the Angular components described below now ship inside the grid package, at `@toclocoinc/lattice-grid/angular`, from 1.66.0. The separately named package `@toclocoinc/lattice-grid-angular` was never published.


### Added

- **Angular applications can now use Lattice the way they use any other Angular library: a package of compiled components, with no JIT compiler in the page** (BACKLOG-0001650). *Recognise your own case: `createLatticeGrid({ ng, createGrid })` worked on `ng serve` and threw "JIT compilation failed" in your production build, and every viewer but the grid — the KPI panel, charts, the board, the plan, the layout, the tabs, the data router — had no Angular surface at all, so you wrote an `ngAfterViewInit` and an `ngOnDestroy` for each one.* **`@toclocoinc/lattice-grid-angular`** is a new npm package: a partial-Ivy library compiled by `@angular/compiler-cli`, which your own build's Angular Linker turns into definitions exactly as it does for every library you install. Angular 17 and up, browser only.
  - **One standalone component per viewer**: `<lattice-grid>` (and `[latticeGrid]` on an element your template owns), `<lattice-kpi>`, `<lattice-chart>`, `<lattice-kanban>`, `<lattice-gantt>`, `<lattice-layout>` and `<lattice-tabs>`. Each is created once and never rebuilt by an input change, so scroll position, selection, expansion and any open editor survive a re-render; `ngOnDestroy` tears it down. An input a viewer cannot take while it is running is named once in a warning rather than dropped in silence.
  - **Every grid event is an output** under its kebab-case name — `(cell-changed)`, `(cell-edit-start)`, `(selection-changed)` — all 161 of them, generated from the same list the React, Vue and Svelte adapters read, so an event the grid gains is an event an Angular template can bind. `(grid-ready)` hands you the live grid, which is also reachable through a template reference.
  - **A grid-bound viewer finds its grid through DI.** `<lattice-grid name="quakes">` publishes itself into `LatticeGridRegistry` and `<lattice-kpi gridName="quakes">` reads it as a signal — so a panel declared before its grid exists mounts itself the moment the grid arrives, which is the problem a template reference cannot solve.
  - **Tabs host Angular content**: a tab's content is an `<ng-template latticeTab="id">` in your own template, rendered into the strip's panel through the component's `ViewContainerRef`, so a tab's grid is a real `<lattice-grid>` with inputs, a reference and your injectors above it. Configuration-driven grid tabs still work and the two kinds mix on one strip.
  - **The data router is a service**: `provideLatticeRouter(config)` in a component's `providers` creates it when the first `<lattice-grid route="…">` under it attaches and destroys it with that component; each grid detaches before it is destroyed, so the router never holds a dead grid.
  - **A live feed and real types**: `[rowUpdates]` is a keyed diff handed to `grid.rows.apply()`, `[predicates]` maps to `grid.filters.where()` and composes with whatever filter the reader set, and the components are generic over your row type. `zoneless` change detection and `OnPush` both work unconfigured: the grid is created outside Angular's zone and re-enters it only for an output you have actually bound, so a scroll frame costs no change detection.
  - **Nothing is imported that you do not use.** The factories arrive through `provideLattice({ createGrid, createKPI, … })`, so an application that shows a grid downloads the grid and never the board, the plan or the eighteen chart types.

- **`modules/angular` is deprecated.** It builds its component by calling Angular's decorators at run time, which needs `@angular/compiler` in the page — a development-server shape, not a production one. It still works where it always worked, and now says once that it is deprecated; where it finds a real Angular with no JIT compiler it fails with a `[lattice]` message naming the package to move to, instead of leaving you with Angular's own. It also gained the fix that `<div [latticeGrid]="config">` binds the configuration through the directive's own selector, as its documentation always said it did. It will be removed in a later release.

### Fixed

- **The grid called your own icon registration a typo, and then registered it anyway** (BACKLOG-0001651). *Recognise your own case: you followed the reference, wrote `createGrid(el, { icons: { router: 'M2 6h12v6H2Z' } })`, saw your glyph draw on the chart and the cells — and the console said `[lattice] 'icons' is not a configuration key this grid recognises, so it had no effect`. You went looking for the key you had mistyped, and there wasn't one.* `icons` is now in the list of keys the constructor recognises, so the documented registration route is silent, and a test walks every key the public `GridConfig` declares and fails the build if any of them is missing from that list — the drift that caused this cannot recur unnoticed.
  - **`config.icons` is now declared.** It was documented in prose and drawn by the code, but it was not in the type, so an editor offered no completion for it and TypeScript rejected it under `exactOptionalPropertyTypes`. `GridConfig.icons` takes `Record<string, IconDefinition>`, and the new `IconDefinition` type spells out all three forms the registry accepts: the full glyph (`viewBox`, `paths`, `paint`), a bare SVG path string, or an array of them.
  - **`window.LatticeGrid` is typed.** A page that loads the grid from a CDN with `<script src>` got no completion on the global and, under `noImplicitAny`, an error on every call through it, because the declarations only ever exported `LatticeGrid` as a module member. The published `lattice-grid.d.ts` now carries an ambient `declare global` for it, so the script-tag reader and the `import` reader are typed from the same file.
  - **Internal ticket numbers no longer ship in the declarations.** `BACKLOG-0001204` and 278 more like it were in the JSDoc on the published types, so they were rendered on the npm page and in every editor hover, naming a tracker no customer can open. The build strips them from the type output while the source keeps them; a bracket that held something real alongside the id — a spec reference, a version — keeps it, and `Kanban.BACKLOG`, which is a public member and not a ticket, is untouched.

## [1.64.0] - 2026-09-19

### Added

- **A `network` chart can now be drawn the way a network team draws it: an icon per device, a position you choose, and a link colour that comes from the rule already on the column.** *Recognise your own case: you have one row per circuit, a `source`, a `target` and a utilisation, and the `network` type gave you a grey hairball of identical circles with the rows between the same pair silently added together.* Three additions to the chart spec, and nothing to write by hand.
  - **`nodes: [{ id, label, icon, x, y }]`** names the nodes. `icon` is any name in the grid's icon registry — a built-in, or one you registered — drawn as an SVG glyph inside the node's disc, so it stays sharp at any chart size and takes the chart's theme colours. `x` and `y` are fractions of the plot and **pin** the node there, out of the force simulation; everything unpinned settles around it by the same deterministic layout as before, and pinning one node never reshuffles the others. A node listed in `nodes` that appears in no row is still drawn — a device with no links is a fact worth seeing. `icon` on the chart sets the default for the nodes you did not list.
  - **Links are coloured by the value column's conditional-formatting rules**, through `grid.formatting.styleFor` — so the line and the cell behind it can never disagree, and there is deliberately no chart-level threshold option. The legend lists the rules that actually fired, with their own labels and swatches; a rule that matched nothing is not advertised. Changing a rule recolours the links on the next frame without the layout re-running, so nothing moves.
  - **Several rows between the same pair are now several lines**, drawn side by side 4 px apart in row order, each with its own value, colour and tooltip, and the pointer picks out the line you are over rather than the pair. **This changes what a `network` draws from existing data**: rows between the same pair used to be summed into one edge. That sum was a number nothing measured — three circuits at 40% are not one at 120% — and a Sankey or a chord, where the ribbon's thickness *is* the total, still aggregates exactly as before.
  - **Links are undirected**: no arrowheads, and `A,B` is the same pair as `B,A`. `linkWidth` fixes the stroke width where value-driven width is not wanted.
  - **`selection: true` makes a click act on rows**: clicking a link selects its row, clicking a node selects every row it is an end of, and the grid's selection lights those links and nodes and dims the rest.

- **`grid.icons`** publishes the icon registry from the grid instance — `get(name)` and `names()`, read-only. This is how code outside the grid bundle (the network chart's glyphs) reaches the one registry rather than a second, empty copy of it; registration stays `registerIcon` / `registerIcons` / `config.icons`. The shipped reference and the unknown-icon warning have both named `grid.icons` as a route since the first release; it now exists.

- **Map markers: a figure per location, coloured by its own rule.** A new opt-in chart type, `modules/chart-markermap` → `type: 'markermap'`, draws one marker per row where that row is — `lon`/`lat` in degrees — over any of the five shipped geometry packs, through the pack's own projection, with the same pan, wheel-zoom and reset a `geomap` has. Two things come from the grid rather than from the chart, and that is the point of the type. The **number** beside each dot is the value column's own formatted cell text, so a percentage, a currency or a unit reads on the map exactly as it reads in the table. The **colour** is whatever that column's conditional-formatting rules give the value, asked through `grid.formatting.styleFor`, so an availability wall — a percentage per site, red / amber / green by threshold — is one rule set on one column plus one chart configuration, with no custom code. There is deliberately no chart-level thresholds option and no colour column: the rules are the one source, they recolour the markers on the next frame when they change, and the legend lists the rules that actually fired with each rule's own swatch.
  - **A linked viewer like every other chart.** It draws the grid's filtered rows and follows a filter, a sort and a live feed; `selection: true` makes a click on a marker select that row, and the grid's selection emphasises the marker; under the Data Router it behaves as a `geomap` does.
  - **Labels, and what happens when they collide.** The name and the value sit beside the dot, deconflicted by trying four positions in a fixed order — right, left, above, below — and dropped rather than overprinted when none is free; `labels: false` leaves a dense map to its tooltip, which carries the name, the value, the coordinates and the status. A row whose `lon`/`lat` is absent, non-numeric or outside ±180 / ±90 draws no marker and is counted in `chart.data().unplaced`, which the map also writes under itself; without `shapes` the markers draw on the projection alone.

- **A KPI panel can now show a live clock instead of a figure.** `{ kind: 'clock', label, timeZone?, locale?, seconds?, date? }` in a KPI panel's `tiles` renders the date on one line and the time on the next (`Mon, 21 Apr 2025` over `14:32:18`), from the device clock, ticking once a second on the second boundary from one shared panel timer so several zone clocks on one panel move together. `timeZone` is any IANA name (an unrecognised one warns and falls back to local); the format follows the tile's `locale` — else the panel's new `KPIConfig.locale`, else the browser's — with a 24-hour or 12-hour clock following from the locale itself, never a separate option. The timer stops when the panel is destroyed or the document goes into the background, and resumes correctly on return. A clock tile takes none of a stat tile's measurement options (`aggregation`, `field`, `format`, `thresholds`, `bands`, `target`, `baseline`, `sparkline`); supplying one is reported as a configuration warning by name and ignored. It otherwise behaves like any other tile: it sits in the panel's tree, responds to `columns`, fires the tile events, and its accessible name carries the same date and time text.

### Fixed

- **An annotation drawn over the scrolling columns slid across the pinned columns as the grid scrolled sideways, and one drawn over a pinned column slid away from it.** *Recognise your own case: with a column pinned and `annotate` on, circle a cell, scroll right, and the circle crosses the pinned column or the cell it belonged to has moved out from under it.* The annotation layer painted every mark in one pass over the whole body, translated by the full scroll. It now paints the pinned start, the centre and the pinned end as three passes, each clipped to its own band on screen and moved only by the scroll that band has: the centre by both axes, a pinned band by the vertical alone. A stroke belongs to the band it began in, so a circle round a pinned cell stays with that cell even where the pen wandered past the pinned edge.
  - **Saved views are unchanged.** A mark carries `region` only when it is over a pinned column; every other mark, and every mark saved before this, reads exactly as before and is the centre.
  - **Unchanged.** No configuration; the body clip from 1.60 still keeps ink off the header, status bar and tool rail.

- **Every optional module bundle carried a quarter of a megabyte of compute-worker source it could never run.** *Recognise your own case: you loaded `modules/kpi`, `modules/tabs` or a framework adapter and found a 265&ndash;610KB file where you expected a small one, or you loaded three modules and downloaded the same 257KB three times.* The build appended the compiled worker kernel to every bundle whose *name* was not `chart-*` or `geo-*`. Only a bundle that inlines the grid engine has the module that consumes it, so in fifteen modules the install threw on load, was swallowed by its own `catch`, and 257,358 bytes were parsed and thrown away. The kernel now travels with a bundle only when that bundle's module graph actually contains the worker, which is read off the graph rather than off the file's name. **75 published files, 19,310,340 raw bytes and 4,523,228 gzipped bytes of dead weight are gone**, and every module's published size figure is now the module.
  - Measured, minified UMD, gzipped: `mock-socket` 61.6KB &rarr; 2.7KB, `angular` 62.2KB &rarr; 3.3KB, `svelte` 61.7KB &rarr; 2.9KB, `vue` 61.8KB &rarr; 3.0KB, `dhtmlx-compat` 67.4KB &rarr; 8.7KB, `react` 69.4KB &rarr; 10.5KB, `devtools` 70.5KB &rarr; 11.6KB, `tabs` 71.0KB &rarr; 12.1KB, `layout` 76.1KB &rarr; 17.3KB, `data-router` 88.2KB &rarr; 29.4KB, `kanban` 88.7KB &rarr; 29.9KB, `ai` 99.4KB &rarr; 40.5KB, `kpi` 107.3KB &rarr; 48.6KB, `gantt` 107.4KB &rarr; 48.7KB, `charts` 147.7KB &rarr; 88.9KB.
  - **Nothing a page can observe changes.** The core (`lattice-grid.*`), `modules/htmx` and `modules/webcomponent` — the three bundles that really can spin a worker — are byte-for-byte what they were, kernel inlined, so a single `<script src>` in a plain page, and a `file:`- or CSP-served host with no second asset to fetch, still gets a working worker with nothing else to load. The kernel is not moved to a shared chunk and is not fetched lazily; both would reintroduce the missing-kernel-file failure the inlining exists to prevent. The fifteen stripped modules never reached a worker before the change either, on any code path.

## [1.63.3] - 2026-09-18

### Documentation

- **The Data Router's type declarations now name its whole surface, and the reference can be reached from the sidebar.** *Recognise your own case: in a TypeScript project, `router.query(…)`, `router.buffer(…)`, `router.addSource(…)`, `router.metrics()` or a route's `rollup`, `where`, `writable` or `backpressure` option did not compile, and `createDataRouter({ rowKey })` without a `key` was rejected — though every one of those is documented and works.* The `DataRouter` declaration stopped at v3 while the module went to v13, so 32 of its 42 members, 11 of its 15 factory options and 7 of its 13 route options were missing from `modules/data-router.d.ts` and from the generated type appendix. All are declared now, with the handle `addSource` returns, the `join` spec, the `metrics()` snapshot, the query plan entries and the devtools controller as named interfaces.
  - **Three declarations were wrong and are corrected:** `key` is optional (a router whose routes all use `fn(row)` predicates never reads it — five shipped examples construct one that way); a delta may carry its own `seq`; `RoutePredicate` no longer collapses to `unknown` by accident.
  - **The reference itself:** *The data router* now has a sidebar entry beside *The mock socket*; `flushBackpressure()` is documented for the first time; `mountDevtools(el)` no longer advertises an `interval` option nothing reads and does say its controller has `refresh()` as well as `destroy()`; `unrouted` says `query()` resets it too; `lastQueryPlan()` names its fields; and a new note covers four seams a maintainer hits — one default sink only, alerts outlive `detach`, `detach` takes a `subscribe` handler, and the `join` aliases.
  - **No runtime change.** The module's behaviour is exactly as in 1.63.2; a test now pins every runtime member against the declaration so the two cannot drift apart again.

## [1.63.2] - 2026-09-18

### Fixed

- **A sideways scroll on a grid with a grand-total row cost twice what it should, and the header and pinned rows trailed the body by a frame.** *Recognise your own case: a wide grid with `grandTotalRow` (or any pinned rows) stutters on a trackpad fling, and the column headings visibly lag the columns beneath them, worst on a busy page.* Two causes, both closed.
  - **The pinned-row strip was torn down and rebuilt every time the visible column window slid** — which, at one column per wheel notch, was every scroll event: 122 rebuilds in a 60-event fling, about half the main-thread cost of the scroll, nearly all of it style recalculation. The strip now keeps its rows and tracks and reconciles only the cells that enter or leave the window, as the body always has. Measured on a 1,000 × 300 grid with a grand-total row: 21–24 ms of main-thread work per wheel event before, 15 ms after. Column count was never the driver — 50 columns cost the same per event as 300.
  - **The header and the pinned rows now ride the compositor.** Placing them synchronously in the scroll listener (1.61.0) put them in the same frame as the scroll *event*, but the browser moves the body before the page hears about it, so they were still one frame behind on every step. Where the browser has scroll-driven animations (current Chrome, Edge and Safari), their transforms are now driven from the body's own scroll timeline and applied by the compositor in the frame it scrolls: photographed, the disagreement fell from half of all frames to none. Browsers without the feature keep the previous placement, unchanged.
  - **Unchanged.** No configuration, no API. A host stylesheet that set `transform` on `.lat-header-centre` was already fighting the grid and still is.

## [1.63.1] - 2026-09-17

### Fixed

- **A grid with hundreds of columns stalls while scrolling sideways, and the header and pinned totals row lag the body.** *Recognise your own case: a wide grid with a pinned grand-total row and a header select-all checkbox drops to a few frames a second during a sideways scroll, even though nothing on screen changed.* Every frame of the scroll re-read the whole column list and re-scanned the displayed rows to recompute the select-all state. Those reads are now cached against a version that only moves when the columns, permissions, query, expansion or selection actually changes, so an idle frame does constant work and the header and totals row keep up with the body.
  - **No behaviour change.** The rows, the totals and the select-all tri-state (all, none, or some) are exactly as before, and every event still fires.

## [1.63.0] - 2026-09-17

### Added

- **A statistic computed over a window can now say so: `grid.rows.coverage()`** (BACKLOG-0001154). *Read this if you compute figures over a `stream` source with `maxRows` or `maxAge`, or project them into rows with a derived `statistics` grid.* A correlation over a stream evicted to 200 of the 2,000 rows that have been through it is a correlation over 200 rows, and until now nothing in the public API said so: `rows.count()`, `rows.matchCount()` and `rows.totalCount()` all report the rows the source is **holding**, so on a windowed source they agree with each other exactly while all three are smaller than the data. A figure over a window looked identical to a figure over everything. `rows.coverage()` answers the question they cannot, returning `{ covered, total, windowed }` — `covered` the rows the figure was computed over, `total` the rows the source knows about, `windowed` true when a window bounded the computation. **`covered < total`, or `total === null`, means the figure is approximate.** For that stream it reads `{ covered: 200, total: 2000, windowed: true }`; the 1,800 rows that have aged out are visible there and nowhere else.
  - **`total` is `null`, never a guess.** A stream that is still open and has evicted nothing has no idea how many rows are coming, so it says so rather than repeating `covered` as though that settled the matter. A stream that finished having dropped nothing reports `windowed: false` and an exact total — a completed stream is not approximate, and crying wolf on every one of them would make the signal worthless.
  - **A memory grid reads `{ covered: n, total: n, windowed: false }`**, so the check costs nothing to leave in and stays quiet when there is nothing to disclose. It is read on demand and cheap — one `matchCount()` and one `progress()` on the source, nothing cached — so call it beside every figure you publish rather than once at setup; on a live stream the answer moves.
  - **This closes PRD D6 for the derived statistics** (BACKLOG-0001046), which asked a projected figure to say when it is approximate and could not be built: from a derived source only the parent *grid* is reachable, and the grid's counters could not tell. The engine had computed this all along — it is what prints "computed over 180 of 2,000 matching rows (windowed source)" in the console — and it was private. A derived statistics row now reads it from the parent grid, and the test that recorded the limitation has been replaced by one that proves it is gone.
  - **Also typed:** `source: { mode: 'memory', rows }` now appears in `MemorySourceConfig`, so the shape BACKLOG-0001340 made work is declared for TypeScript hosts as well as documented.

- **Expand or collapse every group from the row menu or a column header menu** (BACKLOG-0001305). Right-click the data area, or open any column's header menu (the 3-dot button or a right-click on the heading), and — once the grid is grouped — "Expand all" and "Collapse all" are there alongside the other grouping actions, driving the existing `grid.rows.expandAll()`/`collapseAll()` API. Hidden, not disabled, on an ungrouped grid. The generated group column's own header menu already offered both; every other column's menu and the row menu did not.

- **React apps can now use every Lattice viewer through the adapter** (BACKLOG-0001307). The React adapter wrapped `createGrid` and nothing else, so an application that wanted the KPI panel, a chart, the board, the Gantt, the layout or the tab strip wrote its own mount-and-destroy effect for each one — the React earthquake demo wrote four of them and a whole tab strip. There is now one component per viewer (`createLatticeKPI`, `createLatticeChart`, `createLatticeKanban`, `createLatticeGantt`, `createLatticeLayout`, `createLatticeTabs`), each keeping the contract the grid component already kept: mounted once, destroyed on unmount, props pushed into the *live* instance rather than rebuilding it, events as `on*` props, the instance on the ref. `createLatticeReact` builds whichever of them your factories support, in one call.

- **A tab's content is a React element.** The tabs module builds its tabs' grids itself, and a grid built that way cannot take props, hold a ref or read context. `createLatticeTabs` keeps the module's tablist semantics, keyboard handling, lazy first mount and live badges, and renders each tab's React `content` into the module's own panel through a portal — so a tab's grid is a real `<LatticeGrid>`. A tab with no `content` is still the module's, so both kinds mix on one strip.

- **Grid-bound viewers find their grid through context.** A KPI panel and a chart are built against a grid *instance* that does not exist until after the first render, and writing to a ref re-renders nobody. `createLatticeGridContext` gives `<LatticeGridProvider>` and `useLatticeGrid()`; a grid publishes itself under its `name` and a viewer takes it by `gridName`, so the viewer is built the moment the grid appears.

- **The Data Router has a hook.** `useLatticeRouter(config)` owns a router for the life of the component — created in an effect and destroyed in that effect's cleanup, never in a `useState` initialiser whose discarded copy would never be destroyed — and `<LatticeGrid route="…">` attaches to whichever router `<LatticeRouterProvider>` published, detaching before the grid is destroyed so the router never holds a dead one.

- **A live feed needs no ref.** `rowUpdates` hands a keyed diff straight to `grid.rows.apply()` whenever the object changes, and `predicates` maps `{ name: fn }` to `grid.filters.where(name, fn)` — which composes with whatever filter the reader set in the tool panel, unlike the `filters` prop, which replaces the whole tree. `onGridReady(grid)` and `onGridDestroy()` are the callback form of the ref, for a parent that has to react to the instance appearing.

- **Real types.** `modules/react` was declared with every parameter and return `unknown`. It now carries props types generic over the row type, event handler props derived from the event union (`cell:changed` → `onCellChanged`), ref handle types, and a typed signature for every factory.

- What a viewer can take *live* is declared rather than guessed. Only the grid accepts any changed configuration key in one call; the other viewers each take specific ones. A changed prop a viewer has no live setter for is neither silently ignored nor silently remounted (which would throw away scroll position, selection and expansion) — it is named once, with the remedy.

- Also in this change, a build-warning fix that every bundler-based application sees: the version resolver's Node-only fallback used `import('node:' + 'module')`, which Vite cannot analyse statically, so every build of every React, Vue or Svelte application printed "The above dynamic import cannot be analyzed by Vite" about unreachable code in a package the customer did not write. The build now deletes that branch from every emitted artefact.

- `createLatticeTabs` now says so, once, when a re-render hands it a changed `tabs` array (a new label, a new badge): the module has no way to repaint an existing tab's descriptor, so the change was already dropped — it just did so in silence until now, which is the one place the earthquake demo's own proof (BACKLOG-0001307) found the component not living up to its own documented contract.

- **Real maps: five optional geometry packs, TopoJSON decoding and proper projections** (BACKLOG-0001321, part 1). A `geomap` drew seven schematic continent blobs on the projection with the most distortion, and a real country map was something you had to supply yourself. It can now draw published boundaries: `import { pack } from '@toclocoinc/lattice-grid/modules/geo-world-110m'` and `shapes: pack` gives 177 countries on Equal Earth, fitted to the panel.
  - **The packs.** `geo-world-110m` (177 countries, Natural Earth 1:110m via world-atlas, public domain, 39 KB gzipped), `geo-world-50m` (241, 225 KB), `geo-us-states` (50 states + DC, US Census via us-atlas, public domain, 36 KB), `geo-europe-nuts` (NUTS levels 0–2, Eurostat GISCO 2021, 95 KB) and `geo-uk` (9 regions, 361 local authorities, 650 Westminster constituencies, ONS Open Geography, 292 KB). **Each is a separate module a page loads only if it draws that map** — the charts bundle grew by 3.9 KB gzipped, which is the decoder and the projections, and by no geometry at all. Every pack is generated from its published source by a checked-in script and carries the source URL, the version, the date it was retrieved, its licence, and the attribution line that licence requires; the ONS and GISCO packs require one and the three public-domain packs do not.
  - **Projections.** `equalEarth` (the default for a world), `robinson`, `mercator`, `albers` with standard parallels, `transverseMercator` — which is what stands the UK upright — and `equirectangular`, kept so a map drawn before this release is unchanged. A pack declares the right projection for itself, `projection` and `projectionOptions` override it, and the drawn geometry is fitted to the panel so a map of one country fills its box.
  - **The antimeridian is handled in the chart.** A country whose outline crosses ±180° — Russia, Fiji, the Chathams — is split there before projection, so it draws as the parts it is rather than as a band running the wrong way across the map. Antarctica is now cropped by the country code `AQ` as well as the continent code `AN`: a pack codes it `AQ`, so the old check hid it even when a row had a value for it.
  - **Joining is unchanged and wider.** Alpha-2, alpha-3 and numeric ISO codes all still find their country; a pack also joins on the codes its own source uses — USPS and FIPS for US states, NUTS ids, ONS codes — and a code no pack knows is still reported as unmatched on the chart rather than dropped.
  - **A pack's regions name themselves.** A tooltip over a region reads "Wyoming" and "Saxony-Anhalt" rather than "WY" and "DEE": the column a map joins on holds codes, so the pack's own name is the better label. A host's own `shapes` are unchanged.

- **Real maps: rendering and interaction** (BACKLOG-0001321, part 2). Every region draws with a consistent stroke (`--lattice-chart-map-stroke`) that does not thicken when you zoom, and the colour ramp now stays clear of the tone `--lattice-chart-empty` uses, so a real reading is never mistaken for "no data". `labels: true` now works on a `geomap` — a region's own name, at the area-weighted centroid of its largest ring, largest value first — and `graticule: true` draws a lon/lat reference grid, both over a fitted geometry pack. A pack's required attribution line is drawn under the map, and the panel reserves a height from its width alone when a host does not fix one. **Pan, wheel-zoom and reset**, by pointer and by keyboard (drag; wheel; Shift+arrow, `+`/`-`, `0`) — plain arrow keys are left for the existing roving keyboard focus between regions. `chart-bubblemap` and `chart-hexmap` now take `shapes` too, projecting through the same pack and drawing its outlines underneath for context; unchanged without one.

- **A grouped grid over DuckDB now groups in the engine** (BACKLOG-0001325). Grouping a large Parquet file used to pull every leaf row into the browser to group it there — the DuckDB adapter declared no `group` capability, so the push router never sent it a grouped request at all. It does now: each level of the group tree is one `GROUP BY` statement, paged with `LIMIT`/`OFFSET` like any other window, with the group counts and the per-group subtotals computed in the engine. Expanding a group narrows the next level by its parent's key; expanding the deepest one runs the ordinary row query with the same predicate, so the leaves arrive paged and sorted as they always did. The matching row count and the grand total come from the engine too, so a grouped grid's "1,204 of 100,000" counts rows rather than group headers and a pinned grand-total row reduces over the whole matching set instead of the groups on screen. Every identifier is validated and every value bound, exactly as on the read path.

- Group order is pinned to match a memory grid byte for byte — the group column's own order, absent keys last ascending and first descending, and DuckDB's default binary collation with no `COLLATE` and no ICU extension, because the grid compares group keys by code unit and the two agree across the Basic Multilingual Plane. A parity suite asserts one, two and three levels, filtered grouping, paging within a level, null and numeric keys, and both sort directions against the grid's own grouping of the same rows.

- Grouping is pushed whole or not at all, and says which. A filter that did not fully push, a sort the engine could not take, a quick search, a host `where` predicate, a grouping key that is not a plain column, or `fullDataset` each refuse the grouped push outright — group rows counted over the wrong set are wrong rows, not slow ones — and `source.lastPlan()` reports `grouped: false`, `group` in `unpushed` and a `groupReason` sentence, with a one-time developer warning. A subtotal the pushdown map cannot express (a host-function total, a two-column statistic, `weightedQuantile`) is left off the group row and named in `lastPlan().aggregates.client` rather than filled in with a number computed over something other than the group.

### Fixed

- **`format: { signed: true }` did nothing on a plain number, currency or percent column** (BACKLOG-0001095). *Recognise your own case: a delta or margin column configured with `format: { style: 'currency', signed: true }` expecting `+£5.00` for a positive value, getting `£5.00` instead — no error, no warning. `signed` only ever did something for radix (hex/binary/octal) columns, an unrelated option on a different type.* `signed` is now honoured on every `NumberFormat` style: a positive value gets a leading `+`, zero gets no sign either way (it is neither positive nor negative), and a negative value is completely unaffected — it still renders however `negative` says. Off by default, so an existing column's look is unchanged.
  - **Every unrecognised or inapplicable `format` key now warns once, by name.** A typo (`format: { boldnes: 2 }`) or a key written for the wrong spec shape (`signed` on a text column) previously reached the renderer in silence and did nothing; both now produce a `[lattice]` warning naming the key, the column and the format kind it was applied to, the same day the key is added — not just `signed`, every future key this closes the same way.
  - **Unchanged.** `signed` on a radix (`hex`/`binary`/`octal`) column still means two's-complement vs. `-0x1`, exactly as before; that option lives entirely on the radix type and this change does not touch it.

- **Eleven shipped demos silently ignored config keys the grid does not recognise, so parts of them never worked** (BACKLOG-0001116, F-FX-7). `demo/derived-statistics.html` passed `sort: [...]` at the top level of a `createGrid` call — not a config key at all — so its correlation-pairs panel was never actually sorted; `demo/writeback.html`'s columns claimed `editable: true`, which the grid does not read, so they were never actually editable; `demo/statistics.html`'s grid-level `totals: {...}` never applied; `demo/spc.html` and `demo/duckdb.html` showed raw field names as headers, no configured column widths, and no unit suffix on their measurements; six more demos (`bounded-window`, `connected`, `kanban`, `kpi-tree`, `layout`, `tabs`) had columns with no title or width for the same reason. Each is fixed to the real route: `grid.sort.set(...)` after creation for a sort, `title`/`layout`/`edit`/`total`/`format: { suffix }` in place of `name`/`headerName`/`width`/`editable`/`totals`/`unit`. A new browser test loads every `demo/*.html` and asserts none of them produces this warning (or an unknown-event one) again.

- **Treemap, map, matrix, network and flow charts now show a tooltip and fire `hover` like every other chart** (BACKLOG-0001318). *Recognise your own case: a `treemap`, `geomap`, `correlogram`, `network`, `sankey` or `chord` on the page, the pointer over a tile, a country, a cell, a node or a ribbon, and nothing appears; a `hover` listener never runs; `filterOnClick` and `drill` do nothing on anything but a treemap.* The chart's hit test knew two geometries — a ring of arcs and a category band — and every other type fell into the band branch, where there is no band scale to ask. On a treemap, a map and a correlation matrix it was worse than silent: with no `categories` on the binding or no `xScale` on the draw, the lookup **threw inside the pointer listener**, once per mouse move, so a page with one of those charts filled the console as soon as the reader moved the mouse.
  - **What each type now says.** A tile names itself, with the branch it sits in when it is nested, and shows its value and its share of the whole. A region names the country or continent and its value. A correlation cell names its pair of columns and shows the coefficient under its own symbol (`r`, or `ρ` for Spearman). A node names itself and shows what flows through it. A ribbon reads `source → target` with its value and its share. Leaving the marks hides the tooltip, as it always did for a bar.
  - **`hover` and `click` carry the same datum shape as every other type**, so a host listening to one chart listens to all of them, and no payload field is new. A map region carries the code column it was joined on, so `filterOnClick` works there; a correlation cell and a flow node carry `column: null` on purpose — a cell is a pair of columns rather than a value in one, and a node is a source in some rows and a target in others, so filtering on either would silently pick one meaning out of two.
  - **Unchanged.** Cartesian and radial charts keep the tooltip, the positioning and the formatting they had, including the horizontal-bar hit test from 1.62 (BACKLOG-0001296/0001298).

- **The gantt's date labels no longer run into each other at week or day zoom** (BACKLOG-0001319). A time axis takes its tick rhythm from the calendar and never from how wide a date is, so as soon as a label was wider than the gap between two ticks every label was painted across the one after it: a week-zoom timeline header read `Sun 05 Oct 2025 Sun 12 Oct 2025 Sun 19 Oct 2025`, and at day zoom the overlap was 40px on a 28px column. Labels are now thinned to every nth — the largest regular stride that leaves at least 6px of clear space — so the axis keeps an even rhythm instead of the ragged gaps a greedy fit would leave. Both surfaces are fixed: `mount`'s axis, where day zoom and any numeric pixels-per-day below about 7 were affected, and `mountSplit`'s timeline header, where week zoom was. The gridlines and the split view's week separators still fall on every tick — only the text is thinned — and a wider Gantt now shows more dates rather than the same overlap. An un-zoomed axis is unchanged: it already sizes its tick count to the plot's width.

- **A KPI panel told to show four columns in a narrow host no longer runs off the page** (BACKLOG-0001332). An explicit `columns: n` used to lay tiles out as a hard `repeat(n, minmax(160px, 1fr))` — a floor of `n * 160px + (n − 1) * 12px` whatever the host actually measured, which pushed the panel's own trailing tiles past the viewport and scrolled the whole page sideways. Tiles now shrink to hold the requested column count down to a 96px floor per tile before the panel gives up a column; below that it falls back to however many columns of 96px fit, and a resized host re-evaluates through the same CSS `calc()`/`max()` expression with no resize observer. Labels and values ellipsise rather than clip mid-glyph as a tile narrows, and the tile's accessible name is unaffected.
  - **Unchanged.** A panel with no `columns` still lays out with `auto-fit`/`minmax(160px, 1fr)` exactly as before.

- **A `violin` or `boxplot` split by a category scaled its value axis to the group SUMS, drawing every box as a one-pixel sliver** (BACKLOG-0001333). *Recognise your own case: 80 rows, 40 with `region: 'A'` and readings between 0 and 10, 40 with `region: 'B'` and readings between 100 and 110; `createChart({ type: 'violin', x: 'region', y: 'v' })` labels its axis to about 5,000 — the two sums — and `chart.data()` reports 195 and 4,195 as if a reading had taken those values.* Neither the grid's grouping nor the two types was the cause, and both halves of the picture were wrong for the same reason: the binder reduces each category to a single `point.y` (a sum, by default) and keeps the rows it reduced on `point.values`, and every distribution drawer read the reduction and called it a reading. A chart bound to a host-grouped grid drew exactly what a chart grouping itself drew, before and after — the defect was never in the grouping.
  - **The drawers read the readings.** `violin`, `boxplot`, `histogram`, `qq`, `ecdf`, `lorenz` and the `ridgeline` module now take the rows behind each mark, so the value axis spans the leaves actually drawn. A Q-Q plot over a grouped column drew *nothing* before this — two category sums are fewer than the three points it needs.
  - **The reduction is now a median.** These types bind by `median` rather than by `sum`, because a sum is not a value a reading could take: `data()`, the tooltip and the accessible table reported 4,195 while the box was drawn at 104.875. A `fn` named on the spec still wins, and `median` is now a chart aggregation in its own right — it is a key of the grid's own `TOTAL_FNS`, and `fn: 'median'` was previously reported as unknown and quietly summed.
  - **`axis.y.min` and `axis.y.max` are honoured.** A declared axis was silently ignored by both types, so there was no way to hold the axis still.
  - **`measures` binds.** `measures: [{ col, fn }]` on a distribution type bound no measure at all and drew an axis of nulls; it now names the column and the function, as it does on a combo or dual-axis chart.
  - **Unchanged.** The process-control types — `control`, `capability`, `movingRange` — still plot one aggregate per sample, which is what an X-bar chart is.

- **The grid wrote into the `rows` array you passed it, so two grids built from one array collected each other's rows** (BACKLOG-0001334). *Recognise your own case: `const rows = []` hoisted out of a component and handed to `createGrid`/`createHeadlessGrid` more than once — `grid.rows.apply({ add: [r1, r2] })` on the first grid leaves `rows.length === 2` in your own variable, and the next grid built from it opens already holding r1 and r2. A tab that should have shown 8 rows showed 2,374. `rows.apply({ remove })` and `rows.apply({ update })` wrote to it too, and so did `rows.load(list)` for the list it was given; a `source: { mode: 'memory', rows }` block took the same path.* The memory source used the caller's array **as its storage** — an add pushed onto it, a remove wrote a tombstone into it, an update swapped the slot — so every data change landed in the host's own variable. It bit the React demo first, because the adapter's `Object.is` prop diff makes hoisting one shared array to module scope the natural thing to write. The grid now takes a shallow copy of the array on ingest and keeps the copy: after any `rows.apply`, `rows.load`, sort, group or edit the array you passed holds exactly what it held when you passed it, and two grids built from one array are independent.
  - **The copy is shallow, and that is deliberate.** The row *objects* inside it are still yours and are still shared with the grid: `row.data` is the object you supplied, `rows.data()` returns those same objects, and `row === sourceObject` holds exactly as `ingest.retainSource` documents. Copying a million row objects to protect an array would be a different trade. One consequence is worth stating plainly: an **in-place cell edit** (`edit.setCells`, or typing in a cell) writes the new value into that shared object, so it is visible through your array — unchanged from before, and the `retainSource: false` / `dropSourceRows` modes still opt out of sharing altogether. `rows.apply({ update })` does not write through: it merges into a *new* object, which replaces that slot in the grid's copy only.
  - **Unchanged.** Row identity, `rows.data()` order, the `ingest` modes, `rows.move`, streaming, and every source other than memory. The copy is one array of pointers taken once per handoff, not per change: copying 500,000 pointers measures 2.4ms against a 500,000-row ingest of roughly 230ms, so the median ingest moved from 233ms to 230ms — inside the run-to-run spread.

- **A `datetime` cell read back from `rows.value()` as a raw epoch number after an in-place update or edit, having read as a wall-clock string on load** (BACKLOG-0001335). *Recognise your own case: a column typed `datetime` (or `date`) whose rows carry epoch numbers or `Date` objects. `grid.rows.value(key, 'due')` answers `'2026-09-16T20:28:42'` when the row loads, then `rows.apply({ update: [...] })` or `edit.setCells` on that row makes the very same call answer `1789587230129`. `rows.text()` stays formatted the whole time and the painted cell never looks wrong, so this only shows up in a host doing arithmetic on `rows.value` — which is why the live TfL demo carries a `dueOf()` helper that copes with both shapes.* A typed column converts on the way into the column store — `date` to `YYYY-MM-DD`, `datetime` to a zoneless wall clock — and only the ingest reader was doing it. The two paths that rewrite a stored cell in place read the row straight and wrote the host's raw value into a column whose stored form is something else. There is now one reader (`ColumnModel#storeReader`) that both ingest and write-back call, so `rows.value()` answers the column's documented stored form on every path: the rows passed at construction, `rows.load()`, `rows.apply({ add })` and `rows.apply({ update })`, `edit.setCells`, stream chunks and re-sends, retaining and store-backed stores, a bound KPI tile and a chart binding.
  - **Nothing about the load path changed, and no stored value moved.** The contract is the one 1.52.0 set and the guide states: `date` stores `YYYY-MM-DD`, `datetime` stores `YYYY-MM-DDTHH:mm` (seconds when non-zero) and never retains sub-second resolution, `timestamp` keeps the instant to the millisecond. **A column that needs milliseconds should be `type: 'timestamp'`**, which already answered the epoch number on every path and is unchanged here. `row.data` is untouched on every path — it is still the raw value you supplied.
  - **Already correct, and now guarded.** A stream arrival and a stream re-send always converted, because the stream's own writer reads through the store schema; it was the `rows.apply({ update })` after one that did not, on a retaining stream. A store-backed stream (`ingest: { retainSource: false }`) was right throughout. Both are pinned by tests, as is `rows.text()`, which was formatted correctly all along and is the reason this went unnoticed.

- **A row a live stream re-sent kept its place in the order under an active sort, showing its new values in its old position** (BACKLOG-0001336). *Recognise your own case: `source: { mode: 'stream' }` with a sort in force and a feed that polls, so the same key arrives again with a value that sorts somewhere else — the cells update immediately and the row does not move. On an arrivals board sorted by `due asc`, a train delayed by five minutes showed its new time at display index 105, among trains due much sooner, and stayed there until a sort, filter or group change (or an eviction) happened to rebuild the order. `rows.apply({ update })` on a stream behaved the same way, while the same call on a memory source has always re-positioned. Disclosed under "Still outstanding" in 1.62.1.* A re-sent row is an upsert: it writes both halves of the row (BACKLOG-0001328) and re-stamps the row's age (BACKLOG-0001323), but it took neither of the two branches that maintain the display permutation, so nothing ever moved it. Both of the stream's update paths now re-position the row the moment its values change, so a stream under a sort behaves exactly as a memory source does: the row arrives in its new place on the same tick its cells update, the rows whose sorted value did not change do not move, and selection and expansion travel with the row.
  - **The cost is an insertion, not a re-sort.** The permutation is already ordered, so the row is taken out and binary-searched back in — O(log n) comparisons and an amortised O(1) move in the gap buffer (`GapBuffer` gained a `removeAt` for it). Measured over 10,000 rows with 1,000 re-sends: 8ms in total, of which about 4ms is the repositioning itself, against 12ms for a single full rebuild of the same permutation — so a re-sort per re-sent row would have been some twelve seconds for that workload. A feed re-sending 350 rows every 30 seconds pays about 1.5ms a poll.
  - **Unchanged.** A stream with **no** sort keeps arrival order exactly as before, including a bounded stream that keeps a permutation only so eviction does not break indexing — nothing is repositioned there, so a re-send cannot march a row to the bottom of a list whose order you never asked to change. Grouped views were already right (they are answered by an inner memory source) and are unaffected; `maxAge`/`maxRows` eviction, its counters and its events, dedupe itself, scroll preservation above the viewport anchor, and every other source are untouched.

- **A memory source declared inside `source` no longer opens empty** (BACKLOG-0001340). *Recognise your own case: `createGrid(el, { columns, source: { mode: 'memory', rows: [...] } })` — three lines, no error, no warning, and a grid showing nothing. `rows.count()` is 0, `rows.value()` is undefined, `rows.text()` is blank, a bound KPI tile reads zero and a chart draws no points. Moving the same array to the top-level `rows` option fixed it, which is what made this look like a data problem rather than a grid one.* A memory grid's rows can be declared in either place and the `MemorySource` has always read both — its own block first, the grid config second — but the **column store** was filled from the top-level key alone. Every cell read resolves a stored column, so a grid declared the block way built a source holding the rows over a store holding none, and disagreed with itself from the first frame. The store is now filled from whichever shape declared the rows, so the two are the same grid: same counts, same values and text, same type inference for an undeclared column, same KPI and chart readings, and `rows.load()` and `rows.apply()` behave identically afterwards.
  - **Declare them once.** A grid given rows *both* ways now uses the top-level `rows`, ignores the block's and **warns once naming both places** and how many rows it dropped, rather than silently picking one. The top level wins because it is the shape every example uses and the one `rows.load()` writes to. A `rows.load()` on a block-declared grid retires the block's rows rather than leaving them to look like a duplicate declaration.
  - **Unchanged.** Only `memory` reads a `rows` key from the block; a `rows` key on a `paged`, `remote`, `stream` or `derived` block is left alone exactly as before, since those modes take their rows from the server. BACKLOG-0001334's copy-on-ingest already covered the block's array and still does — the array you pass is never written to, whichever way you declare it.

- **A histogram over more than about 120,000 rows no longer throws** (BACKLOG-0001341). `createChart({ type: 'histogram', y: 'amount' })` raised `RangeError: Maximum call stack size exceeded` at 150,000 rows, from a chart that drew perfectly at 100,000 — the extent was taken with `Math.min(...values)`, which passes every reading as a separate argument, so the engine's argument limit became the product's row limit. The extent and the binning are each a single pass now, with no copy of the column and no spread. Four more charts had the same fault at the same size and are fixed with it: a `violin` of one category, a `capability` chart (which bins as a histogram does), a `bubble` chart with a `size` column, and any chart reduced by `fn: 'min'` or `fn: 'max'` whose grouping puts many rows in one category. A `funnel` bound to a high-cardinality column threw rather than drawing something unreadable, and no longer does. Bins are unchanged: a 10,000-row result is pinned edge for edge and count for count against the previous release.

- **Statistical chart types now have proper names in every locale** (BACKLOG-0001342). Eight chart types — forest, QQ, ECDF, Lorenz, correlogram, control, capability and moving-range — shipped in the charts `TYPES` registry with no `chart.type.*` catalogue string in English or in any of the 21 other locales, so their accessible names read the raw key: "chart.type.qq chart of …". A new test derives the required key set from the registry itself, so a future chart type shipping with no string fails immediately rather than going unnoticed the way these eight did. Separately, a chart with no single measure column (a correlogram) announced "Correlogram chart of " with nothing after "of"; the accessible-name template now omits the "chart of …" clause entirely when there is no measure to name.

- **A correlogram cut its column names off, and a wider chart made no difference** (BACKLOG-0001343). The left margin was a constant — about 44px, the room five digits of an axis need — whatever the chart was going to draw in it, so a 15-character column name was painted 65px outside the chart's own box and a 30-character one 167px outside it, identically at a 461px box and at a 1,100px box. A host could not fix it with layout because the margin never looked at the labels or at the space available. The gutter is now measured from the names the chart will actually draw, capped at two fifths of the chart, and past that cap a name is ellipsised with the whole of it kept on the element as `aria-label` for a screen reader. Five types shared the fault and all five are fixed: `correlogram`, `horizontalBar`, `forest`, `gantt` and `heatmap`. Two of them — `gantt` and `forest` — had a per-type gutter written for them that had never run: it was spread into the layout call above the constant that overwrote it.

- **The tail of a long rotated axis label was painted below the chart.** A label turned 45° reaches its own length over √2 beneath the plot, and the axis truncated to 1.6 times the room it had reserved — so about a fifth of every long label hung outside the chart box. It is now cut to exactly the room reserved for it.

- **A horizontal bar with several hundred rows drew a label per row**, every one of them hidden behind its neighbour. Labels down the side are thinned to the pitch a line of text needs, the way the bottom axis already was; `axis.x.every` still sets the count either way.

- **A horizontal bar reserved height under its plot for labels it draws down its side**, taking space from the chart for an axis that is not there.

- **A line chart over 7,094 daily readings drew nothing, while `data()` reported every point with a real value** (BACKLOG-0001344). Three faults in one picture. A column typed `dateString` or `timestamp` — both documented temporal types — was read as 7,094 unrelated labels rather than as time, so the chart built a band scale with one tick per row; downsampling then replaced each kept point's x with its position in the series, which is not one of those labels, so every coordinate came back `NaN` and the line's `d` was written as the empty string. The same substitution collapsed a *time* axis onto a single x off the left of the plot, so a 19-year series was painted as one vertical stroke outside the chart. Temporal column types now bind a time scale, downsampling keeps each point's own x, and a line, area or step on a band scale is drawn through the band centres — an empty path is never emitted for a bound series that has points.

- **A numeric x with twelve or fewer distinct values was silently demoted to a band scale**, which turned `fit`, the confidence `band` and everything else that needs a continuous axis off without refusing them and without saying so (BACKLOG-0001344). A numeric column now draws a linear axis whatever its distinct count. Use `axis: { x: { scale: 'band' } }` where the numbers really are codes — a quarter, a rating, a star count — and their bands are what you want.

- **A chart that falls back to a band scale for a bound column now says so once**, naming the column, the type it was given and the option that overrules it (BACKLOG-0001344). A chart that binds no dimension column at all — a correlogram, or a histogram or boxplot of one measure — draws silently, as it always has. The common cause is a grid built with no rows: the column type is inferred from the empty set as `text` and is not revisited when rows arrive, so a streamed date column banded where the same column beside a populated grid bound time. `axis: { x: { scale: 'time' | 'linear' | 'band' } }` pins the scale, and `data().kind` reports what was chosen.

- **A crowded band axis drew one tick label per row** — 7,099 text nodes, each a fraction of a pixel wide, every one of them hidden behind its neighbour (BACKLOG-0001344). Labels are thinned to the pitch a rotated label can be read at, after rotation has been tried and has not been enough; `axis.x.every` still overrides the count in either direction.

- **A grouping server that returns an empty or null first-level group no longer hangs the grid** (BACKLOG-0001346). *Recognise your own case: `source: { mode: 'remote' }` (or a DuckDB/REST/GraphQL/OData source that groups server-side) with `groupBy` whose outermost column has NULLs or empty strings in it. The first fetch comes back with a group row like `{ region: null, leafCount: 4 }`, and expanding it throws `RangeError: Maximum call stack size exceeded` from inside the source — the tab locks up rather than showing an error.* Group keys were not injective: the separator was written *between* path elements after a fixed prefix, so the path's length was never encoded and the root — which has no elements — produced exactly the same key as a one-element path whose element was empty; null was folded onto empty on the way in, so a null first-level key produced it too. The remote source looks a group's node up by that key, so the first-level group resolved to the **root** node and was then stored as its own child, and the next row count walked that cycle until the stack ran out. Keys now encode the path's length and mark an absent value distinctly, so the root, a null first-level group and an empty-string first-level group are three different things; such a group renders as one row with its leaf count and expands and collapses like any other, at any depth.
  - **Your saved views and expansion state are unaffected.** Every group path whose elements are all present keeps byte-for-byte the key it had — `['north']` is still `g\0north` — so persisted expansion state, selection and any keys you have stored survive untouched. Two keys move, and neither is one a host can hold: the **root's** (internal to a source, never a group row), and that of a path containing a **null**, which previously shared a key with the empty string and so could not be addressed correctly in the first place.
  - **The wire protocol is unchanged.** `groupPath` still carries the stringified ancestry, an absent key still travelling as `''`, with the typed values beside it (BACKLOG-0001325); only the client-side key is built differently. A server needs no change.
  - **Unchanged.** NULL and empty string remain *different* groups on the engine side, which is what a grouping server reports and what this now renders faithfully. The memory source still folds them into one group — it coerces every path element before keying, so nothing here reaches it — and whether it should is a separate question, left to its own card.

- **The Augmented Dickey-Fuller test no longer takes seconds on a few thousand rows** (BACKLOG-0001347). *Recognise your own case: `grid.statistics.adf` on a daily series of a few thousand readings, and the tab that calls it locks up — two calls on the same page froze one for thirteen seconds.* With no `maxlag` the lag order is searched by AIC up to the Schwert rule, 34 candidates at 7,000 rows, and every candidate was fitted from scratch through the full regression engine — which also computes variance-inflation factors, leverages, Cook's distances and a Breusch-Pagan auxiliary fit that a lag search never looks at. The candidates are nested, so the search now builds one design matrix at the largest lag and reads every smaller candidate off it: one pass to accumulate the normal equations, then a small solve and a single residual pass each. On 7,094 daily rates the default search went from 5.3 seconds to 0.06 — 82× — and a 4,000-row series from 2.0 seconds to 0.03.
  - **The answer is unchanged, deliberately to the last bit.** The search does the same arithmetic in the same order as the fit it replaces, so the AIC of every candidate — and therefore the lag chosen, the statistic, the p-value and the verdict — is bit-for-bit what it was; pinned in the test suite on a random walk, a stationary AR(1) and a 7,094-row FX-shaped series, and confirmed identical against the pre-fix implementation across five sizes (500 to 7,094 rows). `maxlag` still caps the search and is now documented with what the default costs.

### Documentation

- **The DuckDB source guide stated row-group pruning and range reads as if they applied automatically; they do not** (BACKLOG-0001327). The reference (`docs/API.html`), the developer guide (`docs/api-detail.html`) and the adapter's own JSDoc (`packages/core/src/source/adapters/duckdb.js`) now say plainly that whether a Parquet file is read in ranges or whole is DuckDB's and the file host's doing, not the grid's: on DuckDB-Wasm 1.32 and later, `LOAD httpfs;` must run on the connection before the first `read_parquet(...)` call to get range reads at all (measured 100% of the file read whole before, 30% after, on a 1.5 MB file on GitHub Pages — BACKLOG-0001324), the file host must answer `HEAD` and 206/`Content-Range` and expose them through CORS cross-origin, and a file registered as a buffer is always downloaded whole. No source behaviour changed.

### Internal

- **`test/timewindow-browser.test.js` went red in four gates on a loaded box without the rolling time window being at fault** (BACKLOG-0001297). It failed in two full gates on 12 Sep, in card 1213's first gate, in 1272's on 15 Sep and in 1293's on 16 Sep — the last a docs-only card whose diff cannot reach it. Investigated rather than quietened, because the previous browser test called flaky under load (BACKLOG-0001277) turned out to be a real accessibility defect. This one is not: instrumented across thirteen runs, idle and with the box saturated at twice its core count, the oldest live row never exceeded the documented retention horizon (`span * 1.1` plus one eviction tick, 2700ms for the 2s span the test uses) and eviction ran on every sample; the reproduced failure carried `age.evicted: 39`, so the window had dropped thirty-nine rows while the assertion that actually failed was "both charts must have drawn a line". `maxAge`/`ageBy` behaviour is unchanged and no product code was touched.
  - **Both faults were wall-clock bets in the test.** It slept a fixed 3200ms and then sampled once, so on a saturated box the 25ms feed and the 500ms eviction timer had not necessarily reached the numbers the assertions name; and it read the SVG at a single instant, which can catch the chart between redraws — the line path is rewritten in place, so there is a moment when its `d` holds one point and the reader sees no line at all. That second window exists on an **idle** box too, at about one sample in fifty; load only widens it. The fill phase now polls until the page is in the state the assertions describe, and every SVG read is retried across a redraw.
  - **No assertion was weakened.** A window that stops evicting, a feed that does not run or a chart that never draws still fails on the same assertion with the same message, having waited long enough that "the box was busy" is no longer a plausible explanation — proved by disabling age eviction in the source and confirming the test still fails by name. 20 consecutive passes, ten idle and ten under a load average of 33 on sixteen cores.

## [1.62.1] - 2026-09-16

### Added

- **Every chart extension is now available to script-tag pages** (BACKLOG-0001330). The eighteen opt-in chart types — alluvial, arc, bubblemap, bump, calendar, decomposition, diverging, dumbbell, fan, hexbin, hexmap, icicle, parallel, ridgeline, roc, slope, splom and waffle — shipped as ES modules only, so a page with no build tooling could draw the built-in types and none of the opt-in ones. Each now ships the same three variants as every other module: `modules/chart-<type>.esm.min.js` for a bundler, `modules/chart-<type>.min.js` (UMD) for a `<script src>` page, and `modules/chart-<type>.min.cjs` for `require()`. Load order is the same one the base charts module already asks for — the core, then `modules/charts.min.js`, then the extension — and the extension extends the `LatticeGrid` global rather than replacing it, so `LatticeGrid.createChart({ type: 'ridgeline' })` works once the three scripts are on the page. An extension loaded before the charts module throws instead of registering nothing.
  - **Unchanged.** The ESM route, the registered type names, the drawing and the `package.json` `exports` map (the new files resolve under the `./modules/*` patterns that were already published). The UMD builds share the page's core and charts module rather than inlining them, so each is 2–4 KB gzipped.

### Fixed

- **A row added to an open stream with `rows.apply` could show another row's values until its next update** (BACKLOG-0001322). *Recognise your own case: `source: { mode: 'stream' }`, rows already in the grid, then `rows.apply({ add: [d, e, f] })` — and `d` reads the cells of the row three places before it. `rows.value`, `rows.text`, `rows.values`, the painted cell, a bound KPI tile and a chart binding all report the wrong row's values, while `row.data` is right the whole time; a later `rows.apply({ update })` of the same row puts it back; rows arriving through the stream's own `open()` are unaffected, and so is a memory source.* Found live on an arrivals board, where 7 of 355 rows showed another service's due time. Every cell read resolves a stored column at the row's physical index, so the column store's fill pointer and the stream's row array have to be the same number, and two writers were appending one arriving row:
  - **The integrator mirrored the add into the store on a source that writes it itself.** `rows.apply({ add })` is appended to the store before the change reaches the source, which a memory source needs because it never writes the store. A stream does write it — a chunk from `open()` never passes through `apply` at all — so every applied row was stored twice and each later row read the slot of the row *N* places before it, *N* being the size of the first applied batch. Sources that write the store now say so, and are no longer mirrored.
  - **A re-sent row consumed a store slot nothing pointed at.** The stream handed the whole chunk to the store including rows it then deduped against a key it already held, so a re-send from `open()` shifted every row that arrived afterwards by one. Only the rows that take a new slot are appended now, and the physical index is read back from the store rather than assumed.
  - **Unchanged.** Chunk coalescing, merge insertion, scroll preservation, `maxRows`/`maxAge` eviction and their counters, off-thread ingest, promotion to a memory source on `done`, and dedupe itself: a re-sent row still replaces the row already held rather than adding one. Memory, paged, remote and URL sources took neither path and are untouched.

- **Grouping a live stream with a rolling window brought back rows the window had already dropped and showed the rest twice** (BACKLOG-0001323). *Recognise your own case: a `source.mode: 'stream'` grid with `maxAge`, running long enough for rows to age out; `columns.group([...])` then makes the row count jump — three live rows drew eight leaves, a reported feed went from 301 rows to 671 — `rows.byKey()` answers for a key that had gone, and the status bar agrees with the inflated figure. Ungrouping restores the truth, and grouping before anything has aged out looks fine.* Grouping and pivot on an open stream are answered by an inner memory source over the stream's own rows (BACKLOG-0001299), but that source prefers the columnar store's live indices to the row array it is handed — and the store is not the stream's row array. In 1.62.0 it gained a slot for every arriving row, including a row a poll re-sends that the stream folds into the slot it already holds, and including a row the grid appended on the `rows.apply({ add })` path, so it accumulated slots the stream did not own and every one of them was reported as a live row. Those two extra writers are gone (BACKLOG-0001322, released alongside this), and the delegate is now additionally given a view of what the stream itself holds: the same rows, the same physical indices, the same tombstones eviction leaves, so a grouped view cannot drift from the ungrouped one however the store is written. For a stream that retains its rows it also reads group and filter values from those rows rather than from store columns, which a row re-sent by a poll does not rewrite — so a row whose grouped-on value moves between polls moves group with it. Grouping, ungrouping and regrouping a windowed stream is idempotent and agrees row for row with the ungrouped view.
  - **`rows.leavesOf()` returned nothing on a grouped stream**, warning that the grid "groups elsewhere" (BACKLOG-0001323). The stream source had no `leavesOf`, so the grid's guard refused the call even though an open stream groups in memory — which left a KPI panel's drill into the rows behind a tile (BACKLOG-0001300) inert on every stream grid. It now answers from whichever source is answering the rest of the grouped view, so the leaves are the same rows, in the same order, as the display shows; an ungrouped stream answers with no rows rather than a warning.
  - **A row aged from the value it first arrived with, not the value it now carries** (BACKLOG-0001323). With `maxAge` and `ageBy`, `rows.apply({ update })` replaced the row but never re-stamped its clock, so an upsert that moved the field later still evicted the row at the original moment — a delayed train blinked out and was re-added by the next poll — and one that moved it earlier was never evicted at all. An update now re-times the row's eviction in both directions, and a row whose new time is already outside the window goes on that pass rather than waiting for the next tick. Rows re-sent through the stream itself already behaved this way.

- **A row a live stream re-sent with new values could keep showing its old values** (BACKLOG-0001328). *Recognise your own case: `source: { mode: 'stream' }` and a feed that polls, so the same key arrives again with a newer reading — `grid.rows.byKey('k1').data` shows the new values while `rows.value('k1', 'line')`, `rows.text()`, the painted cell, a bound KPI tile and a chart binding all still show the poll before, indefinitely. With a grouping in force the row moves under its new heading and the leaf beneath it keeps the old value. A grid with `ingest: { retainSource: false }` was unaffected, and so was `rows.apply({ update })`.* Streaming dedupe (§4.5) is an upsert, and it was writing only half the row: the source swapped the object in its own array but wrote the store's columns only when the stream was store-backed — and every cell read resolves a stored column at the row's physical index. Dedupe now writes both halves on every stream: the columns, and (on a retaining stream) the object the store keeps for `rows.data()` and for the merge base of the next `rows.apply({ update })`.
  - **Unchanged.** The row keeps its physical slot and its key, so selection, expansion and cached permutations survive a re-send as before; a re-send still re-stamps the row's age for `maxAge`; eviction, grouping and the arrival paths from BACKLOG-0001322 and BACKLOG-0001323 are untouched. `rows.apply({ add })` of a key the grid already holds is still refused as `duplicate-id`, on a stream exactly as on a memory source — the verb for "this row has moved on" is `rows.apply({ update })`, or simply letting the feed re-send it.
  - **Still outstanding.** A re-sent row is not re-positioned under an active sort: its cells are correct immediately, but a row whose sorted value changed keeps its place in the order until something else rebuilds the permutation. A memory source's `rows.apply({ update })` does re-position, and a stream's does not either, so this is one gap on both of the stream's update paths rather than something this change introduced.

## [1.62.0] - 2026-09-16

### Added

- **`scrollbars: 'custom'` — a scrollbar the grid draws itself, always visible in every browser and big enough to grab** (BACKLOG-0001288). On Chrome/macOS the platform's scrollbar is a 7-pixel overlay ribbon that fades when the pointer stops, and `scrollbars: 'always'` could not fix that: `'always'` pins the *native* bar, so its size is still the platform's, and the rules that style it are a WebKit/Blink extension that Firefox ignores outright. The new third mode replaces the native bar with one the grid draws: a track and a thumb on each axis, painted at rest whatever the operating system's overlay setting says, the same size, colour and hit area everywhere. The default is a 12px track with a 32px minimum thumb, a noticeably larger target than the platform's. `'auto'` remains the default and `'always'` is unchanged, so no existing grid moves on upgrade.
  - **It behaves like a scrollbar, because it is one.** The thumb's length is the fraction of the content on screen, floored at a minimum so a 200,000-row list still has something to grab; dragging it scrolls; pressing the track above or below it pages by one viewport; and with the bar focused the arrows, `Page Up`/`Page Down`, `Home` and `End` all move the grid. Each bar carries `role="scrollbar"` with `aria-orientation`, `aria-controls` and a live `aria-valuenow`, and its accessible name comes from the message catalogue rather than from a hard-coded string. It is deliberately not in the page's tab order: the grid is a single tab stop and its own arrow keys already scroll.
  - **Scrolling itself is untouched.** The body viewport still scrolls natively, so the wheel, the trackpad, a finger, the keyboard and `scrollToRow` keep the browser's own momentum, acceleration and direction. The bars are display and input only. The thumb is placed inside the scroll listener rather than in the following frame, under the same §7.3 licence the header sync uses, so it does not trail the content: measured in a real browser over a fast scroll, the thumb is within **0 pixels** of where the content is, where one frame of lag would have been 8.4 pixels, and it lands exactly on the end of its track at maximum scroll.
  - **Nothing in the layout moves.** Hiding the native bar gives its gutter back, so the theme takes the same space again as a transparent border on the scrollport: `'custom'` reserves the same 12px `'always'` reserves, measured, which is what keeps `columns.fit()`, the pinned start/end regions, the pinned-row strip and the status bar lining up exactly as they do today. The gutter is permanent while the mode is on, so it cannot appear and disappear with the row count and shift the columns under the pointer. Right-to-left is correct: the horizontal thumb starts at the right edge and travels left, and the vertical bar is on the left.
  - **Seven new theme tokens**: `--lattice-scrollbar-size`, `--lattice-scrollbar-thumb-min`, `--lattice-scrollbar-track`, `--lattice-scrollbar-thumb`, `--lattice-scrollbar-thumb-hover`, `--lattice-scrollbar-thumb-active` and `--lattice-scrollbar-radius`. The colours are derived from the existing line and accent tokens, so the dark, high-contrast and terminal themes get a bar that belongs to them without declaring one.
  - **One limitation, said out loud.** No browser offers per-axis control of native scrollbar visibility, so `'custom'` on one axis hides the native bar on *both*. The grid warns once, naming both axes, rather than leaving a missing scrollbar to be discovered later. Set `'custom'` on both axes, or on neither.
  - **Also fixed by this, for `'custom'` only:** a grid with pinned bottom rows drew its horizontal scrollbar underneath the pinned-row strip, which is opaque and sits above the body — so the bar was completely invisible and un-grabbable whenever a grand-total or pinned row was present. Under `'custom'` the strip is lifted clear of the drawn bar and both are fully visible. `'auto'` and `'always'` still hide the native bar this way.

### Fixed

- **On a horizontal bar chart the tooltip could describe a different bar from the one under the pointer** (BACKLOG-0001296). The hit test resolved the hovered category by inverting the pointer's x against `drawCartesian`'s `xScale`; on a horizontal bar (or a horizontal waterfall) that scale is the category band and its pixel range runs top-to-bottom, not left-to-right, so sliding along one bar walked the tooltip and the `hover` event through its neighbours instead of holding still. The tooltip, the `hover` event and click-to-filter/drill now read the pointer's y on a horizontal chart, its x everywhere else. Vertical and radial charts are unchanged.

- **On a horizontal bar chart (or a horizontal waterfall) a brush could select bars other than the ones dragged over** (BACKLOG-0001298). `attachBrush` decided which pixel axis a drag tracked from the brush's *axis name* alone (`y`/`y2` meant vertical), never from the chart's orientation — but `drawCartesian` swaps the two scales' pixel ranges for a horizontal bar (BACKLOG-0001296), so the default category-axis brush kept reading the pointer's x against a band scale whose range runs top-to-bottom. A category-axis brush on a horizontal chart now drags along y and a value-axis brush along x, matching the axis each actually occupies on screen; the drawn brush overlay follows the same axis. Vertical and radial charts are unchanged.

- **A filter or grouping applied while a stream was still open was silently ignored until the stream completed** (BACKLOG-0001299). *Recognise your own case: `source: { mode: 'stream' }`, a feed that has not yet sent `done: true`, and `filters.set({ col: 'mag', op: 'gte', value: 4.5 })` leaves all four of your four rows on screen while `filters.get()` and `filters.where()` both report the filter as installed; `columns.group(['alert'])` forms no groups. Send `done: true` and the identical stream narrows to two rows and three groups, and a memory source over the same rows was right all along.* Because `maxAge`/`ageBy` — the rolling time window — exists only on a stream source, this made a rolling window and filtering or grouping mutually exclusive. Two causes, both in the stream source:
  - **No `invalidate` seam.** Every query change in the grid ends with `source.invalidate(stage)`. The memory source implements it; the stream source did not, so the optional call landed nowhere and the display permutation went on answering the query that was in force when the stream opened. The only other thing that ever rebuilt it was the viewport hint, which compared a query signature and **reloaded** — discarding every row the grid held, so in a real browser the filter emptied the grid rather than narrowing it. A live feed cannot re-send its history, so there was nothing for that reload to recover. The stream now applies the filter, sort, quick filter and `where` predicates itself, to the rows it already holds and to every row that arrives afterwards, and is no longer torn down and re-opened for them. A registered `where` predicate or a `config.hostFilter` on its own now builds the permutation too; previously neither did, so neither was ever asked about a row.
  - **No grouping or pivot at all.** Those are whole-set reductions a permutation cannot express, and the stream had no implementation of them — only the memory source it promoted to on `done`. A grouped or pivoted stream now delegates its reads to a live memory source over the very same rows and the same store, so an open stream, a completed one and a memory source produce the same display rows, the same groups and the same totals.
  - **The status bar's two numbers are now answered properly.** The stream had no `matchCount`/`totalCount`, so both fell back to the display count — which counts group headings and footers as rows. A filtered, grouped open stream reads "3 of 6 rows" where it previously could not report either figure correctly.
  - **`maxAge` eviction and filtering compose.** An aged-out row leaves a filtered or grouped view, and a row the filter excludes never appears in one.
  - **Unchanged.** Chunk coalescing (one re-render per frame however many chunks land), merge insertion into the existing permutation rather than re-sorting, scroll preservation on append, iterator backpressure, off-thread ingest, `maxRows` eviction and its counters and `stream:evicted` payload, and promotion to a memory source on `done` under `promoteToMemoryBelow`. An ungrouped stream allocates nothing extra and takes exactly the path it took before. A change to the host `context` still aborts and re-opens the stream, and `rows.refresh()` still reloads it, which is how a host asks the producer to re-run its own query.

- **A KPI panel bound to a grid could keep showing totals for rows the grid had already filtered out, or miss rows that had just arrived** (BACKLOG-0001300). Two gaps in what a grid-bound panel follows:
  - **A stream source's own arrivals and evictions were invisible to it.** A grid-bound panel already followed a filter, a sort, an edit or `rows.apply`/`rows.load` (BACKLOG-0001121), but a chunk landing on an open stream announces itself as `model:changed` with `reason: 'stream'`, which the panel's settle gate — narrowly, and correctly, scoped to an off-thread sort's own settle reasons — did not recognise, so the panel's store stayed exactly as it was when it was built until the host called `refresh()` by hand. It now also follows a stream's `stream:chunk` and `stream:evicted` unconditionally, so a tile beside an open stream agrees with the grid's own status bar as rows arrive and age out (BACKLOG-0001299's `matchCount()`/`totalCount()` and local filtering while a stream is open).
  - **A collapsed group hid its own leaves from every tile.** The panel materialised its rows by walking the grid's *displayed* rows, which — correctly, for a renderer — leave out everything beneath a collapsed heading; a tile is supposed to measure the whole filtered dataset, so collapsing a group could zero or under-count it. Each top-level heading is now expanded through `rows.leavesOf`, which answers with a group's filtered members whether or not it is open on screen, recursing through nested sub-groups to the real leaves, and nothing already collected that way is walked again as the display rows are visited.

### Documentation

- **The kanban board's 47 config keys carried a reference entry and a guide entry but no runnable example and no test tagged against them, held as recorded debt in the completeness gate's frozen list** (BACKLOG-0001292, continuing BACKLOG-0001273's tabs family). Every kanban and kanban-SLA config key (`columnProperty`, `columnOrder`, `pointsProperty`, `showPoints`, `orderProperty`, `doneColumns`, `sprintProperty`, `sprint`, `sprints`, `epicProperty`, `epic`, `swimlaneProperty`, `swimlanes`, `lanes`, `laneOrder`, `card`, `quickFilter`, `readonly`, `ariaLabel`, `selectable`, `labels`, `emptyText`, `addCard`, `onAddCard`, `onCardEdit`, `onBeforeMove`, `onCardMove`, `onCardClick`, `onCardDblClick`, `onCardContextMenu`, `enforceWip`, `sla`, `basis`, `createdProperty`, `enteredProperty`, `ignoreDone`, `now`, `warn`, `breach`, `onWarn`, `onBreach`, `showAge`, `useTransitionLog`, `tick`, `cardRenderer`, `virtualize`, `children`) is removed from `FROZEN_MODULE_CONFIG_DEBT` in `tools/check.js`, taking it from 97 to 50. No product behaviour changed.
  - **Six new executed examples in `docs/api-detail.html`**, each grouping the keys one flow demonstrates together: board structure (grouping, order, points, a done set); sprint/epic/swimlane selection at construction; card mapping, quick filter and readonly; accessible name, localised labels and selection; the add-card/edit/move lifecycle plus WIP enforcement; and card aging (SLA basis, thresholds, callbacks and the re-check tick). Each runs for real against the headless board (or the test DOM where a key's effect is visual) and returns the value the example claims.
  - **`@covers` tags on the tests that already proved most of these keys**, plus new tests for the handful of gaps a grep alone would have missed: `ariaLabel`, `columnOrder`, `doneColumns`, `sprint`, `epic` and `laneOrder` were previously only exercised through their runtime-setter twin (`reorderColumns`, `setSprint`, …), never through the config key itself at construction; `lanes`, `onAddCard`, `onCardContextMenu`, the initial `quickFilter` and `selectable` had no test at all; and the SLA suite, despite being otherwise exhaustive, had never varied `basis` off its default and had never exercised `tick` or `onWarn`. Each new test was mutation-checked by breaking the key's read site and confirming the named test fails.

- **The layout module's 23 config keys carried a reference entry and a guide entry but no runnable example and no test tagged against them, held as recorded debt in the completeness gate's frozen list** (BACKLOG-0001293, continuing BACKLOG-0001273/BACKLOG-0001292). Every layout-level config key (`overflowX`, `overflowY`, `columnWidth`, `gap`, `padding`, `compact`, `closable`, `movable`, `resizable`, `maximisable`, `minimisable`, `windows`, `layout`, `onWindowMoved`, `onWindowResized`, `onBeforeWindowMove`, `onWindowMoveCancelled`, `onBeforeWindowResize`, `onWindowResizeCancelled`, `onBeforeWindowClose`, `onWindowCloseCancelled`, `onWindowClosed`, `onLayoutChanged`) is removed from `FROZEN_MODULE_CONFIG_DEBT` in `tools/check.js`, taking it from 50 to 27. No product behaviour changed.
  - **Five new executed examples in `docs/api-detail.html`**: geometry (overflow axes, track size, gap, padding); the layout-level interactivity defaults; the window list and a saved arrangement applied at mount; move/resize before-events (independently gated, each paired with its own cancellation); and the close before-event with `layout:changed`.
  - **`@covers` tags on `test/layout.test.js`**, plus new tests for the two before-events that had never been exercised at all (`onBeforeWindowResize`/`onWindowResizeCancelled` — a distinct gate from `onBeforeWindowMove`, confirmed independent by test), the initial `columnOrder`-style construction-time keys that only had a runtime-setter twin tested previously (`config.layout` applying a saved arrangement at mount), and `gap`/`padding` at non-default values (previously only the built-in 8px/5px fallback was ever asserted). Each new test was mutation-checked by breaking the key's read site and confirming the named test fails.
  - **F-1134-B settled by test, not left as a further-decayed claim**: the `docs/API.html` "Not in v1" sentence denied both "nested layouts" and, implicitly, composed tabbed windows without ever being tested. A layout window's payload is an ordinary container the module never reads, so another `createLayout` dashboard and a `modules/tabs` strip both compose into it exactly as any other DOM content would (`test/layout.test.js`, two new tests). "Nested layouts" was false and is removed from the denial list; "tabbed windows (that is `modules/tabs`)" was true and is now proved by test rather than asserted from the design. Per-frame drag events and responsive breakpoints, the other two "Not in v1" clauses, were independently re-verified against the current source and remain true.

- **The last 27 module config keys carried a reference entry and a guide entry but no runnable example and no test tagged against them, held as recorded debt in the completeness gate's frozen list — and the list is now empty** (BACKLOG-0001294, completing BACKLOG-0001273/BACKLOG-0001292/BACKLOG-0001293). AI's 14 (`ask`, `autoApply`, `element`, `enable`, `maxColumns`, `onError`, `onNarrative`, `onProposal`, `onQuery`, `reconcile`, `redact`, `router`, `schemaOptions`, `tools`), KPI's 11 (`fields`, `messages`, `nullText`, `onChange`, `onNodeToggle`, `onTileClick`, `onTileContextMenu`, `onTileDblClick`, `tiles`, `expanded`, `separator`) and the Data Router's 2 per-route options (`filter`, `transform`) are removed from `FROZEN_MODULE_CONFIG_DEBT` in `tools/check.js`, taking it from 27 to 0. **`FROZEN_MODULE_CONFIG_DEBT` and its gate wording are removed entirely** — the completeness gate's success line no longer mentions a frozen count; it reports `all N public capabilities are documented, demonstrated and tested`, because that is now true. The example/test ratchet, previously scoped to skip the frozen ids, now applies to every config key without exception. No product behaviour changed.
  - **Six new executed examples in `docs/api-detail.html`**: the AI insights panel (`element`, `tools`, `enable`, `maxColumns`, `reconcile`, `onNarrative`); ask-your-data (`autoApply`, `schemaOptions`, `redact`, `router`, `onQuery`, `onError`); the governed actor (`onProposal`); the KPI tile hierarchy (`tiles`, `separator`, `expanded`, `onNodeToggle`); grid-bound KPI events (`fields`, `onTileClick`, `onTileDblClick`, `onTileContextMenu`, `onChange`); a KPI host catalogue and an unmeasured tile (`messages`, `nullText`); and a Data Router per-route `filter`/`transform`.
  - **`@covers` tags on the tests that already proved most of these keys**, plus new tests for the genuine gaps: `onTileContextMenu`, `onTileDblClick` and `onChange` had no test at all; `separator` was only ever exercised at its default; and `config:router`/`config:schemaOptions` (the construction-time defaults) were previously proven only through their per-call `opts.router`/`opts.schemaOptions` overrides, never through `createAI(grid, { router, schemaOptions })` itself. `enable`, `onProposal`, `onNarrative` and `maxColumns` had no example or test either. Each new test was mutation-checked by breaking the key's read site and confirming the named test fails.
  - **Finding, not fixed**: `config:enable`'s own documentation ("Opt into specific features: `'narrative'`, `'insights'`, `'query'`/`'ask'`") reads as though it gates the programmatic `explain()`/`query()`/`propose()` calls. It does not — only the DOM-mounting convenience methods (`insights()`, `askBar()`, `actorBar()`) check it; the underlying API runs regardless of `enable`. The key is not dead (the DOM gate is real and is what this cycle's example and test demonstrate), but its scope is narrower than the prose implies.
  - **F-1292-A fixed**: `config:showPoints`'s tagged example and `@covers` test asserted `b.points('todo')`, which does not depend on `showPoints` at all (`pointsProperty` alone drives it; `showPoints` only decides whether the sum is drawn into the DOM column header). Replaced with a DOM assertion — the points span is present with `showPoints:true` and absent with `showPoints:false` — in both `docs/api-detail.html` and a new `test/kanban.test.js` test.
  - **F-1293-A fixed**: `test/layout.test.js`'s title "a push never moves a window sideways — there is no horizontal compactor in v1" was stale prose (horizontal compaction shipped in BACKLOG-0001134); retitled to state what `pushDown` itself actually promises, with the assertion unchanged.

- **`createAI`'s `enable` config key is now documented for what it actually does** (BACKLOG-0001301): it gates only the three DOM-mounting convenience methods (`insights()`, `askBar()`, `actorBar()`), not the programmatic API. The JSDoc on `AIConfig.enable` (`packages/core/src/types.d.ts`, regenerated into `docs/API.html`'s reference table) and on `createAI`'s `config.enable` param (`packages/modules/ai/index.js`), the hand-written narrative in `docs/API.html`, and the guide example in `docs/api-detail.html` now all state precisely which allowlist value gates which mounted affordance (`'narrative'`/`'insights'` &rarr; `insights()`, `'query'`/`'ask'` &rarr; `askBar()`, `'actor'` &rarr; `actorBar()`), and that `explain()`, `query()`, `propose()`, `facts()` and `riskSummary()` always run regardless — a host that wants no AI surface at all simply never calls those methods. This supersedes the "Finding, not fixed" note in the BACKLOG-0001294 fragment. No product behaviour changed; the existing `enable` gate test in `test/ai-narrative.test.js` is unchanged.

### Internal

- **`tools/browser.js` orphaned Chrome's whole process tree when the calling script did not reach `close()`** (BACKLOG-0001302, F-1289-A). Chrome is started `detached` so `close()` can reap its zygotes, gpu process and renderers with one signal to the group — but nothing else did, so a test or tool that threw, called `process.exit()`, or was SIGTERMed before that line left the tree parented to pid 1, still burning CPU and degrading every later perf line (119 orphans on 14 Sep; a leaked tree that cost a card ~50 minutes on 15 Sep; a stray gate's ~390 pids on 16 Sep). A `Browser` now arms an exit safety net at construction — `process.once` on `exit`, `uncaughtException`, `unhandledRejection`, `SIGINT` and `SIGTERM` — that kills its recorded process group and is removed again by `close()`, so a script that opens many browsers in sequence does not accumulate listeners on `process`. No behaviour change for callers: the calling script still crashes with the same exit code, or dies by the same signal, it always did.

## [1.61.0] - 2026-09-15

### Added

- **The split table/gantt view can now be edited by dragging bars or typing in the table** (BACKLOG-0001280). *Recognise your own case: you called `gantt.mountSplit()`, and the plan beside the table could be read but not touched — no drag, no keyboard, and only the task name and % were typeable.* The split view attached nothing at all to its timeline pane, so switching to it silently gave up the editing the standalone `gantt.mount()` view has always had. Both views now drive **one** implementation of each gesture, and the plain view's gesture tests run against the split view over the same fixtures.
  - **On the timeline.** Pointer drag to move, drag on the right edge to resize, ArrowLeft/ArrowRight to move, Shift+arrow to resize, `l` to link two tasks finish-to-start, Delete to remove one. Bars are in the tab order, carry an accessible name, and every keyboard edit is announced in a polite live region.
  - **In the table.** A left-panel column declared as `kind: 'start'`, `'end'` or `'duration'` shows the scheduled window and is inline-editable on a double-click, beside the `'name'` and `'progress'` columns that already were. A typed finish or duration is the same edit a right-edge drag makes.
  - **`mountSplit` now takes `editable`, `keyboard` and `resizeZone`**, with the same meaning and the same defaults (`true`, `true`, `6`) as `mount`.
  - **One veto, wherever the edit came from.** Every write — drag, key, typed cell — goes through `applyEdit`, so `beforeTaskMove`, `beforeTaskResize`, `beforeProgressChange` and `beforeTaskEdit` still gate it and a vetoed edit leaves both panes exactly as they were.
  - **An edit on a `fields`-mapped plan now lands.** A mapping to a field NAME (`fields: { start: 'startDate' }`) is two-way: the edit is written to the host's own field, so the scheduler reads it back instead of the bar springing to where it was. A mapping to a reader FUNCTION has no inverse, so it still writes the canonical property and still says so once, naming the fields.
  - **A drag on a scaled plot lands under the pointer.** With `zoom` (or a numeric `width`) in a pane narrower than the plan, the browser scales the whole drawing down; the drag maths did not, and committed roughly half the days the pointer travelled. It now reads the plot's own transform, so the committed delta matches the gesture at any scale.
  - **Unchanged.** The plain view's behaviour, the split view's layout, and every existing option. The live region's English is the same text it was; it now comes from the message catalogue (`gantt.a11y.*`), so a host catalogue can translate it.

- **The split table/gantt view can now carry a resource workload band, showing who is booked for how many hours in each week** (BACKLOG-0001281). *Recognise your own case: you can see the plan, but not who it lands on — to find out whether anyone is overloaded in March you read the bars, the assignee avatars and a calculator.* Pass `workload: true` to `gantt.mountSplit()` and a band appears beneath the plan: one row per resource on the left, that resource's hours per time bucket on the right, aligned column-for-column with the timeline's scale header and scrolling with it. Display-only in this release — the cells report hours, they do not accept them.
  - **The hours are derived from the tasks**, never supplied: a task's own `work` (or `hours`) field when it carries a finite one, otherwise `working days × hoursPerDay × units`, divided between the task's assignments in proportion to their units and spread evenly over the working days it spans. `hoursPerDay` defaults to 8. An empty bucket is blank, not `0`.
  - **It uses the resources you already declared.** Rows come from `assignee`/`assignees`/`owner`/`assignments`, units and capacities from `resources`/`defaultCapacity` on `createGantt` — no second vocabulary. A task naming no resource is carried on an "Unassigned" row rather than dropped, and a bucket above `capacity × hoursPerDay × the bucket's working days` is marked with a class and an accessible label. A totals row and a totals column state the plan's shape at a glance.
  - **The columns are the timeline's own.** They follow the view's `zoom` — days, weeks or months — and are positioned with the same scale the bars are drawn with, so a bucket edge *is* a header separator. Horizontal scrolling is locked in both directions; vertical scrolling is independent, so the resource list scrolls without moving the task list.
  - **It is live.** A bar dragged, a key pressed or a table cell typed moves the hours in the same paint, because the band is drawn from the same schedule in the same redraw.
  - **`workload` takes an object** to override `hoursPerDay`, the band's `height` and `rowHeight`, the `decimals` a cell shows, and `totals`.
  - **Unchanged.** A split view that does not ask for a band is untouched — no extra element, no extra listener, and the band's own text comes from the message catalogue (`gantt.workload.*`).

- **You can now type hours straight into the resource workload band, and the plan moves to match** (BACKLOG-0001282). *Recognise your own case: the band tells you March is overloaded, and fixing it means going back to the bars, re-dragging a task and checking the band again to see whether it worked.* Expand a resource row — it now discloses one sub-row per task it carries — and double-click one of that task's cells to type a number of hours. The bar, the table row and the band all move in the same paint.
  - **The resource's own row stays read-only**; the editable cell is the per-task sub-row beneath it, so "whose hours changed, on which task" is never a guess the module has to make for you. The disclosure control is a real button with `aria-expanded`, reachable from the keyboard, and its label comes from the message catalogue.
  - **The hours you type are stored on the task** as `work: [{ date, hours }]` — one documented name, ISO dates, readable back off `gantt.tasks` and round-tripped through `rows.apply`. A numeric `work` still means the task's total effort spread evenly; an array states each day's hours itself and nothing is spread. An empty array means "no hours booked".
  - **The contour sets the span.** Type into a column beyond the bar and the bar grows to reach it; clear the leading or trailing column and it shrinks back, with the duration following in the plan's own working days. A bucket that contains no working day declines the edit and announces the refusal rather than silently rounding the hours onto the nearest working day.
  - **A bar gesture keeps the shape you drew.** Moving a task with an explicit contour shifts its hours with it unchanged; resizing stretches or squashes them across the new span at the same daily levels, so a task twice as long costs twice as much. It is never reset to an even spread.
  - **The same veto as every other edit.** Every write goes through `gantt.applyEdit`, so a host that cancels `beforeTaskEdit` leaves the band, the bar and the table exactly as they were.
  - **Unchanged.** A band nobody expands looks and behaves exactly as it did, and a split view mounted with `editable: false` takes no input from the band at all.

### Changed

- **`gantt.mountSplit()`'s default left table now shows Start, Finish and Duration** (BACKLOG-0001285). *Recognise your own case: BACKLOG-0001280 made those columns inline-editable, but a `mountSplit` call with no `columns` option still drew the old Task Name / Assignee / % set, so the dates you could now edit were never on screen unless you declared the columns yourself.* The default column set is now, left to right, Task name, Start, Finish, Duration, Assignee, % complete — Start, Finish, Duration and % are inline-editable exactly as BACKLOG-0001280 made them. The left pane's default width grew from 320px to 620px to fit all six without clipping; a host that passes its own `columns` is unaffected.

### Fixed

- **The diff hover on a changed cell now shows the previous value formatted the way the cell formats the current one** (BACKLOG-0001286). *Recognise your own case: the cell reads `£1,234.50` and the tooltip beside it reads `Was: 1234.5`, so audit mode is comparing a number with a different number's presentation.* The hover stringified the stored value while the cell goes through the column's compiled display chain. Both now use that same chain — the column's `format` or `value.format`, its data type's formatter, a lookup's label, and the locale — so a currency column says `Was: £1,234.50` and a date column says `Was: 4 Mar 2025`. The `data-before` attribute, which exists for a theme or host to draw the previous value itself, carries exactly the same text.
  - **A row-dependent formatter is given the row as it WAS.** The previous value is formatted against the snapshot's own row, so a formatter that reads a second field of the row reads that field's previous value too. A formatter that depends on state outside the row still sees today's, and one that throws falls back to the raw value with a warning naming the column rather than stopping the paint.
  - **A secret column no longer publishes its previous value.** It was being written into `title` and `data-before` in clear, even though the cell itself shows only a mask; now neither attribute is set.
  - **Unchanged.** A column with no formatting reads exactly as before, and a previous value of null or undefined still reads `(empty)`.

- **The column header no longer tears away from the columns during a horizontal scroll** (BACKLOG-0001287). *Recognise your own case: the body slides smoothly under your trackpad while the header lurches after it a few times a second, so for most of the gesture the heading above a column is not that column's heading.* The body scrolls on the compositor; the header sits outside that scroller and moved only when a scheduled frame got round to it, which is at least one frame later and — on a busy main thread — several hundred milliseconds later. The header's horizontal placement now happens inside the scroll handler itself, so the two are painted at the same offset in the same frame. Measured on a 438-column, 2,014-row grid under a continuous 1,200 px/s gesture: the header was previously never in step with the body (mean 20 px out, 41 px at worst, and 254 px mean / 343 px worst when a frame cost 250 ms); it is now in step at every single scroll event, in both writing directions.
  - **The pinned-row strip — the grand total row and any rows you pinned — had drifted further still since 1.60.0.** Its centre track was moved only when the strip was rebuilt, and 1.60.0 stopped rebuilding it on every scroll (correctly, for cost) and started rebuilding it only when the visible column window changed. So on the same measurement the strip updated 11 times a second against the header's 43, ending up to 141 px out of line with the totals' own columns. It now moves with the header and the body, every time.
  - **Unchanged.** Vertical scrolling, right-to-left grids, pinned start/end columns, `scroll.toColumn` and the rest of the frame pipeline: the scroll handler is still passive, still takes no measurement, and every other DOM write still happens in the single animation-frame callback.

- **A trackpad or wheel gesture made over the column header now scrolls the grid, exactly as the same gesture over the data does** (BACKLOG-0001289). *Recognise your own case: two fingers on the trackpad slide the rows sideways perfectly well, and then you happen to leave the pointer over a column heading and nothing moves at all.* The body viewport is the only thing in the grid that scrolls; the header and the pinned-row strips are its siblings, so the gesture landed on an element with nothing to scroll and was thrown away. They now forward it. Measured on the built bundle: a wheel of `deltaX: 120` over the data moved the grid to `scrollLeft` 120 and the identical event over the header moved it 0; both now report 120, on the horizontal, vertical and diagonal deltas alike, and in right-to-left grids.
  - **The pinned-row strip forwards it too**, so a gesture over the grand total row or a row you pinned scrolls the grid rather than doing nothing.
  - **Lines and pages, not just pixels.** A wheel reporting `deltaMode: 1` is converted at 40 px a line, matching what the browser itself would have scrolled the body by; `deltaMode: 2` moves one scrollport.
  - **The page is not trapped.** The gesture is consumed only when the grid actually moved, so a wheel at the top or the end of the grid's own extent still scrolls the page behind it, exactly as before. Where the grid does take the gesture, the page no longer scrolls as well.
  - **A finger drag scrolls the pinned-row strip and any heading that owns no drag gesture of its own.** A heading you can drag to reorder or group, a band heading, and the column-resize grip keep their gestures untouched — a touch there does what it always did.
  - **Unchanged.** Keyboard scrolling, the scrollbars, `scroll.toColumn`, column resize and header drag-to-reorder, and the overlay layer, whose menus and panels still scroll themselves.

- **A chart or grid inside a tab painted at the wrong size and then jumped** (BACKLOG-0001290). *Recognise your own case: you switched to a tab and, for a moment, its grid or a non-grid body (a board, a KPI strip, a Gantt) drew too small or empty, then visibly resized once you'd already seen it.* `activate()` built the tab's grid or viewer while its panel was still `display:none`, so the factory's first measurement of its own container was always 0×0; only afterwards did the panel become visible, which is why a self-correcting body (one with a `ResizeObserver`) still needed a second, late paint to reach its real size, and a body with no such observer never corrected at all. The panel is now revealed before the tab's grid or viewer is built, so the first measurement a factory takes is already the real one.

- **Every chart drew itself twice** (BACKLOG-0001291). *Recognise your own case: a chart with a legend visibly resized a moment after its first paint, and one without a legend still silently drew twice.* `#listen()` observed the plot's own `<svg>` with a `ResizeObserver` as well as its host, on the reasoning that a legend or caption could shrink the plot without moving the host by a pixel — but drawing is what sets the plot's size, so every draw queued another. `draw()` now settles the legend's space inside a single call (retrying once, synchronously, only when populating the legend just changed the box), and the observer no longer watches the plot at all — only the host, whose size the chart cannot itself change. A genuine host resize still triggers exactly one redraw.

### Documentation

- **The API reference's two-pane Gantt sections now describe what the code actually does** (BACKLOG-0001283). The narrative section described only the older arrangement — your own grid beside `gantt.mount()`, glued with `linkVerticalScroll` — without ever mentioning that `gantt.mountSplit()` draws both panes itself, so a reader met the harder option first and the easier one never. It now names both, says which to reach for, and states the condition the write-back actually depends on: a drag on the timeline writes through `grid.edit.setCells` only when `createGantt` was given both a `grid` and a `columns` map; without both it moves the bar and writes nothing. (The write-back claim itself was checked against the tests and kept — it is real, and covered for both the plain and the split view.)

- **The `mountSplit` reference entry now names the switches that govern editing**: `editable`, `keyboard` and `resizeZone`, each with its default and its meaning, plus `workload` for the display-only resource band.

- **The `mountSplit` JSDoc in the Gantt module no longer describes a three-column left panel.** It has had six default columns since the split view gained Start, Finish and Duration, and the comment now says so — along with the fact that the five fixed ones come to 428px, so a `gridWidth` under roughly 600 leaves the task-name tree no room.

- **The Gantt demo's split view was one of those.** Its `gridWidth: 340` could not fit the default columns; it is now 640, in a slightly wider container.

## [1.60.0] - 2026-09-15

### Added

- A column group that declared a `header` block was drawn with the stock title anyway: the key validated, was carried into the model and was then read by nothing. `ColumnGroup.header` now honours `render`, `props` and `class` exactly as a column's `header` does, through the same implementation, so a band can draw its own heading. Drawing your own heading costs the band nothing: in-place rename, band drag, the collapse toggle and the toggle's accessible name all continue to work.

- **A `where` predicate on a pushdown-backed grid now actually filters, instead of only warning that it does not** (BACKLOG-0001268). *Recognise your own case: a source built by `createPushdownSource` (DuckDB, OData, GraphQL, REST, DFQL), a `filters.where('mine', fn)` with no `{ condition }` twin, and rows on screen that the predicate excludes.* Two things were broken independently and both are fixed: the request a grid's source builds carried no predicate at all, so the planner never learned a residual existed (BACKLOG-0001236 established that by execution); and `needsAll` ignored `residual.where`, so even a hand-built request returned on the window path before the residual could run — a range-capable adapter invoked the predicate **0** times and returned every row. `RemoteRequest` now carries the predicate runtime as `where`, and a residual `where` forces the whole-result fetch, so the predicate runs over the matching set and the counts are whole-dataset counts.
  - **It is gated on a row limit, not switched on unconditionally.** A `where` predicate is a host function no engine can evaluate, so the only way to honour one is to fetch every matching row and hold it — which would silently convert a windowed grid into a whole-dataset download, the one thing a pushdown source exists to avoid. The new `whereRowLimit` config key (default `50_000`, the same anchor as the grid's `workerThreshold`) is the ceiling: under it the predicate runs, at or past it the source refuses and warns once, naming the adapter, the size, the limit and the `{ condition }` twin as the route that narrows the fetch itself and therefore works at any size. An adapter that reports no row total counts as over the limit — guessing the other way is guessing your way into the download.
  - **A refusal costs no extra traffic.** Where the predicate alone would force the whole result, the size is learned from a bounded probe that is exactly the window fetch the request would otherwise have made, and that result is reused as that fetch when the answer is "refuse". Where the whole result was being fetched anyway, the decision is taken against the rows already in hand.
  - **The registration-time warning for pushdown sources is withdrawn** (it shipped in 1.60 from BACKLOG-0001236). The size of the matching set is not known until an adapter answers, so registration is the wrong moment to judge it; telling every pushdown host their predicate does nothing, including those for whom it now does, is the same class of false statement 1236 removed. Paged and remote sources still warn at registration, unchanged — they cannot run the function at any size.
  - **A predicate registered after the first paint now takes effect.** The remote source's query signature carries the `where` registry version, so registering or removing a twinless predicate drops the cached blocks and re-fetches. Without it the caches answered the new query with the old rows; a predicate with a twin was already covered, because the twin lands in the filter tree the signature already signed.
  - **The page-relative warning no longer fires when the predicate ran over everything.** That message tells a host its match counts are relative to a fetched page rather than the dataset — true when a predicate filters a window, and false on this card's own path, where the predicate only runs *because* the whole matching set was fetched. It is now suppressed when the rows really are the whole set, and still fires wherever they are a fraction: an adapter that short-returns against a whole-set request, or a direct `applyResidual` call that makes no claim. A warning that contradicts what the grid just did is not a conservative one — it teaches a host to distrust a number that is correct, and costs the message its meaning on the path where it is true.
  - **Unchanged.** A grid that registers no predicate sends the request it always sent, field for field — `where` is attached only when one is in force, and a host `fetch` that does not know the field ignores it. A predicate with a `{ condition }` twin behaves exactly as before on every source. Memory, stream and derived sources are untouched.

- **A host could not observe a pointer press and release on a cell as separate events, with the row correctly identified** (BACKLOG-0001272). *Recognise your own case: you want to tell a deliberate click apart from a press that turns into a drag, or start your own gesture on `mousedown` — and binding it to a cell element gave you the wrong row after any scroll.* Sibling to `cell:mouseover`/`cell:mouseout` (BACKLOG-0001203): rows and cells are pooled and re-used, so a listener on a cell node fires for whichever row occupies it next, and a host cannot correct for that itself. `cell:mousedown` and `cell:mouseup` now fire once each, delegated on the viewport, carrying the same payload as `cell:clicked` plus the cell element as `target` — one convention, not two.
  - **The row is resolved as the event fires**, so a pooled row re-used after a scroll between the press and the release reports the row it is showing now.
  - **Unchanged.** Both are announcements: nothing here is consumed, nothing calls `preventDefault`, and the existing focus tracking and click/selection path are unaffected.

### Changed

- **A module could add, rename or remove a public config key and nothing noticed** (BACKLOG-0001264). *Recognise your own case: four public keys were added to `TabsConfig` and the capability registry's count did not move — 876 before, 876 after — while `node tools/apiref.js` produced no diff and the generated reference contained no trace of `LayoutConfig`.* Both readers that describe the public surface were anchored on `export interface` in column 0 with members at exactly two spaces, and every module config interface is written as a bare `interface XConfig {` indented inside a `declare module 'lattice-grid/modules/…'` block, so the config surfaces of tabs, layout, kpi, kanban, gantt, ai and the data router were invisible to both. `tools/capabilities.js` and `tools/apiref.js` now read an interface at any indent, exported or not, and take its members at that interface's own indent plus two — so a field of a nested inline object is still not mistaken for a key of its parent. The registry now reports 980 capabilities rather than 876, and the generated type reference 2,569 declared members rather than 1,867; no capability that was visible before is dropped.
  - **Forty-three module config keys now have a guide entry.** Making the surface visible showed that 43 of the 104 keys were absent from `docs/api-detail.html`, which the reference-completeness gate requires of every developer-facing capability; each now carries a short entry under "Module configuration", written from its declaration and its use site. The tabs, layout, KPI and kanban callbacks are documented as what they are — a second route to an event the module already raises — and each `onBefore…` gate states that returning `false` vetoes the action and fires its paired `…Cancelled` callback.
  - **The 104 keys are frozen as recorded debt, not exempted.** None carries a runnable example or a `@covers` test, because nothing could require one of a capability nothing could see. They are held out of those two ratchets by explicit id, so a config key added from here still fails the build until it is demonstrated and tested, and the frozen count is stated in the check's own output rather than passing silently. They stay fully gated on the reference and the guide.
  - **A `@covers` tag naming a module config key now resolves.** Such a tag was rejected as naming "not a capability", so a test could not state which module config key it exercised.
  - **A one-line interface no longer adopts the declaration that follows it.** `interface FeedChange { op: 'upsert' | 'delete' }` stayed open in the reference generator and took the next indented block — the inline options object of the function declared after it — as its own members, publishing them under an interface that never declared them.

### Fixed

- **A full-pulled pushdown source's sort or filter ordered by a computed column's placeholder after `rows.refresh({ force: true })`, while the cell text had already moved on** (BACKLOG-0001217). *Recognise your own case: `createPushdownSource({ fullDataset: { enabled: true } })`, a computed column whose value depends on something that resolves after the rows arrive, a sort or filter selected on that column while it still reads the placeholder, then the answer resolves and `rows.refresh({ force: true })` runs — the painted cell and `rows.text()` show the new value, but re-selecting the same sort or filter keeps ordering and matching by the old one.* `grid.js` asks the source to drop its cached handles on every `rows.refresh`, and `RemoteSource` answered that for its full-pull memory delegate (BACKLOG-0001201) by bumping the object-handle cache alone. That is not enough: the delegate also memoises each pipeline stage's own *result* against a key, and a filter or sort re-selected identically to how it stood before the refresh — the ordinary case, since the point of re-checking is that nothing about the selection itself changed — is served from that cached result rather than recomputed. `RemoteSource#invalidateHandles` now also discards the delegate's filter stage and everything downstream (sort, group, total, pivot, flatten), so a full-pulled pushdown or REST source's sort and filter follow a recomputed cell exactly as the stream/url source's already do.
  - **Diverges from the stream/url source's fix on purpose.** BACKLOG-0001201 started that drop at `sort`, on the finding that `filter` recomputed on its own there. That finding does not hold for a full-pulled remote/pushdown source: measured directly, a filter cleared and re-set to the same predicate with no read in between was still answered from the stale cached filter result. Starting the drop at `filter` here closes that gap; it was not carried back to the stream/url source, which stays as BACKLOG-0001201 left it.
  - **Unchanged.** Every other BACKLOG-0001201 guarantee: `deps` semantics, `pure: false` behaviour, `rows.load()`/`apply()` invalidation, and the stream/url source's own fix.

- **`PermissionLevel` was declared twice in `types.d.ts`, with the union members in a different order, which alone was enough to block a whole-file `tsc --strict` compile of the shipped `.d.ts` without `--skipLibCheck`** (BACKLOG-0001232). The second, undocumented declaration (`'hidden' | 'read' | 'write' | 'writeOnly'`) disagreed with the runtime's own canonical ordering — `PERMISSION_LEVELS` in `columns/permissions.js`, "most restrictive first": `'hidden' | 'read' | 'writeOnly' | 'write'` — and carried none of the doc comment explaining why `writeOnly` is a distinct, more-permissive-than-`read` corner. Removed the undocumented duplicate; the documented, runtime-matching declaration is now the only one. No member was added or removed — both bodies named the same four levels — and no public capability count moved.

- **A `where` predicate registered against a pushdown-backed grid excluded no rows, and the grid said nothing about it** (BACKLOG-0001236). *Recognise your own case: a source built by `createPushdownSource` (DuckDB, OData, GraphQL, REST, DFQL), a `filters.where('mine', fn)` with no `{ condition }` twin, and rows still on screen that the predicate excludes — while `filters.where()` lists the name, `filter:changed` fires and `rows.move` declines as though the grid were filtered.* A pushdown source was the one kind left out of the BACKLOG-0001234 registration warning, on the grounds that its residual applies the predicate itself. It did not: the request the remote source builds for a fetch carried the filter tree, sort, quick text, grouping, totals, paging and context and no predicate at all, so the pushdown planner was never handed one and the residual `where` branch never ran. Established through a real `hint()` → fetch pass rather than by calling `planQuery` directly — calling it directly is what hid the defect for so long.
  - **The fix shipped in the same release as the diagnosis.** BACKLOG-0001268 wires the predicate through for a pushdown source, gated on a row limit, so a twinless predicate there now filters rather than warns. See that entry for what a pushdown-backed grid does now; the registration-time warning this card added for pushdown sources was withdrawn by it, because the size of the matching set cannot be known at registration.
  - **Paged and remote sources warn at registration, and that stands.** Neither can run a host function over anything but the window it holds, at any dataset size, so for those two the named warning is the whole answer.
  - **Unchanged.** A predicate with a `{ condition }` twin is still silent everywhere — the twin is ANDed into the tree every source is sent, and it really does reach a pushdown adapter. Memory, stream and derived sources still apply the function over every row they hold and still warn about nothing.

- **A custom `column.filter.type` whose `set()` notifies could re-enter the tool panel's filter repaint mid-rebuild and leave an expanded section blank**, staying empty until the user collapsed and re-expanded it — the filter condition itself was always correct; only the section's own display was affected (BACKLOG-0001244). `FiltersPanel.refresh()` was not guarded against running re-entrantly against the `root` it rebuilds: a nested repaint could reparent an already-expanded column's shared filter widget out of a still-attached section into its own, leaving two competing `.lat-panel__filters` lists in `root` with the first — the one a reader, and `querySelector`, land on — missing its widget. Reaching this needs a custom filter type that notifies from inside a host-driven sync — instrumenting the repaint's re-entrancy depth across realistic use of every shipped filter type (typed keystrokes at native and rapid speed, checkbox toggles, operator switches, per-column Clear, Clear All, and cross-surface header-and-panel edits) never nested it, because no shipped filter's `set()`/`clear()` notifies that way. `refresh()` now serialises against itself regardless: a repaint requested while one is already running is coalesced into a single follow-up pass instead of interleaving with it, so a custom filter type gets the same guarantee the built-in ones already had.

- **A context menu taller than the space available to it was cropped by the host's `overflow: hidden` instead of fitting** (BACKLOG-0001260). *Recognise your own case: a cell menu opened inside a short container — a dialog, a small grid — where the last visible item was sliced through mid-text and every item below it was unreachable.* `ContextMenu.place()` already flips and clamps a menu to keep it on screen, but that only ever relocates it; a menu still taller than the box after both attempts now also gets a `maxHeight`/`overflowY: auto` sized to the same space, so its item list scrolls and every item stays reachable. A menu that already fits is unaffected — no new style, same position.
  - **Keyboard navigation scrolls the roving focus into view.** Arrowing to an item outside the visible portion of a scrolling menu now brings it on screen before focusing it, so a keyboard user is never left without feedback for a focus change they cannot see.

- **The pinned/sticky row strip drew every column in the layout on every paint, while the body beside it draws only the horizontally-virtualised window** (BACKLOG-0001265). *Recognise your own case: a wide grid with `grandTotalRow` or pinned rows configured, where the strip's repaint work did not shrink the way the body's did once column virtualisation engaged.* The strip's centre region now draws the same `{ from, to }` column window the body paints that frame, rather than every centre column; the pinned start and end regions are unaffected, since they are never virtualised. This is a consistency fix, not a measured scroll-speed improvement — at the column counts most grids actually show (tens, not hundreds), the difference is not user-visible; it matters at the scale where column virtualisation itself starts to matter.
  - **The strip's repaint signature carried the raw horizontal scroll offset, so it rebuilt on every scroll frame even when nothing entered or left the window.** It now carries the window's bounds instead: a scroll that does not cross a column boundary rebuilds nothing, exactly as the body already did.
  - **`renders().dom.cellWrites` did not count the sticky strip's cells at all; now it does.** A host comparing this number across 1.59 and this release will see it rise for a grid with pinned rows or a grand total row — that rise is the counter becoming complete, not the grid doing more work. Body-cell writes, which is what the counter reported before, are unchanged.
  - **Unchanged.** Every other reason the strip repaints — totals, filters, row count, column visibility, viewport resize — still does.

- **A filter you had already applied was destroyed by a later call with a bad operator** (BACKLOG-0001267). *Recognise your own case: with `{ col: 'a', op: 'eq', value: 'x' }` applied and one row showing, calling `filters.set({ col: 'a', op: 'equals', value: 'x' })` — a typo for `eq` — left `filters.get()` returning `null` and the match count back at three.* The refusal added in BACKLOG-0001180 kept the bad condition out of the filter tree but still installed what was left of it, and what was left of a wholly refused call was nothing — so a typo silently widened the row set a user had correctly narrowed. `filters.set()` and `state.apply()` now leave the previous filter exactly as it was when every condition in the call is refused: `filters.get()` returns what it returned before, the match count does not move, and the warning still names the operator received and the operators valid for that column's type. A call with at least one valid condition replaces the tree as it always did, and `set(null)`, `clear()` and `state.apply({ filters: null })` still clear.

- **Three filter evaluators guessed at operators they do not implement, instead of refusing them** (BACKLOG-0001270). *Recognise your own case: a data-router route with `where: { col: 'tags', op: 'containsNone', value: ['a'] }` put rows holding `a` into the grid — the exact rows the filter excludes; an AI `runQuery` with `where: { op: 'containsAny' }` returned a sum computed over zero rows, with no warning of any kind; and `testValue` — exported from the package entry — returned `true` for any condition it did not recognise.* All three are valid §9.3 operators, so this is not a typo story: the evaluators implement 16, 7 and 20 of the twenty respectively, and approximated the rest. A condition a layer cannot evaluate is now **refused, never approximated** — it never admits a row it excludes, never silently narrows to empty, and the caller is told once, by name, with the operators that layer *does* evaluate.
  - **Data router.** `query()` now rejects when a residual operator (`matches`, `containsAny`, `containsAll`, `containsNone`) cannot be finished client-side, naming the operator and column. It fails visibly rather than resolving with zero rows, because empty is indistinguishable from "matched nothing" — the same silent failure seen from the other side. Push the filter down to an adapter that implements it, or use one the router evaluates.
  - **AI tools.** `runQuery` refuses an unevaluable `where` through the same `{ error }` channel a redacted column already uses, before a single row is read. A clause with a field but no operator is refused too. The seven operators it does implement are unchanged.
  - **`testValue` (DOM filter fallback).** Throws a named `[lattice]` error for an operator outside §9.3 rather than passing every row. All twenty §9.3 operators are implemented, so no valid condition changes behaviour; `condition()` already refused to build an invalid one, so only a hand-authored tree reaches this.
  - **Unchanged.** Every valid, implemented operator evaluates exactly as before at all three sites. `filters.set()`'s refusal (BACKLOG-0001180) and its preservation of the previous filter (BACKLOG-0001267) are untouched.
  - **Written down.** `docs/CONTRACTS.md` §9.3 now states the rule normatively: a layer that cannot evaluate an operator refuses the condition, and "I do not implement this operator" is treated identically to "I do not recognise this operator".

- **Every `@toclocoinc/lattice-grid/modules/<name>` import was typed as the core package, so a TypeScript consumer got "Module '@toclocoinc/lattice-grid' has no exported member 'autoInit'" for names the module plainly exports** (BACKLOG-0001274). *Recognise your own case: `import { createGrid } from '@toclocoinc/lattice-grid/modules/htmx'`, `createChart` from `/modules/charts`, `createKanban` from `/modules/kanban` — each flagged TS2614 against the **root** package's export list, plus three `TS2307: Cannot find module '@toclocoinc/lattice-grid'` raised inside the shipped `lattice-grid.d.ts` itself, and `skipLibCheck: true` hid only the last three.* The manifest resolved every `./modules/*` subpath's `types` condition to `lattice-grid.d.ts`, which is also the file `"."` resolves to; a subpath that resolves to a file is typed by *that file's own exports*, so the 35 `declare module` blocks inside it were never consulted. The build now splits those blocks into one declaration file per subpath (`modules/<name>.d.ts`, shipped beside the bundle it types), each importing the core names its body used to see by lexical scope, and the manifest points `./modules/*` at `./modules/*.d.ts`.
  - **The three self-referencing re-exports now use a relative specifier.** TypeScript does not resolve a package's own scoped name from inside that package's declarations; `../lattice-grid.js` always resolves. They are still `export … from` statements, not `typeof import(…)` rebindings — `Grid` and `Registry` are interfaces, and a `typeof` rebinding carries the value namespace only, which would leave every `createGrid(…): Grid` position in the same file broken while the value imports passed.
  - **Unchanged.** `packages/core/src/types.d.ts` is untouched — the split is a build-output transform, and the declared member count is the same 2569. The root `"."` entry still resolves to `lattice-grid.d.ts`, no declaration was added or removed, and no runtime bundle changed.

- **A relative date filter with a bad token installed itself and then matched every row** (BACKLOG-0001275). *Recognise your own case: `filters.set({ col: 'when', op: 'relative', value: 'lst7Days' })` — a typo for `last7Days` — left `filters.get()` reporting an active relative filter while the match count stayed at every row, and if you already had a filter applied, that call destroyed it and widened the row set.* `op: 'relative'` was deliberately waived from the operator check added in BACKLOG-0001180, because a relative window is resolved later than it is installed — the memory source resolves it once per pass and the paged and remote sources resolve it on the way to the server, so that "today" still means today after midnight and saved state restores the token rather than frozen dates. The waiver let a token that resolves to nothing through as well, and the evaluator passes an operator it does not know. The token is now checked when the condition is installed, while resolution stays exactly where it was: a `relative` condition whose token cannot resolve is refused like any other bad operator, so it never becomes state, the filter already in force survives untouched, and the row count does not move. A token that resolves is installed and resolved as before.
  - **The documented object form works.** `{ op: 'relative', value: { relative: 'lastNDays', n: 7 } }` — the `{ relative, n }` shape `relativeTokenOf` documents — failed in exactly the same silent way, because the token parser matched only inflected spellings such as `last7Days` and the literal name carries no digits. It now resolves, taking the count from `n`.
  - **The warning no longer names a token it will reject.** The "unknown relative date token" message listed `lastNDays` among known tokens while refusing it as written. It now lists only the tokens that work as written, and says separately that `lastNDays` needs a count, naming both forms that supply one.
  - **Risk on upgrade.** This changes behaviour for any host passing `op: 'relative'` today. A grid relying — knowingly or not — on the old pass-every-row behaviour of a bad token will see rows disappear, because the condition is now refused and the previous filter stands instead of being replaced by one that matched everything. That is the correct outcome and it is visible: the refusal warns once, naming the token received and the tokens that exist.

- **A header level that no band drew into still consumed a row, holding a row's worth of header height for ever** (BACKLOG-0001276). *Recognise your own case: you collapse a band and the columns disappear but the header stays exactly as tall, or you wrap columns in an untitled group to carry `showWhen` and pay a whole header row for bands that show nothing.* The header counted a level for every group in the tree, while the draw loop skipped a band with no visible columns — so the row was allocated and nothing was put in it. A level is now released when no band draws into it, and the header gives the height back.
  - **Both routes to an empty level are covered**: a band whose columns are gone — through `showWhen` when a group is collapsed, or through `columns.hide()` — and a **transparent spacer**, a band with no title, no toggle and no custom `header` renderer that exists only to carry `showWhen`.
  - **A level is released only when every band on it is invisible**, judged across the three pinned regions together. A titled band, a collapsible one, or one drawing its own heading through `header.render`, `header.props` or `header.class` (BACKLOG-0001221) holds the level for everything beside it.
  - **The header height is dynamic**: collapsing a band now reclaims its row, so the body grows and `aria-rowcount` and every body row's `aria-rowindex` move with it. The header rows are renumbered contiguously.
  - **Behaviour change.** An untitled, non-collapsible, unrendered spacer band no longer draws a header cell, so it can no longer be dragged or renamed in place — once the level is gone there is no cell left to act on.
  - **Expect the spacer cells' borders to go with the row.** Reclaiming the level removes their `border-bottom` and `border-inline-end` along with the cells; that is what reclaiming a row means.
  - **Unchanged.** A transparent spacer with a *band* beneath it keeps its level, because releasing it would mean promoting the sub-band a row.

- **An open context menu lost keyboard focus to the grid on the next repaint, so the arrow keys went to the cells instead of the menu** (BACKLOG-0001277). *Recognise your own case: right-click a cell (or press the Menu key), then let anything at all repaint the grid — a live-feed tick, a totals update, a resize. `document.activeElement` is the `.lat-menu__item` immediately after the menu opens and the `.lat-cell` one animation frame later, and from then on Down, Up, Home, End and Escape are handled by the grid rather than by the menu.* `Renderer#restoreFocus` runs at the end of every paint and reasserts DOM focus on the focused cell; it already stepped aside for a cell editor and for the grid's own chrome landmarks, but not for anything the grid had drawn *over* itself. It now leaves focus alone whenever it is inside one of the grid's overlay surfaces: the overlay layer (popup editors, the row form, the tooltip bubble, the panels) or an element declaring `role="menu"`, `role="tooltip"` or `role="dialog"` within the grid, matched inside the grid's own root so a page that wraps the grid in its own dialog is unaffected. A menu, a tooltip and a popup were one class of exposure and are fixed as one.
  - **Unchanged.** Focus restoration itself: a paint still puts focus back on the focused cell whenever the cell is what the user is on, including after the row it lives in is recycled or scrolled out and back.

- **A leaf column had no declared way to say when it should be shown, so hosts wrapped it in a `ColumnGroup` just to get `showWhen` — and every wrapper costs a header row** (BACKLOG-0001279). The runtime already read `showWhen` off a leaf's own definition (`header.js`'s `showWhenOf`), and `KNOWN_COLUMN_KEYS` already needed to recognise it as one; only the public type was missing. `Column` now declares `showWhen?: 'open' | 'closed' | 'always'`, the same union `ColumnGroup` has, so a leaf ties its visibility to a group's open/closed state directly, without an untitled wrapper group whose only job was to hold this one setting.

### Documentation

- **Neither the reference nor the guide said whether the Data Router handles a WebSocket connection or how to send it data, and two of the module's own file-header comments (`a WebSocket/CDC feed`, `resumable after a dropped socket`) read as though it opens or recovers a connection itself** (BACKLOG-0001259). *Recognise your own case: wiring a live socket to `createDataRouter` and guessing between `load()` and `apply()` for a delta, because nothing shipped named which is which.* The router never opens a connection — there is no `new WebSocket` anywhere in `modules/data-router` — and that boundary is now stated plainly in both docs: `docs/API.html` gains a worked, executed example (`#datarouter-websocket-example`) driving the router through `MockWebSocket`'s `onmessage`, covering the snapshot-vs-delta entry points, `seq`/dedupe with and without it (an out-of-order packet silently wins without `seq`; the identical reorder is corrected and counted in `dropped` with it), and reconnect/resume via `lastSeq()`/`checkpoint()`; `docs/api-detail.html` gains a parallel developer-guide section (`#router-websocket-guide`) with a real-`WebSocket` primary example, two of its own executed (`data-run`) blocks, and coverage of `batch`/`coalesce` and multiple feeds via `addSource`. `demo/router-websocket.mjs` runs the whole scenario set end to end (`node demo/router-websocket.mjs`) against the real module. The two misleading comments in `packages/modules/data-router/index.js` are reworded to state the host/router boundary explicitly; no behaviour changed.

- **The README's chart module description said "Thirty-seven chart types," one short of the truth** (BACKLOG-0001262). The base `modules/charts.esm.min.js` bundle draws thirty-eight built-in types (`TYPES` in `packages/modules/charts/index.js`, confirmed against the built `dist/modules/charts.esm.min.js`), not thirty-seven; the two prose mentions in `tools/dist-readme.md` (and the `README.md` / `public_npm/README.md` it stamps) now say thirty-eight. The eighteen separately-shipped `chart-*` extension modules were already counted correctly and are unaffected. The full module map under "Modules & entry points" was hand-checked against `dist/modules/*.esm.min.js` (35 bundles: 6 framework adapters, 11 feature modules, 18 chart-type extensions) and needed no change.

### Internal

- **Added a bench that attributes the write phase on a wide grid** (BACKLOG-0001266). `bench/wide-grid-write.mjs` reproduces a wide-grid shape (438 declared columns, 2,014 rows, collapsed bands, `overscan: 12`) in a real browser and attributes the write phase. It reports the marginal cost of one more cell and the fixed per-frame cost separately, by fitting `writeMs` against `cellWrites` across frames of deliberately varied size, because dividing one by the other charges the whole per-frame cost to the cells and reads as a per-cell figure roughly six times the real one. Also measures vertical and horizontal scrolling as separate captures.

- **Three shipped ambient declarations, plus one doc-comment code sample, named the unscoped module `lattice-grid` instead of the published package `@toclocoinc/lattice-grid`** (BACKLOG-0001271): the `webcomponent` and `htmx`/`dhtmlx-compat` module blocks' internal re-exports in `packages/core/src/types.d.ts`, and a `TabsConfig.createGrid` JSDoc example. All four now name the real package. **This does not make a consumer's `tsc` clean** — the three re-export specifiers still raise `TS2307` under `--strict --skipLibCheck false`, because TypeScript does not resolve a package's self-reference through `export { x } from 'pkg'` inside an ambient `declare module` block when the same physical file also serves as that package's own `.` entry (confirmed on TS 5.6.3 and 7.0.2, under both `bundler` and `NodeNext` resolution); that failure shares its root cause with the `./modules/*` → single-file `exports` mapping tracked separately, and closing `TS2307` fully is owned by that card. A correct package name that does not yet resolve is still strictly better than an incorrect one that never could.

- **The tabbed grid's seven public config keys were documented but demonstrated by nothing and asserted by no test tagged against them, and were held as recorded debt in the completeness gate's frozen list** (BACKLOG-0001273). BACKLOG-0001264 taught `tools/capabilities.js` to harvest module config interfaces, which made 104 already-public keys visible to the gate for the first time — each with a reference entry and a guide entry, and none with a runnable example or an `@covers` test, because nothing could require one of a capability nothing could see. The tabs family is the first to come off that list: `config:tabs`, `config:createGrid`, `config:createHeadlessGrid`, `config:active`, `config:onTabChange`, `config:onBeforeTabChange` and `config:onTabChangeCancelled` are removed from `FROZEN_MODULE_CONFIG_DEBT` in `tools/check.js`, taking it from 104 to 97, so the gate's capability line now reports a smaller frozen count. No product behaviour changed.
  - **Two new executed examples in `docs/API.html`.** `#tabs-governed-example` opens a strip on a chosen tab and vetoes a switch, covering `active`, `onTabChange`, `onBeforeTabChange` and `onTabChangeCancelled` in one flow — it returns `review | changed:draft; cancelled:locked(sealed) | draft`, which pins the fact that `onTabChange` does not fire for the initial tab. `#tabs-headless-example` covers `createHeadlessGrid`: a tab nobody has clicked reads `unmounted | 2 rows`, the live derived count that key exists to provide. The existing derivation-chain example now also claims the `config:createGrid` and `config:tabs` it always demonstrated.
  - **`@covers` tags on the tests that already proved these keys**, rather than new tests written to be tagged: `test/tabs.test.js` for the six strip-level keys and `test/tabs-badge.test.js` for `createHeadlessGrid`. Each was mutation-checked by breaking the key's read site in `packages/modules/tabs/index.js` and confirming the tagged suite fails by name.

- **A red test-suite gate could name fewer failing tests than it counted, or fold two distinct failures into one, without saying so** (BACKLOG-0001278). *Recognise your own case: a gate message reading `suite is red — 3 failing of 3` with only two names listed, or two failures from different files with the same test title showing up as one.* `tools/testsuite.js`'s `not ok` parser only matched column 0, so a failing subtest nested inside a top-level test was never named even though its parent was; it then ran every match through a `Set` keyed on the name alone, so two same-named failures in different files collapsed to one. The parser now matches `not ok` at any indentation — keeping the parent and indenting the nested failure(s) under it — and no longer dedupes by name, so two distinct failures that share a title are both listed. If the named count still disagrees with `# fail` after that, the gate message says so explicitly rather than reading as complete.
  - **The raw TAP now survives the process.** `describeSuiteRun` captured the runner's full output and `tools/check.js` only ever read `.message`, so the stream that could have explained a discrepancy died with the gate. A red run now writes its raw TAP to `bench/.suite-red.tap` (gitignored, machine-local, overwritten each run) and the gate message names the path.

## [1.59.0] - 2026-09-14

### Added

- **A tab strip told you where you could go, never what was waiting there** (BACKLOG-0001058). *Recognise your own case: you have a "Breached SLA" tab and the only way to find out whether it holds nothing or fourteen rows is to click it.* A tab can now carry a **live count badge** and a **leading icon**, turning the strip from navigation into information. `badge: true` shows that tab's own row count; a number or string is a static badge; a function receives the live count and returns what to show (`null` hides it). For a derived tab the count **follows** — filter the parent and the child's badge restates with it.
  - **A tab nobody has clicked still carries a count.** Tabs mount lazily, so the tab most worth badging is the one with no grid yet. Inject the optional `createHeadlessGrid` — the same way `createGrid` is already injected — and an unactivated tab shows a correct count from first paint, computed with no DOM and no renderer. Without it, such a tab simply shows no badge until it is first activated, and the module says so once, naming the option. It never throws.
  - **The tone is yours to declare, never guessed.** `badgeTone` takes `good`, `warn`, `bad` or `unknown` — the same vocabulary a statistic tile grades to, so one `data-tone` rule in your theme dresses both — or a function of the live count. The module applies no threshold of its own, because whether fourteen is good news is not something the grid can know.
  - **The icon takes a single character, an emoji, or an element you built — never a markup string.** Nothing in this module parses HTML, and this did not change that. Anything else is refused: warned about once, named, and ignored.
  - **The count is announced, the icon is not.** The badge joins the tab's accessible name with a visually-hidden unit, so a screen reader reads "Breached SLA 14 rows" rather than leaving the number to be found by touch. The glyph is marked decorative.
  - **Off by default, and inert when off.** A tab that asks for no badge renders exactly the DOM it did before. When a strip is narrow the **label** truncates first — the count and the icon stay whole and legible, and the strip still wraps rather than gaining a scroll affordance.

- **A tab could only ever hold a grid, so "show me that same data as a board" meant building a second thing beside the strip** (BACKLOG-0001070). *Recognise your own case: you have an All / Open / Breached strip and you want Open to also be available as a kanban board, a KPI strip or a timeline — and to keep narrowing from its parent tab exactly as the grid tab does.* A tab descriptor now takes a **`view`**: the factory that mounts its body, called as `(el, config) => instance`. `createKanban` and `createKPI` already have that signature; a Gantt is adapted in one line. Such a tab **derives from its parent exactly as a grid tab does** — same `from`, same `where`/`group`/`join`/`follow`/`refresh` narrowing.
  - **The derivation is the one you already have, not a second one.** For a non-grid body the module materialises a headless grid carrying the very same derived source a grid tab would have got, and pipes its rows into the viewer through `rows.apply({ add, update, remove })` — the keyed diff the grid, the board, the KPI panel and the Gantt all already accept for a Data Router. Nothing new was invented, and the tabs module still imports no engine code: pass `createHeadlessGrid` alongside `createGrid` to derive into a viewer.
  - **A body you have never opened is seeded complete the moment you open it.** Tabs mount lazily, so a board first shown after its parent was filtered twice would, on a live feed, start empty and only catch up on the next change. The headless grid holds the rows, so there is no feed to join late and no window to miss: a body mounted at any time agrees exactly with a sibling mounted before it.
  - **A badge now counts a board, a KPI strip or a Gantt.** The strip asked for a row count as a function call, while the viewers publish it as a number — so a non-grid tab silently showed no badge at all. It reads both, and the Gantt, which had no count to give, now publishes `rows.count` and `rows.forEach` like the others.
  - **A Gantt reads your own field names.** `fields` maps the properties the scheduler reads — `{ id: 'taskId', start: 'startDate', name: 'jobName', duration: 'dur' }`, each a field name or a reader function — so rows are fed as they already exist instead of being renamed first. Unmapped properties read their canonical name, so an existing plan is untouched.
  - **`rowKey` now reaches the Gantt's scheduler.** It mapped identity for the live `rows.apply` surface only, so a row carrying `taskId` and no `id` was keyed correctly and then failed to schedule with "every task needs an id". A task's own `id` still wins where it has one, so a plan that deliberately keys the live surface differently is unchanged. Placement violations and resource load read the mapped identity too, rather than quietly reporting none.
  - **Where a mapping cannot be honoured, it is refused rather than half-applied.** `fields` says how to READ a task, so `level()` — which has to write a new start back — declines a plan that maps `start`, and `applyEdit` says once that the field it writes is not the field being read, instead of leaving the edit to vanish.

- **A dashboard could only float its windows upwards, so dragging one out of a row left a hole that stayed open** (BACKLOG-0001134). *Recognise your own case: you lay panels out side by side across a row, a user drags one away, and the gap sits there until something is dropped into it — because `compact` only ever had a vertical gravity.* `compact: 'horizontal'` is a third mode: windows float **left** into vacated space, exactly the way `'vertical'` floats them up. The default is unchanged at `'vertical'`.
  - **One gravity direction, never two.** `'horizontal'` is a third *value*, not a second pass over the other axis: two directions would each vacate space the other wants, and the arrangement would then depend on which phase ran last.
  - **`compact: 'horizontal'` was previously accepted and silently ignored** — and so were `'verticle'` and `42`, because the config read `raw.compact === 'none' ? 'none' : 'vertical'` and quietly compacted vertically. An unrecognised value now warns once, naming what it was given and what is accepted, and falls back to `'vertical'`.
  - **Order-independence is asserted rather than argued.** All 720 declaration orders of a six-window dashboard are compacted on both axes and must produce one identical arrangement, over a fixture built from ties — two windows sharing a row, two sharing a column, and two coincident pairs. Both comparators gained the window id as a final key, so two windows on the same cell no longer fall back to `Array.prototype.sort`'s stability, which is to say to declaration order.
  - **Unchanged.** `'vertical'` and `'none'` behave exactly as they did, and `compact` is not part of `getLayout()`, so no saved arrangement changes meaning. The axis a mode compacts along is the one that can overflow: a `'horizontal'` dashboard on a `static` horizontal axis can clip a window that does not fit, exactly as a `'vertical'` one on a `static` vertical axis can today — `overflowX: 'scroll'` is the setting that makes the extra space visible.

- **Sizing a column to its content was only ever an imperative call, so a host had to re-issue `columns.autoSize()` after every data change — and a column that was not re-fitted quietly clipped its values** (BACKLOG-0001185). *Recognise your own case: you called `autoSize()` once after load, and columns went back to being too narrow as soon as new rows arrived.* A column may now declare `layout: { fit: 'content' }` and keep itself sized. It is measured on the first paint and again whenever the rows change, the columns are shown, hidden, reordered or pinned, or the grid is resized, using the same measurement `autoSize()` uses — the mounted rows and the heading — so it sizes to visible content rather than to the widest value in the dataset.
  - **A fit taken on a data change measured the data being replaced, so the column was always one change stale.** *Recognise your own case: you load wider values and the column keeps the width the previous values needed, then catches up only on the change after.* The renderer reads in one phase and writes in the next, so a fit measured in the same frame as the change that triggered it read cells still holding the outgoing rows — a column of long values measured 52px, the width its old two-character values needed. The fit is now taken only after a paint later than the request, so it measures what that paint actually drew.
  - **A declared fit could never apply at all, because every column is given a default width and a default was indistinguishable from a choice.** *Recognise your own case: you declare `fit: 'content'` and the column simply sits at 150px.* The grid's built-in defaults give every column `width: 150`, so "the caller asked for 150" and "nobody asked for anything" looked identical, and a stated width has to outrank a measurement. A column that asks to fit its content and states no width of its own now resolves with no width at all, which is the truth about it.
  - **Anything you state outranks it.** A declared `width` wins, and so does a width the user drags to: a resize is recorded as a `width`, so from that moment the column stays where the user put it and no later fit moves it. `min` and `max` clamp a fitted width as they clamp any other, and `flex` is resolved first and wins.
  - **Not re-measured on scroll**, deliberately: different rows mount as the grid scrolls, so re-fitting against them would make the columns jitter under the reader.
  - **Cheaper per application than the call it replaces.** The fit runs inside the frame's read phase, where the cells are already mounted, so it pays neither the `flush()` of a whole frame that `autoSize()` needs from outside a frame nor the teardown of every mounted cell that applying through the column model causes. Several change notifications from one data change still cost exactly one measurement per frame. It is cheaper than calling `autoSize()` yourself; it is not free, and a live fit still measures on every change that triggers it.

- **Nothing reported the pointer entering or leaving a cell, and a host could not wire it up itself** (BACKLOG-0001203). *Recognise your own case: you want a hover card, a row highlight or a side panel that follows the pointer, and binding `mouseenter` to cell elements gave you events for the wrong row after scrolling.* Rows and cells are pooled and re-used, so a listener on a cell node fires for whichever row occupies it next — which is why this has to come from the grid. `cell:mouseover` and `cell:mouseout` now fire once each as the pointer crosses a cell boundary, carrying the same payload as `cell:clicked` plus the cell element as `target`.
  - **Moving between children of one cell fires neither**, and moving straight from one cell to the next fires `cell:mouseout` then `cell:mouseover`, in that order.
  - **The row is resolved as the event fires**, so a pooled row re-used after a scroll reports the row it is showing now, never the one it showed before.
  - **Unchanged.** Both are announcements: nothing in the grid is gated on hover, nothing is consumed, and a keyboard user reaches everything a pointer does. Delegated on the viewport, so there are no per-cell listeners and no per-`mousemove` work.

- **A cell tooltip could only ever be a plain string, so it could not show a related record, a small chart, a list of validation errors or an edit history** (BACKLOG-0001204). *Recognise your own case: you set `cell.tooltip` and got the browser's own `title` — unstyled, slow to appear, impossible to reach with a keyboard, and flattened to one line of text.* `cell.tooltip` now also takes an object, `{ render, mount, unmount }`, describing a tooltip the grid draws itself.
  - **`render(params)` returns one of four things.** An **element**, for full control; a **`{ title, rows, note }` spec** the grid renders for you; **`{ html: '…' }`**, the one wrapper that inserts markup; or a **string**. A bare string is *always* written as text, never as markup, so a value that came from row data cannot turn itself into HTML — `render: (p) => p.value` is safe by construction, and markup has to be asked for in code where a reviewer can see it. Markup inside `{ html }` is scrubbed of script by the same rules the cell layer applies to `allowUnsafeTemplates`.
  - **`mount(el, params)` / `unmount(el)` for live content.** Mount a sparkline or a KPI tile from a module bundle your application loaded — the grid core never imports a module. `unmount` is called every time the tooltip closes, so nothing keeps running behind a hidden box.
  - **Reachable by keyboard, and dismissible.** Focusing a cell shows the same tooltip after the same delay, the cell points at it with `aria-describedby`, the tooltip can be hovered and stays put while the pointer is on it, and Escape closes it (WCAG 2.2 AA, 1.4.13). Nothing is built until the pointer or the cursor has rested for `delay` (400ms by default), so sweeping across the grid mounts nothing.
  - **Grid-level defaults**: `tooltip: { delay, maxWidth }`.
  - **Unchanged.** `cell.tooltip` as a string or a function is still the plain-text case and still becomes a native `title`; an existing grid behaves exactly as it did. The tooltip closes on scroll, because rows are pooled and re-used — a bubble left open across a scroll would be anchored to a node that is now showing a different row, and it would never show one row's content over another's.

### Fixed

- `columns.autoSize()` sized every column to its heading only, clipping its values, when called synchronously right after `createGrid` or right after `rows.load()` — the first frame that mounts the rows had not run yet, so there were no body cells to measure. `autoSize()` now settles any pending frame before measuring, so a synchronous call sizes to content exactly as a settled one does.

- **A right-click context menu in a right-to-left grid grew to the right of the pointer, like a left-to-right grid's** (BACKLOG-0001209). `cell:contextmenu` and `header:contextmenu` open the menu with `{ x, y }` and no `anchor`, and `ContextMenu.place()` applied its RTL mirroring only when an `anchor` was passed — the column menu (`column:menu:open`) always passes one and was already correct, so the capability existed but this call site never reached it. A pointer-opened menu in an RTL grid now grows leftward from the click, its right edge at the pointer, clamped to the host when there is not enough room; a left-to-right grid is unchanged.

- **`toolPanel: { annotate: false }` still put the four annotation tools on the rail once a presentation started** (BACKLOG-0001218). *Recognise your own case: your grid sets `annotate: false` to keep the pen/arrow/rectangle/highlighter tools off entirely, then `grid.presentation.start()` adds them anyway.* `annotate` is a three-state option, not a boolean — `true` opts in and keeps the tools always, `false` opts OUT and the tools are never added, presentation or not, and omitting it keeps the existing automatic turn-on for the duration of a presentation. The automatic turn-on was gated on `annotate !== true`, so an explicit opt-out was read identically to "no preference." A grid already relying on the automatic turn-on (no `annotate` key) is unaffected.

- **A drawn annotation stroke could cross straight over the column headers, the status bar, the edit bar and the tool rail** (BACKLOG-0001220). The annotation canvas covers the whole grid root by construction, header and chrome included, so ink was never confined to the data it was meant to sit over. Drawing is now clipped to the data body, and a stroke can no longer be *begun* over any of that chrome. The clip only confines what paints — the canvas keeps its size and coordinate origin exactly as before, so every already-saved annotation keeps its stored coordinates unchanged and simply renders clipped, with no migration.

### Documentation

- **`groupRenderer` was the one `GridConfig` hook a `name?:` search couldn't find**, because it was declared method-style (`groupRenderer?(params): ...`) instead of property-style (`groupRenderer?: (params) => ...`) like every comparable option (`groupDefaultExpanded?:`, `rowHeight?:`, the board's `cardRenderer?:`). A grep for `groupRenderer?:` against the shipped `.d.ts` now finds it. `fullWidth.when`, `fullWidth.render` and `ai.ask` — the required members of their nested objects — are declared the same property-function-type way for the same reason. No runtime code changed; the type reference (`docs/API.html`) is regenerated from the updated declarations.
  - **One behaviour change for TypeScript consumers with `strictFunctionTypes` on.** A method-style declaration is always checked bivariantly, regardless of that flag; a property-style function type is checked contravariantly once it's on. Confirmed by compiling narrowed-parameter handlers against both the 1.58.0 published `.d.ts` and this build, with the flag on and off: all four members compiled in every case except one — a handler whose parameter type is *narrower* than the documented one (`GroupRowParams`, `Row`, `FullWidthParams`, or `ai.ask`'s params object) now errors under `strictFunctionTypes: true`, where it compiled before. It still compiles with that flag off, and a handler typed to accept the documented parameter (or something broader) is unaffected either way. If this hits you: type the parameter as the documented type (or wider), not a narrower one.

## [1.58.0] - 2026-09-13

### Added

- **A group row could not be drawn by the host, and a group's own rows could not be reached to roll up** (BACKLOG-0001256). *Recognise your own case: you group by a sprint section and want that heading to carry a chevron, the section name, the points summed across the section, a done/total count and a progress bar — and the grid draws its own expander-and-label instead, with no hook to replace it.* Grouping was column-level only: the group row was the grid's to draw, and the rows beneath a heading existed only inside the grouping pipeline, so `leafCount` was the single thing a heading could tell you about its members.
  - **`groupRenderer(params)`** draws the group row yourself, as one band across every column, with no ordinary cells mounted underneath it. Return an HTML string, a node, or write into `params.element`. It is handed the group key, the grouped column id, the group value, the level, the expanded state, `leafCount`, the grid's own `totals`, and `leaves()` for the rows themselves.
  - **A string is inserted as markup here**, unlike `fullWidth.render`, which keeps its string as text. A full-width row renders one of *your data* rows, where §8.9 holds host markup behind `allowUnsafeTemplates`; a group heading is synthesised by the grid and has no data row, so its string can only be your own template — the same contract the board's `cardRenderer` already has. A chevron and a progress bar are unwritable without it.
  - **The chevron is yours to wire.** Any element in your markup carrying `data-lat-group-toggle` expands or collapses its group on click, and `params.toggle()` does the same from a node you built. The grid's own expander binds its own handler, which a returned string cannot, so that chevron would otherwise be dead.
  - **`grid.rows.leavesOf(key)`** returns the leaf rows beneath a group heading — the members it counts in `leafCount` — so a host can total a field the grid was never told to total. Computed per call rather than held on the row, because a group is unbounded; read `leafCount` when the size is all you need.
  - **`groupDefaultExpanded`** sets which groups start open before anyone has touched one: `true`/`false` for all alike, a number for the first N levels (`0` closes everything), or a predicate for a genuinely per-group answer. A group the user or your code has since expanded or collapsed keeps that state.
  - **Unchanged.** `group:toggled` already carried the group key and still does; group rows already took their height from `rowHeight`'s function form; and a `groupRenderer` changes only how a group row is drawn, never what `groupTotal` reduces.

### Fixed

- **The built-in KPI strip (`config.kpis`) graded an empty grid `good`, not `unknown`** (BACKLOG-0001076). `createStat` reads `grid.statistics.reduce`/`rowsInScope()`, and `sum` and `count` both return the identity of their operation over an empty set — 0 — which a `direction: 'down'` band happily clears. A grid with no rows at all therefore painted every threshold-bound tile in `config.kpis` green, the same defect BACKLOG-0001061 fixed in the KPI module, in the separate code path core's own strip uses. Every `createStat` tile — the strip's, and any hand-placed one — is now decided from **dataset presence before value**: `grid.rows.totalCount()`, the count before any filter, not the scoped/filtered rows the tile itself reads. When the grid holds no rows at all, the tile reports `value: null`, carries the new `data-tone="unknown"`, a dashed (non-colour) left edge, and a visible "No data" caption (catalogue key `stat.noData`) folded into its accessible name — whether or not the tile has `bands` configured, so a bare 0 on an empty grid is no more misleading than a green one.
  - **What this changes for a grid already in production:** a `config.kpis` strip, or a hand-built `createStat`, over a grid with no rows now shows `—` and `data-tone="unknown"` where it previously showed `0` and, for a `direction: 'down'` band, `good`. Code reading `stat.value()` on an empty grid now gets `null` where it got `0` or `''`.
  - **Deliberately not broadened:** a filter, or an empty selection (`scope: 'selected'`), that leaves a *populated* grid with nothing in scope is a real, measured zero and is still graded on its own thresholds exactly as before — only an empty grid (`rows.totalCount() === 0`) earns `unknown`. A tile whose value comes from a caller-supplied function or a literal is unaffected; it never read the grid's rows to begin with.

- **A cross-filtering panel (`source.crossFilter`) could disagree with the grid it filters** (BACKLOG-0001158). `crossFilter.get()` used to hand back keys the panel had kept in a private field, updated only by its own `toggle`/`set`/`clear` — so it went stale the moment the source's filter changed by any other route: a second panel cross-filtering the same column, the source's own filter UI clearing the condition, or the panel itself closing. `crossFilter.get()`, `toggle()` and the internal check that decides whether a panel excludes its own condition now all read the source's live filter tree for that column every time, and `destroy()` releases a panel's condition off the source instead of leaving it behind with nothing left to clear it.

- **The perf regression gate compared every local run against a baseline recorded on a 2-vCPU cloud CI runner, not the machine the gate actually ran on** (BACKLOG-0001254). *Recognise your own case: `npm run check` or `npm run check:release` on a workstation reported a kernel's swing against `bench/baseline.json` as if the committed AMD EPYC 7763 figures described your machine, when they never did.* `bench/baseline.json` is now regenerated on the 16-core AMD Ryzen 9 6900HX workstation releases are cut on (owner decision 2026-09-13), and records its own provenance — CPU, core count, Node version, and the calibration state at bake time — so its origin is never unknown again. `.github/workflows/perf.yml` (`ubuntu-latest`/EPYC) now runs report-only (`continue-on-error`): its runner class permanently differs from the committed baseline, so a hard block there would recreate the same cross-class-comparison defect this card exists to close.
  - **Unchanged.** The gate's absolute §19 budgets, its report-only allowlist (`Ingest into ColumnStore`, `Memory, rows resident`), and the +25%/2ms regression thresholds are untouched — this fixes what the baseline was measured on, not how strict it is.
  - **Known gap, not fixed here.** `bench/.calibration.json` (the machine-fitness reference `tools/loadprobe.js` uses to detect moderate load) is resolved relative to the tool's own checkout directory, so it is scoped to one git worktree rather than to the physical machine. On this project's standard workflow of one fresh worktree per task branch, a gate run in a new worktree reports "fitness was NOT assessed" even when the same machine has been calibrated many times over in other worktrees. Investigated and reported for BACKLOG-0001254; not fixed on this branch.

- **A Kanban rows change reset the board back to its first column and every column's cards to the top** (BACKLOG-0001257). Reported from a live workflow: a user scrolled the board right to reach a column, dragged a card into it, and the drop itself snapped the view back to column one. Every rows change (`board.move`, `setRows`, a filter, `setLoading`/`setError`, and the rest of the mutators that regroup the model) routed through a bare `renderBoard`, which empties and rebuilds the board element — the board's own horizontal scroll and each column's independent vertical scroll reset to zero on every call. `regroup()` now renders through the existing `renderPreserving` save/render/restore path (already used by the live `rows.apply` router feed and by `repaint()`), so the board's scroll and each column's scroll hold across any rows change.

## [1.57.0] - 2026-09-13

### Added

- **An application with many grids had no supported way to set house-wide options, and the obvious workaround failed silently** (BACKLOG-0001187, reported from a migration carrying 168 grids). *Recognise your own case: you want every grid to share a theme, a density or a row key, so you try `LatticeGrid.createGrid = myWrapper`. In a plain `<script>` nothing happens and nothing says so — the assignment is discarded and the original function still runs; in an ES module the same line throws `TypeError: Cannot set property createGrid of [object Object] which has only a getter`.* Measured against the built bundle, that is exactly right and not fixable by the host: `createGrid` is exported through a getter with no setter, and `configurable` is `false`, so even `Object.defineProperty` is refused. The supported route is now a `defaults()` function, exported from the package and present on the UMD global as `LatticeGrid.defaults`.
  - **What it does.** `defaults({ ... })` merges beneath the configuration of every grid built **afterwards**, through either `createGrid` or `createHeadlessGrid`. `defaults()` returns the set now in force, as a copy; `defaults(null)` clears it.
  - **The per-grid config always wins.** A key the grid names keeps the grid's value; a key it omits takes the house value. As everywhere else in the config surface, a key passed as `undefined` means "say nothing" and takes the house value rather than blanking it.
  - **Plain objects deep-merge; arrays and everything else replace.** A house `views: { storage }` and a grid's `views: { local: true }` both survive. A grid's `columns` array replaces the house one rather than extending it, so a house column list can never silently lengthen a grid's own. Which keys behave as option bags follows from the value at the key, not from a list that would need maintaining as the config grows.
  - **Calling it twice replaces the set rather than accumulating**, so the result never depends on the order your modules happen to load. Extend explicitly: `defaults({ ...defaults(), density: 'compact' })`.
  - **Never retroactive.** A grid constructed before the call is untouched, because the merge happens as a grid is built. Nothing reached from the defaults is shared between two grids either — nested objects and arrays are copied per grid, so one grid cannot rewrite the house policy for the next.
  - **Unchanged if you do not call it.** With no defaults set the configuration object is passed through untouched, by identity, so every existing grid builds exactly as before. A non-object argument (other than `null`) is ignored with a `[lattice]` warning rather than becoming the house policy.
  - **Where it sits against the page's own declarations.** `createGrid` falls back to the document's `lang` when nothing names a locale, and to a `<meta name="lattice-license">` tag when nothing names a licence. A house default counts as somebody naming one, so it outranks both: `defaults({ locale })` wins over the page `lang`, and `defaults({ licence })` wins over the `<meta>` tag. A grid naming its own `locale` or `licence` still beats the house and the page alike. A host that sets no defaults sees both fallbacks behave exactly as before.
  - **Tests.** `test/defaults.test.js` (new, 20 cases): precedence in both directions through `createHeadlessGrid` and through the real `createGrid`, deep merge and array replacement pinned separately, read-back and clear, replacement rather than accumulation, the locale/page-lang ordering both ways round, and the per-grid copying pinned on each branch it promises — nested objects, arrays, the snapshot taken when the defaults are set, the copies handed back by both the read and the set call, and class instances shared rather than flattened. Non-retroactivity is pinned on `theme` and `locale`, which a grid does change when they are set on it, so the case fails against a deliberately retroactive implementation rather than passing either way. The reference's executed example (`docs/API.html`, `data-run`) demonstrates the same precedence rule both ways round.

- **A row drag could only be observed once it had settled: there was no hook to highlight a candidate target, drive a custom drop indicator, update a side panel as the row travelled, or react when the pointer left the grid** (BACKLOG-0001224, DemandFlow field report: 168 grids migrated from AG Grid). Four new events report the gesture as it happens — `rowDrag:started`, `rowDrag:moved`, `rowDrag:left` and `rowDrag:ended` — each carrying the row being dragged (`key`, `data`), the grid the event is about (`over`) and where the row would land in it (`at`, `overKey`).
  - **All four fire on the grid the drag started in**, for a same-grid reorder and a cross-grid transfer alike. A drag is one gesture with one owner, and the source is the only grid present for the whole of it; `over` names whichever grid the event concerns, so one subscription can drive decoration on any of them.
  - **Notifications, not gates.** None is cancellable and none carries `preventDefault`. The drop is already vetoable twice over — `beforeRowMove` for a reorder, `beforeRowReceive` for a drop into another grid — and a third veto on the same gesture would be a third place to look when a drop does not happen.
  - **`rowDrag:moved` is coalesced to one event per animation frame**, carrying that frame's latest pointer position, so a handler runs at the display's rate rather than the pointer's several hundred events a second. The other three fire on the transition itself, and no `rowDrag:moved` is ever delivered after `rowDrag:ended`.
  - **The end is always reported**, whether or not a drop followed — including a release outside every grid, where `over` is null. `dropped` says whether the release is being acted on; what became of it is still reported by `row:moved`, `row:sent`, `row:received` and `rowReceive:cancelled`.
  - **Read, measure and draw in these handlers; do not mutate.** The drag resolves where it would land against the display order, so changing rows, sort, filters or grouping mid-gesture moves the ground under the drop, and `data` is the source row's own object rather than a copy.

- **A row dragged from one grid onto a row in another could only be moved or copied; a host that meant "assign this to that" had no way to learn which row it landed on and no way to stop the insert** (BACKLOG-0001225, DemandFlow field report: 168 grids migrated from AG Grid). New cancellable `beforeRowReceive`, fired on the **receiving** grid before the insert, carrying the row's `data`, the candidate index `at`, `overKey` — the key of the row under the pointer — and `source`, the grid it came from. `preventDefault(reason)` stops the insert and the paired `rowReceive:cancelled` carries the reason. It is the same before-event contract every other gate uses: the handler may be `async`, the insert is held until it settles, and a drop whose row under the pointer or source row is gone by then is cancelled as `'stale'`.
  - **A veto loses no data.** The source removes its row only after the target has admitted it, so a vetoed drop leaves the source untouched: the row stays, and neither `row:sent` nor `row:copied` fires. It is announced as "The drop was declined; the row stays where it was", distinct from the existing "That grid does not accept this row" for a group or direction refusal.
  - **`overKey` is null where there is no row to name** — past the last row, on empty space, on the header or on a pinned row — and the row then goes at the end. `row:received` now carries `overKey` too.
  - **Changed as a consequence.** `at` on `row:received` is now the display index in the *receiving* grid, which is what its documentation always said. Before this it was the dragged row's index in the source, because the drop position was never resolved against the target.

- **A board's column set is now editable after construction: `board.setColumns(defs)` replaces it, keeping card placement and interaction state for every surviving column** (BACKLOG-0001228, a host converting 168 grids off AG Grid). *Recognise your own case: a tenant renames a status column, or adds one, in settings, and the only supported answer used to be tearing the board down and rebuilding it — the working alternative, mutating `board.config.columns` and calling `refresh()`, was never a contract anyone was invited to write to.* `setColumns` is a **whole-set replacement** (a settings save renames, adds and removes columns in one action, not one field at a time) rather than an amend-one call, and is id-keyed like the grid's own `columns.apply(state)`: a column that keeps its id keeps its cards, its collapsed state, its place in a pinned `reorderColumns` order, and — board-wide — the quick filter and the selection are untouched by the call.
  - **What happens to a column dropped from the new defs:** its cards are not lost. The model already refuses to drop a card silently — a group value with nowhere configured to go re-derives a plain, humanised ad hoc column, the same rule an always-unconfigured value already got. A dropped column with no matching data (e.g. one that was configured but always empty) simply disappears, with nothing to preserve.
  - `doneColumns` is recomputed from the new defs' `done: true` flags on each call, so a rollup's progress stays correct after a column edit.
  - Typed as `setColumns(defs: KanbanColumnDef[]): Kanban` in `packages/core/src/types.d.ts`.

- **A board now supports several independent, named predicate filters, composed with AND, instead of one slot the last caller silently overwrote** (BACKLOG-0001229, reported against 1.55.0). *Recognise your own case: a board's filter bar and a row of sprint toggles both call the old `setFilter`, and whichever ran last discarded the other's predicate — every host with two filter sources had to hand-write a composition layer.* `board.filters.where(name, fn)` registers or replaces a predicate under `name`; `board.filters.where(name, null)` removes only that one, leaving the rest in force; `board.filters.where()` lists the registered names; `board.filters.reapply(name?)` re-runs and re-renders. Card counts, rollups (unaffected already, unchanged) and SLA ageing all read the composed result, exactly as they read the single predicate before. Follows the grid's own `filters.where` convention (BACKLOG-0001202).
  - **Backward compatibility:** `board.setFilter(fn)` is unchanged sugar for `board.filters.where(board.filters.DEFAULT, fn)` (the reserved sentinel name `'\u0000default'`) rather than a break — a bare `setFilter` call keeps working and now composes with any other named predicate a host adds, instead of occupying a second, un-nameable slot.
  - **A disclosed behaviour change:** calling `board.setFilter(null)` on a board where no default-named filter was ever registered is now a true no-op — no `filter:changed`, no regroup — where it previously fired and regrouped unconditionally even though there was nothing to clear. This applies only to that one case: `setFilter(null)` after a filter *was* registered under the default name still fires and clears it exactly as before. The new behaviour matches the grid's own `where(name, null)`-on-an-unregistered-name convention (BACKLOG-0001235: a listener should not see an event for an action that touched nothing). A host that listens for `filter:changed` purely to know "did anything about my filter call just happen" — rather than "did the shown rows just change" — sees one fewer event the first time it calls `setFilter(null)` on a never-filtered board. Pinned by a test (`test/kanban.test.js`).
  - Typed as `filters: KanbanFilters` (with `where`/`reapply`/`DEFAULT`) on `Kanban` in `packages/core/src/types.d.ts`. The capability registry count is unchanged (725) — `tools/capabilities.js#collectMethods` scans only `class Grid`, so no module instance method is registered, a pre-existing gap tracked as BACKLOG-0001247, not moved by this change.

### Fixed

- **`RailAction.icon` (and its siblings `Option.icon`, `IconBand.icon`, `DecorationSpec.name`) were typed as a bare `string` with no statement of what a valid glyph name is, so the ~55 built-in names were discoverable only by probing the rail at runtime** (BACKLOG-0001219, owner field report LG-17). A new exported `IconName` type lists every built-in glyph name, generated from the icon registry's `iconNames()` and pinned against it by `test/icon-name-type-drift.test.js` so the two cannot drift; it is widened with the repo's existing `(string & {})` idiom, so a name registered at runtime with `registerIcon`/`registerIcons`/`config.icons`/`grid.icons` still typechecks. All four fields now use `IconName`, each with the doc comment it never had.

- **An action rail button with no `icon` at all produced `Unknown icon 'archive'` when its `name` happened not to match a built-in glyph** — naming a value the host never wrote and telling them to register something they never asked for. `registerAction` no longer routes a `name`-as-icon fallback through the warning: an absent `icon` that resolves to a real glyph (e.g. an action named `undo`) still gets it for free, but an absent `icon` that resolves to nothing draws the blank glyph silently. An explicitly-given, unrecognised `icon` still warns and still names exactly what was written. The button's `data-icon` attribute — the theme hook the icon system exposes elsewhere too — changes as a side effect: for this one case (no `icon`, and `name` not a registered glyph) it used to read the action's own name (`data-icon="archive"`) and now reads `data-icon="blank"`, matching the glyph actually drawn; every other case is unchanged.

- **A one-field patch through a standalone board's `rows.apply({ update })` silently discarded every other field, dropped the card's column, and made it vanish from the board — with only an unrelated warning about the column value pointing the host at the wrong place** (BACKLOG-0001227, DemandFlow field report). *Recognise your own case: `board.rows.apply({ update: [{ id: 's1', commentCount: 3 }] })` left the stored row as `{ id: 's1', commentCount: 3 }`, `card('s1').columnId` came back `null`, and the card was gone.* `rows.apply({ update })` on a standalone board now **merges** each patch into the row already stored under its key, the same `mergeRow` the grid's own `rows.apply({ update })` uses — a field the patch omits is preserved, and a patch that does change the grouping (column) property still moves the card, because the merged row is what gets grouped.
  - **Scope.** Only a standalone board (its own row store) is affected. A `grid`-bound board already refuses `rows.apply` and routes to the bound grid instead, so a grid-bound host saw no divergence.
  - **`add` is unchanged.** `rows.apply({ add })` still sets the row outright, mirroring the grid's own `add`, which rejects a repeated key as a duplicate rather than merging into it — an `add` names a whole row, not a delta. `remove` is unchanged.

- **A standalone board's async `onAddCard` never worked: the returned Promise itself was stored as the row, producing an empty card under a generated key instead of the card the host asked for** (BACKLOG-0001230, a host converting off DHTMLX Kanban). *Recognise your own case: `onAddCard: (colId) => Promise.resolve({ id: 'new1', label: 'From async', column: colId })` followed by `board.addCard('1')` landed a row keyed `card1` whose fields were empty — the Promise had passed the same object check a plain row does, so it got written straight into the row store before it ever settled.* `onAddCard` may now return a row, a **Promise of a row**, or nothing. `addCard` waits for the Promise, then creates the card from the resolved row (using the row's own key when it has one); a **rejected Promise creates no card and leaves the board exactly as it was** — no card, no orphan row. A Promise is never written to the row store, at any point in the flow, guarded by a dedicated regression test.
  - **What `addCard` returns.** When `onAddCard` returns a Promise (or a `beforeAdd` handler defers), `addCard` itself now returns a **Promise of the new key** (`null` on a rejection or veto) — the same "sync fast path, Promise only when something defers" shape `beforeAdd` already established. A synchronous `onAddCard` (or none at all) still returns the key directly; no caller is forced onto an async path to serve the ones that need it.
  - Typed as `KanbanRow | Promise<KanbanRow> | void` on `onAddCard` and `unknown | Promise<unknown>` on `addCard`, in `packages/core/src/types.d.ts`.

- **Checking a second row's box in `selection: { mode: 'single', checkbox: true }` left the first row selected instead of selecting the row just clicked** (BACKLOG-0001233). The checkbox renderer's `change` handler built its new selection as the current keys plus the newly toggled one and handed the whole list to `SelectionModel.set()`, which in single mode keeps only the list's first entry — the row already selected, not the one the user just checked. The checkbox now sends only the toggled key in single mode: checking a row selects it alone and replaces whichever row was selected before; unchecking the selected row clears the selection. Multiple mode is unchanged, and `grid.selection.set(keys)`'s own single-mode contract — keep the first key of the array — is unchanged and now documented in `docs/api-detail.html#selection-guide`.

- **A named `where` predicate registered, replaced or removed through `filters.where()` changed the visible rows and `state.get().where` while raising no `state:changed` at all** (BACKLOG-0001235). *Recognise your own case: `grid.filters.where('visibleToMe', r => r.s > 1)` moved the visible rows from 2 to 1 and `filter:changed` fired once, but a view-persistence layer built on `state:changed` — exactly as `docs/api-detail.html` and 1.56.0's own CHANGELOG entry recommend — never saw it, so a saved view silently lost a host permission filter on reload.* `filters.where()` and `filters.reapply()` now go through the same tracked door `sort.set` and `filters.set` use: registering, replacing or removing a predicate fires `state:changed` once, `cause: 'user'`, `sections: ['where']`; a `reapply()` that actually re-runs a registered predicate fires the same way, whether or not the resulting row set moved (the same "no diffing" choice already made for a re-applied sort). Removing a name that was never registered, or reapplying one that is not, fires nothing — there was no state to change. `filter:changed` is unaffected and keeps firing exactly as it did.
  - **No double firing.** A `where` registered while another tracked change is already open (for example, from inside a `filter:changed` listener fired by the quick filter) folds into that change through the existing depth guard rather than announcing twice.
  - **Docs.** The known-gap note this fix closes is removed from `StateChangedEvent`'s JSDoc in `packages/core/src/types.d.ts` (regenerated into `docs/API.html` via `tools/apiref.js`) and from the `state:changed` row in `docs/api-detail.html`. The 1.56.0 CHANGELOG entry that disclosed the gap is left as shipped history.
  - **Tests.** `test/state-where-1235.test.js` (new, 10 cases): register/replace/remove fire once with `cause: 'user'` and `sections: ['where']`; a no-op removal or `reapply()` of an unregistered name fires nothing; a register → `state.get()` → `state.apply()` round trip onto a second grid reproduces the same visible rows off the one event; `reapply()` fires whether or not the row set moves; no double firing when a `where` registration nests inside another open tracked change. Reverting the fix fails 8 of the 10 by name. `test/filters-where.test.js` (32), `test/filters-where-browser.test.js` (1) and `test/state-cause-1182.test.js` (17) stay green.

- **`grid.filters.clear()` cleared a quick filter without ever saying so in `state:changed`** (BACKLOG-0001237). *Recognise your own case: `grid.filters.quick('aaa')` then `grid.filters.clear()` moved the quick filter from `'aaa'` back to empty and the visible rows from 1 to 2, but the single `state:changed` this fired carried `sections: ['filters']` only — a persistence layer keyed on `sections` never saw the quick filter move.* `filters.clear()` now folds the quick-filter reset into the same `state:changed` that `set(null)` already raises for the condition tree, through the existing depth guard, so it is still exactly one event: `sections` carries `'quick'` alongside `'filters'`, sorted, whenever a quick filter was actually set, and omits `'quick'` when there was none to clear. Nothing about what `clear()` clears changed — the condition tree, the quick filter and every non-pinned `where` predicate are still all cleared, and the quick filter still reads empty and the row count still returns to unfiltered afterwards.
  - **Tests.** `test/state-cause-1182.test.js` (two new cases): `clear()` with a quick filter set fires once with `sections: ['filters', 'quick']` and the row count returns to unfiltered; `clear()` with no quick filter set fires once with `sections: ['filters']` only. Reverting the fix fails both by name. `test/model.test.js` (156) stays green.

- **A filter applied from a column header's own filter popup could not be removed from that popup** (BACKLOG-0001240, owner-reported on a live grid). *Recognise your own case: click a column's filter icon, pick `Equals`, type a value — the grid narrows and stays narrowed, and nothing in that popup takes it back. The only ways out were the tool panel's own clear, a saved view, or a reload.* Reproducing the exact gesture found this was a **missing affordance**, not a broken one: the popup (`filtermenu.js`) rendered no clear, reset or remove control of any kind, while the tool panel's per-column clear (`toolpanelmount.js`) already worked and was never broken. The popup now carries its own "Clear" button — reusing the existing `filter.clear` catalogue entry rather than a new string — that drops the column's condition from the shared `FilterSet` and resets the filter widget to blank, the same two steps the tool panel's `clearFilter` already took. It is a real `<button>` in the popup's own tab order (reachable and activatable by keyboard) and is added once, in the popup chrome, so every filter type gets it rather than each one growing its own copy.
  - **Not a regression in disguise.** Escape still only closes the popup and leaves the condition in place, exactly as before; emptying a text/number condition's own value input still clears it as a side effect of its `active()` check going false, which is unrelated to this fix and was already true beforehand.
  - **Tests.** `test/clear-filter-header-browser.test.js` (new, real browser, 3 cases): the whole gesture — apply `equals` from the header, reach the new Clear button with a real Tab and activate it with a real Enter, and confirm the rows return and `filters.get()` is clean for that column; clearing from the header is reflected in the tool panel without reopening it; the tool panel's own clear is unaffected. Reverting the fix fails the first case by name (the popup renders no `.lat-filter-clear` at all).

- **A drop accepted by an async `beforeRowReceive` handler could land the row in the wrong place: `at` named a slot as "before the row keyed `overKey`", and if that row moved before the handler settled, the insert still used the original index instead of the row's new position** (BACKLOG-0001242, DemandFlow adversarial QA of BACKLOG-0001225). `revalidate` now re-checks that the row named by `overKey` is still at `at`, not merely that it still exists; if it has moved — or is gone — the drop is cancelled as `'stale'`, consistent with `beforeRowMove`'s own revalidation. No data is lost either way: the source still holds the row.
  - The screen-reader announcement for a stale drop is now its own text, distinct from a host veto (`beforeRowReceive`'s `preventDefault`) and from a grid refusing the transfer outright (wrong group, wrong direction, duplicate key).
  - `BeforeRowReceiveEvent.at`'s documentation now states this guarantee, including the async case.

- **A green gate printed `4 declared event(s) reached by no emit — verify before acting: rowDrag:ended, rowDrag:left, rowDrag:moved, rowDrag:started`, a false lead: all four are emitted from literal call sites in `packages/dom/src/rowreorder.js`** (BACKLOG-0001245). `tools/check.js`'s surface scan anchored the first segment of an event name to `[a-z]+`, so a camelCase-prefixed name like `rowDrag` never matched a literal `emit('rowDrag:started', …)` call or the indirect `EVENT_SHAPE` matcher, and a genuinely emitted, correctly declared event was reported as dead. Both patterns now admit an uppercase letter in the first segment (`EVENT_SHAPE` keeps its `{3,}` minimum length, so a time format like `hh:mm:ss` is still excluded); a declared event with no matching emit anywhere is still reported unchanged.

- **`grid.filters.clear()` removed a non-pinned `where` predicate without ever saying so in `state:changed`** (BACKLOG-0001248). *Recognise your own case: `grid.filters.where('mine', row => row.owner === me)` then `grid.filters.clear()` dropped the predicate and widened the visible rows, but the single `state:changed` this fired carried `sections: ['filters']` only — a persistence layer keyed on `sections` never saw the predicate go.* `filters.clear()` now captures the boolean `WhereModel.clear()` already returns and folds `'where'` into the same `state:changed` that `set(null)` and the quick-filter reset already raise, through the existing depth guard, so it is still exactly one event: `sections` carries `'where'` alongside `'filters'` (and `'quick'`, when in force), sorted, only when a non-pinned predicate was actually removed. A predicate registered `{ pinned: true }` still survives `clear()` untouched, and `'where'` is correctly absent when nothing was registered or every predicate was pinned.
  - **Tests.** `test/state-cause-1182.test.js` (three new cases): `clear()` removing a non-pinned predicate fires once with `sections: ['filters', 'where']`; `clear()` with only a pinned predicate fires once with `sections: ['filters']` and the predicate stays registered; `clear()` with a quick filter, a condition and a non-pinned predicate together fires once with `sections: ['filters', 'quick', 'where']`. Reverting the fix fails the two announcing cases by name; the pinned case passes either way, because that behaviour was already correct. `test/model.test.js` (156) stays green.

## [1.56.0] - 2026-09-12

### Added

- **A row with its own click action — opening a record is the reported case — also selected the row, so a bulk action run afterwards operated on rows nobody chose** (BACKLOG-0001184, DemandFlow field report: 168 grids migrated from AG Grid). `selection: { checkboxOnly: true }` restricts row selection to the `checkbox` column: a click anywhere else in the row now neither selects nor deselects, and Space does nothing unless focus is on the checkbox cell. The checkbox itself, cell ranges and the fill handle are all unchanged. Off by default, so a plain click still selects a row exactly as it always has.
  - **Decision.** `checkboxOnly` only narrows *which gesture* may change selection; it does not grant one back where `mode: 'none'` has already refused every selection path, and it composes normally with `mode: 'single'` — the checkbox stays the only way to change which one row is selected.
  - **Findings, out of scope, reported.** With `mode: 'single'`, checking a second row's checkbox while an earlier one is still checked keeps the earlier row selected instead of switching to it — a pre-existing defect in the checkbox renderer's own `selection.set()` call, unrelated to `checkboxOnly` and reproducing identically with it off.

- **An application-level row filter had to be kept switched on by hand, and only one could exist** (BACKLOG-0001202). *Recognise your case: you have `config.hostFilter`, and either you have caught it filtering while your UI said it was not (or the reverse), or you have had to hand-compose two unrelated concerns — "rows this user may see" and "rows I have a rate for" — into one function because there is only one slot for it.* New: `grid.filters.where(name, predicate, opts?)` registers a **named** row predicate, composed with the declarative filter set. There is no companion "a filter is present" flag, because that flag is the defect: it is a second piece of state describing the first, and the two can disagree. Registering is activating; `where(name, null)` removes; `where()` lists the registered names.
  - **Composable.** Several are in force at once under their own names, ANDed with each other and with the condition tree. Removing one leaves the rest untouched, and re-registering a name replaces only that predicate. The predicate is handed the **data row** (`row => row.owner === me`), matching `DerivedSourceConfig.where` rather than `hostFilter.passes(row)`, which is given the `Row` wrapper and is unchanged.
  - **Two routes for re-evaluation, replacing the manual "filter again" call.** `{ deps: ['ccy'] }` states what the predicate reads, exactly as `value.deps` does for a computed column: the verdict is then cached per row and re-run when a **named** column changes on that row, and not when an unrelated one does. A predicate that declares no `deps` is treated as reading the whole row and is called on every pass — never stale, never skipped. `grid.filters.reapply(name?)` covers what the grid cannot observe at all, such as a rate table arriving after the predicate was registered.
  - **State carries names, never functions.** `filters.get()` is unchanged and still publishes only what the user set. `state.get()` gains `where: string[]` — the names in force — because a predicate is host code that cannot be serialised into a saved view or restored from one. `state.apply()` naming a predicate the host has not registered **reports the skip** (`where.<name>`) rather than installing anything, per the standing rule that rejected input never becomes state; and it never *removes* a predicate a saved view did not name, because silently dropping a permission filter on a state restore would widen what the user can see. `filters.clear()` removes registered predicates except those registered `{ pinned: true }`, for exactly that reason.
  - **Pushdown-honest.** An optional `{ condition: FilterSet }` twin is ANDed into the tree handed to the source, so every source — memory, stream, paged, remote and pushdown — narrows on it, while the function stays as the residual in the grid's existing pushed-and-residual model. On the pushdown source the predicate runs over the rows the engine returned and the grid **warns once** that match counts and totals are page-relative, naming the twin as the fix. A malformed twin drops the twin and keeps the predicate: losing an optimisation cannot widen a result, whereas refusing the registration could.
  - **It flows where the filter set flows.** `filter:changed` fires with `cause: 'where'` and the names, so a derived grid on `follow: 'filtered'`, a bound KPI panel and a cross-filter panel all follow a predicate without knowing that a function rather than a condition is what moved. A registered predicate also counts as a filter for `rows.move`, which cannot mean anything definite while the displayed rows are a subset.
  - **Migration from AG Grid's external filter.** `isExternalFilterPresent()` plus `doesExternalFilterPass(node)` plus `onFilterChanged()` becomes `where` plus `reapply`: the present-flag disappears (registration is presence), the pass-callback becomes the named predicate, and the manual refresh becomes either `deps` or `reapply`.
  - **Not done, deliberately.** The paged and remote sources do **not** apply the predicate to their fetched window — only the `{ condition }` twin reaches them. Their rows live in a block cache indexed by the server's own ranges and totals, so filtering a block client-side would change its length and leave `count()` and the skeleton placeholders disagreeing with what is painted. That needs a windowed re-index and belongs in its own card.

### Changed

- **A column of ISO timestamps was inferred as `date` and painted without the time** (BACKLOG-0001176). *Recognise your own case: `rows: [{ id: 1, t: '2026-09-12T14:30:00Z' }]` with no declared `type` inferred as `date`, and `rows.text('1', 't')` read `Sep 12, 2026` — the 14:30 was not hidden by formatting, it was gone from the stored value, with nothing warning that a narrowing had happened.* Inference now classifies an ISO string carrying a time part (`T` plus a time, with or without a zone offset) as `datetime`, which keeps the clock; a date-only string (`YYYY-MM-DD`) still infers as `date`, and a column mixing both forms infers `datetime` rather than falling back to `text`. **This is a behaviour change** for any host relying on a timestamp string inferring as `date`: declare `type: 'date'` explicitly on that column to keep the old truncation — no warning is logged for it, because the value is preserved deliberately, not narrowed silently.
  - **Unchanged.** A `Date` object's inference (BACKLOG-0001087), an explicitly declared `type`, and every non-string sample kind are exactly as before.

- **A filter with an unknown operator used to pass every row while looking applied** (BACKLOG-0001180). *Recognise your own case: `filters.set({ col: 'a', op: 'equals', value: 'x' })` — the real operator is `eq` — warned and installed the condition anyway; `filters.get()` showed it as active while `matchCount` never moved.* `filters.set()` and `state.apply()` now refuse a condition whose operator is outside the closed §9.3 enum instead of installing it: it never reaches `filters.get()`, the grid stays exactly as filtered as it was, and the warning names the operator received and the operators valid for that column's type. In a compound filter only the offending leaf is dropped; `state.apply()` reports the refusal as a skip like any other section.
  - **Unchanged.** An operator that is real but wrong for the column's type (`lt` on a boolean column) still applies as before; operator aliasing (`equals` meaning `eq`) is a separate decision.

- **`state:changed` fired only for `state.apply()` and `state.reset()`, so auto-save built on it never saved a user's sort, filter or column change — and a host that subscribed to the ten individual events instead found `reset()` raised those too, writing the reset arrangement straight back over the view it had just abandoned** (BACKLOG-0001182). *Recognise your own case: you built view persistence on `grid.on('state:changed', save)` and nothing was ever written until you called `apply()` yourself; or you moved to `sort:changed`, `filter:changed`, `column:moved`, `column:resized` and `column:visible`, and then "restore the default view" saved the default over the view the user had just left.* `state:changed` now fires for a state change made by a gesture or by the equivalent API call — a sort, a filter, a column move, resize, pin or hide, a grouping, a pivot, a page change, a formatting rule, a view apply, an `apply` and a `reset` — with one known gap named below, and its payload carries `cause` — `'user'`, `'apply'` or `'reset'` — plus `sections`, the `GridState` keys that moved. A persistence layer subscribes to this one event and skips `cause: 'reset'`. Exactly one event per logical change: a change that internally routes through `state.apply()` — applying a saved view, an undo, a reset — announces itself once, carrying the outermost cause rather than the inner mechanism's, so the view apply that used to be silent and the reset that used to fire twice over are each a single `cause`-tagged event.
  - **Disclosed behaviour change.** A host already listening to `state:changed` will see **more firings than before**: previously only `apply()` and `reset()` raised it, and now a sort, a filter, a column move, resize, pin or hide, a grouping, a pivot, a page change, a formatting rule and a view apply do as well. A listener that unconditionally writes to storage will write on each of those; gate it on `cause` (and debounce) if that is not what you want. Two smaller shifts ride with it: the event now fires **after** the grid has refreshed rather than before, so a listener reading the grid back sees the change rather than what it replaced; and `origin` is `'user'` for a gesture-caused firing, where every firing was previously `'api'`.
  - **Unchanged.** The `state` and `report` fields still carry what they always did on `apply()` and `reset()`. `state:reset` still fires, and still after `state:changed`. Undo and redo still restore through `state.apply()` and so report `cause: 'apply'`; there is no fourth cause for the `config.state` seed at construction, which fires `cause: 'apply'` into a bus no host can yet have subscribed to. For a `'user'` firing `state` and `report` are null — a full state capture on every gesture would put an unsanitised copy of the state on the bus, so a host calls `grid.state.get()`, which is permission-sanitised, when it decides to write.
  - **Deliberately silent.** No gesture in selection, scroll position, group expansion, facet expansion or annotation marks raises `state:changed`, though each of those is a `GridState` section: they have their own events, and a scroll would announce on every frame. A host persisting those keeps listening to `selection:changed`, `scroll` and the rest. An `apply` or a `reset` still *lists* whatever its report restored, so `sections` there can include `expanded`, `facets`, `scroll` and `selection`; `annotations` appears only when the state being applied actually carries marks, so a reset to a mark-free baseline does not name it.
  - **Two known gaps, not design choices.** A host predicate registered through `filters.where(name, fn)` — added by BACKLOG-0001202, which merged the same day — changes `grid.state.get().where` and the visible row count while raising **no** `state:changed` at all (measured on the merged tree: `state:changed` 0, `filter:changed` 1, rows 2 → 1, against a control sort firing 1 in the same run). So view persistence built on this event does not yet see a `where` predicate. Tracked as BACKLOG-0001235. Separately, `filters.clear()` fires once but omits `quick` from `sections` even though it clears the quick filter — BACKLOG-0001237. Both are other cards' work, named here so a host building persistence today knows the edges rather than discovering them.

- **"Reset to default" returned to a saved view seeded through `config.state`, instead of clearing it** (BACKLOG-0001183). *Recognise your own case: you build a grid with `config.state` set to a saved view — a sort, a hidden column, a filter — and calling `grid.state.reset()` (or the "restore the default view" control) leaves that view in place, because it *is* the default now.* `state.baseline()` was captured after `config.state` was applied, so the seeded view became the baseline instead of the grid the config itself declares. `#baseline` is now captured before `config.state` is applied: `state.baseline()` holds none of a `config.state` seed, and `state.reset()` clears it and returns to the columns, sort, filters and grouping the config's own (non-`state`) keys declare. **This is a disclosed reversal of previously documented behaviour** — both the old test asserting it and the `state.baseline()` JSDoc described the seeded view becoming the baseline on purpose. A host that wants the old behaviour back — reset returning to the seeded view — should apply that view itself, after construction (`grid.state.apply(view)`), or re-apply it in a `state:reset` handler, rather than passing it through `config.state`.
  - **Unchanged.** A grid built with no `config.state` — including one opened on a `views`-declared `isDefault` view, which is a separate mechanism — has an identical baseline and reset to before. `state.apply()` called after construction, and a `state.get()` → `state.apply()` round trip, are unaffected.
  - **Tests.** `test/integration.test.js`, `describe('the default view baseline (§18.6, BACKLOG-0001183)')`: the case that pinned the old behaviour by name (`'the baseline is captured after configured state, not before'`) is renamed and its assertion flipped; new cases cover a `config.state` seed of sort + hidden column + filter excluded from `baseline()` and cleared by `reset()`, the no-`config.state` grid unchanged, `state.apply()` after construction, and a `get()`/`apply()` round trip.
  - **Docs.** The `state.baseline()` JSDoc in `packages/core/src/types.d.ts` (and the generated `docs/API.html` reference row it drives) still describes the old "captured after `config.state`" behaviour and needs the same correction; left alone here and reported to BACKLOG-0001214, which is collecting `types.d.ts` text corrections.

- **The published npm keywords omitted `angular`, understating what the package supports** (BACKLOG-0001226). An Angular adapter ships (`packages/modules/angular/index.js`, built to `dist/modules/angular.*` and `public_npm/modules/angular.*`, registered as `LatticeGridAngular`) but the manifest's `keywords` array never listed it. Added `angular` to the keyword list synthesised by `tools/build.js`; the published array is now `data-grid`, `datagrid`, `table`, `spreadsheet`, `virtual-scroll`, `vanilla-js`, `angular`, `react`, `vue`, `svelte`, `excel-export`, `pivot`.

### Fixed

- **Two charts sharing a timestamp column warned once between them when both went stale, so the second chart's empty state gave no reason** (BACKLOG-0001100). The rolling-window staleness warning added in 1.52.0 (BACKLOG-0001088) was keyed by column alone (`chart:x:window:stale:<col>`), and `warnOnce` is process-global, so the first chart to draw claimed the key and the second — a different chart, in a different corner of the same dashboard, reading the same stale column — printed nothing. The key is now scoped per chart instance, matching the clock-skew warning beside it (BACKLOG-0001123), so every chart that goes stale warns once, independently of any other chart on the same column.

- **Documentation.** `docs/API.html` and `docs/api-detail.html` did not say that a chart reduction (`sum`, `avg`/`mean`, `min`, `max`, `first`, `last`) over an empty set is `null` — drawn as a gap, not a zero — while `count` and `countValues` are still honestly `0`, `countValues` being how you ask for "none arrived" to be drawn as a zero; nor that a rolling window whose data is entirely older than its span shows the empty state and warns, rather than drawing the series off-plot. Both shipped in 1.52.0 (BACKLOG-0001088) and existed only in the CHANGELOG. Documented in both files, alongside a runnable example of the null-vs-gap behaviour.

- **A derived grid's Refresh button leaked listeners onto the grid it derives from and multiplied its live derivations** (BACKLOG-0001155). *Recognise your own case: you call `rows.load()` — or `set('rows' | 'source' | 'rowKey' | 'tree', …)` — on a derived grid, or on a polled stream/URL grid. The rows every grid shows are unchanged.*
  - **The symptom, on a derived grid.** Each `rows.load()` added three listeners to the **parent** grid and never removed any. Five presses of a Refresh button on a `refresh: 'manual'` panel left the parent holding 18 listeners instead of 3, and destroying the panel removed only the last 3 — 15 stayed on the parent for as long as it lived. Outside `manual`, every one of those orphans also **re-derived on every parent change**, so a `live` or `idle` panel that had been refreshed a few times paid its derivation cost several times over, and kept paying it after the panel was destroyed. `rows.load()` is the documented trigger for a `manual` panel (BACKLOG-0001102), so the leak grew with every press of exactly the button the docs recommend.
  - **The symptom, on a polled stream or URL grid.** Each `rows.load()` started another poller and left the old one running. A `createUrlSource(url, { poll: 40 })` grid refreshed five times fetched **six times per interval**, and five pollers survived `destroy()`.
  - **The cause.** Setting a data key rebuilds the grid's source from its configuration, and the source being replaced was never destroyed. Nothing reached it through the grid any more, but whatever it had registered elsewhere — a derived source's listeners on its parent, a stream's poll and age timers and its open read — still did. The replaced source is now released once its successor is built, on the one line every source type goes through. Measured after the fix: the parent holds 3 listeners after 1 load and after 10, and 0 after `destroy()`; one derivation per parent change; the polled stream grid keeps one poller after ten loads, and none after `destroy()`.
  - **Released after the successor is built, never before.** Building a derived source runs its first derivation, and one that throws makes the rebuild throw; released first, the grid would be left holding a destroyed source and silently stop following its parent. Released after, the previous source stays in place and the grid goes on as it was.
  - **Other source types, checked rather than assumed.** A **memory** grid did not accumulate, and neither did a **remote** (pushdown over `restAdapter`) or **paged** grid. They are released by the same line now too, which also aborts a replaced remote or paged source's in-flight requests instead of letting them land in a source nobody reads.
  - **A cross-filter selection is not carried across the refresh.** A panel that had pushed a selection onto its parent and is then refreshed with `rows.load()` starts with no selection of its own while the parent keeps the filter it pushed — the behaviour before this change, unchanged here. What the panel should show after a refresh is decided under BACKLOG-0001158.
  - **Tests.** `test/source-rebuild-release-1155.test.js`, 4 named tests, reading listener counts through the public `diagnostics.events()` rather than by wrapping `on`/`off`. Removing the release fails the listener test, the one-derivation-per-change test and the polled-stream test by name; releasing before the successor is built fails the ordering test by name. The executed example at `docs/api-detail.html#derived-manual-refresh` also checks that presses leave the parent steady and that `destroy()` leaves nothing behind.

- **Clicking a nested treemap tile did nothing, and clicking a sunburst segment on the second ring did nothing** (BACKLOG-0001168). *Recognise your own case: a `treemap` or `sunburst` with `drill: true` over a grid grouped two or more deep; a click on a top-level tile or the inner ring drilled in, but a click on anything below that left the chart where it was — while a `drill` listener still fired, with a one-label path that named no node.* The click built the drill path from the clicked mark's label alone, and the descent walks from the root a label at a time, so a label two levels down matched nothing. A click now drills to the node it landed on at any depth, and the `drill` event's `path` is the full path of labels from the root; the `click` payload carries the same `path`. A leaf still lands the chart on the nearest node above it that has children, as before.
  - **Unchanged.** A first-level drill; `ascend()`; `filterOnClick` on every other chart type; the `depth` field on the click payload.
  - **Out of scope, reported.** `ascend()` after a leaf click rises through the leaf's own label first, so the first step back changes nothing on screen; a drilled sunburst keeps the whole tree's ring count, so a single remaining ring draws at a third of the radius.

- **After `columns.fit()` on a container of fractional width, the grid flickered a scrollbar** (BACKLOG-0001169). *Recognise your own case: you call `grid.columns.fit()` on a grid whose container is not a whole number of CSS pixels wide (a percentage width, a flex share, a 768.5px column), and a horizontal scrollbar comes and goes every frame — the twitch 1.54.0 removed from the idle grid, back the moment you call `fit()`.* `fit()` measured the width it distributed with its own reading, the browser's integer `clientWidth`, which rounds to nearest, while the renderer had moved to the fractional box rounded down. On a 768.5px host the columns summed to 765 against a 764.5px box, the half pixel of overshoot drew a horizontal scrollbar, the box shrank, the scrollbar went, and it repeated on alternate frames. `fit()` now targets the same floored extent the renderer lays out against, so the fitted columns can fall short of the box by under a pixel and can never overflow it. No API changes, nothing to migrate.
  - **Unchanged.** At a whole-pixel width the floored extent *is* `clientWidth`, and the fitted columns still sum exactly to it, with and without a vertical scrollbar. The one-shot contract, the `resizable: false` and generated-column handling, and the overflow warning are untouched.
  - **Tests.** `test/viewport-stable-browser.test.js` now also calls `fit()` in a 768.5px and a 768px host, with and without a real vertical scrollbar, samples the box on sixty consecutive frames, and asserts one box and that the columns sum to the floored extent; `test/fit-scrollbar-browser.test.js` (46 cases) stays green.

- **TypeScript callers of the htmx helpers compiled against signatures the runtime does not have** (BACKLOG-0001171). *Recognise your own case: `attach(element, config)` returned no grid, `ingestResponse(grid, response)` threw on `response.contentType`, and `driveServerMode(grid, opts)` / `driveInfiniteScroll(grid, opts)` failed reading `ownerDocument` of the options object.* Six declarations in the `lattice-grid/modules/*` blocks now state what the runtime does; the runtime itself is untouched.
  - **htmx.** `attach(doc?: Document): () => void` — wires the htmx lifecycle on a document and returns the detach function. `ingestResponse(response, columns): { rows, total }`. `driveServerMode(grid, trigger, opts?)` and `driveInfiniteScroll(grid, sentinelEl, opts?)` — the element htmx's request is configured on is the second argument.
  - **devtools.** `CONSOLE_ACTIVATION` is `boolean`, not `string`.
  - **webcomponent.** `createLatticeGridElement(factory?)` takes a `createGrid`-shaped factory and returns the element class, or `null` without `HTMLElement`.
  - **Unchanged.** `KPITreeConfig.orphans`, listed alongside these, is honoured by the runtime — a tile whose parent is absent is gathered under the named bucket — and stays declared; a test now pins each of the seven to its runtime behaviour.

- **Rows without a value for the configured `rowKey` all collapsed onto one key without a word, so selection, edits and `rows.apply` updates landed on whichever row now shared it** (BACKLOG-0001174, DemandFlow field report LG-01). `createHeadlessGrid({ columns:[{field:'a'}], rows:[{a:'x'},{a:'y'},{a:'z'}], rowKey:'nope' })` produced three rows and one key: `part()` turns `undefined`/`null`/`''` into a real (if odd) string rather than throwing, so a `rowKey` field missing from every row — or present on some rows only — never surfaced anything. The grid now warns once when the configured `rowKey` (a field, an array of fields, or a function) resolves empty for one or more rows at load, `rows.load()` or `rows.apply({ add })`, naming the field(s), how many rows lacked a key out of how many, and the fields the first such row does have. Deduplicated by the configured field(s), so a feed that repeatedly loads still-incomplete data warns once per session rather than once per load. Key semantics are unchanged; a duplicate-key warning is a separate concern, not addressed here.

- **A misspelt or AG Grid-carried column option was ignored without a word** (BACKLOG-0001175). The grid already named an unrecognised *grid-level* config key (`nonsenseOption: true` warns); a column definition took any key at all and used the ones it knew, so `columns: [{ field: 'a', nonsenseKey: 1 }]` said nothing. A migration is mostly column configuration, so that is where a typo most often lands. An unrecognised top-level key on a column, or on a column group, now warns once — naming the key and the column — in the same wording and the same `warnOnce` de-duplication the grid-level check uses. The known-key sets are derived from the `Column`/`ColumnGroup` interfaces in `types.d.ts` and checked against them at build time, so they cannot drift the way a hand-kept copy could. Nested option bags (`format`, `layout`, `shadow`, `filter`, `edit`, `header`, …) are not inspected here — an unknown `format` key is BACKLOG-0001095.

- **`selection: { mode: 'none' }` left cell ranges and the fill handle on, while the equivalent `selection: 'none'` string turned both off** (BACKLOG-0001177). *Recognise your own case: `selection: { mode: 'none' }` — the object form reached for the moment anything else needs setting alongside `mode` — still let a click start a range and show the fill handle, where the plain string `'none'` correctly disabled both.* Only the string form was checked when the DOM decided whether to mount range selection at all; the object form's `mode` was never read for that decision, only its `ranges`/`fillHandle` keys, which default to on. Both spellings now resolve through one function: `mode: 'none'` defaults `ranges` and `fillHandle` to `false`, and an explicit `ranges: true` or `fillHandle: true` alongside it still wins, exactly as before this fix for every other selection mode.
  - **Unchanged.** `selection: 'single'` / `'multiple'`, an object form with any other `mode`, and a `selection` config left out entirely — ranges and the fill handle keep defaulting to on, byte-for-byte as before.
  - **Out of scope, reported.** `checkboxOnly` (BACKLOG-0001184); keyboard selection semantics; `grid.set('selection', …)` does not reconfigure the range model's `enabled` flag at runtime — the same construction-time-only limitation the row selection mode already had.

- **A sort entry naming an unknown column was rejected for sorting but kept in state** (BACKLOG-0001178). `grid.sort.set([{ colId: 'a', direction: 'desc' }])` — AG Grid's sort shape — warned `sort ignores unknown column "undefined"` deep in the compute path, yet `sort.set()` still stored the entry: `sort.get()` and `state.get().sort` echoed it back and the rows never moved. A host persisting views saved the broken entry and re-applied, and re-rejected, it forever. `sort.set()` now validates every entry before it becomes state — an entry naming no known column is dropped, never stored — and the warning names both the keys it received and the keys it expects (`col`, `dir`) so a migrant sees the fix. `state.apply()` now reports a skip for the same malformed entry, the way it already reports other skipped sections. A mixed array keeps its valid entries, in order. `test/sort-reject-unknown-column.test.js`, 4 named tests; reverting either the `grid.sort.set` validation or the `state.js` skip-reporting fails its respective tests by name.

- **A resolved column's `type` echoed an unknown declared type instead of the effective one** (BACKLOG-0001179). `{ field: 'a', type: 'string' }` warned correctly ("unknown data type \"string\"; falling back to \"text\"") but `grid.columns.all()[0].type` still returned `'string'`, even though alignment, filter, editor and `dataType` had already fallen back to `text` — code inspecting the resolved column saw a type the grid was not using. `ColumnModel` now reports the resolved type's own name (`type.name`) rather than the raw, possibly-unrecognised declaration; the warning is unchanged, and every known type (built-in, extended and custom) still reports itself unchanged. `test/column-effective-type.test.js`, 5 named tests; reverting the `packages/core/src/columns/model.js` change fails "an unknown type falls back to text in state as well as behaviour, with one warning" by name.

- **A column heading given two class names blanked the whole grid** (BACKLOG-0001181, LG-08). `header: { class: 'a b' }` — a space-separated string, AG Grid's shape for this option — reached `classList.add()` as a single token containing whitespace, which throws inside header rendering during `createGrid`; everything after it was lost and the screen went blank. A single class, or an array of class names, still worked, which is why it was only caught on a two-word class. `header.class` now splits a string on whitespace and applies each non-empty token, matching `rowClass`. Headlessly this passed the whole time because `testdom`'s `classList` stub did no such validation; it now throws on a whitespace token the way a real browser does, so this class of defect fails in the fast suite too.

- **A computed cell kept its first value for the life of the grid** (BACKLOG-0001201). *Recognise your own case: a column whose `value.compute` returns a placeholder until an async lookup resolves — an id-to-name map, a permissions check, a rate table that arrives after the rows — and then `rows.refresh({ rows, columns, force: true })`, `rows.refresh()`, `rows.apply({ update })`, `rows.load()` and `state.apply()` all left `rows.text()` and the painted cell on the placeholder, with the compute called once; a `sort.set()` re-ran the compute and the text still did not change; and on a derived grid a sort or filter on the column after a refresh ordered and matched by the placeholder while the cells showed the new value. Silent: no warning.* The computed value was memoised in two places — the grid's value pipeline, which `rows.text()` and every painted cell read, and the column model's, which sort and filter handles read — and a headless grid cleared neither, a rendered grid cleared only the first, and the sort/filter handle itself was cached until a data change. `pure: false` now means what it says: the compute is re-evaluated on every read and every paint, never served from a cache. `rows.refresh({ rows, columns })` discards the cached results for exactly those cells in both pipelines and drops the cached sort/filter handles; with `force: true` a pure, stored computation is recomputed and rewritten for those cells too. `rows.load()`, `rows.apply({ add | update | remove })` and a change in the grid a derived grid follows discard the affected rows' cached computations unconditionally. On a url or stream source — one that has loaded a small enough body to keep an in-memory copy — a sort the host had already selected went on ordering by the placeholder after the cells showed the new value, because the source answered the repeated sort from a cached result; it now follows too. Whenever a compute re-runs, the text, the sort and the filter follow it.
  - **Unchanged.** `deps` semantics for a pure compute: a sort, a filter, a state restore, an edit to a column outside its `deps` and a `refresh()` that does not name it do not re-run it. Sort, filter and group results are not re-run by `rows.refresh`; the next sort or filter reads the new values. An in-place cell edit to one of a compute's `deps` does not re-run it (pre-existing; reported).
  - **Behaviour to plan for.** Without `force`, a targeted `rows.refresh({ rows, columns })` re-runs a *stored* (pure) computation on a grid below `columnarBelow` rows, on that cell's next read, and does not on a columnar one, where the stored value stands until `force: true`. Which you get flips at `columnarBelow`, so the same call on the same data behaves differently according to how many rows arrived. Pass `force: true` when you want the same answer whatever the row count.
  - **Cost.** `rows.refresh({ force: true })` with no rows or columns named recomputes every stored computed column for every row. On a grid below `columnarBelow` rows, a refresh that names a row costs that row one recompute of each named computed column on its next read.

- **An edit to a computed column's own input blanked it instead of recomputing it** (BACKLOG-0001205). *Recognise your own case: a column `total` declared `value: { deps: ['price', 'qty'], compute }` — the commonest spreadsheet pattern there is — and editing `qty` left `total` empty instead of showing the new product.* `#syncEditedCell` in `grid.js` rewrote a dependent's materialised store entry by reading it as a plain field (`rawOf(dependent)`), which resolves to `undefined` for a computed column since it has no `field` — the edit landed, but every column depending on it went blank. An edit to any column named in a computed column's `deps` (or any column at all under `deps: '*'`) now re-runs that column's `compute` against the edited row and rewrites the store with the result, in the graph's dependency order, so a column depending on another computed column also updates. A pure computed column that is not a dependent of the edited column is not re-run.

- **A correctly-configured composite `rowKey` triggered a false "not one of the shapes it accepts" warning** (BACKLOG-0001206, found by the BACKLOG-0001174 developer). `CONFIG_WIDE_CHECKS.rowKey` in `grid.js` only accepted a string or a function, so `rowKey: ['id', 'region']` — the documented array form that `model/rowkey.js` implements and keys rows with correctly — warned as unusable, even though nothing was wrong. The check now also accepts a non-empty array of string field names; a wrong shape (a number, an object, an empty array, or an array containing a non-string) still warns with the existing wording.

- **A CSV/TSV column of timestamps imported through the dialog lost the time** (BACKLOG-0001210). `grid.import`'s own type inference (`inferType`, distinct from the row-data inference BACKLOG-0001176 fixed) had its own ISO regex with no `datetime` outcome, so `inferType(['2026-09-12T14:30:00Z'])` returned `'date'` and the import preview showed the column, and mapped it, as a bare date. It now classifies a date-only ISO string (`YYYY-MM-DD`) as `date`, one carrying a time — with or without a zone — as `datetime`, and a column mixing the two forms as `datetime`, so the preview and the applied records keep the clock.

- **A tool-rail button showed as a blank but clickable slot, with nothing said about why** (BACKLOG-0001211, owner report from DemandFlow on 1.55.0). A `toolPanel.actions` entry (or any caller of `createIcon`) naming an icon the registry does not have silently fell back to the empty `blank` glyph — the sibling function `updateIcon` already warned for the identical mistake, but `createIcon` did not. It now warns once (`[lattice]`), naming the icon received and pointing at `grid.icons`/`config.icons` or a built-in name; a known name or a host-registered `icons: { name: '<path>' }` override stays silent. The built-in sprite set also gains a `present` glyph, so a presentation action has a real name to ask for (the grid still ships no built-in presentation rail button by design).

- **Entering presentation mode took the annotation tools away with the rail, so a presenter had no pen, arrow, rectangle or highlighter** (BACKLOG-0001213, reported on the live demo pages). *Recognise your own case: `grid.presentation.start()` on a grid with a `toolPanel` left the left-hand rail blank — the four tool buttons were registered and in the DOM, and `document.querySelector('[data-action="pen"]')` found them, but `.lat-panel-dock` around them was `display: none`.* The rail is chrome a presentation hides (§12), and the tools turn themselves on for a presentation (BACKLOG-0000800, D2) — so the tools were being added to the element that was hidden over them. A presentation now keeps the rail **for the annotation tools alone**: the four tools stay on screen and the rest of the rail — the panel tabs, the open panel, undo, export, maximise — goes for the length of the presentation, and comes back exactly as it was on exit, including the panel that was open on entry. A rail carrying no annotation tools (`annotate: true` with `actions: false`) still hides entirely, as before, and the documented escape hatch `presentation.start({ chrome: ['toolPanel'] })` still keeps the whole rail. An action a host adds mid-presentation waits for the rail to be handed back rather than appearing among the tools. `statusBar`, `editBar`, `historyBar`, `pagination` and `scale` are untouched.

- **The test that was meant to guard this measured registration, not visibility.** `test/annotate-rail.test.js` asserted the tool buttons were findable with a `querySelector` — which searches a `display: none` subtree perfectly happily — so it stayed green over a rail nobody could see. It now asserts the dock's own `display` and the buttons' ancestor chain, and a real-browser test clicks a tool while presenting and checks it becomes the selected tool.

- **`types.d.ts` and the generated API reference described behaviour the code no longer has** (BACKLOG-0001214). *Recognise your case: you read `GridConfig.rowKey`, `state.baseline()`, or the `config.state` / default-view interaction in the docs and it does not match what the grid actually does.* Four corrections, all documentation-only, no runtime change: `rowKey` now declares its documented third shape, `string[]` (the composite key `model/rowkey.js` has implemented since BACKLOG-0001206, which a same-day fix made the config validator accept without also fixing the type); `ColumnHeaderSpec.class` now says a string may hold space-separated tokens, each applied individually, matching the behaviour BACKLOG-0001181 shipped; `state.baseline()` now says the baseline is captured **before** `config.state` is applied (BACKLOG-0001183 reversed the order; the doc still read the old one); and the precedence between `config.state` and a saved view's `isDefault` flag — `config.state` wins outright, the default view is never applied, the active view id stays `null` — is now written down at both.
  - **Also.** `rowKey`'s function shape widened to `(row: unknown) => string | string[]`: the runtime (`model/rowkey.js` — `Array.isArray(value) ? compositeKey(value) : part(value)`) already accepts a function returning an array and the prose recommends it, but the declaration typed the return as `string` only, so the documented pattern failed `tsc --strict`. No named alias holds the function shape; widened at its inline site in `GridConfig.rowKey`.
  - **Tests.** `test/model.test.js` gains a headless test driving `createHeadlessGrid({ rowKey: [...] })` through the public config, proving the composite key resolves distinct rows and that `rows.apply({ update })` lands on the named row and not its composite-key neighbour. A `tsc --strict` probe against the real declaration confirms a function returning `string[]` type-checks (and fails on the pre-widening signature).
  - **Deferred, not fixed here.** `ColumnGroup.header` looks dead — `packages/dom/src/renderer/header.js`'s group-cell path never reads it, no test exercises it — but `tools/check.js`'s `column keys` guard cross-checks `types.d.ts` against the runtime whitelist `KNOWN_COLUMN_GROUP_KEYS` in `packages/core/src/columns/model.js`, and that whitelist still lists `header`. Removing the declaration alone fails that guard (`1 runtime key(s) in KNOWN_COLUMN_GROUP_KEYS are not declared in ColumnGroup: header`); fixing it properly means also dropping `header` from the whitelist, which turns a currently-silent config key into one the unknown-key check reports — a runtime behaviour change this docs-only card does not make. Left in place pending its own card.

- **`filters.where(name, fn)` on a paged or remote source, with no `{ condition }` twin, filtered nothing and said nothing.** Every signal a host could read agreed the predicate was in force — `filters.where()` listed the name, `filter:changed` fired with `cause: 'where'`, `rows.move` declined with `reason: 'filtered'` — while the fetched window painted unfiltered, because those sources hold only their own window and cannot run a host function over it. That silence is fixed, not the behaviour: registering such a predicate now **warns once**, naming the predicate and the source kind, and points at the `{ condition }` twin as the supported route. Reading rows repeatedly does not repeat the warning; a second predicate warns again for itself. A predicate that has a working `{ condition }` twin stays silent, and memory, stream and pushdown sources — which apply the predicate themselves — are unaffected.

### Documentation

- **`refresh: 'manual'` on a derived source now says how to trigger it: call `rows.load()` on the derived grid** (BACKLOG-0001102). *Documentation and a type comment only; no behaviour changes.*
  - **The gap.** A derived source accepted `refresh: 'manual'` and it worked, but nothing named the trigger. Worse, the producer-cost table in `docs/api-detail.html` recommends `refresh` as the answer to an expensive (20–36 ms at 200k rows) terminal producer, and then left the reader with no way to drive the mode it had just recommended.
  - **The trigger is `rows.load()` on the derived grid, with no argument, repeatably.** Each call re-reads `from` there and then and replaces the rows; between calls the panel stays exactly as it last derived. A derived grid takes its rows from `from`, so anything passed to `load` is not used, and the derived grid's own sort and filters stay as they were.
  - **Named in all three places a host looks:** beside the `refresh` option and in the producer-cost paragraph of `docs/api-detail.html`, in the derived-source table of `docs/API.html`, and in the `refresh` doc comment (and the `statistics` cost note) in `packages/core/src/types.d.ts`, which regenerates the type appendix of `docs/API.html`.
  - **With an executed example.** `docs/api-detail.html#derived-manual-refresh` builds a frozen summary panel, moves its source twice, waits longer than any automatic refresh would take, and presses a Refresh button in between; the doc-example gate (`test/docs-executable.test.js`) runs it and asserts `20 20 10 10 5; steady; released`: the panel is frozen until the press, and the presses leave the source's listeners as one press does and `destroy()` leaves none of them behind.

- **A host patching `createGrid` got no effect and no error; a headless test that passed still blanked a real page** (BACKLOG-0001186). *Documentation only; no behaviour changes.*
  - **`createGrid` cannot be reassigned to wrap it.** Wherever it is exported it is defined with `Object.defineProperty(..., { get, enumerable: true })` and no setter, `configurable` defaulting to `false`. Verified against the built UMD bundle: assigning `LatticeGrid.createGrid = wrapper` in an ordinary script is a silent no-op (confirmed with `Object.getOwnPropertyDescriptor` and a sandboxed sloppy-mode assignment); the same assignment in a module, or any strict-mode script, throws `TypeError: ... which has only a getter`. `docs/API.html#wrapping-creategrid` states the descriptor plainly and gives the supported pattern — a host-owned factory module that calls `createGrid` and applies its own defaults — and says outright that a shipped `defaults()` call does not exist today (BACKLOG-0001187 is considering one). `docs/api-detail.html` carries the same recipe under Recipes.
  - **What `createHeadlessGrid` covers, and what it does not**, stated as a short list at the reference entry (`docs/API.html#headless-coverage`) and in a new "How it works" subsection of the guide (`docs/api-detail.html#headless-vs-dom`): data, state, sort/filter/group/pivot/total, formulas, editing and write-back, export and every event are covered; the DOM renderer, layout/measurement, focus and anything size-dependent are not.
  - **Two specifics named because they cost real time, both checked against the running code rather than asserted:** a container with no rendered box (detached from the document, or under a `display: none` ancestor) makes the virtualiser compute a zero-height viewport, so only the overscan band near the top of the data paints rather than nothing — verified in a real headless Chrome session against the built bundle, four scenarios (visible, detached, hidden ancestor, `position: fixed` off-screen with explicit dimensions), and it is specifically the absence of a computed box that starves the render, not being visually off-screen: the `position: fixed` case with explicit width/height rendered fully. And the in-repo `testdom.js` is a stub, not a browser: it validates class tokens the way a real `DOMTokenList` does since BACKLOG-0001181 (read from source), but its `focus()` is bookkeeping only, with no model of focusability, tab order or visibility, and it computes no cascade or layout, so anything rendered still needs the real-browser tests.
  - **No new public surface.** `packages/core/src/types.d.ts` was not touched; the capability registry stays at 715 before and after.

## [1.55.0] - 2026-09-12

### Fixed

- **A column aligned `left` showed up on the right edge in an Arabic (right-to-left) grid, and one aligned `right` on the left** (BACKLOG-0001020). The column model folded `left` into `start` and `right` into `end`, and those two are logical: the theme writes them in logical properties, so they mirror with the writing direction. `left` and `right` are now physical edges that stay put in both directions — in the cell, in its editor input and in the header rules — while `start`, `center` and `end` keep following the text; `centre` is still accepted for `center`. A resolved column's `align` now reads `'left'`/`'right'` when it was configured that way rather than `'start'`/`'end'`. A number column a host spelled `align: 'right'` keeps its tabular figures. The `align` reference in `docs/API.html` says which spellings are physical and which logical, and the two source comments that said the grid had no right-to-left layout now describe what ships.

- **`direction: 'rtl'` warned `[lattice] 'direction' is not a configuration key this grid recognises` while taking effect regardless, and the capability registry had no entry for it** (BACKLOG-0001020). The declaration had been added under `NumberFormat` rather than `GridConfig`, so neither the runtime key list nor the registry — both of which read `GridConfig` — could see it. It is declared on `GridConfig`, recognised at runtime and registered as `config:direction` (registry 857 → 858).

- **A routed kanban board lost its cards on refresh, and a routed KPI panel zeroed every tile** (BACKLOG-0001069). *Recognise your own case: a board or panel fed by the Data Router through `router.attach(value, viewer)` showed every routed row until the first `refresh()`, at which point the board fell back to its configured seed (47 cards to 1 in the live demo) and every KPI tile read zero or "No data".* `refresh()` re-seeded the viewer from `config.rows`, throwing away every row that had arrived through `rows.apply`. It now knows where a viewer's rows come from: a routed board or panel (any row has arrived through `rows.apply`) re-reads nothing on refresh — it regroups, or re-derives every tile, from the rows it holds and shows exactly what it showed before, re-rendered. A grid-bound viewer still re-reads its grid, and a viewer still on its `config.rows` still re-reads that array, so a host that mutates the array in place and calls `refresh()` sees the change as before. `setRows` puts a routed viewer back on its configured rows explicitly. No new API; `refresh()` and `setRows()` keep their signatures. Documented on both modules and in the API reference.
  - **Unchanged.** Grid-bound boards and panels; the write-back paths that re-read the grid after a move or an inline edit; `rows.apply` itself.
  - **Out of scope, reported.** Whether `attach` should backfill a viewer from the router's current state, and the same check on the grid, gantt and chart viewers.

- **The install snippets in `docs/API.html` and `docs/api-detail.html` said `@toclocoinc/lattice-grid@1.7.1`, forty-four versions old, and shipped that way in the npm package and on the site with a copy button beside each, so customers copied a 44-version-old install line** (BACKLOG-0001085). The reference's rail, chip, footer and `getVersion()` example were stale too (`1.7.1` and `1.12.0`), and the README's CDN line carried a `@<version>` placeholder that no CDN resolves. Nothing caught it: `@1.7.1` resolves, and the only version gate read one line of one document. `package.json` is now the single hand-written version: `node tools/build.js` stamps every version label in the shipped documents from it (the reference rail, both chips, both footers, both `getVersion()` examples and the guide header, alongside the README it already stamped), and every install URL in the shipped documents pins the major, `@1`, which cannot go stale. `tools/check.js` now walks every shipped document and fails naming the file, line and string for an exact `@toclocoinc/lattice-grid@X.Y.Z` other than the current version, a placeholder URL, or a stamped label that is not current. Documentation and tooling only: nothing in the shipped bundle changes.

- **A derived grid did not follow an edit made through the editing API** (BACKLOG-0001089). *Recognise your own case: a tab or panel derived from a grid (`source: { mode: 'derived', from }`), and after `grid.edit.setCells(...)`, an inline edit, a paste, a fill, an undo or a redo on the parent the derived view keeps the old values, with no warning, until something else moves the parent.* The editing path fired only `cell:changed` per cell; a derived source, like every consumer that keeps its own copy of the rows, follows `rows:changed`, and nothing on the edit path fired it. Every edit batch now announces itself **once** as `rows:changed { identified: true, edit: true, reason, columns, updated }`, after its per-cell `cell:changed` events: one `setCells`, one editor commit, one fill, one paste, one undo, one redo, one optimistic rollback. A derived view re-derives once per batch, never per cell, and a two-level chain cascades.
  - **Once per batch, on purpose.** At 200,000 rows with a `where` chain and `refresh: 'live'`, twenty rows announced separately cost 13.1 s and the same twenty announced together 672 ms; the per-cell events are unchanged and the derived source does not listen to them.
  - **A grouped derivation stays right when the edit touches a column the parent filters on.** An edit changes the row object in place, so the group patch could not see a filter column move and kept a row the parent had just dropped; the announcement names the `columns` written and the patch re-reads in full when one of them is a filter column.
  - **Unchanged.** `rows.apply` and `rows.queue` announce exactly as before; `cell:changed` keeps its payload and count; undo entries, `beforeEdit`, per-cell parse and validate, and optimistic reconciliation are untouched. `createStat` and the KPI rail, which already follow `rows:changed`, now follow an edit too.
  - **Prefer `refresh: 'idle'` for a derived child of an editable grid.** Under `'live'` the derivation runs inside the edit call, so a commit on a large source pays the whole re-read before the editor closes.

- **A Gantt project anchored with `new Date(y, m, d)` started a day early east of Greenwich** (BACKLOG-0001104). *Recognise your own case: `projectEpoch: new Date(2026, 2, 2)` drew the first tick on 2026-03-01 and `today: new Date(2026, 2, 6)` on plan day 3 for a reader in Paris, Tokyo or Sydney, while London, New York and UTC got 03-02 and day 4; ISO strings were right everywhere.* The module floored the `Date`'s UTC instant, and local midnight east of Greenwich is still the previous day in UTC. A `Date` is now read as the calendar date its local wall clock shows, the way a `date` column reads one (BACKLOG-0001087), so `new Date(2026, 2, 2)` is 2 March in every zone, on every surface the anchor drives: axis ticks, bar labels, tooltips, screen-reader text, weekend shading and the today line. The rule is written once in `packages/modules/gantt/time.js` and covers every `Date` the module accepts (`projectEpoch`, `today`, `projectStart`, `statusDate`, holidays, a task's `start`/`end`).
  - **Unchanged.** ISO strings and day numbers read exactly as before: `'2026-03-02'` is 2 March on every machine, and a day number passes through untouched. A `Date` is decided by the reader's zone, so an anchor stored with the plan is best kept as a string.
  - **Recognise your own case:** if you worked around the old behaviour by passing `new Date(Date.UTC(y, m, d))`, a reader west of Greenwich now sees the previous day, because UTC midnight is still the evening before in New York; pass `new Date(y, m, d)` or the ISO string instead.

- **A screen-reader user in a non-English locale heard a refused edit announced in English** (BACKLOG-0001106). *Recognise your own case: the grid is configured with `locale` and a catalogue, and a cell another user holds is announced as "This cell is being edited by …" in English; the presence roster's "N not in view", a comment's "Written when the value was …" note, the facet band's "… distribution filter" name, the "Sum of …" heading tooltip, the audit-mode "Was: …" tooltip, the kanban list names "…, N cards" and the gantt "+3d" lag label were English too.* The build check that refuses a literal at a text sink matches only single-quoted literals, so a template literal or a `const` holding the text passed it, and all eight shipped untranslated in every locale. Each now resolves through the message catalogue under a new key: `a11y.presence.refused`, `presence.someoneElse`, `presence.hidden`, `comments.valueMoved`, `facets.filter`, `header.totalOf`, `diff.before`, `diff.empty`, `kanban.columnCards`, `kanban.laneCards`, `gantt.lag` and `gantt.lead`.
  - **The kanban count is plural-aware.** `card${n === 1 ? '' : 's'}` could serve only a language with two plural categories; `kanban.columnCards` and `kanban.laneCards` are plural objects selected by `count`, so Arabic's dual is reachable.
  - **The kanban board and the gantt view take a `messages` option** — a grid's own `messages`, or any `{t(key, params)}` — and a board or plan composed with a grid borrows that grid's catalogue without being told. With neither they render the English seeds.
  - **The new keys are seeded in English and awaiting translation** in the other catalogues, the documented state for a key without a human translation; until one lands they fall back to English rather than to a raw key.
  - **`R²` stays as it is.** The charts' trendline readout is mathematical notation, not a phrase, and is not a catalogue entry.

- **A half-width column filled the whole grid after the window narrowed** (BACKLOG-0001117). *Recognise your own case: a column declared `layout: { width: '50%' }` (any percentage) in a grid whose container the page resizes — a responsive panel, a split pane, a layout window, a browser window being made smaller. The header cell narrowed with the grid; the body cells beneath it did not, and the user scrolled sideways to reach the columns a 400px grid should have shown side by side.* The column layout was not at fault: a size-only pass re-resolved every slot against the new viewport, which is why the header moved. The rows were the gap. A row already on screen is skipped on a frame when it holds the right column ids — the check that keeps a vertical scroll to one transform write per row — and that check knew nothing about widths, so a mounted row kept its cells at the widths of a viewport that no longer existed until something else rewrote it (a scroll past it, a filter, a load). The renderer now compares each mounted cell's placed offset and width to its slot as well as its id, so a size pass re-places the rows whose geometry changed and still skips the ones whose geometry did not. A percentage column is now the declared share of the **current** viewport, honouring its `min`/`max` and the global floor, and it grows back when the container does.
  - **Unchanged.** Pixel and `flex` columns resolve as before; a pixel-width control column beside a percentage column keeps its width and its place. Percentages summing past 100 still overflow and scroll rather than being scaled down. A resize that leaves the width as it was writes nothing to a mounted cell.
  - **Docs.** The column `layout` reference now says a percentage follows the viewport, and the layout-module section no longer tells adopters to avoid percentage widths inside a resizable window: that advice described this defect.

- **Mounting a kanban board silently removed the host's own styling from the mount element** (BACKLOG-0001118). *Recognise your own case: you call `createKanban(el, ...)` on an element that already carries a class of yours, such as a layout pane (`lat-layout__body`), a CSS-grid cell or a themed panel, and that styling disappears the moment the board mounts. In the layout demo the board pane collapsed: four windows configured, three on screen.* The module assigned `el.className = 'lat-kanban'`, replacing every class the host had. It now adds its class alongside yours, and a re-render neither duplicates nor disturbs them. `destroy()` removes only `lat-kanban` and leaves the host's classes in place. No API changes, nothing to migrate, no new dependency.

- **A chart's trend forecast was painted far past the chart, over whatever sat beside it** (BACKLOG-0001120). *Recognise your own case: a line, area or scatter chart with `trend: { method: 'linear', forecast: n }`, on a page with other content to its right, such as a two-column dashboard. The dashed forecast and its shaded band ran out of the chart and across the neighbouring chart or panel.* Measured in Chrome on an 860px chart with twelve monthly points and a six-step forecast: the band was painted out to x = 1267 while the chart's `<svg>` ended at x = 872, **395px past its own box**, and 18,322 pixels of it landed on an empty neighbour. The same band also reached 71px above the chart's top edge.
  - **What changed.** The trend layer (the fitted line, the forecast line, its band and the R² label) is now clipped to the chart's own `<svg>` box. It may still extend past the plot into the chart's margin, as it did before, but it stops at the chart's edge. **A forecast longer than the chart is cut off at the chart's edge.** After this release the same page paints 0 pixels on the neighbour, and the forecast still reaches the chart's right edge.
  - **Unchanged.** Only the trend layer is clipped. Annotations, reference lines, error bars, data labels and axes draw exactly as before. The data marks keep their existing clip to the plot (BACKLOG-0001097).
  - **Proven in a real browser.** `test/chart-clip-browser.test.js` takes screenshots of that chart with a neighbour beside it and compares pixels, because `getBoundingClientRect` ignores `clip-path` and cannot see this fix. It asserts that the chart paints nothing on the neighbour, and that the forecast still paints the margin between the plot and the chart's edge. Against the 1.54.0 source, the neighbour check fails with 18,593 pixels painted. Clipping to the plot instead of the chart box fails the margin check.
  - No API changes, nothing to migrate, no new dependency.

- **A KPI rail beside a filtered grid kept showing the unfiltered numbers** (BACKLOG-0001121). *Recognise your own case: `createKPI(el, { grid })` next to a grid the user filters, sorts or edits, and the tiles never move — until the host calls `kpi.refresh()` from the grid's `filter:changed` / `rows:changed` / `cell:changed` itself, which nothing said to do.* The panel read the grid's rows once, when built, and never again; `rows.apply` on the bound panel was refused, so there was no route by which a change to the grid reached it. Every other viewer follows — a derived source follows its parent, `createStat` follows its grid including across the pipeline settle (BACKLOG-0001094) — and the panel marketed as the dashboard rail was the one that went stale. A grid-bound panel now **follows the grid**: after a filter, a sort, an edit through `edit.setCells`, `rows.apply` or `rows.load` on the grid, and the grid's pipeline settle after an off-thread sort, the panel agrees with the grid beneath it with no `refresh()` call. It subscribes to the same grid events `createStat` follows, with the same settle gate, so a `model:changed` for an expand, a collapse or a page turn re-reads nothing.
  - **One re-read per change, not one per event.** The grid announces one change several ways — `rows.apply` fires six events, a three-cell edit fires four — so the re-read is queued on a microtask and every event of one synchronous turn collapses into one read of the grid. Read the panel after the turn ends (after an `await`, or in the `change` event), not in the same statement as the grid call; a host that needs the numbers in the same turn calls `refresh()`, which re-reads now and replaces the queued follow rather than doubling it. On a sorted grid past the worker threshold a filter change is two re-reads: one at the end of the turn (the read that starts the off-thread sort, serving the prior order) and one when the settle lands; on a synchronous grid it is exactly one.
  - **Unchanged.** `refresh()` keeps its signature and still works on a bound panel; it is simply no longer needed for this. `rows.apply` and `setRows` on a bound panel are still refused — the grid is the truth — and the `rows.apply` warning now says the panel follows the grid. Panels over a plain `rows` array and router-driven panels follow nothing new. `destroy()` unsubscribes.
  - **Want a snapshot instead?** Do not pass `grid` as the source: pass the rows (`rows: snapshot`), with `grid` alongside if the panel should still adopt the grid's type and density. A panel given both reads `rows` and does not follow. No new option.

- **A treemap drew one level only, whatever the data's shape** (BACKLOG-0001127). *Recognise your own case: a grid grouped two deep, a sunburst beside it drawing two rings, and the treemap drawing one tile per top-level group with nothing inside.* The treemap now nests: children inside their parent's tile, each branch with a header band naming it and padding round its children, to the depth the tree has — the same tree the sunburst draws, from the grid's grouping, capped by `depth`. A child whose tile would be smaller than a line of text at the small size is not drawn and its parent's tile stands for it; a small group at the top level is still drawn, as a labelled tile with nothing inside. A branch is filled as a pale frame in its family's colour and its children at their own opacity on top, so the levels read apart; every name is cut to the width its tile has and dropped when only a stub would be left. Measured in a real browser on a grid grouped region → product with one sliver region: every child's four corners inside its parent's tile and below the header band, no two sibling tiles overlapping, the sliver region drawn and named with no children inside it. The tooltip and the click datum report the deepest tile under the pointer, with its `depth`.
  - **Unchanged.** A flat grid still draws one tile per category. Value labels (`labels: { show: true }`) sit on leaf tiles only.

- **A sunburst never labelled its outer ring** (BACKLOG-0001127). *Recognise your own case: a sunburst over a grid grouped two deep, where the legend names the inner level and nothing names the outer one.* The names were drawn on the first ring only, on the argument that an outer ring's segments are narrow by construction; at 918×402 the outer band is 95px wide, as wide as the inner, and its segments carried no name at all. Every ring is now labelled where the name fits, and left blank where it does not: the segment's sweep, the width of its band, the room across it and the room along it are each checked, so a name is never drawn over a neighbour or into the ring beside it. Measured in a real browser in a 918×402 box with the legend inside it: ten arcs on radii 89 and 179, three inner-ring labels as before, six outer-ring labels where there were none, the sliver segment left unnamed, every label inside its own ring, and no two labels overlapping.
  - **Unchanged.** The value labels (`labels: { show: true }`) stay on the first ring; the tooltip and the accessible table carry every segment's value. `labels: false` still draws no names on any ring.

- **An array on a chart's `x` drew an empty chart and said nothing** (BACKLOG-0001127). *Recognise your own case: `x: ['region', 'product']` on a sunburst or treemap, an empty chart, and a `TypeError` from inside the grid's column lookup, or nothing at all.* The chart now warns once, with the `[lattice]` prefix, that `x` expects one column id (a string), shows the array it was given, and says how to nest: group the grid, and the hierarchical types read the grouping. Only the diagnostic is added; what the chart draws after it is what it drew before.

- A column `contextMenu` written as a list dropped every grid-level item: the built-ins and whatever the grid-level `contextMenu` builder added vanished from that column, while the function form kept them, so a host who wrote `contextMenu: [items]` concluded their grid config was broken. The array now chains exactly as `(p, defaults) => [...defaults, ...items]` does — built-ins, then the grid-level items, then the column's — so the two forms agree. To replace a column's menu, use the function form and ignore `defaults` (BACKLOG-0001128).

- **A grid that scrolls vertically got a horizontal scrollbar and a clipped last column after `columns.fit()`** (BACKLOG-0001130). *Recognise your own case: you call `grid.columns.fit()` straight after `createGrid`, or straight after `grid.rows.load()`, on a grid with more rows than fit on screen, and the columns come out slightly too wide: a horizontal scrollbar appears that was not there before, and the last column is cut off under the vertical scrollbar. The report that found this saw `US$2,506` shown as `US$2,50`. Or: your grid has a column declared `resizable: false`, selection checkboxes, a detail expander, row grouping or tree data, and `fit()` leaves it that column's width too wide, scrollbar or no scrollbar.* The function meant to prevent a horizontal scrollbar was creating one, so a grid that called it looked worse than one that did not. No API changes, nothing to migrate.
  - **Measured in Chrome**, on a plain grid in a 360px-high container with 500 rows: at 390, 768 and 1440px wide the body viewport's usable width was 371, 749 and 1421px, and `fit()` called straight after `createGrid` sized the columns to 386, 764 and 1436px. That is **15px too wide every time**: one scrollbar. After this release the columns come to 371, 749 and 1421px, the same as the usable width, and there is no horizontal scrollbar. The same holds when `fit()` is called straight after `rows.load()`, and once the grid has settled.
  - **Why it happened.** `fit()` used a width the renderer had cached, not a width it measured. The renderer reads the body's width at the start of a frame and then writes the rows. The first frame runs as the grid is built, so it measured an empty body, and the tall row spacer it wrote next is what makes the browser draw the vertical scrollbar. Until the next frame measured again, the cached width still counted the scrollbar's 15px as space for columns. `fit()` called in that window spread the columns across the stale width, and because `fit()` sets widths once, the columns kept the error.
  - **What changed.** `fit()` now targets **the body viewport's client width, read at the moment you call it**: the space the cells actually occupy. It lets any pending frame finish first, so the rows you have already given the grid are in place, then measures. With a vertical scrollbar that width is the narrower one. Without one it is the full inner width, so no scrollbar is subtracted when none is drawn.
  - **Every column the grid draws is now counted, not just the ones `fit()` sizes.** `fit()` shared the whole width among the caller's resizable columns and then drew every other column on top of that: a column declared `resizable: false`, and the grid's own selection checkbox, detail expander, group and tree columns. A column the model lists but the body does not draw, such as the column a grid is grouped by, was sized and counted even though it takes no space. Measured in Chrome with a vertical scrollbar at 390, 768 and 1440px: a 100px `resizable: false` column left the columns at 471, 849 and 1521px against 371, 749 and 1421px of room, **100px too wide**, and so did the same grid without a scrollbar (486, 864 and 1536px against 386, 764 and 1436px). Selection checkboxes left 415, 793 and 1465px against 371, 749 and 1421px, **44px too wide**, and did the same without a scrollbar. A detail expander added 36px. Grouping by a column added 159px at 390px and 77px at 768px, and left 69px empty at 1440px. Tree data added 260px. After this release, every one of those comes to exactly the client width, with one exception: tree data at 390px, where the 260px tree column leaves less room than the other four columns' minimums need. That is the too-little-room case described below. `fit()` now reads the columns the body actually lays out, keeps the width of each one it does not size, takes those widths out of the target, and shares the rest among your resizable columns. Under a pivot every column drawn is one the grid generates, so `fit()` has nothing to size and changes nothing, the same as before.
  - **The widths now add up exactly.** Each width used to be scaled by one factor, clamped to its `min` and `max`, and rounded separately. A column held at a bound kept pixels the others were counted on to give up, so the total could overshoot by tens of pixels, and rounding added a pixel or two either way: at 390 and 768px a fitted grid stopped 1px short of its edge. Now a column that reaches its `min` or `max` stays there and the others share what remains, the way CSS resolves `flex`, and the widths are rounded so they add up to the target exactly. With a 120px `min` on one of three columns sharing 227px, the old approach came out 48px too wide. It now fills the width exactly.
  - **When the columns `fit()` does not size leave too little room**, whether they already take the whole width or leave less than the other columns' minimums, each column `fit()` sizes is set to its `min` (40px if it declares none). None goes below its minimum and none can be negative. The grid scrolls horizontally rather than squeezing a column to nothing, and one `[lattice]` warning names the widths that ran out. Measured at 390px with a 400px `resizable: false` column and checkboxes: three columns at 40px, and a real horizontal scrollbar exactly as long as the columns reach.
  - **`fit()` is one-shot, and the documentation now says so.** It sets fixed widths once and does not follow the grid afterwards. That has always been true, but it was never written down. If rows that arrive later bring a vertical scrollbar in, or the container is resized, call it again. For a column that should keep tracking the width without being told, use `flex` rather than `fit()`: a `flex` column absorbs a scrollbar that appears later by itself. `fit()` replaces a column's `flex` with a fixed width, just as a drag does.
  - **`columns.autoSize()` does not have this problem.** It sizes columns to their content and never reads the viewport's width. Measured with the same content, it produces the same widths with a scrollbar and without one.
  - **Proven in a real browser, not a stub.** The test DOM draws no scrollbar, so a 15px overshoot cannot be seen there. `test/fit-scrollbar-browser.test.js` drives Chrome at 390, 768 and 1440px, with and without a vertical scrollbar, calling `fit()` at each point a host would. It asserts that `scrollWidth === clientWidth`, that the widths sum to the client width, and that the last cell ends at the client edge. It also samples the box on every frame to check that it holds still. It covers a `resizable: false` column and selection checkboxes at each width, with and without a scrollbar, plus the detail expander, the group and tree columns, a column held at its `min`, and the too-little-room case. Against the 1.54.0 bundle, 33 of its 45 cases fail.
  - **Cost.** The core bundle grew from 729,465 to 730,434 bytes gzipped: **+969**, measured with `zlib.gzipSync(…, { level: 9 })` over `dist/lattice-grid.esm.min.js`. No new dependency and no new public capability. `types.d.ts` gains a doc comment on `fit()` and no new declaration.

- **A grid at rest flickered a scrollbar on and off** (BACKLOG-0001135). *Recognise your own case: a grid at the default (`compact`) density, or any grid in a container whose width is not a whole pixel, showed a vertical or horizontal scrollbar that came and went — it read as a twitch every few seconds, and anything that measured the grid's viewport (a chart aligned to it, a synchronised grid, a layout that sizes to it) inherited the twitch.* The body viewport was fractionally tall (a 27.1875px header in a whole-pixel container), the browser rounded its `clientHeight` up, the renderer wrote that reading back as the height of its row surface, and a surface a fraction of a pixel taller than its box brought a scrollbar, which changed the next reading, which took the scrollbar away again — on every frame, for as long as the grid was on the page. The renderer now sizes its surface and its row fill from the fractional box rounded **down**, so what it writes back can never overflow the box. No API changes, nothing to migrate.
  - **Unchanged.** Row heights, the last row's fit, and a real scrollbar drawn for rows that do not fit: none of these moved. The surface can now fall short of the viewport's bottom edge by under a pixel, which is not visible.
  - **Tests.** `test/viewport-stable-browser.test.js` samples the box on every animation frame for sixty frames at each density, with and without a real scrollbar, and in a fractional-width host, and asserts every sample identical. The `columns.fit()` no-scrollbar cases parked at `standard` density while this was open are back at the default.

- **A dashboard window's resize handle and the drag grip of a chrome-less window sank into a dark window body** (BACKLOG-0001150). *Read this if you use `modules/layout` with `data-theme="dark"`.* Both controls sit on the window body, whose colour is the host's `--lattice-background`, and their ink was the light `--lat-layout-muted` (`#586069`) in every theme. On a body darkened to the grid theme's `#14181c` that measured **2.8:1**, under the 3:1 WCAG 2.2 1.4.11 asks of a non-text control. On an explicit `data-theme="dark"`, on the layout or any ancestor, both now take a dark rung, `--lat-layout-muted-auto: #7A838C`, which measures 4.63:1 on `#14181c`, 4.26:1 on the grid's `#1b2026` surface, 3.31:1 on the hover ground the grip keeps and 3.85:1 on a white body a host set the attribute on but never darkened.
  - **Deliberately not on `prefers-color-scheme: dark`.** The chrome's ground is ours in every state, so its dark rung (1.54.0) applies on the OS preference too; the body's ground is the host's, and a dark desktop says nothing about it. A page that leaves the body white under a dark desktop would have got a lightened, invisible handle: the same defect mirrored. Under the OS preference alone both controls stay `#586069`, byte for byte.
  - **Unchanged.** A host's own `--lat-layout-muted` still outranks the rung, in light and dark. The chrome's controls read their own `--lat-layout-chrome-ink-muted-auto` and do not move. Forced-colours mode is unaffected: both controls take the system `ButtonText` with or without a dark theme.

- **Enter on a column heading sorted the column and also opened an editor on a body cell; ArrowRight on a heading landed on a body cell instead of the next heading** (BACKLOG-0001152). *Recognise your own case: a keyboard user pressed Ctrl+Alt+H, then Enter to sort, and found themselves typing into a cell they had not chosen; ArrowRight to reach the next heading dropped them into the data instead.* The heading's key handler marked the press as handled for the browser but not for the grid root's own handler above it, which acted on the same press a second time. A key a heading handles now acts once, on the heading. Keys a heading declines — Escape, Ctrl+Alt+H — still travel exactly as before, and ArrowDown still leaves the header for the data, landing on the row the user came from.

- **Leaving a maximised grid (Escape, or the rail's restore button) and Delete on a cell dropped keyboard focus to `<body>`** (BACKLOG-0001152). *Recognise your own case: the user pressed Escape in a full-screen grid and the next Tab started from the top of the page; Delete cleared the cell and the arrow keys stopped working until they clicked the grid again.* The maximiser moved the host element while a cell inside it held focus, the size change then rebuilt every cell, and a range clear mounted, focused and removed a real editor for each written cell; in each case an element holding focus left the document with nothing placing focus afterwards. Focus now returns to the cell that had it — or, if that cell is no longer rendered, to the grid itself — and never to `<body>`.
  - **Unchanged.** Escape with an editor open still closes the editor and leaves the maximised grid up; a key the grid does not map still reaches the page.

- **Right-clicking beside the last column showed the browser's menu, as if the grid had none** (BACKLOG-0001153). *Recognise your own case: two fixed-width columns in a wider grid, empty row surface to the right of them; a right-click on a cell opens the grid's menu and a right-click an inch to the right of it opens the browser's.* The row surface spans the whole grid but the cells stop at the last column, and the renderer's right-click handler required both a row and a cell under the pointer: it found the row, missed the cell, and returned before suppressing the browser's menu. A right-click anywhere on a row now opens the grid's menu for that row — the empty tail included — as a right-click on a group row already did: with no column under the pointer the column link is missing from the menu chain and the grid-level menu stands, and `cell:contextmenu` (and so a `contextMenu` builder's `params`) carries `colId: null`, `column: undefined` and `value: undefined` with the row, `key` and `index` filled in. The built-in items that act on a cell — Paste, Clear, Fill down, Edit cell — are not offered in the tail (there is no cell for them to act on; on an editable grid Paste would otherwise have been enabled with nothing to paste into); the row and grid items are. `CellMenuParams.colId` is now typed `string | null` and `column` `ResolvedColumn | undefined`, which is what the group-row case always sent.
  - **Unchanged.** A right-click on a cell carries the column and its value exactly as before; the area below the last row belongs to no row and keeps the browser's menu, as do the scrollbar and the chrome around the grid; the header's own right-click menu is untouched.
  - **On 1.54 and earlier**, give one column `layout: { flex: 1 }` so the cells reach the grid's edge and there is no tail to click.

- **A chart's clock-skew warning stated a bound the chart did not apply** (BACKLOG-0001157). *Recognise your own case: a line, area or scatter chart with a rolling time window whose span is not a multiple of 40 s, such as `window: { kind: 'time', span: 50_000 }` or `90_000`, and a producer whose clock runs ahead of the viewer's. The 1.54.0 warning said a reading was "more than the 13s (25% of the 50s rolling window)" ahead, or "23s" of 90 s, while the chart applied 12.5 s and 22.5 s.* The stated bound was rounded to a whole second; the applied bound was not. The warning now prints the bound and the span exactly, so "12.5s (25% of the 50s rolling window)" is what the chart uses. The measured skew ("up to 120s ahead") is still rounded as before, and a skew under ten seconds still keeps one decimal. No API changes, nothing to migrate, no new dependency.

- **Four `[lattice]` warnings on every page's console, from the grid's own code** (BACKLOG-0001161). *Recognise your own case: a clean page with a default grid logged `on('column:visibility')`, `on('theme:changed')` and `on('scroll:changed')` "subscribes to an event the grid never raises", and a grid with `statusBar: true` added `on('source:progress')`.* The bus's unknown-event guard (BACKLOG-0000711) exists to catch a host's typo such as `row:click`; the grid tripped it itself, four times, and a host learned to ignore the one warning that catches their own mistakes. Each of the four subscriptions was dead code: none of the names was ever emitted. `column:visibility` was a near miss of `column:visible` and is now subscribed to by its real name; `theme:changed` and `source:progress` never existed and are removed (a theme change is attributed to `'theme'` by the renderer's own cause, and a stream's chunks reach the status bar as `model:changed`); `scroll:changed` is removed because the comment panel already re-places itself on the `render:done` every scroll paint announces. A default grid now logs nothing under the prefix; a grid without a licence key still logs its one deliberate licence notice.
  - **Unchanged.** The guard itself: `grid.on('row:click', …)` still warns once, naming the misspelled event and the real one.
  - **Unchanged.** No event was added, renamed or removed from the public `EventName` list.

- **Tabbing into a grid showed no focus indicator until an arrow key was pressed** (BACKLOG-0001165). *Recognise your own case: a keyboard user presses Tab to reach a grid nobody has clicked or arrowed into yet, or a grid whose focused cell has scrolled out of the rendered rows, and nothing on the page shows where focus went; the first arrow key then lights up a cell.* Focus landed on the grid's own element, which drew no ring: the stylesheet switched the browser's ring off on the assumption that a cell always carried one. Measured in Chrome with real Tab key events: the grid element matched `:focus-visible` and painted 0 changed pixels. It now draws a ring around its own edge the moment keyboard focus lands on it, in the theme's focus colour (`--lattice-focus-color`, `--lattice-focus-width`), and in the system text colour under forced colours (Windows High Contrast Mode); the grid's own border takes the same colour while it holds focus, so the ring is one band. The ring is drawn inside the grid's box and above its header, rows and scrollbars, so a host that clips overflow cannot hide it and nothing the grid draws can cover it; in every built-in theme it meets 3:1 against the surfaces it sits on. Where focus lands is unchanged: the grid itself on first entry, the cell you were on after that; the first arrow key moves focus to a cell as before, Shift+Tab from the first cell leaves the grid, and Escape with nothing to cancel leaves focus where it is. No API changes, nothing to migrate, no new dependency.

### Documentation

- **Four tagged releases had no `## [X.Y.Z]` heading in `CHANGELOG.md`, so their entries read as part of the next release and the site, which takes release dates from these headings, fell back to the build date for their pages** (BACKLOG-0001125). Each of `1.25.0`, `1.31.1`, `1.32.0` and `1.43.0` had lost its heading to the following release's merge: 1.43.0's ask-your-data work sat under 1.44.0, 1.32.0's time travel and 1.31.1's rendering fixes under 1.33.0, and 1.25.0 had no entry at all. The four headings are restored with their tag dates, and the two lines the same merges clipped from the first line of 1.31.1 and 1.43.0 are restored byte for byte from the tagged files; no entry's wording changed. `tools/check.js` now compares the headings with the repository's `v*` tags and fails naming any tagged version without a heading or any heading without a tag (the newest heading may precede its tag; the five pre-tag-era headings are listed in `tools/changelog.js`). Documentation and tooling only: nothing in the shipped bundle changes.

- **The layout reference said Escape could not get you out of a maximised window holding a grid, and that the only way back was the restore control** (BACKLOG-0001160). *Recognise your own case: you read the `maximise(id) / minimise(id) / restore(id)` row on `/docs/api/layout/`, or the `maximise()` doc comment in your editor, and it told you a grid payload "claims every Escape".* That was true when the layout module shipped and was fixed in the same release (BACKLOG-0001143); the reference was not updated with it. The row, the module's design note and the `maximise()` doc comments in `types.d.ts` and the module now say what the code does: Escape restores the window from anywhere inside it, a focused grid body cell or column heading included, unless an open editor or menu has already used the key, and focus then lands on the window's maximise control. No behaviour changed.

### Internal

- **`npm test` reported green having run zero tests** (BACKLOG-0001136). *This is a change to the repository's own test entry and gate — `tools/testsuite.js` — and not to anything shipped in the published bundles.* `node --test` treats every argument as a pattern and silently drops one that matches nothing: a real file plus a missing one exited 0 with `# pass 1` and never mentioned the missing file, and a glob the shell did not expand exited 0 with a fully green `# tests 0`. So a rename, a typo, or a shell without glob expansion produced a confident pass with nothing run. The gate's classifier had the same hole — `tests: 0, fail: 0, status: 0` read as green.
  - **A run that executed zero tests is now a no-verdict, not a pass** — the same third state BACKLOG-0001113 introduced for a runner fault, because in both cases nothing was judged. Every path handed to the runner must exist; any that does not is named, the runner is not spawned, and the exit is 1. A run that comes back with `# tests 0` is a no-verdict whatever its exit status. Neither is retried: a re-run cannot make a path exist.
  - **`npm test` now routes through `node tools/testsuite.js test/*.test.js`** so the command developers run by hand gets the same classification as `tools/check.js`. The runner's output is captured and printed once the run is over rather than streamed live; a `PASS:`/`FAIL:` verdict line follows it. `npm run all` uses the same entry.
  - **Not changed.** A non-zero exit with `# tests 0` is still red, as before. A suite where every test is skipped (`# tests N # skipped N`) still reads as green; that is a separate gap.

- **The load-aware perf gate's CHANGELOG entry claimed more than it delivers in CI, and a green reached with no calibration reference read the same as one reached with it** (BACKLOG-0001151). *This is a change to the repository's own gate and to the claim made about it, not to anything shipped in the published bundles.* The 1.54.0 entry for BACKLOG-0001077 said `--require-perf-verdict` "stops a noisy runner reporting green having measured nothing". That is true only for the **heavy** load regime. The fitness probe has two arms: a CPU-share floor that needs no reference and detects heavy oversubscription, and a calibration ratio against this machine's own best-ever reading, which is the only arm sensitive to the **moderate** regime that produced 1077's three false reds. The reference lives in `bench/.calibration.json`, which is machine-local and gitignored, and `.github/workflows/perf.yml` neither caches nor restores it, so on every CI run today `probe()` finds no reference and the calibration arm can never fire. Narrowed claim: **the load-aware gate detects heavy load anywhere, and moderate load only where a calibration reference exists** — a workstation that has run the bench before. QA on 1077 found this.
  - **The gate now says so itself.** When `probe()` finds no calibration reference, the printed verdict line — green or red — states that machine fitness was not assessed, that only heavy load was detectable via the CPU-share floor, and that moderate load is undetected. Before, only the red path narrowed its claim ("fitness was NOT established") and the green path said nothing. The verdict (`ok`, `skipped`, exit code) is unchanged; only the text is. `perf.yml` carries the same statement beside the CPU-share floor, and the `tools/loadprobe.js` module note no longer implies the CI case is fully covered.
  - **Not done here, deliberately.** Caching the calibration reference in CI, calibrating in the same run, and the per-runner baseline are BACKLOG-0001129.

- **The completeness report said "0 of 714 capabilities have an executed example" under a table crediting 659 of them** (BACKLOG-0001156). *Recognise your own case: `node tools/capabilities.js --completeness` ended with a zero that never moved while the "Canonical example" column climbed.* The sentence was a string literal written before any block was tagged. It is now derived from the same predicate the column is, so the two cannot disagree, and it states the remainder alongside the credit. A test asserts the sentence equals what the table adds up to, once against the live registry and once against a fabricated one, so a literal that happens to match today's count fails too.

- **Two task branches that each added a changelog entry always conflicted in `CHANGELOG.md`, and a rebase could carry an `[Unreleased]` entry into a section already tagged** (BACKLOG-0001166). Every card inserted at the top of `## [Unreleased]`, so with two developers working at once every second merge was a hand-resolved conflict in the one file. Each card now writes its entry to its own file, `changelog.d/BACKLOG-<7 digits>.md` (format in `changelog.d/README.md`), and the release cut runs `node tools/changelog.js fold <X.Y.Z> [date]`, which inserts `## [X.Y.Z] - date` at the top of `CHANGELOG.md` holding any `[Unreleased]` bullets plus every fragment, grouped by section in a fixed order and sorted by card number within a section, then deletes the folded fragments. Folding is deterministic (the same inputs give byte-identical output) and running it again on its result is a no-op. `node tools/changelog.js check` names any malformed fragment, and `tools/check.js` runs it as a gate beside the existing `CHANGELOG.md` heading check, which is unchanged. Tooling only: nothing in the shipped bundle changes.

## [1.54.0] - 2026-09-11

### Added

- **A KPI tile whose filter reads a grid column now counts the rows instead of reporting a confident zero** (BACKLOG-0001144). *Read this if you use `modules/kpi` bound to a `grid`. Nothing changes for a panel over a plain `rows` array, or for a grid-bound panel whose filters only read fields its tiles already declare: `fields` is additive and the behaviour is asserted against 1.53.0.*
  - **The symptom.** `filter: (r) => r.priority === 'P1'` on a grid that genuinely has a `priority` column matched nothing and the tile read **0**, beside a grid full of P1 rows. Nothing warned. Our own marketeer shipped exactly that on a dashboard demo and caught it by eye before deploy.
  - **The cause.** A grid-bound panel does not hand a filter a grid row. It materialises a **projection** of each row through the grid's value pipeline, carrying the row key plus the fields the *tiles* declare — which is what keeps a refresh over a large grid cheap. Any other column read `undefined`, so the predicate was false for every row and the count was a real, correct count of nothing. You had to know an undocumented internal rule to write a filter that worked.
  - **`fields` declares the extra columns.** `createKPI(el, { grid, fields: ['priority'], tiles: [...] })` projects them alongside whatever the tiles already name. Explicit, no magic, and the projection stays narrow — a lazily-resolving row was considered and rejected, because it puts a property trap on every field read of every row of every refresh.
  - **Forget to, and the panel says so — by name.** A read of a column the bound grid *has* but the projection does not now resolves to the real cell **and** warns once: `the "P1 jobs" tile's filter read \`priority\`, which is a column on the bound grid but is not projected — add it to \`fields\``. It names the tile, the column and the fix, and it is keyed on the tile and the field, so one bad filter over a 100,000-row grid produces one line, not 100,000. Two tiles reading the same unprojected column are two separate mistakes and get one line each.
  - **`undefined` on its own is deliberately NOT the trigger, and that is the most load-bearing decision here.** A blank cell in a column you *did* project is a legal value and stays silent. A warning that fires on ordinary sparse data gets muted, and a muted warning gets deleted — at which point it is worth nothing. The condition is *undefined **and** the grid has that column*, asserted by name in both directions.
  - **A `field` naming no column at all is a different fault, and that tile now reports no data instead of a number.** Reducing over a column that does not exist gives `sum` and `count` a **0**, and 0 sits comfortably inside any `lowerIsBetter` threshold a host would set — so warning in the console while leaving a confident green zero on the dashboard would document the lie rather than fix it, and the person harmed is reading the panel, not the console. The tile reports the `unknown` status BACKLOG-0001061 already established for a tile that measured nothing, renders `nullText`, and contributes an explicit `unknown` to any roll-up. It is refused by name with its own message rather than being offered a `fields` fix that cannot work, and it is checked at **first read, not at bind time**, because a dynamic grid's columns arrive after the panel does. The verdict is recomputed at every read, so a tile refused while a grid was still loading is measured again the moment its column lands.
  - **A populated read pays nothing for any of this.** The diagnosis lives on a prototype the projection rows are created over, carrying one accessor per *unprojected* bound column and nothing else. A projected field is an own data property on the row — no trap, no set lookup, no branch — so only a read that would otherwise have returned a silent `undefined` costs anything, and the cells those accessors resolve are memoised for the life of one read. Asserted structurally, not by timing: the test checks that a projected field has no accessor on it and an unprojected one does.
  - **A measured zero is still a measured zero, and this is the line the change had to not cross.** BACKLOG-0001061's rule is untouched: a tile with a real field whose `filter` matches none of 200 healthy rows has measured "no open incidents", which is good news, and it still grades as `good` rather than `unknown`. That is a completely different case from a tile whose field does not exist, and the two are asserted side by side in one test so a change that confuses them fails by name. The 1061 test is green.
  - **Surface.** One declaration added to `packages/core/src/types.d.ts` (`KPIConfig.fields`), documented in `docs/API.html`. The registry count does not move — 857 before and after, verified by running `tools/capabilities.js` — because `collectConfig` reads `export interface *Config|*Options` and every module's interfaces live un-exported inside a `declare module` block. That is the same pre-existing registry gap 1.53.0 and BACKLOG-0001133 recorded, not a gap in this change.
  - **The panel reads the grid defensively, on both surfaces.** `rows.value` has always been asked behind a guard; `columns.all()` is now asked the same way. A grid mid-teardown, a lazy grid or a proxy can throw from it, and D5 is explicit that a KPI panel must not take a customer's page down over one tile. An unreadable column list takes the same path as a grid that has not published its columns yet: no diagnosis, no accessors, and the projection behaves exactly as it did in 1.53.0.
  - **`unknown` now has two causes, and every place that said it had one has been corrected.** The public declaration, the module header, the `UNKNOWN_STATUS` docblock, the `hasData` parameter description and the reference all said `unknown` means "the panel holds no rows at all". This change makes that sentence false, and two of those copies ship inside the bundle. They now read: the panel holds no rows, **or** the tile's `field` names no column on the bound grid. A tile whose `filter` matches nothing is still neither.
  - **The rule all of it serves.** A KPI tile must never report a confident number it did not actually compute.
  - **Cost.** `modules/kpi` grew from 76,656 to 77,618 bytes gzipped: **+962**, measured with `zlib.gzipSync(…, { level: 9 })` over `dist/modules/kpi.esm.min.js`. No new dependency, no new import, and nothing from `packages/dom`.

- **A dashboard window can now be blown up to fill the dashboard, or collapsed to a single row, and put back exactly** (BACKLOG-0001133). *Read this if you use `modules/layout`. Nothing changes for an existing layout: both controls are opt-in and default off, so a dashboard that does not ask for them renders exactly the chrome it did in 1.53.0.*
  - **The problem.** A twelve-window dashboard gave every window a twelfth of the screen and no way to concentrate on one. Maximise/minimise was a named non-goal of the 1.53.0 module, and it is what a user reaches for immediately after rearranging: blow one window up to work in it, then put it back.
  - **`layout.maximise(id)`, `layout.minimise(id)`, `layout.restore(id)`, with `layout.maximised()` and `layout.minimised()` reading the state back.** The controls are opt-in per window — `maximisable`, `minimisable` — each with a layout-level default of the same name, exactly the `closable` precedent, resolved by the same one rule.
  - **Maximise fills the layout host, not the browser window, and that is a deliberate choice you can see.** Filling the viewport means `position: fixed`, whose containing block is the nearest ancestor carrying a `transform`, `filter`, `contain` or `will-change` — so the same rule fills the screen on one page and lands in a 300px box on the next. Answering that means reparenting the window to `document.body`, a placeholder node to hold its space, a body scroll lock and a focus trap. Filling the host needs none of them and cannot disturb the page around the dashboard. Measured in a real browser with a live grid and a live chart in it: a window occupying half of a 900&times;600 host becomes the full 900&times;600 to within a pixel, the grid inside it re-measures more than 300px wider and paints more rows than it did, every other window measures a zero box, and the payload container is the same DOM node throughout.
  - **Escape restores a maximised window**, pressed from anywhere inside the layout, so long as nothing inside has already claimed the key — an open cell editor, a filter menu or a column menu closes first, which is the right reading of one key doing the innermost thing first.
  - **Escape works from inside a grid payload too, as of BACKLOG-0001143 below.** When this module shipped, a grid marked **every** Escape as handled at two independent sites, so an Escape pressed with a grid focused never reached this module's listener and the only way back was the visible restore control. Both sites are fixed in the same release, and `test/layout-browser.test.js` now asserts the working behaviour from a body cell and from a header cell separately, each failing by name if its own site starts claiming an Escape it did not use.
  - **Minimise draws a window as a single row**, hides its payload and keeps its chrome, which carries the way back. On screen the windows below **pull up** into the space under `compact: 'vertical'` — the point of minimising one. **In the arrangement, nothing moves at all:** the collapsed dashboard is a projection of the real one, not a change to it. A window with `chrome: false` is refused by name: there would be nothing left on screen to restore it with.
  - **Restore gives the whole arrangement back, in ANY order — and it is exact by construction, not by argument.** Neither mode writes to a placement: maximise draws one window over the whole canvas, and minimise sets a flag from which the picture is derived. So there is nothing to put back and no order to get wrong. **All 14,400 minimise/restore orderings of a five-window dashboard are asserted by name**, along with the mechanism itself — that a mode never changes the arrangement — so a change that reintroduces the alternative fails on both.
  - **Why that is worth spelling out.** The obvious implementation — collapse the window in the arrangement, remember its four numbers, put them back — is exact **only if windows are restored in the reverse of the order they were minimised**. The remembered row is absolute, so restoring the first-collapsed window while a second is still collapsed puts it back at a row that no longer means the same thing, and two windows trade places. Enumerated over three fixtures, that design drifted on **7,771 of 649,596 orderings**; a user clicking restore buttons does not work last-in-first-out. Recording a *relative* rank instead fails for the same underlying reason, because the rank is read from an already-collapsed dashboard: measured, it fixed two fixtures and took a third from 0 to 122,077 drifting orderings. Leaving the arrangement alone removes the problem rather than managing it.
  - **Neither state is part of `getLayout()`.** A mode is not an arrangement, the same ruling interactivity got in 1.53.0. `getLayout()` and `window(id)` report the arrangement in both states — the placement the window will be drawn at when the mode ends — so saving while a window is maximised or minimised gets the real dashboard back, and `setLayout()` never restores anyone into a mode: an entry naming a minimised window moves it *under* the mode instead of lifting it out, and a partial entry keeps the height it did not name. `setLayout(getLayout())` is a no-op on a dashboard with a window minimised.
  - **`setInteractive()` does not disable either.** Neither mode moves or resizes a window in the arrangement — they change how one is *displayed* — so a locked dashboard can still be blown up to read. A move or resize is refused while a window is in a mode, on all three paths (API, pointer, keyboard), because the mode owns that window's geometry for the duration.
  - **Keyboard-operable to the same standard as the rest of the module.** Both controls are ordinary focusable buttons in the chrome bar, and each changes its own accessible name — "Maximise Pipeline" becomes "Restore Pipeline" — rather than carrying a fixed name beside a state attribute that says the opposite. Every transition is announced on the module's polite live region.
  - **No new event.** The host called the method, so it knows. Zero entries added to `packages/core/src/events/names.js`, the core `EventName` union or `packages/modules/shared/adapter.js`; `layout:changed` fires for a minimise or a restore because the arrangement genuinely changed, and does **not** fire for a maximise because nothing moved.
  - **Not in the capability registry, and that is the same pre-existing gap 1.53.0 recorded.** `tools/capabilities.js` reads config keys from `export interface *Config|*Options` and every module's interfaces live un-exported inside a `declare module` block, so the five new methods and two new config keys are declared, documented, demonstrated and tested while the registry count does not move (857 before and after, verified by running it). The gap belongs to the registry, not to this change.
  - **Cost.** `modules/layout` grew from 75,502 to 77,190 bytes gzipped: **+1,688**, measured with `zlib.gzipSync(…, { level: 9 })` over `dist/modules/layout.esm.min.js`. No new dependency, no new import, and nothing from `packages/dom`.

### Changed

- **A dashboard window now has a chrome bar you can actually see** (BACKLOG-0001146). *Read this if you use `modules/layout`. This is a **visible** change to a module that shipped one release ago: the window chrome's default colour changes from light grey to the brand navy. Nothing else moves — no geometry, no spacing, no type — and a host that had already themed the chrome is unaffected.*
  - **The problem, in one number.** The chrome shipped as `#f7f8f9` on a `#fff` window body: **1.06:1**. On a real dashboard the chrome, the panel it wrapped and the grid inside it were three barely-distinguishable greys, so a user could not see where a window began — fatal for a surface whose whole proposition is *grab this window and move it*. The drag affordance was invisible until you found it by accident.
  - **The new default is `#15205A` with `#FFFFFF` and `#C9C6EF` ink** — 15.15:1 for the title, 9.24:1 for the controls, and **15.15:1 for the chrome against the window body**, well past the 3:1 WCAG 2.2 1.4.11 asks of a boundary that identifies a component. Measured in a real browser off the resolved cascade, not asserted from the source.
  - **Tokens, never a hard-coded hex, because a customer's dashboard is not our website.** Every value is the last rung of a `var()` chain: `--lat-layout-chrome-bg`, `--lat-layout-chrome-ink`, `--lat-layout-chrome-ink-muted`, `--lat-layout-chrome-hover`, `--lat-layout-chrome-focus`. Set one on any ancestor and the chrome follows. The **second** rung of each chain is the module's older general token (`--lat-layout-title`, `--lat-layout-muted`, `--lat-layout-hover`, `--lat-layout-focus`), which is why a host who had already themed the chrome sees exactly what they saw before.
  - **To restore the 1.53.0 look, one rule — but five properties, not one, and the difference matters.** Overriding the ground alone would leave white ink on light grey at 1.06:1, because the inks were chosen against the ground:

    ```css
    .lat-layout {
      --lat-layout-chrome-bg: #f7f8f9;
      --lat-layout-chrome-ink: #14171a;
      --lat-layout-chrome-ink-muted: #586069;
      --lat-layout-chrome-hover: #ebeef1;
      --lat-layout-chrome-focus: #2563eb;
    }
    ```

  - **The controls were the real work, not the background.** Two of the chrome's states were chosen against light grey and break on a dark ground: the focus ring's `#2563eb` measures **2.93:1** on the navy — under 1.4.11's 3:1, so it would all but vanish — and the `#ebeef1` hover would have put a near-white block behind a `#C9C6EF` glyph at 1.41:1. Inside the chrome the ring is now the chrome ink (**15.15:1**) and the hover is `#2C3A7A` (glyph **6.43:1**). Every control — grip, close, maximise, minimise — was measured in a real browser under a real `Tab`, because `:focus-visible` follows the last input modality and a programmatic `focus()` on a page that has never seen a key matches nothing at all, which is how a broken focus state passes a green test.
  - **`--lat-layout-focus` still governs the resize handle**, which still sits on the light window body it was chosen for (5.17:1), and the same is true of the grip on a **chrome-less** window's handlebar: the chrome ink rules are scoped to the chrome bar, because the chrome ink on a white body would be 1.64:1 and would have made the only drag affordance of a chrome-less window invisible. Both are asserted.
  - **Dark mode is a value, not a note.** On a dark host the brand navy is the same defect mirrored — **1.18:1** against the grid theme's `#14181c` background and **1.08:1** against its `#1b2026` surface — and that is reachable with no host action at all, because the grid's own theme darkens on `prefers-color-scheme` while this module's frame does not. A dark context (an explicit `data-theme="dark"` on the layout or any ancestor, or the OS preference where the page has not declared itself light) lifts the ground to `#4E5ED6`: the same hue, raised until it clears 3:1 against both (**3.31:1** and **3.04:1**), with `#FFFFFF` (5.39:1) and `#EFEEFC` (4.70:1) ink. Said plainly: at a ground light enough to be a boundary on black there is very little room left for a *muted* ink, which is why the dark one is a near-white rather than a lilac. Those values are written into internal `*-auto` names, never into the host-facing ones, so **a host's own token still outranks the module's dark rung** — asserted, because declaring the host-facing name inside a `[data-theme]` block is exactly how a theme quietly beats the host who themed it.
  - **Nothing went through `packages/modules/shared/chrome.js`.** That file mirrors a grid's resolved tokens onto sibling chrome and carries type and geometry and deliberately **not** colour; adding a colour there would have silently restyled the tabs strip and the KPI rail. That decision is now a test rather than a comment.
  - **Known, pre-existing, and unchanged by this:** the resize handle and a chrome-less window's grip take `--lat-layout-muted` on the *window body*, whose colour is the host's `--lattice-background`. On a host that darkens that token they measure 2.8:1 — as they did before this change. Set `--lat-layout-muted` alongside it.
  - **Cost.** `modules/layout` grew from 77,190 to 77,513 bytes gzipped: **+323**, measured with `zlib.gzipSync(…, { level: 9 })` over `dist/modules/layout.esm.min.js`. No new dependency, no new import, nothing from `packages/dom`, and no new public capability — the registry count is unchanged at 714 declared (857 records).

### Fixed

- **A live chart no longer shrinks to a single dot because one device's clock runs fast** (BACKLOG-0001123). *Recognise your own case: a line, area or scatter chart on a rolling time window — `axis: { x: { window: { kind: 'time', span } } }` — fed by several producers, that suddenly shows one point in its top-right corner and nothing else, with no empty state and nothing in the console, while the grid beside it is full of recent readings.* One producer stamping its readings ahead of the viewer's clock did it. Measured in Chrome on a 60-second window holding twelve readings five seconds apart plus one from a device two minutes fast: **1** category drawn, **1** row in the accessible table, **1** vertex painted, **0** warnings. The same page after this release: **12** categories, **12** table rows, **12** vertices, and one warning naming the skew.
  - **Why it happened.** A rolling window ends at the wall clock, and a reading stamped ahead of it carried the end forward with it so the newest mark would be drawn. There was no limit to how far, so a reading two minutes ahead moved a one-minute window to `[now + 60 s, now + 120 s]` and every genuinely recent reading — from every other device — fell out of it. Since 1.53.0 (BACKLOG-0001097) readings outside the window are dropped rather than painted off to the left, so the result was a plausible-looking chart with the data gone. BACKLOG-0001088's age warning could not fire: the carried window always contains the reading that carried it.
  - **What changed.** A reading may be up to **a quarter of the window's span** ahead of the viewer's clock and still carry the window — 15 s on a 60 s window, 7.5 s on 30 s. A reading further ahead than that does not move the window at all, and is itself left off the chart. So whatever any one producer's clock says, the most recent three quarters of the window by your clock stay on the chart for everyone else. A producer slightly ahead is unaffected: it still carries the window and is drawn, as it was.
  - **And the chart says so, once per chart.** `[lattice] 1 reading(s) on the x axis "at" were not drawn: stamped up to 120s ahead of this device's clock, which is more than the 15s (25% of the 60s rolling window) a reading may run ahead and still move the window. This is a producer whose clock is wrong, not a window that is too narrow: …` It names the column, the count and the skew, and it says which fault it is, because a reading too far ahead and a reading too old have different fixes — correct the producer's clock (or stamp readings where they are received) rather than widening the window. Readings ageing out of the back of a live window, which happens on every tick by design, do not trigger it.
  - **Why a quarter, and not a whole span.** A bound of one span still lets a reading 59 s ahead of a 60 s window push out everything but the last second — the same defect, one notch down. A quarter caps what one bad clock can cost everyone else at a quarter of the picture, and is still wide enough for the case shipped in 1.49.0 (BACKLOG-0001036): a producer five seconds fast carrying a thirty-second window. A reading past the bound is ignored rather than allowed to carry the window part of the way, because moving the window a quarter-span forward for a reading that is then not drawn would cost a quarter of everyone's readings for nothing.
  - **A chart whose only producer is badly fast shows the empty state**, with the same warning, rather than an empty plot that says nothing. Bounding the carry would otherwise have created exactly that silent blank for a single-device chart. The age warning is not shown in that case, because a reading from the future has no age.
  - **`chart.data().windowed`** counts readings dropped at either edge — aged out of the back, or too far ahead — as one number.
  - **Test changed, disclosed.** BACKLOG-0001097's test `a future-stamped reading carries the window forward with it` pinned a producer *two minutes* fast under a 60 s window and asserted that its one reading survived while the readings from the last minute did not — the defect itself. Its name and its point (a producer slightly ahead carries the window) are kept, and its fixture is now a producer ten seconds fast. The far-future case is asserted separately, by name.
  - **Cost.** `modules/charts` grew from 135,435 to 136,066 bytes gzipped: **+631**, measured with `zlib.gzipSync(…, { level: 9 })` over `dist/modules/charts.esm.min.js`. No new dependency, no new public capability, no change to `types.d.ts`.

- **Escape gets you out of a maximised grid, a presentation and the annotation tool again — the keyboard trap** (BACKLOG-0001143). *Read this if anyone drives your grid from the keyboard, or if your page puts a grid inside anything that closes on Escape. No API changes, no configuration, nothing to migrate.*
  - **The symptom, in the words of someone hitting it.** You maximise the grid, you click a cell, you want out, and you press Escape. Nothing happens. You press it four more times; still nothing. The only way back is to find the restore button with the mouse. The same key pressed with focus **outside** the grid worked fine — so it looked like Escape was broken only when you were actually using the grid, which is the only time you need it. Presentation mode did the same thing. So did a host's own dialog, drawer or lightbox with a grid inside it: your Escape handler simply never fired.
  - **What was happening.** The grid called `preventDefault()` on Escape because a handler for it *existed*, not because it had *done* anything. `preventDefault()` is how one listener tells everything above it "this press is dealt with", and a maximised grid, a presentation and any well-behaved host overlay all stand back when they see it. So Escape with no edit open was consumed and thrown away, every time, and nothing above the grid ever saw it. `packages/dom/src/maximise.js` had written the rule it was breaking in its own header: *a control that fills the screen and offers only one way out is a trap.*
  - **The fix, stated as a rule rather than a patch: an action now reports whether it actually did something,** and only then is the key claimed. That applies to every key the grid maps, not just Escape — `cancel`, `edit`, `select`, `expand`, `sort`, `contextMenu`, `filterMenu`, `columnMenu`, `focusToolPanel` — so the next feature that steps back on `defaultPrevented` does not inherit the same trap.
  - **"Did something" is not the same rule for every key, and the difference is the browser's own default.** Where declining the key would hand the browser a scroll or a history step that fights the grid — Space, the arrows, Home/End — a *refusal* still counts, because the grid considered the key and answered; the announcement "this column cannot be moved" is an answer. Where the key has no useful browser default and its whole job is to reach outward — Escape — only real work counts. **Space is claimed even on an empty grid**, where there is nothing to select: it means nothing to a host, and letting it through would scroll the page a screen away from the focus ring. **Enter is the one to know about:** on a cell that is not editable it now reports nothing done and the key reaches your page, which is what lets a host bind Enter to "open this record" on a read-only grid.
  - **There were TWO places making the claim, and they hid each other.** The grid root mapped Escape to its `cancel` action; and **every header cell** claimed Escape on its own element, before the event reached any ancestor. Fixing the first alone looked like a fix — Escape from a body cell started working — while anyone whose focus was on a column heading stayed exactly as stuck. Both are fixed, and both are asserted separately.
  - **A key the grid does not use now reaches your page.** That is new, and it is what makes a host's own shortcut, modal or drawer work while someone is inside the grid.
  - **Escape on a column heading still returns focus to the data**, as it always did. It just no longer takes the key off the page on the way past.
  - **Proven where the defect lived: a real browser, real CDP key presses, real focus.** Six cases — maximised grid, presentation and the annotation tool, each from a body cell and from a header cell — plus presentation on a grid built with `maximise: false`, which reaches the same trap by a different route, and the compound case of drawing on a maximised grid (the first Escape puts the tool away, the second leaves the mode). A headless companion suite pins the per-key rule, including the cases a browser cannot easily produce. The keys the grid *does* use are walked and asserted still claimed, because "a key that stops being claimed" is the regression a change like this risks.
  - **Cost.** The core bundle grew from 729,382 to 729,465 bytes gzipped: **+83**, measured with `zlib.gzipSync(…, { level: 9 })` over `dist/lattice-grid.esm.min.js`. No new dependency, no new public capability — the registry count is unchanged at 857 records.

### Internal

- **The release gate no longer reports a red it cannot justify when the machine is busy** (BACKLOG-0001077, BACKLOG-0001113). *This is a change to the repository's own gate — `tools/check.js` — and not to anything shipped in the published bundles. Read it if you run `npm run check` on a machine that is doing other work.*
  - **What was wrong, in two different ways.** The perf budget reported `Sort, string column (collated): 842.6ms is REGRESSED 25% over baseline 672.2ms` on three occasions in one day — once on a **completely untouched tree**, once where the only change was CSS in a module the sort kernel never loads. Separately, the suite gate once produced its entire output as `suite is red — ? failing of ? (exit 1)`, naming nothing, while the same tests run directly seconds later reported `# fail 0` and exit 0. A gate that cries wolf teaches whoever runs it to re-run until green, which is the exact habit that lets a real regression through.
  - **One mechanism, two deliberately different policies.** `tools/loadprobe.js` answers "is this machine fit to be measured on?" by timing a fixed calibration kernel against this machine's own best-ever reading. The perf budget, which measures a continuous physical quantity, now reports **`SKIPPED-UNDER-LOAD`** rather than `REGRESSED` when the answer is no — and always prints what it would have said, so a skip can never bury a finding. The **test suite does not skip, ever**: contention does not make a failing test pass, and skipping a correctness gate because the machine is busy is the failure this project exists to remove.
  - **A red always names what failed.** A runner that exits without a parseable TAP summary is now classified as a *no-verdict* — a third state beside pass and fail — reported as `the test runner exited N and produced no parseable output`, with the runner's own last output printed. That output was always captured; the old code held the stack trace that explained the fault and threw it away in favour of `? failing of ?`. A no-verdict is retried once at half concurrency and the retry is disclosed either way; a genuine test failure is never retried.
  - **The baseline was being compared across machine classes, invisibly.** `bench/baseline.json` was recorded on a 2-vCPU EPYC CI runner, and the runner check compared only node/platform/arch — all of which matched — so a 16-core workstation compared against it and looked legitimate. `cpu` and `cores` are now compared and reported too. This is why the collation kernels kept surfacing: they hold only **−14%** and **−18%** of headroom against that baseline where every other kernel holds −27% to −58%, so they cross the threshold first under any load.
  - **Three kernels were never gated at all.** The bench measures 14 kernels; the committed baseline holds 11. The three rolling-window kernels have no baseline entry, so they could neither trip the gate nor catch a regression, and nothing said so. The gate now reports the count of ungated kernels on every run. Adding their baselines is a separate decision, because it means regenerating the baseline on a chosen runner class.
  - **`--require-perf-verdict`** makes a `SKIPPED-UNDER-LOAD` fatal, so a release cut cannot tag a version whose perf budget was never actually measured. It is passed by the two runs that must reach a verdict and by nothing else: the new **`npm run check:release`**, which is the run made on `main` immediately before a version tag is pushed, and the CI perf job, whose only purpose is to produce a perf verdict and which would otherwise report green on a runner that fell below the **CPU-share floor** — a job getting less than 90% of a core — having measured nothing. `npm run check` and `npm run all` deliberately still accept a skip — a loaded developer box is the case the skip exists for.
  - **What that flag does NOT catch in CI, stated plainly.** The fitness probe has two arms, and only one of them can fire on a CI runner. The calibration-ratio arm compares against *this machine's own best-ever reading*, held in `bench/.calibration.json`, which is machine-local, gitignored and not cached or restored by `.github/workflows/perf.yml` — so an ephemeral runner never has a reference, the probe returns "fitness not established" rather than a ratio, and the ratio arm cannot fire. That leaves only the CPU-share floor, and the note in `tools/loadprobe.js` is explicit that CPU share detects the heavy regime and is blind to the **moderate** one (8 competing threads on 16 cores: reference kernel 2.3× slower, CPU share 1.013 against 1.012 idle) — which is the regime that produced BACKLOG-0001077's false reds in the first place. So on a CI runner the original false red is still fully live. This is a limitation of the design, not something this change fixes, and it is carded separately.
  - **No flag the gate accepts could be passed to it at all.** `tools/check.js` imports `tools/gen-keyboard-docs.mjs` for the generated keyboard map, and that module's top-level rewrite loop ran on import against *the importer's* `process.argv` — so `node tools/check.js --require-signing-key`, `--require-perf` or `--require-perf-verdict` died with `ENOENT: no such file or directory, open '--require-perf-verdict'` before the flag was read. Found while wiring `--require-perf-verdict` up; it predates this change and is present on `main`. The loop now runs only when that file is the program being run. The worse half was live rather than theoretical: an argument naming a file that carries the map's two marker comments **was rewritten by a run of the gate, which then exited 0** — reproduced on `main` against a committed deploy artefact (`node --expose-gc tools/check.js public_npm/docs/api-detail.html` → file rewritten, `REAL_EXIT=0`, gate reported green). Not quite silent, in fairness: it emits one `updated <path>` line, at the very top of a 2,000-line run, above the gate's own banner, on a green exit.
  - **The perf verdict is printed even when the run is red for some other reason.** It used to be printed only in the all-green summary and under `if (!perf.ok)`; a `SKIPPED-UNDER-LOAD` is `ok: true`, so on any run where something else failed the perf line — including the `it would otherwise have reported:` disclosure that stops a skip burying a finding — was dropped entirely. That is precisely the run where it is most worth reading.

## [1.53.0] - 2026-09-10

### Added

- **A dashboard can now be unlocked for editing and locked again at runtime, without being torn down and rebuilt** (BACKLOG-0001132). *Read this if you use `modules/layout`. Nothing changes for an existing layout: with no layout-level flag set, every window resolves exactly as it did in 1.52.0, asserted against that tree rather than eyeballed.*
  - **The problem.** `movable`, `resizable` and `closable` were read once, when a window was created. So an application could not offer an **"Edit layout"** button that unlocks the dashboard, lets the user rearrange it, then locks it and saves `getLayout()` — the only route was `destroy()` and rebuild, which throws away every grid, chart and board mounted in a window. And unlocking twelve windows meant repeating two flags twelve times, where a window that missed one mysteriously would not move and nothing said so.
  - **`layout.setInteractive(value)` and `layout.getInteractive()`.** `setInteractive(false)` locks everything; `setInteractive(true)` unlocks; `setInteractive({ movable: true, resizable: false })` sets only the capabilities it names. Nothing is destroyed and no frame is rebuilt, so every payload survives the toggle — measured in a real browser, with the payload's own DOM node still present after unlock, a 300px drag and a re-lock.
  - **Locking always wins; unlocking never overrides an opt-out.** `setInteractive(false)` locks **every** window, including one whose own spec says `movable: true`, so a host can hard-lock a dashboard in one call without auditing twelve window specs. `setInteractive(true)` unlocks only windows that have not opted out, so a masthead declared `movable: false` stays pinned when the user presses "Edit layout". One rule: you can always take a capability away; you can never grant one where the developer said no. The asymmetry is deliberate and is stated on the method.
  - **`closable`, `movable` and `resizable` also take a layout-level default** of the same name, alongside `padding` and `compact`. A window's own boolean still wins, and an explicit `false` beats a layout-level `true`. Presence, not truthiness: `0`, `'false'`, `null` and `'yes'` are not booleans, so they are not opt-outs and fall through to the default.
  - **`config.movable: false` and `setInteractive(false)` are deliberately different, and this is the one thing to read twice.** The config key states the **default** for windows that declare nothing — and `false` is already that default — so it takes nothing away from a window that declared `movable: true`. `setInteractive(false)` is an **active lock**: it pins every window whatever its own spec says. `getInteractive()` therefore reports three states, not two — `undefined` where no layout-level default is in force, `true`, or `false` for a lock — because reporting "unset" as `false` reads correctly and round-trips wrongly: fed straight back, it would lock a dashboard nobody asked to lock. `setInteractive(getInteractive())` is a **no-op in every state**, asserted by name including on a fresh layout, and a key carrying `undefined` means "leave this capability alone".
  - **Both halves of the enforcement move together.** Interactivity is enforced in two independent places — the handles a window renders, and the checks the pointer and keyboard gesture paths make — and a toggle updates both. Removing a handle stops a mouse; only the gesture check stops a keyboard user already standing on one. Each direction is asserted separately, and a gesture already in flight on a window that has just been locked is ended without committing.
  - **Focus is not dropped.** If the handle a keyboard user is standing on is removed by `setInteractive(false)`, focus lands on the window frame rather than on the document body, which would otherwise dump them at the top of the page. Verified against a real focus ring, not a test double's approximation of one.
  - **Interactivity is a mode, not an arrangement.** `getLayout()` does not carry these fields and `setLayout()` does not read them, so restoring a saved dashboard never silently restores "arrange mode". No event fires — the host called `setInteractive`, so it already knows — and no new event name was added.
  - **A locked layout is not a read-only dashboard.** This module creates the payload container and never reads or writes its contents, so `setInteractive(false)` fixes the *windows* and changes nothing inside them: a grid in a window is made read-only with the grid's own settings. A dashboard that must not be edited is two decisions, not one.
  - **Not in the capability registry, and that is not an oversight here.** `tools/capabilities.js` reads config keys from `export interface *Config|*Options` and methods from the core `Grid` class, and every module's config interface inside a `declare module` block is non-exported — kanban's, the KPI panel's, the AI layer's, the tab strip's and this one's alike. So `setInteractive`, `getInteractive` and the three new config keys are declared, documented, demonstrated and tested, but the registry count does not move for them (857 reachable / 714 public, before and after). That gap is a pre-existing property of the registry rather than of this change, and it is tracked separately.
  - **Cost.** `modules/layout` grew from 74,383 to 75,502 bytes gzipped: **+1,119**, measured with `zlib.gzipSync(…, { level: 9 })` over `dist/modules/layout.esm.min.js`, which is the method `tools/build.js` reports with. No new dependency and no new import.

- **The KPI tree's leaves now carry a small meter beside the value, its headings say they open, and the whole panel follows the grid it belongs to** (BACKLOG-0001119). *Read this if you use `modules/kpi` — **either mode**. The rail changes most, but the type change below applies to a flat stat-tile panel too, and a panel with no grid moves from the page's font to the module's 13px default. Both are one CSS property to restore: see the escape hatch below.*
  - **What you get.** Every leaf on a rail draws a small fixed-scale bar beside its reading; every heading carries a `+` when shut and a `−` when open; and a panel given a `grid` renders at that grid's own type and row rhythm instead of the host page's font. The rail was a column of numbers in the page's 16px type with a grey triangle at the top of each group, beside a grid painting its cells at 12.7px.
  - **The bar's scale comes only from what the tile already declares.** No new configuration key. A `bands` list states its own ends and is taken at its word. `thresholds` states two interior cut points, and a lone `target` states one point, so in those cases the open end is anchored at the **origin**: `{ warn: 70, critical: 90 }` measures 0–90, and `target: 4000` measures 0 to the target. The value is placed by exactly the mapping the grid's own conditional-formatting data bar uses — `clamp((x - lo) / span) * 100` — asserted against the shipped `compileRules` data bar across 21 value/scale pairs, so one number cannot draw two different lengths in two places in the product.
  - **A tile that declares no scale gets no bar.** No bands, no thresholds, no target means there is nothing to measure against, so the leaf shows its value and nothing else. The scale is deliberately **not** derived from the data either: a bar scaled to whatever is currently in the panel would mean something different on every refresh, which is the same class of error as grading an unmeasured zero (BACKLOG-0001061). A leaf without a bar still **reserves the bar's width**, so the readings stay in one column whether or not there is a meter beside them.
  - **Nothing measured does not draw as a measured zero.** A leaf at the bottom of its scale is a solid track with a fill of no length. A leaf that measured nothing is a **dashed empty outline with no fill element at all** — the dashed edge this module already uses for `unknown`. Two different facts, two different pictures, and the `○` glyph and the "No data" caption still say it in shape and in words.
  - **Colour reinforces the status; it never carries it.** The fill takes the leaf's own `good`/`warn`/`critical` colour, and the shape glyphs (`●` `▲` `■` `○`) are untouched (WCAG 1.4.1). A leaf with a scale but no bands — a bare `target` — gets a neutral fill rather than a colour it has not earned.
  - **The `+`/`−` marker is decoration only.** `aria-expanded` on the node is what states the same thing to a screen reader, so the marker is `aria-hidden` exactly as the status shape is, and a node's announced name is byte-for-byte what it was ("Compute, 3 items, worst status critical"). A leaf keeps the marker's width as an empty spacer, so status shapes and labels stay in one column whether or not the row beside them opens.
  - **The panel follows its grid's type and density, not the page's — and this applies to a flat stat-tile panel as well as to a tree rail.** *A visible change on every KPI panel, and the one thing in this entry most likely to surprise you.* The panel declared `font: inherit` on its root — the same line, in the same module family, that BACKLOG-0001057 fixed for the tab strip — so a 16px page drew a 16px panel beside a grid painting its cells at 12.7px. **A flat strip beside a grid has exactly that defect too**, which is why the fix is not scoped to the tree: fixing one surface of a module and leaving its sibling inert is the failure mode this release has spent its time removing, not adding to. Type now reads `--lat-kpi-* > --lattice-* > --lat-chrome-* > 13px`, and a panel configured with a `grid` mirrors that grid's **resolved** tokens across in JS (`modules/shared/chrome.js`, the mechanism BACKLOG-0001060 built for the tab strip), because a grid's `density` lands on the grid root — a *descendant* of a panel mounted beside it — and custom properties inherit downward only. Measured in Chrome on a 16px page: panel type and grid cell type are now identical at `compact` (12.7px), `comfortable` (14px) and `spacious` (15px), and a leaf row sits at **1.00×** the grid's own row height at all three. `grid.set('density', …)` on a live grid moves the panel with it, and `destroy()` clears every property the adoption wrote.
  - **If you had a panel with NO grid, its type changes from your page's font to 13px — here is how to put it back.** This is the case with no grid to match, so nothing is inherited and the module's own default applies: a panel over a plain `rows` array or driven by the Data Router now renders at **13px** where it used to render at whatever the surrounding page set (16px, on a default page), with a 22px leaf row. To pin it to whatever you want, set **one** custom property, with an explicit value: `--lat-kpi-font-size: 16px` on the panel or any ancestor is the per-module override and out-ranks everything, including a grid the panel is bound to (measured: 18px on a panel beside a `spacious` grid). `--lattice-font-size` on an ancestor also still out-ranks the mirrored value — the retheme escape hatch 1057 shipped, gated both ways at 19px. `--lat-kpi-font-family`, `--lat-kpi-line-height` and `--lat-kpi-row-height` are the same shape (`--lat-kpi-row-height: 40px` measured 40px). **Give these a real value, not `inherit`**: a CSS-wide keyword arriving through a `var()` substitution does not do what it looks like it does — measured, `--lat-kpi-font-size: inherit` left the panel at 13px rather than taking the page's 14px.
  - **A panel with no grid adopts nothing, and cannot be moved by a grid it was not given.** Two of the three input modes have no grid at all — a plain `rows` array and the router-driven panel — and a headless panel (`el` is `null`) has nothing to publish onto. All three mirror no token, take the defaults above, and are unaffected by any grid standing next to them; each is gated, headless and in a real browser.
  - **Reading it from code.** Each tile model gained `bar`: `{ lo, hi, percent }`, or `null` when the tile declares no scale, with `percent` `null` when there is no reading to place. Additive — nothing else in the model moved.
  - **Cost.** `modules/kpi` grew from 310,804 to 317,512 bytes raw and from 75,056 to 76,703 gzipped: **+1,647 gzipped**, measured with `zlib.gzipSync(…, { level: 9 })` over `dist/modules/kpi.min.js`, which is the method `tools/build.js` reports with (`gzip -9` over the same bytes on stdin gives 74,471 → 76,109, +1,638). No new dependency: the bar is a `<div>` at a percentage width inside a track, implemented locally in the same way the module's sparkline already is, and the one new import is the in-repo `modules/shared/chrome.js` the tab strip already ships. Reaching the shipped `compileDataBar` instead would have meant a public-surface change and inlining the whole conditional-formatting rule engine — 4,356 gzipped — for a gradient that draws the wrong thing.

### Fixed

- **A derived panel or a KPI tile beside a *sorted* grid could be left silently and permanently wrong after a filter was cleared** (BACKLOG-0001094). *Read this if you have a grid with `state.sort` set and anything reading from it — a summary panel, a `createStat` tile, a KPI strip, a tab — and more rows than the worker threshold (50,000 by default).*
  - **Recognise your own case.** A sorted grid of 100,000 rows with a derived panel beside it (`source: { mode: 'derived', from: grid, follow: 'filtered', … }`), or a `createStat` tile reading it. Filter the grid to one category, then clear the filter. The grid goes back to all 100,000 rows. The panel and the tile do not: measured in Chrome at 100,000 rows across five categories, after clearing the filter the grid showed **100,000 rows** while the panel showed **one category totalling 20,000** and the tile read **20,000** — and both stayed there for the life of the page. Nothing warned, nothing errored, and the numbers were internally consistent, just answers to the previous question. If your panel or your KPI strip has ever "looked a bit low after unfiltering", this was why.
  - **Why the sort mattered.** Above the worker threshold the sort recomputes off the main thread, and while it does the grid keeps serving the row order built for the *previous* query — which is a coherent snapshot, and is deliberate. But the sort is re-run when the **filter** changes too, so for the length of that round trip the rows being served are the rows of the *old* filter. The grid itself recovered when the new order landed. A derived source did not: it re-read on `filter:changed`, which fires *before* the grid has finished applying the filter, and because no data had changed there was no `rows:changed` afterwards to tell it to read again. With no sort applied there is no round trip and nothing was ever wrong, which is why this only ever appeared on sorted grids.
  - **What changed.** Anything that follows a grid's filtered rows now also follows the grid's *settle* — the `model:changed` that announces the fresh order has landed (`reason: 'pipeline:sort'` or `'pipeline:sort:error'`). Wherever `filter:changed` was already watched, the settle is watched with it: in a derived source, on the parent, on a `join` partner, on a `statistics: { with }` peer and on each member of a union; and in `createStat`, alongside the `rows:changed` / `filter:changed` / `selection:changed` it already followed. It is gated to those two reasons, so an expand, a collapse, a page or a locale change still does not re-read anything. A tile built with `live: false` is unchanged: it follows nothing, as before.
  - **Direction depends on your threshold, and both directions were affected.** Which side breaks is decided by whether the row set *after* the filter clears the threshold. At the shipped 50,000 default with 100,000 rows, narrowing to 20,000 stayed synchronous and was correct; clearing the filter crossed back over 50,000 and was wrong. Lower the threshold and the narrowing direction breaks the same way — worse, in fact, since the panel then counts rows the filter has excluded. Both are covered.
  - **`grid.rows.refresh()` was never a way out of this, and neither was re-sorting.** `rows.refresh()` asks the renderer to paint again; it does not re-read the source, so on either grid it changed nothing. Re-sorting the parent, and reloading, did not reach the derivation either. The only thing that worked was re-applying the filter *after* the grid had settled — i.e. the host detecting the inconsistency and papering over it. If you are carrying a reconciliation loop for this, you can delete it.
  - **Proven where it broke, not only where it is convenient to assert.** Both halves are covered by a real-browser test at 100,000 rows driving the shipped bundle with a real Worker at the shipped 50,000 default threshold; it fails against 1.52.0 and passes against this release. A headless assertion cannot see this defect at all — Node has no browser `Worker`, so the off-thread sort that causes it never runs there.
- **A chart no longer paints its series outside its own plot, over the axis gutter and over whatever sits beside it on the page** (BACKLOG-0001097). *Recognise your own case: a line, area, bar or scatter chart on a rolling time window — `axis: { x: { window: { kind: 'time', span } } }` — whose series line runs left past the y axis, through the tick labels, and in the worst case straight across a neighbouring chart and off the page.* It happens to any live chart that was **seeded with history**: the readings older than the window were still bound and still drawn, at coordinates the window puts far to the left of the plot. Measured in a real browser on a chart seeded at `[600s, 120s, 40s, 20s, 5s]` under a 60-second span: the painted path's own bounding box started at viewport x **−2721** while its `<svg>` started at **337** — about 3,000 pixels of series line across everything to its left. The same page after this release: **x 513**, inside the plot. Two shorter spans measured the same way went from **−6190** (45 s) and **−4456** (60 s) to **434** and **513**.
  - **Why it painted at all.** The plot `<svg>` is `overflow: visible`, and has to be — a rotated x label, an axis title and an annotation callout all sit outside the plot rectangle on purpose. **A `viewBox` does not clip**; `overflow` decides that. So anything computed outside the box was painted anyway.
  - **Two changes, and the first is the one that matters.** A reading a rolling window has already scrolled past is now **dropped** rather than drawn and then hidden — the same rule BACKLOG-0001088 set when it made an empty reduction a gap rather than a zero. A drawn-then-hidden reading is still in the exported SVG, still in the accessible table and still a candidate for the nearest-point tooltip: a reading the chart says it is not showing and behaves as though it is. Separately, the **marks** group is now clipped to the plot rectangle, so nothing a chart computes outside its box can reach the page whatever the cause — an explicit `axis.y.min`, or a defect not yet found.
  - **Decoration is deliberately not clipped, and was checked rather than assumed.** The clip is on the marks group alone; tick labels, axis titles, data labels, reference lines, annotations and trendlines are drawn into their own groups and are untouched. A control chart carrying edge data labels, an event annotation, a shaded band, a reference line, a linear trend with a six-step forecast and a moving average measures **identically** before and after, including the forecast band that legitimately overhangs the plot by 395px. Clipping the whole `<svg>` instead would have cut that band off.
  - **What you may notice: an empty strip down the left of the plot, up to one whole sample interval wide.** The line now starts at the **first reading inside the window** rather than being drawn in from off-canvas, and nothing is interpolated onto the boundary — inventing a reading at an instant nothing was reported is the defect, not the fix. The strip is at most one interval — `interval ÷ span` of the plot width — and it is **exactly one whenever the interval divides the span evenly**, because the window ends at the wall clock a few milliseconds after the newest reading and that pushes the boundary reading just outside; where it does not divide evenly the strip is `span % interval` instead. Measured in Chrome on a 447px plot under a 60-second span, each feed seeded with ten minutes of history: **1s readings → 2.2px (0.5%)**, **5s → 31.9px (7.1%)**, **25s → 69.1px (15.5%)**, **20s → 143.6px (32.1%)** — every one just under `interval ÷ span`, which is the bound. So a feed sampling once a second is imperceptible, and **a feed sampling every 20 seconds leaves a third of the chart permanently empty, with the gridlines still running through it**. It does not look broken, and it is the honest picture of a window whose earliest part has no reading in it — but if that strip is not acceptable to you, sample faster, or set `span` a little beyond a whole multiple of your interval — `61_000` rather than `60_000` for 20-second readings — which keeps the boundary reading inside the window.
  - The y axis also now fits the readings the window actually shows, rather than being stretched by readings that scrolled off — in the reproduction above, `40–65` became `58–64`.
  - Unchanged: a window that has outrun **all** of its data still shows the empty state and still warns with the age (BACKLOG-0001088); a banded x axis, which already ignores the window, still ignores it; charts with no window drop nothing.

### Added

- **A reconfigurable dashboard surface: `modules/layout`** (BACKLOG-0001108). *The thing a customer currently reaches for GridStack or react-grid-layout to get, which means a second dependency, a second sizing model, and a seam where our own viewers do not resize properly.* `createLayout(el, config)` divides an element into `columns` &times; `rows` cells and places **windows** on it by 1-based `{ xPos, yPos, xSize, ySize }`. A window can be moved, resized and closed — **by drag or by keyboard, to the same standard** — and `getLayout()` / `setLayout()` round-trip the whole arrangement as plain JSON. Opt-in, zero dependencies, UMD global `LatticeGridLayout`, and **9,920 bytes gzipped of its own code** because it imports no engine code at all — not even `createGrid`. (Measured: a 74,220-byte bundle over a 62,206-byte fixed floor that every module pays, of which 2,094 bytes are the two shared helpers it uses.)
  - **It is payload-agnostic, and that is the design.** A window body is a `div` with an `id` that the module creates, sizes, and never reads or writes. It tells a payload it was resized by emitting `window:resized` with the measured content box; it **never calls into a payload**, because it cannot know what one is. Closing a window hands the container back on `window:closed` and does **not** destroy what you mounted inside it — that lifecycle is yours, and a leaked grid per closed window is the obvious failure.
  - **Two independent overflow axes, and what "maintaining their sizing" costs.** `overflowX` and `overflowY` are each `'static'` or `'scroll'`, because a dashboard that scrolls both ways is ordinary and one enum cannot express it. A **static** axis divides the container with `minmax(0, 1fr)` — never a bare `1fr`, whose implicit `auto` minimum lets one stubborn payload drag a track past the container. A **scrolling** axis repeats a *fixed* track (`columnWidth` / `rowHeight`) and the canvas extends past the viewport. Measured in a real browser: ten 200px columns in a 600px host paint at 200px each over a 2000px canvas, and **shrinking the host to 300px leaves the column at 200px** and scrolls further, rather than shrinking every column to fit.
  - **Spacing takes a real CSS length**, including the `px` suffix: a number of pixels, or `'200px'`, `'25%'`, `'1fr'`, `'2rem'`, `'10vh'`. Percentages that sum past 100 overflow and scroll rather than being silently scaled down. Anything outside that vocabulary — including `calc()` and `var()` — is refused by name with one warning and replaced by the default, because the value reaches an inline style.
  - **Keyboard parity with the drag, not a lesser version of it.** Every movable or resizable window carries a focusable handle running the full grab / move / drop / cancel model, with a polite live region announcing **grabbed**, every tentative position with its column and row, **dropped**, **cancelled**, and **reverted** when a handler vetoes the drop. Focus returns to the handle afterwards. A window with `chrome: false` still gets a handle, because a movable window a keyboard user cannot move is not movable.
  - **Idle cost, measured rather than claimed** (`bench/layout-idle.mjs`, real Chrome, 8 seconds): a twelve-window layout is **indistinguishable from a page with no layout module on it at all**. Twelve windows with empty payloads, twelve *independent* live grids in them, and a single lone grid with no layout module all sit in the same few-millisecond band — under a tenth of one percent of a core, and too close together for the measurement to separate them (see below). One `ResizeObserver` for the whole layout, over two targets, never one per window; no timer, no frame loop, no polling. Drag progress is deliberately not emitted per frame and displaced windows are not re-laid-out mid-gesture, because moving twelve live viewers at pointer rate is exactly the busy-dashboard failure this is here to rule out.
  - **The one figure that is a result rather than noise, and it is not this module's.** Twelve grids *derived* from one shared parent filtered at 20Hz cost **3,155–3,409ms** over the same 8 seconds — several hundred times the quiet band, and stable across seven runs on two machines. (The quiet configurations are not: seven runs of those land between 3.1ms and 9.0ms and the ordering between them inverts run to run, so this changelog states the band and declines to put a number on a difference the instrument cannot resolve.) The cause is in the engine: `packages/core/src/grid.js`'s `rows:changed` listener re-refreshes a derived grid on every parent change and bypasses `grid.updates.pause()`, which holds only the streaming-ingestion path. The tabs module documented the same gap; this is the second consumer to hit it.
  - **A second exception, also named:** a grid column declared as a **percentage** (`layout: { width: '50%' }`) is resolved against the viewport width once and never re-resolved, so halving a window leaves the column wider than the viewport it sits in — 800px host &rarr; 783px viewport, 391px column; 400px host &rarr; 383px viewport, **still** a 391px column. This reproduces on a plain grid in a plain resized `div` with no module loaded, so it is not caused by the layout module. **Until it is fixed, size grid columns inside a resizable window in pixels or with `flex`, not with percentages.** The grid, chart, Gantt, kanban and KPI all otherwise follow their container correctly, each one executed in `test/layout-browser.test.js` rather than asserted.
  - **Not in v1, said plainly:** horizontal compaction; per-frame drag events; nested layouts; window maximise/minimise; tabbed windows (that is `modules/tabs`); and **responsive breakpoints — a twelve-window dashboard on a phone is unsolved, and this does not pretend otherwise**.

### Internal

- **One shared implementation of the cancellable before-event contract, instead of a fourth hand-copy of it** (BACKLOG-0001099, first half). `packages/modules/shared/emitter.js` implements the six rules `packages/core/src/events/bus.js` defines — `preventDefault(reason?)` or a legacy `return false`; every thenable awaited; veto wins including a throw, which is also surfaced through `warnOnce`; **`true` returned synchronously when nothing is listening**, so a choke point keeps its original synchronous path byte-for-byte; `payload.reason` written on a veto; and the `'*'` wildcard deliberately never delivered a before-event. Each of those six is mutation-checked by a test named for it. The tabs, kanban and Gantt modules each still carry their own copy and are **deliberately not migrated here** — swapping the dispatcher underneath three live veto paths is its own change with its own evidence. Three of the four copies had already drifted: tabs swallows a throwing handler silently where core, kanban and Gantt all surface it, and none of the three delivers a wildcard at all.
- `packages/modules/shared/autosize.js` gains `watchBox`, the two-dimensional sibling of `watchSize`, keeping both of that file's traps (a zero box is not a size; compare against what was drawn, not what was measured). `watchSize` reads one number, so a consumer that cares about both axes would silently drop a pure height change. Additive; the Gantt is untouched.

## [1.52.0] - 2026-09-10

### Breaking

- **A `Date` carrying a time of day is no longer truncated to a calendar day on ingest — an undeclared column of `Date` values now infers as `datetime` instead of `date`** (BACKLOG-0001087). *Read this if you pass JavaScript `Date` objects as row values and do **not** declare `type` on that column.*
  - **Recognise your own case.** Rows carrying `new Date()`, `new Date(epochMs)` or any `Date` with a clock on it, in a column declared as just `{ field: 'ts' }`. Before, every such value stored as `"2026-09-09"`, so every reading inside one day became the same stored value. Measured on six readings ten seconds apart, before → after: the column's inferred type `date` → `datetime`; the stored value `"2026-09-09"` → `"2026-09-09T18:37:10"`; **distinct stored values 1 → 6**; a sort on the column was a no-op inside the day and is now chronological (ascending returned the rows in arrival order before, in time order now); the displayed text `Sep 9, 2026` → `Sep 9, 2026, 6:38 PM`; the Excel number format `yyyy-mm-dd` → `yyyy-mm-dd hh:mm`. A single-day series charted from such a column had **one category, therefore one point, which strokes nothing, under fully-drawn axes** — that is how this was found. Anywhere the column's distinct values are enumerated follows those stored values, grouping most visibly — see the next point, which is the one to read before you upgrade.
  - **Not affected, checked rather than assumed:** a source's `maxAge` / `ageBy` retention reads the **raw row** value, not the stored one, so eviction timing is unchanged either way. Sub-second resolution is still not retained: `datetime` stores to the second (`YYYY-MM-DDTHH:mm`, plus seconds when non-zero), so milliseconds decide `date` versus `datetime` but are not themselves kept — bind epoch milliseconds, or `type: 'timestamp'`, for a column that needs them.
  - **If you group by an undeclared `Date` column, that grouping collapses to one group per row.** This is the migration that will actually bite, and it does not look like a bug from the inside — it looks like the grouping got *finer*. A saved "group by Raised" view is not refined by this change, it is destroyed: every row becomes its own group, and the rendered row count roughly doubles because each row now carries a group header. Measured on 40 support tickets spread over three days with `createdAt` an undeclared `Date`: **4 groups → 40 groups, 44 rendered rows → 80.** **Declare `type: 'date'` on that column to keep day buckets** — that is the whole fix, and it restores the previous behaviour exactly.
  - **Filtering is unaffected — date filters return identical row sets.** Also measured on those 40 tickets, before against after: `eq 2026-09-08` **14 rows / 14 rows**, `gte` **31 / 31**, `lte` **23 / 23**, `between` **23 / 23**, the same tickets in the same order in every case. A date filter compares on the day either way, so a filtered view, a saved filter and a quick filter all behave as they did.
  - **What decides it.** A `Date` whose **local** wall clock reads exactly `00:00:00.000` still infers as `date` and still stores `YYYY-MM-DD`; anything else infers as `datetime` and stores `YYYY-MM-DDTHH:mm`, with seconds when they are non-zero. Local rather than UTC because that is exactly what the `date` type discards — it reads a `Date`'s local fields — so the rule is "infer `date` only when nothing is lost". The consequence to know about is that a `Date.UTC(...)` day-value's type depends on the **reader's** offset at that instant: in London, `new Date(Date.UTC(2026, 6, 1))` is 01:00 local (July is BST) and now infers `datetime`, while the very same construction in January is 00:00 local (GMT) and still infers `date`. So a host on a non-UTC zone can see this change in summer and not in winter. Build date-only values with the local constructor (`new Date(2026, 6, 1)`), or — better — declare the type and stop depending on the reader's offset at all.
  - **If you want the old behaviour, declare it: `type: 'date'`.** That is unchanged in every respect and still truncates on purpose — a calendar date has no time to reinterpret and no zone to convert, so the day entered is the day read everywhere. Declaring `type: 'datetime'`, passing epoch milliseconds, or passing ISO strings is likewise unchanged. Nothing about the `date` type itself changed; only which type an **undeclared** column of `Date` values is inferred to be.
  - **The limit, stated rather than left to be discovered.** This is a heuristic and it has one blind spot: a genuine timestamp that lands on exactly local midnight — a nightly batch stamped `00:00:00.000` — is indistinguishable from a date-only value and is still inferred as `date`, so its time of day is still discarded. A column that means instants should declare `type: 'datetime'`. **Strings are unaffected**: `date` still matches an ISO string with or without a time component and still sees it first, so `'2026-09-09T18:37:10'` in an undeclared column continues to store `'2026-09-09'`. That is unchanged behaviour, not a new one, and declaring the type is the answer there too.
  - Inference order (`INFERENCE_ORDER`, exported) is now `boolean, number, date, dateString, datetime, text, object`. `datetime` had to be named explicitly rather than left to fall through the extended catalogue: `time.matches` accepts any `Date` and sits ahead of it there, so a timestamp would have been read as a time of day with the date thrown away.
  - Related: the chart warning shipped in this same release for a sub-day series bound to a `date` column (BACKLOG-0001080) now fires only where the column was **declared** `date`, because the inferred case no longer truncates.

### Added

- **Gantt: a plan now sizes itself to the box it was given, and keeps following it** (BACKLOG-0001079). *Behaviour change with a default move — read this if you `mount` a Gantt without passing a `width`.* The module had **no** `ResizeObserver` and no resize listener of any kind. Grid core has one, the charts module has one, the web-component and htmx wrappers each have one; the Gantt sized to an explicit `width` at mount, or to a zoom preset, and to nothing else. Every host that puts a plan in a tab, a drawer, an accordion, a responsive panel or a split pane hit it, and the workaround it forced — a `ResizeObserver` in the *demo* that tears the view down and re-mounts it — is exactly the code a customer should not be writing. `width` now defaults to `'container'`: the view measures the element it was mounted into and redraws when that element's box changes, with no re-mount and nothing for the host to wire.
  - **What changes for a plan already in production:** a `mount` call that passed **no** `width` drew at 720px regardless of its container and now draws at the container's width. A `mount` call that passed a **number** is byte-for-byte unchanged and installs no observer — a number is you taking the decision. Pass `width: 720` to keep the old drawing exactly.
  - **A container with no box is not a container of zero width.** Mounted into a hidden tab or before first layout, the view holds the 720px fallback rather than drawing at zero, and adopts the real width the moment the box exists. Shrinking to zero again (the tab being hidden) leaves the last good drawing alone.
  - **Also fixed, and only visible once the plan really is narrow:** the time axis asked for eight tick labels whatever the width. Eight ISO dates need about 620px of label, which was survivable at a fixed 720px and is not in a 390px pane, so a **container-sized** plot's tick count now follows the width it actually has. It applies only where `width: 'container'` is in force — the plots the moved default put somewhere they had not been. A numeric `width` keeps the eight-tick axis it always had, because a plot drawing at the same width it always drew at should look the way it always looked; that is what makes `width: 720` a complete remedy rather than an approximate one.
  - Without a `ResizeObserver` in the environment the view is still sized once at mount and says once that it will not follow — the same bargain the grid renderer makes.
- **Gantt: `projectEpoch` — say which calendar date your plan's day 0 is** (BACKLOG-0001079). The engine's time line is whole days since the Unix epoch, so a plan written as day offsets (`0, 4, 9…`) renders as **January 1970**, and it is right to: day 0 *is* 1970-01-01, and nothing in the module can tell an offset from a real epoch day, so no warning is possible. What was missing was any way to express a relative plan at all — "it starts on day 0 and runs 22 days" is an entirely normal thing to want. `projectEpoch` supplies the anchor, on the plain `mount` view. It is **display-only**: axis ticks, bar labels, tooltips, screen-reader descriptions and the built-in `'weekends'` shading move with it, and the schedule, `getState`, `toCSV` and the MSPDI export do not — every `es`/`ef` you read back is still the number you supplied. A host-supplied `nonWorking` function keeps receiving raw plan days, because it was written against your day numbers. Use `projectStart` when you want the model itself on calendar dates. **`mountSplit` does not take it** — the joined split view has no anchor and its own `'weekends'` shading is unshifted — so a relative plan shown there still reads as 1970. Its type declaration carries no `projectEpoch`, and extending it is a separate decision that has not been taken.
- **Gantt: a dependency's `type` accepts the MS Project string shorthand** — `'FS+2'`, `'SS-1'` (BACKLOG-0001072). The structured `{ type, lag }` form was already complete (signed lag, all four types, both CPM passes); only the ergonomics were missing. The shorthand normalises to the object form at the two points a dependency enters the module, so `gantt.dependencies`, the scheduler, the lag label and the MSPDI export all read one canonical representation and there is no second internal form. A shorthand lag alongside an explicit `lag` that disagrees warns and the explicit field wins; an unrecognised string is still refused as a bad link type rather than quietly accepted.
- **A derived grid can now BE the statistics of another grid** (BACKLOG-0001046). A `mode: 'derived'` source accepts `statistics`, which projects the **relational** figures — the ones that need two or more columns, or a second grid — into ordinary rows you can sort, filter, chart and export. Three in this release: `{ fn: 'correlation', columns, orient? }`, `{ fn: 'series', of, by, periodsPerYear? }` and `{ fn: 'datasetVsDataset', with, columns? }`.
  - **You probably do not need this for a single-column statistic, and that is deliberate.** Those already have a route: a derived `select` reduces a group with any kernel the totals row uses, and that table is a strict superset of the statistics one — so `select: { p95: { of: 'amount', fn: 'p95' } }` has always worked, along with `median`, `stddev`, `gini`, `iqr`, `entropy`, `trimmedMean` and the rest. Adding a second spelling for those would have been a parallel vocabulary for something that already works. `statistics` covers only what `select` structurally cannot reach: a `select` kernel reads one column, and a correlation reads two.
  - **Row shapes, because the shape is the contract.** `correlation` gives **one row per unordered pair** by default (`{ a, b, coefficient, n }`) — long form, because that is the form a grid sorts, filters and charts well, so "the three most correlated pairs" is a sort and a `limit` on the derived grid rather than a scan of a square; only the upper triangle is emitted, since r is symmetric and a column against itself is 1 by definition. `orient: 'matrix'` gives the classic filled square instead, one row per column with a field per other column. `series` gives **one row per metric** (`{ metric, value, n }`) — per *metric*, not per point, because `grid.statistics.series` returns a summary (`n`, `first`, `last`, `change`, `changePercent`, `volatility`, `annualisedVolatility`, `growth`, `maxDrawdown`, `maxDrawdownFrom`, `maxDrawdownTo`, `autocorrelation`, `upDays`, `downDays`) and not a value per row; the shape is the one `profile`'s `orient: 'metrics'` already emits rather than a third convention for the same idea. `datasetVsDataset` gives **one row per compared column**, largest difference first, and **watches the peer**: an edit or a filter on the second grid re-derives the comparison, because a comparison whose other side has moved is wrong rather than merely late. A column present on only one side cannot be compared and is still reported, with a null `magnitude` and `unmatched` set to `'A'` or `'B'`, so you see that it was skipped and why.
  - **Every row says how much it saw.** `n` is the rows the figure covered, and it is on the row because a derived statistic travels — a coefficient exported to CSV or bound to a chart has left its context behind, and "r = 0.98 over eleven rows" is a different claim from the same number over eleven thousand. **It deliberately does not carry a windowed/approximate flag.** Whether a source held fewer rows than matched its filters is decided from that source's own counters, and a derived source cannot reach them: a grid's public `rows.matchCount()` reports the *loaded* matches, so on a bounded stream evicted to 200 of 2,000 rows it returns 200 and agrees exactly with `rows.count()`. A flag built on those could never be true, so none is emitted — the windowed signal stays in the `stat.windowed:*` console warning the parent grid already makes.
  - **A terminal producer, not a pipeline stage**, exactly as `profile` is. A correlation is one row per pair and a series summary one row per metric; neither is one row per group, so there is no position in `unnest → where → bucket → groupBy → select → sort → limit` for it to occupy. `profile` and `statistics` are mutually exclusive, and a union `from` is refused — a relational statistic reduces one grid's own columns and a union has no single set of them. Both refusals name themselves in a console warning at construction rather than producing a quietly empty grid. Adding the remaining relational statistics later means new `fn` arms on this key, not a second mechanism.
  - **Cost, disclosed rather than left to be discovered.** No terminal producer patches incrementally, so every change on the parent re-derives its whole output. On a synthetic 200,000-row grid: **~5 ms** for a 2-column correlation, **~32 ms** for a 6-column one (15 pairs), **~23 ms** for `series`, **~36 ms** for `datasetVsDataset` — against **~1 ms** for the patching grouped pipeline. Correlation is **quadratic in its column count** (N columns is N·(N−1)/2 passes over the rows: six columns is fifteen, twenty columns is a hundred and ninety), so correlate the columns you mean rather than every numeric column you have. The costs of several panels add; a hidden analysis tab recomputing a correlation matrix on every tick is BACKLOG-0001044's known "a hidden derived grid still does full work" gap with a larger constant behind it. The escape hatch is the existing `refresh` control — `'idle'` (the default) coalesces a burst into one derivation, a number is a debounce in ms, `'manual'` stops automatic derivation entirely. `node bench/derived-producers.mjs` measures the shape against your own data. Demo: `demo/derived-statistics.html`.
- **KPI: a hierarchical rail — top-level items that expand to the indicators beneath them, with a parent reporting the worst status below it** (BACKLOG-0001059). A flat panel of tiles answers "what are the numbers"; it does not answer "is anything wrong under here", which is the question a wall display exists for. Set `tree` on `createKPI` and the panel becomes a rail: a small number of top-level items, each expanding to its indicators, where a **shut** branch is still marked with the worst status underneath it. A red leaf nobody has opened is reported by the parent that is on screen — that is the feature, not a side effect of it.
  - **Where the shape comes from, two sources in this order.** *Declared:* `tree: { path }` or `tree: { parentKey }` over the **tile specs**, the same two shapes the grid's tree data and the tree-select editor already take, so a hierarchy configured once needs no second vocabulary. A `path` is the tile's **own** place, its own segment last — `['System','Compute','cpu']`, exactly as `['EMEA','UK','Colchester']` is Colchester's path and not its parent's — and levels no tile represents are synthesised, so `System` and `Compute` appear without tiles of their own. *Derived:* with neither declared, tile ids are split on `separator` (default `.`), so `system.compute.cpu` files itself. A tile's `field` is never a source: a dot there already means a nested object property, and overloading it would make `field: 'cpu.util'` ambiguous.
  - **A flat panel is untouched.** With no `tree` declared and no separator in its ids a panel renders exactly as before — same `role="group"`, same `<figure>` tiles, same accessible names, same model shape (no `nodes` key appears), same `getState()` (no `expanded` key). `tree: false` keeps a panel flat whatever its ids look like, which is the escape hatch if your tile ids already contain dots and you do not want a hierarchy inferred from them.
  - **No value rolls up; severity does.** A parent shows no aggregated number. That is not a simplification: the running accumulators expose `add`/`remove`/`value` and no merge, so `avg`, `countDistinct` and a `custom` reducer cannot be composed from their children without a rescan, and a per-aggregation exception list would be a number that is right for a sum and wrong for an average. A parent that has a tile of its own still shows *that tile's* reading. What rolls up is `node.rollup`, the worst severity at or below the node, across as many levels as you have. A parent with no thresholded descendant reports `null` — **not** green.
  - **Nothing measured is not good news, and it does not win the roll-up either.** A leaf that measured nothing is `unknown` (the status added in 1.51.0, decided from dataset presence exactly as it is there), and `unknown` is deliberately excluded from `rollup`: ranking "not measured" as the worst thing beneath a parent would hide a real warning under it. It is surfaced separately instead — `node.unknown` counts the descendants that measured nothing, the node renders it in words ("2 unknown"), and it is in the node's accessible name. So neither way of being wrong is available: silence cannot read as green, and it cannot bury an amber.
  - **Accessible by construction.** A real `role="tree"` with the APG keyboard model — Right opens a shut branch and otherwise steps into it, Left closes an open one and otherwise steps out to the parent, Up/Down walk what is visible, Home/End jump to the ends, Enter/Space activate — with a roving `tabindex`, and `aria-level`, `aria-posinset` and `aria-setsize` on every node, because a reader cannot count what a collapsed branch has left out of the DOM. Status carries a **shape** as well as a colour (filled circle / triangle / square / hollow circle), not one dot in three colours, and a parent's rolled-up status is in its accessible name — "Compute, 3 items, worst status critical" — announced as one string.
  - **Every phrase is a catalogue key.** Pass `messages` (any `{ t(key, params) }`, including a grid's own) to translate the panel; a key your catalogue lacks falls back to English rather than printing the key. This is the panel's first translatable text, and it retro-fits the existing "No data" caption, which shipped as a literal in 1.51.0. Two of a KPI panel's three input modes have no grid to borrow a catalogue from, so `messages` is the first-class route rather than a fallback.
  - **New surface:** `config.tree`, `config.messages`, `config.onNodeToggle`; `kpi.tree`, `kpi.nodes()`, `kpi.node(key)`, `kpi.visibleNodes()`, `kpi.expand(key)`, `kpi.collapse(key)`, `kpi.toggle(key)`; the `node:toggle` event; and `expanded` on `getState()`/`setState()` for a hierarchical panel. A snapshot with **no** `expanded` key leaves expansion alone rather than resetting it, so every caller written before this is unaffected, and a key naming a branch the panel does not yet hold is retained rather than dropped, so a delta that later introduces it finds it already open.
  - **Cost, measured rather than estimated:** `modules/kpi` grows **289,543 → 310,804 bytes raw, 68,087 → 74,471 gzipped (+6,384 B, +9.4%)** for a panel that does not use the hierarchy, of which 1.8 KB gzipped is core's own `source/tree.js` — reused rather than reimplemented, so there is one tree builder in the product and not two. A page that does not load `modules/kpi` is unaffected.
  - **Demo:** `demo/kpi-tree.html`.

### Changed

- **Charts: a category that reported nothing now draws as a gap, not as a zero** (BACKLOG-0001088). *Behaviour change — read this if you chart a feed whose readings can be absent.* The chart's reductions returned the identity of their operation over an empty set: `sum([])` was 0, and `avg`, `mean`, `min`, `max`, `first` and `last` all answered 0 when they were handed no readings at all. A category whose rows had all reported `null` therefore reduced to 0 and was drawn as a reading of zero. **A metric that dropped to zero and a metric that reported nothing drew the same line**, and on an operational dashboard those are opposite facts — one is an outage, the other is a monitoring failure, and the viewer could not tell them apart. Measured in a browser on six readings ten seconds apart, `[99.1, 99.6, null, null, 99.3, 99.9]` against `[99.1, 99.6, 0, 0, 99.3, 99.9]`: before, both drew **one** unbroken path diving to the floor, both rescaled the value axis to **0–100**, and both printed `0` in the two middle cells of the accessible data table — the two pictures were identical. After, the absent pair draws **two** runs with a break between them, the axis stays at **99.0–100.0**, and the table leaves those cells **empty**; the genuine zeros are unchanged and still draw one path down to 0. A bar chart draws no bar for such a category rather than a zero-height one, and a pie or treemap gives it no slice. This is the rule the KPI module adopted in 1.51.0 (BACKLOG-0001061), where `sum`/`count` over an empty member set graded a no-data tile as healthy: what is drawn follows from whether there is data, not from what the arithmetic over nothing happens to return. **The counting reductions are deliberately unchanged**: `count` is a tally of rows and `countValues` returning 0 is the true statement "none arrived", so `fn: 'countValues'` is how you ask for absence to be *drawn* as a zero. A category with no rows at all was already a gap and is unaffected, as are `bindLinks` (Sankey/chord) and the treemap's area, which skip absent amounts rather than reducing them. **If you relied on the zero**, coalesce the nulls where the value is produced (a `valueGetter`, or the feed) rather than in the chart, so the grid and the chart keep agreeing.
- **Gantt: `zoom` and a numeric `width` passed together no longer discard the `width` in silence** (BACKLOG-0001079). `zoom` fixes the pixels-per-day, computes the plot's width from the plan's span, and never reads `width` at all. That precedence is deliberate and is **kept** — a zoom level is a statement about the time scale, which a pixel width cannot express — so nothing relying on it changes. What changes is that passing both now warns once, naming both values and saying which was ignored. `zoom` with the default `width: 'container'` is not a conflict and says nothing.
- **Gantt: the plain view's `today` accepts a calendar date, and is no longer dropped when given one.** `today` was required to be a finite day-number; a `Date` or an ISO string was discarded without a word and no today line was drawn. A date is now converted into plan space through `projectEpoch`, which is what makes "put the line on the real today" expressible for a relative plan. **`mountSplit` is not covered**: the joined split view still takes `today` as a day-number only, and a `Date` or an ISO string there still draws no line. Its type declaration says so (`today?: number`), and extending it is a separate decision that has not been taken.
- **`profile` (and now `statistics`) say out loud which pipeline keys they ignore** (BACKLOG-0001092). *No behaviour change to any output — this adds a warning where there was silence.* `profile` has replaced the derivation pipeline since it shipped, which meant a `sort`, a `limit` or a `where` written beside it was discarded without a word: measured, three keys a caller had written were honoured nowhere and the diagnostics list was empty. A terminal producer given any of `unnest`, `join`, `where`, `bucket`, `groupBy`, `select`, `sort`, `limit`, `limitPer` or `cumulative` now warns once, naming the producer and **naming the keys actually written**, and points at the two things that do work: sort/filter/limit the derived grid itself, or chain a second derived grid whose `from` is this one. `follow` and `refresh` are honoured by a producer and are correctly not reported. The derivation still runs — its output was never wrong, only narrower than the config read. The rule is written once for terminal producers so `statistics` inherits it rather than repeating the same omission.
- **The cost of `profile` is now written down** (BACKLOG-0001046). It has never patched incrementally — a change on the parent re-derives it in full — and that was disclosed nowhere. Measured at **~20 ms per change on a synthetic 200,000-row grid**, against ~1 ms for the patching grouped pipeline. Nothing about `profile`'s behaviour or output changed; the figure and the `refresh` escape hatch are now in `docs/api-detail.html` alongside the equivalent disclosure for a union `from`.
- **Charts: a measure with no `fn` is now reduced the way its column says, instead of always being summed** (BACKLOG-0001080). *Behaviour change — read this if you bind a chart to a column that declares a `total`, or to one of the `ratio` / `percentRate` / `decibel` types.* `sum` remains the fallback and every ordinary numeric column still sums exactly as before. What changed is that `bindSeries` now asks the measure column two questions first, both of which it was already answering elsewhere and the chart was ignoring. **One:** a column declaring `total: 'avg'` (or `min`, `max`, `count`, `countValues`, `first`, `last`) has already stated, in the grid's own vocabulary, which reduction is meaningful for it — the chart's `AGGREGATIONS` table is named after `TOTAL_FNS` precisely so the two agree — and a chart that summed it contradicted an answer the integrator had given. **Two:** the aggregable types (`ratio`, `percentRate`, `decibel`, `decibelAmplitude`) declare `totals.supported` *without* `sum`, because two conversion rates do not add to a conversion rate, and the column model refuses `sum` on them at configuration time; the chart summed them anyway. A percentage series that ran to **y = −3501** is exactly the plausible-looking wrong answer those declarations exist to prevent. Where the type refuses `sum`, the chart now takes the best reduction the type does allow (`avg`, else `max`, `min`, `countValues`, `count`). An explicit `fn` on the spec still wins over both — asking for the sum of a rate is asking on purpose — and `grid.rows` is untouched, as are the treemap/sunburst (`bindHierarchy`) and Sankey/chord (`bindLinks`) binders, whose area and ribbon width are additive by construction and keep summing. **If you relied on the old behaviour**, name it: `y: { col: 'rate', fn: 'sum' }`. The type's own weighted-mean implementation is not used — the chart has no denominator column to weight by — so a `ratio` column charted without an `fn` gets the plain mean of the readings in the bucket.

### Fixed

- **Charts: a rolling time window over data older than its span drew the whole series outside the plot, in silence** (BACKLOG-0001088). `axis.x.window = { kind: 'time', span }` ends the x domain at the wall clock, which is what makes a live chart keep scrolling through a quiet period (1.49.0). Nothing checked that the data was still inside it: a chart seeded with history — yesterday's rows loaded before a live feed is attached, an ordinary shape for a wallboard — had every mark drawn at a large negative coordinate (`M -58700.79 …`), off the canvas, while the axes, the legend and the accessible data table all rendered normally. The result was a chart that looked broken and said nothing, and it is a plausible second cause — alongside the `date`-column bucketing fixed under BACKLOG-0001080 — of a seeded chart appearing blank. A chart whose newest x value falls before the start of its own rolling domain now shows the **empty state** (the placeholder added in BACKLOG-0001023, `emptyText` if you set one) instead of drawing off-canvas, and warns once naming the numbers, because "widen the window" and "the feed is dead" are different fixes and only the age tells them apart: `[lattice] the rolling x window covers the last 60000 ms, and the newest of 6 x value(s) is 3605s old, so every mark would be drawn outside the plot…`. **Nothing else changes**: one reading inside the window is still a picture (older points scrolling off the left is what a rolling window is for), a reading exactly `span` old is inside, a future-stamped point still carries the window forward with it, and a banded x axis — a bar chart, a category dimension — is untouched, having already been told its window is ignored. Charts with no `window` configured are unaffected in every respect.
- **Gantt: dependency links went out the right of the finished task and back across to the left of the next one** (BACKLOG-0001072). Every link was drawn the same way whatever the geometry — a fixed horizontal stub, a vertical drop, then a horizontal run — with the direction taken from `ex >= sx`. On the commonest link in any plan, a **zero-lag finish-to-start**, the two anchors share an x, so the stub went right, dropped, and then ran back left to reach a point it had already passed. A link is now routed by geometry: when the successor's anchor is at or beyond the predecessor's it goes **straight down and then in** (a zero-lag FS is a clean vertical), and when the anchor is *behind* — a negative lag, or two overlapping tasks, where "down then in" does not exist — it takes a deliberate S: out on the predecessor's own side, along a lane between the two rows, down, and in. The final segment always runs the way the arrowhead points, in every geometry, which is the property the old routing broke.
  - **The anchors have sides, and that is what was actually missing.** `ex >= sx` is only the right arrival direction for FS. Each type anchors on a specific end of each bar (FS finish→start, SS start→start, FF finish→finish, SF start→finish), and each end has a side: FS and SS arrive at the successor's **start** from the left and point right; FF and SF arrive at its **finish** from the right and point left. An FF or SF link used to arrive from the left and run straight through the bar it was pointing at, and its arrowhead pointed away from it. **Start-to-start is the biggest visible change**: its two anchors are near-vertically aligned by construction, so it used to travel right across the predecessor's own bar and back, and is now almost a straight vertical.
  - The lag/lead label, the critical-path styling, the hover chain highlight and the arrowhead's geometry are unchanged; the arrowhead's *direction* now comes from the route rather than from a bare coordinate comparison. Both views — the plain timeline and the joined split view — route through one shared implementation instead of a copy each. Every link element carries `data-route` (`straight`/`drop`/`detour`) naming the decision.
- **Tabbed grid: the tab strip stayed at its compact size above a grid given a `density` in its own config — and `spacious` was worse in 1.51.0 than in 1.50.0** (BACKLOG-0001060). This closes the known limitation disclosed in the 1.51.0 entry below. Measured, strip height against the grid's own header height: at `density: 'spacious'` the strip was **0.68x** the header in 1.50.0 and **0.46x** in 1.51.0, against a grid header that had grown to 64px while the strip sat frozen at 29.19px. The cause is structural rather than a wrong value: `density` lands as `data-density` on the grid's root, the strip sits **above** the grid, and a CSS custom property inherits downward only — so no selector the module can write is able to read it, and the strip was resolving its 13px/24px fallbacks every time. The strip now reads the mounted grid's *resolved* theme tokens at materialise time and mirrors them onto itself, and re-reads whenever that grid's configuration changes, so `grid.set('density', …)` on a live grid does not leave the strip behind. It also re-points when you switch to a tab whose grid runs a different density, because every tab is a full, independently configured grid. After: **1.02x at `spacious`, 1.02x at `comfortable`, 1.06x at `compact`**, and the strip's type now resolves to exactly the pixel size the grid paints its own cells at rather than to something within a pixel of it.
  - **Precedence, because two of these can disagree:** an explicit `--lat-tabs-*` override still wins over everything (all of the documented custom properties are unchanged and still honoured); a `--lattice-font-size` / `--lattice-font-family` / `--lattice-line-height` set on an **ancestor** still rethemes the strip's *type*, which is the escape hatch 1.51.0 shipped; the mirrored value is consulted only where neither of those answered. The strip's *height* is the exception and follows the grid alone — an ancestor's density never reaches the grid (the renderer stamps the grid's own `density`, default `compact`, on its root), so a strip sized from an ancestor would be measured against a header that never moved, which drew a band 2.35x its header.
  - **Also fixed, found while measuring the above: a tab strip wrapped in a `.lattice` ancestor lost its band, its bottom rule, its tab padding and its label colour.** The grid's defensive reset (`.lattice div, .lattice button { padding: 0; border: 0; background: none; color: inherit }`) is written at specificity (0,1,1) on the stated assumption that everything dressing a grid element is (0,2,0) or higher; the tab strip's rules were (0,1,0), and the strip is not a grid element. Since wrapping the tabs in `.lattice` is the only way to reach the density preset chain from outside a grid, anyone following that advice got `All dealsOpenBreached` run together with no band behind it. The strip's rules are now (0,2,0). No class names changed and no custom property changed.
  - No keyboard, ARIA, lifecycle or event behaviour changed.

- **Charts: a time axis shorter than two hours labelled every tick the same** (BACKLOG-0001080). The date-format ladder stopped at hours and minutes, so a **60-second** rolling window — the span `window: { kind: 'time', span }` exists for — drew four ticks 15 seconds apart and labelled all four `17:37`. The axis looked labelled and conveyed nothing, and the documented workaround (`axis.x.format`) is not something a reader of a live chart should have to discover. The ladder now reaches down through seconds (`17:37:00`, `17:37:15`, …) and, for spans of a few seconds, through milliseconds (`37:00.500`), and the bottom two rungs are chosen from the **tick step** rather than from the span, which is the question actually being asked: adjacent labels have to differ, and what separates them is the step. The tick ladder itself gained sub-second steps (1 ms to 500 ms) for the same reason — a 2-second domain used to be offered one step of a second. Every rung above two hours is byte-for-byte what it was; a span of zero, which is an unsettled domain rather than an instantaneous axis, keeps the hour-and-minute default. No configuration is needed and none has changed.
- **Charts: a single reading — the normal state of a live series that has just started, or of one collapsed into a single bucket — drew nothing at all.** A stroke needs two coordinates, so a lone point produced a subpath of `M x y` and no line, which renders as an empty plot underneath a fully drawn set of axes, a legend and an accessible table all reporting the reading as present. Any point marooned between two gaps (a host that reported once inside a window its neighbours filled) was invisible for the same reason. Line, area and step series now draw a dot on every reading the line cannot reach; a series whose points connect is unchanged and gets no dots.
- **Charts: a chart of a single instant labelled its x axis in years.** A zero-width domain is padded by a tenth of its own magnitude, and a tenth of an epoch is five years — so one reading at 17:37 today produced an axis reading `2024 … 2029`. Time is not measured from zero, so a degenerate time domain is now padded by 30 seconds either side instead of proportionally. (The equivalent rule for a *measure* axis was already correct: a flat series is padded by a tenth of the constant, or by one when the constant is zero, so a healthy metric that is not moving draws its line inside an axis that brackets it. That behaviour is unchanged and now has a rendered regression test as well as an arithmetic one.)
- **Charts: sub-day timestamps bound to a `date` column collapsed into one point in silence.** A `date` column stores a calendar day — `YYYY-MM-DD`, deliberately, so that the day entered is the day read in every time zone — so binding `Date` values carrying a time of day to one leaves the chart with a single category before it sees the data, and the reduction then runs across every reading in the day. Combined with the old unconditional `sum`, that is how a percentage series reached −3501. The truncation happens on ingest and a chart cannot undo it, so the chart now **says so**: when a time axis over a `date`/`dateString` column collapses more than one row into a single day it warns once (`[lattice] chart x column "at" is a 'date', which stores a calendar day, so all 30 rows collapsed into one point and were reduced by 'avg'. For a series inside a single day, type the column 'datetime' or bind epoch milliseconds.`). Bucketing itself is unchanged — a calendar day is the right bucket for a multi-month series — and a series spread across real days stays silent. **The fix for a sub-day series is to type the column `datetime` (or bind epoch milliseconds); no chart option can recover the lost resolution.**

## [1.51.0] - 2026-09-09

### Breaking

- **`odataAdapter({ count: false })` now returns no `total` at all, where it used to report the page length as the total** — see the `### Changed` entry below.
- **`graphqlAdapter` no longer invents a `total` from the page length when a schema reports no `totalCount`** — see the `### Changed` entry below.
- **KPI: an empty panel's `tile.value` reads `null`, not `0`** — see the `### Changed` entry below.

*Added retroactively (BACKLOG-0001090): all three shipped in this release, disclosed only inside `### Changed` prose at the time — a deliberate, disclosed correction of the tagged section, not a new change.*

### Added

- Union / append derived source (BACKLOG-0001045): a `mode: 'derived'` source's `from` widens from a single `Grid` to `Grid | UnionSourceOptions[]` — each entry `{ grid, label?, follow?, map? }`, a bare `Grid` still shorthand for one with no override — so several grids can be stacked into one row set before the rest of the derivation pipeline (`unnest`/`join`/`where`/`bucket`/`groupBy`/`select`/`sort`/`limit`/`limitPer`/`cumulative`) runs once over the combined result. This is the shape a keyed `join` cannot express: two datasets with no shared identifier at all — incidents from two regions, orders from two systems — stacked and ranked together as one list. Additive and backward compatible: an existing `from: <grid>` is unchanged, asserted byte-for-byte against a real 1.50.0 checkout across the whole pipeline. Sources concatenate in **declaration order** ahead of `sort` (deterministic, not interleaved); each carries its own `label` (defaulting to its position in the array) and `follow` (independent liveness per source, `'filtered'` by default, so filtering one source narrows only its own contribution). Every combined row carries a **required** `__source` field naming which source it came from — usable in `where`, `groupBy` and `select` like any other field — and the derived `__key` is namespaced by source when nothing is grouped, so two sources sharing the same raw identifiers do not collide (grouped, `__key` stays the group value, and rows from different sources landing in the same group is the point). A source may supply `map` to reshape its rows into a common field shape; sources are not otherwise type-reconciled. This is **not** a join: no dedup, no merge-on-key, no UNION/UNION ALL distinction. An empty source contributes nothing; a source that throws while being read is named in a console warning and skipped for that pass, never silently dropped. A source list that reaches back to the grid being derived, directly or through a chain of other derived grids, is refused when the source is built, naming the offender — the same standard the tabbed grid (1.50.0) set for its own `from` chains. `crossFilter`, `profile` and the top-level `follow` have no defined meaning for several parents and are refused or ignored with a warning at construction, not guessed at.
  **Performance, disclosed rather than left to be discovered:** a union never patches incrementally the way a lone `from` does — a change on *any* one of its sources re-reads and re-derives the *entire* combined set from scratch, and that full-rescan cost is paid once per source that moves rather than once per union. On a synthetic 200,000-row union across four sources, one row changed on one source cost on the order of seconds, against a few milliseconds for the equivalent patched change on a lone `from` over the same row count; four sources each updating independently pay that cost roughly four times over. This is unlikely to matter below a few tens of thousands of combined rows; above that, or with several sources each on their own live feed, budget for it — `node bench/union-parents.mjs` measures the shape against your own data — and keep `refresh` off every tick (`idle`, or a debounce). A lone `from` is completely unaffected and keeps patching exactly as it did in 1.50.0. Demo: `demo/connected.html`'s "Two unrelated systems, ranked together" section — worst 8 across two unrelated, unkeyed incident logs with different field names.
- A cell context menu can now be declared **on the column** (BACKLOG-0001068). `contextMenu` is accepted on a column definition in the same shapes the grid-level option takes, plus a bare `MenuItem[]` for the common "just these items here" case: `boolean | MenuItem[] | ((params, defaults) => items)`. This adds no power the grid-level callback did not have — `params.colId` and `params.column` always let one callback branch by column — it adds **locality**: a column's menu is declared where the column is, instead of collecting into one growing `switch` a long way from the thing it is about. The three levels **compose as a chain**: built-in defaults, then the grid-level `contextMenu`, then the column's, each handed the previous level's result as its `defaults` — the same rule `columnMenu` already follows for the header — so a column adding one item never restates Paste, Clear and Fill down. Suppression follows the same order and the more specific level wins: `contextMenu: false` on a column silences that column and no other (what a sensitive or read-only column wants), and a column may equally declare a menu on a grid whose `contextMenu` is `false`, which is how you say "no menu anywhere except here"; `contextMenu: true` on a column restores whatever came before it. On a right-click inside a multi-column selection the **clicked** column's menu opens — not the intersection, which silently loses items, and not the union, which offers actions wrong for most of the selection; the built-in range actions still act on the whole range. A group row, pivot group row or full-width row belongs to no column, so the chain simply has one link fewer and the grid-level menu stands. A column preset or `columnDefaults` may supply `contextMenu`, and the column's own declaration outranks both. `MenuItem` itself is unchanged, including the existing trust statement for `icon` markup: this changes where a menu is written, not who is trusted to write it. Demo: `demo/column-menu.html`.

### Changed

- **KPI: a tile that measured nothing now reports `unknown` instead of grading as healthy** (BACKLOG-0001061). `sum`, `count` and `countDistinct` return the identity of their operation over an empty set — 0 — and 0 is a number a threshold grades. With `lowerIsBetter` cut points (`{ warn: 10, critical: 25, direction: 'lowerIsBetter' }`, the shape an error/incident/cost tile uses) an **empty** KPI panel therefore graded every tile `good`; with `higherIsBetter` cut points it graded them `critical`. Zero is a legitimate reading — "no errors today" really is 0 and really is good — but "no errors today" and "no data arrived at all" produced identical output, so a panel whose feed had silently stopped asserted that everything was fine. A tile's status is now decided from **data presence before value**: when the panel holds no rows at all the status is the new fourth value `'unknown'`, whatever the thresholds say. An `unknown` tile reports `value: null` and renders the configured `nullText` placeholder (default `—`) rather than a zero, and is marked with a dashed left edge plus a visible "No data" caption that also forms part of the tile's accessible name, so the state is not conveyed by colour alone. Because `unknown` is an explicit status rather than a severity, a roll-up over tiles can surface "not measured" instead of inheriting a false green.
  - **What this changes for a panel already in production:** a panel that is empty — at first paint before a feed delivers, or after its rows are removed — now shows placeholders and `unknown` where it previously showed zeros and a colour. Code branching on `tile.status` should expect the fourth value; code reading `tile.value` on an empty panel now gets `null` where it got `0`. `tile.count` is unchanged.
  - **Deliberately not broadened:** a tile whose `filter` matches none of the rows the panel *does* hold has measured a real zero — no open Sev-1 incidents is genuinely good — and is still graded on its thresholds exactly as before. Only an empty panel is `unknown`. Demo: `node demo/kpi-no-data.mjs`, all three states side by side.
- **Tabbed grid: the tab strip takes its type and rhythm from the grid, not from the host page** (BACKLOG-0001057). The strip previously used `font: inherit`, so it rendered at the host page's font size while the grid rendered at its own — on a typical 16px page that put a 16px tab strip above a 12.7px grid, in a band 1.60× the height of the grid's own header, which read as bolted on rather than part of the grid. It now takes `--lattice-font-family`, `--lattice-font-size` and `--lattice-line-height`, so it follows whatever the grid is themed to, and the strip sits at 1.07× the header height. Tabs are drawn as flush segments of one continuous band rather than floating rounded boxes, and the active tab is marked by a 2px accent rule along its bottom edge, which also joins it visually to the panel below. Two default values changed and both remain overridable: `--lat-tabs-hover` from `#f1f3f5` to `#ebeef1` (the previous hover was invisible against the new band) and `--lat-tabs-gap` from `2px` to `0` (segments must abut). **Known limitation:** the strip sits above the grid rather than inside it, so it follows a `--lattice-font-size` set on an ancestor element but cannot follow a `density` passed in the grid's own config — under `density: 'spacious'` the strip stays at its compact size against a taller header, which is a wider mismatch than before this change. No keyboard, ARIA, lifecycle or event behaviour changed; this is styling only.
- **The DuckDB adapter no longer counts the matching set on the page query** (BACKLOG-0001065). Every statement it built carried `count(*) OVER () AS "__lattice_total"`, so the total came back with the rows in one round trip. That reads as free, and against a local table it is; against a remote Parquet it was the most expensive thing the adapter did. A window function has to see every matching row of the *projected* columns, which defeats Parquet row-group pruning and range reads. Measured in Chrome on `duckdb-eh.wasm` against a 10,000,000-row Parquet of 162,386,227 bytes (162.4 MB decimal, 154.9 MiB binary; every transfer figure below is decimal MB so it compares directly), served from a range-capable origin counting the bytes it actually sent: first paint pulled **162.5 MB** — the whole file — to show a hundred rows, and so did a sort and a deep page; a selective `country = 'GB' AND risk_score > 70` pulled **191.1 MB**. The total is now a **separate `count(*)` statement** carrying the same `WHERE` (same builder, same typed casts, same bound values, no `ORDER BY`, no `LIMIT`), **dispatched in the same tick as the page query** rather than awaited after it. Same numbers, a fraction of the bytes. Read the statement with `adapter.countSqlFor(query)`, the counting counterpart of `adapter.sqlFor(query)`. No API you call changes; a grid that showed a total still shows the same total.
- **A count is cheap, not free — and now you can turn it off.** `duckdbAdapter({ count: false })` issues no count statement at all, for a grid that never shows one. `graphqlAdapter({ count: false })` drops `totalCount` from the default selection set, so the server is not asked for a count nobody will read (it is *not* split into a second operation: over HTTP that would cost a round trip rather than save one). `odataAdapter({ count: false })` already existed and still sends the same request — but what it *reports* has changed, which is its own entry below. Be honest about the saving on the DuckDB side: an **unfiltered** `count(*)` over Parquet is answered from the file's footer metadata and reads no data; a **filtered** count still evaluates the predicate, over the predicate columns rather than the projection, with row-group statistics able to prune whole groups. Measured against that same 162.4 MB file: the count's own share of an *unfiltered* first paint is **0.00 MB** (5.71 MB either way), and of `country = 'GB' AND risk_score > 70` it is **41.9 MB** (45.2 MB with the count, 3.2 MB without). So the count is far cheaper than the window function it replaced — 45.2 MB against 191.2 MB — and on a filtered query it is still the larger half of the bill. Turn it off and the same query costs 3.2 MB.
- **`odataAdapter({ count: false })` now reports no total at all, where it used to report the page length as the total.** *(Behaviour change in its own right — read this even if you use no DuckDB.)* With `count: false` no `$count=true` is sent, so the service is never asked for a total and cannot have returned one; the adapter nevertheless fell back to `rows.length`. A grid with the count turned off was therefore told the entity set was exactly one page long, and its scrollbar, its row count and every "showing X of Y" were wrong, silently. The fallback is gone. There is now no `total` on the result, which both the paged and the remote source already handle: they scroll open-ended and discover the length as the user reaches it. **If you read `result.total` from an OData source with `count: false`, you will now get `undefined`** — read `rows.length` if you want the page size, but do not present it as the set. Separately, a service that *was* asked for `$count=true` and answered without an `@odata.count` now says so once (`source.odata.nocount`) instead of quietly handing back a page length.
- **`graphqlAdapter` no longer invents a total from the page length either, and gains `count: false`.** *(Behaviour change in its own right.)* `parseResponse` and `execute` used `total ?? rows.length`, so an endpoint whose `data` carried no `totalCount` — a schema that does not expose one, or a field renamed — made the grid believe the connection held exactly one page. A single window with no reported `totalCount` now returns no `total`, and the endpoint is named once in a warning (`source.graphql.nototal`). **If you read `result.total` from a GraphQL source whose schema has no `totalCount`, you will now get `undefined`.** The two forward walks still report an exact total when they run to a short page or an exhausted cursor, because there the rows genuinely *are* the whole result — but they are **not** otherwise unaffected: see the offset-walk truncation under Fixed, which this same change repairs. New `count: false` drops `totalCount` from the default selection set (offset and cursor alike) and declares `capabilities.total: false`, so a grid that never shows a count does not make the server compute one. It is deliberately *not* split into a second operation the way the DuckDB count is: over HTTP that would cost an extra round trip rather than save one.
- The same page-length fallback is removed from the pushdown source, so an adapter that declares `capabilities.total: false` is no longer given a total it did not report.
- **`count: false` is a trade, not a free win.** With no total the scrollbar is open-ended, a "showing X of Y" readout has no Y, and `grid.scroll.toRow(n)` cannot jump past the end the grid has discovered so far. Turn the count off for a grid whose users scroll; leave it on for one whose users jump.
- **One case where 1.51 transfers more bytes than 1.50.0, disclosed rather than buried: a session that eventually reads the whole table anyway.** Every individual query is cheaper than or equal to its 1.50.0 counterpart, but a whole session need not be. 1.50.0 pulled the entire file on first paint in a few large sequential reads and was cache-warm from then on; 1.51 reads lazily, and lazy range reads over a large Parquet overlap where one eager read did not, so bytes already paid for can be paid for again. Over one session doing first paint, a selective filter, a full-table `ORDER BY`, a deep page and two more filters, 1.50.0 transferred **162.5 MB** in total and 1.51 transferred **209.8 MB**. A user who never sorts the whole table pays 46.7 MB rather than 162.5 MB and gets a first paint in 566 ms rather than 5808 ms; a user who does sort the whole table has to read the whole file either way and now pays part of it twice. A full `ORDER BY` on an unindexed column is unchanged at 162.5 MB before and after.

### Fixed

- **GraphQL: a whole-result walk over a schema with no `totalCount` stopped after the first page and returned a partial result as if it were complete** (BACKLOG-0001065). *Silent data loss — if you page a GraphQL source whose schema does not expose `totalCount`, you were affected.* When the grid has residual work to finish it asks the adapter for the entire result, and the offset adapter answers by walking `offset`/`limit` until it runs out. `parseResponse` invented `total = rows.length` from page one, and the walk's own stop condition — `if (total && rows.length >= total) break` — then believed that invention: one page fetched, one page returned, reported as the whole. Measured against a 337-row connection with a page size of 100: **1.50.0 fetched 1 page and returned 100 rows with `total: 100`; 1.51.0 fetches 4 pages and returns all 337 with `total: 337`.** The rows that were never fetched were then filtered and sorted as if they were the full set, so the grid could show the *wrong* rows, not merely fewer — the exact hazard the pushdown source refuses loudly for every other adapter. A schema that does report `totalCount` was never affected and walks exactly as before.
- **DuckDB: a page past the end of the matching set reported the whole set as empty** (BACKLOG-0001065). The count rode on the returned rows, so a page beyond the last row came back with no rows, therefore no count, and the total fell through to `rows.length` — zero. A grid scrolled or paged past the end of a 10,000,000-row set was told the set held nothing, and any "showing X of Y", scrollbar or empty-state reading that total was wrong. A separate `count(*)` does not care whether the page is empty, so the total is now correct for every window, including one entirely past the end. This was a wrong answer, not a slow one, and it shipped in every release that had the DuckDB adapter.
- **A menu opened from the keyboard previously received an incomplete `CellMenuParams`.** The keyboard route (Shift+F10 and the Context Menu key) emitted only the focused row and its column id, so `column`, `key`, `index` and `value` were all `undefined` on the object handed to a `contextMenu` builder and to a clicked item's `action` — while a right-click on the same cell supplied all four. A host item that read `params.value`, `params.key` or `params.column` therefore worked with a mouse and silently did nothing (or threw) with a keyboard, which is an accessibility defect and an unpleasant one to diagnose from the outside. All four are now resolved from the grid, so both routes hand over the same cell. **If you added a workaround** — re-deriving the key from `params.row`, guarding every read of `params.value`, or declining to offer an item when `params.column` was missing — you can remove it. Found by a differential probe against 1.50.0 while making per-column menus work from the keyboard; it fixes the grid-level builder at the same time.

## [1.50.0] - 2026-09-09

### Breaking

- **The OData adapter now refuses a zone-less date/time filter value instead of silently resolving it to the wrong instant** — see the `### Changed` entry below.

*Added retroactively (BACKLOG-0001090): this shipped in this release, disclosed only inside `### Changed` prose at the time — a deliberate, disclosed correction of the tagged section, not a new change.*

### Added

- Tabbed grid, a new opt-in module (BACKLOG-0001039): tabs at the top of a grid, switching by click or keyboard, where **each tab is its own full, independently-configured grid instance** — "configure each of the tabbed grids as per a normal grid… they can be derived from each other," per the original ask. `import { createTabs } from 'lattice-grid/modules/tabs'`; `createTabs(el, { createGrid, tabs })` — `createGrid` is injected (the same pattern the React/Vue/Svelte adapters use), so the module never imports the engine and adds nothing to a page that does not load it. A tab that names `from: '<tabId>'` gets a `source: { mode: 'derived', from: <the parent tab's live grid>, where, group, join, … }` wired for it automatically, reusing the shipped derived-source mechanism (`source.mode === 'derived'`) rather than inventing a config-inheritance mechanism; activating a derived tab materialises its whole ancestor chain (mounted, hidden) first, and a cyclic `from` graph is refused with the exact cycle named when `createTabs` is called, not at first click. A tab's grid mounts on first activation and then stays alive, hidden, so its scroll/selection/filters/sort/grouping/expansion — and an open cell/row editor, left uncommitted and undiscarded — survive a switch natively rather than through a lossy state round-trip; destroying the tab strip destroys every mounted tab. The strip is a real `role="tablist"`/`"tab"`/`"tabpanel"` with `aria-selected`, a roving `tabindex`, and manual-activation keyboard handling (arrows/Home/End move focus, Enter/Space or a click activates), imitating the header's arrow-key model rather than the tool panel's tablist (which has the roles but no arrow-key handling). Events: `tab:changed`, a cancellable `beforeTabChange` (a host can veto a switch, e.g. an unsaved edit) paired with `tabChange:cancelled`. Zero runtime dependencies; own UMD global `LatticeGridTabs`. Demo: `demo/tabs.html` (All → Open → Breached, a live derivation chain).
- Gantt viewer state: `gantt.getState()`/`gantt.setState(snapshot)` (BACKLOG-0001042), matching the shape the kanban board and the KPI panel already carry — the Gantt was the one module of the three with no state API at all, so a user's arrangement of it could not be saved, restored or shared. The snapshot covers which view is mounted (`'plain'`/`'split'`/`null`), the zoom level, the arrow/progress/baseline display toggles, calendar/non-working shading, the plain view's swimlane grouping, the split view's left-panel width and its collapsed summary rows; it deliberately excludes task data (already covered by `setTasks`/`rows.apply`), transient interaction state, and resource/leveling and constraint display, neither of which is a togglable view mode today. Versioned (`GANTT_STATE_VERSION`) and JSON-safe; `setState` is tolerant of an unknown, wrong-typed or newer-version payload (applies what it recognises, never throws) and merges its recognised fields onto whatever the host already passed to `mount`/`mountSplit`, so untracked options survive a restore. Demo: `demo/gantt.html` now has Save/Zoom out/Restore view buttons.
- A time window for the `shadow(kind:'history')` sparkline column, so a static row's history no longer freezes (BACKLOG-0001043). Plain history counted *changes*, not time — a row that never changed never advanced its buffer, so a `cell.render` sparkline bound to it stopped drawing while its "last N" title kept claiming a span it could not back up. `history` now accepts the same `window: {kind: 'time', span}` vocabulary the rolling shadow kinds already use: `depth` buckets divide the span, each bucket samples the row's last known value at its close and carries it forward when nothing changed, so a static row now draws a flat, still-advancing line and a real change lands in the bucket where it happened. Depth/count-based history (the default, no `window`) is unchanged. Uses one low-frequency timer per grid, shared across that grid's own time-windowed history trackers (not a separate timer per column), clamped 50 ms–1 s and stopped on destroy — the same style of timer as the other time-windowed features (the chart axis and live-feed bounds shipped in 1.49.0), though each keeps its own, independent timer. Idle cost over 50,000 rows with a 60 s/20-bucket window is roughly 0.4% of one core above the no-window baseline. Demo: `demo/history-time-window.html`, count-based and time-windowed sparklines on the same never-updated row, side by side.

### Fixed

- Pushdown date/range filtering, DuckDB and OData (BACKLOG-0001026, BACKLOG-0001027). The DuckDB adapter now pushes a `between`/`notBetween` condition down as two typed, bound SQL comparisons instead of treating it as unpushable — a date-range filter authored in the grid's own date filter UI (which always emits `between`, never `gte`+`lt`) previously went fully residual, fetching the whole matching set and filtering it client-side. All four bounds spellings (`[]`, `[)`, `(]`, `()`) are honoured, matching the client engine's own `[]` default; `notBetween` deliberately keeps a `NULL` row exactly as the client-side engine does, rather than the plain SQL three-valued-logic reading, which would silently drop it. The OData adapter now writes a date/time filter value as an unquoted, typed `Edm.DateTimeOffset` / `Edm.Date` / `Edm.TimeOfDay` literal chosen from the condition's declared type, rather than a quoted string — a strict OData v4 service rejects a quoted date/time literal with an HTTP 400.

### Changed

- **The OData adapter now requires an unambiguous instant for a typed date/time filter condition.** A zone-less date-time string (`"2026-09-08T00:00:00"`, `"2026-09-08T00:00"`) used to be interpreted as *local* time and silently written into `$filter` as whatever UTC instant that happened to resolve to — a wrong absolute instant with nothing to say so. It is now refused: the thrown message says to add `Z` (UTC) or a `+HH:MM`/`-HH:MM` offset. This can break a host that was previously passing zone-less date-times programmatically (not reachable from the grid's own date filter, which always sends a full offset); the fix is to include a zone in the value — a direct consequence of the typed-literal work above, which is what surfaced the ambiguity.

## [1.49.0] - 2026-09-09

### Added

- A time window for live feeds, so a live chart keeps scrolling when the feed goes quiet (BACKLOG-0001036). `maxRows` bounds a stream by *count*, which drifts — a burst silently shrinks "the last five minutes" to two, a quiet spell stretches it to twenty — and freezes: with nothing arriving nothing is evicted and the chart stops moving, even though time is still passing. Two new options give you the window in time instead. On the source, `maxAge` (milliseconds) retains only rows younger than the span, and `ageBy` says which clock it reads: a column id, a dotted path, or a function of the row returning a `Date`, epoch milliseconds or an ISO string. Omit `ageBy` and rows age from **arrival time** — no timestamp column needed and immune to a producer's clock skew, though it is not event time. On a chart's x axis, `window: { kind: 'time', span }` — the same `WindowSpec` vocabulary rolling statistics already use — makes the domain end at *now* rather than at the newest point, so the chart keeps scrolling left with zero new rows. It works with or without `maxAge` on the source; set both to the same span and the retained data and the drawn domain agree. `maxAge` and `maxRows` compose: both are applied on the same pass and whichever bites first is the one that drops rows. Nothing about `maxRows` changes — age eviction reuses the same eviction path, so `evicted` on the progress report and the `stream:evicted` event carry an age eviction exactly as they carried a count one, and an existing "dropped off the back of the window" readout keeps working untouched. A row that arrives already older than the span is dropped on that same pass and counted, rather than shown and then withdrawn; a row whose timestamp cannot be read is never aged out. Both halves advance on a low-frequency timer (a quarter of the window, clamped to 50 ms–1 s), never on an animation frame, and both stop on destroy: an idle grid holding a five-minute window over 50,000 rows costs under 0.04% of one core, inside the measurement noise of the same source with no bound at all. Because eviction runs in blocks, a row lives a little past the span — the ten per cent slack `maxRows` already allows, plus up to one timer tick when idle — which is proportionally larger for a very short window. `createUrlSource` passes both options through. Demo: `demo/bounded-window.html`, one feed with both bounds side by side and a deliberate quiet period.

## [1.48.0] - 2026-09-08

### Added

- In-grid find with match highlighting (BACKLOG-0001018). Ctrl+F (Cmd+F on a Mac) with focus in the grid opens a find bar; typing highlights every cell whose displayed text matches, in place — no row is reordered, removed or edited. The bar shows "N of M"; Enter / Shift+Enter and the arrows step through the matches with wrap, the current match is painted distinctly and scrolled into view (a match in a not-yet-rendered virtualised row is found without rendering it), and Escape closes and clears. Options: match case, whole cell and a column scope; defaults are case-insensitive, substring, every visible column. Matches in pinned rows and pinned columns count and highlight. Find searches the formatted display text, coexists with the quick filter, and over a windowed pushdown source labels its count "in loaded rows". Typing is scanned in per-frame slices so a 100,000-row grid stays interactive. Fully keyboard operable, with the count announced through a polite live region. Programmatic API: `grid.find(text, { caseSensitive, wholeCell, columns, from })`, `find.open()`, `find.close()`, `find.next()`, `find.prev()`, `find.goTo()`, `find.matches()`, `find.count()`, `find.current()`, `find.state()`, `find.stateFor()`; event `find:changed`; config `find: false | { shortcut, debounce }` (`FindConfig`). 19 new i18n strings, translated in every bundled locale. Demo: `demo/find.html`.

### Fixed

- DuckDB adapter: a grid filter on a `TIMESTAMP`, `TIMESTAMP WITH TIME ZONE`, `DATE` or `TIME` column no longer fails with *Binder Error: Cannot compare values of type TIMESTAMP and type VARCHAR* (BACKLOG-0001022). The adapter now types the placeholder — `"ts" >= CAST(? AS TIMESTAMP)` — using the column's type as DuckDB reports it (one cached `DESCRIBE` per adapter, exposed as `adapter.describe()`), falling back to the grid column's declared type when the schema does not name the column; the value is still bound, never interpolated. Equality, ranges, `IN` and blank/not-blank all work on temporal columns; a `Date` or epoch-milliseconds value is bound as its ISO instant. Blank/not-blank on any non-text column is now `IS NULL`/`IS NOT NULL`. Text and numeric comparisons are generated exactly as before.
- Charts: the "Nothing to chart" placeholder no longer shows beneath a drawn chart, and an empty frame is no longer painted behind the message when there is nothing to chart (BACKLOG-0001023). The stylesheet now carries an explicit `[hidden]{display:none}` guard for both the placeholder and the plot, and stale groups are cleared when the chart empties. Pages that added their own scoped `[hidden]{display:none}` workaround can remove it. Charts module only; no API change.
- Charts: the plot is no longer drawn at a fractional scale under a title or legend (BACKLOG-0001025). The plot's `viewBox` was sized to the chart's container rather than to the plot's own flex remainder, so every titled or legended chart was shrunk to fit (rings undersized, 1px axis lines at sub-pixel widths, labels too small). The plot is now sized to its own laid-out box in whole pixels and re-measured when a caption or legend changes its box; pointer hit-testing and PNG export agree with the drawing. Donut and pie in-ring names are now fitted to the band (shortened with an ellipsis or dropped when only a stub would fit; the legend and tooltip still carry the full name), and an explicit `labels: false` hides the names along with the values. Arc geometry is unchanged. No API change.
- `grid.scroll.toRow` (and keyboard focus and find navigation) now lands the target row fully visible in the part of the body the pinned strips do not cover: `end` puts it just above pinned-bottom rows / a bottom grand total, `start` just below pinned-top rows / sticky group headings, and `auto` only scrolls when the row is outside that region. Previously `end` aligned the row to the body's client edge, where a bottom grand total covered it entirely. The pinned-top strip is also anchored to the body's measured top (`--lattice-body-top`), so it no longer overlays the column headings when a bar sits above the header.
- Keys typed in the find bar or the AI ask bar (any `role="search"`, `role="toolbar"` or `role="dialog"` chrome inside the grid) are no longer swallowed by the grid's keyboard layer; they behave as in any form control and still reach the page's own shortcuts.

## [1.47.0] - 2026-09-08

### Added

- AI board and Gantt risk-summary narrative: the AI layer can now produce a grounded, plain-language risk summary for a board or Gantt dataset, built from computed facts.
- Forecast confidence and prediction bands on the trendline: a chart forecast can draw a shaded uncertainty band around the projected line, choosing the prediction band (a future observation) or the narrower confidence band for the mean response, at a configurable confidence level.
- Parallel-coordinates chart legend: the parallel-coordinates chart now renders a legend.
- `groupColumns` caller-supplied band id: `groupColumns` accepts an optional `id` so a created column band carries a stable, caller-chosen identifier.
- Kanban SLA configuration in the public types: the kanban board's SLA options (global and per-column warn/breach thresholds) are now part of the published type definitions.

### Fixed

- Kanban flow-log accuracy on reverted writes: a write that is reverted no longer leaves a spurious entry in the flow log, and a `card:confirmed` event is emitted when a card write is confirmed.

### Documentation

- Data Router persistence and backpressure are now documented in the reference, including persist/restore and backpressure behaviour.
- README expanded to cover all package entry points.

## [1.46.1] - 2026-09-07

### Fixed

- Column auto-size now measures the heading: `columns.autoSize()` sizes a column to fit its header text as well as its cell values, so a column with a long heading over short values no longer collapses and clips its own title.

## [1.46.0] - 2026-09-07

### Added

- Cell vertical alignment: a new `verticalAlign` config key (`top`, `middle`, `bottom`; `center`/`centre` accepted as synonyms for `middle`) as a grid default with per-column override. It is unset by default, so grids that do not set it render byte-identically to before.
- Always-visible scrollbars: a new `scrollbars` config key (`auto`, `always`, or `{ x, y }`) that can keep the horizontal and vertical scrollbars visible on both axes rather than letting them auto-hide.

### Changed

- Overscroll bounce removed: the body viewport no longer rubber-bands past its bounds, so a grid inside a scrollable page feels anchored.
- Sort indicator placement: when header controls are hidden, the sort badge on a sorted column now right-aligns at the trailing edge at rest and shifts inboard on hover; the menu and filter controls keep their 1.45 edge positions.

## [1.45.0] - 2026-09-07

### Added

Configurable header-control visibility (headerControls: hover|always|hidden, grid default + per-column override); a live drop-preview and grab affordance for column band-drag (insertion line for reorder, target highlight for grouping, so drag-to-group is legible); and a fix for the column-group collapse toggle glyph (now shows plus when collapsed, minus when open).

## [1.44.2] - 2026-09-07

### Fixed

Pivot fix: a terminal pivot group row no longer expands into raw source rows (they have no values in the generated pivot columns and rendered blank), and the pivot row model now holds only the aggregated group rows, so a pivot shows a clean set of aggregated rows with no blank children and a correctly sized scroll area. Non-pivot grouping is unchanged.

## [1.44.1] - 2026-09-06

### Fixed

AI narrative guard fix: the reconciliation guard no longer strips digits inside identifiers (e.g. OPP-4221) or shows an "[unverified]" placeholder (it drops the unverified clause instead), and the facts packet now grounds the counts and ranges the narrative cites, so plain-language readings render clean while still never showing an unverified figure.

## [1.44.0] - 2026-09-06

AI layer v3 — governed actor (CLOSES the AI layer): `modules/ai` can turn a
plain-language instruction (including "set the Network Upgrade project to In
Progress" and kanban "move X to In Progress") into structured edit PROPOSALS the
grid validates, previews as a before/after diff, and applies only on human
approval — through the grid's own before-edit gate, tagged `origin:'ai'` so hosts
can policy-gate AI writes distinctly from people. Read-only until you approve;
scoped to your current view; reversible. BYO-model/BYO-key.

### Added

- `modules/ai`: `ai.propose(instruction)` turns a plain-language instruction into
  a validated, structured set of edit proposals over the current filtered view.
  Unknown column, not-editable, unknown label, bad-type, and out-of-range are all
  rejected before anything is shown; a label is resolved to its stored value;
  a named row is located and, when more than one matches, the candidates are
  surfaced rather than silently edited.
- `ai.applyProposal(proposal)` applies an approved proposal, writing ONLY through
  `grid.edit.setCells` with `origin:'ai'` so the change flows through the 1.36
  before-edit gate (vetoable, including async veto) with optimistic apply and
  revert-on-source-reject.
- `ai.actorBar`: an opt-in UI surface that previews the before/after diff and its
  scope and requires explicit human approval before applying.
- `proposal` event emitted by `modules/ai` for hosts that drive their own UI.
- Kanban natural-language move rides the board's own `beforeMove`/`beforeEdit`
  gate tagged `origin:'ai'`.

### Changed

- Core: the before-edit gate now fires for `origin:'user'` AND `origin:'ai'`
  (not a blanket `'api'` widening) and stamps the real origin on the payload;
  `grid.edit.setCells(writes, type, opts)` threads `opts.origin` with the default
  `'api'` unchanged for every existing caller; `'ai'` is added to the origins
  allowlist. Existing edit behavior is unchanged: a default `origin:'api'`
  `setCells` still does NOT fire `beforeEdit`.

## [1.43.0] - 2026-09-06

AI layer v2 — ask-your-data: `modules/ai` (`createAI`) now turns a plain-language
question into a schema-constrained, VALIDATED read-only query spec that the grid's
own engine executes and fans out across any mix of viewers via the Data Router.
The model returns a spec, never data; an invalid or mutation spec is rejected and
never runs; the resolved query is shown for confirm/edit before it applies
(auto-apply-safe-reads is off by default). BYO-model / BYO-key; only the schema
leaves via `ask()`, never row values.

### Added

- **AI ask-your-data (BACKLOG-0000966).** The opt-in `modules/ai` (UMD global
  `LatticeGridAI`) gains `ai.query`, `ai.applyQuery` and `ai.askBar`: a plain-language
  question becomes a schema-constrained, validated read-only query spec. A
  module-owned read-only validator gate sits over the shipped `grid.ai` schema/intent
  stack — the model returns a SPEC, never rows; an invalid or mutation spec is
  rejected and never runs. The grid's own engine executes the validated spec and
  the result fans out across any mix of viewers via the Data Router. The resolved
  query is shown for confirm/edit before it applies (auto-apply-safe-reads is off by
  default). BYO-model / BYO-key; only the schema leaves via `ask()`, never row
  values. A module-level `query` event is emitted. Zero grid-core change.

## [1.42.0] - 2026-09-06

AI layer v1 — narrative / auto-insights: a new opt-in `modules/ai` (`createAI`)
that explains and summarises the grid's own COMPUTED figures, grounded (tool-use
or facts-packet) with a number-reconciliation guard so no unverified figure is
shown; BYO-model / BYO-key (the grid ships no LLM SDK and holds no key).

(1.41 was the Python wrapper packages, published to PyPI — the grid npm line
skips 1.41.)

### Added

- **AI narrative / auto-insights module (BACKLOG-0000965).** A new opt-in
  `modules/ai` (UMD global `LatticeGridAI`) exposing `createAI(grid, { ask,
  enable, maxRows, redact })`. It produces a plain-language narrative and an
  insights panel grounded in the grid's own computed facts — schema, profile,
  statistics, forecast and view counts — via tool-use over a read-only tool set
  when the provider offers it, or a facts packet otherwise. Every emitted number
  is reconciled against the values the engine produced this render; an
  ungrounded figure is stripped before display. The module imports no LLM SDK,
  holds no key and makes no network call — it only calls the host's `ask()`
  (BYO-model / BYO-key), falling back to the grid's `ai.ask` when none is passed.
  Read-only throughout; `redact` / `maxRows` bound what reaches `ask()`, and an
  `ask()` error keeps the grid fully usable. Zero grid-core change: it consumes
  shipped surfaces only.

## [1.40.0] - 2026-09-06

A feature release across the router, board, and stats/grid layers — durable
router persistence with resume, per-route backpressure, board card aging / SLA
highlighting, a forecasting toolkit reachable from the grid, and Excel `.xlsx`
read import completing the round-trip. All additive: existing grids, boards, and
router graphs behave identically until you opt into the new surfaces.

### Added

- **Data Router durable persistence + resume (BACKLOG-0000961).** A route can
  persist its buffered events durably (IndexedDB) and resume from where it left
  off across a reload or restart, so a consumer that goes away and comes back
  does not lose the stream. Data-router-module only, zero dependency. See
  `demo/router-persist.mjs`.
- **Data Router per-route backpressure — throttle / coalesce / sample
  (BACKLOG-0000962).** Each route can shed or smooth load under pressure:
  throttle to a rate, coalesce bursts into the latest value, or sample a
  fraction — configured per route so a fast producer cannot swamp a slow
  consumer. Data-router-module only, zero dependency. See
  `demo/router-backpressure.mjs`.
- **Board / Kanban card aging & SLA highlighting (BACKLOG-0000960).** The board
  now flags cards that have sat past an age / SLA threshold. Opt in with a `sla`
  config: `warn`/`breach` thresholds (a number of ms or `{ days, hours }`),
  configurable per column (a column def's `sla`/`slaWarn`/`slaBreach`, or
  `sla.columns`) and per lane (`sla.lanes`), resolved lane → column → global.
  The ageing clock measures time in the current column (`basis: 'column'`,
  default) or age since arrival (`basis: 'board'`), read from the card's own
  timestamp properties (`enteredProperty`/`createdProperty`) or the flow
  transition log (BACKLOG-0000951) where its timestamps are wall-clock epochs. A
  warned/breached card gets a subtle indicator and an age chip (`data-sla` on the
  card, styled from `--lattice-warning`/`--lattice-danger`), and the breach is in
  its accessible name. On a rising crossing the board fires `card:sla` and calls
  `sla.onWarn` / `sla.onBreach(signal, rows)` — the **same signature a Data
  Router alert route's handler uses**, so board breaches feed the existing alert
  mechanism with one handler and no duplicated engine. An optional `sla.tick`
  re-checks on an interval so a card that breaches by simply sitting still still
  lights up. Reached at runtime as `board.sla`. Kanban-module only: no grid-core
  change, no new dependency, and all ageing maths is computed locally in the
  module bundle. See `demo/kanban-sla.mjs`.
- **Forecasting toolkit (BACKLOG-0000963).** A DOM-free forecasting kernel in
  core: moving average, exponential smoothing (SES / Holt / Holt-Winters),
  and linear regression, each with prediction / confidence bands. Exported as
  `forecast` and `FORECAST_METHODS`, and reachable from a live grid as
  `grid.statistics.forecast(colId, opts)` — the same face as the rest of the
  statistics closure — so a host forecasts a column over the filtered rows
  without wiring the kernel by hand. Zero dependency.
- **Grid `.xlsx` read import (BACKLOG-0000970).** The importer now reads Excel
  `.xlsx` files, completing the round-trip the `.xlsx` export (BACKLOG-0000949)
  began. `grid.import.previewXlsx(bytes)` parses a file into a preview and
  `grid.import.xlsx(bytes)` into coerced records; the DOM importer routes a
  dropped/opened `.xlsx` file to the Excel reader. Unzip + inflate + a small
  sheet XML scanner, all in core with zero dependency.

## [1.39.0] - 2026-09-06

A feature release across the grid, router, timeline, stats and chart layers —
Excel-style conditional formatting, a declarative validation layer, router
fan-in enrichment, gantt earned-value analytics, column describe from the
column menu, and a chart overlay fix. All additive (except the chart fix, which
only corrects a regression): existing grids, boards, timelines, charts and
router graphs behave identically until you opt into the new surfaces.

### Added

- **Grid Excel-style conditional formatting (BACKLOG-0000955).** Declarative
  visual renderers in the headless rule engine — data bars (`dataBar`) and icon
  sets (`iconSet`, with a built-in `ICON_SETS` catalogue) — computed in core and
  consistent with export, not just a DOM decoration.
- **Grid declarative column validation layer (BACKLOG-0000956).** Per-column
  rules (`column.validation`) evaluated on the cancellable `beforeEdit` path:
  an invalid write is vetoed and surfaced inline, with a `grid.validation` API
  (`validation:failed` / `validation:cleared` events) and localized messages.
- **Data Router fan-in JOIN / enrichment (BACKLOG-0000957).** Join and enrich
  rows across multiple sources as they flow through the router, so a downstream
  view receives one enriched stream instead of several partial ones.
- **Gantt earned-value analytics (BACKLOG-0000958).** Compute earned-value
  metrics (PV/EV/AC, SPI, CPI) at a status date (`computeEarnedValue`), for
  schedule- and cost-performance reporting off the same plan.
- **Column describe via the column menu (BACKLOG-0000959).** Open a column's
  statistics ("describe") profile straight from the column menu
  (`column:profile:open`), now including categorical top-values in the profile.

### Fixed

- **Chart overlays erased each other (BACKLOG-0000973).** Trend/forecast and
  annotation overlays were drawn onto a shared layer and clobbered one another;
  each now renders on its own layer so trend and annotations coexist on one
  chart.

## [1.38.0] - 2026-09-06

A feature release across the analytics layer — gantt resource management, grid
CSV import, kanban flow metrics, chart trendlines, and rolling anomaly
detection. All additive: existing grids, boards, timelines, charts and stats
calls behave byte-for-byte identically until you opt into the new surfaces.

### Added

- **Gantt resource management (BACKLOG-0000948).** Assign resources to tasks,
  detect over-allocation against per-resource capacity, and level a plan to
  resolve conflicts — with an over-allocation highlight in the timeline and a
  resource-load report (`resourceLoad`, `overAllocations`, `levelResources`).
- **Gantt MS Project (MSPDI) XML import/export (BACKLOG-0000950).** Round-trip a
  plan with Microsoft Project via `importMSPDI` / `toMSPDI`, mapping tasks,
  dependencies, calendars and resource assignments.
- **Grid CSV/TSV/clipboard row import (BACKLOG-0000949).** The mirror of export:
  a built-in importer (`grid.import(...)`, `config.import`) with a preview
  dialog, column mapping, and localized import strings — bring rows in from a
  file or the clipboard.
- **Grid user-gesture row delete (BACKLOG-0000968).** An opt-in built-in
  row-delete gesture (Delete key / "Delete row" menu, `config.rowDelete` and
  `grid.edit.deleteRows(...)`) routed through the cancellable `beforeDelete`
  veto, so a host can confirm or block a deletion.
- **Kanban flow metrics (BACKLOG-0000951).** Cycle time, lead time, throughput,
  WIP and a cumulative-flow diagram (CFD), computed locally from board history.
- **Chart trendline & forecast overlays (BACKLOG-0000952).** A declarative
  `spec.trend` for line/bar/scatter charts — linear, moving-average and
  exponential (SES / Holt) fits, with optional forecast horizon and R² label.
- **Chart annotation delta (BACKLOG-0000953).** Vertical bands and event markers
  extend the annotation surface, positioning against the x-axis (a category or
  a number) rather than only a measure range.
- **Rolling anomaly detection + Data Router alert bridge (BACKLOG-0000954).**
  Windowed anomaly scoring over a live stream (`rollingAnomalies`,
  `ROLLING_ANOMALY_METHODS`) and an `anomalyCondition` helper that turns a
  detector into a Data Router alert condition.

## [1.37.0] - 2026-09-06

WCAG 2.2 AA conformance: aria-expanded on popup triggers (filter/menu/submenu),
localized built-in control accessible names + tool-panel text (i18n), explicit
filter-dialog modality, a new popup-trigger-expanded accessibility check, and a
typed `params.t` localization hook for custom renderers.

The VPAT (conformance report), the manual screen-reader test matrix, and the
independent third-party audit are tracked separately and are not part of this
release.

## [1.36.0] - 2026-09-06

A feature release that adds a **cancellable before-event contract** across the
grid, kanban board and gantt timeline, a turnkey **`createUrlSource`** for
loading a JSON or NDJSON file straight from a URL, and a **Data Router overlap
warning**. All additive — existing grids, boards, timelines and routers keep
working unchanged; no before-handler is registered by default, so every path is
byte-for-byte identical until you opt in.

### Added

- **Cancellable `before*` events (BACKLOG-0000943, -0000946, -0000947).** A new
  async veto contract that gates user-initiated mutations at the choke points:
  `beforeEdit`, `beforeSort`, `beforeFilter`, `beforeColumnMove/Resize/Hide`,
  `beforeSelect`, `beforeRowAdd`, `beforeDelete`, `beforeRowMove` and
  `beforeGroup` in grid core; the board's `beforeMove/Add/Edit/LaneReorder/`
  `ColumnReorder/ColumnChange`; and the timeline's `beforeTaskMove/Resize/`
  `MilestoneMove/ProgressChange/TaskEdit/DependencyCreate/TaskDelete`. A handler
  cancels with `preventDefault(reason?)` (or by returning `false`) and may be
  **async** — the mutation is held until every handler settles, a veto wins, and
  a throw is surfaced as a cancel. On a veto the choke point fires
  `<action>:cancelled` with the reason. Live/router deltas (`origin !== user`)
  never reach a gate, and `origin` rides each before-event so modules can dedupe.
  Guarded editing and confirm-before-delete become one-liners.
- **`createUrlSource` — load a file from a URL (BACKLOG-0000944).**
  `createGrid(el, { source: createUrlSource(url, opts) })` reads a **JSON** file
  (a top-level array, or a nested array selected by `rowsPath`/`map`) whole, or
  **streams an NDJSON/JSONL** file in incrementally in batches so the first rows
  render while the rest is still on the wire. Format is resolved from `format`,
  the URL extension, the `Content-Type`, or a byte sniff; errors surface as
  `source:error`, never an uncaught throw; optional `poll` re-fetches on an
  interval. Zero new dependencies (`fetch`, `getReader()`, `TextDecoder`).
  Re-exported from the core and DOM barrels.
- **Gantt hover-highlight + split-panel inline edit (BACKLOG-0000942).** Hovering
  a bar highlights its row and dependencies; the split panel gains inline field
  editing routed through the new `beforeTaskEdit` gate.

### Changed

- **Data Router — overlap collision warning (BACKLOG-0000945).** With
  `overlap: false`, two consumers attaching to the same partition value used to
  leave the second silently empty (the footgun behind the 1.35.0 KPI demo). The
  router now emits a single `[lattice]` dev-warning naming the collision.
- **Event-name registry hardening (BACKLOG-0000941).** `print:before/after`,
  `export:request/done` and `shortcuts:opened/closed` — emitted through optional
  chaining and so previously escaping the emit-name gate — are now declared, so
  subscribers no longer get the unknown-event warning. `checkEventNames` now also
  scans the `emit?.()` call form, closing the class that let those ship
  undeclared.

## [1.35.0] - 2026-09-05

A feature release that adds a fourth routed view module — a **KPI / stat-tile**
viewer — completes the **Kanban** and **Gantt** modules to their v2 feature set,
and documents the full **Data Router** method surface. All additive — existing
grids, charts, boards, timelines and routers keep working unchanged.

### Added

- **KPI module — `@toclocoinc/lattice-grid/modules/kpi`.** A fourth routed viewer
  alongside the grid, kanban and gantt. `createKPI(el, config)` renders one or
  more stat tiles — value, delta, sparkline and target — computed by incremental
  aggregation over a row source, and updates live through the Data Router viewer
  contract (`rows.apply`) so tiles recompute as the feed changes rather than
  recomputing from scratch. It ships a UMD/global build (`modules/kpi.min.js`,
  plus the `.umd.js` and `.min.cjs` flavours) publishing the `LatticeGridKPI`
  global, so a page can load it from a CDN with a plain `<script src>` and no
  bundler (BACKLOG-0000927).
- **Full Data Router API documentation (BACKLOG-0000928).** The developer
  reference now documents the complete Data Router method surface — time-travel /
  replay, cross-tab sync, pushdown query, write-back, fan-in and observability —
  with four runnable examples, so the router's capabilities are discoverable from
  the docs rather than only from source.

### Changed

- **Kanban v2 — module complete + scale (BACKLOG-0000937).** The board now
  supports a custom `cardRenderer`, card covers and per-card progress, a
  sprint/backlog dataset shape, lane reordering and `enforceWip` limit
  enforcement. Write-back is fixed to resolve a card by id **or** field and a
  phantom-move guard prevents a dropped card from being applied twice. Large
  boards are windowed for smooth scroll, with a soak test covering sustained
  updates at scale.
- **Gantt v2 — joined split-view + scheduling depth (BACKLOG-0000938).** A new
  row-aligned **joined split-view** (`split.js` / `mountSplit`) keeps a host grid
  and the timeline scrolled and aligned row-for-row. Scheduling gains a
  working-time **calendar** (non-working days/weekends), **baseline** bars for
  planned-vs-actual, task **constraints**, and a `projectStart` that accepts an
  ISO string or a `Date`. Includes a scheduling gap-audit and split-view
  alignment/browser tests.

## [1.34.1] - 2026-09-05

A patch release that fixes a bundler defect which silently dropped destructured
imports whose names begin with `from` from the built bundles. The source was
always correct; only the shipped bundles were affected, so a fix is a drop-in
upgrade with no API change.

### Fixed

- **Bundler no longer drops imports whose names begin with `from`.** The bundler
  located the `from` keyword of an import statement with `indexOf('from')`, which
  matched the substring `from` *inside* an imported identifier (e.g.
  `fromDayNumber`, `fromInputValue`) and truncated the brace list — silently
  dropping that binding, and everything after it, from the emitted chunk. The
  clause boundary is now taken from the `from\s*['"]` source-match index, which
  only ever matches the real keyword. This restores:
  - **Gantt `nonWorking: 'weekends'` weekend shading**, which threw
    `ReferenceError: fromDayNumber is not defined` at mount in 1.34.0.
  - **Core date-filter input parsing** — `fromInputValue` / `toInputValue` were
    dropped from the `lattice-grid.*`, `htmx.*` and `webcomponent.*` bundles
    (ESM and UMD).
- **Added built-bundle regression tests** (`test/bundler.test.js`,
  `test/gantt-bundle-nonworking.test.js`) that exercise the shipped artifacts in
  both ESM and UMD form, so a dropped binding cannot ship silently again.

## [1.34.0] - 2026-09-05

A feature release that adds two new opt-in view modules — a project-planning
**Gantt** chart and a **Kanban** board — and grows the Data Router with
write-back, fan-in and observability. Both new modules also ship UMD/global
builds, so they are usable from a plain `<script>` tag with no bundler. All
additive — existing grids, charts and routers keep working unchanged.

### Added

- **Gantt module — `@toclocoinc/lattice-grid/modules/gantt`.** A dependency-free
  project-planning view built on a critical-path (CPM) scheduling engine.
  `createGantt(opts)` renders an SVG timeline — bars, dependency arrows, the
  critical path, milestones and summary tasks — from a task/dependency model, and
  `computeSchedule(...)` / `findViolations(...)` expose the engine on their own
  (early/late start-finish, total float, critical flag; the four `LINK_TYPES`
  FS/SS/FF/SF with lag/lead). It supports drag-edit with write-back and
  validation, time-scale zoom and scroll-to-today, overdue/at-risk indicators and
  deadlines, grouping/swimlanes, export (tasks to CSV, chart to SVG), a full
  keyboard/ARIA accessibility path with live announcements, split-view sync with a
  host grid, and live updates through the viewer contract (`rows.apply`).
- **Kanban module — `@toclocoinc/lattice-grid/modules/kanban`.** An opt-in board
  view over any row source. `createKanban(el, config)` groups rows into columns
  by a property with per-column WIP limits, drag-and-drop between columns with
  write-back and a veto hook, selection and a context menu, swimlanes with
  collapse/expand, column reorder, filter/search, sprint/backlog and epic
  view/rollup, a card pop-out nested grid, inline card edit through the grid's own
  field editors and add-card, live updates via the Data Router viewer contract,
  and — for large boards — column virtualization, cross-lane keyboard navigation
  and saved/restored board state.
- **Data Router — write-back routing (BACKLOG-0000912).** An edit made in an
  attached view now routes **back** through the router's `onWrite` handler, so a
  change in one routed grid can be persisted and reflected across the graph rather
  than staying local to the view that made it.
- **Data Router — fan-in (BACKLOG-0000931).** One router can now ingest **many**
  source feeds, merging multiple upstream streams into the single ordered,
  de-duplicated keyed-diff path the routes already consume — the inverse of the
  fan-out it already did.
- **Data Router — observability (BACKLOG-0000932).** `metrics()` reports the
  router's live counters and `on('metrics', ...)` streams them, and a new
  `modules/data-router/devtools.js` renders a live devtools panel over that feed
  for inspecting routing behaviour in place.
- **UMD/global builds for Gantt and Kanban (BACKLOG-0000933).** Both new modules
  now emit UMD builds (`modules/gantt.min.js`, `modules/kanban.min.js`, plus the
  `.umd.js` and `.min.cjs` flavours) publishing `LatticeGridGantt` and
  `LatticeGridKanban` globals, so a page can load either from a CDN with a plain
  `<script src>` and no bundler — the same script-src + globals route the Data
  Router and the other modules already offer. The ESM outputs are unchanged.

## [1.33.0] - 2026-09-05

A feature release on two fronts: the Data Router grows the primitives that let
anything — not just a grid — ride a routed stream, syncs across tabs, and can be
sourced from a pushdown query; and the chart library gains 18 new types on a
tree-shakeable registry. All additive — existing routers, routes, grids and
charts keep working unchanged.

### Added

- **Data Router — route to any view, not just a grid.** `subscribe(value,
  handler)` hands a non-grid consumer (a KPI tile, a detail pane, a map, a form)
  the same keyed diff `{ add, update, remove }` a grid receives, with the same
  optional `transform`/`filter`/`sort`/`rollup` surface as `attach`. Grids and
  charts are unchanged; a subscriber is simply a route whose sink is a function.
- **Data Router — alert/signal routes.** `alert(value, condition, handler,
  { debounce })` is a route that evaluates a condition over its slice and
  **emits** instead of rendering. It is edge-triggered (fires once per crossing
  and re-arms on release), debounced/coalesced, and monitors the live stream
  independently of routing and of any time-travel scrub. It owns no UI.
- **Data Router — declarative configuration.** `configure(spec)` (and
  `createDataRouter({ config })`) expresses the whole routing graph — routes,
  subscribers, alerts, the default, cross-grid links, the relationship graph and
  the time-travel buffer — as one data spec that desugars to the imperative API
  and composes with it, round-tripping to identical behaviour.
- **Data Router — cross-tab / pop-out sync.** Opt-in `router.broadcast({ channel
  })` mirrors the router's ordered, de-duplicated deltas to peer tabs and windows
  over a `BroadcastChannel`, so a popped-out grid joins the same feed with no
  second socket. Inbound mirrors apply through the ordinary keyed-diff path and
  are not re-broadcast (no echo loop); a tab joining mid-stream announces itself
  and a peer answers with a snapshot plus resume checkpoint, so it resyncs via
  the v3 reconnect path. Off by default — no `broadcast()` opens no channel.
- **Data Router — DFQL/DuckDB query-slice routing.** `router.query(adapter,
  request)` sources the router from a pushdown query, partitions the result
  across the routes, and — where a route declares a `where` — pushes that filter
  **down** to the engine where the adapter's capability model allows (reusing the
  pushdown SDK's `planQuery`/`capabilitiesOf`) and finishes the residual
  client-side. It composes with the transform/filter/sort/rollup path and with
  cross-grid links; `lastQueryPlan()` reports the pushed/residual split per fetch.
- **`mock-socket` now ships a UMD build and browser global.** The
  `@toclocoinc/lattice-grid/modules/mock-socket` module shipped ESM-only in
  1.32.0; it now also emits `modules/mock-socket.min.js` (UMD), `.umd.js` and
  `.min.cjs`, publishing a `LatticeGridMockSocket` global — so a page can build a
  realtime demo in the pure script-src + globals vanilla form with no bundler,
  exactly as the Data Router and the other modules already allow. The ESM outputs
  are byte-unchanged; this is purely additive.
- **18 new chart types on a tree-shakeable registry.** A shared chart registry
  (`registerChartType` / `registeredChartTypes`, re-exported from the charts
  barrel) lets the base `Chart` draw any type it does not draw natively via a
  one-time ~3.4KB seam that does **not** grow as types are added; each type is its
  own opt-in `chart-*` module that self-registers on import and ships only its
  geometry (a few KB), drawing through the base's `CHART_TOOLKIT` rather than
  re-importing heavy primitives. New types: **ridgeline, calendar, SPLOM, hexbin,
  icicle, waffle, alluvial, arc, bubble map, hexbin map, slope, dumbbell, bump,
  diverging, parallel-coordinates, ROC/PR/calibration, fan/forecast** and
  **decomposition**.

## [1.32.0] - 2026-09-05

A feature release built around the Data Router: it grows from a fan-out switch
into a small streaming layer, gains time-travel, and ships with a dependency-free
mock socket so you can build and test a realtime UI with no backend. All additive
— existing routers, routes and grids keep working unchanged.

### Added

- **Data Router v3 — per-route reshaping, a relationship graph, and stream
  hygiene.** A route can now `transform` each row (map/rename/derive) before its
  grid sees it, `filter` down to the rows it admits, and `sort` what it receives
  (a comparator or `{ key, dir }`) — all on `attach`/`attachDefault`, all
  optional. New `rollup` routes emit one aggregated summary row per group
  (`rollup: { groupBy, aggregate }`) instead of the raw rows. A declarative
  relationship graph links grids across the router — multi-hop, multi-source and
  mutual/bidirectional edges — so a selection or key in one grid resolves related
  rows in others. And the stream layer makes a live feed safe to drink from:
  deltas are applied **in `seq` order and de-duplicated**, high-frequency updates
  to a key are **coalesced** into a single applied change (batched by `push()`),
  and a dropped connection **resumes** from the last applied `seq` with a
  snapshot-plus-replay rather than a full reload.
- **Data Router time-travel — buffer, scrub, replay, return to live.** The router
  can now buffer its own stream (`buffer({ window, max })`, opt-in and bounded: a
  moving base snapshot plus a capped ring of deltas) and move a consumer through
  time. `scrubTo(seqOrTime)` reconstructs the world at any point and pushes it to
  the grids by the same keyed diff live uses, so scroll and selection survive and
  only changed rows repaint. `replay(from, to, { speed })` walks a range delta by
  delta with `pause()`/`resume()`, and `live()` rebuilds the head. Live deltas
  keep extending the resumable head while scrubbed; the grids simply do not
  repaint until you return to live.
- **New module: `@toclocoinc/lattice-grid/modules/mock-socket`.** An opt-in,
  dependency-free stand-in for a live `WebSocket` — same surface (`readyState`
  and the state constants, `onopen`/`onmessage`/`onclose`/`onerror`,
  `addEventListener`, `send`, `close`) so the code reading it does not change when
  you swap in a real socket. It opens after a short delay, emits a `snapshot`,
  then pumps `delta` messages. Ships with ready-made feeds — `opsFeed` and
  `priceFeed` (generators) and a small seeded `rng` — so you can build and test a
  realtime, router-fed UI with no backend at all.

## [1.31.1] - 2026-09-05

A patch release: two rendering fixes and one row-surface refinement. No public
API, event or config change; a grid you already run upgrades in place.

### Fixed

- **Derived panels now repaint when their source changes.** A grid built over
  `source: { mode: 'derived', … }` re-derived its rows correctly when the parent
  it follows was filtered, sorted or fed new data, but the panel's DOM was never
  repainted — so connected panels (per-rep totals, cross-filtered summaries, and
  the like) showed stale values on screen while the model underneath was right.
  A grid now repaints when its own source announces a data change. Only derived
  panels were affected; ordinary grids were never stale. The gap escaped the
  headless demo gate because it has no layout to look at, so a browser/DOM-level
  regression test now guards it.
- **The column filter popup no longer opens over the content above a grid.** On a
  short grid sitting low in the viewport under taller content (charts, say), the
  set-filter popup could flip *above* the grid's header and land over that
  content. It now prefers to open below the header and is clamped to the grid's
  own top edge, overlaying its own rows rather than whatever sits above it.

### Changed

- **Row separators, zebra striping, hover and selection now span the full grid
  width** when the columns do not fill it, instead of stopping at the last
  column. The area past the last column is inert filler — not a data cell, and
  never counted, sorted or exported. It is on by default and does not affect
  horizontal scrolling when the columns do exceed the width, pinned columns, or
  selection and hover behaviour.

## [1.31.0] - 2026-09-04

A feature release, additive and opt-in. A grid you already run keeps rendering
and reading exactly as before; the read path, the ESM builds and the package
`exports` map are unchanged.

### Added

- **Data Router.** A new optional, zero-dependency, headless-capable module,
  `@toclocoinc/lattice-grid/modules/data-router`, that takes one arriving stream
  or dataset and splits it across many grids by what each record *is*
  (BACKLOG-0000879). `createDataRouter({ key, rowKey, overlap?, onUnrouted? })`
  fans a snapshot out as a keyed diff per grid (so unchanged rows never repaint)
  and applies deltas in place by `rowKey`; a row whose partition changed moves
  between grids rather than duplicating, and an unmatched record is counted,
  sunk and never dropped. It rides the public `grid.rows.apply` path only — no
  grid-core change. **v2 adds cross-grid selection filtering** (BACKLOG-0000880):
  `link(source, target, relation)` makes a selection in one grid filter what
  another receives, by a key map `{ from, to }` or a
  `fn(selectedSourceRows) => predicate`, multi-select as an IN set, debounced,
  re-pushed through the same keyed-diff path so the target grid stays dumb.
- **Text annotations.** The durable annotation model gains a `text` mark type
  (BACKLOG-0000875): a label anchored at a single content point with a `text`
  string and basic style (`colour`, `fontSize`, `background`). It seeds through
  `state.annotations`, adds through `grid.annotate.add`, and round-trips through
  `getState`, tracking scroll and resize like every other mark.

### Changed

- **Charts: unknown aggregation functions no longer fail silently.** A chart
  measure `fn` that names no known aggregation warned nothing and was quietly
  treated as `sum`, so a typo produced a plausible, wrong chart. It now warns
  once (naming the value and the supported set) and falls back to `sum` so the
  chart still draws (BACKLOG-0000878). `mean` is registered as a documented
  alias for `avg`.

### Fixed

- **`annotation:changed` is now a declared event** (BACKLOG-0000876). It was
  emitted but not in the `EventName` union or the event-name lists, so a
  subscriber had to use the `'*'` wildcard and `grid.on('annotation:changed',
  …)` risked the unknown-event warning; the framework adapters could not expose
  it. It is now declared everywhere the other events are, so `onAnnotationChanged`
  reaches it on React, Vue, Svelte and Angular.

## [1.30.0] - 2026-09-04

A feature release, additive and opt-in. A grid you already run keeps rendering
and reading exactly as before; the read path, the ESM builds and the package
`exports` map are unchanged.

### Added

- **Declarative and durable annotations.** A host can now pre-load annotation
  marks and persist them, not just draw them live (BACKLOG-0000813).
  `state.annotations` seeds marks on first paint the way `state.redaction` seeds
  redactions; `grid.annotate.add(mark)` adds a mark durably without synthesising
  pointer input; and seeded or added marks round-trip through `getState` and a
  saved view. Marks are stored in content coordinates, so they track scroll and
  resize instead of hanging over the viewport, and durable marks survive a
  presentation ending. A mark is `{ type: 'freehand' | 'arrow' | 'rect' |
  'highlight', points, colour? }`.
- **Time-series analytics, phase 2.** Four kernels on the phase-1 ordered-pass
  foundation (BACKLOG-0000873), each verified against statsmodels in CI:
  - **Seasonal decomposition** into `tsTrend`, `tsSeasonal`, `tsResidual` shadow
    columns over a declared period, with a `tsCoverage` stamp for the partial
    edges (classical additive or multiplicative).
  - **Exponential smoothing** — `tsSmoothed` from single (SES) or Holt
    (level+trend) smoothing, the factor caller-set or fit by minimising in-sample
    SSE and reported by `tsSmoothingAlpha` / `tsSmoothingBeta`.
  - **Stationarity** — `grid.statistics.adf(...)`, the Augmented Dickey-Fuller
    test (constant+trend, lag by AIC) with a statistic, the lag used, critical
    values and a plain-language verdict.
  - **Autocorrelation** — `grid.statistics.acf(...)`, the ACF and PACF arrays
    beyond lag 1 with the approximate ±1.96/√n band, ready for a correlogram; the
    lag-1 autocorrelation is the same figure the series summary already reports.

## [1.29.0] - 2026-09-04

A feature release, additive and opt-in. A grid you already run keeps rendering
and reading exactly as before; the read path, the ESM builds and the package
`exports` map are unchanged.

### Added

- **Regression toolkit.** `grid.statistics.regressionModel(...)` fits a
  multi-predictor linear model (OLS, WLS and robust Huber) and returns its
  coefficients, standard errors, t and p, R²/adjusted R², per-row fitted values,
  residuals, leverage and Cook's distance, VIF per predictor, a Breusch–Pagan
  heteroscedasticity test, and a pointwise confidence band. A diagnostics tool
  panel shows the fit; model-backed shadow columns (`fitPredicted`,
  `fitResidual`, `fitInfluence`, `fitStdResidual`, `fitLeverage`, `fitCooksD`)
  put the per-row diagnostics into the data — sortable, filterable, exportable,
  following the grid's filters. The charts module gains `regressionPlots(...)`,
  which turns a fitted model into ready diagnostic chart specs: fit-with-band,
  residuals-vs-fitted, QQ, scale-location, residuals-vs-leverage, a
  multicollinearity correlogram, and a coefficient forest plot — the last two
  drawn with two new chart primitives (a varying-width confidence-band ribbon and
  an explicit-bound error-bar whisker) and a `forest` chart type.
- **Rolling time-series columns.** New shadow kinds compute rolling aggregates
  over a stated `orderBy` in one cached ordered pass: `rollingSum`, `rollingAvg`,
  `rollingMin`, `rollingMax`, `rollingQuantile` (exact to a span cap, then a KLL
  sketch stamped approximate), `windowCoverage`, `windowApproximate`,
  `cumulativeToDate` and `periodOverPeriod`. Count, time and session windows;
  per-group or global.
- **Angular adapter.** `lattice-grid/modules/angular` builds a standalone
  component and a directive from one shared controller, at parity with the
  React, Vue and Svelte adapters — Angular and `createGrid` are injected, no
  dependency is bundled, and construction is browser-guarded for SSR.
- **`timestamp` column type.** An OLS-instant timestamp with time-zone-aware
  parts, bucketing and Excel serialisation.
- **Column-group drag.** Banded column-group headers can be formed, renamed,
  dissolved and reordered by keyboard chords and by pointer drag, each step
  announced for assistive technology.

### Changed

- **`header.render` accepts a component form**, matching the cell renderer's
  component contract.

## [1.28.0] - 2026-09-04

A feature release, additive and opt-in, with a licensing clarification. A grid
you already run keeps rendering and reading exactly as before; the read path, the
ESM builds and the package `exports` map are unchanged.

### Added

- **Native annotation rail.** The pen, arrow, rectangle and highlighter tools are
  now built-in toggle buttons on the tool-panel action rail rather than something
  a host has to wire up. Turn them on with `toolPanel: { annotate: true }`, or let
  them appear automatically for the duration of a presentation. The active tool
  shows pressed, and pressing it again exits it — no host code required. Off by
  default. English labels ship now; the other locales fall back to English until
  their translations land.

### Changed

- **The Web Component module exposes the headless and data-source factories.**
  `createHeadlessGrid`, `duckdbAdapter` and `createPushdownSource` are now
  re-exported from the Web Component bundle, matching the htmx entry, so a page
  that adds `<lattice-grid>` reaches them without pulling a second copy of the
  engine.
- **npm discoverability.** The published package now carries search keywords and
  a `repository` field, so it is findable on the registry and links back to its
  source.
- **Licence terms: serving is free-but-watermarked.** Section 3 of the LICENSE
  now matches how the product behaves and what the site terms say: serving from
  any non-loopback host is permitted without a key and renders the full grid with
  a trial watermark; a key removes the watermark, and that is the whole of what it
  does. Loopback hosts remain entirely free and unwatermarked.

### Fixed

- **Chart event documentation.** The chart events reference described a
  `point:click` event and a nested `{ point }` payload that never existed. It now
  documents the real events and the flat `{ label, category, column, value,
  series, rowKeys, native, preventDefault }` payload, plus `filterOnClick`.

## [1.27.0] - 2026-09-04

A feature release, all additive and opt-in. Every new surface is off by default,
so a grid you already run keeps rendering and reading exactly as before until you
turn one on. The read path, the ESM builds and the package `exports` map are
unchanged.

### Added

- **Framework adapter parity across the board.** The Svelte adapter now exposes
  live access to the underlying grid instance, so you can call the full grid API
  from a component rather than only pass config in. The htmx and Web Component
  builds now expose the complete factory surface, charts included, matching what
  the ESM and React entries already offered. Vue gets type and attribute fixes so
  its props and events line up with the documented shapes.
- **A GraphQL source adapter.** Point a grid at a GraphQL endpoint the same way
  you point one at REST or OData: it maps query, sort, filter and pagination onto
  a GraphQL operation and reads rows back from the result. Off by default; it adds
  nothing to a grid that does not use it.
- **Built-in analytics presentation surfaces.** A KPI strip (`kpis`) places a
  labelled band of stat tiles above the column header, each tile a `createStat`
  spec the grid computes and keeps in step with the grid's filters. An insights
  panel runs subset, dataset and group comparisons and reports effect size,
  confidence interval and p-value in-panel. An anomaly summary chip
  (`anomalySummary`) reads how many rows an anomaly shadow column has flagged and
  filters the grid to exactly those on click. All three are off by default and
  reuse existing compute rather than reimplement it.
- **Anomaly detection.** A column can declare an anomaly shadow that flags
  outlier rows, and a report summarises the method, threshold and count. The
  shadow column is the single source both the chip's number and its click filter
  read, so the count is the number of rows the filter reveals.
- **Two-sample hypothesis testing (`compareGroups`).** Compare two groups and
  read the test, the effect size and the confidence interval, with a small-sample
  caution when the data warrants it.
- **Bulk edit, and fill down and series.** Edit a whole selection at once, fill a
  value down a column, or extend a numeric or date series across a range.
- **Write-back verb parity.** Delete and add-row now work alongside cell update
  across DuckDB, OData and REST, so the three verbs are available on every
  write-capable adapter rather than update alone.
- **Server-ordered optimistic append on windowed sources.** An appended row shows
  immediately and settles into the order the server returns, correctly, on a
  windowed (virtualised) source.

### Changed

- **Annotations exit on Escape and scroll through with the grid.** Pressing
  Escape leaves annotation mode, and annotations track the content as it scrolls
  rather than detaching from it.
- **Chart error bars warn when they would mislead.** A chart configured with
  error bars whose data cannot honestly support them now warns loudly rather than
  drawing a bar that reads as certainty it does not have.

### Fixed

- **Test-harness memory safety, and a gate that runs the full suite.** The test
  harness no longer exhausts memory on the full run, and `check.js` now runs the
  entire suite, so a green gate proves zero test failures rather than a subset.

## [1.26.0] - 2026-09-03

A feature release, all additive and opt-in. Write-back is off by default on every
adapter, so a grid you already run over a remote source keeps reading exactly as
before until you turn a write path on. The read path, the ESM builds and the
package `exports` map are unchanged.

### Added

- **Write-back over remote sources now persists cell edits, deletes and
  add-row, across DuckDB, OData, REST and DFQL.** A committed cell edit is sent
  to the backend as an update; a row can be deleted or appended and the change
  is persisted the same way. Each adapter opts in explicitly (for example
  `edit: true` on OData and REST, `writable: true` on DuckDB), and declares
  which kinds it supports through a `mutate` capability of the shape
  `{ update, delete, append, returning }`. Anything an adapter has not opted
  into stays read-only, and a write to a path it does not support is refused
  loudly rather than dropped in silence.
- **An optimistic structural engine for add-row and delete.** An appended row
  shows immediately under a client temp key while it is being persisted; when
  the server hands back the real key the row is rekeyed everywhere the grid
  tracks it, so selection, expansion, focus and any in-flight cell edits all
  follow it from the temp key to the server key. A delete tombstones the row at
  once and either confirms it or restores it exactly as it was if the backend
  refuses.
- **Row lifecycle events and a grid add-row/delete API.** New `row:pending`,
  `row:confirmed`, `row:reverted` and `row:conflict` events report where a
  structural write is in its life, and `grid.edit` gains `addRow`, `deleteRow`,
  `settleRow`, `rowStatus` and `pendingRows` as the structural counterparts of
  the cell edit path.
- **The write-back surface is fully typed and documented.** Every write-back
  option on every adapter (the update, delete and add-row hooks, the reconcile
  contract, and the per-adapter transport hooks) is declared in the TypeScript
  types and carries a reference entry, a runnable example and a test, so the
  completeness gate covers the write path the same way it covers the read path.

### Changed

- **Test-harness memory-safety hardening.** The test harness bounds its
  inspection of DOM nodes so that a failed assertion can no longer exhaust
  memory on the host, keeping a large suite run within a predictable footprint.

## [1.25.0] - 2026-09-03

A feature release, all additive. Grids you already run are unaffected, and the
ESM builds and the package `exports` map are byte for byte unchanged. This
release only adds new files.

### Added

- **Every optional module now loads from a plain script tag.** charts,
  devtools, dhtmlx-compat, webcomponent, react, svelte and vue used to ship as
  ESM only, reachable through a bundler or an import. Each now also ships a
  global build (`modules/<name>.min.js`) and a CommonJS build
  (`modules/<name>.min.cjs`) alongside the existing ESM one, so you can drop any
  of them onto a page with `<script src>` and no bundler, no import and no
  `type=module`. This is the same route htmx already had, now offered for all of
  them.
- **charts, devtools, dhtmlx-compat and the web component extend the core
  global.** Load the core script first, then the charts script, and the charts
  API arrives on the grid you already have as `LatticeGrid.createChart(...)`.
  The module folds its exports onto the existing `LatticeGrid` rather than
  replacing it, so nothing the core published is lost and script order beyond
  "core first" does not matter. The web component registers its custom element
  on load, as before.
- **The framework adapters get their own globals.** The script-tag builds for
  react, svelte and vue publish `LatticeGridReact`, `LatticeGridSvelte` and
  `LatticeGridVue`, kept separate from the core global so an adapter never
  overwrites the grid.

## [1.24.0] - 2026-09-03

A feature release, all additive. Grids you already run are unaffected: every
change below is something you opt into.

### Added

- **Windowed aggregates you can call directly.** `grid.statistics.windowed(...)`
  answers "the average lately" without you slicing the data yourself. Reduce a
  column over the last N rows, the last N minutes, or the current session, and
  the figure comes back stamped with the exact window it covered, so a number on
  screen always says what it is a number of. It is the same window a live grid
  can drive tick by tick.
- **Two metrics at different scales on one chart.** Bar and line charts now take
  a second value axis, so you can plot, say, revenue against conversion rate on
  the same chart and read both without one flattening the other. Each series
  binds to the axis you choose.
- **Reference lines, target lines, and shaded bands on charts.** Mark a target,
  a threshold, or an acceptable range directly on a chart with declarative
  annotations, so the context a reader needs sits on the chart rather than in a
  caption beside it.
- **Currency as a real type.** A currency cell stores an amount together with its
  currency code, so 10 USD and 10 EUR are different values rather than the same
  bare number. Convert between currencies with your own exchange rates, and a
  total across mixed currencies refuses to silently add unlike ones rather than
  handing you a meaningless sum. An editor for entering amount and currency is
  included and localised across every bundled locale.
- **Pivot as a presentation you can browse.** Turn a grid into a pivot with row
  and column dimensions, expand and collapse groups, and read subtotals that
  match the grid's own totals exactly. It is a way to look at the data you
  already have, not a separate export.

### Fixed

- **`edit: true` over a writable remote source now activates.** Setting
  `edit: true` on a grid backed by a remote source that can persist writes now
  turns editing on as intended, instead of quietly doing nothing. When the
  source cannot persist writes, the grid says so plainly rather than leaving you
  to wonder why an edit did not stick.

## [1.23.0] - 2026-09-03

A feature release, all additive. Grids you already run are unaffected: remote
sources stay read-only unless they opt in.

### Added

- **Editable grids over remote sources.** A grid backed by a remote source can
  now edit cells and have the change persisted, without you hand-writing a
  transport. A cell edit applies optimistically, is sent to the source's adapter
  to save, and then reconciles against what the server hands back: when the
  server returns the authoritative row, the grid shows that truth rather than the
  value typed; when the write is rejected, the cell reverts visibly and the
  reason is surfaced — nothing is left looking saved when it was not. A
  last-write-wins conflict, where the row moved underneath the edit, is surfaced
  through a new `cell:conflict` event rather than swallowed. The **DuckDB** and
  **OData** adapters implement this; both bind every value and validate every
  identifier on the write path exactly as they do on the read path.
- **Read-only by default.** A source is read-only unless its adapter declares it
  can write (`mutate: { update: true }`). A grid asked to edit a source that has
  not opted in stays read-only and says so, rather than dropping edits silently.

Not yet included: structural changes (adding or deleting rows) and write-back
over the REST and DFQL adapters.

## [1.22.0] - 2026-09-03

A feature release, all additive. Nothing in the grid you already run changes
behaviour; three new capabilities sit alongside what was there.

### Added

- **Pass/fail is now a value, not just a colour.** A column's spec status —
  whether each row is inside its limits — is a real cell value you can sort,
  filter, and group by, not merely a background tint. Two statistics roll it
  up: pass rate and failure count. Both aggregate correctly in the grand total
  and in every group subtotal, so a grouped view answers "how many failures in
  this batch" without leaving the grid. Configure limits with `lower`, `upper`,
  `warnLower`, and `warnUpper` on the shadow.
- **Compare two datasets and see which columns moved most.** A new
  `statistics.datasetVsDataset` reports, column by column, how far a second
  dataset differs from a baseline, ranked by effect size (a pooled
  standardised mean difference) so the columns that actually shifted come
  first — not the ones that happen to have large units. Useful for
  before/after, cohort-vs-cohort, and this-run-vs-last-run reads.
- **A visual rule builder for conditional formatting.** Build formatting rules
  in the panel — pick a column, an operator, a value, and a colour — with a
  live preview as you go. No hand-written JSON. Every operator is available,
  and colour scales are supported alongside single-colour rules.

## [1.21.0] - 2026-09-03

A hardening release. No new features and no API changes to the grid you already
use — the surface is the same. What changed is what happens underneath: several
ways untrusted data could reach the DOM or a downstream query are now closed,
and several ways a grid could keep memory alive after you destroyed it are now
fixed. If you mount and unmount grids over a long-lived session, or render data
you do not fully control, this is a recommended upgrade.

### Security

- **OData column identifiers are now validated before they reach the query.**
  Column and expression identifiers pushed down to an OData source are checked
  against the allowed identifier grammar rather than interpolated as-is, so a
  crafted column name can no longer alter the shape of the request that leaves
  the browser.
- **dhtmlx-compat `htmlEnable` output is now sanitised.** When a column opts
  into raw HTML via the dhtmlx compatibility layer, that HTML is run through the
  same sanitiser the DOM cell renderer uses before it is written, closing an
  injection path for grids that render HTML from their data. The sanitiser is
  now exported (`sanitiseHtml`) for callers that need it directly.
- **Clipboard and TSV/CSV export gained an opt-in formula guard.** A new
  `sanitise` option on the clipboard/export path neutralises leading `=`, `+`,
  `-` and `@` so a cell value cannot be interpreted as a formula when pasted
  into a spreadsheet. It is opt-in so existing copy/paste behaviour is
  unchanged unless you ask for it.
- **Config merge is guarded against prototype pollution.** Deep-merging
  configuration now refuses `__proto__`, `constructor` and `prototype` keys, so
  a config object built from untrusted JSON can no longer reach
  `Object.prototype`.

### Fixed

- **Destroying one grid no longer tears down others.** The shared registry now
  detaches per grid: calling `destroy()` on one grid releases only that grid's
  registry state and leaves every other live grid on the page intact.
- **Create/destroy no longer leaks timers.** Grids created and destroyed in
  quick succession — a mounted-then-unmounted component, or a tight
  create/destroy loop — left pending timers in the event loop whose closures
  pinned the whole grid graph in memory. The ready timer, the change-queue
  flush timer, and the comments and facets debounce timers are now all
  cancelled on `destroy()`.
- **Renderer references are released on destroy.** The renderer back-reference
  and its cached node arrays are now cleared so a destroyed grid's DOM nodes
  and renderer can be collected.
- **The one-time warning set is now bounded.** `warnOnce` no longer grows its
  seen-key set without limit over a long session.
- **Header-drag listeners are cleaned up if a grid is destroyed mid-drag.**
  Destroying a grid while a header column is being dragged now removes the
  drag listeners instead of leaving them attached to the document.

## [1.20.0] - 2026-09-02

### Added

- **Subset-vs-population comparison (BACKLOG-0000653).** A grid can now rank
  which columns most distinguish a selected subset of rows from the full
  population, via `grid.subsetVsPopulation()`. Each column is scored by a
  standardized effect size, so the columns that actually differ rise to the top
  rather than the columns that merely have large raw values.
- **Approximate (sketch) statistics tier + windowed aggregates
  (BACKLOG-0000654).** Kernels that a running sketch can maintain in constant
  time per row — distinct counts, quantiles, heavy hitters, moments — are now
  offered through an approximate tier alongside the exact one. Each approximate
  result carries an explicit error bound, and `grid.statistics.approximate` and
  `grid.statistics.maintenanceTier(fn)` report which kernels are maintained,
  which require a rescan, and what the approximate alternative costs. Windowed
  aggregates compute rolling statistics over an ordered window.
- **dhtmlx compatibility: imperative rows and cell spans (BACKLOG-0000645).**
  The dhtmlx compatibility layer gains `hideRow`, `showRow`, `isRowHidden`,
  `addSpan`, `removeSpan` and `getSpan`, so code written against dhtmlxGrid's
  imperative row-visibility and cell-span API works against Lattice unchanged.

### Changed

- **Sort can run off the main thread (BACKLOG-0000434).** The portable sort is
  now offloaded to a worker when `useWorker` is set and a data set exceeds
  `workerThreshold`, and a snapshot mechanism lets a long sort proceed without
  blocking interaction; a genuine off-thread failure recovers synchronously so
  results are never lost. Filtering and grouping still run on the main thread —
  only sort is offloaded in this release.

### Internal

- **Statistics reference suite verified against SciPy and R
  (BACKLOG-0000652).** The statistical kernels are now checked against fixtures
  generated from SciPy and R, so the numbers Lattice reports match the
  established references. Development tooling only; no change to the public
  surface.

## [1.19.0] - 2026-09-02

### Added

- **Record-card and gallery presentation modes.** Rows can now render as
  full-width record cards (`recordCard`) or as a responsive grid of tiles
  (`gallery`), instead of tabular rows — for detail-oriented and media-heavy
  data sets. Both accept `true` or an options object.
- **Responsive card collapse.** Narrow viewports collapse the tabular layout to
  a stacked card presentation automatically, so grids stay usable on small
  screens without a separate configuration.
- **Board (kanban) presentation (BACKLOG-0000458).** Rows can now render as a
  board — a kanban of grouped lanes of cards — via the `board` config key
  (`true` or an options object). Each card is still a live row: it clicks,
  selects and drags through the same grid, and lanes are virtualized so a board
  of many long lanes renders only what is on screen.
- **Excel export fidelity (BACKLOG-0000724).** The Excel exporter gains cell
  borders (`borders`), rich per-cell styling driven by conditional formatting
  (fills and fonts), a grand-total band, hidden-column handling
  (`hiddenColumns: 'omit' | 'hidden'`), and body cell merges (`merges`) — so an
  exported workbook more faithfully reflects the on-screen grid.
- **Per-cell `aria-readonly` (BACKLOG-0000648).** Read-only columns now expose
  `aria-readonly` on each cell, driven by the permission layer, so assistive
  technology announces which cells a user cannot edit rather than inferring it
  from failed edits.
- **Portable sort representation + off-main-thread cold collation
  (BACKLOG-0000434).** A new portable sort spec (`compute/sortspec.js`) lets a
  sort be described independently of the runtime, and the first (cold) string
  sort can be offloaded to the worker via a `collateStringRanks` pass, keeping
  the main thread responsive on large tables.

### Changed

- **Column decorations now persist and undo (BACKLOG-0000723).** Decorations
  (e.g. data bars) applied via `columns.decorate` are captured in saved views
  and are undoable/redoable like other column changes, rather than being lost on
  reload or left outside the history.
- **Worker ingest follow-ups (BACKLOG-0000721).** The worker host separates its
  "worker gone" (decoupled worker unusable flag) and "compute unusable" states
  so a degraded worker falls back cleanly, with a keyed-stream dedupe fallback
  on ingest.

### Fixed

- **Chart-range binding override (BACKLOG-0000727).** `chartRange` accepts an
  explicit range/host-filter binding so a chart can be pointed at a chosen
  window of the grid instead of only the current selection, with added coverage.

## [1.18.1] - 2026-09-02

### Fixed

- **Incremental group totals no longer recurse to a stack overflow when a
  grouped grid totals a running/computed (volatile) column.** This was a 1.18.0
  regression: the incremental group-subtotal maintenance added in 1.18.0
  (BACKLOG-0000435) read every totalled column's value while maintaining the
  running subtotals. For an impure computed column — a running total, a shadow —
  the value is produced by reading the display rows, which asks the source to
  run its pipeline, whose last stage is the totals pass doing the reading: it
  re-entered and recursed until the stack overflowed ("Maximum call stack size
  exceeded"). Such a column now correctly contributes no subtotal instead of
  crashing — it is excluded from the reduction before its value is ever read, on
  both the group and grand-total paths, matching the incremental fast path (which
  already excluded them) and the long-standing rule that a running total is
  skipped over totals rows. Plain and pure-computed column subtotals are
  unchanged.

## [1.18.0] - 2026-09-02

### Added

- **The composed long-tail statistics now push down to DuckDB.** Every
  statistic the SDK composes — `gini`, `hhi`, `entropy`, `evenness`, the top-k
  shares, `trimmedMean`, `winsorizedMean`, `robustOutliers`, `jarqueBera` and
  `weightedAvg` — is now evaluated in the engine rather than pulled and computed
  client-side, both ungrouped and with `GROUP BY`. Each was verified to return
  a value identical to the client computation before it was allowed to push.
  `weightedQuantile` is the one exception and still computes client-side, so a
  grid using it is unchanged.

- **`groupTotal` / `grandTotal`** — a column's group subtotals and its grand
  total can now carry different reductions. Set them on the column config, or at
  runtime with `columns.setTotal(id, fn, { scope: 'group' | 'grand' })`. A scope
  with no override follows `total`, so a column that splits neither is unchanged;
  `setTotal(id, fn)` with no scope still sets both and clears any overrides. The
  split persists in saved views, and the aggregate chooser gains a *Group
  subtotals* / *Grand total* submenu when `aggregateChooser` is on.

- **Compound unit display and parse.** `createUnitType` takes a `compound`
  option, so a length reads and accepts `5 ft 11 in` rather than a single-unit
  decimal — the value renders as the mixed form and a mixed form typed back
  parses to the same number.

### Changed

- **Group subtotals are now maintained incrementally.** On a memory source a
  cell edit no longer re-reduces the affected group's rows; the subtotal moves
  by the difference, exactly as the grand total already did. An edit that moves a
  row between groups is subtracted from its old group and added to its new one,
  touching only the affected groups. `sum`, `avg`, `countValues`, `min` and
  `max` over numeric columns take this path; `min`/`max` reseed a single group
  when an edit leaves its current extreme, and custom or statistical group totals
  keep the full per-group pass. The reported number is unchanged — this is a
  performance change, materially cheaper on grids with large groups.

- **A partial pushdown result now hard-fails by default.** When an adapter
  returns fewer rows than its declared total for a whole-set request and there
  is residual filter/sort/quick work, the source now throws rather than
  presenting the fraction it received as the whole. Set `allowPartialResults` to
  opt back into the previous warn-and-client-filter behaviour where you know the
  subset is acceptable.

### Fixed

- **`weightedAvg`'s maintenance label corrected.** It claimed to be maintained
  incrementally when it is recomputed on read; the reported number was always
  correct, only the label was wrong. It is now marked "rescan".

- Release-workflow false-negative on a successfully-created release fixed;
  npm publish and CHANGELOG gating added; the perf gate rescoped with its
  jitter fix.

## [1.17.0] — 2026-09-02

### Added

- **`stripedRows`** — opt-in alternating row colours.
- **`ingest.dropSourceRows`** — opt-in release of the source's row objects
  after ingest, a large memory reduction for memory sources.
- **`fullDataset`** — opt-in whole-dataset pull for pushdown (DuckDB) and REST
  sources, so grouping, totals and statistics compute over the entire matching
  set, not just the loaded window.
- **`aggregates`** — push statistics and aggregation down to DuckDB, both
  ungrouped and with `GROUP BY`, with per-stat engine/client control and
  provenance exposed on `lastPlan()`.
- **Dev-mode coverage warning** — a warning when a statistic or total is
  computed over only the loaded window of a windowed source, with coverage
  exposed on `profile()`.

### Changed

- **Breaking default: `stickyGroupHeaders` is now off by default.** Sticky group
  headers are opt-in — set `stickyGroupHeaders: true` (stacks up to two) or a
  positive integer to set the cap. Grids that relied on the previous
  on-by-default behaviour must now pass `stickyGroupHeaders: true` explicitly.
  Explicit `true`, `false`, a number, and `{depth:n}` are unchanged.
- **Faster warm string-column sorts** via an amortised rank index.

### Fixed

- Dragging the scrollbar on a paged/remote source no longer triggers a fetch
  storm or a blank grid.
- Comfortable (and other non-standard) density no longer leaves a gap between
  the header and the first row.

## [1.16.0] — 2026-09-02

No breaking changes. Every new feature below is opt-in and default-off, so a
grid already in production behaves exactly as it did until you turn one on.

### Added

- **Stream ingest can columnize off the main thread.** With the opt-in
  `ingest.useWorker` (and `ingest.workerThreshold`, default 10000), a
  stream-source chunk over the threshold is packed into typed buffers in the
  compute worker and merged back without the main thread reading a caller
  object, so a large stream no longer blocks the UI while it columnizes. The
  scope is deliberate: it applies to the stream source. Memory and paged
  sources still read caller objects on the main thread, and an in-memory array
  still loads on the main thread. A non-portable schema, a worker error, or no
  `Worker` all fall back to the existing main-thread path.

- **`ingest.retainSource` lets the store drop its reference to your rows.** The
  opt-in `ingest: { retainSource: false }` stops the ColumnStore retaining the
  caller's row objects and reconstructs a plain row on demand from the packed
  columns. The memory saving is small — the store's own reference array, on the
  order of a few MB at a million rows, not the caller's objects, which the host
  still holds. When set, `source()` returns freshly reconstructed rows, so
  `row === sourceObject` no longer holds and equality becomes value-based; cell
  values are identical. Default is `true`, so existing behaviour is unchanged.

- **Paste preview shows a bulk paste before it commits.** The opt-in
  `edit.pastePreview` interposes a confirm/cancel dialog on a paste into more
  than one cell, listing every cell that changes (old → new) and every cell a
  commit would reject (permission, read-only, validation, lock, missing). The
  dry run uses the same editable, parse and validate checks as the commit, so
  the preview cannot disagree with the result. A single-cell paste skips it.

- **A group-by drop zone above the header.** The opt-in `groupPanel` shows a
  drag-and-drop strip: drag a column heading in to group by it; active groups
  appear as removable, reorderable chips whose order is the nesting order. It
  is keyboard-operable — the chips are a listbox with arrow navigation,
  Shift+arrow to reorder, Delete to ungroup, and an add control to group from
  the keyboard. Every change routes through the one existing group-by entry
  point, so the strip, the column menu and the API stay in one state.

- **Chart a selected cell range.** The opt-in `rangeChart` config adds a
  "Chart selection" cell-menu item and Alt+F1 that bridge the selected range to
  a chart via `chartRange`: a leading text column becomes the categories and the
  numeric columns the measures, honouring hidden and unreadable columns. It
  reuses the existing chart builder; nothing charting is reimplemented.

- **A footer aggregate chooser.** With the opt-in `aggregateChooser`, a
  column's totalling menu becomes an Aggregate submenu offering only the
  reductions the column's type declares meaningful, the current one ticked, and
  a None to stop totalling. Every choice drives the existing totals model. The
  new `columns.aggregates(id)` returns the offered list, and `setTotal` now
  refuses an unmeaningful named total from the API too.

- **Column decorations: threshold icon sets and a runtime `columns.decorate()`.**
  An `icon` decoration now takes threshold `bands` (value → glyph, matched by
  descending `min`) or a built-in `iconSet` preset (trafficLights, arrows,
  trafficArrows, ratings), drawn from the grid's own inline sprites — no new
  bundled asset and no fetch. Each band carries an accessible label and the
  value still renders beside the icon. `grid.columns.decorate(id, spec)` sets,
  changes or clears a column's decoration after build. It is a presentation
  setter, not on the undo timeline and not saved in a view.

### Fixed

- **Excel export could carry a formula-injection payload.** A text cell
  beginning with `=`, `+`, `-` or `@` was written to xlsx verbatim, so an
  exported grid opened in Excel, Google Sheets or LibreOffice executed it as a
  live formula. CSV already guarded this; the xlsx writer did not. A sanitise
  option (default on) now apostrophe-prefixes such text cells. Only string
  cells are touched — numbers, dates and booleans are typed values that cannot
  become formulas, so numeric columns still sort and total unchanged.

- **Pushdown now fails loud on a partial full-set result instead of showing a
  fraction as the whole.** When an adapter returned fewer rows than its declared
  total for a whole-result request and there was residual filter/sort/quick
  work, the source used to warn and client-filter the subset — showing wrong
  rows. It now throws, surfacing as `source:error` with no rows rather than a
  fraction presented as the full set. A shortfall with nothing residual, where
  the engine simply cannot page, stays a warning, since those rows are correct.

- **The filter popup is no longer clipped by a short grid.** The column filter
  popup now portals to `document.body` and is positioned in viewport
  coordinates, flipping above the header and clamping to the viewport, so a
  short grid inside an `overflow: hidden` ancestor no longer cuts it off.

- **The paged source warns when a configured `hostFilter` is silently ignored.**
  The paged source delegates filtering to the server and holds a window, not a
  dataset, so a configured `hostFilter` predicate did nothing — and, unlike the
  remote source, said nothing. It now raises the same one warning the remote
  source does, deduped to a single line when both apply. Memory and stream
  apply the predicate over the rows they hold and correctly stay silent.

- **`registerModules` warns on silent reconfiguration.** Registration is
  first-wins and idempotent, which is correct, but re-registering a module under
  an existing name with *different* configuration silently dropped the change.
  It now raises a dev-mode warning when the repeat's contributed configuration
  differs; an equivalent repeat — the common lazy-load case — stays silent.

- **Corrected misleading "maintained" labels on variance and standard
  deviation.** The maintenance labels claimed `variance`, `varianceP`,
  `stddev`, `stddevP` and `sumSquares` were maintained incrementally; the
  running total only ever tracked sum, count, min and max, so those were
  recomputed by a stable batch Welford pass on every read. The numbers were
  always correct and unchanged — only the label was wrong. They are now marked
  "rescan" and the `sumSquares` comment corrected.

- **Corrected a wrong event-name docs example and hardened `grid.on()`.** The
  cross-filter example used `row:click`; the event is `row:clicked`, and a
  handler bound to the wrong name subscribes without error and never fires. The
  example is now runnable and executed on every build, and `grid.on()`/`once()`
  warn in development on an event name outside the known set.

- **Faster string sort and ingest, now guarded by a perf gate.** String and
  object columns collate their distinct values once into ranks and radix-sort
  those, replacing tens of millions of per-comparison collator calls with a
  single sort of the distinct set — about 1.33× faster on a million-row string
  sort (ICU stays the sole authority on ordering, so results are byte-identical).
  Bulk ingest writes a column at a time through a monomorphic path, about 1.18×
  faster on a million rows. A new perf-budget gate, wired into the build and CI,
  fails on a regression against a committed baseline so these gains cannot
  quietly erode.

## [1.15.0] — 2026-09-01

### Fixed

- **A dhtmlx-compat grid could not be licensed.** The compatibility adapter
  bundled its own private copy of the grid core, so the licence holder a page
  set through `setLicence` lived on a different core and never reached the compat
  grids. The adapter now leaves the core out of its bundle and resolves it from
  the host — the same core the app already loaded under a bundler, or the
  `LatticeGrid` global a script tag publishes — so a licence set on the page's
  core now applies to compat grids as it does to every other grid.

  The public API is unchanged: `new Grid(container, config)` still constructs.
  Consumers now load the core alongside the module, which is automatic under a
  bundler and a global build for a script tag. As a side effect the shipped
  bundle drops from 2.4 MB to 165 KB, since it no longer carries a second core.

- **The grid reported the wrong version.** `getVersion()`, `version()` and the
  diagnostics bundle returned a hardcoded `1.9.0` that had drifted from the
  released package for several versions. The runtime version now derives from a
  single source of truth — `package.json` — so it always matches the version you
  installed, and a check now fails the build if the two ever diverge again.

### Added

- **Stat / KPI cards can show a leading icon or image.** A card accepts an icon
  through its config; it lays out beside the title and value without disturbing
  the change indicator, threshold bands or interval, and an absent icon leaves
  the tile layout exactly as it was.

- **Context-menu items accept a caller-supplied icon.** A menu item's `icon` can
  be a registered sprite name, a single character or emoji, or trusted element
  markup (for example `<i class="fa-light fa-download"></i>`) placed only in the
  icon slot. Cards and menus share one icon helper, so the same values render the
  same way in both; an unrenderable value raises a development warning.

## [1.14.0] — 2026-09-01

### Added

- **Misconfigured config values are now reported, not silently ignored.**
  Passing a value a config option cannot use — a string where `rowHeight` expects
  a number or a function, an unknown member of a closed set such as `selection`
  or `density`, a non-array `columns` or `rows` — now raises a `[lattice]`
  diagnostic (in the console and through `grid.diagnostics`) instead of falling
  back to the default without a word. Fifty-eight config keys are covered.

  For a grid already in production: behaviour is unchanged — the same fallback
  still applies — but a value the grid could not use, which used to disappear
  quietly, is now surfaced. Valid configurations stay silent; the check is
  deliberately conservative so a correct grid never sees a false warning.

## [1.13.1] — 2026-08-31

### Fixed

- **An expired licence sent the holder to the wrong site.** The renewal warning
  named `tocloco.com`, the company, rather than `latticegrid.dev`, where keys are
  issued. Two lines above it, the no-licence warning named the product site
  correctly, as does every other reference in the product.

  The person misdirected is the one holding an expired paid licence and trying to
  renew, which is the audience a wrong link costs the most.

  A test now asserts that every domain in a shipped string in the licensing and
  watermark modules is the product site, so a second one cannot be introduced.
  Comments are excluded from that scan, because the JSDoc legitimately uses
  `acme.com` as an example domain.

## [1.13.0] — 2026-08-31

### Fixed

- **The whole pushdown SDK was unreachable from the built package.** It is
  exported from core, but the package is built from `packages/dom/src/index.js`,
  which re-exports by an explicit list that did not mention it. Importable from
  the source tree, passing every test that imports from the source tree, and
  absent for anyone who installs the package.

  A check rule now fails the build for any declared function the entry does not
  expose. It immediately found three more that predate this work: `compileRules`,
  `ingest` and `ingestSync`, two of them documented. All are now reachable.

- **Broken punctuation in the shipped documentation.** Fifty-four places across
  the reference, the guide and the type declarations where an em dash had been
  replaced by a stray comma, several of which fell at a line break and rendered
  with a space before the comma. A handful that had become comma splices now
  read as the colons they were.

- **A reference link pointed at a section in the other document.** The `image`
  type's "image columns" link resolved to nothing, because the target is in the
  guide rather than the reference.

### Added

- **The pushdown source SDK.** `createPushdownSource({ adapter })` turns the
  structured request a remote source already receives into a contract an adapter
  can answer, so a new back end is a translation layer rather than a new source.

  An adapter declares what it can do. No engine speaks the whole query: OData
  takes a condition tree but only some operators, DFQL takes a single field and
  term, a hand-written endpoint may take nothing but a page number. `planQuery`
  divides the request accordingly and the grid finishes the remainder, with
  `source.lastPlan()` reporting the split so a slow query can be diagnosed
  rather than merely endured.

  Two rules shape it. **A conjunction splits and a disjunction does not**: an
  `and` narrows with each condition so the engine can take what it understands,
  while an `or` widens with each branch, and pushing only the supported branches
  returns rows the grid cannot recover. **A sort is pushed whole or not at all**,
  because ordering by the first column and fixing the rest locally needs every
  row anyway.

  And when anything is left over the grid asks the engine for the complete
  result rather than a window. Filtering a window client-side is not a slower
  way to be right, it is a fast way to be wrong: the rows belonging on the first
  page may be on the ninth. It says so once, naming what could not be pushed.

- **The DFQL adapter, rewritten against the documented API and verified live.**
  It speaks `POST /v1/query`, reads the NDJSON response with a carry-over
  buffer, and separates records from the `count` and `scan` meta lines around
  them. A per-line `_type: "error"` arrives after a 200 status and does not stop
  the batch, so it is surfaced rather than swallowed.

  Three corrections the reference forced. `comboKey` is the *name* of the key
  attribute and `query` is the prefix matched against it; the first draft
  conflated them into one field that does not exist. The filter is a
  case-insensitive substring, so the adapter declares `contains` and not `eq`,
  which would have pushed a condition the engine answers differently from the
  grid. And a `countOnly` line now travels with every request.

  That last one is not tidiness. `limit` caps the rows *scanned*, not the rows
  *matched*. Measured against a live tenant: 837 of 15,046 records matched a
  term, and asking for twenty returned none, having scanned forty. A filtered
  query returns an arbitrary subset and nothing in the response says so, which
  makes the count the only way the truncation becomes visible.

- **A DuckDB adapter.** `duckdbAdapter({ connection, from })` puts a full
  analytical engine behind the grid and imports nothing to do it. The caller
  creates the connection, in the browser through `@duckdb/duckdb-wasm` or on a
  server through any DuckDB client, and hands it over. `from` is any FROM
  expression, so `read_parquet('s3://bucket/*.parquet')` is as valid as a table
  name, and the bundle is unchanged whether you use it or not.

  An engine that speaks SQL answers the whole query: filter tree, multi-column
  sort and paging, with nothing left unpushed. Values are bound through prepared
  statements and identifiers are refused unless they are identifiers, because a
  filter is the one part of a grid a stranger can steer.

  Two things a real engine taught it, neither of which a fake would have. The
  total arrives with the rows, because `count(*) OVER ()` is evaluated across
  the whole matching set before `LIMIT`, so one query returns the page and the
  size of what it was cut from. And integers are not always numbers: DuckDB
  returns `BIGINT` as a JavaScript `BigInt`, which does not serialise and does
  not compare against a number, so values are normalised on the way out and a
  magnitude past the safe integer range is kept as a string rather than silently
  rounded to a different one.

- **A DuckDB demo that needs no server.** `demo/duckdb.html` puts a grid over
  one million quality readings in a 7.4&nbsp;MB Parquet file served as a static
  asset. DuckDB-Wasm loads from a CDN and runs in the tab; Lattice sends it the
  grid's filter and sort and renders the answer.

  Measured locally over the million rows, with every query pushed in full: 189
  ms for a plant and a spec breach, 367 ms for a single line, 620 ms for the
  unfiltered set. The page shows the SQL it generated and the time each query
  took, because the point is not that it is fast but that the grid is not doing
  the work.

  The data was generated by DuckDB rather than by a build dependency, and
  `demo/data/README.md` carries the statement that produces it. One line in it
  drifts on purpose, so there is something to find.

- **Three adapters.** `odataAdapter` for any OData v4 endpoint, writing
  `$filter`, `$orderby`, `$top`, `$skip` and `$count`, with the system options
  left unencoded because several servers reject them otherwise. `restAdapter`
  for the API you already have, with parameter names of your choosing and
  filtering assumed absent until declared, since an adapter that claims to
  filter when the endpoint ignores it returns wrong rows silently.
  `dfqlAdapter` for DemandFlow entities.

- **Server-driven paging is followed.** An OData server applies its own page
  size when no `$top` is given and reports it with `@odata.nextLink` rather than
  failing. The grid asks for the whole result only when it has work left to do,
  so accepting the first page would filter a fraction of the result and report
  it as the whole. The adapter now follows the link, and the SDK warns when any
  adapter returns fewer rows than it counted.

  Found by running the adapter against a real OData service rather than a fake.
  A fixture written alongside the adapter accepts whatever the adapter sends,
  which is why it could not have surfaced this.

- **A server cookbook** in the reference: the request an endpoint receives, a
  worked handler, and the note that `total` is the count of everything matching
  rather than the length of the page.

- **The developer guide covers the connected-grid and statistics work.** Seven
  sections that the reference documented but the guide had never mentioned:
  querying an engine directly, derived grids, cross-filtering, joining two
  grids, profiling, process control and capability, confidence intervals and
  statistic tiles. The guide had stopped at 1.10 while the reference kept pace,
  so the two disagreed about what the product does.

- **The four pieces the pushdown SDK is assembled from are documented and
  declared.** `capabilitiesOf`, `splitFilters`, `planQuery` and `applyResidual`
  were exported and reachable but absent from both the type declarations and the
  reference, so a custom source had no supported way to reuse the split.

## [1.12.2] — 2026-08-31

Released from the 1.12.1 tag. Main also carries the pushdown source SDK, which
is new public API and belongs in a minor.

### Fixed

- **Error bars were drawn and never painted.** The whisker had `fill: none` and
  no stroke, on the element or in the stylesheet, so it occupied space and
  painted nothing on every chart since 1.12.0. The stylesheet now paints the
  class and the element carries a stroke attribute as a floor. A check rule
  fails the build for any chart mark drawn with neither.

## [1.12.1] — 2026-08-31

Released from the 1.12.0 tag rather than from main, because main also carries
the pushdown source SDK, which is new public API and belongs in a minor.

### Fixed

- **Error bars drew nothing, and said nothing, on a chart bound to a summary.**
  A whisker is computed from the values the chart can see behind each mark, and
  a chart bound to a grid whose rows are already one per mark sees a single
  value per category. Suppressing the whisker is correct; doing it in silence
  was not. The chart now says so once and names both ways out.

## [1.12.0] — 2026-08-31

The statistical layer, and the presentation it needed. Confidence intervals on
what the grid already measures, the Nelson rule set beside Western Electric, a
profile that says what is worth looking at — and then the charts and panels that
make all of it visible, because a figure nobody can see is a figure nobody uses.

The line this draws, and the one the documentation now states: **Lattice
quantifies uncertainty; it does not adjudicate hypotheses.** There are no
p-values and no significance tests, and there is no plan for any.

### Added

- **A moving range chart.** `type: 'movingRange'` is the lower half of an I-MR
  pair. The individuals chart asks whether the process has *moved*; this asks
  whether it has become less *repeatable*, and a process can fail either without
  failing the other — it can drift while its point-to-point variation holds
  steady, and it can hold its average while shaking itself apart. The second is
  close to invisible on the individuals chart alone, because a wider spread
  pulls that chart's own limits wider with it.

  Only the upper limit signals: a range cannot be negative, and the D3 factor is
  zero for a subgroup of two.

- **Error bars.** `error: true` draws a whisker on each mark, computed from the
  readings behind it; `error: { of }` takes a symmetric margin from a column
  instead. Four bars side by side invite a comparison the numbers alone cannot
  support — a five per cent gap between two categories of eight readings is
  noise, and between two of eight hundred it is the finding.

  A mark with a single reading gets no whisker, because one reading has no
  spread and a zero-height whisker would claim certainty rather than admit
  ignorance.

- **`statistics.intervalOf(values)`.** The column-free form of `interval`, for
  readings that are not a column — the rows behind one bar, a subgroup, a
  hand-assembled sample. Added so the chart's whisker and the panel's bounds
  come from one t-quantile rather than two.

- **Twenty-three chart options are now declared.** `fit`, `tooltip`,
  `selection`, `drill`, `filterOnClick`, `stack`, `curve`, `subtitle`,
  `footnote`, `baseline`, `spec`, `rules`, `confidence` and ten more were read
  from the caller's configuration and absent from `ChartSpec`, so each was a
  compile error in TypeScript for an option that works. `fit` in particular has
  drawn a least-squares line through a scatter, with its R², the whole time.

  A check rule now compares the options the chart reads against the ones
  `ChartSpec` declares. The third time this shape of gap has been found — after
  the data types and the chart types — which is why it is checked rather than
  noticed.

- **Confidence intervals.** `statistics.interval(colId)` for a mean, using the
  *t* distribution rather than the normal — below about thirty readings the
  normal interval is noticeably too narrow, and at five it understates the width
  by roughly a sixth. `{ kind: 'proportion' }` gives a Wilson score interval for
  a rate.

  A proportion is Wilson rather than the textbook Wald interval because Wald
  fails exactly where a rate is most interesting: near zero it reaches below
  zero, and at no observed successes it collapses to the single point zero,
  claiming perfect certainty from the least informative sample there is. "None
  of forty failed" now correctly reads as "the failure rate is under 9%".

- **An interval on capability.** `statistics.capability()` now returns
  `interval` for Cpk and `intervalPp` for Ppk, by Bissell's approximation. Its
  absence is the commonest way a capability study overstates itself: a Cpk of
  1.35 measured on thirty parts has a lower bound below 1.0, so a process that
  has "passed" a 1.33 requirement on thirty parts has demonstrated very little.

- **`slopeInterval()`** for a regression slope, from the standard error
  `regression()` already reported. The half that r² cannot answer: the same r²
  from eight points and from eight hundred are very different degrees of
  confidence in the same line.

- **The Nelson rules.** `capability(colId, { rules: 'nelson' })` judges control
  violations against the eight-rule set Minitab and JMP report. Four are shared
  with Western Electric; the other four test patterns the shorter set has no
  test for, all of which sit *inside* the control limits while they happen — a
  six-point trend (tool wear, a drifting sensor), fourteen alternating
  (two sources charted as one), fifteen hugging the centre line (limits computed
  from data that already contained the variation), and eight all beyond one
  sigma (two populations). The rule sets number their rules differently and
  disagree about run lengths, so the result names which set produced it.

- **Profile alerts.** A profile now carries `alerts` and `alertCount`:
  `empty`, `constant`, `high-missing`, `unique`, `high-cardinality`, `skewed`
  and `outliers`, with thresholds you can move. No new statistics — every alert
  is a comparison between figures the profile already computed. Skew uses
  Pearson's second coefficient, which needs no third moment.

- **`running: 'delta'`.** The gap to the row above, rather than the sum of
  everything above it. Inter-arrival times, gap analysis, and the moving range a
  control chart is built from are all this column. It shares the existing single
  pass, so it costs nothing over `running: 'total'`.

- **Threshold bands on `createStat`.** `bands: { good: 1.33, warn: 1.0 }` sets
  `data-tone` on the tile. Separate from `goodWhen`, which judges the *change*:
  a Cpk of 0.9 is bad news whether it rose or fell to get there.
  `direction: 'down'` suits error rates and latency.

- **`qq`, `ecdf`, `lorenz`, `correlogram` and `control` are declared chart
  types.** All five have rendered for as long as the histogram has, but
  `ChartType` listed thirty-one of the module's thirty-six — so `type: 'control'`
  was a compile error for a chart that works. A check rule now holds the module
  and the declaration together, as one already does for data types.


- **Two demos.** `demo/spc.html` puts the control chart, the capability report,
  the rule sets and the interval tiles on one page against a process that is
  capable short-term and out of control overall — Cpk 1.59 against Ppk 0.96,
  which is the distinction the four indices exist to make. `demo/connected.html`
  is one dataset in four grids: two cross-filtering panels, a third joined to a
  separate accounts grid and grouped by a field the join brought across, and a
  profile of the whole thing.

- **A capability report.** `type: 'capability'` draws the picture a quality
  engineer expects to print: the readings as a histogram, the tolerance drawn
  across them, and a fitted normal curve for *each* of the two spreads.

  Two curves rather than one, because that gap is the finding. Cp and Cpk come
  from short-term variation, Pp and Ppk from overall, and when a process has
  drifted the four indices say so only as numbers a reader must know how to
  compare. Drawn, a narrow solid curve inside a wide dashed one is a capable
  process that has been allowed to wander — a scheduling problem, not a machine
  problem.

  Its x axis is continuous rather than the histogram's bands, because a
  specification limit sits at a value, not at a bucket: on a band scale it can
  only be drawn at a bucket edge, which moves it by up to half a bin and puts it
  on the wrong side of the readings nearest to it — the readings that decide
  whether the process conforms.

- **Control charts name their lines and number their rule breaks.** `CL`, `UCL`
  and `LCL` at the right edge; `LSL`, `USL` and `Target` at the left.

  Opposite edges deliberately. Control limits are what the process does,
  specification limits are what the customer asked for, and reading one as the
  other is the classic misreading of a control chart. A capable process puts its
  control limits just inside its tolerance, so the two families sit within a
  label's height of each other — exactly when they most need telling apart, and
  where a single-edge layout dropped one as a collision.

  Every violating point now carries the rule number it broke. With Western
  Electric's four rules a marked point was readable on its own; with Nelson's
  eight it is not. A spike is rule 1 and a six-point trend is rule 3 — a bad
  part and tool wear, calling for different responses — and marking both the
  same way told the reader the less useful half of what the chart knew.

- **`rules` and `confidence` on a chart**, so a control or capability chart can
  select its rule set and interval level the way `statistics.capability` does.

- **Intervals are visible.** The statistics panel shows the bounds under Cpk and
  Ppk. `createStat` takes an `interval` function that puts them under the value
  — a tile is where a figure is read fastest and questioned least, which makes
  it the place an interval earns its keep rather than the place it is least
  needed. Both are part of the accessible reading, not a visual aside.

- **`className` on an anchored chart label**, so a chart's structural labels are
  not forced to inherit data-label styling.

- **A check rule for chart declarations**, holding the module's drawable types
  and the `ChartType` union together. It caught `capability` the moment the type
  was registered, which is the point.

### Fixed

- **Documentation gaps in the new surface.** `rows.forEachExcept`,
  `statistics.intervalOf`, `statistics.keyOf`, `statistics.maintenance`,
  `capability().ruleSet`, the `confidence` field every interval carries, and
  eighteen chart options — `fit`, `error`, `tooltip`, `selection`, `drill`,
  `stack`, `curve`, `subtitle`, `footnote` and the rest — were declared and
  working but absent from the reference.

  The chart-option check now requires documentation as well as declaration, as
  the chart-type check already did. That asymmetry is what let eleven of them
  through: declared is half the promise, and an option nobody can find is an
  option nobody uses.

- **Raw control characters are written as escapes.** Fourteen of them, across
  six files: the NUL and unit-separator characters the grid uses as key
  separators, written as literal bytes rather than `\u0000` and `\u001f`.

  The characters themselves are the right choice — neither can occur in real
  data, which is what a key separator needs. Writing them literally cost three
  things. It made those files binary to `grep` and `diff`. It made the bundle
  impossible to inline into a page, because the HTML parser replaces NUL with
  U+FFFD: doing so turned `sanitise.js`'s scheme-blocking regex into a syntax
  error, and it is only luck that it broke loudly rather than quietly widening
  the character class that rejects `javascript:` URLs.

  And it was invisible. `const SEP = '\u001f';` written as a raw byte renders in
  an editor as `const SEP = '';` — an empty string. Anyone tidying that away
  would have made every composed key silently ambiguous.

  A check rule now rejects a raw control character in source. No behaviour
  changes: an escape denotes the same character.

- **A Student t quantile could return nonsense when Newton converged
  immediately.** The convergence test ran *after* the bisection fallback had
  already overwritten the answer, and on the first iteration the bracket had not
  tightened, so the midpoint it fell back to was half the initial span away.
  `studentTQuantile(0.5, df)` returned −5000 for every degree of freedom. Found
  by a round-trip test against the distribution rather than by inspection, which
  is the point of testing numerics against published values: a wrong quantile
  silently widens or narrows an interval and there is nothing on screen to
  notice.

- **A running column treated an absent reading as zero.** `Number(null)` is 0,
  which a sum absorbs harmlessly and a difference cannot — it reported a fall to
  zero and a rise back out of it, two movements the data never made.


- **A profile's `unique` alert was decided by chance.** `unique` and
  `high-cardinality` were mutually exclusive, split on an exact equality:
  `distinct === rows` against `distinct / rows >= 0.9`. A measurement column of
  240 rows drawn from a wide range is all-distinct by coincidence about half the
  time, so a single chance duplicate flipped the answer from "this is a
  candidate key" to "this has many values" — two quite different claims about
  the same column, decided by whether two amounts happened to collide.

  `unique` is now reported only where a key is plausible: a complete column that
  is not a measurement. Numeric columns report `high-cardinality` either way,
  which is the stable statement and loses nothing a reader needed.

- **A profile called every text column entirely missing.** `missing` was
  derived from the count of readings the *statistics* could use, which on a
  non-numeric column is zero however complete the column is — so a name column
  with one gap in three hundred rows reported three hundred missing, and the
  first question a profile is opened to answer gave the worst possible wrong
  answer.

  `present` and `missing` now count values rather than numbers, and apply to
  every column. The old figure is still there as `numeric`, which is what the
  mean, median, quartiles and outlier count are computed from. Profile alerts
  follow: `high-missing` now works on text columns, where it previously could
  not fire at all.

  **Behaviour change**: `profile().present` and `.missing` return different
  numbers than before for non-numeric columns — the correct ones. Code reading
  them to mean "readings the statistics used" wants `.numeric`.

## [1.11.0] — 2026-08-30

The path back up, and the path sideways. A derived grid can now filter the grid
it derives from, and a third grid can show where two others meet. Both are
maintained incrementally, so a dashboard on a live feed costs what changed
rather than what it is looking at.

Also the correction of a change-notification bug that silently stopped a moved
row from ever reaching a derived grid.

### Added

- **Cross-filtering.** A derived grid can filter its source. Clicking a row in a
  summary panel narrows the grid it summarises.

  ```js
  source: { mode: 'derived', from: main, groupBy: 'rep', crossFilter: true, ... }
  byRep.on('row:click', (e) => byRep.crossFilter.toggle(e.key));
  ```

  The panel doing the filtering leaves its own condition out when it reads the
  source back, so clicking one rep does not collapse the panel to that single
  row and strand the reader with nothing left to click. That is the same rule a
  header histogram already follows to keep every bar visible after one is
  clicked, applied between grids instead of within one. Several panels compose:
  each omits only its own condition, so two panels over different columns narrow
  each other while both stay whole.

  The condition goes through the source's own `filters.set`, so it undoes, rides
  in a saved view, and appears in whatever filter UI the grid already has. There
  is no second filter model beside the real one.

- **Joins.** Two grids holding their own data, and a third showing where they
  meet.

  ```js
  source: {
    mode: 'derived', from: orders,
    join: { with: customers, on: { left: 'customerId', right: 'id' },
            select: ['name', 'tier'] },
  }
  ```

  `inner` by default, keeping only rows that matched; `left` keeps every row and
  leaves the brought-across fields undefined, which is the shape you want when
  the unmatched rows are the finding. The join runs before `where` and before
  grouping, so a derivation can group and total by a field it brought across.
  Both sides are live: correcting a tier in the customer grid moves that
  customer's orders into a different band in the joined one.

  A repeated key on the right keeps the first match rather than emitting a row
  per pair. SQL multiplies them out; here that would change the row count of a
  grid the reader thinks of as "the orders" and quietly double every total taken
  from it.

- **`rows.forEachExcept(colId, fn)`.** Visit the rows surviving every filter
  except one column's own — the faceting question, asked of the rows rather than
  of a chart.

### Changed

- **Derivations are maintained incrementally.** A change that names the rows it
  touched is patched into the last grouping rather than re-derived: only the
  groups those rows entered or left are reduced again. Five hundred updates
  against a 200,000-row source take under 300 ms in total where they previously
  took eleven seconds.

  The patch is at the group level rather than the value level, which sidesteps
  reversibility entirely — re-reducing a group from its members is correct for
  `median` and `gini` exactly as it is for `sum`. A change that cannot be
  reasoned about that way falls back to a full derivation.

- **Joins are maintained from both sides.** The lookup is held between
  derivations rather than rebuilt. A change to the fact table rejoins only the
  rows that moved; a change to the lookup rejoins only the rows behind keys
  whose match actually changed. About 2 ms per fact update and 1.5 ms per lookup
  edit against 200,000 rows joined to 2,000 customers, where each previously
  cost a full derivation of roughly a second.

- **`rows:changed` says what it knows.** A firing now carries `identified: true`
  when its `added`/`updated`/`removed` arrays name the rows that moved, or
  `companion: true` when it is a duplicate announcement of a change already made
  with identity. A firing with neither is a real change of unknown extent and
  callers should re-read. Existing payload fields are unchanged; the flags are
  additive.

### Fixed

- **A moved row never reached a derived grid.** `rows.move` fires one event,
  carrying counts because no row changed value. Whether a firing could be
  ignored was decided by sniffing the payload's shape — arrays meant identity,
  numbers meant a duplicate — and a move looked exactly like a duplicate. It was
  dropped, and every order-dependent derivation below it kept its old answer
  indefinitely: a running total, a Pareto cutoff, and the control limits and
  within-sigma of an SPC panel, whose whole premise is that the readings are
  consecutive. Emitters now state which kind of firing they are.

- **A move was also announced too early.** The source announced it from inside
  `moveRow`, before the grid rebuilt the columnar store keyed on physical index,
  so a listener re-reading at that moment read the order the move had just
  invalidated. The grid now announces the move once its own view is coherent.

- **A grouped derivation ignored its `where` and `unnest`.** The one-pass
  grouping path walked source rows straight into the grouping, skipping the
  stages that run before it, so a derivation that both grouped and filtered
  totalled rows it had been told to leave out — right-looking numbers over the
  wrong rows. Both paths now share one definition of those stages. Introduced
  alongside incremental derivation and never released.

## [1.10.0] — 2026-08-30

Connected grids: a grid whose rows are derived from another grid, and a
statistic block to sit above them. The groundwork for dashboards, and one way
only in this release — nothing travels back up.

Also a grid title, an option to drop the column headings, and the correction of
a 1.9.1 release note that described a fix the release did not contain.

### Added

- **A `derived` source mode.** A grid whose rows come from another grid,
  aggregated, unnested, filtered, ranked or profiled, in its own element with
  its own columns.

  ```js
  source: {
    mode: 'derived', from: salesGrid, follow: 'filtered',
    groupBy: 'rep', select: { revenue: { of: 'amount', fn: 'sum' } },
    sort: [{ col: 'revenue', dir: 'desc' }], limit: 5,
  }
  ```

  It is a memory source with a row producer in front of it, and that is the
  whole design. Deriving rows is a question about data; being a source is a
  question about `at`, `byKey`, `display`, paging and a dozen other members a
  memory source already answers correctly. So the derived grid sorts, filters,
  groups, totals, formats, exports and carries shadow columns exactly as any
  other grid, and none of that code knows a derivation happened. Charts bind to
  one as readily as to any grid.

  The pipeline is `unnest → where → bucket → group → reduce → sort → limit`, and
  the order is the contract. `where` sits before grouping deliberately:
  filtering afterwards is a different question — which *groups*, not which
  *rows* — and one key cannot mean both.

  - **`unnest`** expands an array property, one row per element, keeping the
    parent's fields. This is the shape the chart binding cannot express: it
    assumes one row is one observation, and a sale with four order lines is
    four SKU observations.
  - **`limitPer`** applies the limit within each partition rather than overall.
    "The best three SKUs in each region" is asked for constantly and a global
    limit cannot say it: sorted by revenue, a global three returns three rows
    from whichever region sells most.
  - **`cumulative`** keeps rows until their running share reaches a cutoff — the
    Pareto question, and a better ranked list than a fixed five because the
    answer is a property of the data rather than a number someone picked.
  - **`bucket`** rounds a date down to a day, week, month, quarter or year and
    groups on that.
  - **`profile`** replaces the pipeline with a transpose: one row per column,
    with count, mean, median, quartiles, deviation and outliers as its columns.
    Every other shape emits one row per group, so it is a separate output
    builder rather than another stage.
  - **`follow`** decides which of the source's rows are read: `filtered` by
    default, or `all`, `selected`, or `grouped` — which re-aggregates by
    whatever dimension the *user* has grouped the source by, so a panel tracks
    the reader rather than a dimension chosen when the page was built.

  Reductions come from `TOTAL_FNS`, the table the totals row uses, so a derived
  column sums exactly as the source grid's footer sums. All of them are
  available rather than the arithmetic ones alone: a group can be reduced by
  `median`, `p95`, `stddev` or `gini` as readily as by `sum`.

  Derived grids **chain**. One can be the source of another to any depth — a
  profile *of* the top five — and a change at the root travels the whole chain.
  A cycle is refused rather than recursed.

  They are **read-only**. A derived row is an answer, not a record: there is no
  write-back for "the sum of four hundred rows", and accepting an edit the next
  refresh discards would be worse than refusing it.

  `rowKey` defaults to the derived key, so it need not be set. The key is the
  group value, which is what makes a live ranking readable — the row moves
  rather than the values under it changing.

- **`createStat`: the statistic block.** The tile every dashboard opens with —
  a label, a value, a change against a baseline, and a line saying what the
  comparison was.

  ```js
  createStat({ grid, container: '#mrr', title: 'Monthly recurring revenue',
               of: 'mrr', fn: 'sum', baseline: lastMonth, footer: 'vs. last month' });
  ```

  Two things make it worth shipping rather than leaving to the host. **It reads
  the grid, so it agrees with the grid** — a tile saying £4.2M above a table
  filtered to £1.8M is worse than no tile, and that is what a hand-built tile
  does the first time somebody adds a filter. And **it formats through the
  column's own type**: a stat over a `seconds` column reads `42.1 ms`, over a
  money column with an auto ladder `£1.2M`, with nothing declared. Every other
  dashboard tile makes you write that twice, once for the tile and once for the
  table, and they drift.

  The format is borrowed only where the reduction leaves the unit alone. A Gini
  coefficient over a money column is a ratio between 0 and 1, and `$0.34` says
  it is thirty-four cents; counts, ratios and variances — which are in units
  *squared* — fall back to a plain number.

  - **`show`** reports the row behind an extreme rather than the extreme itself:
    `{ of: 'sales', fn: 'max', show: 'rep' }` is the *name* of the best rep. It
    refuses any reduction no single row holds, because no one sale is the
    average sale.
  - **`scope`** decides which rows feed the value — `filtered` by default,
    `all` for a tile that is deliberately a constant, or `selected`.
  - **`goodWhen`** decides whether a rise is good news. Revenue up is green and
    error rate up is red, and a tile that paints every rise green is misleading
    on half a dashboard.

- **A grid `title`, and `showHeader`.** A caption above the column headings,
  inside the grid rather than an element placed above it — so it scrolls with
  the grid, sits in the region a screen reader announces, and survives image
  capture and print. `showHeader: false` removes the headings entirely, and
  removes them from the accessibility tree rather than only from view, which is
  what a small dashboard tile wants when its title already says what it is.

### Fixed

- **`grid.rows.data()` returns the filtered rows, not every row.** Two callers
  in this release assumed otherwise. It surfaced only because a stat tile scoped
  to `all` reported the filtered total; the derived source made the same
  assumption and hid it, because `follow: 'all'` does not subscribe to filter
  changes and so kept its pre-filter answer — the right answer by the wrong
  route, and wrong the moment the source data changed.
- **`follow: 'selected'` and `scope: 'selected'` never produced a row.**
  `selection.rows()` hands back row wrappers rather than keys, and both were
  passing those to `byKey`, which returned nothing for every one. The shape has
  no other symptom, because an empty selection is also legitimately empty, so it
  took exercising the path deliberately to find.
- **Eight documented APIs were missing from the declarations.**
  `createRadixType`, `compileRules`, `createLocalViewStorage`, `ingest`,
  `mountPanel`, `referencesOf`, `setLicense` and `ContextMenu` were written up in
  the reference and absent from `types.d.ts`, so TypeScript callers could not
  reach them. `tools/check.js` now holds the documented surface to the
  declarations — the reverse of the rule added in 1.9.1, and the direction that
  kept catching us: the existing checks verify that what is declared matches the
  runtime and that what is declared is documented, and neither noticed an API
  that was exported and documented but never declared.
- **The README is generated, and hand edits to it were being lost.**
  `tools/build.js` writes the repository's `README.md` from
  `tools/dist-readme.md` on every build. Corrections made to the generated file
  survived until the next build and no further — which is how 1.9.1 shipped a
  release note saying the chart-type count had been corrected while the
  published README still said thirty. **That correction lands here**, along with
  the editor, kernel and locale counts, applied to the template this time. The
  template carries a note saying so, and the build strips it rather than putting
  it on the npm front page.

### Known limits

- **A derived grid re-derives in full on every refresh.** The cost is linear in
  the rows read and largely independent of what is reduced: roughly 650&nbsp;ms
  per 200,000 rows, whether the selection is one sum or four statistics. For a
  large source under a live feed prefer the default `refresh: 'idle'` or a
  debounce, and narrow with `follow: 'filtered'` so the derivation reads what the
  user is looking at. Incremental derivation — reusing the rules
  `compute/incremental.js` already states for the totals row — is the obvious
  next step and is not in this release.

## [1.9.1] — 2026-08-30

Twelve fixes. Most were found by auditing what the website actually renders, or
by looking at a rendering, rather than by a failing test — the suite was green
throughout. Several are options that were accepted and documented and then
quietly did the wrong thing, which is the defect a test suite misses when the
test and the documentation disagree with each other.

### Fixed

- **`multiples` now panels by the column it names.** The option is documented as
  "one chart per distinct value of this column", and the column name was never
  read: the value was tested for truthiness and the panels were split from
  whatever series the chart already had. A chart given `multiples: 'region'`
  and no `series` therefore had one series to divide and drew a single panel.
  It now binds that column as the series when no explicit `series` is given, so
  the documented form works. An explicit `series` still wins, and
  `multiples: true` behaves exactly as before.
- **A numeric axis on a band scale reads in numeric order.** A numeric column
  with twelve or fewer distinct values is deliberately drawn on a band rather
  than a continuous axis — a quarter or a rating should not be spread across a
  gap-filled line. Those categories were ordered by first appearance, which for
  text is the grid's own sort and meaningful, and for a number put 10000 before
  1000 and made the axis read as broken. Numeric dimensions are now sorted by
  value. Ordering happens after `limit` is applied, so "the first N categories"
  still means the first N the rows offered rather than the N smallest.
- **A range selection drew a box around every cell on its edge.** The outline is
  meant to read as one block, and the rule drew all four sides of any cell the
  range touched — so the first and last columns came out as stacks of outlined
  cells while the columns between them had no border at all. Each side is now
  its own class, composed into one shadow, so a corner cell can draw two sides
  and a middle cell none.
- **`COUNTDISTINCT` counted an array as one value.** It was the only function in
  the formula engine that did not flatten an array argument, so
  `=COUNTDISTINCT(readings)` over an array property answered 1 — a plausible
  number, and never the right one. It is deliberately not routed through the
  numeric coercion the other kernels use: distinctness is a question about
  values as they are, and `'01'` and `1` are two codes rather than one number
  seen twice.
- **The geomap's continents were too coarse to recognise.** Each was an outline
  of eight to eighteen points, which read as noise rather than as a map. They
  are now multi-ring outlines of around 250 points in total, with Britain,
  Ireland, Japan, Tasmania, New Zealand and Greenland drawn as their own shapes
  rather than welded onto a mainland. Antarctica is left out of the projection
  unless it carries data, because on an equirectangular map it is a band across
  the bottom and a fifth of the plot given to a landmass with nothing on it. A
  test now puts twenty cities and six ocean points through the outlines, so
  "does it look right" is answered by arithmetic rather than by opinion.
- **A grid sorted or filtered on a shadow column did not re-run when the column
  it shadows changed.** The query stages compare the columns a query reads
  across the two versions of an updated row, and a shadow is not a field on the
  row: its compute wants a row key and the grid's statistics, so reading it off
  two raw objects returned the same answer whichever way the data moved. Nothing
  looked changed, the stage was skipped, and a grid sorted by rank sat in its
  previous order under freshly-correct rank numbers — 2, 3, 4, 1 down a column
  sorted ascending. A derived column is now tested by asking whether any of its
  declared dependencies moved. This matters most for the positional kinds, where
  a rank is a function of *every* row's value and one row's edit can reorder the
  whole grid.
- **Sorting by a running total exhausted the stack.** "How much by the time we
  reach this row" is a function of the display order, so sorting on it asked the
  sort to depend on its own output: computing the value needed the order, and
  the order needed the value. It recursed until the stack ran out, taking the
  page with it. Two changes, because a crash and a bad offer are different
  faults. The query layer now drops such an entry with a warning naming the
  column, the way an unknown column already was — that is what keeps the page
  up. And a `running` column no longer offers a sort at all unless its
  definition asks for one, because a header that invites a sort and then
  declines to perform it is its own small lie. An explicit `sort` on the
  definition is still honoured as an offer; the refusal keeps it safe.

  Shadow columns are unaffected and still sort normally. A rank is the same
  number whichever way the rows are arranged, so it has no circularity — only a
  running total does.
- **`registerUnitSystem` and `defineUnit` were not exported.** `docs/API.html`
  documents both and shows
  `import { registerUnitSystem, defineUnit, createUnitType } from '@toclocoinc/lattice-grid'`.
  That import threw, and the `LatticeGrid` global carried `createUnitType` and
  nothing else — so a unit family of your own, which is the whole point of the
  feature, could not be declared from the published package at all. Both are now
  exported from the package entry and the global, and both are declared, along
  with `UnitConfig` and `UnitDescriptor`.
- **Fourteen data types were missing from the `TypeName` union.** `rpm`,
  `angularVelocity`, `ppm`, `ppb`, `basisPoints`, `molarity`, `massFlow`,
  `tonnesPerHour`, `viscosity`, `kinematicViscosity`, `thermalConductivity`,
  `specificHeat`, `doseRate` and `luminousIntensity` were all registered and
  working, and none of them was declared. The union ends in `(string & {})`, so
  an unlisted type is accepted in silence: no error, and no autocomplete either.
  `tools/check.js` now asks the registry directly and fails the build when a
  registered type is not declared, which is the only reason the next one will
  be.
- **Sixteen data types were missing from the published reference too.** The same
  list appears in `docs/API.html` and `docs/api-detail.html`, and both had
  drifted alongside the union — the fourteen above plus `decibel` and
  `decibelAmplitude`, which the declaration happened to carry and the reference
  did not. `tools/check.js` now holds the documents to the registry as well, so
  a type that is registered but undocumented fails the build. That second rule
  is what found the last two.
- **The reference did not say a running total cannot be sorted on.** It explains
  at length why a running value depends on the display order and then leaves the
  reader to discover what follows from it. It now says so, and says to sort by
  the column it runs over instead.
- **The README said the charts module draws thirty types.** It draws
  thirty-five.

### Upgrading

Nothing to change. The `multiples` fix alters output only for charts where the
option previously drew a single panel, and the ordering fix only where a
numeric dimension was being laid out in row order — in both cases the previous
output was the bug.

## [1.9.0] — 2026-08-29

### Added

- **Statistics that describe how two columns relate.** `covariance`,
  `regression` — slope, intercept, R² and the slope's standard error, which in
  finance is beta, alpha and how much of either to believe — `spearman` and
  `kendall`. Pearson's correlation was already there and answers a narrower
  question than most people think: it measures a *linear* relationship and one
  outlier drags it a long way. Spearman cannot be dragged, and where the two
  disagree that is itself the finding.

- **Concentration measures, which read a text column.** `hhi`, `entropy`,
  `evenness`, `top3Share`, `top10Share` and `gini`. Every reduction before these
  reduced magnitudes; these read how a column is *spread*, which is a question
  a column of customer names can answer and a mean cannot. "Sixty per cent of
  revenue is with three accounts" had no way to be asked.

- **Robust summaries**, for the columns that have outliers in them — which this
  grid already assumed, since it has been drawing Tukey's fences for two
  releases. `trimmedMean`, `winsorizedMean`, and `robustOutliers`, which scores
  against the median absolute deviation rather than the standard deviation. An
  ordinary z-score is computed from figures a single bad reading moves, so it
  inflates its own denominator until the outlier no longer looks like one.

- **`jarqueBera`**, which turns the skewness and kurtosis already reported into
  an answer: above 5.99 the column is not plausibly normal. A screen rather than
  a verdict — it says which of two hundred columns are worth looking at.

- **Variation along an ordering.** `grid.statistics.series(col, { by })` returns
  volatility, annualised volatility, compound growth, the largest peak-to-trough
  fall and where it happened, lag-1 autocorrelation and the up/down counts.

  The ordering column is required and never guessed. Reductions see rows in the
  order they arrived, which is not the grid's sort and not necessarily any date
  column's order, so a volatility computed without saying what to order by would
  be right only when the data happened to be loaded in time order — and silently
  wrong the rest of the time.

- **Process capability.** Declare the tolerance on the column —
  `spec: { lower, upper, target }` — and `grid.statistics.capability()` returns
  Cp, Cpk, Pp, Ppk, the defect rate, control limits and every reading that
  breaks a Western Electric rule. Cp and Cpk use short-term variation estimated
  from the moving range; Pp and Ppk use the overall deviation. The gap between
  them is the point: Cpk well above Ppk means the process drifted, and Cp above
  Cpk means it is precise and aimed wrong, which needs a different fix from
  being too variable.

  `baseline` fixes the control limits over the first N readings. Without it the
  limits are computed over everything the process did, including whatever it did
  wrong, so a step change pulls the centre line between the two levels and
  *both* halves fall outside three sigma — true, and useless for finding when it
  moved.

- **Seven views for all of it**, in `modules/charts`: `correlogram` (every
  numeric column against every other), `qq`, `ecdf`, `lorenz`, `control`, a
  density curve on a histogram via `curve: true`, and a fitted line on a scatter
  via `fit: true`. Each takes its numbers from `grid.statistics` rather than
  recomputing, so a coefficient in a matrix and the same one from the API cannot
  drift apart.

- **Running totals.** `running: { of: 'amount', kind: 'total' }`, or
  `'percent'` for the cumulative share. Not a shadow kind, and the distinction
  is the design: every shadow is a function of the column and reads the same
  however the rows are arranged, whereas a running total answers "how much by
  the time we reach this row" — and *by the time* is the sort order.

- **Positional shadows can rank within the filtered set** with
  `scope: 'filtered'`. Both answers are legitimate — a rank that held still
  under a filter, and one that restarted — so it is a choice rather than a
  change of behaviour.

- **`grid.selection.statistics()`** — median, quartiles, deviation, distinct and
  outliers over the selected cells, beyond the count and sum a status bar has
  room for. Over the cells rather than a column, so a rectangle spanning three
  of them is one set of numbers.

- **A comparison panel**, `toolPanel: { panels: ['compare'] }`. Two columns and
  the nine figures between them. The bivariate statistics had no surface: every
  other one shows a single column at a time.

- **The profiling panel now shows all of it** — shape, robust summaries,
  concentration and capability beneath the twelve original figures, each in its
  own section, and a section whose reductions all return null is left out rather
  than shown as a column of dashes.

- **Any tool panel can be mounted in an element of your own.**
  `mountPanel({ grid, panel: 'statistics', container })` takes no dock and does
  not create one — `toolPanel` may be off entirely. It repaints on the same
  events the rail does. The rail is a good home for a panel a user opens
  occasionally and the wrong one for a readout that is part of the page.

- **Nine more unit systems**: angular velocity including `rpm`, mass flow,
  dynamic and kinematic viscosity, thermal conductivity, specific heat, dose
  rate, molarity, and dimensionless ratios covering `ppm`, `ppb` and basis
  points. With `luminousIntensity`, the candela that sat missing between the
  lumen and the lux already shipping.

- **A unit symbol can be written in front of the number.**
  `placement: 'prefix'` renders `$1,200` and accepts it typed back, along with
  the trailing form — a column that renders one way will be pasted into from
  somewhere that writes the other.

- **Ten statistical formula functions**: `MEDIAN`, `PERCENTILE`, `QUARTILE1`,
  `QUARTILE3`, `IQR`, `STDEV`, `STDEVP`, `VAR`, `VARP`, `COUNTDISTINCT`. They
  share their quantile definition with the totals row and the formatting rules,
  so the three cannot disagree about what a median is.

### Changed

- **Reduction names are translated.** The forty-one names the totals row, the
  totals menu and the profiling panel all show came from an English table in the
  source; they now come from the message catalogue, in all eighteen complete
  locales. A dropdown of forty reductions reading in English beside a grid
  speaking Polish was a half-translated interface.

### Fixed

- **The charts module shipped undocumented.** `modules/charts` has been in the
  package since 1.8 with no entry in the API reference, no type declarations,
  and the ISO code reference it depends on left unpublished. A customer who
  downloaded it got a charting module with no signature to call.

- **No module was declared for TypeScript.** The package exports
  `./modules/*` and shipped eight modules behind it while declaring none, so
  importing the React adapter — or any other — produced an implicit `any` and,
  under `strict`, an error. All eight are declared and the subpath carries a
  `types` condition. The build now refuses a module without one.

- **Fifty-one events were emitted and undeclared**, which made
  `grid.on('tree:loaded', …)` a compile error on an event the grid genuinely
  raises. Whole subsystems were affected: comments, presentation, presence, tree
  data, facets, forms and the timeline. Forty-six of them were undocumented too.

- **Six methods and eight configuration keys** were missing from the
  declarations and the reference — among them `comments`, `presence` and
  `facets`, each of which has a documented API namespace but had no documented
  way to switch on.

- **A histogram of a skewed column drew one bar.** Freedman–Diaconis sizes bins
  from the interquartile range, and capping the bin count widened them across
  the whole range instead, dropping every real value into the first. Bins are
  now laid over the range Tukey's fences enclose.

- **Statistics covered every row rather than the filtered ones.** The row set
  came from the store's live indices, which mean "not deleted" rather than "not
  filtered", so a profile taken with a filter applied described a data set the
  user was not looking at.

## [1.8.0] — 2026-08-29

### Added

- **A charting module.** `modules/charts` draws thirty chart types from the
  grid's own data — line, bar, column, area, scatter, bubble, pie, donut,
  sunburst, treemap, radar, gauge, funnel, heatmap, histogram, box plot,
  candlestick, combo, pareto, geomap, sankey, chord, network, stream,
  marimekko, violin, gantt and small multiples among them. It imports nothing
  from core: the grid is handed in, so the bundle carries the drawing and none
  of the grid.

  Charts follow the grid. A filter, an edit or a new row redraws them, clicking
  a mark can filter the grid in turn, and the time brush drives both. Scales,
  axes, legends, colour schemes and number formatting are shared across every
  type, so a line and a sunburst format a value the same way.

  `labels: true` writes the value beside each mark on every type that can carry
  one, through a single placement pass that drops a label which would overlap
  one already placed rather than smearing the two.

- **Statistics, as a first-class part of the grid.** `grid.statistics` answers
  what the grid already knows about its own numbers: `profile(colId)` returns
  count, present, missing, distinct, the five-number summary, standard
  deviation, outlier count and a histogram in one pass; `reduce(colId, fn)`
  runs any of twenty-two kernels; `correlation(a, b)` and
  `weightedAverage(colId, weightId)` cover the two-column cases. Every figure
  is computed over the **filtered** rows, through the same column handles the
  totals row uses, so a median here and a median in the footer are the same
  number by the same definition — R type 7, the one a statistician expects.

  The same kernels are registered for the totals row, so `total: 'median'`,
  `'p95'`, `'stddev'` and the rest work on any column.

- **Shadow columns.** A column declared against another and maintained by the
  grid, with no field in the data: `{ shadow: { of: 'price', kind: 'delta' } }`.
  It is a real column throughout — sortable, filterable, totalled, grouped,
  exported, saved into a view — which is what makes *show me every circuit
  repriced more than twice this session, most-changed first* one gesture
  rather than a report.

  Sixteen kinds. Nine describe what a row has done: `updates`, `updatedAt`,
  `sinceUpdate`, `delta`, `deltaPercent`, `rate`, `history`, `firstValue`,
  `streak`. Seven describe where it sits among the others: `rank`, `rankAsc`,
  `rankChange`, `percentile`, `quartile`, `zScore`, `shareOfTotal`.
  `grid.statistics.rebase()` is "mark all" — today's values become the
  baseline every delta is measured from.

  State is keyed by row key, never by index, and capped at 200,000 tracked
  rows per column; `tracking().forgotten` says how many were dropped rather
  than a smaller number being reported as though it were the truth.

- **A statistics tool panel.** `toolPanel: { panels: ['statistics'] }` puts a
  column picker, the twelve figures and a histogram of the column's shape
  beside the grid, following the filters. Translated into all eighteen
  complete locales.

- **Conditional formatting rules that describe the data rather than a
  threshold.** `{ when: { op: 'outlier' } }`, `{ when: { op: 'topPercent',
  value: 10 } }`, `{ scale: { from: 'quantile' } }` — eleven operators whose
  boundary comes from the column itself. `topPercent`, `bottomPercent`,
  `topN`, `bottomN`, `aboveMean`, `belowMean`, `aboveMedian`, `belowMedian`,
  `zAbove`, `zBelow` and `outlier`, the last at Tukey's fences, so a marked
  cell is one a box plot's whiskers would exclude.

  Thresholds are pinned when the rules compile and move only on
  `grid.formatting.restat()`. A boundary that re-derived itself as rows were
  filtered would repaint cells whose values had not changed, and nobody
  comparing two screenshots could tell which of the two things had moved.

- **Statistical formula functions.** `MEDIAN`, `PERCENTILE`, `QUARTILE1`,
  `QUARTILE3`, `IQR`, `STDEV`, `STDEVP`, `VAR`, `VARP` and `COUNTDISTINCT`,
  sharing their quantile definition with the totals row and the formatting
  rules so the three cannot disagree about what a median is. `PERCENTILE`
  reads `90` and `0.9` as the same request.

### Changed

- **A hovered column heading gives up its title for its controls.** The sort,
  filter and menu icons used to be revealed on an opaque surface laid over
  the end of the label, which on a narrow column left the title chopped
  mid-word rather than hidden. The heading now hides the title outright while
  the pointer is over it, and only when it actually has controls to show —
  a grid with `showColumnFunctions: false` keeps every title. Hover only,
  never keyboard focus: a pointer user knows which column they are over, and
  a keyboard user arriving by Tab does not.

### Fixed

- **Annotations stayed at the old resolution when the display changed.** The
  layer sizes its canvas from `devicePixelRatio` correctly, but nothing was
  watching for that ratio *changing* — moving a window to a second monitor,
  or changing browser zoom, resizes nothing and so triggered no redraw, and
  every mark already on screen stayed soft until something else forced one.
  The layer now watches the ratio and repaints when it moves.


## [1.7.1] — 2026-08-27

### Fixed

- **A grid past the scaled-scrolling threshold blanked its data area while
  the scrollbar was being dragged**, filling in again the moment the mouse
  was released. Roughly a million rows and up, where the spacer is clamped
  and offsets map through a scale factor.

  The grid was rendering correctly throughout — measured over a real drag it
  repainted on every frame that moved, and every frame carried the right
  rows in the right places. What it handed the browser was the problem: rows
  sat inside a spacer fifteen million pixels tall, so the whole of that had
  to be kept rasterised, and one pixel of thumb travel moves them some thirty
  thousand pixels. Past a drag speed the browser stops keeping up and shows
  the unrasterised area, which is blank.

  Rows are now drawn on a surface one viewport tall, held at the top of the
  scrollport, so their coordinates stay within a few hundred pixels of the
  fold however far down the grid is scrolled and there is no tall layer to
  rasterise. Nothing changes in the API, in what a row looks like, or in how
  the pinned regions behave.

## [1.7.0] — 2026-08-25

### Added

- **Licence keys are perpetual by default.** A key carries no expiry unless
  one is deliberately issued — a trial, a time-boxed pilot — so the ordinary
  key stays valid until the domains it names change, rather than lapsing on
  a date. `grid.licence.info().expires` is `undefined` for a perpetual key
  and an ISO date only for one issued with a term.

- **Saved views can now persist with no backend.** `views: { local: true }`
  stores a user's saved views in this browser's own `localStorage`, under a
  default key shared by every grid on the origin, or a key of your own via
  `views: { local: { key: '…' } }` to keep two grids' views apart. This sits
  alongside the existing `views.storage` option, for a developer plugging in
  a real server — an explicit `storage` always wins if both are given, with
  a console warning, rather than the two silently competing. The adapter
  itself, `createLocalViewStorage(opts)`, is exported directly too, for a
  custom key without the `local` shorthand or a different `Storage`-shaped
  backing such as `sessionStorage`.

- **An htmx integration.** `modules/htmx` lets a grid survive htmx's own DOM
  swaps, hydrate from a server-rendered `<table>`, and drive sort, filter and
  infinite scroll over plain htmx requests. It is a complete package rather
  than an add-on: `createGrid`, `autoInit`, `hydrateTable`, `readTable`,
  `serialiseState` and `restoreState` are all re-exported alongside its own
  functions, so a page using htmx integration needs only this one import —
  never the base package as well. Importing it is enough for the lifecycle
  half on its own — it registers against `document` automatically, building
  grids from `[data-lattice-grid]` elements on `htmx:load` and tearing them
  down on `htmx:beforeCleanupElement` before htmx detaches the subtree they
  live in.

  It ships in three builds, because an htmx page typically has no build step
  of its own: an ESM bundle for a bundler, a CommonJS one for `require`, and
  a global build for a plain script tag, which puts the module on
  `window.LatticeGridHtmx`. From a CDN that is one line and no module syntax:

  ```html
  <script src="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.7.0/modules/htmx.min.js"></script>
  <script>LatticeGridHtmx.autoInit(document);</script>
  ```

  Load one build or the other, never both, and never alongside the base
  package — each bundle carries the whole grid engine.

  `driveServerMode(grid, trigger, opts)` fires a request carrying `offset`,
  `limit`, `sort` and `filters` whenever sort or filter changes, and replaces
  the grid's rows with the response. `driveInfiniteScroll(grid, sentinel,
  opts)` appends rows as the grid's own visible row window nears the end of
  what's loaded — the sentinel's own `hx-trigger` names both `revealed`, for
  the first chunk, and `lattice:scroll-near-end`, for every chunk after,
  since a fixed-height virtualised grid's own scroll area is what changes,
  not the page's. `driveOobUpdates(grid, opts)` applies an out-of-band swap
  landing on `[data-lattice-row="<key>"]` to that row in place, leaving
  scroll position, selection and filter state untouched. A failed request
  never touches the grid's existing rows and shows a recoverable message
  instead of leaving it blank.

  Browser back and forward restore the prior sort, filter and scroll
  position: on `htmx:beforeHistorySave`, every live grid's state is written
  onto its element for htmx's own history snapshot to capture; on
  `htmx:historyRestore`, it's read back and applied, except on a cache miss,
  where a fresh server response is already the truth. Ships as ESM and as a
  plain `<script src>` build with no bundler required. See the developer
  guide's "Using with htmx" section for the full wiring and the query
  convention a server needs to support.

- **Declarative init, table hydration and compact state URLs**, independent
  of any framework adapter. `autoInit(root)` builds a grid on every
  `[data-lattice-grid]` element under `root`, reading a sibling
  `<script type="application/json" data-lattice-config">` for its
  configuration, or hydrating a `<table>` element directly — reading its
  header row for columns and body rows for data, then replacing itself with
  the grid — when no config script is present. `serialiseState(grid)` /
  `restoreState(grid, encoded)` encode everything `grid.state` covers as a
  compact, URL-safe string, diffed against the grid's own defaults first, so
  an untouched grid encodes to a handful of characters. A `<meta
  name="lattice-license" content="…">` tag is read automatically when no
  `licence` is passed to `createGrid`. Every element `createGrid` builds on
  is now discoverable from itself: `element.__lattice` holds the live
  instance, cleared on `destroy()`.

- **A compatibility wrapper for dhtmlx Grid.** `modules/dhtmlx-compat` exposes a
  `Grid` class shaped like dhtmlx's own `dhx.Grid` (Suite 5+) — the same
  constructor call, the same `.data`, `.selection`, `.history`, `.export` and
  `.events` namespaces — backed by a real Lattice grid underneath. For the
  covered surface, existing calling code does not change.

  Covers column definitions; `.data`'s `add`/`update`/`remove`/`removeAll`/
  `parse`/`load`/`find`/`findAll`/`exists`/`getItem`/`getId`/`getIndex`/
  `getLength`/`forEach`/`serialize`/`sort`/`filter`/`resetFilter`;
  `.selection`'s `setCell`/`getCell`/`getCells`/`isSelectedCell`/`removeCell`;
  `.history`'s `undo`/`redo`/`canUndo`/`canRedo`/`clear`/`getHistory`;
  `.export.csv`/`.xlsx`; and a name-mapped subset of `.events`, several of
  which — `cellClick`, `cellDblClick`, `cellRightClick`, `afterEditStart`,
  `afterEditEnd`, `afterSort` — call your handler with dhtmlx's own positional
  arguments rather than Lattice's event object, matching dhtmlx's documented
  signatures. `afterRowDrop` is included, firing `(data, event)` from either a
  same-grid reorder settling or a row landing from another grid — dhtmlx has
  one event name for what Lattice models as two. Grid-level `dragItem: 'row'`
  becomes `rowReorder: true`.

  Every `before*`/`can*`/`cancel*` event is deliberately unmapped: dhtmlx lets
  a handler return `false` to cancel the action, and Lattice has no
  cancelable-event model to honour that with. Row and column drag
  *negotiation* — a handler refusing or steering a drop mid-gesture — is
  unmapped for the same reason. Cross-grid dragging needs an explicit
  `rowTransfer`, passed straight through: dhtmlx lets any two `dragItem:
  'row'` grids on a page exchange rows by default, and Lattice's `rowTransfer`
  is deliberately opt-in per pair, with nothing to derive it from.
  `export.pdf()` and `export.png()` throw — there is no raster export to
  translate to. `.rangeSelection` is offered on a best-effort basis, with a
  range shape of this wrapper's own design rather than dhtmlx's own
  `RangeSelection` module. The classic, pre-Suite-5 `dhtmlXGridObject` is not
  covered. See the developer guide's "Coming from dhtmlx Grid" section for the
  full list.

### Fixed

- **A grid that had offloaded work to a background Worker left it running
  after `destroy()`.** Every other listener, observer and buffer was
  released; the Worker itself was the one thing nothing reached. Only grids
  past the row-count threshold that triggers Worker offload were affected —
  a small or mid-sized grid was never at risk. `destroy()` now terminates it.

## [1.6.2] — 2026-08-25

### Fixed

- **Dragging a row by its handle also started a range selection underneath
  it.** The handle sits inside a cell, so a press on it was picked up by both
  gestures at once — the row began moving, and a one-cell range was left
  selected and stayed that way even after the row had already been dropped
  elsewhere. A press on the handle is now read as a row drag only.

### Added

- **Picking up a row now shows it, wherever the pointer goes.** The row being
  dragged dims in its own grid, and a small label naming it follows the
  pointer for as long as the drag is held. A plain mouse drag holds no cursor
  across whatever it crosses, so previously nothing on screen showed a drag
  was under way until the pointer physically reached another grid.

## [1.6.1] — 2026-08-23

Documentation only. The distribution is unchanged from 1.6.0 — same bundles,
same types, same stylesheet — so an upgrade is worth taking only for the
reference that ships beside them.

### Fixed

- **`state.apply` was documented as returning nothing.** It returns a report
  naming everything in a saved view it could not apply and why, which is how a
  host tells a user that a view saved against an older layout has aged. The
  behaviour has always been this; the reference was wrong.

### Added

- **The reference now says what a saved view does when the columns change
  underneath it.** A view is user data written against a column set that has
  since moved on, and nothing stated the rules.

  A column added since the view was saved **appears**, in whatever state its
  definition declares, after the columns the view names — a view is not a
  whitelist, and silence about a column nobody had heard of is not an
  instruction to hide it. Ship a column `hidden` if it should not arrive
  announced. A removed column is skipped and reported, and a sort or grouping
  that pointed at it is dropped rather than left dangling.

## [1.6.0] — 2026-08-22

### Added

- **The grid's own text can be translated.** Every string the grid renders or
  announces now comes from a message catalogue rather than from the source, and
  a catalogue can be replaced or partially overridden through the new `messages`
  option. British English (`EN_GB`) is the default, and catalogues ship for twenty
  other locales, each exported under the code shown: American English
  (`EN_US`), French (`FR_FR`, `FR_CA`), Italian (`IT_IT`), Spanish (`ES_ES`),
  Brazilian Portuguese (`PT_BR`), German (`DE_DE`), Dutch (`NL_NL`), Swedish
  (`SV_SE`), Danish (`DA_DK`), Norwegian (`NB_NO`), Finnish (`FI_FI`), Polish
  (`PL_PL`), Czech (`CS_CZ`), Hungarian (`HU_HU`), Romanian (`RO_RO`),
  Ukrainian (`UK_UA`), Greek (`EL_GR`), Japanese (`JA_JP`) and Arabic (`AR`).

  A catalogue carries a region only where two variants of the language ship,
  which is why the Englishes and the two Frenches are qualified and nothing
  else is. Arabic is therefore `AR` — but `AR_SA` is exported as an alias for
  it, because that is the name people reach for first. Both are the same
  catalogue. For any other tag, `resolveCatalogue('ar-EG')` finds it.

  Each is an export of the package, so importing one does not reduce what is
  bundled.

  ```js
  import { createGrid, FR_FR } from '@toclocoinc/lattice-grid';
  createGrid(element, { locale: 'fr-FR', messages: FR_FR });
  ```

  Where `locale` is not given, the grid takes the language the page declares in
  `lang`. Overrides merge over the default, so translating part of the interface
  leaves the remainder in English rather than showing raw keys. `MESSAGE_KEYS`
  lists every key and `auditCatalogue()` reports what a catalogue is missing.

- **Eleven strings that were never translatable now are.** The comment panel's
  labels and its Comment and Delete buttons, the timeline bar's scrubber and
  Go live control, the fill handle's tooltip, the icon picker's list and the
  placeholder shown when a value is too long to encode as a QR code all read
  from the catalogue like everything else. They previously rendered in English
  whatever the locale.

- **`grid.messages`** exposes the resolved message set — `t()`, `list()`,
  `number()` and the active `locale` — so a host-supplied renderer or panel can
  draw its text from the same source the grid does.

- **Rows can be pinned above and below the scrolling body.** `pinnedTopRows` and
  `pinnedBottomRows` hold rows against the header or the status bar, and
  `grid.setPinnedRows(rows, { edge })` moves them at runtime. Use one for a
  column-units line, a target to compare against, a precomputed summary, or a
  note that must stay in view.

  ```js
  createGrid(element, {
    columns,
    rows,
    pinnedTopRows: [{ product: 'Units', capacity: 'MW', margin: '%' }],
  });
  ```

  The rows render through the ordinary column pipeline — value getters,
  formatters and cell renderers all run — but they are not part of the data:
  not counted, sorted, filtered, grouped, selectable, totalled or exported. A
  filter that matches nothing leaves them visible.

- **The grid lays out right to left.** `direction: 'rtl'` renders the grid
  mirrored; omitted, the direction follows the element's own `dir` and then the
  locale, so `locale: 'ar'` is right to left without further configuration.
  Pinned columns, the header, horizontal scrolling, column resize and reorder,
  the fill handle, annotations, the facet band and menu placement all follow the
  writing direction.

  ```js
  createGrid(element, { locale: 'ar' });          // direction follows the locale
  createGrid(element, { direction: 'rtl' });      // or say so outright
  ```

- **Fifty new data types for physical, engineering and scientific quantities.**
  Each stores a plain number in a named base unit, so the column still backs
  onto a typed array and sorting, filtering, grouping and totalling stay
  ordinary arithmetic — only display and input are unit-aware.

  ```js
  { field: 'span',   type: 'metres' },       // 1500 → "1.5 km"
  { field: 'inlet',  type: 'pressure' },     // 200000 → "200 kPa"
  { field: 'cap',    type: 'capacitance' },  // 4.7e-11 → "47 pF"
  { field: 'intake', type: 'celsius' },      // accepts "72 F", stores 22.2
  ```

  Twelve new unit systems — speed, acceleration, area, volume, energy, power,
  force, pressure, torque, density, flow and angle — join the length, mass and
  elapsed-time ladders, which existed but had no declared type and needed a
  hand-rolled `dataTypes` entry to reach. Fifteen SI-prefixed electrical and
  scientific quantities are generated from one prefix table: voltage, current,
  resistance, capacitance, inductance, charge, conductance, flux density,
  luminous flux, illuminance, substance, three radiation measures and
  frequency. `registerUnitSystem` adds a system of your own. The elapsed-time
  ladder now reaches down to nanoseconds.

  **Ambiguous units are refused rather than guessed.** A US gallon and an
  imperial gallon differ by about a fifth and "ton" means three different
  masses, so each carries its own symbol and the bare word is rejected on
  input. The same rule covers case: `mV` and `MV` are a billion apart, so both
  work and `mv` does not.

  `display: 'auto'` walks the coherent SI ladder only. Customary units are
  accepted on input and available as an explicit display, but never chosen —
  otherwise 4,000 J renders as `3.79 BTU`, since auto picks the largest unit
  that fits.

- **`significantFigures` renders to a fixed precision** rather than a fixed
  number of decimals, so a column claims the same accuracy on every rung of its
  ladder. Rounding is applied before the unit is chosen: 999,999 bytes to three
  figures is `1.00 MB`, not `1,000 kB`.

- **Angles average by direction.** The mean of 359° and 1° is 0°; the
  arithmetic answer of 180° points the opposite way. `degrees` and `radians`
  columns replace the mean and report nothing where the angles cancel. The sum
  stays arithmetic, since a total rotation of 720° is two turns.

- **A temperature editor.** A temperature column now gets its own editor rather
  than the plain number one, so the field carries its scale and `72 F` can be
  typed straight into a Celsius column — which the type already accepted from a
  feed and from the clipboard, but not from the keyboard.

- **Temperature columns refuse to be summed.** Twenty degrees plus twenty
  degrees is not forty degrees. `celsius`, `fahrenheit` and `kelvin` offer
  average, minimum and maximum, convert on input, and are a separate type from
  the unit ladders because a temperature scale carries an offset that no single
  factor can express.

- **Rows can be drawn as cards instead of columns.** `rowTemplate` gives each
  row a layout of your own — a card list, a feed, a search-result list — over
  the same pipeline, so sorting, filtering, grouping, selection, permissions,
  redaction, saved views, undo, export and the remote source all keep working
  and only the drawing changes.

  ```js
  createGrid(element, {
    columns, rows, rowKey: 'id', rowHeight: 64,
    rowTemplate: '<p class="title">{{data.name}}</p><p class="sub">{{data.owner}}</p>',
  });
  ```

  The template compiles once, the way a cell template does, and binds with
  `{{data.field}}`. There is deliberately no per-row callback: that shape would
  be used to allocate DOM per row, and the virtualisation would stop paying for
  itself. Scrolling ten thousand records through a hundred pooled cards
  allocates nothing.

  `{{cell.column}}` shows what the table shows — the column's own formatter,
  data type and lookup label — while `{{data.field}}` reads the raw value for a
  template that wants the number rather than the rendering. A card showing `2`
  where the table shows `Held` is a bug, not a preference. Binding a raw field
  on a secret or redacted column reads its masked text instead, so a card
  cannot become the hole a redaction closes.

  `cardsPerRow` or `maxCardWidth` puts several cards on a line. The first is a
  count for a layout that must not reflow; the second is a ceiling, and the
  number across follows the container — 900px at a 260px ceiling is three cards
  that share the width, and a narrower container fits fewer. The scroll height
  counts lines rather than records, so the scrollbar matches the content.

  A card is still a row. `row:clicked` and `row:dblclicked` fire with the same
  payload as a table row, clicking selects, the context menu opens, and
  `rowReorder` works with the card itself as the drag handle. The presentation
  is announced as a list rather than a grid, since a card has no columns, and
  the column header is not drawn.

- **A grid can collapse to cards when its container is narrow.**
  `responsive: { maxWidth: 640, template }` presents rows as cards below the
  threshold and as a table above it — the mobile answer, since a table on a
  phone is a compromise however it is styled.

  Measured on the **container**, not the viewport, so a grid in a narrow panel
  on a wide screen collapses and a grid filling a small tablet does not. The
  sort, the filters, the selection and the scroll position all survive the
  switch in both directions; an open cell editor is closed, since the cell it
  belonged to stops existing. `presentation:changed` fires with `'cards'` or
  `'table'`, and the change is announced.

  Sorting and filtering need a home when there are no column headings to click:
  `toolPanel: true` keeps its rail available in card presentation. Export is
  unaffected — the columns remain the data model, so a file from a collapsed
  grid holds every column, including ones the card does not show.

- **A row can be edited on a form.** `rowForm: true` and double-clicking a row
  opens it in a right-hand drawer — or a centred dialog with `mode: 'dialog'` —
  with one control per field, a Save and a Cancel. The fields are the grid's own
  columns, edited with the same editors, types, formats and lookups the cells
  use.

  ```js
  createGrid(element, { columns, rows, rowKey: 'id', editable: true, rowForm: true });
  ```

  Where the record holds more than the grid shows, a `load` function fetches the
  fuller version and `fields` says what to show and in what order. The panel
  opens immediately and fills in when the record arrives, rather than waiting
  with nothing on screen. A load that fails — or that has not answered within
  `timeout` milliseconds, two seconds by default — leaves the panel open with a
  retry instead of closing and discarding the intent.

  ```js
  rowForm: {
    mode: 'dialog',
    load: ({ key }) => fetch(`/api/orders/${key}`).then((r) => r.json()),
    fields: [{ field: 'name', label: 'Name' }, { field: 'ref', label: 'Reference' }],
  }
  ```

  Every editor is available on a form, including your own: a field named after a
  column borrows that column's editor, and any field may name one with `editor`,
  configured by `type`, `props` and `lookup` exactly as on a column. A picker —
  a date, a dropdown, a tree, a colour — shows its value on the field and opens
  its panel when clicked, rather than arriving open.

  Save writes the changed fields that map to columns and emits `form:saved` with
  all of them, including any that came from `load` and have no column; where the
  record is persisted is yours. `grid.form` opens, closes and saves from code,
  and `trigger: false` leaves opening entirely to it.

  `container` builds the form in an element of your own — a sidebar, a panel
  below the grid, a column in a layout you already have — instead of over the
  grid. It takes an element, a selector or a function, and a selector is
  resolved when the form opens rather than when the grid is configured, since a
  grid is usually built before the layout around it exists. A form in your own
  container is announced as a region rather than a modal dialog and does not
  trap Tab, because it sits beside the grid rather than over it.

  On an editable grid the form takes the double click, so double-clicking a row
  opens the form rather than a cell editor. Cell editing stays on Enter and on
  typing into the cell.

- **Columns can be tagged, and filtered by tag.** Give columns a `tags` list and
  set `columnTagFilter: true`, and a bar above the headings lets a user show
  only the columns carrying a chosen tag — sixty months of figures across five
  years become twelve by picking a year.

  ```js
  { field: 'jan24', title: '01/24', tags: ['2024', 'Q1'] }
  ```

  **Only tagged columns are ever hidden.** An account name or a total belongs to
  no year, so it stays visible whatever is selected — and you do not have to tag
  every column merely to keep it on screen.

  A column may carry several tags, which gives a second axis for free: tag each
  month with its year and its quarter, and either can be picked.
  `columns.tags()`, `columns.showTagged()` and `columns.activeTags()` are the
  same thing from code.

- **`showColumnFunctions: false`** leaves each column heading as its label, with
  no sort, filter or menu control. They are not drawn rather than hidden, so the
  label has the whole cell — which is what a dense grid of narrow columns wants.
  Sorting, filtering and the menu stay reachable through the API, the keyboard
  and the tool panel.

- **Grid lines, rounded corners, and percentage column widths.**

  `gridLines` chooses which rules are drawn between cells:
  `'horizontal'` (the default, and what the grid has always drawn),
  `'vertical'`, `'both'` or `'none'`. Vertical rules between body cells are
  new — the grid never drew them — so the default is unchanged and nothing
  moves on upgrade.

  `cornerRadius` rounds the grid's outer corners: `true` for the theme's own
  radius, a number for pixels, or a string used as written.

  A column width may now be a percentage — `layout: { width: '25%' }` — which
  is a share of the whole grid. That is not the same as `flex`, which divides
  only the space left after the fixed columns.

- **Group headings stay pinned while you scroll inside a group.** Scroll a few
  hundred rows in and the rows on screen still say which group they belong to,
  instead of leaving you to scroll back up and check.

  On by default, stacking at most two — each heading costs a row of viewport.
  `stickyGroupHeaders: false` turns it off and a number sets the cap.

  `grid.rows.groupHeadings(index)` returns the same answer directly, for a
  breadcrumb of your own.

- **A data type can refuse a total that means nothing for it.** Values that do
  not add up the way plain numbers do now say so, and the grid fails when the
  column is configured rather than rendering a confident wrong figure.

  Four types use it. `decibel` and `decibelAmplitude` sum and average in the
  linear domain and convert back — 90 dB and 90 dB make 93 dB, not 180.
  `ratio` and `percentRate` average by weight, using the column named in
  `typeOptions.weight`: a 100% conversion on two visits and a 1% conversion on
  ten thousand average to 1.02%, not 50.5%.

  ```js
  { field: 'conversion', type: 'percentRate', total: 'avg',
    typeOptions: { weight: 'visits' } }
  ```

  A type that declares nothing supports every aggregate, so no existing column
  changes. Custom types can declare `totals.supported` and `totals.implement`
  to do the same.

- **Grids can be kept column-aligned.** `alignedGrids` links two or more grids
  so they read as one table split into sections — a summary band above a detail
  grid, or two datasets side by side under identical columns.

  ```js
  const summary = createGrid(top, { columns, rows: totals });
  const detail  = createGrid(bottom, { columns, rows, alignedGrids: [summary] });
  ```

  Column widths, order, visibility, pinning and horizontal scroll are shared.
  Sort, filters, selection, grouping and the rows stay independent — sharing
  those would make one grid with extra steps rather than two aligned ones.

  Also adds `grid.scroll.to({ top, left })`.

- **`grid.scroll` reaches a cell, and takes a row key.** `scroll.toCell(row,
  colId)` moves both axes in one call, and `toRow` now accepts a row key as
  well as a display index — a key is what a caller usually holds, and it
  follows its row through a sort where an index does not.

- **Rows can be dragged between grids.** `rowTransfer` lets one grid send rows
  to another — a catalogue beside a basket, an available list beside an
  assigned one.

  ```js
  createGrid(left,  { columns, rows, rowReorder: true,
                      rowTransfer: { receive: false, group: 'order' } });
  createGrid(right, { columns, rows,
                      rowTransfer: { send: false, group: 'order' } });
  ```

  Off by default. `send` and `receive` are both on when the option is present,
  so a one-way drag is expressed by turning off the direction you do not want.
  `mode: 'copy'` leaves the row where it was, and `group` stops unrelated grids
  on a page accepting each other's rows.

  The target adds before the source removes, so a refused transfer — a
  duplicate key, most likely — loses nothing. `row:sent`, `row:copied` and
  `row:received` report what happened.

- **Rows can be reordered by dragging.** `rowReorder: true` adds a drag handle
  to the first visible column, and `Alt`+`Shift`+arrows does the same without a
  pointer. `grid.rows.move(key, to)` is the same operation from code.

  ```js
  createGrid(element, { columns, rows, rowReorder: true });
  grid.on('row:moved', () => api.saveOrder(grid.rows.data()));
  ```

  The move reorders your data and tells you it happened; writing the new order
  somewhere permanent is yours, since only you know where it lives.

  It is refused while a sort, filter or grouping is active, and says why rather
  than springing the row back: dropping between two visible rows says nothing
  about where it belongs among rows that are hidden or reordered.

- **Press `?` for the keyboard shortcuts.** The grid ships twenty-odd bindings —
  arrows to navigate, Ctrl with arrows for the ends, Enter to sort a heading,
  Alt with arrows to resize it, letters to group from the tool panel — and
  nothing in the product told anyone they existed.

  The overlay is generated from the bindings themselves rather than written
  out, so it cannot drift from what the grid actually does, and a build check
  fails if a binding is added with nowhere to show it. Every description is
  translated in every catalogue. Modifiers follow the platform: the
  grid reads Ctrl or Cmd, so a Mac is shown Cmd.

  Escape closes it and focus returns exactly where it was. `shortcuts: false`
  suppresses it for a host that wants `?` for itself.

- **Rows can span every column.** `fullWidth` draws matching rows as a single
  band across the whole grid instead of dividing them into columns — a section
  banner, an explanatory note, an empty-group message, a "load more"
  affordance.

  ```js
  createGrid(element, {
    fullWidth: {
      when: (row) => row.data.kind === 'section',
      render: ({ data }) => data.title,
    },
  });
  ```

  The band is drawn over the pinned regions as well as the centre, so it spans
  every column, and it holds still while the columns scroll underneath. A
  full-width row is still one of your data rows — counted, sorted, filtered and
  exported like any other; only its presentation changes. For a row that should
  not be part of the data, use `pinnedTopRows`.

- **The column menu takes your own items.** `columnMenu` accepted `true` or
  `false`; it now also accepts `(params, defaults) => items`, the same form
  `contextMenu` has always taken. It covers both routes into a column's menu —
  the header's 3-dot button and a right-click on the heading — and `params`
  carries `{ colId, column, grid }`.

  ```js
  columnMenu: (params, defaults) => {
    const month = params.column.def.context?.month;
    if (!month) return defaults;
    return [...defaults, { name: 'Select quarter', action: () => selectQuarter(month) }];
  }
  ```

  As with `contextMenu`, an empty array suppresses the menu and returning
  nothing leaves the defaults alone.

### Fixed

- **Text a numeric cell cannot read is refused rather than accepted.** A
  refused value keeps what was in the cell, marks it with the reason, leaves
  the editor open holding the typed text, and stays in the cell rather than
  moving on. Clearing a cell deliberately still works: a blank field and an
  unreadable one are different answers.

- **Counts are pluralised by the rules of the language, not by an English
  suffix.** Where the grid said "1 row" or "12 rows" it applied an `n === 1`
  test, which is wrong in most of the languages now shipping. French makes zero
  singular — "0 ligne", not "0 lignes". Polish, Czech and Ukrainian need four
  forms, so five rows and two rows take different words. Romanian inserts a
  word from twenty upwards: "2 rânduri" but "20 de rânduri". Arabic has six
  categories including a dual for exactly two. Japanese and Hungarian have
  effectively one. Plural selection now uses the platform's own rules.

- **Numbers inside messages are formatted for the locale.** Several counts were
  interpolated directly and rendered ungrouped — in announcements, and in the
  `json` type's summary of a large value, which now reads `[5,000 items]` rather
  than `[5000 items]`.

- **Lists inside announcements are joined the way the language joins them,**
  rather than always with a comma.

- **Numbers are read in the grid's locale on every write path.** Typing
  `1.234,56` into a number filter or editor already worked; pasting it into a
  cell, or writing it through the value pipeline, now reads the same way.

  Group and decimal separators come from the locale, including Switzerland's
  apostrophe and the narrow no-break space French uses.
  A grid with no `locale` behaves exactly as before. The guards that refuse
  bare arithmetic and stray formulas are unchanged, so `2*3` is still refused
  rather than stored as 23.

## [1.5.4] — 2026-08-20

### Fixed

- **`getVersion()` is exported from the module.** The reference has always said
  it is available there, "for when you have no grid to hand", and it was not: it
  was imported into the entry point and never re-exported, so the unused import
  made it look as though it were. `grid.getVersion()` on an instance was
  unaffected.

## [1.5.3] — 2026-08-20

### Fixed

- **The `lattice-grid.css` specifier resolves.** It pointed at the unminified
  stylesheet, which is not part of the published distribution, so importing it
  failed. Both it and `/css` now resolve to the stylesheet that ships.

### Changed

- **Bundle sizes are no longer quoted in the documentation.** A figure in prose
  is wrong from the next release onwards, and several were: the adapters were
  described as about 5KB gzipped when they are considerably larger.

- **The web component's constraint is documented.** It carries the grid inside
  it, which is what makes it a drop-in custom element. Loading it alongside
  `createGrid` in the same page therefore gives you two independent copies of
  the grid, each with its own registries — a renderer, editor or data type
  registered through one is invisible to the other, and nothing errors to say
  so. Use one route or the other; the reference and the README now say this.

## [1.5.2] — 2026-08-20

### Fixed

- **`require()` returns the library rather than an empty object.** The package
  declares `"type": "module"`, which makes every `.js` file in it an ES module —
  including the UMD build that `require` resolved to. Node parsed the wrapper as
  ESM, where `module` is not defined, so the branch that assigns
  `module.exports` never ran and the call handed back an empty namespace.

  It did not throw, which is why it survived: `require('@toclocoinc/lattice-grid')`
  succeeded and returned `{}`. The CommonJS entry now ships as `.cjs`, which opts
  out of the package type whatever it is, and the build refuses to produce a
  manifest whose `require` entry is a `.js` file.

  The `<script>` tag path is unaffected and still loads `lattice-grid.min.js`;
  no manifest is involved there.

- **`require` resolves to a file that is published.** It pointed at the
  unminified UMD build, which is not part of the public distribution.

## [1.5.1] — 2026-08-20

### Fixed

- **The framework adapters can be imported.** They shipped in `modules/` and
  were unreachable: a package's `exports` map blocks every subpath it does not
  list, and the adapters were not listed. `@toclocoinc/lattice-grid/modules/react`
  and its siblings now resolve, verified by installing the built package and
  importing each one.

- **The package name matches what you install.** The manifest was published
  under the repository's unscoped name while the package itself is scoped, so
  every import example in the documentation named something that does not exist.

- **The README describes what actually ships.** It opened by claiming no
  framework wrapper, in a distribution containing four of them, and never
  mentioned the adapters at all. It also listed unminified builds that are not
  published, and carried a trademark notice for marks that do not exist. The
  repository README and the published one are now generated from one source, so
  they cannot disagree again.

## [1.5.0] — 2026-08-20

### Added

- **`targetSize: 'large'` raises hit areas for touch.** The grid meets the
  minimum target size on its own, but that minimum is a conformance floor rather
  than a comfortable size for a finger; both mobile platforms recommend nearer
  44 pixels. This raises the targets and leaves the type alone, which is the
  distinction that matters — a touch user wants a bigger target, a low-vision
  user wants bigger text, and density is already the control for the second.
  The two combine.

  It applies by itself under a coarse pointer, because the person holding one is
  both who the criterion is for and the least likely to go hunting for a
  setting. `targetSize: 'default'` opts out.

  Density alone does not do this: measured at every preset, it scales the
  header, the rows and the type while the affordances inside them stay exactly
  as they were — the menu button 24 pixels, the filter 16, the resize grip 10.
  A grid with nothing configured measures exactly as it did.

- **Grouping, values and pivot no longer need a pointer.** They were expressed
  by dragging a column into a zone in the tool panel, so on a grid without that
  panel there was no route to them at all, and for a keyboard user there was
  none anywhere. With a column focused in the panel's list, `G`, `V` and `P` put
  it into row groups, values or pivot columns — and take it out again, because a
  binding that only adds leaves no way back. Each change is announced.

  The column menu now carries the same three, alongside the grouping item it
  already had, so the functions are discoverable rather than only memorable.

- **`rows.forEachAll(fn)` walks the data rather than the view.** `rows.forEach`
  visits what is on screen — filtered, sorted, grouped, collapsed rows left out
  — which is the right default and the wrong answer for a caller totalling a
  column, exporting, or reconciling against another system. There was no way
  past the filter short of reading your own source array back.

  ```js
  grid.rows.forEachAll(row => { total += row.data.amount });
  ```

  Leaf rows only, in the order they arrived: group rows are a product of the
  current grouping and are not in the data, and the sort belongs to the filtered
  view. A remote or paged source holds the page it has fetched rather than the
  whole set, so it says so instead of quietly handing back the filtered rows.

- **The grid says what changed, not only that something did.** The live region
  announced three things — sort, filter and selection — and everything else
  happened in silence. Collapsing a group moved a hundred rows out of view
  without a word, which is worst for the user who cannot see them go.

  Now announced as well: grouping applied or cleared, a group expanded or
  collapsed with what remains visible, page changes, undo and redo naming the
  action they reversed, a paste with the number of cells written, and rows
  arriving or leaving on a live feed.

  The feed is summarised on a two-second interval rather than announced per
  batch. A screen reader queues what it is given, so narrating a fast feed
  leaves the user listening to counts that stopped being true several seconds
  ago — worse than saying nothing. Changed *values* are deliberately not
  announced: they already show themselves, and "500 updated" every two seconds
  is the noise that makes someone switch the grid off. Holding the feed silences
  it entirely, which is the point of holding it.

- **An accessibility section, with the keyboard map published in full.** The
  bindings existed in the build and were documented nowhere, so the ones the
  grid already had were undiscoverable. The reference now carries the complete
  map, what a screen reader is told, the colour and contrast position, and the
  known limits stated plainly rather than omitted.

  The map is generated from the bindings the build ships and checked on every
  build, so it cannot drift. A keyboard reference that is wrong is worse than
  none: a user who tries a listed binding and gets nothing concludes the grid is
  broken rather than the page.

- **The accessibility checks run on every build, across every shape of grid.**
  They existed and ran only when a developer opened the devtools panel, so
  nothing stopped a refactor undoing them. They now run in the test suite
  against the configurations that differ structurally — flat, grouped, tree,
  pinned at both ends, editing, paginated and with a tool panel — because a flat
  grid is the easy case and the one that never breaks.

  The rules were extended to cover what a grid gets wrong: the role matching the
  data, hierarchy rows carrying their position, headings being focusable,
  dialogs declaring their modality, the live region existing, target sizes, and
  chrome staying inside the grid. Colour rules are skipped where a document has
  no computed styles rather than bringing the checker down with them.

- **Popups behave the way they describe themselves.** The comment panel keeps
  Tab inside itself and returns focus to the cell that opened it — behaving
  modally — while declaring `aria-modal="false"`, which tells a screen reader
  the grid behind is still available when it is not. It now declares what it
  does.

  The filter popup had the opposite problem: a dialog with no way to dismiss it
  from the keyboard and no focus return, so a user who opened it lost their
  place. `Escape` now closes it and focus goes back to whatever opened it. It
  stays non-modal, which is correct for it — the trap and the declaration now
  agree in both directions.

- **The status strip no longer pushes its controls off the grid.** It was a flex
  row that could not wrap and had nothing to scroll it, so on a narrow grid its
  last children simply ended up outside: at 320 pixels the next-page and
  last-page buttons sat 8 and 36 pixels beyond the right edge and could not be
  reached by any means. That is loss of functionality under WCAG 1.4.10 Reflow,
  not an untidy strip. The strip and the pager now wrap. Nothing changes above
  about 480 pixels, where they never overflowed.

- **Every control meets the minimum target size.** WCAG 2.5.8 asks for
  24&nbsp;&times;&nbsp;24, or 24 pixels of clearance, or the same function on a
  control that qualifies. Measured across all three densities, four controls met
  none of the three.

  The page buttons were 19&nbsp;&times;&nbsp;19 with 22 pixels between centres,
  failing on size and clearance together; they now carry a 24-pixel floor that
  holds even when a host's font size would otherwise shrink them.

  In a column heading, the menu button is now 24&nbsp;&times;&nbsp;24 and stops
  clear of the resize grip, which is absolutely positioned over the cell's edge
  and had been taking two pixels of it. That one change settles the heading:
  the grip gains the clearance it needed and passes on spacing, and the filter
  icon passes on equivalence, because filtering is a menu item and the menu
  button now conforms. Only the hit area grew — the glyph is unchanged until you
  hover it.

  The cost is about eighteen pixels of heading furniture per resizable column,
  which is noticeable on a narrow column at spacious density, where the title
  has least room to give.

- **The tool panel's column list is operable from the keyboard.** Its rows
  reordered by dragging a grip, and the panel had no key handling at all — so
  the place a user goes to rearrange columns in bulk could be read and not
  changed without a pointer. The rows are now focusable, arrows walk the list,
  and `Shift` with an arrow moves a column, matching the header's binding so
  there is one gesture to learn rather than one per surface. Each move is
  announced, and a column already at an end says so rather than going quiet.

- **The column menu can move and size a column.** Reordering and resizing were
  expressible only as a pointer drag, so neither was discoverable and neither
  worked on a touch device, where there is no hover to reveal the resize grip.
  The menu now carries Move left, Move right, Move to start, Move to end, and a
  Width submenu of Narrower, Wider and Fit to content — the same steps the key
  bindings use, so the two routes agree rather than disagreeing by pixels.

  Actions that cannot apply are disabled rather than hidden, so the menu keeps
  its shape from column to column and the greying is itself the explanation.

- **A refused edit says so, not just shows so.** An optimistic write the
  provider rejects is rolled back and the cell marked for a couple of seconds.
  That marker was purely visual, so a screen reader user committed an edit,
  heard nothing, and had no way to learn the value had gone back — the highest
  consequence silence in the product, because the user believes they saved
  something they did not.

  The rollback is now announced with the column, the value restored and the
  reason the provider gave. A batch that is refused wholesale produces one
  message with a count rather than one per cell, and an accepted edit stays
  silent, which is correct for the ordinary case.

- **`history:applied` reports an undo or a redo.** `history:changed` fires
  whenever the undo and redo stacks move, including when a new action is pushed
  onto them, so it cannot tell a host that something was actually reversed. The
  new event carries the direction and the step.

- **Rows in a hierarchy report their position among their siblings.** A tree or
  grouped row now carries `aria-posinset` and `aria-setsize`. Virtualising means
  most of a branch is not in the document, so a screen reader could not count
  the set and said nothing about position at all — "expanded, level 2" with no
  indication of whether that was the first of three or the last of four hundred.
  A flat grid writes neither, since the row index already answers it.

- **A read-only grid says so.** `aria-readonly` is set when editing is off, so
  the grid is distinguishable from an editable one before a user tries to edit
  it and nothing happens.

- **Forced colours: the opt-out no longer leaks into a whole row.**
  `forced-color-adjust` is an inherited property, and it was set on selected
  cells — so everything inside a selected row silently opted out of forced
  colours and kept its own palette. A status pill in a selected row held its own
  pale background and its own text colour against the system's selection ground,
  and the row's high-contrast text colour never reached the text at all.

  Selection now opts out at the cell, so the system's selection colours reach
  its text, and opts the decorations inside it back in, so a pill is forced like
  anything else. Both halves are needed: without the opt-out the browser paints
  the cell's children on a plain background and the text disappears; with it
  alone, everything inside keeps its own palette.

  Elsewhere the opt-out is gone. It is only ever needed to preserve an *author*
  colour, and it now appears on two leaf elements: a colour swatch, where the
  colour is the value, and the dot identifying a collaborator. A peer's cursor
  and range are marked with a border instead, because those are cells with text
  inside them.

  Progress and histogram fills were losing their forced-colours treatment to
  more specific variant rules while still carrying the opt-out — the worst of
  both, a bar keeping an author colour with the browser told not to correct it.
  They now match at the specificity of the rules they override.

- **Windows High Contrast Mode is supported.** The grid had no
  `forced-colors` handling at all, so in that mode every piece of meaning it
  carries in a background tint was simply lost: which row was selected, which
  cell had changed, which rows were added or removed, where a pinned region
  ended, what a status pill signified.

  State is now translated rather than recoloured. Selection takes the system's
  own selection colours. Pinned regions swap their shadow, which the mode does
  not render, for a rule. Pills, fill decorations, progress tracks and histogram
  bars each gain a border, since a fill with no edge disappears once its colour
  is discarded. Diff states stop relying on hue and are told apart by border
  style — solid for added, dashed for removed, doubled for changed — because the
  mode offers no way to hold four colours apart.

  A colour swatch and a collaborator's presence colour keep their own colour,
  declared explicitly: there the colour is the value, and translating it would
  destroy the meaning rather than carry it.

- **The column header is operable from the keyboard.** `Ctrl`+`Alt`+`H` moved
  focus onto a heading and nothing there responded to a key: sorting, the column
  menu, resizing and reordering were all bound to pointer events only, so a
  keyboard user who reached the header was stranded. With a heading focused:

  | Keys | |
  |---|---|
  | `←` `→` | Move between headings |
  | `Ctrl`+`←` `→` | First / last heading |
  | `Enter` or `Space` | Sort by the column, `Shift` to add to the sort |
  | `Alt`+`←` `→` | Resize the column, `Ctrl` for a coarse step |
  | `Shift`+`←` `→` | Move the column |
  | `Alt`+`↓` | Open the column menu |
  | `↓` or `Escape` | Return focus to the data |

  Resizing and moving announce what they did, and a resize that has reached the
  column's `min` or `max` says so rather than appearing to do nothing. The
  modifiers follow the convention already established elsewhere in the category,
  so the bindings are the ones most users will already have.

### Fixed

- **A rejected value is associated with the reason for it.** Editors set
  `aria-invalid`, which says a value was refused and not why, and the message
  was written only as a `title` — a tooltip, not a reliable accessible
  description. `aria-errormessage` now points at the text in every case, so a
  screen reader reads what is wrong rather than only that something is. Where an
  editor already displayed the fault, that element is referenced rather than a
  second one being built.

- **The grid's role follows its configuration.** The root role was read once,
  when the grid mounted. A grid given tree data afterwards went on describing
  itself as a flat `grid` while rendering a hierarchy, leaving its rows carrying
  `aria-expanded` and `aria-level` with no role for them to belong to. It is now
  re-read whenever the configuration changes.

- **A moved column reorders the headings, not only the data.** Moving a column
  reordered the leaf order the body is built from and left the retained column
  group tree, which the header is built from, exactly as it was. The headings
  were then repositioned individually, so the header *looked* correct while the
  document still held the old order.

  That gap is invisible on screen and decisive for a screen reader, which reads
  the document rather than the pixels: the heading order no longer matched the
  data beneath it. It also affected the order headings are reached in when
  moving between them by keyboard. Both descriptions of the order are now kept
  in step, on a plain grid and with grouped, generated and pinned columns
  present.

- **A moved column lands where it was dropped on a grouped grid.** The drop
  target was resolved to a position counted across the *visible* columns and
  then applied to the full column order, which are the same list only when
  nothing is grouped, hidden or generated. With a row-grouped column or a
  selection checkbox present, a dragged column landed one or more places away
  from where it was released, and further away the more columns were grouped.

## [1.4.0] — 2026-08-17

### Added

- **`grid.diff.swap()` shows the snapshot as the data.** A snapshot is held as
  plain objects and never enters the columnar store, which is why a removed row
  can be displayed but not sorted or filtered among the live ones. Swapping is
  the answer to that rather than teaching the pipeline to work across two data
  sets: the old rows become the real rows, with the whole pipeline behind them,
  and what was live becomes the comparison.

  ```js
  grid.diff.swap();        // now looking at yesterday, compared against today
  grid.diff.swapped;       // true
  grid.diff.swap();        // and back
  ```

  Both sets are already in memory, so this costs one ingest of each — real work
  on a large grid, and a deliberate action rather than something to put behind
  a toggle that fires per keystroke. **The comparison reverses**: what was an
  addition is now a removal. That is what looking at the change from the other
  end means, so `swapped` reports which way round the grid is and `diff:swapped`
  announces it.

- **`diff.removedRows` shows what was deleted.** An audit view that reports
  additions and edits and silently omits deletions is telling half the story,
  and a removed row still exists in the snapshot even though it is gone from
  the data. One option decides both questions it raises:

  ```js
  diff: { snapshot: yesterday, removedRows: 'pinned' }
  ```

  `'pinned'` shows it beneath the rows, struck through and dimmed, outside the
  row set — not counted by `rows.count()`, not exported, not selectable.
  `'data'` appends it to the set instead, so it is counted and exported.
  Omitted, nothing changes: it stays out, as it always has.

  Neither mode sorts or filters a removed row among the live ones — its values
  are the snapshot's, and ordering yesterday's numbers among today's would
  present two data sets as one. Neither lets it be edited, since there is
  nothing left to write to; a write aimed at one is refused rather than
  reported as applied.

- **`pivot.groupTotals` adds a total beside the pivoted columns.** Pivoting by
  Country turns one Sales column into one per country; this adds the column
  that was there before the pivot took it apart — sales across all of them.
  `'before'` places the group at the near edge, `'after'` at the far edge, and
  `totalsLabel` heads it. Omitted, a pivot has exactly the columns it always
  had.

  ```js
  pivot: { groupTotals: 'after' }
  ```

  The option was declared and documented in 1.4.0 and did nothing; it is now
  implemented. It reads the reduction the group row already carries rather than
  computing a second one, and its columns count towards `maxColumns`.

- **The status bar reports unresolved comments on hidden rows.**
  `comments.hiddenUnresolved()` has always been able to answer the question and
  had nowhere to say it, so the only sign of an outstanding thread was a marker
  on a cell — and a filter that hides the row hides the marker with it. A
  `comments` panel now carries the count:

  ```
  1,204 of 20,000 rows        3 unresolved comments on hidden rows
  ```

  It is in the default panel set and silent whenever the count is zero, so a
  grid with nothing outstanding is unchanged. It stays silent while the comment
  index is partial, matching the count itself, which reports zero rather than a
  total it cannot stand behind.

### Fixed

- **A pinned-end column no longer splits in two when the columns do not fill
  the grid.** Its header sat against the right edge of the viewport while its
  cells stopped just after the last centre column, so one pinned column appeared
  as two: a stranded strip of values, and a heading far to the right of them.
  The regions now share an edge at every width.

  A pinned region holds the viewport edge only while there is something to
  scroll. Where the columns do not fill the grid, nothing does, so the pinned
  columns sit directly after the centre ones and the spare width falls beyond
  them all — space at the end of the table rather than a band closed on both
  sides, which read as an empty column.

  It showed up wherever the columns are narrower than the grid — fixed widths,
  or a `flex` column that has reached its `max` — and grew worse as the window
  widened. Grids whose columns already fill the width were never affected and
  are unchanged.

- **`layout.minWidth` corrected to `layout.min` in the reference.** The option
  has always been `min`; the sizing example named a key the grid does not read,
  so a flex column copied from it had no minimum and said nothing about it.

- **An attribute selector no longer throws where `CSS` is absent.** Opening a
  comment thread read the `CSS` global through a guard that could not guard it:
  testing an undeclared name throws before the test is reached. Anywhere the
  global is missing, opening a thread raised a `ReferenceError` from the event
  handler. The check is now `typeof`-based, and the fallback escapes the row key
  rather than passing it through, so a key containing a quote resolves to its
  cell instead of a broken selector.

- **A column with no `type` now takes one from the data.** Type inference was
  built and reachable through the column model, and nothing in the grid ever
  called it, so an undeclared column resolved to `text` whatever it held. A
  column of numbers arrived left-aligned with a text filter and a text editor,
  and exported as text. Sampling now runs before the store is laid out, so the
  inferred type reaches storage as well as display:

  ```js
  columns: [{ field: 'quantity' }]   // number: right-aligned, numeric filter
  ```

  Only undeclared columns are touched — an explicit `type`, a `preset`,
  `columnDefaults` and a `lookup` all win, and `type: false` keeps sampling off.
  Inference runs once, when rows first arrive, so a grid built empty and filled
  after a fetch infers on that first load and a later load cannot re-type a
  column underneath a formatter configured around it.

  **Check columns you left undeclared.** A column that was text by accident and
  suited you that way now becomes what its data says; declare `type: 'text'`, or
  `type: false`, to keep it as it was. Sorting is unaffected either way: the
  default comparator is value-aware, so an undeclared numeric column already
  sorted 2.5 before 10.

- **`sampleSize` reaches inference.** The option was accepted and never passed
  on, so every grid sampled the default hundred values per column. A grid whose
  columns change character further down the data can now say so:

  ```js
  sampleSize: 500
  ```

- **A template binding that resolves to nothing says so.** A bare field name —
  `{{ amount }}` rather than `{{ data.amount }}` — compiled without complaint
  and rendered empty for every row. The compiler had always collected these and
  nothing reported them. It now names the binding and the column, and stays
  quiet for a real `cell.props` binding, which lands in the same set.

- **A rail action with a function title shows its text.** On a text rail the
  button was built with neither text nor icon — an empty box that still worked
  when pressed — because a function title was skipped when the label was
  written and only ever re-read into the tooltip.

- **`capture({ download: true })` saves without a file name.** It required a
  `fileName` as well, so asking for a download and not naming the file returned
  the blob and wrote nothing, which reads as the capture having failed. A name
  is generated when none is given, as the other exporters do.

- **The trial watermark honours `prefers-reduced-motion`.** Its move between
  corners is a timer rather than a CSS animation, so the stylesheet's media
  query could not reach it. It now stays in one corner for a reader who has
  asked for less movement.

- **`setSpotlight` says when nothing will happen.** The spotlight is only
  painted while a presentation is running, so arming one on a stopped grid
  changed nothing and reported nothing. It now says so, and points out that
  stepping to a view clears the spotlight — so a deck should be started before
  one is armed, not after.

- **`config.formulaFunctions` reaches the evaluator.** A registered
  `=VAT(price)` was refused exactly as an unknown name is, because neither the
  edit path's parameters nor the value pipeline's carried the registered
  functions through to the formula. The closed list still closes: registering
  one name does not open anything else.

- **A formula can be typed into a number column.** The number editor read its
  box as a number before the column's own parser saw it, so `=1+1` emptied the
  cell and `=quantity*2` silently stored `2`. Formula entry needed a text
  editor to be reachable at all. Text that starts as a formula now passes
  through untouched; anything else parses as a number exactly as before.

- **Naming an editor without enabling editing says so.** `edit: { editor:
  'text' }` leaves a column read-only — editing is opt-in and stays that way,
  since inferring it would make one line of `columnDefaults` turn every column
  editable — but the combination now warns instead of quietly doing nothing.

- **The formula helpers are in the bundles.** `evaluateFormula`,
  `parseFormula`, `referencesOf`, `looksLikeFormula`, `FormulaError` and
  `FUNCTIONS` were declared as top-level exports and absent from every build,
  because the package barrel the bundles are made from did not carry them.

- **Type declarations corrected.** `toolPanel.actions` declared four rail
  action names where nine ship, and the `RailAction` type for supplying your
  own was declared and never referenced — both are now in the signature.
  `grid.element` is documented as what it is: the element you passed to
  `createGrid`, not the grid's own `.lattice` root, which it builds inside —
  so `closest('.lattice')` never matches it and a theme attribute set on it
  does nothing. `toolPanel.panels` lists `formatting` alongside the other four.

- **Every kind of body row says what it is.** A group heading, a group footer
  and an inline grand total were all bare `lat-row` with identical cell
  classes, so none could be themed or told apart — the only discriminator was
  the shape of the row key. The pinned grand total was the one exception,
  reachable through the sticky container, which meant the same logical row was
  styleable pinned and unstyleable inline. Rows now carry `lat-row--group`,
  `lat-row--group-footer`, `lat-row--grand-total` and `lat-row--detail`, with a
  light default treatment you can override.

- **Pinned columns that leave no room say so.** Pinning more width than the
  grid has left the unpinned columns rendering at their minimum widths beneath
  the pinned regions — present in the DOM, invisible at every scroll position,
  and silent. The grid now names the widths involved and how many columns are
  affected.

- **Setting both `autoHeight` and a `rowHeight` function says which wins.**
  `autoHeight` did, silently, while every row still carried the height the
  function returned — so the function appeared to work while the geometry
  ignored it.

- **`autoHeight` measures rows again.** Two faults, and either alone was
  enough to make it do nothing. Cells were `white-space: nowrap` with an
  ellipsis, so text never wrapped and no row could ever want more than one
  line. And the measurement read the row's own rectangle — a height written
  from the height model moments earlier — so it returned the number it had just
  written, the batch was always empty, and no row was ever patched. Rows now
  wrap in auto mode, the content is measured from the cells, and the pass runs
  after the cells exist rather than before. Verified in a browser: wrapping rows
  resolve to 54px against 24px for single-line rows, tiling contiguously.

  `autoHeight` as "the grid takes the height of its rows rather than its
  container" was never affected and is unchanged.

- **A formula cannot read a column the permissions model withholds.** Typing
  `=salary` into another cell returned the value even where `salary` was
  `writeOnly` — documented as never shown, exported, copied or searched — or
  `hidden`. Formula entry was a read channel those levels did not cover, and it
  needed no developer tools to use. A reference to such a column is now refused
  and the formula reports it, rather than resolving to a blank and computing a
  plausible number from it.

  A column you have merely hidden from view is unaffected: hiding a column is
  not a permission, and formulas may still reference it.

- **A pinned row no longer hides the last row of data.** With
  `grandTotalRow: 'bottom'` — and now with `diff.removedRows: 'pinned'` — the
  strip is drawn over the body rather than beside it, and the body reserved no
  room for it. At full scroll the final row sat underneath: visible for a
  moment in an overscroll bounce, and unreachable otherwise, because there was
  nowhere further to scroll. The body now stops short by exactly the strip's
  height.

- **`diff.strictNull` gives one answer.** With it set, the row-level and
  cell-level questions could disagree about the same cell: `statusOf` and
  `changedColumns` said changed while `cellStatus` and `isChanged` said
  unchanged, in three of the eight ways a value can move between `null`,
  `undefined` and an absent field. The row comparison read the data as you
  supplied it on both sides; the cell comparison read your snapshot against a
  value fetched through the store, which normalises an absent value to `null` —
  so the distinction the option exists to make survived on one side only. Both
  now read the same way, computed columns included. Grids without `strictNull`
  were never affected, since both spellings of absence are equal there by
  definition.

- **The grid announces what it does.** It carried no live region, so a screen
  reader was told nothing when the grid sorted, filtered or changed its
  selection — the three changes a sighted user sees immediately.
  `aria-sort` and `aria-rowcount` describe the grid to someone who goes looking
  and say nothing at the moment it changes. A polite live region now announces
  "Sorted by Amount descending", "Filtered to 3 rows of 12 rows",
  "2 rows selected" and their cleared counterparts. Repeating an identical
  message is suppressed, since a reader hearing the same count twice has been
  told it changed.

- **`columnMenu: false` removes the menu button.** The menu itself was
  correctly suppressed, but each heading still drew the button that opens it,
  so every column kept a control that did nothing when pressed.

- **A live feed no longer slows down as the grid grows.** Applying an update
  scanned the whole row array to find the row it named — twice, when the row
  arrived as a patch object rather than the stored one, which is what a feed
  sends. The cost of one update therefore rose with the size of the grid: 1.1ms
  on a hundred thousand rows, 4.7ms on four hundred thousand. It is now a key
  lookup and flat at about 0.01ms whatever the grid holds.

  Queuing had a second, compounding fault: each queued message rebuilt the
  entire pending batch, so a window holding nineteen thousand rows made every
  further message a nineteen-thousand-row copy and the window as a whole cost
  time proportional to its size squared. Messages now fold into the batch in
  place.

  Measured on a hundred-thousand-row grid, forty thousand single-row updates:
  49 seconds before, 0.18 seconds after — from roughly 800 rows a second to
  around 230,000. Nothing about the API changed.

- **Tree parents show their totals.** A totalled column rolled up under
  grouping but not under `tree`, so a parent row and a synthesised level both
  showed nothing where the reference says the total covers the tree node. Both
  now aggregate over their descendants.

- **Type-specific format options are reachable.** Two of the three documented
  ways to give a type its options — `typeOptions`, and a bag named after the
  type — were dropped when the column was resolved, and a plain `format` object
  on a self-formatting type was compiled as a *number* format. So
  `{ maxUnits: 3 }` on a duration printed `90,061,500`, and
  `{ style: 'clock' }` threw out of `Intl.NumberFormat` while the grid was
  still being constructed. All three spellings now reach the type, and a
  genuine number format still compiles as one.

- **`totalFilteredOnly` can be changed after construction.** It was not part of
  the total stage's memo key, so switching it left the previous reduction in
  place — the setting changed and the number did not, and nothing short of a
  change that moved the grouping would dislodge it. The same applied to
  `totalOnlyChangedColumns`.

- **A paste with no extent lands at its own size.** The target was everything
  below and to the right of the anchor, and the tiling rule then filled it — a
  two-row block pasted into a 20,000-row grid was written 10,000 times, as a
  single undo entry. Passing an explicit `extent` still fills that range, which
  is what a selection means.

- **`highlightOnChange` flashes changes that arrive as data.** It followed
  `cell:changed`, which only an edit emits, so a value replaced through
  `rows.apply({ update })` — a live feed, the case the option exists for —
  never flashed. A cell whose value has not actually moved still does not
  flash.

- **A refused validation no longer misdirects the next write.** When a value
  failed validation the edit session stayed open, correctly, so it could be
  corrected where it was typed — but the next `setCells` borrowed it: the write
  landed on the *refused* cell instead of the one it named, and was reported as
  applied. It is now refused, returning `0` like any other write that cannot
  land, until the session is closed with `edit.stop(true)`.

- **A paste anchored on a non-editable column is refused.** The anchor was
  checked against column permissions but not against `edit`, so a column
  declared `edit: false` still accepted one. The payload was then laid out from
  a cell that could not be written: the first value was dropped and the rest
  landed one column to the left of where they were aimed.

- **`columns.autoSize()` measures content.** It read back the width the column
  already had, so every call grew each column by a fixed 24px and a
  two-character value ended up as wide as a seventy-character one. Columns now
  fit their contents and can shrink; calling it twice changes nothing the
  second time.

- **A group footer is distinguishable from its group.** The footer row carried
  no class of its own, so it was identical to the heading in the DOM and could
  not be styled or targeted, and it displayed a row count of `(0)`. It now
  carries `lat-row--group-footer`, is marked `footer: true` on the row, and
  leaves the count to the heading.

- **Compute kernels load in the shipped build.** In `dist` the worker never
  started: its bootstrap fetched a `kernel.js` that is not part of the package,
  and a dynamic import inside the bundle resolved against the bundle's own
  location rather than the module beside it. Together they meant the kernels
  failed to load in every released build, so anything crossing
  `workerThreshold` fell back to the main thread or produced nothing —
  a header histogram above the threshold rendered no chart at all and logged
  "compute kernels could not be loaded". The worker source now travels inside
  the bundle, so the package is self-contained with no file to serve alongside
  it. Running from source was unaffected, which is why it went unnoticed.

  This adds roughly 58KB gzipped to the bundle, which is the compiled kernel
  that should always have been in it.

- **A duplicate column id keeps the first column, not a mangled pair.** Two
  columns resolving to the same id — easily done, since an id defaults to the
  field — overwrote the first definition while still taking a second slot in
  the order. The result was that the *first* column's settings were lost and
  the survivor appeared twice in `columns.all()` and `columns.visible()`, while
  the only warning said the second had been ignored. The first now wins, the
  second is refused, and the warning says which column and why.

- **`grid.destroy()` releases presence.** The provider subscription, its
  throttle timer and the peer map outlived the grid, so a destroyed grid went
  on receiving peer updates and never announced that its own user had left.

- **A fetched page repaints when it lands.** With a paged or remote source, the
  exact row total arriving changed the grid's height but triggered no repaint —
  the scrollbar kept its estimate and the new rows stayed unpainted until the
  next frame from somewhere else, usually the user's next scroll.

- **An `object` column shows its value.** Cells rendered `[object Object]`
  unless the column supplied `value.format`. They now show the same JSON form
  the clipboard already produced, so what you see and what you copy agree.

- **An unsupported date pattern token says so.** Tokens the pattern compiler
  does not implement — `zzz` for the zone, `QQ` for the quarter — were emitted
  as literal text, so the letters appeared in the cell. The compiler now names
  the token once and lists the supported set. Quote it to keep it as a literal.

### Changed

- **`grandTotalRow` accepts `true` in the type declarations.** The runtime has
  always honoured it as an inline total row and the reference documented it;
  only the declaration disagreed, and it excluded the value outright. The
  stream source's `maxRows` was likewise declared as a property of the `open()`
  request rather than of the source configuration, which is where it is read.

- **The default density is documented as `compact`.** The reference said
  `standard`; the grid has always started at `compact` (23.8px rows). No
  behaviour has changed.

- **A cell menu offers a writing action only where it can write.** Paste, Clear,
  Fill down and Edit cell were enabled whenever *any* visible column accepted
  edits, so on a grid with one editable column among several they were offered
  over read-only cells and then did nothing. Each is now resolved against the
  column the menu opened on — or, for the range actions, the columns the range
  covers. Copying is unaffected: reading is not writing.

- **Tree headings count their rows.** A level named by a row's path but with no
  row of its own reported `(0)` however many rows sat beneath it.

- **Tree rows caught in a parent cycle go to the orphans bucket.** With
  `orphans` naming a heading, rows with a missing parent were placed under it
  and rows in a cycle were scattered among the real roots instead.

- **A lazily loaded branch always reports how it finished.** Collapsing a branch
  before its rows arrived aborted the fetch silently: `tree:loading` was
  emitted and nothing followed it, so anything tracking in-flight branches kept
  a spinner turning for a fetch that had been abandoned. It now emits
  `tree:loadAborted`.

- **`column.header` draws the heading.** A column could declare a header
  renderer, props and classes; all of it was accepted and only `align` was ever
  read, so every column produced the stock heading. `header.render` now takes a
  function, a component, or a name registered in `config.components`, with
  `header.props` passed through and `header.class` applied to the header cell.

- **`quickFilterText` and `quickMode` work from configuration.** Both were
  accepted and read by nothing, so a grid built with a quick filter showed
  every row. `quickMode` also travels in saved state now: a view saved while
  searching in `words`, `fuzzy` or `regex` came back as `contains` and matched
  a different set of rows than the one it was saved showing.

- **Date filters match again.** A condition on a date column carrying an ISO
  instant — `2026-01-15T09:30:00Z` — returned no rows. The column stores the
  wall-clock day as `YYYY-MM-DD` while the condition was converted to epoch
  milliseconds, so the two sides were never comparable. Both are now brought to
  the same form, and a filter value may be an ISO instant, a plain
  `YYYY-MM-DD`, a `Date` or an epoch number. Where a condition does not declare
  a type, the column's is used.

- **Relative date filters work against in-memory data.** `op: 'relative'` —
  `last7Days`, `thisMonth`, `yearToDate` and the rest — was rewritten into an
  absolute range only on the way to a server. Against a memory source the
  operator reached the evaluator unrecognised and **passed every row**, so the
  filter appeared to apply and changed nothing. It now resolves the same way in
  both places, per pass, so "today" still means today after midnight.

- **`config.totalFns` is consulted.** Custom total functions registered by name
  were accepted and then ignored: the reducer knew only its built-ins, so a
  column totalled with a registered name showed no total and the console
  advised registering it in `config.totalFns` — which is where it already was.
  Passing a function inline always worked and is unchanged.

- **Clicking a row selects it.** Row selection was reachable from the keyboard
  and from the checkbox column, but a mouse click only announced
  `row:clicked` — nothing selected. Two faults met here: the click handler
  never asked for a selection, and the keyboard path that did asked for a
  method the selection model does not have, so it was silently discarded.
  Clicking now selects, <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> adds and removes, and
  <kbd>Shift</kbd> extends from the anchor. A click on a link, button, input or
  expander inside a cell still belongs to that control, and the checkbox and
  detail columns keep their own behaviour.

- **`export({ rows: 'all' })` now reaches past the filters.** `'all'` and
  `'visible'` produced identical output, so a caller exporting everything
  silently got only the rows the filters had left. `'all'` now covers every
  loaded row in the source; `'visible'` is unchanged.

- **`export.print()` honours `unpin` and its row ceiling.** Neither worked from
  the grid: the ceiling compared against a row count it could not read, so a
  print of any size was allowed through, and the unpin step looked for the
  column API in a place the grid does not put it, so pinned columns stayed
  pinned and were clipped at the page edge.

- **Type declarations corrected.** `HistoryEntry` described a `kind` field that
  no entry has ever carried, and omitted the six that every entry does —
  `seq`, `type`, `label`, `target`, `at` and `delegated`. `toolPanel.panels`
  listed four built-in panels; there are five, the fifth being `formatting`.
  `EditorName` named seven of the twenty-two editors that ship, and the
  twenty-four built-in cell renderers had no declared names at all — both are
  now full unions that still accept your own registered names.

- **`WARNING_IDS.NO_ROW_KEY` matches the warning it names.** The constant held
  an id nothing emits, so filtering diagnostics on it matched nothing. The
  source layer's separate warning is now named too, as
  `WARNING_IDS.SOURCE_NO_ROW_KEY`.

- **`grid.diff.isChanged(key)` answers the row-level question.** The column
  argument is optional and omitting it asks whether the row changed, but the
  call was routed to the per-cell comparison regardless — which resolved no
  column and returned `false` for every row, including rows `statusOf()`
  reported as `changed`. Calls passing a column id were correct throughout.

- **Diff marks survive the first paint.** Row and cell diff classes were
  written before the cell layer filled the rows, and filling a row rewrites its
  classes — so the marks were erased a moment after being applied and an audit
  grid showed no highlighting at all. They are now written after each render
  completes, as the other overlays already were.

- **`allowUnsafeTemplates` no longer permits script.** The flag turns off HTML
  escaping so a template can render markup, and the value interpolated into a
  `{{{ }}}` segment reached `innerHTML` untouched — so a row value containing
  `<img src=x onerror=…>` executed, and a `javascript:` URL in a value survived
  into the rendered link. The compiler's existing refusals covered dangerous
  tags and URL schemes written in the *template*, which you author and can
  audit, and not the value, which usually arrives from your data.

  Interpolated values now go through the same rules: executable tags
  (`<script>`, `<iframe>`, `<style>` and the rest), `on*` handler attributes,
  and `javascript:`/`data:` URLs are removed, including entity-encoded
  spellings. Presentational markup — emphasis, links, spans — is unaffected, as
  is any value with no markup in it. A string returned from `cell.render` is
  the same gate and gets the same treatment.

  Grids that do not set `allowUnsafeTemplates` were never exposed and are
  unchanged. This is a narrow allowance rather than a general sanitiser: to
  render arbitrary third-party HTML, sanitise it yourself and return an element
  from `cell.render`.

- **<kbd>Esc</kbd> now ends a presentation instead of only leaving full
  screen.** A presentation runs full screen with its chrome hidden, and Escape
  exited full screen while leaving the presentation running — so the grid
  returned to the page still enlarged, still dimmed by any spotlight, with the
  tool panel that carries the stop control still hidden and no way to turn it
  off from inside the grid. An open editor or menu still answers the key first.
  A grid configured with `maximise: false` now binds Escape directly.

- **`grid.presentation.reset()` now exists.** The documented method — and the
  `R` key it is bound to, which puts the current view back as it was saved —
  was absent from the model, so pressing `R` during a presentation raised a
  `TypeError`.

- **Presentation no longer leaves an empty bar across the bottom.** The status
  bar and the pager share one strip. Hiding both left the strip itself in
  place, so a presentation with no chrome still showed a blank band. The strip
  now goes when everything in it has gone, and stays when
  `chrome: ['statusBar']` or `chrome: ['pagination']` asks for it.

- **Annotations now land under the pointer on high-DPI displays.** The drawing
  layer was sized in device pixels without a CSS size, and a canvas is a
  replaced element — so it laid out at its backing-store size rather than
  filling the grid. At a device pixel ratio of 2 a mark made 100px down painted
  200px down, and the lower-right of the grid could not be drawn on at all.
  Displays at ratio 1 were unaffected, which is why it showed on laptops and
  not on external monitors.

- **`presentation:captured` reports the image's dimensions.** The payload's
  `width` carried the file's size in bytes — a 1800×600 capture reported
  `width: 41030`. It now carries `width` and `height` in pixels (after
  `scale`), with the byte count as `bytes`. The image's format moved from
  `type` to `mimeType`, because the event bus writes the event name onto
  `type`, so the format never reached subscribers.

- **`rows.apply({ update })` no longer replaces the whole row.** An update is a
  patch: fields absent from it are left alone. Previously the patch was
  assigned over the row, so a delta destroyed every field it did not mention —
  and the loss was written through to the columnar store, so the cells read
  null rather than merely the row object being wrong.

  ```js
  // before: b and c were lost, in the row and in the store
  grid.rows.apply({ update: [{ id: 'R1', a: 'A1' }] });
  ```

  Coalescing had the same fault: two partial updates to different fields inside
  one window kept only the last, so a feed sending `{price}` and `{volume}` as
  separate messages lost whichever arrived first.

  The same fault also defeated the optimisation it should most help. Changed
  columns were computed against the raw patch, so a field the patch omitted
  looked like it had become undefined — marking columns dirty that had not
  changed and re-running the sort and filter stages that selective invalidation
  exists to skip.

  Callers passing whole rows are unaffected.

- **Editing a row hidden by a filter no longer moves the totals.** With a
  filter active, an update to a row outside it changed the grand total by the
  difference, even though that row contributes nothing to a total over the
  filtered set — and since the row is not on screen, nothing about the grid
  explained the change. Totals over the filtered set now ignore rows the filter
  removed, and `totalFilteredOnly: false` counts them deliberately.

- **An open editor now commits when you click away.** `commit()` was reachable
  only from the Enter and Tab key paths, so starting an edit and clicking
  another cell left the editor open on the first while the selection moved to
  the second — two cells looking active at once, and a value that was never
  written. Clicking outside an editor commits it, as Enter does. Clicking
  inside it — including a popup editor's calendar or dropdown, which renders in
  the overlay layer rather than in the cell — leaves it open.

- **The generated control columns no longer offer a cell context menu.** The
  selection checkbox and detail expander columns hold controls, not data —
  right-clicking one offered copy, filter and edit actions with no value,
  column or cell to apply them to.

- **A nested detail grid keeps its own pointer and key events.** A detail
  region hosts a whole grid inside one of the outer grid's row elements, and
  both grids delegate their listeners from their own root — so clicks,
  right-clicks and keystrokes inside a detail reached the outer grid as well. A
  right-click on a nested cell opened two context menus; a double-click walked
  up to the *inner* row's key and started an edit on whichever outer row shared
  it, which two grids over the same id scheme routinely do; and arrow keys
  moved a focus ring in the outer grid while the user typed in the inner one.

### Added

- **Incremental grand totals.** On a memory source the grand total row is now
  maintained across cell updates instead of re-reduced. A single-cell update on
  a million rows with four totalled columns went from 9.3ms to 0.16ms — the
  same cost as having no totals row at all.

  ```js
  { field: 'amount', type: 'number', total: 'sum' }   // nothing to configure
  ```

  `sum`, `avg`, `countValues`, `min` and `max` on numeric columns are
  maintained by difference. The reported number is unchanged: where a running
  value cannot be trusted the column falls back to a full pass rather than
  reporting a value it is unsure of. That happens when a value moves off the
  current `min` or `max`, when rows are added or removed, when the filter, sort
  or grouping changes, and when a total grows past the magnitude at which a
  64-bit float stops registering small changes. Running sums are compensated,
  so a long editing session does not accumulate error.

  A custom `total` function is re-reduced on every change, as before — a
  reduction supplied as a function has no inverse. Group totals are also
  re-reduced; only the grand total is incremental.

  Placing the grand total inline (`grandTotalRow: true`) no longer rebuilds the
  display array on every change, which is where the remaining cost sat for
  large grids using the default placement.

- **Two more themes, and `theme` now does something.** `high-contrast` and
  `terminal` join light and dark.

  ```js
  createGrid(el, { theme: 'high-contrast' });
  grid.set('theme', 'terminal');
  grid.set('theme', null);   // back to following the viewer
  ```

  **`config.theme` never reached the DOM.** The token sets hang off
  `.lattice[data-theme]` and nothing wrote the attribute, so `theme: 'dark'`
  styled nothing — a grid only went dark when the viewer's
  `prefers-color-scheme` happened to say so, and a page that set the attribute
  on `<html>` instead was not selecting the grid at all.

  `high-contrast` is not dark with more contrast. Text is 21:1 and borders
  6.1:1 against the background, where the other themes sit near 1.3:1 on
  borders — WCAG 1.4.11 asks 3:1 for the boundaries a user has to find. Cell
  borders are drawn rather than implied, selected rows carry an outline as well
  as a fill, and every status pill has a solid border so it does not depend on
  hue alone. `terminal` is a phosphor console: one hue on near-black,
  monospaced, with status carried by brightness rather than colour.

  The variant-contrast test now covers all four themes, holding high contrast
  to AAA where the others are held to AA.

- **Tree data.** Rows form a hierarchy, by parent reference or by path. The row
  model implemented this and nothing ever loaded it — the memory source builds
  the display array itself, so a configured `tree` returned a flat list.

  ```js
  tree: { parentKey: 'parentId', label: 'name' }   // the row names its parent
  tree: { path: (row) => row.hierarchy }           // the row carries its ancestry
  ```

  Parent-reference is what a join or a document store produces; every node is a
  real row. A row whose parent is missing is an orphan — it goes to the root,
  or into a bucket named by `orphans`, and is never dropped. Path-based rows
  describe their own place, so levels no row occupies are synthesised and
  render as group rows; a real row arriving later for a synthesised level fills
  it rather than appearing beside it. A parent cycle is reported once and cut,
  with the rows shown at the root.

  Branches can load on demand. `tree.hasChildren` lets a row declare children
  it does not hold, so the expander exists before anything is fetched, and
  `tree.loadChildren(row, signal)` supplies them when it is opened:

  ```js
  tree: {
    parentKey: 'parentId',
    hasChildren: (data) => data.childCount > 0,
    loadChildren: (row, signal) => api.children(row.data.id, { signal }),
  }
  ```

  Such a node reads as closed until its rows arrive, because an open branch
  with nothing under it leaves no gesture to load it. The rows are added to the
  data set, so they sort, filter and export like any other. A branch is fetched
  once however often it is toggled; closing it before the rows arrive aborts
  the request; a rejection is reported and leaves the branch retryable rather
  than permanently empty. `tree:loading`, `tree:loaded` and `tree:loadFailed`
  are on the event bus.

  The grid generates a tree column for the expander and indent, on the same
  terms as the auto-group, selection and detail columns. Its text comes from
  `tree.label`, falling back to your first visible column. Expansion is the
  same state group expansion uses, so `rows.expand`, `collapseAll` and saved
  views all work on it, and a collapsed branch is skipped rather than hidden.
  Grouping and `tree` together is not a combination: the grouping wins and says
  so once.

- **Master-detail.** A master row expands into a detail region — by default a
  nested grid over whatever `detail.rows(row)` returns. The row model
  implemented this and nothing constructed it with a detail factory, so the
  `detail` config block was read nowhere and no row could ever expand.

  ```js
  detail: {
    rows: (row) => api.lines(row.data.id),   // array or promise
    config: { columns: [{ field: 'port' }, { field: 'vlan' }] },
    isMaster: (data) => data.lineCount > 0,  // default: every data row
    height: 240,
    cacheLimit: 10,
  }

  grid.detail.toggle(key);
  ```

  The grid generates an expander column while the feature is on, on the same
  terms as the auto-group and selection columns: pinned to the start, and out
  of `columns.visible()`, saved views, exports and the tool panel. The detail
  is a real display row — virtualised, height-managed, pushing the rows below
  it down — and any number of masters can be open at once.

  Regions are cached by row key so collapse and re-expand does not refetch.
  `cacheLimit` bounds what is retained *after* closing, not how many may be
  open at once; an open region is never evicted. `cacheLimit: 0` destroys on
  collapse.

- **An editable detail reports its edits on the master.** The detail is a whole
  grid, so `detail.config.edit` makes its cells editable — but that grid is
  created by the grid, not by you, so its events were out of reach.

  ```js
  grid.on('detail:cell:changed', (e) => {
    e.masterKey;   // 'C1'  — the row the detail belongs to
    e.path;        // 'ports.1.vlan' — where it lands on the master's record
    e.value;
  });
  ```

  `detail:edit:started`, `detail:edit:stopped` and `detail:cell:changed` are
  re-emitted on the master, tagged with the master they came from. `path` is
  the dot notation from the master's record to the value that changed, worked
  out by identity — `rows(row)` usually returns an array already on the record,
  and that property is the prefix. A detail fetched from a server is not part
  of the master's record and reports `path: null`; set `detail.path` to name
  one anyway. `detail.onCreate(grid, masterRow)` hands over the nested grid
  itself for anything else.

- **`detail.target` — a detail pane instead of a detail row.** New. Point it at
  an element and the detail renders there rather than into the grid.

  ```js
  detail: { target: '#detail-pane', rows: (row) => api.lines(row.data.id) }
  ```

  This is the list-and-pane layout: no detail row is created, so the grid's row
  count does not change when a master opens and nothing about the list's
  geometry moves. **Exactly one master is open at a time** — one element cannot
  show two details, and stacking them turns a fixed-height pane into a
  scrolling list of grids with no rule for how tall each should be. Expanding a
  second master closes the first. `grid.detail.active()` names the open one.

  A `target` selector matching no element is reported once rather than failing
  silently.

  The expander reflects the placement. Inline it is a chevron that turns down
  when the row expands, with `aria-expanded` — the ordinary disclosure. With a
  target nothing expands, so it becomes the "opens elsewhere" glyph and a
  toggle (`aria-pressed`); a chevron there would promise an expansion that
  never comes. The chosen row carries `lat-row--detail-active` and
  `aria-current`, because with the detail off to the side nothing else in the
  grid says which record the pane belongs to.

- **`selection.checkbox` and `selection.headerCheckbox` now render.** Both were
  documented, and the second was already switched on in the demo, but no
  checkbox column was ever generated — setting either did nothing.

  ```js
  selection: { mode: 'multiple', checkbox: true, headerCheckbox: true }
  ```

  `checkbox: true` adds a narrow pinned column of row checkboxes.
  `headerCheckbox: true` puts a tri-state select-all in its heading: unchecked,
  checked, or the native indeterminate mark when some rows are selected.
  Clicking it selects every row the filter currently shows, or clears when
  everything already is — including from the indeterminate state, where the
  intent is "select the rest". `grid.selection.headerState()` returns the same
  tri-state, for building your own control.

  The column is generated, not declared: it stays out of `columns.visible()`,
  saved views, exports and the tool panel's visibility list, and disappears
  when the option is turned off.

- **Selection now reaches the rows.** `Row.selected` was written by a pass over
  the display array, and any row rebuilt afterwards — by scrolling, by cache
  eviction, by any repaint outside that window — came back unselected. The keys
  were correct in the model and nothing on screen ever showed it: no row
  highlight, and `aria-selected="false"` reported to screen readers on every
  row however many were selected. Selected rows now carry `aria-selected` and
  the class `lat-row--selected`, which the theme has styled all along.

- **`grid.selection.all()` no longer throws.** It called a method the selection
  model does not have. Every call raised a `TypeError`.

- **`workerUrl` and `sharedMemory` now reach the worker.** Both were
  documented and read inside the worker package, but the grid built its worker
  host without them, so neither had any effect.

  ```js
  workerUrl: '/assets/lattice.worker.js',   // for a CSP that forbids blob:
  sharedMemory: true,                       // where the page is cross-origin isolated
  ```

  `workerUrl` matters most: under a Content-Security-Policy that forbids
  `blob:` workers, it is the only way a worker can be constructed at all, and
  without it compute stayed on the main thread with no way to change that.
  `sharedMemory` is off by default — it avoids re-copying a column on every
  message, at the cost of retaining a shared copy of each column that crosses.
  Both are settled when the worker is constructed, so changing either discards
  the running worker and the next offload builds a new one.

- **`workerThreshold` below 50,000 now takes effect.** The grid passed the
  value to the worker host under the wrong name, so the host kept its own
  50,000 default. A grid configured to offload above, say, 10,000 rows let the
  call past its own gate and the host handed it straight back to the main
  thread. Values above 50,000 were unaffected.

- **Distributions actually cross the worker boundary.** The facet call carried
  the column's resolved data type, which holds functions — `parse`, `compare`,
  `matches` — and a function anywhere in the arguments makes a call
  unstructured-cloneable. The one kernel wired to a worker therefore spawned
  one and then ran everything on the main thread. Only the type's `base` is
  needed, and only that is sent now.

  `grid.diagnostics.renders().worker` reports the threshold the host is
  actually using, rather than the configured one, along with the
  `sharedMemory` and `workerUrl` it was built with.

- **`showTotalInHeader`.** Under grouping or pivot, a totalled column's heading
  now names its reduction — a small `SUM` line above `Capacity`, `AVERAGE`
  above `Margin`. The heading returns to the column's own title when grouping
  and pivot are both off. On by default; set `showTotalInHeader: false` to
  leave headings alone.

  The reduction sits on its own line rather than reading `Sum of Capacity`
  across one, because a header cell reserves width for its sort, filter and
  menu buttons whether or not they are showing — on a default column the label
  gets 54px of 129px, and a one-line version truncated to `Sum o…`, trading the
  column's identity for its reduction. Stacked, it costs no width at all: no
  heading truncates that did not already.

  Such a heading carries `data-total` on its header cell, naming the reduction,
  and the two lines are `.lat-header-total-fn` and `.lat-header-total-name`, so
  a theme can style them; `--lattice-header-total-size` and
  `--lattice-header-total-color` set the reduction line's size and colour. The
  full phrase is on the label's `title` for the pointer. Where a pivot has a
  single value column, its leaf is titled with the pivot value rather than the
  column's name, and that heading is left alone.

  The option was previously in the defaults but read nowhere, and no heading
  ever named its reduction.

  The tool panel's aggregation picker now takes its names from the same table
  the headings use, and gained `Count of values` — the reduction that counts
  present values rather than rows — which it had been missing.

- **`totalFilteredOnly: false`.** Totals now reduce the whole dataset when the
  option is off, instead of always reducing the filtered set.

  ```js
  totalFilteredOnly: false   // the filter is a lens; totals report everything
  ```

  Both the grand total and each group total follow the setting, so a group row
  shows the total for every row belonging to that group rather than only the
  visible ones — including groups the filter emptied entirely, which have no
  row of their own but still count toward the totals above them. The count on
  the grand total row follows the total, so it never reports fewer rows than
  the total covers.

  The unfiltered row set and its grouping are computed once and reused, so the
  cost lands on adds and removes rather than on every edit or filter change. On
  500,000 rows grouped and half-filtered, a single-cell update measured 2.1ms
  with the default and 3.2ms with the option off.

  The option was previously in the defaults but read nowhere, so setting it to
  `false` had no effect.

- **`totalOnlyChangedColumns`.** Reduce only the totalled columns an update
  actually changed, instead of every totalled column on every change. An update
  that rewrites a field with the value it already held reduces nothing.

  ```js
  totalOnlyChangedColumns: true
  ```

  On a million rows in seven groups with four totalled columns, a single-cell
  update went from 15.4ms to 7.3ms when it changed one of them, and from 15.6ms
  to 7.3ms when it changed none. There is nothing to gain when an update
  changes every totalled column — the saving is proportional to the columns it
  leaves alone.

  Off by default, because it asserts that each total depends on nothing but its
  own column. That holds for every built-in reduction. A `total` supplied as a
  function also receives the row, the grid and `config.context`, and is only
  recomputed when its own column changes — so a function reading state outside
  its column reports the value from the last time that column moved. Adding or
  removing rows, filtering, sorting, grouping, and changing which columns are
  totalled all reduce everything again regardless of the option.

  The option was previously documented and declared in the type definitions but
  had no effect.

- **Collaborative presence.** See who else is on the grid and what they are
  doing: cursor, selection, active edit, an optional advisory lock, and a peer
  roster you can click to jump to someone.

  ```js
  presence: {
    provider,                        // your transport: subscribe + publish
    me: { id: 'u_17', name: 'Tony' },
    lock: true                       // advisory — see below
  }
  ```

  The grid never opens a connection. You supply the transport and the identity;
  a WebSocket, MQTT, a CRDT library or a polling endpoint all satisfy the
  interface, and without a provider the feature is inert.

  **Presence carries intent, never values.** A peer's committed edit must reach
  the grid as data, through whatever channel you already use. Presence is
  throttled and lossy by design, so a value carried on it is a value that can be
  dropped.

  Positions travel as row key plus field, never index, so peers who sort and
  filter differently still see each other on the right records. A peer whose row
  is not in your view is held, counted, and shown in the roster as "not in
  view" — not dropped, which would read as a disconnection.

  Idle and removal are inferred from local receipt time rather than the
  timestamp in the message, because clocks between clients disagree. Publishing
  is throttled rather than debounced, and stops while the tab is hidden.

  A peer's cursor is drawn dashed against your own solid focus ring, so the two
  can never be confused; their name shows briefly when they move, then fades to
  the bare border. Nothing is inserted into the grid, so presence cannot shift
  layout, cover an in-cell chart, or intercept a click.

  **Locking is advisory.** It reduces collisions and does not eliminate them:
  two clients can enter an edit in the same instant. The authoritative
  resolution is the conditional write in `edit.commit`, which returns a conflict
  and rolls back. A refused edit announces who holds the cell, because one that
  silently will not open is indistinguishable from a broken grid.

  `grid.edit.start()` now returns whether a session began, which it was
  previously discarding.


- **Flush strategies, a queue ceiling and a frame budget.** Queued changes now
  flush on a frame by default rather than a 50ms timer, which is what makes one
  repaint per batch reliable — a timer can fire twice between two paints.

  ```js
  updates: {
    flush: 'frame',      // or 'microtask', 'interval', 'manual'
    maxQueued: 20000,    // force an early flush, whatever the strategy
    budgetMs: 10,        // defer the rest of a long flush to the next frame
  }
  ```

  A frame and a timer are armed together and the first wins. In a foreground
  tab the frame always wins; in a backgrounded tab, where the browser stops
  firing animation frames entirely, the timer keeps the feed applying rather
  than the grid stalling with every queued promise unresolved.

  Over budget, a flush returns the remainder to the queue and it lands next
  frame. The promise a caller holds resolves when their rows land, not when the
  first slice does. `updates.stats()` gains `strategy`, `deferrals`, `maxQueued`
  and `budgetMs`.

- **Per-row rejection reporting.** `apply()` and `queue()` results carry a
  `rejected` list of `{ operation, id, reason }`. A batch of a thousand rows
  containing three bad ones applies the other 997 and names the three.
  `unknown-id` covers an update or remove for a row that is not there;
  `duplicate-id` refuses a second row under an existing key, which would
  otherwise corrupt selection, expansion, comments and the key index at once.
  Rejections are reported, never thrown.


- **Diagnostics, and a devtools panel.** `grid.diagnostics` reports what the
  grid is doing: render counts and their causes, memory layout, operation and
  provider timing, listener counts, effective configuration, and a list of
  conditions that look like mistakes.

  ```js
  const before = grid.diagnostics.renders().dom.cellWrites;
  await doTheThing();
  expect(grid.diagnostics.renders().dom.cellWrites - before).toBeLessThan(200);
  ```

  The API is the interface and the panel consumes it, so the figures above can
  be asserted in your own tests rather than only looked at.

  `grid.diagnostics.bundle()` produces a support bundle — configuration, query
  state, timing, warnings, provider statistics, version and environment. It
  contains **no row data, cell values or column values**, so it can be attached
  to a ticket without being read first.

  Warnings each carry a stable id, a plain description and the values involved:
  duplicate row keys, a filter naming a column that does not exist, an options
  object changing identity without changing content, listener counts growing
  without bound, a large operation running on the main thread, and a slow
  provider. All of them produce no error on their own, which is why they are
  worth detecting.

  The panel is an optional module that imports nothing — the grid is handed to
  it — so it is 7KB and deployments that never load it pay nothing.

  ```js
  import { createDevtools } from 'lattice-grid/modules/devtools';
  createDevtools({ grid });          // Ctrl+Shift+D collapses it
  ```

  Nine tabs, a compact vitals strip, and a render heat overlay that tints cells
  as they are written: blue for a new value, red for a cell rewritten with the
  value it already had. The second is the one worth chasing.

  The Accessibility tab runs live checks against the rendered grid — ARIA roles
  and counts, cells with no accessible name, and WCAG AA contrast against the
  active theme. It checks what was drawn rather than what was configured,
  because a custom cell renderer can pass every configuration check and still
  leave a cell unnamed.

  The panel observes and never mutates, and nothing leaves the browser.


- **Cell comments.** Threaded discussion attached to individual cells, for
  reviewing data with other people without leaving the grid. A commented cell
  carries a small triangle in its upper-right corner; clicking the corner opens
  the thread.

  ```js
  comments: {
    provider,                          // without one the feature is inert
    rowLabel: (row) => row.data.name   // so the panel says what is being discussed
  }
  ```

  The grid owns presentation and interaction only. Storage, identity and
  permissions stay yours, reached through an asynchronous provider — load the
  index, load a thread, add, edit, delete, resolve. Rejections roll back an
  optimistic write rather than leaving the grid showing something your server
  refused.

  **A stable `rowKey` is required**, and comments are disabled without one
  rather than falling back to row index. They are keyed on row identity plus
  field and outlive the values they annotate, so index identity would reattach
  every thread on the next sort. The requirement is stricter than it first
  looks: identity must be stable across sessions and across data reloads, not
  only within one session.

  The grid authorises nothing. A comment may carry `can: { edit, delete,
  resolve }` and the affordances follow it, but hiding a button is a
  convenience for the reader and never a control — your provider rejects what
  it must. Author names and avatars are rendered exactly as supplied; the grid
  does not know who the user is.

  Comment bodies are text. Optional `markdown: true` adds emphasis, code and
  links only, built as elements rather than parsed as markup, with any link
  scheme other than `http`, `https` and `mailto` refused.

  A comment records the value it was written against and shows it whenever the
  cell has since moved, so a note does not appear to contradict what is on
  screen. Changing a value never removes a comment.

  Comments follow their row through sorting and grouping. When a row is
  filtered out its comments are hidden rather than lost, and
  `comments.hiddenUnresolved()` reports what is still outstanding out of sight.
  `comments.filterToCommented()` restricts the grid to rows carrying comments,
  and refuses rather than half-applying until `loadAll()` has covered the whole
  row set.

  Comments remain available while streaming. A thread whose row is evicted by a
  bounded window closes with an explanation.

  `Alt`+`M` opens the thread on the focused cell. The panel traps focus while
  open and restores it to the cell on close, and commented cells announce their
  count and unresolved count to screen readers.


- **Column header histograms, and filtering by clicking them.** Each column
  heading can carry a distribution chart that is also a filter control. Click a
  bar to filter to that bucket, drag across bars on a numeric or date column to
  filter to the range. As filters are applied the other columns recount, so a
  dataset can be explored by clicking through headings rather than opening a
  dialog.

  ```js
  facets: { enabled: true }

  // per column, layered over the grid's settings
  { field: 'price', type: 'number', facet: { strategy: 'quantile' } }
  { field: 'notes', facet: false }
  ```

  Off by default, because the band roughly doubles the header's height.

  **A column is never counted against its own filter.** Every other active
  filter applies; that column's own conditions are removed before counting, so
  clicking a bucket dims the others rather than collapsing the chart to one
  bar. Without that there is no way to see what you excluded or to widen the
  selection.

  The filters this produces are ordinary filters. They undo, serialise into
  saved views, and appear in the existing filter UI — nothing downstream can
  tell them from a filter typed into the filter panel. A drag emits a `between`
  range rather than a set of bucket indices, so it still means the same thing
  after the data is replaced.

  Numeric columns take `equal`, `quantile` or `log` bucketing; date columns
  pick a granularity from their span; text columns get one bar per value,
  ordered by count. Text columns above `cardinalityLimit` distinct values are
  suppressed — a name column has no readable histogram — or show a top-N with
  an aggregated remainder under `aboveLimit: 'topN'`. Nulls and NaN land in a
  terminal bucket rather than being dropped, so the counts always sum to the
  row count.

  Each bar shows two readings: its full height is the bucket's share of the
  unfiltered column, and the solid fill inside is how much survives the current
  filters.

  Charts are keyboard operable — arrows move between buckets, `Enter` toggles,
  `Shift` with arrows extends a range, `Escape` clears — and carry a sentence
  describing the distribution's shape for screen readers.

  Live streams suppress the charts, because buckets moving under the pointer
  make the control lie about what clicking it will do; pausing the stream
  brings them back. Paged and remote sources need a `facets.provider` to supply
  counts, and without one the charts are silently absent.

- **Compute now runs in a Worker.** Distribution counting is offloaded above
  `workerThreshold` rows. This is the first kernel to use the Worker path;
  sort, filter and grouping continue to run on the main thread.

- **Time scrubber.** `grid.timeline` moves the grid back through recent data
  changes — what a row held a minute ago, before the number moved.

  ```js
  grid.timeline.attach();     // start recording
  grid.timeline.seek(5);      // five changes back
  grid.timeline.toLive();     // return
  ```

  Attaching puts a scrubber on the grid: a slider with how long ago and the
  clock time beside it, updating as you drag rather than on release. It turns
  accent-coloured whenever you are off live, and removes itself on `detach()`.

  The window it reads is bounded two ways: `updates.logLimit` changes (2000)
  and `updates.logRows` rows between them (100,000), dropping oldest-first on
  whichever it reaches. Both are configurable. A cap on changes alone does not
  bound memory, because one change may carry a single cell and the next fifty
  thousand rows. `grid.updates.stats()` reports `held` against `heldLimit`.

  Cells whose value moved during a seek are marked, and stay marked until the
  next seek — on a wide row the change you are hunting for is easy to scroll
  past, and a flash you can miss while reading the other end of the row helps
  nobody. The colour is `--lattice-timeline-changed`. Marking compares rendered
  column values rather than raw fields, so a computed column that moved because
  its inputs moved is marked too. Chart columns redraw as you scrub, like any
  other cell.

  It reads the change log rather than the undo history: history records what
  *you* did, and the question on a live grid is what the *data* did. Seeking
  backwards writes back what each change replaced; seeking forwards re-applies
  the changes themselves.

  Recording is off until `attach()`, because what a value used to be is not
  recoverable afterwards, and reading a row per key on every change is real cost
  on a busy feed. Value changes reverse; row additions and removals do not, and
  a window containing them scrubs over the value changes and leaves the row set
  alone. The `delta` renderer is the one cell type to keep off a scrubbed grid:
  it samples on a wall-clock timer, so it reads a seek as a real movement and
  draws an arrow for it.

- **Bounded windows for streaming sources.** `source.maxRows` turns an endless
  stream into a sliding window: the oldest rows are dropped as new ones arrive,
  so a grid left up overnight holds a fixed number of rows rather than every row
  it was ever sent.

  ```js
  source: { mode: 'stream', maxRows: 50000, open: … }
  ```

  Omit it for the previous behaviour, which is no limit. The progress report
  gains `live` and `evicted` so a status bar can show the window. Evicted rows
  are tombstoned rather than spliced out, because the physical index is row
  identity for the life of the source and shifting it would silently move every
  cached sort, selection and expansion. The viewport is compensated when rows
  are trimmed above it, so a user reading history does not have the floor drop
  out from under them.

- **Hold live updates, and see what coalescing saves.** A pause button in the
  action rail, and `grid.updates` behind it.

  ```js
  grid.updates.pause();
  grid.updates.resume();      // apply everything held
  grid.updates.stats();       // { pending, queued, coalesced, ... }
  ```

  Changes keep merging while paused, so forty updates to one row are one row of
  work when play is pressed. `coalesced` is the difference — the number that
  made the throughput claim true and that nothing previously reported. The
  status bar shows it, and shows the backlog while paused.

  `grid.updates.log()` returns what arrived, in order, with timestamps. It keeps
  the raw sequence rather than the merged one, survives the flush, and is capped
  so a grid paused indefinitely holds the recent past rather than all of it.

  Pausing is deliberately a control rather than something inferred from whether
  the user seems busy: that heuristic is wrong in both directions, and a grid
  that stops updating for reasons nobody can see is worse than one that keeps
  moving.

- **Jump to a page by typing it.** The page number in the pagination bar is an
  input rather than a label: type a number, press Enter. On a thousand-page
  grid the last-page button and a run of clicks were the only ways to reach
  page 400.

  Out of range clamps to the last page. A blank or non-numeric entry restores
  the page you were on rather than jumping to the first — a mistype is not a
  request to go home. Escape abandons the edit.

- **Presentation mode.** `grid.presentation.start()` renders the grid for a
  room: full-screen, application chrome hidden, everything enlarged. The data
  stays live and interactive throughout.

  ```js
  grid.presentation.start();               // 1.5x by default
  grid.presentation.start({ scale: 2, chrome: ['statusBar'] });
  grid.presentation.nudge(1);              // live, or Ctrl/Cmd +
  grid.presentation.stop();                // or Escape
  ```

  The scale multiplies the configured density rather than replacing it, so a
  `spacious` grid presented at 1.5x is still that grid, half as big again.
  Virtualisation follows the enlargement. Separators soften and selection
  strengthens for reading at distance, and numeric columns take tabular figures
  at heavier weight.

  Full-screen goes through the existing maximiser: a grid already maximised
  stays maximised when the presentation ends. Chrome hidden on entry is recorded
  and restored, so anything the host had already hidden stays hidden.

  **Saved views are the slides.** Pass a sequence and step through it:

  ```js
  grid.presentation.start({ views: ['escalations', 'at-risk', 'margin-watch'] });
  ```

  Arrow keys, space and Page Up/Down move between them; Home and End jump to
  the ends; R puts the current view back as saved, discarding whatever the
  presenter sorted or filtered after arriving at it. Each view applies through
  the ordinary `views.apply`, so a view means exactly what it meant before.

  The stepping keys bind only when there is a sequence, and never while
  something is being typed into — a quick filter answering a question from the
  room does not advance the deck on the space bar. Stepping past either end
  sits there rather than wrapping. A position indicator names the view and its
  place in the sequence.

  Transitions are a cross-fade and honour `prefers-reduced-motion`.

  **Spotlight.** `grid.presentation.setSpotlight({ keys, colIds })` dims
  everything it is not on — rows, columns, or the cells where they intersect.
  Dimming stops short of illegible so the audience can still see there is more
  data; it is opacity alone, so a dimmed sparkline keeps its colours. A
  spotlight is transient and does not survive a view change.

  **Redaction travels in views and undo.** It is part of grid state now, so a
  saved view carries its own masking and toggling it undoes like any other
  change.

  **Auto-advance** cycles a sequence for an unattended wall display:
  `start({ views: [...], autoAdvance: 15000 })`. It wraps, unlike a keypress.

  `chrome: ['statusBar']` keeps named chrome visible.

  **Annotation layer.** `grid.annotate.use('pen')` puts a transparent canvas
  over the grid to draw on — freehand, straight arrows, rectangles and a
  highlighter.

  ```js
  grid.annotate.use('arrow', { colour: '#e0245e' });
  grid.annotate.undo();
  grid.annotate.clear();
  grid.annotate.use(null);        // hand the grid back
  ```

  It never reads or writes data. The canvas is not created until a tool is
  first chosen and is `pointer-events: none` whenever none is active, so
  scrolling, selection and editing pass straight through. Marks are stored in
  content coordinates, so a circle drawn round a cell travels with that cell as
  the grid scrolls. They are cleared when the presentation ends, and a capture
  taken while they are on screen includes them.

  **Still capture.** `grid.capture({ scale: 2 })` renders the grid as it stands
  to a PNG, for the cases where a static image genuinely is what is wanted.

  ```js
  const blob = await grid.capture({ scale: 2 });
  await grid.capture({ scale: 3, fileName: 'q3-margins.png' });
  ```

  It photographs the browser's own rendering rather than redrawing the grid, so
  every decoration, sparkline and pill comes out as it appears. Cross-origin
  images are refused before the work starts, naming the offending URL, because
  they taint the canvas and would otherwise fail at the last step with an error
  that names nothing. Web fonts need embedding to appear; the default
  `system-ui` stack is unaffected. Fires `presentation:captured`.

  Events: `presentation:started`, `presentation:ended`, `presentation:scale`,
  `presentation:changed`, `presentation:view`.

- **Density is one number, and it now takes effect.** Four presets, each setting
  a single scale that every geometry token derives from — row height, spacing,
  decoration sizes, and type at a damped rate.

  ```js
  createGrid(el, { density: 'spacious' });
  createGrid(el, { density: 1.4 });      // between the presets
  grid.set('density', 'compact');        // live
  ```

  | preset | row | font |
  | --- | --- | --- |
  | `compact` | 23.8px | 12.7px |
  | `standard` | 28px | 13px |
  | `comfortable` | 42px | 14px |
  | `spacious` | 56px | 15px |

  Type is damped rather than scaled: the row doubles across that range while the
  font moves about 18%.

  Virtualisation follows the resolved `--lattice-row-height`, so overriding that
  token by hand now moves the rows as well as the padding. An explicit
  `rowHeight` in config still overrides both.

  `standard` reproduces the geometry the grid rendered before, so a grid that
  never asked for a density is unchanged.

- **`twoline` cell renderer** — a bold primary line over a quieter secondary
  one, taken from a second property of the same row.

  ```js
  { field: 'name', cell: { render: 'twoline', props: { secondary: 'email' } } }
  ```

  `secondary` takes a dot path into the row's data, or a function; `format`
  decorates the result. It reads the row rather than another column, so the
  second line needs no column of its own.

  Both lines truncate rather than wrapping, and the accessible name carries
  both as one string. A row with no second line collapses to a single centred
  line. Two lines need the room — pair it with `density: 'comfortable'` or
  taller.

- **`type: 'image'`** treats a column's value as a URL and draws it — avatars,
  logos, thumbnails.

  ```js
  { field: 'avatar', type: 'image', cell: { props: { shape: 'circle' } } }
  ```

  Props: `shape` (`rounded`, `circle`, `square`), `size`, `fit`, `alt`,
  `loading`. Omit `size` and the box follows the density scale.

  Only image URLs load: `http`, `https`, `blob:` and `data:image/`. Anything
  else is refused, including a `data:` URL claiming another type. A missing or
  broken image leaves the box empty rather than shifting the column, and every
  export carries the URL rather than markup.

- **Redact a column while presenting.** Right-click a column heading and choose
  **Redact column** to obscure its values for a screen share. The row count, the
  sort, the filters and the layout all stay readable; only the values go.

  ```js
  grid.redaction.toggle('salary');
  grid.redaction.set(['salary', 'bonus']);
  grid.redaction.clear();
  ```

  Column headings stay legible so a redacted column can still be identified and
  turned back on. The pinned totals row is redacted along with the values,
  because a filtered total is the value rather than a hint at it.

  Redaction is presentational. The values remain in the model, the DOM, the
  clipboard and every export, and anyone with access to the page can read them.
  For a value that must not reach the browser at all, use `permissions` with
  `writeOnly`.

  `--lattice-redaction-filter` sets the treatment and defaults to
  `blur(5px) contrast(0.85)`. It accepts anything the CSS `filter` property
  does, including an SVG filter for a mosaic.

- **Column headings have a context menu.** Right-clicking a heading previously
  did nothing. It now offers **Redact column** and **Hide column**; the header
  menu button still carries the full set of sorting, pinning, sizing and
  grouping actions. New event: `header:contextmenu`.

- **Optimistic writes with rollback.** Supply `edit.commit` and the grid tracks
  whether each edit reached your server, rolling back the ones that did not.

  ```js
  edit: {
    enabled: true,
    commit: async ({ key, colId, value }) => {
      const res = await fetch(`/api/rows/${key}`, {
        method: 'PATCH', body: JSON.stringify({ [colId]: value }),
      });
      if (!res.ok) throw new Error(await res.text());   // rolled back
    },
  }
  ```

  Resolving confirms the write; throwing rolls the cell back and fires
  `cell:reverted` with the error as `reason` and the refused value as
  `rejected`, so you can offer a retry. Three events carry the lifecycle:
  `cell:pending`, `cell:confirmed` and `cell:reverted`. Pending cells are marked
  with `--lattice-pending-background`, rolled-back ones flash
  `--lattice-reverted-background`.

  For a backend that acknowledges on a different channel — a websocket, an
  event-sourced projection — set `confirm: 'manual'` and call
  `grid.edit.settle(id, ok, reason)` when the answer arrives. The id comes from
  `cell:pending`. The mode is always declared rather than inferred from what
  `commit` returns.

  A rollback restores the last value a confirmation vouched for, which is not
  always the value immediately before the failed write: if later edits have
  replaced it, they win and nothing is written back. Undo of an edit still in
  flight sends a compensating write rather than cancelling the request.

  Without `edit.commit` nothing changes — writes are durable the moment they are
  made, exactly as before, and none of the new events fire.

  New: `grid.edit.settle()`, `grid.edit.pending()`, `grid.edit.status()`, and
  `edit.pendingTimeout` for the stale-write warning.

  `grid.edit.setCells()` and `grid.edit.pasteInto()` are now declared in the
  published types; both already existed at runtime.

- **Framework adapters for React, Vue 3 and Svelte.** One optional bundle each,
  around 5KB gzipped, shipped as `dist/modules/react.esm.js`,
  `dist/modules/vue.esm.js` and `dist/modules/svelte.esm.js`.

  ```js
  // React
  const LatticeGrid = createLatticeGrid({ React, createGrid });
  <LatticeGrid columns={columns} rows={rows} rowKey="id" onCellChanged={fn} />

  // Vue 3
  const LatticeGrid = createLatticeGrid({ vue, createGrid });
  <LatticeGrid :columns="columns" :rows="rows" @cell-changed="fn" />

  // Svelte — an action
  const lattice = createLatticeAction({ createGrid });
  <div use:lattice={{ columns, rows, rowKey: 'id' }} on:cell-changed={fn}></div>
  ```

  Props are the configuration keys you already know, plus `sort`, `filters`,
  `quickFilter` and `selectedKeys`, plus one callback per grid event —
  `cell:changed` is `onCellChanged` in React, `@cell-changed` in Vue,
  `on:cell-changed` in Svelte.

  A changed prop is pushed into the live grid through the ordinary public API.
  The grid is never rebuilt on a re-render, so scroll position, selection,
  expansion state and any open editor survive. Change detection is reference
  equality, so hold `columns` and `rows` steady between renders and hand back a
  new array only when the data has actually changed.

  The framework and `createGrid` are passed to a factory rather than imported.
  Lattice still ships zero dependencies, and each adapter bundle contains only
  glue — no second copy of the grid, and no version of it to disagree with the
  one you already loaded. The grid instance stays reachable: a forwarded ref in
  React, `expose` in Vue, your own reference in Svelte.

  Svelte is an action rather than a component because `{ update, destroy }` over
  a node is already the shape of the work, and it needs no framework runtime at
  all.

- **`<lattice-grid>` web component.** A self-contained module bundle that
  registers a custom element on import — one script, one tag, no build step.

  ```html
  <link rel="stylesheet" href="dist/lattice-grid.min.css">
  <script type="module" src="dist/modules/webcomponent.esm.min.js"></script>

  <lattice-grid row-key="id"
    columns='[{"field":"id"},{"field":"city"}]'
    rows='[{"id":"A","city":"Leeds"}]'></lattice-grid>
  ```

  Scalars are attributes — `theme`, `density`, `locale`, `row-key`,
  `row-height`, `header-height`, `auto-height`, `selection`. Structures are
  properties: `rows`, `columns`, `config`. `rows` and `columns` also accept JSON
  attributes, for a page whose markup comes from a server template. Attribute
  changes update the grid in place rather than rebuilding it, so scroll
  position, selection and an open editor survive.

  The underlying grid is on `.grid`, giving the full imperative API.

  Grid events are re-dispatched as `CustomEvent`s named `lattice-` plus the
  grid name with colons hyphenated, so `cell:changed` becomes
  `lattice-cell-changed` and the payload is on `event.detail`.

  The element renders in the light DOM, so the `--lattice-*` tokens and any CSS
  written against the grid's classes work exactly as documented.

  The bundle carries the grid with it: load it *or* `lattice-grid.esm.js`, not
  both. Optional module bundles are now minified as well, so
  `dist/modules/*.esm.min.js` exists alongside the readable build.

- **The fill handle continues a series.** Dragging it now extends what it can
  recognise instead of repeating the selected block.

  ```js
  1, 2, 3          // → 4, 5, 6
  5, 10, 15        // → 20, 25
  15 Jan, 15 Feb   // → 15 Mar, 15 Apr   whole months, holding the day
  31 Jan, 28 Feb   // → 31 Mar, 30 Apr   month ends stay on the month end
  'x', 'y'         // → x, y, x, y       unrecognised, so it repeats
  ```

  Detection runs per column, so dragging several columns down continues several
  independent series. A single source value copies rather than incrementing, and
  anything unrecognised repeats as before. Month steps hold the day of month and
  clamp where the month is short.

  Where every source value is the last day of its own month, the fill stays on
  the month end rather than continuing in days — including 29 February in a leap
  year. Values that share a day of month keep the day-preserving answer, so
  `30 Apr, 30 Jun` still gives 30 August.

  Filling upwards is not supported; the handle extends downwards only.

  `selection.fill` takes precedence when supplied, for domain series the grid
  cannot infer. It must return one value per target row.

- **`selection.addRange(range)`** adds a cell range without discarding the
  others — the API form of ctrl-clicking a second block. The added range becomes
  the anchor that `extendRange` grows.

  `startRange`, `extendRange`, `corner` and `inRange` are now declared in the
  published types alongside it; all four already existed at runtime.

- **Ctrl/Cmd + Shift + arrow selects a second range from the keyboard.** The
  first press opens a block at the focused cell without discarding what is
  already selected; the presses after it extend that block, so holding the chord
  draws one rectangle rather than one per key repeat. A plain Shift + arrow goes
  back to extending a single block.

- **Conditional formatting an end user can change.** `grid.formatting` holds
  rules as runtime state rather than compiling them at configuration time, so a
  user can add and reorder them while the grid is running.

  ```js
  grid.formatting.add('margin', { when: { op: 'lt', value: 0 }, style: { background: '#fbeceb' } });
  grid.formatting.add('*',      { when: { op: 'blank' },        style: { background: '#f1f3f5' } });
  grid.formatting.move('margin', ruleId, 0);
  ```

  A scope is a column id, or `'*'` for every column. The two are evaluated as
  one ordered list — grid-wide rules first, then the column's own — so a column
  rule can override a grid-wide one and `stopIfTrue` behaves the same across the
  join as within either half.

  Rules travel in saved views and undo like any other change. They must be JSON,
  so `style` cannot be a function here; config-time `cell.style` still accepts
  one and is unchanged. Where both apply they are merged, and the runtime rule
  wins only for the properties it names. Group rows are not formatted.

  A `formatting` tool panel edits them: add, reorder, enable, disable and
  remove, per column or across the grid. Add it with
  `toolPanel: { panels: ['columns', 'filters', 'formatting'] }`.

  Icon sets and data bars are not in the panel yet. Both are column decorations
  rather than cell styles, and driving the existing `bar` and `icon` decorations
  from the panel needs a runtime column-decoration API.

  New: `grid.formatting`, the `formatting` config option, and a
  `formatting:changed` event.

- **Conditional formatting rules.** `compileRules()` turns a rule list into the
  function `cell.style` already accepts.

  ```js
  { field: 'margin', cell: { style: compileRules([
    { when: { op: 'lt', value: 0 }, style: { background: '#fdecea' } },
    { scale: { min: 0, max: 100, colours: ['#f8f9fa', '#1a6bc7'] } },
  ]) } }
  ```

  Conditions use the same operators as filters. Rules evaluate in order and the
  first match wins unless `stopIfTrue: false`. Colour scales take two or more
  stops between a given `min` and `max`. A blank cell satisfies no comparison,
  and values typed as text still compare numerically.

  Exported: `compileRules`, `testRule`, `mixColour`, `RULE_OPS`.

- **Quick filter matching modes.** `grid.filters.quick(text, { mode })` accepts
  `contains` (the default and unchanged), `words`, `fuzzy` and `regex`.

  ```js
  grid.filters.quick('acme london', { mode: 'words' });  // every term, any column
  grid.filters.quick('crc',         { mode: 'fuzzy' });  // characters in order
  grid.filters.quick('^CIR-[12]',   { mode: 'regex' });
  ```

  The mode persists until changed, so text alone can be passed on each
  keystroke. `grid.filters.quickState()` returns `{ text, mode }`.

  An invalid regular expression falls back to a literal search, so a pattern
  being typed does not empty the grid. `fuzzy` decides what stays and never
  reorders. Matching remains restricted to columns the viewer may see.

- **In-cell charts.** Seven renderers: `line`, `area`, `column`, `winloss`,
  `pie`, `donut` and `bullet`.

  ```js
  { id: 'trend', field: 'readings', cell: 'line' }
  { id: 'mix',   field: 'split',    cell: { render: 'donut', props: { hole: 0.55 } } }
  { id: 'sla',   field: 'uptime',
    cell: { render: 'bullet', props: { target: 80, bands: [60, 85], max: 120 } } }
  ```

  The sparklines read an array from the cell's value, or from another property
  named by `series`. `bullet` reads a number and compares it to `target` over
  optional `bands`.

  Props: `series`, `min`, `max`, `label`, `marker`, `hole`, `target`, `bands`.
  Pin `min` and `max` to give several columns a shared scale.

  Values that are not numbers are treated as gaps: a line breaks across them and
  a bar is omitted. Each chart is a single SVG whose path data is all a repaint
  writes, and the chart is `aria-hidden` with a text summary on the cell.

- **`delta`** — a direction arrow and the movement over a sampling interval.

  ```js
  { id: 'px', field: 'price',
    cell: { render: 'delta', props: { interval: 1000, show: 'both' } } }
  ```

  Every `interval` milliseconds the column is sampled and each row compared
  with its value at the previous sample. One timer serves the whole column, and
  history is keyed by row key so it stays correct as rows recycle, sort and
  filter. `mode: 'against'` compares with another property — an opening price, a
  target — and runs no timer. Direction is carried by the arrow glyph as well as
  by colour.

- **`stacked`, `range` and `gauge`.** `stacked` shows how one row's total
  divides, comparable down a column in a way a pie is not. `range` shows the
  span a set of values covers with the middle marked, for aggregates where an
  average hides the spread. `gauge` shows one value as a dial, for a level
  rather than progress towards completion.

### Fixed

- **The time scrubber can be dragged.** The overlay layer it mounts into never
  intercepts pointer events, and each overlay opts back in; the scrubber did
  not. It rendered correctly and could not be dragged, clicked or focused.

- **The scrubber's return button reads "Go live".** It said "Live", the same
  word the state label beside it uses, so the two read as one thing said twice
  rather than as a state and the way back to it.

- **`rows.apply()` and `rows.queue()` now reach the columnar store.** They
  updated the row objects and not the store the kernels read, so on any grid
  large enough to be columnar the documented API for live data feeds silently
  did nothing: the value changed in your object and the cell, sorts, filters and
  totals all went on reporting the old one. Inline editing was unaffected and
  always wrote through correctly.

- **The formatting panel's reorder and delete controls now respond to a click.**
  The buttons carry a class that sets `pointer-events: none` — correct where it
  dresses an icon inside a button, wrong where the element carrying it is the
  button. A pointer aimed at one landed on the list row behind it, so the
  controls worked when driven from a script and never when clicked.

- **The Formatting tab in the tool panel draws its icon.** It asked for an icon
  the set did not contain, so the tab rendered as an invisible button and the
  panel could only be reached by knowing where to click.

- **The action rail groups the export buttons last, behind a divider.** Export,
  Excel, Copy and Print sat among Undo, Redo, Restore and Maximise; they are the
  only actions whose effect leaves the page, and mixing them in invited clicking
  Print while meaning Restore. A bare `'-'` in `toolPanel.actions` renders a
  divider, so a host reordering the rail can keep its own grouping.

- **Copying several cell ranges no longer produces misaligned rows.** Blocks
  stacked over the same columns, or joined over the same rows, copy as before.
  A diagonal pair has no rectangular form, so `grid.export.rangeText()` now
  returns `''` and `clipboard:copy` reports `reason: 'discontiguous'` instead of
  emitting rows whose columns mean different things on different lines.

- **The fill handle is hidden while several ranges are selected**, and
  `fillTo` and `fillDown` decline, rather than silently filling from the first
  block.

## [1.3.0] — 2026-08-17

### Added

- **Formulas in cells.** A leading `=` in a numeric cell is evaluated and the
  result stored:

  ```
  =5 + 5
  =quantity * unitPrice
  =[Unit Price] * 1.2
  =ROUND(quantity * unitPrice, 2)
  =IF(quantity > 10, "bulk", "single")
  =SUM(readings)
  ```

  References name columns of the same row rather than cells, matched on field or
  title and ignoring case and spacing. Bracket a name containing spaces. A row
  property with no column of its own is also reachable, so an array such as
  `readings` can be summed or averaged.

  Functions: `SUM`, `AVERAGE`/`AVG`, `MIN`, `MAX`, `COUNT`, `PRODUCT`, `ROUND`,
  `ROUNDUP`, `ROUNDDOWN`, `ABS`, `FLOOR`, `CEILING`, `SQRT`, `POWER`, `MOD`,
  `IF`, `AND`, `OR`, `NOT`, `COALESCE`, `CONCAT`, `LEN`, `UPPER`, `LOWER`,
  `TRIM`, `LEFT`, `RIGHT`. Add your own with `formulaFunctions`.

  Operators `+ - * / ^` with parentheses, comparison operators for `IF`, and
  postfix `%`. `^` is right-associative and unary minus binds tighter than it,
  matching Excel.

  Formulas are evaluated with a purpose-built parser. Neither `eval` nor
  `new Function` is used, so a formula can perform arithmetic and nothing else.

  The result is stored rather than the expression, so a formula commits as a
  single undo step and passes through the column's validation like any other
  edit. `evaluateFormula`, `parseFormula`, `referencesOf`, `looksLikeFormula`
  and `FUNCTIONS` are exported for use outside a cell.

### Fixed

- **Numeric cells reject unparsed arithmetic.** Text such as `2*3` or `10/2` is
  refused rather than stored, so the cell keeps its existing value. Enter
  `=2*3` to calculate.

  Values the numeric reader accepts are unchanged: `1,234.5`, `(50)`, `12%`,
  `£1,000` and `1e3`.

## [1.2.0] — 2026-08-17

### Added

- **Custom items in the cell menu.** `contextMenu` accepts a function
  `(params, defaults) => items`, receiving the cell that was clicked and the
  built-in items:

  ```js
  contextMenu: (params, defaults) => [
    ...defaults,
    { separator: true },
    { name: `Open ${params.value}`, action: (ctx) => open(ctx.data.id) },
  ]
  ```

  `params` and each item's `action(ctx)` receive
  `{ key, colId, value, row, data, column, index, grid }`, where `data` is your
  own row object. Return the items to show; an empty array suppresses the menu,
  and returning nothing leaves the defaults in place.

- **Custom buttons on the left rail.** `toolPanel.actions` accepts objects as
  well as built-in names, positioned where they appear in the list:

  ```js
  actions: ['undo', 'redo', {
    name: 'sync', title: 'Sync to the server', icon: 'restore',
    run: ({ grid, keys, cells }) => api.sync(keys),
    enabled: () => grid.state.modified(),
  }]
  ```

  `title` and `icon` may each be a function, re-read on every repaint.

- **Excel, clipboard and print on the rail and in the cell menu**, alongside
  CSV. Rail actions are now `undo`, `redo`, `export`, `excel`, `clipboard`,
  `print`, `restore`, `maximise`. The cell menu adds Excel for visible and
  selected rows, "Copy visible rows", and Print.

  An explicit `toolPanel.actions` array replaces the default rather than
  extending it. Add the new names to include them, or omit the key to take the
  current default.

- **`rows.matchCount()`** — data rows passing the filters, across every page,
  excluding group headers, footers and totals.

### Fixed

- **Custom items supplied through `contextMenu` now appear in the menu.**

- **The status bar counts data rows on a grouped grid**, excluding group
  headers from the total.

- **`Paste`, `Clear`, `Fill down` and `Edit cell` are disabled on a grid that
  accepts no edits.** `Copy`, `Copy with headers`, the exports and
  `Clear selection` are unchanged.

## [1.1.0] — 2026-08-16

### Added

- **Maximise.** The rail's last button fills the browser window with the grid;
  clicking it again, or pressing <kbd>Esc</kbd>, returns it to the page.
  `grid.maximise` exposes `enter()`, `exit()`, `toggle()` and `active()` for
  binding your own control, and `maximise: false` removes both.

  The host element is moved to `<body>` and pinned to the viewport, then
  returned to its original position. A placeholder holds its space, so the page
  behind keeps its layout and scroll position. Inline styles are restored
  exactly. While maximised the element carries `.lat-maximised` and `<body>`
  carries `.lat-maximised-host`.

- **The grid is insulated from the host page's CSS.** Elements the grid creates
  are given a baseline for margin, padding, border, radius, background, shadow,
  text transform and letter spacing, plus type and colour on form controls. A
  page-level rule such as `section { padding: 5.5rem 0 }` no longer affects the
  grid.

  No `!important` is used. Any rule of yours aimed at a Lattice class continues
  to take precedence, so deliberate overrides work as before. The reset covers
  box model and decoration only, never `display`, `position` or dimensions, and
  applies only inside `.lattice`.

- **Complete type declarations.** `lattice-grid.d.ts` now covers `history`,
  `views`, `diff`, `permissions`, `ai`, `licence`, `pagination`, `highlight`,
  `maximise`, `getVersion`, `ready` and `config`.

- **`dist/package.json`** naming `types`, `exports`, `main`, `module` and
  `style`, with `LICENSE` and `README.md` alongside, so the distribution is
  self-contained and editors find the declarations without configuration.

### Changed

- **Licensing is one product.** Every copy is feature-identical; a licence
  removes the trial watermark and unlocks nothing. The watermark depends only on
  where the grid is running: loopback hosts never show one, and any other host
  without a valid key always does.

- **The trial watermark is larger and moves between the four corners.** It takes
  no pointer events except on its own link, so clicks, drags and keystrokes
  reach the grid beneath it. Licensed grids and loopback hosts are unaffected.
  `.lat-watermark` carries a `--br`/`--bl`/`--tl`/`--tr` modifier for the corner
  in use.

### Removed

- **`GridModule.tier`** is no longer part of the module type. Modules that set
  it install exactly as before; only a TypeScript build naming the field is
  affected.

- Public documentation no longer describes how licence keys are constructed or
  issued. It covers what a licence does, where to obtain one and how to install
  it.

### Fixed

- **`calc()` expressions are preserved in the minified stylesheet.** Spacing
  around operators inside math functions is required by CSS and is now retained,
  so padding and spacing in `lattice-grid.min.css` match the unminified build.
  Recommended for anyone using the minified stylesheet.

- **Column widths account for the scrollbar gutter.** Columns are laid out
  against the space actually available, so a grid with a pinned end column can
  scroll its rightmost centre column clear of it.

- Reference corrections: the methods are `grid.diff.setSnapshot()` and
  `grid.ai.schema()`.

## [1.0.1] — 2026-08-15

### Added

- **`grid.getVersion()`**, and a matching `getVersion()` on the module. The
  `version()` export continues to work.

### Fixed

- **Demand-driven sources load their data.** `remote` and `paged` sources fetch
  the blocks covering the viewport as it moves.

  The request shape is
  `{ range: { start, end }, sort, filters, quick, groupBy, … }`.

### Documentation

- **`docs/api-detail.html`** — a developer guide covering what each part of the
  API does, with worked examples, alongside the reference tables in
  `docs/API.html`.

- This changelog.

## [1.0.0] — 2026-08-15

First release.

### The grid

- Columnar store with typed arrays, dictionary encoding, presence bitsets and
  index permutations. A six-stage memoised pipeline — filter, sort, group,
  total, pivot, flatten — where a change re-runs only the stages it affects.
- Virtualised DOM renderer. Rows and cells come from pools and are reassigned
  rather than destroyed; the only vertical write is a transform. A 1,000-row
  change against a 20-row viewport touches 20 rows of DOM.
- Headless core with no DOM dependency, for tests and server-side export.
- **Zero dependencies**, at runtime and at build time. No bundler, no framework
  wrapper, no icon font, no date library.

### Columns and data

- 20 built-in data types beyond text, number, boolean and date: durations,
  units and bitrates, IP addresses and CIDR, hex, binary and octal at several
  widths, colours, ratings, JSON and more. Each is a bundle of format, parse,
  compare, storage, Excel and clipboard behaviour.
- Custom types through `dataTypes`, with `createRadixType` and `createUnitType`
  exported for building them.
- Formatting for numbers, dates, booleans and text, including currency,
  percentages, compact notation and pattern-based dates.
- Lookup columns that store an id and display a label, with async option
  sources and search.
- Computed columns with a dependency graph, so a change to one field
  invalidates only what reads it.

### Interaction

- Inline editing with a catalogue of editors: text, number, date, time,
  select, multi-select, tree select, object picker, colour, slider, rating,
  segmented, password, code and more.
- Range selection with drag, Shift+arrow extension and a fill handle. Copy in
  the tab-separated form a spreadsheet reads, paste with Excel's tiling rules,
  fill down, and clear.
- Keyboard navigation across cells, rows and pages, with the grid keeping its
  hands off keys typed into an input.
- Sorting, filtering, grouping, pivoting and column reorder, resize and pin,
  driven from the header, the tool panel or the API.

### Product features

- **Saved views** — named states, both developer-defined and user-saved, with a
  picker. Applying one is a destination rather than a patch: the same view
  gives the same grid whatever preceded it.
- **Undo across the whole grid**, not only edits. Sorts, filters, column moves,
  grouping, an applied view and a restore all record a labelled entry, and a
  multi-cell paste is one entry rather than one per cell.
- **Column permissions** over four levels — `hidden`, `read`, `writeOnly`,
  `write` — enforced consistently across editing, clipboard, export, sort,
  group, filter and saved state. `writeOnly` is for secrets a user may set and
  never read.
- **Audit mode**, showing a row's before and after against a supplied snapshot
  with changed cells marked.
- **An AI intent layer** that describes the grid to a model of your choosing,
  validates the reply against the real columns and operators, and applies an
  approved plan as one undoable step. The grid makes no network call.
- **Highlighting**, on change or on demand, for a cell, a row or a column.
- CSV, Excel and clipboard export, and print.

### Chrome

- A left action rail carrying undo, redo, export and restore, with the columns,
  filters, views and quick-filter panels as icons. (Extended in later releases —
  see 1.1.0 and 1.2.0.)
- Status bar, pagination, context menus, tooltips and an overlay layer.

### Licensing

- One product, feature-identical everywhere. A licence removes the trial
  watermark; it does not unlock anything.
- Free on loopback hosts — `localhost`, `*.localhost`, `127.0.0.0/8`, `::1` —
  so development needs no key.
- Any other domain without a valid key renders in full and carries a trial
  watermark. Nothing ever refuses to render.
- Keys are checked locally with no network call, and name the domains they
  cover including wildcards.

[1.3.0]: https://github.com/tocloco/lattice/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/tocloco/lattice/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/tocloco/lattice/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/tocloco/lattice/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/tocloco/lattice/releases/tag/v1.0.0
