import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-loan-account-terms-step',
  templateUrl: './loan-account-terms-step.component.html',
  styleUrls: ['./loan-account-terms-step.component.scss']
})
export class LoanAccountTermsStepComponent implements OnInit {
  @Input() loanAccountInfo: any;
  loanAccountTermsForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router) {
    this.createLoanAccountTermsForm();
  }

  ngOnInit() {}

  ngOnChanges() {
    if (this.loanAccountInfo) {
      this.loanAccountTermsForm.patchValue({
        'principal': this.loanAccountInfo.principal,
        'loanTermFrequency': this.loanAccountInfo.termFrequency,
        'loanTermFrequencyType': this.loanAccountInfo.termPeriodFrequencyType.id,
        'numberOfRepayments': this.loanAccountInfo.numberOfRepayments,
        'repaymentEvery': this.loanAccountInfo.repaymentEvery,
        'repaymentFrequencyType': this.loanAccountInfo.repaymentFrequencyType.id,
        'interestRatePerPeriod': this.loanAccountInfo.interestRatePerPeriod,
        'amortizationType': this.loanAccountInfo.amortizationType.id,
        'isEqualAmortization': this.loanAccountInfo.isEqualAmortization,
        'nominalInterestType': this.loanAccountInfo.interestType.id,
        'differentialInterestType': this.loanAccountInfo.interestType.id,
        'isfloatingrate': this.loanAccountInfo.isLoanProductLinkedToFloatingRate ? false : true,
        'interestCalculationPeriodType': this.loanAccountInfo.interestCalculationPeriodType.id,
        'allowPartialPeriodInterestCalcualtion': this.loanAccountInfo.allowPartialPeriodInterestCalcualtion,
        'inArrearsTolerance': this.loanAccountInfo.inArrearsTolerance,
        'graceOnPrincipalPayment': this.loanAccountInfo.graceOnPrincipalPayment,
        'graceOnInterestPayment': this.loanAccountInfo.graceOnInterestPayment,
        'graceOnArrearsAgeing': this.loanAccountInfo.graceOnArrearsAgeing,
        'transactionProcessingStrategyId': this.loanAccountInfo.transactionProcessingStrategyId,
        'graceOnInterestCharged': this.loanAccountInfo.graceOnInterestCharged,
        'fixedEmiAmount': this.loanAccountInfo.fixedEmiAmount,
        'maxOutstandingLoanBalance': this.loanAccountInfo.maxOutstandingLoanBalance
      });
    }
  }

  createLoanAccountTermsForm() {
    this.loanAccountTermsForm = this.formBuilder.group({
      'principal': ['', Validators.required],
      'loanTermFrequency': ['', Validators.required],
      'loanTermFrequencyType': ['', Validators.required],
      'numberOfRepayments': ['', Validators.required],
      'repaymentEvery': ['', Validators.required],
      'repaymentFrequencyType': [''],
      'repaymentFrequencyNthDayType': [''],
      'repaymentFrequencyDayOfWeekType': [''],
      'repaymentsStartingFromDate': [''],
      'interestChargedFromDate': [''],
      'interestRatePerPeriod': [''],
      'nominalInterestType': [''],
      'interestratedifferential': [''],
      'differentialInterestType': [''],
      'isfloatingrate': [''],
      'isEqualAmortization': [''],
      'amortizationType': [''],
      'interestCalculationPeriodType': [''],
      'allowPartialPeriodInterestCalcualtion': [''],
      'inArrearsTolerance': [''],
      'graceOnInterestCharged': [''],
      'transactionProcessingStrategyId': [''],
      'graceOnPrincipalPayment': [''],
      'graceOnInterestPayment': [''],
      'graceOnArrearsAgeing': [''],
      'loanIdToClose': [''],
      'fixedEmiAmount': [''],
      'isTopup': [''],
      'maxOutstandingLoanBalance': ['']
    });
  }

  get loanAccountTerms() {
    return this.loanAccountTermsForm.value;
  }
}
