/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { LoansAccountAddCollateralDialogComponent } from 'app/loans/custom-dialog/loans-account-add-collateral-dialog/loans-account-add-collateral-dialog.component';
import { LoanProducts } from 'app/products/loan-products/loan-products';
import { Breach, LoanProduct, NearBreach } from 'app/products/loan-products/models/loan-product.model';
import { SettingsService } from 'app/settings/settings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { Currency } from 'app/shared/models/general.model';
import { CodeName, OptionData, StringEnumOptionData } from 'app/shared/models/option-data.model';
import { InputAmountComponent } from '../../../shared/input-amount/input-amount.component';
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
import { FindPipe } from '../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { amountValueValidator } from 'app/shared/validators/amount-value.validator';
import { BreachDisplayComponent } from 'app/shared/loan/breach-display/breach-display.component';

interface DisbursementData {
  id?: number;
  principal: number;
  expectedDisbursementDate: string | Date;
}

/**
 * Create Loans Account Terms Step
 */
@Component({
  selector: 'mifosx-loans-account-terms-step',
  templateUrl: './loans-account-terms-step.component.html',
  styleUrls: ['./loans-account-terms-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    MatTooltip,
    MatCheckbox,
    MatDivider,
    MatIconButton,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatStepperPrevious,
    MatStepperNext,
    FindPipe,
    DateFormatPipe,
    YesnoPipe,
    BreachDisplayComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansAccountTermsStepComponent extends LoanProductBaseComponent implements OnInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);
  private formBuilder = inject(UntypedFormBuilder);
  private settingsService = inject(SettingsService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);

  /** Loans Product Options */
  @Input() loansProductOptions: any;
  /** Loans Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
  loansAccountTermsData: any;

  /** Is Multi Disburse Loan  */
  multiDisburseLoan: any;
  // @Input() loansAccountFormValid: LoansAccountFormValid
  @Input() loansAccountFormValid: boolean = false;
  // @Input collateralOptions: Collateral Options
  @Input() collateralOptions: any;
  // @Input loanPrincipal: Loan Principle
  @Input() loanPrincipal: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Loans Account Terms Form */
  loansAccountTermsForm: UntypedFormGroup = new UntypedFormGroup({});
  /** Term Frequency Type Data */
  termFrequencyTypeData: any;
  /** Repayment Frequency Nth Day Type Data */
  repaymentFrequencyNthDayTypeData: any;
  /** Repayment Frequency Days of Week Type Data */
  repaymentFrequencyDaysOfWeekTypeData: any;
  /** Interest Type Data */
  interestTypeData: any;
  /** Amortization Type Data */
  amortizationTypeData: any;
  /** Interest Calculation Period Type Data */
  interestCalculationPeriodTypeData: any;
  /** Client Active Loan Data */
  clientActiveLoanData: any;
  /** Multi Disbursement Data */
  disbursementDataSource: DisbursementData[] = [];
  /** Loan repayment strategies */
  transactionProcessingStrategyOptions: any = [];
  repaymentStrategyDisabled = false;
  /** Check if value of collateral added  is more than principal amount */
  isCollateralSufficient = false;
  /** Total value of all collateral added to a loan */
  totalCollateralValue: any = 0;
  /** Collateral Data Source */
  collateralDataSource: {}[] = [];
  /** Columns to be displayed in collateral table. */
  loanCollateralDisplayedColumns: string[] = [
    'type',
    'value',
    'totalValue',
    'totalCollateralValue',
    'action'
  ];
  /** Disbursement Data Displayed Columns */
  disbursementDisplayedColumns: string[] = [
    'expectedDisbursementDate',
    'principal',
    'actions'
  ];
  /** Multi Disbursement Control */
  totalMultiDisbursed: any = 0;
  isMultiDisbursedCompleted = false;

  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;

  loanId: any = null;
  loanScheduleType: OptionData | null = null;
  loanProduct: LoanProduct | null = null;
  interestRateFrequencyTypeData: any[] = [];
  currency: Currency | null = null;

  productEnableDownPayment = false;
  enableIncomeCapitalization = false;
  enableBuyDownFee = false;
  isProgressive = false;

  allowAttributeOverrides: any | null = null;

  delinquencyStartTypeOptions: StringEnumOptionData[] = [];
  breachOptions: Breach[] = [];
  nearBreachOptions: NearBreach[] = [];
  allowAttributeOverridesBreach: boolean = true;

  constructor() {
    super();
    this.createloansAccountTermsForm();
    this.loanId = this.route.snapshot.params['loanId'];
  }
  /**
   * Executes on change of input values
   */
  ngOnChanges(changes: SimpleChanges) {
    if (this.loanProductService.isLoanProduct) {
      if (this.loansAccountProductTemplate) {
        this.currency = this.loansAccountProductTemplate.currency;

        this.loansAccountTermsData = this.loansAccountProductTemplate;
        if (this.loanId != null && this.loansAccountTemplate?.accountNo) {
          this.loansAccountTermsData = this.loansAccountTemplate;
        }
        this.productEnableDownPayment = this.loansAccountTermsData.product.enableDownPayment;
        this.enableIncomeCapitalization = this.loansAccountTermsData.product.enableIncomeCapitalization;
        this.enableBuyDownFee = this.loansAccountTermsData.product.enableBuyDownFee;
        this.isProgressive =
          this.loansAccountTermsData.loanScheduleType.code == LoanProducts.LOAN_SCHEDULE_TYPE_PROGRESSIVE;
        if (this.loansAccountTermsData.product) {
          this.loanProduct = this.loansAccountTermsData.product;
        }

        this.interestRateFrequencyTypeData = this.loansAccountTermsData.interestRateFrequencyTypeOptions;

        this.loansAccountTermsForm.patchValue({
          principalAmount: this.loansAccountTermsData.principal,
          loanTermFrequency: this.loansAccountTermsData.termFrequency,
          loanTermFrequencyType: this.loansAccountTermsData.termPeriodFrequencyType.id,
          numberOfRepayments: this.loansAccountTermsData.numberOfRepayments,
          repaymentEvery: this.loansAccountTermsData.repaymentEvery,
          repaymentFrequencyType: this.loansAccountTermsData.repaymentFrequencyType.id,
          amortizationType: this.loansAccountTermsData.amortizationType.id,
          isEqualAmortization: this.loansAccountTermsData.isEqualAmortization,
          interestType: this.loansAccountTermsData.interestType.id,
          isFloatingInterestRate: this.loansAccountTermsData.isLoanProductLinkedToFloatingRate ? false : null,
          interestCalculationPeriodType: this.loansAccountTermsData.interestCalculationPeriodType.id,
          allowPartialPeriodInterestCalculation: this.loansAccountTermsData.allowPartialPeriodInterestCalculation,
          inArrearsTolerance: this.loansAccountTermsData.inArrearsTolerance,
          graceOnPrincipalPayment: this.loansAccountTermsData.graceOnPrincipalPayment,
          graceOnInterestPayment: this.loansAccountTermsData.graceOnInterestPayment,
          graceOnArrearsAgeing: this.loansAccountTermsData.graceOnArrearsAgeing,
          graceOnInterestCharged: this.loansAccountTermsData.graceOnInterestCharged,
          fixedEmiAmount: this.loansAccountTermsData.fixedEmiAmount,
          maxOutstandingLoanBalance: this.loansAccountTermsData.maxOutstandingLoanBalance,
          transactionProcessingStrategyCode: this.loansAccountTermsData.transactionProcessingStrategyCode,
          interestRateDifferential: this.loansAccountTermsData.interestRateDifferential,
          multiDisburseLoan: this.loansAccountTermsData.multiDisburseLoan,
          interestRateFrequencyType: this.loansAccountTermsData.interestRateFrequencyType.id,
          balloonRepaymentAmount: this.loansAccountTermsData.balloonRepaymentAmount,
          interestRecognitionOnDisbursementDate:
            this.loansAccountTermsData.interestRecognitionOnDisbursementDate || false
        });

        this.setAdvancedPaymentStrategyControls();

        if (this.loansAccountTermsData.loanScheduleType.code == LoanProducts.LOAN_SCHEDULE_TYPE_CUMULATIVE) {
          this.loansAccountTermsForm.removeControl('interestRecognitionOnDisbursementDate');
        }

        if (this.loansAccountTermsData.isLoanProductLinkedToFloatingRate) {
          this.loansAccountTermsForm.removeControl('interestRatePerPeriod');
        }

        this.multiDisburseLoan = this.loansAccountTermsData.multiDisburseLoan;
        if (this.loansAccountTermsData.disbursementDetails) {
          this.disbursementDataSource = this.loansAccountTermsData.disbursementDetails;
          this.totalMultiDisbursed = 0;
          this.disbursementDataSource.forEach((item: any) => {
            this.totalMultiDisbursed += item.principal;
          });
        }
        if (this.isDelinquencyEnabled()) {
          this.loansAccountTermsForm.addControl(
            'enableInstallmentLevelDelinquency',
            new UntypedFormControl(
              this.loansAccountTermsData.enableInstallmentLevelDelinquency ||
                this.loanProduct?.enableInstallmentLevelDelinquency
            )
          );
        }
        this.collateralDataSource = this.loansAccountTermsData.collateral || [];
        if (this.productEnableDownPayment) {
          const enableDownPayment = this.loansAccountTermsData['enableDownPayment'] === false ? false : true;
          this.loansAccountTermsForm.addControl('enableDownPayment', new UntypedFormControl(enableDownPayment));
        }

        if (this.isFullTermTrancheEditable()) {
          const allowFullTermForTranche =
            this.loansAccountTermsData.allowFullTermForTranche ?? this.loanProduct?.allowFullTermForTranche ?? false;
          this.loansAccountTermsForm.patchValue({ allowFullTermForTranche });
        }

        const allowAttributeOverrides = this.loansAccountTermsData.product.allowAttributeOverrides;
        if (!allowAttributeOverrides.repaymentEvery) {
          this.loansAccountTermsForm.controls.repaymentEvery.disable();
          this.loansAccountTermsForm.controls.repaymentFrequencyType.disable();
        }
        if (!allowAttributeOverrides.interestType) {
          this.loansAccountTermsForm.controls.interestType.disable();
        }
        if (!allowAttributeOverrides.amortizationType) {
          this.loansAccountTermsForm.controls.amortizationType.disable();
        }
        if (!allowAttributeOverrides.interestCalculationPeriodType) {
          this.loansAccountTermsForm.controls.interestCalculationPeriodType.disable();
          this.loansAccountTermsForm.controls.allowPartialPeriodInterestCalculation.disable();
        }
        if (!allowAttributeOverrides.inArrearsTolerance) {
          this.loansAccountTermsForm.controls.inArrearsTolerance.disable();
        }
        if (!allowAttributeOverrides.transactionProcessingStrategyCode) {
          this.loansAccountTermsForm.controls.transactionProcessingStrategyCode.disable();
        }
        if (!allowAttributeOverrides.graceOnPrincipalAndInterestPayment) {
          this.loansAccountTermsForm.controls.graceOnPrincipalPayment.disable();
        }
        if (!allowAttributeOverrides.graceOnPrincipalAndInterestPayment) {
          this.loansAccountTermsForm.controls.graceOnInterestPayment.disable();
        }
        if (!allowAttributeOverrides.graceOnArrearsAgeing) {
          this.loansAccountTermsForm.controls.graceOnArrearsAgeing.disable();
        }
        this.setOptions();

        this.loansAccountTermsForm.removeControl('maxOutstandingLoanBalance');
        if (this.allowAddDisbursementDetails()) {
          this.loansAccountTermsForm.addControl(
            'maxOutstandingLoanBalance',
            new UntypedFormControl(this.loansAccountTermsData?.maxOutstandingLoanBalance ?? null, [
              Validators.required,
              Validators.min(0)
            ])
          );
        } else {
          this.loansAccountTermsForm.addControl(
            'maxOutstandingLoanBalance',
            new UntypedFormControl(this.loansAccountTermsData?.maxOutstandingLoanBalance ?? null, [Validators.min(0)])
          );
        }
      }
    } else if (this.loanProductService.isWorkingCapital && this.loansAccountProductTemplate) {
      this.loansAccountTermsData = this.loansAccountProductTemplate;
      this.currency = this.loansAccountTermsData.currency;
      this.termFrequencyTypeData = this.loansAccountTermsData.options?.periodFrequencyTypeOptions;
      this.delinquencyStartTypeOptions = this.loansAccountTermsData.options?.delinquencyStartTypeOptions;
      this.breachOptions = this.loansAccountTermsData.options?.breachOptions ?? [];
      this.nearBreachOptions = this.loansAccountTermsData.options?.nearBreachOptions ?? [];
      const templateChange = changes['loansAccountProductTemplate'];
      const productChanged =
        !!templateChange &&
        (templateChange.isFirstChange() ||
          templateChange.previousValue?.product?.id !== templateChange.currentValue?.product?.id);
      // Edit Loan
      if (this.loanId != null && 'accountNo' in this.loansAccountTemplate) {
        this.loansAccountTermsData = this.loansAccountTemplate;
        this.loansAccountTermsForm.patchValue({
          discount: this.loansAccountTermsData.discountProposed || this.loansAccountTermsData.discount || '',
          principalAmount: this.loansAccountTermsData.proposedPrincipal,
          periodPaymentRate: this.loansAccountTermsData.periodPaymentRate,
          totalPaymentVolume: this.loansAccountTermsData.totalPaymentVolume,
          repaymentEvery: this.loansAccountTermsData.repaymentEvery,
          repaymentFrequencyType: this.loansAccountTermsData.repaymentFrequencyType?.id,
          delinquencyGraceDays: this.loansAccountTermsData.delinquencyGraceDays,
          delinquencyStartType: this.loansAccountTermsData.delinquencyStartType?.code,
          breachId: this.loansAccountTermsData.breach?.id,
          nearBreachId: this.loansAccountTermsData.nearBreach?.id
        });
        // New Loan — solo inicializar si el producto realmente cambió
      } else if (productChanged) {
        this.loansAccountTermsForm.patchValue({
          discount: this.loansAccountTermsData.product.discount || '',
          principalAmount: this.loansAccountTermsData.product.principal,
          delinquencyGraceDays: this.loansAccountTermsData.product.delinquencyGraceDays || '',
          delinquencyStartType: this.loansAccountTermsData.product.delinquencyStartType?.code || '',
          breachId: this.loansAccountTermsData.product.breach?.id || '',
          nearBreachId: this.loansAccountTermsData.product.nearBreach?.id || ''
        });
        this.cdr.markForCheck();
      }
      this.allowAttributeOverrides = this.loansAccountProductTemplate.product.allowAttributeOverrides;
      if (
        !this.allowAttributeOverrides.periodPaymentFrequency ||
        this.allowAttributeOverrides.periodPaymentFrequency === false
      ) {
        this.loansAccountTermsForm.controls.repaymentEvery.disable();
      }
      if (
        !this.allowAttributeOverrides.periodPaymentFrequencyType ||
        this.allowAttributeOverrides.periodPaymentFrequencyType === false
      ) {
        this.loansAccountTermsForm.controls.repaymentFrequencyType.disable();
      }
      if (!this.allowAttributeOverrides.discountDefault || this.allowAttributeOverrides.discountDefault === false) {
        this.loansAccountTermsForm.controls.discount.disable();
      }
      if (!this.allowAttributeOverrides.breach || this.allowAttributeOverrides.breach === false) {
        this.allowAttributeOverridesBreach = false;
        this.loansAccountTermsForm.controls.breachId.disable();
        this.loansAccountTermsForm.controls.nearBreachId.disable();
      }
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.loansAccountTermsData = this.loansAccountProductTemplate;
    if (this.loanProductService.isLoanProduct) {
      if (this.loanId != null && this.loansAccountTemplate.accountNo) {
        this.loansAccountTermsData = this.loansAccountTemplate;
      }

      if (this.loansAccountTermsData) {
        if (this.loansAccountTermsData.loanProductId) {
          let formattedDate = null;
          if (this.loansAccountTermsData.expectedFirstRepaymentOnDate) {
            const repaymentDate = new Date(this.loansAccountTermsData.expectedFirstRepaymentOnDate);
            formattedDate = this.formatDateToDDMMYYYY(repaymentDate);
          }
          this.loansAccountTermsForm.patchValue({
            repaymentsStartingFromDate: this.loansAccountTermsData.expectedFirstRepaymentOnDate && formattedDate
          });
        }
        if (this.isDelinquencyEnabled()) {
          this.loansAccountTermsForm.addControl(
            'enableInstallmentLevelDelinquency',
            new UntypedFormControl(
              this.loansAccountTermsData.enableInstallmentLevelDelinquency ||
                this.loanProduct?.enableInstallmentLevelDelinquency
            )
          );
        }
        this.loansAccountTermsForm.patchValue({
          principalAmount: this.loansAccountTermsData.principal,
          loanTermFrequency: this.loansAccountTermsData.termFrequency,
          loanTermFrequencyType: this.loansAccountTermsData.termPeriodFrequencyType.id,
          numberOfRepayments: this.loansAccountTermsData.numberOfRepayments,
          repaymentEvery: this.loansAccountTermsData.repaymentEvery,
          repaymentFrequencyType: this.loansAccountTermsData.repaymentFrequencyType.id,
          amortizationType: this.loansAccountTermsData.amortizationType.id,
          isEqualAmortization: this.loansAccountTermsData.isEqualAmortization,
          interestType: this.loansAccountTermsData.interestType.id,
          isFloatingInterestRate: this.loansAccountTermsData.isLoanProductLinkedToFloatingRate ? false : null,
          interestCalculationPeriodType: this.loansAccountTermsData.interestCalculationPeriodType.id,
          allowPartialPeriodInterestCalculation: this.loansAccountTermsData.allowPartialPeriodInterestCalculation,
          inArrearsTolerance: this.loansAccountTermsData.inArrearsTolerance,
          graceOnPrincipalPayment: this.loansAccountTermsData.graceOnPrincipalPayment,
          graceOnInterestPayment: this.loansAccountTermsData.graceOnInterestPayment,
          graceOnArrearsAgeing: this.loansAccountTermsData.graceOnArrearsAgeing,
          graceOnInterestCharged: this.loansAccountTermsData.graceOnInterestCharged,
          fixedEmiAmount: this.loansAccountTermsData.fixedEmiAmount,
          maxOutstandingLoanBalance: this.loansAccountTermsData.maxOutstandingLoanBalance,
          transactionProcessingStrategyCode: this.loansAccountTermsData.transactionProcessingStrategyCode,
          interestRateDifferential: this.loansAccountTermsData.interestRateDifferential,
          multiDisburseLoan: this.loansAccountTermsData.multiDisburseLoan,
          interestRateFrequencyType: this.loansAccountTermsData.interestRateFrequencyType.id,
          balloonRepaymentAmount: this.loansAccountTermsData.balloonRepaymentAmount,
          interestRecognitionOnDisbursementDate:
            this.loansAccountTermsData.interestRecognitionOnDisbursementDate || false
        });

        if (this.loansAccountTermsData.loanScheduleType.code == LoanProducts.LOAN_SCHEDULE_TYPE_CUMULATIVE) {
          this.loansAccountTermsForm.removeControl('interestRecognitionOnDisbursementDate');
        }
      }
      this.setAdvancedPaymentStrategyControls();
      this.setCustomValidators();
      this.setLoanTermListener();
      this.setNumericFieldListeners();

      if (this.allowAddDisbursementDetails()) {
        this.loansAccountTermsForm.removeControl('maxOutstandingLoanBalance');
        this.loansAccountTermsForm.addControl(
          'maxOutstandingLoanBalance',
          new UntypedFormControl(this.loansAccountTermsData?.maxOutstandingLoanBalance ?? null, [
            Validators.required,
            Validators.min(0)
          ])
        );
      } else {
        this.loansAccountTermsForm.addControl(
          'maxOutstandingLoanBalance',
          new UntypedFormControl(this.loansAccountTermsData?.maxOutstandingLoanBalance ?? null, [Validators.min(0)])
        );
      }
    } else if (this.loanProductService.isWorkingCapital) {
      if (this.loansAccountTermsData) {
        this.loansAccountTermsForm.patchValue({
          principalAmount: this.loansAccountTermsData.principal || this.loansAccountTermsData.product.principal,
          periodPaymentRate: this.loansAccountTermsData.periodPaymentRate,
          repaymentEvery: this.loansAccountTermsData.repaymentEvery,
          repaymentFrequencyType: this.loansAccountTermsData.repaymentFrequencyType.id,
          delinquencyGraceDays:
            this.loansAccountTermsData.delinquencyGraceDays || this.loansAccountTermsData.product.delinquencyGraceDays,
          delinquencyStartType:
            this.loansAccountTermsData.delinquencyStartType?.id ||
            this.loansAccountTermsData.product.delinquencyStartType?.id,
          breachId: this.loansAccountTermsData.breach?.id || this.loansAccountTermsData.product.breach?.id,
          nearBreachId: this.loansAccountTermsData.nearBreach?.id || this.loansAccountTermsData.product.nearBreach?.id
        });
      }
    }
  }

  allowAddDisbursementDetails() {
    return this.multiDisburseLoan && !this.loansAccountTermsData.disallowExpectedDisbursements;
  }

  formatDateToDDMMYYYY(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /** Custom Validators for the form */
  setCustomValidators() {
    const repaymentFrequencyNthDayType = this.loansAccountTermsForm.get('repaymentFrequencyNthDayType');
    const repaymentFrequencyDayOfWeekType = this.loansAccountTermsForm.get('repaymentFrequencyDayOfWeekType');

    this.loansAccountTermsForm
      .get('repaymentFrequencyType')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((repaymentFrequencyType) => {
        repaymentFrequencyNthDayType?.setValidators(null);
        repaymentFrequencyDayOfWeekType?.setValidators(null);

        setTimeout(() => {
          repaymentFrequencyNthDayType?.updateValueAndValidity();
          repaymentFrequencyDayOfWeekType?.updateValueAndValidity();
        });
      });
  }

  /** Custom Listeners for the form to calculate Loan Term */
  setLoanTermListener() {
    this.loansAccountTermsForm
      .get('numberOfRepayments')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((numberOfRepayments) => {
        const repaymentEvery: number = this.loansAccountTermsForm.value.repaymentEvery;
        this.calculateLoanTerm(numberOfRepayments, repaymentEvery);
      });

    this.loansAccountTermsForm
      .get('repaymentEvery')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((repaymentEvery) => {
        const numberOfRepayments: number = this.loansAccountTermsForm.value.numberOfRepayments;
        this.calculateLoanTerm(numberOfRepayments, repaymentEvery);
      });

    this.loansAccountTermsForm
      .get('loanTermFrequencyType')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loanTermFrequencyType) => {
        this.loansAccountTermsForm.patchValue({ repaymentFrequencyType: loanTermFrequencyType });
      });

    this.loansAccountTermsForm
      .get('amortizationType')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((amortizationType) => {
        if (amortizationType === 0) {
          // Equal Principal Payments
          this.loansAccountTermsForm.addControl('fixedPrincipalPercentagePerInstallment', new UntypedFormControl(''));
        } else {
          // Equal Installments
          this.loansAccountTermsForm.removeControl('fixedPrincipalPercentagePerInstallment');
        }
      });
  }

  /** Prevent negative values in numeric fields */
  setNumericFieldListeners() {
    const numericFieldsWithMinZero = [
      'graceOnPrincipalPayment',
      'graceOnInterestPayment',
      'graceOnArrearsAgeing',
      'inArrearsTolerance',
      'graceOnInterestCharged',
      'loanTermFrequency',
      'numberOfRepayments',
      'repaymentEvery'
    ];
    numericFieldsWithMinZero.forEach((fieldName) => {
      const control = this.loansAccountTermsForm.get(fieldName);
      if (control) {
        control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
          if (typeof value === 'number' && value < 0) {
            control.setValue(0, { emitEvent: false });
          }
        });
      }
    });
    const interestRateControl = this.loansAccountTermsForm.get('interestRatePerPeriod');
    if (interestRateControl) {
      interestRateControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
        if (typeof value === 'number' && value < 0.01) {
          interestRateControl.setValue(0.01, { emitEvent: false });
        }
      });
    }
  }

  setAdvancedPaymentStrategyControls(): void {
    // Fixed Length validation
    if (this.loansAccountTermsData) {
      this.loansAccountTermsForm.removeControl('interestRatePerPeriod');
      this.loansAccountTermsForm.removeControl('fixedLength');
      if (this.loansAccountTermsData.product.fixedLength) {
        this.loansAccountTermsForm.addControl(
          'interestRatePerPeriod',
          new UntypedFormControl({ value: 0, disabled: true }, [
            Validators.required,
            Validators.min(0)
          ])
        );
        this.loansAccountTermsForm.addControl(
          'fixedLength',
          new UntypedFormControl(this.loansAccountTermsData.product.fixedLength)
        );
      } else {
        this.loansAccountTermsForm.addControl(
          'interestRatePerPeriod',
          new UntypedFormControl(this.loansAccountTermsData.interestRatePerPeriod, [
            Validators.required,
            Validators.min(0)
          ])
        );
      }
    }
  }

  hasFixedLength(): boolean {
    if (this.loansAccountTermsData) {
      return this.loansAccountTermsData.product?.fixedLength ? true : false;
    }
    return false;
  }

  isEqualPrincipalPayments(): boolean {
    return this.loansAccountTermsForm.value.amortizationType === 0;
  }

  /** Create Loans Account Terms Form */
  createloansAccountTermsForm() {
    if (this.loanProductService.isLoanProduct) {
      this.loansAccountTermsForm = this.formBuilder.group({
        principalAmount: [
          '',
          Validators.required
        ],
        loanTermFrequency: [
          { value: '', disabled: true },
          [
            Validators.required,
            Validators.min(0)
          ]
        ],
        loanTermFrequencyType: [
          '',
          Validators.required
        ],
        numberOfRepayments: [
          '',
          [
            Validators.required,
            Validators.min(0)
          ]
        ],
        repaymentEvery: [
          '',
          [
            Validators.required,
            Validators.min(0)
          ]
        ],
        repaymentFrequencyType: [
          { value: '', disabled: true },
          Validators.required
        ],
        repaymentFrequencyNthDayType: [''],
        repaymentFrequencyDayOfWeekType: [''],
        repaymentsStartingFromDate: [''],
        interestChargedFromDate: [''],
        interestRatePerPeriod: [
          '',
          Validators.min(0)
        ],
        interestType: [''],
        isFloatingInterestRate: [null],
        isEqualAmortization: [''],
        amortizationType: [
          '',
          Validators.required
        ],
        interestCalculationPeriodType: [''],
        allowPartialPeriodInterestCalculation: [''],
        inArrearsTolerance: [
          '',
          Validators.min(0)
        ],
        graceOnInterestCharged: [
          '',
          Validators.min(0)
        ],
        graceOnPrincipalPayment: [
          '',
          Validators.min(0)
        ],
        graceOnInterestPayment: [
          '',
          Validators.min(0)
        ],
        graceOnArrearsAgeing: [
          '',
          Validators.min(0)
        ],
        loanIdToClose: [''],
        fixedEmiAmount: [''],
        isTopup: [''],
        maxOutstandingLoanBalance: [''],
        interestRateDifferential: [''],
        transactionProcessingStrategyCode: [
          '',
          Validators.required
        ],
        multiDisburseLoan: [false],
        interestRateFrequencyType: [''],
        balloonRepaymentAmount: [''],
        interestRecognitionOnDisbursementDate: [false],
        allowFullTermForTranche: [false]
      });
    } else if (this.loanProductService.isWorkingCapital) {
      this.loansAccountTermsForm = this.formBuilder.group({
        principalAmount: [
          '',
          [
            Validators.required,
            amountValueValidator()
          ]
        ],
        totalPaymentVolume: [
          '',
          [
            Validators.required,
            amountValueValidator()
          ]
        ],
        discount: [''],
        periodPaymentRate: [
          '',
          [
            Validators.required,
            Validators.min(0),
            Validators.max(1000)
          ]
        ],
        repaymentEvery: [
          '',
          [
            Validators.required,
            Validators.min(1),
            amountValueValidator()
          ]
        ],
        repaymentFrequencyType: [
          '',
          Validators.required
        ],
        delinquencyGraceDays: [
          '',
          [
            Validators.min(0)
          ]
        ],
        delinquencyStartType: [''],
        breachId: [''],
        nearBreachId: ['']
      });
    }
  }

  calculateLoanTerm(numberOfRepayments: number, repaymentEvery: number): void {
    const loanTerm = numberOfRepayments * repaymentEvery;
    this.loansAccountTermsForm.patchValue({ loanTermFrequency: loanTerm });
  }

  /**
   * Gets the Disbursement Data array.
   * @returns {Array} Disbursement Data array.
   */
  get disbursementData() {
    return {
      disbursementData: this.disbursementDataSource
    };
  }

  /**
   * Adds the Disbursement Data entry form to given Disbursement Data entry.
   */
  addDisbursementDataEntry() {
    const currentPrincipalAmount = this.loansAccountTermsForm.get('principalAmount')?.value;
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'expectedDisbursementDate',
        label: 'Expected Disbursement Date',
        value: new Date() || '',
        type: 'datetime-local',
        minDate: this.minDate,
        maxDate: this.maxDate,
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'principal',
        label: `Principal(It should be less than equal to the ${currentPrincipalAmount})`,
        value: '',
        type: 'number',
        step: 'any',
        required: true,
        order: 2
      })
    ];
    const data = {
      title: 'Add Disbursement Details',
      layout: { addButtonText: 'Add' },
      formfields: formfields
    };
    const disbursementDialogRef = this.dialog.open(FormDialogComponent, { data });
    disbursementDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const principal = response.data.value.principal * 1;
        if (this.totalMultiDisbursed + principal <= currentPrincipalAmount) {
          this.disbursementDataSource = this.disbursementDataSource.concat(response.data.value);
          this.totalMultiDisbursed += principal;
          this.isMultiDisbursedCompleted = this.totalMultiDisbursed === currentPrincipalAmount;
          this.pristine = false;
        }
      }
    });
  }

  /**
   * Removes the Disbursement Data entry form from given Disbursement Data entry form array at given index.
   * @param {number} index Array index from where Disbursement Data entry form needs to be removed.
   */
  removeDisbursementDataEntry(index: number) {
    const currentPrincipalAmount = this.loansAccountTermsForm.get('principalAmount')?.value;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        const principal = this.disbursementDataSource[index]['principal'] * 1;
        this.disbursementDataSource.splice(index, 1);
        this.disbursementDataSource = this.disbursementDataSource.concat([]);
        this.totalMultiDisbursed -= principal;
        this.isMultiDisbursedCompleted = this.totalMultiDisbursed === currentPrincipalAmount;
      }
    });
  }

  /**
   * Add a Collateral to the loan
   */
  addCollateral() {
    const addCollateralDialogRef = this.dialog.open(LoansAccountAddCollateralDialogComponent, {
      data: { collateralOptions: this.collateralOptions }
    });
    addCollateralDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const collateralData = {
          type: response.data.value.collateral,
          value: response.data.value.quantity
        };
        this.totalCollateralValue +=
          (collateralData.type.pctToBase * collateralData.type.basePrice * collateralData.value) / 100;
        this.collateralDataSource = this.collateralDataSource.concat(collateralData);
        this.collateralOptions = this.collateralOptions.filter(
          (user: any) => user.collateralId !== response.data.value.collateral.collateralId
        );
        if (this.loanPrincipal < this.totalCollateralValue) {
          this.isCollateralSufficient = true;
        } else {
          this.isCollateralSufficient = false;
        }
      }
    });
  }
  /**
   * Delete a added collateral from loan
   * @param id ID od the collateral to be deleted
   */
  deleteCollateral(id: any) {
    const deleteCollateralDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `collateral` }
    });
    deleteCollateralDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        const removed: any = this.collateralDataSource.splice(id, 1);
        this.collateralOptions = this.collateralOptions.concat(removed[0].type);
        this.totalCollateralValue -= (removed[0].type.pctToBase * removed[0].type.basePrice * removed[0].value) / 100;
        this.collateralDataSource = this.collateralDataSource.concat([]);
        this.pristine = false;
        if (this.loanPrincipal < this.totalCollateralValue) {
          this.isCollateralSufficient = true;
        } else {
          this.isCollateralSufficient = false;
        }
      }
    });
  }

  /**
   * Sets all select dropdown options.
   */
  setOptions() {
    this.termFrequencyTypeData = this.loansAccountProductTemplate.termFrequencyTypeOptions;
    this.repaymentFrequencyNthDayTypeData = this.loansAccountProductTemplate.repaymentFrequencyNthDayTypeOptions;
    this.repaymentFrequencyDaysOfWeekTypeData =
      this.loansAccountProductTemplate.repaymentFrequencyDaysOfWeekTypeOptions;
    this.interestTypeData = this.loansAccountProductTemplate.interestTypeOptions;
    this.amortizationTypeData = this.loansAccountProductTemplate.amortizationTypeOptions;
    this.interestCalculationPeriodTypeData = this.loansAccountProductTemplate.interestCalculationPeriodTypeOptions;
    this.clientActiveLoanData = this.loansAccountProductTemplate.clientActiveLoanOptions;
    this.loanScheduleType = this.loansAccountProductTemplate.loanScheduleType;
    this.transactionProcessingStrategyOptions = [];
    if (this.loanScheduleType?.code === LoanProducts.LOAN_SCHEDULE_TYPE_CUMULATIVE) {
      // Filter Advanced Payment Allocation Strategy
      this.transactionProcessingStrategyOptions =
        this.loansAccountProductTemplate.transactionProcessingStrategyOptions.filter(
          (cn: CodeName) => !LoanProducts.isAdvancedPaymentAllocationStrategy(cn.code)
        );
      this.repaymentStrategyDisabled = false;
    } else {
      // Only Advanced Payment Allocation Strategy
      this.loansAccountProductTemplate.transactionProcessingStrategyOptions.some((cn: CodeName) => {
        if (LoanProducts.isAdvancedPaymentAllocationStrategy(cn.code)) {
          this.transactionProcessingStrategyOptions.push(cn);
        }
      });
      this.repaymentStrategyDisabled = true;
    }
  }

  isDelinquencyEnabled(): boolean {
    return !!this.loanProduct?.delinquencyBucket?.name;
  }

  /**
   * Returns loans account terms form value.
   */
  get loansAccountTerms() {
    return this.loansAccountTermsForm.getRawValue();
  }

  get loanCollateral() {
    return {
      collateral: this.collateralDataSource
    };
  }

  /**
   * Check if full term tranche option should be visible at loan level.
   * Available when PROGRESSIVE schedule type and multi-disbursement is enabled.
   */
  isFullTermTrancheEditable(): boolean {
    return this.isProgressive && !!this.multiDisburseLoan;
  }

  get selectedBreach(): Breach | undefined {
    const id = this.loansAccountTermsForm.get('breachId')?.value;
    return this.breachOptions ? this.breachOptions.find((b) => b.id === id) : undefined;
  }

  get selectedNearBreach(): NearBreach | undefined {
    const id = this.loansAccountTermsForm.get('nearBreachId')?.value;
    return this.nearBreachOptions ? this.nearBreachOptions.find((b) => b.id === id) : undefined;
  }

  clearProperty($event: Event, propertyName: string): void {
    if (propertyName === 'breachId') {
      this.loansAccountTermsForm.patchValue({
        breachId: '',
        nearBreachId: ''
      });
    } else if (propertyName === 'nearBreachId') {
      this.loansAccountTermsForm.patchValue({
        nearBreachId: ''
      });
    }
    this.loansAccountTermsForm.markAsDirty();
    $event.stopPropagation();
  }
}
