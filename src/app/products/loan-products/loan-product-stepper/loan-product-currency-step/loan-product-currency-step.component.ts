import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
    this.loanProductCurrencyForm.patchValue({ 'currencyCode': this.currencyData[0].code });
  }

  createLoanProductCurrencyForm() {
    this.loanProductCurrencyForm = this.formBuilder.group({
      'currencyCode': ['', Validators.required],
      'digitsAfterDecimal': [2, Validators.required],
      'inMultiplesOf': ['', Validators.required],
      'installmentAmountInMultiplesOf': ['', Validators.required]
    });
  }

  get loanProductCurrency() {
    return this.loanProductCurrencyForm.value;
  }

}
