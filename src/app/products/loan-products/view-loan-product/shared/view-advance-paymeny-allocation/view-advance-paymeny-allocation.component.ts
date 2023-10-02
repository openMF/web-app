import { Component, Input, OnInit } from '@angular/core';
import { AdvancePaymentAllocationData, PaymentAllocation } from 'app/products/loan-products/loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';

@Component({
  selector: 'mifosx-view-advance-paymeny-allocation',
  templateUrl: './view-advance-paymeny-allocation.component.html',
  styleUrls: ['./view-advance-paymeny-allocation.component.scss']
})
export class ViewAdvancePaymenyAllocationComponent implements OnInit {

  @Input() paymentAllocation: PaymentAllocation;
  @Input() advancePaymentAllocationData: AdvancePaymentAllocationData;

  constructor() { }

  ngOnInit(): void {
  }

  transactionTypeValue(code: string): string {
    const transactionType =  this.advancePaymentAllocationData.transactionTypes.find(t => t.code === code);
    return transactionType.value;
  }

  allocationRuleValue(code: string): string {
    const allocationType =  this.advancePaymentAllocationData.allocationTypes.find(t => t.code === code);
    return allocationType.value;
  }

  futureInstallmentRuleValue(code: string): string {
    const futureInstallmentAllocationRule =  this.advancePaymentAllocationData.futureInstallmentAllocationRules.find(t => t.code === code);
    return futureInstallmentAllocationRule.value;
  }

}
