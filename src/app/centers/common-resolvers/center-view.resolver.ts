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
export class CenterViewResolver {
  private centersService = inject(CentersService);

  /**
   * Returns the Centers data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.paramMap.get('centerId');
    return this.centersService.getCenterData(centerId);
  }
}
