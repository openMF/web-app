/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TransferAccount } from './account-transfer.models';
@Component({
  selector: 'mifosx-transfer-account-details',
  imports: [...STANDALONE_SHARED_IMPORTS],
  template: `
    @if (account; as a) {
      <dl>
        <dt>{{ 'accountTransfer.clientNumber' | translate }}</dt>
        <dd>{{ a.owner.clientNumber }} · {{ a.owner.displayName }}</dd>
        <dt>{{ 'accountTransfer.accountNumber' | translate }}</dt>
        <dd>{{ a.accountNo }}</dd>
        <dt>{{ 'accountTransfer.accountType' | translate }}</dt>
        <dd>{{ 'accountTransfer.' + a.accountType | translate }}</dd>
        <dt>{{ 'accountTransfer.product' | translate }}</dt>
        <dd>{{ a.productName }}</dd>
        <dt>{{ 'accountTransfer.currency' | translate }}</dt>
        <dd>{{ a.currencyCode }}</dd>
        <dt>{{ 'accountTransfer.status' | translate }}</dt>
        <dd>{{ a.status }}</dd>
        @if (a.withdrawableBalance !== null) {
          <dt>{{ 'accountTransfer.available' | translate }}</dt>
          <dd>{{ a.currencyCode }} {{ a.withdrawableBalance }}</dd>
        }
      </dl>
    }
  `
})
export class TransferAccountDetailsComponent {
  @Input() account: TransferAccount | null = null;
}
