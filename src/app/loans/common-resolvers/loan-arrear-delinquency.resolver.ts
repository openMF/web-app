/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanArrearDelinquencyResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the loan-arrears-delinquency-display-data configuration data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getConfigurationByName('loan-arrears-delinquency-display-data');
  }
}
