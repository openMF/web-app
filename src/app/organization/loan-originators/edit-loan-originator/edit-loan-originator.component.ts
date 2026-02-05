/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CodeValue } from 'app/shared/models/general.model';
import { LoanOriginator } from 'app/loans/models/loan-account.model';

/**
 * Create Loan Originator component.
 */
@Component({
  selector: 'mifosx-edit-loan-originator',
  templateUrl: './edit-loan-originator.component.html',
  styleUrl: './edit-loan-originator.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class EditLoanOriginatorComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private organizationService = inject(OrganizationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Loan Originator form. */
  loanOriginatorForm: UntypedFormGroup;
  /** Form data. */
  loanOriginatorsData: LoanOriginator;
  loanOriginatorsTemplateData: any;
  statusOptions: string[] = [];
  originatorTypeOptions: CodeValue[] = [];
  channelTypeOptions: CodeValue[] = [];

  /* Reference of Loan Originator form */
  @ViewChild('editLoanOriginatorFormRef') editLoanOriginatorFormRef: ElementRef<any>;
  /* Template for popover on Loan Originator form */
  @ViewChild('templateCreateLoanOriginatorForm') templateCreateLoanOriginatorForm: TemplateRef<any>;

  constructor() {
    this.route.data.subscribe((data: { loanOriginatorData: LoanOriginator; loanOriginatorsTemplateData: any }) => {
      this.loanOriginatorsData = data.loanOriginatorData;
      this.loanOriginatorsTemplateData = data.loanOriginatorsTemplateData;
      this.statusOptions = data.loanOriginatorsTemplateData.statusOptions;
      this.originatorTypeOptions = data.loanOriginatorsTemplateData.originatorTypeOptions;
      this.channelTypeOptions = data.loanOriginatorsTemplateData.channelTypeOptions;
    });
  }

  /**
   * Creates the Loan Originator form.
   */
  ngOnInit() {
    this.createLoanOriginatorForm();
  }

  /**
   * Creates the Loan Originator form.
   */
  createLoanOriginatorForm() {
    this.loanOriginatorForm = this.formBuilder.group({
      externalId: [
        {
          value: this.loanOriginatorsTemplateData.externalId,
          disabled: true
        }
      ],
      name: [
        this.loanOriginatorsData.name,
        [
          Validators.required,
          Validators.pattern('^[A-Za-z].*')
        ]
      ],
      status: [
        this.loanOriginatorsData.status,
        Validators.required
      ],
      originatorTypeId: [
        this.loanOriginatorsData.originatorType.id
      ],
      channelTypeId: [
        this.loanOriginatorsData.channelType.id
      ]
    });
  }

  /**
   * Submits the Loan Originator form and creates Loan Originator,
   * if successful redirects to Loan Originators.
   */
  submit() {
    const loanOriginatorFormData = this.loanOriginatorForm.value;
    delete loanOriginatorFormData.externalId;
    const data = {
      ...loanOriginatorFormData
    };
    this.organizationService.updateLoanOriginator(this.loanOriginatorsData.id, data).subscribe((response: any) => {
      this.router.navigate(['../..'], { relativeTo: this.route });
    });
  }
}
