/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Office Datatables data resolver.
 */
@Injectable()
export class OfficeDatatablesResolver implements Resolve<Object> {

  /**
   * @param {organizationService} OrganizationService Organization service.
   */
  constructor(private organizationService: OrganizationService) { }

  /**
   * Returns the Office's Datatables data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getOfficeDatatables();
  }

}
