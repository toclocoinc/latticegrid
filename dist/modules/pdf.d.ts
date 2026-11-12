/*!
 * Lattice Grid 1.121.0, pdf module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
import type {
  Grid,
  PdfExportOptions,
} from '../lattice-grid.js';

/**
 * What `exportPdf` takes: a grid (`createGrid`), a
 * calendar (`createCalendar`), a Kanban board (`createKanban`) or a Gantt
 * (`createGantt`). Which one it is is read from the instance, never from an
 * option.
 */
export type PdfExportable = Grid
  | import('lattice-grid/modules/calendar').Calendar
  | import('lattice-grid/modules/kanban').Kanban
  | import('lattice-grid/modules/gantt').Gantt;
/**
 * Export a view as a paginated PDF with selectable text: a grid's current
 * view; a calendar's current month, week or day, a Kanban
 * board, or a Gantt's task table and timeline. pdf-lib is
 * the page's (`options.pdfLib` or the `PDFLib` global); the module bundles
 * none of it.
 */
export function exportPdf(view: PdfExportable, options?: PdfExportOptions): Promise<Blob>;
/**
 * {@link exportPdf}, then save the PDF as `options.fileName`. Where there is
 * no document (Node) the PDF is returned and nothing is saved.
 */
export function downloadPdf(view: PdfExportable, options?: PdfExportOptions): Promise<Blob>;
export default exportPdf;
