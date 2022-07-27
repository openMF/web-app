/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

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
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: FormBuilder,
              private sharesService: SharesService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.accountId = this.route.parent.snapshot.params['shareAccountId'];
  }

  /**
   * Creates the reject shares form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const rejectSharesAccountFormData = this.rejectSharesAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevRejectedDate: Date = this.rejectSharesAccountForm.value.rejectedDate;
    if (rejectSharesAccountFormData.rejectedDate instanceof Date) {
      rejectSharesAccountFormData.rejectedDate = this.dateUtils.formatDate(prevRejectedDate, dateFormat);
    }
    const data = {
      ...rejectSharesAccountFormData,
      dateFormat,
      locale
    };
    this.sharesService.executeSharesAccountCommand(this.accountId, 'reject', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
