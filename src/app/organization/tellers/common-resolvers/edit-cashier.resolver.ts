/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TellerCashManagementService } from '@fineract/client';

/**
 * Cashier Template resolver.
 */
@Injectable()
export class EditCashierResolver {
  /**
   * @param {TellerCashManagementService} tellerCashManagementService Teller Cash Management service.
   */
  constructor(private tellerCashManagementService: TellerCashManagementService) {}

  /**
   * Returns the cashier template.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const tellerId = Number(route.parent.parent.paramMap.get('id'));
    return this.tellerCashManagementService.getCashierTemplate({ tellerId });
  }
}
