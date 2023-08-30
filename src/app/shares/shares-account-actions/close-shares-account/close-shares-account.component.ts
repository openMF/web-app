/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

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
  closeSharesAccountForm: UntypedFormGroup;
  /** Shares Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SharesService} sharesService Shares Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private sharesService: SharesService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.accountId = this.route.parent.snapshot.params['shareAccountId'];
  }

  /**
   * Creates the close shares form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const closeSharesAccountFormData = this.closeSharesAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevClosedDate: Date = this.closeSharesAccountForm.value.closedDate;
    if (closeSharesAccountFormData.closedDate instanceof Date) {
      closeSharesAccountFormData.closedDate = this.dateUtils.formatDate(prevClosedDate, dateFormat);
    }
    const data = {
      ...closeSharesAccountFormData,
      dateFormat,
      locale
    };
    this.sharesService.executeSharesAccountCommand(this.accountId, 'close', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
