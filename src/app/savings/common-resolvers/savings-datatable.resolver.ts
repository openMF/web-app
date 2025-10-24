/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Savings Datatable data resolver.
 */
@Injectable()
export class SavingsDatatableResolver {
  private savingsService = inject(SavingsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SavingsService} SavingsService Savings service.
   */
  constructor() {}

  /**
   * Returns the Savings Account's Datatable data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const accountId =
      route.parent.parent.paramMap.get('savingAccountId') ||
      route.parent.parent.paramMap.get('fixedDepositAccountId') ||
      route.parent.parent.paramMap.get('recurringDepositAccountId');
    const datatableName = route.paramMap.get('datatableName');
    return this.savingsService.getSavingsDatatable(accountId, datatableName);
  }
}
