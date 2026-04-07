/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Directive, inject, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';

@Directive()
export abstract class LoanAccountActionsBaseComponent {
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected loanProductService = inject(LoanProductService);
  protected loanService = inject(LoansService);
  protected settingsService = inject(SettingsService);

  /** Loan Id. */
  protected loanId: string;

  @Input() dataObject: any;

  constructor() {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  get isWorkingCapital(): boolean {
    return this.loanProductService.isWorkingCapital;
  }

  get isLoanProduct(): boolean {
    return this.loanProductService.isLoanProduct;
  }

  gotoLoanDefaultView(): void {
    this.gotoLoanViewTab('general');
  }

  gotoLoanView(tabName: string): void {
    this.gotoLoanViewTab(tabName);
  }

  private gotoLoanViewTab(tabName: string): void {
    this.router.navigate([`../../${tabName}`], {
      queryParams: {
        productType: this.loanProductService.productType.value
      },
      relativeTo: this.route
    });
  }
}
