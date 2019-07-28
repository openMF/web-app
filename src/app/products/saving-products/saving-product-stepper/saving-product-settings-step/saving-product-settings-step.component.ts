import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-saving-product-settings-step',
  templateUrl: './saving-product-settings-step.component.html',
  styleUrls: ['./saving-product-settings-step.component.scss']
})
export class SavingProductSettingsStepComponent implements OnInit {

  @Input() savingProductsTemplate: any;

  savingProductSettingsForm: FormGroup;

  lockinPeriodFrequencyTypeData: any;
  taxGroupData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createSavingProductSettingsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.lockinPeriodFrequencyTypeData = this.savingProductsTemplate.lockinPeriodFrequencyTypeOptions;
    this.taxGroupData = this.savingProductsTemplate.taxGroupOptions;
  }

  createSavingProductSettingsForm() {
    this.savingProductSettingsForm = this.formBuilder.group({
      'minRequiredOpeningBalance': [''],
      'lockinPeriodFrequency': [''],
      'lockinPeriodFrequencyType': [''],
      'withdrawalFeeForTransfers': [false],
      'minBalanceForInterestCalculation': [''],
      'enforceMinRequiredBalance': [false],
      'minRequiredBalance': [''],
      'allowOverdraft': [false],
      'withHoldTax': [false],
      'isDormancyTrackingActive': [false]
    });
  }

  setConditionalControls() {
    this.savingProductSettingsForm.get('allowOverdraft').valueChanges
      .subscribe((allowOverdraft: any) => {
        if (allowOverdraft) {
          this.savingProductSettingsForm.addControl('minOverdraftForInterestCalculation', new FormControl(''));
          this.savingProductSettingsForm.addControl('nominalAnnualInterestRateOverdraft', new FormControl(''));
          this.savingProductSettingsForm.addControl('overdraftLimit', new FormControl(''));
        } else {
          this.savingProductSettingsForm.removeControl('minOverdraftForInterestCalculation');
          this.savingProductSettingsForm.removeControl('nominalAnnualInterestRateOverdraft');
          this.savingProductSettingsForm.removeControl('overdraftLimit');
        }
      });

    this.savingProductSettingsForm.get('withHoldTax').valueChanges
      .subscribe((withHoldTax: any) => {
        if (withHoldTax) {
          this.savingProductSettingsForm.addControl('taxGroupId', new FormControl('', Validators.required));
        } else {
          this.savingProductSettingsForm.removeControl('taxGroupId');
        }
      });

    this.savingProductSettingsForm.get('isDormancyTrackingActive').valueChanges
      .subscribe((isDormancyTrackingActive: any) => {
        if (isDormancyTrackingActive) {
          this.savingProductSettingsForm.addControl('daysToInactive', new FormControl('', Validators.required));
          this.savingProductSettingsForm.addControl('daysToDormancy', new FormControl('', Validators.required));
          this.savingProductSettingsForm.addControl('daysToEscheat', new FormControl('', Validators.required));
        } else {
          this.savingProductSettingsForm.removeControl('daysToInactive');
          this.savingProductSettingsForm.removeControl('daysToDormancy');
          this.savingProductSettingsForm.removeControl('daysToEscheat');
        }
      });
  }

  get savingProductSettings() {
    return this.savingProductSettingsForm.value;
  }

}
