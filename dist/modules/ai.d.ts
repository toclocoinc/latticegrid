/*!
 * Lattice Grid 1.67.0, ai module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * The provider-agnostic model callback the host supplies.
 * The module never imports a provider SDK, reads a key, or makes a network
 * call — it builds this payload and awaits the host's reply. A host may wrap a
 * chat provider (`{ text }`), a completion (a bare string), a tool-calling turn
 * (`{ toolCalls }`), or a structured provider (`{ structured }`).
 */
type AIAsk = (payload: {
  /** The narrate-only system instruction. */
  system: string;
  /** The single user message: the facts block and the ask. */
  message: string;
  /** System and message joined, for a completion-shaped provider. */
  prompt: string;
  /** The running chat, including any tool results, for a chat-shaped provider. */
  messages: Array<{ role: string; content: string; [k: string]: unknown }>;
  /** The read-only tool definitions, present only on the tool-use path. */
  tools?: object[];
  /** The grid's generated schema (no row values). */
  schema?: unknown;
  /** An abort signal the host should honour. */
  signal?: AbortSignal;
}) => Promise<
  | string
  | { text?: string; content?: string; toolCalls?: object[]; structured?: unknown }
>;

/** A single computed figure a narrative is grounded on. */
interface AIFact {
  id: string;
  label: string;
  /** The raw numeric value, or null for a context-only fact. */
  value: number | null;
  /** The pre-formatted display string the model is told to use verbatim. */
  display: string;
  kind: string;
  colId?: string;
}

/**
 * A narrative target. `view` narrates the current filtered view; `column`
 * narrates one column's profile; `forecast` adds its projection; `kpi`/`chart`
 * narrate figures the caller passes through in `facts`; `risk` assembles a
 * project RISK SUMMARY from the separate Gantt / Kanban modules' public outputs.
 */
interface AITarget {
  kind?: 'view' | 'column' | 'forecast' | 'kpi' | 'chart' | 'risk';
  colId?: string;
  /** Forecast options, for `kind: 'forecast'`. */
  options?: object;
  /** Caller-supplied figures for a KPI/chart Explain, grounded like the rest. */
  facts?: Array<{ id?: string; label: string; value: unknown; display?: string; kind?: string; colId?: string }>;
  /**
   * For `kind: 'risk'`: a Gantt instance (from `createGantt`). Read duck-typed
   * for `earnedValue()` (SPI/CPI/variances) and `schedule` (critical path,
   * float). The AI bundle never imports the Gantt module.
   */
  gantt?: unknown;
  /**
   * For `kind: 'risk'`: a Kanban board (from `createKanban`). Read for its
   * `board.sla` monitor (breach / warning counts). The AI bundle never imports
   * the Kanban module.
   */
  board?: unknown;
  /** For `kind: 'risk'`: an SLA monitor, if not reached through `board`. */
  sla?: unknown;
  /** For `kind: 'risk'`: a precomputed `gantt.earnedValue()` result. */
  earnedValue?: object;
  /** For `kind: 'risk'`: a precomputed `gantt.schedule` result. */
  schedule?: object;
  /** For `kind: 'risk'`: precomputed SLA breach states. */
  breaches?: object[];
  /** For `kind: 'risk'`: precomputed SLA warning states. */
  warnings?: object[];
  /** For `kind: 'risk'`: options passed to `gantt.earnedValue()`. */
  evmOptions?: object;
  /**
   * For `kind: 'risk'`: expose the at-risk task NAMES (off by default — a risk
   * summary carries aggregates only unless the host opts in).
   */
  includeTaskNames?: boolean;
  /**
   * For `kind: 'risk'`: expose the money figures BAC/PV/EV/AC (off by default).
   */
  includeCost?: boolean;
  /** For `kind: 'risk'`: cap on named at-risk tasks (default 10). */
  maxTasks?: number;
}

/** The facts packet a narrative grounds on. */
interface AIFactsPacket {
  target: AITarget;
  facts: AIFact[];
  /** The numeric values seeding the reconciliation registry. */
  groundedValues: number[];
  meta: {
    kind: string; filtered: boolean; factCount: number; redacted?: boolean; colId?: string;
    /** For `kind: 'risk'`: which module sources resolved. */
    sources?: { schedule: boolean; earnedValue: boolean; sla: boolean };
    /** For `kind: 'risk'`: which opt-in exposures were honoured. */
    exposed?: { taskNames: boolean; cost: boolean };
  };
}

/**
 * The risk facts a board / Gantt risk summary grounds on,
 * from {@link buildRiskFacts}: the facts plus which module sources resolved and
 * which opt-in exposures (task names, cost) were honoured.
 */
interface AIRiskFacts {
  facts: AIFact[];
  meta: {
    kind: 'risk';
    sources: { schedule: boolean; earnedValue: boolean; sla: boolean };
    exposed: { taskNames: boolean; cost: boolean };
  };
}

/** The result of a narrative: reconciled prose plus what grounded and what did not. */
interface AINarrative {
  /** The narrative, with every ungrounded figure stripped (or flagged). */
  text: string;
  facts: AIFact[];
  /** The figures that reconciled against a computed value. */
  grounded: string[];
  /** The figures removed as ungrounded. */
  flagged: string[];
  packet: AIFactsPacket;
  /** How many ask() rounds ran (>1 only on the tool-use path). */
  rounds: number;
  mode: 'tools' | 'packet';
}

/** AI module configuration. */
interface AIConfig {
  /** The host's model callback. Falls back to the grid's `ai.ask` when omitted. */
  ask?: AIAsk;
  /**
   * Restricts which of the three DOM-mounting convenience methods are
   * allowed to mount: `'narrative'`/`'insights'` for `insights()`,
   * `'query'`/`'ask'` for `askBar()`, `'actor'` for `actorBar()`. All three
   * are allowed when `enable` is omitted. This does NOT gate the
   * programmatic API — `explain()`, `query()`, `propose()`, `facts()`,
   * `riskSummary()` and the rest of the controller always run regardless of
   * `enable` — because a host that wants no AI surface at all simply never
   * calls these methods.
   */
  enable?: string[];
  /**
   * Ask-your-data: apply a safe (read-only) query result without a confirm
   * step. Off by default — the resolved query is shown and waits for Apply.
   */
  autoApply?: boolean;
  /**
   * A Data Router instance; on applying a query the answer rows are fanned to
   * its attached viewers (grid + chart + KPI together) via `load()`.
   */
  router?: unknown;
  /** Budgets passed to the schema builder for ask-your-data. */
  schemaOptions?: object;
  /** Extra context passed through to `ask()`. */
  context?: unknown;
  /** Called with each ask-your-data result. */
  onQuery?: (result: AIQueryResult) => void;
  /** Called with each governed-actor proposal (Play C), before any approval. */
  onProposal?: (result: AIProposal) => void;
  /**
   * A Kanban board (from `createKanban`) the governed actor writes moves
   * through: an NL card move applies via the board's own `beforeMove` gate, never a kanban-specific write bypass.
   */
  board?: unknown;
  /** Cap on rows any tool result carries to `ask()`. */
  maxRows?: number;
  /** Columns whose values must never leave the browser. */
  redact?: string | string[] | ((colId: string) => boolean);
  /** Force tool-use on or off; auto-detected from how `ask` was supplied otherwise. */
  tools?: boolean;
  /** Locale for figure formatting. */
  locale?: string;
  /** Column cap for a view summary. */
  maxColumns?: number;
  /** What to do with an ungrounded figure: `'strip'` (default) or `'flag'`. */
  reconcile?: 'strip' | 'flag';
  /** An element to mount the insights panel into. */
  element?: HTMLElement;
  /** Called when a narrative is produced. */
  onNarrative?: (result: AINarrative) => void;
  /** Called when `ask()` errors; the grid stays usable. */
  onError?: (error: { error: unknown; target: AITarget }) => void;
}

/** The report from applying an ask-your-data query. */
interface AIApplyReport {
  ok: boolean;
  /** The action types that were applied. */
  applied: string[];
  /** Actions that threw while applying. */
  failed: Array<{ type: string; reason: string }>;
  /** Actions refused by the read-only gate — a mutation is never applied. */
  refused: Array<{ type: string; reason: string }>;
  /** How many answer rows were fanned to a router's viewers. */
  fannedOut: number;
}

/**
 * The result of an ask-your-data question: a validated,
 * READ-ONLY query spec — never rows — that the host reviews before applying.
 */
interface AIQueryResult {
  /** True when the spec is safe to apply: at least one read, nothing unsafe. */
  ok: boolean;
  /** The user's question. */
  question: string;
  /** The core plan (from `grid.ai.plan`). */
  plan: Record<string, unknown>;
  /** The read-only actions that will run — the validated query spec. */
  actions: object[];
  /** Actions refused as not read-only (a mutation the model asked for). */
  unsafe: Array<{ type: string; reason: string }>;
  /** Parts the core validator dropped (unknown column, bad operator, …). */
  rejected: Array<{ at: string; what: string; reason: string }>;
  /** The model's own one-line summary, if any. */
  explain: string;
  /** The validated query spec as data. */
  spec: { actions: object[] };
  /** The apply report once applied, or null. */
  applied: AIApplyReport | null;
  /** The resolved query in one human sentence, from the validated spec. */
  describe(): string;
  /** Apply the query (re-gated), fanning the answer to a router if configured. */
  apply(opts?: { router?: unknown; onResult?: (rows: object[]) => void }): AIApplyReport;
}

/** One before/after change in a governed-actor proposal. */
interface AIDiffEntry {
  /** The target row key. */
  key: string;
  /** A human label identifying the row (a name-like column, else the key). */
  rowLabel: string;
  /** The target column id. */
  colId: string;
  /** The column's title, for the diff header. */
  colTitle: string;
  /** The current stored value. */
  oldValue: unknown;
  /** The current value as shown (a lookup id mapped to its label). */
  oldDisplay: string;
  /** The proposed stored value (a label resolved to its option id). */
  newValue: unknown;
  /** The proposed value as shown. */
  newDisplay: string;
}

/**
 * A governed-actor proposal (Play C): the model's structured
 * edits, VALIDATED and resolved against the current view — never written until
 * a human approves. `apply()` writes ONLY through the grid's own gate.
 */
interface AIProposal {
  /** True when there is at least one applicable change and nothing needs a pick first. */
  ok: boolean;
  /** The user's instruction. */
  instruction: string;
  /** `'view'` (the filtered set, the default) or `'all'` (an opted-in widen). */
  scope: 'view' | 'all';
  /** How many rows the scope covers. */
  scopeCount: number;
  /** The scope in words, always stated in the confirm/diff. */
  scopeText: string;
  /** Whether any proposal was a bulk (`scope:'view'`) edit. */
  bulk: boolean;
  /** The before/after diff — exactly what would change. Nothing is written yet. */
  diff: AIDiffEntry[];
  /** Proposals refused before apply (unknown column, unknown label, bad type/range, no match). */
  rejected: Array<{ reason: string; [k: string]: unknown }>;
  /** Matches needing a human pick (>1 row for one phrase), with candidates. */
  ambiguous: Array<{ reason: string; candidates: Array<{ key: string; label: string }>; [k: string]: unknown }>;
  /** Named targets found only outside the view, offered for an opt-in widen. */
  outOfView: Array<{ reason: string; candidates: Array<{ key: string; label: string }>; [k: string]: unknown }>;
  /** Matches whose value already equals the ask (nothing to change). */
  noops: Array<{ reason: string; [k: string]: unknown }>;
  /** The apply report once applied, or null. */
  applied: AIProposalReport | null;
  /** The proposal in one human sentence, always stating the scope. */
  describe(): string;
  /** Apply the approved diff through the gate (`beforeEdit`, or `beforeMove` for a board). */
  apply(opts?: { board?: unknown }): Promise<AIProposalReport>;
}

/** The report from applying a governed-actor proposal. */
interface AIProposalReport {
  /** True when at least one edit landed. */
  ok: boolean;
  /** How many edits landed through the gate. */
  applied: number;
  /** How many edits were attempted. */
  requested: number;
  /** How many were stopped by a before-handler veto. */
  vetoed: number;
  /** Which gated path applied them: `'setCells'`, `'board.move'`, or `'none'`. */
  via: string;
}

/**
 * An AI controller over a live grid. It explains the grid's computed figures
 * (Play A), answers questions with validated read-only query specs (Play B),
 * and PROPOSES governed edits a human approves and the grid's own gate applies
 * (Play C). `grid.ai` (in core) is the complementary intent/plan skill layer
 * this consumes.
 */
interface AI {
  /** The mounted insights panel element, or null. */
  readonly el: HTMLElement | null;
  /** Whether a usable `ask()` is configured. */
  readonly ready: boolean;
  /** Produce a grounded, reconciled narrative for a target. */
  explain(target?: AITarget, opts?: object): Promise<AINarrative>;
  /** An alias for {@link AI.explain}. */
  narrate(target?: AITarget, opts?: object): Promise<AINarrative>;
  /**
   * Produce a grounded, reconciled board / Gantt RISK SUMMARY: a plain-language reading like "3 tasks at risk on the
   * critical path, SPI 0.67, 2 SLA breaches". A convenience over
   * `explain({ kind: 'risk', ... })`; the module sources go in `sources`
   * (`gantt`, `board`/`sla`, or precomputed outputs). Every figure runs through
   * the same reconciliation guard as {@link AI.explain}.
   */
  riskSummary(sources?: {
    gantt?: unknown; board?: unknown; sla?: unknown;
    earnedValue?: object; schedule?: object; breaches?: object[]; warnings?: object[];
    includeTaskNames?: boolean; includeCost?: boolean; maxTasks?: number; evmOptions?: object;
  }, opts?: object): Promise<AINarrative>;
  /** Mount (or re-target) the insights panel into an element. */
  insights(el?: HTMLElement, opts?: object): AI;
  /** Build an "Explain" button bound to a target. */
  attachExplain(target: AITarget, opts?: object): HTMLElement | null;
  /** Build the facts packet for a target without calling `ask()`. */
  facts(target?: AITarget, opts?: object): AIFactsPacket;
  /**
   * Ask-your-data: turn a question into a validated, read-only query spec, run
   * it in the engine, and (on apply) fan the answer to router-attached viewers.
   * Returns a result the host reviews; `autoApply` applies a safe read for you.
   */
  query(question: string, opts?: {
    autoApply?: boolean; router?: unknown; schemaOptions?: object;
    context?: unknown; tools?: boolean; signal?: AbortSignal;
    onResult?: (rows: object[]) => void;
  }): Promise<AIQueryResult>;
  /** Apply a reviewed query result (the confirm path); re-gated at the seam. */
  applyQuery(result: AIQueryResult, opts?: { router?: unknown; onResult?: (rows: object[]) => void }): AIApplyReport;
  /** Mount the ask-your-data bar (input, Ask, auto-apply toggle, preview, Apply/Discard). */
  askBar(el?: HTMLElement, opts?: object): AI;
  /**
   * Governed actor (Play C): ask the model for structured edit PROPOSALS over
   * the current view, validate and resolve them (label -> stored value, locate
   * a named row, reject unknown columns/labels/out-of-range), and return a
   * reviewable {@link AIProposal} with a before/after diff. NOTHING is written
   * — the model proposes; a human approves.
   */
  propose(instruction: string, opts?: {
    widen?: boolean; board?: unknown; schemaOptions?: object; maxRows?: number;
    context?: unknown; redact?: string | string[] | ((colId: string) => boolean);
    signal?: AbortSignal;
  }): Promise<AIProposal>;
  /**
   * Apply an approved proposal — the human-approval step. Writes ONLY through
   * the gate: a grid cell edit via `grid.edit.setCells({ origin: 'ai' })` (the
   * `beforeEdit` veto), a kanban move via `board.move({ origin: 'ai' })` (the
   * `beforeMove` veto). A vetoing host handler stops the write.
   */
  applyProposal(result: AIProposal, opts?: { board?: unknown }): Promise<AIProposalReport>;
  /**
   * Mount the governed-actor bar: an instruction input, Propose, a before/after
   * diff preview stating the scope, and Approve/Discard. Approve applies
   * through the gate.
   */
  actorBar(el?: HTMLElement, opts?: object): AI;
  on(name: 'narrative' | 'query' | 'proposal' | 'error' | string, fn: (payload: object) => void): () => void;
  off(name: string, fn: (payload: object) => void): void;
  destroy(): void;
}

/**
 * Create an AI narrative / insights controller over a live grid. The grid may
 * be headless or rendered; the module grounds every figure on the grid's
 * engine and calls only the host's `ask()`.
 */
export function createAI(grid: unknown, config?: AIConfig): AI;

/**
 * Build the RISK-SUMMARY facts packet from the separate
 * Gantt / Kanban modules' public outputs — SPI/CPI and variances from
 * `gantt.earnedValue()`, tasks at risk / on the critical path from
 * `gantt.schedule`, and SLA breaches from `board.sla`. Reads the module
 * instances (or their precomputed outputs) duck-typed off `target`; the AI
 * bundle imports neither module. This is the exact grounded set
 * `explain({ kind: 'risk' })` would use, exposed for preview and testing.
 */
export function buildRiskFacts(target: AITarget, opts?: {
  locale?: string; fmt?: (value: number) => string;
}): AIRiskFacts;

export default createAI;
