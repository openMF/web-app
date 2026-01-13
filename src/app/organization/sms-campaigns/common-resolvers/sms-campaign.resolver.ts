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
 * SMS Campaign data resolver.
 */
@Injectable()
export class SmsCampaignResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the SMS Campaign data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const smsCampaignId = route.paramMap.get('id');
    return this.organizationService.getSmsCampaign(smsCampaignId);
  }
}
