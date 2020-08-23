/** Angular Imports */
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';

/**
 * Fixed Deposits Account Interest Rate Chart Step
 */
@Component({
  selector: 'mifosx-fixed-deposit-account-interest-rate-chart-step',
  templateUrl: './fixed-deposit-account-interest-rate-chart-step.component.html',
  styleUrls: ['./fixed-deposit-account-interest-rate-chart-step.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class FixedDepositAccountInterestRateChartStepComponent implements OnChanges {

  /** Fixed deposits account template */
  @Input() fixedDepositsAccountTemplate: any;
  /** Fixed deposits account and product template */
  @Input() fixedDepositsAccountProductTemplate: any;

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

  /** Interest Rate charts table reference */
  @ViewChild('chartsTable', { static: true }) chartsTableRef: MatTable<Element>;

  constructor() { }

  ngOnChanges() {
    if (this.fixedDepositsAccountProductTemplate) {
      this.interestRateChartData = this.fixedDepositsAccountProductTemplate.accountChart.chartSlabs;
      this.chartsTableRef.renderRows();
    }
  }

}
