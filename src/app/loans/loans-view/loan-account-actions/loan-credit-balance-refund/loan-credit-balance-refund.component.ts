import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-loan-credit-balance-refund',
  templateUrl: './loan-credit-balance-refund.component.html',
  styleUrls: ['./loan-credit-balance-refund.component.scss']
})
export class LoanCreditBalanceRefundComponent implements OnInit {

  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Credit Balance Loan Form */
  creditBalanceLoanForm: FormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: FormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService) {
      this.loanId = this.route.snapshot.params['loanId'];
    }

  /**
   * Creates the Credit Balance loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createCreditBalanceLoanForm();
    this.setCreditBalanceLoanDetails();
  }

  /**
   * Creates the create close form.
   */
  createCreditBalanceLoanForm() {
    this.creditBalanceLoanForm = this.formBuilder.group({
      'transactionDate': [new Date(), Validators.required],
      'transactionAmount': ['', Validators.required],
      'externalId': '',
      'note': ''
    });
  }

  setCreditBalanceLoanDetails() {
    this.creditBalanceLoanForm.patchValue({
      transactionAmount: this.dataObject.amount
    });
  }

  /** Submits the Credit Balance form */
  submit() {
    const creditBalanceLoanFormData = this.creditBalanceLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.creditBalanceLoanForm.value.transactionDate;
    if (creditBalanceLoanFormData.transactionDate instanceof Date) {
      creditBalanceLoanFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...creditBalanceLoanFormData,
      dateFormat,
      locale
    };
    const command = this.dataObject.type.code.split('.')[1];
    this.loanService.submitLoanActionButton(this.loanId, data, command)
      .subscribe((response: any) => {
        this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }

}
