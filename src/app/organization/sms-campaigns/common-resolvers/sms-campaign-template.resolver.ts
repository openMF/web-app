/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * SMS Campaign Template resolver.
 */
@Injectable()
export class SmsCampaignTemplateResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the SMS Campaign Template.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getSmsCampaignTemplate();
  }
}
