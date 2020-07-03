/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { RecurringDepositsService } from '../recurring-deposits.service';

/**
 * RecurringDeposits Account data resolver.
 */
@Injectable()
export class RecurringDepositsAccountDataResolver implements Resolve<Object> {

  /**
   * @param {RecurringDepositsService} RecurringDepositsService RecurringDeposits service.
   */
  constructor(private recurringDepositsService: RecurringDepositsService) { }

  /**
   * Returns the RecurringDeposits Account data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const recurringDepositAccountId = route.parent.paramMap.get('recurringDepositAccountId');
    return this.recurringDepositsService.getRecurringDepositsAccountData(recurringDepositAccountId);
  }

}
