/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { RecurringDepositProductService } from '@fineract/client';

/**
 * Recurring Deposit Products data resolver.
 */
@Injectable()
export class RecurringDepositProductsResolver {
  constructor(private recurringDepositProductService: RecurringDepositProductService) {}

  /**
   * Returns the recurring deposit products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.recurringDepositProductService.retrieveAll32();
  }
}
