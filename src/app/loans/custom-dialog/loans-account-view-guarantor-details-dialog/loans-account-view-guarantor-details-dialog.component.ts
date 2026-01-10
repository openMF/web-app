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
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loans-account-view-guarantor-details-dialog',
  templateUrl: './loans-account-view-guarantor-details-dialog.component.html',
  styleUrls: ['./loans-account-view-guarantor-details-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class LoansAccountViewGuarantorDetailsDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<LoansAccountViewGuarantorDetailsDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  ngOnInit() {
    this.dialogRef.updateSize('400px');
  }
}
