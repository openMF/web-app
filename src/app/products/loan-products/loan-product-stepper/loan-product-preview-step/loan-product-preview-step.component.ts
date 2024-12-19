import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { LoanProducts } from '../../loan-products';

@Component({
  selector: 'mifosx-loan-product-preview-step',
  templateUrl: './loan-product-preview-step.component.html',
  styleUrls: ['./loan-product-preview-step.component.scss']
})
export class LoanProductPreviewStepComponent implements OnInit, OnChanges {
  @Input() loanProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() loanProduct: any;
  @Output() submitEvent = new EventEmitter();

  isAdvancedPaymentAllocation = false;

  constructor() {}

  ngOnInit() {
    this.advancedPaymentAllocation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.advancedPaymentAllocation();
  }

  advancedPaymentAllocation() {
    this.isAdvancedPaymentAllocation = LoanProducts.isAdvancedPaymentAllocationStrategy(
      this.loanProduct.transactionProcessingStrategyCode
    );
  }
}
