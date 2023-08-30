import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'mifosx-saving-product-settings-step',
  templateUrl: './saving-product-settings-step.component.html',
  styleUrls: ['./saving-product-settings-step.component.scss']
})
export class SavingProductSettingsStepComponent implements OnInit {

  @Input() savingProductsTemplate: any;

  savingProductSettingsForm: UntypedFormGroup;

  lockinPeriodFrequencyTypeData: any;
  taxGroupData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createSavingProductSettingsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.lockinPeriodFrequencyTypeData = this.savingProductsTemplate.lockinPeriodFrequencyTypeOptions;
    this.taxGroupData = this.savingProductsTemplate.taxGroupOptions;

    this.savingProductSettingsForm.patchValue({
      'minRequiredOpeningBalance': this.savingProductsTemplate.minRequiredOpeningBalance,
      'lockinPeriodFrequency': this.savingProductsTemplate.lockinPeriodFrequency,
      'lockinPeriodFrequencyType': this.savingProductsTemplate.lockinPeriodFrequencyType && this.savingProductsTemplate.lockinPeriodFrequencyType.id,
      'withdrawalFeeForTransfers': this.savingProductsTemplate.withdrawalFeeForTransfers,
      'minBalanceForInterestCalculation': this.savingProductsTemplate.minBalanceForInterestCalculation,
      'enforceMinRequiredBalance': this.savingProductsTemplate.enforceMinRequiredBalance,
      'minRequiredBalance': this.savingProductsTemplate.minRequiredBalance,
      'allowOverdraft': this.savingProductsTemplate.allowOverdraft,
      'minOverdraftForInterestCalculation': this.savingProductsTemplate.minOverdraftForInterestCalculation,
      'nominalAnnualInterestRateOverdraft': this.savingProductsTemplate.nominalAnnualInterestRateOverdraft,
      'overdraftLimit': this.savingProductsTemplate.overdraftLimit,
      'withHoldTax': this.savingProductsTemplate.withHoldTax,
      'taxGroupId': this.savingProductsTemplate.taxGroup && this.savingProductsTemplate.taxGroup.id,
      'isDormancyTrackingActive': this.savingProductsTemplate.isDormancyTrackingActive,
      'daysToInactive': this.savingProductsTemplate.daysToInactive,
      'daysToDormancy': this.savingProductsTemplate.daysToDormancy,
      'daysToEscheat': this.savingProductsTemplate.daysToEscheat
    });
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
          this.savingProductSettingsForm.addControl('minOverdraftForInterestCalculation', new UntypedFormControl(''));
          this.savingProductSettingsForm.addControl('nominalAnnualInterestRateOverdraft', new UntypedFormControl(''));
          this.savingProductSettingsForm.addControl('overdraftLimit', new UntypedFormControl(''));
        } else {
          this.savingProductSettingsForm.removeControl('minOverdraftForInterestCalculation');
          this.savingProductSettingsForm.removeControl('nominalAnnualInterestRateOverdraft');
          this.savingProductSettingsForm.removeControl('overdraftLimit');
        }
      });

    this.savingProductSettingsForm.get('withHoldTax').valueChanges
      .subscribe((withHoldTax: any) => {
        if (withHoldTax) {
          this.savingProductSettingsForm.addControl('taxGroupId', new UntypedFormControl('', Validators.required));
        } else {
          this.savingProductSettingsForm.removeControl('taxGroupId');
        }
      });

    this.savingProductSettingsForm.get('isDormancyTrackingActive').valueChanges
      .subscribe((isDormancyTrackingActive: any) => {
        if (isDormancyTrackingActive) {
          this.savingProductSettingsForm.addControl('daysToInactive', new UntypedFormControl('', Validators.required));
          this.savingProductSettingsForm.addControl('daysToDormancy', new UntypedFormControl('', Validators.required));
          this.savingProductSettingsForm.addControl('daysToEscheat', new UntypedFormControl('', Validators.required));
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
