/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Saving Accounts Datatables data resolver.
 */
@Injectable()
export class SavingsDatatablesResolver {
  private savingsService = inject(SavingsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SavingsService} SavingsService Savings service.
   */
  constructor() {}

  /**
   * Returns the Saving Account's Datatables data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.savingsService.getSavingsDatatables();
  }
}
