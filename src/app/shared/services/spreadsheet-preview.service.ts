/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';

/** One sheet reduced to display strings, already clipped to the preview caps. */
export interface SpreadsheetSheet {
  name: string;
  rows: string[][];
  /** Rows the sheet holds beyond the ones included here. */
  hiddenRows: number;
  /** Columns the sheet holds beyond the ones included here. */
  hiddenColumns: number;
}

export interface SpreadsheetPreview {
  sheets: SpreadsheetSheet[];
  /** True when any sheet had rows or columns clipped, so the view can say so. */
  truncated: boolean;
}

/**
 * A preview is a glance at the data, not a spreadsheet application. These caps keep the dialog from
 * building a six-figure-cell table — which locks the main thread and scrolls uselessly — while
 * still covering the great majority of documents uploaded against a client or a loan.
 */
export const MAX_PREVIEW_ROWS = 200;
export const MAX_PREVIEW_COLUMNS = 50;

/** Relationship types that point at comment parts, matched against the type URL the reader parses. */
const COMMENT_RELATIONSHIP_TYPE = /\/(?:comments|vmlDrawing)$/i;

@Injectable({
  providedIn: 'root'
})
export class SpreadsheetPreviewService {
  /**
   * Read a spreadsheet into display strings.
   *
   * CSV is parsed here rather than handed to the workbook reader: it is a text format, so parsing
   * it directly avoids pulling the (large) xlsx reader into the page for a file that does not need
   * it.
   */
  async load(blob: Blob, fileName?: string): Promise<SpreadsheetPreview> {
    if (this.isCsv(blob, fileName)) {
      return this.fromCsv(await blob.text());
    }
    return this.fromWorkbook(await blob.arrayBuffer());
  }

  private isCsv(blob: Blob, fileName?: string): boolean {
    const extension = (fileName || '').split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      return true;
    }
    if (extension === 'xlsx') {
      return false;
    }
    return (blob.type || '').toLowerCase().includes('csv');
  }

  private fromCsv(text: string): SpreadsheetPreview {
    const sheet = this.toSheet('CSV', this.parseCsv(text));
    return { sheets: [sheet], truncated: sheet.hiddenRows > 0 || sheet.hiddenColumns > 0 };
  }

  /**
   * The xlsx reader is loaded on demand. It is by far the heaviest thing this feature touches, and
   * most visits to a documents tab never open a spreadsheet, so it must not sit in the page's
   * initial payload.
   */
  private async fromWorkbook(buffer: ArrayBuffer): Promise<SpreadsheetPreview> {
    const module: any = await import('exceljs');
    const excel = module?.Workbook ? module : module?.default;
    if (!excel?.Workbook) {
      throw new Error('Spreadsheet reader unavailable.');
    }

    const workbook = new excel.Workbook();
    await this.loadTolerantly(workbook, buffer);

    const sheets = (workbook.worksheets || []).map((worksheet: any) =>
      this.toSheet(worksheet.name, this.readWorksheetRows(worksheet))
    );
    return {
      sheets,
      truncated: sheets.some((sheet: SpreadsheetSheet) => sheet.hiddenRows > 0 || sheet.hiddenColumns > 0)
    };
  }

  /**
   * Load the workbook, surviving the comment relationships that real-world files carry.
   *
   * While reconciling a workbook the reader dereferences each worksheet's `comments` relationship
   * (and the `vmlDrawing` that carries their on-screen boxes) and assumes the matching part was
   * indexed. It only indexes comment parts found at `xl/commentsN.xml`, so a file whose comments
   * live elsewhere — the `threadedComments` Excel writes today — or whose part is simply absent
   * takes the whole preview down with "Cannot read properties of undefined (reading 'comments')".
   *
   * A preview shows cell values and never renders comments, so those relationships are dropped from
   * the parsed model before the reader walks them. The override is an own property of this one
   * workbook, so the export paths elsewhere in the app keep the untouched prototype.
   *
   * This does lean on the reader's internals. If a future version renames the step or reshapes the
   * model the override stops applying, which is exactly what the regression tests around a
   * dangling comment relationship are there to catch.
   */
  private loadTolerantly(workbook: any, buffer: ArrayBuffer): Promise<unknown> {
    const reader = workbook.xlsx;
    const reconcile = reader?.reconcile;
    if (typeof reconcile === 'function') {
      reader.reconcile = (model: any, options: any) => {
        this.dropCommentRelationships(model);
        return reconcile.call(reader, model, options);
      };
    }
    return reader.load(buffer);
  }

  private dropCommentRelationships(model: any): void {
    const relationshipsBySheet = model?.worksheetRels;
    if (!Array.isArray(relationshipsBySheet)) {
      return;
    }
    relationshipsBySheet.forEach((relationships: any, index: number) => {
      if (Array.isArray(relationships)) {
        relationshipsBySheet[index] = relationships.filter(
          (relationship: any) => !COMMENT_RELATIONSHIP_TYPE.test(String(relationship?.Type ?? ''))
        );
      }
    });
  }

  private readWorksheetRows(worksheet: any): string[][] {
    const rows: string[][] = [];
    // `rowCount` counts trailing empty rows too, so read one past the cap and let toSheet() decide
    // what was really clipped.
    const lastRow = Math.min(worksheet.rowCount || 0, MAX_PREVIEW_ROWS + 1);
    for (let rowNumber = 1; rowNumber <= lastRow; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      // exceljs indexes `values` from 1, leaving a hole at 0 that must not become a leading column.
      const values: any[] = Array.isArray(row?.values) ? row.values.slice(1) : [];
      rows.push(values.map((value) => this.cellText(value)));
    }
    return rows;
  }

  /**
   * Reduce one cell to the text a reader should see. A cell is not always a primitive: formulas
   * arrive as their definition plus a cached result, links as text plus a target, and styled runs
   * as a list of fragments.
   */
  private cellText(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    if (typeof value === 'object') {
      if (Array.isArray(value.richText)) {
        return value.richText.map((run: any) => run?.text ?? '').join('');
      }
      if ('result' in value) {
        return this.cellText(value.result);
      }
      if ('text' in value) {
        return this.cellText(value.text);
      }
      if ('error' in value) {
        return String(value.error);
      }
      if ('hyperlink' in value) {
        return String(value.hyperlink);
      }
      return '';
    }
    return String(value);
  }

  /** Clip a grid to the preview caps, dropping the empty rows that trail most sheets. */
  private toSheet(name: string, rows: string[][]): SpreadsheetSheet {
    const populated = this.dropTrailingEmptyRows(rows);
    const totalColumns = populated.reduce((widest, row) => Math.max(widest, row.length), 0);
    return {
      name: name || '',
      rows: populated.slice(0, MAX_PREVIEW_ROWS).map((row) => row.slice(0, MAX_PREVIEW_COLUMNS)),
      hiddenRows: Math.max(0, populated.length - MAX_PREVIEW_ROWS),
      hiddenColumns: Math.max(0, totalColumns - MAX_PREVIEW_COLUMNS)
    };
  }

  private dropTrailingEmptyRows(rows: string[][]): string[][] {
    let end = rows.length;
    while (end > 0 && rows[end - 1].every((cell) => cell === '')) {
      end--;
    }
    return rows.slice(0, end);
  }

  /**
   * Parse delimiter-separated text per RFC 4180: a quoted field may contain the delimiter, a line
   * break, or an escaped quote (`""`), so the scan has to track whether it sits inside quotes
   * rather than splitting on separators.
   */
  private parseCsv(text: string): string[][] {
    const delimiter = this.detectDelimiter(text);
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let quoted = false;

    // A byte order mark would otherwise become part of the first cell.
    const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (quoted) {
        if (char === '"') {
          if (input[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            quoted = false;
          }
        } else {
          field += char;
        }
        continue;
      }

      if (char === '"') {
        quoted = true;
      } else if (char === delimiter) {
        row.push(field);
        field = '';
      } else if (char === '\n' || char === '\r') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        // Consume the second half of a CRLF so it does not open an extra blank row.
        if (char === '\r' && input[i + 1] === '\n') {
          i++;
        }
      } else {
        field += char;
      }
    }

    if (field !== '' || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  /** Pick the separator that appears most often outside quotes on the first line. */
  private detectDelimiter(text: string): string {
    const firstLine = text.split(/\r?\n/, 1)[0] || '';
    const candidates = [
      ',',
      ';',
      '\t'
    ];
    let best = ',';
    let bestCount = 0;
    for (const candidate of candidates) {
      let count = 0;
      let quoted = false;
      for (const char of firstLine) {
        if (char === '"') {
          quoted = !quoted;
        } else if (char === candidate && !quoted) {
          count++;
        }
      }
      if (count > bestCount) {
        best = candidate;
        bestCount = count;
      }
    }
    return best;
  }
}
