/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';

/** Custom Services */
import {
  MAX_PREVIEW_COLUMNS,
  MAX_PREVIEW_ROWS,
  SpreadsheetPreview,
  SpreadsheetSheet
} from 'app/shared/services/spreadsheet-preview.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

export interface SpreadsheetPreviewDialogData {
  /** Document name, shown as the dialog title. */
  name: string;
  preview: SpreadsheetPreview;
}

/**
 * Read-only spreadsheet viewer.
 *
 * Spreadsheets get their own dialog rather than a slide in the document lightbox: the lightbox is
 * a media carousel built for zooming and paging through images, which is the wrong shape for a grid
 * that needs to scroll in two directions and switch between sheets.
 */
@Component({
  selector: 'mifosx-spreadsheet-preview-dialog',
  templateUrl: './spreadsheet-preview-dialog.component.html',
  styleUrls: ['./spreadsheet-preview-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpreadsheetPreviewDialogComponent {
  data = inject<SpreadsheetPreviewDialogData>(MAT_DIALOG_DATA);

  readonly maxRows = MAX_PREVIEW_ROWS;
  readonly maxColumns = MAX_PREVIEW_COLUMNS;

  activeSheetIndex = 0;

  get sheets(): SpreadsheetSheet[] {
    return this.data?.preview?.sheets ?? [];
  }

  get activeSheet(): SpreadsheetSheet | undefined {
    return this.sheets[this.activeSheetIndex];
  }

  /** Widest row in the sheet — a grid has to be rectangular even when the data is ragged. */
  get columnCount(): number {
    return (this.activeSheet?.rows ?? []).reduce((widest, row) => Math.max(widest, row.length), 0);
  }

  get columnLabels(): string[] {
    return Array.from({ length: this.columnCount }, (_, index) => this.columnLabel(index));
  }

  get isEmpty(): boolean {
    return !this.sheets.some((sheet) => sheet.rows.length);
  }

  selectSheet(index: number): void {
    this.activeSheetIndex = index;
  }

  /** Track rows by position: the grid is static for the life of the dialog. */
  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Spreadsheet-style column name for a zero-based index: A, B, ... Z, AA, AB. Headers are not
   * assumed to live in the first row — many uploads are raw data — so the grid labels columns the
   * way the source application does instead of promoting row 1.
   */
  private columnLabel(index: number): string {
    let label = '';
    let remaining = index;
    do {
      label = String.fromCharCode(65 + (remaining % 26)) + label;
      remaining = Math.floor(remaining / 26) - 1;
    } while (remaining >= 0);
    return label;
  }
}
