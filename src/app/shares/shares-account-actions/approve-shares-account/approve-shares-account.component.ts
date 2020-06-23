/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';

/**
 * Approve Shares Account Component
 */
@Component({
  selector: 'mifosx-approve-shares-account',
  templateUrl: './approve-shares-account.component.html',
  styleUrls: ['./approve-shares-account.component.scss']
})
export class ApproveSharesAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Approve Share Account form. */
  approveSharesAccountForm: FormGroup;
  /** Shares Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SharesService} sharesService Shares Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private sharesService: SharesService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.accountId = this.route.parent.snapshot.params['shareAccountId'];
  }

  /**
   * Creates the approve shares form.
   */
  ngOnInit() {
    this.createApproveSharesAccountForm();
  }

  /**
   * Creates the approve shares account form.
   */
  createApproveSharesAccountForm() {
    this.approveSharesAccountForm = this.formBuilder.group({
      'approvedDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and approves the share account,
   * if successful redirects to the share account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevApprovedDate: Date = this.approveSharesAccountForm.value.approvedDate;
    this.approveSharesAccountForm.patchValue({
      approvedDate: this.datePipe.transform(prevApprovedDate, dateFormat),
    });
    const data = {
      ...this.approveSharesAccountForm.value,
      dateFormat,
      locale
    };
    this.sharesService.executeSharesAccountCommand(this.accountId, 'approve', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
