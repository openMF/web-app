/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { FixedDepositsService } from '../fixed-deposits.service';

/**
 * Fixed Deposits Account Template resolver.
 */
@Injectable()
export class FixedDepositsAccountAndTemplateResolver implements Resolve<Object> {

  /**
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits service.
   */
  constructor(private fixedDepositsService: FixedDepositsService) { }

  /**
   * Returns the Fixed Deposits Account Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const fixedDepositAccountId = route.paramMap.get('fixedDepositAccountId');
    return this.fixedDepositsService.getFixedDepositsAccountAndTemplate(fixedDepositAccountId);
  }

}
