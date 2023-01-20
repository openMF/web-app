import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from 'app/products/products.service';

@Component({
  selector: 'mifosx-loan-product-client-eligibility-step',
  templateUrl: './loan-product-client-eligibility-step.component.html',
  styleUrls: ['./loan-product-client-eligibility-step.component.scss'],
})
export class LoanProductClientEligibilityStepComponent implements OnInit {
  @Input() loanProductsTemplate: any;
  @Input() loanProduct: any;

  amountCalculationTypeOptions: any;
  loanProductClientEligibilityForm: FormGroup;

  loanId: any;

  constructor( private formBuilder: FormBuilder, private router: Router, private productService: ProductsService ) {
    this.productService.loanId.subscribe(val => {
      this.loanId = val;
    });
  }

  ngOnInit(): void {

    this.loanId = this.productService.loanId;

    this.createloanProductClientEligibilityForm();
    this.amountCalculationTypeOptions = this.loanProductsTemplate.amountCalculationTypeOptions;
    if ( this.router.url.includes('edit') ) {
      this.loanProductClientEligibilityForm.patchValue({
        previouslyTakenInput: this.loanProductsTemplate.clientEligibility.previouslyTakenInput,
        previouslyNotTakenInput: this.loanProductsTemplate.clientEligibility?.previouslyNotTakenInput,
        previouslyTakenCredit: this.loanProductsTemplate.clientEligibility?.previouslyTakenCredit,
        previouslyNotTakenCredit: this.loanProductsTemplate.clientEligibility?.previouslyNotTakenCredit,
        previouslyDefaultedFrom: this.loanProductsTemplate.clientEligibility?.previouslyDefaultedFrom,
        previouslyDefaultedTo: this.loanProductsTemplate.clientEligibility?.previouslyDefaultedTo,
        minimumCreditRepaid: this.loanProductsTemplate.clientEligibility?.minimumCreditRepaid,
        minimumCreditRepaidType: this.loanProductsTemplate.clientEligibility?.minimumCreditRepaidType,
        clientGroupPreviouslyDefaulted: this.loanProductsTemplate.clientEligibility?.clientGroupPreviouslyDefaulted,
        clientGroupPreviouslyNotDefaulted: this.loanProductsTemplate.clientEligibility?.clientGroupPreviouslyNotDefaulted,
        minimumGroupCreditRepaid: this.loanProductsTemplate.clientEligibility?.minimumGroupCreditRepaid,
        minimumGroupCreditRepaidType: this.loanProductsTemplate.clientEligibility?.minimumGroupCreditRepaidType
      });
    }
  }

  createloanProductClientEligibilityForm() {
      this.loanProductClientEligibilityForm = this.formBuilder.group({
        previouslyTakenInput: null,
        previouslyNotTakenInput: null,
        previouslyTakenCredit: null,
        previouslyNotTakenCredit: null,
        previouslyDefaultedFrom: [''],
        previouslyDefaultedTo: [''],
        minimumCreditRepaid: [''],
        minimumCreditRepaidType: [''],
        clientGroupPreviouslyDefaulted: null,
        clientGroupPreviouslyNotDefaulted: null,
        minimumGroupCreditRepaid: [''],
        minimumGroupCreditRepaidType: ['']
      });

    }

  get loanProductClientEligibility() {
    const loanProductClientEligibilityFormData = {};
    for (const key in this.loanProductClientEligibilityForm?.value) {
      if (this.loanProductClientEligibilityForm.value[key]) {
        loanProductClientEligibilityFormData[key] = this.loanProductClientEligibilityForm.value[key];
      }
    }

    return { clientEligibility: loanProductClientEligibilityFormData };
  }
}
