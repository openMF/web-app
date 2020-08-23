/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Create Loan Provisioning Criteria Component.
 */
@Component({
  selector: 'mifosx-create-loan-provisioning-criteria',
  templateUrl: './create-loan-provisioning-criteria.component.html',
  styleUrls: ['./create-loan-provisioning-criteria.component.scss']
})
export class CreateLoanProvisioningCriteriaComponent implements OnInit {

  /** Loan Provisioning Criteria form. */
  provisioningCriteriaForm: FormGroup;
  /** Loan Provisioning Criteria Template */
  loanProvisioningCriteriaTemplate: any;
  /** Liability Accounts */
  liabilityAccounts: any;
  /** Expense Accounts */
  expenseAccounts: any;

  /** Columns to be displayed in definitions table. */
  displayedColumns: string[] = ['category', 'minAge', 'maxAge', 'percentage', 'liabilityAccount', 'expenseAccount', 'edit'];
  /** Criteria Definitions Array */
  definitions: {
    categoryId: number,
    categoryName: string,
    maxAge?: number,
    minAge?: number,
    liabilityAccount?: string,
    expenseAccount?: string,
    provisioningPercentage?: number
  }[] = [];
  /** Checks Definitons Table Validity */
  isDefinitionValid: any = {};

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private router: Router,
              public dialog: MatDialog,
              private route: ActivatedRoute) {
     this.route.data.subscribe((data: { loanProvisioningCriteriaTemplate: any }) => {
      this.loanProvisioningCriteriaTemplate = data.loanProvisioningCriteriaTemplate;
      this.definitions = this.loanProvisioningCriteriaTemplate.definitions;
      this.liabilityAccounts = this.loanProvisioningCriteriaTemplate.glAccounts.filter((account: any) => account.type.value === 'LIABILITY');
      this.expenseAccounts = this.loanProvisioningCriteriaTemplate.glAccounts.filter((account: any) => account.type.value === 'EXPENSE');
     });
  }

  ngOnInit() {
    this.createProvisioningCriteriaForm();
  }

  /**
   * Creates the provisioning criteria form
   */
  createProvisioningCriteriaForm() {
    this.provisioningCriteriaForm = this.formBuilder.group({
      'criteriaName': ['', Validators.required],
      'loanProducts': ['']
    });
  }

  /**
   * Edit Definition
   * @param {any} definition Definition
   * @param {number} index Definition index
   */
  editDefinition(definition: any) {
    const data = {
      title: 'Edit Criteria Definition',
      formfields: this.getDefinitionFormFields(definition),
      layout: { addButtonText: 'Confirm' }
    };
    const editDefinitionDialogRef = this.dialog.open(FormDialogComponent, { data });
    editDefinitionDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const definitionData = {
          ...response.data.value,
          categoryName: definition.categoryName,
          categoryId: definition.categoryId
        };
        this.definitions.splice(this.definitions.indexOf(definition), 1, definitionData);
        this.definitions = this.definitions.concat([]);
        this.isDefinitionValid[definition.categoryName] = true;
      }
    });
  }

  /**
   * Gets formfields for form dialog.
   * @param {any} definition Definition
   */
  getDefinitionFormFields(definition: any) {
    const formfields: FormfieldBase[] = [];
    formfields.push(new InputBase({
      controlName: 'minAge',
      label: 'Min Age',
      value: definition ? definition.minAge : '',
      type: 'number',
      required: true,
      order: 1
    }));
    formfields.push(new InputBase({
      controlName: 'maxAge',
      label: 'Max Age',
      value: definition ? definition.maxAge : '',
      type: 'number',
      required: true,
      order: 2
    }));
    formfields.push(new InputBase({
      controlName: 'provisioningPercentage',
      label: 'Percentage (%)',
      value: definition ? definition.provisioningPercentage : '',
      type: 'number',
      required: true,
      order: 3
    }));
    formfields.push(new SelectBase({
      controlName: 'liabilityAccount',
      label: 'Liability Account',
      value: definition ? definition.liabilityAccount : '',
      options: { label: 'name', value: 'id', data: this.liabilityAccounts },
      required: true,
      order: 4
    }));
    formfields.push(new SelectBase({
      controlName: 'expenseAccount',
      label: 'Expense Account',
      value: definition ? definition.expenseAccount : '',
      options: { label: 'name', value: 'id', data: this.expenseAccounts },
      required: true,
      order: 5
    }));
    return formfields;
  }

  /**
   * Returns validity of form and table.
   */
  get provisioningCriteriaFormValid() {
    const definitionsValid: boolean = Object.entries(this.isDefinitionValid).length === this.definitions.length ? true : false;
    return this.provisioningCriteriaForm.valid && definitionsValid;
  }

  /**
   * Creates a loan provisioning criteria.
   */
  submit() {
    const locale = 'en';
    const loanProvisioningCriteria = {
      ...this.provisioningCriteriaForm.value,
      loanProducts: this.provisioningCriteriaForm.get('loanProducts').value.map((product: any) => ({
        id: product.id,
        name: product.name,
        includeInBorrowerCycle: product.includeInBorrowerCycle
      })),
      definitions: this.definitions,
      locale
    };
    this.organizationService.createProvisioningCriteria(loanProvisioningCriteria).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
