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
   * @param {CentersService} CentersService Centers service.
   */
  constructor(private centersService: CentersService) {}

  /**
   * Returns the Centers and template data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.paramMap.get('centerId');
    return this.centersService.retrieveOne14({ centerId: Number(centerId) });
  }
}
