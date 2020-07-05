/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { FixedDepositsService } from '../fixed-deposits.service';

/**
 * Fixed Deposits Account Actions data resolver.
 */
@Injectable()
export class FixedDepositsAccountActionsResolver implements Resolve<Object> {

  /**
   * @param {SavingsService} SavingsService Savings service.
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits Service.
   */
  constructor(private savingsService: SavingsService,
              private fixedDepositsService: FixedDepositsService) { }

  /**
   * Returns the Fixed deposits account actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const fixedDepositAccountId = route.paramMap.get('fixedDepositAccountId') || route.parent.parent.paramMap.get('fixedDepositAccountId');
    switch (actionName) {
      case 'Add Charge':
        return this.savingsService.getSavingsChargeTemplateResource(fixedDepositAccountId);
      case 'Close':
        return this.fixedDepositsService.getFixedDepositsAccountClosureTemplate(fixedDepositAccountId);
      default:
        return undefined;
    }
  }

}
