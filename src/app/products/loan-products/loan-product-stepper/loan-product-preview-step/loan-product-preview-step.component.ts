import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { AdvancePaymentAllocationData } from '../loan-product-payment-strategy-step/payment-allocation-model';

@Component({
  selector: 'mifosx-loan-product-preview-step',
  templateUrl: './loan-product-preview-step.component.html',
  styleUrls: ['./loan-product-preview-step.component.scss']
})
export class LoanProductPreviewStepComponent implements OnInit, OnChanges {

  @Input() loanProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() loanProduct: any;
  @Output() submit = new EventEmitter();

  variationsDisplayedColumns: string[] = ['valueConditionType', 'borrowerCycleNumber', 'minValue', 'defaultValue', 'maxValue'];
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];
  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId'];

  isAdvancedPaymentAllocation = false;

  advancePaymentAllocationData: AdvancePaymentAllocationData;

  constructor() { }

  ngOnInit() {
    this.isAdvancedPaymentAllocation = (this.loanProduct.transactionProcessingStrategyCode === 'advanced-payment-allocation-strategy');
    this.advancePaymentAllocationData = {
      transactionTypes: this.loanProductsTemplate.advancedPaymentAllocationTransactionTypes,
      allocationTypes: this.loanProductsTemplate.advancedPaymentAllocationTypes,
      futureInstallmentAllocationRules: this.loanProductsTemplate.advancedPaymentAllocationFutureInstallmentAllocationRules
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isAdvancedPaymentAllocation = (this.loanProduct.transactionProcessingStrategyCode === 'advanced-payment-allocation-strategy');
  }

}
