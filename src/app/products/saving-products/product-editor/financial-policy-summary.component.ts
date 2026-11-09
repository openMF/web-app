/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { PolicyCharge, ProductPolicy } from './product-policy.model';

@Component({
  selector: 'mifosx-financial-policy-summary',
  imports: [...STANDALONE_SHARED_IMPORTS],
  templateUrl: './financial-policy-summary.component.html',
  styleUrls: ['./product-editor.component.scss']
})
export class FinancialPolicySummaryComponent {
  @Input() policy: ProductPolicy | null = null;
  @Input() title = 'FinancialControls.Configured';
  @Input() currency = '';
  @Input() fees: PolicyCharge[] = [];
  get chargeName() {
    return this.fees.find((fee) => fee.id === this.policy?.feeChargeId)?.name;
  }
}
