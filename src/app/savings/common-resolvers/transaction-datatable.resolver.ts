// Angular Imports
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

// rxjs Imports
import { Observable } from 'rxjs';

// Custom Service
import { SavingsService } from '../savings.service';

@Injectable()
export class TransactionDatatableResolver implements Resolve<Object> {
  /**
   *
   * @param {SavingsService} savingsService
   */
  constructor(private savingsService: SavingsService) { }
  /**
   * Returns the Transactions Account's Datatable data.
   * @returns {Observable<any>}
   */

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const accountId = route.parent.parent.paramMap.get('id');
    const datatableName = route.paramMap.get('datatableName');
    return this.savingsService.getSavingsTransactionDatatable(accountId, datatableName);
  }
}
