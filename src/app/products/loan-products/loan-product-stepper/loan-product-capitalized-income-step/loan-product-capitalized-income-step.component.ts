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

  ngOnChanges(changes: SimpleChanges): void {
    this.enableIncomeCapitalization = this.capitalizedIncome.enableIncomeCapitalization;
    if (this.enableIncomeCapitalization) {
      this.loanIncomeCapitalizationForm.patchValue({
        enableIncomeCapitalization: this.enableIncomeCapitalization,
        incomeCapitalizationCalculationType: this.capitalizedIncome.incomeCapitalizationCalculationType,
        incomeCapitalizationStrategy: this.capitalizedIncome.incomeCapitalizationStrategy
      });
    }
  }

  setConditionalControls() {
    this.loanIncomeCapitalizationForm.get('enableIncomeCapitalization').valueChanges.subscribe((enabled: boolean) => {
      this.enableIncomeCapitalization = enabled;
      if (this.enableIncomeCapitalization) {
        const incomeCapitalizationCalculationType =
          this.capitalizedIncome.incomeCapitalizationCalculationType == ''
            ? this.capitalizedIncomeCalculationTypeOptions[0].id
            : this.capitalizedIncome.incomeCapitalizationCalculationType;
        this.loanIncomeCapitalizationForm.addControl(
          'incomeCapitalizationCalculationType',
          new UntypedFormControl(
            this.capitalizedIncome.incomeCapitalizationCalculationType ||
              this.capitalizedIncomeCalculationTypeOptions[0].id,
            Validators.required
          )
        );
        const incomeCapitalizationStrategy =
          this.capitalizedIncome.incomeCapitalizationStrategy == ''
            ? this.capitalizedIncomeStrategyOptions[0].id
            : this.capitalizedIncome.incomeCapitalizationStrategy;
        this.loanIncomeCapitalizationForm.addControl(
          'incomeCapitalizationStrategy',
          new UntypedFormControl(incomeCapitalizationStrategy, Validators.required)
        );
        this.setCapitalizedIncome.emit({
          enableIncomeCapitalization: true,
          incomeCapitalizationCalculationType: incomeCapitalizationCalculationType,
          incomeCapitalizationStrategy: incomeCapitalizationStrategy
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
