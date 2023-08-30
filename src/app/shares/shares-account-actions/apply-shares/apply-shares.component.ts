/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Apply Shares Component
 */
@Component({
  selector: 'mifosx-apply-shares',
  templateUrl: './apply-shares.component.html',
  styleUrls: ['./apply-shares.component.scss']
})
export class ApplySharesComponent implements OnInit {

  /** Shares account data. */
  sharesAccountData: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Apply Share Account form. */
  applySharesForm: UntypedFormGroup;
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
  constructor(private formBuilder: UntypedFormBuilder,
              private sharesService: SharesService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.accountId = this.route.parent.snapshot.params['shareAccountId'];
    this.route.data.subscribe((data: { shareAccountActionData: any }) => {
      this.sharesAccountData = data.shareAccountActionData;
    });
  }

  /**
   * Creates the apply shares form.
   * Fetching data from service as action buttons malfunction
   * in clients view upon using a common resolver.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createApplySharesAccountForm();
    this.applySharesForm.get('unitPrice').patchValue(this.sharesAccountData.currentMarketPrice || '');
  }

  /**
   * Creates the apply shares form.
   */
  createApplySharesAccountForm() {
    this.applySharesForm = this.formBuilder.group({
      'requestedDate': ['', Validators.required],
      'requestedShares': ['', Validators.required],
      'unitPrice': [{value: '', disabled: true}]
    });
  }

  /**
   * Submits the form and applies additional shares to the share account,
   * if successful redirects to the share account.
   */
  submit() {
    const applySharesFormData = this.applySharesForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevRequestedDate: Date = this.applySharesForm.value.requestedDate;
    if (applySharesFormData.requestedDate instanceof Date) {
      applySharesFormData.requestedDate = this.dateUtils.formatDate(prevRequestedDate, dateFormat);
    }
    const data = {
      ...applySharesFormData,
      unitPrice: this.applySharesForm.get('unitPrice').value,
      dateFormat,
      locale
    };
    this.sharesService.executeSharesAccountCommand(this.accountId, 'applyadditionalshares', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
