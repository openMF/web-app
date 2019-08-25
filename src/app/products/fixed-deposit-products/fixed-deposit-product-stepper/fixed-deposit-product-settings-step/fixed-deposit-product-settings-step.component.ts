import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-fixed-deposit-product-settings-step',
  templateUrl: './fixed-deposit-product-settings-step.component.html',
  styleUrls: ['./fixed-deposit-product-settings-step.component.scss']
})
export class FixedDepositProductSettingsStepComponent implements OnInit {

  @Input() fixedDepositProductsTemplate: any;

  fixedDepositProductSettingsForm: FormGroup;

  lockinPeriodFrequencyTypeData: any;
  periodFrequencyTypeData: any;
  preClosurePenalInterestOnTypeData: any;
  taxGroupData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createFixedDepositProductSettingsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.lockinPeriodFrequencyTypeData = this.fixedDepositProductsTemplate.lockinPeriodFrequencyTypeOptions;
    this.periodFrequencyTypeData = this.fixedDepositProductsTemplate.periodFrequencyTypeOptions.slice(0, -1);
    this.preClosurePenalInterestOnTypeData = this.fixedDepositProductsTemplate.preClosurePenalInterestOnTypeOptions;
    this.taxGroupData = this.fixedDepositProductsTemplate.taxGroupOptions;
  }

  createFixedDepositProductSettingsForm() {
    this.fixedDepositProductSettingsForm = this.formBuilder.group({
      'lockinPeriodFrequency': [''],
      'lockinPeriodFrequencyType': [''],
      'minDepositTerm': ['', Validators.required],
      'minDepositTermTypeId': ['', Validators.required],
      'inMultiplesOfDepositTerm': [''],
      'inMultiplesOfDepositTermTypeId': [''],
      'maxDepositTerm': [''],
      'maxDepositTermTypeId': [''],
      'preClosurePenalApplicable': [false],
      'preClosurePenalInterest': [''],
      'preClosurePenalInterestOnTypeId': [''],
      'withHoldTax': [false]
    });
  }

  setConditionalControls() {
    this.fixedDepositProductSettingsForm.get('withHoldTax').valueChanges
      .subscribe((withHoldTax: any) => {
        if (withHoldTax) {
          this.fixedDepositProductSettingsForm.addControl('taxGroupId', new FormControl('', Validators.required));
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
