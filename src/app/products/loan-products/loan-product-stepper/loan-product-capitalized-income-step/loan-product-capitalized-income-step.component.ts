import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CapitalizedIncome } from '../loan-product-payment-strategy-step/payment-allocation-model';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';

@Component({
  selector: 'mifosx-loan-product-capitalized-income-step',
  templateUrl: './loan-product-capitalized-income-step.component.html',
  styleUrls: ['./loan-product-capitalized-income-step.component.scss']
})
export class LoanProductCapitalizedIncomeStepComponent implements OnChanges {
  @Input() capitalizedIncome: CapitalizedIncome;
  @Input() capitalizedIncomeCalculationTypeOptions: StringEnumOptionData[];
  @Input() capitalizedIncomeStrategyOptions: StringEnumOptionData[];
  @Input() capitalizedIncomeTypeOptions: StringEnumOptionData[];

  loanIncomeCapitalizationForm: UntypedFormGroup;

  enableIncomeCapitalization: boolean;

  @Output() setCapitalizedIncome = new EventEmitter<CapitalizedIncome>();
  @Output() setViewChildForm = new EventEmitter<UntypedFormGroup>();

  constructor(private formBuilder: UntypedFormBuilder) {
    this.enableIncomeCapitalization =
      this.capitalizedIncome != null ? this.capitalizedIncome.enableIncomeCapitalization : false;
    this.createCapitalizedIncomeForm();
    this.setConditionalControls();
  }

  createCapitalizedIncomeForm() {
    if (this.enableIncomeCapitalization) {
      this.loanIncomeCapitalizationForm = this.formBuilder.group({
        enableIncomeCapitalization: [this.enableIncomeCapitalization],
        capitalizedIncomeCalculationType: [
          this.capitalizedIncome.capitalizedIncomeCalculationType,
          Validators.required
        ],
        capitalizedIncomeStrategy: [
          this.capitalizedIncome.capitalizedIncomeStrategy,
          Validators.required
        ],
        capitalizedIncomeType: [
          this.capitalizedIncome.capitalizedIncomeType,
          Validators.required
        ]
      });
    } else {
      this.loanIncomeCapitalizationForm = this.formBuilder.group({
        enableIncomeCapitalization: [this.enableIncomeCapitalization]
      });
    }
    this.setViewChildForm.emit(this.loanIncomeCapitalizationForm);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.enableIncomeCapitalization = this.capitalizedIncome.enableIncomeCapitalization;
    if (this.enableIncomeCapitalization) {
      this.loanIncomeCapitalizationForm.patchValue({
        enableIncomeCapitalization: this.enableIncomeCapitalization,
        capitalizedIncomeCalculationType: this.capitalizedIncome.capitalizedIncomeCalculationType,
        capitalizedIncomeStrategy: this.capitalizedIncome.capitalizedIncomeStrategy,
        capitalizedIncomeType: this.capitalizedIncome.capitalizedIncomeType
      });
    }
    this.setViewChildForm.emit(this.loanIncomeCapitalizationForm);
  }

  setConditionalControls() {
    this.loanIncomeCapitalizationForm.get('enableIncomeCapitalization').valueChanges.subscribe((enabled: boolean) => {
      this.enableIncomeCapitalization = enabled;
      if (this.enableIncomeCapitalization) {
        const capitalizedIncomeCalculationType =
          !this.capitalizedIncome.capitalizedIncomeCalculationType ||
          this.capitalizedIncome.capitalizedIncomeCalculationType == ''
            ? this.capitalizedIncomeCalculationTypeOptions[0].id
            : this.capitalizedIncome.capitalizedIncomeCalculationType;
        this.loanIncomeCapitalizationForm.addControl(
          'capitalizedIncomeCalculationType',
          new UntypedFormControl(capitalizedIncomeCalculationType, Validators.required)
        );
        const capitalizedIncomeStrategy =
          !this.capitalizedIncome.capitalizedIncomeStrategy || this.capitalizedIncome.capitalizedIncomeStrategy == ''
            ? this.capitalizedIncomeStrategyOptions[0].id
            : this.capitalizedIncome.capitalizedIncomeStrategy;
        this.loanIncomeCapitalizationForm.addControl(
          'capitalizedIncomeStrategy',
          new UntypedFormControl(capitalizedIncomeStrategy, Validators.required)
        );
        const capitalizedIncomeType =
          !this.capitalizedIncome.capitalizedIncomeType || this.capitalizedIncome.capitalizedIncomeType == ''
            ? this.capitalizedIncomeTypeOptions[0].id
            : this.capitalizedIncome.capitalizedIncomeType;
        this.loanIncomeCapitalizationForm.addControl(
          'capitalizedIncomeType',
          new UntypedFormControl(capitalizedIncomeType, Validators.required)
        );
        this.setCapitalizedIncome.emit({
          enableIncomeCapitalization: true,
          capitalizedIncomeCalculationType: capitalizedIncomeCalculationType,
          capitalizedIncomeStrategy: capitalizedIncomeStrategy,
          capitalizedIncomeType: capitalizedIncomeType
        });

        this.loanIncomeCapitalizationForm
          .get('capitalizedIncomeCalculationType')
          .valueChanges.subscribe((newValue: string) => {
            this.setCapitalizedIncome.emit({
              enableIncomeCapitalization: true,
              capitalizedIncomeCalculationType: newValue,
              capitalizedIncomeStrategy: this.loanIncomeCapitalizationForm.value.capitalizedIncomeStrategy,
              capitalizedIncomeType: this.loanIncomeCapitalizationForm.value.capitalizedIncomeType
            });
          });
        this.loanIncomeCapitalizationForm
          .get('capitalizedIncomeStrategy')
          .valueChanges.subscribe((newValue: string) => {
            this.setCapitalizedIncome.emit({
              enableIncomeCapitalization: true,
              capitalizedIncomeCalculationType:
                this.loanIncomeCapitalizationForm.value.capitalizedIncomeCalculationType,
              capitalizedIncomeStrategy: newValue,
              capitalizedIncomeType: this.loanIncomeCapitalizationForm.value.capitalizedIncomeType
            });
          });
        this.loanIncomeCapitalizationForm.get('capitalizedIncomeType').valueChanges.subscribe((newValue: string) => {
          this.setCapitalizedIncome.emit({
            enableIncomeCapitalization: true,
            capitalizedIncomeCalculationType: this.loanIncomeCapitalizationForm.value.capitalizedIncomeCalculationType,
            capitalizedIncomeStrategy: this.loanIncomeCapitalizationForm.value.capitalizedIncomeStrategy,
            capitalizedIncomeType: newValue
          });
        });
      } else {
        this.loanIncomeCapitalizationForm.removeControl('capitalizedIncomeCalculationType');
        this.loanIncomeCapitalizationForm.removeControl('capitalizedIncomeStrategy');
        this.loanIncomeCapitalizationForm.removeControl('capitalizedIncomeType');
        this.setCapitalizedIncome.emit({ enableIncomeCapitalization: false });
      }

      this.setViewChildForm.emit(this.loanIncomeCapitalizationForm);
    });
  }
}
