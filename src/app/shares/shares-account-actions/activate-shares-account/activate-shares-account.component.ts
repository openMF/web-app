/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';

/**
 * Activate Shares Account Component
 */
@Component({
  selector: 'mifosx-activate-shares-account',
  templateUrl: './activate-shares-account.component.html',
  styleUrls: ['./activate-shares-account.component.scss']
})
export class ActivateSharesAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Activate Share Account form. */
  activateSharesAccountForm: FormGroup;
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
   * Creates the activate shares form.
   */
  ngOnInit() {
    this.createActivateSharesAccountForm();
  }

  /**
   * Creates the activate shares account form.
   */
  createActivateSharesAccountForm() {
    this.activateSharesAccountForm = this.formBuilder.group({
      'activatedDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and activates the share account,
   * if successful redirects to the share account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevActivatedDate: Date = this.activateSharesAccountForm.value.activatedDate;
    this.activateSharesAccountForm.patchValue({
      activatedDate: this.datePipe.transform(prevActivatedDate, dateFormat),
    });
    const data = {
      ...this.activateSharesAccountForm.value,
      dateFormat,
      locale
    };
    this.sharesService.executeSharesAccountCommand(this.accountId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
