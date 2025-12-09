import { Component, OnInit, Input, inject } from '@angular/core';
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
  private formBuilder = inject(UntypedFormBuilder);

  @Input() shareProductsTemplate: any;

  shareProductSettingsForm: UntypedFormGroup;

  minimumActivePeriodFrequencyTypeData: any;
  lockinPeriodFrequencyTypeData: any;

  constructor() {
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
    this.shareProductSettingsForm = this.formBuilder.group(
      {
        minimumShares: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern(/^[0-9]+$/)
          ]
        ],
        nominalShares: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern(/^[0-9]+$/)
          ]
        ],
        maximumShares: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern(/^[0-9]+$/)
          ]
        ],
        minimumActivePeriodForDividends: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern(/^[0-9]+$/)
          ]
        ],
        minimumactiveperiodFrequencyType: [''],
        lockinPeriodFrequency: [''],
        lockinPeriodFrequencyType: [''],
        allowDividendCalculationForInactiveClients: [false]
      },
      {
        validators: this.validateSharesOrder
      }
    );
  }

  private validateSharesOrder(group: UntypedFormGroup): { [key: string]: any } | null {
    const min = Number(group.get('minimumShares')?.value);
    const nominal = Number(group.get('nominalShares')?.value);
    const max = Number(group.get('maximumShares')?.value);
    if (min && nominal && max) {
      if (min > nominal || nominal > max) {
        return { sharesOrder: true };
      }
    }
    return null;
  }

  get shareProductSettings() {
    return this.shareProductSettingsForm.value;
  }
}
