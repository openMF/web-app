/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Charges data resolver.
 */
@Injectable()
export class LoanProvisioningCriteriasResolver implements Resolve<Object> {

  /**
   * @param {OrganizationService} organizationService Products service.
   */
  constructor(private organizationService: OrganizationService) {}

  /**
   * Returns the products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getProvisioningCriterias();
  }

}
