/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Savings Charge Template data resolver.
 */
@Injectable()
export class SavingsChargeTemplateResolver implements Resolve<Object> {

  /**
   * @param {SavingsService} SavingsService savings service.
   */
  constructor(private savingsService: SavingsService) {}

  /**
   * Returns the Savings Charge Template.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.paramMap.get('savingAccountId');
    return this.savingsService.getSavingsChargeTemplateResource(savingAccountId);
  }
}
