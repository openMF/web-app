import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from 'app/products/products.service';

@Component({
  selector: 'mifosx-loan-product-qualification-rules-step',
  templateUrl: './loan-product-qualification-rules-step.component.html',
  styleUrls: ['./loan-product-qualification-rules-step.component.scss']
})
export class LoanProductQualificationRulesStepComponent implements OnInit {
  @Input() loanProductsTemplate: any;
  @Input() loanProduct: any;
  loanTypeId: any;
  prepaidAmount: any;
  prepaidAmountCalculationType: any;
  amountCalculationTypeOptions: any;
  repaymentFrequencyTypeOptions: any;

  loanProductQualificationRuleForm: FormGroup;

  constructor(private productService: ProductsService, private formBuilder: FormBuilder, private router: Router) {
    this.productService.loanTypeId.subscribe(val => {
      this.loanTypeId = val;
    });
    this.productService.prepaidAmount.subscribe(val => {
      this.prepaidAmount = val;
    } );

    this.productService.prepaidAmountCalculationType.subscribe(val => {
      this.prepaidAmountCalculationType = val;
    } );
   }

  ngOnInit(): void {
    this.createloanProductClientEligibilityForm();
    this.amountCalculationTypeOptions = this.loanProductsTemplate.amountCalculationTypeOptions;
    this.repaymentFrequencyTypeOptions = this.loanProductsTemplate.repaymentFrequencyTypeOptions;
    if ( this.router.url.includes('edit') ) {
      this.setLoanProductClientEligibilityFormForEdit();
      // Iniitializing prepaid amount and prepaid amount calculation type for Edit page
      this.prepaidAmount = this.loanProductsTemplate.terms?.prepaidAmount;
      this.prepaidAmountCalculationType = this.loanProductsTemplate.terms?.prepaidAmountCalculationType?.id;
    }
  }
  


  get loanProductQualificationRule() {
    return { qualificationRules:  this.loanProductQualificationRuleForm.value };
  }

  createloanProductClientEligibilityForm() {
    this.loanProductQualificationRuleForm = this.formBuilder.group({
      minimumQualifiedMembers: null,
      newJoinerWindowsAfterQualification: null,
      newJoinerWindowsAfterQualificationFrequency: null,
      orderPickupWindowsAfterQualification: null,
      orderPickupWindowsAfterQualificationFrequency: null,
    });

  }

  setLoanProductClientEligibilityFormForEdit() {
    this.loanProductQualificationRuleForm.patchValue({
      minimumQualifiedMembers: this.loanProductsTemplate.qualificationRules?.minimumQualifiedMembers,
      newJoinerWindowsAfterQualification: this.loanProductsTemplate.qualificationRules?.newJoinerWindowsAfterQualification,
      newJoinerWindowsAfterQualificationFrequency: this.loanProductsTemplate.qualificationRules?.newJoinerWindowsAfterQualificationFrequency?.id,
      orderPickupWindowsAfterQualification: this.loanProductsTemplate.qualificationRules?.orderPickupWindowsAfterQualification,
      orderPickupWindowsAfterQualificationFrequency: this.loanProductsTemplate.qualificationRules?.orderPickupWindowsAfterQualificationFrequency?.id,
    });
  }
}
