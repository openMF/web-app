/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingRulesService } from '@fineract/client';

/**
 * Accounting rules associations data resolver.
 */
@Injectable()
export class AccountingRulesAssociationsResolver {
  /**
   * @param {AccountingRulesService} accountingRulesService Accounting Rules service.
   */
  constructor(private accountingRulesService: AccountingRulesService) {}

  /**
   * Returns the accounting rules associations data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingRulesService.retrieveAllAccountingRules();
  }
}
