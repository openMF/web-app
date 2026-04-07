/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { FixedDepositProductService } from '@fineract/client';

/**
 * Fixed Deposit Products data resolver.
 */
@Injectable()
export class FixedDepositProductsResolver {
  constructor(private fixedDepositProductService: FixedDepositProductService) {}

  /**
   * Returns the fixed deposit products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.fixedDepositProductService.retrieveAll30();
  }
}
