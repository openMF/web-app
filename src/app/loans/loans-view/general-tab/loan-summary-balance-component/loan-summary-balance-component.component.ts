/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { Currency } from 'app/shared/models/general.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CurrencyPipe } from '@angular/common';

interface SummaryColumn {
  key: string;
  label: string;
}

interface SummaryRow {
  property: string;
  isTotal?: boolean;
  [amount: string]: any;
}

@Component({
  selector: 'mifosx-loan-summary-balance-component',
  templateUrl: './loan-summary-balance-component.component.html',
  styleUrl: './loan-summary-balance-component.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanSummaryBalanceComponentComponent extends LoanProductBaseComponent implements OnInit {
  @Input() summary: any | null = null;
  @Input() currency: Currency | null = null;
  @Input() hasChargeBack: boolean = false;

  columns: SummaryColumn[] = [];
  rows: SummaryRow[] = [];
  currencyCode: string | null = null;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.currencyCode = this.currency?.code ?? null;
    if (this.summary) {
      if (this.loanProductService.isWorkingCapital) {
        this.setWorkingCapitalSummaryTableData();
      } else {
        this.setLoanSummaryTableData();
      }
    }
  }

  setLoanSummaryTableData(): void {
    this.columns = [
      { key: 'original', label: 'Original' },
      { key: 'paid', label: 'Paid' },
      { key: 'waived', label: 'Waived' },
      { key: 'writtenOff', label: 'Written Off' },
      { key: 'outstanding', label: 'Outstanding' },
      { key: 'overdue', label: 'Over Due' }
    ];
    if (this.hasChargeBack) {
      this.columns.splice(2, 0, { key: 'adjustment', label: 'Credit Adjustments' });
    }
    this.rows = [
      {
        property: 'Principal',
        original: this.summary.totalPrincipal,
        adjustment: this.summary.principalAdjustments || 0,
        paid: this.summary.principalPaid,
        waived: this.summary.principalWaived || 0,
        writtenOff: this.summary.principalWrittenOff,
        outstanding: this.summary.principalOutstanding,
        overdue: this.summary.principalOverdue
      },
      {
        property: 'Interest',
        original: this.summary.interestCharged,
        adjustment: 0,
        paid: this.summary.interestPaid,
        waived: this.summary.interestWaived,
        writtenOff: this.summary.interestWrittenOff,
        outstanding: this.summary.interestOutstanding,
        overdue: this.summary.interestOverdue
      },
      {
        property: 'Fees',
        original: this.summary.feeChargesCharged,
        adjustment: 0,
        paid: this.summary.feeChargesPaid,
        waived: this.summary.feeChargesWaived,
        writtenOff: this.summary.feeChargesWrittenOff,
        outstanding: this.summary.feeChargesOutstanding,
        overdue: this.summary.feeChargesOverdue
      },
      {
        property: 'Penalties',
        original: this.summary.penaltyChargesCharged,
        adjustment: 0,
        paid: this.summary.penaltyChargesPaid,
        waived: this.summary.penaltyChargesWaived,
        writtenOff: this.summary.penaltyChargesWrittenOff,
        outstanding: this.summary.penaltyChargesOutstanding,
        overdue: this.summary.penaltyChargesOverdue
      },
      {
        property: 'Total',
        isTotal: true,
        original: this.summary.totalExpectedRepayment,
        adjustment: this.summary.principalAdjustments || 0,
        paid: this.summary.totalRepayment,
        waived: this.summary.totalWaived,
        writtenOff: this.summary.totalWrittenOff,
        outstanding: this.summary.totalOutstanding,
        overdue: this.summary.totalOverdue
      }
    ];
  }

  setWorkingCapitalSummaryTableData(): void {
    this.columns = [
      { key: 'original', label: 'Original' },
      { key: 'paid', label: 'Paid' },
      { key: 'outstanding', label: 'Outstanding' }
    ];
    this.rows = [
      {
        property: 'Principal',
        original: this.summary.principal,
        paid: this.summary.principalPaid,
        outstanding: this.summary.principalOutstanding
      },
      {
        property: 'Discount',
        original: this.summary.totalDiscountFee || 0,
        paid: this.summary.realizedIncomeFromDiscountFee || 0,
        outstanding: this.summary.unrealizedIncomeFromDiscountFee || 0
      },
      {
        property: 'Discount Fee Adjustment',
        original: this.summary.totalDiscountFeeAdjustment || 0,
        paid: 0,
        outstanding: 0
      },
      {
        property: 'Fees',
        original: this.summary.fee || 0,
        paid: this.summary.feePaid || 0,
        outstanding: this.summary.feeOutstanding || 0
      },
      {
        property: 'Penalties',
        original: this.summary.penalty || 0,
        paid: this.summary.penaltyPaid || 0,
        outstanding: this.summary.penaltyOutstanding || 0
      },
      {
        property: 'Total',
        isTotal: true,
        original: this.summary.totalExpectedRepayment || 0,
        paid: this.summary.totalRepayment || 0,
        outstanding: this.summary.totalOutstanding || 0
      }
    ];
  }
}
