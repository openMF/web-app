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

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   *
   * @param savingsService Savings Service
   */
  constructor() {}
  /**
   *
   * @param route
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.savingsService.getSavingsTransactionDatatables();
  }
}
