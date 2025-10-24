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

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {loansService} loansService loans service.
   */
  constructor() {}

  /**
   * Returns the loan datatables.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.loansService.getLoanDataTables();
  }
}
