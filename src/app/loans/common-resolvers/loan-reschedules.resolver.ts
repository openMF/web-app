import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { RescheduleLoansService } from '@fineract/client';

@Injectable({
  providedIn: 'root'
})
export class LoanReschedulesResolver {
  /**
   * @param {RescheduleLoansService} rescheduleLoansService Reschedule loans service.
   */
  constructor(private rescheduleLoansService: RescheduleLoansService) {}

  /**
   * Returns the Loans data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    return this.rescheduleLoansService.retrieveAllRescheduleRequest({
      loanId: Number(loanId)
    });
  }
}
