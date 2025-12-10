/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Loan Provisioning Criteria data resolver.
 */
@Injectable()
export class LoanProvisioningCriteriaResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the loan provisioning criteria data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const provisioningId = route.paramMap.get('id');
    return this.organizationService.getProvisioningCriteria(provisioningId);
  }
}
