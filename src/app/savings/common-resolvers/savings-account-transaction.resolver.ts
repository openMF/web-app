/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsAccountTransactionsService } from '@fineract/client';

/**
 * Savings Account Transaction data resolver.
 */
@Injectable()
export class SavingsAccountTransactionResolver {
  /**
   * @param {SavingsAccountTransactionsService} SavingsAccountTransactionsService Savings Account Transactions Service.
   */
  constructor(private savingsAccountTransactionsService: SavingsAccountTransactionsService) {}

  /**
   * Returns the Savings Account Transaction data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.parent.paramMap.get('savingAccountId');
    const transactionId = route.parent.paramMap.get('id');
    if (savingAccountId && transactionId) {
      return this.savingsAccountTransactionsService.retrieveOne24({
        savingsId: Number(savingAccountId),
        transactionId: Number(transactionId)
      });
    }
    throw new Error('Required parameters missing');
  }
}
