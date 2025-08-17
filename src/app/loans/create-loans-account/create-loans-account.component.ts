/** Angular Imports */
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from '@fineract/client';
import { SettingsService } from 'app/settings/settings.service';
import { CollateralManagementService } from '@fineract/client';
import { Dates } from 'app/core/utils/dates';

/** Step Components */
import { LoansAccountDetailsStepComponent } from '../loans-account-stepper/loans-account-details-step/loans-account-details-step.component';
import { LoansAccountTermsStepComponent } from '../loans-account-stepper/loans-account-terms-step/loans-account-terms-step.component';
import { LoansAccountChargesStepComponent } from '../loans-account-stepper/loans-account-charges-step/loans-account-charges-step.component';
import { LoansAccountDatatableStepComponent } from '../loans-account-stepper/loans-account-datatable-step/loans-account-datatable-step.component';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LoansAccountScheduleStepComponent } from '../loans-account-stepper/loans-account-schedule-step/loans-account-schedule-step.component';
import { LoansAccountPreviewStepComponent } from '../loans-account-stepper/loans-account-preview-step/loans-account-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create loans account
 */
@Component({
  selector: 'mifosx-create-loans-account',
  templateUrl: './create-loans-account.component.html',
  styleUrls: ['./create-loans-account.component.scss'],
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
    LoansAccountScheduleStepComponent,
    LoansAccountDatatableStepComponent,
    LoansAccountPreviewStepComponent
  ]
})
export class CreateLoansAccountComponent {
  /** Imports all the step component */
  @ViewChild(LoansAccountDetailsStepComponent, { static: true })
  loansAccountDetailsStep: LoansAccountDetailsStepComponent;
  @ViewChild(LoansAccountTermsStepComponent, { static: true }) loansAccountTermsStep: LoansAccountTermsStepComponent;
  @ViewChild(LoansAccountChargesStepComponent, { static: true })
  loansAccountChargesStep: LoansAccountChargesStepComponent;
  /** Get handle on dtloan tags in the template */
  @ViewChildren('dtloan') loanDatatables: QueryList<LoansAccountDatatableStepComponent>;

  /** Loans Account Template */
  loansAccountTemplate: any;
  /** Loans Account Product Template */
  loansAccountProductTemplate: any | null = null;
  /** Collateral Options */
  collateralOptions: any;
  /** Multi Disburse Loan */
  multiDisburseLoan: any;
  /** Principal Amount */
  principal: any;
  datatables: any = [];
  /** Currency Code */
  currencyCode: string;
  /** Date utils */
  dateUtils: Dates;

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
    private collateralManagementService: CollateralManagementService
  ) {
    this.dateUtils = new Dates(this.settingsService.dateFormat);
    this.route.data.subscribe((data: { loansAccountTemplate: any }) => {
      this.loansAccountTemplate = data.loansAccountTemplate;
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
      // Use CollateralManagementService from OpenAPI client
      // Assuming you have injected collateralManagementService: CollateralManagementService
      this.collateralManagementService.getCollateralTemplate().subscribe((response: any) => {
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
    this.loansService
      .template10({
        clientId: isGroup ? undefined : entityId,
        groupId: isGroup ? entityId : undefined,
        productId: productId,
        templateType: isGroup ? 'group' : 'individual',
        staffInSelectedOfficeOnly: true,
        activeOnly: true
      })
      .subscribe((response: any) => {
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

  /** Checks wheter all the forms in different steps are valid or not */
  get loansAccountFormValid() {
    return this.loansAccountDetailsForm.valid && this.loansAccountTermsForm.valid;
  }

  get loansSavingsAccountLinked() {
    return this.loansAccountDetailsStep.loansAccountDetailsForm.get('linkAccountId').value;
  }

  /** Gets principal Amount */
  get loanPrincipal() {
    return this.loansAccountTermsStep.loansAccountTermsForm.value.principal;
  }

  /** Retrieves Data of all forms except Currency to submit the data */
  get loansAccount() {
    return {
      ...this.loansAccountDetailsStep.loansAccountDetails,
      ...this.loansAccountTermsStep.loansAccountTerms,
      ...this.loansAccountChargesStep.loansAccountCharges,
      ...this.loansAccountTermsStep.loanCollateral,
      ...this.loansAccountTermsStep.disbursementData
    };
  }

  /**
   * Submits Data to create loan account
   */
  submit() {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const payload = this.buildLoanRequestPayload(
      this.loansAccount,
      this.loansAccountTemplate,
      this.loansAccountProductTemplate.calendarOptions,
      locale,
      dateFormat
    );

    if (this.loansAccountProductTemplate.datatables && this.loansAccountProductTemplate.datatables.length > 0) {
      const datatables: any[] = [];
      this.loanDatatables.forEach((loanDatatable: LoansAccountDatatableStepComponent) => {
        datatables.push(loanDatatable.payload);
      });
      payload['datatables'] = datatables;
    }

    this.loansService
      .calculateLoanScheduleOrSubmitLoanApplication({
        postLoansRequest: payload
      })
      .subscribe((response: any) => {
        this.router.navigate(
          [
            '../',
            response.resourceId,
            'general'
          ],
          { relativeTo: this.route }
        );
      });
  }

  /**
   * Build loan request payload (copied from original loans.service.ts)
   */
  private buildLoanRequestPayload(
    loansAccount: any,
    loansAccountTemplate: any,
    calendarOptions: any,
    locale: string,
    dateFormat: string
  ): any {
    const loansAccountData = {
      ...loansAccount,
      charges: loansAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
        dueDate: charge.dueDate && this.dateUtils.formatDate(charge.dueDate, dateFormat)
      })),
      disbursementData: loansAccount.disbursementData.map((item: any) => ({
        expectedDisbursementDate: this.dateUtils.formatDate(item.expectedDisbursementDate, dateFormat),
        principal: item.principal
      })),
      interestChargedFromDate: this.dateUtils.formatDate(loansAccount.interestChargedFromDate, dateFormat),
      repaymentsStartingFromDate: this.dateUtils.formatDate(loansAccount.repaymentsStartingFromDate, dateFormat),
      submittedOnDate: this.dateUtils.formatDate(loansAccount.submittedOnDate, dateFormat),
      expectedDisbursementDate: this.dateUtils.formatDate(loansAccount.expectedDisbursementDate, dateFormat),
      dateFormat,
      locale
    };

    if (loansAccount.collateral) {
      loansAccountData.collateral = loansAccount.collateral.map((collateralEle: any) => ({
        clientCollateralId: collateralEle.type.collateralId,
        quantity: collateralEle.value
      }));
    }

    if (loansAccountTemplate.clientId && loansAccountTemplate.group?.id) {
      loansAccountData.clientId = loansAccountTemplate.clientId;
      loansAccountData.groupId = loansAccountTemplate.group.id;
      loansAccountData.loanType = 'glim';
    } else if (loansAccountTemplate.clientId) {
      loansAccountData.clientId = loansAccountTemplate.clientId;
      loansAccountData.loanType = 'individual';
    } else {
      loansAccountData.groupId = loansAccountTemplate.group.id;
      loansAccountData.loanType = 'group';
    }

    if (loansAccountData.syncRepaymentsWithMeeting) {
      loansAccountData.calendarId = calendarOptions[0].id;
      delete loansAccountData.syncRepaymentsWithMeeting;
    }

    if (loansAccountData.recalculationRestFrequencyDate) {
      loansAccountData.recalculationRestFrequencyDate = this.dateUtils.formatDate(
        loansAccount.recalculationRestFrequencyDate,
        dateFormat
      );
    }

    if (loansAccountData.interestCalculationPeriodType === 0) {
      loansAccountData.allowPartialPeriodInterestCalculation = false;
    }
    if (!(loansAccountData.isFloatingInterestRate === false)) {
      delete loansAccountData.isFloatingInterestRate;
    }
    if (!loansAccountData.multiDisburseLoan) {
      delete loansAccountData.disbursementData;
    }
    delete loansAccountData.isValid;
    loansAccountData.principal = loansAccountData.principalAmount;
    delete loansAccountData.principalAmount;
    delete loansAccountData.multiDisburseLoan; // this was just added so that disbursement data can be send in the backend

    // In Fineract, the POST and PUT endpoints for /v1/loans have a typo in the field
    // allowPartialPeriodInterestCalculation. Until that is fixed, we need to replace the field name in the payload.
    loansAccountData.allowPartialPeriodInterestCalcualtion = loansAccountData.allowPartialPeriodInterestCalculation;
    delete loansAccountData.allowPartialPeriodInterestCalculation;
    return loansAccountData;
  }
}
