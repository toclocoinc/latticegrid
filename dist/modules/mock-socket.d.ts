/*!
 * Lattice Grid 1.68.1, mock-socket module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/** One record on a feed: any object. Its partition comes from a property and its identity from `rowKey`. */
type FeedRow = Record<string, unknown>;

/** One change in a delta batch, in the shape the data router applies. */
interface FeedChange { op: 'upsert' | 'delete'; row: FeedRow }

/**
 * A message on the wire. A snapshot carries the full opening set; a delta
 * carries the changes since. The reader parses `event.data` and switches on
 * `kind`, exactly as against a real feed that framed its messages the same way.
 */
interface FeedMessage {
  /**
   * Whether this message opens the feed with a full set of rows
   * (`'snapshot'`, which the feed yields first) or carries changes to apply
   * to what is already there (`'delta'`, every message after it).
   */
  kind: 'snapshot' | 'delta';
  /** Present on a snapshot: the full opening set of rows. */
  rows?: FeedRow[];
  /** Present on a delta: the changes to apply. */
  changes?: FeedChange[];
}

/** A feed: any iterator that yields a snapshot first, then deltas forever. */
type Feed = Iterator<FeedMessage>;

/**
 * A serverless stand-in for a live `WebSocket`. It presents the same surface
 * as the browser's `WebSocket` — `readyState` and the state constants,
 * `onopen`/`onmessage`/`onclose`/`onerror`, `addEventListener`, `send` and
 * `close` — so the code that reads it does not change when it is swapped for a
 * real socket. It opens after a short delay, emits the feed's first value as a
 * snapshot, then pumps one value per tick as a delta.
 */
export class MockWebSocket {
  static readonly CONNECTING: 0;
  static readonly OPEN: 1;
  static readonly CLOSING: 2;
  static readonly CLOSED: 3;
  readonly CONNECTING: 0;
  readonly OPEN: 1;
  readonly CLOSING: 2;
  readonly CLOSED: 3;
  readyState: number;
  url: string;
  onopen: ((event: { type: string }) => void) | null;
  onmessage: ((event: { type: string; data: string }) => void) | null;
  onclose: ((event: { type: string; code: number; reason: string; wasClean: boolean }) => void) | null;
  onerror: ((event: { type: string; error: unknown }) => void) | null;
  /**
   * @param init the feed and its timing: `feed` (snapshot first, then deltas);
   *   `rate` ms between deltas (default 1000); `jitter` random plus-or-minus ms
   *   per gap (default 0); `seed` for that jitter (default 1); `snapshotDelay`
   *   ms before opening (default 60); `pauseWhenHidden` stops while the tab is
   *   hidden (default true); `url` a cosmetic address.
   */
  constructor(init: {
    feed: Feed;
    rate?: number;
    jitter?: number;
    seed?: number;
    snapshotDelay?: number;
    pauseWhenHidden?: boolean;
    url?: string;
  });
  addEventListener(type: string, fn: (event: unknown) => void): void;
  removeEventListener(type: string, fn: (event: unknown) => void): void;
  /** A real socket sends upstream; here it is accepted and ignored. */
  send(data?: unknown): void;
  /** Stop the feed until `resume()`; the socket stays open (a demo/test affordance). */
  pause(): void;
  /** Resume a paused feed. */
  resume(): void;
  /** Close the socket, stop the feed and emit a clean `close`. */
  close(): void;
}

/**
 * mulberry32: a small seeded pseudo-random generator, so a custom feed can be
 * seeded the same way the shipped ones are. The same seed yields the same
 * sequence of values in `[0, 1)`.
 */
export function rng(seed: number): () => number;

/**
 * A mixed operations feed — orders, shipments and incidents across three
 * regions plus a throughput rollup — the Data Router tutorial partitions
 * across several grids and a chart from one source. Yields a snapshot, then
 * deltas forever. Seedable for a repeatable stream.
 */
export function opsFeed(options?: {
  seed?: number;
  orders?: number;
  shipments?: number;
  incidents?: number;
  batch?: number;
}): Generator<FeedMessage>;

/**
 * A market-data feed: instruments whose prices random-walk each tick, each
 * record carrying `type: 'price'`, `symbol`, `last`, `chg` and a bid/ask. The
 * price/random-walk feed behind the trading-terminal tutorial. Yields a
 * snapshot, then deltas forever. Seedable for a repeatable stream.
 */
export function priceFeed(options?: {
  seed?: number;
  symbols?: { symbol: string; last: number }[];
  move?: number;
  batch?: number;
  spread?: number;
}): Generator<FeedMessage>;

export default MockWebSocket;
