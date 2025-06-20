import { Component, Input } from '@angular/core';
import {
  AdvancePaymentAllocationData,
  CreditAllocation,
  PaymentAllocation
} from 'app/products/loan-products/loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-advance-paymeny-allocation',
  templateUrl: './view-advance-paymeny-allocation.component.html',
  styleUrls: ['./view-advance-paymeny-allocation.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle
  ]
})
export class ViewAdvancePaymenyAllocationComponent {
  @Input() paymentAllocation: PaymentAllocation | null;
  @Input() creditAllocation: CreditAllocation | null;
  @Input() advancePaymentAllocationData: AdvancePaymentAllocationData;

  constructor() {}

  transactionTypeValue(code: string): string {
    if (this.advancePaymentAllocationData == null) {
      return code;
    }
    const transactionType = this.advancePaymentAllocationData.transactionTypes.find((t) => t.code === code);
    return transactionType.value;
  }

  allocationRuleValue(code: string): string {
    if (this.advancePaymentAllocationData == null) {
      return code;
    }
    const allocationType = this.advancePaymentAllocationData.allocationTypes.find((t) => t.code === code);
    return allocationType.value;
  }

  futureInstallmentRuleValue(code: string): string {
    if (this.advancePaymentAllocationData == null) {
      return code;
    }
    const futureInstallmentAllocationRule = this.advancePaymentAllocationData.futureInstallmentAllocationRules.find(
      (t) => t.code === code
    );
    return futureInstallmentAllocationRule.value;
  }
}
