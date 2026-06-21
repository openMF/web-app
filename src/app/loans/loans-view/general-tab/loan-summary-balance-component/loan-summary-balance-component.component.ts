/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { Currency } from 'app/shared/models/general.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'mifosx-loan-summary-balance-component',
  templateUrl: './loan-summary-balance-component.component.html',
  styleUrl: './loan-summary-balance-component.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    CurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanSummaryBalanceComponentComponent extends LoanProductBaseComponent implements OnInit {
  @Input() summary: any | null = null;
  @Input() currency: Currency | null = null;
  @Input() hasChargeBack: boolean = false;

  /** Data source for loans summary table. */
  dataSource: MatTableDataSource<any>;
  loanSummaryColumns: string[] = [];
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
    this.loanSummaryColumns = [
      'Empty',
      'Original',
      'Paid',
      'Waived',
      'Written Off',
      'Outstanding',
      'Over Due'
    ];
    if (this.hasChargeBack) {
      this.loanSummaryColumns.splice(2, 0, 'Adjustments');
    }
    this.dataSource = new MatTableDataSource([
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
        original: this.summary.totalExpectedRepayment,
        adjustment: this.summary.principalAdjustments || 0,
        paid: this.summary.totalRepayment,
        waived: this.summary.totalWaived,
        writtenOff: this.summary.totalWrittenOff,
        outstanding: this.summary.totalOutstanding,
        overdue: this.summary.totalOverdue
      }
    ]);
  }

  setWorkingCapitalSummaryTableData(): void {
    this.loanSummaryColumns = [
      'Empty',
      'Original',
      'Paid',
      'Outstanding'
    ];

    this.dataSource = new MatTableDataSource([
      {
        property: 'Principal',
        original: this.summary.principal,
        paid: this.summary.principalPaid,
        outstanding: this.summary.principalOutstanding
      },
      {
        property: 'Discount',
        original: this.summary.totalDiscountFee,
        paid: this.summary.discountPaid ?? 0,
        outstanding: this.summary.discountOutstanding ?? 0
      },
      {
        property: 'Fees',
        original: this.summary.feeChargesCharged || 0,
        paid: this.summary.feeChargesPaid || 0,
        outstanding: this.summary.feeChargesOutstanding || 0
      },
      {
        property: 'Total',
        original: this.summary.totalExpectedRepayment || 0,
        paid: this.summary.totalRepayment || 0,
        outstanding: this.summary.totalOutstanding || 0
      }
    ]);
  }
}
