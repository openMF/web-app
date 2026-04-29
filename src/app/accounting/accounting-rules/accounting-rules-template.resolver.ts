/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingRulesService } from '@fineract/client';

/**
 * Accounting rules template data resolver.
 */
@Injectable()
export class AccountingRulesTemplateResolver {
  /**
   * @param {AccountingRulesService} accountingRulesService Accounting Rules service.
   */
  constructor(private accountingRulesService: AccountingRulesService) {}

  /**
   * Returns the accounting rules template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingRulesService.retrieveTemplate1();
  }
}
