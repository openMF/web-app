/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
@Component({
  selector: 'mifosx-withdrawal-continue-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule
  ],
  template: ` <h2 mat-dialog-title>{{ 'withdrawal.continueQuestion' | translate }}</h2>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ 'withdrawal.newCustomer' | translate }}</button>
      <button mat-flat-button [mat-dialog-close]="true">{{ 'withdrawal.yesContinue' | translate }}</button>
    </mat-dialog-actions>`
})
export class WithdrawalContinueDialogComponent {}
