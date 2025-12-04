/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Financial activity mapping data resolver.
 */
@Injectable()
export class FinancialActivityMappingResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the financial activity mapping data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const financialActivityAccountId = route.paramMap.get('id');
    return this.accountingService.getFinancialActivityAccount(financialActivityAccountId, false);
  }
}
