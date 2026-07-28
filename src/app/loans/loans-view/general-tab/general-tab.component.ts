/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { LoanSummaryBalanceComponentComponent } from './loan-summary-balance-component/loan-summary-balance-component.component';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgClass,
    ExternalIdentifierComponent,
    CurrencyPipe,
    DateFormatPipe,
    FormatNumberPipe,
    LoanSummaryBalanceComponentComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralTabComponent extends LoanProductBaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  /** Currency Code */
  currencyCode: string | null = null;
  loanDetails: any;
  status: any;
  hasChargeBack: boolean = false;

  constructor() {
    super();
    const productType = this.route.snapshot.queryParamMap.get('productType') || null;
    if (productType) {
      this.loanProductService.initialize(productType);
    }
    this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
      this.currencyCode = this.loanDetails.currency.code;
      if (this.loanDetails.transactions) {
        this.hasChargeBack = this.loanDetails.transactions.some(
          (transaction: any) => transaction.type.code === 'loanTransactionType.chargeback'
        );
      }
    });
  }

  ngOnInit() {
    this.status = this.loanDetails.status?.value;
  }

  hasNumberOfRepayments(): boolean {
    return this.loanDetails.numberOfRepayments !== null && this.loanDetails.numberOfRepayments !== undefined;
  }

  statusClass(): string {
    const status = this.loanDetails.status;
    if (!status) {
      return 'st-closed';
    }
    if (status.active) {
      return 'st-active';
    }
    if (status.pendingApproval) {
      return 'st-pending';
    }
    if (status.waitingForDisbursal) {
      return 'st-approved';
    }
    if (status.overpaid) {
      return 'st-overpaid';
    }
    return 'st-closed';
  }

  showApprovedAmountBasedOnStatus() {
    if (
      this.status === 'Submitted and pending approval' ||
      this.status === 'Withdrawn by applicant' ||
      this.status === 'Rejected'
    ) {
      return false;
    }
    return true;
  }

  showDisbursedAmountBasedOnStatus() {
    if (
      this.status === 'Submitted and pending approval' ||
      this.status === 'Withdrawn by applicant' ||
      this.status === 'Rejected' ||
      this.status === 'Approved'
    ) {
      return false;
    }
    return true;
  }

  loanProductType(): string {
    return this.loanDetails.loanType
      ? LoanProductService.productTypeLabel('loan')
      : LoanProductService.productTypeLabel('working-capital');
  }
}
