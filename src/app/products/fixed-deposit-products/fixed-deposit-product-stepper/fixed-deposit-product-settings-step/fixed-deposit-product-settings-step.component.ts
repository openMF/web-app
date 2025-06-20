import { Component, OnInit, Input } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-fixed-deposit-product-settings-step',
  templateUrl: './fixed-deposit-product-settings-step.component.html',
  styleUrls: ['./fixed-deposit-product-settings-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatDivider,
    MatCheckbox,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class FixedDepositProductSettingsStepComponent implements OnInit {
  @Input() fixedDepositProductsTemplate: any;

  fixedDepositProductSettingsForm: UntypedFormGroup;

  lockinPeriodFrequencyTypeData: any;
  periodFrequencyTypeData: any;
  preClosurePenalInterestOnTypeData: any;
  taxGroupData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createFixedDepositProductSettingsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.lockinPeriodFrequencyTypeData = this.fixedDepositProductsTemplate.lockinPeriodFrequencyTypeOptions;
    this.periodFrequencyTypeData = this.fixedDepositProductsTemplate.periodFrequencyTypeOptions.slice(0, -1);
    this.preClosurePenalInterestOnTypeData = this.fixedDepositProductsTemplate.preClosurePenalInterestOnTypeOptions;
    this.taxGroupData = this.fixedDepositProductsTemplate.taxGroupOptions;

    if (!(this.fixedDepositProductsTemplate === undefined) && this.fixedDepositProductsTemplate.id) {
      this.fixedDepositProductSettingsForm.patchValue({
        isMandatoryDeposit: this.fixedDepositProductsTemplate.isMandatoryDeposit,
        adjustAdvanceTowardsFuturePayments: this.fixedDepositProductsTemplate.adjustAdvanceTowardsFuturePayments,
        allowWithdrawal: this.fixedDepositProductsTemplate.allowWithdrawal,
        lockinPeriodFrequency: this.fixedDepositProductsTemplate.lockinPeriodFrequency,
        lockinPeriodFrequencyType: this.fixedDepositProductsTemplate.lockinPeriodFrequencyType
          ? this.fixedDepositProductsTemplate.lockinPeriodFrequencyType.id
          : '',
        minDepositTerm: this.fixedDepositProductsTemplate.minDepositTerm,
        minDepositTermTypeId: this.fixedDepositProductsTemplate.minDepositTermType
          ? this.fixedDepositProductsTemplate.minDepositTermType.id
          : '',
        inMultiplesOfDepositTerm: this.fixedDepositProductsTemplate.inMultiplesOfDepositTerm,
        inMultiplesOfDepositTermTypeId: this.fixedDepositProductsTemplate.inMultiplesOfDepositTermType
          ? this.fixedDepositProductsTemplate.inMultiplesOfDepositTerm.id
          : '',
        maxDepositTerm: this.fixedDepositProductsTemplate.maxDepositTerm,
        maxDepositTermTypeId: this.fixedDepositProductsTemplate.maxDepositTermType
          ? this.fixedDepositProductsTemplate.minDepositTermType.id
          : '',
        preClosurePenalApplicable: this.fixedDepositProductsTemplate.preClosurePenalApplicable,
        preClosurePenalInterest: this.fixedDepositProductsTemplate.preClosurePenalInterest,
        preClosurePenalInterestOnTypeId: this.fixedDepositProductsTemplate.preClosurePenalInterestOnType
          ? this.fixedDepositProductsTemplate.preClosurePenalInterestOnType.id
          : '',
        withHoldTax: this.fixedDepositProductsTemplate.withHoldTax
      });
    }

    if (this.fixedDepositProductsTemplate.withHoldTax) {
      this.fixedDepositProductSettingsForm.patchValue({
        taxGroupId: this.fixedDepositProductsTemplate.taxGroup ? this.fixedDepositProductsTemplate.taxGroup.id : ''
      });
    }
  }

  createFixedDepositProductSettingsForm() {
    this.fixedDepositProductSettingsForm = this.formBuilder.group({
      lockinPeriodFrequency: [''],
      lockinPeriodFrequencyType: [''],
      minDepositTerm: [
        '',
        Validators.required
      ],
      minDepositTermTypeId: [
        '',
        Validators.required
      ],
      inMultiplesOfDepositTerm: [''],
      inMultiplesOfDepositTermTypeId: [''],
      maxDepositTerm: [''],
      maxDepositTermTypeId: [''],
      preClosurePenalApplicable: [false],
      preClosurePenalInterest: [''],
      preClosurePenalInterestOnTypeId: [''],
      withHoldTax: [false]
    });
  }

  setConditionalControls() {
    this.fixedDepositProductSettingsForm.get('withHoldTax').valueChanges.subscribe((withHoldTax: any) => {
      if (withHoldTax) {
        this.fixedDepositProductSettingsForm.addControl('taxGroupId', new UntypedFormControl('', Validators.required));
      } else {
        this.fixedDepositProductSettingsForm.removeControl('taxGroupId');
      }
    });
  }

  get fixedDepositProductSettings() {
    const fixedDepositProductSettings = this.fixedDepositProductSettingsForm.value;
    for (const key in fixedDepositProductSettings) {
      if (fixedDepositProductSettings[key] === '') {
        delete fixedDepositProductSettings[key];
      }
    }
    return fixedDepositProductSettings;
  }
}
