/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { CollateralManagementService } from '@fineract/client';

/**
 * Collaterals Template Resolver
 */
@Injectable()
export class CollateralTemplateResolver {
  constructor(private collateralManagementService: CollateralManagementService) {}

  /**
   * Returns the product Data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.collateralManagementService.getCollateralTemplate();
  }
}
