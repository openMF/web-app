/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf } from '@angular/common';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

/**
 * Reject Shares Account Component
 */
@Component({
  selector: 'mifosx-reject-shares-account',
  templateUrl: './reject-shares-account.component.html',
  styleUrls: ['./reject-shares-account.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgIf,
    MatError,
    CdkTextareaAutosize,
    MatCardActions,
    MatButton,
    RouterLink,
    NgxTranslatePipe
  ]
})
export class RejectSharesAccountComponent implements OnInit {
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Reject Share Account form. */
  rejectSharesAccountForm: UntypedFormGroup;
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
  constructor(
    private formBuilder: UntypedFormBuilder,
    private sharesService: SharesService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService
  ) {
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
      rejectedDate: [
        '',
        Validators.required
      ],
      note: ['']
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
