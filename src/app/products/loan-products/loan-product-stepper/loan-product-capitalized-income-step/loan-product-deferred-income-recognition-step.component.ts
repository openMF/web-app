import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  DeferredIncomeRecognition,
  CapitalizedIncome,
  BuyDownFee
} from '../loan-product-payment-strategy-step/payment-allocation-model';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-product-capitalized-income-step',
  templateUrl: './loan-product-deferred-income-recognition-step.component.html',
  styleUrls: ['./loan-product-deferred-income-recognition-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ]
})
export class LoanProductDeferredIncomeRecognitionStepComponent implements OnChanges {
  @Input() deferredIncomeRecognition: DeferredIncomeRecognition;
  @Input() capitalizedIncomeCalculationTypeOptions: StringEnumOptionData[];
  @Input() capitalizedIncomeStrategyOptions: StringEnumOptionData[];
  @Input() capitalizedIncomeTypeOptions: StringEnumOptionData[];
  @Input() buyDownFeeCalculationTypeOptions: StringEnumOptionData[];
  @Input() buyDownFeeStrategyOptions: StringEnumOptionData[];
  @Input() buyDownFeeIncomeTypeOptions: StringEnumOptionData[];

  loanDeferredIncomeRecognitionForm: UntypedFormGroup;

  enableIncomeCapitalization: boolean;
  enableBuyDownFee: boolean;

  @Output() setDeferredIncomeRecognition = new EventEmitter<DeferredIncomeRecognition>();
  @Output() setViewChildForm = new EventEmitter<UntypedFormGroup>();

  constructor(private formBuilder: UntypedFormBuilder) {
    this.enableIncomeCapitalization =
      this.deferredIncomeRecognition != null
        ? this.deferredIncomeRecognition.capitalizedIncome.enableIncomeCapitalization
        : false;
    this.enableBuyDownFee =
      this.deferredIncomeRecognition != null ? this.deferredIncomeRecognition.buyDownFee.enableBuyDownFee : false;
    this.createCapitalizedIncomeForm();
    this.setConditionalControls();
  }

  createCapitalizedIncomeForm() {
    this.loanDeferredIncomeRecognitionForm = this.formBuilder.group({
      enableIncomeCapitalization: [this.enableIncomeCapitalization],
      enableBuyDownFee: [this.enableBuyDownFee]
    });
    if (this.enableIncomeCapitalization) {
      this.loanDeferredIncomeRecognitionForm.addControl('capitalizedIncomeCalculationType', [
        this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeCalculationType,
        Validators.required
      ]);
      this.loanDeferredIncomeRecognitionForm.addControl('capitalizedIncomeStrategy', [
        this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeStrategy,
        Validators.required
      ]);
      this.loanDeferredIncomeRecognitionForm.addControl('capitalizedIncomeType', [
        this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeType,
        Validators.required
      ]);
    }
    if (this.enableBuyDownFee) {
      this.loanDeferredIncomeRecognitionForm.addControl('buyDownFeeCalculationType', [
        this.deferredIncomeRecognition.buyDownFee.buyDownFeeCalculationType,
        Validators.required
      ]);
      this.loanDeferredIncomeRecognitionForm.addControl('buyDownFeeStrategy', [
        this.deferredIncomeRecognition.buyDownFee.buyDownFeeStrategy,
        Validators.required
      ]);
      this.loanDeferredIncomeRecognitionForm.addControl('buyDownFeeIncomeType', [
        this.deferredIncomeRecognition.buyDownFee.buyDownFeeIncomeType,
        Validators.required
      ]);
    }
    this.setViewChildForm.emit(this.loanDeferredIncomeRecognitionForm);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.enableIncomeCapitalization = this.deferredIncomeRecognition.capitalizedIncome
      ? this.deferredIncomeRecognition.capitalizedIncome?.enableIncomeCapitalization
      : false;
    this.enableBuyDownFee = this.deferredIncomeRecognition.buyDownFee
      ? this.deferredIncomeRecognition.buyDownFee.enableBuyDownFee
      : false;
    if (this.enableIncomeCapitalization) {
      this.loanDeferredIncomeRecognitionForm.patchValue({
        enableIncomeCapitalization: this.enableIncomeCapitalization,
        capitalizedIncomeCalculationType:
          this.deferredIncomeRecognition.capitalizedIncome?.capitalizedIncomeCalculationType,
        capitalizedIncomeStrategy: this.deferredIncomeRecognition.capitalizedIncome?.capitalizedIncomeStrategy,
        capitalizedIncomeType: this.deferredIncomeRecognition.capitalizedIncome?.capitalizedIncomeType
      });
    }
    if (this.enableBuyDownFee) {
      this.loanDeferredIncomeRecognitionForm.patchValue({
        enableBuyDownFee: this.enableBuyDownFee,
        buyDownFeeCalculationType: this.deferredIncomeRecognition.buyDownFee.buyDownFeeCalculationType,
        buyDownFeeStrategy: this.deferredIncomeRecognition.buyDownFee.buyDownFeeStrategy,
        buyDownFeeIncomeType: this.deferredIncomeRecognition.buyDownFee.buyDownFeeIncomeType
      });
    }
    this.setViewChildForm.emit(this.loanDeferredIncomeRecognitionForm);
  }

  setConditionalControls() {
    this.loanDeferredIncomeRecognitionForm
      .get('enableIncomeCapitalization')
      .valueChanges.subscribe((enabled: boolean) => {
        this.enableIncomeCapitalization = enabled;
        if (this.enableIncomeCapitalization) {
          const capitalizedIncomeCalculationType =
            !(
              this.deferredIncomeRecognition.capitalizedIncome &&
              this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeCalculationType
            ) || this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeCalculationType == ''
              ? this.capitalizedIncomeCalculationTypeOptions[0].id
              : this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeCalculationType;
          this.loanDeferredIncomeRecognitionForm.addControl(
            'capitalizedIncomeCalculationType',
            new UntypedFormControl(capitalizedIncomeCalculationType, Validators.required)
          );
          const capitalizedIncomeStrategy =
            !this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeStrategy ||
            this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeStrategy == ''
              ? this.capitalizedIncomeStrategyOptions[0].id
              : this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeStrategy;
          this.loanDeferredIncomeRecognitionForm.addControl(
            'capitalizedIncomeStrategy',
            new UntypedFormControl(capitalizedIncomeStrategy, Validators.required)
          );
          const capitalizedIncomeType =
            !this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeType ||
            this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeType == ''
              ? this.capitalizedIncomeTypeOptions[0].id
              : this.deferredIncomeRecognition.capitalizedIncome.capitalizedIncomeType;
          this.loanDeferredIncomeRecognitionForm.addControl(
            'capitalizedIncomeType',
            new UntypedFormControl(capitalizedIncomeType, Validators.required)
          );

          this.loanDeferredIncomeRecognitionForm
            .get('capitalizedIncomeCalculationType')
            .valueChanges.subscribe((newValue: string) => {
              this.emitValuesChange();
            });
          this.loanDeferredIncomeRecognitionForm
            .get('capitalizedIncomeStrategy')
            .valueChanges.subscribe((newValue: string) => {
              this.emitValuesChange();
            });
          this.loanDeferredIncomeRecognitionForm
            .get('capitalizedIncomeType')
            .valueChanges.subscribe((newValue: string) => {
              this.emitValuesChange();
            });
        } else {
          this.loanDeferredIncomeRecognitionForm.removeControl('capitalizedIncomeCalculationType');
          this.loanDeferredIncomeRecognitionForm.removeControl('capitalizedIncomeStrategy');
          this.loanDeferredIncomeRecognitionForm.removeControl('capitalizedIncomeType');
        }

        this.emitValuesChange();
        this.setViewChildForm.emit(this.loanDeferredIncomeRecognitionForm);
      });

    this.loanDeferredIncomeRecognitionForm.get('enableBuyDownFee').valueChanges.subscribe((enabled: boolean) => {
      this.enableBuyDownFee = enabled;
      if (this.enableBuyDownFee) {
        const buyDownFeeCalculationType =
          !this.deferredIncomeRecognition.buyDownFee.buyDownFeeCalculationType ||
          this.deferredIncomeRecognition.buyDownFee.buyDownFeeCalculationType == ''
            ? this.buyDownFeeCalculationTypeOptions[0].id
            : this.deferredIncomeRecognition.buyDownFee.buyDownFeeCalculationType;
        this.loanDeferredIncomeRecognitionForm.addControl(
          'buyDownFeeCalculationType',
          new UntypedFormControl(buyDownFeeCalculationType, Validators.required)
        );
        const buyDownFeeStrategy =
          !this.deferredIncomeRecognition.buyDownFee.buyDownFeeStrategy ||
          this.deferredIncomeRecognition.buyDownFee.buyDownFeeStrategy == ''
            ? this.buyDownFeeStrategyOptions[0].id
            : this.deferredIncomeRecognition.buyDownFee.buyDownFeeStrategy;
        this.loanDeferredIncomeRecognitionForm.addControl(
          'buyDownFeeStrategy',
          new UntypedFormControl(buyDownFeeStrategy, Validators.required)
        );
        const buyDownFeeIncomeType =
          !this.deferredIncomeRecognition.buyDownFee.buyDownFeeIncomeType ||
          this.deferredIncomeRecognition.buyDownFee.buyDownFeeIncomeType == ''
            ? this.buyDownFeeIncomeTypeOptions[0].id
            : this.deferredIncomeRecognition.buyDownFee.buyDownFeeIncomeType;
        this.loanDeferredIncomeRecognitionForm.addControl(
          'buyDownFeeIncomeType',
          new UntypedFormControl(buyDownFeeIncomeType, Validators.required)
        );

        this.loanDeferredIncomeRecognitionForm
          .get('buyDownFeeCalculationType')
          .valueChanges.subscribe((newValue: string) => {
            this.emitValuesChange();
          });
        this.loanDeferredIncomeRecognitionForm.get('buyDownFeeStrategy').valueChanges.subscribe((newValue: string) => {
          this.emitValuesChange();
        });
        this.loanDeferredIncomeRecognitionForm
          .get('buyDownFeeIncomeType')
          .valueChanges.subscribe((newValue: string) => {
            this.emitValuesChange();
          });
      } else {
        this.loanDeferredIncomeRecognitionForm.removeControl('buyDownFeeCalculationType');
        this.loanDeferredIncomeRecognitionForm.removeControl('buyDownFeeStrategy');
        this.loanDeferredIncomeRecognitionForm.removeControl('buyDownFeeIncomeType');
      }

      this.emitValuesChange();
      this.setViewChildForm.emit(this.loanDeferredIncomeRecognitionForm);
    });
  }

  emitValuesChange(): void {
    const capitalizedIncome: CapitalizedIncome = this.enableIncomeCapitalization
      ? {
          enableIncomeCapitalization: true,
          capitalizedIncomeCalculationType:
            this.loanDeferredIncomeRecognitionForm.value.capitalizedIncomeCalculationType,
          capitalizedIncomeStrategy: this.loanDeferredIncomeRecognitionForm.value.capitalizedIncomeStrategy,
          capitalizedIncomeType: this.loanDeferredIncomeRecognitionForm.value.capitalizedIncomeType
        }
      : { enableIncomeCapitalization: false };
    const buyDownFee: BuyDownFee = this.enableBuyDownFee
      ? {
          enableBuyDownFee: true,
          buyDownFeeCalculationType: this.loanDeferredIncomeRecognitionForm.value.buyDownFeeCalculationType,
          buyDownFeeStrategy: this.loanDeferredIncomeRecognitionForm.value.buyDownFeeStrategy,
          buyDownFeeIncomeType: this.loanDeferredIncomeRecognitionForm.value.buyDownFeeIncomeType
        }
      : { enableBuyDownFee: false };
    this.setDeferredIncomeRecognition.emit({
      capitalizedIncome: capitalizedIncome,
      buyDownFee: buyDownFee
    });
  }
}
