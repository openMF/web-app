import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdvancePaymentAllocationData } from '../../loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss']
})
export class GeneralTabComponent implements OnInit {

  loanProduct: any;

  variationsDisplayedColumns: string[] = ['valueConditionType', 'borrowerCycleNumber', 'minValue', 'defaultValue', 'maxValue'];
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];
  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId'];

  advancePaymentAllocationData: AdvancePaymentAllocationData;

  useDueForRepaymentsConfigurations = false;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { loanProduct: any }) => {
      this.loanProduct = data.loanProduct;
      this.useDueForRepaymentsConfigurations = (!this.loanProduct.dueDaysForRepaymentEvent && !this.loanProduct.overDueDaysForRepaymentEvent);
      this.advancePaymentAllocationData = {
        transactionTypes: this.loanProduct.advancedPaymentAllocationTransactionTypes,
        allocationTypes: this.loanProduct.advancedPaymentAllocationTypes,
        futureInstallmentAllocationRules: this.loanProduct.advancedPaymentAllocationFutureInstallmentAllocationRules
      };
    });
  }

  ngOnInit() {
    this.loanProduct.allowAttributeConfiguration = Object.values(this.loanProduct.allowAttributeOverrides).some((attribute: boolean) => attribute);
  }

}
