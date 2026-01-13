/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
