/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { LoanBaseResolver } from '../loan-base.resolver';
import { LoansService } from 'app/loans/loans.service';
import { WorkingCapitalNearBreachActions } from 'app/loans/models/working-capital/working-capital-loan-account.model';

@Injectable({
  providedIn: 'root'
})
export class LoanNearBreachActionsResolver extends LoanBaseResolver {
  private loansService = inject(LoansService);

  constructor() {
    super();
  }

  /**
   * Returns the Near Breach data if exists.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<WorkingCapitalNearBreachActions[]> | null {
    this.initialize(route);
    const loanId = route.paramMap.get('loanId') ?? route.parent?.paramMap.get('loanId');
    const isValidLoanId = loanId !== null && loanId.trim() !== '' && Number.isFinite(Number(loanId));
    if (isValidLoanId && this.isWorkingCapital) {
      return this.loansService.getWorkingCapitalLoanNearBreachActions(loanId).pipe(catchError(() => of([])));
    }
    return null;
  }
}
