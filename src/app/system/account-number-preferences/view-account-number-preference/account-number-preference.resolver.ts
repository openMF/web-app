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
import { SystemService } from '../../system.service';

/**
 * Account Number Preference data resolver.
 */
@Injectable()
export class AccountNumberPreferenceResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Account Number Preference data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const accountNumberPreferenceId = route.paramMap.get('id');
    return this.systemService.getAccountNumberPreference(accountNumberPreferenceId);
  }
}
