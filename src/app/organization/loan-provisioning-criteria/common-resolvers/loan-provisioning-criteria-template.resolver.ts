/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Provisioning criteria template resolver.
 */
@Injectable()
export class LoanProvisioningCriteriaTemplateResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the Pprovisioning criteria template
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getProvisioningCriteriaTemplate();
  }
}
