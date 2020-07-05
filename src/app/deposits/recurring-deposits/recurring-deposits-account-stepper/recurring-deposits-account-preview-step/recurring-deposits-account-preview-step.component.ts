/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

/**
 * Recurring Deposit Preview Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-preview-step',
  templateUrl: './recurring-deposits-account-preview-step.component.html',
  styleUrls: ['./recurring-deposits-account-preview-step.component.scss']
})
export class RecurringDepositsAccountPreviewStepComponent implements OnInit, OnChanges {

  /** Input Data */
  @Input() recurringDepositsAccountTemplate: any;
  @Input() recurringDepositsAccountProductTemplate: any;
  @Input() recurringDepositAccountData: any;
  /** Output the submit action */
  @Output() submit = new EventEmitter();

  /** Charges Displayed Columns */
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'date', 'repaymentsEvery'];
  /** Interest Rate Chart Displayed Columns */
  interestRateChartDisplayedColumns: string[] = ['period', 'amountRange', 'interest', 'description', 'incentives'];
  /** Interest Rate Chart Data */
  interestRateChartData: any;

  constructor() { }

  ngOnChanges() {
    if (this.recurringDepositsAccountProductTemplate) {
      this.interestRateChartData = this.recurringDepositsAccountProductTemplate.accountChart.chartSlabs;
    }
  }

  ngOnInit() {
    this.interestRateChartData = [];
  }


}
