/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { CollateralManagementService } from '@fineract/client';

/**
 * Charges data resolver.
 */
@Injectable()
export class CollateralResolver {
  constructor(private collateralManagementService: CollateralManagementService) {}

  /**
   * Returns the products data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const collateralId = route.paramMap.get('id');
    return this.collateralManagementService.getCollateral({ collateralId: +collateralId });
  }
}
