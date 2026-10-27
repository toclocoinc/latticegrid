/*!
 * Lattice Grid 1.114.3, recordeditor module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  RecordEditor,
  RecordEditorConfig,
} from '../lattice-grid.js';

/** The event names the editor's `on()` accepts, frozen. */
export const RECORD_EDITOR_EVENTS: readonly string[];

/** Create a record editor inside an element. */
export const createRecordEditor: (el: HTMLElement, config?: RecordEditorConfig) => RecordEditor;
export default createRecordEditor;
