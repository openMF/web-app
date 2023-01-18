import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'mifosx-fixed-deposit-general-tab',
  templateUrl: './fixed-deposit-general-tab.component.html',
  styleUrls: ['./fixed-deposit-general-tab.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class FixedDepositGeneralTabComponent implements OnInit {
  /** Fixed Deposit Product data. */
  fixedDepositProductData: any;
  fixedDepositProductsTemplate: any;

  chartSlabsIncentivesDisplayedColumns: string[] = ['incentives'];
  chartSlabsDisplayedColumns: string[] = ['period', 'amountRange', 'annualInterestRate', 'description', 'actions'];
  incentivesDisplayedColumns: string[] = ['entityType', 'attributeName', 'conditionType', 'attributeValue', 'incentiveType', 'amount'];
  chargesDisplayedColumns: string[] = ['name', 'type', 'amount', 'collectedon'];
  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId'];

  /**
   * Retrieves the fixed deposit product data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { fixedDepositProduct: any, fixedDepositProductsTemplate: any }) => {
      this.fixedDepositProductData = data.fixedDepositProduct;
      this.fixedDepositProductsTemplate = data.fixedDepositProductsTemplate;
    });
  }

  ngOnInit(): void {
  }

}
