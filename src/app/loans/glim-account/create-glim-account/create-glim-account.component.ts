import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { GlimChargesStepComponent } from './glim-account-stepper/glim-charges-step/glim-charges-step.component';
import { GlimDetailsStepComponent } from './glim-account-stepper/glim-details-step/glim-details-step.component';
import { GlimTermsStepComponent } from './glim-account-stepper/glim-terms-step/glim-terms-step.component';

@Component({
  selector: 'mifosx-create-glim-account',
  templateUrl: './create-glim-account.component.html',
  styleUrls: ['./create-glim-account.component.scss']
})
export class CreateGlimAccountComponent implements OnInit {

  /** Imports all the step component */
  @ViewChild(GlimDetailsStepComponent, { static: true }) loansAccountDetailsStep: GlimDetailsStepComponent;
  @ViewChild(GlimTermsStepComponent, { static: true }) loansAccountTermsStep: GlimTermsStepComponent;
  @ViewChild(GlimChargesStepComponent, { static: true }) loansAccountChargesStep: GlimChargesStepComponent;

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

  accountLinkingOptions: any;

  totalLoan: any;

  /** Table Data Source */
  dataSource: any;
  /** Selected Members */
  selectedMembers: any;
  /** Selected Members */
  activeClientMembers: any;
  gsimData: any;
  /**
   * Sets loans account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loansService Loans Service.
   * @param {SettingsService} settingsService SettingsService
   */
  constructor(private route: ActivatedRoute,
    private router: Router,
    private loansService: LoansService,
    private settingsService: SettingsService,
    public dialog: MatDialog,
    private dateUtils: Dates) {
    this.route.data.subscribe((data: {loansAccountTemplate: any, gsimData: any, groupsData: any}) => {
      this.loansAccountTemplate = data.loansAccountTemplate;
      this.activeClientMembers = data.groupsData.activeClientMembers;
      this.gsimData = data.gsimData;
    });
   }

  ngOnInit(): void {
  }

  /**
   * Sets loans account product template and collateral template
   * @param {any} $event API response
   */
   setTemplate($event: any) {
    this.loansAccountProductTemplate = $event;
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
    this.selectedMembers = this.loansAccountChargesStep.selectedClientMembers;
    return {
      ...this.loansAccountDetailsStep.loansAccountDetails,
      ...this.loansAccountTermsStep.loansAccountTerms,
      ...this.loansAccountChargesStep.loansAccountCharges,
    };
  }

  setData(client: any): any {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    // const monthDayFormat = 'dd MMMM';
    const data = {
      ...this.loansAccount,
      charges: this.loansAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
      })),
      clientId: client.id,
      totalLoan: this.totalLoan,
      loanType: 'glim',
      amortizationType:	1,
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

    return JSON.stringify(data);
  }

  /** Request Body Data */
  buildRequestData(): any[] {
    const requestData = [];
    const memberSelected = this.selectedMembers.selectedMembers;
    this.totalLoanAmount();
    for (let index = 0; index < memberSelected.length; index++) {
      requestData.push({
        requestId: index.toString(),
        method : 'POST',
        relativeUrl: 'loans',
        body : this.setData( memberSelected[ index ] )
      }
      );
    }
    return requestData;
  }

  totalLoanAmount(): any {
    let total = 0;
    const memberSelected = this.selectedMembers.selectedMembers;
    for (let index = 0; index < memberSelected.length; index++) {
      total += memberSelected[index].principal;
    }
    this.totalLoan = total;
  }

  /**
   * Creates a new GSIM account.
   */
  submit() {
    const data = this.buildRequestData();
    this.loansService.createGlimAccount(data).subscribe((response: any) => {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    });
  }

}
