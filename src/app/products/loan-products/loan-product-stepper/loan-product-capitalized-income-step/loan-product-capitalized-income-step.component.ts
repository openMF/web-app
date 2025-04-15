import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CapitalizedIncome } from '../loan-product-payment-strategy-step/payment-allocation-model';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';

@Component({
  selector: 'mifosx-loan-product-capitalized-income-step',
  templateUrl: './loan-product-capitalized-income-step.component.html',
  styleUrls: ['./loan-product-capitalized-income-step.component.scss']
})
export class LoanProductCapitalizedIncomeStepComponent {
  @Input() capitalizedIncome: CapitalizedIncome;
  @Input() capitalizedIncomeCalculationTypeOptions: StringEnumOptionData[];
  @Input() capitalizedIncomeStrategyOptions: StringEnumOptionData[];

  loanIncomeCapitalizationForm: UntypedFormGroup;

  enableIncomeCapitalization: boolean;

  @Output() setCapitalizedIncome = new EventEmitter<CapitalizedIncome>();

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
        incomeCapitalizationCalculationType: [
          this.capitalizedIncome.incomeCapitalizationCalculationType,
          Validators.required
        ],
        incomeCapitalizationStrategy: [
          this.capitalizedIncome.incomeCapitalizationStrategy,
          Validators.required
        ]
      });
    } else {
      this.loanIncomeCapitalizationForm = this.formBuilder.group({
        enableIncomeCapitalization: [this.enableIncomeCapitalization]
      });
    }
  }

  setConditionalControls() {
    this.loanIncomeCapitalizationForm.get('enableIncomeCapitalization').valueChanges.subscribe((enabled: boolean) => {
      this.enableIncomeCapitalization = enabled;
      if (this.enableIncomeCapitalization) {
        this.loanIncomeCapitalizationForm.addControl(
          'incomeCapitalizationCalculationType',
          new UntypedFormControl(this.capitalizedIncome.incomeCapitalizationCalculationType, Validators.required)
        );
        this.loanIncomeCapitalizationForm.addControl(
          'incomeCapitalizationStrategy',
          new UntypedFormControl(this.capitalizedIncome.incomeCapitalizationStrategy, Validators.required)
        );
        this.setCapitalizedIncome.emit({
          enableIncomeCapitalization: true,
          incomeCapitalizationCalculationType: '',
          incomeCapitalizationStrategy: ''
        });

        this.loanIncomeCapitalizationForm
          .get('incomeCapitalizationCalculationType')
          .valueChanges.subscribe((newValue: string) => {
            this.setCapitalizedIncome.emit({
              enableIncomeCapitalization: true,
              incomeCapitalizationCalculationType: newValue,
              incomeCapitalizationStrategy: this.loanIncomeCapitalizationForm.value.incomeCapitalizationStrategy
            });
          });
        this.loanIncomeCapitalizationForm
          .get('incomeCapitalizationStrategy')
          .valueChanges.subscribe((newValue: string) => {
            this.setCapitalizedIncome.emit({
              enableIncomeCapitalization: true,
              incomeCapitalizationCalculationType:
                this.loanIncomeCapitalizationForm.value.incomeCapitalizationCalculationType,
              incomeCapitalizationStrategy: newValue
            });
          });
      } else {
        this.loanIncomeCapitalizationForm.removeControl('incomeCapitalizationCalculationType');
        this.loanIncomeCapitalizationForm.removeControl('incomeCapitalizationStrategy');
        this.setCapitalizedIncome.emit({ enableIncomeCapitalization: false });
      }
    });
  }
}
