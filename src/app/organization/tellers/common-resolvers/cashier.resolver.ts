/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TellerCashManagementService } from '@fineract/client';

/**
 * Cashier data resolver.
 */
@Injectable()
export class CashierResolver {
  /**
   * @param {TellerCashManagementService} tellerCashManagementService Teller Cash Management service.
   */
  constructor(private tellerCashManagementService: TellerCashManagementService) {}

  /**
   * Returns the cashier data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const cashierId = Number(route.paramMap.get('id'));
    const tellerId = Number(route.parent.parent.paramMap.get('id'));
    return this.tellerCashManagementService.getCashierData1({
      tellerId: tellerId
    });
  }
}
