/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Financial activity mappings data resolver.
 */
@Injectable()
export class FinancialActivityMappingsResolver {
  private accountingService = inject(AccountingService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor() {}

  /**
   * Returns the financial activity mappings data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getFinancialActivityAccounts();
  }
}
