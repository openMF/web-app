import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-collateral-tab',
  templateUrl: './loan-collateral-tab.component.html',
  styleUrls: ['./loan-collateral-tab.component.scss'],
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
export class LoanCollateralTabComponent implements OnInit {
  /** Loan Collateral Details */
  loanCollaterals: any[] = [];
  /** Columns to be displayed in collateral table. */
  displayedColumns: string[] = [
    'id',
    'currency',
    'description',
    'value'
  ];

  totalAmount: number;

  /**
   * Retrieves the loans data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { loanCollaterals: any }) => {
      this.loanCollaterals = data.loanCollaterals;
    });
  }

  ngOnInit() {
    this.totalAmount = 0;
    this.loanCollaterals.forEach((collateral: any) => {
      this.totalAmount = this.totalAmount + collateral.value;
    });
  }
}
