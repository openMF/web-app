import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
  selector: 'mifosx-create-loan-provisioning',
  templateUrl: './create-loan-provisioning.component.html',
  styleUrls: ['./create-loan-provisioning.component.scss']
})
export class CreateLoanProvisioningComponent implements OnInit {

    /** Criteria form. */
    provisionCriteriaForm: FormGroup;
    /** Product form. */
    provisionProductForm: FormGroup;
    /** Standard form. */
    provisionStandardForm: FormGroup;
    /** Sub Standard form. */
    provisionSubStandardForm: FormGroup;
    /** Doubtful form. */
    provisionDoubtfulForm: FormGroup;
    /** Loss form. */
    provisionLossForm: FormGroup;
    /** Is Linear. */
    isLinear = false;
    /** Office Data */
    loanProducts: any;

    /**
     * Retrieves the offices data from `resolve`.
     * @param {FormBuilder} formBuilder Form Builder.
     * @param {OrganizationService} organizationService Organization Service.
     * @param {ActivatedRoute} route Activated Route.
     * @param {Router} router Router for navigation.
     * @param {DatePipe} datePipe Date Pipe to format date.
     */
  constructor(
    private formBuilder: FormBuilder,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.data.subscribe((data: { loanProvisioningCriteriaTemplate: any }) => {
      this.loanProducts = data.loanProvisioningCriteriaTemplate;
    });
   }

  ngOnInit() {
    this.createProvisionForm();
  }

  /**
   * Creates the Provision Form
   */
  createProvisionForm() {
    this.provisionCriteriaForm = this.formBuilder.group({
      'provisioning_criteria': ['', Validators.required],
    });

    this.provisionProductForm = this.formBuilder.group({
      'products': ['', Validators.required],
    });

    this.provisionStandardForm = this.formBuilder.group({
      'standard_min_age': ['', Validators.required],
      'standard_max_age': ['', Validators.required],
      'standard_percentage': ['', Validators.required],
      'standard_liability_account': ['', Validators.required],
      'standard_expense_account': ['', Validators.required],
    });

    this.provisionSubStandardForm = this.formBuilder.group({
      'sub_standard_min_age': ['', Validators.required],
      'sub_standard_max_age': ['', Validators.required],
      'sub_standard_percentage': ['', Validators.required],
      'sub_standard_liability_account': ['', Validators.required],
      'sub_standard_expense_account': ['', Validators.required],
    });

    this.provisionDoubtfulForm = this.formBuilder.group({
      'doubtful_min_age': ['', Validators.required],
      'doubtful_max_age': ['', Validators.required],
      'doubtful_percentage': ['', Validators.required],
      'doubtful_liability_account': ['', Validators.required],
      'doubtful_expense_account': ['', Validators.required],
    });

    this.provisionLossForm = this.formBuilder.group({
      'loss_min_age': ['', Validators.required],
      'loss_max_age': ['', Validators.required],
      'loss_percentage': ['', Validators.required],
      'loss_liability_account': ['', Validators.required],
      'loss_expense_account': ['', Validators.required],
    });

  }

  /**
   * Submit the Provision Form
   */
  submit() {
    const provisionCriteria = this.provisionCriteriaForm.get('provisioning_criteria').value;
    const products = this.provisionProductForm.get('products').value;

    const standard_min_age = this.provisionStandardForm.get('standard_min_age').value;
    const standard_max_age = this.provisionStandardForm.get('standard_max_age').value;
    const standard_percentage = this.provisionStandardForm.get('standard_percentage').value;
    const standard_liability_account = this.provisionStandardForm.get('standard_liability_account').value;
    const standard_expense_account = this.provisionStandardForm.get('standard_expense_account').value;
    const standard_object = {categoryId: 1, categoryName: 'STANDARD', minAge: standard_min_age, maxAge: standard_max_age,
                            provisioningPercentage: standard_percentage, liabilityAccount: standard_liability_account, expenseAccount: standard_expense_account};

    const sub_standard_min_age = this.provisionSubStandardForm.get('sub_standard_min_age').value;
    const sub_standard_max_age = this.provisionSubStandardForm.get('sub_standard_max_age').value;
    const sub_standard_percentage = this.provisionSubStandardForm.get('sub_standard_percentage').value;
    const sub_standard_liability_account = this.provisionSubStandardForm.get('sub_standard_liability_account').value;
    const sub_standard_expense_account = this.provisionSubStandardForm.get('sub_standard_expense_account').value;
    const sub_standard_object = {categoryId: 2, categoryName: 'SUB-STANDARD', minAge: sub_standard_min_age, maxAge: sub_standard_max_age,
                                provisioningPercentage: sub_standard_percentage, liabilityAccount: sub_standard_liability_account, expenseAccount: sub_standard_expense_account};

    const doubtful_min_age = this.provisionDoubtfulForm.get('doubtful_min_age').value;
    const doubtful_max_age = this.provisionDoubtfulForm.get('doubtful_max_age').value;
    const doubtful_percentage = this.provisionDoubtfulForm.get('doubtful_percentage').value;
    const doubtful_liability_account = this.provisionDoubtfulForm.get('doubtful_liability_account').value;
    const doubtful_expense_account = this.provisionDoubtfulForm.get('doubtful_expense_account').value;
    const doubtful_object = {categoryId: 3, categoryName: 'DOUBTFUL', minAge: doubtful_min_age, maxAge: doubtful_max_age,
                            provisioningPercentage: doubtful_percentage, liabilityAccount: doubtful_liability_account, expenseAccount: doubtful_expense_account};

    const loss_min_age = this.provisionLossForm.get('loss_min_age').value;
    const loss_max_age = this.provisionLossForm.get('loss_max_age').value;
    const loss_percentage = this.provisionLossForm.get('loss_percentage').value;
    const loss_liability_account = this.provisionLossForm.get('loss_liability_account').value;
    const loss_expense_account = this.provisionLossForm.get('loss_expense_account').value;
    const loss_object = {categoryId: 4, categoryName: 'LOSS', minAge: loss_min_age, maxAge: loss_max_age,
                        provisioningPercentage: loss_percentage, liabilityAccount: loss_liability_account, expenseAccount: loss_expense_account};

    const product_array: any = [];
    /**
     * Get selected products
     */
    for (let i = 0; i < products.length; i++) {
      const object = this.loanProducts.loanProducts.filter((x: any) => x.id === products[i])[0];
      const product_object_final = {id: object.id, name: object.name, includeInBorrowerCycle: object.includeInBorrowerCycle};
      product_array.push(product_object_final);
    }

    /**
     * Get definitions
     */
    const definitions_array: any = [];
    definitions_array.push(standard_object);
    definitions_array.push(sub_standard_object);
    definitions_array.push(doubtful_object);
    definitions_array.push(loss_object);

    const formData = {criteriaName: provisionCriteria, locale: 'en', loanProducts: product_array, definitions: definitions_array};
    this.organizationService.createProvisioningCriteria(formData).subscribe((response: any) => {
      this.reset();
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }


  /**
   * Reset Forms
   */

   reset() {
     this.provisionCriteriaForm.reset();
     this.provisionStandardForm.reset();
     this.provisionSubStandardForm.reset();
     this.provisionDoubtfulForm.reset();
     this.provisionLossForm.reset();
   }

}
