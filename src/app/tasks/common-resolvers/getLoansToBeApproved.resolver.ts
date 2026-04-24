/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '@fineract/client';

/**
 * Loans data resolver.
 */
@Injectable()
export class GetLoansToBeApproved {
  /**
   * @param {LoansService} loansService Loans service.
   */
  constructor(private loansService: LoansService) {}

  /**
   * Returns all the loans data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.loansService.retrieveAll27();
  }
}
