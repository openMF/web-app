/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Office data resolver.
 */
@Injectable()
export class OfficeResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the office data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = route.parent.paramMap.get('officeId');
    return this.organizationService.getOffice(officeId);
  }
}
