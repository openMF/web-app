/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CentersService } from '@fineract/client';

/**
 * Centers data and template resolver.
 */
@Injectable()
export class CenterDataAndTemplateResolver {
  /**
   * @param {CentersService} centersService Centers service.
   */
  constructor(private centersService: CentersService) {}

  /**
   * Returns the Center data and template.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.paramMap.get('centerId');
    return this.centersService.retrieveOne14({
      centerId: parseInt(centerId, 10),
      staffInSelectedOfficeOnly: true,
      template: 'true'
    } as any);
  }
}
