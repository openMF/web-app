import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-fixed-deposit-product-currency-step',
  templateUrl: './fixed-deposit-product-currency-step.component.html',
  styleUrls: ['./fixed-deposit-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class FixedDepositProductCurrencyStepComponent implements OnInit {
  @Input() fixedDepositProductsTemplate: any;

  fixedDepositProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createFixedDepositProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.fixedDepositProductsTemplate.currencyOptions;

    if (!(this.fixedDepositProductsTemplate === undefined) && this.fixedDepositProductsTemplate.id) {
      this.fixedDepositProductCurrencyForm.patchValue({
        currencyCode: this.fixedDepositProductsTemplate.currency.code,
        digitsAfterDecimal: this.fixedDepositProductsTemplate.currency.decimalPlaces,
        inMultiplesOf: this.fixedDepositProductsTemplate.currency.inMultiplesOf
      });
    } else {
      this.fixedDepositProductCurrencyForm.patchValue({
        currencyCode: this.currencyData[0].code,
        digitsAfterDecimal: 2
      });
    }
  }

  createFixedDepositProductCurrencyForm() {
    this.fixedDepositProductCurrencyForm = this.formBuilder.group({
      currencyCode: [
        '',
        Validators.required
      ],
      digitsAfterDecimal: [
        '',
        Validators.required
      ],
      inMultiplesOf: ['']
    });
  }

  get fixedDepositProductCurrency() {
    return this.fixedDepositProductCurrencyForm.value;
  }
}
