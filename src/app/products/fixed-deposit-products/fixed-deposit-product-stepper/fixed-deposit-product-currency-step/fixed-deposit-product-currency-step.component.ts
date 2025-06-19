import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-fixed-deposit-product-currency-step',
  templateUrl: './fixed-deposit-product-currency-step.component.html',
  styleUrls: ['./fixed-deposit-product-currency-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
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
