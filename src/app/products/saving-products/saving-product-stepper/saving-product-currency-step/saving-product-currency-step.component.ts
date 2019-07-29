import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-saving-product-currency-step',
  templateUrl: './saving-product-currency-step.component.html',
  styleUrls: ['./saving-product-currency-step.component.scss']
})
export class SavingProductCurrencyStepComponent implements OnInit {

  @Input() savingProductsTemplate: any;

  savingProductCurrencyForm: FormGroup;

  currencyData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createSavingProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.savingProductsTemplate.currencyOptions;

    this.savingProductCurrencyForm.patchValue({
      'currencyCode': this.savingProductsTemplate.currency.code || this.currencyData[0].code,
      'digitsAfterDecimal': this.savingProductsTemplate.currency.code ? this.savingProductsTemplate.currency.decimalPlaces : 2,
      'inMultiplesOf': this.savingProductsTemplate.currency.inMultiplesOf
    });
  }

  createSavingProductCurrencyForm() {
    this.savingProductCurrencyForm = this.formBuilder.group({
      'currencyCode': ['', Validators.required],
      'digitsAfterDecimal': ['', Validators.required],
      'inMultiplesOf': ['', Validators.required]
    });
  }

  get savingProductCurrency() {
    return this.savingProductCurrencyForm.value;
  }

}
