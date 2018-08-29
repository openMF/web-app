/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { OrganisationService } from '../../organisation.service';

@Injectable()
export class ViewOfficeResolver implements Resolve<Object> {

  /**
   * @param {OrganisationService} OrganisationService Organisation Service.
   */
  constructor(private organisationService: OrganisationService) { }

  /**
   * Returns the office data.
   * @returns {Observable<Office>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.organisationService.getOffice(route.params.id);
  }

}
