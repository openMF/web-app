/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Financial activity mapping and template data resolver.
 */
@Injectable()
export class FinancialActivityMappingAndTemplateResolver {
  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor(private accountingService: AccountingService) {}

  /**
   * Returns the financial activity mapping and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const financialActivityAccountId = route.paramMap.get('id');
    return this.accountingService.getFinancialActivityAccount(financialActivityAccountId, true);
  }
}
