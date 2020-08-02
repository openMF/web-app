/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Provisioning criteria template resolver.
 */
@Injectable()
export class LoanProvisioningCriteriaTemplateResolver implements Resolve<Object> {

  /**
   * @param {OrganizationService} organizationService Products service.
   */
  constructor(private organizationService: OrganizationService) {}

  /**
   * Returns the Pprovisioning criteria template
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getProvisioningCriteriaTemplate();
  }

}
