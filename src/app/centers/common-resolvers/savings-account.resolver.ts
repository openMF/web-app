/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CentersService } from '../centers.service';

/**
 * Centers data resolver.
 */
@Injectable()
export class SavingsAccountResolver {
  /**
   * @param {CentersService} CentersService Centers service.
   */
  constructor(private centersService: CentersService) {}

  /**
   * Returns the Center Savings Account data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.paramMap.get('centerId');
    return this.centersService.getSavingsAccountDetails(centerId);
  }
}
