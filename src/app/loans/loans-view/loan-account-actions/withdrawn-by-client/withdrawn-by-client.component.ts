/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Withdrawn By Applicant Loan Form
 */
@Component({
  selector: 'mifosx-withdrawn-by-client',
  templateUrl: './withdrawn-by-client.component.html',
  styleUrls: ['./withdrawn-by-client.component.scss']
})
export class WithdrawnByClientComponent implements OnInit {

  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Withdrawn By Applicant Loan Form */
  withdrawnByClientLoanForm: UntypedFormGroup;

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
   * Creates the withdraw by Applicant loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createWithdrawnByClientLoanForm();
  }

  /**
   * Creates the create withdraw by applicant form.
   */
  createWithdrawnByClientLoanForm() {
    this.withdrawnByClientLoanForm = this.formBuilder.group({
      'withdrawnOnDate': [new Date(), Validators.required],
      'note': ''
    });
  }

  /** Submits the withdraw by appplicant form */
  submit() {
    const withdrawnByClientLoanFormData = this.withdrawnByClientLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.withdrawnByClientLoanForm.value.withdrawnOnDate;
    if (withdrawnByClientLoanFormData.withdrawnOnDate instanceof Date) {
      withdrawnByClientLoanFormData.withdrawnOnDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...withdrawnByClientLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.loanActionButtons(this.loanId, 'withdrawnByApplicant', data)
      .subscribe((response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
      });
  }

}
