# Chart codes reference

The codes the `geomap` chart joins data to shapes with. Generated from
`packages/modules/charts/geo.js`, which is the source of truth: if the two ever
disagree, the module is right and this file is stale.

## How the join works

A geomap reads two columns: one holding a code, one holding a value.

```js
createChart({
  grid,
  container: '#map',
  type: 'geomap',
  code: 'country',                        // the column holding ISO codes
  y: { col: 'revenue', fn: 'sum' },        // the measure
});
```

**Three code forms are accepted** and normalised to ISO 3166-1 alpha-2, because
a grid's data will hold whichever one its source used:

| Form | Example | Notes |
|---|---|---|
| alpha-2 | `GB` | ISO 3166-1 alpha-2. The canonical form here. |
| alpha-3 | `GBR` | ISO 3166-1 alpha-3. |
| numeric | `826` | ISO 3166-1 numeric. A string or a number; leading zeros are ignored. |

Codes are matched case-insensitively and trimmed, so `gb`, `GB ` and `Gb` are
one country. Anything that is not a code, a country *name*, an internal
identifier, an empty cell: is not guessed at. Those rows are counted and the
count is drawn on the map, because a map quietly missing half its data looks
exactly like a map of a world where half the data is zero.

## Continents

Two-letter codes, following the UN geoscheme. A value carrying a continent code
lands on that continent directly; a value carrying a *country* code lands on the
continent that country belongs to, so a grid of country data needs no second
column to produce a continent map.

| Code | Continent |
|---|---|
| `AF` | Africa |
| `AN` | Antarctica |
| `AS` | Asia |
| `EU` | Europe |
| `NA` | North America |
| `OC` | Oceania |
| `SA` | South America |

**Two codes are ambiguous.** `NA` is both North America and Namibia, and `AS` is
both Asia and American Samoa. On a continent map the continent reading wins: a
column of two-letter codes containing `NA` a hundred times is not a hundred rows
about Namibia, and reading it as such is the more damaging mistake. A grid that
genuinely means Namibia should use `NAM` or `516`.

## What ships, and what does not

**Continent outlines ship** with the module: seven coarse polygons, a few
hundred bytes. They are *schematic, not cartographic*: recognisable, the right
shape for "which continent is biggest", and not a basemap. Nothing should be
measured off them.

**Country outlines ship as optional packs** (1.63). A geometry pack is a module a
page imports only if it draws that map, so the charts bundle carries none of
them and the grid still fetches nothing at runtime. Each is TopoJSON — quantised
and delta-encoded — generated from a published public source by
`tools/build-geo-packs.mjs`, and each carries its own source URL, version,
retrieval date, licence and the attribution line that licence requires.

| Module | Regions | Source | Licence | Size (gz) |
|---|---|---|---|---|
| `modules/geo-world-110m` | 177 countries | Natural Earth 1:110m Admin 0, via world-atlas | Public domain | 39 KB |
| `modules/geo-world-50m` | 241 countries | Natural Earth 1:50m Admin 0, via world-atlas | Public domain | 225 KB |
| `modules/geo-us-states` | 50 states + DC | US Census, via us-atlas | Public domain | 36 KB |
| `modules/geo-europe-nuts` | NUTS levels 0–2 | Eurostat GISCO NUTS 2021 1:20m | Free re-use **with attribution** | 95 KB |
| `modules/geo-uk` | 9 regions, 361 local authorities, 650 constituencies | ONS Open Geography (BGC) | **OGL v3.0** | 292 KB |

Two of the five require an attribution line, which the pack carries and the map
renders: GISCO asks for `© EuroGeographics for the administrative boundaries`,
and the ONS for `Contains OS data © Crown copyright and database right 2026;
Source: Office for National Statistics licensed under the Open Government
Licence v.3.0`. The other three are public domain and ask for nothing.

```js
import { pack } from '@toclocoinc/lattice-grid/modules/geo-world-110m';

createChart({ grid, container: '#map', type: 'geomap', code: 'iso', y: 'revenue',
  shapes: pack });
```

Two things the data does rather than we do: Natural Earth at 1:110m omits the
micro-states (Singapore, Malta, Monaco have no outline at that scale), so bind
country-level data to the 50m pack where those matter; and `geo-us-states`
places Alaska and Hawaii at their true longitudes rather than in an Albers-USA
composite's insets, so a map of all 51 spans the Pacific. The five US
territories are left out of that pack for the same reason.

**A host's own shapes still work.** That is a size decision too: a usable world at
country resolution is several hundred kilobytes of path data, larger than the
whole charts module, and it would be paid for by every page that draws a bar
chart. A country map is drawn from shapes the host supplies, at whatever
resolution that host actually needs:

```js
// GeoJSON, a FeatureCollection or a single feature. Projected for you.
createChart({
  grid, container: '#map', type: 'geomap',
  code: 'country', y: 'revenue',
  shapes: worldGeoJson,
  codeProperty: 'iso_a2',        // which feature property carries the code
});

// Or ready-made SVG paths, already in the plot's coordinates. The escape hatch
// for a host with its own projection.
createChart({
  grid, container: '#map', type: 'geomap',
  code: 'country', y: 'revenue',
  shapes: { GB: 'M…Z', FR: 'M…Z' },
});
```

Supplying shapes switches the map from continents to countries: the regions
drawn are the ones supplied, and a value whose code is not among them is
reported as unplaced rather than rolled up.

## The projection

A map names its projection, and a pack declares the right one for itself, so
`shapes: pack` alone draws a sensible map. `projection` overrides it and
`projectionOptions` carries `parallels` and `centre` to the two that take
them. The drawn geometry is **fitted** to the panel, so a map of one country
fills its box rather than sitting inside the whole globe's.

| Name | What it is | Use it for |
|---|---|---|
| `equalEarth` | Equal-area (Šavrič, Patterson & Jenny 2018) | A world map — the default |
| `robinson` | Compromise, tabulated | A world map where the poles matter more than area |
| `mercator` | Conformal, cut at ±85.05° | Matching a web-map basemap |
| `albers` | Conic equal-area, two standard parallels | A country or continent in the mid-latitudes |
| `transverseMercator` | Conformal about a central meridian | A tall, narrow country: the UK through 2°W |
| `equirectangular` | Longitude and latitude onto x and y | Back-compatibility with maps drawn before 1.63 |

A ring that crosses the antimeridian — Russia, Fiji, the Chathams — is split
there before it is projected, so it draws as the parts it is rather than as a
band across the map. Antarctica is cropped until it carries a value, by the
country code `AQ` as well as the continent code `AN`.

### Without a pack

Equirectangular: longitude and latitude map linearly onto x and y. The least
arithmetic and the most distortion at the poles, which is the right trade for
shading regions by value: nothing here measures area, and a reader comparing
Greenland with Africa by eye is misled by every rectangular projection equally.
Anything better belongs in the host's own GeoJSON, projected before it arrives.

The map keeps its 2:1 proportions and is centred in the plot, pillarboxed in a
wide panel, letterboxed in a tall one: rather than being stretched to fill.

## Colour

Values are shaded with a sequential ramp: monotone lightness, so darker always
means larger. Pass `diverging: true` for a measure with a meaningful midpoint,
profit and loss, change against a baseline, which centres the ramp on **zero**
rather than on the middle of the data, because a neutral colour at the mean
claims the mean is neutral.

A region with no data is left in the empty colour rather than the ramp's low
end: "no reading" and "the smallest reading" are different facts and must not
share a shade. Over a fitted geometry pack the ramp also stays clear of its own
palest sixth, so the *lowest real reading* does not fall close enough to that
empty tone to read as the same thing — a heatmap's ramp is unaffected; its pale
end is the intended bottom of its own scale.

## Rendering and interaction (1.63)

A region's stroke comes from `--lattice-chart-map-stroke` (falling back to the
grid-line token), drawn with `vector-effect: non-scaling-stroke` so zooming in
does not fatten it. `--lattice-chart-empty` is the fill a region with no
reading takes.

```css
.my-app { --lattice-chart-map-stroke: #b0b8bf; }
```

**`graticule`** draws a lon/lat reference grid under the regions, only over a
fitted geometry pack:

```js
createChart({ grid, container: '#map', type: 'geomap', code: 'iso', y: 'sales',
  shapes: pack, graticule: true });          // every 30°, or { step: 10 }
```

**`labels: true`** names the regions that carry a reading — largest value
first, so on a crowded map the labels that survive a collision are the ones
worth having. Off by default, like every other chart's data labels, and only
over a fitted pack: the schematic continents already name themselves in the
legend and the tooltip.

**A pack's attribution** — the licence line `geo-europe-nuts` and `geo-uk`
require — is drawn under the map automatically; the three public-domain packs
draw none.

**The panel's height follows its width** when a host does not fix one: the
plot reserves an `aspect-ratio` from the geometry's own natural shape, so a
`width: 480px` container with no height gets a box shaped like the map rather
than however tall the surrounding layout happened to leave it.

**Pan, wheel-zoom and reset** work over a fitted pack, by pointer and by
keyboard: drag to pan, wheel to zoom, Shift+arrow to pan from the keyboard,
`+`/`-` to zoom, `0` to reset. Plain arrow keys are left alone — they move
keyboard focus between regions, the same roving-tabindex behaviour every
Lattice chart's marks have. Zoom is centred on the map's own fitted view
rather than on the pointer: panning and zooming need no projection's inverse
this way, and none of the six projections below has one written.

### One example per pack

```js
import { pack as world } from '@toclocoinc/lattice-grid/modules/geo-world-110m';
createChart({ grid, container: '#map', type: 'geomap', code: 'iso', y: 'sales',
  shapes: world });                          // Equal Earth, the pack's own default

import { pack as world50 } from '@toclocoinc/lattice-grid/modules/geo-world-50m';
createChart({ grid, container: '#map', type: 'geomap', code: 'iso', y: 'sales',
  shapes: world50 });                        // adds the micro-states 110m omits

import { pack as us } from '@toclocoinc/lattice-grid/modules/geo-us-states';
createChart({ grid, container: '#map', type: 'geomap', code: 'state', y: 'sales',
  shapes: us });                             // Albers; joins FIPS, USPS or ISO

import { pack as nuts } from '@toclocoinc/lattice-grid/modules/geo-europe-nuts';
createChart({ grid, container: '#map', type: 'geomap', code: 'region', y: 'sales',
  shapes: nuts });                           // NUTS 0-2 in one pack; joins by NUTS id

import { pack as uk } from '@toclocoinc/lattice-grid/modules/geo-uk';
createChart({ grid, container: '#map', type: 'geomap', code: 'authority', y: 'sales',
  shapes: uk, layer: 'local-authorities' }); // regions | local-authorities | constituencies
```

### Against a bubble map or a hexbin map

`chart-bubblemap` and `chart-hexmap` take `shapes` too (1.63): the same pack, the
same projection, the outlines drawn faintly underneath for context. Without
`shapes`, both are unchanged — the points' own bounding box, scaled to the plot.

```js
import '@toclocoinc/lattice-grid/modules/chart-bubblemap';
import { pack as us } from '@toclocoinc/lattice-grid/modules/geo-us-states';
createChart({ grid, container: '#map', type: 'bubblemap', lon: 'lng', lat: 'lat',
  size: 'sales', shapes: us });
```

---

## Country codes

Grouped by the continent each lands on.

### Africa: `AF`

| alpha-2 | alpha-3 | numeric |
|---|---|---|
| `AO` | `AGO` | `24` |
| `BF` | `BFA` |: |
| `BI` | `BDI` | `108` |
| `BJ` | `BEN` | `204` |
| `BW` | `BWA` | `72` |
| `CD` | `COD` | `180` |
| `CF` | `CAF` | `140` |
| `CG` | `COG` | `178` |
| `CI` | `CIV` | `384` |
| `CM` | `CMR` | `120` |
| `CV` | `CPV` | `132` |
| `DJ` | `DJI` | `262` |
| `DZ` | `DZA` | `12` |
| `EG` | `EGY` | `818` |
| `ER` | `ERI` | `232` |
| `ET` | `ETH` | `231` |
| `GA` | `GAB` | `266` |
| `GH` | `GHA` | `288` |
| `GM` | `GMB` | `270` |
| `GN` | `GIN` | `324` |
| `GQ` | `GNQ` | `226` |
| `GW` | `GNB` | `624` |
| `KE` | `KEN` | `404` |
| `KM` | `COM` | `174` |
| `LR` | `LBR` | `430` |
| `LS` | `LSO` | `426` |
| `LY` | `LBY` | `434` |
| `MA` | `MAR` | `504` |
| `MG` | `MDG` | `450` |
| `ML` | `MLI` | `466` |
| `MR` | `MRT` | `478` |
| `MU` | `MUS` | `480` |
| `MW` | `MWI` | `454` |
| `MZ` | `MOZ` | `508` |
| `NA` | `NAM` | `516` |
| `NE` | `NER` | `562` |
| `NG` | `NGA` | `566` |
| `RE` |: |: |
| `RW` | `RWA` | `646` |
| `SC` | `SYC` | `690` |
| `SD` | `SDN` | `729` |
| `SL` | `SLE` | `694` |
| `SN` | `SEN` | `686` |
| `SO` | `SOM` | `706` |
| `SS` | `SSD` | `728` |
| `ST` | `STP` |: |
| `SZ` | `SWZ` | `748` |
| `TD` | `TCD` | `148` |
| `TG` | `TGO` | `768` |
| `TN` | `TUN` | `788` |
| `TZ` | `TZA` | `834` |
| `UG` | `UGA` | `800` |
| `YT` |: |: |
| `ZA` | `ZAF` | `710` |
| `ZM` | `ZMB` | `894` |
| `ZW` | `ZWE` | `716` |

### Antarctica: `AN`

| alpha-2 | alpha-3 | numeric |
|---|---|---|
| `AQ` |: |: |

### Asia: `AS`

| alpha-2 | alpha-3 | numeric |
|---|---|---|
| `AE` | `ARE` | `784` |
| `AF` | `AFG` | `4` |
| `AM` | `ARM` | `51` |
| `AZ` | `AZE` |: |
| `BD` | `BGD` | `50` |
| `BH` | `BHR` | `48` |
| `BN` | `BRN` | `96` |
| `BT` | `BTN` | `64` |
| `CN` | `CHN` | `156` |
| `CY` | `CYP` | `196` |
| `GE` | `GEO` | `268` |
| `HK` | `HKG` | `344` |
| `ID` | `IDN` | `360` |
| `IL` | `ISR` | `376` |
| `IN` | `IND` | `356` |
| `IQ` | `IRQ` | `368` |
| `IR` | `IRN` | `364` |
| `JO` | `JOR` | `400` |
| `JP` | `JPN` | `392` |
| `KG` | `KGZ` | `417` |
| `KH` | `KHM` | `116` |
| `KP` | `PRK` | `408` |
| `KR` | `KOR` | `410` |
| `KW` | `KWT` | `414` |
| `KZ` | `KAZ` | `398` |
| `LA` | `LAO` | `418` |
| `LB` | `LBN` | `422` |
| `LK` | `LKA` | `144` |
| `MM` | `MMR` | `104` |
| `MN` | `MNG` | `496` |
| `MO` |: |: |
| `MV` | `MDV` | `462` |
| `MY` | `MYS` | `458` |
| `NP` | `NPL` | `524` |
| `OM` | `OMN` | `512` |
| `PH` | `PHL` | `608` |
| `PK` | `PAK` | `586` |
| `PS` | `PSE` |: |
| `QA` | `QAT` | `634` |
| `SA` | `SAU` | `682` |
| `SG` | `SGP` | `702` |
| `SY` | `SYR` | `760` |
| `TH` | `THA` | `764` |
| `TJ` | `TJK` | `762` |
| `TL` | `TLS` | `626` |
| `TM` | `TKM` | `795` |
| `TR` | `TUR` | `792` |
| `TW` | `TWN` |: |
| `UZ` | `UZB` | `860` |
| `VN` | `VNM` | `704` |
| `YE` | `YEM` | `887` |

### Europe: `EU`

| alpha-2 | alpha-3 | numeric |
|---|---|---|
| `AD` | `AND` | `20` |
| `AL` | `ALB` | `8` |
| `AT` | `AUT` | `40` |
| `AX` |: |: |
| `BA` | `BIH` | `70` |
| `BE` | `BEL` | `56` |
| `BG` | `BGR` | `100` |
| `BY` | `BLR` | `112` |
| `CH` | `CHE` | `756` |
| `CZ` | `CZE` | `203` |
| `DE` | `DEU` | `276` |
| `DK` | `DNK` | `208` |
| `EE` | `EST` | `233` |
| `ES` | `ESP` | `724` |
| `FI` | `FIN` | `246` |
| `FO` |: |: |
| `FR` | `FRA` | `250` |
| `GB` | `GBR` | `826` |
| `GG` |: |: |
| `GI` |: |: |
| `GR` | `GRC` | `300` |
| `HR` | `HRV` | `191` |
| `HU` | `HUN` | `348` |
| `IE` | `IRL` | `372` |
| `IM` |: |: |
| `IS` | `ISL` | `352` |
| `IT` | `ITA` | `380` |
| `JE` |: |: |
| `LI` | `LIE` | `438` |
| `LT` | `LTU` | `440` |
| `LU` | `LUX` | `442` |
| `LV` | `LVA` | `428` |
| `MC` | `MCO` |: |
| `MD` | `MDA` | `498` |
| `ME` | `MNE` | `499` |
| `MK` | `MKD` | `807` |
| `MT` | `MLT` | `470` |
| `NL` | `NLD` | `528` |
| `NO` | `NOR` | `578` |
| `PL` | `POL` | `616` |
| `PT` | `PRT` | `620` |
| `RO` | `ROU` | `642` |
| `RS` | `SRB` | `688` |
| `RU` | `RUS` | `643` |
| `SE` | `SWE` | `752` |
| `SI` | `SVN` | `705` |
| `SK` | `SVK` | `703` |
| `SM` | `SMR` |: |
| `UA` | `UKR` | `804` |
| `VA` |: |: |

### North America: `NA`

| alpha-2 | alpha-3 | numeric |
|---|---|---|
| `AG` |: |: |
| `AI` |: |: |
| `AW` |: |: |
| `BB` | `BRB` | `52` |
| `BM` |: |: |
| `BS` | `BHS` | `44` |
| `BZ` | `BLZ` | `84` |
| `CA` | `CAN` | `124` |
| `CR` | `CRI` | `188` |
| `CU` | `CUB` | `192` |
| `DM` | `DMA` | `212` |
| `DO` | `DOM` | `214` |
| `GD` |: |: |
| `GL` | `GRL` | `304` |
| `GP` |: |: |
| `GT` | `GTM` | `320` |
| `HN` | `HND` | `340` |
| `HT` | `HTI` | `332` |
| `JM` | `JAM` | `388` |
| `KN` | `KNA` |: |
| `KY` |: |: |
| `LC` | `LCA` |: |
| `MQ` |: |: |
| `MX` | `MEX` | `484` |
| `NI` | `NIC` | `558` |
| `PA` | `PAN` | `591` |
| `PM` |: |: |
| `PR` | `PRI` | `630` |
| `SV` | `SLV` | `222` |
| `TC` |: |: |
| `TT` | `TTO` | `780` |
| `US` | `USA` | `840` |
| `VC` | `VCT` |: |
| `VG` |: |: |
| `VI` |: |: |

### Oceania: `OC`

| alpha-2 | alpha-3 | numeric |
|---|---|---|
| `AS` |: |: |
| `AU` | `AUS` | `36` |
| `FJ` | `FJI` |: |
| `FM` | `FSM` |: |
| `GU` |: |: |
| `KI` | `KIR` |: |
| `MH` | `MHL` |: |
| `NC` |: |: |
| `NR` | `NRU` | `520` |
| `NZ` | `NZL` | `554` |
| `PF` |: |: |
| `PG` | `PNG` | `598` |
| `PW` | `PLW` | `585` |
| `SB` | `SLB` | `90` |
| `TO` | `TON` | `776` |
| `TV` | `TUV` | `798` |
| `VU` | `VUT` | `548` |
| `WS` | `WSM` | `882` |

### South America: `SA`

| alpha-2 | alpha-3 | numeric |
|---|---|---|
| `AR` | `ARG` | `32` |
| `BO` | `BOL` | `68` |
| `BR` | `BRA` | `76` |
| `CL` | `CHL` | `152` |
| `CO` | `COL` | `170` |
| `EC` | `ECU` | `218` |
| `FK` |: |: |
| `GF` |: |: |
| `GY` | `GUY` | `328` |
| `PE` | `PER` | `604` |
| `PY` | `PRY` | `600` |
| `SR` | `SUR` | `740` |
| `UY` | `URY` | `858` |
| `VE` | `VEN` | `862` |
