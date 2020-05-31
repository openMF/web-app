/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Office Datatable data resolver.
 */
@Injectable()
export class OfficeDatatableResolver implements Resolve<Object> {

  /**
   * @param {OrganizationService} OrganizationService Organization service.
   */
  constructor(private organizationService: OrganizationService) { }

  /**
   * Returns the Office's Datatable data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = route.parent.parent.paramMap.get('id');
    const datatableName = route.paramMap.get('datatableName');
    return this.organizationService.getOfficeDatatable(officeId, datatableName);
  }

}
