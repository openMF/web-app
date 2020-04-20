import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { LoansService } from '../../loans.service';

@Component({
  selector: 'mifosx-loan-account-details-step',
  templateUrl: './loan-account-details-step.component.html',
  styleUrls: ['./loan-account-details-step.component.scss']
})
export class LoanAccountDetailsStepComponent implements OnInit {
  @Input() loanAccountsTemplate: any;

  loanAccountInfo: any;
  collateralOptions: any;
  loanAccountDetailsForm: FormGroup;
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10)); // ????

  constructor(
    private formBuilder: FormBuilder,
    private loansService: LoansService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.createLoanAccountDetailsForm();
    this.onSelectionChange();
  }

  ngOnInit() {}

  createLoanAccountDetailsForm() {
    this.loanAccountDetailsForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'loanOfficerId': [''],
      'loanPurposeId': [''],
      'fundId': [''],
      'submittedOnDate': ['', Validators.required],
      'expectedDisbursementDate': ['', Validators.required],
      'externalId': [''],
      'linkAccountId': [''],
      'createStandingInstruction': ['']
    });
  }

  /**
   * Calls service for template data on product change.
   */
  onSelectionChange(): void {
    this.loanAccountDetailsForm.get('productId').valueChanges.subscribe((productId: any) => {
      const clientId = this.route.snapshot.paramMap.get('clientId');
      const groupId = this.route.snapshot.paramMap.get('groupId');
      let templateType;
      if (clientId && groupId) {
        templateType = 'jlg';
      } else if (groupId) {
        templateType = 'group';
      } else if (clientId) {
        templateType = 'individual';
      }

      let params: any = {
        activeOnly: 'true',
        templateType: templateType,
        staffInSelectedOfficeOnly: true,
        productId: productId
      };
      if (clientId) {
        params = {
          ...params,
          clientId: clientId
        };
      } else if (groupId) {
        params = {
          ...params,
          groupId: groupId
        };
      }

      this.loansService.getLoanAccountsTemplateResource(params).subscribe((data: any) => {
        this.loanAccountInfo = data;

        const loanOfficerOptions = this.loanAccountInfo.loanOfficerOptions;
        loanOfficerOptions.sort((optionA: any, optionB: any) => optionA.displayName.localeCompare(optionB.displayName));
        this.loanAccountInfo.loanOfficerOptions = loanOfficerOptions;

        const loanPurposeOptions = this.loanAccountInfo.loanPurposeOptions;
        loanPurposeOptions.sort((optionA: any, optionB: any) => optionA.name.localeCompare(optionB.name));

        this.loanAccountDetailsForm.patchValue({
          'loanPurposeId': this.loanAccountInfo.loanPurposeId,
          'fundId': this.loanAccountInfo.fundId
        });
      });

      params = {
        templateType: 'collateral',
        productId: productId,
        fields: 'id,loanCollateralOptions'
      };
      this.loansService.getLoanAccountsTemplateResource(params).subscribe((data: any) => {
        this.collateralOptions = data.loanCollateralOptions || [];
      });
    });
  }

  get loanAccountDetails() {
    return this.loanAccountDetailsForm.value;
  }
}
