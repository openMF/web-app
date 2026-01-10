/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Loan products data resolver.
 */
@Injectable()
export class LoanProductsResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the loan products data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getLoanProducts();
  }
}
