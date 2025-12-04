/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Provisioning criteria and template resolver.
 */
@Injectable()
export class LoanProvisioningCriteriaAndTemplateResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the Pprovisioning criteria and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const provisioningId = route.paramMap.get('id');
    return this.organizationService.getProvisioningCriteria(provisioningId, true);
  }
}
