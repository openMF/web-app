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
  selector: 'mifosx-saving-product-currency-step',
  templateUrl: './saving-product-currency-step.component.html',
  styleUrls: ['./saving-product-currency-step.component.scss'],
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
export class SavingProductCurrencyStepComponent implements OnInit {
  @Input() savingProductsTemplate: any;

  savingProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createSavingProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.savingProductsTemplate.currencyOptions;

    this.savingProductCurrencyForm.patchValue({
      currencyCode: this.savingProductsTemplate.currency.code || this.currencyData[0].code,
      digitsAfterDecimal: this.savingProductsTemplate.currency.code
        ? this.savingProductsTemplate.currency.decimalPlaces
        : 2,
      inMultiplesOf: this.savingProductsTemplate.currency.inMultiplesOf || ''
    });
  }

  createSavingProductCurrencyForm() {
    this.savingProductCurrencyForm = this.formBuilder.group({
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

  get savingProductCurrency() {
    return this.savingProductCurrencyForm.value;
  }
}
