/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * loan datatables resolver.
 */
@Injectable()
export class LoanDatatablesResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the loan datatables.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.loansService.getLoanDataTables();
  }
}
