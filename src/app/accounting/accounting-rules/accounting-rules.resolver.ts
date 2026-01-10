/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Accounting rules data resolver.
 */
@Injectable()
export class AccountingRulesResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the accounting rules data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getAccountingRules();
  }
}
