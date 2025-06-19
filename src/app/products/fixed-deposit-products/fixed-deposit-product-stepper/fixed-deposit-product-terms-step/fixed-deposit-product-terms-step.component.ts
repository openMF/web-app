import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';
import { MatSelect } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-fixed-deposit-product-terms-step',
  templateUrl: './fixed-deposit-product-terms-step.component.html',
  styleUrls: ['./fixed-deposit-product-terms-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatTooltip,
    MatError,
    MatDivider,
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
export class FixedDepositProductTermsStepComponent implements OnInit {
  @Input() fixedDepositProductsTemplate: any;

  fixedDepositProductTermsForm: UntypedFormGroup;

  interestCompoundingPeriodTypeData: any;
  interestPostingPeriodTypeData: any;
  interestCalculationTypeData: any;
  interestCalculationDaysInYearTypeData: any;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createFixedDepositProductTermsForm();
  }

  ngOnInit() {
    this.interestCompoundingPeriodTypeData = this.fixedDepositProductsTemplate.interestCompoundingPeriodTypeOptions;
    this.interestPostingPeriodTypeData = this.fixedDepositProductsTemplate.interestPostingPeriodTypeOptions;
    this.interestCalculationTypeData = this.fixedDepositProductsTemplate.interestCalculationTypeOptions;
    this.interestCalculationDaysInYearTypeData =
      this.fixedDepositProductsTemplate.interestCalculationDaysInYearTypeOptions;

    if (!(this.fixedDepositProductsTemplate === undefined) && this.fixedDepositProductsTemplate.id) {
      this.fixedDepositProductTermsForm.patchValue({
        minDepositAmount: this.fixedDepositProductsTemplate.minDepositAmount,
        depositAmount: this.fixedDepositProductsTemplate.depositAmount,
        maxDepositAmount: this.fixedDepositProductsTemplate.maxDepositAmount
      });
    }

    this.fixedDepositProductTermsForm.patchValue({
      interestCompoundingPeriodType: this.fixedDepositProductsTemplate.interestCompoundingPeriodType.id,
      interestPostingPeriodType: this.fixedDepositProductsTemplate.interestPostingPeriodType.id,
      interestCalculationType: this.fixedDepositProductsTemplate.interestCalculationType.id,
      interestCalculationDaysInYearType: this.fixedDepositProductsTemplate.interestCalculationDaysInYearType.id
    });
  }

  createFixedDepositProductTermsForm() {
    this.fixedDepositProductTermsForm = this.formBuilder.group({
      minDepositAmount: [''],
      depositAmount: [
        '',
        Validators.required
      ],
      maxDepositAmount: [''],
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

  get fixedDepositProductTerms() {
    const fixedDepositProductTerms = this.fixedDepositProductTermsForm.value;
    for (const key in fixedDepositProductTerms) {
      if (fixedDepositProductTerms[key] === '') {
        delete fixedDepositProductTerms[key];
      }
    }
    return fixedDepositProductTerms;
  }
}
