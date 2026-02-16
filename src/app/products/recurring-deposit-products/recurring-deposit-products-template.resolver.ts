/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { RecurringDepositProductService } from '@fineract/client';

@Injectable()
export class RecurringDepositProductsTemplateResolver {
  constructor(private recurringDepositProductService: RecurringDepositProductService) {}

  /**
   * Returns the recurring deposit products template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.recurringDepositProductService.retrieveOne23({ productId: 0 });
  }
}
