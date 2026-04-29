/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsAccountTransactionsService } from '@fineract/client';

/**
 * Savings Account Transaction Template data resolver.
 */
@Injectable()
export class SavingsAccountTransactionTemplateResolver {
  /**
   * @param SavingsAccountTransactionsService savingsAccountTransactionsService Savings Account Transactions Service
   */
  constructor(private savingsAccountTransactionsService: SavingsAccountTransactionsService) {}

  /**
   * Returns the Savings Account Transaction Template data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.parent.paramMap.get('savingAccountId');
    const transactionId = route.paramMap.get('id');
    return this.savingsAccountTransactionsService.retrieveOne24({
      savingsId: Number(savingAccountId),
      transactionId: Number(transactionId)
    });
  }
}
