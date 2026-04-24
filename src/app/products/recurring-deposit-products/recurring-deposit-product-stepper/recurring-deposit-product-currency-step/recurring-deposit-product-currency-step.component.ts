import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-recurring-deposit-product-currency-step',
  templateUrl: './recurring-deposit-product-currency-step.component.html',
  styleUrls: ['./recurring-deposit-product-currency-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class RecurringDepositProductCurrencyStepComponent implements OnInit {
  @Input() recurringDepositProductsTemplate: any;

  recurringDepositProductCurrencyForm: UntypedFormGroup;

  currencyData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createrecurringDepositProductCurrencyForm();
  }

  ngOnInit() {
    this.currencyData = this.recurringDepositProductsTemplate.currencyOptions;
    if (!(this.recurringDepositProductsTemplate === undefined) && this.recurringDepositProductsTemplate.id) {
      this.recurringDepositProductCurrencyForm.patchValue({
        currencyCode: this.recurringDepositProductsTemplate.currency.code,
        digitsAfterDecimal: this.recurringDepositProductsTemplate.currency.decimalPlaces,
        inMultiplesOf: this.recurringDepositProductsTemplate.currency.inMultiplesOf
      });
    } else {
      this.recurringDepositProductCurrencyForm.patchValue({
        currencyCode: this.currencyData[0].code,
        digitsAfterDecimal: 2
      });
    }
  }

  createrecurringDepositProductCurrencyForm() {
    this.recurringDepositProductCurrencyForm = this.formBuilder.group({
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

  get recurringDepositProductCurrency() {
    return this.recurringDepositProductCurrencyForm.value;
  }
}
