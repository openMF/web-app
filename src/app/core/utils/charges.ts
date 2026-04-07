/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { OptionData } from 'app/shared/models/option-data.model';

@Injectable({
  providedIn: 'root'
})
export class Charges {
  public getChargeAppliesToOptions(): OptionData[] {
    return [
      { id: 1, code: 'chargeAppliesTo.loan', value: 'Loan' },
      { id: 2, code: 'chargeAppliesTo.savings', value: 'Savings' },
      { id: 3, code: 'chargeAppliesTo.client', value: 'Client' },
      { id: 4, code: 'chargeAppliesTo.shares', value: 'Shares' }
    ];
  }
}
