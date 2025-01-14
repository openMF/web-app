import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-recurring-deposit-product-settings-step',
  templateUrl: './recurring-deposit-product-settings-step.component.html',
  styleUrls: ['./recurring-deposit-product-settings-step.component.scss']
})
export class RecurringDepositProductSettingsStepComponent implements OnInit {
  @Input() recurringDepositProductsTemplate: any;

  recurringDepositProductSettingsForm: UntypedFormGroup;

  lockinPeriodFrequencyTypeData: any;
  periodFrequencyTypeData: any;
  preClosurePenalInterestOnTypeData: any;
  taxGroupData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createrecurringDepositProductSettingsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.lockinPeriodFrequencyTypeData = this.recurringDepositProductsTemplate.lockinPeriodFrequencyTypeOptions;
    this.periodFrequencyTypeData = this.recurringDepositProductsTemplate.periodFrequencyTypeOptions.slice(0, -1);
    this.preClosurePenalInterestOnTypeData = this.recurringDepositProductsTemplate.preClosurePenalInterestOnTypeOptions;
    this.taxGroupData = this.recurringDepositProductsTemplate.taxGroupOptions;

    if (!(this.recurringDepositProductsTemplate === undefined) && this.recurringDepositProductsTemplate.id) {
      this.recurringDepositProductSettingsForm.patchValue({
        isMandatoryDeposit: this.recurringDepositProductsTemplate.isMandatoryDeposit,
        adjustAdvanceTowardsFuturePayments: this.recurringDepositProductsTemplate.adjustAdvanceTowardsFuturePayments,
        allowWithdrawal: this.recurringDepositProductsTemplate.allowWithdrawal,
        lockinPeriodFrequency: this.recurringDepositProductsTemplate.lockinPeriodFrequency,
        lockinPeriodFrequencyType: this.recurringDepositProductsTemplate.lockinPeriodFrequencyType
          ? this.recurringDepositProductsTemplate.lockinPeriodFrequencyType.id
          : '',
        minDepositTerm: this.recurringDepositProductsTemplate.minDepositTerm,
        minDepositTermTypeId: this.recurringDepositProductsTemplate.minDepositTermType
          ? this.recurringDepositProductsTemplate.minDepositTermType.id
          : '',
        inMultiplesOfDepositTerm: this.recurringDepositProductsTemplate.inMultiplesOfDepositTerm,
        inMultiplesOfDepositTermTypeId: this.recurringDepositProductsTemplate.inMultiplesOfDepositTermType
          ? this.recurringDepositProductsTemplate.inMultiplesOfDepositTerm.id
          : '',
        maxDepositTerm: this.recurringDepositProductsTemplate.maxDepositTerm,
        maxDepositTermTypeId: this.recurringDepositProductsTemplate.maxDepositTermType
          ? this.recurringDepositProductsTemplate.minDepositTermType.id
          : '',
        preClosurePenalApplicable: this.recurringDepositProductsTemplate.preClosurePenalApplicable,
        preClosurePenalInterest: this.recurringDepositProductsTemplate.preClosurePenalInterest,
        preClosurePenalInterestOnTypeId: this.recurringDepositProductsTemplate.preClosurePenalInterestOnType
          ? this.recurringDepositProductsTemplate.preClosurePenalInterestOnType.id
          : '',
        withHoldTax: this.recurringDepositProductsTemplate.withHoldTax
      });
    }

    if (this.recurringDepositProductsTemplate.withHoldTax) {
      this.recurringDepositProductSettingsForm.patchValue({
        taxGroupId: this.recurringDepositProductsTemplate.taxGroup
          ? this.recurringDepositProductsTemplate.taxGroup.id
          : ''
      });
    }
  }

  createrecurringDepositProductSettingsForm() {
    this.recurringDepositProductSettingsForm = this.formBuilder.group({
      isMandatoryDeposit: [false],
      adjustAdvanceTowardsFuturePayments: [false],
      allowWithdrawal: [false],
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
    this.recurringDepositProductSettingsForm.get('withHoldTax').valueChanges.subscribe((withHoldTax: any) => {
      if (withHoldTax) {
        this.recurringDepositProductSettingsForm.addControl(
          'taxGroupId',
          new UntypedFormControl('', Validators.required)
        );
      } else {
        this.recurringDepositProductSettingsForm.removeControl('taxGroupId');
      }
    });
  }

  get recurringDepositProductSettings() {
    const recurringDepositProductSettings = this.recurringDepositProductSettingsForm.value;
    for (const key in recurringDepositProductSettings) {
      if (recurringDepositProductSettings[key] === '') {
        delete recurringDepositProductSettings[key];
      }
    }
    return recurringDepositProductSettings;
  }
}
