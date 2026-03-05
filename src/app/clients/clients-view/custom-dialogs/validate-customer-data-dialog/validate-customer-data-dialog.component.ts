/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';

type DocumentRowGroup = FormGroup<{
  selected: FormControl<boolean | null>;
  missingDocument: FormControl<boolean | null>;
  illegibleDocument: FormControl<boolean | null>;
  invalidDocument: FormControl<boolean | null>;
  expiredDocument: FormControl<boolean | null>;
}>;
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import {
  CustomerDataValidation,
  DOCUMENT_DATA_TYPES,
  DOCUMENT_REASON_TYPES,
  ValidationStatus,
  emptyCustomerDataValidation
} from 'app/clients/models/document-validation.model';

@Component({
  selector: 'mifosx-validate-customer-data-dialog',
  templateUrl: './validate-customer-data-dialog.component.html',
  styleUrls: ['./validate-customer-data-dialog.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class ValidateCustomerDataDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ValidateCustomerDataDialogComponent>>(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  data: CustomerDataValidation = inject(MAT_DIALOG_DATA);

  /** Exposed constants for template iteration */
  readonly dataTypes = DOCUMENT_DATA_TYPES;
  readonly reasonTypes = DOCUMENT_REASON_TYPES;

  /** Reactive form for the validation matrix */
  validationForm!: FormGroup<{ rows: FormArray<DocumentRowGroup> }>;

  ngOnInit() {
    this.buildForm();
  }

  /** Builds the reactive form from injected data (or empty defaults) */
  private buildForm() {
    const validation = this.data ?? emptyCustomerDataValidation();
    const empty = emptyCustomerDataValidation();
    const rowGroups: DocumentRowGroup[] = this.dataTypes.map((dt) => {
      const typeData = validation[dt.key] ?? empty[dt.key];
      return this.formBuilder.group({
        selected: new FormControl<boolean | null>(typeData.selected),
        missingDocument: new FormControl<boolean | null>(typeData.reasons.missingDocument),
        illegibleDocument: new FormControl<boolean | null>(typeData.reasons.illegibleDocument),
        invalidDocument: new FormControl<boolean | null>(typeData.reasons.invalidDocument),
        expiredDocument: new FormControl<boolean | null>(typeData.reasons.expiredDocument)
      }) as DocumentRowGroup;
    });
    this.validationForm = this.formBuilder.group({
      rows: this.formBuilder.array<DocumentRowGroup>(rowGroups)
    });
  }

  /** Accessor for the rows FormArray */
  get rows(): FormArray<DocumentRowGroup> {
    return this.validationForm.controls.rows;
  }

  /** Returns the FormGroup for a given row index */
  rowGroup(index: number): DocumentRowGroup {
    return this.rows.at(index);
  }

  /** Collects form value into CustomerDataValidation and closes with action */
  submit(action: 'INCOMPLETE' | 'COMPLETE') {
    const result: CustomerDataValidation = emptyCustomerDataValidation();
    this.dataTypes.forEach((dt, i) => {
      const row = this.rowGroup(i).getRawValue();
      result[dt.key] = {
        selected: row.selected ?? false,
        reasons: {
          missingDocument: row.missingDocument ?? false,
          illegibleDocument: row.illegibleDocument ?? false,
          invalidDocument: row.invalidDocument ?? false,
          expiredDocument: row.expiredDocument ?? false
        }
      };
    });
    result.validationStatus = action === 'COMPLETE' ? ValidationStatus.COMPLETE : ValidationStatus.INCOMPLETE;
    this.dialogRef.close(result);
  }
}
