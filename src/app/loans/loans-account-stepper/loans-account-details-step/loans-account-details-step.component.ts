/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { LoansService } from '../../loans.service';
import { DatePipe } from '@angular/common';

/**
 * Loans Account Details Step
 */
@Component({
  selector: 'mifosx-loans-account-details-step',
  templateUrl: './loans-account-details-step.component.html',
  styleUrls: ['./loans-account-details-step.component.scss']
})
export class LoansAccountDetailsStepComponent implements OnInit {

  /** Loans Account Template */
  @Input() loansAccountTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Product Data */
  productData: any;
  /** Loan Officer Data */
  loanOfficerOptions: any;
  /** Loan Purpose Options */
  loanPurposeOptions: any;
  /** Fund Options */
  fundOptions: any;
  /** Account Linking Options */
  accountLinkingOptions: any;
  /** For edit loan accounts form */
  isFieldOfficerPatched = false;
  /** Loans Account Details Form */
  loansAccountDetailsForm: FormGroup;

  /** Loans Account Template with product data  */
  @Output() loansAccountProductTemplate = new EventEmitter();
  /**
   * Sets loans account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loansService Loans Service.
   */
  constructor(private formBuilder: FormBuilder,
    private loansService: LoansService,
    private datePipe: DatePipe) {
    this.createLoansAccountDetailsForm();
  }

  ngOnInit() {
    this.buildDependencies();
    if (this.loansAccountTemplate) {
      this.productData = this.loansAccountTemplate.productOptions;
      if (this.loansAccountTemplate.loanProductId) {
        this.loansAccountDetailsForm.patchValue({
          'productId': this.loansAccountTemplate.loanProductId,
          'submittedOnDate': this.loansAccountTemplate.timeline.submittedOnDate && new Date(this.loansAccountTemplate.timeline.submittedOnDate),
          'loanOfficerId': this.loansAccountTemplate.loanOfficerId,
          'loanPurposeId': this.loansAccountTemplate.loanPurposeId,
          'fundId': this.loansAccountTemplate.fundId,
          'expectedDisbursementDate': this.loansAccountTemplate.timeline.expectedDisbursementDate && new Date(this.loansAccountTemplate.timeline.expectedDisbursementDate),
          'externalId': this.loansAccountTemplate.externalId
        });
      }
    }
  }

  /**
   * Creates loans account details form.
   */
  createLoansAccountDetailsForm() {
    this.loansAccountDetailsForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'loanOfficerId': [''],
      'loanPurposeId': [''],
      'fundId': [''],
      'submittedOnDate': ['', Validators.required],
      'expectedDisbursementDate': ['', Validators.required],
      'externalId': [''],
      'linkAccountId': [''],
      'createStandingInstructionAtDisbursement': ['']
    });
  }

  /**
   * Fetches loans account product template on productId value changes
   */
  buildDependencies() {
    const clientId = this.loansAccountTemplate.clientId;
    this.loansAccountDetailsForm.get('productId').valueChanges.subscribe((productId: string) => {
      this.loansService.getLoansAccountTemplateResource(clientId, productId).subscribe((response: any) => {
        this.loansAccountProductTemplate.emit(response);
        this.loanOfficerOptions = response.loanOfficerOptions;
        this.loanPurposeOptions = response.loanPurposeOptions;
        this.fundOptions = response.fundOptions;
        this.accountLinkingOptions = response.accountLinkingOptions;
        if (response.createStandingInstructionAtDisbursement) {
          this.loansAccountDetailsForm.get('createStandingInstructionAtDisbursement').patchValue(response.createStandingInstructionAtDisbursement);
        }
      });
    });
  }

  /**
   * Returns loans account details form value.
   */
  get loansAccountDetails() {
    return this.loansAccountDetailsForm.value;
  }

}
