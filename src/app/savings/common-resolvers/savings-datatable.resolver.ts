/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Savings Datatable data resolver.
 */
@Injectable()
export class SavingsDatatableResolver implements Resolve<Object> {

  /**
   * @param {SavingsService} SavingsService Savings service.
   */
  constructor(private savingsService: SavingsService) { }

  /**
   * Returns the Savings Account's Datatable data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const accountId = route.parent.parent.paramMap.get('savingAccountId') || route.parent.parent.paramMap.get('fixedDepositAccountId') || route.parent.parent.paramMap.get('recurringDepositAccountId');
    const datatableName = route.paramMap.get('datatableName');
    return this.savingsService.getSavingsDatatable(accountId, datatableName);
  }

}
