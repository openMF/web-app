/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Accounting rules data resolver.
 */
@Injectable()
export class AccountingRulesResolver {
  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor(private accountingService: AccountingService) {}

  /**
   * Returns the accounting rules data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getAccountingRules();
  }
}
