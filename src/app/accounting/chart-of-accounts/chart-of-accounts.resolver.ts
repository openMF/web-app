/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GeneralLedgerAccountService } from '@fineract/client';

/**
 * Chart of acocunts data resolver.
 */
@Injectable()
export class ChartOfAccountsResolver {
  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor(private generalLedgerAccountService: GeneralLedgerAccountService) {}

  /**
   * Returns the chart of accounts data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.generalLedgerAccountService.retrieveAllAccounts();
  }
}
