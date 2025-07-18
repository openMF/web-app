/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GeneralLedgerAccountService } from '@fineract/client';

/**
 * GL accounts data resolver.
 */
@Injectable()
export class GlAccountsResolver {
  /**
   * @param {GeneralLedgerAccountService} generalLedgerAccountService General Ledger Account service.
   */
  constructor(private generalLedgerAccountService: GeneralLedgerAccountService) {}

  /**
   * Returns the gl accounts data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.generalLedgerAccountService.retrieveAllAccounts({
      manualEntriesAllowed: true,
      usage: 1,
      disabled: false
    });
  }
}
