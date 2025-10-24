/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Savings Account Charge data resolver.
 */
@Injectable()
export class SavingsAccountChargeResolver {
  private savingsService = inject(SavingsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SavingsService} SavingsService Savings service.
   */
  constructor() {}

  /**
   * Returns the Savings Account Charge data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.parent.paramMap.get('savingAccountId');
    const chargeId = route.paramMap.get('id');
    return this.savingsService.getSavingsAccountCharge(savingAccountId, chargeId);
  }
}
