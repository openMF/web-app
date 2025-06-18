import { Component, Input } from '@angular/core';
import {
  AdvancePaymentAllocationData,
  CreditAllocation,
  PaymentAllocation
} from 'app/products/loan-products/loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';
import { NgIf, NgFor } from '@angular/common';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-view-advance-paymeny-allocation',
  templateUrl: './view-advance-paymeny-allocation.component.html',
  styleUrls: ['./view-advance-paymeny-allocation.component.scss'],
  imports: [
    NgIf,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    NgFor,
    TranslatePipe,
    NgxTranslatePipe
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
