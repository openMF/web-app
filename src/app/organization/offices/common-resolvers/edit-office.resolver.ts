/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Office and template data resolver.
 */
@Injectable()
export class EditOfficeResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the office and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = route.paramMap.get('officeId');
    return this.organizationService.getOffice(officeId, true);
  }
}
