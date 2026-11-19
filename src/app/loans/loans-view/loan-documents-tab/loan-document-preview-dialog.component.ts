/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { of } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { SpreadsheetPreviewService } from 'app/shared/services/spreadsheet-preview.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { LoanDocumentMediaService } from './loan-document-media.service';
import { PresentedLoanDocument } from './loan-document-presentation.utils';
@Component({
  selector: 'mifosx-loan-document-preview-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule
  ],
  template: `<h2 mat-dialog-title>{{ data.document.title || ('loanDocuments.document' | translate) }}</h2>
    <mat-dialog-content>
      @if (loading) {
        <p role="status">{{ 'loanDocuments.loading' | translate }}</p>
      }
      @if (failed) {
        <p role="alert">{{ 'loanDocuments.previewFailed' | translate }}</p>
      }
      @if (imageUrl) {
        <img [src]="imageUrl" [alt]="'loanDocuments.thumbnail' | translate" (error)="failed = true" />
      }
      @if (pdfUrl) {
        <iframe [src]="pdfUrl" [title]="'labels.buttons.Preview' | translate"></iframe>
      }
      @if (sheets.length) {
        <p>{{ 'loanDocuments.sheetLimit' | translate }}</p>
        @for (sheet of sheets; track $index) {
          <h3>{{ sheet.name }}</h3>
          <div class="sheet">
            <table>
              @for (row of sheet.rows; track $index) {
                <tr>
                  @for (cell of row; track $index) {
                    <td>{{ cell }}</td>
                  }
                </tr>
              }
            </table>
          </div>
        }
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end"
      ><button mat-button mat-dialog-close>{{ 'labels.buttons.Close' | translate }}</button></mat-dialog-actions
    >`,
  styles: [
    `
      img {
        display: block;
        max-width: 100%;
        max-height: 70vh;
        margin: auto;
      }
      iframe {
        width: 100%;
        height: 70vh;
        border: 0;
      }
      .sheet {
        overflow: auto;
        max-height: 60vh;
      }
      td {
        padding: 8px;
        border: 1px solid var(--mat-divider-color, #899b98);
        white-space: pre-wrap;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDocumentPreviewDialogComponent implements OnInit, OnDestroy {
  readonly data = inject<{ loanId: string; document: PresentedLoanDocument }>(MAT_DIALOG_DATA);
  private media = inject(LoanDocumentMediaService);
  private spreadsheets = inject(SpreadsheetPreviewService);
  private previews = inject(DocumentPreviewService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private destroyed = false;
  imageUrl = '';
  pdfUrl?: SafeResourceUrl;
  sheets: { name: string; rows: string[][] }[] = [];
  loading = true;
  failed = false;
  ngOnInit(): void {
    void this.load();
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.previews.release(`loan:${this.data.loanId}:${this.data.document.id}`);
  }
  private async load(): Promise<void> {
    const doc = this.data.document;
    const key = `loan:${this.data.loanId}:${doc.id}`;
    const descriptor = { id: key, fileName: doc.fileName, mimeType: doc.type };
    const previewType = this.previews.getPreviewType(descriptor);
    try {
      const blob = await this.media.read(this.data.loanId, doc);
      if (this.destroyed) return;
      if (previewType === 'spreadsheet') {
        if (blob.size > 20 * 1024 * 1024) throw new Error('previewLimit');
        const preview = await this.spreadsheets.load(blob, doc.fileName);
        if (this.destroyed) return;
        this.sheets = preview.sheets.slice(0, 10).map((sheet) => ({
          name: sheet.name,
          rows: sheet.rows.slice(0, 100).map((row) => row.slice(0, 30))
        }));
      } else {
        const safeBlob =
          previewType === 'pdf' && blob.type !== 'application/pdf'
            ? new Blob([blob], { type: 'application/pdf' })
            : blob;
        const preview = await this.previews.resolvePreviewUrl(descriptor, () => of(safeBlob));
        if (this.destroyed) {
          this.previews.release(key);
          return;
        }
        if (preview.type === 'pdf') this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(preview.url);
        else if (preview.type === 'image') this.imageUrl = preview.url;
        else throw new Error('unsupported');
      }
    } catch {
      if (!this.destroyed) this.failed = true;
    } finally {
      if (!this.destroyed) {
        this.loading = false;
        this.cdr.markForCheck();
      }
    }
  }
}
