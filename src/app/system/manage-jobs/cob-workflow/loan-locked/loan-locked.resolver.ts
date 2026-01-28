import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { LoanAccountLockService } from '@fineract/client';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanLockedResolver {
  /**
   * @param {LoanAccountLockService} loanAccountLockService Loan Account Lock service.
   */
  constructor(private loanAccountLockService: LoanAccountLockService) {}

  /**
   * Returns all the loans data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.loanAccountLockService.retrieveLockedAccounts();
  }
}
