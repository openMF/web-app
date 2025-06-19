import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
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
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';

@Component({
  selector: 'mifosx-loan-collateral-tab',
  templateUrl: './loan-collateral-tab.component.html',
  styleUrls: ['./loan-collateral-tab.component.scss'],
  imports: [
    MatButton,
    RouterLink,
    NgIf,
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
    TranslatePipe,
    FormatNumberPipe,
    NgxTranslatePipe
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
