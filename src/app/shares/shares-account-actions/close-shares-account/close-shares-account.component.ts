/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';

/**
 * Close Shares Account Component
 */
@Component({
  selector: 'mifosx-close-shares-account',
  templateUrl: './close-shares-account.component.html',
  styleUrls: ['./close-shares-account.component.scss']
})
export class CloseSharesAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Close Share Account form. */
  closeSharesAccountForm: FormGroup;
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
   * Creates the close shares form.
   */
  ngOnInit() {
    this.createCloseSharesAccountForm();
  }

  /**
   * Creates the close shares account form.
   */
  createCloseSharesAccountForm() {
    this.closeSharesAccountForm = this.formBuilder.group({
      'closedDate': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Submits the form and closes the share account,
   * if successful redirects to the share account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevClosedDate: Date = this.closeSharesAccountForm.value.closedDate;
    this.closeSharesAccountForm.patchValue({
      closedDate: this.datePipe.transform(prevClosedDate, dateFormat),
    });
    const data = {
      ...this.closeSharesAccountForm.value,
      dateFormat,
      locale
    };
    this.sharesService.executeSharesAccountCommand(this.accountId, 'close', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
