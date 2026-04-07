/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsAccountService } from '@fineract/client';

/**
 * Savings Account data resolver.
 */
@Injectable()
export class SavingsAccountViewResolver {
  /**
   * @param {SavingsAccountService} savingsAccountService Savings Account service.
   */
  constructor(private savingsAccountService: SavingsAccountService) {}

  /**
   * Returns the Savings Account data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.paramMap.get('savingAccountId');
    return this.savingsAccountService.retrieveOne25({
      accountId: Number(savingAccountId)
    });
  }
}
