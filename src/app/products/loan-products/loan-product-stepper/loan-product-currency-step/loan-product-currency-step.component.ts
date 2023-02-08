import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'mifosx-loan-product-currency-step',
  templateUrl: './loan-product-currency-step.component.html',
  styleUrls: ['./loan-product-currency-step.component.scss']
})
export class LoanProductCurrencyStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;

  loanProductCurrencyForm: FormGroup;

  currencyData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createLoanProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.loanProductsTemplate.currencyOptions;
    this.loanProductCurrencyForm.patchValue({
      'currencyCode': this.loanProductsTemplate.currency.code || this.currencyData[0].code,
      'digitsAfterDecimal': this.loanProductsTemplate.currency.decimalPlaces ? this.loanProductsTemplate.currency.decimalPlaces : 2,
      'inMultiplesOf': this.loanProductsTemplate.currency.inMultiplesOf ? this.loanProductsTemplate.currency.inMultiplesOf : 1,
      'installmentAmountInMultiplesOf': this.loanProductsTemplate.installmentAmountInMultiplesOf ? this.loanProductsTemplate.installmentAmountInMultiplesOf : 1
    });
  }

  createLoanProductCurrencyForm() {
    this.loanProductCurrencyForm = this.formBuilder.group({
      'currencyCode': ['', Validators.required],
      'digitsAfterDecimal': [2, Validators.required],
      'inMultiplesOf': [1, Validators.required],
      'installmentAmountInMultiplesOf': [1, Validators.required]
    });
  }

  get loanProductCurrency() {
    return this.loanProductCurrencyForm.value;
  }

}
