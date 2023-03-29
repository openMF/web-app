/** Angular Imports */
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from '../loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { ClientsService } from 'app/clients/clients.service';

/** Step Components */
import { LoansAccountDetailsStepComponent } from '../loans-account-stepper/loans-account-details-step/loans-account-details-step.component';
import { LoansAccountTermsStepComponent } from '../loans-account-stepper/loans-account-terms-step/loans-account-terms-step.component';
import { LoansAccountChargesStepComponent } from '../loans-account-stepper/loans-account-charges-step/loans-account-charges-step.component';
import { LoansAccountDatatableStepComponent } from '../loans-account-stepper/loans-account-datatable-step/loans-account-datatable-step.component';

/**
 * Create loans account
 */
@Component({
  selector: 'mifosx-create-loans-account',
  templateUrl: './create-loans-account.component.html',
  styleUrls: ['./create-loans-account.component.scss']
})
export class CreateLoansAccountComponent implements OnInit {

  /** Imports all the step component */
  @ViewChild(LoansAccountDetailsStepComponent, { static: true }) loansAccountDetailsStep: LoansAccountDetailsStepComponent;
  @ViewChild(LoansAccountTermsStepComponent, { static: true }) loansAccountTermsStep: LoansAccountTermsStepComponent;
  @ViewChild(LoansAccountChargesStepComponent, { static: true }) loansAccountChargesStep: LoansAccountChargesStepComponent;
  /** Get handle on dtloan tags in the template */
  @ViewChildren('dtloan') loanDatatables: QueryList<LoansAccountDatatableStepComponent>;

  /** Loans Account Template */
  loansAccountTemplate: any;
  /** Loans Account Product Template */
  loansAccountProductTemplate: any;
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
  constructor(private route: ActivatedRoute,
    private router: Router,
    private loansService: LoansService,
    private settingsService: SettingsService,
    private clientService: ClientsService
  ) {
    this.route.data.subscribe((data: { loansAccountTemplate: any }) => {
      this.loansAccountTemplate = data.loansAccountTemplate;
    });
  }

  ngOnInit() {
  }

  /**
   * Sets loans account product template and collateral template
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.loansAccountProductTemplate = $event;
    this.currencyCode = this.loansAccountProductTemplate.currency.code;
    const clientId = this.loansAccountTemplate.clientId;
    this.clientService.getCollateralTemplate(clientId).subscribe((response: any) => {
      this.collateralOptions = response;
    });
    const entityId = (this.loansAccountTemplate.clientId) ? this.loansAccountTemplate.clientId : this.loansAccountTemplate.group.id;
    const isGroup = (this.loansAccountTemplate.clientId) ? false : true;
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

  /** Checks wheter all the forms in different steps are valid or not */
  get loansAccountFormValid() {
    return (
      this.loansAccountDetailsForm.valid &&
      this.loansAccountTermsForm.valid
    );
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
    const payload = this.loansService.buildLoanRequestPayload(this.loansAccount, this.loansAccountTemplate,
      this.loansAccountProductTemplate.calendarOptions, locale, dateFormat);

    if (this.loansAccountProductTemplate.datatables && this.loansAccountProductTemplate.datatables.length > 0) {
      const datatables: any[] = [];
      this.loanDatatables.forEach((loanDatatable: LoansAccountDatatableStepComponent) => {
        datatables.push(loanDatatable.payload);
      });
      payload['datatables'] = datatables;
    }

    this.loansService.createLoansAccount(payload).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId, 'general'], { relativeTo: this.route });
    });
  }

}
