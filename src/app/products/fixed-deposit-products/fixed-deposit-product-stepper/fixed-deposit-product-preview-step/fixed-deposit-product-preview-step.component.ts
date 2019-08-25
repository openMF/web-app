import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'mifosx-fixed-deposit-product-preview-step',
  templateUrl: './fixed-deposit-product-preview-step.component.html',
  styleUrls: ['./fixed-deposit-product-preview-step.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class FixedDepositProductPreviewStepComponent implements OnInit {

  @Input() fixedDepositProductsTemplate: any;
  @Input() chartSlabsDisplayedColumns: any[];
  @Input() accountingRuleData: any;
  @Input() fixedDepositProduct: any;
  @Output() submit = new EventEmitter();

  chartSlabsIncentivesDisplayedColumns: string[] = ['incentives'];
  incentivesDisplayedColumns: string[] = ['entityType', 'attributeName', 'conditionType', 'attributeValue', 'incentiveType', 'amount'];
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];
  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId'];

  expandChartSlabIndex: number[] = [];

  constructor() { }

  ngOnInit() {
  }

}
