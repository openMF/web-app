/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Accounting rules associations data resolver.
 */
@Injectable()
export class AccountingRulesAssociationsResolver {
  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor(private accountingService: AccountingService) {}

  /**
   * Returns the accounting rules associations data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getAccountingRules(true);
  }
}
