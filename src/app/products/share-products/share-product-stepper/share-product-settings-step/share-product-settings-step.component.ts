import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-share-product-settings-step',
  templateUrl: './share-product-settings-step.component.html',
  styleUrls: ['./share-product-settings-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatTooltip,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    NgFor,
    MatOption,
    MatCheckbox,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    TranslatePipe,
    NgxTranslatePipe
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
