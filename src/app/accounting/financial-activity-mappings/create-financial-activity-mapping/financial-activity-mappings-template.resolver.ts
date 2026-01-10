/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Financial activity mappings template data resolver.
 */
@Injectable()
export class FinancialActivityMappingsTemplateResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the financial activity mappings template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getFinancialActivityAccountsTemplate();
  }
}
