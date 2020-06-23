/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';

/**
 * Reject Shares Account Component
 */
@Component({
  selector: 'mifosx-reject-shares-account',
  templateUrl: './reject-shares-account.component.html',
  styleUrls: ['./reject-shares-account.component.scss']
})
export class RejectSharesAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Reject Share Account form. */
  rejectSharesAccountForm: FormGroup;
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
   * Creates the reject shares form.
   */
  ngOnInit() {
    this.createRejectSharesAccountForm();
  }

  /**
   * Creates the reject shares account form.
   */
  createRejectSharesAccountForm() {
    this.rejectSharesAccountForm = this.formBuilder.group({
      'rejectedDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and rejects the share account,
   * if successful redirects to the share account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevRejectedDate: Date = this.rejectSharesAccountForm.value.rejectedDate;
    this.rejectSharesAccountForm.patchValue({
      rejectedDate: this.datePipe.transform(prevRejectedDate, dateFormat),
    });
    const data = {
      ...this.rejectSharesAccountForm.value,
      dateFormat,
      locale
    };
    this.sharesService.executeSharesAccountCommand(this.accountId, 'reject', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
