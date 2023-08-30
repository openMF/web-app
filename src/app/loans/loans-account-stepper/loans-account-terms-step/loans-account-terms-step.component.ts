/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LoansAccountAddCollateralDialogComponent } from 'app/loans/custom-dialog/loans-account-add-collateral-dialog/loans-account-add-collateral-dialog.component';
import { SettingsService } from 'app/settings/settings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { TooltipPosition } from '@angular/material/tooltip';

/**
 * Create Loans Account Terms Step
 */
@Component({
  selector: 'mifosx-loans-account-terms-step',
  templateUrl: './loans-account-terms-step.component.html',
  styleUrls: ['./loans-account-terms-step.component.scss']
})
export class LoansAccountTermsStepComponent implements OnInit, OnChanges {

  /** Loans Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
  loansAccountTermsData: any;

  /** Is Multi Disburse Loan  */
  multiDisburseLoan: any;
  // @Input() loansAccountFormValid: LoansAccountFormValid
  @Input() loansAccountFormValid: boolean;
  // @Input collateralOptions: Collateral Options
  @Input() collateralOptions: any;
  // @Input loanPrincipal: Loan Principle
  @Input() loanPrincipal: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Loans Account Terms Form */
  loansAccountTermsForm: UntypedFormGroup;
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
  disbursementDataSource: {}[] = [];
  currencyDisplaySymbol = '$';
  /** Loan Transaction strategies */
  transactionProcessingStrategyOptions: any = [];

  /** Check if value of collateral added  is more than principal amount */
  isCollateralSufficient = false;
  /** Total value of all collateral added to a loan */
  totalCollateralValue: any = 0;
  /** Collateral Data Source */
  collateralDataSource: {}[] = [];
  /** Columns to be displayed in collateral table. */
  loanCollateralDisplayedColumns: string[] = ['type', 'value', 'totalValue', 'totalCollateralValue', 'action'];
  /** Disbursement Data Displayed Columns */
  disbursementDisplayedColumns: string[] = ['expectedDisbursementDate', 'principal', 'actions'];
  /** Multi Disbursement Control */
  totalMultiDisbursed: any = 0;
  isMultiDisbursedCompleted = false;

  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;

  loanId: any = null;

  /**
   * Create Loans Account Terms Form
   * @param formBuilder FormBuilder
   * @param {SettingsService} settingsService SettingsService
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    public dialog: MatDialog) {
      this.loanId = this.route.snapshot.params['loanId'];
      this.createloansAccountTermsForm();
  }
  /**
   * Executes on change of input values
   */
  ngOnChanges() {
    if (this.loansAccountProductTemplate) {
      this.loansAccountTermsData = this.loansAccountProductTemplate;
      this.currencyDisplaySymbol = this.loansAccountTermsData.currency.displaySymbol;
      if (this.loanId != null && this.loansAccountTemplate.accountNo) {
        this.loansAccountTermsData = this.loansAccountTemplate;
      }

      this.loansAccountTermsForm.patchValue({
        'principalAmount': this.loansAccountTermsData.principal,
        'loanTermFrequency': this.loansAccountTermsData.termFrequency,
        'loanTermFrequencyType': this.loansAccountTermsData.termPeriodFrequencyType.id,
        'numberOfRepayments': this.loansAccountTermsData.numberOfRepayments,
        'repaymentEvery': this.loansAccountTermsData.repaymentEvery,
        'repaymentFrequencyType': this.loansAccountTermsData.repaymentFrequencyType.id,
        'interestRatePerPeriod': this.loansAccountTermsData.interestRatePerPeriod,
        'amortizationType': this.loansAccountTermsData.amortizationType.id,
        'isEqualAmortization': this.loansAccountTermsData.isEqualAmortization,
        'interestType': this.loansAccountTermsData.interestType.id,
        'isFloatingInterestRate': this.loansAccountTermsData.isLoanProductLinkedToFloatingRate ? false : '',
        'interestCalculationPeriodType': this.loansAccountTermsData.interestCalculationPeriodType.id,
        'allowPartialPeriodInterestCalcualtion': this.loansAccountTermsData.allowPartialPeriodInterestCalcualtion,
        'inArrearsTolerance': this.loansAccountTermsData.inArrearsTolerance,
        'graceOnPrincipalPayment': this.loansAccountTermsData.graceOnPrincipalPayment,
        'graceOnInterestPayment': this.loansAccountTermsData.graceOnInterestPayment,
        'graceOnArrearsAgeing': this.loansAccountTermsData.graceOnArrearsAgeing,
        'graceOnInterestCharged': this.loansAccountTermsData.graceOnInterestCharged,
        'fixedEmiAmount': this.loansAccountTermsData.fixedEmiAmount,
        'maxOutstandingLoanBalance': this.loansAccountTermsData.maxOutstandingLoanBalance,
        'transactionProcessingStrategyCode': this.loansAccountTermsData.transactionProcessingStrategyCode,
        'interestRateDifferential': this.loansAccountTermsData.interestRateDifferential,
        'multiDisburseLoan': this.loansAccountTermsData.multiDisburseLoan
      });

      this.multiDisburseLoan = this.loansAccountTermsData.multiDisburseLoan;
      if (this.loansAccountTermsData.disbursementDetails) {
        this.disbursementDataSource = this.loansAccountTermsData.disbursementDetails;
        this.totalMultiDisbursed = 0;
        this.disbursementDataSource.forEach((item: any) => {
          this.totalMultiDisbursed += item.principal;
        });
      }

      this.collateralDataSource = this.loansAccountTermsData.collateral || [];

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
        this.loansAccountTermsForm.controls.allowPartialPeriodInterestCalcualtion.disable();
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
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.loansAccountTermsData = this.loansAccountProductTemplate;
    if (this.loanId != null && this.loansAccountTemplate.accountNo) {
      this.loansAccountTermsData = this.loansAccountTemplate;
    }

    if (this.loansAccountTermsData) {
      if (this.loansAccountTermsData.loanProductId) {
        this.loansAccountTermsForm.patchValue({
          'repaymentsStartingFromDate': this.loansAccountTermsData.expectedFirstRepaymentOnDate && new Date(this.loansAccountTermsData.expectedFirstRepaymentOnDate)
        });
      }
      this.loansAccountTermsForm.patchValue({
        'principalAmount': this.loansAccountTermsData.principal,
        'loanTermFrequency': this.loansAccountTermsData.termFrequency,
        'loanTermFrequencyType': this.loansAccountTermsData.termPeriodFrequencyType.id,
        'numberOfRepayments': this.loansAccountTermsData.numberOfRepayments,
        'repaymentEvery': this.loansAccountTermsData.repaymentEvery,
        'repaymentFrequencyType': this.loansAccountTermsData.repaymentFrequencyType.id,
        'interestRatePerPeriod': this.loansAccountTermsData.interestRatePerPeriod,
        'amortizationType': this.loansAccountTermsData.amortizationType.id,
        'isEqualAmortization': this.loansAccountTermsData.isEqualAmortization,
        'interestType': this.loansAccountTermsData.interestType.id,
        'isFloatingInterestRate': this.loansAccountTermsData.isLoanProductLinkedToFloatingRate ? false : '',
        'interestCalculationPeriodType': this.loansAccountTermsData.interestCalculationPeriodType.id,
        'allowPartialPeriodInterestCalcualtion': this.loansAccountTermsData.allowPartialPeriodInterestCalcualtion,
        'inArrearsTolerance': this.loansAccountTermsData.inArrearsTolerance,
        'graceOnPrincipalPayment': this.loansAccountTermsData.graceOnPrincipalPayment,
        'graceOnInterestPayment': this.loansAccountTermsData.graceOnInterestPayment,
        'graceOnArrearsAgeing': this.loansAccountTermsData.graceOnArrearsAgeing,
        'graceOnInterestCharged': this.loansAccountTermsData.graceOnInterestCharged,
        'fixedEmiAmount': this.loansAccountTermsData.fixedEmiAmount,
        'maxOutstandingLoanBalance': this.loansAccountTermsData.maxOutstandingLoanBalance,
        'transactionProcessingStrategyCode': this.loansAccountTermsData.transactionProcessingStrategyCode,
        'interestRateDifferential': this.loansAccountTermsData.interestRateDifferential,
        'multiDisburseLoan': this.loansAccountTermsData.multiDisburseLoan
      });
    }
    this.createloansAccountTermsForm();
    // this.setCustomValidators();
  }

  allowAddDisbursementDetails() {
    return (this.multiDisburseLoan && !this.loansAccountTermsData.disallowExpectedDisbursements);
  }

  /** Custom Validators for the form */
  setCustomValidators() {
    const repaymentFrequencyNthDayType = this.loansAccountTermsForm.get('repaymentFrequencyNthDayType');
    const repaymentFrequencyDayOfWeekType = this.loansAccountTermsForm.get('repaymentFrequencyDayOfWeekType');

    this.loansAccountTermsForm.get('repaymentFrequencyType').valueChanges
      .subscribe(repaymentFrequencyType => {

        if (repaymentFrequencyType === 2) {
          repaymentFrequencyNthDayType.setValidators([Validators.required]);
          repaymentFrequencyDayOfWeekType.setValidators([Validators.required]);
        } else {
          repaymentFrequencyNthDayType.setValidators(null);
          repaymentFrequencyDayOfWeekType.setValidators(null);
        }

        repaymentFrequencyNthDayType.updateValueAndValidity();
        repaymentFrequencyDayOfWeekType.updateValueAndValidity();
      });
  }

  /** Create Loans Account Terms Form */
  createloansAccountTermsForm() {
    this.loansAccountTermsForm = this.formBuilder.group({
      'principalAmount': ['', Validators.required],
      'loanTermFrequency': ['', Validators.required],
      'loanTermFrequencyType': ['', Validators.required],
      'numberOfRepayments': ['', Validators.required],
      'repaymentEvery': ['', Validators.required],
      'repaymentFrequencyType': ['', Validators.required],
      'repaymentFrequencyNthDayType': [''],
      'repaymentFrequencyDayOfWeekType': [''],
      'repaymentsStartingFromDate': [''],
      'interestChargedFromDate': [''],
      'interestRatePerPeriod': [''],
      'interestType': [''],
      'isFloatingInterestRate': [''],
      'isEqualAmortization': [''],
      'amortizationType': ['', Validators.required],
      'interestCalculationPeriodType': [''],
      'allowPartialPeriodInterestCalcualtion': [''],
      'inArrearsTolerance': [''],
      'graceOnInterestCharged': [''],
      'graceOnPrincipalPayment': [''],
      'graceOnInterestPayment': [''],
      'graceOnArrearsAgeing': [''],
      'loanIdToClose': [''],
      'fixedEmiAmount': [''],
      'isTopup': [''],
      'maxOutstandingLoanBalance': [''],
      'interestRateDifferential': [''],
      'transactionProcessingStrategyCode': ['', Validators.required],
      'multiDisburseLoan': [false]
    });
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
    const currentPrincipalAmount = this.loansAccountTermsForm.get('principalAmount').value;
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
        if ((this.totalMultiDisbursed + principal) <= currentPrincipalAmount) {
          this.disbursementDataSource = this.disbursementDataSource.concat(response.data.value);
          this.totalMultiDisbursed += principal;
          this.isMultiDisbursedCompleted = (this.totalMultiDisbursed === currentPrincipalAmount);
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
    const currentPrincipalAmount = this.loansAccountTermsForm.get('principalAmount').value;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        const principal = this.disbursementDataSource[index]['principal'] * 1;
        this.disbursementDataSource.splice(index, 1);
        this.disbursementDataSource = this.disbursementDataSource.concat([]);
        this.totalMultiDisbursed -= principal;
        this.isMultiDisbursedCompleted = (this.totalMultiDisbursed === currentPrincipalAmount);
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
          value: response.data.value.quantity,
        };
        this.totalCollateralValue += collateralData.type.pctToBase * collateralData.type.basePrice * collateralData.value / 100;
        this.collateralDataSource = this.collateralDataSource.concat(collateralData);
        this.collateralOptions = this.collateralOptions.filter((user: any) => user.collateralId !== response.data.value.collateral.collateralId);
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
        this.totalCollateralValue -= removed[0].type.pctToBase * removed[0].type.basePrice * removed[0].value / 100;
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
    this.repaymentFrequencyDaysOfWeekTypeData = this.loansAccountProductTemplate.repaymentFrequencyDaysOfWeekTypeOptions;
    this.interestTypeData = this.loansAccountProductTemplate.interestTypeOptions;
    this.amortizationTypeData = this.loansAccountProductTemplate.amortizationTypeOptions;
    this.interestCalculationPeriodTypeData = this.loansAccountProductTemplate.interestCalculationPeriodTypeOptions;
    this.clientActiveLoanData = this.loansAccountProductTemplate.clientActiveLoanOptions;
    this.transactionProcessingStrategyOptions = this.loansAccountProductTemplate.transactionProcessingStrategyOptions;
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

}
