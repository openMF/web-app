/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { RecurringDepositsService } from '../recurring-deposits.service';

/**
 * RecurringDeposits Account data resolver.
 */
@Injectable()
export class RecurringDepositsAccountViewResolver {
  private recurringDepositsService = inject(RecurringDepositsService);

  /**
   * Returns the RecurringDeposits Account data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const recurringDepositAccountId = route.paramMap.get('recurringDepositAccountId');
    return this.recurringDepositsService.getRecurringDepositsAccountData(recurringDepositAccountId);
  }
}
