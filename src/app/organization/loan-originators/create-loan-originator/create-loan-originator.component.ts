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

/**
 * Create Loan Originator component.
 */
@Component({
  selector: 'mifosx-create-loan-originator',
  templateUrl: './create-loan-originator.component.html',
  styleUrl: './create-loan-originator.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class CreateLoanOriginatorComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private organizationService = inject(OrganizationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Loan Originator form. */
  loanOriginatorForm: UntypedFormGroup;
  /** Form data. */
  loanOriginatorsTemplateData: any;
  statusOptions: string[] = [];
  originatorTypeOptions: CodeValue[] = [];
  channelTypeOptions: CodeValue[] = [];

  /* Reference of Loan Originator form */
  @ViewChild('createLoanOriginatorFormRef') createLoanOriginatorFormRef: ElementRef<any>;
  /* Template for popover on Loan Originator form */
  @ViewChild('templateCreateLoanOriginatorForm') templateCreateLoanOriginatorForm: TemplateRef<any>;

  constructor() {
    this.route.data.subscribe((data: { loanOriginatorsTemplateData: any }) => {
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
        this.loanOriginatorsTemplateData.externalId,
        Validators.required
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.pattern('(^[A-z]).*')
        ]
      ],
      status: [
        '',
        Validators.required
      ],
      originatorTypeId: [
        ''
      ],
      channelTypeId: [
        ''
      ]
    });
  }

  /**
   * Submits the Loan Originator form and creates Loan Originator,
   * if successful redirects to Loan Originators.
   */
  submit() {
    const loanOriginatorFormData = this.loanOriginatorForm.value;
    const data = {
      ...loanOriginatorFormData
    };
    this.organizationService.createLoanOriginator(data).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
