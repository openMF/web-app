/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { trigger, state, transition, animate, style } from '@angular/animations';

/**
 * Fixed Deposit Product component.
 */
@Component({
  selector: 'mifosx-view-fixed-deposit-product',
  templateUrl: './view-fixed-deposit-product.component.html',
  styleUrls: ['./view-fixed-deposit-product.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})

export class ViewFixedDepositProductComponent implements OnInit {

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

  ngOnInit() {
  }

}
