import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-repayment-schedule-tab',
  templateUrl: './repayment-schedule-tab.component.html',
  styleUrls: ['./repayment-schedule-tab.component.scss']
})
export class RepaymentScheduleTabComponent implements OnInit {

  /** Loan Repayment Schedule Details Data */
  repaymentScheduleDetails: any;
  /** Stores if there is any waived amount */
  isWaived: boolean;
  /** Columns to be displayed in original schedule table. */
  displayedColumns: string[] = ['number', 'days', 'date', 'paiddate', 'check', 'principalDue', 'balanceOfLoan', 'interest', 'fees', 'penalties', 'due', 'paid', 'inadvance', 'late', 'waived', 'outstanding'];

  /**
   * Retrieves the loans with associations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { loanDetailsAssociationData: any }) => {
      this.repaymentScheduleDetails = data.loanDetailsAssociationData.repaymentSchedule;
    });
  }

  ngOnInit() {
    this.isWaived = this.repaymentScheduleDetails.totalWaived > 0;
  }

}
