/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { ChargesService } from '@fineract/client';

/**
 * Charge data resolver.
 */
@Injectable()
export class ChargeResolver {
  constructor(private chargesService: ChargesService) {}

  /**
   * Returns the charge data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const chargeId = route.paramMap.get('id');
    return this.chargesService.retrieveCharge({ chargeId: +chargeId });
  }
}
