/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { FixedDepositsService } from '../fixed-deposits.service';

/**
 * Fixed Deposits Account Transaction data resolver.
 */
@Injectable()
export class FixedDepositsAccountTransactionResolver {
  private fixedDepositsService = inject(FixedDepositsService);

  /**
   * Returns the Fixed Deposits Account Transaction data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const fixedDepositAccountId = route.parent.paramMap.get('fixedDepositAccountId');
    const transactionId = route.paramMap.get('id');
    return this.fixedDepositsService.getFixedDepositsAccountTransaction(fixedDepositAccountId, transactionId);
  }
}
