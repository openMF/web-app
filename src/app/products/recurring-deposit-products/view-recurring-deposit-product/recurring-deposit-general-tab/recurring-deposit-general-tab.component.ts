import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'mifosx-recurring-deposit-general-tab',
  templateUrl: './recurring-deposit-general-tab.component.html',
  styleUrls: ['./recurring-deposit-general-tab.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class RecurringDepositGeneralTabComponent implements OnInit {

  recurringDepositProduct: any;
  recurringDepositProductTemplate: any;

  chartSlabsIncentivesDisplayedColumns: string[] = ['incentives'];
  chartSlabsDisplayedColumns: string[] = ['period', 'amountRange', 'annualInterestRate', 'description', 'actions'];
  incentivesDisplayedColumns: string[] = ['entityType', 'attributeName', 'conditionType', 'attributeValue', 'incentiveType', 'amount'];
  chargesDisplayedColumns: string[] = ['name', 'type', 'amount', 'collectedon'];
  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId'];

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { recurringDepositProduct: any, recurringDepositProductsTemplate: any}) => {
      this.recurringDepositProduct = data.recurringDepositProduct;
      this.recurringDepositProductTemplate = data.recurringDepositProductsTemplate;
    });
  }

  ngOnInit(): void {
  }

}
