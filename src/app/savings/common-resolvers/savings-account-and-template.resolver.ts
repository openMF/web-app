/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsAccountService } from '@fineract/client';

/**
 * Savings Account data and template resolver.
 */
@Injectable()
export class SavingsAccountAndTemplateResolver {
  /**
   * @param {SavingsAccountService} savingsAccountService Savings Account Service
   */
  constructor(private savingsAccountService: SavingsAccountService) {}

  /**
   * Returns the Savings Account data and template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.paramMap.get('savingAccountId');
    return this.savingsAccountService.retrieveOne25({
      accountId: savingAccountId ? parseInt(savingAccountId, 10) : 0,
      staffInSelectedOfficeOnly: true
    });
  }
}
