import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-share-product-currency-step',
  templateUrl: './share-product-currency-step.component.html',
  styleUrls: ['./share-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
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
