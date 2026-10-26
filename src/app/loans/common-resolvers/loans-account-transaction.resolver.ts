/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';
import { LoanBaseResolver } from './loan-base.resolver';

/**
 * Loans Account Transaction data resolver.
 */
@Injectable()
export class LoansAccountTransactionResolver extends LoanBaseResolver {
  private loansService = inject(LoansService);

  constructor() {
    super();
  }

  /**
   * Returns the Loans Account Transaction data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.initialize(route);
    const loanId = route.paramMap.get('loanId');
    const transactionId = route.paramMap.get('id');
    if (
      loanId === null ||
      transactionId === null ||
      Number.isNaN(Number(loanId)) ||
      Number.isNaN(Number(transactionId))
    ) {
      throw new Error('Invalid loan or transaction route params');
    }
    return this.loansService.getLoansAccountTransaction(this.loanAccountPath, loanId, transactionId);
  }
}
