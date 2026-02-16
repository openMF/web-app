/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { RecurringDepositProductService } from '@fineract/client';

/**
 * Recurring Deposits Account Template resolver.
 */
@Injectable()
export class RecurringDepositProductAndTemplateResolver {
  constructor(private recurringDepositProductService: RecurringDepositProductService) {}

  /**
   * Returns the Recurring Deposits Product and Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const productId = route.parent.paramMap.get('productId');
    return this.recurringDepositProductService.retrieveOne23({ productId: +productId });
  }
}
