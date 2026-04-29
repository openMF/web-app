/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProvisioningCriteriaService } from '@fineract/client';

/**
 * Provisioning criteria and template resolver.
 */
@Injectable()
export class LoanProvisioningCriteriaAndTemplateResolver {
  /**
   * @param {ProvisioningCriteriaService} provisioningCriteriaService Provisioning Criteria service.
   */
  constructor(private provisioningCriteriaService: ProvisioningCriteriaService) {}

  /**
   * Returns the Pprovisioning criteria and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const provisioningId = route.paramMap.get('id');
    return this.provisioningCriteriaService.retrieveAllProvisioningCriterias();
  }
}
