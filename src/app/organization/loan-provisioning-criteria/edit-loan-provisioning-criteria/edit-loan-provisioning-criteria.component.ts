/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FindPipe } from '../../../pipes/find.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TranslateService } from '@ngx-translate/core';

/**
 * Edit Loan Provisioning Criteria Component.
 */
@Component({
  selector: 'mifosx-edit-loan-provisioning-criteria',
  templateUrl: './edit-loan-provisioning-criteria.component.html',
  styleUrls: ['./edit-loan-provisioning-criteria.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatHint,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    FaIconComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    FindPipe
  ]
})
export class EditLoanProvisioningCriteriaComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);
  private settingsService = inject(SettingsService);
  dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private translateService = inject(TranslateService);

  /** Loan Provisioning Criteria form. */
  provisioningCriteriaForm: UntypedFormGroup;
  /** Loan Provisioning Criteria Template */
  loanProvisioningCriteriaAndTemplate: any;
  /** Liability Accounts */
  liabilityAccounts: any;
  /** Expense Accounts */
  expenseAccounts: any;
  /** Loan Products */
  loanProducts: any;

  /** Columns to be displayed in definitions table. */
  displayedColumns: string[] = [
    'category',
    'minAge',
    'maxAge',
    'percentage',
    'liabilityAccount',
    'expenseAccount',
    'edit'
  ];
  /** Criteria Definitions Array */
  definitions: {
    categoryId: number;
    categoryName: string;
    maxAge?: number;
    minAge?: number;
    liabilityAccount?: string;
    expenseAccount?: string;
    provisioningPercentage?: number;
  }[] = [];

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor() {
    this.route.data.subscribe((data: { loanProvisioningCriteriaAndTemplate: any }) => {
      this.loanProvisioningCriteriaAndTemplate = data.loanProvisioningCriteriaAndTemplate;
      this.definitions = this.loanProvisioningCriteriaAndTemplate.definitions;
      this.loanProducts = this.loanProvisioningCriteriaAndTemplate.loanProducts.concat(
        this.loanProvisioningCriteriaAndTemplate.selectedLoanProducts
      );
      this.liabilityAccounts = this.loanProvisioningCriteriaAndTemplate.glAccounts.filter(
        (account: any) => account.type.value === 'LIABILITY'
      );
      this.expenseAccounts = this.loanProvisioningCriteriaAndTemplate.glAccounts.filter(
        (account: any) => account.type.value === 'EXPENSE'
      );
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
      criteriaName: [
        this.loanProvisioningCriteriaAndTemplate.criteriaName,
        Validators.required
      ],
      loanProducts: [this.loanProvisioningCriteriaAndTemplate.selectedLoanProducts]
    });
  }

  /**
   * Compare function for mat-select.
   * Useful in patching values if value is an object.
   * @param {any} option1 option 1
   * @param {any} option2 option 2.
   */
  compareOptions(option1: any, option2: any) {
    return option1 && option2 && option1.id === option2.id;
  }

  /**
   * Edit Definition
   * @param {any} definition Definition
   * @param {number} index Definition index
   */
  editDefinition(definition: any) {
    const data = {
      title: this.translateService.instant('labels.buttons.Edit Criteria Definition'),
      formfields: this.getDefinitionFormFields(definition),
      layout: { addButtonText: 'Confirm' }
    };
    const editDefinitionDialogRef = this.dialog.open(FormDialogComponent, { data });
    editDefinitionDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const definitionData = {
          ...definition,
          ...response.data.value
        };
        this.definitions.splice(this.definitions.indexOf(definition), 1, definitionData);
        this.definitions = this.definitions.concat([]);
      }
    });
  }

  /**
   * Gets formfields for form dialog.
   * @param {any} definition Definition
   */
  getDefinitionFormFields(definition: any) {
    const formfields: FormfieldBase[] = [];
    formfields.push(
      new InputBase({
        controlName: 'minAge',
        label: this.translateService.instant('labels.inputs.Min Age'),
        value: definition ? definition.minAge : '',
        type: 'number',
        required: true,
        order: 1
      })
    );
    formfields.push(
      new InputBase({
        controlName: 'maxAge',
        label: this.translateService.instant('labels.inputs.Max Age'),
        value: definition ? definition.maxAge : '',
        type: 'number',
        required: true,
        order: 2
      })
    );
    formfields.push(
      new InputBase({
        controlName: 'provisioningPercentage',
        label: this.translateService.instant('labels.inputs.Percentage') + ' (%)',
        value: definition ? definition.provisioningPercentage : '',
        type: 'number',
        required: true,
        order: 3
      })
    );
    formfields.push(
      new SelectBase({
        controlName: 'liabilityAccount',
        label: this.translateService.instant('labels.inputs.Liability Account'),
        value: definition ? definition.liabilityAccount : '',
        options: { label: 'name', value: 'id', data: this.liabilityAccounts },
        required: true,
        order: 4
      })
    );
    formfields.push(
      new SelectBase({
        controlName: 'expenseAccount',
        label: this.translateService.instant('labels.inputs.Expense Account'),
        value: definition ? definition.expenseAccount : '',
        options: { label: 'name', value: 'id', data: this.expenseAccounts },
        required: true,
        order: 5
      })
    );
    return formfields;
  }

  /**
   * Returns validity of form.
   */
  get provisioningCriteriaFormValid() {
    return this.provisioningCriteriaForm.valid;
  }

  /**
   * Edits the loan provisioning criteria.
   */
  submit() {
    const locale = this.settingsService.language.code;
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
    this.organizationService
      .updateProvisioningCriteria(this.loanProvisioningCriteriaAndTemplate.criteriaId, loanProvisioningCriteria)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
