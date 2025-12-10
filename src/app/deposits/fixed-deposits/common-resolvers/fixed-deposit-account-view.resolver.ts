/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { FixedDepositsService } from 'app/deposits/fixed-deposits/fixed-deposits.service';

/**
 * Fixed Deposits Account data resolver.
 */
@Injectable()
export class FixedDepositsAccountViewResolver {
  private fixedDepositsService = inject(FixedDepositsService);

  /**
   * Returns the Fixed Deposits Account data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const fixedDepositAccountId = route.paramMap.get('fixedDepositAccountId');
    return this.fixedDepositsService.getFixedDepositsAccountData(fixedDepositAccountId);
  }
}
