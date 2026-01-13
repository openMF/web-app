/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { FileUploadComponent } from '../../../shared/file-upload/file-upload.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-import-loan-product-dialog',
  templateUrl: './import-loan-product-dialog.component.html',
  styleUrls: ['./import-loan-product-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogContent,
    FileUploadComponent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class ImportLoanProductDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ImportLoanProductDialogComponent>>(MatDialogRef);
  private formBuilder = inject(UntypedFormBuilder);
  data = inject(MAT_DIALOG_DATA);

  /** Import Loan Product form. */
  importLoanProductForm: UntypedFormGroup;

  ngOnInit() {
    this.createImportLoanProductForm();
  }

  /**
   * Creates the import loan product form.
   */
  createImportLoanProductForm() {
    this.importLoanProductForm = this.formBuilder.group({
      file: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Sets file form control value.
   * @param {any} $event file change event.
   */
  onFileSelect($event: any) {
    if ($event.target.files.length > 0) {
      const file = $event.target.files[0];
      this.importLoanProductForm.get('file').setValue(file);
    }
  }
}
