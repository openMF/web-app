/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProvisioningCriteriaService } from '@fineract/client';

/**
 * Provisioning criteria template resolver.
 */
@Injectable()
export class LoanProvisioningCriteriaTemplateResolver {
  /**
   * @param {ProvisioningCriteriaService} provisioningCriteriaService Provisioning Criteria service.
   */
  constructor(private provisioningCriteriaService: ProvisioningCriteriaService) {}

  /**
   * Returns the Pprovisioning criteria template
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.provisioningCriteriaService.retrieveTemplate3();
  }
}
