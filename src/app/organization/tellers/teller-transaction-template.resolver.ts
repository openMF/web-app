/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TellerCashManagementService } from '@fineract/client';

/**
 * Cashier transaction data resolver.
 */
@Injectable()
export class CashierTransactionTemplateResolver implements Resolve<Object> {
  /**
   * @param {TellerCashManagementService} tellerCashManagementService Teller Cash Management Service.
   */
  constructor(private tellerCashManagementService: TellerCashManagementService) {}

  /**
   * Returns the cashier transaction data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const cashierId = Number(route.parent.paramMap.get('id'));
    const tellerId = Number(route.parent.parent.paramMap.get('id'));
    return this.tellerCashManagementService.getCashierTxnTemplate({
      tellerId: tellerId,
      cashierId: cashierId
    });
  }
}
