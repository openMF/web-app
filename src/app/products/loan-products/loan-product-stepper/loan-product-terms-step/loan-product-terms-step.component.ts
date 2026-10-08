/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { ProcessingStrategyService } from '../../services/processing-strategy.service';
import { TranslateService } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FindPipe } from '../../../../pipes/find.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductService } from '../../services/loan-product.service';
import { LoanProductBaseComponent } from '../../common/loan-product-base.component';
import {
  WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY,
  WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY_OPTIONS,
  WorkingCapitalPaymentAmountCalculationStrategy,
  inactivePricingFields,
  resolvePaymentAmountCalculationStrategy
} from 'app/loans/models/working-capital/working-capital-loan-account.model';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';
import {
  annualEirValidators,
  greaterThanZeroValidator,
  withinBoundsValidator
} from 'app/shared/validators/working-capital-pricing.validator';

@Component({
  selector: 'mifosx-loan-product-terms-step',
  templateUrl: './loan-product-terms-step.component.html',
  styleUrls: ['./loan-product-terms-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatCheckbox,
    MatDivider,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatStepperPrevious,
    MatStepperNext,
    FindPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanProductTermsStepComponent extends LoanProductBaseComponent implements OnInit, OnChanges {
  private formBuilder = inject(UntypedFormBuilder);
  private processingStrategyService = inject(ProcessingStrategyService);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);

  @Input() loanProductsTemplate: any;

  loanProductTermsForm!: UntypedFormGroup;

  /** Zero Interest control. */
  zeroInterest = new UntypedFormControl(false);

  valueConditionTypeData: any;
  floatingRateData: any;
  interestRateFrequencyTypeData: any;
  overAppliedCalculationTypeData: any;
  repaymentFrequencyTypeData: any;
  repaymentStartDateTypeOptions: any;

  displayedColumns: string[] = [
    'valueConditionType',
    'borrowerCycleNumber',
    'minValue',
    'defaultValue',
    'maxValue',
    'actions'
  ];
  isAdvancedTransactionProcessingStrategy = false;

  /** Working Capital: options of the payment amount calculation strategy select. */
  paymentAmountCalculationStrategyOptions: StringEnumOptionData[] = WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY_OPTIONS;
  readonly wcStrategy = WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY;

  constructor() {
    super();
    this.createLoanProductTermsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.valueConditionTypeData = this.loanProductsTemplate.valueConditionTypeOptions;
    this.floatingRateData = this.loanProductsTemplate.floatingRateOptions;
    this.interestRateFrequencyTypeData = this.loanProductsTemplate.interestRateFrequencyTypeOptions;
    this.repaymentFrequencyTypeData = this.loanProductService.isLoanProduct
      ? this.loanProductsTemplate.repaymentFrequencyTypeOptions
      : this.loanProductsTemplate.periodFrequencyTypeOptions;
    this.repaymentStartDateTypeOptions = this.loanProductsTemplate.repaymentStartDateTypeOptions;
    this.overAppliedCalculationTypeData = [
      { id: 'percentage', value: 'Percentage' },
      { id: 'flat', value: 'Fixed Amount' }
    ];

    if (this.loanProductService.isLoanProduct) {
      this.loanProductTermsForm.patchValue({
        minPrincipal: this.loanProductsTemplate.minPrincipal,
        principal: this.loanProductsTemplate.principal,
        maxPrincipal: this.loanProductsTemplate.maxPrincipal,
        minNumberOfRepayments: this.loanProductsTemplate.minNumberOfRepayments,
        numberOfRepayments: this.loanProductsTemplate.numberOfRepayments,
        maxNumberOfRepayments: this.loanProductsTemplate.maxNumberOfRepayments,
        isLinkedToFloatingInterestRates: this.loanProductsTemplate.isLinkedToFloatingInterestRates,
        minInterestRatePerPeriod: this.loanProductsTemplate.minInterestRatePerPeriod,
        interestRatePerPeriod: this.loanProductsTemplate.interestRatePerPeriod,
        maxInterestRatePerPeriod: this.loanProductsTemplate.maxInterestRatePerPeriod,
        floatingRatesId: this.loanProductsTemplate.floatingRateId,
        interestRateDifferential: this.loanProductsTemplate.interestRateDifferential,
        isFloatingInterestRateCalculationAllowed: this.loanProductsTemplate.isFloatingInterestRateCalculationAllowed,
        allowApprovedDisbursedAmountsOverApplied: this.loanProductsTemplate.allowApprovedDisbursedAmountsOverApplied,
        minDifferentialLendingRate: this.loanProductsTemplate.minDifferentialLendingRate,
        defaultDifferentialLendingRate: this.loanProductsTemplate.defaultDifferentialLendingRate,
        maxDifferentialLendingRate: this.loanProductsTemplate.maxDifferentialLendingRate,
        useBorrowerCycle: this.loanProductsTemplate.useBorrowerCycle,
        repaymentEvery: this.loanProductsTemplate.repaymentEvery,
        minimumDaysBetweenDisbursalAndFirstRepayment:
          this.loanProductsTemplate.minimumDaysBetweenDisbursalAndFirstRepayment,
        interestRecognitionOnDisbursementDate: this.loanProductsTemplate.interestRecognitionOnDisbursementDate || false,
        interestRateFrequencyType: this.loanProductsTemplate.interestRateFrequencyType?.id,
        repaymentFrequencyType: this.loanProductsTemplate.repaymentFrequencyType?.id,
        repaymentStartDateType: this.loanProductsTemplate.repaymentStartDateType?.id || 1
      });

      if (this.loanProductsTemplate.allowApprovedDisbursedAmountsOverApplied) {
        this.loanProductTermsForm.patchValue({
          overAppliedCalculationType: this.loanProductsTemplate.overAppliedCalculationType,
          overAppliedNumber: this.loanProductsTemplate.overAppliedNumber
        });
      }

      this.loanProductTermsForm.setControl(
        'principalVariationsForBorrowerCycle',
        this.formBuilder.array(
          this.loanProductsTemplate.principalVariationsForBorrowerCycle.map((variation: any) => ({
            ...variation,
            valueConditionType: variation.valueConditionType.id
          }))
        )
      );
      this.loanProductTermsForm.setControl(
        'numberOfRepaymentVariationsForBorrowerCycle',
        this.formBuilder.array(
          this.loanProductsTemplate.numberOfRepaymentVariationsForBorrowerCycle.map((variation: any) => ({
            ...variation,
            valueConditionType: variation.valueConditionType.id
          }))
        )
      );
      this.loanProductTermsForm.setControl(
        'interestRateVariationsForBorrowerCycle',
        this.formBuilder.array(
          this.loanProductsTemplate.interestRateVariationsForBorrowerCycle.map((variation: any) => ({
            ...variation,
            valueConditionType: variation.valueConditionType.id
          }))
        )
      );

      this.zeroInterest.patchValue(
        this.loanProductsTemplate.minInterestRatePerPeriod === 0 &&
          this.loanProductsTemplate.interestRatePerPeriod === 0 &&
          this.loanProductsTemplate.maxInterestRatePerPeriod === 0
      );

      this.processingStrategyService.advancedTransactionProcessingStrategy.subscribe((value: boolean) => {
        this.isAdvancedTransactionProcessingStrategy = value;
      });
      this.validateAdvancedPaymentStrategyControls();
    }

    if (this.loanProductService.isWorkingCapital) {
      this.paymentAmountCalculationStrategyOptions =
        this.loanProductsTemplate.paymentAmountCalculationStrategyOptions?.length > 0
          ? this.loanProductsTemplate.paymentAmountCalculationStrategyOptions
          : WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY_OPTIONS;
      const strategy = resolvePaymentAmountCalculationStrategy(
        this.loanProductsTemplate.paymentAmountCalculationStrategy
      );
      this.loanProductTermsForm.patchValue({
        minPrincipal: this.loanProductsTemplate.minPrincipal,
        principal: this.loanProductsTemplate.principal,
        maxPrincipal: this.loanProductsTemplate.maxPrincipal,
        paymentAmountCalculationStrategy: strategy,
        minPeriodPaymentRate: this.loanProductsTemplate.minPeriodPaymentRate,
        periodPaymentRate: this.loanProductsTemplate.periodPaymentRate,
        maxPeriodPaymentRate: this.loanProductsTemplate.maxPeriodPaymentRate,
        minAnnualEir: this.loanProductsTemplate.minAnnualEir,
        annualEir: this.loanProductsTemplate.annualEir,
        maxAnnualEir: this.loanProductsTemplate.maxAnnualEir,
        minPaymentAmount: this.loanProductsTemplate.minPaymentAmount,
        paymentAmount: this.loanProductsTemplate.paymentAmount,
        maxPaymentAmount: this.loanProductsTemplate.maxPaymentAmount,
        repaymentEvery: this.loanProductsTemplate.repaymentEvery,
        repaymentFrequencyType: this.loanProductsTemplate.repaymentFrequencyType
          ? this.loanProductsTemplate.repaymentFrequencyType.id
          : null,
        discount: this.loanProductsTemplate.discount
      });
      this.applyPaymentAmountCalculationStrategy(strategy);
    }
  }

  /** Working Capital: strategy currently selected in the form (TPV when the control is blank). */
  get paymentAmountCalculationStrategy(): WorkingCapitalPaymentAmountCalculationStrategy {
    return resolvePaymentAmountCalculationStrategy(
      this.loanProductTermsForm.get('paymentAmountCalculationStrategy')?.value
    );
  }

  /**
   * Working Capital: the backend accepts exactly one pricing group per strategy and returns
   * `not.allowed.for.<strategy>.strategy` for any other. Switching the select therefore clears
   * the groups that no longer apply and moves the validators to the active one. Under ANNUAL_EIR
   * and PAYMENT_AMOUNT the discount is mandatory and must be positive.
   */
  private applyPaymentAmountCalculationStrategy(strategy: WorkingCapitalPaymentAmountCalculationStrategy): void {
    const form = this.loanProductTermsForm;
    const bounded = (minName: string, maxName: string) =>
      withinBoundsValidator(
        () => form.get(minName)?.value,
        () => form.get(maxName)?.value
      );
    const groups: Record<WorkingCapitalPaymentAmountCalculationStrategy, Record<string, any[]>> = {
      TPV: {
        minPeriodPaymentRate: [Validators.min(0)],
        periodPaymentRate: [
          Validators.required,
          Validators.min(0),
          bounded('minPeriodPaymentRate', 'maxPeriodPaymentRate')
        ],
        maxPeriodPaymentRate: [Validators.min(0)]
      },
      ANNUAL_EIR: {
        minAnnualEir: annualEirValidators(),
        annualEir: [
          Validators.required,
          ...annualEirValidators(),
          bounded('minAnnualEir', 'maxAnnualEir')
        ],
        maxAnnualEir: annualEirValidators()
      },
      PAYMENT_AMOUNT: {
        minPaymentAmount: [greaterThanZeroValidator()],
        paymentAmount: [
          Validators.required,
          greaterThanZeroValidator(),
          bounded('minPaymentAmount', 'maxPaymentAmount')
        ],
        maxPaymentAmount: [greaterThanZeroValidator()]
      }
    };
    inactivePricingFields(strategy).forEach((name) => {
      const control = form.get(name);
      if (control) {
        control.clearValidators();
        control.setValue(null, { emitEvent: false });
        control.updateValueAndValidity({ emitEvent: false });
      }
    });
    Object.entries(groups[strategy]).forEach(
      ([
        name,
        validators
      ]) => {
        const control = form.get(name)!;
        control.setValidators(validators);
        control.updateValueAndValidity({ emitEvent: false });
      }
    );
    const discount = form.get('discount')!;
    discount.setValidators(
      strategy === WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY.TPV ? [Validators.min(0)] : [
            Validators.required,
            greaterThanZeroValidator()
          ]
    );
    discount.updateValueAndValidity({ emitEvent: false });
  }

  createLoanProductTermsForm() {
    if (this.loanProductService.isLoanProduct) {
      this.loanProductTermsForm = this.formBuilder.group({
        useBorrowerCycle: [false],
        minPrincipal: [
          '',
          [
            Validators.min(1)
          ]
        ],
        principal: [
          '',
          [
            Validators.required,
            Validators.min(1)
          ]
        ],
        maxPrincipal: [
          '',
          [
            Validators.min(1)
          ]
        ],
        minNumberOfRepayments: [
          '',
          [
            Validators.pattern('^[1-9]\\d*$')
          ]
        ],
        numberOfRepayments: [
          '',
          [
            Validators.required,
            Validators.pattern('^[1-9]\\d*$')
          ]
        ],
        maxNumberOfRepayments: [
          '',
          [
            Validators.pattern('^[1-9]\\d*$')
          ]
        ],
        isLinkedToFloatingInterestRates: [false],
        allowApprovedDisbursedAmountsOverApplied: [false],
        overAppliedCalculationType: [{ value: null, disabled: true }],
        overAppliedNumber: [{ value: null, disabled: true }],
        minInterestRatePerPeriod: [
          '',
          [
            Validators.min(0),
            Validators.pattern(/^\d+([.,]\d{1,6})?$/)
          ]
        ],
        interestRatePerPeriod: [
          '',
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^\d+([.,]\d{1,6})?$/)
          ]
        ],
        maxInterestRatePerPeriod: [
          '',
          [
            Validators.min(0),
            Validators.pattern(/^\d+([.,]\d{1,6})?$/)
          ]
        ],
        interestRateFrequencyType: [
          '',
          Validators.required
        ],
        repaymentEvery: [
          '',
          [
            Validators.required,
            Validators.min(1)
          ]
        ],
        repaymentFrequencyType: [
          '',
          Validators.required
        ],
        minimumDaysBetweenDisbursalAndFirstRepayment: [
          '',
          []
        ],
        repaymentStartDateType: [1],
        fixedLength: [null],
        interestRecognitionOnDisbursementDate: [false]
      });
    } else if (this.loanProductService.isWorkingCapital) {
      this.loanProductTermsForm = this.formBuilder.group({
        minPrincipal: [
          '',
          [
            Validators.min(1)
          ]
        ],
        principal: [
          '',
          [
            Validators.required,
            Validators.min(1)
          ]
        ],
        maxPrincipal: [
          '',
          [
            Validators.min(1)
          ]
        ],
        minPeriodPaymentRate: [
          '',
          [
            Validators.min(0)
          ]
        ],
        periodPaymentRate: [
          '',
          [
            Validators.required,
            Validators.min(0)
          ]
        ],
        maxPeriodPaymentRate: [
          '',
          [
            Validators.min(0)
          ]
        ],
        paymentAmountCalculationStrategy: [
          WC_PAYMENT_AMOUNT_CALCULATION_STRATEGY.TPV,
          Validators.required
        ],
        minAnnualEir: [null],
        annualEir: [null],
        maxAnnualEir: [null],
        minPaymentAmount: [null],
        paymentAmount: [null],
        maxPaymentAmount: [null],
        repaymentEvery: [
          '',
          [
            Validators.required,
            Validators.min(1)
          ]
        ],
        repaymentFrequencyType: [
          '',
          Validators.required
        ],
        discount: [
          '',
          [
            Validators.min(0)
          ]
        ]
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.loanProductService.isLoanProduct) {
      this.validateAdvancedPaymentStrategyControls();
    }
  }

  setConditionalControls() {
    if (this.loanProductService.isWorkingCapital) {
      this.setWorkingCapitalConditionalControls();
    }
    if (this.loanProductService.isLoanProduct) {
      this.loanProductTermsForm
        .get('allowApprovedDisbursedAmountsOverApplied')!
        .valueChanges.subscribe((allowApprovedDisbursedAmountsOverApplied) => {
          if (allowApprovedDisbursedAmountsOverApplied) {
            this.loanProductTermsForm.get('overAppliedCalculationType')!.enable();
            this.loanProductTermsForm.get('overAppliedNumber')!.enable();
            if (this.loanProductService.isLoanProduct) {
              this.loanProductTermsForm.addControl('disallowExpectedDisbursements', new UntypedFormControl(true));
            }
          } else {
            this.loanProductTermsForm.get('overAppliedCalculationType')!.disable();
            this.loanProductTermsForm.get('overAppliedCalculationType')!.patchValue(null);
            this.loanProductTermsForm.get('overAppliedNumber')!.disable();
            this.loanProductTermsForm.get('overAppliedNumber')!.patchValue(null);
            if (this.loanProductService.isLoanProduct) {
              this.loanProductTermsForm.removeControl('disallowExpectedDisbursements');
            }
          }
        });

      this.loanProductTermsForm
        .get('isLinkedToFloatingInterestRates')!
        .valueChanges.subscribe((isLinkedToFloatingInterestRates) => {
          if (isLinkedToFloatingInterestRates) {
            this.loanProductTermsForm.removeControl('minInterestRatePerPeriod');
            this.loanProductTermsForm.removeControl('interestRatePerPeriod');
            this.loanProductTermsForm.removeControl('maxInterestRatePerPeriod');
            this.loanProductTermsForm.removeControl('interestRateFrequencyType');
            this.loanProductTermsForm.addControl('floatingRatesId', new UntypedFormControl('', Validators.required));
            this.loanProductTermsForm.addControl(
              'interestRateDifferential',
              new UntypedFormControl('', Validators.required)
            );
            this.loanProductTermsForm.addControl(
              'isFloatingInterestRateCalculationAllowed',
              new UntypedFormControl(false)
            );
            this.loanProductTermsForm.addControl(
              'minDifferentialLendingRate',
              new UntypedFormControl('', Validators.required)
            );
            this.loanProductTermsForm.addControl(
              'defaultDifferentialLendingRate',
              new UntypedFormControl('', Validators.required)
            );
            this.loanProductTermsForm.addControl(
              'maxDifferentialLendingRate',
              new UntypedFormControl('', Validators.required)
            );
          } else {
            this.loanProductTermsForm.addControl(
              'minInterestRatePerPeriod',
              new UntypedFormControl('', [
                Validators.min(0),
                Validators.pattern(/^\d+([.,]\d{1,6})?$/)
              ])
            );
            this.loanProductTermsForm.addControl(
              'interestRatePerPeriod',
              new UntypedFormControl('', [
                Validators.required,
                Validators.min(0),
                Validators.pattern(/^\d+([.,]\d{1,6})?$/)
              ])
            );
            this.loanProductTermsForm.addControl(
              'maxInterestRatePerPeriod',
              new UntypedFormControl('', [
                Validators.min(0),
                Validators.pattern(/^\d+([.,]\d{1,6})?$/)
              ])
            );
            this.loanProductTermsForm.addControl(
              'interestRateFrequencyType',
              new UntypedFormControl(
                this.loanProductsTemplate.interestRateFrequencyType?.id ?? +this.interestRateFrequencyTypeData[0]?.id,
                Validators.required
              )
            );
            this.loanProductTermsForm.removeControl('floatingRatesId');
            this.loanProductTermsForm.removeControl('interestRateDifferential');
            this.loanProductTermsForm.removeControl('isFloatingInterestRateCalculationAllowed');
            this.loanProductTermsForm.removeControl('minDifferentialLendingRate');
            this.loanProductTermsForm.removeControl('defaultDifferentialLendingRate');
            this.loanProductTermsForm.removeControl('maxDifferentialLendingRate');
          }
        });

      this.loanProductTermsForm.get('useBorrowerCycle')!.valueChanges.subscribe((useBorrowerCycle) => {
        if (useBorrowerCycle) {
          this.loanProductTermsForm.addControl('principalVariationsForBorrowerCycle', this.formBuilder.array([]));
          this.loanProductTermsForm.addControl(
            'numberOfRepaymentVariationsForBorrowerCycle',
            this.formBuilder.array([])
          );
          this.loanProductTermsForm.addControl('interestRateVariationsForBorrowerCycle', this.formBuilder.array([]));
        } else {
          this.loanProductTermsForm.removeControl('principalVariationsForBorrowerCycle');
          this.loanProductTermsForm.removeControl('numberOfRepaymentVariationsForBorrowerCycle');
          this.loanProductTermsForm.removeControl('interestRateVariationsForBorrowerCycle');
        }
      });

      this.zeroInterest.valueChanges.subscribe((zeroInterest) => {
        if (zeroInterest) {
          this.loanProductTermsForm.get('minInterestRatePerPeriod')!.patchValue(0);
          this.loanProductTermsForm.get('minInterestRatePerPeriod')!.disable();
          this.loanProductTermsForm.get('interestRatePerPeriod')!.patchValue(0);
          this.loanProductTermsForm.get('interestRatePerPeriod')!.disable();
          this.loanProductTermsForm.get('maxInterestRatePerPeriod')!.patchValue(0);
          this.loanProductTermsForm.get('maxInterestRatePerPeriod')!.disable();
        } else {
          const interestRateValues = this.getInterestRateValues();
          this.loanProductTermsForm.get('minInterestRatePerPeriod')!.patchValue(interestRateValues.min);
          this.loanProductTermsForm.get('minInterestRatePerPeriod')!.enable();
          this.loanProductTermsForm.get('interestRatePerPeriod')!.patchValue(interestRateValues.default);
          this.loanProductTermsForm.get('interestRatePerPeriod')!.enable();
          this.loanProductTermsForm.get('maxInterestRatePerPeriod')!.patchValue(interestRateValues.max);
          this.loanProductTermsForm.get('maxInterestRatePerPeriod')!.enable();
        }
        this.validateAdvancedPaymentStrategyControls();
      });
    }
  }

  /** Working Capital: re-shape the pricing inputs whenever the strategy or a bound changes. */
  private setWorkingCapitalConditionalControls(): void {
    this.loanProductTermsForm
      .get('paymentAmountCalculationStrategy')!
      .valueChanges.subscribe((value: string) =>
        this.applyPaymentAmountCalculationStrategy(resolvePaymentAmountCalculationStrategy(value))
      );
    const revalidate = (target: string, ...bounds: string[]) =>
      bounds.forEach((name) =>
        this.loanProductTermsForm
          .get(name)!
          .valueChanges.subscribe(() =>
            this.loanProductTermsForm.get(target)!.updateValueAndValidity({ emitEvent: false })
          )
      );
    revalidate('periodPaymentRate', 'minPeriodPaymentRate', 'maxPeriodPaymentRate');
    revalidate('annualEir', 'minAnnualEir', 'maxAnnualEir');
    revalidate('paymentAmount', 'minPaymentAmount', 'maxPaymentAmount');
  }

  get principalVariationsForBorrowerCycle(): UntypedFormArray {
    return this.loanProductTermsForm.get('principalVariationsForBorrowerCycle')! as UntypedFormArray;
  }

  get numberOfRepaymentVariationsForBorrowerCycle(): UntypedFormArray {
    return this.loanProductTermsForm.get('numberOfRepaymentVariationsForBorrowerCycle')! as UntypedFormArray;
  }

  get interestRateVariationsForBorrowerCycle(): UntypedFormArray {
    return this.loanProductTermsForm.get('interestRateVariationsForBorrowerCycle')! as UntypedFormArray;
  }

  setLoanProductTermsFormDirty() {
    if (this.loanProductTermsForm.pristine) {
      this.loanProductTermsForm.markAsDirty();
    }
  }

  addVariationsForBorrowerCycle(formType: string, variationsForBorrowerCycleFormArray: UntypedFormArray) {
    const data = this.getData(formType);
    const addVariationsForBorrowerCycleDialogRef = this.dialog.open(FormDialogComponent, { data });
    addVariationsForBorrowerCycleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        variationsForBorrowerCycleFormArray.push(response.data);
        this.setLoanProductTermsFormDirty();
      }
    });
  }

  editVariationsForBorrowerCycle(
    formType: string,
    variationsForBorrowerCycleFormArray: UntypedFormArray,
    index: number
  ) {
    const data = {
      ...this.getData(formType, variationsForBorrowerCycleFormArray.at(index).value),
      layout: { addButtonText: 'Edit' }
    };
    const addVariationsForBorrowerCycleDialogRef = this.dialog.open(FormDialogComponent, { data });
    addVariationsForBorrowerCycleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        variationsForBorrowerCycleFormArray.at(index).patchValue(response.data.value);
        this.setLoanProductTermsFormDirty();
      }
    });
  }

  deleteVariationsForBorrowerCycle(variationsForBorrowerCycleFormArray: UntypedFormArray, index: number) {
    const deleteVariationsForBorrowerCycleDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    deleteVariationsForBorrowerCycleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        variationsForBorrowerCycleFormArray.removeAt(index);
        this.setLoanProductTermsFormDirty();
      }
    });
  }

  getData(formType: string, values?: any) {
    switch (formType) {
      case 'Principal':
        return {
          title: this.translateService.instant('labels.heading.Principal by loan cycle'),
          formfields: this.getFormfields(values)
        };
      case 'NumberOfRepayments':
        return {
          title: this.translateService.instant('labels.heading.Number of Repayments by loan cycle'),
          formfields: this.getFormfields(values)
        };
      case 'NominalInterestRate':
        return {
          title: this.translateService.instant('labels.inputs.Annual interest rate by loan cycle'),
          formfields: this.getFormfields(values)
        };
    }
  }

  getFormfields(values?: any) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'valueConditionType',
        label: this.translateService.instant('labels.inputs.Condition'),
        value: values ? values.valueConditionType : this.valueConditionTypeData[0].id,
        options: { label: 'value', value: 'id', data: this.valueConditionTypeData },
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'borrowerCycleNumber',
        label: this.translateService.instant('labels.inputs.Loan Cycle'),
        value: values ? values.borrowerCycleNumber : undefined,
        type: 'number',
        required: true,
        min: 0,
        order: 2
      }),
      new InputBase({
        controlName: 'minValue',
        label: this.translateService.instant('labels.inputs.Minimum'),
        value: values ? values.minValue : undefined,
        type: 'number',
        min: 0,
        order: 3
      }),
      new InputBase({
        controlName: 'defaultValue',
        label: this.translateService.instant('labels.inputs.Default'),
        value: values ? values.defaultValue : undefined,
        type: 'number',
        required: true,
        min: 0,
        order: 4
      }),
      new InputBase({
        controlName: 'maxValue',
        label: this.translateService.instant('labels.inputs.Maximum'),
        value: values ? values.maxValue : undefined,
        type: 'number',
        min: 0,
        order: 5
      })
    ];
    return formfields;
  }

  get loanProductTerms() {
    const formValue = this.loanProductTermsForm.getRawValue();
    // Normalize decimal separators: convert comma to dot for backend compatibility
    const normalizeDecimal = (value: any) => {
      if (typeof value === 'string' && value.includes(',')) {
        return value.replace(',', '.');
      }
      return value;
    };

    if (this.loanProductService.isWorkingCapital) {
      // Only the active strategy's inputs may travel: the backend rejects the others and, on
      // update, clears whatever belonged to the previous strategy by itself.
      const terms = {
        ...formValue,
        minAnnualEir: normalizeDecimal(formValue.minAnnualEir),
        annualEir: normalizeDecimal(formValue.annualEir),
        maxAnnualEir: normalizeDecimal(formValue.maxAnnualEir)
      };
      inactivePricingFields(this.paymentAmountCalculationStrategy).forEach((name) => delete terms[name]);
      return terms;
    }

    return {
      ...formValue,
      minInterestRatePerPeriod: normalizeDecimal(formValue.minInterestRatePerPeriod),
      interestRatePerPeriod: normalizeDecimal(formValue.interestRatePerPeriod),
      maxInterestRatePerPeriod: normalizeDecimal(formValue.maxInterestRatePerPeriod)
    };
  }

  isZeroInterest(): boolean {
    return this.zeroInterest.value;
  }

  allowFixedLength(): boolean {
    return this.isAdvancedTransactionProcessingStrategy && this.isZeroInterest();
  }

  private validateAdvancedPaymentStrategyControls(): void {
    if (this.allowFixedLength()) {
      this.loanProductTermsForm.get('fixedLength')!.patchValue(this.loanProductsTemplate.fixedLength || null);
    } else {
      this.loanProductTermsForm.get('fixedLength')!.patchValue(null);
    }
  }

  private getInterestRateValues(): { min: any; default: any; max: any } {
    if (this.isZeroInterestTemplate()) {
      return {
        min: '',
        default: '',
        max: ''
      };
    }

    return {
      min: this.loanProductsTemplate.minInterestRatePerPeriod,
      default: this.loanProductsTemplate.interestRatePerPeriod,
      max: this.loanProductsTemplate.maxInterestRatePerPeriod
    };
  }

  private isZeroInterestTemplate(): boolean {
    return (
      this.loanProductsTemplate.minInterestRatePerPeriod === 0 &&
      this.loanProductsTemplate.interestRatePerPeriod === 0 &&
      this.loanProductsTemplate.maxInterestRatePerPeriod === 0
    );
  }
}
