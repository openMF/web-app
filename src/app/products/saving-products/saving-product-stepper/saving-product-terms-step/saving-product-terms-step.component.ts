import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-saving-product-terms-step',
  templateUrl: './saving-product-terms-step.component.html',
  styleUrls: ['./saving-product-terms-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
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
