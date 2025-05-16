// Angular Imports
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

// rxjs Imports
import { Observable } from 'rxjs';

// Custom Service
import { SavingsService } from '../savings.service';

@Injectable()
export class TransactionDatatablesResolver {
  /**
   *
   * @param savingsService Savings Service
   */
  constructor(private savingsService: SavingsService) {}
  /**
   *
   * @param route
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.savingsService.getSavingsTransactionDatatables();
  }
}
