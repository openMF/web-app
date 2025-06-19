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
  selector: 'mifosx-share-product-currency-step',
  templateUrl: './share-product-currency-step.component.html',
  styleUrls: ['./share-product-currency-step.component.scss'],
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
export class ShareProductCurrencyStepComponent implements OnInit {
  @Input() shareProductsTemplate: any;

  shareProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createShareProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.shareProductsTemplate.currencyOptions;

    if (this.shareProductsTemplate.currency) {
      this.shareProductCurrencyForm.patchValue({
        currencyCode: this.shareProductsTemplate.currency.code,
        digitsAfterDecimal: this.shareProductsTemplate.currency.decimalPlaces,
        inMultiplesOf: this.shareProductsTemplate.currency.inMultiplesOf
      });
    } else {
      this.shareProductCurrencyForm.patchValue({
        currencyCode: this.currencyData[0].code,
        digitsAfterDecimal: 2
      });
    }
  }

  createShareProductCurrencyForm() {
    this.shareProductCurrencyForm = this.formBuilder.group({
      currencyCode: [
        '',
        Validators.required
      ],
      digitsAfterDecimal: [
        '',
        Validators.required
      ],
      inMultiplesOf: [
        '',
        Validators.required
      ]
    });
  }

  get shareProductCurrency() {
    return this.shareProductCurrencyForm.value;
  }
}
