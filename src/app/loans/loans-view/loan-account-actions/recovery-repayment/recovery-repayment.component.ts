/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Loan Recovery Repayment Action
 */
@Component({
  selector: 'mifosx-recovery-repayment',
  templateUrl: './recovery-repayment.component.html',
  styleUrls: ['./recovery-repayment.component.scss']
})
export class RecoveryRepaymentComponent implements OnInit {

  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Payment Type Options */
  paymentTypes: any;
  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Recovery Repayment Loan Form */
  recoveryRepaymentLoanForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the recovery repayment loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createRecoveryRepaymentLoanForm();
    this.setRecoveryRepaymentLoanDetails();
  }

  /**
   * Creates the recovery repayment loan form
   */
  createRecoveryRepaymentLoanForm() {
    this.recoveryRepaymentLoanForm = this.formBuilder.group({
      'transactionDate': [new Date(), Validators.required],
      'transactionAmount': ['', Validators.required],
      'paymentTypeId': [''],
      'note': ['']
    });
  }

  /** Sets Recovery Payment Loan Details */
  setRecoveryRepaymentLoanDetails() {
    this.paymentTypes = this.dataObject.paymentTypeOptions;
    this.recoveryRepaymentLoanForm.patchValue({
      transactionAmount: this.dataObject.amount,
      transactionDate: new Date(this.dataObject.date)
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.recoveryRepaymentLoanForm.addControl('accountNumber', new UntypedFormControl(''));
      this.recoveryRepaymentLoanForm.addControl('checkNumber', new UntypedFormControl(''));
      this.recoveryRepaymentLoanForm.addControl('routingCode', new UntypedFormControl(''));
      this.recoveryRepaymentLoanForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.recoveryRepaymentLoanForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.recoveryRepaymentLoanForm.removeControl('accountNumber');
      this.recoveryRepaymentLoanForm.removeControl('checkNumber');
      this.recoveryRepaymentLoanForm.removeControl('routingCode');
      this.recoveryRepaymentLoanForm.removeControl('receiptNumber');
      this.recoveryRepaymentLoanForm.removeControl('bankNumber');
    }
  }

  /** Submits the recovery payment form */
  submit() {
    const recoveryRepaymentLoanFormData = this.recoveryRepaymentLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.recoveryRepaymentLoanForm.value.transactionDate;
    if (recoveryRepaymentLoanFormData.transactionDate instanceof Date) {
      recoveryRepaymentLoanFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...recoveryRepaymentLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.submitLoanActionButton(this.loanId, data, 'recoverypayment')
      .subscribe((response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
      });
  }

}
