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
import { SavingsService } from '../savings.service';

/**
 * Savings Account Template resolver.
 */
@Injectable()
export class SavingsAccountTemplateResolver {
  private savingsService = inject(SavingsService);

  /**
   * Returns the Shares Account Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const entityId = route.paramMap.get('clientId') || route.paramMap.get('groupId') || route.paramMap.get('centerId');
    const isGroup = route.paramMap.get('groupId') || route.paramMap.get('centerId') ? true : false;
    return this.savingsService.getSavingsAccountTemplate(entityId, undefined, isGroup);
  }
}
