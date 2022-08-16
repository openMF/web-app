/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LoansAccountAddCollateralDialogComponent } from 'app/loans/custom-dialog/loans-account-add-collateral-dialog/loans-account-add-collateral-dialog.component';
import { SettingsService } from 'app/settings/settings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

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
  /** Is Multi Disburse Loan  */
  @Input() multiDisburseLoan: any;
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
  loansAccountTermsForm: FormGroup;
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
  /** Transaction Processing Strategy Data */
  transactionProcessingStrategyData: any;
  /** Client Active Loan Data */
  clientActiveLoanData: any;

  /** Check if value of collateral added  is more than principal amount */
  isCollateralSufficient = false;
  /** Total value of all collateral added to a loan */
  totalCollateralValue: any = 0;
  /** Collateral Data Source */
  collateralDataSource: {}[] = [];
  /** Columns to be displayed in collateral table. */
  loanCollateralDisplayedColumns: string[] = ['type', 'value', 'totalValue', 'totalCollateralValue', 'action'];
  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;

  /**
   * Create Loans Account Terms Form
   * @param formBuilder FormBuilder
   * @param {SettingsService} settingsService SettingsService
   */
  constructor(private formBuilder: FormBuilder,
      private settingsService: SettingsService,
      public dialog: MatDialog) {
    this.createloansAccountTermsForm();
  }
  /**
   * Executes on change of input values
   */
  ngOnChanges() {
    if (this.loansAccountProductTemplate) {
      this.loansAccountTermsForm.patchValue({
        'principal': this.loansAccountProductTemplate.principal,
        'loanTermFrequency': this.loansAccountProductTemplate.termFrequency,
        'loanTermFrequencyType': this.loansAccountProductTemplate.termPeriodFrequencyType.id,
        'numberOfRepayments': this.loansAccountProductTemplate.numberOfRepayments,
        'repaymentEvery': this.loansAccountProductTemplate.repaymentEvery,
        'repaymentFrequencyType': this.loansAccountProductTemplate.repaymentFrequencyType.id,
        'interestRatePerPeriod': this.loansAccountProductTemplate.interestRatePerPeriod,
        'amortizationType': this.loansAccountProductTemplate.amortizationType.id,
        'isEqualAmortization': this.loansAccountProductTemplate.isEqualAmortization,
        'interestType': this.loansAccountProductTemplate.interestType.id,
        'isFloatingInterestRate': this.loansAccountProductTemplate.isLoanProductLinkedToFloatingRate ? false : '',
        'interestCalculationPeriodType': this.loansAccountProductTemplate.interestCalculationPeriodType.id,
        'allowPartialPeriodInterestCalcualtion': this.loansAccountProductTemplate.allowPartialPeriodInterestCalcualtion,
        'inArrearsTolerance': this.loansAccountProductTemplate.inArrearsTolerance,
        'graceOnPrincipalPayment': this.loansAccountProductTemplate.graceOnPrincipalPayment,
        'graceOnInterestPayment': this.loansAccountProductTemplate.graceOnInterestPayment,
        'graceOnArrearsAgeing': this.loansAccountProductTemplate.graceOnArrearsAgeing,
        'transactionProcessingStrategyId': this.loansAccountProductTemplate.transactionProcessingStrategyId,
        'graceOnInterestCharged': this.loansAccountProductTemplate.graceOnInterestCharged,
        'fixedEmiAmount': this.loansAccountProductTemplate.fixedEmiAmount,
        'maxOutstandingLoanBalance': this.loansAccountProductTemplate.maxOutstandingLoanBalance
      });
      this.setOptions();
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    if (this.loansAccountTemplate) {
      if (this.loansAccountTemplate.loanProductId) {
        this.loansAccountTermsForm.patchValue({
          'repaymentsStartingFromDate': this.loansAccountTemplate.expectedFirstRepaymentOnDate && new Date(this.loansAccountTemplate.expectedFirstRepaymentOnDate)
        });
      }
    }
    this.createloansAccountTermsForm();
    this.setCustomValidators();
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
      'principal': ['', Validators.required],
      'loanTermFrequency': ['', Validators.required],
      'loanTermFrequencyType': ['', Validators.required],
      'numberOfRepayments': ['', Validators.required],
      'repaymentEvery': ['', Validators.required],
      'repaymentFrequencyType': ['', Validators.required],
      'disbursementData': this.formBuilder.array([]),
      'repaymentFrequencyNthDayType': [''],
      'repaymentFrequencyDayOfWeekType': [''],
      'repaymentsStartingFromDate': [''],
      'interestChargedFromDate': [''],
      'interestRatePerPeriod': [''],
      'interestType': [''],
      // 'interestRateDifferential': [''],
      'isFloatingInterestRate': [''],
      'isEqualAmortization': [''],
      'amortizationType': ['', Validators.required],
      'interestCalculationPeriodType': [''],
      'allowPartialPeriodInterestCalcualtion': [''],
      'inArrearsTolerance': [''],
      'graceOnInterestCharged': [''],
      'transactionProcessingStrategyId': ['', Validators.required],
      'graceOnPrincipalPayment': [''],
      'graceOnInterestPayment': [''],
      'graceOnArrearsAgeing': [''],
      'loanIdToClose': [''],
      'fixedEmiAmount': [''],
      'isTopup': [''],
      'maxOutstandingLoanBalance': ['']
    });
  }

  /**
   * Creates the Disbursement Data form.
   * @returns {FormGroup} Disbursement Data form.
   */
  createDisbursementDataForm(): FormGroup {
    return this.formBuilder.group({
      'expectedDisbursementDate': [new Date()],
      'principal': ['']
    });
  }

  /**
   * Gets the Disbursement Data form array.
   * @returns {FormArray} Disbursement Data form array.
   */
    get disbursementData(): FormArray {
    return this.loansAccountTermsForm.get('disbursementData') as FormArray;
  }

  /**
   * Adds the Disbursement Data entry form to given Disbursement Data entry form array.
   * @param {FormArray} disbursementDataFormArray Given affected gl entry form array (debit/credit).
   */
   addDisbursementDataEntry(disbursementDataFormArray: FormArray) {
    disbursementDataFormArray.push(this.createDisbursementDataForm());
  }

  /**
   * Removes the Disbursement Data entry form from given Disbursement Data entry form array at given index.
   * @param {FormArray} disbursementDataFormArray Given Disbursement Data entry form array.
   * @param {number} index Array index from where Disbursement Data entry form needs to be removed.
   */
   removeDisbursementDataEntry(disbursementDataFormArray: FormArray, index: number) {
    disbursementDataFormArray.removeAt(index);
  }

  /**
   * Add a Collateral to the loan
   */
    addCollateral() {
    const addCollateralDialogRef = this.dialog.open(LoansAccountAddCollateralDialogComponent, {
      data: { collateralOptions: this.collateralOptions }
    });
    console.log(this.collateralOptions);
    addCollateralDialogRef.afterClosed().subscribe((response: any) => {
      console.log(this.loanPrincipal);
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
    this.transactionProcessingStrategyData = this.loansAccountProductTemplate.transactionProcessingStrategyOptions;
    this.clientActiveLoanData = this.loansAccountProductTemplate.clientActiveLoanOptions;
  }

  /**
   * Returns loans account terms form value.
   */
  get loansAccountTerms() {
    return this.loansAccountTermsForm.value;
  }

  get loanCollateral() {
    return {
      collateral: this.collateralDataSource
    };
  }

}
