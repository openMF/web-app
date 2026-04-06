/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-savings-transaction-datatable-tab',
  templateUrl: './savings-transaction-datatable-tab.component.html',
  styleUrls: ['./savings-transaction-datatable-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class SavingsTransactionDatatableTabComponent {
  constructor() {}
}
