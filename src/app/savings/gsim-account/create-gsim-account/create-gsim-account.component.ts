/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Components */
import { SavingsAccountDetailsStepComponent } from '../../savings-account-stepper/savings-account-details-step/savings-account-details-step.component';
import { SavingsAccountTermsStepComponent } from '../../savings-account-stepper/savings-account-terms-step/savings-account-terms-step.component';
import { SavingsAccountChargesStepComponent } from '../../savings-account-stepper/savings-account-charges-step/savings-account-charges-step.component';

/** Custom Services */
import { SavingsService } from '../../savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Create GSIM Account Component
 */
@Component({
  selector: 'mifosx-create-gsim-account',
  templateUrl: './create-gsim-account.component.html',
  styleUrls: ['./create-gsim-account.component.scss']
})

export class CreateGsimAccountComponent implements OnInit {

  /** Savings Account Template */
  savingsAccountTemplate: any;
  /** Savings Account Product Template */
  savingsAccountProductTemplate: any;
  /** Table Data Source */
  dataSource: any;
  /** Selected Members */
  selectedMembers: any;

  /** Savings Account Details Step */
  @ViewChild(SavingsAccountDetailsStepComponent, { static: true }) savingsAccountDetailsStep: SavingsAccountDetailsStepComponent;
  /** Savings Account Terms Step */
  @ViewChild(SavingsAccountTermsStepComponent, { static: true }) savingsAccountTermsStep: SavingsAccountTermsStepComponent;
  /** Savings Account Charges Step */
  @ViewChild(SavingsAccountChargesStepComponent, { static: true }) savingsAccountChargesStep: SavingsAccountChargesStepComponent;

  /**
   * Fetches savings account template from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SavingsService} savingsService Savings Service
   * @param {SettingsService} settingsService Settings Service
   */
   constructor(private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private savingsService: SavingsService,
              private settingsService: SettingsService
              ) {
      this.route.data.subscribe((data: { savingsAccountTemplate: any, groupsData: any }) => {
      this.savingsAccountTemplate = data.savingsAccountTemplate;
      this.dataSource = data.groupsData.activeClientMembers;
    });
  }

  ngOnInit(): void {
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
      this.savingsAccountTermsForm.valid
    );
  }

  /**
   * Retrieves savings account object.
   */
  get savingsAccount() {
    this.selectedMembers = this.savingsAccountChargesStep.selectedClientMembers;
    return {
      ...this.savingsAccountDetailsStep.savingsAccountDetails,
      ...this.savingsAccountTermsStep.savingsAccountTerms,
      ...this.savingsAccountChargesStep.savingsAccountCharges
    };
  }

  /** Set Body for each client selected */
  setData(client: any): any {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const monthDayFormat = 'dd MMMM';
    const data = {
      ...this.savingsAccount,
      charges: this.savingsAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
      })),
      clientId: client.id,
      isGSIM: true,
      isParentAccount: true,
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
      requestData.push(
        this.setData( memberSelected[ index ] ),
      );
    }
    return requestData;
  }

  /**
   * Creates a new GSIM account.
   */
  submit() {
    const data = this.buildRequestData();
    const gsimData = {
      clientArray: data,
    };
    this.savingsService.createGsimAcccount(gsimData).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
