/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * SMS Campaigns data resolver.
 */
@Injectable()
export class SmsCampaignsResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the SMS Campaigns data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getSmsCampaigns();
  }
}
