import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Accounting } from 'app/core/utils/accounting';

@Component({
  selector: 'mifosx-saving-product-general-tab',
  templateUrl: './saving-product-general-tab.component.html',
  styleUrls: ['./saving-product-general-tab.component.scss']
})
export class SavingProductGeneralTabComponent {
  savingProduct: any;

  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType'
  ];
  paymentFundSourceDisplayedColumns: string[] = [
    'paymentTypeId',
    'fundSourceAccountId'
  ];
  feesPenaltyIncomeDisplayedColumns: string[] = [
    'chargeId',
    'incomeAccountId'
  ];

  constructor(
    private route: ActivatedRoute,
    private accounting: Accounting
  ) {
    this.route.data.subscribe((data: { savingProduct: any }) => {
      this.savingProduct = data.savingProduct;
    });
  }

  isCashOrAccrualAccounting(): boolean {
    return this.accounting.isCashOrAccrualAccounting(this.savingProduct.accountingRule);
  }

  isAccrualAccounting(): boolean {
    return this.accounting.isAccrualAccounting(this.savingProduct.accountingRule);
  }
}
