/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

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
  activateSharesAccountForm: UntypedFormGroup;
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
   * Creates the activate shares form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const activateSharesAccountFormData = this.activateSharesAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActivatedDate: Date = this.activateSharesAccountForm.value.activatedDate;
    if (activateSharesAccountFormData.activatedDate instanceof Date) {
      activateSharesAccountFormData.activatedDate = this.dateUtils.formatDate(prevActivatedDate, dateFormat);
    }
    const data = {
      ...activateSharesAccountFormData,
      dateFormat,
      locale
    };
    this.sharesService.executeSharesAccountCommand(this.accountId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
