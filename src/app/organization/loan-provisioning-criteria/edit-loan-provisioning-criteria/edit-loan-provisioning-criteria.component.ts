import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-edit-loan-provisioning-criteria',
  templateUrl: './edit-loan-provisioning-criteria.component.html',
  styleUrls: ['./edit-loan-provisioning-criteria.component.scss']
})
export class EditLoanProvisioningCriteriaComponent implements OnInit {

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
   /** Provisioning Data. */
   loanProvisioningTemplate: any;
   /** Selected Products. */
   selectedProducts: any = [];
   /** Not Selected Products. */
   refusalProducts: any;

   /**
    * Retrieves the offices data from `resolve`.
    * @param {FormBuilder} formBuilder Form Builder.
    * @param {OrganizationService} organizationService Organization Service.
    * @param {ActivatedRoute} route Activated Route.
    * @param {Router} router Router for navigation.
    */

  constructor(
    private formBuilder: FormBuilder,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.data.subscribe((data: { selectedLoanProvisioning: any }) => {
      this.loanProvisioningTemplate = data.selectedLoanProvisioning;
      this.loanProvisioningTemplate.definitions = this.loanProvisioningTemplate.definitions.sort((x: any, y: any) => {if (x.categoryId > y.categoryId) { return 1; }if (x.categoryId < y.categoryId) { return -1; }return 0; });
    });
  }

  ngOnInit() {
    this.loadProvisionForm();
  }

  /**
   * Load the Provision Form.
   */

  loadProvisionForm() {
    this.provisionCriteriaForm = this.formBuilder.group({
      'provisioning_criteria': [this.loanProvisioningTemplate.criteriaName, Validators.required],
    });

    this.provisionProductForm = this.formBuilder.group({
      'products': [this.loanProvisioningTemplate.selectedLoanProducts[0]],
      'selectedProducts': ['']
    });

    this.provisionStandardForm = this.formBuilder.group({
      'standard_min_age': [this.loanProvisioningTemplate.definitions[0].minAge, Validators.required],
      'standard_max_age': [this.loanProvisioningTemplate.definitions[0].maxAge, Validators.required],
      'standard_percentage': [this.loanProvisioningTemplate.definitions[0].provisioningPercentage, Validators.required],
      'standard_liability_account': [this.loanProvisioningTemplate.definitions[0].liabilityAccount, Validators.required],
      'standard_expense_account': [this.loanProvisioningTemplate.definitions[0].expenseAccount, Validators.required],
    });

    this.provisionSubStandardForm = this.formBuilder.group({
      'sub_standard_min_age': [this.loanProvisioningTemplate.definitions[1].minAge, Validators.required],
      'sub_standard_max_age': [this.loanProvisioningTemplate.definitions[1].maxAge, Validators.required],
      'sub_standard_percentage': [this.loanProvisioningTemplate.definitions[1].provisioningPercentage, Validators.required],
      'sub_standard_liability_account': [this.loanProvisioningTemplate.definitions[1].liabilityAccount, Validators.required],
      'sub_standard_expense_account': [this.loanProvisioningTemplate.definitions[1].expenseAccount, Validators.required],
    });

    this.provisionDoubtfulForm = this.formBuilder.group({
      'doubtful_min_age': [this.loanProvisioningTemplate.definitions[2].minAge, Validators.required],
      'doubtful_max_age': [this.loanProvisioningTemplate.definitions[2].maxAge, Validators.required],
      'doubtful_percentage': [this.loanProvisioningTemplate.definitions[2].provisioningPercentage, Validators.required],
      'doubtful_liability_account': [this.loanProvisioningTemplate.definitions[2].liabilityAccount, Validators.required],
      'doubtful_expense_account': [this.loanProvisioningTemplate.definitions[2].expenseAccount, Validators.required],
    });

    this.provisionLossForm = this.formBuilder.group({
      'loss_min_age': [this.loanProvisioningTemplate.definitions[3].minAge, Validators.required],
      'loss_max_age': [this.loanProvisioningTemplate.definitions[3].maxAge, Validators.required],
      'loss_percentage': [this.loanProvisioningTemplate.definitions[3].provisioningPercentage, Validators.required],
      'loss_liability_account': [this.loanProvisioningTemplate.definitions[3].liabilityAccount, Validators.required],
      'loss_expense_account': [this.loanProvisioningTemplate.definitions[3].expenseAccount, Validators.required],
    });

    /** Load selected products to selectedProducts array. */
    for (let i = 0; i < this.loanProvisioningTemplate.selectedLoanProducts.length; i++) {
      this.selectedProducts.push(this.loanProvisioningTemplate.selectedLoanProducts[i]);
    }

    /** Load all refusal products. */
    this.refusalProducts = this.loanProvisioningTemplate.loanProducts.filter((x: any) => this.selectedProducts.some((prod: any) => prod.id !== x.id));
  }

  /**
   * Edit Provisioning Form.
   */
  editLoanProvisioning() {
    const provisionCriteria = this.provisionCriteriaForm.get('provisioning_criteria').value;
    const products = this.selectedProducts;

    const standard_min_age = this.provisionStandardForm.get('standard_min_age').value;
    const standard_max_age = this.provisionStandardForm.get('standard_max_age').value;
    const standard_percentage = this.provisionStandardForm.get('standard_percentage').value;
    const standard_liability_account = this.provisionStandardForm.get('standard_liability_account').value;
    const standard_expense_account = this.provisionStandardForm.get('standard_expense_account').value;
    const standard_object = {id: this.loanProvisioningTemplate.definitions[0].id, categoryId: 1, categoryName: 'STANDARD', minAge: standard_min_age, maxAge: standard_max_age,
                            provisioningPercentage: standard_percentage, liabilityAccount: standard_liability_account,
                            liabilityCode: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === standard_liability_account))[0].glCode,
                            liabilityName: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === standard_liability_account))[0].name, expenseAccount: standard_expense_account,
                            expenseCode: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === standard_expense_account))[0].glCode,
                            expenseName: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === standard_expense_account))[0].name};

    const sub_standard_min_age = this.provisionSubStandardForm.get('sub_standard_min_age').value;
    const sub_standard_max_age = this.provisionSubStandardForm.get('sub_standard_max_age').value;
    const sub_standard_percentage = this.provisionSubStandardForm.get('sub_standard_percentage').value;
    const sub_standard_liability_account = this.provisionSubStandardForm.get('sub_standard_liability_account').value;
    const sub_standard_expense_account = this.provisionSubStandardForm.get('sub_standard_expense_account').value;
    const sub_standard_object = {id: this.loanProvisioningTemplate.definitions[1].id, categoryId: 2, categoryName: 'SUB-STANDARD', minAge: sub_standard_min_age, maxAge: sub_standard_max_age,
                                provisioningPercentage: sub_standard_percentage, liabilityAccount: sub_standard_liability_account,
                                liabilityCode: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === sub_standard_liability_account))[0].glCode,
                                liabilityName: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === sub_standard_liability_account))[0].name,
                                expenseAccount: sub_standard_expense_account,
                                expenseCode: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === sub_standard_expense_account))[0].glCode,
                                expenseName: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === sub_standard_expense_account))[0].name};

    const doubtful_min_age = this.provisionDoubtfulForm.get('doubtful_min_age').value;
    const doubtful_max_age = this.provisionDoubtfulForm.get('doubtful_max_age').value;
    const doubtful_percentage = this.provisionDoubtfulForm.get('doubtful_percentage').value;
    const doubtful_liability_account = this.provisionDoubtfulForm.get('doubtful_liability_account').value;
    const doubtful_expense_account = this.provisionDoubtfulForm.get('doubtful_expense_account').value;
    const doubtful_object = {id: this.loanProvisioningTemplate.definitions[2].id, categoryId: 3, categoryName: 'DOUBTFUL', minAge: doubtful_min_age, maxAge: doubtful_max_age,
                            provisioningPercentage: doubtful_percentage, liabilityAccount: doubtful_liability_account,
                            liabilityCode: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === doubtful_liability_account))[0].glCode,
                            liabilityName: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === doubtful_liability_account))[0].name, expenseAccount: doubtful_expense_account,
                            expenseCode: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === doubtful_expense_account))[0].glCode,
                            expenseName: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === doubtful_expense_account))[0].name};

    const loss_min_age = this.provisionLossForm.get('loss_min_age').value;
    const loss_max_age = this.provisionLossForm.get('loss_max_age').value;
    const loss_percentage = this.provisionLossForm.get('loss_percentage').value;
    const loss_liability_account = this.provisionLossForm.get('loss_liability_account').value;
    const loss_expense_account = this.provisionLossForm.get('loss_expense_account').value;
    const loss_object = {id: this.loanProvisioningTemplate.definitions[3].id, categoryId: 4, categoryName: 'LOSS', minAge: loss_min_age, maxAge: loss_max_age,
                        provisioningPercentage: loss_percentage, liabilityAccount: loss_liability_account,
                        liabilityCode: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === loss_liability_account))[0].glCode,
                        liabilityName: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === loss_liability_account))[0].name,
                        expenseAccount: loss_expense_account, expenseCode: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === loss_expense_account))[0].glCode,
                        expenseName: (this.loanProvisioningTemplate.glAccounts.filter((x: any) => x.id === loss_expense_account))[0].name};

    const product_array: any = [];
    /**
     * Get selected products.
     */
    for (let i = 0; i < products.length; i++) {
      let object: any;
      if (this.loanProvisioningTemplate.selectedLoanProducts.some((x: any) => x.id === products[i].id)) {
      object = products[i];
      } else {
      object = (this.loanProvisioningTemplate.loanProducts.filter((x: any) => x.id === products[i].id))[0];
      }
      product_array.push(object);
    }

    /**
     * Get definitions.
     */
    const definitions_array: any = [];
    definitions_array.push(standard_object);
    definitions_array.push(sub_standard_object);
    definitions_array.push(doubtful_object);
    definitions_array.push(loss_object);

    const formData = {locale: 'en', criteriaId: this.loanProvisioningTemplate.criteriaId, criteriaName: provisionCriteria, loanProducts: product_array, definitions: definitions_array};
    this.organizationService.updateProvisioningCriteria(this.loanProvisioningTemplate.criteriaId, formData).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }


  /**
   * Get Seelcted Product.
   */

  getSelectedProduct() {
    const selectedProduct = this.provisionProductForm.get('products').value;
    this.selectedProducts.push((this.loanProvisioningTemplate.loanProducts.filter((x: any) => x.id === selectedProduct[0]))[0]);
    this.refusalProducts = this.refusalProducts.filter((prod: any) => prod.id !== selectedProduct);
    this.provisionProductForm.patchValue({'products': null});
  }

  /**
   * Remove Selected Products.
   */

  removeSelectedProduct() {
    const removingProduct = this.provisionProductForm.get('selectedProducts').value;
    this.selectedProducts = this.selectedProducts.filter((x: any) => x.id !== removingProduct[0]);
    this.refusalProducts.push((this.loanProvisioningTemplate.loanProducts.filter((x: any) => x.id === removingProduct[0]))[0]);
    this.provisionProductForm.patchValue({'selectedProducts': null});
  }

}
