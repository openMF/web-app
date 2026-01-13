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
 * Continue Setup Dialog Component.
 */
@Component({
  selector: 'mifosx-continue-setup-dialog',
  templateUrl: './continue-setup-dialog.component.html',
  styleUrls: ['./continue-setup-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class ContinueSetupDialogComponent {
  dialogRef = inject<MatDialogRef<ContinueSetupDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  /* Current Step Name*/
  stepName: number;

  /**
   * @param {MatDialogRef<ContinueSetupDialogComponent>} dialogRef MatDialogRef<ContinueSetupDialogComponent>.
   */
  constructor() {
    const data = this.data;

    this.stepName = data.stepName;
  }
}
