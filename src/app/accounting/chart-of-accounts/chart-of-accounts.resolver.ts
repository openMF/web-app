/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Chart of acocunts data resolver.
 */
@Injectable()
export class ChartOfAccountsResolver {
  private accountingService = inject(AccountingService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor() {}

  /**
   * Returns the chart of accounts data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getChartOfAccounts();
  }
}
