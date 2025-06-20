/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Components */
import { SavingsAccountDetailsStepComponent } from '../../savings-account-stepper/savings-account-details-step/savings-account-details-step.component';
import { SavingsAccountTermsStepComponent } from '../../savings-account-stepper/savings-account-terms-step/savings-account-terms-step.component';
import { SavingsAccountChargesStepComponent } from '../../savings-account-stepper/savings-account-charges-step/savings-account-charges-step.component';
import { SavingsActiveClientMembersComponent } from '../../savings-account-stepper/savings-active-client-members/savings-active-client-members.component';

/** Custom Services */
import { SavingsService } from '../../savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { SavingsAccountPreviewStepComponent } from '../../savings-account-stepper/savings-account-preview-step/savings-account-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create GSIM Account Component
 */
@Component({
  selector: 'mifosx-create-gsim-account',
  templateUrl: './create-gsim-account.component.html',
  styleUrls: ['./create-gsim-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    SavingsAccountDetailsStepComponent,
    SavingsAccountTermsStepComponent,
    SavingsAccountChargesStepComponent,
    SavingsActiveClientMembersComponent,
    SavingsAccountPreviewStepComponent
  ]
})
export class CreateGsimAccountComponent {
  /** Savings Account Template */
  savingsAccountTemplate: any;
  /** Savings Account Product Template */
  savingsAccountProductTemplate: any;
  /** Table Data Source */
  dataSource: any;
  /** Selected Members */
  selectedMembers: any;

  /** Savings Account Details Step */
  @ViewChild(SavingsAccountDetailsStepComponent, { static: true })
  savingsAccountDetailsStep: SavingsAccountDetailsStepComponent;
  /** Savings Account Terms Step */
  @ViewChild(SavingsAccountTermsStepComponent, { static: true })
  savingsAccountTermsStep: SavingsAccountTermsStepComponent;
  /** Savings Account Charges Step */
  @ViewChild(SavingsAccountChargesStepComponent, { static: true })
  savingsAccountChargesStep: SavingsAccountChargesStepComponent;
  /** Savings Active Client Members */
  @ViewChild(SavingsActiveClientMembersComponent, { static: true })
  savingsActiveClientMembers: SavingsActiveClientMembersComponent;

  /**
   * Fetches savings account template from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SavingsService} savingsService Savings Service
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private savingsService: SavingsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { savingsAccountTemplate: any; groupsData: any }) => {
      this.savingsAccountTemplate = data.savingsAccountTemplate;
      this.dataSource = data.groupsData.activeClientMembers;
    });
  }

  /**
   * Sets savings account product template.
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.savingsAccountProductTemplate = $event;
  }

  /**
   * Retrieves savings account details form.
   */
  get savingsAccountDetailsForm() {
    return this.savingsAccountDetailsStep.savingsAccountDetailsForm;
  }

  /**
   * Retrieves savings account terms form.
   */
  get savingsAccountTermsForm() {
    return this.savingsAccountTermsStep.savingsAccountTermsForm;
  }

  /**
   * Retrieves savings account terms form.
   */
  get activeClientMembers() {
    return this.dataSource;
  }

  /**
   * Checks validity of overall savings account form.
   */
  get savingsAccountFormValid() {
    return (
      this.savingsAccountDetailsForm.valid &&
      this.savingsAccountTermsForm.valid &&
      this.activeClientMembers.filter((m: any) => m.selected).length > 0
    );
  }

  /**
   * Retrieves savings account object.
   */
  get savingsAccount() {
    this.selectedMembers = this.savingsActiveClientMembers.selectedClientMembers;
    return {
      ...this.savingsAccountDetailsStep.savingsAccountDetails,
      ...this.savingsAccountTermsStep.savingsAccountTerms,
      ...this.savingsAccountChargesStep.savingsAccountCharges
    };
  }

  /** Set Body for each client selected */
  setData(client: any, isParentAccount: any): any {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const monthDayFormat = 'dd MMMM';
    const data = {
      ...this.savingsAccount,
      charges: this.savingsAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount
      })),
      clientId: client.id,
      isGSIM: true,
      isParentAccount: isParentAccount,
      submittedOnDate: this.dateUtils.formatDate(this.savingsAccount.submittedOnDate, dateFormat),
      dateFormat,
      monthDayFormat,
      locale
    };
    data.groupId = this.savingsAccountTemplate.groupId;

    return data;
  }

  /** Request Body Data */
  buildRequestData(): any[] {
    const requestData = [];
    const memberSelected = this.selectedMembers.selectedMembers;
    for (let index = 0; index < 1; index++) {
      requestData.push(this.setData(memberSelected[index], true));
    }
    for (let index = 1; index < memberSelected.length; index++) {
      requestData.push(this.setData(memberSelected[index], false));
    }
    return requestData;
  }

  /**
   * Creates a new GSIM account.
   */
  submit() {
    const data = this.buildRequestData();
    const gsimData = {
      clientArray: data
    };
    this.savingsService.createGsimAcccount(gsimData).subscribe((response: any) => {
      this.router.navigate(
        [
          '../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
