import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-share-product-settings-step',
  templateUrl: './share-product-settings-step.component.html',
  styleUrls: ['./share-product-settings-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatCheckbox,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class ShareProductSettingsStepComponent implements OnInit {
  @Input() shareProductsTemplate: any;

  shareProductSettingsForm: UntypedFormGroup;

  minimumActivePeriodFrequencyTypeData: any;
  lockinPeriodFrequencyTypeData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createShareProductSettingsForm();
  }

  ngOnInit() {
    this.minimumActivePeriodFrequencyTypeData = this.shareProductsTemplate.minimumActivePeriodFrequencyTypeOptions;
    this.lockinPeriodFrequencyTypeData = this.shareProductsTemplate.lockinPeriodFrequencyTypeOptions;

    this.shareProductSettingsForm.patchValue({
      minimumShares: this.shareProductsTemplate.minimumShares,
      nominalShares: this.shareProductsTemplate.nominalShares,
      maximumShares: this.shareProductsTemplate.maximumShares,
      minimumActivePeriodForDividends: this.shareProductsTemplate.minimumActivePeriod,
      minimumactiveperiodFrequencyType:
        this.shareProductsTemplate.minimumActivePeriodForDividendsTypeEnum &&
        this.shareProductsTemplate.minimumActivePeriodForDividendsTypeEnum.id,
      lockinPeriodFrequency: this.shareProductsTemplate.lockinPeriod,
      lockinPeriodFrequencyType:
        this.shareProductsTemplate.lockPeriodTypeEnum && this.shareProductsTemplate.lockPeriodTypeEnum.id,
      allowDividendCalculationForInactiveClients: this.shareProductsTemplate.allowDividendCalculationForInactiveClients
    });
  }

  createShareProductSettingsForm() {
    this.shareProductSettingsForm = this.formBuilder.group({
      minimumShares: [''],
      nominalShares: [
        '',
        Validators.required
      ],
      maximumShares: [''],
      minimumActivePeriodForDividends: [''],
      minimumactiveperiodFrequencyType: [''],
      lockinPeriodFrequency: [''],
      lockinPeriodFrequencyType: [''],
      allowDividendCalculationForInactiveClients: [false]
    });
  }

  get shareProductSettings() {
    return this.shareProductSettingsForm.value;
  }
}
