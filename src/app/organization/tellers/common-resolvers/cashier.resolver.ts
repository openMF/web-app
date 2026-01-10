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
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Cashier data resolver.
 */
@Injectable()
export class CashierResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the cashier data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const cashierId = route.paramMap.get('id');
    const tellerId = route.parent.parent.paramMap.get('id');
    return this.organizationService.getCashier(tellerId, cashierId);
  }
}
