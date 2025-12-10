// Angular Imports
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

// rxjs Imports
import { Observable } from 'rxjs';

// Custom Service
import { SavingsService } from '../savings.service';

@Injectable()
export class TransactionDatatablesResolver {
  private savingsService = inject(SavingsService);

  /**
   *
   * @param route
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.savingsService.getSavingsTransactionDatatables();
  }
}
