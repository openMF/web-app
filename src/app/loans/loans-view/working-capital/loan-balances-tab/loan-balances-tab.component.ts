/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { WorkingCapitalBalances } from 'app/loans/models/working-capital/working-capital-loan-account.model';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-balances-tab',
  templateUrl: './loan-balances-tab.component.html',
  styleUrl: './loan-balances-tab.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanBalancesTabComponent extends LoanProductBaseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  loanBalances: WorkingCapitalBalances | null = null;
  currencyCode: string | null = null;

  ngOnInit(): void {
    if (this.route.parent) {
      this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
        this.currencyCode = data.loanDetailsData.currency.code;
        this.loanBalances = data.loanDetailsData.balance;
      });
    }
  }
}
