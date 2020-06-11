/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Saving Accounts Datatables data resolver.
 */
@Injectable()
export class SavingsDatatablesResolver implements Resolve<Object> {

  /**
   * @param {SavingsService} SavingsService Savings service.
   */
  constructor(private savingsService: SavingsService) { }

  /**
   * Returns the Saving Account's Datatables data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.savingsService.getSavingsDatatables();
  }

}
