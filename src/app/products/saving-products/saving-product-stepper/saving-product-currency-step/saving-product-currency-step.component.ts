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
      'currencyCode': this.currencyData[0].code,
      'digitsAfterDecimal': 2
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
