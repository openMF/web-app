/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Chart of accounts template data resolver.
 */
@Injectable()
export class ChartOfAccountsTemplateResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the chart of accounts template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getChartOfAccountsTemplate();
  }
}
