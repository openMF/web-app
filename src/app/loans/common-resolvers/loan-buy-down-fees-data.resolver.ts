import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LoansService } from '../loans.service';

@Injectable()
export class LoanBuyDownFeesDataResolver implements Resolve<Object> {
  private loansService = inject(LoansService);

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');

    if (!loanId) {
      console.error('LoanBuyDownFeesDataResolver: Could not find loanId in route parameters');
      return new Observable((observer) => {
        observer.next([]);
        observer.complete();
      });
    }

    return this.loansService.getBuyDownFeeData(loanId);
  }
}
