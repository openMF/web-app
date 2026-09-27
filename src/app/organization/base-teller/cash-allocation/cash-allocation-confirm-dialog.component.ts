/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';

import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CashAllocationPreview } from '../base-teller.service';

@Component({
  selector: 'mifosx-cash-allocation-confirm-dialog',
  templateUrl: './cash-allocation-confirm-dialog.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashAllocationConfirmDialogComponent {
  readonly preview = inject<CashAllocationPreview>(MAT_DIALOG_DATA);
}
