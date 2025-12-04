/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Accounting rule data resolver.
 */
@Injectable()
export class AccountingRuleResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the accounting rule data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.accountingService.getAccountingRule(id);
  }
}
