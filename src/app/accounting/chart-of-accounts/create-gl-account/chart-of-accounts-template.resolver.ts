/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GeneralLedgerAccountService } from '@fineract/client';

/**
 * Chart of accounts template data resolver.
 */
@Injectable()
export class ChartOfAccountsTemplateResolver {
  /**
   * @param {GeneralLedgerAccountService} generalLedgerAccountService General Ledger Account service.
   */
  constructor(private generalLedgerAccountService: GeneralLedgerAccountService) {}

  /**
   * Returns the chart of accounts template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.generalLedgerAccountService.getGlAccountsTemplate();
  }
}
