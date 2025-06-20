import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-product-currency-step',
  templateUrl: './loan-product-currency-step.component.html',
  styleUrls: ['./loan-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class LoanProductCurrencyStepComponent implements OnInit {
  @Input() loanProductsTemplate: any;

  loanProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createLoanProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.loanProductsTemplate.currencyOptions;
    this.loanProductCurrencyForm.patchValue({
      currencyCode: this.loanProductsTemplate.currency.code || this.currencyData[0].code,
      digitsAfterDecimal: this.loanProductsTemplate.currency.decimalPlaces
        ? this.loanProductsTemplate.currency.decimalPlaces
        : 2,
      inMultiplesOf: this.loanProductsTemplate.currency.inMultiplesOf,
      installmentAmountInMultiplesOf: this.loanProductsTemplate.installmentAmountInMultiplesOf
    });
  }

  createLoanProductCurrencyForm() {
    this.loanProductCurrencyForm = this.formBuilder.group({
      currencyCode: [
        '',
        Validators.required
      ],
      digitsAfterDecimal: [
        2,
        Validators.required
      ],
      inMultiplesOf: '',
      installmentAmountInMultiplesOf: ''
    });
  }

  get loanProductCurrency() {
    return this.loanProductCurrencyForm.value;
  }
}
