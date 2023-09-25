/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

@Component({
  selector: 'mifosx-loans-account-close',
  templateUrl: './loans-account-close.component.html',
  styleUrls: ['./loans-account-close.component.scss']
})
export class LoansAccountCloseComponent implements OnInit {

  @Input() dataObject: any;

  /** Close form. */
  closeLoanForm: UntypedFormGroup;
  /** Loan Id */
  loanId: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} systemService Loan Service.
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
   * Creates the close form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createCloseForm();
  }

  /**
   * Creates the create close form.
   */
  createCloseForm() {
    this.closeLoanForm = this.formBuilder.group({
      'transactionDate': [new Date(this.dataObject.date) || new Date(), Validators.required],
      'note': []
    });
  }

  /**
   * Submits the close form and creates a close,
   * if successful redirects to view created close.
   */
  submit() {
    const closeLoanFormData = this.closeLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const preTransactionDate = this.closeLoanForm.value.transactionDate;
    if (closeLoanFormData.transactionDate instanceof Date) {
      closeLoanFormData.transactionDate = this.dateUtils.formatDate(preTransactionDate, dateFormat);
    }
    const data = {
      ...closeLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.submitLoanActionButton(this.loanId, data, 'close')
      .subscribe((response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }

}
