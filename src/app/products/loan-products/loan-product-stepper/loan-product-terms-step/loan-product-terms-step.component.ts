import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormArray,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
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
import { MatButton, MatIconButton } from '@angular/material/button';
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
  ]
})
export class LoanProductTermsStepComponent implements OnInit, OnChanges {
  @Input() loanProductsTemplate: any;

  loanProductTermsForm: UntypedFormGroup;

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

  constructor(
    private formBuilder: UntypedFormBuilder,
    private processingStrategyService: ProcessingStrategyService,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.createLoanProductTermsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.valueConditionTypeData = this.loanProductsTemplate.valueConditionTypeOptions;
    this.floatingRateData = this.loanProductsTemplate.floatingRateOptions;
    this.interestRateFrequencyTypeData = this.loanProductsTemplate.interestRateFrequencyTypeOptions;
    this.repaymentFrequencyTypeData = this.loanProductsTemplate.repaymentFrequencyTypeOptions;
    this.repaymentStartDateTypeOptions = this.loanProductsTemplate.repaymentStartDateTypeOptions;
    this.overAppliedCalculationTypeData = [
      { id: 'percentage', value: 'Percentage' },
      { id: 'flat', value: 'Fixed Amount' }
    ];

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
      interestRateFrequencyType: this.loanProductsTemplate.interestRateFrequencyType.id,
      floatingRatesId: this.loanProductsTemplate.floatingRateId,
      interestRateDifferential: this.loanProductsTemplate.interestRateDifferential,
      isFloatingInterestRateCalculationAllowed: this.loanProductsTemplate.isFloatingInterestRateCalculationAllowed,
      allowApprovedDisbursedAmountsOverApplied: this.loanProductsTemplate.allowApprovedDisbursedAmountsOverApplied,
      minDifferentialLendingRate: this.loanProductsTemplate.minDifferentialLendingRate,
      defaultDifferentialLendingRate: this.loanProductsTemplate.defaultDifferentialLendingRate,
      maxDifferentialLendingRate: this.loanProductsTemplate.maxDifferentialLendingRate,
      useBorrowerCycle: this.loanProductsTemplate.useBorrowerCycle,
      repaymentEvery: this.loanProductsTemplate.repaymentEvery,
      repaymentFrequencyType: this.loanProductsTemplate.repaymentFrequencyType.id,
      minimumDaysBetweenDisbursalAndFirstRepayment:
        this.loanProductsTemplate.minimumDaysBetweenDisbursalAndFirstRepayment,
      repaymentStartDateType: this.loanProductsTemplate.repaymentStartDateType.id || 1,
      interestRecognitionOnDisbursementDate: this.loanProductsTemplate.interestRecognitionOnDisbursementDate || false
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

  createLoanProductTermsForm() {
    this.loanProductTermsForm = this.formBuilder.group({
      useBorrowerCycle: [false],
      minPrincipal: [''],
      principal: [
        '',
        Validators.required
      ],
      maxPrincipal: [''],
      minNumberOfRepayments: [''],
      numberOfRepayments: [
        '',
        Validators.required
      ],
      maxNumberOfRepayments: [''],
      isLinkedToFloatingInterestRates: [false],
      allowApprovedDisbursedAmountsOverApplied: [false],
      overAppliedCalculationType: [{ value: null, disabled: true }],
      overAppliedNumber: [{ value: null, disabled: true }],
      minInterestRatePerPeriod: [''],
      interestRatePerPeriod: [
        '',
        Validators.required
      ],
      maxInterestRatePerPeriod: [''],
      interestRateFrequencyType: [
        '',
        Validators.required
      ],
      repaymentEvery: [
        '',
        Validators.required
      ],
      repaymentFrequencyType: [
        '',
        Validators.required
      ],
      minimumDaysBetweenDisbursalAndFirstRepayment: [''],
      repaymentStartDateType: [1],
      fixedLength: [null],
      interestRecognitionOnDisbursementDate: [false]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.validateAdvancedPaymentStrategyControls();
  }

  setConditionalControls() {
    this.loanProductTermsForm
      .get('allowApprovedDisbursedAmountsOverApplied')
      .valueChanges.subscribe((allowApprovedDisbursedAmountsOverApplied) => {
        if (allowApprovedDisbursedAmountsOverApplied) {
          this.loanProductTermsForm.get('overAppliedCalculationType').enable();
          this.loanProductTermsForm.get('overAppliedNumber').enable();
          this.loanProductTermsForm.addControl('disallowExpectedDisbursements', new UntypedFormControl('true'));
        } else {
          this.loanProductTermsForm.get('overAppliedCalculationType').disable();
          this.loanProductTermsForm.get('overAppliedCalculationType').patchValue(null);
          this.loanProductTermsForm.get('overAppliedNumber').disable();
          this.loanProductTermsForm.get('overAppliedNumber').patchValue(null);
          this.loanProductTermsForm.removeControl('disallowExpectedDisbursements');
        }
      });

    this.loanProductTermsForm
      .get('isLinkedToFloatingInterestRates')
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
          this.loanProductTermsForm.addControl('minInterestRatePerPeriod', new UntypedFormControl(''));
          this.loanProductTermsForm.addControl(
            'interestRatePerPeriod',
            new UntypedFormControl('', Validators.required)
          );
          this.loanProductTermsForm.addControl('maxInterestRatePerPeriod', new UntypedFormControl(''));
          this.loanProductTermsForm.addControl(
            'interestRateFrequencyType',
            new UntypedFormControl(this.interestRateFrequencyTypeData.id, Validators.required)
          );
          this.loanProductTermsForm.removeControl('floatingRatesId');
          this.loanProductTermsForm.removeControl('interestRateDifferential');
          this.loanProductTermsForm.removeControl('isFloatingInterestRateCalculationAllowed');
          this.loanProductTermsForm.removeControl('minDifferentialLendingRate');
          this.loanProductTermsForm.removeControl('defaultDifferentialLendingRate');
          this.loanProductTermsForm.removeControl('maxDifferentialLendingRate');
        }
      });

    this.loanProductTermsForm.get('useBorrowerCycle').valueChanges.subscribe((useBorrowerCycle) => {
      if (useBorrowerCycle) {
        this.loanProductTermsForm.addControl('principalVariationsForBorrowerCycle', this.formBuilder.array([]));
        this.loanProductTermsForm.addControl('numberOfRepaymentVariationsForBorrowerCycle', this.formBuilder.array([]));
        this.loanProductTermsForm.addControl('interestRateVariationsForBorrowerCycle', this.formBuilder.array([]));
      } else {
        this.loanProductTermsForm.removeControl('principalVariationsForBorrowerCycle');
        this.loanProductTermsForm.removeControl('numberOfRepaymentVariationsForBorrowerCycle');
        this.loanProductTermsForm.removeControl('interestRateVariationsForBorrowerCycle');
      }
    });

    this.zeroInterest.valueChanges.subscribe((zeroInterest) => {
      if (zeroInterest) {
        this.loanProductTermsForm.get('minInterestRatePerPeriod').patchValue(0);
        this.loanProductTermsForm.get('minInterestRatePerPeriod').disable();
        this.loanProductTermsForm.get('interestRatePerPeriod').patchValue(0);
        this.loanProductTermsForm.get('interestRatePerPeriod').disable();
        this.loanProductTermsForm.get('maxInterestRatePerPeriod').patchValue(0);
        this.loanProductTermsForm.get('maxInterestRatePerPeriod').disable();
      } else {
        this.loanProductTermsForm
          .get('minInterestRatePerPeriod')
          .patchValue(this.loanProductsTemplate.minInterestRatePerPeriod);
        this.loanProductTermsForm.get('minInterestRatePerPeriod').enable();
        this.loanProductTermsForm
          .get('interestRatePerPeriod')
          .patchValue(this.loanProductsTemplate.interestRatePerPeriod);
        this.loanProductTermsForm.get('interestRatePerPeriod').enable();
        this.loanProductTermsForm
          .get('maxInterestRatePerPeriod')
          .patchValue(this.loanProductsTemplate.maxInterestRatePerPeriod);
        this.loanProductTermsForm.get('maxInterestRatePerPeriod').enable();
      }
      this.validateAdvancedPaymentStrategyControls();
    });
  }

  get principalVariationsForBorrowerCycle(): UntypedFormArray {
    return this.loanProductTermsForm.get('principalVariationsForBorrowerCycle') as UntypedFormArray;
  }

  get numberOfRepaymentVariationsForBorrowerCycle(): UntypedFormArray {
    return this.loanProductTermsForm.get('numberOfRepaymentVariationsForBorrowerCycle') as UntypedFormArray;
  }

  get interestRateVariationsForBorrowerCycle(): UntypedFormArray {
    return this.loanProductTermsForm.get('interestRateVariationsForBorrowerCycle') as UntypedFormArray;
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
          title: this.translateService.instant('labels.heading.Nominal Interest Rate by loan cycle'),
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
        order: 2
      }),
      new InputBase({
        controlName: 'minValue',
        label: this.translateService.instant('labels.inputs.Minimum'),
        value: values ? values.minValue : undefined,
        type: 'number',
        order: 3
      }),
      new InputBase({
        controlName: 'defaultValue',
        label: this.translateService.instant('labels.inputs.Default'),
        value: values ? values.defaultValue : undefined,
        type: 'number',
        required: true,
        order: 4
      }),
      new InputBase({
        controlName: 'maxValue',
        label: this.translateService.instant('labels.inputs.Maximum'),
        value: values ? values.maxValue : undefined,
        type: 'number',
        order: 5
      })

    ];
    return formfields;
  }

  get loanProductTerms() {
    return this.loanProductTermsForm.getRawValue();
  }

  isZeroInterest(): boolean {
    return this.zeroInterest.value;
  }

  allowFixedLength(): boolean {
    return this.isAdvancedTransactionProcessingStrategy && this.isZeroInterest();
  }

  private validateAdvancedPaymentStrategyControls(): void {
    if (this.allowFixedLength()) {
      this.loanProductTermsForm.get('fixedLength').patchValue(this.loanProductsTemplate.fixedLength || null);
    } else {
      this.loanProductTermsForm.get('fixedLength').patchValue(null);
    }
  }
}
