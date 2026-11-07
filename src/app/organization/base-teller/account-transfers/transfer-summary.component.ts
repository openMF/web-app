/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TransferAccountDetailsComponent } from './account-details.component';
import { TransferPreview, TransferReceipt } from './account-transfer.models';
@Component({ selector: 'mifosx-transfer-summary', imports: [
    ...STANDALONE_SHARED_IMPORTS,
    TransferAccountDetailsComponent
  ], templateUrl: './transfer-summary.component.html' })
export class TransferSummaryComponent {
  @Input() preview: TransferPreview | null = null;
  @Input() receipt: TransferReceipt | null = null;
  get record() {
    return this.receipt ?? this.preview;
  }
}
