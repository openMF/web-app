/** Angular Imports */
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from '../../loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { ClientsService } from 'app/clients/clients.service';

/** Step Components */
import { LoansAccountDetailsStepComponent } from '../../loans-account-stepper/loans-account-details-step/loans-account-details-step.component';
import { LoansActiveClientMembersComponent } from '../../loans-account-stepper/loans-active-client-members/loans-active-client-members.component';
import { LoansAccountTermsStepComponent } from '../../loans-account-stepper/loans-account-terms-step/loans-account-terms-step.component';
import { LoansAccountChargesStepComponent } from '../../loans-account-stepper/loans-account-charges-step/loans-account-charges-step.component';
import { LoansAccountDatatableStepComponent } from '../../loans-account-stepper/loans-account-datatable-step/loans-account-datatable-step.component';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LoansAccountScheduleStepComponent } from '../../loans-account-stepper/loans-account-schedule-step/loans-account-schedule-step.component';
import { LoansAccountPreviewStepComponent } from '../../loans-account-stepper/loans-account-preview-step/loans-account-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-create-glim-account',
  templateUrl: './create-glim-account.component.html',
  styleUrls: ['./create-glim-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    LoansAccountDetailsStepComponent,
    LoansAccountTermsStepComponent,
    LoansAccountChargesStepComponent,
    LoansActiveClientMembersComponent,
    LoansAccountScheduleStepComponent,
    LoansAccountDatatableStepComponent,
    LoansAccountPreviewStepComponent
  ]
})
export class CreateGlimAccountComponent {
  /** Imports all the step component */
  @ViewChild(LoansAccountDetailsStepComponent, { static: true })
  loansAccountDetailsStep: LoansAccountDetailsStepComponent;
  @ViewChild(LoansAccountTermsStepComponent, { static: true }) loansAccountTermsStep: LoansAccountTermsStepComponent;
  @ViewChild(LoansAccountChargesStepComponent, { static: true })
  loansAccountChargesStep: LoansAccountChargesStepComponent;
  @ViewChild(LoansActiveClientMembersComponent, { static: true })
  loansActiveClientMembers: LoansActiveClientMembersComponent;
  /** Get handle on dtloan tags in the template */
  @ViewChildren('dtloan') loanDatatables: QueryList<LoansAccountDatatableStepComponent>;

  /** Loans Account Template */
  loansAccountTemplate: any;
  /** Loans Account Product Template */
  loansAccountProductTemplate: any | null = null;
  /** Table Data Source */
  dataSource: any;
  /** Selected Members */
  selectedMembers: any;
  /** Collateral Options */
  collateralOptions: any;
  /** Multi Disburse Loan */
  multiDisburseLoan: any;
  /** Principal Amount */
  principal: any;
  datatables: any = [];
  /** Currency Code */
  currencyCode: string;

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
    private settingsService: SettingsService,
    private clientService: ClientsService,
    private dateUtils: Dates
  ) {
    this.route.data.subscribe((data: { loansAccountTemplate: any; groupsData: any }) => {
      this.loansAccountTemplate = data.loansAccountTemplate;
      this.dataSource = data.groupsData.activeClientMembers;
    });
  }

  /**
   * Sets loans account product template and collateral template
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.loansAccountProductTemplate = $event;
    this.currencyCode = this.loansAccountProductTemplate.currency.code;
    const clientId = this.loansAccountTemplate.clientId;
    if (!!clientId) {
      this.clientService.getCollateralTemplate(clientId).subscribe((response: any) => {
        this.collateralOptions = response;
      });
    } else {
      // Fineract API doesn't have "Group Collateral Management" endpoint; from the obsolete
      // community app it appears getCollateralTemplate(clientId) is called as well, but it's not clear how
      // the clientId is selected from the clientIds that belong to the group.
      console.error('No collateral data requested from Fineract, collateral might misbehave');
    }
    const entityId = this.loansAccountTemplate.clientId
      ? this.loansAccountTemplate.clientId
      : this.loansAccountTemplate.group.id;
    const isGroup = this.loansAccountTemplate.clientId ? false : true;
    const productId = this.loansAccountProductTemplate.loanProductId;
    this.loansService.getLoansAccountTemplateResource(entityId, isGroup, productId).subscribe((response: any) => {
      this.multiDisburseLoan = response.multiDisburseLoan;
    });
    this.setDatatables();
  }

  setDatatables(): void {
    this.datatables = [];

    if (this.loansAccountProductTemplate.datatables) {
      this.loansAccountProductTemplate.datatables.forEach((datatable: any) => {
        this.datatables.push(datatable);
      });
    }
  }

  /** Get Loans Account Details Form Data */
  get loansAccountDetailsForm() {
    return this.loansAccountDetailsStep.loansAccountDetailsForm;
  }

  /** Get Loans Account Terms Form Data */
  get loansAccountTermsForm() {
    return this.loansAccountTermsStep.loansAccountTermsForm;
  }

  /**
   * Retrieves savings account terms form.
   */
  get activeClientMembers() {
    return this.dataSource;
  }

  /** Checks whether all the forms in different steps are valid or not */
  get loansAccountFormValid() {
    return (
      this.loansAccountDetailsForm.valid &&
      this.loansAccountTermsForm.valid &&
      // this.loansAccountChargesStep.isValid &&
      this.loansActiveClientMembers.isValid
    );
  }

  /** Gets principal Amount */
  get loanPrincipal() {
    return this.loansAccountTermsStep.loansAccountTermsForm.value.principal;
  }

  /** Retrieves Data of all forms except Currency to submit the data */
  get loansAccount() {
    this.selectedMembers = this.loansActiveClientMembers.selectedClientMembers;
    return {
      ...this.loansAccountDetailsStep.loansAccountDetails,
      ...this.loansAccountTermsStep.loansAccountTerms,
      ...this.loansAccountChargesStep.loansAccountCharges,
      ...this.loansAccountTermsStep.loanCollateral,
      ...this.loansAccountTermsStep.disbursementData
    };
  }

  setData(client: any, totalLoan: number): any {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    // const monthDayFormat = 'dd MMMM';
    const data = {
      ...this.loansAccount,
      charges: this.loansAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount
      })),
      clientId: client.id,
      totalLoan: totalLoan,
      loanType: 'glim',
      amortizationType: 1,
      isParentAccount: true,
      principal: client.principal,
      syncDisbursementWithMeeting: false,
      expectedDisbursementDate: this.dateUtils.formatDate(this.loansAccount.expectedDisbursementDate, dateFormat),
      submittedOnDate: this.dateUtils.formatDate(this.loansAccount.submittedOnDate, dateFormat),
      dateFormat,
      // monthDayFormat,
      locale
    };
    data.groupId = this.loansAccountTemplate.group.id;

    delete data.principalAmount;
    // TODO: 2025-03-17: Apparently (?!) unsupported for GLIM
    delete data.allowPartialPeriodInterestCalculation;
    delete data.multiDisburseLoan;
    delete data.isFloatingInterestRate;

    return JSON.stringify(data);
  }

  /** Request Body Data */
  buildRequestData(): any[] {
    const requestData = [];
    const memberSelected = this.selectedMembers.selectedMembers;
    const totalLoan = this.totalLoanAmount();
    for (let index = 0; index < memberSelected.length; index++) {
      requestData.push({
        requestId: index.toString(),
        method: 'POST',
        relativeUrl: 'loans',
        body: this.setData(memberSelected[index], totalLoan)
      });
    }
    return requestData;
  }

  totalLoanAmount(): number {
    let total = 0;
    const memberSelected = this.selectedMembers.selectedMembers;
    for (let index = 0; index < memberSelected.length; index++) {
      total += memberSelected[index].principal;
    }
    return total;
  }

  /**
   * Creates a new GLIM account.
   */
  submit() {
    const data = this.buildRequestData();
    this.loansService.createGlimAccount(data).subscribe((response: any) => {
      const body = JSON.parse(response[0].body);
      if (body.glimId) {
        this.router.navigate(
          [
            '../',
            body.glimId
          ],
          { relativeTo: this.route }
        );
      } else {
        this.notify(body, data);
      }
    });
  }

  notify(body: any, data: any) {
    let message = body.defaultUserMessage + ' ';
    while (body.errors?.length > 0) message += body.errors.pop().developerMessage + ' ';
    message += 'Data: ' + JSON.stringify(data);
    console.error(message);
  }
}
