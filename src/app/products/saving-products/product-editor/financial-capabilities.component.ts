/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TransactionControlCapabilities } from './product-policy.model';
import { financialCodeLabel } from './financial-controls.messages';

export const TRANSACTION_BOOLEAN_CAPABILITIES = [
  'decisionEvaluation',
  'maximumBalanceEnforcement',
  'freezingLifecycle',
  'operationsExceptions',
  'universalNativeCoverage',
  'configuredActivation'
] as const;
@Component({
  selector: 'mifosx-financial-capabilities',
  imports: [...STANDALONE_SHARED_IMPORTS],
  templateUrl: './financial-capabilities.component.html',
  styleUrls: ['./product-editor.component.scss']
})
export class FinancialCapabilitiesComponent {
  @Input() capabilities?: TransactionControlCapabilities;
  readonly fields = TRANSACTION_BOOLEAN_CAPABILITIES;
  readonly label = financialCodeLabel;
  support(value: unknown) {
    return value === true
      ? 'FinancialControls.Supported'
      : value === false
        ? 'FinancialControls.Unsupported'
        : 'SavingsEditor.Unavailable';
  }
}
