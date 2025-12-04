/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CentersService } from '../centers.service';

/**
 * Centers notes data resolver.
 */
@Injectable()
export class CenterDatatableResolver {
  private centersService = inject(CentersService);

  /**
   * Returns the Centers Notes Data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.parent.paramMap.get('centerId');
    const datatableName = route.paramMap.get('datatableName');
    return this.centersService.getCenterDatatable(centerId, datatableName);
  }
}
