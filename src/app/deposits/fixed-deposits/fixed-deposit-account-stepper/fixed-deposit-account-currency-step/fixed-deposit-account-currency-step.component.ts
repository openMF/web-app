/** Angular Imports */
import { Component, OnChanges, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

/**
 * Fixed Deposit Account Currency Step
 */
@Component({
  selector: 'mifosx-fixed-deposit-account-currency-step',
  templateUrl: './fixed-deposit-account-currency-step.component.html',
  styleUrls: ['./fixed-deposit-account-currency-step.component.scss']
})
export class FixedDepositAccountCurrencyStepComponent implements OnChanges {

  /** Fixed deposits account template */
  @Input() fixedDepositsAccountTemplate: any;
  /** Fixed deposits account and product template */
  @Input() fixedDepositsAccountProductTemplate: any;

  /** Fixed Deposit Account Currency Form */
  fixedDepositAccountCurrencyForm: UntypedFormGroup;
  /** Currency Data */
  currencyData: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   */
  constructor(private formBuilder: UntypedFormBuilder) {
    this.createFixedDepositAccountCurrencyForm();
  }

  ngOnChanges() {
    if (this.fixedDepositsAccountProductTemplate) {
      this.fixedDepositAccountCurrencyForm.patchValue({
        'currencyCode': this.fixedDepositsAccountProductTemplate.currency.code,
        'decimalPlaces': this.fixedDepositsAccountProductTemplate.currency.decimalPlaces,
        'currencyMultiple': this.fixedDepositsAccountProductTemplate.currency.inMultiplesOf
      });
    }
  }

  /**
   * Creates fd currency form.
   */
  createFixedDepositAccountCurrencyForm() {
    this.fixedDepositAccountCurrencyForm = this.formBuilder.group({
      'currencyCode': [{ value: '', disabled: true}],
      'decimalPlaces': [{ value: '', disabled: true }],
      'currencyMultiple': [{ value: '', disabled: true }]
    });
  }

}
