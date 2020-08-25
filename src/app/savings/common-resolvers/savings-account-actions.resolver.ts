/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Savings Account Actions data resolver.
 */
@Injectable()
export class SavingsAccountActionsResolver implements Resolve<Object> {

  /**
   * @param {SavingsService} SavingsService Savings service.
   */
  constructor(private savingsService: SavingsService) { }

  /**
   * Returns the Savings account actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const savingAccountId = route.paramMap.get('savingAccountId') || route.parent.parent.paramMap.get('savingAccountId');
    switch (actionName) {
      case 'Assign Staff':
        return this.savingsService.getSavingsAccountAndTemplate(savingAccountId, true);
      case 'Add Charge':
        return this.savingsService.getSavingsChargeTemplateResource(savingAccountId);
      case 'Withdrawal':
      case 'Deposit':
        return this.savingsService.getSavingsTransactionTemplateResource(savingAccountId);
      case 'Close':
        return forkJoin([
          this.savingsService.getSavingsTransactionTemplateResource(savingAccountId),
          this.savingsService.getSavingsAccountData(savingAccountId)
        ]);
      case 'Apply Annual Fees':
        return this.savingsService.getSavingsAccountData(savingAccountId);
      default:
        return undefined;
    }
  }

}
