/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TellerCashManagementService } from '@fineract/client';

/**
 * Cashiers data resolver.
 */
@Injectable()
export class CashiersResolver {
  /**
   * @param {TellerCashManagementService} tellerCashManagementService Teller Cash Management service.
   */
  constructor(private tellerCashManagementService: TellerCashManagementService) {}

  /**
   * Returns the cashiers data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const tellerId = Number(route.parent.paramMap.get('id'));
    return this.tellerCashManagementService.getCashierData1({ tellerId });
  }
}
