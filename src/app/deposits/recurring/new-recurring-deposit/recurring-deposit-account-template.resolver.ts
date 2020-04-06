/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { DepositsService } from '../../deposits.service';

/**
 * Recurring Deposit Account Template resolver.
 */
@Injectable()
export class RecurringDepositAccountTemplateResolver implements Resolve<Object> {

  /**
   * @param {DepositsService} DepositsService Deposits service.
   */
  constructor(private depositsService: DepositsService) {}

  /**
   * Returns the Deposit Account Template Data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('clientId');
    const params = {
      clientId: id
    };
    return this.depositsService.getRecurringDepositAccountsTemplate(params);
  }
}
