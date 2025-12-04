/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Charges data resolver.
 */
@Injectable()
export class LoanProvisioningCriteriasResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getProvisioningCriterias();
  }
}
