/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input, inject } from '@angular/core';
import { Accounting } from 'app/core/utils/accounting';
import { OptionData } from 'app/shared/models/option-data.model';
import { GlAccountDisplayComponent } from '../gl-account-display/gl-account-display.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-savings-accounting-details',
  templateUrl: './view-savings-accounting-details.component.html',
  styleUrls: ['./view-savings-accounting-details.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    GlAccountDisplayComponent
  ]
})
export class ViewSavingsAccountingDetailsComponent {
  private accounting = inject(Accounting);

  @Input() accountingRule: OptionData;
  @Input() accountingMappings: any[] = [];

  isCashOrAccrualAccounting(): boolean {
    if (this.accountingRule) {
      return this.accounting.isCashOrAccrualAccounting(this.accountingRule);
    }
    return false;
  }

  isAccrualAccounting(): boolean {
    if (this.accountingRule) {
      return this.accounting.isAccrualAccounting(this.accountingRule);
    }
    return false;
  }

  getAccountingRuleName(value: string): string {
    return this.accounting.getAccountRuleName(value.toUpperCase());
  }
}
