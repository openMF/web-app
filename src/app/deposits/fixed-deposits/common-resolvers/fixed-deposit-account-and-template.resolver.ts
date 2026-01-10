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
import { FixedDepositsService } from '../fixed-deposits.service';

/**
 * Fixed Deposits Account Template resolver.
 */
@Injectable()
export class FixedDepositsAccountAndTemplateResolver {
  private fixedDepositsService = inject(FixedDepositsService);

  /**
   * Returns the Fixed Deposits Account Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const fixedDepositAccountId = route.paramMap.get('fixedDepositAccountId');
    return this.fixedDepositsService.getFixedDepositsAccountAndTemplate(fixedDepositAccountId);
  }
}
