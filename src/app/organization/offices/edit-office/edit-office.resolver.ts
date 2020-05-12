/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Office and template data resolver.
 */
@Injectable()
export class EditOfficeResolver implements Resolve<Object> {

  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor(private organizationService: OrganizationService) {}

  /**
   * Returns the office and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = route.paramMap.get('id');
    return this.organizationService.getOffice(officeId, true);
  }

}
