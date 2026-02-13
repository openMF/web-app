/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsAccountService } from '@fineract/client';

/**
 * Savings Account Charge data resolver.
 */
@Injectable()
export class SavingsAccountChargeResolver {
  /**
   * @param {SavingsAccountService} savingsAccountService Savings Account service.
   */
  constructor(private savingsAccountService: SavingsAccountService) {}

  /**
   * Returns the Savings Account Charge data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.parent.paramMap.get('savingAccountId');
    const chargeId = route.paramMap.get('id');
    return this.savingsAccountService.retrieveOne25({
      accountId: Number(savingAccountId),
      chargeStatus: 'all'
    });
  }
}
