/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Savings Account Transaction Template data resolver.
 */
@Injectable()
export class SavingsAccountTransactionTemplateResolver {
  private savingsService = inject(SavingsService);

  /**
   * Returns the Savings Account Transaction Template data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.parent.paramMap.get('savingAccountId');
    const transactionId = route.paramMap.get('id');
    return this.savingsService.getSavingsAccountTransactionTemplate(savingAccountId, transactionId);
  }
}
