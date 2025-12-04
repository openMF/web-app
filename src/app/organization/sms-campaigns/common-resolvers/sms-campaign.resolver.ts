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
