/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * GL accounts data resolver.
 */
@Injectable()
export class GlAccountsResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the gl accounts data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getGlAccounts();
  }
}
