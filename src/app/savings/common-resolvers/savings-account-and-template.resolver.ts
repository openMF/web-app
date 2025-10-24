/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Savings Account data and template resolver.
 */
@Injectable()
export class SavingsAccountAndTemplateResolver {
  private savingsService = inject(SavingsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SavingsService} SavingsService Savings service.
   */
  constructor() {}

  /**
   * Returns the Savings Account data and template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.paramMap.get('savingAccountId');
    return this.savingsService.getSavingsAccountAndTemplate(savingAccountId, true);
  }
}
