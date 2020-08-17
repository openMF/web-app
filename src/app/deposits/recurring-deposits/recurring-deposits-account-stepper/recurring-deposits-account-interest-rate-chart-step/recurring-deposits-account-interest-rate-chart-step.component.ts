/** Angular Imports */
import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * Recurring Deposits Account Interest Rate Chart Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-interest-rate-chart-step',
  templateUrl: './recurring-deposits-account-interest-rate-chart-step.component.html',
  styleUrls: ['./recurring-deposits-account-interest-rate-chart-step.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class RecurringDepositsAccountInterestRateChartStepComponent implements OnInit, OnChanges {

  @Input() recurringDepositsAccountTemplate: any;
  @Input() recurringDepositsAccountProductTemplate: any;

  /** Interest Rate Chart Data */
  interestRateChartData: any = [];
  /** Columns to be displayed in interest rate chart table. */
  chartSlabsDisplayedColumns: any[] = ['period', 'amountRange', 'interest', 'description', 'actions'];
  /** Columns to be displayed in incentives sub-table. */
  incentivesDisplayedColumns: string[] = ['entityType', 'attributeName', 'conditionType', 'attributeValue', 'incentiveType', 'amount'];
  /** Additional Column to disblac incentives table  */
  chartSlabsIncentivesDisplayedColumns: string[] = ['incentives'];
  /** Expand Chart Slab Index used in the view */
  expandChartSlabIndex: number;

  @ViewChild('chartsTable', { static: true }) chartsTableRef: MatTable<Element>;

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
