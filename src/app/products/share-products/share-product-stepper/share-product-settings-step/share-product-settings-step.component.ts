import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-share-product-settings-step',
  templateUrl: './share-product-settings-step.component.html',
  styleUrls: ['./share-product-settings-step.component.scss']
})
export class ShareProductSettingsStepComponent implements OnInit {

  @Input() shareProductsTemplate: any;

  shareProductSettingsForm: FormGroup;

  minimumActivePeriodFrequencyTypeData: any;
  lockinPeriodFrequencyTypeData: any;

  constructor(private formBuilder: FormBuilder) {
    this.createShareProductSettingsForm();
  }

  ngOnInit() {
    this.minimumActivePeriodFrequencyTypeData = this.shareProductsTemplate.minimumActivePeriodFrequencyTypeOptions;
    this.lockinPeriodFrequencyTypeData = this.shareProductsTemplate.lockinPeriodFrequencyTypeOptions;
  }

  createShareProductSettingsForm() {
    this.shareProductSettingsForm = this.formBuilder.group({
      'minimumShares': [''],
      'nominalShares': ['', Validators.required],
      'maximumShares': [''],
      'minimumActivePeriodForDividends': [''],
      'minimumactiveperiodFrequencyType': [''],
      'lockinPeriodFrequency': [''],
      'lockinPeriodFrequencyType': [''],
      'allowDividendCalculationForInactiveClients': [false]
    });
  }

  get shareProductSettings() {
    return this.shareProductSettingsForm.value;
  }

}
