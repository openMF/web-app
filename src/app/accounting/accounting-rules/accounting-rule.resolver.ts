/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingRulesService } from '@fineract/client';

/**
 * Accounting rule data resolver.
 */
@Injectable()
export class AccountingRuleResolver {
  /**
   * @param {AccountingRulesService} accountingService Accounting service.
   */
  constructor(private accountingService: AccountingRulesService) {}

  /**
   * Returns the accounting rule data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.accountingService.retreiveAccountingRule({ accountingRuleId: parseInt(id, 10) });
  }
}
