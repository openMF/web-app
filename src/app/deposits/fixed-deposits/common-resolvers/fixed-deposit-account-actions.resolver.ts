/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { FixedDepositsService } from '../fixed-deposits.service';

/**
 * Fixed Deposits Account Actions data resolver.
 */
@Injectable()
export class FixedDepositsAccountActionsResolver {
  private savingsService = inject(SavingsService);
  private fixedDepositsService = inject(FixedDepositsService);

  /**
   * Returns the Fixed deposits account actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const fixedDepositAccountId =
      route.paramMap.get('fixedDepositAccountId') || route.parent.parent.paramMap.get('fixedDepositAccountId');
    switch (actionName) {
      case 'Add Charge':
        return this.savingsService.getSavingsChargeTemplateResource(fixedDepositAccountId);
      case 'Close':
        return this.fixedDepositsService.getFixedDepositsAccountClosureTemplate(fixedDepositAccountId);
      case 'Withdrawal':
        return this.fixedDepositsService.getFixedDepositsAccountTransactionTemplate(fixedDepositAccountId);
      default:
        return undefined;
    }
  }
}
