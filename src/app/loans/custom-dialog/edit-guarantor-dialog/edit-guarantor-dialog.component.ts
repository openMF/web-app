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
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-edit-guarantor-dialog',
  templateUrl: './edit-guarantor-dialog.component.html',
  styleUrls: ['./edit-guarantor-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule
  ]
})
export class EditGuarantorDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<EditGuarantorDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(UntypedFormBuilder);

  editGuarantorForm: UntypedFormGroup;
  relationTypes: any[] = [];

  ngOnInit() {
    this.relationTypes = this.data.relationTypes || [];
    const guarantor = this.data.guarantorData;
    this.editGuarantorForm = this.formBuilder.group({
      firstname: [guarantor.firstname || ''],
      lastname: [guarantor.lastname || ''],
      clientRelationshipTypeId: [guarantor.clientRelationshipType?.id || ''],
      addressLine1: [guarantor.addressLine1 || ''],
      addressLine2: [guarantor.addressLine2 || ''],
      city: [guarantor.city || ''],
      zip: [guarantor.zip || ''],
      mobileNumber: [guarantor.mobileNumber || ''],
      housePhoneNumber: [guarantor.housePhoneNumber || '']
    });
  }

  submit() {
    this.dialogRef.close(this.editGuarantorForm.value);
  }
}
