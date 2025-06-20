import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatFooterCellDef,
  MatFooterCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
  MatFooterRowDef,
  MatFooterRow
} from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { CurrencyPipe } from '@angular/common';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-original-schedule-tab',
  templateUrl: './original-schedule-tab.component.html',
  styleUrls: ['./original-schedule-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatFooterCellDef,
    MatFooterCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterRowDef,
    MatFooterRow,
    CurrencyPipe,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class OriginalScheduleTabComponent {
  /** Loan Details Data */
  originalScheduleDetails: any;
  /** Columns to be displayed in original schedule table. */
  displayedColumns: string[] = [
    'number',
    'date',
    'balanceOfLoan',
    'principalDue',
    'interest',
    'fees',
    'penalties',
    'outstanding'
  ];

  currency: Currency | null = null;

  /**
   * Retrieves the loans with associations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.currency = data.loanDetailsData.currency;
      this.originalScheduleDetails = data.loanDetailsData.originalSchedule;
    });
  }
}
