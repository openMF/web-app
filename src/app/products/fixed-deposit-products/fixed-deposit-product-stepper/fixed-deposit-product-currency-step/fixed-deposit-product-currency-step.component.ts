import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-fixed-deposit-product-currency-step',
  templateUrl: './fixed-deposit-product-currency-step.component.html',
  styleUrls: ['./fixed-deposit-product-currency-step.component.scss']
})
export class FixedDepositProductCurrencyStepComponent implements OnInit {

  @Input() fixedDepositProductsTemplate: any;

  fixedDepositProductCurrencyForm: FormGroup;

  currencyData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createFixedDepositProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.fixedDepositProductsTemplate.currencyOptions;

    if (!(this.fixedDepositProductsTemplate === undefined) && this.fixedDepositProductsTemplate.id) {
      this.fixedDepositProductCurrencyForm.patchValue({
        'currencyCode': this.fixedDepositProductsTemplate.currency.code,
        'digitsAfterDecimal': this.fixedDepositProductsTemplate.currency.decimalPlaces,
        'inMultiplesOf': this.fixedDepositProductsTemplate.currency.inMultiplesOf
      });
    } else {
      this.fixedDepositProductCurrencyForm.patchValue({
        'currencyCode': this.currencyData[0].code,
        'digitsAfterDecimal': 2
      });
    }
  }

  createFixedDepositProductCurrencyForm() {
    this.fixedDepositProductCurrencyForm = this.formBuilder.group({
      'currencyCode': ['', Validators.required],
      'digitsAfterDecimal': ['', Validators.required],
      'inMultiplesOf': ['', Validators.required]
    });
  }

  get fixedDepositProductCurrency() {
    return this.fixedDepositProductCurrencyForm.value;
  }

}
