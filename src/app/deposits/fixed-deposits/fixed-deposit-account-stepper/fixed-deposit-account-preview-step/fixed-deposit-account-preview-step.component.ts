/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

/**
 * Fixed Deposit Preview Step
 */
@Component({
  selector: 'mifosx-fixed-deposit-account-preview-step',
  templateUrl: './fixed-deposit-account-preview-step.component.html',
  styleUrls: ['./fixed-deposit-account-preview-step.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class FixedDepositAccountPreviewStepComponent implements OnChanges {

  /** Fixed Deposits Account Template */
  @Input() fixedDepositsAccountTemplate: any;
  /** Fixed Deposits Account Product Template */
  @Input() fixedDepositsAccountProductTemplate: any;
  /** Fixed Deposits Account Data */
  @Input() fixedDepositAccountData: any;

  /** Charges Displayed Columns */
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'date', 'repaymentsEvery'];
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

  /** Form submission event */
  @Output() submit = new EventEmitter();

  constructor() { }

  ngOnChanges() {
    if (this.fixedDepositsAccountProductTemplate) {
      this.interestRateChartData = this.fixedDepositsAccountProductTemplate.accountChart.chartSlabs;
    }
  }

}
