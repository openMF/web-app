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
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';

@Component({
  selector: 'mifosx-original-schedule-tab',
  templateUrl: './original-schedule-tab.component.html',
  styleUrls: ['./original-schedule-tab.component.scss'],
  imports: [
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
    TranslatePipe,
    DateFormatPipe,
    FormatNumberPipe,
    NgxTranslatePipe
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
