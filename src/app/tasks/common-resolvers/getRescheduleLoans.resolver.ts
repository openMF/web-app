/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { RescheduleLoansService } from '@fineract/client';

/**
 * Pending Reschedule Loans data resolver.
 */
@Injectable()
export class GetRescheduleLoans {
  /**
   * @param {RescheduleLoansService} rescheduleLoansService Reschedule Loans service.
   */
  constructor(private rescheduleLoansService: RescheduleLoansService) {}

  /**
   * Returns the pending reschedule data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.rescheduleLoansService.retrieveAllRescheduleRequest();
  }
}
