/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OfficesService } from '@fineract/client';

/**
 * Office and template data resolver.
 */
@Injectable()
export class EditOfficeResolver {
  /**
   * @param {OfficesService} officesService Offices service.
   */
  constructor(private officesService: OfficesService) {}

  /**
   * Returns the office and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = Number(route.paramMap.get('officeId'));
    return this.officesService.retrieveOffice({ officeId });
  }
}
