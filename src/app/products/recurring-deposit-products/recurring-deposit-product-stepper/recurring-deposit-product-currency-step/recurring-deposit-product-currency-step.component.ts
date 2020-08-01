import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-recurring-deposit-product-currency-step',
  templateUrl: './recurring-deposit-product-currency-step.component.html',
  styleUrls: ['./recurring-deposit-product-currency-step.component.scss']
})
export class RecurringDepositProductCurrencyStepComponent implements OnInit {

  @Input() recurringDepositProductsTemplate: any;

  recurringDepositProductCurrencyForm: FormGroup;

  currencyData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createrecurringDepositProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.recurringDepositProductsTemplate.currencyOptions;
    if (!(this.recurringDepositProductsTemplate === undefined) && this.recurringDepositProductsTemplate.id) {
      this.recurringDepositProductCurrencyForm.patchValue({
        'currencyCode': this.recurringDepositProductsTemplate.currency.code,
        'digitsAfterDecimal': this.recurringDepositProductsTemplate.currency.decimalPlaces,
        'inMultiplesOf': this.recurringDepositProductsTemplate.currency.inMultiplesOf
      });
    } else {
      this.recurringDepositProductCurrencyForm.patchValue({
        'currencyCode': this.currencyData[0].code,
        'digitsAfterDecimal': 2
      });
    }

  }

  createrecurringDepositProductCurrencyForm() {
    this.recurringDepositProductCurrencyForm = this.formBuilder.group({
      'currencyCode': ['', Validators.required],
      'digitsAfterDecimal': ['', Validators.required],
      'inMultiplesOf': ['', Validators.required]
    });
  }

  get recurringDepositProductCurrency() {
    return this.recurringDepositProductCurrencyForm.value;
  }

}
