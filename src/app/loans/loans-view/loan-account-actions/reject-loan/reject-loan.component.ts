/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom services. */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Reject Loan component.
 */
@Component({
  selector: 'mifosx-reject-loan',
  templateUrl: './reject-loan.component.html',
  styleUrls: ['./reject-loan.component.scss']
})
export class RejectLoanComponent implements OnInit {

  /** Loan Id. */
  loanId: any;
  /** Reject Loan form. */
  rejectLoanForm: FormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * Retrieve data from `Resolver`.
   * @param formBuilder Form Builder.
   * @param router Router.
   * @param route Activated Route.
   * @param datePipe Date Pipe.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private loanService: LoansService,
              private datePipe: DatePipe,
              private settingsService: SettingsService ) {
    this.loanId = this.route.parent.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.setRejectLoanForm();
  }

  /**
   * Set Reject Loan form.
   */
  setRejectLoanForm() {
    this.rejectLoanForm = this.formBuilder.group({
      'rejectedOnDate': [new Date(), Validators.required],
      'note': ['']
    });
  }

  /**
   * Submit Reject Loan form.
   */
  submit() {
    const rejectedOnDate = this.rejectLoanForm.value.rejectedOnDate;
    const dateFormat = this.settingsService.dateFormat;
    this.rejectLoanForm.patchValue({
      rejectedOnDate: this.datePipe.transform(rejectedOnDate, dateFormat)
    });
    const rejectForm = this.rejectLoanForm.value;
    rejectForm.locale = this.settingsService.language.code;
    rejectForm.dateFormat = dateFormat;
    this.loanService.loanActionButtons(this.loanId, 'reject', rejectForm).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }

}
