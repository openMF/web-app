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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

export interface PdfPreviewDialogData {
  /** Object URL of the PDF, owned by the caller. */
  url: string;
  /** Document name shown as the dialog title. */
  title?: string;
  fileName?: string;
}

/**
 * Renders a PDF document inline.
 *
 * The object URL belongs to `DocumentPreviewService`, which caches and revokes it, so
 * this dialog never revokes the URL it is handed.
 */
@Component({
  selector: 'mifosx-pdf-preview-dialog',
  templateUrl: './pdf-preview-dialog.component.html',
  styleUrls: ['./pdf-preview-dialog.component.scss'],
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
export class PdfPreviewDialogComponent {
  private sanitizer = inject(DomSanitizer);
  data = inject<PdfPreviewDialogData>(MAT_DIALOG_DATA);

  /** The blob URL is created by us from a downloaded document, so it is safe to trust. */
  readonly safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.url);

  /**
   * Safari and iOS refuse to render `blob:` PDFs inside `<embed>`, so the dialog always
   * offers opening the document in a new tab as a fallback.
   */
  openInNewTab(): void {
    window.open(this.data.url, '_blank');
  }
}
