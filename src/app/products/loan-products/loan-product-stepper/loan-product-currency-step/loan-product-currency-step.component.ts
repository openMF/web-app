import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { NgFor } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-loan-product-currency-step',
  templateUrl: './loan-product-currency-step.component.html',
  styleUrls: ['./loan-product-currency-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatTooltip,
    NgFor,
    MatOption,
    MatError,
    MatInput,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    TranslatePipe,
    NgxTranslatePipe
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
