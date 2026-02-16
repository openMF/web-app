/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { CollateralManagementService } from '@fineract/client';

/**
 * Collaterals data resolver
 */
@Injectable()
export class CollateralsResolver {
  constructor(private collateralManagementService: CollateralManagementService) {}

  /**
   * Returns the All Collaterals Data
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.collateralManagementService.getAllCollaterals();
  }
}
