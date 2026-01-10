import { Injectable, inject } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { LoansService } from '../loans.service';

@Injectable({
  providedIn: 'root'
})
export class LoanReschedulesResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the Loans data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    return this.loansService.loanRescheduleRequests(loanId);
  }
}
