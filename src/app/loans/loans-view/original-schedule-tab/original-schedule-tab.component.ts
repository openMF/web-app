import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';

@Component({
  selector: 'mifosx-original-schedule-tab',
  templateUrl: './original-schedule-tab.component.html',
  styleUrls: ['./original-schedule-tab.component.scss']
})
export class OriginalScheduleTabComponent {

  /** Loan Details Data */
  originalScheduleDetails: any;
  /** Columns to be displayed in original schedule table. */
  displayedColumns: string[] = ['number', 'date', 'balanceOfLoan', 'principalDue', 'interest', 'fees', 'penalties', 'outstanding'];

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
