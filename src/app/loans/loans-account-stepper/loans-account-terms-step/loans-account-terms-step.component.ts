/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl, UntypedFormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
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
  /** Transaction Processing Strategy Data */
  transactionProcessingStrategyData: any;
  /** Client Active Loan Data */
  clientActiveLoanData: any;

  /**
   * Create Loans Account Terms Form
   * @param formBuilder FormBuilder
   * @param route Route
   * @param router Router
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private router: Router) {
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
  createDisbursementDataForm(): UntypedFormGroup {
    return this.formBuilder.group({
      'expectedDisbursementDate': [new Date()],
      'principal': ['']
    });
  }

  /**
   * Gets the Disbursement Data form array.
   * @returns {FormArray} Disbursement Data form array.
   */
    get disbursementData(): UntypedFormArray {
    return this.loansAccountTermsForm.get('disbursementData') as UntypedFormArray;
  }

  /**
   * Adds the Disbursement Data entry form to given Disbursement Data entry form array.
   * @param {FormArray} disbursementDataFormArray Given affected gl entry form array (debit/credit).
   */
   addDisbursementDataEntry(disbursementDataFormArray: UntypedFormArray) {
    disbursementDataFormArray.push(this.createDisbursementDataForm());
  }

  /**
   * Removes the Disbursement Data entry form from given Disbursement Data entry form array at given index.
   * @param {FormArray} disbursementDataFormArray Given Disbursement Data entry form array.
   * @param {number} index Array index from where Disbursement Data entry form needs to be removed.
   */
   removeDisbursementDataEntry(disbursementDataFormArray: UntypedFormArray, index: number) {
    disbursementDataFormArray.removeAt(index);
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

}
