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

  /**
   * Navigates to one of the loan view tabs.
   *
   * The screens that extend this base sit at different depths below the loan:
   * an action is `:loanId/actions/:action`, the transaction adjustment is
   * `:loanId/transactions/:id/edit`. Counting `../` from the current route
   * therefore lands somewhere else depending on the caller. The target is built
   * from the route that declares `:loanId` instead: navigating `[loanId,
   * tabName]` relative to its parent rebuilds the loan URL whatever the depth.
   */
  private gotoLoanViewTab(tabName: string): void {
    const loanRoute = this.route.pathFromRoot.find((route) => route.routeConfig?.path?.startsWith(':loanId'));
    this.router.navigate(
      [
        this.loanId,
        tabName
      ],
      {
        queryParams: {
          productType: this.loanProductService.productType.value
        },
        relativeTo: loanRoute?.parent
      }
    );
  }
}
