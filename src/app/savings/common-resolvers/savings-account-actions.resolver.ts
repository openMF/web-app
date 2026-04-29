/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin } from 'rxjs';

/** Custom Services */
import { SavingsAccountService, SavingsChargesService, SavingsAccountTransactionsService } from '@fineract/client';

/**
 * Savings Account Actions data resolver.
 */
@Injectable()
export class SavingsAccountActionsResolver {
  /**
   * @param {SavingsAccountService} SavingsAccountService Savings account service.
   * @param {SavingsChargesService} savingsChargesService Savings charges service.
   * @param {SavingsAccountTransactionsService} savingsService Savings account transactions service.
   */
  constructor(
    private savingsAccountService: SavingsAccountService,
    private savingsChargesService: SavingsChargesService,
    private savingsAccountTransactionsService: SavingsAccountTransactionsService
  ) {}

  /**
   * Returns the Savings account actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const savingAccountId =
      route.paramMap.get('savingAccountId') || route.parent.parent.paramMap.get('savingAccountId');
    switch (actionName) {
      case 'Assign Staff':
        return this.savingsAccountService.retrieveOne25({
          accountId: parseInt(savingAccountId as string, 10),
          staffInSelectedOfficeOnly: true
        });
      case 'Add Charge':
        return this.savingsChargesService.retrieveTemplate18({
          savingsAccountId: parseInt(savingAccountId as string, 10)
        });
      case 'Withdrawal':
      case 'Deposit':
      case 'Hold Amount':
        return this.savingsAccountTransactionsService.retrieveTemplate19({
          savingsId: parseInt(savingAccountId as string, 10)
        });
      case 'Close':
        return forkJoin([
          this.savingsAccountTransactionsService.retrieveTemplate19({
            savingsId: parseInt(savingAccountId as string, 10)
          }),
          this.savingsAccountService.retrieveOne25({
            accountId: parseInt(savingAccountId as string, 10)
          })

        ]);
      case 'Apply Annual Fees':
        return this.savingsAccountService.retrieveOne25({
          accountId: parseInt(savingAccountId as string, 10)
        });
      default:
        return undefined;
    }
  }
}
