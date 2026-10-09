/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';

/** Custom Components */
import { FileUploadComponent } from '../../../shared/file-upload/file-upload.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** The only extension the Eclipse BIRT reporting engine loads. */
export const REPORT_DESIGN_EXTENSION = '.rptdesign';

/** Matches the limit the platform enforces, so an oversized file is refused before it is sent. */
export const MAX_REPORT_DESIGN_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Selects a single Eclipse BIRT report design to install.
 *
 * <p>The checks here are for the person at the keyboard, not for safety: the platform validates the
 * extension, the size and the content again, and is the only thing that decides where the file goes.
 */
@Component({
  selector: 'mifosx-upload-report-file-dialog',
  templateUrl: './upload-report-file-dialog.component.html',
  styleUrls: ['./upload-report-file-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    FileUploadComponent,
    MatDialogActions,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadReportFileDialogComponent {
  /** The accepted extension, handed to the file picker as its filter. */
  readonly acceptFilter = REPORT_DESIGN_EXTENSION;

  /** The selected design, once it has passed the checks below. */
  file: File | null = null;

  /** Translation key of the reason the last selection was refused, or null. */
  errorKey: string | null = null;

  /** The selected design's size in kilobytes, for display beside its name. */
  get fileSizeInKb(): string {
    return this.file ? (this.file.size / 1024).toFixed(1) : '';
  }

  /**
   * Validates the selected file and keeps it only if it passes.
   * @param {any} $event File input change event.
   */
  onFileSelect($event: any): void {
    this.file = null;
    this.errorKey = null;

    const selected: File = $event?.target?.files?.[0];
    if (!selected) {
      return;
    }

    if (!selected.name.toLowerCase().endsWith(REPORT_DESIGN_EXTENSION)) {
      this.errorKey = 'labels.text.Only Eclipse BIRT report designs can be uploaded';
      return;
    }

    if (selected.size === 0) {
      this.errorKey = 'labels.text.The selected report design is empty';
      return;
    }

    if (selected.size > MAX_REPORT_DESIGN_SIZE_BYTES) {
      this.errorKey = 'labels.text.The selected report design is too large';
      return;
    }

    this.file = selected;
  }
}
