/** Angular Imports */
import { Component, ViewChild, /* Felix: added: */ QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';

/** Step Components */
import { GlimChargesStepComponent } from './glim-account-stepper/glim-charges-step/glim-charges-step.component';
import { GlimDetailsStepComponent } from './glim-account-stepper/glim-details-step/glim-details-step.component';
import { GlimTermsStepComponent } from './glim-account-stepper/glim-terms-step/glim-terms-step.component';

@Component({
  selector: 'mifosx-create-glim-account',
  templateUrl: './create-glim-account.component.html',
  styleUrls: ['./create-glim-account.component.scss']
})
export class CreateGlimAccountComponent {
  /** Imports all the step components */
  @ViewChild(GlimDetailsStepComponent, { static: true }) loansAccountDetailsStep: GlimDetailsStepComponent;
  @ViewChild(GlimTermsStepComponent, { static: true }) loansAccountTermsStep: GlimTermsStepComponent;
  @ViewChild(GlimChargesStepComponent, { static: true }) loansAccountChargesStep: GlimChargesStepComponent;

  /** Loans Account Template */
  loansAccountTemplate: any;
  /** Loans Account Product Template */
  loansAccountProductTemplate: any | null = null;
  /** Multi Disburse Loan */
  multiDisburseLoan: any;
  /** Principal Amount */
  principal: any;
  /** Currency Code */
  currencyCode: string;

  // accountLinkingOptions: any;

  // totalLoan: any;

  // /** Table Data Source */
  // dataSource: any;
  // /** Selected Members */
  selectedMembers: any;
  // /** Selected Members */
  activeClientMembers: any;
  gsimData: any;

  /**
   * Sets loans account create form.
   * @param {route} ActivatedRoute Activated Route.
   * @param {router} Router Router.
   * @param {loansService} LoansService Loans Service
   * @param {SettingsService} settingsService Settings Service
   * @param {ClientsService} clientService Client Service
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loansService: LoansService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { loansAccountTemplate: any; gsimData: any; groupsData: any }) => {
      this.loansAccountTemplate = data.loansAccountTemplate;
      this.activeClientMembers = data.groupsData.activeClientMembers;
      this.gsimData = data.gsimData;
    });
  }

  /**
   * Sets glim account product template and collateral template
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.loansAccountProductTemplate = $event;
    this.currencyCode = this.loansAccountProductTemplate.currency.code;
    const entityId = this.loansAccountTemplate.clientId
      ? this.loansAccountTemplate.clientId
      : this.loansAccountTemplate.group.id;
    const productId = this.loansAccountProductTemplate.loanProductId;
    this.loansService.getLoansAccountTemplateResource(entityId, true, productId).subscribe((response: any) => {
      this.multiDisburseLoan = response.multiDisburseLoan;
    });
  }

  /** Get Loans Account Details Form Data */
  get loansAccountDetailsForm() {
    return this.loansAccountDetailsStep.loansAccountDetailsForm;
  }

  /** Get Loans Account Terms Form Data */
  get loansAccountTermsForm() {
    return this.loansAccountTermsStep.loansAccountTermsForm;
  }

  /** Checks whether all the forms in different steps are valid or not */
  get loansAccountFormValid() {
    return (
      this.loansAccountDetailsForm.valid && this.loansAccountTermsForm.valid && this.loansAccountChargesStep.isValid
    );
  }

  /** Gets principal Amount */
  get loanPrincipal() {
    return this.loansAccountChargesStep.selectedClientMembers.selectedMembers.reduce(
      (acc: number, member: any) => acc + member.principal,
      0
    );
  }

  /** Retrieves Data of all forms except Currency to submit the data */
  get loansAccount() {
    return {
      ...this.loansAccountDetailsStep.loansAccountDetails,
      ...this.loansAccountTermsStep.loansAccountTerms,
      ...this.loansAccountChargesStep.loansAccountCharges,
      ...this.loansAccountTermsStep.disbursementData
    };
  }

  // setData(client: any): any {
  //   const locale = this.settingsService.language.code;
  //   const dateFormat = this.settingsService.dateFormat;
  //   // const monthDayFormat = 'dd MMMM';
  //   const data = {
  //     ...this.loansAccount,
  //     charges: this.loansAccount.charges.map((charge: any) => ({
  //       chargeId: charge.id,
  //       amount: charge.amount
  //     })),
  //     clientId: client.id,
  //     totalLoan: this.totalLoan,
  //     loanType: 'glim',
  //     amortizationType: 1,
  //     isParentAccount: true,
  //     principal: client.principal,
  //     syncDisbursementWithMeeting: false,
  //     expectedDisbursementDate: this.dateUtils.formatDate(this.loansAccount.expectedDisbursementDate, dateFormat),
  //     submittedOnDate: this.dateUtils.formatDate(this.loansAccount.submittedOnDate, dateFormat),
  //     dateFormat,
  //     // monthDayFormat,
  //     locale
  //   };
  //   data.groupId = this.loansAccountTemplate.group.id;

  //   return JSON.stringify(data);
  // }

  /**
   * Creates a new GLIM account.
   */
  submit() {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;

    const totalLoan = this.loanPrincipal;
    const payloadData: any[] = [];
    this.loansAccountChargesStep.selectedClientMembers.selectedMembers.forEach((member: any, index: number) => {
      this.loansAccountTemplate.clientId = member.id;
      this.loansAccountTemplate.loanPurposeId = member.loanPurposeId;
      this.loansAccountTemplate.principal = member.principal;
      this.loansAccountTemplate.totalLoan = totalLoan;

      const payload = this.loansService.buildLoanRequestPayload(
        this.loansAccount,
        this.loansAccountTemplate,
        this.loansAccountProductTemplate.calendarOptions,
        locale,
        dateFormat
      );

      payloadData.push(this.getWrapper(payload, index));
    });

    this.loansService.createGlimAccount(payloadData).subscribe((response: any) => {
      this.router.navigate(
        [
          '../',
          JSON.parse(response[0].body).glimId
        ],
        { relativeTo: this.route }
      );
    });
  }

  getWrapper(payload: any, requestId: number): any {
    return {
      body: JSON.stringify(payload),
      method: 'POST',
      relativeUrl: 'loans',
      requestId: requestId
    };
  }
}
