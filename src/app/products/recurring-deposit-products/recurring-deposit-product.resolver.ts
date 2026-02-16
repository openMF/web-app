/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { RecurringDepositProductService } from '@fineract/client';

/**
 * Recurring Deposit Product data resolver.
 */
@Injectable()
export class RecurringDepositProductResolver {
  constructor(private recurringDepositProductService: RecurringDepositProductService) {}

  /**
   * Returns the recurring deposit product data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.paramMap.get('productId');
    return this.recurringDepositProductService.retrieveOne23({ productId: +productId });
  }
}
