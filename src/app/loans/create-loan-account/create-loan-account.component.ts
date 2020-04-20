import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LoanAccountDetailsStepComponent } from '../loan-account-stepper/loan-account-details-step/loan-account-details-step.component';
import { LoanAccountChargesStepComponent } from '../loan-account-stepper/loan-account-charges-step/loan-account-charges-step.component';
import { LoanAccountTermsStepComponent } from '../loan-account-stepper/loan-account-terms-step/loan-account-terms-step.component';

import { LoansService } from '../loans.service';

@Component({
  selector: 'mifosx-create-loan-account',
  templateUrl: './create-loan-account.component.html',
  styleUrls: ['./create-loan-account.component.scss']
})
export class CreateLoanAccountComponent implements OnInit {
  @ViewChild(LoanAccountDetailsStepComponent) loanAccountDetailsStep: LoanAccountDetailsStepComponent;
  @ViewChild(LoanAccountChargesStepComponent) loanAccountChargesStep: LoanAccountChargesStepComponent;
  @ViewChild(LoanAccountTermsStepComponent) loanAccountTermsStep: LoanAccountTermsStepComponent;

  loanAccountsTemplate: any;

  constructor(private route: ActivatedRoute, private loansService: LoansService, private router: Router) {}

  ngOnInit() {
    this.route.data.subscribe((data: { loanAccountsTemplate: any }) => {
      this.loanAccountsTemplate = data.loanAccountsTemplate;
    });
  }

  get loanAccountDetailsForm() {
    return this.loanAccountDetailsStep.loanAccountDetailsForm;
  }

  get loanAccountInfo() {
    return this.loanAccountDetailsStep.loanAccountInfo;
  }

  get loanAccountTermsForm() {
    return this.loanAccountTermsStep.loanAccountTermsForm;
  }

  get loanAccountFormValid() {
    return (
      this.loanAccountDetailsForm.valid &&
      this.loanAccountTermsForm.valid &&
      (!this.loanAccountDetailsForm.pristine || !this.loanAccountTermsForm.pristine)
    );
  }

  get loanAccount() {
    return {
      ...this.loanAccountDetailsStep.loanAccountDetails,
      ...this.loanAccountTermsStep.loanAccountTerms,
      ...this.loanAccountChargesStep.loanAccountCharges
    };
  }

  submit() {
    // TODO: Update once language and date settings are setup
    const loanAccount = {
      ...this.loanAccount,
      charges: this.loanAccount.charges.map((charge: any) => ({ id: charge.id })),
      locale: 'en'
    };
    this.loansService.createLoanAccount(loanAccount).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }
}
