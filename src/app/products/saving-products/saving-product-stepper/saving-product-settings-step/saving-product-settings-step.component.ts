import { Component, OnInit, Input, inject } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-saving-product-settings-step',
  templateUrl: './saving-product-settings-step.component.html',
  styleUrls: ['./saving-product-settings-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatCheckbox,
    MatDivider,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class SavingProductSettingsStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  @Input() savingProductsTemplate: any;

  savingProductSettingsForm: UntypedFormGroup;

  lockinPeriodFrequencyTypeData: any;
  taxGroupData: any;

  constructor() {
    this.createSavingProductSettingsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.lockinPeriodFrequencyTypeData = this.savingProductsTemplate.lockinPeriodFrequencyTypeOptions;
    this.taxGroupData = this.savingProductsTemplate.taxGroupOptions;

    const hasLockinPeriod =
      this.savingProductsTemplate.lockinPeriodFrequency && this.savingProductsTemplate.lockinPeriodFrequency > 0;

    this.savingProductSettingsForm.patchValue({
      minRequiredOpeningBalance: this.savingProductsTemplate.minRequiredOpeningBalance,
      enableLockinPeriod: hasLockinPeriod,
      withdrawalFeeForTransfers: this.savingProductsTemplate.withdrawalFeeForTransfers,
      minBalanceForInterestCalculation: this.savingProductsTemplate.minBalanceForInterestCalculation,
      enforceMinRequiredBalance: this.savingProductsTemplate.enforceMinRequiredBalance,
      minRequiredBalance: this.savingProductsTemplate.minRequiredBalance,
      allowOverdraft: this.savingProductsTemplate.allowOverdraft,
      minOverdraftForInterestCalculation: this.savingProductsTemplate.minOverdraftForInterestCalculation,
      nominalAnnualInterestRateOverdraft: this.savingProductsTemplate.nominalAnnualInterestRateOverdraft,
      overdraftLimit: this.savingProductsTemplate.overdraftLimit,
      withHoldTax: this.savingProductsTemplate.withHoldTax,
      taxGroupId: this.savingProductsTemplate.taxGroup && this.savingProductsTemplate.taxGroup.id,
      isDormancyTrackingActive: this.savingProductsTemplate.isDormancyTrackingActive,
      daysToInactive: this.savingProductsTemplate.daysToInactive,
      daysToDormancy: this.savingProductsTemplate.daysToDormancy,
      daysToEscheat: this.savingProductsTemplate.daysToEscheat
    });

    if (hasLockinPeriod) {
      this.savingProductSettingsForm.patchValue({
        lockinPeriodFrequency: this.savingProductsTemplate.lockinPeriodFrequency,
        lockinPeriodFrequencyType:
          this.savingProductsTemplate.lockinPeriodFrequencyType &&
          this.savingProductsTemplate.lockinPeriodFrequencyType.id
      });
    }
  }

  createSavingProductSettingsForm() {
    this.savingProductSettingsForm = this.formBuilder.group({
      minRequiredOpeningBalance: [
        '',
        [Validators.min(0)]
      ],
      enableLockinPeriod: [false],
      withdrawalFeeForTransfers: [false],
      minBalanceForInterestCalculation: [''],
      enforceMinRequiredBalance: [false],
      minRequiredBalance: [''],
      allowOverdraft: [false],
      withHoldTax: [false],
      isDormancyTrackingActive: [false]
    });
  }

  setConditionalControls() {
    this.savingProductSettingsForm.get('enableLockinPeriod').valueChanges.subscribe((enableLockinPeriod: any) => {
      if (enableLockinPeriod) {
        this.savingProductSettingsForm.addControl(
          'lockinPeriodFrequency',
          new UntypedFormControl('', [
            Validators.required,
            Validators.min(1),
            Validators.pattern('^[1-9]\\d*$')
          ])
        );
        this.savingProductSettingsForm.addControl(
          'lockinPeriodFrequencyType',
          new UntypedFormControl('', Validators.required)
        );
      } else {
        this.savingProductSettingsForm.removeControl('lockinPeriodFrequency');
        this.savingProductSettingsForm.removeControl('lockinPeriodFrequencyType');
      }
    });

    this.savingProductSettingsForm.get('allowOverdraft').valueChanges.subscribe((allowOverdraft: any) => {
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

    this.savingProductSettingsForm.get('withHoldTax').valueChanges.subscribe((withHoldTax: any) => {
      if (withHoldTax) {
        this.savingProductSettingsForm.addControl('taxGroupId', new UntypedFormControl('', Validators.required));
      } else {
        this.savingProductSettingsForm.removeControl('taxGroupId');
      }
    });

    this.savingProductSettingsForm
      .get('isDormancyTrackingActive')
      .valueChanges.subscribe((isDormancyTrackingActive: any) => {
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
    const formValue = { ...this.savingProductSettingsForm.value };
    delete formValue.enableLockinPeriod;
    return formValue;
  }
}
