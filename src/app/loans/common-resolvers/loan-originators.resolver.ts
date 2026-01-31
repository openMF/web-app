/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanOriginatorsResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the Loans data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') ?? route.parent?.paramMap.get('loanId');
    if (!loanId) {
      return throwError(() => new Error('Missing loanId route param'));
    }
    return this.loansService.getLoanOriginators(loanId);
  }
}
