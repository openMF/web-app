/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ExchangePreview } from './cash-exchange.models';

@Component({
  selector: 'mifosx-cash-exchange-confirm-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule
  ],
  templateUrl: './cash-exchange-confirm-dialog.component.html'
})
export class CashExchangeConfirmDialogComponent {
  readonly data = inject<{ tellerName: string; preview: ExchangePreview }>(MAT_DIALOG_DATA);
}
