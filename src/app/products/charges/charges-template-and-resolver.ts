/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { ChargesService } from '@fineract/client';

@Injectable()
export class ChargesTemplateAndResolver {
  constructor(private chargesService: ChargesService) {}

  /**
   * Returns the changes template and data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingProductId = route.paramMap.get('id');
    return this.chargesService.retrieveCharge({ chargeId: +savingProductId });
  }
}
