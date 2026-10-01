# The theme token contract

A shipped preset, a house palette, a design-system port — all of them work
against one surface: the `--lattice-*` and `--lat-*` custom properties declared
in `packages/dom/src/theme/*.css` (`lattice.css`, `structure.css`, `views.css`,
`editors.css`, `diff.css`, `history.css`, `prompt.css`). Until this page, nothing
said which of them are public, what each one is for, or whether a preset must
set it, may set it, or should leave it alone. This page does, for every one
found in the shipped CSS, and a test
(`test/theming-contract-doc.test.js`) parses that CSS on every run and fails by
name the moment a token is added, removed or renamed here without a matching
edit to this page — the same discipline `docs/ADAPTER-CONTRACT.md` and
`test/adapter-contract-doc.test.js` apply to the pushdown adapter surface.

## Correction to BACKLOG-0001543's token count

The spike this card reads first (`SPIKE-THEME-PRESETS.md` §1) counted
**132** tokens (127 `--lattice-*` + 5 `--lat-*`) with a grep that matched literal
`name: value;` declarations — which, by coincidence, also matched a commented-out
usage example (`--lattice-redaction-filter: url(#my-pixelate);`, inside a
`/* ... */` block, never a real declaration) and, because it never looked for
`var(--lattice-name, fallback)` usages that carry no declared default anywhere,
missed every token whose *only* default is that fallback expression.
Re-parsing the same four files, comment-aware, and cross-checking every name
against every `element.style.setProperty(...)` call in `packages/dom/src`
(to tell a token a **preset can set** from one the **grid itself computes**)
finds:

| | Count |
|---|---:|
| `--lattice-*` with a declared per-theme default | 129 |
| `--lattice-*` fallback-only, no built-in default, no JS setter — a real, undocumented escape hatch | 28 |
| `--lattice-*` fallback-only, set by the grid’s own JS at runtime — read, don’t set | 10 |
| `--lat-*` geometry helper, declared, state-class-driven | 5 |
| **Public total (this page)** | **172** |
| `--lat-*` internal computed alias of `--lattice-scrollbar-size` (prefixed, but never a preset’s to set) | 2 |
| `--lat-*` internal per-cell/per-instance data (a bar fill %, a swatch colour...) set inline by JS per cell, never a theme default (prefixed, but not a token) | 11 |
| Internal, unprefixed component-local plumbing (`--bl`, `--br`, `--dimmed`, `--focused`, `--hovered`, ... — named, not enumerated here) | ~50 |

The 132 figure undercounted the real public surface by 38 tokens and, in the
same breath, would have overcounted it by 11 had its own "every `--lat-*` is
public" rule been applied literally — 11 of the 18 `--lat-*` names in the CSS
are per-cell data, not theme defaults. This page documented the corrected 170
at the time (not the spike’s 132; no token was renamed either way — the
spike’s "no renames needed" finding still held). BACKLOG-0001573 moved
`--lattice-duration` from the fallback-only row above to a declared default,
renamed it `--lattice-motion-duration`, and added `--lattice-motion-easing`
beside it, for a net +1: **171**. BACKLOG-0001582 added
`--lattice-cell-border-width`, for a net +1: **172**.

## Public vs internal

**A token is on this contract when a preset author can set it and have it
mean something — as a default, not merely as a name that happens to start with
`--lattice-` or `--lat-`.** Three groups share that prefix without qualifying:

- **Unprefixed internals** (`--bl`, `--br`, `--center`, `--dimmed`, `--dot`, `--edge`, `--fill`, `--find`, `--focused`, `--gauge`, `--hovered`, `--icon`, `--invalid`, ...): component-local plumbing, never documented, no naming guarantee.
- **`--lat-*` per-instance data** (§ table below): a bar’s fill %, a swatch’s colour, a rating’s fill, a skeleton’s randomised width, a group row’s indent, a collaborator’s presence colour — every one of these is set inline, per cell, by the renderer that owns it. Setting one on `.lattice` does nothing: the inline style on the specific cell always wins.
- **`--lat-scrollbar-x`/`--lat-scrollbar-y`**: computed aliases of `--lattice-scrollbar-size`, gated behind `data-scrollbars-x/y="custom"`, which the grid sets itself — style `--lattice-scrollbar-size`, not these.

Full listing: [Internal, off-contract](#internal-off-contract).

## Override scope

| Scope | How | Wins when |
|---|---|---|
| Grid | `.lattice { --lattice-accent: #7c3aed; }` | Always — the house-palette pattern. |
| Container/page | `data-theme` on any ancestor (`<html>`, a dashboard container) | The nearest `data-theme` wins; a grid’s own `theme` config writes `data-theme` on its own root and beats anything above it. |
| Auto / OS | `data-theme="auto"` (or `theme: 'auto'`) | Resolves against `prefers-color-scheme` live, via `@media (prefers-color-scheme: dark) { @scope ([data-theme="auto"]) {…} }` — `prefers-color-scheme` is not an alternative to `data-theme`, it is what `'auto'` means. |
| Portalled elements | `carryTheme()` (`packages/dom/src/themeof.js`) | The filter popup, a rich cell tooltip, a maximised grid moved to `<body>` all lose their themed ancestor when portalled; `carryTheme()` stamps the resolved theme onto the portalled element at the moment it is placed, read via `themeOf()`’s `parentNode` walk. Reimplementing this instead of calling it is the one mistake this page exists to head off — a popup on `document.body` has no themed ancestor to inherit from. |

## Public tokens, by role

Legend: **MUST** — a preset claiming to match a design system sets this or the grid visibly clashes. **MAY** — tunable for closer fidelity; the default is reasonable. **leave** — internal, state-driven, or accessibility-mandated; a preset should not override it.

### Core surface/text/border/accent/state colour

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-accent` | `#1a6bc7` | `#4e9bea` | `#ffd400` | `#7dfca4` | the one brand colour the grid uses | MUST |
| `--lattice-accent-contrast` | `#ffffff` | `#06101b` | `#000000` | `#06120a` | text drawn on the accent colour | MUST |
| `--lattice-background` | `#ffffff` | `#14181c` | `#000000` | `#06120a` | body background | MUST |
| `--lattice-surface` | `#f7f8f9` | `#1b2026` | `#000000` | `#06120a` | header, totals row, status bar background | MUST |
| `--lattice-surface-alt` | `#fbfcfc` | `#171c21` | `#0d0d0d` | `#0a1a0f` | striped/alternate row background | MAY |
| `--lattice-foreground` | `#1c2126` | `#e4e9ee` | `#ffffff` | `#7dfca4` | body text colour | MUST |
| `--lattice-foreground-muted` | `#5b6670` | `#99a4ae` | `#c8c8c8` | `#3f9e5c` | secondary text: counts, placeholders | MAY |
| `--lattice-border-color` | `#dfe3e6` | `#2a3138` | `#8a8a8a` | `#173a24` | the grid’s hairline borders | MUST |
| `--lattice-border-strong` | `#c8cfd5` | `#3a434c` | `#ffffff` | `#2c6b42` | header underline, pinned-region edge | MAY |
| `--lattice-hovered-background` | `#f2f5f8` | `#1f252c` | `#1f1f1f` | `#0e2416` | row/cell hover fill | MAY |
| `--lattice-selected-background` | `#dceaf9` | `#17304c` | `#003a6b` | `#143d24` | selected row/cell fill | MAY |
| `--lattice-selected-foreground` | `#10437a` | `#cfe3fb` | `#ffffff` | `#b6ffcd` | text colour on a selected row/cell | MAY |
| `--lattice-range-background` | `#e7f1fd` | `#142838` | `#002a4d` | `#0f2c1b` | a multi-cell range selection’s fill | MAY |
| `--lattice-range-border` | `#1a6bc7` | `#4e9bea` | `#ffd400` | `#7dfca4` | a multi-cell range selection’s outline | MAY |
| `--lattice-invalid-background` | `#fdeaea` | `#351515` | `#3d0000` | `#2a1206` | a cell failing validation | MAY |
| `--lattice-invalid-border` | `#c22b2b` | `#e05b5b` | `#ff6b6b` | `#ffa64d` | a cell failing validation, its outline | MAY |
| `--lattice-link-color` | `#10437a` | `#8cc0f5` | `#7fc7ff` | `#b6ffcd` | a link-type cell/value | MAY |
| `--lattice-focus-color` | `#1a6bc7` | `#6cb0f2` | `#ffd400` | `#b6ffcd` | the visible focus ring (spec §17) | MUST |
| `--lattice-find-current` | `#ffb400` | `#a86c00` | `#7a6000` | `#2f7a4f` | the current find/search match | MAY |
| `--lattice-find-match` | `#fff1a8` | `#5a4a10` | `#3d3000` | `#1a4030` | other find/search matches | MAY |
| `--lattice-flash-background` | `#fdf3e2` | `#33240d` | `#4a3800` | `#1f4d2e` | a cell that just changed value | MAY |
| `--lattice-pending-background` | `#eef2f7` | `#1d242c` | `#1f1f1f` | `#0e2416` | an optimistic write awaiting confirmation | MAY |
| `--lattice-reverted-background` | `#fdecea` | `#3a1d1a` | `#3d0000` | `#2a1206` | an optimistic write the server rejected | MAY |
| `--lattice-overlay-background` | `rgba(255, 255, 255, 0.72)` | `rgba(20, 24, 28, 0.72)` | `rgba(0, 0, 0, 0.85)` | `rgba(6, 18, 10, 0.85)` | the loading/empty-state overlay scrim | MAY |
| `--lattice-skeleton-color` | `#e9ecef` | `#232a31` | `#1f1f1f` | `#0e2416` | loading-skeleton bar colour | MAY |
| `--lattice-skeleton-highlight` | `#f5f7f8` | `#2b333b` | `#3a3a3a` | `#173a24` | loading-skeleton shimmer highlight | MAY |
| `--lattice-timeline-changed` | `#fff3cd` | `#fff3cd` | `#fff3cd` | `#fff3cd` | a timeline/history row marked changed | MAY |

### Variant/tone colour matrix (7 tones × 4 roles)

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-variant-accent-border` | `#cfc7f7` | `#3a3180` | `#ffd400` | `#2c6b42` | status pill / cell-variant “accent”, the border part | MAY |
| `--lattice-variant-accent-fill` | `#edebfd` | `#211c4a` | `#2a1f00` | `#0f2c1b` | status pill / cell-variant “accent”, the fill part | MAY |
| `--lattice-variant-accent-solid` | `#5a46d6` | `#7c68e8` | `#ffd400` | `#b6ffcd` | status pill / cell-variant “accent”, the solid part | MAY |
| `--lattice-variant-accent-text` | `#382a8c` | `#c3b9f8` | `#ffd400` | `#b6ffcd` | status pill / cell-variant “accent”, the text part | MAY |
| `--lattice-variant-danger-border` | `#f3c0c0` | `#5c2626` | `#ff6b6b` | `#ffa64d` | status pill / cell-variant “danger”, the border part | MAY |
| `--lattice-variant-danger-fill` | `#fdeaea` | `#351515` | `#3d0000` | `#2a1206` | status pill / cell-variant “danger”, the fill part | MAY |
| `--lattice-variant-danger-solid` | `#c22b2b` | `#e05b5b` | `#ff6b6b` | `#ffa64d` | status pill / cell-variant “danger”, the solid part | MAY |
| `--lattice-variant-danger-text` | `#7a1414` | `#f3afaf` | `#ff9c9c` | `#ffd9b3` | status pill / cell-variant “danger”, the text part | MAY |
| `--lattice-variant-info-border` | `#b6d4f5` | `#1e4370` | `#7fc7ff` | `#2c6b42` | status pill / cell-variant “info”, the border part | MAY |
| `--lattice-variant-info-fill` | `#e7f1fd` | `#10263d` | `#001f3d` | `#0e2416` | status pill / cell-variant “info”, the fill part | MAY |
| `--lattice-variant-info-solid` | `#1a6bc7` | `#4e9bea` | `#7fc7ff` | `#7dfca4` | status pill / cell-variant “info”, the solid part | MAY |
| `--lattice-variant-info-text` | `#10437a` | `#a8cdf7` | `#9fd6ff` | `#7dfca4` | status pill / cell-variant “info”, the text part | MAY |
| `--lattice-variant-neutral-border` | `#c8cfd5` | `#3a434c` | `#c8c8c8` | `#1f4d2e` | status pill / cell-variant “neutral”, the border part | MAY |
| `--lattice-variant-neutral-fill` | `#eff1f3` | `#262c33` | `#000000` | `#0e2416` | status pill / cell-variant “neutral”, the fill part | MAY |
| `--lattice-variant-neutral-solid` | `#5b6670` | `#8c98a4` | `#c8c8c8` | `#3f9e5c` | status pill / cell-variant “neutral”, the solid part | MAY |
| `--lattice-variant-neutral-text` | `#2e3338` | `#d5dce3` | `#ffffff` | `#3f9e5c` | status pill / cell-variant “neutral”, the text part | MAY |
| `--lattice-variant-none-border` | `transparent` | `transparent` | `transparent` | `transparent` | status pill / cell-variant “none”, the border part | leave |
| `--lattice-variant-none-fill` | `transparent` | `transparent` | `transparent` | `transparent` | status pill / cell-variant “none”, the fill part | leave |
| `--lattice-variant-none-solid` | `transparent` | `transparent` | `transparent` | `transparent` | status pill / cell-variant “none”, the solid part | leave |
| `--lattice-variant-none-text` | `inherit` | `inherit` | `inherit` | `inherit` | status pill / cell-variant “none”, the text part | leave |
| `--lattice-variant-success-border` | `#b7e0c4` | `#1e4a2e` | `#4dff9e` | `#2c6b42` | status pill / cell-variant “success”, the border part | MAY |
| `--lattice-variant-success-fill` | `#e6f4ea` | `#102a1a` | `#002d15` | `#0f2c1b` | status pill / cell-variant “success”, the fill part | MAY |
| `--lattice-variant-success-solid` | `#1b7f3b` | `#3fa45f` | `#4dff9e` | `#b6ffcd` | status pill / cell-variant “success”, the solid part | MAY |
| `--lattice-variant-success-text` | `#14532d` | `#9bdcb2` | `#7cffb0` | `#b6ffcd` | status pill / cell-variant “success”, the text part | MAY |
| `--lattice-variant-warning-border` | `#f3d9a8` | `#573d16` | `#ffd400` | `#7a4a1c` | status pill / cell-variant “warning”, the border part | MAY |
| `--lattice-variant-warning-fill` | `#fdf3e2` | `#33240d` | `#3d2e00` | `#2a1206` | status pill / cell-variant “warning”, the fill part | MAY |
| `--lattice-variant-warning-solid` | `#a96a0b` | `#d08b1e` | `#ffd400` | `#ffa64d` | status pill / cell-variant “warning”, the solid part | MAY |
| `--lattice-variant-warning-text` | `#6b3f09` | `#f0c782` | `#ffd400` | `#ffa64d` | status pill / cell-variant “warning”, the text part | MAY |

### Header

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-header-height` | `calc(32px * var(--lattice-scale))` | `calc(32px * var(--lattice-scale))` | `calc(32px * var(--lattice-scale))` | `calc(32px * var(--lattice-scale))` | column header row height | MAY |
| `--lattice-header-font-size` | `calc(13px + (var(--lattice-scale) - 1) * 2px)` | `calc(13px + (var(--lattice-scale) - 1) * 2px)` | `calc(13px + (var(--lattice-scale) - 1) * 2px)` | `calc(13px + (var(--lattice-scale) - 1) * 2px)` | column header text size | MAY |
| `--lattice-header-font-weight` | `600` | `600` | `600` | `600` | column header text weight | MAY |
| `--lattice-header-foreground` | `#2e3338` | `#d5dce3` | `#ffffff` | `#b6ffcd` | column header text colour | MUST |
| `--lattice-header-menu-size` | `max(24px, var(--lattice-target-min), var(--lattice-icon-size))` | `max(24px, var(--lattice-target-min), var(--lattice-icon-size))` | `max(24px, var(--lattice-target-min), var(--lattice-icon-size))` | `max(24px, var(--lattice-target-min), var(--lattice-icon-size))` | the column-menu affordance’s hit target | leave |
| `--lattice-header-menu-clear` | `10px` | `10px` | `10px` | `10px` | gap between header text and the menu affordance | leave |
| `--lattice-header-affordance-gap` | `calc(var(--lattice-gap) * 1.5)` | `calc(var(--lattice-gap) * 1.5)` | `calc(var(--lattice-gap) * 1.5)` | `calc(var(--lattice-gap) * 1.5)` | gap between stacked header affordances (sort/menu) | leave |
| `--lattice-header-affordance-size` | `max(var(--lattice-target-min), var(--lattice-icon-size))` | `max(var(--lattice-target-min), var(--lattice-icon-size))` | `max(var(--lattice-target-min), var(--lattice-icon-size))` | `max(var(--lattice-target-min), var(--lattice-icon-size))` | a header affordance’s hit target floor | leave |

### Density/spacing/scale

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-density-scale` | `1` | `1` | `1` | `1` | the one number every geometry token derives from | MAY |
| `--lattice-presentation-scale` | `1` | `1` | `1` | `1` | a second multiplier presentation mode drives | leave |
| `--lattice-scale` | `calc(var(--lattice-density-scale) * var(--lattice-presentation-scale))` | `calc(var(--lattice-density-scale) * var(--lattice-presentation-scale))` | `calc(var(--lattice-density-scale) * var(--lattice-presentation-scale))` | `calc(var(--lattice-density-scale) * var(--lattice-presentation-scale))` | density × presentation, computed — not set directly | leave |
| `--lattice-space` | `calc(4px * var(--lattice-scale))` | `calc(4px * var(--lattice-scale))` | `calc(4px * var(--lattice-scale))` | `calc(4px * var(--lattice-scale))` | the base spacing unit | MAY |
| `--lattice-gap` | `var(--lattice-space)` | `var(--lattice-space)` | `var(--lattice-space)` | `var(--lattice-space)` | gap between a decoration and its text | leave |
| `--lattice-indent-size` | `calc(var(--lattice-space) * 5)` | `calc(var(--lattice-space) * 5)` | `calc(var(--lattice-space) * 5)` | `calc(var(--lattice-space) * 5)` | tree/group indent per level | MAY |

### Typography

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-font-family` | `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | body and header font stack | MUST |
| `--lattice-font-mono` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | monospaced cells (code, numeric-tabular contexts) | MAY |
| `--lattice-font-size` | `calc(13px + (var(--lattice-scale) - 1) * 2px)` | `calc(13px + (var(--lattice-scale) - 1) * 2px)` | `calc(13px + (var(--lattice-scale) - 1) * 2px)` | `calc(13px + (var(--lattice-scale) - 1) * 2px)` | body text size | MUST |
| `--lattice-font-size-sm` | `calc(11px + (var(--lattice-scale) - 1) * 2px)` | `calc(11px + (var(--lattice-scale) - 1) * 2px)` | `calc(11px + (var(--lattice-scale) - 1) * 2px)` | `calc(11px + (var(--lattice-scale) - 1) * 2px)` | secondary/small text size | MAY |
| `--lattice-font-size-lg` | `calc(15px + (var(--lattice-scale) - 1) * 2px)` | `calc(15px + (var(--lattice-scale) - 1) * 2px)` | `calc(15px + (var(--lattice-scale) - 1) * 2px)` | `calc(15px + (var(--lattice-scale) - 1) * 2px)` | emphasised/large text size | MAY |
| `--lattice-font-weight` | `400` | `400` | `400` | `400` | body text weight | MAY |
| `--lattice-line-height` | `1.4` | `1.4` | `1.4` | `1.4` | body text line height | MAY |

### Presence/collaboration colour

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-peer-1` | `#7a53a8` | `#7a53a8` | `#7a53a8` | `#7a53a8` | collaborator cursor/selection colour, slot 1 | leave |
| `--lattice-peer-2` | `#b04e72` | `#b04e72` | `#b04e72` | `#b04e72` | collaborator cursor/selection colour, slot 2 | leave |
| `--lattice-peer-3` | `#1a7f4b` | `#1a7f4b` | `#1a7f4b` | `#1a7f4b` | collaborator cursor/selection colour, slot 3 | leave |
| `--lattice-peer-4` | `#a3651f` | `#a3651f` | `#a3651f` | `#a3651f` | collaborator cursor/selection colour, slot 4 | leave |
| `--lattice-peer-5` | `#c2410c` | `#c2410c` | `#c2410c` | `#c2410c` | collaborator cursor/selection colour, slot 5 | leave |
| `--lattice-peer-6` | `#0f7d86` | `#0f7d86` | `#0f7d86` | `#0f7d86` | collaborator cursor/selection colour, slot 6 | leave |
| `--lattice-peer-7` | `#b03030` | `#b03030` | `#b03030` | `#b03030` | collaborator cursor/selection colour, slot 7 | leave |
| `--lattice-peer-8` | `#5b6f1f` | `#5b6f1f` | `#5b6f1f` | `#5b6f1f` | collaborator cursor/selection colour, slot 8 | leave |

### Scrollbar (`scrollbars: 'custom'`)

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-scrollbar-size` | `12px` | `12px` | `12px` | `12px` | thickness of a grid-drawn scrollbar | MAY |
| `--lattice-scrollbar-radius` | `var(--lattice-radius-pill, 6px)` | `var(--lattice-radius-pill, 6px)` | `var(--lattice-radius-pill, 6px)` | `var(--lattice-radius-pill, 6px)` | corner radius of the thumb | MAY |
| `--lattice-scrollbar-thumb` | `var(--lattice-border-strong)` | `var(--lattice-border-strong)` | `var(--lattice-border-strong)` | `var(--lattice-border-strong)` | thumb colour, resting | MAY |
| `--lattice-scrollbar-thumb-hover` | `var(--lattice-foreground-muted)` | `var(--lattice-foreground-muted)` | `var(--lattice-foreground-muted)` | `var(--lattice-foreground-muted)` | thumb colour, hovered | MAY |
| `--lattice-scrollbar-thumb-active` | `var(--lattice-accent)` | `var(--lattice-accent)` | `var(--lattice-accent)` | `var(--lattice-accent)` | thumb colour, dragged | MAY |
| `--lattice-scrollbar-thumb-min` | `32px` | `32px` | `32px` | `32px` | thumb minimum length | leave |
| `--lattice-scrollbar-track` | `transparent` | `transparent` | `transparent` | `transparent` | track colour | MAY |

### Facet filter bar

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-facet-bar` | `#c3ccd6` | `#46525f` | `#7fc7ff` | `#2c6b42` | facet mini-histogram bar colour | MAY |
| `--lattice-facet-bar-selected` | `var(--lattice-accent)` | `var(--lattice-accent)` | `var(--lattice-accent)` | `var(--lattice-accent)` | facet bar colour, selected value | MAY |
| `--lattice-facet-bar-excluded` | `#eceff2` | `#2a3138` | `#3a3a3a` | `#123a1c` | facet bar colour, excluded value | MAY |
| `--lattice-facet-bar-null` | `#a9b4c0` | `#5b6774` | `#8a8a8a` | `#1f4d2e` | facet bar colour, null/blank value | MAY |
| `--lattice-facet-track` | `transparent` | `transparent` | `transparent` | `transparent` | facet bar track colour | MAY |

### Comment/annotation

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-comment-mark` | `#9aa5b1` | `#6b7885` | `#c8c8c8` | `#3f9e5c` | a resolved comment’s corner marker | MAY |
| `--lattice-comment-mark-unresolved` | `#c8811a` | `#e0a94e` | `#ffd400` | `#ffa64d` | an unresolved comment’s corner marker | MAY |
| `--lattice-comment-panel-bg` | `var(--lattice-background)` | `var(--lattice-background)` | `var(--lattice-background)` | `var(--lattice-background)` | the comment side panel background | leave |
| `--lattice-comment-panel-width` | `300px` | `300px` | `300px` | `300px` | the comment side panel width | MAY |
| `--lattice-comment-size` | `7px` | `7px` | `7px` | `7px` | the corner marker’s size | leave |

### Radius

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-radius` | `4px` | `4px` | `4px` | `4px` | default corner radius (controls, pills, popups) | MAY |
| `--lattice-radius-sm` | `2px` | `2px` | `2px` | `2px` | small corner radius | MAY |
| `--lattice-radius-pill` | `999px` | `999px` | `999px` | `999px` | fully-rounded corner radius | leave |

### Pill/badge

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-pill-font-size` | `var(--lattice-font-size-sm)` | `var(--lattice-font-size-sm)` | `var(--lattice-font-size-sm)` | `var(--lattice-font-size-sm)` | status pill text size | leave |
| `--lattice-pill-padding-x` | `calc(var(--lattice-space) * 2)` | `calc(var(--lattice-space) * 2)` | `calc(var(--lattice-space) * 2)` | `calc(var(--lattice-space) * 2)` | status pill horizontal padding | leave |
| `--lattice-pill-padding-y` | `calc(var(--lattice-space) / 2)` | `calc(var(--lattice-space) / 2)` | `calc(var(--lattice-space) / 2)` | `calc(var(--lattice-space) / 2)` | status pill vertical padding | leave |

### Elevation (shadow)

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-pinned-shadow` | `2px 0 4px -2px rgba(16, 20, 24, 0.28)` | `2px 0 4px -2px rgba(0, 0, 0, 0.6)` | `1px 0 0 0 #8a8a8a` | `1px 0 0 0 #2c6b42` | a pinned column/row’s leading-edge shadow | MAY |
| `--lattice-pinned-shadow-end` | `-2px 0 4px -2px rgba(16, 20, 24, 0.28)` | `-2px 0 4px -2px rgba(0, 0, 0, 0.6)` | `-1px 0 0 0 #8a8a8a` | `-1px 0 0 0 #2c6b42` | a pinned column/row’s trailing-edge shadow | MAY |
| `--lattice-popup-shadow` | `0 6px 16px -4px rgba(16, 20, 24, 0.24)` | `0 6px 16px -4px rgba(0, 0, 0, 0.6)` | `0 0 0 1px #ffffff` | `0 0 0 1px #2c6b42` | menus, tooltips, the filter popup | MAY |

### Motion

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-motion-duration` | `120ms` | `120ms` | `120ms` | `120ms` | every transition's duration: the row-expander icon, width/opacity transitions, the cell flash and the chart line/bar transitions; `prefers-reduced-motion: reduce` sets this to `0ms` in the base stylesheet | MAY |
| `--lattice-motion-easing` | `ease` | `ease` | `ease` | `ease` | every transition's easing, alongside `--lattice-motion-duration` | MAY |
| `--lattice-transition` | `var(--lattice-motion-duration) var(--lattice-motion-easing)` | `var(--lattice-motion-duration) var(--lattice-motion-easing)` | `var(--lattice-motion-duration) var(--lattice-motion-easing)` | `var(--lattice-motion-duration) var(--lattice-motion-easing)` | **Deprecated** (BACKLOG-0001573): a derived alias kept for one release for anything reading it directly; the theme CSS itself now reads the two tokens above. Removal target: the release after 1.80. | leave |

### Cell/row geometry

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-row-height` | `calc(28px * var(--lattice-scale))` | `calc(28px * var(--lattice-scale))` | `calc(28px * var(--lattice-scale))` | `calc(28px * var(--lattice-scale))` | row height | MAY |
| `--lattice-cell-padding-x` | `calc(var(--lattice-space) * 2)` | `calc(var(--lattice-space) * 2)` | `calc(var(--lattice-space) * 2)` | `calc(var(--lattice-space) * 2)` | cell horizontal padding | MAY |
| `--lattice-cell-padding-y` | `0px` | `0px` | `0px` | `0px` | cell vertical padding | leave |
| `--lattice-bar-height` | `calc(8px * var(--lattice-scale))` | `calc(8px * var(--lattice-scale))` | `calc(8px * var(--lattice-scale))` | `calc(8px * var(--lattice-scale))` | bar/progress decoration height | leave |
| `--lattice-bar-min-width` | `48px` | `48px` | `48px` | `48px` | bar/progress decoration minimum width | leave |
| `--lattice-dot-size` | `calc(8px * var(--lattice-scale))` | `calc(8px * var(--lattice-scale))` | `calc(8px * var(--lattice-scale))` | `calc(8px * var(--lattice-scale))` | dot decoration diameter | leave |
| `--lattice-icon-size` | `16px` | `16px` | `16px` | `16px` | cell/header icon size | leave |
| `--lattice-decoration-edge-width` | `3px` | `3px` | `3px` | `3px` | bar/progress decoration edge stroke | leave |

### Per-feature / misc (declared)

| Token | Light | Dark | High-contrast | Terminal | Affects | Marking |
|---|---|---|---|---|---|---|
| `--lattice-border-width` | `1px` | `1px` | `1px` | `1px` | the grid’s hairline border thickness | MAY |
| `--lattice-cell-border-width` | `var(--lattice-border-width)` | `var(--lattice-border-width)` | `var(--lattice-border-width)` | `var(--lattice-border-width)` | the vertical/inline-end border a header or filter cell always draws, independent of `gridLines` (BACKLOG-0001582); a preset sets this to `0` for a divider-only look. An explicit `gridLines: 'vertical'\|'both'` config always wins for body cells — those read `--lattice-border-width` directly, so this token can never hide a host’s own request for vertical lines | MAY |
| `--lattice-focus-offset` | `-2px` | `-2px` | `-2px` | `-2px` | the focus ring’s inset/outset offset | leave |
| `--lattice-focus-width` | `2px` | `2px` | `3px` | `2px` | the focus ring’s thickness | MAY |
| `--lattice-hscroll-sign` | `-1` | `-1` | `-1` | `-1` | internal RTL horizontal-scroll direction flip | leave |
| `--lattice-icon-filter` | `url("data:image/svg+xml,…")` (an inline chevron mask; see the literal in `structure.css`) | `url("data:image/svg+xml,…")` (an inline chevron mask; see the literal in `structure.css`) | `url("data:image/svg+xml,…")` (an inline chevron mask; see the literal in `structure.css`) | `url("data:image/svg+xml,…")` (an inline chevron mask; see the literal in `structure.css`) | the built-in chevron icon’s mask shape (colour comes from `currentColor`/foreground) | leave |
| `--lattice-target-min` | `var(--lattice-icon-size)` | `var(--lattice-icon-size)` | `var(--lattice-icon-size)` | `var(--lattice-icon-size)` | minimum touch-target size floor (accessibility) | leave |
| `--lattice-presence-range-alpha` | `12%` | `12%` | `12%` | `12%` | a collaborator’s selected-range fill opacity | leave |

### Range/image geometry (`--lat-*`)

| Token | Default | Affects | Marking |
|---|---|---|---|
| `--lat-range-t` | `0px` | range-selection outline, top edge (state-driven: 0px/1px) | leave |
| `--lat-range-r` | `0px` | range-selection outline, right edge (state-driven: 0px/1px) | leave |
| `--lat-range-b` | `0px` | range-selection outline, bottom edge (state-driven: 0px/1px) | leave |
| `--lat-range-l` | `0px` | range-selection outline, left edge (state-driven: 0px/1px) | leave |
| `--lat-image-size` | `calc(var(--lattice-row-height) * 0.68)` | image cell rendered size, derived from row height × 0.68 | MAY |

### Fallback-only overrides (no declared default — the default is the fallback shown)

These 28 tokens are never declared with a value anywhere in the theme CSS: each is read once, via `var(--name, fallback)`, and the fallback shown is what renders until a preset sets the token. No JS ever writes them — confirmed against every `setProperty` call in `packages/dom/src`.

| Token | Default (the fallback) | Affects | Marking |
|---|---|---|---|
| `--lattice-accent-foreground` | `#fff` | text on a small accent-coloured chip where `--lattice-accent-contrast` is not appropriate | MAY |
| `--lattice-background-subtle` | `transparent` | a subtle full-row tint some renderers support | MAY |
| `--lattice-border` | `currentColor` | a generic border escape a custom cell renderer can key off | leave |
| `--lattice-cell-highlight` | `var(--lattice-flash-background)` | a cell highlight distinct from the change-flash colour | MAY |
| `--lattice-danger` | `#c0392b / #b91c1c / #b00020 (inconsistent — see note)` | an inline error/negative-delta text colour | MAY |
| `--lattice-success` | `#15803d` | an inline positive-delta text colour | MAY |
| `--lattice-warning` | `var(--lattice-foreground)` | an inline warning text colour | MAY |
| `--lattice-detail-active-background` | `transparent` | the active/expanded row-detail panel background | MAY |
| `--lattice-detail-background` | `var(--lattice-surface-alt, transparent)` | the row-detail panel background | MAY |
| `--lattice-detail-marker` | `var(--lattice-accent)` | the row-detail panel’s left marker bar | MAY |
| `--lattice-detail-marker-width` | `3px` | the row-detail panel’s left marker bar width | leave |
| `--lattice-detail-padding` | `var(--lattice-space, 4px)` | the row-detail panel’s inner padding | leave |
| `--lattice-focus-ring` | `var(--lattice-accent)` | an alternate focus indicator colour some controls read instead of `--lattice-focus-color` | MAY |
| `--lattice-fullwidth-background` | `var(--lattice-surface-alt, var(--lattice-background))` | a full-width row renderer’s background | MAY |
| `--lattice-group-background` | `var(--lattice-surface-alt, var(--lattice-surface))` | a group row’s background (no dedicated group-row colour otherwise — see override-scope note) | MAY |
| `--lattice-header-total-color` | `var(--lattice-foreground-muted, inherit)` | the totals row’s aggregate-function label colour | leave |
| `--lattice-header-total-size` | `0.78em` | the totals row’s aggregate-function label size | leave |
| `--lattice-hover-background` | `var(--lattice-surface)` | an alternate hover fill some renderers read instead of `--lattice-hovered-background` | MAY |
| `--lattice-indent` | `16px` | a raw pixel indent escape distinct from `--lattice-indent-size` | leave |
| `--lattice-muted` | `currentColor / inherit` | muted/secondary text in a few renderers, distinct from `--lattice-foreground-muted` | leave |
| `--lattice-muted-text` | `inherit` | muted/secondary text in the comment and presence panels | leave |
| `--lattice-pill-gap` | `4px` | gap between a pill and adjacent content | leave |
| `--lattice-redaction-filter` | `blur(5px) contrast(0.85)` | the CSS `filter` a redacted column’s cells render with (§12) | MAY |
| `--lattice-selection-background` | `var(--lattice-surface)` | an alternate selection fill some renderers read instead of `--lattice-selected-background` | MAY |
| `--lattice-shadow-overlay` | `0 8px 24px rgb(0 0 0 / 25%)` | a floating panel’s drop shadow, distinct from `--lattice-popup-shadow` | leave |
| `--lattice-sticky-bottom-height` | `0px` | reserved space above a sticky bottom row, when one is pinned | leave |
| `--lattice-sticky-top-height` | `0px` | reserved space below a sticky top row, when one is pinned | leave |
| `--lattice-surface-sunken` | `transparent` | an image cell’s background well behind a loaded/broken image | MAY |

### Grid-computed (fallback-only, JS-set — read, don’t set)

These 10 also have no declared default, but unlike the ones above, the grid’s own JS calls `style.setProperty` on them whenever the feature that needs them is active — an inline style always wins over anything a stylesheet sets, so a preset override only shows through while the feature is inactive. All ten are marked **leave**.

| Token | Fallback (inactive-feature value) | Affects | Set by |
|---|---|---|---|
| `--lattice-body-top` | `var(--lattice-header-measured, var(--lattice-header-height))` | measured header height, reserving body space | `packages/dom/src/renderer/renderer.js` |
| `--lattice-dock-left` | `0px` | a left-docked tool panel’s measured width | `packages/dom/src/toolpanelmount.js` |
| `--lattice-dock-right` | `0px` | a right-docked tool panel’s measured width | `packages/dom/src/toolpanelmount.js` |
| `--lattice-facet-height` | `0px` | the facet filter band’s measured height | `packages/dom/src/renderer/header.js` |
| `--lattice-grid-radius` | `0` | reflects `config.cornerRadius` onto the grid root | `packages/dom/src/renderer/renderer.js` |
| `--lattice-header-measured` | `var(--lattice-header-height)` | the header’s actually-measured height (vs. the geometry default) | `packages/dom/src/renderer/renderer.js` |
| `--lattice-hscroll-max` | `0px` | the maximum horizontal scroll distance, for the scroll-timeline animation | `packages/dom/src/renderer/renderer.js` |
| `--lattice-rowform-width` | `min(28rem, 100%) / min(32rem, ...)` | reflects `rowform.width` config, when set | `packages/dom/src/rowform.js` |
| `--lattice-status-height` | `0px` | the status bar’s measured height | `packages/dom/src/createGrid.js` |
| `--lattice-vscroll-gutter` | `0px` | reserved gutter width for a custom vertical scrollbar | `packages/dom/src/renderer/renderer.js` |

### Calendar viewer tokens (module-owned, fallback-only)

The calendar module (`modules/calendar`, BACKLOG-0001592, time grid BACKLOG-0001593) reads these names only from its own injected stylesheet — they are never declared in the theme CSS above, so they are not part of the machine-checked public-token list and a preset sets them only for closer fidelity. Every default derives from an existing grid token or a literal, and every one is **MAY**: `checkPresetCompleteness` never requires a preset edit for them.

| Token | Default (the fallback) | Affects |
|---|---|---|
| `--lattice-calendar-cell-min-height` | `120px` | a day cell's minimum height (cells grow with their cards) |
| `--lattice-calendar-header-bg` | `var(--lattice-header-bg, var(--lattice-background))` | the header toolbar background |
| `--lattice-calendar-header-fg` | `var(--lattice-foreground)` | the header toolbar text |
| `--lattice-calendar-today-bg` | `var(--lattice-selected-background, var(--lattice-range-background))` | today's cell background |
| `--lattice-calendar-dim-fg` | `var(--lattice-foreground-muted)` | dimmed leading/trailing days and the card time |
| `--lattice-calendar-card-radius` | `var(--lattice-radius-sm)` | a card's corner radius |
| `--lattice-calendar-accent` | `var(--lattice-accent)` | the card edge and the active header state colour |
| `--lattice-calendar-axis-width` | `56px` | the hour axis and header corner width |
| `--lattice-calendar-slot-height` | `48px` | the height of one time-grid slot |
| `--lattice-calendar-now-color` | `var(--lattice-calendar-accent, var(--lattice-accent))` | the now-indicator line |
| `--lattice-calendar-business-bg` | `var(--lattice-background-subtle)` | the business-hours shading |
| `--lattice-calendar-span-bg` | `var(--lattice-accent-soft)` | the multi-day span bar background |
| `--lattice-calendar-span-lane-height` | `22px` | the height of one span-bar lane in a day-grid week row (overlapping spans stack into lanes) |
| `--lattice-calendar-all-day-min-height` | `20px` | an all-day row cell's minimum height |

## Internal, off-contract

### `--lat-*` internal computed aliases

| Token | Value | Why it is not a theme token |
|---|---|---|
| `--lat-scrollbar-x` | `var(--lattice-scrollbar-size)` | reserved space for a bottom custom scrollbar, mirrors `--lattice-scrollbar-size` only when `data-scrollbars-x="custom"` (`packages/dom/src/theme/structure.css`) |
| `--lat-scrollbar-y` | `var(--lattice-scrollbar-size)` | reserved space for a right custom scrollbar, mirrors `--lattice-scrollbar-size` only when `data-scrollbars-y="custom"` (`packages/dom/src/theme/structure.css`) |

### `--lat-*` internal per-cell data

| Token | Carries | Set by |
|---|---|---|
| `--lat-bar-size` | a bar-decoration cell’s fill length | `packages/dom/src/cell/decoration.js` |
| `--lat-bar-start` | a bar-decoration cell’s fill start offset | `packages/dom/src/cell/decoration.js` |
| `--lat-facet-bar` | a facet histogram bar’s outline height | `packages/dom/src/facetband.js` |
| `--lat-facet-fill` | a facet histogram bar’s fill height | `packages/dom/src/facetband.js` |
| `--lat-indent` | a group row’s indent level | `packages/dom/src/cell/renderers/group.js` |
| `--lat-peer` | a collaborator’s presence colour on one cell | `packages/dom/src/presencepaint.js` |
| `--lat-progress-size` | a progress-decoration cell’s fill % | `packages/dom/src/cell/renderers/progress.js` |
| `--lat-rating-fill` | a rating cell/editor star’s fill % | `packages/dom/src/cell/renderers/rating.js, packages/dom/src/editors/rating.js` |
| `--lat-row-fill` | a full-width row renderer’s content width | `packages/dom/src/renderer/viewport.js` |
| `--lat-skeleton-width` | a loading-skeleton bar’s randomised width | `packages/dom/src/cell/renderers/skeleton.js` |
| `--lat-swatch` | a colour cell/editor’s swatch colour | `packages/dom/src/cell/renderers/colour.js, packages/dom/src/editors/colour.js` |

### Unprefixed internals

Around 50 more custom properties (`--bl`, `--br`, `--center`, `--dimmed`, `--dot`, `--edge`, `--fill`, `--find`, `--focused`, `--gauge`, `--hovered`, `--icon`, `--invalid`, ...) carry no `--lattice-`/`--lat-` prefix at all: corner-radius math, per-cell state flags a sibling rule reads, animation waypoints. Never documented individually, no naming guarantee, not part of this contract.

## Machine-checked token lists

The two fenced blocks below are what `test/theming-contract-doc.test.js` diffs against a fresh parse of `packages/dom/src/theme/*.css`. Edit the tables above; regenerate these two blocks to match (`node tools/gen-theming-doc.mjs` is not shipped — the lists are short enough to hand-edit and the test tells you immediately if a name is missing or stale).

<!-- contract:public-tokens -->
```text
--lat-image-size
--lat-range-b
--lat-range-l
--lat-range-r
--lat-range-t
--lattice-accent
--lattice-accent-contrast
--lattice-accent-foreground
--lattice-background
--lattice-background-subtle
--lattice-bar-height
--lattice-bar-min-width
--lattice-body-top
--lattice-border
--lattice-border-color
--lattice-border-strong
--lattice-border-width
--lattice-cell-border-width
--lattice-cell-highlight
--lattice-cell-padding-x
--lattice-cell-padding-y
--lattice-comment-mark
--lattice-comment-mark-unresolved
--lattice-comment-panel-bg
--lattice-comment-panel-width
--lattice-comment-size
--lattice-danger
--lattice-decoration-edge-width
--lattice-density-scale
--lattice-detail-active-background
--lattice-detail-background
--lattice-detail-marker
--lattice-detail-marker-width
--lattice-detail-padding
--lattice-dock-left
--lattice-dock-right
--lattice-dot-size
--lattice-facet-bar
--lattice-facet-bar-excluded
--lattice-facet-bar-null
--lattice-facet-bar-selected
--lattice-facet-height
--lattice-facet-track
--lattice-find-current
--lattice-find-match
--lattice-flash-background
--lattice-focus-color
--lattice-focus-offset
--lattice-focus-ring
--lattice-focus-width
--lattice-font-family
--lattice-font-mono
--lattice-font-size
--lattice-font-size-lg
--lattice-font-size-sm
--lattice-font-weight
--lattice-foreground
--lattice-foreground-muted
--lattice-fullwidth-background
--lattice-gap
--lattice-grid-radius
--lattice-group-background
--lattice-header-affordance-gap
--lattice-header-affordance-size
--lattice-header-font-size
--lattice-header-font-weight
--lattice-header-foreground
--lattice-header-height
--lattice-header-measured
--lattice-header-menu-clear
--lattice-header-menu-size
--lattice-header-total-color
--lattice-header-total-size
--lattice-hover-background
--lattice-hovered-background
--lattice-hscroll-max
--lattice-hscroll-sign
--lattice-icon-filter
--lattice-icon-size
--lattice-indent
--lattice-indent-size
--lattice-invalid-background
--lattice-invalid-border
--lattice-line-height
--lattice-link-color
--lattice-motion-duration
--lattice-motion-easing
--lattice-muted
--lattice-muted-text
--lattice-overlay-background
--lattice-peer-1
--lattice-peer-2
--lattice-peer-3
--lattice-peer-4
--lattice-peer-5
--lattice-peer-6
--lattice-peer-7
--lattice-peer-8
--lattice-pending-background
--lattice-pill-font-size
--lattice-pill-gap
--lattice-pill-padding-x
--lattice-pill-padding-y
--lattice-pinned-shadow
--lattice-pinned-shadow-end
--lattice-popup-shadow
--lattice-presence-range-alpha
--lattice-presentation-scale
--lattice-radius
--lattice-radius-pill
--lattice-radius-sm
--lattice-range-background
--lattice-range-border
--lattice-redaction-filter
--lattice-reverted-background
--lattice-row-height
--lattice-rowform-width
--lattice-scale
--lattice-scrollbar-radius
--lattice-scrollbar-size
--lattice-scrollbar-thumb
--lattice-scrollbar-thumb-active
--lattice-scrollbar-thumb-hover
--lattice-scrollbar-thumb-min
--lattice-scrollbar-track
--lattice-selected-background
--lattice-selected-foreground
--lattice-selection-background
--lattice-shadow-overlay
--lattice-skeleton-color
--lattice-skeleton-highlight
--lattice-space
--lattice-status-height
--lattice-sticky-bottom-height
--lattice-sticky-top-height
--lattice-success
--lattice-surface
--lattice-surface-alt
--lattice-surface-sunken
--lattice-target-min
--lattice-timeline-changed
--lattice-transition
--lattice-variant-accent-border
--lattice-variant-accent-fill
--lattice-variant-accent-solid
--lattice-variant-accent-text
--lattice-variant-danger-border
--lattice-variant-danger-fill
--lattice-variant-danger-solid
--lattice-variant-danger-text
--lattice-variant-info-border
--lattice-variant-info-fill
--lattice-variant-info-solid
--lattice-variant-info-text
--lattice-variant-neutral-border
--lattice-variant-neutral-fill
--lattice-variant-neutral-solid
--lattice-variant-neutral-text
--lattice-variant-none-border
--lattice-variant-none-fill
--lattice-variant-none-solid
--lattice-variant-none-text
--lattice-variant-success-border
--lattice-variant-success-fill
--lattice-variant-success-solid
--lattice-variant-success-text
--lattice-variant-warning-border
--lattice-variant-warning-fill
--lattice-variant-warning-solid
--lattice-variant-warning-text
--lattice-vscroll-gutter
--lattice-warning
```

<!-- contract:internal-tokens -->
```text
--lat-bar-size
--lat-bar-start
--lat-facet-bar
--lat-facet-fill
--lat-indent
--lat-peer
--lat-progress-size
--lat-rating-fill
--lat-row-fill
--lat-scrollbar-x
--lat-scrollbar-y
--lat-skeleton-width
--lat-swatch
```
