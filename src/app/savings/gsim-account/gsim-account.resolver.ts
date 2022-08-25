/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * GSIM Account data resolver.
 */
@Injectable()
export class GSIMViewResolver implements Resolve<Object> {

  /**
   * @param {SavingsService} savingsService Savings service.
   */
  constructor(private savingsService: SavingsService) { }

  /**
   * Returns the Savings Account data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.paramMap.get('groupId');
    const savingAccountId = route.paramMap.get('savingAccountId');
    return this.savingsService.getGSIMAccountData(savingAccountId, groupId);
  }

}
