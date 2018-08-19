/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * GL accounts data resolver.
 */
@Injectable()
export class GlAccountsResolver implements Resolve<Object> {

  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor(private accountingService: AccountingService) {}

  /**
   * Returns the gl accounts data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getGlAccounts();
  }

}
