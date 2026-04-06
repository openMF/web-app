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
import { AccountTransfersService } from '../account-transfers.service';

/**
 * View Standing Instructions resolver.
 */
@Injectable()
export class StandingInstructionsTemplateResolver {
  private accountTransfersService = inject(AccountTransfersService);

  accountTypeId: string;

  /**
   * Returns the Standing Instructions Data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = route.queryParamMap.get('officeId');
    const accountType = route.queryParamMap.get('accountType');
    const clientId = route.parent.paramMap.get('clientId');
    switch (accountType) {
      case 'fromloans':
        this.accountTypeId = '1';
        break;
      case 'fromsavings':
        this.accountTypeId = '2';
        break;
      default:
        this.accountTypeId = '0';
    }
    return this.accountTransfersService.getStandingInstructionsTemplate(clientId, officeId, this.accountTypeId);
  }
}
