# The custom adapter contract

A pushdown adapter is the one thing a new back end has to write: an object
with a `capabilities` declaration and an `execute(query, request)` function.
Everything else — paging, abort, the residual filter/sort/quick pass, the
group and pivot planner, the write-back bridge — is `createPushdownSource`
(`packages/core/src/source/pushdown.js`), shared by every shipped adapter
(`restAdapter`, `duckdbAdapter`, `odataAdapter`, `graphqlAdapter`,
`splunkAdapter`, `clickhouseAdapter`, `elasticsearchAdapter`, `dfqlAdapter`)
and available to a hand-written one on the same terms. This page states that
contract precisely, field by field, from the shipped declarations in
`packages/core/src/types.d.ts`. A test
(`test/adapter-contract-doc.test.js`) parses those declarations and asserts
every field list below still matches them, so this page cannot silently go
stale the way hand-written API tables do — see `docs/INTEGRATION.md` for the
same discipline applied to the area-integration notes.

## 1. What you declare: `capabilities`

Everything defaults off (`NO_CAPABILITIES`). An adapter that declares nothing
still works — the source does all the work itself — so declaring capabilities
you do not actually implement is the one way to get wrong rows: it is a claim,
not a hint.

<!-- contract:PushdownCapabilities -->
```text
filter
operators
sort
quick
range
total
group
pivot
buckets
aggregates
mutate
```

- `filter`: `false | 'term' | 'flat' | 'tree'` — a single field and term, a
  flat conjunction, or a full nested tree.
- `operators`: the comparison operators the engine understands (`'eq'`,
  `'gt'`, ...); a condition whose operator is not in this set never pushes.
- `sort`: `false | 'single' | 'multi'` — sort is all-or-nothing (a partial
  push needs every row anyway to finish it, so it buys nothing).
- `quick`: whether the free-text quick filter can be pushed.
- `range`: whether the engine can return a window rather than the whole
  result.
- `total`: whether it can report the matching row count.
- `group`: whether it can answer one grouped level at a time
  (`executeGroupLevel` required) — all-or-nothing, like sort, because a group
  row counted over the wrong set is a wrong row, not a slow one.
- `pivot`: whether it can answer a pivoted level from grouped aggregates
  (`executePivotLevel` required) — no client-side fallback exists.
- `buckets`: spatial bucket kinds `source.aggregate()` may push as a
  `groupBy` key (e.g. `['grid']`).
- `aggregates`: the statistic names (by the grid's own names) the engine may
  be asked to reduce; anything else is computed client-side.
- `mutate`: `false | { append?, update?, delete?, returning? }` — the
  write-back contract (§4.1 in `CONTRACTS.md`). `false` (the default) is
  read-only by declaration.

## 2. What you receive: the request (`RemoteRequest`)

`execute(query, request)` is called with the **pushed half** of the plan —
only the part your declared capabilities said you could answer — as `query`,
and the **original, unplanned** request as `request` (carrying `signal` and,
in export mode, `stream`).

<!-- contract:RemoteRequest -->
```text
protocol
range
groupPath
groupValues
groupBy
totals
totalFns
pivotBy
pivotMode
filters
quick
sort
context
signal
where
```

Mapped onto the shapes hosts usually ask about:

- **filter tree** — `filters`: a `FilterSet` (a single condition or a nested
  `{ op: 'and'|'or', conditions: [...] }` group), already wired for the wire
  (relative date tokens resolved to absolute ranges).
- **sort** — `sort`: `SortEntry[]`, outermost first.
- **page / offset** — `range`: `{ start, end }`, half-open, row-indexed —
  there is no separate offset/limit pair, `range` is both.
- **groupBy / aggregates** — `groupBy` (`ColumnRef[]`) plus `totals`
  (`ColumnRef[]`, which columns want a subtotal) and `totalFns`
  (`Record<string, string>`, the named statistic each one reduces with, e.g.
  `{ amount: 'sum' }`). `groupPath` and the typed `groupValues` narrow a
  request to one grouped level; `pivotBy` / `pivotMode` are the pivot
  analogue.
- **count** — not a request field: it is answered on the result (`total`),
  gated by `capabilities.total`.
- **export flag** — not on `RemoteRequest` itself: `request.stream === true`
  on the second `execute` parameter marks export mode (§5 below).
- **abort** — `signal: AbortSignal`. Aborts when the grid no longer needs
  this block (superseded by a newer sort/filter/scroll, or the grid was
  destroyed). Reaching an already-aborted signal throws the signal's own
  abort reason before the adapter is ever called
  (`throwIfSuperseded`, GEO-7).
- `context`: whatever the grid's own `context` config holds (tenant id, auth
  token, locale), passed through untouched.

## 3. What you return: the answer

<!-- contract:execute-signature -->
```text
execute(query: RemoteRequest, request?: Partial<RemoteRequest> & { stream?: boolean }):
    Promise<{ rows: unknown[]; total?: number; pendingTotal?: Promise<number | null> }>;
```

- `rows`: the rows for the requested range (or, ungrouped/unpivoted, the
  window).
- `total`: the exact matching-set count. Omit it (do not invent one) when
  `capabilities.total` is `false` — the source and grid understand "unknown"
  as a real state (they discover the length as the user scrolls), and a
  guessed page-length total is a wrong number in the place a right one goes.
- `pendingTotal`: for a count that is expensive to compute alongside the
  page, a `Promise<number|null>` that resolves with the *exact* count once it
  is known (never an estimate). Ignored when `total` is present.

Grouped and pivoted levels are separate methods with their own return shapes:

- `executeGroupLevel(query, aggregates, request)` → `{ rows, total?, leaves?,
  matchCount?, grand? }`. Present only when `capabilities.group` is set.
- `executePivotLevel(query, aggregates, request)` → `{ rows, total?, leaves?,
  matchCount?, grand?, pivot: { axis?, cells } }`. Present only when
  `capabilities.pivot` is set.

## 4. `lastPlan().unpushed` honesty

`createPushdownSource(...).lastPlan()` returns the plan the *last* request
actually ran, or `null` before any request. `unpushed` is the list of request
parts that could not be pushed and were finished client-side — a subset of
`['filter', 'sort', 'quick', 'where', 'group', 'pivot']`. It is not a static
description of your declared capabilities: an adapter that declares `group`
without implementing `executeGroupLevel` is re-planned *without* grouping and
`'group'` appears in `unpushed` for that request, exactly as if `group` had
never been declared — a capability without the method behind it does not get
to look pushed.

`lastPlan()` also carries `pushed`, `residual`, `needsAll`, `full`,
`grouped`, `groupLevel`, `groupReason`, `pivoted`, `pivotReason`, and, when an
aggregate request was answered, `aggregates: { engine, client }` — which
statistics the engine computed and which fell to the client, each client one
with its own `reason`. When a total was deferred, `total: { deferred: true,
state, value }` replaces the plain number.

## 5. Refusal by name

Grouping and pivoting are all-or-nothing (§1): there is no client-side half
to fall back to for a pivot, so a pivot the adapter cannot answer is refused
outright rather than silently returning unpivoted rows. The rejected
`Promise` carries a stable error code:

<!-- contract:PIVOT_UNSUPPORTED -->
```text
pushdown:pivot-unsupported
```

`error.code === 'pushdown:pivot-unsupported'` and `error.reason` names which
condition failed (the same string `lastPlan().pivotReason` reports); the
remote source surfaces it as `source:error` and the grid shows it in its
error overlay. A refused **grouping** has no error to throw — a grid can
always fall back to grouping the rows it holds — so it is `unpushed` plus a
named `lastPlan().groupReason` and a developer warning instead.

## 6. Abort and supersede

Every `execute`/`executeGroupLevel`/`executePivotLevel`/`mutate` call
receives the request's `signal`. A request already superseded before the
adapter is ever reached throws the signal's own abort reason — a
`SupersededError` (`packages/core/src/source/abort.js`) when the grid raised
it: `.name === 'SupersededError'`, `.superseded === true`, `.key` the scope
key that was replaced. An adapter's own `fetch`/driver call should pass the
same signal through so an abandoned query is actually cancelled rather than
run to completion and discarded.

## 7. Export / stream mode

A predicate selection's "read every matching row" path
(`source.streamMatching()`, BACKLOG-0001546) marks each page it asks for with
`{ stream: true }` on the `request` (second) argument. An adapter that counts
alongside its rows may skip the count for a streamed page — re-scanning the
matching set once per page defeats the point of streaming it — and the
source ignores any `total` a streamed call returns. Nothing else changes:
the same `execute` method answers both an ordinary window and a streamed
page.

## 8. Write-back (mutations)

Declared per-kind on `capabilities.mutate` (§1); `false` (the default) is
read-only. A source asked to edit against an adapter that has not opted in
refuses loudly rather than silently dropping the write
(`source.pushdown.readonly.<name>`).

<!-- contract:MutationOp -->
```text
kind
rows
key
patch
keys
origin
requestId
```

`adapter.mutate(op: MutationOp, request?: RemoteRequest): Promise<MutationResult>`
is called once per mutation, `request` carrying the same `signal` `execute`
receives. `kind` (`'append' | 'update' | 'delete'`) decides which of the
other fields carry the payload — `patch` for an `update`, `rows` for an
`append`, `keys` for a `delete`.

<!-- contract:MutationResult -->
```text
ok
rows
keys
reason
conflict
```

`ok: false` (only an explicit `false`, anything else is success) reverts the
optimistic change and surfaces `reason` on `cell:reverted`. `rows` /
`keys` reconcile a `returning: 'row'` / `'key'` declaration; `conflict`
surfaces a last-write-wins divergence via `cell:conflict`.

## Reference implementations

`packages/core/src/source/adapters/rest.js` (`restAdapter`) is the shortest
worked example — a plain HTTP endpoint, most capabilities declared `false` by
default, `edit: true` opting into the mutation bridge. `duckdbAdapter`
(`packages/core/src/source/adapters/duckdb.js`) is the fullest one: filter,
sort, range, total, group and pivot all pushed into SQL. Start from whichever
is closer to your engine's own query shape.
