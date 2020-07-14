/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CentersService } from '../centers.service';

/**
 * Group Actions data resolver.
 */
@Injectable()
export class CenterActionsResolver implements Resolve<Object> {

  /**
   * @param {CentersService} centersService Savings service.
   */
  constructor(private centersService: CentersService) { }

  /**
   * Returns the Centers account actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const centerId = route.paramMap.get('centerId') || route.parent.parent.paramMap.get('centerId');
    switch (actionName) {
      case 'Assign Staff':
        return this.centersService.getGroupStaffData(centerId);
      default:
        return undefined;
    }
  }

}
