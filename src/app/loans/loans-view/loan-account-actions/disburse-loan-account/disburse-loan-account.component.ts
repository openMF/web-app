/** Angular Imports. */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Service. */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Disburse To Savings component.
 */
@Component({
  selector: 'mifosx-disburse-loan-account',
  templateUrl: './disburse-loan-account.component.html',
  styleUrls: ['./disburse-loan-account.component.scss']
})
export class DisburseLoanAccountComponent implements OnInit {

  @Input() dataObject: any;

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Disbursement Loan form. */
  disbursementForm: UntypedFormGroup;

  /**
   * Get data from `Resolver`.
   * @param {FormBuilder} formBuilder FormBuilder.
   * @param {ActivatedRoute} route ActivatedRoute.
   * @param {Router} router Router.
   * @param {LoansService} loanService Loan Service.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private loanService: LoansService,
              private settingsService: SettingsService) { }

  ngOnInit() {
    this.setDisbursementToSavingsForm();
  }

  /**
   * Set Disbursement Loan form.
   */
  setDisbursementToSavingsForm() {
    this.disbursementForm = this.formBuilder.group({
      'actualDisbursementDate': [new Date(), Validators.required],
      'transactionAmount': [this.dataObject.amount, Validators.required],
      'note': ['', Validators.required]
    });
    if (this.dataObject.fixedEmiAmount !== null || this.dataObject.fixedEmiAmount !== undefined) {
      this.disbursementForm.addControl('fixedEmiAmount', new UntypedFormControl(this.dataObject.fixedEmiAmount, [Validators.required]));
    }
  }

  /**
   * Submit Disburse Form.
   */
  submit() {
    const disbursementLoanFormData = this.disbursementForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActualDisbursementDate: Date = this.disbursementForm.value.actualDisbursementDate;
    if (disbursementLoanFormData.actualDisbursementDate instanceof Date) {
      disbursementLoanFormData.actualDisbursementDate = this.dateUtils.formatDate(prevActualDisbursementDate, dateFormat);
    }
    const data = {
      ...disbursementLoanFormData,
      dateFormat,
      locale
    };
    const loanId = this.route.parent.snapshot.params['loanId'];
    this.loanService.loanActionButtons(loanId, 'disbursetosavings', data).subscribe((response: any) => {
      this.router.navigate(['../../general'], {relativeTo: this.route});
    });
  }

}
