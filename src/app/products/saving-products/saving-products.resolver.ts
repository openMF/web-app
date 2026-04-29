/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { SavingsProductService } from '@fineract/client';

/**
 * Saving products data resolver.
 */
@Injectable()
export class SavingProductsResolver {
  constructor(private savingsProductService: SavingsProductService) {}

  /**
   * Returns the saving products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.savingsProductService.retrieveAll34();
  }
}
