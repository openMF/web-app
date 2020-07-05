/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

/**
 * Recurring Deposits Account Interest Rate Chart Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-interest-rate-chart-step',
  templateUrl: './recurring-deposits-account-interest-rate-chart-step.component.html',
  styleUrls: ['./recurring-deposits-account-interest-rate-chart-step.component.scss']
})
export class RecurringDepositsAccountInterestRateChartStepComponent implements OnInit, OnChanges {

  @Input() recurringDepositsAccountTemplate: any;
  @Input() recurringDepositsAccountProductTemplate: any;

  /** Interest Rate Chart Data */
  interestRateChartData: any;
  /** Columns to be displayed in interest rate chart table. */
  displayedColumns: string[] = ['period', 'amountRange', 'interest', 'description', 'incentives'];
  /** Data source for interest rate chart table. */
  dataSource: MatTableDataSource<any>;

  constructor() {
  }

  ngOnChanges() {
    if (this.recurringDepositsAccountProductTemplate) {
      this.interestRateChartData = this.recurringDepositsAccountProductTemplate.accountChart.chartSlabs;
    }
  }

  ngOnInit() {
    this.interestRateChartData = [];
  }

}
