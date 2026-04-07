import { Component } from '@angular/core';
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
  MatTable
} from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { FormatNumberPipe } from '@pipes/format-number.pipe';
import { LoanCapitalizedIncomeData, LoanDeferredIncomeData } from 'app/loans/models/loan-account.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-deferred-income-tab',
  templateUrl: './loan-deferred-income-tab.component.html',
  styleUrl: './loan-deferred-income-tab.component.scss',
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
    FormatNumberPipe
  ]
})
export class LoanDeferredIncomeTabComponent {
  capitalizedIncomeData: LoanCapitalizedIncomeData[] = [];

  loanId: any;

  capitalizedIncomeColumns: string[] = [
    'amount',
    'amortizedAmount',
    'unrecognizedAmount',
    'amountAdjustment'
  ];

  constructor(private route: ActivatedRoute) {
    this.loanId = this.route.parent.parent.snapshot.params['loanId'];

    this.capitalizedIncomeData = [];
    this.route.parent.data.subscribe((data: { loanDeferredIncomeData: LoanDeferredIncomeData }) => {
      data.loanDeferredIncomeData.capitalizedIncomeData.forEach((item: LoanCapitalizedIncomeData) => {
        this.capitalizedIncomeData.push({
          amount: item.amount,
          amortizedAmount: item.amortizedAmount ?? 0,
          unrecognizedAmount: item.unrecognizedAmount ?? 0,
          amountAdjustment: item.amountAdjustment ?? 0
        });
      });
    });
  }
}
