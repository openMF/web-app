/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CentersService } from '../centers.service';

/**
 * Centers data resolver.
 */
@Injectable()
export class CenterResourceResolver {
  private centersService = inject(CentersService);

  /**
   * Returns the Centers data for General Tab.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.paramMap.get('centerId');
    return this.centersService.getCenterData(centerId);
  }
}
