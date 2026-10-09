/*!
 * Lattice Grid 1.92.0, chart-wordcloud module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
} from '../lattice-grid.js';

/**
 * The word-cloud extension type. Importing this module
 * registers `wordCloud`: words sized by frequency (a word column in `x` and a
 * value in `y`, or free text in `text`, tokenised), packed on a seeded spiral
 * without overlaps. A click filters the grid to the rows holding the word (or
 * selects them with `selection: true`); words that do not fit are counted in
 * `chart.provenance().dropped`.
 */
export function drawWordCloud(ctx: object): object;
/** The word-cloud binding: counts words off the grid's rows, tokenising a `text` column when asked. */
export function bindWordCloud(grid: Grid, spec: object): object;
/** Split free text into words (letters and digits; an apostrophe inside a word is kept). */
export function tokenise(text: string): string[];
/** Place words on an Archimedean spiral, biggest first, with no overlaps; returns the placed and the unplaced. */
export function layoutWords(words: { word: string; weight: number }[], plot: { left: number; top: number; right: number; bottom: number }, opts: { minSize: number; maxSize: number; rotate: unknown; seed: number }): { placed: object[]; unplaced: object[] };
/** A word's font size: the square root of its weight, mapped onto `minSize`..`maxSize`. */
export function sizeFor(weight: number, lo: number, hi: number, minSize: number, maxSize: number): number;
/** The filter that finds the rows holding a word. */
export function wordFilter(bound: object, spec: object, word: string): object;
/** A small seeded generator: the same seed, the same sequence. */
export function seededRandom(seed: number): () => number;
/** The built-in English stop-word list. */
export const STOP_WORDS: readonly string[];
export default drawWordCloud;
