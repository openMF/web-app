/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Components */
import { SharesAccountDetailsStepComponent } from '../shares-account-stepper/shares-account-details-step/shares-account-details-step.component';
import { SharesAccountTermsStepComponent } from '../shares-account-stepper/shares-account-terms-step/shares-account-terms-step.component';
import { SharesAccountChargesStepComponent } from '../shares-account-stepper/shares-account-charges-step/shares-account-charges-step.component';

/** Custom Services */
import { SharesService } from '../shares.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Edit Shares Account Component
 */
@Component({
  selector: 'mifosx-edit-shares-account',
  templateUrl: './edit-shares-account.component.html',
  styleUrls: ['./edit-shares-account.component.scss']
})
export class EditSharesAccountComponent {

  /** Shares Account and Template */
  sharesAccountAndTemplate: any;
  /** Shares Account Product Template */
  sharesAccountProductTemplate: any;

  /** Shares Account Details Step */
  @ViewChild(SharesAccountDetailsStepComponent, { static: true }) sharesAccountDetailsStep: SharesAccountDetailsStepComponent;
  /** Shares Account Terms Step */
  @ViewChild(SharesAccountTermsStepComponent, { static: true }) sharesAccountTermsStep: SharesAccountTermsStepComponent;
  /** Shares Account Charges Step */
  @ViewChild(SharesAccountChargesStepComponent, { static: true }) sharesAccountChargesStep: SharesAccountChargesStepComponent;

  /**
   * Fetches shares account template from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SharesService} sharesService Shares Service
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private sharesService: SharesService,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { sharesAccountAndTemplate: any }) => {
      this.sharesAccountAndTemplate = data.sharesAccountAndTemplate;
    });
  }

  /**
   * Sets shares account product template.
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.sharesAccountProductTemplate = $event;
  }

  /**
   * Retrieves shares account details form.
   */
  get sharesAccountDetailsForm() {
    return this.sharesAccountDetailsStep.sharesAccountDetailsForm;
  }

  /**
   * Retrieves shares account terms form.
   */
  get sharesAccountTermsForm() {
    return this.sharesAccountTermsStep.sharesAccountTermsForm;
  }

  /**
   * Checks validity and pristinity of overall shares account form .
   */
  get sharesAccountFormValidAndNotPristine() {
    return (
      this.sharesAccountDetailsForm.valid &&
      this.sharesAccountTermsForm.valid &&
      (
        !this.sharesAccountDetailsForm.pristine ||
        !this.sharesAccountTermsForm.pristine ||
        !this.sharesAccountChargesStep.pristine
      )
    );
  }

  /**
   * Retrieves shares account object.
   */
  get sharesAccount() {
    return {
      ...this.sharesAccountDetailsStep.sharesAccountDetails,
      ...this.sharesAccountTermsStep.sharesAccountTerms,
      ...this.sharesAccountChargesStep.sharesAccountCharges
    };
  }

  /**
   * Updates a share account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const sharesAccount = {
      ...this.sharesAccount,
      clientId: this.sharesAccountAndTemplate.clientId,
      charges: this.sharesAccount.charges.map((charge: any) => ({ chargeId: charge.chargeId, amount: charge.amount })),
      applicationDate: this.dateUtils.formatDate(this.sharesAccount.applicationDate, dateFormat),
      submittedDate: this.dateUtils.formatDate(this.sharesAccount.submittedDate, dateFormat),
      unitPrice: this.sharesAccountTermsForm.get('unitPrice').value,
      dateFormat,
      locale
    };
    this.sharesService.updateSharesAccount(this.sharesAccountAndTemplate.id , sharesAccount).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
