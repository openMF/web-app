import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSelect } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-saving-product-terms-step',
  templateUrl: './saving-product-terms-step.component.html',
  styleUrls: ['./saving-product-terms-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatTooltip,
    MatError,
    MatSelect,
    NgFor,
    MatOption,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class SavingProductTermsStepComponent implements OnInit {
  @Input() savingProductsTemplate: any;

  savingProductTermsForm: UntypedFormGroup;

  interestCompoundingPeriodTypeData: any;
  interestPostingPeriodTypeData: any;
  interestCalculationTypeData: any;
  interestCalculationDaysInYearTypeData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createSavingProductTermsForm();
  }

  ngOnInit() {
    this.interestCompoundingPeriodTypeData = this.savingProductsTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.savingProductsTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.savingProductsTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData = this.savingProductsTemplate.interestCalculationDaysInYearTypeOptions;

    this.savingProductTermsForm.patchValue({
      nominalAnnualInterestRate: this.savingProductsTemplate.nominalAnnualInterestRate,
      interestCompoundingPeriodType: this.savingProductsTemplate.interestCompoundingPeriodType.id,
      interestPostingPeriodType: this.savingProductsTemplate.interestPostingPeriodType.id,
      interestCalculationType: this.savingProductsTemplate.interestCalculationType.id,
      interestCalculationDaysInYearType: this.savingProductsTemplate.interestCalculationDaysInYearType.id
    });
  }

  createSavingProductTermsForm() {
    this.savingProductTermsForm = this.formBuilder.group({
      nominalAnnualInterestRate: [
        '',
        Validators.required
      ],
      interestCompoundingPeriodType: [
        '',
        Validators.required
      ],
      interestPostingPeriodType: [
        '',
        Validators.required
      ],
      interestCalculationType: [
        '',
        Validators.required
      ],
      interestCalculationDaysInYearType: [
        '',
        Validators.required
      ]
    });
  }

  get savingProductTerms() {
    return this.savingProductTermsForm.value;
  }
}
