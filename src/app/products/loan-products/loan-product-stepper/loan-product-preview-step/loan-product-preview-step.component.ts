import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { LoanProducts } from '../../loan-products';
import { LoanProductSummaryComponent } from '../../common/loan-product-summary/loan-product-summary.component';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-loan-product-preview-step',
  templateUrl: './loan-product-preview-step.component.html',
  styleUrls: ['./loan-product-preview-step.component.scss'],
  imports: [
    LoanProductSummaryComponent,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    RouterLink,
    TranslatePipe,
    NgxTranslatePipe
  ]
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
