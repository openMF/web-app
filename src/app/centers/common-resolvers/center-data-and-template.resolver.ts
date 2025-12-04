/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CentersService } from '../centers.service';

/**
 * Centers data and template resolver.
 */
@Injectable()
export class CenterDataAndTemplateResolver {
  private centersService = inject(CentersService);

  /**
   * Returns the Centers and template data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.paramMap.get('centerId');
    return this.centersService.getCenterAndTemplateData(centerId);
  }
}
