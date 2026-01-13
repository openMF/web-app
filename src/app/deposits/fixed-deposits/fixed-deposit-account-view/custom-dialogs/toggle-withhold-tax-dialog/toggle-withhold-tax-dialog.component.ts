/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, inject } from '@angular/core';
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

/**
 * Toggle withhold tax dialog dialog component.
 */
@Component({
  selector: 'mifosx-toggle-withhold-tax-dialog',
  templateUrl: './toggle-withhold-tax-dialog.component.html',
  styleUrls: ['./toggle-withhold-tax-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class ToggleWithholdTaxDialogComponent {
  dialogRef = inject<MatDialogRef<ToggleWithholdTaxDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
}
