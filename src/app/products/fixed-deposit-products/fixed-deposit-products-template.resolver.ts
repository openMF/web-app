/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { FixedDepositProductService } from '@fineract/client';

@Injectable()
export class FixedDepositProductsTemplateResolver {
  constructor(private fixedDepositProductService: FixedDepositProductService) {}

  /**
   * Returns the fixed deposit products template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.fixedDepositProductService.retrieveOne20({ productId: 0 });
  }
}
