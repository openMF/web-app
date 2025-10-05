/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OfficesService } from '@fineract/client';

/**
 * Office data resolver.
 */
@Injectable()
export class OfficeResolver {
  /**
   * @param {OfficesService} officesService Offices service.
   */
  constructor(private officesService: OfficesService) {}

  /**
   * Returns the office data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = Number(route.parent.paramMap.get('officeId'));
    return this.officesService.retrieveOffice({ officeId });
  }
}
