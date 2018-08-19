/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Chart of acocunts data resolver.
 */
@Injectable()
export class ChartOfAccountsResolver implements Resolve<Object> {

  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor(private accountingService: AccountingService) {}

  /**
   * Returns the chart of accounts data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getChartOfAccounts();
  }

}
