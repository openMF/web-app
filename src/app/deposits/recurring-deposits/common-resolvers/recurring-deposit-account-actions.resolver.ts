/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { RecurringDepositsService } from '../recurring-deposits.service';

/**
 * Recurring Deposits Account Actions data resolver.
 */
@Injectable()
export class RecurringDepositsAccountActionsResolver implements Resolve<Object> {

  /**
   * @param {SavingsService} SavingsService Savings service.
   * @param {RecurringDepositsService} recurringDepositsService Recurring Deposits Service.
   */
  constructor(private savingsService: SavingsService,
    private recurringDepositsService: RecurringDepositsService) { }

  /**
   * Returns the Recurring deposits account actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const recurringDepositAccountId = route.paramMap.get('recurringDepositAccountId') || route.parent.parent.paramMap.get('recurringDepositAccountId');
    switch (actionName) {
      case 'Add Charge':
        return this.savingsService.getSavingsChargeTemplateResource(recurringDepositAccountId);
      case 'Close':
        return this.recurringDepositsService.getRecurringDepositAccountActionResource(recurringDepositAccountId, 'close');
      case 'Deposit':
        return this.recurringDepositsService.getRecurringDepositAccountTransactionTemplateResource(recurringDepositAccountId, 'deposit');
      default:
        return undefined;
    }
  }

}
