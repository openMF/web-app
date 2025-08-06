import { Component, OnInit } from '@angular/core';
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
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoansService } from '../../loans.service';
import { BuyDownFeeAmortizationDetails } from '../../models/loan-account.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'mifosx-loan-buy-down-fees-tab',
  templateUrl: './loan-buy-down-fees-tab.component.html',
  styleUrl: './loan-buy-down-fees-tab.component.scss',
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
    FormatNumberPipe,
    DatePipe
  ]
})
export class LoanBuyDownFeesTabComponent implements OnInit {
  buyDownFeeData: BuyDownFeeAmortizationDetails[] = [];
  loanId: string;
  isLoading = true;

  buyDownFeeColumns: string[] = [
    'buyDownFeeDate',
    'buyDownFeeAmount',
    'amortizedAmount',
    'notYetAmortizedAmount',
    'adjustedAmount',
    'chargedOffAmount'
  ];

  constructor(
    private route: ActivatedRoute,
    private loansService: LoansService
  ) {}

  ngOnInit(): void {
    this.getLoanId();
    this.loadBuyDownFees();
  }

  private getLoanId(): void {
    if (this.route.snapshot.data && this.route.snapshot.data['loanId']) {
      this.loanId = this.route.snapshot.data['loanId'];
      return;
    }

    let currentRoute = this.route;
    while (currentRoute) {
      if (currentRoute.snapshot.paramMap.has('loanId')) {
        this.loanId = currentRoute.snapshot.paramMap.get('loanId');
        return;
      }
      if (currentRoute.parent) {
        currentRoute = currentRoute.parent;
      } else {
        break;
      }
    }

    console.error('Could not find loanId in route parameters');
  }

  private loadBuyDownFees(): void {
    if (!this.loanId) {
      console.error('Cannot load buy down fees: loanId is undefined');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.loansService.getBuyDownFeeData(this.loanId).subscribe({
      next: (data: BuyDownFeeAmortizationDetails[]) => {
        this.buyDownFeeData = data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading buy down fees:', error);
        this.isLoading = false;
      }
    });
  }
}
