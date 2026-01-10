/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { OrganizationService } from '../organization.service';

@Injectable({
  providedIn: 'root'
})
export class ManageFundResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the manage funds data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const fundId = route.paramMap.get('id');
    return this.organizationService.getFund(fundId);
  }
}
