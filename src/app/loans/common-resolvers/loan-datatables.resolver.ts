/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * loan datatables resolver.
 */
@Injectable()
export class LoanDatatablesResolver {
  /**
   * @param {loansService} loansService loans service.
   */
  constructor(private loansService: LoansService) {}

  /**
   * Returns the loan datatables.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.loansService.getLoanDataTables();
  }
}
